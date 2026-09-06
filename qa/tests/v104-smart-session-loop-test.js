import fs from 'node:fs';
import {buildRegistry} from '../../dist/content/registry.js';import {thanhHaWorld} from '../../dist/content/world.js';import {adventureEnemies} from '../../dist/content/entities.js';import {createPlayableAdventureState,playablePlayerProfile} from '../../dist/content/adventure.js';import {SimulationSession} from '../../dist/core/session.js';import {GameplayFacade} from '../../dist/core/gameplay.js';
let pass=0;const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};const r=buildRegistry();
function fixture(order=0,realmId='realm.mortal'){const st=createPlayableAdventureState();st.realm.maxRealmOrder=order;st.realm.realmId=realmId;const s=new SimulationSession(r,thanhHaWorld,adventureEnemies,playablePlayerProfile,10400+order,st);return {s,g:new GameplayFacade(s,r,thanhHaWorld)}}
{
 const {s,g}=fixture();const before=JSON.stringify(s.snapshot()),x=g.playerExperienceV105(1788210000000).sessionLoop,after=JSON.stringify(s.snapshot());
 check(x.schema==='smart-session-loop.v140','Smart Session exposes V140 schema');
 check(x.tasks[0]?.id==='cultivate'&&x.tasks[0]?.priority==='primary','V104 gives a new mortal the correct primary action');
 check(x.tasks.every(v=>v.route&&v.reason&&v.gain),'V104 every recommendation tells route/reason/gain');
 check(x.tasks.length<=6,'V104 caps session recommendations at six instead of becoming a mandatory checklist');
 check(x.principle.includes('Đủ Tu Vi thì Thăng Cảnh'),'Smart Session states the V140 cultivation rule');
 check(before===after,'V104 recommendation read-model is side-effect free');
}
{
 const {s,g}=fixture(10,'realm.foundation.early');s.stateValue.injury=65;const x=g.playerExperienceV105(1788210000000).sessionLoop;
 check(x.tasks[0]?.id==='recover-injury','V104 prioritizes recovery over blind cultivation when Thương Thế is severe');
 check(x.tasks.some(v=>v.id==='define-dao'),'V104 reminds Trúc Cơ players to Định Đạo when identity is missing');
}
const app=fs.readFileSync('./app.js','utf8');check(app.includes('V104 · SMART SESSION LOOP')&&app.includes("model.playerExperience?.sessionLoop?.tasks"),'V104 powers both Guide and Overview from the same smart-session read-model');
console.log(`\nV104 SMART SESSION LOOP: ${pass}/${pass} PASS`);
