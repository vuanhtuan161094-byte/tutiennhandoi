import assert from 'node:assert/strict';
import { craftRankedEquipmentV142, mergeRankedEquipmentV142, refineRankedEquipmentFragmentsV142 } from '../../dist/core/equipment-crafting-v142.js';
import { equipmentFragmentBalanceV142, grantEquipmentFragmentRankV142 } from '../../dist/core/equipment-fragments-v142.js';

const state = {};
const equipment = { items: [], equipped: {}, unlockedSetIds: [] };
grantEquipmentFragmentRankV142(state, 4, 50, 'qa');
const crafted = craftRankedEquipmentV142(state, equipment, { slot: 'weapon', rankIndex: 4, seed: 100, acquiredWorldYear: 9 });
assert.equal(crafted.fragmentCost, 50);
assert.equal(equipmentFragmentBalanceV142(state, 4), 0);
assert.equal(crafted.item.schema, 'equipment.v142');
assert.equal(crafted.item.equipmentRankIndex, 4);
assert.equal(crafted.item.slot, 'weapon');
assert.ok(crafted.item.stats.attack > 18);
assert.ok(crafted.item.affixes.length >= 3);
assert.equal(crafted.item.gemSockets.length, 0, 'V142 không dùng Ngũ Hành Ngọc như trục progression.');
assert.equal(crafted.item.grade, 'mundane', 'grade chỉ là compatibility field, không phải progression axis.');

for (const seed of [101, 102]) {
  grantEquipmentFragmentRankV142(state, 4, 50, 'qa');
  craftRankedEquipmentV142(state, equipment, { slot: 'weapon', rankIndex: 4, seed });
}
const rank4 = equipment.items.filter(x => x.schema === 'equipment.v142' && x.slot === 'weapon' && x.equipmentRankIndex === 4);
assert.equal(rank4.length, 3);
const merged = mergeRankedEquipmentV142(equipment, rank4[0].id, rank4[1].id, rank4[2].id);
assert.equal(merged.nextRankIndex, 5);
assert.equal(equipment.items.filter(x => x.schema === 'equipment.v142' && x.slot === 'weapon').length, 1);
assert.equal(equipment.items[0].equipmentRankIndex, 5);

const refineState = {};
grantEquipmentFragmentRankV142(refineState, 0, 3, 'qa');
refineRankedEquipmentFragmentsV142(refineState, 0, 1);
assert.equal(equipmentFragmentBalanceV142(refineState, 0), 0);
assert.equal(equipmentFragmentBalanceV142(refineState, 1), 1);

console.log('V142 equipment crafting PASS');
