import {productionSkillIconPath,PLAYER_COMBAT_VISUAL} from './modules/combat-production-pack-v138.js';
import {expressionPortraitMarkup} from './modules/character-expression-rig-v138.js';

let huntCombatModule=null;
let huntCombatLoadPromise=null;
function loadHuntCombatModuleV129(){
  if(huntCombatModule)return Promise.resolve(huntCombatModule);
  if(huntCombatLoadPromise)return huntCombatLoadPromise;
  huntCombatLoadPromise=import('./modules/hunt-combat-v2.js').then(mod=>{
    huntCombatModule=mod;
    huntCombatLoadPromise=null;
    if(activeTab==='hunt'&&model)renderPreservingUi();
    return mod;
  }).catch(error=>{
    huntCombatLoadPromise=null;
    console.warn('[hunt] lazy module unavailable',error);
    if(activeTab==='hunt')showNotice('Không tải được giao diện Săn Yêu.',true);
    throw error;
  });
  return huntCombatLoadPromise;
}
function stopHuntCombatV129(){huntCombatModule?.stopHuntCombatV2?.();}
function renderHuntCombatLazyV129(){
  if(huntCombatModule)return huntCombatModule.renderHuntCombatV2({model,live,helpers:{sheet:v106Sheet,moreSheet:v106MoreSheet,skillArt:v107SkillArt,metric,tag,localize:localizeUiTerm,devMode:DEV_MODE}});
  loadHuntCombatModuleV129().catch(()=>{});
  return `<section class="v107-screen v129-lazy-screen"><div class="v107-body"><div class="card highlight"><div class="eyebrow">Đang mở Săn Yêu</div><h2>Khởi tạo chiến trường…</h2><p class="small muted">Combat presentation chỉ tải khi cần để giảm thời gian mở game.</p></div></div></section>`;
}

let dongFuPixiModule=null;
let dongFuPixiLoadPromise=null;
function loadDongFuPixiModuleV129(){
  if(dongFuPixiModule)return Promise.resolve(dongFuPixiModule);
  if(dongFuPixiLoadPromise)return dongFuPixiLoadPromise;
  dongFuPixiLoadPromise=import('./modules/dongfu-pixi-scene-v139.js').then(mod=>{
    dongFuPixiModule=mod;
    dongFuPixiLoadPromise=null;
    return mod;
  }).catch(error=>{
    dongFuPixiLoadPromise=null;
    console.warn('[dongfu-pixi] lazy module unavailable',error);
    throw error;
  });
  return dongFuPixiLoadPromise;
}
const STORAGE_KEY='tutien.web.save.v1';
const STORAGE_BACKUP_KEY='tutien.web.save.backup.v1';
const BUILD_VERSION='1.40.0-alpha.24.0';
const URL_PARAMS=new URLSearchParams(location.search);
const DEV_MODE=URL_PARAMS.get('dev')==='1'||globalThis.__TUTIEN_DEV_FORCE__===true;
const QA_MODE=(DEV_MODE&&URL_PARAMS.get('qa')==='1')||globalThis.__TUTIEN_QA_FORCE__===true;
document.body.dataset.devSandbox=DEV_MODE?'1':'0';
if(QA_MODE) import('./modules/dev-qa-overlay-v139.js').then(m=>m.initDevQaOverlay({buildVersion:BUILD_VERSION})).catch(error=>console.warn('[dev-qa] overlay unavailable',error));
const primaryTabs=[
  ['character','Nhân Vật','NV'],['cultivation','Tu Luyện','TL'],['dungeons','Chiến Đấu','CĐ'],['dongfu','Động Phủ','ĐP'],['locations','Thế Giới','TG'],
];
const quickTabs=[
  ['guide','Chỉ Nam','CN'],['overview','Tổng Quan','TQ'],['path','Định Đạo','ĐĐ'],['build','Phối Đồ','PĐ'],['combat','Thủ Lĩnh','TL'],['automation','Tự Động','TĐ'],
];
let model=null; let live=null; let activeTab=URL_PARAMS.get('tab')||(DEV_MODE?'hunt':'cultivation'); let selectedBossIntel=null; let lastPayload=null; let transferSourceId=null; let inventoryUi={selectedId:null,group:'all',slot:'all',setId:'all',sort:'level',view:'equipped',forgeTab:'enhance',affixIndex:0,targetFamily:'',setFilter:'current',setCategory:'all',setIdentity:'all',setSearch:'',visibleLimit:72,v142CraftSlot:'weapon'}; let equipmentIntel={itemId:null,loading:false,data:null,error:''}; let reincPlan={aptitudeFloor:0,birthCandidate:1,orientationId:'balanced'}; let replay={timer:null,index:0,speed:2,active:false}; let battleViz={actors:null,totals:null,hp:{player:100,enemy:100},reviewId:'',message:'',ambientTimer:null};
let collectionUi={category:'manual',ownedOnly:false,banner:'banner.manual',usePremium:false,selectedId:null,manualRealmStage:null};
let guideUi={section:'today'};
let dongfuUi={section:'home',category:null,selectedId:null,manualRealmStage:null,alchemyRecipeId:null,alchemyFamily:'all',alchemyGardenSeedId:null,forgeRecipeId:null,hubSelected:'alchemy'};
let dongfuMountRaf=0;
let dungeonUi={section:'home',resourceCategory:null};
let pvpReplayUi={fightId:null,data:null,loading:false,error:''};
let userAssetCatalog={schema:'tutien-user-assets.v1',skins:[],backgrounds:[],equipment:{byId:{},bySlot:{}},skills:{byId:{}},featureIcons:{}};
let renderNav,renderHeader,renderCharacter,renderSkills,renderInventory,renderCultivation,renderReincarnation;
const $=s=>document.querySelector(s); const content=$('#content'); const nav=$('#nav'); const quickNav=$('#quickNav');
const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function realmOrder(){return Number(model?.overview?.life?.realmOrder??0);}
function v127ManualStageContext(allItems,ui,attribute){
  const stages=[...new Map((allItems||[]).filter(x=>x.category==='manual').map(x=>[Number(x.realmStageIndex||0),{index:Number(x.realmStageIndex||0),name:x.realmName||'Cảnh giới',unlocked:Boolean(x.unlocked)}])).values()].sort((a,b)=>a.index-b.index);
  if(!stages.length)return {items:allItems||[],selector:''};
  const fallback=[...stages].reverse().find(x=>x.unlocked)||stages[0];
  let chosen=Number(ui.manualRealmStage);if(!Number.isFinite(chosen)||!stages.some(x=>x.index===chosen))chosen=fallback.index;ui.manualRealmStage=chosen;
  const options=stages.map(x=>`<option value="${x.index}" ${x.index===chosen?'selected':''}>${esc(x.name)}${x.unlocked?'':' · chưa mở'}</option>`).join('');
  return {items:(allItems||[]).filter(x=>Number(x.realmStageIndex||0)===chosen),selector:`<label class="v127-manual-realm"><span>Cảnh giới Công Pháp</span><select ${attribute}>${options}</select></label>`};
}
function tabUnlocked(id){
  if(DEV_MODE)return true;
  const order=realmOrder();
  const key=String(id||'');
  if(['cultivation','character','overview','roots','guide'].includes(key))return true;
  if(key==='pvp')return order>=18;
  if(key==='soul')return order>=22;
  if(key==='dao')return order>=26;
  if(['inventory','dungeons','hunt','combat','build','automation','economy'].includes(key))return order>=1;
  if(['skills','dongfu','collection','path','reincarnation','myriadLives'].includes(key))return order>=10;
  return true;
}
function tabUnlockText(id){
  const key=String(id||'');
  if(key==='pvp')return 'Đấu Pháp mở khi đạt Kim Đan.';
  if(key==='soul')return 'Thần Hồn / Phân Thân mở tại Nguyên Anh.';
  if(key==='dao')return 'Đạo Ý / Đạo Vực mở tại Hóa Thần.';
  if(['skills','dongfu','collection','path','reincarnation','myriadLives'].includes(key))return 'Hệ này mở khi đạt Trúc Cơ.';
  if(['inventory','dungeons','hunt','combat','build','automation','economy'].includes(key))return 'Hệ này mở sau khi bước vào Luyện Khí.';
  return 'Hệ này chưa mở ở tiến độ hiện tại.';
}
const pct=value=>Math.max(0,Math.min(100,Number(value)||0));
const num=(value,digits=0)=>Number(value??0).toLocaleString('vi-VN',{maximumFractionDigits:digits});
const v2320Compact=value=>{const n=Number(value)||0,abs=Math.abs(n);if(abs>=1e12)return `${num(n/1e12,2)} Nghìn Tỷ`;if(abs>=1e9)return `${num(n/1e9,2)} Tỷ`;if(abs>=1e6)return `${num(n/1e6,2)} Triệu`;if(abs>=1e4)return `${num(n/1e4,2)} Vạn`;return num(n,1);};
const durationText=seconds=>{seconds=Math.max(0,Number(seconds)||0);if(seconds<60)return `${Math.ceil(seconds)} giây`;if(seconds<3600)return `${Math.floor(seconds/60)} phút ${Math.ceil(seconds%60)} giây`;return `${Math.floor(seconds/3600)} giờ ${Math.floor(seconds%3600/60)} phút`;};
const durationLongText=seconds=>{seconds=Math.max(0,Number(seconds)||0);if(seconds<3600)return durationText(seconds);const days=Math.floor(seconds/86400),hours=Math.floor(seconds%86400/3600),minutes=Math.floor(seconds%3600/60);if(days>0)return `${days} ngày${hours?` ${hours} giờ`:''}`;return `${hours} giờ${minutes?` ${minutes} phút`:''}`;};
const UI_TERM_VI={
  Sword:'Kiếm',Melee:'Cận chiến',Lightning:'Lôi',Spell:'Pháp thuật',Setup:'Chuẩn bị',Burst:'Bộc phát',Finisher:'Kết liễu',
  Control:'Khống chế',Heavy:'Trọng kích',Heal:'Hồi phục',Shield:'Khiên',Blood:'Huyết',Poison:'Độc',True:'Chân thương',Yin:'Âm',
  Fire:'Hỏa',Water:'Thủy',Ice:'Băng',Wood:'Mộc',Earth:'Thổ',Metal:'Kim',Buff:'Tăng ích',Debuff:'Giảm ích',Sustain:'Duy trì',
  Counter:'Phản chế',Support:'Hỗ trợ',Defense:'Phòng thủ',Mobility:'Cơ động',Ranged:'Tầm xa',Common:'Thường',Elite:'Tinh Anh',Enhanced:'Cường Hóa'
};
const localizeUiTerm=text=>UI_TERM_VI[String(text??'')]||String(text??'');
function navIcon(id){
  const common='viewBox="0 0 24 24" aria-hidden="true"';
  const icons={
    character:`<svg ${common}><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.7-4.2 3-6.3 6.5-6.3s5.8 2.1 6.5 6.3"/></svg>`,
    cultivation:`<svg ${common}><path d="M12 20V9"/><path d="M12 12C8 12 5.2 9.8 5 6.5c3.7-.4 6.2 1.3 7 4.2"/><path d="M12 12c4 0 6.8-2.2 7-5.5-3.7-.4-6.2 1.3-7 4.2"/><path d="M8 20h8"/></svg>`,
    hunt:`<svg ${common}><path d="M6 4l12 16"/><path d="M18 4L6 20"/><path d="M4 6l4-2-2 4"/><path d="M20 6l-4-2 2 4"/></svg>`,
    skills:`<svg ${common}><path d="M12 2l2.1 5.2L20 9l-4.6 3.5.2 5.8L12 15l-3.6 3.3.2-5.8L4 9l5.9-1.8L12 2z"/></svg>`,
    inventory:`<svg ${common}><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>`,
    reincarnation:`<svg ${common}><path d="M18.5 8A7 7 0 006 5.5L4 8"/><path d="M4 4v4h4"/><path d="M5.5 16A7 7 0 0018 18.5l2-2.5"/><path d="M20 20v-4h-4"/></svg>`,
    overview:`<svg ${common}><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>`,
    guide:`<svg ${common}><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`,
    path:`<svg ${common}><path d="M12 20V5"/><path d="M12 10l-5-3"/><path d="M12 13l5-3"/><circle cx="12" cy="4" r="2"/><circle cx="6" cy="7" r="2"/><circle cx="18" cy="10" r="2"/></svg>`,
    build:`<svg ${common}><path d="M4 6h10"/><path d="M18 6h2"/><circle cx="16" cy="6" r="2"/><path d="M4 12h2"/><path d="M10 12h10"/><circle cx="8" cy="12" r="2"/><path d="M4 18h8"/><path d="M16 18h4"/><circle cx="14" cy="18" r="2"/></svg>`,
    combat:`<svg ${common}><path d="M12 3l7 3v5c0 4.6-2.6 7.8-7 10-4.4-2.2-7-5.4-7-10V6l7-3z"/><path d="M9 12l2 2 4-5"/></svg>`,
    pvp:`<svg ${common}><path d="M7 4l10 16"/><path d="M17 4L7 20"/><path d="M5 6l3-2-1 4"/><path d="M19 6l-3-2 1 4"/><circle cx="12" cy="12" r="2.2"/></svg>`,
    automation:`<svg ${common}><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/></svg>`,
    collection:`<svg ${common}><path d="M4 10l8-6 8 6v9a2 2 0 01-2 2H6a2 2 0 01-2-2z"/><path d="M8 21v-7h8v7"/><path d="M9 10h6"/></svg>`,
    economy:`<svg ${common}><circle cx="9" cy="9" r="5"/><path d="M9 6v6M6.5 8h5M15 8h4l1 3-1 3h-5"/><path d="M14 14v5h6"/></svg>`,
    dongfu:`<svg ${common}><path d="M3 20h18"/><path d="M5 20V9l7-5 7 5v11"/><path d="M9 20v-6h6v6"/><path d="M7 10h10"/></svg>`,
    dungeons:`<svg ${common}><path d="M6 4l12 16"/><path d="M18 4L6 20"/><path d="M4 6l4-2-2 4"/><path d="M20 6l-4-2 2 4"/></svg>`,
    locations:`<svg ${common}><circle cx="12" cy="12" r="9"/><path d="M3.5 12h17M12 3c2.8 2.4 4.2 5.4 4.2 9S14.8 18.6 12 21c-2.8-2.4-4.2-5.4-4.2-9S9.2 5.4 12 3z"/></svg>`,
    devlab:`<svg ${common}><path d="M4 19l5-5"/><path d="M15 5l4 4-8 8-4-4 8-8z"/><circle cx="6" cy="18" r="2"/></svg>`,
    roots:`<svg ${common}><path d="M12 21V10"/><path d="M12 14c-4 0-6.5-2.2-7-6 4-.4 6.4 1.4 7 4.5"/><path d="M12 13c4 0 6.5-2.2 7-6-4-.4-6.4 1.4-7 4.5"/><circle cx="12" cy="5" r="2"/></svg>`
  };
  return icons[id]||`<span>${esc(id.slice(0,2).toUpperCase())}</span>`;
}
const tag=(text,cls='')=>`<span class="tag ${cls}">${esc(localizeUiTerm(text))}</span>`;
const progress=(value,cls='')=>`<div class="progress ${cls}"><i style="width:${pct(value)}%"></i></div>`;
const metric=(label,value)=>`<div class="metric-row"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;


async function loadUserAssetCatalog(){
  try{
    const response=await fetch('/assets/user/catalog.json',{cache:'no-store'});
    if(!response.ok)return;
    const parsed=await response.json();
    userAssetCatalog={
      schema:String(parsed?.schema||'tutien-user-assets.v1'),
      skins:Array.isArray(parsed?.skins)?parsed.skins:[],
      backgrounds:Array.isArray(parsed?.backgrounds)?parsed.backgrounds:[],
      equipment:{byId:{...(parsed?.equipment?.byId||{})},bySlot:{...(parsed?.equipment?.bySlot||{})}},
      skills:{byId:{...(parsed?.skills?.byId||{})}},
      featureIcons:{...(parsed?.featureIcons||{})},
    };
  }catch(error){ console.warn('[asset-catalog] Không nạp được catalog tùy biến:',error); }
}
function userAssetPath(group,id,slot=''){
  const key=String(id||'');
  if(group==='equipment')return userAssetCatalog.equipment?.byId?.[key]||userAssetCatalog.equipment?.bySlot?.[String(slot||'')]||'';
  if(group==='skills')return userAssetCatalog.skills?.byId?.[key]||'';
  if(group==='featureIcons')return userAssetCatalog.featureIcons?.[key]||'';
  return '';
}
function visualVariantAsset(entry={},variant='default',fallback=''){
  return String(entry?.variants?.[variant]||entry?.asset||fallback||'');
}
function visualLayoutStyle(entry={},kind='skin'){
  const l=entry?.layout||{};
  if(kind==='background'){
    const x=Math.max(0,Math.min(100,Number(l.positionX??50)||50));
    const y=Math.max(0,Math.min(100,Number(l.positionY??50)||50));
    const scale=Math.max(.8,Math.min(1.6,Number(l.scale??1)||1));
    return `--asset-bg-x:${x}%;--asset-bg-y:${y}%;--asset-bg-scale:${scale};`;
  }
  const width=Math.max(35,Math.min(120,Number(l.widthPct??68)||68));
  const height=Math.max(55,Math.min(125,Number(l.heightPct??96)||96));
  const x=Math.max(-20,Math.min(120,Number(l.xPct??50)||50));
  const y=Math.max(-25,Math.min(60,Number(l.yPct??1)||1));
  return `--asset-skin-width:${width}%;--asset-skin-height:${height}%;--asset-skin-x:${x}%;--asset-skin-y:${y}%;`;
}

async function request(path,options={}){
  const routed=DEV_MODE&&String(path).startsWith('/api/')?String(path).replace('/api/','/api/dev/'):path;
  const response=await fetch(routed,{headers:{'content-type':'application/json',...(options.headers||{})},...options});
  const data=await response.json().catch(()=>({ok:false,error:`HTTP ${response.status}`}));
  if(!response.ok||data.ok===false) throw new Error(data.error||`HTTP ${response.status}`);
  return data;
}
async function loadEquipmentBuildIntelligence(itemId){
  const id=String(itemId||''); if(!id)return;
  equipmentIntel={itemId:id,loading:true,data:null,error:''}; renderPreservingUi();
  try{
    const payload=await request(`/api/equipment-intelligence?itemId=${encodeURIComponent(id)}`);
    if(equipmentIntel.itemId!==id)return;
    equipmentIntel={itemId:id,loading:false,data:payload.intelligence||null,error:''}; renderPreservingUi();
  }catch(error){
    if(equipmentIntel.itemId!==id)return;
    equipmentIntel={itemId:id,loading:false,data:null,error:error?.message||'Không chạy được phân tích.'}; renderPreservingUi();
  }
}
let noticeTimerV129=0;
function showNotice(lines,error=false){
  const box=$('#notice'); const list=(Array.isArray(lines)?lines:[lines]).filter(Boolean);
  if(noticeTimerV129){clearTimeout(noticeTimerV129);noticeTimerV129=0;}
  if(!list.length){box.classList.add('hidden');return;}
  box.textContent=list.join(' · '); box.className=`notice${error?' error':''}`;
  noticeTimerV129=setTimeout(()=>{noticeTimerV129=0;box.classList.add('hidden');},2800);
}
function setSaveState(text,tone='idle'){
  const el=$('#saveState'); if(!el)return;
  el.textContent=text; el.dataset.tone=tone; el.setAttribute('aria-label',text);
}
function updateBackupButton(){
  const btn=$('#restoreBackup'); if(!btn)return;
  let valid=false; try{valid=Boolean(localStorage.getItem(STORAGE_BACKUP_KEY));}catch{}
  btn.disabled=!valid; btn.setAttribute('aria-disabled',valid?'false':'true');
}
let pendingLocalSaveV129=null;
let persistTimerV129=0;
let runtimeSaveTimerV129=0;
let runtimeSaveInFlightV129=false;
let runtimeSaveDirtyV129=false;
let runtimeSaveEpochV129=0;
function writePendingLocalSaveV129(){
  if(persistTimerV129){clearTimeout(persistTimerV129);persistTimerV129=0;}
  if(!pendingLocalSaveV129)return true;
  const save=pendingLocalSaveV129;pendingLocalSaveV129=null;
  try{
    const raw=JSON.stringify(save);
    localStorage.setItem(STORAGE_KEY,raw);
    const stamp=new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
    setSaveState(`Đã lưu · ${stamp}`,'saved');
    return true;
  }catch{ setSaveState('Không lưu được cục bộ','error'); return false; }
}
function persist(save){
  if(!save||DEV_MODE)return false;
  pendingLocalSaveV129=save;
  setSaveState('Đang lưu…','busy');
  if(persistTimerV129)clearTimeout(persistTimerV129);
  persistTimerV129=setTimeout(writePendingLocalSaveV129,180);
  return true;
}
function scheduleRuntimeSaveV129(delay=280){
  if(DEV_MODE)return;
  runtimeSaveDirtyV129=true;
  runtimeSaveEpochV129+=1;
  setSaveState('Đang lưu…','busy');
  if(runtimeSaveTimerV129)clearTimeout(runtimeSaveTimerV129);
  runtimeSaveTimerV129=setTimeout(()=>{runtimeSaveTimerV129=0;void flushRuntimeSaveV129();},Math.max(80,Number(delay)||280));
}
async function flushRuntimeSaveV129(){
  if(DEV_MODE||!runtimeSaveDirtyV129)return false;
  if(runtimeSaveInFlightV129)return false;
  runtimeSaveDirtyV129=false;
  runtimeSaveInFlightV129=true;
  const requestEpoch=runtimeSaveEpochV129;
  try{
    const payload=await request('/api/save');
    if(requestEpoch!==runtimeSaveEpochV129){runtimeSaveDirtyV129=true;return false;}
    if(payload?.save)persist(payload.save);
    return Boolean(payload?.save);
  }catch(error){
    runtimeSaveDirtyV129=true;
    setSaveState('Chưa lưu được · sẽ thử lại','error');
    return false;
  }finally{
    runtimeSaveInFlightV129=false;
    if(requestEpoch!==runtimeSaveEpochV129)runtimeSaveDirtyV129=true;
    if(runtimeSaveDirtyV129)scheduleRuntimeSaveV129(160);
  }
}
function flushRuntimeSaveSyncV129(){
  if(DEV_MODE)return writePendingLocalSaveV129();
  if(runtimeSaveTimerV129){clearTimeout(runtimeSaveTimerV129);runtimeSaveTimerV129=0;}
  try{
    const makeSave=globalThis.__TUTIEN_STANDALONE_SAVE_ENVELOPE__;
    if(typeof makeSave==='function'){
      runtimeSaveEpochV129+=1;
      pendingLocalSaveV129=makeSave();
      runtimeSaveDirtyV129=false;
    }
  }catch{/* fallback to the most recent coalesced save */}
  return writePendingLocalSaveV129();
}
function snapshotLocalSaveBackup(reason='manual'){
  try{
    flushRuntimeSaveSyncV129();
    const raw=localStorage.getItem(STORAGE_KEY); if(!raw)return false;
    const parsed=JSON.parse(raw);
    localStorage.setItem(STORAGE_BACKUP_KEY,JSON.stringify({schema:'tutien-web-local-backup.v1',reason,createdAtUnixMs:Date.now(),save:parsed}));
    updateBackupButton(); return true;
  }catch{return false;}
}
window.addEventListener('pagehide',flushRuntimeSaveSyncV129);
document.addEventListener('visibilitychange',()=>{if(document.hidden)flushRuntimeSaveSyncV129();});
const UI_SCROLL_SELECTOR=[
  '[data-scroll-key]',
  '.v12311-scroll',
  '.v138235-character-scroll',
  '.v138235-inventory-scroll',
  '.v2314-scroll',
  '.v2315-scroll',
  '.v2320-hub-scroll',
  '.v1086-skill-scroll',
  '.v107-body',
  '.v106-scroll-body',
  '.v106-sheet-body'
].join(',');
const TAB_UI_MEMORY=new Map();
let lastUiScrollInteractionAt=0;
function uiScrollKey(el,index=0){
  if(!el)return `scroll-${index}`;
  if(el.dataset?.scrollKey)return el.dataset.scrollKey;
  const sheet=el.closest?.('[data-sheet-panel]');
  if(sheet&&el.classList?.contains('v106-sheet-body'))return `sheet:${sheet.dataset.sheetPanel}`;
  const preferred=['v12311-scroll','v138235-character-scroll','v138235-inventory-scroll','v2314-scroll','v2315-scroll','v2320-hub-scroll','v1086-skill-scroll','v106-scroll-body','v107-body'];
  const cls=preferred.find(x=>el.classList?.contains(x));
  return cls?`tab:${activeTab}:${cls}`:`tab:${activeTab}:scroll-${index}`;
}
function captureUiContinuity(){
  const openSheet=content.querySelector('.v106-sheet.open');
  const scrolls={};
  [...content.querySelectorAll(UI_SCROLL_SELECTOR)].forEach((el,index)=>{
    if(!Number.isFinite(el.scrollTop))return;
    scrolls[uiScrollKey(el,index)]={top:el.scrollTop,left:el.scrollLeft||0};
  });
  return {tab:activeTab,sheetId:openSheet?.dataset.sheetPanel||'',scrolls};
}
let uiContinuityRafV129=0;
let uiContinuityTimerV129=0;
function cancelUiContinuityRestoreV129(){
  if(uiContinuityRafV129&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(uiContinuityRafV129);
  if(uiContinuityTimerV129)clearTimeout(uiContinuityTimerV129);
  uiContinuityRafV129=0;uiContinuityTimerV129=0;
}
function restoreUiContinuity(state,{domReplaced=true}={}){
  if(!state||state.tab!==activeTab)return;
  cancelUiContinuityRestoreV129();
  const apply=()=>{
    if(!state||state.tab!==activeTab)return;
    [...content.querySelectorAll(UI_SCROLL_SELECTOR)].forEach((el,index)=>{
      const saved=state.scrolls?.[uiScrollKey(el,index)];
      if(!saved)return;
      if(Number.isFinite(saved.top))el.scrollTop=saved.top;
      if(Number.isFinite(saved.left))el.scrollLeft=saved.left;
    });
    if(state.sheetId){
      const panel=content.querySelector(`[data-sheet-panel="${CSS.escape(state.sheetId)}"]`);
      if(panel){
        content.querySelectorAll('.v106-sheet.open').forEach(x=>x.classList.remove('open'));
        panel.classList.add('open');
      }
    }
  };
  // If render cache kept the same DOM, scroll/sheet state never moved.
  if(!domReplaced)return;
  apply();
  if(typeof requestAnimationFrame==='function'){
    uiContinuityRafV129=requestAnimationFrame(()=>{uiContinuityRafV129=0;apply();});
  }
  // One coalesced late pass handles image/font layout shifts without stacking
  // 80/220ms timers after every action.
  if(Object.keys(state.scrolls||{}).length||state.sheetId){
    uiContinuityTimerV129=setTimeout(()=>{uiContinuityTimerV129=0;apply();},140);
  }
}
content.addEventListener('scroll',e=>{if(e.target?.matches?.(UI_SCROLL_SELECTOR))lastUiScrollInteractionAt=Date.now();},true);
content.addEventListener('touchstart',()=>{lastUiScrollInteractionAt=Date.now();},{passive:true});
content.addEventListener('touchmove',()=>{lastUiScrollInteractionAt=Date.now();},{passive:true});
// V129 long-session performance: one delegated long-press handler replaces hundreds of
// per-card pointer listeners in large inventories. Replaced DOM nodes therefore carry no
// listener lifecycle of their own.
const itemLongPressV129={node:null,timer:0,startX:0,startY:0};
function cancelItemLongPressV129({clearFlag=false}={}){
  if(itemLongPressV129.timer){clearTimeout(itemLongPressV129.timer);itemLongPressV129.timer=0;}
  const node=itemLongPressV129.node;itemLongPressV129.node=null;
  if(clearFlag&&node)setTimeout(()=>{if(node?.dataset)node.dataset.longTriggered='0';},0);
}
content.addEventListener('pointerdown',e=>{
  const node=e.target?.closest?.('[data-item-long]');
  if(!node||!content.contains(node))return;
  cancelItemLongPressV129();
  itemLongPressV129.node=node;itemLongPressV129.startX=Number(e.clientX||0);itemLongPressV129.startY=Number(e.clientY||0);
  itemLongPressV129.timer=setTimeout(()=>{
    itemLongPressV129.timer=0;
    if(itemLongPressV129.node!==node||!node.isConnected)return;
    node.dataset.longTriggered='1';
    const panel=qsV129(`[data-sheet-panel="${CSS.escape(node.dataset.itemLong||'')}"]`);
    if(panel){qsaV129('.v106-sheet.open').forEach(x=>x.classList.remove('open'));panel.classList.add('open');panel.querySelector('.v106-sheet-body')?.focus?.({preventScroll:true});}
  },560);
},{passive:true});
content.addEventListener('pointermove',e=>{
  const node=itemLongPressV129.node;if(!node)return;
  if(Math.hypot(Number(e.clientX||0)-itemLongPressV129.startX,Number(e.clientY||0)-itemLongPressV129.startY)>10)cancelItemLongPressV129();
},{passive:true});
content.addEventListener('pointerup',()=>cancelItemLongPressV129({clearFlag:true}),{passive:true});
content.addEventListener('pointercancel',()=>cancelItemLongPressV129({clearFlag:true}),{passive:true});
function renderPreservingUi(){
  const continuity=captureUiContinuity();
  const domReplaced=render();
  restoreUiContinuity(continuity,{domReplaced});
}
function mergeCatalogPatchV129(previous,next){
  if(!next||typeof next!=='object'||Array.isArray(next))return next;
  const merged={...(previous&&typeof previous==='object'&&!Array.isArray(previous)?previous:{}),...next};
  if(Array.isArray(next.categories)){
    const order=[];const byId=new Map();
    for(const row of Array.isArray(previous?.categories)?previous.categories:[]){const id=String(row?.category||'');if(id){order.push(id);byId.set(id,row);}}
    for(const row of next.categories){const id=String(row?.category||'');if(!id)continue;if(!byId.has(id))order.push(id);byId.set(id,{...(byId.get(id)||{}),...row});}
    merged.categories=order.map(id=>byId.get(id)).filter(Boolean);
  }
  return merged;
}
function mergeSnapshotPatchV129(patch){
  if(!patch||typeof patch!=='object')return;
  const {schema:_patchSchema,activeView:_activeView,activeSubview:_activeSubview,...fields}=patch;
  if(!model){model={schema:'web-client-snapshot.v1',...fields};return;}
  for(const [key,value] of Object.entries(fields)){
    if((key==='collection'||key==='collectionEconomy')&&value&&typeof value==='object')model[key]=mergeCatalogPatchV129(model[key],value);
    else if((key==='character'||key==='shell')&&value&&typeof value==='object'&&!Array.isArray(value))model[key]={...(model[key]||{}),...value};
    else if(key==='overview'&&value&&typeof value==='object'&&!Array.isArray(value)){
      const previous=model.overview||{};
      model.overview={...previous,...value,life:{...(previous.life||{}),...(value.life||{})},cultivation:{...(previous.cultivation||{}),...(value.cultivation||{})}};
    }
    else model[key]=value;
  }
}
function adoptPayloadWithoutRender(payload){
  lastPayload=payload;
  if(payload.snapshot)model=payload.snapshot;
  else if(payload.snapshotPatch)mergeSnapshotPatchV129(payload.snapshotPatch);
  live=payload.realtime??live;
  if(payload.save&&!DEV_MODE) persist(payload.save);
  else if(payload.saveDirty&&!DEV_MODE) scheduleRuntimeSaveV129();
  selectedBossIntel=selectedBossIntel&&sameBossStillValid(selectedBossIntel)?selectedBossIntel:(model?.nextBossIntel??null);
}
function absorb(payload,{notice=true,preserveUi=true}={}){
  const continuity=preserveUi?captureUiContinuity():null;
  adoptPayloadWithoutRender(payload);
  if(equipmentIntel.data||equipmentIntel.error)equipmentIntel={itemId:equipmentIntel.itemId,loading:false,data:null,error:''};
  const domReplaced=render(); restoreUiContinuity(continuity,{domReplaced}); if(notice){ const lines=[...(payload.noticeLines||[]),...(payload.result?.summaryLines||[])]; if(lines.length) showNotice(lines.slice(0,4)); }
}
function sameBossStillValid(intel){ return model?.dungeons?.some(d=>d.id===intel.dungeonId&&d.nextFloor?.floor===intel.floor); }
function activeSubviewV129(){
  if(activeTab==='dongfu'){
    const section=String(dongfuUi.section||'home');
    return section==='scripture'&&Number.isFinite(Number(dongfuUi.manualRealmStage))?`${section}:${Number(dongfuUi.manualRealmStage)}`:section;
  }
  if(activeTab==='collection'){
    const category=String(collectionUi.category||'manual');
    return category==='manual'&&Number.isFinite(Number(collectionUi.manualRealmStage))?`${category}:${Number(collectionUi.manualRealmStage)}`:category;
  }
  if(activeTab==='inventory')return `${String(inventoryUi.view||'equipped')}|${String(inventoryUi.selectedId||'')}`;
  if(activeTab==='dungeons')return String(dungeonUi.section||'home');
  return '';
}
function clientViewRequestBodyV129(extra={}){return {...extra,clientView:activeTab,clientSubview:activeSubviewV129(),clientTransport:'view-patch.v140'};}
async function action(body){ setSaveState('Đang xử lý…','busy'); try{const payload=await request('/api/action',{method:'POST',body:JSON.stringify(clientViewRequestBodyV129(body))}); absorb(payload,{preserveUi:true}); return payload;}catch(error){showNotice(error.message,true);setSaveState('Lỗi','error');throw error;} }
async function perform(command){ return action({action:'perform',command}); }
async function bootstrap(){
  renderNav();
  await loadUserAssetCatalog();
  updateBackupButton();
  try{
    const saved=localStorage.getItem(STORAGE_KEY);
    if(saved){ try{absorb(await request('/api/load',{method:'POST',body:JSON.stringify(clientViewRequestBodyV129({save:JSON.parse(saved)}))}));}catch(error){showNotice(`Save cục bộ không nạp được: ${error.message}`,true); absorb(await request(`/api/view?view=${encodeURIComponent(activeTab)}&subview=${encodeURIComponent(activeSubviewV129())}`));} }
    else absorb(await request(`/api/view?view=${encodeURIComponent(activeTab)}&subview=${encodeURIComponent(activeSubviewV129())}`),{notice:false});
    if(DEV_MODE){ setSaveState('DEV · BẢN SAO · KHÔNG LƯU','dev'); showNotice('Dev Sandbox đang dùng bản sao tạm; Character/Equipment đọc cùng contract production nhưng không ghi đè save thật.'); }
  }catch(error){content.innerHTML=`<div class="card bad"><h2>Không kết nối được game server</h2><p>${esc(error.message)}</p><p class="muted small">Chạy <code>npm run web</code> rồi mở lại trang.</p></div>`;}
}
function resourceQuantity(id){return model?.inventory?.find(x=>x.id===id)?.quantity??0;}
function renderLocationsV95(){
  const rows=model.locations||[],current=rows.find(x=>x.current),order=realmOrder();
  const cards=rows.map(x=>`<article class="card ${x.current?'highlight':''}"><div style="display:flex;justify-content:space-between;gap:8px"><div><div class="eyebrow">${x.current?'Đang ở':x.known?'Đã biết':'Lân cận chưa khám phá'}</div><h2>${esc(x.name)}</h2></div>${tag(`Nguy hiểm ${num(x.danger)}`,x.danger>60?'red':'')}</div><div class="small muted">${esc(x.planeId||'Phàm giới')} · yêu cầu cảnh giới ${num(x.requiredRealmOrder||0)} · khoảng cách ${num(x.spatialDistance||0,1)}</div><div class="small" style="margin-top:7px">Tài nguyên: ${esc((x.resources||[]).join(' · ')||'Chưa rõ')}</div><div class="small muted">Liên thông: ${esc((x.neighbors||[]).join(' · ')||'—')}</div>${x.current?'':`<button class="button ${x.known?'primary':'ghost'}" style="margin-top:10px" data-travel-location="${esc(x.id)}" ${order<Number(x.requiredRealmOrder||0)?'disabled':''}>${x.known?'Du Hành':'Thăm Dò'}</button>`}</article>`).join('');
  return page('Bản Đồ · Du Hành',current?`Hiện tại: ${current.name}. Mở bản đồ không tự khám phá; địa điểm chỉ được ghi nhận sau khi thật sự đặt chân tới.`:'Bản đồ thế giới đời hiện tại.',`<div class="grid cols-3">${cards||'<div class="empty">Chưa có địa điểm khả dụng.</div>'}</div>`);
}
function renderJournalV95(){
  const own=(model.journal||[]).slice().reverse(),world=(model.worldHistory||[]).slice().reverse();
  const list=(rows,empty)=>rows.length?rows.map(x=>`<div class="list-item"><div style="display:flex;justify-content:space-between;gap:8px"><strong>Năm ${num(x.worldYear,2)}</strong>${tag(`Mức ${num(x.significance)}`)}</div><div>${esc(x.message)}</div><div class="tag-row">${(x.tags||[]).slice(0,5).map(t=>tag(t)).join('')}</div></div>`).join(''):`<div class="empty">${empty}</div>`;
  return page('Nhật Ký','Một bên là dấu mốc của chính nhân vật; một bên là đại sự thế giới đã thật sự xảy ra.',`<div class="grid cols-2"><section class="card"><h2>Đời hiện tại</h2><div class="list">${list(own,'Chưa có dấu mốc đáng kể.')}</div></section><section class="card"><h2>Thiên Hạ Ký</h2><div class="list">${list(world,'Thế giới chưa ghi nhận đại sự.')}</div></section></div>`);
}
function renderPowerV95(){
  const p=model.personalPower||{},b=p.breakdown||{},prov=p.statProvenance||{};
  const axes=[['Sát thương',b.offense],['Sinh tồn',b.survival],['Tài nguyên',b.resource??b.control],['Nhịp chiến đấu',b.tempo??b.mobility]];
  const sources=(p.sources||[]).map(x=>`<div class="list-item"><div style="display:flex;justify-content:space-between"><strong>${esc(x.name)}</strong><b>${num(x.scoreAfter)}</b></div><div class="small ${Number(x.gainPctFromPrevious||0)>0?'good-text':'muted'}">${Number(x.gainPctFromPrevious||0)>0?`+${num(x.gainPctFromPrevious,1)}% từ tầng trước`:'Không tăng đáng kể ở tầng này'}</div></div>`).join('');
  const fmtStat=(value,unit)=>{
    if(unit==='pct_point')return `${num(value,2)}%`;
    if(unit==='pct_per_second')return `${num(value,2)}%/s`;
    if(unit==='multiplier')return `×${num(value,3)}`;
    return num(value,2);
  };
  const fmtDelta=(value,unit)=>{
    const sign=Number(value)>=0?'+':'';
    if(unit==='pct_point')return `${sign}${num(value,2)} điểm %`;
    if(unit==='pct_per_second')return `${sign}${num(value,2)} điểm %/s`;
    if(unit==='multiplier')return `${sign}${num(value,4)}`;
    return `${sign}${num(value,2)}`;
  };
  const statRows=(prov.stats||[]).map(st=>{
    const rows=(st.sources||[]).map(src=>{
      const exact=[];
      if(src.flatInput!==undefined)exact.push(`cộng thẳng ${fmtDelta(src.flatInput,st.unit)}`);
      if(src.multiplierPctInput!==undefined)exact.push(`% nhân +${num(src.multiplierPctInput,2)}%`);
      return `<div class="list-item" style="margin-top:7px"><div style="display:flex;justify-content:space-between;gap:8px"><strong>${esc(src.name)}</strong><b>${esc(fmtDelta(src.realizedDelta,st.unit))}</b></div><div class="small muted">${esc(fmtStat(src.before,st.unit))} → ${esc(fmtStat(src.after,st.unit))}${exact.length?` · ${esc(exact.join(' · '))}`:''}</div></div>`;
    }).join('');
    const stack=st.stackingRule?`<div class="footer-note"><b>${esc(st.stackingRule.name||'')}</b> · ${esc(st.stackingRule.detail||'')}</div>`:'';
    return `<details class="card" style="padding:10px 12px"><summary style="cursor:pointer;display:flex;justify-content:space-between;gap:10px;align-items:center"><span><b>${esc(st.name)}</b><small class="muted" style="display:block">${esc(st.group||'')}</small></span><span style="text-align:right"><b>${esc(fmtStat(st.finalValue,st.unit))}</b><small class="muted" style="display:block">Nền ${esc(fmtStat(st.baseValue,st.unit))}</small></span></summary><div style="margin-top:9px">${stack}${rows||'<div class="empty">Không có nguồn cộng thêm; đang dùng đúng Giá trị Nền.</div>'}</div></details>`;
  }).join('');
  const terms=prov.terminology||{};
  const rootRows=(prov.rootStats||[]).map(x=>`<div class="list-item"><div style="display:flex;justify-content:space-between;gap:10px"><strong>${esc(x.name)}</strong><b>${num(x.totalPoints,0)} điểm</b></div><div class="small muted">Đời hiện tại ${num(x.lifePoints,0)} + Luân Hồi ${num(x.permanentPoints,0)} · ${esc(x.perPointText||'')} · đóng góp trực tiếp ${x.id==='body'?`${num(x.combatContribution,0)} Thể Phách = ${num(Number(x.combatContribution||0)*20,0)} HP chuẩn`:`+${num(x.combatContribution,0)} ${esc(x.combatStat||'')}`}</div></div>`).join('');
  const terminology=`<section class="card" style="margin-top:14px"><div class="eyebrow">V129 · NGUỒN CHỈ SỐ</div><h2>Chỉ số Gốc khác stat combat thế nào?</h2><div class="list">${rootRows||'<div class="empty">Chưa có điểm Chỉ số Gốc.</div>'}<div class="list-item"><b>Giá trị Nền</b><div class="small muted">${esc(terms.baseValue||'Stat trước khi các hệ cá nhân cộng thêm.')}</div></div><div class="list-item"><b>Cộng thẳng · Điểm % · % nhân</b><div class="small muted">${esc(terms.flat||'')} ${esc(terms.percentagePoint||'')} ${esc(terms.multiplier||'')}</div></div></div></section>`;
  const statPanel=`<section style="margin-top:14px"><div class="page-title" style="margin-bottom:8px"><div><h2>Chi tiết từng chỉ số combat</h2><p>Bấm một chỉ số để xem đường đi từ Giá trị Nền đến số cuối cùng.</p></div></div><div class="grid cols-2">${statRows}</div></section>`;
  return page('Chiến Lực',`${p.identity||'Build hiện tại'} · số cuối được dựng từ đúng CombatEntity thật; nguồn chỉ số có thể truy ngược từng lớp.`,`<div class="card highlight"><div class="eyebrow">Chiến Lực cá nhân</div><div class="big-number">${num(p.score)}</div><div class="grid cols-4" style="margin-top:10px">${axes.map(([k,v])=>metric(k,num(v))).join('')}</div><div class="tag-row" style="margin-top:10px">${tag(`Sở trường: ${p.strongestAxis||'—'}`,'gold')}${tag(`Nút thắt: ${p.bottleneckAxis||'—'}`)}</div></div><div class="grid cols-2" style="margin-top:14px"><section class="card"><h2>Nguồn sức mạnh</h2><div class="list">${sources}</div></section><section class="card"><h2>Bước tiếp theo</h2><div class="list">${(p.nextGoals||[]).map(x=>`<div class="list-item">${esc(x)}</div>`).join('')||'<div class="empty">Chưa có gợi ý.</div>'}</div><div class="footer-note">Tỷ trọng cá nhân ${num(p.personalSharePct||100,1)}% · thế lực ${num(p.factionSharePct||0,1)}%.</div></section></div>${terminology}${statPanel}`);
}
function renderSoulV96(){
  const s=model.soul||{},mid=s.midgame||{};
  if(!s.awakened)return page('Thần Hồn · Phân Thân','Mở tại Nguyên Anh. Đây là hệ worker thật cho hoạt động song song, không phải chỉ số trang trí.',`<div class="card"><h2>Chưa kết Nguyên Anh</h2><p class="muted">Khi đạt Nguyên Anh, Thần Hồn thức tỉnh và mở Phân Thân vị.</p></div>`);
  const pressure=Math.round(Number(s.pressureMultiplier||1)*100);
  const finalObjectives=mid.finalGate?.objectives||[];
  const midgamePanel=mid.active||mid.completed?`<section class="v112-midgame ${mid.finalGate?.ready||mid.completed?'complete':''}"><div class="v112-midgame-head"><div><span>V112 · NGUYÊN ANH MIDGAME</span><h2>${esc(mid.title||'Nguyên Anh Tu Nghiệp')}</h2><p>${esc(mid.role||'Nuôi Anh Thể, vận hành Phân Thân và công phá Dưỡng Hồn Trì.')}</p></div><b>${esc(mid.stage?.headline||'')}</b></div>${mid.active?`<div class="v112-objectives">${finalObjectives.map(o=>`<article class="${o.complete?'done':''}"><i>${o.complete?'✓':'○'}</i><div><strong>${esc(o.name)}</strong><span>${esc(o.current)} → ${esc(o.target)}</span><small>${esc(o.detail)}</small></div></article>`).join('')}</div><div class="v112-next"><div><small>VIỆC NÊN LÀM TIẾP</small><strong>${esc(mid.nextAction?.title||'Tiếp tục Tu Luyện')}</strong><span>${esc(mid.nextAction?.detail||'')}</span></div><button class="button gold" data-tab-jump="${esc(mid.nextAction?.route||'cultivation')}">Đi ngay</button></div>`:`<div class="v112-finished"><b>✓ Đã hoàn tất Nguyên Anh Tu Nghiệp</b><span>Phân Thân tiếp tục là worker farm song song; Hóa Thần chuyển trọng tâm sang Đạo Ý/Đạo Vực.</span></div>`}<div class="v112-rules"><span><b>Main Body</b> first-clear Boss bằng CombatKernel V2.</span><span><b>Phân Thân</b> chỉ treo tầng đã first-clear; đúng chuyên môn Lục Đạo +20%, làm trái chuyên môn không bị phạt.</span></div></section>`:'';
  const clones=(s.clones||[]).map(c=>{
    const assignmentTarget=(s.recommendedTargets||[]).find(t=>t.dungeonId===c.assignment?.dungeonId);
    const workRuns=Number(c.dungeonWorkRuns??c.assignment?.totalRuns??0),workYears=Number(c.dungeonWorkYears??c.assignment?.totalYears??0);
    const targets=c.authorityUnlocked===false?[]:(c.assignmentRecommendations||s.recommendedTargets||s.assignableTargets||[]);
    return `<article class="card v112-clone"><div class="v112-clone-title"><div><div class="eyebrow">${esc(c.sixDaoName||c.specialization)}</div><h2>${esc(c.name)}</h2></div>${tag(`Tải ${num(c.soulLoad,1)}`)}</div><div class="small">${esc(c.sixDaoDescription||'')}<br>Ổn định ${num(c.stability,1)} · hiệu suất nền ${num(Number(c.baseEfficiency||0)*100,1)}%</div><div class="list-item" style="margin:8px 0"><div style="display:flex;justify-content:space-between;gap:8px"><b>Đạo Hạnh Lv${num(c.progression?.level||1)} / ${num(c.progression?.maxLevel||50)}</b>${tag(c.progression?.seal?.name||c.daoSealName||'Phàm Ấn')}</div><div class="small muted">Đúng chuyên môn ×${num(c.progression?.specialtyEfficiency||1.2,3)} · Hộ Pháp chất lượng ×${num(c.progression?.protectorQualityMultiplier||1,3)}</div><div class="tag-row" style="margin-top:7px"><button class="button primary" data-soul-dao-train="${esc(c.id)}" ${(c.authorityUnlocked===false||!c.progression?.canTrain)?'disabled':''}>Bồi Dưỡng${c.progression?.trainCost?` · ${num(c.progression.trainCost.soulDew)} Lộ + ${num(c.progression.trainCost.soulEssence)} Tinh Hoa`:''}</button>${c.progression?.nextSeal?`<button class="button gold" data-soul-dao-seal="${esc(c.id)}" ${(c.authorityUnlocked===false||!c.progression?.canUpgradeSeal)?'disabled':''}>Thăng Ấn ${esc(c.progression.nextSeal.name)}${c.progression?.sealCost?` · ${num(c.progression.sealCost.soulDew)}+${num(c.progression.sealCost.soulEssence)}`:''}</button>`:'<button class="button gold" disabled>Đã Ngũ Chuyển</button>'}</div>${c.progression?.blockedBySeal?`<div class="small warn-text">Đã chạm mốc Lv${num(c.progression.level)}; cần Thăng Ấn trước khi tăng tiếp.</div>`:''}</div><div class="v112-work ${c.assignment?'active':''}"><b>${c.authorityUnlocked===false?'TẠM PHONG ẤN V127':c.role==='protector'?'ĐANG HỘ PHÁP':c.assignment?'ĐANG VẬN HÀNH':'ĐANG NHÀN RỖI'}</b><span>${c.authorityUnlocked===false?'Save cũ được giữ nguyên nhưng quyền Phân Thân này chưa mở ở cảnh giới hiện tại.':c.role==='protector'?'Ngừng farm để tăng Tu Vi cho Bản Thể.':c.assignment?`${esc(assignmentTarget?.dungeonName||c.assignment.dungeonId)} · Tầng ${num(c.assignment.floor)}`:'Chọn một Phó Bản đã first-clear ở dưới.'}</span><small>Đã farm thật: ${num(workRuns)} lượt · ${num(workYears,1)} năm</small></div><div class="tag-row"><button class="button ${c.role==='protector'?'gold':'ghost'}" data-soul-protector="${esc(c.id)}" data-enabled="${c.role==='protector'?'0':'1'}" ${c.authorityUnlocked===false?'disabled':''}>${c.role==='protector'?'Rời Hộ Pháp':'Chuyển Hộ Pháp'}</button></div><div class="v112-assign-list">${c.role==='protector'?'':targets.map(t=>{const match=c.specialization==='general'||c.specialization===t.purpose||(c.specializationPurposes||[]).includes(t.purpose);return `<button class="button ghost ${match?'match':''}" data-soul-assign="${esc(c.id)}" data-dungeon="${esc(t.dungeonId)}" data-floor="${num(t.floor)}"><span>${esc(t.dungeonName)} · T${num(t.floor)}</span><small>${match?`Đúng chuyên môn · ×${num(c.progression?.specialtyEfficiency||1.2,3)}`:'Ngoài chuyên môn · ×1.00'}</small></button>`}).join('')}</div><button class="button ghost v112-dismiss" data-soul-dismiss="${esc(c.id)}">Thu hồi Phân Thân</button></article>`;
  }).join('');
  return page('Thần Hồn · Phân Thân',`Tải hoạt động ${num(s.totalLoad,1)}/${num(s.loadCapacity,1)} · hiệu suất áp lực ${num(pressure)}% · quyền Phân Thân ${num(s.activeCloneCount||0)}/${num(s.cloneAuthorityCapacity||0)} (tối đa ${num(s.cloneAuthorityMax||6)}).${Number(s.sealedCloneCount||0)>0?` ${num(s.sealedCloneCount)} Phân Thân save cũ đang tạm phong ấn.`:''}`,`${midgamePanel}<div class="grid cols-4 v112-soul-metrics"><div class="card">${metric('Cường độ',num(s.strength,1))}</div><div class="card">${metric('Độ thuần',num(s.purity,1))}</div><div class="card">${metric('Ổn định',num(s.stability,1))}</div><div class="card">${metric('Ngộ tính',num(s.insight||0,1))}</div></div><div class="card v112-nourish"><div><h2>Dưỡng Hồn</h2><div class="small muted">Có ${num(s.resources?.soulDew)} Dưỡng Hồn Lộ · ${num(s.resources?.soulEssence)} Thần Hồn Tinh Hoa. Mỗi batch tốn 4 + 1.</div></div><div class="tag-row"><button class="button primary" data-soul-nourish="1">Dưỡng +1</button><button class="button ghost" data-soul-nourish="5">Dưỡng +5</button></div><div class="v112-create"><small>${s.canCreateClone?`Tạo Phân Thân kế tiếp: ${num(s.nextCloneCost?.soulDew)} Lộ + ${num(s.nextCloneCost?.soulEssence)} Tinh Hoa`:(s.nextCloneAuthorityMilestone?`Quyền Phân Thân kế tiếp mở tại ${esc(s.nextCloneAuthorityMilestone.majorRealm)}.`:'Đã mở đủ 6 quyền Phân Thân V127.')} parallelWorkerCapacity cũ không mở thêm quyền.</small><div>${s.canCreateClone&&s.nextCloneDao?`<button class="button ghost" data-soul-create="1">Tạo ${esc(s.nextCloneDao.name)}</button>`:`<button class="button ghost" disabled>Đã đủ Lục Đạo</button>`}</div></div></div><div class="grid cols-2 v112-clone-grid">${clones||'<div class="card empty">Chưa có Phân Thân. Farm Dưỡng Hồn Trì → tạo Phân Thân → giao việc để mở farm song song.</div>'}</div>`);
}
function renderFactionV97(){
  const f=model.faction||{},m=f.membership,cur=(f.factions||[]).find(x=>x.current);
  const facilities=cur?Object.entries(cur.facilities||{}).map(([id,lv])=>`<div class="list-item"><div style="display:flex;justify-content:space-between"><b>${esc(id)}</b><span>Tầng ${num(lv)}</span></div><button class="button ghost" data-faction-upgrade="${esc(id)}">Nâng cơ sở</button></div>`).join(''):'';
  const archiveItems=cur?[...(cur.archive?.techniqueIds||[]).map(id=>['technique',id]),...(cur.archive?.skillIds||[]).map(id=>['skill',id]),...(cur.archive?.recipeIds||[]).map(id=>['recipe',id])]:[];
  const archive=archiveItems.map(([kind,id])=>`<div class="list-item"><span>${esc(kind)} · <b>${esc(id)}</b></span><button class="button ghost" data-faction-learn="${esc(kind)}" data-knowledge="${esc(id)}">Lĩnh ngộ</button></div>`).join('');
  const contribute=(f.contributableKnowledge||[]).map(x=>`<div class="list-item"><span>${esc(x.kind)} · <b>${esc(x.name||x.id)}</b></span><button class="button ghost" data-faction-knowledge="${esc(x.kind)}" data-knowledge="${esc(x.id)}">Ghi vào truyền thừa</button></div>`).join('');
  const members=(cur?.members||[]).filter(x=>x.memberType==='npc').map(x=>`<div class="list-item"><span><b>${esc(x.name)}</b> · ${esc(x.rank)}</span>${f.canManageMembers&&archiveItems[0]?`<button class="button ghost" data-faction-teach="${esc(x.memberId)}" data-knowledge="${esc(archiveItems[0][1])}">Truyền ${esc(archiveItems[0][1])}</button>`:''}</div>`).join('');
  const recruits=(f.recruitCandidates||[]).map(x=>`<div class="list-item"><span><b>${esc(x.name)}</b> · cảnh giới ${num(x.realmOrder)}</span><button class="button primary" data-faction-invite="${esc(x.id)}">Mời nhập môn</button></div>`).join('');
  const cards=(f.factions||[]).map(x=>`<article class="card ${x.current?'highlight':''}"><div class="eyebrow">${esc(x.locationName)}</div><h2>${esc(x.name)}</h2><div class="small">Uy vọng ${num(x.prestige,1)} · ổn định ${num(x.stability,1)} · ${num(x.memberCount)} môn nhân</div><div class="tag-row">${(x.doctrineTags||[]).slice(0,4).map(t=>tag(t)).join('')}</div>${x.canJoin?`<button class="button primary" data-faction-join="${esc(x.id)}">Bái nhập</button>`:''}</article>`).join('');
  const top=m?`<div class="card highlight"><div class="eyebrow">Tông môn hiện tại</div><h2>${esc(cur?.name||m.factionId)} · ${esc(m.rankName||m.rank)}</h2><div class="small">Công đức ${num(m.merit||0)}${f.nextPromotion?` · mốc tiếp ${esc(f.nextPromotion.name)}: ${num(f.nextPromotion.minMerit)} công đức / cảnh giới ${num(f.nextPromotion.minRealmOrder)}`:''}</div><div class="tag-row" style="margin-top:8px"><button class="button primary" data-faction-contribute="10">Cống hiến 10 Linh Thạch</button><button class="button ghost" data-faction-promote ${f.nextPromotion?.canPromote?'':'disabled'}>Thăng danh phận</button><button class="button ghost" data-faction-leave>Rời tông</button></div></div>`:`<div class="card"><h2>Chưa có Tông Môn</h2><p class="muted">Đến sơn môn để bái nhập, hoặc từ Tử Phủ trở lên có đủ 300 Linh Thạch thì tự khai sơn.</p>${f.canFound?'<button class="button primary" data-faction-found>Khai Sơn Lập Phái</button>':''}</div>`;
  return page('Tông Môn',`${f.currentLocationName||'—'} · thế lực, tài nguyên, truyền thừa và môn nhân đều ghi vào state thật.`,`${top}<div class="grid cols-2" style="margin-top:14px">${cards}</div>${cur?`<div class="grid cols-2" style="margin-top:14px"><section class="card"><h2>Cơ sở</h2><div class="list">${facilities}</div></section><section class="card"><h2>Tàng Kinh · Truyền Thừa</h2><div class="list">${archive||'<div class="empty">Chưa có truyền thừa.</div>'}</div><h3>Sở học có thể đóng góp</h3><div class="list">${contribute||'<div class="empty">Không có sở học mới để ghi vào kho.</div>'}</div></section></div><div class="grid cols-2" style="margin-top:14px"><section class="card"><h2>Môn Nhân</h2><div class="list">${members||'<div class="empty">Chưa có NPC môn nhân.</div>'}</div></section><section class="card"><h2>Chiêu Mộ</h2><div class="list">${recruits||'<div class="empty">Chưa có nhân duyên đủ điều kiện hoặc cần đạt Trưởng Lão.</div>'}</div></section></div>`:''}`);
}
function renderSocialV97(){
  const s=model.social||{};
  const roleLabels={master:'Bái Sư',disciple:'Thu Đồ',daoPartner:'Kết Đạo Lữ'};
  const npcCards=(s.npcs||[]).map(n=>{
    const actions=(n.actions||s.actions||[]).map(a=>{const cost=Number(a.spiritStoneCost||0);const cd=Number(a.cooldownYearsRemaining||0);const extra=[cost?`${num(cost)} Linh Thạch`:'',cd>0?`~${Math.ceil(cd*365)} ngày game`:''].filter(Boolean).join(' · ');return `<button class="button ghost" data-social-interact="${esc(n.id)}" data-social-action="${esc(a.id)}" ${a.available===false?'disabled':''} title="${esc(a.disabledReason||extra||a.name)}">${esc(a.name)}${extra?` · ${esc(extra)}`:''}</button>`;}).join('');
    const roles=(n.roles||Object.entries(n.eligibility||{}).map(([role,available])=>({role,label:roleLabels[role]||role,available,disabledReason:''}))).map(r=>`<button class="button ${r.available?'primary':'ghost'}" data-social-role="${esc(r.role)}" data-npc="${esc(n.id)}" ${r.available?'':'disabled'} title="${esc(r.disabledReason||r.label||roleLabels[r.role]||r.role)}">${esc(r.label||roleLabels[r.role]||r.role)}</button>`).join('');
    const blocked=[...(n.actions||[]).filter(a=>a.available===false&&a.disabledReason).map(a=>`${a.name}: ${a.disabledReason}`),...(n.roles||[]).filter(r=>!r.available&&r.disabledReason).map(r=>`${r.label}: ${r.disabledReason}`)];
    return `<article class="card"><div style="display:flex;justify-content:space-between"><div><div class="eyebrow">Cảnh giới ${num(n.realmOrder)} · ${n.met?'Đã kết giao':'Chưa kết giao'}</div><h2>${esc(n.name)}</h2></div>${n.activeRole?tag(n.activeRole,'gold'):''}</div><div class="grid cols-5"><span>Tin ${num(n.relation.trust,1)}</span><span>Kính ${num(n.relation.respect,1)}</span><span>Ân ${num(n.relation.debt,1)}</span><span>Oán ${num(n.relation.grudge,1)}</span><span>Duyên ${num(n.relation.karmaDepth,1)}</span></div><div class="tag-row" style="margin-top:8px">${actions}</div><div class="tag-row" style="margin-top:8px">${roles}</div>${blocked.length?`<div class="small muted" style="margin-top:8px">${blocked.slice(0,4).map(x=>`• ${esc(x)}`).join('<br>')}</div>`:''}</article>`;
  }).join('');
  const bonds=(s.bonds||[]).map(b=>`<div class="list-item"><b>${esc(b.npcName)}</b> · ${esc(b.role)} · Duyên sâu ${num(b.bondDepth||0,1)}${b.role==='master'?`<button class="button ghost" data-master-teach="${esc(b.npcId)}">Thỉnh giáo</button>`:''}${b.role==='disciple'?`<button class="button ghost" data-disciple-teach="${esc(b.npcId)}">Truyền công</button>`:''}${b.role==='daoPartner'?`<button class="button ghost" data-partner-cultivate="${esc(b.npcId)}">Song tu</button><button class="button ghost" data-partner-child="${esc(b.npcId)}">Sinh hậu duệ</button>`:''}</div>`).join('');
  const family=(s.family||[]).map(x=>`<div class="list-item"><b>${esc(x.name)}</b> · ${esc(x.relation)}${['father','mother'].includes(x.relation)?`<button class="button ghost" data-parent-guidance="${esc(x.id)}">Xin chỉ dẫn</button>`:''}</div>`).join('');
  const history=(s.history||[]).slice(-6).reverse().map(x=>`<div class="list-item small">${esc(x.message)}</div>`).join('');
  return page('Nhân Duyên',`${s.currentLocationName||'—'} · ${num(s.spiritStones||0)} Linh Thạch · cooldown tương tác trọng yếu ${num(s.interactionCooldownYears||0.2,1)} năm game.`,`<div class="grid cols-2">${npcCards||'<div class="card empty">Không có NPC sống tại địa điểm hiện tại.</div>'}</div><div class="grid cols-2" style="margin-top:14px"><section class="card"><h2>Quan hệ trọng yếu</h2><div class="list">${bonds||'<div class="empty">Chưa có Sư Phụ, Đệ Tử hoặc Đạo Lữ.</div>'}</div></section><section class="card"><h2>Gia đình</h2><div class="list">${family||'<div class="empty">Chưa có gia đình được ghi nhận.</div>'}</div></section></div><section class="card" style="margin-top:14px"><h2>Nhật ký Nhân Duyên</h2><div class="list">${history||'<div class="empty">Chưa có tương tác gần đây.</div>'}</div><div class="footer-note">Mỗi hành động cập nhật ngay 5 trục Tin / Kính / Ân / Oán / Duyên; nút bị khóa luôn hiển thị nguyên nhân.</div></section>`);
}
function renderDaoV98(){
  const d=model.dao||{};
  if(!d.awakened)return page('Đạo Ý · Đạo Vực','Mở tại Hóa Thần. Đây là tầng tiến hóa của Chủ Đạo đã chọn ở Trúc Cơ, không phải một Chủ Đạo thứ hai.',`<div class="card"><h2>Đạo Ý chưa thức tỉnh</h2><p class="muted">Đạt Hóa Thần để bắt đầu ngộ sâu Chủ Đạo ${esc(d.canonicalDaoName||'đã Định Đạo')}.</p></div>`);
  if(!d.canonicalDaoId)return page('Đạo Ý · Đạo Vực','Không thể tạo Chủ Đạo Hóa Thần độc lập.',`<div class="card bad"><h2>Chưa có Chủ Đạo canonical</h2><p>Đời này cần hoàn tất Định Đạo trước khi tiến hành Ngộ Đạo.</p></div>`);
  const p=d.selected,preview=d.contemplationPreview||{};
  const interpretations=(p?.interpretations||[]).map(i=>`<button class="button ${p.interpretationId===i.id?'primary':'ghost'}" data-dao-interpretation="${esc(i.id)}" ${p.interpretationId===i.id?'disabled':''}>${esc(i.name)}</button>`).join('');
  return page('Đạo Ý · Đạo Vực',`${d.canonicalDaoName} là tầng tiến hóa của Chủ Đạo đã khóa từ Trúc Cơ.`,`<div class="card highlight"><div class="eyebrow">Chủ Đạo kế thừa</div><h2>${esc(d.canonicalDaoName)}</h2>${d.legacyMainDaoId?`<div class="small muted">Save cũ có ${esc(d.legacyMainDaoId)}; V98 giữ tương thích nhưng mọi tiến triển mới khóa về ${esc(d.canonicalDaoId)}.</div>`:''}<div class="grid cols-4">${metric('Độ sâu',num(p?.depth||0,2))}${metric('Cảm ngộ',num(p?.insight||0,1))}${metric('Đạo Ấn',num(p?.marks||0))}${metric('Giai đoạn',p?.stage||'Chưa nhập Đạo')}</div><div class="small muted" style="margin-top:8px">Ngộ 1 năm dự kiến: +${num(preview.insightGain||0,1)} cảm ngộ · +${num(preview.depthGain||0,2)} độ sâu · cộng hưởng ×${num(preview.resonanceMultiplier||1,2)}</div><div class="tag-row" style="margin-top:10px"><button class="button primary" data-dao-contemplate="1">Tĩnh Ngộ 1 năm</button><button class="button ghost" data-dao-contemplate="5">5 năm</button>${interpretations}</div></div><div class="card" style="margin-top:14px"><h2>Đạo Vực</h2><p class="small">Điều kiện: Độ sâu ≥60 và đã chọn Diễn Giải. Khi manifest, modifier/triggers được bơm vào CombatEntity thật.</p><div class="tag-row">${d.domain?.active?'<button class="button ghost" data-dao-domain="0">Thu Đạo Vực</button>':`<button class="button primary" data-dao-domain="1" ${d.domain?.available?'':'disabled'}>Manifest Đạo Vực</button>`}</div></div>`);
}

function renderMyriadLivesV101(){
  const m=model.myriadLives||{},sum=m.summary||{},rec=m.records||{},cur=m.currentProjection||{};
  const delta=n=>{const v=Number(n||0);return `<b class="${v>0?'good-text':v<0?'bad-text':'muted'}">${v>0?'+':''}${num(v)}</b>`};
  const recordCards=[
    ['Kỷ lục điểm',rec.bestScore?`Đời ${rec.bestScore.lifeNumber} · ${num(rec.bestScore.value)} · ${rec.bestScore.grade}`:'Chưa có'],
    ['Cảnh giới cao nhất',rec.highestRealm?`Đời ${rec.highestRealm.lifeNumber} · ${rec.highestRealm.realmName}`:'Chưa có'],
    ['Trường thọ nhất',rec.longestLife?`Đời ${rec.longestLife.lifeNumber} · ${num(rec.longestLife.ageYears,1)} tuổi`:'Chưa có'],
    ['Luân Hồi tốt nhất',rec.bestReincarnationReward?`Đời ${rec.bestReincarnationReward.lifeNumber} · +${num(rec.bestReincarnationReward.permanentPotentialGain)} Tiềm Năng vĩnh viễn`:'Chưa có'],
  ];
  const currentCats=(cur.categories||[]).map(x=>`<div class="list-item"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(x.name)}</b><strong>${num(x.score)}</strong></div>${(cur.vsPreviousLife?.categoryDeltas||[]).find(d=>d.id===x.id)?`<div class="small muted">So Đời ${num(cur.vsPreviousLife.lifeNumber)}: ${delta((cur.vsPreviousLife.categoryDeltas||[]).find(d=>d.id===x.id)?.delta)}</div>`:''}<div class="small muted">${esc((x.reasons||[])[0]||'Chưa có dấu mốc nổi bật.')}</div></div>`).join('');
  const categoryRecords=(rec.categories||[]).map(x=>`<div class="list-item"><span>${esc(x.name)}</span><b>${x.lifeNumber?`Đời ${num(x.lifeNumber)} · ${num(x.score)}`:'—'}</b></div>`).join('');
  const insights=(m.insights||[]).map(x=>`<div class="list-item">${esc(x)}</div>`).join('')||'<div class="empty">Chưa đủ dữ liệu để so sánh các đời.</div>';
  const lives=(m.lives||[]).slice().reverse().map(l=>{
    const reward=l.reincarnationReward;
    const cat=(l.categories||[]).map(x=>`<div class="metric-row"><span>${esc(x.name)}</span><strong>${num(x.score)}</strong></div>`).join('');
    const chron=(l.chronicle||[]).map(x=>`<div class="list-item"><b>${num(x.ageYears,1)} tuổi</b> · ${esc(x.text)}</div>`).join('')||'<div class="empty">Không có biên niên đáng kể.</div>';
    const stats=Object.entries(l.notableStats||{}).slice(0,12).map(([k,v])=>`<div class="metric-row"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('');
    return `<details class="card"><summary style="cursor:pointer"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><div><div class="eyebrow">Đời ${num(l.lifeNumber)} · ${esc(l.causeOfDeath)}</div><h2>${esc(l.realmName)} · ${esc(l.grade)}</h2></div><div style="text-align:right"><strong>${num(l.totalScore)} điểm</strong><div class="small muted">${num(l.ageYears,1)} tuổi</div></div></div></summary><div class="grid cols-2" style="margin-top:12px"><section><h3>6 trục thành tựu</h3>${cat}${l.deltaVsPrevious?`<div class="small muted" style="margin-top:8px">So đời trước: tổng điểm ${delta(l.deltaVsPrevious.totalScore)} · cảnh giới ${delta(l.deltaVsPrevious.realmOrder)}</div>`:''}</section><section><h3>Luân Hồi & di sản</h3><div class="list-item">Mệnh Cơ đời: <b>${num(l.mingJiGain)}</b></div><div class="list-item">Điểm Thiên Phú: <b>${num(l.talentPointGain)}</b></div>${reward?`<div class="list-item">Điểm Luân Hồi: <b>${num(reward.reincarnationPoints)}</b></div><div class="list-item">Tiềm Năng vĩnh viễn: <b>+${num(reward.permanentPotentialGain)}</b></div>`:'<div class="small muted">Đời này chưa có reward V2 lưu trong lịch sử.</div>'}${l.legacyDetail?`<div class="list-item"><b>${esc(l.legacyDetail.title||'Di sản')}</b><div class="small muted">${esc(l.legacyDetail.summary||'')}</div></div>`:(l.legacy?`<div class="list-item"><b>Di sản</b><div class="small muted">${esc(l.legacy)}</div></div>`:'')}</section></div><div class="grid cols-2" style="margin-top:12px"><section><h3>Thống kê đời</h3>${stats}</section><section><h3>Biên niên</h3><div class="list">${chron}</div></section></div></details>`;
  }).join('');
  return page('Vạn Thế · Nhật Ký Các Đời','V101 · đọc trực tiếp LifeSettlement archive canonical. Không tạo lịch sử song song, không mutate save khi xem.',`<div class="grid cols-4">${recordCards.map(([k,v])=>`<div class="card"><div class="eyebrow">${esc(k)}</div><strong>${esc(v)}</strong></div>`).join('')}</div><div class="grid cols-2" style="margin-top:14px"><section class="card highlight"><div class="eyebrow">Đời ${num(cur.lifeNumber)} · ${cur.settled?'đã kết toán':cur.alive?'ước tính nếu kết đời hiện tại':'chờ kết toán'}</div><h2>${esc(cur.realmName||'—')} · ${esc(cur.grade||'D')} · ${num(cur.totalScore)} điểm</h2>${cur.vsPreviousLife?`<div class="small">So Đời ${num(cur.vsPreviousLife.lifeNumber)}: tổng điểm ${delta(cur.vsPreviousLife.totalScoreDelta)} · cảnh giới ${delta(cur.vsPreviousLife.realmOrderDelta)}</div>`:'<div class="small muted">Chưa có đời trước để so sánh.</div>'}<div class="list" style="margin-top:10px">${currentCats}</div></section><section class="card"><h2>Định hướng đời hiện tại</h2><div class="list">${insights}</div><h3 style="margin-top:14px">Kỷ lục từng trục</h3><div class="list">${categoryRecords}</div></section></div><section style="margin-top:14px"><div class="page-title"><div><h2>Hồ sơ ${num(sum.completedLives||0)} đời đã kết toán</h2><p>Mở từng đời để xem score breakdown, reward, thống kê và biên niên.</p></div></div><div class="list">${lives||'<div class="card empty">Chưa có đời nào được kết toán. Đời hiện tại vẫn có projection ở phía trên.</div>'}</div></section>`);
}


function renderGuideV105(){
  const xp=model.playerExperience||{},clarity=xp.clarity||{},journey=xp.progression||{},today=xp.sessionLoop||{},build=xp.buildOverview||{},balance=xp.v108||{},stage=xp.v113?.active?xp.v113:xp.v114?.active?xp.v114:null,buildPath=xp.v115||{},lateEco=xp.v116||{},contentLoop=xp.v117||{},pve=xp.v118||{};
  const sections=[['today','Hôm Nay','Việc đáng làm'],['systems','Hệ Thống','Dùng để làm gì'],['journey','Đường Tu Tiên','Mở gì khi nào'],['build','Build','Mạnh từ đâu']];
  const navHtml=`<nav class="v105-guide-tabs">${sections.map(([id,label,sub])=>`<button class="${guideUi.section===id?'active':''}" data-guide-section="${id}"><b>${label}</b><small>${sub}</small></button>`).join('')}</nav>`;
  let body='';
  if(guideUi.section==='systems'){
    const loop=(clarity.coreLoop||[]).map((x,i)=>`<div class="v102-loop-step"><i>${i+1}</i><strong>${esc(x.name)}</strong><span>${esc(x.text)}</span></div>`).join('');
    const cards=(clarity.systems||[]).map(x=>`<article class="v102-system-card ${x.unlocked?'unlocked':'locked'} ${x.status==='attention'?'attention':''}"><header><div><small>${x.unlocked?(x.status==='attention'?'ĐANG CẦN CHÚ Ý':'ĐÃ MỞ'):`MỞ TẠI MỐC ${num(x.unlock)}`}</small><strong>${esc(x.name)}</strong></div><span>${x.unlocked?'✓':'🔒'}</span></header><p>${esc(x.purpose)}</p><dl><div><dt>Làm gì?</dt><dd>${esc(x.do)}</dd></div><div><dt>Tốn gì?</dt><dd>${esc(x.cost)}</dd></div><div><dt>Nhận gì?</dt><dd>${esc(x.gain)}</dd></div><div><dt>Kiếm ở đâu?</dt><dd>${esc(x.source)}</dd></div></dl>${x.unlocked?`<button class="button ${x.status==='attention'?'gold':'ghost'}" data-tab-jump="${esc(x.route)}">Mở ${esc(x.name)}</button>`:''}</article>`).join('');
    body=`<section class="v102-loop"><header><small>V102 · GAMEPLAY CLARITY</small><h2>Một vòng chơi duy nhất</h2><p>Không cần nhớ 20 hệ. Mọi hệ phải cắm vào vòng Tu luyện → Farm → Nuôi build → Công phá → Luân Hồi.</p></header><div>${loop}</div></section><div class="v102-rule-row">${(clarity.rules||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div><section class="v102-system-grid">${cards}</section>`;
  }else if(guideUi.section==='journey'){
    const steps=(journey.steps||[]).map(x=>`<article class="v103-milestone ${x.status} ${x.provisional?'provisional':''}"><div class="v103-marker">${x.status==='done'?'✓':x.status==='current'?'●':'○'}</div><div><small>MỐC ${num(x.order)} · ${esc(x.status==='current'?'HIỆN TẠI':x.status==='done'?'ĐÃ QUA':'PHÍA TRƯỚC')}</small><strong>${esc(x.name)}</strong><p>${esc(x.goal)}</p><div class="tag-row">${(x.features||[]).map(f=>tag(f,x.provisional?'red':'')).join('')}</div>${x.provisional?'<em>Immortal+ hiện là provisional; chưa coi là Production Closure.</em>':''}</div></article>`).join('');
    const stageObjectives=stage?.objectives?.map(x=>`<div class="list-item"><b>${x.complete?'✓':'○'} ${esc(x.name)}</b><span>${esc(String(x.current??''))} → ${esc(String(x.target??''))}</span></div>`).join('')||'';
    const stageCard=stage?`<section class="card" style="margin-bottom:14px"><div class="eyebrow">V113–V120 · MỐC CẢNH GIỚI ĐANG CHƠI</div><h2>${esc(stage.stage?.name||'Progression')}</h2><p>${esc(stage.nextAction?.detail||'Tu Vi là nền; đại cảnh giới cần gameplay milestone thật.')}</p><div class="list">${stageObjectives}</div>${contentLoop.active?`<div class="small muted">Active: ${esc(contentLoop.activePlay?.title||'—')} · Semi-idle: ${esc(contentLoop.semiIdle?.title||'—')} · Engine PvE: ${esc(pve.engine||'CombatKernel V2')}</div>`:''}</section>`:'';
    body=`<section class="v103-journey-hero"><div><small>V120 · ĐƯỜNG TU TIÊN PRODUCTION</small><h2>${esc(journey.currentRealmName||journey.currentMilestone?.name||'')}</h2><p>${esc(journey.currentMilestone?.goal||'')}</p></div><aside><span>Tới mốc tiếp</span><strong>${journey.nextMilestone?esc(journey.nextMilestone.name):'Sáng Thế viên mãn'}</strong><div class="progress gold"><i style="width:${pct(journey.segmentProgressPct)}%"></i></div><small>${num(journey.segmentProgressPct,1)}%</small></aside></section>${stageCard}<section class="v103-timeline">${steps}</section>`;
  }else if(guideUi.section==='build'){
    const axisLabel={offense:'Sát thương',survival:'Sinh tồn',resource:'Tài nguyên / Chân Nguyên',tempo:'Nhịp chiến đấu',control:'Tài nguyên / Chân Nguyên',mobility:'Nhịp chiến đấu'};
    const sources=(build.sourceContribution||[]).map(x=>`<div class="v105-source-row ${esc(x.impact||'none')}"><span>${esc(x.name)}</span><b>${Number(x.gainPctFromPrevious)>0?`+${num(x.gainPctFromPrevious,1)}%`:'—'}</b><small>Score ${num(x.scoreAfter,1)}</small></div>`).join('');
    const systems=(build.systems||[]).map(x=>`<button class="v105-build-system" data-tab-jump="${esc(x.route)}"><span>${esc(x.name)}</span><strong>${esc(x.value)}</strong><small>${esc(x.detail)}</small></button>`).join('');
    const latePriorities=(buildPath.priorities||[]).map(x=>`<button class="v105-build-system" data-tab-jump="${esc(x.route)}"><span>${esc(x.name)}</span><small>${esc(x.reason)}</small></button>`).join('');
    body=`<section class="v105-build-hero"><div><small>V105 · BUILD OVERVIEW</small><h2>${esc(build.identity||'Build hiện tại')}</h2><strong>${num(build.score,1)}</strong><span>Chiến Lực canonical</span></div><div><p>Nút thắt <b>${esc(axisLabel[build.bottleneckAxis]||build.bottleneckAxis||'—')}</b></p><p>Sở trường <b>${esc(axisLabel[build.strongestAxis]||build.strongestAxis||'—')}</b></p><small>${esc(build.truth||'')}</small></div></section><div class="grid cols-2 v105-build-layout"><section class="card"><h2>Sức mạnh đến từ đâu?</h2><p class="small muted">Mỗi dòng là mức tăng khi stage đó được áp vào CombatEntity; không phải % cộng tay trên UI.</p><div class="v105-source-list">${sources}</div></section><section class="card"><h2>Nên nâng gì?</h2><div class="list">${(build.recommendations||[]).map(x=>`<div class="list-item">${esc(x)}</div>`).join('')}</div><div class="v105-stat-strip"><span>Công <b>${num(build.stats?.attack,1)}</b></span><span>HP <b>${num(build.stats?.maxHp,1)}</b></span><span>Phòng <b>${num(build.stats?.defense,1)}</b></span><span>CN <b>${num(build.stats?.maxSpirit,1)}</b></span></div></section></div><section class="v105-build-systems">${systems}</section>${latePriorities?`<section class="card" style="margin-top:14px"><div class="eyebrow">V115 · LONG-TERM BUILD</div><h2>Ưu tiên theo cảnh giới hiện tại</h2><section class="v105-build-systems">${latePriorities}</section></section>`:''}<section class="card" style="margin-top:14px"><div class="eyebrow">V108 · GLOBAL BUILD BALANCE</div><h2>Build có trade-off thật, không có hệ số PvP riêng</h2><div class="tag-row">${(balance.daoRoles||[]).map(x=>tag(`${x.id} · ${x.role}`)).join('')}</div><div class="list" style="margin-top:10px">${(balance.conclusions||[]).map(x=>`<div class="list-item">${esc(x)}</div>`).join('')}</div><div class="small muted">Combat: ${esc(balance.engine||'CombatKernel V2')} · Tiềm Năng: ${esc(balance.policy?.potentialAxes?.defense||'+3 Phòng Ngự/điểm')} · ${(balance.sets||[]).length||5} Set Ngũ Hành live.</div></section>`;
  }else{
    const tasks=(today.tasks||[]).map((x,i)=>`<article class="v104-task ${esc(x.priority)}"><i>${i+1}</i><div><small>${x.optional?'TÙY CHỌN':'ƯU TIÊN'}</small><strong>${esc(x.title)}</strong><p>${esc(x.reason)}</p><span>Nhận: ${esc(x.gain)}</span></div><button class="button ${x.priority==='primary'?'gold':'ghost'}" data-tab-jump="${esc(x.route)}">Đi ngay</button></article>`).join('');
    body=`<section class="v104-today-hero"><div><small>V104 · SMART SESSION LOOP</small><h2>${esc(today.headline||'Hôm nay nên làm gì?')}</h2><p>${esc(today.principle||'')}</p></div><button class="button ghost" data-guide-section="systems">Tại sao phải làm? →</button></section><section class="v104-task-list">${tasks||'<div class="card empty">Không có việc bắt buộc. Có thể treo Tu Luyện và thoát.</div>'}</section><section class="v104-loop-strip">${(today.loop||[]).map((x,i)=>`<span><i>${i+1}</i>${esc(x)}</span>`).join('')}</section>`;
  }
  return page('Tu Tiên Chỉ Nam','V102–V126 · Từ hôm nay cần làm gì tới toàn bộ đường Phàm → Sáng Thế, dùng đúng mechanic đang chạy.',`${navHtml}<div class="v105-guide-body">${body}</div>`);
}

let renderedContentTabV129='';
let renderedContentHtmlV129='';
function render(){
  if(!model)return;
  if(dongfuMountRaf&&typeof cancelAnimationFrame==='function'){cancelAnimationFrame(dongfuMountRaf);dongfuMountRaf=0;}
  if(!tabUnlocked(activeTab))activeTab='cultivation';
  document.body.dataset.gameScreen=activeTab;document.body.dataset.uxShell='p0';content.dataset.screen=activeTab;
  renderNav();renderHeader();
  const fn={guide:renderGuideV105,overview:renderOverview,character:renderCharacter,skills:renderSkills,inventory:renderInventory,dongfu:renderDongFuHub,dungeons:renderDungeonHub,pvp:renderPvpV91,cultivation:renderCultivation,path:renderDaoPathV140,roots:renderSpiritualRoots,collection:renderCollection,locations:renderLocationsV95,journal:renderJournalV95,power:renderPowerV95,soul:renderSoulV96,faction:renderFactionV97,social:renderSocialV97,dao:renderDaoV98,myriadLives:renderMyriadLivesV101,economy:renderEconomyV111,hunt:renderHuntCombatLazyV129,build:renderBuild,combat:renderCombat,reincarnation:renderReincarnation,automation:renderAutomation,devlab:renderDevLabV12317,telemetry:renderTelemetry,alpha:renderAlpha}[activeTab]||renderCharacter;
  if(activeTab!=='hunt')stopHuntCombatV129();
  if(activeTab!=='combat')pauseReplay();
  if(activeTab!=='combat')stopAmbientBattleLoop();
  const nextHtml=fn();
  const needsDomReplace=renderedContentTabV129!==activeTab||renderedContentHtmlV129!==nextHtml;
  if(needsDomReplace){
    dongFuPixiModule?.destroyDongFuPixiScene?.();
    content.innerHTML=nextHtml;renderedContentTabV129=activeTab;renderedContentHtmlV129=nextHtml;bindDynamic();
  }
  if(activeTab==='dongfu'&&dongfuUi.section==='home'&&needsDomReplace)dongfuMountRaf=requestAnimationFrame(()=>{dongfuMountRaf=0;v99MountDongFuPixiScene();});
  return needsDomReplace;
}
function page(title,sub,body,right=''){return `<div class="page-title"><div><h1>${esc(title)}</h1><p>${esc(sub)}</p></div>${right}</div>${body}`;}
function skillGlyph(skill){const tags=(skill?.tags||[]).join(' ').toLowerCase();if(tags.includes('kiếm')||tags.includes('sword'))return'KI';if(tags.includes('hỏa')||tags.includes('fire'))return'HỎ';if(tags.includes('lôi')||tags.includes('lightning'))return'LÔ';if(tags.includes('thủy')||tags.includes('water'))return'TH';if(tags.includes('băng')||tags.includes('ice'))return'BĂ';if(tags.includes('buff'))return'TĂ';if(tags.includes('debuff'))return'GI';return'CP';}

function renderOverview(){
  const o=model.overview,h=model.endlessHunt,c=model.character,cult=o.cultivation||{};
  const stones=model.inventory.find(x=>x.id==='resource.spirit_stone')?.quantity??0;
  const tuVi=Number(cult.tuVi??live?.tuVi??0),required=Math.max(0,Number(cult.requiredTuVi??live?.requiredTuVi??0));
  const progressPct=required>0?Math.min(100,tuVi/required*100):100;
  const gainPerCommit=Number(cult.finalTuViPer15s??live?.estimatedCultivationPerCommit??0),commitSeconds=Number(live?.commitSeconds||15);
  const eta=Number(cult.etaRealSeconds||0)>0?durationText(cult.etaRealSeconds):cult.ready?'Đã viên mãn':'—';
  const monster=h.monster,birth=c.birth||{},talentNames=(birth.talents||[]).map(x=>x.name).join(', ')||'Chưa có thiên phú nổi bật';
  const clock=`<div class="card realtime-card"><div><div class="eyebrow">TU LUYỆN V140 · TỰ TU LUÔN CHẠY</div><h2>${esc(o.life.realm)} · ${num(progressPct,1)}%</h2><div class="small muted">Mỗi ${num(commitSeconds,0)} giây nhận <strong data-live-rate>+${num(gainPerCommit,0)}</strong> Tu Vi. Săn Yêu chạy song song, không giảm Tự Tu.</div></div><div class="tag-row"><button class="button primary" data-tab-jump="cultivation">Tu Luyện</button><button class="button" data-tab-jump="hunt">Săn Yêu</button><button class="button ${live?.autoCombat?'gold':''}" data-hunt-auto-toggle="${live?.autoCombat?'0':'1'}">${live?.autoCombat?'Tắt Tự Săn':'Bật Tự Săn'}</button><button class="button ghost" data-live-pause>${live?.paused?'Tiếp tục':'Tạm dừng'}</button></div></div>`;
  const transition=cult.ready?(cult.transition==='tribulation'?'Thiên Kiếp đang chờ':cult.transition==='ascend'?'Có thể Thăng Cảnh':'Đã viên mãn'):'Đang tích lũy';
  const top=`<div class="grid cols-4"><div class="card"><div class="eyebrow">${esc(o.life.realm)}</div><div class="big-number"><span data-live-energy>${num(tuVi,0)}</span> / ${num(required,0)}</div>${progress(progressPct,'gold')}${metric(`Tu Vi / ${num(commitSeconds,0)} giây`,`+${num(gainPerCommit,0)}`)}${metric('Ước tính viên mãn',eta)}</div><div class="card"><div class="eyebrow">Sức mạnh</div><div class="big-number">${esc(h.playerPower)}</div>${metric('Chiến lực core',num(o.build.score))}${metric('Tầng cao nhất',h.highestClearedFloor)}${metric('Thương Thế',`${num(o.injury??cult.injury??0)}%`)}</div>${o.life.realmOrder>=1?`<div class="card grade-${esc(monster.gradeId)}"><div class="eyebrow">Cửa ải tầng ${h.selectedFloor}</div><div class="big-number" style="font-size:20px">${esc(monster.name)}</div>${metric('Boss',`${monster.grade} · Lv.${monster.level}`)}${metric('Sức mạnh',monster.power)}<button class="button gold" data-endless-fight>Vượt Boss</button></div>`:`<div class="card"><div class="eyebrow">Săn Yêu · chưa mở</div><div class="big-number" style="font-size:20px">Bước vào Luyện Khí</div>${metric('Sau khi mở','Boss → Săn Ảo → loot')}</div>`}<div class="card"><div class="eyebrow">Tiến độ</div><div class="big-number" style="font-size:19px">${esc(transition)}</div>${metric('Linh căn',c.root)}${metric('Thiên phú',talentNames)}${metric('Thần thông',birth.divineAbility?.name||'Không')}</div></div>`;
  const smartTasks=model.playerExperience?.sessionLoop?.tasks||[];
  const goals=`<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><div><div class="eyebrow">THEO SAVE HIỆN TẠI</div><h2>Hôm nay nên làm gì?</h2></div><button class="button ghost" data-tab-jump="guide">Mở Chỉ Nam</button></div><div class="action-list">${smartTasks.slice(0,3).map((x,i)=>`<div class="action"><div><div class="label">${i+1}. ${esc(x.title)}</div><div class="desc">${esc(x.reason)}</div></div><button class="button ${x.priority==='primary'?'primary':''}" data-tab-jump="${esc(x.route)}">Đi</button></div>`).join('')||'<div class="empty">Không có việc bắt buộc; Tự Tu vẫn tiếp tục.</div>'}</div></div>`;
  const recent=`<div class="card"><h2>Nhật ký gần đây</h2>${(live?.recent||[]).map(x=>`<div class="list-item small">${esc(x)}</div>`).join('')||'<div class="empty">Game vừa bắt đầu.</div>'}<div class="footer-note">Linh Thạch: ${num(stones)}. Save cục bộ tự động sau mỗi hành động.</div></div>`;
  return page('Tổng Quan','Cảnh giới, Tu Vi, Thương Thế và hoạt động đang chạy.',`${clock}<div style="margin-top:14px">${top}</div><div class="grid cols-2" style="margin-top:14px">${goals}${recent}</div>`);
}
function actionRow(a){return `<div class="action"><div><div class="label">${esc(a.label)}</div><div class="desc">${esc(a.description)}</div></div><button class="button ${a.emphasis==='primary'?'primary':a.emphasis==='danger'?'danger':''}" data-flow-index="${a.index}">Thực hiện</button></div>`;}
function statName(k){return {maxHp:'HP',maxSpirit:'Linh lực chiến đấu',attack:'Công kích',defense:'Phòng thủ',mobility:'Thân pháp',accuracy:'Chính xác',critChancePct:'Bạo kích',critPowerPerLayer:'Bạo thương',controlPower:'Khống chế',resolve:'Định lực',actionSpeed:'Tốc độ hành động'}[k]||k;}
function renderTechniqueManualPanel(c,o){
  const tm=c.techniqueManuals;if(!tm)return '';const eq=tm.equipped||{};const byId=new Map((tm.known||[]).map(x=>[x.id,x]));
  const slots=[['inner','Tâm Pháp'],['art','Võ Học / Thần Thông'],['movement','Thân Pháp'],['secret','Bí Thuật']];
  const equipped=slots.map(([id,label])=>{const x=byId.get(eq[id]);return `<div class="talent-node"><strong>${esc(label)}</strong><div>${x?esc(x.name):'<span class="muted">Chưa trang bị</span>'}</div>${x?`<div class="small muted">${esc(x.gradeLabel)} · ${esc(x.stage)} · ${num(x.mastery,1)}%</div>`:''}</div>`;}).join('');
  const known=(tm.known||[]).map(x=>`<div class="list-item"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><strong>${esc(x.name)}</strong> ${tag(x.gradeLabel,x.grade==='breaker'||x.grade==='extreme'?'gold':'')}<div class="small muted">${esc(x.slotLabel)} · ${esc(x.stage)} · Thành thạo ${num(x.mastery,1)}%</div><div class="small">${esc(x.description||'')}</div>${(x.grantedSkillIds||[]).length?`<div class="small ${x.skillUnlocked?'good-text':'muted'}">${x.skillUnlocked?'✓ Chiêu chủ động đã lĩnh ngộ':`Chiêu chủ động mở tại ${num(x.skillUnlockMastery||20,0)}% · Nhập Môn`}</div>`:''}<div class="tag-row" style="margin-top:5px">${(x.tags||[]).slice(0,5).map(v=>tag(v)).join('')}</div></div><div class="tag-row" style="justify-content:flex-end;min-width:150px"><button class="button ${x.equipped?'ghost':'primary'}" data-tech-equip="${esc(x.id)}" ${x.equipped||o.life.realmOrder<(x.requiredRealmOrder||0)?'disabled':''}>${x.equipped?'Đang dùng':'Trang bị'}</button><button class="button ghost" data-tech-study="${esc(x.id)}" data-tech-batches="1" ${tm.fragments<1?'disabled':''}>Tham ngộ +1</button><button class="button ghost" data-tech-study="${esc(x.id)}" data-tech-batches="5" ${tm.fragments<5?'disabled':''}>+5</button></div></div></div>`).join('');
  return `<div class="card" style="margin-top:12px"><h2>Bí Thuật & Võ Học · Bí Thuật Tàn Trang ${num(tm.fragments||0)}</h2><div class="grid cols-4">${equipped}</div><div class="footer-note">Tâm Pháp quyết định nhịp tu luyện; Võ Học cấp chiêu chủ động; Thân Pháp đổi tempo; Bí Thuật mạnh nhưng thường có giá phải trả. Cộng hưởng phụ thuộc Đạo Tính, Chủ/Phụ Bản Đạo, Hành Ấn và điều kiện thật của từng Bí Thuật/Võ Học.</div><div class="list" style="margin-top:10px">${known||'<div class="empty">Chưa lĩnh ngộ Bí Thuật/Võ Học.</div>'}</div></div>`;
}
function renderDaoPathV140(){
  const v125=v125SpecializationPanel();
  const sp=model.specialization||{},realmOrder=Number(model.overview?.life?.realmOrder||0),committed=Boolean(sp.daoNatureId&&sp.mainDaoId);
  const sub=!committed?(realmOrder<10?'Định Đạo mở tại Trúc Cơ. Trước đó chỉ xem thông tin để chuẩn bị lựa chọn.':'Chọn 1 Đạo Tính và 1 Chủ Đạo cho đời hiện tại; chỉ Luân Hồi mới được chọn lại.'):`${sp.daoNatureName||'Đã Định Đạo'} · ${sp.mainDaoName||''} Chủ${sp.secondaryDaoName?` · ${sp.secondaryDaoName} Phụ`:''}`;
  return page('Định Đạo',sub,`${v125.html}${v125.sheets}`);
}

function renderBuild(){
  const b=model.build; const maxAxis=Math.max(1,...Object.values(b.axes));
  const bars=Object.entries(b.axes).map(([k,v])=>`<div class="bar-line"><span>${esc({offense:'Công',survival:'Thủ',control:'Khống chế',mobility:'Cơ động'}[k]||k)}</span><div class="progress gold"><i style="width:${v/maxAxis*100}%"></i></div><b>${num(v)}</b></div>`).join('');
  const presets=b.tacticalPresets.map(p=>`<article class="preset-card ${p.selected?'selected':''}"><div style="display:flex;justify-content:space-between;gap:8px;align-items:start"><div><div class="eyebrow">${esc(p.style)}</div><h3>${esc(p.name)}</h3></div>${p.selected?tag('Đang dùng','gold'):tag('Có thể áp dụng')}</div><div class="small muted">Mạnh ở: ${esc(p.strengths.join(', '))}</div><div class="small muted">Điểm đổi: ${esc(p.tradeoff)}</div><div class="tag-row" style="margin-top:8px">${p.skillNames.map(x=>tag(x)).join('')}</div><button class="button ${p.selected?'ghost':'primary'}" style="margin-top:10px" data-preset="${esc(p.id)}" ${p.selected?'disabled':''}>${p.selected?'Đã áp dụng':'Dùng preset này'}</button></article>`).join('');
  const skills=b.skills.map(s=>`<article class="build-skill-card"><div style="display:flex;justify-content:space-between;gap:8px;align-items:start"><div><h3>${esc(s.name)}</h3><div class="roles">${esc((s.roles||[]).map(localizeUiTerm).join(' · ')||'Không nhãn')}</div></div><div class="tag-row">${s.setupMarks.length?tag('Chuẩn bị'):''}${s.finisherMarks.length?tag('Kết liễu','gold'):''}</div></div></article>`).join('');
  const v88Cats=model.collectionEconomy?.categories||[],v88Artifacts=(v88Cats.find(x=>x.category==='artifact')?.items||[]).filter(x=>x.active),v88Relic=(v88Cats.find(x=>x.category==='relic')?.items||[]).find(x=>x.active);const equipList=[...b.equipment.map(x=>`<div class="build-loadout-item"><strong>${esc(x.name)}</strong><span>${esc(x.slot)} · ${esc(x.tier)} · ${esc(x.quality)}</span></div>`),...v88Artifacts.map((x,i)=>`<div class="build-loadout-item artifact"><strong>Ô ${i+1} · ${esc(x.name)}</strong><span>Pháp Bảo · Luyện Hóa ${num(x.progress?.level||1)} · Bảo Giai ${esc(x.artifact?.grade||'I')} · ${esc(x.artifact?.skill?.name||'Pháp Kỹ')}</span></div>`),...(v88Relic?[`<div class="build-loadout-item artifact relic"><strong>Chí Bảo · ${esc(v88Relic.name)}</strong><span>${esc(v88Relic.relic?.ruleName||'Luật Chí Bảo')} · không chiếm ô Pháp Bảo</span></div>`]:[])].join('');
  const hero=`<div class="card build-hero"><div><div class="eyebrow">Định hình chiến đấu</div><div class="big-number">${num(b.score)}</div><div class="small muted">${esc(b.identity)}</div></div><div class="build-hero-side">${metric('Sở trường',b.strongestAxis)}${metric('Nút thắt',b.bottleneckAxis)}</div></div>`;
  return page('Phối Đồ','Tất cả mảnh build quan trọng được gom vào cùng một nơi để người chơi hiểu rõ mình đang mạnh ở đâu.',`${hero}<div class="grid cols-3" style="margin-top:14px"><div class="card"><h2>Trục sức mạnh</h2><div class="bars" style="margin-top:10px">${bars}</div></div><div class="card"><h2>Kỹ năng đang mang</h2><div class="build-skill-grid">${skills||'<div class="empty">Chưa có kỹ năng.</div>'}</div></div><div class="card"><h2>Trang bị · Pháp Bảo · Chí Bảo</h2><div class="build-loadout-grid">${equipList||'<div class="muted">Chưa có trang bị.</div>'}</div></div></div><div class="card" style="margin-top:14px"><h2>Phương án chiến thuật</h2><div class="preset-grid">${presets}</div></div>`);
}
function renderBossIntel(intel){if(!intel)return'<div class="empty">Chọn một Thủ Lĩnh để xem phân tích.</div>';return `<div class="card highlight boss-intel-card"><div class="eyebrow">Phân tích thủ lĩnh</div><h2 style="font-size:22px">${esc(intel.guardianName)}</h2><div class="boss-intel-overview">${metric('Mức sẵn sàng',`${intel.readiness.bandLabel} · ${num(intel.readiness.ratio,2)}×`)}${metric('Độ khớp bộ kỹ năng',`${num(intel.currentLoadout.coveragePct)}%`)}${metric('Phương án đề xuất',`${intel.recommendedPreset.name} · ${num(intel.recommendedPreset.coveragePct)}%`)}</div>${intel.mechanic?`<div class="boss-intel-tip"><p class="small">${esc(intel.mechanic.description)}</p><div class="small muted">Khắc chế trọng tâm: ${esc(intel.mechanic.counterHint)}</div></div>`:''}<div class="boss-phase-grid">${intel.phases.map(p=>`<div class="phase ${p.index>=3?'danger':''}"><h4>P${p.index} · ${esc(p.name)}</h4><p>${esc(p.description||'')}</p><p>Độ phù hợp: <span class="coverage">${num(p.currentCoveragePct)}%</span></p>${p.missing.length?`<p>Thiếu: ${esc(p.missing.join(', '))}</p>`:''}${p.counterWindow?`<p><b>Cửa phản:</b> ${esc(p.counterWindow.name)} · ${esc(p.counterWindow.requirement)}</p>`:''}</div>`).join('')}</div><div class="tag-row" style="margin-top:12px"><button class="button gold" data-challenge="${esc(intel.dungeonId)}" data-floor="${intel.floor}">Công phá tầng ${intel.floor}</button>${intel.skills.filter(x=>!x.active).slice(0,3).map(x=>tag(`Khuyến nghị: ${x.name}`)).join('')}${intel.artifacts.filter(x=>!x.active).slice(0,2).map(x=>tag(`Pháp bảo: ${x.name}`,'gold')).join('')}</div></div>`;}
function renderCombatReview(review){if(!review)return'<div class="card"><h2>Chiến báo</h2><div class="empty">Chưa có trận thủ lĩnh nào trong phiên hiện tại.</div></div>';return `<div class="card ${review.won?'good':'bad'} battle-report-card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><div><div class="eyebrow">Chiến báo</div><h2>${review.won?'THẮNG':'THẤT BẠI'} · ${esc(review.guardianName)}</h2></div>${review.firstClear?tag('Khai phá đầu tiên','gold'):''}</div><div class="boss-intel-overview">${metric('Thời gian',`${num(review.battleDuration,1)}s`)}${metric('Chiêu nổi bật',review.signatureSkill||'—')}</div><div class="tag-row">${review.phaseTransitions.map(x=>tag(`${x.name} @ ${num(x.time,1)}s`)).join('')}${review.counters.map(x=>tag(`✓ ${x.name}`,'gold')).join('')}${(review.counterFailures||[]).map(x=>tag(`✕ ${x.name}`,'red')).join('')}</div><div class="battle-review-stage">${renderBattleTheater(review,false)}</div><h3 style="margin-top:14px">Phát lại nhật ký chiến đấu</h3><div class="timeline-controls"><button class="button ghost" data-replay="start">Phát lại</button><button class="button ghost" data-speed="1">x1</button><button class="button ghost" data-speed="2">x2</button><button class="button ghost" data-speed="5">x5</button><button class="button ghost" data-replay="pause">Tạm dừng</button><button class="button ghost" data-replay="all">Hiện tất cả</button></div><div id="combatLog" class="combat-log"></div><div class="grid cols-2" style="margin-top:12px"><div><h3>Phần thưởng</h3><div class="battle-report-list">${review.rewards.map(r=>`<div class="small">+${num(r.amount,2)} ${esc(r.name)}</div>`).join('')||'<div class="muted small">Không có.</div>'}</div></div><div><h3>Bài học rút ra</h3><div class="battle-report-list">${review.lessons.map(x=>`<div class="small">• ${esc(x)}</div>`).join('')}</div></div></div></div>`;}
function logLine(x){return `<div class="combat-line ${esc(x.type)}"><span class="time">${num(x.time,1)}s</span>${esc(x.message)}</div>`;}

function battleActors(review){
  const start=review?.timeline?.find(x=>x.type==='battleStart')?.message||'';
  const match=start.match(/^(.*?) giao chiến với (.*?)\.$/);
  return {player:(match?.[1]||'Tu sĩ').trim(),enemy:(match?.[2]||review?.guardianName||'Yêu thú').trim()};
}
function battleSideByName(name,actors){
  const value=String(name||'').trim();
  if(!value)return null;
  if(value===actors.enemy||value.includes(actors.enemy)||actors.enemy.includes(value))return 'enemy';
  if(value===actors.player||value.includes(actors.player)||actors.player.includes(value))return 'player';
  return null;
}
function parseBattleNumber(text){const match=String(text||'').match(/(\d+(?:\.\d+)?)/);return match?Number(match[1]):0;}
function computeBattleTotals(review,actors){
  const totals={player:0,enemy:0};
  for(const evt of review?.timeline||[]){
    if(evt.type==='damage'){
      const match=evt.message.match(/^.*? gây (\d+(?:\.\d+)?) .* lên (.*?)\.$/);
      const side=battleSideByName(match?.[2],actors);
      if(side)totals[side]+=Number(match[1]||0);
    }
  }
  if(totals.player<=0)totals.player=100;
  if(totals.enemy<=0)totals.enemy=100;
  return totals;
}
function battleSkillDock(){
  return (model?.build?.skills||[]).slice(0,6).map(skill=>`<div class="battle-skill-chip" data-battle-skill="${esc(skill.name.toLowerCase())}"><i>${esc(skillGlyph(skill))}</i><span>${esc(skill.name)}</span></div>`).join('');
}
function renderBattleTheater(review,ambient=false,ambientEnemy='Yêu thú bí cảnh'){
  const actors=review?battleActors(review):{player:`Đời ${model?.overview?.life?.lifeNumber||1} · ${model?.overview?.life?.realm||'Phàm Nhân'}`,enemy:ambientEnemy};
  return `<div class="battle-theater ${ambient?'ambient':''}" id="battleStage">
    <div class="battle-sky"></div>
    <div class="battle-rings"></div>
    <div class="battle-bars">
      <div class="battle-bar-wrap player"><div class="battle-bar-label">${esc(actors.player)}</div><div class="battle-bar"><i id="battleBarPlayer" style="width:100%"></i></div></div>
      <div class="battle-center-mark">VS</div>
      <div class="battle-bar-wrap enemy"><div class="battle-bar-label">${esc(actors.enemy)}</div><div class="battle-bar"><i id="battleBarEnemy" style="width:100%"></i></div></div>
    </div>
    <div class="battle-field">
      <div class="battle-figure player state-idle" data-battle-side="player"><div class="battle-aura"></div><div class="battle-shadow-body"></div><div class="battle-shadow-weapon"></div><div class="battle-cast-ring"></div><div class="battle-hit-spark"></div></div>
      <div class="battle-slash" id="battleSlashFx"></div>
      <div class="battle-impact" id="battleImpactFx"></div>
      <div class="battle-figure enemy state-idle" data-battle-side="enemy"><div class="battle-aura"></div><div class="battle-shadow-body"></div><div class="battle-shadow-weapon"></div><div class="battle-cast-ring"></div><div class="battle-hit-spark"></div></div>
      <div class="battle-float player" data-battle-float="player"></div><div class="battle-float enemy" data-battle-float="enemy"></div>
      <div class="battle-banner"><div class="eyebrow">${ambient?'Mô phỏng đối chiến':'Hoạt ảnh chiến đấu'}</div><strong id="battleBannerText">${ambient?'Tự Săn đang đối mặt yêu thú của bí cảnh này.':'Bấm “Phát lại” để xem chiến báo diễn hoạt.'}</strong><span id="battleSkillText">${ambient?'Silhouette + kiếm khí + hiệu ứng va chạm đang hoạt động.':'Timeline thật từ CombatEngine sẽ điều khiển hoạt ảnh.'}</span></div>
    </div>
    <div class="battle-dock">${battleSkillDock()||'<div class="small muted">Chưa có bộ kỹ năng để hiển thị.</div>'}</div>
  </div>`;
}
function resetBattleStage(review){
  const stage=$('#battleStage'); if(!stage)return;
  const actors=review?battleActors(review):{player:'Tu sĩ',enemy:'Yêu thú'};
  battleViz.actors=actors; battleViz.totals=review?computeBattleTotals(review,actors):{player:100,enemy:100}; battleViz.hp={player:100,enemy:100}; battleViz.reviewId=`${review?.guardianName||'ambient'}:${review?.battleDuration||0}`;
  const p=$('#battleBarPlayer'),e=$('#battleBarEnemy'); if(p)p.style.width='100%'; if(e)e.style.width='100%';
  updateBattleBanner(review?'Bấm “Phát lại” để xem chiến báo diễn hoạt.':'Tự Săn đang đối mặt yêu thú của bí cảnh này.','');
  document.querySelectorAll('[data-battle-side]').forEach(el=>el.classList.remove('state-attack','state-hit','state-cast','state-heal','state-dodge','state-break','state-dead'));
  document.querySelectorAll('[data-battle-float]').forEach(el=>{el.textContent='';el.classList.remove('show','damage','heal','dodge','break');});
  document.querySelectorAll('[data-battle-skill]').forEach(el=>el.classList.remove('active'));
}
function updateBattleBanner(text,skill=''){const banner=$('#battleBannerText');const sub=$('#battleSkillText');if(banner)banner.textContent=text||'';if(sub)sub.textContent=skill||' ';}
function highlightBattleSkill(name=''){const value=String(name||'').toLowerCase();document.querySelectorAll('[data-battle-skill]').forEach(el=>{el.classList.toggle('active',!!value&&el.dataset.battleSkill.includes(value));});}
function setBattleBar(side,value){const el=side==='player'?$('#battleBarPlayer'):$('#battleBarEnemy');if(el)el.style.width=`${Math.max(0,Math.min(100,value))}%`; }
function triggerBattleFigure(side,state){const el=document.querySelector(`[data-battle-side="${side}"]`);if(!el)return;const states=['state-attack','state-hit','state-cast','state-heal','state-dodge','state-break'];clearTimeout(el._battleStateTimerV129);el.classList.remove(...states);void el.offsetWidth;if(state==='dead'){el.classList.add('state-dead');return;}el.classList.add(`state-${state}`);el._battleStateTimerV129=setTimeout(()=>{el._battleStateTimerV129=0;el.classList.remove(`state-${state}`);},420);}
function triggerBattleFx(kind,side){const slash=$('#battleSlashFx'),impact=$('#battleImpactFx');if(kind==='slash'&&slash){clearTimeout(slash._battleFxTimerV129);slash.className=`battle-slash show ${side}`;slash._battleFxTimerV129=setTimeout(()=>{slash._battleFxTimerV129=0;slash.className='battle-slash';},360);}if(kind==='impact'&&impact){clearTimeout(impact._battleFxTimerV129);impact.className=`battle-impact show ${side}`;impact._battleFxTimerV129=setTimeout(()=>{impact._battleFxTimerV129=0;impact.className='battle-impact';},360);}}
function showBattleFloat(side,text,kind='damage'){const el=document.querySelector(`[data-battle-float="${side}"]`);if(!el)return;clearTimeout(el._battleFloatTimerV129);el.textContent=text;el.className=`battle-float ${side} ${kind} show`;el._battleFloatTimerV129=setTimeout(()=>{el._battleFloatTimerV129=0;el.className=`battle-float ${side}`;},520);}
function applyBattleReplayEvent(evt,{animate=true,render=true}={}){
  const paintBanner=(text,skill='')=>{if(render)updateBattleBanner(text,skill);};
  const paintBar=(side,value)=>{if(render)setBattleBar(side,value);};
  const actors=battleViz.actors||battleActors(model?.combatReview); if(!actors)return;
  let skill=''; let label=evt.message;
  if(evt.type==='castStart'){ const match=evt.message.match(/^(.*?) vận chiêu (.*?)\.$/); const side=battleSideByName(match?.[1],actors)||'player'; skill=match?.[2]||''; if(animate)triggerBattleFigure(side,'cast'); if(render)highlightBattleSkill(skill); paintBanner(evt.message,skill?`Đang thi triển: ${skill}`:''); if(animate)showBattleFloat(side,'THI TRIỂN','heal'); return; }
  if(evt.type==='damage'){ const match=evt.message.match(/^(.*?) gây (\d+(?:\.\d+)?) .* lên (.*?)\.$/); const amount=Number(match?.[2]||0); const side=battleSideByName(match?.[1],actors)||'player'; const target=battleSideByName(match?.[3],actors)||'enemy'; const total=Math.max(1,battleViz.totals?.[target]||100); battleViz.hp[target]=Math.max(0,battleViz.hp[target]-amount/total*100); paintBar(target,battleViz.hp[target]); if(animate){triggerBattleFigure(side,'attack'); triggerBattleFigure(target,'hit'); triggerBattleFx('slash',side); triggerBattleFx('impact',target); showBattleFloat(target,`-${num(amount,0)}`,'damage');} paintBanner(evt.message,skill||'Sát thương trực tiếp.'); return; }
  if(evt.type==='heal'){ const match=evt.message.match(/^(.*?) .*?(\d+(?:\.\d+)?) /); const amount=Number(match?.[2]||parseBattleNumber(evt.message)); const target=battleSideByName(match?.[1],actors)||'player'; const total=Math.max(1,battleViz.totals?.[target]||100); battleViz.hp[target]=Math.min(100,battleViz.hp[target]+amount/total*35); paintBar(target,battleViz.hp[target]); if(animate){triggerBattleFigure(target,'heal'); showBattleFloat(target,`+${num(amount,0)}`,'heal');} paintBanner(evt.message,'Hồi phục / hấp thu.'); return; }
  if(evt.type==='dodge'){ const match=evt.message.match(/^(.*?) [Nn]é/); const target=battleSideByName(match?.[1],actors)||'enemy'; if(animate){triggerBattleFigure(target,'dodge'); showBattleFloat(target,'NÉ','dodge');} paintBanner(evt.message,'Đòn đánh bị né tránh.'); return; }
  if(evt.type==='shieldBreak'){ const match=evt.message.match(/^Hộ thuẫn của (.*?) vỡ/); const target=battleSideByName(match?.[1],actors)||'enemy'; if(animate){triggerBattleFigure(target,'break'); showBattleFloat(target,'PHÁ THUẪN','break'); triggerBattleFx('impact',target);} paintBanner(evt.message,'Hộ thuẫn bị phá vỡ.'); return; }
  if(evt.type==='phase'){ const match=evt.message.match(/^(.*?) bước vào (.*?):/); const target=battleSideByName(match?.[1],actors)||'enemy'; if(animate)triggerBattleFigure(target,'cast'); paintBanner(evt.message,match?.[2]?`Chuyển phase: ${match[2]}`:'Boss đổi phase.'); return; }
  if(evt.type==='status'||evt.type==='counterWindow'){ paintBanner(evt.message,evt.type==='counterWindow'?'Tương tác cơ chế / cửa phản.':'Hiệu ứng trạng thái.'); return; }
  if(evt.type==='death'){ const match=evt.message.match(/^(.*?) bị (.*?) đánh bại/); const target=battleSideByName(match?.[1],actors)||'enemy'; battleViz.hp[target]=0; paintBar(target,0); if(animate)triggerBattleFigure(target,'dead'); else if(render)document.querySelector(`[data-battle-side="${target}"]`)?.classList.add('state-dead'); paintBanner(evt.message,'Kết liễu.'); return; }
  if(evt.type==='battleStart'||evt.type==='battleEnd'){ paintBanner(evt.message,evt.type==='battleEnd'?'Kết thúc trận đấu.':'Chiến đấu bắt đầu.'); return; }
  paintBanner(label,'');
}
function startAmbientBattleLoop(){ const stage=$('#battleStage.ambient'); if(!stage)return; resetBattleStage(null); clearInterval(battleViz.ambientTimer); const seq=[['player','cast'],['enemy','hit'],['enemy','attack'],['player','dodge']]; let index=0; battleViz.ambientTimer=setInterval(()=>{ if(document.hidden)return;if(!stage.isConnected){stopAmbientBattleLoop();return;}const [side,state]=seq[index++%seq.length]; triggerBattleFigure(side,state); if(state==='attack'||state==='cast') triggerBattleFx('slash',side); if(state==='hit') triggerBattleFx('impact',side); },1100); }
function stopAmbientBattleLoop(){ if(battleViz.ambientTimer)clearInterval(battleViz.ambientTimer); battleViz.ambientTimer=null; }

const V2314_ROOT_META={metal:{label:'Kim',glyph:'◇',tone:'metal'},wood:{label:'Mộc',glyph:'♧',tone:'wood'},water:{label:'Thủy',glyph:'◉',tone:'water'},fire:{label:'Hỏa',glyph:'△',tone:'fire'},earth:{label:'Thổ',glyph:'⬟',tone:'earth'}};
function v145RootBig(value){try{return BigInt(String(value??0)).toLocaleString('vi-VN')}catch{return num(value)}}
function v145RootEnough(have,cost){try{return BigInt(String(have??0))>=BigInt(String(cost??0))}catch{return Number(have||0)>=Number(cost||0)}}
function v145RootBranchEffect(id,b={}){if(id==='gathering')return `Tu Vi +${num(b.cultivationBonusPct,1)}% · Linh Tủy +${num(b.tendonDropBonusPct,1)}% · Bế Quan +${num(b.retreatBonusPct,1)}%`;if(id==='battle')return `Công +${num(b.attackPct,1)}% · Phá Thế +${num(b.breakEffectPct,1)}% · Bạo Thương +${num(b.critDamagePct,1)}%`;if(id==='body')return `HP +${num(b.maxHpPct,1)}% · Phòng +${num(b.defensePct,1)}% · Giảm thương +${num(b.damageReductionPct,1)}%`;return `Chân Nguyên +${num(b.maxSpiritPct,1)}% · Hồi CN +${num(b.spiritRegenPct,1)}% · Hồi chiêu +${num(b.cooldownReductionPct,1)}%`;}
function renderSpiritualRoots(){
  const sr=model.spiritualRoot||{};
  if(sr.schema!=='spiritual-root.v145')return page('Linh Căn','Đang đồng bộ Linh Căn V145…','<div class="card"><p class="muted">Chưa nhận được snapshot Linh Căn mới.</p></div>');
  const grade=sr.grade||{},combat=sr.combat||{},spent=sr.meridianPointsSpent||{},branches=Object.values(sr.branches||{}),meridian=sr.meridianBonuses||{};
  const canNourish=!sr.ascensionRequired&&v145RootEnough(sr.tendonOwned,sr.nextLevelCost);
  const canAscend=Boolean(sr.ascensionRequired&&sr.requiredOriginRealmUnlocked&&v145RootEnough(sr.originOwned,sr.ascensionCost));
  const branchCards=branches.map(branch=>`<article class="v2314-root-card"><header><span>CĂN MẠCH</span><b>${num(spent[branch.id]||0)} điểm</b></header><strong>${esc(branch.name)}</strong><p>${esc(branch.role||'')}</p><small>${esc(v145RootBranchEffect(branch.id,meridian))}</small><footer><span>Còn ${num(sr.availableMeridianPoints||0)} điểm</span><button class="button ghost" data-root-meridian="${esc(branch.id)}" ${Number(sr.availableMeridianPoints||0)>0?'':'disabled'}>+1 điểm</button></footer></article>`).join('');
  const insightCards=Number(sr.pendingInsightChoices||0)>0?(sr.insightOptions||[]).map(x=>`<article class="v2314-root-card"><header><span>CĂN NGỘ</span><b>Bậc ${num(sr.insightRanks?.[x.id]||0)}</b></header><strong>${esc(x.name)}</strong><p>${esc(x.description||'')}</p><footer><span>Còn ${num(sr.pendingInsightChoices)} lượt chọn</span><button class="button gold" data-root-insight="${esc(x.id)}">Lĩnh Ngộ</button></footer></article>`).join(''):'<div class="v2314-empty">Tiến Cấp mỗi 100 Lv để nhận thêm một lựa chọn Căn Ngộ.</div>';
  const originRows=(sr.originTiers||[]).filter(x=>Number(x.tier)===Number(sr.requiredOriginTier)||Number(x.tier)===Number(sr.requiredOriginTier)-1||BigInt(String(x.owned||0))>0n).map(x=>{const enough=v145RootEnough(x.owned,3);return `<article class="v2314-origin-list"><div><small>BẢN NGUYÊN BẬC ${num(x.tier)} · ${x.naturalDropUnlocked?'ĐÃ MỞ RƠI':'CHƯA RƠI TỰ NHIÊN'}</small><b>${v145RootBig(x.owned)} mảnh</b><span>Boss First Clear + Săn Ảo 500 kill tại đại cảnh bậc ${num(x.tier)}.</span></div>${x.canCombineUp?`<button class="button ghost" data-root-combine="${num(x.tier)}" ${enough?'':'disabled'}>Ghép 3 → 1 bậc ${num(Number(x.tier)+1)}</button>`:''}</article>`;}).join('');
  const gateText=sr.ascensionRequired?(sr.requiredOriginRealmUnlocked?`Cần ${v145RootBig(sr.ascensionCost)} Bản Nguyên bậc ${num(sr.requiredOriginTier)} · đang có ${v145RootBig(sr.originOwned)}.`:`Chưa đủ cảnh giới nhân vật: cần mở đại cảnh bậc ${num(sr.requiredOriginTier)}. Có thể ghép Bản Nguyên trước nhưng không thể vượt gate cảnh giới.`):`Mốc Tiến Cấp kế tiếp ở Lv${num((Number(sr.ascensions||0)+1)*100)}.`;
  return `<section class="v106-screen v2314-roots"><header class="v106-screen-head"><div><h1>Linh Căn · ${esc(grade.name||'Phàm Căn')}</h1><p>Một Linh Căn duy nhất, tiến cấp vô hạn. Tăng Tu Vi và core combat; Ngũ Hành/Pháp Tắc là hệ riêng ở cảnh giới cao.</p></div><div class="v106-head-tools"><button class="v106-icon-btn" data-sheet-open="root-rules" aria-label="Quy tắc Linh Căn">?</button></div></header><div class="v2314-scroll"><section class="v2314-hero neutral"><div class="v2314-hero-orb">∞</div><div><small>LINH CĂN V145 · KHÔNG GIỚI HẠN</small><strong>Lv${num(sr.level)} · ${esc(grade.name||'')}</strong><p>Tu Vi +${num(sr.cultivationBonusPct,1)}% · mỗi 100 Lv nhận Điểm Căn Mạch và một Căn Ngộ.</p></div><aside><span>Linh Tủy</span><b>${v145RootBig(sr.tendonOwned)}</b></aside></section><section class="v2314-section"><header><div><small>BỒI DƯỠNG</small><strong>Lv${num(sr.level)} → Lv${num(Number(sr.level||1)+1)}</strong></div><span>Cần ${v145RootBig(sr.nextLevelCost)} Linh Tủy</span></header><div class="v106-action-grid"><button class="button gold" data-root-nourish="1" ${canNourish?'':'disabled'}>Bồi Dưỡng ×1</button><button class="button ghost" data-root-nourish="10" ${canNourish?'':'disabled'}>×10</button><button class="button ghost" data-root-nourish="100" ${canNourish?'':'disabled'}>×100</button></div><p class="v2314-rule">${sr.ascensionRequired?'Đã chạm gate 100 Lv. Tiến Cấp trước khi tiếp tục bồi dưỡng.':'Linh Tủy rơi liên tục từ Săn Yêu/Săn Ảo.'}</p></section><section class="v2314-section"><header><div><small>TIẾN CẤP MỖI 100 LV</small><strong>${sr.ascensionRequired?'Đang chờ Tiến Cấp':'Gate chưa tới'}</strong></div><button class="button gold" data-root-ascend ${canAscend?'':'disabled'}>Tiến Cấp</button></header><p>${esc(gateText)}</p></section><section class="v2314-section"><header><div><small>BUFF LINH CĂN</small><strong>Tổng hiệu lực hiện tại</strong></div></header><div class="v2314-kpi-grid"><div><span>Tu Vi</span><b>+${num(sr.cultivationBonusPct,1)}%</b></div><div><span>Công</span><b>+${num(combat.attackPct,1)}%</b></div><div><span>HP</span><b>+${num(combat.maxHpPct,1)}%</b></div><div><span>Phòng</span><b>+${num(combat.defensePct,1)}%</b></div></div></section><section class="v2314-section"><header><div><small>CĂN MẠCH</small><strong>Còn ${num(sr.availableMeridianPoints||0)} điểm chưa phân</strong></div></header><div class="v2314-root-grid">${branchCards}</div></section><section class="v2314-section"><header><div><small>CĂN NGỘ</small><strong>${Number(sr.pendingInsightChoices||0)>0?`Có ${num(sr.pendingInsightChoices)} lượt đang chờ`:'Chưa có lượt mới'}</strong></div></header><div class="v2314-root-grid">${insightCards}</div></section><section class="v2314-section"><header><div><small>BẢN NGUYÊN LINH CĂN</small><strong>Theo 28 đại cảnh · ghép chính xác 3:1</strong></div><span>Đã mở rơi tới bậc ${num(sr.unlockedOriginRealmTier||0)}</span></header><div class="v2314-origin-list">${originRows||'<div class="v2314-empty">Chưa có Bản Nguyên. Hạ Boss/Săn Ảo sau khi vào Luyện Khí để bắt đầu.</div>'}</div><p class="v2314-rule">Bản Nguyên bậc N chỉ rơi tự nhiên sau khi đã lên đại cảnh bậc N. Có thể ghép 3 mảnh bậc thấp thành 1 mảnh bậc kế, nhưng Tiến Cấp Linh Căn vẫn khóa theo cảnh giới nhân vật. Từ bậc 28 trở đi dùng Bản Nguyên bậc 28 cho vòng vô hạn.</p></section></div>${v106Sheet('root-rules','Quy tắc Linh Căn V145',`<div class="v2314-rules"><article><b>1 · Vô hạn</b><span>Lv1→∞. Lv1–1000 dùng 10 danh xưng; sau đó là Vô Cực Căn · Chuyển N.</span></article><article><b>2 · Tu Luyện</b><span>Linh Căn tăng tốc Tu Vi tự tu bằng diminishing curve, không nhân Tu Vi tức thời từ đan/thưởng.</span></article><article><b>3 · Combat</b><span>Công/HP/Phòng tăng vô hạn an toàn; utility như DR/CDR/Chân Nguyên bị bounded.</span></article><article><b>4 · Căn Mạch & Căn Ngộ</b><span>Mỗi 100 Lv nhận 1 Điểm Căn Mạch và 1 lựa chọn Căn Ngộ trong 3 phương án.</span></article><article><b>5 · Bản Nguyên</b><span>28 bậc theo đại cảnh. Bậc mới chỉ rơi khi đạt cảnh; ghép 3:1 được trước nhưng không bypass gate cảnh giới.</span></article></div>`)}${v106MoreSheet()}</section>`;
}

function renderCombat(){
  const dungeons=model.dungeons.filter(d=>d.unlocked); const intel=selectedBossIntel||model.nextBossIntel;
  const dungeonList=`<div class="card"><h2>Phó bản đã mở</h2><div class="boss-dungeon-list">${dungeons.map(d=>`<article class="boss-dungeon-card"><div><div class="eyebrow">Phó bản</div><h3>${esc(d.name)}</h3><div class="small muted">Đã vượt ${d.highestClearedFloor}/${d.maxFloor}${d.nextFloor?` · mục tiêu kế: tầng ${d.nextFloor.floor}`:''}</div></div>${d.nextFloor?`<button class="button ghost" data-intel="${esc(d.id)}" data-floor="${d.nextFloor.floor}">Xem phân tích</button>`:''}</article>`).join('')||'<div class="empty">Chưa mở phó bản.</div>'}</div></div>`;
  return page('Thủ Lĩnh & Chiến Đấu','Tập trung vào thông tin ra quyết định: nên đánh ở đâu, chuẩn bị gì và trận vừa rồi sai ở điểm nào.',`<div class="grid cols-2">${dungeonList}${renderBossIntel(intel)}</div><div style="margin-top:14px">${renderCombatReview(model.combatReview)}</div>`);
}
function renderPlanPreview(x){return `<div class="card ${x.valid&&x.affordable?'good':'bad'}"><strong>${x.valid&&x.affordable?'Kế hoạch Mệnh Thai hợp lệ':'Kế hoạch Mệnh Thai chưa thể dùng'}</strong>${metric('CP Mệnh Thai cũ',`${x.totalCpCost} / ${x.cpAvailable}`)}${x.errors.map(e=>`<div class="small" style="color:#e58b8b">• ${esc(e)}</div>`).join('')}${x.notes.map(n=>`<div class="small muted">• ${esc(n)}</div>`).join('')}</div>`;}
function currentPlanFromDom(){
  const q=name=>content.querySelector(`[name="${name}"]`)?.value||undefined; const plan={aptitudeFloor:0,birthCandidate:Number(q('birthCandidate')||1),orientationId:q('orientationId')||'balanced'};
  for(const k of ['lockSpiritualRootId','lockPhysiqueId','lockBloodlineId','lockFamily','lockFate','daoSeedId','memoryArchiveId']){const v=q(k);if(v)plan[k]=v;}
  const karma=[...content.querySelectorAll('[name="karma"]:checked')].map(x=>x.value); if(karma.length)plan.inheritKarmaNpcIds=karma;
  const relic=[...content.querySelectorAll('[name="relic"]:checked')].map(x=>x.value); if(relic.length)plan.bindRelicArtifactIds=relic;
  reincPlan=plan; return plan;
}
function renderAutomation(){
  const a=model.automation||{},thresholds=a.thresholds||{},wake=a.wake||{};
  const activityLabels={gather:'Thu Thập',hunt:'Săn Yêu',explore:'Thám Hiểm',dungeon:'Phó Bản',craft:'Chế Tạo'};
  const metricLabels={tuViPct:'Tiến độ Tu Vi',injury:'Thương Thế',realmOrder:'Cảnh giới',spiritStones:'Linh Thạch'};
  const opLabels={lt:'nhỏ hơn',lte:'không quá',gt:'lớn hơn',gte:'ít nhất'};
  const acts=['gather','hunt','explore','dungeon'];
  const rules=(a.strategyRules||[]).map(r=>`<article class="automation-rule"><div><strong>${esc(r.when)}</strong><div class="small muted">Ưu tiên ${esc(activityLabels[r.prefer]||r.prefer)} · +${r.priorityBoost}</div></div><button class="button ghost" data-del-rule="${esc(r.id)}">Xóa</button></article>`).join('');
  const status=`<div class="automation-hero ${a.enabled?'enabled':''}"><div><div class="eyebrow">Đạo tâm tự vận</div><h2>${a.enabled?'Tự động hóa đang bật':'Tự động hóa đang tắt'}</h2><div class="small muted">Tự động hóa chỉ chọn hoạt động hợp lệ; Tự Tu luôn chạy độc lập.</div></div><div class="automation-status-orb">${a.enabled?'BẬT':'TẮT'}</div></div>`;
  const settings=`<div class="card automation-settings-card"><h2>Giới hạn an toàn</h2><label class="automation-toggle"><input id="guidanceEnabled" type="checkbox" ${a.enabled?'checked':''}><span><b>Bật hướng dẫn và tự động hóa</b><small>Cho phép game chọn hoạt động trong phạm vi đã cấu hình.</small></span></label><h3>Hoạt động được phép</h3><div class="automation-activity-grid">${acts.map(x=>`<label class="automation-activity"><input type="checkbox" name="allowedActivity" value="${x}" ${(a.allowedActivities||[]).includes(x)?'checked':''}><span>${activityLabels[x]}</span></label>`).join('')}</div><div class="form-grid automation-thresholds"><div class="field"><label>Thương Thế tối đa</label><input name="maxInjury" type="number" min="0" max="100" value="${Number(thresholds.maxInjury??60)}"></div><div class="field"><label>Lặp cùng hành động tối đa</label><input name="maxConsecutiveSameAction" type="number" min="1" max="20" value="${Number(thresholds.maxConsecutiveSameAction??4)}"></div></div><div class="automation-wake-grid"><label class="check"><input name="wakeContent" type="checkbox" ${wake.contentEvent?'checked':''}> <span>Dừng khi gặp cơ duyên cần quyết định</span></label><label class="check"><input name="wakeBoss" type="checkbox" ${wake.beforeBoss?'checked':''}> <span>Dừng trước Thủ Lĩnh</span></label></div><div class="tag-row" style="margin-top:14px"><button class="button primary" data-save-automation>Lưu thiết lập</button><button class="button gold" data-run-ai>Chạy thử tối đa 5 năm</button></div></div>`;
  const ruleBuilder=`<div class="card automation-rules-card"><h2>Quy tắc chiến lược</h2><div class="automation-rule-list">${rules||'<div class="empty">Chưa có quy tắc ưu tiên riêng.</div>'}</div><h3>Tạo quy tắc mới</h3><div class="form-grid"><div class="field"><label>Chỉ số</label><select name="ruleMetric">${Object.entries(metricLabels).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></div><div class="field"><label>Điều kiện</label><select name="ruleOp">${Object.entries(opLabels).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></div><div class="field"><label>Giá trị</label><input name="ruleValue" type="number" value="50"></div><div class="field"><label>Hành động ưu tiên</label><select name="rulePrefer">${acts.map(x=>`<option value="${x}">${activityLabels[x]}</option>`).join('')}</select></div><div class="field"><label>Mức tăng ưu tiên</label><input name="ruleBoost" type="number" min="10" max="500" value="180"></div></div><button class="button" style="margin-top:10px" data-add-rule>Thêm quy tắc</button><div class="footer-note">Quy tắc không thể bỏ qua giới hạn Thương Thế, cơ duyên hay Thủ Lĩnh.</div></div>`;
  return page('Tự Động','Trợ lý hoạt động gọn, không quản lý các trạng thái Tu Luyện đã retire.',`${status}<div class="grid cols-2" style="margin-top:14px">${settings}${ruleBuilder}</div>`);
}

function renderTelemetry(){
  const t=model.telemetry,e=model.earlyGame;
  const loops=Object.entries(t.actions.byLoop).sort((a,b)=>b[1]-a[1]);
  const loopNames={cultivation:'Tu luyện',combat:'Chiến đấu',economy:'Kinh tế',social:'Nhân duyên',exploration:'Khám phá',crafting:'Chế tạo',reincarnation:'Luân hồi'};
  const healthLabel={healthy:'Ổn định',watch:'Cần theo dõi',warning:'Có cảnh báo',critical:'Nguy cấp'}[t.health.band]||t.health.band;
  const top=`<div class="telemetry-kpi-grid"><div class="card"><div class="eyebrow">Tổng hành động</div><div class="big-number">${t.actions.total}</div>${metric('Có ý nghĩa',t.actions.meaningful)}</div><div class="card"><div class="eyebrow">Mật độ quyết định</div><div class="big-number">${num(t.actions.decisionDensityPer10Actions,1)}</div><span class="muted small">quyết định / 10 hành động</span></div><div class="card ${t.actions.retreatSharePct>60?'warn':''}"><div class="eyebrow">Tỉ trọng Bế Quan</div><div class="big-number">${num(t.actions.retreatSharePct)}%</div></div><div class="card"><div class="eyebrow">Độ đa dạng sự kiện</div><div class="big-number">${t.content.uniqueEvents}</div>${metric('Độ đa dạng lựa chọn',t.content.choiceVariety)}</div></div>`;
  const loopHtml=loops.map(([k,v])=>`<div class="telemetry-loop-row"><span>${esc(loopNames[k]||k)}</span><div class="progress"><i style="width:${t.actions.total?Math.min(100,v/t.actions.total*100):0}%"></i></div><b>${v}</b></div>`).join('')||'<div class="empty">Chưa đủ dữ liệu.</div>';
  const milestoneHtml=t.milestones.map(m=>`<div class="milestone-row ${m.reached?'reached':''}"><i>${m.reached?'✓':'○'}</i><div><strong>${esc(m.label)}</strong><div class="small muted">${m.reached?`đạt lúc ${num(m.ageYears,1)} tuổi`:`dải V84 ${num(m.targetAgeMin??m.targetAge,0)}–${num(m.targetAgeMax??m.targetAge,0)} tuổi`}</div></div></div>`).join('');
  return page('Đo Lường','Màn dành cho cân bằng và playtest, nhưng vẫn được trình bày rõ ràng để đọc nhanh thay vì giống bảng debug.',`${top}<div class="grid cols-2" style="margin-top:14px"><div class="card"><h2>Phân bố vòng lặp</h2><div class="telemetry-loop-list">${loopHtml}</div></div><div class="card"><h2>Cột mốc đời hiện tại</h2><div class="milestone-list">${milestoneHtml}</div></div></div><div class="grid cols-2" style="margin-top:14px"><div class="card ${t.health.band==='healthy'?'good':'warn'}"><div class="eyebrow">Sức khỏe vòng lặp</div><h2>${esc(healthLabel)}</h2>${t.health.warnings.map(x=>`<div class="small">• ${esc(x)}</div>`).join('')||'<div class="small muted">Chưa có cảnh báo.</div>'}${t.health.recommendations.map(x=>`<div class="small muted">→ ${esc(x)}</div>`).join('')}</div><div class="card"><h2>Độ hoàn thiện lát cắt</h2>${metric('Mốc',e.stage.name)}${metric('Nhịp độ',e.stage.pace)}${metric('Mật độ quyết định',e.decisionDensity)}${progress(e.progressPct,'gold')}</div></div>`);
}



function v239DongFuBuildingMeta(){
  return [
    {id:'scripture',index:1,name:'Tàng Kinh Các',asset:'tang_kinh_cac',categories:['manual','heart'],farm:'manual',pos:'p1',glyph:'◆'},
    {id:'artifact',index:2,name:'Luyện Bảo Các',asset:'luyen_bao_cac',categories:['artifact','relic'],farm:'artifact',pos:'p2',glyph:'✦'},
    {id:'beast',index:3,name:'Linh Thú Viên',asset:'linh_thu_vien',categories:['pet'],farm:'pet',pos:'p3',glyph:'◇'},
    {id:'companion',index:4,name:'Tri Kỷ Các',asset:'tri_ky_cac',categories:['companion'],farm:'companion',pos:'p4',glyph:'♥'},
    {id:'bloodline',index:5,name:'Huyết Trì',asset:'huyet_tri',categories:['bloodline'],farm:'bloodline',pos:'p5',glyph:'♦'},
    {id:'physique',index:6,name:'Luyện Thể Thất',asset:'luyen_the_that',categories:['physique'],farm:'physique',pos:'p6',glyph:'✧'},
    {id:'alchemy',index:7,name:'Đan Phòng',asset:'dan_phong',categories:[],farm:null,pos:'p7',glyph:'●'},
    {id:'forge',index:8,name:'Luyện Khí',asset:'luyen_khi',categories:[],farm:null,pos:'p8',glyph:'▲'}
  ];
}
function v239DongFuCategories(){return model.collectionEconomy?.categories||[];}
function v239DongFuCategory(id){return v239DongFuCategories().find(x=>x.category===id)||{};}
function v239DongFuFacility(id){return (model.dongfu?.facilities||[]).find(x=>x.id===id)||(model.collection?.cave?.facilities||[]).find(x=>x.id===id)||{};}
function v99DongFuEffect(id){return (model.dongfu?.facilities||[]).find(x=>x.id===id)?.effectText||'';}
function v239DongFuStatus(meta){
  const facility=v239DongFuFacility(meta.id),cost=facility.cost||null;
  if(meta.id==='alchemy'){
    const busy=model.alchemy?.furnaces?.queues||[];
    if(busy.length)return {type:'timer',glyph:'⌛',label:`${busy.length} lò đang luyện`};
  }
  if(meta.id==='forge'){
    const busy=model.forging?.queues||[];
    if(busy.length)return {type:'timer',glyph:'⌛',label:`${busy.length} hỏa lò đang rèn`};
  }
  const stone=Number(resourceQuantity('resource.spirit_stone')||0),jade=Number(model.collectionEconomy?.currencies?.boundImmortalJade??model.collection?.currencies?.boundImmortalJade??0);
  if(cost&&stone>=Number(cost.spiritStone||0)&&jade>=Number(cost.boundJade||0))return {type:'upgrade',glyph:'↑',label:'Có thể nâng công trình'};
  if(meta.id==='companion'&&Number(v239DongFuCategory('companion').owned||0)>0)return {type:'affection',glyph:'♥',label:'Tri Kỷ đang chờ'};
  return {type:'idle',glyph:'·',label:'Ổn định'};
}
function v239DongFuStatusIcon(type='idle'){
  const icons={upgrade:'status_upgrade',timer:'status_timer',collect:'status_collect',gift:'status_gift',affection:'status_affection',warning:'status_warning',complete:'status_complete'};
  return icons[type]?`/assets/dongphu/ui/${icons[type]}.webp`:'';
}
function v239DongFuStatusMarkup(status){
  const src=v239DongFuStatusIcon(status?.type);if(!src)return '<span class="v239-dp-status" aria-hidden="true"></span>';
  return `<span class="v239-dp-status" title="${esc(status.label)}"><img src="${src}" alt=""></span>`;
}
function v239DongFuMaterialIcon(key=''){
  const k=String(key).toLowerCase(),root='/assets/dongphu/materials/';
  if(k.includes('blood')&&k.includes('breakthrough'))return{kind:'blood',glyph:'♦',art:root+'mat_true_blood.webp'};
  if(k.includes('breakthrough')||k.includes('ascension'))return{kind:'breakthrough',glyph:'✦',art:root+'mat_breakthrough_crystal.webp'};
  if(k.includes('blood'))return{kind:'blood',glyph:'♦',art:root+'mat_blood_crystal.webp'};
  if(k.includes('physique')||k.includes('body'))return{kind:'physique',glyph:'✦',art:root+'mat_physique_essence.webp'};
  if(k.includes('manual')||k.includes('heart'))return{kind:'manual',glyph:'▤',art:root+'mat_manual_resource.webp'};
  if(k.includes('artifact')||k.includes('relic')||k.includes('treasure'))return{kind:'artifact',glyph:'◆',art:root+'mat_treasure_material.webp'};
  if(k.includes('pet')||k.includes('beast'))return{kind:'pet',glyph:'◇',art:root+'mat_pet_essence.webp'};
  if(k.includes('herb')||k.includes('leaf'))return{kind:'herb',glyph:'♣',art:root+'mat_herb.webp'};
  if(k.includes('ore')||k.includes('iron'))return{kind:'ore',glyph:'⬢',art:root+'mat_forge_ore.webp'};
  if(k.includes('fire')||k.includes('flame'))return{kind:'flame',glyph:'♨',art:root+'mat_spirit_flame.webp'};
  if(k.includes('crystal')||k.includes('stone')||k.includes('cultivation'))return{kind:'crystal',glyph:'⬢',art:root+'mat_cultivation_crystal.webp'};
  return{kind:'spirit',glyph:'✧',art:root+'mat_cultivation_crystal.webp'};
}
function v239DongFuMaterialMarkup(x){
  const visual=x.icon&&typeof x.icon==='object'?x.icon:v239DongFuMaterialIcon(x.name),short=x.need>0&&x.owned<x.need;
  const art=visual.art?`<img src="${esc(visual.art)}" alt="">`:`<i>${esc(visual.glyph||'✧')}</i>`;
  return `<div class="v239-dp-material kind-${esc(visual.kind||'spirit')} ${short?'short':'ready'}" title="${esc(x.name)}"><span class="v239-dp-material-art">${art}</span><b>${num(x.owned)}${x.need?`/${num(x.need)}`:''}</b><small>${esc(x.name)}</small></div>`;
}
function v239DongFuMaterials(meta){
  if(meta.id==='alchemy'){
    const recipe=(model.alchemy?.recipes||[])[0];
    return (recipe?.ingredients||[]).slice(0,3).map(x=>({name:String(x.resourceId||'Dược liệu').replace('resource.','').replaceAll('_',' '),owned:Number(x.available||0),need:Number(x.quantity||0),icon:v239DongFuMaterialIcon(x.resourceId)}));
  }
  if(meta.id==='forge'){
    const recipe=(model.forging?.recipes||[])[0];
    return (recipe?.ingredients||[]).slice(0,3).map(req=>{const o=(req.options||[])[0]||{};return{name:req.name||String(o.resourceId||'Khoáng thạch').replace('resource.','').replaceAll('_',' '),owned:Number(o.available||0),need:Number(o.quantity||0),icon:v239DongFuMaterialIcon(o.resourceId)};});
  }
  const out=[];
  for(const cid of meta.categories){const c=v239DongFuCategory(cid);if(!c.category)continue;out.push({name:c.genericFragmentName||c.label||cid,owned:Number(c.genericFragments||0),need:Math.max(1,Number(c.nextStrengthCost||c.strengthCost||20)),icon:v239DongFuMaterialIcon(cid)});if(out.length<3)out.push({name:c.ascensionName||'Đột phá',owned:Number(c.ascensionEssence||0),need:Math.max(1,Number(c.nextAscensionCost||c.ascensionCost||5)),icon:v239DongFuMaterialIcon(cid+' breakthrough')});if(out.length>=3)break;}
  if(!out.length)out.push({name:'Linh lực',owned:0,need:0,icon:'✧'});
  return out.slice(0,3);
}
function v239DongFuProgress(meta){
  if(meta.id==='alchemy'){
    const a=model.alchemy||{},busy=a.furnaces?.queues||[],unlocked=Math.max(1,Number(a.furnaces?.unlocked||1));return {pct:Math.min(100,busy.length/unlocked*100),label:busy.length?`${busy.length}/${unlocked} lò đang bận`:'Các lò đang trống',timer:busy[0]?durationText(busy[0].durationRealSeconds||0):''};
  }
  if(meta.id==='forge'){
    const f=model.forging||{},busy=f.queues||[],cap=Math.max(1,Number(f.queueCapacity||1));return {pct:Math.min(100,busy.length/cap*100),label:busy.length?`${busy.length}/${cap} hỏa lò đang bận`:'Hỏa lò đang trống',timer:busy[0]?durationText(busy[0].remainingSeconds||0):''};
  }
  const cats=meta.categories.map(v239DongFuCategory).filter(x=>x.category),owned=cats.reduce((a,x)=>a+Number(x.owned||0),0),total=Math.max(1,cats.reduce((a,x)=>a+Number(x.total||0),0));return {pct:Math.min(100,owned/total*100),label:`Sưu tập ${owned}/${total}`,timer:''};
}
function v239DongFuInfoPanel(meta){
  const facility=v239DongFuFacility(meta.id),status=v239DongFuStatus(meta),progress=v239DongFuProgress(meta),materials=v239DongFuMaterials(meta);
  const mats=materials.map(v239DongFuMaterialMarkup).join('');
  const farm=meta.farm?`data-farm-category="${esc(meta.farm)}"`:'data-dongfu-open-dungeons-general';
  return `<section class="v239-dp-info status-${esc(status.type)}" data-dongfu-info-panel data-building-id="${esc(meta.id)}"><div class="v239-dp-info-thumb"><span></span><img src="/assets/dongphu/buildings/${esc(meta.asset)}_thumb.webp" alt="${esc(meta.name)}"></div><div class="v239-dp-info-main"><header><div><small data-dongfu-panel-status><i></i>${esc(status.label)}</small><strong>${esc(meta.name)}</strong></div><b data-dongfu-panel-level>Lv.${num(facility.level||1)}</b></header><div class="v239-dp-info-progress"><span><i style="width:${num(progress.pct,1)}%"></i></span><em>${esc(progress.timer||progress.label)}</em></div><p class="v99-dp-effect" data-dongfu-panel-effect>${esc(v99DongFuEffect(meta.id))}</p><div class="v239-dp-materials" aria-label="Nguyên liệu">${mats}</div></div><div class="v239-dp-actions"><button class="primary" data-dongfu-section="${esc(meta.id)}">Vào</button><button class="secondary" ${farm}>Đi Farm</button><button class="tertiary" data-dongfu-autocollect-info disabled title="Thành phẩm hoàn tất được tự đồng bộ vào kho">Tự Đồng Bộ</button></div></section>`;
}
function renderDongFuHomeV2327(){
  const o=model.overview||{},c=model.character||{},life=o.life||{},cult=o.cultivation||{},legacy=model.collection||{},ce=model.collectionEconomy||{};
  const energy=Number(live?.tuVi??cult.tuVi??0),target=Math.max(1,Number(cult.requiredTuVi)||1),progressPct=Math.max(0,Math.min(100,energy/target*100));
  const name=String(c.name||life.name||'Tu Sĩ'),realm=String(life.realm||'Luyện Khí'),lifeNo=Number(life.lifeNumber||1),stone=resourceQuantity('resource.spirit_stone'),jade=ce.currencies?.boundImmortalJade??legacy.currencies?.boundImmortalJade??0;
  const hubSkin=v1074SelectedVisual('skin')||{},hubExpression=v1074SelectedExpression?.()||{},hubAvatar=hubExpression.portrait||hubSkin.avatar||'/assets/runtime/v138/characters/immortal_swordsman_01/portrait.webp';
  const metas=v239DongFuBuildingMeta();if(!metas.some(x=>x.id===dongfuUi.hubSelected))dongfuUi.hubSelected='alchemy';const selected=metas.find(x=>x.id===dongfuUi.hubSelected)||metas[6];
  const nodes=metas.map(meta=>{const facility=v239DongFuFacility(meta.id),status=v239DongFuStatus(meta),selectedCls=meta.id===selected.id?'selected':'';return `<button class="v239-dp-node ${esc(meta.pos)} ${selectedCls} status-${esc(status.type)}" data-dongfu-hub-select="${esc(meta.id)}" aria-label="${esc(meta.name)}">`+`<img src="/assets/dongphu/buildings/${esc(meta.asset)}_base.webp" alt="">${v239DongFuStatusMarkup(status)}<span class="v239-dp-label"><i>${num(meta.index)}</i><b>${esc(meta.name)}</b><small>Lv.${num(facility.level||1)}</small></span></button>`;}).join('');
  return `<section class="v239-dongfu-hub"><div class="v239-dp-scene"><div class="v239-dp-pixi-host" data-dongfu-pixi-host aria-label="Động Phủ · WebGL scene"></div><img class="v239-dp-bg" src="/assets/dongphu/bg/dongphu_bg_far.webp" alt=""><header class="v239-dp-hud"><div class="v239-dp-identity"><div class="v239-dp-avatar"><img src="${esc(hubAvatar)}" alt=""><b>${num(lifeNo)}</b></div><div><strong>${esc(name)}</strong><span>${esc(realm)} · Đời ${num(lifeNo)}</span><div><i data-dongfu-realm-progress style="width:${progressPct}%"></i></div></div></div><div class="v239-dp-resources"><button data-tab-jump="cultivation"><i>✦</i><b data-dongfu-live-resource="energy">${esc(v2320Compact(energy))}</b><span>+</span></button><button data-tab-jump="inventory"><i>◆</i><b data-dongfu-live-resource="stone">${esc(v2320Compact(stone))}</b><span>+</span></button><button data-tab-jump="collection"><i>◈</i><b data-dongfu-live-resource="jade">${esc(v2320Compact(jade))}</b><span>+</span></button></div></header><div class="v239-dp-title"><i></i><h1>Động Phủ</h1><i></i></div><button class="v239-dp-quick disabled" data-dongfu-quick-collect aria-disabled="true" title="Thành phẩm hiện tự đồng bộ vào kho"><i><img src="/assets/dongphu/ui/quick_collect_lotus.webp" alt=""></i><span>Tự Đồng Bộ<br>Kho</span></button><div class="v239-dp-map">${nodes}</div></div>${v239DongFuInfoPanel(selected)}${v106MoreSheet()}</section>`;
}


function v239SyncDongFuHomeLive(){
  if(activeTab!=='dongfu'||dongfuUi.section!=='home'||!content.querySelector('.v239-dongfu-hub'))return;
  const o=model.overview||{},cult=o.cultivation||{},legacy=model.collection||{},ce=model.collectionEconomy||{};
  const energy=Number(live?.tuVi??cult.tuVi??0),target=Math.max(1,Number(cult.requiredTuVi)||1),progressPct=Math.max(0,Math.min(100,energy/target*100));
  const stone=resourceQuantity('resource.spirit_stone'),jade=ce.currencies?.boundImmortalJade??legacy.currencies?.boundImmortalJade??0;
  const values={energy:v2320Compact(energy),stone:v2320Compact(stone),jade:v2320Compact(jade)};
  content.querySelectorAll('[data-dongfu-live-resource]').forEach(el=>{const key=el.dataset.dongfuLiveResource;if(key in values)el.textContent=values[key];});
  const realmProgress=content.querySelector('[data-dongfu-realm-progress]');if(realmProgress)realmProgress.style.width=`${progressPct}%`;
  const metas=v239DongFuBuildingMeta();
  for(const meta of metas){
    const btn=content.querySelector(`[data-dongfu-hub-select="${CSS.escape(String(meta.id))}"]`);if(!btn)continue;
    const facility=v239DongFuFacility(meta.id),status=v239DongFuStatus(meta);
    [...btn.classList].filter(x=>x.startsWith('status-')).forEach(x=>btn.classList.remove(x));btn.classList.add(`status-${status.type}`);
    const badge=btn.querySelector('.v239-dp-status');if(badge){const src=v239DongFuStatusIcon(status.type);badge.title=src?status.label:'';badge.innerHTML=src?`<img src="${src}" alt="">`:'';}
    const level=btn.querySelector('.v239-dp-label small');if(level)level.textContent=`Lv.${num(facility.level||1)}`;
  }
  const selected=metas.find(x=>x.id===dongfuUi.hubSelected),panel=content.querySelector('[data-dongfu-info-panel]');
  if(selected&&panel){
    const facility=v239DongFuFacility(selected.id),status=v239DongFuStatus(selected),progress=v239DongFuProgress(selected),materials=v239DongFuMaterials(selected);
    [...panel.classList].filter(x=>x.startsWith('status-')).forEach(x=>panel.classList.remove(x));panel.classList.add(`status-${status.type}`);
    const statusEl=panel.querySelector('[data-dongfu-panel-status]');if(statusEl){const dot=statusEl.querySelector('i');statusEl.replaceChildren(dot||document.createElement('i'),document.createTextNode(status.label));}
    const levelEl=panel.querySelector('[data-dongfu-panel-level]');if(levelEl)levelEl.textContent=`Lv.${num(facility.level||1)}`;
    const bar=panel.querySelector('.v239-dp-info-progress i');if(bar)bar.style.width=`${num(progress.pct,1)}%`;
    const progressText=panel.querySelector('.v239-dp-info-progress em');if(progressText)progressText.textContent=progress.timer||progress.label;
    const effectText=panel.querySelector('[data-dongfu-panel-effect]');if(effectText)effectText.textContent=v99DongFuEffect(selected.id);
    const tray=panel.querySelector('.v239-dp-materials');if(tray){const nextMaterials=materials.map(v239DongFuMaterialMarkup).join('');if(tray.innerHTML!==nextMaterials)tray.innerHTML=nextMaterials;}
  }
  dongFuPixiModule?.requestDongFuPixiLayout?.();
}


function v99MountDongFuPixiScene(){
  if(activeTab!=='dongfu'||dongfuUi.section!=='home'){dongFuPixiModule?.destroyDongFuPixiScene?.();return;}
  if(!dongFuPixiModule){
    loadDongFuPixiModuleV129().then(()=>{if(activeTab==='dongfu'&&dongfuUi.section==='home')v99MountDongFuPixiScene();}).catch(()=>{document.body.dataset.dongfuPixiReady='0';});
    return;
  }
  const host=content.querySelector('[data-dongfu-pixi-host]');
  if(!host)return;
  const depth={p1:7,p2:3,p3:3,p4:4,p5:5,p6:4,p7:6,p8:6};
  const alpha={p1:1,p2:.86,p3:.86,p4:.92,p5:1,p6:.92,p7:1,p8:1};
  const buildings=v239DongFuBuildingMeta().map(meta=>({
    id:meta.id,
    asset:`/assets/dongphu/buildings/${meta.asset}_base.webp`,
    depth:depth[meta.pos]||5,
    alpha:alpha[meta.pos]??1,
  }));
  dongFuPixiModule.mountDongFuPixiScene({
    host,
    background:'/assets/dongphu/bg/dongphu_bg_far.webp',
    buildings,
    selectedId:dongfuUi.hubSelected,
    onSelect:id=>{
      const btn=content.querySelector(`[data-dongfu-hub-select="${CSS.escape(String(id))}"]`);
      if(btn)btn.click();
    },
  }).then(result=>{
    document.body.dataset.dongfuPixiReady=result?.ok?'1':'0';
  }).catch(error=>{
    console.warn('[dongfu-pixi] mount error',error);
    document.body.dataset.dongfuPixiReady='0';
  });
}


function v2328WorkshopArt(category,index=0){
  const beasts=['light-lion.png','white-tiger.png','water-dragon.png','earth-qilin.png','fire-phoenix.png','dark-fox.png','ice-tortoise.png','wood-stag.png','thunder-wolf.png','wind-phoenix.png'];
  if(category==='manual'||category==='heart')return '/assets/hubs/manual.jpg';
  if(category==='artifact')return '/assets/hubs/artifact.jpg';
  if(category==='relic')return '/assets/hubs/daily-artifact.jpg';
  if(category==='pet'||category==='bloodline')return `/assets/huntv2/beasts/${beasts[index%beasts.length]}`;
  if(category==='companion')return '/assets/hubs/companion.jpg';
  return '/assets/hubs/dongfu-hero.jpg';
}
function v2328FacilityLevel(id){return Number((model.collection?.cave?.facilities||[]).find(x=>x.id===id)?.level||1);}
function v2328FacilityUpgrade(id){
  const facility=(model.collection?.cave?.facilities||[]).find(x=>x.id===id),cost=facility?.cost;
  return cost?`<button class="button ghost" data-cave-upgrade="${esc(id)}">Nâng Công Trình · ${num(cost.spiritStone)} Linh Thạch + ${num(cost.boundJade)} Ngọc Khóa</button>`:`<button class="button ghost" disabled>Công Trình MAX</button>`;
}
function v87ConfidantPanel(selected,cat){
  const c=selected?.confidant;if(!c)return'';
  const fortune=cat?.confidantFortune||model.collectionEconomy?.confidantV87?.fortune||{},special=cat?.activeSpecialty||model.collectionEconomy?.confidantV87?.activeSpecialty;
  const lock=(ok,text)=>ok?`<span class="ready">Đã mở</span>`:`<span class="locked">${esc(text)}</span>`;
  return `<section class="v87-confidant-panel" data-confidant-v87="${esc(c.id)}"><header><div><span>TRI KỶ V87 · ${c.active?'ĐỒNG HÀNH':'SỞ HỮU'}</span><h3>${esc(c.name)}</h3><small>${esc(c.title||'')}</small></div><b>Thân Mật ${num(c.intimacy||1)}/100 · Duyên ${esc(c.fateLabel||'I')}</b></header><div class="v87-confidant-grid"><article><span>SỞ TRƯỜNG</span><b>${esc(c.specialty?.name||'Chưa mở')}</b><small>${esc(c.specialty?.description||'')}</small>${lock(c.specialty?.unlocked,'Mở ở Thân Mật 30')}${c.specialty?.unlocked?`<em>Hiệu lực ${num(c.specialty?.strengthPct||0,2)}%</em>`:''}</article><article><span>TRỢ CHIẾN</span><b>${esc(c.assist?.name||'')}</b><small>${esc(c.assist?.description||'')}</small>${lock(c.assist?.unlocked,'Mở từ Duyên I')}${c.assist?.upgraded?'<em>Thân Mật 50 · đã cường hóa</em>':''}</article><article><span>HỘ ĐẠO · 1 LẦN/TRẬN</span><b>${esc(c.guard?.name||'')}</b><small>${esc(c.guard?.description||'')}</small>${lock(c.guard?.unlocked,'Cần Thân Mật 70 + Duyên II')}</article><article><span>TÂM Ý TƯƠNG THÔNG</span><b>${esc(c.harmony?.name||'')}</b><small>${esc(c.harmony?.description||'')}</small>${lock(c.harmony?.unlocked,'Cần Thân Mật 100 + Duyên V')}</article></div><div class="v87-fortune-overview"><strong>Duyên Phúc · ${num(fortune.points||0)} điểm</strong><span>${num(fortune.owned||0)}/${num(fortune.total||8)} Tri Kỷ sở hữu đang đóng góp theo milestone.</span><small>Tu Vi +${num(fortune.cultivationPct||0,2)}% · Săn Yêu +${num(fortune.huntRewardPct||0,2)}% · Chế tác +${num(fortune.craftQualityPct||0,2)}%</small>${c.active&&special?.unlocked?`<em>Đồng Hành: ${esc(special.name)} +${num(special.strengthPct||0,2)}%</em>`:''}</div></section>`;
}

function v88ArtifactSlotUnlockLabel(i){return i<2?'Trúc Cơ':i===2?'Tử Phủ':'Nguyên Anh';}
function v88ArtifactSlotBoard(selected,cat){
  const root=model.collectionEconomy?.artifactV88||{},items=cat?.items||[],byId=new Map(items.map(x=>[x.id,x])),activeIds=root.activeArtifactIds||items.filter(x=>x.active).map(x=>x.id),cap=Number(cat?.artifactSlotCapacity??root.slotCapacity??0);
  const cards=[0,1,2,3].map(i=>{const unlocked=i<cap,current=byId.get(activeIds[i]),same=selected?.id&&current?.id===selected.id;return `<article class="v88-slot ${unlocked?'unlocked':'locked'} ${same?'selected':''}"><span>Ô ${i+1}</span><b>${current?esc(current.name):(unlocked?'Trống':`Khóa · ${v88ArtifactSlotUnlockLabel(i)}`)}</b><small>${current?`Luyện Hóa ${num(current.progress?.level||1)} · Bảo Giai ${esc(current.artifact?.grade||'I')}`:(unlocked?'Chọn một Pháp Bảo sở hữu để trang bị.':`Mở khi đạt ${v88ArtifactSlotUnlockLabel(i)}.`)}</small><div>${current?`<button class="button ghost" data-collection-unequip-v12325="${esc(current.id)}">Tháo</button>`:''}${unlocked&&selected?.category==='artifact'&&selected.progress?.owned&&!same?`<button class="button gold" data-artifact-equip-slot-v88="${esc(selected.id)}" data-artifact-slot-index="${i}">${current?'Thay vào ô này':'Trang bị vào ô này'}</button>`:''}</div></article>`;}).join('');
  const next=root.nextSlotUnlock;return `<section class="v88-loadout-board"><header><div><span>PHÁP BẢO ĐANG DÙNG</span><strong>${Math.min(activeIds.length,cap)}/${cap||0} ô mở</strong></div>${next?`<small>Ô ${num(next.slot)} mở ở ${esc(next.realm)}</small>`:'<small>Đã mở đủ 4 ô</small>'}</header><div class="v88-slot-grid">${cards}</div></section>`;
}
function v88UpgradeGuide(selected,cat){
  const p=selected?.progress||{},root=model.collectionEconomy?.artifactV88||{},isArtifact=selected?.category==='artifact',isRelic=selected?.category==='relic';if(!isArtifact&&!isRelic)return'';
  const refineCost=Number(selected.strengthenCost||0),advanceCost=Number(selected.advanceCost||0),essenceCost=Number(selected.ascensionCost||0),materialOwned=Number(cat?.genericFragments||0),essenceOwned=Number(cat?.ascensionEssence||0),fragOwned=Number(p.specificFragments||0),nextGrade=['II','III','IV','V'][Math.min(3,Number(p.advance||0))]||'MAX';
  const canRefine=Number(p.level||1)<100&&materialOwned>=refineCost,canAdvance=Number(p.advance||0)<4&&fragOwned>=advanceCost&&essenceOwned>=essenceCost;
  return `<section class="v88-upgrade-guide"><header><div><span>CÁCH NÂNG</span><strong>Luyện Bảo Các Lv${num(root.facilityLevel||1)}</strong></div><small>Giảm ${num(root.refinementDiscountPct||0)}% chi phí Luyện Hóa</small></header><div class="v88-upgrade-path"><article class="${canRefine?'ready':''}"><span>1 · LUYỆN HÓA</span><b>${num(p.level||1)}/100 → ${Number(p.level||1)>=100?'MAX':num(Number(p.level||1)+1)}</b><small>Tăng hiệu lực số của Pháp Kỹ/Bảo Tính. Cần ${num(refineCost)} ${esc(cat?.genericFragmentName||'nguyên liệu')} · đang có ${num(materialOwned)}.</small></article><article class="${canAdvance?'ready':''}"><span>2 · BẢO GIAI</span><b>${isArtifact?esc(selected.artifact?.grade||'I'):esc(selected.relic?.gradeLabel||'I')} → ${Number(p.advance||0)>=4?'MAX':esc(nextGrade)}</b><small>${isArtifact?'Mốc III và V mở thêm hiệu ứng authored của Pháp Kỹ.':'Tăng hiệu lực luật/trigger của Chí Bảo.'} Cần ${num(advanceCost)} mảnh riêng + ${num(essenceCost)} ${esc(cat?.ascensionName||'nguyên liệu đột phá')}.</small><em>Đang có ${num(fragOwned)} mảnh · ${num(essenceOwned)} ${esc(cat?.ascensionName||'đột phá')}</em></article></div></section>`;
}
function v88ArtifactPanel(selected,cat){
  if(selected?.category==='artifact'&&selected.artifact){const a=selected.artifact,f=cat?.artifactFortune||model.collectionEconomy?.artifactV88?.fortune||{};return `<section class="v88-artifact-panel"><header><div><span>PHÁP BẢO V88 · ${selected.active?'ĐANG TRANG BỊ':'SỞ HỮU'}</span><h3>${esc(selected.name)}</h3><small>${esc(a.role||'Pháp Bảo')}</small></div><b>Luyện Hóa ${num(a.refinementLevel||1)}/100 · Bảo Giai ${esc(a.grade||'I')}</b></header><div class="v88-artifact-grid"><article><span>BẢO TÍNH</span><b>${esc(a.passive?.name||'')}</b><small>${esc(a.passive?.description||'')}</small></article><article><span>PHÁP KỸ · ${num(a.skill?.baoQiCost||0)} BẢO KHÍ</span><b>${esc(a.skill?.name||'')}</b><small>${esc(a.skill?.description||'')}</small><em>CD ${num(a.skill?.cooldown||0,1)}s · tự kích hoạt</em></article></div>${v88ArtifactSlotBoard(selected,cat)}${v88UpgradeGuide(selected,cat)}<div class="v88-fortune"><strong>Bảo Vận · ${num(f.points||0)} điểm</strong><span>${num(f.owned||0)}/${num(f.total||12)} Pháp Bảo sở hữu đóng góp.</span><small>Pháp Kỹ +${num(f.artifactPowerPct||0,2)}% · sinh Bảo Khí +${num(f.baoQiGainPct||0,2)}% · hồi Pháp Kỹ +${num(f.cooldownRecoveryPct||0,2)}%</small></div></section>`;}
  if(selected?.category==='relic'&&selected.relic){const r=selected.relic;return `<section class="v88-artifact-panel relic"><header><div><span>CHÍ BẢO V88 · ${selected.active?'ĐANG KÍCH HOẠT':'SỞ HỮU'}</span><h3>${esc(selected.name)}</h3><small>${esc(r.role||'Luật build')}</small></div><b>Luyện Hóa ${num(r.refinementLevel||1)}/100 · Bảo Giai ${esc(r.gradeLabel||'I')}</b></header><div class="v88-artifact-grid one"><article><span>LUẬT CHÍ BẢO</span><b>${esc(r.ruleName||'')}</b><small>${esc(r.ruleDescription||'')}</small></article></div>${v88UpgradeGuide(selected,cat)}<footer>Chí Bảo có đúng 1 ô riêng. Nó thay đổi luật vận hành build; không cộng gói stat combat generic.</footer></section>`;}return'';
}
function v88InventoryArtifactBody(){
  const ce=model.collectionEconomy||{},root=ce.artifactV88||{},artifactCat=(ce.categories||[]).find(x=>x.category==='artifact'),relicCat=(ce.categories||[]).find(x=>x.category==='relic'),arts=(artifactCat?.items||[]).filter(x=>x.progress?.owned),relics=(relicCat?.items||[]).filter(x=>x.progress?.owned),byId=new Map((artifactCat?.items||[]).map(x=>[x.id,x])),cap=Number(artifactCat?.artifactSlotCapacity??root.slotCapacity??0),activeIds=root.activeArtifactIds||arts.filter(x=>x.active).map(x=>x.id),activeRelicId=root.activeRelicId||ce.active?.relicId,next=root.nextSlotUnlock;
  const slots=[0,1,2,3].map(i=>{const unlocked=i<cap,x=byId.get(activeIds[i]);return `<article class="v88-inventory-slot ${unlocked?'unlocked':'locked'}"><span>Ô ${i+1}</span><b>${x?esc(x.name):(unlocked?'Trống':`Khóa · ${v88ArtifactSlotUnlockLabel(i)}`)}</b><small>${x?`LH ${num(x.progress?.level||1)} · Giai ${esc(x.artifact?.grade||'I')} · ${esc(x.artifact?.skill?.name||'Pháp Kỹ')}`:(unlocked?'Chưa trang bị':`Mở ở ${v88ArtifactSlotUnlockLabel(i)}`)}</small>${x?`<button class="button ghost" data-collection-unequip-v12325="${esc(x.id)}">Tháo</button>`:''}</article>`;}).join('');
  const rows=arts.map(x=>{const a=x.artifact||{},p=x.progress||{},idx=activeIds.indexOf(x.id),free=activeIds.length<cap?activeIds.length:-1;let controls='';if(idx>=0)controls=`<button class="button ghost" data-collection-unequip-v12325="${esc(x.id)}">Đang ở Ô ${idx+1} · Tháo</button>`;else if(cap<=0)controls='<button class="button" disabled>Trúc Cơ mở Pháp Bảo</button>';else if(free>=0)controls=`<button class="button gold" data-artifact-equip-slot-v88="${esc(x.id)}" data-artifact-slot-index="${free}">Trang bị vào Ô ${free+1}</button>`;else controls=`<div class="v88-replace-slots"><small>Đổi vào</small>${[...Array(cap).keys()].map(i=>`<button data-artifact-equip-slot-v88="${esc(x.id)}" data-artifact-slot-index="${i}">Ô ${i+1}</button>`).join('')}</div>`;return `<div class="v1086-artifact-row ${idx>=0?'active':''}"><div><strong>${esc(x.name)}</strong><span>Luyện Hóa ${num(p.level||1)}/100 · Bảo Giai ${esc(a.grade||'I')} · ${esc(a.skill?.name||'Pháp Kỹ')} · ${num(a.skill?.baoQiCost||0)} Bảo Khí</span></div>${controls}</div>`;}).join('')||`<div class="v1086-empty-state"><i>◇</i><strong>Chưa có Pháp Bảo</strong><span>Pháp Bảo/mảnh đến từ Gacha; Phó Bản farm Luyện Bảo Tinh Hoa và Thiên Tinh Pháp Bảo.</span></div>`;
  const activeRelic=relics.find(x=>x.id===activeRelicId),relicRows=relics.map(x=>`<div class="v1086-artifact-row relic ${x.id===activeRelicId?'active':''}"><div><strong>${esc(x.name)}</strong><span>${esc(x.relic?.ruleName||'Luật Chí Bảo')} · Luyện Hóa ${num(x.progress?.level||1)}/100 · Bảo Giai ${esc(x.relic?.gradeLabel||'I')}</span></div><button class="button ${x.id===activeRelicId?'ghost':'gold'}" data-collection-${x.id===activeRelicId?'unequip':'equip'}-v12325="${esc(x.id)}">${x.id===activeRelicId?'Gỡ':'Kích Hoạt'}</button></div>`).join('')||'<div class="v1086-empty-state"><i>✧</i><strong>Chưa có Chí Bảo</strong><span>Chí Bảo có 1 ô riêng và thay đổi luật build.</span></div>';
  return `<section class="v88-inventory-loadout"><header><div><span>V107 · PHÁP BẢO CANONICAL</span><strong>${Math.min(activeIds.length,cap)}/${cap} ô đang dùng</strong></div><small>${next?`Ô ${num(next.slot)} mở ở ${esc(next.realm)}`:'Đã mở đủ 4 ô'} · Luyện Bảo Các Lv${num(root.facilityLevel||1)} giảm ${num(root.refinementDiscountPct||0)}% Luyện Hóa · Saved Loadout lưu đúng Pháp Bảo + Chí Bảo</small></header><div class="v88-inventory-slot-grid">${slots}</div><div class="v88-relic-slot"><span>CHÍ BẢO · 1 Ô RIÊNG</span><b>${activeRelic?esc(activeRelic.name):'Chưa kích hoạt'}</b><small>${activeRelic?esc(activeRelic.relic?.ruleName||'Luật Chí Bảo'):'Không chiếm ô Pháp Bảo.'}</small></div><div class="v88-sheet-actions"><button class="button gold" data-dongfu-section="artifact">Đến Luyện Bảo Các</button><button class="button ghost" data-open-collection-category="artifact">Đi Gacha Pháp Bảo</button></div><h3>Pháp Bảo sở hữu</h3>${rows}<h3>Chí Bảo sở hữu</h3>${relicRows}</section>`;
}

function v2328WorkshopCollection(section){
  const ce=model.collectionEconomy||{},cats=ce.categories||[];
  const map={scripture:{title:'Tàng Kinh Các',facility:'scripture',cats:['manual','heart'],subtitle:'Công Pháp + Tâm Pháp · cường hóa, tiến bậc và collection.'},artifact:{title:'Luyện Bảo Các',facility:'artifact',cats:['artifact','relic'],subtitle:'12 Pháp Bảo + 8 Chí Bảo · Luyện Hóa 1–100 + Bảo Giai I–V · Pháp Kỹ dùng Bảo Khí.'},beast:{title:'Linh Thú Viên',facility:'beast',cats:['pet'],subtitle:'Nuôi dưỡng 8 Linh Thú · Linh Khế toàn bộ · chọn 1 con trợ chiến.'},companion:{title:'Tri Kỷ Các',facility:'companion',cats:['companion'],subtitle:'8 Tri Kỷ · 1 Đồng Hành · Thân Mật 1–100 + Duyên I–V · Sở Trường, Trợ Chiến, Hộ Đạo và Tâm Ý.'},bloodline:{title:'Huyết Trì',facility:'bloodline',cats:['bloodline'],subtitle:'Tăng Độ Thuần → đột phá phẩm Huyết Mạch.'},physique:{title:'Luyện Thể Thất',facility:'physique',cats:['physique'],subtitle:'Sơ Tỉnh → Nhập Môn → Tiểu Thành → Đại Thành → Viên Mãn.'}};
  const cfg=map[section]||map.scripture,available=cfg.cats.map(id=>cats.find(x=>x.category===id)).filter(Boolean);
  let cat=available.find(x=>x.category===dongfuUi.category)||available[0];if(!cat)return page(cfg.title,cfg.subtitle,'<div class="empty">Chưa có dữ liệu workshop.</div>');
  dongfuUi.category=cat.category;const allItems=cat.items||[],manualView=cat.category==='manual'?v127ManualStageContext(allItems,dongfuUi,'data-workshop-manual-realm'): {items:allItems,selector:''},items=manualView.items,owned=items.filter(x=>x.progress?.owned);
  if(!dongfuUi.selectedId||!items.some(x=>x.id===dongfuUi.selectedId))dongfuUi.selectedId=(owned[0]||items[0])?.id||null;
  const selected=items.find(x=>x.id===dongfuUi.selectedId)||items[0],sp=selected?.progress||{},idx=Math.max(0,items.indexOf(selected));
  const tabs=available.length>1?`<div class="v2328-workshop-tabs">${available.map(x=>`<button class="${x.category===cat.category?'active':''}" data-workshop-category="${esc(x.category)}">${esc(x.label)} <small>${num(x.owned)}/${num(x.total)}</small></button>`).join('')}</div>`:'';
  const cards=items.slice(0,60).map((x,i)=>{const p=x.progress||{},beast=x.spiritBeast;let label=x.category==='manual'?(!x.unlocked?`Mở ở ${esc(x.realmName||'cảnh giới sau')}`:!p.owned?`${num(p.specificFragments||0)}/${num(x.composeCost||0)} mảnh`:v127ManualProgressLabel(x,p)):!p.owned?`${num(p.specificFragments||0)}/${num(x.composeCost||0)} mảnh`:x.category==='bloodline'?`${esc(p.bloodlineGrade||'Phàm')} · ${num(p.purity||0)}%`:x.category==='physique'?esc(p.physiqueStage||'Sơ Tỉnh'):x.category==='heart'?(x.heart?.learned?`${esc(x.heart.gradeLabel||x.gradeLabel)} · Lv${num(x.heart.level||1)}`:'Chưa lĩnh ngộ'):x.category==='companion'?`Thân Mật ${num(x.confidant?.intimacy||p.level||1)}/100 · Duyên ${esc(x.confidant?.fateLabel||'I')}`:x.category==='pet'?`Lv${num(p.level||1)}/${num(beast?.levelCap||50)} · Huyết Mạch ${num(p.advance||0)}/${num(beast?.maxBloodline||5)}`:x.category==='artifact'?`Luyện Hóa ${num(p.level||1)}/100 · Bảo Giai ${esc(x.artifact?.grade||'I')}`:x.category==='relic'?`Luyện Hóa ${num(p.level||1)}/100 · Bảo Giai ${esc(x.relic?.gradeLabel||'I')}`:`Lv${num(p.level||1)} · +${num(p.advance||0)}`;const cardArt=beast?.asset||v2328WorkshopArt(x.category,i);return `<button class="v2326-item-card grade-${esc(x.grade||'mundane')} ${x.id===selected?.id?'selected':''} ${!p.owned?'locked':''}" data-workshop-item="${esc(x.id)}"><div class="v2326-item-art"><img src="${cardArt}" alt="${esc(x.name)}" loading="lazy" decoding="async"><span class="v2326-grade">${esc(x.gradeLabel||'Phàm')}</span>${x.active?`<i class="v2326-active">${x.category==='companion'?'Đồng Hành':x.category==='artifact'?'Trang Bị':x.category==='relic'?'Chí Bảo':'Trợ Chiến'}</i>`:''}</div><strong>${esc(x.name)}</strong><small>${label}</small></button>`;}).join('');
  let detail='';if(selected){let actions='';
    if(!sp.owned&&selected.category!=='heart')actions+=selected.category==='manual'&&!selected.unlocked?`<button class="button" disabled>Mở ở ${esc(selected.realmName||'cảnh giới sau')}</button>`:`<button class="button gold" data-collection-compose-v12326="${esc(selected.id)}" ${Number(sp.specificFragments||0)<Number(selected.composeCost||Infinity)?'disabled':''}>Ghép · ${num(selected.composeCost||0)} Mảnh</button>`;
    if(selected.category==='heart'&&selected.heart?.learned)actions+=`<button class="button ghost" data-heart-strengthen-v12325="${esc(selected.linkedPassiveId)}" ${Number(selected.heart.level||1)>=20?'disabled':''}>Tu Luyện</button><button class="button gold" data-heart-advance-v12325="${esc(selected.linkedPassiveId)}" ${Number(selected.heart.level||1)<20?'disabled':''}>Tiến Bậc</button>`;
    else if(sp.owned&&['manual','artifact','relic','pet','companion'].includes(selected.category)){const strengthenCost=Number(selected.strengthenCost||0),advanceCost=Number(selected.advanceCost||0),essenceCost=Number(selected.ascensionCost||0),genericOwned=Number(cat.genericFragments||0),essenceOwned=Number(cat.ascensionEssence||0),fragmentOwned=Number(sp.specificFragments||0);if(selected.category==='pet')actions+=`<button class="button ghost" data-collection-strengthen-v12325="${esc(selected.id)}" ${Number(sp.level||1)>=Number(selected.spiritBeast?.levelCap||50)||genericOwned<strengthenCost?'disabled':''}>Nuôi Dưỡng · ${num(strengthenCost)} ${esc(cat.genericFragmentName||'nguyên liệu')}</button><button class="button gold" data-collection-advance-v12325="${esc(selected.id)}" ${Number(sp.advance||0)>=Number(selected.spiritBeast?.maxBloodline||5)||fragmentOwned<advanceCost||essenceOwned<essenceCost?'disabled':''}>Đột Phá Huyết Mạch · ${num(advanceCost)} Mảnh${essenceCost?` + ${num(essenceCost)} ${esc(cat.ascensionName||'Đột phá')}`:''}</button>`;else actions+=selected.category==='manual'?v127ManualUpgradeControls(selected,cat):selected.category==='companion'?`<button class="button ghost" data-collection-strengthen-v12325="${esc(selected.id)}" ${Number(sp.level||1)>=100||genericOwned<strengthenCost?'disabled':''}>Tăng Thân Mật · ${num(strengthenCost)} ${esc(cat.genericFragmentName||'nguyên liệu')}</button><button class="button ghost" data-collection-advance-v12325="${esc(selected.id)}" ${Number(sp.advance||0)>=4||fragmentOwned<advanceCost?'disabled':''}>Kết Duyên ${esc(selected.confidant?.fateLabel||'I')} → ${esc(['II','III','IV','V'][Math.min(3,Number(sp.advance||0))]||'V')} · ${num(advanceCost)} Mảnh</button>`:selected.category==='artifact'||selected.category==='relic'?`<button class="button ghost" data-collection-strengthen-v12325="${esc(selected.id)}" ${Number(sp.level||1)>=100||genericOwned<strengthenCost?'disabled':''}>Luyện Hóa +1 · ${num(strengthenCost)} ${esc(cat.genericFragmentName||'nguyên liệu')}</button><button class="button gold" data-collection-advance-v12325="${esc(selected.id)}" ${Number(sp.advance||0)>=4||fragmentOwned<advanceCost||essenceOwned<essenceCost?'disabled':''}>Bảo Giai ${esc(selected.category==='artifact'?selected.artifact?.grade:selected.relic?.gradeLabel||'I')} → ${Number(sp.advance||0)>=4?'MAX':esc(['II','III','IV','V'][Math.min(3,Number(sp.advance||0))]||'V')} · ${num(advanceCost)} Mảnh + ${num(essenceCost)} ${esc(cat.ascensionName||'Đột phá')}</button>`:`<button class="button ghost" data-collection-strengthen-v12325="${esc(selected.id)}">Cường Hóa · ${num(strengthenCost)} ${esc(cat.genericFragmentName||'nguyên liệu')}</button><button class="button ghost" data-collection-advance-v12325="${esc(selected.id)}">Tiến Giai · ${num(advanceCost)} Mảnh${essenceCost?` + ${num(essenceCost)} ${esc(cat.ascensionName||'Đột phá')}`:''}</button>`;}
    if(sp.owned&&['relic','pet','companion'].includes(selected.category))actions+=`<button class="button ${selected.active?'ghost':'gold'}" data-collection-${selected.active?'unequip':'equip'}-v12325="${esc(selected.id)}">${selected.category==='pet'?(selected.active?'Ngừng Trợ Chiến':'Chọn Trợ Chiến'):selected.category==='companion'?(selected.active?'Ngừng Đồng Hành':'Chọn Đồng Hành'):selected.category==='relic'?(selected.active?'Gỡ Chí Bảo':'Kích Hoạt Chí Bảo'):(selected.active?'Rời đội hình':'Trang Bị / Ra Trận')}</button>`;
    if(sp.owned&&selected.category==='bloodline')actions+=selected.active?`<button class="button ghost" data-blood-purify>Tinh Luyện +10% Độ Thuần</button><button class="button gold" data-blood-advance>Đột Phá Phẩm</button><button class="button ghost" data-blood-advance-protected>Đột Phá + Hộ Huyết</button>`:`<button class="button gold" data-origin-activate-v12326="${esc(selected.id)}" data-origin-category="bloodline">Chọn Huyết Mạch này</button>`;
    if(sp.owned&&selected.category==='physique')actions+=selected.active?`<button class="button gold" data-physique-advance>Tu Luyện / Đột Phá Mốc</button>`:`<button class="button gold" data-origin-activate-v12326="${esc(selected.id)}" data-origin-category="physique">Chọn Thể Chất này</button>`;
    let special='';
    if(selected.category==='pet'&&sp.owned){const b=selected.spiritBeast||{},bond=b.bond||{},stats=b.stats||{},skills=[b.passive,...(b.actives||[])].filter(Boolean);special=`<section class="v86-beast-panel"><header><div><span>LINH THÚ V86 · ${esc(b.roleLabel||'Trợ chiến')}</span><h3>${esc(selected.name)}</h3></div><b>Huyết Mạch ${num(b.bloodline||0)}/${num(b.maxBloodline||5)}</b></header><div class="v86-beast-stats"><i><small>Khí Huyết</small><b>${num(stats.hp||0)}</b></i><i><small>Công</small><b>${num(stats.attack||0)}</b></i><i><small>Phòng</small><b>${num(stats.defense||0)}</b></i></div><div class="v86-beast-bond"><strong>Linh Khế luôn có hiệu lực</strong><span>+${num(bond.powerPct||0,2)}% Công Lực</span><span>+${num(bond.bodyPct||0,2)}% Thể Phách</span><span>+${num(bond.defensePct||0,2)}% Phòng Ngự</span><small>Kể cả khi không trợ chiến. Mỗi species chỉ tính một lần.</small></div><div class="v86-beast-skills">${skills.map((sk,i)=>`<article class="${sk.unlocked?'unlocked':'locked'}"><span>${i===0?'NỘI TẠI':`SKILL ${i}`}</span><b>${esc(sk.name||'Kỹ năng')}</b><small>${sk.unlocked?esc(sk.description||''):`Mở ở Huyết Mạch ${num(sk.unlockBloodline||0)}`}</small></article>`).join('')}</div></section>`;}
    if(selected.category==='manual'&&sp.owned){const names={attackFlat:'Công',powerPct:'% Công',physiqueFlat:'Thể Phách',hpFlat:'HP',hpPct:'% HP',defenseFlat:'Phòng',defensePct:'% Phòng',damageReductionPct:'Giảm Sát Thương',critPct:'Bạo Kích',critDamagePct:'Bạo Thương',heartPct:'Hội Tâm',heartDamagePct:'Hội Tâm Damage',armorPenPct:'Xuyên Giáp',breakEffectPct:'Phá Thế',accuracyPct:'Chính Xác',dodgePct:'Né',controlPct:'Khống Chế',controlResistPct:'Kháng Khống',healingPct:'Hồi Phục',shieldPct:'Khiên',cultivationFlatPer15s:'Tu Vi /15 giây'};const effective=selected.effectiveStats||[];special=`<section class="v127-manual-panel"><header><span>${esc(selected.realmName||'Công Pháp')} · ${esc(selected.manualRole||'Tu luyện')}</span><strong>Hiệu lực hiện tại · ${v127ManualProgressLabel(selected,sp)}</strong><small>Mọi Công Pháp đã lĩnh ngộ tiếp tục cộng dồn ở các cảnh giới sau.</small></header><div>${effective.map(st=>`<i><small>${esc(names[st.id]||st.id)}</small><b>${v127ManualStatValue(st)}</b></i>`).join('')}</div>${v127ManualGateDetail(selected,cat)}</section>`;}if(selected.category==='companion'&&sp.owned)special=v87ConfidantPanel(selected,cat);if((selected.category==='artifact'||selected.category==='relic')&&sp.owned)special=v88ArtifactPanel(selected,cat);
    const mainProgress=selected.category==='bloodline'?`Độ Thuần ${num(sp.purity||0)}% · Phẩm ${esc(sp.bloodlineGrade||'Phàm')}`:selected.category==='physique'?`Mốc hiện tại: ${esc(sp.physiqueStage||'Sơ Tỉnh')}`:selected.category==='heart'?`Tâm Pháp ${esc(selected.heart?.gradeLabel||selected.gradeLabel)} · Lv${num(selected.heart?.level||1)}`:selected.category==='companion'?`Thân Mật ${num(selected.confidant?.intimacy||sp.level||1)}/100 · Duyên ${esc(selected.confidant?.fateLabel||'I')}`:selected.category==='pet'?`Lv${num(sp.level||1)}/${num(selected.spiritBeast?.levelCap||50)} · Huyết Mạch ${num(sp.advance||0)}/${num(selected.spiritBeast?.maxBloodline||5)}`:selected.category==='artifact'?`Luyện Hóa ${num(sp.level||1)}/100 · Bảo Giai ${esc(selected.artifact?.grade||'I')}`:selected.category==='relic'?`Luyện Hóa ${num(sp.level||1)}/100 · Bảo Giai ${esc(selected.relic?.gradeLabel||'I')}`:selected.category==='manual'?v127ManualProgressLabel(selected,sp):`Lv${num(sp.level||1)} · Tiến giai ${num(sp.advance||0)}`;
    detail=`<aside class="v2326-detail grade-${esc(selected.grade||'mundane')}"><div class="v2326-detail-hero"><img src="${selected.spiritBeast?.asset||v2328WorkshopArt(selected.category,idx)}" alt="${esc(selected.name)}"><div><span>${esc(selected.gradeLabel||'Phàm')} · ${esc(cat.label)}</span><h2>${esc(selected.name)}</h2><p>${esc(selected.description||cat.role||'')}</p></div></div><div class="v2326-progression"><div><small>Tiến độ</small><b>${mainProgress}</b></div><div><small>${esc(cat.genericFragmentName||'Nguyên liệu')}</small><b>${num(cat.genericFragments||0)}</b></div><div><small>${esc(cat.ascensionName||'Đột phá')}</small><b>${num(cat.ascensionEssence||0)}</b></div><div><small>Mảnh riêng</small><b>${num(sp.specificFragments||0)} · chỉ Gacha</b></div></div>${special}<div class="tag-row">${actions||'<span class="muted small">Chưa có thao tác.</span>'}</div></aside>`;
  }
  const lv=v2328FacilityLevel(cfg.facility),bond=cat.category==='pet'?cat.spiritBeastBond:null;const bondOverview=bond?`<section class="v86-bond-overview"><div><span>TỔNG LINH KHẾ · ${num(bond.owned||0)}/${num(bond.total||8)} LINH THÚ</span><strong>Mọi Linh Thú sở hữu đều trợ lực cho chủ nhân</strong></div><b>+${num(bond.powerPct||0,2)}% Công · +${num(bond.bodyPct||0,2)}% Thể · +${num(bond.defensePct||0,2)}% Phòng</b></section>`:'';return page(cfg.title,`${cfg.subtitle} · Công trình Lv.${lv}`,`<section class="v2328-workshop"><div class="v2328-workshop-head"><button data-dongfu-section="home">← Động Phủ</button><div><span>ĐỘNG PHỦ · PRODUCTION</span><h2>${esc(cfg.title)}</h2></div><div>${v2328FacilityUpgrade(cfg.facility)}<button class="button ghost" data-open-collection-category="${esc(cat.category)}">Đi Gacha ${esc(cat.label)}</button><button class="button ghost" data-farm-category="${esc(cat.category)}">Đi Farm</button></div></div>${tabs}${manualView.selector}${bondOverview}<div class="v2326-collection-layout"><section class="v2326-item-grid">${cards||'<div class="empty">Chưa có item.</div>'}</section>${detail}</div></section>`);
}
function v2328AlchemyWorkshop(){
  const a=model.alchemy||{},allRecipes=a.recipes||[],busy=a.furnaces?.queues||[],unlocked=Number(a.furnaces?.unlocked||1),busySet=new Set(busy.map(x=>Number(x.furnaceIndex))),free=[...Array(unlocked).keys()].find(i=>!busySet.has(i));
  const familyLabels={cultivation:'Tu Vi',daoSuy:'Tĩnh Suy',injury:'Trị Thương',lifespan:'Thọ Nguyên',lifePower:'Công Lực đời',lifeBody:'Thể Phách đời',lifeDefense:'Phòng Ngự đời',buffPower:'Chiến Ý',buffGuard:'Kim Cương',buffSpirit:'Tụ Nguyên',forbidden:'Cấm Đan',daoPower:'Công Lực Đạo Đan',daoBody:'Thể Phách Đạo Đan',daoDefense:'Phòng Ngự Đạo Đan'};
  const familyIds=[...new Set(allRecipes.map(x=>x.family))];dongfuUi.alchemyFamily=dongfuUi.alchemyFamily||'all';
  const recipes=dongfuUi.alchemyFamily==='all'?allRecipes:allRecipes.filter(x=>x.family===dongfuUi.alchemyFamily);
  if(!dongfuUi.alchemyRecipeId||!recipes.some(x=>x.id===dongfuUi.alchemyRecipeId))dongfuUi.alchemyRecipeId=recipes[0]?.id||null;const r=recipes.find(x=>x.id===dongfuUi.alchemyRecipeId)||recipes[0];
  const familyFilter=`<label class="v85-alchemy-filter"><span>Họ Đan</span><select data-alchemy-family-filter><option value="all">Tất cả Đan Phương</option>${familyIds.map(id=>`<option value="${esc(id)}" ${dongfuUi.alchemyFamily===id?'selected':''}>${esc(familyLabels[id]||id)}</option>`).join('')}</select></label>`;
  const cards=recipes.map(x=>`<button class="v2328-recipe-card ${x.id===r?.id?'selected':''} ${!x.known?'v85-recipe-locked':''}" data-alchemy-recipe="${esc(x.id)}"><img src="/assets/hubs/alchemy.jpg" alt="" loading="lazy" decoding="async"><span>T${num(x.realmTier)} · ${num(x.baseCraftMinutes,1)} phút gốc</span><strong>${esc(x.name)}</strong><small>${x.known?`Mastery ${num(x.progress?.mastery||0)} · Chuyên tinh ${num(x.progress?.specializationLevel||0)}%`:`Đan Phương chưa lĩnh ngộ · ${num(x.researchCost?.alchemyEssence||0)} Dược Tính`}</small><i>${!x.known?'Cần lĩnh ngộ':x.canCraftBase?'Đủ nguyên liệu':'Thiếu nguyên liệu'}</i></button>`).join('');
  let detail='';if(r){const ingredients=(r.ingredients||[]).map(x=>`<div><span>${esc(x.resourceId.replace('resource.','').replaceAll('_',' '))}</span><b>${num(x.available||0)} / ${num(x.quantity||0)}</b></div>`).join('');const batches=r.known?(r.allowedBatchSizes||[]).map(b=>`<button class="button gold" data-alchemy-start data-family="${esc(r.family)}" data-tier="${num(r.realmTier)}" data-batch="${num(b)}" data-furnace="${free??0}" ${free===undefined||!r.canCraftBase?'disabled':''}>Luyện ×${num(b)}</button>`).join(''):`<button class="button gold" data-alchemy-learn-recipe="${esc(r.id)}" ${!r.canResearch?'disabled':''}>Lĩnh Ngộ · ${num(r.researchCost?.alchemyEssence||0)} Dược Tính Tinh Hoa</button>`;detail=`<aside class="v2328-production-detail ${!r.known?'v85-recipe-detail-locked':''}"><img src="/assets/hubs/alchemy.jpg" alt=""><span>${r.known?'ĐAN PHƯƠNG ĐÃ LĨNH NGỘ':'ĐAN PHƯƠNG CHƯA LĨNH NGỘ'} · ${esc(a.rankName||'')}</span><h2>${esc(r.name)}</h2><p>${r.known?`Thời gian gốc ${num(r.baseCraftMinutes,1)} phút · giảm thời gian ${num(r.craftModifiers?.timeReductionPct||0,1)}% · sản lượng ${num(r.craftModifiers?.yieldPct||100,1)}%.`:`Đan Đạo chỉ quyết định đủ tư cách. Muốn sản xuất phải lĩnh ngộ Đan Phương; tri thức đã học được giữ qua Luân Hồi.`}</p><div class="v2328-ingredient-list">${ingredients}</div><div class="v2328-quality"><b>Tỷ lệ phẩm chất hiện tại</b><span>Hạ ${num(r.qualityWeights?.low||0,1)}%</span><span>Trung ${num(r.qualityWeights?.mid||0,1)}%</span><span>Thượng ${num(r.qualityWeights?.high||0,1)}%</span><span>Cực ${num(r.qualityWeights?.supreme||0,1)}%</span><small>Phẩm chất dùng RNG thật sau Đan Đạo + Mastery + Chuyên Tinh + Đan Phòng.</small></div><div class="tag-row">${batches}</div></aside>`;}
  const queues=busy.map(q=>`<div class="v2328-queue-row"><b>Lò ${num(Number(q.furnaceIndex)+1)}</b><span>${esc(q.recipeId)} ×${num(q.batchSize)}</span><em>${durationText(q.durationRealSeconds||0)} / mẻ</em></div>`).join('')||'<div class="empty">Các lò đang trống.</div>';
  const life=a.life||{},facility=a.facility||{},fm=facility.modifiers||{},promo=a.promotion||{},knowledge=a.recipeKnowledge||{};const buff=life.activeBuff;
  const quota=`<section class="v85-alchemy-rules"><div><small>Tu Vi Đan · đại cảnh</small><b>${num(life.cultivationPillsUsedCurrentMajorRealm||0)}/${num(life.cultivationPillCapPerMajorRealm||20)}</b></div><div><small>Tĩnh Suy Đan · đại cảnh</small><b>${num(life.daoSuyPillsUsedCurrentMajorRealm||0)}/${num(life.daoSuyPillCapPerMajorRealm||2)}</b></div><div><small>Đan Buff · hôm nay</small><b>${num(life.buffDaily?.used||0)}/${num(life.buffPillDailyCap||5)}</b></div><div><small>Stat Đan · family/tier/đời</small><b>${num(life.temporaryStatPillCapPerTier||50)} viên</b></div><div><small>Đan Phòng Lv${num(facility.level||1)}</small><b>-${num(fm.timeReductionPct||0,0)}% thời gian</b></div></section>`;
  const buffHtml=buff?`<section class="v85-active-pill"><span>ĐAN BUFF ĐANG HIỆU LỰC</span><b>${esc(familyLabels[buff.family]||buff.family)}</b><small>Còn ${durationText(buff.remainingRealSeconds||0)} · chỉ duy trì 1 Đan buff cùng lúc.</small></section>`:'';
  const pillRows=(a.pills||[]).map(p=>{const isBuff=['buffPower','buffGuard','buffSpirit','forbidden'].includes(p.family);const isStat=['lifePower','lifeBody','lifeDefense'].includes(p.family);const capInfo=p.family==='cultivation'?`${num(life.cultivationPillsUsedCurrentMajorRealm||0)}/${num(life.cultivationPillCapPerMajorRealm||20)} lượt`:p.family==='daoSuy'?`${num(life.daoSuyPillsUsedCurrentMajorRealm||0)}/${num(life.daoSuyPillCapPerMajorRealm||2)} đại cảnh`:isBuff?`${num(life.buffDaily?.used||0)}/${num(life.buffPillDailyCap||5)} hôm nay`:isStat?`${num(p.lifeStatUsed||0)}/${num(life.temporaryStatPillCapPerTier||50)} đời này`:p.realmEfficiency<1?`Hiệu suất ${num((p.realmEfficiency||0)*100,0)}%`:'Đúng giai';return `<article class="v85-pill-card quality-${esc(p.quality)}"><div><span>${esc(familyLabels[p.family]||p.family)} · T${num(p.realmTier)}</span><strong>${esc(p.name)}</strong><small>${esc(capInfo)} · Có ${num(p.count)}</small></div><button class="button ${p.realmEfficiency<=0?'ghost':'gold'}" data-alchemy-use-pill="${esc(p.resourceId)}" ${p.realmEfficiency<=0?'disabled':''}>${p.family==='injury'?'Trị Thương':p.family==='daoSuy'?'Giảm Suy':isBuff?'Uống Buff':'Dùng 1'}</button></article>`;}).join('')||'<div class="empty">Chưa có Đan thành phẩm trong hành trang.</div>';
  const promotionHtml=`<section class="v85-alchemy-promotion"><div><span>ĐAN ĐẠO · ${esc(a.turnName||'')}</span><b>${num(a.turnExp||0,0)} / ${num(a.turnExpRequired||0,0)} EXP</b><small>${promo.ready?'Đủ điều kiện khảo hạch Đan Đạo.':esc((promo.reasons||[])[0]||'Luyện đan để tăng Đan Đạo và Mastery.')}</small></div><button class="button gold" data-alchemy-promote ${!promo.ready?'disabled':''}>Đột Phá Đan Đạo</button></section>`;
  const g=a.garden||{},plots=g.plots||[],seeds=g.seeds||[],slots=Number(g.slots||3);if(!dongfuUi.alchemyGardenSeedId||!seeds.some(x=>x.resourceId===dongfuUi.alchemyGardenSeedId))dongfuUi.alchemyGardenSeedId=seeds[0]?.resourceId||null;const selectedSeed=seeds.find(x=>x.resourceId===dongfuUi.alchemyGardenSeedId)||seeds[0];
  const seedSelect=`<label class="v85-garden-seed"><span>Linh Chủng</span><select data-alchemy-garden-seed ${!seeds.length?'disabled':''}>${seeds.length?seeds.map(x=>`<option value="${esc(x.resourceId)}" ${x.resourceId===selectedSeed?.resourceId?'selected':''}>T${num(x.realmTier)} · ${esc(x.name)} · có ${num(x.available)}</option>`).join(''):'<option>Chưa có Linh Thực làm giống</option>'}</select></label>`;
  const plotBySlot=new Map(plots.map(x=>[Number(x.slot),x]));const gardenCards=[...Array(slots).keys()].map(slot=>{const p=plotBySlot.get(slot);if(!p)return `<article class="v85-garden-plot empty-plot"><span>Ô ${slot+1}</span><b>Đất trống</b><small>${selectedSeed?'Tiêu 1 Linh Thực làm Linh Chủng.':'Kiếm Linh Thực từ PvE/Phường Thị trước.'}</small><button class="button ghost" data-alchemy-garden-plant="${slot}" ${!selectedSeed?'disabled':''}>Gieo Trồng</button></article>`;const stageLabel={growing:'Sinh Trưởng',mature:'Thành Thục',old:'Lâu Năm',ancient:'Cổ Linh'}[p.stage]||p.stage;const ready=p.stage!=='growing';return `<article class="v85-garden-plot stage-${esc(p.stage)}"><span>Ô ${slot+1} · T${num(p.realmTier)}</span><b>${esc(p.name)}</b><small>${esc(stageLabel)} · ${p.stage==='growing'?`còn ${durationText(p.remainingRealSeconds||0)}`:`sản lượng nền ×${num(p.yield||0)} · có thể dưỡng tiếp`}</small><div class="v85-garden-progress"><i style="width:${Math.min(100,Math.max(0,Number(p.progressPct||0)))}%"></i></div><button class="button ${ready?'gold':'ghost'}" data-alchemy-garden-harvest="${slot}" ${!ready?'disabled':''}>${ready?'Thu Hoạch':'Đang lớn'}</button></article>`;}).join('');
  const gardenHtml=`<section class="v85-garden"><header><div><span>DƯỢC VIÊN · NẰM TRONG ĐAN PHÒNG</span><h3>Linh Thực · ${num(plots.length)}/${num(slots)} ô đang trồng</h3><small>Không Tetris, không rarity hạt. Thành Thục có thể thu; dưỡng ×2 thời gian thành Lâu Năm, ×4 thành Cổ Linh để tăng sản lượng.</small></div>${seedSelect}</header><div class="v85-garden-grid">${gardenCards}</div><footer>Đã gieo ${num(g.telemetry?.planted||0)} · thu ${num(g.telemetry?.harvested||0)} lứa · ${num(g.telemetry?.herbsHarvested||0)} Linh Thực. Đan Phòng cấp cao mở thêm ô và rút ngắn thời gian sinh trưởng.</footer></section>`;
  return page('Đan Phòng',`Đan Dược canonical · không có Đan hồi HP/CN · ${num(busy.length)}/${num(unlocked)} lò đang bận.`,`<section class="v2328-workshop v85-alchemy"><div class="v2328-workshop-head"><button data-dongfu-section="home">← Động Phủ</button><div><span>ALCHEMY ECOSYSTEM · V85</span><h2>Đan Phòng · ${esc(a.rankName||'Đan Đạo')}</h2></div><div>${v2328FacilityUpgrade('alchemy')}</div></div>${promotionHtml}${quota}${buffHtml}${gardenHtml}<section class="v2328-queue"><h3>Hàng Chờ Luyện Đan</h3>${queues}</section><div class="v85-alchemy-toolbar">${familyFilter}<span>${num(knowledge.known||0)} Đan Phương đã lĩnh ngộ · ${num(knowledge.availableEssence||0)} Dược Tính Tinh Hoa</span></div><div class="v2328-production-layout"><section class="v2328-recipe-grid">${cards||'<div class="empty">Chưa có Đan Phương phù hợp.</div>'}</section>${detail}</div><section class="v85-pill-inventory"><header><div><span>THÀNH PHẨM</span><h3>Đan Dược trong hành trang</h3></div><small>Đan buff có cap ngày; Stat Đan có cap theo family/tier/đời.</small></header><div>${pillRows}</div></section></section>`);
}
function v2328ForgeWorkshop(){
  const f=model.forging||{},recipes=f.recipes||[];if(!dongfuUi.forgeRecipeId||!recipes.some(x=>x.id===dongfuUi.forgeRecipeId))dongfuUi.forgeRecipeId=recipes[0]?.id||null;const r=recipes.find(x=>x.id===dongfuUi.forgeRecipeId)||recipes[0];
  const queues=(f.queues||[]).map(q=>{const recipe=(f.recipes||[]).find(x=>x.id===q.recipeId);return `<div class="v2328-queue-row"><b>Hỏa Lò</b><span>${esc(recipe?.name||q.recipeId)}</span><em>Còn ${durationText(q.remainingSeconds||0)}</em></div>`;}).join('')||'<div class="empty">Hỏa lò đang trống.</div>';
  const cards=recipes.map(x=>`<button class="v2328-recipe-card ${x.id===r?.id?'selected':''}" data-forge-recipe="${esc(x.id)}"><img src="/assets/hubs/forge.jpg" alt="" loading="lazy" decoding="async"><span>Khó ${num(x.difficulty)} · ${durationText(x.durationRealSeconds)}</span><strong>${esc(x.name)}</strong><small>Yêu cầu mastery ${num(x.masteryRequired)} · dự kiến thành công ${num(x.successPct,1)}%</small><i>${x.canStart?'Có thể rèn':x.known?'Thiếu nguyên liệu':'Chưa lĩnh ngộ'}</i></button>`).join('');
  let detail='';if(r){const ing=(r.ingredients||[]).map(req=>`<div><span>${esc(req.name)}</span><b>${(req.options||[]).map(o=>`${num(o.available)}/${num(o.quantity)} ${esc(o.resourceId.replace('resource.','').replaceAll('_',' '))}`).join(' · ')}</b></div>`).join('');detail=`<aside class="v2328-production-detail"><img src="/assets/hubs/forge.jpg" alt=""><span>KHÍ ĐỒ · Luyện Khí Lv${num(f.facilityLevel||1)}</span><h2>${esc(r.name)}</h2><p>${esc(r.description||'')} Thời gian thực ${durationText(r.durationRealSeconds)} · giảm ${num(f.timeReductionPct||0)}% từ công trình.</p><div class="v2328-ingredient-list">${ing}</div><div class="v2328-quality"><b>Phẩm chất</b><span>Hạ</span><span>Trung</span><span>Thượng</span><span>Cực</span><span>Hoàn Mỹ</span><small>Roll dùng trực tiếp mastery, cảnh giới, vật liệu và talent của Profession Engine hiện hữu.</small></div><div class="tag-row"><button class="button gold" data-forging-start="${esc(r.id)}" ${!r.canStart||Number((f.queues||[]).length)>=Number(f.queueCapacity||1)?'disabled':''}>Đưa vào Hàng Chờ</button><button class="button ghost" data-open-inventory="forge">Mở Cường Hóa Trang Bị</button></div></aside>`;}
  const tw=f.talismanWorkshop||{},tRecipes=tw.recipes||[],tStock=tw.stock||[];
  const talismanRecipes=tRecipes.map(x=>`<article class="card"><div class="eyebrow">PHÙ/TRẬN · Khó ${num(x.difficulty)}</div><h3>${esc(x.name)}</h3><p class="small muted">${esc(x.description||'')}</p><div class="list">${(x.ingredients||[]).map(req=>`<div class="list-item"><span>${esc(req.name)}</span><small>${(req.options||[]).map(o=>`${num(o.available)}/${num(o.quantity)} ${esc(o.name||o.resourceId)}`).join(' · ')}</small></div>`).join('')}</div><div class="tag-row"><button class="button gold" data-talisman-craft="${esc(x.id)}" ${!x.canCraft?'disabled':''}>Chế 1</button>${x.output?tag(`${x.output.quantity} × ${x.output.name}`):''}</div><small>${x.known?`Mastery ${num(x.mastery,1)}/${num(x.masteryRequired,0)}`:`Chưa lĩnh ngộ · cần Mastery ${num(x.masteryRequired,0)}`}</small></article>`).join('');
  const talismanStock=tStock.map(x=>`<div class="list-item"><div><b>${esc(x.qualityName)} · ${esc(x.name)}</b><div class="small muted">${esc(x.description||'')} · Có ${num(x.quantity)}</div></div><button class="button primary" data-talisman-use="${esc(x.productId)}" data-quality="${esc(x.quality)}">Dùng 1</button></div>`).join('')||'<div class="empty">Chưa có thành phẩm Phù/Trận.</div>';
  const talismanHtml=`<section class="card" style="margin-top:14px"><div class="v2328-workshop-head"><div><span>PHÙ TRẬN CÁC</span><h2>Phù/Trận trong Luyện Khí</h2><small>Chế tạo vật phẩm dùng một lần; hiệu ứng được ghi trực tiếp trên thành phẩm.</small></div><div><b>${num(tw.resources?.talismanPaper||0)} Linh Phù Chỉ</b><br><b>${num(tw.resources?.runeInsight||0)} Phù Văn Cảm Ngộ</b></div></div><div class="grid cols-2">${talismanRecipes}</div><div class="grid cols-2" style="margin-top:12px"><section><h3>Thành phẩm</h3><div class="list">${talismanStock}</div></section><section><h3>Công dụng</h3><div class="list-item"><b>Tụ Linh Trận Bàn</b><small>Dùng một lần để nhận Tu Vi trực tiếp; phẩm chất càng cao nhận càng nhiều.</small></div><h3>Nguồn farm</h3>${(tw.sourceGuide||[]).map(x=>`<div class="small muted">• ${esc(x.name)}: ${esc(x.source)}</div>`).join('')}</section></div></section>`;
  return page('Luyện Khí',`Recipe → thời gian thực → roll phẩm chất → queue · Mastery ${num(f.mastery||0)} · ${num((f.queues||[]).length)}/${num(f.queueCapacity||1)} slot.`,`<section class="v2328-workshop"><div class="v2328-workshop-head"><button data-dongfu-section="home">← Động Phủ</button><div><span>ĐỘNG PHỦ · PRODUCTION</span><h2>Luyện Khí · Lv${num(f.facilityLevel||1)}</h2></div><div>${v2328FacilityUpgrade('forge')}</div></div><section class="v2328-queue"><h3>Hàng Chờ Hỏa Lò</h3>${queues}</section><div class="v2328-production-layout"><section class="v2328-recipe-grid">${cards}</section>${detail}</div>${talismanHtml}</section>`);
}
function renderDongFuHub(){
  const section=dongfuUi.section||'home';if(section==='home')return renderDongFuHomeV2327();if(section==='alchemy')return v2328AlchemyWorkshop();if(section==='forge')return v2328ForgeWorkshop();return v2328WorkshopCollection(section);
}


function v89EconomyActivityBoard(){
  const e=model.economyActivity||{},daily=e.daily||{},weekly=e.weekly||{},rule=daily.resourceDungeonJade||{},lanes=daily.lanes||[],offers=e.shop?.offers||[];
  const jade=Number(e.currencies?.boundImmortalJade??model.collection?.currencies?.boundImmortalJade??0),active=Number(daily.diversity?.value||0);
  const laneHtml=lanes.map(x=>{const m=(x.milestones||[])[0],done=m?.done;return `<button class="v89-lane ${done?'done':''}" data-v89-route="${esc(x.route||'dungeons')}"><i>${x.id==='hunt'?'⚔':x.id==='resource'?'◇':x.id==='boss'?'♛':x.id==='cultivation'?'✦':'⚒'}</i><span><b>${esc(x.name)}</b><small>${esc(x.jade||'')}</small></span><em>›</em></button>`;}).join('');
  const weeklyHtml=(weekly.milestones||[]).map(x=>`<div class="v89-week ${x.done?'done':''}"><span>${esc(x.label)}</span><b>${Math.min(Number(x.value||0),Number(x.target||0))}/${num(x.target||0)} · +${num(x.reward||0)} ◈</b></div>`).join('');
  const offerHtml=offers.map(x=>`<article class="v89-offer"><div><small>NGÂN SÁCH TU TIÊN · ${num(x.bought||0)}/${num(x.weeklyCap||0)} tuần</small><b>${esc(x.name)}</b><span>${esc(x.rewardText||x.description||'')}</span></div><button data-v89-offer="${esc(x.id)}" ${!x.affordable||Number(x.remaining||0)<=0?'disabled':''}>${num(x.cost)} ◈</button></article>`).join('');
  return `<section class="v89-activity-board"><header><div><span>V89 · HÀNH TRÌNH HÔM NAY</span><h2>Chơi gì cũng được · Ngọc tự cộng</h2><p>Không có nút claim nhiệm vụ. Nguồn Ngọc Khóa lặp có hạn mức; <b>Gacha không giới hạn lượt roll</b> — có bao nhiêu Ngọc, tự quyết tiêu bao nhiêu.</p></div><aside><small>TIÊN NGỌC KHÓA</small><strong>${esc(v2320Compact(jade))} ◈</strong><span>Hôm nay +${num(daily.earned||0)}/${num(daily.maxAuthored||0)} · ${active}/5 loại hoạt động</span></aside></header><div class="v89-source-rule"><b>Bí Cảnh Tài Nguyên</b><span>${num(rule.paidClears||0)}/${num(rule.capClears||3)} lượt nhận Ngọc · mỗi lượt +${num(rule.rewardPerClear||20)} ◈</span><em>Lượt 4+ vẫn farm 100% nguyên liệu, chỉ không phát thêm Ngọc Khóa.</em></div><div class="v89-lanes">${laneHtml}</div><details class="v89-weekly"><summary><b>Tiến độ tuần</b><span>${num(weekly.activeDays||0)}/7 ngày hoạt động · first-clear còn ${num(weekly.firstClearBonusRemaining||0)} lượt thưởng</span></summary><div>${weeklyHtml}</div></details><details class="v89-budget"><summary><b>Ngân Sách Tu Tiên</b><span>Đổi Ngọc lấy tăng tốc hoặc để dành cho Gacha</span></summary><p>Đây là lựa chọn chi tiêu có cap theo gói, <b>không phải cap Gacha</b>. Nguyên liệu vẫn farm được.</p><div class="v89-offers">${offerHtml}</div></details></section>`;
}
function renderDungeonHub(){
  const c=model.collection||{},ce=model.collectionEconomy||{},o=model.overview||{},allDungeons=model.dungeons||[],hunt=model.endlessHunt||{};
  const resourceDungeons=allDungeons.filter(d=>d.resourcePve),dungeons=allDungeons.filter(d=>!d.resourcePve);
  const firstLifeJourney=model.flow?.journey||{},journeyDungeonId=firstLifeJourney.currentStepId==='first-clear'?firstLifeJourney.currentTargetDungeonId:null,journeyDungeon=journeyDungeonId?allDungeons.find(d=>d.id===journeyDungeonId):null,journeyFloor=Number(firstLifeJourney.currentTargetFloor||journeyDungeon?.nextFloor?.floor||1);
  const selectedFloor=Number(hunt.selectedFloor||hunt.floor||1),energy=Number(live?.energy??o.cultivation?.energy??0),huntFarm=hunt.farm||{};
  const resources=`<section class="v2320-resource-bar"><div><i class="spirit">✦</i><span><small>Tu Vi</small><b>${esc(v2320Compact(energy))}</b></span><button data-tab-jump="cultivation">+</button></div><div><i class="stone">◆</i><span><small>Linh Thạch</small><b>${esc(v2320Compact(resourceQuantity('resource.spirit_stone')))}</b></span><button data-tab-jump="inventory">+</button></div><div><i class="jade">◈</i><span><small>Ngọc Khóa</small><b>${esc(v2320Compact(c.currencies?.boundImmortalJade||0))}</b></span><button data-tab-jump="collection">+</button></div></section>`;
  const journeyPriority=journeyDungeon?`<section class="v125-first-clear-priority"><div><span>TIÊN LỘ · MỤC TIÊU HIỆN TẠI</span><h2>${esc(firstLifeJourney.currentTitle||'First-clear Tụ Linh Động')}</h2><p>${esc(firstLifeJourney.currentDescription||'Công phá đúng bí cảnh được chỉ dẫn để mở vòng build → farm đầu tiên.')}</p><small>${esc(journeyDungeon.name||'Tụ Linh Động')} · Tầng ${num(journeyFloor)}</small></div><button class="gold" data-intel="${esc(journeyDungeon.id)}" data-floor="${num(journeyFloor)}">Công Phá Đúng Mục Tiêu <span>➜</span></button></section>`:'';
  const featured=`<section class="v2320-featured-grid"><article class="v2320-featured hunt"><img src="/assets/hubs/hunt.jpg" alt="Săn Yêu"><div><span>PVE LIÊN TỤC</span><h2>Săn Yêu</h2><p>${huntFarm.available?`Bãi Săn T${num(huntFarm.floor||selectedFloor)} · ~${num(huntFarm.killsPerHour||0)} quái/giờ`:`Boss tầng ${num(selectedFloor)} · hạ để mở bãi Săn Ảo`}</p><div class="v2320-reward-icons"><i>⚔</i><i>●</i><i>◇</i></div><button data-tab-jump="hunt">Khiêu Chiến</button></div></article><article class="v2320-featured boss"><img src="/assets/hubs/boss.jpg" alt="Thủ Lĩnh"><div><span>RESOURCE BOSS</span><h2>Thủ Lĩnh</h2><p>Đánh thật · vật liệu đột phá hiếm · Boss V2 ở 23.30</p><div class="v2320-reward-icons"><i>⚔</i><i>◆</i><i>◉</i></div><button data-scroll-resource>Chọn hệ farm</button></div></article></section>`;
  const catBy=new Map((ce.categories||[]).map(x=>[x.category,x]));
  const img={manual:'manual.jpg',heart:'manual.jpg',artifact:'artifact.jpg',relic:'artifact.jpg',pet:'beast.jpg',companion:'companion.jpg',bloodline:'daily-beast.jpg',physique:'trial-dungeon.jpg'};
  const resourceCards=resourceDungeons.map(d=>{const p=d.resourcePve||{},cat=catBy.get(p.category)||{},focus=dungeonUi.resourceCategory===p.category;const first=p.targetMode==='progress';return `<article class="v2329-resource-card ${focus?'focus':''}"><img src="/assets/hubs/${img[p.category]||'trial-dungeon.jpg'}" alt="${esc(d.name)}"><div class="v2329-resource-copy"><span>${esc(cat.label||p.category||'Tài nguyên')} · ${first?'CÔNG PHÁ':'TREO FARM'}</span><h3>${esc(d.name)}</h3><p>${esc(p.description||'Phó bản chuyên farm nguyên liệu.')}</p><div class="v2329-resource-stock"><i><small>${esc(p.materialName||'Cường hóa')}</small><b>${num(cat.genericFragments||0)}</b></i><i><small>${esc(p.breakthroughName||'Đột phá')}</small><b>${num(cat.ascensionEssence||0)}</b></i></div><div class="v2329-resource-drop"><b>Tầng ${num(p.targetFloor)}${first?' · First Clear':' · 1 năm farm'}</b><span>~${num(p.material||0)} ${esc(p.materialName||'nguyên liệu')}${first?'':' / năm'}</span><span>${first?`Đảm bảo +${num(p.firstClearBreakthrough||1)}`:`~${num(Number(p.breakthroughPerYear||0),2)} / năm`} ${esc(p.breakthroughName||'đột phá')}</span><em>Mảnh Riêng: chỉ Gacha · không rơi Trang Bị/Pháp Bảo</em></div>${first?`<button class="gold" data-resource-challenge="${esc(d.id)}" data-floor="${num(p.targetFloor)}" ${!p.canChallenge?'disabled':''}>${!p.canChallenge?`Cần cảnh giới ${num(p.requiredRealmOrder)}`:'Công Phá Tầng'}</button>`:`<button class="gold" data-resource-farm="${esc(d.id)}" data-floor="${num(p.targetFloor)}" ${!p.canFarm?'disabled':''}>Treo Farm 1 Năm</button>`}</div></article>`;}).join('')||'<div class="empty">Chưa có bí cảnh tài nguyên.</div>';
  const resourceSection=`<section class="v2329-resource-section" data-resource-section><header><div><span>V109 · RESOURCE DUNGEON PRODUCTION</span><h2>Chọn hệ cần nuôi</h2></div><p>Thiếu gì farm nấy. Công phá tầng bằng CombatKernel V2 một lần, sau đó treo Main Body/Phân Thân theo thời gian; Mảnh Riêng vẫn chỉ từ Gacha.</p></header><div class="v2329-resource-grid">${resourceCards}</div></section>`;
  const normalTitles=['Bí Cảnh Trang Bị','Bí Cảnh Set','Thí Luyện'];
  const normalImgs=['gear-dungeon.jpg','set-dungeon.jpg','trial-dungeon.jpg'];
  const normalDesc=['Thu thập trang bị','Thu thập Set Ngũ Hành','Vượt giới hạn bản thân'];
  const normals=normalTitles.map((title,i)=>{const d=dungeons[i]||{},floor=d.nextFloor?.floor;return `<article class="v2320-normal-card"><img src="/assets/hubs/${normalImgs[i]}" alt="${esc(title)}"><div><h3>${esc(title)}</h3><p>${esc(normalDesc[i])}</p><small>${d.highestClearedFloor!=null?`Đã vượt tầng ${num(d.highestClearedFloor)}`:'PvE thường trực'}</small>${floor?`<button data-intel="${esc(d.id)}" data-floor="${num(floor)}">Vào <span>➜</span></button>`:`<button data-tab-jump="combat">Vào <span>➜</span></button>`}</div></article>`;}).join('');
  const other=dungeons.slice(3);
  const otherPreview=other.slice(0,3).map(d=>`<span>${esc(d.name||'Bí Cảnh PvE')}</span>`).join('');
  const otherSummary=`<button type="button" class="v2321-pve-more" data-sheet-open="pve-more"><div><small>PVE KHÁC</small><strong>${num(other.length)} bí cảnh & thử thách</strong><span>${otherPreview||'Cấm Địa · tháp thử luyện · nội dung PvE mở dần'}</span></div><b>Khám phá ›</b></button>`;
  const otherRows=other.map(d=>{const floor=d.nextFloor?.floor;return `<article class="v2321-pve-row"><div><small>PVE</small><strong>${esc(d.name||'Bí Cảnh')}</strong><span>${d.highestClearedFloor!=null?`Đã vượt tầng ${num(d.highestClearedFloor)}`:'Chưa khai phá'}</span></div>${floor?`<button data-intel="${esc(d.id)}" data-floor="${num(floor)}">Tầng ${num(floor)} ›</button>`:'<button data-tab-jump="combat">Xem ›</button>'}</article>`;}).join('')||'<div class="v2321-empty">Nội dung PvE khác sẽ mở dần theo tiến độ.</div>';
  const otherSheet=`<div class="v2321-sheet-intro"><span>CHỈ PVE</span><strong>Bí Cảnh & Hoạt Động Khác</strong><p>PvP/Đấu Pháp không nằm trong Phó Bản. Khu này chỉ chứa nội dung đánh quái, Boss và thử thách PvE.</p></div><div class="v2321-pve-list">${otherRows}</div>`;
  return `<section class="v106-screen v2320-hub v2320-dungeons v2321-pve-hub"><div class="v2320-hub-scroll"><header class="v2320-hub-header dungeons"><button data-tab-jump="character" aria-label="Quay lại">←</button><h1>Phó Bản</h1><button data-sheet-open="more" aria-label="Tiện ích">☰</button></header>${resources}${journeyPriority}${v89EconomyActivityBoard()}${featured}${resourceSection}<div class="v2320-section-title"><i></i><h2>Bí Cảnh & Thí Luyện Khác</h2><i></i></div><section class="v2320-normal-grid">${normals}</section>${otherSummary}</div>${v106Sheet('pve-more','PvE Khác',otherSheet)}${v106MoreSheet()}</section>`;
}



function renderEconomyV111(){
  const prod=model.economyProduction||{},eco=model.economy||{},activity=model.economyActivity||{};
  const cur=prod.currencies||{},jade=prod.boundJade||{},cycle=jade.cycle28d||{},today=jade.today||{},sp=prod.spiritStone||{},shop=eco.shop||{},slots=shop.slots||[];
  const facilityRemaining=prod.cave?.total||0,materials=eco.ledger?.materials||[],treasures=eco.specialStorage?.treasures||[];
  const sourceHtml=(jade.sources||[]).map(x=>`<article><span>${esc(x.name)}</span><b>${num(x.cap||0)} ◈</b><small>${esc(x.cadence||'')}</small>${x.note?`<em>${esc(x.note)}</em>`:''}</article>`).join('');
  const sinkHtml=(jade.sinks||[]).map(x=>`<article><span>${esc(x.name)}</span><b>${x.id==='gacha'?`${num(x.cost)} / ${num(x.altCost)} ◈`:x.costRemaining!==undefined?`${num(x.costRemaining)} ◈ còn lại`:'Tùy chọn'}</b><small>${esc(x.note||'')}</small></article>`).join('');
  const marketHtml=slots.map(slot=>{const qty=Number(slot.quantity||0),price=Number(slot.pricePerUnit||0),can=qty>0&&Number(cur.spiritStones||0)>=price;const type=slot.kind==='equipment'?'Trang Bị':(slot.tags||[]).includes('RareStock')?'Thiên Tài Địa Bảo':'Nguyên Liệu';return `<article class="v111-market-slot ${qty<=0?'sold':''}"><span>${esc(type)}${slot.fixed?' · CỐ ĐỊNH':''}</span><strong>${esc(slot.name||slot.resourceId||'Ô hàng')}</strong><small>Tồn ${num(qty)} · ${num(price)} Linh Thạch / đơn vị</small><div>${qty>0?`<button class="button gold" data-economy-buy="${esc(slot.id)}" data-qty="1" ${!can?'disabled':''}>Mua 1</button>${slot.kind==='resource'&&qty>=5?`<button class="button ghost" data-economy-buy="${esc(slot.id)}" data-qty="5" ${Number(cur.spiritStones||0)<price*5?'disabled':''}>Mua 5</button>`:''}`:'<em>Đã bán hết</em>'}</div></article>`}).join('');
  const materialHtml=materials.slice(0,40).map(row=>{const d=row.definition||{},q=Number(row.quantity||0),canConvert=q>=Number(prod.materials?.upgradeRatio||10)&&Number(d.realmTier||8)<8;return `<article class="v111-material-row"><div><strong>${esc(d.name||row.id)}</strong><small>${esc(d.family||'material')} · Tier ${num(d.realmTier||0)}</small></div><b>${num(q)}</b><div><button class="button ghost" data-economy-sell="${esc(row.id)}" data-qty="1">Bán 1</button>${q>=10?`<button class="button ghost" data-economy-sell="${esc(row.id)}" data-qty="10">Bán 10</button>`:''}<button class="button gold" data-economy-convert="${esc(row.id)}" data-batches="1" ${!canConvert?'disabled':''}>10 → 1 Tier+</button></div></article>`}).join('')||'<div class="empty">Chưa có vật liệu Economy phổ thông để giao dịch.</div>';
  const treasureHtml=treasures.length?`<div class="v111-treasures">${treasures.map(x=>`<span><b>${esc(x.name)}</b> ×${num(x.quantity)}</span>`).join('')}</div>`:'';
  const rules=(prod.rules||[]).map(x=>`<li>${esc(x)}</li>`).join('');
  const health=prod.health||{};
  return page('Kinh Tế','V111 · Một ngân sách cho Ngọc Khóa, Linh Thạch, Phường Thị và nguyên liệu',`<section class="v111-economy">
    <header class="v111-economy-hero"><div><span>ECONOMY PRODUCTION V111</span><h2>Tiêu gì cũng phải có đánh đổi</h2><p>${esc(jade.advice||'Tích lũy và đầu tư theo build hiện tại.')}</p></div><div class="v111-wallet"><article><small>NGỌC KHÓA</small><b>${num(cur.boundImmortalJade||0)} ◈</b><span>${num(jade.spendingPower?.tenPullsNow||0)} lần 10-pull hiện có</span></article><article><small>LINH THẠCH</small><b>${num(cur.spiritStones||0)}</b><span>Phường Thị refresh ${num(sp.market?.refreshCost||0)}</span></article></div></header>
    <div class="v111-budget-grid"><article><span>Hôm nay còn kiếm được</span><b>+${num(today.remainingEarnable||0)} ◈</b><small>Activity ${num(today.activityEarned||0)}/${num(today.activityMax||0)} · PvP ${num(today.pvpPaidWins||0)}/${num(today.pvpPaidWinCap||5)} thắng có thưởng</small></article><article><span>Ngân sách lặp 28 ngày</span><b>${num(cycle.recurringMax||0)} ◈</b><small>≈ ${num(cycle.equivalentPullsRecurring||0,1)} lượt quay nếu dồn toàn bộ vào Gacha</small></article><article><span>First-clear + mùa</span><b>+${num((cycle.firstClearBurstMax||0)+(cycle.seasonRewardPreview||0))} ◈</b><small>First-clear là burst hữu hạn · thưởng mùa theo rank hiện tại</small></article><article><span>Động Phủ còn lại</span><b>${num(facilityRemaining)} ◈</b><small>Để max toàn bộ công trình còn lại; không cần nâng đều.</small></article></div>
    <section class="v111-budget-section"><header><h3>Nguồn Ngọc Khóa</h3><span>Cap ở nguồn thưởng, không cap gameplay</span></header><div class="v111-card-grid">${sourceHtml}</div></section>
    <section class="v111-budget-section"><header><h3>Ngọc dùng vào đâu?</h3><span>Gacha · Động Phủ · tăng tốc</span></header><div class="v111-card-grid sinks">${sinkHtml}</div></section>
    ${v89EconomyActivityBoard()}
    <section class="v111-market"><header><div><span>PHƯỜNG THỊ</span><h3>Shop Linh Thạch · stock hữu hạn</h3><p>Tự refresh sau 6 giờ thật. Refresh tay chỉ đổi stock, không tạo thêm Ngọc Khóa.</p></div><button class="button ghost" data-economy-refresh ${Number(cur.spiritStones||0)<Number(shop.manualRefreshCost||0)?'disabled':''}>Làm mới · ${num(shop.manualRefreshCost||0)} Linh Thạch</button></header><div class="v111-market-grid">${marketHtml}</div></section>
    <section class="v111-ledger"><header><div><span>VẬT LIỆU PHỔ THÔNG</span><h3>Bán lấy Linh Thạch hoặc hợp thành Tier+</h3></div><aside><small>Săn Yêu</small><b>+${num(sp.telemetry?.fromHunt||0)}</b><small>Phân giải</small><b>+${num(sp.telemetry?.fromSalvage||0)}</b><small>Bán vật liệu</small><b>+${num(sp.telemetry?.fromMaterialSales||0)}</b></aside></header>${treasureHtml}<div class="v111-material-list">${materialHtml}</div></section>
    <details class="v111-rules"><summary><b>Luật economy đang khóa</b><span>${health.noInfiniteBoundJadeFarm?'✓ Không có farm Ngọc vô hạn':'⚠ Cần kiểm tra'}</span></summary><ul>${rules}</ul><p>Ledger V89: đã kiếm ${num(jade.ledger?.earned||0)} ◈ · đã tiêu ${num(jade.ledger?.spent||0)} ◈ · net ${num(jade.ledger?.net||0)} ◈.</p></details>
  </section>`);
}

function renderPvpV91(){
  const p=model.pvp||{},reward=p.reward||{},record=p.record||{},rank=p.rank||{name:'Tân Tú'},jade=Number(model.collection?.currencies?.boundImmortalJade??model.collectionEconomy?.currencies?.boundImmortalJade??0);
  if(!p.unlocked){
    return page('Đấu Pháp','Async 1v1 · Full Auto Tactical',`<section class="v91-lock"><i>⚔</i><span>CHƯA MỞ</span><h2>Kim Đan mới có thể Lập Trận</h2><p>Đấu Pháp không phải Phó Bản PvE. Khi đạt Kim Đan, bạn có thể dựng Trận Phòng Thủ, chọn một trong 3 Đạo Ảnh và đánh không giới hạn số trận.</p><button data-tab-jump="cultivation">Tiếp tục Tu Luyện</button></section>`);
  }
  const safety=`<div class="v91-rules"><span>FULL AUTO</span><span>COMBATKERNEL V2</span><span>KHÔNG CHẾT THẬT</span><span>KHÔNG THƯƠNG THẾ</span><span>KHÔNG ĐỐT THỌ NGUYÊN</span></div>`;
  if(!p.joined){
    return page('Đấu Pháp','Async 1v1 · CombatKernel V2',`<section class="v91-join"><div class="v91-join-mark">⚔</div><small>KIM ĐAN · ĐẤU PHÁP</small><h2>Lập Trận Phòng Thủ</h2><p>Bản standalone dùng <b>Đạo Ảnh local</b> để PvP hoạt động thật ngay trên điện thoại. Mỗi mùa kéo dài <b>28 ngày</b>; rating có bảng xếp hạng, thưởng hạng và soft reset khi chốt mùa.</p>${safety}<div class="v91-reward-rule"><b>Thưởng ngày</b><span>5 trận thắng đầu/ngày · mỗi trận +8 Tiên Ngọc Khóa</span><em>Sau đó vẫn đánh và tăng/giảm rating bình thường.</em></div><button class="v91-main-cta" data-pvp-join>Lập Trận</button></section>`);
  }
  const season=p.season||{},tactical=p.tactical||{},selected=tactical.selected||{},integrity=p.integrity||{};
  const seasonExpired=Boolean(season.expired),rewardPreview=season.rewardPreview||{},softReset=Number(season.softResetPreview??p.rating??1000);
  const tacticalButtons=(tactical.presets||[]).map(x=>`<button class="${x.id===selected.id?'active':''}" data-pvp-tactical="${esc(x.id)}"><b>${esc(x.name)}</b><span>${esc(x.description||'')}</span></button>`).join('');
  const boardRows=(p.leaderboard?.rows||[]).slice(0,6).map(row=>`<div class="v94-board-row ${row.isPlayer?'self':''}"><i>#${num(row.position)}</i><b>${esc(row.name)}</b><span>${esc(row.rank?.name||'')}</span><strong>${num(row.rating)}</strong></div>`).join('');
  const selfRow=p.leaderboard?.self;
  const selfExtra=selfRow&&!((p.leaderboard?.rows||[]).slice(0,6).some(x=>x.isPlayer))?`<div class="v94-board-row self"><i>#${num(selfRow.position)}</i><b>${esc(selfRow.name)}</b><span>${esc(selfRow.rank?.name||'')}</span><strong>${num(selfRow.rating)}</strong></div>`:'';
  const opponents=(p.opponents||[]).map(o=>`<article class="v91-opponent ${esc(o.band)}"><header><span>${esc(o.label)}</span><b>${esc(o.rank?.name||'')}</b></header><h3>${esc(o.name)}</h3><div><i>Rating</i><strong>${num(o.rating)}</strong></div><div><i>Độ khó neo</i><strong>×${num(o.scale,3)}</strong></div><small>Vé #${esc(String(o.ticketNonce??0))} · deterministic</small><button data-pvp-challenge="${esc(o.id)}" ${seasonExpired||!integrity.ok?'disabled':''}>Khiêu Chiến</button></article>`).join('');
  const history=(p.history||[]).map(h=>{const won=h.result==='win',draw=h.result==='draw',factor=Number(h.ratingFactor??1);return `<article class="v91-history-row ${won?'win':draw?'draw':'loss'}"><i>${won?'THẮNG':draw?'HÒA':'BẠI'}</i><div><b>${esc(h.opponentName||'Đạo Ảnh')}</b><small>${new Date(h.atUnixMs||0).toLocaleString('vi-VN')} · ${num(h.duration||0,1)}s${factor<1?` · ×${num(factor,2)} RP`:''}</small></div><strong>${h.ratingDelta>=0?'+':''}${num(h.ratingDelta)} RP${h.rewardBoundJade?` · +${num(h.rewardBoundJade)} ◈`:''}</strong><button data-pvp-replay="${esc(h.fightId)}" ${h.replayable?'':'disabled'}>Replay</button></article>`;}).join('')||'<div class="v91-empty">Chưa có chiến báo. Chọn một Đạo Ảnh để bắt đầu.</div>';
  let replayHtml='';
  if(pvpReplayUi.loading)replayHtml='<section class="v91-replay"><h3>Replay CombatKernel</h3><div class="v91-empty">Đang dựng lại trận đấu…</div></section>';
  else if(pvpReplayUi.error)replayHtml=`<section class="v91-replay"><h3>Replay CombatKernel</h3><div class="v91-empty bad">${esc(pvpReplayUi.error)}</div></section>`;
  else if(pvpReplayUi.data){const rp=pvpReplayUi.data,b=rp.battle||{},logs=(b.logs||[]).slice(0,80).map(e=>`<div><time>${num(e.time||0,2)}s</time><span>${esc(e.message||e.type||'')}</span></div>`).join('');replayHtml=`<section class="v91-replay"><header><div><small>COMBATKERNEL V2 · ${rp.verified?'VERIFIED':'MISMATCH'}</small><h3>Phát lại chiến báo</h3></div><b>${b.draw?'HÒA':b.winnerId?.startsWith('pvp.player.')?'THẮNG':'BẠI'} · ${num(b.duration||0,1)}s</b></header><div class="v91-replay-log">${logs||'<div class="v91-empty">Không có log.</div>'}</div></section>`;}
  const seasonPanel=`<section class="v94-season ${seasonExpired?'expired':''}"><div><small>MÙA ${num(season.number||1)} · 28 NGÀY</small><h2>${seasonExpired?'Mùa đã kết thúc':`Còn ${durationLongText(Number(season.remainingMs||0)/1000)}`}</h2><p>Thưởng nếu chốt lúc này: <b>${esc(rewardPreview.rank?.name||rank.name)} · ${num(rewardPreview.boundJade||0)} ◈</b>. Soft reset dự kiến: <b>${num(softReset)} RP</b>.</p></div>${seasonExpired?'<button data-pvp-season-settle>Chốt Mùa & Nhận Thưởng</button>':''}</section>`;
  const integrityPanel=`<section class="v94-integrity ${integrity.ok?'ok':'bad'}"><div><small>V94 INTEGRITY</small><b>${integrity.ok?'Chuỗi PvP hợp lệ':'PHÁT HIỆN SAVE PvP BỊ SỬA'}</b><span>${integrity.ok?`${num(integrity.events||0)} event hash-linked · anti-reroll bật`:`${esc(integrity.reason||'state mismatch')} · toàn bộ PvP write bị khóa`}</span></div></section>`;
  return page('Đấu Pháp','V94 · Season · Tactical · Integrity',`<section class="v91-pvp"><header class="v91-score"><div><small>${esc(rank.name||'Tân Tú')}</small><strong>${num(p.rating||1000)}</strong><span>RATING</span></div><div class="v91-record"><b>${num(record.wins||0)}W</b><b>${num(record.losses||0)}L</b><b>${num(record.draws||0)}D</b></div><aside><small>TIÊN NGỌC KHÓA</small><strong>${num(jade)} ◈</strong><span>Đã nhận ${num(reward.paidWinsToday||0)}/5 trận thắng hôm nay</span></aside></header>${safety}${seasonPanel}${integrityPanel}<section class="v94-tactical"><header><div><small>FULL AUTO TACTICAL</small><h2>${esc(selected.name||'Cân Bằng')}</h2></div><span>Preset sửa trực tiếp aiProfile.rules</span></header><div class="v94-tactical-grid">${tacticalButtons}</div></section><section class="v91-defense"><div><small>TRẬN PHÒNG THỦ</small><b>${p.defense?.createdAtUnixMs?`Snapshot · ${new Date(p.defense.createdAtUnixMs).toLocaleString('vi-VN')}`:'Chưa dựng'}</b><span>Chiến thuật phòng thủ: ${esc((tactical.presets||[]).find(x=>x.id===p.defense?.tacticalPresetId)?.name||'Cân Bằng')} · snapshot immutable tới lần cập nhật sau.</span></div><button data-pvp-defense ${seasonExpired||!integrity.ok?'disabled':''}>Cập Nhật Build Phòng Thủ</button></section><section class="v94-board"><header><div><small>LEADERBOARD · LOCAL SHADOW</small><h2>Bảng Xếp Hạng</h2></div><span>Bản thân luôn hiển thị</span></header><div>${boardRows}${selfExtra}</div></section><section class="v91-match"><header><div><small>MATCHMAKING · ANTI-REROLL</small><h2>Chọn Đạo Ảnh</h2></div><span>Không giới hạn số trận · cùng band liên tiếp giảm RP</span></header><div class="v91-opponents">${opponents}</div></section><section class="v91-history"><header><div><small>CHIẾN BÁO</small><h2>Lịch sử gần đây</h2></div><span>Replay từ ticket seed + snapshot thật</span></header>${history}</section>${replayHtml}</section>`);
}

function v127ManualProgressLabel(x,p={}){
  if(!x?.unlocked)return `Mở ở ${x?.realmName||'cảnh giới sau'}`;
  if(!p?.owned)return `${num(p?.specificFragments||0)}/${num(x?.composeCost||0)} mảnh`;
  const gate=x.manualGate||{},advance=Math.max(0,Number(p.advance||0)),next=gate.nextMilestone;
  return advance>=10?`Lv${num(p.level||1)}/${num(x.maxLevel||1000)} · Đại Viên Mãn`:`Lv${num(p.level||1)}/${num(x.maxLevel||1000)} · Đột Phá ${advance}/10${next?` · kế Lv${num(next)}`:''}`;
}
function v127ManualUpgradeControls(selected,cat){
  const p=selected?.progress||{},gate=selected?.manualGate||{},genericOwned=Number(cat?.genericFragments||0),essenceOwned=Number(cat?.ascensionEssence||0),fragmentOwned=Number(p.specificFragments||0),strengthenCost=Number(selected?.strengthenCost||0),advance=Math.max(0,Number(p.advance||0)),next=Number(gate.nextMilestone||((advance+1)*100));
  if(advance>=10)return `<button class="button gold" disabled>Đại Viên Mãn · Lv1000</button>`;
  const canStrength=Boolean(gate.canStrengthen)&&genericOwned>=strengthenCost;
  const strengthenLabel=gate.canStrengthen?`Tu Luyện +1 · ${num(strengthenCost)} ${esc(cat?.genericFragmentName||'nguyên liệu')}`:`Đã chạm Lv${num(next)} · cần Đột Phá`;
  const fragmentCost=Number(gate.fragmentCost??selected.advanceCost??0),ordinaryCost=Number(gate.ordinaryCost||0),essenceCost=Number(gate.essenceCost??selected.ascensionCost??0),canAdvance=Boolean(gate.canAdvance)&&fragmentOwned>=fragmentCost&&genericOwned>=ordinaryCost&&essenceOwned>=essenceCost;
  const advanceLabel=`Đột Phá mốc Lv${num(next)} · ${num(fragmentCost)} Mảnh + ${num(ordinaryCost)} ${esc(cat?.genericFragmentName||'Tàn Ý')} + ${num(essenceCost)} ${esc(cat?.ascensionName||'Thiên Tinh')}`;
  return `<button class="button ghost" data-collection-strengthen-v12325="${esc(selected.id)}" ${canStrength?'':'disabled'}>${strengthenLabel}</button><button class="button gold" data-collection-advance-v12325="${esc(selected.id)}" ${canAdvance?'':'disabled'}>${advanceLabel}</button>`;
}
function v127ManualGateDetail(selected,cat){
  if(selected?.category!=='manual'||!selected?.progress?.owned)return'';
  const p=selected.progress,gate=selected.manualGate||{},advance=Number(p.advance||0);
  if(advance>=10)return `<div class="v127-manual-gate ready"><span>ĐẠI VIÊN MÃN</span><b>Lv1000 · 10/10 mốc</b><small>Toàn bộ hiệu lực Lv1000 và bonus Đại Viên Mãn đang hoạt động.</small></div>`;
  const next=Number(gate.nextMilestone||((advance+1)*100)),fragmentCost=Number(gate.fragmentCost??selected.advanceCost??0),ordinaryCost=Number(gate.ordinaryCost||0),essenceCost=Number(gate.essenceCost??selected.ascensionCost??0),retrain=Number(gate.retrainMaterialMultiplier??1);
  return `<div class="v127-manual-gate ${gate.canAdvance?'ready':''}"><span>MỐC ĐỘT PHÁ ${advance+1}/10</span><b>Lv${num(p.level||1)} → khóa tại Lv${num(next)}</b><small>Cần ${num(fragmentCost)} Mảnh Riêng + ${num(ordinaryCost)} ${esc(cat?.genericFragmentName||'Tàn Ý')} + ${num(essenceCost)} ${esc(cat?.ascensionName||'Thiên Tinh')}.</small>${retrain<.999?`<em>Trọng Tu Cựu Kinh: chi phí nguyên liệu thường ×${num(retrain,2)}; Mảnh Riêng giữ nguyên.</em>`:''}</div>`;
}
function v127ManualStatValue(st){
  const v=Number(st?.value||0),id=st?.id||'';
  if(id==='cultivationFlatPer15s')return `+${num(v,1)} /15 giây`;
  if(['attackFlat','physiqueFlat','hpFlat','defenseFlat'].includes(id))return `+${num(v,1)}`;
  return `+${num(v,2)}%`;
}
function renderCollection(){
  const c=model.collectionEconomy||model.collection||{};
  if(!c||c.schema!=='collection-workshop-gacha.v12326')return page('Vạn Tượng','Hệ sưu tập đang nâng cấp.','<div class="empty">Collection Workshop V2 chưa sẵn sàng.</div>');
  const cats=c.categories||[],cat=cats.find(x=>x.category===collectionUi.category)||cats[0];if(!cat)return page('Vạn Tượng','Chưa có collection.','');
  collectionUi.category=cat.category;collectionUi.banner=`banner.${cat.category}`;
  const manualBanner=cat.category==='manual'?(c.manualBanner||{}):null;
  if(manualBanner&&Number.isFinite(Number(manualBanner.selectedRealmStageIndex)))collectionUi.manualRealmStage=Number(manualBanner.selectedRealmStageIndex);
  const allItems=cat.items||[],manualView=cat.category==='manual'?v127ManualStageContext(allItems,collectionUi,'data-collection-manual-realm'):{items:allItems,selector:''},items=manualView.items,owned=items.filter(x=>x.progress?.owned),pool=collectionUi.ownedOnly?owned:items;
  const manualBannerUi=manualBanner?`<section class="v127-manual-banner-control"><label><span>Cảnh giới Banner Công Pháp</span><select data-collection-manual-realm>${(manualBanner.options||[]).map(x=>`<option value="${num(x.realmStageIndex,0)}" ${Number(x.realmStageIndex)===Number(manualBanner.selectedRealmStageIndex)?'selected':''}>${esc(x.realmName)}</option>`).join('')}</select></label><div><span>ĐỊNH HƯỚNG MẢNH RIÊNG · 50/50; trượt thì lần Mảnh Riêng kế tiếp bảo đảm</span><div class="tag-row">${(manualBanner.pool||[]).map(x=>`<button class="button ${x.id===manualBanner.orientationId?'gold':'ghost'}" data-manual-gacha-orientation="${esc(x.id)}">${esc(x.name)}</button>`).join('')}</div></div><small>Pool hiện tại: ${(manualBanner.pool||[]).length}/9 Công Pháp · Định Hướng không tăng tổng tỷ lệ rơi Mảnh/Item${manualBanner.orientationGuaranteed?' · Lượt Mảnh Riêng kế tiếp: BẢO ĐẢM':''} · Phó Bản không rơi Mảnh Riêng.</small></section>`:'';
  if(!collectionUi.selectedId||!items.some(x=>x.id===collectionUi.selectedId))collectionUi.selectedId=(owned[0]||items[0])?.id||null;
  const selected=items.find(x=>x.id===collectionUi.selectedId)||items[0];
  const banner=(c.banners||[]).find(x=>x.id===collectionUi.banner)||{};const pity=banner.pity||{};
  const gradeCls=g=>`grade-${esc(g||'mundane')}`;
  const art=(category,index=0)=>{const beasts=['light-lion.png','white-tiger.png','water-dragon.png','earth-qilin.png','fire-phoenix.png','dark-fox.png','ice-tortoise.png','wood-stag.png','thunder-wolf.png','wind-phoenix.png'];if(category==='manual'||category==='heart')return '/assets/hubs/manual.jpg';if(category==='artifact')return '/assets/hubs/artifact.jpg';if(category==='relic')return '/assets/hubs/daily-artifact.jpg';if(category==='pet'||category==='bloodline')return `/assets/huntv2/beasts/${beasts[index%beasts.length]}`;if(category==='companion')return '/assets/hubs/companion.jpg';return '/assets/hubs/dongfu-hero.jpg';};
  const catTabs=cats.map(x=>`<button class="v2326-cat-tab ${x.category===cat.category?'active':''}" data-collection-category="${esc(x.category)}"><span>${esc(x.label)}</span><small>${num(x.owned)}/${num(x.total)}</small></button>`).join('');
  const cards=pool.slice(0,60).map((x,i)=>{const p=x.progress||{},isSelected=x.id===selected?.id,active=Boolean(x.active);let progress=x.category==='manual'?(!x.unlocked?`Mở ở ${x.realmName||'cảnh giới sau'}`:p.owned?v127ManualProgressLabel(x,p):`${num(p.specificFragments||0)}/${num(x.composeCost||0)} mảnh`):p.owned?(x.category==='bloodline'?`${esc(p.bloodlineGrade||'Phàm')} · ${num(p.purity||0)}%`:(x.category==='physique'?esc(p.physiqueStage||'Sơ Tỉnh'):(x.category==='heart'?(x.heart?.learned?`${esc(x.heart.gradeLabel||x.gradeLabel)} · Lv${num(x.heart.level||1)}`:'Bí Bản'):x.category==='artifact'?`Luyện Hóa ${num(p.level||1)}/100 · Bảo Giai ${esc(x.artifact?.grade||'I')}`:x.category==='relic'?`Luyện Hóa ${num(p.level||1)}/100 · Bảo Giai ${esc(x.relic?.gradeLabel||'I')}`:`Lv${num(p.level||1)} · +${num(p.advance||0)}`))):`${num(p.specificFragments||0)}/${num(x.composeCost||0)} mảnh`;
    return `<button class="v2326-item-card ${gradeCls(x.grade)} ${isSelected?'selected':''} ${!p.owned?'locked':''}" data-collection-select="${esc(x.id)}"><div class="v2326-item-art"><img src="${art(x.category,i)}" alt="${esc(x.name)}"><span class="v2326-grade">${esc(x.gradeLabel||'Phàm')}</span>${active?'<i class="v2326-active">Đang dùng</i>':''}</div><strong>${esc(x.name)}</strong><small>${esc(progress)}</small>${p.owned&&Number(p.specificFragments||0)>0?`<b class="v2326-up-dot">${num(p.specificFragments)}</b>`:''}</button>`;}).join('')||'<div class="empty">Chưa có mục phù hợp.</div>';
  const statNames={powerPct:'Công Lực',bodyPct:'Thể Phách',defensePct:'Phòng Ngự',spiritPct:'Chân Nguyên',cultivationPct:'Tu Vi',critPct:'Bạo Kích',breakPct:'Xuyên Giáp',healingPct:'Hồi Phục',lootPct:'Rơi Đồ',hpPct:'HP',dotPct:'DoT'};
  const effectRows=selected?(()=>{if(selected.effects)return Object.entries(selected.effects).filter(([,v])=>Math.abs(Number(v)||0)>.0001).slice(0,8).map(([k,v])=>`<div><span>${esc(statNames[k]||k)}</span><b>+${num(Number(v)*100,1)}%</b></div>`).join('');const stats=selected.category==='manual'&&selected.progress?.owned?(selected.effectiveStats||selected.stats||[]):(selected.stats||[]);return stats.slice(0,8).map(st=>`<div><span>${esc(statNames[st.id]||st.id)}</span><b>${v127ManualStatValue(st)}</b></div>`).join('');})():'';
  const p=selected?.progress||{};let controls='';
  if(selected){
    if(!p.owned&&selected.category!=='heart')controls+=selected.category==='manual'&&!selected.unlocked?`<button class="button" disabled>Mở ở ${esc(selected.realmName||'cảnh giới sau')}</button>`:`<button class="button gold" data-collection-compose-v12326="${esc(selected.id)}" ${Number(p.specificFragments||0)<Number(selected.composeCost||Infinity)?'disabled':''}>Ghép · ${num(selected.composeCost||0)} Mảnh</button>`;
    if(selected.category==='heart'&&selected.heart?.learned)controls+=`<button class="button ghost" data-heart-strengthen-v12325="${esc(selected.linkedPassiveId)}" ${Number(selected.heart.level||1)>=20?'disabled':''}>Tu Luyện</button><button class="button gold" data-heart-advance-v12325="${esc(selected.linkedPassiveId)}" ${Number(selected.heart.level||1)<20?'disabled':''}>Tiến Bậc · ${num(p.specificFragments||0)} mảnh</button>`;
    else if(p.owned&&['manual','artifact','relic','pet','companion'].includes(selected.category)){const strengthenCost=Number(selected.strengthenCost||0),advanceCost=Number(selected.advanceCost||0),essenceCost=Number(selected.ascensionCost||0),genericOwned=Number(cat.genericFragments||0),essenceOwned=Number(cat.ascensionEssence||0),fragmentOwned=Number(p.specificFragments||0);controls+=selected.category==='manual'?v127ManualUpgradeControls(selected,cat):selected.category==='artifact'||selected.category==='relic'?`<button class="button ghost" data-collection-strengthen-v12325="${esc(selected.id)}" ${Number(p.level||1)>=100||genericOwned<strengthenCost?'disabled':''}>Luyện Hóa +1 · ${num(strengthenCost)} ${esc(cat.genericFragmentName||'nguyên liệu')}</button><button class="button gold" data-collection-advance-v12325="${esc(selected.id)}" ${Number(p.advance||0)>=4||fragmentOwned<advanceCost||essenceOwned<essenceCost?'disabled':''}>Bảo Giai · ${num(advanceCost)} mảnh + ${num(essenceCost)} ${esc(cat.ascensionName||'đột phá')}</button>`:`<button class="button ghost" data-collection-strengthen-v12325="${esc(selected.id)}">Cường Hóa</button><button class="button ghost" data-collection-advance-v12325="${esc(selected.id)}">Tiến Giai · ${num(p.specificFragments||0)} mảnh</button>`;}
    if(p.owned&&['relic','pet','companion'].includes(selected.category))controls+=`<button class="button ${selected.active?'ghost':'gold'}" data-collection-${selected.active?'unequip':'equip'}-v12325="${esc(selected.id)}">${selected.category==='relic'?(selected.active?'Gỡ Chí Bảo':'Kích Hoạt Chí Bảo'):(selected.active?'Gỡ':'Trang Bị / Ra Trận')}</button>`;
    if(p.owned&&selected.category==='bloodline')controls+=selected.active?`<button class="button ghost" data-blood-purify>Tinh Luyện Độ Thuần</button><button class="button gold" data-blood-advance>Đột Phá Bậc</button>`:`<button class="button gold" data-origin-activate-v12326="${esc(selected.id)}" data-origin-category="bloodline">Kích Hoạt Huyết Mạch</button>`;
    if(p.owned&&selected.category==='physique')controls+=selected.active?`<button class="button gold" data-physique-advance>Tu Luyện / Đột Phá</button>`:`<button class="button gold" data-origin-activate-v12326="${esc(selected.id)}" data-origin-category="physique">Kích Hoạt Thể Chất</button>`;
  }
  const selectedIndex=Math.max(0,items.indexOf(selected));
  const detail=selected?`<aside class="v2326-detail ${gradeCls(selected.grade)}"><div class="v2326-detail-hero"><img src="${art(selected.category,selectedIndex)}" alt="${esc(selected.name)}"><div><span>${esc(selected.gradeLabel||'Phàm')} · ${esc(cat.label)}</span><h2>${esc(selected.name)}</h2><p>${esc(selected.description||cat.role||'')}</p>${selected.category==='manual'?`<small>${esc(selected.realmName||'')} · ${esc(selected.manualRole||'')} · ${v127ManualProgressLabel(selected,p)}</small>`:''}</div></div><div class="v2326-detail-stats">${effectRows||'<div><span>Vai trò</span><b>'+esc(cat.role||'Build')+'</b></div>'}</div><div class="v2326-progression"><div><small>Nguyên liệu cường hóa</small><b>${esc(cat.genericFragmentName||'Nguyên liệu')} · ${num(cat.genericFragments||0)}</b></div><div><small>Nguyên liệu đột phá</small><b>${esc(cat.ascensionName||'Đột phá')} · ${num(cat.ascensionEssence||0)}</b></div><div><small>Mảnh riêng</small><b>${num(p.specificFragments||0)} · chỉ từ Gacha</b></div></div>${v127ManualGateDetail(selected,cat)}${(selected.category==='artifact'||selected.category==='relic')&&p.owned?v88ArtifactPanel(selected,cat):''}<div class="tag-row">${controls||'<span class="small muted">Chưa có thao tác khả dụng.</span>'}</div></aside>`:'';
  const featured=(banner.featured||[])[0],rateUp=banner.rateUp||{},v100=c.v100||{};
  const rateUpText=featured?(rateUp.strictFiftyFifty?`${esc(featured.gradeLabel)} rate-up 50/50 · trượt sẽ loại rate-up khỏi pool · lần đủ điều kiện sau bảo đảm`:`${esc(featured.gradeLabel)} · ${num(rateUp.alternativeCount||0)>0?'rate-up theo pool':'mục duy nhất ở phẩm này, không áp 50/50 giả'}`):'Không có rate-up';
  const gacha=`<section class="v2326-gacha-banner ${gradeCls(featured?.grade)}"><div class="v2326-gacha-copy"><span>V100 · VẠN TƯỢNG CANONICAL · ${esc(cat.label).toUpperCase()}</span><h2>${esc(banner.name||`Chiêu Mộ ${cat.label}`)}</h2><p>${esc(banner.subtitle||'Phần lớn là nguyên liệu; mảnh riêng chỉ từ gacha.')}</p>${featured?`<div class="v2326-featured"><b>RATE-UP</b><strong>${esc(featured.gradeLabel)} · ${esc(featured.name)}</strong><small>${rateUpText}</small></div>`:''}<div class="v2326-pity"><i>Huyền+ <b>${esc(pity.mystic||'0/10')}</b></i><i>Thiên+ <b>${esc(pity.heaven||'0/60')}</b></i><i>Tiên+ <b>${esc(pity.immortal||'0/120')}</b></i></div><div class="v2326-gacha-rates"><span>74% Cường hóa</span><span>8% Đột phá</span><span>16% Mảnh</span><span>2% Món hoàn chỉnh</span><span>${rateUpText}</span></div><div class="v100-gacha-rule">1 banner / 1 hệ / 1 pity track · Quay 1: ${num(v100.singlePullCost||160)} · Quay 10: ${num(v100.tenPullCost||1440)} · không giới hạn lượt quay</div><div class="v2326-gacha-actions"><button class="${!collectionUi.usePremium?'active':''}" data-gacha-currency="bound">Tiên Ngọc Khóa ${num(c.currencies?.boundImmortalJade||0)}</button><button class="${collectionUi.usePremium?'active':''}" data-gacha-currency="premium">Tiên Ngọc ${num(c.currencies?.immortalJade||0)}</button><button class="gold" data-collection-gacha-v12326="1">Quay 1 · 160</button><button class="gold" data-collection-gacha-v12326="10" aria-label="Rút 10 · 1.440">Quay 10 · 1.440</button></div></div><div class="v2326-gacha-art"><img src="${art(cat.category,7)}" alt="${esc(cat.label)}"></div></section>`;
  const history=(c.history||[]).filter(x=>x.category===cat.category).slice(0,8).map(h=>`<div class="v2326-history-row"><span>${h.kind==='material'?'Tinh hoa':h.kind==='breakthrough'?'Đột phá':h.kind==='fragment'?'Mảnh':'Món'} · ${esc(h.name)}</span><b>${h.amount>1?`×${num(h.amount)}`:(h.first?'Mới':'')}</b></div>`).join('')||'<div class="small muted">Chưa quay banner này.</div>';
  return page('Vạn Tượng',`${cat.label} · Gacha riêng → Phó Bản farm nguyên liệu → Động Phủ nâng cấp.`,`<section class="v2326-collection"><div class="v2326-cat-tabs">${catTabs}</div>${gacha}${manualBannerUi}<div class="v2326-collection-toolbar"><div><strong>${esc(cat.label)}</strong><span>${num(cat.owned)}/${num(cat.total)} đã sở hữu</span></div><button class="button ghost" data-collection-owned-toggle>${collectionUi.ownedOnly?'Hiện tất cả':'Chỉ đã sở hữu'}</button></div><div class="v2326-collection-layout"><section class="v2326-item-grid">${cards}</section>${detail}</div><details class="v2326-history"><summary>Tỷ lệ & lịch sử</summary>${history}</details>${DEV_MODE?`<div class="tag-row" style="margin-top:12px"><button class="button ghost" data-dev-gacha-sim-v12326>DEV · 10.000 lượt ${esc(cat.label)}</button><button class="button ghost" data-dev-collection-grant-v12326>DEV · MAX collection</button></div>`:''}</section>`);
}


function renderAlpha(){
  const a=model.alpha,s=model.saveIntegrity;
  const cls=a.status==='ready'?'ready':a.status==='blocked'?'blocked':'warn';
  return page('Mức sẵn sàng thử nghiệm','Kiểm tra lõi, bản lưu, luồng chơi, thống kê và kế hoạch phải cùng hoạt động qua giao diện web.',`<div class="grid cols-3"><div class="card ${a.status==='ready'?'good':a.status==='blocked'?'bad':'warn'}"><div class="eyebrow">Trạng thái thử nghiệm</div><div class="big-number">${a.score}/100</div><span class="status-pill ${cls}">${esc(a.status)}</span></div><div class="card"><div class="eyebrow">Độ toàn vẹn bản lưu</div><div class="big-number">${s.ok?'OK':'LỖI'}</div>${metric('Cảnh báo',s.warnings.length)}${metric('Sửa chữa',s.repaired.length)}</div><div class="card"><div class="eyebrow">Giao tiếp nội bộ</div><div class="big-number">v1</div>${metric('Trình chơi',model.clientVersion)}${metric('Phiên bản dữ liệu',model.schema)}</div></div><div class="card" style="margin-top:14px"><h2>Kiểm tra chấp nhận</h2>${a.checks.map(c=>`<div class="check-row"><div class="check-icon ${c.ok?'':'bad'}">${c.ok?'✓':'!'}</div><div><strong>${esc(c.label)}</strong><div class="small muted">${esc(c.detail)}</div></div></div>`).join('')}</div>${a.blockers.length?`<div class="card bad" style="margin-top:14px"><h2>Điểm chặn</h2>${a.blockers.map(x=>`<div class="small">• ${esc(x)}</div>`).join('')}</div>`:''}${a.warnings.length?`<div class="card warn" style="margin-top:14px"><h2>Theo dõi trong thử nghiệm</h2>${a.warnings.map(x=>`<div class="small">• ${esc(x)}</div>`).join('')}</div>`:''}<div class="footer-note">Mốc thử nghiệm không có nghĩa game đã cân xong giai đoạn cuối; nó xác nhận Phàm→Kim Đan, phối đồ/thủ lĩnh, Luân Hồi, nhàn rỗi, bản lưu và giao diện có thể chơi được thật.</div>`);
}
function v239BindDongFuPanelActions(scope=content){
  scope.querySelectorAll('[data-dongfu-section]').forEach(btn=>btn.onclick=()=>{dongfuUi.section=btn.dataset.dongfuSection||'home';activeTab='dongfu';render();hydrateViewV129('dongfu',{force:true}).catch(()=>{});});
  scope.querySelectorAll('[data-farm-category]').forEach(btn=>btn.onclick=()=>{dungeonUi.resourceCategory=btn.dataset.farmCategory||null;activeTab='dungeons';render();hydrateViewV129('dungeons',{force:true}).catch(()=>{});requestAnimationFrame(()=>content.querySelector('.v2329-resource-card.focus')?.scrollIntoView({behavior:'smooth',block:'center'}));});
  scope.querySelectorAll('[data-dongfu-open-dungeons-general]').forEach(btn=>btn.onclick=()=>{dungeonUi.resourceCategory=null;activeTab='dungeons';render();showNotice('Đan Phòng/Luyện Khí dùng nguyên liệu nghề; 23.29 chưa có bí cảnh tài nguyên riêng cho hai nghề này.');});
}
/* V141 bindDynamic split helpers */
function bindWorldSocialActionsV141(qsaV129,qsV129){
  qsaV129('[data-guide-section]').forEach(btn=>btn.onclick=()=>{guideUi.section=btn.dataset.guideSection||'today';activeTab='guide';renderPreservingUi();});
  qsaV129('[data-travel-location]').forEach(btn=>btn.onclick=async()=>{const id=btn.dataset.travelLocation;if(!id)return;const loc=(model.locations||[]).find(x=>x.id===id);const ok=await confirmAction('Du Hành',`Tới ${loc?.name||id}? Hành động này thực thi explore thật và có thể làm thời gian thế giới trôi.`);if(ok)perform({type:'activity',request:{type:'explore',targetLocationId:id,durationYears:0.1,stopOnMajorEvent:true}});});
  qsaV129('[data-soul-nourish]').forEach(btn=>btn.onclick=()=>perform({type:'nourishSoul',batches:Number(btn.dataset.soulNourish||1)}));
  qsaV129('[data-soul-dao-train]').forEach(btn=>btn.onclick=()=>perform({type:'trainSoulCloneDaoHanhV128',cloneId:btn.dataset.soulDaoTrain,levels:1}));
  qsaV129('[data-soul-dao-seal]').forEach(btn=>btn.onclick=async()=>{if(await confirmAction('Thăng Lục Đạo Ấn','Thăng Ấn sẽ tiêu Dưỡng Hồn Lộ và Thần Hồn Tinh Hoa, mở tiếp 10 cấp Đạo Hạnh kế tiếp.'))perform({type:'upgradeSoulCloneSealV128',cloneId:btn.dataset.soulDaoSeal});});
  qsaV129('[data-soul-create]').forEach(btn=>btn.onclick=async()=>{const next=model.soul?.nextCloneDao;if(await confirmAction('Phân Hóa Thần Hồn',`Tạo ${next?.name||'Phân Thân Lục Đạo'} kế tiếp? Lục Đạo được mở theo thứ tự cố định; chi phí tăng theo số Phân Thân đang sở hữu.`))perform({type:'createSoulClone'});});
  qsaV129('[data-soul-dismiss]').forEach(btn=>btn.onclick=async()=>{if(await confirmAction('Thu Hồi Phân Thân','Phân Thân sẽ rời nhiệm vụ hiện tại và giải phóng tải Thần Hồn.'))perform({type:'dismissSoulClone',cloneId:btn.dataset.soulDismiss});});
  qsaV129('[data-soul-assign]').forEach(btn=>btn.onclick=()=>perform({type:'assignSoulClone',cloneId:btn.dataset.soulAssign,dungeonId:btn.dataset.dungeon,floor:Number(btn.dataset.floor||1)}));
  qsaV129('[data-soul-protector]').forEach(btn=>btn.onclick=()=>perform({type:'setSoulCloneProtectorV127',cloneId:btn.dataset.soulProtector,enabled:btn.dataset.enabled==='1'}));
  qsaV129('[data-faction-join]').forEach(btn=>btn.onclick=async()=>{const f=(model.faction?.factions||[]).find(x=>x.id===btn.dataset.factionJoin);if(await confirmAction('Bái Nhập Tông Môn',`Gia nhập ${f?.name||btn.dataset.factionJoin}?`))perform({type:'joinFaction',factionId:btn.dataset.factionJoin});});
  qsV129('[data-faction-leave]')?.addEventListener('click',async()=>{if(await confirmAction('Rời Tông Môn','Danh phận tông môn của đời hiện tại sẽ kết thúc.'))perform({type:'leaveFaction'});});
  qsaV129('[data-faction-contribute]').forEach(btn=>btn.onclick=()=>perform({type:'factionContribute',resourceId:'resource.spirit_stone',quantity:Number(btn.dataset.factionContribute||10)}));
  qsV129('[data-faction-promote]')?.addEventListener('click',()=>perform({type:'factionPromote'}));
  qsaV129('[data-faction-upgrade]').forEach(btn=>btn.onclick=async()=>{if(await confirmAction('Nâng Cơ Sở Tông Môn',`Nâng ${btn.dataset.factionUpgrade}? Chi phí lấy từ tài nguyên Tông Môn theo luật backend.`))perform({type:'factionUpgradeFacility',facilityId:btn.dataset.factionUpgrade});});
  qsaV129('[data-faction-learn]').forEach(btn=>btn.onclick=()=>perform({type:'factionLearn',kind:btn.dataset.factionLearn,knowledgeId:btn.dataset.knowledge}));
  qsaV129('[data-faction-knowledge]').forEach(btn=>btn.onclick=()=>perform({type:'factionContributeKnowledge',kind:btn.dataset.factionKnowledge,knowledgeId:btn.dataset.knowledge}));
  qsaV129('[data-faction-invite]').forEach(btn=>btn.onclick=async()=>{if(await confirmAction('Chiêu Mộ Môn Nhân','Mời NPC này gia nhập Tông Môn theo quan hệ và cảnh giới hiện tại?'))perform({type:'factionInvite',npcId:btn.dataset.factionInvite});});
  qsaV129('[data-faction-teach]').forEach(btn=>btn.onclick=()=>perform({type:'factionTeach',npcId:btn.dataset.factionTeach,knowledgeId:btn.dataset.knowledge}));
  qsV129('[data-faction-found]')?.addEventListener('click',async()=>{const name=prompt('Tên Tông Môn mới','Vô Danh Tiên Môn')?.trim();if(!name)return;if(await confirmAction('Khai Sơn Lập Phái',`Lập ${name} tại địa điểm hiện tại, tiêu 300 Linh Thạch?`))perform({type:'foundFaction',name,doctrineTags:[]});});
  qsaV129('[data-social-interact]').forEach(btn=>btn.onclick=()=>perform({type:'interactNpc',npcId:btn.dataset.socialInteract,action:btn.dataset.socialAction||'greet'}));
  qsaV129('[data-social-role]').forEach(btn=>btn.onclick=async()=>{const role=btn.dataset.socialRole,npcId=btn.dataset.npc;const label=role==='master'?'Bái Sư':role==='disciple'?'Thu Đồ':'Kết Đạo Lữ';if(await confirmAction(label,'Quan hệ trọng yếu này được lưu vào đời hiện tại và có gameplay riêng.'))perform({type:role==='master'?'takeMaster':role==='disciple'?'acceptDisciple':'formDaoPartnership',npcId});});
  qsaV129('[data-master-teach]').forEach(btn=>btn.onclick=()=>perform({type:'receiveMasterTeaching',npcId:btn.dataset.masterTeach}));
  qsaV129('[data-disciple-teach]').forEach(btn=>btn.onclick=()=>perform({type:'teachDisciple',npcId:btn.dataset.discipleTeach}));
  qsaV129('[data-partner-cultivate]').forEach(btn=>btn.onclick=()=>perform({type:'cultivateWithDaoPartner',npcId:btn.dataset.partnerCultivate,years:0.25}));
  qsaV129('[data-partner-child]').forEach(btn=>btn.onclick=async()=>{if(await confirmAction('Kết Duyên Hậu Đại','Sinh hậu duệ sẽ làm thời gian thế giới trôi và tạo FamilyMember thật.'))perform({type:'haveChildWithDaoPartner',npcId:btn.dataset.partnerChild});});
  qsaV129('[data-parent-guidance]').forEach(btn=>btn.onclick=()=>perform({type:'receiveParentGuidance',parentId:btn.dataset.parentGuidance}));
  qsaV129('[data-dao-contemplate]').forEach(btn=>btn.onclick=()=>perform({type:'contemplateDao',daoId:model.dao?.canonicalDaoId,years:Number(btn.dataset.daoContemplate||1)}));
  qsaV129('[data-dao-interpretation]').forEach(btn=>btn.onclick=async()=>{const id=btn.dataset.daoInterpretation;if(await confirmAction('Diễn Giải Đạo Ý','Diễn giải định hướng modifier/triggers của Đạo Ý và Đạo Vực.'))perform({type:'setDaoInterpretation',daoId:model.dao?.canonicalDaoId,interpretationId:id});});
  qsaV129('[data-dao-domain]').forEach(btn=>btn.onclick=()=>perform({type:'setDaoDomain',active:btn.dataset.daoDomain==='1'}));
}

function bindDongFuEconomyActionsV141(qsaV129,qsV129){
  v239BindDongFuPanelActions(content);
  qsaV129('[data-v89-route]').forEach(btn=>btn.onclick=()=>{const tab=btn.dataset.v89Route||'dungeons';navigateTo(tab);});
  qsaV129('[data-v89-offer]').forEach(btn=>btn.onclick=()=>action({action:'economyOfferV89',offerId:btn.dataset.v89Offer,nowUnixMs:Date.now()}).catch(()=>{}));
  qsaV129('[data-economy-buy]').forEach(btn=>btn.onclick=()=>action({action:'economyBuyV111',slotId:btn.dataset.economyBuy,quantity:Number(btn.dataset.qty||1)}).catch(()=>{}));
  qsaV129('[data-economy-sell]').forEach(btn=>btn.onclick=()=>action({action:'economySellV111',resourceId:btn.dataset.economySell,quantity:Number(btn.dataset.qty||1)}).catch(()=>{}));
  qsaV129('[data-economy-convert]').forEach(btn=>btn.onclick=()=>action({action:'economyConvertV111',resourceId:btn.dataset.economyConvert,batches:Number(btn.dataset.batches||1)}).catch(()=>{}));
  qsV129('[data-economy-refresh]')?.addEventListener('click',async()=>{const cost=Number(model?.economy?.shop?.manualRefreshCost||0);if(await confirmAction('Làm mới Phường Thị',`Tiêu ${num(cost)} Linh Thạch để đổi stock ngay?`))action({action:'economyRefreshV111'}).catch(()=>{});});
  if(activeTab==='dongfu'&&dongfuUi.section==='home'&&dongFuPixiModule)dongFuPixiModule.bindDongFuLayoutEditor({scope:content,enabled:DEV_MODE&&URL_PARAMS.get('dongfuLayout')==='1'});
  qsaV129('[data-dongfu-hub-select]').forEach(btn=>btn.onclick=()=>{
    const id=btn.dataset.dongfuHubSelect||'alchemy';dongfuUi.hubSelected=id;dongFuPixiModule?.updateDongFuPixiSelection?.(id);
    qsaV129('[data-dongfu-hub-select]').forEach(x=>x.classList.toggle('selected',x===btn));
    const meta=v239DongFuBuildingMeta().find(x=>x.id===id);const old=qsV129('[data-dongfu-info-panel]');
    if(meta&&old){old.outerHTML=v239DongFuInfoPanel(meta);const panel=qsV129('[data-dongfu-info-panel]');if(panel)v239BindDongFuPanelActions(panel);}
  });
  qsaV129('[data-dongfu-quick-collect]').forEach(btn=>btn.onclick=()=>showNotice('Đan/Luyện Khí hiện tự đồng bộ thành phẩm vào kho khi hoàn tất; không có vật phẩm chờ nhận thủ công.'));
}

function bindJourneyCultivationActionsV141(qsaV129,qsV129){
  qsaV129('[data-v90-journey-action]').forEach(btn=>btn.onclick=()=>{const a=(model?.flow?.actions||[]).find(x=>x.key===btn.dataset.v90JourneyAction);if(a?.command)perform(a.command);else if(a?.view)navigateTo(a.view==='dashboard'?'cultivation':a.view);else if(model?.flow?.journey?.currentRoute)navigateTo(model.flow.journey.currentRoute);});
  qsaV129('[data-v90-journey-route]').forEach(btn=>btn.onclick=()=>navigateTo(btn.dataset.v90JourneyRoute||model?.flow?.journey?.currentRoute||'cultivation'));
  qsaV129('[data-flow-index]').forEach(btn=>btn.onclick=()=>{const a=model.flow.actions.find(x=>x.index===Number(btn.dataset.flowIndex));if(a?.command)perform(a.command);else if(a?.view){navigateTo(a.view==='dashboard'?'cultivation':a.view);}});
  qsaV129('[data-dao-suy-tribulation]').forEach(btn=>btn.onclick=()=>action({action:'daoSuyTribulationV127'}).catch(()=>{}));
  qsaV129('[data-live-mode]').forEach(btn=>btn.onclick=()=>action({action:'realtimeMode',mode:btn.dataset.liveMode}).catch(()=>{}));
  qsaV129('[data-retreat-hours]').forEach(btn=>btn.onclick=()=>action({action:'retreatV140',hours:Number(btn.dataset.retreatHours||3)}).catch(()=>{}));
  qsV129('[data-ascend-realm-v140]')?.addEventListener('click',()=>action({action:'ascendRealmV140'}).catch(()=>{}));
  qsV129('[data-tribulation-v140]')?.addEventListener('click',()=>perform({type:'tribulation',intensity:1}).catch?.(()=>{}));
  qsaV129('[data-hunt-auto-toggle]').forEach(btn=>btn.onclick=()=>action({action:'huntAutoCombat',enabled:btn.dataset.huntAutoToggle==='1'}).catch(()=>{}));
  qsV129('[data-live-pause]')?.addEventListener('click',()=>action({action:'realtimePause',paused:!live?.paused}).catch(()=>{}));
  qsaV129('[data-endless-fight]').forEach(btn=>btn.onclick=()=>action({action:'endlessFight'}).catch(()=>{}));
  qsaV129('[data-endless-boss]').forEach(btn=>btn.onclick=()=>action({action:'endlessBoss'}).catch(()=>{}));
  qsaV129('[data-map-floor]').forEach(btn=>btn.onclick=()=>action({action:'endlessFloor',floor:Number(btn.dataset.mapFloor)}).catch(()=>{}));
  qsV129('[name="secretRealmMajor"]')?.addEventListener('change',e=>action({action:'endlessFloor',floor:Number(e.target.value||1)}).catch(()=>{}));
  qsV129('[data-use-cultivation-pill]')?.addEventListener('click',()=>action({action:'useCultivationPill'}).catch(()=>{}));
  qsV129('[data-select-floor]')?.addEventListener('click',()=>action({action:'endlessFloor',floor:Number(qsV129('[name="floorSelect"]')?.value||1)}));
  qsV129('[data-auto-advance]')?.addEventListener('click',()=>action({action:'endlessAutoAdvance',enabled:qsV129('[name="autoAdvance"]')?.value==='1'}));
}

function bindInventoryNavigationActionsV141(qsaV129,qsV129){
  qsaV129('[data-open-inventory]').forEach(btn=>btn.onclick=()=>{if(!tabUnlocked('inventory')){showNotice(tabUnlockText('inventory'),true);return;}activeTab='inventory';inventoryUi.view=btn.dataset.openInventory||'gear';const slot=btn.dataset.inventorySlot,itemId=btn.dataset.inventoryItem;if(inventoryUi.view==='gear'&&slot){inventoryUi.group='all';inventoryUi.slot=slot;inventoryUi.setId='all';}if(itemId)inventoryUi.selectedId=itemId;if(inventoryUi.view==='forge'){inventoryUi.forgeTab='enhance';}if(inventoryUi.view==='sets'){inventoryUi.setFilter='current';inventoryUi.setCategory='all';inventoryUi.setIdentity='all';inventoryUi.setSearch='';}render();});
  qsaV129('[data-tab-jump]').forEach(btn=>btn.onclick=()=>navigateTo(btn.dataset.tabJump));
  qsaV129('[data-dongfu-section]').forEach(btn=>btn.onclick=()=>{dongfuUi.section=btn.dataset.dongfuSection||'home';activeTab='dongfu';render();hydrateViewV129('dongfu',{force:true}).catch(()=>{});});
  qsaV129('[data-workshop-category]').forEach(btn=>btn.onclick=()=>{dongfuUi.category=btn.dataset.workshopCategory;dongfuUi.selectedId=null;renderPreservingUi();});
  qsaV129('[data-workshop-manual-realm]').forEach(sel=>sel.onchange=()=>{dongfuUi.manualRealmStage=Number(sel.value);dongfuUi.selectedId=null;hydrateViewV129('dongfu',{force:true}).catch(()=>{});});
  qsaV129('[data-workshop-item]').forEach(btn=>btn.onclick=()=>{dongfuUi.selectedId=btn.dataset.workshopItem;renderPreservingUi();});
  qsV129('[data-alchemy-family-filter]')?.addEventListener('change',e=>{dongfuUi.alchemyFamily=e.target.value||'all';dongfuUi.alchemyRecipeId=null;renderPreservingUi();});
  qsaV129('[data-alchemy-recipe]').forEach(btn=>btn.onclick=()=>{dongfuUi.alchemyRecipeId=btn.dataset.alchemyRecipe;renderPreservingUi();});
  qsaV129('[data-alchemy-start]').forEach(btn=>btn.onclick=()=>action({action:'alchemyStartV12328',family:btn.dataset.family,realmTier:Number(btn.dataset.tier),batchSize:Number(btn.dataset.batch),furnaceIndex:Number(btn.dataset.furnace)}));
  qsV129('[data-alchemy-promote]')?.addEventListener('click',()=>action({action:'alchemyPromoteV85'}));
  qsaV129('[data-alchemy-use-pill]').forEach(btn=>btn.onclick=()=>action({action:'alchemyUsePillV85',resourceId:btn.dataset.alchemyUsePill}));
  qsaV129('[data-alchemy-learn-recipe]').forEach(btn=>btn.onclick=()=>action({action:'alchemyRecipeLearnV85',recipeId:btn.dataset.alchemyLearnRecipe}));
  qsV129('[data-alchemy-garden-seed]')?.addEventListener('change',e=>{dongfuUi.alchemyGardenSeedId=e.target.value||null;renderPreservingUi();});
  qsaV129('[data-alchemy-garden-plant]').forEach(btn=>btn.onclick=()=>{const seed=(model.alchemy?.garden?.seeds||[]).find(x=>x.resourceId===dongfuUi.alchemyGardenSeedId);if(!seed){showNotice('Chưa chọn Linh Chủng.',true);return;}action({action:'alchemyGardenPlantV85',variant:seed.variant,realmTier:Number(seed.realmTier),slot:Number(btn.dataset.alchemyGardenPlant)});});
  qsaV129('[data-alchemy-garden-harvest]').forEach(btn=>btn.onclick=()=>action({action:'alchemyGardenHarvestV85',slot:Number(btn.dataset.alchemyGardenHarvest)}));
  qsaV129('[data-forge-recipe]').forEach(btn=>btn.onclick=()=>{dongfuUi.forgeRecipeId=btn.dataset.forgeRecipe;renderPreservingUi();});
  qsaV129('[data-forging-start]').forEach(btn=>btn.onclick=()=>action({action:'forgingStartV12328',recipeId:btn.dataset.forgingStart,nowUnixMs:Date.now()}));
  qsaV129('[data-talisman-craft]').forEach(btn=>btn.onclick=()=>perform({type:'craftTalismanV128',recipeId:btn.dataset.talismanCraft,quantity:1}));
  qsaV129('[data-talisman-use]').forEach(btn=>btn.onclick=()=>perform({type:'useTalismanV128',productId:btn.dataset.talismanUse,quality:btn.dataset.quality}));
  qsaV129('[data-dungeon-section]').forEach(btn=>btn.onclick=()=>{dungeonUi.section=btn.dataset.dungeonSection||'home';activeTab='dungeons';render();hydrateViewV129('dungeons',{force:true}).catch(()=>{});});
  qsaV129('[data-farm-category]').forEach(btn=>btn.onclick=()=>{dungeonUi.resourceCategory=btn.dataset.farmCategory||null;activeTab='dungeons';render();hydrateViewV129('dungeons',{force:true}).catch(()=>{});requestAnimationFrame(()=>qsV129('.v2329-resource-card.focus')?.scrollIntoView({behavior:'smooth',block:'center'}));});
  qsaV129('[data-scroll-resource]').forEach(btn=>btn.onclick=()=>qsV129('[data-resource-section]')?.scrollIntoView({behavior:'smooth',block:'start'}));
  qsaV129('[data-resource-challenge]').forEach(btn=>btn.onclick=async()=>{if(btn.disabled)return;try{const payload=await action({action:'challengeBoss',dungeonId:btn.dataset.resourceChallenge,floor:Number(btn.dataset.floor||1)});const result=payload?.result||{},drop=result.resourcePve;if(drop){const lines=[result.won?`Chiến thắng · ${drop.dungeonName||'Bí Cảnh Tài Nguyên'} tầng ${num(drop.floor||btn.dataset.floor||1)}`:'Khiêu chiến thất bại.',...(drop.drops||[])];if(result.won)lines.push('Mảnh Riêng: 0 · chỉ nhận từ Gacha');showNotice(lines.slice(0,4),!result.won);}activeTab='dungeons';renderPreservingUi();}catch{}});
  qsaV129('[data-resource-farm]').forEach(btn=>btn.onclick=async()=>{if(btn.disabled)return;try{const payload=await action({action:'perform',command:{type:'activity',request:{type:'dungeon',dungeonId:btn.dataset.resourceFarm,floor:Number(btn.dataset.floor||1),durationYears:1}}});const r=payload?.result||{};showNotice((r.summaryLines||['Đã hoàn tất 1 năm treo Phó Bản.']).slice(0,4));activeTab='dungeons';renderPreservingUi();}catch{}});
  qsaV129('[data-pvp-join]').forEach(btn=>btn.onclick=async()=>{try{const payload=await action({action:'pvpJoinV91',nowUnixMs:Date.now()});showNotice(payload.result?.joined?'Đã Lập Trận · mùa Đấu Pháp bắt đầu.':'Trận đã được lập từ trước.');}catch{}});
  qsaV129('[data-pvp-defense]').forEach(btn=>btn.onclick=async()=>{try{await action({action:'pvpDefenseV91',nowUnixMs:Date.now()});showNotice('Đã cập nhật snapshot Trận Phòng Thủ.');}catch{}});
  qsaV129('[data-pvp-tactical]').forEach(btn=>btn.onclick=async()=>{if(btn.disabled)return;try{const payload=await action({action:'pvpTacticalV94',presetId:btn.dataset.pvpTactical,nowUnixMs:Date.now()});showNotice(`Chiến thuật PvP: ${payload.result?.selected?.name||'đã cập nhật'}.`);}catch{}});
  qsaV129('[data-pvp-season-settle]').forEach(btn=>btn.onclick=async()=>{if(btn.disabled)return;try{const payload=await action({action:'pvpSeasonSettleV94',nowUnixMs:Date.now()});const r=payload.result||{};showNotice(`Đã chốt mùa · ${r.summary?.rank?.name||''}${r.reward?.boundJade?` · +${num(r.reward.boundJade)} Tiên Ngọc Khóa`:''} · mùa mới ${num(r.pvp?.rating||r.nextSeason?.softResetPreview||1000)} RP.`);}catch{}});
  qsaV129('[data-pvp-challenge]').forEach(btn=>btn.onclick=async()=>{if(btn.disabled)return;try{const payload=await action({action:'pvpChallengeV91',opponentId:btn.dataset.pvpChallenge,nowUnixMs:Date.now()});const r=payload.result||{};showNotice(`${r.won?'Thắng':r.draw?'Hòa':'Bại'} · Rating ${r.ratingDelta>=0?'+':''}${num(r.ratingDelta||0)}${r.rewardBoundJade?` · +${num(r.rewardBoundJade)} Tiên Ngọc Khóa`:''}`);}catch{}});
  qsaV129('[data-pvp-replay]').forEach(btn=>btn.onclick=async()=>{const fightId=btn.dataset.pvpReplay;if(!fightId)return;pvpReplayUi={fightId,data:null,loading:true,error:''};renderPreservingUi();try{const payload=await request(`/api/pvp/replay?fightId=${encodeURIComponent(fightId)}`);pvpReplayUi={fightId,data:payload.replay||null,loading:false,error:''};}catch(error){pvpReplayUi={fightId,data:null,loading:false,error:error?.message||'Không phát lại được trận.'};}renderPreservingUi();});
  qsaV129('[data-open-collection-category]').forEach(btn=>btn.onclick=()=>{collectionUi.category=btn.dataset.openCollectionCategory||'manual';collectionUi.banner=`banner.${collectionUi.category}`;collectionUi.selectedId=null;collectionUi.ownedOnly=false;activeTab='collection';render();hydrateViewV129('collection',{force:true}).catch(()=>{});});
  qsaV129('[data-dongfu-panel]').forEach(btn=>btn.onclick=()=>{const id=btn.dataset.dongfuPanel;if(!id)return;const panel=qsV129(`[data-sheet-panel="${CSS.escape(`dongfu-${id}`)}"]`);if(panel){qsaV129('.v106-sheet.open').forEach(x=>x.classList.remove('open'));panel.classList.add('open');}});
  qsaV129('[data-root-nourish]').forEach(btn=>btn.onclick=()=>action({action:'spiritualRootNourishV145',levels:Number(btn.dataset.rootNourish)||1}));
  qsaV129('[data-root-ascend]').forEach(btn=>btn.onclick=()=>action({action:'spiritualRootAscendV145'}));
  qsaV129('[data-root-meridian]').forEach(btn=>btn.onclick=()=>action({action:'spiritualRootMeridianV145',branchId:btn.dataset.rootMeridian}));
  qsaV129('[data-root-insight]').forEach(btn=>btn.onclick=()=>action({action:'spiritualRootInsightV145',insightId:btn.dataset.rootInsight}));
  qsaV129('[data-root-combine]').forEach(btn=>btn.onclick=()=>action({action:'spiritualRootCombineOriginV145',fromRealmTier:Number(btn.dataset.rootCombine)||1,batches:1}));
  qsaV129('[data-stat-help]').forEach(btn=>btn.onclick=()=>{const key=btn.dataset.statHelp;showNotice(V13819_STAT_HELP[key]||'Chạm vào Thuộc Tính để xem chỉ số này ảnh hưởng đến lối chơi thế nào.');});
  qsaV129('[data-inventory-view]').forEach(btn=>btn.onclick=()=>{inventoryUi.view=btn.dataset.inventoryView||'gear';renderPreservingUi();});
  qsV129('[data-inventory-more]')?.addEventListener('click',()=>{inventoryUi.visibleLimit=Math.max(72,Number(inventoryUi.visibleLimit||72))+72;renderPreservingUi();});
  qsaV129('[data-inventory-filter]').forEach(el=>el.onchange=()=>{inventoryUi[el.dataset.inventoryFilter]=el.value;inventoryUi.visibleLimit=72;renderPreservingUi();hydrateViewV129('inventory',{force:true}).catch(()=>{});});
  qsaV129('[data-inventory-group-chip]').forEach(btn=>btn.onclick=()=>{inventoryUi.group=btn.dataset.inventoryGroupChip||'all';inventoryUi.visibleLimit=72;renderPreservingUi();hydrateViewV129('inventory',{force:true}).catch(()=>{});});
  qsV129('[data-clear-inventory-filters]')?.addEventListener('click',()=>{inventoryUi.group='all';inventoryUi.slot='all';inventoryUi.setId='all';inventoryUi.sort='level';inventoryUi.visibleLimit=72;renderPreservingUi();hydrateViewV129('inventory',{force:true}).catch(()=>{});});
  qsV129('[data-clear-inventory-set]')?.addEventListener('click',()=>{inventoryUi.setId='all';renderPreservingUi();hydrateViewV129('inventory',{force:true}).catch(()=>{});});
  qsaV129('[data-inventory-select]').forEach(btn=>btn.onclick=async()=>{if(btn.dataset.longTriggered==='1')return;const next=btn.dataset.inventorySelect,sheetId=btn.dataset.itemOpen||btn.dataset.itemLong||'';if(inventoryUi.selectedId!==next){inventoryUi.affixIndex=0;inventoryUi.targetFamily='';equipmentIntel={itemId:next,loading:false,data:null,error:''};}inventoryUi.selectedId=next;renderPreservingUi();if(activeTab==='inventory')await hydrateViewV129('inventory',{force:true});if(sheetId){const panel=content.querySelector(`[data-sheet-panel="${CSS.escape(sheetId)}"]`);if(panel){content.querySelectorAll('.v106-sheet.open').forEach(x=>x.classList.remove('open'));panel.classList.add('open');panel.querySelector('.v106-sheet-body')?.focus?.({preventScroll:true});}}});
  qsaV129('[data-build-intel]').forEach(btn=>btn.onclick=()=>loadEquipmentBuildIntelligence(btn.dataset.buildIntel));
  qsaV129('[data-workshop-tab]').forEach(btn=>btn.onclick=()=>{inventoryUi.forgeTab=btn.dataset.workshopTab||'enhance';renderPreservingUi();});
  qsaV129('[data-dao-engrave]').forEach(btn=>btn.onclick=async()=>{const item=(model.equipment||[]).find(x=>x.id===btn.dataset.daoEngrave),def=(model.equipmentSystem?.daoInscriptionCatalog||[]).find(x=>x.id===btn.dataset.daoId);if(!item||!def)return;if(await confirmAction('Khắc Đạo Văn',`${item.name} → ${def.name}: ${def.description} Đạo Văn hiện tại (nếu có) sẽ bị thay. Tiếp tục?`))perform({type:'engraveDaoInscriptionV115',itemId:item.id,inscriptionId:def.id});});
  qsaV129('[data-gem-socket]').forEach(btn=>btn.onclick=()=>perform({type:'socketEquipmentGemV128',itemId:btn.dataset.gemSocket,socketIndex:Number(btn.dataset.socketIndex||0),element:btn.dataset.gemElement}));
  qsaV129('[data-gem-upgrade]').forEach(btn=>btn.onclick=()=>perform({type:'upgradeEquipmentGemV128',itemId:btn.dataset.gemUpgrade,socketIndex:Number(btn.dataset.socketIndex||0)}));
  qsaV129('[data-gem-unsocket]').forEach(btn=>btn.onclick=async()=>{if(await confirmAction('Tháo Ngũ Hành Ngọc','Ngọc sẽ được tháo khỏi ô và hoàn nguyên toàn bộ Ngũ Hành Ngọc Phôi đã đầu tư vào viên này.'))perform({type:'unsocketEquipmentGemV128',itemId:btn.dataset.gemUnsocket,socketIndex:Number(btn.dataset.socketIndex||0)});});
  qsaV129('[data-affix-select]').forEach(btn=>btn.onclick=()=>{inventoryUi.affixIndex=Number(btn.dataset.affixSelect||0);inventoryUi.targetFamily='';renderPreservingUi();});
  qsaV129('[data-reforge-family]').forEach(el=>el.onchange=()=>{inventoryUi.targetFamily=el.value;renderPreservingUi();});
  qsaV129('[data-set-filter]').forEach(btn=>btn.onclick=()=>{inventoryUi.setFilter=btn.dataset.setFilter||'current';renderPreservingUi();});
  qsaV129('[data-set-search]').forEach(el=>{el.onchange=()=>{inventoryUi.setSearch=el.value||'';renderPreservingUi();};el.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();inventoryUi.setSearch=el.value||'';renderPreservingUi();}};});
  qsV129('[data-clear-set-filters]')?.addEventListener('click',()=>{inventoryUi.setFilter='all';inventoryUi.setCategory='all';inventoryUi.setIdentity='all';inventoryUi.setSearch='';renderPreservingUi();});
  qsaV129('[data-set-to-inventory]').forEach(btn=>btn.onclick=()=>{inventoryUi.view='gear';inventoryUi.setId=btn.dataset.setToInventory||'all';inventoryUi.group=btn.dataset.setCategory||'all';inventoryUi.slot='all';renderPreservingUi();});
  // V129 performance: inventory long-press is delegated once on #content; do not attach 5 pointer listeners per card.
}

function bindBuildCollectionActionsV141(qsaV129,qsV129){
  qsaV129('[data-visual-skin]').forEach(btn=>btn.onclick=()=>action({action:'visualProfile',characterSkinId:btn.dataset.visualSkin}));
  qsaV129('[data-visual-background]').forEach(btn=>btn.onclick=()=>action({action:'visualProfile',characterBackgroundId:btn.dataset.visualBackground}));
  qsaV129('[data-visual-expression]').forEach(btn=>btn.onclick=()=>action({action:'visualProfile',selectedExpression:btn.dataset.visualExpression}));
  qsaV129('[data-equip]').forEach(btn=>btn.onclick=()=>{if(btn.disabled)return;const item=(model.equipment||[]).find(x=>x.id===btn.dataset.equip);if(item?.locked){showNotice('Trang bị đang khóa. Hãy mở khóa trước khi thay.',true);return;}return perform({type:'equip',itemId:btn.dataset.equip});});
  qsaV129('[data-loot-lock]').forEach(btn=>btn.onclick=async()=>{const item=(model.equipment||[]).find(x=>x.id===btn.dataset.lootLock);if(!item)return;const next=!item.locked;const ok=next?true:await confirmAction('Mở khóa trang bị',`Mở khóa ${item.name}? Món này sẽ không còn được bảo vệ bởi trạng thái khóa trong quản lý loot.`);if(!ok)return;action({action:'lootLock',itemId:item.id,locked:next});});
  qsaV129('[data-v142-craft-slot]').forEach(select=>select.onchange=()=>{inventoryUi.v142CraftSlot=select.value;renderPreservingUi();});
  qsaV129('[data-v142-craft-rank]').forEach(btn=>btn.onclick=()=>perform({type:'craftEquipmentV142',slot:inventoryUi.v142CraftSlot,rankIndex:Number(btn.dataset.v142CraftRank)}));
  qsaV129('[data-v142-refine]').forEach(btn=>btn.onclick=()=>perform({type:'refineEquipmentFragmentsV142',fromRank:Number(btn.dataset.v142Refine),batches:1}));
  qsaV129('[data-v142-merge]').forEach(btn=>btn.onclick=async()=>{const main=(model.equipment||[]).find(x=>x.id===btn.dataset.v142Merge);if(!main)return;const ok=await confirmAction('Hợp Trang Bị',`Giữ ${main.name} làm món chính, tiêu 2 món cùng ô/cùng bậc để tăng 1 bậc. Tiếp tục?`);if(ok)perform({type:'mergeEquipmentV142',mainItemId:btn.dataset.v142Merge,fodderItemAId:btn.dataset.v142FodderA,fodderItemBId:btn.dataset.v142FodderB});});
  qsaV129('[data-v142-engrave]').forEach(btn=>btn.onclick=async()=>{const item=(model.equipment||[]).find(x=>x.id===btn.dataset.v142Engrave),set=(model.equipmentSystem?.v142?.setRows||[]).find(x=>x.setId===btn.dataset.v142SetId);if(!item||!set)return;const ok=await confirmAction('Khắc Bộ',`Khắc ${set.setName} lên ${item.name}; tiêu ${num(set.engraveCost)} Tàn Ấn. Khắc lại Bộ khác sẽ thay Bộ hiện tại. Tiếp tục?`);if(ok)perform({type:'engraveEquipmentSetV142',itemId:item.id,setId:set.setId});});
  qsaV129('[data-enhance]').forEach(btn=>btn.onclick=async()=>{const item=(model.equipment||[]).find(x=>x.id===btn.dataset.enhance);if(!item)return;const risk=Number(item.nextEnhanceDowngradeChancePct||0),chance=Number(item.nextEnhanceChancePct||0),cost=Number(item.nextEnhanceCost||0);if(risk>0){const ok=await confirmAction('Cường Hóa có rủi ro',`${item.name}: +${num(item.enhancementLevel||0)} → +${num(Number(item.enhancementLevel||0)+1)} · ${num(chance,1)}% thành công · ${num(risk,1)}% rủi ro tụt 1 cấp khi thất bại · tốn ${num(cost)} Khí Luyện Tinh Hoa. Tiếp tục không dùng Bùa?`);if(!ok)return;}const payload=await perform({type:'enhanceEquipment',itemId:item.id,useProtection:false});v138246ShowEnhanceFeedback(payload,item.name);});
  qsaV129('[data-enhance-protected]').forEach(btn=>btn.onclick=async()=>{const item=(model.equipment||[]).find(x=>x.id===btn.dataset.enhanceProtected);if(!item)return;const risk=Number(item.nextEnhanceDowngradeChancePct||0),chance=Number(item.nextEnhanceChancePct||0);const ok=await confirmAction('Cường Hóa + Bùa',`${item.name}: +${num(item.enhancementLevel||0)} → +${num(Number(item.enhancementLevel||0)+1)} · ${num(chance,1)}% thành công. Bùa Chống Tụt chỉ bị tiêu nếu thất bại rơi vào nhánh tụt cấp ${num(risk,1)}%. Tiếp tục?`);if(ok){const payload=await perform({type:'enhanceEquipment',itemId:item.id,useProtection:true});v138246ShowEnhanceFeedback(payload,item.name);}});
  qsaV129('[data-reforge-same]').forEach(btn=>btn.onclick=async()=>{const item=(model.equipment||[]).find(x=>x.id===btn.dataset.reforgeSame);if(!item)return;const index=Math.max(0,Number(inventoryUi.affixIndex||0)),aff=item.affixDetails?.[index];if(!aff)return;const c=aff.reforgeCost||{};const ok=await confirmAction('Tái Luyện dòng thuộc tính',`${item.name} · dòng ${index+1}: ${aff.formatted}. Dòng này sẽ đổi sang affix KHÁC trong cùng nhóm ${aff.familyLabel}; các dòng còn lại giữ nguyên. Tốn ${num(c.spiritStones||0)} Linh Thạch + ${num(c.equipmentEssence||0)} Tinh Hoa cùng phẩm. Sau thành công, chi phí Tái Luyện tiếp theo của món tăng ×1,50. Tiếp tục?`);if(ok)perform({type:'reforgeEquipmentAffixV115',itemId:item.id,index});});
  qsaV129('[data-reforge-change]').forEach(btn=>btn.onclick=async()=>{const item=(model.equipment||[]).find(x=>x.id===btn.dataset.reforgeChange);if(!item)return;const index=Math.max(0,Number(inventoryUi.affixIndex||0)),aff=item.affixDetails?.[index],target=inventoryUi.targetFamily;if(!aff||!target)return;const family=(model.equipmentSystem?.affixFamilies||[]).find(x=>x.id===target),c=aff.familyChangeCosts?.[target]||{};const ok=await confirmAction('Đổi nhóm thuộc tính',`${item.name} · dòng ${index+1}: ${aff.formatted} → nhóm ${family?.label||target}. Thuộc tính cụ thể nhận được vẫn ngẫu nhiên. Tốn ${num(c.spiritStones||0)} Linh Thạch + ${num(c.equipmentEssence||0)} Tinh Hoa cùng phẩm + ${num(c.familyChangeMaterial||1)} Chuyển Tính Thạch. Tiếp tục?`);if(ok)perform({type:'reforgeEquipmentAffixV115',itemId:item.id,index,targetFamily:target});});
  qsaV129('[data-refine-affix]').forEach(btn=>btn.onclick=async()=>{const item=(model.equipment||[]).find(x=>x.id===btn.dataset.refineAffix);if(!item)return;const index=Math.max(0,Number(inventoryUi.affixIndex||0)),aff=item.affixDetails?.[index];if(!aff||aff.maxRoll)return;const c=aff.refineCost||{};const ok=await confirmAction('Tinh Luyện affix',`${item.name} · ${aff.formatted}: giữ nguyên affix, roll ${num(aff.rollPct,2)}% → ${num(Math.min(100,Number(aff.rollPct||0)+1),2)}%. Không fail, không tụt. Tốn ${num(c.spiritStones||0)} Linh Thạch + ${num(c.equipmentEssence||0)} Tinh Hoa cùng phẩm. Tiếp tục?`);if(ok)perform({type:'refineEquipmentAffixV115',itemId:item.id,index});});
  qsaV129('[data-transfer-direct]').forEach(btn=>btn.onclick=async()=>{const from=(model.equipment||[]).find(x=>x.id===btn.dataset.transferDirect),to=(model.equipment||[]).find(x=>x.id===btn.dataset.transferTo);if(!from||!to)return;const ok=await confirmAction('Chuyển Cường Hóa',`${from.name} +${num(from.enhancementLevel||0)} → ${to.name}. Món nguồn sẽ về +0, món đích nhận +${num(from.enhancementLevel||0)} và tiêu 1 Ngọc Chuyển Cường Hóa. Không thể hoàn tác tự động. Tiếp tục?`);if(ok)perform({type:'transferEquipmentEnhancement',fromItemId:from.id,toItemId:to.id});});
  qsaV129('[data-transfer-source]').forEach(btn=>btn.onclick=()=>{transferSourceId=transferSourceId===btn.dataset.transferSource?null:btn.dataset.transferSource;renderPreservingUi();});
  qsaV129('[data-transfer-target]').forEach(btn=>btn.onclick=async()=>{if(!transferSourceId)return;const from=(model.equipment||[]).find(x=>x.id===transferSourceId),to=(model.equipment||[]).find(x=>x.id===btn.dataset.transferTarget);if(!from||!to)return;const ok=await confirmAction('Chuyển Cường Hóa',`${from.name} +${num(from.enhancementLevel||0)} → ${to.name}; nguồn về +0 và tiêu 1 Ngọc Chuyển Cường Hóa. Tiếp tục?`);if(!ok)return;await perform({type:'transferEquipmentEnhancement',fromItemId:from.id,toItemId:to.id});transferSourceId=null;});
  qsaV129('[data-artifact]').forEach(btn=>btn.onclick=()=>perform({type:'activateArtifact',artifactId:btn.dataset.artifact}));
  qsaV129('[data-skill-active]').forEach(btn=>btn.onclick=()=>action({action:'skillActive',skillId:btn.dataset.skillActive,active:btn.dataset.active==='1'}));
  qsV129('[data-v125-commit]')?.addEventListener('click',async()=>{const nature=qsV129('[name="v125Nature"]')?.value,mainDao=qsV129('[name="v125MainDao"]')?.value;if(!nature||!mainDao)return;if(await confirmAction('Định Đạo',`Khóa ${V125_NATURE_LABEL[nature]||nature} · ${V125_DAO_LABEL[mainDao]||mainDao} Chủ cho đời hiện tại. Chỉ Luân Hồi mới được chọn lại. Xác nhận?`))action({action:'specializationCommitV125',nature,mainDao});});
  qsV129('[data-v125-secondary]')?.addEventListener('click',async()=>{const dao=qsV129('[name="v125SecondaryDao"]')?.value;if(dao&&await confirmAction('Chọn Phụ Đạo',`Khóa ${V125_DAO_LABEL[dao]||dao} làm Phụ Đạo đời hiện tại. Xác nhận?`))action({action:'secondaryDaoV125',dao});});
  qsaV129('[data-v125-point-tier]').forEach(btn=>btn.onclick=()=>action({action:'daoNaturePointV125',tierId:btn.dataset.v125PointTier,branch:btn.dataset.v125PointBranch,points:1}));
  qsaV129('[data-v125-major-tier]').forEach(btn=>btn.onclick=async()=>{if(await confirmAction('Đại Thiên Phú','Lựa chọn tầng này sẽ khóa cho đời hiện tại. Xác nhận?'))action({action:'daoNatureMajorV125',tierId:btn.dataset.v125MajorTier,branch:btn.dataset.v125MajorBranch});});
  qsaV129('[data-v125-restore]').forEach(btn=>btn.onclick=()=>action({action:'techniqueRestoreV125',techniqueId:btn.dataset.v125Restore}));
  qsaV129('[data-v125-passive]').forEach(btn=>btn.onclick=()=>action({action:'passiveUpgradeV125',passiveId:btn.dataset.v125Passive,sourceTechniqueId:btn.dataset.v125PassiveSource}));
  qsaV129('[data-v12317-heart]').forEach(btn=>btn.onclick=()=>action({action:'heartMethodUpgradeV12317',heartMethodId:btn.dataset.v12317Heart,sourceTechniqueId:btn.dataset.v12317HeartSource}));
  qsaV129('[data-skill-upgrade-v12317]').forEach(btn=>btn.onclick=()=>action({action:'skillUpgradeV12317',skillId:btn.dataset.skillUpgradeV12317}));
  qsaV129('[data-skill-advance-v12317]').forEach(btn=>btn.onclick=()=>action({action:'skillAdvanceV12317',skillId:btn.dataset.skillAdvanceV12317}));
  qsaV129('[data-dev-lab-preset]').forEach(btn=>btn.onclick=()=>{if(!DEV_MODE)return;const mainDao=btn.dataset.devLabPreset||qsV129('[name="devMainDao"]')?.value||'sword',secondaryDao=qsV129('[name="devSecondaryDao"]')?.value||'',realmOrder=Number(qsV129('[name="devRealmOrder"]')?.value||117),statPreset=qsV129('[name="devStatPreset"]')?.value||'balanced',maxProgress=Boolean(qsV129('[name="devMaxProgress"]')?.checked),forceBoss=Boolean(qsV129('[name="devForceBoss"]')?.checked);action({action:'devSkillLabV12317',mainDao,secondaryDao,realmOrder,statPreset,maxProgress,forceBoss});});
  qsaV129('[data-dev-skill-tune]').forEach(btn=>btn.onclick=()=>{if(!DEV_MODE)return;action({action:'devSkillTuneV12317',skillId:btn.dataset.devSkillTune,level:Number(btn.dataset.devLevel||20),grade:btn.dataset.devGrade||'breaker',mastery:Number(btn.dataset.devMastery||1000)});});
  qsaV129('[data-learn-v125]').forEach(btn=>btn.onclick=()=>perform({type:'learnSkill',skillId:btn.dataset.learnV125}));
  qsaV129('[data-tech-equip]').forEach(btn=>btn.onclick=()=>action({action:'techniqueEquip',techniqueId:btn.dataset.techEquip}));
  qsaV129('[data-tech-study]').forEach(btn=>btn.onclick=()=>action({action:'techniqueStudy',techniqueId:btn.dataset.techStudy,batches:Number(btn.dataset.techBatches||1)}));
  qsaV129('[data-collection-category]').forEach(btn=>btn.onclick=()=>{collectionUi.category=btn.dataset.collectionCategory||'manual';collectionUi.banner=`banner.${collectionUi.category}`;collectionUi.selectedId=null;renderPreservingUi();hydrateViewV129('collection',{force:true}).catch(()=>{});});
  qsaV129('[data-collection-manual-realm]').forEach(sel=>sel.onchange=()=>{collectionUi.manualRealmStage=Number(sel.value);collectionUi.selectedId=null;action({action:'manualGachaRealmV127',realmStageIndex:Number(sel.value)});});
  qsaV129('[data-manual-gacha-orientation]').forEach(btn=>btn.onclick=()=>action({action:'manualGachaOrientationV127',manualId:btn.dataset.manualGachaOrientation}));
  qsaV129('[data-gacha-currency]').forEach(btn=>btn.onclick=()=>{collectionUi.usePremium=btn.dataset.gachaCurrency==='premium';renderPreservingUi();});
  qsV129('[data-collection-owned-toggle]')?.addEventListener('click',()=>{collectionUi.ownedOnly=!collectionUi.ownedOnly;renderPreservingUi();});
  qsaV129('[data-collection-select]').forEach(btn=>btn.onclick=()=>{collectionUi.selectedId=btn.dataset.collectionSelect||null;renderPreservingUi();});
  qsaV129('[data-collection-gacha-v12326]').forEach(btn=>btn.onclick=()=>action({action:'collectionGachaV12326',bannerId:`banner.${collectionUi.category}`,count:Number(btn.dataset.collectionGachaV12326||1),usePremium:Boolean(collectionUi.usePremium)}));
  qsaV129('[data-collection-compose-v12326]').forEach(btn=>btn.onclick=()=>action({action:'collectionComposeV12326',itemId:btn.dataset.collectionComposeV12326}));
  qsaV129('[data-origin-activate-v12326]').forEach(btn=>btn.onclick=()=>action({action:'collectionOriginActivateV12326',category:btn.dataset.originCategory,itemId:btn.dataset.originActivateV12326}));
  qsaV129('[data-collection-strengthen-v12325]').forEach(btn=>btn.onclick=()=>action({action:'collectionStrengthenV12325',itemId:btn.dataset.collectionStrengthenV12325,levels:1}));
  qsaV129('[data-collection-advance-v12325]').forEach(btn=>btn.onclick=()=>action({action:'collectionAdvanceV12325',itemId:btn.dataset.collectionAdvanceV12325}));
  qsaV129('[data-artifact-equip-slot-v88]').forEach(btn=>btn.onclick=()=>action({action:'collectionEquipV12325',itemId:btn.dataset.artifactEquipSlotV88,slotIndex:Number(btn.dataset.artifactSlotIndex||0)}));
  qsaV129('[data-collection-equip-v12325]').forEach(btn=>btn.onclick=()=>action({action:'collectionEquipV12325',itemId:btn.dataset.collectionEquipV12325}));
  qsaV129('[data-collection-unequip-v12325]').forEach(btn=>btn.onclick=()=>action({action:'collectionUnequipV12325',itemId:btn.dataset.collectionUnequipV12325}));
  qsaV129('[data-heart-strengthen-v12325]').forEach(btn=>btn.onclick=()=>action({action:'heartMethodStrengthenV12325',passiveId:btn.dataset.heartStrengthenV12325}));
  qsaV129('[data-heart-advance-v12325]').forEach(btn=>btn.onclick=()=>action({action:'heartMethodAdvanceV12325',passiveId:btn.dataset.heartAdvanceV12325}));
  qsV129('[data-dev-collection-grant]')?.addEventListener('click',()=>action({action:'devCollectionGrantV12325'}));
  qsV129('[data-dev-gacha-sim-v12326]')?.addEventListener('click',()=>action({action:'collectionGachaSimV12326',category:collectionUi.category,pulls:10000}));
  qsV129('[data-dev-collection-grant-v12326]')?.addEventListener('click',()=>action({action:'devCollectionGrantV12326'}));
  qsaV129('[data-collection-daily]').forEach(btn=>btn.onclick=()=>{activeTab='dungeons';render();showNotice('V109: Daily cũ đã chuyển thành Bí Cảnh Tài Nguyên farm theo tầng/thời gian.');});
  qsaV129('[data-cave-upgrade]').forEach(btn=>btn.onclick=()=>action({action:'caveUpgradeV12316',facilityId:btn.dataset.caveUpgrade}));
  qsaV129('[data-preset]').forEach(btn=>btn.onclick=()=>action({action:'loadoutPreset',presetId:btn.dataset.preset}));
  qsaV129('[data-intel]').forEach(btn=>btn.onclick=()=>loadIntel(btn.dataset.intel,Number(btn.dataset.floor)));
  qsaV129('[data-challenge]').forEach(btn=>btn.onclick=()=>action({action:'challengeBoss',dungeonId:btn.dataset.challenge,floor:Number(btn.dataset.floor)}).then(()=>{activeTab='combat';render();}));
  qsaV129('[data-talent]').forEach(btn=>btn.onclick=()=>action({action:'spendTalent',talentId:btn.dataset.talent,ranks:1}));
  qsaV129('[data-potential]').forEach(btn=>btn.onclick=()=>action({action:'potential',id:btn.dataset.potential,points:Number(btn.dataset.points||1)}));
  qsV129('[data-blood-purify]')?.addEventListener('click',()=>perform({type:'nourishBloodline',points:10}));
  qsV129('[data-blood-advance]')?.addEventListener('click',()=>perform({type:'advanceBloodline',useProtection:false}));
  qsV129('[data-blood-advance-protected]')?.addEventListener('click',()=>perform({type:'advanceBloodline',useProtection:true}));
  qsV129('[data-physique-advance]')?.addEventListener('click',()=>perform({type:'advancePhysique'}));
  qsV129('[data-blood-swap]')?.addEventListener('click',async()=>{const targetId=qsV129('[name="bloodlineTarget"]')?.value;if(targetId&&await confirmAction('Hoán Huyết','Hoán Huyết tối đa một lần mỗi đời, Độ Thuần về 0% và chịu Dị Huyết Bất Dung. Tiếp tục?'))perform({type:'swapBloodline',targetId});});
  qsV129('[data-blood-implant]')?.addEventListener('click',async()=>{const targetId=qsV129('[name="bloodlineTarget"]')?.value;if(targetId&&await confirmAction('Tạo Huyết','Tạo Huyết từ Vô Huyết bắt đầu Phàm 0%, rất tốn tài nguyên và chịu Nghịch Huyết Bất Dung. Tiếp tục?'))perform({type:'implantBloodline',targetId});});
  qsV129('[data-save-majors]')?.addEventListener('click',()=>{const ids=[...qsaV129('[name="major"]:checked')].map(x=>x.value);action({action:'majorTalents',ids});});
}

function bindReincarnationReplayActionsV141(qsaV129,qsV129){
  qsV129('[data-meditative-passing]')?.addEventListener('click',async()=>{const eternal=model?.reincarnation?.lifeEnd?.mode==='eternal';if(await confirmAction(eternal?'Xả Vĩnh Sinh thân':'Tọa Hóa',eternal?'Kết thúc Vĩnh Sinh thân hiện tại và bước vào hai Thí Luyện Luân Hồi? Chưa chuyển sinh ngay.':'Kết thúc đời hiện tại để bước vào hai Thí Luyện Luân Hồi? Chưa chuyển sinh ngay.'))perform({type:'meditativePassing'});});
  qsaV129('[data-reinc-trial]').forEach(btn=>btn.onclick=()=>action({action:'reincarnationTrialV2',kind:btn.dataset.reincTrial}));
  qsV129('[data-reinc-finalize]')?.addEventListener('click',async()=>{if(await confirmAction('Chốt Reward Luân Hồi','Dùng best result của Cọc Gỗ và Sinh Tồn, trừ Năng Lượng Luân Hồi và ghi reward permanent? Sau khi chốt không thể chạy lại hai bài test cho đời này.'))action({action:'reincarnationRewardFinalizeV2',confirmedBuildReady:true});});
  qsaV129('[data-perm-potential]').forEach(btn=>btn.onclick=()=>action({action:'permanentPotentialV2Spend',id:btn.dataset.permPotential,points:Number(btn.dataset.points||1)}));
  qsaV129('[data-reinc-tree]').forEach(btn=>btn.onclick=()=>action({action:'reincarnationTreeSpendV2',nodeId:btn.dataset.reincTree,ranks:1}));
  qsV129('[data-reinc-tree-reset]')?.addEventListener('click',async()=>{if(await confirmAction('Reset Cây Luân Hồi','Hoàn toàn bộ Điểm Luân Hồi đã phân và xóa rank hiện tại? Chỉ thực hiện được giữa hai đời.'))action({action:'reincarnationTreeResetV2'});});
  qsV129('[name="birthCandidate"]')?.addEventListener('change',e=>{reincPlan.birthCandidate=Number(e.target.value||1);if(model)model._planPreview=null;renderPreservingUi();});
  qsV129('[name="orientationId"]')?.addEventListener('change',e=>{reincPlan.orientationId=e.target.value||'balanced';if(model)model._planPreview=null;renderPreservingUi();});
  qsV129('[data-preview-plan]')?.addEventListener('click',previewPlan);
  qsV129('[data-reincarnate-plan]')?.addEventListener('click',async()=>{if(!model?.reincarnationProgress?.pendingTrial?.finalizedReward){showNotice('Phải hoàn thành 2 Thí Luyện và chốt Reward trước khi chuyển sinh.',true);return;}const plan=currentPlanFromDom();const preview=await getPlanPreview(plan);if(!preview.affordable){showNotice('Kế hoạch Mệnh Thai chưa hợp lệ hoặc không đủ CP compatibility.',true);return;}if(await confirmAction('Chuyển Sinh',`Bắt đầu Đời ${(model?.overview?.life?.lifeNumber||1)+1}. Timeline thế giới tiếp tục; tiến trình đời hiện tại sẽ được xây lại theo backend canonical.`))action({action:'reincarnate',plan});});
  qsaV129('[data-replay]').forEach(btn=>btn.onclick=()=>btn.dataset.replay==='start'?startReplay():btn.dataset.replay==='pause'?pauseReplay():showAllReplay());
  qsaV129('[data-speed]').forEach(btn=>btn.onclick=()=>{replay.speed=Number(btn.dataset.speed);if(replay.active)startReplay(replay.index);});
  qsV129('[data-save-automation]')?.addEventListener('click',saveAutomation);
  qsV129('[data-run-ai]')?.addEventListener('click',()=>perform({type:'guidanceRun',maxWorldYears:5,maxDecisions:24}));
  qsV129('[data-add-rule]')?.addEventListener('click',addAutomationRule);
  qsaV129('[data-del-rule]').forEach(btn=>btn.onclick=()=>deleteAutomationRule(btn.dataset.delRule));
  qsV129('#guidanceEnabled')?.addEventListener('change',e=>perform({type:'guidanceEnabled',enabled:e.target.checked}));
  if(model?.combatReview&&$('#battleStage')&&!$('#battleStage').classList.contains('ambient')){resetBattleStage(model.combatReview);showAllReplay();}
  if($('#battleStage')?.classList.contains('ambient'))startAmbientBattleLoop(); else stopAmbientBattleLoop();
  if(activeTab==='hunt'){if(huntCombatModule)huntCombatModule.mountHuntCombatV2(content,{model,live,action});else loadHuntCombatModuleV129().catch(()=>{});}
}

function bindDynamic(){
  const nativeQsaV129=content.querySelectorAll.bind(content),nativeQsV129=content.querySelector.bind(content);
  let bindingPhaseV129=true;
  const bindDataIndexV129=new Map();
  for(const node of nativeQsaV129('*'))for(const attr of node.attributes||[]){if(!attr.name.startsWith('data-'))continue;let bucket=bindDataIndexV129.get(attr.name);if(!bucket){bucket=[];bindDataIndexV129.set(attr.name,bucket);}bucket.push(node);}
  const exactDataSelectorV129=/^\[(data-[a-z0-9-]+)\]$/;
  const qsaV129=selector=>{if(bindingPhaseV129){const match=exactDataSelectorV129.exec(String(selector));if(match)return bindDataIndexV129.get(match[1])||[];}return nativeQsaV129(selector);};
  const qsV129=selector=>{if(bindingPhaseV129){const match=exactDataSelectorV129.exec(String(selector));if(match)return (bindDataIndexV129.get(match[1])||[])[0]||null;}return nativeQsV129(selector);};
  bindWorldSocialActionsV141(qsaV129,qsV129);
  bindDongFuEconomyActionsV141(qsaV129,qsV129);
  bindJourneyCultivationActionsV141(qsaV129,qsV129);
  bindInventoryNavigationActionsV141(qsaV129,qsV129);
  bindBuildCollectionActionsV141(qsaV129,qsV129);
  bindReincarnationReplayActionsV141(qsaV129,qsV129);
  bindingPhaseV129=false;
}
async function loadIntel(id,floor){try{const data=await request(`/api/boss-intel?dungeonId=${encodeURIComponent(id)}&floor=${floor}`);selectedBossIntel=data.intel;activeTab='combat';render();}catch(error){showNotice(error.message,true);}}
async function getPlanPreview(plan){const data=await request('/api/reincarnation/preview',{method:'POST',body:JSON.stringify({plan})});model._planPreview=data.preview;return data.preview;}
async function previewPlan(){try{await getPlanPreview(currentPlanFromDom());render();}catch(error){showNotice(error.message,true);}}
function saveAutomation(){const a=model.automation;const patch={allowedActivityTypes:[...content.querySelectorAll('[name="allowedActivity"]:checked')].map(x=>x.value),maxInjury:Number(content.querySelector('[name="maxInjury"]').value),maxConsecutiveSameAction:Number(content.querySelector('[name="maxConsecutiveSameAction"]').value),wakeOnContentEvent:content.querySelector('[name="wakeContent"]').checked,wakeBeforeBoss:content.querySelector('[name="wakeBoss"]').checked,strategyRules:a.strategyRules.map(({id,enabled,metric,op,value,prefer,priorityBoost})=>({id,enabled,metric,op,value,prefer,priorityBoost}))};action({action:'automation',patch});}
function addAutomationRule(){const rules=model.automation.strategyRules.map(({id,enabled,metric,op,value,prefer,priorityBoost})=>({id,enabled,metric,op,value,prefer,priorityBoost}));rules.push({id:`web.${Date.now()}`,enabled:true,metric:content.querySelector('[name="ruleMetric"]').value,op:content.querySelector('[name="ruleOp"]').value,value:Number(content.querySelector('[name="ruleValue"]').value),prefer:content.querySelector('[name="rulePrefer"]').value,priorityBoost:Number(content.querySelector('[name="ruleBoost"]').value)});action({action:'automation',patch:{strategyRules:rules}});}
function deleteAutomationRule(id){const rules=model.automation.strategyRules.filter(r=>r.id!==id).map(({id,enabled,metric,op,value,prefer,priorityBoost})=>({id,enabled,metric,op,value,prefer,priorityBoost}));action({action:'automation',patch:{strategyRules:rules}});}
function pauseReplay(){if(replay.timer)clearTimeout(replay.timer);replay.timer=null;replay.active=false;}
function showAllReplay(){pauseReplay();const log=$('#combatLog');if(model.combatReview&&log){resetBattleStage(model.combatReview);const timeline=model.combatReview.timeline||[];log.innerHTML=timeline.map(logLine).join('');for(const evt of timeline)applyBattleReplayEvent(evt,{animate:false,render:false});setBattleBar('player',battleViz.hp.player);setBattleBar('enemy',battleViz.hp.enemy);for(const side of ['player','enemy'])if(battleViz.hp[side]<=0)document.querySelector(`[data-battle-side="${side}"]`)?.classList.add('state-dead');const last=timeline.at(-1);if(last)updateBattleBanner(last.message,last.type==='battleEnd'?'Kết thúc trận đấu.':'Đã dựng toàn bộ chiến báo.');log.scrollTop=log.scrollHeight;}replay.index=model.combatReview?.timeline.length||0;}
function startReplay(start=0){pauseReplay();const timeline=model.combatReview?.timeline||[];const log=$('#combatLog');if(!log)return;replay.index=start;if(start===0){resetBattleStage(model.combatReview);log.innerHTML='';}replay.active=true;const interval=Math.max(55,320/replay.speed);const step=()=>{if(!replay.active||document.hidden||!log.isConnected||replay.index>=timeline.length){pauseReplay();return;}const evt=timeline[replay.index++];log.insertAdjacentHTML('beforeend',logLine(evt));applyBattleReplayEvent(evt);log.scrollTop=log.scrollHeight;replay.timer=setTimeout(step,interval);};replay.timer=setTimeout(step,interval);}
async function confirmAction(title,text){const d=$('#confirmDialog');$('#confirmTitle').textContent=title;$('#confirmText').textContent=text;d.showModal();return new Promise(resolve=>d.addEventListener('close',()=>resolve(d.returnValue==='ok'),{once:true}));}


/* v1.06 Mobile Screen Architecture — 1 viewport = 1 game screen */
function v106Sheet(id,title,body){return `<section class="v106-sheet" data-sheet-panel="${esc(id)}"><div class="v106-sheet-head"><button class="v106-close" data-sheet-close aria-label="Quay lại">←</button><div class="v106-sheet-title"><div class="eyebrow">Chi tiết</div><h2>${esc(title)}</h2></div></div><div class="v106-sheet-body" tabindex="-1">${body}</div></section>`;}
function v106MoreSheet(){return v106Sheet('more','Tiện ích',`<div class="v106-menu-grid"><button data-tab-jump="overview">${navIcon('overview')}<span>Tổng Quan</span></button><button data-tab-jump="roots">${navIcon('roots')}<span>Linh Căn</span></button><button data-tab-jump="path">${navIcon('path')}<span>Định Đạo</span></button><button data-tab-jump="build">${navIcon('build')}<span>Phối Đồ</span></button><button data-tab-jump="automation">${navIcon('automation')}<span>Tự Động</span></button>${DEV_MODE?`<button data-tab-jump="devlab">${navIcon('devlab')}<span>DEV Lab</span></button>`:''}</div>`);}

/* v1.09 cleanup: removed superseded v1.06 header renderer */
function primaryTabGroup(id){
  const key=String(id||'');
  if(['character','inventory','skills','build','path','roots','power'].includes(key))return'character';
  if(['cultivation','reincarnation','myriadLives','guide','overview'].includes(key))return'cultivation';
  if(['dungeons','hunt','combat','pvp'].includes(key))return'dungeons';
  if(['dongfu','collection','economy','automation'].includes(key))return'dongfu';
  if(['locations','journal','faction','social','soul','dao'].includes(key))return'locations';
  return key;
}
function rememberCurrentTabUi(){
  if(!model||!activeTab)return;
  try{TAB_UI_MEMORY.set(activeTab,captureUiContinuity());}catch{}
}
function restoreRememberedTabUi(){
  const saved=TAB_UI_MEMORY.get(activeTab);
  if(saved)restoreUiContinuity(saved);
}
const VIEW_HYDRATE_AT_V129=new Map();
let viewHydrateSerialV129=0;
async function hydrateViewV129(view,{force=false}={}){
  const target=String(view||activeTab||'cultivation');
  const now=Date.now();
  if(!force&&now-Number(VIEW_HYDRATE_AT_V129.get(target)||0)<2500)return;
  const serial=++viewHydrateSerialV129;
  try{
    const subview=target===activeTab?activeSubviewV129():'';
       const payload=await request(`/api/view?view=${encodeURIComponent(target)}&subview=${encodeURIComponent(subview)}`);
    VIEW_HYDRATE_AT_V129.set(target,Date.now());
    adoptPayloadWithoutRender(payload);
    if(serial===viewHydrateSerialV129&&activeTab===target)renderPreservingUi();
  }catch(error){console.warn('[view-patch] hydrate failed',target,error);}
}
function navigateTo(target){
  const raw=String(target||'character');
  if(!tabUnlocked(raw)){showNotice(tabUnlockText(raw),true);return;}
  if(raw==='dongfu'&&activeTab==='dongfu'&&dongfuUi.section==='home'){v239SyncDongFuHomeLive();return;}
  rememberCurrentTabUi();
  if(raw==='dongfu'){dongfuUi.section='home';activeTab='dongfu';}
  else if(raw==='collection'){dongfuUi.section='collection';activeTab='collection';}
  else if(raw==='cultivation'){dongfuUi.section='cultivation';activeTab='cultivation';}
  else if(raw==='hunt'){dungeonUi.section='hunt';activeTab='hunt';}
  else if(raw==='combat'){dungeonUi.section='boss';activeTab='combat';}
  else{activeTab=raw;}
  render();
  restoreRememberedTabUi();
  hydrateViewV129(activeTab).catch(()=>{});
}
let navSignatureV129='';
renderNav = function(){const group=primaryTabGroup(activeTab);const visible=primaryTabs.filter(([id])=>tabUnlocked(id));const signature=`${group}|${visible.map(([id])=>id).join(',')}`;if(signature===navSignatureV129)return;navSignatureV129=signature;nav.style.setProperty('--v90-tab-count',String(Math.max(1,visible.length)));nav.innerHTML=visible.map(([id,label])=>`<button class="nav-button ${group===id?'active':''}" data-tab="${id}"><b>${navIcon(id)}</b><span>${label}</span></button>`).join('');quickNav.innerHTML='';};
page = function(title,sub,body,right=''){return `<section class="v106-screen v106-secondary ux-viewport-screen"><header class="v106-screen-head"><div><h1>${esc(title)}</h1><p>${esc(sub)}</p></div><div class="v106-head-tools">${right}<button class="v106-icon-btn" data-sheet-open="more">•••</button></div></header><div class="v106-scroll-body ux-screen-scroll" data-scroll-key="${esc(activeTab)}-main">${body}</div>${v106MoreSheet()}</section>`;};

/* v1.09 cleanup: removed superseded v1.06 character renderer */
/* v1.09 cleanup: removed superseded v1.06 cultivation renderer */
/* v1.09 cleanup: legacy Săn Yêu renderer removed; see modules/hunt-combat-v2.js */
/* v1.09 cleanup: removed superseded v1.06 skills renderer */
/* v1.09 cleanup: removed superseded v1.06 inventory renderer */
renderReincarnation = function(){
  const h=model.reincarnation||{},p=model.reincarnationPlanner||{},rp=model.reincarnationProgress||{},perm=model.permanentPotential||rp.permanentPotential||{},o=model.overview||{};
  const depth=rp.depth||{},reward=rp.currentDepthReward||{},energy=rp.energy||{},pending=rp.pendingTrial||{},finalized=pending.finalizedReward;
  const alive=o.life?.alive!==false,end=h.lifeEnd||{alive,canEnd:false,mode:'meditative'},offense=pending.offenseBest,survival=pending.survivalBest;
  const energyPct=Number(energy.cap||500)>0?Number(energy.current||0)/Number(energy.cap||500)*100:0;
  const trialDone=Number(Boolean(offense))+Number(Boolean(survival));
  const phase=alive?'living':finalized?'rewarded':trialDone===2?'ready-finalize':'trials';
  const phaseLabel={living:'Đang sống',trials:'Thí Luyện', 'ready-finalize':'Chờ chốt thưởng',rewarded:'Sẵn sàng chuyển sinh'}[phase]||phase;
  const endLabel=end.mode==='eternal'?'Xả Vĩnh Sinh thân':'Tọa Hóa · Kết đời';
  const trialLine=(x,empty)=>x?`${Number(x.ratio||0).toFixed(2)}× chuẩn · +${num(x.bonusPct||0)}%`:empty;
  const steps=[['Kết đời',!alive],['Cọc Gỗ',Boolean(offense)],['Sinh Tồn',Boolean(survival)],['Chốt thưởng',Boolean(finalized)],['Chuyển sinh',false]];
  const stage=`<div class="v2315-stage">
    <div class="v2315-orbit"><i></i><i></i><b>↻</b></div>
    <header><small>LUÂN HỒI V2 · ĐỜI ${num(o.life?.lifeNumber||h.lifeNumber||1)}</small><strong>${esc(depth.tierName||'Phàm')} · Tầng ${num(depth.stage||1)}</strong><span>${esc(phaseLabel)}</span></header>
    <div class="v2315-stage-reward"><div><span>Điểm Luân Hồi</span><b>+${num(reward.reincarnationPoints||0)}</b></div><div><span>Tiềm Năng nền</span><b>+${num(reward.permanentPotentialBase||0)}</b></div><div><span>Năng lượng phí</span><b>${num(reward.energyCost||0)}</b></div></div>
    <div class="v2315-energy"><span>Năng Lượng Luân Hồi <b>${num(energy.current||0,1)}/${num(energy.cap||500)}</b></span>${progress(energyPct,'gold')}<small>Hồi ${num(energy.rechargePer24h||100)} / 24 giờ thực. Reward không lấy raw damage làm tiền tệ.</small></div>
  </div>`;
  const pipeline=`<div class="v2315-pipeline">${steps.map(([label,done],i)=>`<div class="${done?'done':''} ${i===4&&finalized?'ready':''}"><i>${done?'✓':i+1}</i><span>${label}</span></div>`).join('')}</div>`;
  const livingPanel=alive?`<section class="v2315-life-card"><header><div><small>KIẾP HIỆN TẠI</small><strong>${end.canEnd?'Đã đủ điều kiện Tọa Hóa':'Chưa đủ điều kiện Tọa Hóa'}</strong></div><span>${esc(end.mode==='eternal'?'Vĩnh Sinh':'Tọa Hóa')}</span></header><p>${esc(end.canEnd?(end.reason||'Kết đời sẽ mở hai bài Thí Luyện 60 giây; vẫn có thể đổi build giữa hai bài.'):end.reason||'Tiếp tục tu luyện và hoàn thành ít nhất một lần công phá Boss/tầng mới để Luân Hồi có trọng lượng.')}</p><div class="v2315-life-facts"><span>Tuổi <b>${num(o.life?.ageYears||0,1)}</b></span><span>Công phá đầu <b>${num(end.firstClears||0)}</b></span><span>Cảnh giới <b>${esc(o.life?.realm||'—')}</b></span></div><button class="button danger v2315-primary" data-meditative-passing ${end.canEnd?'':'disabled'}>${esc(endLabel)}</button><small class="v2315-warning">Không tự Luân Hồi. Sau khi kết đời, game giữ nguyên build để bạn chạy Cọc Gỗ và Sinh Tồn.</small></section>`:'';
  const deadPanel=!alive?`<section class="v2315-dead-card"><header><div><small>GIAI ĐOẠN GIỮA HAI ĐỜI</small><strong>${finalized?'Reward đã chốt':'Chưa được chuyển sinh'}</strong></div><span>${trialDone}/2 test</span></header><div class="v2315-trial-mini"><button data-sheet-open="trials" class="${offense?'done':''}"><i>⚔</i><span><small>CỌC GỖ · 60 GIÂY</small><b>${trialLine(offense,'Chưa chạy')}</b></span></button><button data-sheet-open="trials" class="${survival?'done':''}"><i>◈</i><span><small>SINH TỒN · 60 GIÂY</small><b>${trialLine(survival,'Chưa chạy')}</b></span></button></div>${finalized?`<div class="v2315-final-reward"><span>Đã nhận</span><b>+${num(finalized.reincarnationPoints)} Điểm Luân Hồi · +${num(finalized.permanentPotentialGain)} Tiềm Năng vĩnh viễn</b><small>Bonus Thí Luyện ${num(finalized.trialBonusPct)}% · đã trừ ${num(finalized.energyCost)} Năng Lượng.</small></div>`:`<button class="button gold v2315-primary" data-sheet-open="trials">${trialDone===2?'Chốt Reward Luân Hồi':'Vào Thí Luyện'}</button>`}</section>`:'';
  const console=`<div class="v2315-console">${pipeline}${livingPanel}${deadPanel}<div class="v2315-menu"><button data-sheet-open="trials"><i>⚔</i><span><strong>Thí Luyện</strong><small>Offense + Survival</small></span></button><button data-sheet-open="potential"><i>◆</i><span><strong>Tiềm Năng</strong><small>Còn ${num(perm.unspent||0)} điểm</small></span></button><button data-sheet-open="tree"><i>⌘</i><span><strong>Cây Luân Hồi</strong><small>Còn ${num(rp.tree?.availablePoints||0)} điểm</small></span></button><button data-sheet-open="fate"><i>◉</i><span><strong>Mệnh Thai</strong><small>${finalized?'Chọn đời kế':'Xem trước đời kế'}</small></span></button></div></div>`;

  const trialCard=(kind,label,icon,test)=>`<article class="v2315-trial-card ${test?'done':''}"><header><i>${icon}</i><div><small>${esc(kind==='offense'?'DPS CHUẨN HÓA':'ÁP LỰC CHUẨN HÓA')}</small><strong>${esc(label)}</strong></div>${test?'<em>BEST</em>':''}</header>${test?`<div class="v2315-trial-numbers"><span>Tỷ lệ chuẩn <b>${Number(test.ratio||0).toFixed(2)}×</b></span><span>Bonus riêng <b>+${num(test.bonusPct||0)}%</b></span><span>Đo được <b>${num(test.measured||0,2)}</b></span></div><small>Build: ${esc(test.buildFingerprint||'')}</small>`:`<p>Chạy 60 giây với benchmark cùng cảnh giới. Có thể đổi trang bị/skill rồi chạy lại; backend chỉ giữ kết quả tốt nhất.</p>`}<button class="button ${test?'ghost':'primary'}" data-reinc-trial="${kind}" ${finalized?'disabled':''}>${test?'Chạy lại để cải thiện':'Bắt đầu 60 giây'}</button></article>`;
  const trials=`<div class="v2315-sheet-intro"><span>THÍ LUYỆN LUÂN HỒI</span><strong>Hai build có thể khác nhau</strong><p>Cọc Gỗ đo offense; Sinh Tồn đo khả năng chịu áp lực. Reward dùng tỷ lệ so với benchmark, không quy đổi trực tiếp raw damage thành Tiềm Năng.</p></div>${trialCard('offense','Cọc Gỗ', '⚔',offense)}${trialCard('survival','Thí Luyện Sinh Tồn','◈',survival)}<div class="v106-action-grid"><button class="button ghost" data-tab-jump="inventory">Đổi Trang Bị</button><button class="button ghost" data-tab-jump="skills">Đổi Kỹ Năng</button></div>${!finalized?`<div class="v2315-preview-reward"><span>Reward nếu chốt lúc này</span><b>${trialDone===2?`+${num(reward.reincarnationPoints)} Điểm Luân Hồi · +${num(reward.permanentPotentialGain)} Tiềm Năng`:'Cần đủ 2/2 Thí Luyện'}</b><small>${trialDone===2?`Bonus kết hợp ${num(reward.trialBonusPct)}% · phí ${num(reward.energyCost)} năng lượng`:'Có thể thay build giữa hai bài test.'}</small></div><button class="button gold v2315-full" data-reinc-finalize ${trialDone===2&&Number(energy.current||0)>=Number(reward.energyCost||0)?'':'disabled'}>Xác nhận build · Chốt Reward</button>`:`<div class="v2315-preview-reward done"><span>Reward đã chốt</span><b>+${num(finalized.reincarnationPoints)} Điểm Luân Hồi · +${num(finalized.permanentPotentialGain)} Tiềm Năng</b></div>`}`;

  const potDefs=[{id:'power',name:'Công Lực',rule:'+1 Công Lực / điểm'},{id:'body',name:'Thể Phách',rule:'+1 Thể Phách · +20 HP chuẩn / điểm'},{id:'defense',name:'Phòng Ngự',rule:'+3 Phòng Ngự / điểm'}];
  const potential=`<div class="v2315-sheet-intro"><span>TIỀM NĂNG LUÂN HỒI</span><strong>${num(perm.unspent||0)} điểm chưa phân</strong><p>Đây là chỉ số vĩnh viễn đi theo tài khoản. Tiềm Năng Đời vẫn là hệ riêng và reset khi chuyển sinh.</p></div><div class="v2315-potential-list">${potDefs.map(d=>`<article><div><small>${esc(d.name.toUpperCase())}</small><strong>${num(perm.allocations?.[d.id]||0)}</strong><span>${esc(d.rule)}</span></div><div><button data-perm-potential="${d.id}" data-points="1" ${Number(perm.unspent||0)<1?'disabled':''}>+1</button><button data-perm-potential="${d.id}" data-points="5" ${Number(perm.unspent||0)<5?'disabled':''}>+5</button></div></article>`).join('')}</div><div class="v2315-rule-note">Canonical: ${esc(perm.statRule||'1 điểm = +1 Công Lực / +1 Thể Phách / +3 Phòng Ngự')}.</div>`;

  const treeLabels={cultivation:'Cây Tu Luyện',manual:'Cây Công Pháp'};
  const treeNodes=rp.tree?.nodes||[]; const groups=[...new Set(treeNodes.map(n=>n.treeId))];
  const tree=`<div class="v2315-sheet-intro"><span>CÂY LUÂN HỒI</span><strong>${num(rp.tree?.availablePoints||0)} điểm khả dụng</strong><p>Hai cây permanent gồm Cây Tu Luyện và Cây Công Pháp; mỗi node tối đa 50 cấp. Điểm Luân Hồi dùng để mở hiệu lực vĩnh viễn. Các node permanent chỉ tác động những mechanic V140 còn hiệu lực; không có stat giảm requirement chuyển cảnh.</p></div>${groups.map((gid,gi)=>`<details class="v2315-tree-group" ${gi===0?'open':''}><summary><span>${esc(treeLabels[gid]||gid)}</span><b>${num((treeNodes.filter(n=>n.treeId===gid)).reduce((a,n)=>a+Number(n.rank||0),0))} bậc</b></summary><div>${treeNodes.filter(n=>n.treeId===gid).map(n=>`<article class="${n.structuralUnlocked?'':'locked'}"><div><small>TẦNG ${num(Number(n.tier||0)+1)} · ${esc(n.costClass||'normal')}</small><strong>${esc(n.name)}</strong><span>${esc(n.description||'')}</span><em>${n.lockReason?esc(n.lockReason):`${esc(n.modifierKey||'')} · +${num(n.perRank,2)}/bậc`}</em></div><aside><b>${num(n.rank||0)}/${num(n.maxRank||50)}</b>${n.nextCost!==undefined?`<button data-reinc-tree="${esc(n.id)}" ${!alive&&n.structuralUnlocked&&n.affordable?'':'disabled'}>+1 · ${num(n.nextCost)}</button>`:'<span>MAX</span>'}</aside></article>`).join('')}</div></details>`).join('')||'<div class="v2315-rule-note">Chưa có node Cây Luân Hồi.</div>'}<button class="button ghost v2315-full" data-reinc-tree-reset ${alive?'disabled':''}>Reset toàn bộ cây · hoàn điểm</button>`;

  const candidates=p.birthCandidates||[];
  const candidateOptions=candidates.map(x=>`<option value="${x.index}" ${Number(reincPlan.birthCandidate)===x.index?'selected':''}>#${x.index} · ${esc(x.lifeTraits?.fate||x.fate||'Mệnh Thai')}</option>`).join('');
  const selectedCandidate=candidates.find(x=>Number(x.index)===Number(reincPlan.birthCandidate))||candidates[0]||{};
  const permanent=selectedCandidate.persistent||{}; const lifeTraits=selectedCandidate.lifeTraits||{talent:selectedCandidate.birthTalents?.[0]?.name||'Không',fate:selectedCandidate.fate||'Không rõ',background:selectedCandidate.family||'Không rõ'};
  const candidatePreview=`<div class="v2324-fate-grid"><section class="v2324-persist-card"><header><span>GIỮ QUA LUÂN HỒI</span><b>Vĩnh viễn</b></header><div><span>Linh Căn</span><strong>${esc(permanent.spiritualRoot||'Giữ từ đời hiện tại')}</strong></div><div><span>Huyết Mạch</span><strong>${esc(permanent.bloodline||'Giữ nguyên')}</strong></div><div><span>Thể Chất</span><strong>${esc(permanent.physique||'Giữ nguyên')}</strong></div><small>Bậc, Độ Thuần Huyết Mạch và cảnh Thể Chất không bị random lại.</small></section><section class="v2324-life-card"><header><span>RANDOM ĐỜI MỚI</span><b>Mệnh Thai #${num(selectedCandidate.index||1)}</b></header><div><span>Thiên Tư</span><strong>${esc(lifeTraits.talent||'Không')}</strong></div><div><span>Mệnh Cách</span><strong>${esc(lifeTraits.fate||'Không rõ')}</strong></div><div><span>Xuất Thân</span><strong>${esc(lifeTraits.background||'Không rõ')}</strong></div><small>Ba trục này tạo sắc thái của đời mới; build dài hạn không bị xổ số xóa mất.</small></section></div>`;
  const orientationOptions=(p.orientations||[]).map(x=>`<option value="${esc(x.id)}" ${reincPlan.orientationId===x.id?'selected':''}>${esc(x.name)} · ${x.cpCost} CP cũ</option>`).join('');
  const fate=`<div class="v2315-sheet-intro"><span>MỆNH THAI ĐỜI KẾ</span><strong>${finalized?'Có thể chuyển sinh':'Chỉ xem trước'}</strong><p>Huyết Mạch, Thể Chất và Linh Căn là progression dài hạn. Mệnh Thai chỉ random Thiên Tư, Mệnh Cách và Xuất Thân.</p></div><div class="v1086-reinc-form"><label><span>Mệnh Thai</span><select name="birthCandidate">${candidateOptions}</select></label><label><span>Định hướng</span><select name="orientationId">${orientationOptions}</select></label></div>${candidatePreview}${model._planPreview?renderPlanPreview(model._planPreview):'<div class="v1086-sheet-hint">Chọn Mệnh Thai rồi bấm Kiểm tra Kế hoạch để khóa lựa chọn trước khi chuyển sinh.</div>'}<div class="v106-action-grid"><button class="button ghost" data-preview-plan>Kiểm tra Kế Hoạch</button><button class="button danger" data-reincarnate-plan ${finalized?'':'disabled'}>Chuyển Sinh · Đời ${num((o.life?.lifeNumber||1)+1)}</button></div><div class="v2315-rule-note">Chuyển sinh reset Realm, Tu Vi và progression của đời; Huyết Mạch/Thể Chất giữ nguyên tiến độ đã đầu tư. Timeline thế giới tiếp tục.</div>`;

  const legacy=`<div class="v2315-sheet-intro"><span>DI SẢN & COMPATIBILITY</span><strong>${esc(h.seal?.name||'Chưa Kết Ấn')}</strong><p>Ấn/Mệnh Thai/CP và Talent legacy vẫn được đọc để save cũ không hỏng, nhưng chúng không còn là reward loop chính của Reincarnation V2.</p></div><div class="v2315-legacy-kpis"><div><span>CP compatibility</span><b>${num(h.cp||0)}</b></div><div><span>Ấn XP</span><b>${num(h.seal?.xp||0)}</b></div><div><span>Số Luân Hồi</span><b>${num(model.reincarnation?.seal?.level||0)} Ấn</b></div></div><div class="v1086-legacy-list">${(h.daoInheritance||[]).map(x=>`<div><i>↟</i><section><strong>${esc(x.name)} Đạo · kỷ lục ${Number(x.bestEver||0).toFixed(1)}</strong><span>Đời này ${Number(x.currentLife||0).toFixed(1)} · đời sau ${Number(x.nextLifeStart||0).toFixed(1)}</span><small>Đây là bridge legacy theo backend hiện có; Đạo Tính và Chủ Đạo vẫn chọn lại theo rule canonical.</small></section></div>`).join('')||'<div class="v1086-empty-state"><i>↻</i><strong>Chưa có Đạo Hạnh truyền thừa</strong><span>Không có dữ liệu legacy đáng kể.</span></div>'}</div>`;

  return `<section class="v107-screen v2315-reincarnation"><div class="v107-body"><div class="v2315-scroll">${stage}${console}</div></div>${v106Sheet('trials','Thí Luyện Luân Hồi',trials)}${v106Sheet('potential',`Tiềm Năng Vĩnh Viễn · còn ${num(perm.unspent||0)}`,potential)}${v106Sheet('tree',`Cây Luân Hồi · còn ${num(rp.tree?.availablePoints||0)} điểm`,tree)}${v106Sheet('fate','Mệnh Thai Đời Kế',fate)}${v106Sheet('legacy','Di Sản & Compatibility',legacy)}${v106MoreSheet()}</section>`;
};


content.addEventListener('click',e=>{
  const open=e.target.closest('[data-sheet-open]');if(open){const panel=content.querySelector(`[data-sheet-panel="${CSS.escape(open.dataset.sheetOpen)}"]`);if(panel){content.querySelectorAll('.v106-sheet.open').forEach(x=>x.classList.remove('open'));panel.classList.add('open');}return;}
  if(e.target.closest('[data-sheet-close]')){e.target.closest('.v106-sheet')?.classList.remove('open');return;}
  if(e.target.classList.contains('v106-sheet'))e.target.classList.remove('open');
});



/* v1.07 Visual Production Rewrite — art-first mobile presentation */
function v107SkillArt(skillOrIndex,index=0){
  const skill=(skillOrIndex&&typeof skillOrIndex==='object')?skillOrIndex:null;
  const fallbackIndex=skill?index:Number(skillOrIndex||0);
  const custom=userAssetPath('skills',skill?.id||'');
  const production=skill?productionSkillIconPath(skill.id):'';
  return custom||production||`/assets/v107/skill-${Math.abs(fallbackIndex)%6+1}.webp`;
}
function v107SlotLabel(slot=''){const s=String(slot).toLowerCase();return s.includes('weapon')?'Kiếm':s.includes('head')?'Đầu':s.includes('robe')?'Y Phục':s.includes('belt')?'Đai':s.includes('glove')?'Hộ Thủ':s.includes('boot')?'Giày':s.includes('necklace')?'Ngọc Bội':s.includes('ring')?'Nhẫn':s.includes('bracelet')?'Vòng':s.includes('talisman')?'Phù':'Trang Bị';}
function v107TierClass(x={}){const raw=`${x.grade||''} ${x.quality||''} ${x.tier||''}`.toLowerCase();if(raw.includes('phá')||raw.includes('breaker'))return'apex';if(raw.includes('cực')||raw.includes('extreme'))return'extreme';if(raw.includes('tiên')||raw.includes('immortal'))return'immortal';if(raw.includes('thiên')||raw.includes('heaven'))return'heaven';return'normal';}
function v13823RarityLabel(x={}){const raw=String(x.grade||x.quality||x.tier||'Phàm');return raw||'Phàm';}
function v13823LazyImg(src,alt='',extra=''){return `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" ${extra}>`; }

/* v1.09 cleanup: removed superseded v1.07 header renderer */
function v1071SlotIcon(slot=''){
  const s=String(slot).toLowerCase();
  const common='viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  if(s.includes('weapon'))return `<svg ${common}><path d="M14 4 20 2l-2 6L8.5 17.5 6 18l.5-2.5L16 6"/><path d="m5 19-2 2m4-4 2 2"/></svg>`;
  if(s.includes('head'))return `<svg ${common}><path d="M5 13c0-5 3-8 7-8s7 3 7 8v5H5z"/><path d="M8 9c2 1 6 1 8 0M9 18v3m6-3v3"/></svg>`;
  if(s.includes('robe'))return `<svg ${common}><path d="m9 4-5 4 3 4v8h10v-8l3-4-5-4-3 3z"/><path d="M9 4c1 2 5 2 6 0"/></svg>`;
  if(s.includes('belt'))return `<svg ${common}><path d="M3 9h18v6H3z"/><path d="M10 10.5h4v3h-4z"/></svg>`;
  if(s.includes('glove'))return `<svg ${common}><path d="M8 21 5 13V5a2 2 0 0 1 4 0v5-7a2 2 0 0 1 4 0v7-5a2 2 0 0 1 4 0v9l-4 7z"/></svg>`;
  if(s.includes('boot'))return `<svg ${common}><path d="M8 3h7v10l5 3v4H6c-2 0-3-1-3-3 0-1 1-2 2-2l3-1z"/></svg>`;
  if(s.includes('necklace'))return `<svg ${common}><path d="M5 4c0 6 2 11 7 14 5-3 7-8 7-14"/><circle cx="12" cy="18" r="2.5"/></svg>`;
  if(s.includes('ring'))return `<svg ${common}><circle cx="12" cy="14" r="6"/><path d="m9 8 3-5 3 5"/></svg>`;
  return `<svg ${common}><circle cx="12" cy="12" r="8"/></svg>`;
}



/* v1.09 cleanup: removed superseded v1.07 character renderer */

function v90JourneySheet(j={}){
  const steps=Array.isArray(j.steps)?j.steps:[];
  const rows=steps.map((step,index)=>`<article class="v90-journey-step ${esc(step.status||'upcoming')}"><i>${step.status==='done'?'✓':step.status==='current'?'◆':num(index+1)}</i><div><small>${step.status==='done'?'ĐÃ XONG':step.status==='current'?'ĐANG ĐI':'SẮP TỚI'}${step.unlockRealmOrder!=null?` · ORDER ${num(step.unlockRealmOrder)}`:''}</small><strong>${esc(step.label||'')}</strong><span>${esc(step.description||'')}</span></div></article>`).join('');
  const ruleNote=j.rules?.noClaimRewards?'<div class="v90-journey-rule"><b>Không phải checklist nhận quà.</b><span>Tiên Lộ chỉ đọc state thật để chỉ đường. Không có nút claim riêng và không khóa sandbox sau khi một hệ đã mở.</span></div>':'';
  return `<div class="v90-journey-sheet-head"><span>VERTICAL SLICE ĐỜI ĐẦU</span><strong>Phàm Nhân → Kim Đan</strong><p>Hành trình này ưu tiên một việc có ý nghĩa tại mỗi thời điểm, nhưng không ép bạn làm daily checklist.</p></div><div class="v90-journey-sheet-list">${rows}</div>${ruleNote}`;
}
function v90JourneyCard(){
  const j=model?.flow?.journey;
  if(!j)return '';
  const steps=Array.isArray(j.steps)?j.steps:[],done=steps.filter(x=>x.status==='done').length,total=Math.max(1,steps.length);
  const action=j.currentActionKey?(model?.flow?.actions||[]).find(x=>x.key===j.currentActionKey):null;
  const cta=action?`<button class="v90-journey-cta" data-v90-journey-action="${esc(action.key)}">${esc(action.label||'Làm bước này')} <b>›</b></button>`:j.currentRoute?`<button class="v90-journey-cta" data-v90-journey-route="${esc(j.currentRoute)}">Đi tới ${esc(j.currentTitle||'mục tiêu')} <b>›</b></button>`:'';
  const next=j.nextUnlock?`<div class="v90-journey-unlock"><span>MỞ TIẾP · ${esc(j.nextUnlock.realm||'')}</span><b>${(j.nextUnlock.features||[]).slice(0,4).map(esc).join(' · ')}</b></div>`:'';
  const condition=j.conditionAlert?`<div class="v90-journey-condition ${esc(j.conditionAlert.tone||'warn')}"><i>!</i><span><b>${esc(j.conditionAlert.title||'Trạng thái cần xử lý')}</b><small>${esc(j.conditionAlert.description||'')}</small></span></div>`:'';
  const reserve=realmOrder()>=10?`<div class="v90-journey-budget"><i>◇</i><span><b>Tiên Ngọc Khóa là ngân sách, không phải nhiệm vụ.</b><small>Quay khi build cần, hoặc giữ lại. Tiên Lộ không yêu cầu sở hữu Pháp Bảo ngẫu nhiên để hoàn thành.</small></span></div>`:'';
  return `<section class="v90-journey-card ${j.complete?'complete':''}" data-v90-journey><header><div><small>TIÊN LỘ · ĐỜI ĐẦU</small><strong>${esc(j.currentTitle||j.stageLabel||'Hành trình tự do')}</strong></div><button data-sheet-open="journey">${done}/${total} <b>›</b></button></header><p>${esc(j.currentDescription||'')}</p><div class="v90-journey-progress"><i><em style="width:${pct(j.progressPct)}%"></em></i><span>${num(j.progressPct||0)}%</span></div>${condition}${next}${reserve}<footer>${cta||'<span class="v90-journey-complete">Vertical Slice đã hoàn tất · progression mở tự do</span>'}<button class="v90-journey-detail" data-sheet-open="journey">Xem Tiên Lộ</button></footer></section>`;
}

renderCultivation=function(){
  const o=model.overview||{},cult=model.character?.schema==='character-cultivation.v140'?model.character:(o.cultivation||{}),flow=model.flow||{};
  const tuVi=Math.max(0,Number(cult.tuVi)||0),required=Math.max(0,Number(cult.requiredTuVi)||0),pctValue=required>0?Math.min(100,tuVi/required*100):100;
  const rate=Math.max(0,Number(cult.finalTuViPer15s)||0),base=Math.max(0,Number(cult.baseTuViPer15s)||0),eta=Number(cult.etaRealSeconds)||0;
  const injury=Math.max(0,Number(cult.injury??o.injury)||0),retreat=cult.retreat||{},bank=Math.max(0,Number(retreat.bankHours)||0),cap=Math.max(0,Number(retreat.capHours)||9),daily=Math.max(0,Number(retreat.dailyAccrualHours)||3);
  const sources=(cult.sources||[]).map(src=>`<div class="list-item"><div><strong>${esc(src.label||src.id||'Nguồn Tu Vi')}</strong><div class="small muted">${src.kind==='percent'?'Tỷ lệ trên Tu Vi nền':src.kind==='base'?'Tu Vi nền cảnh giới':'Cộng cố định'}</div></div><b>${src.kind==='percent'?`${num(src.value,2)}%`:`+${num(src.value,0)}`}</b></div>`).join('')||'<div class="empty">Chưa có nguồn cộng ngoài Tu Vi nền.</div>';
  const transition=cult.transition||'auto';
  const transitionPanel=!cult.ready?`<div class="card"><div class="eyebrow">CHUYỂN CẢNH</div><h2>Tiếp tục Tự Tu</h2><p class="muted">Còn ${num(Math.max(0,required-tuVi),0)} Tu Vi. Tiểu cảnh sẽ tự thăng khi đầy; đại cảnh sẽ dừng để bạn Thăng Cảnh.</p></div>`:transition==='ascend'?`<div class="card highlight"><div class="eyebrow">ĐẠI CẢNH ĐÃ VIÊN MÃN</div><h2>${esc(cult.realm)} → ${esc(cult.nextRealm||'Cảnh tiếp')}</h2><p>Đủ Tu Vi là có thể Thăng Cảnh; không có bước chuẩn bị phụ.</p><button class="button gold" data-ascend-realm-v140>THĂNG CẢNH</button></div>`:transition==='tribulation'?`<div class="card danger"><div class="eyebrow">CỬA THIÊN KIẾP</div><h2>${esc(cult.realm)} → ${esc(cult.nextRealm||'Cảnh tiếp')}</h2><p>Đây là challenge riêng của Độ Kiếp. Kết quả dựa trên Thương Thế, Thần Hồn, Đạo và build hiện tại.</p><button class="button danger" data-tribulation-v140>DẪN THIÊN KIẾP</button></div>`:`<div class="card good"><div class="eyebrow">TIỂU CẢNH</div><h2>Đang tự thăng</h2><p>Tiểu cảnh không có nút xác suất; runtime tự chuyển khi đủ Tu Vi.</p></div>`;
  const retreatButtons=[1,3,6,9].filter(h=>h<=cap).map(h=>`<button class="button ${h===3?'gold':''}" data-retreat-hours="${h}" ${bank<=0?'disabled':''}>Bế Quan ${h}h</button>`).join('');
  const retreatCard=`<div class="card"><div class="eyebrow">BẾ QUAN</div><h2>${num(bank,2)} / ${num(cap,0)} giờ tích lũy</h2><p class="muted">Mỗi ngày +${num(daily,0)}h, tích tối đa ${num(cap,0)}h. 3h hiện tại tương đương ${num(retreat.rewardPct3h||0,2)}% requirement và được quy thành số Tu Vi thật. Gần đầy thanh chỉ tiêu đúng lượng giờ cần.</p><div class="tag-row">${retreatButtons}</div></div>`;
  const life=o.life||{},lifeText=Number.isFinite(Number(life.lifespanYears))?`${num(Math.max(0,Number(life.lifespanYears)-Number(life.ageYears||0)),1)} năm còn lại`:'Vô hạn';
  const daoSuy=model.daoSuy||{};
  const condition=`<div class="card"><div class="eyebrow">TRẠNG THÁI</div><h2>Thương Thế ${num(injury,0)}%</h2>${progress(Math.min(100,injury),'red')}<p class="muted">Core Tu Luyện chỉ dùng một trạng thái tổn thương. Tự Tu vẫn tiếp tục; Thương Thế ảnh hưởng các challenge cần thể trạng.</p>${metric(daoSuy.active?'Đạo Suy':'Thọ Nguyên',daoSuy.active?`${num(daoSuy.value||0,1)} / ${num(daoSuy.max||100,0)}`:lifeText)}</div>`;
  const hero=`<section class="v139-cult-hero card"><div><div class="eyebrow">TU LUYỆN V140 · ${esc(cult.realm||life.realm||'')}</div><h1>${num(tuVi,0)} / ${num(required,0)} Tu Vi</h1>${progress(pctValue,'gold')}<div class="grid cols-3" style="margin-top:12px">${metric('Tốc Tự Tu',`+${num(rate,0)} / 15s`)}${metric('Tu Vi nền',`+${num(base,0)} / 15s`)}${metric('ETA',cult.ready?'Đã viên mãn':durationText(eta))}</div></div></section>`;
  const sourceCard=`<div class="card"><div class="eyebrow">NGUỒN TU VI</div><h2>+${num(rate,0)} Tu Vi / 15s</h2><div class="list">${sources}</div><div class="footer-note">Nguồn cố định hiển thị bằng số cụ thể; bonus % chỉ dành cho milestone đặc biệt. Tất cả dùng cùng resolver V140.</div></div>`;
  const tuViPills=(model.alchemy?.pills||[]).filter(x=>x.family==='cultivation').reduce((n,x)=>n+Number(x.count||0),0)+resourceQuantity('resource.pill.cultivation');
  const pillCard=`<div class="card"><div class="eyebrow">TU VI ĐAN</div><h2>${num(tuViPills,0)} viên</h2><p class="muted">Tu Vi Đan cộng Tu Vi trực tiếp theo balance hiện tại.</p><button class="button" data-use-cultivation-pill ${tuViPills<=0?'disabled':''}>Dùng 1 viên</button></div>`;
  const eventBody=(flow.actions||[]).filter(a=>a.command?.type==='contentEvent').map(actionRow).join('');
  const events=eventBody?`<div class="card"><h2>Cơ Duyên</h2><div class="action-list">${eventBody}</div></div>`:'';
  const journeyCard=v90JourneyCard(),journeySheet=model?.flow?.journey?v106Sheet('journey','Tiên Lộ · Đời Đầu',v90JourneySheet(model.flow.journey)):'';
  return `<section class="v107-screen v139-cultivation"><div class="v107-body"><div class="v139-cult-scroll">${journeyCard}${hero}<div class="grid cols-2">${sourceCard}${condition}</div><div class="grid cols-2">${retreatCard}${pillCard}</div>${transitionPanel}${events}</div></div>${journeySheet}${v106MoreSheet()}</section>`;
};

/* v1.25 — Định Đạo + preview kỹ năng + Thục Luyện sâu. Không có nút thử skill. */
const V125_DAO_LABEL={sword:'Kiếm',fist:'Quyền',body:'Thể',spell:'Pháp',poison:'Độc',artifact:'Ngự Khí',formation:'Trận',mind:'Thần Niệm'};
const V125_NATURE_LABEL={orthodox:'Chính Tu',demonic:'Ma Tu',rogue:'Tán Tu'};
const V125_NATURE_BRANCH={
  orthodox:[['orthodox.guard','Hộ Đạo'],['orthodox.golden_body','Kim Thân'],['orthodox.righteous_art','Chính Pháp']],
  demonic:[['demonic.demon_art','Ma Công'],['demonic.break_demon','Phá Ma'],['demonic.demon_body','Ma Thể']],
  rogue:[['rogue.solitary','Độc Hành'],['rogue.hundred_refine','Bách Luyện'],['rogue.myriad_art','Vạn Pháp']],
};
const V125_GRADE_LABEL={mundane:'Phàm',spirit:'Linh',mystic:'Huyền',earth:'Địa',heaven:'Thiên',immortal:'Tiên',extreme:'Cực',breaker:'Phá'};
const V125_COST_LABEL={zero:'0',low:'Thấp',medium:'Trung',high:'Cao'};
function v138SkillLoadoutState(character=model?.character||{},specialization=model?.specialization||{}){
  const all=character.knownSkills||[],active=all.filter(x=>x.active),committed=Boolean(specialization?.mainDaoId&&specialization?.daoNatureId),mainDao=specialization?.mainDaoId||null;
  const activeCapacity=committed?Math.max(1,Math.min(5,Number(specialization?.activeSlotsUnlocked||1))):6;
  let basic=null,ultimate=null,actives=[];
  if(committed){
    basic=active.find(x=>x.slot==='basic'&&x.dao===mainDao)||null;
    ultimate=active.find(x=>x.slot==='ultimate'&&x.dao===mainDao)||null;
    actives=active.filter(x=>x.dao===mainDao&&x.slot!=='basic'&&x.slot!=='ultimate').slice(0,activeCapacity);
  }else actives=active.slice(0,activeCapacity);
  return{all,active,committed,mainDao,basic,ultimate,actives,activeCapacity};
}
function v138SkillToggleMeta(skill,state=v138SkillLoadoutState()){
  if(!skill)return{disabled:true,label:'Không có kỹ năng'};
  if(!state.committed)return{disabled:!skill.active&&state.active.length>=state.activeCapacity,label:skill.active?'Tháo khỏi bộ kỹ năng':'Trang bị vào bộ kỹ năng'};
  if(skill.dao&&skill.dao!==state.mainDao)return{disabled:true,label:'Phụ Đạo chỉ dùng Tâm Pháp'};
  if(skill.slot==='basic')return{disabled:true,label:skill.active?'Đánh Thường Chủ Đạo':'Đánh Thường Chủ Đạo được trang bị cố định'};
  if(skill.slot==='ultimate')return{disabled:false,label:skill.active?'Tháo Tuyệt Kỹ':state.ultimate?'Thay Tuyệt Kỹ':'Trang bị Tuyệt Kỹ'};
  return{disabled:!skill.active&&state.actives.length>=state.activeCapacity,label:skill.active?'Tháo khỏi ô Chủ Động':'Trang bị vào ô Chủ Động'};
}
function v125SpecializationPanel(){
  const sp=model.specialization||{},preview=model.specializationPreview||{daos:[]},realmOrder=Number(model.overview?.life?.realmOrder||0),knownMap=new Map((model.character?.knownSkills||[]).map(x=>[x.id,x]));
  const committed=Boolean(sp.daoNatureId&&sp.mainDaoId),branches=V125_NATURE_BRANCH[sp.daoNatureId]||[];
  const previewSheets=(preview.daos||[]).map(group=>{
    const daoName=V125_DAO_LABEL[group.dao]||group.dao;
    return v106Sheet(`v125-dao-${group.dao}`,`${daoName} · Xem trước kỹ năng`,v12311DaoPreviewSheet(group));
  }).join('');
  const daoPreviewButtons=(preview.daos||[]).map(group=>`<button class="button" data-sheet-open="v125-dao-${esc(group.dao)}">${esc(V125_DAO_LABEL[group.dao]||group.dao)} · xem 10 chiêu</button>`).join('');
  let head='';
  if(!committed){
    const daoOptions=(preview.daos||[]).map(x=>`<option value="${esc(x.dao)}">${esc(V125_DAO_LABEL[x.dao]||x.dao)}</option>`).join('');
    head=`<div class="card highlight" style="margin-bottom:12px"><div class="eyebrow">Định Đạo v1.25</div><h2>${realmOrder<10?'Đọc kỹ rồi tự chọn tại Trúc Cơ':'Chọn con đường của đời hiện tại'}</h2><p class="small muted">Không thử skill. Chọn 1 Đạo Tính trước, sau đó chọn đúng 1 Chủ Đạo; đã xác nhận thì khóa tới Luân Hồi.</p><div class="grid cols-3"><label><span class="small">Đạo Tính</span><select name="v125Nature"><option value="orthodox">Chính Tu</option><option value="demonic">Ma Tu</option><option value="rogue">Tán Tu</option></select></label><label><span class="small">Chủ Đạo</span><select name="v125MainDao">${daoOptions}</select></label><div style="display:flex;align-items:end"><button class="button gold" data-v125-commit ${realmOrder<10?'disabled':''}>${realmOrder<10?'Cần đạt Trúc Cơ':'Xác nhận Định Đạo'}</button></div></div><div class="v106-action-grid" style="margin-top:10px">${daoPreviewButtons}</div></div>`;
  }else{
    const b=sp.bonuses||{};
    head=`<div class="card highlight" style="margin-bottom:12px"><div class="eyebrow">Chuyên tu đời hiện tại</div><h2>${esc(sp.daoNatureName||'')} · ${esc(sp.mainDaoName||'')} Chủ${sp.secondaryDaoName?` · ${esc(sp.secondaryDaoName)} Phụ`:''}</h2><div class="v1086-status-grid">${metric('Điểm Kỹ Năng',num(sp.skillPoints||0))}${metric('Công',`+${num(b.attackPct||0,1)}%`)}${metric('Thể/HP',`+${num(b.maxHpPct||0,1)}%`)}${metric('Phòng',`+${num(b.defensePct||0,1)}%`)}${metric('Phá Thế',`+${num(b.breakPct||0,1)}%`)}${metric('Bạo Thương',`+${num(b.critDamagePct||0,1)}%`)}</div>${sp.secondaryUnlocked&&!sp.secondaryDaoId?`<div style="display:flex;gap:8px;align-items:end;margin-top:10px"><label style="flex:1"><span class="small">Phụ Đạo · chỉ mở từ Tiên</span><select name="v125SecondaryDao">${(preview.daos||[]).filter(x=>x.dao!==sp.mainDaoId).map(x=>`<option value="${esc(x.dao)}">${esc(V125_DAO_LABEL[x.dao]||x.dao)}</option>`).join('')}</select></label><button class="button gold" data-v125-secondary>Khóa Phụ Đạo</button></div>`:sp.secondaryUnlocked?'<p class="small muted">Phụ Đạo chỉ mở Tâm Pháp đúng Đạo phụ; Tâm Pháp hưởng 100% hiệu lực. Không nhận Core, Đánh Thường, Chủ Động hay Tuyệt Kỹ.</p>':'<p class="small muted">Phụ Đạo chưa mở; đạt Tiên mới được chọn.</p>'}<div class="v106-action-grid" style="margin-top:10px">${daoPreviewButtons}</div></div>`;
  }
  const mainGroup=committed?(preview.daos||[]).find(x=>x.dao===sp.mainDaoId):null;
  const daoCatalog=mainGroup?`<div class="card v138-dao-catalog" style="margin-bottom:12px"><div class="v1086-library-head"><div><strong>${esc(V125_DAO_LABEL[mainGroup.dao]||mainGroup.dao)} · Bộ kỹ năng canonical</strong><span>1 Đánh Thường · 8 Chủ Động · 1 Tuyệt Kỹ</span></div><button data-sheet-open="v125-dao-${esc(mainGroup.dao)}">Chi tiết</button></div><div class="v138-dao-catalog-grid">${(mainGroup.skills||[]).map((sk,i)=>{const knownSkill=knownMap.get(sk.id);return `<button class="${knownSkill?'known':'locked'}" data-sheet-open="v125-dao-${esc(mainGroup.dao)}" title="${esc(sk.name)}"><span><img src="${v107SkillArt(sk,i)}" alt="" loading="lazy" decoding="async"></span><small>${esc(sk.name)}</small><b>${knownSkill?(knownSkill.active?'Đang dùng':'Đã học'):'Khóa'}</b></button>`;}).join('')}</div></div>`:'';
  const sectManual=committed&&sp.sectManual?.active?sp.sectManual.manual:null;
  const sectManualSheet=sectManual?v106Sheet('sect-manual',sectManual.shortName||sectManual.name,`<div class="v12310-manual-sheet"><header><span>BÍ TỊCH TRẤN PHÁI · ${esc(sectManual.daoName||sp.mainDaoName||'Chủ Đạo')}</span><strong>${esc(sectManual.name||'Bí Tịch Trấn Phái')}</strong><p>${esc(sectManual.description||'')}</p></header><div class="v12310-manual-kpi"><div><span>Đạo Hạnh</span><b>${num(sectManual.daoHanh||0,1)}/100</b><small>${esc(sectManual.daoStage||'')}</small></div><div><span>Chương đang mở</span><b>${num(sectManual.activeChapter||0)}/3</b><small>${sectManual.nextChapterDaoHanh!=null?`Mốc kế ${num(sectManual.nextChapterDaoHanh)}`:'Đã lĩnh ngộ đủ'}</small></div></div><div class="v12310-manual-rule"><b>Không phải vật phẩm.</b><span>Bí Tịch luôn đi theo Chủ Đạo, không chiếm ô trang bị và không có bản Phụ Đạo thứ hai.</span></div><div class="v12310-manual-chapters">${(sectManual.chapters||[]).map(ch=>`<article class="${ch.unlocked?'unlocked':'locked'}"><i>${ch.unlocked?'✓':ch.chapter}</i><div><span>CHƯƠNG ${num(ch.chapter)} · MỞ Ở ${num(ch.unlockDaoHanh)} ĐẠO HẠNH</span><strong>${esc(ch.name||'')}</strong><p>${esc(ch.summary||ch.description||'')}</p>${ch.constraint?`<small>Đánh đổi: ${esc(ch.constraint)}</small>`:''}</div></article>`).join('')}</div><div class="v12310-manual-explain"><strong>Đạo Hạnh tăng thế nào?</strong><p>Mỗi lần thi triển kỹ năng Bản Đạo hợp lệ cho <b>0,02 Đạo Hạnh cơ sở</b>; mỗi Bản Đạo tối đa <b>1,00 cơ sở/trận</b>. Chủ Đạo và Phụ Đạo đều nhận 100% Đạo Hạnh từ hành động hợp lệ của chính Đạo đó; Bí Tịch Trấn Phái chỉ đọc Đạo Hạnh của Chủ Đạo.</p><p>Bát Đạo Chân Điện là nơi thử luyện Bản Đạo; không còn rơi Set Trấn Phái.</p></div></div>`):'';
  const sectManualCard=sectManual?`<div class="card v12310-manual-card" style="margin-bottom:12px"><div class="v12310-manual-card-head"><div><span>BÍ TỊCH TRẤN PHÁI</span><strong>${esc(sectManual.name)}</strong><small>${esc(sectManual.daoName||sp.mainDaoName||'')} Chủ · Đạo Hạnh ${num(sectManual.daoHanh||0,1)}/100</small></div><button data-sheet-open="sect-manual">Chi tiết</button></div><p>${esc(sectManual.description||'')}</p><div class="v12310-manual-progress"><div><i style="width:${Math.max(0,Math.min(100,Number(sectManual.daoHanh||0)))}%"></i></div><span>${sectManual.nextChapterDaoHanh!=null?`Chương ${num((sectManual.activeChapter||0)+1)} mở tại ${num(sectManual.nextChapterDaoHanh)} Đạo Hạnh`:'Đã mở đủ 3 chương'}</span></div><div class="v12310-manual-mini">${(sectManual.chapters||[]).map(ch=>`<span class="${ch.unlocked?'active':''}"><b>${ch.chapter}</b><small>${ch.unlocked?'Đã mở':num(ch.unlockDaoHanh)}</small></span>`).join('')}</div></div>`:'';
  const tree=committed?`<div class="card" style="margin-bottom:12px"><h2>Cây ${esc(sp.daoNatureName||'Đạo Tính')} · 160 điểm/đời</h2><div class="list">${(sp.tiers||[]).map(t=>{const spent=Object.values(t.allocatedByBranch||{}).reduce((a,v)=>a+Number(v||0),0),free=Math.max(0,Number(t.earnedPoints||0)-spent);return `<div class="action ${t.unlocked?'':'locked'}"><div><div class="label">${esc(t.name)} · ${spent}/${num(t.earnedPoints||0)} điểm</div><div class="desc">${t.unlocked?`Còn ${free} điểm · mốc lớn 5/10/15/20`:`Mở ở realm order ${num(t.realmGate||0)}`}</div>${t.unlocked?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:7px">${branches.map(([id,label])=>{const n=Number(t.allocatedByBranch?.[id]||0);return `<button class="button" data-v125-point-tier="${esc(t.id)}" data-v125-point-branch="${esc(id)}" ${free<1?'disabled':''}>${esc(label)} ${n} · +1</button>${spent>=20&&!t.majorBranchChoice&&n>=10?`<button class="button gold" data-v125-major-tier="${esc(t.id)}" data-v125-major-branch="${esc(id)}">Chọn Đại Thiên Phú ${esc(label)}</button>`:''}`;}).join('')}</div>${t.majorBranchChoice?`<div class="small good-text">Đại Thiên Phú: ${esc((branches.find(x=>x[0]===t.majorBranchChoice)||[])[1]||t.majorBranchChoice)}</div>`:''}`:''}</div></div>`;}).join('')}</div></div>`:'';
  const practice=committed&&Array.isArray(sp.skills)&&sp.skills.length?`<div class="card" style="margin-bottom:12px"><h2>Thục Luyện · 0–1.000.000</h2><div class="list">${sp.skills.map(x=>`<div class="action"><div><div class="label">${esc(x.name)} · Tầng ${num(x.tier||0)}/1000 · ${esc(x.stage||'Chưa Luyện')}</div><div class="desc">${num(x.xp||0)}/1.000.000 · Hiệu quả +${num(x.effectBonusPct||0)}% · giảm CN ${num(x.spiritCostReductionPct||0)}% · giảm hồi chiêu ${num(x.cooldownReductionPct||0)}%</div></div></div>`).join('')}</div></div>`:'';
  const manuals=committed&&Array.isArray(sp.battleManuals)?`<div class="card" style="margin-bottom:12px"><h2>Mảnh Công Pháp Bản Đạo</h2><div class="list">${sp.battleManuals.map(x=>`<div class="action"><div><div class="label">${esc(x.name)} · ${esc(V125_GRADE_LABEL[x.grade]||x.grade)}</div><div class="desc">Mảnh ${num(x.fragments||0)}/${num(x.restoreRequired||0)} · Lĩnh Ngộ ${num(x.mastery||0,1)}%${x.restored?' · đã phục nguyên':''}</div></div><button class="button ${x.restored?'':'gold'}" data-v125-restore="${esc(x.id)}" ${x.restored||Number(x.fragments||0)<Number(x.restoreRequired||0)?'disabled':''}>${x.restored?'Đã phục nguyên':'Phục nguyên'}</button></div>`).join('')||'<div class="empty">Chưa có Công Pháp Bản Đạo phù hợp.</div>'}</div></div>`:'';
  const passives=committed&&Array.isArray(sp.passives)&&sp.passives.length?`<div class="card" style="margin-bottom:12px"><h2>Bị Động · Lv1–20</h2><div class="list">${sp.passives.map(x=>{const src=(x.sources||[]).sort((a,b)=>Number(b.canUpgrade)-Number(a.canUpgrade))[0];return `<div class="action"><div><div class="label">${esc(x.name)} · Lv${num(x.level||1)}/20</div><div class="desc">${esc(x.description||'')}${src?` · ${esc(src.name)}: ${num(src.fragments||0)}/${num(src.upgradeCost||0)} mảnh`:''}</div></div>${src?`<button class="button gold" data-v125-passive="${esc(x.id)}" data-v125-passive-source="${esc(src.id)}" ${!src.canUpgrade?'disabled':''}>Nâng Lv</button>`:''}</div>`;}).join('')}</div></div>`:'';
  return{html:head+daoCatalog+sectManualCard+tree+practice+manuals+passives,sheets:previewSheets+sectManualSheet};
}

/* v1.09 cleanup: legacy Săn Yêu renderer removed; see modules/hunt-combat-v2.js */
function v12311RoleMeta(sk={}){
  const role=String(sk.practiceRoleV126||'').trim();
  if(role)return{label:role,tone:/phá/i.test(role)?'break':/kết|phệ|kích/i.test(role)?'finish':/dẫn/i.test(role)?'channel':'generate'};
  const domains=(sk.domains||[]).join(' ').toLowerCase(),res=(sk.daoResourceSummary||[]).join(' ').toLowerCase();
  if(/break|pháthế/.test(domains))return{label:'Phá thế',tone:'break'};
  if(/finisher|consume|spend/.test(domains)||/tiêu .*toàn bộ|kết liễu/.test(res))return{label:'Kết liễu',tone:'finish'};
  if(/defense|counter/.test(domains))return{label:'Phòng thủ / Phản',tone:'defense'};
  if(/channel/.test(domains))return{label:'Dẫn pháp',tone:'channel'};
  return{label:'Tích thế',tone:'generate'};
}
function v12311SkillType(sk={}){return sk.slot==='ultimate'?'Tuyệt Kỹ':sk.slot==='basic'?'Đánh Thường':'Chủ Động';}
function v12311SkillUseText(sk={},guide={}){
  const role=v12311RoleMeta(sk).tone;
  if(role==='break')return `Dùng ở bước ${guide.steps?.[1]?.label||'PHÁ'} để bào Thế và mở cửa sổ cho payoff sau.`;
  if(role==='finish')return `Dùng ở bước ${guide.steps?.[2]?.label||'KẾT'} khi tài nguyên/cửa sổ đã đủ; đây không phải chiêu nên spam ngay khi hồi xong.`;
  if(role==='defense')return 'Dùng để sống qua áp lực, phản kích hoặc đổi tài nguyên lấy an toàn; giá trị phụ thuộc trạng thái trận.';
  if(role==='channel')return 'Cần giữ nhịp dẫn pháp; bị ngắt chỉ hưởng phần hiệu ứng đã thực sự xảy ra.';
  return `Dùng ở bước ${guide.steps?.[0]?.label||'TÍCH'} để dựng tài nguyên/trạng thái cho vòng đánh.`;
}
function v12311SkillSheet(sk={},knownSkill=null,practice=null,guide={},realmOrder=0,eligibleDao=false,committed=false,state=null,index=0){
  const known=Boolean(knownSkill),role=v12311RoleMeta(sk),realmOk=realmOrder>=Number(sk.realmGate||0),toggle=known&&state?v138SkillToggleMeta(knownSkill,state):null;
  const canAttemptLearn=committed&&eligibleDao&&!known&&sk.slot!=='basic'&&realmOk;
  const damage=Number(sk.damageCoefficientPct||0),breakPct=Number(sk.breakDamagePct||0),channel=String(sk.form||'').toLowerCase()==='channel';
  const mechanics=[...(sk.effectSummary||[]),...(sk.daoResourceSummary||[])];
  const lv=Number(practice?.levelV12317||1),gradeLabel=String(practice?.gradeLabelV12317||'Phàm'),grade=String(practice?.gradeV12317||'mundane');
  const skillSys=model?.specialization?.skillSystemV12317||{},genericFragments=Number(skillSys.skillGenericFragments||0),levelCost=Number(practice?.levelCostV12317||0),specific=Number(practice?.specificFragmentsV12317||0),advanceCost=Number(practice?.advanceCostV12317||0);
  const rankBlock=known?`<section class="v12311-detail-block v12317-rank-block"><header><span>BẬC & CẤP</span><b>${esc(gradeLabel)} · Lv${num(lv)}/20</b></header><div class="v12317-rank-grid"><div><span>Mảnh Kỹ Năng</span><b>${num(genericFragments)}</b><small>${lv<20?`Cần ${num(levelCost)} để lên Lv${num(lv+1)}`:'Đã đủ cấp để Tiến Bậc'}</small></div><div><span>Mảnh riêng</span><b>${num(specific)}</b><small>${grade==='breaker'?'Đã đạt Bậc Phá':lv>=20?`Cần ${num(advanceCost)} để tiến bậc`:'Mở khi Lv20'}</small></div></div><div class="v106-action-grid">${lv<20?`<button class="button gold" data-skill-upgrade-v12317="${esc(sk.id)}" ${genericFragments<levelCost?'disabled':''}>Cường Hóa Skill</button>`:grade!=='breaker'?`<button class="button gold" data-skill-advance-v12317="${esc(sk.id)}" ${specific<advanceCost?'disabled':''}>Tiến Bậc ${esc(gradeLabel)}</button>`:'<button class="button" disabled>Đã đạt Bậc Phá</button>'}</div><p><b>Cấp/Bậc</b> dùng mảnh. <b>Thục Luyện</b> tăng khi skill thực sự được dùng trong chiến đấu.</p></section>`:'';
  const scaling=practice?.scalingSummaryV12317||'100% hệ số Công Lực nền';
  const practiceBlock=practice?`<section class="v12311-detail-block"><header><span>THỤC LUYỆN</span><b>Tầng ${num(practice.tier||0)}/1000 · ${esc(practice.stage||'Chưa Luyện')}</b></header><div class="v12311-practice-line"><i><em style="width:${Math.max(0,Math.min(100,Number(practice.tier||0)/10))}%"></em></i><span>${num(practice.xp||0)} / 1.000.000</span></div><p>Hiệu quả chính +${num(practice.effectBonusPct||0)}% · giảm CN ${num(practice.spiritCostReductionPct||0)}% · giảm hồi chiêu ${num(practice.cooldownReductionPct||0)}%.</p>${practice.growthSummaryV126?`<small>${esc(practice.growthSummaryV126)}</small>`:''}</section>`:'';
  return `<div class="v12311-skill-sheet"><div class="v12311-detail-head"><img src="${v107SkillArt(sk,index)}" alt=""><div><span>${esc(v12311SkillType(sk))} · <b class="${role.tone}">${esc(role.label)}</b>${known?` · <em>${esc(gradeLabel)} Lv${num(lv)}</em>`:''}</span><strong>${esc(sk.name||'Kỹ năng')}</strong><p>${esc(sk.description||'')}</p></div></div><div class="v12311-detail-kpis"><div><span>Sát thương gốc</span><b>${damage>0?`${num(damage,0)}% Công Lực${channel?'*':''}`:'—'}</b><small>${channel&&damage>0?'* tổng nếu dẫn đủ nhịp':'trước Phòng Ngự / modifier'}</small></div><div><span>Phá Thế</span><b>${breakPct>0?`${num(breakPct,0)}%`:'—'}</b><small>${breakPct>0?'bào thanh Thế, không phải HP':'không thiên Phá'}</small></div></div><section class="v12311-detail-block v12317-scaling"><header><span>SCALING</span><b>Chỉ số của build</b></header><p>${esc(scaling)}</p><small>Hệ số phụ được quy đổi vào hiệu quả action; Phòng Ngự được chuẩn hóa theo economy 1 Tiềm Năng = +3 Phòng Ngự.</small></section><section class="v12311-detail-block"><header><span>CÁCH DÙNG</span><b>${esc(role.label)}</b></header><p>${esc(v12311SkillUseText(sk,guide))}</p></section><section class="v12311-detail-block"><header><span>HIỆU ỨNG BACKEND</span><b>${mechanics.length} dòng</b></header><div class="v12311-mechanic-lines">${mechanics.map(x=>`<div><i>◆</i><span>${esc(x)}</span></div>`).join('')||'<div><i>◇</i><span>Không có damage trực tiếp; giá trị nằm ở trạng thái/tài nguyên.</span></div>'}</div></section><section class="v12311-detail-block"><header><span>NHỊP & CHI PHÍ</span><b>${esc(V125_COST_LABEL[sk.spiritCostClass]||sk.spiritCostClass||'0')}</b></header><div class="v12311-time-grid"><div><span>CN chuẩn</span><b>${num(sk.spiritCostStandardPct||0)}%</b></div><div><span>Hồi chiêu</span><b>${num(sk.cooldown||0,1)}s</b></div><div><span>Thi triển</span><b>${num(sk.castTime||0,1)}s</b></div><div><span>Thu chiêu</span><b>${num(sk.recoveryTime||0,1)}s</b></div></div><p>“CN chuẩn” là tỷ lệ trước Hiệu Suất Chân Nguyên và modifier build; số tiêu thật có thể thấp hơn.</p></section>${rankBlock}${practiceBlock}<section class="v12311-detail-block compact"><header><span>MỞ KHÓA</span><b>Realm order ${num(sk.realmGate||0)}</b></header><p>${known?'✓ Đã lĩnh ngộ.':!committed?'Chỉ xem trước; Trúc Cơ mới được Định Đạo.':!eligibleDao?'Kỹ năng chiến đấu chỉ thuộc Chủ Đạo đời này; Phụ Đạo chỉ mở Tâm Pháp.':!realmOk?'Chưa đủ cảnh giới.':'Đủ cảnh giới · Lĩnh ngộ Lv1 miễn phí; Công Pháp legacy không còn khóa kỹ năng V2.'}</p></section>${known?`<button class="button ${knownSkill.active?'danger':'gold'} v1086-full-btn" data-skill-active="${esc(knownSkill.id)}" data-active="${knownSkill.active?'0':'1'}" ${toggle?.disabled?'disabled':''}>${esc(toggle?.label||'Cập nhật loadout')}</button>`:canAttemptLearn?`<button class="button gold v1086-full-btn" data-learn-v125="${esc(sk.id)}">Lĩnh ngộ Lv1 · Miễn phí</button>`:''}</div>`;
}

function v12317HeartMethodSection(sp={}){
  const rows=Array.isArray(sp.passives)?sp.passives:[];if(!rows.length)return '';
  const heartCat=(model?.collectionEconomy?.categories||[]).find(x=>x.category==='heart')||{},heartItems=heartCat.items||[];
  return `<section class="v12317-heart-section"><div class="v12311-section-title"><div><span>TÂM PHÁP</span><strong>Nội tu Bản Đạo V2</strong></div><small>${rows.length} đã lĩnh ngộ</small></div><p class="v12317-heart-rule"><b>Tâm Pháp V2 tự mở theo cảnh giới.</b> Chủ Đạo và đúng Phụ Đạo đã chọn đều hưởng <b>100% hiệu lực</b>. Phụ Đạo không mở Core, Đánh Thường, Chủ Động hay Tuyệt Kỹ.</p><div class="v12317-heart-list">${rows.map(x=>{
    const isV2=Boolean(x.v2),item=heartItems.find(i=>i.linkedPassiveId===x.id)||{},p=item.progress||{},lv=Number(x.level||1),grade=String(x.gradeV12317||'mundane'),advanceCost=[16,28,45,70,105,155,225][Math.max(0,['mundane','spirit','mystic','earth','heaven','immortal','extreme','breaker'].indexOf(grade))]||0;
    const role=x.sourceRole==='secondary'?'Phụ Đạo · 100%':'Chủ Đạo · 100%';
    const action=isV2||x.upgradeEnabled===false?`<div class="tag-row"><button class="button" disabled>V2 · mở theo cảnh giới</button></div>`:`<div class="tag-row">${lv<20?`<button class="button gold" data-heart-strengthen-v12325="${esc(x.id)}">Tu Luyện</button>`:grade!=='breaker'?`<button class="button gold" data-heart-advance-v12325="${esc(x.id)}" ${Number(p.specificFragments||0)<advanceCost?'disabled':''}>Tiến Bậc · ${num(advanceCost)} mảnh</button>`:'<button class="button" disabled>Đã Bậc Phá</button>'}</div>`;
    const resources=isV2?`<em>${esc(role)} · Mở ở Order ${num(x.realmGate||0)}</em>`:`<em>Tàn Quyển ${num(heartCat.genericFragments||0)} · Mảnh riêng ${num(p.specificFragments||0)}${Number(heartCat.ascensionEssence||0)>0?` · Thiên Tinh ${num(heartCat.ascensionEssence||0)}`:''}</em>`;
    return `<article class="${isV2?'v2-heart':''}"><div><span>${esc(x.gradeLabelV12317||'Phàm')} · Lv${num(lv)}/20</span><strong>${esc(x.name)}</strong><p>${esc(x.statSummaryV12317||'')}</p><small>${esc(x.effectSummaryV126||x.description||'')}</small>${resources}</div>${action}</article>`;
  }).join('')}</div></section>`;
}

function v12311ManualSheet(manual={},sp={}){
  if(!manual?.name)return '<div class="v12311-empty"><b>Chưa có Bí Tịch Trấn Phái</b><span>Định Đạo tại Trúc Cơ để nhận truyền thừa của Chủ Đạo.</span></div>';
  return `<div class="v12311-manual-sheet"><header><span>BÍ TỊCH TRẤN PHÁI · ${esc(manual.daoName||sp.mainDaoName||'Chủ Đạo')}</span><strong>${esc(manual.name)}</strong><p>${esc(manual.description||'')}</p></header><div class="v12311-manual-status"><div><span>Đạo Hạnh</span><b>${num(manual.daoHanh||0,1)}/100</b><small>${esc(manual.daoStage||'')}</small></div><div><span>Đang vận hành</span><b>Chương ${num(manual.activeChapter||0)}/3</b><small>${manual.nextChapterDaoHanh!=null?`Mốc kế ${num(manual.nextChapterDaoHanh)}`:'Đã mở đủ'}</small></div></div><div class="v12311-manual-rule"><b>Bí Tịch không phải trang bị.</b><span>Luôn đi theo Chủ Đạo; không chiếm slot, không có Cường Hóa và Phụ Đạo không kích cuốn thứ hai.</span></div><div class="v12311-manual-chapters">${(manual.chapters||[]).map(ch=>`<article class="${ch.unlocked?'active':''}"><i>${ch.unlocked?'✓':ch.chapter}</i><div><span>CHƯƠNG ${num(ch.chapter)} · ${num(ch.unlockDaoHanh)} ĐẠO HẠNH</span><strong>${esc(ch.name||'')}</strong><p>${esc(ch.description||ch.summary||'')}</p>${ch.summary?`<small>${esc(ch.summary)}</small>`:''}${ch.constraint?`<em>Đánh đổi: ${esc(ch.constraint)}</em>`:''}</div></article>`).join('')}</div><div class="v12311-manual-explain"><strong>Đạo Hạnh tăng bằng chiến đấu thật</strong><p>Mỗi cast kỹ năng Bản Đạo hợp lệ: +0,02 cơ sở; tối đa 1,00 cơ sở/Bản Đạo/trận. Chủ Đạo và Phụ Đạo đều nhận 100% Đạo Hạnh từ hành động hợp lệ của chính Đạo đó; Bí Tịch chỉ đọc Đạo Hạnh Chủ Đạo.</p></div></div>`;
}
function v12311DaoPreviewSheet(group={}){
  const guide=group.guide||{},skills=group.skills||[];
  return `<div class="v12311-dao-preview"><header><span>${esc(guide.loopCode||'BẢN ĐẠO')}</span><strong>${esc(guide.daoName||V125_DAO_LABEL[group.dao]||group.dao||'')}</strong><p>${esc(guide.summary||'')}</p></header><div class="v12311-loop-steps">${(guide.steps||[]).map((st,i)=>`<article><i>${i+1}</i><div><b>${esc(st.label)}</b><span>${esc(st.detail)}</span></div></article>`).join('')}</div><div class="v12311-resource-list">${(guide.resources||[]).map(r=>`<div><span>${esc(r.name)}</span><b>${esc(r.range)}</b><small>${esc(r.detail)}</small></div>`).join('')}</div><p class="v12311-tip">${esc(guide.beginnerTip||'')}</p><div class="v12311-preview-list">${skills.map((sk,i)=>{const role=v12311RoleMeta(sk),main=sk.damageCoefficientPct?`${num(sk.damageCoefficientPct,0)}% Công Lực`:(sk.effectSummary?.[0]||'Utility'),resource=(sk.daoResourceSummary||[])[0]||'';return `<article class="v12311-preview-item"><img src="${v107SkillArt(sk,i)}" alt="" loading="lazy" decoding="async"><div><strong>${esc(sk.name)}</strong><span>${esc(v12311SkillType(sk))} · ${esc(role.label)} · CN ${num(sk.spiritCostStandardPct||0)}% · CD ${num(sk.cooldown||0,1)}s</span><small>${esc(main)}${sk.breakDamagePct?` · Phá ${num(sk.breakDamagePct,0)}%`:''}${resource?` · ${esc(resource)}`:''}</small></div><b>${sk.slot==='ultimate'?'U':sk.slot==='basic'?'B':i}</b></article>`;}).join('')}</div></div>`;
}
function renderDevLabV12317(){
  if(!DEV_MODE)return page('DEV Lab','Chỉ mở bằng ?dev=1','<div class="card"><h2>DEV Mode đang tắt</h2></div>');
  const sp=model?.specialization||{},preview=model?.specializationPreview||{daos:[]},daoIds=['sword','fist','body','spell','poison','artifact','formation','mind'];
  const daoOptions=daoIds.map(id=>`<option value="${id}" ${sp.mainDaoId===id?'selected':''}>${esc(V125_DAO_LABEL[id]||id)}</option>`).join('');
  const secondaryOptions=`<option value="">Không dùng</option>`+daoIds.filter(id=>id!==sp.mainDaoId).map(id=>`<option value="${id}" ${sp.secondaryDaoId===id?'selected':''}>${esc(V125_DAO_LABEL[id]||id)}</option>`).join('');
  const skills=Array.isArray(sp.skills)?sp.skills:[];
  const hearts=Array.isArray(sp.passives)?sp.passives:[];
  const quick=daoIds.map(id=>`<button class="button" data-dev-lab-preset="${id}">${esc(V125_DAO_LABEL[id]||id)}</button>`).join('');
  const skillRows=skills.map(x=>`<article class="v12317-dev-skill"><div><span>${esc(x.gradeLabelV12317||'Phàm')} · Lv${num(x.levelV12317||1)} · TL ${num(x.tier||0)}/1000</span><strong>${esc(x.name)}</strong><small>${esc(x.scalingSummaryV12317||'')}</small></div><div><button class="button ghost" data-dev-skill-tune="${esc(x.id)}" data-dev-level="1" data-dev-grade="mundane" data-dev-mastery="0">Phàm Lv1</button><button class="button" data-dev-skill-tune="${esc(x.id)}" data-dev-level="10" data-dev-grade="immortal" data-dev-mastery="500">Tiên Lv10</button><button class="button gold" data-dev-skill-tune="${esc(x.id)}" data-dev-level="20" data-dev-grade="breaker" data-dev-mastery="1000">MAX Phá</button></div></article>`).join('');
  const heartRows=hearts.map(x=>`<div class="v12317-dev-heart"><span>${esc(x.gradeLabelV12317||'Phàm')} Lv${num(x.level||1)}</span><b>${esc(x.name)}</b><small>${esc(x.statSummaryV12317||'')} · ${esc(x.effectSummaryV126||'')}</small></div>`).join('');
  const body=`<section class="v12317-dev-hero"><span>DEV · SAVE-SAFE</span><strong>Skill Lab Alpha.23.17</strong><p>Preset chỉ tác động runtime DEV. Production save không bị ghi đè. Dùng để mở toàn bộ skill/Tâm Pháp/Biến Thức/Công Pháp của Chủ + Phụ Đạo rồi test combat ngay.</p></section><section class="card v12317-dev-controls"><h2>Nạp build thử</h2><div class="grid cols-3"><label><span class="small">Chủ Đạo</span><select name="devMainDao">${daoOptions}</select></label><label><span class="small">Phụ Đạo</span><select name="devSecondaryDao">${secondaryOptions}</select></label><label><span class="small">Cảnh giới</span><select name="devRealmOrder"><option value="10">Trúc Cơ</option><option value="46">Tiên · mở Phụ Đạo</option><option value="117" selected>Endgame</option></select></label><label><span class="small">Stat build</span><select name="devStatPreset"><option value="balanced">Cân bằng</option><option value="power">Công Lực</option><option value="body">Thể Phách</option><option value="defense">Phòng Ngự</option></select></label><label class="v12317-check"><input type="checkbox" name="devMaxProgress" checked> MAX Bậc/Cấp/TL</label><label class="v12317-check"><input type="checkbox" name="devForceBoss" checked> Ép Boss test</label></div><button class="button gold v1086-full-btn" data-dev-lab-preset="${esc(sp.mainDaoId||'sword')}">Nạp Skill Lab</button><div class="v12317-dev-quick">${quick}</div></section><section class="card"><h2>Trạng thái hiện tại</h2><div class="v1086-status-grid">${metric('Chủ Đạo',sp.mainDaoName||sp.mainDaoId||'—')}${metric('Phụ Đạo',sp.secondaryDaoName||sp.secondaryDaoId||'—')}${metric('Mảnh Skill',num(sp.skillSystemV12317?.skillGenericFragments||0))}${metric('Skill Lab',`${skills.length} skill`)}${metric('Tâm Pháp',`${hearts.length}`)}</div></section><section class="card"><h2>Skill · chỉnh từng chiêu</h2><div class="v12317-dev-list">${skillRows||'<div class="empty">Nạp preset Skill Lab trước.</div>'}</div></section><section class="card"><h2>Tâm Pháp đang hoạt động</h2><div class="v12317-dev-hearts">${heartRows||'<div class="empty">Chưa có Tâm Pháp.</div>'}</div></section><div class="v106-action-grid"><button class="button gold" data-tab-jump="skills">Xem màn Kỹ Năng</button><button class="button" data-tab-jump="hunt">Vào Săn Yêu test</button><button class="button" data-tab-jump="combat">Boss/Thủ Lĩnh</button></div>`;
  return page('DEV Skill Lab','Mở khóa nhanh · chỉnh stat · so Bậc/Cấp/Thục Luyện',body);
}

renderSkills=function(){
  const c=model.character,o=model.overview,sp=model.specialization||{},preview=model.specializationPreview||{daos:[]},realmOrder=Number(o.life?.realmOrder||0),all=c.knownSkills||[],knownMap=new Map(all.map(x=>[x.id,x])),practiceMap=new Map((sp.skills||[]).map(x=>[x.id,x])),committed=Boolean(sp.daoNatureId&&sp.mainDaoId),state=v138SkillLoadoutState(c,sp),skin=v1074SelectedVisual('skin'),bg=v1074SelectedVisual('background'),bodyArt=v138232CharacterBodyArt(skin),bgArt=visualVariantAsset(bg,'background',bg.asset||'/assets/v1074/bg-ink-mountain.webp');
  const mainGroup=(preview.daos||[]).find(x=>x.dao===sp.mainDaoId),secondaryGroup=(preview.daos||[]).find(x=>x.dao===sp.secondaryDaoId),guide=sp.gameplayGuide||mainGroup?.guide||{},sectManual=sp.sectManual?.active?sp.sectManual.manual:null;
  const unlockedActiveSlots=committed?Math.max(1,Math.min(5,Number(state.activeCapacity||1))):6;
  const slots=committed?[state.basic,...state.actives,...Array(Math.max(0,unlockedActiveSlots-state.actives.length)).fill(null),state.ultimate]:[...state.actives,...Array(Math.max(0,6-state.actives.length)).fill(null),null];
  const slotLabels=committed?['B',...Array.from({length:unlockedActiveSlots},(_,i)=>String(i+1)),'U']:['1','2','3','4','5','6','U'];
  const loadout=`<section class="v12311-loadout"><div class="v12311-section-title"><div><span>ĐANG MANG VÀO TRẬN</span><strong>Bộ Thần Thông</strong></div><small>${committed?`${state.actives.length}/${unlockedActiveSlots} Chủ Động đã mở`:`${state.active.length}/6 kỹ năng`}</small></div><div class="v12311-loadout-row">${slots.map((x,i)=>{const sk=x?(mainGroup?.skills||secondaryGroup?.skills||[]).find(y=>y.id===x.id):null;const idx=sk?(mainGroup?.skills||[]).findIndex(y=>y.id===sk.id):-1;return `<button class="${x?'filled':'empty'} ${i===slots.length-1?'ultimate':''}" ${x?`data-sheet-open="skill-live-${esc(x.id)}"`:''}><span>${x?`<img src="${v107SkillArt(x,Math.max(0,idx))}" alt="">`:'<i>＋</i>'}</span><b>${slotLabels[i]}</b><small>${x?esc(x.name):i===slots.length-1?'Tuyệt Kỹ':'Ô đã mở'}</small></button>`;}).join('')}</div><p>Loadout hiện tại: <b>1 Đánh Thường + ${unlockedActiveSlots} ô Chủ Động đã mở + 1 Tuyệt Kỹ</b>. Cảnh giới cao hơn mới mở thêm ô Chủ Động. Tuyệt Kỹ chỉ dùng khi Thanh Tuyệt Kỹ đạt 100.</p></section>`;
  const resources=(guide.resources||[]).map(r=>`<div><span>${esc(r.name)}</span><b>${esc(r.range)}</b><small>${esc(r.detail)}</small></div>`).join('');
  const hero=committed?`<section class="v12311-hero" style="--v12311-bg:url('${esc(bgArt)}')"><img class="v12311-hero-character" src="${esc(bodyArt)}" alt=""><div class="v12311-hero-copy"><span>${esc(sp.daoNatureName||'')} · ${esc(sp.mainDaoName||'')} CHỦ</span><strong>${esc(guide.loopCode||sp.mainDaoName||'Bản Đạo')}</strong><p>${esc(guide.headline||guide.summary||'')}</p><div class="v12311-hero-actions"><button data-sheet-open="combat-loop">Cách đánh <b>?</b></button><button data-tab-jump="path">Định Đạo</button></div></div></section>`:`<section class="v12311-uncommitted"><span>CHƯA ĐỊNH ĐẠO</span><strong>Chọn cách đánh ở Trúc Cơ</strong><p>8 Bản Đạo có resource và vòng đánh khác nhau. Chạm từng Đạo để xem trước 10 chiêu; không cần thử chiêu để chọn.</p><button class="button gold" data-tab-jump="path" ${realmOrder<10?'disabled':''}>${realmOrder<10?'Cần đạt Trúc Cơ':'Mở Định Đạo'}</button></section>`;
  const loop=committed?`<section class="v12311-loop"><div class="v12311-section-title"><div><span>GAMEPLAY CỐT LÕI</span><strong>${esc(guide.headline||'Vòng đánh')}</strong></div><button data-sheet-open="combat-loop">Giải thích</button></div><div class="v12311-loop-row">${(guide.steps||[]).map((st,i)=>`<article><i>${i+1}</i><strong>${esc(st.label)}</strong><span>${esc(st.detail)}</span></article>`).join('')}</div><div class="v12311-resources">${resources}</div></section>`:`<section class="v12311-dao-grid">${(preview.daos||[]).map(g=>`<button data-sheet-open="dao-guide-${esc(g.dao)}"><span>${esc(g.guide?.loopCode||'BẢN ĐẠO')}</span><strong>${esc(g.guide?.daoName||V125_DAO_LABEL[g.dao]||g.dao)}</strong><small>${esc(g.guide?.resources?.map(r=>r.name).join(' + ')||'')}</small></button>`).join('')}</section>`;
  const manualCard=sectManual?`<section class="v12311-manual-card"><div class="v12311-manual-top"><div><span>BÍ TỊCH TRẤN PHÁI</span><strong>${esc(sectManual.shortName||sectManual.name)}</strong><small>${esc(sectManual.daoName||sp.mainDaoName||'')} Chủ · Chương ${num(sectManual.activeChapter||0)}/3</small></div><button data-sheet-open="sect-manual-v2311">Chi tiết</button></div><p>${esc(sectManual.description||'')}</p><div class="v12311-manual-progress"><i><em style="width:${Math.max(0,Math.min(100,Number(sectManual.daoHanh||0)))}%"></em></i><b>${num(sectManual.daoHanh||0,1)} Đạo Hạnh</b><span>${sectManual.nextChapterDaoHanh!=null?`Mốc kế ${num(sectManual.nextChapterDaoHanh)}`:'Đã mở đủ 3 Chương'}</span></div><div class="v12311-chapter-pills">${(sectManual.chapters||[]).map(ch=>`<span class="${ch.unlocked?'active':''}"><b>Ch.${num(ch.chapter)}</b><small>${ch.unlocked?'Đang có':num(ch.unlockDaoHanh)}</small></span>`).join('')}</div></section>`:'';
  const heartMethods=committed?v12317HeartMethodSection(sp):'';
  const groups=[mainGroup,secondaryGroup].filter(Boolean),library=committed?groups.map((group,gidx)=>`<section class="v12311-library"><div class="v12311-section-title"><div><span>${gidx===0?'CHỦ ĐẠO':'PHỤ ĐẠO'}</span><strong>${esc(group.guide?.daoName||V125_DAO_LABEL[group.dao]||group.dao)} · 10 kỹ năng canonical</strong></div><small>${(group.skills||[]).filter(sk=>knownMap.has(sk.id)).length}/10 đã lĩnh ngộ</small></div><div class="v12311-skill-list">${(group.skills||[]).map((sk,i)=>{const known=knownMap.get(sk.id),role=v12311RoleMeta(sk),practice=practiceMap.get(sk.id),realmOk=realmOrder>=Number(sk.realmGate||0),isMain=group.dao===sp.mainDaoId;return `<button class="v12311-skill-row ${known?'known':'locked'} ${known?.active?'active':''}" data-sheet-open="skill-${esc(group.dao)}-${i}"><div class="v12311-skill-art"><img src="${v107SkillArt(sk,i)}" alt="" loading="lazy" decoding="async"><i>${esc(v12311SkillType(sk)==='Tuyệt Kỹ'?'U':v12311SkillType(sk)==='Đánh Thường'?'B':String(i))}</i></div><div class="v12311-skill-copy"><div><strong>${esc(sk.name)}</strong><span class="${role.tone}">${esc(role.label)}</span></div><p>${esc(sk.description||'')}</p><small>${sk.damageCoefficientPct?`${num(sk.damageCoefficientPct,0)}% Công Lực${String(sk.form)==='channel'?' nếu hoàn tất':''}`:'Utility'}${sk.breakDamagePct?` · Phá ${num(sk.breakDamagePct,0)}%`:''} · CN ${num(sk.spiritCostStandardPct||0)}% · CD ${num(sk.cooldown||0,1)}s</small>${practice?`<em>${esc(practice.gradeLabelV12317||'Phàm')} Lv${num(practice.levelV12317||1)} · Thục Luyện ${num(practice.tier||0)}/1000 · +${num(practice.effectBonusPct||0)}%</em>`:''}</div><b>${known?(known.active?'Đang dùng':'Đã học'):!realmOk?'Khóa cảnh':isMain||group.dao===sp.secondaryDaoId?'Chưa học':'Khóa'}</b></button>`;}).join('')}</div></section>`).join(''):`<section class="v12311-discovery-note"><b>Đọc trước rồi mới chọn</b><span>Ở màn Kỹ Năng, bạn chỉ cần hiểu resource + vòng đánh. Cây Đạo Tính và xác nhận Chủ Đạo nằm ở Định Đạo.</span></section>`;
  const shortcuts=`<section class="v12311-shortcuts"><button data-sheet-open="manual"><i>📜</i><span><small>Công Pháp</small><b>Modifier & nguồn mở skill</b></span></button><button data-tab-jump="path"><i>☯</i><span><small>Định Đạo</small><b>Đạo Tính · Chủ/Phụ Đạo</b></span></button>${sectManual?`<button data-sheet-open="sect-manual-v2311"><i>📖</i><span><small>Bí Tịch</small><b>${esc(sectManual.shortName||sectManual.name)}</b></span></button>`:''}</section>`;
  const allCatalog=(preview.daos||[]).flatMap(g=>(g.skills||[]).map((sk,i)=>({group:g,sk,i})));
  const liveSheets=allCatalog.filter(x=>knownMap.has(x.sk.id)).map(({group,sk,i})=>v106Sheet(`skill-live-${sk.id}`,sk.name,v12311SkillSheet(sk,knownMap.get(sk.id),practiceMap.get(sk.id),group.guide||guide,realmOrder,true,committed,state,i))).join('');
  const catalogSheets=groups.flatMap(group=>(group.skills||[]).map((sk,i)=>v106Sheet(`skill-${group.dao}-${i}`,sk.name,v12311SkillSheet(sk,knownMap.get(sk.id),practiceMap.get(sk.id),group.guide||guide,realmOrder,group.dao===sp.mainDaoId||group.dao===sp.secondaryDaoId,committed,state,i)))).join('');
  const previewDaoSheets=!committed?(preview.daos||[]).map(group=>v106Sheet(`dao-guide-${group.dao}`,`${group.guide?.daoName||V125_DAO_LABEL[group.dao]||group.dao} · ${group.guide?.loopCode||''}`,v12311DaoPreviewSheet(group))).join(''):'';
  const previewSkillSheets=''; // V129 PERF: Đạo preview already contains compact 10-skill summaries; avoid 80 hidden sheets.
  const loopSheet=committed?v106Sheet('combat-loop',`${guide.daoName||sp.mainDaoName||'Bản Đạo'} · Cách đánh`,`<div class="v12311-loop-sheet"><header><span>${esc(guide.loopCode||'VÒNG ĐÁNH')}</span><strong>${esc(guide.headline||'')}</strong><p>${esc(guide.summary||'')}</p></header><div class="v12311-loop-steps">${(guide.steps||[]).map((st,i)=>`<article><i>${i+1}</i><div><b>${esc(st.label)}</b><span>${esc(st.detail)}</span></div></article>`).join('')}</div><div class="v12311-resource-list">${(guide.resources||[]).map(r=>`<div><span>${esc(r.name)}</span><b>${esc(r.range)}</b><small>${esc(r.detail)}</small></div>`).join('')}</div><div class="v12311-manual-rule"><b>Mẹo nhập môn</b><span>${esc(guide.beginnerTip||'')}</span></div><div class="v12311-manual-rule"><b>Luật Tuyệt Kỹ</b><span>${esc(guide.ultimateRule||'')}</span></div><div class="v12311-manual-rule"><b>Phá Thế là gì?</b><span>Phá Thế bào thanh Thế riêng của mục tiêu, không trừ HP trực tiếp. Khi Thế về 0, mục tiêu vào Thất Thế và trở thành cửa sổ burst.</span></div></div>`):'';
  const techniqueManual=v1084ManualSheet?v1084ManualSheet(c,o):renderTechniqueManualPanel(c,o);
  return `<section class="v107-screen v12311-skills-production"><div class="v12311-scroll" data-scroll-key="skills-main">${hero}${loop}${loadout}${manualCard}${heartMethods}${library}${shortcuts}</div>${loopSheet}${sectManual ? v106Sheet('sect-manual-v2311',sectManual.shortName||sectManual.name,v12311ManualSheet(sectManual,sp)) : ''}${catalogSheets}${liveSheets}${previewDaoSheets}${previewSkillSheets}${v106Sheet('manual','Bí Thuật & Võ Học',techniqueManual)}${v106MoreSheet()}</section>`;
};


/* P1 Skills Visual-First — compact loadout + icon library. Long prose lives in sheets. */
const renderSkillsLegacyP0=renderSkills;
function vP1SkillGradeClass(practice={}){
  const raw=String(practice.gradeV12317||practice.grade||'mundane').toLowerCase();
  return ['mundane','spirit','mystic','earth','heaven','immortal','extreme','breaker'].includes(raw)?raw:'mundane';
}
function vP1SkillGradeLabel(practice={}){
  return practice.gradeLabelV12317||({mundane:'Phàm',spirit:'Linh',mystic:'Huyền',earth:'Địa',heaven:'Thiên',immortal:'Tiên',extreme:'Cực',breaker:'Phá'}[vP1SkillGradeClass(practice)]||'Phàm');
}
function vP1SkillTile(group,sk,i,knownMap,practiceMap,realmOrder,isMain=true){
  const rawKnown=knownMap.get(sk.id),known=isMain?rawKnown:null,practice=practiceMap.get(sk.id)||{},role=v12311RoleMeta(sk),realmOk=realmOrder>=Number(sk.realmGate||0),grade=vP1SkillGradeClass(practice),lv=Number(practice.levelV12317||known?.levelV12317||1),type=v12311SkillType(sk),active=Boolean(known?.active);
  const badge=type==='Tuyệt Kỹ'?'U':type==='Đánh Thường'?'B':String(i+1);
  const power=sk.damageCoefficientPct?`${num(sk.damageCoefficientPct,0)}%`:(sk.breakDamagePct?`P${num(sk.breakDamagePct,0)}`:'FX');
  const cost=Number(sk.spiritCostStandardPct||0)>0?`${num(sk.spiritCostStandardPct||0)}% CN`:'0 CN';
  const lockText=!isMain?'Chỉ Chủ Đạo':!known?(realmOk?'Chưa học':'Khóa cảnh'):'';
  return `<button class="p1-skill-tile grade-${grade} ${known?'known':'locked'} ${active?'active':''} ${!isMain?'main-only-locked':''}" data-sheet-open="skill-${esc(group.dao)}-${i}">
    <div class="p1-skill-art"><img src="${v107SkillArt(sk,i)}" alt="" loading="lazy" decoding="async"><i>${esc(badge)}</i>${active?'<em>✓</em>':''}</div>
    <strong>${esc(sk.name)}</strong>
    <div class="p1-skill-meta"><span class="${role.tone}">${esc(role.label)}</span><b>${esc(vP1SkillGradeLabel(practice))} Lv${num(lv)}</b></div>
    <div class="p1-skill-kpis"><span>${esc(power)}</span><span>${esc(cost)}</span><span>${num(sk.cooldown||0,1)}s</span></div>
    ${lockText?`<div class="p1-skill-lock">${esc(lockText)}</div>`:''}
  </button>`;
}
function renderSkillsP1(){
  const c=model.character,o=model.overview,sp=model.specialization||{},preview=model.specializationPreview||{daos:[]},realmOrder=Number(o.life?.realmOrder||0),all=c.knownSkills||[],knownMap=new Map(all.map(x=>[x.id,x])),practiceMap=new Map((sp.skills||[]).map(x=>[x.id,x])),committed=Boolean(sp.daoNatureId&&sp.mainDaoId),state=v138SkillLoadoutState(c,sp);
  if(!committed)return renderSkillsLegacyP0();
  const skin=v1074SelectedVisual('skin'),bg=v1074SelectedVisual('background'),bodyArt=v138232CharacterBodyArt(skin),bgArt=visualVariantAsset(bg,'background',bg.asset||'/assets/v1074/bg-ink-mountain.webp');
  const mainGroup=(preview.daos||[]).find(x=>x.dao===sp.mainDaoId),secondaryGroup=(preview.daos||[]).find(x=>x.dao===sp.secondaryDaoId),guide=sp.gameplayGuide||mainGroup?.guide||{},sectManual=sp.sectManual?.active?sp.sectManual.manual:null;
  const cap=state.activeCapacity,slots=[state.basic,...state.actives.slice(0,cap),...Array(Math.max(0,cap-state.actives.length)).fill(null),state.ultimate],slotLabels=['B',...Array.from({length:cap},(_,i)=>String(i+1)),'U'];
  const allCatalog=(preview.daos||[]).flatMap(g=>(g.skills||[]).map((sk,i)=>({group:g,sk,i})));
  const loadout=`<section class="p1-skill-loadout"><header><div><span>ĐANG MANG VÀO TRẬN</span><strong>Bộ Thần Thông</strong></div><small>${state.actives.length}/${cap} Chủ Động · ${cap===1?'Trúc Cơ':`đã mở ${cap} ô`}</small></header><div class="p1-skill-loadout-row" style="grid-template-columns:repeat(${slots.length},minmax(0,1fr))">${slots.map((x,i)=>{const cat=allCatalog.find(y=>y.sk.id===x?.id),ultimateSlot=i===slots.length-1;return `<button class="${x?'filled':'empty'} ${ultimateSlot?'ultimate':''}" ${x&&cat?`data-sheet-open="skill-${esc(cat.group.dao)}-${cat.i}"`:''}><span>${x?`<img src="${v107SkillArt(x,cat?.i||0)}" alt="">`:'<i>＋</i>'}</span><b>${slotLabels[i]}</b></button>`;}).join('')}</div></section>`;
  const core=sp.core||mainGroup?.core||null;
  const daoHead=`<section class="p1-skill-identity" style="--p1-bg:url('${esc(bgArt)}');--p1-char:url('${esc(bodyArt)}')"><div><span>${esc(sp.daoNatureName||'Bản Đạo')} · CHỦ ĐẠO</span><strong>${esc(sp.mainDaoName||guide.daoName||'Bản Đạo')}</strong><small>${core?.name?`Core · ${esc(core.name)}`:esc((guide.resources||[]).map(r=>r.name).slice(0,2).join(' · ')||guide.loopCode||'')}</small></div><div class="p1-skill-identity-actions">${core?.name?'<button data-sheet-open="dao-core-v78">Core</button>':''}<button data-sheet-open="combat-loop">Vòng đánh</button><button data-sheet-open="heart-methods">Tâm Pháp</button><button data-sheet-open="manual">Công Pháp</button>${sectManual?'<button data-sheet-open="sect-manual-v2311">Bí Tịch</button>':''}</div></section>`;
  const groups=[mainGroup,secondaryGroup].filter(Boolean);
  const grids=groups.map((group,gidx)=>{const isMain=group.dao===sp.mainDaoId;return `<section class="p1-skill-library ${isMain?'main-dao':'secondary-dao'}"><header><div><span>${isMain?'CHỦ ĐẠO':'PHỤ ĐẠO · CHỈ TÂM PHÁP'}</span><strong>${esc(group.guide?.daoName||V125_DAO_LABEL[group.dao]||group.dao)}</strong></div><small>${isMain?`${(group.skills||[]).filter(sk=>knownMap.has(sk.id)).length}/10`:'Kỹ năng chiến đấu khóa'}</small></header>${!isMain?'<p class="p1-secondary-rule">Phụ Đạo hưởng 100% Tâm Pháp đã mở; không nhận Core, Đánh Thường, Chủ Động hay Tuyệt Kỹ.</p>':''}<div class="p1-skill-grid">${(group.skills||[]).map((sk,i)=>vP1SkillTile(group,sk,i,knownMap,practiceMap,realmOrder,isMain)).join('')}</div></section>`;}).join('');
  const coreSheet=core?.name?v106Sheet('dao-core-v78',`${core.name} · Core Chủ Đạo`,`<div class="v12311-loop-sheet"><header><span>CORE · CHỈ CHỦ ĐẠO</span><strong>${esc(core.name)}</strong><p>${esc(core.summary||'Nội tại cốt lõi của Chủ Đạo.')}</p></header><div class="v12311-manual-rule"><b>Quy tắc V2</b><span>Core chỉ thuộc Chủ Đạo. Phụ Đạo không nhận Core, Đánh Thường, Chủ Động hay Tuyệt Kỹ.</span></div></div>`):'';
  const loopSheet=v106Sheet('combat-loop',`${guide.daoName||sp.mainDaoName||'Bản Đạo'} · Vòng đánh`,`<div class="v12311-loop-sheet"><header><span>${esc(guide.loopCode||'VÒNG ĐÁNH')}</span><strong>${esc(guide.headline||'')}</strong><p>${esc(guide.summary||'')}</p></header><div class="v12311-loop-steps">${(guide.steps||[]).map((st,i)=>`<article><i>${i+1}</i><div><b>${esc(st.label)}</b><span>${esc(st.detail)}</span></div></article>`).join('')}</div><div class="v12311-resource-list">${(guide.resources||[]).map(r=>`<div><span>${esc(r.name)}</span><b>${esc(r.range)}</b><small>${esc(r.detail)}</small></div>`).join('')}</div><div class="v12311-manual-rule"><b>Mẹo nhập môn</b><span>${esc(guide.beginnerTip||'')}</span></div></div>`);
  const techniqueManual=v1084ManualSheet?v1084ManualSheet(c,o):renderTechniqueManualPanel(c,o);
  const heartSheet=v106Sheet('heart-methods','Tâm Pháp · Nội Tu',v12317HeartMethodSection(sp)||'<div class="v12311-empty"><b>Chưa lĩnh ngộ Tâm Pháp</b></div>');
  const liveSheets=''; // V129 PERF: loadout reuses catalog sheet; do not duplicate up to 10 full skill sheets.
  const catalogSheets=groups.flatMap(group=>(group.skills||[]).map((sk,i)=>v106Sheet(`skill-${group.dao}-${i}`,sk.name,v12311SkillSheet(sk,group.dao===sp.mainDaoId?knownMap.get(sk.id):null,practiceMap.get(sk.id),group.guide||guide,realmOrder,group.dao===sp.mainDaoId,true,state,i)))).join('');
  return `<section class="v107-screen v12311-skills-production p1-skills"><div class="p1-skills-scroll" data-scroll-key="skills-main">${daoHead}${loadout}${grids}</div>${coreSheet}${loopSheet}${heartSheet}${sectManual?v106Sheet('sect-manual-v2311',sectManual.shortName||sectManual.name,v12311ManualSheet(sectManual,sp)):''}${catalogSheets}${liveSheets}${v106Sheet('manual','Bí Thuật & Võ Học',techniqueManual)}${v106MoreSheet()}</section>`;
}
renderSkills=renderSkillsP1;


function v13820StatDelta(selected,equipped){
  const a=selected?.effectiveStats||selected?.stats||{},b=equipped?.effectiveStats||equipped?.stats||{};
  const keys=[...new Set([...Object.keys(a),...Object.keys(b)])];
  return keys.map(key=>({key,value:Number(a[key]||0)-Number(b[key]||0)})).filter(x=>Math.abs(x.value)>1e-9);
}
function v13820DeltaText(value,key=''){
  const pct=/(Pct|Chance|Reduction|Efficiency)/i.test(key), speed=key==='actionSpeed';
  const digits=speed?3:pct?1:2; return `${value>0?'+':''}${num(value,digits)}${pct?'%':''}`;
}

function v13820AffixHtml(x){
  const lines=x?.affixes||[];
  return `<div class="v13820-affixes"><div class="v13820-section-title"><span>Thuộc tính phụ</span><b>${lines.length}</b></div>${lines.map((line,i)=>`<div class="v13820-affix"><i>${i+1}</i><span>${esc(line)}</span></div>`).join('')||'<div class="v13820-empty-line">Món này không có thuộc tính phụ.</div>'}${x?.daoInscription?`<div class="v13820-inscription"><i>◆</i><span><small>Đạo Văn</small><b>${esc(x.daoInscription)}</b></span></div>`:''}</div>`;
}
function v13820ItemSummary(x){
  if(!x)return '<div class="v13820-empty-compare">Chọn một trang bị để xem so sánh.</div>';
  const stats=Object.entries(x.effectiveStats||x.stats||{}).slice(0,6).map(([k,v])=>`<div><span>${esc(statName(k))}</span><b>${Number(v)>=0?'+':''}${num(v,2)}</b></div>`).join('');
  return `<div class="v13820-compare-item v13823-rarity-card ${v107TierClass(x)} ${x.locked?'locked':''}"><div class="v13820-compare-art">${v13823LazyImg(v1077EquipArt(x.slot,x),x.name)}<b>+${num(x.enhancementLevel||0)}</b>${x.locked?'<i class="v13823-lock-badge">KHÓA</i>':''}</div><div class="v13820-compare-meta"><small>${esc(x.slotLabel||v107SlotLabel(x.slot))}</small><strong>${esc(x.name)}</strong><span>Lv.${num(x.itemLevel||0)} · ${esc(x.setName||x.role||'Trang bị')}</span><em class="v13823-rarity-label">${esc(v13823RarityLabel(x))}</em></div></div><div class="v13820-mini-stats">${stats||'<div><span>Chỉ số</span><b>—</b></div>'}</div>`;
}

function v138239StatValue(item,key){
  const value=Number((item?.effectiveStats||item?.stats||{})[key]||0);
  const pct=/(Pct|Chance|Reduction|Efficiency)/i.test(key),speed=key==='actionSpeed';
  return `${value>=0?'+':''}${num(value,speed?3:pct?1:2)}${pct?'%':''}`;
}
function v138239ItemCompare(selected,equipped){
  if(!selected)return '';
  const a=selected?.effectiveStats||selected?.stats||{},b=equipped?.effectiveStats||equipped?.stats||{};
  const priority=['attack','maxHp','defense','critChancePct','heartChancePct','armorPenPct','damageReductionPct','controlDurationReductionPct','maxSpirit','actionSpeed','dodgeChancePct','accuracy'];
  const keys=[...new Set([...priority.filter(k=>k in a||k in b),...Object.keys(a),...Object.keys(b)])].slice(0,8);
  const selectedHead=`<div class="v138239-compare-head candidate ${v107TierClass(selected)}"><span>${v13823LazyImg(v1077EquipArt(selected.slot,selected),selected.name)}<b>+${num(selected.enhancementLevel||0)}</b></span><div><small>MÓN ĐANG XEM</small><strong>${esc(v138234ItemDisplayName(selected))}</strong><em>${esc(v13823RarityLabel(selected))}</em></div></div>`;
  const equippedHead=equipped?`<div class="v138239-compare-head equipped ${v107TierClass(equipped)}"><span>${v13823LazyImg(v1077EquipArt(equipped.slot,equipped),equipped.name)}<b>+${num(equipped.enhancementLevel||0)}</b></span><div><small>ĐANG MẶC</small><strong>${esc(v138234ItemDisplayName(equipped))}</strong><em>${esc(v13823RarityLabel(equipped))}</em></div></div>`:`<div class="v138239-compare-head equipped empty"><span><i>${v1077SlotIcon(selected.slot)}</i></span><div><small>ĐANG MẶC</small><strong>Chưa trang bị</strong><em>${esc(selected.slotLabel||v107SlotLabel(selected.slot))}</em></div></div>`;
  const rows=keys.map(key=>{
    const av=Number(a[key]||0),bv=Number(b[key]||0),d=av-bv,tone=d>1e-9?'pos':d<-1e-9?'neg':'same';
    return `<div class="v138239-compare-row"><span>${esc(statName(key))}</span><b class="${tone}">${v138239StatValue(selected,key)}${Math.abs(d)>1e-9?`<i>${v13820DeltaText(d,key)}</i>`:''}</b><b>${equipped?v138239StatValue(equipped,key):'—'}</b></div>`;
  }).join('');
  return `<section class="v138239-compare"><div class="v138239-compare-label"><strong>So sánh trực tiếp</strong><span>Giá trị cùng hàng để không phải tự nhớ số</span></div><div class="v138239-compare-heads">${selectedHead}${equippedHead}</div><div class="v138239-compare-table"><div class="v138239-compare-columns"><span>Chỉ số</span><b>Đang xem</b><b>Đang mặc</b></div>${rows||'<div class="v13820-empty-line">Không có chỉ số trực tiếp để so sánh.</div>'}</div></section>`;
}
function v138239SetFarmTarget(setEntry,sys){
  if(!setEntry||setEntry.identity!=='element'||setEntry.category!=='attire')return null;
  const a=setEntry.acquisition;
  if(a?.targetDungeonName&&Number(a.targetFloor)>0)return {location:a.targetDungeonName,floor:Number(a.targetFloor),dungeonId:a.targetDungeonId||'',firstClearUnlocksCraft:Boolean(a.firstClearUnlocksCraft),repeatTargetDrops:Boolean(a.repeatTargetDrops)};
  // Compatibility fallback for snapshots older than Alpha.23.10. Only Ngũ Hành remains a live equipment Set.
  const pool=(sys?.setCatalog||[]).filter(s=>s.category==='attire'&&s.identity==='element');
  const floor=pool.findIndex(s=>s.setId===setEntry.setId)+1;
  return floor>0?{location:'Ngũ Hành Đạo Khố',floor,firstClearUnlocksCraft:true,repeatTargetDrops:true}:null;
}
function v138239AcquisitionPanel(x,setEntry,sys){
  const target=v138239SetFarmTarget(setEntry,sys);
  const actual=String(x?.source||'Nguồn chưa ghi nhận');
  const accessory=x?.slotGroup==='jewelry'?(sys?.sourceGuide?.accessoryDungeon||{name:'Linh Bội Bảo Khố',description:'Nguồn nhắm đích cho 4 ô phụ kiện thường; phụ kiện không có Set riêng.'}):null;
  const targetHtml=target?`<div class="v138239-source-row target"><span>Farm đúng Set Ngũ Hành</span><b>${esc(target.location)} · Tầng ${num(target.floor)}</b><small>First-clear mở đường Luyện Khí đúng Set; tái chiến tiếp tục có thể rơi mảnh đúng bộ của tầng.</small></div>`:accessory?`<div class="v138239-source-row target"><span>Farm phụ kiện</span><b>${esc(accessory.name)}</b><small>${esc(accessory.description||'Phụ kiện không có Set riêng; so phẩm, affix và Cường Hóa để chọn món.')}</small></div>`:`<div class="v138239-source-row"><span>Nguồn rộng</span><b>Săn Yêu / phó bản theo loot table</b><small>Săn Yêu là nguồn loot rộng cho nâng cấp chung. Chỉ Trang Phục Ngũ Hành có dungeon Set nhắm đích.</small></div>`;
  return `<section class="v138239-source"><div class="v138239-source-title"><span>⌖</span><div><small>NGUỒN TRANG BỊ</small><strong>Kiếm món này ở đâu?</strong></div></div><div class="v138239-source-row"><span>Nguồn món hiện tại</span><b>${esc(actual)}</b></div>${targetHtml}</section>`;
}
function v138244DetailStatCards(x){
  const stats=x?.effectiveStats||x?.stats||{};
  const priority=['attack','maxHp','defense','critChancePct','armorPenPct','damageReductionPct','maxSpirit','actionSpeed','dodgeChancePct','accuracy'];
  const keys=[...priority.filter(k=>k in stats),...Object.keys(stats).filter(k=>!priority.includes(k))].slice(0,4);
  return `<section class="v138244-stat-card"><header><span>THUỘC TÍNH CHÍNH</span><small>${keys.length} dòng nổi bật</small></header><div>${keys.map(k=>`<article><span>${esc(statName(k))}</span><b>${v138239StatValue(x,k)}</b></article>`).join('')||'<article><span>Chỉ số</span><b>—</b></article>'}</div></section>`;
}
function v138246SetShift(x,equipped,sys={}){
  if(!x||x.equipped)return '';
  const catalog=sys?.setCatalog||[],oldId=equipped?.setId||'',newId=x.setId||'';
  if(oldId===newId)return newId?`<span class="set-stable">◆ Giữ ${esc(x.setName||'Set hiện tại')}</span>`:'';
  const oldSet=oldId?catalog.find(s=>s.setId===oldId):null,newSet=newId?catalog.find(s=>s.setId===newId):null;
  const parts=[];
  if(oldSet){const before=Number(oldSet.equippedPieces||0),after=Math.max(0,before-1);parts.push(`<span class="set-down">− ${esc(oldSet.setName)} ${num(before)}→${num(after)}</span>`);}
  if(newSet){const before=Number(newSet.equippedPieces||0),after=before+1;parts.push(`<span class="set-up">+ ${esc(newSet.setName)} ${num(before)}→${num(after)}</span>`);}
  return parts.length?`<div class="v138246-set-shift">${parts.join('')}</div>`:'';
}
function v138244CompareSummary(x,equipped,sys={}){
  if(!x)return '';
  if(x.equipped)return `<section class="v138246-decision current"><div class="v138246-decision-mark">✓</div><div><small>TRẠNG THÁI</small><strong>Đang trang bị</strong><span>Đây là món hiện dùng ở ô ${esc(x.slotLabel||v107SlotLabel(x.slot))}.</span></div><b>+${num(x.enhancementLevel||0)}</b></section>`;
  const hasPower=Number.isFinite(Number(x.powerDeltaPct)),power=hasPower?Number(x.powerDeltaPct):0,tone=hasPower?(power>.05?'up':power<-.05?'down':'neutral'):'neutral';
  if(!equipped)return `<section class="v138246-decision up"><div class="v138246-decision-mark">↑</div><div><small>QUYẾT ĐỊNH NHANH</small><strong>Lấp ô đang trống</strong><span>Trang bị mới sẽ thêm toàn bộ chỉ số của món này.</span></div><b>TRANG BỊ</b>${v138246SetShift(x,equipped,sys)}</section>`;
  const priority=['attack','maxHp','defense','critChancePct','armorPenPct','damageReductionPct','maxSpirit','actionSpeed','dodgeChancePct','accuracy'];
  const all=v13820StatDelta(x,equipped),rank=k=>{const i=priority.indexOf(k);return i<0?999:i;};
  const deltas=all.filter(d=>Math.abs(Number(d.value||0))>1e-9).sort((a,b)=>rank(a.key)-rank(b.key)||Math.abs(Number(b.value||0))-Math.abs(Number(a.value||0))).slice(0,4);
  const headline=!hasPower?'So sánh chỉ số trực tiếp':power>.05?`+${num(power,1)}% sức mạnh`:power<-.05?`${num(power,1)}% sức mạnh`:'Sức mạnh gần tương đương';
  const mark=!hasPower?'·':power>.05?'↑':power<-.05?'↓':'≈';
  const verdict=!hasPower?'CHƯA MÔ PHỎNG':power>.05?'NÂNG CẤP':power<-.05?'ĐÁNH ĐỔI':'CÂN BẰNG';
  return `<section class="v138246-decision ${tone}"><div class="v138246-decision-top"><div class="v138246-decision-mark">${mark}</div><div><small>SO VỚI ĐANG MẶC</small><strong>${headline}</strong><span>thay ${esc(equipped.name||'món hiện tại')}</span></div><b>${verdict}</b></div><div class="v138246-decision-deltas">${deltas.map(d=>`<span class="${d.value>0?'pos':d.value<0?'neg':'same'}"><b>${esc(statName(d.key))}</b><em>${v13820DeltaText(d.value,d.key)}</em></span>`).join('')||'<span class="same"><b>Chỉ số trực tiếp</b><em>≈</em></span>'}</div>${v138246SetShift(x,equipped,sys)}</section>`;
}
function v138246EnhanceStatPreview(x){
  const base=x?.stats||{},cur=Number(x?.enhancementBonusPct||0),next=Number(x?.nextEnhanceBonusPct??cur),priority=['attack','maxHp','defense','critChancePct','armorPenPct','damageReductionPct','maxSpirit','actionSpeed','dodgeChancePct','accuracy'];
  const keys=[...priority.filter(k=>k in base),...Object.keys(base).filter(k=>!priority.includes(k))].slice(0,3);
  const fmt=(key,val)=>{const pct=/(Pct|Chance|Reduction|Efficiency)/i.test(key),speed=key==='actionSpeed';return `${val>=0?'+':''}${num(val,speed?3:pct?1:2)}${pct?'%':''}`;};
  return keys.map(key=>{const raw=Number(base[key]||0),a=raw*(1+cur/100),b=raw*(1+next/100),d=b-a;return {key,current:a,next:b,delta:d,currentText:fmt(key,a),nextText:fmt(key,b),deltaText:fmt(key,d)};});
}
function v138246ShowEnhanceFeedback(payload,itemName='Trang bị'){
  const report=payload?.result?.data;if(!report||typeof report.beforeLevel!=='number')return;
  const tone=report.success?'success':report.downgraded?'down':report.protectionUsed?'protected':'fail';
  const title=report.success?'CƯỜNG HÓA THÀNH CÔNG':report.downgraded?'THẤT BẠI · TỤT CẤP':report.protectionUsed?'BÙA ĐÃ BẢO HỘ':'CƯỜNG HÓA THẤT BẠI';
  const node=document.createElement('div');node.className=`v138246-enhance-result ${tone}`;node.innerHTML=`<i>${report.success?'✦':report.downgraded?'↓':report.protectionUsed?'◆':'×'}</i><div><small>${esc(itemName)}</small><strong>${title}</strong><span>+${num(report.beforeLevel)} → +${num(report.afterLevel)} · ${num(report.successChancePct,1)}%</span></div>`;content.appendChild(node);requestAnimationFrame(()=>node.classList.add('show'));setTimeout(()=>node.classList.remove('show'),1800);setTimeout(()=>node.remove(),2200);
}
function v138244SetMini(setEntry,x,setIndex){
  if(!setEntry)return '';
  const pieces=Number(setEntry.equippedPieces||0),max=Number(setEntry.maxPieces||6);
  return `<section class="v138244-set-mini"><i>◆</i><div><small>THUỘC BỘ</small><strong>${esc(setEntry.setName)}</strong><span>${esc(v138233SetIdentity(setEntry))} · đang mặc ${num(pieces)}/${num(max)}</span></div><button data-sheet-open="set-${setIndex}">Xem Bộ ›</button></section>`;
}
function v13820ItemSheet(x,i,equippedSame,sys){
  const setEntry=x?.setId?(sys?.setCatalog||[]).find(s=>s.setId===x.setId):null;
  const setIndex=setEntry?(sys?.setCatalog||[]).indexOf(setEntry):-1;
  const maxed=Number(x.enhancementLevel||0)>=Number(sys?.enhancement?.maxLevel||20);
  const canTransfer=(x.transferEligibleTargetIds||[]).length>0;
  const grade=v138240GradeClass(x),enh=v138240EnhanceClass(x.enhancementLevel),quality=v138240QualityShort(x.quality),qualityClass=v138245QualityClass(x.quality),qualityLabel=quality==='—'?'':quality==='Hoàn Mỹ'?quality:`${quality} Phẩm`;
  const mechanic=v138236MechanicGuide(`${x.setName||''} ${setEntry?.description||''} ${(setEntry?.thresholds||[]).map(t=>`${t.name||''} ${t.description||''} ${t.constraint||''}`).join(' ')}`);
  const primary=x.locked
    ? `<button class="v138244-primary unlock" data-loot-lock="${esc(x.id)}">Mở Khóa Món</button>`
    : !x.equipped
      ? `<button class="v138244-primary equip" data-equip="${esc(x.id)}">${equippedSame?'Thay thế':'Trang bị'}</button>`
      : maxed
        ? `<button class="v138244-primary max" disabled>Cường Hóa MAX</button>`
        : `<button class="v138244-primary enhance" data-open-inventory="forge" data-inventory-item="${esc(x.id)}">Mở Cường Hóa</button>`;
  const secondary=[
    !x.equipped&&!maxed?`<button data-enhance="${esc(x.id)}">Cường Hóa</button>`:'',
    !x.locked?`<button data-loot-lock="${esc(x.id)}">Khóa</button>`:'',
    Number(x.enhancementLevel||0)>0?`<button data-transfer-source="${esc(x.id)}" ${canTransfer?'':'disabled'}>${transferSourceId===x.id?'Đang Chọn Nguồn':'Chuyển +'}</button>`:'',
  ].filter(Boolean).join('');
  const transfer=canTransfer&&transferSourceId===x.id?`<div class="v13820-transfer-targets v138244-transfer-targets"><strong>Chọn món cùng vị trí để nhận +${num(x.enhancementLevel||0)}</strong>${(x.transferEligibleTargetIds||[]).map(id=>{const t=(model.equipment||[]).find(y=>y.id===id);return t?`<button data-transfer-target="${esc(id)}"><img src="${v1077EquipArt(t.slot,t)}" alt=""><span>${esc(v138234ItemDisplayName(t))}<small>+${num(t.enhancementLevel||0)} → +${num(x.enhancementLevel||0)}</small></span></button>`:'';}).join('')}</div>`:'';
  const body=`<div class="v138244-detail ${grade} ${enh}">
    <section class="v138244-hero">
      <div class="v138244-art">${v138245RarityAura()}${v13823LazyImg(v1077EquipArt(x.slot,x),x.name)}<b>+${num(x.enhancementLevel||0)}</b>${x.locked?'<u>KHÓA</u>':''}${v138245SocketOverlay(x,'detail-art')}</div>
      <div class="v138244-copy"><span>${esc(x.slotLabel||v107SlotLabel(x.slot))} · Lv.${num(x.itemLevel||0)}</span><strong>${esc(v138234ItemDisplayName(x))}</strong><small>${esc(x.setName||x.source||'Trang bị')}</small><div><em class="grade-chip">${esc(x.grade||'Phàm')}</em>${qualityLabel?`<em class="quality-chip ${esc(qualityClass)}">${esc(qualityLabel)}</em>`:''}${x.setId?'<em class="set">◆ Set</em>':''}${x.equipped?'<em class="equipped">Đang mặc</em>':''}</div></div>
    </section>
    ${v138244CompareSummary(x,equippedSame,sys)}
    ${v138244DetailStatCards(x)}
    ${v13820AffixHtml(x)}
    ${v138245SocketDetail(x)}
    ${v138244SetMini(setEntry,x,setIndex)}
    ${equippedSame&&!x.equipped?`<details class="v138244-fold"><summary>So sánh chi tiết <b>›</b></summary>${v138239ItemCompare(x,equippedSame)}</details>`:''}
    <details class="v138244-fold"><summary>Nguồn trang bị <b>›</b></summary>${v138239AcquisitionPanel(x,setEntry,sys)}</details>
    ${mechanic?`<details class="v138244-fold"><summary>Giải thích cơ chế <b>›</b></summary>${mechanic}</details>`:''}
    ${transfer}
    <div class="v138244-action-dock"><div class="v138244-secondary-actions">${secondary||'<span></span>'}</div>${primary}</div>
  </div>`;
  return v106Sheet(`item-${i}`,'Chi Tiết Trang Bị',body);
}

function v13821InventoryModeTabs(gearCount=0,sys={}){
  const view=inventoryUi.view||'equipped';
  const tabs=[['equipped','Đang Mặc',`${num(sys.equippedCount||0)}/${num(sys.canonicalSlotCount||10)}`],['gear','Kho',gearCount],['forge','Luyện Đồ',sys?.v142?'+15 V142':'+20'],['sets','Set',`${(sys.setCatalog||[]).length||0}`]];
  return `<div class="v13821-mode-row"><div class="v13821-mode-tabs">${tabs.map(([id,label,badge])=>`<button class="${view===id?'active':''}" data-inventory-view="${id}"><span>${label}</span><b>${badge}</b></button>`).join('')}</div><div class="v13821-utility-tabs"><button data-sheet-open="resources">Vật Phẩm</button><button data-sheet-open="artifacts">Pháp Bảo</button></div></div>`;
}
function v13821ItemPicker(gear,selected){
  const limit=96,base=gear.slice(0,limit),picker=selected&&!base.some(x=>x.id===selected.id)?[selected,...base.slice(0,limit-1)]:base;
  return `<div class="v13821-item-picker"><div class="v13821-picker-title"><span>Chọn trang bị xử lý</span><b>${picker.length}/${gear.length} món</b></div><div class="v13821-picker-rail">${picker.map(x=>{const i=gear.indexOf(x);return `<button class="${selected?.id===x.id?'active':''} ${v107TierClass(x)}" data-inventory-select="${esc(x.id)}" data-item-long="item-${i}"><span>${v13823LazyImg(v1077EquipArt(x.slot,x),x.name)}<b>+${num(x.enhancementLevel||0)}</b></span><small>${esc(x.slotLabel||v107SlotLabel(x.slot))}</small></button>`;}).join('')}${gear.length>picker.length?`<button class="v13821-picker-more" data-inventory-view="gear"><span>⋯</span><small>Chọn trong Kho</small></button>`:''}</div></div>`;
}
function v13821CostLine(label,cost,owned,good=true){
  return `<div class="v13821-cost-line ${Number(owned)>=Number(cost)?'ok':'short'}"><span>${esc(label)}</span><b>${num(owned)} / ${num(cost)}</b></div>`;
}
function v13821WorkshopHead(x){
  if(!x)return '<div class="v1086-empty-state"><i>◇</i><strong>Chưa có trang bị</strong><span>Cần có ít nhất một món để mở Luyện Đồ.</span></div>';
  return `<div class="v13821-workshop-head v13823-rarity-card ${v107TierClass(x)}"><div class="v13821-workshop-art ${v107TierClass(x)}">${v13823LazyImg(v1077EquipArt(x.slot,x),x.name)}<b>+${num(x.enhancementLevel||0)}</b></div><div><span>${esc(x.slotLabel||v107SlotLabel(x.slot))} · Lv.${num(x.itemLevel||0)}</span><strong>${esc(x.name)}</strong><small>${esc(x.setName||x.source||'Trang bị')}</small><em class="v13823-rarity-label">${esc(v13823RarityLabel(x))}</em></div>${x.equipped?'<em>ĐANG MẶC</em>':''}</div>`;
}
function v13821EnhancePanel(x,sys){
  const current=Number(x.enhancementLevel||0),max=Number(x.maxEnhancementLevel??sys?.enhancement?.maxLevel??20),maxed=current>=max;
  const cost=Number(x.nextEnhanceCost||0),owned=Number(sys?.resources?.forgingEssence||0),protect=Number(sys?.resources?.protectionTalismans||0);
  const chance=Number(x.nextEnhanceChancePct||0),down=Number(x.nextEnhanceDowngradeChancePct||0),can=!maxed&&owned>=cost;
  const rows=v138246EnhanceStatPreview(x),target=maxed?current:current+1;
  return `<section class="v138246-enhance-screen ${maxed?'maxed':''}"><header class="v138246-enhance-head"><div><small>CƯỜNG HÓA TRANG BỊ</small><strong>+${num(current)} <i>→</i> +${num(target)}</strong><span>${maxed?'Đã đạt giới hạn hiện tại':`Bonus stat ${num(x.enhancementBonusPct||0,1)}% → ${num(x.nextEnhanceBonusPct||0,1)}%`}</span></div><div class="v138246-chance" style="--chance:${Math.max(0,Math.min(100,chance))}"><b>${maxed?'MAX':num(chance,0)+'%'}</b><small>${maxed?'Hoàn tất':'Tỷ lệ thành công'}</small></div></header>
  <div class="v138246-enhance-preview"><header><span>PREVIEW CHỈ SỐ</span><small>Thấy trước kết quả khi thành công</small></header>${rows.map(r=>`<article><span>${esc(statName(r.key))}</span><b>${r.currentText}</b><i>›</i><strong>${r.nextText}</strong><em>${r.deltaText}</em></article>`).join('')||'<article><span>Chỉ số</span><b>—</b><i>›</i><strong>—</strong><em>—</em></article>'}</div>
  <div class="v138246-enhance-economy"><article><span>Khí Luyện Tinh Hoa</span><strong class="${owned>=cost?'ok':'short'}">${num(owned)} / ${num(cost)}</strong></article><article><span>Bùa Chống Tụt</span><strong>${num(protect)}</strong></article><article><span>Rủi ro tụt cấp</span><strong class="${down>0?'risk':'safe'}">${maxed?'—':down>0?`${num(down,1)}% tụt 1 cấp`:'Không tụt cấp'}</strong></article></div>
  ${maxed?'<div class="v13821-max-note">Trang bị đã đạt giới hạn Cường Hóa hiện tại.</div>':`<div class="v138246-enhance-actions"><button class="primary" data-enhance="${esc(x.id)}" ${!can?'disabled':''}><small>Tốn ${num(cost)} Khí Luyện</small><b>Cường Hóa +${num(target)}</b></button><button data-enhance-protected="${esc(x.id)}" ${!can||protect<1?'disabled':''}><small>${protect>0?`Còn ${num(protect)} Bùa`:'Không có Bùa'}</small><b>Bảo Hộ Cường Hóa</b></button></div>`}
  <div class="v138246-breakpoints"><span>MỐC CƯỜNG HÓA</span><div>${[0,...(sys?.enhancement?.breakpoints||[]).map(bp=>bp.level)].map(level=>`<i class="${current>=level?'done':''} ${current===level?'current':''}"><b>+${level}</b></i>`).join('')}</div></div></section>`;
}

function v13821AffixList(x){
  const lines=x?.affixDetails||[];
  if(!lines.length)return '<div class="v13821-empty-panel">Món này chưa có thuộc tính phụ để xử lý.</div>';
  const selected=Math.max(0,Math.min(lines.length-1,Number(inventoryUi.affixIndex||0)));inventoryUi.affixIndex=selected;
  return `<div class="v13821-affix-list">${lines.map(a=>`<button class="${a.index===selected?'active':''}" data-affix-select="${a.index}"><i>${a.index+1}</i><span><b>${esc(a.name)}</b><small>${esc(a.familyLabel)} · ${num(a.rollPct,2)}%</small></span><em>${a.buildAffix?'LỐI CHƠI':'CHỈ SỐ'}</em></button>`).join('')}</div>`;
}
function v13821ReforgePanel(x,sys){
  const aff=x?.affixDetails||[];if(!aff.length)return v13821AffixList(x);
  const idx=Math.max(0,Math.min(aff.length-1,Number(inventoryUi.affixIndex||0))),a=aff[idx];
  const same=a.reforgeCost||{},essOwned=resourceQuantity(same.essenceResourceId),stones=Number(sys?.resources?.spiritStones||0);
  const other=(a.availableFamilies||[]).filter(f=>f!==a.family);
  let target=inventoryUi.targetFamily;if(!other.includes(target))target=other[0]||'';inventoryUi.targetFamily=target;
  const change=target?(a.familyChangeCosts||{})[target]:null,changeEss=change?resourceQuantity(change.essenceResourceId):0,cores=Number(sys?.resources?.familyChangeCores||0);
  const sameReady=stones>=Number(same.spiritStones||0)&&essOwned>=Number(same.equipmentEssence||0);
  const changeReady=Boolean(change)&&stones>=Number(change?.spiritStones||0)&&changeEss>=Number(change?.equipmentEssence||0)&&cores>=Number(change?.familyChangeMaterial||0);
  return `<div class="v13821-affix-work"><div>${v13821AffixList(x)}</div><div class="v13821-affix-operation"><div class="v13821-selected-affix"><span>Dòng đang chọn</span><strong>${esc(a.formatted||a.name)}</strong><small>${esc(a.familyLabel)} · Chất lượng ${num(a.rollPct,2)}% · Đã Tái Luyện ${num(x.reforgeCount||0)} lần</small></div><div class="v13821-rule-note"><b>Tái Luyện</b><span>Đổi thuộc tính đang chọn; các dòng còn lại được giữ nguyên. Mỗi lần thành công làm chi phí Tái Luyện sau của chính món này ×1,50.</span></div><div class="v13821-op-card"><div><strong>Cùng nhóm ${esc(a.familyLabel)}</strong><small>Thuộc tính cụ thể nhận được vẫn ngẫu nhiên.</small></div>${v13821CostLine('Linh Thạch',same.spiritStones||0,stones)}${v13821CostLine('Tinh Hoa cùng phẩm',same.equipmentEssence||0,essOwned)}<button data-reforge-same="${esc(x.id)}" ${!sameReady?'disabled':''}>Tái Luyện dòng ${idx+1}</button></div><div class="v13821-op-card family"><div><strong>Đổi nhóm thuộc tính</strong><small>Cần thêm 1 Chuyển Tính Thạch; thuộc tính cụ thể trong nhóm vẫn ngẫu nhiên.</small></div>${other.length?`<select data-reforge-family>${other.map(f=>`<option value="${esc(f)}" ${f===target?'selected':''}>${esc((sys.affixFamilies||[]).find(y=>y.id===f)?.label||f)}</option>`).join('')}</select>${change?`${v13821CostLine('Linh Thạch',change.spiritStones||0,stones)}${v13821CostLine('Tinh Hoa cùng phẩm',change.equipmentEssence||0,changeEss)}${v13821CostLine(sys?.resources?.familyChangeResourceName||'Chuyển Tính Thạch',change.familyChangeMaterial||1,cores)}<button class="danger-soft" data-reforge-change="${esc(x.id)}" ${!changeReady?'disabled':''}>Đổi sang ${esc((sys.affixFamilies||[]).find(y=>y.id===target)?.label||target)}</button>`:''}`:'<div class="v13821-empty-panel compact">Dòng này chưa thể đổi sang nhóm thuộc tính khác.</div>'}</div></div></div>`;
}
function v13821RefinePanel(x,sys){
  const aff=x?.affixDetails||[];if(!aff.length)return v13821AffixList(x);
  const idx=Math.max(0,Math.min(aff.length-1,Number(inventoryUi.affixIndex||0))),a=aff[idx],cost=a.refineCost||{};
  const stones=Number(sys?.resources?.spiritStones||0),essOwned=cost.essenceResourceId?resourceQuantity(cost.essenceResourceId):0;
  const ready=!a.maxRoll&&stones>=Number(cost.spiritStones||0)&&essOwned>=Number(cost.equipmentEssence||0);
  const fill=Math.max(0,Math.min(100,(Number(a.rollPct||80)-80)/20*100));
  return `<div class="v13821-affix-work"><div>${v13821AffixList(x)}</div><div class="v13821-affix-operation"><div class="v13821-selected-affix"><span>Tinh Luyện dòng ${idx+1}</span><strong>${esc(a.formatted||a.name)}</strong><small>Giữ nguyên loại thuộc tính. Tinh Luyện luôn thành công và không làm giảm chỉ số.</small></div><div class="v13821-refine-meter"><div><span>Chất lượng hiện tại</span><b>${num(a.rollPct,2)}%</b></div><div class="bar"><i style="width:${fill}%"></i></div><small>Mỗi lần chắc chắn +1 điểm phần trăm cho tới 100%.</small></div>${a.maxRoll?'<div class="v13821-max-note">Dòng này đã đạt roll 100%.</div>':`<div class="v13821-cost-box">${v13821CostLine('Linh Thạch',cost.spiritStones||0,stones)}${v13821CostLine('Tinh Hoa cùng phẩm',cost.equipmentEssence||0,essOwned)}</div><button class="v13821-wide-action" data-refine-affix="${esc(x.id)}" ${!ready?'disabled':''}>Tinh Luyện → ${num(Math.min(100,Number(a.rollPct||0)+1),2)}%</button>`}</div></div>`;
}
function v13821TransferPanel(x,gear,sys){
  const level=Number(x?.enhancementLevel||0),targets=(x?.transferEligibleTargetIds||[]).map(id=>gear.find(y=>y.id===id)).filter(Boolean),gems=Number(sys?.resources?.transferGems||0);
  if(!x)return '<div class="v13821-empty-panel">Chưa chọn trang bị.</div>';
  return `<div class="v13821-transfer-screen"><div class="v13821-rule-note"><b>Ngọc Chuyển Cường Hóa</b><span>Chỉ chuyển giữa trang bị cùng ô. Món nguồn về +0; món đích nhận nguyên cấp nguồn. Không sao chép cấp sang hai món.</span></div><div class="v13821-transfer-source"><span>Nguồn</span>${v13820ItemSummary(x)}<div class="v13821-resource-badge">Ngọc Chuyển Cường Hóa <b>${num(gems)}</b></div></div>${level<=0?'<div class="v13821-empty-panel">Trang bị nguồn đang +0 nên không có gì để chuyển.</div>':targets.length?`<div class="v13821-target-grid">${targets.map(t=>`<button data-transfer-direct="${esc(x.id)}" data-transfer-to="${esc(t.id)}" ${gems<1?'disabled':''}><img src="${v1077EquipArt(t.slot,t)}" alt=""><span><strong>${esc(t.name)}</strong><small>+${num(t.enhancementLevel||0)} → +${num(level)}</small></span><b>Nhận</b></button>`).join('')}</div>`:'<div class="v13821-empty-panel">Không có món cùng vị trí với cấp Cường Hóa thấp hơn để nhận.</div>'}</div>`;
}
function v13821DaoPanel(x,sys){
  const fragments=Number(sys?.resources?.daoFragments||0),stones=Number(sys?.resources?.spiritStones||0),cost=x?.daoEngraveCost||{},essOwned=resourceQuantity(cost.essenceResourceId),catalog=sys?.daoInscriptionCatalog||[];
  const ready=stones>=Number(cost.spiritStones||0)&&essOwned>=Number(cost.equipmentEssence||0)&&fragments>=Number(cost.daoFragments||0);
  const cur=x?.daoInscriptionDetail;
  return `<div class="v13821-dao-panel"><div class="v13821-dao-current"><i>◆</i><div><span>Đạo Văn hiện tại</span><strong>${cur?esc(cur.name):'Chưa có'}</strong><small>${cur?esc(cur.description):'Chọn một trong 8 Đạo Văn authored V128; hiệu ứng đi qua EquipmentPower → CombatKernel.'}</small></div></div><div class="v13821-rule-note"><b>Khắc Đạo Văn</b><span>Khắc mới sẽ thay Đạo Văn hiện tại. ID tùy ý/legacy không thể được ghi mới; payload legacy vẫn được giữ khi load save cũ.</span></div><div class="v13821-dao-cost-preview"><span>${esc(sys?.resources?.daoFragmentResourceName||'Tàn Văn')} <b>${num(fragments)}</b> / ${num(cost.daoFragments||0)}</span><span>Linh Thạch <b>${num(stones)}</b> / ${num(cost.spiritStones||0)}</span><span>Tinh Hoa cùng phẩm <b>${num(essOwned)}</b> / ${num(cost.equipmentEssence||0)}</span></div><div class="v13821-target-grid">${catalog.map(d=>`<button data-dao-engrave="${esc(x.id)}" data-dao-id="${esc(d.id)}" ${!ready?'disabled':''}><span><strong>${esc(d.name)}</strong><small>${esc(d.description)}</small></span><b>${x?.daoInscription===d.id?'Khắc lại':'Khắc'}</b></button>`).join('')}</div></div>`;
}
function v138247SocketWorkshopPanel(x,sys={}){
  const st=v138245SocketState(x),runtime=Boolean(sys?.capabilities?.socketGems),blank=Number(sys?.v128Resources?.gemBlanks?.quantity||0),catalog=sys?.gemCatalog||[];
  if(!runtime)return '<div class="v138247-socket-unavailable"><i>◇</i><div><small>KHẢM NGỌC</small><strong>Dữ liệu Khảm Ngọc chưa sẵn sàng</strong><span>Không tiêu tài nguyên và không ghi save.</span></div></div>';
  if(!st.total)return `<div class="v138247-socket-unavailable"><i>◇</i><div><small>KHẢM NGỌC</small><strong>${esc(x?.grade||'Phẩm thấp')} không có ô Ngọc</strong><span>Huyền/Địa có 1 ô · Thiên 2 · Tiên 3 · Cực/Phá 4.</span></div></div>`;
  const slots=x?.gemSockets||[];
  return `<section class="v138247-socket-workshop runtime"><header><div><small>KHẢM NGỌC</small><strong>Ngũ Hành Ngọc · Lv1–5</strong><span>Ngũ Hành Ngọc Phôi hiện có <b>${num(blank)}</b>. Tháo Ngọc hoàn nguyên lượng Ngọc Phôi đã đầu tư.</span></div><b>${num(st.filled)}/${num(st.total)}</b></header><div class="v138247-socket-stage"><div class="v138247-socket-item ${v138240GradeClass(x)} ${v138240EnhanceClass(x.enhancementLevel)}">${v138245RarityAura()}${v13823LazyImg(v1077EquipArt(x.slot,x),x.name)}<b>+${num(x.enhancementLevel||0)}</b></div><div class="v138247-socket-slots">${slots.map((slot,i)=>{const gem=slot?.gem,effect=slot?.effect;return `<article class="${gem?esc(gem.element):'empty'} ${gem?'filled':'empty'}"><i>${gem?'◆':'○'}</i><div><small>LỖ ${i+1}</small><strong>${gem?`${esc(effect?.name||gem.element)} · Lv${num(gem.level||1)}`:'Ô trống'}</strong>${effect?`<span>${esc(effect.detail)}</span>`:''}</div>${gem?`<div class="tag-row"><button class="button primary" data-gem-upgrade="${esc(x.id)}" data-socket-index="${i}" ${!slot.nextUpgradeCost||blank<Number(slot.nextUpgradeCost)?'disabled':''}>${slot.nextUpgradeCost?`Nâng · ${num(slot.nextUpgradeCost)} Phôi`:'Đã Lv5'}</button><button class="button ghost" data-gem-unsocket="${esc(x.id)}" data-socket-index="${i}">Tháo</button></div>`:`<div class="tag-row">${catalog.map(g=>`<button class="button ghost" data-gem-socket="${esc(x.id)}" data-socket-index="${i}" data-gem-element="${esc(g.id)}" ${blank<1?'disabled':''}>${esc(g.name)} · 1 Phôi</button>`).join('')}</div>`}</article>`}).join('')}</div></div><div class="v138247-gem-legend">${catalog.map(g=>`<span class="${esc(g.id)}"><i></i><b>${esc(g.identity||g.name)}</b></span>`).join('')}</div><div class="v138247-socket-runtime-note">Kim: Xuyên · Mộc: Hồi Phục · Thủy: Khiên/Giảm Thương · Hỏa: Bạo Kích/Bạo Thương · Thổ: HP/Phòng.</div></section>`;
}
function v142EquipmentCraftPanel(sys,selected){
  const v=sys?.v142;if(!v)return '';
  const slots=v.slots||[];if(!slots.some(x=>x.id===inventoryUi.v142CraftSlot))inventoryUi.v142CraftSlot=slots[0]?.id||'weapon';
  const rows=(v.fragmentRows||[]).filter(x=>Number(x.balance||0)>0||Number(x.rankIndex)===Number(v.maxRankIndex));
  const slotOptions=slots.map(x=>`<option value="${esc(x.id)}" ${inventoryUi.v142CraftSlot===x.id?'selected':''}>${esc(x.label)}</option>`).join('');
  const fragmentRows=rows.map(x=>`<article class="v13821-cost-line ${x.craftable?'ok':''}"><span><b>${esc(x.rankName)}</b><small>Mảnh ${num(x.balance)} / ${num(x.craftCost)}</small></span><div class="tag-row"><button class="button primary" data-v142-craft-rank="${x.rankIndex}" ${x.craftable?'':'disabled'}>Luyện 1 món</button><button class="button ghost" data-v142-refine="${x.rankIndex}" ${x.refinable?'':'disabled'}>3 → 1 bậc trên</button></div></article>`).join('');
  const selectedV142=Boolean(selected?.isV142),same=selectedV142?(model.equipment||[]).filter(x=>x.isV142&&x.id!==selected.id&&x.slot===selected.slot&&Number(x.rankIndex)===Number(selected.rankIndex)):[];
  const merge=selectedV142&&same.length>=2?`<button class="button primary" data-v142-merge="${esc(selected.id)}" data-v142-fodder-a="${esc(same[0].id)}" data-v142-fodder-b="${esc(same[1].id)}">Hợp 3 món → ${esc((v.fragmentRows||[]).find(r=>Number(r.rankIndex)===Number(selected.rankIndex)+1)?.rankName||'bậc trên')}</button>`:'';
  const setRows=(v.setRows||[]).filter(set=>selectedV142&&set.category===selected.slotGroup);
  const engrave=setRows.length?`<div class="v13821-cost-grid"><strong>Khắc Bộ cho ${esc(selected.name)}</strong>${setRows.map(set=>`<article><span>${esc(set.setName)}</span><b>${num(set.fragmentBalance)} / ${num(set.engraveCost)} Tàn Ấn</b><button class="button ghost" data-v142-engrave="${esc(selected.id)}" data-v142-set-id="${esc(set.setId)}" ${Number(set.fragmentBalance)>=Number(set.engraveCost)?'':'disabled'}>Khắc Bộ</button></article>`).join('')}</div>`:'';
  return `<section class="card v142-equipment-workshop"><header><div><small>V142 · LUYỆN TRANG BỊ</small><strong>50 Mảnh cùng bậc → 1 món</strong><span>3 mảnh bậc dưới → 1 mảnh bậc trên · Săn Yêu/Phó Bản chỉ rơi mảnh.</span></div><b>+${num(v.maxEnhancementLevel)} MAX</b></header><label><span>Ô muốn luyện</span><select data-v142-craft-slot>${slotOptions}</select></label><div class="v13821-cost-grid">${fragmentRows||'<span>Chưa có Mảnh Trang Bị.</span>'}</div>${merge?`<div class="tag-row"><span>Giữ món đang chọn làm món chính.</span>${merge}</div>`:''}${engrave}</section>`;
}
function v13821Workshop(gear,selected,sys){
  if(!selected)return '<div class="v1086-empty-state"><i>◇</i><strong>Chưa có trang bị</strong><span>Loot một món để mở Luyện Đồ.</span></div>';
  const daoLive=!selected?.isV142&&Boolean(sys?.capabilities?.daoInscriptionRuntimeLive),socketVisible=!selected?.isV142&&(Boolean(sys?.capabilities?.socketGems)||v138245SocketState(selected).total>0);
  if(inventoryUi.forgeTab==='dao'&&!daoLive)inventoryUi.forgeTab='enhance';
  if(inventoryUi.forgeTab==='socket'&&!socketVisible)inventoryUi.forgeTab='enhance';
  const tab=inventoryUi.forgeTab||'enhance';
  const tabs=[['enhance','Cường Hóa'],['reforge','Tái Luyện'],['refine','Tinh Luyện'],['transfer','Chuyển +']];
  if(socketVisible)tabs.push(['socket','Khảm Ngọc']);
  if(daoLive)tabs.push(['dao','Đạo Văn']);
  const panel=tab==='reforge'?v13821ReforgePanel(selected,sys):tab==='refine'?v13821RefinePanel(selected,sys):tab==='transfer'?v13821TransferPanel(selected,gear,sys):tab==='socket'?v138247SocketWorkshopPanel(selected,sys):tab==='dao'?v13821DaoPanel(selected,sys):v13821EnhancePanel(selected,sys);
  return `${v13821ItemPicker(gear,selected)}<div class="v13821-workshop v138247-workshop">${v13821WorkshopHead(selected)}<div class="v13821-forge-tabs">${tabs.map(([id,label])=>`<button class="${tab===id?'active':''}" data-workshop-tab="${id}">${label}</button>`).join('')}</div><div class="v13821-workshop-body">${panel}</div></div>`;
}
const V138233_SET_IDENTITY={element:'Ngũ Hành'};
const V138233_SET_TAG_LABEL={Metal:'Kim Hành',Wood:'Mộc Hành',Water:'Thủy Hành',Fire:'Hỏa Hành',Earth:'Thổ Hành','Dao:Sword':'Kiếm Đạo','Dao:Fist':'Quyền Đạo','Dao:Body':'Thể Đạo','Dao:Spell':'Pháp Đạo','Dao:Poison':'Độc Đạo','Dao:Artifact':'Ngự Khí','Dao:Formation':'Trận Đạo','Dao:Mind':'Thần Niệm',Rotation:'Đa kỹ năng',UltimateGauge:'Tuyệt Kỹ'};
function v138233PlainSetText(text=''){
  return String(text||'')
    .replace(/^(Kim|Mộc|Thủy|Hỏa|Thổ) hệ chính trang:\s*/i,'')
    .replace(/^Kiếm Đạo chính trang:\s*/i,'').replace(/^Quyền Đạo chính trang:\s*/i,'').replace(/^Thể Đạo chính trang:\s*/i,'')
    .replace(/^Pháp Đạo chính trang:\s*/i,'').replace(/^Độc Đạo chính trang:\s*/i,'').replace(/^Ngự Khí chính trang:\s*/i,'')
    .replace(/^Trận Đạo chính trang:\s*/i,'').replace(/^Thần Niệm chính trang:\s*/i,'').replace(/^Bội\/Nhẫn\s*/i,'')
    .replace(/Ultimate Gauge/gi,'Nộ Tuyệt Kỹ').replace(/Generate/gi,'tích').replace(/Spend/gi,'tiêu').replace(/Finisher/gi,'đòn kết liễu')
    .replace(/Active/gi,'kỹ năng chủ động').replace(/Gauge/gi,'Nộ').replace(/mitigation/gi,'giảm sát thương').replace(/payoff/gi,'hiệu quả')
    .replace(/rotation/gi,'chuỗi kỹ năng').replace(/Counter/gi,'phản công').replace(/DoT/gi,'sát thương duy trì').replace(/Recovery/gi,'nhịp hồi sau đòn')
    .replace(/Channel/gi,'vận công').replace(/Cast/gi,'thi triển').replace(/Heavy/gi,'trọng kích').replace(/Basic/gi,'đánh thường').replace(/Defensive/gi,'kỹ năng phòng thủ')
    .replace(/interrupt/gi,'ngắt chiêu').replace(/event budget/gi,'giới hạn kích hoạt').replace(/proc/gi,'kích hoạt phụ').replace(/Break/gi,'Phá Thế')
    .replace(/requirement/gi,'yêu cầu').replace(/package/gi,'hiệu quả').replace(/output/gi,'hiệu lực').replace(/resource/gi,'tài nguyên').replace(/domain/gi,'cơ chế');
}
function v138236MechanicGuide(text=''){
  const raw=String(text||'');const cards=[];
  if(/Lưu Thế|waterFlow/i.test(raw))cards.push(`<article class="v138236-mechanic-card water"><header><i>◉</i><div><small>THỦY HÀNH · TÀI NGUYÊN CHIẾN ĐẤU</small><strong>Lưu Thế là gì?</strong></div></header><p><b>Dễ hiểu:</b> Lưu Thế là “đà” của Thủy Hành. Đánh đúng nhịp Thủy để tích, giữ đà cao để kỹ năng hợp <b>Thuận Thế</b> mạnh hơn, rồi dùng <b>Triều Ấn</b> để đổi đà thành một nhịp bùng nổ.</p><dl><div><dt>Cách tích</dt><dd>Hành động Thủy tự tích <b>+18</b> khi hợp Thuận Thế, hoặc <b>+14</b> khi không hợp, trước các modifier.</dd></div><div><dt>Mất khi nào?</dt><dd>Đánh Thường ngoài Thủy làm giảm <b>6</b>; kỹ năng Chủ Động ngoài Thủy làm giảm <b>12</b> (Set có thể giảm hao hụt).</dd></div><div><dt>Giữ cao được gì?</dt><dd>Hành động hợp Thuận Thế nhận tối đa <b>+15% hiệu quả của kỹ năng</b> ở 100 Lưu Thế, trước hệ số Linh Căn.</dd></div><div><dt>Tiêu thế nào?</dt><dd>Triều Ấn Spend cần ít nhất <b>20 Lưu Thế / Ấn</b>; mỗi Ấn dùng cho nhịp Spend cộng <b>+12% hiệu quả của kỹ năng</b> trước hệ số Linh Căn.</dd></div></dl></article>`);
  if(/Trọng Thế|earthWeight/i.test(raw))cards.push(`<article class="v138236-mechanic-card earth"><header><i>⬟</i><div><small>THỔ HÀNH · TÀI NGUYÊN CHIẾN ĐẤU</small><strong>Trọng Thế là gì?</strong></div></header><p><b>Dễ hiểu:</b> Trọng Thế là “thế đứng” của Thổ Hành. Nó <b>không sinh từ việc đánh</b>; bạn phải thật sự giảm được sát thương để tích. Có thể giữ để đứng vững hoặc xả qua kỹ năng Thổ để đổi phòng thủ thành nhịp phản công.</p><dl><div><dt>Cách tích</dt><dd>Chỉ sinh từ sự kiện <b>giảm sát thương thật</b>. Mỗi sự kiện sau mọi modifier được khóa tối đa <b>+25</b> Trọng Thế.</dd></div><div><dt>Giữ được gì?</dt><dd>100 Trọng Thế cho tối đa <b>10% giảm sát thương</b>. Phần vượt 100 nếu build mở chỉ là kho để xả, <b>không tăng giảm thương thêm</b>.</dd></div><div><dt>Xả tấn công</dt><dd>Kỹ năng Thổ dạng Spend nhận <b>+0,45% hiệu quả của kỹ năng / 1 Trọng Thế</b> trước hệ số Linh Căn.</dd></div><div><dt>Phản Lực</dt><dd>Mặc định <b>40%</b> Trọng Thế đã xả được chuyển thành Phản Lực để phục vụ nhịp phản công; Set có thể tăng tỷ lệ này.</dd></div></dl></article>`);
  return cards.length?`<section class="v138236-mechanic-guide"><div class="v138236-mechanic-title"><span>GIẢI THÍCH CƠ CHẾ</span><strong>Không cần đoán thuật ngữ</strong></div>${cards.join('')}</section>`:'';
}
function v138233SetIdentity(set={}){return V138233_SET_IDENTITY[set.identity]||'Bộ trang bị';}
function v138233SetRole(set={}){
  const tags=v138233SetTags(set);
  if(set.identity==='element'){
    const tone=v138233SetTone(set);
    return ({metal:'Phá giáp · Phá Thế',wood:'Hồi phục · DoT · Hút Sinh Mệnh',water:'Chân Nguyên · Hồi Chiêu',fire:'Sát thương · Bạo Kích',earth:'Phòng Ngự · Phản Kích'})[tone]||`Xây quanh ${tags[0]||'Ngũ Hành'}`;
  }
  if(set.identity==='dao')return `Tối ưu ${tags[0]||'Bản Đạo'}`;
  if(set.identity==='hybrid')return `Kết hợp ${tags.slice(0,2).join(' × ')||'Hành × Đạo'}`;
  if((set.tags||[]).includes('UltimateGauge'))return 'Xoay quanh Tuyệt Kỹ';
  if((set.tags||[]).includes('Rotation'))return 'Thưởng đổi nhiều kỹ năng';
  return 'Bộ phổ dụng';
}
function v138233MissingChoices(set={},limit=2){
  const list=(set.missingSlots||[]).map(x=>x.slotLabel||x.slot).filter(Boolean);return list.slice(0,limit).join(' / ')+(list.length>limit?'…':'');
}
function v138233SetTags(set={}){
  const out=[];
  for(const raw of (set.tags||[])){
    const key=String(raw||''); if(key.startsWith('Root:')||key==='Universal'||['Sword','Fist','Body','Spell','Poison','Artifact','Formation','Mind'].includes(key))continue;
    const label=V138233_SET_TAG_LABEL[key]||UI_TERM_VI[key]||key.replace('Dao:',''); if(label&&!out.includes(label))out.push(label);
  }
  return out.slice(0,3);
}
function v138233SetTone(set={}){
  const tags=set.tags||[];
  for(const key of ['Metal','Wood','Water','Fire','Earth'])if(tags.includes(key))return key.toLowerCase();
  if(tags.some(x=>String(x).includes('Poison')))return 'poison';
  if(tags.some(x=>String(x).includes('Sword')))return 'sword';
  if(tags.some(x=>String(x).includes('Body')))return 'body';
  if(set.identity==='universal')return 'universal';
  if(set.identity==='hybrid')return 'hybrid';
  return 'dao';
}
function v138233SetGlyph(set={}){
  const tone=v138233SetTone(set);return ({metal:'◇',wood:'❈',water:'≋',fire:'✦',earth:'◆',poison:'☽',sword:'╱',body:'◈',universal:'∞',hybrid:'⌬',dao:'✧'})[tone]||'✧';
}
function v138233Thresholds(set={}){return [...(set.thresholds||[])].sort((a,b)=>Number(a.pieces||0)-Number(b.pieces||0));}
function v138233NextThreshold(set={},count=0){return v138233Thresholds(set).find(x=>Number(x.pieces||0)>Number(count||0))||null;}
function v138233Progress(count=0,max=0,cls=''){
  const n=Math.max(0,Number(count||0)),m=Math.max(1,Number(max||0));return `<div class="v138233-segments ${cls}">${Array.from({length:m},(_,i)=>`<i class="${i<n?'filled':''}"></i>`).join('')}</div>`;
}
function v138233OwnedSlotCount(set={},gear=[]){
  if(Number.isFinite(Number(set.ownedSlotCount)))return Number(set.ownedSlotCount||0);
  return new Set(gear.filter(x=>x.setId===set.setId).map(x=>x.slot)).size;
}
function v138233SetMilestones(set={},live=null,mode='catalog'){
  const count=mode==='equipped'?Number(live?.equippedPieces||set.equippedPieces||0):v138233OwnedSlotCount(set,model?.equipment||[]);
  const liveByPiece=new Map((live?.thresholds||[]).map(x=>[Number(x.pieces),x]));
  return v138233Thresholds(set).map(t=>{const p=Number(t.pieces||0),runtime=liveByPiece.get(p),active=Boolean(runtime?.active),available=!active&&count>=p;return `<span class="${active?'active':available?'available':'locked'}"><b>${p}</b><small>${active?'Đang kích':available?'Đủ mảnh':'Chưa đủ'}</small></span>`;}).join('');
}
function v138233CurrentSetCard(live,cat,gear){
  const set=cat||live||{},next=v138233NextThreshold(set,live?.equippedPieces||0),missing=next?Math.max(0,Number(next.pieces)-Number(live?.equippedPieces||0)):0;
  const pieces=live?.pieces||[]; const tags=v138233SetTags(set);
  return `<section class="v138233-current-card ${live?.category||set.category||'attire'} tone-${v138233SetTone(set)}"><header><div class="v138233-set-emblem">${v138233SetGlyph(set)}</div><div><span>${live?.category==='attire'?'Trang Phục':'Phụ Kiện'} · ${esc(v138233SetIdentity(set))}</span><strong>${esc(live?.setName||set.setName||'Set')}</strong><small>${esc(v138233SetRole(set))}${tags.length?` · ${tags.map(esc).join(' · ')}`:''}</small></div><b>${num(live?.equippedPieces||0)}/${num(live?.maxPieces||set.maxPieces||0)}</b></header>${v138233Progress(live?.equippedPieces||0,live?.maxPieces||set.maxPieces||0,'equipped')}<div class="v138233-current-next"><strong>${next?`Còn ${missing} vị trí khác để kích mốc ${num(next.pieces)}`:'Đã đạt mốc cao nhất'}</strong><span>${next?esc(next.name):'Toàn bộ mốc của bộ đang hoạt động'}</span></div><div class="v138233-current-slots">${pieces.map(p=>{const item=p.itemId?gear.find(x=>x.id===p.itemId):null;return `<div class="${p.itemId?'filled':'empty'}" title="${esc(p.slotLabel)}"><span>${item?`${v13823LazyImg(v1077EquipArt(p.slot,item),item.name)}<b>+${num(p.enhancementLevel||0)}</b>`:v1077SlotIcon(p.slot)}</span></div>`;}).join('')}</div><div class="v138233-live-thresholds">${(live?.thresholds||[]).map(t=>`<div class="${t.active?'active':'inactive'}"><i>${t.active?'✓':num(t.pieces)}</i><span><b>${num(t.pieces)} món · ${esc(t.name)}</b><small>${esc(v138233PlainSetText(t.summary||''))}</small>${t.effectiveGrade?`<em>Hiệu lực ${esc(t.effectiveGrade)}</em>`:''}${t.constraint?`<u>Đánh đổi: ${esc(v138233PlainSetText(t.constraint))}</u>`:''}</span></div>`).join('')}</div></section>`;
}
function v138233NearSets(catalog=[],gear=[]){
  return catalog.map(set=>{const owned=v138233OwnedSlotCount(set,gear),next=v138233NextThreshold(set,owned);return {set,owned,next,gap:next?Math.max(0,Number(next.pieces)-owned):99};}).filter(x=>x.owned>0&&x.next&&x.gap<=2).sort((a,b)=>a.gap-b.gap||b.owned-a.owned||a.set.setName.localeCompare(b.set.setName)).slice(0,3);
}
function v138233LibraryCard(set,index,gear,live){
  const owned=v138233OwnedSlotCount(set,gear),equipped=Number(set.equippedPieces||0),next=v138233NextThreshold(set,owned),missing=next?Math.max(0,Number(next.pieces)-owned):0,tags=v138233SetTags(set),duplicates=Number(set.duplicatePieces||Math.max(0,Number(set.ownedPieces||0)-owned));
  return `<button type="button" class="v138233-library-card tone-${v138233SetTone(set)} ${set.unlocked?'known':'unknown'}" data-sheet-open="set-${index}"><span class="v138233-card-top"><i>${v138233SetGlyph(set)}</i><span><small>${set.category==='attire'?'TRANG PHỤC':'BỘI–NHẪN'} · ${esc(v138233SetIdentity(set))}</small><strong>${esc(set.setName)}</strong></span><em>${set.unlocked?'Đã nhận diện':'Chưa nhận diện'}</em></span><span class="v138233-tag-row">${tags.map(x=>`<b>${esc(x)}</b>`).join('')||'<b>Phổ dụng</b>'}</span><span class="v138233-card-role">${esc(v138233SetRole(set))}</span><span class="v138233-card-summary">${esc(v138233PlainSetText(set.description))}</span><span class="v138233-card-progress"><span><small>Sở hữu vị trí</small><b>${num(owned)}/${num(set.maxPieces)}</b></span>${v138233Progress(owned,set.maxPieces,'owned')}<span><small>Đang mặc</small><b>${num(equipped)}/${num(set.maxPieces)}</b></span></span><span class="v138233-card-next"><b>${next?`Thiếu ${missing} vị trí → mốc ${num(next.pieces)}`:'Đã đủ mọi vị trí'}</b><small>${duplicates>0?`${num(duplicates)} bản trùng không tính thêm mốc · `:''}${next?esc(next.name):'Có thể hoàn thiện toàn bộ bộ'}</small></span><span class="v138233-card-milestones">${v138233SetMilestones(set,live,'catalog')}</span><span class="v138233-card-cta">Xem hiệu ứng & mảnh bộ <b>›</b></span></button>`;
}
function v138233SetDetailSheet(set,index,gear,sys){
  const live=(sys?.sets||[]).find(x=>x.setId===set.setId),owned=v138233OwnedSlotCount(set,gear),duplicates=Number(set.duplicatePieces||Math.max(0,Number(set.ownedPieces||0)-owned));
  const slotDefs=[...(set.ownedSlots||[]),...(set.missingSlots||[])].sort((a,b)=>Number((sys?.slots||[]).find(x=>x.id===a.slot)?.index??99)-Number((sys?.slots||[]).find(x=>x.id===b.slot)?.index??99));
  const liveByPiece=new Map((live?.thresholds||[]).map(x=>[Number(x.pieces),x]));
  const effects=v138233Thresholds(set).map(t=>{const p=Number(t.pieces||0),rt=liveByPiece.get(p),active=Boolean(rt?.active),available=!active&&owned>=p;return `<article class="v138233-effect ${active?'active':available?'available':'locked'}"><div class="v138233-effect-badge">${p}</div><div><span>${active?'ĐANG KÍCH':available?'ĐỦ MẢNH · CHƯA MẶC':'CHƯA ĐỦ MẢNH'}</span><strong>${esc(t.name)}</strong><p>${esc(v138233PlainSetText(rt?.summary||t.description||''))}</p>${rt?.effectiveGrade?`<small>Phẩm hiệu lực hiện tại: <b>${esc(rt.effectiveGrade)}</b></small>`:''}${t.constraint?`<em><b>Đánh đổi:</b> ${esc(v138233PlainSetText(t.constraint))}</em>`:''}</div></article>`;}).join('');
  const slots=slotDefs.map(slot=>{const matches=gear.filter(x=>x.setId===set.setId&&x.slot===slot.slot).sort((a,b)=>Number(b.itemLevel||0)-Number(a.itemLevel||0)),best=matches[0],equipped=best&&best.equipped;return `<div class="v138233-piece ${best?'owned':'missing'} ${equipped?'equipped':''}"><span>${best?v13823LazyImg(v1077EquipArt(best.slot,best),best.name):v1077SlotIcon(slot.slot)}</span><b>${esc(slot.slotLabel||v107SlotLabel(slot.slot))}</b><small>${best?`${matches.length>1?`${matches.length} món · `:''}${esc(slot.bestGrade||best.grade||'')} · Lv.${num(slot.bestItemLevel||best.itemLevel||0)}`:'Chưa có mảnh'}</small>${equipped?'<em>ĐANG MẶC</em>':''}</div>`;}).join('');
  const tags=v138233SetTags(set);
  return v106Sheet(`set-${index}`,set.setName,`<div class="v138233-detail tone-${v138233SetTone(set)}"><header><div class="v138233-detail-emblem">${v138233SetGlyph(set)}</div><div><span>${set.category==='attire'?'Trang Phục':'Phụ Kiện'} · ${esc(v138233SetIdentity(set))}</span><strong>${esc(set.setName)}</strong><small>${tags.join(' · ')||'Phổ dụng'} · ${set.unlocked?'Đã nhận diện':'Chưa nhận diện'}</small></div></header><div class="v138233-detail-role">${esc(v138233SetRole(set))}</div><p class="v138233-detail-summary">${esc(v138233PlainSetText(set.description))}</p><div class="v138233-detail-kpi"><div><span>Sở hữu vị trí</span><b>${num(owned)}/${num(set.maxPieces)}</b></div><div><span>Đang mặc</span><b>${num(set.equippedPieces||0)}/${num(set.maxPieces)}</b></div><div><span>Bản trùng</span><b>${num(duplicates)}</b></div></div><div class="v138233-detail-section"><div class="v138233-detail-title"><strong>Hiệu ứng bộ</strong><span>Các mốc thưởng của bộ</span></div>${effects}</div><div class="v138233-detail-section"><div class="v138233-detail-title"><strong>Mảnh của bộ</strong><span>Bản trùng không tăng mốc Set</span></div><div class="v138233-piece-grid">${slots}</div></div>${set.identity==='element'?'':v138236MechanicGuide(`${set.description||''} ${(set.thresholds||[]).map(x=>`${x.name||''} ${x.description||''} ${x.constraint||''}`).join(' ')} ${(live?.thresholds||[]).map(x=>x.summary||'').join(' ')}`)}<div class="v138233-howread"><strong>Cách đọc phẩm hiệu lực</strong><p>Mỗi mốc 2/4/6 tính độc lập theo phẩm của món yếu nhất trong nhóm N món tốt nhất đang mặc. Cường Hóa không nhân bonus Set.</p></div><button class="v138233-find-set" data-set-to-inventory="${esc(set.setId)}" data-set-category="${esc(set.category)}">Xem các món bộ này trong Hành Trang</button></div>`);
}
function v138233SetSheets(sys,gear){return (sys?.setCatalog||[]).map((set,i)=>v138233SetDetailSheet(set,i,gear,sys)).join('');}
function v138247SetElementStrip(catalog=[],gear=[],liveById=new Map()){
  return `<div class="v138247-element-strip">${catalog.map((set,index)=>{const owned=v138233OwnedSlotCount(set,gear),equipped=Number(set.equippedPieces||0),tone=v138233SetTone(set),active=liveById.has(set.setId)||equipped>0;return `<button class="tone-${tone} ${active?'active':''}" data-sheet-open="set-${index}"><i>${v138233SetGlyph(set)}</i><span><b>${esc((v138233SetTags(set)[0]||set.setName).replace(' Hành',''))}</b><small>${owned}/${num(set.maxPieces||6)} sở hữu${equipped?` · ${equipped} mặc`:''}</small></span></button>`;}).join('')}</div>`;
}
function v13821SetScreen(sys,gear){
  const activeSets=sys?.sets||[],catalog=(sys?.setCatalog||[]).filter(x=>x.category==='attire'&&x.identity==='element');
  const filter=inventoryUi.setFilter||'current',query=String(inventoryUi.setSearch||'').trim().toLocaleLowerCase('vi');
  const liveById=new Map(activeSets.map(x=>[x.setId,x]));
  const unlocked=catalog.filter(x=>x.unlocked).length,near=v138233NearSets(catalog,gear);
  const matched=catalog.filter(set=>{
    const owned=v138233OwnedSlotCount(set,gear),current=Number(set.equippedPieces||0)>0||liveById.has(set.setId);
    if(filter==='current'&&!current)return false;if(filter==='owned'&&owned<=0)return false;if(filter==='unlocked'&&!set.unlocked)return false;
    if(query&&!`${set.setName} ${set.description} ${(set.tags||[]).join(' ')}`.toLocaleLowerCase('vi').includes(query))return false;
    return true;
  });
  const currentHtml=activeSets.length?activeSets.map(live=>v138233CurrentSetCard(live,catalog.find(x=>x.setId===live.setId),gear)).join(''):'<div class="v138233-empty v138247-set-empty"><i>◇</i><strong>Chưa kích Set Ngũ Hành</strong><span>Mặc 2 Trang Phục cùng một Hành để mở mốc đầu tiên.</span></div>';
  const nearHtml=near.length?`<section class="v138233-near v138247-near"><div class="v138233-section-title"><div><span>GỢI Ý NHANH</span><strong>Sắp kích mốc mới</strong></div><small>Ưu tiên vị trí còn thiếu thay vì farm mù</small></div><div>${near.map(({set,owned,next,gap})=>{const idx=catalog.indexOf(set);return `<button data-sheet-open="set-${idx}" class="tone-${v138233SetTone(set)}"><i>${v138233SetGlyph(set)}</i><span><b>${esc(set.setName)}</b><small>${num(owned)}/${num(set.maxPieces)} · thiếu ${num(gap)} vị trí${v138233MissingChoices(set)?` · ${esc(v138233MissingChoices(set))}`:''}</small></span><em>›</em></button>`;}).join('')}</div></section>`:'';
  const libraryHtml=matched.length?`<section class="v138233-library-group v138247-library-group"><header><div><span>${catalog.length} HÀNH · 2/4/6</span><strong>Thư Viện Set Ngũ Hành</strong></div><b>${matched.length}</b></header><div class="v138233-library-list">${matched.map(set=>v138233LibraryCard(set,catalog.indexOf(set),gear,liveById.get(set.setId))).join('')}</div></section>`:'<div class="v138233-empty"><i>⌕</i><strong>Không có bộ phù hợp</strong><span>Đổi bộ lọc hoặc xóa từ khóa.</span><button data-clear-set-filters>Xóa bộ lọc</button></div>';
  return `<div class="v138233-set-screen v138247-set-screen"><section class="v138247-set-hero"><div><small>BỘ ĐỒ NGŨ HÀNH</small><strong>Chọn Set theo lối build</strong><span>6 ô Trang Phục tính mốc 2/4/6 · 4 ô Phụ Kiện không tính Set.</span></div><aside><span><b>${unlocked}</b> / ${catalog.length}</span><small>đã nhận diện</small></aside></section>${v138247SetElementStrip(catalog,gear,liveById)}<section class="v138233-current v138247-current"><div class="v138233-section-title"><div><span>ĐANG MẶC</span><strong>Hiệu ứng hiện tại</strong></div><small>Mốc sáng = đã kích hoạt</small></div>${currentHtml}</section>${nearHtml}<section class="v138233-library v138247-library"><div class="v138233-section-title"><div><span>THƯ VIỆN</span><strong>Tìm bộ phù hợp</strong></div><small>Chạm bộ để xem mảnh + hiệu ứng</small></div><div class="v138233-filter-block v138247-filter-block"><div class="v138233-filter-chips">${[['current','Đang mặc'],['owned','Có mảnh'],['unlocked','Đã nhận diện'],['all','Tất cả']].map(([id,label])=>`<button class="${filter===id?'active':''}" data-set-filter="${id}">${label}</button>`).join('')}</div><div class="v138233-filter-row"><label><span>⌕</span><input type="search" value="${esc(inventoryUi.setSearch||'')}" placeholder="Tìm Kim / Mộc / Thủy / Hỏa / Thổ" data-set-search></label></div></div>${libraryHtml}</section><details class="v138247-set-rules"><summary>Luật Set 2/4/6 <b>›</b></summary><p>Chỉ 6 ô Trang Phục tính Set. Mặc 6 món hưởng đồng thời mốc 2 + 4 + 6. Bản trùng không tăng mốc; mỗi vị trí chỉ tính một mảnh cho mốc Set. Cường Hóa không nhân bonus Set.</p></details></div>`;
}

const V138234_GRADE_ORDER=['mundane','spirit','mystic','earth','heaven','immortal','extreme','breaker'];
function v138234GradeRank(grade=''){return V138234_GRADE_ORDER.indexOf(String(grade||'').toLowerCase());}
const V138240_GRADE_CLASS={'Phàm':'mundane','Linh':'spirit','Huyền':'mystic','Địa':'earth','Thiên':'heaven','Tiên':'immortal','Cực':'extreme','Phá':'breaker'};
function v138240GradeClass(x={}){return `grade-${V138240_GRADE_CLASS[String(x.grade||'Phàm')]||'mundane'}`;}
function v138240EnhanceClass(level=0){const n=Number(level||0);return n>=20?'enhance-max':n>=15?'enhance-3':n>=10?'enhance-2':n>=5?'enhance-1':'enhance-0';}
function v138240QualityShort(quality=''){const q=String(quality||'');if(q.includes('Hoàn'))return'Hoàn Mỹ';if(q.includes('Cực'))return'Cực';if(q.includes('Thượng'))return'Thượng';if(q.includes('Trung'))return'Trung';if(q.includes('Hạ'))return'Hạ';return q||'—';}
function v138245QualityClass(quality=''){const q=v138240QualityShort(quality);return q==='Hoàn Mỹ'?'quality-perfect':q==='Cực'?'quality-extreme':q==='Thượng'?'quality-high':q==='Trung'?'quality-mid':q==='Hạ'?'quality-low':'quality-none';}
function v138245QualityBadge(quality=''){const q=v138240QualityShort(quality);return q==='Hoàn Mỹ'?'M':q==='Cực'?'C':q==='Thượng'?'Th':q==='Trung'?'Tr':q==='Hạ'?'H':'';}
const V138245_GEM_META={metal:['Kim','metal'],wood:['Mộc','wood'],water:['Thủy','water'],fire:['Hỏa','fire'],earth:['Thổ','earth']};
function v138245GemKey(g){const raw=typeof g==='string'?g:String(g?.element||g?.type||g?.attribute||g?.school||g?.name||'');const s=raw.toLocaleLowerCase('vi');if(/kim|metal/.test(s))return'metal';if(/mộc|moc|wood/.test(s))return'wood';if(/thủy|thuy|water/.test(s))return'water';if(/hỏa|hoa|fire/.test(s))return'fire';if(/thổ|tho|earth/.test(s))return'earth';return'unknown';}
function v138245SocketState(x={}){const raw=Array.isArray(x.gemSockets)?x.gemSockets:Array.isArray(x.socketSlots)?x.socketSlots:Array.isArray(x.sockets)?x.sockets:Array.isArray(x.gems)?x.gems:[];let total=Number(x.socketCount??x.gemSocketCount??x.maxSockets??0);if(!total&&raw.length)total=raw.length;total=Math.max(0,Math.min(4,Math.floor(total||0)));if(!total)return{total:0,filled:0,slots:[]};const slots=Array.from({length:total},(_,i)=>{const entry=raw[i]??null;const gem=entry?.gem??entry?.socketedGem??entry?.item??entry;const empty=gem==null||gem===false||gem===''||gem?.empty===true;const key=empty?'empty':v138245GemKey(gem);return{key,label:key==='empty'?'Ô trống':(V138245_GEM_META[key]?.[0]||'Ngọc'),filled:key!=='empty'};});return{total,filled:slots.filter(s=>s.filled).length,slots};}
function v138245SocketOverlay(x,mode='grid'){const st=v138245SocketState(x);if(!st.total)return'';return `<span class="v138245-sockets ${esc(mode)}" aria-label="Khảm ${num(st.filled)}/${num(st.total)}">${st.slots.map(s=>`<i class="socket ${esc(s.key)}" title="${esc(s.label)}"></i>`).join('')}</span>`;}
function v138245SocketDetail(x){const st=v138245SocketState(x);if(!st.total)return'';return `<section class="v138245-socket-detail"><header><span>KHẢM NGỌC</span><b>${num(st.filled)}/${num(st.total)}</b></header><div>${st.slots.map((s,i)=>`<article class="${esc(s.key)}"><i>${s.filled?'◆':'○'}</i><span>Lỗ ${i+1}</span><b>${esc(s.label)}</b></article>`).join('')}</div></section>`;}
function v138245RarityAura(){return '<span class="v138245-rarity-aura" aria-hidden="true"></span>';}
function v138240SetSummary(sys={}){
  const live=(sys.sets||[]).filter(x=>Number(x.equippedPieces||0)>0).sort((a,b)=>Number(b.equippedPieces||0)-Number(a.equippedPieces||0));
  const top=live[0];
  if(!top)return `<div class="v138240-set-empty v138242-set-card"><i class="v138242-set-emblem">✦</i><div><small>HIỆU ỨNG BỘ ĐANG MẶC</small><strong>Chưa kích hoạt Set</strong><span>Trang Phục Ngũ Hành mở thưởng ở mốc 2 / 4 / 6 món.</span></div><button data-inventory-view="sets">Xem Bộ ›</button></div>`;
  const pieces=Number(top.equippedPieces||0),max=Number(top.maxPieces||6),thresholds=(top.thresholds||top.mechanics||[]).slice(0,3);
  const chipText=t=>v138233PlainSetText(t.summary||t.description||t.name||'').replace(/^\s+|\s+$/g,'').slice(0,54);
  return `<div class="v138240-set-live v138242-set-card"><header><i class="v138242-set-emblem">✦</i><div><small>HIỆU ỨNG BỘ ĐANG MẶC</small><strong>${esc(top.setName||'Ngũ Hành')}</strong></div><b>${num(pieces)}/${num(max)}</b></header><div class="v138240-set-progress"><i style="width:${Math.min(100,pieces/Math.max(1,max)*100)}%"></i><em class="p2">2</em><em class="p4">4</em><em class="p6">6</em></div><div class="v138240-set-thresholds">${thresholds.map(t=>{const on=Number(t.pieces||0)<=pieces;return `<span class="${on?'on':''}"><b>${on?'✓ ':''}${num(t.pieces||0)} món</b><small>${esc(on?chipText(t):'Chưa kích')}</small></span>`;}).join('')}</div><button data-inventory-view="sets">Xem Chi Tiết Bộ <b>›</b></button></div>`;
}
function v138240EquippedOverview(gear=[],sys={}){
  const equipped=gear.filter(x=>x.equipped),slots=sys.slots||[];
  const canonicalPower=Number(model?.character?.coreStats?.power??model?.character?.combatStats?.attack??0);
  const enhanceTotal=equipped.reduce((sum,x)=>sum+Number(x.enhancementLevel||0),0);
  const skin=v1074SelectedVisual('skin')||{};
  const charArt=skin.asset||'/assets/runtime/v138/characters/immortal_swordsman_01/idle.webp';
  const leftIds=new Set(['weapon','head','gloves','bracelet','necklace']);
  const order={weapon:0,head:1,gloves:2,bracelet:3,necklace:4,robe:0,belt:1,boots:2,ring:3,talisman:4};
  const cards=slots.map(slot=>{
    const x=gear.find(g=>g.id===slot.equippedItemId),idx=x?gear.indexOf(x):-1;
    const grade=x?v138240GradeClass(x):'grade-empty',enh=x?v138240EnhanceClass(x.enhancementLevel):'enhance-0';
    const side=leftIds.has(slot.id)?'left':'right',row=order[slot.id]??0;
    const q=x?v138240QualityShort(x.quality):'',qBadge=x?v138245QualityBadge(x.quality):'',qClass=x?v138245QualityClass(x.quality):'quality-none';
    return `<button class="v138241-slot ${side} row-${row} ${grade} ${enh} ${x?'filled':'empty'}" ${x?`data-inventory-select="${esc(x.id)}" data-item-open="item-${idx}"`:`data-open-inventory="gear" data-inventory-slot="${esc(slot.id)}"`} aria-label="${esc(x?`${slot.label}: ${x.name}, ${x.grade}, +${num(x.enhancementLevel||0)}`:`${slot.label}: trống`)}"><span class="v138241-frame">${x?`${v138245RarityAura()}${v13823LazyImg(v1077EquipArt(slot.id,x),x.name)}<b>+${num(x.enhancementLevel||0)}</b>${qBadge?`<i class="${esc(qClass)}" title="${esc(q)}">${esc(qBadge)}</i>`:''}${x.setId?'<s title="Thuộc Set">◆</s>':''}${v138245SocketOverlay(x,'loadout')}`:`<em>${v1077SlotIcon(slot.id)}</em><u>+</u>`}</span><span class="v138241-slot-copy"><strong>${esc(slot.label)}</strong>${x?`<small>${esc(x.grade||'Phàm')}</small>`:'<small>Ô trống</small>'}</span></button>`;
  }).join('');
  return `<section class="v138241-loadout"><header class="v138241-title"><div><small>HÀNH TRANG</small><strong>Trang Bị Đang Mặc</strong></div><button data-inventory-view="sets">Bộ Đồ <b>›</b></button></header><div class="v138241-stage"><div class="v138241-stage-glow"></div><div class="v138241-kpi"><span>CÔNG LỰC</span><strong>${num(canonicalPower,0)}</strong><small>${num(sys.equippedCount??equipped.length)}/${num(sys.canonicalSlotCount??10)} ô · +${num(enhanceTotal,0)}</small></div><div class="v138241-character"><span></span><img src="${esc(charArt)}" alt="Nhân vật đang trang bị"></div>${cards}</div>${v138240SetSummary(sys)}<button class="v138241-open-vault" data-inventory-view="gear"><span><small>ĐỔI · SO SÁNH · TRANG BỊ</small><strong>Mở Kho Trang Bị</strong></span><b>›</b></button><nav class="v138241-tools" aria-label="Công cụ trang bị"><button data-inventory-view="forge"><i>✦</i><span>Cường Hóa</span></button><button data-inventory-view="sets"><i>◇</i><span>Bộ Đồ</span></button><button data-sheet-open="resources"><i>▣</i><span>Vật Phẩm</span></button><button data-sheet-open="artifacts"><i>◈</i><span>Pháp Bảo</span></button></nav></section>`;
}
function v138234ItemDisplayName(x={}){
  let name=String(x.name||'Trang bị').trim();
  const setName=String(x.setName||'').trim();
  if(setName&&name.includes(setName))name=name.replace(setName,'').replace(/[·•|—-]+/g,' ').replace(/\s+/g,' ').trim();
  name=name.replace(/^(Phàm|Linh|Huyền|Địa|Thiên|Tiên|Cực|Phá)\s*[·•-]?\s*/,'').replace(/^(Hạ|Trung|Thượng|Cực)\s*Phẩm\s*/,'').trim();
  const parts=name.split(/\s*[·•|]\s*/).filter(Boolean);return (parts.at(-1)||name||'Trang bị').slice(0,42);
}


/* v1.07.3 — Character Target Composition Pass
   One scene artwork, live HTML/CSS overlays. No screenshot-in-card composition. */
function v1073EquipPreview(slot=''){
  const s=String(slot).toLowerCase();
  if(s.includes('weapon'))return '/assets/v1073/equip-weapon.webp';
  if(s.includes('head'))return '/assets/v1073/equip-head.webp';
  if(s.includes('robe'))return '/assets/v1073/equip-robe.webp';
  if(s.includes('belt'))return '/assets/v1073/equip-belt.webp';
  if(s.includes('glove'))return '/assets/v1073/equip-gloves.webp';
  if(s.includes('boot'))return '/assets/v1073/equip-boots.webp';
  if(s.includes('necklace'))return '/assets/v1073/equip-necklace.webp';
  if(s.includes('ring'))return '/assets/v1073/equip-ring.webp';
  return '/assets/v1073/equip-ring.webp';
}

/* v1.09 cleanup: removed superseded v1.07.3 header renderer */
/* v1.09 cleanup: removed superseded v1.07.3 character renderer */
/* v1.07.4 — Visual Profile + Character Backend Binding
   Character skin/background are independent server-backed preferences.
   Character controls only reflect authoritative snapshot state and invoke real API actions. */
function v1074VisualState(){
  return model?.visuals||{selected:{characterSkinId:'skin.white_immortal',characterBackgroundId:'bg.ink_mountain',selectedExpression:'neutral'},skins:[{id:'skin.white_immortal',name:'Bạch Y Tiên Khách',asset:'/assets/runtime/v138/characters/immortal_swordsman_01/idle.webp',avatar:'/assets/runtime/v138/characters/immortal_swordsman_01/portrait.webp',selected:true}],backgrounds:[{id:'bg.ink_mountain',name:'Tiên Sơn Mặc Cảnh',asset:'/assets/v1074/bg-ink-mountain.webp',selected:true}],expressions:[{id:'neutral',name:'Bình tĩnh',symbol:'—',selected:true}]};
}
function v1074SelectedVisual(kind){
  const visuals=v1074VisualState();
  const list=kind==='skin'?visuals.skins:visuals.backgrounds;
  const selectedId=kind==='skin'?visuals.selected?.characterSkinId:visuals.selected?.characterBackgroundId;
  return list?.find(x=>x.id===selectedId)||list?.[0]||{};
}
function v1074SelectedExpression(){
  const visuals=v1074VisualState();
  const id=visuals.selected?.selectedExpression||'neutral';
  return (visuals.expressions||[]).find(x=>x.id===id)||(visuals.expressions||[])[0]||{id:'neutral',name:'Bình tĩnh',symbol:'—'};
}
function v138ExpressionThumb(expr={},avatar=''){
  const id=expr.id||'neutral',symbol=expr.symbol||'—';
  return expressionPortraitMarkup({expressionId:id,avatar,rig:PLAYER_COMBAT_VISUAL.portraitRig,className:'v138-expression-thumb',badge:symbol,alt:expr.name||id});
}
function v1074AppearanceSheet(){
  const visuals=v1074VisualState();
  const skin=v1074SelectedVisual('skin');
  const avatar=skin.avatar||'/assets/runtime/v138/characters/immortal_swordsman_01/portrait.webp';
  const skins=(visuals.skins||[]).map(x=>`<button class="v1074-visual-choice ${x.selected?'selected':''}" data-visual-skin="${esc(x.id)}" ${x.unlocked===false?'disabled':''}><span class="v1074-skin-thumb"><img src="${esc(x.asset)}" alt=""></span><b>${esc(x.name)}</b><small>${x.selected?'Đang dùng':x.unlocked===false?'Chưa mở':'Chọn skin'}</small></button>`).join('');
  const expressions=(visuals.expressions||[]).map(x=>`<button class="v138-expression-choice ${x.selected?'selected':''}" data-visual-expression="${esc(x.id)}" ${x.unlocked===false?'disabled':''}>${v138ExpressionThumb(x,x.portrait||avatar)}<b>${esc(x.name)}</b><small>${x.selected?'Đang dùng':esc(x.description||'Biểu cảm tĩnh')}</small></button>`).join('');
  const backgrounds=(visuals.backgrounds||[]).map(x=>`<button class="v1074-visual-choice background ${x.selected?'selected':''}" data-visual-background="${esc(x.id)}" ${x.unlocked===false?'disabled':''}><span class="v1074-bg-thumb" style="background-image:url('${esc(x.asset)}')"></span><b>${esc(x.name)}</b><small>${x.selected?'Đang dùng':x.unlocked===false?'Chưa mở':'Chọn cảnh'}</small></button>`).join('');
  return `<div class="v1074-appearance"><div class="v106-section-title">Skin nhân vật</div><div class="v1074-choice-grid">${skins}</div><div class="v106-section-title v138-expression-title">Biểu cảm tĩnh <small>Portrait · Hồ sơ · PvP card</small></div><div class="v138-expression-grid">${expressions}</div><div class="v106-section-title">Bối cảnh</div><div class="v1074-choice-grid">${backgrounds}</div><div class="footer-note">Biểu cảm dùng Face Rig tái sử dụng: đổi tóc/ngoại trang sau này không cần render lại 16 mặt. Combat body vẫn dùng pose tác giả cố định.</div></div>`;
}

/* v1.09 cleanup: removed superseded v1.07.4 header renderer */
/* v1.09 cleanup: removed superseded v1.07.4 character renderer */
/* v1.07.4 character sheet polish r1 — compact, game-like, backend-bound panels. */



/* Character standard R2 — typography, uncropped skin layer, compact feature hierarchy. */
function v1076SceneToolIcon(kind='appearance'){
  if(kind==='appearance') return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4c1.5 1 2.5 1.4 4 1.4S14.5 5 16 4l2.4 3.2-2.2 1.6V20H7.8V8.8L5.6 7.2 8 4Z"/><path d="M10 5.2V8h4V5.2"/></svg>`;
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M6.5 20c.8-4 2.6-6 5.5-6s4.7 2 5.5 6"/><path d="M4 4h3M17 4h3M4 20h3M17 20h3"/></svg>`;
}

/* v1.09 cleanup: removed superseded v1.07.6 header renderer */
/* v1.09 cleanup: removed superseded v1.07.6 character renderer */
/* v1.07.5 — Character Complete Pass
   Target-locked composition: 10 real equipment slots, uncropped skin,
   structured backend origin data, compact feature hierarchy, no fake controls. */
const V1077_EQUIPMENT_SLOTS=[
  ['weapon','Vũ Khí'],['head','Đầu'],['robe','Y Phục'],['belt','Đai'],['bracelet','Vòng'],
  ['gloves','Hộ Thủ'],['boots','Giày'],['necklace','Ngọc Bội'],['ring','Nhẫn'],['talisman','Hộ Phù'],
];
const V1077_ELEMENT_META={
  Metal:['Kim','kim'],Wood:['Mộc','moc'],Water:['Thủy','thuy'],Fire:['Hỏa','hoa'],Earth:['Thổ','tho'],
  Lightning:['Lôi','loi'],Ice:['Băng','bang'],Wind:['Phong','phong'],Yin:['Âm','am'],Yang:['Dương','duong']
};
function v1077SlotIcon(slot=''){
  const s=String(slot).toLowerCase();
  if(s==='bracelet')return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><path d="M8 5.5 10 8m6-2.5L14 8M8 18.5 10 16m6 2.5L14 16"/></svg>`;
  if(s==='talisman')return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v18l-5-3-5 3V3Z"/><path d="M10 8h4m-4 4h4"/></svg>`;
  return v1071SlotIcon(slot);
}
function v1077EquipArt(slot='',item=null){
  const custom=userAssetPath('equipment',item?.id||'',slot);
  if(custom)return custom;
  const s=String(slot).toLowerCase();
  if(s==='bracelet')return '/assets/v107/item-16.webp';
  if(s==='talisman')return '/assets/v107/item-18.webp';
  return v1073EquipPreview(slot);
}
function v1077ElementIcon(element=''){
  const meta=V1077_ELEMENT_META[element]||[localizeUiTerm(element),String(element).toLowerCase()];
  const symbol={Metal:'◆',Wood:'✤',Water:'◉',Fire:'▲',Earth:'⬟',Lightning:'ϟ',Ice:'❄',Wind:'≈',Yin:'☾',Yang:'☀'}[element]||'•';
  return `<span class="v1077-element-icon ${esc(meta[1])}">${symbol}</span>`;
}
function v1077OriginSheet(c){
  const detail=c.originDetails||{},pot=c.potential||{},sr=model.spiritualRoot||{},combat=sr.combat||{};
  const rowHtml=rows=>rows.map(([k,v])=>`<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');
  const permanentRows=[['Linh Căn',`${sr.grade?.name||'Phàm Căn'} · Lv${num(sr.level||1)}`],['Huyết Mạch',detail.bloodline?.band==='NONE'?'Vô Huyết Mạch':`${detail.bloodline?.name||'Vô Huyết Mạch'} · ${detail.bloodline?.grade||''} ${num(detail.bloodline?.purity||0)}%`],['Thể Chất',detail.physique?.band==='NONE'?'Phàm Thể':`${detail.physique?.name||'Phàm Thể'} · ${detail.physique?.stage||''}`]];
  const lifeRows=[['Thiên Tư',detail.talent?.band==='NONE'?'Vô Thiên Tư':detail.talent?.name||'Vô Thiên Tư'],['Mệnh Cách',detail.fate?`${detail.fate.name} · ${detail.fate.polarity}`:'Không rõ'],['Xuất Thân',detail.background?.name||'Không rõ']];
  return `<div class="v1077-root-card"><div class="v1077-root-title"><div><span class="v1077-element-icon">∞</span></div><div><span>LINH CĂN V145 · GIỮ QUA LUÂN HỒI</span><strong>${esc(sr.grade?.name||'Phàm Căn')} · Lv${num(sr.level||1)}</strong><small>Tu Vi +${num(sr.cultivationBonusPct||0,1)}% · Công +${num(combat.attackPct||0,1)}% · HP +${num(combat.maxHpPct||0,1)}% · Phòng +${num(combat.defensePct||0,1)}%</small></div></div><div class="v1077-sheet-shortcuts"><button data-tab-jump="roots"><b>Mở Linh Căn</b><span>Căn Mạch · Căn Ngộ · Bản Nguyên</span></button></div></div><div class="v2324-origin-group permanent"><header><span>TIẾN TRÌNH VĨNH VIỄN</span><b>Không random lại</b></header><div class="v1077-origin-list">${rowHtml(permanentRows)}</div></div><div class="v2324-origin-group life"><header><span>THUỘC TÍNH ĐỜI NÀY</span><b>Đổi khi Luân Hồi</b></header><div class="v1077-origin-list">${rowHtml(lifeRows)}</div></div><div class="v1077-sheet-shortcuts"><button data-tab-jump="path"><b>Định Đạo</b><span>Đạo Tính · Chủ/Phụ Bản Đạo</span></button><button data-sheet-open="blood"><b>Huyết Mạch</b><span>Vĩnh viễn · Độ thuần & thăng phẩm</span></button><button data-sheet-open="body"><b>Thể Chất</b><span>Vĩnh viễn · Tiến cảnh thân thể</span></button><button data-sheet-open="potential"><b>Tiềm Năng</b><span>Còn ${num(pot.unspent||0)} điểm</span></button></div>`;
}
function v1077BloodSheet(c){
  const detail=c.originDetails||{},op=c.originProgression||{},br=op.bloodline||{},rr=op.resources||{},native=detail.bloodline||{};
  const purity=Math.max(0,Math.min(100,Number(br.purity??native.purity??0)));
  const grade=br.grade||native.grade||'Phàm';
  const has=Boolean(br.available);
  const catalog=(c.bloodlineCatalog||[]).map(x=>`<option value="${esc(x.id)}">${esc(x.name)} · ${esc(x.tierLabel)}</option>`).join('');
  return `<div class="v1077-blood-hero"><div class="v1077-blood-orb"></div><div><span>Huyết Mạch</span><strong>${esc(br.name||native.name||'Vô Huyết Mạch')}</strong><small>${has?`${esc(grade)} · Độ Thuần ${num(purity)}%`:'Chưa thức tỉnh Huyết Mạch đặc biệt'}</small></div></div>${has?`<div class="v1077-purity"><div><span>Độ Thuần</span><b>${num(purity)} / 100</b></div><div class="v1077-progress"><i style="width:${purity}%"></i></div></div>`:''}<div class="v1077-resource-pair"><div><span>Huyết Tinh</span><b>${num(rr.bloodlineEssence||0)}</b></div><div><span>Hộ Huyết</span><b>${num(rr.protection||0)}</b></div></div>${has?`<div class="v1077-three-actions"><button data-blood-purify ${!br.canPurify?'disabled':''}>Nuôi Độ Thuần</button><button class="gold" data-blood-advance ${!br.canAdvance?'disabled':''}>Thăng Huyết Mạch</button><button data-blood-advance-protected ${!br.canAdvance?'disabled':''}>Thăng + Bảo Hộ</button></div>`:''}<div class="v1077-swap-box"><label>${has?'Hoán Huyết':'Tạo Huyết'}</label><div><select name="bloodlineTarget">${catalog}</select><button class="danger" ${has?'data-blood-swap':'data-blood-implant'}>${has?'Hoán Huyết':'Tạo Huyết'}</button></div><small>${has?'Hoán Huyết thay đổi Huyết Mạch vĩnh viễn; Độ Thuần về 0% sau khi đổi.':'Tạo Huyết từ Vô Huyết tốn nhiều tài nguyên hơn.'}</small></div>`;
}
function v1077BodySheet(c){
  const detail=c.originDetails||{},op=c.originProgression||{},pr=op.physique||{},rr=op.resources||{},native=detail.physique||{};
  const stages=['Sơ Tỉnh','Nhập Môn','Tiểu Thành','Đại Thành','Viên Mãn'];
  const current=pr.stage||native.stage||'Phàm Thể',idx=stages.indexOf(current);
  const track=stages.map((x,i)=>`<div class="${i<idx?'done':''} ${i===idx?'current':''}"><i></i><span>${x}</span></div>`).join('');
  return `<div class="v1077-body-hero"><div class="v1077-body-aura">✦</div><div><span>Thể Chất</span><strong>${esc(pr.name||native.name||'Phàm Thể')}</strong><small>${esc(current)}</small></div></div><div class="v1077-stage-track">${track}</div><div class="v1077-resource-pair"><div><span>Thể Phách Tinh Hoa</span><b>${num(rr.bodyEssence||0)}</b></div><div><span>Cảnh kế</span><b>${esc(pr.nextStage||'—')}</b></div></div>${pr.available?`<div class="v1077-cost-row"><span>Yêu cầu</span><b>${pr.nextStage?`${num(pr.cost||0)} tinh hoa · cảnh giới ${num(pr.nextRealmGate||0)}`:'Đã Viên Mãn'}</b></div><button class="v1077-primary-wide" data-physique-advance ${!pr.canAdvance?'disabled':''}>Tiến Thể Chất</button>`:`<div class="v1077-empty-note">Chưa thức tỉnh Thể Chất đặc biệt để tiến cảnh.</div>`}`;
}
function v1077PotentialSheet(c){
  const pot=c.potential||{unspent:0,allocations:{},definitions:[]};
  return `<div class="v1077-potential-head"><span>Điểm còn lại</span><b>${num(pot.unspent||0)}</b></div><div class="v1077-potential-grid">${(pot.definitions||[]).map(d=>`<div class="v1077-potential-card"><div><strong>${esc(d.name)}</strong><em>${num(pot.allocations?.[d.id]||0)}</em></div><span>${esc(d.description)}</span><small>${(d.perPoint||[]).map(esc).join(' · ')}</small><div><button data-potential="${esc(d.id)}" data-points="1" ${pot.unspent<1?'disabled':''}>+1</button><button data-potential="${esc(d.id)}" data-points="5" ${pot.unspent<5?'disabled':''}>+5</button></div></div>`).join('')}</div>`;
}
function v1077ManualSheet(c,o){
  const tm=c.techniqueManuals||{},known=tm.known||[],equipped=tm.equipped||{},byId=new Map(known.map(x=>[x.id,x]));
  const slotDefs=[['inner','Tâm Pháp'],['art','Võ Học'],['movement','Thân Pháp'],['secret','Bí Thuật']];
  const slots=slotDefs.map(([id,label])=>{const x=byId.get(equipped[id]);return `<div class="v1077-tech-slot ${x?'filled':''}"><span>${esc(label)}</span><b>${x?esc(x.name):'Chưa trang bị'}</b><small>${x?`${esc(x.gradeLabel)} · ${esc(x.stage)} · ${num(x.mastery,1)}%`:'Ô Bí Thuật trống'}</small></div>`;}).join('');
  const rows=known.map((x,i)=>`<div class="v1077-tech-row"><img src="${v107SkillArt(x,i)}" alt=""><div><strong>${esc(x.name)}</strong><span>${esc(x.slotLabel)} · ${esc(x.gradeLabel)} · ${esc(x.stage)} · ${num(x.mastery,1)}%</span></div><div><button data-tech-equip="${esc(x.id)}" ${x.equipped||o.life.realmOrder<(x.requiredRealmOrder||0)?'disabled':''}>${x.equipped?'Đang dùng':'Trang bị'}</button><button data-tech-study="${esc(x.id)}" data-tech-batches="1" ${Number(tm.fragments||0)<1?'disabled':''}>Tham ngộ</button></div></div>`).join('');
  return `<div class="v1077-tech-head"><span>Bí Thuật Tàn Trang</span><b>${num(tm.fragments||0)}</b></div><div class="v1077-tech-slots">${slots}</div><div class="v1077-section-line"><b>Bí Thuật đã lĩnh ngộ</b><span>${known.length}</span></div><div class="v1077-tech-list">${rows||'<div class="v1077-empty-note">Chưa lĩnh ngộ Bí Thuật/Võ Học.</div>'}</div>`;
}
function v1077EquipmentSheet(x,label){
  const maxed=Number(x.enhancementLevel||0)>=Number(x.maxEnhancementLevel??20),protection=resourceQuantity('resource.enhancement_protection_talisman');
  const stats=Object.entries(x.stats||{}).map(([k,v])=>`<div><span>${esc(statName(k))}</span><b>${Number(v)>=0?'+':''}${num(v,2)}</b></div>`).join('');
  return `<div class="v1077-eq-detail"><div class="v1077-eq-preview ${v107TierClass(x)}"><img src="${v1077EquipArt(x.slot,x)}" alt=""><b>+${num(x.enhancementLevel||0)}</b></div><div class="v1077-eq-meta"><span>${esc(label)} · ${esc(x.grade||x.quality||x.tier||'Phàm')}</span><strong>${esc(x.name)}</strong><small>${esc(x.setName||x.role||'Trang bị')}</small></div></div><div class="v1077-eq-stats">${stats||'<div><span>Chỉ số</span><b>—</b></div>'}</div><div class="v1077-eq-actions"><button data-open-inventory="gear" data-inventory-slot="${esc(x.slot)}">Đổi Trang Bị</button>${maxed?'':`<button class="gold" data-enhance="${esc(x.id)}">Cường Hóa · ${num(x.nextEnhanceChancePct,1)}%</button><button data-enhance-protected="${esc(x.id)}" ${protection<1?'disabled':''}>Dùng Bùa (${num(protection)})</button>`}</div>`;
}
/* v1.09 cleanup: removed superseded v1.07.5 header renderer */
/* v1.09 cleanup: removed superseded v1.07.5 character renderer */
/* v1.07.6 — Character target lock
   Backend-owned equipment contract + compact hierarchy + dedicated true-stat sheet. */
function v1078MajorRealmName(name=''){
  const text=String(name||'').trim();
  const m=text.match(/^(.+?)\s+tầng\s+(.+)$/i);
  return m?m[1]:text;
}
function v1078RealmStage(name=''){
  const text=String(name||'').trim();
  const m=text.match(/^(.+?)\s+tầng\s+(.+)$/i);
  return m?`Tầng ${m[2]}`:'';
}
function v1078EquipmentSlots(c){
  const fromBackend=Array.isArray(c?.equipmentSlots)?c.equipmentSlots:[];
  if(fromBackend.length===10)return fromBackend.map(x=>[x.id,x.label]);
  return V1077_EQUIPMENT_SLOTS;
}
function v1078Pct(v){return `${num(Math.max(0,Number(v||0)),1)}%`;}
function v1078StatsSheet(c,o){
  const st=c.combatStats||{},core=c.coreStats||{},sys=model?.equipmentSystem||{};
  const affinityPct=v=>{
    if(v&&typeof v==='object')return Number(v.pct??v.value??v.multiplier??0);
    const n=Number(v||0); return n<=1?n*100:n;
  };
  const resistancePct=v=>{const n=Number(v||0);return Math.abs(n)<=1?n*100:n;};
  const elementRows=(obj={},formatter=affinityPct)=>Object.entries(obj).map(([k,v])=>[k,formatter(v)]).filter(([,v])=>Number.isFinite(v)&&Math.abs(v)>.0001).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));
  const affinities=elementRows(st.elementalAffinities||{}),resists=elementRows(st.elementalResistancesPct||{},resistancePct);
  const skillText=x=>`${x?.description||''} ${Array.isArray(x?.mechanics)?x.mechanics.join(' '):String(x?.mechanics||'')} ${(x?.tags||[]).join(' ')}`.toLowerCase();
  const breakSkills=(c.knownSkills||[]).filter(x=>x.active&&(/phá thế|stability|break/.test(skillText(x)))).length;
  const activeSetMechanics=(sys.sets||[]).flatMap(x=>(x.thresholds||[]).filter(t=>t.active));
  const breakSetMechanics=activeSetMechanics.filter(x=>/phá thế|stability|break/i.test(`${x.name||''} ${x.summary||''}`)).length;
  const critDamage=Number(st.critDamagePct??((Number(st.critPowerPerLayer??.5)+1)*100));
  const topAffinity=affinities[0],topResist=resists[0];
  const groups=[
    ['Tấn Công','attack',[['Công Lực',num(core.power??st.attack??0)],['Hội Tâm',v1078Pct(st.heartChancePct)],['Xuyên Phòng',v1078Pct(st.armorPenPct)]]],
    ['Sinh Tồn','survival',[['Khí Huyết',num(st.maxHp||0)],['Giảm Thương',v1078Pct(st.damageReductionPct)],['Né Tránh',v1078Pct(st.dodgeChancePct)]]],
    ['Phá Thế','break',[['Kỹ năng đang dùng',`${breakSkills}`],['Set đang kích hoạt',`${breakSetMechanics}`],['Cách tính','Theo skill/effect']]],
    ['Bạo Kích','crit',(()=>{const raw=Math.max(0,Number(st.critChancePct||0)),guaranteed=Math.floor(raw/100),next=raw-guaranteed*100,names=['—','Bạo Kích','Trọng Bạo','Cực Bạo','Thiên Bạo','Đạo Bạo','Hỗn Nguyên Bạo','Vô Cực Bạo'];const layerName=n=>n<=0?'Chưa bảo đảm':(names[Math.min(n,names.length-1)]||(n>7?`Vô Cực Bạo +${n-7}`:'Bạo Kích'));const rows=[['Bạo Kích tổng',v1078Pct(raw)],['Tầng bảo đảm',guaranteed>0?`${layerName(guaranteed)} · ${guaranteed} tầng`:'Chưa có'],['Tầng kế tiếp',guaranteed>0||next>0?`${num(next,1)}% → ${layerName(guaranteed+1)}`:'—'],['Bạo Thương / tầng',v1078Pct(critDamage)],['Kháng khống chế',v1078Pct(st.controlDurationReductionPct)]];return rows;})()],
    ['Ngũ Hành','element',[['Hiệu lực mạnh nhất',topAffinity?`${(V1077_ELEMENT_META[topAffinity[0]]||[localizeUiTerm(topAffinity[0])])[0]} ${num(topAffinity[1],1)}%`:'Chưa có'],['Kháng mạnh nhất',topResist?`${(V1077_ELEMENT_META[topResist[0]]||[localizeUiTerm(topResist[0])])[0]} ${num(topResist[1],1)}%`:'Chưa có'],['Hệ đang có',`${affinities.length}`]]],
    ['Bản Đạo','dao',[['Chân Nguyên',num(st.maxSpirit||0)],['Tốc Độ Hành Động',`${num((st.actionSpeed||1)*100,0)}%`],['Hiệu Suất Chân Nguyên',v1078Pct(st.spiritEfficiencyPct)]]],
  ];
  const groupHtml=groups.map(([title,key,rows])=>`<section class="v13819-detail-group"><header><b>${esc(title)}</b><button type="button" data-stat-help="${esc(key)}" aria-label="Giải thích ${esc(title)}">?</button></header>${rows.map(([k,v])=>`<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</section>`).join('');
  const allElements=[...new Set([...affinities.map(x=>x[0]),...resists.map(x=>x[0])])];
  const elementHtml=allElements.length?`<section class="v13819-element-detail"><header><b>Ngũ Hành chi tiết</b><span>Hiệu lực / Kháng</span></header>${allElements.map(k=>{const a=affinities.find(x=>x[0]===k)?.[1]||0,r=resists.find(x=>x[0]===k)?.[1]||0;return `<div><span>${esc((V1077_ELEMENT_META[k]||[localizeUiTerm(k)])[0])}</span><strong>${num(a,1)}%</strong><em>${num(r,1)}%</em></div>`;}).join('')}</section>`:'';
  return `<div class="v13819-detail-core"><div><span>Công Lực</span><strong>${num(core.power??st.attack??0)}</strong></div><div><span>Thể Phách</span><strong>${num(core.body??0)}</strong></div><div><span>Phòng Ngự</span><strong>${num(core.defense??st.defense??0)}</strong></div></div><p class="v13819-detail-note">Ba chỉ số lõi cho biết nền tảng nhân vật; các nhóm bên dưới giúp bạn nhìn rõ tấn công, sinh tồn và hướng build. Phá Thế được tổng hợp từ kỹ năng và hiệu ứng đang thật sự hoạt động.</p><div class="v13819-detail-grid">${groupHtml}</div>${elementHtml}`;
}
function v13819AffinityValue(v){
  if(v&&typeof v==='object')return Number(v.pct??v.value??v.multiplier??0);
  const n=Number(v||0);return Math.abs(n)<=1?n*100:n;
}
function v13819BreakSummary(c={},sys={}){
  const text=x=>`${x?.description||''} ${Array.isArray(x?.mechanics)?x.mechanics.join(' '):String(x?.mechanics||'')} ${(x?.tags||[]).join(' ')}`.toLowerCase();
  const skillCount=(c.knownSkills||[]).filter(x=>x.active&&(/phá thế|stability|break/.test(text(x)))).length;
  const setCount=(sys.sets||[]).flatMap(x=>(x.thresholds||[]).filter(t=>t.active)).filter(t=>/phá thế|stability|break/i.test(`${t.name||''} ${t.summary||''}`)).length;
  const manualCount=(model?.specialization?.sectManual?.manual?.chapters||[]).filter(x=>x.unlocked&&/phá thế|stability|break/i.test(`${x.name||''} ${x.summary||''} ${x.description||''}`)).length;
  return {skillCount,setCount,manualCount};
}
function v13819SetCategorySummary(sys={},category='attire'){
  const list=(sys.sets||[]).filter(x=>x.category===category).sort((a,b)=>Number(b.equippedPieces||0)-Number(a.equippedPieces||0));
  const best=list[0];
  const group=sys.groups?.[category];
  return best?{name:best.setName,pieces:Number(best.equippedPieces||0),max:Number(best.maxPieces||group?.slotCount||0),active:(best.thresholds||[]).filter(x=>x.active).length}:{name:group?.label||(category==='attire'?'Trang Phục':'Phụ Kiện'),pieces:0,max:Number(group?.slotCount||0),active:0};
}
const V13819_STAT_HELP={
  attack:'Tấn Công gom các chỉ số giúp hit trực tiếp gây hiệu quả tốt hơn. Công Lực là trục lõi; Hội Tâm và Xuyên Giáp có consumer riêng trong combat.',
  survival:'Sinh Tồn cho biết lượng chịu đòn thật: Khí Huyết, Giảm Thương và Né. Phòng Ngự lõi được tách riêng ở hàng trên.',
  break:'Phá Thế đến từ kỹ năng và hiệu ứng Set phù hợp. Hãy xem số kỹ năng có Phá Thế và các bonus đang hoạt động thay vì một tỷ lệ tổng giả định.',
  crit:'Bạo Kích gồm Tỷ Lệ và Bạo Thương. Tỷ Lệ quyết định khả năng chí mạng; Bạo Thương quyết định mức tăng sát thương khi chí mạng.',
  element:'Ngũ Hành hiển thị hiệu lực và kháng thuộc tính thật từ combat entity. Không cộng mọi Hành thành một điểm tổng.',
  dao:'Bản Đạo tập trung Chân Nguyên, Tốc Độ Hành Động và Hiệu Suất Chân Nguyên — các biến trực tiếp tác động vòng thi triển kỹ năng.',
  power:'Công Lực là nền tảng cho sức tấn công và một số hiệu quả kỹ năng. Tăng Công Lực giúp nhân vật gây sát thương mạnh hơn.',
  body:'Thể Phách là nền tảng sinh tồn, chủ yếu giúp tăng Khí Huyết và sức bền của nhân vật.',
  defense:'Phòng Ngự là thuộc tính lõi giảm sát thương thông qua đối kháng Công Lực–Phòng Ngự.',
};

function v1078MoreSheet(){
  const c=model?.character||{},pot=c.potential||{};
  const items=[
    `<button data-tab-jump="guide">${navIcon('guide')}<span><b>Tu Tiên Chỉ Nam</b><small>Hôm nay · Hệ thống · Đường tu · Build</small></span></button>`,
    `<button data-tab-jump="overview">${navIcon('overview')}<span><b>Tổng Quan</b><small>Toàn cảnh đời hiện tại</small></span></button>`,
    `<button data-tab-jump="locations">${navIcon('locations')}<span><b>Bản Đồ</b><small>Du hành & khám phá</small></span></button>`,
    `<button data-tab-jump="journal">${navIcon('journal')}<span><b>Nhật Ký</b><small>Dấu mốc đời & thế giới</small></span></button>`,
    `<button data-tab-jump="power">${navIcon('power')}<span><b>Chiến Lực</b><small>Nguồn sức mạnh thật</small></span></button>`,
    tabUnlocked('soul')?`<button data-tab-jump="soul">${navIcon('soul')}<span><b>Thần Hồn</b><small>Phân Thân & tải</small></span></button>`:'',
    `<button data-tab-jump="faction">${navIcon('faction')}<span><b>Tông Môn</b><small>Thế lực & truyền thừa</small></span></button>`,
    `<button data-tab-jump="social">${navIcon('social')}<span><b>Nhân Duyên</b><small>NPC & quan hệ</small></span></button>`,
    tabUnlocked('dao')?`<button data-tab-jump="dao">${navIcon('dao')}<span><b>Đạo Ý</b><small>Đạo Vực Hóa Thần</small></span></button>`:'',
    `<button data-tab-jump="roots">${navIcon('roots')}<span><b>Linh Căn</b><small>Căn nguyên & Ngũ Hành</small></span></button>`,
    `<button data-tab-jump="character">${navIcon('character')}<span><b>Nhân Vật</b><small>Tiềm Năng còn ${num(pot.unspent||0)} điểm</small></span></button>`,
    tabUnlocked('build')?`<button data-tab-jump="build">${navIcon('build')}<span><b>Phối Đồ</b><small>Trang bị & preset</small></span></button>`:'',
    tabUnlocked('combat')?`<button data-tab-jump="combat">${navIcon('combat')}<span><b>Thủ Lĩnh</b><small>Boss & chiến báo</small></span></button>`:'',
    tabUnlocked('pvp')?`<button data-tab-jump="pvp">${navIcon('pvp')}<span><b>Đấu Pháp</b><small>Async PvP · Rating</small></span></button>`:'',
    tabUnlocked('automation')?`<button data-tab-jump="automation">${navIcon('automation')}<span><b>Tự Động</b><small>Luật treo máy</small></span></button>`:'',
    tabUnlocked('path')?`<button data-tab-jump="path">${navIcon('path')}<span><b>Định Đạo</b><small>Đạo Tính · Chủ Đạo</small></span></button>`:'',
    tabUnlocked('economy')?`<button data-tab-jump="economy">${navIcon('economy')}<span><b>Kinh Tế</b><small>Ngọc · Linh Thạch · Phường Thị</small></span></button>`:'',
    tabUnlocked('collection')?`<button data-tab-jump="collection">${navIcon('collection')}<span><b>Vạn Tượng</b><small>Gacha & bộ sưu tập</small></span></button>`:'',
    tabUnlocked('reincarnation')?`<button data-tab-jump="reincarnation">${navIcon('reincarnation')}<span><b>Luân Hồi</b><small>Đời sau & di sản</small></span></button>`:'',
    tabUnlocked('myriadLives')?`<button data-tab-jump="myriadLives">${navIcon('reincarnation')}<span><b>Vạn Thế</b><small>So sánh các đời</small></span></button>`:'',
    DEV_MODE?`<button data-tab-jump="devlab">${navIcon('devlab')}<span><b>DEV Lab</b><small>Kiểm thử nội bộ</small></span></button>`:'',
  ].filter(Boolean).join('');
  return v106Sheet('more','Tiện Ích',`<div class="v1078-more-grid">${items}</div>`);
}
v106MoreSheet=v1078MoreSheet;

/* v1.07.8 — Character final lock helpers */
function v1084CharacterSheetTabs(active='origin'){
  const tabs=[['origin','Căn Nguyên'],['blood','Huyết Mạch'],['body','Thể Chất'],['manual','Công Pháp']];
  return `<nav class="v1084-sheet-tabs" aria-label="Hệ nhân vật">${tabs.map(([id,label])=>`<button type="button" class="${id===active?'active':''}" data-sheet-open="${id}">${label}</button>`).join('')}</nav>`;
}
function v1084OriginSheet(c){return v1084CharacterSheetTabs('origin')+v1077OriginSheet(c);}
function v1084BloodSheet(c){return v1084CharacterSheetTabs('blood')+v1077BloodSheet(c);}
function v1084BodySheet(c){return v1084CharacterSheetTabs('body')+v1077BodySheet(c);}
function v1084ManualSheet(c,o){return v1084CharacterSheetTabs('manual')+v1077ManualSheet(c,o);}

let systemQuickMenuHtmlV129='';
function v1083RenderSystemQuickMenu(){
  const host=$('#systemQuickMenu');
  if(!host||!model)return;
  const pot=model.character?.potential||{unspent:model.shell?.potentialUnspent||0};
  const items=[
    ['guide','Tu Tiên Chỉ Nam',navIcon('guide'),'Hôm nay · Hệ thống · Đường tu · Build'],
    ['overview','Tổng Quan',navIcon('overview'),'Toàn cảnh đời hiện tại'],
    ['locations','Bản Đồ',navIcon('locations'),'Du hành & khám phá'],
    ['journal','Nhật Ký',navIcon('journal'),'Dấu mốc đời & thế giới'],
    ['power','Chiến Lực',navIcon('power'),'Nguồn sức mạnh thật'],
    ['soul','Thần Hồn',navIcon('soul'),'Phân Thân & tải'],
    ['faction','Tông Môn',navIcon('faction'),'Thế lực & truyền thừa'],
    ['social','Nhân Duyên',navIcon('social'),'NPC & quan hệ'],
    ['dao','Đạo Ý',navIcon('dao'),'Đạo Vực Hóa Thần'],
    ['path','Định Đạo',navIcon('path'),'Đạo Tính · Bản Đạo'],
    ['build','Phối Đồ',navIcon('build'),'Trang bị & preset'],
    ['combat','Thủ Lĩnh',navIcon('combat'),'Boss & chiến báo'],
    ['pvp','Đấu Pháp',navIcon('pvp'),'Async PvP · Rating'],
    ['automation','Tự Động',navIcon('automation'),'Luật treo máy'],
    ['economy','Kinh Tế',navIcon('economy'),'Ngọc · Linh Thạch · Phường Thị'],
    ['collection','Vạn Tượng',navIcon('collection'),'Gacha & bộ sưu tập'],
    ['reincarnation','Luân Hồi',navIcon('reincarnation'),'Đời sau & di sản'],
    ['myriadLives','Vạn Thế',navIcon('reincarnation'),'Hồ sơ & so sánh các đời'],
  ].filter(([id])=>tabUnlocked(id));
  const nextHtml=`<div class="system-quick-title">Tiện ích</div><div class="system-quick-grid">${items.map(([id,label,icon,sub])=>`<button type="button" data-system-tab="${id}">${icon}<span><b>${label}</b><small>${sub}</small></span></button>`).join('')}<button type="button" data-system-tab="character">${navIcon('character')}<span><b>Nhân Vật</b><small>Tiềm Năng còn ${num(pot.unspent||0)} điểm</small></span></button></div>`;
  if(nextHtml!==systemQuickMenuHtmlV129){host.innerHTML=nextHtml;systemQuickMenuHtmlV129=nextHtml;}
}

let playerHeaderHtmlV129='';
renderHeader=function(){
  if(!model)return;
  const o=model.overview,stones=resourceQuantity('resource.spirit_stone'),cp=model.shell?.reincarnationCp??model.reincarnation?.cp??0,canonicalPower=Number(model.shell?.canonicalPower??model.character?.coreStats?.power??model.character?.combatStats?.attack??0);
  const energy=Number(live?.tuVi??o.cultivation.tuVi??0),target=Math.max(1,Number(o.cultivation.requiredTuVi)||1),cultivationPct=Math.min(100,energy/target*100);
  const skin=v1074SelectedVisual('skin'),expression=v1074SelectedExpression(),avatar=expression.portrait||skin.avatar||visualVariantAsset(skin,'avatar','/assets/runtime/v138/characters/immortal_swordsman_01/portrait.webp');
  const major=v1078MajorRealmName(o.life.realm),stage=v1078RealmStage(o.life.realm);
  const headerPortrait=expressionPortraitMarkup({expressionId:expression.id,avatar,rig:PLAYER_COMBAT_VISUAL.portraitRig,className:'player-seal v1074-avatar v1077-avatar v1078-avatar',alt:'Chân dung nhân vật'});
  const nextHeaderHtml=`${headerPortrait}<div class="player-meta v1077-player-meta v1078-player-meta v1084-player-meta"><strong>${esc(major)} · Đời ${o.life.lifeNumber}</strong><span>${stage?`${esc(stage)} · `:''}Tu Vi ${num(cultivationPct,1)}% · Công Lực ${num(canonicalPower)} · <b data-live-rate>+${num(live?.estimatedCultivationPerCommit??Number(live?.estimatedCultivationPerSecond||0)*Number(live?.commitSeconds||15),0)}</b>/${num(Number(live?.commitSeconds||15),0)}s</span><i class="v1084-header-progress"><em style="width:${cultivationPct}%"></em></i></div><div class="header-resources v1077-header-resources v1078-header-resources"><span class="resource-chip" title="Linh Thạch"><img src="/assets/v1073/resource-stone.webp" alt=""><b>${num(stones,0)}</b></span><span class="resource-chip" title="Điểm Luân Hồi"><img src="/assets/v1073/resource-cp.webp" alt=""><b>${num(cp)}</b></span></div>`;
  if(nextHeaderHtml!==playerHeaderHtmlV129){$('#playerHeader').innerHTML=nextHeaderHtml;playerHeaderHtmlV129=nextHeaderHtml;}
  const pendingEvents=(model.flow?.actions||[]).filter(a=>a.command?.type==='contentEvent').length;
  document.querySelector('details.system-menu')?.classList.toggle('has-notify',pendingEvents>0||Number(model.shell?.potentialUnspent??model.character?.potential?.unspent??0)>0);
  v1083RenderSystemQuickMenu();
};

/* v1.38.0-alpha.23.2 — Character Experience Redesign
   Strong presentation rewrite after playtest. Backend/data contracts from Alpha.18–23 stay canonical.
   Main Character screen is now intentionally shallow: identity -> core stats -> quick actions -> build summary -> next useful action. */
function v138232CharacterBodyArt(skin={}){
  // Default Character identity stays aligned with locked Combat Alpha.17.
  if(String(skin?.id||'')==='skin.white_immortal')return PLAYER_COMBAT_VISUAL.poses?.idle||'/assets/runtime/v138/characters/immortal_swordsman_01/idle.webp';
  return visualVariantAsset(skin,'character',PLAYER_COMBAT_VISUAL.poses?.idle||'/assets/runtime/v138/characters/immortal_swordsman_01/idle.webp');
}
function v138232ProfileReady(c={}){
  const br=c.originProgression?.bloodline||{},pr=c.originProgression?.physique||{},tm=c.techniqueManuals||{};
  return Boolean(br.canPurify||br.canAdvance||pr.canAdvance||(Number(tm.fragments||0)>0&&(tm.known||[]).some(x=>Number(x.mastery||0)<100)));
}
function v138232NextAction({potential=0,enhanceable=0,enhanceableItemId='',profileReady=false}={}){
  if(potential>0)return{attr:'data-sheet-open="potential"',kicker:'NÊN LÀM TIẾP',title:`Dùng ${potential} Điểm Tiềm Năng`,detail:'Tăng ngay Công Lực, Thể Phách hoặc Phòng Ngự của đời hiện tại.',cta:'Phân bổ',tone:'potential'};
  if(enhanceable>0)return{attr:`data-open-inventory="forge"${enhanceableItemId?` data-inventory-item="${esc(enhanceableItemId)}"`:''}`,kicker:'NÊN LÀM TIẾP',title:`Có ${enhanceable} món có thể Cường Hóa`,detail:'Kiểm tra tỷ lệ, chi phí và rủi ro trước khi nâng.',cta:'Mở Trang Bị',tone:'enhance'};
  if(profileReady)return{attr:'data-sheet-open="origin"',kicker:'NÊN LÀM TIẾP',title:'Hồ Sơ Tu Hành có tiến triển',detail:'Có Huyết Mạch, Thể Chất hoặc Công Pháp đang chờ xử lý.',cta:'Xem Hồ Sơ',tone:'profile'};
  return{attr:'data-sheet-open="stats"',kicker:'BUILD ĐANG ỔN',title:'Không có việc gấp ở Nhân Vật',detail:'Muốn mạnh hơn nữa? Mở Thuộc Tính để xem nhóm nào đang là điểm mạnh hoặc điểm yếu.',cta:'Xem Thuộc Tính',tone:'stable'};
}

/* v1.38.0-alpha.23.7 — Character Target Production Rebuild
   Target-led production pass. Backend/Master truth remains canonical from Alpha.23.6. */
function v138237ElementSummary(st={}){
  const rows=Object.entries(st.elementalAffinities||{}).map(([key,value])=>{
    const n=v13819AffinityValue(value);
    return {key,label:(V1077_ELEMENT_META[key]||[localizeUiTerm(key)])[0],value:Number.isFinite(n)?n:0};
  }).filter(x=>Math.abs(x.value)>.0001).sort((a,b)=>Math.abs(b.value)-Math.abs(a.value));
  return rows.slice(0,3);
}
function v138237PlaystyleTruth(c={},o={},st={},sys={}){
  const sp=model.specialization||{},realmOrder=Number(o.life?.realmOrder||0);
  const committed=Boolean(sp.daoNatureId&&sp.mainDaoId);
  const daoNature=committed?(sp.daoNatureName||'Đã Định Đạo'):(realmOrder<10?'Chưa Định Đạo':'Chưa chọn Đạo Tính');
  const mainDao=sp.mainDaoName?`${sp.mainDaoName} Chủ`:(realmOrder<10?'Mở tại Trúc Cơ':'Chưa chọn Chủ Đạo');
  const secondaryDao=sp.secondaryDaoName?`${sp.secondaryDaoName} Phụ`:(sp.secondaryUnlocked?'Chưa chọn Phụ Đạo':'Mở tại Nhân Tiên');
  const elements=v138237ElementSummary(st);
  const attire=v13819SetCategorySummary(sys,'attire');
  const manual=sp.sectManual?.active?sp.sectManual.manual:null;
  const breakInfo=v13819BreakSummary(c,sys);
  const setActive=Number(attire.active||0);
  const topElement=elements[0];
  const primary=committed?`${daoNature} · ${mainDao}`:'Chưa Định Đạo';
  const secondary=sp.secondaryDaoName?secondaryDao:(topElement?`${topElement.label} Hành ${num(topElement.value,1)}%`:'Ngũ Hành chưa định hình');
  return {committed,daoNature,mainDao,secondaryDao,elements,attire,manual,breakInfo,setActive,primary,secondary};
}
function v138237PlaystyleCard(truth={}){
  const elementText=(truth.elements||[]).length?truth.elements.map(x=>`${x.label} ${num(x.value,1)}%`).join(' · '):'Chưa có hiệu lực Hành đáng kể';
  return `<section class="v138237-playstyle" aria-label="Lối Chơi Hiện Tại">
    <header><div><small>LỐI CHƠI HIỆN TẠI</small><strong>${esc(truth.primary||'Chưa Định Đạo')}</strong><span>${esc(truth.secondary||'')}</span></div><button type="button" data-tab-jump="path">Định Đạo <b>›</b></button></header>
    <div class="v138237-dao-grid">
      <span><small>Đạo Tính</small><b>${esc(truth.daoNature||'—')}</b></span>
      <span><small>Chủ Đạo</small><b>${esc(truth.mainDao||'—')}</b></span>
      <span><small>Phụ Đạo</small><b>${esc(truth.secondaryDao||'—')}</b></span>
    </div>
    <div class="v138237-build-strip">
      <button type="button" data-tab-jump="roots"><i>◆</i><span><small>Ngũ Hành</small><b>${esc(elementText)}</b></span></button>
      <button type="button" data-tab-jump="path"><i>📖</i><span><small>Bí Tịch Trấn Phái</small><b>${truth.manual?`${esc(truth.manual.shortName||truth.manual.name)} · Ch.${num(truth.manual.activeChapter||0)}/3`:(truth.committed?'Đang lĩnh ngộ':'Mở sau Định Đạo')}</b></span></button>
      <button type="button" data-open-inventory="sets"><i>✦</i><span><small>Set Ngũ Hành</small><b>${num(truth.setActive||0)} mốc · ${esc(truth.attire?.name||'Trang Phục Ngũ Hành')}</b></span></button>
      <button type="button" data-sheet-open="stats"><i>⚔</i><span><small>Phá Thế</small><b>${num(truth.breakInfo?.skillCount||0)} kỹ năng · ${num(truth.breakInfo?.setCount||0)} Set · ${num(truth.breakInfo?.manualCount||0)} Bí Tịch</b></span></button>
    </div>
  </section>`;
}

function v138247CharacterCultivationCard(){
  return `<button type="button" class="v138247-cult-entry" data-tab-jump="cultivation" aria-label="Mở giao diện Tu Luyện">
    <span class="v138247-cult-entry-icon">${navIcon('cultivation')}</span>
    <span class="v138247-cult-entry-copy"><small>TIẾN TRÌNH NHÂN VẬT</small><strong>Tu Luyện</strong></span>
    <b aria-hidden="true">›</b>
  </button>`;
}

renderCharacter=function(){
  const c=model.character,o=model.overview,st=c.combatStats||{},core=c.coreStats||{},gear=model.equipment||[],sys=model.equipmentSystem||{},equipped=gear.filter(x=>x.equipped),pot=c.potential||{};
  const skin=v1074SelectedVisual('skin'),background=v1074SelectedVisual('background'),root=String(model.spiritualRoot?.grade?.name||'Phàm Căn');
  const slots=v1078EquipmentSlots(c),forgeEssence=Number(sys.resources?.forgingEssence??resourceQuantity('resource.forging_essence'));
  let enhanceableCount=0,firstEnhanceableItemId='';
  const slotHtml=slots.map(([slot,label],i)=>{
    const x=equipped.find(g=>g.slot===slot);
    const canEnhance=Boolean(x&&Number(x.enhancementLevel||0)<20&&Number(x.nextEnhanceCost||Infinity)<=forgeEssence);
    if(canEnhance){enhanceableCount++;if(!firstEnhanceableItemId)firstEnhanceableItemId=x.id;}
    return `<button type="button" class="v138235-equip-slot v138237-equip-slot p${i} ${x?'filled':'empty'} ${x?v107TierClass(x):''}" ${x?`data-sheet-open="eq-${i}"`:`data-open-inventory="gear" data-inventory-slot="${esc(slot)}"`} aria-label="${esc(x?`${label}: ${x.name} +${num(x.enhancementLevel||0)}`:`${label} trống · mở Hành Trang`)}"><span>${x?`<img src="${v1077EquipArt(slot,x)}" alt="">`:`<i>${v1077SlotIcon(slot)}</i>`}${x?`<b>+${num(x.enhancementLevel||0)}</b>`:'<u>+</u>'}${canEnhance?'<em class="v138235-notify" aria-label="Có thể cường hóa"></em>':''}</span><small>${esc(label)}</small></button>`;
  }).join('');
  const eqSheets=slots.map(([slot,label],i)=>{const x=equipped.find(g=>g.slot===slot);return x?v106Sheet(`eq-${i}`,x.name,v1077EquipmentSheet(x,label)):'';}).join('');

  const backgroundAsset=visualVariantAsset(background,'character','/assets/v1074/bg-blue-valley.webp');
  const bodyArt=v138232CharacterBodyArt(skin);
  // Keep the binding explicit in the production renderer: these are backend-owned summaries, never decorative/fake values.
  const breakInfo=v13819BreakSummary(c,sys);
  const attire=v13819SetCategorySummary(sys,'attire'),jewelry=v13819SetCategorySummary(sys,'jewelry');
  const truth=v138237PlaystyleTruth(c,o,st,sys);
  truth.breakInfo=breakInfo;truth.attire=attire;truth.jewelry=jewelry;truth.setActive=Number(attire.active||0)+Number(jewelry.active||0);
  const profileReady=v138232ProfileReady(c);
  const next=v138232NextAction({potential:Number(pot.unspent||0),enhanceable:enhanceableCount,enhanceableItemId:firstEnhanceableItemId,profileReady});
  const displayName=String(c.name||o.life?.name||'Tu Sĩ'),major=v1078MajorRealmName(o.life.realm),stage=v1078RealmStage(o.life.realm),rootShort=String(model.spiritualRoot?.grade?.name||root);
  const equippedCount=Number(sys.equippedCount??equipped.length),canonicalSlots=Number(sys.canonicalSlotCount??10);

  const hero=`<section class="v138235-hero v138237-hero">
    <img class="v138235-hero-bg" src="${esc(backgroundAsset)}" style="${esc(visualLayoutStyle(background,'background'))}" alt="">
    <div class="v138237-sky-vignette" aria-hidden="true"></div><div class="v138235-atmosphere" aria-hidden="true"></div><div class="v138235-orbit v138237-orbit" aria-hidden="true"></div><div class="v138237-spirit-runes" aria-hidden="true"></div><div class="v138237-particles" aria-hidden="true"></div>
    <header class="v138235-identity v138237-identity"><div><span>ĐỜI ${num(o.life.lifeNumber||1)} · ${stage?esc(stage):'ĐANG TU LUYỆN'}</span><strong>${esc(displayName)}</strong><small>${esc(major)} · ${esc(rootShort)}</small></div><button type="button" data-sheet-open="appearance">${v1076SceneToolIcon('appearance')}<b>Ngoại Quan</b></button></header>
    <img class="v138235-character-art v138237-character-art" src="${esc(bodyArt)}" alt="Nhân vật">
    ${slotHtml}
    <div class="v138235-hero-plaque v138237-hero-plaque"><small>LỐI TU HIỆN TẠI</small><strong>${esc(truth.primary)}</strong><span>${esc(truth.secondary)}</span></div>
  </section>`;

  const coreHtml=`<section class="v138235-core v138237-core" aria-label="Ba chỉ số lõi"><button type="button" data-stat-help="power"><i>${navIcon('combat')}</i><span><small>Công Lực</small><strong>${num(core.power??st.attack??0)}</strong><em>Sức tấn công</em></span></button><button type="button" data-stat-help="body"><i>${navIcon('character')}</i><span><small>Thể Phách</small><strong>${num(core.body??0)}</strong><em>Máu & thể chất</em></span></button><button type="button" data-stat-help="defense"><i>${navIcon('path')}</i><span><small>Phòng Ngự</small><strong>${num(core.defense??st.defense??0)}</strong><em>Chống chịu</em></span></button></section>`;

  const cultivationHtml=v138247CharacterCultivationCard(o,c);

  const primaryAction=`<button type="button" class="v138235-primary-action v138237-primary-action ${Number(pot.unspent||0)>0?'hot':''}" data-sheet-open="potential"><i>${navIcon('character')}</i><span><small>TĂNG NHÂN VẬT</small><strong>Tăng Điểm</strong><em>${Number(pot.unspent||0)>0?`${num(pot.unspent)} điểm đang chờ`:'Phân bổ Tiềm Năng'}</em></span><b>›</b></button>`;
  const actions=`<section class="v138235-actions v138237-actions">${primaryAction}<div class="v138235-action-grid v138237-action-grid"><button type="button" data-open-inventory="gear"><i>${navIcon('inventory')}</i><span><b>Trang Bị</b><small>${num(equippedCount)}/${num(canonicalSlots)} ô đang mặc</small></span></button><button type="button" data-sheet-open="stats"><i>${navIcon('overview')}</i><span><b>Thuộc Tính</b><small>Xem chỉ số chi tiết</small></span></button><button type="button" class="${profileReady?'has-notify':''}" data-sheet-open="origin"><i>${navIcon('path')}</i><span><b>Hồ Sơ</b><small>Huyết Mạch · Thể Chất · Công Pháp</small></span></button></div></section>`;

  const playstyleHtml=v138237PlaystyleCard(truth);
  const nextHtml=`<button type="button" class="v138235-next v138237-next ${esc(next.tone)}" ${next.attr}><i>✦</i><span><small>${esc(next.kicker)}</small><b>${esc(next.title)}</b><em>${esc(next.detail)}</em></span><strong>${esc(next.cta)} <b>›</b></strong></button>`;

  return `<section class="v107-screen v138235-character-experience v138237-character-production"><div class="v138235-character-scroll v138237-character-scroll">${hero}${cultivationHtml}${coreHtml}${actions}${playstyleHtml}${nextHtml}</div>${eqSheets}${v106Sheet('stats','Thuộc Tính Nhân Vật',v1078StatsSheet(c,o))}${v106Sheet('origin','Hồ Sơ Tu Hành',v1084OriginSheet(c))}${v106Sheet('blood','Huyết Mạch',v1084BloodSheet(c))}${v106Sheet('body','Thể Chất',v1084BodySheet(c))}${v106Sheet('potential','Tăng Điểm Tiềm Năng',v1077PotentialSheet(c))}${v106Sheet('manual','Công Pháp',v1084ManualSheet(c,o))}${v106Sheet('appearance','Ngoại Quan',v1074AppearanceSheet())}</section>`;
};

// v1.08.0 final renderer lock
function v138235RenderInventory(){
  const gear=model.equipment||[],sys=model.equipmentSystem||{},equipped=gear.filter(x=>x.equipped),resources=model.inventory||[];
  const slots=(sys.slots||[]).map(x=>[x.id,x.label]);
  let selected=gear.find(x=>x.id===inventoryUi.selectedId)||gear.find(x=>!x.equipped)||gear[0]||null;
  const filtered=gear.filter(x=>(inventoryUi.group==='all'||x.slotGroup===inventoryUi.group)&&(inventoryUi.slot==='all'||x.slot===inventoryUi.slot)&&(inventoryUi.setId==='all'||!inventoryUi.setId||x.setId===inventoryUi.setId));
  filtered.sort((a,b)=>inventoryUi.sort==='enhance'?Number(b.enhancementLevel||0)-Number(a.enhancementLevel||0)||Number(b.itemLevel||0)-Number(a.itemLevel||0):inventoryUi.sort==='impact'?(Number(b.powerDeltaPct??b.itemLevel??0)-Number(a.powerDeltaPct??a.itemLevel??0)):inventoryUi.sort==='grade'?v138234GradeRank(b.grade)-v138234GradeRank(a.grade)||Number(b.itemLevel||0)-Number(a.itemLevel||0)||Number(b.enhancementLevel||0)-Number(a.enhancementLevel||0):Number(b.itemLevel||0)-Number(a.itemLevel||0)||Number(b.enhancementLevel||0)-Number(a.enhancementLevel||0));
  const visibleLimit=Math.max(36,Number(inventoryUi.visibleLimit||72)),visibleFiltered=filtered.slice(0,visibleLimit);
  if(filtered.length&&!filtered.some(x=>x.id===selected?.id))selected=filtered[0];
  if(selected)inventoryUi.selectedId=selected.id;
  const equippedRail=(sys.slots||[]).map(slot=>{const x=gear.find(g=>g.id===slot.equippedItemId),i=x?gear.indexOf(x):-1;return `<button class="v138235-equipped-slot ${x?v107TierClass(x):'empty'}" ${x?`data-inventory-select="${esc(x.id)}" data-item-open="item-${i}"`: `data-open-inventory="gear" data-inventory-slot="${esc(slot.id)}"`} aria-label="${esc(x?`${slot.label}: ${x.name}`:`${slot.label}: trống`)}"><span>${x?`${v13823LazyImg(v1077EquipArt(slot.id,x),x.name)}<b>+${num(x.enhancementLevel||0)}</b>`:`<i>${v1077SlotIcon(slot.id)}</i><u>+</u>`}</span><small>${esc(slot.label)}</small></button>`;}).join('');
  const itemGrid=visibleFiltered.map(x=>{const i=gear.indexOf(x),active=selected?.id===x.id,q=v138240QualityShort(x.quality),qBadge=v138245QualityBadge(x.quality),qClass=v138245QualityClass(x.quality),grade=v138240GradeClass(x),enh=v138240EnhanceClass(x.enhancementLevel);return `<button class="v138243-gear-tile ${grade} ${enh} ${x.equipped?'equipped':''} ${x.locked?'locked':''} ${active?'selected':''}" data-inventory-select="${esc(x.id)}" data-item-open="item-${i}" aria-label="${esc(`${x.name}, ${v13823RarityLabel(x)}, cấp ${num(x.itemLevel||0)}, cường hóa +${num(x.enhancementLevel||0)}${x.locked?', đã khóa':''}`)}"><span class="v138243-gear-art">${v138245RarityAura()}${v13823LazyImg(v1077EquipArt(x.slot,x),x.name)}<b>+${num(x.enhancementLevel||0)}</b>${qBadge?`<i class="${esc(qClass)}" title="${esc(q)}">${esc(qBadge)}</i>`:''}${x.setId?'<em title="Thuộc Set">◆</em>':''}${x.locked?'<u title="Đã khóa">◆</u>':''}${x.equipped?'<s>MẶC</s>':''}${v138245SocketOverlay(x,'grid')}</span><span class="v138243-gear-meta"><small>${esc(x.slotLabel||v107SlotLabel(x.slot))}</small><b>Lv.${num(x.itemLevel||0)}</b></span></button>`;}).join('');
  const modeTabs=v13821InventoryModeTabs(gear.length,sys);
  const setFilterOptions=(sys.setCatalog||[]).filter(x=>x.unlocked||Number(x.ownedSlotCount||0)>0||Number(x.equippedPieces||0)>0).sort((a,b)=>a.category.localeCompare(b.category)||a.setName.localeCompare(b.setName));
  const activeSetFilter=(sys.setCatalog||[]).find(x=>x.setId===inventoryUi.setId);
  const head=`<section class="v138235-inventory-head"><div><small>TRANG BỊ ĐANG MẶC</small><strong>${num(sys.equippedCount??equipped.length)}/${num(sys.canonicalSlotCount??10)} ô</strong></div><button type="button" data-inventory-view="sets">Bộ Đồ <b>›</b></button></section><div class="v138235-equipped-grid">${equippedRail}</div>${modeTabs}`;
  const filters=`<div class="v138243-filter-shell"><div class="v138243-group-chips"><button class="${inventoryUi.group==='all'?'active':''}" data-inventory-group-chip="all">Tất cả</button><button class="${inventoryUi.group==='attire'?'active':''}" data-inventory-group-chip="attire">Trang Phục</button><button class="${inventoryUi.group==='jewelry'?'active':''}" data-inventory-group-chip="jewelry">Phụ Kiện</button></div><div class="v138243-filter-row"><label><span>Vị trí</span><select data-inventory-filter="slot"><option value="all" ${inventoryUi.slot==='all'?'selected':''}>Tất cả</option>${slots.map(([id,label])=>`<option value="${esc(id)}" ${inventoryUi.slot===id?'selected':''}>${esc(label)}</option>`).join('')}</select></label><label><span>Bộ</span><select data-inventory-filter="setId"><option value="all" ${inventoryUi.setId==='all'?'selected':''}>Mọi Bộ</option>${setFilterOptions.map(set=>`<option value="${esc(set.setId)}" ${inventoryUi.setId===set.setId?'selected':''}>${esc(set.setName)}</option>`).join('')}</select></label><label><span>Sắp xếp</span><select data-inventory-filter="sort"><option value="level" ${inventoryUi.sort==='level'?'selected':''}>Cấp cao</option><option value="enhance" ${inventoryUi.sort==='enhance'?'selected':''}>Cường hóa</option><option value="impact" ${inventoryUi.sort==='impact'?'selected':''}>Ảnh hưởng build</option><option value="grade" ${inventoryUi.sort==='grade'?'selected':''}>Bậc</option></select></label><button class="v138243-source" data-sheet-open="gear-sources" aria-label="Nguồn trang bị"><i>⌖</i><span>Nguồn</span></button></div></div>`;
  const gearBody=`<section class="v138243-vault"><header class="v138243-vault-head"><button data-inventory-view="equipped" aria-label="Quay lại trang bị đang mặc">‹</button><div><small>HÀNH TRANG</small><strong>Kho Trang Bị</strong><span>${filtered.length}/${gear.length} món</span></div><nav><button data-inventory-view="forge">Cường Hóa</button><button data-inventory-view="sets">Bộ Đồ</button></nav></header>${activeSetFilter?`<div class="v138243-set-filter"><span>Đang lọc</span><strong>${esc(activeSetFilter.setName)}</strong><button data-clear-inventory-set>×</button></div>`:''}${filters}<div class="v138243-grid-intro"><span>Chạm món để xem chi tiết</span><small>Bậc = màu khung · Cường hóa = năng lượng viền</small></div><div class="v138243-gear-grid">${itemGrid||'<div class="v138235-empty"><i>□</i><strong>Không có món phù hợp</strong><span>Thử đổi bộ lọc để xem trang bị khác.</span><button class="button ghost" data-clear-inventory-filters>Xóa bộ lọc</button></div>'}</div>${filtered.length>visibleFiltered.length?`<div class="v138243-load-more"><span>Đang hiện ${visibleFiltered.length}/${filtered.length} món</span><button class="button ghost" data-inventory-more>Tải thêm ${Math.min(72,filtered.length-visibleFiltered.length)}</button></div>`:''}</section>`;
  const equippedBody=`${v138240EquippedOverview(gear,sys)}`;
  const forgeBody=`${head}${v142EquipmentCraftPanel(sys,selected)}${v13821Workshop(gear,selected,sys)}`;
  const setBody=`${head}${v13821SetScreen(sys,gear)}`;
  const body=inventoryUi.view==='equipped'?equippedBody:inventoryUi.view==='forge'?forgeBody:inventoryUi.view==='sets'?setBody:gearBody;
  const sheetItemIds=new Set([...equipped,...(selected?[selected]:[])].map(x=>x.id)); // V129 PERF: detail sheets only for selected/equipped; list cards hydrate selection on demand.
  const itemSheets=gear.filter(x=>sheetItemIds.has(x.id)).map(x=>v13820ItemSheet(x,gear.indexOf(x),equipped.find(g=>g.slot===x.slot),sys)).join('');
  const resBody=`<div class="v106-resource-grid">${resources.map(x=>`<div><span>${esc(x.name)}</span><b>${num(x.quantity,2)}</b></div>`).join('')}</div>`;
  const artBody=v88InventoryArtifactBody();
  const setSheets=v138233SetSheets(sys,gear);
  return `<section class="v107-screen v138235-inventory v138238-inventory"><div class="v138235-inventory-scroll" data-scroll-key="inventory-main">${body}</div>${itemSheets}${setSheets}${v106Sheet('resources','Vật Phẩm & Tài Nguyên',resBody)}${v106Sheet('artifacts','Pháp Bảo & Chí Bảo',artBody)}${v106MoreSheet()}</section>`;
}
renderInventory=v138235RenderInventory;
page=function(title,sub,body,right=''){return `<section class="v106-screen v106-secondary v1086-secondary ux-viewport-screen"><header class="v106-screen-head"><div><h1>${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:''}</div><div class="v106-head-tools">${right}<button class="v106-icon-btn" data-sheet-open="more" aria-label="Tiện ích">•••</button></div></header><div class="v106-scroll-body ux-screen-scroll" data-scroll-key="${esc(activeTab)}-main">${body}</div>${v106MoreSheet()}</section>`;};

const systemQuickMenu=$('#systemQuickMenu');
systemQuickMenu?.addEventListener('click',e=>{
  const tab=e.target.closest('[data-system-tab]');
  const sheet=e.target.closest('[data-system-sheet]');
  const details=e.target.closest('details.system-menu')||document.querySelector('details.system-menu');
  if(tab){
    const target=tab.dataset.systemTab;
    if(tabUnlocked(target))navigateTo(target);
    else showNotice(tabUnlockText(target),true);
    if(details)details.open=false;
    return;
  }
  if(sheet){
    const panel=content.querySelector(`[data-sheet-panel="${CSS.escape(sheet.dataset.systemSheet)}"]`);
    if(panel){content.querySelectorAll('.v106-sheet.open').forEach(x=>x.classList.remove('open'));panel.classList.add('open');}
    if(details)details.open=false;
  }
});

const navHandler=e=>{const btn=e.target.closest('[data-tab]');if(!btn)return;navigateTo(btn.dataset.tab);};
nav.addEventListener('click',navHandler);
quickNav.addEventListener('click',navHandler);
$('#exportSave').onclick=()=>{flushRuntimeSaveSyncV129();const raw=localStorage.getItem(STORAGE_KEY);if(!raw){showNotice('Chưa có save để export.',true);return;}const blob=new Blob([raw],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`tutien-save-life-${model.overview.life.lifeNumber}-${BUILD_VERSION}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),0);};
$('#importSave').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text());const ok=await confirmAction('Nhập bản lưu',`Nạp ${file.name} sẽ thay state hiện tại. Game sẽ tự lưu một bản dự phòng cục bộ trước khi thay. Tiếp tục?`);if(!ok)return;snapshotLocalSaveBackup('before-import');absorb(await request('/api/load',{method:'POST',body:JSON.stringify(clientViewRequestBodyV129({save:parsed}))}));updateBackupButton();showNotice('Đã nạp save · bản trước đã được lưu dự phòng.');}catch(error){showNotice(`Import thất bại: ${error.message}`,true);}finally{e.target.value='';}};
$('#restoreBackup')?.addEventListener('click',async()=>{try{const raw=localStorage.getItem(STORAGE_BACKUP_KEY);if(!raw){showNotice('Không có bản dự phòng.',true);return;}const envelope=JSON.parse(raw);if(!envelope?.save)throw new Error('Backup không hợp lệ');const ok=await confirmAction('Khôi phục bản dự phòng','State hiện tại sẽ được thay bằng bản dự phòng gần nhất. Tiếp tục?');if(!ok)return;snapshotLocalSaveBackup('before-restore-backup');absorb(await request('/api/load',{method:'POST',body:JSON.stringify(clientViewRequestBodyV129({save:envelope.save}))}));showNotice('Đã khôi phục bản dự phòng.');}catch(error){showNotice(`Khôi phục thất bại: ${error.message}`,true);}});
$('#newGame').onclick=async()=>{if(await confirmAction('Tạo nhân vật mới','Save hiện tại sẽ được lưu thành bản dự phòng cục bộ trước khi tạo nhân vật mới. Tiếp tục?')){snapshotLocalSaveBackup('before-new-game');activeTab='cultivation';absorb(await request('/api/new',{method:'POST',body:JSON.stringify(clientViewRequestBodyV129())}));render();updateBackupButton();}};
let livePollBusy=false;
let livePollTimer=0;
let lastFullStateRefreshAt=0;
function mergeHuntLiveState(huntState={}){
  if(!model||!huntState)return;
  if(huntState.endlessHunt)model.endlessHunt=huntState.endlessHunt;
  if(Array.isArray(huntState.inventory))model.inventory=huntState.inventory;
  if(huntState.overview){
    model.overview={...model.overview};
    if(huntState.overview.life)model.overview.life={...model.overview.life,...huntState.overview.life};
    if(huntState.overview.cultivation)model.overview.cultivation={...model.overview.cultivation,...huntState.overview.cultivation};
  }
}
function livePollDelay(){if(document.hidden)return 30000;if(activeTab==='hunt')return 1000;if(activeTab==='cultivation')return 2000;if(activeTab==='dongfu')return 3000;return 5000;}
function scheduleLivePoll(delay=livePollDelay()){clearTimeout(livePollTimer);livePollTimer=setTimeout(pollLive,Math.max(250,delay));}
async function pollLive(){
  if(document.hidden){scheduleLivePoll(30000);return;}
  if(livePollBusy||!model){scheduleLivePoll();return;}
  livePollBusy=true;
  try{
    const previousFight=Number(live?.fightCount??-1);
    const data=await request(`/api/live?sinceFight=${encodeURIComponent(previousFight)}`);
    live=data.realtime;
    document.querySelectorAll('[data-live-rate]').forEach(el=>el.textContent=`+${num(live.estimatedCultivationPerCommit??Number(live.estimatedCultivationPerSecond||0)*Number(live.commitSeconds||15),0)}`);
    document.querySelectorAll('[data-live-energy]').forEach(el=>el.textContent=num(live.tuVi??model.overview.cultivation.tuVi,0));
    document.querySelectorAll('[data-live-rate-compact]').forEach(el=>el.textContent=num(live.estimatedCultivationPerCommit??Number(live.estimatedCultivationPerSecond||0)*Number(live.commitSeconds||15),0));
    const fightChanged=Number(live?.fightCount??0)!==previousFight;
    const now=Date.now();
    if(fightChanged){
      const compact=await request('/api/hunt-state');
      mergeHuntLiveState(compact.huntState);
      const stoneChip=document.querySelector('#playerHeader .resource-chip[title="Linh Thạch"] b');
      if(stoneChip)stoneChip.textContent=num(resourceQuantity('resource.spirit_stone'),0);
      if(activeTab==='hunt'){
        const root=content.querySelector('.huntv2-screen');
        const synced=huntCombatModule?.syncHuntCombatV2?.(root,{model,live});
        if(synced?.requiresRender)renderPreservingUi();
      }
    }
    // Timed forging/alchemy reconciliation also stays on the V129 view transport. Pulling
    // /api/state here used to reintroduce the ~1 MB full snapshot every 15s while in Dong Phu.
    const backgroundRefresh=activeTab==='dongfu'&&now-lastFullStateRefreshAt>=15000;
    if(backgroundRefresh){
      lastFullStateRefreshAt=now;
      const payload=await request(`/api/view?view=dongfu&subview=${encodeURIComponent(activeSubviewV129())}`);
      const interactionOpen=Boolean(content.querySelector('.v106-sheet.open')||document.querySelector('dialog[open]'));
      const userIsScrolling=Date.now()-lastUiScrollInteractionAt<1200;
      if(interactionOpen||userIsScrolling||dongfuUi.section==='home'){adoptPayloadWithoutRender(payload);v239SyncDongFuHomeLive();}
      else absorb(payload,{notice:false,preserveUi:true});
    }
  }catch{}finally{livePollBusy=false;scheduleLivePoll();}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseReplay();stopAmbientBattleLoop();}else if($('#battleStage')?.classList.contains('ambient'))startAmbientBattleLoop();if(model)scheduleLivePoll(document.hidden?30000:100);});
bootstrap().then(()=>{if(!new URLSearchParams(location.search).has('snapshot'))scheduleLivePoll(500);});
