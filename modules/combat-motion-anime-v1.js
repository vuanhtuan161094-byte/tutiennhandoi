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

function animateNode(node){
  if(!(node instanceof Element))return;
  const cfg=tuning();
  if(node.matches('.huntv2-float.show')){
    const target=node.querySelector('strong')||node;
    playPunch(target,{scale:Number(cfg.damagePunch)||DEFAULT_TUNING.damagePunch,lift:Number(cfg.liftPx)||0,duration:280});
  }else if(node.matches('.huntv2-skill-callout.show')){
    const target=node.querySelector('strong')||node;
    playPunch(target,{scale:Number(cfg.skillPunch)||DEFAULT_TUNING.skillPunch,lift:Math.max(1,(Number(cfg.liftPx)||0)*.5),duration:300});
  }else if(node.matches('.huntv2-result-pop.show')){
    const target=node.querySelector('b')||node;
    playPunch(target,{scale:Number(cfg.resultPunch)||DEFAULT_TUNING.resultPunch,lift:Number(cfg.liftPx)||0,duration:320});
  }else if(node.matches('.huntv2-status-tray .status:not(.status-hidden), .huntv2-status-tray .huntv2-status-chip')){
    playPunch(node,{scale:Number(cfg.statusPunch)||DEFAULT_TUNING.statusPunch,lift:0,duration:190});
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
