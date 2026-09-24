import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { pvpProductionSummaryV119 } from '../../dist/core/pvp-production-v119.js';
let pass=0;const ok=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};const r=buildRegistry();
function xpAt(order){const st=createPlayableAdventureState();const realm=[...r.realms.values()].find(x=>x.order===order);st.realm.realmId=realm.id;st.realm.maxRealmOrder=order;const ss=new SimulationSession(r,thanhHaWorld,adventureEnemies,playablePlayerProfile,115000+order,st);return new GameplayFacade(ss,r,thanhHaWorld).playerExperienceV105();}
{const xp=xpAt(26);ok(xp.v113?.active&&xp.v115?.active,'V115 build guidance attaches to real Hóa Thần progression');ok(xp.v117?.active&&xp.v117.rules.some(x=>x.includes('Không giới hạn lượt đánh')),'V117 creates active/semi-idle/idle loop without activity caps');ok(xp.v118?.engine==='CombatKernel V3','V118 PvE readiness stays on CombatKernel V3');}
{const xp=xpAt(46);ok(xp.v114?.active&&xp.v114.stage.name==='Nhân Tiên','V114 Immortal progression is transported in player experience');}
{const xp=xpAt(90);ok(xp.v116?.schema==='late-game-economy.v140'&&!xp.v116?.catalyst,'V140 late-game economy has no realm catalyst requirement');}
const pvp=pvpProductionSummaryV119({reward:{remainingPaidWins:5,rewardPerPaidWin:8}});ok(pvp.rules.unlimitedMatches&&pvp.rules.paidWinsPerDay===5&&pvp.rules.boundJadePerPaidWin===8&&pvp.engine==='CombatKernel V3','V119 preserves unlimited PvP + 5 paid wins × 8 Bound Jade on shared kernel');
const sessionSrc=fs.readFileSync(new URL('../../dist/core/session.js',import.meta.url),'utf8');ok(!/class\s+.*Pvp.*Resolver|class\s+.*Boss.*Resolver/i.test(sessionSrc),'V118/V119 add no Boss/PvP resolver parallel to CombatKernel');
console.log(`V115–V119 PRODUCTION: ${pass}/${pass} PASS`);
