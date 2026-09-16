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
  // This regression verifies Hunt reward authority, not combat difficulty. Two-rank-over gear keeps
  // the Boss-clear fixture deterministic while the Hunt map remains Nhân Tiên (major 11).
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
  st.character.corePotential.life.allocations={power:10000,body:10000,defense:10000};
  st.soul.awakened=true; st.soul.strength=500; st.soul.purity=100; st.soul.stability=100;
  st.dao.awakened=true; st.dao.known['dao.sword']={daoId:'dao.sword',depth:100,insight:1000,marks:15,interpretationId:'dao.sword.severance',contemplations:20};
  st.dao.mainDaoId='dao.sword'; st.dao.domain={active:true,daoId:'dao.sword',manifestedYears:50};
  seedRewardAuthorityFixtureEquipment(st, st.realm.maxRealmOrder);
  return new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,seed,st);
}
const pillDelta=(before,after)=>Object.entries(after).filter(([id,n])=>(n-(before[id]??0))>0&&parseAlchemyPillResourceId(id));
let cleared;
for(let seed=1;seed<=60&&!cleared;seed++){
  const s=make(seed), floor=mapStartFloorForRealm(46), before={...s.state.inventory};
  s.selectEndlessFloor(floor);
  const fight=s.fightEndlessFloor();
  if(!fight.won)continue;
  cleared={s,fight,before};
}
ok(Boolean(cleared),'Nhân Tiên deterministic fixture can clear a Boss and open timed Hunt progression');
const {s,fight,before}=cleared;
ok(fight.directBossLoot===false&&fight.rewardContext==='progression-only','Boss clear is progression-only and cannot own direct Hunt loot');
ok(pillDelta(before,s.state.inventory).length===0,'Boss clear mints no canonical Alchemy/Recovery pill');
const afterBoss={...s.state.inventory};
const farm=s.resolveEndlessHuntFarmBatchV77(6*3600);
ok(farm.kills>0,'Săn Ảo resolves real time into virtual Hunt kills');
ok(Boolean(farm.demonCoreResourceId),'Săn Ảo keeps the canonical Yêu Đan material lane');
ok(pillDelta(afterBoss,s.state.inventory).length===0,'Timed Hunt farm does not leak retired direct Alchemy/Recovery pill drops');
ok(farm.spiritStones>=0&&farm.demonCores>=0&&farm.fragmentSettlementV142?.totalFragments>=0,'Timed Hunt farm owns Linh Thạch, Yêu Đan and equipment-fragment settlement');
console.log(`\nV129 HUNT TIMED REWARD AUTHORITY: ${pass}/${pass} PASS`);
