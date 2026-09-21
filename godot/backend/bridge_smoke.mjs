import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE=dirname(fileURLToPath(import.meta.url));
const SERVER=resolve(HERE,'bridge_server.mjs');
const PORT=4219;
const BASE=`http://127.0.0.1:${PORT}`;
const EXPECTED_VERSION='godot-bridge.v2';
const EXPECTED_HOME='godot-home-bridge.v1';
const EXPECTED_CHARACTER='godot-character-bridge.v1';
const EXPECTED_AUTHORITY='character-cultivation.v140';

function assert(condition,message){
  if(!condition)throw new Error(message);
}
async function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
async function request(path,{method='GET',body}={}){
  const response=await fetch(BASE+path,{
    method,
    headers:body?{'content-type':'application/json'}:undefined,
    body:body?JSON.stringify(body):undefined,
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(`${method} ${path} -> ${response.status}: ${data?.error||'unknown error'}`);
  return data;
}
async function waitHealth(timeoutMs=12000){
  const deadline=Date.now()+timeoutMs;
  let last='';
  while(Date.now()<deadline){
    try{
      const health=await request('/health');
      if(health.ok)return health;
    }catch(error){last=error?.message||String(error);}
    await sleep(180);
  }
  throw new Error('Bridge health timeout'+(last?`: ${last}`:''));
}
function start(savePath){
  const child=spawn(process.execPath,[SERVER,String(PORT)],{
    env:{
      ...process.env,
      TUTIEN_GODOT_BRIDGE_SAVE:savePath,
      TUTIEN_GODOT_BRIDGE_DIAGNOSTIC:'1',
    },
    stdio:['ignore','pipe','pipe'],
    windowsHide:true,
  });
  let logs='';
  child.stdout.on('data',chunk=>{logs+=chunk.toString();});
  child.stderr.on('data',chunk=>{logs+=chunk.toString();});
  return {child,logs:()=>logs};
}
async function stop(proc){
  if(!proc||proc.exitCode!==null)return;
  proc.kill();
  await Promise.race([
    new Promise(resolve=>proc.once('exit',resolve)),
    sleep(1500),
  ]);
}
function validateHome(home){
  assert(home?.ok===true,'Home DTO must be ok');
  assert(home?.schema===EXPECTED_HOME,`Unexpected Home schema: ${home?.schema}`);
  assert(home?.bridgeVersion===EXPECTED_VERSION,`Unexpected bridge version: ${home?.bridgeVersion}`);
  assert(home?.authority?.cultivation===EXPECTED_AUTHORITY,'Cultivation authority mismatch');
  for(const path of [
    ['life','lifeNumber'],['life','realm'],['cultivation','tuVi'],
    ['cultivation','liveTuVi'],['cultivation','requiredTuVi'],
    ['cultivation','finalTuViPer15s'],['cultivation','finalTuViPerSecond'],
    ['resources','spiritStone'],['resources','reincarnationCp'],
    ['spiritualRoot','name'],
  ]){
    let value=home;
    for(const key of path)value=value?.[key];
    assert(value!==undefined&&value!==null,`Missing Home field: ${path.join('.')}`);
  }
}
function validateCharacter(view){
  assert(view?.ok===true,'Character DTO must be ok');
  assert(view?.schema===EXPECTED_CHARACTER,`Unexpected Character schema: ${view?.schema}`);
  assert(view?.bridgeVersion===EXPECTED_VERSION,`Unexpected Character bridge version: ${view?.bridgeVersion}`);
  assert(view?.authority?.equipment==='equipment.v142','Character equipment authority mismatch');
  assert(view?.authority?.stats==='combat-stat.v168','Character stat authority mismatch');
  assert(view?.character&&typeof view.character==='object','Character DTO missing character');
  assert(view?.equipmentSystem&&typeof view.equipmentSystem==='object','Character DTO missing equipmentSystem');
  assert(Array.isArray(view?.equipment),'Character DTO equipment must be an array');
  assert(Array.isArray(view?.equipmentInventory),'Character DTO equipmentInventory must be an array');
  assert(view?.character?.combatStats&&typeof view.character.combatStats==='object','Character DTO missing V168 combatStats');
  assert(view?.character?.originProgression&&typeof view.character.originProgression==='object','Character DTO missing profile progression');
  const slotCount=Number(view.equipmentSystem?.canonicalSlotCount)||Number(view.equipmentSystem?.slots?.length)||0;
  assert(slotCount===10,`Expected 10 canonical equipment slots, got ${slotCount}`);
}

const temp=await mkdtemp(join(tmpdir(),'tutien-godot-bridge-'));
const savePath=join(temp,'bridge-save.json');
let first;
let second;
try{
  first=start(savePath);
  const health=await waitHealth();
  assert(health.bridgeVersion===EXPECTED_VERSION,'Health bridge version mismatch');
  assert(health.authority==='canonical-dist','Health authority must be canonical-dist');

  const created=await request('/new',{method:'POST',body:{seed:161094}});
  validateHome(created.home);
  const character=await request('/character');
  validateCharacter(character);
  assert(created.home.life.realm==='Phàm Nhân',`Expected fresh realm Phàm Nhân, got ${created.home.life.realm}`);
  assert(Number(created.home.cultivation?.retreat?.rewardPct3h)===0,'Phàm Nhân retreat reward must be 0 by canonical V140 balance');
  assert(Number(created.home.cultivation.finalTuViPerSecond)>0,'Backend must expose positive per-second cultivation rate');
  assert(Number.isInteger(Number(created.home.cultivation.finalTuViPerSecond)),'Per-second cultivation display rate must be rounded upward to an integer');

  const canonicalBeforeSecond=Number(created.home.cultivation.tuVi)||0;
  const liveBeforeSecond=Number(created.home.cultivation.liveTuVi)||0;
  await sleep(1200);
  const liveSecond=await request('/home');
  validateHome(liveSecond);
  const canonicalAfterSecond=Number(liveSecond.cultivation.tuVi)||0;
  const liveAfterSecond=Number(liveSecond.cultivation.liveTuVi)||0;
  assert(canonicalAfterSecond===canonicalBeforeSecond,'Canonical V140 settlement should not change before its 15s quantum');
  assert(liveAfterSecond>liveBeforeSecond,`Backend live Tu Vi must advance each second: ${liveBeforeSecond} -> ${liveAfterSecond}`);

  const filled=await request('/action',{method:'POST',body:{action:'diagnosticCommit',seconds:300}});
  validateHome(filled.home);
  assert(filled.home.cultivation.ready===true,'Phàm Nhân should reach ready state after diagnostic cultivation');

  const ascended=await request('/action',{method:'POST',body:{action:'ascendRealmV140'}});
  validateHome(ascended.home);
  assert(Number(ascended.home.life.realmOrder)>=1,`Expected Luyện Khí or higher after ascension, got order ${ascended.home.life.realmOrder}`);
  assert(Number(ascended.home.cultivation?.retreat?.rewardPct3h)>0,'Retreat must unlock from Luyện Khí');

  const before=Number(ascended.home.cultivation.tuVi)||0;
  const bankBefore=Number(ascended.home.cultivation?.retreat?.bankHours)||0;
  assert(bankBefore>0,`Expected canonical retreat bank > 0, got ${bankBefore}`);

  const action=await request('/action',{method:'POST',body:{action:'retreatV140',hours:1}});
  validateHome(action.home);
  const after=Number(action.home.cultivation.tuVi)||0;
  const bankAfter=Number(action.home.cultivation?.retreat?.bankHours)||0;
  assert(after>before,`Canonical retreat did not increase Tu Vi at Luyện Khí: ${before} -> ${after}`);
  assert(bankAfter<bankBefore,`Canonical retreat bank did not decrease: ${bankBefore} -> ${bankAfter}`);
  assert(Number(action.result?.hoursUsed)>0,'Canonical retreat result must report hoursUsed > 0');
  assert(Number(action.result?.gained)>0,'Canonical retreat result must report gained > 0');

  await sleep(2300);
  await request('/diagnostic/shutdown',{method:'POST',body:{}});
  await Promise.race([
    new Promise(resolve=>first.child.once('exit',resolve)),
    sleep(1800),
  ]);
  await stop(first.child);
  first=null;
  await sleep(250);

  second=start(savePath);
  await waitHealth();
  const restored=await request('/home');
  validateHome(restored);
  validateCharacter(await request('/character'));
  const restoredTuVi=Number(restored.cultivation.tuVi)||0;
  assert(restoredTuVi>=after,`Persisted Tu Vi regressed after restart: ${after} -> ${restoredTuVi}`);

  console.log('GODOT PHASE 1 BRIDGE SMOKE: PASS');
  console.log(`Bridge: ${EXPECTED_VERSION}`);
  console.log(`Authority: ${EXPECTED_AUTHORITY}`);
  console.log('Unlock path: Phàm Nhân -> Luyện Khí');
  console.log(`Retreat bank: ${bankBefore}h -> ${bankAfter}h`);
  console.log(`Tu Vi after unlock: ${before} -> ${after} -> restart ${restoredTuVi}`);
  console.log(`Realm: ${restored.life.realm} · Root: ${restored.spiritualRoot.name}`);
}catch(error){
  const logs=[first?.logs?.(),second?.logs?.()].filter(Boolean).join('\n');
  console.error('GODOT PHASE 1 BRIDGE SMOKE: FAIL');
  console.error(error?.stack||error);
  if(logs)console.error('\n--- bridge logs ---\n'+logs);
  process.exitCode=1;
}finally{
  await stop(first?.child);
  await stop(second?.child);
  await rm(temp,{recursive:true,force:true}).catch(()=>{});
}
