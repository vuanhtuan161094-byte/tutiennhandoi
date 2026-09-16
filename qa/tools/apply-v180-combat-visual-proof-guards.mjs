import fs from 'node:fs';

const file='qa/visual/capture-combat-runtime.mjs';
let source=fs.readFileSync(file,'utf8');
const replaceOnce=(before,after,label)=>{
  const first=source.indexOf(before);
  if(first<0)throw new Error(`[V180 visual guards] missing ${label}`);
  if(source.indexOf(before,first+before.length)>=0)throw new Error(`[V180 visual guards] ambiguous ${label}`);
  source=source.replace(before,after);
};

replaceOnce(
  "const api=globalThis.__TUTIEN_COMBAT_SHOWCASE__;const root=document.querySelector('.huntv2-screen');const stage=document.querySelector('#huntV2Stage');",
  "const api=globalThis.__TUTIEN_COMBAT_SHOWCASE__;const root=document.querySelector('.huntv2-screen');const visible=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>0&&r.width>0&&r.height>0};const stage=document.querySelector('#huntV2Stage');",
  'showcase visible helper',
);

replaceOnce(
  "rootOverflow:root?root.scrollWidth>root.clientWidth+1:false,docOverflow:document.documentElement.scrollWidth>innerWidth+1};})()`);",
  "rootOverflow:root?root.scrollWidth>root.clientWidth+1:false,docOverflow:document.documentElement.scrollWidth>innerWidth+1,activeCombat:root?.classList.contains('is-active-combat')||false,preFightVisible:visible(document.querySelector('.v5-boss-briefing')),actionDeckVisible:visible(document.querySelector('.huntv2-action-deck')),smallText:[...document.querySelectorAll('.huntv2-screen *')].filter(e=>visible(e)&&e.children.length===0&&String(e.textContent||'').trim()).map(e=>({text:String(e.textContent||'').trim().slice(0,48),font:parseFloat(getComputedStyle(e).fontSize)||0,cls:String(e.className||'').slice(0,120)})).filter(x=>x.font>0&&x.font<10).slice(0,80)};})()`);",
  'showcase guard metrics',
);

const callMarker='async function callShowcase(client, expression) {';
const callIndex=source.indexOf(callMarker);
if(callIndex<0)throw new Error('[V180 visual guards] missing callShowcase marker');
const verifier=`async function verifiedShowcaseState(client) {\n  const state=await showcaseState(client);\n  if(state.docOverflow||state.rootOverflow)throw new Error(\`Combat internal overflow: \${JSON.stringify({docOverflow:state.docOverflow,rootOverflow:state.rootOverflow,stageClass:state.stageClass})}\`);\n  if(state.smallText?.length)throw new Error(\`Combat text below 10px: \${JSON.stringify(state.smallText)}\`);\n  if(state.activeCombat&&(state.preFightVisible||state.actionDeckVisible))throw new Error(\`Active Combat leaked pre-fight UI: \${JSON.stringify({preFightVisible:state.preFightVisible,actionDeckVisible:state.actionDeckVisible})}\`);\n  return state;\n}\n`;
source=source.slice(0,callIndex)+verifier+source.slice(callIndex);
const verifierEnd=source.indexOf(callMarker)+callMarker.length;
const head=source.slice(0,verifierEnd);
let tail=source.slice(verifierEnd);
const count=(tail.match(/await showcaseState\(client\)/g)||[]).length;
if(count<8)throw new Error(`[V180 visual guards] expected many showcase reads, got ${count}`);
tail=tail.replaceAll('await showcaseState(client)','await verifiedShowcaseState(client)');
source=head+tail;

if(!source.includes('Combat internal overflow'))throw new Error('[V180 visual guards] overflow guard missing');
if(!source.includes('Combat text below 10px'))throw new Error('[V180 visual guards] legibility guard missing');
if(!source.includes('Active Combat leaked pre-fight UI'))throw new Error('[V180 visual guards] active UI guard missing');
fs.writeFileSync(file,source);
console.log(`V180 Combat visual guards applied · verified reads=${count}`);
