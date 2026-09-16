import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { RESOURCE_PVE_DUNGEONS_V12329 } from '../../dist/core/resource-pve-v12329.js';
import { equipmentResourceSourceCoverageV143 } from '../../dist/core/loot-economy-v122.js';

const sessionSource = await readFile(new URL('../../dist/core/session.js', import.meta.url), 'utf8');
const fightStart = sessionSource.indexOf('    fightEndlessFloor(options = {}) {');
const fightEnd = sessionSource.indexOf('    equipmentCombatImpact(itemId) {', fightStart);
assert.ok(fightStart >= 0 && fightEnd > fightStart, 'must isolate canonical real Boss fight authority');
const fight = sessionSource.slice(fightStart, fightEnd);

const farmStart = sessionSource.indexOf('    resolveEndlessHuntFarmBatchV77(', 0);
const farmEnd = sessionSource.indexOf('    endlessHuntSummary() {', farmStart);
assert.ok(farmStart >= 0 && farmEnd > farmStart, 'must isolate canonical timed virtual Hunt settlement');
const virtualFarm = sessionSource.slice(farmStart, farmEnd);

// V180: real Boss combat is progression-only. No resource/economy/first-clear mint lane may survive here.
for (const token of [
  'settleRealHuntEquipmentFragmentsV142(',
  'applyEconomyResourceDrops(',
  'applyHeavenlyTreasureDrops(',
  'settleSpiritualRootHuntV145(',
  'recordFirstClearBoundJadeV89(',
  "inventory['resource.spirit_stone']",
  'trueBloodResourceId(',
]) {
  assert.ok(!fight.includes(token), `real Boss fight must not mint Hunt reward via ${token}`);
}
assert.ok(fight.includes("rewardContext: 'progression-only'"), 'Boss result must declare progression-only reward context');
assert.ok(fight.includes('directBossLoot: false'), 'Boss result must explicitly declare no direct loot');
assert.ok(fight.includes('Boss chỉ mở tiến độ'), 'Boss summary must explain progression-only semantics');
assert.ok(fight.includes('Bãi Săn Ảo tầng'), 'Boss clear must surface the timed-farm progression consequence');

// Timed Săn Ảo is the sole Hunt economy/resource settlement lane.
for (const token of [
  'seconds / secondsPerKillV129',
  'settleVirtualHuntEquipmentFragmentsV142(',
  'settleSpiritualRootHuntV145(',
  "inventory['resource.spirit_stone']",
  'demonCores',
]) {
  assert.ok(virtualFarm.includes(token), `timed virtual Hunt settlement missing ${token}`);
}

// Dedicated-system progression resources still must not be minted by the real Boss fight.
for (const token of [
  'resource.enhancement_protection_talisman',
  'resource.enhancement_transfer_gem',
  'BLOODLINE_ESSENCE_RESOURCE_ID',
  'BODY_ESSENCE_RESOURCE_ID',
  'BLOODLINE_PROTECTION_RESOURCE_ID',
  'specialEquipmentDrops',
  'bloodlineEssenceDrops',
  'bodyEssenceDrops',
  'bloodlineProtectionDrops',
  'TECHNIQUE_INSIGHT_RESOURCE_ID',
  'techniqueFragmentDrops',
  'daoTechniqueFragment',
  'learnTechniqueManual',
  'battleDaoTechniqueFragmentTargetsV125',
  'rootQualityMaterialDropsFromHuntV131',
  'rollTargetRootOriginV131',
]) {
  assert.ok(!fight.includes(token), `Boss fight must not own dedicated-system reward ${token}`);
}

// Resources removed from Hunt still have concrete dedicated production sources.
const bloodline = RESOURCE_PVE_DUNGEONS_V12329.find(x => x.category === 'bloodline');
const physique = RESOURCE_PVE_DUNGEONS_V12329.find(x => x.category === 'physique');
assert.ok(bloodline, 'bloodline resource dungeon must remain live');
assert.ok(physique, 'physique resource dungeon must remain live');
assert.equal(bloodline.name, 'Thái Cổ Huyết Uyên');
assert.equal(physique.name, 'Luyện Thể Cổ Cảnh');

const equipmentSources = equipmentResourceSourceCoverageV143();
assert.equal(equipmentSources.enhancementEssence, true);
assert.equal(equipmentSources.affixFamilyChange, true);
assert.equal(equipmentSources.antiDowngrade, true);
assert.equal(equipmentSources.enhancementTransfer, true);

console.log('V180 Hunt time-only reward authority PASS');
