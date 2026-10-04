import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildRegistry } from '../../dist/content/registry.js';
import { battleDaoV2Catalog } from '../../dist/content/battle-dao-v2-catalog.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';
import { CombatEngine } from '../../dist/core/combat.js';

export const POISON_P4_DURATION_SECONDS=180;
export function poisonP4SourceDigest(){
 const files=['dist/content/poison-dao-v2.js','dist/content/battle-dao-skill-pack-v118.js','dist/core/battle-dao-v2-contract.js','dist/core/combat.js','dist/core/battle-dao-v2-runtime-base.js','dist/core/ai.js','dist/core/battle-dao-skill-growth-v126.js','dist/core/battle-dao-rotation-v127.js','qa/benchmarks/poison-dao-p4-benchmark.js'];
 const hash=createHash('sha256');for(const file of files)hash.update(file+'\n'+fs.readFileSync(new URL('../../'+file,import.meta.url),'utf8').replaceAll('\r\n','\n'));
 return hash.digest('hex');
}
export const POISON_P4_SEEDS=Object.freeze([
  64001,64019,64033,64051,64067,64081,64109,64123,64151,64171,64189,64217,
]);

const BASE_PRIMARY=Object.freeze({power:100,body:100,agility:100,spirit:100,sense:100});
const allocate=x=>Object.fromEntries(Object.keys(BASE_PRIMARY).map(key=>[key,BASE_PRIMARY[key]+(x[key]??0)]));

const ids=xs=>xs.map(x=>'skill.dao.poison.'+x);
export const POISON_P4_PROFILES=Object.freeze([
 {id:'heart',label:'Công Tâm',targetRelativeDps:[100,100],allocation:{power:155,body:25,agility:15,spirit:30,sense:75},activeSkillIds:ids(['bone','heart','insects','consume','calamity'])},
 {id:'sustain',label:'Vạn Độc',targetRelativeDps:[90,97],allocation:{power:105,body:25,agility:20,spirit:90,sense:60},activeSkillIds:ids(['bone','heart','insects','mist','calamity'])},
 {id:'mist',label:'Độc Vụ',targetRelativeDps:[85,92],allocation:{power:85,body:30,agility:60,spirit:30,sense:95},activeSkillIds:ids(['bone','heart','mist','transform','guard'])},
]);

const round=(value,digits=3)=>{const n=Number(value)||0,p=10**digits;return Math.round(n*p)/p;};
const sum=xs=>xs.reduce((a,b)=>a+(Number(b)||0),0);
const mean=xs=>xs.length?sum(xs)/xs.length:0;
const min=xs=>xs.length?Math.min(...xs):0;
const max=xs=>xs.length?Math.max(...xs):0;

function poisonCatalogMeta(){
  const catalog=battleDaoV2Catalog('poison');
  const passiveIds=catalog.passives.map(x=>x.id);
  const allSkillIds=[catalog.basicSkillId,...catalog.tree.map(x=>x.activeSkillId),catalog.ultimateSkillId];
  return {catalog,passiveIds,allSkillIds};
}
function profilePrimary(profile){return allocate(profile.allocation);}

export function validatePoisonP4Profiles(){
  const {catalog,allSkillIds}=poisonCatalogMeta();
  const valid=new Set(allSkillIds),problems=[];
  for(const profile of POISON_P4_PROFILES){
    if(profile.activeSkillIds.length!==5) problems.push(`${profile.id}: expected exactly 5 Active slots`);
    if(new Set(profile.activeSkillIds).size!==5) problems.push(`${profile.id}: duplicate Active skill`);
    for(const id of profile.activeSkillIds){
      if(!catalog.tree.some(row=>row.activeSkillId===id)) problems.push(`${profile.id}: not a Poison Active: ${id}`);
    }
    const total=sum(Object.values(profile.allocation));
    if(total!==300) problems.push(`${profile.id}: allocation budget ${total}, expected 300`);
    for(const id of [catalog.basicSkillId,...profile.activeSkillIds,catalog.ultimateSkillId]){
      if(!valid.has(id)) problems.push(`${profile.id}: unknown Poison skill: ${id}`);
    }
  }
  return problems;
}

export function createPoisonP4Player(profile){
  const {catalog,passiveIds,allSkillIds}=poisonCatalogMeta();
  const primary=profilePrimary(profile);
  const equipped=[catalog.basicSkillId,...profile.activeSkillIds,catalog.ultimateSkillId];
  const mastery=Object.fromEntries(allSkillIds.map(id=>[id,1000]));
  const passiveLevels=Object.fromEntries(passiveIds.map(id=>[id,20]));
  return {
    id:`entity.qa.poison_p4.${profile.id}`,
    name:`QA Poison M4 · ${profile.label}`,
    combatModel:'locked-v1',
    tags:['Human','Cultivator','Poison','Benchmark'],
    stats:{
      primaryStatsV5:{...primary},
      attack:primary.power,
      physique:primary.body,
      maxHp:primary.body*20,
      defense:primary.body,
      mobility:primary.agility,
      maxSpirit:primary.spirit,
      spiritStandard:100,
      spiritRegenStandardPctPerSecond:3,
      accuracy:primary.sense,
      controlPower:primary.sense,
      resolve:primary.sense,
      dodgeChancePct:0,
      critChancePct:5,
      critPowerPerLayer:.5,
      heartChancePct:0,
      actionSpeed:1,
    },
    skillIds:equipped,
    triggers:[],
    aiProfile:battleDaoAutoRotationV127('poison',equipped),
    initialUltimateGaugeV117:0,
    combatBuildV117:{
      battleDaoV2Enabled:true,
      mainDaoId:'poison',
      realmOrder:102,
      learnedDaoPassiveIdsV118:passiveIds,
      passiveLevelsV125:passiveLevels,
      skillPracticeTierV125:mastery,
      skillLevelsV12317:{},skillGradesV12317:{},rootUnlocked:{},rootEffectivenessPct:{},rootLevelsV133:{},
      activeRootOriginIdsV132:{},activeSetMechanics:[],skillRootBindingsV118:{},activeVariantIdsV118:[],
    },
  };
}

export function createPoisonP4Target(){
  return {
    id:'entity.qa.poison_p4.target',
    name:'P4 Pháp Luân Chiến Khôi',
    combatModel:'locked-v1',
    tags:['Boss','Benchmark','TrainingDummy'],
    stats:{
      primaryStatsV5:{power:100,body:200,agility:110,spirit:100,sense:180},
      maxHp:50_000_000,maxSpirit:100,spiritStandard:100,spiritRegenStandardPctPerSecond:2,
      attack:25,defense:200,mobility:110,accuracy:180,controlPower:20,resolve:220,
      dodgeChancePct:0,critChancePct:0,critPowerPerLayer:.5,heartChancePct:0,actionSpeed:.65,
    },
    skillIds:['skill.basic_strike'],triggers:[],
    aiProfile:{name:'M4 Poison Dummy',rules:[{skillId:'skill.basic_strike',priority:10,conditions:[{type:'always'}]}]},
  };
}

// Interval observers invoke production once and are restored even if a run fails.
function observedRun(input) {
 const original=CombatEngine.prototype.updateContinuousState,dotOriginal=CombatEngine.prototype.handleDotTick;
 const exposure={stageSeconds:[0,0,0,0,0],dotUptimeSeconds:0,mistUptimeSeconds:0,lowCnSeconds:0,poisonStackUptimeSeconds:0,thresholdSeconds:0,capSeconds:0,targetStageLeaks:0};
 CombatEngine.prototype.updateContinuousState=function(e,now){
  const from=e.lastContinuousUpdateAt,dt=Math.max(0,now-from),c=e.battleDaoStateV2?.poison?.core,st=e.battleDaoStateV2?.poison?.stack;
  if(e.id===input.entities[0].id && dt>0){
   const stage=c?.targetId===input.entities[1].id?c.poisonSeedStage:0;exposure.stageSeconds[stage]+=dt;
   const coverage=c?.targetId===input.entities[1].id?c.dotUntil??{}:{};
   const end=Math.max(0,...Object.values(coverage));exposure.dotUptimeSeconds+=Math.max(0,Math.min(now,end)-from);
   exposure.mistUptimeSeconds+=Math.max(0,Math.min(now,coverage.mist??0)-from);
   if(e.spirit<e.baseStats.maxSpirit*.2)exposure.lowCnSeconds+=dt;
   if(st?.stacks>0){const next=st.nextDecayAt??st.expiresAt+st.decayEverySeconds;const until=n=>Math.max(0,Math.min(now,next+(st.stacks-n)*st.decayEverySeconds)-from);exposure.poisonStackUptimeSeconds+=until(1);if(st.stacks>=20)exposure.thresholdSeconds+=until(20);if(st.stacks>=st.cap)exposure.capSeconds+=until(st.cap);}
  }
  return original.call(this,e,now);
 };
 CombatEngine.prototype.handleDotTick=function(e,t,id,dot,now){
  const before=JSON.stringify(e.battleDaoStateV2?.poison?.core);const result=dotOriginal.call(this,e,t,id,dot,now);
  if(dot.poisonPacket && before!==JSON.stringify(e.battleDaoStateV2?.poison?.core))exposure.targetStageLeaks++;
  return result;
 };
 try{return{kernel:runCombatKernelV3(input),exposure};}
 finally{CombatEngine.prototype.updateContinuousState=original;CombatEngine.prototype.handleDotTick=dotOriginal;}
}
export function summarizePoisonP4Run(kernel,profile,seed,exposure={}) {
 const playerId=createPoisonP4Player(profile).id,logs=kernel.battle.logs.filter(x=>x.actorId===playerId);
 const result=kernel.combatResult,damage=result.summary.damageByActor[playerId]??0,duration=result.duration;
 const damageBySkill=result.summary.damageBySkillByActor?.[playerId]??{},casts=result.summary.castCountsByActor?.[playerId]??{};
 const applications=logs.filter(x=>x.data?.poisonDotApplied),ticks=logs.filter(x=>x.data?.poisonResolvedTick),consumes=logs.filter(x=>x.data?.poisonConsume);
 const entries=logs.filter(x=>x.data?.poisonCongTamEntry),full=consumes.filter(x=>x.data.poisonConsume.full&&x.data.poisonConsume.congTam),partial=consumes.filter(x=>!x.data.poisonConsume.full);
 const starts=logs.filter(x=>x.type==='channel'&&x.data?.hits),completed=logs.filter(x=>x.data?.poisonChannelCompleted),unfinished=starts.filter(x=>x.time+x.data.duration>duration);
 const dotDamage=sum(ticks.map(x=>x.data.poisonDotDamage));
 const field={profileId:profile.id,label:profile.label,seed,duration,damage,dps:damage/duration,damageBySkill,casts,
  timeToFirstCongTam:entries[0]?.time??null,congTamEntries:entries.length,congTamUptimeSeconds:exposure.stageSeconds?.[4]??0,
  successfulConsumes:consumes.length,fullConsumes:full.length,normalFullConsumes:full.filter(x=>x.skillId.endsWith('.consume')).length,partialConsumes:partial.length,
  consumeMeanStage:mean(consumes.map(x=>x.data.poisonConsume.stageBefore)),partialMeanStage:mean(partial.map(x=>x.data.poisonConsume.stageBefore)),
  consumeDamage:sum(consumes.map(x=>damageBySkill[x.skillId]??0))/Math.max(1,consumes.length),consumeMissAttempts:logs.filter(x=>x.data?.poisonConsumeMiss).length,
  dotApplications:applications.length,scheduledTicks:sum(applications.map(x=>x.data.poisonScheduledTicks)),resolvedTicks:ticks.length,suppressedTicks:logs.filter(x=>x.data?.poisonSuppressedTick).length,
  dotDamage,dotDamagePct:damage?dotDamage/damage*100:0,mistDeploys:applications.filter(x=>x.data.poisonMistDeploy).length,
  channelStarts:starts.length,channelCompleted:completed.length,channelInterrupted:starts.length-completed.length-unfinished.length,channelUnfinished:unfinished.length,
  calamityCasts:casts['skill.dao.poison.calamity']??0,transformUses:casts['skill.dao.poison.transform']??0,guardUses:casts['skill.dao.poison.guard']??0,
  cnSpent:sum(logs.map(x=>x.data?.spiritCost??0)),cnRestored:sum(logs.map(x=>x.data?.restored??0)),ultimateCasts:casts['skill.dao.poison.ultimate']??0,
  duplicateRootTransactions:consumes.length-new Set(consumes.map(x=>x.data.rootActionId)).size,...exposure};
 field.consumeDamage=sum(Object.entries(damageBySkill).filter(([id])=>['consume','transform','ultimate'].some(s=>id==='skill.dao.poison.'+s)).map(([,d])=>d));
 field.consumeDamagePct=damage?field.consumeDamage/damage*100:0;
 field.identityValid=duration===180&&field.congTamEntries>0&&field.dotApplications>0&&field.resolvedTicks>0&&field.targetStageLeaks===0&&field.duplicateRootTransactions===0
  &&(profile.id!=='heart'||field.normalFullConsumes>0&&field.consumeMeanStage>=3.5&&field.consumeDamagePct>=15)
  &&(profile.id!=='sustain'||field.dotDamagePct>=50&&field.channelCompleted>0&&field.calamityCasts>0)
  &&(profile.id!=='mist'||field.mistDeploys>0&&field.partialConsumes>0);
 return Object.fromEntries(Object.entries(field).map(([k,v])=>[k,typeof v==='number'?round(v):Array.isArray(v)?v.map(x=>round(x)):v]));
}
export function runPoisonP4Benchmark({seeds=POISON_P4_SEEDS,duration=POISON_P4_DURATION_SECONDS}={}) {
 const problems=validatePoisonP4Profiles();if(problems.length)throw Error(problems.join('\n'));
 const registry=buildRegistry(),runs=[];
 for(const profile of POISON_P4_PROFILES)for(const seed of seeds){const {kernel,exposure}=observedRun({registry,seed,entities:[createPoisonP4Player(profile),createPoisonP4Target()],maxDuration:duration,mode:'simulation'});runs.push(summarizePoisonP4Run(kernel,profile,seed,exposure));}
 const aggregates=POISON_P4_PROFILES.map(p=>{const rows=runs.filter(x=>x.profileId===p.id),numeric=Object.keys(rows[0]).filter(k=>typeof rows[0][k]==='number'&&k!=='seed');return{id:p.id,label:p.label,allocation:p.allocation,activeSkillIds:p.activeSkillIds,targetRelativeDps:p.targetRelativeDps,validRuns:rows.filter(x=>x.identityValid).length,seeds:rows.length,...Object.fromEntries(numeric.map(k=>[k,round(mean(rows.map(x=>x[k])))])),stageSeconds:rows[0].stageSeconds.map((_,i)=>round(mean(rows.map(x=>x.stageSeconds[i])))),dpsMin:min(rows.map(x=>x.dps)),dpsMax:max(rows.map(x=>x.dps))};});
 for(const row of aggregates){row.relativeDps=round(row.dps/aggregates[0].dps*100);row.withinBand=row.relativeDps>=row.targetRelativeDps[0]&&row.relativeDps<=row.targetRelativeDps[1];}
 const [heart,sustain,mist]=aggregates;
 const attritionValid=sustain.resolvedTicks>Math.max(heart.resolvedTicks,mist.resolvedTicks)&&sustain.dotApplications>Math.max(heart.dotApplications,mist.dotApplications)&&sustain.dotUptimeSeconds>=Math.max(heart.dotUptimeSeconds,mist.dotUptimeSeconds)&&sustain.congTamUptimeSeconds>=Math.max(heart.congTamUptimeSeconds,mist.congTamUptimeSeconds)&&sustain.normalFullConsumes<heart.normalFullConsumes;
 const identityValid=runs.every(x=>x.identityValid)&&attritionValid;
 return{schema:'poison-dao-p4-benchmark.v1',sourceDigest:poisonP4SourceDigest(),engine:'combat.v3',durationSeconds:duration,seeds:[...seeds],identityValid,attritionValid,passed:identityValid&&aggregates.every(x=>x.withinBand),aggregates,runs};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=runPoisonP4Benchmark(),out=process.argv.find(x=>x.startsWith('--out='))?.slice(6)??'qa/output/poison-p4-benchmark.json';
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({passed:result.passed,identityValid:result.identityValid,attritionValid:result.attritionValid,aggregates:result.aggregates},null,2));if(!result.passed)process.exitCode=1;
}
