/* Third-party runtime loader V1.
   Presentation/dev tooling only. No gameplay/save authority lives here.
   Libraries are version-pinned and loaded on demand so the initial static graph stays unchanged. */

export const THIRD_PARTY_RUNTIME_V1=Object.freeze({
  anime:Object.freeze({name:'Anime.js',version:'4.5.0',license:'MIT',script:'https://cdn.jsdelivr.net/npm/animejs@4.5.0/dist/bundles/anime.umd.min.js'}),
  stats:Object.freeze({name:'stats.js',version:'0.17.0',license:'MIT',script:'https://cdn.jsdelivr.net/npm/stats.js@0.17.0/build/stats.min.js'}),
  lilGui:Object.freeze({name:'lil-gui',version:'0.21.0',license:'MIT',script:'https://cdn.jsdelivr.net/npm/lil-gui@0.21.0/dist/lil-gui.umd.min.js',style:'https://cdn.jsdelivr.net/npm/lil-gui@0.21.0/dist/lil-gui.min.css'}),
});

const scriptPromises=new Map();
const stylePromises=new Map();

function mark(name,state){
  try{document.body.dataset[`thirdParty${name}`]=state;}catch{}
}

function loadScript(key,src,getter){
  const ready=getter?.();
  if(ready)return Promise.resolve(ready);
  if(scriptPromises.has(key))return scriptPromises.get(key);
  const promise=new Promise((resolve,reject)=>{
    const selector=`script[data-tutien-third-party="${key}"]`;
    let script=document.querySelector(selector);
    const finish=()=>{
      const api=getter?.();
      if(api){mark(key,'ready');resolve(api);}
      else{mark(key,'invalid');reject(new Error(`${key} loaded without expected global`));}
    };
    const fail=()=>{mark(key,'unavailable');reject(new Error(`${key} unavailable`));};
    if(script){
      if(script.dataset.loaded==='1'){finish();return;}
      script.addEventListener('load',finish,{once:true});
      script.addEventListener('error',fail,{once:true});
      return;
    }
    script=document.createElement('script');
    script.src=src;
    script.async=true;
    script.crossOrigin='anonymous';
    script.referrerPolicy='no-referrer';
    script.dataset.tutienThirdParty=key;
    script.addEventListener('load',()=>{script.dataset.loaded='1';finish();},{once:true});
    script.addEventListener('error',fail,{once:true});
    document.head.appendChild(script);
  }).catch(error=>{scriptPromises.delete(key);throw error;});
  scriptPromises.set(key,promise);
  return promise;
}

function loadStyle(key,href){
  if(!href)return Promise.resolve();
  if(stylePromises.has(key))return stylePromises.get(key);
  const promise=new Promise((resolve,reject)=>{
    const selector=`link[data-tutien-third-party-style="${key}"]`;
    let link=document.querySelector(selector);
    if(link){
      if(link.dataset.loaded==='1'){resolve(link);return;}
      link.addEventListener('load',()=>resolve(link),{once:true});
      link.addEventListener('error',()=>reject(new Error(`${key} stylesheet unavailable`)),{once:true});
      return;
    }
    link=document.createElement('link');
    link.rel='stylesheet';
    link.href=href;
    link.crossOrigin='anonymous';
    link.referrerPolicy='no-referrer';
    link.dataset.tutienThirdPartyStyle=key;
    link.addEventListener('load',()=>{link.dataset.loaded='1';resolve(link);},{once:true});
    link.addEventListener('error',()=>reject(new Error(`${key} stylesheet unavailable`)),{once:true});
    document.head.appendChild(link);
  }).catch(error=>{stylePromises.delete(key);throw error;});
  stylePromises.set(key,promise);
  return promise;
}

export async function loadAnimeJsV1(){
  const spec=THIRD_PARTY_RUNTIME_V1.anime;
  const api=await loadScript('Anime',spec.script,()=>globalThis.anime);
  if(typeof api?.animate!=='function')throw new Error('Anime.js animate() missing');
  return api;
}

export async function loadStatsJsV1(){
  const spec=THIRD_PARTY_RUNTIME_V1.stats;
  const Stats=await loadScript('Stats',spec.script,()=>globalThis.Stats);
  if(typeof Stats!=='function')throw new Error('stats.js constructor missing');
  return Stats;
}

export async function loadLilGuiV1(){
  const spec=THIRD_PARTY_RUNTIME_V1.lilGui;
  const [,api]=await Promise.all([
    loadStyle('LilGui',spec.style),
    loadScript('LilGui',spec.script,()=>globalThis.lil),
  ]);
  const GUI=api?.GUI||globalThis.lil?.GUI;
  if(typeof GUI!=='function')throw new Error('lil-gui GUI constructor missing');
  return GUI;
}

export function thirdPartyRuntimeStatusV1(){
  return {
    anime:document.body?.dataset?.thirdPartyAnime||'idle',
    stats:document.body?.dataset?.thirdPartyStats||'idle',
    lilGui:document.body?.dataset?.thirdPartyLilGui||'idle',
  };
}
