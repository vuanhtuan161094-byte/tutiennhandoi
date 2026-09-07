import {
  EQUIPMENT_ATTIRE_SLOTS_V142,
  EQUIPMENT_JEWELRY_SLOTS_V142,
  EQUIPMENT_SET_CATALOG_V142,
  EQUIPMENT_V142_SCHEMA,
  equipmentBaseStatsForRankV142,
  equipmentSetDefinitionV142,
} from './equipment-v142.js';

export const EQUIPMENT_SET_FRAGMENT_SCHEMA_V142 = 'equipment.set-fragments.v143';
export const EQUIPMENT_SET_FRAGMENT_ENGRAVE_COST_V142 = 50;
/** Endless sink: every extra 50 Tàn Ấn after a Set is completed becomes one resonance level. */
export const EQUIPMENT_SET_RESONANCE_STEP_COST_V143 = 50;
/** Keep one engraving cost in reserve so endless conversion never prevents a replacement piece. */
export const EQUIPMENT_SET_RESONANCE_RESERVE_V143 = EQUIPMENT_SET_FRAGMENT_ENGRAVE_COST_V142;

const ELEMENT_ATTIRE_DUNGEON_ID = 'dungeon.v122.ngu_hanh_dao_kho';
const JEWELRY_DUNGEON_ID = 'dungeon.v122.hop_dao_bao_kho';
const DAO_ATTIRE_DUNGEON_ID = 'dungeon.v122.bat_dao_chan_dien';

const ATTIRE = EQUIPMENT_SET_CATALOG_V142.filter(set => set.category === 'attire');
const JEWELRY = EQUIPMENT_SET_CATALOG_V142.filter(set => set.category === 'jewelry');

function amount(value) { return Math.max(0, Math.floor(Number(value) || 0)); }
function expectedSlots(set) { return set?.category === 'attire' ? EQUIPMENT_ATTIRE_SLOTS_V142 : EQUIPMENT_JEWELRY_SLOTS_V142; }
export function ensureEquipmentSetFragmentWalletV142(state) {
  const wallet = state.equipmentSetFragmentsV142 ?? (state.equipmentSetFragmentsV142 = {});
  wallet.schema = EQUIPMENT_SET_FRAGMENT_SCHEMA_V142;
  wallet.bySetId = wallet.bySetId && typeof wallet.bySetId === 'object' ? { ...wallet.bySetId } : {};
  for (const [setId, value] of Object.entries(wallet.bySetId)) wallet.bySetId[setId] = amount(value);
  wallet.resonanceBySetId = wallet.resonanceBySetId && typeof wallet.resonanceBySetId === 'object' ? { ...wallet.resonanceBySetId } : {};
  for (const [setId, value] of Object.entries(wallet.resonanceBySetId)) wallet.resonanceBySetId[setId] = amount(value);
  wallet.resonanceUnlockedSetIds = [...new Set(Array.isArray(wallet.resonanceUnlockedSetIds) ? wallet.resonanceUnlockedSetIds.map(String) : [])];
  wallet.totalDrops = amount(wallet.totalDrops);
  wallet.totalEngraved = amount(wallet.totalEngraved);
  wallet.totalResonanceLevels = amount(wallet.totalResonanceLevels);
  return wallet;
}
export function equipmentSetFragmentBalanceV142(state, setId) {
  return amount(ensureEquipmentSetFragmentWalletV142(state).bySetId[String(setId)]);
}
export function equipmentSetResonanceLevelV143(state, setId) {
  return amount(ensureEquipmentSetFragmentWalletV142(state).resonanceBySetId[String(setId)]);
}
export function equipmentSetFragmentDisplayNameV142(setId) {
  const set = equipmentSetDefinitionV142(setId);
  return set ? `Tàn Ấn · ${set.name}` : `Tàn Ấn · ${setId}`;
}
export function equipmentSetHasFullIdentityV143(equipmentState, setId) {
  const set = equipmentSetDefinitionV142(setId);
  if (!set || !equipmentState?.items) return false;
  const ownedSlots = new Set(equipmentState.items
    .filter(item => item?.schema === EQUIPMENT_V142_SCHEMA && item.setId === set.id)
    .map(item => item.slot));
  return expectedSlots(set).every(slot => ownedSlots.has(slot));
}
function addBonus(target, key, value) {
  const n = Number(value) || 0;
  if (n !== 0) target[key] = (target[key] ?? 0) + n;
}
/**
 * Resonance is stored on the Set pieces themselves, so it survives save/clone without another combat state lane.
 * Raw apparel resonance remains uncapped. Jewelry resonance uses only bounded combat stats.
 */
export function equipmentSetResonanceBonusForItemV143(item, setId, level) {
  const set = equipmentSetDefinitionV142(setId);
  const lv = amount(level);
  if (!set || lv <= 0 || !item) return {};
  const bonus = {};
  if (set.category === 'attire') {
    const base = equipmentBaseStatsForRankV142(item.slot, item.equipmentRankIndex ?? 0);
    if (set.key === 'metal' || set.key === 'fire') {
      if (base.attack) addBonus(bonus, 'attack', Math.max(1, Math.round(base.attack * .0025 * lv)));
    }
    else if (set.key === 'wood') {
      if (base.maxHp) addBonus(bonus, 'maxHp', Math.max(1, Math.round(base.maxHp * .0030 * lv)));
    }
    else if (set.key === 'earth') {
      if (base.defense) addBonus(bonus, 'defense', Math.max(1, Math.round(base.defense * .0030 * lv)));
    }
    else if (set.key === 'water') addBonus(bonus, 'shieldEffectPct', .025 * lv);
  }
  else if (set.key === 'huyen_nguyen') {
    addBonus(bonus, 'spiritEfficiencyPct', .020 * lv);
    addBonus(bonus, 'cooldownReductionPct', .015 * lv);
  }
  else if (set.key === 'pha_gioi') {
    addBonus(bonus, 'armorPenPct', .020 * lv);
    addBonus(bonus, 'heartChancePct', .020 * lv);
  }
  else if (set.key === 'hu_khong') addBonus(bonus, 'dodgeChancePct', .020 * lv);
  else if (set.key === 'tran_thu') {
    addBonus(bonus, 'controlDurationReductionPct', .025 * lv);
    addBonus(bonus, 'damageReductionPct', .010 * lv);
  }
  return bonus;
}
export function syncEquipmentSetResonanceItemsV143(equipmentState, setId, level) {
  const set = equipmentSetDefinitionV142(setId);
  if (!set || !equipmentState?.items) return 0;
  const lv = amount(level);
  let synced = 0;
  for (const item of equipmentState.items) {
    if (item?.schema !== EQUIPMENT_V142_SCHEMA || item.setId !== set.id) continue;
    // Rebuild from canonical rank base to make synchronization idempotent; never compound old resonance.
    item.stats = equipmentBaseStatsForRankV142(item.slot, item.equipmentRankIndex ?? 0);
    const bonus = equipmentSetResonanceBonusForItemV143(item, set.id, lv);
    for (const [key, value] of Object.entries(bonus)) item.stats[key] = (item.stats[key] ?? 0) + value;
    item.setResonanceLevelV143 = lv;
    item.setResonanceBonusStatsV143 = { ...bonus };
    synced += 1;
  }
  return synced;
}
export function settleEquipmentSetResonanceV143(state, equipmentState, setId) {
  const set = equipmentSetDefinitionV142(setId);
  if (!set) throw new Error(`Bộ V142 không hợp lệ: ${setId}`);
  const wallet = ensureEquipmentSetFragmentWalletV142(state);
  const fullNow = equipmentSetHasFullIdentityV143(equipmentState, set.id);
  if (fullNow && !wallet.resonanceUnlockedSetIds.includes(set.id)) wallet.resonanceUnlockedSetIds.push(set.id);
  const unlocked = wallet.resonanceUnlockedSetIds.includes(set.id);
  let gainedLevels = 0;
  if (unlocked) {
    const have = amount(wallet.bySetId[set.id]);
    const convertible = Math.max(0, have - EQUIPMENT_SET_RESONANCE_RESERVE_V143);
    gainedLevels = Math.floor(convertible / EQUIPMENT_SET_RESONANCE_STEP_COST_V143);
    if (gainedLevels > 0) {
      wallet.bySetId[set.id] = have - gainedLevels * EQUIPMENT_SET_RESONANCE_STEP_COST_V143;
      wallet.resonanceBySetId[set.id] = amount(wallet.resonanceBySetId[set.id]) + gainedLevels;
      wallet.totalResonanceLevels += gainedLevels;
    }
  }
  const level = amount(wallet.resonanceBySetId[set.id]);
  const syncedItems = syncEquipmentSetResonanceItemsV143(equipmentState, set.id, level);
  return {
    setId: set.id, setName: set.name, unlocked, fullNow, gainedLevels, level,
    balance: amount(wallet.bySetId[set.id]), reserve: EQUIPMENT_SET_RESONANCE_RESERVE_V143,
    stepCost: EQUIPMENT_SET_RESONANCE_STEP_COST_V143, syncedItems,
  };
}
export function grantEquipmentSetFragmentV142(state, setId, count = 1, source = 'unknown', equipmentState = state?.equipment) {
  const set = equipmentSetDefinitionV142(setId);
  if (!set) throw new Error(`Bộ V142 không hợp lệ: ${setId}`);
  const wallet = ensureEquipmentSetFragmentWalletV142(state);
  const delta = amount(count);
  wallet.bySetId[set.id] = amount(wallet.bySetId[set.id]) + delta;
  wallet.totalDrops += delta;
  const resonance = equipmentState ? settleEquipmentSetResonanceV143(state, equipmentState, set.id) : undefined;
  return { kind: 'setFragmentV142', source, setId: set.id, setName: set.name, category: set.category, amount: delta, balance: equipmentSetFragmentBalanceV142(state, set.id), resonance };
}
export function spendEquipmentSetFragmentsV142(state, setId, count = EQUIPMENT_SET_FRAGMENT_ENGRAVE_COST_V142) {
  const set = equipmentSetDefinitionV142(setId);
  if (!set) throw new Error(`Bộ V142 không hợp lệ: ${setId}`);
  const wallet = ensureEquipmentSetFragmentWalletV142(state);
  const need = amount(count), have = amount(wallet.bySetId[set.id]);
  if (have < need) throw new Error(`Không đủ ${equipmentSetFragmentDisplayNameV142(set.id)}: ${have}/${need}.`);
  wallet.bySetId[set.id] = have - need;
  return { setId: set.id, setName: set.name, amount: need, balance: wallet.bySetId[set.id] };
}
export function targetSetForDungeonFloorV142(dungeonId, floor) {
  const f = Math.max(1, Math.floor(Number(floor) || 1));
  if (dungeonId === ELEMENT_ATTIRE_DUNGEON_ID) return ATTIRE[(f - 1) % ATTIRE.length];
  if (dungeonId === JEWELRY_DUNGEON_ID) return JEWELRY[(f - 1) % JEWELRY.length];
  if (dungeonId === DAO_ATTIRE_DUNGEON_ID) return undefined;
  return undefined;
}
export function equipmentSetFragmentDungeonRoleV142(dungeonId) {
  if (dungeonId === ELEMENT_ATTIRE_DUNGEON_ID) return 'element-attire';
  if (dungeonId === JEWELRY_DUNGEON_ID) return 'jewelry';
  if (dungeonId === DAO_ATTIRE_DUNGEON_ID) return 'retired-dao-attire';
  return 'generic';
}
