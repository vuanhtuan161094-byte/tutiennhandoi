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
  syncPrimaryStatsV5FromDerivedV5,
} from '../../dist/core/reincarnation-progression-v1102.js';
import { COMBAT_RULES, controlContestDurationMultiplierV5, fiveStatSkillPowerV5 } from '../../dist/core/combat-rules.js';
import { contestedDodgeChancePctV5, evadeChancePct } from '../../dist/core/stats.js';
import { scalePvpEntityV91 } from '../../dist/core/pvp-v91.js';
import { battleDaoSkillsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';

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

testCase('F1 migration never invents Potential beyond lifetimeEarned authority',()=>{
  const forgedOld={unspent:999,lifetimeEarned:12,allocations:{power:500,body:500,defense:500}};
  const migrated=cloneLifeCorePotentialState(forgedOld);
  assert.equal(migrated.lifetimeEarned,12);
  assert.equal(migrated.unspent,12);
  assert.deepEqual(migrated.allocations,{power:0,body:0,agility:0,spirit:0,sense:0});
  const forgedV5={axisVersion:5,unspent:999,lifetimeEarned:7,allocations:{power:5,body:5,agility:5,spirit:5,sense:5}};
  const canonical=clonePermanentCorePotentialStateV5(forgedV5);
  assert.equal(canonical.lifetimeEarned,7);
  assert.equal(Object.values(canonical.allocations).reduce((a,b)=>a+b,0)+canonical.unspent,7);
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
  assert.deepEqual(got.primaryStatsV5,{power:102,body:13,agility:24,spirit:35,sense:21});
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


testCase('F4 Control Pressure resets after exactly 8 seconds of no same-group control',()=>{
  assert.equal(COMBAT_RULES.controlPressureResetSeconds,8);
  const src=fs.readFileSync(new URL('../../dist/core/combat.js',import.meta.url),'utf8');
  assert(src.includes('now - lastPressureAt >= COMBAT_RULES.controlPressureResetSeconds ? 0'));
  assert(src.includes('target.controlPressureLastAt[pressureKey] = now'));
});

testCase('F3 Sword has exactly the locked 10 five-stat scaling profiles',()=>{
  const expected=new Map([
    ['skill.dao.sword.basic',{scaling:{power:2.70},baseline:1.00}],
    ['skill.dao.sword.flow_slash',{scaling:{power:1.35,agility:.50},baseline:1.55}],
    ['skill.dao.sword.nurture',{scaling:{power:1.50},baseline:.45}],
    ['skill.dao.sword.break_mark',{scaling:{power:2.10,sense:.90},baseline:1.35}],
    ['skill.dao.sword.chain',{scaling:{power:1.00,agility:.75},baseline:2.16}],
    ['skill.dao.sword.counter',{scaling:{power:1.20,agility:.50},baseline:1.80}],
    ['skill.dao.sword.sever',{scaling:{power:3.00},baseline:2.20}],
    ['skill.dao.sword.finisher',{scaling:{power:3.00},baseline:2.45}],
    ['skill.dao.sword.myriad',{scaling:{power:1.60,sense:2.00},baseline:3.72}],
    ['skill.dao.sword.ultimate',{scaling:{power:3.00},baseline:6.80}],
  ]);
  const sword=battleDaoSkillsV118.filter(x=>x.runtimeV117?.daoBinding==='sword');
  assert.equal(sword.length,10);
  for(const skill of sword){
    const e=expected.get(skill.id);
    assert(e,`unexpected Sword skill ${skill.id}`);
    assert.deepEqual(skill.fiveStatScalingV5,e.scaling,`${skill.id} scaling mismatch`);
    assert.equal(skill.fiveStatBaselineCoefficientV5,e.baseline,`${skill.id} baseline mismatch`);
  }
  const nonSword=battleDaoSkillsV118.filter(x=>x.runtimeV117?.daoBinding!=='sword');
  assert(nonSword.every(x=>x.fiveStatScalingV5===undefined),'F3 must not migrate the other seven Dao');
});

testCase('F3 normalized five-stat power reproduces contract totals at baseline hit shape',()=>{
  const stats={attack:999,mobility:999,accuracy:999,primaryStatsV5:{power:100,body:50,agility:80,spirit:60,sense:70}};
  const flow=battleDaoSkillsV118.find(x=>x.id==='skill.dao.sword.flow_slash');
  const flowPower=fiveStatSkillPowerV5(stats,flow.fiveStatScalingV5,flow.fiveStatBaselineCoefficientV5);
  assert.equal(Number((flowPower*1.55).toFixed(6)),175); // 1.35*100 + .50*80
  const myriad=battleDaoSkillsV118.find(x=>x.id==='skill.dao.sword.myriad');
  const myriadPower=fiveStatSkillPowerV5(stats,myriad.fiveStatScalingV5,myriad.fiveStatBaselineCoefficientV5);
  assert.equal(Number((myriadPower*.62*6).toFixed(6)),300); // 1.60*100 + 2.00*70
  const ultimate=battleDaoSkillsV118.find(x=>x.id==='skill.dao.sword.ultimate');
  const ultPower=fiveStatSkillPowerV5(stats,ultimate.fiveStatScalingV5,ultimate.fiveStatBaselineCoefficientV5);
  assert.equal(Number((ultPower*6.8).toFixed(6)),300);
});

testCase('F3 CombatKernel consumes primaryStatsV5 scaling for root and bounded follow-up hits',()=>{
  const src=fs.readFileSync(new URL('../../dist/core/combat.js',import.meta.url),'utf8');
  assert(src.includes('fiveStatSkillPowerV5(srcStats, ctx.fiveStatScalingV5, ctx.fiveStatBaselineCoefficientV5)'));
  assert(src.includes('fiveStatScalingV5: skill?.fiveStatScalingV5'));
  assert(src.includes('fiveStatScalingV5: sourceSkill?.fiveStatScalingV5'));
});


testCase('F1 legacy potential compatibility shell delegates to five-axis authority',async()=>{
  const legacy=await import('../../dist/core/potential.js');
  assert.deepEqual(legacy.potentialAttributeDefinitions.map(x=>x.id),['power','body','agility','spirit','sense']);
  const migrated=legacy.clonePotentialState({lifetimeEarned:9,unspent:2,allocations:{power:3,body:2,defense:2}});
  assert.equal(migrated.axisVersion,5);
  assert.equal(migrated.unspent,9);
  assert.deepEqual(migrated.allocations,{power:0,body:0,agility:0,spirit:0,sense:0});
  const payload=legacy.legacyPotentialMigrationPayloadV127({lifetimeEarned:9,unspent:999,allocations:{power:999}});
  assert.equal(payload.refundedUnspent,9);
  assert.equal(payload.migratedTotal,9);
});


testCase('F5 PvP synthetic scaling preserves five-stat Sword damage parity',()=>{
  const base={
    id:'pvp.f5.base',name:'F5',combatModel:'locked-v1',tags:['Sword'],
    stats:{
      attack:100,defense:100,maxHp:2000,maxSpirit:100,mobility:100,accuracy:100,controlPower:100,resolve:100,
      primaryStatsV5:{power:100,body:100,agility:100,spirit:100,sense:100},
    },
    skillIds:[],triggers:[],aiProfile:{name:'none',rules:[]},
  };
  const scaled=scalePvpEntityV91(base,1.44,'pvp.f5.scaled','F5 scaled');
  assert.equal(Number(scaled.stats.primaryStatsV5.power.toFixed(6)),144);
  assert.equal(Number(scaled.stats.primaryStatsV5.body.toFixed(6)),144);
  assert.equal(Number(scaled.stats.primaryStatsV5.agility.toFixed(6)),144);
  assert.equal(Number(scaled.stats.primaryStatsV5.sense.toFixed(6)),144);
  assert.equal(Number(scaled.stats.primaryStatsV5.spirit.toFixed(6)),120);
  const profiles=[
    [{power:3.0},1],
    [{power:1.35,agility:.50},1],
    [{power:1.60,sense:2.00},1],
  ];
  for(const [scaling,baseline] of profiles){
    const before=fiveStatSkillPowerV5(base.stats,scaling,baseline);
    const after=fiveStatSkillPowerV5(scaled.stats,scaling,baseline);
    assert.equal(Number((after/before).toFixed(6)),1.44);
  }
});


testCase('F5 canonical player bridge keeps legacy CL/TP/TPH/LL progression without minting TT from Accuracy',()=>{
  const synced=syncPrimaryStatsV5FromDerivedV5({
    attack:180,physique:70,mobility:95,maxSpirit:140,accuracy:260,controlPower:210,resolve:190,
    primaryStatsV5:{power:100,body:50,agility:60,spirit:80,sense:75},
  });
  assert.deepEqual(synced.primaryStatsV5,{power:180,body:70,agility:95,spirit:140,sense:75});
  const flow=fiveStatSkillPowerV5(synced,{power:1.35,agility:.50},1);
  assert.equal(Number(flow.toFixed(6)),290.5);
  const myriad=fiveStatSkillPowerV5(synced,{power:1.60,sense:2.00},1);
  assert.equal(Number(myriad.toFixed(6)),438);
  assert.notEqual(synced.primaryStatsV5.sense,synced.accuracy,'direct Accuracy must not become TT');
});

testCase('F5 canonical player factory synchronizes five-stat snapshot after Alchemy and all legacy stat layers',()=>{
  const src=fs.readFileSync(new URL('../../dist/core/combat-kernel-v2.js',import.meta.url),'utf8');
  const alchemyAt=src.indexOf('const finalEntity = applyAlchemyStatBonuses');
  const syncAt=src.indexOf('syncPrimaryStatsV5FromDerivedV5(finalEntity.stats)');
  assert(alchemyAt>=0&&syncAt>alchemyAt,'five-stat bridge must run after the final legacy player stat layer');
});


testCase('F5 runtime Attack multipliers still scale the full hybrid Sword skill without minting TPH or TT',()=>{
  const base={
    attack:100,
    primaryStatsV5:{power:100,body:60,agility:80,spirit:90,sense:70},
  };
  const buffed={...base,attack:118};
  const flowBase=fiveStatSkillPowerV5(base,{power:1.35,agility:.50},1.55)*1.55;
  const flowBuffed=fiveStatSkillPowerV5(buffed,{power:1.35,agility:.50},1.55)*1.55;
  assert.equal(Number(flowBase.toFixed(6)),175);
  assert.equal(Number(flowBuffed.toFixed(6)),206.5);
  const myriadBase=fiveStatSkillPowerV5(base,{power:1.60,sense:2.00},3.72)*3.72;
  const myriadBuffed=fiveStatSkillPowerV5(buffed,{power:1.60,sense:2.00},3.72)*3.72;
  assert.equal(Number(myriadBase.toFixed(6)),300);
  assert.equal(Number(myriadBuffed.toFixed(6)),354);
  assert.equal(buffed.primaryStatsV5.agility,80);
  assert.equal(buffed.primaryStatsV5.sense,70);
});

console.log(`\nSWORD DAO F FIVE-STAT MIGRATION: ${passed}/${passed} PASS`);
