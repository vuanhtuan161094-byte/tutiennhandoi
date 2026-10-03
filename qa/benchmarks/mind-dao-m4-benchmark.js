import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../../dist/content/registry.js';
import { battleDaoV2Catalog } from '../../dist/content/battle-dao-v2-catalog.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';

export const MIND_M4_DURATION_SECONDS=180;
export const MIND_M4_SEEDS=Object.freeze([
  64001,64019,64033,64051,64067,64081,64109,64123,64151,64171,64189,64217,
]);

const BASE_PRIMARY=Object.freeze({power:100,body:100,agility:100,spirit:100,sense:100});
const allocate=x=>Object.fromEntries(Object.keys(BASE_PRIMARY).map(key=>[key,BASE_PRIMARY[key]+(x[key]??0)]));

// Canonical production archetypes come from MIND_DAO_PRODUCTION_SPEC_V1 section 12.
// M4/M5 target bands below retain the newer production-contract values.
export const MIND_M4_PROFILES=Object.freeze([
  Object.freeze({
    id:'burst',label:'Bạo Ấn',targetRelativeDps:[100,100],identityMetric:'burstSpends',
    allocation:{power:150,body:30,agility:25,spirit:35,sense:60},
    activeSkillIds:[
      'skill.dao.mind.mark','skill.dao.mind.split','skill.dao.mind.chase','skill.dao.mind.burst','skill.dao.mind.flow',
    ],
  }),
  Object.freeze({
    id:'echo',label:'Niệm Ảnh',targetRelativeDps:[88,98],targetEchoContributionPct:[15,30],identityMetric:'echoEvents',
    allocation:{power:100,body:25,agility:40,spirit:45,sense:90},
    activeSkillIds:[
      'skill.dao.mind.split','skill.dao.mind.chase','skill.dao.mind.burst','skill.dao.mind.observe','skill.dao.mind.flow',
    ],
  }),
  Object.freeze({
    id:'interference',label:'Nhiễu Thức',targetRelativeDps:[75,90],identityMetric:'interferenceSpends',
    allocation:{power:70,body:35,agility:35,spirit:50,sense:110},
    activeSkillIds:[
      'skill.dao.mind.mark','skill.dao.mind.interfere','skill.dao.mind.guard','skill.dao.mind.observe','skill.dao.mind.flow',
    ],
  }),
]);

const round=(value,digits=3)=>{const n=Number(value)||0,p=10**digits;return Math.round(n*p)/p;};
const sum=xs=>xs.reduce((a,b)=>a+(Number(b)||0),0);
const mean=xs=>xs.length?sum(xs)/xs.length:0;
const min=xs=>xs.length?Math.min(...xs):0;
const max=xs=>xs.length?Math.max(...xs):0;

function mindCatalogMeta(){
  const catalog=battleDaoV2Catalog('mind');
  const passiveIds=catalog.passives.map(x=>x.id);
  const allSkillIds=[catalog.basicSkillId,...catalog.tree.map(x=>x.activeSkillId),catalog.ultimateSkillId];
  return {catalog,passiveIds,allSkillIds};
}
function profilePrimary(profile){return allocate(profile.allocation);}

export function validateMindM4Profiles(){
  const {catalog,allSkillIds}=mindCatalogMeta();
  const valid=new Set(allSkillIds),problems=[];
  for(const profile of MIND_M4_PROFILES){
    if(profile.activeSkillIds.length!==5) problems.push(`${profile.id}: expected exactly 5 Active slots`);
    if(new Set(profile.activeSkillIds).size!==5) problems.push(`${profile.id}: duplicate Active skill`);
    for(const id of profile.activeSkillIds){
      if(!catalog.tree.some(row=>row.activeSkillId===id)) problems.push(`${profile.id}: not a Mind Active: ${id}`);
    }
    const total=sum(Object.values(profile.allocation));
    if(total!==300) problems.push(`${profile.id}: allocation budget ${total}, expected 300`);
    for(const id of [catalog.basicSkillId,...profile.activeSkillIds,catalog.ultimateSkillId]){
      if(!valid.has(id)) problems.push(`${profile.id}: unknown Mind skill: ${id}`);
    }
  }
  return problems;
}

export function createMindM4Player(profile){
  const {catalog,passiveIds,allSkillIds}=mindCatalogMeta();
  const primary=profilePrimary(profile);
  const equipped=[catalog.basicSkillId,...profile.activeSkillIds,catalog.ultimateSkillId];
  const mastery=Object.fromEntries(allSkillIds.map(id=>[id,1000]));
  const passiveLevels=Object.fromEntries(passiveIds.map(id=>[id,20]));
  return {
    id:`entity.qa.mind_m4.${profile.id}`,
    name:`QA Mind M4 · ${profile.label}`,
    combatModel:'locked-v1',
    tags:['Human','Cultivator','Mind','Benchmark'],
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
    aiProfile:battleDaoAutoRotationV127('mind',equipped),
    initialUltimateGaugeV117:0,
    combatBuildV117:{
      battleDaoV2Enabled:true,
      mainDaoId:'mind',
      realmOrder:102,
      learnedDaoPassiveIdsV118:passiveIds,
      passiveLevelsV125:passiveLevels,
      skillPracticeTierV125:mastery,
      skillLevelsV12317:{},skillGradesV12317:{},rootUnlocked:{},rootEffectivenessPct:{},rootLevelsV133:{},
      activeRootOriginIdsV132:{},activeSetMechanics:[],skillRootBindingsV118:{},activeVariantIdsV118:[],
    },
  };
}

export function createMindM4Target(){
  return {
    id:'entity.qa.mind_m4.target',
    name:'M4 Tĩnh Tâm Huyền Khôi',
    combatModel:'locked-v1',
    tags:['Boss','Benchmark','TrainingDummy'],
    stats:{
      primaryStatsV5:{power:100,body:200,agility:110,spirit:100,sense:180},
      maxHp:50_000_000,maxSpirit:100,spiritStandard:100,spiritRegenStandardPctPerSecond:2,
      attack:25,defense:200,mobility:110,accuracy:180,controlPower:20,resolve:220,
      dodgeChancePct:0,critChancePct:0,critPowerPerLayer:.5,heartChancePct:0,actionSpeed:.65,
    },
    skillIds:['skill.basic_strike'],triggers:[],
    aiProfile:{name:'M4 Mind Dummy',rules:[{skillId:'skill.basic_strike',priority:10,conditions:[{type:'always'}]}]},
  };
}

function castCounts(summary,playerId){return {...(summary.castCountsByActor?.[playerId]??{})};}

export function summarizeMindM4Run(kernel,profile,seed){
  const playerId=`entity.qa.mind_m4.${profile.id}`;
  const targetId='entity.qa.mind_m4.target';
  const result=kernel.combatResult,battle=kernel.battle;
  const allLogs=battle.logs;
  const logs=allLogs.filter(x=>x.actorId===playerId);
  const state=battle.finalState[playerId]??{};
  const mind=state.battleDaoStateV2?.mind;
  const damage=Number(result.summary.damageByActor?.[playerId]??0);
  const duration=Math.max(.001,Number(result.duration)||0);
  const casts=castCounts(result.summary,playerId);
  const echoLogs=logs.filter(x=>x.data?.mindSnapshot===true);
  const echoDamage=sum(echoLogs.map(x=>x.data?.damage??0));
  const markGain=sum(logs.map(x=>x.data?.mindSealGain??x.data?.mindObserveMarkGain??x.data?.mindFlowBonusMarkGain??0));
  const spentLogs=logs.filter(x=>Number(x.data?.consumed??0)>0&&x.data?.mindV2===true);
  const markSpent=sum(spentLogs.map(x=>x.data?.consumed??0));
  const burstSpends=spentLogs.filter(x=>x.skillId==='skill.dao.mind.burst').length;
  const interferenceSpends=spentLogs.filter(x=>x.skillId==='skill.dao.mind.interfere').length;
  const ultimateSpends=spentLogs.filter(x=>x.skillId==='skill.dao.mind.ultimate').length;
  const invalidSpends=logs.filter(x=>x.data?.invalidMindSpend===true).length;
  const interferenceDelayLogs=allLogs.filter(x=>x.actorId===targetId&&x.targetId===targetId&&x.type==='info'&&Number(x.data?.delaySeconds)>0);
  const interferenceDelaySeconds=sum(interferenceDelayLogs.map(x=>x.data?.delaySeconds??0));
  const mindControlLogs=logs.filter(x=>x.type==='status'&&['skill.dao.mind.interfere','skill.dao.mind.ultimate'].includes(x.skillId)&&Number(x.data?.duration)>0);
  const mindControlSeconds=sum(mindControlLogs.map(x=>x.data?.duration??0));
  const interferenceControlLogs=mindControlLogs.filter(x=>x.skillId==='skill.dao.mind.interfere');
  const interferenceControlSeconds=sum(interferenceControlLogs.map(x=>x.data?.duration??0));
  const interferenceMetric=interferenceDelaySeconds+mindControlSeconds;
  const stackSamples=logs.filter(x=>Number.isFinite(Number(x.data?.mindPassiveStack))).map(x=>Number(x.data.mindPassiveStack));
  const echoContributionPct=damage>0?echoDamage/damage*100:0;
  const definingValue=profile.identityMetric==='echoEvents'?echoLogs.length:profile.identityMetric==='burstSpends'?burstSpends:interferenceSpends;
  const realInterference=profile.id!=='interference'||interferenceDelaySeconds>0||interferenceControlSeconds>0;
  return {
    profileId:profile.id,label:profile.label,seed,duration:round(duration),damage:round(damage),dps:round(damage/duration),
    echoEvents:echoLogs.length,echoDamage:round(echoDamage),echoContributionPct:round(echoContributionPct,2),
    markGenerated:round(markGain),markSpent:round(markSpent),burstSpends,interferenceSpends,ultimateSpends,invalidSpends,
    interferenceDelayEvents:interferenceDelayLogs.length,interferenceDelaySeconds:round(interferenceDelaySeconds),
    mindControlEvents:mindControlLogs.length,mindControlSeconds:round(mindControlSeconds),
    interferenceControlEvents:interferenceControlLogs.length,interferenceControlSeconds:round(interferenceControlSeconds),
    interferenceMetric:round(interferenceMetric),
    finalMindStacks:Number(mind?.stack?.stacks??0),maxMindStackSample:stackSamples.length?max(stackSamples):Number(mind?.stack?.stacks??0),
    finalEchoCounter:round(mind?.core?.echoCounter??0),finalCN:round(state.spirit??0),finalGauge:round(state.ultimateGaugeV117??0),
    casts,damageBySkill:{...(result.summary.damageBySkillByActor?.[playerId]??{})},outcome:result.outcome,
    identityValid:definingValue>0&&markGain>0&&realInterference,
  };
}

function aggregateProfile(profile,runs){
  const field=name=>runs.map(x=>Number(x[name])||0);
  return {
    id:profile.id,label:profile.label,allocation:{...profile.allocation},primaryStatsV5:profilePrimary(profile),
    activeSkillIds:[...profile.activeSkillIds],targetRelativeDps:[...profile.targetRelativeDps],
    targetEchoContributionPct:profile.targetEchoContributionPct?[...profile.targetEchoContributionPct]:null,
    seeds:runs.length,validRuns:runs.filter(x=>x.identityValid).length,
    dps:{mean:round(mean(field('dps'))),min:round(min(field('dps'))),max:round(max(field('dps')))},
    damageMean:round(mean(field('damage'))),echoEventsMean:round(mean(field('echoEvents'))),echoDamageMean:round(mean(field('echoDamage'))),
    echoContributionPctMean:round(mean(field('echoContributionPct')),2),markGeneratedMean:round(mean(field('markGenerated'))),
    markSpentMean:round(mean(field('markSpent'))),burstSpendsMean:round(mean(field('burstSpends'))),
    interferenceSpendsMean:round(mean(field('interferenceSpends'))),ultimateSpendsMean:round(mean(field('ultimateSpends'))),
    invalidSpendsMean:round(mean(field('invalidSpends'))),maxMindStackSampleMean:round(mean(field('maxMindStackSample'))),
    interferenceDelayEventsMean:round(mean(field('interferenceDelayEvents'))),interferenceDelaySecondsMean:round(mean(field('interferenceDelaySeconds'))),
    mindControlEventsMean:round(mean(field('mindControlEvents'))),mindControlSecondsMean:round(mean(field('mindControlSeconds'))),
    interferenceControlEventsMean:round(mean(field('interferenceControlEvents'))),interferenceControlSecondsMean:round(mean(field('interferenceControlSeconds'))),
    interferenceMetricMean:round(mean(field('interferenceMetric'))),
    finalCNMean:round(mean(field('finalCN'))),finalGaugeMean:round(mean(field('finalGauge'))),
  };
}

function assessTargets(aggregates){
  const burst=aggregates.find(x=>x.id==='burst');
  const baseline=Math.max(.0001,burst?.dps.mean??1);
  return aggregates.map(row=>{
    const relativeDps=round(row.dps.mean/baseline*100,2);
    const [lo,hi]=row.targetRelativeDps;
    const echoBand=row.targetEchoContributionPct;
    const echoWithin=echoBand?row.echoContributionPctMean>=echoBand[0]&&row.echoContributionPctMean<=echoBand[1]:null;
    const otherMax=max(aggregates.filter(x=>x.id!==row.id).map(x=>x.interferenceMetricMean));
    return {
      ...row,
      relativeDps,
      withinDpsTarget:relativeDps>=lo&&relativeDps<=hi,
      withinEchoContributionTarget:echoWithin,
      beatsOtherProfilesOnInterference:row.interferenceMetricMean>otherMax+1e-9,
    };
  });
}

function invalidRunReason(x){
  return `${x.profileId}@${x.seed}[dps=${x.dps} marks=${x.markGenerated}/${x.markSpent} burst=${x.burstSpends} echo=${x.echoEvents} nhiễu=${x.interferenceSpends} delay=${x.interferenceDelaySeconds}s control=${x.interferenceControlSeconds}s]`;
}

export function runMindM4Benchmark({duration=MIND_M4_DURATION_SECONDS,seeds=MIND_M4_SEEDS}={}){
  const problems=validateMindM4Profiles();
  if(problems.length) throw new Error(`Mind M4 profile contract invalid:\n- ${problems.join('\n- ')}`);
  const registry=buildRegistry(),runs=[];
  for(const profile of MIND_M4_PROFILES){
    for(const seed of seeds){
      const player=createMindM4Player(profile),target=createMindM4Target();
      const kernel=runCombatKernelV3({registry,seed,entities:[player,target],maxDuration:duration,mode:'simulation'});
      runs.push(summarizeMindM4Run(kernel,profile,seed));
    }
  }
  const invalid=runs.filter(x=>!x.identityValid);
  const aggregates=assessTargets(MIND_M4_PROFILES.map(profile=>aggregateProfile(profile,runs.filter(x=>x.profileId===profile.id))));
  return {
    schema:'mind-dao-m4-benchmark.v1',generatedAt:new Date().toISOString(),engine:'combat.v3',durationSeconds:duration,seeds:[...seeds],
    passed:invalid.length===0,
    invalidRuns:invalid.map(x=>({...x,reason:invalidRunReason(x)})),
    notes:[
      'Diagnostic only: does not modify gameplay or auto-tune coefficients.',
      'Profile allocation/loadout shapes follow the three canonical production archetypes in MIND_DAO_PRODUCTION_SPEC_V1 section 12; current target bands remain owned by the newer production contract.',
      'Each profile uses exactly 5 Mind Active slots plus Basic and Ultimate.',
      'All 8 Mind passives are Lv20; all 10 Mind mastery tiers are 1000.',
      'Every profile uses the same 300-point allocation budget over the same five-stat base.',
      'Identity-invalid runs are preserved in JSON and fail the launcher only after evidence is written.',
      'Bạo Ấn needs real Burst mark spend; Niệm Ảnh needs real snapshot echo; Nhiễu Thức needs real interference mark spend plus real applied cast delay or control.',
      'Nhiễu evidence measures actual post-resistance cast-delay seconds from the controlled target plus actual Mind control-status duration.',
      'Target bands are measured in M4 but are not tuning commands; coefficient changes remain blocked until M5.',
    ],aggregates,runs,
  };
}

function parseCli(argv){
  const opts={duration:MIND_M4_DURATION_SECONDS,seeds:[...MIND_M4_SEEDS],out:path.resolve('qa/output/mind-m4-benchmark.json'),selfTest:false};
  for(const arg of argv){
    if(arg==='--quick'){opts.seeds=opts.seeds.slice(0,3);opts.duration=90;}
    else if(arg==='--self-test') opts.selfTest=true;
    else if(arg.startsWith('--duration=')) opts.duration=Math.max(10,Number(arg.split('=')[1])||MIND_M4_DURATION_SECONDS);
    else if(arg.startsWith('--seeds=')){const n=Math.max(1,Math.floor(Number(arg.split('=')[1])||opts.seeds.length));opts.seeds=opts.seeds.slice(0,n);}
    else if(arg.startsWith('--out=')) opts.out=path.resolve(arg.slice('--out='.length));
  }
  return opts;
}

function printSummary(result){
  console.log(`MIND DAO M4 BENCHMARK · Combat V3 · ${result.durationSeconds}s · ${result.seeds.length} seeds`);
  for(const row of result.aggregates){
    const echo=`echo=${row.echoContributionPctMean}%`;
    const nhiễu=`int=${row.interferenceMetricMean}`;
    console.log(`${row.id.padEnd(12)} DPS=${String(row.dps.mean).padStart(10)} rel=${String(row.relativeDps).padStart(6)}% ${echo.padEnd(13)} ${nhiễu.padEnd(10)} burst=${row.burstSpendsMean} nhiễu=${row.interferenceSpendsMean} valid=${row.validRuns}/${row.seeds}`);
  }
  if(!result.passed){
    console.error(`MIND_M4_INVALID_IDENTITY_RUN: ${result.invalidRuns.map(x=>x.reason).join(', ')}`);
  }
  const interference=result.aggregates.find(x=>x.id==='interference');
  if(interference){
    console.log(`Nhiễu Thức highest interference metric: ${interference.beatsOtherProfilesOnInterference?'YES':'NO'} (${interference.interferenceMetricMean})`);
  }
  console.log('M4 baseline only; no coefficient was changed by this harness.');
}

const self=fileURLToPath(import.meta.url);
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(self)){
  try{
    const opts=parseCli(process.argv.slice(2));
    const result=runMindM4Benchmark(opts);
    printSummary(result);
    if(!opts.selfTest){
      fs.mkdirSync(path.dirname(opts.out),{recursive:true});
      fs.writeFileSync(opts.out,JSON.stringify(result,null,2)+'\n','utf8');
      console.log(`Wrote ${opts.out}`);
    }
    if(!result.passed) process.exitCode=1;
  }catch(error){
    console.error(error?.stack??String(error));
    process.exitCode=1;
  }
}