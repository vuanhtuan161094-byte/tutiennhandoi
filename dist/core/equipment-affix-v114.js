/** 2026-09-27: retire the universal five-element equipment affix lane; preserve all non-element affixes. */
import * as legacy from './equipment-affix-v114-legacy.js';
export * from './equipment-affix-v114-legacy.js';

export const EQUIPMENT_AFFIX_DEFINITIONS_V114 = Object.freeze(legacy.EQUIPMENT_AFFIX_DEFINITIONS_V114.filter(def => def.family !== 'element'));
const LIVE_BY_ID = new Map(EQUIPMENT_AFFIX_DEFINITIONS_V114.map(def => [def.id, def]));
const nonElementRoll = roll => roll && roll.family !== 'element' && !String(roll.id ?? '').startsWith('affix.element.');
const assertNonElementMutation = (roll, targetFamily) => {
  if (!nonElementRoll(roll) || String(targetFamily ?? '') === 'element') {
    throw new Error('Affix Ngũ Hành đã retire; dữ liệu legacy chỉ được đọc và không thể Tái Luyện/Tinh Luyện.');
  }
};
export function equipmentAffixDefinitionV114(id) { return LIVE_BY_ID.get(String(id ?? '')); }
export function equipmentAffixNameV114(id) { return LIVE_BY_ID.get(String(id ?? ''))?.name ?? String(id ?? ''); }
export function isBuildAffixFamilyV114(family) { return ['dao', 'rootOrigin', 'skill', 'mechanic'].includes(String(family ?? '')); }
export function formatEquipmentAffixV114(roll) {
  if (!nonElementRoll(roll)) return 'NGŨ HÀNH LEGACY · KHÔNG HIỆU LỰC';
  return legacy.formatEquipmentAffixV114(roll);
}
export function validateEquipmentAffixesV114(affixes, daoInscription, maxBuildAffixes = legacy.EQUIPMENT_MAX_BUILD_AFFIXES_V114) {
  return legacy.validateEquipmentAffixesV114((affixes ?? []).filter(nonElementRoll), daoInscription, maxBuildAffixes);
}
export function rollEquipmentAffixesV114(template, grade, seed, legacyTraitIds = [], maxBuildAffixes = legacy.EQUIPMENT_MAX_BUILD_AFFIXES_V114) {
  const target = Math.max(0, legacy.equipmentAffixCountV114(grade) ?? 0);
  const out = [], groups = new Set();
  const cleanTraits = (legacyTraitIds ?? []).filter(id => !String(id).startsWith('trait.element.'));
  for (let attempt = 0; attempt < 24 && out.length < target; attempt++) {
    const attemptSeed = ((Number(seed) || 0) + Math.imul(attempt, 0x9e3779b1)) >>> 0;
    const rolls = legacy.rollEquipmentAffixesV114(template, grade, attemptSeed, cleanTraits, maxBuildAffixes);
    for (const roll of rolls) {
      if (!nonElementRoll(roll) || groups.has(roll.exclusiveGroup)) continue;
      out.push({ ...roll }); groups.add(roll.exclusiveGroup);
      if (out.length >= target) break;
    }
  }
  legacy.validateEquipmentAffixesV114(out, undefined, maxBuildAffixes);
  return out;
}
export function reforgeEquipmentAffixV114(item, index, seed, options = {}) {
  const roll = item?.affixes?.[index];
  assertNonElementMutation(roll, options?.targetFamily);
  return legacy.reforgeEquipmentAffixV114(item, index, seed, options);
}
export function equipmentAffixPowerV114(item, enhancementBonusPct) {
  const clean = { ...item, affixes: (item?.affixes ?? []).filter(nonElementRoll) };
  const power = legacy.equipmentAffixPowerV114(clean, enhancementBonusPct);
  return { ...power, elementalAffinities: {}, elementalResistancesPct: {} };
}
