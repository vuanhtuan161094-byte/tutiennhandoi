import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { joinFaction, foundPlayerFaction } from '../../dist/core/faction.js';
import { normalizeCanonicalFactionAfterRestore } from '../../dist/core/save-stability.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); };
const firstFaction = state => Object.values(state.factions.factions)[0];

test('V172 B1 joined faction cannot restore forged leader rank', () => {
  const state = createPlayableAdventureState();
  const faction = firstFaction(state);
  const lifeId = 'life.v172.joined';
  const membership = joinFaction(state.factions, faction.id, lifeId, 0);
  state.realm.maxRealmOrder = 3;
  membership.lifetimeContribution = 50;
  membership.merit = 50;
  membership.rank = 'leader';
  faction.members[`player:${lifeId}`].rank = 'leader';
  normalizeCanonicalFactionAfterRestore(state);
  assert.equal(membership.rank, 'innerDisciple');
  assert.equal(faction.members[`player:${lifeId}`].rank, 'innerDisciple');
});

test('V172 B2 restore only downgrades impossible rank and never auto-promotes a valid underpromoted save', () => {
  const state = createPlayableAdventureState();
  const faction = firstFaction(state);
  const lifeId = 'life.v172.underpromoted';
  const membership = joinFaction(state.factions, faction.id, lifeId, 0);
  state.realm.maxRealmOrder = 14;
  membership.lifetimeContribution = 999;
  membership.merit = 999;
  membership.rank = 'outerDisciple';
  faction.members[`player:${lifeId}`].rank = 'outerDisciple';
  normalizeCanonicalFactionAfterRestore(state);
  assert.equal(membership.rank, 'outerDisciple');
});

test('V172 B3 legitimate player-founded leader remains leader', () => {
  const state = createPlayableAdventureState();
  state.realm.maxRealmOrder = 14;
  const lifeId = 'life.v172.founder';
  const created = foundPlayerFaction(state.factions, lifeId, 0, 'V172 Test Sect', state.locationId, ['Test']);
  normalizeCanonicalFactionAfterRestore(state);
  assert.equal(created.membership.rank, 'leader');
  assert.equal(created.faction.members[`player:${lifeId}`].rank, 'leader');
});

test('V172 B4 dangling or identity-mismatched active membership loses runtime authority', () => {
  const state = createPlayableAdventureState();
  const faction = firstFaction(state);
  const lifeId = 'life.v172.dangling';
  const membership = joinFaction(state.factions, faction.id, lifeId, 0);
  delete faction.members[`player:${lifeId}`];
  membership.rank = 'leader';
  normalizeCanonicalFactionAfterRestore(state);
  assert.equal(membership.active, false);
});

test('V172 B5 full SimulationSession.restore repairs forged joined-faction rank before runtime consumers', () => {
  const registry = buildRegistry();
  const state = createPlayableAdventureState();
  const faction = firstFaction(state);
  state.locationId = faction.locationId;
  const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 17201, state);
  session.joinFaction(faction.id);
  const save = session.snapshot();
  const lifeId = save.currentLife.lifeId;
  const membership = save.state.factions.playerMemberships[lifeId];
  membership.rank = 'leader';
  membership.lifetimeContribution = 0;
  membership.merit = 0;
  save.state.factions.factions[faction.id].members[`player:${lifeId}`].rank = 'leader';
  const restored = SimulationSession.restore(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, save);
  assert.equal(restored.factionMembership()?.rank, 'outerDisciple');
  assert.throws(() => restored.upgradeFactionFacility('spiritVein'));
});

test('V172 B6 malformed negative/NaN contribution cannot legitimize restored promotion authority', () => {
  const state = createPlayableAdventureState();
  const faction = firstFaction(state);
  const lifeId = 'life.v172.numeric';
  const membership = joinFaction(state.factions, faction.id, lifeId, 0);
  state.realm.maxRealmOrder = 18;
  membership.lifetimeContribution = Number.NaN;
  membership.merit = -100;
  membership.rank = 'elder';
  faction.members[`player:${lifeId}`].rank = 'elder';
  normalizeCanonicalFactionAfterRestore(state);
  assert.equal(membership.lifetimeContribution, 0);
  assert.equal(membership.merit, 0);
  assert.equal(membership.rank, 'outerDisciple');
});

console.log(`\nV172 FACTION MEMBERSHIP RUNTIME AUTHORITY: ${passed}/${passed} PASS`);
