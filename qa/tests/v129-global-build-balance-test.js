import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { runCombatKernelV2 } from '../../dist/core/combat-kernel-v2.js';
import { buildBalanceEntityV120, evaluateBuildV120, potentialGridV120 } from '../simulations/balance-lab-v120.js';
import { LIVE_EQUIPMENT_SET_CATALOG_V12310, RETIRED_EQUIPMENT_SET_IDS_V12310, activeEquipmentSetMechanicsV116, isLiveEquipmentSetV12310 } from '../../dist/core/equipment-set-v116.js';
import { applyCorePotentialStats, corePotentialDefinitions, corePotentialPercentBonusV4 } from '../../dist/core/reincarnation-progression-v1102.js';
import { BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID, BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_ENDGAME, BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V108, BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V82, battleDaoV2MainDamageTuningV129 } from '../../dist/core/battle-dao-v2-runtime.js';
import { GLOBAL_BUILD_BALANCE_POLICY_V108, globalBuildBalanceSummaryV108 } from '../../dist/core/global-build-balance-v108.js';
import { SPIRIT_BEAST_SPECIES_V86, SPIRIT_BEAST_COMBAT_TUNING_V108 } from '../../dist/core/spirit-beast-v86.js';
import { CONFIDANTS_V87, CONFIDANT_COMBAT_TUNING_V108 } from '../../dist/core/confidant-v87.js';
import { ARTIFACTS_V88 } from '../../dist/core/artifact-v88.js';

let pass=0; const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
const daoIds=['sword','fist','body','spell','poison','artifact','formation','mind'];
const balance=globalBuildBalanceSummaryV108();
check(balance.schema==='global-build-balance.v108'&&balance.revision==='alpha.23.58','V108 exposes one canonical global-build-balance contract');
check(Object.keys(BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID).length===8&&Object.keys(BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_ENDGAME).length===8&&daoIds.every(id=>Number(BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID[id])>0&&Number(BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_ENDGAME[id])>0),'V129 owns positive shared mid/endgame damage calibration for all 8 Main Dao');
check(BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V108===BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID&&BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V82===BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V108,'V108/V82 exports remain compatibility aliases while runtime ownership is V129');
check(Math.abs(battleDaoV2MainDamageTuningV129({combatBuildV117:{daoHanhCurrentV129:{sword:70}}},'sword')-BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID.sword)<1e-9&&Math.abs(battleDaoV2MainDamageTuningV129({combatBuildV117:{daoHanhCurrentV129:{sword:100}}},'sword')-BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_ENDGAME.sword)<1e-9,'V129 calibration resolves from real Dao Hanh rather than one fixed coefficient');
const runtimeSource=fs.readFileSync('./dist/core/battle-dao-v2-runtime.js','utf8');
check(runtimeSource.includes('battleDaoV2MainDamageTuningV129(entity, main)')&&!/pvp.*MAIN_DAMAGE_TUNING|boss.*MAIN_DAMAGE_TUNING/i.test(runtimeSource),'V129 Dao tuning is consumed once in shared CombatKernel runtime, not by PvP/Boss-specific tables');
check(potentialGridV120(10).length===66&&GLOBAL_BUILD_BALANCE_POLICY_V108.potentialGridBuilds===66,'V108 keeps the canonical 66 three-axis Potential allocations at 10% steps');
check(corePotentialDefinitions.find(x=>x.id==='defense')?.perPoint?.includes('Phòng Ngự +3'),'V4 preserves canonical Potential Defense flat = +3 defense per point before resonance');
const potApplied=applyCorePotentialStats({attack:100,defense:100,physique:100,maxHp:2000},{life:{unspent:0,lifetimeEarned:10,allocations:{power:0,body:0,defense:10},awardedMilestones:[]},permanent:{power:0,body:0,defense:0}});
const expectedResonance=1+corePotentialPercentBonusV4(10)/100;
check(Math.abs(potApplied.defense-130*expectedResonance)<1e-9&&Math.abs(potApplied.attack-100*expectedResonance)<1e-9,'V4 Potential keeps +3 Defense flat and applies one global resonance without axis leakage');

// V145 retirement authority: historical elemental Set ids remain readable for migration, but never live.
check(LIVE_EQUIPMENT_SET_CATALOG_V12310.length===0,'V145 balance authority exposes zero live elemental equipment Sets');
check(RETIRED_EQUIPMENT_SET_IDS_V12310.length===5&&RETIRED_EQUIPMENT_SET_IDS_V12310.every(id=>!isLiveEquipmentSetV12310(id)),'V145 retains the five historical Set ids as inert migration metadata');
check(activeEquipmentSetMechanicsV116({items:[],equipped:{},unlockedSetIds:[...RETIRED_EQUIPMENT_SET_IDS_V12310]}).length===0,'Retired equipment Sets cannot materialize combat mechanics in the current balance runtime');

// Representative Potential role check: defense is a real survival choice without retired root/Set power.
const formationBase={dao:'formation',totalPotential:1000,daoHanh:70};
const purePower=evaluateBuildV120({...formationBase,potential:{power:1,body:0,defense:0}},0);
const pureDefense=evaluateBuildV120({...formationBase,potential:{power:0,body:0,defense:1}},0);
const balancedDefense=evaluateBuildV120({...formationBase,potential:{power:.3,body:.3,defense:.4}},0);
check(pureDefense.survivalScore>purePower.survivalScore&&balancedDefense.survivalScore>purePower.survivalScore,'V108 Defense investment produces measurable survival gain in actual CombatKernel pressure');

// V129 representative midgame round-robin on current authority only.
const V129_MID_POT={
  sword:{power:.6,body:.2,defense:.2}, fist:{power:.9,body:.1,defense:0}, body:{power:1,body:0,defense:0}, spell:{power:.8,body:.2,defense:0},
  poison:{power:.9,body:.1,defense:0}, artifact:{power:.7,body:0,defense:.3}, formation:{power:1,body:0,defense:0}, mind:{power:.9,body:.1,defense:0},
};
const registry=buildRegistry(); const score=Object.fromEntries(daoIds.map(id=>[id,{w:0,l:0,d:0}]));
const spec=(dao)=>({dao,totalPotential:1000,potential:V129_MID_POT[dao],daoHanh:70});
for(let i=0;i<daoIds.length;i++)for(let j=i+1;j<daoIds.length;j++)for(let seed=0;seed<12;seed++){
  const a={...buildBalanceEntityV120(spec(daoIds[i])),id:'A'},b={...buildBalanceEntityV120(spec(daoIds[j])),id:'B'};
  const battle=runCombatKernelV2({registry,seed:1500000+seed*431+i*809+j*59,entities:seed%2?[b,a]:[a,b],maxDuration:60,mode:'simulation'}).battle;
  if(battle.winnerId==='A'){score[daoIds[i]].w++;score[daoIds[j]].l++;}else if(battle.winnerId==='B'){score[daoIds[j]].w++;score[daoIds[i]].l++;}else{score[daoIds[i]].d++;score[daoIds[j]].d++;}
}
const matchPointPct={};
for(const dao of daoIds){const x=score[dao],n=x.w+x.l+x.d;matchPointPct[dao]=(x.w+.5*x.d)/n*100;}
check(Math.min(...Object.values(matchPointPct))>=35&&Math.max(...Object.values(matchPointPct))<=65,`V129 representative Dao Hanh 70 current-authority round robin stays inside 35–65% (${Object.entries(matchPointPct).map(([d,v])=>`${d}:${v.toFixed(1)}`).join(' · ')})`);
check(daoIds.every(id=>score[id].w>0&&score[id].l>0),'V129 representative midgame has no universal auto-win/auto-lose Main Dao');

// Collection axes: balance tuning is only allowed on active combat triggers; ownership-wide Bond/Fortune stays untouched.
const st=createPlayableAdventureState(); st.realm.maxRealmOrder=22;
const session=new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,10858,st); session.devCollectionGrantV12326();
const collection=session.stateValue.collectionV12316;
for(const pet of SPIRIT_BEAST_SPECIES_V86){const progress=collection.items[pet.id]??(collection.items[pet.id]={owned:true,level:1,advance:5,specificFragments:0});progress.owned=true;progress.level=1000;progress.advance=5;progress.stars=20;progress.spiritBeastV147Migrated=true;}
check(SPIRIT_BEAST_SPECIES_V86.length===8&&Object.keys(SPIRIT_BEAST_COMBAT_TUNING_V108).length===8,'V108 covers all 8 Spirit Beasts with active-combat-only tuning');
check(Object.values(SPIRIT_BEAST_COMBAT_TUNING_V108).every(x=>x.powerScale>=.75&&x.powerScale<=1.35&&x.cooldownScale>=.75&&x.cooldownScale<=1.25),'V108 Spirit Beast calibration stays bounded and preserves authored roles');
for(const pet of SPIRIT_BEAST_SPECIES_V86){collection.activePetId=pet.id;check((session.personalCombatEntity().triggers||[]).filter(x=>x.id.startsWith('spirit-beast.v147.')).length===3,`V108 ${pet.name} keeps all three canonical combat actives live`);}
collection.activePetId=undefined;
check(CONFIDANTS_V87.length===8&&Object.keys(CONFIDANT_COMBAT_TUNING_V108).length===8,'V108 covers all 8 Confidants without touching Fortune/specialty progression');
check(Object.values(CONFIDANT_COMBAT_TUNING_V108).every(x=>x>=.65&&x<=1.35),'V108 Confidant active-combat calibration stays bounded');
for(const c of CONFIDANTS_V87){
  const progress=collection.items[c.id]??(collection.items[c.id]={owned:true,level:1,advance:0,specificFragments:0});
  progress.owned=true;progress.level=5100;progress.stars=100;progress.advance=4;progress.confidantV148Migrated=true;progress.confidantHeartV148={assist:10,guard:10,harmony:10,raw:0};
  collection.activeCompanionId=c.id;
  const kinds=new Set((session.personalCombatEntity().triggers||[]).map(x=>x.runtimeV148?.kind).filter(Boolean));
  check(['assist','guard','gauge','harmony'].every(kind=>kinds.has(kind)),`V148 ${c.name} keeps Assist + Guard + Đồng Tâm + Harmony runtime live at representative max progression`);
}
collection.activeCompanionId=undefined;
for(const a of ARTIFACTS_V88){collection.activeArtifactIds=[a.id];const e=session.personalCombatEntity();check(e.combatBuildV117?.artifactV88?.equippedCount===1&&(e.triggers||[]).some(x=>x.runtimeV88?.itemId===a.id),`V108 ${a.name} remains on canonical V88 Bao Qi trigger runtime`);}

const xp=new (await import('../../dist/core/gameplay.js')).GameplayFacade(session,registry,thanhHaWorld).playerExperienceV105();
check(xp.v108?.schema==='global-build-balance.v108'&&xp.revision==='alpha.23.75','V108 player-facing Build Guide receives the read-only balance contract');
const app=fs.readFileSync('./app.js','utf8');
check(app.includes('V108 · GLOBAL BUILD BALANCE')&&app.includes('không có hệ số PvP riêng'),'V108 Build UI explains shared-kernel balance instead of hiding a mode-specific modifier');
console.log(`\nV129 GLOBAL BUILD & BALANCE: ${pass}/${pass} PASS`);
