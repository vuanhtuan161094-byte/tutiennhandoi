/**
 * 2026-09-27 equipment Set retirement facade.
 * Historical Set definitions stay available for save/content migration only.
 * Live discovery, crafting, thresholds, combat mechanics and tags are disabled.
 */
import * as legacy from './equipment-set-v116-legacy.js';
export * from './equipment-set-v116-legacy.js';

export const LIVE_EQUIPMENT_SET_CATALOG_V12310 = Object.freeze([]);
// The five Ngũ Hành attire Sets were the live equipment Sets immediately before retirement.
// Preserve exactly those ids as inert compatibility metadata; the legacy module's
// RETIRED_EQUIPMENT_SET_IDS_V12310 refers to an older pre-retirement classification.
export const RETIRED_EQUIPMENT_SET_IDS_V12310 = Object.freeze(legacy.LIVE_EQUIPMENT_SET_CATALOG_V12310.map(set => set.id));
export function isLiveEquipmentSetV12310(_id) { return false; }
export function activeEquipmentSetMechanicsV116(_state) { return []; }
export function equipmentSetMechanicTagsV116(_active) { return []; }
export function validateLiveEquipmentSetArchitectureV12310() { return []; }
function retiredSetMutation() { throw new Error('Set trang bị đã retire; dữ liệu Set cũ chỉ được đọc và không còn hiệu lực gameplay.'); }
export function unlockEquipmentSetV116() { return retiredSetMutation(); }
export function requireUnlockedSetCraftV116() { return retiredSetMutation(); }
export function equipmentSetTemplateIdV116() { return retiredSetMutation(); }
