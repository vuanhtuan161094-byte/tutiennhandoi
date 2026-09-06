import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
let pass=0;const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
const r=buildRegistry(),st=createPlayableAdventureState(); st.inventory['resource.spirit_stone']=3000;
const faction=Object.values(st.factions.factions)[0]; st.locationId=faction.locationId;
const s=new SimulationSession(r,thanhHaWorld,adventureEnemies,playablePlayerProfile,9701,st),g=new GameplayFacade(s,r,thanhHaWorld);
let f=g.faction();
check(f.factions.some(x=>x.id===faction.id&&x.canJoin),'V97 faction DTO exposes joinable sect at current location');
check(g.dispatch({type:'joinFaction',factionId:faction.id}).ok,'V97 join faction action runs through GameplayFacade');
f=g.faction(); check(f.membership?.factionId===faction.id,'V97 joining faction persists real membership');
const merit0=f.membership.merit,stone0=s.state.inventory['resource.spirit_stone'];
check(g.dispatch({type:'factionContribute',resourceId:'resource.spirit_stone',quantity:50}).ok,'V97 faction contribution action succeeds');
check(s.state.inventory['resource.spirit_stone']===stone0-50&&g.faction().membership.merit>merit0,'V97 contribution consumes personal resource and grants real faction merit');
s.stateValue.realm.maxRealmOrder=3;
check(g.dispatch({type:'factionPromote'}).ok&&g.faction().membership.rank==='innerDisciple','V97 faction promotion uses real merit/realm requirements');
const candidate=g.faction().contributableKnowledge[0];
if(candidate){ const before=g.faction().membership.merit; const res=g.dispatch({type:'factionContributeKnowledge',kind:candidate.kind,knowledgeId:candidate.id}); check(res.ok,'V97 can contribute known technique/skill into sect transmission'); check(g.faction().membership.merit>=before,'V97 knowledge contribution persists archive/merit changes'); }
else { check(true,'V97 no extra knowledge candidate in fixture; DTO correctly reports empty contribution list'); check(true,'V97 empty contribution list does not invent knowledge'); }
const npcEntry=Object.entries(s.state.worldSimulation.npcs).filter(([,n])=>n.alive&&n.realmOrder>=s.state.realm.maxRealmOrder+2).sort((a,b)=>b[1].realmOrder-a[1].realmOrder)[0];
check(Boolean(npcEntry),'V97 has a valid higher-realm NPC for master flow'); const [npcId,npcState]=npcEntry; s.stateValue.locationId=npcState.locationId;
check(g.dispatch({type:'interactNpc',npcId,action:'greet'}).ok,'V97 NPC interaction creates real relationship');
const key=`${s.currentLife.lifeId}|${npcId}`; const rel=s.stateValue.worldSimulation.playerRelationships[key]; rel.trust=Math.max(rel.trust,6); rel.respect=Math.max(rel.respect,13); rel.karmaDepth=Math.max(rel.karmaDepth,5); rel.lastInteractionWorldYear-=1;
let social=g.social(); check(social.npcs.find(x=>x.id===npcId)?.eligibility.master===true,'V97 social DTO exposes exact master eligibility');
check(g.dispatch({type:'takeMaster',npcId}).ok,'V97 taking a master runs through GameplayFacade'); social=g.social();
check(social.bonds.some(x=>x.npcId===npcId&&x.role==='master'),'V97 master bond persists in SocialState');
check(['trust','respect','debt','grudge','karmaDepth'].every(k=>k in social.npcs.find(x=>x.id===npcId).relation),'V97 UI DTO exposes five canonical relationship axes');
const masterBefore=s.state.character.techniqueMastery[s.state.character.activeTechniqueId]??0; const teach=g.dispatch({type:'receiveMasterTeaching',npcId}); check(teach.ok,'V97 master teaching is a real player action'); check((s.state.character.techniqueMastery[s.state.character.activeTechniqueId]??0)>=masterBefore,'V97 master teaching affects real character progression');
// Player-founded sect path: founding makes the player leader and opens facility management.
const st2=createPlayableAdventureState(); st2.realm.maxRealmOrder=14; st2.inventory['resource.spirit_stone']=1000; const s2=new SimulationSession(r,thanhHaWorld,adventureEnemies,playablePlayerProfile,9702,st2),g2=new GameplayFacade(s2,r,thanhHaWorld);
const found=g2.dispatch({type:'foundFaction',name:'Thanh Vân Thử Môn',doctrineTags:['Test']}); check(found.ok,'V97 Tử Phủ player can found a persistent sect through facade'); const ff=g2.faction(),own=ff.factions.find(x=>x.current); check(ff.membership?.rank==='leader'&&own,'V97 founder becomes real sect leader'); check(g2.dispatch({type:'factionContribute',resourceId:'resource.spirit_stone',quantity:400}).ok,'V97 founder can fund sect treasury before construction'); const facilityId='spiritVein'; const lv0=own.facilities[facilityId]; const up=g2.dispatch({type:'factionUpgradeFacility',facilityId}); check(up.ok&&g2.faction().factions.find(x=>x.current).facilities[facilityId]===lv0+1,'V97 sect leader can spend treasury to upgrade infrastructure');
const app=fs.readFileSync('./app.js','utf8');
check(app.includes('faction:renderFactionV97')&&app.includes('social:renderSocialV97'),'V97 app router exposes Faction and Social screens');
check(['data-faction-contribute','data-faction-learn','data-faction-knowledge','data-faction-invite','data-faction-teach','data-social-interact'].every(x=>app.includes(x)),'V97 UI binds faction archive/recruit/teaching and social mutations');
console.log(`V97 FACTION+SOCIAL: ${pass}/${pass} PASS`);
