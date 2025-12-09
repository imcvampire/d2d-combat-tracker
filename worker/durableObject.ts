import { DurableObject } from "cloudflare:workers";
import type { DemoItem, CombatState, Entity, AddEntityRequest, UpdateEntityRequest } from '@shared/types';
import { MOCK_COMBATS } from '@shared/mock-data';
import { v4 as uuid } from 'uuid';
const sortEntities = (entities: Entity[]): Entity[] => {
  return entities.sort((a, b) => {
    if (a.isDead !== b.isDead) {
      return a.isDead ? 1 : -1;
    }
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative;
    }
    if (a.type !== b.type) {
      return a.type === 'player' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
};
// **DO NOT MODIFY THE CLASS NAME**
export class GlobalDurableObject extends DurableObject {
    // --- COMBAT TRACKER METHODS ---
    async createCombat(name: string): Promise<CombatState> {
      const id = uuid().slice(0, 8);
      const newState: CombatState = {
        id,
        name,
        entities: [],
        activeIndex: 0,
        round: 1,
        createdAt: new Date().toISOString(),
      };
      await this.ctx.storage.put(`combat_${id}`, newState);
      return newState;
    }
    async getCombat(id: string): Promise<CombatState | undefined> {
      let state = await this.ctx.storage.get<CombatState>(`combat_${id}`);
      if (!state && id === 'demo') {
        const demoState = MOCK_COMBATS.demo;
        if (!demoState.createdAt) {
          demoState.createdAt = new Date().toISOString();
        }
        await this.ctx.storage.put(`combat_demo`, demoState);
        return demoState;
      }
      if (state) {
        state.entities = sortEntities(state.entities);
      }
      return state;
    }
    async addEntity(combatId: string, entityData: AddEntityRequest): Promise<CombatState> {
      const state = await this.getCombat(combatId);
      if (!state) throw new Error("Combat not found");
      const newEntity: Entity = {
        ...entityData,
        id: uuid(),
        isDead: entityData.currentHP <= 0,
        statuses: [],
      };
      state.entities.push(newEntity);
      state.entities = sortEntities(state.entities);
      await this.ctx.storage.put(`combat_${combatId}`, state);
      return state;
    }
    async updateEntity(combatId: string, entityId: string, updates: UpdateEntityRequest): Promise<CombatState> {
      const state = await this.getCombat(combatId);
      if (!state) throw new Error("Combat not found");
      state.entities = state.entities.map(e => {
        if (e.id === entityId) {
          const updatedEntity = { ...e, ...updates };
          if (updates.currentHP !== undefined) {
            updatedEntity.currentHP = Math.max(0, Math.min(updatedEntity.maxHP, updatedEntity.currentHP));
            updatedEntity.isDead = updatedEntity.currentHP <= 0;
          }
          return updatedEntity;
        }
        return e;
      });
      state.entities = sortEntities(state.entities);
      await this.ctx.storage.put(`combat_${combatId}`, state);
      return state;
    }
    async deleteEntity(combatId: string, entityId: string): Promise<CombatState> {
      const state = await this.getCombat(combatId);
      if (!state) throw new Error("Combat not found");
      state.entities = state.entities.filter(e => e.id !== entityId);
      await this.ctx.storage.put(`combat_${combatId}`, state);
      return state;
    }
    async nextTurn(combatId: string): Promise<CombatState> {
      const state = await this.getCombat(combatId);
      if (!state) throw new Error("Combat not found");
      if (state.entities.length === 0) return state;
      const livingEntities = state.entities.filter(e => !e.isDead);
      if (livingEntities.length === 0) return state;
      let nextIndex = state.activeIndex;
      if (state.entities.length > 0) {
        nextIndex = (state.activeIndex + 1) % state.entities.length;
        let attempts = 0;
        while(state.entities[nextIndex].isDead && attempts < state.entities.length) {
          nextIndex = (nextIndex + 1) % state.entities.length;
          attempts++;
        }
      }
      if (nextIndex <= state.activeIndex && livingEntities.length > 0) {
        state.round += 1;
      }
      state.activeIndex = nextIndex;
      await this.ctx.storage.put(`combat_${combatId}`, state);
      return state;
    }
    async resetCombat(combatId: string): Promise<CombatState> {
      const state = await this.getCombat(combatId);
      if (!state) throw new Error("Combat not found");
      state.entities.forEach(e => {
        e.currentHP = e.maxHP;
        e.isDead = false;
        e.statuses = [];
      });
      state.activeIndex = 0;
      state.round = 1;
      state.entities = sortEntities(state.entities);
      await this.ctx.storage.put(`combat_${combatId}`, state);
      return state;
    }
    async importCombat(json: string): Promise<CombatState> {
      try {
        const data = JSON.parse(json) as Partial<CombatState>;
        if (!data.id || !data.name || !Array.isArray(data.entities)) {
          throw new Error('Invalid combat data structure.');
        }
        const validatedEntities = data.entities.map(e => ({
          ...e,
          isDead: e.currentHP <= 0,
          statuses: e.statuses || [],
        }));
        const validatedState: CombatState = {
          id: data.id,
          name: data.name,
          entities: sortEntities(validatedEntities),
          activeIndex: data.activeIndex ?? 0,
          round: data.round ?? 1,
          createdAt: data.createdAt || new Date().toISOString(),
        };
        await this.ctx.storage.put(`combat_${validatedState.id}`, validatedState);
        return validatedState;
      } catch (e) {
        console.error("Import failed:", e);
        throw new Error('Invalid JSON format or data.');
      }
    }
    // --- PRE-EXISTING DEMO METHODS ---
    async getCounterValue(): Promise<number> {
      const value = (await this.ctx.storage.get("counter_value")) || 0;
      return value as number;
    }
    async increment(amount = 1): Promise<number> {
      let value: number = (await this.ctx.storage.get("counter_value")) || 0;
      value += amount;
      await this.ctx.storage.put("counter_value", value);
      return value;
    }
    async decrement(amount = 1): Promise<number> {
      let value: number = (await this.ctx.storage.get("counter_value")) || 0;
      value -= amount;
      await this.ctx.storage.put("counter_value", value);
      return value;
    }
    async getDemoItems(): Promise<DemoItem[]> {
      const items = await this.ctx.storage.get<DemoItem[]>("demo_items");
      return items || [];
    }
    async addDemoItem(item: DemoItem): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = [...items, item];
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
    async updateDemoItem(id: string, updates: Partial<Omit<DemoItem, 'id'>>): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
    async deleteDemoItem(id: string): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = items.filter(item => item.id !== id);
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
}