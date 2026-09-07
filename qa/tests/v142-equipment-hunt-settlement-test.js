import assert from 'node:assert/strict';
import { equipmentFragmentBalanceV142 } from '../../dist/core/equipment-fragments-v142.js';
import { huntEquipmentFragmentPreviewV142, settleRealHuntEquipmentFragmentsV142, settleVirtualHuntEquipmentFragmentsV142 } from '../../dist/core/equipment-hunt-v142.js';

const realState = {};
const miss = settleRealHuntEquipmentFragmentsV142(realState, { majorRealmIndex: 15, zone: 8, equipmentEvent: false, rankRoll01: 0 });
assert.equal(miss.totalFragments, 0);
const hit = settleRealHuntEquipmentFragmentsV142(realState, { majorRealmIndex: 15, zone: 8, monsterGrade: 'boss', firstClear: true, equipmentEvent: true, rankRoll01: 0, seed: 9 });
assert.equal(hit.sameRank, true);
assert.ok(hit.totalFragments >= 5);
assert.equal(equipmentFragmentBalanceV142(realState, 15), hit.totalFragments);

const virtualA = {};
const virtualB = {};
const a = settleVirtualHuntEquipmentFragmentsV142(virtualA, { majorRealmIndex: 15, zone: 8, equipmentEvents: 10_000, seed: 12345 });
const b = settleVirtualHuntEquipmentFragmentsV142(virtualB, { majorRealmIndex: 15, zone: 8, equipmentEvents: 10_000, seed: 12345 });
assert.deepEqual(a.drops.map(x => [x.rankIndex, x.amount]), b.drops.map(x => [x.rankIndex, x.amount]), 'Săn Ảo phải deterministic theo seed.');
assert.equal(a.totalFragments, 10_000, 'Mỗi equipment event Săn Ảo đổi thành đúng một mảnh, không materialize đồ.');
assert.ok(a.sameRankFragments > 0, 'Batch lớn phải có thể sinh mảnh cùng cảnh.');
assert.ok(a.sameRankFragments < 300, 'Mảnh cùng cảnh vẫn phải hiếm ở zone 8 (~2%).');
assert.ok(a.drops.some(x => x.rankIndex < 15), 'Săn Ảo cảnh cao phải rơi mảnh cảnh thấp hơn.');
assert.ok(a.drops.every(x => x.rankIndex <= 15), 'Không được rơi mảnh vượt cảnh khu vực.');

const preview = huntEquipmentFragmentPreviewV142({ majorRealmIndex: 15, zone: 8, equipmentEventsPerHour: 270 });
assert.ok(preview.sameRankChancePctPerFragmentEvent >= 1.99 && preview.sameRankChancePctPerFragmentEvent <= 2.01);
assert.ok(preview.sameRankFragmentsPerHour >= 5.39 && preview.sameRankFragmentsPerHour <= 5.41);
// With 50 same-rank fragments/item this example is ~9.26h/item before counting lower-rank refinement.
const hoursPerItem = 50 / preview.sameRankFragmentsPerHour;
assert.ok(hoursPerItem > 9 && hoursPerItem < 10);

console.log('V142 equipment Hunt settlement PASS');
