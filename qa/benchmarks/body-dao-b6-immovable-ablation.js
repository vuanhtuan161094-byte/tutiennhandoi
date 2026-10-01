import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../../dist/content/registry.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import {
  BODY_B5_DURATION_SECONDS,
  BODY_B5_SEEDS,
  BODY_B5_PROFILES,
  createBodyB5Player,
  createBodyB5Target,
} from './body-dao-b5-benchmark.js';

const round=(value,digits=3)=>{const n=Number(value)||0,p=10**digits;return Math.round(n*p)/p;};
const sum=xs=>xs.reduce((a,b)=>a+(Number(b)||0),0);
const mean=xs=>xs.length?sum(xs)/xs.length:0;
const min=xs=>xs.length?Math.min(...xs):0;
const max=xs=>xs.length?Math.max(...xs):0;

const BASE=BODY_B5_PROFILES.find(x=>x.id==='immovable');
if(!BASE) throw new Error('BODY_B6_CONTRACT: missing B5 immovable profile');

export const BODY_B6_PROFILES=Object.freeze([
  Object.freeze({...BASE,id:'immovable',label:'Bất Động',activeSkillIds:[...BASE.activeSkillIds]}),
  Object.freeze({
    ...BASE,id:'control',label:'Control · Không Bất Động',identity:'control',
    activeSkillIds:[
      'skill.dao.body.guard','skill.dao.body.transform','skill.dao.body.finisher','skill.dao.body.recover','skill.dao.body.elephant',
    ],
  }),
]);

export function validateBodyB6Profiles(){
  const [base,control]=BODY_B6_PROFILES,problems=[];
  if(!base||!control) return ['expected two profiles'];
  if(JSON.stringify(base.allocation)!==JSON.stringify(control.allocation)) problems.push('allocation must be identical');
  if(base.activeSkillIds.length!==5||control.activeSkillIds.length!==5) problems.push('each profile must use five Active slots');
  const baseSet=new Set(base.activeSkillIds),controlSet=new Set(control.activeSkillIds);
  const removed=[...baseSet].filter(x=>!controlSet.has(x));
  const added=[...controlSet].filter(x=>!baseSet.has(x));
  if(removed.length!==1||removed[0]!=='skill.dao.body.immovable') problems.push('control must remove only immovable');
  if(added.length!==1||added[0]!=='skill.dao.body.finisher') problems.push('control must replace immovable with finisher only');
  return problems;
}

function createPlayer(profile){
  const player=createBodyB5Player(profile);
  player.aiProfile=battleDaoAutoRotationV127('body',player.skillIds);
  return player;
}
function castCounts(summary,playerId){return {...(summary.castCountsByActor?.[playerId]??{})};}

function summarize(kernel,profile,seed,requestedDuration){
  const playerId=`entity.qa.body_b5.${profile.id}`;
  const result=kernel.combatResult,battle=kernel.battle,logs=battle.logs;
  const playerLogs=logs.filter(x=>x.actorId===playerId);
  const incoming=logs.filter(x=>x.targetId===playerId);
  const state=battle.finalState[playerId]??{};
  const core=state.battleDaoStateV2?.body?.core??{};
  const casts=castCounts(result.summary,playerId);
  const duration=Math.max(.001,Number(result.duration)||0);
  const damage=Number(result.summary.damageByActor?.[playerId]??0);
  const maxHp=(100+(profile.allocation.body??0))*100;
  const finalHp=Number(state.hp??0);
  return {
    profileId:profile.id,label:profile.label,seed,duration:round(duration),
    alive:state.alive!==false&&finalHp>0,fullDuration:duration>=requestedDuration-.05,
    damage:round(damage),dps:round(damage/duration),finalHp:round(finalHp),finalHpPct:round(maxHp>0?finalHp/maxHp*100:0,2),
    shieldAbsorbed:round(sum(incoming.filter(x=>x.type==='shield').map(x=>x.data?.absorbed??0))),
    hpDamageTaken:round(sum(incoming.filter(x=>x.type==='damage').map(x=>x.data?.damage??0))),
    counterForceGenerated:round(sum(playerLogs.map(x=>x.data?.counterForceGain??0))),
    mitigationEvents:Number(core.bodyMitigationEvents??0),cashoutEvents:Number(core.bodyCashoutEvents??0),
    immovableCasts:Number(casts['skill.dao.body.immovable']??0),
    immovableCompletions:playerLogs.filter(x=>x.type==='channel'&&x.skillId==='skill.dao.body.immovable'&&String(x.message??'').includes('kết thúc duy trì')).length,
    guardCasts:Number(casts['skill.dao.body.guard']??0),recoverCasts:Number(casts['skill.dao.body.recover']??0),
    ultimateCasts:Number(casts['skill.dao.body.ultimate']??0),finisherCasts:Number(casts['skill.dao.body.finisher']??0),
    casts,outcome:result.outcome,
  };
}

function aggregate(profile,runs){
  const field=name=>runs.map(x=>Number(x[name])||0);
  return {
    id:profile.id,label:profile.label,allocation:{...profile.allocation},activeSkillIds:[...profile.activeSkillIds],
    seeds:runs.length,aliveRuns:runs.filter(x=>x.alive&&x.fullDuration).length,
    dps:{mean:round(mean(field('dps'))),min:round(min(field('dps'))),max:round(max(field('dps')))},
    finalHpMean:round(mean(field('finalHp'))),finalHpPctMean:round(mean(field('finalHpPct')),2),
    shieldAbsorbedMean:round(mean(field('shieldAbsorbed'))),hpDamageTakenMean:round(mean(field('hpDamageTaken'))),
    counterForceGeneratedMean:round(mean(field('counterForceGenerated'))),mitigationEventsMean:round(mean(field('mitigationEvents'))),cashoutEventsMean:round(mean(field('cashoutEvents'))),
    immovableCastsMean:round(mean(field('immovableCasts'))),immovableCompletionsMean:round(mean(field('immovableCompletions'))),
    guardCastsMean:round(mean(field('guardCasts'))),recoverCastsMean:round(mean(field('recoverCasts'))),ultimateCastsMean:round(mean(field('ultimateCasts'))),finisherCastsMean:round(mean(field('finisherCasts'))),
  };
}

export function runBodyB6Ablation({duration=BODY_B5_DURATION_SECONDS,seeds=BODY_B5_SEEDS}={}){
  const problems=validateBodyB6Profiles();
  if(problems.length) throw new Error(`BODY_B6_PROFILE_INVALID:\n- ${problems.join('\n- ')}`);
  const registry=buildRegistry(),runs=[];
  for(const profile of BODY_B6_PROFILES){
    for(const seed of seeds){
      const player=createPlayer(profile),target=createBodyB5Target();
      const kernel=runCombatKernelV3({registry,seed,entities:[player,target],maxDuration:duration,mode:'simulation'});
      runs.push(summarize(kernel,profile,seed,duration));
    }
  }
  const invalid=runs.filter(x=>!x.alive||!x.fullDuration);
  if(invalid.length) throw new Error(`BODY_B6_INVALID_RUN: ${invalid.map(x=>`${x.profileId}@${x.seed}`).join(', ')}`);
  const aggregates=BODY_B6_PROFILES.map(profile=>aggregate(profile,runs.filter(x=>x.profileId===profile.id)));
  const base=aggregates.find(x=>x.id==='immovable'),control=aggregates.find(x=>x.id==='control');
  if(!base||!control||base.immovableCompletionsMean<=0) throw new Error('BODY_B6_INVALID_IDENTITY: baseline did not complete Bất Động Như Sơn');
  const comparison={
    finalHpRatio:round(base.finalHpMean/Math.max(.001,control.finalHpMean),3),
    finalHpDeltaPct:round((base.finalHpMean/control.finalHpMean-1)*100,2),
    shieldAbsorbedRatio:round(base.shieldAbsorbedMean/Math.max(.001,control.shieldAbsorbedMean),3),
    shieldAbsorbedDeltaPct:round((base.shieldAbsorbedMean/control.shieldAbsorbedMean-1)*100,2),
    hpDamageTakenRatio:round(base.hpDamageTakenMean/Math.max(.001,control.hpDamageTakenMean),3),
    hpDamageTakenDeltaPct:round((base.hpDamageTakenMean/control.hpDamageTakenMean-1)*100,2),
    dpsRatio:round(base.dps.mean/Math.max(.001,control.dps.mean),3),
    dpsDeltaPct:round((base.dps.mean/control.dps.mean-1)*100,2),
  };
  return {
    schema:'body-dao-b6-immovable-ablation.v1',generatedAt:new Date().toISOString(),engine:'combat.v3',durationSeconds:duration,seeds:[...seeds],
    notes:[
      'Diagnostic only. No gameplay coefficient is changed by this benchmark.',
      'Both profiles use the exact same five-stat allocation, passives, mastery, target and 180-second seeds.',
      'The control changes exactly one Active slot: Bất Động Như Sơn is replaced by Băng Sơn Chấn Thể.',
      'No pass/fail survival threshold is authored before evidence. B6 exists to determine whether Bất Động itself creates meaningful defensive value beyond stat allocation.',
    ],aggregates,comparison,runs,
  };
}

function parseCli(argv){
  const opts={duration:BODY_B5_DURATION_SECONDS,seeds:[...BODY_B5_SEEDS],out:path.resolve('qa/output/body-b6-immovable-ablation.json')};
  for(const arg of argv){
    if(arg==='--quick'){opts.seeds=opts.seeds.slice(0,3);opts.duration=90;}
    else if(arg.startsWith('--duration=')) opts.duration=Math.max(10,Number(arg.split('=')[1])||BODY_B5_DURATION_SECONDS);
    else if(arg.startsWith('--seeds=')){const n=Math.max(1,Math.floor(Number(arg.split('=')[1])||opts.seeds.length));opts.seeds=opts.seeds.slice(0,n);}
    else if(arg.startsWith('--out=')) opts.out=path.resolve(arg.slice('--out='.length));
  }
  return opts;
}
function printSummary(result){
  console.log(`BODY DAO B6 IMM0VABLE ABLATION · Combat V3 · ${result.durationSeconds}s · ${result.seeds.length} seeds`);
  for(const row of result.aggregates){
    console.log(`${row.id.padEnd(10)} DPS=${String(row.dps.mean).padStart(9)} HP=${String(row.finalHpMean).padStart(9)} HP%=${String(row.finalHpPctMean).padStart(6)} shield=${String(row.shieldAbsorbedMean).padStart(10)} hpDmg=${String(row.hpDamageTakenMean).padStart(10)} immovable=${String(row.immovableCompletionsMean).padStart(6)}`);
  }
  const c=result.comparison;
  console.log(`Bất Động vs control: finalHP ${c.finalHpDeltaPct}% | shield ${c.shieldAbsorbedDeltaPct}% | hpDamage ${c.hpDamageTakenDeltaPct}% | DPS ${c.dpsDeltaPct}%`);
  console.log('B6 is diagnostic-only; review evidence before any coefficient change.');
}

const entry=fileURLToPath(import.meta.url);
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(entry)){
  try{
    const opts=parseCli(process.argv.slice(2));
    const result=runBodyB6Ablation(opts);
    fs.mkdirSync(path.dirname(opts.out),{recursive:true});
    fs.writeFileSync(opts.out,`${JSON.stringify(result,null,2)}\n`,'utf8');
    printSummary(result);
    console.log(`Output: ${opts.out}`);
  }catch(error){
    console.error(error?.stack??String(error));
    process.exitCode=1;
  }
}
