import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { createPlayableAdventureState, prototypePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import {
  V127_SOUL_CLONE_AUTHORITY_MILESTONES,
  V127_SIX_DAO_CLONES,
  soulCloneAuthorityCapacityV127,
  soulCloneAuthorityProfileV127,
} from '../../dist/core/soul.js';

const registry=buildRegistry();
const expected=[
  [22,'Nguyên Anh',1],
  [26,'Hóa Thần',2],
  [30,'Luyện Hư',3],
  [34,'Hợp Thể',4],
  [38,'Đại Thừa',5],
  [42,'Độ Kiếp',6],
];
assert.deepEqual(V127_SOUL_CLONE_AUTHORITY_MILESTONES.map(x=>[x.realmOrder,x.majorRealm,x.slot]),expected);
for(const [order,,slot] of expected){
  assert.equal(soulCloneAuthorityCapacityV127(order),slot);
  if(order>22) assert.equal(soulCloneAuthorityCapacityV127(order-1),slot-1);
}
assert.equal(soulCloneAuthorityCapacityV127(21),0);
assert.equal(soulCloneAuthorityCapacityV127(117),6,'late-game legacy worker growth must never become clone authority >6');

function sessionAt(order,parallel=20,seed=12730){
  const st=createPlayableAdventureState();
  const realm=[...registry.realms.values()].find(x=>x.order===order);
  assert(realm,`missing realm order ${order}`);
  st.realm.realmId=realm.id;
  st.realm.maxRealmOrder=order;
  st.lifespanYears=realm.lifespanYears;
  st.dungeons.parallelWorkerCapacity=parallel;
  st.inventory['resource.soul_dew']=100000;
  st.inventory['resource.soul_essence']=100000;
  return new SimulationSession(registry,thanhHaWorld,adventureEnemies,prototypePlayerProfile,seed,st);
}

// Legacy parallelWorkerCapacity is explicitly NOT authority. Nguyên Anh mid may have old capacity 4, but V127 opens only slot 1.
{
  const ss=sessionAt(23,4,12731);
  const summary=ss.soulSummary();
  assert.equal(summary.authority.capacity,1);
  assert.equal(summary.authority.nextMilestone.majorRealm,'Hóa Thần');
  ss.createSoulClone('cultivation');
  assert.throws(()=>ss.createSoulClone('alchemy'),/parallelWorkerCapacity legacy không mở thêm Lục Đạo/);
  assert.equal(ss.state.soul.clones.length,1);
}

// One additional authored authority slot per major milestone, not per minor-realm legacy slot increase.
{
  const ss=sessionAt(26,8,12732);
  ss.soulSummary();
  ss.createSoulClone('cultivation');
  ss.createSoulClone('alchemy');
  assert.throws(()=>ss.createSoulClone('soul'),/Không còn Phân Thân V127 đã mở/);
  assert.equal(ss.state.soul.clones.length,2);
}

// V126 saves with more clones are preserved but excess clones are sealed/inactive until the authored realm gate catches up.
{
  const ss=sessionAt(22,4,12733);
  const st=ss.stateValue;
  st.soul.awakened=true;
  st.soul.loadCapacity=500;
  st.soul.clones=Array.from({length:4},(_,i)=>({
    id:`soul.clone.${i+1}`,name:`Legacy Clone ${i+1}`,specialization:'cultivation',soulLoad:40+i,
    baseEfficiency:.7,stability:80,yearsActive:0,dungeonWorkYears:0,dungeonWorkRuns:0,createdWorldYear:0,
  }));
  st.dungeons.workers=st.soul.clones.map(c=>({id:c.id,name:c.name,kind:'avatar',efficiency:.7,baseEfficiency:.7,soulLoad:c.soulLoad,stability:80,specialization:'cultivation'}));
  st.dungeons.assignments=Object.fromEntries(st.soul.clones.map(c=>[c.id,{workerId:c.id,dungeonId:'dungeon.spirit_gathering_cave',floor:1,totalYears:1,totalRuns:1}]));
  const summary=ss.soulSummary();
  assert.equal(summary.soul.clones.length,4,'migration must preserve old clone records instead of deleting player data');
  assert.equal(summary.authority.activeOwned,1);
  assert.equal(summary.authority.sealedOwned,3);
  assert.equal(st.dungeons.workers.filter(w=>w.kind==='avatar').length,1,'sealed legacy clones must not keep farming early');
  assert.deepEqual(Object.keys(st.dungeons.assignments),['soul.clone.1'],'sealed legacy assignments must be removed from active dungeon runtime');
  assert.equal(summary.totalLoad,40,'sealed clones must not add active Soul load/pressure');
  const ui=new GameplayFacade(ss,registry,thanhHaWorld).soul();
  assert.equal(ui.cloneAuthorityCapacity,1);
  assert.equal(ui.sealedCloneCount,3);
  assert.equal(ui.clones.filter(c=>c.authorityUnlocked).length,1);
  assert.equal(ui.clones.filter(c=>c.sealedByV127Migration).length,3);
  assert.throws(()=>ss.assignSoulClone('soul.clone.2','dungeon.spirit_gathering_cave',1),/chưa được quyền hoạt động/);
}

// At Độ Kiếp the authored authority reaches six and then stops forever. Legacy worker capacity cannot block or add Lục Đạo.
{
  const ss=sessionAt(42,1,12734);
  ss.soulSummary();
  for(let i=0;i<6;i++) ss.createSoulClone(i%2?'alchemy':'cultivation'); // arguments are legacy compatibility only; V127 identity is authored by order.
  assert.equal(ss.state.soul.clones.length,6);
  assert.deepEqual(ss.state.soul.clones.map(x=>x.sixDaoId),V127_SIX_DAO_CLONES.map(x=>x.id));
  assert.deepEqual(ss.state.soul.clones.map(x=>x.specialization),V127_SIX_DAO_CLONES.map(x=>x.primaryPurpose));
  assert.equal(ss.state.dungeons.workers.filter(x=>x.kind==='avatar').length,6,'all six authorized farm clones must exist even when legacy parallelWorkerCapacity is only 1');
  assert.throws(()=>ss.createSoulClone('soul'),/Không còn Phân Thân V127 đã mở/);
  const profile=soulCloneAuthorityProfileV127(117,ss.state.soul.clones.length);
  assert.equal(profile.capacity,6);
  assert.equal(profile.nextMilestone,undefined);
}

console.log('V127 CLONE AUTHORITY MIGRATION GATE — PASS');
console.log(JSON.stringify({milestones:expected,maxAuthority:6,legacyParallelWorkerCapacityIsNotAuthority:true,sixDao:V127_SIX_DAO_CLONES.map(x=>x.name),identityAuthoring:'CANONICAL_V127'},null,2));
