import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import {
  BODY_B5_DURATION_SECONDS,
  BODY_B5_PROFILES,
  BODY_B5_SEEDS,
  createBodyB5Player,
  createBodyB5Target,
  validateBodyB5Profiles,
} from '../benchmarks/body-dao-b5-benchmark.js';

assert.equal(BODY_B5_DURATION_SECONDS,180);
assert.equal(BODY_B5_SEEDS.length,12);
assert.deepEqual(validateBodyB5Profiles(),[]);
assert.deepEqual(BODY_B5_PROFILES.map(x=>x.id),['counter','immovable','break']);

for(const profile of BODY_B5_PROFILES){
  assert.equal(profile.activeSkillIds.length,5,`${profile.id} must use exactly 5 Active slots`);
  assert.equal(Object.values(profile.allocation).reduce((a,b)=>a+b,0),300,`${profile.id} must use equal 300-point allocation budget`);
  const player=createBodyB5Player(profile);
  assert.equal(player.combatModel,'locked-v1');
  assert.equal(player.combatBuildV117.mainDaoId,'body');
  assert.equal(player.combatBuildV117.realmOrder,102);
  assert.equal(player.combatBuildV117.learnedDaoPassiveIdsV118.length,8);
  assert.equal(player.skillIds.length,7,'5 Active + Basic + Ultimate');
  assert.equal(Object.keys(player.combatBuildV117.skillPracticeTierV125).length,10,'all ten Body skills must use the same 1000 mastery benchmark state');
  assert(Object.values(player.combatBuildV117.skillPracticeTierV125).every(x=>x===1000));
}

const target=createBodyB5Target();
assert(target.skillIds.includes('skill.boss.v81.crushing_slam'));
assert(target.skillIds.includes('skill.boss.v81.cataclysm'));

// Production Body reactions are governed by targetIsCasting in Auto. They must
// not also require the unrelated encounter-script activeCounterWindow gate.
const registry=buildRegistry();
assert.equal(registry.skills.get('skill.dao.body.transform').runtimeV117.requiresCounterWindow,false);
assert.equal(registry.skills.get('skill.dao.body.counter').runtimeV117.requiresCounterWindow,false);

const source=fs.readFileSync(new URL('../benchmarks/body-dao-b5-benchmark.js',import.meta.url),'utf8');
assert(source.includes("runCombatKernelV3({registry,seed,entities:[player,target]"),'harness must use production CombatKernel V3');
assert(source.includes('BODY_B5_INVALID_IDENTITY_RUN'),'zero-mechanic runs must be rejected as invalid benchmark evidence');
assert(source.includes("damageLogsFor(logs,playerId,'skill.dao.body.counter')"),'Phản Kình must measure real Counter damage hits');
assert(source.includes("x.skillId==='skill.dao.body.immovable'"),'Bất Động must measure completed defensive channels');
assert(source.includes("x.data?.broken===true"),'Phá Kình must measure real Broken events');
assert(source.includes('postBreakPayoffs'),'Phá Kình must require a payoff inside the Broken window');
assert(source.includes('Diagnostic only: does not modify gameplay or auto-tune coefficients.'),'B5 harness must remain diagnostic-only');
assert(source.includes('B5 records baseline identity and relative DPS only.'),'B5 must not invent tuning bands before baseline evidence');

console.log('BODY DAO B5 HARNESS CONTRACT: PASS');
