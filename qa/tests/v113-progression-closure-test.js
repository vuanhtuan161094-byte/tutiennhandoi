import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { mortalProgressionSummaryV113, tribulationMilestoneBlockersV113 } from '../../dist/core/progression-closure-v113.js';
const r=buildRegistry(); let pass=0; const ok=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
function make(order){const st=createPlayableAdventureState();const realm=[...r.realms.values()].find(x=>x.order===order);st.realm.realmId=realm.id;st.realm.maxRealmOrder=order;return new SimulationSession(r,thanhHaWorld,adventureEnemies,playablePlayerProfile,11300+order,st)}
{
 const s=make(29); const q=mortalProgressionSummaryV113(s.stateValue,s.stateValue.dungeons,s.integrationSummary(),s.greatVehicleSummary());
 ok(q.active&&q.stage.id==='spirit_transformation','V113 still exposes Hóa Thần content milestones as guidance');
 ok(q.objectives.some(x=>x.id==='dungeon'),'V113 content summary keeps first-clear objectives without owning Thăng Cảnh');
}
{
 const s=make(41);ok(tribulationMilestoneBlockersV113(s.stateValue,s.stateValue.dungeons).length===1,'V113 blocks first Heavenly Tribulation before Great Vehicle final milestone');s.stateValue.dungeons.highestClearedFloor['dungeon.great_vehicle_domain']=5;ok(tribulationMilestoneBlockersV113(s.stateValue,s.stateValue.dungeons).length===0,'V113 accepts Great Vehicle floor 5 milestone');
}
{
 const s=make(45);s.stateValue.dungeons.highestClearedFloor['dungeon.heavenly_tribulation_field']=3;ok(tribulationMilestoneBlockersV113(s.stateValue,s.stateValue.dungeons)[0].includes('tầng 4'),'V113 final Heavenly Tribulation requires field floor 4');
}
console.log(`V113 PROGRESSION CONTENT: ${pass}/${pass} PASS`);
