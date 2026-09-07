import assert from 'node:assert/strict';
import { huntEquipmentFragmentDropTableV142, huntSameRankFragmentChancePctV142 } from '../../dist/core/equipment-fragments-v142.js';

for (const rank of [0, 1, 5, 12, 20, 28]) {
  for (const zone of [1, 4, 8]) {
    const table = huntEquipmentFragmentDropTableV142(rank, zone);
    const total = table.reduce((sum, row) => sum + row.chancePct, 0);
    assert.ok(Math.abs(total - 100) < 1e-8, `rank ${rank}/zone ${zone}: tổng xác suất phải = 100`);
    assert.ok(table.every(row => row.rankIndex <= rank), `rank ${rank}/zone ${zone}: Hunt không được rơi mảnh vượt cảnh hiện tại`);
    assert.ok(table.every(row => row.rankIndex >= 0), `rank ${rank}/zone ${zone}: rank âm`);
    if (rank > 0) assert.ok(table.some(row => row.rankIndex < rank), `rank ${rank}/zone ${zone}: phải có mảnh thấp hơn`);
  }
}

assert.ok(huntSameRankFragmentChancePctV142(28, 1) >= 0.59 && huntSameRankFragmentChancePctV142(28, 1) <= 0.61);
assert.ok(huntSameRankFragmentChancePctV142(28, 8) >= 1.99 && huntSameRankFragmentChancePctV142(28, 8) <= 2.01);

console.log('V142 equipment fragment drop distribution PASS');
