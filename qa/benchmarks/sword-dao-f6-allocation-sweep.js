import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../../dist/content/registry.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';
import {
  SWORD_F6_PROFILES,
  SWORD_F6_SEEDS,
  createSwordF6Player,
  createSwordF6Target,
  summarizeSwordF6Run,
} from './sword-dao-f6-benchmark.js';

const mean=xs=>xs.reduce((a,b)=>a+b,0)/Math.max(1,xs.length);
const round=(v,d=2)=>{const p=10**d;return Math.round((Number(v)||0)*p)/p;};
const heavy=SWORD_F6_PROFILES.find(x=>x.id==='heavy');
const flowBase=SWORD_F6_PROFILES.find(x=>x.id==='flow');
const myriadBase=SWORD_F6_PROFILES.find(x=>x.id==='myriad');

const FLOW_SPLITS=[
  [160,50],[150,60],[140,70],[130,80],[120,90],[110,100],
];
const MYRIAD_SPLITS=[
  [150,60],[140,70],[130,80],[120,90],[110,100],[100,110],
];

function candidates(){
  const rows=[];
  for(const [power,agility] of FLOW_SPLITS){
    rows.push({
      ...flowBase,
      id:`flow_p${power}_a${agility}`,
      label:`Lưu Quang P${power}/TPH${agility}`,
      allocation:{power,body:35,agility,spirit:25,sense:30},
    });
  }
  for(const [power,sense] of MYRIAD_SPLITS){
    rows.push({
      ...myriadBase,
      id:`myriad_p${power}_s${sense}`,
      label:`Ngự Kiếm P${power}/TT${sense}`,
      allocation:{power,body:35,agility:25,spirit:30,sense},
    });
  }
  return rows;
}

function runProfile(registry,profile,seeds){
  const runs=[];
  for(const seed of seeds){
    const kernel=runCombatKernelV3({
      registry,
      seed,
      entities:[createSwordF6Player(profile),createSwordF6Target()],
      maxDuration:180,
      mode:'simulation',
    });
    runs.push(summarizeSwordF6Run(kernel,profile,seed));
  }
  return {
    id:profile.id,
    label:profile.label,
    allocation:{...profile.allocation},
    dpsMean:round(mean(runs.map(x=>x.dps)),3),
    finalCNMean:round(mean(runs.map(x=>x.finalCN)),3),
    averageQiMean:round(mean(runs.map(x=>x.averageQi)),3),
    qiZeroSamplePctMean:round(mean(runs.map(x=>x.qiZeroSamplePct)),2),
    breaksMean:round(mean(runs.map(x=>x.breaks)),3),
    ultimateCastsMean:round(mean(runs.map(x=>x.ultimateCasts)),3),
    intent20AtMean:round(mean(runs.map(x=>x.intent20At).filter(Number.isFinite)),3),
  };
}

export function runSwordF6AllocationSweep({seeds=SWORD_F6_SEEDS}={}){
  const registry=buildRegistry();
  const heavyResult=runProfile(registry,heavy,seeds);
  const rows=candidates().map(profile=>runProfile(registry,profile,seeds));
  for(const row of rows){
    row.relativeToHeavyPct=round(row.dpsMean/heavyResult.dpsMean*100,2);
    const target=row.id.startsWith('flow_')?flowBase.targetRelativeDps:myriadBase.targetRelativeDps;
    row.target=[...target];
    row.withinTarget=row.relativeToHeavyPct>=target[0]&&row.relativeToHeavyPct<=target[1];
  }
  return {
    schema:'sword-dao-f6-allocation-sweep.v1',
    generatedAt:new Date().toISOString(),
    engine:'combat.v3',
    durationSeconds:180,
    seeds:[...seeds],
    fixedBudget:300,
    interpretation:[
      'Diagnostic only; this does not change gameplay or canonical F coefficients.',
      'Body/Spirit/secondary utility allocations are held fixed inside each archetype; only CL vs TPH or CL vs TT is swept.',
      'If an identity-preserving split reaches the authored relative-DPS target, prefer profile correction over gameplay coefficient inflation.',
      'If the whole identity-preserving sweep stays below target, inspect skill contribution/rotation before changing coefficients.',
    ],
    heavyBaseline:heavyResult,
    rows,
  };
}

function print(report){
  console.log(`Trọng Trảm baseline: ${report.heavyBaseline.dpsMean} DPS\n`);
  console.table(report.rows.map(x=>({
    Build:x.label,
    'DPS TB':x.dpsMean,
    'vs Heavy':`${x.relativeToHeavyPct}%`,
    Target:`${x.target[0]}–${x.target[1]}%`,
    'Trong target':x.withinTarget?'YES':'NO',
    'CN cuối':x.finalCNMean,
    'Qi TB':x.averageQiMean,
    'Qi=0%':x.qiZeroSamplePctMean,
    Break:x.breaksMean,
    Ult:x.ultimateCastsMean,
  })));
}

const invoked=process.argv[1]&&path.resolve(process.argv[1])===path.resolve(fileURLToPath(import.meta.url));
if(invoked){
  const quick=process.argv.includes('--quick');
  const seeds=quick?SWORD_F6_SEEDS.slice(0,3):SWORD_F6_SEEDS;
  const report=runSwordF6AllocationSweep({seeds});
  const out=path.resolve('qa/output/sword-f6-allocation-sweep.json');
  fs.mkdirSync(path.dirname(out),{recursive:true});
  fs.writeFileSync(out,JSON.stringify(report,null,2),'utf8');
  print(report);
  console.log(`\nAllocation sweep written: ${out}`);
}
