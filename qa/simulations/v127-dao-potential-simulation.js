import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { evaluateBuildV120, potentialGridV120, thematicAttireSetIdV120 } from './balance-lab-v120.js';

const daos=['sword','fist','body','spell','poison','artifact','formation','mind'];
const root='metal';
const grid=potentialGridV120(10);
const rows=[];const bests=[];const t0=performance.now();
for(const dao of daos){
  const set=thematicAttireSetIdV120(dao,root);
  let best=null;
  for(const potential of grid){
    const result=evaluateBuildV120({dao,root,totalPotential:1000,potential,daoHanh:70,attireSetId:set,attirePieces:6,grade:'immortal'},0);
    const row={dao,power:potential.power,body:potential.body,defense:potential.defense,...result};
    rows.push(row);if(!best||row.balancedScore>best.balancedScore)best=row;
  }
  bests.push(best);
}
const defenseZero=bests.filter(x=>x.defense===0).length;
const pureAxis=bests.filter(x=>[x.power,x.body,x.defense].some(v=>v===1)).length;
const spread=Math.max(...bests.map(x=>x.balancedScore))/Math.max(1e-9,Math.min(...bests.map(x=>x.balancedScore)));
const defenseUseful=daos.filter(dao=>{
  const group=rows.filter(x=>x.dao===dao);const best=Math.max(...group.map(x=>x.balancedScore));
  return group.some(x=>x.defense>=0.2 && x.balancedScore>=best*0.95);
});
const report={schema:'v127-dao-potential-simulation.v1',engine:'CombatKernel V2',matrix:{daos:8,potentialPlans:grid.length,totalBuilds:rows.length,root},audit:{defenseZeroBest:defenseZero,pureAxisBest:pureAxis,bestScoreSpread:spread,daosWithDefense20Within5PctOfBest:defenseUseful},bests,durationMs:performance.now()-t0};
fs.mkdirSync('docs/simulations',{recursive:true});
fs.writeFileSync('docs/simulations/V127_DAO_POTENTIAL_SIMULATION.json',JSON.stringify(report,null,2));
const lines=['V127 DAO + POTENTIAL SIMULATION',`Engine: CombatKernel V2 · ${daos.length} Dao × ${grid.length} Potential = ${rows.length} builds · representative root=${root}`,`Best build Defense=0: ${defenseZero}/8`,`Best build pure-axis: ${pureAxis}/8`,`Dao có build Defense>=20% nằm trong 5% best: ${defenseUseful.length}/8 (${defenseUseful.join(', ')})`,`Best-score spread: ${spread.toFixed(3)}x`,'',...bests.map(x=>`${x.dao.padEnd(10)} P${Math.round(x.power*100)} B${Math.round(x.body*100)} D${Math.round(x.defense*100)} score=${x.balancedScore.toFixed(2)} dps=${x.dps.toFixed(1)} surv=${x.survivalScore.toFixed(1)}`),``,`Duration: ${((performance.now()-t0)/1000).toFixed(2)}s`];
fs.writeFileSync('docs/simulations/V127_DAO_POTENTIAL_SIMULATION.txt',lines.join('\n'));
console.log(lines.join('\n'));
