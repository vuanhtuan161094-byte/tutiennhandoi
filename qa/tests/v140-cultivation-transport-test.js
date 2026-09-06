import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { createGameApplicationApi } from '../../dist/core/game-api.js';

let passed=0; const check=(name,fn)=>{fn();passed++;console.log(`✓ ${name}`)};
const registry=buildRegistry(); const session=new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,140100,createPlayableAdventureState());
const api=createGameApplicationApi(new GameplayFacade(session,registry,thanhHaWorld));
check('application API is V140 and exposes only current cultivation actions',()=>{
  assert.equal(api.apiVersion,'game-api.v140');
  for(const name of ['getCultivationV140','instantRetreat','ascendRealm']) assert.equal(typeof api[name],'function',name);
  for(const name of ['setCultivationMethod','useBreakthroughPill','recoverMeridian','lifespanBurn','getBreakthroughPreview']) assert.equal(typeof api[name],'undefined',name);
});
check('cultivation DTO is compact and provenance-enabled',()=>{
  const c=api.getCultivationV140(); assert.equal(c.schema,'cultivation.v140');
  for(const key of ['tuVi','requiredTuVi','progressPct','baseTuViPer15s','finalTuViPer15s','sources','retreat','injury','transition']) assert(key in c,key);
  for(const key of ['impurity','meridianHealth','foundationQuality','breakthroughChance','preparation']) assert.equal(key in c,false,key);
});
check('frontend sends V140 view patch and displays only V140 cultivation actions',()=>{
  const app=fs.readFileSync('app.js','utf8');
  assert.match(app,/clientTransport:'view-patch\.v140'/); assert.match(app,/data-retreat-hours/); assert.match(app,/data-ascend-realm-v140/); assert.match(app,/data-tribulation-v140/);
  for(const bad of ['data-cultivation-method','data-breakthrough-pill','data-lifespan-burn','data-recover-meridian']) assert(!app.includes(bad),bad);
});
check('web shell/cache/version are aligned to 1.40.0-alpha.24.0',()=>{
  const files=['index.html','standalone-runtime.js','standalone-entry.js','pwa-register.js','pwa-sw.js'].map(x=>fs.readFileSync(x,'utf8')).join('\n');
  assert(files.includes('1.40.0-alpha.24.0')); assert(!files.includes('1.39.0-alpha.23.78')); assert(!files.includes('view-patch.v129'));
});
console.log(`\nV140 CULTIVATION TRANSPORT — ${passed}/${passed} PASS`);
