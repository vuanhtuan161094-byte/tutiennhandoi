/* V83 — renderer/runtime façade. Feature modules depend on this, not on Pixi implementation. */
import {createDefaultCombatActors,COMBAT_PRESENTATION_ARCH_VERSION} from './combat-presentation-architecture-v140.js';

let rendererApi=null;
let rendererPromise=null;
let mountSerial=0;
let lastMount=null;
const registeredActors=new Map();

export function combatPresentationRendererRequested(){
  if(globalThis.__TUTIEN_COMBAT_RENDERER__==='dom')return false;
  if(globalThis.__TUTIEN_COMBAT_RENDERER__==='pixi'||globalThis.__TUTIEN_COMBAT_PIXI_DEV_FORCE__===true)return true;
  try{
    const params=new URLSearchParams(location.search);
    if(params.get('combatRenderer')==='dom')return false;
    if(params.get('combatRenderer')==='pixi'||params.get('combatPixi')==='1')return true;
  }catch{}
  return true;
}

async function ensureRendererApi(){
  if(!combatPresentationRendererRequested())return null;
  if(rendererApi)return rendererApi;
  if(!rendererPromise)rendererPromise=import('./combat-pixi-scene-v140.js?v=v83').then(mod=>{rendererApi=mod;return mod;}).catch(error=>{rendererPromise=null;throw error;});
  return rendererPromise;
}

function telemetryTarget(root){
  if(!root)return null;
  if(root.matches?.('.huntv2-screen'))return root;
  return root.querySelector?.('.huntv2-screen')||root;
}
function setTelemetry(root,state,reason=''){
  const target=telemetryTarget(root),value=String(state||''),why=String(reason||'');
  try{
    if(target?.dataset){
      if(value)target.dataset.combatPixiState=value;else delete target.dataset.combatPixiState;
      target.dataset.combatPresentationVersion=COMBAT_PRESENTATION_ARCH_VERSION;
      if(value==='pixi')target.dataset.combatPixiReady='1';else if(value==='fallback')target.dataset.combatPixiReady='0';else delete target.dataset.combatPixiReady;
      if(why)target.dataset.combatPixiReason=why;else delete target.dataset.combatPixiReason;
    }
    if(value)document.body.dataset.combatPixiState=value;else delete document.body.dataset.combatPixiState;
    if(why)document.body.dataset.combatPixiReason=why;else delete document.body.dataset.combatPixiReason;
  }catch{}
}

export async function mountCombatPresentationRuntime({root,stage,playerVisual={},fxLevel='normal',extraActors=[]}={}){
  const serial=++mountSerial;lastMount={root,stage,playerVisual,fxLevel,extraActors};
  try{document.body.dataset.combatRenderer='dom';}catch{}
  if(!combatPresentationRendererRequested())return {ok:false,reason:'dom-forced'};
  const host=root?.querySelector?.('[data-combat-pixi-host]');
  if(!host){setTelemetry(root,'fallback','host-missing');return {ok:false,reason:'host-missing'};}
  setTelemetry(root,'pending');
  try{
    const api=await ensureRendererApi();
    if(!api||serial!==mountSerial||!root?.isConnected){setTelemetry(root,'stale','before-mount');return {ok:false,reason:'stale'};}
    const playerDom=root.querySelector('.huntv2-actor.player'),enemyDom=root.querySelector('.huntv2-actor.enemy');
    const enemyAsset=String(stage?.dataset?.monsterAsset||'');
    const extensionById=new Map();
    for(const actor of registeredActors.values())if(actor?.id)extensionById.set(String(actor.id),actor);
    for(const actor of (extraActors||[]))if(actor?.id)extensionById.set(String(actor.id),actor);
    const actors=[...createDefaultCombatActors({playerDom,enemyDom,playerVisual,enemyAsset}),...extensionById.values()];
    const result=await api.mountCombatPixiScene({host,playerDom,enemyDom,playerVisual,enemyAsset,actors,fxLevel,daoId:String(stage?.dataset?.playerDao||'')});
    if(serial!==mountSerial||!root?.isConnected){try{api.destroyCombatPixiScene?.();}catch{}setTelemetry(root,'stale','after-mount');return {ok:false,reason:'stale-after-mount'};}
    if(result?.ok)setTelemetry(root,'pixi');else setTelemetry(root,'fallback',result?.reason||'unknown');
    return result||{ok:false,reason:'unknown'};
  }catch(error){
    console.warn('[combat-presentation-v83] fallback DOM:',error);
    setTelemetry(root,'fallback',error?.message||String(error));
    try{document.body.dataset.combatRenderer='dom';}catch{}
    return {ok:false,reason:error?.message||String(error)};
  }
}

export async function remountCombatPresentationRuntime(overrides={}){
  if(!lastMount)return {ok:false,reason:'not-mounted'};
  return mountCombatPresentationRuntime({...lastMount,...overrides});
}

export function destroyCombatPresentationRuntime(){
  mountSerial+=1;lastMount=null;
  try{rendererApi?.destroyCombatPixiScene?.();}catch{}
  setTelemetry(document.querySelector('.huntv2-screen'),'','');
  try{document.body.dataset.combatRenderer='dom';delete document.body.dataset.combatPixiFx;delete document.body.dataset.combatPixiSource;}catch{}
}

export function combatPresentationActive(){
  try{return Boolean(rendererApi&&document.body.dataset.combatRenderer==='pixi');}catch{return false;}
}
export function playCombatPresentationFx(event={}){try{return Boolean(combatPresentationActive()&&rendererApi.playCombatPixiFx?.(event));}catch{return false;}}
export function setCombatPresentationFxState(state={}){try{return Boolean(combatPresentationActive()&&rendererApi.setCombatPixiFxState?.(state));}catch{return false;}}
export function setCombatPresentationSwordQi(state={}){try{return Boolean(combatPresentationActive()&&rendererApi.setCombatPixiSwordQi?.(state));}catch{return false;}}
export function setCombatPresentationDaoIdentity(daoId=''){try{return Boolean(combatPresentationActive()&&rendererApi.setCombatPixiDaoIdentity?.(String(daoId||'')));}catch{return false;}}
export function syncCombatPresentationEnemyAsset(src=''){if(!rendererApi||!src)return false;Promise.resolve(rendererApi.updateCombatPixiEnemyAsset?.(String(src))).catch(()=>{});return true;}
export async function registerCombatPresentationActor(actor={}){
  const id=String(actor?.id||'').trim();if(!id)return false;registeredActors.set(id,{...actor,id});
  if(!combatPresentationActive())return true;
  try{const api=await ensureRendererApi();return Boolean(await api?.upsertCombatPixiActor?.(registeredActors.get(id)));}catch{return false;}
}
export function unregisterCombatPresentationActor(id=''){
  const key=String(id||'').trim();if(!key)return false;const existed=registeredActors.delete(key);
  try{if(rendererApi&&combatPresentationActive())rendererApi.removeCombatPixiActor?.(key);}catch{}
  return existed;
}
export function clearCombatPresentationActors(){
  for(const key of registeredActors.keys())try{rendererApi?.removeCombatPixiActor?.(key);}catch{}
  registeredActors.clear();return true;
}
export function requestCombatPresentationLayout(){try{rendererApi?.requestCombatPixiLayout?.();return true;}catch{return false;}}
