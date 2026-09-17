/*
 * V83 — Combat Presentation Architecture V1
 * Presentation-only contract. CombatKernel remains the authoritative gameplay truth.
 * New combat features should extend this registry instead of patching Hunt screen geometry.
 */

export const COMBAT_PRESENTATION_ARCH_VERSION='v83.1';
export const COMBAT_PRESENTATION_EVENT='tutien:combat-presentation';
export const COMBAT_PRESENTATION_MODEL_VERSION='combat-view-model.v1';

export const COMBAT_ACTOR_SLOTS=Object.freeze({
  'player.primary':{side:'player',role:'primary',x:.25,y:.61,width:.40,height:.58,zIndex:20},
  'player.companion':{side:'player',role:'companion',x:.10,y:.68,width:.20,height:.26,zIndex:18},
  'player.ally':{side:'player',role:'ally',x:.39,y:.68,width:.20,height:.30,zIndex:19},
  'player.artifact':{side:'player',role:'artifact',x:.19,y:.31,width:.15,height:.18,zIndex:24},
  'enemy.primary':{side:'enemy',role:'primary',x:.75,y:.58,width:.42,height:.60,zIndex:21},
  'enemy.summon':{side:'enemy',role:'summon',x:.90,y:.69,width:.20,height:.27,zIndex:18},
  'enemy.ally':{side:'enemy',role:'ally',x:.61,y:.69,width:.20,height:.30,zIndex:19},
  'neutral.field':{side:'neutral',role:'field',x:.50,y:.66,width:.42,height:.24,zIndex:12},
});

export const COMBAT_HUD_SLOTS=Object.freeze([
  'boss-primary','boss-mechanic','player-primary','player-core','companion','artifact','battle-state','footer',
]);

export const DAO_VISUAL_PROFILES=Object.freeze({
  sword:{id:'sword',label:'Kiếm',main:'#86d9ff',hot:'#f4fbff',soft:'#3d75cf',primitives:['blade','slash','sword-core']},
  fist:{id:'fist',label:'Quyền',main:'#f3b866',hot:'#fff0c6',soft:'#b15b33',primitives:['impact','shockwave','combo']},
  body:{id:'body',label:'Thể',main:'#e0be76',hot:'#fff0bd',soft:'#886b43',primitives:['aura','brace','counter']},
  spell:{id:'spell',label:'Pháp',main:'#9ab8ff',hot:'#f2f5ff',soft:'#6558c8',primitives:['sigil','projectile','burst']},
  poison:{id:'poison',label:'Độc',main:'#83d777',hot:'#e8ffd9',soft:'#557d42',primitives:['mist','mark','dot']},
  artifact:{id:'artifact',label:'Ngự Khí',main:'#86d8df',hot:'#efffff',soft:'#478a9c',primitives:['orbit','volley','merge']},
  formation:{id:'formation',label:'Trận',main:'#d2a7ff',hot:'#f5e8ff',soft:'#7951a7',primitives:['rune','node','field']},
  mind:{id:'mind',label:'Thần Niệm',main:'#c2a6ff',hot:'#fbf3ff',soft:'#7257a8',primitives:['ripple','echo','distortion']},
});

export const DAO_HUD_METERS=Object.freeze({
  sword:[['swordQi','Kiếm Khí',5],['swordIntentV2','Kiếm Ý',20]],
  fist:[['fistForce','Quyền Thế',5],['fistPassiveStack','Liên Kình',20]],
  body:[['counterForce','Phản Thế',100],['bodyPassiveStack','Huyết Khí',20]],
  spell:[['lawWheel','Pháp Luân',3],['spellPassiveStack','Pháp Ý',20]],
  poison:[['poisonSeedStage','Độc Chủng',4],['poisonPassiveStack','Độc Tức',20]],
  artifact:[['artifactSourcesV2','Nguồn Pháp Bảo',3],['artifactPassiveStack','Khí Cảm',20]],
  formation:[['formationNurtureV2','Dưỡng Độ',100],['formationIntegrityV2','Độ Bền',100],['formationPassiveStack','Trận Văn',20]],
  mind:[['mindEchoCounter','Niệm Ảnh',3],['mindPassiveStack','Niệm Lực',20]],
});

const clamp01=value=>Math.max(0,Math.min(1,Number(value)||0));
const esc=value=>String(value??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
const compact=value=>{
  const n=Number(value);if(!Number.isFinite(n))return String(value??'');
  if(Math.abs(n)>=1e12)return `${(n/1e12).toFixed(1)}T`;
  if(Math.abs(n)>=1e9)return `${(n/1e9).toFixed(1)}B`;
  if(Math.abs(n)>=1e6)return `${(n/1e6).toFixed(1)}M`;
  if(Math.abs(n)>=1e3)return `${(n/1e3).toFixed(1)}K`;
  return n.toLocaleString('vi-VN',{maximumFractionDigits:1});
};

/* Canonical presentation model. It only maps already-authored runtime/model data;
   it never decides combat outcome, damage, reward, save, or Boss progression. */
export function buildCombatPresentationModelV1({model={},live={}}={}){
  const h=model?.endlessHunt||{};
  const challenge=h.monster||{};
  const farm=h.farm||{};
  const map=h.currentMap||{};
  const production=h.productionV110||{};
  const bossIntel=production.boss||{};
  const auto=Boolean(live?.autoCombat??(live?.mode==='hunt'));
  const farmActive=Boolean(auto&&farm.available);
  const enemy=farmActive?{
    id:`virtual-farm.${farm.floor||1}`,
    name:farm.mobName||'Yêu thú',
    level:Number(farm.mobLevel)||1,
    grade:'Thường',gradeId:'common',
    element:String((farm.mobElements||[])[0]||map.primaryElement||''),stageElement:String(map.primaryElement||(farm.mobElements||[])[0]||''),
  }:{
    id:String(challenge.id||''),
    name:String(challenge.name||'Thủ Lĩnh'),
    level:Number(challenge.level)||1,
    grade:String(challenge.grade||''),gradeId:String(challenge.gradeId||''),
    element:String(challenge.elementMatchup||map.primaryElement||''),stageElement:String(map.primaryElement||challenge.elementMatchup||''),
  };
  const isBoss=!farmActive&&(enemy.gradeId==='boss'||enemy.grade.toLowerCase()==='boss');
  const counters=Array.isArray(bossIntel?.mechanic?.counters)?bossIntel.mechanic.counters:[];
  const covered=counters.filter(row=>row?.covered).length;
  const mechanic=bossIntel.mechanic||challenge.bossMechanic||null;
  const floor=Math.max(1,Number(h.currentZoneFloor||map.zoneFloor||challenge.floor)||1);
  const canFight=Boolean(h.canFight);
  const ready=Boolean(h.bossReady&&!farmActive);
  const blocked=Boolean(ready&&!canFight);
  const farmFloor=Math.max(1,Number(farm.floor)||floor);
  const farmLabel=farm.available?(farmActive?'ĐANG SĂN ẢO':'CHIẾN LỢI PHẨM'):'Mở bãi Săn Ảo tầng này';
  const farmDetail=farm.available
    ?`T${((farmFloor-1)%100)+1} · ${compact(farm.spiritStonesPerHour||0)} Linh Thạch/h · ${compact(farm.demonCoresPerHour||0)} Yêu Đan/h`
    :'Reward tích theo thời gian';
  const snapshot={
    version:COMBAT_PRESENTATION_MODEL_VERSION,
    mode:farmActive?'farm':ready?'prefight':'field',
    daoId:String(model?.specialization?.mainDaoId||''),
    enemy:{...enemy,isBoss},
    boss:{
      isBoss,
      readiness:{
        label:String(bossIntel?.readiness?.label||''),
        description:String(bossIntel?.readiness?.description||''),
        tone:String(bossIntel?.readiness?.tone||'neutral'),
      },
      mechanic:mechanic?{
        name:String(mechanic.name||''),
        description:String(mechanic.description||''),
        coveragePct:Number(mechanic.coveragePct)||0,
        counterHint:String(mechanic.counterHint||''),
        counterSummary:counters.length?`${covered}/${counters.length} đối sách`:'',
      }:null,
    },
    challenge:{
      floor,ready,canFight,blocked,
      blockedReason:blocked?String(h.fightBlocker||'Không thể chiến đấu'):'',
      progressionLabel:ready?`Boss tầng ${floor} · thắng mở tầng kế`:'Boss tầng này đã hạ',
    },
    farm:{
      available:Boolean(farm.available),active:farmActive,floor:farmFloor,
      zoneName:String(farm.zoneName||map.zoneName||''),label:farmLabel,detail:farmDetail,
    },
  };
  snapshot.signature=[snapshot.mode,enemy.id,enemy.name,enemy.level,enemy.gradeId,enemy.element,snapshot.boss.readiness.label,snapshot.boss.mechanic?.name||'',snapshot.boss.mechanic?.counterSummary||'',ready?1:0,canFight?1:0,snapshot.challenge.blockedReason,snapshot.farm.available?1:0,snapshot.farm.active?1:0,snapshot.farm.floor,snapshot.farm.label,snapshot.farm.detail].join('|');
  return snapshot;
}

export function publishCombatPresentationModelV1(context={}){
  const snapshot=buildCombatPresentationModelV1(context);
  try{globalThis.__TUTIEN_COMBAT_PRESENTATION_MODEL_V1__=snapshot;}catch{}
  return snapshot;
}
export function getLatestCombatPresentationModelV1(){
  try{return globalThis.__TUTIEN_COMBAT_PRESENTATION_MODEL_V1__||null;}catch{return null;}
}

const registeredHudExtensions=new Map();
function normalizeHudExtension(extension={}){
  return {
    id:String(extension?.id||`hud.${Date.now()}`),
    slot:String(extension?.slot||'battle-state'),
    priority:Number(extension?.priority)||100,
    visible:typeof extension?.visible==='function'?extension.visible:()=>true,
    render:typeof extension?.render==='function'?extension.render:()=>'',
  };
}

export function registerCombatHudExtension(extension={}){const row=normalizeHudExtension(extension);registeredHudExtensions.set(row.id,row);return row;}
export function unregisterCombatHudExtension(id=''){return registeredHudExtensions.delete(String(id));}
export function listCombatHudExtensions(){return [...registeredHudExtensions.values()];}
export function installRegisteredCombatHudExtensions(registry){if(!registry)return registry;for(const row of registeredHudExtensions.values())registry.registerHudExtension(row);return registry;}

export function normalizeCombatActor(input={},index=0){
  const slot=String(input.slot||'').trim()||`${input.side==='enemy'?'enemy':'player'}.${input.role||'ally'}`;
  const preset=COMBAT_ACTOR_SLOTS[slot]||{};
  const side=String(input.side||preset.side||'neutral');
  const role=String(input.role||preset.role||'ally');
  const logical={x:clamp01(input.logicalAnchor?.x??preset.x??.5),y:clamp01(input.logicalAnchor?.y??preset.y??.5),width:clamp01(input.logicalAnchor?.width??preset.width??.2),height:clamp01(input.logicalAnchor?.height??preset.height??.25)};
  return {id:String(input.id||`${slot}.${index}`),slot,side,role,asset:String(input.asset||input.visual?.asset||input.visual?.poses?.idle||''),visual:input.visual||{},dom:input.dom||null,domSelector:String(input.domSelector||''),logicalAnchor:logical,zIndex:Number(input.zIndex??preset.zIndex??20),mirror:Boolean(input.mirror),scale:Math.max(.1,Number(input.scale)||1),offsetX:Number(input.offsetX)||0,offsetY:Number(input.offsetY)||0,metadata:{...(input.metadata||{})}};
}

export function resolveCombatActorAnchor(host,actor={}){
  if(!host)return {x:0,y:0,width:0,height:0};
  const node=actor.dom||(actor.domSelector?host.closest?.('.huntv2-screen')?.querySelector?.(actor.domSelector):null);
  if(node?.getBoundingClientRect){const hostRect=host.getBoundingClientRect(),nodeRect=node.getBoundingClientRect();if(nodeRect.width>0&&nodeRect.height>0)return {x:nodeRect.left-hostRect.left+nodeRect.width/2,y:nodeRect.top-hostRect.top+nodeRect.height/2,width:nodeRect.width,height:nodeRect.height};}
  const rect=host.getBoundingClientRect(),a=actor.logicalAnchor||{};return {x:rect.width*Number(a.x??.5),y:rect.height*Number(a.y??.5),width:rect.width*Number(a.width??.2),height:rect.height*Number(a.height??.25)};
}

export function createDefaultCombatActors({playerDom=null,enemyDom=null,playerVisual={},enemyAsset=''}={}){
  return [normalizeCombatActor({id:'player',slot:'player.primary',side:'player',role:'primary',dom:playerDom,visual:playerVisual,asset:playerVisual?.poses?.idle||playerVisual?.asset||'',metadata:{primary:true}}),normalizeCombatActor({id:'enemy',slot:'enemy.primary',side:'enemy',role:'primary',dom:enemyDom,asset:enemyAsset,metadata:{primary:true}})];
}
function sorted(rows=[]){return [...rows].sort((a,b)=>(Number(a.priority)||0)-(Number(b.priority)||0)||String(a.id).localeCompare(String(b.id)));}

export function createCombatPresentationRegistry({daoId=''}={}){
  const actors=new Map();const hud=new Map(COMBAT_HUD_SLOTS.map(slot=>[slot,new Map()]));const fx=new Map();
  const registerActor=input=>{const actor=normalizeCombatActor(input,actors.size);actors.set(actor.id,actor);return actor;};
  const unregisterActor=id=>actors.delete(String(id));
  const registerHudExtension=extension=>{const row=normalizeHudExtension(extension);if(!hud.has(row.slot))hud.set(row.slot,new Map());hud.get(row.slot).set(row.id,row);return row;};
  const unregisterHudExtension=id=>{for(const bucket of hud.values())if(bucket.delete(String(id)))return true;return false;};
  const renderHudSlot=(slot,context={})=>sorted([...(hud.get(String(slot))?.values?.()||[])]).filter(row=>{try{return row.visible({...context,daoId});}catch{return false;}}).map(row=>{try{return row.render({...context,daoId});}catch{return '';}}).join('');
  const registerFxProfile=(id,profile)=>{fx.set(String(id),{id:String(id),...(profile||{})});return fx.get(String(id));};
  return {daoId,actors,hud,fx,registerActor,unregisterActor,listActors:()=>[...actors.values()],registerHudExtension,unregisterHudExtension,renderHudSlot,registerFxProfile,getFxProfile:id=>fx.get(String(id))||null};
}

export function installDefaultCombatHudExtensions(registry){
  if(!registry)return registry;
  registry.registerHudExtension({id:'dao.core.v83',slot:'player-core',priority:10,visible:({daoId})=>Boolean(daoId),render:({daoId})=>{const rows=DAO_HUD_METERS[daoId]||[['daoResource','Bản Đạo',100]];return `<div class="huntv2-intel-lane v83-hud-extension" data-intel-lane data-hud-extension="dao.core.v83">${rows.map(([id,name,max])=>`<button class="huntv2-intel-meter ${max<=10?'stack-meter':'bar-meter'}" data-intel-resource="${esc(id)}" data-max="${max}" title="${esc(name)}"><span>${esc(name)}</span><i><em style="width:0%"></em></i><b>0/${max}</b></button>`).join('')}<button class="huntv2-intel-meter ultimate" data-intel-resource="ultimateGauge" data-max="100" title="Tuyệt Kỹ"><span>✦ Tuyệt Kỹ</span><i><em style="width:0%"></em></i><b>0/100</b></button></div>`;}});
  return registry;
}

export function createProductionCombatPresentationRegistry(options={}){
  const registry=installRegisteredCombatHudExtensions(installDefaultCombatHudExtensions(createCombatPresentationRegistry(options)));
  const renderHudSlot=registry.renderHudSlot;
  registry.renderHudSlot=(slot,context={})=>{publishCombatPresentationModelV1(context);return renderHudSlot(slot,context);};
  return registry;
}

export function adaptCombatPresentationEvent(event={},context={}){
  const raw=String(event.type||'unknown');let type=raw;
  if(raw==='battleStart')type='battle.start';else if(raw==='battleEnd')type='battle.end';else if(raw==='phase')type='boss.phase';else if(raw==='counterWindow')type=`boss.counter.${String(event.counterState||'update')}`;else if(raw==='castStart')type=event.actor==='enemy'&&event.bossTelegraph?'boss.telegraph':'skill.cast';else if(raw==='projectile')type='skill.travel';else if(raw==='damage')type='combat.damage';else if(raw==='heal')type='combat.heal';else if(raw==='shield'||raw==='shieldBreak')type=`combat.${raw}`;else if(raw==='status'||raw==='mark')type=`combat.${raw}`;else if(raw==='resource')type='combat.resource';else if(raw==='death')type='actor.death';
  const priority=event.bossDangerLevel==='lethal'||raw==='death'||raw==='battleEnd'?100:event.crit||raw==='phase'||raw==='counterWindow'?70:40;
  return {version:COMBAT_PRESENTATION_ARCH_VERSION,type,sourceType:raw,priority,time:Number(event.time)||0,actorId:String(event.actor||''),targetId:String(event.target||''),skillId:String(event.skillId||''),daoId:String(context.daoId||''),payload:event};
}

export function dispatchCombatPresentationEvent(root,event={},context={}){
  const adapted=adaptCombatPresentationEvent(event,context);
  try{const target=root?.matches?.('.huntv2-screen')?root:root?.querySelector?.('.huntv2-screen')||root;if(target?.dataset){target.dataset.combatPresentationEvent=adapted.type;target.dataset.combatPresentationVersion=COMBAT_PRESENTATION_ARCH_VERSION;}target?.dispatchEvent?.(new CustomEvent(COMBAT_PRESENTATION_EVENT,{detail:adapted,bubbles:false}));}catch{}
  return adapted;
}
