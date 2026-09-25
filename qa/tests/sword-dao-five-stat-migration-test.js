import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  CORE_POTENTIAL_AXIS_IDS_V5,
  CORE_POTENTIAL_AXIS_VERSION_V5,
  applyCorePotentialStats,
  cloneLifeCorePotentialState,
  clonePermanentCorePotentialStateV5,
  createLifeCorePotentialState,
  spendLifeCorePotential,
} from '../../dist/core/reincarnation-progression-v1102.js';
import { controlContestDurationMultiplierV5 } from '../../dist/core/combat-rules.js';
import { contestedDodgeChancePctV5, evadeChancePct } from '../../dist/core/stats.js';

let passed=0;
const testCase=(name,fn)=>{fn();passed++;console.log(`✓ ${name}`);};

testCase('F1 old current-life Potential is fully refunded once into the five-axis budget',()=>{
  const old={unspent:10,lifetimeEarned:100,allocations:{power:40,body:30,defense:20},awardedMilestones:['realm.1','realm.2']};
  const migrated=cloneLifeCorePotentialState(old);
  assert.equal(migrated.axisVersion,CORE_POTENTIAL_AXIS_VERSION_V5);
  assert.equal(migrated.lifetimeEarned,100);
  assert.equal(migrated.unspent,100);
  assert.deepEqual(migrated.allocations,{power:0,body:0,agility:0,spirit:0,sense:0});
  assert.deepEqual(migrated.awardedMilestones,['realm.1','realm.2']);
  assert.deepEqual(cloneLifeCorePotentialState(migrated),migrated,'five-axis state must not refund twice');
});

testCase('F1 old permanent Potential is fully refunded once',()=>{
  const old={unspent:5,lifetimeEarned:80,allocations:{power:25,body:25,defense:25}};
  const migrated=clonePermanentCorePotentialStateV5(old);
  assert.equal(migrated.axisVersion,5);
  assert.equal(migrated.lifetimeEarned,80);
  assert.equal(migrated.unspent,80);
  assert.deepEqual(migrated.allocations,{power:0,body:0,agility:0,spirit:0,sense:0});
  assert.deepEqual(clonePermanentCorePotentialStateV5(migrated),migrated);
});

testCase('F1 five allocation ids are exact and old Defense can no longer be spent',()=>{
  assert.deepEqual(CORE_POTENTIAL_AXIS_IDS_V5,['power','body','agility','spirit','sense']);
  let state={...createLifeCorePotentialState(),unspent:5,lifetimeEarned:5};
  for(const id of CORE_POTENTIAL_AXIS_IDS_V5) state=spendLifeCorePotential(state,id,1);
  assert.deepEqual(state.allocations,{power:1,body:1,agility:1,spirit:1,sense:1});
  assert.throws(()=>spendLifeCorePotential({...state,unspent:1,lifetimeEarned:6},'defense',1),/không hợp lệ/i);
});

testCase('F2 each Potential point contributes only its authored axis effect with no shared resonance',()=>{
  const base={attack:100,defense:50,physique:10,maxHp:200,maxSpirit:30,mobility:20,accuracy:15,controlPower:10,resolve:12};
  const life={...createLifeCorePotentialState(),unspent:0,lifetimeEarned:20,allocations:{power:2,body:3,agility:4,spirit:5,sense:6}};
  const got=applyCorePotentialStats(base,{life,permanent:{power:0,body:0,agility:0,spirit:0,sense:0}});
  assert.equal(got.attack,102);
  assert.equal(got.defense,53);
  assert.equal(got.physique,13);
  assert.equal(got.maxHp,260);
  assert.equal(got.mobility,24);
  assert.equal(got.maxSpirit,35);
  assert.equal(got.accuracy,21);
  assert.equal(got.controlPower,16);
  assert.equal(got.resolve,18);
});

testCase('F2 Dodge uses Mobility vs Accuracy plus direct Dodge to a 75% hard cap',()=>{
  assert.equal(evadeChancePct(100,100,0),15);
  assert.equal(Number(contestedDodgeChancePctV5(100,100,10,0).toFixed(6)),23);
  assert(contestedDodgeChancePctV5(1e9,1,100,0)<=75);
  assert(contestedDodgeChancePctV5(1,1e9,0,99)>=2);
});

testCase('F2 Control vs Resolve keeps equal ratings neutral and pressure bounded',()=>{
  assert.equal(Number(controlContestDurationMultiplierV5(100,100,0).toFixed(6)),1);
  assert(controlContestDurationMultiplierV5(300,100,0)>1);
  assert(controlContestDurationMultiplierV5(100,300,0)<1);
  assert(controlContestDurationMultiplierV5(100,100,2)<1);
  assert(controlContestDurationMultiplierV5(1e9,1,0)<=1.65);
  assert(controlContestDurationMultiplierV5(0,1e9,0)>=0.35);
});

testCase('F2 locked combat source consumes the new Dodge and Control contest helpers',()=>{
  const src=fs.readFileSync(new URL('../../dist/core/combat.js',import.meta.url),'utf8');
  assert(src.includes('contestedDodgeChancePctV5(dstStats.mobility, srcStats.accuracy'));
  assert(src.includes('duration *= controlContestDurationMultiplierV5(src.controlPower, dst.resolve, pressure)'));
  assert(src.includes('target.controlPressure[pressureKey] = pressure + 1'));
  assert(src.includes('target.dodgePressure += 1'));
});

console.log(`\nSWORD DAO F FIVE-STAT MIGRATION: ${passed}/${passed} PASS`);
