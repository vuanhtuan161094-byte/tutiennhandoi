import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { LocalGameApplicationApi } from '../../dist/core/game-api.js';
import { buildWebClientSnapshot } from '../../dist/core/client-shell.js';
import { DungeonEngine } from '../../dist/core/dungeon.js';
import { ensureCollectionProgressStateV12316 } from '../../dist/core/collection-progression-v12316.js';
import { collectionWorkshopSummaryV12326 } from '../../dist/core/collection-workshop-gacha-v12326.js';
import { RESOURCE_PVE_DUNGEONS_V12329, RESOURCE_PVE_DUNGEON_DEFINITIONS_V12329, grantResourcePveRewardsV12329, resourcePveProductionCatalogV109 } from '../../dist/core/resource-pve-v12329.js';
let pass=0;const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
const registry=buildRegistry();
function state(order=18){const st=createPlayableAdventureState();st.realm.maxRealmOrder=order;const c=ensureCollectionProgressStateV12316(st);c.currencies.boundImmortalJade=100000;return st;}
const cats=['manual','heart','artifact','relic','pet','companion','bloodline','physique'];
const catalog=resourcePveProductionCatalogV109();
check(catalog.length===8&&new Set(catalog.map(x=>x.category)).size===8,'V109 has exactly 8 canonical resource dungeon categories');
check(cats.every(c=>catalog.some(x=>x.category===c)),'V109 covers all 8 progression systems with one resource dungeon each');
check(catalog.every(x=>x.firstClearMode==='CombatKernelV2'&&x.farmMode==='time-based-dungeon'),'V109 separates first-clear combat from time-based repeat farming');
check(catalog.every(x=>x.repeatGuardianMaterialReward===false&&x.specificFragments==='gacha-only'),'V109 prevents instant guardian spam and keeps specific fragments gacha-only');
check(Object.values(RESOURCE_PVE_DUNGEON_DEFINITIONS_V12329).every(d=>d.floors.length===8&&d.rewards.length===0&&d.guardianLoot.equipmentLoot.length===0&&d.guardianLoot.artifactLoot.length===0),'V109 resource dungeons never drop equipment/artifacts and each has 8 realm floors');
// Guardian first clear is a milestone reward; repeat guardian has zero progression material.
{
 const root=state(),c=ensureCollectionProgressStateV12316(root),before=c.genericFragments.manual;
 const first=grantResourcePveRewardsV12329(c,root.inventory,'dungeon.v12329.manual',1,true,10901);
 check(first.material>0&&first.breakthrough>0&&c.genericFragments.manual>before,'V109 first-clear grants milestone strengthening + breakthrough material');
 const after=c.genericFragments.manual,repeat=grantResourcePveRewardsV12329(c,root.inventory,'dungeon.v12329.manual',1,false,10902);
 check(repeat.material===0&&repeat.breakthrough===0&&c.genericFragments.manual===after,'V109 repeat guardian battle cannot be spammed for progression material');
}
// Main-body DungeonEngine farming consumes world-time semantics and actually grants collection materials.
{
 const root=state(),c=ensureCollectionProgressStateV12316(root),before=c.genericFragments.manual,specific=c.items?.['manual.1']?.specificFragments??0;
 const d=thanhHaWorld.dungeons['dungeon.v12329.manual'];const out=new DungeonEngine().run(root,d,10,10903,1,1,registry);
 check(c.genericFragments.manual>before&&Object.values(out.rewards).some(x=>x>0),'V109 main-body DungeonEngine time farm grants real strengthening material');
 check((c.items?.['manual.1']?.specificFragments??0)===specific,'V109 time farm never generates specific item fragments');
 check(out.equipmentDrops.length===0&&out.artifactDrops.length===0,'V109 resource time farm never leaks equipment/artifact loot');
}
// Clone/offline parallel path uses the same DungeonEngine consumer.
{
 const root=state(22),c=ensureCollectionProgressStateV12316(root),before=c.genericFragments.pet;const d='dungeon.v12329.pet';root.dungeons.unlockedDungeonIds.push(d);root.dungeons.highestClearedFloor[d]=1;root.dungeons.parallelWorkerCapacity=1;root.dungeons.workers=[{id:'worker.v109',name:'Phân Thân V109',kind:'avatar',efficiency:.7,baseEfficiency:.7,specialization:'beast',soulLoad:1}];root.dungeons.assignments={'worker.v109':{workerId:'worker.v109',dungeonId:d,floor:1,totalYears:0,totalRuns:0}};
 const out=new DungeonEngine().resolveParallel(root,thanhHaWorld.dungeons,20,10904,registry,1);
 check(c.genericFragments.pet>before&&out.events.length===1,'V109 Phân Thân parallel farm earns real category material');
 check(root.dungeons.assignments['worker.v109'].totalYears===20&&root.dungeons.assignments['worker.v109'].totalRuns===1,'V109 parallel farm records worker years/runs canonically');
}
// Player-facing DTO makes first-clear -> farm transition explicit.
{
 const st=state(1),s=new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,10905,st),g=new GameplayFacade(s,registry,thanhHaWorld);let snap=buildWebClientSnapshot(new LocalGameApplicationApi(g));let d=snap.dungeons.find(x=>x.id==='dungeon.v12329.manual');
 check(d.resourcePve?.targetMode==='progress'&&d.resourcePve?.v109?.firstClearMode==='CombatKernelV2','V109 snapshot tells player to first-clear resource floor through CombatKernel V2');
 s.stateValue.dungeons.highestClearedFloor['dungeon.v12329.manual']=1;snap=buildWebClientSnapshot(new LocalGameApplicationApi(g));d=snap.dungeons.find(x=>x.id==='dungeon.v12329.manual');
 check(d.resourcePve?.targetMode==='farm'&&d.resourcePve?.canFarm===true&&d.resourcePve?.materialPerYear>0,'V109 snapshot switches cleared floor to time-based farm with visible per-year yield');
}
// Old daily workshop remains readable for save migration, but production write is retired.
{
 const st=state(),c=ensureCollectionProgressStateV12316(st);const summary=collectionWorkshopSummaryV12326(c,st.inventory,st.character.buildFoundation,undefined,Date.now(),18);
 check(summary.v109?.dailyWorkshopWritesRetired===true&&summary.daily?.retiredProduction===true,'V109 collection DTO explicitly retires old Daily Workshop production writes');
 check(summary.daily.dungeons.every(x=>x.retiredProduction&&x.open===false),'V109 legacy daily entries remain read-compatible but cannot present as active farm sources');
}
const app=fs.readFileSync('./app.js','utf8'),rt=fs.readFileSync('./standalone-runtime.js','utf8');
check(app.includes('V109 · RESOURCE DUNGEON PRODUCTION')&&app.includes('data-resource-farm'),'V109 UI exposes first-clear then time-based farm loop');
check(app.includes("action:'perform',command:{type:'activity',request:{type:'dungeon'")&&app.includes('Treo Farm 1 Năm'),'V109 repeat farm UI uses canonical dungeon activity instead of repeat boss reward');
check(rt.includes("case'collectionDailyV12326':throw")&&rt.includes("case'collectionDailyV12325':throw")&&rt.includes("case'collectionDailyV12316':throw"),'V109 standalone transport blocks all three legacy daily reward write paths');
check(!app.includes("action:id.startsWith('daily.v2326.')?'collectionDailyV12326'"),'V109 browser no longer invokes legacy daily reward actions');
console.log(`\nV109 RESOURCE DUNGEON PRODUCTION: ${pass}/${pass} PASS`);
