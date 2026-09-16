import fs from 'node:fs';

const file='qa/visual/capture-combat-runtime.mjs';
let source=fs.readFileSync(file,'utf8');
const oldMetric="const visible=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>0&&r.width>0&&r.height>0};";
const oldShowcase="const visible=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>0&&r.width>0&&r.height>0};";
const helper="const visible=e=>{if(!e)return false;const r=e.getBoundingClientRect();if(!(r.width>0&&r.height>0))return false;for(let n=e;n&&n.nodeType===1;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity||1)<=0)return false;}return true;};";
if(!source.includes(oldMetric))throw new Error('metrics visibility anchor missing');
if(!source.includes(oldShowcase))throw new Error('showcase visibility anchor missing');
source=source.replace(oldMetric,helper).replace(oldShowcase,helper);
if((source.match(/for\(let n=e;n&&n\.nodeType===1;n=n\.parentElement\)/g)||[]).length!==2)throw new Error('ancestor-aware visibility postcondition failed');
fs.writeFileSync(file,source);
console.log('V180 ancestor-aware Combat visibility guard applied');
