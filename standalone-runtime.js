import { buildRegistry } from './dist/content/registry.js';
import { createPlayableAdventureState, playablePlayerProfile } from './dist/content/adventure.js';
import { adventureEnemies } from './dist/content/entities.js';
import { thanhHaWorld } from './dist/content/world.js';
import { GameplayFacade } from './dist/core/gameplay.js';
import { createGameApplicationApi } from './dist/core/game-api.js';
import { SimulationSession } from './dist/core/session.js';
import { createInitialLifeMeta } from './dist/core/life.js';
import { buildWebClientSnapshot, buildWebClientViewPatch } from './dist/core/client-shell.js';
import { createWebClientSave, parseWebClientSave } from './dist/core/web-save.js';
import { WORLD_YEARS_PER_REAL_DAY, REAL_SECONDS_PER_WORLD_YEAR, LIVE_COMMIT_REAL_SECONDS } from './dist/core/realtime-balance.js';
import { battleDaoSkillRealmGateV125 } from './dist/core/specialization-skill-progression-v125.js';
import { mapStartFloorForRealm, majorRealmIndexForRealmOrder } from './dist/content/realm-maps.js';

const __nativeFetch=globalThis.fetch.bind(globalThis);
const registry=buildRegistry();
const GAME_VERSION='1.40.0-alpha.24.0';
async function fetchOptionalJson(url,fallback){
  try{const r=await __nativeFetch(url,{cache:'no-store'}); if(!r.ok)return fallback; return await r.json();}
  catch(error){console.warn(`[standalone] Bỏ qua ${url}: ${error?.message||error}`); return fallback;}
}
function mergeById(base=[],extra=[]){
  const merged=new Map(); for(const item of [...base,...extra])if(item?.id)merged.set(String(item.id),item); return [...merged.values()];
}
const BUILTIN_VISUAL_CATALOG=await fetchOptionalJson('/visual-catalog.json',{skins:[],backgrounds:[],expressions:[]});
const USER_ASSET_CATALOG=await fetchOptionalJson('/assets/user/catalog.json',{});
const VISUAL_CATALOG={
  skins:mergeById(BUILTIN_VISUAL_CATALOG.skins,USER_ASSET_CATALOG.skins),
  backgrounds:mergeById(BUILTIN_VISUAL_CATALOG.backgrounds,USER_ASSET_CATALOG.backgrounds),
  expressions:mergeById(BUILTIN_VISUAL_CATALOG.expressions,USER_ASSET_CATALOG.expressions),
};
const DEFAULT_VISUAL={characterSkinId:'skin.white_immortal',characterBackgroundId:'bg.ink_mountain',selectedExpression:'neutral'};
function normalizeVisualPreference(value={}){
  const skinId=VISUAL_CATALOG.skins.some(x=>x.id===value.characterSkinId&&x.unlocked)?value.characterSkinId:DEFAULT_VISUAL.characterSkinId;
  const backgroundId=VISUAL_CATALOG.backgrounds.some(x=>x.id===value.characterBackgroundId&&x.unlocked)?value.characterBackgroundId:DEFAULT_VISUAL.characterBackgroundId;
  const selectedExpression=VISUAL_CATALOG.expressions.some(x=>x.id===value.selectedExpression&&x.unlocked!==false)?value.selectedExpression:DEFAULT_VISUAL.selectedExpression;
  return {characterSkinId:skinId,characterBackgroundId:backgroundId,selectedExpression};
}

class LocalWebGameRuntime {
  #session;
  #game;
  #api;
  #mode='idle';
  #autoCombat=false;
  #paused=false;
  #tickSeconds=LIVE_COMMIT_REAL_SECONDS;
  #carryRealSeconds=0;
  #lastTickAt=Date.now();
  #nextTickAt=Date.now()+LIVE_COMMIT_REAL_SECONDS*1000;
  #nextFightAt=Date.now(); // legacy alias for UI; V77 this is the next virtual-farm batch time.
  #lastFarmResolvedAt=Date.now();
  #farmBatchCount=0;
  #lastFarmBatch;
  #tickCount=0;
  #fightCount=0;
  #recent=[];
  #lastCultivationGain=0;
  #cultivationPerSecond=0;
  #lastFight;
  #visual={...DEFAULT_VISUAL};
  constructor(){ this.newGame(); }
  get api(){ return this.#api; }
  attach(session){ this.#session=session; this.#game=new GameplayFacade(session,registry,thanhHaWorld); this.#api=createGameApplicationApi(this.#game); }
  worldYearsForRealSeconds(seconds){ return Math.max(0,Number(seconds)||0)/REAL_SECONDS_PER_WORLD_YEAR; }
  cultivationMultiplier(){ return 1; }
  estimateCultivationPerSecondFor(){
    if(this.#paused||!this.#session.stateValue.alive)return 0;
    try{return Math.max(0,Number(this.#api.getCultivationV140()?.finalTuViPer15s)||0)/15;}catch{return 0;}
  }
  estimateCultivationPerSecond(){ return this.estimateCultivationPerSecondFor(); }
  invalidateModeRateCache(){ this.#cultivationPerSecond=this.estimateCultivationPerSecond(); }
  modeRatePreview(){ const idle=this.estimateCultivationPerSecond(); return {idle,hunt:idle}; }
  resetRealtime({mode='idle',activity,autoCombat,paused=false,carryRealSeconds=0}={}){
    const resolved=activity??mode;
    this.#mode='idle';
    this.#autoCombat=autoCombat===undefined?resolved==='hunt':Boolean(autoCombat);
    this.#paused=Boolean(paused);
    const now=Date.now();
    this.#carryRealSeconds=Math.max(0,Math.min(this.#tickSeconds-1e-9,Number(carryRealSeconds)||0));
    this.#lastTickAt=now;this.#nextTickAt=now+(this.#tickSeconds-this.#carryRealSeconds)*1000;
    this.#nextFightAt=now+30_000;this.#lastFarmResolvedAt=now;
    this.#farmBatchCount=0;this.#lastFarmBatch=undefined;this.#tickCount=0;this.#fightCount=0;
    this.#recent=[];this.#lastCultivationGain=0;this.#lastFight=undefined;
    this.#cultivationPerSecond=this.estimateCultivationPerSecond();
  }


  visualView(){
    const selected=normalizeVisualPreference(this.#visual);
    return {schema:'visual-profile.v1',selected,skins:VISUAL_CATALOG.skins.map(x=>({...x,selected:x.id===selected.characterSkinId})),backgrounds:VISUAL_CATALOG.backgrounds.map(x=>({...x,selected:x.id===selected.characterBackgroundId})),expressions:VISUAL_CATALOG.expressions.map(x=>({...x,selected:x.id===selected.selectedExpression}))};
  }
  setVisualProfile(patch={}){
    const next={...this.#visual};
    if(patch.characterSkinId) next.characterSkinId=patch.characterSkinId;
    if(patch.characterBackgroundId) next.characterBackgroundId=patch.characterBackgroundId;
    if(patch.selectedExpression) next.selectedExpression=patch.selectedExpression;
    this.#visual=normalizeVisualPreference(next);
    return this.visualView();
  }
  newGame(seed=Date.now()>>>0){
    const state=createPlayableAdventureState();
    const life=createInitialLifeMeta(seed);
    const origins=life.birth.originsV101;
    // v1.01: the first playable life uses the same authoritative six-axis birth roll as later reincarnations.
    // Background affects real starting capital; the main elemental root also selects a matching starter cultivation method.
    if(origins){
      state.inventory['resource.spirit_stone']=Math.max(0,Math.floor(origins.background.startingSpiritStones));
      const primary=origins.spiritualRoot.elements[0];
      const starterTechnique={Metal:'technique.sword_breath',Wood:'technique.qingmu',Water:'technique.azure_sea',Fire:'technique.blazing_yang',Earth:'technique.earth_abyss'}[primary];
      if(starterTechnique){
        state.character.activeTechniqueId=starterTechnique;
        state.character.knownTechniqueIds=[starterTechnique];
        state.character.techniqueMastery={[starterTechnique]:10};
        state.character.equippedTechniqueIds={inner:starterTechnique};
      }
      state.character.spiritualRootId=life.birth.spiritualRootId;
      state.character.physiqueIds=life.birth.physiqueId?[life.birth.physiqueId]:[];
      state.character.bloodlines=life.birth.bloodlineId?[{id:life.birth.bloodlineId,purity:life.birth.bloodlinePurity??0,awakened:false}]:[];
    }
    this.attach(new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,seed,state,0,[],undefined,life));
    this.#visual={...DEFAULT_VISUAL};
    this.resetRealtime();
  }
  load(value,nowUnixMs=Date.now()){
    let envelope;let save;
    try{envelope=parseWebClientSave(value);save=envelope.game;}catch{save=value;}
    const session=SimulationSession.restore(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,save);
    this.attach(session);this.#visual=normalizeVisualPreference(envelope?.visual??DEFAULT_VISUAL);
    const savedActivity=envelope?.runtime?.activity??envelope?.runtime?.mode??'idle';
    this.resetRealtime({activity:savedActivity==='hunt'?'hunt':'idle',autoCombat:envelope?.runtime?.autoCombat??savedActivity==='hunt',paused:false,carryRealSeconds:Number(envelope?.runtime?.carryRealSeconds)||0});
    const lines=[];
    if(envelope&&session.stateValue.alive&&nowUnixMs>envelope.savedAtUnixMs){
      try{
        const huntFloor=this.#session.stateValue.endlessHunt?.selectedFloor;
        const resolution=this.#session.resolveRealtimeOffline({activity:'idle',autoCombat:Boolean(envelope?.runtime?.autoCombat??savedActivity==='hunt'),huntFloor},Math.max(0,envelope.savedAtUnixMs-(Number(envelope?.runtime?.carryRealSeconds)||0)*1000),nowUnixMs);
        this.#carryRealSeconds=0;lines.push(...(resolution.summaryLines||[]));this.#autoCombat=!resolution.lifeEnded&&Boolean(envelope?.runtime?.autoCombat??savedActivity==='hunt');if(resolution.lifeEnded)this.#autoCombat=false;
      }catch(error){lines.push(`Offline resolve lỗi: ${error instanceof Error?error.message:String(error)}`);}
    }
    this.#recent.unshift(...lines);this.#recent=this.#recent.slice(0,10);this.#cultivationPerSecond=this.estimateCultivationPerSecond();return lines;
  }
  setMode(mode){
    if(!['idle','hunt'].includes(mode))throw new Error(`Hoạt động realtime không hợp lệ: ${mode}`);
    if(mode==='hunt'){this.setAutoCombat(true);return 'idle';}
    this.flushRealtime();this.#mode='idle';this.#autoCombat=false;this.#lastFarmResolvedAt=Date.now();this.#nextFightAt=this.#lastFarmResolvedAt+30_000;this.#cultivationPerSecond=this.estimateCultivationPerSecond();return 'idle';
  }
  resolveInstantRetreat(retreatHours=3){
    if(this.#paused)throw new Error('Dòng thời gian đang tạm dừng.');
    if(!this.#session.stateValue.alive)throw new Error('Đời hiện tại đã kết thúc.');
    this.flushRealtime();const result=this.#api.instantRetreat(Math.max(.25,Number(retreatHours)||3));
    this.#recent.unshift(`Bế Quan ${Number(result.hoursUsed||0).toLocaleString('vi-VN',{maximumFractionDigits:2})} giờ · Tu Vi +${Number(result.gained||0).toLocaleString('vi-VN',{maximumFractionDigits:0})}.`);this.#recent=this.#recent.slice(0,10);this.#cultivationPerSecond=this.estimateCultivationPerSecond();return result;
  }



  setAutoCombat(enabled){
    const next=Boolean(enabled);
    if(next){
      if(this.#session.stateValue.realm.maxRealmOrder<1) throw new Error('Tự Động Săn Yêu mở khi bước vào Luyện Khí.');
      const hunt=this.#api.getEndlessHunt(); if(!hunt.canFight) throw new Error(hunt.fightBlocker||'Thương thế quá nặng để tiếp tục Săn Yêu.');
      if(!hunt.farm?.available) throw new Error('Chưa có bãi săn: hãy hạ Boss tầng đầu tiên trước.');
      this.flushRealtime();
      this.#mode='idle'; this.#autoCombat=true; this.#lastFarmResolvedAt=Date.now(); this.#nextFightAt=this.#lastFarmResolvedAt+30_000;
      this.#recent.unshift(`Đã bật Tự Săn tầng ${hunt.farm.floor}: ${Number(hunt.farm.killsPerHour||0).toLocaleString('vi-VN',{maximumFractionDigits:0})} yêu thú/giờ dự kiến. Tu Luyện vẫn 100%.`);
    }else{
      this.#autoCombat=false;
      this.#recent.unshift('Đã tắt Tự Săn. Tu Luyện vẫn tiếp tục 100%.');
    }
    this.#recent=this.#recent.slice(0,10); this.#cultivationPerSecond=this.estimateCultivationPerSecond(); return this.#autoCombat;
  }
  setPaused(paused){
    if(Boolean(paused)===this.#paused)return;
    if(paused)this.flushRealtime();
    this.#paused=Boolean(paused);
    const now=Date.now(); this.#lastTickAt=now; this.#nextTickAt=now+this.#tickSeconds*1000; this.#lastFarmResolvedAt=now; this.#nextFightAt=now+30_000;
    this.#cultivationPerSecond=this.estimateCultivationPerSecond();
  }
  tick(elapsedRealSeconds,commitUnits=1){
    if(this.#paused||!this.#session.stateValue.alive||elapsedRealSeconds<=0)return;
    const result=this.#session.advanceRealtimeCultivationV140(elapsedRealSeconds);
    this.#lastCultivationGain=Math.max(0,Math.round(Number(result.gained)||0));
    if(elapsedRealSeconds>0)this.#cultivationPerSecond=this.#lastCultivationGain/elapsedRealSeconds;
    this.#tickCount+=Math.max(1,Math.floor(Number(commitUnits)||1));
    if(this.#lastCultivationGain>0)this.#recent.unshift(`Tự Tu +${this.#lastCultivationGain.toLocaleString('vi-VN')} Tu Vi.`);
    for(const transition of result.transitions||[])this.#recent.unshift(`Tự thăng tiểu cảnh: ${transition.from} → ${transition.to}.`);
    if(!this.#session.stateValue.alive)this.#recent.unshift('Thọ nguyên đã tận; chờ Đánh Giá Một Đời / Luân Hồi.');
    this.#recent=this.#recent.slice(0,10);return result;
  }
  flushRealtime(now=Date.now()){
    if(this.#paused||!this.#session.stateValue.alive){ this.#lastTickAt=now; this.#nextTickAt=now+(this.#tickSeconds-this.#carryRealSeconds)*1000; return; }
    const elapsedSeconds=Math.max(0,(now-this.#lastTickAt)/1000);
    if(elapsedSeconds<=0)return;
    this.#lastTickAt=now;
    const available=this.#carryRealSeconds+elapsedSeconds;
    const commitCount=Math.floor((available+1e-9)/this.#tickSeconds);
    this.#carryRealSeconds=Math.max(0,available-commitCount*this.#tickSeconds);
    if(commitCount>0){
      // Preserve exact 15-second semantics for normal play. If a mobile/web runtime was
      // throttled for a long period, process a bounded number exactly and aggregate the
      // remainder in one deterministic catch-up so resume cannot freeze the UI.
      const exactCommits=Math.min(commitCount,40);
      for(let i=0;i<exactCommits&&this.#session.stateValue.alive;i++){
        this.tick(this.#tickSeconds,1);
      }
      const batchedCommits=commitCount-exactCommits;
      if(batchedCommits>0&&this.#session.stateValue.alive){
        const batchedSeconds=batchedCommits*this.#tickSeconds;
        this.tick(batchedSeconds,batchedCommits);
        this.#recent.unshift(`Đã gộp ${batchedCommits.toLocaleString('vi-VN')} commit 15 giây khi khôi phục timer để tránh lag; Tu Vi vẫn được lượng tử hóa theo commit.`);
        this.#recent=this.#recent.slice(0,10);
      }
    }
    this.#nextTickAt=now+(this.#tickSeconds-this.#carryRealSeconds)*1000;
  }
  fightNow(challengeBoss=false){
    if(this.#paused) throw new Error('Dòng thời gian đang tạm dừng.');
    if(!this.#session.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');
    if(this.#session.stateValue.realm.maxRealmOrder<1) throw new Error('Săn Yêu mở khi bước vào Luyện Khí.');
    // V77: Boss combat runs beside the canonical Tu Luyện stream; it never changes cultivation mode.
    this.flushRealtime();
    const result=this.#api.fightEndlessFloor({challengeBoss:true}); this.#lastFight=result; this.#fightCount+=1;
    this.#recent.unshift(...result.summaryLines.slice(0,3)); this.#recent=this.#recent.slice(0,10);
    return result;
  }
  maybeFarm(now=Date.now()){
    if(this.#paused||!this.#autoCombat||!this.#session.stateValue.alive||now<this.#nextFightAt)return;
    try{
      const elapsedSeconds=Math.max(0,(now-this.#lastFarmResolvedAt)/1000);
      const batch=this.#session.resolveEndlessHuntFarmBatchV77(elapsedSeconds);
      this.#lastFarmResolvedAt=now;
      this.#nextFightAt=now+30_000;
      this.#lastFarmBatch=batch;
      this.#farmBatchCount+=1;
      if(batch.kills>0)this.#recent.unshift(...batch.summaryLines.slice(0,2));
      this.#recent=this.#recent.slice(0,10);
    }catch(error){
      this.#autoCombat=false; this.#lastFarmResolvedAt=now; this.#nextFightAt=now+30_000;
      this.#recent.unshift(`Tự Săn dừng: ${error instanceof Error?error.message:String(error)}`); this.#recent=this.#recent.slice(0,10);
    }
  }
  maybeTick(now=Date.now()){
    if(now>=this.#nextTickAt)this.flushRealtime(now);this.maybeFarm(now);
  }
  realtimeView(now=Date.now(),{sinceFight}={}){
    const cultivation=this.#api.getCultivationV140(),worldYear=Math.max(0,Number(this.#session.stateValue.worldTimeYears)||0);
    const pendingSeconds=this.#paused?this.#carryRealSeconds:this.#carryRealSeconds+Math.max(0,(now-this.#lastTickAt)/1000);
    const includeFightEvents=!Number.isFinite(Number(sinceFight))||Number(sinceFight)!==this.#fightCount;
    return {schema:'realtime-idle.v140',worldYearsPerRealDay:WORLD_YEARS_PER_REAL_DAY,realSecondsPerWorldYear:REAL_SECONDS_PER_WORLD_YEAR,commitSeconds:this.#tickSeconds,carryRealSeconds:this.#carryRealSeconds,nextCommitAtUnixMs:this.#nextTickAt,secondsUntilCommit:Math.max(0,(this.#nextTickAt-now)/1000),secondsUntilFight:this.#autoCombat?Math.max(0,(this.#nextFightAt-now)/1000):0,secondsUntilFarmBatch:this.#autoCombat?Math.max(0,(this.#nextFightAt-now)/1000):0,farmBatchCount:this.#farmBatchCount,lastFarmBatch:this.#lastFarmBatch,mode:'idle',activity:this.#autoCombat?'hunt':'idle',autoCombat:this.#autoCombat,paused:this.#paused,tickCount:this.#tickCount,fightCount:this.#fightCount,estimatedCultivationPerSecond:Math.max(0,Number(cultivation.finalTuViPer15s)||0)/15,estimatedCultivationPerCommit:Number(cultivation.finalTuViPer15s)||0,lastCommittedCultivationGain:this.#lastCultivationGain,tuVi:Number(cultivation.tuVi)||0,requiredTuVi:Number(cultivation.requiredTuVi)||0,progressPct:Number(cultivation.progressPct)||0,projectedWorldYear:worldYear+this.worldYearsForRealSeconds(pendingSeconds),retreat:cultivation.retreat,recent:[...this.#recent],lastFight:this.#lastFight?{won:this.#lastFight.won,floor:this.#lastFight.floor,monsterId:this.#lastFight.monsterId,monsterName:this.#lastFight.monsterName,grade:this.#lastFight.grade,bossCleared:this.#lastFight.bossCleared,damage:this.#lastFight.damage,battleSeconds:this.#lastFight.battleSeconds,powerRatio:this.#lastFight.powerRatio,cultivationGain:this.#lastFight.cultivationGain,spiritStones:this.#lastFight.spiritStones,combatEvents:includeFightEvents?this.#lastFight.combatEvents:undefined}:undefined};
  }
  huntStateView(now=Date.now()){
    const state=this.#session.stateValue,cultivation=this.#api.getCultivationV140();return {schema:'hunt-live-state.v140',generatedAtUnixMs:now,endlessHunt:this.#api.getEndlessHunt(),inventory:this.#api.getInventory(),overview:{life:{ageYears:Number(state.ageYears)||0,lifespanYears:Number(state.lifespanYears)||0,alive:Boolean(state.alive),realmOrder:Number(state.realm?.maxRealmOrder)||0,worldYear:Number(state.worldTimeYears)||0},cultivation:{tuVi:Number(cultivation.tuVi)||0,requiredTuVi:Number(cultivation.requiredTuVi)||0,progressPct:Number(cultivation.progressPct)||0,finalTuViPer15s:Number(cultivation.finalTuViPer15s)||0},injury:Math.max(0,Number(state.injury)||0)}};
  }
  applyDevSandboxPreset({realmOrder=10,dao='sword',forceBoss=false}={}){
    const order=Math.max(10,Math.min(117,Math.floor(Number(realmOrder)||10)));
    const daoId=['sword','fist','body','spell','poison','artifact','formation','mind'].includes(String(dao))?String(dao):'sword';
    const realm=[...registry.realms.values()].find(x=>x.order===order)??[...registry.realms.values()].filter(x=>x.order<=order).sort((a,b)=>b.order-a.order)[0];
    if(!realm)throw new Error(`Không tìm thấy cảnh giới dev order ${order}.`);
    const envelope=this.payload().save;
    envelope.savedAtUnixMs=Date.now();
    const state=envelope.game?.state;
    if(!state?.character)throw new Error('Dev Sandbox không đọc được CharacterState.');
    state.alive=true; state.injury=0;
    state.realm={...(state.realm||{}),realmId:realm.id,maxRealmOrder:realm.order};
    state.lifespanYears=Math.max(Number(state.lifespanYears)||0,Number(realm.lifespanYears)||100);
    state.cultivation={...(state.cultivation||{}),tuVi:0,commitRemainderSeconds:0};
    const ch=state.character;
    ch.buildFoundation=ch.buildFoundation||{};
    ch.buildFoundation.battleDao={...(ch.buildFoundation.battleDao||{}),committed:true,mainDaoId:daoId,secondaryDaoId:undefined,natureTags:['ĐạoTính:Chính Tu']};
    const prog=ch.buildFoundation.progressionV125||(ch.buildFoundation.progressionV125={});
    prog.daoNatureId='orthodox'; prog.daoNatureCommitted=true; prog.daoNatureCommittedRealmOrder=realm.order;
    prog.skillPoints=Math.max(Number(prog.skillPoints)||0,999); prog.rewardedRealmOrders=Array.from({length:Math.max(0,realm.order-1)},(_,i)=>i+2);
    prog.skillPracticeXp=prog.skillPracticeXp||{}; prog.skillPracticeMilestonesClaimed=prog.skillPracticeMilestonesClaimed||{}; prog.passiveLevels=prog.passiveLevels||{}; prog.techniqueFragments=prog.techniqueFragments||{}; prog.restoredTechniqueIds=prog.restoredTechniqueIds||[];
    const daoSkills=[...registry.skills.values()].filter(skill=>String(skill.id).startsWith(`skill.dao.${daoId}.`));
    const available=daoSkills.filter(skill=>battleDaoSkillRealmGateV125(skill,[...registry.skills.values()])<=realm.order);
    const basic=available.find(skill=>skill.runtimeV117?.slotClass==='basic');
    const ultimate=available.find(skill=>skill.runtimeV117?.slotClass==='ultimate');
    // Canonical Battle Dao loadout is Basic + 5 Active + Ultimate (7 total).
    // The sandbox must exercise that exact production contract so missing-slot regressions are visible.
    const activeLimit=5;
    const actives=available.filter(skill=>skill.runtimeV117?.slotClass==='active').slice(0,activeLimit);
    const knownNonDao=(ch.knownSkillIds||[]).filter(id=>!String(id).startsWith('skill.dao.')&&id!=='skill.basic_strike');
    ch.knownSkillIds=[...new Set([...knownNonDao,...available.map(x=>x.id)])];
    ch.activeSkillIds=[...new Set([basic?.id,...actives.map(x=>x.id),ultimate?.id].filter(Boolean))];
    ch.buildFoundation.skillLoadout={...(ch.buildFoundation.skillLoadout||{}),basicSkillId:basic?.id,activeSkillIds:actives.map(x=>x.id),ultimateSkillId:ultimate?.id,buildPassiveIds:[...(ch.buildFoundation.skillLoadout?.buildPassiveIds||[])]};
    ch.combatAiProfile={name:`DEV · ${daoId}`,rules:ch.activeSkillIds.map((skillId,index)=>({skillId,priority:100-index,conditions:[{type:'always'}]}))};
    const major=majorRealmIndexForRealmOrder(realm.order); const floor=mapStartFloorForRealm(realm.order);
    state.endlessHunt=state.endlessHunt||{};
    state.endlessHunt.selectedFloor=floor; state.endlessHunt.highestUnlockedFloor=Math.max(Number(state.endlessHunt.highestUnlockedFloor)||1,floor);
    state.endlessHunt.highestUnlockedByMajor={...(state.endlessHunt.highestUnlockedByMajor||{}),[String(major)]:1};
    state.endlessHunt.killsByFloor={...(state.endlessHunt.killsByFloor||{})}; delete state.endlessHunt.killsByFloor[String(floor)];
    state.endlessHunt.activeMonster=undefined; state.endlessHunt.autoAdvance=false;
    this.load(envelope,Date.now());
    this.resetRealtime({mode:'idle',activity:'idle',autoCombat:false,paused:false});
    return {schema:'dev-combat-sandbox.v1',realmOrder:realm.order,realmId:realm.id,realmName:realm.name,dao:daoId,knownSkillCount:available.length,activeSkillIds:[...ch.activeSkillIds],forceBoss:Boolean(forceBoss),floor,saveSafe:true};
  }
  applyDevSkillLabV12317({realmOrder=117,mainDao='sword',secondaryDao='poison',forceBoss=true,maxProgress=true,statPreset='balanced'}={}){
    const validDaos=['sword','fist','body','spell','poison','artifact','formation','mind'];
    const primary=validDaos.includes(String(mainDao))?String(mainDao):'sword';
    const secondary=validDaos.includes(String(secondaryDao))&&String(secondaryDao)!==primary?String(secondaryDao):undefined;
    this.applyDevSandboxPreset({realmOrder,dao:primary,forceBoss});
    const envelope=this.payload().save; const state=envelope.game?.state; const ch=state?.character;
    if(!state||!ch)throw new Error('DEV Skill Lab không đọc được CharacterState.');
    const foundation=ch.buildFoundation||(ch.buildFoundation={}); const battle=foundation.battleDao||(foundation.battleDao={});
    battle.committed=true; battle.mainDaoId=primary; battle.secondaryDaoId=secondary; battle.natureTags=['DEV:SkillLab'];
    const prog=foundation.progressionV125||(foundation.progressionV125={});
    prog.daoNatureId='rogue'; prog.daoNatureCommitted=true; prog.daoNatureCommittedRealmOrder=Number(state.realm?.maxRealmOrder||realmOrder);
    prog.skillPoints=9999; prog.skillPracticeXp=prog.skillPracticeXp||{}; prog.skillPracticeMilestonesClaimed=prog.skillPracticeMilestonesClaimed||{}; prog.passiveLevels=prog.passiveLevels||{}; prog.techniqueFragments=prog.techniqueFragments||{}; prog.restoredTechniqueIds=prog.restoredTechniqueIds||[];
    prog.skillLevelsV12317=prog.skillLevelsV12317||{}; prog.skillGradesV12317=prog.skillGradesV12317||{}; prog.skillGenericFragmentsV12317=999999; prog.skillSpecificFragmentsV12317=prog.skillSpecificFragmentsV12317||{}; prog.heartMethodGradesV12317=prog.heartMethodGradesV12317||{};
    const activeDaos=[primary,...(secondary?[secondary]:[])];
    const daoSkills=[...registry.skills.values()].filter(skill=>activeDaos.some(dao=>String(skill.id).startsWith(`skill.dao.${dao}.`)));
    ch.knownSkillIds=[...new Set([...(ch.knownSkillIds||[]),...daoSkills.map(x=>x.id)])];
    foundation.skillMastery=foundation.skillMastery||{};
    for(const skill of daoSkills){prog.skillLevelsV12317[skill.id]=maxProgress?20:10;prog.skillGradesV12317[skill.id]=maxProgress?'breaker':'immortal';prog.skillPracticeXp[skill.id]=maxProgress?1_000_000:500_000;foundation.skillMastery[skill.id]=maxProgress?1000:500;prog.skillSpecificFragmentsV12317[skill.id]=9999;}
    const daoPassives=[...registry.daoPassivesV118.values()].filter(def=>activeDaos.includes(def.dao));
    foundation.learnedDaoPassiveIdsV118=[...new Set([...(foundation.learnedDaoPassiveIdsV118||[]),...daoPassives.map(x=>x.id)])];
    for(const def of daoPassives){prog.passiveLevels[def.id]=maxProgress?20:10;prog.heartMethodGradesV12317[def.id]=maxProgress?'breaker':'immortal';}
    const variants=[...registry.daoVariantsV118.values()].filter(def=>activeDaos.includes(def.dao));
    foundation.unlockedVariantIdsV119=[...new Set([...(foundation.unlockedVariantIdsV119||[]),...variants.map(x=>x.id)])];
    foundation.skillLoadout=foundation.skillLoadout||{activeSkillIds:[],buildPassiveIds:[]};
    foundation.skillLoadout.buildPassiveIds=variants.filter(x=>x.dao===primary).slice(0,4).map(x=>x.id);
    const manuals=[...registry.techniques.values()].filter(def=>def.contentV119?.daoBindings?.some(dao=>activeDaos.includes(dao)));
    ch.knownTechniqueIds=[...new Set([...(ch.knownTechniqueIds||[]),...manuals.map(x=>x.id)])]; ch.techniqueMastery=ch.techniqueMastery||{};
    for(const manual of manuals){ch.techniqueMastery[manual.id]=100;prog.techniqueFragments[manual.id]=9999;if(!prog.restoredTechniqueIds.includes(manual.id))prog.restoredTechniqueIds.push(manual.id);}
    const availableMain=daoSkills.filter(skill=>String(skill.id).startsWith(`skill.dao.${primary}.`));
    const basic=availableMain.find(skill=>skill.runtimeV117?.slotClass==='basic'); const ultimate=availableMain.find(skill=>skill.runtimeV117?.slotClass==='ultimate'); const actives=availableMain.filter(skill=>skill.runtimeV117?.slotClass==='active').slice(0,5);
    ch.activeSkillIds=[...new Set([basic?.id,...actives.map(x=>x.id),ultimate?.id].filter(Boolean))];
    foundation.skillLoadout.basicSkillId=basic?.id; foundation.skillLoadout.activeSkillIds=actives.map(x=>x.id); foundation.skillLoadout.ultimateSkillId=ultimate?.id;
    ch.combatAiProfile={name:`DEV Skill Lab · ${primary}${secondary?` + ${secondary}`:''}`,rules:ch.activeSkillIds.map((skillId,index)=>({skillId,priority:100-index,conditions:[{type:'always'}]}))};
    const presets={balanced:{power:500,body:500,defense:500},power:{power:1400,body:150,defense:150},body:{power:200,body:1400,defense:200},defense:{power:200,body:200,defense:1400}}; const alloc=presets[String(statPreset)]||presets.balanced;
    ch.corePotential=ch.corePotential||{}; ch.corePotential.life=ch.corePotential.life||{unspent:0,lifetimeEarned:0,allocations:{power:0,body:0,defense:0},awardedMilestones:[]}; ch.corePotential.life.allocations={...alloc}; ch.corePotential.life.lifetimeEarned=alloc.power+alloc.body+alloc.defense; ch.corePotential.life.unspent=0;
    this.load(envelope,Date.now()); this.resetRealtime({mode:'idle',activity:'idle',autoCombat:false,paused:false});
    return{schema:'dev-skill-lab.v12317',saveSafe:true,realmOrder:Number(state.realm?.maxRealmOrder||realmOrder),mainDao:primary,secondaryDao:secondary,skillCount:daoSkills.length,heartMethodCount:daoPassives.length,variantCount:variants.length,manualCount:manuals.length,maxProgress:Boolean(maxProgress),statPreset:String(statPreset),activeSkillIds:[...ch.activeSkillIds]};
  }
  tuneDevSkillV12317({skillId,level=20,grade='breaker',mastery=1000}={}){
    const envelope=this.payload().save;const ch=envelope.game?.state?.character;if(!ch)throw new Error('DEV Skill Lab không đọc được CharacterState.');const id=String(skillId||'');if(!registry.skills.has(id))throw new Error('Skill DEV không tồn tại.');
    const p=ch.buildFoundation?.progressionV125||(ch.buildFoundation.progressionV125={});p.skillLevelsV12317=p.skillLevelsV12317||{};p.skillGradesV12317=p.skillGradesV12317||{};p.skillPracticeXp=p.skillPracticeXp||{};ch.buildFoundation.skillMastery=ch.buildFoundation.skillMastery||{};
    const grades=['mundane','spirit','mystic','earth','heaven','immortal','extreme','breaker'];const g=grades.includes(String(grade))?String(grade):'mundane';p.skillLevelsV12317[id]=Math.max(1,Math.min(20,Math.floor(Number(level)||1)));p.skillGradesV12317[id]=g;p.skillPracticeXp[id]=Math.max(0,Math.min(1_000_000,Math.floor(Number(mastery)||0)*1000));ch.buildFoundation.skillMastery[id]=Math.max(0,Math.min(1000,Math.floor(Number(mastery)||0)));
    if(!(ch.knownSkillIds||[]).includes(id))ch.knownSkillIds.push(id);this.load(envelope,Date.now());return{schema:'dev-skill-tune.v12317',skillId:id,level:p.skillLevelsV12317[id],grade:g,mastery:ch.buildFoundation.skillMastery[id],saveSafe:true};
  }
  saveEnvelope(now=Date.now()){
    return createWebClientSave(this.#api,now,{mode:'idle',activity:this.#autoCombat?'hunt':'idle',autoCombat:this.#autoCombat,paused:false,carryRealSeconds:this.#carryRealSeconds},this.#visual);
  }
  payload(result,noticeLines=[]){
    const now=Date.now();
    const realtime=this.realtimeView(now,{refreshModeRates:true});
    this.#api.syncForgingV12328(now);
    const snapshot={...buildWebClientSnapshot(this.#api,now),visuals:this.visualView()};
    return {ok:true,result,noticeLines,realtime,snapshot,save:this.saveEnvelope(now)};
  }
  viewPayload(view='cultivation',subview='',result,noticeLines=[],includeSave=true){
    const now=Date.now();
    this.#api.syncForgingV12328(now);
    const realtime=this.realtimeView(now,{refreshModeRates:false});
    const snapshotPatch={...buildWebClientViewPatch(this.#api,view,now,subview),visuals:this.visualView()};
    return {ok:true,result,noticeLines,realtime,snapshotPatch,...(includeSave?{save:this.saveEnvelope(now)}:{}),transport:'view-patch.v140'};
  }
}

const runtime=new LocalWebGameRuntime();
let devRuntime=null;
function runtimeFor(dev=false){
  if(!dev)return runtime;
  if(!devRuntime)devRuntime=new LocalWebGameRuntime();
  return devRuntime;
}
function allowApiRequest(){return true;}
function sendJson(res,status,value){res.status=status;res.value=value;res.sent=true;}
async function readJson(req){return req.__body??{};}

async function handleApi(req,res,url){
  if(!allowApiRequest(req,url.pathname)){res.writeHead(429,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','retry-after':'1'});res.end(JSON.stringify({ok:false,error:'Quá nhiều yêu cầu; hãy thử lại sau 1 giây.'}));return;}
  const dev=url.pathname.startsWith('/api/dev/');
  const pathname=dev?url.pathname.replace('/api/dev','/api'):url.pathname;
  const rt=runtimeFor(dev);
  if(req.method==='GET'&&pathname==='/api/health'){ sendJson(res,200,{ok:true,version:GAME_VERSION,devSandbox:dev,apiVersion:rt.api.apiVersion,worldYearsPerRealDay:WORLD_YEARS_PER_REAL_DAY,realSecondsPerWorldYear:REAL_SECONDS_PER_WORLD_YEAR}); return; }
  if(req.method==='GET'&&pathname==='/api/state'){ rt.flushRealtime(); sendJson(res,200,rt.payload()); return; }
  if(req.method==='GET'&&pathname==='/api/view'){ rt.flushRealtime(); const view=String(url.searchParams.get('view')||'cultivation'); const subview=String(url.searchParams.get('subview')||''); sendJson(res,200,rt.viewPayload(view,subview,undefined,[],false)); return; }
  if(req.method==='GET'&&pathname==='/api/save'){ rt.flushRealtime(); sendJson(res,200,{ok:true,save:rt.saveEnvelope(Date.now()),transport:'save-only.v140'}); return; }
  if(req.method==='GET'&&pathname==='/api/live'){ const sinceFight=Number(url.searchParams.get('sinceFight')); sendJson(res,200,{ok:true,realtime:rt.realtimeView(Date.now(),{sinceFight:Number.isFinite(sinceFight)?sinceFight:undefined})}); return; }
  if(req.method==='GET'&&pathname==='/api/hunt-state'){ sendJson(res,200,{ok:true,huntState:rt.huntStateView()}); return; }
  if(req.method==='GET'&&pathname==='/api/boss-intel'){ const dungeonId=url.searchParams.get('dungeonId')??''; const floor=Number(url.searchParams.get('floor')??1); sendJson(res,200,{ok:true,intel:rt.api.getBossIntel(dungeonId,floor)}); return; }
  if(req.method==='GET'&&pathname==='/api/equipment-intelligence'){ const itemId=url.searchParams.get('itemId')??''; sendJson(res,200,{ok:true,intelligence:rt.api.getEquipmentBuildIntelligence(itemId)}); return; }
  if(req.method==='GET'&&pathname==='/api/pvp'){ sendJson(res,200,{ok:true,pvp:rt.api.getPvpV91(Date.now())}); return; }
  if(req.method==='GET'&&pathname==='/api/pvp/replay'){ const fightId=url.searchParams.get('fightId')??''; sendJson(res,200,{ok:true,replay:rt.api.replayPvpV91(fightId)}); return; }
  if(req.method==='POST'&&pathname==='/api/reincarnation/preview'){ const body=await readJson(req); sendJson(res,200,{ok:true,preview:rt.api.previewReincarnationPlan(body.plan??{})}); return; }
  if(req.method==='POST'&&pathname==='/api/new'){ const body=await readJson(req); rt.newGame(Number.isFinite(body.seed)?Number(body.seed):Date.now()>>>0); const clientView=typeof body.clientView==='string'&&body.clientTransport==='view-patch.v140'?body.clientView:''; const clientSubview=String(body.clientSubview||''); sendJson(res,200,clientView?rt.viewPayload(clientView,clientSubview,undefined,['Đã tạo nhân vật mới.']):rt.payload(undefined,['Đã tạo nhân vật mới.'])); return; }
  if(req.method==='POST'&&pathname==='/api/load'){ const body=await readJson(req); const notices=rt.load(body.save??body); const clientView=typeof body.clientView==='string'&&body.clientTransport==='view-patch.v140'?body.clientView:''; const clientSubview=String(body.clientSubview||''); sendJson(res,200,clientView?rt.viewPayload(clientView,clientSubview,undefined,['Đã nạp save.',...notices]):rt.payload(undefined,['Đã nạp save.',...notices])); return; }
  if(req.method==='POST'&&pathname==='/api/action'){
    rt.flushRealtime();
    const body=await readJson(req,256_000); const action=String(body.action??''); let result;
    switch(action){
      case'perform':result=rt.api.perform(body.command);break;
      case'lootLock':result=rt.api.setLootItemLocked(String(body.itemId??''),Boolean(body.locked));break;
      case'cultivate':result=rt.api.cultivate(Number(body.years??1));break;
      case'daoSuyTribulationV127':result=rt.api.challengeDaoSuyTribulationV127();break;
      case'challengeBoss':result=rt.api.challengeBoss(String(body.dungeonId??''),Number(body.floor??1));break;
      case'loadoutPreset':result=rt.api.applyLoadoutPreset(String(body.presetId??''));break;
      case'savedLoadout':result=rt.api.applySavedLoadout(String(body.idOrName??''));break;
      case'automation':result=rt.api.configureAutomation(body.patch??{});break;
      case'majorTalents':result=rt.api.setMajorTalents(body.ids??[]);break;
      case'spendTalent':result=rt.api.spendTalent(String(body.talentId??''),Number(body.ranks??1));break;
      case'potential':result=rt.api.spendPotential(String(body.id??''),Number(body.points??1));break;
      // v1.10.3 backend transport: expose the authoritative v1.10.2 reincarnation/Potential API without changing the current UI.
      case'lifePotentialV2':result=rt.api.getLifePotentialV2();break;
      case'lifePotentialV2Spend':result=rt.api.spendLifePotentialV2(String(body.id??''),Number(body.points??1));break;
      case'permanentPotentialV2':result=rt.api.getPermanentPotentialV2();break;
      case'permanentPotentialV2Spend':result=rt.api.spendPermanentPotentialV2(String(body.id??''),Number(body.points??1));break;
      case'reincarnationProgressV2':result=rt.api.getReincarnationProgressV2(Number(body.nowUnixMs??Date.now()));break;
      case'reincarnationTrialV2':result=rt.api.runReincarnationTrialV2(String(body.kind??'offense'),Number(body.nowUnixMs??Date.now()));break;
      case'reincarnationRewardPreviewV2':result=rt.api.previewReincarnationRewardV2(Number(body.nowUnixMs??Date.now()));break;
      case'reincarnationRewardFinalizeV2':result=rt.api.finalizeReincarnationRewardsV2(Boolean(body.confirmedBuildReady),Number(body.nowUnixMs??Date.now()));break;
      case'reincarnationTreeSpendV2':result=rt.api.spendReincarnationTreeNodeV2(String(body.nodeId??''),Number(body.ranks??1));break;
      case'reincarnationTreeResetV2':result=rt.api.resetReincarnationTreeV2();break;
      case'alchemyStartV12328':result=rt.api.startAlchemyV112(String(body.family??'cultivation'),Number(body.realmTier??1),Number(body.batchSize??1),Number(body.furnaceIndex??0));break;
      case'alchemyPromoteV85':result=rt.api.promoteAlchemyV112();break;
      case'alchemyUsePillV85':result=rt.api.useAlchemyPillV112(String(body.resourceId??''));break;
      case'alchemyRecipeLearnV85':result=rt.api.learnAlchemyRecipeV85(String(body.recipeId??''));break;
      case'alchemyGardenPlantV85':result=rt.api.plantAlchemyGardenV85(String(body.variant??'qi'),Number(body.realmTier??1),Number(body.slot??0));break;
      case'alchemyGardenHarvestV85':result=rt.api.harvestAlchemyGardenV85(Number(body.slot??0));break;
      case'forgingStartV12328':result=rt.api.startForgingV12328(String(body.recipeId??''),Number(body.nowUnixMs??Date.now()));break;
      case'cultivationClassVariant':throw new Error('Kỹ năng Tu Hệ cũ đã ngừng hoạt động; dùng kỹ năng Bản Đạo canonical.');
      case'skillActive':result=rt.api.setSkillActive(String(body.skillId??''),Boolean(body.active));break;
      case'specializationCommitV125':result=rt.api.commitSpecializationV125(String(body.nature??''),String(body.mainDao??''));break;
      case'secondaryDaoV125':result=rt.api.chooseSecondaryDaoV125(String(body.dao??''));break;
      case'daoNaturePointV125':result=rt.api.allocateDaoNaturePointV125(String(body.tierId??''),String(body.branch??''),Number(body.points??1));break;
      case'daoNatureMajorV125':result=rt.api.chooseDaoNatureMajorBranchV125(String(body.tierId??''),String(body.branch??''));break;
      case'techniqueRestoreV125':result=rt.api.restoreTechniqueManualV125(String(body.techniqueId??''));break;
      case'passiveUpgradeV125':result=rt.api.upgradeDaoPassiveV125(String(body.passiveId??''),String(body.sourceTechniqueId??''));break;
      case'heartMethodUpgradeV12317':result=rt.api.strengthenHeartMethodV12325(String(body.heartMethodId??body.passiveId??''));break;
      case'skillUpgradeV12317':result=rt.api.upgradeBattleDaoSkillV12317(String(body.skillId??''));break;
      case'skillAdvanceV12317':result=rt.api.advanceBattleDaoSkillV12317(String(body.skillId??''));break;
      case'techniqueEquip':result=rt.api.equipTechniqueManual(String(body.techniqueId??''));break;
      case'techniqueStudy':result=rt.api.studyTechniqueManual(String(body.techniqueId??''),Number(body.batches??1));break;
      case'economyOfferV89':result=rt.api.buyEconomyOfferV89(String(body.offerId??''),Number(body.nowUnixMs??Date.now()));break;
      case'economyRefreshV111':result=rt.api.refreshPhuongThiV111();break;
      case'economyBuyV111':result=rt.api.buyPhuongThiV111(String(body.slotId??''),Number(body.quantity??1));break;
      case'economySellV111':result=rt.api.sellEconomyMaterialV111(String(body.resourceId??''),Number(body.quantity??1));break;
      case'economyConvertV111':result=rt.api.convertEconomyMaterialV111(String(body.resourceId??''),Number(body.batches??1));break;
      case'pvpJoinV91':result=rt.api.joinPvpV91(Number(body.nowUnixMs??Date.now()));break;
      case'pvpDefenseV91':result=rt.api.refreshPvpDefenseV91(Number(body.nowUnixMs??Date.now()));break;
      case'pvpTacticalV94':result=rt.api.setPvpTacticalV94(String(body.presetId??'balanced'),Number(body.nowUnixMs??Date.now()));break;
      case'pvpChallengeV91':result=rt.api.challengePvpV91(String(body.opponentId??''),Number(body.nowUnixMs??Date.now()));break;
      case'pvpSeasonSettleV94':result=rt.api.settlePvpSeasonV94(Number(body.nowUnixMs??Date.now()));break;
      case'manualGachaRealmV127':result=rt.api.setManualGachaRealmV127(Number(body.realmStageIndex??0));break;
      case'manualGachaOrientationV127':result=rt.api.setManualGachaOrientationV127(String(body.manualId??''));break;
      case'collectionGachaV12326':result=rt.api.gachaCollectionV12326(String(body.bannerId??'banner.manual'),Number(body.count??1),Boolean(body.usePremium));break;
      case'collectionComposeV12326':result=rt.api.composeCollectionV12326(String(body.itemId??''));break;
      case'collectionOriginActivateV12326':result=rt.api.activateOriginCollectionV12326(String(body.category??'bloodline'),String(body.itemId??''));break;
      case'collectionDailyV12326':throw new Error('V109: Phó Bản Daily cũ đã retire. Hãy vào Phó Bản > Bí Cảnh Tài Nguyên; first-clear bằng CombatKernel rồi treo farm theo thời gian.');
      case'collectionGachaSimV12326':result=rt.api.simulateCollectionGachaV12326(String(body.category??'manual'),Number(body.pulls??10000));break;
      case'devCollectionGrantV12326':if(!dev)throw new Error('DEV Mode chưa bật.');result=rt.api.devGrantCollectionV12326();break;
      case'petGearUpgradeV12328':result=rt.api.upgradePetGearV12328(String(body.petId??''),String(body.slot??'claw'));break;
      case'collectionGachaV12325':throw new Error('V100 đã khóa Gacha legacy V12325; hãy dùng banner riêng Vạn Tượng.');
      case'collectionStrengthenV12325':result=rt.api.strengthenCollectionV12325(String(body.itemId??''),Number(body.levels??1));break;
      case'collectionAdvanceV12325':result=rt.api.advanceCollectionV12325(String(body.itemId??''));break;
      case'confidantHeartV148':result=rt.api.spendConfidantHeartV148(String(body.itemId??''),String(body.branch??''));break;
      case'collectionEquipV12325':result=rt.api.equipCollectionV12325(String(body.itemId??''),Number.isFinite(Number(body.slotIndex))?Number(body.slotIndex):undefined);break;
      case'collectionUnequipV12325':result=rt.api.unequipCollectionV12325(String(body.itemId??''));break;
      case'heartMethodStrengthenV12325':result=rt.api.strengthenHeartMethodV12325(String(body.passiveId??body.heartMethodId??''));break;
      case'heartMethodAdvanceV12325':result=rt.api.advanceHeartMethodV12325(String(body.passiveId??body.heartMethodId??''));break;
      case'collectionDailyV12325':throw new Error('V109: Phó Bản Daily cũ đã retire. Hãy vào Phó Bản > Bí Cảnh Tài Nguyên; first-clear bằng CombatKernel rồi treo farm theo thời gian.');
      case'collectionGachaSimV12325':result=rt.api.simulateCollectionGachaV12325(String(body.bannerId??'banner.myriad'),Number(body.pulls??10000));break;
      case'devCollectionGrantV12325':if(!dev)throw new Error('DEV Mode chưa bật.');result=rt.api.devGrantCollectionV12325();break;
      case'collectionGachaV12316':throw new Error('V100 đã khóa Gacha legacy V12316; hãy dùng banner riêng Vạn Tượng.');
      case'collectionStrengthenV12316':result=rt.api.strengthenCollectionV12316(String(body.itemId??''),Number(body.levels??1));break;
      case'collectionAdvanceV12316':result=rt.api.advanceCollectionV12316(String(body.itemId??''));break;
      case'collectionEquipV12316':result=rt.api.equipCollectionV12316(String(body.itemId??''));break;
      case'collectionUnequipV12316':result=rt.api.unequipCollectionV12316(String(body.itemId??''));break;
      case'collectionDailyV12316':throw new Error('V109: Phó Bản Daily cũ đã retire. Hãy vào Phó Bản > Bí Cảnh Tài Nguyên; first-clear bằng CombatKernel rồi treo farm theo thời gian.');
      case'caveUpgradeV12316':result=rt.api.upgradeCaveFacilityV12316(String(body.facilityId??'alchemy'));break;
      case'spiritualRootNourishV145':result=rt.api.nourishSpiritualRootV145(Math.max(1,Number(body.levels)||1));break;
      case'spiritualRootAscendV145':result=rt.api.ascendSpiritualRootV145();break;
      case'spiritualRootMeridianV145':result=rt.api.allocateSpiritualRootMeridianV145(String(body.branchId??''));break;
      case'spiritualRootInsightV145':result=rt.api.chooseSpiritualRootInsightV145(String(body.insightId??''));break;
      case'spiritualRootCombineOriginV145':result=rt.api.combineSpiritualRootOriginV145(Math.max(1,Number(body.fromRealmTier)||1),Math.max(1,Number(body.batches)||1));break;
      case'cultivationDaoFruit':throw new Error('Đạo Quả của hệ Đạo Lộ/Tu Hệ cũ đã ngừng hoạt động.');
      case'visualProfile':result=rt.setVisualProfile({characterSkinId:body.characterSkinId?String(body.characterSkinId):undefined,characterBackgroundId:body.characterBackgroundId?String(body.characterBackgroundId):undefined,selectedExpression:body.selectedExpression?String(body.selectedExpression):undefined});break;
      case'reincarnate':result=rt.api.reincarnate(body.plan??{});break;
      case'endlessFight':result=rt.fightNow(false);break;
      case'endlessBoss':result=rt.fightNow(true);break;
      case'endlessFloor':result=rt.api.selectEndlessFloor(Number(body.floor??1));break;
      case'endlessAutoAdvance':result=rt.api.setEndlessAutoAdvance(Boolean(body.enabled));break;
      case'useCultivationPill':result=rt.api.useCultivationPill();break;
      case'retreatV140':result=rt.resolveInstantRetreat(Number(body.hours??3));break;
      case'ascendRealmV140':result=rt.api.ascendRealm();break;
      case'realtimeMode':{const requested=String(body.mode??'idle');rt.setMode(requested);result={ok:true,type:'activity',summaryLines:[`Đã chuyển hoạt động: ${requested}.`],changedWorldYears:0};break;}
      case'huntAutoCombat':rt.setAutoCombat(Boolean(body.enabled));result={ok:true,type:'activity',summaryLines:[Boolean(body.enabled)?'Đã bật Tự Săn Ảo ở bãi farm hiện tại. Tu Luyện vẫn 100%.':'Đã tắt Tự Săn Ảo. Boss vẫn có thể khiêu chiến riêng; Tu Luyện vẫn 100%.'],changedWorldYears:0};break;
      case'realtimePause':rt.setPaused(Boolean(body.paused));result={ok:true,type:'activity',summaryLines:[Boolean(body.paused)?'Đã tạm dừng thời gian thực.':'Đã tiếp tục thời gian thực.'],changedWorldYears:0};break;
      case'devSandboxSyncSave':if(!dev)throw new Error('Dev Sandbox chỉ dùng qua /api/dev/*');if(!body.save)throw new Error('Thiếu save production để đồng bộ DEV.');{const notices=rt.load(body.save,Date.now());result={schema:'dev-combat-sync.v1',saveSafe:true,synced:true,notices};}break;
      case'devSandboxPreset':if(!dev)throw new Error('Dev Sandbox chỉ dùng qua /api/dev/*');result=rt.applyDevSandboxPreset({realmOrder:body.realmOrder,dao:body.dao,forceBoss:body.forceBoss});break;
      case'devSkillLabV12317':if(!dev)throw new Error('DEV Skill Lab chỉ dùng qua /api/dev/*');result=rt.applyDevSkillLabV12317({realmOrder:body.realmOrder,mainDao:body.mainDao,secondaryDao:body.secondaryDao,forceBoss:body.forceBoss,maxProgress:body.maxProgress,statPreset:body.statPreset});break;
      case'devSkillTuneV12317':if(!dev)throw new Error('DEV Skill Tune chỉ dùng qua /api/dev/*');result=rt.tuneDevSkillV12317({skillId:body.skillId,level:body.level,grade:body.grade,mastery:body.mastery});break;
      default:throw new Error(`Action web không hỗ trợ: ${action}`);
    }
    rt.invalidateModeRateCache();
    const clientView=typeof body.clientView==='string'&&body.clientTransport==='view-patch.v140'?body.clientView:'';
    const clientSubview=String(body.clientSubview||'');
    if(clientView){
      const payload=rt.viewPayload(clientView,clientSubview,result,[],false);
      sendJson(res,200,{...payload,saveDirty:true});
    }else sendJson(res,200,rt.payload(result));
    return;
  }
  sendJson(res,404,{ok:false,error:'API route not found'});
}

function jsonResponse(value,status=200){
  // Standalone API executes in the same browser realm. Returning a lightweight response object
  // lets request().json() receive the DTO directly instead of stringify -> UTF-8 -> parse on every click.
  const headers=typeof Headers==='function'?new Headers({'content-type':'application/json; charset=utf-8','cache-control':'no-store'}):{get:()=>null};
  return {
    ok:status>=200&&status<300,status,headers,
    async json(){return value;},
    async text(){return JSON.stringify(value);},
    clone(){return jsonResponse(value,status);},
  };
}
function decodeBody(init){
  if(!init||init.body==null)return {};
  if(typeof init.body==='string'){try{return JSON.parse(init.body)}catch{return {}}}
  return init.body;
}
globalThis.fetch=async function standaloneFetch(input,init={}){
  const raw=typeof input==='string'?input:(input?.url||String(input));
  const base=(globalThis.location?.protocol==='http:'||globalThis.location?.protocol==='https:')?globalThis.location.href:(globalThis.document?.baseURI||'http://127.0.0.1/');
  const url=new URL(raw,base);
  if(url.pathname.startsWith('/api/')){
    const req={method:String(init.method||'GET').toUpperCase(),__body:decodeBody(init),socket:{remoteAddress:'standalone'}};
    const res={status:200,value:null,sent:false,writeHead(status){this.status=status;},end(raw){if(this.value==null&&raw){try{this.value=JSON.parse(raw)}catch{this.value={ok:false,error:String(raw)}}}}};
    try{await handleApi(req,res,url);}
    catch(error){return jsonResponse({ok:false,error:error instanceof Error?error.message:String(error)},400);}
    return jsonResponse(res.value??{ok:false,error:'Standalone API không trả dữ liệu.'},res.status||200);
  }
  return __nativeFetch(input,init);
};
let runtimeHeartbeatTimerV129=0;
function runtimeHeartbeatDelayV129(){return globalThis.document?.hidden?5000:1000;}
function scheduleRuntimeHeartbeatV129(delay=runtimeHeartbeatDelayV129()){
  clearTimeout(runtimeHeartbeatTimerV129);
  runtimeHeartbeatTimerV129=setTimeout(()=>{
    runtime.maybeTick();
    if(devRuntime)devRuntime.maybeTick();
    scheduleRuntimeHeartbeatV129();
  },Math.max(250,Number(delay)||1000));
}
if(globalThis.document?.addEventListener)globalThis.document.addEventListener('visibilitychange',()=>scheduleRuntimeHeartbeatV129(globalThis.document.hidden?5000:100));
scheduleRuntimeHeartbeatV129(1000);
globalThis.__TUTIEN_STANDALONE_SAVE_ENVELOPE__=()=>{runtime.flushRealtime();return runtime.saveEnvelope(Date.now());};
globalThis.__TUTIEN_STANDALONE__=true;
globalThis.dispatchEvent(new CustomEvent('tutien-standalone-ready',{detail:{version:GAME_VERSION}}));
console.info(`[standalone] Tu Tiên Nhàn Rỗi ${GAME_VERSION} local runtime ready`);
