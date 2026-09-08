import assert from 'node:assert/strict';
import {
  ALCHEMY_V146_MAX_FURNACES,
  ALCHEMY_V146_MASTERY_MAX,
  alchemyAllowedBatchSizesV146,
  alchemyFamilyMasteryKeyV146,
  alchemyFurnaceCountV146,
  alchemyGardenPlotStatusV146,
  alchemyQualityWeightsV146,
  alchemyRequiredRankV146,
  ensureAlchemyProductionV146,
  harvestAlchemyGardenV146,
  migrateAlchemyV112ToV146,
  plantAlchemyGardenV146,
  startAlchemyCraftV146,
  syncAlchemyProductionV146,
} from '../../dist/core/alchemy-production-v146.js';
import {
  alchemyDemonCoreResourceIdV146,
  alchemyHerbResourceIdV146,
  alchemyPillResourceIdV146,
  parseAlchemyPillResourceIdV146,
} from '../../dist/core/alchemy-v146.js';
import { alchemyPillResourceId, ensureAlchemyV112State } from '../../dist/core/alchemy-v112.js';

assert.equal(ALCHEMY_V146_MAX_FURNACES, 4);
assert.deepEqual([1, 3, 6, 9].map(alchemyFurnaceCountV146), [1, 2, 3, 4]);
assert.equal(alchemyRequiredRankV146(0), 1);
assert.equal(alchemyRequiredRankV146(28), 9);
assert.deepEqual(alchemyAllowedBatchSizesV146('cultivation'), [1, 10, 100]);
assert.deepEqual(alchemyAllowedBatchSizesV146('forbidden'), [1, 10]);

// Mastery never turns Cực phẩm into a guaranteed output; one family owns one track across all realms.
{
  const weights = alchemyQualityWeightsV146(ALCHEMY_V146_MASTERY_MAX, 9);
  assert.ok(Math.abs(weights.low - 5) < 1e-9);
  assert.ok(Math.abs(weights.mid - 15) < 1e-9);
  assert.ok(Math.abs(weights.high - 50) < 1e-9);
  assert.ok(Math.abs(weights.supreme - 30) < 1e-9);
  assert.equal(alchemyFamilyMasteryKeyV146('cultivation'), 'v146.family.cultivation');
}

// Dược Viên is a true source: every reached major realm gets one starter seed, then the crop becomes self-sustaining.
{
  const container = {};
  const inventory = {};
  const planted = plantAlchemyGardenV146({ container, inventory, worldYear: 100, worldYearsPerRealHour: 100 / 24, facilityLevel: 1, slot: 0, majorRealmIndex: 0, currentMajorRealmIndex: 0 });
  assert.equal(planted.starterSeedUsed, true);
  assert.equal(inventory[alchemyHerbResourceIdV146(0)] ?? 0, 0);
  const status = alchemyGardenPlotStatusV146(planted, planted.maturesWorldYear);
  assert.equal(status.stage, 'mature');
  assert.equal(status.yield, 4);
  const harvested = harvestAlchemyGardenV146({ container, inventory, worldYear: planted.maturesWorldYear, slot: 0 });
  assert.equal(harvested.yield, 4);
  assert.equal(inventory[alchemyHerbResourceIdV146(0)], 4);
  const replanted = plantAlchemyGardenV146({ container, inventory, worldYear: planted.maturesWorldYear, worldYearsPerRealHour: 100 / 24, facilityLevel: 1, slot: 0, majorRealmIndex: 0, currentMajorRealmIndex: 0 });
  assert.equal(replanted.starterSeedUsed, false);
  assert.equal(inventory[alchemyHerbResourceIdV146(0)], 3);
}

// Crafting consumes only V146 Linh Thảo/Yêu Đan, resolves to V146 pills, and shares family mastery between realms.
{
  const container = {};
  const inventory = {
    [alchemyHerbResourceIdV146(1)]: 100,
    [alchemyDemonCoreResourceIdV146(1)]: 100,
    [alchemyHerbResourceIdV146(2)]: 100,
    [alchemyDemonCoreResourceIdV146(2)]: 100,
  };
  const first = startAlchemyCraftV146({ container, inventory, family: 'lifePower', majorRealmIndex: 1, batchSize: 1, furnaceIndex: 0, seed: 123, worldYear: 0, worldYearsPerRealHour: 100 / 24, currentMajorRealmIndex: 2 });
  assert.deepEqual(first.ingredientsSpent.map(x => x.resourceId), [alchemyHerbResourceIdV146(1), alchemyDemonCoreResourceIdV146(1)]);
  const done1 = syncAlchemyProductionV146({ container, inventory, worldYear: first.completesWorldYear });
  assert.equal(done1.length, 1);
  assert.equal(done1[0].outputCount, 1);
  const quality1 = Object.entries(done1[0].qualities).find(([, count]) => count > 0)?.[0];
  const pill1 = alchemyPillResourceIdV146('lifePower', 1, quality1);
  assert.equal(inventory[pill1], 1);
  assert.ok(parseAlchemyPillResourceIdV146(pill1));
  const state = ensureAlchemyV112State(container);
  const masteryAfterRealm1 = state.recipeProgress['v146.family.lifePower'].mastery;
  assert.ok(masteryAfterRealm1 > 0);

  const second = startAlchemyCraftV146({ container, inventory, family: 'lifePower', majorRealmIndex: 2, batchSize: 1, furnaceIndex: 0, seed: 456, worldYear: first.completesWorldYear, worldYearsPerRealHour: 100 / 24, currentMajorRealmIndex: 2 });
  syncAlchemyProductionV146({ container, inventory, worldYear: second.completesWorldYear });
  assert.ok(state.recipeProgress['v146.family.lifePower'].mastery > masteryAfterRealm1);
}

// V112 retirement is value-preserving: queued ingredients are refunded, research essence is converted,
// and old permanent Dao pills become the live V146 Bồi Dưỡng families instead of remaining orphan items.
{
  const container = {};
  const inventory = { 'resource.alchemy_essence': 21 };
  const legacy = ensureAlchemyV112State(container);
  legacy.queues.push({
    id: 'legacy.job', recipeId: 'legacy', family: 'cultivation', realmTier: 1, batchSize: 1, furnaceIndex: 0,
    ingredientsSpent: [{ resourceId: 'resource.economy.herb.t1.qi', quantity: 5 }],
  });
  const oldDao = alchemyPillResourceId('daoPower', 1, 'high');
  inventory[oldDao] = 2;
  const migration = migrateAlchemyV112ToV146({ container, inventory, currentMajorRealmIndex: 11 });
  assert.equal(legacy.queues.length, 0);
  assert.equal(inventory['resource.economy.herb.t1.qi'], 5);
  assert.equal(Object.prototype.hasOwnProperty.call(inventory, 'resource.alchemy_essence'), false);
  assert.equal(migration.essenceConverted, 21);
  assert.equal(inventory[alchemyHerbResourceIdV146(11)], 3);
  assert.equal(inventory[oldDao] ?? 0, 0);
  assert.equal(inventory[alchemyPillResourceIdV146('lifePower', 1, 'high')], 2);
  assert.equal(migration.legacyPillsConverted, 2);
  assert.equal(ensureAlchemyProductionV146(container).migration.legacyQueuesRetired, true);
}

console.log('V146 Alchemy production closure PASS');
