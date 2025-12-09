// --- Retro Initiative Tracker Types ---
export type EntityType = 'player' | 'monster';
export type Status = 'poisoned' | 'stunned' | 'bleed';
export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  maxHP: number;
  currentHP: number;
  initiative: number;
  statuses: Status[];
  isDead: boolean;
}
export interface CombatState {
  id: string;
  name: string;
  entities: Entity[];
  activeIndex: number;
  round: number;
  createdAt?: string;
}
export type AddEntityRequest = Omit<Entity, 'id' | 'isDead' | 'statuses'>;
export type UpdateEntityRequest = Partial<Omit<Entity, 'id'>>;