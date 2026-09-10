import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import {
  RETREAT_DAILY_BANK_HOURS_V140,
  RETREAT_BANK_CAP_HOURS_V140,
  cultivationRealmV140,
} from '../../dist/core/cultivation-v140.js';

let passed=0;
const test=(name,fn)=>{fn();passed++;console.log(`✓ ${name}`)};
const registry=buildRegistry();

function makeAt(order,seed=161001){
  const state=createPlayableAdventureState();
  const realm=[...registry.realms.values()].find(x=>x.order===order);
  assert(realm,`missing realm order ${order}`);
  state.realm.realmId=realm.id;
  state.realm.maxRealmOrder=order;
  state.cultivation.tuVi=0;
  state.cultivation.retreatBankHours=9;
  state.cultivation.retreatBankDayKey='';
  state.injury=0;
  const session=new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,seed,state);
  session.stateValue.injury=0;
  return session;
}

test('V161 preserves the canonical 3h daily accrual and 9h bank cap',()=>{
  assert.equal(RETREAT_DAILY_BANK_HOURS_V140,3);
  assert.equal(RETREAT_BANK_CAP_HOURS_V140,9);
});

test('V161 retreat reward remains authored current-realm percentage, not a hidden rate multiplier',()=>{
  const session=makeAt(18);
  const realm=cultivationRealmV140(18);
  const out=session.instantRetreatV140(3,Date.UTC(2026,8,11));
  assert.equal(realm.retreat3hProgressPct,5);
  assert(Math.abs(out.gained-realm.requiredTuVi*0.05)<1e-6);
  assert(Math.abs(out.hoursUsed-3)<1e-9);
});

test('V161 can spend accumulated bank above three hours without changing the daily quota',()=>{
  const session=makeAt(18,161002);
  const realm=cultivationRealmV140(18);
  const out=session.instantRetreatV140(6,Date.UTC(2026,8,11));
  assert(Math.abs(out.gained-realm.requiredTuVi*0.10)<1e-6);
  assert(Math.abs(out.hoursUsed-6)<1e-9);
  assert.equal(RETREAT_DAILY_BANK_HOURS_V140,3);
});

test('V161 production player guide describes a three-hour daily quota',()=>{
  const source=readFileSync(new URL('../../dist/core/player-experience-v105.js',import.meta.url),'utf8');
  assert(source.includes("Bế Quan dùng tối đa 3 giờ quy đổi mỗi ngày."));
});

test('V161 production cultivation UI explains percent-of-requirement semantics',()=>{
  const source=readFileSync(new URL('../../app.js',import.meta.url),'utf8');
  assert(source.includes("Mỗi ngày +${num(daily,0)}h"));
  assert(source.includes("3h hiện tại tương đương ${num(retreat.rewardPct3h||0,2)}% requirement"));
  assert(source.includes("const retreatButtons=[1,3,6,9].filter(h=>h<=cap)"));
});

test('V161 production-facing cultivation copy contains no old 12-hour or x1.75 retreat promise',()=>{
  const sources=[
    readFileSync(new URL('../../dist/core/player-experience-v105.js',import.meta.url),'utf8'),
    readFileSync(new URL('../../app.js',import.meta.url),'utf8'),
  ].join('\n');
  assert(!/Bế Quan[^\n]{0,120}(?:12\s*(?:h|giờ)|1[.,]75\s*[x×]?)/iu.test(sources));
});

console.log(`\nV161 RETREAT CONTRACT AUDIT — ${passed}/${passed} PASS`);
