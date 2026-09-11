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

test('V162 B1 internal Session keeps compatibility implementation while public Gameplay/API remove legacy Gacha authority', () => {
  assert.equal(typeof SimulationSession.prototype.collectionGachaV12326, 'function');
  assert.equal(typeof SimulationSession.prototype.collectionGachaV12325, 'function');
  assert.equal(typeof SimulationSession.prototype.collectionGachaV12316, 'function');
  assert.equal(typeof GameplayFacade.prototype.collectionGachaV12326, 'function');
  assert.equal(GameplayFacade.prototype.collectionGachaV12325, undefined);
  assert.equal(GameplayFacade.prototype.collectionGachaV12316, undefined);
  assert.equal(typeof LocalGameApplicationApi.prototype.gachaCollectionV12326, 'function');
  assert.equal(LocalGameApplicationApi.prototype.gachaCollectionV12325, undefined);
  assert.equal(LocalGameApplicationApi.prototype.gachaCollectionV12316, undefined);
});

test('V162 B2 establishes canonical V12326 progression methods without changing the locked V12325 engine', () => {
  for (const method of ['collectionStrengthenV12326','collectionAdvanceV12326','collectionEquipV12326','collectionUnequipV12326']) {
    assert.equal(typeof GameplayFacade.prototype[method], 'function', `${method} missing on GameplayFacade`);
  }
  for (const method of ['strengthenCollectionV12326','advanceCollectionV12326','equipCollectionV12326','unequipCollectionV12326']) {
    assert.equal(typeof LocalGameApplicationApi.prototype[method], 'function', `${method} missing on Game API`);
  }
  // Compatibility names remain temporarily because standalone/app transport has not migrated yet.
  for (const method of ['strengthenCollectionV12325','advanceCollectionV12325','equipCollectionV12325','unequipCollectionV12325']) {
    assert.equal(typeof LocalGameApplicationApi.prototype[method], 'function', `${method} compatibility shim missing`);
  }
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

test('V162 Game API has a stable public boundary separated from compatibility implementation', () => {
  const apiBoundary = readFileSync(new URL('../../dist/core/game-api.js', import.meta.url), 'utf8');
  assert(apiBoundary.includes("export * from './game-api-core.js'"));
  assert(apiBoundary.includes('gachaCollectionV12316') && apiBoundary.includes('gachaCollectionV12325'));
  assert(apiBoundary.includes('strengthenCollectionV12326') && apiBoundary.includes('strengthenCollectionV12325'));
});

console.log(`\nV162 COLLECTION RUNTIME AUTHORITY: ${passed}/${passed} PASS`);
