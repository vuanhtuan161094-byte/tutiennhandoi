import assert from 'node:assert/strict';
import { settleDungeonEquipmentEventsV142 } from '../../dist/core/equipment-dungeon-v142.js';
import { equipmentFragmentBalanceV142 } from '../../dist/core/equipment-fragments-v142.js';
import { equipmentSetFragmentBalanceV142, targetSetForDungeonFloorV142 } from '../../dist/core/equipment-set-fragments-v142.js';

const generic = {};
const genericDrop = settleDungeonEquipmentEventsV142(generic, {
  dungeonId: 'dungeon.generic.qa', floor: 1, requiredRealmOrder: 34, equipmentEvents: 2, firstClear: false, source: 'qa',
});
assert.equal(genericDrop.genericFragments, 6);
assert.equal(genericDrop.setFragments, 0);
assert.equal(equipmentFragmentBalanceV142(generic, genericDrop.rankIndex), 6);

const elementState = {};
const elementSet = targetSetForDungeonFloorV142('dungeon.v122.ngu_hanh_dao_kho', 1);
assert.ok(elementSet && elementSet.category === 'attire');
const elementDrop = settleDungeonEquipmentEventsV142(elementState, {
  dungeonId: 'dungeon.v122.ngu_hanh_dao_kho', floor: 1, requiredRealmOrder: 10, equipmentEvents: 1, firstClear: true, source: 'qa',
});
assert.equal(elementDrop.genericFragments, 10);
assert.equal(elementDrop.setFragments, 15);
assert.equal(equipmentSetFragmentBalanceV142(elementState, elementSet.id), 15);

const jewelryState = {};
const jewelrySet = targetSetForDungeonFloorV142('dungeon.v122.hop_dao_bao_kho', 4);
assert.ok(jewelrySet && jewelrySet.category === 'jewelry');
const jewelryDrop = settleDungeonEquipmentEventsV142(jewelryState, {
  dungeonId: 'dungeon.v122.hop_dao_bao_kho', floor: 4, requiredRealmOrder: 34, equipmentEvents: 2, firstClear: false, source: 'qa',
});
assert.equal(jewelryDrop.genericFragments, 6);
assert.equal(jewelryDrop.setFragments, 10);
assert.equal(equipmentSetFragmentBalanceV142(jewelryState, jewelrySet.id), 10);

const retiredDao = {};
const daoDrop = settleDungeonEquipmentEventsV142(retiredDao, {
  dungeonId: 'dungeon.v122.bat_dao_chan_dien', floor: 3, requiredRealmOrder: 26, equipmentEvents: 3, firstClear: false, source: 'qa',
});
assert.equal(daoDrop.role, 'retired-dao-attire');
assert.equal(daoDrop.setFragments, 0, '8 bộ Đạo cũ không được sống lại dưới dạng Set V142.');
assert.equal(daoDrop.genericFragments, 9);

console.log('V142 dungeon equipment fragment conversion PASS');
