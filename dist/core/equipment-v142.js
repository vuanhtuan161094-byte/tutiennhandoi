/**
 * 2026-09-27 V142 Set retirement facade.
 * Ranked equipment, fragments, enhancement, merge and affixes remain live.
 * Every Set/Tàn Ấn acquisition, engraving and power path is inert while legacy fields remain readable.
 */
import * as legacy from './equipment-v142-legacy.js';
export * from './equipment-v142-legacy.js';

const RETIRED_SET_METADATA_V142 = new Map((legacy.EQUIPMENT_SET_CATALOG_V142 ?? []).map(def => [
  def.id,
  Object.freeze({
    id: def.id,
    key: def.key,
    name: def.name,
    category: def.category,
    ...(def.element ? { element: def.element } : {}),
    bonuses: Object.freeze([]),
    retired: true,
  }),
]));

export const EQUIPMENT_SET_CATALOG_V142 = Object.freeze([]);
export function equipmentSetDefinitionV142(id) { return RETIRED_SET_METADATA_V142.get(String(id ?? '')); }
export function equipmentAttireSetForElementV142(_element) { return undefined; }
export function equipmentSetFragmentNameV142(setId) { return `Tàn Ấn legacy · ${String(setId ?? '')}`; }
export function equipmentProgressionSummaryV142(state) {
  const summary = legacy.equipmentProgressionSummaryV142(state);
  return { ...summary, setFragments: {} };
}
export function grantEquipmentSetFragmentsV142(_state, setId, _amount, source = 'unknown') {
  return { source, setId, amount: '0', balance: '0', ignored: true, retired: true };
}
export function rollElementSetFragmentFromHuntV142() { return undefined; }
export function engraveEquipmentSetV142() {
  throw new Error('Set trang bị đã retire; không thể Khắc Bộ mới.');
}
export function equipmentSetPowerV142(_equipmentState) {
  return { flatStats: {}, statMultipliers: {}, activeSets: [] };
}
export function mergeEquipmentRankV142(state, mainItemId, fodderItemAId, fodderItemBId) {
  const result = legacy.mergeEquipmentRankV142(state, mainItemId, fodderItemAId, fodderItemBId);
  if (result?.item) {
    result.item.name = `${result.item.equipmentRankName} · ${legacy.EQUIPMENT_SLOT_LABELS_V142[result.item.slot] ?? result.item.slot}`;
    result.item.tags = (result.item.tags ?? []).filter(tag => !String(tag).startsWith('SetV142:'));
  }
  return result;
}
export function dungeonEquipmentFragmentGrantV142(state, dungeonId, realmOrder, floor, firstClear, equipmentRollCount = 1) {
  const rank = legacy.equipmentRankIndexFromRealmOrderV142(realmOrder);
  const rolls = Math.max(0, Math.floor(Number(equipmentRollCount) || 0));
  const basePerRoll = BigInt(firstClear ? 12 : 4) * legacy.equipmentFragmentUnitForRealmV142(rank);
  const generic = legacy.grantEquipmentFragmentsV142(state, basePerRoll * BigInt(rolls), `dungeon:${dungeonId}`);
  return { generic, setGrants: [] };
}
