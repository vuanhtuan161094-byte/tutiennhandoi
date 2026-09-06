import {buildRegistry} from '../../dist/content/registry.js';
import {thanhHaWorld} from '../../dist/content/world.js';
import {adventureEnemies} from '../../dist/content/entities.js';
import {createPlayableAdventureState,playablePlayerProfile} from '../../dist/content/adventure.js';
import {SimulationSession} from '../../dist/core/session.js';

globalThis.dispatchEvent=()=>true;globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};
let pass=0;const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
async function json(url,init){const response=await fetch(url,init);const payload=await response.json();if(!response.ok||payload.ok===false)throw new Error(`${url}: ${payload.error||response.status}`);return payload;}
async function post(url,body){return json(url,{method:'POST',body:JSON.stringify(body)});}
try{
 await import('../../standalone-runtime.js');
 const health=await json('/api/health');check(health.version==='1.40.0-alpha.24.0','V105 compatibility runs on V140 current runtime');
 const first=await json('/api/state');
 check(first.snapshot.playerExperience?.schema==='player-experience.v105','V105 standalone snapshot exposes consolidated player experience DTO');
 check(first.snapshot.playerExperience.clarity?.schema==='gameplay-clarity.v102','V102 clarity survives standalone transport');
 check(first.snapshot.playerExperience.progression?.schema==='progression-guide.v103','V103 progression guide survives standalone transport');
 check(first.snapshot.playerExperience.sessionLoop?.schema==='smart-session-loop.v140','V104 smart session loop survives standalone transport');
 check(first.snapshot.playerExperience.buildOverview?.schema==='build-overview.v105','V105 build overview survives standalone transport');
 const save=structuredClone(first.save);save.game.state.realm.maxRealmOrder=26;save.game.state.realm.realmId='realm.spirit_transformation.early';
 const loaded=await post('/api/load',{save});
 check(loaded.snapshot.playerExperience.progression.currentMilestone.order===26,'V105 transport rebuilds progression from loaded Hóa Thần save');
 const soulBuild=loaded.snapshot.playerExperience.buildOverview.systems.find(x=>x.id==='soul');check(Boolean(loaded.snapshot.soul.awakened)===(!String(soulBuild?.value||'').startsWith('Chưa')),'V105 guide and canonical soul snapshot stay internally consistent');
 check(loaded.snapshot.playerExperience.clarity.systems.find(x=>x.id==='daoIntent')?.unlocked===true,'V102 clarity unlocks Đạo Ý in transported Hóa Thần state');
 const paused=await post('/api/action',{action:'realtimePause',paused:true});
 check(paused.snapshot.playerExperience?.sessionLoop?.tasks?.length>0,'V104 recommendations survive standalone action snapshot rebuild');
 check(paused.snapshot.playerExperience.buildOverview.truth.includes('CombatEntity canonical'),'V105 no-fake-power contract survives transport');
 console.log(`\n${pass}/${pass} V105 player-experience standalone transport checks passed.`);process.exit(0);
}catch(e){console.error(e?.stack||e);process.exit(1)}
