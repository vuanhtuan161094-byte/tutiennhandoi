import assert from 'node:assert/strict';
import fs from 'node:fs';

const session = fs.readFileSync('dist/core/session.js', 'utf8');
const equipment = fs.readFileSync('dist/core/equipment.js', 'utf8');

assert.ok(session.includes("from './equipment-hunt-v142.js'"), 'Session phải nối V142 Hunt fragment bridge.');
assert.ok(session.includes("from './equipment-crafting-v142.js'"), 'Session phải nối V142 crafting.');
assert.ok(session.includes('settleRealHuntEquipmentFragmentsV142(this.stateValue'), 'Real Hunt phải settlement thành mảnh V142.');
assert.ok(session.includes('settleVirtualHuntEquipmentFragmentsV142(this.stateValue'), 'Săn Ảo phải settlement thành mảnh V142.');
assert.ok(session.includes('equipmentFragmentPreviewV142: fragmentPreviewV142'), 'Preview Săn Ảo phải hiện telemetry mảnh V142.');
assert.ok(session.includes('craftEquipmentV142(slot, rankIndex)'), 'Session phải có craft V142.');
assert.ok(session.includes('refineEquipmentFragmentsV142(fromRank, batches = 1)'), 'Session phải có tinh luyện 3:1.');
assert.ok(session.includes('mergeEquipmentV142(mainItemId, fodderItemAId, fodderItemBId)'), 'Session phải có hợp 3 món -> 1 món bậc trên.');
assert.ok(session.includes("Trang bị V142 đã đạt +15."), 'V142 phải khóa cường hóa +15.');

const virtualStart = session.indexOf('settleVirtualHuntEquipmentFragmentsV142(this.stateValue');
const virtualEnd = session.indexOf('endlessHuntSummary()', virtualStart);
const virtualBlock = session.slice(virtualStart, virtualEnd);
assert.ok(virtualStart >= 0 && virtualEnd > virtualStart);
assert.ok(!virtualBlock.includes('buildEquipmentInstance('), 'Săn Ảo V142 không được materialize trang bị hoàn chỉnh.');
assert.ok(!virtualBlock.includes('overflowEquipmentRolls * 2'), 'Săn Ảo V142 không được đổi lượt dư thành Tinh Hoa trang bị cũ.');

const realStart = session.indexOf('const equipmentEventV142 = rng.chance(equipmentChancePct);');
const realEnd = session.indexOf('// V85: new PvE drops', realStart);
const realBlock = session.slice(realStart, realEnd);
assert.ok(realStart >= 0 && realEnd > realStart);
assert.ok(realBlock.includes('settleRealHuntEquipmentFragmentsV142'));
assert.ok(!realBlock.includes('buildEquipmentInstance('), 'Real Hunt V142 không được rơi nguyên món.');
assert.ok(!realBlock.includes('equipmentGradesByDepth'), 'Real Hunt không còn Grade ladder cũ.');

assert.ok(equipment.includes("import { equipmentSetPowerV142 } from './equipment-v142.js';"), 'equipmentPower phải import Set V142.');
assert.ok(equipment.includes('const v142SetPower = equipmentSetPowerV142(state);'), 'Set V142 phải đi vào combat power thật.');
assert.ok(equipment.includes('activeSets.push(...v142SetPower.activeSets);'));

console.log('V142 equipment Hunt runtime integration PASS');
