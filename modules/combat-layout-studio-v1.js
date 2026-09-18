/* Combat Layout Studio V1 — standalone DEV visual editor around the real game iframe. */
const STORAGE_KEY='tutien.dev.combat-layout-draft.v1';
const TARGETS=[
  {id:'player',label:'Player',selector:'.huntv2-actor.player'},
  {id:'boss',label:'Boss / Enemy',selector:'.huntv2-actor.enemy'},
  {id:'playerHud',label:'Player HUD',selector:'.huntv2-player-hud'},
  {id:'bossHud',label:'Boss HUD',selector:'.huntv2-enemy-hud'},
  {id:'playerStatus',label:'Player Status',selector:'.huntv2-status-tray.player'},
  {id:'bossStatus',label:'Boss Status',selector:'.huntv2-status-tray.enemy'},
  {id:'supports',label:'Support Row',selector:'.huntv2-hud-extension-slots'},
  {id:'resources',label:'Resource Lane',selector:'.huntv2-intel-lane'},
  {id:'skills',label:'Skill Bar',selector:'.huntv2-skills'},
  {id:'bossBriefing',label:'Boss Briefing',selector:'.v5-boss-briefing'},
  {id:'actionDeck',label:'Action Deck',selector:'.huntv2-action-deck'},
  {id:'quickControls',label:'Quick Controls',selector:'.huntv2-quick-controls'},
  {id:'console',label:'Combat Console',selector:'.huntv2-console'},
  {id:'telegraph',label:'Enemy Telegraph',selector:'.huntv2-enemy-intent'},
];
const VIEWPORTS={ '360x800':[360,800], '390x844':[390,844], '412x915':[412,915] };
const round=n=>Math.round(Number(n||0)*10)/10;
const $=s=>document.querySelector(s);
const frame=$('#gameFrame'),device=$('#device'),selection=$('#selection'),metaBox=$('#meta'),jsonBox=$('#json'),statusBox=$('#status'),previewState=$('#previewState');
const states=new Map(),originals=new WeakMap();
let selectedId='player',savedDraft=null,raf=0,frameReady=false;

function frameDoc(){try{return frame.contentDocument||null;}catch{return null;}}
function combatScreen(){return frameDoc()?.querySelector('#content .huntv2-screen,.huntv2-screen')||null;}
function targetMeta(id=selectedId){return TARGETS.find(x=>x.id===id)||TARGETS[0];}
function targetNode(target=targetMeta()){return combatScreen()?.querySelector(target.selector)||null;}
function screenRect(){return combatScreen()?.getBoundingClientRect?.()||null;}
function relativeRect(node){const sr=screenRect(),r=node?.getBoundingClientRect?.();if(!sr||!r)return null;return{x:round(r.left-sr.left),y:round(r.top-sr.top),width:round(r.width),height:round(r.height)};}
function remember(node){if(!node||originals.has(node))return;const data={};for(const k of ['translate','width','height'])data[k]={value:node.style.getPropertyValue(k),priority:node.style.getPropertyPriority(k)};originals.set(node,data);}
function restore(node){const old=originals.get(node);if(!old)return;for(const[k,v]of Object.entries(old)){if(v.value)node.style.setProperty(k,v.value,v.priority||'');else node.style.removeProperty(k);}originals.delete(node);}
function stateFor(target=targetMeta()){
  const node=targetNode(target);if(!node)return null;let state=states.get(target.id);
  if(!state||state.node!==node){remember(node);const rect=relativeRect(node);if(!rect||rect.width<2||rect.height<2)return null;const cs=frame.contentWindow.getComputedStyle(node);const draft=savedDraft?.elements?.[target.id]||{};state={id:target.id,node,dx:Number(draft.deltaX||0),dy:Number(draft.deltaY||0),width:Number(draft.width||rect.width),height:Number(draft.height||rect.height),anchorX:cs.right!=='auto'&&cs.left==='auto'?'right':'left',anchorY:cs.bottom!=='auto'&&cs.top==='auto'?'bottom':'top'};states.set(target.id,state);apply(state);}
  return state;
}
function apply(state){if(!state?.node?.isConnected)return;state.node.style.setProperty('translate',`${round(state.dx)}px ${round(state.dy)}px`,'important');state.node.style.setProperty('width',`${Math.max(24,round(state.width))}px`,'important');state.node.style.setProperty('height',`${Math.max(20,round(state.height))}px`,'important');}
function clearStates(){for(const state of states.values())restore(state.node);states.clear();}
function currentViewport(){const key=$('#viewport').value;const [width,height]=VIEWPORTS[key]||VIEWPORTS['390x844'];return{key,width,height};}
function frameUrl(){const u=new URL('/',location.href);u.searchParams.set('dev','1');u.searchParams.set('anime','1');u.searchParams.set('tab','hunt');u.searchParams.set('studio','1');u.searchParams.set('layoutViewport',currentViewport().key);return u.pathname+u.search;}
function loadPreview(){frameReady=false;previewState.textContent='Đang tải game…';selection.style.display='none';clearStates();frame.src=frameUrl();}
function setViewport(){const{width,height}=currentViewport();device.style.width=`${width}px`;device.style.height=`${height}px`;loadPreview();}
function loadDraft(){try{savedDraft=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');}catch{savedDraft=null;}}

function renderTargets(){
  const host=$('#targets');host.innerHTML='';
  for(const target of TARGETS){const b=document.createElement('button');b.type='button';b.className='target';b.dataset.id=target.id;b.textContent=target.label;b.addEventListener('click',()=>selectTarget(target.id));host.appendChild(b);}
}
function refreshTargetButtons(){
  for(const b of document.querySelectorAll('.target')){const t=targetMeta(b.dataset.id),node=targetNode(t),r=node?.getBoundingClientRect?.();b.classList.toggle('active',b.dataset.id===selectedId);b.classList.toggle('missing',!r||r.width<2||r.height<2);}
}
function selectTarget(id){selectedId=id;stateFor();sync();}

function sync(){
  if(!frameReady){selection.style.display='none';return;}
  refreshTargetButtons();const target=targetMeta(),state=stateFor(target),node=state?.node,r=node?.getBoundingClientRect?.(),sr=screenRect();
  if(!state||!r||!sr||r.width<2||r.height<2){selection.style.display='none';metaBox.textContent=`${target.selector} · đang ẩn / chưa render trong state hiện tại`;jsonBox.value=JSON.stringify(snapshot(),null,2);return;}
  selection.style.display='block';selection.style.left=`${round(r.left)}px`;selection.style.top=`${round(r.top)}px`;selection.style.width=`${round(r.width)}px`;selection.style.height=`${round(r.height)}px`;selection.querySelector('.tag').textContent=`${target.label} · ${target.selector}`;
  const rel=relativeRect(node);metaBox.textContent=`${target.selector} · anchor ${state.anchorX}/${state.anchorY} · screen ${round(sr.width)}×${round(sr.height)}`;
  for(const k of ['x','y','width','height'])$('#'+k).value=String(Math.round(rel[k]));
  jsonBox.value=JSON.stringify(snapshot(),null,2);
}
function setNumeric(name,value){if(!Number.isFinite(value))return;const state=stateFor();if(!state)return;const cur=relativeRect(state.node);if(!cur)return;if(name==='x')state.dx+=value-cur.x;else if(name==='y')state.dy+=value-cur.y;else if(name==='width')state.width=Math.max(24,value);else if(name==='height')state.height=Math.max(20,value);apply(state);sync();}
function nudge(dx,dy){const state=stateFor();if(!state)return;state.dx+=dx;state.dy+=dy;apply(state);sync();}
function bindDrag(handle,kind){
  handle.addEventListener('pointerdown',e=>{const state=stateFor();if(!state)return;e.preventDefault();handle.setPointerCapture?.(e.pointerId);const start={x:e.clientX,y:e.clientY,dx:state.dx,dy:state.dy,w:state.width,h:state.height};
    const move=ev=>{if(kind==='move'){state.dx=start.dx+ev.clientX-start.x;state.dy=start.dy+ev.clientY-start.y;}else{state.width=Math.max(24,start.w+ev.clientX-start.x);state.height=Math.max(20,start.h+ev.clientY-start.y);}apply(state);sync();};
    const up=ev=>{handle.releasePointerCapture?.(ev.pointerId);handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',up);handle.removeEventListener('pointercancel',up);sync();};
    handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',up);
  });
}
function snapshot(){
  const sr=screenRect(),vp=currentViewport(),elements={};
  for(const target of TARGETS){const state=stateFor(target);if(!state)continue;const rect=relativeRect(state.node);if(!rect)continue;elements[target.id]={label:target.label,selector:target.selector,anchorX:state.anchorX,anchorY:state.anchorY,x:rect.x,y:rect.y,width:rect.width,height:rect.height,deltaX:round(state.dx),deltaY:round(state.dy)};}
  return{version:'combat-layout-draft.v1',createdAt:new Date().toISOString(),viewport:{width:vp.width,height:vp.height,dpr:Number(frame.contentWindow?.devicePixelRatio||1)},screen:sr?{width:round(sr.width),height:round(sr.height)}:null,elements};
}
function saveDraft(){const data=snapshot();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));savedDraft=data;}catch{}jsonBox.value=JSON.stringify(data,null,2);flash('Đã lưu draft của viewport '+data.viewport.width+'×'+data.viewport.height);return data;}
async function copyJson(){const text=JSON.stringify(saveDraft(),null,2);try{await navigator.clipboard.writeText(text);flash('Đã copy JSON · gửi nội dung này cho ChatGPT');}catch{jsonBox.focus();jsonBox.select();document.execCommand?.('copy');flash('JSON đã được chọn để copy');}}
function downloadJson(){const data=saveDraft(),blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`combat-layout-${data.viewport.width}x${data.viewport.height}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),0);}
function resetOne(){const state=states.get(selectedId);if(state){restore(state.node);states.delete(selectedId);}if(savedDraft?.elements)delete savedDraft.elements[selectedId];sync();flash('Đã reset '+targetMeta().label);}
function resetAll(){clearStates();savedDraft=null;try{localStorage.removeItem(STORAGE_KEY);}catch{}sync();flash('Đã reset toàn bộ preview');}
function flash(text,warn=false){statusBox.textContent=text;statusBox.classList.toggle('warn',warn);clearTimeout(flash.timer);flash.timer=setTimeout(()=>{statusBox.textContent='Studio chỉ tác động presentation trong iframe DEV.';statusBox.classList.remove('warn');},1800);}

async function waitForCombat(){
  for(let i=0;i<80;i++){const doc=frameDoc(),screen=combatScreen();if(doc&&screen){frameReady=true;previewState.textContent='LIVE · '+currentViewport().key;loadDraft();for(const target of TARGETS)stateFor(target);selectTarget(selectedId);flash('Preview game thật đã sẵn sàng');return;}await new Promise(r=>setTimeout(r,100));}
  previewState.textContent='Không thấy Combat';flash('Không tìm thấy .huntv2-screen · reload preview hoặc kiểm tra server',true);
}
frame.addEventListener('load',()=>{void waitForCombat();});
$('#viewport').addEventListener('change',setViewport);$('#reload').addEventListener('click',loadPreview);
$('#gridToggle').addEventListener('click',e=>{const off=$('#grid').classList.toggle('off');e.currentTarget.textContent='Grid: '+(off?'OFF':'ON');});
$('#guideToggle').addEventListener('click',e=>{const on=device.classList.toggle('guides-on');e.currentTarget.textContent='Guides: '+(on?'ON':'OFF');});
for(const name of ['x','y','width','height'])$('#'+name).addEventListener('change',e=>setNumeric(name,Number(e.target.value)));
for(const b of document.querySelectorAll('[data-nudge]'))b.addEventListener('click',()=>{const[dx,dy]=b.dataset.nudge.split(',').map(Number);nudge(dx,dy);});
$('#resetOne').addEventListener('click',resetOne);$('#resetAll').addEventListener('click',resetAll);$('#save').addEventListener('click',saveDraft);$('#copy').addEventListener('click',()=>void copyJson());$('#download').addEventListener('click',downloadJson);
bindDrag(selection.querySelector('.tag'),'move');bindDrag(selection.querySelector('.resize'),'resize');
renderTargets();loadDraft();setViewport();
const loop=()=>{if(frameReady)sync();raf=requestAnimationFrame(loop);};raf=requestAnimationFrame(loop);
addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf);clearStates();},{once:true});
