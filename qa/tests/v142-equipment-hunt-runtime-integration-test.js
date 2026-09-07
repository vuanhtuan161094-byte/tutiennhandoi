import assert from 'node:assert/strict';
import fs from 'node:fs';

const session = fs.readFileSync('dist/core/session.js', 'utf8');
const equipment = fs.readFileSync('dist/core/equipment.js', 'utf8');
const dungeon = fs.readFileSync('dist/core/dungeon.js', 'utf8');
const sessionDungeon = fs.readFileSync('dist/core/session-dungeon.js', 'utf8');

assert.match(session, /from '\.\/equipment-hunt-v142\.js'/, 'Session phải nối V142 Hunt fragment bridge.');
assert.match(session, /from '\.\/equipment-crafting-v142\.js'/, 'Session phải nối V142 crafting.');
assert.ok(session.includes('settleRealHuntEquipmentFragmentsV142(this.stateValue'), 'Real Hunt phải settlement thành mảnh V142.');
assert.ok(session.includes('settleVirtualHuntEquipmentFragmentsV142(this.stateValue'), 'Săn Ảo phải settlement thành mảnh V142.');
assert.ok(session.includes('equipmentFragmentPreviewV142: fragmentPreviewV142'), 'Preview Săn Ảo phải hiện telemetry mảnh V142.');
assert.ok(session.includes('craftEquipmentV142(slot, rankIndex)'), 'Session phải có craft V142.');
assert.ok(session.includes('refineEquipmentFragmentsV142(fromRank, batches = 1)'), 'Session phải có tinh luyện 3:1.');
assert.ok(session.includes('mergeEquipmentV142(mainItemId, fodderItemAId, fodderItemBId)'), 'Session phải có hợp 3 món -> 1 món bậc trên.');
assert.ok(session.includes('engraveEquipmentSetV142(itemId, setId)'), 'Session phải có Khắc Bộ bằng Tàn Ấn.');
assert.ok(session.includes('Trang bị V142 đã đạt +15.'), 'V142 phải khóa cường hóa +15.');

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

assert.match(equipment, /import \{[^\n]*equipmentSetPowerV142[^\n]*\} from '\.\/equipment-v142\.js';/, 'equipmentPower phải import Set V142.');
assert.ok(equipment.includes('const v142SetPower = equipmentSetPowerV142(state);'), 'Set V142 phải đi vào combat power thật.');
assert.ok(equipment.includes('activeSets.push(...v142SetPower.activeSets);'));

assert.match(dungeon, /from '\.\/equipment-dungeon-v142\.js'/, 'Dungeon phải nối converter V142.');
assert.ok(dungeon.includes('settleDungeonEquipmentEventsV142(state'), 'Dungeon loot phải settlement thành fragment.');
assert.ok(dungeon.includes('equipmentFragmentDrops.push(...settlement.drops)'), 'Dungeon phải trả fragment receipts.');
const guardianStart = dungeon.indexOf('export function grantDungeonGuardianLoot');
const guardianEnd = dungeon.indexOf('export class DungeonEngine', guardianStart);
const guardianBlock = dungeon.slice(guardianStart, guardianEnd);
assert.ok(!guardianBlock.includes('buildEquipmentInstance('), 'Guardian dungeon không được rơi nguyên trang bị V142.');
const workerStart = dungeon.indexOf('if (dungeon.equipmentLoot && dungeon.equipmentLoot.length > 0 && safeYears > 0)');
const workerEnd = dungeon.indexOf('if (registry && dungeon.artifactLoot', workerStart);
const workerBlock = dungeon.slice(workerStart, workerEnd);
assert.ok(workerStart >= 0 && workerEnd > workerStart);
assert.ok(!workerBlock.includes('buildEquipmentInstance('), 'Dungeon worker không được materialize nguyên trang bị.');
assert.ok(sessionDungeon.includes('equipmentFragmentDrops = loot.equipmentFragmentDrops ?? []'), 'Dungeon challenge transport phải nhận fragment receipts.');

console.log('V142 equipment Hunt runtime integration PASS');
