import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { createGameApplicationApi } from '../../dist/core/game-api.js';
import { spiritBeastCombatTriggersV147, spiritBeastBondSummaryV147 } from '../../dist/core/spirit-beast-v147.js';
import { confidantCombatTriggersV148, confidantViewV148 } from '../../dist/core/confidant-v87.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };

const registry = buildRegistry();
const state = createPlayableAdventureState();
state.realm.maxRealmOrder = 22;
const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 16401, state);
const game = new GameplayFacade(session, registry, thanhHaWorld);
const api = createGameApplicationApi(game);
const collection = session.stateValue.collectionV12316;

collection.items['pet.1'] = { owned:true, level:100, advance:5, stars:20, specificFragments:0, spiritBeastV147Migrated:true };
collection.items['pet.2'] = { owned:true, level:100, advance:5, stars:20, specificFragments:0, spiritBeastV147Migrated:true };
collection.items['companion.1'] = { owned:true, level:100, advance:5, stars:20, specificFragments:0, confidantHeartV148:{assist:0,guard:0,harmony:0,raw:0} };
collection.items['companion.2'] = { owned:true, level:100, advance:5, stars:20, specificFragments:0, confidantHeartV148:{assist:0,guard:0,harmony:0,raw:0} };
collection.confidantV148Migrated = true;
collection.spiritBeastV147Migrated = true;

test('V164 B1 pet and confidant selectors live only in collectionV12316', () => {
  api.equipCollectionV12326('pet.1');
  api.equipCollectionV12326('companion.1');
  assert.equal(collection.activePetId, 'pet.1');
  assert.equal(collection.activeCompanionId, 'companion.1');
  api.equipCollectionV12325('pet.2');
  api.equipCollectionV12316('companion.2');
  assert.equal(collection.activePetId, 'pet.2');
  assert.equal(collection.activeCompanionId, 'companion.2');
});

test('V164 B1 V86 pet layer is compatibility-only and delegates combat to V147', () => {
  const source = readFileSync(new URL('../../dist/core/spirit-beast-v86.js', import.meta.url), 'utf8');
  assert(source.includes("from './spirit-beast-v147.js'"));
  assert(source.includes('export const migrateSpiritBeastsV86 = migrateSpiritBeastsV147'));
  assert(source.includes('return spiritBeastCombatTriggersV147(compatStateV86(state))'));
  const direct = spiritBeastCombatTriggersV147(collection);
  assert(direct.length > 0);
  assert(direct.every(x => x.id.includes('pet.2')));
});

test('V164 B1 all owned pets contribute raw bond while only active pet contributes percent bond', () => {
  const withActive = spiritBeastBondSummaryV147(collection);
  const withoutActive = spiritBeastBondSummaryV147({ ...collection, activePetId: undefined });
  assert.equal(withActive.owned >= 2, true);
  assert.equal(withActive.attackFlat, withoutActive.attackFlat);
  assert.equal(withActive.hpFlat, withoutActive.hpFlat);
  assert.equal(withActive.defenseFlat, withoutActive.defenseFlat);
  assert(withActive.powerPct > withoutActive.powerPct);
});

test('V164 B1 confidant V148 read/combat authority follows one activeCompanionId', () => {
  const view = confidantViewV148(collection, 'companion.2');
  assert.equal(view.schema, 'confidant.v148');
  const triggers = confidantCombatTriggersV148(collection);
  assert(triggers.length > 0);
  assert(triggers.every(x => (x.runtimeV148?.confidantId ?? x.runtimeV87?.confidantId) === 'companion.2'));
});

test('V164 B1 confidant Heart mutation stays inside canonical Collection state', () => {
  collection.activeCompanionId = 'companion.1';
  const before = structuredClone(collection.items['companion.1'].confidantHeartV148);
  api.spendConfidantHeartV148('companion.1', 'assist');
  const after = collection.items['companion.1'].confidantHeartV148;
  assert.equal(after.assist, before.assist + 1);
});

test('V164 B1 retired pet gear cannot create a second progression path', () => {
  const actionBefore = session.actionIndex;
  const gearBefore = structuredClone(collection.workshopV12328?.petGear ?? {});
  assert.throws(() => api.upgradePetGearV12328('pet.1', 'claw'), /Trang Bị Linh Thú đã được hoàn nguyên/);
  assert.equal(session.actionIndex, actionBefore);
  assert.deepEqual(collection.workshopV12328?.petGear ?? {}, gearBefore);
  const workshop = readFileSync(new URL('../../dist/core/workshop-production-v12328.js', import.meta.url), 'utf8');
  assert(workshop.includes('petGearRetiredV86: true'));
  assert(workshop.includes('petGearCombatMultiplierV12328(_state, _petId) { return 1; }'));
});

test('V164 B1 snapshot/restore preserves canonical pet/confidant selectors and progression', () => {
  collection.activePetId = 'pet.2';
  collection.activeCompanionId = 'companion.1';
  const save = session.snapshot();
  const restored = SimulationSession.restore(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, save);
  assert.equal(restored.stateValue.collectionV12316.activePetId, 'pet.2');
  assert.equal(restored.stateValue.collectionV12316.activeCompanionId, 'companion.1');
  assert.equal(restored.stateValue.collectionV12316.items['pet.1'].stars, 20);
  assert.equal(restored.stateValue.collectionV12316.items['companion.1'].confidantHeartV148.assist, 1);
});

console.log(`\nV164 PET / CONFIDANT RUNTIME AUTHORITY B1: ${passed}/${passed} PASS`);
