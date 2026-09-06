import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {buildRegistry} from '../../dist/content/registry.js';
import {createPlayableAdventureState, playablePlayerProfile} from '../../dist/content/adventure.js';
import {adventureEnemies} from '../../dist/content/entities.js';
import {thanhHaWorld} from '../../dist/content/world.js';
import {SimulationSession} from '../../dist/core/session.js';
import {GameplayFacade} from '../../dist/core/gameplay.js';
import {createGameApplicationApi} from '../../dist/core/game-api.js';
import {buildEquipmentInstance} from '../../dist/core/equipment.js';

const registry=buildRegistry();
const state=createPlayableAdventureState();
const templates=['equipment.black_iron_blade','equipment.qingfeng_sword'];
for(let i=0;i<300;i++){
  const template=registry.equipmentTemplate(templates[i%templates.length]);
  const item=buildEquipmentInstance(template,i%3,['low','mid','high','perfect'][i%4],1+(i%20),{kind:'dungeon',dungeonId:'stress',floor:1+(i%20),seed:129000+i},1+i);
  state.equipment.items.push(item);
}
const history=Array.from({length:10_000},(_,i)=>({
  id:`stress.${i}`,worldTimeYears:i/10,ageYears:20+i/365,type:i%7===0?'world':'system',
  significance:i%31,message:`Stress event ${i}`,locationId:'location.qingyun',tags:i%5===0?['Stress','Milestone']:['Stress'],data:{i}
}));
const session=new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,129300,state,0,history);
const api=createGameApplicationApi(new GameplayFacade(session,registry,thanhHaWorld));

function measure(fn,rounds=5){
  const times=[];let value;
  for(let i=0;i<rounds;i++){const t0=performance.now();value=fn();times.push(performance.now()-t0);}
  times.sort((a,b)=>a-b);return {value,median:times[Math.floor(times.length/2)],max:times.at(-1)};
}
function bytes(value){return Buffer.byteLength(JSON.stringify(value));}
let pass=0;const ok=(name,fn)=>{fn();pass++;console.log(`PASS ${String(pass).padStart(2,'0')} ${name}`)};

const inv=measure(()=>api.getEquipmentInventoryV129());
ok('300-item Inventory DTO stays bounded',()=>{assert.ok(bytes(inv.value)<300*1024,`${(bytes(inv.value)/1024).toFixed(1)} KiB`);assert.ok(inv.max<120,`max ${inv.max.toFixed(1)}ms`);});
const build=measure(()=>api.getBuild());
ok('Build Sheet does not scale with the whole 300-item bag',()=>{assert.ok(build.max<120,`max ${build.max.toFixed(1)}ms`);});
const journal=measure(()=>api.getJournal());
ok('10k History journal top-N stays fast',()=>{assert.ok(journal.max<80,`max ${journal.max.toFixed(1)}ms`);assert.ok(bytes(journal.value)<120*1024,`${(bytes(journal.value)/1024).toFixed(1)} KiB`);});
ok('Stress fixture is real',()=>{assert.equal(session.stateValue.equipment.items.length,300);assert.equal(session.historyValue.size(),10_000);});
if(typeof global.gc==='function'){
  global.gc();const before=process.memoryUsage().heapUsed;
  for(let i=0;i<2500;i++){if(i%3===0)api.getEquipmentInventoryV129();else if(i%3===1)api.getBuild();else api.getJournal();}
  global.gc();const delta=process.memoryUsage().heapUsed-before;
  ok('2500 repeated read-model calls do not retain runaway heap',()=>assert.ok(delta<16*1024*1024,`heap drift ${(delta/1024/1024).toFixed(2)} MiB`));
}
console.log(`V129 PERFORMANCE STRESS: ${pass}/${pass} PASS · inventory=${inv.median.toFixed(1)}ms/${(bytes(inv.value)/1024).toFixed(1)}KiB · build=${build.median.toFixed(1)}ms · journal=${journal.median.toFixed(1)}ms`);
