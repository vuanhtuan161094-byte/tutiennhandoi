import { thanhHaWorld } from '../../dist/content/world.js';
import { lateGamePacingAuditV122 } from '../../dist/core/late-game-pacing-v122.js';
let pass=0;const ok=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};const a=lateGamePacingAuditV122(thanhHaWorld.dungeons);
ok(a.pass&&a.deadZones.length===0,'V122 has no content-unlock dead zone from Hóa Thần through Sáng Thế Chủ');
ok(a.stages.length===22,'V122 audits 4 mortal mid/late stages + 18 Immortal+ stages');
ok(a.stages.every(x=>x.floors===5),'V122 every non-Tribulation major stage has five authored dungeon floors');
ok(a.tribulation.floors===4&&a.tribulation.unlockOrders.join(',')==='42,43,44,45','V122 Độ Kiếp has one real training checkpoint per substage');
ok(a.policy.includes('không hard-code tuổi'),'V122 keeps late-game pacing content-driven instead of inventing age targets');
console.log(`V122 PROGRESSION PACING: ${pass}/${pass} PASS`);
