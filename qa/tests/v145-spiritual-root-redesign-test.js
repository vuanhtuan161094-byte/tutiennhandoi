import assert from 'node:assert/strict';
import * as root from '../../dist/core/spiritual-root-v145.js';

assert.equal(root.SPIRITUAL_ROOT_SCHEMA_V145, 'spiritual-root.v145');
assert.equal(root.SPIRITUAL_ROOT_ASCENSION_INTERVAL_V145, 100);
assert.equal(Object.keys(root.SPIRITUAL_ROOT_BRANCHES_V145).length, 4);
assert.deepEqual(Object.keys(root.SPIRITUAL_ROOT_BRANCHES_V145), ['gathering', 'battle', 'body', 'spirit']);

// V145 owns no elemental/Ngũ Hành authority. Legacy five-root ids may only appear inside migration input handling.
for (const key of Object.keys(root)) {
  assert.ok(!/FIVE_ELEMENT|ROOT_ELEMENT|ELEMENT_ROOT|METAL|WOOD|WATER|FIRE|EARTH/.test(key), `V145 exported elemental authority: ${key}`);
}

assert.equal(root.spiritualRootGradeV145(1).name, 'Phàm Căn');
assert.equal(root.spiritualRootGradeV145(100).name, 'Phàm Căn');
assert.equal(root.spiritualRootGradeV145(101).name, 'Linh Căn');
assert.equal(root.spiritualRootGradeV145(901).name, 'Cực Căn');
assert.equal(root.spiritualRootGradeV145(1000).name, 'Cực Căn');
assert.equal(root.spiritualRootGradeV145(1001).name, 'Vô Cực Căn · Chuyển 1');
assert.equal(root.spiritualRootGradeV145(1100).name, 'Vô Cực Căn · Chuyển 1');
assert.equal(root.spiritualRootGradeV145(1101).name, 'Vô Cực Căn · Chuyển 2');
assert.equal(root.spiritualRootGradeV145(1_000_000).cycle > 0, true);

for (const levels of [[1, 100], [100, 1000], [1000, 10_000], [10_000, 100_000], [100_000, 1_000_000]]) {
  const [a, b] = levels;
  assert.ok(root.spiritualRootCultivationBonusPctV145(b) > root.spiritualRootCultivationBonusPctV145(a), `Tu Vi curve stopped at ${a}->${b}`);
  assert.ok(root.spiritualRootCoreCombatBonusPctV145(b) > root.spiritualRootCoreCombatBonusPctV145(a), `core combat curve stopped at ${a}->${b}`);
  assert.ok(root.spiritualRootNourishmentCostV145(b) > root.spiritualRootNourishmentCostV145(a), `Linh Tủy cost not monotonic at ${a}->${b}`);
}
assert.equal(root.spiritualRootCultivationBonusPctV145(1), 0);
assert.equal(root.spiritualRootCoreCombatBonusPctV145(1), 0);
assert.ok(root.spiritualRootCultivationBonusPctV145(1000) > 44 && root.spiritualRootCultivationBonusPctV145(1000) < 48);
assert.ok(root.spiritualRootCultivationBonusPctV145(1_000_000) > 220);
assert.ok(root.spiritualRootCoreCombatBonusPctV145(1_000_000) > 80);
assert.ok(root.spiritualRootOriginCostV145(100_000) > root.spiritualRootOriginCostV145(1000));

// Gate: Lv100 cannot cross to 101 before Tiến Cấp, then can immediately continue after paying Bản Nguyên.
const inv = {
  [root.SPIRITUAL_ROOT_TENDON_RESOURCE_V145]: '999999999999999999999999',
  [root.SPIRITUAL_ROOT_ORIGIN_RESOURCE_V145]: '999999999999999999999999',
};
let s = root.createSpiritualRootStateV145();
s.level = 99;
let nourished = root.nourishSpiritualRootV145(s, inv, 2);
assert.equal(nourished.state.level, 100);
assert.equal(nourished.levelsRaised, 1);
assert.equal(nourished.blockedByAscension, true);
assert.equal(root.spiritualRootAvailableMeridianPointsV145(nourished.state), 0);

const ascended = root.ascendSpiritualRootV145(nourished.state, inv);
assert.equal(ascended.state.ascensions, 1);
assert.equal(ascended.meridianPointGranted, 1);
assert.equal(root.spiritualRootAvailableMeridianPointsV145(ascended.state), 1);
assert.equal(ascended.insightOptions.length, 3);
assert.equal(new Set(ascended.insightOptions.map(x => x.id)).size, 3);

nourished = root.nourishSpiritualRootV145(ascended.state, inv, 1);
assert.equal(nourished.state.level, 101);
assert.equal(nourished.blockedByAscension, false);

// Căn Mạch point is real spend authority, not a display-only count.
let built = root.allocateSpiritualRootMeridianPointV145(ascended.state, 'battle');
assert.equal(built.meridianPointsSpent.battle, 1);
assert.equal(root.spiritualRootAvailableMeridianPointsV145(built), 0);
assert.throws(() => root.allocateSpiritualRootMeridianPointV145(built, 'battle'));
assert.ok(root.spiritualRootCombatBonusesV145(built).attackPct > root.spiritualRootCombatBonusesV145(ascended.state).attackPct);

// One Căn Ngộ per ascension; choice must be one of the deterministic 3.
const option = root.spiritualRootInsightOptionsV145(ascended.state)[0];
const enlightened = root.chooseSpiritualRootInsightV145(ascended.state, option.id);
assert.equal(enlightened.insightChoices.length, 1);
assert.equal(enlightened.insightRanks[option.id], 1);
assert.throws(() => root.chooseSpiritualRootInsightV145(enlightened, root.spiritualRootInsightOptionsV145(enlightened)[0].id));

// Utility lanes must stay bounded even with extreme point/rank counts; only safe raw core lanes are infinite.
const extreme = root.createSpiritualRootStateV145();
extreme.level = 1_000_001;
extreme.ascensions = 10_000;
extreme.meridianPointsSpent = { gathering: 2500, battle: 2500, body: 2500, spirit: 2500 };
extreme.insightRanks = { spirit: 100_000, attack: 100_000, vitality: 100_000, defense: 100_000, cultivation: 100_000, balanced: 100_000 };
const m = root.spiritualRootMeridianBonusesV145(extreme);
assert.ok(m.retreatBonusPct <= 18);
assert.ok(m.breakEffectPct <= 14);
assert.ok(m.critDamagePct <= 24);
assert.ok(m.healingReceivedPct <= 18);
assert.ok(m.damageReductionPct <= 8);
assert.ok(m.spiritRegenPct <= 24);
assert.ok(m.spiritEfficiencyPct <= 12);
assert.ok(m.cooldownReductionPct <= 8);
assert.ok(m.tendonDropBonusPct <= 40);
assert.ok(m.maxSpiritPct <= 36);
const insights = root.spiritualRootInsightBonusesV145(extreme);
assert.ok(insights.maxSpiritPct <= 48);
assert.ok(insights.attackPct > 0 && insights.maxHpPct > 0 && insights.defensePct > 0 && insights.cultivationPct > 0);

// Legacy migration is deterministic and compresses five old tracks into one root without carrying element authority forward.
const legacy = { roots: {
  metal: { level: 1000 }, wood: { level: 800 }, water: { level: 600 }, fire: { level: 400 }, earth: { level: 200 },
} };
const migratedA = root.migrateLegacySpiritualRootV145(legacy);
const migratedB = root.migrateLegacySpiritualRootV145(legacy);
assert.deepEqual(migratedA, migratedB);
assert.equal(migratedA.migratedFromLegacy, true);
assert.ok(migratedA.level >= 1);
assert.equal('roots' in migratedA, false);
assert.equal('elementQuality' in migratedA, false);

console.log('V145 infinite Spiritual Root core PASS');
