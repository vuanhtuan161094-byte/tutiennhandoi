/* Combat Layout Editor V1 — DEV-only visual geometry tuner.
   It previews position/size with isolated inline presentation overrides and exports JSON.
   It never mutates gameplay authority or the production save payload. */
const STORAGE_KEY='tutien.dev.combat-layout-draft.v1';
const TARGETS=[
  {id:'player',label:'Player',selector:'.huntv2-actor.player'},
  {id:'boss',label:'Boss / Enemy',selector:'.huntv2-actor.enemy'},
  {id:'playerHud',label:'Player HUD',selector:'.huntv2-player-hud'},
  {id:'bossHud',label:'Boss HUD',selector:'.huntv2-enemy-hud'},
  {id:'playerStatus',label:'Player Status',selector:'.huntv2-status-tray.player'},
  {id:'bossStatus',label:'Boss Status',selector:'.huntv2-status-tray.enemy'},
  {id:'supports',label:'Support Row',selector:'.huntv2-hud-extension-slots'},
  {id:'skills',label:'Skill Bar',selector:'.huntv2-skills'},
  {id:'bossBriefing',label:'Boss Briefing',selector:'.v5-boss-briefing'},
  {id:'actionDeck',label:'Action Deck',selector:'.huntv2-action-deck'},
  {id:'quickControls',label:'Quick Controls',selector:'.huntv2-quick-controls'},
  {id:'console',label:'Combat Console',selector:'.huntv2-console'},
];

let root=null,box=null,panel=null,toggle=null,styleNode=null,observer=null,raf=0;
let selectedId='player',savedDraft=null;
const states=new Map();
const originals=new WeakMap();
const round=n=>Math.round(Number(n||0)*10)/10;

function enabled(){
  try{const p=new URLSearchParams(location.search);return (p.get('dev')==='1'||globalThis.__TUTIEN_DEV_FORCE__===true)&&(p.get('tools')==='1'||p.get('devtools')==='1');}catch{return false;}
}
function combatScreen(){return document.querySelector('#content .huntv2-screen, .huntv2-screen');}
function targetMeta(id=selectedId){return TARGETS.find(x=>x.id===id)||TARGETS[0];}
function targetNode(meta=targetMeta()){return combatScreen()?.querySelector(meta.selector)||null;}
function screenRect(){return combatScreen()?.getBoundingClientRect?.()||null;}
function relativeRect(node){
  const sr=screenRect(),r=node?.getBoundingClientRect?.();if(!sr||!r)return null;
  return {x:round(r.left-sr.left),y:round(r.top-sr.top),width:round(r.width),height:round(r.height)};
}
function rememberOriginal(node){
  if(!node||originals.has(node))return;
  originals.set(node,['translate','width','height'].reduce((a,k)=>(a[k]={value:node.style.getPropertyValue(k),priority:node.style.getPropertyPriority(k)},a),{}));
}
function restoreNode(node){
  const old=originals.get(node);if(!old)return;
  for(const [k,v] of Object.entries(old)){if(v.value)node.style.setProperty(k,v.value,v.priority||'');else node.style.removeProperty(k);}
  originals.delete(node);
}
function stateFor(meta=targetMeta()){
  const node=targetNode(meta);if(!node)return null;
  let state=states.get(meta.id);
  if(!state||state.node!==node){
    rememberOriginal(node);
    const rect=relativeRect(node);if(!rect||rect.width<2||rect.height<2)return null;
    const cs=getComputedStyle(node);
    const draft=savedDraft?.elements?.[meta.id]||{};
    state={id:meta.id,node,base:rect,dx:Number(draft.deltaX||0),dy:Number(draft.deltaY||0),width:Number(draft.width||rect.width),height:Number(draft.height||rect.height),anchorX:cs.right!=='auto'&&cs.left==='auto'?'right':'left',anchorY:cs.bottom!=='auto'&&cs.top==='auto'?'bottom':'top'};
    states.set(meta.id,state);applyState(state);
  }
  return state;
}
function applyState(state){
  if(!state?.node?.isConnected)return;
  state.node.style.setProperty('translate',`${round(state.dx)}px ${round(state.dy)}px`,'important');
  state.node.style.setProperty('width',`${Math.max(24,round(state.width))}px`,'important');
  state.node.style.setProperty('height',`${Math.max(20,round(state.height))}px`,'important');
}
function syncAllAvailable(){for(const meta of TARGETS)stateFor(meta);}

function css(){return `
#tutienCombatLayoutToggle{position:fixed;z-index:10120;left:8px;top:8px;padding:7px 10px;border:1px solid #79c9bb;border-radius:9px;background:#071b21;color:#dff9f1;font:800 12px/1 system-ui;box-shadow:0 5px 18px #0008}
#tutienCombatLayoutPanel{position:fixed;z-index:10121;left:8px;top:44px;width:272px;max-height:calc(100vh - 54px);overflow:auto;padding:10px;border:1px solid #5f948e;border-radius:12px;background:#071519f2;color:#e8f5f0;font:12px/1.25 system-ui;box-shadow:0 12px 34px #000b;backdrop-filter:blur(8px)}
#tutienCombatLayoutPanel[hidden]{display:none}#tutienCombatLayoutPanel h3{margin:0 0 8px;font-size:13px;color:#e8d58d}#tutienCombatLayoutPanel .row{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0}#tutienCombatLayoutPanel label{display:grid;gap:3px;color:#9fc2ba}#tutienCombatLayoutPanel select,#tutienCombatLayoutPanel input,#tutienCombatLayoutPanel button,#tutienCombatLayoutPanel textarea{box-sizing:border-box;width:100%;min-height:30px;border:1px solid #385d5a;border-radius:7px;background:#0b2428;color:#eef9f5;font:12px system-ui}#tutienCombatLayoutPanel input{padding:4px 6px}#tutienCombatLayoutPanel button{cursor:pointer;font-weight:750}#tutienCombatLayoutPanel button:hover{border-color:#8fd3c7}#tutienCombatLayoutPanel .wide{grid-column:1/-1}#tutienCombatLayoutPanel .meta{margin:5px 0 8px;padding:6px;border-radius:7px;background:#0a2024;color:#acd1c8;word-break:break-all}#tutienCombatLayoutPanel .hint{color:#86a7a1;font-size:11px}#tutienCombatLayoutPanel textarea{height:92px;padding:6px;resize:vertical;font-family:ui-monospace,monospace;font-size:10px}
#tutienCombatLayoutBox{position:fixed;z-index:10118;pointer-events:none;border:1.5px dashed #f4d36d;box-shadow:0 0 0 1px #0008,0 0 18px #f4d36d33}#tutienCombatLayoutBox[hidden]{display:none}#tutienCombatLayoutBox .move{position:absolute;pointer-events:auto;left:0;right:0;top:-24px;height:22px;padding:4px 7px;background:#d4ae39;color:#071417;border-radius:6px 6px 0 0;font:900 10px/14px system-ui;cursor:move;user-select:none}#tutienCombatLayoutBox .resize{position:absolute;pointer-events:auto;right:-7px;bottom:-7px;width:16px;height:16px;border:2px solid #071417;border-radius:50%;background:#f4d36d;cursor:nwse-resize;touch-action:none}body.tutien-layout-editing *{scroll-behavior:auto!important}
`;}

function mountUi(){
  styleNode=document.createElement('style');styleNode.id='tutienCombatLayoutStyle';styleNode.textContent=css();document.head.appendChild(styleNode);
  toggle=document.createElement('button');toggle.id='tutienCombatLayoutToggle';toggle.type='button';toggle.textContent='HUD Tuner';document.body.appendChild(toggle);
  panel=document.createElement('section');panel.id='tutienCombatLayoutPanel';panel.hidden=true;panel.innerHTML=`<h3>Combat Layout Editor</h3><label>Thành phần<select data-field="target">${TARGETS.map(t=>`<option value="${t.id}">${t.label}</option>`).join('')}</select></label><div class="meta" data-meta>Chưa có Combat screen.</div><div class="row"><label>X<input data-field="x" type="number" step="1"></label><label>Y<input data-field="y" type="number" step="1"></label><label>W<input data-field="width" type="number" step="1" min="24"></label><label>H<input data-field="height" type="number" step="1" min="20"></label></div><div class="row"><button data-action="reset">Reset phần này</button><button data-action="resetAll">Reset tất cả</button><button data-action="save">Lưu draft</button><button data-action="copy">Copy JSON</button><button class="wide" data-action="download">Download JSON</button></div><textarea data-json readonly></textarea><div class="hint">Kéo nhãn vàng để di chuyển · kéo chấm góc phải dưới để resize. Draft chỉ thuộc DEV tools, không ghi vào save game.</div>`;document.body.appendChild(panel);
  box=document.createElement('div');box.id='tutienCombatLayoutBox';box.hidden=true;box.innerHTML='<div class="move">MOVE</div><div class="resize" aria-label="Resize"></div>';document.body.appendChild(box);
  toggle.addEventListener('click',()=>panel.hidden?open():close());
  panel.querySelector('[data-field="target"]').addEventListener('change',e=>select(e.target.value));
  for(const name of ['x','y','width','height'])panel.querySelector(`[data-field="${name}"]`).addEventListener('change',e=>setNumeric(name,Number(e.target.value)));
  panel.querySelector('[data-action="reset"]').addEventListener('click',resetSelected);
  panel.querySelector('[data-action="resetAll"]').addEventListener('click',resetAll);
  panel.querySelector('[data-action="save"]').addEventListener('click',saveDraft);
  panel.querySelector('[data-action="copy"]').addEventListener('click',copyJson);
  panel.querySelector('[data-action="download"]').addEventListener('click',downloadJson);
  bindDrag(box.querySelector('.move'),'move');bindDrag(box.querySelector('.resize'),'resize');
}
function open(){panel.hidden=false;document.body.classList.add('tutien-layout-editing');syncAllAvailable();if(!targetNode())select(TARGETS.find(t=>targetNode(t))?.id||selectedId);syncBox();}
function close(){panel.hidden=true;box.hidden=true;document.body.classList.remove('tutien-layout-editing');}
function select(id){selectedId=id;const sel=panel?.querySelector('[data-field="target"]');if(sel)sel.value=id;stateFor();syncBox();}
function syncBox(){
  if(!panel||panel.hidden)return;
  const meta=targetMeta(),state=stateFor(meta),node=state?.node,rect=node?.getBoundingClientRect?.(),sr=screenRect();
  if(!state||!rect||!sr){box.hidden=true;panel.querySelector('[data-meta]').textContent='Không tìm thấy thành phần này trong trạng thái Combat hiện tại.';return;}
  box.hidden=false;box.style.left=`${rect.left}px`;box.style.top=`${rect.top}px`;box.style.width=`${rect.width}px`;box.style.height=`${rect.height}px`;box.querySelector('.move').textContent=`${meta.label} · ${meta.selector}`;
  const rel=relativeRect(node);panel.querySelector('[data-meta]').textContent=`${meta.selector} · ${state.anchorX}/${state.anchorY} · viewport ${innerWidth}×${innerHeight}`;
  for(const k of ['x','y','width','height'])panel.querySelector(`[data-field="${k}"]`).value=String(Math.round(rel[k]));
  panel.querySelector('[data-json]').value=JSON.stringify(snapshot(),null,2);
}
function setNumeric(name,value){
  if(!Number.isFinite(value))return;const state=stateFor();if(!state)return;const cur=relativeRect(state.node);if(!cur)return;
  if(name==='x')state.dx+=value-cur.x;else if(name==='y')state.dy+=value-cur.y;else if(name==='width')state.width=Math.max(24,value);else if(name==='height')state.height=Math.max(20,value);applyState(state);syncBox();
}
function bindDrag(handle,kind){
  handle.addEventListener('pointerdown',e=>{const state=stateFor();if(!state)return;e.preventDefault();handle.setPointerCapture?.(e.pointerId);const start={x:e.clientX,y:e.clientY,dx:state.dx,dy:state.dy,w:state.width,h:state.height};
    const move=ev=>{if(kind==='move'){state.dx=start.dx+ev.clientX-start.x;state.dy=start.dy+ev.clientY-start.y;}else{state.width=Math.max(24,start.w+ev.clientX-start.x);state.height=Math.max(20,start.h+ev.clientY-start.y);}applyState(state);syncBox();};
    const up=ev=>{handle.releasePointerCapture?.(ev.pointerId);handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',up);handle.removeEventListener('pointercancel',up);syncBox();};
    handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',up);
  });
}
function snapshot(){
  const sr=screenRect();const elements={};
  for(const meta of TARGETS){const state=stateFor(meta);if(!state)continue;const rect=relativeRect(state.node);if(!rect)continue;elements[meta.id]={label:meta.label,selector:meta.selector,anchorX:state.anchorX,anchorY:state.anchorY,x:rect.x,y:rect.y,width:rect.width,height:rect.height,deltaX:round(state.dx),deltaY:round(state.dy)};}
  return {version:'combat-layout-draft.v1',createdAt:new Date().toISOString(),viewport:{width:innerWidth,height:innerHeight,dpr:Number(devicePixelRatio||1)},screen:sr?{width:round(sr.width),height:round(sr.height)}:null,elements};
}
function saveDraft(){const data=snapshot();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));savedDraft=data;}catch{}panel.querySelector('[data-json]').value=JSON.stringify(data,null,2);flash('Đã lưu draft');return data;}
async function copyJson(){const text=JSON.stringify(saveDraft(),null,2);try{await navigator.clipboard.writeText(text);flash('Đã copy JSON');}catch{const ta=panel.querySelector('[data-json]');ta.focus();ta.select();document.execCommand?.('copy');flash('Đã chọn JSON');}}
function downloadJson(){const data=saveDraft();const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`combat-layout-${data.viewport.width}x${data.viewport.height}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),0);}
function flash(text){const m=panel?.querySelector('[data-meta]');if(!m)return;const old=m.textContent;m.textContent=text;setTimeout(()=>{if(m.textContent===text)m.textContent=old;},900);}
function resetSelected(){const state=states.get(selectedId);if(state){restoreNode(state.node);states.delete(selectedId);}if(savedDraft?.elements)delete savedDraft.elements[selectedId];syncBox();}
function resetAll(){for(const state of states.values())restoreNode(state.node);states.clear();savedDraft=null;try{localStorage.removeItem(STORAGE_KEY);}catch{}syncBox();}
function loadSaved(){try{savedDraft=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');}catch{savedDraft=null;}}
function loop(){if(panel&&!panel.hidden)syncBox();raf=requestAnimationFrame(loop);}

export function initCombatLayoutEditorV1(){
  if(!enabled())return {ok:false,reason:'dev-tools-only'};
  if(root)return globalThis.__TUTIEN_COMBAT_LAYOUT_EDITOR_V1__;
  root=document.documentElement;loadSaved();mountUi();observer=new MutationObserver(()=>{if(panel&&!panel.hidden){syncAllAvailable();syncBox();}});const content=document.querySelector('#content');if(content)observer.observe(content,{subtree:true,childList:true});raf=requestAnimationFrame(loop);
  const api={ok:true,open,close,select,snapshot,save:saveDraft,copy:copyJson,reset:resetAll,destroy:destroyCombatLayoutEditorV1,targets:TARGETS.map(x=>({...x}))};globalThis.__TUTIEN_COMBAT_LAYOUT_EDITOR_V1__=api;return api;
}
export function destroyCombatLayoutEditorV1(){
  if(raf)cancelAnimationFrame(raf);raf=0;observer?.disconnect();observer=null;for(const state of states.values())restoreNode(state.node);states.clear();panel?.remove();box?.remove();toggle?.remove();styleNode?.remove();panel=box=toggle=styleNode=null;document.body?.classList.remove('tutien-layout-editing');delete globalThis.__TUTIEN_COMBAT_LAYOUT_EDITOR_V1__;root=null;
}
