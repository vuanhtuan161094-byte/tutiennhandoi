import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  SWORD_F6_DURATION_SECONDS,
  SWORD_F6_PROFILES,
  SWORD_F6_SEEDS,
  createSwordF6Player,
  validateSwordF6Profiles,
} from '../benchmarks/sword-dao-f6-benchmark.js';

assert.equal(SWORD_F6_DURATION_SECONDS,180);
assert.equal(SWORD_F6_SEEDS.length,12);
assert.deepEqual(validateSwordF6Profiles(),[]);
assert.deepEqual(SWORD_F6_PROFILES.map(x=>x.id),['heavy','flow','myriad']);
for(const profile of SWORD_F6_PROFILES){
  assert.equal(profile.activeSkillIds.length,5,`${profile.id} must use 5 Active slots`);
  assert.equal(Object.values(profile.allocation).reduce((a,b)=>a+b,0),300,`${profile.id} must use equal 300-point allocation budget`);
  const player=createSwordF6Player(profile);
  assert.equal(player.combatModel,'locked-v1');
  assert.equal(player.combatBuildV117.mainDaoId,'sword');
  assert.equal(player.combatBuildV117.realmOrder,102);
  assert.equal(player.combatBuildV117.learnedDaoPassiveIdsV118.length,8);
  assert.equal(player.skillIds.length,7,'5 Active + Basic + Ultimate');
  assert.equal(player.stats.spiritStandard*player.stats.spiritRegenStandardPctPerSecond/100,2);
}
const source=fs.readFileSync(new URL('../benchmarks/sword-dao-f6-benchmark.js',import.meta.url),'utf8');
assert(source.includes("runCombatKernelV3({registry,seed,entities:[player,target]"),'harness must use production CombatKernel V3');
assert(source.includes("Diagnostic only: does not modify gameplay"),'harness must state non-authoritative diagnostic role');
console.log('SWORD DAO F6 HARNESS CONTRACT: PASS');
