import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { cultivationRealmV140 } from '../../dist/core/cultivation-v140.js';
import { IMMORTAL_MAJOR_STAGES_V114, immortalProgressionSummaryV114 } from '../../dist/core/immortal-progression-v114.js';
const r=buildRegistry();let pass=0;const ok=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
function make(order){const st=createPlayableAdventureState();const realm=[...r.realms.values()].find(x=>x.order===order);st.realm.realmId=realm.id;st.realm.maxRealmOrder=order;st.injury=0;return new SimulationSession(r,thanhHaWorld,adventureEnemies,playablePlayerProfile,11400+order,st)}
ok(IMMORTAL_MAJOR_STAGES_V114.length===18,'V114 covers every Immortal+ major stage through Sáng Thế Chủ');
{
 const s=make(49);const q=immortalProgressionSummaryV114(s.stateValue,s.stateValue.dungeons);ok(q.active&&q.finalGate.applies&&!q.finalGate.ready,'Immortal content objectives remain visible as guidance');
 s.stateValue.cultivation.tuVi=cultivationRealmV140(49).requiredTuVi;const out=s.ascendRealmV140();ok(out.toRealmId==='realm.earth_immortal.early','V140 deterministic Thăng Cảnh is not blocked by optional Immortal dungeon objectives');
}
{const s=make(117);s.stateValue.dungeons.highestClearedFloor['dungeon.genesis_source']=5;const q=immortalProgressionSummaryV114(s.stateValue,s.stateValue.dungeons);ok(q.terminal&&q.finalGate.ready,'Sáng Thế Chủ keeps a terminal completion objective, not a fake next realm');}
console.log(`V114 IMMORTAL CONTENT: ${pass}/${pass} PASS`);
