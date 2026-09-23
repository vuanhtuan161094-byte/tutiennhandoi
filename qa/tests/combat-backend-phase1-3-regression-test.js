import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../../dist/content/registry.js';
import { lightningSwordCultivator, heavySwordCultivator, playableMortalCultivator, blackWindWolf } from '../../dist/content/entities.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { runCombatKernelV2, combatKernelMechanicsProjectionV2 } from '../../dist/core/combat-kernel-v2.js';
import { buildHuntCombatProfileV130 } from '../../dist/core/hunt-real-combat-v130.js';
import { buildPlayerCombatEntityV1 } from '../../dist/core/combat-entity-factory.js';

const registry = buildRegistry();
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); };
const newSession = (seed = 18101) => new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, seed, createPlayableAdventureState());

const BASELINE_CASES = [
  { id: 'sword-vs-heavy', seed: 181001, entities: [lightningSwordCultivator, heavySwordCultivator], maxDuration: 120 },
  { id: 'mortal-vs-wolf', seed: 181002, entities: [playableMortalCultivator, blackWindWolf], maxDuration: 120 },
];

test('Phase 1 golden corpus remains deterministic for identical entity snapshots and seeds', () => {
  for (const entry of BASELINE_CASES) {
    const run = () => runCombatKernelV2({
      registry,
      seed: entry.seed,
      entities: structuredClone(entry.entities),
      maxDuration: entry.maxDuration,
      mode: 'headless',
    }).battle;
    assert.deepEqual(
      combatKernelMechanicsProjectionV2(run()),
      combatKernelMechanicsProjectionV2(run()),
      `determinism drift: ${entry.id}`,
    );
  }
});

test('Phase 1 hard timeout never executes or logs an event beyond maxDuration', () => {
  const maxDuration = 0.001;
  const battle = runCombatKernelV2({
    registry,
    seed: 181003,
    entities: structuredClone([playableMortalCultivator, blackWindWolf]),
    maxDuration,
    mode: 'headless',
  }).battle;
  assert(battle.duration <= maxDuration + 1e-9, `duration escaped cap: ${battle.duration}`);
  assert.equal(
    battle.logs.some(log => Number(log.time) > maxDuration + 1e-9),
    false,
    'CombatKernel emitted a post-timeout event',
  );
  assert.equal(battle.draw, true, 'a 1ms cap must finalize before either normal cast resolves');
});

test('Phase 2 V145 Hunt profile no longer dereferences retired root origin/milestone tuning', () => {
  const session = newSession(18104);
  const profile = buildHuntCombatProfileV130(session.personalCombatEntity(), registry);
  for (const key of ['maxHp', 'attack', 'defense', 'damageCoeffPerSecond', 'healPerSecond', 'shieldPerSecond', 'breakPressure', 'controlPressure', 'spiritSustain'])
    assert(Number.isFinite(profile[key]), `non-finite Hunt profile field: ${key}`);
});

test('Phase 3 standalone CombatEntityFactory exactly matches the Session canonical wrapper', () => {
  const session = newSession(18105);
  const direct = buildPlayerCombatEntityV1({
    profileCombatEntity: session.profile.combatEntity,
    state: session.stateValue,
    registry: session.registry,
    currentLifeId: session.currentLifeValue.lifeId,
    alchemyPermanentStats: session.metaValue.reincarnationProgress?.alchemyPermanentStats,
  });
  assert.deepEqual(direct, session.personalCombatEntityForState(session.stateValue));
});

test('Phase 3 retired Fate Embryo/Mệnh Thai state cannot alter canonical player combat stats', () => {
  const session = newSession(18106);
  const input = {
    profileCombatEntity: session.profile.combatEntity,
    registry: session.registry,
    currentLifeId: session.currentLifeValue.lifeId,
    alchemyPermanentStats: session.metaValue.reincarnationProgress?.alchemyPermanentStats,
  };
  const baseline = buildPlayerCombatEntityV1({ ...input, state: structuredClone(session.stateValue) });
  const restored = structuredClone(session.stateValue);
  restored.fateEmbryo = {
    ...(restored.fateEmbryo ?? {}),
    sourceMingJi: 999999999,
    manifestationCapacity: 999999999,
    attackMultiplier: 999999999,
    defenseMultiplier: 999999999,
  };
  const after = buildPlayerCombatEntityV1({ ...input, state: restored });
  assert.deepEqual(after.stats, baseline.stats, 'retired Mệnh Thai leaked into canonical CombatEntity');
});

test('Phase 3 Dungeon and Content Event cannot own duplicate player-stat composition pipelines', () => {
  const dungeonSource = fs.readFileSync(fileURLToPath(new URL('../../dist/core/session-dungeon.js', import.meta.url)), 'utf8');
  assert(dungeonSource.includes('this.personalCombatEntityForState(this.stateValue)'), 'Dungeon must use canonical Session CombatEntity factory');
  assert.equal(dungeonSource.includes('applyFateEmbryoToEntity'), false, 'Dungeon must not reintroduce retired Mệnh Thai combat power');
  assert.equal(dungeonSource.includes('applyCharacterToEntity'), false, 'Dungeon must not reconstruct player stat composition');

  const sessionSource = fs.readFileSync(fileURLToPath(new URL('../../dist/core/session.js', import.meta.url)), 'utf8');
  const start = sessionSource.indexOf('    resolveContentEvent(eventId, choiceId)');
  const end = sessionSource.indexOf('    contentEventAvailable(definition)', start);
  assert(start >= 0 && end > start, 'Content Event source slice not found');
  const contentCombat = sessionSource.slice(start, end);
  assert(contentCombat.includes('this.personalCombatEntityForState(this.stateValue)'), 'Content Event must use canonical CombatEntity factory');
  assert.equal(contentCombat.includes('applyCharacterToEntity('), false, 'Content Event must not reconstruct player stat composition');
});

test('Phase 2 Hunt practice consumes actual CombatKernel cast counts instead of estimating from duration', () => {
  const sessionSource = fs.readFileSync(fileURLToPath(new URL('../../dist/core/session.js', import.meta.url)), 'utf8');
  const start = sessionSource.indexOf('const kernelCombat = resolveEndlessHuntWithCombatKernelV3');
  const end = sessionSource.indexOf('const fateRuntime =', start);
  assert(start >= 0 && end > start, 'Endless Hunt combat/practice slice not found');
  const huntSlice = sessionSource.slice(start, end);
  assert(huntSlice.includes('kernelCombat.combatResult.summary.castCountsByActor'), 'Hunt must consume typed cast counts derived from actual kernel events');
  assert.equal(huntSlice.includes('estimateBattleDaoCastCountsV125'), false, 'Hunt must not estimate casts from battle duration');
});

test('Phase 2 Content Event defeat copy matches Luân Hồi V4 no-lifespan-loss policy', () => {
  const sessionSource = fs.readFileSync(fileURLToPath(new URL('../../dist/core/session.js', import.meta.url)), 'utf8');
  const start = sessionSource.indexOf('    resolveContentEvent(eventId, choiceId)');
  const end = sessionSource.indexOf('    contentEventAvailable(definition)', start);
  const contentCombat = sessionSource.slice(start, end);
  assert.equal(contentCombat.includes('0,1% Thọ Nguyên'), false, 'stale lifespan-loss copy must not survive');
  assert(contentCombat.includes('Thọ Nguyên không giảm'), 'defeat copy must match current recoverable-combat-death policy');
});

console.log(`\nCOMBAT BACKEND PHASE 1-3 REGRESSION: ${passed}/${passed} PASS`);
