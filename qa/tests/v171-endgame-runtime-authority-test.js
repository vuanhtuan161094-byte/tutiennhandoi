import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { normalizeCanonicalEndgameAfterRestore, immortalManifestationCapacityV171 } from '../../dist/core/endgame-restore-v171.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); };
const realmAt = (registry, order) => [...registry.realms.values()].find(x => x.order === order);

test('V171 B1 restore clamps authored 0..100 Immortal axes instead of trusting forged combat power', () => {
  const state = createPlayableAdventureState();
  state.realm.maxRealmOrder = 114;
  state.immortal.creationSource = 9999;
  state.immortal.genesisAuthority = 777;
  state.immortal.essencePurity = -50;
  normalizeCanonicalEndgameAfterRestore(state, { lifeId: 'life.v171' });
  assert.equal(state.immortal.creationSource, 100);
  assert.equal(state.immortal.genesisAuthority, 100);
  assert.equal(state.immortal.essencePurity, 0);
});

test('V171 B2 Manifestation capacity is derived from realm and forged unowned active systems are removed', () => {
  const state = createPlayableAdventureState();
  state.realm.maxRealmOrder = 62;
  state.immortal.manifestationCapacity = 999;
  state.immortal.activeManifestationIds = ['law', 'dao', 'origin', 'faction', 'law'];
  normalizeCanonicalEndgameAfterRestore(state, { lifeId: 'life.v171' });
  assert.equal(state.immortal.manifestationCapacity, 3);
  assert.deepEqual(state.immortal.activeManifestationIds, ['law']);
  assert.equal(immortalManifestationCapacityV171(114), 15);
});

test('V171 B3 Dao Suy total-pass authority cannot be lower than the per-major success history', () => {
  const state = createPlayableAdventureState();
  state.realm.maxRealmOrder = 50;
  state.immortal.daoSuyTribulationsPassed = 1;
  state.immortal.daoSuyTribulationsPassedByMajor = { 46: 2, 50: 3 };
  normalizeCanonicalEndgameAfterRestore(state, { lifeId: 'life.v171' });
  assert.equal(state.immortal.daoSuyTribulationsPassed, 5);
  assert.deepEqual(state.immortal.daoSuyTribulationsPassedByMajor, { 46: 2, 50: 3 });
});

test('V171 B4 full SimulationSession.restore applies endgame canonicalization before runtime resumes', () => {
  const registry = buildRegistry();
  const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 17101, createPlayableAdventureState());
  const save = session.snapshot();
  const realm = realmAt(registry, 62);
  assert(realm);
  save.state.realm = { realmId: realm.id, maxRealmOrder: 62 };
  save.state.immortal.awakened = false;
  save.state.immortal.mysticLawWeave = 900;
  save.state.immortal.manifestationCapacity = 999;
  save.state.immortal.activeManifestationIds = ['law', 'origin', 'faction'];
  save.state.immortal.daoSuyTribulationsPassed = 0;
  save.state.immortal.daoSuyTribulationsPassedByMajor = { 46: 2 };
  const restored = SimulationSession.restore(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, save);
  assert.equal(restored.stateValue.immortal.awakened, true);
  assert.equal(restored.stateValue.immortal.mysticLawWeave, 100);
  assert.equal(restored.stateValue.immortal.manifestationCapacity, 3);
  assert.deepEqual(restored.stateValue.immortal.activeManifestationIds, ['law']);
  assert.equal(restored.stateValue.immortal.daoSuyTribulationsPassed, 2);
});

test('V171 B5 valid endgame save values are preserved exactly', () => {
  const state = createPlayableAdventureState();
  state.realm.maxRealmOrder = 62;
  state.immortal.awakened = true;
  state.immortal.mysticLawWeave = 42.5;
  state.immortal.mysticLawStability = 37;
  state.immortal.manifestationCapacity = 3;
  state.immortal.activeManifestationIds = ['law'];
  state.immortal.daoSuyTribulationsPassed = 2;
  state.immortal.daoSuyTribulationsPassedByMajor = { 46: 2 };
  normalizeCanonicalEndgameAfterRestore(state, { lifeId: 'life.v171' });
  assert.equal(state.immortal.mysticLawWeave, 42.5);
  assert.equal(state.immortal.mysticLawStability, 37);
  assert.equal(state.immortal.manifestationCapacity, 3);
  assert.deepEqual(state.immortal.activeManifestationIds, ['law']);
  assert.equal(state.immortal.daoSuyTribulationsPassed, 2);
});

test('V171 B6 mortal saves cannot retain Immortal awakening or active manifestations', () => {
  const state = createPlayableAdventureState();
  state.realm.maxRealmOrder = 38;
  state.immortal.awakened = true;
  state.immortal.manifestationCapacity = 99;
  state.immortal.activeManifestationIds = ['law', 'dao'];
  normalizeCanonicalEndgameAfterRestore(state, { lifeId: 'life.v171' });
  assert.equal(state.immortal.awakened, false);
  assert.equal(state.immortal.manifestationCapacity, 0);
  assert.deepEqual(state.immortal.activeManifestationIds, []);
});

console.log(`\nV171 ENDGAME RUNTIME AUTHORITY: ${passed}/${passed} PASS`);
