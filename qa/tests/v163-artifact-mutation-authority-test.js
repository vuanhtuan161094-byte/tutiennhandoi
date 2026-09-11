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
state.realm.maxRealmOrder = 22;
const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 16302, state);
const game = new GameplayFacade(session, registry, thanhHaWorld);
const api = createGameApplicationApi(game);
api.devGrantCollectionV12326();

const canonical = session.stateValue.collectionV12316;
const artifactA = ARTIFACTS_V88[0];
const artifactB = ARTIFACTS_V88[1];
const relicA = RELICS_V88[0];
const relicB = RELICS_V88[1];
assert(artifactA && artifactB && relicA && relicB, 'V163 B2 fixture requires authored artifact/relic definitions');

test('V163 B2 V12325 player-facing artifact equip is a compatibility alias into canonical Collection authority', () => {
  const legacyBefore = [...session.stateValue.artifacts.activeIds];
  api.equipCollectionV12325(artifactA.id, 0);
  assert.equal(canonical.activeArtifactIds[0], artifactA.id);
  assert.deepEqual(session.stateValue.artifacts.activeIds, legacyBefore);
  assert.equal(game.artifacts().find(x => x.id === artifactA.id)?.active, true);

  api.unequipCollectionV12325(artifactA.id);
  assert(!canonical.activeArtifactIds.includes(artifactA.id));
  assert.deepEqual(session.stateValue.artifacts.activeIds, legacyBefore);
});

test('V163 B2 V12316 player-facing equip cannot bypass V12326 Collection state', () => {
  const legacyBefore = structuredClone(session.stateValue.artifacts);
  api.equipCollectionV12316(artifactB.id, 0);
  assert.equal(canonical.activeArtifactIds[0], artifactB.id);
  assert.equal(game.artifacts().find(x => x.id === artifactB.id)?.active, true);
  assert.deepEqual(session.stateValue.artifacts, legacyBefore);

  api.unequipCollectionV12316(artifactB.id);
  assert(!canonical.activeArtifactIds.includes(artifactB.id));
  assert.deepEqual(session.stateValue.artifacts, legacyBefore);
});

test('V163 B2 canonical V12326 remains the effective one-slot Chí Bảo mutation authority', () => {
  api.equipCollectionV12326(relicA.id);
  assert.equal(canonical.economyV12325.activeRelicId, relicA.id);
  api.equipCollectionV12325(relicB.id);
  assert.equal(canonical.economyV12325.activeRelicId, relicB.id);
  assert.equal(game.overview().build.activeRelicId, relicB.id);
});

test('V163 B2 Game API and Gameplay legacy progression methods structurally delegate to V12326', () => {
  const apiSource = readFileSync(new URL('../../dist/core/game-api.js', import.meta.url), 'utf8');
  const gameplaySource = readFileSync(new URL('../../dist/core/gameplay.js', import.meta.url), 'utf8');
  for (const verb of ['Strengthen', 'Advance', 'Equip', 'Unequip']) {
    const lower = verb[0].toLowerCase() + verb.slice(1);
    assert(apiSource.includes(`${lower}CollectionV12326`), `Game API missing canonical ${lower} V12326`);
    assert(gameplaySource.includes(`collection${verb}V12326`), `Gameplay missing canonical ${verb} V12326`);
    assert(gameplaySource.includes(`return this.collection${verb}V12326(`), `Gameplay compatibility ${verb} path must delegate to V12326`);
  }
  assert(apiSource.includes("strengthenCollectionV12316: 'strengthenCollectionV12326'"));
  assert(apiSource.includes("advanceCollectionV12316: 'advanceCollectionV12326'"));
  assert(apiSource.includes("equipCollectionV12316: 'equipCollectionV12326'"));
  assert(apiSource.includes("unequipCollectionV12316: 'unequipCollectionV12326'"));
});

test('V163 B2 standalone compatibility labels route through Game API and never directly mutate Session artifact state', () => {
  const standalone = readFileSync(new URL('../../standalone-runtime.js', import.meta.url), 'utf8');
  for (const action of ['collectionStrengthenV12325', 'collectionAdvanceV12325', 'collectionEquipV12325', 'collectionUnequipV12325']) {
    assert(standalone.includes(action), `expected current compatibility transport ${action}`);
    assert(standalone.includes(`rt.api.${action}`), `${action} must enter through Game API`);
  }
  assert(!standalone.includes('rt.api.activateArtifact('));
  assert(!standalone.includes('rt.api.deactivateArtifact('));
  assert(!standalone.includes('session.activateArtifact('));
  assert(!standalone.includes('session.deactivateArtifact('));
});

test('V163 B2 legacy artifact activate/deactivate command is isolated history/integration state, not Collection loadout authority', () => {
  const template = [...registry.artifactTemplates.values()][0];
  assert(template, 'legacy artifact template fixture missing');
  const legacy = buildArtifactInstance(
    template,
    0,
    'mid',
    1,
    { kind: 'dungeon', dungeonId: 'v163.b2', seed: 16302 },
    session.stateValue.worldTimeYears,
    session.currentLife.lifeId,
  );
  addArtifact(session.stateValue.artifacts, legacy);
  const canonicalBefore = [...canonical.activeArtifactIds];

  game.dispatch({ type: 'activateArtifact', artifactId: legacy.id });
  assert(session.stateValue.artifacts.activeIds.includes(legacy.id));
  assert.deepEqual(canonical.activeArtifactIds, canonicalBefore);
  assert(!game.artifacts().some(x => x.id === legacy.id), 'legacy instance must not enter player-facing canonical artifact view');

  game.dispatch({ type: 'deactivateArtifact', artifactId: legacy.id });
  assert(!session.stateValue.artifacts.activeIds.includes(legacy.id));
  assert.deepEqual(canonical.activeArtifactIds, canonicalBefore);
});

console.log(`\nV163 ARTIFACT / RELIC MUTATION AUTHORITY B2: ${passed}/${passed} PASS`);
