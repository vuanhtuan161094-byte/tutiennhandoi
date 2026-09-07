import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { mapStartFloorForRealm, majorRealmIndexForRealmOrder } from '../../dist/content/realm-maps.js';
import { parseAlchemyPillResourceId } from '../../dist/core/alchemy-v112.js';
import { EQUIPMENT_SLOTS_V142, equipmentBaseStatsForRankV142, equipmentRankNameV142 } from '../../dist/core/equipment-v142.js';

let pass=0; const ok=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
const registry=buildRegistry();
function seedRewardAuthorityFixtureEquipment(st, realmOrder) {
  // This regression verifies reward-tier authority, not combat difficulty. Two-rank-over gear makes
  // the fixture deterministic even when Hunt/Equipment curves are rebalanced, while the Hunt map
  // and therefore reward tier remain Nhân Tiên (major 11).
  const rankIndex = majorRealmIndexForRealmOrder(realmOrder) + 2;
  st.equipment.items = [];
  st.equipment.equipped = {};
  for (const [index, slot] of EQUIPMENT_SLOTS_V142.entries()) {
    const id = `qa.v142.${rankIndex}.${slot}`;
    st.equipment.items.push({
      schema:'equipment.v142', id, templateId:`equipment.v142.${slot}`, name:`QA ${equipmentRankNameV142(rankIndex)} ${slot}`,
      slot, equipmentRankIndex:rankIndex, equipmentRankName:equipmentRankNameV142(rankIndex),
      tier:0, grade:'mundane', quality:'mid', enhancementLevel:15, traitIds:[], affixes:[], gemSockets:[], reforgeCount:0,
      stats:equipmentBaseStatsForRankV142(slot,rankIndex), tags:['EquipmentV142'], source:{kind:'qa',floor:rankIndex+1,seed:index+1}, acquiredWorldYear:0,
    });
    st.equipment.equipped[slot]=id;
  }
}
function make(seed){
  const st=createPlayableAdventureState();
  st.realm.realmId='realm.human_immortal.early'; st.realm.maxRealmOrder=46;
  registry.realm(st.realm.realmId);
  // Mature-build fixture isolates Hunt reward tier authority. No loot/material is pre-granted.
  st.character.corePotential.life.allocations={power:10000,body:10000,defense:10000};
  st.soul.awakened=true; st.soul.strength=500; st.soul.purity=100; st.soul.stability=100;
  st.dao.awakened=true; st.dao.known['dao.sword']={daoId:'dao.sword',depth:100,insight:1000,marks:15,interpretationId:'dao.sword.severance',contemplations:20};
  st.dao.mainDaoId='dao.sword'; st.dao.domain={active:true,daoId:'dao.sword',manifestedYears:50};
  seedRewardAuthorityFixtureEquipment(st, st.realm.maxRealmOrder);
  return new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,seed,st);
}
const found=[];
for(let seed=1;seed<=180 && found.length<8;seed++){
  const s=make(seed), floor=mapStartFloorForRealm(46), before={...s.state.inventory};
  s.selectEndlessFloor(floor); const fight=s.fightEndlessFloor(); if(!fight.won) continue;
  for(const [id,n] of Object.entries(s.state.inventory)){
    if((n-(before[id]??0))<=0) continue;
    const desc=parseAlchemyPillResourceId(id); if(desc) found.push({id,desc});
  }
}
ok(found.length>0,'Nhân Tiên Boss Hunt produces at least one canonical Alchemy/Recovery pill in deterministic sample');
ok(found.every(x=>x.desc.realmTier===4),'Nhân Tiên Hunt pills use economy T4, never raw major index 11 clamped to T8');
ok(found.every(x=>!x.id.includes('.t8.')&&!x.id.includes('.r8.')),'Nhân Tiên Hunt cannot leak T8 pills through clamp-to-8');
console.log(`\nV129 HUNT ALCHEMY TIER AUTHORITY: ${pass}/${pass} PASS`);