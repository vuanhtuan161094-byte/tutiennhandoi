import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MIND_M4_DURATION_SECONDS,
  MIND_M4_PROFILES,
  MIND_M4_SEEDS,
  createMindM4Player,
  validateMindM4Profiles,
} from '../benchmarks/mind-dao-m4-benchmark.js';

assert.equal(MIND_M4_DURATION_SECONDS,180);
assert.equal(MIND_M4_SEEDS.length,12);
assert.deepEqual(validateMindM4Profiles(),[]);
assert.deepEqual(MIND_M4_PROFILES.map(x=>x.id),['burst','echo','interference']);

for(const profile of MIND_M4_PROFILES){
  assert.equal(profile.activeSkillIds.length,5,`${profile.id} must use exactly 5 Active slots`);
  assert.equal(Object.values(profile.allocation).reduce((a,b)=>a+b,0),300,`${profile.id} must use equal 300-point allocation budget`);
  const player=createMindM4Player(profile);
  assert.equal(player.combatModel,'locked-v1');
  assert.equal(player.combatBuildV117.mainDaoId,'mind');
  assert.equal(player.combatBuildV117.realmOrder,102);
  assert.equal(player.combatBuildV117.learnedDaoPassiveIdsV118.length,8);
  assert.equal(player.skillIds.length,7,'5 Active + Basic + Ultimate');
  assert.equal(Object.keys(player.combatBuildV117.skillPracticeTierV125).length,10,'all ten Mind skills must use the same 1000 mastery benchmark state');
  assert(Object.values(player.combatBuildV117.skillPracticeTierV125).every(x=>x===1000));
}

const source=fs.readFileSync(new URL('../benchmarks/mind-dao-m4-benchmark.js',import.meta.url),'utf8');
assert(source.includes("runCombatKernelV3({registry,seed,entities:[player,target]"),'harness must use production CombatKernel V3');
assert(source.includes('MIND_M4_INVALID_IDENTITY_RUN'),'zero-mechanic runs must be rejected as invalid benchmark evidence');
assert(source.includes("x.data?.mindSnapshot===true"),'Niệm Ảnh contribution must come from real snapshot replay logs');
assert(source.includes("x.skillId==='skill.dao.mind.interfere'"),'Nhiễu profile must measure real interference spend transactions');
assert(source.includes("x.skillId==='skill.dao.mind.burst'"),'Bạo Ấn profile must measure real Burst spend transactions');
assert(source.includes('Diagnostic only: does not modify gameplay or auto-tune coefficients.'),'M4 harness must remain diagnostic-only');

console.log('MIND DAO M4 HARNESS CONTRACT: PASS');
