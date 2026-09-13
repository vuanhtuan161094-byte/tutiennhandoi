import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { canonicalSessionActionIndexAfterRestore } from '../../dist/core/session-restore.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); };
const retreatEvent = (index, overrides = {}) => ({
  id: `retreat.v140.life.v177.${index}`,
  type: 'cultivation',
  tags: ['Retreat', 'CultivationV140', 'ReincarnationCultivationR3'],
  data: { hoursUsed: 1, gain: 100, refundedHours: 0, insights: [], ...overrides.data },
  ...overrides,
});

test('V177 B1 validated retreat history raises a stale actionIndex to the minimum safe next serial', () => {
  assert.equal(canonicalSessionActionIndexAfterRestore(3, [retreatEvent(7)]), 8);
});

test('V177 B2 a legitimate higher saved actionIndex is never lowered', () => {
  assert.equal(canonicalSessionActionIndexAfterRestore(19, [retreatEvent(7)]), 19);
});

test('V177 B3 malformed or unrelated history cannot forge action-index authority', () => {
  const bad = [
    { ...retreatEvent(50), id: 'retreat.v140.life.v177.not-a-number' },
    { ...retreatEvent(51), type: 'system' },
    { ...retreatEvent(52), tags: ['Retreat'] },
    { ...retreatEvent(53), data: { hoursUsed: -1, gain: 100 } },
    { ...retreatEvent(54), id: 'alchemy.garden.harvest.54' },
  ];
  assert.equal(canonicalSessionActionIndexAfterRestore(4, bad), 4);
});

test('V177 B4 invalid raw actionIndex is normalized conservatively without inventing progress', () => {
  assert.equal(canonicalSessionActionIndexAfterRestore(-10, []), 0);
  assert.equal(canonicalSessionActionIndexAfterRestore(Number.NaN, []), 0);
  assert.equal(canonicalSessionActionIndexAfterRestore(3.5, []), 0);
});

function makeRetreatSession(seed = 177001) {
  const registry = buildRegistry();
  const state = createPlayableAdventureState();
  const realm = [...registry.realms.values()].find(x => x.order === 18);
  assert.ok(realm);
  state.realm.realmId = realm.id;
  state.realm.maxRealmOrder = 18;
  state.cultivation.tuVi = 0;
  state.cultivation.retreatBankHours = 9;
  state.cultivation.retreatBankDayKey = '';
  state.injury = 0;
  return { registry, session: new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, seed, state) };
}

test('V177 B5 full restore repairs stale actionIndex before the real retreat consumer and preserves RNG continuity', () => {
  const { registry, session } = makeRetreatSession();
  const now = Date.UTC(2026, 8, 13);
  const first = session.instantRetreatV140(1, now);
  const settled = session.snapshot();
  const firstSerial = Number(first.event.id.split('.').at(-1));
  assert.equal(settled.actionIndex, firstSerial + 1);
  assert.ok(settled.history.some(event => event.id === first.event.id));

  const stale = structuredClone(settled);
  stale.actionIndex = firstSerial;
  const repaired = SimulationSession.restore(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, stale);
  const control = SimulationSession.restore(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, settled);
  assert.equal(repaired.actionIndex, settled.actionIndex);

  const repairedNext = repaired.instantRetreatV140(1, now);
  const controlNext = control.instantRetreatV140(1, now);
  assert.equal(repairedNext.event.id, controlNext.event.id);
  assert.equal(repairedNext.gained, controlNext.gained);
  assert.deepEqual(repairedNext.insights, controlNext.insights);
  assert.equal(repairedNext.refundedHours, controlNext.refundedHours);
  assert.notEqual(repairedNext.event.id, first.event.id);
  const ids = repaired.snapshot().history.map(event => event.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('V177 B6 full restore preserves a legitimate higher actionIndex that has no matching history event', () => {
  const { registry, session } = makeRetreatSession(177002);
  session.instantRetreatV140(1, Date.UTC(2026, 8, 13));
  const save = session.snapshot();
  save.actionIndex += 9;
  const restored = SimulationSession.restore(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, save);
  assert.equal(restored.actionIndex, save.actionIndex);
});

console.log(`\nV177 SESSION ACTION IDENTITY RUNTIME AUTHORITY: ${passed}/${passed} PASS`);
