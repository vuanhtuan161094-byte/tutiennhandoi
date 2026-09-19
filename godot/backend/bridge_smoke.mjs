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
    ['cultivation','requiredTuVi'],['cultivation','finalTuViPer15s'],
    ['resources','spiritStone'],['resources','reincarnationCp'],
    ['spiritualRoot','name'],
  ]){
    let value=home;
    for(const key of path)value=value?.[key];
    assert(value!==undefined&&value!==null,`Missing Home field: ${path.join('.')}`);
  }
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
  const before=Number(created.home.cultivation.tuVi)||0;

  const action=await request('/action',{method:'POST',body:{action:'diagnosticCommit'}});
  validateHome(action.home);
  const after=Number(action.home.cultivation.tuVi)||0;
  assert(after>before,`Canonical cultivation commit did not increase Tu Vi: ${before} -> ${after}`);

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
  const restoredTuVi=Number(restored.cultivation.tuVi)||0;
  assert(restoredTuVi>=after,`Persisted Tu Vi regressed after restart: ${after} -> ${restoredTuVi}`);

  console.log('GODOT PHASE 1 BRIDGE SMOKE: PASS');
  console.log(`Bridge: ${EXPECTED_VERSION}`);
  console.log(`Authority: ${EXPECTED_AUTHORITY}`);
  console.log(`Tu Vi: ${before} -> ${after} -> restart ${restoredTuVi}`);
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
