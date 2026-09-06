let runtime = null;
let mountToken = 0;
let pixiLoaderPromise = null;
let pixiSource = '';

const PIXI_VERSION = '8.20.0';
const PIXI_LOCAL = `/vendor/pixi-${PIXI_VERSION}.min.js`;
const PIXI_CDN = `https://cdn.jsdelivr.net/npm/pixi.js@${PIXI_VERSION}/dist/pixi.min.js`;
const PIXI_LOCAL_MISS_KEY = `tutien.pixi.local-miss.${PIXI_VERSION}`;
const DONGFU_LAYOUT_KEY = 'tutien.dongfu.layout.v139';

function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function queryParam(name){ try{return new URLSearchParams(location.search).get(name)||'';}catch{return '';} }

function markPixiSource(source){
  pixiSource = source;
  try{ document.body.dataset.dongfuPixiSource = source; }catch{}
}

function loadPixiScript(src,source){
  return new Promise((resolve,reject)=>{
    if(globalThis.PIXI){ markPixiSource(pixiSource||source); resolve(globalThis.PIXI); return; }
    const selector=`script[data-pixi-runtime="${PIXI_VERSION}"][data-pixi-source="${source}"]`;
    const existing=document.querySelector(selector);
    if(existing){
      if(existing.dataset.failed==='1'){ reject(new Error(`PixiJS ${source} unavailable`)); return; }
      existing.addEventListener('load',()=>globalThis.PIXI?resolve(globalThis.PIXI):reject(new Error('PixiJS loaded without global PIXI')),{once:true});
      existing.addEventListener('error',()=>reject(new Error(`Không tải được PixiJS ${source}`)),{once:true});
      return;
    }
    const script=document.createElement('script');
    script.src=src;
    script.async=true;
    script.crossOrigin=source==='cdn'?'anonymous':'';
    script.dataset.pixiRuntime=PIXI_VERSION;
    script.dataset.pixiSource=source;
    let settled=false;
    const fail=message=>{
      if(settled)return; settled=true; script.dataset.failed='1';
      reject(new Error(message));
    };
    script.onload=()=>{
      if(settled)return;
      if(globalThis.PIXI){ settled=true; markPixiSource(source); resolve(globalThis.PIXI); }
      else fail('PixiJS đã tải nhưng không có global PIXI');
    };
    script.onerror=()=>fail(`Không tải được PixiJS ${source}`);
    document.head.appendChild(script);
    setTimeout(()=>{ if(!globalThis.PIXI) fail(`PixiJS ${source} timeout`); },6500);
  });
}

async function ensurePixi(){
  if(globalThis.PIXI) return globalThis.PIXI;
  if(pixiLoaderPromise) return pixiLoaderPromise;
  pixiLoaderPromise=(async()=>{
    const skipLocal=(()=>{try{return sessionStorage.getItem(PIXI_LOCAL_MISS_KEY)==='1';}catch{return false;}})();
    if(!skipLocal){
      try{
        const pixi=await loadPixiScript(PIXI_LOCAL,'local');
        try{sessionStorage.removeItem(PIXI_LOCAL_MISS_KEY);}catch{}
        return pixi;
      }catch{
        try{sessionStorage.setItem(PIXI_LOCAL_MISS_KEY,'1');}catch{}
      }
    }
    return loadPixiScript(PIXI_CDN,'cdn');
  })().catch(error=>{pixiLoaderPromise=null;throw error;});
  return pixiLoaderPromise;
}

function motionProfile(){
  const fx=queryParam('dongfuFx').toLowerCase();
  const reduced=Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const memory=Number(globalThis.navigator?.deviceMemory||0);
  if(fx==='off'||reduced)return {level:'off',particles:0,mist:0,waterfalls:0,motion:0};
  if(fx==='low'||(memory>0&&memory<=4))return {level:'low',particles:14,mist:5,waterfalls:4,motion:.55};
  if(fx==='high')return {level:'high',particles:42,mist:10,waterfalls:7,motion:1.2};
  return {level:'normal',particles:28,mist:7,waterfalls:6,motion:1};
}

function createSoftTexture(PIXI,size=128){
  const canvas=document.createElement('canvas'); canvas.width=size; canvas.height=size;
  const ctx=canvas.getContext('2d');
  const g=ctx.createRadialGradient(size*.5,size*.5,0,size*.5,size*.5,size*.5);
  g.addColorStop(0,'rgba(255,255,255,0.95)');
  g.addColorStop(.34,'rgba(255,255,255,0.42)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,size,size);
  return PIXI.Texture.from(canvas);
}

function createWaterTexture(PIXI,w=48,h=192){
  const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext('2d');
  const hg=ctx.createLinearGradient(0,0,w,0);
  hg.addColorStop(0,'rgba(255,255,255,0)');
  hg.addColorStop(.35,'rgba(255,255,255,.42)');
  hg.addColorStop(.55,'rgba(255,255,255,.78)');
  hg.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=hg;ctx.fillRect(0,0,w,h);
  const vg=ctx.createLinearGradient(0,0,0,h);
  vg.addColorStop(0,'rgba(255,255,255,0)');vg.addColorStop(.15,'rgba(255,255,255,.45)');vg.addColorStop(.8,'rgba(255,255,255,.22)');vg.addColorStop(1,'rgba(255,255,255,0)');
  ctx.globalCompositeOperation='destination-in';ctx.fillStyle=vg;ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation='source-over';
  ctx.strokeStyle='rgba(255,255,255,.34)';ctx.lineWidth=1;
  for(let i=0;i<7;i++){const x=5+i*6+Math.random()*2;ctx.beginPath();ctx.moveTo(x,18+Math.random()*15);ctx.bezierCurveTo(x-3,h*.32,x+4,h*.62,x-1,h-20);ctx.stroke();}
  return PIXI.Texture.from(canvas);
}

function makeParticle(PIXI){
  const p = new PIXI.Sprite(PIXI.Texture.WHITE);
  const size = 1 + Math.random()*2.1;
  p.width = size; p.height = size; p.anchor.set(.5);
  p.tint = Math.random()>.25 ? 0x85cfff : 0xf3d27a;
  p.alpha = .10 + Math.random()*.28; p.blendMode = 'add';
  p.__seed = Math.random()*Math.PI*2;
  p.__speed = 4 + Math.random()*8;
  p.__drift = 3 + Math.random()*7;
  return p;
}

function bgPointToScreen(bg,nx,ny){
  const texW=Math.max(1,Number(bg.texture?.width)||1),texH=Math.max(1,Number(bg.texture?.height)||1);
  const sx=Number(bg.scale?.x||1),sy=Number(bg.scale?.y||sx);
  return {x:bg.x+(nx-.5)*texW*sx,y:bg.y+(ny-.5)*texH*sy};
}

function coverSprite(sprite,screenW,screenH){
  const texW = Math.max(1,Number(sprite.texture?.width)||1);
  const texH = Math.max(1,Number(sprite.texture?.height)||1);
  const scale = Math.max(screenW/texW,screenH/texH);
  sprite.scale.set(scale); sprite.position.set(screenW/2,screenH/2);
}

function createAmbientFx(PIXI,world,bg,profile){
  const soft=createSoftTexture(PIXI,128),water=createWaterTexture(PIXI,48,192);
  const behind=new PIXI.Container();behind.zIndex=1;world.addChild(behind);
  const foreground=new PIXI.Container();foreground.zIndex=20;world.addChild(foreground);
  const mist=[];
  for(let i=0;i<profile.mist;i++){
    const s=new PIXI.Sprite(soft);s.anchor.set(.5);s.tint=i%3===0?0xc9e8ff:0x9ecae6;s.blendMode='add';
    s.__nx=.08+Math.random()*.84;s.__ny=.33+Math.random()*.61;s.__seed=Math.random()*Math.PI*2;s.__speed=.0025+Math.random()*.004;s.__front=i%4===0;
    s.alpha=(s.__front ? .055 : .035)+Math.random()*.045;s.scale.set(2.8+Math.random()*3.8,.55+Math.random()*.65);
    (s.__front?foreground:behind).addChild(s);mist.push(s);
  }
  const waterfallPoints=[
    [.18,.405,.050,.12],[.45,.445,.032,.085],[.78,.435,.035,.085],
    [.20,.605,.040,.10],[.61,.600,.030,.075],[.75,.615,.036,.09],[.50,.795,.052,.12]
  ];
  const waterfalls=[];
  waterfallPoints.slice(0,profile.waterfalls).forEach(([nx,ny,sw,sh],i)=>{
    const s=new PIXI.Sprite(water);s.anchor.set(.5,0);s.tint=0x75c8ff;s.blendMode='add';s.alpha=.07+(i%2)*.025;
    s.__nx=nx;s.__ny=ny;s.__sw=sw;s.__sh=sh;s.__seed=Math.random()*Math.PI*2;
    behind.addChild(s);waterfalls.push(s);
  });
  return {soft,water,behind,foreground,mist,waterfalls};
}

function layoutAmbientFx(fx,bg,w,h){
  for(const s of fx.mist){const p=bgPointToScreen(bg,s.__nx,s.__ny);s.position.set(p.x,p.y);}
  for(const s of fx.waterfalls){const p=bgPointToScreen(bg,s.__nx,s.__ny);s.position.set(p.x,p.y);s.width=Math.max(8,w*s.__sw);s.height=Math.max(26,h*s.__sh);s.__baseScaleX=s.scale.x;}
}

export function destroyDongFuPixiScene(){
  mountToken += 1;
  if(runtime){
    try{ runtime.resizeObserver?.disconnect(); }catch{}
    try{ document.removeEventListener('visibilitychange',runtime.visibilityHandler); }catch{}
    try{ runtime.app?.destroy(true); }catch{}
    try{ runtime.ambient?.soft?.destroy?.(true); }catch{}
    try{ runtime.ambient?.water?.destroy?.(true); }catch{}
    runtime = null;
  }
  try{
    if(document?.body?.dataset?.dongfuRenderer === 'pixi') delete document.body.dataset.dongfuRenderer;
    delete document.body.dataset.dongfuFx;
  }catch{}
}

export function requestDongFuPixiLayout(){ try{runtime?.layout?.();}catch{} }

export function updateDongFuPixiSelection(id){
  if(!runtime) return;
  runtime.selectedId = String(id||'');
  for(const [key,node] of runtime.nodes){
    const active = key === runtime.selectedId;
    node.selected = active;
    if(node.glow) node.glow.visible = active;
    if(node.aura) node.aura.visible = active;
    if(node.base) node.base.alpha = active ? 1 : node.baseAlpha;
  }
}

function sceneMetrics(host, domNode){
  const hostRect = host.getBoundingClientRect();
  const nodeRect = domNode.getBoundingClientRect();
  return {x:nodeRect.left-hostRect.left+nodeRect.width/2,y:nodeRect.top-hostRect.top+nodeRect.height/2,width:nodeRect.width,height:nodeRect.height};
}

export async function mountDongFuPixiScene({host,background,buildings=[],selectedId='',onSelect=()=>{},force=false}={}){
  destroyDongFuPixiScene();
  const token = ++mountToken;
  if(!host || (!force && queryParam('dongfuRenderer') === 'dom')){
    document.body.dataset.dongfuRenderer = 'dom';
    return {ok:false,reason:!host?'host-missing':'dom-forced'};
  }
  let PIXI;
  try{ PIXI = await ensurePixi(); }catch(error){
    document.body.dataset.dongfuRenderer = 'dom';
    return {ok:false,reason:error?.message||'pixi-unavailable'};
  }
  const rect = host.getBoundingClientRect();
  if(rect.width < 20 || rect.height < 20){document.body.dataset.dongfuRenderer='dom';return {ok:false,reason:'host-zero-size'};}

  try{
    const profile=motionProfile();
    const app = new PIXI.Application();
    const deviceMemory=Number(globalThis.navigator?.deviceMemory||0),hardwareConcurrency=Number(globalThis.navigator?.hardwareConcurrency||0),lowEndDevice=(deviceMemory>0&&deviceMemory<=4)||(hardwareConcurrency>0&&hardwareConcurrency<=4);
    await app.init({resizeTo:host,backgroundAlpha:0,antialias:true,autoDensity:true,resolution:clamp(globalThis.devicePixelRatio||1,1,lowEndDevice?1.5:2),preference:'webgl',powerPreference:'high-performance'});
    if(app.ticker){app.ticker.maxFPS=profile.level==='off'?20:profile.level==='low'?30:lowEndDevice?40:45;app.ticker.minFPS=12;}
    if(token !== mountToken){ app.destroy(true); return {ok:false,reason:'stale'}; }

    host.replaceChildren(app.canvas);
    app.canvas.className = 'v239-dp-pixi-canvas';
    app.canvas.setAttribute('aria-hidden','true');

    const world = new PIXI.Container(); world.sortableChildren = true; app.stage.addChild(world);
    const bgTexture = await PIXI.Assets.load(background);
    if(token !== mountToken){ app.destroy(true); return {ok:false,reason:'stale'}; }
    const bg = new PIXI.Sprite(bgTexture); bg.anchor.set(.5); bg.zIndex=0; bg.alpha=.94; world.addChild(bg);
    const ambient=createAmbientFx(PIXI,world,bg,profile);

    const texturePairs=await Promise.all(buildings.map(async building=>[building,await PIXI.Assets.load(building.asset)]));
    if(token !== mountToken){ app.destroy(true); return {ok:false,reason:'stale'}; }

    const nodes = new Map();
    for(const [building,texture] of texturePairs){
      const selector = `[data-dongfu-hub-select="${CSS.escape(String(building.id))}"]`;
      const domNode = host.parentElement?.querySelector(selector); if(!domNode) continue;
      const container = new PIXI.Container(); container.zIndex = Number(building.depth||10); container.eventMode='static'; container.cursor='pointer';

      const aura=new PIXI.Sprite(ambient.soft);aura.anchor.set(.5);aura.tint=building.id==='bloodline'?0xff5568:0xf7c85a;aura.blendMode='add';aura.alpha=.18;aura.visible=String(building.id)===String(selectedId);container.addChild(aura);
      const glow = new PIXI.Sprite(texture);glow.anchor.set(.5);glow.tint=building.id==='bloodline'?0xff425d:0xffd37a;glow.blendMode='add';glow.alpha=.16;glow.visible=String(building.id)===String(selectedId);container.addChild(glow);
      const base = new PIXI.Sprite(texture);base.anchor.set(.5);container.addChild(base);

      container.on('pointertap',()=>{updateDongFuPixiSelection(building.id);try{onSelect(building.id);}catch(error){console.warn('[dongfu-pixi] select failed',error);}});
      container.on('pointerover',()=>{if(String(building.id)!==String(runtime?.selectedId))base.alpha=Math.min(1,base.alpha+.08);});
      container.on('pointerout',()=>{if(String(building.id)!==String(runtime?.selectedId))base.alpha=container.__baseAlpha;});

      world.addChild(container);
      const texW=Math.max(1,Number(texture.width)||1),texH=Math.max(1,Number(texture.height)||1);
      aura.width=texW*.92;aura.height=texH*.38;aura.y=texH*.18;aura.__baseScaleX=aura.scale.x;aura.__baseScaleY=aura.scale.y;
      nodes.set(String(building.id),{container,base,glow,aura,domNode,texture,selected:String(building.id)===String(selectedId),baseAlpha:Number(building.alpha??1),baseX:0,baseY:0});
      container.__baseAlpha=Number(building.alpha??1);base.alpha=container.__baseAlpha;
    }

    const particleLayer = new PIXI.Container();particleLayer.zIndex=30;world.addChild(particleLayer);
    const particles=Array.from({length:profile.particles},()=>makeParticle(PIXI));for(const p of particles)particleLayer.addChild(p);

    function layout(){
      const w=app.screen.width,h=app.screen.height;coverSprite(bg,w,h);layoutAmbientFx(ambient,bg,w,h);
      for(const node of nodes.values()){
        const m=sceneMetrics(host,node.domNode),texW=Math.max(1,Number(node.texture.width)||1),texH=Math.max(1,Number(node.texture.height)||1);
        const scale=Math.max(24,m.width)/texW;node.baseX=m.x;node.baseY=m.y;node.container.position.set(m.x,m.y);node.container.scale.set(scale);
        node.container.hitArea=new PIXI.Rectangle(-texW*.42,-texH*.42,texW*.84,texH*.84);node.glow.scale.set(1.055);
      }
      particles.forEach(p=>{if(!Number.isFinite(p.x)||p.x===0){p.x=Math.random()*w;p.y=h*(.20+Math.random()*.72);}else{p.x=clamp(p.x,0,w);p.y=clamp(p.y,0,h);}});
    }

    const resizeObserver=new ResizeObserver(layout);resizeObserver.observe(host);layout();
    let elapsed=0;
    app.ticker.add(ticker=>{
      const dt=Math.min(.05,Math.max(.001,(ticker.deltaMS||16.7)/1000)),motion=profile.motion;elapsed+=dt;
      bg.alpha=.93+(motion?Math.sin(elapsed*.35)*.012:0);
      const w=app.screen.width,h=app.screen.height;
      if(motion){
        particles.forEach(p=>{p.y-=p.__speed*dt*motion;p.x+=Math.sin(elapsed*.7+p.__seed)*p.__drift*dt*motion;p.alpha=.10+(Math.sin(elapsed*1.3+p.__seed)+1)*.09;if(p.y<h*.16){p.y=h*.94;p.x=Math.random()*w;}});
        ambient.mist.forEach((s,i)=>{s.__nx+=s.__speed*dt*motion;if(s.__nx>1.12)s.__nx=-.12;const p=bgPointToScreen(bg,s.__nx,s.__ny);s.position.set(p.x,p.y+Math.sin(elapsed*.22+s.__seed)*4);s.alpha=(s.__front ? .045 : .028)+(Math.sin(elapsed*.33+s.__seed)+1)*.022;});
        ambient.waterfalls.forEach((s,i)=>{s.alpha=.055+(Math.sin(elapsed*(1.15+i*.07)+s.__seed)+1)*.025;s.scale.x=(s.__baseScaleX||s.scale.x)*(1+Math.sin(elapsed*.7+s.__seed)*.035);});
      }
      for(const [id,node] of nodes){
        node.container.position.set(node.baseX,node.baseY);
        if(node.selected&&motion){const pulse=(Math.sin(elapsed*2.2)+1)/2;node.glow.alpha=.10+pulse*.16;node.glow.scale.set(1.04+pulse*.028);node.aura.alpha=.10+pulse*.14;node.aura.scale.set((node.aura.__baseScaleX||1)*(1+pulse*.12),(node.aura.__baseScaleY||1)*(1+pulse*.08));node.container.y=node.baseY+Math.sin(elapsed*1.4+id.length)*1.05*motion;}
      }
    });

    const visibilityHandler=()=>{try{document.hidden?app.ticker.stop():app.ticker.start();}catch{}};document.addEventListener('visibilitychange',visibilityHandler);
    if(document.hidden)app.ticker.stop();
    runtime={app,host,world,bg,nodes,particles,ambient,resizeObserver,visibilityHandler,selectedId:String(selectedId||''),layout,profile};
    document.body.dataset.dongfuRenderer='pixi';document.body.dataset.dongfuFx=profile.level;
    return {ok:true,renderer:app.renderer?.type||'webgl',source:pixiSource||'unknown',fx:profile.level};
  }catch(error){
    console.warn('[dongfu-pixi] fallback DOM:',error);try{runtime?.app?.destroy(true);}catch{}runtime=null;document.body.dataset.dongfuRenderer='dom';
    return {ok:false,reason:error?.message||String(error)};
  }
}

function readLayout(){try{const raw=JSON.parse(localStorage.getItem(DONGFU_LAYOUT_KEY)||'{}');return raw&&typeof raw==='object'?raw:{};}catch{return {};}}
function writeLayout(layout){try{localStorage.setItem(DONGFU_LAYOUT_KEY,JSON.stringify(layout));}catch{}}
function applyLayout(scope,layout){
  scope.querySelectorAll('[data-dongfu-hub-select]').forEach(node=>{const v=layout[node.dataset.dongfuHubSelect];if(!v)return;if(Number.isFinite(v.x))node.style.left=`${clamp(v.x,4,96)}%`;if(Number.isFinite(v.y))node.style.top=`${clamp(v.y,12,94)}%`;});
}

export function bindDongFuLayoutEditor({scope=document,enabled=false}={}){
  const scene=scope.querySelector?.('.v239-dp-scene');if(!scene)return {enabled:false};
  const previous=scene.querySelector('[data-dongfu-layout-tools]');if(previous)previous.remove();
  if(!enabled){delete scene.dataset.layoutEditor;return {enabled:false};}
  scene.dataset.layoutEditor='1';
  const layout=readLayout();applyLayout(scope,layout);
  const tools=document.createElement('div');tools.className='v239-dp-layout-tools';tools.dataset.dongfuLayoutTools='1';
  tools.innerHTML='<strong>DEV · Bố cục Động Phủ</strong><span data-dongfu-layout-coord>Kéo công trình để chỉnh</span><button type="button" data-dongfu-layout-copy>Copy JSON</button><button type="button" data-dongfu-layout-reset>Reset</button>';
  scene.appendChild(tools);
  const coord=tools.querySelector('[data-dongfu-layout-coord]');let drag=null,suppressClick=false;
  const saveNode=node=>{const rect=scene.getBoundingClientRect(),nr=node.getBoundingClientRect(),x=clamp((nr.left+nr.width/2-rect.left)/rect.width*100,4,96),y=clamp((nr.top+nr.height/2-rect.top)/rect.height*100,12,94),id=node.dataset.dongfuHubSelect;layout[id]={x:Number(x.toFixed(2)),y:Number(y.toFixed(2))};node.style.left=`${x}%`;node.style.top=`${y}%`;writeLayout(layout);if(coord)coord.textContent=`${id} · x ${x.toFixed(1)}% · y ${y.toFixed(1)}%`;requestDongFuPixiLayout();};
  scope.querySelectorAll('[data-dongfu-hub-select]').forEach(node=>{
    node.addEventListener('pointerdown',e=>{if(e.button!=null&&e.button!==0)return;drag={node,id:e.pointerId,moved:false};node.classList.add('layout-dragging');try{node.setPointerCapture(e.pointerId);}catch{}e.preventDefault();e.stopPropagation();});
    node.addEventListener('pointermove',e=>{if(!drag||drag.node!==node||drag.id!==e.pointerId)return;const r=scene.getBoundingClientRect();const x=clamp((e.clientX-r.left)/r.width*100,4,96),y=clamp((e.clientY-r.top)/r.height*100,12,94);node.style.left=`${x}%`;node.style.top=`${y}%`;drag.moved=true;suppressClick=true;if(coord)coord.textContent=`${node.dataset.dongfuHubSelect} · x ${x.toFixed(1)}% · y ${y.toFixed(1)}%`;requestDongFuPixiLayout();e.preventDefault();});
    const finish=e=>{if(!drag||drag.node!==node)return;node.classList.remove('layout-dragging');if(drag.moved)saveNode(node);drag=null;try{node.releasePointerCapture(e.pointerId);}catch{}setTimeout(()=>{suppressClick=false;},0);e.preventDefault();e.stopPropagation();};
    node.addEventListener('pointerup',finish);node.addEventListener('pointercancel',finish);
    node.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();}},true);
    node.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;const r=scene.getBoundingClientRect(),nr=node.getBoundingClientRect(),step=e.shiftKey?1:.25;let x=(nr.left+nr.width/2-r.left)/r.width*100,y=(nr.top+nr.height/2-r.top)/r.height*100;if(e.key==='ArrowLeft')x-=step;if(e.key==='ArrowRight')x+=step;if(e.key==='ArrowUp')y-=step;if(e.key==='ArrowDown')y+=step;node.style.left=`${clamp(x,4,96)}%`;node.style.top=`${clamp(y,12,94)}%`;saveNode(node);e.preventDefault();e.stopPropagation();});
  });
  tools.querySelector('[data-dongfu-layout-reset]')?.addEventListener('click',()=>{try{localStorage.removeItem(DONGFU_LAYOUT_KEY);}catch{}scope.querySelectorAll('[data-dongfu-hub-select]').forEach(n=>{n.style.left='';n.style.top='';});if(coord)coord.textContent='Đã reset về CSS canonical';requestDongFuPixiLayout();});
  tools.querySelector('[data-dongfu-layout-copy]')?.addEventListener('click',async()=>{const text=JSON.stringify(readLayout(),null,2);try{await navigator.clipboard.writeText(text);if(coord)coord.textContent='Đã copy JSON bố cục';}catch{console.info('[dongfu-layout]',text);if(coord)coord.textContent='Clipboard bị chặn · JSON đã in Console';}});
  requestAnimationFrame(requestDongFuPixiLayout);
  return {enabled:true,layout};
}
