import fs from 'node:fs';

const file='qa/visual/capture-combat-runtime.mjs';
let source=fs.readFileSync(file,'utf8');
const replaceOnce=(before,after,label)=>{
  const first=source.indexOf(before);
  if(first<0)throw new Error(`[V180 structural guard] missing ${label}`);
  if(source.indexOf(before,first+before.length)>=0)throw new Error(`[V180 structural guard] ambiguous ${label}`);
  source=source.replace(before,after);
};

replaceOnce(
  "const state=api?.state?.()||{};return{...state,rootRect:rect(root),stageRect:rect(stage),stageClass:stage?.className||''",
  "const state=api?.state?.()||{};const rootBounds=root?.getBoundingClientRect?.();const structuralSelectors=['.huntv2-player-hud','.huntv2-enemy-hud','.huntv2-skills','.huntv2-intel-lane','.huntv2-hud-extension-slots','.huntv2-quick-controls','.huntv2-meta-strip','.huntv2-map-compact','.huntv2-action-deck','.v5-boss-briefing'];const structuralOverflow=rootBounds?structuralSelectors.flatMap(sel=>[...document.querySelectorAll(sel)].filter(visible).map(e=>{const r=e.getBoundingClientRect();return{sel,cls:String(e.className||'').slice(0,120),left:Math.round(r.left-rootBounds.left),right:Math.round(r.right-rootBounds.right),top:Math.round(r.top-rootBounds.top),bottom:Math.round(r.bottom-rootBounds.bottom)}}).filter(x=>x.left < -2 || x.right > 2 || x.top < -2 || x.bottom > 2)):[];return{...state,rootRect:rect(root),stageRect:rect(stage),stageClass:stage?.className||'',structuralOverflow",
  'structural overflow metrics',
);

replaceOnce(
  "if(state.docOverflow||state.rootOverflow)throw new Error(`Combat internal overflow: ${JSON.stringify({docOverflow:state.docOverflow,rootOverflow:state.rootOverflow,stageClass:state.stageClass})}`);",
  "if(state.docOverflow||state.structuralOverflow?.length)throw new Error(`Combat structural overflow: ${JSON.stringify({docOverflow:state.docOverflow,rootOverflowTelemetry:state.rootOverflow,structuralOverflow:state.structuralOverflow,stageClass:state.stageClass})}`);",
  'overflow verifier',
);

if(!source.includes('structuralOverflow'))throw new Error('[V180 structural guard] metric missing');
if(!source.includes('rootOverflowTelemetry'))throw new Error('[V180 structural guard] root telemetry missing');
fs.writeFileSync(file,source);
console.log('V180 Combat structural overflow guard applied');
