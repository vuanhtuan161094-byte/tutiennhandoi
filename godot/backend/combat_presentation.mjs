import { v2ResourceProjection } from '../../dist/core/battle-dao-v2-runtime-base.js';

export const GODOT_COMBAT_SCHEMA='godot-combat-bridge.v1';
export const COMBAT_PRESENTATION_SCHEMA='combat-presentation.v2';
export const COMBAT_AUTHORITY='combat-kernel.v3';

const DAO_META=Object.freeze({
  sword:{label:'Kiếm Đạo',anchorKind:'self'},
  fist:{label:'Quyền Đạo',anchorKind:'self'},
  body:{label:'Thể Đạo',anchorKind:'self'},
  spell:{label:'Pháp Đạo',anchorKind:'self'},
  poison:{label:'Độc Đạo',anchorKind:'target'},
  formation:{label:'Trận Đạo',anchorKind:'field'},
  artifact:{label:'Ngự Khí Đạo',anchorKind:'sources'},
  mind:{label:'Thần Niệm Đạo',anchorKind:'target'},
});

const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number.isFinite(Number(value))?Number(value):min));
const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
const meter=(id,label,value,max,targetOwned=false)=>({
  id,label,value:clamp(value,0,Math.max(1,finite(max,1))),max:Math.max(1,finite(max,1)),targetOwned:Boolean(targetOwned),
});
const flag=(id,label,active)=>({id,label,active:Boolean(active)});

function compact(value){
  const n=Number(value);
  if(!Number.isFinite(n))return String(value??'—');
  const a=Math.abs(n);
  if(a>=1e12)return `${(n/1e12).toFixed(1)}T`;
  if(a>=1e9)return `${(n/1e9).toFixed(1)}B`;
  if(a>=1e6)return `${(n/1e6).toFixed(1)}M`;
  if(a>=1e3)return `${(n/1e3).toFixed(1)}K`;
  return Number(n.toFixed(1)).toLocaleString('vi-VN');
}

function initialDaoProjection(session,player){
  const initial=player?.initialBattleDaoStateV2;
  if(!initial)return {};
  try{
    const projectionEntity={...player,battleDaoStateV2:structuredClone(initial)};
    return v2ResourceProjection(projectionEntity,0);
  }catch{
    return {};
  }
}

export function projectDaoForGodot(session,mainDaoId,player){
  const id=String(mainDaoId||'');
  const meta=DAO_META[id]||{label:'Bản Đạo',anchorKind:'self'};
  const p=initialDaoProjection(session,player);
  const out={id,label:meta.label,anchorKind:meta.anchorKind,meters:[],flags:[],detail:{}};

  if(id==='sword'){
    out.meters.push(meter('swordQi','Kiếm Khí',p.swordQi,5));
    out.meters.push(meter('swordIntentV2','Kiếm Ý',p.swordIntentV2,p.swordIntentV2Cap||20));
  }else if(id==='fist'){
    out.meters.push(meter('fistForce','Quyền Thế',p.fistForce,p.fistForceCap||5));
    out.meters.push(meter('fistPassiveStack','Liên Kình',p.fistPassiveStack,p.fistPassiveStackCap||20));
    out.flags.push(flag('fistDomain','Quyền Vực',finite(p.fistDomainUntil)>0));
  }else if(id==='body'){
    out.meters.push(meter('counterForce','Phản Thế',p.counterForce,100));
    out.meters.push(meter('bodyPassiveStack','Thể Ý',p.bodyPassiveStack,p.bodyPassiveStackCap||20));
  }else if(id==='spell'){
    out.meters.push(meter('lawWheel','Pháp Luân',p.lawWheel,3));
    out.meters.push(meter('spellPassiveStack','Pháp Ý',p.spellPassiveStack,p.spellPassiveStackCap||20));
    out.flags.push(flag('dienPhapReady','Diễn Pháp',p.dienPhapReady));
    out.detail.expectedForm=String(p.lawWheelExpectedForm||'');
  }else if(id==='poison'){
    out.meters.push(meter('poisonSeedStage','Độc Chủng',p.poisonSeedStage,4,true));
    out.meters.push(meter('poisonPassiveStack','Độc Tức',p.poisonPassiveStack,p.poisonPassiveStackCap||20));
    out.flags.push(flag('poisonHeart','Công Tâm',finite(p.poisonSeedStage)>=4));
  }else if(id==='formation'){
    out.meters.push(meter('formationNurtureV2','Dưỡng Độ',p.formationNurtureV2,100));
    out.meters.push(meter('formationIntegrityV2','Độ Bền',p.formationIntegrityV2,100));
    out.meters.push(meter('formationPassiveStack','Trận Văn',p.formationPassiveStack,p.formationPassiveStackCap||20));
    out.flags.push(flag('formationDeployed','Chủ Trận',p.formationDeployedV2));
    out.flags.push(flag('formationGrandReady','Đại Thành',p.formationGrandReadyV1));
  }else if(id==='artifact'){
    out.meters.push(meter('artifactSourcesV2','Khí Linh',p.artifactSourcesV2,3));
    out.meters.push(meter('artifactPassiveStack','Khí Cảm',p.artifactPassiveStack,p.artifactPassiveStackCap||20));
    out.flags.push(flag('artifactMergeActive','Đại Khí Linh',p.artifactMergeActiveV1));
    out.detail.mergedFrom=Math.max(0,Math.floor(finite(p.artifactMergedFromV1)));
  }else if(id==='mind'){
    out.meters.push(meter('mindMarkCount','Thần Ấn',0,5,true));
    out.meters.push(meter('mindPassiveStack','Niệm Lực',p.mindPassiveStack,p.mindPassiveStackCap||20));
    out.flags.push(flag('mindFlow','Phân Lưu',finite(p.mindFlowUntil)>0));
  }
  return out;
}

function projectSkill(registry,id,index){
  if(!registry?.skills?.has?.(id))return null;
  const skill=registry.skill(id);
  const runtime=skill?.runtimeV117||{};
  const slotClass=String(runtime.slotClass||'active');
  return {
    id:String(skill.id||id),
    name:String(skill.name||id),
    slotClass,
    form:String(runtime.form||skill.form||'instant'),
    index,
    cooldownTotal:Math.max(0,finite(skill.cooldown,finite(runtime.cooldown))),
    cooldownRemaining:0,
    spiritCost:Math.max(0,finite(skill.spiritCost,finite(skill.spiritCostStandardPct))),
    ready:true,
    blockedReason:'',
    castState:'idle',
    channelState:'idle',
    autoSelected:false,
  };
}

function projectSkills(session,registry){
  const ids=typeof session?.canonicalActiveSkillIds==='function'?session.canonicalActiveSkillIds():[];
  const order={basic:0,active:1,ultimate:2};
  return ids.map((id,index)=>projectSkill(registry,id,index)).filter(Boolean)
    .sort((a,b)=>(order[a.slotClass]??1)-(order[b.slotClass]??1)||a.index-b.index);
}

function bossProjection(hunt){
  const source=hunt?.productionV110?.boss||{};
  const mechanic=source.mechanic||hunt?.monster?.bossMechanic||null;
  return {
    isBoss:String(hunt?.monster?.gradeId||'')==='boss',
    readiness:{
      label:String(source?.readiness?.label||''),
      description:String(source?.readiness?.description||''),
      tone:String(source?.readiness?.tone||'neutral'),
    },
    mechanic:mechanic?{
      id:String(mechanic.id||''),
      name:String(mechanic.name||''),
      description:String(mechanic.description||''),
      counterHint:String(mechanic.counterHint||''),
      coveragePct:finite(mechanic.coveragePct),
    }:null,
  };
}

export function buildCombatSnapshot({session,api,registry}){
  const hunt=api.getEndlessHunt();
  const specialization=api.getSpecializationV125();
  const player=session.personalCombatEntity();
  const character=api.getCharacter();
  const mainDaoId=String(specialization?.mainDaoId||player?.combatBuildV117?.mainDaoId||'');
  const maxHp=Math.max(1,finite(player?.stats?.maxHp,1));
  const maxSpirit=Math.max(1,finite(player?.stats?.maxSpirit,1));
  const monster=hunt?.monster||{};
  const realmReady=finite(session?.stateValue?.realm?.maxRealmOrder)>=1;
  const canStart=Boolean(realmReady&&hunt?.bossChallengeAvailable&&hunt?.canFight);
  const blockedReason=canStart?'':!realmReady
    ?'Bí Cảnh mở khi bước vào Luyện Khí.'
    :String(hunt?.fightBlocker||(!hunt?.bossChallengeAvailable?'Boss tầng này chưa thể khiêu chiến.':''));

  return {
    schema:COMBAT_PRESENTATION_SCHEMA,
    encounterId:'',
    snapshotSeq:0,
    authorityTime:0,
    mode:'prefight',
    mainDaoId,
    challenge:{
      canStart,
      blockedReason,
      floor:Math.max(1,Math.floor(finite(hunt?.selectedFloor,1))),
      zoneFloor:Math.max(1,Math.floor(finite(hunt?.currentZoneFloor,1))),
      zoneName:String(hunt?.currentMap?.zoneName||''),
    },
    player:{
      id:String(player?.id||'player'),
      name:String(character?.name||player?.name||'Tu Sĩ'),
      hp:{current:maxHp,max:maxHp,ratio:1,displayCurrent:compact(maxHp),displayMax:compact(maxHp)},
      spirit:{current:maxSpirit,max:maxSpirit,ratio:1},
      ultimate:{current:clamp(player?.initialUltimateGaugeV117??0,0,100),max:100,ready:finite(player?.initialUltimateGaugeV117)>=100},
    },
    enemy:{
      id:String(monster.id||''),
      name:String(monster.name||'Thủ Lĩnh'),
      level:Math.max(1,Math.floor(finite(monster.level,1))),
      grade:String(monster.grade||''),
      gradeId:String(monster.gradeId||''),
      elements:Array.isArray(monster.elements)?monster.elements.map(String):[],
      hp:{current:null,max:null,ratio:1,displayCurrent:String(monster.hp||'—'),displayMax:String(monster.hp||'—')},
      break:{ratio:1,state:'stable'},
    },
    skills:projectSkills(session,registry),
    dao:projectDaoForGodot(session,mainDaoId,player),
    auto:{enabled:true,selectedSkillId:'',reasonCode:''},
    boss:bossProjection(hunt),
    result:null,
    eventCursor:0,
  };
}

const EVENT_TYPE=Object.freeze({
  battleStart:'battle.start',
  battleEnd:'battle.end',
  castStart:'skill.cast.start',
  projectile:'skill.travel',
  damage:'combat.damage',
  heal:'combat.heal',
  shield:'combat.shield',
  shieldBreak:'combat.shield.break',
  break:'combat.break',
  status:'combat.status',
  mark:'combat.mark',
  resource:'combat.resource',
  phase:'boss.phase',
  counterWindow:'boss.counter',
  death:'actor.death',
  trigger:'combat.trigger',
  summary:'combat.summary',
});

export function projectCombatEvent(event,index=0){
  const sourceType=String(event?.type||'unknown');
  const type=EVENT_TYPE[sourceType]||`combat.${sourceType}`;
  return {
    cursor:index+1,
    seq:Math.max(0,Math.floor(finite(event?.seq,index))),
    time:Math.max(0,finite(event?.time)),
    type,
    sourceType,
    actor:String(event?.actor||''),
    target:String(event?.target||''),
    skillId:String(event?.skillId||''),
    skillName:String(event?.skillName||''),
    message:String(event?.message||''),
    payload:{...event},
  };
}

export function createCombatPlayback({result,initialSnapshot,serial=1}){
  const encounterId=`hunt.${String(result?.seed??serial)}.${String(result?.floor??0)}`;
  const events=(Array.isArray(result?.combatEvents)?result.combatEvents:[]).map(projectCombatEvent);
  const playbackResult={
    won:Boolean(result?.won),
    rewardContext:String(result?.rewardContext||''),
    directBossLoot:Boolean(result?.directBossLoot),
    battleSeconds:Math.max(0,finite(result?.battleSeconds)),
    monsterName:String(result?.monsterName||initialSnapshot?.enemy?.name||''),
    bossCleared:Boolean(result?.bossCleared),
    unlockedFloor:Math.max(0,Math.floor(finite(result?.unlockedFloor))),
    injuryGain:Math.max(0,finite(result?.injuryGain)),
    summaryLines:Array.isArray(result?.summaryLines)?result.summaryLines.map(String):[],
  };
  return {
    encounterId,
    events,
    result:playbackResult,
    snapshot:{...structuredClone(initialSnapshot),encounterId,snapshotSeq:serial,mode:'playback',result:playbackResult,eventCursor:events.length},
  };
}

export function buildGodotCombatView({session,api,registry,playback,after=0,bridgeVersion=''}){
  const cursor=Math.max(0,Math.floor(finite(after)));
  const snapshot=playback?.snapshot?structuredClone(playback.snapshot):buildCombatSnapshot({session,api,registry});
  const events=playback?.events?.filter(event=>event.cursor>cursor)||[];
  return {
    ok:true,
    schema:GODOT_COMBAT_SCHEMA,
    bridgeVersion:String(bridgeVersion),
    authority:{
      combat:COMBAT_AUTHORITY,
      dao:'battle-dao.runtime.v2',
      stats:'combat-stat.v168',
      transport:COMBAT_PRESENTATION_SCHEMA,
      lockedRuntime:'V160-V179',
    },
    generatedAtUnixMs:Date.now(),
    snapshot,
    events,
    eventCursor:playback?.events?.length||0,
  };
}
