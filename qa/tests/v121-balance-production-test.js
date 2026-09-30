import fs from 'node:fs';
import { potentialGridV120 } from '../simulations/balance-lab-v120.js';
import { GLOBAL_BUILD_BALANCE_POLICY_V108 } from '../../dist/core/global-build-balance-v108.js';
import { CORE_POTENTIAL_AXIS_IDS_V5, corePotentialDefinitions } from '../../dist/core/reincarnation-progression-v1102.js';

let pass=0;
const ok=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};

ok(potentialGridV120(10).length===1001&&GLOBAL_BUILD_BALANCE_POLICY_V108.potentialGridBuilds===1001,
  'V121 compatibility gate delegates to the canonical 1001-point five-axis Potential grid');
ok(JSON.stringify(CORE_POTENTIAL_AXIS_IDS_V5)===JSON.stringify(['power','body','agility','spirit','sense']),
  'V121 compatibility gate recognizes the canonical five Potential axes');
ok(corePotentialDefinitions.length===5&&!corePotentialDefinitions.some(x=>x.id==='defense'),
  'Legacy Defense allocation is retired; Thể Phách owns authored defensive growth');
ok(GLOBAL_BUILD_BALANCE_POLICY_V108.sharedCombatEngine==='CombatKernel V3'&&GLOBAL_BUILD_BALANCE_POLICY_V108.liveElementSets===0,
  'V121 compatibility gate follows V3 combat and retired Ngũ Hành Equipment Set authority');
for(const successor of ['v129-global-build-balance-test.js','v129-power-budget-test.js']){
  ok(fs.existsSync(new URL(`./${successor}`,import.meta.url)),
    `V121 historical gate is superseded by live successor gate ${successor}`);
}
console.log(`V121 BALANCE COMPATIBILITY GATE: ${pass}/${pass} PASS`);
