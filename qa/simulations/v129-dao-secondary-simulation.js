import fs from 'node:fs';
import { buildBalanceEntityV120, evaluateBuildV120, potentialGridV120, thematicAttireSetIdV120 } from './balance-lab-v120.js';
import { buildRegistry } from '../../dist/content/registry.js';
import { runCombatKernelV2 } from '../../dist/core/combat-kernel-v2.js';

export const DAO_IDS_V129 = ['sword','fist','body','spell','poison','artifact','formation','mind'];
export const DAO_THEMATIC_ROOT_V129 = Object.freeze({
  sword:'metal', fist:'fire', body:'earth', spell:'water', poison:'wood', artifact:'metal', formation:'earth', mind:'water',
});
export const DAO_PVP_END_POT_V129 = Object.freeze({
  sword:Object.freeze({power:.8,body:.1,defense:.1}), fist:Object.freeze({power:.9,body:0,defense:.1}), body:Object.freeze({power:1,body:0,defense:0}), spell:Object.freeze({power:.9,body:0,defense:.1}),
  poison:Object.freeze({power:1,body:0,defense:0}), artifact:Object.freeze({power:.8,body:0,defense:.2}), formation:Object.freeze({power:1,body:0,defense:0}), mind:Object.freeze({power:1,body:0,defense:0}),
});

function baseSpec(main, potential, secondary){
  const root=DAO_THEMATIC_ROOT_V129[main];
  return {
    dao:main,
    secondaryDao:secondary,
    secondaryDaoHanh:100,
    root,
    totalPotential:1000,
    potential,
    daoHanh:100,
    attireSetId:thematicAttireSetIdV120(main,root),
    attirePieces:6,
    grade:'breaker',
    maxDaoProgression:true,
    maxRootOrigins:true,
  };
}
function ratioAlloc(row){ return {power:row.power,body:row.body,defense:row.defense}; }
function round(n,d=4){ return Number(Number(n).toFixed(d)); }

function pvpEndSpec(main,secondary){
  const root=DAO_THEMATIC_ROOT_V129[main];
  return {dao:main,secondaryDao:secondary,secondaryDaoHanh:100,root,totalPotential:1000,potential:DAO_PVP_END_POT_V129[main],daoHanh:100,attireSetId:thematicAttireSetIdV120(main,root),attirePieces:6,grade:'breaker',maxDaoProgression:true,maxRootOrigins:true};
}

export function runSecondaryPvpChoiceSimulationV129(seeds=6){
  const registry=buildRegistry();
  const bestCounts=Object.fromEntries(DAO_IDS_V129.map(d=>[d,0]));
  const globalPoints=Object.fromEntries(DAO_IDS_V129.map(d=>[d,[]]));
  const byMain={};
  for(const main of DAO_IDS_V129){
    const choices=DAO_IDS_V129.filter(d=>d!==main);
    const score=Object.fromEntries(choices.map(d=>[d,{w:0,l:0,d:0}]));
    for(let i=0;i<choices.length;i++)for(let j=i+1;j<choices.length;j++)for(let seed=0;seed<seeds;seed++){
      const a={...buildBalanceEntityV120(pvpEndSpec(main,choices[i])),id:'A'};
      const b={...buildBalanceEntityV120(pvpEndSpec(main,choices[j])),id:'B'};
      const battle=runCombatKernelV2({registry,seed:1700000+DAO_IDS_V129.indexOf(main)*10007+seed*317+i*809+j*59,entities:seed%2?[b,a]:[a,b],maxDuration:60,mode:'simulation'}).battle;
      if(battle.winnerId==='A'){score[choices[i]].w++;score[choices[j]].l++;}
      else if(battle.winnerId==='B'){score[choices[j]].w++;score[choices[i]].l++;}
      else{score[choices[i]].d++;score[choices[j]].d++;}
    }
    const pct=Object.fromEntries(choices.map(d=>{const x=score[d],n=x.w+x.l+x.d;return [d,round((x.w+.5*x.d)/n*100,2)];}));
    const ranked=Object.entries(pct).sort((a,b)=>b[1]-a[1]);
    bestCounts[ranked[0][0]]++;
    for(const [d,v] of Object.entries(pct))globalPoints[d].push(v);
    byMain[main]={best:ranked[0][0],worst:ranked.at(-1)[0],ranked:Object.fromEntries(ranked)};
  }
  const crossBuildAverage=Object.fromEntries(DAO_IDS_V129.map(d=>[d,round(globalPoints[d].length?globalPoints[d].reduce((a,b)=>a+b,0)/globalPoints[d].length:50,2)]));
  return {seedsPerPair:seeds,byMain,bestCounts,crossBuildAverage,maxBestCount:Math.max(...Object.values(bestCounts)),crossBuildRange:{min:Math.min(...Object.values(crossBuildAverage)),max:Math.max(...Object.values(crossBuildAverage))}};
}

export function runDaoSecondarySimulationV129(){
  // Stage A: find one canonical 10%-grid Potential allocation per Main Dao without a secondary.
  // Reuse that allocation across the row so the secondary comparison is not confounded by re-optimizing Potential.
  const grid=potentialGridV120(10);
  const optimizedPotential={};
  const diagonal={};
  for(const main of DAO_IDS_V129){
    let best;
    for(const p of grid){
      const potential=ratioAlloc(p);
      const metrics=evaluateBuildV120(baseSpec(main,potential,undefined),0);
      if(!best||metrics.balancedScore>best.metrics.balancedScore) best={potential,metrics};
    }
    optimizedPotential[main]=best.potential;
    diagonal[main]=best.metrics;
  }

  // Stage B: 8×8 matrix. Diagonal means no Phụ Đạo; off-diagonal means that Phụ Đạo is learned.
  const rows=[];
  for(const main of DAO_IDS_V129){
    const base=diagonal[main];
    for(const column of DAO_IDS_V129){
      const secondary=column===main?undefined:column;
      const metrics=secondary?evaluateBuildV120(baseSpec(main,optimizedPotential[main],secondary),0):base;
      rows.push({
        main,
        secondary:secondary??null,
        root:DAO_THEMATIC_ROOT_V129[main],
        attireSetId:thematicAttireSetIdV120(main,DAO_THEMATIC_ROOT_V129[main]),
        potential:optimizedPotential[main],
        dps:round(metrics.dps),
        survivalScore:round(metrics.survivalScore),
        balancedScore:round(metrics.balancedScore),
        gainVsNoSecondaryPct:round((metrics.balancedScore/base.balancedScore-1)*100,2),
      });
    }
  }
  const byMain={};
  for(const main of DAO_IDS_V129){
    const candidates=rows.filter(x=>x.main===main&&x.secondary).sort((a,b)=>b.balancedScore-a.balancedScore);
    byMain[main]={
      potential:optimizedPotential[main],
      baselineBalancedScore:round(diagonal[main].balancedScore),
      bestSecondary:candidates[0]?.secondary,
      bestGainPct:candidates[0]?.gainVsNoSecondaryPct,
      worstSecondary:candidates.at(-1)?.secondary,
      worstGainPct:candidates.at(-1)?.gainVsNoSecondaryPct,
      top3:candidates.slice(0,3).map(x=>({secondary:x.secondary,gainPct:x.gainVsNoSecondaryPct,balancedScore:x.balancedScore})),
    };
  }
  const bestCounts=Object.fromEntries(DAO_IDS_V129.map(x=>[x,0]));
  for(const x of Object.values(byMain)) if(x.bestSecondary) bestCounts[x.bestSecondary]++;
  const gains=rows.filter(x=>x.secondary).map(x=>x.gainVsNoSecondaryPct);
  return {
    schema:'v129.dao-secondary-diagnostic',
    methodology:{
      potentialGridStepPct:10,
      potentialGridBuilds:grid.length,
      matrixBuilds:rows.length,
      totalPotential:1000,
      daoHanh:100,
      heartMethod:'not fully modeled by balance-lab-v120 diagnostic',
      rootOrigins:'not fully modeled by balance-lab-v120 diagnostic',
      set:'thematic 6p authored set mechanics',
      duelSeeds:0,
      comparison:'within each Main Dao row; Potential/root/Set held constant while only Phụ Đạo changes',
    },
    optimizedPotential,
    byMain,
    bestSecondaryCounts:bestCounts,
    gainRangePct:{min:round(Math.min(...gains),2),max:round(Math.max(...gains),2),mean:round(gains.reduce((a,b)=>a+b,0)/gains.length,2)},
    pvpChoice:runSecondaryPvpChoiceSimulationV129(6),
    rows,
  };
}

if(import.meta.url===new URL(process.argv[1], 'file:').href){
  const out=runDaoSecondarySimulationV129();
  fs.mkdirSync('docs/simulations',{recursive:true});
  fs.writeFileSync('docs/simulations/V129_DAO_SECONDARY_DIAGNOSTIC.json',JSON.stringify(out,null,2));
  const lines=[
    'V129 DAO / PHU DAO DIAGNOSTIC — NOT A RELEASE BALANCE GATE',
    `Potential grid: ${out.methodology.potentialGridBuilds} allocations per Main Dao`,
    `Matrix: ${out.methodology.matrixBuilds} builds`,
    `PvE benchmark secondary gain range vs no-secondary: ${out.gainRangePct.min}% .. ${out.gainRangePct.max}% (mean ${out.gainRangePct.mean}%)`,
    '',
    ...DAO_IDS_V129.map(d=>{const x=out.byMain[d];return `${d.padEnd(10)} pot=${Math.round(x.potential.power*100)}/${Math.round(x.potential.body*100)}/${Math.round(x.potential.defense*100)}  best=${String(x.bestSecondary).padEnd(10)} ${String(x.bestGainPct).padStart(6)}%  worst=${String(x.worstSecondary).padEnd(10)} ${String(x.worstGainPct).padStart(6)}%`; }),
    '',
    `PvE benchmark best-secondary counts: ${Object.entries(out.bestSecondaryCounts).map(([k,v])=>`${k}:${v}`).join(' · ')}`,
    '',
    `PvP direct-choice best counts: ${Object.entries(out.pvpChoice.bestCounts).map(([k,v])=>`${k}:${v}`).join(' · ')}`,
    `PvP cross-build averages: ${Object.entries(out.pvpChoice.crossBuildAverage).map(([k,v])=>`${k}:${v.toFixed(1)}`).join(' · ')}`,
    `PvP cross-build range: ${out.pvpChoice.crossBuildRange.min.toFixed(1)}% .. ${out.pvpChoice.crossBuildRange.max.toFixed(1)}%; max universal-best count=${out.pvpChoice.maxBestCount}`,

  ];
  fs.writeFileSync('docs/simulations/V129_DAO_SECONDARY_DIAGNOSTIC.txt',lines.join('\n')+'\n');
  console.log(lines.join('\n'));
}
