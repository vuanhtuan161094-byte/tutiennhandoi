import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
let pass=0;const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
const ui=fs.readFileSync(path.join(root,'modules/hunt-combat-v2.js'),'utf8');
const runtime=fs.readFileSync(path.join(root,'standalone-runtime.js'),'utf8');
check(runtime.includes("schema:'dev-combat-sandbox.v1'"),'DEV runtime canonical schema is explicitly v1');
check(ui.includes("action({action:'devSandboxPreset',realmOrder:62,dao,forceBoss:true})"),'V5 one-click tour calls RAM-only DEV preset endpoint');
check(ui.includes("action({action:'endlessFight'})"),'V5 one-click tour finishes with real endlessFight action');

globalThis.dispatchEvent=()=>true;
globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};
await import('../../standalone-runtime.js');
async function post(body){const r=await fetch('/api/dev/action',{method:'POST',body:JSON.stringify(body)});const p=await r.json();if(!r.ok||p.ok===false)throw new Error(p.error||`HTTP ${r.status}`);return p;}
for(const dao of ['sword','fist','body','spell','poison','artifact','formation','mind']){
  const p=await post({action:'devSandboxPreset',realmOrder:62,dao,forceBoss:true});
  check(p.result?.schema==='dev-combat-sandbox.v1'&&p.result?.dao===dao&&p.result?.saveSafe===true,`DEV preset ${dao} is RAM-only authoritative sandbox`);
  check(p.snapshot?.endlessHunt?.bossReady===true,`${dao} stages a Boss-ready encounter`);
  check((p.result?.activeSkillIds||[]).length>=2,`${dao} exposes learned active combat skills`);
}
await post({action:'devSandboxPreset',realmOrder:62,dao:'mind',forceBoss:true});
const fight=await post({action:'endlessFight'});
const events=fight.result?.combatEvents||[];
check(events.length>0,'Real backend fight emits replayable combatEvents');
check(events.some(e=>e.type==='castStart'),'Authoritative events include castStart');
check(events.some(e=>e.type==='damage'),'Authoritative events include damage');
console.log(`\n${pass}/${pass} Combat DEV Auto Tour backend V5 checks passed.`);
process.exit(0);
