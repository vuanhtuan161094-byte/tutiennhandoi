import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../../dist/content/registry.js';
import { battleDaoV2Catalog } from '../../dist/content/battle-dao-v2-catalog.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';

export const BODY_B5_DURATION_SECONDS=180;
export const BODY_B5_SEEDS=Object.freeze([
  65003,65017,65033,65047,65063,65081,65101,65119,65141,65159,65179,65197,
]);

const BASE_PRIMARY=Object.freeze({power:100,body:100,agility:100,spirit:100,sense:100});
const allocate=x=>Object.fromEntries(Object.keys(BASE_PRIMARY).map(key=>[key,BASE_PRIMARY[key]+(x[key]??0)]));
const round=(value,digits=3)=>{const n=Number(value)||0,p=10**digits;return Math.round(n*p)/p;};
const sum=xs=>xs.reduce((a,b)=>a+(Number(b)||0),0);
const mean=xs=>xs.length?sum(xs)/xs.length:0;
const min=xs=>xs.length?Math.min(...xs):0;
const max=xs=>xs.length?Math.max(...xs):0;

export const BODY_B5_PROFILES=Object.freeze([
  Object.freeze({
    id:'counter',label:'Phản Kình',identity:'counter',
    allocation:{power:90,body:100,agility:60,spirit:20,sense:30},
    activeSkillIds:[
      'skill.dao.body.guard','skill.dao.body.counter','skill.dao.body.recover','skill.dao.body.elephant','skill.dao.body.finisher',
    ],
  }),
  Object.freeze({
    id:'immovable',label:'Bất Động',identity:'immovable',
    allocation:{power:20,body:170,agility:20,spirit:70,sense:20},
    activeSkillIds:[
      'skill.dao.body.guard','skill.dao.body.transform','skill.dao.body.immovable','skill.dao.body.recover','skill.dao.body.elephant',
    ],
  }),
  Object.freeze({
    id:'break',label:'Phá Kình',identity:'break',
    allocation:{power:90,body:90,agility:20,spirit:20,sense:80},
    activeSkillIds:[
      'skill.dao.body.guard','skill.dao.body.break','skill.dao.body.recover','skill.dao.body.elephant','skill.dao.body.finisher',
    ],
  }),
]);

function bodyCatalogMeta(){
  const catalog=battleDaoV2Catalog('body');
  const passiveIds=catalog.passives.map(x=>x.id);
  const allSkillIds=[catalog.basicSkillId,...catalog.tree.map(x=>x.activeSkillId),catalog.ultimateSkillId];
  return {catalog,passiveIds,allSkillIds};
}
function profilePrimary(profile){return allocate(profile.allocation);}

export function validateBodyB5Profiles(){
  const {catalog,allSkillIds}=bodyCatalogMeta();
  const valid=new Set(allSkillIds),problems=[];
  for(const profile of BODY_B5_PROFILES){
    if(profile.activeSkillIds.length!==5) problems.push(`${profile.id}: expected exactly 5 Active slots`);
    if(new Set(profile.activeSkillIds).size!==5) problems.push(`${profile.id}: duplicate Active skill`);
    if(sum(Object.values(profile.allocation))!==300) problems.push(`${profile.id}: allocation budget must be 300`);
    for(const id of profile.activeSkillIds){
      if(!catalog.tree.some(row=>row.activeSkillId===id)) problems.push(`${profile.id}: not a Body Active: ${id}`);
    }
    for(const id of [catalog.basicSkillId,...profile.activeSkillIds,catalog.ultimateSkillId]){
      if(!valid.has(id)) problems.push(`${profile.id}: unknown Body skill: ${id}`);
    }
  }
  return problems;
}

export function createBodyB5Player(profile){
  const {catalog,passiveIds,allSkillIds}=bodyCatalogMeta();
  const primary=profilePrimary(profile);
  const equipped=[catalog.basicSkillId,...profile.activeSkillIds,catalog.ultimateSkillId];
  return {
    id:`entity.qa.body_b5.${profile.id}`,
    name:`QA Body B5 · ${profile.label}`,
    combatModel:'locked-v1',
    tags:['Human','Cultivator','Body','Benchmark'],
    stats:{
      primaryStatsV5:{...primary},
      attack:primary.power,
      physique:primary.body,
      maxHp:primary.body*100,
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
    aiProfile:battleDaoAutoRotationV127('body',equipped),
    initialUltimateGaugeV117:0,
    combatBuildV117:{
      battleDaoV2Enabled:true,
      mainDaoId:'body',
      realmOrder:102,
      daoHanhCurrentV129:{body:100},
      learnedDaoPassiveIdsV118:passiveIds,
      passiveLevelsV125:Object.fromEntries(passiveIds.map(id=>[id,20])),
      skillPracticeTierV125:Object.fromEntries(allSkillIds.map(id=>[id,1000])),
      skillLevelsV12317:{},skillGradesV12317:{},rootUnlocked:{},rootEffectivenessPct:{},rootLevelsV133:{},
      activeRootOriginIdsV132:{},activeSetMechanics:[],skillRootBindingsV118:{},activeVariantIdsV118:[],
    },
  };
}

export function createBodyB5Target(){
  return {
    id:'entity.qa.body_b5.target',
    name:'B5 Trấn Thể Chiến Khôi',
    combatModel:'locked-v1',
    tags:['Boss','Benchmark','TrainingDummy'],
    stats:{
      primaryStatsV5:{power:360,body:220,agility:120,spirit:100,sense:200},
      maxHp:50_000_000,maxSpirit:100,spiritStandard:100,spiritRegenStandardPctPerSecond:2,
      attack:360,defense:220,mobility:120,accuracy:200,controlPower:20,resolve:240,
      dodgeChancePct:0,critChancePct:0,critPowerPerLayer:.5,heartChancePct:0,actionSpeed:.90,
    },
    skillIds:['skill.boss.v81.crushing_slam','skill.boss.v81.cataclysm','skill.basic_strike'],
    triggers:[],
    aiProfile:{name:'B5 Pressure Boss',rules:[
      {skillId:'skill.boss.v81.crushing_slam',priority:30,conditions:[{type:'always'}]},
      {skillId:'skill.boss.v81.cataclysm',priority:20,conditions:[{type:'always'}]},
      {skillId:'skill.basic_strike',priority:10,conditions:[{type:'always'}]},
    ]},
  };
}

function castCounts(summary,playerId){return {...(summary.castCountsByActor?.[playerId]??{})};}
function damageLogsFor(logs,actorId,skillId){
  return logs.filter(x=>x.actorId===actorId&&x.type==='damage'&&x.skillId===skillId);
}
function postBreakPayoffCount(logs,playerId){
  const broken=logs.filter(x=>x.actorId===playerId&&x.type==='break'&&x.data?.broken===true).map(x=>Number(x.time)||0);
  if(!broken.length) return 0;
  return logs.filter(x=>{
    if(x.actorId!==playerId||x.type!=='damage') return false;
    if(x.skillId!=='skill.dao.body.elephant'&&x.skillId!=='skill.dao.body.finisher') return false;
    const t=Number(x.time)||0;
    return broken.some(bt=>t>=bt&&t<=bt+5.001);
  }).length;
}

export function summarizeBodyB5Run(kernel,profile,seed,requestedDuration=BODY_B5_DURATION_SECONDS){
  const playerId=`entity.qa.body_b5.${profile.id}`;
  const result=kernel.combatResult,battle=kernel.battle;
  const logs=battle.logs;
  const playerLogs=logs.filter(x=>x.actorId===playerId);
  const incomingLogs=logs.filter(x=>x.targetId===playerId);
  const state=battle.finalState[playerId]??{};
  const body=state.battleDaoStateV2?.body??{};
  const core=body.core??{};
  const damage=Number(result.summary.damageByActor?.[playerId]??0);
  const duration=Math.max(.001,Number(result.duration)||0);
  const casts=castCounts(result.summary,playerId);
  const counterForceGenerated=sum(playerLogs.map(x=>x.data?.counterForceGain??0));
  const counterSamples=playerLogs.filter(x=>Number.isFinite(Number(x.data?.counterForce))).map(x=>Number(x.data.counterForce));
  const shieldAbsorbed=sum(incomingLogs.filter(x=>x.type==='shield').map(x=>x.data?.absorbed??0));
  const hpDamageTaken=sum(incomingLogs.filter(x=>x.type==='damage').map(x=>x.data?.damage??0));
  const counterCasts=Number(casts['skill.dao.body.counter']??0);
  const counterHits=damageLogsFor(logs,playerId,'skill.dao.body.counter').length;
  const immovableCompletions=playerLogs.filter(x=>x.type==='channel'&&x.skillId==='skill.dao.body.immovable'&&String(x.message??'').includes('kết thúc duy trì')).length;
  const breakCashouts=Number(casts['skill.dao.body.break']??0);
  const brokenEvents=playerLogs.filter(x=>x.type==='break'&&x.data?.broken===true).length;
  const postBreakPayoffs=postBreakPayoffCount(logs,playerId);
  const cashoutEvents=Number(core.bodyCashoutEvents??0);
  const mitigationEvents=Number(core.bodyMitigationEvents??0);
  const finalHp=Number(state.hp??0);
  const maxHp=profilePrimary(profile).body*100;
  const alive=state.alive!==false&&finalHp>0;
  const fullDuration=duration>=requestedDuration-.05;
  let identityValid=false;
  if(profile.identity==='counter') identityValid=alive&&fullDuration&&counterForceGenerated>0&&mitigationEvents>0&&cashoutEvents>0&&counterCasts>0&&counterHits>0;
  else if(profile.identity==='immovable') identityValid=alive&&fullDuration&&counterForceGenerated>0&&mitigationEvents>0&&immovableCompletions>0&&shieldAbsorbed>0&&hpDamageTaken>0;
  else if(profile.identity==='break') identityValid=alive&&fullDuration&&counterForceGenerated>0&&cashoutEvents>0&&breakCashouts>0&&brokenEvents>0&&postBreakPayoffs>0;
  return {
    profileId:profile.id,label:profile.label,seed,duration:round(duration),damage:round(damage),dps:round(damage/duration),
    alive,fullDuration,finalHp:round(finalHp),finalHpPct:round(maxHp>0?finalHp/maxHp*100:0,2),
    counterForceGenerated:round(counterForceGenerated),finalCounterForce:round(core.counterForce??0),maxCounterForceSample:counterSamples.length?round(max(counterSamples)):round(core.counterForce??0),
    mitigationEvents,cashoutEvents,counterCasts,counterHits,immovableCompletions,breakCashouts,brokenEvents,postBreakPayoffs,
    shieldAbsorbed:round(shieldAbsorbed),hpDamageTaken:round(hpDamageTaken),
    recoverCasts:Number(casts['skill.dao.body.recover']??0),finisherCasts:Number(casts['skill.dao.body.finisher']??0),ultimateCasts:Number(casts['skill.dao.body.ultimate']??0),
    casts,damageBySkill:{...(result.summary.damageBySkillByActor?.[playerId]??{})},outcome:result.outcome,identityValid,
  };
}

function aggregateProfile(profile,runs){
  const field=name=>runs.map(x=>Number(x[name])||0);
  return {
    id:profile.id,label:profile.label,allocation:{...profile.allocation},primaryStatsV5:profilePrimary(profile),activeSkillIds:[...profile.activeSkillIds],
    seeds:runs.length,validRuns:runs.filter(x=>x.identityValid).length,
    dps:{mean:round(mean(field('dps'))),min:round(min(field('dps'))),max:round(max(field('dps')))},
    damageMean:round(mean(field('damage'))),finalHpPctMean:round(mean(field('finalHpPct')),2),
    counterForceGeneratedMean:round(mean(field('counterForceGenerated'))),maxCounterForceSampleMean:round(mean(field('maxCounterForceSample'))),
    mitigationEventsMean:round(mean(field('mitigationEvents'))),cashoutEventsMean:round(mean(field('cashoutEvents'))),
    counterCastsMean:round(mean(field('counterCasts'))),counterHitsMean:round(mean(field('counterHits'))),
    immovableCompletionsMean:round(mean(field('immovableCompletions'))),breakCashoutsMean:round(mean(field('breakCashouts'))),brokenEventsMean:round(mean(field('brokenEvents'))),postBreakPayoffsMean:round(mean(field('postBreakPayoffs'))),
    shieldAbsorbedMean:round(mean(field('shieldAbsorbed'))),hpDamageTakenMean:round(mean(field('hpDamageTaken'))),recoverCastsMean:round(mean(field('recoverCasts'))),finisherCastsMean:round(mean(field('finisherCasts'))),ultimateCastsMean:round(mean(field('ultimateCasts'))),
  };
}

function addRelativeDps(aggregates){
  const baseline=Math.max(.0001,aggregates.find(x=>x.id==='counter')?.dps.mean??1);
  return aggregates.map(row=>({...row,relativeDps:round(row.dps.mean/baseline*100,2)}));
}

export function runBodyB5Benchmark({duration=BODY_B5_DURATION_SECONDS,seeds=BODY_B5_SEEDS}={}){
  const problems=validateBodyB5Profiles();
  if(problems.length) throw new Error(`Body B5 profile contract invalid:\n- ${problems.join('\n- ')}`);
  const registry=buildRegistry(),runs=[];
  for(const profile of BODY_B5_PROFILES){
    for(const seed of seeds){
      const player=createBodyB5Player(profile),target=createBodyB5Target();
      const kernel=runCombatKernelV3({registry,seed,entities:[player,target],maxDuration:duration,mode:'simulation'});
      runs.push(summarizeBodyB5Run(kernel,profile,seed,duration));
    }
  }
  const invalid=runs.filter(x=>!x.identityValid);
  if(invalid.length){
    const rows=invalid.map(x=>`${x.profileId}@${x.seed}`).join(', ');
    throw new Error(`BODY_B5_INVALID_IDENTITY_RUN: defining mechanic missing in ${rows}`);
  }
  const aggregates=addRelativeDps(BODY_B5_PROFILES.map(profile=>aggregateProfile(profile,runs.filter(x=>x.profileId===profile.id))));
  return {
    schema:'body-dao-b5-benchmark.v1',generatedAt:new Date().toISOString(),engine:'combat.v3',durationSeconds:duration,seeds:[...seeds],
    notes:[
      'Diagnostic only: does not modify gameplay or auto-tune coefficients.',
      'Each profile uses exactly 5 Body Active slots plus Basic and Ultimate.',
      'All 8 Body passives are Lv20; all 10 Body mastery tiers are 1000.',
      'Every profile uses the same 300-point allocation budget over the same five-stat base.',
      'The pressure target uses real cast-time Boss skills so Phản Kình cannot pass against an idle dummy.',
      'Identity-invalid runs are rejected: Phản Kình needs real Phản Thế generation + Counter casts/hits + cash-out; Bất Động needs completed channel + shield absorption + nonzero HP damage; Phá Kình needs real spend + Broken + payoff during the Broken window.',
      'B5 records baseline identity and relative DPS only. Numerical target bands and any coefficient tuning belong to B6 after this evidence is reviewed.',
    ],aggregates,runs,
  };
}

function parseCli(argv){
  const opts={duration:BODY_B5_DURATION_SECONDS,seeds:[...BODY_B5_SEEDS],out:path.resolve('qa/output/body-b5-benchmark.json')};
  for(const arg of argv){
    if(arg==='--quick'){opts.seeds=opts.seeds.slice(0,3);opts.duration=90;}
    else if(arg.startsWith('--duration=')) opts.duration=Math.max(10,Number(arg.split('=')[1])||BODY_B5_DURATION_SECONDS);
    else if(arg.startsWith('--seeds=')){const n=Math.max(1,Math.floor(Number(arg.split('=')[1])||opts.seeds.length));opts.seeds=opts.seeds.slice(0,n);}
    else if(arg.startsWith('--out=')) opts.out=path.resolve(arg.slice('--out='.length));
  }
  return opts;
}
function printSummary(result){
  console.log(`BODY DAO B5 BENCHMARK · Combat V3 · ${result.durationSeconds}s · ${result.seeds.length} seeds`);
  for(const row of result.aggregates){
    console.log(`${row.id.padEnd(10)} DPS=${String(row.dps.mean).padStart(10)} rel=${String(row.relativeDps).padStart(6)}% force=${String(row.counterForceGeneratedMean).padStart(7)} cash=${String(row.cashoutEventsMean).padStart(5)} counter=${String(row.counterHitsMean).padStart(5)} immovable=${String(row.immovableCompletionsMean).padStart(5)} broken=${String(row.brokenEventsMean).padStart(5)} valid=${row.validRuns}/${row.seeds}`);
  }
  console.log('B5 baseline only; no coefficient was changed by this harness.');
}

const entry=fileURLToPath(import.meta.url);
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(entry)){
  try{
    const opts=parseCli(process.argv.slice(2));
    const result=runBodyB5Benchmark(opts);
    fs.mkdirSync(path.dirname(opts.out),{recursive:true});
    fs.writeFileSync(opts.out,`${JSON.stringify(result,null,2)}\n`,'utf8');
    printSummary(result);
    console.log(`Output: ${opts.out}`);
  }catch(error){
    console.error(error?.stack??String(error));
    process.exitCode=1;
  }
}
