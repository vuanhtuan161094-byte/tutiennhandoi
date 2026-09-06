globalThis.dispatchEvent=()=>true;globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};
let pass=0;const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
async function json(url,init){const response=await fetch(url,init);const payload=await response.json();if(!response.ok)throw new Error(`${url}: ${payload.error||response.status}`);return payload;}
async function post(url,body){return json(url,{method:'POST',body:JSON.stringify(body)});}
try{
 await import('../../standalone-runtime.js');
 const first=await json('/api/state');
 check(first.snapshot.equipmentSystem?.schema==='equipment-system.v106','V106 equipment production DTO survives standalone snapshot transport');
 check(first.snapshot.equipmentSystem?.capabilities?.daoInscription===true&&first.snapshot.equipmentSystem?.capabilities?.daoInscriptionRuntimeLive===true,'V128 standalone snapshot advertises authored live Dao Inscription capability');
 const blocked=await post('/api/action',{action:'perform',command:{type:'engraveDaoInscriptionV115',itemId:'fake',inscriptionId:'fake.dao'}});
 check(blocked.result?.ok===false,'V128 standalone perform rejects invalid Dao Inscription write without transport failure');
 const dev=await post('/api/dev/action',{action:'devCollectionGrantV12326'});
 const save=structuredClone(dev.save);save.game.state.realm.maxRealmOrder=22;
 const loaded=await post('/api/load',{save});
 check(loaded.snapshot.collectionEconomy?.v107?.schema==='artifact-production.v107','V107 artifact production DTO survives standalone snapshot transport');
 const arts=loaded.snapshot.collectionEconomy.categories.find(x=>x.category==='artifact').items.filter(x=>x.progress?.owned).slice(0,3),rels=loaded.snapshot.collectionEconomy.categories.find(x=>x.category==='relic').items.filter(x=>x.progress?.owned).slice(0,2);
 check(arts.length===3&&rels.length===2,'V107 transport fixture owns canonical Pháp Bảo/Chí Bảo assets');
 await post('/api/action',{action:'collectionEquipV12325',itemId:arts[0].id,slotIndex:0});
 await post('/api/action',{action:'collectionEquipV12325',itemId:arts[1].id,slotIndex:1});
 let equipped=await post('/api/action',{action:'collectionEquipV12325',itemId:rels[0].id});
 check(JSON.stringify(equipped.snapshot.collectionEconomy.artifactV88.activeArtifactIds.slice(0,2))===JSON.stringify([arts[0].id,arts[1].id])&&equipped.snapshot.collectionEconomy.artifactV88.activeRelicId===rels[0].id,'V107 standalone equips 2 canonical V88 artifacts + independent Chí Bảo');
 const saved=await post('/api/action',{action:'perform',command:{type:'saveCombatLoadout',name:'Transport V107'}});
 check(saved.result?.ok===true&&saved.result?.data?.relicId===rels[0].id&&saved.result.data.artifactIds.length===2,'V107 standalone Saved Loadout serializes V88 artifacts + Chí Bảo');
 await post('/api/action',{action:'collectionEquipV12325',itemId:arts[2].id,slotIndex:0});
 await post('/api/action',{action:'collectionEquipV12325',itemId:rels[1].id});
 const restored=await post('/api/action',{action:'perform',command:{type:'applySavedCombatLoadout',idOrName:'Transport V107'}});
 check(restored.result?.ok===true,'V107 standalone applies saved loadout through generic production perform route');
 const root=restored.snapshot.collectionEconomy.artifactV88;
 check(JSON.stringify(root.activeArtifactIds.slice(0,2))===JSON.stringify([arts[0].id,arts[1].id])&&root.activeRelicId===rels[0].id,'V107 standalone rehydrates exact V88 artifacts + Chí Bảo after loadout restore');
 check(restored.snapshot.build?.schema==='build-sheet.v1'&&restored.snapshot.build?.v107?.schema==='build-sheet.v107'&&restored.snapshot.build?.relic?.id===rels[0].id,'V107 transported Build Sheet reads canonical artifact/relic state');
 console.log(`\n${pass}/${pass} V106/V107 standalone transport checks passed.`);process.exit(0);
}catch(e){console.error(e?.stack||e);process.exit(1)}
