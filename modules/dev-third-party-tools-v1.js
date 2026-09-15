/* DEV third-party tools V1: stats.js + lil-gui.
   Loaded only from the DEV combat presentation bridge. Never writes save/gameplay authority. */
import {loadStatsJsV1,loadLilGuiV1,thirdPartyRuntimeStatusV1} from './third-party-runtime-v1.js';

let statsInstance=null;
let statsRaf=0;
let guiInstance=null;

function isDev(){
  try{return new URLSearchParams(location.search).get('dev')==='1'||globalThis.__TUTIEN_DEV_FORCE__===true;}catch{return false;}
}

function tuningState(){
  const state=globalThis.__TUTIEN_COMBAT_TUNING__||{
    animeEnabled:true,
    motionSpeed:1,
    damagePunch:1.16,
    skillPunch:1.08,
    statusPunch:1.07,
    resultPunch:1.10,
    liftPx:4,
    statsVisible:true,
  };
  globalThis.__TUTIEN_COMBAT_TUNING__=state;
  return state;
}

function mountStats(Stats,state){
  if(statsInstance)return statsInstance;
  statsInstance=new Stats();
  statsInstance.showPanel?.(0);
  const dom=statsInstance.dom||statsInstance.domElement;
  if(dom){
    dom.dataset.tutienStats='1';
    dom.setAttribute('aria-label','DEV performance monitor');
    dom.style.left='auto';dom.style.right='4px';dom.style.top='4px';dom.style.zIndex='10070';
    dom.style.display=state.statsVisible===false?'none':'';
    document.body.appendChild(dom);
  }
  const frame=()=>{statsInstance?.update?.();statsRaf=requestAnimationFrame(frame);};
  statsRaf=requestAnimationFrame(frame);
  return statsInstance;
}

function mountGui(GUI,state){
  if(guiInstance)return guiInstance;
  const gui=guiInstance=new GUI({title:'Combat DEV Tuning'});
  gui.domElement.dataset.tutienLilGui='1';
  gui.domElement.style.position='fixed';
  gui.domElement.style.right='4px';
  gui.domElement.style.top='58px';
  gui.domElement.style.zIndex='10065';
  gui.domElement.style.maxHeight='calc(100vh - 66px)';
  gui.domElement.style.overflow='auto';

  const motion=gui.addFolder('Anime.js Motion');
  motion.add(state,'animeEnabled').name('Anime motion');
  motion.add(state,'motionSpeed',.5,1.6,.05).name('Tốc độ');
  motion.add(state,'damagePunch',1,1.45,.01).name('Damage punch');
  motion.add(state,'skillPunch',1,1.30,.01).name('Tên chiêu punch');
  motion.add(state,'statusPunch',1,1.22,.01).name('Status punch');
  motion.add(state,'resultPunch',1,1.30,.01).name('Kết quả punch');
  motion.add(state,'liftPx',0,12,1).name('Lift px');

  const telemetry=gui.addFolder('Telemetry');
  telemetry.add(state,'statsVisible').name('stats.js').onChange(value=>{
    const dom=statsInstance?.dom||statsInstance?.domElement;
    if(dom)dom.style.display=value?'':'none';
  });
  const actions={
    resetMotion(){Object.assign(state,{animeEnabled:true,motionSpeed:1,damagePunch:1.16,skillPunch:1.08,statusPunch:1.07,resultPunch:1.10,liftPx:4});gui.controllersRecursive?.().forEach(c=>c.updateDisplay?.());},
    logStatus(){console.info('[DEV third-party]',thirdPartyRuntimeStatusV1(),{motion:document.body.dataset.combatMotionEngine||'idle'});},
  };
  telemetry.add(actions,'resetMotion').name('Reset motion');
  telemetry.add(actions,'logStatus').name('Log runtime');
  gui.close();
  return gui;
}

export async function initDevThirdPartyToolsV1(){
  if(!isDev())return {ok:false,reason:'dev-only'};
  const state=tuningState();
  const [statsResult,guiResult]=await Promise.allSettled([loadStatsJsV1(),loadLilGuiV1()]);
  if(statsResult.status==='fulfilled')mountStats(statsResult.value,state);
  if(guiResult.status==='fulfilled')mountGui(guiResult.value,state);
  const status=thirdPartyRuntimeStatusV1();
  globalThis.__TUTIEN_DEV_THIRD_PARTY_V1__={status:()=>thirdPartyRuntimeStatusV1(),tuning:state,stats:statsInstance,gui:guiInstance};
  try{document.body.dataset.devThirdPartyTools=(statsResult.status==='fulfilled'||guiResult.status==='fulfilled')?'ready':'fallback';}catch{}
  return {ok:statsResult.status==='fulfilled'||guiResult.status==='fulfilled',status};
}

export function destroyDevThirdPartyToolsV1(){
  if(statsRaf)cancelAnimationFrame(statsRaf);statsRaf=0;
  const dom=statsInstance?.dom||statsInstance?.domElement;dom?.remove?.();statsInstance=null;
  try{guiInstance?.destroy?.();}catch{}guiInstance=null;
  delete globalThis.__TUTIEN_DEV_THIRD_PARTY_V1__;
  try{delete document.body.dataset.devThirdPartyTools;}catch{}
}
