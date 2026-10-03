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

const expectedProfiles={
  burst:{
    allocation:{power:150,body:30,agility:25,spirit:35,sense:60},
    activeSkillIds:['skill.dao.mind.mark','skill.dao.mind.split','skill.dao.mind.chase','skill.dao.mind.burst','skill.dao.mind.flow'],
  },
  echo:{
    allocation:{power:100,body:25,agility:40,spirit:45,sense:90},
    activeSkillIds:['skill.dao.mind.split','skill.dao.mind.chase','skill.dao.mind.burst','skill.dao.mind.observe','skill.dao.mind.flow'],
  },
  interference:{
    allocation:{power:70,body:35,agility:35,spirit:50,sense:110},
    activeSkillIds:['skill.dao.mind.mark','skill.dao.mind.interfere','skill.dao.mind.guard','skill.dao.mind.observe','skill.dao.mind.flow'],
  },
};

for(const profile of MIND_M4_PROFILES){
  assert.deepEqual(profile.allocation,expectedProfiles[profile.id].allocation,`${profile.id} allocation must match the canonical production archetype`);
  assert.deepEqual(profile.activeSkillIds,expectedProfiles[profile.id].activeSkillIds,`${profile.id} loadout must match the canonical production archetype`);
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
assert(source.includes('three canonical production archetypes in MIND_DAO_PRODUCTION_SPEC_V1 section 12'),'harness must declare the canonical archetype source');
assert(source.includes("runCombatKernelV3({registry,seed,entities:[player,target]"),'harness must use production CombatKernel V3');
assert(source.includes('MIND_M4_INVALID_IDENTITY_RUN'),'zero-mechanic runs must be rejected as invalid benchmark evidence');
assert(source.includes("x.data?.mindSnapshot===true"),'Niệm Ảnh contribution must come from real snapshot replay logs');
assert(source.includes("x.skillId==='skill.dao.mind.interfere'"),'Nhiễu profile must measure real interference spend transactions');
assert(source.includes("x.skillId==='skill.dao.mind.burst'"),'Bạo Ấn profile must measure real Burst spend transactions');
assert(source.includes('Number(x.data?.delaySeconds)>0'),'Nhiễu evidence must measure actual post-resistance cast delay, not only casts/spends');
assert(source.includes("x.type==='status'&&['skill.dao.mind.interfere','skill.dao.mind.ultimate'].includes(x.skillId)"),'M4 must measure real Mind control status duration');
assert(source.includes('interferenceMetric=interferenceDelaySeconds+mindControlSeconds'),'M4 must expose one comparable interference/control metric across profiles');
assert(source.includes('beatsOtherProfilesOnInterference'),'M4 must report whether Nhiễu Thức actually leads the interference metric');
assert(source.includes('invalidRuns:invalid.map'),'identity-invalid evidence must be retained in JSON for diagnosis');
const writeAt=source.indexOf('fs.writeFileSync(opts.out');
const failAt=source.indexOf('if(!result.passed) process.exitCode=1');
assert(writeAt>=0&&failAt>writeAt,'CLI must write benchmark evidence before failing an identity-invalid baseline');
assert(source.includes('Diagnostic only: does not modify gameplay or auto-tune coefficients.'),'M4 harness must remain diagnostic-only');

console.log('MIND DAO M4 HARNESS CONTRACT: PASS');
