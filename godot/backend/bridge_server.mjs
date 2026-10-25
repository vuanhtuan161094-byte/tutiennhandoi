import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildRegistry } from '../../dist/content/registry.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { createGameApplicationApi } from '../../dist/core/game-api.js';
import { SimulationSession } from '../../dist/core/session.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import { battleDaoV2Catalog } from '../../dist/content/battle-dao-v2-catalog.js';
import { createInitialLifeMeta } from '../../dist/core/life.js';
import { buildWebClientViewPatch } from '../../dist/core/client-shell.js';
import { mapStartFloorForRealm } from '../../dist/content/realm-maps.js';
import { createWebClientSave, parseWebClientSave } from '../../dist/core/web-save.js';
import { LIVE_COMMIT_REAL_SECONDS } from '../../dist/core/realtime-balance.js';
import { highestClearedDungeonFloor } from '../../dist/core/dungeon.js';
import { tribulationMilestoneBlockersV113 } from '../../dist/core/progression-closure-v113.js';
import { equipmentSetDefinitionV142 } from '../../dist/core/equipment-v142.js';
import { grantEquipmentFragmentRankV142 } from '../../dist/core/equipment-fragments-v142.js';
import { applyBodyDaoAutoPresetV1, bodyDaoAutoUiV1, normalizeBodyDaoAutoPresetV1 } from '../../dist/core/body-dao-auto-v1.js';
import { buildCombatSnapshot, buildGodotCombatView, createCombatPlayback } from './combat_presentation.mjs';

const HERE=dirname(fileURLToPath(import.meta.url));
const BRIDGE_VERSION='godot-bridge.v2';
const SAVE_PATH=process.env.TUTIEN_GODOT_BRIDGE_SAVE
  ? resolve(process.env.TUTIEN_GODOT_BRIDGE_SAVE)
  : resolve(HERE,'../.runtime/godot-bridge-save.json');
const PORT=Math.max(1,Math.min(65535,Number(process.argv[2]||4190)||4190));
const HOST='127.0.0.1';
const DIAGNOSTIC_MODE=process.env.TUTIEN_GODOT_BRIDGE_DIAGNOSTIC==='1';
const QA_MODE=DIAGNOSTIC_MODE&&process.env.TUTIEN_GODOT_QA==='1';
const registry=buildRegistry();

class GodotCanonicalRuntime {
  constructor(){
    this.session=null;
    this.game=null;
    this.api=null;
    this.carry=0;
    this.lastTickAt=Date.now();
    this.dirty=false;
    this.qaFixture='';
    this.qaFixtureSeq=0;
    this.combatPlayback=null;
    this.combatSerial=0;
    this.newGame();
  }
  attach(session){
    this.session=session;
    this.game=new GameplayFacade(session,registry,thanhHaWorld);
    this.api=createGameApplicationApi(this.game);
  }
  newGame(seed=Date.now()>>>0){
    const state=createPlayableAdventureState();
    const life=createInitialLifeMeta(seed);
    const origins=life.birth.originsV101;
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
    this.carry=0;
    this.lastTickAt=Date.now();
    this.combatPlayback=null;
    this.combatSerial=0;
    this.dirty=true;
  }
  saveEnvelope(now=Date.now()){
    return createWebClientSave(this.api,now,{mode:'idle',activity:'idle',autoCombat:false,paused:false,carryRealSeconds:this.carry},{characterSkinId:'skin.white_immortal',characterBackgroundId:'bg.ink_mountain',selectedExpression:'neutral'});
  }
  loadEnvelope(value){
    let envelope;
    try{envelope=parseWebClientSave(value);}catch{envelope={game:value};}
    this.attach(SimulationSession.restore(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,envelope.game));
    this.carry=Math.max(0,Number(envelope?.runtime?.carryRealSeconds)||0);
    this.lastTickAt=Date.now();
    this.dirty=false;
  }
  flushRealtime(now=Date.now()){
    if(!this.session?.stateValue?.alive){this.lastTickAt=now;return;}
    const elapsed=Math.max(0,(now-this.lastTickAt)/1000);
    if(elapsed<=0)return;
    this.lastTickAt=now;
    const available=this.carry+elapsed;
    const commits=Math.floor((available+1e-9)/LIVE_COMMIT_REAL_SECONDS);
    this.carry=Math.max(0,available-commits*LIVE_COMMIT_REAL_SECONDS);
    if(commits>0){
      this.session.advanceRealtimeCultivationV140(commits*LIVE_COMMIT_REAL_SECONDS);
      this.dirty=true;
    }
  }
  applyQaHomeFixture(view){
    if(!QA_MODE||!this.qaFixture)return view;
    view.diagnostic={
      qa:true,
      fixture:this.qaFixture,
      sequence:this.qaFixtureSeq,
      previewOnly:this.qaFixture==='tribulation',
    };
    const lingMatch=/^ling([234])$/.exec(this.qaFixture);
    if(lingMatch){
      const multiplier=Number(lingMatch[1]);
      view.cultivation.reincarnationR3.lastLingGuangMultiplier=multiplier;
      view.cultivation.reincarnationR3.lastLingGuangTick=100000+this.qaFixtureSeq;
    }
    return view;
  }
  seedQaInventory(){
    this.newGame(161094);
    const state=this.session.stateValue;
    grantEquipmentFragmentRankV142(state,0,10000,'godot-p2-qa');
    const craft=(slot)=>{
      this.api.perform({type:'craftEquipmentV142',slot,rankIndex:0});
      const items=Array.isArray(this.session.stateValue?.equipment?.items)?this.session.stateValue.equipment.items:[];
      return String(items.at(-1)?.id||'');
    };
    const weaponIds=[craft('weapon'),craft('weapon'),craft('weapon')].filter(Boolean);
    if(weaponIds.length===3){
      this.api.perform({type:'mergeEquipmentV142',mainItemId:weaponIds[0],fodderItemAId:weaponIds[1],fodderItemBId:weaponIds[2]});
    }
    const attireIds=[weaponIds[0],craft('head'),craft('robe'),craft('gloves')].filter(Boolean);
    const jewelryIds=[craft('necklace'),craft('ring'),craft('talisman')].filter(Boolean);
    if(attireIds[0])this.api.perform({type:'equip',itemId:attireIds[0]});
    if(attireIds[2])this.api.perform({type:'equip',itemId:attireIds[2]});
    if(jewelryIds[1])this.api.perform({type:'equip',itemId:jewelryIds[1]});
    this.dirty=true;
    return {
      fixture:'inventory',
      canonical:true,
      itemCount:Array.isArray(this.session.stateValue?.equipment?.items)?this.session.stateValue.equipment.items.length:0,
      rank0FragmentBalance:Number(this.session.stateValue?.equipmentFragmentsV142?.byRank?.['resource.equipment.fragment.v142.rank.0']||0),
      attireSetFragmentBalance:Number(this.session.stateValue?.equipmentSetFragmentsV142?.bySetId?.['set.v142.attire.metal']||0),
      jewelrySetFragmentBalance:Number(this.session.stateValue?.equipmentSetFragmentsV142?.bySetId?.['set.v142.jewelry.huyen_nguyen']||0),
    };
  }
  prepareQaAscend(){
    this.newGame(161094);
    const summary=this.session.cultivationSummaryV140();
    if(summary.transition!=='ascend')throw new Error(`QA ascend fixture expected major gate, got ${summary.transition}`);
    this.session.stateValue.cultivation.tuVi=Math.max(0,Number(summary.requiredTuVi)||0);
    this.dirty=true;
    return {fixture:'ascend',canonical:true,realmOrder:summary.realmOrder,requiredTuVi:summary.requiredTuVi};
  }
  prepareQaTribulation(){
    this.newGame(161094);
    while(this.session.stateValue.realm.maxRealmOrder<41){
      const current=this.session.registry.realm(this.session.stateValue.realm.realmId);
      if(!current?.nextRealmId)throw new Error('QA tribulation fixture cannot advance to order 41.');
      this.session.applyRealmTransitionV140(current.nextRealmId,'diagnostic');
    }
    const summary=this.session.cultivationSummaryV140();
    if(summary.transition!=='tribulation')throw new Error(`QA tribulation fixture expected gate, got ${summary.transition}`);
    this.session.stateValue.cultivation.tuVi=Math.max(0,Number(summary.requiredTuVi)||0);
    this.dirty=true;
    const greatVehicleClearedFloor=highestClearedDungeonFloor(this.session.stateValue.dungeons,'dungeon.great_vehicle_domain');
    const milestoneBlockers=tribulationMilestoneBlockersV113(this.session.stateValue,this.session.stateValue.dungeons);
    return {
      fixture:'tribulation',
      canonicalGate:true,
      previewOnly:true,
      realmOrder:summary.realmOrder,
      requiredTuVi:summary.requiredTuVi,
      greatVehicleClearedFloor,
      milestoneBlockers:[...milestoneBlockers],
      note:'Milestone blockers remain canonical; QA does not bypass dungeon prerequisites.',
    };
  }
  prepareQaArtifact(){
    this.newGame(161094);
    // QA progression only; use canonical transitions/learning/loadout/Auto APIs.
    // No fabricated combat result, damage, resource, gauge or readiness is injected.
    while(this.session.stateValue.realm.maxRealmOrder<102){
      const realm=registry.realm(this.session.stateValue.realm.realmId);
      this.session.applyRealmTransitionV140(realm.nextRealmId,'diagnostic');
    }
    this.session.commitSpecializationV125('orthodox','artifact');
    const catalog=battleDaoV2Catalog('artifact');
    for(const row of catalog.tree)this.session.learnSkill(row.activeSkillId);
    const ids=[catalog.basicSkillId,...['deploy','split','strike','merge','suppress'].map(id=>'skill.dao.artifact.'+id),catalog.ultimateSkillId];
    this.session.setCombatLoadout(ids,battleDaoAutoRotationV127('artifact',ids));
    this.dirty=true;
    return {fixture:'artifact',canonical:true,realmOrder:this.session.stateValue.realm.maxRealmOrder,skillIds:this.session.canonicalActiveSkillIds()};
  }
  prepareQaEndgameBoss(){
    // Build an isolated QA player with the canonical Artifact loadout, advance by
    // canonical realm transitions, and select the first Boss floor of its realm.
    // This fixture is QA-only and persists only to the caller-supplied disposable save.
    this.prepareQaArtifact();
    while(this.session.stateValue.realm.maxRealmOrder<114){
      const realm=registry.realm(this.session.stateValue.realm.realmId);
      if(!realm?.nextRealmId)throw new Error('QA Endgame Boss fixture cannot reach realm order 114.');
      this.session.applyRealmTransitionV140(realm.nextRealmId,'diagnostic');
    }
    const realmOrder=this.session.stateValue.realm.maxRealmOrder;
    const floor=mapStartFloorForRealm(realmOrder);
    const hunt=this.session.selectEndlessFloor(floor);
    this.dirty=true;
    if(!hunt?.bossReady)throw new Error(`QA Endgame Boss fixture expected canonical Boss readiness at floor ${floor}.`);
    return {
      fixture:'endgame-boss',
      canonical:true,
      realmOrder,
      floor,
      bossReady:Boolean(hunt.bossReady),
      monsterId:String(hunt.monster?.id||''),
      monsterName:String(hunt.monster?.name||''),
      monsterGrade:String(hunt.monster?.gradeId||''),
      skillIds:this.session.canonicalActiveSkillIds(),
    };
  }
  setQaFixture(value){
    if(!QA_MODE)throw new Error('QA fixture chỉ khả dụng trong isolated QA mode.');
    const fixture=String(value||'').trim().toLowerCase();
    const allowed=new Set(['clear','inventory','ling2','ling3','ling4','ascend','tribulation','artifact','endgame-boss']);
    if(!allowed.has(fixture))throw new Error('QA fixture không hợp lệ: '+fixture);
    this.qaFixtureSeq+=1;
    if(fixture==='clear'){
      this.qaFixture='';
      this.newGame(161094);
      this.qaFixture='';
      return {fixture:'clear',canonical:true,reset:true};
    }
    this.qaFixture=fixture;
    if(fixture==='inventory')return this.seedQaInventory();
    if(fixture==='ascend')return this.prepareQaAscend();
    if(fixture==='tribulation')return this.prepareQaTribulation();
    if(fixture==='artifact')return this.prepareQaArtifact();
    if(fixture==='endgame-boss')return this.prepareQaEndgameBoss();
    return {fixture,canonical:false,presentationOnly:true,multiplier:Number(fixture.slice(-1))||1};
  }
  homeView(){
    this.flushRealtime();
    const now=Date.now();
    this.api.syncForgingV12328(now);
    const patch=buildWebClientViewPatch(this.api,'cultivation',now,'');
    const overview=patch.overview||{};
    const canonicalOverview=this.api.getOverview?.()||overview||{};
    const dashboard=this.game.dashboard?.()||{};
    const life=overview.life||canonicalOverview.life||{};
    const cultivation=patch.character||overview.cultivation||canonicalOverview.cultivation||{};
    const cultivationCommitSeconds=Math.max(0.001,Number(LIVE_COMMIT_REAL_SECONDS)||15);
    const cultivationPhaseSeconds=Math.max(0,Math.min(cultivationCommitSeconds,Number(this.carry)||0));
    const cultivationCanonicalTuVi=Math.max(0,Number(cultivation.tuVi)||0);
    const cultivationRequiredTuVi=Math.max(0,Number(cultivation.requiredTuVi)||0);
    const cultivationBasePer15=Math.max(0,Number(cultivation.baseTuViPer15s)||0);
    const cultivationFinalPer15=Math.max(0,Number(cultivation.finalTuViPer15s)||0);
    const cultivationBasePerSecondExact=cultivationBasePer15/cultivationCommitSeconds;
    const cultivationFinalPerSecondExact=cultivationFinalPer15/cultivationCommitSeconds;
    const cultivationBasePerSecond=Math.ceil(cultivationBasePerSecondExact);
    const cultivationFinalPerSecond=Math.ceil(cultivationFinalPerSecondExact);
    const cultivationLiveTuVi=cultivationRequiredTuVi>0
      ? Math.min(cultivationRequiredTuVi,cultivationCanonicalTuVi+cultivationFinalPerSecondExact*cultivationPhaseSeconds)
      : cultivationCanonicalTuVi;
    const cultivationR3=this.session?.stateValue?.cultivation?.reincarnationR3||{};
    const character=this.api.getCharacter();
    const root=this.api.getSpiritualRootV145();
    const stones=(patch.inventory||[]).find(x=>x.id==='resource.spirit_stone')?.quantity??0;
    const cp=patch.shell?.reincarnationCp??this.api.getReincarnation()?.cp??0;
    const view={
      ok:true,
      schema:'godot-home-bridge.v1',
      bridgeVersion:BRIDGE_VERSION,
      authority:{
        cultivation:'character-cultivation.v140',
        transport:'web-client-view-patch.v140',
        lockedRuntime:'V160-V179'
      },
      generatedAtUnixMs:now,
      character:{
        name:String(character?.name||life.name||'Tu Sĩ'),
        root:String(character?.root||'')
      },
      life:{
        lifeNumber:Number(life.lifeNumber||1),
        realm:String(cultivation.realm||life.realm||'Phàm Nhân'),
        realmOrder:Number(cultivation.realmOrder??life.realmOrder??0),
        ageYears:Number(life.ageYears||0),
        lifespanYears:Number(life.lifespanYears||0),
        alive:life.alive!==false
      },
      cultivation:{
        tuVi:cultivationCanonicalTuVi,
        liveTuVi:cultivationLiveTuVi,
        requiredTuVi:cultivationRequiredTuVi,
        progressPct:Math.max(0,Math.min(100,Number(cultivation.progressPct)||0)),
        baseTuViPer15s:cultivationBasePer15,
        finalTuViPer15s:cultivationFinalPer15,
        baseTuViPerSecond:cultivationBasePerSecond,
        finalTuViPerSecond:cultivationFinalPerSecond,
        commitIntervalSeconds:cultivationCommitSeconds,
        commitPhaseSeconds:cultivationPhaseSeconds,
        reincarnationR3:{
          selfTicks:Math.max(0,Math.floor(Number(cultivationR3.selfTicks)||0)),
          lastLingGuangMultiplier:Math.max(1,Math.min(10,Number(cultivationR3.lastLingGuangMultiplier)||1)),
          lastLingGuangTick:Math.max(0,Math.floor(Number(cultivationR3.lastLingGuangTick)||0)),
          tribulationTemperStacks:Math.max(0,Math.min(5,Math.floor(Number(cultivationR3.tribulationTemperStacks)||0)))
        },
        sources:Array.isArray(cultivation.sources)?cultivation.sources.map(x=>({
          id:String(x?.id||''),
          label:String(x?.label||x?.name||x?.id||''),
          kind:String(x?.kind||''),
          value:Number(x?.value)||0
        })):[],
        etaRealSeconds:Math.max(0,Number(cultivation.etaRealSeconds)||0),
        injury:Math.max(0,Number(cultivation.injury??overview.injury)||0),
        ready:Boolean(cultivation.ready),
        transition:String(cultivation.transition||'auto'),
        nextRealm:String(cultivation.nextRealm||''),
        retreat:{
          bankHours:Math.max(0,Number(cultivation?.retreat?.bankHours)||0),
          capHours:Math.max(0,Number(cultivation?.retreat?.capHours)||9),
          dailyAccrualHours:Math.max(0,Number(cultivation?.retreat?.dailyAccrualHours)||3),
          rewardPct3h:Math.max(0,Number(cultivation?.retreat?.rewardPct3h)||0),
          rewardPctPerHour:Math.max(0,Number(cultivation?.retreat?.rewardPctPerHour)||0),
          enabled:Math.max(0,Number(cultivation?.retreat?.rewardPct3h)||0)>0
        }
      },
      spiritualRoot:{
        name:String(root?.grade?.name||character?.root||'Phàm Căn'),
        level:Number(root?.grade?.level||0)
      },
      resources:{
        spiritStone:Number(stones)||0,
        reincarnationCp:Number(cp)||0
      },
      homeContext:{
        actions:Array.isArray(canonicalOverview.actions)?canonicalOverview.actions.map(x=>({
          key:String(x?.key||''),
          label:String(x?.label||''),
          priority:String(x?.priority||'normal'),
          reason:String(x?.reason||'')
        })):[],
        hints:Array.isArray(dashboard.activityHints)?dashboard.activityHints.map(String).slice(0,4):[],
        majorEvents:Array.isArray(dashboard.majorEvents)?dashboard.majorEvents.map(String).slice(0,4):[],
        activeTechnique:String(dashboard.activeTechnique||''),
        build:{
          score:Number(canonicalOverview?.build?.score)||0,
          identity:String(canonicalOverview?.build?.identity||''),
          strongestAxis:String(canonicalOverview?.build?.strongestAxis||''),
          bottleneckAxis:String(canonicalOverview?.build?.bottleneckAxis||''),
          unspentPotential:Number(canonicalOverview?.potential?.unspent)||0
        },
        hunt:{
          selectedFloor:Number(canonicalOverview?.endlessHunt?.selectedFloor)||0,
          highestUnlockedFloor:Number(canonicalOverview?.endlessHunt?.highestUnlockedFloor)||0,
          monsterName:String(canonicalOverview?.endlessHunt?.monsterName||''),
          monsterGrade:String(canonicalOverview?.endlessHunt?.monsterGrade||'')
        }
      }
    };
    return this.applyQaHomeFixture(view);
  }
  combatView(after=0){
    this.flushRealtime();
    return buildGodotCombatView({
      session:this.session,
      api:this.api,
      registry,
      playback:this.combatPlayback,
      after,
      bridgeVersion:BRIDGE_VERSION,
    });
  }
  characterView(selectedItemId=''){
    this.flushRealtime();
    const now=Date.now();
    this.api.syncForgingV12328(now);
    const patch=buildWebClientViewPatch(this.api,'character',now,'');
    const selectedEquipmentId=String(selectedItemId||'').trim();
    let equipmentInventory=this.api.getEquipmentInventoryV129(selectedEquipmentId);
    if(selectedEquipmentId){
      try{
        const impact=this.session.equipmentCombatImpact(selectedEquipmentId);
        equipmentInventory=equipmentInventory.map(row=>row?.id===selectedEquipmentId?{
          ...row,
          powerDeltaPct:Number(impact?.deltaPct)||0,
          powerAfter:Number(impact?.scoreAfter)||0,
          powerImpactDeferredV129:false,
        }:row);
      }catch{}
    }
    const equipmentSystem=patch.equipmentSystem||{};
    const v142=equipmentSystem.v142||{};
    const v142SetRows=Array.isArray(v142.setRows)?v142.setRows.map(row=>{
      const definition=equipmentSetDefinitionV142(row?.setId);
      const bonuses=Array.isArray(definition?.bonuses)?definition.bonuses:[];
      return {
        ...row,
        thresholds:Array.isArray(row?.thresholds)?row.thresholds.map(threshold=>{
          const bonus=bonuses.find(candidate=>Number(candidate?.pieces)===Number(threshold?.pieces));
          return {
            ...threshold,
            statMultipliers:bonus?.statMultipliers?{...bonus.statMultipliers}:{},
            flatStats:bonus?.flatStats?{...bonus.flatStats}:{},
          };
        }):[],
      };
    }):[];
    const godotEquipmentSystem={
      ...equipmentSystem,
      v142:{...v142,setRows:v142SetRows},
    };
    const state=this.session.stateValue;
    const mainDaoId=String(state?.character?.buildFoundation?.battleDao?.mainDaoId||'');
    const bodyAuto=bodyDaoAutoUiV1(state?.character?.combatAiProfile,mainDaoId==='body');
    return {
      ok:true,
      schema:'godot-character-bridge.v1',
      bridgeVersion:BRIDGE_VERSION,
      authority:{
        equipment:'equipment.v142',
        stats:'combat-stat.v168',
        transport:'web-client-view-patch.v140',
        lockedRuntime:'V160-V179'
      },
      generatedAtUnixMs:now,
      overview:patch.overview||{},
      character:patch.character||{},
      spiritualRoot:patch.spiritualRoot||{},
      bodyAuto,
      equipment:Array.isArray(patch.equipment)?patch.equipment:[],
      equipmentInventory,
      equipmentSelection:{selectedItemId:selectedEquipmentId},
      equipmentSystem:godotEquipmentSystem,
      inventoryResources:Array.isArray(this.api.getInventory?.())?this.api.getInventory():[],
    };
  }
  action(id,payload={}){
    this.flushRealtime();
    let result;
    if(id==='retreatV140')result=this.api.instantRetreat(Math.max(.25,Number(payload.hours)||1));
    else if(id==='useCultivationPill')result=this.api.useCultivationPill();
    else if(id==='ascendRealmV140')result=this.api.ascendRealm();
    else if(id==='tribulationV140')result=this.api.perform({type:'tribulation',intensity:1});
    else if(id==='setBodyAutoPresetV1'){
      const state=this.session.stateValue;
      const mainDaoId=String(state?.character?.buildFoundation?.battleDao?.mainDaoId||'');
      if(mainDaoId!=='body')throw new Error('Auto Thể Đạo chỉ khả dụng khi Thể Đạo là Chủ Đạo.');
      const presetId=normalizeBodyDaoAutoPresetV1(payload.presetId);
      const profile=state?.character?.combatAiProfile;
      if(!profile||!Array.isArray(profile.rules))throw new Error('Chưa có Auto Bản Đạo để áp dụng preset.');
      const next=applyBodyDaoAutoPresetV1(profile,presetId);
      state.character.combatAiProfile=next;
      result=bodyDaoAutoUiV1(next,true);
    }
    else if(id==='fightEndlessFloor'){
      const initialSnapshot=buildCombatSnapshot({session:this.session,api:this.api,registry});
      try{
        const combat=this.api.fightEndlessFloor({emitCombatEvents:true,cloneState:false});
        this.combatSerial+=1;
        this.combatPlayback=createCombatPlayback({result:combat,initialSnapshot,serial:this.combatSerial});
        result={
          ok:true,
          encounterId:this.combatPlayback.encounterId,
          won:Boolean(combat?.won),
          battleSeconds:Number(combat?.battleSeconds)||0,
          eventCount:this.combatPlayback.events.length,
          rewardContext:String(combat?.rewardContext||''),
          directBossLoot:Boolean(combat?.directBossLoot),
        };
      }catch(error){
        result={ok:false,error:error instanceof Error?error.message:String(error)};
      }
    }
    else if(id==='selectEndlessFloor'){
      const floor=Math.max(1,Math.floor(Number(payload.floor)||1));
      try{
        result={ok:true,hunt:this.api.selectEndlessFloor(floor)};
        this.combatPlayback=null;
      }catch(error){
        result={ok:false,error:error instanceof Error?error.message:String(error)};
      }
    }
    else if(id==='equipItem'){
      const itemId=String(payload.itemId||'').trim();
      if(!itemId)throw new Error('Thiếu itemId trang bị.');
      result=this.api.perform({type:'equip',itemId});
    }
    else if(id==='enhanceEquipment'){
      const itemId=String(payload.itemId||'').trim();
      if(!itemId)throw new Error('Thiếu itemId trang bị.');
      result=this.api.perform({
        type:'enhanceEquipment',
        itemId,
        useProtection:Boolean(payload.useProtection)
      });
    }
    else if(id==='transferEquipmentEnhancement'){
      const fromItemId=String(payload.fromItemId||'').trim();
      const toItemId=String(payload.toItemId||'').trim();
      if(!fromItemId||!toItemId)throw new Error('Thiếu trang bị nguồn/đích để chuyển cường hóa.');
      result=this.api.perform({type:'transferEquipmentEnhancement',fromItemId,toItemId});
    }
    else if(id==='craftEquipmentV142'){
      const slot=String(payload.slot||'').trim();
      const rankIndex=Math.max(0,Math.floor(Number(payload.rankIndex)||0));
      if(!slot)throw new Error('Thiếu ô trang bị để Luyện.');
      result=this.api.perform({type:'craftEquipmentV142',slot,rankIndex});
    }
    else if(id==='refineEquipmentFragmentsV142'){
      const fromRank=Math.max(0,Math.floor(Number(payload.fromRank)||0));
      const batches=Math.max(1,Math.min(999,Math.floor(Number(payload.batches)||1)));
      result=this.api.perform({type:'refineEquipmentFragmentsV142',fromRank,batches});
    }
    else if(id==='mergeEquipmentV142'){
      const mainItemId=String(payload.mainItemId||'').trim();
      const fodderItemAId=String(payload.fodderItemAId||'').trim();
      const fodderItemBId=String(payload.fodderItemBId||'').trim();
      if(!mainItemId||!fodderItemAId||!fodderItemBId)throw new Error('Hợp thành cần đủ 3 trang bị.');
      result=this.api.perform({type:'mergeEquipmentV142',mainItemId,fodderItemAId,fodderItemBId});
    }
    else if(id==='engraveEquipmentSetV142'){
      const itemId=String(payload.itemId||'').trim();
      const setId=String(payload.setId||'').trim();
      if(!itemId||!setId)throw new Error('Thiếu trang bị hoặc Set để Khắc.');
      result=this.api.perform({type:'engraveEquipmentSetV142',itemId,setId});
    }
    else if(id==='reforgeEquipmentAffixV115'){
      const itemId=String(payload.itemId||'').trim();
      const index=Math.max(0,Math.floor(Number(payload.index)||0));
      const targetFamily=String(payload.targetFamily||'').trim();
      if(!itemId)throw new Error('Thiếu trang bị để Tái Luyện Affix.');
      result=this.api.perform({type:'reforgeEquipmentAffixV115',itemId,index,...(targetFamily?{targetFamily}:{})});
    }
    else if(id==='refineEquipmentAffixV115'){
      const itemId=String(payload.itemId||'').trim();
      const index=Math.max(0,Math.floor(Number(payload.index)||0));
      if(!itemId)throw new Error('Thiếu trang bị để Tinh Luyện Affix.');
      result=this.api.perform({type:'refineEquipmentAffixV115',itemId,index});
    }
    else if(id==='nourishBloodline'){
      result=this.api.perform({type:'nourishBloodline',points:Math.max(1,Math.min(100,Number(payload.points)||10))});
    }
    else if(id==='advanceBloodline'){
      result=this.api.perform({type:'advanceBloodline',useProtection:Boolean(payload.useProtection)});
    }
    else if(id==='advancePhysique'){
      result=this.api.perform({type:'advancePhysique'});
    }
    else if(id==='spendPotential'){
      const statId=String(payload.statId||'').trim();
      if(!['power','body','defense'].includes(statId))throw new Error('Thuộc tính Tiềm Năng không hợp lệ.');
      const points=Math.max(1,Math.floor(Number(payload.points)||1));
      result=this.api.spendPotential(statId,points);
    }
    else if(id==='diagnosticFixture'&&QA_MODE){
      result=this.setQaFixture(payload.fixture);
    }
    else if(id==='diagnosticCommit'&&DIAGNOSTIC_MODE){
      const seconds=Math.max(LIVE_COMMIT_REAL_SECONDS,Math.min(3600,Number(payload.seconds)||LIVE_COMMIT_REAL_SECONDS));
      result=this.session.advanceRealtimeCultivationV140(seconds);
    }
    else throw new Error('Godot bridge action không hỗ trợ: '+id);
    this.dirty=true;
    return result;
  }
}

const runtime=new GodotCanonicalRuntime();

async function restorePersisted(){
  try{runtime.loadEnvelope(JSON.parse(await readFile(SAVE_PATH,'utf8')));}catch{}
}
async function persist(){
  try{
    await mkdir(dirname(SAVE_PATH),{recursive:true});
    await writeFile(SAVE_PATH,JSON.stringify(runtime.saveEnvelope(Date.now())),'utf8');
    runtime.dirty=false;
    return true;
  }catch(error){
    console.error('[godot-bridge] save failed:',error?.message||error);
    return false;
  }
}
await restorePersisted();

function send(res,status,value){
  const body=JSON.stringify(value);
  res.writeHead(status,{
    'content-type':'application/json; charset=utf-8',
    'cache-control':'no-store',
    'access-control-allow-origin':'*',
    'content-length':Buffer.byteLength(body)
  });
  res.end(body);
}
async function bodyJson(req){
  let raw='';
  for await(const chunk of req)raw+=chunk;
  if(!raw)return {};
  try{return JSON.parse(raw);}catch{return {};}
}

const server=createServer(async(req,res)=>{
  if(req.method==='OPTIONS'){res.writeHead(204,{'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'});res.end();return;}
  const url=new URL(req.url||'/',`http://${HOST}:${PORT}`);
  try{
    if(req.method==='GET'&&url.pathname==='/health')return send(res,200,{ok:true,schema:'godot-bridge-health.v1',bridgeVersion:BRIDGE_VERSION,port:PORT,authority:'canonical-dist',diagnosticMode:DIAGNOSTIC_MODE,qaMode:QA_MODE});
    if(req.method==='GET'&&url.pathname==='/home')return send(res,200,runtime.homeView());
    if(req.method==='GET'&&url.pathname==='/combat'){
      const after=Math.max(0,Math.floor(Number(url.searchParams.get('after'))||0));
      return send(res,200,runtime.combatView(after));
    }
    if(req.method==='GET'&&url.pathname==='/character'){
      const selectedItemId=String(url.searchParams.get('selectedItemId')||'').trim();
      return send(res,200,runtime.characterView(selectedItemId));
    }
    if(DIAGNOSTIC_MODE&&req.method==='POST'&&url.pathname==='/diagnostic/shutdown'){
      send(res,200,{ok:true,bridgeVersion:BRIDGE_VERSION,shuttingDown:true});
      setTimeout(()=>void shutdown('diagnostic'),20);
      return;
    }
    if(req.method==='POST'&&url.pathname==='/action'){
      const body=await bodyJson(req);
      const result=runtime.action(String(body.action||''),body);
      await persist();
      return send(res,200,{ok:true,result,home:runtime.homeView(),combat:runtime.combatView(0)});
    }
    if(req.method==='POST'&&url.pathname==='/new'){
      const body=await bodyJson(req);
      runtime.newGame(Number.isFinite(Number(body.seed))?Number(body.seed):Date.now()>>>0);
      await persist();
      return send(res,200,{ok:true,home:runtime.homeView()});
    }
    return send(res,404,{ok:false,error:'Route not found'});
  }catch(error){
    return send(res,400,{ok:false,error:error instanceof Error?error.message:String(error)});
  }
});

const autosaveTimer=setInterval(async()=>{
  runtime.flushRealtime();
  if(runtime.dirty)await persist();
},2000);
autosaveTimer.unref?.();

async function shutdown(signal){
  try{
    runtime.flushRealtime();
    if(runtime.dirty)await persist();
  }finally{
    server.close(()=>process.exit(0));
    setTimeout(()=>process.exit(0),800).unref?.();
  }
}
process.on('SIGINT',()=>void shutdown('SIGINT'));
process.on('SIGTERM',()=>void shutdown('SIGTERM'));

server.listen(PORT,HOST,()=>{
  console.log(`TU TIEN GODOT BRIDGE ${BRIDGE_VERSION} · canonical dist · http://${HOST}:${PORT}`);
});
server.on('error',error=>{console.error('[godot-bridge]',error?.message||error);process.exitCode=1;});
