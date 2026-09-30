import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';
import { buildBalanceEntityV120, evaluateBuildV120, potentialGridV120, POTENTIAL_PLANS_V120 } from '../simulations/balance-lab-v120.js';
import { LIVE_EQUIPMENT_SET_CATALOG_V12310, RETIRED_EQUIPMENT_SET_IDS_V12310, activeEquipmentSetMechanicsV116, isLiveEquipmentSetV12310 } from '../../dist/core/equipment-set-v116.js';
import { CORE_POTENTIAL_AXIS_IDS_V5, CORE_POTENTIAL_AXIS_VERSION_V5, applyCorePotentialStats, corePotentialDefinitions } from '../../dist/core/reincarnation-progression-v1102.js';
import { BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID, BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_ENDGAME, BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V108, BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V82, battleDaoV2MainDamageTuningV129 } from '../../dist/core/battle-dao-v2-runtime.js';
import { GLOBAL_BUILD_BALANCE_POLICY_V108, globalBuildBalanceSummaryV108 } from '../../dist/core/global-build-balance-v108.js';
import { SPIRIT_BEAST_SPECIES_V86, SPIRIT_BEAST_COMBAT_TUNING_V108 } from '../../dist/core/spirit-beast-v86.js';
import { CONFIDANTS_V87, CONFIDANT_COMBAT_TUNING_V108 } from '../../dist/core/confidant-v87.js';
import { ARTIFACTS_V88 } from '../../dist/core/artifact-v88.js';

let pass=0; const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
const daoIds=['sword','fist','body','spell','poison','artifact','formation','mind'];
const balance=globalBuildBalanceSummaryV108();
check(balance.schema==='global-build-balance.v108'&&balance.revision==='alpha.23.76'&&balance.engine==='CombatKernel V3','Global build guide follows current V3 balance authority');
check(Object.keys(BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID).length===8&&Object.keys(BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_ENDGAME).length===8&&daoIds.every(id=>Number(BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID[id])>0&&Number(BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_ENDGAME[id])>0),'V129 retains positive shared mid/endgame calibration for all 8 Main Dao');
check(BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V108===BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID&&BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V82===BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V108,'V108/V82 exports remain compatibility aliases while runtime ownership is V129');
check(Math.abs(battleDaoV2MainDamageTuningV129({combatBuildV117:{daoHanhCurrentV129:{sword:70}}},'sword')-BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID.sword)<1e-9&&Math.abs(battleDaoV2MainDamageTuningV129({combatBuildV117:{daoHanhCurrentV129:{sword:100}}},'sword')-BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_ENDGAME.sword)<1e-9,'V129 calibration resolves from real Dao Hanh rather than one fixed coefficient');
const runtimeSource=fs.readFileSync('./dist/core/battle-dao-v2-runtime.js','utf8');
check(runtimeSource.includes('battleDaoV2MainDamageTuningV129(entity, main)')&&!/pvp.*MAIN_DAMAGE_TUNING|boss.*MAIN_DAMAGE_TUNING/i.test(runtimeSource),'Dao tuning is consumed once in shared combat runtime, not by PvP/Boss-specific tables');

check(potentialGridV120(10).length===1001&&GLOBAL_BUILD_BALANCE_POLICY_V108.potentialGridBuilds===1001,'Five-axis Potential grid has the canonical 1001 allocations at 10% steps');
check(JSON.stringify(CORE_POTENTIAL_AXIS_IDS_V5)===JSON.stringify(['power','body','agility','spirit','sense'])&&corePotentialDefinitions.length===5&&!corePotentialDefinitions.some(x=>x.id==='defense'),'Potential authority is exactly CL/TP/TPH/LL/TT; legacy Defense axis is retired');
const potApplied=applyCorePotentialStats({attack:100,defense:100,physique:100,maxHp:2000,maxSpirit:100,mobility:100,accuracy:100,controlPower:100,resolve:100},{life:{axisVersion:CORE_POTENTIAL_AXIS_VERSION_V5,unspent:0,lifetimeEarned:10,allocations:{power:0,body:10,agility:0,spirit:0,sense:0},awardedMilestones:[]},permanent:{power:0,body:0,agility:0,spirit:0,sense:0}});
check(potApplied.attack===100&&potApplied.defense===110&&potApplied.physique===110&&potApplied.maxHp===2200,'TP points affect only authored body/HP/Defense fields without hidden global resonance');

check(LIVE_EQUIPMENT_SET_CATALOG_V12310.length===0&&GLOBAL_BUILD_BALANCE_POLICY_V108.liveElementSets===0,'Current balance authority exposes zero live elemental equipment Sets');
check(RETIRED_EQUIPMENT_SET_IDS_V12310.length===5&&RETIRED_EQUIPMENT_SET_IDS_V12310.every(id=>!isLiveEquipmentSetV12310(id)),'Five historical Set ids remain inert migration metadata');
check(activeEquipmentSetMechanicsV116({items:[],equipped:{},unlockedSetIds:[...RETIRED_EQUIPMENT_SET_IDS_V12310]}).length===0,'Retired Sets cannot materialize combat mechanics');

const formationBase={dao:'formation',totalPotential:1000,daoHanh:70};
const purePower=evaluateBuildV120({...formationBase,potential:POTENTIAL_PLANS_V120.power},0);
const pureBody=evaluateBuildV120({...formationBase,potential:POTENTIAL_PLANS_V120.body},0);
check(pureBody.survivalScore>purePower.survivalScore,'Authored TP investment produces measurable survival gain under V3 pressure');

// Current-authority deterministic smoke: every Main Dao must build, execute and produce finite combat evidence.
const registry=buildRegistry();
const results={};
for(const dao of daoIds){
  const metrics=evaluateBuildV120({dao,totalPotential:1000,potential:POTENTIAL_PLANS_V120.balanced,daoHanh:70},1);
  results[dao]=metrics;
  check(Number.isFinite(metrics.dps)&&metrics.dps>0&&Number.isFinite(metrics.survivalScore)&&metrics.survivalScore>0&&metrics.duelWinRate>=0&&metrics.duelWinRate<=1,`V3 representative ${dao} build executes with finite offense/survival/duel evidence`);
}
for(let i=0;i<daoIds.length;i++)for(let j=i+1;j<daoIds.length;j++){
  const a={...buildBalanceEntityV120({dao:daoIds[i],totalPotential:1000,potential:POTENTIAL_PLANS_V120.balanced,daoHanh:70}),id:'A'};
  const b={...buildBalanceEntityV120({dao:daoIds[j],totalPotential:1000,potential:POTENTIAL_PLANS_V120.balanced,daoHanh:70}),id:'B'};
  const kernel=runCombatKernelV3({registry,seed:1500000+i*809+j*59,entities:[a,b],maxDuration:60,mode:'simulation'});
  check(kernel.engineVersion==='combat.v3'&&kernel.battle?.finalState?.A&&kernel.battle?.finalState?.B,`V3 pair ${daoIds[i]} × ${daoIds[j]} resolves through canonical engine`);
}

// Collection combat axes remain on their canonical trigger/runtime owners.
const st=createPlayableAdventureState(); st.realm.maxRealmOrder=22;
const session=new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,10858,st); session.devCollectionGrantV12326();
const collection=session.stateValue.collectionV12316;
for(const pet of SPIRIT_BEAST_SPECIES_V86){const progress=collection.items[pet.id]??(collection.items[pet.id]={owned:true,level:1,advance:5,specificFragments:0});progress.owned=true;progress.level=1000;progress.advance=5;progress.stars=20;progress.spiritBeastV147Migrated=true;}
check(SPIRIT_BEAST_SPECIES_V86.length===8&&Object.keys(SPIRIT_BEAST_COMBAT_TUNING_V108).length===8,'All 8 Spirit Beasts retain bounded active-combat tuning');
check(Object.values(SPIRIT_BEAST_COMBAT_TUNING_V108).every(x=>x.powerScale>=.75&&x.powerScale<=1.35&&x.cooldownScale>=.75&&x.cooldownScale<=1.25),'Spirit Beast calibration remains bounded');
for(const pet of SPIRIT_BEAST_SPECIES_V86){collection.activePetId=pet.id;check((session.personalCombatEntity().triggers||[]).filter(x=>x.id.startsWith('spirit-beast.v147.')).length===3,`${pet.name} keeps three canonical combat actives`);}
collection.activePetId=undefined;
check(CONFIDANTS_V87.length===8&&Object.keys(CONFIDANT_COMBAT_TUNING_V108).length===8,'All 8 Confidants retain active-combat tuning');
check(Object.values(CONFIDANT_COMBAT_TUNING_V108).every(x=>x>=.65&&x<=1.35),'Confidant combat calibration remains bounded');
for(const c of CONFIDANTS_V87){
  const progress=collection.items[c.id]??(collection.items[c.id]={owned:true,level:1,advance:0,specificFragments:0});
  progress.owned=true;progress.level=5100;progress.stars=100;progress.advance=4;progress.confidantV148Migrated=true;progress.confidantHeartV148={assist:10,guard:10,harmony:10,raw:0};
  collection.activeCompanionId=c.id;
  const kinds=new Set((session.personalCombatEntity().triggers||[]).map(x=>x.runtimeV148?.kind).filter(Boolean));
  check(['assist','guard','gauge','harmony'].every(kind=>kinds.has(kind)),`${c.name} keeps Assist + Guard + Đồng Tâm + Harmony runtime live`);
}
collection.activeCompanionId=undefined;
for(const a of ARTIFACTS_V88){collection.activeArtifactIds=[a.id];const e=session.personalCombatEntity();check(e.combatBuildV117?.artifactV88?.equippedCount===1&&(e.triggers||[]).some(x=>x.runtimeV88?.itemId===a.id),`${a.name} remains on canonical trigger/cooldown artifact runtime`);}

const xp=new (await import('../../dist/core/gameplay.js')).GameplayFacade(session,registry,thanhHaWorld).playerExperienceV105();
check(xp.v108?.schema==='global-build-balance.v108'&&xp.v108?.engine==='CombatKernel V3'&&xp.v108?.policy?.potentialAxisVersion===5,'Player-facing Build Guide receives current V3/five-axis balance contract');
const app=fs.readFileSync('./app.js','utf8');
check(app.includes('V108 · GLOBAL BUILD BALANCE')&&app.includes('không có hệ số PvP riêng'),'Build UI explains shared-kernel balance instead of a mode-specific modifier');
console.log('V129 CURRENT-AUTHORITY BUILD AUDIT',Object.fromEntries(Object.entries(results).map(([dao,x])=>[dao,{dps:Number(x.dps.toFixed(2)),survival:Number(x.survivalScore.toFixed(2)),duel:x.duelWinRate}])));
console.log(`\nV129 GLOBAL BUILD & BALANCE: ${pass}/${pass} PASS`);
