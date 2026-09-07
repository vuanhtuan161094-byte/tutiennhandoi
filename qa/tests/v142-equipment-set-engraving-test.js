import assert from 'node:assert/strict';
import { craftRankedEquipmentV142, engraveRankedEquipmentSetV142 } from '../../dist/core/equipment-crafting-v142.js';
import { grantEquipmentFragmentRankV142 } from '../../dist/core/equipment-fragments-v142.js';
import { EQUIPMENT_SET_CATALOG_V142 } from '../../dist/core/equipment-v142.js';
import { equipmentSetFragmentBalanceV142, grantEquipmentSetFragmentV142 } from '../../dist/core/equipment-set-fragments-v142.js';

const attireSet = EQUIPMENT_SET_CATALOG_V142.find(set => set.category === 'attire');
const jewelrySet = EQUIPMENT_SET_CATALOG_V142.find(set => set.category === 'jewelry');
assert.ok(attireSet && jewelrySet);

const state = {};
const equipment = { items: [], equipped: {}, unlockedSetIds: [] };
grantEquipmentFragmentRankV142(state, 5, 100, 'qa');
const weapon = craftRankedEquipmentV142(state, equipment, { slot: 'weapon', rankIndex: 5, seed: 1 }).item;
const ring = craftRankedEquipmentV142(state, equipment, { slot: 'ring', rankIndex: 5, seed: 2 }).item;

grantEquipmentSetFragmentV142(state, attireSet.id, 50, 'qa');
const engraved = engraveRankedEquipmentSetV142(state, equipment, weapon.id, attireSet.id);
assert.equal(engraved.cost, 50);
assert.equal(weapon.setId, attireSet.id);
assert.equal(equipmentSetFragmentBalanceV142(state, attireSet.id), 0);
assert.ok(weapon.name.includes(attireSet.name));

assert.throws(() => engraveRankedEquipmentSetV142(state, equipment, ring.id, attireSet.id), /6 Y Trang/);
grantEquipmentSetFragmentV142(state, jewelrySet.id, 50, 'qa');
const jewelryEngraved = engraveRankedEquipmentSetV142(state, equipment, ring.id, jewelrySet.id);
assert.equal(ring.setId, jewelrySet.id);
assert.equal(jewelryEngraved.balance, 0);

console.log('V142 equipment set engraving PASS');
