const PIXI_VERSION = '8.20.0';
const PIXI_LOCAL = `/vendor/pixi-${PIXI_VERSION}.min.js`;
const PIXI_CDN = `https://cdn.jsdelivr.net/npm/pixi.js@${PIXI_VERSION}/dist/pixi.min.js`;
const PIXI_LOCAL_MISS_KEY = `tutien.pixi.local-miss.${PIXI_VERSION}`;

let pixiLoaderPromise = null;
let pixiSource = '';

export const HYBRID_PIXI_VERSION = PIXI_VERSION;
export function getHybridPixiSource(){return pixiSource||'';}
export const hybridClamp = (value,min,max)=>Math.max(min,Math.min(max,value));
export function hybridQueryParam(name){ try{return new URLSearchParams(location.search).get(name)||'';}catch{return '';} }

export function measureHybridDomAnchor(host,domNode){
  if(!host||!domNode)return {x:0,y:0,width:0,height:0};
  const hostRect=host.getBoundingClientRect(),nodeRect=domNode.getBoundingClientRect();
  return {x:nodeRect.left-hostRect.left+nodeRect.width/2,y:nodeRect.top-hostRect.top+nodeRect.height/2,width:nodeRect.width,height:nodeRect.height};
}

function markPixiSource(source){
  pixiSource=source;
  try{document.body.dataset.hybridPixiSource=source;}catch{}
}

function loadPixiScript(src,source){
  return new Promise((resolve,reject)=>{
    if(globalThis.PIXI){markPixiSource(pixiSource||source);resolve(globalThis.PIXI);return;}
    const selector=`script[data-pixi-runtime="${PIXI_VERSION}"][data-pixi-source="${source}"]`;
    const existing=document.querySelector(selector);
    if(existing){
      if(existing.dataset.failed==='1'){reject(new Error(`PixiJS ${source} unavailable`));return;}
      existing.addEventListener('load',()=>globalThis.PIXI?resolve(globalThis.PIXI):reject(new Error('PixiJS loaded without global PIXI')),{once:true});
      existing.addEventListener('error',()=>reject(new Error(`Không tải được PixiJS ${source}`)),{once:true});
      return;
    }
    const script=document.createElement('script');
    script.src=src;script.async=true;script.crossOrigin=source==='cdn'?'anonymous':'';
    script.dataset.pixiRuntime=PIXI_VERSION;script.dataset.pixiSource=source;
    let settled=false;
    const fail=message=>{if(settled)return;settled=true;script.dataset.failed='1';reject(new Error(message));};
    script.onload=()=>{if(settled)return;if(globalThis.PIXI){settled=true;markPixiSource(source);resolve(globalThis.PIXI);}else fail('PixiJS đã tải nhưng không có global PIXI');};
    script.onerror=()=>fail(`Không tải được PixiJS ${source}`);
    document.head.appendChild(script);
    setTimeout(()=>{if(!globalThis.PIXI)fail(`PixiJS ${source} timeout`);},6500);
  });
}

export async function ensureHybridPixi(){
  if(globalThis.PIXI){if(!pixiSource)markPixiSource('existing');return globalThis.PIXI;}
  if(pixiLoaderPromise)return pixiLoaderPromise;
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

export function resolveHybridFxProfile({paramName='fx',profiles={},defaultLevel='normal',reducedLevel='off',lowMemoryLevel='low',memoryThreshold=4}={}){
  const requested=hybridQueryParam(paramName).toLowerCase();
  const reduced=Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const memory=Number(globalThis.navigator?.deviceMemory||0);
  let level=defaultLevel;
  if(requested&&profiles[requested])level=requested;
  else if(reduced&&profiles[reducedLevel])level=reducedLevel;
  else if(memory>0&&memory<=memoryThreshold&&profiles[lowMemoryLevel])level=lowMemoryLevel;
  const profile=profiles[level]||profiles[defaultLevel]||{};
  return {...profile,level};
}

function setBodyDataset(key,value){
  if(!key)return;
  try{if(value==null)delete document.body.dataset[key];else document.body.dataset[key]=String(value);}catch{}
}

export function createHybridSceneRuntimeController({
  sceneId='scene',
  rendererQueryParam='renderer',
  rendererDataset='hybridRenderer',
  fxDataset='hybridFx',
  sourceDataset='hybridPixiSource',
  canvasClass='hybrid-pixi-canvas',
  defaultAppOptions={},
}={}){
  let current=null;
  let mountToken=0;

  const destroy=()=>{
    mountToken+=1;
    if(current){
      for(const cleanup of [...current.cleanups].reverse()){try{cleanup();}catch{}}
      try{current.app?.destroy(true);}catch{}
      current=null;
    }
    setBodyDataset(rendererDataset,null);
    setBodyDataset(fxDataset,null);
    setBodyDataset(sourceDataset,null);
  };

  const mount=async({host,force=false,fxProfile=null,appOptions={},setup}={})=>{
    destroy();
    const token=++mountToken;
    const forcedDom=!force&&hybridQueryParam(rendererQueryParam)==='dom';
    if(!host||forcedDom){setBodyDataset(rendererDataset,'dom');return {ok:false,reason:!host?'host-missing':'dom-forced'};}

    let PIXI;
    try{PIXI=await ensureHybridPixi();}
    catch(error){setBodyDataset(rendererDataset,'dom');return {ok:false,reason:error?.message||'pixi-unavailable'};}
    if(token!==mountToken)return {ok:false,reason:'stale'};

    const rect=host.getBoundingClientRect();
    if(rect.width<20||rect.height<20){setBodyDataset(rendererDataset,'dom');return {ok:false,reason:'host-zero-size'};}

    let app=null;
    try{
      app=new PIXI.Application();
      const deviceMemory=Number(globalThis.navigator?.deviceMemory||0),hardwareConcurrency=Number(globalThis.navigator?.hardwareConcurrency||0);
      const lowEndDevice=(deviceMemory>0&&deviceMemory<=4)||(hardwareConcurrency>0&&hardwareConcurrency<=4);
      const resolutionCap=lowEndDevice?1.5:2;
      await app.init({
        resizeTo:host,backgroundAlpha:0,antialias:true,autoDensity:true,
        resolution:hybridClamp(globalThis.devicePixelRatio||1,1,resolutionCap),
        preference:'webgl',powerPreference:'high-performance',
        ...defaultAppOptions,...appOptions,
      });
      if(app.ticker){
        const level=String(fxProfile?.level||'normal');
        app.ticker.maxFPS=level==='off'?24:level==='low'?30:lowEndDevice?45:60;
        app.ticker.minFPS=15;
      }
      if(token!==mountToken){app.destroy(true);return {ok:false,reason:'stale'};}

      host.replaceChildren(app.canvas);
      app.canvas.className=canvasClass;
      app.canvas.setAttribute('aria-hidden','true');

      const cleanups=[];
      const runtime={
        sceneId,token,host,app,PIXI,cleanups,fxProfile,
        isCurrent:()=>token===mountToken&&current===runtime,
        addCleanup(fn){if(typeof fn==='function')cleanups.push(fn);return fn;},
        loadAsset:input=>PIXI.Assets.load(input),
        loadAssets:inputs=>Promise.all((inputs||[]).map(input=>PIXI.Assets.load(input))),
        observeResize(handler){
          if(typeof handler!=='function')return null;
          const observer=new ResizeObserver(()=>{if(runtime.isCurrent())handler();});
          observer.observe(host);runtime.addCleanup(()=>observer.disconnect());return observer;
        },
        addTicker(handler){app.ticker.add(handler);runtime.addCleanup(()=>{try{app.ticker.remove(handler);}catch{}});return handler;},
      };
      current=runtime;

      const visibilityHandler=()=>{try{document.hidden?app.ticker.stop():app.ticker.start();}catch{}};
      document.addEventListener('visibilitychange',visibilityHandler);
      runtime.addCleanup(()=>document.removeEventListener('visibilitychange',visibilityHandler));
      if(document.hidden)app.ticker.stop();

      if(typeof setup==='function')await setup(runtime);
      if(!runtime.isCurrent()){try{app.destroy(true);}catch{}return {ok:false,reason:'stale'};}

      setBodyDataset(rendererDataset,'pixi');
      if(fxDataset&&fxProfile?.level)setBodyDataset(fxDataset,fxProfile.level);
      if(sourceDataset)setBodyDataset(sourceDataset,pixiSource||'existing');
      return {ok:true,renderer:app.renderer?.type||'webgl',source:pixiSource||'existing',fx:fxProfile?.level||''};
    }catch(error){
      console.warn(`[hybrid-pixi:${sceneId}] fallback DOM:`,error);
      if(current?.token===token){for(const cleanup of [...current.cleanups].reverse()){try{cleanup();}catch{}}current=null;}
      try{app?.destroy(true);}catch{}
      setBodyDataset(rendererDataset,'dom');setBodyDataset(fxDataset,null);
      return {ok:false,reason:error?.message||String(error)};
    }
  };

  return {
    mount,destroy,
    get current(){return current;},
    isMounted(){return Boolean(current);},
  };
}
