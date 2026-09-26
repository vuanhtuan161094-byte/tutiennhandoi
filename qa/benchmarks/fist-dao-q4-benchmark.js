import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../../dist/content/registry.js';
import { battleDaoV2Catalog } from '../../dist/content/battle-dao-v2-catalog.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import { battleDaoV2MainDamageTuningV129 } from '../../dist/core/battle-dao-v2-runtime.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';

export const FIST_Q4_DURATION_SECONDS = 180;
export const FIST_Q4_SEEDS = Object.freeze([
  63001,63017,63029,63043,63059,63073,63089,63103,63121,63139,63157,63179,
]);

const BASE_PRIMARY = Object.freeze({ power:100, body:100, agility:100, spirit:100, sense:100 });
const allocation = x => Object.fromEntries(Object.keys(BASE_PRIMARY).map(key => [key, BASE_PRIMARY[key] + (x[key] ?? 0)]));
const round=(value,digits=3)=>{const n=Number(value)||0,p=10**digits;return Math.round(n*p)/p;};
const sum=xs=>xs.reduce((a,b)=>a+(Number(b)||0),0);
const mean=xs=>xs.length?sum(xs)/xs.length:0;
const min=xs=>xs.length?Math.min(...xs):0;
const max=xs=>xs.length?Math.max(...xs):0;
const finite=v=>Number.isFinite(Number(v));

export const FIST_Q4_PROFILES = Object.freeze([
  Object.freeze({
    id:'heavy', label:'Trọng Quyền', targetRelativeDps:[100,100],
    allocation:{ power:160, body:70, agility:20, spirit:25, sense:25 },
    activeSkillIds:[
      'skill.dao.fist.nurture',
      'skill.dao.fist.shock',
      'skill.dao.fist.heavy',
      'skill.dao.fist.pressure',
      'skill.dao.fist.finisher',
    ],
  }),
  Object.freeze({
    id:'chain', label:'Liên Hoàn', targetRelativeDps:[92,98],
    allocation:{ power:130, body:35, agility:85, spirit:25, sense:25 },
    activeSkillIds:[
      'skill.dao.fist.triple',
      'skill.dao.fist.shock',
      'skill.dao.fist.nurture',
      'skill.dao.fist.chain_heavy',
      'skill.dao.fist.pressure',
    ],
  }),
  Object.freeze({
    id:'counter', label:'Phản Quyền', targetRelativeDps:[85,92],
    allocation:{ power:120, body:75, agility:55, spirit:25, sense:25 },
    activeSkillIds:[
      'skill.dao.fist.shock',
      'skill.dao.fist.nurture',
      'skill.dao.fist.heavy',
      'skill.dao.fist.counter',
      'skill.dao.fist.finisher',
    ],
  }),
]);

function fistCatalogMeta(){
  const catalog=battleDaoV2Catalog('fist');
  const passiveIds=catalog.passives.map(x=>x.id);
  const allSkillIds=[catalog.basicSkillId,...catalog.tree.map(x=>x.activeSkillId),catalog.ultimateSkillId];
  return {catalog,passiveIds,allSkillIds};
}
function profilePrimary(profile){ return allocation(profile.allocation); }

export function validateFistQ4Profiles(){
  const {catalog,allSkillIds}=fistCatalogMeta();
  const valid=new Set(allSkillIds), problems=[];
  for(const profile of FIST_Q4_PROFILES){
    if(profile.activeSkillIds.length!==5) problems.push(`${profile.id}: expected exactly 5 Active slots`);
    if(new Set(profile.activeSkillIds).size!==5) problems.push(`${profile.id}: duplicate Active skill`);
    if(sum(Object.values(profile.allocation))!==300) problems.push(`${profile.id}: allocation budget must be 300`);
    for(const id of profile.activeSkillIds) if(!catalog.tree.some(row=>row.activeSkillId===id)) problems.push(`${profile.id}: not a Fist Active: ${id}`);
    for(const id of [catalog.basicSkillId,...profile.activeSkillIds,catalog.ultimateSkillId]) if(!valid.has(id)) problems.push(`${profile.id}: unknown Fist skill: ${id}`);
  }
  return problems;
}

export function createFistQ4Player(profile){
  const {catalog,passiveIds,allSkillIds}=fistCatalogMeta();
  const primary=profilePrimary(profile);
  const equipped=[catalog.basicSkillId,...profile.activeSkillIds,catalog.ultimateSkillId];
  return {
    id:`entity.qa.fist_q4.${profile.id}`, name:`QA Fist Q4 · ${profile.label}`,
    combatModel:'locked-v1', tags:['Human','Cultivator','Fist','Benchmark'],
    stats:{
      primaryStatsV5:{...primary},
      attack:primary.power,
      physique:primary.body,
      maxHp:primary.body*20,
      defense:primary.body,
      mobility:primary.agility,
      maxSpirit:primary.spirit,
      spiritStandard:100,
      spiritRegenStandardPctPerSecond:2,
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
    aiProfile:battleDaoAutoRotationV127('fist',equipped),
    initialUltimateGaugeV117:0,
    combatBuildV117:{
      battleDaoV2Enabled:true,
      mainDaoId:'fist',
      realmOrder:102,
      daoHanhCurrentV129:{fist:100},
      learnedDaoPassiveIdsV118:passiveIds,
      passiveLevelsV125:Object.fromEntries(passiveIds.map(id=>[id,20])),
      skillPracticeTierV125:Object.fromEntries(allSkillIds.map(id=>[id,1000])),
      skillLevelsV12317:{},
      skillGradesV12317:{},
      rootUnlocked:{},
      rootEffectivenessPct:{},
      rootLevelsV133:{},
      activeRootOriginIdsV132:{},
      activeSetMechanics:[],
      skillRootBindingsV118:{},
      activeVariantIdsV118:[],
    },
  };
}

export function createFistQ4Target(){
  return {
    id:'entity.qa.fist_q4.target',
    name:'Q4 Huyền Thiết Mộc Nhân',
    combatModel:'locked-v1',
    tags:['Boss','Benchmark','TrainingDummy'],
    stats:{
      primaryStatsV5:{power:100,body:200,agility:130,spirit:100,sense:160},
      maxHp:50_000_000,
      maxSpirit:0,
      attack:1,
      defense:200,
      mobility:130,
      accuracy:160,
      controlPower:0,
      resolve:220,
      dodgeChancePct:0,
      critChancePct:0,
      critPowerPerLayer:.5,
      heartChancePct:0,
      actionSpeed:.5,
    },
    skillIds:['skill.basic_strike'],
    triggers:[],
    aiProfile:{name:'Q4 Dummy',rules:[{skillId:'skill.basic_strike',priority:10,conditions:[{type:'always'}]}]},
  };
}

function resourceSamples(logs,key){
  return logs.filter(x=>finite(x.data?.[key])).map(x=>({time:Number(x.time)||0,value:Number(x.data[key])||0,data:x.data}));
}
function firstAt(samples,predicate){
  const row=samples.find(x=>predicate(x.value,x.data));
  return row?round(row.time,3):null;
}
function avgInterval(times){
  if(times.length<2) return null;
  const gaps=times.slice(1).map((t,i)=>t-times[i]);
  return round(mean(gaps),3);
}
function averageMap(runs,key){
  const ids=new Set(runs.flatMap(run=>Object.keys(run[key]??{})));
  return Object.fromEntries([...ids].sort().map(id=>[id,round(mean(runs.map(run=>Number(run[key]?.[id]??0))))]));
}

export function summarizeFistQ4Run(kernel,profile,seed){
  const playerId=`entity.qa.fist_q4.${profile.id}`;
  const result=kernel.combatResult, battle=kernel.battle;
  const logs=battle.logs.filter(x=>x.actorId===playerId);
  const state=battle.finalState[playerId]??{};
  const fist=state.battleDaoStateV2?.fist??{};
  const forceSamples=resourceSamples(logs,'fistForce');
  const stackSamples=resourceSamples(logs,'fistPassiveStack');
  const forceValues=forceSamples.map(x=>x.value);
  const stackValues=stackSamples.map(x=>x.value);
  const breakTimes=logs.filter(x=>x.type==='break'&&x.data?.broken===true).map(x=>Number(x.time)||0);
  const damage=Number(result.summary.damageByActor?.[playerId]??0);
  const duration=Math.max(.001,Number(result.duration)||0);
  const casts={...(result.summary.castCountsByActor?.[playerId]??{})};
  const forceGenerated=sum(logs.map(x=>x.data?.fistForceGenerated??0));
  const forceSpent=sum(logs.map(x=>x.data?.fistForceSpent??0));
  const forceRequested=sum(logs.map(x=>x.data?.fistForceRequestedGain??0));
  const heavyPayoffs=logs.filter(x=>x.data?.fistHeavyPayoff===true).length;
  const domainOpens=logs.filter(x=>String(x.message??'').includes('Cửu Thiên Quyền Vực')).length;
  const interrupts=logs.filter(x=>x.type==='counterWindow'&&x.data?.fistCc==='shock_interrupt').length;
  const interruptImmune=logs.filter(x=>x.type==='counterWindow'&&x.data?.fistCc==='shock_immune').length;
  const counterSuccess=logs.filter(x=>x.type==='status'&&x.skillId==='skill.dao.fist.counter').length;
  const shockStaggers=logs.filter(x=>x.type==='status'&&x.skillId==='skill.dao.fist.shock'&&x.data?.immune!==true).length;
  const counterStaggers=logs.filter(x=>x.type==='status'&&x.skillId==='skill.dao.fist.counter'&&x.data?.immune!==true).length;
  const softControls=logs.filter(x=>x.type==='status'&&x.skillId==='skill.dao.fist.pressure'&&String(x.message??'').includes('Trấn Áp')).length;
  const defenseShreds=logs.filter(x=>x.type==='status'&&x.skillId==='skill.dao.fist.pressure'&&String(x.message??'').includes('Phá Giáp')).length;
  const lienCap=Number(fist.stack?.cap??30);
  return {
    profileId:profile.id,label:profile.label,seed,
    duration:round(duration),damage:round(damage),dps:round(damage/duration),
    finalCN:round(state.spirit??0),finalGauge:round(state.ultimateGaugeV117??0),
    finalFistForce:Number(fist.core?.fistForce??0),
    finalFistForceCap:Number(fist.core?.fistForceCap??5),
    fistForceGenerated:round(forceGenerated),
    fistForceRequestedGain:round(forceRequested),
    fistForceSpent:round(forceSpent),
    averageFistForceSample:forceValues.length?round(mean(forceValues)):0,
    fistForce5SamplePct:forceValues.length?round(forceValues.filter(v=>v>=5).length/forceValues.length*100,2):0,
    firstFistForce5At:firstAt(forceSamples,v=>v>=5),
    heavyPayoffs,
    finalLienKinh:Number(fist.stack?.stacks??0),
    lienKinhCap:lienCap,
    averageLienKinhSample:stackValues.length?round(mean(stackValues)):0,
    lienKinhCapSamplePct:stackValues.length?round(stackSamples.filter(x=>x.value>=Number(x.data?.fistPassiveStackCap??lienCap)).length/stackValues.length*100,2):0,
    firstLienKinh20At:firstAt(stackSamples,v=>v>=20),
    firstLienKinhCapAt:firstAt(stackSamples,(v,data)=>v>=Number(data?.fistPassiveStackCap??lienCap)),
    breaks:breakTimes.length,
    firstBreakAt:breakTimes.length?round(breakTimes[0]):null,
    averageBreakInterval:avgInterval(breakTimes),
    interrupts,interruptImmune,counterSuccess,
    shockStaggers,counterStaggers,staggerApplications:shockStaggers+counterStaggers,
    softControlApplications:softControls,defenseShredApplications:defenseShreds,
    ultimateCasts:Number(casts['skill.dao.fist.ultimate']??0),
    domainOpens,
    casts,
    damageBySkill:{...(result.summary.damageBySkillByActor?.[playerId]??{})},
    outcome:result.outcome,
  };
}

function aggregateProfile(profile,runs){
  const field=name=>runs.map(x=>Number(x[name])||0);
  const positive=name=>field(name).filter(x=>x>0);
  return {
    id:profile.id,label:profile.label,
    allocation:{...profile.allocation},
    primaryStatsV5:profilePrimary(profile),
    activeSkillIds:[...profile.activeSkillIds],
    targetRelativeDps:[...profile.targetRelativeDps],
    seeds:runs.length,
    dps:{mean:round(mean(field('dps'))),min:round(min(field('dps'))),max:round(max(field('dps')))},
    damageMean:round(mean(field('damage'))),
    finalCNMean:round(mean(field('finalCN'))),
    finalGaugeMean:round(mean(field('finalGauge'))),
    finalFistForceMean:round(mean(field('finalFistForce'))),
    fistForceGeneratedMean:round(mean(field('fistForceGenerated'))),
    fistForceRequestedGainMean:round(mean(field('fistForceRequestedGain'))),
    fistForceSpentMean:round(mean(field('fistForceSpent'))),
    averageFistForceSampleMean:round(mean(field('averageFistForceSample'))),
    fistForce5SamplePctMean:round(mean(field('fistForce5SamplePct')),2),
    firstFistForce5AtMean:positive('firstFistForce5At').length?round(mean(positive('firstFistForce5At'))):null,
    heavyPayoffsMean:round(mean(field('heavyPayoffs'))),
    finalLienKinhMean:round(mean(field('finalLienKinh'))),
    averageLienKinhSampleMean:round(mean(field('averageLienKinhSample'))),
    lienKinhCapSamplePctMean:round(mean(field('lienKinhCapSamplePct')),2),
    firstLienKinh20AtMean:positive('firstLienKinh20At').length?round(mean(positive('firstLienKinh20At'))):null,
    firstLienKinhCapAtMean:positive('firstLienKinhCapAt').length?round(mean(positive('firstLienKinhCapAt'))):null,
    breaksMean:round(mean(field('breaks'))),
    firstBreakAtMean:positive('firstBreakAt').length?round(mean(positive('firstBreakAt'))):null,
    averageBreakIntervalMean:positive('averageBreakInterval').length?round(mean(positive('averageBreakInterval'))):null,
    interruptsMean:round(mean(field('interrupts'))),
    interruptImmuneMean:round(mean(field('interruptImmune'))),
    counterSuccessMean:round(mean(field('counterSuccess'))),
    staggerApplicationsMean:round(mean(field('staggerApplications'))),
    softControlApplicationsMean:round(mean(field('softControlApplications'))),
    defenseShredApplicationsMean:round(mean(field('defenseShredApplications'))),
    ultimateCastsMean:round(mean(field('ultimateCasts'))),
    domainOpensMean:round(mean(field('domainOpens'))),
    castsMeanBySkill:averageMap(runs,'casts'),
    damageMeanBySkill:averageMap(runs,'damageBySkill'),
  };
}

function targetAssessment(aggregates){
  const heavy=aggregates.find(x=>x.id==='heavy');
  const baseline=Math.max(.0001,heavy?.dps.mean??1);
  return aggregates.map(row=>{
    const relative=round(row.dps.mean/baseline*100,2);
    const [lo,hi]=row.targetRelativeDps;
    return {...row,relativeDps:relative,withinDpsTarget:relative>=lo&&relative<=hi};
  });
}

export function runFistQ4Benchmark({duration=FIST_Q4_DURATION_SECONDS,seeds=FIST_Q4_SEEDS}={}){
  const problems=validateFistQ4Profiles();
  if(problems.length) throw new Error(`Fist Q4 profile contract invalid:\n- ${problems.join('\n- ')}`);
  const registry=buildRegistry(), runs=[];
  for(const profile of FIST_Q4_PROFILES){
    for(const seed of seeds){
      const player=createFistQ4Player(profile), target=createFistQ4Target();
      const kernel=runCombatKernelV3({registry,seed,entities:[player,target],maxDuration:duration,mode:'simulation'});
      runs.push(summarizeFistQ4Run(kernel,profile,seed));
    }
  }
  const aggregates=targetAssessment(FIST_Q4_PROFILES.map(profile=>aggregateProfile(profile,runs.filter(x=>x.profileId===profile.id))));
  const endgameTuning=battleDaoV2MainDamageTuningV129(createFistQ4Player(FIST_Q4_PROFILES[0]),'fist');
  return {
    schema:'fist-dao-q4-benchmark.v1',
    generatedAt:new Date().toISOString(),
    engine:'combat.v3',
    durationSeconds:duration,
    seeds:[...seeds],
    daoHanh:100,
    fistMainDamageTuningV129:round(endgameTuning,4),
    notes:[
      'Diagnostic only: does not modify gameplay or auto-tune coefficients.',
      'Each profile uses exactly 5 Fist Active slots plus Basic and Ultimate.',
      'All 8 Fist passives are Lv20; all 10 Fist skill mastery tiers are 1000.',
      'All profiles spend the same 300-point Potential allocation budget over the same base five-stat floor.',
      'Dao Hành is fixed at 100, so the current shared Fist endgame output calibration 0.84 is measured explicitly.',
      'Quyền Thế/Liên Kình averages and cap uptime are action-projection samples, not fabricated continuous-time telemetry.',
      'Current event schema exposes final CN but not CN after every skill payment; min-CN is intentionally not fabricated.',
      'Relative DPS targets are internal Fist archetype targets only; they are not cross-Dao rankings.',
    ],
    aggregates,runs,
  };
}

function parseCli(argv){
  const opts={duration:FIST_Q4_DURATION_SECONDS,seeds:[...FIST_Q4_SEEDS],out:path.resolve('qa/output/fist-q4-benchmark.json'),selfTest:false};
  for(const arg of argv){
    if(arg==='--quick'){opts.seeds=opts.seeds.slice(0,3);opts.duration=90;}
    else if(arg==='--self-test') opts.selfTest=true;
    else if(arg.startsWith('--duration=')) opts.duration=Math.max(10,Number(arg.split('=')[1])||FIST_Q4_DURATION_SECONDS);
    else if(arg.startsWith('--seeds=')){const n=Math.max(1,Math.floor(Number(arg.split('=')[1])||opts.seeds.length));opts.seeds=opts.seeds.slice(0,n);}
    else if(arg.startsWith('--out=')) opts.out=path.resolve(arg.slice('--out='.length));
  }
  return opts;
}

function printSummary(report){
  console.table(report.aggregates.map(x=>({
    Build:x.label,
    'DPS TB':x.dps.mean,
    'vs Trọng Quyền':`${x.relativeDps}%`,
    'Target':`${x.targetRelativeDps[0]}–${x.targetRelativeDps[1]}%`,
    'Trong target':x.withinDpsTarget?'YES':'NO',
    'Break TB':x.breaksMean,
    'Break đầu (s)':x.firstBreakAtMean??'-',
    'Ult TB':x.ultimateCastsMean,
    'CN cuối':x.finalCNMean,
    'Quyền Thế TB':x.averageFistForceSampleMean,
    'QT=5 % mẫu':x.fistForce5SamplePctMean,
    'Liên Kình TB':x.averageLienKinhSampleMean,
    'LK cap % mẫu':x.lienKinhCapSamplePctMean,
    'Interrupt':x.interruptsMean,
    'Counter OK':x.counterSuccessMean,
  })));
}

const invoked=process.argv[1]&&path.resolve(process.argv[1])===path.resolve(fileURLToPath(import.meta.url));
if(invoked){
  const opts=parseCli(process.argv.slice(2));
  const problems=validateFistQ4Profiles();
  if(opts.selfTest){
    if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}
    else console.log('FIST Q4 HARNESS SELF-TEST: PASS');
  }else{
    const report=runFistQ4Benchmark(opts);
    fs.mkdirSync(path.dirname(opts.out),{recursive:true});
    fs.writeFileSync(opts.out,JSON.stringify(report,null,2),'utf8');
    printSummary(report);
    console.log(`\nFist Q4 benchmark written: ${opts.out}`);
    console.log('Diagnostic only. Out-of-target rows are evidence for Q5 review, not an automatic balance patch.');
  }
}
