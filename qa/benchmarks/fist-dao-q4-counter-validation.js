import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../../dist/content/registry.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';
import {
  FIST_Q4_DURATION_SECONDS,
  FIST_Q4_PROFILES,
  FIST_Q4_SEEDS,
  createFistQ4Player,
  createFistQ4Target,
  summarizeFistQ4Run,
} from './fist-dao-q4-benchmark.js';

const mean=xs=>xs.length?xs.reduce((a,b)=>a+(Number(b)||0),0)/xs.length:0;
const round=(v,d=3)=>{const p=10**d;return Math.round((Number(v)||0)*p)/p;};
const averageMap=(runs,key)=>{
  const ids=new Set(runs.flatMap(run=>Object.keys(run[key]??{})));
  return Object.fromEntries([...ids].sort().map(id=>[id,round(mean(runs.map(run=>Number(run[key]?.[id]??0))))]));
};

const COUNTER_WINDOW_SKILL_ID='skill.boss.v81.cataclysm';
const heavy=FIST_Q4_PROFILES.find(x=>x.id==='heavy');
const counterBase=FIST_Q4_PROFILES.find(x=>x.id==='counter');
if(!heavy||!counterBase) throw new Error('Missing Q4 heavy/counter profile');

// Counter-centric diagnostic loadout: Chấn Mạch is intentionally removed because
// production Auto correctly gives it first claim on target-casting windows. The
// target uses a real 1.55s cast skill so Hồi Thân Phản Quyền has an observable,
// deterministic counter window instead of relying on Basic's short cast cadence.
const counter=Object.freeze({
  ...counterBase,
  activeSkillIds:Object.freeze([
    'skill.dao.fist.nurture',
    'skill.dao.fist.heavy',
    'skill.dao.fist.counter',
    'skill.dao.fist.chain_heavy',
    'skill.dao.fist.finisher',
  ]),
});

function createCounterWindowTarget(){
  const target=createFistQ4Target();
  target.skillIds=[COUNTER_WINDOW_SKILL_ID];
  target.aiProfile={
    name:'Q4 Counter Window Dummy',
    rules:[{skillId:COUNTER_WINDOW_SKILL_ID,priority:100,conditions:[{type:'always'}]}],
  };
  // Keep the target a harmless benchmark dummy: the long cast exists only to
  // exercise targetIsCasting/counter timing, not to pressure player survivability.
  target.stats.attack=1;
  return target;
}

function runProfile(profile){
  const registry=buildRegistry();
  const counterWindowSkill=registry.skills?.get?.(COUNTER_WINDOW_SKILL_ID)??registry.getSkill?.(COUNTER_WINDOW_SKILL_ID);
  if(!counterWindowSkill) throw new Error(`Missing counter-window skill: ${COUNTER_WINDOW_SKILL_ID}`);
  if(Number(counterWindowSkill.castTime??0)<1) throw new Error(`Counter-window cast is too short: ${counterWindowSkill.castTime}`);
  const runs=[];
  for(const seed of FIST_Q4_SEEDS){
    const player=createFistQ4Player(profile);
    player.aiProfile=battleDaoAutoRotationV127('fist',player.skillIds);
    const target=createCounterWindowTarget();
    const kernel=runCombatKernelV3({registry,seed,entities:[player,target],maxDuration:FIST_Q4_DURATION_SECONDS,mode:'simulation'});
    runs.push(summarizeFistQ4Run(kernel,profile,seed));
  }
  return runs;
}

function summarize(runs){
  return {
    dpsMean:round(mean(runs.map(x=>x.dps))),
    dpsMin:round(Math.min(...runs.map(x=>x.dps))),
    dpsMax:round(Math.max(...runs.map(x=>x.dps))),
    counterSuccessMean:round(mean(runs.map(x=>x.counterSuccess))),
    interruptsMean:round(mean(runs.map(x=>x.interrupts))),
    breaksMean:round(mean(runs.map(x=>x.breaks))),
    ultimateCastsMean:round(mean(runs.map(x=>x.ultimateCasts))),
    finalCNMean:round(mean(runs.map(x=>x.finalCN))),
    averageFistForceSampleMean:round(mean(runs.map(x=>x.averageFistForceSample))),
    averageLienKinhSampleMean:round(mean(runs.map(x=>x.averageLienKinhSample))),
    castsMeanBySkill:averageMap(runs,'casts'),
    damageMeanBySkill:averageMap(runs,'damageBySkill'),
  };
}

export function runFistQ4CounterValidation(){
  const heavyRuns=runProfile(heavy);
  const counterRuns=runProfile(counter);
  const heavySummary=summarize(heavyRuns);
  const counterSummary=summarize(counterRuns);
  const relativeDps=round(counterSummary.dpsMean/Math.max(.0001,heavySummary.dpsMean)*100,2);
  const counterCastMean=Number(counterSummary.castsMeanBySkill['skill.dao.fist.counter']??0);
  return {
    schema:'fist-dao-q4-counter-validation.v2',
    generatedAt:new Date().toISOString(),
    engine:'combat.v3',
    durationSeconds:FIST_Q4_DURATION_SECONDS,
    seeds:[...FIST_Q4_SEEDS],
    counterWindowSkillId:COUNTER_WINDOW_SKILL_ID,
    targetRelativeDps:[85,92],
    heavy:heavySummary,
    counter:{
      ...counterSummary,
      activeSkillIds:[...counter.activeSkillIds],
      relativeDps,
      withinDpsTarget:relativeDps>=85&&relativeDps<=92,
      counterCastMean:round(counterCastMean),
      counterIdentityValid:counterCastMean>0&&counterSummary.counterSuccessMean>0,
    },
    note:'Diagnostic only. Production Auto remains Chấn Mạch-first; validation removes Chấn Mạch and supplies a real long-cast target action so Hồi Thân Phản Quyền can be measured as a counter archetype.',
    runs:{heavy:heavyRuns,counter:counterRuns},
  };
}

const invoked=process.argv[1]&&path.resolve(process.argv[1])===path.resolve(fileURLToPath(import.meta.url));
if(invoked){
  const report=runFistQ4CounterValidation();
  const out=path.resolve('qa/output/fist-q4-counter-validation.json');
  fs.mkdirSync(path.dirname(out),{recursive:true});
  fs.writeFileSync(out,JSON.stringify(report,null,2),'utf8');
  console.table([{
    Build:'Trọng Quyền',DPS:report.heavy.dpsMean,'vs Heavy':'100%',Counter:'-',Break:report.heavy.breaksMean,Ult:report.heavy.ultimateCastsMean,
  },{
    Build:'Phản Quyền',DPS:report.counter.dpsMean,'vs Heavy':`${report.counter.relativeDps}%`,Counter:report.counter.counterSuccessMean,Break:report.counter.breaksMean,Ult:report.counter.ultimateCastsMean,
  }]);
  console.log(`Counter window skill: ${report.counterWindowSkillId}`);
  console.log(`Counter casts mean: ${report.counter.counterCastMean}`);
  console.log(`Counter identity: ${report.counter.counterIdentityValid?'VALID':'INVALID'}`);
  console.log(`DPS target 85–92%: ${report.counter.withinDpsTarget?'PASS':'OUTSIDE'}`);
  console.log(`Output: ${out}`);
  if(!report.counter.counterIdentityValid) process.exitCode=2;
}
