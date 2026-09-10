import assert from 'node:assert/strict';
import {
  FULL_LIFE_AUDIT_SUMMARY_V160_SCHEMA,
  buildFullLifeAuditSummaryV160,
} from '../../dist/core/full-life-audit-summary-v160.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };
const audit = buildFullLifeAuditSummaryV160();

test('V160 reconciled audit is production-authority measurement, not an auto-balance patch', () => {
  assert.equal(audit.schema, FULL_LIFE_AUDIT_SUMMARY_V160_SCHEMA);
  assert.equal(audit.productionAuthority, true);
  assert.equal(audit.status, 'measurement-complete-balance-not-applied');
});

test('V160 closes the raw specific-fragment measurement gap through production acquisition evidence', () => {
  assert(audit.reconciliation.rawSpecificFragmentFlags > 0);
  assert.equal(audit.reconciliation.acquisitionAuditPresent, true);
  assert.equal(audit.reconciliation.unresolvedAfterReconciliation, 0);
});

test('V160 preserves the two sharp authored baseline jumps as findings rather than silently smoothing them', () => {
  const jumps = audit.findings.filter(x => x.id === 'baseline-duration-jump');
  assert.deepEqual(jumps.map(x => x.order), [1, 10]);
  assert(jumps[0].ratio > 5);
  assert(jumps[1].ratio > 3);
});

test('V160 makes current Bế Quan semantics an explicit Phase B review item', () => {
  const retreat = audit.findings.find(x => x.id === 'retreat-is-authored-realm-percent-not-rate-derived');
  assert(retreat);
  assert.equal(retreat.evidence.dailyBankHours, 3);
  assert(retreat.evidence.steadyDaysWithDailyRetreat < retreat.evidence.baselineDays);
  assert.match(retreat.conclusion, /không|does not automatically scale|Phase B/i);
});

test('V160 reconciles theoretical manual runaway against real Vạn Tượng acquisition', () => {
  const constraint = audit.findings.find(x => x.id === 'manual-max-envelope-is-acquisition-constrained');
  const diagnostic = audit.findings.find(x => x.id === 'raw-manual-max-envelope-reconciled');
  assert(constraint && diagnostic);
  assert.equal(constraint.evidence.competingBannerCount, 8);
  assert(constraint.evidence.daysFor1000PullsIfAllRecurringJade > 600);
  assert(constraint.evidence.lateAffordableGatesAt1000 < 10);
  assert(diagnostic.evidence.allUnlockedManualsMaxDays < diagnostic.evidence.allUnlockedManualsLv500Days);
  assert.match(constraint.conclusion, /Do not nerf Công Pháp/);
});

test('V160 keeps Linh Căn and Luân Hồi acquisition gates visible in the combined conclusion', () => {
  const root = audit.findings.find(x => x.id === 'spiritual-root-is-hunt-and-realm-gated');
  const rebirth = audit.findings.find(x => x.id === 'reincarnation-is-multi-life-budget');
  assert(root && rebirth);
  assert(root.evidence.lv1000Ascensions >= 9);
  assert(root.evidence.virtualOriginPityKills === 500);
  assert.equal(rebirth.evidence.combinedRp, 1843870);
  assert(rebirth.evidence.simpleTerminalRepeatLivesForTreeOnly > 10);
});

test('V160 next phase contains only evidence-backed pacing work, not new systems', () => {
  assert.equal(audit.nextPhase.id, 'phase-b-economy-pacing-fixes');
  assert(audit.nextPhase.priorities.length >= 4);
  assert(audit.nextPhase.priorities.every(x => !/new system|hệ thống mới/i.test(x)));
});

console.log('\nV160 RECONCILED FULL-LIFE AUDIT');
console.log(JSON.stringify(audit, null, 2));
console.log(`\nV160 FULL-LIFE AUDIT CLOSURE: ${passed}/${passed} PASS`);
