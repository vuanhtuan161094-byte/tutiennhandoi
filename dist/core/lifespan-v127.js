import { reincarnationTreeRuntimeModifierV136 } from './reincarnation-progression-v1102.js';

export const DAO_SUY_LIFESPAN_BOUNDARY_ORDER_V127 = 46;

// Mortal-world lifespan curve. It is deliberately compressed around the authored V127 pacing:
// an ordinary fresh life can progress very far, but is expected to hit lifespan pressure before
// casually clearing the whole Độ Kiếp wall without reincarnation/lifespan investment.
const MORTAL_LIFESPAN_MAJOR_CAPS_V127 = [
  [0, 0, 100],
  [1, 9, 120],
  [10, 13, 200],
  [14, 17, 450],
  [18, 21, 900],
  [22, 25, 1600],
  [26, 29, 2800],
  [30, 33, 4400],
  [34, 37, 6800],
  [38, 41, 10000],
  [42, 45, 14500],
];

export function mortalLifespanBaseYearsV127(order) {
  const x = Math.max(0, Math.floor(Number(order) || 0));
  if (x >= DAO_SUY_LIFESPAN_BOUNDARY_ORDER_V127) return Number.POSITIVE_INFINITY;
  return MORTAL_LIFESPAN_MAJOR_CAPS_V127.find(([min,max]) => x >= min && x <= max)?.[2] ?? 14500;
}

export function mortalLifespanTreeBonusPctV127(origins = {}) {
  return Math.max(0, Math.min(50, reincarnationTreeRuntimeModifierV136(origins, 'cultivation.lifespanPct')));
}

export function effectiveMortalLifespanCapV127(realmOrder, origins = {}) {
  const order = Math.max(0, Math.floor(Number(realmOrder) || 0));
  if (order >= DAO_SUY_LIFESPAN_BOUNDARY_ORDER_V127) return Number.POSITIVE_INFINITY;
  const base = mortalLifespanBaseYearsV127(order);
  const boosted = base * (1 + mortalLifespanTreeBonusPctV127(origins) / 100);
  return Math.max(0, boosted);
}

export function lifespanStatusV127(state, origins = {}) {
  const order = Math.max(0, Math.floor(Number(state?.realm?.maxRealmOrder) || 0));
  if (order >= DAO_SUY_LIFESPAN_BOUNDARY_ORDER_V127) {
    return { schema: 'lifespan.v127', active: false, mode: 'daoSuy', baseYears: null, capYears: null, remainingYears: null, bonusPct: 0 };
  }
  const baseYears = mortalLifespanBaseYearsV127(order);
  const capYears = effectiveMortalLifespanCapV127(order, origins);
  return {
    schema: 'lifespan.v127', active: true, mode: 'lifespan', baseYears, capYears,
    remainingYears: Math.max(0, capYears - Math.max(0, Number(state?.ageYears) || 0)),
    bonusPct: mortalLifespanTreeBonusPctV127(origins),
  };
}
