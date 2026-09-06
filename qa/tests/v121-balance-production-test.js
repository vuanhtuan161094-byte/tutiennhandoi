import fs from 'node:fs';
const report=JSON.parse(fs.readFileSync(new URL('../../docs/simulations/V121_BALANCE_REPORT.json',import.meta.url),'utf8'));let pass=0;const ok=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
ok(report.engine==='CombatKernel V2'&&report.matrix.totalBuilds===2640,'V121 evaluates the full 8 Dao × 5 Hanh × 66 Potential matrix on CombatKernel V2');
ok(report.bestBuildAudit.defenseZeroOf40<=32,'V121 Defense axis is not dead: at least 8/40 optimum builds invest in Defense');
ok(report.bestBuildAudit.pureAxisOf40<=20,'V121 optimum builds do not collapse to pure-axis allocation across the matrix');
ok(report.bests.some(x=>x.defense>=.3)&&report.bests.some(x=>x.body>=.2),'V121 finds materially different defensive/body allocations in real optimum builds');
console.log(`V121 FULL BALANCE GATE: ${pass}/${pass} PASS`);
