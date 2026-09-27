/** 2026-09-27: legacy Set ids remain readable but no longer affect loot protection/disposition. */
import * as legacy from './inventory-pre-nguhanh-retirement.js';
export * from './inventory-pre-nguhanh-retirement.js';

function withoutSet(item, fn) {
  if (!item) return fn();
  const had = Object.prototype.hasOwnProperty.call(item, 'setId');
  const value = item.setId;
  delete item.setId;
  try { return fn(); }
  finally { if (had) item.setId = value; }
}
export function explainEquipmentLoot(state, item) {
  return withoutSet(item, () => legacy.explainEquipmentLoot(state, item));
}
export function explainLootItem(state, itemId) {
  const equipment = state.equipment.items.find(item => item.id === itemId);
  return equipment ? explainEquipmentLoot(state, equipment) : legacy.explainLootItem(state, itemId);
}
export function processLootBatch(state, candidateEquipmentIds, candidateArtifactIds) {
  const ids = new Map((state.equipment?.items ?? []).map(item => [item.id, Object.prototype.hasOwnProperty.call(item, 'setId') ? item.setId : undefined]));
  for (const item of state.equipment?.items ?? []) delete item.setId;
  try { return legacy.processLootBatch(state, candidateEquipmentIds, candidateArtifactIds); }
  finally {
    for (const item of state.equipment?.items ?? []) if (ids.has(item.id) && ids.get(item.id) !== undefined) item.setId = ids.get(item.id);
  }
}
