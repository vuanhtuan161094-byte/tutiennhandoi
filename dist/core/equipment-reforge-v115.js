/** 2026-09-27 retirement guard: legacy Ngũ Hành affixes remain readable but cannot be mutated or crafted. */
import * as legacy from './equipment-reforge-v115-legacy.js';
export * from './equipment-reforge-v115-legacy.js';

const isRetiredElementAffix = roll => roll?.family === 'element' || String(roll?.id ?? '').startsWith('affix.element.');
function assertActiveAffixMutation(item, index, targetFamily) {
  const roll = item?.affixes?.[index];
  if (isRetiredElementAffix(roll) || String(targetFamily ?? '') === 'element') {
    throw new Error('Affix Ngũ Hành đã retire; dữ liệu legacy chỉ được đọc và không thể Tái Luyện/Tinh Luyện.');
  }
}
function assertActivePreferredFamily(family) {
  if (String(family ?? '') === 'element') throw new Error('Nhóm affix Ngũ Hành đã retire và không thể được tạo mới.');
}
export function reforgeEquipmentAffixEconomyV115(item, index, seed, inventory, targetFamily) {
  assertActiveAffixMutation(item, index, targetFamily);
  return legacy.reforgeEquipmentAffixEconomyV115(item, index, seed, inventory, targetFamily);
}
export function refineEquipmentAffixV115(item, index, inventory) {
  assertActiveAffixMutation(item, index);
  return legacy.refineEquipmentAffixV115(item, index, inventory);
}
export function ensureCraftPreferredAffixFamilyV115(item, preferredFamily, seed) {
  assertActivePreferredFamily(preferredFamily);
  return legacy.ensureCraftPreferredAffixFamilyV115(item, preferredFamily, seed);
}
export function craftEquipmentWithPreferredFamilyV115(input) {
  assertActivePreferredFamily(input?.preferredFamily);
  return legacy.craftEquipmentWithPreferredFamilyV115(input);
}
