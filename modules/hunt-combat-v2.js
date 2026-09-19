import {productionSkillIconPath,CANONICAL_THUNDER_HORN_RHINO_ID,PLAYER_COMBAT_VISUAL} from './combat-production-pack-v138.js';
import {expressionPortraitMarkup} from './character-expression-rig-v138.js';
import {bossStateFromSkill,setBossState,resetBossState} from './boss-state-runtime-v138.js';
import {playSkillFxPhase,playDevFx} from './combat-fx-runtime-v138.js';
import {applyPresentationTheme,clearPresentationTheme,presentationCaption,presentationProfile,impactIsStrong,calloutMeta,isMajorStatus} from './combat-presentation-final-v138.js';
import {createProductionCombatPresentationRegistry,dispatchCombatPresentationEvent,COMBAT_PRESENTATION_ARCH_VERSION} from './combat-presentation-architecture-v140.js';
import { mountCombatPresentationRuntime, destroyCombatPresentationRuntime, playCombatPresentationFx, setCombatPresentationFxState, setCombatPresentationSwordQi, syncCombatPresentationEnemyAsset } from './combat-presentation-runtime-v140.js';
import {syncSpiritBeastPresentationV86} from './spirit-beast-presentation-v86.js';
import {syncConfidantPresentationV87,stopConfidantPresentationV87} from './confidant-presentation-v87.js';
import {syncArtifactPresentationV88,stopArtifactPresentationV88} from './artifact-presentation-v88.js';
let fxTimer=null;
let activeHuntRoot=null;
let lastFarmBatchCount=-1;
let nextVirtualFarmKillAt=0;
let nextVirtualFarmHitAt=0;
let virtualFarmCycleStartedAt=0;
let lastFightCount=-1;
let logVisible=false;
function loadCombatLogCompactHidden(){try{return localStorage.getItem('tutien.combat.log-compact-hidden')==='1';}catch{return false;}}
let logCompactHidden=loadCombatLogCompactHidden();
function saveCombatLogCompactHidden(){try{localStorage.setItem('tutien.combat.log-compact-hidden',logCompactHidden?'1':'0');}catch{}}
const FX_QUALITY_LEVELS=['low','normal','high','off'];
function loadCombatFxQuality(){try{const v=localStorage.getItem('tutien.combat.fx-quality');return FX_QUALITY_LEVELS.includes(v)?v:'normal';}catch{return 'normal';}}
let combatFxQuality=loadCombatFxQuality();
let fxPaused=combatFxQuality==='off';
const COMBAT_PRESENTATION_SPEED=1;
let sequenceIndex=0;
let lastMonsterId=null;
let resultTimer=null;
const damageTextState=new WeakMap();
const presentationState=new WeakMap();

const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const fmt=(value,digits=0)=>Number(value??0).toLocaleString('vi-VN',{maximumFractionDigits:digits});
const selectedExpression=model=>String(model?.visuals?.selected?.selectedExpression||'neutral');
function selectedSkin(model={}){
  const visuals=model?.visuals||{};const id=String(visuals?.selected?.characterSkinId||'');
  return (visuals?.skins||[]).find(x=>String(x?.id||'')===id)||(visuals?.skins||[]).find(x=>x?.selected)||{};
}
function playerCombatVisual(model={}){
  const skin=selectedSkin(model);
  if(!skin?.id||String(skin.id)==='skin.white_immortal')return PLAYER_COMBAT_VISUAL;
  const asset=String(skin.asset||PLAYER_COMBAT_VISUAL.poses?.idle||'');
  const avatar=String(skin.avatar||asset||PLAYER_COMBAT_VISUAL.portraitPath||'');
  return {...PLAYER_COMBAT_VISUAL,characterId:String(skin.id),assetState:'selected-skin',poses:{idle:asset,cast:asset,attack:asset,hit:asset,ultimate:asset,defeat:asset},portraitPath:avatar,portraitRig:{...(PLAYER_COMBAT_VISUAL.portraitRig||{}),flatBase:avatar}};
}
function skillRole(skill={}){
  const tags=[skill.name,...(skill.tags||[]),...(skill.mechanics||[])].join(' ').toLowerCase();
  if(skill?.slot==='ultimate'||skill?.runtimeV117?.slotClass==='ultimate'||/tuyệt kỹ|ultimate/.test(tags))return {key:'ultimate',label:'TUYỆT'};
  if(/shield|heal|hồi|khiên|hộ thể|guard|thủ/.test(tags))return {key:'guard',label:'THỦ'};
  if(/break|phá thế|phá cương|phá/.test(tags)||Number(skill?.breakDamagePct||0)>0)return {key:'break',label:'PHÁ'};
  if((skill?.daoRuntimeV118?.spend||[]).length||/finisher|consume|phệ|quyết|kết liễu/.test(tags))return {key:'spend',label:'XẢ'};
  if((skill?.daoRuntimeV118?.generate||[]).length||/nurture|mark|tích|dưỡng|ấn|deploy|bố trận/.test(tags))return {key:'build',label:'TÍCH'};
  if(skill?.runtimeV117?.slotClass==='basic'||String(skill?.id||'').endsWith('.basic'))return {key:'basic',label:'THƯỜNG'};
  return {key:'active',label:'CHỦ ĐỘNG'};
}


function skillKind(skill={}){
  const haystack=[skill.name,skill.description,...(skill.tags||[])].join(' ').toLowerCase();
  if(/lôi|lightning|thunder|sét/.test(haystack))return 'lightning';
  if(/hỏa|fire|flame|viêm/.test(haystack))return 'fire';
  if(/băng|ice|thủy|water/.test(haystack))return 'ice';
  if(/độc|poison|mộc|wood/.test(haystack))return 'poison';
  if(/kiếm|sword|melee|cận chiến|trảm|đao/.test(haystack))return 'sword';
  if(/heal|hồi|shield|khiên|buff|hộ thể/.test(haystack))return 'support';
  return 'arcane';
}

function elementGlyph(skill={}){
  return ({lightning:'ϟ',fire:'✹',ice:'❄',poison:'♧',sword:'⌁',support:'◇',arcane:'✦'})[skillKind(skill)]||'✦';
}

function visualElement(skill={}){
  const raw=[skill.name,skill.description,skill.primaryElement,...(skill.tags||[])].join(' ').toLowerCase();
  if(/kim|metal|kiếm|sword/.test(raw))return 'metal';
  if(/hỏa|fire|flame|viêm/.test(raw))return 'fire';
  if(/thủy|water|băng|ice|frost/.test(raw))return 'water';
  if(/mộc|wood|độc|poison|vine/.test(raw))return 'wood';
  if(/thổ|earth|stone|rock|địa/.test(raw))return 'earth';
  return 'arcane';
}

const DAO_UI={
  sword:{name:'Kiếm Đạo',resource:'Kiếm Ý'},fist:{name:'Quyền Đạo',resource:'Quyền Thế / Liên Kình'},body:{name:'Thể Đạo',resource:'Phản Thế / Huyết Khí'},
  spell:{name:'Pháp Đạo',resource:'Pháp Luân / Pháp Ý'},poison:{name:'Độc Đạo',resource:'Độc Chủng / Độc Tức'},artifact:{name:'Ngự Khí',resource:'Nguồn Pháp Bảo / Khí Cảm'},
  formation:{name:'Trận Đạo',resource:'Dưỡng Độ / Độ Bền / Trận Văn'},mind:{name:'Thần Niệm',resource:'Niệm Ảnh / Niệm Lực'}
};
function daoHudMeta(model={},skills=[]){
  const sp=model?.specialization||{};
  let dao=sp.mainDaoId||'';
  if(!dao){
    const text=skills.map(x=>[x.dao,x.name,...(x.tags||[])].join(' ')).join(' ').toLowerCase();
    if(/kiếm|sword/.test(text))dao='sword'; else if(/quyền|fist/.test(text))dao='fist'; else if(/thể|body/.test(text))dao='body';
    else if(/độc|poison/.test(text))dao='poison'; else if(/trận|formation/.test(text))dao='formation'; else if(/pháp bảo|artifact|ngự khí/.test(text))dao='artifact';
    else if(/thần niệm|mind/.test(text))dao='mind'; else if(/pháp|spell/.test(text))dao='spell';
  }
  const ui=DAO_UI[dao]||{name:sp.mainDaoName||'Chưa Định Đạo',resource:'Bản Đạo'};
  return {dao,daoName:sp.mainDaoName||ui.name,resource:ui.resource,breakPct:Number(sp?.bonuses?.breakPct||0)};
}
function compactStat(value){
  const n=Number(value||0); if(!Number.isFinite(n))return '—';
  if(Math.abs(n)>=1e12)return `${(n/1e12).toFixed(1)}T`;
  if(Math.abs(n)>=1e9)return `${(n/1e9).toFixed(1)}B`;
  if(Math.abs(n)>=1e6)return `${(n/1e6).toFixed(1)}M`;
  if(Math.abs(n)>=1e3)return `${(n/1e3).toFixed(1)}K`;
  return fmt(n,1);
}
function displayCombatAmount(value){
  if(value===null||value===undefined||value==='')return '—';
  const n=Number(value);
  return Number.isFinite(n)?compactStat(n):String(value);
}

function modelResourceQty(model={},needle=''){
  const key=String(needle||'').toLowerCase();
  const rows=Array.isArray(model?.inventory)?model.inventory:[];
  const row=rows.find(x=>[x?.id,x?.resourceId,x?.name].filter(Boolean).join(' ').toLowerCase().includes(key));
  return Number(row?.quantity||row?.amount||0);
}


const PLAYER_POSES=PLAYER_COMBAT_VISUAL.poses||{};
const PLAYER_PORTRAIT=PLAYER_COMBAT_VISUAL.portraitPath||PLAYER_POSES.idle||'';

function playerGeometryStyle(visual=PLAYER_COMBAT_VISUAL){
  const g=visual.geometry||{};
  const scale=Number(g.combatScale||1);
  const ox=Number(g.offset?.x||0)*100;
  const oy=Number(g.offset?.y||0)*100;
  const px=Number(g.pivot?.x??.5)*100;
  const py=Number(g.baseline?.y??.985)*100;
  const ix=Number(g.impactAnchor?.x??.72)*100;
  const iy=Number(g.impactAnchor?.y??.43)*100;
  return `--pc-scale:${scale};--pc-offset-x:${ox}%;--pc-offset-y:${oy}%;--pc-origin-x:${px}%;--pc-origin-y:${py}%;--pc-impact-x:${ix}%;--pc-impact-y:${iy}%;`;
}
function playerPoseMarkup(visual=PLAYER_COMBAT_VISUAL){
  const poses=visual.poses||PLAYER_POSES;
  const entries=[['idle',poses.idle],['cast',poses.cast],['attack',poses.attack],['hit',poses.hit],['ultimate',poses.ultimate],['defeat',poses.defeat]].filter(([,src])=>src);
  return `<div class="huntv2-player-pose-set" data-facing="right">${entries.map(([pose,src],i)=>`<img class="huntv2-player-art huntv2-player-pose pose-${pose}" data-player-pose="${pose}" src="${esc(src)}" alt="Tu sĩ · ${pose}" draggable="false" decoding="async" ${i===0?'fetchpriority="high"':'fetchpriority="low"'}>`).join('')}</div>`;
}
const ENV_ASSETS={water:'/assets/huntv2/backgrounds/water.webp',fire:'/assets/huntv2/backgrounds/fire.webp',wood:'/assets/huntv2/backgrounds/wood.webp',metal:'/assets/huntv2/backgrounds/metal.webp',earth:'/assets/huntv2/backgrounds/earth.webp'};

const BEAST_ASSETS={
  waterDragon:'/assets/huntv2/beasts/water-dragon.png',
  firePhoenix:'/assets/huntv2/beasts/fire-phoenix.png',
  thunderWolf:'/assets/huntv2/beasts/thunder-wolf.png',
  woodStag:'/assets/huntv2/beasts/wood-stag.png',
  whiteTiger:'/assets/huntv2/beasts/white-tiger.png',
  earthQilin:'/assets/huntv2/beasts/earth-qilin.png',
  iceTortoise:'/assets/huntv2/beasts/ice-tortoise.png',
  windPhoenix:'/assets/huntv2/beasts/wind-phoenix.png',
  darkFox:'/assets/huntv2/beasts/dark-fox.png',
  lightLion:'/assets/huntv2/beasts/light-lion.png',
};

function norm(...parts){
  return parts.flat().filter(Boolean).join(' ').toLowerCase();
}

function canonicalElement(raw=''){
  const x=String(raw||'').toLowerCase();
  if(/water|thủy|ice|băng/.test(x))return 'water';
  if(/fire|hỏa|viêm/.test(x))return 'fire';
  if(/wood|mộc|lightning|lôi|wind|phong/.test(x))return 'wood';
  if(/metal|kim|light|quang|minh/.test(x))return 'metal';
  if(/earth|thổ|địa|stone|nham/.test(x))return 'earth';
  return '';
}

const ELEMENT_META={
  water:{icon:'◉',label:'THỦY VỰC',short:'Thủy'},
  fire:{icon:'✹',label:'HỎA VỰC',short:'Hỏa'},
  wood:{icon:'❧',label:'MỘC VỰC',short:'Mộc'},
  metal:{icon:'◆',label:'KIM VỰC',short:'Kim'},
  earth:{icon:'▲',label:'THỔ VỰC',short:'Thổ'},
};
function elementMeta(env='earth'){return ELEMENT_META[env]||ELEMENT_META.earth;}
function environmentParticles(){return Array.from({length:10},(_,i)=>`<i style="--p:${i}"></i>`).join('');}

function monsterElement(monster={},map={}){
  const primary=canonicalElement(map?.primaryElement);
  if(primary)return primary;
  for(const x of (monster.elements||[])){const e=canonicalElement(x);if(e)return e;}
  const raw=norm(monster.elementMatchup,monster.name,map.name,map.zoneName);
  return canonicalElement(raw)||'earth';
}

function monsterFamily(monster={}){
  const raw=norm(monster.tags||[],monster.name,monster.grade,monster.elements||[],monster.elementMatchup);
  const elem=monsterElement(monster);
  // Backend tags are authoritative. Name matching remains only for older saves/servers.
  if(/dragon|bosslike|giao long|cổ giao|long ảnh/.test(raw))return 'waterDragon';
  if(/speed|hắc phong lang|thôn nguyệt lang|thanh nha yêu lang|wolf|lang/.test(raw)){
    return /hắc phong|thôn nguyệt|dark|u minh/.test(raw)?'darkFox':'thunderWolf';
  }
  if(/poison|u minh xà|xích lân|huyền độc|serpent|xà|mãng/.test(raw)){
    return /u minh|huyền độc|poison/.test(raw)?'darkFox':'waterDragon';
  }
  if(/construct|defense|thạch khôi|huyền thiết|địa mạch|golem|khôi/.test(raw)){
    if(/huyền thiết|metal|kim/.test(raw))return 'whiteTiger';
    if(/địa mạch|earth|thổ/.test(raw))return 'earthQilin';
    return 'iceTortoise';
  }
  if(/spirit|element|linh hỏa|âm phong|lôi quang/.test(raw)){
    if(/linh hỏa|fire|hỏa/.test(raw))return 'firePhoenix';
    if(/lôi quang|lightning|lôi/.test(raw))return 'thunderWolf';
    if(/âm phong|wind|phong/.test(raw))return 'windPhoenix';
    return ({water:'waterDragon',wood:'woodStag',metal:'lightLion',earth:'earthQilin'})[elem]||'windPhoenix';
  }
  if(/demon|control|huyết sát|vô diện|cổ ma|ma|yêu/.test(raw)){
    if(/huyết|fire|hỏa/.test(raw))return 'firePhoenix';
    return 'darkFox';
  }
  // Fallback for content not yet carrying tags.
  if(/phượng|phoenix/.test(raw))return elem==='fire'?'firePhoenix':'windPhoenix';
  if(/hổ|tiger/.test(raw))return 'whiteTiger';
  if(/kỳ lân|qilin|kirin/.test(raw))return 'earthQilin';
  if(/quy|tortoise|rùa/.test(raw))return 'iceTortoise';
  if(/hươu|lộc|stag|deer/.test(raw))return 'woodStag';
  if(/hồ ly|fox|kitsune/.test(raw))return 'darkFox';
  if(/sư tử|lion/.test(raw))return 'lightLion';
  return ({water:'waterDragon',fire:'firePhoenix',wood:'woodStag',metal:'whiteTiger',earth:'earthQilin'})[elem]||'earthQilin';
}

function monsterAsset(monster={}){
  return BEAST_ASSETS[monsterFamily(monster)]||BEAST_ASSETS.earthQilin;
}

function stageEnv(monster={},map={}){
  // Bí cảnh follows the backend's primary Ngũ Hành. Monster species never overrides the realm.
  return monsterElement(monster,map);
}

function environmentAsset(monster={},map={}){
  return ENV_ASSETS[stageEnv(monster,map)]||ENV_ASSETS.earth;
}

function enemyPortrait(monster={}){
  const src=monsterAsset(monster);
  return `<img src="${esc(src)}" alt="${esc(monster.name||'Yêu thú')}">`;
}

function beastArt(monster={}){
  const src=monsterAsset(monster);
  const family=monsterFamily(monster);
  return `<div class="huntv2-beast-wrap family-${esc(family)}"><img class="huntv2-beast-art" src="${esc(src)}" alt="${esc(monster.name||'Yêu thú')}"></div>`;
}

function makeActor(side,monster={},opts={}){
  if(side==='player'){
    const visual=opts?.playerVisual||PLAYER_COMBAT_VISUAL;
    return `<div class="huntv2-actor player state-idle" data-huntv2-actor="player" data-combat-actor-id="player" data-combat-actor-slot="player.primary" data-character-id="${esc(visual.characterId||'')}" data-asset-state="${esc(visual.assetState||'production')}" style="${esc(playerGeometryStyle(visual))}">
      <div class="huntv2-aura"></div><div class="huntv2-ground-seal"></div>
      <div class="huntv2-shadow cultivator cultivator-art-host">
        ${playerPoseMarkup(visual)}
        <div class="huntv2-sword-sweep" aria-hidden="true"><i></i><i></i><em></em></div>
      </div>
      <div class="huntv2-status-fx-layer" data-status-fx-layer="player"></div><div class="huntv2-cast-ring"></div><div class="huntv2-hit-flash"></div>
    </div>`;
  }
  return `<div class="huntv2-actor enemy ${opts?.boss?'boss huntv2-boss-visual ':''}state-idle family-${esc(monsterFamily(monster))}" data-huntv2-actor="enemy" data-combat-actor-id="enemy" data-combat-actor-slot="enemy.primary">
    <div class="huntv2-aura"></div><div class="huntv2-ground-seal"></div><div class="huntv2-shadow beast beast-art-host">${beastArt(monster)}</div>
    <div class="huntv2-status-fx-layer" data-status-fx-layer="enemy"></div><div class="huntv2-cast-ring"></div><div class="huntv2-hit-flash"></div>
  </div>`;
}

function combatDockSkills(skills=[],activeCapacity=5){
  const source=skills.filter(Boolean);
  const cap=Math.max(1,Math.min(5,Number(activeCapacity)||1));
  const ultimate=source.find(s=>s?.slot==='ultimate'||s?.runtimeV117?.slotClass==='ultimate'||/tuyệt kỹ|ultimate/i.test([s?.name,...(s?.tags||[])].join(' ')))||null;
  const basic=source.find(s=>s?.slot==='basic'||s?.runtimeV117?.slotClass==='basic')||null;
  if(!basic){const regular=source.filter(s=>s!==ultimate).slice(0,cap+1);while(regular.length<cap+1)regular.push(null);return [...regular,ultimate];}
  const actives=source.filter(s=>s!==basic&&s!==ultimate).slice(0,cap);
  while(actives.length<cap)actives.push(null);
  return [basic,...actives,ultimate];
}

function compactSkillVisibleIndices(dock=[]){
  if(!dock.length)return new Set();
  // Auto Combat must expose the whole production loadout: Basic + every learned Active + Ultimate.
  // Only empty/future slots stay hidden. Icons remain read-only and open detail on tap.
  return new Set(dock.map((skill,index)=>skill?index:-1).filter(index=>index>=0));
}

function skillDock(skills=[],skillArt,{committed=false,spiritAvailable=Infinity,activeCapacity=5}={}){
  const dock=combatDockSkills(skills,activeCapacity);
  const compactVisible=compactSkillVisibleIndices(dock);
  return dock.map((skill,index)=>{
    const ultimate=index===dock.length-1;
    const compactClass=compactVisible.has(index)?'compact-visible':'compact-secondary';
    if(!skill){
      const sealed=!committed;
      const label=ultimate?'Tuyệt Kỹ':sealed?'Định Đạo':'Chưa mở';
      const aria=ultimate?'Chưa học Tuyệt Kỹ':sealed?'Kỹ năng Bản Đạo mở sau khi Định Đạo':`Ô kỹ năng ${index+1} chưa mở`;
      const metaLeft=sealed?'Trúc Cơ':ultimate?'Chưa học':'Kỹ Năng';
      const glyph=ultimate?'✦':sealed?'◇':'⌁';
      return `<button class="huntv2-skill ${compactClass} ${ultimate?'ultimate ':''}empty ${sealed?'sealed':''}" disabled aria-label="${aria}"><span class="huntv2-skill-art"><i>${glyph}</i></span><small>${label}</small><span class="huntv2-skill-meta"><b>${metaLeft}</b><em>${sealed?'Định Đạo':'—'}</em></span></button>`;
    }
    const art=skillArt?.(skill,index)||'';
    const kind=skillKind(skill);
    const role=skillRole(skill);
    const cd=Math.max(0,Number(skill.cooldown||0));
    const cost=Math.max(0,Number(skill.spiritCost||0));
    const lowSpirit=Number.isFinite(Number(spiritAvailable))&&cost>Number(spiritAvailable);
    return `<button class="huntv2-skill ${compactClass} ${ultimate?'ultimate ':''}filled ${lowSpirit?'low-cn':'ready'} kind-${kind} role-${role.key}" data-huntv2-skill="${index}" data-huntv2-skill-id="${esc(skill.id||'')}" data-huntv2-skill-name="${esc(skill.name)}" data-huntv2-skill-kind="${kind}" data-huntv2-skill-element="${visualElement(skill)}" aria-label="${esc(skill.name)}. Chạm để xem chi tiết; chiến đấu thật do Auto Combat và backend quyết định.">
      <span class="huntv2-skill-art">${art?`<img src="${esc(art)}" alt="">`:`<i>${elementGlyph(skill)}</i>`}<span class="huntv2-skill-role">${role.label}</span><span class="huntv2-ult-ready">SẴN SÀNG</span><u class="huntv2-cooldown" style="--cd:0"><b data-cd-text></b></u><span class="huntv2-skill-lock" aria-hidden="true">⌑</span><span class="huntv2-cn-low" aria-hidden="true">◆</span></span>
      <small>${esc(skill.name)}</small>
      <span class="huntv2-skill-meta"><b>${cd?`${fmt(cd,1)}s`:'0s'}</b><em>${cost?`${fmt(cost)} CN`:'0 CN'}</em></span>
    </button>`;
  }).join('');
}


function floorSheetBody(h={},map={},maps=[]){
  const selected=Math.max(1,Number(h.selectedFloor)||1);
  const zoneFloor=Math.max(1,Number(h.currentZoneFloor||map.zoneFloor)||1);
  const zoneStart=selected-zoneFloor+1;
  const zoneMeta=maps.find(x=>Number(x.zone)===Number(map.zone));
  const highest=Math.max(1,Math.min(100,Number(zoneMeta?.progressFloor)||zoneFloor));
  const clearedGlobal=Math.max(0,Number(h.highestClearedFloor)||0);
  const farm=h.farm||{};
  const options=Array.from({length:highest},(_,i)=>{
    const local=i+1,absolute=zoneStart+i,cleared=absolute<=clearedGlobal;
    const suffix=absolute===selected?' · đang chọn':cleared?' · đã hạ Boss · có thể farm':' · Boss';
    return `<option value="${absolute}" ${absolute===selected?'selected':''}>Tầng ${local}${suffix}</option>`;
  }).join('');
  const quick=[1,10,20,40,60,80,100,Math.max(1,zoneFloor-10),Math.max(1,zoneFloor-5),Math.max(1,zoneFloor-1),zoneFloor,Math.min(highest,zoneFloor+1),highest]
    .filter((x,i,a)=>x>=1&&x<=highest&&a.indexOf(x)===i).sort((a,b)=>a-b)
    .map(local=>`<button class="huntv2-floor-quick ${local===zoneFloor?'active':''}" data-map-floor="${zoneStart+local-1}">${local}</button>`).join('');
  const farmStats=farm.available?`<div class="huntv2-farm-stats"><strong>Bãi Săn Ảo · T${((Number(farm.floor)||1)-1)%100+1}</strong><span>~${fmt(farm.killsPerHour||0,0)} quái/giờ</span><span>${fmt(farm.secondsPerKill||0,1)}s/quái</span><span>~${fmt(farm.spiritStonesPerHour||0,0)} Linh Thạch/giờ</span><span>~${fmt(farm.demonCoresPerHour||0,1)} Yêu Đan/giờ</span><span>~${fmt(farm.equipmentRollsPerHour||0,2)} lượt đồ/giờ</span></div>`:`<div class="huntv2-farm-stats"><strong>Chưa có bãi Săn Ảo</strong><span>Hạ Boss tầng đầu tiên để mở.</span></div>`;
  const bossStats=h.currentFloorStats?`<div class="huntv2-farm-stats"><strong>Thống kê Boss tầng ${h.currentFloorStats.floor}</strong><span>Thắng ${fmt(h.currentFloorStats.winRatePct,0)}%</span><span>${fmt(h.currentFloorStats.avgBattleSeconds,1)}s/trận</span><span>Linh Thạch/trận ~${fmt((h.currentFloorStats.spiritStonesPerMinute||0)*(h.currentFloorStats.avgBattleSeconds||0)/60,1)}</span></div>`:'';
  return `<div class="huntv2-floor-sheet">
    <div class="huntv2-floor-sheet-head"><div><small>${esc(map.realmName||'Bí Cảnh')}</small><strong>${esc(map.zoneName||'Vực')} · tầng ${zoneFloor}/100</strong></div><b>Mở tới ${highest}</b></div>
    <div class="huntv2-floor-select-row"><select name="floorSelect">${options}</select><button data-select-floor>Chọn tầng</button></div>
    <div class="huntv2-floor-quick-grid">${quick}</div>
    <div class="huntv2-farm-mode"><div><strong>1 tầng = 1 Boss thật</strong><span>${h.autoAdvance!==false?'Thắng Boss tự chọn cửa ải kế':'Giữ cửa ải đang chọn'}</span></div><select name="autoAdvance"><option value="1" ${h.autoAdvance!==false?'selected':''}>Chọn Boss kế</option><option value="0" ${h.autoAdvance===false?'selected':''}>Giữ lựa chọn</option></select><button data-auto-advance>Áp dụng</button></div>
    ${farmStats}${bossStats}
    <div class="huntv2-reward-efficiency tone-good"><div><strong>DPS build quyết định tốc độ Săn Ảo</strong><span>${farm.available?(farm.capped?'Đã chạm cap 2s/quái':`${fmt(farm.secondsPerKill||0,1)} giây/quái`):'Chưa có dữ liệu farm'}</span></div><small>Tầng cao hơn có quái dày HP hơn; build mạnh giết nhanh hơn nên nhận nhiều Linh Thạch, Yêu Đan và lượt rơi đồ mỗi giờ. Backend chỉ resolve batch, không đánh từng quái.</small></div>
    <p class="small muted">Chọn một tầng đã hạ Boss để đổi bãi farm. Chọn tầng chưa hạ để chuẩn bị Vượt Ải. Thua Boss không làm mất bãi săn cũ. Tu Luyện vẫn chạy 100% song song.</p>
  </div>`;
}

function devSandboxMarkup(ctx={}){
  if(!ctx?.helpers?.devMode)return '';
  const model=ctx.model||{};
  const order=Number(model?.overview?.life?.realmOrder||10);
  const currentDao=String(model?.specialization?.mainDaoId||'sword');
  const boss=Boolean(model?.endlessHunt?.bossReady);
  const realms=[[10,'Trúc Cơ'],[18,'Kim Đan'],[22,'Nguyên Anh'],[26,'Hóa Thần'],[34,'Hợp Thể'],[46,'Nhân Tiên'],[62,'Huyền Tiên · đủ Tuyệt Kỹ']];
  const daos=[['sword','Kiếm'],['fist','Quyền'],['body','Thể'],['spell','Pháp'],['poison','Độc'],['artifact','Ngự Khí'],['formation','Trận'],['mind','Thần Niệm']];
  return `<aside class="huntv2-dev-sandbox" data-dev-sandbox>
    <button class="huntv2-dev-tab" type="button" data-dev-toggle>DEV</button>
    <div class="huntv2-dev-panel">
      <div class="huntv2-dev-head"><div><b>Combat QA</b><small>RAM only · cùng backend production · không ghi save</small></div><span>v9</span></div>
      <div class="huntv2-dev-autotour">
        <strong>QUAY 1 VIDEO · AUTO QA TOÀN BỘ</strong>
        <p>Tự chạy 8 Đạo + HUD/resource/Ultimate + Phá Thế/Thất Thế + status/Ấn + phase/telegraph + pose + FX + trận backend thật/replay. Khoảng 65–80 giây.</p>
        <button class="huntv2-dev-primary" type="button" data-dev-auto-tour>▶ CHẠY TOÀN BỘ COMBAT QA</button>
      </div>
      <details class="huntv2-dev-advanced"><summary>Điều khiển thủ công / debug nâng cao</summary><div class="huntv2-dev-advanced-body">
      <label><span>Cảnh giới</span><select name="devRealm">${realms.map(([v,n])=>`<option value="${v}" ${order===v?'selected':''}>${n} · ${v}</option>`).join('')}</select></label>
      <label><span>Bản Đạo</span><select name="devDao">${daos.map(([v,n])=>`<option value="${v}" ${currentDao===v?'selected':''}>${n}</option>`).join('')}</select></label>
      <div class="huntv2-dev-dao-quick">${daos.map(([v,n])=>`<button type="button" data-dev-dao-quick="${v}" class="${currentDao===v?'active':''}">${n}</button>`).join('')}</div>
      <label class="huntv2-dev-check"><input type="checkbox" name="devBoss" ${boss?'checked':''}><span>Ép Boss thật ở tầng test</span></label>
      <div class="huntv2-dev-actions"><button type="button" data-dev-sync>↻ Đồng bộ game thật</button><button class="huntv2-dev-primary" type="button" data-dev-apply>Áp preset test</button></div>
      <div class="huntv2-dev-section huntv2-dev-hud"><strong>Combat State Matrix · presentation-only</strong>
        <span class="huntv2-dev-matrix-label">PLAYER</span><div class="huntv2-dev-grid two"><button data-dev-hud="player-full">HP/CN 100%</button><button data-dev-hud="player-low">Low HP + CN</button><button data-dev-hud="player-shield">Shield</button><button data-dev-hud="player-5buff">5 Buff</button><button data-dev-hud="player-5debuff">5 Debuff</button><button data-dev-hud="resources">50% tài nguyên</button><button data-dev-hud="ultimate">Tuyệt Kỹ 100</button></div>
        <span class="huntv2-dev-matrix-label">BOSS</span><div class="huntv2-dev-grid two"><button data-dev-hud="boss-normal">Normal</button><button data-dev-hud="break70">Phá Thế 70</button><button data-dev-hud="broken">Thất Thế</button><button data-dev-hud="stable">Ổn Thế</button><button data-dev-hud="boss-p2">Phase II</button><button data-dev-hud="boss-p3">Phase III</button><button data-dev-hud="telegraph">Cast thường</button><button data-dev-hud="telegraph-lethal">Đại sát</button><button data-dev-hud="boss-5debuff">5 Debuff</button><button data-dev-hud="boss-mark6">Ấn 6 stack</button><button data-dev-hud="counter">Cửa phản công</button></div>
        <span class="huntv2-dev-matrix-label">STRESS</span><div class="huntv2-dev-grid two"><button data-dev-hud="stress">Full HUD stress</button><button data-dev-hud="clear">Reset HUD</button></div>
        <p>Các nút trên chỉ ép presentation để soi layout. “Đánh 1 trận” bên dưới vẫn dùng combat events thật từ backend.</p></div>
      <div class="huntv2-dev-section huntv2-dev-showcase" data-dev-showcase-panel>
        <strong>Visual Showcase · 6 scene + shake</strong>
        <div class="huntv2-dev-grid two">
          <button data-dev-showcase="scene-01-clean">01 · Clean</button>
          <button data-dev-showcase="scene-02-status-stress">02 · Status stress</button>
          <button data-dev-showcase="scene-03-skill-cast">03 · 7 skill cast</button>
          <button data-dev-showcase="scene-04-damage-stress">04 · Damage</button>
          <button data-dev-showcase="scene-05-boss-break">05 · Boss break</button>
          <button data-dev-showcase="scene-06-full-chaos">06 · Full chaos</button>
        </div>
        <div class="huntv2-dev-grid two">
          <button data-dev-showcase-shake="light">Shake light</button>
          <button data-dev-showcase-shake="heavy">Shake heavy</button>
          <button data-dev-showcase-shake="critical">Shake crit</button>
          <button data-dev-showcase-shake="ultimate">Shake ultimate</button>
          <button data-dev-showcase-shake="boss">Shake boss</button>
          <button data-dev-showcase="scene-05-boss-break-recovery">Break recovery</button>
        </div>
        <p>Chỉ ép lớp trình bày trong DEV showcase; skill list và asset lấy từ runtime hiện tại.</p>
      </div>
      <div class="huntv2-dev-section"><strong>Pose player</strong><div class="huntv2-dev-grid"><button data-dev-pose="idle">Idle</button><button data-dev-pose="cast">Cast</button><button data-dev-pose="attack">Attack</button><button data-dev-pose="hit">Hit</button><button data-dev-pose="ultimate">Ultimate</button><button data-dev-pose="defeat">Defeat</button></div><button data-dev-sequence type="button">▶ Chạy 6 pose</button></div>
      <div class="huntv2-dev-section"><strong>State boss · 1 ảnh gốc</strong><div class="huntv2-dev-grid"><button data-dev-boss-state="idle">Idle</button><button data-dev-boss-state="attack">Attack</button><button data-dev-boss-state="cast">Cast</button><button data-dev-boss-state="hit">Hit</button><button data-dev-boss-state="phase2">P2</button><button data-dev-boss-state="phase3">P3</button><button data-dev-boss-state="defeat">Defeat</button></div><button data-dev-boss-sequence type="button">▶ Chạy 7 state boss</button></div>
      <div class="huntv2-dev-section"><strong>FX production · 5 primitive</strong><div class="huntv2-dev-grid"><button data-dev-fx="cast">Cast</button><button data-dev-fx="travel">Travel</button><button data-dev-fx="impact">Impact</button><button data-dev-fx="field">Field</button><button data-dev-fx="ultimate">Ultimate</button></div><button data-dev-fx-sequence type="button">▶ Chạy 5 FX</button></div>
      <div class="huntv2-dev-section huntv2-dev-golden"><strong>Golden Combat · Kiếm G1</strong><p>8 giây choreography DEV: Kiếm Khí → Lưu Quang → Phá Vọng → Liên Kiếm → Thái Hư Kiếm Vực.</p><button class="huntv2-dev-primary" data-dev-golden-sword type="button">★ Chạy Golden Kiếm G1</button></div>
      <div class="huntv2-dev-section huntv2-dev-golden"><strong>Golden Combat · Kiếm G2</strong><p>Quality pass DEV: pose blend + hit-stop + Kiếm Khí pulse + 5 skill signature + Ultimate.</p><button class="huntv2-dev-primary" data-dev-golden-sword-g2 type="button">✦ Chạy Golden Kiếm G2</button></div>
      <div class="huntv2-dev-section"><strong>Combat thật</strong><div class="huntv2-dev-grid two"><button data-dev-fight type="button">⚔ Đánh 1 trận</button><button data-dev-replay-fight type="button">▶ Replay trận cuối</button><button data-dev-open-skills type="button">★ Màn Kỹ Năng</button></div></div>
      <p>DEV dùng cùng renderer + backend với game thật. “Đồng bộ game thật” nạp save production vào bản sao RAM; preset chỉ thay state test, không ghi save.</p>
      </div></details>
    </div>
  </aside>
    <div class="huntv2-dev-tour-hud" data-dev-tour-hud hidden><div><strong data-dev-tour-title>AUTO QA</strong><span data-dev-tour-step>Chuẩn bị…</span></div><i><em data-dev-tour-progress></em></i><button type="button" data-dev-tour-stop aria-label="Dừng Auto QA">■</button></div>`;
}

export function renderHuntCombatV2(ctx){
  const {model,live,helpers={}}=ctx;
  const h=model?.endlessHunt||{};
  const challenge=h.monster||{};
  const farmView=h.farm||{};
  const auto=Boolean(live?.autoCombat??(live?.mode==='hunt'));
  const m=auto&&farmView.available?{id:`virtual-farm.${farmView.floor}`,name:farmView.mobName||'Yêu thú',grade:'Thường',gradeId:'common',floor:farmView.floor,level:farmView.mobLevel||1,tags:[...(farmView.mobTags||[]),'VirtualFarmV77'],elements:[...(farmView.mobElements||[])],hp:farmView.mobHp||'—',attack:'—',defense:'—',power:'—',fortuneBonusPct:0,rewards:{cultivationPct:0,spiritStonesHint:`~${fmt(farmView.spiritStonesPerHour||0,0)}/giờ`,equipmentChancePct:farmView.equipmentChancePct||0,cultivationPillChancePct:0}}:challenge;
  const map=h.currentMap||{};
  const o=model?.overview||{};
  const locked=Number(o?.life?.realmOrder||0)<1;
  const selectedMajor=(map.majorRealmIndex||h.currentMajorRealmIndex||1);
  const maps=(h.availableMaps||[]).filter(x=>x.majorRealmIndex===selectedMajor);
  const activeSkills=(model?.character?.knownSkills||[]).filter(x=>x.active);
  const specialization=model?.specialization||{};
  const committed=Boolean(specialization?.mainDaoId&&specialization?.daoNatureId);
  const activeSlotsUnlocked=Math.max(1,Math.min(5,Number(specialization?.activeSlotsUnlocked)||1));
  const dockSkills=combatDockSkills(activeSkills,activeSlotsUnlocked);
  const combatStats=model?.character?.combatStats||{};
  const daoHud=daoHudMeta(model,activeSkills);
  const challengeFloor=h.currentZoneFloor||map.zoneFloor||1;
  const zone=auto&&farmView.available?(farmView.zoneName||map.zoneName||'Phàm Vực'):(map.zoneName||'Phàm Vực');
  const realm=h.currentMajorRealmName||map.realmName||'Bí Cảnh';
  const floor=auto&&farmView.available?(((Number(farmView.floor)||1)-1)%100+1):challengeFloor;
  const playerPower=h.playerPower||o?.build?.score||0;
  const enemyPower=m.power||0;
  const enemyHp=100;
  const boss=m.gradeId==='boss';
  const sheet=helpers.sheet||((id,title,body)=>`<section class="v106-sheet" data-sheet-panel="${esc(id)}"><div class="v106-sheet-head"><h2>${esc(title)}</h2><button class="v106-close" data-sheet-close>×</button></div><div class="v106-sheet-body">${body}</div></section>`);
  const more=helpers.moreSheet?.()||'';
  const metric=helpers.metric||((a,b)=>`<div class="metric-row"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`);
  const tag=helpers.tag||((x)=>`<span class="tag">${esc(x)}</span>`);
  const localize=helpers.localize||((x)=>x);
  const skillArt=helpers.skillArt;
  const skillSheets=dockSkills.map((skill,index)=>{
    if(!skill)return '';
    const mechanics=(skill.mechanics||[]).filter(Boolean);
    const role=skillRole(skill);
    const body=`<div class="huntv2-sheet-skill">${skillArt?.(skill,index)?`<img src="${esc(skillArt(skill,index))}" alt="">`:''}<div><strong>${esc(skill.name)}</strong><span>${esc(role.label)} · ${esc((skill.tags||[]).map(localize).join(' · '))}</span></div></div><p>${esc(skill.description||'')}</p><div class="huntv2-skill-truth-note"><b>Auto Combat thật</b><span>Chạm skill để đọc; nút này không giả thi triển. Backend tự chọn chiêu theo loadout, cooldown, Chân Nguyên và resource Bản Đạo.</span></div>${mechanics.length?`<div class="huntv2-mechanic-list"><strong>Cách hoạt động</strong>${mechanics.map(line=>`<div><i>◆</i><span>${esc(line)}</span></div>`).join('')}</div>`:''}<div class="huntv2-skill-detail-metrics">${metric('Vai trò',role.label)}${metric('Sát thương',Number(skill.damageCoefficientPct||0)>0?`${fmt(skill.damageCoefficientPct,0)}% Công Lực`:'Utility')}${metric('Phá Thế',Number(skill.breakDamagePct||0)>0?`${fmt(skill.breakDamagePct,0)}%`:'—')}${metric('CN chuẩn',`${fmt(skill.spiritCostStandardPct??skill.spiritCost??0,1)}%`)}${metric('Hồi chiêu',`${fmt(skill.cooldown||0,1)}s`)}${metric('Thi triển / Thu chiêu',`${fmt(skill.castTime||skill.castTimeSeconds||0,1)}s / ${fmt(skill.recoveryTime||skill.recoveryTimeSeconds||0,1)}s`)}</div>`;
    return sheet(`hunt-skill-${index}`,skill.name,body).replace('class="v106-sheet"','class="v106-sheet huntv2-skill-sheet"');
  }).join('');
  const mapBody=maps.length?`<div class="v1086-map-list">${maps.map(x=>`<button class="${x.selected?'active':''} ${x.unlocked?'':'locked'}" data-map-floor="${x.floor}" ${x.unlocked?'':'disabled'}><i>${x.unlocked?'◆':'◇'}</i><div><strong>${esc(x.zoneName)}</strong><span>${x.unlocked?`Đã tới tầng ${x.progressFloor||1}/100`:'Chưa mở'}</span></div><b>${x.selected?'Đang ở':'Đi đến'}</b></button>`).join('')}</div>`:'<div class="v1086-empty-state"><i>⌖</i><strong>Chưa mở Bí Cảnh</strong><span>Thăng Cảnh tới Luyện Khí để bắt đầu Săn Yêu.</span></div>';
  const production=h.productionV110||{};
  const bossIntel=production.boss||{};
  const farmIntel=production.farm||{};
  const bossRoleLabels={Sustain:'Hồi phục',Barrier:'Hộ thể',Enrage:'Đại sát',Setup:'Tụ thế',Burst:'Bộc phát',Break:'Phá thế',Execute:'Kết liễu',Control:'Khống chế'};
  const bossSkills=(m.bossMechanic?.skills||[]).slice(0,3);
  const bossCounterHint=String(m.bossMechanic?.counterHint||'')
    .replace('Cấm Hồi/Anti-Heal','Cấm Hồi')
    .replace('Burst/Execute','Bộc Phát/Kết Liễu')
    .replace('Phá Thế/Heavy','Phá Thế/Trọng Kích')
    .replace('Burst/Finisher','Bộc Phát/Kết Liễu')
    .replace('Barrier/Counter/Sustain','Hộ Thể/Phản Kích/Hồi Phục')
    .replace('Control/Interrupt','Khống Chế/Ngắt Chiêu');
  const bossSkillRows=bossSkills.map((skill,index)=>`<div class="huntv2-monster-skill"><i>${index+1}</i><div><strong>${esc(skill.name||`Chiêu ${index+1}`)}</strong><span>${esc([bossRoleLabels[skill.role]||skill.role,skill.effect].filter(Boolean).join(' · '))}</span></div></div>`).join('');
  const farmRecommendationRows=(farmIntel.recommendations||[]).map(row=>`<div class="v110-farm-rec"><div><small>${esc(row.label)}</small><strong>${esc(row.zoneName||'Bí Cảnh')} · T${((Number(row.floor)||1)-1)%100+1}</strong><span>${esc(row.description||'')}</span></div><b>${row.id==='killsPerHour'?`${fmt(row.value,0)}/h`:row.id==='spiritStonesPerHour'?`${fmt(row.value,0)} LT/h`:`${fmt(row.value,2)} lượt/h`}</b></div>`).join('');
  const loot=(farmView.available
    ?`<div class="v1086-loot-grid">${metric('Tu Luyện','100% song song')}${metric('Yêu thú',`~${fmt(farmView.killsPerHour||0,0)}/giờ`)}${metric('Linh Thạch',`~${fmt(farmView.spiritStonesPerHour||0,0)}/giờ`)}${metric('Yêu Đan',`~${fmt(farmView.demonCoresPerHour||0,1)}/giờ`)}${metric('Trang bị',`~${fmt(farmView.equipmentRollsPerHour||0,2)} lượt/giờ`)}${metric('Tinh Anh',`~${fmt(farmView.elitePerHour||0,2)}/giờ`)}</div><p class="small muted">Số trên là kỳ vọng theo DPS thật của build. Backend gom kết quả thành batch; quái nhỏ trên màn hình chỉ là presentation và không tự tạo phần thưởng.</p>`
    :`<div class="v1086-loot-grid">${metric('Boss tầng',`T${challengeFloor}`)}${metric('Tu Luyện','100% song song')}${metric('Linh Thạch',challenge.rewards?.spiritStonesHint||'—')}${metric('Trang bị',`${fmt(challenge.rewards?.equipmentChancePct||0,2)}%`)}</div><p class="small muted">Hạ Boss để mở bãi Săn Ảo đầu tiên.</p>`)+`${farmRecommendationRows?`<div class="v110-farm-recommendations"><header><strong>Gợi ý bãi săn theo build hiện tại</strong><span>So trên các tầng mốc đã mở · không tự đổi tầng</span></header>${farmRecommendationRows}</div>`:''}`;
  const monsterStats=[['HP',m.hp||'—'],['Công',m.attack||'—'],['Thủ',m.defense||'—']].map(([label,value])=>`<span><small>${esc(label)}</small><b>${esc(value)}</b></span>`).join('');
  const monsterMeta=[m.grade||m.gradeId,`Lv.${m.level||1}`,...(m.elements||[]).slice(0,2).map(localize)].filter(Boolean).join(' · ');
  const monster=`<div class="huntv2-monster-intel ${boss?'boss':''}">
    <header class="huntv2-monster-identity"><small>${boss?`THỦ LĨNH · TẦNG ${challengeFloor}`:'YÊU THÚ HIỆN TẠI'}</small><strong>${esc(m.name||challenge.name||'Yêu thú')}</strong><span>${esc(monsterMeta||'—')}</span></header>
    <div class="huntv2-monster-stats" aria-label="Chỉ số chính">${monsterStats}</div>
    ${boss&&m.bossMechanic?`<section class="huntv2-monster-mechanic"><small>DỊ TƯỢNG</small><strong>${esc(m.bossMechanic.name)}</strong><p>${esc(m.bossMechanic.description||'')}</p>${bossCounterHint?`<span><b>Đối sách</b> · ${esc(bossCounterHint)}</span>`:''}</section>`:''}
    ${bossSkillRows?`<section class="huntv2-monster-skills"><small>KỸ NĂNG CHỦ CHỐT</small>${bossSkillRows}</section>`:''}
    <footer class="huntv2-monster-progression"><span>${boss?`Boss tầng ${challengeFloor}`:'Thông tin mục tiêu'}</span><b>${boss?'Thắng → mở tầng kế':'Theo dõi trực tiếp trên HUD'}</b></footer>
  </div>`;
  const monsterSheet=sheet('monster',boss?'Hồ Sơ Thủ Lĩnh':'Yêu Thú Hiện Tại',monster).replace('class="v106-sheet"','class="v106-sheet huntv2-monster-sheet"');
  const elementIcons=(m.elements||[]).slice(0,3).map(x=>`<i class="element" title="${esc(localize(x))}">${esc(String(localize(x)).slice(0,1))}</i>`).join('')||'<i class="element">Y</i>';
  const env=stageEnv(m,map);
  const envMeta=elementMeta(env);
  const enemyAsset=monsterAsset(m);
  const envAsset=environmentAsset(m,map);
  const selectedFloor=Math.max(1,Number(h.selectedFloor)||1);
  const majorStart=selectedFloor-Math.max(0,Number(h.currentMapLocalFloor||map.localFloor||1)-1);
  const unlockedInMajor=maps.filter(x=>x.unlocked).reduce((max,x)=>Math.max(max,Number(x.floor)||0),majorStart);
  const prevFloor=selectedFloor>majorStart?selectedFloor-1:null;
  const nextFloor=selectedFloor<unlockedInMajor?selectedFloor+1:null;
  const floorSheet=floorSheetBody(h,map,maps);
  const playerName=o?.life?.name||model?.character?.name||'Tu Sĩ';
  const realmLabel=o?.life?.realm||model?.character?.realm||'Đạo cảnh';
  const hpMax=Math.max(1,Number(combatStats.maxHp||0));
  const spiritMax=Math.max(0,Number(combatStats.maxSpirit||0));
  const spiritStones=modelResourceQty(model,'spirit_stone')||modelResourceQty(model,'linh thạch');
  const reincarnationPoints=Number(model?.reincarnation?.cp||0);
  const presentationRegistry=createProductionCombatPresentationRegistry({daoId:daoHud.dao});
  const intelligenceLane=presentationRegistry.renderHudSlot('player-core',{model,live,daoId:daoHud.dao});
  const companionHud=presentationRegistry.renderHudSlot('companion',{model,live,daoId:daoHud.dao});
  const artifactHud=presentationRegistry.renderHudSlot('artifact',{model,live,daoId:daoHud.dao});
  const playerVisual=playerCombatVisual(model);
  const gameplayGuide=specialization?.gameplayGuide||{};

  return `<section class="v107-screen v1086-hunt huntv2-screen huntv2-combat-v8 ${h.bossReady&&!auto?'is-prefight':'is-field'} ${auto?'is-auto':''}" data-combat-ui="combat-v8" data-combat-arch="portrait-target-clean-v8">
    <div class="v107-body huntv2-body">
      <div class="huntv2-stage env-${env}" id="huntV2Stage" data-auto="${auto?'1':'0'}" data-locked="${locked?'1':'0'}" data-env="${env}" data-map-id="${esc(map.id||map.mapId||'')}" data-monster-id="${esc(m.id||'')}" data-monster-name="${esc(m.name||'Yêu thú')}" data-monster-level="${esc(m.level||1)}" data-monster-asset="${esc(enemyAsset)}" data-player-dao="${esc(daoHud.dao||'')}" data-presentation-arch="${COMBAT_PRESENTATION_ARCH_VERSION}">
        <img class="huntv2-bg" src="${esc(envAsset)}" alt="${esc(`Bí Cảnh ${env}`)}"><div class="huntv2-env-overlay" aria-hidden="true"></div>
        <div class="huntv2-atmosphere"><i></i><i></i><i></i><i></i><i></i></div><div class="huntv2-element-weather" aria-hidden="true">${environmentParticles()}</div><div class="huntv2-vignette"></div><div class="huntv2-mist mist-a"></div><div class="huntv2-mist mist-b"></div>
        <div class="huntv2-top-identity">
          <button class="huntv2-combat-exit" type="button" data-tab-jump="dungeons" aria-label="Rời chiến trường về Phiêu Lưu"><i>‹</i><span>Phiêu Lưu</span></button>
          ${expressionPortraitMarkup({expressionId:selectedExpression(model),avatar:playerVisual.portraitPath||PLAYER_PORTRAIT,rig:playerVisual.portraitRig||PLAYER_COMBAT_VISUAL.portraitRig,className:'huntv2-identity-portrait',badge:String(realmLabel).slice(0,1),alt:playerName})}
          <div class="huntv2-identity-copy"><strong>${esc(playerName)}</strong><span>${esc(realmLabel)}${daoHud.daoName?` · ${esc(daoHud.daoName)}`:''}</span><small>CP ${esc(compactStat(playerPower))}</small></div>
        </div>
        <div class="huntv2-resource-row" aria-label="Tài nguyên chính">
          <span title="Linh Thạch"><img src="/assets/v1073/resource-stone.webp" alt=""><b>${esc(compactStat(spiritStones))}</b></span>
          <span title="Điểm Luân Hồi"><img src="/assets/v1073/resource-cp.webp" alt=""><b>${esc(compactStat(reincarnationPoints))}</b></span>
        </div>
        <button class="huntv2-meta-strip" data-sheet-open="floor" aria-label="Thông tin tầng">
          <strong>${esc(zone)}</strong><em>•</em><span>Tầng ${floor}</span><em>•</em><span>${auto&&farmView.available?'SĂN ẢO':h.bossReady?'BOSS':envMeta.short}</span><i>${esc(envMeta.icon)}</i>
        </button>
        <button class="huntv2-help-compact" data-sheet-open="combat-help" aria-label="Giải thích chiến đấu">?</button><button class="huntv2-map-compact" data-sheet-open="map" aria-label="Bản đồ">⌖</button>

        <div class="huntv2-player-hud" data-actor-hud="player" data-hud-zone="player-core">
          <div class="huntv2-player-hud-core">
            <div class="huntv2-player-heading"><strong>${esc(playerName)}</strong></div>
            <div class="huntv2-vital-row"><b>HP</b><div class="huntv2-vital hp" data-max-value="${esc(hpMax)}"><u id="huntv2PlayerHpLag" style="width:100%"></u><i id="huntv2PlayerHp" style="width:100%"></i><em id="huntv2PlayerHpText">${esc(compactStat(hpMax))} / ${esc(compactStat(hpMax))}</em></div></div>
            <div class="huntv2-vital-row"><b>CN</b><div class="huntv2-vital spirit" data-max-value="${esc(spiritMax)}"><i style="width:100%"></i><em>${esc(compactStat(spiritMax))} / ${esc(compactStat(spiritMax))}</em></div></div>
          </div>
        </div>

        <div class="huntv2-quick-controls" aria-label="Điều khiển chiến đấu">
          <button class="huntv2-rail-btn auto ${auto?'active':''}" data-hunt-auto-toggle="${auto?'0':'1'}" aria-pressed="${auto?'true':'false'}" ${locked?'disabled':''}><i>⚔</i><span>Tự Săn</span></button>
          <button class="huntv2-rail-btn fx ${fxPaused?'':'active'}" data-combat-fx-quality data-combat-fx-toggle data-fx-quality="${combatFxQuality}" aria-pressed="${fxPaused?'false':'true'}"><i>✦</i><span>FX ${combatFxQuality==='low'?'Thấp':combatFxQuality==='high'?'Cao':combatFxQuality==='off'?'Tắt':'Chuẩn'}</span></button>
          <button class="huntv2-rail-btn log ${logVisible?'active':''}" data-combat-log-toggle aria-pressed="${logVisible?'true':'false'}"><i>☷</i><span>Nhật Ký</span></button>
        </div>
        ${auto&&farmView.available?`<div class="huntv2-auto-card realtime"><i>⚔</i><span>Săn Ảo T${((Number(farmView.floor)||1)-1)%100+1} · ~${fmt(farmView.killsPerHour||0,0)} yêu thú/giờ</span></div>`:''}

        <div class="huntv2-enemy-hud ${boss?'boss':''}" data-actor-hud="enemy" data-hud-zone="boss-core">
          <div class="huntv2-portrait enemy enemy-art">${enemyPortrait(m)}</div>
          <div class="huntv2-hud-main"><div><strong id="huntv2EnemyName">${esc(m.name||'Yêu thú')}</strong>${boss?'<em class="huntv2-boss-phase" id="huntv2BossPhase" data-phase="1" title="Phase hiện tại của Boss">P1</em>':''}</div><div class="huntv2-hp enemy" data-max-display="${esc(m.hp||'')}"><u id="huntv2EnemyHpLag" style="width:${enemyHp}%"></u><i id="huntv2EnemyHp" style="width:${enemyHp}%"></i><b id="huntv2EnemyHpText">${esc(m.hp||'—')} / ${esc(m.hp||'—')}</b></div><div class="huntv2-poise-row" id="huntv2EnemyPoiseRow" data-poise-help role="button" tabindex="0" aria-label="Xem giải thích Phá Thế" title="Phá Thế: tích đủ 100 để khiến mục tiêu Thất Thế"><b>PHÁ THẾ</b><div class="huntv2-poise"><i id="huntv2EnemyPoise" style="width:0%"></i><em id="huntv2EnemyPoiseText">0/100</em></div></div><div class="huntv2-status-line"><div class="huntv2-element-icons">${elementIcons}</div>${boss&&m.bossMechanic?`<button class="huntv2-boss-trait" type="button" data-sheet-open="monster" title="${esc(m.bossMechanic.description||m.bossMechanic.name)}"><i>⚠</i><span>${esc(m.bossMechanic.name)}</span></button>`:''}</div></div>
          <button class="huntv2-enemy-info" type="button" data-sheet-open="monster" aria-label="${boss?'Xem hồ sơ Boss':'Xem thông tin yêu thú'}">i</button>
        </div>
        <div class="huntv2-status-lanes" data-hud-zone="status" aria-label="Buff và debuff hiện tại"><div class="huntv2-status-tray player" data-status-tray="player">${Number(h.playerInjury||0)>0?`<i class="status debuff injury" data-status-key="persistent:injury" data-priority="3" title="Thương Thế ${fmt(h.playerInjury||0,0)}/100"><b>血</b><em>Thương Thế</em><strong>${fmt(h.playerInjury||0,0)}/100</strong></i>`:''}</div><div class="huntv2-status-tray enemy" data-status-tray="enemy"></div></div>
        <div class="huntv2-enemy-intent" id="huntv2EnemyIntent" aria-live="polite"><i>⚠</i><div><span>ĐỊCH ĐANG VẬN CHIÊU</span><strong></strong><small></small></div><b></b><u><em></em></u></div><div class="huntv2-break-window" id="huntv2BreakWindow" aria-live="polite"><span>THẤT THẾ</span><strong>5</strong><em></em></div>

        <div class="huntv2-arena">
          <div class="huntv2-pixi-host" data-combat-pixi-host aria-hidden="true"></div>
          <div class="huntv2-back-seal"></div>${makeActor('player',{}, {playerVisual})}${makeActor('enemy',m,{boss})}
          <div class="huntv2-vfx-layer" id="huntv2VfxLayer" aria-hidden="true"></div><div class="huntv2-phase-fx" id="huntv2PhaseFx" aria-hidden="true"></div>
          <div class="huntv2-projectile" id="huntv2Projectile"><i></i><em></em></div><div class="huntv2-sword-arc" id="huntv2SwordArc"></div><div class="huntv2-lightning" id="huntv2Lightning"><i></i><i></i><i></i></div><div class="huntv2-impact" id="huntv2Impact"></div><div class="huntv2-screen-flash" id="huntv2ScreenFlash"></div>
          <div class="huntv2-float-layer" id="huntv2FloatLayer" aria-live="polite"></div><div class="huntv2-result-pop" id="huntv2ResultPop"><b></b><span></span></div>
        </div>

        <div class="huntv2-skill-callout" id="huntv2SkillCallout" aria-live="polite"><small></small><strong></strong></div><div class="huntv2-combat-caption" id="huntv2Caption" aria-live="polite"><strong></strong><span></span></div>
        <section class="huntv2-log ${logVisible?'':'hidden'}" id="huntv2Log" aria-label="Nhật ký chiến đấu" aria-hidden="${logVisible?'false':'true'}">
          <button class="huntv2-log-head" data-combat-log-toggle aria-label="Thu gọn nhật ký chiến đấu"><span><i>◉</i> Nhật Ký Chiến Đấu</span><b>⌄</b></button>
          <div class="huntv2-log-body"><div class="huntv2-log-row system">Dữ liệu thắng/thua và phần thưởng do backend quyết định.</div></div>
        </section>
        <div class="huntv2-hud-extension-slots" data-combat-hud-extensions>${companionHud?`<div data-combat-hud-slot="companion">${companionHud}</div>`:''}${artifactHud?`<div data-combat-hud-slot="artifact">${artifactHud}</div>`:''}</div>
        <div class="huntv2-battle-summary" id="huntv2BattleSummary" aria-live="polite"><div class="huntv2-summary-head"><strong>Tổng kết giao phong</strong><span>Combat Intelligence</span></div><div class="huntv2-summary-grid"></div></div>
        ${locked?`<div class="huntv2-lock"><i>◈</i><strong>Săn Yêu mở ở Luyện Khí</strong><span>Có thể xem trước chiến trường; backend chưa cho phép chiến đấu.</span></div>`:''}
      </div>

      <div class="huntv2-console" data-hud-zone="auto-skill">
        ${intelligenceLane}
        <div class="huntv2-skills">${skillDock(activeSkills,skillArt,{committed,spiritAvailable:spiritMax,activeCapacity:activeSlotsUnlocked})}</div>
        <div class="huntv2-action-deck ${committed?'committed':'uncommitted'}">
          <button class="huntv2-fight boss" data-endless-fight ${locked||!h.canFight||!h.bossReady?'disabled':''}><i>⚔</i><div><strong>${locked?'CHƯA MỞ':'KHIÊU CHIẾN BOSS'}</strong><span>${h.canFight===false?esc(h.fightBlocker||'Không thể chiến đấu'):h.bossReady?`${bossIntel.readiness?.label?`${esc(bossIntel.readiness.label)} · `:''}Boss tầng ${challengeFloor} · thắng mở tầng kế`:'Boss tầng này đã hạ'}</span></div></button>
          ${farmView.available
            ?`<button class="huntv2-context-button loot" data-sheet-open="loot"><i>◇</i><div><strong>${auto?'ĐANG SĂN ẢO':'CHIẾN LỢI PHẨM'}</strong><span>T${((Number(farmView.floor)||1)-1)%100+1} · ${fmt(farmView.spiritStonesPerHour||0,0)} Linh Thạch/h · ${fmt(farmView.demonCoresPerHour||0,1)} Yêu Đan/h</span></div></button>`
            :committed
              ?`<button class="huntv2-context-button loot" data-sheet-open="loot"><i>◇</i><div><strong>CHƯA CÓ BÃI SĂN</strong><span>Hạ Boss tầng đầu tiên để mở Săn Ảo</span></div></button>`
              :`<button class="huntv2-context-button dao" data-tab-jump="skills"><i>◇</i><div><strong>CHƯA ĐỊNH ĐẠO</strong><span>Skill Bản Đạo mở từ Trúc Cơ</span></div></button>`}
        </div>
        <section class="huntv2-log-preview ${logVisible?'expanded':''} ${logCompactHidden?'compact-hidden':''}" id="huntv2LogPreview" aria-label="Chiến báo mới nhất">
          <button class="huntv2-log-preview-main" type="button" data-combat-log-toggle aria-label="Mở chiến báo"><span class="huntv2-log-preview-label">CHIẾN BÁO</span><span class="huntv2-log-preview-body"><span class="huntv2-log-row system">Chưa có giao phong mới.</span></span><b>⌃</b></button>
          <button class="huntv2-log-preview-hide" type="button" data-combat-log-hide aria-label="Ẩn chiến báo">×</button>
        </section>
        <button class="huntv2-log-restore ${logCompactHidden?'show':''}" type="button" data-combat-log-show aria-label="Hiện chiến báo"><i>☷</i><span>Chiến báo</span></button>
      </div>
    </div>
    ${skillSheets}${sheet('combat-help','Cách Đọc Trận Đấu',`<div class="huntv2-combat-help"><header><span>${esc(gameplayGuide.loopCode||daoHud.daoName||'AUTO COMBAT')}</span><strong>${esc(gameplayGuide.headline||'Nhìn 4 tín hiệu, không cần đọc nhật ký')}</strong><p>${esc(gameplayGuide.summary||'Backend tự xoay skill; người chơi xây loadout và theo dõi các cửa sổ sức mạnh.')}</p></header><div class="huntv2-help-grid"><article><i>1</i><b>HP / CN</b><span>Sống sót và Chân Nguyên thật. Skill thiếu CN sẽ không được AI dùng.</span></article><article><i>2</i><b>${esc(daoHud.resource)}</b><span>Tài nguyên riêng của Bản Đạo. Khi đầy, meter phát sáng để báo cửa sổ Xả.</span></article><article><i>3</i><b>Phá Thế</b><span>Bào tới 100 → Thất Thế 5 giây. Đồng hồ vàng hiện đúng cửa sổ burst; sau đó mục tiêu vào Ổn Thế.</span></article><article><i>4</i><b>Tuyệt Kỹ</b><span>Thanh đạt 100 thì ô U báo Sẵn sàng. Tuyệt Kỹ vẫn do Auto Combat/backend thi triển đúng điều kiện.</span></article></div><div class="huntv2-help-rule"><b>Skill bar là thông tin, không phải nút cast giả.</b><span>Chạm icon để xem hệ số, Phá Thế, CN chuẩn, CD và vai trò TÍCH / PHÁ / XẢ. DEV Sandbox mới cho phép test FX thủ công.</span></div><div class="huntv2-help-rule"><b>Buff/Debuff</b><span>Chỉ 4 trạng thái ưu tiên mỗi phía xuất hiện; trạng thái quan trọng và sắp hết thời gian được giữ dễ nhìn, phần dư gom thành +N.</span></div></div>`)}${sheet('floor','Chọn Tầng Farm',floorSheet)}${sheet('map','Bản Đồ Bí Cảnh',mapBody)}${sheet('loot','Chiến Lợi Phẩm',loot)}${monsterSheet}${more}${devSandboxMarkup(ctx)}
  </section>`;
}

function q(root,selector){return root.querySelector(selector)}
function qa(root,selector){return [...root.querySelectorAll(selector)]}
function syncCombatPixiEnemyAsset(src=''){return syncCombatPresentationEnemyAsset(src);}
function playCombatPixiFx(event={}){return playCombatPresentationFx(event);}
function syncCombatPixiFxState(){return setCombatPresentationFxState({paused:fxPaused,speed:COMBAT_PRESENTATION_SPEED,quality:combatFxQuality});}
function syncCombatPixiSwordQi(value=0,max=5){return setCombatPresentationSwordQi({value:Number(value)||0,max:Math.max(1,Number(max)||5)});}
function stopCombatPixi(){destroyCombatPresentationRuntime();}
async function startCombatPixi(root,stage,model){
  return mountCombatPresentationRuntime({root,stage,playerVisual:playerCombatVisual(model),fxLevel:combatFxQuality});
}
function setCaption(root,title,sub='',hold=1650){
  const box=q(root,'#huntv2Caption'); if(!box)return;
  clearTimeout(box._captionTimer);
  const strong=box.querySelector('strong'), span=box.querySelector('span');
  if(!title){box.classList.remove('show'); if(strong)strong.textContent=''; if(span)span.textContent=''; return;}
  if(strong)strong.textContent=String(title); if(span)span.textContent=String(sub||'');
  box.classList.remove('show'); void box.offsetWidth; box.classList.add('show');
  box._captionTimer=setTimeout(()=>{if(box.isConnected)box.classList.remove('show');},Math.max(900,Number(hold)||1650));
}



function clearEnemyIntent(root){
  const box=q(root,'#huntv2EnemyIntent');if(!box)return;clearTimeout(box._intentTimer);clearInterval(box._intentTicker);box.className='huntv2-enemy-intent';const fill=box.querySelector('em');if(fill)fill.style.animation='none';
}
function showEnemyIntent(root,skill={},presentationMs=420){
  const box=q(root,'#huntv2EnemyIntent');if(!box)return;clearTimeout(box._intentTimer);
  const meta=calloutMeta(skill,'enemy',String(q(root,'#huntV2Stage')?.dataset?.playerDao||''));
  const ms=Math.max(160,Number(presentationMs)||420);box.className=`huntv2-enemy-intent show tier-${meta.tier}`;
  const strong=box.querySelector('strong'),small=box.querySelector('small'),time=box.querySelector('b'),fill=box.querySelector('em');
  if(strong)strong.textContent=skill?.name||'Yêu Kích';if(small)small.textContent=meta.tier==='ultimate'?'Đại chiêu nguy hiểm':meta.tier==='heavy'?'Đòn nặng':'Đòn đang tới';if(time)time.textContent=String(Math.max(1,Math.ceil(ms/1000)));
  clearInterval(box._intentTicker);const intentStarted=performance.now();box._intentTicker=setInterval(()=>{if(!box.isConnected||!box.classList.contains('show')){clearInterval(box._intentTicker);return;}const remain=Math.max(0,ms-(performance.now()-intentStarted));if(time)time.textContent=remain>0?String(Math.max(1,Math.ceil(remain/1000))):'';},200);
  if(fill){fill.style.animation='none';void fill.offsetWidth;fill.style.animation=`huntv2IntentFill ${ms}ms linear both`;}
  box._intentTimer=setTimeout(()=>box.classList.remove('show'),ms+140);
}
function stopBreakWindow(root){
  const box=q(root,'#huntv2BreakWindow');if(!box)return;clearTimeout(box._breakTimer);clearInterval(box._breakTicker);box.classList.remove('show');
}
function startBreakWindow(root,canonicalSeconds=5,presentationMs=4000,defenseReductionPct=0){
  const box=q(root,'#huntv2BreakWindow');if(!box)return;stopBreakWindow(root);const total=Math.max(.1,Number(canonicalSeconds)||5),ms=Math.max(450,Number(presentationMs)||total*1000);const strong=box.querySelector('strong'),em=box.querySelector('em');if(em)em.textContent=`Phòng Ngự -${Math.round(Number(defenseReductionPct)||0)}% · BURST`;box.classList.add('show');const started=performance.now();const sync=()=>{const p=clamp((performance.now()-started)/ms,0,1);if(strong){const remain=Math.max(0,total*(1-p));strong.textContent=remain>0?String(Math.max(1,Math.ceil(remain))):'';}};sync();box._breakTicker=setInterval(sync,250);box._breakTimer=setTimeout(()=>stopBreakWindow(root),ms+70);
}

function isUltimateSkill(skill={}){
  return skill?.slot==='ultimate'||/tuyệt kỹ|ultimate|đại chiêu/i.test([skill?.name,...(skill?.tags||[])].join(' '));
}
function showSkillCallout(root,skillOrName,side='player',ultimate=false){
  const skill=skillOrName&&typeof skillOrName==='object'?skillOrName:{name:String(skillOrName||'')};
  const name=skill?.name||String(skillOrName||'');
  const box=q(root,'#huntv2SkillCallout'); if(!box||!name)return;
  clearTimeout(box._calloutTimer);
  const fallbackDao=String(q(root,'#huntV2Stage')?.dataset?.playerDao||'');
  const meta=calloutMeta(skill,side,fallbackDao);
  const isUltimate=ultimate||meta.tier==='ultimate';
  box.className=`huntv2-skill-callout ${side==='enemy'?'enemy':'player'} tier-${meta.tier} dao-${meta.dao} ${isUltimate?'ultimate':''}`;
  const small=box.querySelector('small'),strong=box.querySelector('strong');
  let icon=box.querySelector('img');
  const iconPath=skill?.id?productionSkillIconPath(skill.id):'';
  if(iconPath){if(!icon){icon=document.createElement('img');icon.alt='';box.prepend(icon);}icon.src=iconPath;icon.hidden=false;}else if(icon)icon.hidden=true;
  if(small)small.textContent=meta.label;
  if(strong)strong.textContent=String(name).replace(/!+$/,'')+'!';
  void box.offsetWidth;box.classList.add('show');
  const hold=(isUltimate?1650:meta.tier==='heavy'?1240:1080);
  box._calloutTimer=setTimeout(()=>{if(box.isConnected)box.classList.remove('show');},hold);
}
function spawnSkillFx(root,skill={},side='player',phase='travel'){
  if(fxPaused)return false;
  const fallbackDao=String(q(root,'#huntV2Stage')?.dataset?.playerDao||'');
  const skillId=String(skill?.id||'');
  // Pixi owns the actual impact primitive through impact(); this phase marker
  // keeps the skill choreography semantic without drawing a duplicate burst.
  if(phase==='impact'&&playCombatPixiFx({type:'phase-impact',phase,side,skill,fallbackDao}))return true;
  // Golden Sword G1/G2 is not only a manual DEV sequence: when the real Sword V2
  // ultimate is presented through the DEV Pixi renderer, route its release
  // through the dedicated choreography. Combat truth still comes entirely
  // from CombatKernel events; this is presentation-only.
  if(skillId==='skill.dao.sword.ultimate'&&phase==='travel'){
    if(playCombatPixiFx({type:'golden-sword-ultimate',phase,side,target:side==='player'?'enemy':'player',skill,fallbackDao:'sword',strong:true}))return true;
  }
  if(playCombatPixiFx({type:phase,phase,side,skill,fallbackDao}))return true;
  return playSkillFxPhase(root,skill,phase,{side,fallbackDao});
}

function statusGlyph(name=''){
  const raw=String(name||'').toLowerCase();
  if(/độc|poison/.test(raw))return '☠';
  if(/hỏa|burn|thiêu/.test(raw))return '✹';
  if(/băng|ice|đóng băng/.test(raw))return '❄';
  if(/lôi|shock|choáng|stun/.test(raw))return 'ϟ';
  if(/giáp|shield|hộ thể/.test(raw))return '◇';
  if(/hồi|heal|regen/.test(raw))return '+';
  if(/tốc|speed|nhanh/.test(raw))return '»';
  return '✦';
}
function clearStatuses(root){
  qa(root,'[data-status-tray]').forEach(tray=>{
    for(const chip of [...tray.children]){clearTimeout(chip._statusTimer);clearInterval(chip._statusTicker);}
    tray.replaceChildren();
  });
  qa(root,'[data-status-fx-layer]').forEach(layer=>{
    for(const fx of [...layer.children])clearTimeout(fx._statusFxTimer);
    layer.replaceChildren();
  });
}
function statusVisualKind(name='',kind='buff',statusId=''){
  const id=String(statusId||'').toLowerCase();
  if(id==='combat.shield'||(kind==='buff'&&(id.includes('shield')||id.includes('guard')||id.includes('bones')||id.includes('fortress')||id.includes('mirror'))))return 'shield';
  if(id.includes('poison')||id.includes('erosion'))return 'poison';
  if(id.includes('burn')||(kind==='debuff'&&id.includes('fire')))return 'burn';
  if(id.includes('frost')||id.includes('ice'))return 'frost';
  if(id.includes('stun')||id.includes('silence')||(kind==='debuff'&&(id.includes('thunder')||id.includes('lightning'))))return 'stun';
  if(id.includes('injury'))return 'injury';
  if(kind==='buff'&&(id.includes('heal')||id.includes('regen')))return 'heal';
  if(id && id.startsWith('status.')&&kind==='buff')return 'empower';
  if(id && id.startsWith('status.')&&kind==='debuff')return 'curse';
  const raw=String(name||'').toLowerCase();
  if(/độc|poison/.test(raw))return 'poison';
  if(/hỏa|burn|thiêu/.test(raw))return 'burn';
  if(/băng|ice|đóng băng|frost/.test(raw))return 'frost';
  if(/lôi|shock|choáng|stun/.test(raw))return 'stun';
  if(kind==='buff'&&/giáp|shield|hộ thể|khiên/.test(raw))return 'shield';
  if(kind==='buff'&&/hồi|heal|regen/.test(raw))return 'heal';
  if(/tốc|speed|nhanh|công|attack/.test(raw)&&kind==='buff')return 'empower';
  if(/chậm|slow|giảm|weaken/.test(raw)||kind==='debuff')return 'curse';
  return kind==='buff'?'empower':'curse';
}
function refreshStatusOverflow(tray){
  const chips=[...tray.querySelectorAll('i.status')].sort((a,b)=>Number(b.dataset.priority||1)-Number(a.dataset.priority||1));
  tray.querySelector('.status-more')?.remove();
  chips.forEach((chip,i)=>chip.classList.toggle('status-hidden',i>=4));
  if(chips.length>4){const more=document.createElement('b');more.className='status-more';more.textContent=`+${chips.length-4}`;tray.append(more);}
}
function applyStatusFx(root,target,name,kind,life,key,statusId=''){
  const layer=q(root,`[data-status-fx-layer="${target}"]`); if(!layer)return;
  let fx=[...layer.children].find(x=>x.dataset.statusFxKey===String(key));
  if(!fx){fx=document.createElement('i');fx.dataset.statusFxKey=String(key);layer.append(fx);}
  const visual=statusVisualKind(name,kind,statusId); fx.className=`huntv2-actor-status-fx ${kind} fx-${visual}`;fx.dataset.statusVisual=visual;fx.dataset.statusKind=kind;fx.title=String(name||'');
  clearTimeout(fx._statusFxTimer);if(life>0)fx._statusFxTimer=setTimeout(()=>fx.remove(),life);else fx._statusFxTimer=null;
}
function shortStatusName(name=''){
  const raw=String(name||'Trạng thái').trim();
  return raw.length>18?`${raw.slice(0,17)}…`:raw;
}
function statusCallout(root,target,name,kind='buff'){
  const layer=q(root,'#huntv2FloatLayer')||q(root,'.huntv2-arena'); if(!layer)return;
  const el=document.createElement('div');
  el.className=`huntv2-status-callout ${target} ${kind}`;
  el.innerHTML=`<i>${esc(statusGlyph(name))}</i><b>${esc(shortStatusName(name))}</b>`;
  layer.append(el); requestAnimationFrame(()=>el.classList.add('show'));
  huntTransientTimeoutV129(root,()=>el.remove(),1250);
}
function addStatus(root,target,event={}){
  const trays=qa(root,`[data-status-tray="${target}"]`); if(!trays.length)return;
  const name=event.statusName||event.message||'Trạng thái';
  const kind=event.statusKind||(target==='enemy'?'debuff':'buff');
  const key=event.statusId||name;
  const duration=Number(event.durationSeconds);const hasDuration=Number.isFinite(duration)&&duration>0;
  const life=hasDuration?Math.max(900,Math.min(5200,duration*1000)):0;
  const stackValue=Number(event.stacks),stackMax=Number(event.maxStacks);const hasStacks=Number.isFinite(stackValue)&&stackValue>0;
  for(const tray of trays){
    let chip=[...tray.children].find(x=>x.dataset.statusKey===key);
    if(!chip){chip=document.createElement('i');chip.dataset.statusKey=key;const major=isMajorStatus(event)||String(key)==='hunt.break';chip.dataset.priority=major?'2':'1';if(major)tray.prepend(chip);else tray.append(chip);}
    const visual=statusVisualKind(name,kind,event.statusId);chip.className=`status ${kind} fx-${visual}`;chip.dataset.statusVisual=visual;chip.dataset.timed=hasDuration?'1':'0';chip.innerHTML=`<b>${esc(statusGlyph(name))}</b><em>${esc(shortStatusName(name))}</em>${hasStacks?`<strong>${Number.isFinite(stackMax)&&stackMax>0?`${Math.round(stackValue)}/${Math.round(stackMax)}`:Math.round(stackValue)}</strong>`:''}<small data-status-time></small>`;chip.title=name;chip.tabIndex=0;chip.setAttribute('role','button');const explain=()=>setCaption(root,name,event.message||`${kind==='debuff'?'Bất lợi':'Có lợi'}${hasDuration?' · còn thời gian hiệu lực':''}`,1400);chip.onclick=explain;chip.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();explain();}};chip.dataset.label=shortStatusName(name);chip.dataset.short=shortStatusName(name).slice(0,2).toUpperCase();if(hasDuration)chip.style.setProperty('--status-life',`${life}ms`);else chip.style.removeProperty('--status-life');chip.classList.remove('pulse');void chip.offsetWidth;chip.classList.add('pulse');
    clearTimeout(chip._statusTimer);clearInterval(chip._statusTicker);const timeEl=chip.querySelector('[data-status-time]');if(hasDuration){const statusStarted=performance.now();const syncTime=()=>{if(!chip.isConnected)return;const remain=Math.max(0,(life-(performance.now()-statusStarted))/1000);if(timeEl)timeEl.textContent=remain>0?String(Math.max(1,Math.ceil(remain))):'';};syncTime();chip._statusTicker=setInterval(syncTime,500);chip._statusTimer=setTimeout(()=>{clearInterval(chip._statusTicker);chip.remove();refreshStatusOverflow(tray);},life);}else if(timeEl)timeEl.textContent='';
    refreshStatusOverflow(tray);
  }
  applyStatusFx(root,target,name,kind,life,key,event.statusId);
  statusCallout(root,target,name,kind);
}
function updateIntelMeter(root,id,value,maxOverride){
  const meter=q(root,`[data-intel-resource="${id}"]`);if(!meter)return;
  const max=Math.max(1,Number(maxOverride||meter.dataset.max||100));const v=clamp(Number(value)||0,0,max);const pctValue=clamp(v/max*100,0,100);
  const fill=meter.querySelector('em'),label=meter.querySelector('b');if(fill)fill.style.width=`${pctValue}%`;if(label)label.textContent=`${Number.isInteger(v)?v:v.toFixed(1)}/${max}`;
  const full=v>=max;meter.classList.toggle('full',full);meter.classList.remove('pulse');void meter.offsetWidth;meter.classList.add('pulse');
  if(id==='ultimateGauge'){
    const ult=q(root,'.huntv2-skill.ultimate.filled');if(ult){ult.classList.toggle('gauge-ready',full);const badge=ult.querySelector('.huntv2-ult-ready');if(badge)badge.setAttribute('aria-hidden',full?'false':'true');}
  }
}
function resetCombatIntelligence(root){
  qa(root,'[data-intel-resource]').forEach(m=>updateIntelMeter(root,m.dataset.intelResource,0,Number(m.dataset.max||100)));
  qa(root,'[data-status-key="resource:swordIntentV2"]').forEach(x=>x.remove());
  syncCombatPixiSwordQi(0,5);
  const summary=q(root,'#huntv2BattleSummary');if(summary)summary.classList.remove('show');
}
function updatePassiveResourceChip(root,event={}){
  const id=String(event.resourceId||'');if(id!=='swordIntentV2')return;
  const trays=qa(root,'[data-status-tray="player"]');if(!trays.length)return;
  const value=Math.max(0,Number(event.resourceValue)||0),max=Math.max(1,Number(event.resourceMax)||20);
  const detail=String(event.resourceDetail||'').trim();const duration=Math.max(0,Number(event.durationSeconds)||0);
  for(const tray of trays){
    let chip=[...tray.children].find(x=>x.dataset.statusKey==='resource:swordIntentV2');
    if(value<=0){chip?.remove();refreshStatusOverflow(tray);continue;}
    if(!chip){chip=document.createElement('i');chip.dataset.statusKey='resource:swordIntentV2';chip.dataset.priority='2';tray.prepend(chip);}
    chip.className='status buff mark';chip.innerHTML=`<b>Ý</b><em>Kiếm Ý</em><strong>${value}/${max}</strong>`;
    const durationText=duration>0?` · giữ ${Math.max(1,Math.ceil(duration))}s rồi mới suy giảm`:'';
    chip.title=`Kiếm Ý ${value}/${max}${detail?` · ${detail}`:''}${durationText}`;chip.tabIndex=0;chip.setAttribute('role','button');
    const explain=()=>setCaption(root,`Kiếm Ý · ${value}/${max}`,`${detail||'Passive Kiếm đang gia tăng sức mạnh theo số tầng.'}${durationText}`,2100);
    chip.onclick=explain;chip.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();explain();}};
    chip.classList.remove('pulse');void chip.offsetWidth;chip.classList.add('pulse');refreshStatusOverflow(tray);
  }
}
function updateCombatResource(root,event={}){
  const id=String(event.resourceId||'');if(id)updateIntelMeter(root,id,event.resourceValue,event.resourceMax);
  if(id==='swordQi')syncCombatPixiSwordQi(event.resourceValue,event.resourceMax);
  if(id==='swordIntentV2')updatePassiveResourceChip(root,event);
  if(Number.isFinite(Number(event.ultimateGauge)))updateIntelMeter(root,'ultimateGauge',Number(event.ultimateGauge),100);
}
function showBattleSummary(root,data={},reveal=false){
  const panel=q(root,'#huntv2BattleSummary'),grid=panel?.querySelector('.huntv2-summary-grid');if(!panel||!grid)return;
  const rows=[['Tổng DMG',data.totalDamage||'0'],['DMG nhận',data.damageReceived||'0'],['Skill nổi bật',data.topSkill||'—'],['DoT',data.dotDamage||'0'],['Phá Thế',`${Number(data.breakCount)||0} lần`],['Nổ Ấn',`${Number(data.markBurstCount)||0} lần`]];
  grid.innerHTML=rows.map(([name,value])=>`<div><span>${esc(name)}</span><strong>${esc(value)}</strong></div>`).join('');
  panel.dataset.hasSummary='1';
  clearTimeout(panel._hideTimer);panel.classList.remove('show');
  if(reveal){void panel.offsetWidth;panel.classList.add('show');panel._hideTimer=setTimeout(()=>panel.classList.remove('show'),1800);}
}
function updateMark(root,target,event){
  const trays=qa(root,`[data-status-tray="${target}"]`); if(!trays.length)return;
  const key=`mark:${event.markId||event.statusName||'mark'}`; const stacks=Math.max(0,Number(event.stacks)||0); const max=Math.max(stacks,Number(event.maxStacks)||0); const name=event.statusName||'Ấn';
  for(const tray of trays){
    let chip=[...tray.children].find(x=>x.dataset.statusKey===key);
    if(stacks<=0){chip?.remove();refreshStatusOverflow(tray);continue;}
    if(!chip){chip=document.createElement('i');chip.dataset.statusKey=key;tray.append(chip);}
    chip.dataset.priority='2';
    chip.className='status debuff mark'; chip.innerHTML=`<b>${esc(statusGlyph(name))}</b><em>${esc(shortStatusName(name))}</em><strong>${stacks}/${max||stacks}</strong>`; chip.title=`${name} ${stacks}/${max||stacks}`;chip.tabIndex=0;chip.setAttribute('role','button');const explain=()=>setCaption(root,`${name} · ${stacks}/${max||stacks}`,Number(event.consumedStacks)>0?`Vừa tiêu ${event.consumedStacks} tầng để kích hoạt hiệu ứng.`:'Kỹ năng Tích Ấn tăng tầng; kỹ năng Phệ/Bạo Ấn có thể tiêu tầng.',1550);chip.onclick=explain;chip.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();explain();}}; clearTimeout(chip._statusTimer); refreshStatusOverflow(tray);
  }
  const dao=String(q(root,'#huntV2Stage')?.dataset?.playerDao||'');if(target==='enemy'&&dao==='poison'&&/độc|poison/i.test(String(event.markId||event.statusName||'')))updateIntelMeter(root,'poisonMark',stacks,max||10);if(target==='enemy'&&dao==='mind'&&/thần|mind|niệm/i.test(String(event.markId||event.statusName||'')))updateIntelMeter(root,'mindMark',stacks,max||5);
  if(Number(event.consumedStacks)>0)floatNumber(root,target,`NỔ ẤN ×${event.consumedStacks}`,'break');
}
function setHp(root,target,pct,current='',max=''){
  const value=clamp(Number(pct)||0,0,100);
  const bar=q(root,target==='enemy'?'#huntv2EnemyHp':'#huntv2PlayerHp');
  const lag=q(root,target==='enemy'?'#huntv2EnemyHpLag':'#huntv2PlayerHpLag');
  const label=q(root,target==='enemy'?'#huntv2EnemyHpText':'#huntv2PlayerHpText');
  if(bar)bar.style.width=`${value}%`;
  const container=bar?.closest?.('.huntv2-vital,.huntv2-hp')||bar?.parentElement;
  const numericMax=Number(container?.dataset?.maxValue||0);
  const hasNumericMax=Number.isFinite(numericMax)&&numericMax>0;
  const storedMaxDisplay=String(container?.dataset?.maxDisplay||'').trim();
  const hasCurrent=current!==''&&current!==undefined&&current!==null;
  const hasMax=max!==''&&max!==undefined&&max!==null;
  const explicitCurrentDisplay=hasCurrent?displayCombatAmount(current):'';
  const explicitMaxDisplay=hasMax?displayCombatAmount(max):'';
  const maxDisplay=explicitMaxDisplay||storedMaxDisplay||(hasNumericMax?displayCombatAmount(numericMax):'');
  if(container&&maxDisplay)container.dataset.maxDisplay=maxDisplay;
  let currentDisplay=explicitCurrentDisplay;
  if(!currentDisplay){
    if(value<=0)currentDisplay='0';
    else if(value>=99.95&&maxDisplay)currentDisplay=maxDisplay;
    else if(hasNumericMax)currentDisplay=displayCombatAmount(numericMax*value/100);
    else currentDisplay=String(label?.dataset?.currentDisplay||'').trim()||'—';
  }
  if(label){label.dataset.currentDisplay=currentDisplay;label.textContent=maxDisplay?`${currentDisplay} / ${maxDisplay}`:currentDisplay;}
  if(lag){clearTimeout(lag._lagTimer);lag._lagTimer=setTimeout(()=>{if(lag.isConnected)lag.style.width=`${value}%`;},220);}
  const hud=q(root,`[data-actor-hud="${target}"]`); if(hud)hud.classList.toggle('danger',value<=30);
}
function setSpirit(root,pct,current='',max=''){
  const vital=q(root,'.huntv2-vital.spirit'),bar=vital?.querySelector('i'),label=vital?.querySelector('em');if(!bar||!label)return;
  const maxValue=Number(max)||Number(vital?.dataset?.maxValue||0)||0;
  const value=Number.isFinite(Number(pct))?clamp(Number(pct),0,100):(maxValue>0&&Number.isFinite(Number(current))?clamp(Number(current)/maxValue*100,0,100):100);
  const currentValue=Number.isFinite(Number(current))&&current!==''?Math.max(0,Number(current)):(maxValue>0?maxValue*value/100:0);
  bar.style.width=`${value}%`;
  label.textContent=maxValue>0?`${displayCombatAmount(currentValue)} / ${displayCombatAmount(maxValue)}`:displayCombatAmount(currentValue);
}
function setBossPhaseBadge(root,phase=1,label=''){
  const badge=q(root,'#huntv2BossPhase');if(!badge)return;const p=Math.max(1,Math.min(3,Math.round(Number(phase)||1)));badge.textContent=`P${p}`;badge.dataset.phase=String(p);badge.hidden=p<=1;badge.title=label?`P${p} · ${label}`:`Boss Phase ${p}`;
}
function resetCombatStagingState(root){
  if(!root?.isConnected)return;
  clearEnemyIntent(root);stopBreakWindow(root);clearStatuses(root);resetCombatIntelligence(root);resetBossState(root);
  const playerVital=q(root,'.huntv2-vital.hp');const playerMax=playerVital?.dataset?.maxValue||'';
  const spiritVital=q(root,'.huntv2-vital.spirit');const spiritMax=spiritVital?.dataset?.maxValue||'';
  const enemyHp=q(root,'.huntv2-hp.enemy')?.dataset?.maxDisplay||'';
  setHp(root,'player',100,playerMax,playerMax);setSpirit(root,100,spiritMax,spiritMax);setHp(root,'enemy',100,enemyHp,enemyHp);setPoise(root,100,'ready');setBossPhaseBadge(root,1);
  const stage=q(root,'#huntV2Stage');if(stage){stage.dataset.bossPhase='1';stage.classList.remove('boss-phase-2','boss-phase-3','boss-phase-transition');}
}

function setPoise(root,poisePct=100,state='ready',defenseReductionPct=0){
  const row=q(root,'#huntv2EnemyPoiseRow'),bar=q(root,'#huntv2EnemyPoise'),label=q(root,'#huntv2EnemyPoiseText');if(!row||!bar||!label)return;
  const poise=clamp(Number(poisePct)||0,0,100);const breakPct=state==='broken'?100:clamp(100-poise,0,100);
  row.classList.toggle('broken',state==='broken');row.classList.toggle('poise-recovering',state==='recovering');row.classList.toggle('near-break',state==='pressure'&&breakPct>=70);
  bar.style.width=`${breakPct}%`;
  label.textContent=state==='broken'?'THẤT THẾ':state==='recovering'?'ỔN THẾ':`${Math.round(breakPct)}/100`;
  row.title=state==='broken'?`Thất Thế · Phòng Ngự -${Math.round(Number(defenseReductionPct)||0)}%`:state==='recovering'?'Ổn Thế · tạm miễn Phá Thế mới':'Phá Thế: tích đủ 100 để khiến mục tiêu Thất Thế';
}
function removeStatus(root,target,key){for(const tray of qa(root,`[data-status-tray="${target}"]`)){const chip=[...tray.children].find(x=>x.dataset.statusKey===key);chip?.remove();refreshStatusOverflow(tray);}for(const layer of qa(root,`[data-status-fx-layer="${target}"]`)){const fx=[...layer.children].find(x=>x.dataset.statusFxKey===String(key));fx?.remove();}}
function pushLog(root,text,tone=''){
  const log=q(root,'#huntv2Log'); if(!log)return;
  const body=q(log,'.huntv2-log-body')||log;
  const row=document.createElement('div');
  row.className=`huntv2-log-row ${tone||''}`.trim();
  row.textContent=String(text||'');
  body.append(row);
  while(body.children.length>16)body.firstElementChild?.remove();
  const preview=q(root,'#huntv2LogPreview .huntv2-log-preview-body');
  if(preview){
    const compact=document.createElement('span');compact.className=row.className;compact.textContent=row.textContent;preview.append(compact);
    while(preview.children.length>3)preview.firstElementChild?.remove();
  }
}
function actor(root,side){return q(root,`[data-huntv2-actor="${side}"]`)}
function presentationFor(root){
  let state=presentationState.get(root);
  if(!state){state={token:0,timers:new Set(),transientTimers:new Set(),bossPhase:1,focusTimer:null,cinematicTimer:null};presentationState.set(root,state);}
  if(!state.transientTimers)state.transientTimers=new Set();
  return state;
}
function huntTransientTimeoutV129(root,fn,delay){
  const state=presentationFor(root);
  const timer=setTimeout(()=>{state.transientTimers.delete(timer);if(!root?.isConnected)return;fn();},Math.max(0,Number(delay)||0));
  state.transientTimers.add(timer);return timer;
}
function clearHuntTransientTimersV129(root){
  const state=presentationFor(root);
  for(const timer of state.transientTimers)clearTimeout(timer);
  state.transientTimers.clear();
}
function clearPresentationTimers(root){
  const state=presentationFor(root);state.token+=1;
  for(const timer of state.timers)clearTimeout(timer);state.timers.clear();
  clearTimeout(state.focusTimer);clearTimeout(state.cinematicTimer);
  const stage=q(root,'#huntV2Stage');
  if(stage)stage.classList.remove('presentation-active','focus-player','focus-enemy','focus-impact','cinematic-ultimate','boss-phase-transition','boss-phase-2','boss-phase-3','tier-normal','tier-heavy','tier-support','tier-ultimate');
  clearPresentationTheme(root);
  return state.token;
}
function schedulePresentation(root,token,delay,fn){
  const state=presentationFor(root);
  const timer=setTimeout(()=>{state.timers.delete(timer);if(state.token!==token||!root.isConnected)return;fn();},Math.max(0,delay));
  state.timers.add(timer);return timer;
}
function presentationFocus(root,side='impact',hold=520){
  const stage=q(root,'#huntV2Stage');if(!stage)return;
  const state=presentationFor(root);clearTimeout(state.focusTimer);
  stage.classList.remove('focus-player','focus-enemy','focus-impact');stage.classList.add(`focus-${side}`);
  state.focusTimer=setTimeout(()=>stage?.classList.remove('focus-player','focus-enemy','focus-impact'),fxDelay(hold));
}
function cinematicUltimate(root,hold=1200){
  const stage=q(root,'#huntV2Stage');if(!stage)return;
  const state=presentationFor(root);clearTimeout(state.cinematicTimer);
  stage.classList.remove('cinematic-ultimate');stage.classList.add('cinematic-ultimate');
  state.cinematicTimer=setTimeout(()=>stage?.classList.remove('cinematic-ultimate'),fxDelay(hold));
}
function pulseActor(root,side,state,duration=560){
  const el=actor(root,side); if(!el)return;
  const states=['state-cast','state-dash','state-sword','state-ultimate','state-hit','state-dodge','state-heal','state-dead','state-attack','state-channel','state-brace','state-summon','state-counter'];
  el.classList.remove(...states); el.classList.add(`state-${state}`);
  if(state!=='dead')huntTransientTimeoutV129(root,()=>el.classList.remove(`state-${state}`),duration);
}
function compactDamage(raw){
  if(raw===undefined||raw===null||raw==='')return '';
  if(typeof raw==='string')return raw.trim();
  const n=Number(raw); if(!Number.isFinite(n))return String(raw);
  if(Math.abs(n)>=1e12)return `${(n/1e12).toFixed(n>=1e13?0:1)}T`;
  if(Math.abs(n)>=1e9)return `${(n/1e9).toFixed(n>=1e10?0:1)}B`;
  if(Math.abs(n)>=1e6)return `${(n/1e6).toFixed(n>=1e7?0:1)}M`;
  if(Math.abs(n)>=1e3)return `${(n/1e3).toFixed(n>=1e4?0:1)}K`;
  return fmt(n);
}
function showResult(root,title,sub='',kind='victory'){
  const box=q(root,'#huntv2ResultPop'); if(!box)return;
  q(root,'#huntv2Caption')?.classList.remove('show');q(root,'#huntv2SkillCallout')?.classList.remove('show');qa(root,'.huntv2-status-callout').forEach(x=>x.remove());
  clearTimeout(resultTimer); box.className=`huntv2-result-pop show ${kind}`;
  box.querySelector('b').textContent=title; box.querySelector('span').textContent=sub;
  resultTimer=setTimeout(()=>{if(box.isConnected)box.className='huntv2-result-pop'},1050);
}

function floatNumber(root,side,text,kind='damage'){
  const layer=q(root,'#huntv2FloatLayer')||q(root,'.huntv2-arena'); if(!layer)return;
  const el=document.createElement('div');
  const lane=(sequenceIndex++)%3;
  el.className=`huntv2-float ${side} ${kind} show lane-${lane}`;
  el.textContent=String(text||'');
  layer.append(el);
  const siblings=[...layer.querySelectorAll(`.huntv2-float.${side}:not(.crit):not(.damage-main)`)];
  while(siblings.length>3)siblings.shift()?.remove();
  huntTransientTimeoutV129(root,()=>el.remove(),kind==='death'?1150:900);
}
function damageNumber(root,side,raw,crit=false,kind='direct'){
  const layer=q(root,'#huntv2FloatLayer')||q(root,'.huntv2-arena'); if(!layer||raw===undefined||raw===null||raw==='')return;
  const now=performance.now();
  let state=damageTextState.get(root);
  if(!state){state={enemy:null,player:null};damageTextState.set(root,state);}
  const amount=Number(raw);
  const canSum=Number.isFinite(amount);
  const prev=state[side];
  if(prev?.el?.isConnected&&now-prev.at<190&&prev.crit===crit&&prev.kind===kind&&canSum&&Number.isFinite(prev.amount)){
    prev.amount+=amount; prev.hits+=1; prev.at=now;
    const value=prev.el.querySelector('strong'); if(value)value.textContent=`-${compactDamage(prev.amount)}`;
    const hits=prev.el.querySelector('small'); if(hits){hits.textContent=prev.hits>1?`×${prev.hits}`:'';hits.classList.toggle('show',prev.hits>1);}
    prev.el.classList.remove('bump');void prev.el.offsetWidth;prev.el.classList.add('bump');
    clearTimeout(prev.timer);prev.timer=setTimeout(()=>{prev.el?.remove();if(state[side]===prev)state[side]=null;},crit?1120:880);
    return;
  }
  if(crit&&prev?.el?.isConnected)prev.el.remove();
  const normals=[...layer.querySelectorAll(`.huntv2-float.damage-main.${side}:not(.crit)`)];
  while(normals.length>=2)normals.shift()?.remove();
  const el=document.createElement('div');
  const lane=(sequenceIndex++)%3;
  el.className=`huntv2-float damage-main ${side} ${crit?'crit':'damage'} kind-${esc(kind)} show lane-${lane}`;
  el.dataset.side=side;
  const damageLabel=crit?'BẠO KÍCH!':kind==='dot'?'DoT':kind==='markBurst'?'NỔ ẤN':'';
  el.innerHTML=`${damageLabel?`<span>${damageLabel}</span>`:''}<strong>-${esc(compactDamage(raw))}</strong><small></small>`;
  layer.append(el);
  const entry={el,at:now,crit,kind,amount:canSum?amount:null,hits:1,timer:null};state[side]=entry;
  entry.timer=setTimeout(()=>{el.remove();if(state[side]===entry)state[side]=null;},crit?1120:880);
}
function isCanonicalThunderHornRhino(root){
  const stage=q(root,'#huntV2Stage');
  return String(stage?.dataset?.monsterId||'')===CANONICAL_THUNDER_HORN_RHINO_ID;
}
function bossPhaseFromHp(hpPct=100){
  const hp=Number(hpPct);if(!Number.isFinite(hp))return 1;
  if(hp<=28)return 3;if(hp<=66)return 2;return 1;
}
function maybeTriggerBossPhase(root,hpPct){
  if(!isCanonicalThunderHornRhino(root))return;
  const next=bossPhaseFromHp(hpPct);const state=presentationFor(root);if(next<=state.bossPhase)return;
  state.bossPhase=next;
  const stage=q(root,'#huntV2Stage');if(!stage)return;
  stage.classList.remove('boss-phase-2','boss-phase-3','boss-phase-transition');
  stage.classList.add(`boss-phase-${next}`,'boss-phase-transition');stage.dataset.bossPhase=String(next);setBossPhaseBadge(root,next);
  const phaseFx=q(root,'#huntv2PhaseFx');if(phaseFx){phaseFx.className=`huntv2-phase-fx show phase-${next}`;huntTransientTimeoutV129(root,()=>{if(phaseFx.isConnected)phaseFx.className='huntv2-phase-fx';},fxDelay(next===3?1100:900));}
  if(next===2){
    setBossState(root,'phase2',{entityId:CANONICAL_THUNDER_HORN_RHINO_ID,sticky:true});
    showSkillCallout(root,'Lôi Khải Trấn Trường','enemy',false);setCaption(root,'Lôi Khải Trấn Trường','Boss bước vào P2 · hộ giáp lôi lực dựng lên',1500);lightning(root,'enemy');pushLog(root,'Lôi Giác Huyền Tê bước vào P2 · Lôi Khải Trấn Trường.','boss');
  }else if(next===3){
    setBossState(root,'phase3',{entityId:CANONICAL_THUNDER_HORN_RHINO_ID,sticky:true});
    showSkillCallout(root,'Lôi Giác Bạo Tẩu','enemy',true);setCaption(root,'Lôi Giác Bạo Tẩu','Boss bước vào P3 · công tốc tăng, phòng thủ giảm',1700);lightning(root,'enemy');impact(root,'enemy',true);pushLog(root,'Lôi Giác Huyền Tê bước vào P3 · Bạo Tẩu.','boss');
  }
  huntTransientTimeoutV129(root,()=>stage?.classList.remove('boss-phase-transition'),fxDelay(next===3?1180:980));
}
function actorMotionState(profile={},phase='cast',ultimate=false){
  if(ultimate||profile.motion==='ultimate')return 'ultimate';
  if(phase==='cast'){
    if(profile.motion==='charge'||profile.motion==='channel')return 'channel';
    if(profile.motion==='brace')return 'brace';
    if(profile.motion==='summon')return 'summon';
    if(profile.motion==='counter')return 'counter';
    return 'cast';
  }
  if(profile.motion==='dash'||/slash|punch|body|strike/.test(String(profile.pattern||'')))return 'dash';
  if(profile.motion==='summon')return 'summon';
  if(profile.motion==='counter')return 'counter';
  return 'attack';
}
function impact(root,side='enemy',strong=false,profile={},skill={}){
  if(fxPaused)return;
  const level=profile?.camera|| (strong?'medium':'light');
  const stop=Math.max(22,Math.min(96,Number(profile?.hitStopMs)||(strong?58:34)));
  if(playCombatPixiFx({type:'impact',target:side,strong,camera:level,hitStopMs:stop,skill,fallbackDao:String(q(root,'#huntV2Stage')?.dataset?.playerDao||'')}))return;
  const el=q(root,'#huntv2Impact'); if(el){el.className=`huntv2-impact show ${side} ${strong?'strong':''}`;huntTransientTimeoutV129(root,()=>el.className='huntv2-impact',strong?460:350);}
  const flash=q(root,'#huntv2ScreenFlash'); if(flash){flash.className=`huntv2-screen-flash show ${strong?'strong':''}`;huntTransientTimeoutV129(root,()=>flash.className='huntv2-screen-flash',strong?125:80);}
  const stage=q(root,'#huntV2Stage');
  if(stage){
    stage.style.setProperty('--hit-stop-ms',`${stop}ms`);
    if(level!=='none')stage.classList.add(level==='heavy'||level==='medium'?'shake-strong':'shake');
    stage.classList.add('hit-stop');
    const melee=actor(root,'player')?.classList.contains('state-sword')||actor(root,'player')?.classList.contains('state-dash');
    if(melee&&strong){stage.classList.add('melee-hitstop');huntTransientTimeoutV129(root,()=>stage.classList.remove('melee-hitstop'),Math.max(70,stop+25));}
    huntTransientTimeoutV129(root,()=>stage.classList.remove('hit-stop'),stop);
    huntTransientTimeoutV129(root,()=>stage.classList.remove('shake','shake-strong'),level==='heavy'?230:level==='medium'?180:125);
  }
}
function projectile(root,kind='arcane',side='player',skill={},profile={}){
  if(fxPaused)return;
  if(playCombatPixiFx({type:'projectile',kind,side,skill,fallbackDao:String(q(root,'#huntV2Stage')?.dataset?.playerDao||''),shots:Number(profile?.shots)||undefined,strong:profile?.tier==='heavy'||profile?.tier==='ultimate'}))return;
  const el=q(root,'#huntv2Projectile'); if(!el)return; el.className=`huntv2-projectile show kind-${kind} from-${side}`; huntTransientTimeoutV129(root,()=>el.className='huntv2-projectile',700);
}
function swordArc(root,side='player',skill={},profile={}){
  if(fxPaused)return;
  if(playCombatPixiFx({type:'slash',kind:'sword',side,strong:profile?.tier==='heavy'||profile?.tier==='ultimate',skill,fallbackDao:String(q(root,'#huntV2Stage')?.dataset?.playerDao||'')}))return;
  const el=q(root,'#huntv2SwordArc'); if(!el)return; el.className=`huntv2-sword-arc show from-${side}`; huntTransientTimeoutV129(root,()=>el.className='huntv2-sword-arc',560);
}
function lightning(root,side='enemy',skill={},profile={}){
  if(fxPaused)return;
  if(playCombatPixiFx({type:'lightning',kind:'lightning',target:side,strong:profile?.tier==='heavy'||profile?.tier==='ultimate',skill,fallbackDao:String(q(root,'#huntV2Stage')?.dataset?.playerDao||'')}))return;
  const el=q(root,'#huntv2Lightning'); if(!el)return; el.className=`huntv2-lightning show target-${side}`; huntTransientTimeoutV129(root,()=>el.className='huntv2-lightning',680);
}
function fxDelay(ms){return Math.max(25,Number(ms||0));}
function setCooldown(root,index,seconds=1.4){
  const btn=q(root,`[data-huntv2-skill="${index}"]`); const cd=btn?.querySelector('.huntv2-cooldown'); const txt=cd?.querySelector('[data-cd-text]'); if(!btn||!cd)return;
  const duration=Math.max(.5,Math.min(30,Number(seconds)||1.4)); const started=performance.now();
  btn.classList.remove('ready');btn.classList.add('casting','cooldown');cd.style.setProperty('--cd','1');cd.style.setProperty('--cd-time',`${duration}s`);
  const tick=()=>{if(!btn.isConnected)return;const remain=Math.max(0,duration-(performance.now()-started)/1000);cd.style.setProperty('--cd',String(remain/duration));if(txt)txt.textContent=remain>0?String(Math.max(1,Math.ceil(remain))):'';if(remain>0)requestAnimationFrame(tick);else{btn.classList.remove('casting','cooldown');btn.classList.add('ready');cd.style.setProperty('--cd','0');if(txt)txt.textContent='';}};tick();
}

function ambientPulse(root,kind='cast',side='player'){
  const stage=q(root,'#huntV2Stage'); if(!stage)return;
  const cls=`combat-${kind}-${side}`; stage.classList.remove(cls); stage.classList.add(cls);
  huntTransientTimeoutV129(root,()=>stage.classList.remove(cls),kind==='impact'?360:620);
}
function enemyVisual(root,monster={}){
  const src=monsterAsset(monster); syncCombatPixiEnemyAsset(src); const img=q(root,'.huntv2-actor.enemy .huntv2-beast-art'); if(img)img.src=src;
  const portrait=q(root,'.huntv2-portrait.enemy img'); if(portrait)portrait.src=src;
  const name=q(root,'#huntv2EnemyName'); if(name&&monster.name)name.textContent=monster.name;
}
function restoreCurrentEnemy(root){
  const stage=q(root,'#huntV2Stage'); if(!stage)return;
  const src=stage.dataset.monsterAsset; if(src)syncCombatPixiEnemyAsset(src); const img=q(root,'.huntv2-actor.enemy .huntv2-beast-art'); if(img&&src)img.src=src;
  const portrait=q(root,'.huntv2-portrait.enemy img'); if(portrait&&src)portrait.src=src;
  const name=q(root,'#huntv2EnemyName'); if(name)name.textContent=stage.dataset.monsterName||'Yêu thú';
  const enemy=actor(root,'enemy'); if(enemy){enemy.classList.remove('state-dead','replay-old');enemy.classList.add('monster-enter');huntTransientTimeoutV129(root,()=>enemy.classList.remove('monster-enter'),760);}
  resetBossState(root);setHp(root,'enemy',100);
}
function prepareReplayEnemy(root,result){
  const stage=q(root,'#huntV2Stage'); if(!stage||!result)return false;
  const current=String(stage.dataset.monsterId||''); const old=String(result.monsterId||'');
  if(!old||!current||old===current)return false;
  const oldMonster={name:result.monsterName||'Yêu thú'}; enemyVisual(root,oldMonster);
  const enemy=actor(root,'enemy'); enemy?.classList.add('replay-old');
  const name=q(root,'#huntv2EnemyName'); if(name)name.textContent=result.monsterName||'Yêu thú';
  setHp(root,'enemy',100);
  return true;
}


function syncHuntStageState(root,model={},live={}){
  const stage=q(root,'#huntV2Stage');if(!stage)return {requiresRender:true,monsterChanged:false};
  const h=model?.endlessHunt||{},challenge=h.monster||{},farm=h.farm||{},map=h.currentMap||{};
  const isVirtual=Boolean(live?.autoCombat&&farm.available);
  const m=isVirtual?{id:`virtual-farm.${farm.floor}`,name:farm.mobName||'Yêu thú',grade:'Thường',gradeId:'common',level:farm.mobLevel||1,tags:[...(farm.mobTags||[]),'VirtualFarmV77'],elements:[...(farm.mobElements||[])],hp:farm.mobHp||'—',power:'—'}:challenge;
  const nextEnv=stageEnv(m,map);
  const nextMapId=String(map.id||map.mapId||'');
  const currentMapId=String(stage.dataset.mapId||'');
  if((currentMapId&&nextMapId&&currentMapId!==nextMapId)||(stage.dataset.env&&nextEnv&&stage.dataset.env!==nextEnv))return {requiresRender:true,monsterChanged:false};
  const nextAuto=Boolean(live?.autoCombat??(live?.mode==='hunt'));
  const currentAuto=stage.dataset.auto==='1';
  if(nextAuto!==currentAuto)return {requiresRender:true,monsterChanged:false};
  const previousMonsterId=String(stage.dataset.monsterId||'');
  const nextMonsterId=String(m.id||'');
  const monsterChanged=Boolean(previousMonsterId&&nextMonsterId&&previousMonsterId!==nextMonsterId);
  const nextAsset=monsterAsset(m);
  stage.dataset.mapId=nextMapId;stage.dataset.env=nextEnv;stage.dataset.monsterId=nextMonsterId;stage.dataset.monsterName=String(m.name||'Yêu thú');stage.dataset.monsterLevel=String(m.level||1);stage.dataset.monsterAsset=nextAsset;
  const hud=q(root,'.huntv2-enemy-hud');if(hud)hud.classList.toggle('boss',m.gradeId==='boss');
  const hpBox=q(root,'.huntv2-hp.enemy');if(hpBox)hpBox.dataset.maxValue=String(m.hp||'');
  const floorBox=q(root,'.huntv2-stage-bottom .huntv2-floor');
  if(floorBox){
    const label=q(floorBox,'span'),value=q(floorBox,'b'),fill=q(floorBox,'i em');const farm=h.farm||{};
    floorBox.classList.toggle('ready',Boolean(h.bossReady));
    if(live?.autoCombat&&farm.available){if(label)label.textContent='Hiệu Suất Săn';if(value)value.textContent=`~${fmt(farm.killsPerHour||0,0)}/h`;if(fill)fill.style.width=`${clamp(100*(2/Math.max(2,Number(farm.secondsPerKill)||180)),8,100)}%`;}
    else {if(label)label.textContent='Boss tiến độ';if(value)value.textContent=`T${h.currentZoneFloor||1}`;if(fill)fill.style.width='100%';}
  }
  const stone=modelResourceQty(model,'spirit_stone')||modelResourceQty(model,'linh thạch');
  const stoneEl=q(root,'.huntv2-resource-row span:first-child b');if(stoneEl)stoneEl.textContent=compactStat(stone);
  if(monsterChanged){enemyVisual(root,m);setHp(root,'enemy',100,m.hp||'',m.hp||'');const enemy=actor(root,'enemy');enemy?.classList.add('monster-enter');huntTransientTimeoutV129(root,()=>enemy?.classList.remove('monster-enter'),720);}
  return {requiresRender:false,monsterChanged};
}

function syncHuntFightPresentation(root,model={},live={}){
  const skills=combatDockSkills((model?.character?.knownSkills||[]).filter(x=>x.active));
  const fightCount=Number(live?.fightCount||0);let replayingBackend=false;
  if(fightCount!==lastFightCount&&lastFightCount>=0&&live?.lastFight){
    const result=live.lastFight;
    const replayOld=prepareReplayEnemy(root,result);
    const timeline=playBackendCombatEvents(root,result.combatEvents||[],skills);replayingBackend=timeline.played;
    const restoreDelay=Math.max(900,timeline.ms+420);
    if(timeline.played){root.classList.add('is-active-combat');huntTransientTimeoutV129(root,()=>root?.classList?.remove('is-active-combat'),restoreDelay+260);}
    if(result.won||replayOld)huntTransientTimeoutV129(root,()=>{const liveRoot=document.querySelector('.huntv2-screen');if(liveRoot)restoreCurrentEnemy(liveRoot);},restoreDelay);
    huntTransientTimeoutV129(root,()=>{
      const liveRoot=document.querySelector('.huntv2-screen');if(!liveRoot)return;
      const dmg=compactDamage(result.damage);
      const resultBelongsToCurrent=!result.monsterId||String(result.monsterId)===String(liveRoot.querySelector('#huntV2Stage')?.dataset.monsterId||'');
      if(result.won){
        if(!timeline.played){if(result.damage)damageNumber(liveRoot,'enemy',result.damage,false);else floatNumber(liveRoot,'enemy','TRẤN SÁT','death');showResult(liveRoot,'TRẤN SÁT','', 'victory');pushLog(liveRoot,`Hạ ${result.monsterName||'yêu thú'}${dmg?`, gây ${dmg} sát thương`:''}.`);}
      }else if(!timeline.played){
        if(resultBelongsToCurrent){pulseActor(liveRoot,'enemy','hit',430);impact(liveRoot,'enemy');}
        if(result.damage)damageNumber(liveRoot,'enemy',result.damage,false);else floatNumber(liveRoot,'enemy','ĐỠ','damage');
        huntTransientTimeoutV129(liveRoot,()=>{pulseActor(liveRoot,'player','hit',430);impact(liveRoot,'player')},420);showResult(liveRoot,'THẤT BẠI','', 'defeat');pushLog(liveRoot,`Không thể hạ ${result.monsterName||'yêu thú'}${dmg?` · sát thương ${dmg}`:''}.`);
      }
    },timeline.played?Math.max(850,timeline.ms+80):120);
  }
  lastFightCount=fightCount;
  return replayingBackend;
}

export function syncHuntCombatV2(root,ctx={}){
  if(!root?.isConnected)return {requiresRender:true};
  const {model={},live={}}=ctx;
  const stageSync=syncHuntStageState(root,model,live);if(stageSync.requiresRender)return stageSync;
  const replayingBackend=syncHuntFightPresentation(root,model,live);
  const farmBatchShown=syncFarmBatchPresentationV77(root,live);
  root._huntFarmViewV77=model?.endlessHunt?.farm||{};
  if(stageSync.monsterChanged)lastMonsterId=String(model?.endlessHunt?.monster?.id||lastMonsterId||'');
  if(stageSync.requiresRender===false&&!replayingBackend&&!farmBatchShown)setCaption(root,'','');
  return {...stageSync,replayingBackend,farmBatchShown};
}

function backendSkill(skills,event){
  return skills.filter(Boolean).find(s=>s.id===event.skillId)||{id:event.skillId,name:event.skillName||(event.actor==='enemy'?'Yêu Kích':'Thần Thông'),tags:[event.delivery||'arcane'],delivery:event.delivery,cooldown:1};
}
const RHINO_PRESENTATION_SKILLS={
  charge:{id:'skill.rhino_charge',name:'Lôi Giác Xung Thiên',tags:['Beast','Lightning','Heavy','Break'],delivery:'melee'},
  armor:{id:'skill.rhino_thunder_armor',name:'Huyền Tê Lôi Khải',tags:['Beast','Lightning','Shield'],delivery:'support'},
  roar:{id:'skill.rhino_thunder_roar',name:'Lôi Giác Chấn Hống',tags:['Beast','Lightning','Control'],delivery:'lightning'},
  rage:{id:'skill.rhino_overcharge',name:'Lôi Giác Bạo Tẩu',tags:['Beast','Lightning','Buff'],delivery:'support'},
};
function resolvedEventSkill(root,skills,event){
  if(event.actor!=='enemy'||event.skillId)return backendSkill(skills,event);
  if(!isCanonicalThunderHornRhino(root))return backendSkill(skills,event);
  const state=presentationFor(root);state.enemyCastCount=(state.enemyCastCount||0)+1;
  const phase=state.bossPhase||bossPhaseFromHp(state.enemyHp||100);
  let row=RHINO_PRESENTATION_SKILLS.charge;
  if(phase===2)row=(state.enemyCastCount%3===1?RHINO_PRESENTATION_SKILLS.armor:state.enemyCastCount%3===2?RHINO_PRESENTATION_SKILLS.roar:RHINO_PRESENTATION_SKILLS.charge);
  if(phase>=3)row=(state.enemyCastCount%3===1?RHINO_PRESENTATION_SKILLS.rage:state.enemyCastCount%3===2?RHINO_PRESENTATION_SKILLS.charge:RHINO_PRESENTATION_SKILLS.roar);
  return {...row,cooldown:1,description:'Presentation mapping từ boss canonical; kết quả chiến đấu vẫn do backend quyết định.'};
}
function captureEncounterVisual(root){
  const stage=q(root,'#huntV2Stage');const enemyActor=actor(root,'enemy');const enemyHud=q(root,'.huntv2-enemy-hud');
  return{monsterId:stage?.dataset?.monsterId||'',monsterName:stage?.dataset?.monsterName||'',actorClass:enemyActor?.className||'',hudClass:enemyHud?.className||'',name:q(root,'#huntv2EnemyName')?.textContent||'',portrait:q(root,'.huntv2-portrait.enemy img')?.getAttribute('src')||'',beast:q(root,'.huntv2-beast-art')?.getAttribute('src')||''};
}
function applyEncounterVisual(root,event){
  if(!event?.monsterName)return;const stage=q(root,'#huntV2Stage');const enemyActor=actor(root,'enemy');const enemyHud=q(root,'.huntv2-enemy-hud');
  const pseudo={id:event.monsterId||'',name:event.monsterName||'Yêu thú',gradeId:event.monsterGrade||'',grade:event.monsterGrade||'',tags:event.monsterTags||[],elements:event.monsterElements||[]};const src=monsterAsset(pseudo);syncCombatPixiEnemyAsset(src);const boss=event.monsterGrade==='boss';
  if(stage){stage.dataset.monsterId=String(event.monsterId||'');stage.dataset.monsterName=String(event.monsterName||'');}
  const name=q(root,'#huntv2EnemyName');if(name)name.textContent=String(event.monsterName||'Yêu thú');
  for(const img of qa(root,'.huntv2-portrait.enemy img,.huntv2-beast-art')){img.setAttribute('src',src);img.setAttribute('alt',String(event.monsterName||'Yêu thú'));}
  enemyActor?.classList.toggle('boss',boss);enemyActor?.classList.toggle('huntv2-boss-visual',boss);enemyHud?.classList.toggle('boss',boss);
}
function restoreEncounterVisual(root,saved){
  if(!saved)return;const stage=q(root,'#huntV2Stage');const enemyActor=actor(root,'enemy');const enemyHud=q(root,'.huntv2-enemy-hud');
  if(stage){stage.dataset.monsterId=saved.monsterId;stage.dataset.monsterName=saved.monsterName;}
  if(enemyActor)enemyActor.className=saved.actorClass;if(enemyHud)enemyHud.className=saved.hudClass;
  const name=q(root,'#huntv2EnemyName');if(name)name.textContent=saved.name;
  const portrait=q(root,'.huntv2-portrait.enemy img');if(portrait&&saved.portrait)portrait.setAttribute('src',saved.portrait);
  const beast=q(root,'.huntv2-beast-art');if(saved.beast)syncCombatPixiEnemyAsset(saved.beast);if(beast&&saved.beast)beast.setAttribute('src',saved.beast);
}
function playBackendCombatEvents(root,events=[],skills=[]){
  if(!Array.isArray(events)||!events.length)return {played:false,ms:0};
  const duration=Math.max(.8,Number(events.at(-1)?.time)||1);
  // Online Hunt presentation follows the authoritative combat timeline 1:1.
  // No replay compression / fast-forward: event.time seconds map to real seconds.
  const scale=COMBAT_PRESENTATION_SPEED;
  const totalMs=Math.ceil(duration*1000*scale);
  const token=clearPresentationTimers(root);const state=presentationFor(root);
  state.encounterDefault=captureEncounterVisual(root);state.bossPhase=1;state.enemyHp=100;state.enemyCastCount=0;
  const stage=q(root,'#huntV2Stage');if(stage){stage.classList.add('presentation-active');stage.dataset.bossPhase='1';}
  clearStatuses(root);resetCombatIntelligence(root);resetBossState(root);setHp(root,'player',100);setHp(root,'enemy',100);setPoise(root,100,'ready');

  for(let eventIndex=0;eventIndex<events.length;eventIndex++){
    const event=events[eventIndex];
    const delay=Math.max(0,Number(event.time)||0)*1000*scale;
    const nextIncoming=event.actor==='enemy'&&event.type==='castStart'?events.slice(eventIndex+1).find(x=>x.actor==='enemy'&&x.type==='damage'&&(x.target||'player')==='player'):null;
    const enemyIntentMs=nextIncoming?Math.max(160,(Number(nextIncoming.time)-Number(event.time))*1000*scale):420;
    schedulePresentation(root,token,delay,()=>{
      dispatchCombatPresentationEvent(root,event,{daoId:String(q(root,'#huntV2Stage')?.dataset?.playerDao||'')});
      const target=event.target||'enemy'; const skill=resolvedEventSkill(root,skills,event);
      if(event.type==='battleStart'){
        applyEncounterVisual(root,event);clearEnemyIntent(root);stopBreakWindow(root);clearStatuses(root);resetCombatIntelligence(root);setHp(root,'player',100,event.target==='player'?event.hpCurrent:'',event.target==='player'?event.hpMax:'');setSpirit(root,100);setHp(root,'enemy',100,event.target==='enemy'?event.hpCurrent:'',event.target==='enemy'?event.hpMax:'');setPoise(root,100,'ready');setBossPhaseBadge(root,1);
        setCaption(root,'Giao phong khai trận','Khí cơ khóa mục tiêu');ambientPulse(root,'cast','player');presentationFocus(root,'player',520);
      }else if(event.type==='phase'){
        const phaseName=event.phaseName||'Boss chuyển phase';const next=Number(event.thresholdPct)<=40?3:2;state.bossPhase=Math.max(state.bossPhase||1,next);
        if(stage){stage.classList.remove('boss-phase-2','boss-phase-3');stage.classList.add(`boss-phase-${state.bossPhase}`,'boss-phase-transition');stage.dataset.bossPhase=String(state.bossPhase);}
        setBossPhaseBadge(root,state.bossPhase,phaseName);
        setBossState(root,state.bossPhase>=3?'phase3':'phase2',{entityId:String(stage?.dataset?.monsterId||''),sticky:true});
        setCaption(root,phaseName,event.message,1700);presentationFocus(root,'enemy',900);ambientPulse(root,'cast','enemy');pushLog(root,event.message,'boss');
        huntTransientTimeoutV129(root,()=>stage?.classList.remove('boss-phase-transition'),fxDelay(950));
      }else if(event.type==='counterWindow'){
        if(event.counterState==='open'){setCaption(root,'CỬA PHẢN CÔNG',event.message,Math.max(1200,Number(event.durationSeconds||5)*450));pushLog(root,event.message,'break');}
        else if(event.counterState==='success'){setCaption(root,'PHÁ CƠ CHẾ THÀNH CÔNG',event.message,1500);floatNumber(root,'enemy','LỘ SƠ HỞ','break');pushLog(root,event.message,'break');}
        else if(event.counterState==='failure'){setCaption(root,'CƠ CHẾ BOSS HOÀN TẤT',event.message,1600);presentationFocus(root,'player',760);impact(root,'player',true);pushLog(root,event.message,'enemy');}
      }else if(event.type==='castStart'){
        const ultimate=isUltimateSkill(skill);const actorSide=event.actor||'enemy';
        const profile=applyPresentationTheme(root,skill,String(stage?.dataset?.playerDao||''));
        if(stage){stage.classList.remove('tier-normal','tier-heavy','tier-support','tier-ultimate');stage.classList.add(`tier-${profile.tier}`);}
        presentationFocus(root,actorSide,ultimate?1000:profile.focus);if(ultimate&&actorSide==='player')cinematicUltimate(root,1450);
        pulseActor(root,actorSide,actorMotionState(profile,'cast',ultimate),ultimate?860:Math.max(460,profile.focus));ambientPulse(root,'cast',actorSide);
        const displayName=skill?.name||event.skillName||event.message;
        if(actorSide==='enemy'){
          showEnemyIntent(root,skill,enemyIntentMs);
          if(event.bossTelegraph&&event.bossDangerLevel==='lethal')setCaption(root,event.bossDangerLabel||'ĐẠI SÁT',`${displayName} · vận chiêu ${Math.max(1,Math.ceil(Number(event.castTime)||1))}s`,Math.max(1100,enemyIntentMs));
          const entityId=String(stage?.dataset?.monsterId||'');
          const mapped=bossStateFromSkill(entityId,skill?.id||event.skillId||'');
          if(mapped)setBossState(root,mapped,{entityId,sticky:mapped==='phase2'||mapped==='phase3'});
          else setBossState(root,'cast',{entityId,holdMs:620});
        }
        if(ultimate)setCaption(root,displayName,presentationCaption(skill,actorSide,String(stage?.dataset?.playerDao||'')),1900);
        const genericEnemy=actorSide==='enemy'&&!event.skillId&&!String(skill?.id||'').startsWith('skill.rhino_');if((actorSide==='enemy'&&!genericEnemy)||(actorSide!=='enemy'&&!(skill?.runtimeV117?.slotClass==='basic'||String(skill?.id||'').endsWith('.basic'))))showSkillCallout(root,skill?.name?skill:displayName,actorSide,ultimate);
        spawnSkillFx(root,skill,actorSide,'cast');
        if(actorSide==='enemy'&&skill?.id==='skill.rhino_thunder_roar')lightning(root,'player');
        if(actorSide==='player'){const i=skills.findIndex(s=>s&&s.id===event.skillId);if(i>=0)setCooldown(root,i,Number(skill.cooldown||1));if(Number.isFinite(Number(event.spiritPct)))setSpirit(root,event.spiritPct,event.spiritCurrent,event.spiritMax);if(Number.isFinite(Number(event.ultimateGauge)))updateIntelMeter(root,'ultimateGauge',event.ultimateGauge,100);}
        pushLog(root,actorSide==='player'?`Thi triển ${displayName}.`:`${displayName} được kích hoạt.`,actorSide==='enemy'?'enemy':'player');
      }else if(event.type==='projectile'){
        const actorSide=event.actor||'player';const profile=presentationProfile(skill,String(stage?.dataset?.playerDao||''));presentationFocus(root,actorSide,Math.max(340,profile.focus));pulseActor(root,actorSide,actorMotionState(profile,'travel',profile.tier==='ultimate'),Math.max(420,profile.focus));spawnSkillFx(root,skill,actorSide,'travel');
        if(actorSide==='enemy')setBossState(root,'attack',{entityId:String(stage?.dataset?.monsterId||''),holdMs:520});

        const kind=event.delivery==='melee'?'sword':event.delivery||skill?.delivery||'arcane';
        if(kind==='sword'){pulseActor(root,actorSide,actorSide==='player'&&profile.motion==='dash'?'dash':actorSide==='player'?'sword':'attack',actorSide==='player'?620:500);swordArc(root,actorSide);}
        else if(kind==='lightning'){projectile(root,'lightning',actorSide);schedulePresentation(root,token,fxDelay(150),()=>lightning(root,target));}
        else projectile(root,kind,actorSide);
      }else if(event.type==='dodge'){
        presentationFocus(root,event.actor,400);pulseActor(root,event.actor,'dodge',460);floatNumber(root,event.actor,'NÉ','dodge');pushLog(root,event.message);ambientPulse(root,'dodge',event.actor);
      }else if(event.type==='crit'){
        pushLog(root,event.message,'crit');
      }else if(event.type==='damage'){
        if(event.actor==='enemy'&&(event.target||'player')==='player')clearEnemyIntent(root);
        const profile=presentationProfile(skill,String(stage?.dataset?.playerDao||''));
        const multi=Number(event.shotCount||0)>1;const lastHit=!multi||Number(event.shotIndex||0)>=Number(event.shotCount||0);
        const strongBase=impactIsStrong(event,skill,String(stage?.dataset?.playerDao||''));const strong=strongBase&&lastHit;
        const hitProfile=multi&&!lastHit?{...profile,camera:'none',hitStopMs:22}:profile;
        presentationFocus(root,'impact',strong?Math.max(620,profile.impact):multi?250:Math.max(380,profile.impact));pulseActor(root,target,'hit',strong?480:multi?220:350);spawnSkillFx(root,skill,event.actor|| (target==='enemy'?'player':'enemy'),'impact');impact(root,target,strong,hitProfile,skill);ambientPulse(root,'impact',target);
        if(target==='enemy'){
          setBossState(root,'hit',{entityId:String(stage?.dataset?.monsterId||''),holdMs:strong?520:multi?240:360});
          state.enemyHp=Number.isFinite(Number(event.hpPct))?Number(event.hpPct):state.enemyHp;maybeTriggerBossPhase(root,state.enemyHp);
        }
        if(event.amount)damageNumber(root,target,event.amount,Boolean(event.crit),event.damageKind||'direct');
        if(Number.isFinite(Number(event.hpPct)))setHp(root,target,event.hpPct,event.hpCurrent,event.hpMax);
        pushLog(root,`${event.message}${event.hpCurrent&&event.hpMax?` · HP ${event.hpCurrent}/${event.hpMax}`:''}`,event.actor==='player'?'damage':'enemy');
      }else if(event.type==='break'){
        const breakState=event.breakState||'pressure';setPoise(root,event.poisePct,breakState,event.breakDefenseReductionPct);
        pushLog(root,event.message,'break');
        if(breakState==='broken'){
          floatNumber(root,'enemy','PHÁ THẾ','break');presentationFocus(root,'impact',720);ambientPulse(root,'impact','enemy');
          addStatus(root,'enemy',{statusId:'hunt.break',statusName:`Thất Thế · Phòng -${Math.round(Number(event.breakDefenseReductionPct)||0)}%`,statusKind:'debuff',durationSeconds:Number(event.durationSeconds)||5});
          setCaption(root,'THẤT THẾ',`Phòng Ngự -${Math.round(Number(event.breakDefenseReductionPct)||0)}% · cửa sổ burst`,1000);
          startBreakWindow(root,Number(event.durationSeconds)||5,(Number(event.durationSeconds)||5)*1000*scale,event.breakDefenseReductionPct);
        }else if(breakState==='recovering'){removeStatus(root,'enemy','hunt.break');stopBreakWindow(root);}else if(breakState==='ready')stopBreakWindow(root);
      }else if(event.type==='heal'){
        presentationFocus(root,event.actor,480);pulseActor(root,event.actor,'heal',560);floatNumber(root,event.actor,event.amount?`+${event.amount}`:'+HP','heal');
        if(Number.isFinite(Number(event.hpPct)))setHp(root,event.target||event.actor,event.hpPct,event.hpCurrent,event.hpMax);ambientPulse(root,'heal',event.actor);
      }else if(event.type==='shield'){
        const shieldLabel=event.amount&&event.amount!=='0'?`Hộ Thể ${event.amount}`:(event.statusName||'Hộ Thể');
        addStatus(root,event.target||event.actor,{statusId:'combat.shield',statusName:shieldLabel,statusKind:'buff',durationSeconds:event.durationSeconds,message:event.message});ambientPulse(root,'heal',event.target||event.actor);
      }else if(event.type==='shieldBreak'){
        qa(root,`[data-status-tray="${event.target||event.actor}"]`).forEach(tray=>{tray.querySelectorAll('.status.buff').forEach(x=>x.remove());refreshStatusOverflow(tray);});qa(root,`[data-status-fx-layer="${event.target||event.actor}"] .fx-shield`).forEach(x=>x.remove());floatNumber(root,event.target||event.actor,'PHÁ HỘ THỂ','break');impact(root,event.target||event.actor,true);presentationFocus(root,'impact',620);
      }else if(event.type==='status'){
        pushLog(root,event.message);if(isMajorStatus(event))setCaption(root,event.statusName||'Trạng thái',event.message,1200);
        // Boss mechanic is an intrinsic encounter rule, not a timed debuff on the player.
        // It has its own persistent badge + detail sheet; only real timed statuses enter actor trays.
        if(String(event.statusId||'')!=='hunt.boss.mechanic')addStatus(root,event.target||'enemy',event);
      }else if(event.type==='mark'){
        pushLog(root,event.message,'mark');updateMark(root,event.target||'enemy',event);
      }else if(event.type==='resource'){
        updateCombatResource(root,event);pushLog(root,event.message,'resource');
      }else if(event.type==='summary'){
        // Keep combat intelligence available without covering the battlefield after every kill.
        showBattleSummary(root,event.battleSummary||{},false);pushLog(root,event.message,'system');
      }else if(event.type==='death'){
        // Death is communicated by actor defeat + the single battleEnd result cue.
        // Do not stack a second large "TRẤN SÁT" float over the battlefield.
        setHp(root,target,0,event.hpCurrent,event.hpMax);presentationFocus(root,'impact',900);pulseActor(root,target,'dead',980);ambientPulse(root,'death',target);
        if(target==='enemy')setBossState(root,'defeat',{entityId:String(stage?.dataset?.monsterId||''),sticky:true});
      }else if(event.type==='battleEnd'){
        const won=event.actor==='player';clearEnemyIntent(root);stopBreakWindow(root);showResult(root,won?'TRẤN SÁT':'THẤT BẠI','',won?'victory':'defeat');pushLog(root,event.message);
      }
    });
  }
  schedulePresentation(root,token,totalMs+fxDelay(1250),()=>{restoreEncounterVisual(root,state.encounterDefault);stage?.classList.remove('presentation-active','focus-player','focus-enemy','focus-impact','cinematic-ultimate','boss-phase-transition','tier-normal','tier-heavy','tier-support','tier-ultimate');clearPresentationTheme(root);resetCombatStagingState(root);});
  return {played:true,ms:totalMs};
}


function virtualFarmAttackCadenceV77(gapMs){return Math.max(900,Math.min(2400,gapMs/5));}
function playVirtualFarmHitV77(root,skills=[],farm={},progress=.25){
  const stage=q(root,'#huntV2Stage');if(!stage||stage.classList.contains('presentation-active')||stage.dataset.auto!=='1')return;
  const usable=skills.filter(Boolean);const skill=usable.length?usable[sequenceIndex%usable.length]:{id:'virtual.basic',name:'Đánh Thường',tags:['Melee'],delivery:'melee'};sequenceIndex++;
  const hpPct=Math.max(4,Math.min(96,100-Math.max(0,Math.min(.96,progress))*100));
  pulseActor(root,'player',skill?.delivery==='melee'?'dash':'attack',360);spawnSkillFx(root,skill,'player','travel');
  huntTransientTimeoutV129(root,()=>{if(stage.dataset.auto!=='1'||stage.classList.contains('presentation-active'))return;spawnSkillFx(root,skill,'player','impact');impact(root,'enemy',sequenceIndex%7===0);pulseActor(root,'enemy','hit',220);setHp(root,'enemy',hpPct,undefined,farm.mobHp||'');},Math.min(260,Math.max(90,Number(farm.secondsPerKill||2)*45)));
}
function playVirtualFarmKillV77(root,skills=[],farm={}){
  const stage=q(root,'#huntV2Stage');if(!stage||stage.classList.contains('presentation-active')||stage.dataset.auto!=='1')return;
  const usable=skills.filter(Boolean);const skill=usable.length?usable[sequenceIndex%usable.length]:{id:'virtual.basic',name:'Đánh Thường',tags:['Melee'],delivery:'melee'};sequenceIndex++;
  const enemy=actor(root,'enemy');if(!enemy)return;
  pulseActor(root,'player',skill?.delivery==='melee'?'dash':'attack',420);spawnSkillFx(root,skill,'player','travel');
  huntTransientTimeoutV129(root,()=>{
    if(stage.classList.contains('presentation-active')||stage.dataset.auto!=='1')return;
    spawnSkillFx(root,skill,'player','impact');impact(root,'enemy',sequenceIndex%5===0);pulseActor(root,'enemy','hit',280);setHp(root,'enemy',0,'0',farm.mobHp||'');
    huntTransientTimeoutV129(root,()=>{if(stage.dataset.auto!=='1')return;enemy.classList.add('state-dead');floatNumber(root,'enemy','TRẤN SÁT','death');huntTransientTimeoutV129(root,()=>{if(stage.dataset.auto!=='1')return;enemy.classList.remove('state-dead');enemy.classList.add('monster-enter');setHp(root,'enemy',100,farm.mobHp||'',farm.mobHp||'');huntTransientTimeoutV129(root,()=>enemy.classList.remove('monster-enter'),420);},240);},100);
  },Math.min(300,Math.max(100,Number(farm.secondsPerKill||2)*55)));
}

function syncFarmBatchPresentationV77(root,live={}){
  const count=Math.max(0,Number(live?.farmBatchCount)||0);
  if(lastFarmBatchCount<0){lastFarmBatchCount=count;return false;}
  if(count===lastFarmBatchCount)return false;
  lastFarmBatchCount=count;const batch=live?.lastFarmBatch;if(!batch)return false;
  const drops=(batch.equipmentDropNames||[]).slice(0,2);
  setCaption(root,`Chiến lợi phẩm · ${fmt(batch.kills||0,0)} yêu thú`,`+${fmt(batch.spiritStones||0,0)} Linh Thạch · +${fmt(batch.demonCores||0,0)} Yêu Đan${drops.length?` · ${drops.join(' · ')}`:''}`,1800);
  pushLog(root,`Săn Ảo T${((Number(batch.floor)||1)-1)%100+1}: ${fmt(batch.kills||0,0)} yêu thú${batch.eliteKills?` · ${fmt(batch.eliteKills,0)} Tinh Anh`:''} · +${fmt(batch.spiritStones||0,0)} Linh Thạch · +${fmt(batch.demonCores||0,0)} Yêu Đan.`,'loot');
  if((batch.equipmentRolls||0)>0)floatNumber(root,'enemy',`RƠI ĐỒ ×${fmt(batch.equipmentRolls,0)}`,'death');
  return true;
}

export function mountHuntCombatV2(root,ctx){
  if(activeHuntRoot&&activeHuntRoot!==root)cleanupHuntRootV129(activeHuntRoot);
  activeHuntRoot=root;
  clearInterval(fxTimer); fxTimer=null;
  const stage=q(root,'#huntV2Stage'); if(!stage)return;
  const {model,live,action}=ctx;
  const skills=combatDockSkills((model?.character?.knownSkills||[]).filter(x=>x.active));
  syncConfidantPresentationV87(model,root);
  syncArtifactPresentationV88(model,root);
  syncSpiritBeastPresentationV86(model).then(()=>startCombatPixi(root,stage,model)).catch(()=>startCombatPixi(root,stage,model).catch(()=>{}));
  const auto=Boolean(live?.autoCombat??(live?.mode==='hunt')); const locked=stage.dataset.locked==='1';

  const syncCombatControls=()=>{
    const log=q(root,'#huntv2Log');
    if(log){log.classList.toggle('hidden',!logVisible);log.setAttribute('aria-hidden',logVisible?'false':'true');}
    const preview=q(root,'#huntv2LogPreview');if(preview){preview.classList.toggle('expanded',logVisible);preview.classList.toggle('compact-hidden',logCompactHidden);preview.setAttribute('aria-hidden',logCompactHidden?'true':'false');}
    const restore=q(root,'[data-combat-log-show]');if(restore){restore.classList.toggle('show',logCompactHidden);restore.setAttribute('aria-hidden',logCompactHidden?'false':'true');}
    qa(root,'[data-combat-log-toggle]').forEach(x=>{x.classList.toggle('active',logVisible);x.setAttribute('aria-pressed',logVisible?'true':'false');});
    qa(root,'[data-combat-fx-quality]').forEach(x=>{x.classList.toggle('active',!fxPaused);x.setAttribute('aria-pressed',fxPaused?'false':'true');x.dataset.fxQuality=combatFxQuality;const label=x.querySelector('span');if(label)label.textContent=`FX ${combatFxQuality==='low'?'Thấp':combatFxQuality==='high'?'Cao':combatFxQuality==='off'?'Tắt':'Chuẩn'}`;});
    stage.classList.toggle('fx-paused',fxPaused);stage.dataset.fxSpeed=String(COMBAT_PRESENTATION_SPEED);stage.dataset.combatTimeline='realtime';syncCombatPixiFxState();
  };
  syncCombatControls();
  root._huntFarmViewV77=model?.endlessHunt?.farm||{};lastFarmBatchCount=Math.max(0,Number(live?.farmBatchCount)||0);
  const farmStart=performance.now();virtualFarmCycleStartedAt=farmStart;nextVirtualFarmKillAt=farmStart+Math.max(2000,Math.min(180000,Number(root._huntFarmViewV77?.secondsPerKill||8)*1000));nextVirtualFarmHitAt=farmStart+350;
  if(auto&&root._huntFarmViewV77?.available){
    const cores=Math.max(1,Number(globalThis.navigator?.hardwareConcurrency||8));
    const memory=Number(globalThis.navigator?.deviceMemory||0);
    const lowEnd=cores<=4||(memory>0&&memory<=4);
    const farmPresentationTickMs=combatFxQuality==='off'?600:(combatFxQuality==='low'||lowEnd?260:180);
    fxTimer=setInterval(()=>{if(!root.isConnected||globalThis.document?.hidden||fxPaused)return;const farmNow=root._huntFarmViewV77||{};const stageNow=q(root,'#huntV2Stage');if(!farmNow.available||stageNow?.dataset?.auto!=='1'||stageNow?.classList.contains('presentation-active'))return;const now=performance.now();const gap=Math.max(2000,Math.min(180000,Number(farmNow.secondsPerKill||8)*1000));
      if(now>=nextVirtualFarmKillAt){playVirtualFarmKillV77(root,skills,farmNow);virtualFarmCycleStartedAt=now;nextVirtualFarmKillAt=now+gap;nextVirtualFarmHitAt=now+Math.min(700,virtualFarmAttackCadenceV77(gap));return;}
      if(now>=nextVirtualFarmHitAt){const progress=Math.max(0,Math.min(.96,(now-virtualFarmCycleStartedAt)/Math.max(1,gap)));playVirtualFarmHitV77(root,skills,farmNow,progress);nextVirtualFarmHitAt=now+virtualFarmAttackCadenceV77(gap);}
    },farmPresentationTickMs);
  }
  const devBox=q(root,'[data-dev-sandbox]');
  if(devBox){
    q(devBox,'[data-dev-toggle]')?.addEventListener('click',()=>devBox.classList.toggle('open'));
    q(devBox,'[data-dev-sync]')?.addEventListener('click',async()=>{
      try{const raw=localStorage.getItem('tutien.web.save.v1');if(!raw){setCaption(root,'DEV · Chưa có save thật','Hãy chơi/lưu ở tab production trước.',1050);return;}await action({action:'devSandboxSyncSave',save:JSON.parse(raw)});devBox.classList.remove('open');}
      catch{setCaption(root,'DEV · Đồng bộ thất bại','Save production không hợp lệ.',1050);}
    });
    const applyDevPreset=async()=>{
      const realmOrder=Number(q(devBox,'[name="devRealm"]')?.value||10);
      const dao=q(devBox,'[name="devDao"]')?.value||'sword';
      const forceBoss=Boolean(q(devBox,'[name="devBoss"]')?.checked);
      await action({action:'devSandboxPreset',realmOrder,dao,forceBoss});
    };
    q(devBox,'[data-dev-apply]')?.addEventListener('click',applyDevPreset);
    qa(devBox,'[data-dev-dao-quick]').forEach(btn=>btn.addEventListener('click',async()=>{
      const select=q(devBox,'[name="devDao"]');if(select)select.value=btn.dataset.devDaoQuick||'sword';
      qa(devBox,'[data-dev-dao-quick]').forEach(x=>x.classList.toggle('active',x===btn));
      await applyDevPreset();
    }));
    const addDevStatuses=(target,kind,count=5,prefix='DEV')=>{
      const names=kind==='buff'?['Cường Công','Hộ Thể','Tăng Tốc','Hồi Phục','Bất Khuất']:['Giáp Liệt','Trúng Độc','Huyết Thương','Chậm','Phong Ấn'];
      names.slice(0,count).forEach((name,index)=>addStatus(root,target,{statusId:`dev.${target}.${kind}.${index}`,statusName:name,statusKind:kind,durationSeconds:9-index*.7,message:`${prefix} · ${name}`}));
    };
    const previewHud=mode=>{
      const reset=()=>{resetCombatStagingState(root);root.classList.add('is-active-combat','is-dev-hud-preview');};
      if(mode==='clear'){resetCombatStagingState(root);root.classList.remove('is-active-combat','is-dev-hud-preview');setCaption(root,'DEV HUD · RESET','Trạng thái staging sạch.',900);return;}
      if(mode==='player-full'){reset();setHp(root,'player',100);setSpirit(root,100);setCaption(root,'DEV · PLAYER 100%','HP/CN đầy.',900);return;}
      if(mode==='player-low'){reset();setHp(root,'player',18);setSpirit(root,26);setCaption(root,'DEV · LOW HP','HP 18% · CN 26%.',1000);return;}
      if(mode==='player-shield'){reset();addStatus(root,'player',{statusId:'combat.shield',statusName:'Hộ Thể 1.2K',statusKind:'buff',durationSeconds:8,message:'DEV shield preview'});setCaption(root,'DEV · SHIELD','Hộ Thể 1.2K.',900);return;}
      if(mode==='player-5buff'){reset();addDevStatuses('player','buff',5,'DEV player buff');setCaption(root,'DEV · 5 BUFF','Kiểm tra overflow +N.',950);return;}
      if(mode==='player-5debuff'){reset();addDevStatuses('player','debuff',5,'DEV player debuff');setCaption(root,'DEV · 5 DEBUFF','Kiểm tra overflow +N.',950);return;}
      if(mode==='resources'){reset();qa(root,'[data-intel-resource]').forEach(m=>updateIntelMeter(root,m.dataset.intelResource,Number(m.dataset.max||100)*.5,Number(m.dataset.max||100)));setCaption(root,'DEV · TÀI NGUYÊN','Các meter Bản Đạo ở 50%.',1000);return;}
      if(mode==='ultimate'){reset();updateIntelMeter(root,'ultimateGauge',100,100);setCaption(root,'DEV · TUYỆT KỸ','Gauge 100/100 · chỉ preview.',1000);return;}
      if(mode==='boss-normal'){reset();setPoise(root,100,'ready');setBossPhaseBadge(root,1);setCaption(root,'DEV · BOSS NORMAL','P1 · Phá Thế 0.',900);return;}
      if(mode==='break70'){reset();setPoise(root,30,'pressure');setCaption(root,'DEV · PHÁ THẾ','70/100 · gần Thất Thế.',1000);return;}
      if(mode==='broken'){reset();setPoise(root,0,'broken',15);addStatus(root,'enemy',{statusId:'hunt.break',statusName:'Thất Thế · Phòng -15%',statusKind:'debuff',durationSeconds:5});startBreakWindow(root,5,5000,15);setCaption(root,'DEV · THẤT THẾ','Boss: Phòng -15% trong 5s.',1000);return;}
      if(mode==='stable'){reset();setPoise(root,100,'recovering');setCaption(root,'DEV · ỔN THẾ','Tạm miễn Phá Thế mới.',1000);return;}
      if(mode==='boss-p2'){reset();setBossPhaseBadge(root,2,'Phase II');setBossState(root,'phase2',{entityId:String(stage.dataset.monsterId||''),sticky:true});setCaption(root,'DEV · PHASE II','Kiểm tra HUD phase.',900);return;}
      if(mode==='boss-p3'){reset();setBossPhaseBadge(root,3,'Phase III');setBossState(root,'phase3',{entityId:String(stage.dataset.monsterId||''),sticky:true});setCaption(root,'DEV · PHASE III','Kiểm tra HUD phase.',900);return;}
      if(mode==='telegraph'){reset();showEnemyIntent(root,{name:'Trấn Sơn Liệt Trảo',tags:['Heavy','Boss']},2400);return;}
      if(mode==='telegraph-lethal'){reset();showEnemyIntent(root,{name:'Đại Sát · Hắc Phong Diệt',tags:['Ultimate','Boss']},3200);setCaption(root,'ĐẠI SÁT','Boss đang vận chiêu nguy hiểm.',2200);return;}
      if(mode==='boss-5debuff'){reset();addDevStatuses('enemy','debuff',5,'DEV boss debuff');setCaption(root,'DEV · BOSS 5 DEBUFF','Kiểm tra overflow +N.',950);return;}
      if(mode==='boss-mark6'){reset();updateMark(root,'enemy',{markId:'dev.mark',statusName:'Đạo Ấn',stacks:6,maxStacks:6});setCaption(root,'DEV · ẤN','Đạo Ấn 6/6.',900);return;}
      if(mode==='counter'){reset();setCaption(root,'CỬA PHẢN CÔNG','Dùng Phá/Bộc Phát để bẻ cơ chế Boss.',2400);addStatus(root,'enemy',{statusId:'dev.counter',statusName:'Cửa Phản Công',statusKind:'debuff',durationSeconds:5,message:'DEV preview counter window'});return;}
      if(mode==='stress'){
        reset();setHp(root,'player',24);setSpirit(root,42);qa(root,'[data-intel-resource]').forEach(m=>updateIntelMeter(root,m.dataset.intelResource,Number(m.dataset.max||100)*.78,Number(m.dataset.max||100)));updateIntelMeter(root,'ultimateGauge',100,100);addDevStatuses('player','buff',5,'Stress player buff');addDevStatuses('enemy','debuff',5,'Stress boss debuff');updateMark(root,'enemy',{markId:'dev.stress.mark',statusName:'Đạo Ấn',stacks:6,maxStacks:6});setPoise(root,22,'pressure');setBossPhaseBadge(root,3,'Phase III');showEnemyIntent(root,{name:'Đại Sát · Hắc Phong Diệt',tags:['Ultimate','Boss']},4200);setCaption(root,'DEV · FULL HUD STRESS','Low HP · 5+5 status · 78 Phá Thế · Ult ready · P3.',1700);return;
      }
    };
    qa(devBox,'[data-dev-hud]').forEach(btn=>btn.addEventListener('click',()=>previewHud(btn.dataset.devHud||'clear')));
    const forcePose=pose=>{
      const el=actor(root,'player');if(!el)return;
      el.classList.remove('state-cast','state-dash','state-sword','state-ultimate','state-hit','state-dodge','state-heal','state-dead','state-attack');
      if(pose==='cast')el.classList.add('state-cast');else if(pose==='attack')el.classList.add('state-attack');else if(pose==='hit')el.classList.add('state-hit');else if(pose==='ultimate')el.classList.add('state-ultimate');else if(pose==='defeat')el.classList.add('state-dead');
      setCaption(root,`DEV · ${String(pose).toUpperCase()}`,'Chỉ đổi presentation; không gọi backend.',900);
    };
    qa(devBox,'[data-dev-pose]').forEach(btn=>btn.addEventListener('click',()=>forcePose(btn.dataset.devPose||'idle')));
    q(devBox,'[data-dev-sequence]')?.addEventListener('click',()=>{['idle','cast','attack','hit','ultimate','defeat','idle'].forEach((pose,i)=>setTimeout(()=>{if(root.isConnected)forcePose(pose)},i*900));});
    const forceBossState=stateName=>{
      setBossState(root,stateName,{entityId:String(stage.dataset.monsterId||''),sticky:['phase2','phase3','defeat'].includes(stateName)});
      setCaption(root,`DEV BOSS · ${String(stateName).toUpperCase()}`,'1 ảnh gốc + transform/overlay runtime.',900);
    };
    qa(devBox,'[data-dev-boss-state]').forEach(btn=>btn.addEventListener('click',()=>forceBossState(btn.dataset.devBossState||'idle')));
    q(devBox,'[data-dev-boss-sequence]')?.addEventListener('click',()=>{['idle','attack','cast','hit','phase2','phase3','defeat','idle'].forEach((stateName,i)=>setTimeout(()=>{if(root.isConnected)forceBossState(stateName)},i*850));});
    const forceDevFx=type=>{const dao=q(devBox,'[name="devDao"]')?.value||'sword';const target=type==='impact'?'enemy':undefined;const side='player';const pixi=type==='travel'?playCombatPixiFx({type:'projectile',kind:'arcane',side,fallbackDao:dao}):type==='impact'?playCombatPixiFx({type:'impact',target,strong:true,camera:'medium',fallbackDao:dao}):playCombatPixiFx({type,side,fallbackDao:dao,skill:{name:`DEV ${dao}`,tags:[dao],slot:type==='ultimate'?'ultimate':''}});if(!pixi)playDevFx(root,dao,type);setCaption(root,`DEV FX · ${String(type).toUpperCase()}`,`${pixi?'Pixi':'DOM'} · Theme ${dao}.`,760);};
    qa(devBox,'[data-dev-fx]').forEach(btn=>btn.addEventListener('click',()=>forceDevFx(btn.dataset.devFx||'cast')));
    q(devBox,'[data-dev-fx-sequence]')?.addEventListener('click',()=>{['cast','travel','impact','field','ultimate'].forEach((type,i)=>setTimeout(()=>{if(root.isConnected)forceDevFx(type)},i*760));});


    /* V4 DEV Auto Tour: one click -> one recordable pass over all UI-relevant combat states.
       The tour intentionally mixes backend-authoritative presets/fight with presentation-only
       state forcing. It never writes production save because ?dev=1 already routes to RAM-only DEV. */
    const devTourState=()=>globalThis.__TUTIEN_COMBAT_QA_TOUR__||null;
    const currentCombatRoot=()=>document.querySelector('.huntv2-screen.huntv2-combat-v8')||root;
    const collectDevLayoutIssuesV8=(combatRoot=currentCombatRoot())=>{
      if(!combatRoot)return [];const client=combatRoot.getBoundingClientRect(),issues=[];
      const visible=el=>{const st=getComputedStyle(el);return st.display!=='none'&&st.visibility!=='hidden'&&Number(st.opacity||1)>0&&el.getClientRects().length>0;};
      if(combatRoot.scrollWidth>combatRoot.clientWidth+2)issues.push(`root overflow +${combatRoot.scrollWidth-combatRoot.clientWidth}px`);
      const geometryNodes=[...combatRoot.querySelectorAll('.huntv2-top-identity,.huntv2-resource-row,.huntv2-meta-strip,.huntv2-enemy-hud,.huntv2-player-hud,.huntv2-console,.huntv2-skills,.huntv2-intel-lane,.huntv2-log-preview,.huntv2-enemy-intent,.huntv2-break-window')];
      for(const el of geometryNodes){if(!visible(el))continue;const r=el.getBoundingClientRect();if(r.left<client.left-2||r.right>client.right+2)issues.push(`${el.classList[0]} ngoài ngang`);if(r.top<client.top-2||r.bottom>client.bottom+2)issues.push(`${el.classList[0]} ngoài dọc`);}
      const nav=document.querySelector('.bottom-nav');if(nav&&visible(nav)){const shell=combatRoot.closest('.game-shell')?.getBoundingClientRect();const r=nav.getBoundingClientRect();if(shell&&(r.left<shell.left-2||r.right>shell.right+2||r.bottom>shell.bottom+2))issues.push('bottom-nav ngoài portrait client');if(nav.scrollWidth>nav.clientWidth+2)issues.push(`bottom-nav overflow +${nav.scrollWidth-nav.clientWidth}px`);}
      for(const el of combatRoot.querySelectorAll('button,b,strong,span,small,em,i')){if(!visible(el)||!String(el.textContent||'').trim())continue;const fs=parseFloat(getComputedStyle(el).fontSize||'0');if(fs>0&&fs<10)issues.push(`text ${fs}px · ${String(el.textContent||'').trim().slice(0,18)}`);}
      globalThis.__TUTIEN_COMBAT_QA_LAYOUT__={at:Date.now(),issues:[...new Set(issues)]};return globalThis.__TUTIEN_COMBAT_QA_LAYOUT__.issues;
    };
    const currentDevSandbox=()=>document.querySelector('[data-dev-sandbox]');
    const tourSleep=ms=>new Promise(resolve=>setTimeout(resolve,Math.max(0,Number(ms)||0)));
    const tourAlive=token=>{const state=devTourState();return Boolean(state&&state.token===token&&!state.cancelled);};
    const showTourHud=(token,title,sub,step,total)=>{
      if(!tourAlive(token))return false;
      const box=document.querySelector('[data-dev-tour-hud]');if(!box)return false;
      box.hidden=false;const strong=box.querySelector('[data-dev-tour-title]'),span=box.querySelector('[data-dev-tour-step]'),fill=box.querySelector('[data-dev-tour-progress]');const layoutIssues=collectDevLayoutIssuesV8();
      if(strong)strong.textContent=`${String(title||'AUTO QA')}${layoutIssues.length?` · ⚠${layoutIssues.length}`:''}`;if(span)span.textContent=String(sub||'');if(fill)fill.style.width=`${clamp((Number(step)||0)/Math.max(1,Number(total)||1)*100,0,100)}%`;
      return true;
    };
    const hideTourPanel=()=>{const box=currentDevSandbox();box?.classList.remove('open');};
    const stopTour=(reason='Đã dừng')=>{const state=devTourState();if(state)state.cancelled=true;document.body.classList.remove('combat-dev-tour-running');const box=document.querySelector('[data-dev-tour-hud]');if(box){const span=box.querySelector('[data-dev-tour-step]');if(span)span.textContent=reason;setTimeout(()=>{if(box.isConnected)box.hidden=true;},1200);}};
    q(devBox,'[data-dev-tour-stop]')?.addEventListener('click',()=>stopTour('Đã dừng theo yêu cầu'));

    const tourReset=(targetRoot,{playerHp=86,spirit=72,poise=82,phase=1,ultimate=42,resource=.55}={})=>{
      if(!targetRoot)return;
      resetCombatStagingState(targetRoot);targetRoot.classList.add('is-active-combat','is-dev-hud-preview','is-dev-auto-tour');
      setHp(targetRoot,'player',playerHp);setSpirit(targetRoot,spirit);setPoise(targetRoot,poise,poise<=0?'broken':poise<45?'pressure':'ready');setBossPhaseBadge(targetRoot,phase,`Phase ${phase===1?'I':phase===2?'II':'III'}`);
      qa(targetRoot,'[data-intel-resource]').forEach(m=>{const max=Math.max(1,Number(m.dataset.max||100));updateIntelMeter(targetRoot,m.dataset.intelResource,max*resource,max);});
      updateIntelMeter(targetRoot,'ultimateGauge',ultimate,100);
    };
    const addTourStatuses=(targetRoot,target,kind,count=5)=>{
      const names=kind==='buff'?['Cường Công','Hộ Thể','Tăng Tốc','Hồi Phục','Bất Khuất']:['Giáp Liệt','Trúng Độc','Huyết Thương','Chậm','Phong Ấn'];
      names.slice(0,count).forEach((name,index)=>addStatus(targetRoot,target,{statusId:`tour.${target}.${kind}.${index}`,statusName:name,statusKind:kind,durationSeconds:9-index*.7,message:`AUTO QA · ${name}`}));
    };
    const tourFx=(targetRoot,dao,type)=>{
      const target=type==='impact'?'enemy':undefined,side='player';
      const skill={id:`dev.tour.${dao}.${type}`,name:`${String(dao).toUpperCase()} · ${type}`,tags:[dao,type],slot:type==='ultimate'?'ultimate':''};
      const pixi=type==='travel'?playCombatPixiFx({type:'projectile',kind:'arcane',side,target:'enemy',skill,fallbackDao:dao}):type==='impact'?playCombatPixiFx({type:'impact',target:'enemy',strong:true,camera:'medium',skill,fallbackDao:dao}):playCombatPixiFx({type,side,target,skill,strong:type==='ultimate',fallbackDao:dao});
      if(!pixi)playDevFx(targetRoot,dao,type);return pixi;
    };
    const tourPose=(targetRoot,pose)=>{
      const el=actor(targetRoot,'player');if(!el)return;el.classList.remove('state-cast','state-dash','state-sword','state-ultimate','state-hit','state-dodge','state-heal','state-dead','state-attack');
      if(pose==='cast')el.classList.add('state-cast');else if(pose==='attack')el.classList.add('state-attack');else if(pose==='hit')el.classList.add('state-hit');else if(pose==='ultimate')el.classList.add('state-ultimate');else if(pose==='defeat')el.classList.add('state-dead');
    };
    /* V9 DEV Combat Visual Showcase.  Every method below changes presentation
       state in the RAM-only DEV route; it never dispatches a gameplay action or
       writes a save.  Skill objects are the exact seven objects already in the
       combat dock, while the event labels make the fixture boundary explicit. */
    const showcaseBegin=(sceneName)=>{
      const target=currentCombatRoot();if(!target)return {target:null,stage:null,token:0};
      const token=clearPresentationTimers(target);clearHuntTransientTimersV129(target);resetCombatStagingState(target);setCaption(target,'','');
      q(target,'#huntv2SkillCallout')?.classList.remove('show');
      qa(target,'.huntv2-float,.huntv2-status-callout').forEach(node=>node.remove());
      target.classList.add('is-dev-showcase','is-active-combat');target.dataset.devShowcaseScene=String(sceneName||'');delete target.dataset.devShowcaseSkill;delete target.dataset.devShowcasePhase;delete target.dataset.devShowcaseShake;delete target.dataset.devShowcaseShakePhase;
      const stageNode=q(target,'#huntV2Stage');if(stageNode){stageNode.classList.add('presentation-active');stageNode.classList.remove('shake','shake-strong','hit-stop');stageNode.dataset.devShowcaseScene=String(sceneName||'');}
      return {target,stage:stageNode,token};
    };
    const showcaseResources=(target,{resource=.72,ultimate=0}={})=>{
      qa(target,'[data-intel-resource]').forEach(m=>{const max=Math.max(1,Number(m.dataset.max||100));updateIntelMeter(target,m.dataset.intelResource,max*clamp(Number(resource)||0,0,1),max);});
      updateIntelMeter(target,'ultimateGauge',ultimate,100);
    };
    const showcaseSkill=(index=0)=>{
      const i=Math.max(0,Math.min(skills.length-1,Math.round(Number(index)||0)));const skill=skills[i];
      if(!skill)return {ok:false,index:i,reason:'skill-unavailable'};
      const {target,stage,token}=showcaseBegin('03-skill-cast');if(!target)return {ok:false,index:i,reason:'combat-unavailable'};
      const ultimate=isUltimateSkill(skill),profile=applyPresentationTheme(target,skill,String(stage?.dataset?.playerDao||''));
      const cost=Math.max(0,Number(skill.spiritCost)||0);target.dataset.devShowcaseSkill=String(i+1);target.dataset.devShowcaseSkillId=String(skill.id||'');target.dataset.devShowcasePhase='cast';
      setHp(target,'player',86);setHp(target,'enemy',92);setSpirit(target,Math.max(18,82-Math.min(64,cost)));showcaseResources(target,{resource:.62,ultimate:ultimate?100:58});
      presentationFocus(target,'player',ultimate?1050:Math.max(520,profile.focus));pulseActor(target,'player',actorMotionState(profile,'cast',ultimate),ultimate?900:Math.max(480,profile.focus));showSkillCallout(target,skill,'player',ultimate);spawnSkillFx(target,skill,'player','cast');setCooldown(target,i,Math.max(1.1,Number(skill.cooldown)||1.8));
      schedulePresentation(target,token,300,()=>{if(!target.isConnected)return;target.dataset.devShowcasePhase='travel';pulseActor(target,'player',actorMotionState(profile,'travel',ultimate),Math.max(420,profile.focus));spawnSkillFx(target,skill,'player','travel');});
      schedulePresentation(target,token,610,()=>{if(!target.isConnected)return;target.dataset.devShowcasePhase='impact';pulseActor(target,'enemy','hit',ultimate?560:420);spawnSkillFx(target,skill,'player','impact');impact(target,'enemy',ultimate||profile.tier==='heavy',{camera:ultimate?'heavy':profile.tier==='heavy'?'medium':'light',hitStopMs:ultimate?72:42},skill);});
      return {ok:true,index:i,id:String(skill.id||''),name:String(skill.name||''),icon:productionSkillIconPath(skill.id),ultimate,cost,cooldown:Number(skill.cooldown)||0};
    };
    const showcaseStatusStress=()=>{
      const {target,stage}=showcaseBegin('02-status-stress');if(!target)return {ok:false};
      target.dataset.devShowcaseEvents='buff,debuff,enemy-debuff,shield,heal,poison-dot,mark,persistent-injury,overflow';
      setHp(target,'player',38);setSpirit(target,46);setHp(target,'enemy',68);setPoise(target,18,'pressure');setBossPhaseBadge(target,3,'Phase III');showcaseResources(target,{resource:.78,ultimate:100});
      addDevStatuses('player','buff',3,'SHOWCASE player buff');addDevStatuses('player','debuff',3,'SHOWCASE player debuff');
      addStatus(target,'player',{statusId:'dev.showcase.shield',statusName:'Hộ Thể · 96K',statusKind:'buff',durationSeconds:8,message:'DEV showcase · shield gain'});
      addStatus(target,'player',{statusId:'dev.showcase.poison',statusName:'Trúng Độc · DoT',statusKind:'debuff',durationSeconds:7,stacks:3,maxStacks:5,message:'DEV showcase · poison tick'});
      addStatus(target,'player',{statusId:'dev.showcase.injury',statusName:'Thương Tích Vĩnh Viễn',statusKind:'debuff',stacks:2,maxStacks:5,message:'DEV showcase · persistent injury'});
      addDevStatuses('enemy','debuff',5,'SHOWCASE enemy debuff');updateMark(target,'enemy',{markId:'dev.showcase.mark',statusName:'Đạo Ấn',stacks:6,maxStacks:6});
      showEnemyIntent(target,{name:'Đại Sát · Hắc Phong Diệt',tags:['Ultimate','Boss']},4200);showSkillCallout(target,{id:'skill.rhino_overcharge',name:'Lôi Giác Bạo Tẩu',tags:['Boss','Buff'],slot:'ultimate'},'enemy',true);
      floatNumber(target,'player','+42.6K','heal');damageNumber(target,'enemy',5200,false,'dot');impact(target,'enemy',false,{camera:'light'},skills[0]||{});setCaption(target,'DEV SHOWCASE · STATUS STRESS','Buff/debuff · Hộ Thể · Hồi Phục · DoT · Ấn 6/6 · overflow +N.',2600);
      return {ok:true,scene:'02-status-stress',stage:stage?.dataset?.monsterId||'',events:target.dataset.devShowcaseEvents};
    };
    const showcaseDamageStress=()=>{
      const {target,stage,token}=showcaseBegin('04-damage-stress');if(!target)return {ok:false};
      const skill=skills.find(x=>x&&!isUltimateSkill(x))||skills[0]||{};target.dataset.devShowcaseEvents='normal,critical,multi-hit,dot,heal,shield-gain,shield-break,resource-gain-loss';
      setHp(target,'player',74);setSpirit(target,64);setHp(target,'enemy',82);setPoise(target,52,'ready');showcaseResources(target,{resource:.44,ultimate:72});
      addStatus(target,'player',{statusId:'dev.showcase.damage.shield',statusName:'Hộ Thể · 64K',statusKind:'buff',durationSeconds:7,message:'DEV showcase · shield gain'});
      const hit=(amount,crit=false,kind='direct',camera='light')=>{pulseActor(target,'enemy','hit',crit?520:300);spawnSkillFx(target,skill,'player','impact');impact(target,'enemy',crit,{camera,hitStopMs:crit?66:28},skill);damageNumber(target,'enemy',amount,crit,kind);};
      hit(18400,false,'direct','light');
      schedulePresentation(target,token,90,()=>hit(17200,false,'direct','none'));
      schedulePresentation(target,token,360,()=>hit(238000,true,'direct','heavy'));
      schedulePresentation(target,token,470,()=>{damageNumber(target,'enemy',5200,false,'dot');floatNumber(target,'enemy','DoT','damage');});
      schedulePresentation(target,token,580,()=>{pulseActor(target,'player','heal',560);floatNumber(target,'player','+42.6K','heal');setHp(target,'player',81);addStatus(target,'player',{statusId:'dev.showcase.damage.heal',statusName:'Hồi Phục · 42.6K',statusKind:'buff',durationSeconds:4,message:'DEV showcase · heal event'});});
      schedulePresentation(target,token,690,()=>{updateCombatResource(target,{resourceId:'ultimateGauge',resourceValue:94,resourceMax:100,message:'DEV showcase · resource gain'});floatNumber(target,'player','+22 CN','resource');});
      schedulePresentation(target,token,800,()=>{removeStatus(target,'player','dev.showcase.damage.shield');floatNumber(target,'player','PHÁ HỘ THỂ','break');impact(target,'player',true,{camera:'medium',hitStopMs:52},skill);});
      schedulePresentation(target,token,910,()=>{damageNumber(target,'enemy',7300,false,'markBurst');floatNumber(target,'enemy','NỔ ẤN ×2','break');});
      setCaption(target,'DEV SHOWCASE · DAMAGE PRESENTATION','Direct ×2 · Bạo Kích · DoT · Hồi Phục · Hộ Thể · resource · Nổ Ấn.',2500);
      return {ok:true,scene:'04-damage-stress',skillId:String(skill.id||''),events:target.dataset.devShowcaseEvents};
    };
    const showcaseBossBreak=(stateName='near-break')=>{
      const normalized=String(stateName||'near-break').replace(/^scene-05-boss-break-?/,'')||'near-break';const {target,stage}=showcaseBegin(`05-boss-break-${normalized}`);if(!target)return {ok:false};
      target.dataset.devShowcaseBossBreak=normalized;setHp(target,'enemy',58);setBossPhaseBadge(target,3,'Phase III');
      const bossSkill={id:'skill.rhino_charge',name:'Lôi Giác Xung Thiên',tags:['Beast','Lightning','Heavy','Break'],delivery:'melee'};
      if(normalized==='broken'){setPoise(target,0,'broken',15);addStatus(target,'enemy',{statusId:'hunt.break',statusName:'Thất Thế · Phòng -15%',statusKind:'debuff',durationSeconds:5,message:'DEV showcase · break window'});startBreakWindow(target,5,5000,15);showSkillCallout(target,bossSkill,'enemy',false);floatNumber(target,'enemy','PHÁ THẾ','break');impact(target,'enemy',true,{camera:'heavy',hitStopMs:68},bossSkill);setBossState(target,'hit',{entityId:String(stage?.dataset?.monsterId||''),sticky:true});setCaption(target,'DEV SHOWCASE · THẤT THẾ','Boss Poise broken · break status · cửa sổ burst 5s.',2200);
      }else if(normalized==='recovery'||normalized==='recovering'){setPoise(target,100,'recovering');removeStatus(target,'enemy','hunt.break');stopBreakWindow(target);clearEnemyIntent(target);setBossState(target,'phase3',{entityId:String(stage?.dataset?.monsterId||''),sticky:true});setCaption(target,'DEV SHOWCASE · ỔN THẾ','Boss đã hồi phục · tạm miễn Phá Thế mới.',2200);
      }else{setPoise(target,18,'pressure');setBossState(target,'cast',{entityId:String(stage?.dataset?.monsterId||''),sticky:true});showEnemyIntent(target,{name:'Đại Sát · Hắc Phong Diệt',tags:['Ultimate','Boss']},3200);showSkillCallout(target,{id:'skill.rhino_overcharge',name:'Lôi Giác Bạo Tẩu',tags:['Boss','Lightning','Ultimate'],slot:'ultimate'},'enemy',true);setCaption(target,'DEV SHOWCASE · BOSS BREAK','Telegraph · HP · Poise 82/100 · gần Thất Thế.',2200);}
      return {ok:true,scene:'05-boss-break',state:normalized};
    };
    const showcaseFullChaos=()=>{
      const {target,stage,token}=showcaseBegin('06-full-chaos');if(!target)return {ok:false};
      const skill=skills.find(x=>x&&!isUltimateSkill(x))||skills[0]||{};const ultimate=skills.find(isUltimateSkill)||skill;target.dataset.devShowcaseEvents='skill,boss-telegraph,damage,status,support,hp-cn,poise,vfx';
      setHp(target,'player',29);setSpirit(target,37);setHp(target,'enemy',47);setPoise(target,16,'pressure');setBossPhaseBadge(target,3,'Phase III');showcaseResources(target,{resource:.86,ultimate:100});
      addDevStatuses('player','buff',3,'CHAOS player buff');addDevStatuses('player','debuff',3,'CHAOS player debuff');addDevStatuses('enemy','debuff',5,'CHAOS boss debuff');
      addStatus(target,'player',{statusId:'dev.chaos.shield',statusName:'Hộ Thể · 120K',statusKind:'buff',durationSeconds:8,message:'DEV showcase · shield'});addStatus(target,'player',{statusId:'dev.chaos.poison',statusName:'Trúng Độc · DoT',statusKind:'debuff',durationSeconds:6,stacks:4,maxStacks:5,message:'DEV showcase · poison'});updateMark(target,'enemy',{markId:'dev.chaos.mark',statusName:'Đạo Ấn',stacks:6,maxStacks:6});
      showEnemyIntent(target,{name:'Đại Sát · Hắc Phong Diệt',tags:['Ultimate','Boss']},3800);showSkillCallout(target,skill,'player',false);pulseActor(target,'player',actorMotionState(presentationProfile(skill,String(stage?.dataset?.playerDao||'')),'cast',false),900);spawnSkillFx(target,skill,'player','cast');setCooldown(target,skills.indexOf(skill),Math.max(1.4,Number(skill.cooldown)||2));
      schedulePresentation(target,token,320,()=>{target.dataset.devShowcasePhase='travel';spawnSkillFx(target,skill,'player','travel');});
      schedulePresentation(target,token,510,()=>{target.dataset.devShowcasePhase='impact';pulseActor(target,'enemy','hit',560);spawnSkillFx(target,skill,'player','impact');impact(target,'enemy',true,{camera:'heavy',hitStopMs:72},skill);damageNumber(target,'enemy',238000,true,'direct');damageNumber(target,'enemy',5200,false,'dot');});
      schedulePresentation(target,token,650,()=>{pulseActor(target,'player','heal',520);floatNumber(target,'player','+42.6K','heal');updateCombatResource(target,{resourceId:'ultimateGauge',resourceValue:88,resourceMax:100,message:'DEV showcase · resource'});});
      schedulePresentation(target,token,780,()=>{showSkillCallout(target,ultimate,'player',true);pulseActor(target,'player','ultimate',1050);spawnSkillFx(target,ultimate,'player','cast');});
      setCaption(target,'DEV SHOWCASE · FULL CHAOS','Skill + telegraph + damage + status + support + HP/CN + Poise + VFX.',2800);return {ok:true,scene:'06-full-chaos',skillId:String(skill.id||''),ultimateId:String(ultimate.id||''),events:target.dataset.devShowcaseEvents};
    };
    const showcaseShake=(kind='light')=>{
      const key=String(kind||'light').toLowerCase();const table={light:{camera:'light',strong:false,durationMs:125,target:'enemy',label:'LIGHT HIT'},heavy:{camera:'medium',strong:true,durationMs:180,target:'enemy',label:'HEAVY HIT'},critical:{camera:'heavy',strong:true,durationMs:230,target:'enemy',label:'CRITICAL'},ultimate:{camera:'heavy',strong:true,durationMs:280,target:'enemy',label:'ULTIMATE'},boss:{camera:'medium',strong:true,durationMs:190,target:'player',label:'BOSS IMPACT'}};const cfg=table[key]||table.light;const {target,stage,token}=showcaseBegin(`shake-${key}`);if(!target)return {ok:false};
      const realSkill=skills.find(isUltimateSkill)||skills[0]||{id:'dev.showcase.shake',name:'DEV Showcase',tags:['DEV']};
      // The real Golden Sword ultimate has a dedicated choreography that can defer
      // its camera impulse. Use a DEV-only neutral ultimate event for shake proof so
      // the harness measures the generic impulse path without changing production.
      const skill=key==='ultimate'
        ? {id:'dev.showcase.ultimate',name:'Tuyệt Kỹ Showcase',slot:'ultimate',tags:['ultimate','DEV']}
        : realSkill;
      target.dataset.devShowcaseShake=key;target.dataset.devShowcaseShakePhase='impact';if(key==='boss')showEnemyIntent(target,{name:'Đại Sát · Hắc Phong Diệt',tags:['Ultimate','Boss']},1200);pulseActor(target,key==='boss'?'player':'enemy',key==='boss'?'hit':key==='ultimate'?'ultimate':'hit',cfg.durationMs+80);
      // Keep the DEV sampling hit-stop below the first telemetry frame; camera
      // strength, easing, duration, and layer remain the real Pixi implementation.
      const sampleStop=key==='light'?22:key==='heavy'?28:key==='critical'?34:key==='ultimate'?38:28;
      impact(target,cfg.target,cfg.strong,{camera:cfg.camera,hitStopMs:sampleStop},skill);
      if(document.body.dataset.combatPixiState!=='pixi'&&stage)stage.classList.add(cfg.strong?'shake-strong':'shake');
      schedulePresentation(target,token,Math.max(24,Math.round(cfg.durationMs*.35)),()=>{target.dataset.devShowcaseShakePhase='peak';});
      schedulePresentation(target,token,cfg.durationMs+130,()=>{target.dataset.devShowcaseShakePhase='settled';stage?.classList.remove('shake','shake-strong','hit-stop');});
      setCaption(target,`DEV SHOWCASE · ${cfg.label}`,'Camera impulse · HUD ổn định · chờ settled.',900);return {ok:true,kind:key,durationMs:cfg.durationMs,target:cfg.target,camera:cfg.camera};
    };
    const showcaseScene=(name='scene-01-clean',options={})=>{
      const key=String(name||'').toLowerCase();
      if(key==='scene-01-clean'||key==='01-clean'||key==='clean'){const {target,stage}=showcaseBegin('01-clean');stage?.classList.remove('presentation-active');target?.classList.remove('is-active-combat');setCaption(target,'','');return {ok:Boolean(target),scene:'01-clean'};}
      if(key==='scene-02-status-stress'||key==='02-status-stress'||key==='status-stress')return showcaseStatusStress();
      if(key==='scene-03-skill-cast'||key==='03-skill-cast'||key==='skill-cast')return showcaseSkill(options.index||0);
      if(key==='scene-04-damage-stress'||key==='04-damage-stress'||key==='damage-stress')return showcaseDamageStress();
      if(key.startsWith('scene-05-boss-break')||key.startsWith('05-boss-break')||key==='boss-break')return showcaseBossBreak(options.state||key.replace(/^.*boss-break-?/,'')||'near-break');
      if(key==='scene-06-full-chaos'||key==='06-full-chaos'||key==='full-chaos')return showcaseFullChaos();
      if(key.startsWith('shake-'))return showcaseShake(key.slice(6));
      return {ok:false,reason:'unknown-scene',scene:key};
    };
    const showcaseApi={version:'combat-visual-showcase.v1',root,scene:showcaseScene,skill:showcaseSkill,bossBreak:showcaseBossBreak,shake:showcaseShake,listSkills:()=>skills.filter(Boolean).map((skill,index)=>({index,id:String(skill.id||''),name:String(skill.name||''),icon:productionSkillIconPath(skill.id),cooldown:Number(skill.cooldown)||0,cost:Number(skill.spiritCost)||0})),state:()=>{const stateRoot=currentCombatRoot()||root,stateStage=q(stateRoot,'#huntV2Stage')||stateRoot;return{scene:stateRoot.dataset.devShowcaseScene||'',skill:Number(stateRoot.dataset.devShowcaseSkill||0),phase:stateRoot.dataset.devShowcasePhase||'',shake:stateRoot.dataset.devShowcaseShake||'',shakePhase:stateRoot.dataset.devShowcaseShakePhase||'',cameraX:Number(document.body.dataset.combatPixiCameraX||0),cameraY:Number(document.body.dataset.combatPixiCameraY||0),cameraActive:document.body.dataset.combatPixiCameraActive==='1',rootTransform:getComputedStyle(stateRoot).transform,stageTransform:getComputedStyle(stateStage).transform}}};
    globalThis.__TUTIEN_COMBAT_SHOWCASE__=showcaseApi;
    qa(devBox,'[data-dev-showcase]').forEach(btn=>btn.addEventListener('click',()=>showcaseScene(btn.dataset.devShowcase||'scene-01-clean')));
    qa(devBox,'[data-dev-showcase-shake]').forEach(btn=>btn.addEventListener('click',()=>showcaseShake(btn.dataset.devShowcaseShake||'light')));
    const runDevAutoTour=async()=>{
      const existing=devTourState();if(existing&&!existing.cancelled)return;
      const token=`tour-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;globalThis.__TUTIEN_COMBAT_QA_TOUR__={token,cancelled:false,startedAt:Date.now()};document.body.classList.add('combat-dev-tour-running');hideTourPanel();
      const total=17;let step=0;
      const next=(title,sub)=>showTourHud(token,title,sub,++step,total);
      const daos=[['sword','KIẾM'],['fist','QUYỀN'],['body','THỂ'],['spell','PHÁP'],['poison','ĐỘC'],['artifact','NGỰ KHÍ'],['formation','TRẬN'],['mind','THẦN NIỆM']];
      try{
        for(let i=0;i<daos.length;i++){
          if(!tourAlive(token))return;const [dao,label]=daos[i];next(`ĐẠO ${i+1}/8 · ${label}`,'Skill rail · resource · Ultimate · FX');
          await action({action:'devSandboxPreset',realmOrder:62,dao,forceBoss:true});if(!tourAlive(token))return;hideTourPanel();showTourHud(token,`ĐẠO ${i+1}/8 · ${label}`,'Skill rail · resource · Ultimate · FX',step,total);
          const r=currentCombatRoot();tourReset(r,{playerHp:88-i*2,spirit:74,poise:84,phase:1,ultimate:25+i*9,resource:.42+i*.045});
          pulseActor(r,'player','cast',620);tourFx(r,dao,'cast');await tourSleep(430);if(!tourAlive(token))return;tourFx(currentCombatRoot(),dao,'travel');await tourSleep(360);if(!tourAlive(token))return;pulseActor(currentCombatRoot(),'enemy','hit',420);tourFx(currentCombatRoot(),dao,'impact');damageNumber(currentCombatRoot(),'enemy',88000+i*17000,i%2===0);await tourSleep(1180);
        }
        if(!tourAlive(token))return;next('PHÁ THẾ 70%','Thanh Phá Thế phải rõ nhưng không lấn art');{const r=currentCombatRoot();tourReset(r,{poise:30,ultimate:56,resource:.62});}await tourSleep(2300);
        if(!tourAlive(token))return;next('THẤT THẾ → ỔN THẾ','Debuff + countdown + recovery');{const r=currentCombatRoot();tourReset(r,{poise:0,ultimate:78,resource:.7});addStatus(r,'enemy',{statusId:'tour.break',statusName:'Thất Thế · Phòng -15%',statusKind:'debuff',durationSeconds:5});startBreakWindow(r,5,3200,15);}await tourSleep(3400);if(tourAlive(token)){const r=currentCombatRoot();setPoise(r,100,'recovering');showTourHud(token,'ỔN THẾ','Recovery · tạm miễn Phá Thế mới',step,total);}await tourSleep(1300);
        if(!tourAlive(token))return;next('FULL HUD STRESS','Low HP · status · Ấn · P3 · đại sát · Ult ready');{const r=currentCombatRoot();tourReset(r,{playerHp:24,spirit:42,poise:22,phase:3,ultimate:100,resource:.78});addTourStatuses(r,'player','buff',5);addTourStatuses(r,'enemy','debuff',5);updateMark(r,'enemy',{markId:'tour.mark',statusName:'Đạo Ấn',stacks:6,maxStacks:6});showEnemyIntent(r,{name:'Đại Sát · Hắc Phong Diệt',tags:['Ultimate','Boss']},3600);}await tourSleep(3900);
        if(!tourAlive(token))return;next('ẤN + CỬA PHẢN CÔNG','Stack / counter window');{const r=currentCombatRoot();tourReset(r,{poise:54,ultimate:82,resource:.66});updateMark(r,'enemy',{markId:'tour.counter.mark',statusName:'Đạo Ấn',stacks:6,maxStacks:6});addStatus(r,'enemy',{statusId:'tour.counter',statusName:'Cửa Phản Công',statusKind:'debuff',durationSeconds:5});}await tourSleep(2600);
        if(!tourAlive(token))return;next('PLAYER POSE','Idle → Cast → Attack → Hit → Ultimate → Defeat');{const poses=['idle','cast','attack','hit','ultimate','defeat','idle'];for(const pose of poses){if(!tourAlive(token))return;const r=currentCombatRoot();tourPose(r,pose);showTourHud(token,'PLAYER POSE',pose.toUpperCase(),step,total);await tourSleep(560);}};
        if(!tourAlive(token))return;next('BOSS STATE','Idle → Attack → Cast → Hit → P2 → P3 → Defeat');{const states=['idle','attack','cast','hit','phase2','phase3','defeat','idle'];for(const stateName of states){if(!tourAlive(token))return;const r=currentCombatRoot();setBossState(r,stateName,{entityId:String(q(r,'#huntV2Stage')?.dataset?.monsterId||''),sticky:['phase2','phase3','defeat'].includes(stateName)});showTourHud(token,'BOSS STATE',stateName.toUpperCase(),step,total);await tourSleep(540);}};
        if(!tourAlive(token))return;next('FX PRIMITIVE','Cast → Travel → Impact → Field → Ultimate');{for(const type of ['cast','travel','impact','field','ultimate']){if(!tourAlive(token))return;const r=currentCombatRoot(),dao=String(q(r,'#huntV2Stage')?.dataset?.playerDao||'mind');tourFx(r,dao,type);showTourHud(token,'FX PRIMITIVE',type.toUpperCase(),step,total);await tourSleep(type==='ultimate'?1050:720);}};
        if(!tourAlive(token))return;next('CHIẾN BÁO','Compact → mở rộng → ẩn → hiện lại');{const r=currentCombatRoot();pushLog(r,'AUTO QA · Kiểm tra chiến báo compact.','system');logCompactHidden=false;logVisible=false;saveCombatLogCompactHidden();syncCombatControls();await tourSleep(900);logVisible=true;syncCombatControls();await tourSleep(1000);logVisible=false;logCompactHidden=true;saveCombatLogCompactHidden();syncCombatControls();await tourSleep(850);logCompactHidden=false;saveCombatLogCompactHidden();syncCombatControls();await tourSleep(850);}
        if(!tourAlive(token))return;next('BACKEND THẬT + REPLAY','CombatKernel quyết định kết quả; UI chỉ phát lại event');const payload=await action({action:'endlessFight'});if(!tourAlive(token))return;hideTourPanel();showTourHud(token,'BACKEND THẬT + REPLAY','Đang phát combatEvents thật',step,total);await tourSleep(650);const replayBtn=document.querySelector('[data-dev-replay-fight]');if(replayBtn)replayBtn.click();else{const r=currentCombatRoot();const result=payload?.realtime?.lastFight||payload?.result?.lastFight||payload?.result;playBackendCombatEvents(r,result?.combatEvents||[],combatDockSkills((payload?.snapshot?.character?.knownSkills||[]).filter(x=>x.active)));}await tourSleep(10500);
        if(!tourAlive(token))return;showTourHud(token,'AUTO QA HOÀN TẤT','Video này đủ để review toàn bộ Combat UI',total,total);const state=devTourState();if(state)state.cancelled=true;document.body.classList.remove('combat-dev-tour-running');setTimeout(()=>{const box=document.querySelector('[data-dev-tour-hud]');if(box?.isConnected)box.hidden=true;},2300);
      }catch(error){console.error('[Combat DEV Auto Tour]',error);showTourHud(token,'AUTO QA LỖI',String(error?.message||error),step,total);const state=devTourState();if(state)state.cancelled=true;document.body.classList.remove('combat-dev-tour-running');}
    };
    q(devBox,'[data-dev-auto-tour]')?.addEventListener('click',runDevAutoTour);
    q(devBox,'[data-dev-golden-sword]')?.addEventListener('click',()=>{
      const stage=q(root,'#huntV2Stage');if(!stage)return;
      const token=clearPresentationTimers(root);stage.dataset.goldenSwordDemo='g1';stage.classList.add('golden-sword-demo');
      const sword={
        nurture:{id:'skill.dao.sword.nurture',name:'Tàng Phong Dưỡng Kiếm',tags:['Sword','Charge'],delivery:'sword'},
        flow:{id:'skill.dao.sword.flow_slash',name:'Lưu Quang Nhất Trảm',tags:['Sword','Dash'],delivery:'sword'},
        breakMark:{id:'skill.dao.sword.break_mark',name:'Phá Vọng Kiếm Ấn',tags:['Sword','Break'],delivery:'sword'},
        chain:{id:'skill.dao.sword.chain',name:'Lưu Quang Liên Kiếm',tags:['Sword','Combo'],delivery:'sword'},
        ultimate:{id:'skill.dao.sword.ultimate',name:'Thái Hư Kiếm Vực',tags:['Sword','Ultimate'],delivery:'sword',runtimeV117:{slotClass:'ultimate'}},
      };
      const fx=(event)=>playCombatPixiFx({...event,fallbackDao:'sword'});
      fx({type:'sword-core',side:'player',strong:true,life:8});
      setCaption(root,'GOLDEN KIẾM · G1','DEV presentation only · không đổi kết quả combat.',1250);
      pulseActor(root,'player','cast',900);showSkillCallout(root,sword.nurture,'player',false);fx({type:'cast',side:'player',skill:sword.nurture,strong:true});
      schedulePresentation(root,token,1050,()=>{pulseActor(root,'player','dash',650);showSkillCallout(root,sword.flow,'player',false);fx({type:'projectile',side:'player',skill:sword.flow,strong:true});schedulePresentation(root,token,250,()=>{pulseActor(root,'enemy','hit',430);fx({type:'impact',target:'enemy',skill:sword.flow,strong:true,camera:'light'});damageNumber(root,'enemy',128400,true);});});
      schedulePresentation(root,token,2450,()=>{pulseActor(root,'player','cast',620);showSkillCallout(root,sword.breakMark,'player',false);fx({type:'cast',side:'player',skill:sword.breakMark});schedulePresentation(root,token,300,()=>{pulseActor(root,'player','attack',520);fx({type:'projectile',side:'player',skill:sword.breakMark,strong:true});});schedulePresentation(root,token,560,()=>{pulseActor(root,'enemy','hit',460);fx({type:'impact',target:'enemy',skill:sword.breakMark,strong:true,camera:'medium'});damageNumber(root,'enemy',214700,false);setPoise(root,28,'pressure');});});
      schedulePresentation(root,token,3850,()=>{pulseActor(root,'player','sword',760);showSkillCallout(root,sword.chain,'player',false);fx({type:'projectile',side:'player',skill:sword.chain,shots:4,strong:true});schedulePresentation(root,token,500,()=>{pulseActor(root,'enemy','hit',520);fx({type:'impact',target:'enemy',skill:sword.chain,strong:true,camera:'medium'});damageNumber(root,'enemy',356900,true);setPoise(root,0,'broken',30);});});
      schedulePresentation(root,token,5450,()=>{cinematicUltimate(root,1850);presentationFocus(root,'player',1200);pulseActor(root,'player','ultimate',1250);showSkillCallout(root,sword.ultimate,'player',true);setCaption(root,'Thái Hư Kiếm Vực','Kiếm Khí quy vực · Vạn kiếm đồng quy',1900);fx({type:'cast',side:'player',skill:sword.ultimate,strong:true});fx({type:'sword-core',side:'player',strong:true,life:3});});
      schedulePresentation(root,token,6070,()=>{fx({type:'golden-sword-ultimate',side:'player',target:'enemy',skill:sword.ultimate,strong:true});});
      schedulePresentation(root,token,6950,()=>{pulseActor(root,'enemy','hit',780);damageNumber(root,'enemy',1280000,true);});
      schedulePresentation(root,token,8050,()=>{stage.classList.remove('golden-sword-demo');delete stage.dataset.goldenSwordDemo;setPoise(root,100,'ready');setCaption(root,'Golden Kiếm G1 · hoàn tất','Cast → travel → impact → ultimate choreography.',1200);});
    });

    q(devBox,'[data-dev-golden-sword-g2]')?.addEventListener('click',()=>{
      const stage=q(root,'#huntV2Stage');if(!stage)return;
      const token=clearPresentationTimers(root);stage.dataset.goldenSwordDemo='g2';stage.classList.add('golden-sword-demo');
      const sword={
        nurture:{id:'skill.dao.sword.nurture',name:'Tàng Phong Dưỡng Kiếm',tags:['Sword','Charge'],delivery:'sword'},
        flow:{id:'skill.dao.sword.flow_slash',name:'Lưu Quang Nhất Trảm',tags:['Sword','Dash'],delivery:'sword'},
        breakMark:{id:'skill.dao.sword.break_mark',name:'Phá Vọng Kiếm Ấn',tags:['Sword','Break'],delivery:'sword'},
        chain:{id:'skill.dao.sword.chain',name:'Lưu Quang Liên Kiếm',tags:['Sword','Combo'],delivery:'sword'},
        myriad:{id:'skill.dao.sword.myriad',name:'Vạn Kiếm Triều Tông',tags:['Sword','Channel'],delivery:'sword'},
        ultimate:{id:'skill.dao.sword.ultimate',name:'Thái Hư Kiếm Vực',tags:['Sword','Ultimate'],delivery:'sword',runtimeV117:{slotClass:'ultimate'}},
      };
      const fx=event=>playCombatPixiFx({...event,fallbackDao:'sword'});
      setCaption(root,'GOLDEN KIẾM · G2','DEV quality pass · combat truth không đổi.',1350);syncCombatPixiSwordQi(2,5);pulseActor(root,'player','cast',900);showSkillCallout(root,sword.nurture,'player');fx({type:'cast',side:'player',skill:sword.nurture,strong:true});
      schedulePresentation(root,token,900,()=>{syncCombatPixiSwordQi(4,5);pulseActor(root,'player','dash',620);showSkillCallout(root,sword.flow,'player');fx({type:'travel',side:'player',target:'enemy',skill:sword.flow,strong:true});schedulePresentation(root,token,260,()=>{pulseActor(root,'enemy','hit',420);fx({type:'impact',target:'enemy',skill:sword.flow,strong:true,camera:'light',hitStopMs:44});damageNumber(root,'enemy',138400,true);});});
      schedulePresentation(root,token,2200,()=>{pulseActor(root,'player','cast',650);showSkillCallout(root,sword.breakMark,'player');fx({type:'cast',side:'player',target:'enemy',skill:sword.breakMark});schedulePresentation(root,token,260,()=>fx({type:'travel',side:'player',target:'enemy',skill:sword.breakMark,strong:true}));schedulePresentation(root,token,520,()=>{pulseActor(root,'enemy','hit',460);fx({type:'impact',target:'enemy',skill:sword.breakMark,strong:true,camera:'medium',hitStopMs:64});damageNumber(root,'enemy',228700,false);setPoise(root,34,'pressure');});});
      schedulePresentation(root,token,3500,()=>{syncCombatPixiSwordQi(5,5);pulseActor(root,'player','sword',720);showSkillCallout(root,sword.chain,'player');fx({type:'travel',side:'player',target:'enemy',skill:sword.chain,strong:true});schedulePresentation(root,token,500,()=>{pulseActor(root,'enemy','hit',500);fx({type:'impact',target:'enemy',skill:sword.chain,strong:true,camera:'medium',hitStopMs:66});damageNumber(root,'enemy',382900,true);setPoise(root,12,'pressure');});});
      schedulePresentation(root,token,4800,()=>{pulseActor(root,'player','channel',1050);showSkillCallout(root,sword.myriad,'player');fx({type:'cast',side:'player',target:'enemy',skill:sword.myriad,strong:true});schedulePresentation(root,token,420,()=>fx({type:'travel',side:'player',target:'enemy',skill:sword.myriad,strong:true}));schedulePresentation(root,token,980,()=>{pulseActor(root,'enemy','hit',560);fx({type:'impact',target:'enemy',skill:sword.myriad,strong:true,camera:'medium',hitStopMs:68});damageNumber(root,'enemy',516000,true);setPoise(root,0,'broken',30);});});
      schedulePresentation(root,token,6700,()=>{syncCombatPixiSwordQi(5,7);cinematicUltimate(root,2100);presentationFocus(root,'player',1300);pulseActor(root,'player','ultimate',1350);showSkillCallout(root,sword.ultimate,'player',true);setCaption(root,'Thái Hư Kiếm Vực · G2','Kiếm trận tụ thế → đồng quy → hit-stop.',2000);fx({type:'cast',side:'player',skill:sword.ultimate,strong:true});fx({type:'sword-core',side:'player',strong:true,life:3});});
      schedulePresentation(root,token,7450,()=>{fx({type:'golden-sword-ultimate',side:'player',target:'enemy',skill:sword.ultimate,strong:true});});
      schedulePresentation(root,token,8500,()=>{syncCombatPixiSwordQi(1,7);pulseActor(root,'enemy','hit',820);damageNumber(root,'enemy',1420000,true);});
      schedulePresentation(root,token,9800,()=>{stage.classList.remove('golden-sword-demo');delete stage.dataset.goldenSwordDemo;setPoise(root,100,'ready');syncCombatPixiSwordQi(0,5);setCaption(root,'Golden Kiếm G2 · hoàn tất','5 signature skills + Ultimate · DEV only.',1400);});
    });
    q(devBox,'[data-dev-fight]')?.addEventListener('click',()=>{root.classList.remove('is-dev-hud-preview');return action({action:'endlessFight'});});
    q(devBox,'[data-dev-replay-fight]')?.addEventListener('click',()=>{
      root.classList.remove('is-dev-hud-preview');
      const result=live?.lastFight;
      const timeline=playBackendCombatEvents(root,result?.combatEvents||[],skills);
      if(!timeline.played)setCaption(root,'DEV · Chưa có trận để replay','Bấm Đánh 1 trận trước.',1000);
    });
    q(devBox,'[data-dev-open-skills]')?.addEventListener('click',()=>document.querySelector('[data-tab="skills"]')?.click());
  }
  const poiseHelp=q(root,'[data-poise-help]');
  const showPoiseHelp=()=>setCaption(root,'Phá Thế · 0–100','Tích đủ 100 → Thất Thế 5s · Phòng Ngự -30% (Boss -15%) · sau đó Ổn Thế 3s.',2100);
  poiseHelp?.addEventListener('click',showPoiseHelp);
  poiseHelp?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showPoiseHelp();}});
  qa(root,'[data-intel-resource]').forEach(meter=>{
    const explain=()=>{const name=meter.querySelector('span')?.textContent||'Tài nguyên Bản Đạo';const id=String(meter.dataset.intelResource||'');const detail=id==='ultimateGauge'?'Tích đủ 100 để thi triển Tuyệt Kỹ.':id==='formationIntegrityV2'?'Độ Bền của Chủ Trận; Kích Trận và hóa giải sát thương có thể làm giảm.':id==='formationNurtureV2'?'Tích Dưỡng Độ rồi tiêu khi Kích Trận.':'Kỹ năng Bản Đạo sẽ tích hoặc tiêu tài nguyên này theo mô tả skill.';setCaption(root,name,detail,1800);};
    meter.addEventListener('click',explain);
  });
  qa(root,'[data-combat-log-toggle]').forEach(btn=>btn.addEventListener('click',()=>{logVisible=!logVisible;if(logVisible)logCompactHidden=false;saveCombatLogCompactHidden();syncCombatControls();}));
  qa(root,'[data-combat-log-hide]').forEach(btn=>btn.addEventListener('click',event=>{event.stopPropagation();logVisible=false;logCompactHidden=true;saveCombatLogCompactHidden();syncCombatControls();}));
  qa(root,'[data-combat-log-show]').forEach(btn=>btn.addEventListener('click',()=>{logCompactHidden=false;saveCombatLogCompactHidden();syncCombatControls();}));
  qa(root,'[data-combat-fx-quality]').forEach(btn=>btn.addEventListener('click',()=>{const index=Math.max(0,FX_QUALITY_LEVELS.indexOf(combatFxQuality));combatFxQuality=FX_QUALITY_LEVELS[(index+1)%FX_QUALITY_LEVELS.length];fxPaused=combatFxQuality==='off';try{localStorage.setItem('tutien.combat.fx-quality',combatFxQuality);}catch{}syncCombatControls();startCombatPixi(root,stage,model).catch(()=>{});}));
  const openSkillDetail=index=>{const panel=root.querySelector(`[data-sheet-panel="hunt-skill-${index}"]`);if(!panel)return;root.querySelectorAll('.v106-sheet.open').forEach(x=>x.classList.remove('open'));panel.classList.add('open');};
  qa(root,'[data-huntv2-skill]').forEach(btn=>{
    btn.addEventListener('click',()=>{openSkillDetail(Number(btn.dataset.huntv2Skill||0));});
    btn.addEventListener('contextmenu',e=>e.preventDefault());
  });

  const fight=q(root,'[data-endless-fight]');
  if(fight&&!locked){
    fight.onclick=async()=>{
      if(fight.disabled)return;fight.disabled=true;root.classList.add('is-active-combat');setCaption(root,'Khóa mục tiêu','Backend đang giải quyết trận chiến');ambientPulse(root,'cast','player');
      huntTransientTimeoutV129(root,()=>root?.classList?.remove('is-active-combat'),12000);
      try{await action({action:'endlessFight'});}finally{if(fight.isConnected)fight.disabled=false;}
    };
  }

  syncHuntCombatV2(root,{model,live});
}

function cleanupHuntRootV129(root){
  if(!root)return;
  if(globalThis.__TUTIEN_COMBAT_SHOWCASE__?.root===root)delete globalThis.__TUTIEN_COMBAT_SHOWCASE__;
  clearPresentationTimers(root);
  clearHuntTransientTimersV129(root);
  stopBreakWindow(root);
  clearTimeout(resultTimer);resultTimer=null;
  for(const selector of ['#huntv2Caption','#huntv2EnemyIntent','#huntv2SkillCallout']){const el=q(root,selector);if(el){clearTimeout(el._captionTimer);clearTimeout(el._intentTimer);clearTimeout(el._calloutTimer);}}
  clearStatuses(root);
  for(const lag of [q(root,'#huntv2EnemyHpLag'),q(root,'#huntv2PlayerHpLag')])if(lag)clearTimeout(lag._lagTimer);
  const summary=q(root,'#huntv2BattleSummary');if(summary)clearTimeout(summary._hideTimer);
  const damageState=damageTextState.get(root);if(damageState){for(const side of ['enemy','player'])clearTimeout(damageState[side]?.timer);damageTextState.delete(root);}
  presentationState.delete(root);
  stopConfidantPresentationV87(root);
  stopArtifactPresentationV88(root);
}
export function stopHuntCombatV2(){
  clearInterval(fxTimer);fxTimer=null;
  cleanupHuntRootV129(activeHuntRoot);
  activeHuntRoot=null;
  stopCombatPixi();
}
