import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { normalizeCanonicalCurrentLifeIdentityAfterRestore } from '../../dist/core/session-restore.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); };

test('V178 B1 valid lifeNumber is canonical authority for its deterministic lifeId projection', () => {
  const life = { lifeId: 'life.stale', lifeNumber: 3 };
  normalizeCanonicalCurrentLifeIdentityAfterRestore(life);
  assert.equal(life.lifeId, 'life.3');
  assert.equal(life.lifeNumber, 3);
});

test('V178 B2 canonical lifeId may recover a missing/invalid lifeNumber', () => {
  const life = { lifeId: 'life.7', lifeNumber: Number.NaN };
  normalizeCanonicalCurrentLifeIdentityAfterRestore(life);
  assert.equal(life.lifeId, 'life.7');
  assert.equal(life.lifeNumber, 7);
});

test('V178 B3 valid matching identity remains unchanged', () => {
  const life = { lifeId: 'life.2', lifeNumber: 2, previousLifeId: 'life.1' };
  const before = structuredClone(life);
  normalizeCanonicalCurrentLifeIdentityAfterRestore(life);
  assert.deepEqual(life, before);
});

test('V178 B4 invalid identity without either canonical authority is not invented', () => {
  const life = { lifeId: 'custom.invalid', lifeNumber: 0 };
  normalizeCanonicalCurrentLifeIdentityAfterRestore(life);
  assert.equal(life.lifeId, 'custom.invalid');
  assert.equal(life.lifeNumber, 0);
});

test('V178 B5 full restore reconnects a valid faction membership before the real session consumer', () => {
  const registry = buildRegistry();
  const state = createPlayableAdventureState();
  const faction = Object.values(state.factions.factions)[0];
  assert.ok(faction);
  state.locationId = faction.locationId;
  const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 17801, state);
  session.joinFaction(faction.id);
  const save = session.snapshot();
  assert.equal(save.currentLife.lifeId, 'life.1');
  assert.equal(save.currentLife.lifeNumber, 1);
  assert.ok(save.state.factions.playerMemberships['life.1']?.active);

  save.currentLife.lifeId = 'life.stale';
  const restored = SimulationSession.restore(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, save);
  assert.equal(restored.snapshot().currentLife.lifeId, 'life.1');
  assert.equal(restored.factionMembership()?.lifeId, 'life.1');
  assert.equal(restored.factionMembership()?.factionId, faction.id);
});

test('V178 B6 current-life identity repair runs before V176 first-life history authority', () => {
  const registry = buildRegistry();
  const state = createPlayableAdventureState();
  const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 17802, state);
  session.resolveFirstLifeStory('first.awakening');
  const save = session.snapshot();
  const herbs = Number(save.state.inventory['resource.spirit_herb'] ?? 0);
  save.state.flow.firstLifeStory.completedBeatIds = [];
  save.currentLife.lifeId = 'life.stale';

  const restored = SimulationSession.restore(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, save);
  const before = restored.snapshot();
  assert.equal(before.currentLife.lifeId, 'life.1');
  assert.ok(before.state.flow.firstLifeStory.completedBeatIds.includes('first.awakening'));
  const replay = restored.resolveFirstLifeStory('first.awakening');
  assert.equal(replay.summary, 'Mốc này đã hoàn thành.');
  assert.equal(Number(restored.snapshot().state.inventory['resource.spirit_herb'] ?? 0), herbs);
});

console.log(`\nV178 CURRENT-LIFE IDENTITY RUNTIME AUTHORITY: ${passed}/${passed} PASS`);
