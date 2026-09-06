globalThis.dispatchEvent=()=>true;globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};
let pass=0;const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
async function json(url,init){const r=await fetch(url,init);const p=await r.json();if(!r.ok||p.ok===false)throw new Error(`${url}: ${p.error||r.status}`);return p}async function post(url,b){return json(url,{method:'POST',body:JSON.stringify(b)})}
try{
 await import('../../standalone-runtime.js');
 const health=await json('/api/health');check(health.version==='1.40.0-alpha.24.0','V140 current runtime boots with compatibility contract');
 const dev=await post('/api/dev/action',{action:'devSandboxPreset',realmOrder:18,dao:'sword',forceBoss:true});
 const h=dev.snapshot.endlessHunt;check(h?.productionV110?.schema==='hunt-production.v110','V110 /api state transports Boss production DTO to browser client');
 check(h.productionV110.boss.ready===true&&h.productionV110.boss.mechanic?.counters?.length===2,'V110 transport exposes live Boss counter plan on DEV forced Boss');
 check(typeof h.productionV110.boss.readiness?.label==='string','V110 transport exposes readable Boss readiness label');
 const state=await json('/api/state');check(state.snapshot.endlessHunt.productionV110.schema==='hunt-production.v110','V110 repeated /api/state preserves production DTO without special endpoint');
 check(state.snapshot.endlessHunt.productionV110.farm.rule.includes('Tu Luyện')||state.snapshot.endlessHunt.productionV110.farm.rule.includes('Boss thật'),'V110 transport explains Boss-open / virtual-farm loop');
 console.log(`\n${pass}/${pass} V110 Hunt standalone transport checks passed.`);process.exit(0);
}catch(e){console.error(e?.stack||e);process.exit(1)}
