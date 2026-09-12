import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { highestClearedDungeonFloor } from '../../dist/core/dungeon.js';
import { ensureEconomyActivityV89 } from '../../dist/core/economy-activity-v89.js';
import { normalizeCanonicalOneShotSettlementAfterRestore } from '../../dist/core/session-restore.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); };
const eventId = 'event.early.riverside_tracks';
const choiceId = 'track';
const dungeon = Object.values(thanhHaWorld.dungeons).find(definition => (definition.floors?.length ?? 0) > 0);
assert.ok(thanhHaWorld.contentEvents[eventId]);
assert.ok(dungeon);
const floor = dungeon.floors[0].floor;

test('V174 B1 Content Event choice mirror reconstructs one-shot completion authority', () => {
  const state = createPlayableAdventureState();
  state.flow.contentEvents.completedEventIds = [];
  state.flow.contentEvents.choicesByEventId = { [eventId]: choiceId };
  normalizeCanonicalOneShotSettlementAfterRestore(state, thanhHaWorld);
  assert.deepEqual(state.flow.contentEvents.completedEventIds, [eventId]);
  assert.equal(state.flow.contentEvents.choicesByEventId[eventId], choiceId);
});

test('V174 B2 invalid Content Event mirrors cannot forge completion authority', () => {
  const state = createPlayableAdventureState();
  state.flow.contentEvents.completedEventIds = [eventId, eventId, 'event.v174.missing'];
  state.flow.contentEvents.choicesByEventId = {
    [eventId]: 'choice.v174.invalid',
    'event.v174.missing': 'forged',
  };
  normalizeCanonicalOneShotSettlementAfterRestore(state, thanhHaWorld);
  assert.deepEqual(state.flow.contentEvents.completedEventIds, [eventId]);
  assert.deepEqual(state.flow.contentEvents.choicesByEventId, {});
});

test('V174 B3 Dungeon first-clear ledger reconstructs missing highest-clear mirror', () => {
  const state = createPlayableAdventureState();
  state.dungeons.highestClearedFloor[dungeon.id] = 0;
  const economy = ensureEconomyActivityV89(state.collectionV12316, 0);
  economy.progressionAwardedIds.push(`first-clear.${dungeon.id}.${floor}`);
  normalizeCanonicalOneShotSettlementAfterRestore(state, thanhHaWorld);
  assert.equal(highestClearedDungeonFloor(state.dungeons, dungeon.id), floor);
});

test('V174 B4 Hunt or invalid Dungeon ledger keys cannot create Dungeon clear authority', () => {
  const state = createPlayableAdventureState();
  state.dungeons.highestClearedFloor[dungeon.id] = 0;
  const economy = ensureEconomyActivityV89(state.collectionV12316, 0);
  economy.progressionAwardedIds.push('first-clear.hunt.999');
  economy.progressionAwardedIds.push(`first-clear.${dungeon.id}.999999`);
  normalizeCanonicalOneShotSettlementAfterRestore(state, thanhHaWorld);
  assert.equal(highestClearedDungeonFloor(state.dungeons, dungeon.id), 0);
});

test('V174 B5 restore reconciliation never lowers legitimate Dungeon progress', () => {
  const state = createPlayableAdventureState();
  const highestAuthoredFloor = Math.max(...dungeon.floors.map(candidate => candidate.floor));
  state.dungeons.highestClearedFloor[dungeon.id] = highestAuthoredFloor;
  const economy = ensureEconomyActivityV89(state.collectionV12316, 0);
  economy.progressionAwardedIds.push(`first-clear.${dungeon.id}.${floor}`);
  normalizeCanonicalOneShotSettlementAfterRestore(state, thanhHaWorld);
  assert.equal(highestClearedDungeonFloor(state.dungeons, dungeon.id), highestAuthoredFloor);
});

test('V174 B6 full SimulationSession.restore blocks Content Event and Dungeon first-clear replay before consumers', () => {
  const registry = buildRegistry();
  const state = createPlayableAdventureState();
  const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 17401, state);
  const save = session.snapshot();
  save.state.realm.maxRealmOrder = Math.max(1, save.state.realm.maxRealmOrder ?? 0);
  save.state.locationId = 'location.thanh_ha_town';
  save.state.flow.contentEvents.completedEventIds = [];
  save.state.flow.contentEvents.choicesByEventId[eventId] = choiceId;
  save.state.dungeons.highestClearedFloor[dungeon.id] = 0;
  const economy = ensureEconomyActivityV89(save.state.collectionV12316, 0);
  economy.progressionAwardedIds.push(`first-clear.${dungeon.id}.${floor}`);

  const restored = SimulationSession.restore(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, save);
  const restoredState = restored.snapshot().state;
  assert.ok(restoredState.flow.contentEvents.completedEventIds.includes(eventId));
  assert.equal(highestClearedDungeonFloor(restoredState.dungeons, dungeon.id), floor);
  assert.ok(!restored.availableContentEvents().some(event => event.id === eventId));
  assert.throws(() => restored.resolveContentEvent(eventId, choiceId));
});

console.log(`\nV174 ONE-SHOT SETTLEMENT RUNTIME AUTHORITY: ${passed}/${passed} PASS`);
