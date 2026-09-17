import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createCollectionProgressStateV12316 } from '../../dist/core/collection-progression-v12316.js';
import {
  ensureEconomyActivityV89,
  recordEconomyActivityV89,
  recordFirstClearBoundJadeV89,
  recordPvpWinBoundJadeV91,
  buyEconomyOfferV89,
} from '../../dist/core/economy-activity-v89.js';
import { gachaCollectionV12326 } from '../../dist/core/collection-workshop-gacha-v12326.js';
import { buildEconomyProductionV111, ECONOMY_PRODUCTION_V111 } from '../../dist/core/economy-production-v111.js';
import { createEconomyState, buyFromMarket, sellToMarket } from '../../dist/core/economy.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };
const monday = Date.UTC(2026, 8, 7, 0, 0, 0);
const sumByPrefix = (record, prefix) => Object.entries(record ?? {}).filter(([k]) => k.startsWith(prefix)).reduce((s, [,v]) => s + Number(v || 0), 0);

function freshCollection() {
  const state = createCollectionProgressStateV12316();
  state.currencies.boundImmortalJade = 0;
  state.currencies.immortalJade = 0;
  return state;
}

test('B6 Boss progression counters cannot settle Bound Jade directly', () => {
  const state = freshCollection();
  const huntBoss = recordEconomyActivityV89(state, 'huntBossWins', 1, monday);
  const boss = recordEconomyActivityV89(state, 'bossWins', 1, monday);
  const ledger = ensureEconomyActivityV89(state, monday).lifetime.earnedBySource;
  assert.deepEqual(huntBoss.awards, []);
  assert.deepEqual(boss.awards, []);
  assert.equal(state.currencies.boundImmortalJade, 0);
  assert.equal(ledger['daily.hunt.boss.1'], undefined);
  assert.equal(ledger['daily.boss.1'], undefined);
});

test('B6 authored daily and weekly Bound Jade sources reconcile to the production caps', () => {
  const state = freshCollection();
  recordEconomyActivityV89(state, 'resourceClears', 12, monday);
  recordEconomyActivityV89(state, 'huntBossWins', 1, monday);
  recordEconomyActivityV89(state, 'huntKills', 150, monday);
  recordEconomyActivityV89(state, 'bossWins', 1, monday);
  recordEconomyActivityV89(state, 'retreatHours', 3, monday);
  recordEconomyActivityV89(state, 'craftActions', 1, monday);
  for (let day = 1; day < 7; day++) recordEconomyActivityV89(state, 'craftActions', 1, monday + day * 86400_000);
  const ledger = ensureEconomyActivityV89(state, monday + 6 * 86400_000).lifetime.earnedBySource;
  assert.equal(sumByPrefix(ledger, 'daily.'), ECONOMY_PRODUCTION_V111.dailyActivityBoundJade);
  assert.equal(sumByPrefix(ledger, 'weekly.'), ECONOMY_PRODUCTION_V111.weeklyRecurringBoundJade);
  assert.equal(ECONOMY_PRODUCTION_V111.dailyActivityBoundJade, 100);
});

test('B6 PvP Bound Jade source pays exactly five wins and then stops paying', () => {
  const state = freshCollection();
  const rewards = Array.from({ length: 7 }, () => recordPvpWinBoundJadeV91(state, monday).boundJade);
  assert.deepEqual(rewards, [8,8,8,8,8,0,0]);
  assert.equal(rewards.reduce((a,b) => a + b, 0), ECONOMY_PRODUCTION_V111.dailyPvpPaidWins * ECONOMY_PRODUCTION_V111.pvpRewardPerWin);
});

test('B6 first-clear Bound Jade is capped at five rewards per week', () => {
  const state = freshCollection();
  const rewards = Array.from({ length: 7 }, (_, i) => recordFirstClearBoundJadeV89(state, `b6.${i}`, monday).boundJade);
  assert.deepEqual(rewards, [15,15,15,15,15,0,0]);
  assert.equal(rewards.reduce((a,b) => a + b, 0), ECONOMY_PRODUCTION_V111.weeklyFirstClearBoundJade);
});

test('B6 Gacha and acceleration shop are real Bound Jade sinks', () => {
  const state = createCollectionProgressStateV12316();
  const inventory = {};
  const beforeGacha = state.currencies.boundImmortalJade;
  const roll = gachaCollectionV12326(state, inventory, 'banner.manual', 1, 16106, false, [], 117);
  assert.equal(roll.cost, ECONOMY_PRODUCTION_V111.gachaSingleCost);
  assert.equal(state.currencies.boundImmortalJade, beforeGacha - roll.cost);
  const beforeShop = state.currencies.boundImmortalJade;
  const bought = buyEconomyOfferV89(state, inventory, 'v89.offer.manual.grow', monday);
  assert.equal(state.currencies.boundImmortalJade, beforeShop - bought.offer.cost);
  const ledger = ensureEconomyActivityV89(state, monday).lifetime;
  assert.equal(ledger.boundJadeSpent, bought.offer.cost);
  assert.equal(ledger.spentBySink['shop.v89.offer.manual.grow'], bought.offer.cost);
});

test('B6 public session wiring records Bound Jade Gacha and DongFu spend in the ledger', () => {
  const source = readFileSync(new URL('../../dist/core/session.js', import.meta.url), 'utf8');
  assert(source.includes("recordBoundJadeSpendV89(state, `gacha.${bannerId}`, result.cost)"));
  assert(source.includes("recordBoundJadeSpendV89(state, `cave.${facilityId}`, result.cost.boundJade)"));
});

test('B6 premium Jade is compatibility/external-only and cannot inflate recurring gameplay pacing', () => {
  const model = buildEconomyProductionV111({
    activity: {
      currencies: { boundImmortalJade: 1600, immortalJade: 777 },
      daily: { earned: 0, maxAuthored: 100 },
      weekly: { maxAuthored: 300 },
      ledger: {},
      shop: { offers: [] },
      rules: {},
    },
    economy: { spiritStones: 0, telemetry: {}, shop: { slots: [], manualRefreshCost: 0 }, ledger: { materials: [] }, rules: {} },
    collection: { cave: { facilities: [] } },
    pvp: { reward: { paidWinsToday: 0, remainingPaidWins: 5 }, season: { rewardPreview: { boundJade: 0 } } },
  });
  assert.equal(model.premiumJade.balance, 777);
  assert.equal(model.premiumJade.sourceModel, 'external-or-dev-only');
  assert.equal(model.premiumJade.recurringInGameSource, 0);
  assert.equal(model.premiumJade.includedInBoundJadeBudget, false);
  assert.equal(model.boundJade.cycle28d.recurringMax, 5120);
  assert.equal(model.health.premiumJadeExcludedFromRecurringBudget, true);
});

test('B6 Linh Thach market preserves a closed buy/sell accounting loop with finite stock', () => {
  const definitions = {
    test: {
      id: 'test', locationId: 'test.location',
      listings: [{ resourceId: 'resource.test', name: 'Test', initialStock: 10, targetStock: 10, basePrice: 100, sellRatio: 0.62 }],
    },
  };
  const state = createEconomyState(definitions, 0);
  const buy = buyFromMarket(state, definitions, 'test', 'resource.test', 2);
  const sell = sellToMarket(state, definitions, 'test', 'resource.test', 1);
  assert.equal(state.markets.test.listings['resource.test'].stock, 9);
  assert.equal(state.lifetime.unitsBought, 2);
  assert.equal(state.lifetime.unitsSold, 1);
  assert.equal(state.lifetime.spiritStonesSpent, buy.totalSpiritStones);
  assert.equal(state.lifetime.spiritStonesEarned, sell.totalSpiritStones);
  assert(buy.totalSpiritStones > sell.totalSpiritStones);
});

test('B6 source/sink read-model keeps farm, ownership and spend boundaries explicit', () => {
  const model = buildEconomyProductionV111({
    activity: { currencies: { boundImmortalJade: 0, immortalJade: 0 }, daily: {}, weekly: {}, ledger: {}, shop: { offers: [] }, rules: {} },
    economy: { spiritStones: 0, telemetry: {}, shop: { slots: Array(9).fill({}), manualRefreshCost: 3000 }, ledger: { materials: [] }, rules: { materialUpgradeRatio: 10 } },
    collection: { cave: { facilities: [] } },
    pvp: { reward: {}, season: { rewardPreview: { boundJade: 0 } } },
  });
  assert.deepEqual(model.boundJade.sinks.map(x => x.id), ['gacha','dongfu','acceleration-shop']);
  assert.equal(model.boundJade.sinks.find(x => x.id === 'gacha').cap, null);
  assert.equal(model.materials.specificFragments, 'gacha-only');
  assert.equal(model.materials.resourceFarmCap, null);
  assert.equal(model.spiritStone.market.naturalRefreshHours, 6);
});

console.log(`\nV161 B6 ECONOMY SOURCE/SINK: ${passed}/${passed} PASS`);
