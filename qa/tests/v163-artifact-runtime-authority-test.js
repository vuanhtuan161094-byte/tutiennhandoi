import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { cloneAdventureState } from '../../dist/core/world.js';
import { ARTIFACTS_V88, RELICS_V88 } from '../../dist/core/artifact-v88.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };

const registry = buildRegistry();
const state = createPlayableAdventureState();
state.realm.maxRealmOrder = 22;
const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 16301, state);
const game = new GameplayFacade(session, registry, thanhHaWorld);
session.devCollectionGrantV12326();
const canonical = session.stateValue.collectionV12316;

const artifact = ARTIFACTS_V88.find(x => x.id === 'artifact.thunder_punishment_sword') ?? ARTIFACTS_V88[0];
const relicA = RELICS_V88[0];
const relicB = RELICS_V88[1];

assert(artifact && relicA && relicB, 'V163 fixture requires authored artifact/relic definitions');

test('V163 B1 player-facing artifact equip writes only canonical Collection loadout authority', () => {
  const legacyBefore = structuredClone(session.stateValue.artifacts.activeIds);
  game.collectionEquipV12326(artifact.id, 0);
  assert.equal(canonical.activeArtifactIds[0], artifact.id);
  assert.deepEqual(session.stateValue.artifacts.activeIds, legacyBefore);
  const row = game.artifacts().find(x => x.id === artifact.id);
  assert.equal(row?.active, true);
  assert.equal(row?.authority, 'collectionV12316.activeArtifactIds');
});

test('V163 B1 Chí Bảo uses the canonical Collection economy one-slot authority', () => {
  game.collectionEquipV12326(relicA.id);
  assert.equal(canonical.economyV12325?.activeRelicId, relicA.id);
  game.collectionEquipV12326(relicB.id);
  assert.equal(canonical.economyV12325?.activeRelicId, relicB.id);
  assert.equal(game.overview().build.activeRelicId, relicB.id);
});

test('V163 B1 production combat composes Collection artifact/relic power once and skips legacy direct artifact power', () => {
  const sessionSource = readFileSync(new URL('../../dist/core/session.js', import.meta.url), 'utf8');
  const start = sessionSource.indexOf('personalCombatEntityForState(state) {');
  const end = sessionSource.indexOf('\n    personalCombatEntity()', start);
  assert(start >= 0 && end > start, 'personalCombatEntityForState boundary not found');
  const sessionBody = sessionSource.slice(start, end);
  assert(sessionBody.includes('buildPlayerCombatEntityV1({'), 'Session must delegate final CombatEntity composition to the canonical factory');
  assert.equal((sessionBody.match(/applyCollectionEconomyToEntityV12325\(/g) ?? []).length, 0, 'Session must not duplicate Collection combat composition');

  const factory = readFileSync(new URL('../../dist/core/combat-entity-factory.js', import.meta.url), 'utf8');
  assert(factory.includes('const equipped = applyEquipmentToEntity(character, state.equipment, registry.equipmentSets);'));
  assert(factory.includes('const collected = applyCollectionEconomyToEntityV12325(equipped, state.collectionV12316);'));
  assert.equal((factory.match(/applyCollectionEconomyToEntityV12325\(/g) ?? []).length, 1);
  assert(!factory.includes('artifactPower(state.artifacts'));
  assert(factory.includes('state.artifacts'), 'legacy history must remain available to Integration');

  const entity = session.personalCombatEntity();
  assert.equal(entity.tags.filter(x => x === 'ArtifactV88').length, 1);
  assert.equal(entity.tags.filter(x => x === 'ActiveRelic').length, 1);
  assert(entity.triggers.some(x => x.runtimeV88?.kind === 'artifactSkill' && x.runtimeV88?.itemId === artifact.id));
});

test('V163 B1 save/restore clone keeps legacy history state and canonical Collection state independent', () => {
  const cloned = cloneAdventureState(session.stateValue);
  assert.notEqual(cloned.artifacts, session.stateValue.artifacts);
  assert.notEqual(cloned.collectionV12316, session.stateValue.collectionV12316);
  assert.notEqual(cloned.artifacts, cloned.collectionV12316);

  const canonicalBefore = [...cloned.collectionV12316.activeArtifactIds];
  cloned.artifacts.activeIds.push('legacy.history.only');
  assert.deepEqual(cloned.collectionV12316.activeArtifactIds, canonicalBefore);
  assert(!session.stateValue.artifacts.activeIds.includes('legacy.history.only'));

  cloned.collectionV12316.activeArtifactIds.push('canonical.collection.only');
  assert(!cloned.artifacts.activeIds.includes('canonical.collection.only'));
});

test('V163 B1 surviving legacy artifact consumers are explicitly compatibility/history, not a second player-facing authority', () => {
  const legacy = readFileSync(new URL('../../dist/core/artifact.js', import.meta.url), 'utf8');
  for (const fn of ['nourishArtifact', 'awakenArtifactSpirit', 'recordArtifactOwnershipYears', 'recordActiveArtifactBattle', 'markArtifactLost', 'markArtifactRecovered']) {
    assert(legacy.includes(`function ${fn}`) || legacy.includes(`function ${fn}(`), `${fn} history consumer missing`);
  }
  const world = readFileSync(new URL('../../dist/core/world.js', import.meta.url), 'utf8');
  assert(world.includes('artifacts: cloneArtifactState(state.artifacts)'));
  assert(world.includes('collectionV12316: cloneCollectionProgressStateV12316(state.collectionV12316)'));

  const gameplay = readFileSync(new URL('../../dist/core/gameplay.js', import.meta.url), 'utf8');
  assert(gameplay.includes("artifactAuthority: 'collectionV12316.activeArtifactIds'"));
  assert(gameplay.includes("authority: 'collectionV12316.activeArtifactIds'"));
});

console.log(`\nV163 ARTIFACT / RELIC RUNTIME AUTHORITY B1: ${passed}/${passed} PASS`);
