import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { adventureEnemies, heavySwordCultivator, playableMortalCultivator } from '../../dist/content/entities.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { SimulationSession } from '../../dist/core/session.js';
import { combatMaxHp } from '../../dist/core/combat-rules.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';
import { cultivationRateV140 } from '../../dist/core/cultivation-v140.js';
import {
  CORE_POTENTIAL_AXIS_VERSION_V5, FATE_BUILD_TOTAL_UNLOCK_COST_V4, REINCARNATION_PERMANENT_POTENTIAL_BASE_PCT_V127, REINCARNATION_PERMANENT_POTENTIAL_MAX_PCT_V127,
  REINCARNATION_DEPTH_CONFIG, applyCorePotentialStats, applyFateSpiritStoneGainV4, corePotentialPercentBonusV4,
  lifePotentialMilestonesThroughRealmOrder, previewReincarnationV2Reward, reincarnationPowerBonusPctV4, reincarnationStageFactorV4,
  totalTreeMaxCostV127,
} from '../../dist/core/reincarnation-progression-v1102.js';

const registry=buildRegistry();
const make=(seed=441001)=>new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,seed,createPlayableAdventureState());
let passed=0; const test=(name,fn)=>{fn();passed++;console.log(`✓ ${name}`)};

test('Tiềm Năng Vĩnh Viễn conversion is canonical 3% → 10%',()=>{
  assert.equal(REINCARNATION_PERMANENT_POTENTIAL_BASE_PCT_V127,3);
  assert.equal(REINCARNATION_PERMANENT_POTENTIAL_MAX_PCT_V127,10);
});

test('Tu Mệnh changes real V140 Tự Tu rate and Bế Quan payout',()=>{
  const base=make(441002), fate=make(441002);
  base.stateValue.realm.maxRealmOrder=fate.stateValue.realm.maxRealmOrder=18;
  base.stateValue.realm.realmId=fate.stateValue.realm.realmId='realm.golden_core.early';
  base.stateValue.character.fateModifiersV4={}; fate.stateValue.character.fateModifiersV4={selfCultivationPct:22,retreatPct:15};
  const a=cultivationRateV140(base.stateValue,18).finalTuViPer15s,b=cultivationRateV140(fate.stateValue,18).finalTuViPer15s;
  assert(b>a,`${a} -> ${b}`);
  const now=1_800_000_000_000; base.stateValue.cultivation.retreatBankHours=fate.stateValue.cultivation.retreatBankHours=3;
  const ar=base.instantRetreatV140(1,now), br=fate.instantRetreatV140(1,now);
  assert(br.gained>ar.gained,`${ar.gained} -> ${br.gained}`);
});

test('Chiến/Thể Mệnh materialize into the canonical personal CombatEntity',()=>{
  const ss=make(441003); ss.stateValue.character.fateModifiersV4={}; const a=ss.personalCombatEntity();
  ss.stateValue.character.fateModifiersV4={damagePct:20,bossDamagePct:12,maxHpPct:28,defensePct:10,damageReductionPct:6}; const b=ss.personalCombatEntity();
  assert.equal(b.combatBuildV117.fateV4.damagePct,20); assert(combatMaxHp(b.stats)>combatMaxHp(a.stats)*1.27); assert(b.stats.defense>a.stats.defense*1.09); assert((b.stats.damageReductionPct??0)>(a.stats.damageReductionPct??0));
  assert.equal(b.combatBuildV117.fateV4.bossDamagePct,12);
});

test('Damage của Chiến Mệnh is consumed as real outgoing damage inside CombatKernel V3',()=>{
  const player={...structuredClone(playableMortalCultivator),id:'p',stats:{...playableMortalCultivator.stats,attack:500},combatBuildV117:{fateV4:{damagePct:0}}};
  const boosted=structuredClone(player); boosted.combatBuildV117.fateV4.damagePct=20;
  const target={...structuredClone(heavySwordCultivator),id:'t',stats:{...heavySwordCultivator.stats,maxHp:20000,physique:1000}};
  const a=runCombatKernelV3({mode:'realtime',registry,seed:8181,entities:[player,target],maxDuration:8}).battle;
  const b=runCombatKernelV3({mode:'realtime',registry,seed:8181,entities:[boosted,target],maxDuration:8}).battle;
  assert(b.finalState.t.hp<a.finalState.t.hp,`${a.finalState.t.hp} -> ${b.finalState.t.hp}`);
});

test('Boss Damage của Chiến Mệnh is consumed inside CombatKernel V3',()=>{
  const player={...structuredClone(playableMortalCultivator),id:'p',stats:{...playableMortalCultivator.stats,attack:500},combatBuildV117:{fateV4:{bossDamagePct:0}}};
  const boosted=structuredClone(player); boosted.combatBuildV117.fateV4.bossDamagePct=12;
  const boss={...structuredClone(heavySwordCultivator),id:'b',tags:[...(heavySwordCultivator.tags??[]),'Boss'],stats:{...heavySwordCultivator.stats,maxHp:20000,physique:1000}};
  const a=runCombatKernelV3({mode:'realtime',registry,seed:9191,entities:[player,boss],maxDuration:8}).battle;
  const b=runCombatKernelV3({mode:'realtime',registry,seed:9191,entities:[boosted,boss],maxDuration:8}).battle;
  assert(b.finalState.b.hp<a.finalState.b.hp,`${a.finalState.b.hp} -> ${b.finalState.b.hp}`);
});

test('Tài Mệnh scales actual Linh Thạch gain helper and never scales costs',()=>{
  assert.equal(applyFateSpiritStoneGainV4(1000,{spiritStoneGainPct:25}),1250);
  assert.equal(applyFateSpiritStoneGainV4(1000,{}),1000);
  const session=fs.readFileSync(new URL('../../dist/core/session.js',import.meta.url),'utf8');
  assert(session.includes('fateSpiritStoneGainV4(transaction.totalSpiritStones)'));
  assert(!session.includes("stones - this.fateSpiritStoneGainV4"));
});

test('Nhàn Mệnh changes real offline V140 cultivation settlement',()=>{
  const a=make(441004),b=make(441004); for(const ss of [a,b]){ss.stateValue.realm.maxRealmOrder=18;ss.stateValue.realm.realmId='realm.golden_core.early';ss.stateValue.cultivation.tuVi=0;ss.stateValue.cultivation.commitRemainderSeconds=0;}
  a.stateValue.character.fateModifiersV4={}; b.stateValue.character.fateModifiersV4={offlineRewardPct:25};
  const t=1_800_000_000_000,ra=a.resolveRealtimeOffline({},t,t+3600_000),rb=b.resolveRealtimeOffline({},t,t+3600_000);
  assert(rb.cultivationGain>ra.cultivationGain*1.20,`${ra.cultivationGain} -> ${rb.cultivationGain}`); assert.equal(rb.fateOfflineBonusPct,25);
});

test('RP V4 ignores lifeScore and uses stage + same-realm power + record',()=>{
  const common={lifeId:'x',realmOrder:21,lifePotentialEarned:72,permanentPotentialConversionPct:3,combatPower:150,combatPowerBenchmark:100,isNewRealmRecord:true,reincarnationPointsGainPct:0,energyCostReductionPct:0,nowUnixMs:1};
  const a=previewReincarnationV2Reward({...common,lifeScore:0}),b=previewReincarnationV2Reward({...common,lifeScore:999999}); assert.equal(a.reincarnationPoints,b.reincarnationPoints);
  assert.equal(Number(reincarnationStageFactorV4(21).toFixed(2)),1.30); assert.equal(reincarnationPowerBonusPctV4(150,100),20); assert.equal(a.powerBonusPct,20); assert.equal(a.recordBonusPct,15);
});

test('RP same-realm benchmark is persisted and session preview uses it without mutating save',()=>{
  const ss=make(441005); ss.stateValue.realm.maxRealmOrder=18;ss.stateValue.realm.realmId='realm.golden_core.early';
  const power=ss.personalPowerSummary().score; ss.metaValue.reincarnationProgress.highestRealmOrderV4=18; ss.metaValue.reincarnationProgress.bestCombatPowerByRealmOrderV4['18']=power/2;
  const before=JSON.stringify(ss.state); const r=ss.previewReincarnationV2Reward(1_800_000_000_000); const after=JSON.stringify(ss.state);
  assert.equal(r.powerBonusPct,30); assert.equal(r.recordBonusPct,0); assert.equal(before,after);
});

test('Current Phase-1 tree cannot be full in 2–3 Sáng Thế lives even at extreme power',()=>{
  const sink=totalTreeMaxCostV127()+FATE_BUILD_TOTAL_UNLOCK_COST_V4,order=117;
  const max=previewReincarnationV2Reward({lifeId:'sim',realmOrder:order,lifePotentialEarned:1739,permanentPotentialConversionPct:10,combatPower:500,combatPowerBenchmark:100,isNewRealmRecord:false,reincarnationPointsGainPct:25,energyCostReductionPct:25,nowUnixMs:1});
  const lives=Math.ceil(sink/max.reincarnationPoints); assert(lives>=10,`sink=${sink} maxRP=${max.reincarnationPoints} lives=${lives}`);
});

test('Permanent Potential stays bounded and applies only authored five-axis point effects',()=>{
  const baseLife=lifePotentialMilestonesThroughRealmOrder(117).reduce((s,x)=>s+x.amount,0);
  const maxLife=lifePotentialMilestonesThroughRealmOrder(117).reduce((s,x)=>s+Math.round(x.amount*1.25),0);
  const perLife3=Math.round(baseLife*.03),perLife10=Math.round(maxLife*.10);
  const rows=[];
  for(const lives of [1,10,50,100]){
    const p3=corePotentialPercentBonusV4(perLife3*lives),p10=corePotentialPercentBonusV4(perLife10*lives);
    rows.push({lives,permanent3:perLife3*lives,legacySoftCap3Pct:Number(p3.toFixed(2)),permanent10:perLife10*lives,legacySoftCap10Pct:Number(p10.toFixed(2))});
    assert(p10>p3); assert(p10<35);
  }
  const points=Math.floor(perLife10*10/5);
  const allocation={power:points,body:points,agility:points,spirit:points,sense:points};
  const base={attack:1_000_000,defense:800_000,physique:50_000,maxHp:1_000_000,maxSpirit:100_000,mobility:500,accuracy:600,controlPower:700,resolve:800};
  const sample=applyCorePotentialStats(base,{life:{axisVersion:CORE_POTENTIAL_AXIS_VERSION_V5,unspent:0,lifetimeEarned:0,allocations:{power:0,body:0,agility:0,spirit:0,sense:0},awardedMilestones:[]},permanent:allocation});
  assert.equal(sample.attack,base.attack+points);
  assert.equal(sample.defense,base.defense+points);
  assert.equal(sample.physique,base.physique+points);
  assert.equal(sample.maxHp,(base.physique+points)*20);
  assert.equal(sample.mobility,base.mobility+points);
  assert.equal(sample.maxSpirit,base.maxSpirit+points);
  assert.equal(sample.accuracy,base.accuracy+points);
  assert.equal(sample.controlPower,base.controlPower+points);
  assert.equal(sample.resolve,base.resolve+points);
  console.log('POTENTIAL SIM',rows);
});

const sink=totalTreeMaxCostV127()+FATE_BUILD_TOTAL_UNLOCK_COST_V4;
console.log('RP SIM');
for(const cfg of REINCARNATION_DEPTH_CONFIG){
  const order=cfg.endOrder,base=previewReincarnationV2Reward({lifeId:'sim',realmOrder:order,combatPower:100,combatPowerBenchmark:100,isNewRealmRecord:false,reincarnationPointsGainPct:0,nowUnixMs:1}),maxTree=previewReincarnationV2Reward({lifeId:'sim',realmOrder:order,combatPower:150,combatPowerBenchmark:100,isNewRealmRecord:false,reincarnationPointsGainPct:25,nowUnixMs:1});
  console.log(`${cfg.name}\torder=${order}\tRP=${base.reincarnationPoints}\tRP+tree+1.5x=${maxTree.reincarnationPoints}\tlivesToCurrentSink=${Math.ceil(sink/maxTree.reincarnationPoints)}`);
}
console.log(`REINCARNATION V4 GAMEPLAY + BALANCE — ${passed}/${passed} PASS`);
