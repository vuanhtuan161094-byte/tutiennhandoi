import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { createOrthodoxyState, createIndependentOrthodoxy } from '../../dist/core/orthodoxy.js';
import { createGenesisWorldState, createGenesisWorld } from '../../dist/core/genesis-world.js';
import { createEndlessHuntState } from '../../dist/core/endless-hunt.js';
import { normalizeCanonicalWorldToHuntAfterRestore } from '../../dist/core/save-stability.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); };
const stats = bossWins => ({ attempts: 1, wins: bossWins ? 1 : 0, losses: bossWins ? 0 : 1, totalBattleSeconds: 10, totalCultivationGain: 0, totalSpiritStones: 1, equipmentDrops: 0, pillDrops: 0, bossWins, lastBattleSeconds: 10 });

test('V173 B1 orthodoxy territory authority requires territory list and owner mirror to agree', () => {
  const state = createPlayableAdventureState();
  const locations = Object.keys(thanhHaWorld.locations);
  assert.ok(locations.length >= 2);
  state.orthodoxy = createOrthodoxyState(0);
  const a = createIndependentOrthodoxy(state.orthodoxy, 'orth.v173.a', 'A', ['A'], locations[0], 0, 50, 50);
  const b = createIndependentOrthodoxy(state.orthodoxy, 'orth.v173.b', 'B', ['B'], locations[1], 0, 50, 50);
  a.territoryIds.push(locations[0], locations[1]);
  state.orthodoxy.territoryOwnerByLocation[locations[1]] = b.factionId;
  normalizeCanonicalWorldToHuntAfterRestore(state, thanhHaWorld);
  assert.deepEqual(a.territoryIds, [locations[0]]);
  assert.deepEqual(b.territoryIds, [locations[1]]);
  assert.equal(state.orthodoxy.territoryOwnerByLocation[locations[0]], a.factionId);
  assert.equal(state.orthodoxy.territoryOwnerByLocation[locations[1]], b.factionId);
});

test('V173 B2 malformed economy, inventory and orthodoxy numerics cannot enter runtime', () => {
  const state = createPlayableAdventureState();
  state.inventory['resource.spirit_stone'] = Number.NaN;
  const market = Object.values(state.economy.markets)[0];
  const listing = Object.values(market.listings)[0];
  listing.stock = -50;
  state.economy.lifetime.spiritStonesEarned = Number.NaN;
  const locationId = Object.keys(thanhHaWorld.locations)[0];
  state.orthodoxy = createOrthodoxyState(0);
  const o = createIndependentOrthodoxy(state.orthodoxy, 'orth.v173.numeric', 'N', ['N'], locationId, 0, 50, 50);
  o.treasury = Number.NaN;
  o.prosperity = -30;
  o.logistics = 999;
  normalizeCanonicalWorldToHuntAfterRestore(state, thanhHaWorld);
  assert.equal(state.inventory['resource.spirit_stone'], 0);
  assert.equal(listing.stock, 0);
  assert.equal(state.economy.lifetime.spiritStonesEarned, 0);
  assert.equal(o.treasury, 0);
  assert.equal(o.prosperity, 0);
  assert.equal(o.logistics, 100);
});

test('V173 B3 world opportunity claim mirrors prevent single-lane restore replay', () => {
  const state = createPlayableAdventureState();
  const opportunityId = Object.keys(thanhHaWorld.opportunities ?? {})[0];
  const npcId = Object.keys(thanhHaWorld.npcs ?? {})[0];
  assert.ok(opportunityId && npcId);
  state.worldSimulation.claimedOpportunityIds = [];
  state.worldSimulation.opportunityClaims[opportunityId] = { opportunityId, claimantType: 'npc', claimantId: npcId, worldYear: 1 };
  state.worldSimulation.npcs[npcId].claimedOpportunityIds = [opportunityId, opportunityId];
  normalizeCanonicalWorldToHuntAfterRestore(state, thanhHaWorld);
  assert.deepEqual(state.worldSimulation.claimedOpportunityIds, [opportunityId]);
  assert.deepEqual(state.worldSimulation.npcs[npcId].claimedOpportunityIds, [opportunityId]);
});

test('V173 B4 world relationship identity and bounded values are canonicalized', () => {
  const state = createPlayableAdventureState();
  const npcIds = Object.keys(thanhHaWorld.npcs ?? {});
  assert.ok(npcIds.length >= 2);
  const [a, b] = npcIds;
  const key = a < b ? `${a}|${b}` : `${b}|${a}`;
  state.worldSimulation.relationships[key] = { aId: a < b ? a : b, bId: a < b ? b : a, trust: 999, respect: -2, grudge: Number.NaN, karmaDepth: 150, lastChangedWorldYear: 0 };
  state.worldSimulation.playerRelationships[`life.v173|${a}`] = { lifeId: 'life.v173', npcId: a, met: true, trust: 120, respect: -5, debt: Number.NaN, grudge: 101, karmaDepth: 40, interactionCount: -3, lastInteractionWorldYear: 0, flags: ['DebtRepaidOnce', 'DebtRepaidOnce'] };
  normalizeCanonicalWorldToHuntAfterRestore(state, thanhHaWorld);
  assert.equal(state.worldSimulation.relationships[key].trust, 100);
  assert.equal(state.worldSimulation.relationships[key].respect, 0);
  assert.equal(state.worldSimulation.relationships[key].grudge, 0);
  const player = state.worldSimulation.playerRelationships[`life.v173|${a}`];
  assert.equal(player.trust, 100);
  assert.equal(player.debt, 0);
  assert.equal(player.interactionCount, 0);
  assert.deepEqual(player.flags, ['DebtRepaidOnce']);
});

test('V173 B5 Genesis active worlds cannot exceed Immortal-derived capacity', () => {
  const state = createPlayableAdventureState();
  state.immortal.creationEpochs = 0;
  state.immortal.genesisAuthority = 0;
  state.genesisWorlds = createGenesisWorldState(0);
  const first = createGenesisWorld(state.genesisWorlds, 'life.v173', 1, 'First', 50, 50, {});
  createGenesisWorld(state.genesisWorlds, 'life.v173', 2, 'Forged Extra', 50, 50, {});
  normalizeCanonicalWorldToHuntAfterRestore(state, thanhHaWorld);
  assert.equal(Object.values(state.genesisWorlds.worlds).filter(world => !world.extinct).length, 1);
  assert.ok(state.genesisWorlds.worlds[first.id]);
});

test('V173 B6 Hunt first-clear evidence repairs split clear/unlock authority and blocks boss replay', () => {
  const state = createPlayableAdventureState();
  state.endlessHunt = createEndlessHuntState();
  const hunt = state.endlessHunt;
  hunt.highestClearedByMajor = {};
  hunt.highestUnlockedByMajor = { '1': 1 };
  hunt.highestClearedFloor = 0;
  hunt.highestUnlockedFloor = 1;
  hunt.floorStats['1'] = stats(1);
  hunt.selectedFloor = 1;
  hunt.farmFloor = 2;
  hunt.activeMonster = { id: 'forged.boss', floor: 1, grade: 'boss', tags: [], elements: [] };
  normalizeCanonicalWorldToHuntAfterRestore(state, thanhHaWorld);
  assert.equal(hunt.highestClearedByMajor['1'], 1);
  assert.equal(hunt.highestUnlockedByMajor['1'], 2);
  assert.equal(hunt.highestClearedFloor, 1);
  assert.equal(hunt.highestUnlockedFloor, 2);
  assert.equal(hunt.farmFloor, 1);
  assert.equal(hunt.activeMonster, undefined);
});

test('V173 B7 full SimulationSession.restore applies World-to-Hunt canonicalization before consumers', () => {
  const registry = buildRegistry();
  const state = createPlayableAdventureState();
  const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 17301, state);
  const save = session.snapshot();
  save.state.inventory['resource.spirit_stone'] = -500;
  save.state.endlessHunt.highestClearedByMajor = {};
  save.state.endlessHunt.highestUnlockedByMajor = { '1': 1 };
  save.state.endlessHunt.highestClearedFloor = 0;
  save.state.endlessHunt.highestUnlockedFloor = 1;
  save.state.endlessHunt.floorStats['1'] = stats(1);
  const restored = SimulationSession.restore(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, save);
  const restoredState = restored.snapshot().state;
  assert.equal(restoredState.inventory['resource.spirit_stone'], 0);
  assert.equal(restoredState.endlessHunt.highestClearedByMajor['1'], 1);
  assert.equal(restoredState.endlessHunt.highestUnlockedByMajor['1'], 2);
});

console.log(`\nV173 WORLD → HUNT RUNTIME AUTHORITY: ${passed}/${passed} PASS`);
