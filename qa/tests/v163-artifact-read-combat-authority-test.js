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
const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 16303, state);
const game = new GameplayFacade(session, registry, thanhHaWorld);
const api = createGameApplicationApi(game);
api.devGrantCollectionV12326();

const canonical = session.stateValue.collectionV12316;
const artifact = ARTIFACTS_V88[0];
const relic = RELICS_V88[0];
assert(artifact && relic, 'V163 B3 fixture requires authored artifact/relic definitions');
api.equipCollectionV12326(artifact.id, 0);
api.equipCollectionV12326(relic.id);

test('V163 B3 overview and artifact list read canonical Collection loadout', () => {
  const overview = api.getOverview();
  assert.equal(overview.build.activeArtifactCount, 1);
  assert.equal(overview.build.artifactAuthority, 'collectionV12316.activeArtifactIds');
  assert.equal(overview.build.activeRelicId, relic.id);

  const rows = api.getArtifacts();
  const active = rows.filter(x => x.active);
  assert.equal(active.length, 1);
  assert.equal(active[0].id, artifact.id);
  assert(rows.every(x => x.authority === 'collectionV12316.activeArtifactIds'));
});

test('V163 B3 combat entity applies active Artifact and Relic exactly once', () => {
  const entity = session.personalCombatEntity();
  assert.equal(entity.tags.filter(x => x === 'ArtifactV88').length, 1);
  assert.equal(entity.tags.filter(x => x === 'ActiveRelic').length, 1);
  assert.equal(entity.triggers.filter(x => x.runtimeV88?.kind === 'artifactSkill' && x.runtimeV88?.itemId === artifact.id).length, 1);
});

test('V163 B3 legacy active artifact cannot replace or duplicate canonical player-facing read/combat authority', () => {
  const template = [...registry.artifactTemplates.values()][0];
  assert(template, 'legacy artifact template fixture missing');
  const legacy = buildArtifactInstance(
    template,
    0,
    'mid',
    1,
    { kind: 'dungeon', dungeonId: 'v163.b3', seed: 16303 },
    session.stateValue.worldTimeYears,
    session.currentLife.lifeId,
  );
  addArtifact(session.stateValue.artifacts, legacy);
  game.dispatch({ type: 'activateArtifact', artifactId: legacy.id });

  assert.equal(api.getOverview().build.activeArtifactCount, 1);
  assert.equal(api.getOverview().build.activeRelicId, relic.id);
  assert(!api.getArtifacts().some(x => x.id === legacy.id));

  const entity = session.personalCombatEntity();
  assert.equal(entity.tags.filter(x => x === 'ArtifactV88').length, 1);
  assert.equal(entity.tags.filter(x => x === 'ActiveRelic').length, 1);
});

test('V163 B3 presentation reads Collection economy, not legacy ArtifactState', () => {
  const presentation = readFileSync(new URL('../../modules/artifact-presentation-v88.js', import.meta.url), 'utf8');
  assert(presentation.includes("find(x=>x.category==='artifact')"));
  assert(presentation.includes("find(x=>x.category==='relic')"));
  assert(!presentation.includes('state.artifacts'));
  assert(!presentation.includes('legacyArtifactIds'));
});

test('V163 B3 surviving legacy reads are scoped to reincarnation/history or legacy loot review', () => {
  const base = readFileSync(new URL('../../dist/core/gameplay-v149-base.js', import.meta.url), 'utf8');
  const current = readFileSync(new URL('../../dist/core/gameplay.js', import.meta.url), 'utf8');

  // Base still contains pre-V149 player reads, but the current facade must override both.
  assert(base.includes('activeArtifactCount:state.artifacts.activeIds.length'));
  assert(base.includes('artifacts()'));
  assert(current.includes("artifactAuthority: 'collectionV12316.activeArtifactIds'"));
  assert(current.includes('artifacts()'));
  assert(current.includes('const canonical = state.collectionV12316'));

  // The remaining legacy reads are intentionally historical: reincarnation relic candidates and dungeon legacy artifact drops.
  assert(base.includes('...this.session.state.artifacts.items.map(item => [item.id'));
  assert(base.includes('const artifactNames = new Map(this.session.state.artifacts.items.map'));
});

test('V163 B3 canonical loadout state remains internally coherent after reads', () => {
  assert.deepEqual(canonical.activeArtifactIds, [artifact.id]);
  assert.equal(canonical.economyV12325.activeRelicId, relic.id);
});

console.log(`\nV163 ARTIFACT / RELIC READ-COMBAT AUTHORITY B3: ${passed}/${passed} PASS`);
