globalThis.dispatchEvent=()=>true;
globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};
let pass=0;
const check=(v,m)=>{if(!v)throw new Error(`FAIL: ${m}`);pass++;console.log(`✓ ${m}`)};
async function json(url,init){const r=await fetch(url,init);const p=await r.json();if(!r.ok||p.ok===false)throw new Error(`${url}: ${p.error||r.status}`);return p}
async function post(url,b){return json(url,{method:'POST',body:JSON.stringify(b)})}
try{
  await import('../../standalone-runtime.js');
  const health=await json('/api/health');
  check(health.version==='1.40.0-alpha.24.0','V127 standalone/Android runtime exposes release .23.78');
  let state=await json('/api/state');
  let manual=state.snapshot.collectionEconomy?.categories?.find(x=>x.category==='manual');
  check(manual?.items?.length===261,'standalone/Android transport exposes all 261 V127 manuals');
  const groups=new Map();for(const x of manual.items)groups.set(x.realmStageIndex,(groups.get(x.realmStageIndex)||0)+1);
  check(groups.size===29&&[...groups.values()].every(n=>n===9),'transport preserves 29 realms × 9 manuals');
  check(manual.items.filter(x=>x.unlocked).length===9,'new Phàm life exposes only the 9 currently unlocked manuals');
  const first=manual.items.find(x=>x.id==='manual.1');
  check(first?.maxLevel===1000&&first?.maxAdvance===10&&first?.manualGate?.nextMilestone===100&&first?.effectiveStats?.length>0,'transport exposes Lv1000/10 milestone gates, current gate cost and effective stats');
  const before=Number(first.progress?.level||1);
  await post('/api/action',{action:'collectionStrengthenV12325',itemId:'manual.1',levels:1});
  state=await json('/api/state');manual=state.snapshot.collectionEconomy?.categories?.find(x=>x.category==='manual');
  const after=Number(manual.items.find(x=>x.id==='manual.1')?.progress?.level||0);
  check(after===before+1,'standalone action upgrades the real V127 manual progression');
  let blocked=false;try{await post('/api/action',{action:'collectionComposeV12326',itemId:'manual.10'})}catch(e){blocked=/mở ở/i.test(String(e.message))}
  check(blocked,'standalone compose blocks future-realm manuals before fragment validation');
  console.log(`\nV127 MANUAL STANDALONE/ANDROID TRANSPORT: ${pass}/${pass} PASS`);process.exit(0);
}catch(e){console.error(e?.stack||e);process.exit(1)}
