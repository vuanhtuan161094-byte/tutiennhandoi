const state={
  startedAt:performance.now(),
  frames:0,
  fps:0,
  longFrames:0,
  worstFrameMs:0,
  lastFrameAt:0,
  canvasAdds:0,
  canvasRemoves:0,
  maxCanvas:0,
  lastError:'',
  timer:0,
  raf:0,
  observer:null,
  host:null,
  buildVersion:'',
};

function rendererInfo(){
  const body=document.body;
  if(body.dataset.gameScreen==='hunt'&&body.dataset.combatRenderer){
    const state=body.dataset.combatPixiState?`/${body.dataset.combatPixiState}`:'';
    const source=body.dataset.combatPixiSource?`/${body.dataset.combatPixiSource}`:'';
    return `combat:${body.dataset.combatRenderer}${state}${source}`;
  }
  if(body.dataset.gameScreen==='dongfu'&&body.dataset.dongfuRenderer){
    const source=body.dataset.dongfuPixiSource?`/${body.dataset.dongfuPixiSource}`:'';
    return `dongfu:${body.dataset.dongfuRenderer}${source}`;
  }
  return 'dom';
}

function pixiStatusInfo(){
  const body=document.body;
  if(body.dataset.gameScreen!=='hunt')return null;
  const stateValue=body.dataset.combatPixiState||'';
  const reason=body.dataset.combatPixiReason||'';
  const source=body.dataset.combatPixiSource||body.dataset.hybridPixiSource||'';
  const requested=Boolean(stateValue)||globalThis.__TUTIEN_COMBAT_PIXI_DEV_FORCE__===true||(()=>{try{const p=new URLSearchParams(location.search);return p.get('dev')==='1'&&(p.get('combatRenderer')==='pixi'||p.get('combatPixi')==='1');}catch{return false;}})();
  if(!requested&&!stateValue)return null;
  return {requested,state:stateValue||'pending',reason,source};
}

function rectOf(el){
  if(!el)return null;
  const r=el.getBoundingClientRect();
  return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1),bottom:+r.bottom.toFixed(1)};
}

function snapshot(){
  const canvases=document.querySelectorAll('canvas').length;
  state.maxCanvas=Math.max(state.maxCanvas,canvases);
  return {
    schema:'tutien-device-qa.v1',
    build:state.buildVersion,
    capturedAt:new Date().toISOString(),
    screen:document.body.dataset.gameScreen||'',
    viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio||1,scrollHeight:document.documentElement.scrollHeight},
    renderer:rendererInfo(),
    pixi:{requested:Boolean(pixiStatusInfo()?.requested),state:document.body.dataset.combatPixiState||'',reason:document.body.dataset.combatPixiReason||'',source:document.body.dataset.combatPixiSource||document.body.dataset.dongfuPixiSource||document.body.dataset.hybridPixiSource||'',fxLayer:document.body.dataset.combatPixiFxLayer||'',fxActive:Number(document.body.dataset.combatPixiFxActive||0),fxEvents:Number(document.body.dataset.combatPixiFxEvents||0),projectiles:Number(document.body.dataset.combatPixiProjectiles||0),volleys:Number(document.body.dataset.combatPixiVolleys||0),fields:Number(document.body.dataset.combatPixiFields||0),particles:Number(document.body.dataset.combatPixiParticles||0),impacts:Number(document.body.dataset.combatPixiImpacts||0),cameraImpulses:Number(document.body.dataset.combatPixiCamera||0),viewportMode:document.body.dataset.combatPixiViewport||'',goldenSwordVersion:document.body.dataset.combatPixiGoldenSword||'',swordQi:Number(document.body.dataset.combatPixiSwordQi||0),swordQiMax:Number(document.body.dataset.combatPixiSwordQiMax||0),hitStops:Number(document.body.dataset.combatPixiHitStops||0),poseBlends:Number(document.body.dataset.combatPixiPoseBlends||0),sfxHooks:Number(document.body.dataset.combatPixiSfxHooks||0),swordBursts:Number(document.body.dataset.combatPixiSwordBursts||0),goldenSwordSkills:Number(document.body.dataset.combatPixiGoldenSwordSkills||0)},
    canvas:{current:canvases,added:state.canvasAdds,removed:state.canvasRemoves,max:state.maxCanvas},
    performance:{fps:+state.fps.toFixed(1),longFrames:state.longFrames,worstFrameMs:+state.worstFrameMs.toFixed(1),uptimeSec:+((performance.now()-state.startedAt)/1000).toFixed(1)},
    layout:{app:rectOf(document.querySelector('#app')),content:rectOf(document.querySelector('#content')),nav:rectOf(document.querySelector('#nav'))},
    lastError:state.lastError||'',
    userAgent:navigator.userAgent,
  };
}

async function copyText(text){
  try{await navigator.clipboard.writeText(text);return true;}catch{}
  try{
    const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
    const ok=document.execCommand('copy');ta.remove();return ok;
  }catch{return false;}
}

function frame(now){
  if(state.lastFrameAt){
    const dt=now-state.lastFrameAt;
    state.worstFrameMs=Math.max(state.worstFrameMs,dt);
    if(dt>50)state.longFrames++;
  }
  state.lastFrameAt=now;state.frames++;
  state.raf=requestAnimationFrame(frame);
}

function render(){
  if(!state.host?.isConnected)return;
  const s=snapshot();
  const summary=state.host.querySelector('[data-qa-summary]');
  if(summary)summary.textContent=`${s.screen||'—'} · ${s.viewport.width}×${s.viewport.height}@${s.viewport.dpr} · ${s.renderer}`;
  const perf=state.host.querySelector('[data-qa-perf]');
  if(perf)perf.textContent=`FPS ${s.performance.fps.toFixed(0)} · Canvas ${s.canvas.current}/${s.canvas.max} · >50ms ${s.performance.longFrames}`;
  const pixiLine=state.host.querySelector('[data-qa-pixi]');
  if(pixiLine){
    const p=pixiStatusInfo();
    if(!p){pixiLine.textContent='Pixi DEV: không yêu cầu';pixiLine.classList.remove('bad','good');}
    else if(p.state==='pixi'){const fx=document.body.dataset.combatPixiFxLayer?` · FX ${document.body.dataset.combatPixiFxEvents||0} · P ${document.body.dataset.combatPixiParticles||0}`:'';const golden=document.body.dataset.combatPixiGoldenSword?` · Golden ${String(document.body.dataset.combatPixiGoldenSword).toUpperCase()} · Sig ${document.body.dataset.combatPixiGoldenSwordSkills||0} · HS ${document.body.dataset.combatPixiHitStops||0}`:'';pixiLine.textContent=`Pixi DEV: PIXI · ${p.source||'source?'}${fx}${golden}`;pixiLine.classList.add('good');pixiLine.classList.remove('bad');}
    else if(p.state==='fallback'){pixiLine.textContent=`Pixi DEV: FALLBACK · ${p.reason||'không rõ nguyên nhân'}`;pixiLine.classList.add('bad');pixiLine.classList.remove('good');}
    else{pixiLine.textContent=`Pixi DEV: ${String(p.state||'pending').toUpperCase()}${p.reason?` · ${p.reason}`:''}`;pixiLine.classList.remove('bad','good');}
  }
  const error=state.host.querySelector('[data-qa-error]');
  if(error){error.textContent=s.lastError?`ERR ${s.lastError.slice(0,100)}`:'No runtime error';error.classList.toggle('bad',Boolean(s.lastError));}
}

function onError(event){
  const message=event?.error?.stack||event?.message||String(event||'runtime error');
  state.lastError=String(message).replace(/\s+/g,' ').trim();render();
}
function onRejection(event){
  const reason=event?.reason;state.lastError=String(reason?.stack||reason?.message||reason||'unhandled rejection').replace(/\s+/g,' ').trim();render();
}

export function initDevQaOverlay({buildVersion=''}={}){
  if(state.host?.isConnected)return state.host;
  state.buildVersion=buildVersion;
  state.startedAt=performance.now();state.frames=0;state.lastFrameAt=0;
  const host=document.createElement('aside');host.id='devQaOverlay';host.className='dev-qa-overlay';host.setAttribute('aria-label','DEV QA telemetry');
  host.innerHTML=`<div class="dev-qa-head"><b>QA</b><span data-qa-summary>đang đo…</span><button type="button" data-qa-collapse>−</button></div><div class="dev-qa-body"><div data-qa-perf>FPS —</div><div class="dev-qa-pixi" data-qa-pixi>Pixi DEV: đang đo…</div><div data-qa-error>No runtime error</div><div class="dev-qa-actions"><button type="button" data-qa-copy>Copy QA</button><button type="button" data-qa-reset>Reset</button></div></div>`;
  document.body.appendChild(host);state.host=host;
  state.maxCanvas=document.querySelectorAll('canvas').length;
  state.observer=new MutationObserver(records=>{
    for(const m of records){
      for(const node of m.addedNodes){if(node.nodeType!==1)continue;if(node.matches?.('canvas'))state.canvasAdds++;state.canvasAdds+=node.querySelectorAll?.('canvas').length||0;}
      for(const node of m.removedNodes){if(node.nodeType!==1)continue;if(node.matches?.('canvas'))state.canvasRemoves++;state.canvasRemoves+=node.querySelectorAll?.('canvas').length||0;}
    }
    state.maxCanvas=Math.max(state.maxCanvas,document.querySelectorAll('canvas').length);
  });
  state.observer.observe(document.body,{childList:true,subtree:true});
  addEventListener('error',onError);addEventListener('unhandledrejection',onRejection);
  state.raf=requestAnimationFrame(frame);
  let lastTick=performance.now(),lastFrames=0;
  state.timer=setInterval(()=>{
    const now=performance.now(),dt=Math.max(1,now-lastTick),frames=state.frames-lastFrames;
    state.fps=frames*1000/dt;lastTick=now;lastFrames=state.frames;render();
  },1000);
  host.querySelector('[data-qa-copy]')?.addEventListener('click',async e=>{
    const text=JSON.stringify(snapshot(),null,2);globalThis.__TUTIEN_QA_LAST__=text;
    const ok=await copyText(text);e.currentTarget.textContent=ok?'Đã copy':'QA JSON';setTimeout(()=>{if(e.currentTarget)e.currentTarget.textContent='Copy QA';},1000);
  });
  host.querySelector('[data-qa-reset]')?.addEventListener('click',()=>{state.longFrames=0;state.worstFrameMs=0;state.canvasAdds=0;state.canvasRemoves=0;state.maxCanvas=document.querySelectorAll('canvas').length;state.lastError='';render();});
  host.querySelector('[data-qa-collapse]')?.addEventListener('click',e=>{host.classList.toggle('collapsed');e.currentTarget.textContent=host.classList.contains('collapsed')?'+':'−';});
  globalThis.__TUTIEN_QA_SNAPSHOT__=snapshot;
  render();return host;
}
