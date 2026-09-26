import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { battleDaoSkillsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';
import { createBattleDaoRuntimeStateV2, createRootActionV2, finishFistCoreActionV2, finishRemainingDaoActionV2, fistPassiveDefensePctV2, fistV2ActionTuning, fistV2EffectsForSkill, prepareFistCoreActionV2, remainingDaoPassiveBonusesV2 } from '../../dist/core/battle-dao-v2-runtime.js';
import { effectiveStats } from '../../dist/core/stats.js';
import { ensurePrimaryStatsV5SnapshotV5, fiveStatSkillPowerV5 } from '../../dist/core/combat-rules.js';
import { scalePvpEntityV91 } from '../../dist/core/pvp-v91.js';
import { buildHuntCombatProfileV130 } from '../../dist/core/hunt-real-combat-v130.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import { canUseBattleDaoSkillV118 } from '../../dist/core/battle-dao-combat-v118.js';
import { tacticalIdentity } from '../../dist/core/combat-roles.js';
import { FIST_Q1_PROFILES, validateFistQ1Profiles } from '../benchmarks/fist-dao-q1-premigration-benchmark.js';

let passed=0;
function testCase(name,fn){fn();passed++;console.log('✓',name);}

function entity({level=20,stacks=20}={}){
  const e={
    id:'fist.q1',name:'Quyền Q1',tags:[],combatModel:'locked-v1',
    baseStats:{
      attack:100,defense:100,maxHp:2000,physique:100,maxSpirit:100,
      mobility:100,accuracy:100,resolve:100,controlPower:100,actionSpeed:1,
      dodgeChancePct:0,heartChancePct:0,critChancePct:0,critPowerPerLayer:.5,
      primaryStatsV5:{power:100,body:100,agility:100,spirit:100,sense:100},
    },
    statuses:[],breakDebuffUntil:0,
    combatBuildV117:{
      battleDaoV2Enabled:true,
      mainDaoId:'fist',
      learnedDaoPassiveIdsV118:['passive.v2.fist.p1','passive.v2.fist.p4'],
      passiveLevelsV125:{'passive.v2.fist.p1':20,'passive.v2.fist.p4':level},
      activeSetMechanics:[],
    },
  };
  e.battleDaoStateV2=createBattleDaoRuntimeStateV2(e,0);
  e.battleDaoStateV2.fist.stack.stacks=stacks;
  e.battleDaoStateV2.fist.stack.expiresAt=999;
  return e;
}

testCase('Q1 Hùng Kình Hộ Thể Lv20 grants +0.50% Defense per Liên Kình',()=>{
  const e=entity({level:20,stacks:20});
  assert.equal(fistPassiveDefensePctV2(e,0),10);
  const s=effectiveStats(e,buildRegistry(),0);
  assert.equal(Number(s.defense.toFixed(6)),110);
  assert.equal(s.attack,100);
  assert.equal(s.mobility,100);
});

testCase('Q1 Hùng Kình Hộ Thể Lv1 grants +0.15% Defense per Liên Kình',()=>{
  const e=entity({level:1,stacks:20});
  assert.equal(Number(fistPassiveDefensePctV2(e,0).toFixed(6)),3);
  assert.equal(Number(effectiveStats(e,buildRegistry(),0).defense.toFixed(6)),103);
});

testCase('Q1 p4 has no Defense bonus without Liên Kình',()=>{
  const e=entity({level:20,stacks:0});
  assert.equal(fistPassiveDefensePctV2(e,0),0);
  assert.equal(effectiveStats(e,buildRegistry(),0).defense,100);
});

testCase('Q1 player-facing Fist skill copy uses Quyền Thế, not stale Liên Quyền',()=>{
  const fist=battleDaoSkillsV118.filter(x=>x.runtimeV117?.daoBinding==='fist');
  assert.equal(fist.length,10);
  assert(fist.some(x=>String(x.description).includes('Quyền Thế')));
  assert.equal(fist.filter(x=>String(x.description).includes('Liên Quyền')).length,0);
});


testCase('Q1 pre-migration benchmark profiles are deterministic five-slot 300-point fixtures',()=>{
  assert.equal(FIST_Q1_PROFILES.length,3);
  assert.deepEqual(validateFistQ1Profiles(),[]);
  for(const p of FIST_Q1_PROFILES){
    assert.equal(p.activeSkillIds.length,5);
    assert.equal(Object.values(p.allocation).reduce((a,b)=>a+b,0),300);
  }
});


const EXPECTED_Q2_SCALING=new Map([
 ['skill.dao.fist.basic',{scaling:{power:2.20,body:.60},baseline:2.80}],
 ['skill.dao.fist.triple',{scaling:{power:1.20,agility:1.40},baseline:2.60}],
 ['skill.dao.fist.shock',{scaling:{power:1.50,agility:.90},baseline:2.40}],
 ['skill.dao.fist.nurture',{scaling:{power:.70,body:.80},baseline:1.50}],
 ['skill.dao.fist.heavy',{scaling:{power:1.70,body:1.50},baseline:3.20}],
 ['skill.dao.fist.counter',{scaling:{power:1.20,body:.80,agility:.80},baseline:2.80}],
 ['skill.dao.fist.chain_heavy',{scaling:{power:1.10,agility:1.50},baseline:2.60}],
 ['skill.dao.fist.pressure',{scaling:{power:1.50,body:1.20},baseline:2.70}],
 ['skill.dao.fist.finisher',{scaling:{power:1.80,body:1.40},baseline:3.20}],
 ['skill.dao.fist.ultimate',{scaling:{power:2.00,body:1.50},baseline:3.50}],
]);

testCase('Q2 all ten Fist skills carry the locked five-stat family map',()=>{
 const fist=battleDaoSkillsV118.filter(x=>x.runtimeV117?.daoBinding==='fist');
 assert.equal(fist.length,10);
 for(const skill of fist){
   const expected=EXPECTED_Q2_SCALING.get(skill.id);
   assert(expected,`missing expected map for ${skill.id}`);
   assert.deepEqual(skill.fiveStatScalingV5,expected.scaling);
   assert.equal(skill.fiveStatBaselineCoefficientV5,expected.baseline);
   assert.equal(skill.fiveStatScalingV5.spirit,undefined);
   assert.equal(skill.fiveStatScalingV5.sense,undefined);
 }
});

testCase('Q2 CL/TP/TPH identities actually affect only their authored Fist families',()=>{
 const byId=Object.fromEntries(battleDaoSkillsV118.filter(x=>x.runtimeV117?.daoBinding==='fist').map(x=>[x.id,x]));
 const base={attack:100,primaryStatsV5:{power:100,body:100,agility:100,spirit:100,sense:100}};
 const heavy=byId['skill.dao.fist.heavy'],triple=byId['skill.dao.fist.triple'];
 const heavyBase=fiveStatSkillPowerV5(base,heavy.fiveStatScalingV5,heavy.fiveStatBaselineCoefficientV5);
 const heavyBody=fiveStatSkillPowerV5({...base,primaryStatsV5:{...base.primaryStatsV5,body:160}},heavy.fiveStatScalingV5,heavy.fiveStatBaselineCoefficientV5);
 const heavyAgi=fiveStatSkillPowerV5({...base,primaryStatsV5:{...base.primaryStatsV5,agility:160}},heavy.fiveStatScalingV5,heavy.fiveStatBaselineCoefficientV5);
 assert(heavyBody>heavyBase); assert.equal(heavyAgi,heavyBase);
 const tripleBase=fiveStatSkillPowerV5(base,triple.fiveStatScalingV5,triple.fiveStatBaselineCoefficientV5);
 const tripleAgi=fiveStatSkillPowerV5({...base,primaryStatsV5:{...base.primaryStatsV5,agility:160}},triple.fiveStatScalingV5,triple.fiveStatBaselineCoefficientV5);
 const tripleBody=fiveStatSkillPowerV5({...base,primaryStatsV5:{...base.primaryStatsV5,body:160}},triple.fiveStatScalingV5,triple.fiveStatBaselineCoefficientV5);
 assert(tripleAgi>tripleBase); assert.equal(tripleBody,tripleBase);
});

function q2Entity(skillId,tier=1000,force=0){
 const e=entity({level:20,stacks:20});
 e.combatBuildV117.learnedDaoPassiveIdsV118=['passive.v2.fist.p1','passive.v2.fist.p4'];
 e.combatBuildV117.skillPracticeTierV125={[skillId]:tier};
 e.battleDaoStateV2.fist.core.fistForce=force;
 return e;
}
function q2Action(e,skill){
 const action={effectBonusPct:0,breakBonusPct:0,recoveryMultiplier:1,battleDaoV2:createRootActionV2(e,skill,1)};
 return action;
}

testCase('Q2 Trọng Thế snapshots full start force and only authored payoff skills consume it',()=>{
 const byId=Object.fromEntries(battleDaoSkillsV118.filter(x=>x.runtimeV117?.daoBinding==='fist').map(x=>[x.id,x]));
 const target={id:'target',breakDebuffUntil:0};
 const heavy=byId['skill.dao.fist.heavy'];
 const e=q2Entity(heavy.id,1000,5),a=q2Action(e,heavy);
 assert.equal(prepareFistCoreActionV2(e,target,heavy,a,0),3);
 assert.equal(a.battleDaoV2.fistForceBefore,5);
 assert.equal(a.battleDaoV2.fistHeavyPayoff,true);
 assert.equal(a.effectBonusPct,50); // 5*3 + 35
 assert.equal(a.breakBonusPct,55); // 5*4 + 35
 assert.equal(e.battleDaoStateV2.fist.core.fistForce,2);
 const chain=byId['skill.dao.fist.chain_heavy'];
 const e2=q2Entity(chain.id,1000,5),a2=q2Action(e2,chain);
 assert.equal(prepareFistCoreActionV2(e2,target,chain,a2,0),0);
 assert.equal(a2.battleDaoV2.fistHeavyPayoff,undefined);
 assert.equal(a2.effectBonusPct,15);
 assert.equal(a2.breakBonusPct,20);
 assert.equal(e2.battleDaoStateV2.fist.core.fistForce,5);
});

testCase('Q2 resource gates and Cực Ý pressure/finisher spend obey Quyền Thế authority',()=>{
 const byId=Object.fromEntries(battleDaoSkillsV118.filter(x=>x.runtimeV117?.daoBinding==='fist').map(x=>[x.id,x]));
 const heavy=byId['skill.dao.fist.heavy'],fin=byId['skill.dao.fist.finisher'],pressure=byId['skill.dao.fist.pressure'];
 const low=q2Entity(heavy.id,1000,1);
 assert.equal(canUseBattleDaoSkillV118(low,heavy),false);
 low.battleDaoStateV2.fist.core.fistForce=2;
 assert.equal(canUseBattleDaoSkillV118(low,heavy),true);
 assert.equal(canUseBattleDaoSkillV118(q2Entity(fin.id,1000,0),fin),false);
 const pe=q2Entity(pressure.id,1000,5),pa=q2Action(pe,pressure);
 assert.equal(prepareFistCoreActionV2(pe,{id:'t',breakDebuffUntil:0},pressure,pa,0),2);
 const fe=q2Entity(fin.id,1000,5),fa=q2Action(fe,fin);
 assert.equal(prepareFistCoreActionV2(fe,{id:'t',breakDebuffUntil:0},fin,fa,0),5);
});

testCase('Q2 mastery effects produce authored Fist hit packages',()=>{
 const byId=Object.fromEntries(battleDaoSkillsV118.filter(x=>x.runtimeV117?.daoBinding==='fist').map(x=>[x.id,x]));
 const heavy=byId['skill.dao.fist.heavy'];
 const e=q2Entity(heavy.id,1000,5),a=q2Action(e,heavy);
 prepareFistCoreActionV2(e,{id:'t',breakDebuffUntil:0},heavy,a,0);
 const effects=fistV2EffectsForSkill(e,heavy,a,()=>false);
 assert.equal(effects.filter(x=>x.type==='damage').length,2);
 assert.deepEqual(effects.filter(x=>x.type==='damage').map(x=>x.coefficient),[2.65,1.30]);
 const fin=byId['skill.dao.fist.finisher'];
 const fe=q2Entity(fin.id,1000,5),fa=q2Action(fe,fin);
 prepareFistCoreActionV2(fe,{id:'t',breakDebuffUntil:1},fin,fa,0);
 const tune=fistV2ActionTuning(fe,fin,{breakDebuffUntil:1},fa);
 assert.equal(tune.extraEffectBonusPct,20);
 assert.equal(tune.extraArmorPenPct,15);
 assert.equal(tune.critHeartPowerMultiplier,1.5);
});

testCase('Q2 Cửu Thiên Quyền Vực opens cap 7 and grants one extra root generation while active',()=>{
 const ult=battleDaoSkillsV118.find(x=>x.id==='skill.dao.fist.ultimate');
 const e=q2Entity(ult.id,1000,5),a=q2Action(e,ult);
 prepareFistCoreActionV2(e,{id:'t',breakDebuffUntil:0},ult,a,0);
 a.battleDaoV2.directDamagingHitCount=1;
 const opened=finishFistCoreActionV2(e,ult,a,1);
 assert.equal(opened.openedDomain,true); assert.equal(opened.fistForceCap,7); assert.equal(e.battleDaoStateV2.fist.core.fistForce,0);
 const basic=battleDaoSkillsV118.find(x=>x.id==='skill.dao.fist.basic');
 e.combatBuildV117.skillPracticeTierV125={[basic.id]:0};
 const ba=q2Action(e,basic);
 prepareFistCoreActionV2(e,{id:'t',breakDebuffUntil:0},basic,ba,2);
 ba.battleDaoV2.directDamagingHitCount=1;
 const after=finishFistCoreActionV2(e,basic,ba,2);
 assert.equal(after.requestedGain,2);
 assert.equal(e.battleDaoStateV2.fist.core.fistForce,2);
});

testCase('Q2 Hồi Thân payoff requires a successful timing counter, not merely a landed cast',()=>{
 const counter=battleDaoSkillsV118.find(x=>x.id==='skill.dao.fist.counter');

 const miss=q2Entity(counter.id,1000,0),missAction=q2Action(miss,counter);
 prepareFistCoreActionV2(miss,{id:'idle',breakDebuffUntil:0},counter,missAction,0);
 const missEffects=fistV2EffectsForSkill(miss,counter,missAction,()=>false);
 assert.equal(missEffects.find(x=>x.type==='damage').coefficient,1.75);
 missAction.battleDaoV2.directDamagingHitCount=1;
 const missFinish=finishFistCoreActionV2(miss,counter,missAction,0);
 assert.equal(missAction.battleDaoV2.fistCounterSucceeded,false);
 assert.equal(missFinish.requestedGain,0);
 assert.equal(miss.battleDaoStateV2.fist.core.fistForce,0);

 const hit=q2Entity(counter.id,1000,0),hitAction=q2Action(hit,counter);
 prepareFistCoreActionV2(hit,{id:'casting',breakDebuffUntil:0,casting:{skillId:'skill.basic_strike'}},counter,hitAction,0);
 const hitEffects=fistV2EffectsForSkill(hit,counter,hitAction,()=>false);
 assert.equal(Number(hitEffects.find(x=>x.type==='damage').coefficient.toFixed(6)),2.1);
 hitAction.battleDaoV2.directDamagingHitCount=1;
 const hitFinish=finishFistCoreActionV2(hit,counter,hitAction,0);
 assert.equal(hitAction.battleDaoV2.fistCounterSucceeded,true);
 assert.equal(hitFinish.requestedGain,3);
 assert.equal(hit.battleDaoStateV2.fist.core.fistForce,3);
});

testCase('Q2 Liên Kình p8 peak hold is refreshed by damaging roots, never by passive/stat reads',()=>{
 const basic=battleDaoSkillsV118.find(x=>x.id==='skill.dao.fist.basic');
 const e=q2Entity(basic.id,0,0);
 e.combatBuildV117.learnedDaoPassiveIdsV118=['passive.v2.fist.p1','passive.v2.fist.p8'];
 e.combatBuildV117.passiveLevelsV125={'passive.v2.fist.p1':20,'passive.v2.fist.p8':20};
 e.battleDaoStateV2.fist.stack.stacks=e.battleDaoStateV2.fist.stack.cap;
 e.battleDaoStateV2.fist.stack.expiresAt=10.5;
 e.battleDaoStateV2.fist.stack.nextDecayAt=11.5;

 const bonuses=remainingDaoPassiveBonusesV2(e,10);
 assert(bonuses.directDamagePct>0);
 assert.equal(e.battleDaoStateV2.fist.stack.expiresAt,10.5);
 assert.equal(e.battleDaoStateV2.fist.stack.nextDecayAt,11.5);

 const action=q2Action(e,basic);
 action.battleDaoV2.directDamagingHitCount=1;
 finishRemainingDaoActionV2(e,{id:'target',hp:100,baseStats:{maxHp:100}},basic,action,10,()=>false);
 assert.equal(e.battleDaoStateV2.fist.stack.expiresAt,12);
 assert.equal(e.battleDaoStateV2.fist.stack.nextDecayAt,undefined);
});

testCase('Q2 tactical metadata exposes Chấn Mạch interrupt/control and Trấn Nhạc soft-control setup',()=>{
 const registry=buildRegistry();
 const shock=registry.skill('skill.dao.fist.shock');
 const pressure=registry.skill('skill.dao.fist.pressure');
 const counter=registry.skill('skill.dao.fist.counter');
 const shockRoles=tacticalIdentity(shock,registry).roles;
 const pressureRoles=tacticalIdentity(pressure,registry).roles;
 const counterRoles=tacticalIdentity(counter,registry).roles;
 assert(shockRoles.includes('Interrupt'));
 assert(shockRoles.includes('Control'));
 assert(shockRoles.includes('Break'));
 assert(pressureRoles.includes('Control'));
 assert(pressureRoles.includes('Setup'));
 assert(pressureRoles.includes('Break'));
 assert(counterRoles.includes('Counter'));
});

testCase('Q2 canonical Fist CC statuses and CombatKernel hooks are present',()=>{
 const registry=buildRegistry();
 const shock=registry.status('status.fist.shock_stagger');
 const counter=registry.status('status.fist.counter_stagger');
 const pressure=registry.status('status.fist.pressure');
 const extreme=registry.status('status.fist.pressure_extreme');
 assert.equal(shock.group,'BodyControl'); assert.equal(shock.disablesActions,true);
 assert.equal(counter.group,'BodyControl'); assert.equal(counter.disablesActions,true);
 assert.equal(pressure.mobilityMultiplier,.88); assert.equal(pressure.recoveryTimeMultiplier,1.12);
 assert.equal(extreme.mobilityMultiplier,.82); assert.equal(extreme.recoveryTimeMultiplier,1.18);
 const combat=fs.readFileSync(new URL('../../dist/core/combat.js',import.meta.url),'utf8');
 assert(combat.includes("'status.fist.shock_stagger', .35"));
 assert(combat.includes("'status.fist.counter_stagger', .40"));
 assert(combat.includes("statusRecoveryMultiplier"));
 assert(combat.includes("fistV2ShockExposeUntil"));
 assert(combat.includes("if (v2.targetCastingBefore)"));
 assert(combat.includes("landed && v2.fistCounterSucceeded"));
 assert(combat.includes("const lowHpAtCounter = actor.hp / combatMaxHp(actor.baseStats) <= .30"));
 assert(combat.includes("tier >= 1000 && lowHpAtCounter"));
});

testCase('Q2 player-facing core/skill copy matches locked payoff and CC semantics',()=>{
 const fistSrc=fs.readFileSync(new URL('../../dist/content/fist-dao-v2.js',import.meta.url),'utf8');
 assert(fistSrc.includes('chỉ Băng Sơn Trọng Quyền, Trấn Nhạc Áp Quyền, Phá Quân Quyết hoặc Cửu Thiên Trấn Ngục Quyền'));
 assert(!fistSrc.includes('Active Quyền gây sát thương kế tiếp +35%'));
 const byId=Object.fromEntries(battleDaoSkillsV118.filter(x=>x.runtimeV117?.daoBinding==='fist').map(x=>[x.id,x]));
 assert(byId['skill.dao.fist.shock'].description.includes('ngắt cast/channel'));
 assert(byId['skill.dao.fist.counter'].description.includes('counter thành công'));
 assert(byId['skill.dao.fist.pressure'].description.includes('Trấn Áp'));
 const combatSrc=fs.readFileSync(new URL('../../dist/core/combat.js',import.meta.url),'utf8');
 assert(combatSrc.includes("fistCc: immune ? 'shock_immune' : 'shock_interrupt'"));
});

testCase('Q2 p1 stale HP/Defense duplicate copy is retired; p4 owns Defense stacking',()=>{
 const src=fs.readFileSync(new URL('../../dist/content/fist-dao-v2.js',import.meta.url),'utf8');
 const p1=src.split("\n").find(line=>line.includes("passive.v2.fist.p1"))??'';
 assert(!p1.includes('HP tối đa'));
 assert(!p1.includes('Phòng Ngự'));
 assert(src.includes('passive.v2.fist.p4'));
});

testCase('Q3 PvP synthetic scaling preserves Fist CL/TP/TPH families',()=>{
 const base={
  id:'fist.q3.pvp',name:'Q3 PvP',combatModel:'locked-v1',tags:['Fist'],
  stats:{
   attack:100,defense:100,maxHp:2000,maxSpirit:100,mobility:100,accuracy:100,controlPower:100,resolve:100,
   primaryStatsV5:{power:100,body:100,agility:100,spirit:100,sense:100},
  },
  skillIds:[],triggers:[],aiProfile:{name:'none',rules:[]},
 };
 const scaled=scalePvpEntityV91(base,1.44,'fist.q3.pvp.scaled','Q3 scaled');
 assert.equal(Number(scaled.stats.primaryStatsV5.power.toFixed(6)),144);
 assert.equal(Number(scaled.stats.primaryStatsV5.body.toFixed(6)),144);
 assert.equal(Number(scaled.stats.primaryStatsV5.agility.toFixed(6)),144);
 assert.equal(Number(scaled.stats.primaryStatsV5.sense.toFixed(6)),144);
 assert.equal(Number(scaled.stats.primaryStatsV5.spirit.toFixed(6)),120);
 const heavy=EXPECTED_Q2_SCALING.get('skill.dao.fist.heavy');
 const triple=EXPECTED_Q2_SCALING.get('skill.dao.fist.triple');
 const heavyBefore=fiveStatSkillPowerV5(base.stats,heavy.scaling,heavy.baseline);
 const heavyAfter=fiveStatSkillPowerV5(scaled.stats,heavy.scaling,heavy.baseline);
 const tripleBefore=fiveStatSkillPowerV5(base.stats,triple.scaling,triple.baseline);
 const tripleAfter=fiveStatSkillPowerV5(scaled.stats,triple.scaling,triple.baseline);
 assert.equal(Number((heavyAfter/heavyBefore).toFixed(6)),1.44);
 assert.equal(Number((tripleAfter/tripleBefore).toFixed(6)),1.44);
});

testCase('Q3 Hunt preview responds to Fist TP/TPH and treats Fist Basic as the filler lane',()=>{
 const registry=buildRegistry();
 const make=(skillId,body,agility)=>({
  id:`fist.q3.hunt.${skillId}.${body}.${agility}`,name:'Q3 Hunt',combatModel:'locked-v1',tags:['Fist'],
  stats:{
   attack:100,defense:100,maxHp:2000,physique:body,maxSpirit:100,spiritStandard:100,spiritRegenStandardPctPerSecond:2,
   mobility:agility,accuracy:100,controlPower:100,resolve:100,actionSpeed:1,critChancePct:0,critPowerPerLayer:.5,heartChancePct:0,armorPenPct:0,
   primaryStatsV5:{power:100,body,agility,spirit:100,sense:100},
  },
  skillIds:[skillId],triggers:[],aiProfile:{name:'Q3 preview',rules:[{skillId,priority:100,conditions:[{type:'always'}]}]},
  combatBuildV117:{mainDaoId:'fist',battleDaoV2Enabled:true,skillPracticeTierV125:{},skillLevelsV12317:{},skillGradesV12317:{}},
 });
 const heavyLow=buildHuntCombatProfileV130(make('skill.dao.fist.heavy',60,100),registry);
 const heavyHigh=buildHuntCombatProfileV130(make('skill.dao.fist.heavy',160,100),registry);
 assert(heavyHigh.rawDamagePerSecond>heavyLow.rawDamagePerSecond,'higher TP must raise Băng Sơn preview at equal CL');
 const tripleLow=buildHuntCombatProfileV130(make('skill.dao.fist.triple',100,60),registry);
 const tripleHigh=buildHuntCombatProfileV130(make('skill.dao.fist.triple',100,160),registry);
 assert(tripleHigh.rawDamagePerSecond>tripleLow.rawDamagePerSecond,'higher TPH must raise Tam Hoàn preview at equal CL');
 const huntSrc=fs.readFileSync(new URL('../../dist/core/hunt-real-combat-v130.js',import.meta.url),'utf8');
 assert(huntSrc.includes("entity.combatBuildV117?.mainDaoId === 'fist' && id === 'skill.dao.fist.basic'"));
});

testCase('Q3 legacy combatants get one five-stat snapshot and offline Hunt remains CombatKernel V3',()=>{
 const snap=ensurePrimaryStatsV5SnapshotV5({
  attack:120,physique:80,maxHp:1600,maxSpirit:90,mobility:75,accuracy:70,defense:60,controlPower:70,resolve:70,
 });
 assert.deepEqual(snap.primaryStatsV5,{power:120,body:80,agility:75,spirit:90,sense:70});
 const combatSrc=fs.readFileSync(new URL('../../dist/core/combat.js',import.meta.url),'utf8');
 assert(combatSrc.includes('const snapshottedStats = ensurePrimaryStatsV5SnapshotV5(def.stats)'));
 const sessionSrc=fs.readFileSync(new URL('../../dist/core/session.js',import.meta.url),'utf8');
 assert(sessionSrc.includes('huntPreviewPlayerDpsLog10V130(player, this.registry)'));
 assert(sessionSrc.includes('resolveEndlessHuntWithCombatKernelV3({'),'offline/virtual Hunt settlement must remain CombatKernel V3');
});

testCase('Q3 Auto Quyền follows interrupt/counter/Break/payoff priority and bounded Ultimate hold',()=>{
 const ids=[...EXPECTED_Q2_SCALING.keys()];
 const profile=battleDaoAutoRotationV127('fist',ids);
 const fistBlock=fs.readFileSync(new URL('../../dist/core/battle-dao-rotation-v127.js',import.meta.url),'utf8').split("case 'fist':")[1].split("case 'body':")[0];
 assert(!fistBlock.includes("resource: 'fistChain'"),'Auto must never spend/gate with obsolete fistChain');
 const rules=profile.rules;
 const has=(rule,type,pred=()=>true)=>rule.conditions.some(c=>c.type===type&&pred(c));
 const shockCast=rules.find(r=>r.skillId==='skill.dao.fist.shock'&&has(r,'targetIsCasting'));
 const counterCast=rules.find(r=>r.skillId==='skill.dao.fist.counter'&&has(r,'targetIsCasting'));
 assert(shockCast&&counterCast&&shockCast.priority>counterCast.priority,'Chấn Mạch must own the first cast/channel reaction');
 assert(rules.filter(r=>r.skillId==='skill.dao.fist.counter').every(r=>has(r,'targetIsCasting')),'Hồi Thân must not be spammed outside a counter window');
 const finisher=rules.find(r=>r.skillId==='skill.dao.fist.finisher'&&has(r,'targetIsBroken')&&has(r,'selfDaoV2ResourceAtLeast',c=>c.resource==='fistForce'&&c.value===4));
 assert(finisher,'Thất Thế + >=4 Quyền Thế must expose Phá Quân');
 const pressure=rules.find(r=>r.skillId==='skill.dao.fist.pressure'&&has(r,'targetIsNotBroken')&&has(r,'selfDaoV2ResourceAtLeast',c=>c.resource==='fistForce'&&c.value===5));
 assert(pressure,'5 Quyền Thế against an unbroken target must prefer a valid Trọng Thế setup payoff');
 const ults=rules.filter(r=>r.skillId==='skill.dao.fist.ultimate'&&has(r,'selfUltimateGaugeAtLeast',c=>c.value===100));
 assert(ults.some(r=>has(r,'selfDaoV2ResourceAtLeast',c=>c.resource==='fistForce'&&c.value===5)));
 assert(ults.some(r=>has(r,'selfDaoV2ResourceAtLeast',c=>c.resource==='fistForce'&&c.value===4)));
 const aiSrc=fs.readFileSync(new URL('../../dist/core/ai.js',import.meta.url),'utf8');
 assert(aiSrc.includes("fistUltimateHoldUntil"));
 assert(aiSrc.includes("self.pendingSetFlagsV117['fistUltimateHoldUntil'] = now + 3"));
 assert(aiSrc.includes("skill.id === 'skill.dao.fist.ultimate' && fistUltimateEligible && !fistPerfectUltimate"));
});

console.log(`FIST DAO Q1-Q3: ${passed}/${passed} PASS`);

