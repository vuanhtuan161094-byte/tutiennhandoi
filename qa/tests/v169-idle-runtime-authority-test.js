import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession, SIMULATION_SAVE_VERSION } from '../../dist/core/session.js';
import { DungeonEngine } from '../../dist/core/dungeon.js';
import {
  createSoulState,
  createSoulClone,
  dismissSoulClone,
  normalizeSoulCloneAuthorityV169,
  syncSoulDungeonWorkers,
} from '../../dist/core/soul.js';
import {
  canonicalOfflineWindowV169,
  normalizeCanonicalIdleRuntimeAfterRestore,
} from '../../dist/core/session-restore.js';
import { cloneWorkshopProductionV12328 } from '../../dist/core/workshop-production-v12328.js';
import { buildDongfuV99 } from '../../dist/core/dongfu-v99.js';
import { OFFLINE_CAP_REAL_HOURS } from '../../dist/core/realtime-balance.js';

const registry = buildRegistry();
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); };
const cloneFixture = (id, sixDaoId, role = 'farm') => ({
  id, name: id, sixDaoId, role, soulLoad: 0, baseEfficiency: 1, stability: 100,
  daoHanhLevel: 1, daoSealIndex: 0, yearsActive: 0, dungeonWorkYears: 0, dungeonWorkRuns: 0, createdWorldYear: 0,
});

test('V169 B1 six-dao ownership stays unique after dismiss + recreate', () => {
  const soul = createSoulState();
  soul.awakened = true;
  soul.strength = 300;
  soul.purity = 100;
  soul.stability = 100;
  soul.loadCapacity = 1000;
  const dungeons = { parallelWorkerCapacity: 6, workers: [], assignments: {} };
  const inventory = { 'resource.soul_dew': 10000, 'resource.soul_essence': 10000 };
  for (let i = 0; i < 6; i++) createSoulClone(soul, dungeons, inventory, { authorityCap: 6, worldYear: 0 });
  assert.equal(new Set(soul.clones.map(x => x.id)).size, 6);
  assert.equal(new Set(soul.clones.map(x => x.sixDaoId)).size, 6);
  dismissSoulClone(soul, dungeons, 'soul.clone.3', 6);
  const recreated = createSoulClone(soul, dungeons, inventory, { authorityCap: 6, worldYear: 1 });
  assert.equal(recreated.clone.id, 'soul.clone.3');
  assert.equal(recreated.clone.sixDaoId, 'asura');
  assert.equal(new Set(soul.clones.map(x => x.id)).size, 6);
  assert.equal(new Set(soul.clones.map(x => x.sixDaoId)).size, 6);
});

test('V169 B2 duplicate avatar worker rows cannot resolve one assignment twice', () => {
  const state = createPlayableAdventureState();
  state.realm.maxRealmOrder = 22;
  state.soul = { ...createSoulState(), awakened: true, loadCapacity: 1000, clones: [cloneFixture('soul.clone.1', 'heaven')] };
  const dungeon = {
    id: 'dungeon.v169.authority', name: 'V169 Authority', purpose: 'dao', tier: 1, tags: [],
    floors: [{ floor: 1, requiredRealmOrder: 0, rewardMultiplier: 1, qualityBias: 0, equipmentDropChance: 0 }],
    rewards: [{ resourceId: 'resource.spirit_stone', name: 'Linh Thạch', baseYieldPerYear: 100, rarity: 'common', minFloor: 1, maxFloor: 1 }],
  };
  state.dungeons = {
    unlockedDungeonIds: [dungeon.id], highestClearedFloor: { [dungeon.id]: 1 }, parallelWorkerCapacity: 6,
    workers: [
      { id: 'soul.clone.1', name: 'A', kind: 'avatar', efficiency: 1 },
      { id: 'soul.clone.1', name: 'A duplicate', kind: 'avatar', efficiency: 1 },
    ],
    assignments: { 'soul.clone.1': { workerId: 'soul.clone.1', dungeonId: dungeon.id, floor: 1, totalYears: 0, totalRuns: 0 } },
  };
  syncSoulDungeonWorkers(state.soul, state.dungeons, 1);
  assert.equal(state.dungeons.workers.filter(x => x.id === 'soul.clone.1').length, 1);
  const engine = new DungeonEngine();
  const before = state.inventory['resource.spirit_stone'] ?? 0;
  const result = engine.resolveParallel(state, { [dungeon.id]: dungeon }, 1, 16901, undefined, 1);
  assert.equal(result.events.length, 1, 'one logical assignment must produce one parallel event');
  assert((state.inventory['resource.spirit_stone'] ?? 0) > before);
  assert.equal(state.dungeons.assignments['soul.clone.1'].totalRuns, 1);
});

test('V169 B4 restore canonicalizes Soul workers, assignments, Động Phủ and duplicate forge jobs', () => {
  const state = createPlayableAdventureState();
  state.realm.maxRealmOrder = 26; // two active clone slots; later owned clones remain sealed.
  state.soul = {
    ...createSoulState(), awakened: true, loadCapacity: 1000,
    clones: [
      cloneFixture('soul.clone.1', 'heaven'),
      cloneFixture('soul.clone.2', 'human', 'protector'),
      cloneFixture('soul.clone.3', 'asura'),
      cloneFixture('soul.clone.3', 'asura'),
    ],
  };
  const dungeon = Object.values(thanhHaWorld.dungeons).find(x => x?.floors?.some(f => f.floor === 1));
  assert(dungeon, 'canonical world must expose a dungeon floor 1');
  state.dungeons.unlockedDungeonIds = [dungeon.id];
  state.dungeons.highestClearedFloor = { [dungeon.id]: 1 };
  state.dungeons.parallelWorkerCapacity = 99;
  state.dungeons.workers = [
    { id: 'soul.clone.1', kind: 'avatar', name: 'dup1', efficiency: 1 },
    { id: 'soul.clone.1', kind: 'avatar', name: 'dup2', efficiency: 1 },
    { id: 'soul.clone.3', kind: 'avatar', name: 'sealed', efficiency: 1 },
  ];
  state.dungeons.assignments = {
    'soul.clone.1': { workerId: 'wrong', dungeonId: dungeon.id, floor: 1, totalYears: -5, totalRuns: -1 },
    'soul.clone.2': { workerId: 'soul.clone.2', dungeonId: dungeon.id, floor: 1, totalYears: 9, totalRuns: 2 },
    'soul.clone.3': { workerId: 'soul.clone.3', dungeonId: 'missing.v169', floor: 999, totalYears: 9, totalRuns: 2 },
  };
  state.collectionV12316.cave = { level: 999, facilities: [
    { id: 'forge', level: 999 }, { id: 'forge', level: 2 }, { id: 'alchemy', level: -20 }, { id: 'unknown.v169', level: 999 },
  ] };
  state.collectionV12316.workshopV12328 = {
    schema: 'workshop-production.v12328', petGear: {}, forgeSerial: 0,
    forgeQueues: [
      { id: 'forge.v2328.7', recipeId: 'recipe.a', startedAtUnixMs: 1000, completesAtUnixMs: 2000, durationRealSeconds: 1, selections: [], reserved: [] },
      { id: 'forge.v2328.7', recipeId: 'recipe.a', startedAtUnixMs: 1000, completesAtUnixMs: 2000, durationRealSeconds: 1, selections: [], reserved: [] },
    ],
  };

  normalizeCanonicalIdleRuntimeAfterRestore(state, thanhHaWorld);
  assert.equal(state.soul.clones.length, 3, 'duplicate clone id must not mint a fourth owned clone');
  assert.equal(new Set(state.soul.clones.map(x => x.sixDaoId)).size, 3);
  assert.deepEqual(state.dungeons.workers.filter(x => x.kind === 'avatar').map(x => x.id), ['soul.clone.1'], 'protector and sealed clone must not remain farm workers');
  assert.deepEqual(Object.keys(state.dungeons.assignments), ['soul.clone.1']);
  assert.equal(state.dungeons.assignments['soul.clone.1'].workerId, 'soul.clone.1');
  assert.equal(state.dungeons.assignments['soul.clone.1'].totalYears, 0);
  assert.equal(state.collectionV12316.cave.facilities.length, 8);
  assert.equal(state.collectionV12316.cave.facilities.find(x => x.id === 'forge').level, 10);
  assert.equal(state.collectionV12316.cave.facilities.find(x => x.id === 'alchemy').level, 1);
  assert.equal(state.collectionV12316.cave.level, 10);
  assert.equal(state.collectionV12316.workshopV12328.forgeQueues.length, 1);
  assert.equal(state.collectionV12316.workshopV12328.forgeSerial, 7);

  const before = structuredClone(state.collectionV12316.cave);
  const dongfu = buildDongfuV99({ collection: state.collectionV12316, collectionEconomy: {} });
  assert.equal(dongfu.facilities.find(x => x.id === 'forge').level, 10);
  assert.deepEqual(state.collectionV12316.cave, before, 'Động Phủ V99 read projection must not become a second mutation authority');
});

test('V169 B4 workshop clone barrier deduplicates logical jobs and advances serial past restored IDs', () => {
  const restored = cloneWorkshopProductionV12328({
    schema: 'workshop-production.v12328', petGear: {}, forgeSerial: 1,
    forgeQueues: [
      { id: 'forge.v2328.12', recipeId: 'a', startedAtUnixMs: 0, completesAtUnixMs: 1000, durationRealSeconds: 1, selections: [], reserved: [] },
      { id: 'forge.v2328.12', recipeId: 'a', startedAtUnixMs: 0, completesAtUnixMs: 1000, durationRealSeconds: 1, selections: [], reserved: [] },
    ],
  });
  assert.equal(restored.forgeQueues.length, 1);
  assert.equal(restored.forgeSerial, 12);
});

test('V169 B3 restored offline interval is consumable once; stale retry only processes the unseen tail', () => {
  assert.equal(OFFLINE_CAP_REAL_HOURS, 24, 'V169 does not rebalance the canonical offline cap');
  const seed = 16903;
  const original = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, seed, createPlayableAdventureState());
  const save = {
    schemaVersion: SIMULATION_SAVE_VERSION,
    profileId: playablePlayerProfile.id,
    rootSeed: seed,
    state: original.state,
    actionIndex: original.actionIndex,
    history: [],
    meta: original.meta,
    currentLife: original.currentLife,
  };
  const restored = SimulationSession.restore(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, save);
  const t0 = 1_800_000_000_000;
  const first = restored.resolveOffline({}, t0, t0 + 60_000);
  assert(first.processedRealHours > 0);
  const afterFirst = restored.state.cultivation.tuVi;
  const replay = restored.resolveOffline({}, t0, t0 + 60_000);
  assert.equal(replay.processedRealHours, 0);
  assert.equal(replay.cultivationGain, 0);
  assert.equal(restored.state.cultivation.tuVi, afterFirst, 'same wall-clock interval must not mint Tu Vi twice');
  const tail = restored.resolveOffline({}, t0, t0 + 120_000);
  assert(Math.abs(tail.processedRealHours - 1 / 60) < 1e-9, `expected only unseen 60s tail, got ${tail.processedRealHours}h`);
  const reversed = canonicalOfflineWindowV169(restored.state.flow, t0 + 500_000, t0 + 400_000);
  assert.equal(reversed.effectiveNowUnixMs, reversed.effectiveLastSeenUnixMs, 'backward timestamps must collapse to zero elapsed time');
});

test('V169 B5 current offline authority stays self-cultivation-only and cannot silently run dungeon workers', () => {
  const seed = 16904;
  const original = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, seed, createPlayableAdventureState());
  const save = {
    schemaVersion: SIMULATION_SAVE_VERSION,
    profileId: playablePlayerProfile.id,
    rootSeed: seed,
    state: original.state,
    actionIndex: original.actionIndex,
    history: [],
    meta: original.meta,
    currentLife: original.currentLife,
  };
  const restored = SimulationSession.restore(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, save);
  const assignmentsBefore = structuredClone(restored.state.dungeons.assignments);
  const t0 = 1_800_100_000_000;
  const result = restored.resolveOffline({ type: 'dungeon' }, t0, t0 + 30_000);
  assert(result.cultivationGain >= 0);
  assert.deepEqual(restored.state.dungeons.assignments, assignmentsBefore, 'offline return must not invent a second clone/dungeon reward lane');
});

console.log(`\nV169 ĐỘNG PHỦ / PHÂN THÂN / OFFLINE RUNTIME AUTHORITY: ${passed}/${passed} PASS`);