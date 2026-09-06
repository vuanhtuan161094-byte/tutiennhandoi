globalThis.dispatchEvent=()=>true;globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};
let pass=0;const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
async function raw(url,body){const response=await fetch(url,{method:'POST',body:JSON.stringify(body)});let payload={};try{payload=await response.json()}catch{}return {response,payload};}
async function json(url,init){const response=await fetch(url,init);const payload=await response.json();if(!response.ok||payload.ok===false)throw new Error(`${url}: ${payload.error||response.status}`);return payload;}
async function post(url,body){return json(url,{method:'POST',body:JSON.stringify(body)});}
try{
 await import('../../standalone-runtime.js');const health=await json('/api/health');check(health.version==='1.40.0-alpha.24.0','V100 compatibility runs on V140 current runtime');
 const dev=await post('/api/dev/action',{action:'devSandboxPreset',realmOrder:18,dao:'sword',forceBoss:false});const save=dev.save,state=save.game.state;state.collectionV12316.currencies.boundImmortalJade=100000;
 const loaded=await post('/api/load',{save});check(loaded.snapshot.collectionEconomy?.v100?.schema==='van-tuong.v100','V100 standalone snapshot exposes canonical Vạn Tượng contract');
 const old16=await raw('/api/action',{action:'collectionGachaV12316',category:'manual',count:1});check(!old16.response.ok||old16.payload.ok===false,'V100 transport rejects V12316 legacy gacha write');
 const old25=await raw('/api/action',{action:'collectionGachaV12325',bannerId:'banner.myriad',count:1});check(!old25.response.ok||old25.payload.ok===false,'V100 transport rejects V12325 legacy gacha write');
 const before=loaded.save.game.state.collectionV12316.currencies.boundImmortalJade;const roll=await post('/api/action',{action:'collectionGachaV12326',bannerId:'banner.manual',count:10,usePremium:false});
 check(roll.result?.cost===1440&&roll.save.game.state.collectionV12316.currencies.boundImmortalJade===before-1440,'V100 canonical transport 10-pull spends exactly 1440 Bound Jade');
 check(roll.save.game.state.collectionV12316.economyV12326.tracks['banner.manual'].pulls===10,'V100 canonical transport advances only banner.manual V12326 pity track');
 check(roll.save.game.state.collectionV12316.gacha.manual.pulls===0,'V100 canonical transport leaves V12316 legacy pity untouched');
 check(JSON.stringify(roll.result?.economy||{}).includes('gacha.banner.manual'),'V100 transport returns V89 ledger source for canonical banner spend');
 console.log(`\n${pass}/${pass} V100 Vạn Tượng standalone transport checks passed.`);process.exit(0);
}catch(e){console.error(e?.stack||e);process.exit(1)}
