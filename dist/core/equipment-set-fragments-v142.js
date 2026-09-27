/** 2026-09-27 read-only compatibility facade for retired V142 Set/Tàn Ấn state. */
import * as legacy from './equipment-set-fragments-v142-legacy.js';
export * from './equipment-set-fragments-v142-legacy.js';

export function equipmentSetFragmentDisplayNameV142(setId) { return `Tàn Ấn legacy · ${String(setId ?? '')}`; }
export function equipmentSetHasFullIdentityV143(_equipmentState, _setId) { return false; }
export function equipmentSetResonanceBonusForItemV143(_item, _setId, _level) { return {}; }
export function syncEquipmentSetResonanceItemsV143(_equipmentState, _setId, _level) { return 0; }
export function settleEquipmentSetResonanceV143(state, _equipmentState, setId) {
  return {
    setId: String(setId ?? ''), setName: 'Set legacy', retired: true, unlocked: false, fullNow: false,
    gainedLevels: 0, level: legacy.equipmentSetResonanceLevelV143(state, setId),
    balance: legacy.equipmentSetFragmentBalanceV142(state, setId), reserve: 0, stepCost: 0, syncedItems: 0,
  };
}
export function grantEquipmentSetFragmentV142(state, setId, _count = 1, source = 'unknown') {
  return { kind: 'setFragmentV142', source, setId: String(setId ?? ''), amount: 0, balance: legacy.equipmentSetFragmentBalanceV142(state, setId), ignored: true, retired: true };
}
export function spendEquipmentSetFragmentsV142() { throw new Error('Set trang bị đã retire; Tàn Ấn legacy không thể tiêu.'); }
export function targetSetForDungeonFloorV142() { return undefined; }
export function equipmentSetFragmentDungeonRoleV142(dungeonId) {
  return ['dungeon.v122.ngu_hanh_dao_kho', 'dungeon.v122.hop_dao_bao_kho', 'dungeon.v122.bat_dao_chan_dien'].includes(String(dungeonId)) ? 'retired-set' : 'generic';
}
