import assert from 'node:assert/strict';
import {
  EQUIPMENT_FRAGMENT_CRAFT_COST_V142,
  EQUIPMENT_FRAGMENT_UPGRADE_RATIO_V142,
  canCraftEquipmentRankV142,
  consumeEquipmentCraftFragmentsV142,
  equipmentFragmentBalanceV142,
  grantEquipmentFragmentRankV142,
  huntEquipmentFragmentDropTableV142,
  huntSameRankFragmentChancePctV142,
  phamEquivalentCostV142,
  refineEquipmentFragmentsUpV142,
  rollHuntEquipmentFragmentRankV142,
  settleHuntEquipmentFragmentEventV142,
} from '../../dist/core/equipment-fragments-v142.js';
import { EQUIPMENT_SANG_THE_INDEX_V142 } from '../../dist/core/equipment-v142.js';

assert.equal(EQUIPMENT_FRAGMENT_CRAFT_COST_V142, 50, 'Mỗi món cần đúng 50 mảnh cùng bậc.');
assert.equal(EQUIPMENT_FRAGMENT_UPGRADE_RATIO_V142, 3, 'Ba mảnh bậc dưới đổi một mảnh bậc trên.');
assert.equal(phamEquivalentCostV142(0), 50n);
assert.equal(phamEquivalentCostV142(1), 150n);
assert.equal(phamEquivalentCostV142(EQUIPMENT_SANG_THE_INDEX_V142), 1143839622748050n);

const state = {};
grantEquipmentFragmentRankV142(state, 1, 49, 'test');
assert.equal(canCraftEquipmentRankV142(state, 1), false);
grantEquipmentFragmentRankV142(state, 1, 1, 'test');
assert.equal(canCraftEquipmentRankV142(state, 1), true);
consumeEquipmentCraftFragmentsV142(state, 1);
assert.equal(equipmentFragmentBalanceV142(state, 1), 0);

grantEquipmentFragmentRankV142(state, 0, 150, 'test');
refineEquipmentFragmentsUpV142(state, 0, 50);
assert.equal(equipmentFragmentBalanceV142(state, 0), 0);
assert.equal(equipmentFragmentBalanceV142(state, 1), 50);

for (const zone of [1, 4, 8]) {
  const table = huntEquipmentFragmentDropTableV142(12, zone);
  const sum = table.reduce((acc, row) => acc + row.chancePct, 0);
  assert.ok(Math.abs(sum - 100) < 1e-8, `Drop table zone ${zone} phải = 100%.`);
  assert.ok(table.some(row => row.rankIndex === 12), 'Khu cảnh hiện tại phải có mảnh cùng bậc.');
  assert.ok(table.some(row => row.rankIndex < 12), 'Khu cảnh hiện tại phải rơi cả mảnh thấp hơn.');
}
assert.ok(huntSameRankFragmentChancePctV142(12, 1) < huntSameRankFragmentChancePctV142(12, 8), 'Vực sâu phải tăng nhẹ cơ hội mảnh cùng bậc.');
assert.ok(huntSameRankFragmentChancePctV142(12, 8) <= 2.01, 'Mảnh cùng bậc vẫn phải rất hiếm.');
assert.equal(rollHuntEquipmentFragmentRankV142(12, 8, 0), 12, 'Roll cực thấp phải có thể ra mảnh cùng bậc.');
assert.ok(rollHuntEquipmentFragmentRankV142(12, 8, 0.99) < 12, 'Phần lớn roll phải ra mảnh thấp hơn.');

const boss = settleHuntEquipmentFragmentEventV142({}, { currentRank: 12, zone: 8, monsterGrade: 'boss', firstClear: true, roll01: 0, source: 'qa' });
assert.equal(boss.rankIndex, 12);
assert.equal(boss.sameRank, true);
assert.ok(boss.amount >= 5, 'Boss first clear phải cho nhiều mảnh khi event trúng.');

console.log('V142 equipment fragment economy PASS');
