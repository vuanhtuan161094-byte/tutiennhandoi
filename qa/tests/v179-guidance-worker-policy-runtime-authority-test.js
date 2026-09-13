import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { createPlayableAdventureState, prototypePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { recommendGuidanceWorkerAssignments } from '../../dist/core/guidance.js';

const registry = buildRegistry();
const DUNGEON_ID = 'dungeon.spirit_gathering_cave';
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); };

function fixture(seed = 17901) {
  const state = createPlayableAdventureState();
  const realm = [...registry.realms.values()].find(x => x.order === 22);
  assert.ok(realm, 'missing realm order 22');
  state.realm.realmId = realm.id;
  state.realm.maxRealmOrder = 22;
  state.lifespanYears = realm.lifespanYears;
  state.dungeons.parallelWorkerCapacity = 20;
  state.dungeons.unlockedDungeonIds = [...new Set([...(state.dungeons.unlockedDungeonIds ?? []), DUNGEON_ID])];
  state.dungeons.highestClearedFloor ??= {};
  state.dungeons.highestClearedFloor[DUNGEON_ID] = 1;
  state.inventory['resource.soul_dew'] = 100000;
  state.inventory['resource.soul_essence'] = 100000;
  const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, prototypePlayerProfile, seed, state);
  session.soulSummary();
  session.createSoulClone('cultivation');
  assert.equal(session.stateValue.dungeons.workers.filter(w => w.kind === 'avatar').length, 1, 'fixture must have one live clone worker');
  session.stateValue.guidance.enabled = true;
  session.stateValue.guidance.automationPolicy = {
    ...session.stateValue.guidance.automationPolicy,
    wakeOnContentEvent: false,
    maxInjury: 55,
  };
  return session;
}

function setPolicy(session, patch) {
  session.stateValue.guidance.automationPolicy = {
    ...session.stateValue.guidance.automationPolicy,
    ...patch,
  };
}

test('V179 B1 worker recommendations respect allowedActivityTypes and cannot auto-run dungeon when dungeon is disabled', () => {
  const session = fixture(17901);
  setPolicy(session, { allowedActivityTypes: ['retreat', 'gather', 'hunt', 'explore'], blockedDungeonIds: [] });
  assert.deepEqual(recommendGuidanceWorkerAssignments(session.stateValue, session.stateValue.guidance, thanhHaWorld), []);
});

test('V179 B2 blockedDungeonIds excludes the blocked dungeon from worker assignment authority', () => {
  const session = fixture(17902);
  setPolicy(session, { allowedActivityTypes: ['retreat', 'dungeon'], blockedDungeonIds: [DUNGEON_ID] });
  assert.deepEqual(recommendGuidanceWorkerAssignments(session.stateValue, session.stateValue.guidance, thanhHaWorld), []);
});

test('V179 B3 maxInjury safety stops worker auto-assignment before the main guidance loop', () => {
  const session = fixture(17903);
  session.stateValue.injury = 56;
  setPolicy(session, { allowedActivityTypes: ['dungeon'], blockedDungeonIds: [], maxInjury: 55 });
  assert.deepEqual(recommendGuidanceWorkerAssignments(session.stateValue, session.stateValue.guidance, thanhHaWorld), []);
});

test('V179 B4 valid allowed and unblocked dungeon behavior is preserved', () => {
  const session = fixture(17904);
  setPolicy(session, { allowedActivityTypes: ['dungeon'], blockedDungeonIds: [], maxInjury: 55 });
  const recommendations = recommendGuidanceWorkerAssignments(session.stateValue, session.stateValue.guidance, thanhHaWorld);
  assert.equal(recommendations.length, 1);
  assert.equal(recommendations[0].dungeonId, DUNGEON_ID);
  assert.equal(recommendations[0].floor, 1);
});

test('V179 B5 live runGuidance cannot mutate a dungeon assignment when automation policy disables dungeon', () => {
  const session = fixture(17905);
  setPolicy(session, { allowedActivityTypes: ['retreat', 'gather', 'hunt', 'explore'], blockedDungeonIds: [] });
  const report = session.runGuidance(0, 1);
  assert.deepEqual(report.workerAssignments, []);
  assert.deepEqual(session.stateValue.dungeons.assignments, {});
});

test('V179 B6 live runGuidance still assigns the real clone worker when policy explicitly permits the dungeon', () => {
  const session = fixture(17906);
  setPolicy(session, { allowedActivityTypes: ['dungeon'], blockedDungeonIds: [], maxInjury: 55 });
  const report = session.runGuidance(0, 1);
  assert.equal(report.workerAssignments.length, 1);
  const assignment = Object.values(session.stateValue.dungeons.assignments)[0];
  assert.ok(assignment);
  assert.equal(assignment.dungeonId, DUNGEON_ID);
  assert.equal(assignment.floor, 1);
});

console.log(`\nV179 GUIDANCE WORKER POLICY RUNTIME AUTHORITY: ${passed}/${passed} PASS`);
