import assert from 'node:assert/strict';
import {
  MANUAL_LEVEL_MAX_V127, MANUAL_ADVANCE_MAX_V127, MANUAL_REALM_STAGES_V127,
  manualEffectMultiplierV127, manualStrengthenCostV127, manualAdvanceCostV127, manualComposeCostV127,
} from '../../dist/core/manual-progression-v127.js';
import {
  collectionCatalogV12316, collectionDefinitionV12316, createCollectionProgressStateV12316,
  ensureCollectionProgressStateV12316, grantCollectionItemV12316, strengthenCollectionItemV12316,
  collectionStatSummaryV12316, collectionCultivationMultiplierV12316, collectionManualCultivationPer15sV127, applyCollectionToEntityV12316,
} from '../../dist/core/collection-progression-v12316.js';
import {
  collectionDefinitionV12326, gachaCollectionV12326, composeCollectionItemV12326,
  collectionWorkshopSummaryV12326,
} from '../../dist/core/collection-workshop-gacha-v12326.js';

const manuals = collectionCatalogV12316('manual');
assert.equal(manuals.length, 261, 'V127 must have exactly 261 manuals');
assert.equal(MANUAL_REALM_STAGES_V127.length, 29, 'V127 must have 29 realm groups');
assert.deepEqual(manuals.map(x=>x.id), Array.from({length:261},(_,i)=>`manual.${i+1}`), 'manual IDs must remain sequential for save compatibility');
for (const realm of MANUAL_REALM_STAGES_V127) {
  const group=manuals.filter(x=>x.realmStageIndex===realm.index);
  assert.equal(group.length,9,`${realm.name} must have exactly 9 manuals`);
  assert(group.every(x=>x.requiredRealmOrder===realm.requiredRealmOrder));
}
assert.equal(manuals[0].name,'Phàm Nhân · Thiên Công Chân Kinh');
assert.equal(manuals.at(-1).name,'Sáng Thế Chủ · Sinh Sinh Tạo Hóa Kinh');
assert(manuals.every(x=>x.maxLevel===1000 && x.maxAdvance===10));
assert(manuals.every(x=>(x.stats||[]).every(st=>!String(st.id).toLowerCase().includes('requirement'))));

// V126 -> V127 one-time save migration preserves investment and maps Lv1..50 to Lv1..1000.
const old=createCollectionProgressStateV12316();
delete old.manualV127Migrated;
delete old.manualV127MigrationVersion;
old.items['manual.1']={owned:true,level:50,advance:6,specificFragments:77};
const holder={collectionV12316:old};
const migrated=ensureCollectionProgressStateV12316(holder);
assert.equal(migrated.manualV127Migrated,true);
assert.equal(migrated.items['manual.1'].level,1000);
assert.equal(migrated.items['manual.1'].advance,9);
assert.equal(migrated.items['manual.1'].specificFragments,77);
const migratedAgain=ensureCollectionProgressStateV12316(holder);
assert.equal(migratedAgain.items['manual.1'].level,1000,'migration must be idempotent');
assert.equal(migratedAgain.manualV127MigrationVersion,2,'migration version must persist');

// Lv1000 is materially stronger than Lv1; stronger books also cost more to learn/upgrade/advance.
const weak=manuals[0], strong=manuals.at(-1);
assert(manualEffectMultiplierV127({level:1000,advance:0}) > manualEffectMultiplierV127({level:1,advance:0}) * 25);
assert(manualEffectMultiplierV127({level:1000,advance:6}) > manualEffectMultiplierV127({level:1000,advance:0}));
assert(manualStrengthenCostV127(strong,{level:1,advance:0}) > manualStrengthenCostV127(weak,{level:1,advance:0}));
assert(manualAdvanceCostV127(strong,{level:1,advance:0}) > manualAdvanceCostV127(weak,{level:1,advance:0}));
assert(manualComposeCostV127(strong) > manualComposeCostV127(weak));

// Every learned manual remains effective permanently and stacks without an equip slot/current-realm filter.
const stacked=createCollectionProgressStateV12316();
grantCollectionItemV12316(stacked,'manual.1');
grantCollectionItemV12316(stacked,'manual.261');
stacked.items['manual.1'].level=1000;
stacked.items['manual.261'].level=1000;
const both=collectionStatSummaryV12316(stacked);
const only=createCollectionProgressStateV12316();
grantCollectionItemV12316(only,'manual.1'); only.items['manual.1'].level=1000;
const one=collectionStatSummaryV12316(only);
assert(both.cultivationFlatPer15s>one.cultivationFlatPer15s,'later learned manual must stack with earlier manual');
assert(both.powerPct>one.powerPct || both.bodyPct>one.bodyPct || both.defensePct>one.defensePct || both.healingPct>one.healingPct || both.shieldPct>one.shieldPct);
assert(collectionManualCultivationPer15sV127(stacked)>collectionManualCultivationPer15sV127(only));

// Bridge is wired to actual combat entity stats.
const entity={id:'v127.test',name:'V127 Test',tags:[],triggers:[],stats:{attack:100,defense:100,physique:100,maxHp:2000,maxSpirit:100,spiritStandard:100,critChancePct:0,armorPenPct:0}};
const applied=applyCollectionToEntityV12316(entity,stacked);
assert(applied.stats.attack>entity.stats.attack);
assert(applied.stats.attack>entity.stats.attack);
assert((applied.stats.healingEffectivenessPct??0)>0 || (applied.stats.shieldEffectPct??0)>0);

// Strengthen endpoint obeys the new 1000 cap.
const capState=createCollectionProgressStateV12316();
grantCollectionItemV12316(capState,'manual.1');
capState.items['manual.1'].level=999;
capState.items['manual.1'].advance=9;
capState.genericFragments.manual=999999;
const capResult=strengthenCollectionItemV12316(capState,'manual.1',10);
assert.equal(capResult.progress.level,MANUAL_LEVEL_MAX_V127);
assert.equal(capResult.levels,1);

// Realm gate: Phàm banner can only return Phàm manuals; future manuals cannot be composed.
const early=createCollectionProgressStateV12316(); early.currencies.boundImmortalJade=9999999;
const inventory={};
for(let i=0;i<120;i++){
  const result=gachaCollectionV12326(early,inventory,'banner.manual',10,127000+i,false,[],0);
  for(const row of result.results){
    if(!row.id) continue;
    const def=collectionDefinitionV12326(row.id);
    assert.equal(def.requiredRealmOrder,0,`early banner leaked future manual ${row.id}`);
  }
}
assert.throws(()=>composeCollectionItemV12326(early,'manual.10',0),/mở ở/i);

// Summary exposes exactly current unlock state, real effective stats and strength-based compose costs.
const summaryState=createCollectionProgressStateV12316();
grantCollectionItemV12316(summaryState,'manual.1');
summaryState.items['manual.1'].level=500;
const summary=collectionWorkshopSummaryV12326(summaryState,{},undefined,undefined,Date.now(),0);
const manualCat=summary.categories.find(x=>x.category==='manual');
assert.equal(manualCat.items.length,261);
assert.equal(manualCat.items.filter(x=>x.unlocked).length,9);
const ownedFirst=manualCat.items.find(x=>x.id==='manual.1');
const lockedNext=manualCat.items.find(x=>x.id==='manual.10');
assert(ownedFirst.effectiveStats?.length>0);
assert.equal(lockedNext.unlocked,false);
assert.equal(lockedNext.composeCost,undefined);
const unlockedWeak=manualCat.items.find(x=>x.id==='manual.2');
const unlockedStrong=manualCat.items.find(x=>x.id==='manual.9');
assert(unlockedStrong.composeCost>unlockedWeak.composeCost,'same-realm stronger manual must cost more fragments to compose');

console.log('V127 MANUAL PROGRESSION — PASS');
console.log(JSON.stringify({manuals:manuals.length,realms:MANUAL_REALM_STAGES_V127.length,perRealm:9,levelCap:MANUAL_LEVEL_MAX_V127,advanceCap:MANUAL_ADVANCE_MAX_V127,weakCompose:manualComposeCostV127(weak),strongCompose:manualComposeCostV127(strong),weakStrengthenLv1:manualStrengthenCostV127(weak,{level:1}),strongStrengthenLv1:manualStrengthenCostV127(strong,{level:1})},null,2));
