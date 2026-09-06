import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { LocalGameApplicationApi } from '../../dist/core/game-api.js';
import { buildWebClientSnapshot } from '../../dist/core/client-shell.js';
import { ensureCollectionProgressStateV12316, grantCollectionItemV12316, strengthenCollectionItemV12316 } from '../../dist/core/collection-progression-v12316.js';
import { ensureCollectionEconomyV12325, strengthenHeartMethodV12325 } from '../../dist/core/gacha-collection-economy-v12325.js';
import { BLOODLINE_ESSENCE_RESOURCE_ID, BODY_ESSENCE_RESOURCE_ID, BODY_BREAKTHROUGH_RESOURCE_ID } from '../../dist/core/origin-progression-v102.js';

let pass=0; const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
const r=buildRegistry();
function setFacility(collection,id,level){const f=collection.cave.facilities.find(x=>x.id===id);if(!f)throw new Error(`missing ${id}`);f.level=level;}
function makeState(){const st=createPlayableAdventureState();st.realm.maxRealmOrder=26;st.inventory['resource.spirit_stone']=100000;st.inventory[BLOODLINE_ESSENCE_RESOURCE_ID]=100000;st.inventory[BODY_ESSENCE_RESOURCE_ID]=100000;st.inventory[BODY_BREAKTHROUGH_RESOURCE_ID]=100000;const c=ensureCollectionProgressStateV12316(st);c.currencies.boundImmortalJade=100000;return st;}
function makeSession(seed=9901,state=makeState()){const s=new SimulationSession(r,thanhHaWorld,adventureEnemies,playablePlayerProfile,seed,state);return {s,g:new GameplayFacade(s,r,thanhHaWorld)};}

// Canonical read model: one production hub, 8 facilities.
{
  const {g}=makeSession(); const snap=buildWebClientSnapshot(new LocalGameApplicationApi(g));
  check(snap.dongfu?.schema==='dongfu.v99','V99 snapshot exposes canonical dongfu.v99 read model');
  check(snap.dongfu.facilities.length===8,'V99 canonical DongFu contains exactly 8 facilities');
  check(new Set(snap.dongfu.facilities.map(x=>x.id)).size===8,'V99 DongFu facility ids are unique');
  check(snap.dongfu.rules?.autoSyncProduction===true,'V99 completed production auto-sync rule is explicit');
}

// Tàng Kinh Các: manual and heart-method costs both consume the same facility discount.
{
  const a=ensureCollectionProgressStateV12316({}), b=structuredClone(a); setFacility(a,'scripture',1);setFacility(b,'scripture',10);
  for(const c of [a,b]){grantCollectionItemV12316(c,'manual.1');c.genericFragments.manual=10000;}
  const ca=strengthenCollectionItemV12316(a,'manual.1',1).cost, cb=strengthenCollectionItemV12316(b,'manual.1',1).cost;
  check(cb<ca,'V99 Tàng Kinh Các Lv10 lowers actual Công Pháp strengthening cost');
  const passive=[...r.daoPassivesV118.keys()][0];
  const fa=makeState().character.buildFoundation, fb=structuredClone(fa); for(const f of [fa,fb]){f.learnedDaoPassiveIdsV118=[passive];f.progressionV125??={};f.progressionV125.passiveLevels??={};f.progressionV125.passiveLevels[passive]=1;}
  ensureCollectionEconomyV12325(a).genericFragments.heart=10000; ensureCollectionEconomyV12325(b).genericFragments.heart=10000;
  const ha=strengthenHeartMethodV12325(a,fa,passive), hb=strengthenHeartMethodV12325(b,fb,passive);
  check(hb.cost<ha.cost&&hb.discountPct===18,'V99 Tàng Kinh Các Lv10 lowers actual Tâm Pháp strengthening cost by canonical 18% cap');
}

// Tri Kỷ Các: intimacy strengthening cost is a real consumer.
{
  const a=ensureCollectionProgressStateV12316({}), b=structuredClone(a); setFacility(a,'companion',1);setFacility(b,'companion',10);
  for(const c of [a,b]){grantCollectionItemV12316(c,'companion.1');c.genericFragments.companion=10000;}
  const ca=strengthenCollectionItemV12316(a,'companion.1',1).cost, cb=strengthenCollectionItemV12316(b,'companion.1',1).cost;
  check(cb<ca,'V99 Tri Kỷ Các Lv10 lowers actual Thân Mật strengthening cost');
}

// Huyết Trì: summary and mutation spend less Huyết Tinh at Lv10.
{
  const st1=makeState(), st10=structuredClone(st1); const c1=ensureCollectionProgressStateV12316(st1),c10=ensureCollectionProgressStateV12316(st10);setFacility(c1,'bloodline',1);setFacility(c10,'bloodline',10);
  const {s:s1}=makeSession(9911,st1),{s:s10}=makeSession(9911,st10);
  const q1=s1.originProgressionSummary().bloodline,q10=s10.originProgressionSummary().bloodline;
  check(q10.purityCostPerPoint<q1.purityCostPerPoint&&q10.facilityDiscountPct===18,'V99 Huyết Trì discount is visible in canonical progression summary');
  const before1=s1.stateValue.inventory[BLOODLINE_ESSENCE_RESOURCE_ID],before10=s10.stateValue.inventory[BLOODLINE_ESSENCE_RESOURCE_ID];
  s1.nourishBloodline(10);s10.nourishBloodline(10);
  check((before10-s10.stateValue.inventory[BLOODLINE_ESSENCE_RESOURCE_ID])<(before1-s1.stateValue.inventory[BLOODLINE_ESSENCE_RESOURCE_ID]),'V99 Huyết Trì Lv10 lowers actual Huyết Tinh mutation spend');
}

// Luyện Thể Thất: summary and mutation spend less Thể Phách Tinh Hoa.
{
  const st1=makeState(), st10=structuredClone(st1); const c1=ensureCollectionProgressStateV12316(st1),c10=ensureCollectionProgressStateV12316(st10);setFacility(c1,'physique',1);setFacility(c10,'physique',10);
  const {s:s1}=makeSession(2,st1),{s:s10}=makeSession(2,st10);
  const q1=s1.originProgressionSummary().physique,q10=s10.originProgressionSummary().physique;
  check(q10.cost<q1.cost&&q10.facilityDiscountPct===18,'V99 Luyện Thể Thất discount is visible in canonical progression summary');
  const before1=s1.stateValue.inventory[BODY_ESSENCE_RESOURCE_ID],before10=s10.stateValue.inventory[BODY_ESSENCE_RESOURCE_ID];
  s1.advancePhysique();s10.advancePhysique();
  check((before10-s10.stateValue.inventory[BODY_ESSENCE_RESOURCE_ID])<(before1-s1.stateValue.inventory[BODY_ESSENCE_RESOURCE_ID]),'V99 Luyện Thể Thất Lv10 lowers actual Thể Phách Tinh Hoa mutation spend');
}

// Existing consumers remain represented by production read-model.
{
  const st=makeState(), c=ensureCollectionProgressStateV12316(st); for(const f of c.cave.facilities)setFacility(c,f.id,10);
  const {g}=makeSession(9931,st); const snap=buildWebClientSnapshot(new LocalGameApplicationApi(g)); const by=Object.fromEntries(snap.dongfu.facilities.map(x=>[x.id,x]));
  check(by.artifact.effect.refinementDiscountPct===18,'V99 keeps Luyện Bảo Các real refinement discount consumer');
  check(by.beast.effect.levelCap===50&&by.beast.effect.petGearLimit===20,'V99 keeps Linh Thú Viên level-cap and pet-gear consumers');
  check(by.alchemy.effect.timeReductionPct>0&&by.alchemy.effect.gardenSlots>0,'V99 keeps Đan Phòng production/garden consumers');
  check(by.forge.effect.timeReductionPct>0&&by.forge.effect.queueCapacity>1,'V99 keeps Luyện Khí production consumers');
  check(by.scripture.effect.materialDiscountPct===18&&by.companion.effect.intimacyDiscountPct===18&&by.bloodline.effect.essenceDiscountPct===18&&by.physique.effect.essenceDiscountPct===18&&['scripture','companion','bloodline','physique'].every(id=>Boolean(by[id].effectText)),'V99 all four formerly-empty facilities expose their real Lv10 effect');
}

// Upgrade action itself mutates level and both canonical currencies.
{
  const {s,g}=makeSession(9941); s.collectionSummaryV12316(); const c=s.stateValue.collectionV12316; const f=c.cave.facilities.find(x=>x.id==='scripture'); const ss=s.stateValue.inventory['resource.spirit_stone'],jade=c.currencies.boundImmortalJade;
  const out=g.caveUpgradeV12316('scripture');
  check(f.level===2&&out.facility.level===2,'V99 cave upgrade mutates the real facility level');
  check(s.stateValue.inventory['resource.spirit_stone']<ss&&c.currencies.boundImmortalJade<jade,'V99 cave upgrade spends Linh Thạch + Tiên Ngọc Khóa');
}

const app=fs.readFileSync('./app.js','utf8');
check(app.includes('v99MountDongFuPixiScene')&&app.includes('data-dongfu-panel-effect'),'V99 app mounts Production DongFu scene and live effect panel');
check(!app.includes('v239MountDongFuPixiPrototype')&&!app.includes('WORKSHOP · ALPHA.23.28')&&!app.includes('PRODUCTION · ALPHA.23.28'),'V99 removes obsolete DongFu prototype/alpha labels');
console.log(`\nV99 DONGFU PRODUCTION: ${pass}/${pass} PASS`);
