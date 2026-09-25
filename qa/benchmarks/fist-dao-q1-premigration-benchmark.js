import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../../dist/content/registry.js';
import { battleDaoV2Catalog } from '../../dist/content/battle-dao-v2-catalog.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';

export const FIST_Q1_DURATION_SECONDS=180;
export const FIST_Q1_SEEDS=Object.freeze([62003,62011,62027,62039,62051,62071,62081,62101,62119,62129,62143,62159]);
const BASE=Object.freeze({power:100,body:100,agility:100,spirit:100,sense:100});
const alloc=x=>Object.fromEntries(Object.keys(BASE).map(k=>[k,BASE[k]+(x[k]??0)]));
const sum=xs=>xs.reduce((a,b)=>a+(Number(b)||0),0);
const mean=xs=>xs.length?sum(xs)/xs.length:0;
const min=xs=>xs.length?Math.min(...xs):0;
const max=xs=>xs.length?Math.max(...xs):0;
const round=(v,d=3)=>{const p=10**d;return Math.round((Number(v)||0)*p)/p;};

export const FIST_Q1_PROFILES=Object.freeze([
 Object.freeze({
  id:'heavy',label:'Trọng Quyền',
  allocation:{power:160,body:70,agility:20,spirit:25,sense:25},
  activeSkillIds:['skill.dao.fist.nurture','skill.dao.fist.shock','skill.dao.fist.heavy','skill.dao.fist.pressure','skill.dao.fist.finisher'],
 }),
 Object.freeze({
  id:'chain',label:'Liên Hoàn',
  allocation:{power:130,body:35,agility:85,spirit:25,sense:25},
  activeSkillIds:['skill.dao.fist.triple','skill.dao.fist.nurture','skill.dao.fist.counter','skill.dao.fist.chain_heavy','skill.dao.fist.pressure'],
 }),
 Object.freeze({
  id:'counter',label:'Phản Quyền',
  allocation:{power:120,body:75,agility:55,spirit:25,sense:25},
  activeSkillIds:['skill.dao.fist.shock','skill.dao.fist.nurture','skill.dao.fist.heavy','skill.dao.fist.counter','skill.dao.fist.finisher'],
 }),
]);

function meta(){
 const catalog=battleDaoV2Catalog('fist');
 const passiveIds=catalog.passives.map(x=>x.id);
 const allSkillIds=[catalog.basicSkillId,...catalog.tree.map(x=>x.activeSkillId),catalog.ultimateSkillId];
 return {catalog,passiveIds,allSkillIds};
}
export function validateFistQ1Profiles(){
 const {catalog,allSkillIds}=meta(),valid=new Set(allSkillIds),problems=[];
 for(const p of FIST_Q1_PROFILES){
  if(p.activeSkillIds.length!==5) problems.push(`${p.id}: expected 5 Active slots`);
  if(new Set(p.activeSkillIds).size!==5) problems.push(`${p.id}: duplicate Active`);
  if(sum(Object.values(p.allocation))!==300) problems.push(`${p.id}: allocation budget must be 300`);
  for(const id of p.activeSkillIds) if(!catalog.tree.some(row=>row.activeSkillId===id)) problems.push(`${p.id}: invalid Active ${id}`);
  for(const id of [catalog.basicSkillId,...p.activeSkillIds,catalog.ultimateSkillId]) if(!valid.has(id)) problems.push(`${p.id}: unknown skill ${id}`);
 }
 return problems;
}
export function createFistQ1Player(profile){
 const {catalog,passiveIds,allSkillIds}=meta();
 const primary=alloc(profile.allocation);
 const equipped=[catalog.basicSkillId,...profile.activeSkillIds,catalog.ultimateSkillId];
 return {
  id:`entity.qa.fist_q1.${profile.id}`,name:`QA Fist Q1 · ${profile.label}`,
  combatModel:'locked-v1',tags:['Human','Cultivator','Fist','Benchmark'],
  stats:{
   primaryStatsV5:{...primary},attack:primary.power,physique:primary.body,maxHp:primary.body*20,defense:primary.body,
   mobility:primary.agility,maxSpirit:primary.spirit,spiritStandard:100,spiritRegenStandardPctPerSecond:2,
   accuracy:primary.sense,controlPower:primary.sense,resolve:primary.sense,dodgeChancePct:0,critChancePct:5,critPowerPerLayer:.5,heartChancePct:0,actionSpeed:1,
  },
  skillIds:equipped,triggers:[],aiProfile:battleDaoAutoRotationV127('fist',equipped),initialUltimateGaugeV117:0,
  combatBuildV117:{
   battleDaoV2Enabled:true,mainDaoId:'fist',realmOrder:102,daoHanhCurrentV129:{fist:70},
   learnedDaoPassiveIdsV118:passiveIds,passiveLevelsV125:Object.fromEntries(passiveIds.map(id=>[id,20])),
   skillPracticeTierV125:Object.fromEntries(allSkillIds.map(id=>[id,1000])),
   skillLevelsV12317:{},skillGradesV12317:{},rootUnlocked:{},rootEffectivenessPct:{},rootLevelsV133:{},activeRootOriginIdsV132:{},
   activeSetMechanics:[],skillRootBindingsV118:{},activeVariantIdsV118:[],
  },
 };
}
export function createFistQ1Target(){
 return {
  id:'entity.qa.fist_q1.target',name:'Q1 Huyền Thiết Mộc Nhân',combatModel:'locked-v1',tags:['Boss','Benchmark','TrainingDummy'],
  stats:{primaryStatsV5:{power:100,body:200,agility:130,spirit:100,sense:160},maxHp:50_000_000,maxSpirit:0,attack:1,defense:200,mobility:130,accuracy:160,controlPower:0,resolve:220,dodgeChancePct:0,critChancePct:0,critPowerPerLayer:.5,heartChancePct:0,actionSpeed:.5},
  skillIds:['skill.basic_strike'],triggers:[],aiProfile:{name:'Q1 Dummy',rules:[{skillId:'skill.basic_strike',priority:10,conditions:[{type:'always'}]}]},
 };
}
function summarize(kernel,profile,seed){
 const id=`entity.qa.fist_q1.${profile.id}`,result=kernel.combatResult,battle=kernel.battle;
 const logs=battle.logs.filter(x=>x.actorId===id),state=battle.finalState[id]??{},holder=state.battleDaoStateV2?.fist??{};
 const damage=Number(result.summary.damageByActor?.[id]??0),duration=Math.max(.001,Number(result.duration)||0);
 const casts={...(result.summary.castCountsByActor?.[id]??{})};
 const forceSamples=logs.map(x=>Number(x.data?.fistForce)).filter(Number.isFinite);
 const stackSamples=logs.map(x=>Number(x.data?.fistPassiveStack)).filter(Number.isFinite);
 return {
  profileId:profile.id,label:profile.label,seed,duration:round(duration),damage:round(damage),dps:round(damage/duration),
  finalCN:round(state.spirit??0),finalGauge:round(state.ultimateGaugeV117??0),
  finalFistForce:Number(holder.core?.fistForce??0),finalLienKinh:Number(holder.stack?.stacks??0),
  maxFistForceSample:forceSamples.length?max(forceSamples):Number(holder.core?.fistForce??0),
  maxLienKinhSample:stackSamples.length?max(stackSamples):Number(holder.stack?.stacks??0),
  breaks:logs.filter(x=>x.type==='break'&&x.data?.broken===true).length,
  ultimateCasts:Number(casts['skill.dao.fist.ultimate']??0),casts,
  damageBySkill:{...(result.summary.damageBySkillByActor?.[id]??{})},outcome:result.outcome,
 };
}
function aggregate(profile,runs){
 const field=n=>runs.map(x=>Number(x[n])||0);
 return {
  id:profile.id,label:profile.label,allocation:{...profile.allocation},primaryStatsV5:alloc(profile.allocation),activeSkillIds:[...profile.activeSkillIds],
  seeds:runs.length,dps:{mean:round(mean(field('dps'))),min:round(min(field('dps'))),max:round(max(field('dps')))},
  damageMean:round(mean(field('damage'))),finalCNMean:round(mean(field('finalCN'))),finalGaugeMean:round(mean(field('finalGauge'))),
  finalFistForceMean:round(mean(field('finalFistForce'))),finalLienKinhMean:round(mean(field('finalLienKinh'))),
  breaksMean:round(mean(field('breaks'))),ultimateCastsMean:round(mean(field('ultimateCasts'))),
 };
}
export function runFistQ1Benchmark({seeds=FIST_Q1_SEEDS,duration=FIST_Q1_DURATION_SECONDS}={}){
 const problems=validateFistQ1Profiles();if(problems.length) throw new Error(problems.join('\n'));
 const registry=buildRegistry();
 const migrated=FIST_Q1_PROFILES.flatMap(p=>p.activeSkillIds).some(id=>Boolean(registry.skill(id).fiveStatScalingV5));
 if(migrated) throw new Error('Q1 pre-migration benchmark is historical-only after Fist Q2; use its recorded pre-Q2 SHA or the later Q4 benchmark.');
 const runs=[];
 for(const profile of FIST_Q1_PROFILES) for(const seed of seeds){
  const kernel=runCombatKernelV3({registry,seed,entities:[createFistQ1Player(profile),createFistQ1Target()],maxDuration:duration,mode:'simulation'});
  runs.push(summarize(kernel,profile,seed));
 }
 const aggregates=FIST_Q1_PROFILES.map(p=>aggregate(p,runs.filter(x=>x.profileId===p.id)));
 const heavy=aggregates.find(x=>x.id==='heavy')?.dps.mean||1;
 for(const row of aggregates) row.relativeToHeavyPct=round(row.dps.mean/heavy*100,2);
 return {
  schema:'fist-dao-q1-premigration-benchmark.v1',generatedAt:new Date().toISOString(),engine:'combat.v3',durationSeconds:duration,seeds:[...seeds],
  notes:[
   'Diagnostic pre-migration baseline only; it does not auto-tune or establish final target bands.',
   'Exactly 5 Fist Active slots plus Basic and Ultimate; all Fist passives Lv20 and mastery tiers 1000.',
   'All profiles use the same 300-point allocation budget on the five-stat foundation.',
   'Current Fist skills still use legacy Attack fallback; the purpose is to quantify that baseline before adding per-skill CL/TP/TPH scaling.',
   'Dao Hanh is fixed at 70 so the existing Fist V129 midgame main-Dao multiplier (1.10) is explicit in the baseline.',
  ],aggregates,runs,
 };
}
function print(report){
 console.table(report.aggregates.map(x=>({Build:x.label,'DPS TB':x.dps.mean,'vs Trọng Quyền':`${x.relativeToHeavyPct}%`,'CN cuối':x.finalCNMean,'Quyền Thế':x.finalFistForceMean,'Liên Kình':x.finalLienKinhMean,'Break TB':x.breaksMean,'Ult TB':x.ultimateCastsMean})));
}
const invoked=process.argv[1]&&path.resolve(process.argv[1])===path.resolve(fileURLToPath(import.meta.url));
if(invoked){
 const quick=process.argv.includes('--quick'),seeds=quick?FIST_Q1_SEEDS.slice(0,3):FIST_Q1_SEEDS;
 const report=runFistQ1Benchmark({seeds});
 const out=path.resolve('qa/output/fist-q1-premigration-benchmark.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2),'utf8');
 print(report);console.log(`\nFist Q1 baseline written: ${out}`);console.log('Diagnostic only. No five-stat Fist coefficients have been changed.');
}
