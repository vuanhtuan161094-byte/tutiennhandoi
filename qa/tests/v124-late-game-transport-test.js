globalThis.dispatchEvent=()=>true;globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};
let pass=0;const check=(v,m)=>{if(!v)throw new Error(`FAIL: ${m}`);pass++;console.log(`✓ ${m}`)};
async function json(url,init){const r=await fetch(url,init);const p=await r.json();if(!r.ok||p.ok===false)throw new Error(`${url}: ${p.error||r.status}`);return p}async function post(url,b){return json(url,{method:'POST',body:JSON.stringify(b)})}
try{
  await import('../../standalone-runtime.js');
  const health=await json('/api/health');check(health.version==='1.40.0-alpha.24.0','V140 runtime version is transported correctly');
  const dev=await post('/api/dev/action',{action:'devSandboxPreset',realmOrder:46,dao:'sword',forceBoss:false});
  const loaded=await post('/api/load',{save:dev.save});const xp=loaded.snapshot.playerExperience;
  check(xp?.revision==='alpha.23.75','V124 player-experience revision is transported through the universal runtime');
  check(xp?.v114?.schema==='immortal-progression.v114'&&xp.v114.active,'V124 transports the Immortal+ progression closure read-model');
  check(xp?.v115?.schema==='build-progression.v115','V124 transports long-term build progression guidance');
  check(xp?.v116?.schema==='late-game-economy.v140'&&!xp?.v116?.catalyst,'V124 transports V140 late-game economy guidance without realm catalyst');
  check(xp?.v117?.schema==='content-loop.v117'&&Array.isArray(xp.v117.rules)&&xp.v117.rules.some(x=>x.includes('Không giới hạn lượt đánh')),'V124 transports uncapped active/semi-idle/idle content-loop rules');
  check(xp?.v118?.engine==='CombatKernel V3','V124 transports PvE readiness on the canonical combat engine');
  check(xp?.v119?.engine==='CombatKernel V3'&&xp.v119.rules?.unlimitedMatches===true,'V124 transports PvP production rules without a parallel resolver or match cap');
  check(xp?.progression?.productionVerifiedThroughRealmOrder===117&&xp.progression?.immortalPlusProvisional===false,'V124 marks the authored progression path through Sáng Thế Chủ as production-verified');
  console.log(`\nV124 LATE-GAME STANDALONE/ANDROID TRANSPORT: ${pass}/${pass} PASS`);process.exit(0);
}catch(e){console.error(e?.stack||e);process.exit(1)}
