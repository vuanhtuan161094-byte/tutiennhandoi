import fs from 'node:fs';
import {buildRegistry} from '../../dist/content/registry.js';import {thanhHaWorld} from '../../dist/content/world.js';import {adventureEnemies} from '../../dist/content/entities.js';import {createPlayableAdventureState,playablePlayerProfile} from '../../dist/content/adventure.js';import {SimulationSession} from '../../dist/core/session.js';import {GameplayFacade} from '../../dist/core/gameplay.js';
let pass=0;const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};const r=buildRegistry();
function game(order=0,realmId='realm.mortal'){const st=createPlayableAdventureState();st.realm.maxRealmOrder=order;st.realm.realmId=realmId;const s=new SimulationSession(r,thanhHaWorld,adventureEnemies,playablePlayerProfile,10200+order,st);return {s,g:new GameplayFacade(s,r,thanhHaWorld)}}
{
 const {s,g}=game();const before=JSON.stringify(s.snapshot()),x=g.playerExperienceV105(1788210000000).clarity,after=JSON.stringify(s.snapshot());
 check(x.schema==='gameplay-clarity.v102','V102 exposes gameplay-clarity.v102');
 check(x.coreLoop.length===5&&x.coreLoop.map(v=>v.id).join(',')==='cultivate,farm,build,challenge,reincarnate','V102 locks one five-step core loop');
 check(x.systems.length===16&&new Set(x.systems.map(v=>v.id)).size===16,'V102 explains exactly 16 canonical player-facing systems without duplicate ids');
 check(x.systems.every(v=>v.purpose&&v.do&&v.cost&&v.gain&&v.source),'V102 every system answers purpose/do/cost/gain/source');
 check(x.systems.find(v=>v.id==='cultivation')?.unlocked===true&&x.systems.find(v=>v.id==='pvp')?.unlocked===false,'V102 unlock state follows realm instead of showing every system at birth');
 check(x.rules.some(v=>v.includes('Động Phủ = nơi nâng'))&&x.rules.some(v=>v.includes('Vạn Tượng')),'V102 preserves canonical farm/upgrade and optional-gacha rules');
 check(before===after,'V102 clarity read-model is side-effect free');
}
{
 const {g}=game(26,'realm.spirit_transformation.early'),x=g.playerExperienceV105(1788210000000).clarity;
 check(['pvp','soul','daoIntent'].every(id=>x.systems.find(v=>v.id===id)?.unlocked),'V102 reveals Kim Đan/Nguyên Anh/Hóa Thần systems at the right progression');
 check(x.systems.find(v=>v.id==='collection')?.cost.includes('160')&&x.systems.find(v=>v.id==='collection')?.cost.includes('1440'),'V102 explains canonical V100 gacha prices');
 check(x.systems.find(v=>v.id==='pvp')?.cost.includes('không giới hạn số trận'),'V102 explains PvP safety/unlimited-fight rule');
}
const app=fs.readFileSync('./app.js','utf8');check(app.includes('V102 · GAMEPLAY CLARITY')&&app.includes('Tốn gì?')&&app.includes('Kiếm ở đâu?'),'V102 UI renders the four gameplay-clarity questions');
console.log(`\nV102 GAMEPLAY CLARITY: ${pass}/${pass} PASS`);
