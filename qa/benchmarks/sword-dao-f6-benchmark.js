import fs from 'node:fs';
import path from 'node:path';
import { buildRegistry } from '../../dist/content/registry.js';
import { battleDaoV2Catalog } from '../../dist/content/battle-dao-v2-catalog.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';

export const SWORD_F6_DURATION_SECONDS = 180;
export const SWORD_F6_SEEDS = Object.freeze([
  61001,61019,61031,61043,61057,61069,61091,61121,61141,61169,61183,61211,
]);

const BASE_PRIMARY = Object.freeze({ power:100, body:100, agility:100, spirit:100, sense:100 });
const allocation = x => Object.fromEntries(Object.keys(BASE_PRIMARY).map(key => [key, BASE_PRIMARY[key] + (x[key] ?? 0)]));

export const SWORD_F6_PROFILES = Object.freeze([
  Object.freeze({
    id:'heavy',
    label:'Trọng Trảm',
    targetRelativeDps:[100,100],
    allocation:{ power:180, body:40, agility:20, spirit:30, sense:30 },
    activeSkillIds:[
      'skill.dao.sword.nurture',
      'skill.dao.sword.break_mark',
      'skill.dao.sword.counter',
      'skill.dao.sword.sever',
      'skill.dao.sword.finisher',
    ],
  }),
  Object.freeze({
    id:'flow',
    label:'Lưu Quang',
    targetRelativeDps:[90,95],
    allocation:{ power:130, body:35, agility:80, spirit:25, sense:30 },
    activeSkillIds:[
      'skill.dao.sword.flow_slash',
      'skill.dao.sword.nurture',
      'skill.dao.sword.break_mark',
      'skill.dao.sword.chain',
      'skill.dao.sword.counter',
    ],
  }),
  Object.freeze({
    id:'myriad',
    label:'Ngự Kiếm',
    targetRelativeDps:[85,92],
    allocation:{ power:100, body:35, agility:25, spirit:30, sense:110 },
    activeSkillIds:[
      'skill.dao.sword.nurture',
      'skill.dao.sword.break_mark',
      'skill.dao.sword.counter',
      'skill.dao.sword.finisher',
      'skill.dao.sword.myriad',
    ],
  }),
]);

const round=(value,digits=3)=>{
  const n=Number(value)||0, p=10**digits;
  return Math.round(n*p)/p;
};
const sum=xs=>xs.reduce((a,b)=>a+(Number(b)||0),0);
const mean=xs=>xs.length?sum(xs)/xs.length:0;
const min=xs=>xs.length?Math.min(...xs):0;
const max=xs=>xs.length?Math.max(...xs):0;
const finite=v=>Number.isFinite(Number(v));

function profilePrimary(profile){ return allocation(profile.allocation); }

function swordCatalogMeta(){
  const catalog=battleDaoV2Catalog('sword');
  const passiveIds=catalog.passives.map(x=>x.id);
  const allSkillIds=[catalog.basicSkillId,...catalog.tree.map(x=>x.activeSkillId),catalog.ultimateSkillId];
  return {catalog,passiveIds,allSkillIds};
}

export function validateSwordF6Profiles(){
  const {catalog,allSkillIds}=swordCatalogMeta();
  const valid=new Set(allSkillIds);
  const problems=[];
  for(const profile of SWORD_F6_PROFILES){
    if(profile.activeSkillIds.length!==5) problems.push(`${profile.id}: expected exactly 5 Active slots`);
    if(new Set(profile.activeSkillIds).size!==5) problems.push(`${profile.id}: duplicate Active skill`);
    for(const id of profile.activeSkillIds){
      if(!catalog.tree.some(row=>row.activeSkillId===id)) problems.push(`${profile.id}: not a Sword Active: ${id}`);
    }
    const totalAlloc=sum(Object.values(profile.allocation));
    if(totalAlloc!==300) problems.push(`${profile.id}: allocation budget ${totalAlloc}, expected 300`);
    for(const id of [catalog.basicSkillId,...profile.activeSkillIds,catalog.ultimateSkillId]){
      if(!valid.has(id)) problems.push(`${profile.id}: unknown Sword skill: ${id}`);
    }
  }
  return problems;
}

export function createSwordF6Player(profile){
  const {catalog,passiveIds,allSkillIds}=swordCatalogMeta();
  const primary=profilePrimary(profile);
  const equipped=[catalog.basicSkillId,...profile.activeSkillIds,catalog.ultimateSkillId];
  const mastery=Object.fromEntries(allSkillIds.map(id=>[id,1000]));
  const passiveLevels=Object.fromEntries(passiveIds.map(id=>[id,20]));
  return {
    id:`entity.qa.sword_f6.${profile.id}`,
    name:`QA Sword F6 · ${profile.label}`,
    combatModel:'locked-v1',
    tags:['Human','Cultivator','Sword','Benchmark'],
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
    aiProfile:battleDaoAutoRotationV127('sword',equipped),
    initialUltimateGaugeV117:0,
    combatBuildV117:{
      battleDaoV2Enabled:true,
      mainDaoId:'sword',
      realmOrder:102,
      learnedDaoPassiveIdsV118:passiveIds,
      passiveLevelsV125:passiveLevels,
      skillPracticeTierV125:mastery,
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

export function createSwordF6Target(){
  return {
    id:'entity.qa.sword_f6.target',
    name:'F6 Huyền Thiết Mộc Nhân',
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
    aiProfile:{name:'F6 Dummy',rules:[{skillId:'skill.basic_strike',priority:10,conditions:[{type:'always'}]}]},
  };
}

function resourceSamples(logs,key){
  return logs.filter(x=>x.actorId?.startsWith('entity.qa.sword_f6.')&&finite(x.data?.[key])).map(x=>({time:Number(x.time)||0,value:Number(x.data[key])||0,data:x.data}));
}
function firstAt(samples,predicate){
  const row=samples.find(x=>predicate(x.value,x.data));
  return row?round(row.time,3):null;
}
function skillCasts(summary,playerId){ return {...(summary.castCountsByActor?.[playerId]??{})}; }

export function summarizeSwordF6Run(kernel,profile,seed){
  const playerId=`entity.qa.sword_f6.${profile.id}`;
  const result=kernel.combatResult;
  const battle=kernel.battle;
  const logs=battle.logs.filter(x=>x.actorId===playerId);
  const state=battle.finalState[playerId]??{};
  const sword=state.battleDaoStateV2?.sword;
  const qiSamples=resourceSamples(logs,'swordQi');
  const intentSamples=resourceSamples(logs,'swordIntent');
  const generated=sum(logs.map(x=>x.data?.swordQiGenerated??0));
  const refunded=sum(logs.map(x=>x.data?.swordQiRefunded??0));
  const overflow=sum(logs.map(x=>x.data?.swordQiOverflow??0));
  const finalQi=Number(sword?.core?.swordQi??0);
  const finalIntent=Number(sword?.intent?.stacks??0);
  const finalIntentCap=Number(sword?.intent?.cap??20);
  const estimatedSpent=Math.max(0,generated+refunded-finalQi);
  const damage=Number(result.summary.damageByActor?.[playerId]??0);
  const duration=Math.max(.001,Number(result.duration)||0);
  const casts=skillCasts(result.summary,playerId);
  const breaks=logs.filter(x=>x.type==='break'&&x.data?.broken===true).length;
  const domainOpens=logs.filter(x=>finite(x.data?.swordDomainUntil)).length;
  const oomChannelEnds=logs.filter(x=>String(x.message??'').includes('cạn Chân Nguyên')).length;
  const qiValues=qiSamples.map(x=>x.value);
  const intentValues=intentSamples.map(x=>x.value);
  return {
    profileId:profile.id,label:profile.label,seed,
    duration:round(duration,3),
    damage:round(damage,3),
    dps:round(damage/duration,3),
    finalCN:round(state.spirit??0,3),
    finalGauge:round(state.ultimateGaugeV117??0,3),
    finalQi,finalIntent,finalIntentCap,
    qiGenerated:round(generated,3),
    qiRefunded:round(refunded,3),
    qiSpentEstimate:round(estimatedSpent,3),
    qiOverflow:round(overflow,3),
    averageQi:round(mean(qiValues),3),
    qiZeroSamplePct:qiValues.length?round(qiValues.filter(v=>v<=0).length/qiValues.length*100,2):0,
    intent20At:firstAt(intentSamples,v=>v>=20),
    intentCapAt:firstAt(intentSamples,(v,data)=>v>=Number(data?.swordIntentCap??finalIntentCap)),
    maxIntentSample:intentValues.length?max(intentValues):finalIntent,
    breaks,
    ultimateCasts:Number(casts['skill.dao.sword.ultimate']??0),
    domainOpens,
    oomChannelEnds,
    casts,
    damageBySkill:{...(result.summary.damageBySkillByActor?.[playerId]??{})},
    outcome:result.outcome,
  };
}

function aggregateProfile(profile,runs){
  const field=name=>runs.map(x=>Number(x[name])||0);
  const intent20=field('intent20At').filter(x=>x>0);
  const intentCap=field('intentCapAt').filter(x=>x>0);
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
    finalQiMean:round(mean(field('finalQi'))),
    averageQiMean:round(mean(field('averageQi'))),
    qiZeroSamplePctMean:round(mean(field('qiZeroSamplePct')),2),
    qiGeneratedMean:round(mean(field('qiGenerated'))),
    qiRefundedMean:round(mean(field('qiRefunded'))),
    qiSpentEstimateMean:round(mean(field('qiSpentEstimate'))),
    qiOverflowMean:round(mean(field('qiOverflow'))),
    intent20AtMean:intent20.length?round(mean(intent20)):null,
    intentCapAtMean:intentCap.length?round(mean(intentCap)):null,
    breaksMean:round(mean(field('breaks'))),
    ultimateCastsMean:round(mean(field('ultimateCasts'))),
    domainOpensMean:round(mean(field('domainOpens'))),
    oomChannelEndsTotal:sum(field('oomChannelEnds')),
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

export function runSwordF6Benchmark({duration=SWORD_F6_DURATION_SECONDS,seeds=SWORD_F6_SEEDS}={}){
  const problems=validateSwordF6Profiles();
  if(problems.length) throw new Error(`Sword F6 profile contract invalid:\n- ${problems.join('\n- ')}`);
  const registry=buildRegistry();
  const runs=[];
  for(const profile of SWORD_F6_PROFILES){
    for(const seed of seeds){
      const player=createSwordF6Player(profile);
      const target=createSwordF6Target();
      const kernel=runCombatKernelV3({registry,seed,entities:[player,target],maxDuration:duration,mode:'simulation'});
      runs.push(summarizeSwordF6Run(kernel,profile,seed));
    }
  }
  const aggregates=targetAssessment(SWORD_F6_PROFILES.map(profile=>aggregateProfile(profile,runs.filter(x=>x.profileId===profile.id))));
  return {
    schema:'sword-dao-f6-benchmark.v1',
    generatedAt:new Date().toISOString(),
    engine:'combat.v3',
    durationSeconds:duration,
    seeds:[...seeds],
    notes:[
      'Diagnostic only: does not modify gameplay or auto-tune coefficients.',
      'Each profile uses exactly 5 Sword Active slots plus Basic and Ultimate.',
      'All 8 Sword passives are Lv20; all Sword skill mastery tiers are 1000.',
      'Baseline CN regeneration is 2 CN/s via spiritStandard=100 and regen=2%/s.',
      'Current event schema exposes final CN but not CN after every skill payment; min-CN is intentionally not fabricated.',
      'qiSpentEstimate = generated + refunded - finalQi; Domain cap-clamp loss can make this a conservative estimate.',
    ],
    aggregates,
    runs,
  };
}

function parseCli(argv){
  const opts={duration:SWORD_F6_DURATION_SECONDS,seeds:[...SWORD_F6_SEEDS],out:path.resolve('qa/output/sword-f6-benchmark.json'),selfTest:false};
  for(const arg of argv){
    if(arg==='--quick'){opts.seeds=opts.seeds.slice(0,3);opts.duration=90;}
    else if(arg==='--self-test') opts.selfTest=true;
    else if(arg.startsWith('--duration=')) opts.duration=Math.max(10,Number(arg.split('=')[1])||SWORD_F6_DURATION_SECONDS);
    else if(arg.startsWith('--seeds=')){const n=Math.max(1,Math.floor(Number(arg.split('=')[1])||opts.seeds.length));opts.seeds=opts.seeds.slice(0,n);}
    else if(arg.startsWith('--out=')) opts.out=path.resolve(arg.slice('--out='.length));
  }
  return opts;
}

function printSummary(report){
  const rows=report.aggregates.map(x=>({
    Build:x.label,
    'DPS TB':x.dps.mean,
    'So với Trọng Trảm':`${x.relativeDps}%`,
    'Target':`${x.targetRelativeDps[0]}–${x.targetRelativeDps[1]}%`,
    'Trong target':x.withinDpsTarget?'YES':'NO',
    'Ý 20 (s)':x.intent20AtMean??'-',
    'Ý cap (s)':x.intentCapAtMean??'-',
    'Break TB':x.breaksMean,
    'Ult TB':x.ultimateCastsMean,
    'CN cuối TB':x.finalCNMean,
    'Qi TB':x.averageQiMean,
    'Qi=0 mẫu %':x.qiZeroSamplePctMean,
  }));
  console.table(rows);
}

const invoked=process.argv[1]&&path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname);
if(invoked){
  const opts=parseCli(process.argv.slice(2));
  const problems=validateSwordF6Profiles();
  if(opts.selfTest){
    if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}
    else console.log('SWORD F6 HARNESS SELF-TEST: PASS');
  }else{
    const report=runSwordF6Benchmark(opts);
    fs.mkdirSync(path.dirname(opts.out),{recursive:true});
    fs.writeFileSync(opts.out,JSON.stringify(report,null,2),'utf8');
    printSummary(report);
    console.log(`\nSword F6 benchmark written: ${opts.out}`);
    console.log('Diagnostic only. Out-of-target rows are evidence for review, not an automatic balance patch.');
  }
}
