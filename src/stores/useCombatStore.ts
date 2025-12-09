import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { immer } from 'zustand/middleware/immer';
import type { CombatState, Entity, AddEntityRequest, UpdateEntityRequest } from '@shared/types';
import { MOCK_COMBATS } from '@shared/mock-data';
// Helper function to sort entities based on initiative, type, and name
const sortEntities = (a: Entity, b: Entity) => {
  if (a.initiative !== b.initiative) {
    return b.initiative - a.initiative;
  }
  if (a.type !== b.type) {
    return a.type === 'player' ? -1 : 1;
  }
  return a.name.localeCompare(b.name);
};
interface CombatStoreState {
  encounters: Record<string, CombatState>;
}
interface CombatStoreActions {
  createCombat: (name: string) => CombatState;
  getCombat: (id: string) => CombatState | undefined;
  getAllEncounters: () => CombatState[];
  addEntity: (combatId: string, entityData: AddEntityRequest) => CombatState | undefined;
  updateEntity: (combatId: string, entityId: string, updates: UpdateEntityRequest) => CombatState | undefined;
  deleteEntity: (combatId: string, entityId: string) => CombatState | undefined;
  nextTurn: (combatId: string) => CombatState | undefined;
  resetCombat: (combatId: string) => CombatState | undefined;
  importCombat: (combatData: CombatState) => CombatState;
}
export const useCombatStore = create<CombatStoreState & CombatStoreActions>()(
  persist(
    immer((set, get) => ({
      encounters: {},
      createCombat: (name) => {
        const newCombat: CombatState = {
          id: uuid(),
          name,
          entities: [],
          activeIndex: 0,
          round: 1,
          createdAt: new Date().toISOString(),
        };
        set((state) => {
          state.encounters[newCombat.id] = newCombat;
        });
        return newCombat;
      },
      getCombat: (id) => {
        const state = get();
        if (id === 'demo' && !state.encounters.demo) {
          return MOCK_COMBATS.demo;
        }
        return state.encounters[id];
      },
      getAllEncounters: () => {
        return Object.values(get().encounters);
      },
      addEntity: (combatId, entityData) => {
        let updatedCombat: CombatState | undefined;
        set((state) => {
          const combat = state.encounters[combatId];
          if (combat) {
            const newEntity: Entity = {
              ...entityData,
              id: uuid(),
              statuses: [],
              isDead: false,
            };
            combat.entities.push(newEntity);
            combat.entities.sort(sortEntities);
            updatedCombat = combat;
          }
        });
        return updatedCombat;
      },
      updateEntity: (combatId, entityId, updates) => {
        let updatedCombat: CombatState | undefined;
        set((state) => {
          const combat = state.encounters[combatId];
          if (combat) {
            const entityIndex = combat.entities.findIndex((e) => e.id === entityId);
            if (entityIndex > -1) {
              const originalEntity = combat.entities[entityIndex];
              const updatedEntity = { ...originalEntity, ...updates };
              if (updates.currentHP !== undefined) {
                updatedEntity.currentHP = Math.max(0, Math.min(updatedEntity.maxHP, updates.currentHP));
              }
              updatedEntity.isDead = updatedEntity.currentHP <= 0;
              combat.entities[entityIndex] = updatedEntity;
              if (updates.initiative !== undefined) {
                combat.entities.sort(sortEntities);
              }
            }
            updatedCombat = combat;
          }
        });
        return updatedCombat;
      },
      deleteEntity: (combatId, entityId) => {
        let updatedCombat: CombatState | undefined;
        set((state) => {
          const combat = state.encounters[combatId];
          if (combat) {
            combat.entities = combat.entities.filter((e) => e.id !== entityId);
            updatedCombat = combat;
          }
        });
        return updatedCombat;
      },
      nextTurn: (combatId) => {
        let updatedCombat: CombatState | undefined;
        set((state) => {
          const combat = state.encounters[combatId];
          if (combat && combat.entities.length > 0) {
            const livingEntities = combat.entities.filter(e => !e.isDead);
            if (livingEntities.length === 0) return;
            let nextIndex = (combat.activeIndex + 1) % combat.entities.length;
            if (nextIndex === 0) {
              combat.round += 1;
            }
            combat.activeIndex = nextIndex;
            updatedCombat = combat;
          }
        });
        return updatedCombat;
      },
      resetCombat: (combatId) => {
        let updatedCombat: CombatState | undefined;
        set((state) => {
          const combat = state.encounters[combatId];
          if (combat) {
            combat.entities.forEach(entity => {
              entity.currentHP = entity.maxHP;
              entity.isDead = false;
              entity.statuses = [];
            });
            combat.activeIndex = 0;
            combat.round = 1;
            updatedCombat = combat;
          }
        });
        return updatedCombat;
      },
      importCombat: (combatData) => {
        set((state) => {
          state.encounters[combatData.id] = combatData;
        });
        return combatData;
      },
    })),
    {
      name: 'retro-init-tracker-storage',
    }
  )
);