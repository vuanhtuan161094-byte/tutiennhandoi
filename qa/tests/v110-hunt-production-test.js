import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { LocalGameApplicationApi } from '../../dist/core/game-api.js';
import { buildWebClientSnapshot } from '../../dist/core/client-shell.js';
import { huntBossMechanicsV123 } from '../../dist/core/pve-progression-v123.js';
import { buildHuntProductionV110 } from '../../dist/core/hunt-production-v110.js';
import { createEndlessHuntState } from '../../dist/core/endless-hunt.js';
let pass=0;const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
const registry=buildRegistry();
check(Object.keys(huntBossMechanicsV123).length===5,'V110 keeps five canonical elemental Boss mechanic families');
check(Object.values(huntBossMechanicsV123).every(x=>x.counterGroups.length===2),'V110 Boss mechanics expose two readable counter lanes each');
{
 const x=buildHuntProductionV110({bossReady:true,canFight:true,currentFloor:21,highestClearedFloor:20,playerPowerLog10:3,enemyPowerLog10:3.03,bossMechanic:{...huntBossMechanicsV123.Fire,activeRoles:['Barrier']},map:{zoneFloor:21},farm:{available:true,floor:20},currentFarmCandidates:[{available:true,floor:20,zoneName:'A',floorName:'T20',killsPerHour:100,spiritStonesPerHour:900,equipmentRollsPerHour:1},{available:true,floor:15,zoneName:'A',floorName:'T15',killsPerHour:140,spiritStonesPerHour:700,equipmentRollsPerHour:2}]});
 check(x.schema==='hunt-production.v110'&&x.boss.mechanic.coveragePct===50,'V110 strategy derives counter coverage from authored skill-role groups');
 check(x.boss.mechanic.missing.length===1&&x.boss.mechanic.missing[0]==='Bẻ nhịp','V110 strategy names the missing counter lane instead of hiding it in scalar power');
 check(x.farm.recommendations.some(r=>r.label==='Nhanh'&&r.floor===15)&&x.farm.recommendations.some(r=>r.label==='Linh Thạch'&&r.floor===20),'V110 farm guidance separates speed and resource goals using real throughput fields');
 check(x.boss.reasonToClimb.includes('Săn Ảo')&&x.boss.milestone.floor===40,'V110 explains why to climb and shows the next 20-floor element milestone');
}
function state(){const st=createPlayableAdventureState();st.realm.maxRealmOrder=18;st.endlessHunt=createEndlessHuntState();st.endlessHunt.selectedFloor=62;st.endlessHunt.highestUnlockedFloor=62;st.endlessHunt.highestClearedFloor=61;st.endlessHunt.highestUnlockedByMajor={'1':62};st.endlessHunt.highestClearedByMajor={'1':61};st.endlessHunt.farmFloor=41;return st;}
{
 const st=state(),s=new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,11001,st),g=new GameplayFacade(s,registry,thanhHaWorld),api=new LocalGameApplicationApi(g);
 const before=JSON.stringify(api.exportSave());const h=api.getEndlessHunt();const after=JSON.stringify(api.exportSave());
 check(before===after,'V110 Hunt production intelligence is read-only and never mutates save just by opening Săn Yêu');
 check(h.productionV110?.schema==='hunt-production.v110'&&h.productionV110.boss.ready===true,'V110 canonical Hunt DTO exposes production strategy on an uncleared Boss');
 check(h.productionV110.boss.mechanic?.counters?.length===2,'V110 canonical DTO exposes exact counter lanes for current Boss');
 check(h.productionV110.farm.candidates.length>=2&&h.productionV110.farm.candidates.some(x=>x.current),'V110 Hunt DTO compares current farm with multiple already-cleared milestone floors');
 check(h.productionV110.farm.recommendations.length===3,'V110 produces speed, Spirit Stone and equipment farm recommendations without auto-switching player floor');
 const snap=buildWebClientSnapshot(api);
 check(snap.endlessHunt?.productionV110?.schema==='hunt-production.v110','V110 web-client snapshot forwards Boss/farm production intelligence unchanged');
}
{
 const st=state();st.injury=90;const s=new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,11002,st);const h=s.endlessHuntSummary();
 check(h.productionV110.boss.readiness.id==='blocked'&&!h.canFight,'V110 readiness reports injury blocker rather than misleading power advice');
}
const sessionSrc=fs.readFileSync('./dist/core/session.js','utf8'),combatSrc=fs.readFileSync('./modules/hunt-combat-v2.js','utf8'),kernelSrc=fs.readFileSync('./dist/core/endless-hunt-combat-kernel-v2.js','utf8');
check(sessionSrc.includes('resolveEndlessHuntWithCombatKernelV3')&&kernelSrc.includes('runCompiledCombatEncounterV3'),'V110 keeps Boss victory on the canonical CombatKernel V3 path with no separate V110 resolver');
check(combatSrc.includes('h.productionV110')&&combatSrc.includes('bossIntel.readiness')&&combatSrc.includes('bossCounterHint')&&combatSrc.includes('farmIntel.recommendations')&&combatSrc.includes('Gợi ý bãi săn theo build hiện tại'),'V110 Săn Yêu UI consumes readiness, counter guidance and farm recommendations from current production markup');
check(combatSrc.includes('Combat Intelligence')&&combatSrc.includes('bossIntel.readiness')&&!combatSrc.includes('win probability')&&!combatSrc.includes('xác suất thắng'),'V110 UI presents readiness as Combat Intelligence rather than a fake win probability');
console.log(`\nV110 BOSS / HUNT PRODUCTION: ${pass}/${pass} PASS`);
