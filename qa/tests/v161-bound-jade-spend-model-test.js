import assert from 'node:assert/strict';
import {
  BOUND_JADE_SPEND_MODEL_V161_SCHEMA,
  V161_SPEND_HORIZONS_DAYS,
  V161_SPEND_PROFILES,
  V161_SPEND_SEEDS,
  buildBoundJadeSpendAuditV161,
  simulateBoundJadeSpendV161,
} from '../../dist/core/bound-jade-spend-model-v161.js';

let passed=0;
const test=(name,fn)=>{fn();passed++;console.log(`✓ ${name}`)};
const audit=buildBoundJadeSpendAuditV161();

test('V161 spend model covers three explicit profiles, four horizons and five production-gacha seeds',()=>{
  assert.equal(audit.schema,BOUND_JADE_SPEND_MODEL_V161_SCHEMA);
  assert.equal(Object.keys(V161_SPEND_PROFILES).length,3);
  assert.deepEqual(V161_SPEND_HORIZONS_DAYS,[28,90,180,365]);
  assert.equal(V161_SPEND_SEEDS.length,5);
  assert.equal(audit.matrix.length,12);
  assert.deepEqual(audit.bannerCategories,['manual','heart','artifact','relic','pet','companion','bloodline','physique']);
});

test('V161 each profile spends one hundred percent across the same eight banners',()=>{
  for(const profile of Object.values(audit.profiles)){
    assert.equal(Object.keys(profile.weights).length,8);
    const total=Object.values(profile.weights).reduce((a,b)=>a+b,0);
    assert(Math.abs(total-1)<1e-9);
  }
});

test('V161 production gacha never overspends the recurring Bound Jade horizon budget',()=>{
  for(const profileId of Object.keys(V161_SPEND_PROFILES)){
    const run=simulateBoundJadeSpendV161(profileId,365,16101);
    assert(run.totalCost<=run.totalBudget);
    assert.equal(run.totalBudget-run.totalCost,run.unspentBudget);
    assert(run.totalPulls>0);
    for(const category of audit.bannerCategories)assert(run.categories[category].pulls>0,`${profileId}:${category}`);
  }
});

test('V161 manual-focused profile materially outspends balanced and combat-first on Công Pháp',()=>{
  const focused=audit.matrix.find(x=>x.profileId==='manualFocused'&&x.days===365);
  const balanced=audit.matrix.find(x=>x.profileId==='balanced'&&x.days===365);
  const combat=audit.matrix.find(x=>x.profileId==='combatFirst'&&x.days===365);
  assert(focused.categories.manual.avgPulls>balanced.categories.manual.avgPulls*3.5);
  assert(balanced.categories.manual.avgPulls>combat.categories.manual.avgPulls);
  assert(focused.manualTarget.avgFragments>balanced.manualTarget.avgFragments);
  assert(balanced.manualTarget.avgFragments>=combat.manualTarget.avgFragments*0.7);
});

test('V161 balanced profile gives every banner the same pull budget at a fixed horizon',()=>{
  const row=audit.matrix.find(x=>x.profileId==='balanced'&&x.days===180);
  const pulls=Object.values(row.categories).map(x=>x.avgPulls);
  assert.equal(new Set(pulls).size,1);
});

test('V161 longer horizons monotonically increase average manual progress for each profile',()=>{
  for(const profileId of Object.keys(V161_SPEND_PROFILES)){
    const rows=audit.matrix.filter(x=>x.profileId===profileId).sort((a,b)=>a.days-b.days);
    for(let i=1;i<rows.length;i++){
      assert(rows[i].categories.manual.avgPulls>rows[i-1].categories.manual.avgPulls);
      assert(rows[i].manualTarget.avgFragments>=rows[i-1].manualTarget.avgFragments);
      assert(rows[i].manualTarget.avgAffordableGates>=rows[i-1].manualTarget.avgAffordableGates);
    }
  }
});

test('V161 spend model is diagnostic only and does not redefine banner economics',()=>{
  assert.match(audit.interpretation,/not a recommendation/i);
  const sample=simulateBoundJadeSpendV161('balanced',28,16101);
  assert.match(sample.assumptions.note,/does not change banner rates, prices or game rules/i);
});

console.log('\nV161 BOUND JADE SPEND MODEL');
console.log(JSON.stringify(audit,null,2));
console.log(`\nV161 BOUND JADE SPEND MODEL — ${passed}/${passed} PASS`);
