import { EQUIPMENT_SET_CATALOG_V142, equipmentSetDefinitionV142 } from './equipment-v142.js';

export const EQUIPMENT_SET_FRAGMENT_SCHEMA_V142 = 'equipment.set-fragments.v142';
export const EQUIPMENT_SET_FRAGMENT_ENGRAVE_COST_V142 = 50;

const ELEMENT_ATTIRE_DUNGEON_ID = 'dungeon.v122.ngu_hanh_dao_kho';
const JEWELRY_DUNGEON_ID = 'dungeon.v122.hop_dao_bao_kho';
const DAO_ATTIRE_DUNGEON_ID = 'dungeon.v122.bat_dao_chan_dien';

const ATTIRE = EQUIPMENT_SET_CATALOG_V142.filter(set => set.category === 'attire');
const JEWELRY = EQUIPMENT_SET_CATALOG_V142.filter(set => set.category === 'jewelry');

function amount(value) { return Math.max(0, Math.floor(Number(value) || 0)); }
export function ensureEquipmentSetFragmentWalletV142(state) {
  const wallet = state.equipmentSetFragmentsV142 ?? (state.equipmentSetFragmentsV142 = {});
  wallet.schema = EQUIPMENT_SET_FRAGMENT_SCHEMA_V142;
  wallet.bySetId = wallet.bySetId && typeof wallet.bySetId === 'object' ? { ...wallet.bySetId } : {};
  for (const [setId, value] of Object.entries(wallet.bySetId)) wallet.bySetId[setId] = amount(value);
  wallet.totalDrops = amount(wallet.totalDrops);
  wallet.totalEngraved = amount(wallet.totalEngraved);
  return wallet;
}
export function equipmentSetFragmentBalanceV142(state, setId) {
  return amount(ensureEquipmentSetFragmentWalletV142(state).bySetId[String(setId)]);
}
export function equipmentSetFragmentDisplayNameV142(setId) {
  const set = equipmentSetDefinitionV142(setId);
  return set ? `Tàn Ấn · ${set.name}` : `Tàn Ấn · ${setId}`;
}
export function grantEquipmentSetFragmentV142(state, setId, count = 1, source = 'unknown') {
  const set = equipmentSetDefinitionV142(setId);
  if (!set) throw new Error(`Bộ V142 không hợp lệ: ${setId}`);
  const wallet = ensureEquipmentSetFragmentWalletV142(state);
  const delta = amount(count);
  wallet.bySetId[set.id] = amount(wallet.bySetId[set.id]) + delta;
  wallet.totalDrops += delta;
  return { kind: 'setFragmentV142', source, setId: set.id, setName: set.name, category: set.category, amount: delta, balance: wallet.bySetId[set.id] };
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
  // Eight old Dao-attire equipment sets are retired in V142. The dungeon can remain
  // as content, but it is no longer a Set-identity source.
  if (dungeonId === DAO_ATTIRE_DUNGEON_ID) return undefined;
  return undefined;
}
export function equipmentSetFragmentDungeonRoleV142(dungeonId) {
  if (dungeonId === ELEMENT_ATTIRE_DUNGEON_ID) return 'element-attire';
  if (dungeonId === JEWELRY_DUNGEON_ID) return 'jewelry';
  if (dungeonId === DAO_ATTIRE_DUNGEON_ID) return 'retired-dao-attire';
  return 'generic';
}
