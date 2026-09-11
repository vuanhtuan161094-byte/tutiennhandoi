import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { createGameApplicationApi } from '../../dist/core/game-api.js';
import { spiritBeastCombatTriggersV147 } from '../../dist/core/spirit-beast-v147.js';
import { confidantCombatTriggersV148 } from '../../dist/core/confidant-v87.js';

let passed=0;
const test=(name,fn)=>{fn();passed++;console.log(`✓ ${name}`);};
const registry=buildRegistry();
const state=createPlayableAdventureState();
state.realm.maxRealmOrder=22;
const session=new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,16402,state);
const game=new GameplayFacade(session,registry,thanhHaWorld);
const api=createGameApplicationApi(game);
const c=session.stateValue.collectionV12316;
c.items['pet.1']={owned:true,level:100,advance:5,stars:20,specificFragments:0,spiritBeastV147Migrated:true};
c.items['companion.1']={owned:true,level:100,advance:5,stars:20,specificFragments:0,confidantHeartV148:{assist:0,guard:0,harmony:0,raw:0}};
c.spiritBeastV147Migrated=true;c.confidantV148Migrated=true;
api.equipCollectionV12326('pet.1');
api.equipCollectionV12326('companion.1');

test('V164 B2 standalone transport enters Game API for live confidant mutation',()=>{
  const src=readFileSync(new URL('../../standalone-runtime.js',import.meta.url),'utf8');
  assert(src.includes("case'confidantHeartV148':result=rt.api.spendConfidantHeartV148"));
  assert(!src.includes('session.spendConfidantHeartPointV148'));
});

test('V164 B2 retired pet gear transport is non-authoritative and fails before mutation',()=>{
  const src=readFileSync(new URL('../../standalone-runtime.js',import.meta.url),'utf8');
  assert(src.includes("case'petGearUpgradeV12328':result=rt.api.upgradePetGearV12328"));
  const before=structuredClone(c.workshopV12328?.petGear??{}),idx=session.actionIndex;
  assert.throws(()=>api.upgradePetGearV12328('pet.1','claw'),/Trang Bị Linh Thú đã được hoàn nguyên/);
  assert.equal(session.actionIndex,idx);
  assert.deepEqual(c.workshopV12328?.petGear??{},before);
});

test('V164 B2 public Collection compatibility names cannot bypass canonical selectors',()=>{
  api.unequipCollectionV12325('pet.1');assert.equal(c.activePetId,undefined);
  api.equipCollectionV12316('pet.1');assert.equal(c.activePetId,'pet.1');
  api.unequipCollectionV12316('companion.1');assert.equal(c.activeCompanionId,undefined);
  api.equipCollectionV12325('companion.1');assert.equal(c.activeCompanionId,'companion.1');
});

test('V164 B3 production combat composes pet and confidant triggers exactly once',()=>{
  const pet=spiritBeastCombatTriggersV147(c);
  const confidant=confidantCombatTriggersV148(c);
  assert(pet.length>0&&confidant.length>0);
  const entity=session.personalCombatEntity();
  const petInEntity=entity.triggers.filter(x=>pet.some(p=>p.id===x.id));
  const confidantIds=new Set(confidant.map(x=>x.id));
  const confidantInEntity=entity.triggers.filter(x=>confidantIds.has(x.id));
  assert.equal(petInEntity.length,pet.length);
  assert.equal(confidantInEntity.length,confidant.length);
  assert.equal(new Set(petInEntity.map(x=>x.id)).size,pet.length);
  assert.equal(new Set(confidantInEntity.map(x=>x.id)).size,confidant.length);
});

test('V164 B3 Collection composition has one pet/confidant consumer boundary',()=>{
  const src=readFileSync(new URL('../../dist/core/collection-progression-v12316.js',import.meta.url),'utf8');
  assert(src.includes('...spiritBeastCombatTriggersV86(state), ...confidantCombatTriggersV148(state)'));
  assert(src.includes("'SpiritBeastV86', 'ConfidantV148'"));
  const v86=readFileSync(new URL('../../dist/core/spirit-beast-v86.js',import.meta.url),'utf8');
  assert(v86.includes('return spiritBeastCombatTriggersV147(compatStateV86(state))'));
});

console.log(`\nV164 PET / CONFIDANT TRANSPORT + COMBAT B2/B3: ${passed}/${passed} PASS`);
