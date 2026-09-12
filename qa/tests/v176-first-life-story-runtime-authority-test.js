import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { normalizeCanonicalFirstLifeStoryAfterRestore } from '../../dist/core/session-restore.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); };
const life = { lifeId: 'life.v176.first', lifeNumber: 1 };
const historyEvent = (beatId, serial = 1, data = {}) => ({
  id: `firstlife.${beatId}.${life.lifeId}.${serial}`,
  tags: ['FirstLife', 'GuidedContent'],
  data: { beatId, ...data },
});

test('V176 B1 current-life history reconstructs missing first-life completion authority', () => {
  const state = createPlayableAdventureState();
  state.flow.firstLifeStory.completedBeatIds = [];
  normalizeCanonicalFirstLifeStoryAfterRestore(state, [historyEvent('first.awakening')], life);
  assert.deepEqual(state.flow.firstLifeStory.completedBeatIds, ['first.awakening']);
});

test('V176 B2 malformed, unknown, or wrong-life history cannot forge completion authority', () => {
  const state = createPlayableAdventureState();
  state.flow.firstLifeStory.completedBeatIds = ['first.v176.unknown'];
  const bad = [
    { ...historyEvent('first.awakening'), id: `firstlife.first.awakening.${life.lifeId}.not-a-number` },
    historyEvent('first.v176.unknown', 2),
    { ...historyEvent('first.awakening', 3), id: 'firstlife.first.awakening.life.other.3' },
    { ...historyEvent('first.awakening', 4), tags: ['FirstLife'] },
  ];
  normalizeCanonicalFirstLifeStoryAfterRestore(state, bad, life);
  assert.deepEqual(state.flow.firstLifeStory.completedBeatIds, []);
});

test('V176 B3 choose-path history restores path and its proven first-clear predecessor', () => {
  const state = createPlayableAdventureState();
  state.flow.firstLifeStory.completedBeatIds = [];
  state.flow.firstLifeStory.path = undefined;
  normalizeCanonicalFirstLifeStoryAfterRestore(state, [historyEvent('first.choose_path', 9, { path: 'wanderer' })], life);
  assert.equal(state.flow.firstLifeStory.path, 'wanderer');
  assert.deepEqual(new Set(state.flow.firstLifeStory.completedBeatIds), new Set(['first.first_clear', 'first.choose_path']));
});

test('V176 B4 saved canonical completion remains monotonic and unknown beat IDs are removed', () => {
  const state = createPlayableAdventureState();
  state.flow.firstLifeStory.completedBeatIds = ['first.awakening', 'first.awakening', 'first.choose_path', 'first.v176.unknown'];
  state.flow.firstLifeStory.path = 'sect';
  normalizeCanonicalFirstLifeStoryAfterRestore(state, [], life);
  assert.deepEqual(state.flow.firstLifeStory.completedBeatIds, ['first.awakening', 'first.choose_path', 'first.first_clear']);
  assert.equal(state.flow.firstLifeStory.path, 'sect');
});

test('V176 B5 first-life history is not applied to a later current life', () => {
  const state = createPlayableAdventureState();
  state.flow.firstLifeStory.completedBeatIds = [];
  normalizeCanonicalFirstLifeStoryAfterRestore(state, [historyEvent('first.awakening')], { lifeId: life.lifeId, lifeNumber: 2 });
  assert.deepEqual(state.flow.firstLifeStory.completedBeatIds, []);
});

test('V176 B6 full SimulationSession.restore blocks first-life reward replay before the real consumer', () => {
  const registry = buildRegistry();
  const state = createPlayableAdventureState();
  const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 17601, state);
  assert.equal(session.snapshot().currentLife.lifeNumber, 1);
  session.resolveFirstLifeStory('first.awakening');
  const settled = session.snapshot();
  const herbAfterSettlement = Number(settled.state.inventory['resource.spirit_herb'] ?? 0);
  const historyCount = settled.history.length;
  assert.ok(settled.state.flow.firstLifeStory.completedBeatIds.includes('first.awakening'));
  assert.ok(settled.history.some(event => event?.data?.beatId === 'first.awakening'));

  settled.state.flow.firstLifeStory.completedBeatIds = [];
  const restored = SimulationSession.restore(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, settled);
  const restoredBeforeReplay = restored.snapshot();
  assert.ok(restoredBeforeReplay.state.flow.firstLifeStory.completedBeatIds.includes('first.awakening'));
  assert.equal(Number(restoredBeforeReplay.state.inventory['resource.spirit_herb'] ?? 0), herbAfterSettlement);

  const replay = restored.resolveFirstLifeStory('first.awakening');
  const restoredAfterReplay = restored.snapshot();
  assert.equal(replay.summary, 'Mốc này đã hoàn thành.');
  assert.equal(Number(restoredAfterReplay.state.inventory['resource.spirit_herb'] ?? 0), herbAfterSettlement);
  assert.equal(restoredAfterReplay.history.length, historyCount);
});

console.log(`\nV176 FIRST-LIFE STORY RUNTIME AUTHORITY: ${passed}/${passed} PASS`);
