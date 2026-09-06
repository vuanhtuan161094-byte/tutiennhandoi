import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
let pass=0;const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
const ui=fs.readFileSync(path.join(root,'modules/hunt-combat-v2.js'),'utf8');
check(ui.includes("action({action:'devSandboxPreset',realmOrder:62,dao,forceBoss:true})"),'Auto tour calls RAM-only DEV preset endpoint');
check(ui.includes("action({action:'endlessFight'})"),'Auto tour calls real endlessFight backend action');
check(ui.includes("document.querySelector('[data-dev-replay-fight]')"),'Auto tour triggers the mounted authoritative replay path');

globalThis.dispatchEvent=()=>true;
globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};
await import('../../standalone-runtime.js');
async function post(body){const r=await fetch('/api/dev/action',{method:'POST',body:JSON.stringify(body)});const p=await r.json();if(!r.ok||p.ok===false)throw new Error(p.error||`HTTP ${r.status}`);return p;}
for(const dao of ['sword','fist','body','spell','poison','artifact','formation','mind']){
  const p=await post({action:'devSandboxPreset',realmOrder:62,dao,forceBoss:true});
  check(p.result?.schema==='dev-combat-sandbox.v1'&&p.result?.dao===dao,`DEV preset ${dao} is backend-authoritative RAM sandbox`);
  check(p.snapshot?.endlessHunt?.bossReady===true,`${dao} has staged Boss ready for Auto Tour`);
  check((p.result?.activeSkillIds||[]).length>=2,`${dao} exposes learned combat skills`);
}
await post({action:'devSandboxPreset',realmOrder:62,dao:'mind',forceBoss:true});
const fight=await post({action:'endlessFight'});
const events=fight.result?.combatEvents||[];
check(events.length>0,'Real backend fight emits combatEvents for final tour segment');
check(events.some(e=>e.type==='castStart'),'Real backend replay contains castStart');
check(events.some(e=>e.type==='damage'),'Real backend replay contains damage events');
console.log(`\n${pass}/${pass} Combat DEV Auto Tour backend V4 checks passed.`);
process.exit(0);
