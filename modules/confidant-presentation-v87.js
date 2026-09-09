/* V87 — Tri Kỷ is a transient call-in companion on top of the canonical V83 actor/HUD registry. */
import {COMBAT_PRESENTATION_EVENT,registerCombatHudExtension} from './combat-presentation-architecture-v140.js';
import {registerCombatPresentationActor,unregisterCombatPresentationActor} from './combat-presentation-runtime-v140.js';

const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
let installed=false;
const boundRoots=new WeakSet();
const timers=new WeakMap();
export function activeConfidantV87(model={}){
  const cat=(model?.collectionEconomy?.categories||[]).find(x=>x.category==='companion');
  return (cat?.items||[]).find(x=>x.active&&x.progress?.owned&&x.confidant)?.confidant||null;
}
export function installConfidantHudV87(){
  if(installed)return;installed=true;
  registerCombatHudExtension({
    id:'confidant.v87',slot:'companion',priority:20,
    visible:({model})=>Boolean(activeConfidantV87(model)),
    render:({model})=>{const c=activeConfidantV87(model);if(!c)return'';return `<div class="huntv2-confidant-hud" data-hud-extension="confidant.v87"><img src="${esc(c.asset||'')}" alt="${esc(c.name||'Tri Kỷ')}"><div><span>TRI KỶ ĐỒNG HÀNH</span><b>${esc(c.name||'Tri Kỷ')}</b><small>Thân Mật ${Number(c.intimacy||1)}/${Number(c.maxIntimacy||100)} · Duyên ★${Number(c.stars||0)} · Tâm Lực ${Number(c.heartPower||0).toLocaleString('vi-VN')}</small></div></div>`;},
  });
}
function clearCallin(root){
  const old=timers.get(root);if(old)clearTimeout(old);timers.delete(root);
  unregisterCombatPresentationActor('confidant.v87.callin');
  root?.classList?.remove('confidant-v87-callin');
  if(root?.dataset){delete root.dataset.confidantCallin;delete root.dataset.confidantEvent;}
  root?.querySelector?.('[data-confidant-v87-callout]')?.remove();
}
function presentCallin(root,model,event={}){
  const c=activeConfidantV87(model);if(!c||!['confidant.v87','confidant.v148'].includes(event?.confidantRuntime))return false;
  clearCallin(root);
  registerCombatPresentationActor({id:'confidant.v87.callin',slot:'player.ally',side:'player',role:'ally',asset:String(c.asset||''),scale:.95,metadata:{feature:'ConfidantV148',confidantId:c.id,name:c.name,event:event.confidantEvent||'assist'}}).catch(()=>{});
  root.classList.add('confidant-v87-callin');root.dataset.confidantCallin=String(c.id||'');root.dataset.confidantEvent=String(event.confidantEvent||'assist');
  const label=event.confidantEvent==='guard'?'HỘ ĐẠO':event.confidantEvent==='harmony'?'TÂM Ý HỢP KÍCH':'TRỢ CHIẾN';
  const node=document.createElement('div');node.className=`huntv2-confidant-callout kind-${esc(event.confidantEvent||'assist')}`;node.dataset.confidantV87Callout='1';node.innerHTML=`<span>${label}</span><b>${esc(c.name)}</b><small>${esc(event.abilityName||'Tâm ý tương trợ')}</small>`;root.appendChild(node);
  const timer=setTimeout(()=>clearCallin(root),event.confidantEvent==='harmony'?1300:900);timers.set(root,timer);return true;
}
export function stopConfidantPresentationV87(root){clearCallin(root);}
export function syncConfidantPresentationV87(model={},root){
  installConfidantHudV87();
  if(!root||boundRoots.has(root))return Boolean(activeConfidantV87(model));
  boundRoots.add(root);
  root.addEventListener(COMBAT_PRESENTATION_EVENT,e=>{const payload=e?.detail?.payload||{};if(payload?.type==='trigger'&&['confidant.v87','confidant.v148'].includes(payload?.confidantRuntime))presentCallin(root,model,payload);});
  return Boolean(activeConfidantV87(model));
}
installConfidantHudV87();
