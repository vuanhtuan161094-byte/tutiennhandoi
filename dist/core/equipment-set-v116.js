/**
 * 2026-09-27 equipment Set retirement facade.
 * Historical Set definitions stay available for save/content migration only.
 * Live discovery, crafting, thresholds, combat mechanics and tags are disabled.
 */
import * as legacy from './equipment-set-v116-legacy.js';
export * from './equipment-set-v116-legacy.js';

export const LIVE_EQUIPMENT_SET_CATALOG_V12310 = Object.freeze([]);
// Preserve the historical retirement list so the five formerly-live element Set ids are not
// destructively erased during save normalization; they remain readable but inert.
export const RETIRED_EQUIPMENT_SET_IDS_V12310 = legacy.RETIRED_EQUIPMENT_SET_IDS_V12310;
export function isLiveEquipmentSetV12310(_id) { return false; }
export function activeEquipmentSetMechanicsV116(_state) { return []; }
export function equipmentSetMechanicTagsV116(_active) { return []; }
export function validateLiveEquipmentSetArchitectureV12310() { return []; }
function retiredSetMutation() { throw new Error('Set trang bị đã retire; dữ liệu Set cũ chỉ được đọc và không còn hiệu lực gameplay.'); }
export function unlockEquipmentSetV116() { return retiredSetMutation(); }
export function requireUnlockedSetCraftV116() { return retiredSetMutation(); }
export function equipmentSetTemplateIdV116() { return retiredSetMutation(); }
