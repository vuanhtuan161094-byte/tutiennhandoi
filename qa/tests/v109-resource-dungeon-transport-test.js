globalThis.dispatchEvent=()=>true;globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};
let pass=0;const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
async function raw(url,body){const response=await fetch(url,{method:'POST',body:JSON.stringify(body)});let payload={};try{payload=await response.json()}catch{}return {response,payload};}
async function json(url,init){const response=await fetch(url,init);const payload=await response.json();if(!response.ok||payload.ok===false)throw new Error(`${url}: ${payload.error||response.status}`);return payload;}
async function post(url,body){return json(url,{method:'POST',body:JSON.stringify(body)});}
try{
 await import('../../standalone-runtime.js');const health=await json('/api/health');check(health.version==='1.40.0-alpha.24.0','V109 compatibility runs on V140 current runtime');
 const dev=await post('/api/dev/action',{action:'devSandboxPreset',realmOrder:18,dao:'sword',forceBoss:false});
 const save=dev.save;save.game.state.dungeons.highestClearedFloor['dungeon.v12329.manual']=1;save.game.state.collectionV12316.genericFragments.manual=0;
 const loaded=await post('/api/load',{save});const d=loaded.snapshot.dungeons.find(x=>x.id==='dungeon.v12329.manual');check(d?.resourcePve?.v109?.farmMode==='time-based-dungeon','V109 transport snapshot exposes canonical time-based resource farm');
 const before=loaded.save.game.state.collectionV12316.genericFragments.manual;
 const farm=await post('/api/action',{action:'perform',command:{type:'activity',request:{type:'dungeon',dungeonId:'dungeon.v12329.manual',floor:1,durationYears:10}}});
 const after=farm.save.game.state.collectionV12316.genericFragments.manual;check(after>before,'V109 /api/action perform dungeon grants real strengthening material after first-clear');
 check(Number(farm.result?.changedWorldYears||farm.result?.data?.elapsedYears||0)===10,'V109 resource farming advances the requested world-time duration');
 const old26=await raw('/api/action',{action:'collectionDailyV12326',dungeonId:'daily.v2326.manual'});check(!old26.response.ok||old26.payload.ok===false,'V109 transport rejects legacy V12326 daily reward write');
 const old25=await raw('/api/action',{action:'collectionDailyV12325',dungeonId:'daily.heart'});check(!old25.response.ok||old25.payload.ok===false,'V109 transport rejects legacy V12325 daily reward write');
 const old16=await raw('/api/action',{action:'collectionDailyV12316',dungeonId:'daily.all'});check(!old16.response.ok||old16.payload.ok===false,'V109 transport rejects legacy V12316 daily reward write');
 const state=await json('/api/state');check(state.snapshot.collectionEconomy?.v109?.dailyWorkshopWritesRetired===true,'V109 production snapshot declares daily workshop writes retired');
 console.log(`\n${pass}/${pass} V109 resource dungeon standalone transport checks passed.`);process.exit(0);
}catch(e){console.error(e?.stack||e);process.exit(1)}
