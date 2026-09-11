import assert from 'node:assert/strict';
import {
  MANUAL_ACQUISITION_PACING_V161_SCHEMA,
  V161_MANUAL_AUDIT_STAGE_INDEXES,
  V161_MANUAL_GATE_AUTHORITY,
  V161_MANUAL_SAMPLING_MODE,
  buildManualAcquisitionPacingAuditV161,
  simulateManualAcquisitionPacingV161,
} from '../../dist/core/manual-acquisition-pacing-v161.js';
import {
  V161_SPEND_HORIZONS_DAYS,
  V161_SPEND_PROFILES,
  V161_SPEND_SEEDS,
  simulateBoundJadeSpendV161,
} from '../../dist/core/bound-jade-spend-model-v161.js';

let passed=0;
const test=(name,fn)=>{fn();passed++;console.log(`✓ ${name}`)};
const audit=buildManualAcquisitionPacingAuditV161();

function row(stageIndex,profileId,days){
  return audit.matrix.find(x=>x.stageIndex===stageIndex&&x.profileId===profileId&&x.days===days);
}

test('V161 B4 covers early/mid/late manual stages over the same B3 profiles, horizons and seeds',()=>{
  assert.equal(audit.schema,MANUAL_ACQUISITION_PACING_V161_SCHEMA);
  assert.equal(audit.samplingMode,V161_MANUAL_SAMPLING_MODE);
  assert.equal(audit.gateAuthority,V161_MANUAL_GATE_AUTHORITY);
  assert.equal(V161_MANUAL_GATE_AUTHORITY,'advanceCollectionEconomyV12325');
  assert.deepEqual(audit.stageIndexes,[2,14,28]);
  assert.deepEqual(audit.stageIndexes,[...V161_MANUAL_AUDIT_STAGE_INDEXES]);
  assert.deepEqual(audit.horizons,[...V161_SPEND_HORIZONS_DAYS]);
  assert.deepEqual(audit.seeds,[...V161_SPEND_SEEDS]);
  assert.deepEqual(audit.profiles,Object.keys(V161_SPEND_PROFILES));
  assert.equal(audit.matrix.length,3*4*3);
});

test('V161 B4 reuses the exact B3 manual allocation instead of inventing another Jade budget',()=>{
  for(const profileId of Object.keys(V161_SPEND_PROFILES)){
    const b3=simulateBoundJadeSpendV161(profileId,180,16101);
    const b4=simulateManualAcquisitionPacingV161(profileId,28,180,16101);
    assert.equal(b4.manualPulls,b3.categories.manual.pulls);
    assert.equal(b4.manualBudget,b3.categories.manual.allocatedBudget);
  }
});

test('V161 B4 explicitly models independent horizon snapshots rather than pretending they are one save timeline',()=>{
  const sample=simulateManualAcquisitionPacingV161('combatFirst',2,90,16101);
  assert.equal(sample.samplingMode,V161_MANUAL_SAMPLING_MODE);
  assert.match(sample.assumptions.sampling,/independent/i);
  assert.match(sample.assumptions.sampling,/not a continuation/i);
  assert.match(audit.interpretation,/independent Monte Carlo snapshots/i);
});

test('V161 B4 uses the actual player-facing V12325 manual gate authority',()=>{
  const sample=simulateManualAcquisitionPacingV161('manualFocused',28,365,16101);
  assert.equal(sample.gateAuthority,'advanceCollectionEconomyV12325');
  assert.equal(sample.resources.gateAuthority,'advanceCollectionEconomyV12325');
  assert.match(sample.resources.note,/Công Pháp Tàn Ý/);
  assert.match(sample.resources.note,/Thiên Tinh Công Pháp/);
  assert.match(sample.resources.note,/specific fragments/i);
  assert.match(audit.interpretation,/three-resource gate/i);
});

test('V161 B4 three-resource accounting conserves generic and breakthrough material',()=>{
  let observedEssenceSpend=false;
  let observedGenericSpend=false;
  for(const stageIndex of V161_MANUAL_AUDIT_STAGE_INDEXES){
    for(const profileId of Object.keys(V161_SPEND_PROFILES)){
      for(const days of V161_SPEND_HORIZONS_DAYS){
        for(const seed of V161_SPEND_SEEDS){
          const sample=simulateManualAcquisitionPacingV161(profileId,stageIndex,days,seed);
          assert(sample.resources.genericFragmentsAfterGacha>=sample.resources.genericFragmentsSpent);
          assert.equal(
            sample.resources.genericFragmentsAfterGacha-sample.resources.genericFragmentsSpent,
            sample.resources.genericFragmentsRemaining,
            `${stageIndex}:${profileId}:${days}:${seed}: generic conservation`,
          );
          assert(sample.resources.manualBreakthroughEssenceAfterGacha>=sample.resources.manualBreakthroughEssenceSpent);
          assert.equal(
            sample.resources.manualBreakthroughEssenceAfterGacha-sample.resources.manualBreakthroughEssenceSpent,
            sample.resources.manualBreakthroughEssenceRemaining,
            `${stageIndex}:${profileId}:${days}:${seed}: essence conservation`,
          );
          assert(sample.target.specificFragmentsRemaining>=0);
          observedEssenceSpend ||= sample.resources.manualBreakthroughEssenceSpent>0;
          observedGenericSpend ||= sample.resources.genericFragmentsSpent>0;
        }
      }
    }
  }
  assert(observedGenericSpend,'B4 must exercise real Công Pháp Tàn Ý spending');
  assert(observedEssenceSpend,'B4 must exercise real Thiên Tinh Công Pháp spending at a 100-Lv gate');
});

test('V161 B4 longer horizons increase pull opportunity and oriented-target progression for every stage/profile',()=>{
  for(const stageIndex of V161_MANUAL_AUDIT_STAGE_INDEXES){
    for(const profileId of Object.keys(V161_SPEND_PROFILES)){
      const rows=V161_SPEND_HORIZONS_DAYS.map(days=>row(stageIndex,profileId,days));
      for(let i=1;i<rows.length;i++){
        assert(rows[i].avgManualPulls>rows[i-1].avgManualPulls,`${stageIndex}:${profileId}: pulls`);
        assert(rows[i].target.avgLevel>=rows[i-1].target.avgLevel,`${stageIndex}:${profileId}: target level`);
        assert(rows[i].target.avgAdvance>=rows[i-1].target.avgAdvance,`${stageIndex}:${profileId}: target advance`);
      }
    }
  }
});

test('V161 B4 keeps stochastic total manual Tu Vi measurable without treating Monte Carlo noise as regression',()=>{
  for(const entry of audit.matrix){
    assert(entry.cultivation.avgManualFlatPer15s>=0,`${entry.stageIndex}:${entry.profileId}:${entry.days}: flat Tu Vi`);
    assert(entry.cultivation.avgPassiveSpeedup>=1,`${entry.stageIndex}:${entry.profileId}:${entry.days}: speedup`);
    assert(entry.cultivation.avgManualFlatPer15s<entry.cultivation.theoreticalCurrentStageMaxFlatPer15s,`${entry.stageIndex}:${entry.profileId}:${entry.days}: ceiling`);
  }
});

test('V161 B4 365-day focused spending beats balanced and combat-first manual pacing',()=>{
  for(const stageIndex of V161_MANUAL_AUDIT_STAGE_INDEXES){
    const focused=row(stageIndex,'manualFocused',365);
    const balanced=row(stageIndex,'balanced',365);
    const combat=row(stageIndex,'combatFirst',365);
    assert(focused.cultivation.avgManualFlatPer15s>balanced.cultivation.avgManualFlatPer15s,`${stageIndex}: focused > balanced`);
    assert(balanced.cultivation.avgManualFlatPer15s>=combat.cultivation.avgManualFlatPer15s,`${stageIndex}: balanced >= combat`);
    assert(focused.target.avgLevel>=balanced.target.avgLevel);
    assert(focused.target.avgAdvance>=balanced.target.avgAdvance);
  }
});

test('V161 B4 production acquisition stays materially below the theoretical current-stage max ceiling',()=>{
  for(const entry of audit.matrix){
    assert(entry.cultivation.avgShareOfStageMaxPct<100,`${entry.stageIndex}:${entry.profileId}:${entry.days}: max share`);
  }
  const lateFocused=row(28,'manualFocused',365);
  assert(lateFocused.target.maxAdvance<10,'Sáng Thế 365d focused should not silently reach Grand Completion from recurring Jade alone');
});

test('V161 B4 higher-realm resource scaling does not make late gates easier than Trúc Cơ under the same spend profile',()=>{
  for(const profileId of Object.keys(V161_SPEND_PROFILES)){
    const early=row(2,profileId,365),late=row(28,profileId,365);
    assert(late.target.avgAdvance<=early.target.avgAdvance,`${profileId}: late advance must not exceed early`);
  }
});

test('V161 B4 keeps Resource-PvE outside the gacha-only isolation model',()=>{
  const sample=simulateManualAcquisitionPacingV161('manualFocused',28,365,16101);
  assert.match(sample.assumptions.strategy,/oriented target first/i);
  assert.match(sample.assumptions.excluded,/Resource-PvE/i);
  assert.match(sample.assumptions.excluded,/conservative/i);
});

console.log('\nV161 MANUAL ACQUISITION-ADJUSTED PACING SUMMARY');
console.log(JSON.stringify({
  samplingMode:audit.samplingMode,
  gateAuthority:audit.gateAuthority,
  stages:audit.stageIndexes,
  horizons:audit.horizons,
  rows365:audit.matrix.filter(x=>x.days===365),
},null,2));
console.log(`\nV161 MANUAL ACQUISITION PACING — ${passed}/${passed} PASS`);
