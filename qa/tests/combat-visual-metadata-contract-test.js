import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { buildRegistry } from '../../dist/content/registry.js';
import { endlessHuntArchetypes } from '../../dist/content/endless-hunt.js';
import { realmMapDefinitionForFloor } from '../../dist/content/realm-maps.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { SeededRng } from '../../dist/core/rng.js';
import { createEndlessHuntState, generateEndlessHuntMonster, cloneEndlessHuntState } from '../../dist/core/endless-hunt.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { createGameApplicationApi } from '../../dist/core/game-api.js';
import { buildCombatSnapshot, createCombatPlayback } from '../../godot/backend/combat_presentation.mjs';

const registry = buildRegistry();
const ids = ['wolf', 'serpent', 'golem', 'spirit', 'demon', 'dragon'];
const floors = [1, 20, 21, 41, 61, 81, 100, 101, 800, 801];
const seeds = Array.from({ length: 24 }, (_, i) => Math.imul(i + 1, 0x9e3779b9) >>> 0);

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort()
    .filter(key => !['archetypeId', 'monsterArchetypeId'].includes(key)).map(key => [key, canonical(value[key])]));
  return value;
}
const digest = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');

function traceRng(fn) {
  const original = SeededRng.prototype.nextUint32;
  const trace = [];
  SeededRng.prototype.nextUint32 = function () {
    const value = original.call(this);
    trace.push(value);
    return value;
  };
  try { return { value: fn(), trace }; }
  finally { SeededRng.prototype.nextUint32 = original; }
}

function monsterCase(floor, seed, boss) {
  const state = createEndlessHuntState();
  const map = realmMapDefinitionForFloor(floor);
  state.selectedFloor = floor;
  state.highestUnlockedByMajor[String(map.majorRealmIndex)] = map.localFloor;
  return traceRng(() => generateEndlessHuntMonster(state, seed, 70, 1.3,
    map.gradeWeights, map.localFloor, map.elementPool, map.maxMonsterElements, boss));
}

function sessionCase(seed, floor = 1, strong = false) {
  const state = createPlayableAdventureState();
  const map = realmMapDefinitionForFloor(floor);
  state.realm.maxRealmOrder = strong ? 18 : map.realmOrder;
  state.endlessHunt = createEndlessHuntState();
  state.endlessHunt.selectedFloor = floor;
  state.endlessHunt.highestUnlockedByMajor[String(map.majorRealmIndex)] = map.localFloor;
  // Synthetic high-power fixture exercises victory without changing production balance.
  const profile = strong ? { ...playablePlayerProfile, combatEntity: { ...playablePlayerProfile.combatEntity,
    stats: { ...playablePlayerProfile.combatEntity.stats, attack: 10000, physique: 10000, defense: 1000 } } } : playablePlayerProfile;
  return new SimulationSession(registry, thanhHaWorld, adventureEnemies, profile, seed, state);
}

const snapshotFor = session => buildCombatSnapshot({ session, registry,
  api: createGameApplicationApi(new GameplayFacade(session, registry, thanhHaWorld)) });

// Recorded before the patch at the opening SHA. Hash complete nonmetadata outputs,
// not reconstructed formulas: generator fields, every RNG draw, real V3 events,
// outcomes, rewards/settlement, and state. Baseline has no auto-update test mode.
export function collectDeterminismEvidence() {
  const monsters = [];
  const generatorTrace = [];
  for (const floor of floors) for (const seed of seeds) for (const boss of [false, true]) {
    const run = monsterCase(floor, seed, boss);
    monsters.push(run.value);
    generatorTrace.push(run.trace);
  }
  const fights = [];
  const fightTrace = [];
  for (const seed of seeds.slice(0, 6)) for (const strong of [false, true]) {
    const run = traceRng(() => {
      const session = sessionCase(seed, 1, strong);
      const before = session.endlessHuntSummary();
      const result = session.fightEndlessFloor();
      return { before, result };
    });
    fights.push(run.value);
    fightTrace.push(run.trace);
  }
  return { monsterCases: monsters.length, monsterHash: digest(monsters),
    generatorRngHash: digest(generatorTrace), generatorRngCalls: generatorTrace.flat().length,
    fightCases: fights.length, fightHash: digest(fights), fightRngHash: digest(fightTrace),
    fightRngCalls: fightTrace.flat().length,
    outcomes: [...new Set(fights.map(f => f.result.won ? 'victory' : 'defeat'))].sort() };
}

function runTests() {
  let passed = 0;
  const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };
  test('generator retains the already selected canonical archetype ID', () => {
    assert.deepEqual(endlessHuntArchetypes.map(a => a.id), ids);
    const seen = new Set();
    for (const seed of seeds) for (const boss of [false, true]) {
      const run = monsterCase(1, seed, boss);
      assert(ids.includes(run.value.archetypeId));
      const selectionDraw = run.trace[boss ? 0 : 1] / 0x100000000;
      const selected = endlessHuntArchetypes[Math.floor(selectionDraw * endlessHuntArchetypes.length)];
      assert.equal(run.value.archetypeId, selected.id);
      assert(selected.names.some(name => run.value.name.endsWith(name)));
      seen.add(run.value.archetypeId);
    }
    assert.deepEqual([...seen].sort(), [...ids].sort());
  });
  test('DTO environment copies currentMap across realm/zone/element boundaries', () => {
    for (const floor of floors) {
      const session = sessionCase(seeds[0], floor);
      const map = session.endlessHuntSummary().currentMap;
      assert.deepEqual(snapshotFor(session).environment, {
        mapId: map.id, majorRealmIndex: map.majorRealmIndex, realmName: map.realmName,
        biomeName: map.biomeName, zone: map.zone, zoneName: map.zoneName,
        zoneFloor: map.zoneFloor, localFloor: map.localFloor, primaryElement: map.primaryElement,
      });
    }
  });
  test('Boss projection and playback retain archetype and original encounter environment', () => {
    const session = sessionCase(seeds[0], 20, true);
    const initial = snapshotFor(session);
    const monster = session.endlessHuntSummary().monster;
    assert.equal(initial.enemy.archetypeId, monster.archetypeId);
    assert.equal(initial.enemy.gradeId, 'boss');
    assert.deepEqual(initial.enemy.elements, monster.elements);
    const result = session.fightEndlessFloor();
    const playback = createCombatPlayback({ result, initialSnapshot: initial });
    assert.deepEqual(playback.snapshot.environment, initial.environment);
    assert(ids.includes(result.monsterArchetypeId));
    assert.equal(playback.snapshot.enemy.archetypeId, result.monsterArchetypeId);
    assert(endlessHuntArchetypes.find(a => a.id === result.monsterArchetypeId).names
      .some(name => result.monsterName.endsWith(name)));
    assert.notEqual(playback.snapshot.environment, initial.environment);
    assert.equal(session.endlessHuntSummary().currentMap.zoneFloor, 21);
    assert.equal(playback.snapshot.environment.zoneFloor, 20);
    assert.equal(playback.snapshot.environment.primaryElement, 'Wood');
    assert.equal(session.endlessHuntSummary().currentMap.primaryElement, 'Fire');
    const legacy = { ...result };
    delete legacy.monsterArchetypeId;
    assert.equal(createCombatPlayback({ result: legacy, initialSnapshot: initial }).snapshot.enemy.archetypeId, '');
  });
  test('old activeMonster survives read/clone without guessed ID or save mutation', () => {
    const session = sessionCase(seeds[0]);
    session.stateValue.endlessHunt.activeMonster = monsterCase(1, seeds[0], true).value;
    delete session.stateValue.endlessHunt.activeMonster.archetypeId;
    const before = JSON.stringify(session.stateValue);
    assert.equal(snapshotFor(session).enemy.archetypeId, '');
    assert.equal(JSON.stringify(session.stateValue), before);
    assert.equal(cloneEndlessHuntState(session.stateValue.endlessHunt).activeMonster.archetypeId, undefined);
  });
  test('missing legacy currentMap uses empty metadata, never a guessed biome/element', () => {
    const session = sessionCase(seeds[0]);
    const hunt = session.endlessHuntSummary();
    delete hunt.currentMap;
    const api = createGameApplicationApi(new GameplayFacade(session, registry, thanhHaWorld));
    api.getEndlessHunt = () => hunt;
    const env = buildCombatSnapshot({ session, api, registry }).environment;
    assert.equal(env.biomeName, '');
    assert.equal(env.primaryElement, '');
    assert.equal(env.majorRealmIndex, 0);
  });
  test('prepatch baseline matches complete generator/gameplay outputs and exact RNG sequence', () => {
    const baseline = JSON.parse(readFileSync(new URL('../fixtures/combat-visual-metadata-baseline.json', import.meta.url)));
    assert.equal(baseline.openingSha, 'e867a2ba9c4e616dfb965e6e8255635e7c8197c0');
    assert.deepEqual(collectDeterminismEvidence(), baseline.evidence);
    assert.deepEqual(baseline.evidence.outcomes, ['defeat', 'victory']);
  });
  console.log(`COMBAT VISUAL METADATA CONTRACT: ${passed}/${passed} PASS`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runTests();
