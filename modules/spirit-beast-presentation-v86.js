/* V86 — Linh Thú plugs into the V83 presentation architecture without patching scene geometry. */
import {registerCombatHudExtension} from './combat-presentation-architecture-v140.js';
import {registerCombatPresentationActor,unregisterCombatPresentationActor} from './combat-presentation-runtime-v140.js';

const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
let installed=false;
export function activeSpiritBeastV86(model={}){
  const pet=(model?.collectionEconomy?.categories||[]).find(x=>x.category==='pet');
  return (pet?.items||[]).find(x=>x.active&&x.progress?.owned&&x.spiritBeast)?.spiritBeast||null;
}
export function installSpiritBeastHudV86(){
  if(installed)return;installed=true;
  registerCombatHudExtension({
    id:'spirit-beast.v86',slot:'companion',priority:10,
    visible:({model})=>Boolean(activeSpiritBeastV86(model)),
    render:({model})=>{const b=activeSpiritBeastV86(model);if(!b)return'';return `<div class="huntv2-beast-companion-hud" data-hud-extension="spirit-beast.v86"><img src="${esc(b.asset||'')}" alt="${esc(b.name||'Linh Thú')}"><div><span>LINH THÚ TRỢ CHIẾN</span><b>${esc(b.name||'Linh Thú')}</b><small>${esc(b.roleLabel||'Trợ chiến')} · HM ${Number(b.bloodline||0)}/${Number(b.maxBloodline||5)}</small></div></div>`;},
  });
}
export async function syncSpiritBeastPresentationV86(model={}){
  installSpiritBeastHudV86();const b=activeSpiritBeastV86(model);
  if(!b){unregisterCombatPresentationActor('spirit-beast.v86.active');return false;}
  return registerCombatPresentationActor({
    id:'spirit-beast.v86.active',slot:'player.companion',side:'player',role:'companion',asset:String(b.asset||''),scale:.78,
    logicalAnchor:{x:.44,y:.82,width:.18,height:.20},
    metadata:{feature:'SpiritBeastV86',speciesId:b.speciesId,name:b.name,bloodline:b.bloodline}
  });
}
installSpiritBeastHudV86();
