import assert from 'node:assert/strict';
import * as a from '../../dist/core/alchemy-v146.js';

assert.equal(a.ALCHEMY_V146_SCHEMA, 'alchemy.v146');
assert.equal(a.ALCHEMY_V146_MAJOR_REALM_COUNT, 28);
assert.deepEqual(a.ALCHEMY_V146_INGREDIENT_FAMILIES, ['herb', 'demonCore']);
assert.equal(a.ALCHEMY_V146_PERMANENT_PILL_CAP_PER_FAMILY_MAJOR_LIFE, 3);
assert.equal(a.ALCHEMY_V146_CULTIVATION_PILL_CAP_PER_MAJOR_REALM, 10);
assert.equal(a.ALCHEMY_V146_DAO_SUY_MIN_MAJOR_REALM_INDEX, 11);

// User-locked V146: no fake stat lanes, sockets or medicine resistance.
assert.deepEqual(a.ALCHEMY_V146_PERMANENT_FAMILY_IDS, ['lifePower', 'lifeBody', 'lifeDefense']);
assert.deepEqual(a.ALCHEMY_V146_RETIRED_FAMILY_IDS, ['daoPower', 'daoBody', 'daoDefense']);
assert.equal(a.ALCHEMY_V146_FAMILIES.lifePower.name, 'Công Lực Đan');
assert.equal(a.ALCHEMY_V146_FAMILIES.lifeBody.name, 'Khí Huyết Đan');
assert.equal(a.ALCHEMY_V146_FAMILIES.lifeDefense.name, 'Hộ Thể Đan');
for (const def of Object.values(a.ALCHEMY_V146_FAMILIES)) {
  assert.ok(!/Ngưng Thần|Luyện Thể/.test(def.name), `V146 revived rejected filler pill: ${def.name}`);
}

// Phàm Nhân has herb-only Tu Vi Đan; Hunt starts at Luyện Khí, therefore no fake mortal Yêu Đan.
assert.equal(a.alchemyHerbResourceIdV146(0), 'resource.alchemy.v146.herb.realm.0');
assert.throws(() => a.alchemyDemonCoreResourceIdV146(0));
assert.equal(a.alchemyDemonCoreResourceIdV146(1), 'resource.alchemy.v146.demon_core.realm.1');
assert.equal(a.alchemyDemonCoreResourceIdV146(28), 'resource.alchemy.v146.demon_core.realm.28');
assert.throws(() => a.alchemyDemonCoreResourceIdV146(29));
assert.equal(a.alchemyIngredientNameV146(a.alchemyDemonCoreResourceIdV146(4)), 'Yêu Đan · Kim Đan');

// Recipe catalogue contains only live consumers and exactly the two canonical ingredient families.
const recipes = a.alchemyRecipeCatalogueV146();
assert.equal(recipes.length, 299); // 1 mortal + 10 families*10 pre-Immortal majors + 11 families*18 majors.
assert.deepEqual(recipes.filter(x => x.majorRealmIndex === 0).map(x => x.family), ['cultivation']);
assert.equal(recipes.some(x => x.family === 'daoSuy' && x.majorRealmIndex < 11), false);
assert.equal(recipes.some(x => x.family === 'daoSuy' && x.majorRealmIndex === 11), true);
for (const recipe of recipes) {
  assert.ok(recipe.ingredients.length >= 1);
  for (const ingredient of recipe.ingredients)
    assert.ok(a.ALCHEMY_V146_INGREDIENT_FAMILIES.includes(ingredient.family), `orphan/legacy ingredient family: ${ingredient.family}`);
  assert.equal(a.ALCHEMY_V146_RETIRED_FAMILY_IDS.includes(recipe.family), false);
}

// Permanent pills write raw Công / HP / Phòng, never percentages.
assert.equal(a.alchemyPermanentFamilyStatV146('lifePower'), 'attack');
assert.equal(a.alchemyPermanentFamilyStatV146('lifeBody'), 'maxHp');
assert.equal(a.alchemyPermanentFamilyStatV146('lifeDefense'), 'defense');
assert.equal(a.alchemyPermanentFamilyStatV146('cultivation'), undefined);
for (const family of a.ALCHEMY_V146_PERMANENT_FAMILY_IDS) {
  for (const quality of ['low', 'mid', 'high', 'supreme']) {
    const early = a.alchemyPermanentRawGainV146(family, 1, quality);
    const mid = a.alchemyPermanentRawGainV146(family, 10, quality);
    const late = a.alchemyPermanentRawGainV146(family, 28, quality);
    assert.ok(Number.isInteger(early) && early > 0);
    assert.ok(mid > early);
    assert.ok(late > mid);
  }
  assert.ok(a.alchemyPermanentRawGainV146(family, 8, 'supreme') > a.alchemyPermanentRawGainV146(family, 8, 'low'));
}

// Tu Vi pills are realm-sensitive: ten Cực phẩm support early progression more than late progression.
assert.equal(a.alchemyCultivationPillTotalSupremePctV146(1), 12);
assert.equal(a.alchemyCultivationPillTotalSupremePctV146(3), 12);
assert.equal(a.alchemyCultivationPillTotalSupremePctV146(4), 11);
assert.equal(a.alchemyCultivationPillTotalSupremePctV146(10), 9);
assert.equal(a.alchemyCultivationPillTotalSupremePctV146(19), 6);
assert.equal(a.alchemyCultivationPillTotalSupremePctV146(25), 4);
assert.equal(a.alchemyCultivationPillTotalSupremePctV146(28), 3);
for (const major of [1,4,10,19,25,28]) {
  const per = a.alchemyCultivationPillPctV146(major, 'supreme');
  assert.ok(Math.abs(per * a.ALCHEMY_V146_CULTIVATION_PILL_CAP_PER_MAJOR_REALM - a.alchemyCultivationPillTotalSupremePctV146(major)) < 1e-9);
}
assert.ok(a.alchemyCultivationPillPctV146(1, 'supreme') > a.alchemyCultivationPillPctV146(28, 'supreme'));

// Săn Ảo is deterministic/O(1), and pushing to Vực VIII materially improves Yêu Đan income.
assert.deepEqual(a.settleAlchemyVirtualDemonCoresV146({ kills: 1000, zone: 1, progress: 0 }), { amount: 25, progress: 0, killsPerDrop: 40, zone: 1 });
assert.deepEqual(a.settleAlchemyVirtualDemonCoresV146({ kills: 1000, zone: 8, progress: 0 }), { amount: 50, progress: 0, killsPerDrop: 20, zone: 8 });
const carry = a.settleAlchemyVirtualDemonCoresV146({ kills: 19, zone: 8, progress: 19 });
assert.deepEqual(carry, { amount: 1, progress: 18, killsPerDrop: 20, zone: 8 });

// 800 real Boss First Clears in one major realm guarantee exactly 240 same-realm Yêu Đan.
assert.equal(a.alchemyBossFirstClearDemonCoresCumulativeV146(0), 0);
assert.equal(a.alchemyBossFirstClearDemonCoresCumulativeV146(100), 30);
assert.equal(a.alchemyBossFirstClearDemonCoresCumulativeV146(800), 240);
assert.equal(a.alchemyBossFirstClearDemonCoreDeltaV146(99, 100), 11);

const contract = a.alchemyV146SourceSinkContract();
assert.deepEqual(contract.ingredients.map(x => x.family), ['herb', 'demonCore']);
assert.equal(contract.rules.noSocketDanCot, true);
assert.equal(contract.rules.noMedicineResistance, true);
assert.equal(contract.rules.permanentRawStats, true);
assert.equal(contract.rules.permanentStatsSurviveReincarnation, true);
assert.equal(contract.rules.perLifeQuotaResetsOnReincarnation, true);
assert.equal(contract.rules.huntMajorRealmCoreTiers, 28);

console.log('V146 Alchemy core PASS');
