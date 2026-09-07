import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import {
  CULTIVATION_REALMS_V140, CULTIVATION_TICK_SECONDS_V140,
  RETREAT_DAILY_BANK_HOURS_V140, RETREAT_BANK_CAP_HOURS_V140,
  cultivationRealmV140, isTribulationGateV140, isMajorRealmGateV140,
  cultivationRateV140,
} from '../../dist/core/cultivation-v140.js';

let passed=0;
const check=(name,fn)=>{fn();passed++;console.log(`✓ ${name}`)};
const registry=buildRegistry();
function makeAt(order,seed=140001){
  const st=createPlayableAdventureState();
  const realm=[...registry.realms.values()].find(x=>x.order===order);
  assert(realm,`missing realm order ${order}`);
  st.realm.realmId=realm.id; st.realm.maxRealmOrder=order;
  st.cultivation.tuVi=0; st.cultivation.commitRemainderSeconds=0; st.cultivation.retreatBankHours=3; st.cultivation.retreatBankDayKey='';
  st.injury=0; st.lifespanYears=Math.max(Number(st.lifespanYears)||0,1e9);
  st.inheritedOrigins = { ...(st.inheritedOrigins||{}), 'birth.cultivation.multiplier': 1 };
  const session=new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,seed,st);
  session.stateValue.inheritedOrigins = { ...(session.stateValue.inheritedOrigins||{}), 'birth.cultivation.multiplier': 1 };
  session.stateValue.character.fateModifiersV4 = {};
  return session;
}

check('118 realm orders are canonical, contiguous and unique',()=>{
  assert.equal(CULTIVATION_REALMS_V140.length,118);
  assert.deepEqual(CULTIVATION_REALMS_V140.map(x=>x.order),Array.from({length:118},(_,i)=>i));
  assert.equal(new Set(CULTIVATION_REALMS_V140.map(x=>x.id)).size,118);
});
check('base Tu Vi never decreases and requirements are authored from base rate × target time',()=>{
  let last=0;
  for(const row of CULTIVATION_REALMS_V140){
    assert(row.baseTuViPer15s>=last,`${row.name} base rate decreased`); last=row.baseTuViPer15s;
    if(row.nextRealmId){
      assert(row.targetSeconds>0,`${row.name} target time must be positive`);
      assert.equal(row.requiredTuVi,Math.round(row.baseTuViPer15s*row.targetSeconds/CULTIVATION_TICK_SECONDS_V140),`${row.name} requirement formula drift`);
    }else{
      assert.equal(row.order,117); assert.equal(row.requiredTuVi,0); assert.equal(row.targetSeconds,0);
    }
  }
});
check('five Độ Kiếp gates are explicit challenge gates',()=>{
  assert.deepEqual(CULTIVATION_REALMS_V140.filter(x=>isTribulationGateV140(x.order)).map(x=>x.order),[41,42,43,44,45]);
});
check('daily Bế Quan bank is 3h/day with 9h cap',()=>{
  assert.equal(RETREAT_DAILY_BANK_HOURS_V140,3); assert.equal(RETREAT_BANK_CAP_HOURS_V140,9);
});
check('fresh Phàm Nhân commits integer Tu Vi only every 15 seconds',()=>{
  const s=makeAt(0); const a=s.advanceRealtimeCultivationV140(14); assert.equal(a.gained,0); assert.equal(s.stateValue.cultivation.tuVi,0);
  const b=s.advanceRealtimeCultivationV140(1); assert.equal(b.gained,10); assert.equal(s.stateValue.cultivation.tuVi,10);
});
check('minor realm auto-advances but major realm gate stops for deterministic Thăng Cảnh',()=>{
  const minor=makeAt(1,140002); const r1=cultivationRealmV140(1); minor.stateValue.cultivation.tuVi=r1.requiredTuVi-12;
  minor.advanceRealtimeCultivationV140(15); assert.equal(minor.stateValue.realm.maxRealmOrder,2); assert.equal(minor.stateValue.cultivation.tuVi,0);
  const major=makeAt(9,140003); const r9=cultivationRealmV140(9); major.stateValue.cultivation.tuVi=r9.requiredTuVi;
  major.advanceRealtimeCultivationV140(150); assert.equal(major.stateValue.realm.maxRealmOrder,9); assert.equal(isMajorRealmGateV140(9),true);
  const out=major.ascendRealmV140(); assert.equal(major.stateValue.realm.maxRealmOrder,10); assert.equal(out.toRealmId,'realm.foundation.early');
});
check('Bế Quan grants current-realm percent as concrete Tu Vi and never wastes bank near cap',()=>{
  const s=makeAt(18,140004), row=cultivationRealmV140(18);
  const out=s.instantRetreatV140(3,Date.UTC(2026,8,6));
  assert(Math.abs(out.gained-row.requiredTuVi*0.05)<1e-6); assert(Math.abs(out.hoursUsed-3)<1e-9);
  const near=makeAt(18,140005); near.stateValue.cultivation.tuVi=row.requiredTuVi*0.99;
  const out2=near.instantRetreatV140(3,Date.UTC(2026,8,6));
  assert(Math.abs(out2.gained-row.requiredTuVi*0.01)<1e-6); assert(out2.hoursUsed>0&&out2.hoursUsed<1,'near-cap retreat should consume only needed fraction');
  assert(near.stateValue.cultivation.retreatBankHours>2,'unused retreat bank must remain');
});
check('Thương Thế blocks Bế Quan/Thăng Cảnh but never reduces passive Tu Vi rate',()=>{
  const s=makeAt(9,140006), row=cultivationRealmV140(9); s.stateValue.injury=61; s.stateValue.cultivation.tuVi=row.requiredTuVi;
  const rate=cultivationRateV140(s.stateValue,9); assert.equal(rate.finalTuViPer15s,row.baseTuViPer15s);
  assert.throws(()=>s.instantRetreatV140(1),/Thương Thế/); assert.throws(()=>s.ascendRealmV140(),/Thương Thế/);
});
check('Tu Vi provenance is base + flat + percent-of-base, with no hidden multiplier chain',()=>{
  const s=makeAt(22,140007); s.stateValue.cultivation.flatTuViPer15s=20; s.stateValue.cultivation.baseTuViBonusPct=10;
  const rate=cultivationRateV140(s.stateValue,22); assert.equal(rate.baseTuViPer15s,100); assert.equal(rate.finalTuViPer15s,130);
  assert.deepEqual(rate.sources.map(x=>x.kind),['base','flat','percent']);
});
check('birth cultivation bonus is an explicit provenance source, not a hidden breakthrough stat',()=>{
  const s=makeAt(22,140008); s.stateValue.inheritedOrigins['birth.cultivation.multiplier']=1.18;
  const rate=cultivationRateV140(s.stateValue,22); assert.equal(rate.baseTuViPer15s,100); assert.equal(rate.finalTuViPer15s,118);
  assert(rate.sources.some(x=>x.id==='birth'&&Math.abs(x.value-18)<1e-9));
});
check('new cultivation state contains no retired physiology/breakthrough fields',()=>{
  const c=createPlayableAdventureState().cultivation;
  for(const key of ['energy','maxEnergy','backlog','impurity','meridianHealth','cultivationMethodId','breakthroughPreparation']) assert.equal(Object.hasOwn(c,key),false,key);
  const r=createPlayableAdventureState().realm;
  for(const key of ['foundationQuality','foundationDamageLevel','breakthroughsSucceeded','breakthroughsFailed']) assert.equal(Object.hasOwn(r,key),false,key);
});
console.log(`\nV140 CULTIVATION CORE — ${passed}/${passed} PASS`);
