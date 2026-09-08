import assert from 'node:assert/strict';
import { alchemyDemonCoreResourceIdV146 } from '../../dist/core/alchemy-v146.js';
import {
  createAlchemyHuntProgressV146,
  settleAlchemyHuntRewardsV146,
} from '../../dist/core/alchemy-hunt-v146.js';
import {
  createSpiritualRootStateV145,
  settleSpiritualRootHuntV145,
} from '../../dist/core/spiritual-root-v145.js';
import { applyAlchemyStatBonuses } from '../../dist/core/alchemy-v112.js';

// Pure V146 Hunt settlement is deterministic, persists remainder, and is realm gated.
{
  const inventory = {};
  let progress = createAlchemyHuntProgressV146();
  const first = settleAlchemyHuntRewardsV146(progress, inventory, {
    kills: 19,
    zone: 8,
    majorRealmIndex: 4,
    currentMajorRealmIndex: 4,
    countForOriginMeter: true,
  });
  progress = first.state;
  assert.equal(first.amount, 0);
  assert.equal(first.virtualProgress, 19);

  const second = settleAlchemyHuntRewardsV146(progress, inventory, {
    kills: 1,
    zone: 8,
    majorRealmIndex: 4,
    currentMajorRealmIndex: 4,
    countForOriginMeter: true,
  });
  progress = second.state;
  const coreId = alchemyDemonCoreResourceIdV146(4);
  assert.equal(second.amount, 1);
  assert.equal(second.virtualProgress, 0);
  assert.equal(inventory[coreId], 1);

  const locked = settleAlchemyHuntRewardsV146(progress, inventory, {
    kills: 1000,
    zone: 8,
    majorRealmIndex: 5,
    currentMajorRealmIndex: 4,
    countForOriginMeter: true,
  });
  assert.equal(locked.sourceUnlocked, false);
  assert.equal(locked.amount, 0);
  assert.equal(inventory[alchemyDemonCoreResourceIdV146(5)] ?? 0, 0);
}

// 800 sequential real first clears mint exactly the authored 240 same-major Yêu Đan.
{
  const inventory = {};
  let progress = createAlchemyHuntProgressV146();
  let total = 0;
  for (let floor = 1; floor <= 800; floor++) {
    const settled = settleAlchemyHuntRewardsV146(progress, inventory, {
      kills: 1,
      zone: Math.min(8, Math.ceil(floor / 100)),
      majorRealmIndex: 10,
      currentMajorRealmIndex: 10,
      firstClear: true,
    });
    progress = settled.state;
    total += settled.firstClearAmount;
  }
  assert.equal(total, 240);
  assert.equal(progress.firstClearCountByMajor['10'], 800);
  assert.equal(inventory[alchemyDemonCoreResourceIdV146(10)], 240);
}

// Live integration seam: the same call already used by real/virtual Hunt persists the V146 meter.
{
  const character = { spiritualRootV145: createSpiritualRootStateV145(), buildFoundation: { roots: {} } };
  const inventory = {};
  const a = settleSpiritualRootHuntV145(character, inventory, {
    kills: 19,
    zone: 8,
    majorRealmIndex: 4,
    currentMajorRealmIndex: 4,
    countForOriginMeter: true,
  });
  assert.equal(a.alchemyV146.amount, 0);
  assert.equal(character.spiritualRootV145.alchemyHuntV146.virtualProgressByMajor['4'], 19);

  const b = settleSpiritualRootHuntV145(character, inventory, {
    kills: 1,
    zone: 8,
    majorRealmIndex: 4,
    currentMajorRealmIndex: 4,
    countForOriginMeter: true,
  });
  assert.equal(b.alchemyV146.amount, 1);
  assert.equal(inventory[alchemyDemonCoreResourceIdV146(4)], 1);
  assert.equal(character.spiritualRootV145.alchemyHuntV146.virtualProgressByMajor['4'], 0);
}

// hpRawV146 is provenance/display only. Combat authority remains compatibility body (1 body = 20 Max HP),
// therefore preserving the authored raw HP cannot accidentally double-count it later in the same aggregator.
{
  const entity = {
    stats: {
      attack: 10,
      defense: 5,
      physique: 10,
      maxHp: 200,
      maxSpirit: 50,
      spiritStandard: 50,
    },
  };
  const result = applyAlchemyStatBonuses(
    entity,
    { power: 0, body: 0, defense: 0 },
    { power: 0, body: 5, defense: 0, hpRawV146: 100 },
    undefined,
  );
  assert.equal(result.stats.physique, 15);
  assert.equal(result.stats.maxHp, 300);
}

console.log('V146 Alchemy source/runtime PASS');
