globalThis.dispatchEvent=()=>true;
globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};
let passed=0;
const check=(ok,label)=>{if(!ok)throw new Error(`FAIL: ${label}`);passed++;console.log(`✓ ${label}`)};
async function json(url,init){const response=await fetch(url,init);const payload=await response.json();if(!response.ok||payload.ok===false)throw new Error(`${url}: ${payload.error||response.status}`);return payload;}
async function post(url,body){return json(url,{method:'POST',body:JSON.stringify(body)});}
async function perform(command){return post('/api/action',{action:'perform',command});}
try{
  await import('../../standalone-runtime.js');
  const health=await json('/api/health');
  check(health.version==='1.40.0-alpha.24.0','V98 compatibility runs on V140 current runtime');

  const dev=await post('/api/dev/action',{action:'devSandboxPreset',realmOrder:26,dao:'sword',forceBoss:false});
  const state=dev.save?.game?.state;
  check(Boolean(state),'DEV Hóa Thần fixture generated through standalone transport');
  state.dungeons.parallelWorkerCapacity=Math.max(2,Number(state.dungeons.parallelWorkerCapacity)||0);
  state.inventory['resource.soul_dew']=100;
  state.inventory['resource.soul_essence']=50;
  state.inventory['resource.spirit_stone']=1000;
  const dungeonId=state.dungeons.unlockedDungeonIds[0];
  state.dungeons.highestClearedFloor[dungeonId]=1;
  const loaded=await post('/api/load',{save:dev.save});
  const snap0=loaded.snapshot;
  check(['locations','journal','worldHistory','personalPower','soul','faction','social','dao'].every(k=>snap0[k]!=null),'V95-V98 DTOs are present in production standalone snapshot');

  const current=snap0.locations.find(x=>x.current);
  const target=snap0.locations.find(x=>!x.current&&current?.neighbors?.includes(x.name));
  check(Boolean(target),'V95 standalone snapshot exposes a real travel neighbor');
  const travel=await perform({type:'activity',request:{type:'explore',targetLocationId:target.id,durationYears:0.1,stopOnMajorEvent:true}});
  check(travel.snapshot.locations.some(x=>x.id===target.id&&x.current&&x.known),'V95 travel mutates and rehydrates through /api/action perform');

  const dewBefore=travel.save.game.state.inventory['resource.soul_dew'];
  const nourished=await perform({type:'nourishSoul',batches:1});
  check(nourished.save.game.state.inventory['resource.soul_dew']===dewBefore-4,'V96 nourishSoul consumes canonical resource through standalone transport');
  const purpose=nourished.snapshot.soul.assignableTargets?.[0]?.purpose??'general';
  const created=await perform({type:'createSoulClone',specialization:purpose});
  const clone=created.snapshot.soul.clones?.[0];
  check(Boolean(clone)&&created.save.game.state.dungeons.workers.some(x=>x.id===clone.id&&x.kind==='avatar'),'V96 createSoulClone creates real avatar worker through transport');
  const assignTarget=created.snapshot.soul.assignableTargets?.[0];
  check(Boolean(assignTarget),'V96 standalone exposes a first-cleared clone assignment target');
  const assigned=await perform({type:'assignSoulClone',cloneId:clone.id,dungeonId:assignTarget.dungeonId,floor:assignTarget.floor});
  check(assigned.snapshot.soul.clones.find(x=>x.id===clone.id)?.assignment?.dungeonId===assignTarget.dungeonId,'V96 clone assignment persists through transport snapshot');

  const founded=await perform({type:'foundFaction',name:'V98 Transport Tiên Môn',doctrineTags:['TransportQA']});
  check(founded.snapshot.faction.membership?.rank==='leader','V97 founding a sect works through standalone transport');
  const funded=await perform({type:'factionContribute',resourceId:'resource.spirit_stone',quantity:400});
  const spiritBefore=funded.snapshot.faction.factions.find(x=>x.current)?.facilities?.spiritVein;
  const upgraded=await perform({type:'factionUpgradeFacility',facilityId:'spiritVein'});
  check(upgraded.snapshot.faction.factions.find(x=>x.current)?.facilities?.spiritVein===spiritBefore+1,'V97 treasury-funded facility upgrade works through transport');

  const daoBefore=Number(upgraded.snapshot.dao?.selected?.depth??0);
  const contemplated=await perform({type:'contemplateDao',daoId:'dao.sword',years:1});
  check(Number(contemplated.snapshot.dao?.selected?.depth??0)>daoBefore,'V98 contemplation advances canonical Dao Ý through transport');
  const wrong=await perform({type:'contemplateDao',daoId:'dao.fist',years:1});
  check(wrong.result?.ok===false&&String(wrong.result?.summaryLines?.[0]??'').includes('không thể chọn một Chủ Đạo thứ hai'),'V98 standalone rejects a second Hóa Thần main Dao');

  console.log(`\n${passed}/${passed} V98 player-facing standalone transport checks passed.`);
  process.exit(0);
}catch(error){console.error(error?.stack||error);process.exit(1);}
