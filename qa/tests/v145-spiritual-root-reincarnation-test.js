import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { createPlayableAdventureState } from '../../dist/content/adventure.js';
import { buildReincarnatedState, createMetaProgressState, rollBirth } from '../../dist/core/life.js';
import { cloneSpiritualRootStateV145 } from '../../dist/core/spiritual-root-v145.js';

const registry = buildRegistry();
const previous = createPlayableAdventureState();
previous.character.spiritualRootV145 = {
  ...cloneSpiritualRootStateV145(previous.character.spiritualRootV145),
  level: 347,
  nourishment: 812.5,
  ascensions: 4,
  meridianPointsSpent: { gathering: 1, battle: 1, body: 1, spirit: 1 },
  insightRanks: { attack: 2, cultivation: 1 },
  insightChoices: ['attack', 'cultivation'],
  huntOriginProgress: 321,
  migratedFromLegacy: true,
  legacyRefunded: true,
};

const expected = cloneSpiritualRootStateV145(previous.character.spiritualRootV145);
const birth = rollBirth(145170, 0, {}, 0, 0);
const next = buildReincarnatedState(previous, thanhHaWorld, registry, createMetaProgressState(), birth, 6, {});

assert.deepEqual(
  next.character.spiritualRootV145,
  expected,
  'Linh Căn V145 permanent progression must survive reincarnation unchanged',
);
assert.notStrictEqual(next.character.spiritualRootV145, previous.character.spiritualRootV145);
assert.notStrictEqual(next.character.spiritualRootV145.meridianPointsSpent, previous.character.spiritualRootV145.meridianPointsSpent);
assert.notStrictEqual(next.character.spiritualRootV145.insightRanks, previous.character.spiritualRootV145.insightRanks);

next.character.spiritualRootV145.meridianPointsSpent.gathering += 1;
next.character.spiritualRootV145.insightRanks.attack += 1;
assert.equal(previous.character.spiritualRootV145.meridianPointsSpent.gathering, 1, 'reborn state must not alias previous-life meridian state');
assert.equal(previous.character.spiritualRootV145.insightRanks.attack, 2, 'reborn state must not alias previous-life insight state');

console.log('V145 Spiritual Root reincarnation carry PASS');
