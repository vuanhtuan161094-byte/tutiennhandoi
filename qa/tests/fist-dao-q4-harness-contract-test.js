import assert from 'node:assert/strict';
import fs from 'node:fs';
import { battleDaoV2MainDamageTuningV129 } from '../../dist/core/battle-dao-v2-runtime.js';
import {
  FIST_Q4_DURATION_SECONDS,
  FIST_Q4_PROFILES,
  FIST_Q4_SEEDS,
  createFistQ4Player,
  validateFistQ4Profiles,
} from '../benchmarks/fist-dao-q4-benchmark.js';

assert.equal(FIST_Q4_DURATION_SECONDS,180);
assert.equal(FIST_Q4_SEEDS.length,12);
assert.deepEqual(validateFistQ4Profiles(),[]);
assert.deepEqual(FIST_Q4_PROFILES.map(x=>x.id),['heavy','chain','counter']);
assert.deepEqual(FIST_Q4_PROFILES.map(x=>x.targetRelativeDps),[[100,100],[92,98],[85,92]]);

for(const profile of FIST_Q4_PROFILES){
  assert.equal(profile.activeSkillIds.length,5,`${profile.id} must use 5 Active slots`);
  assert.equal(Object.values(profile.allocation).reduce((a,b)=>a+b,0),300,`${profile.id} must use equal 300-point allocation budget`);
  const player=createFistQ4Player(profile);
  assert.equal(player.combatModel,'locked-v1');
  assert.equal(player.combatBuildV117.mainDaoId,'fist');
  assert.equal(player.combatBuildV117.realmOrder,102);
  assert.equal(player.combatBuildV117.daoHanhCurrentV129.fist,100);
  assert.equal(battleDaoV2MainDamageTuningV129(player,'fist'),.84);
  assert.equal(player.combatBuildV117.learnedDaoPassiveIdsV118.length,8);
  assert.equal(player.skillIds.length,7,'5 Active + Basic + Ultimate');
  assert.equal(player.stats.spiritStandard*player.stats.spiritRegenStandardPctPerSecond/100,2);
}

const chain=FIST_Q4_PROFILES.find(x=>x.id==='chain');
assert(chain.activeSkillIds.includes('skill.dao.fist.triple'));
assert(chain.activeSkillIds.includes('skill.dao.fist.shock'));
assert(chain.activeSkillIds.includes('skill.dao.fist.chain_heavy'));
const counter=FIST_Q4_PROFILES.find(x=>x.id==='counter');
assert(counter.activeSkillIds.includes('skill.dao.fist.counter'));

const source=fs.readFileSync(new URL('../benchmarks/fist-dao-q4-benchmark.js',import.meta.url),'utf8');
assert(source.includes("runCombatKernelV3({registry,seed,entities:[player,target]"),'harness must use production CombatKernel V3');
assert(source.includes('Diagnostic only: does not modify gameplay'),'harness must state non-authoritative diagnostic role');
for(const metric of ['fistForceGenerated','fistForceSpent','fistPassiveStack','shock_interrupt','counterSuccess','softControlApplications','damageBySkillByActor']){
  assert(source.includes(metric),`missing Q4 metric: ${metric}`);
}
console.log('FIST DAO Q4 HARNESS CONTRACT: PASS');
