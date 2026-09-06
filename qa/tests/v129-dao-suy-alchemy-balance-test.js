import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { createAlchemyV112State, alchemyPillResourceId, alchemyRecipeDefinition, ALCHEMY_DAO_SUY_PILL_CAP_PER_MAJOR_REALM } from '../../dist/core/alchemy-v112.js';
import { createImmortalState } from '../../dist/core/immortal.js';
import { advanceDaoSuyByWorldYearsV127, daoSuyMajorBaselineRealDaysV129, DAO_SUY_TARGET_PER_MAJOR_REALM_V129 } from '../../dist/core/dao-suy-v127.js';
import { WORLD_YEARS_PER_REAL_DAY } from '../../dist/core/realtime-balance.js';
import { economyTierForMajorRealmIndex } from '../../dist/core/economy-v111.js';
import { majorRealmIndexForRealmOrder } from '../../dist/content/realm-maps.js';

let passed=0; const test=(name,fn)=>{fn();passed++;console.log(`✓ ${name}`)};
const registry=buildRegistry();
function sessionAt(order,seed=129720){
  const st=createPlayableAdventureState(); const realm=[...registry.realms.values()].find(x=>x.order===order); assert(realm);
  st.realm.realmId=realm.id; st.realm.maxRealmOrder=order; st.lifespanYears=Number.POSITIVE_INFINITY;
  st.economy.v112Alchemy=createAlchemyV112State(); st.immortal.daoSuy=70;
  const tier=economyTierForMajorRealmIndex(majorRealmIndexForRealmOrder(order));
  const pill=alchemyPillResourceId('daoSuy',tier,'low'); st.inventory[pill]=3;
  return {session:new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,seed,st),pill,tier};
}

test('Đạo Suy baseline is ~30 per complete Immortal+ major realm',()=>{
  for(const order of [46,66,114]){
    const imm=createImmortalState(); const days=daoSuyMajorBaselineRealDaysV129(order);
    advanceDaoSuyByWorldYearsV127(imm,order,days*WORLD_YEARS_PER_REAL_DAY,{});
    assert(Math.abs(imm.daoSuy-DAO_SUY_TARGET_PER_MAJOR_REALM_V129)<1e-6,`${order}: ${imm.daoSuy}`);
  }
});

test('late-game Alchemy tier is clamped to canonical economy T1-T8',()=>{
  assert.equal(sessionAt(46).session.currentAlchemyTier(),4);
  assert.equal(sessionAt(117).session.currentAlchemyTier(),8);
});

test('Tĩnh Suy Đan is a craftable advanced recipe family with normal production ingredients',()=>{
  const r=alchemyRecipeDefinition('daoSuy',4);
  assert.equal(r.name,'Tĩnh Suy Đan · T4'); assert.equal(r.recipeClass,'advanced'); assert.equal(r.baseCraftMinutes,45); assert(r.ingredients.length>=2);
});

test('Tĩnh Suy Đan reduces Suy, is capped at 2 per major realm, and persists through save/load',()=>{
  const {session,pill}=sessionAt(46,129721);
  const a=session.useAlchemyPillV112(pill); assert.equal(a.effect.before,70); assert.equal(a.effect.after,64); assert.equal(a.effect.usedAfter,1);
  const b=session.useAlchemyPillV112(pill); assert.equal(b.effect.after,58); assert.equal(b.effect.usedAfter,2);
  assert.throws(()=>session.useAlchemyPillV112(pill),/đã dùng đủ 2 Tĩnh Suy Đan/);
  const restored=SimulationSession.restore(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,JSON.parse(JSON.stringify(session.snapshot())));
  assert.equal(restored.daoSuySummaryV127().value,58);
  assert.equal(restored.alchemyV112Summary().life.daoSuyPillsUsedCurrentMajorRealm,2);
  assert.equal(restored.alchemyV112Summary().life.daoSuyPillCapPerMajorRealm,ALCHEMY_DAO_SUY_PILL_CAP_PER_MAJOR_REALM);
});

test('Tĩnh Suy Đan cannot be used before Nhân Tiên',()=>{
  const {session,pill}=sessionAt(45,129722);
  assert.throws(()=>session.useAlchemyPillV112(pill),/chỉ có tác dụng từ Nhân Tiên/);
});

test('UI exposes Tĩnh Suy recipe, quota and Dao Suy guidance',()=>{
  const app=fs.readFileSync(new URL('../../app.js',import.meta.url),'utf8');
  for(const needle of ["daoSuy:'Tĩnh Suy'",'Tĩnh Suy Đan · đại cảnh','Giảm Suy']) assert(app.includes(needle),needle);
});
console.log(`V129 DAO SUY + ALCHEMY BALANCE — ${passed}/${passed} PASS`);
