/**
 * 2026-09-27 retirement facade.
 * Historical V128 Ngũ Hành Ngọc payloads remain readable through the legacy module,
 * but no live gem catalog, socket capacity, effect, mutation, salvage yield or acquisition remains.
 * Đạo Văn exports continue to flow through unchanged.
 */
export * from './equipment-inscription-gem-v128-legacy.js';

export const V128_EQUIPMENT_GEMS = Object.freeze([]);
export function equipmentGemSocketCountV128(_itemOrGrade) { return 0; }
export function equipmentGemDefinitionV128(_id) { return undefined; }
export function equipmentGemUpgradeCostV128(_targetLevel) { return 0; }
export function equipmentGemEffectV128(_gem) { return undefined; }
function retiredGemMutation() { throw new Error('Ngũ Hành Ngọc đã retire; dữ liệu save cũ chỉ được đọc và không còn hiệu lực gameplay.'); }
export function socketEquipmentGemV128() { return retiredGemMutation(); }
export function upgradeEquipmentGemV128() { return retiredGemMutation(); }
export function unsocketEquipmentGemV128() { return retiredGemMutation(); }
export function equipmentGemBlankSalvageYieldV128(_item) { return 0; }
