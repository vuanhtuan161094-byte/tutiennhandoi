import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { LocalGameApplicationApi, createGameApplicationApi } from '../../dist/core/game-api.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };

test('V162 Session exposes only V12326 Collection/Gacha while keeping live V12325 progression', () => {
  assert.equal(typeof SimulationSession.prototype.collectionGachaV12326, 'function');
  assert.equal(SimulationSession.prototype.collectionGachaV12325, undefined);
  assert.equal(SimulationSession.prototype.collectionGachaV12316, undefined);
  assert.equal(typeof SimulationSession.prototype.strengthenCollectionV12325, 'function');
  assert.equal(typeof SimulationSession.prototype.advanceCollectionV12325, 'function');
});

test('V162 application API removes legacy Gacha methods without retiring live progression methods', () => {
  assert.equal(typeof LocalGameApplicationApi.prototype.gachaCollectionV12326, 'function');
  assert.equal(LocalGameApplicationApi.prototype.gachaCollectionV12325, undefined);
  assert.equal(LocalGameApplicationApi.prototype.gachaCollectionV12316, undefined);
  assert.equal(typeof LocalGameApplicationApi.prototype.strengthenCollectionV12325, 'function');
  assert.equal(typeof LocalGameApplicationApi.prototype.advanceCollectionV12325, 'function');
});

test('V162 production V12326 Gacha still spends the canonical Bound Jade wallet', () => {
  const registry = buildRegistry();
  const state = createPlayableAdventureState();
  state.realm.maxRealmOrder = 18;
  const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 16201, state);
  const game = new GameplayFacade(session, registry, thanhHaWorld);
  const api = createGameApplicationApi(game);
  assert.equal(typeof api.gachaCollectionV12326, 'function');
  assert.equal(api.gachaCollectionV12325, undefined);
  assert.equal(api.gachaCollectionV12316, undefined);
  const before = session.state.collectionV12316?.currencies?.boundImmortalJade ?? 1600;
  const result = api.gachaCollectionV12326('banner.artifact', 1, false);
  const after = session.state.collectionV12316.currencies.boundImmortalJade;
  assert.equal(result.cost, 160);
  assert.equal(before - after, 160);
});

test('V162 standalone transport keeps V12326 canonical and blocks both legacy Gacha actions', () => {
  const source = readFileSync(new URL('../../standalone-runtime.js', import.meta.url), 'utf8');
  assert(source.includes("case'collectionGachaV12326':result=rt.api.gachaCollectionV12326"));
  assert(source.includes("case'collectionGachaV12325':throw new Error"));
  assert(source.includes("case'collectionGachaV12316':throw new Error"));
});

test('V162 stable wrapper files are the only public import boundaries for Session and Game API', () => {
  const sessionBoundary = readFileSync(new URL('../../dist/core/session.js', import.meta.url), 'utf8');
  const apiBoundary = readFileSync(new URL('../../dist/core/game-api.js', import.meta.url), 'utf8');
  assert(sessionBoundary.includes("export * from './session-core.js'"));
  assert(apiBoundary.includes("export * from './game-api-core.js'"));
  assert(sessionBoundary.includes('collectionGachaV12316') && sessionBoundary.includes('collectionGachaV12325'));
  assert(apiBoundary.includes('gachaCollectionV12316') && apiBoundary.includes('gachaCollectionV12325'));
});

console.log(`\nV162 COLLECTION RUNTIME AUTHORITY: ${passed}/${passed} PASS`);
