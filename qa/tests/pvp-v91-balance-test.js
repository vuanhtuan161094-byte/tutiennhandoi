import { buildRegistry } from '../../dist/content/registry.js';
import { lightningSwordCultivator } from '../../dist/content/entities.js';
import { runCombatKernelV2 } from '../../dist/core/combat-kernel-v2.js';
import { pvpOpponentScaleV91, scalePvpEntityV91 } from '../../dist/core/pvp-v91.js';
const registry=buildRegistry();let passed=0;
function check(ok,label){if(!ok)throw new Error(`FAIL: ${label}`);passed++;console.log(`✓ ${label}`)}
function rate(playerScale,opponentScale,seeds=700){let w=0;for(let seed=1;seed<=seeds;seed++){const p=scalePvpEntityV91(lightningSwordCultivator,playerScale,'p','Player');const o=scalePvpEntityV91(lightningSwordCultivator,opponentScale,'o','Shadow');const b=runCombatKernelV2({registry,seed,entities:[p,o],mode:'offline',maxDuration:120}).battle;if(b.winnerId==='p')w++;}return w/seeds*100;}
const r1000=Object.fromEntries(['easy','even','hard'].map(b=>[b,rate(1,pvpOpponentScaleV91(b,1000))]));
const r1400=Object.fromEntries(['easy','even','hard'].map(b=>[b,rate(1,pvpOpponentScaleV91(b,1400))]));
const upgraded=rate(1.15,pvpOpponentScaleV91('easy',1400));
console.log('rating1000',r1000);console.log('rating1400',r1400);console.log('rating1400 +15% player upgrade easy',upgraded);
check(r1000.easy>=64&&r1000.easy<=74,'1000 Easy stays near ~69%');
check(r1000.even>=35&&r1000.even<=45,'1000 Even stays near ~40%');
check(r1000.hard>=13&&r1000.hard<=22,'1000 Hard stays near ~18%');
check(r1400.easy>=10&&r1400.easy<=20,'1400 Easy falls near ~15%');
check(r1400.even>=3&&r1400.even<=10,'1400 Even falls near ~6%');
check(r1400.hard>=0&&r1400.hard<=4,'1400 Hard falls near ~1–2%');
check(['easy','even','hard'].every(b=>pvpOpponentScaleV91(b,1400)>pvpOpponentScaleV91(b,1000)),'all opponent bands scale upward with rating');
check(upgraded>=60,'upgrading build after anchor breaks the old soft wall');
console.log(`\n${passed}/8 V91 PvP Balance checks passed.`);
