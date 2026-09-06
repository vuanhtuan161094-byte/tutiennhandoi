import assert from 'node:assert/strict';
import {
  reincarnationTreeNodesV136,
  REINCARNATION_TREE_MAX_TOTAL_COST_V127,
} from '../../dist/core/reincarnation-progression-v1102.js';

const cultivation = reincarnationTreeNodesV136.filter(node => node.treeId === 'cultivation');
const manual = reincarnationTreeNodesV136.filter(node => node.treeId === 'manual');

// Independent cost oracle for R3 closure. Do not use nodeSpentPoints()/totalTreeMaxCostV127()
// here: this test deliberately derives the invariant from the locked cost specification.
const COST_CLASS_MULTIPLIER = Object.freeze({
  normal: 1,
  high: 1.25,
  rare: 1.5,
  core: 2,
  special: 2,
});

const cultivationRankBaseCost = rank => {
  assert(rank >= 1 && rank <= 20);
  return rank <= 5 ? 100 : rank <= 10 ? 300 : rank <= 15 ? 900 : 2500;
};

const manualRankBaseCost = rank => {
  assert(rank >= 1 && rank <= 50);
  return rank <= 10 ? 50 : rank <= 20 ? 150 : rank <= 30 ? 400 : rank <= 40 ? 1000 : 2500;
};

const deriveNodeCost = node => {
  const multiplier = COST_CLASS_MULTIPLIER[node.costClass];
  assert.notEqual(multiplier, undefined, `Unknown cost class: ${node.id} -> ${node.costClass}`);
  const baseCost = node.treeId === 'cultivation' ? cultivationRankBaseCost : manualRankBaseCost;
  let total = 0;
  for (let rank = 1; rank <= node.maxRank; rank += 1) {
    total += Math.round(baseCost(rank) * multiplier);
  }
  // Locked legacy canonical surcharge on Đại Viên Mãn Chân Giải rank 50.
  if (node.id === 'manual.grand_completion') total += 120;
  return total;
};

const countClasses = nodes => nodes.reduce((acc, node) => {
  acc[node.costClass] = (acc[node.costClass] ?? 0) + 1;
  return acc;
}, {});

assert.equal(cultivation.length, 12, 'R3 must contain exactly 12 Tu Luyện nodes');
assert.equal(manual.length, 13, 'Legacy Công Pháp tree must contain exactly 13 nodes');
assert(cultivation.every(node => node.maxRank === 20), 'Every R3 Tu Luyện node must have 20 ranks');
assert(manual.every(node => node.maxRank === 50), 'Every Công Pháp legacy node must have 50 ranks');
assert(cultivation.every(node => (node.prerequisites ?? []).length === 0), 'R3 Tu Luyện nodes must be independent');

assert.deepEqual(countClasses(cultivation), { rare: 3, high: 8, normal: 1 });
assert.deepEqual(countClasses(manual), { normal: 5, high: 3, rare: 3, core: 2 });

const cultivationByClass = Object.fromEntries(
  Object.keys(countClasses(cultivation)).map(costClass => [
    costClass,
    cultivation.filter(node => node.costClass === costClass).reduce((sum, node) => sum + deriveNodeCost(node), 0),
  ]),
);
const manualByClass = Object.fromEntries(
  Object.keys(countClasses(manual)).map(costClass => [
    costClass,
    manual.filter(node => node.costClass === costClass).reduce((sum, node) => sum + deriveNodeCost(node), 0),
  ]),
);

assert.deepEqual(cultivationByClass, {
  rare: 85_500,
  high: 190_000,
  normal: 19_000,
});
assert.deepEqual(manualByClass, {
  normal: 205_000,
  high: 153_750,
  rare: 184_500,
  core: 164_120,
});

const cultivationTotal = cultivation.reduce((sum, node) => sum + deriveNodeCost(node), 0);
const manualTotal = manual.reduce((sum, node) => sum + deriveNodeCost(node), 0);
const grandTotal = cultivationTotal + manualTotal;

assert.equal(cultivationTotal, 294_500);
assert.equal(manualTotal, 707_370);
assert.equal(grandTotal, 1_001_870);
assert.equal(REINCARNATION_TREE_MAX_TOTAL_COST_V127, grandTotal);
assert.equal(reincarnationTreeNodesV136.filter(node => node.treeId === 'cultivation').length, 12, 'No 13th Tu Luyện node may be counted');

console.log('REINCARNATION CULTIVATION R3 COST INVARIANT — PASS', {
  cultivationTotal,
  manualTotal,
  grandTotal,
  cultivationByClass,
  manualByClass,
});
