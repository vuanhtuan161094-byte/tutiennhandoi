import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';
import { analyzeBattle } from '../../dist/core/combat-analytics.js';
import { applyCharacterToEntity, createCharacterSystemState, learnTechnique } from '../../dist/core/character.js';
import { buildRegistry } from '../../dist/content/registry.js';
import { daoVariantsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';
import { battleDaoV2Passives } from '../../dist/content/battle-dao-v2-catalog.js';
import { RETIRED_EQUIPMENT_SET_IDS_V12310, equipmentSetCatalogEntryV116 } from '../../dist/core/equipment-set-v116.js';
import { gainBattleDaoHanhV113, setBattleDaosV113 } from '../../dist/core/build-foundation-v113.js';
import { applyCombatPacingV124 } from '../../dist/core/combat-pacing-v124.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import { CORE_POTENTIAL_AXIS_IDS_V5, CORE_POTENTIAL_AXIS_VERSION_V5 } from '../../dist/core/reincarnation-progression-v1102.js';

const ZERO_V5 = () => ({ power:0, body:0, agility:0, spirit:0, sense:0 });
export const POTENTIAL_PLANS_V120 = Object.freeze({
  balanced: { power:.20, body:.20, agility:.20, spirit:.20, sense:.20 },
  power: { power:1, body:0, agility:0, spirit:0, sense:0 },
  body: { power:0, body:1, agility:0, spirit:0, sense:0 },
  agility: { power:0, body:0, agility:1, spirit:0, sense:0 },
  spirit: { power:0, body:0, agility:0, spirit:1, sense:0 },
  sense: { power:0, body:0, agility:0, spirit:0, sense:1 },
});

const DAO_LOADOUTS = {
  sword: { basic:'skill.dao.sword.basic', actives:['skill.dao.sword.flow_slash','skill.dao.sword.nurture','skill.dao.sword.break_mark','skill.dao.sword.sever','skill.dao.sword.finisher'], ultimate:'skill.dao.sword.ultimate', art:'technique.v119.dao.qingxu_sword' },
  fist: { basic:'skill.dao.fist.basic', actives:['skill.dao.fist.triple','skill.dao.fist.nurture','skill.dao.fist.heavy','skill.dao.fist.pressure','skill.dao.fist.finisher'], ultimate:'skill.dao.fist.ultimate', art:'technique.v119.dao.eight_wastes_fist' },
  body: { basic:'skill.dao.body.basic', actives:['skill.dao.body.guard','skill.dao.body.transform','skill.dao.body.counter','skill.dao.body.break','skill.dao.body.finisher'], ultimate:'skill.dao.body.ultimate', art:'technique.v119.dao.undying_body' },
  spell: { basic:'skill.dao.spell.basic', actives:['skill.dao.spell.light','skill.dao.spell.channel','skill.dao.spell.seal','skill.dao.spell.break','skill.dao.spell.transform'], ultimate:'skill.dao.spell.ultimate', art:'technique.v119.dao.taiyi_magic' },
  poison: { basic:'skill.dao.poison.basic', actives:['skill.dao.poison.bone','skill.dao.poison.heart','skill.dao.poison.insects','skill.dao.poison.consume','skill.dao.poison.calamity'], ultimate:'skill.dao.poison.ultimate', art:'technique.v119.dao.nine_nether_poison' },
  artifact: { basic:'skill.dao.artifact.basic', actives:['skill.dao.artifact.deploy','skill.dao.artifact.strike','skill.dao.artifact.sync','skill.dao.artifact.merge','skill.dao.artifact.suppress'], ultimate:'skill.dao.artifact.ultimate', art:'technique.v119.dao.myriad_artifact' },
  formation: { basic:'skill.dao.formation.basic', actives:['skill.dao.formation.deploy','skill.dao.formation.nourish','skill.dao.formation.fortify','skill.dao.formation.small_activate','skill.dao.formation.full_activate'], ultimate:'skill.dao.formation.ultimate', art:'technique.v119.dao.star_formation' },
  mind: { basic:'skill.dao.mind.basic', actives:['skill.dao.mind.mark','skill.dao.mind.interfere','skill.dao.mind.chase','skill.dao.mind.burst','skill.dao.mind.observe'], ultimate:'skill.dao.mind.ultimate', art:'technique.v119.dao.myriad_mind' },
};
const LEGACY_ROOT_ELEMENT = { metal:'Metal', wood:'Wood', water:'Water', fire:'Fire', earth:'Earth' };
const STANDARD_TECHNIQUES = { inner:'technique.v119.inner.hunyuan', movement:'technique.v119.movement.carefree_void', secret:'technique.v119.secret.steal_heaven' };
const BALANCE_REGISTRY = buildRegistry();

export function normalizePotentialRatioV120(raw={}) {
  const weights=Object.fromEntries(CORE_POTENTIAL_AXIS_IDS_V5.map(id=>[id,Math.max(0,Number(raw?.[id])||0)]));
  const sum=Object.values(weights).reduce((a,b)=>a+b,0);
  if(sum<=1e-12) return { ...POTENTIAL_PLANS_V120.balanced };
  return Object.fromEntries(CORE_POTENTIAL_AXIS_IDS_V5.map(id=>[id,weights[id]/sum]));
}
export function allocatePotentialV120(total, ratio) {
  const n=Math.max(0,Math.floor(Number(total)||0));
  const r=normalizePotentialRatioV120(ratio);
  const rows=CORE_POTENTIAL_AXIS_IDS_V5.map((id,index)=>{
    const raw=n*r[id],floor=Math.floor(raw);
    return {id,index,floor,fraction:raw-floor};
  });
  let remaining=n-rows.reduce((sum,row)=>sum+row.floor,0);
  for(const row of [...rows].sort((a,b)=>b.fraction-a.fraction||a.index-b.index)){
    if(remaining<=0) break;
    row.floor++; remaining--;
  }
  return Object.fromEntries(rows.map(row=>[row.id,row.floor]));
}
export function potentialGridV120(stepPct=10) {
  const step=Math.max(1,Math.min(50,Math.floor(Number(stepPct)||10)));
  const out=[];
  for(let power=0;power<=100;power+=step)
    for(let body=0;body<=100-power;body+=step)
      for(let agility=0;agility<=100-power-body;agility+=step)
        for(let spirit=0;spirit<=100-power-body-agility;spirit+=step){
          const sense=100-power-body-agility-spirit;
          if(sense<0||sense%step!==0) continue;
          out.push({power:power/100,body:body/100,agility:agility/100,spirit:spirit/100,sense:sense/100});
        }
  return out;
}

/** Retired Ngũ Hành Set compatibility surface: historical ids never create live mechanics. */
export function setMechanicsV120(){ return []; }

function baseStats(totalPotential){
  const axis=Math.max(100,Number(totalPotential)||0);
  return {maxHp:axis*20,physique:axis,maxSpirit:1000,spiritStandard:1000,spiritRegenStandardPctPerSecond:3,attack:axis,defense:axis,mobility:100,accuracy:100,critChancePct:35,critPowerPerLayer:.5,heartChancePct:10,dodgeChancePct:10,controlPower:100,resolve:100,actionSpeed:1,elementalAffinities:{},elementalResistancesPct:{},dominantElement:'Metal',primaryStatsV5:{power:axis,body:axis,agility:100,spirit:1000,sense:100}};
}
function aiFor(dao,skillIds){ return battleDaoAutoRotationV127(dao,skillIds); }
function configureTechniques(state,dao){
  const ids=[STANDARD_TECHNIQUES.inner,DAO_LOADOUTS[dao].art,STANDARD_TECHNIQUES.movement,STANDARD_TECHNIQUES.secret];
  state.activeTechniqueId=STANDARD_TECHNIQUES.inner; state.knownTechniqueIds=[]; state.techniqueMastery={};
  for(const id of ids) learnTechnique(state,id,100);
  state.equippedTechniqueIds={inner:STANDARD_TECHNIQUES.inner,art:DAO_LOADOUTS[dao].art,movement:STANDARD_TECHNIQUES.movement,secret:STANDARD_TECHNIQUES.secret};
}
export function buildBalanceEntityV120(spec){
  const load=DAO_LOADOUTS[spec.dao]; if(!load) throw new Error(`Unknown Dao balance archetype: ${spec.dao}`);
  const all=[load.basic,...load.actives,load.ultimate];
  const base={id:'balance.player',combatModel:'locked-v1',name:`${spec.dao}-current`,tags:['Human','Cultivator','BalanceSimV120'],stats:baseStats(spec.totalPotential),skillIds:all,aiProfile:aiFor(spec.dao,all)};
  const state=createCharacterSystemState('root.mixed',STANDARD_TECHNIQUES.inner,[],[]);
  state.potential=undefined; configureTechniques(state,spec.dao); state.knownSkillIds=[...all]; state.activeSkillIds=[...all]; state.combatAiProfile=aiFor(spec.dao,all);
  const alloc=allocatePotentialV120(spec.totalPotential,spec.potential??POTENTIAL_PLANS_V120.balanced);
  state.corePotential={life:{axisVersion:CORE_POTENTIAL_AXIS_VERSION_V5,unspent:0,lifetimeEarned:Math.max(0,Math.floor(Number(spec.totalPotential)||0)),allocations:alloc,awardedMilestones:[]},permanent:ZERO_V5()};
  const f=state.buildFoundation; setBattleDaosV113(f,spec.dao,spec.secondaryDao); gainBattleDaoHanhV113(f,spec.dao,Math.max(0,Math.min(100,spec.daoHanh??70)));
  if(spec.secondaryDao) gainBattleDaoHanhV113(f,spec.secondaryDao,Math.max(0,Math.min(100,spec.secondaryDaoHanh??spec.daoHanh??70)));
  f.learnedDaoPassiveIdsV118=[...battleDaoV2Passives(spec.dao).map(x=>x.id),...(spec.secondaryDao?battleDaoV2Passives(spec.secondaryDao).map(x=>x.id):[])];
  f.unlockedVariantIdsV119=daoVariantsV118.filter(x=>x.dao===spec.dao).map(x=>x.id); f.skillLoadout.buildPassiveIds=[];
  return applyCombatPacingV124(applyCharacterToEntity(base,state,BALANCE_REGISTRY,1,true));
}

function harmlessSkill(){return{id:'skill.balance.harmless',name:'Thử Chiêu',description:'Không gây sát thương.',tags:['BalanceSimV120'],spiritCost:0,cooldown:0,castTime:0,recoveryTime:1,effects:[]};}
function enemyStrike(){return{id:'skill.balance.enemy_strike',name:'Áp Lực Chuẩn',description:'Đòn áp lực chuẩn.',tags:['BalanceSimV120'],spiritCost:0,cooldown:0,castTime:.6,recoveryTime:1,effects:[{type:'damage',coefficient:1.05,breakDamagePct:5}]};}
function benchmarkEntity(kind,axis){
  if(kind==='offense') return{id:'balance.target',combatModel:'locked-v1',name:'Mộc Nhân Thử Công',tags:['BalanceSimV120'],stats:{...baseStats(axis),maxHp:axis*20*1000,physique:axis*1000,attack:1,defense:axis,mobility:100,accuracy:100,critChancePct:0,critPowerPerLayer:.5,controlPower:1,resolve:100,actionSpeed:1},skillIds:['skill.balance.harmless'],aiProfile:{name:'idle',rules:[{skillId:'skill.balance.harmless',priority:1,conditions:[{type:'always'}]}]}};
  const survival=kind==='survival',foeScale=survival?1.85:1.48;
  return{id:'balance.target',combatModel:'locked-v1',name:survival?'Hộ Pháp Thử Sinh':'Đối Thủ Chuẩn',tags:['BalanceSimV120',survival?'Boss':'Cultivator'],stats:{...baseStats(axis),maxHp:axis*20*(survival?100:foeScale),physique:axis*(survival?100:foeScale),attack:axis*foeScale,defense:axis*foeScale,mobility:100,accuracy:100,critChancePct:35,critPowerPerLayer:.5,heartChancePct:10,dodgeChancePct:10,controlPower:100,resolve:100,actionSpeed:1.02},skillIds:['skill.balance.enemy_strike'],aiProfile:{name:'pressure',rules:[{skillId:'skill.balance.enemy_strike',priority:1,conditions:[{type:'always'}]}]}};
}
function registryForBench(){if(!BALANCE_REGISTRY.skills.has('skill.balance.harmless'))BALANCE_REGISTRY.registerSkill(harmlessSkill());if(!BALANCE_REGISTRY.skills.has('skill.balance.enemy_strike'))BALANCE_REGISTRY.registerSkill(enemyStrike());return BALANCE_REGISTRY;}
export function evaluateBuildV120(spec,seeds=3){
  const axis=spec.totalPotential,player=buildBalanceEntityV120(spec),r=registryForBench();
  const offense=runCombatKernelV3({registry:r,seed:720000,entities:[player,applyCombatPacingV124(benchmarkEntity('offense',axis))],maxDuration:60,mode:'simulation'}).battle;
  const offenseA=analyzeBattle(offense).combatants[player.id],dps=(offenseA?.damageDealt??0)/Math.max(1,Math.min(60,offense.duration));
  const survival=runCombatKernelV3({registry:r,seed:730000,entities:[player,applyCombatPacingV124(benchmarkEntity('survival',axis))],maxDuration:60,mode:'simulation'}).battle;
  const fs=survival.finalState[player.id],maxHp=Math.max(1,(player.stats.physique!==undefined?player.stats.physique*20:player.stats.maxHp)*(player.stats.combatHpMultiplierV124??1));
  const hpPct=Math.max(0,Math.min(100,fs.hp/maxHp*100)),survivalSeconds=fs.alive?60:Math.min(60,survival.duration),survivalScore=survivalSeconds+(fs.alive?hpPct*.15:0);
  let wins=0,totalDur=0;const duelCount=Math.max(0,Math.floor(seeds));
  for(let i=0;i<duelCount;i++){const duel=runCombatKernelV3({registry:r,seed:740000+i,entities:[player,applyCombatPacingV124(benchmarkEntity('duel',axis))],maxDuration:60,mode:'simulation'}).battle;if(duel.winnerId===player.id)wins++;totalDur+=Math.min(60,duel.duration);}
  const duelWinRate=duelCount>0?wins/duelCount:.5,offenseScore=dps,balancedScore=Math.sqrt(Math.max(1e-9,offenseScore)*Math.max(1e-9,survivalScore))*(.75+.25*duelWinRate);
  return{dps,survivalSeconds,survivalHpPct:hpPct,duelWinRate,avgDuelSeconds:duelCount>0?totalDur/duelCount:0,offenseScore,survivalScore,balancedScore};
}

/** Historical metadata helper retained only for old callers; returned ids are inert. */
export function thematicAttireSetIdV120(_dao,root){const element=LEGACY_ROOT_ELEMENT[root];if(!element)return RETIRED_EQUIPMENT_SET_IDS_V12310[0];const tag=`Root:${element}`;for(const id of RETIRED_EQUIPMENT_SET_IDS_V12310){const set=equipmentSetCatalogEntryV116(id);if(set?.tags?.includes(tag))return id;}return RETIRED_EQUIPMENT_SET_IDS_V12310[0];}
/** @deprecated Bội/Nhẫn no longer have live Set authority. */
export function compatibleJewelrySetIdsV120(){return[];}
