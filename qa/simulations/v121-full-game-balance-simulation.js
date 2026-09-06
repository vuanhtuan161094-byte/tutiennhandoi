import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { evaluateBuildV120, potentialGridV120, thematicAttireSetIdV120 } from './balance-lab-v120.js';
const daos=['sword','fist','body','spell','poison','artifact','formation','mind'];
const roots=['metal','wood','water','fire','earth'];
const grid=potentialGridV120(10);const rows=[];const t0=performance.now();
for(const dao of daos)for(const root of roots){const set=thematicAttireSetIdV120(dao,root);let best=null;for(const potential of grid){const result=evaluateBuildV120({dao,root,totalPotential:1000,potential,daoHanh:70,attireSetId:set,attirePieces:6,grade:'immortal'},0);const row={dao,root,set,power:potential.power,body:potential.body,defense:potential.defense,...result};rows.push(row);if(!best||row.balancedScore>best.balancedScore)best=row;}}
const bests=[];for(const dao of daos)for(const root of roots){const group=rows.filter(x=>x.dao===dao&&x.root===root);bests.push(group.reduce((a,b)=>b.balancedScore>a.balancedScore?b:a));}
const defenseZero=bests.filter(x=>x.defense===0).length, pureAxis=bests.filter(x=>[x.power,x.body,x.defense].some(v=>v===1)).length;
const byDao=Object.fromEntries(daos.map(dao=>{const x=bests.filter(r=>r.dao===dao);return[dao,{meanPower:x.reduce((a,b)=>a+b.power,0)/x.length,meanBody:x.reduce((a,b)=>a+b.body,0)/x.length,meanDefense:x.reduce((a,b)=>a+b.defense,0)/x.length,minScore:Math.min(...x.map(r=>r.balancedScore)),maxScore:Math.max(...x.map(r=>r.balancedScore))}]}));
const scores=bests.map(x=>x.balancedScore),spread=Math.max(...scores)/Math.max(1e-9,Math.min(...scores));
const report={schema:'full-game-balance-simulation.v121',engine:'CombatKernel V2',matrix:{daos:daos.length,roots:roots.length,potentialPlans:grid.length,totalBuilds:rows.length},bestBuildAudit:{defenseZeroOf40:defenseZero,pureAxisOf40:pureAxis,scoreSpreadRatio:spread},byDao,bests,durationMs:performance.now()-t0};
fs.mkdirSync('docs/simulations',{recursive:true});
fs.writeFileSync('docs/simulations/V121_BALANCE_REPORT.json',JSON.stringify(report,null,2));
const lines=[`V121 FULL GAME BALANCE SIMULATION`,`Engine: CombatKernel V2`,`Matrix: ${daos.length} Dao × ${roots.length} Hanh × ${grid.length} Potential = ${rows.length} builds`,`Best-build Defense=0: ${defenseZero}/40`,`Best-build pure-axis: ${pureAxis}/40`,`Best-build score spread: ${spread.toFixed(3)}x`,``,...bests.map(x=>`${x.dao.padEnd(10)} ${x.root.padEnd(6)} P${Math.round(x.power*100)} B${Math.round(x.body*100)} D${Math.round(x.defense*100)} score=${x.balancedScore.toFixed(3)} dps=${x.dps.toFixed(2)} survival=${x.survivalScore.toFixed(2)} set=${x.set}`),``,`Duration: ${((performance.now()-t0)/1000).toFixed(2)}s`];
fs.writeFileSync('docs/simulations/V121_BALANCE_REPORT.txt',lines.join('\n'));
console.log(JSON.stringify({totalBuilds:rows.length,defenseZero,pureAxis,spread:Number(spread.toFixed(4)),durationSec:Number(((performance.now()-t0)/1000).toFixed(2))}));
