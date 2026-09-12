import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { createMetaProgressState } from '../../dist/core/life.js';
import { SimulationSession } from '../../dist/core/session.js';
import { normalizeCanonicalReincarnationAfterRestore } from '../../dist/core/session-restore.js';
import {
  FATE_BUILD_DEFINITIONS_V4,
  nodeSpentPoints,
  starterReincarnationTreeNodes,
  totalAllTreeSpentPoints,
} from '../../dist/core/reincarnation-progression-v1102.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); };
const freshMeta = () => createMetaProgressState();

function normalize(rawMutator) {
  const raw = freshMeta();
  rawMutator(raw);
  const cloned = structuredClone(raw);
  normalizeCanonicalReincarnationAfterRestore(cloned, raw);
  return cloned;
}

test('V170 B1 Permanent Potential restore never invents lifetimeEarned from forged allocations', () => {
  const meta = normalize(raw => {
    raw.reincarnationProgress.permanentPotential = {
      lifetimeEarned: 5,
      unspent: 999,
      allocations: { power: 100, body: 100, defense: 100 },
    };
  });
  const p = meta.reincarnationProgress.permanentPotential;
  assert.equal(p.lifetimeEarned, 5);
  assert.equal(p.allocations.power + p.allocations.body + p.allocations.defense + p.unspent, 5);
  assert.deepEqual(p.allocations, { power: 5, body: 0, defense: 0 });
});

test('V170 B1 valid Permanent Potential allocation is preserved exactly', () => {
  const meta = normalize(raw => {
    raw.reincarnationProgress.permanentPotential = {
      lifetimeEarned: 10,
      unspent: 4,
      allocations: { power: 3, body: 2, defense: 1 },
    };
  });
  assert.deepEqual(meta.reincarnationProgress.permanentPotential, {
    lifetimeEarned: 10,
    unspent: 4,
    allocations: { power: 3, body: 2, defense: 1 },
  });
});

test('V170 B1 Tree ranks can never spend more RP than lifetimePointsEarned after shared spend', () => {
  const node = starterReincarnationTreeNodes[0];
  const rankOneCost = nodeSpentPoints(node, 1);
  const meta = normalize(raw => {
    raw.reincarnationProgress.tree.lifetimePointsEarned = rankOneCost;
    raw.reincarnationProgress.tree.sharedSpentPoints = 0;
    raw.reincarnationProgress.tree.ranks[node.id] = node.maxRank;
  });
  const tree = meta.reincarnationProgress.tree;
  assert(totalAllTreeSpentPoints(tree) <= tree.lifetimePointsEarned - tree.sharedSpentPoints);
  assert.equal(tree.ranks[node.id], 1, 'only the paid rank may survive an overspent save');
});

test('V170 B1 valid Tree investment is preserved exactly', () => {
  const node = starterReincarnationTreeNodes[0];
  const paid = nodeSpentPoints(node, 2);
  const meta = normalize(raw => {
    raw.reincarnationProgress.tree.lifetimePointsEarned = paid + 123;
    raw.reincarnationProgress.tree.ranks[node.id] = 2;
  });
  assert.equal(meta.reincarnationProgress.tree.ranks[node.id], 2);
  assert.equal(meta.reincarnationProgress.tree.lifetimePointsEarned, paid + 123);
});

test('V170 B1/B3 Fate unlock requires paid shared RP and its authored prerequisite chain', () => {
  const spirit = FATE_BUILD_DEFINITIONS_V4.find(x => x.id === 'fate.v4.cultivation.spirit_mind');
  assert(spirit);
  const unpaid = normalize(raw => {
    raw.reincarnationProgress.tree.lifetimePointsEarned = spirit.unlockCostRp;
    raw.reincarnationProgress.tree.sharedSpentPoints = 0;
    raw.reincarnationProgress.fateBuild.unlockedIds.push(spirit.id);
    raw.reincarnationProgress.fateBuild.activeFateId = spirit.id;
  });
  assert(!unpaid.reincarnationProgress.fateBuild.unlockedIds.includes(spirit.id));
  assert.equal(unpaid.reincarnationProgress.fateBuild.activeFateId, 'fate.v4.cultivation.diligent');

  const paid = normalize(raw => {
    raw.reincarnationProgress.tree.lifetimePointsEarned = spirit.unlockCostRp;
    raw.reincarnationProgress.tree.sharedSpentPoints = spirit.unlockCostRp;
    raw.reincarnationProgress.fateBuild.unlockedIds.push(spirit.id);
    raw.reincarnationProgress.fateBuild.activeFateId = spirit.id;
  });
  assert(paid.reincarnationProgress.fateBuild.unlockedIds.includes(spirit.id));
  assert.equal(paid.reincarnationProgress.fateBuild.activeFateId, spirit.id);
});

test('V170 B4 duplicate life reward/archive rows collapse to one authority row per lifeId', () => {
  const meta = normalize(raw => {
    raw.reincarnationProgress.rewardHistory = [
      { lifeId: 'life.v170.1', reincarnationPoints: 10 },
      { lifeId: 'life.v170.1', reincarnationPoints: 999999 },
    ];
    raw.archives = [
      { lifeId: 'life.v170.1' },
      { lifeId: 'life.v170.1' },
    ];
  });
  assert.equal(meta.reincarnationProgress.rewardHistory.filter(x => x.lifeId === 'life.v170.1').length, 1);
  assert.equal(meta.archives.filter(x => x.lifeId === 'life.v170.1').length, 1);
  assert.equal(meta.reincarnationProgress.rewardHistory[0].reincarnationPoints, 10);
});

test('V170 B2 live finalization remains idempotent for the same life', () => {
  const registry = buildRegistry();
  const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 17001, createPlayableAdventureState());
  session.stateValue.alive = false;
  const first = session.finalizeReincarnationRewards(true, 1_700_000_000_000);
  const earnedAfterFirst = session.metaValue.reincarnationProgress.tree.lifetimePointsEarned;
  const historyAfterFirst = session.metaValue.reincarnationProgress.rewardHistory.length;
  const archivesAfterFirst = session.metaValue.archives.length;
  const second = session.finalizeReincarnationRewards(true, 1_700_000_000_100);
  assert.deepEqual(second, first);
  assert.equal(session.metaValue.reincarnationProgress.tree.lifetimePointsEarned, earnedAfterFirst);
  assert.equal(session.metaValue.reincarnationProgress.rewardHistory.length, historyAfterFirst);
  assert.equal(session.metaValue.archives.length, archivesAfterFirst);
});

console.log(`\nV170 REINCARNATION / META RUNTIME AUTHORITY: ${passed}/${passed} PASS`);
