import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { createGameApplicationApi } from '../../dist/core/game-api.js';
import { ARTIFACTS_V88, RELICS_V88 } from '../../dist/core/artifact-v88.js';
import { addArtifact, buildArtifactInstance } from '../../dist/core/artifact.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };

const registry = buildRegistry();
const state = createPlayableAdventureState();
state.realm.maxRealmOrder = 34;
const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 16304, state);
const game = new GameplayFacade(session, registry, thanhHaWorld);
const api = createGameApplicationApi(game);
api.devGrantCollectionV12326();

const canonical = session.stateValue.collectionV12316;
const artifact = ARTIFACTS_V88[0];
const relic = RELICS_V88[0];
assert(artifact && relic, 'V163 B4 fixture requires authored artifact/relic definitions');
api.equipCollectionV12326(artifact.id, 0);
api.equipCollectionV12326(relic.id);

const template = [...registry.artifactTemplates.values()][0];
assert(template, 'V163 B4 legacy artifact template fixture missing');
const legacy = buildArtifactInstance(
  template,
  0,
  'mid',
  1,
  { kind: 'dungeon', dungeonId: 'v163.b4', seed: 16304 },
  session.stateValue.worldTimeYears,
  session.currentLife.lifeId,
);
legacy.nourishmentStage = 5;
legacy.nourishmentExp = 1800;
legacy.history.battles = 800;
legacy.history.victories = 700;
legacy.spirit = { state: 'awakened', name: 'B4 Khí Linh', awakenedWorldYear: session.stateValue.worldTimeYears };
addArtifact(session.stateValue.artifacts, legacy);
session.activateArtifact(legacy.id);

test('V163 B4 saved loadouts preserve canonical Artifact, canonical Relic, and legacy history Artifact as separate channels', () => {
  const saved = session.saveCombatLoadout('V163 B4 compatibility');
  assert.deepEqual(saved.artifactIds, [artifact.id]);
  assert.equal(saved.relicId, relic.id);
  assert.deepEqual(saved.legacyArtifactIds, [legacy.id]);

  canonical.activeArtifactIds = [];
  canonical.economyV12325.activeRelicId = undefined;
  session.stateValue.artifacts.activeIds = [];

  const applied = session.applySavedCombatLoadout(saved.id);
  assert(applied);
  assert.deepEqual(canonical.activeArtifactIds, [artifact.id]);
  assert.equal(canonical.economyV12325.activeRelicId, relic.id);
  assert.deepEqual(session.stateValue.artifacts.activeIds, [legacy.id]);
});

test('V163 B4 legacy active Artifact still has distinct Integration semantics and therefore cannot be deleted as dead state', () => {
  const withLegacy = session.integrationSummary();
  assert.equal(withLegacy.awakened, true);
  assert(withLegacy.artifact > 52, `expected progressed legacy Artifact to raise Integration artifact score, got ${withLegacy.artifact}`);

  session.deactivateArtifact(legacy.id);
  const withoutLegacy = session.integrationSummary();
  assert.equal(withoutLegacy.artifact, 52);
  assert(withLegacy.artifact > withoutLegacy.artifact);
  session.activateArtifact(legacy.id);
});

test('V163 B4 reincarnation/world-relic archive consumes legacy Artifact identity and history', () => {
  session.preserveArtifactsAsWorldRelics(session.currentLife.lifeId);
  const archived = session.meta.artifactRelics.find(x => x.artifact.id === legacy.id);
  assert(archived, 'legacy Artifact must be archived as a world relic');
  assert.equal(archived.sourceLifeId, session.currentLife.lifeId);
  assert.equal(archived.artifact.history.battles, legacy.history.battles);
  assert(archived.artifact.history.majorEvents.some(x => x.type === 'lost'));
  assert(session.recoverableArtifactRelics().some(x => x.artifact.id === legacy.id));
});

test('V163 B4 snapshot/restore clones legacy Artifact, canonical Collection, and world-relic metadata independently', () => {
  const snapshot = session.snapshot();
  const restored = SimulationSession.restore(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, snapshot);

  assert(restored.stateValue.artifacts.items.some(x => x.id === legacy.id));
  assert(restored.stateValue.artifacts.activeIds.includes(legacy.id));
  assert.deepEqual(restored.stateValue.collectionV12316.activeArtifactIds, [artifact.id]);
  assert.equal(restored.stateValue.collectionV12316.economyV12325.activeRelicId, relic.id);
  assert(restored.meta.artifactRelics.some(x => x.artifact.id === legacy.id));

  snapshot.state.artifacts.activeIds.length = 0;
  snapshot.state.collectionV12316.activeArtifactIds.length = 0;
  snapshot.state.collectionV12316.economyV12325.activeRelicId = undefined;
  snapshot.meta.artifactRelics.find(x => x.artifact.id === legacy.id).artifact.name = 'CORRUPTED SNAPSHOT';

  assert(restored.stateValue.artifacts.activeIds.includes(legacy.id));
  assert.deepEqual(restored.stateValue.collectionV12316.activeArtifactIds, [artifact.id]);
  assert.equal(restored.stateValue.collectionV12316.economyV12325.activeRelicId, relic.id);
  assert.notEqual(restored.meta.artifactRelics.find(x => x.artifact.id === legacy.id).artifact.name, 'CORRUPTED SNAPSHOT');
});

test('V163 B4 compatibility consumers remain explicit and Collection combat authority remains separate', () => {
  const sessionSource = readFileSync(new URL('../../dist/core/session.js', import.meta.url), 'utf8');
  const worldSource = readFileSync(new URL('../../dist/core/world.js', import.meta.url), 'utf8');
  const lifeSource = readFileSync(new URL('../../dist/core/life.js', import.meta.url), 'utf8');
  const integrationSource = readFileSync(new URL('../../dist/core/integration.js', import.meta.url), 'utf8');

  assert(sessionSource.includes('legacyArtifactIds: [...this.stateValue.artifacts.activeIds]'));
  assert(sessionSource.includes('preserveArtifactsAsWorldRelics(sourceLifeId)'));
  assert(sessionSource.includes('recordArtifactOwnershipYears(this.stateValue.artifacts'));
  assert(sessionSource.includes('recordActiveArtifactBattle(this.stateValue.artifacts'));
  assert(sessionSource.includes('deriveIntegrationSummary(this.stateValue.realm, this.stateValue.cultivation, this.stateValue.soul, this.stateValue.dao, this.stateValue.artifacts)'));

  assert(worldSource.includes('artifacts: cloneArtifactState(state.artifacts)'));
  assert(worldSource.includes('collectionV12316: cloneCollectionProgressStateV12316(state.collectionV12316)'));
  assert(lifeSource.includes('artifactRelics: (meta.artifactRelics ?? []).map'));
  assert(integrationSource.includes('artifacts.items.filter(item => artifacts.activeIds.includes(item.id))'));

  // B1-B3 already prove Collection is the direct Artifact/Relic combat authority. B4 protects
  // legacy state only for compatibility/history semantics; do not reintroduce it as direct combat gear.
  assert(!sessionSource.includes('applyArtifactsToEntity('));
});

console.log(`\nV163 ARTIFACT / RELIC COMPATIBILITY CLEANUP B4: ${passed}/${passed} PASS`);
