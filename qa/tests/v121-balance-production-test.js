import fs from 'node:fs';
import { potentialGridV120 } from '../simulations/balance-lab-v120.js';
import { GLOBAL_BUILD_BALANCE_POLICY_V108 } from '../../dist/core/global-build-balance-v108.js';
import { corePotentialDefinitions } from '../../dist/core/reincarnation-progression-v1102.js';

let pass=0;
const ok=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};

ok(potentialGridV120(10).length===66&&GLOBAL_BUILD_BALANCE_POLICY_V108.potentialGridBuilds===66,
  'V121 compatibility baseline keeps the canonical 66 three-axis Potential allocation grid');
ok(corePotentialDefinitions.some(x=>x.id==='defense'&&x.perPoint?.includes('Phòng Ngự +3')),
  'V121 compatibility baseline keeps Defense as a real Potential axis');
for(const successor of ['v129-global-build-balance-test.js','v129-power-budget-test.js']){
  ok(fs.existsSync(new URL(`./${successor}`,import.meta.url)),
    `V121 generated report is superseded by live successor gate ${successor}`);
}
console.log(`V121 BALANCE COMPATIBILITY GATE: ${pass}/${pass} PASS`);
