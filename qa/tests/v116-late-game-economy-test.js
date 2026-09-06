import { lateGameEconomySummaryV140 } from '../../dist/core/late-game-economy-v140.js';
let pass=0;const ok=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
const x=lateGameEconomySummaryV140({realm:{maxRealmOrder:90},inventory:{}});
ok(x.schema==='late-game-economy.v140','late-game economy read-model is V140');
ok(!Object.hasOwn(x,'catalyst'),'Thăng Cảnh has no catalyst/middleman requirement');
ok(x.policy.includes('Thăng Cảnh')&&x.policy.includes('không yêu cầu'),'policy states realm ascension is independent from upgrade-material farming');
ok(x.terminalSink?.resourceId==='resource.first_dawn_fragment','terminal Sáng Thế sink remains available');
console.log(`V140 LATE-GAME ECONOMY: ${pass}/${pass} PASS`);
