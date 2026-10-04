import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildRegistry } from '../../dist/content/registry.js';
import { battleDaoV2Catalog } from '../../dist/content/battle-dao-v2-catalog.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';
import { CombatEngine } from '../../dist/core/combat.js';

export const SPELL_P4_DURATION_SECONDS=180;
export function spellP4SourceDigest(){
 const files=['dist/content/battle-dao-skill-pack-v118.js','dist/content/spell-dao-v2.js','dist/core/ai.js','dist/core/battle-dao-rotation-v127.js','dist/core/battle-dao-skill-growth-v126.js','dist/core/battle-dao-v2-contract.js','dist/core/battle-dao-v2-runtime-base.js','dist/core/combat-decision.js','dist/core/combat-m1-base.js','qa/benchmarks/spell-dao-p4-benchmark.js'];
 const hash=createHash('sha256');for(const file of files)hash.update(file+'\n'+fs.readFileSync(new URL('../../'+file,import.meta.url),'utf8').replaceAll('\r\n','\n'));
 return hash.digest('hex');
}
export const SPELL_P4_SEEDS=Object.freeze([
  64001,64019,64033,64051,64067,64081,64109,64123,64151,64171,64189,64217,
]);

const BASE_PRIMARY=Object.freeze({power:100,body:100,agility:100,spirit:100,sense:100});
const allocate=x=>Object.fromEntries(Object.keys(BASE_PRIMARY).map(key=>[key,BASE_PRIMARY[key]+(x[key]??0)]));

const ids=xs=>xs.map(x=>'skill.dao.spell.'+x);
export const SPELL_P4_PROFILES=Object.freeze([
 {id:'burst',label:'Bạo Pháp',targetRelativeDps:[100,100],allocation:{power:165,body:25,agility:20,spirit:65,sense:25},activeSkillIds:ids(['seal','channel','burst','break','restore'])},
 {id:'wheel',label:'Luân Pháp',targetRelativeDps:[90,97],allocation:{power:115,body:25,agility:85,spirit:55,sense:20},activeSkillIds:ids(['light','seal','channel','burst','restore'])},
 {id:'channel',label:'Dẫn Pháp',targetRelativeDps:[85,93],allocation:{power:90,body:30,agility:20,spirit:65,sense:95},activeSkillIds:ids(['seal','channel','restore','shield','break'])},
]);

const round=(value,digits=3)=>{const n=Number(value)||0,p=10**digits;return Math.round(n*p)/p;};
const sum=xs=>xs.reduce((a,b)=>a+(Number(b)||0),0);
const mean=xs=>xs.length?sum(xs)/xs.length:0;
const min=xs=>xs.length?Math.min(...xs):0;
const max=xs=>xs.length?Math.max(...xs):0;

function spellCatalogMeta(){
  const catalog=battleDaoV2Catalog('spell');
  const passiveIds=catalog.passives.map(x=>x.id);
  const allSkillIds=[catalog.basicSkillId,...catalog.tree.map(x=>x.activeSkillId),catalog.ultimateSkillId];
  return {catalog,passiveIds,allSkillIds};
}
function profilePrimary(profile){return allocate(profile.allocation);}

export function validateSpellP4Profiles(){
  const {catalog,allSkillIds}=spellCatalogMeta();
  const valid=new Set(allSkillIds),problems=[];
  for(const profile of SPELL_P4_PROFILES){
    if(profile.activeSkillIds.length!==5) problems.push(`${profile.id}: expected exactly 5 Active slots`);
    if(new Set(profile.activeSkillIds).size!==5) problems.push(`${profile.id}: duplicate Active skill`);
    for(const id of profile.activeSkillIds){
      if(!catalog.tree.some(row=>row.activeSkillId===id)) problems.push(`${profile.id}: not a Spell Active: ${id}`);
    }
    const total=sum(Object.values(profile.allocation));
    if(total!==300) problems.push(`${profile.id}: allocation budget ${total}, expected 300`);
    for(const id of [catalog.basicSkillId,...profile.activeSkillIds,catalog.ultimateSkillId]){
      if(!valid.has(id)) problems.push(`${profile.id}: unknown Spell skill: ${id}`);
    }
  }
  return problems;
}

export function createSpellP4Player(profile){
  const {catalog,passiveIds,allSkillIds}=spellCatalogMeta();
  const primary=profilePrimary(profile);
  const equipped=[catalog.basicSkillId,...profile.activeSkillIds,catalog.ultimateSkillId];
  const mastery=Object.fromEntries(allSkillIds.map(id=>[id,1000]));
  const passiveLevels=Object.fromEntries(passiveIds.map(id=>[id,20]));
  return {
    id:`entity.qa.spell_p4.${profile.id}`,
    name:`QA Spell M4 · ${profile.label}`,
    combatModel:'locked-v1',
    tags:['Human','Cultivator','Spell','Benchmark'],
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
    aiProfile:battleDaoAutoRotationV127('spell',equipped),
    initialUltimateGaugeV117:0,
    combatBuildV117:{
      battleDaoV2Enabled:true,
      mainDaoId:'spell',
      realmOrder:102,
      learnedDaoPassiveIdsV118:passiveIds,
      passiveLevelsV125:passiveLevels,
      skillPracticeTierV125:mastery,
      skillLevelsV12317:{},skillGradesV12317:{},rootUnlocked:{},rootEffectivenessPct:{},rootLevelsV133:{},
      activeRootOriginIdsV132:{},activeSetMechanics:[],skillRootBindingsV118:{},activeVariantIdsV118:[],
    },
  };
}

export function createSpellP4Target(){
  return {
    id:'entity.qa.spell_p4.target',
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
    aiProfile:{name:'M4 Spell Dummy',rules:[{skillId:'skill.basic_strike',priority:10,conditions:[{type:'always'}]}]},
  };
}

// Observe continuous intervals in the real engine. The observer invokes the original
// method once and never mutates combat state; restored in finally, including failures.
function observedRun(input){
 const original=CombatEngine.prototype.updateContinuousState;
 const exposure={lowCnSeconds:0,phapYUptimeSeconds:0,thresholdSeconds:0,capSeconds:0,regenCn:0};
 CombatEngine.prototype.updateContinuousState=function(e,now){
  const from=e.lastContinuousUpdateAt,dt=Math.max(0,now-from),before=e.spirit,st=e.battleDaoStateV2?.spell?.stack;
  const result=original.call(this,e,now);
  if(e.id===input.entities[0].id&&dt>0){
   exposure.regenCn+=Math.max(0,e.spirit-before);
   const threshold=e.baseStats.maxSpirit*.20;
   const rate=(e.spirit-before)/dt;
   exposure.lowCnSeconds+=before<threshold?(rate>0?Math.min(dt,(threshold-before)/rate):dt):0;
   if(st?.stacks>0){
    const next=st.nextDecayAt??st.expiresAt+st.decayEverySeconds;
    const until=n=>Math.max(0,Math.min(now,next+(st.stacks-n)*st.decayEverySeconds)-from);
    exposure.phapYUptimeSeconds+=until(1);
    if(st.stacks>=20) exposure.thresholdSeconds+=until(20);
    if(st.stacks>=st.cap) exposure.capSeconds+=until(st.cap);
   }
  }
  return result;
 };
 try{return {kernel:runCombatKernelV3(input),exposure};}
 finally{if(original===Object.getPrototypeOf(CombatEngine.prototype).updateContinuousState) delete CombatEngine.prototype.updateContinuousState;else CombatEngine.prototype.updateContinuousState=original;}
}

export function summarizeSpellP4Run(kernel,profile,seed,exposure={}){
 const playerId=`entity.qa.spell_p4.${profile.id}`,logs=kernel.battle.logs.filter(x=>x.actorId===playerId);
 const result=kernel.combatResult,state=kernel.battle.finalState[playerId],core=state.battleDaoStateV2.spell.core;
 const damage=result.summary.damageByActor[playerId]??0,duration=result.duration;
 const damageBySkill=result.summary.damageBySkillByActor?.[playerId]??{};
 const casts=result.summary.castCountsByActor?.[playerId]??{};
 const channelStarts=logs.filter(x=>x.type==='channel'&&x.data?.hits).length;
 const channelCompletions=logs.filter(x=>x.type==='channel'&&!x.data?.hits).length;
 const unfinished=logs.filter(x=>x.type==='channel'&&x.data?.hits&&x.time+x.data.duration>duration).length;
 const steps=form=>logs.filter(x=>x.data?.spellWheelCommitted===form).length;
 const spends=logs.filter(x=>x.data?.dienPhapCommitted===true);
 const channelDamage=damageBySkill['skill.dao.spell.channel']??0,heavyDamage=damageBySkill['skill.dao.spell.burst']??0;
 const field={profileId:profile.id,label:profile.label,seed,duration,damage,dps:damage/duration,damageBySkill,casts,
  completedCycles:core.completedCycles,readinessCount:core.completedCycles-core.wastedReadyCycles,successfulSpends:core.dienPhapCommits,wastedReadyCycles:core.wastedReadyCycles,
  heavySpends:spends.filter(x=>x.skillId==='skill.dao.spell.burst').length,
  tocCompletions:steps('Tốc Pháp'),castCompletions:steps('Thi Triển'),danCompletions:steps('Dẫn Pháp'),
  channelStarts,channelCompletions,channelInterruptions:channelStarts-channelCompletions-unfinished,unfinishedChannels:unfinished,
  channelCompletionRate:channelStarts?channelCompletions/channelStarts*100:0,channelDamagePct:damage?channelDamage/damage*100:0,heavyDamagePct:damage?heavyDamage/damage*100:0,
  cnSpent:sum(logs.map(x=>x.data?.spiritCost??0))+sum(logs.map(x=>x.data?.spellChannelCnPaid??0)),
  channelCnSpent:sum(logs.map(x=>x.data?.spellChannelCnPaid??0)),cnRestored:sum(logs.map(x=>x.data?.spellCnRestored??0)),
  finalCn:state.spirit,finalPhapY:state.battleDaoStateV2.spell.stack.stacks,
  ultimateCasts:casts['skill.dao.spell.ultimate']??0,breakEvents:logs.filter(x=>x.type==='break'&&x.data?.broken===true).length,
  cycleMeanSeconds:core.completedCycles?duration/core.completedCycles:0,...exposure};
 field.identityValid=duration===180&&field.completedCycles>0&&field.successfulSpends>0&&field.ultimateCasts>0&&field.channelCnSpent>0
  && (profile.id!=='burst'||field.heavySpends>0&&field.heavyDamagePct>=15)
  && (profile.id!=='channel'||field.channelCompletions>0&&field.channelDamagePct>=15);
 return Object.fromEntries(Object.entries(field).map(([k,v])=>[k,typeof v==='number'?round(v):v]));
}
export function runSpellP4Benchmark({seeds=SPELL_P4_SEEDS,duration=SPELL_P4_DURATION_SECONDS}={}){
 const problems=validateSpellP4Profiles();if(problems.length)throw Error(problems.join('\n'));
 const registry=buildRegistry(),runs=[];
 for(const profile of SPELL_P4_PROFILES)for(const seed of seeds){
  const {kernel,exposure}=observedRun({registry,seed,entities:[createSpellP4Player(profile),createSpellP4Target()],maxDuration:duration,mode:'simulation'});
  runs.push(summarizeSpellP4Run(kernel,profile,seed,exposure));
 }
 const aggregates=SPELL_P4_PROFILES.map(p=>{
  const rows=runs.filter(x=>x.profileId===p.id),numeric=Object.keys(rows[0]).filter(k=>typeof rows[0][k]==='number'&&!['seed'].includes(k));
  return {id:p.id,label:p.label,allocation:p.allocation,activeSkillIds:p.activeSkillIds,targetRelativeDps:p.targetRelativeDps,validRuns:rows.filter(x=>x.identityValid).length,seeds:rows.length,
   ...Object.fromEntries(numeric.map(k=>[k,round(mean(rows.map(x=>x[k])))])),dpsMin:min(rows.map(x=>x.dps)),dpsMax:max(rows.map(x=>x.dps))};
 });
 const reference=aggregates[0].dps;
 for(const row of aggregates){row.relativeDps=round(row.dps/reference*100);row.withinBand=row.relativeDps>=row.targetRelativeDps[0]&&row.relativeDps<=row.targetRelativeDps[1];}
 const wheel=aggregates.find(x=>x.id==='wheel');
 const cadenceValid=aggregates.filter(x=>x.id!=='wheel').every(x=>wheel.completedCycles>x.completedCycles&&wheel.readinessCount>x.readinessCount&&wheel.cycleMeanSeconds<x.cycleMeanSeconds);
 return {schema:'spell-dao-p4-benchmark.v1',sourceDigest:spellP4SourceDigest(),engine:'combat.v3',durationSeconds:duration,seeds:[...seeds],identityValid:runs.every(x=>x.identityValid)&&cadenceValid,
  passed:runs.every(x=>x.identityValid)&&cadenceValid&&aggregates.every(x=>x.withinBand),cadenceValid,aggregates,runs};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=runSpellP4Benchmark();
 const out=process.argv.find(x=>x.startsWith('--out='))?.slice(6)??'qa/output/spell-p4-benchmark.json';
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({passed:result.passed,identityValid:result.identityValid,cadenceValid:result.cadenceValid,aggregates:result.aggregates},null,2));
 if(!result.passed)process.exitCode=1;
}

