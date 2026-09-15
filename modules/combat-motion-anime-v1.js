/* Combat Anime.js Motion V1
   DEV/opt-in presentation enhancer only. It reads existing DOM state and never owns combat truth. */
import {loadAnimeJsV1} from './third-party-runtime-v1.js';

const DEFAULT_TUNING=Object.freeze({
  animeEnabled:true,
  motionSpeed:1,
  damagePunch:1.16,
  skillPunch:1.08,
  statusPunch:1.07,
  resultPunch:1.10,
  liftPx:4,
});

let observer=null;
let animeApi=null;
const visibleState=new WeakMap();

const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));

function tuning(){
  const shared=globalThis.__TUTIEN_COMBAT_TUNING__||{};
  return {...DEFAULT_TUNING,...shared};
}

function reducedMotion(){
  try{return Boolean(matchMedia('(prefers-reduced-motion: reduce)').matches);}catch{return false;}
}

function playPunch(target,{scale=1.08,lift=0,duration=220}={}){
  if(!animeApi||!target?.isConnected)return;
  const cfg=tuning();
  if(cfg.animeEnabled===false||reducedMotion())return;
  const speed=Math.max(.4,Math.min(2,Number(cfg.motionSpeed)||1));
  const up=Math.max(50,Math.round(duration*.38/speed));
  const down=Math.max(70,Math.round(duration*.62/speed));
  try{
    animeApi.animate(target,{scale,translateY:-Math.abs(lift),duration:up,ease:'outQuad',onComplete:()=>{
      if(!target?.isConnected)return;
      animeApi.animate(target,{scale:1,translateY:0,duration:down,ease:'outQuad'});
    }});
  }catch{}
}

function damageMotion(node,cfg){
  const target=node.querySelector('strong')||node;
  const base=Number(cfg.damagePunch)||DEFAULT_TUNING.damagePunch;
  const lift=Math.max(0,Number(cfg.liftPx)||0);
  if(node.classList.contains('crit')){
    playPunch(target,{scale:clamp(base+.15,1.12,1.52),lift:lift+5,duration:340});
    return;
  }
  if(node.classList.contains('kind-dot')){
    playPunch(target,{scale:clamp(base-.08,1.02,1.24),lift:Math.max(1,lift*.45),duration:210});
    return;
  }
  if(node.classList.contains('heal')||node.classList.contains('shield')||node.classList.contains('guard')){
    playPunch(target,{scale:clamp(base-.05,1.04,1.26),lift:Math.max(1,lift*.7),duration:245});
    return;
  }
  if(node.classList.contains('kind-markBurst')||node.classList.contains('break')){
    playPunch(target,{scale:clamp(base+.07,1.09,1.38),lift:lift+2,duration:300});
    return;
  }
  playPunch(target,{scale:clamp(base,1.04,1.42),lift,duration:270});
}

function animateNode(node){
  if(!(node instanceof Element))return;
  const cfg=tuning();
  if(node.matches('.huntv2-float.show')){
    damageMotion(node,cfg);
  }else if(node.matches('.huntv2-skill-callout.show')){
    const target=node.querySelector('strong')||node;
    const base=Number(cfg.skillPunch)||DEFAULT_TUNING.skillPunch;
    const ultimate=node.classList.contains('ultimate')||node.classList.contains('tier-ultimate');
    playPunch(target,{
      scale:clamp(base+(ultimate?.08:0),1.02,ultimate?1.38:1.28),
      lift:Math.max(1,(Number(cfg.liftPx)||0)*(ultimate?.7:.45)),
      duration:ultimate?380:295,
    });
  }else if(node.matches('.huntv2-result-pop.show')){
    const target=node.querySelector('b')||node;
    playPunch(target,{scale:Number(cfg.resultPunch)||DEFAULT_TUNING.resultPunch,lift:Number(cfg.liftPx)||0,duration:320});
  }else if(node.matches('.huntv2-status-tray .status:not(.status-hidden), .huntv2-status-tray .huntv2-status-chip')){
    playPunch(node,{scale:Number(cfg.statusPunch)||DEFAULT_TUNING.statusPunch,lift:0,duration:175});
  }
}

function inspectShowState(node){
  if(!(node instanceof Element))return;
  const watched=node.matches('.huntv2-float,.huntv2-skill-callout,.huntv2-result-pop');
  if(watched){
    const now=node.classList.contains('show');
    const before=visibleState.get(node)||false;
    visibleState.set(node,now);
    if(now&&!before)animateNode(node);
  }
}

function inspectAdded(node){
  if(!(node instanceof Element))return;
  inspectShowState(node);
  if(node.matches('.huntv2-status-tray .status:not(.status-hidden), .huntv2-status-tray .huntv2-status-chip'))animateNode(node);
  node.querySelectorAll?.('.huntv2-float,.huntv2-skill-callout,.huntv2-result-pop').forEach(inspectShowState);
  node.querySelectorAll?.('.huntv2-status-tray .status:not(.status-hidden), .huntv2-status-tray .huntv2-status-chip').forEach(animateNode);
}

export async function initCombatAnimeMotionV1(){
  if(observer)return {ok:true,engine:animeApi?'anime':'pending'};
  if(reducedMotion()){
    try{document.body.dataset.combatMotionEngine='reduced';}catch{}
    return {ok:true,engine:'reduced'};
  }
  try{
    animeApi=await loadAnimeJsV1();
  }catch{
    try{document.body.dataset.combatMotionEngine='css-fallback';}catch{}
    return {ok:false,engine:'css-fallback'};
  }
  try{document.body.dataset.combatMotionEngine='anime';}catch{}
  document.querySelectorAll('.huntv2-float,.huntv2-skill-callout,.huntv2-result-pop').forEach(inspectShowState);
  observer=new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='attributes')inspectShowState(record.target);
      else for(const node of record.addedNodes)inspectAdded(node);
    }
  });
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  globalThis.__TUTIEN_COMBAT_ANIME_V1__={engine:'anime',version:'4.5.0',tuning:()=>tuning()};
  return {ok:true,engine:'anime'};
}

export function destroyCombatAnimeMotionV1(){
  observer?.disconnect();observer=null;animeApi=null;
  delete globalThis.__TUTIEN_COMBAT_ANIME_V1__;
  try{delete document.body.dataset.combatMotionEngine;}catch{}
}
