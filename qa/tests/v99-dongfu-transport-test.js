globalThis.dispatchEvent=()=>true;
globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};
let passed=0;const check=(ok,label)=>{if(!ok)throw new Error(`FAIL: ${label}`);passed++;console.log(`✓ ${label}`)};
async function json(url,init){const response=await fetch(url,init);const payload=await response.json();if(!response.ok||payload.ok===false)throw new Error(`${url}: ${payload.error||response.status}`);return payload;}
async function post(url,body){return json(url,{method:'POST',body:JSON.stringify(body)});}
try{
  await import('../../standalone-runtime.js');
  const health=await json('/api/health');
  check(health.version==='1.40.0-alpha.24.0','V99 compatibility runs on V140 current runtime');
  const dev=await post('/api/dev/action',{action:'devSandboxPreset',realmOrder:10,dao:'sword',forceBoss:false});
  const baseline=structuredClone(dev.save);const state=baseline.game.state;
  state.inventory['resource.spirit_stone']=100000;state.collectionV12316.currencies.boundImmortalJade=100000;state.collectionV12316.genericFragments.manual=10000;
  const manual=state.collectionV12316.items['manual.1']??(state.collectionV12316.items['manual.1']={owned:true,level:1,advance:0,specificFragments:0});manual.owned=true;manual.level=90;
  const script=state.collectionV12316.cave.facilities.find(x=>x.id==='scripture');script.level=1;
  let loaded=await post('/api/load',{save:structuredClone(baseline)});
  check(loaded.snapshot.dongfu?.schema==='dongfu.v99'&&loaded.snapshot.dongfu.facilities.length===8,'V99 transport snapshot exposes canonical 8-building DongFu');
  const beforeSS=loaded.save.game.state.inventory['resource.spirit_stone'],beforeJade=loaded.save.game.state.collectionV12316.currencies.boundImmortalJade;
  const upgraded=await post('/api/action',{action:'caveUpgradeV12316',facilityId:'scripture'});
  check(upgraded.save.game.state.collectionV12316.cave.facilities.find(x=>x.id==='scripture').level===2,'V99 /api/action upgrades DongFu facility');
  check(upgraded.save.game.state.inventory['resource.spirit_stone']<beforeSS&&upgraded.save.game.state.collectionV12316.currencies.boundImmortalJade<beforeJade,'V99 transport upgrade spends both canonical currencies');
  await post('/api/load',{save:structuredClone(baseline)});
  const lv1=await post('/api/action',{action:'collectionStrengthenV12316',itemId:'manual.1',levels:1});
  const high=structuredClone(baseline);high.game.state.collectionV12316.cave.facilities.find(x=>x.id==='scripture').level=10;
  await post('/api/load',{save:high});
  const lv10=await post('/api/action',{action:'collectionStrengthenV12316',itemId:'manual.1',levels:1});
  check(Number(lv10.result?.cost)<Number(lv1.result?.cost),'V99 Tàng Kinh Các discount reaches actual standalone strengthening route');
  check(lv10.snapshot.dongfu.facilities.find(x=>x.id==='scripture')?.effect?.materialDiscountPct===18,'V99 standalone snapshot rehydrates Lv10 facility effect');
  console.log(`\n${passed}/${passed} V99 DongFu standalone transport checks passed.`);process.exit(0);
}catch(error){console.error(error?.stack||error);process.exit(1);}
