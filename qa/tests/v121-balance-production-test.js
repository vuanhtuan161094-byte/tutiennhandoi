import fs from 'node:fs';
import { potentialGridV120 } from '../simulations/balance-lab-v120.js';
import { GLOBAL_BUILD_BALANCE_POLICY_V108 } from '../../dist/core/global-build-balance-v108.js';
import { CORE_POTENTIAL_AXIS_VERSION_V5, CORE_POTENTIAL_AXIS_IDS_V5, corePotentialDefinitions } from '../../dist/core/reincarnation-progression-v1102.js';

let pass=0;
const ok=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};

ok(potentialGridV120(10).length===66&&GLOBAL_BUILD_BALANCE_POLICY_V108.potentialGridBuilds===66,
  'V121 legacy balance-lab compatibility keeps the historical 66 three-axis report grid');
ok(CORE_POTENTIAL_AXIS_VERSION_V5===5
  && JSON.stringify(CORE_POTENTIAL_AXIS_IDS_V5)===JSON.stringify(['power','body','agility','spirit','sense'])
  && !corePotentialDefinitions.some(x=>x.id==='defense')
  && corePotentialDefinitions.find(x=>x.id==='body')?.perPoint?.includes('Phòng Ngự +1'),
  'Live Potential authority is five-axis CL/TP/TPH/LL/TT and TP owns derived Defense');
for(const successor of ['v129-global-build-balance-test.js','v129-power-budget-test.js']){
  ok(fs.existsSync(new URL(`./${successor}`,import.meta.url)),
    `V121 generated report is superseded by live successor gate ${successor}`);
}
console.log(`V121 BALANCE COMPATIBILITY GATE: ${pass}/${pass} PASS`);
