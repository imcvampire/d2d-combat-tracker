import type { CombatState } from './types';
import { v4 as uuid } from 'uuid';
export const MOCK_COMBATS: Record<string, CombatState> = {
  'demo': {
    id: 'demo',
    name: 'Goblin Ambush',
    round: 1,
    entities: [
      {
        id: uuid(),
        name: 'Valerius',
        type: 'player',
        maxHP: 25,
        currentHP: 18,
        initiative: 18,
        statuses: [],
        isDead: false
      },
      {
        id: uuid(),
        name: 'Goblin Archer',
        type: 'monster',
        maxHP: 7,
        currentHP: 7,
        initiative: 16,
        statuses: [],
        isDead: false
      },
      {
        id: uuid(),
        name: 'Lyra',
        type: 'player',
        maxHP: 18,
        currentHP: 18,
        initiative: 14,
        statuses: [],
        isDead: false
      },
      {
        id: uuid(),
        name: 'Goblin Boss',
        type: 'monster',
        maxHP: 12,
        currentHP: 5,
        initiative: 9,
        statuses: ['bleed'],
        isDead: false
      },
    ],
    activeIndex: 0
  }
};