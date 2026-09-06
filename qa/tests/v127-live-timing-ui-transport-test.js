import fs from 'node:fs';
let now=1_800_000_000_000;
Date.now=()=>now;
if(typeof globalThis.CustomEvent==='undefined')globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};
if(typeof globalThis.dispatchEvent!=='function')globalThis.dispatchEvent=()=>true;
await import(new URL('../../standalone-runtime.js?timingtest=127',import.meta.url));
async function json(url,init){const r=await fetch(url,init);const j=await r.json();if(!r.ok||(j?.ok===false&&j?.error))throw new Error(`${url}: ${j.error||r.status}`);return j}
function assert(ok,msg){if(!ok)throw new Error(msg)}
const fresh=await json('/api/new',{method:'POST',body:JSON.stringify({seed:127})});
const e0=Number(fresh.realtime.tuVi);
now+=14_000; let st=await json('/api/state');
assert(Number(st.realtime.tuVi)===e0,`Tu Vi commit trước 15s: ${st.realtime.tuVi} vs ${e0}`);
assert(Math.abs(Number(st.realtime.carryRealSeconds)-14)<1e-6,`Carry không phải 14s: ${st.realtime.carryRealSeconds}`);
const live14=await json('/api/live'); assert(Number(live14.realtime.tuVi)===e0,'UI live đang dự phóng Tu Vi giả trước commit');
now+=1_000; st=await json('/api/state'); const e15=Number(st.realtime.tuVi),gain=Number(st.realtime.lastCommittedCultivationGain);
assert(e15>e0,'Không commit ở giây 15'); assert(Number.isInteger(gain),'Gain commit không phải số nguyên'); assert(Number.isInteger(e15),'Save Tu Vi sau live commit vẫn có phần lẻ');
const tickBefore=Number(st.realtime.tickCount); now+=30_000; st=await json('/api/state'); assert(Number(st.realtime.tickCount)-tickBefore===2,'30s không được ghi đúng 2 commit');
now+=7_000; st=await json('/api/state'); assert(Math.abs(Number(st.realtime.carryRealSeconds)-7)<1e-6,'Không giữ đúng timing carry 7s'); const save=st.save;
const loaded=await json('/api/load',{method:'POST',body:JSON.stringify({save})}); const after=Number(loaded.snapshot.overview.cultivation.tuVi); const loaded2=await json('/api/load',{method:'POST',body:JSON.stringify({save})}); assert(Number(loaded2.snapshot.overview.cultivation.tuVi)===after,'Reload cùng save nhân đôi carry/offline reward');
const app=fs.readFileSync(new URL('../../app.js',import.meta.url),'utf8');
for(const required of ['manualGachaRealmV127','manualGachaOrientationV127','daoSuyTribulationV127','setSoulCloneProtectorV127','v127ManualUpgradeControls','/15 giây'])assert(app.includes(required),`UI/transport thiếu hook ${required}`);
for(const stale of ['Ngộ Cảnh','Tu Vi/phút','×1.12','×0.94'])assert(!app.includes(stale),`UI còn text legacy: ${stale}`);
console.log('V127 LIVE TIMING + UI TRANSPORT — PASS');
console.log(JSON.stringify({commitSeconds:st.realtime.commitSeconds,e0,e15,gain,saveReloadIdempotent:true,uiCommittedOnly:true},null,2));
process.exit(0);
