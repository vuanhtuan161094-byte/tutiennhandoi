/** 2026-09-27 compatibility facade: equipment no longer creates or contributes the retired global five-element/Set axis. */
import * as legacy from './equipment-legacy-pre-nguhanh-retirement.js';
import { boundedStatCapV129, combineStatPctV129 } from './combat-rules.js';
import { EQUIPMENT_V142_SCHEMA, equipmentBaseStatsForRankV142 } from './equipment-v142.js';
export * from './equipment-legacy-pre-nguhanh-retirement.js';

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value ?? {}, key);
const isRetiredElementTrait = id => String(id ?? '').startsWith('trait.element.');
const isRetiredElementAffix = roll => roll?.family === 'element' || String(roll?.id ?? '').startsWith('affix.element.');
const isRetiredEquipmentTag = tag => String(tag ?? '').startsWith('EquipmentElement:') || String(tag ?? '').startsWith('EquipmentGem:') || String(tag ?? '').startsWith('SetV142:');

function stripRetiredElementStats(stats) {
  const next = structuredClone(stats ?? {});
  delete next.elementalAffinities;
  delete next.elementalResistancesPct;
  return next;
}
function removeStoredSetResonance(stats, bonus) {
  const next = stripRetiredElementStats(stats);
  for (const [key, value] of Object.entries(bonus ?? {})) {
    if (typeof value !== 'number' || !Number.isFinite(value) || typeof next[key] !== 'number') continue;
    next[key] = Math.max(0, next[key] - value);
  }
  return next;
}
function powerStatsWithoutRetiredSet(item) {
  if (item?.schema === EQUIPMENT_V142_SCHEMA) {
    try { return equipmentBaseStatsForRankV142(item.slot, item.equipmentRankIndex ?? 0); }
    catch { /* malformed legacy item: fall through to subtraction path */ }
  }
  return removeStoredSetResonance(item?.stats, item?.setResonanceBonusStatsV143);
}
function sanitizedPowerItem(item) {
  return {
    ...item,
    setId: undefined,
    traitIds: (item?.traitIds ?? []).filter(id => !isRetiredElementTrait(id)),
    affixes: (item?.affixes ?? []).filter(roll => !isRetiredElementAffix(roll)),
    gemSockets: [],
    stats: powerStatsWithoutRetiredSet(item),
    tags: (item?.tags ?? []).filter(tag => !isRetiredEquipmentTag(tag)),
  };
}
function sanitizedNewItem(item) {
  const next = sanitizedPowerItem(item);
  delete next.setId;
  delete next.setResonanceLevelV143;
  delete next.setResonanceBonusStatsV143;
  return next;
}
function stateWithoutRetiredAxes(state) {
  return { ...state, items: (state?.items ?? []).map(sanitizedPowerItem) };
}
function compatibilitySnapshot(item) {
  const stats = item?.stats ?? {};
  return {
    hasSetId: hasOwn(item, 'setId'), setId: item?.setId,
    hasGemSockets: hasOwn(item, 'gemSockets'), gemSockets: structuredClone(item?.gemSockets ?? []),
    elementTraits: (item?.traitIds ?? []).filter(isRetiredElementTrait),
    elementAffixes: (item?.affixes ?? []).filter(isRetiredElementAffix).map(roll => ({ ...roll })),
    hasElementalAffinities: hasOwn(stats, 'elementalAffinities'), elementalAffinities: structuredClone(stats.elementalAffinities),
    hasElementalResistances: hasOwn(stats, 'elementalResistancesPct'), elementalResistancesPct: structuredClone(stats.elementalResistancesPct),
  };
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
export function effectiveEquipmentStats(item) {
  return legacy.effectiveEquipmentStats(sanitizedPowerItem(item));
}
export function normalizeEquipmentStateV98(state, templates) {
  const unlockedSetIds = [...(state?.unlockedSetIds ?? [])];
  const snapshots = new Map((state?.items ?? []).map(item => [item.id, compatibilitySnapshot(item)]));
  const normalized = legacy.normalizeEquipmentStateV98(state, templates);
  for (const item of normalized?.items ?? []) {
    const snapshot = snapshots.get(item.id);
    if (!snapshot) continue;
    if (snapshot.hasSetId) item.setId = snapshot.setId;
    if (snapshot.hasGemSockets) item.gemSockets = structuredClone(snapshot.gemSockets);
    item.traitIds = [...(item.traitIds ?? []).filter(id => !isRetiredElementTrait(id)), ...snapshot.elementTraits];
    item.affixes = [...(item.affixes ?? []).filter(roll => !isRetiredElementAffix(roll)), ...snapshot.elementAffixes.map(roll => ({ ...roll }))];
    item.stats = item.stats && typeof item.stats === 'object' ? item.stats : {};
    if (snapshot.hasElementalAffinities) item.stats.elementalAffinities = structuredClone(snapshot.elementalAffinities);
    if (snapshot.hasElementalResistances) item.stats.elementalResistancesPct = structuredClone(snapshot.elementalResistancesPct);
  }
  normalized.unlockedSetIds = unlockedSetIds;
  return normalized;
}
export function equipmentPower(state, _sets) {
  const power = legacy.equipmentPower(stateWithoutRetiredAxes(state), new Map());
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
