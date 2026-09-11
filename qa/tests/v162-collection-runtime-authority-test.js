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

test('V162 B2 establishes canonical V12326 collection progression methods', () => {
  for (const method of ['collectionStrengthenV12326','collectionAdvanceV12326','collectionEquipV12326','collectionUnequipV12326']) {
    assert.equal(typeof GameplayFacade.prototype[method], 'function', `${method} missing on GameplayFacade`);
  }
  for (const method of ['strengthenCollectionV12326','advanceCollectionV12326','equipCollectionV12326','unequipCollectionV12326']) {
    assert.equal(typeof LocalGameApplicationApi.prototype[method], 'function', `${method} missing on Game API`);
  }
});

test('V162 B3 V12325 progression names are compatibility shims routed through V12326 authority', () => {
  for (const [compatibility, canonical] of [
    ['collectionStrengthenV12325','collectionStrengthenV12326'],
    ['collectionAdvanceV12325','collectionAdvanceV12326'],
    ['collectionEquipV12325','collectionEquipV12326'],
    ['collectionUnequipV12325','collectionUnequipV12326'],
  ]) {
    assert(Object.prototype.hasOwnProperty.call(GameplayFacade.prototype, compatibility));
    assert(GameplayFacade.prototype[compatibility].toString().includes(`this.${canonical}`));
  }
  const apiBoundary = readFileSync(new URL('../../dist/core/game-api.js', import.meta.url), 'utf8');
  assert(apiBoundary.includes('return this[canonicalMethod](...args)'));
  assert(apiBoundary.includes("strengthenCollectionV12326: 'strengthenCollectionV12325'"));
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

test('V162 standalone transport keeps V12326 Gacha canonical and legacy Gacha actions blocked', () => {
  const source = readFileSync(new URL('../../standalone-runtime.js', import.meta.url), 'utf8');
  assert(source.includes("case'collectionGachaV12326':result=rt.api.gachaCollectionV12326"));
  assert(source.includes("case'collectionGachaV12325':throw new Error"));
  assert(source.includes("case'collectionGachaV12316':throw new Error"));
});

console.log(`\nV162 COLLECTION RUNTIME AUTHORITY: ${passed}/${passed} PASS`);
