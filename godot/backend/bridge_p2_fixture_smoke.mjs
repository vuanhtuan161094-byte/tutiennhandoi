import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE=dirname(fileURLToPath(import.meta.url));
const SERVER=resolve(HERE,'bridge_server.mjs');
const PORT=4220;
const BASE=`http://127.0.0.1:${PORT}`;

function assert(condition,message){
  if(!condition)throw new Error(message);
}
async function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
async function request(path,{method='GET',body,allowError=false}={}){
  const response=await fetch(BASE+path,{
    method,
    headers:body?{'content-type':'application/json'}:undefined,
    body:body?JSON.stringify(body):undefined,
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok&&!allowError)throw new Error(`${method} ${path} -> ${response.status}: ${data?.error||'unknown error'}`);
  return {response,data};
}
async function waitHealth(timeoutMs=12000){
  const deadline=Date.now()+timeoutMs;
  while(Date.now()<deadline){
    try{
      const {data}=await request('/health');
      if(data.ok)return data;
    }catch{}
    await sleep(150);
  }
  throw new Error('P2 QA bridge health timeout');
}
function start(savePath){
  const child=spawn(process.execPath,[SERVER,String(PORT)],{
    env:{
      ...process.env,
      TUTIEN_GODOT_BRIDGE_SAVE:savePath,
      TUTIEN_GODOT_BRIDGE_DIAGNOSTIC:'1',
      TUTIEN_GODOT_QA:'1',
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

const temp=await mkdtemp(join(tmpdir(),'tutien-godot-p2-qa-'));
const savePath=join(temp,'qa-save.json');
let proc;
try{
  proc=start(savePath);
  const health=await waitHealth();
  assert(health.bridgeVersion==='godot-bridge.v2','QA bridge version mismatch');
  assert(health.qaMode===true,'QA bridge must expose qaMode=true');
  assert(health.diagnosticMode===true,'QA bridge must expose diagnosticMode=true');

  await request('/new',{method:'POST',body:{seed:161094}});

  let previousTick=0;
  for(const multiplier of [2,3,4]){
    const {data}=await request('/action',{
      method:'POST',
      body:{action:'diagnosticFixture',fixture:`ling${multiplier}`},
    });
    const home=data.home;
    assert(home?.diagnostic?.qa===true,'Ling Quang fixture missing QA marker');
    assert(home?.diagnostic?.fixture===`ling${multiplier}`,'Ling Quang fixture id mismatch');
    assert(Number(home?.cultivation?.reincarnationR3?.lastLingGuangMultiplier)===multiplier,`Expected Ling Quang x${multiplier}`);
    const tick=Number(home?.cultivation?.reincarnationR3?.lastLingGuangTick)||0;
    assert(tick>previousTick,'Ling Quang fixture tick must increase deterministically');
    previousTick=tick;
  }

  const ascendFixture=(await request('/action',{
    method:'POST',
    body:{action:'diagnosticFixture',fixture:'ascend'},
  })).data;
  assert(ascendFixture.home?.cultivation?.ready===true,'Ascend fixture must be ready');
  assert(ascendFixture.home?.cultivation?.transition==='ascend','Ascend fixture must use canonical ascend transition');
  const ascended=(await request('/action',{method:'POST',body:{action:'ascendRealmV140'}})).data;
  assert(Number(ascended.home?.life?.realmOrder)>=1,'Canonical ascend action did not advance realm');

  const inventoryFixture=(await request('/action',{
    method:'POST',
    body:{action:'diagnosticFixture',fixture:'inventory'},
  })).data;
  assert(inventoryFixture.result?.canonical===true,'Inventory fixture must report canonical=true');
  assert(Number(inventoryFixture.result?.itemCount)>=7,`Inventory fixture seed produced ${inventoryFixture.result?.itemCount??0} canonical items`);
  assert(Number(inventoryFixture.result?.rank0FragmentBalance)>=0,'Rank-0 fragment wallet missing after canonical seed');
  assert(Number(inventoryFixture.result?.attireSetFragmentBalance)===0,'Retired attire Set fragments must not be minted');
  assert(Number(inventoryFixture.result?.jewelrySetFragmentBalance)===0,'Retired jewelry Set fragments must not be minted');
  const character=(await request('/character')).data;
  const items=Array.isArray(character?.equipmentInventory)?character.equipmentInventory:[];
  assert(items.length>=7,`Expected >=7 canonical QA items, got ${items.length}`);
  assert(items.some(item=>item?.isV142===true||item?.schema==='equipment.v142'),'QA inventory must contain V142 items');
  assert(items.every(item=>!item?.setId),'Fresh canonical QA inventory must not revive retired Sets');
  const retiredEngrave=(await request('/action',{method:'POST',body:{action:'engraveEquipmentSetV142',itemId:items[0].id,setId:'set.v142.attire.metal'}})).data;
  assert(retiredEngrave.result?.ok===false&&JSON.stringify(retiredEngrave.result).includes('retire'),'Canonical retired engraving must be rejected');

  const tribulationFixture=(await request('/action',{
    method:'POST',
    body:{action:'diagnosticFixture',fixture:'tribulation'},
  })).data;
  assert(Number(tribulationFixture.home?.life?.realmOrder)===41,'Tribulation fixture must land on canonical order 41 gate');
  assert(tribulationFixture.home?.cultivation?.ready===true,'Tribulation fixture must fill Tu Vi');
  assert(tribulationFixture.home?.cultivation?.transition==='tribulation','Tribulation fixture must expose canonical transition');
  assert(tribulationFixture.home?.diagnostic?.previewOnly===true,'Tribulation fixture must declare previewOnly');
  assert(Number(tribulationFixture.result?.greatVehicleClearedFloor)===0,`QA fixture unexpectedly pre-cleared Vạn Đạo Thiên Mạc: floor ${tribulationFixture.result?.greatVehicleClearedFloor}`);
  assert(Array.isArray(tribulationFixture.result?.milestoneBlockers)&&tribulationFixture.result.milestoneBlockers.length>0,`QA fixture expected canonical milestone blockers, got ${JSON.stringify(tribulationFixture.result?.milestoneBlockers)}`);
  assert(String(tribulationFixture.result.milestoneBlockers[0]||'').includes('Vạn Đạo Thiên Mạc'),'Expected Vạn Đạo Thiên Mạc blocker before action');

  const blocked=await request('/action',{method:'POST',body:{action:'tribulationV140'}});
  assert(blocked.response.ok===true,'Bridge transport must stay successful for handled gameplay rejection');
  assert(blocked.data?.ok===true,'Bridge envelope must stay ok for handled gameplay rejection');
  assert(blocked.data?.result?.ok===false,`Tribulation action must be rejected by canonical gameplay; result=${JSON.stringify(blocked.data?.result)}`);
  const blockedSummary=Array.isArray(blocked.data?.result?.summaryLines)?blocked.data.result.summaryLines.join(' · '):'';
  assert(blockedSummary.includes('Vạn Đạo Thiên Mạc'),`Expected canonical Great Vehicle milestone blocker, got ${blockedSummary}`);

  const cleared=(await request('/action',{
    method:'POST',
    body:{action:'diagnosticFixture',fixture:'clear'},
  })).data;
  assert(!cleared.home?.diagnostic,'Clear fixture must remove QA DTO overlay');

  console.log('GODOT P2 QA FIXTURE SMOKE: PASS');
  console.log('Fixtures: inventory · Ling Quang x2/x3/x4 · ascend · tribulation preview');
  console.log(`Canonical QA inventory items: ${items.length}`);
  console.log('Tribulation blocker preserved: Vạn Đạo Thiên Mạc tầng 5');
}catch(error){
  console.error('GODOT P2 QA FIXTURE SMOKE: FAIL');
  console.error(error?.stack||error);
  if(proc?.logs?.())console.error('\n--- bridge logs ---\n'+proc.logs());
  process.exitCode=1;
}finally{
  await stop(proc?.child);
  await rm(temp,{recursive:true,force:true}).catch(()=>{});
}
