/* Portrait combat safety V1 — presentation-only runtime geometry guard.
   Fixes viewport clipping discovered by exact-SHA visual proof without owning gameplay state. */
let observer=null;
let raf=0;
const managed=new WeakMap();

function remember(node,prop){
  if(!node)return;
  let props=managed.get(node);if(!props){props=new Set();managed.set(node,props);}props.add(prop);
}
function setImportant(node,prop,value){if(!node)return;remember(node,prop);node.style.setProperty(prop,value,'important');}
function clear(node,...props){if(!node)return;for(const prop of props)node.style.removeProperty(prop);}
function portrait(){try{return matchMedia('(max-width:430px)').matches;}catch{return innerWidth<=430;}}

function sync(){
  raf=0;
  const screen=document.querySelector('.huntv2-screen');
  if(!screen)return;
  const compact=portrait();
  const engaged=screen.classList.contains('v5-combat-engaged');
  const prefight=screen.classList.contains('is-prefight')&&!engaged;
  const lane=screen.querySelector('.huntv2-intel-lane');
  const actors=screen.querySelectorAll('.huntv2-actor.player,.huntv2-actor.enemy');
  const callout=screen.querySelector('.huntv2-skill-callout');
  const playerHud=screen.querySelector('.huntv2-player-hud');
  const playerStatus=screen.querySelector('.huntv2-status-tray.player');
  const supports=screen.querySelector('.huntv2-hud-extension-slots');

  if(compact&&lane){
    setImportant(lane,'left','0');
    setImportant(lane,'right','auto');
    setImportant(lane,'bottom','auto');
    setImportant(lane,'width','100%');
    setImportant(lane,'max-width','100%');
  }else clear(lane,'left','right','bottom','width','max-width');

  actors.forEach(actor=>{
    if(compact&&prefight)setImportant(actor,'bottom','29%');
    else clear(actor,'bottom');
  });

  /* Active portrait accessory lane: supports + statuses live above the HP HUD,
     keeping transient/full-chaos chrome away from the player face and body. */
  if(compact&&engaged&&playerHud){
    const screenRect=screen.getBoundingClientRect();
    const hudRect=playerHud.getBoundingClientRect();
    const accessoryTop=Math.max(154,Math.round(hudRect.top-screenRect.top-37));
    if(supports){
      setImportant(supports,'top',`${accessoryTop}px`);
      setImportant(supports,'left','11px');
      setImportant(supports,'right','auto');
      setImportant(supports,'bottom','auto');
    }
    if(playerStatus){
      setImportant(playerStatus,'top',`${accessoryTop+2}px`);
      setImportant(playerStatus,'left','121px');
      setImportant(playerStatus,'right','auto');
      setImportant(playerStatus,'bottom','auto');
    }
  }else{
    clear(supports,'top','left','right','bottom');
    clear(playerStatus,'top','left','right','bottom');
  }

  const playerUltimate=compact&&callout&&!callout.classList.contains('enemy')&&(callout.classList.contains('ultimate')||callout.classList.contains('tier-ultimate'));
  if(playerUltimate){
    setImportant(callout,'left','10px');
    setImportant(callout,'right','10px');
    setImportant(callout,'width','auto');
    setImportant(callout,'max-width','none');
    setImportant(callout,'transform','none');
  }else clear(callout,'left','right','width','max-width','transform');
}

function schedule(){if(raf)return;raf=requestAnimationFrame(sync);}
function start(){
  observer=new MutationObserver(schedule);
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
  addEventListener('resize',schedule,{passive:true});
  schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export function destroyCombatPortraitSafetyV1(){observer?.disconnect();observer=null;if(raf)cancelAnimationFrame(raf);raf=0;}
