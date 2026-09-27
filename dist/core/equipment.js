/** 2026-09-27 compatibility facade: equipment no longer creates or contributes the retired global five-element/Set axis. */
import * as legacy from './equipment-legacy-pre-nguhanh-retirement.js';
import { boundedStatCapV129, combineStatPctV129 } from './combat-rules.js';
export * from './equipment-legacy-pre-nguhanh-retirement.js';

const isRetiredElementTrait = id => String(id ?? '').startsWith('trait.element.');
const isRetiredElementAffix = roll => roll?.family === 'element' || String(roll?.id ?? '').startsWith('affix.element.');
const isRetiredEquipmentTag = tag => String(tag ?? '').startsWith('EquipmentElement:') || String(tag ?? '').startsWith('EquipmentGem:') || String(tag ?? '').startsWith('SetV142:');
function sanitizedNewItem(item) {
  const next = { ...item };
  delete next.setId;
  next.traitIds = (next.traitIds ?? []).filter(id => !isRetiredElementTrait(id));
  next.affixes = (next.affixes ?? []).filter(roll => !isRetiredElementAffix(roll));
  next.gemSockets = [];
  next.tags = (next.tags ?? []).filter(tag => !isRetiredEquipmentTag(tag));
  return next;
}
function stateWithoutSets(state) {
  return { ...state, items: (state?.items ?? []).map(item => ({ ...item, setId: undefined })) };
}
export function rollEquipmentTraits(template, grade, seed) {
  return legacy.rollEquipmentTraits(template, grade, seed).filter(id => !isRetiredElementTrait(id));
}
export function buildEquipmentInstance(template, tier, quality, floor, source, acquiredWorldYear, forcedGrade) {
  return sanitizedNewItem(legacy.buildEquipmentInstance(template, tier, quality, floor, source, acquiredWorldYear, forcedGrade));
}
export function addEquipment(state, item) {
  return legacy.addEquipment(state, sanitizedNewItem(item));
}
export function equipmentPower(state, _sets) {
  const power = legacy.equipmentPower(stateWithoutSets(state), new Map());
  return {
    ...power,
    elementalAffinities: {}, elementalResistancesPct: {}, activeSets: [], activeSetMechanics: [],
    grantedTags: (power.grantedTags ?? []).filter(tag => !isRetiredEquipmentTag(tag)),
  };
}
export function applyEquipmentToEntity(base, state, sets) {
  const power = equipmentPower(state, sets);
  const stats = structuredClone(base?.stats ?? {});
  for (const key of Object.keys(stats)) {
    if (typeof stats[key] !== 'number') continue;
    const flat = power.flatStats[key] ?? 0;
    const multiplier = power.statMultipliers[key] ?? 0;
    stats[key] = boundedStatCapV129(key) !== undefined
      ? combineStatPctV129(key, stats[key] ?? 0, flat)
      : Math.max(0, ((stats[key] ?? 0) + flat) * (1 + multiplier));
  }
  for (const [key, flat] of Object.entries(power.flatStats)) {
    if (typeof flat !== 'number' || typeof stats[key] === 'number') continue;
    const multiplier = power.statMultipliers[key] ?? 0;
    stats[key] = boundedStatCapV129(key) !== undefined
      ? combineStatPctV129(key, 0, flat)
      : Math.max(0, flat * (1 + multiplier));
  }
  return {
    ...base,
    tags: [...new Set([...(base?.tags ?? []), ...power.grantedTags])],
    stats,
    triggers: [...(base?.triggers ?? []), ...power.triggers],
    combatBuildV117: { ...(base?.combatBuildV117 ?? {}), activeSetMechanics: [] },
  };
}
