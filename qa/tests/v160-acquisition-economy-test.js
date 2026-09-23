import assert from 'node:assert/strict';
import {
  FULL_LIFE_ACQUISITION_V160_SCHEMA,
  buildFullLifeAcquisitionAuditV160,
} from '../../dist/core/full-life-acquisition-v160.js';
import { ECONOMY_PRODUCTION_V111 } from '../../dist/core/economy-production-v111.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };
const audit = buildFullLifeAcquisitionAuditV160();

test('V160 acquisition audit uses the canonical eight-banner Vạn Tượng economy', () => {
  assert.equal(audit.schema, FULL_LIFE_ACQUISITION_V160_SCHEMA);
  assert.equal(audit.gacha.categoryBannerCount, 8);
  assert.equal(audit.gacha.singleCost, 160);
  assert.equal(audit.gacha.tenCost, 1440);
  const expectedDaily = ECONOMY_PRODUCTION_V111.dailyActivityBoundJade + ECONOMY_PRODUCTION_V111.dailyPvpPaidWins * ECONOMY_PRODUCTION_V111.pvpRewardPerWin + ECONOMY_PRODUCTION_V111.weeklyRecurringBoundJade / 7;
  assert.equal(audit.gacha.recurringBoundJadePerDay, Number(expectedDaily.toFixed(3)));
});

test('V160 manual acquisition samples stay inside one nine-manual realm pool', () => {
  assert.equal(audit.gacha.samples.length, 6);
  for (const row of audit.gacha.samples) {
    assert([0,14,28].includes(row.stageIndex));
    assert([100,1000].includes(row.pulls));
    assert(row.uniqueManualsSeen <= 9);
    assert(row.targetFragments > 0);
    assert(row.totalFragmentsForLv1000 > row.targetFragments);
    assert(row.affordableGates < 10);
    assert(row.calendarDaysIfAllRecurringBoundJadeWentHere > 0);
  }
});

test('V160 high-realm manual fragment demand rises instead of becoming a free late-game accelerator', () => {
  const early = audit.gacha.samples.find(x => x.stageIndex === 0 && x.pulls === 1000);
  const late = audit.gacha.samples.find(x => x.stageIndex === 28 && x.pulls === 1000);
  assert(late.totalFragmentsForLv1000 > early.totalFragmentsForLv1000);
  assert(late.affordableGates <= early.affordableGates);
  assert.equal(late.calendarDaysIfAllRecurringBoundJadeWentHere, early.calendarDaysIfAllRecurringBoundJadeWentHere);
});

test('V160 Linh Căn audit exposes both Linh Tủy growth and realm-tier Bản Nguyên gates', () => {
  const rows = audit.spiritualRoot;
  assert.deepEqual(rows.map(x => x.level), [1,100,1000,10000]);
  assert.equal(rows[0].cultivationBonusPctBase, 0);
  assert(rows[2].cultivationBonusPctBase > 44 && rows[2].cultivationBonusPctBase < 48);
  assert(rows[3].cultivationBonusPctBase > rows[2].cultivationBonusPctBase);
  assert(rows[3].ascensionsNeeded > rows[2].ascensionsNeeded);
  assert(rows.slice(1).every(x => x.virtualOriginPityKills === 500));
  assert(rows[2].latestRequiredOriginTier > 0);
});

test('V160 Luân Hồi audit proves RP is a large shared long-run budget, not a free first-life multiplier', () => {
  const r = audit.reincarnation;
  assert.equal(r.totalTreeMaxCostRp, 1533870);
  assert.equal(r.fateBuildTotalUnlockCostRp, 310000);
  assert.equal(r.combinedTreeAndFateCostRp, 1843870);
  assert(r.rewards.length === 4);
  for (let i = 1; i < r.rewards.length; i++) assert(r.rewards[i].repeatRp > r.rewards[i-1].repeatRp);
  for (const row of r.rewards) {
    assert(row.newRecordRp > row.repeatRp);
    assert(row.maxRpGainNodeRepeatRp >= row.repeatRp);
  }
  assert(r.simpleTerminalRepeatLivesForTreeOnly > 1);
});

console.log('\nV160 ACQUISITION ECONOMY SUMMARY');
console.log(JSON.stringify(audit, null, 2));
console.log(`\nV160 ACQUISITION ECONOMY: ${passed}/${passed} PASS`);
