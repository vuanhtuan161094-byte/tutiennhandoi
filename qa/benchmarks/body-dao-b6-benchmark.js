import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../../dist/content/registry.js';
import { battleDaoV2Catalog } from '../../dist/content/battle-dao-v2-catalog.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import { applyBodyDaoAutoPresetV1, BODY_DAO_AUTO_PRESETS_V1 } from '../../dist/core/body-dao-auto-v1.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';
import { BODY_B5_SEEDS, createBodyB5Target } from './body-dao-b5-benchmark.js';

export const BODY_B6_DURATION_SECONDS=180;
export const BODY_B6_SEEDS=Object.freeze([...BODY_B5_SEEDS]);
export const BODY_B6_PRESET_IDS=Object.freeze(BODY_DAO_AUTO_PRESETS_V1.map(row=>row.id));

const BLOOD_ID='skill.dao.body.elephant';
const BASE_PRIMARY=Object.freeze({power:100,body:100,agility:100,spirit:100,sense:100});
const allocate=x=>Object.fromEntries(Object.keys(BASE_PRIMARY).map(key=>[key,BASE_PRIMARY[key]+(x[key]??0)]));
const round=(value,digits=3)=>{const n=Number(value)||0,p=10**digits;return Math.round(n*p)/p;};
const sum=xs=>xs.reduce((a,b)=>a+(Number(b)||0),0);
const mean=xs=>xs.length?sum(xs)/xs.length:0;
const min=xs=>xs.length?Math.min(...xs):0;
const max=xs=>xs.length?Math.max(...xs):0;

export const BODY_B6_STYLES=Object.freeze([
  Object.freeze({
    id:'defense',label:'Thủ–Phản',identity:'defense',
    allocation:{power:50,body:140,agility:50,spirit:30,sense:30},
    activeSkillIds:[
      'skill.dao.body.guard','skill.dao.body.transform','skill.dao.body.immovable','skill.dao.body.counter','skill.dao.body.recover',
    ],
  }),
  Object.freeze({
    id:'blood',label:'Huyết–Công',identity:'blood',
    allocation:{power:120,body:80,agility:40,spirit:20,sense:40},
    activeSkillIds:[
      'skill.dao.body.guard',BLOOD_ID,'skill.dao.body.break','skill.dao.body.finisher','skill.dao.body.recover',
    ],
  }),
  Object.freeze({
    id:'hybrid',label:'Hybrid',identity:'hybrid',
    allocation:{power:80,body:110,agility:30,spirit:30,sense:50},
    activeSkillIds:[
      'skill.dao.body.guard','skill.dao.body.immovable',BLOOD_ID,'skill.dao.body.counter','skill.dao.body.recover',
    ],
  }),
]);

function bodyCatalogMeta(){
  const catalog=battleDaoV2Catalog('body');
  const passiveIds=catalog.passives.map(x=>x.id);
  const allSkillIds=[catalog.basicSkillId,...catalog.tree.map(x=>x.activeSkillId),catalog.ultimateSkillId];
  return {catalog,passiveIds,allSkillIds};
}
function stylePrimary(style){return allocate(style.allocation);}

export function validateBodyB6Matrix(){
  const {catalog,allSkillIds}=bodyCatalogMeta();
  const valid=new Set(allSkillIds),problems=[];
  if(BODY_B6_PRESET_IDS.join(',')!=='cautious,balanced,aggressive') problems.push('preset order must be cautious, balanced, aggressive');
  for(const style of BODY_B6_STYLES){
    if(style.activeSkillIds.length!==5) problems.push(`${style.id}: expected exactly 5 Active slots`);
    if(new Set(style.activeSkillIds).size!==5) problems.push(`${style.id}: duplicate Active skill`);
    if(sum(Object.values(style.allocation))!==300) problems.push(`${style.id}: allocation budget must be 300`);
    for(const id of style.activeSkillIds){
      if(!catalog.tree.some(row=>row.activeSkillId===id)) problems.push(`${style.id}: not a Body Active: ${id}`);
    }
    for(const id of [catalog.basicSkillId,...style.activeSkillIds,catalog.ultimateSkillId]){
      if(!valid.has(id)) problems.push(`${style.id}: unknown Body skill: ${id}`);
    }
  }
  const defense=BODY_B6_STYLES.find(x=>x.id==='defense');
  const blood=BODY_B6_STYLES.find(x=>x.id==='blood');
  const hybrid=BODY_B6_STYLES.find(x=>x.id==='hybrid');
  if(defense?.activeSkillIds.includes(BLOOD_ID)) problems.push('defense control must not equip Nhiên Huyết');
  if(!blood?.activeSkillIds.includes(BLOOD_ID)) problems.push('blood style must equip Nhiên Huyết');
  if(!hybrid?.activeSkillIds.includes(BLOOD_ID)) problems.push('hybrid style must equip Nhiên Huyết');
  return problems;
}

export function createBodyB6Player(style,presetId){
  const {catalog,passiveIds,allSkillIds}=bodyCatalogMeta();
  const primary=stylePrimary(style);
  const equipped=[catalog.basicSkillId,...style.activeSkillIds,catalog.ultimateSkillId];
  const rotation=battleDaoAutoRotationV127('body',equipped);
  return {
    id:`entity.qa.body_b6.${style.id}.${presetId}`,
    name:`QA Body B6 · ${style.label} · ${presetId}`,
    combatModel:'locked-v1',
    tags:['Human','Cultivator','Body','Benchmark'],
    stats:{
      primaryStatsV5:{...primary},
      attack:primary.power,physique:primary.body,maxHp:primary.body*100,defense:primary.body,
      mobility:primary.agility,maxSpirit:primary.spirit,spiritStandard:100,spiritRegenStandardPctPerSecond:3,
      accuracy:primary.sense,controlPower:primary.sense,resolve:primary.sense,
      dodgeChancePct:0,critChancePct:5,critPowerPerLayer:.5,heartChancePct:0,actionSpeed:1,
    },
    skillIds:equipped,triggers:[],
    aiProfile:applyBodyDaoAutoPresetV1(rotation,presetId),
    initialUltimateGaugeV117:0,
    combatBuildV117:{
      battleDaoV2Enabled:true,mainDaoId:'body',realmOrder:102,daoHanhCurrentV129:{body:100},
      learnedDaoPassiveIdsV118:passiveIds,
      passiveLevelsV125:Object.fromEntries(passiveIds.map(id=>[id,20])),
      skillPracticeTierV125:Object.fromEntries(allSkillIds.map(id=>[id,1000])),
      skillLevelsV12317:{},skillGradesV12317:{},rootUnlocked:{},rootEffectivenessPct:{},rootLevelsV133:{},
      activeRootOriginIdsV132:{},activeSetMechanics:[],skillRootBindingsV118:{},activeVariantIdsV118:[],
    },
  };
}

function castCounts(summary,playerId){return {...(summary.castCountsByActor?.[playerId]??{})};}
function damageLogsFor(logs,actorId,skillId){return logs.filter(x=>x.actorId===actorId&&x.type==='damage'&&x.skillId===skillId);}
function bloodActivationTimes(logs,playerId){
  return logs.filter(x=>x.actorId===playerId&&x.type==='castStart'&&x.skillId===BLOOD_ID).map(x=>Number(x.time)||0);
}
function inBloodWindow(time,activationTimes){return activationTimes.some(start=>time>=start-1e-9&&time<=start+6.001);}

export function summarizeBodyB6Run(kernel,style,presetId,seed,requestedDuration=BODY_B6_DURATION_SECONDS){
  const playerId=`entity.qa.body_b6.${style.id}.${presetId}`;
  const result=kernel.combatResult,battle=kernel.battle,logs=battle.logs;
  const playerLogs=logs.filter(x=>x.actorId===playerId);
  const incomingLogs=logs.filter(x=>x.targetId===playerId);
  const state=battle.finalState[playerId]??{};
  const core=state.battleDaoStateV2?.body?.core??{};
  const damage=Number(result.summary.damageByActor?.[playerId]??0);
  const duration=Math.max(.001,Number(result.duration)||0);
  const casts=castCounts(result.summary,playerId);
  const activationTimes=bloodActivationTimes(logs,playerId);
  const bloodWindowDamageLogs=playerLogs.filter(x=>x.type==='damage'&&inBloodWindow(Number(x.time)||0,activationTimes));
  const bloodWindowDamage=sum(bloodWindowDamageLogs.map(x=>x.data?.damage??0));
  const counterForceGenerated=sum(playerLogs.map(x=>x.data?.counterForceGain??0));
  const shieldAbsorbed=sum(incomingLogs.filter(x=>x.type==='shield').map(x=>x.data?.absorbed??0));
  const hpDamageTaken=sum(incomingLogs.filter(x=>x.type==='damage').map(x=>x.data?.damage??0));
  const counterHits=damageLogsFor(logs,playerId,'skill.dao.body.counter').length;
  const immovableCompletions=playerLogs.filter(x=>x.type==='channel'&&x.skillId==='skill.dao.body.immovable'&&String(x.message??'').includes('kết thúc duy trì')).length;
  const bloodCasts=Number(casts[BLOOD_ID]??0);
  const bloodActivations=Number(core.bodyBloodRushActivations??0);
  const bloodHpPaid=Number(core.bodyBloodRushHpPaid??0);
  const mitigationEvents=Number(core.bodyMitigationEvents??0);
  const cashoutEvents=Number(core.bodyCashoutEvents??0);
  const finalHp=Number(state.hp??0),maxHp=stylePrimary(style).body*100;
  const alive=state.alive!==false&&finalHp>0;
  const fullDuration=duration>=requestedDuration-.05;
  let identityValid=false;
  if(style.identity==='defense'){
    identityValid=alive&&fullDuration&&bloodActivations===0&&mitigationEvents>0&&cashoutEvents>0&&counterHits>0&&immovableCompletions>0;
  }else if(style.identity==='blood'){
    identityValid=alive&&fullDuration&&bloodCasts>0&&bloodActivations>0&&bloodHpPaid>0&&bloodWindowDamageLogs.length>0&&bloodWindowDamage>0;
  }else if(style.identity==='hybrid'){
    identityValid=alive&&fullDuration&&bloodActivations>0&&bloodHpPaid>0&&bloodWindowDamageLogs.length>0&&mitigationEvents>0&&cashoutEvents>0&&counterHits>0&&immovableCompletions>0;
  }
  return {
    styleId:style.id,label:style.label,presetId,seed,duration:round(duration),damage:round(damage),dps:round(damage/duration),
    alive,fullDuration,finalHp:round(finalHp),finalHpPct:round(maxHp>0?finalHp/maxHp*100:0,2),
    counterForceGenerated:round(counterForceGenerated),finalCounterForce:round(core.counterForce??0),
    mitigationEvents,cashoutEvents,counterHits,immovableCompletions,
    bloodCasts,bloodActivations,bloodHpPaid:round(bloodHpPaid),bloodWindowHits:bloodWindowDamageLogs.length,bloodWindowDamage:round(bloodWindowDamage),
    shieldAbsorbed:round(shieldAbsorbed),hpDamageTaken:round(hpDamageTaken),
    recoverCasts:Number(casts['skill.dao.body.recover']??0),breakCasts:Number(casts['skill.dao.body.break']??0),finisherCasts:Number(casts['skill.dao.body.finisher']??0),ultimateCasts:Number(casts['skill.dao.body.ultimate']??0),
    casts,damageBySkill:{...(result.summary.damageBySkillByActor?.[playerId]??{})},outcome:result.outcome,identityValid,
  };
}

function aggregate(style,presetId,runs){
  const field=name=>runs.map(x=>Number(x[name])||0);
  return {
    styleId:style.id,label:style.label,presetId,allocation:{...style.allocation},primaryStatsV5:stylePrimary(style),activeSkillIds:[...style.activeSkillIds],
    seeds:runs.length,validRuns:runs.filter(x=>x.identityValid).length,
    dps:{mean:round(mean(field('dps'))),min:round(min(field('dps'))),max:round(max(field('dps')))},
    damageMean:round(mean(field('damage'))),finalHpPctMean:round(mean(field('finalHpPct')),2),
    counterForceGeneratedMean:round(mean(field('counterForceGenerated'))),mitigationEventsMean:round(mean(field('mitigationEvents'))),cashoutEventsMean:round(mean(field('cashoutEvents'))),
    counterHitsMean:round(mean(field('counterHits'))),immovableCompletionsMean:round(mean(field('immovableCompletions'))),
    bloodCastsMean:round(mean(field('bloodCasts'))),bloodActivationsMean:round(mean(field('bloodActivations'))),bloodHpPaidMean:round(mean(field('bloodHpPaid'))),
    bloodWindowHitsMean:round(mean(field('bloodWindowHits'))),bloodWindowDamageMean:round(mean(field('bloodWindowDamage'))),
    shieldAbsorbedMean:round(mean(field('shieldAbsorbed'))),hpDamageTakenMean:round(mean(field('hpDamageTaken'))),recoverCastsMean:round(mean(field('recoverCasts'))),
  };
}

function addRelativeDps(rows){
  const baseline=Math.max(.0001,rows.find(x=>x.styleId==='defense'&&x.presetId==='balanced')?.dps.mean??1);
  return rows.map(row=>({...row,relativeDpsVsDefenseBalanced:round(row.dps.mean/baseline*100,2)}));
}

function assertDefensePresetIsolation(runs){
  const defense=BODY_B6_PRESET_IDS.map(presetId=>runs.filter(x=>x.styleId==='defense'&&x.presetId===presetId));
  const projection=row=>({seed:row.seed,duration:row.duration,damage:row.damage,dps:row.dps,finalHp:row.finalHp,counterForceGenerated:row.counterForceGenerated,mitigationEvents:row.mitigationEvents,cashoutEvents:row.cashoutEvents,counterHits:row.counterHits,immovableCompletions:row.immovableCompletions,shieldAbsorbed:row.shieldAbsorbed,hpDamageTaken:row.hpDamageTaken});
  const baseline=defense[0].map(projection);
  for(let i=1;i<defense.length;i++){
    if(JSON.stringify(defense[i].map(projection))!==JSON.stringify(baseline)) throw new Error(`BODY_B6_PRESET_LEAK: ${BODY_B6_PRESET_IDS[i]} changed Thủ–Phản mechanics without Nhiên Huyết equipped`);
  }
}

function invalidRunLabel(x){
  return `${x.styleId}/${x.presetId}@${x.seed}[hp=${x.finalHpPct} dps=${x.dps} blood=${x.bloodActivations} paid=${x.bloodHpPaid} windowHits=${x.bloodWindowHits} mit=${x.mitigationEvents} cash=${x.cashoutEvents} counter=${x.counterHits} imm=${x.immovableCompletions}]`;
}

export function runBodyB6Benchmark({duration=BODY_B6_DURATION_SECONDS,seeds=BODY_B6_SEEDS}={}){
  const problems=validateBodyB6Matrix();
  if(problems.length) throw new Error(`Body B6 matrix contract invalid:\n- ${problems.join('\n- ')}`);
  const registry=buildRegistry(),runs=[];
  for(const style of BODY_B6_STYLES){
    for(const presetId of BODY_B6_PRESET_IDS){
      for(const seed of seeds){
        const player=createBodyB6Player(style,presetId),target=createBodyB5Target();
        const kernel=runCombatKernelV3({registry,seed,entities:[player,target],maxDuration:duration,mode:'simulation'});
        runs.push(summarizeBodyB6Run(kernel,style,presetId,seed,duration));
      }
    }
  }
  assertDefensePresetIsolation(runs);
  const aggregates=[];
  for(const style of BODY_B6_STYLES){
    for(const presetId of BODY_B6_PRESET_IDS){
      aggregates.push(aggregate(style,presetId,runs.filter(x=>x.styleId===style.id&&x.presetId===presetId)));
    }
  }
  const invalid=runs.filter(x=>!x.identityValid);
  return {
    schema:'body-dao-b6-benchmark.v1',generatedAt:new Date().toISOString(),engine:'combat.v3',durationSeconds:duration,seeds:[...seeds],presetIds:[...BODY_B6_PRESET_IDS],
    passed:invalid.length===0,
    invalidRuns:invalid.map(x=>({styleId:x.styleId,presetId:x.presetId,seed:x.seed,reason:invalidRunLabel(x),...x})),
    notes:[
      'Diagnostic only: this harness does not modify gameplay or auto-tune coefficients.',
      'Matrix is 3 playstyles × 3 selectable Auto presets against the exact B5 pressure target.',
      'Every playstyle uses exactly 5 Body Active slots plus Basic and Ultimate, all 8 Body passives Lv20, mastery tier 1000, and the same +300 five-stat allocation budget.',
      'Thủ–Phản intentionally does not equip Nhiên Huyết; all three presets must therefore produce identical mechanics for the same seed.',
      'Huyết–Công validity requires real Nhiên Huyết activation, real HP payment, and real damage inside the 6s Huyết Bạo window.',
      'Hybrid validity requires both Huyết–Công evidence and a real mitigation → Phản Thế cash-out/counter cycle with completed Bất Động channel.',
      'Invalid identity runs are preserved in JSON and aggregate output before the CLI returns failure, so tuning decisions use the full matrix instead of the first exception only.',
      'No DPS/survival target band is enforced here. B6 numbers are evidence for the next tune/closure decision, not targets chosen in advance.',
    ],
    aggregates:addRelativeDps(aggregates),runs,
  };
}

function parseCli(argv){
  const opts={duration:BODY_B6_DURATION_SECONDS,seeds:[...BODY_B6_SEEDS],out:path.resolve('qa/output/body-b6-benchmark.json')};
  for(const arg of argv){
    if(arg==='--quick'){opts.seeds=opts.seeds.slice(0,3);opts.duration=90;}
    else if(arg.startsWith('--duration=')) opts.duration=Math.max(10,Number(arg.split('=')[1])||BODY_B6_DURATION_SECONDS);
    else if(arg.startsWith('--seeds=')){const n=Math.max(1,Math.floor(Number(arg.split('=')[1])||opts.seeds.length));opts.seeds=opts.seeds.slice(0,n);}
    else if(arg.startsWith('--out=')) opts.out=path.resolve(arg.slice('--out='.length));
  }
  return opts;
}
function printSummary(result){
  console.log(`BODY DAO B6 BENCHMARK · Combat V3 · ${result.durationSeconds}s · ${result.seeds.length} seeds · 3x3 matrix`);
  for(const row of result.aggregates){
    console.log(`${row.styleId.padEnd(8)} ${row.presetId.padEnd(10)} DPS=${String(row.dps.mean).padStart(9)} rel=${String(row.relativeDpsVsDefenseBalanced).padStart(6)}% HP=${String(row.finalHpPctMean).padStart(6)} blood=${String(row.bloodActivationsMean).padStart(5)} paid=${String(row.bloodHpPaidMean).padStart(8)} window=${String(row.bloodWindowDamageMean).padStart(9)} mit=${String(row.mitigationEventsMean).padStart(5)} cash=${String(row.cashoutEventsMean).padStart(5)} valid=${row.validRuns}/${row.seeds}`);
  }
  if(!result.passed){
    console.error(`BODY_B6_INVALID_IDENTITY_RUN: ${result.invalidRuns.map(x=>x.reason).join(', ')}`);
  }
  console.log('B6 diagnostic only; no coefficient was changed by this harness.');
}

const entry=fileURLToPath(import.meta.url);
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(entry)){
  try{
    const opts=parseCli(process.argv.slice(2));
    const result=runBodyB6Benchmark(opts);
    fs.mkdirSync(path.dirname(opts.out),{recursive:true});
    fs.writeFileSync(opts.out,`${JSON.stringify(result,null,2)}\n`,'utf8');
    printSummary(result);
    console.log(`Output: ${opts.out}`);
    if(!result.passed) process.exitCode=1;
  }catch(error){
    console.error(error?.stack??String(error));
    process.exitCode=1;
  }
}
