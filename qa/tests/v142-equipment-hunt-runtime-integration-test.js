import assert from 'node:assert/strict';
import fs from 'node:fs';

const session = fs.readFileSync('dist/core/session.js', 'utf8');
const equipment = fs.readFileSync('dist/core/equipment.js', 'utf8');
const dungeon = fs.readFileSync('dist/core/dungeon.js', 'utf8');
const sessionDungeon = fs.readFileSync('dist/core/session-dungeon.js', 'utf8');
const crafting = fs.readFileSync('dist/core/equipment-crafting-v142.js','utf8');

assert.match(session, /from '\.\/equipment-hunt-v142\.js'/, 'Session must retain the V142 Hunt generic-fragment bridge.');
assert.match(session, /from '\.\/equipment-crafting-v142\.js'/, 'Session must retain ranked-equipment crafting.');
assert.ok(session.includes("rewardContext: 'progression-only'") && session.includes('directBossLoot: false'), 'Real Boss remains progression-only and does not mint finished V142 gear directly.');
assert.ok(session.includes('settleVirtualHuntEquipmentFragmentsV142(this.stateValue'), 'Virtual Hunt must settle to generic ranked fragments.');
assert.ok(session.includes('equipmentFragmentPreviewV142: fragmentPreviewV142'), 'Virtual Hunt preview must expose generic fragment telemetry.');
assert.ok(session.includes('craftEquipmentV142(slot, rankIndex)'), 'Session keeps generic V142 crafting.');
assert.ok(session.includes('refineEquipmentFragmentsV142(fromRank, batches = 1)'), 'Session keeps 3:1 generic fragment refinement.');
assert.ok(session.includes('mergeEquipmentV142(mainItemId, fodderItemAId, fodderItemBId)'), 'Session keeps 3-item ranked merge.');
assert.ok(session.includes('Trang bị V142 đã đạt +15.'), 'V142 enhancement remains capped at +15.');

const virtualStart = session.indexOf('settleVirtualHuntEquipmentFragmentsV142(this.stateValue');
const virtualEnd = session.indexOf('endlessHuntSummary()', virtualStart);
const virtualBlock = session.slice(virtualStart, virtualEnd);
assert.ok(virtualStart >= 0 && virtualEnd > virtualStart);
assert.ok(!virtualBlock.includes('buildEquipmentInstance('), 'Virtual Hunt must not materialize finished equipment.');
assert.ok(!virtualBlock.includes('overflowEquipmentRolls * 2'), 'Virtual Hunt must not restore the old Essence conversion path.');

const realStart = session.indexOf('fightEndlessFloor(options = {})');
const realEnd = session.indexOf('equipmentCombatImpact(itemId)', realStart);
const realBlock = session.slice(realStart, realEnd);
assert.ok(realStart >= 0 && realEnd > realStart);
assert.ok(realBlock.includes("rewardContext: 'progression-only'"));
assert.ok(realBlock.includes('directBossLoot: false'));
assert.ok(!realBlock.includes('settleRealHuntEquipmentFragmentsV142('), 'Real Boss must not directly mint V142 fragments; ordinary farming owns the fragment stream.');
assert.ok(!realBlock.includes('buildEquipmentInstance('), 'Real Boss must not drop finished V142 equipment.');
assert.ok(!realBlock.includes('equipmentGradesByDepth'), 'Real Boss must not restore the retired Grade ladder.');

// Set/Tàn Ấn/Resonance authority is retired. The compatibility method may remain callable at the Session API,
// but its underlying spend path is fail-closed and equipment combat strips all Set power.
assert.ok(session.includes('engraveEquipmentSetV142(itemId, setId)'), 'compatibility API remains addressable for old clients');
assert.ok(crafting.includes("throw new Error('Set trang bị đã retire; Tàn Ấn legacy không thể tiêu.')") || crafting.includes('spendEquipmentSetFragmentsV142'), 'ranked Set engraving must delegate to the retirement spend guard');
assert.ok(equipment.includes('activeSets: [], activeSetMechanics: []'), 'equipment power must expose no live Set authority');
assert.ok(equipment.includes('activeSetMechanics: []'), 'combat entity must strip retired Set mechanics');
assert.ok(!equipment.includes('const v142SetPower = equipmentSetPowerV142(state);'), 'retired V142 Set power must not be re-injected into combat');

assert.match(dungeon, /from '\.\/equipment-dungeon-v142\.js'/, 'Dungeon keeps the V142 generic-fragment converter.');
assert.ok(dungeon.includes('settleDungeonEquipmentEventsV142(state'), 'Dungeon equipment events must settle to fragments.');
assert.ok(dungeon.includes('equipmentFragmentDrops.push(...settlement.drops)'), 'Dungeon transport must return fragment receipts.');
const guardianStart = dungeon.indexOf('export function grantDungeonGuardianLoot');
const guardianEnd = dungeon.indexOf('export class DungeonEngine', guardianStart);
const guardianBlock = dungeon.slice(guardianStart, guardianEnd);
assert.ok(!guardianBlock.includes('buildEquipmentInstance('), 'Guardian dungeon must not drop finished V142 equipment.');
const workerStart = dungeon.indexOf('if (dungeon.equipmentLoot && dungeon.equipmentLoot.length > 0 && safeYears > 0)');
const workerEnd = dungeon.indexOf('if (registry && dungeon.artifactLoot', workerStart);
const workerBlock = dungeon.slice(workerStart, workerEnd);
assert.ok(workerStart >= 0 && workerEnd > workerStart);
assert.ok(!workerBlock.includes('buildEquipmentInstance('), 'Dungeon worker must not materialize finished equipment.');
assert.ok(sessionDungeon.includes('equipmentFragmentDrops = loot.equipmentFragmentDrops ?? []'), 'Dungeon challenge transport must retain generic fragment receipts.');

console.log('V142 equipment Hunt runtime integration retirement PASS');
