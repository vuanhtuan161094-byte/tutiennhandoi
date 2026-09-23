import assert from 'node:assert/strict';
import { CULTIVATION_REALMS_V140 } from '../../dist/core/cultivation-v140.js';
import {
  FULL_LIFE_ECONOMY_PACING_V160_SCHEMA,
  buildFullLifeEconomyPacingAuditV160,
  cultivationPacingRowV160,
  manualFlatTuViPer15sEnvelopeV160,
} from '../../dist/core/full-life-economy-pacing-v160.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };
const audit = buildFullLifeEconomyPacingAuditV160();

test('V160 audit covers the exact production cultivation ladder', () => {
  assert.equal(audit.schema, FULL_LIFE_ECONOMY_PACING_V160_SCHEMA);
  assert.equal(audit.scope.realmOrders, 118);
  assert.equal(audit.scope.nonTerminalOrders, 117);
  assert.equal(audit.scope.majorMilestones, 29);
  assert.equal(audit.rows.length, CULTIVATION_REALMS_V140.length);
  assert.deepEqual(audit.rows.map(x => x.order), Array.from({ length: 118 }, (_, i) => i));
  assert.equal(audit.rows.at(-1).terminal, true);
  assert.equal(audit.rows.at(-1).requiredTuVi, 0);
});

test('V160 baseline ledger reproduces authored target timing without a second progression curve', () => {
  for (const row of audit.rows) {
    const authority = CULTIVATION_REALMS_V140[row.order];
    assert.equal(row.baseTuViPer15s, authority.baseTuViPer15s);
    assert(Math.abs(row.authoredBaselineDays - authority.targetSeconds / 86400) < 1e-6 + 1e-9);
  }
  assert(audit.totals.authoredBaselineDays > 0);
});

test('V160 manual envelopes use V127 flat Tu Vi and remain diagnostic scenarios', () => {
  assert.equal(manualFlatTuViPer15sEnvelopeV160(0, 'none'), 0);
  assert(manualFlatTuViPer15sEnvelopeV160(10, 'learned100') > 0);
  assert(manualFlatTuViPer15sEnvelopeV160(10, 'learned500') > manualFlatTuViPer15sEnvelopeV160(10, 'learned100'));
  assert(manualFlatTuViPer15sEnvelopeV160(10, 'maxed') > manualFlatTuViPer15sEnvelopeV160(10, 'learned500'));
  assert.match(audit.scope.disclaimer, /diagnostics|diagnostic/i);
});

test('V160 never applies major-gate requirement reduction outside major gates and caps it at five percent', () => {
  for (const authority of CULTIVATION_REALMS_V140.slice(0, -1)) {
    const row = cultivationPacingRowV160(authority, { majorRequirementReductionPct: 99 });
    if (row.majorGate) assert.equal(row.majorRequirementReductionPct, 5);
    else assert.equal(row.majorRequirementReductionPct, 0);
  }
});

test('V160 Alchemy audit keeps two real ingredient lanes and bounded cultivation pill shortcut', () => {
  assert.equal(audit.alchemy.familyCount, 11);
  assert.equal(audit.alchemy.majorRealmCount, 28);
  assert.equal(audit.alchemy.majors.length, 29);
  for (const row of audit.alchemy.majors) {
    assert(row.herbCostOneOfEach > 0);
    assert(row.cultivationPillMaxSupremePct >= 3 && row.cultivationPillMaxSupremePct <= 12);
    assert(row.garden.level1.grossMatureHerbsPerDay > 0);
    assert(row.garden.level10.grossMatureHerbsPerDay >= row.garden.level1.grossMatureHerbsPerDay);
    if (row.majorRealmIndex > 0) {
      assert.equal(row.demonCore.bossFirstClearTotal800, 240);
      assert(row.demonCore.killsPerDropBestZone <= row.demonCore.killsPerDropWorstZone);
    }
  }
});

test('V160 resource PvE audit proves all eight resource categories have real time-based sources', () => {
  assert.equal(audit.resourcePve.length, 8);
  for (const row of audit.resourcePve) {
    assert.equal(row.firstClearMode, 'CombatKernelV2');
    assert.equal(row.farmMode, 'time-based-dungeon');
    assert.equal(row.floorCount, 8);
    assert(row.maxMaterialPerYear > 0);
    assert(row.maxBreakthroughPerYear > 0);
    assert.equal(row.specificFragments, 'gacha-only');
  }
});

test('V160 Bound Jade ledger exposes the real recurring 28-day acquisition budget', () => {
  assert.equal(audit.boundJade.cycleDays, 28);
  assert.equal(audit.boundJade.pvpDailyBoundJadeCap, 40);
  assert.equal(audit.boundJade.recurring28, 5120);
  assert.equal(audit.boundJade.firstClearBurst28, 300);
  assert.equal(audit.boundJade.gachaSingleCost, 160);
  assert.equal(audit.boundJade.gachaTenCost, 1440);
  assert.equal(audit.boundJade.equivalentDiscountedPullsFromRecurring28, 35.56);
});

test('V160 audit keeps unresolved acquisition pacing visible instead of fabricating a full-life PASS', () => {
  const fragmentFlag = audit.flags.find(x => x.id === 'specific-fragment-pacing-unresolved');
  assert(fragmentFlag);
  assert.equal(fragmentFlag.severity, 'measure');
  assert.match(fragmentFlag.note, /Vạn Tượng|pity|acquisition/i);
});

console.log('\nV160 FULL-LIFE ECONOMY / PACING AUDIT SUMMARY');
console.log(JSON.stringify({
  scope: audit.scope,
  totals: audit.totals,
  majorCount: audit.majors.length,
  alchemyMajorCount: audit.alchemy.majors.length,
  resourcePveCategories: audit.resourcePve.map(x => x.category),
  boundJade: audit.boundJade,
  flags: audit.flags,
}, null, 2));
console.log(`\nV160 FULL-LIFE ECONOMY / PACING: ${passed}/${passed} PASS`);
