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
import { createInitialLifeMeta } from '../../dist/core/life.js';
import { buildWebClientViewPatch } from '../../dist/core/client-shell.js';
import { createWebClientSave, parseWebClientSave } from '../../dist/core/web-save.js';
import { LIVE_COMMIT_REAL_SECONDS } from '../../dist/core/realtime-balance.js';

const HERE=dirname(fileURLToPath(import.meta.url));
const BRIDGE_VERSION='godot-bridge.v2';
const SAVE_PATH=process.env.TUTIEN_GODOT_BRIDGE_SAVE
  ? resolve(process.env.TUTIEN_GODOT_BRIDGE_SAVE)
  : resolve(HERE,'../.runtime/godot-bridge-save.json');
const PORT=Math.max(1,Math.min(65535,Number(process.argv[2]||4190)||4190));
const HOST='127.0.0.1';
const DIAGNOSTIC_MODE=process.env.TUTIEN_GODOT_BRIDGE_DIAGNOSTIC==='1';
const registry=buildRegistry();

class GodotCanonicalRuntime {
  constructor(){
    this.session=null;
    this.game=null;
    this.api=null;
    this.carry=0;
    this.lastTickAt=Date.now();
    this.dirty=false;
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
    const character=this.api.getCharacter();
    const root=this.api.getSpiritualRootV145();
    const stones=(patch.inventory||[]).find(x=>x.id==='resource.spirit_stone')?.quantity??0;
    const cp=patch.shell?.reincarnationCp??this.api.getReincarnation()?.cp??0;
    return {
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
        tuVi:Math.max(0,Number(cultivation.tuVi)||0),
        requiredTuVi:Math.max(0,Number(cultivation.requiredTuVi)||0),
        progressPct:Math.max(0,Math.min(100,Number(cultivation.progressPct)||0)),
        baseTuViPer15s:Math.max(0,Number(cultivation.baseTuViPer15s)||0),
        finalTuViPer15s:Math.max(0,Number(cultivation.finalTuViPer15s)||0),
        commitIntervalSeconds:LIVE_COMMIT_REAL_SECONDS,
        commitPhaseSeconds:Math.max(0,Math.min(LIVE_COMMIT_REAL_SECONDS,Number(this.carry)||0)),
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
  }
  characterView(){
    this.flushRealtime();
    const now=Date.now();
    this.api.syncForgingV12328(now);
    const patch=buildWebClientViewPatch(this.api,'character',now,'');
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
      equipment:Array.isArray(patch.equipment)?patch.equipment:[],
      equipmentInventory:this.api.getEquipmentInventoryV129(''),
      equipmentSystem:patch.equipmentSystem||{},
    };
  }
  action(id,payload={}){
    this.flushRealtime();
    let result;
    if(id==='retreatV140')result=this.api.instantRetreat(Math.max(.25,Number(payload.hours)||1));
    else if(id==='useCultivationPill')result=this.api.useCultivationPill();
    else if(id==='ascendRealmV140')result=this.api.ascendRealm();
    else if(id==='tribulationV140')result=this.api.perform({type:'tribulation',intensity:1});
    else if(id==='equipItem'){
      const itemId=String(payload.itemId||'').trim();
      if(!itemId)throw new Error('Thiếu itemId trang bị.');
      result=this.api.perform({type:'equip',itemId});
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
    if(req.method==='GET'&&url.pathname==='/health')return send(res,200,{ok:true,schema:'godot-bridge-health.v1',bridgeVersion:BRIDGE_VERSION,port:PORT,authority:'canonical-dist'});
    if(req.method==='GET'&&url.pathname==='/home')return send(res,200,runtime.homeView());
    if(req.method==='GET'&&url.pathname==='/character')return send(res,200,runtime.characterView());
    if(DIAGNOSTIC_MODE&&req.method==='POST'&&url.pathname==='/diagnostic/shutdown'){
      send(res,200,{ok:true,bridgeVersion:BRIDGE_VERSION,shuttingDown:true});
      setTimeout(()=>void shutdown('diagnostic'),20);
      return;
    }
    if(req.method==='POST'&&url.pathname==='/action'){
      const body=await bodyJson(req);
      const result=runtime.action(String(body.action||''),body);
      await persist();
      return send(res,200,{ok:true,result,home:runtime.homeView()});
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
