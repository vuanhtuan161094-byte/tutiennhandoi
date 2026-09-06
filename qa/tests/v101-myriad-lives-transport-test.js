import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';

globalThis.dispatchEvent=()=>true;globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};
let pass=0;const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
async function json(url,init){const response=await fetch(url,init);const payload=await response.json();if(!response.ok||payload.ok===false)throw new Error(`${url}: ${payload.error||response.status}`);return payload;}
async function post(url,body){return json(url,{method:'POST',body:JSON.stringify(body)});}
const r=buildRegistry();const seedSession=new SimulationSession(r,thanhHaWorld,adventureEnemies,playablePlayerProfile,10151,createPlayableAdventureState());
const archive=seedSession.previewCurrentLifeSettlement();archive.lifeId='life.transport.v101.1';archive.lifeNumber=1;archive.totalScore=432;archive.grade='A';archive.ageAtDeathYears=88;archive.causeOfDeath='Thọ tận';archive.categories.cultivation.score=120;archive.categories.combat.score=90;
try{
  await import('../../standalone-runtime.js');
  const health=await json('/api/health');check(health.version==='1.40.0-alpha.24.0','V101 compatibility runs on V140 current runtime');
  const first=await json('/api/state');const save=structuredClone(first.save);
  save.game.meta.archives=[archive];save.game.meta.completedLives=1;save.game.meta.totalLifeScore=432;save.game.meta.reincarnationProgress.rewardHistory=[{lifeId:archive.lifeId,depthTier:'spirit',depthStage:1,reincarnationPoints:60,permanentPotentialGain:12,energyCost:50,offenseRatio:1.1,survivalRatio:1.0,finalizedAtUnixMs:1000}];
  save.game.currentLife.lifeNumber=2;save.game.currentLife.lifeId='life.transport.v101.2';
  const loaded=await post('/api/load',{save});
  check(loaded.snapshot.myriadLives?.schema==='myriad-lives.v101','V101 standalone snapshot exposes myriad-lives.v101');
  check(loaded.snapshot.myriadLives.summary.completedLives===1&&loaded.snapshot.myriadLives.summary.currentLifeNumber===2,'V101 transport restores archive and current-life numbering');
  check(loaded.snapshot.myriadLives.lives[0].totalScore===432&&loaded.snapshot.myriadLives.lives[0].reincarnationReward?.permanentPotentialGain===12,'V101 transport joins archive with Reincarnation V2 reward history');
  check(loaded.snapshot.myriadLives.currentProjection?.vsPreviousLife?.lifeNumber===1,'V101 transport exposes current-vs-previous comparison');
  const paused=await post('/api/action',{action:'realtimePause',paused:true});
  check(paused.snapshot.myriadLives?.rules?.readOnly===true&&paused.snapshot.myriadLives?.rules?.noParallelHistory===true,'V101 read-only/no-parallel-history contract survives standalone action rebuild');
  console.log(`\n${pass}/${pass} V101 Vạn Thế standalone transport checks passed.`);process.exit(0);
}catch(e){console.error(e?.stack||e);process.exit(1)}
