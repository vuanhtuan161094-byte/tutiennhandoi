import fs from 'node:fs';
import { evaluateBuildV120, potentialGridV120, thematicAttireSetIdV120 } from './balance-lab-v120.js';
const dao=process.argv[2];const roots=['metal','wood','water','fire','earth'];const grid=potentialGridV120(10);const bests=[];let count=0;
for(const root of roots){const set=thematicAttireSetIdV120(dao,root);let best=null;for(const potential of grid){const result=evaluateBuildV120({dao,root,totalPotential:1000,potential,daoHanh:70,attireSetId:set,attirePieces:6,grade:'immortal'},0);count++;const row={dao,root,set,power:potential.power,body:potential.body,defense:potential.defense,...result};if(!best||row.balancedScore>best.balancedScore)best=row;}bests.push(best)}
fs.writeFileSync(`V121_${dao}.json`,JSON.stringify({dao,count,bests},null,2));console.log(`${dao}:${count}`);
