import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import {
  createChildForLife,
  createSocialState,
  normalizeSocialFamilyIdentityV175,
} from '../../dist/core/social.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); };

test('V175 B1 allocated child ID repairs a stale next-family serial', () => {
  const social = createSocialState();
  social.familyMembers.push({ id: 'family.child.life.v175.0' });
  social.familySerial = 0;
  normalizeSocialFamilyIdentityV175(social);
  assert.equal(social.familySerial, 1);
});

test('V175 B2 highest allocated child serial across lives is canonical authority', () => {
  const social = createSocialState();
  social.familyMembers.push(
    { id: 'family.child.life.alpha.2' },
    { id: 'family.child.life.beta.7' },
    { id: 'family.child.life.gamma.4' },
  );
  social.familySerial = 3;
  normalizeSocialFamilyIdentityV175(social);
  assert.equal(social.familySerial, 8);
});

test('V175 B3 legitimate higher next-family serial is never lowered', () => {
  const social = createSocialState();
  social.familyMembers.push({ id: 'family.child.life.v175.2' });
  social.familySerial = 9;
  normalizeSocialFamilyIdentityV175(social);
  assert.equal(social.familySerial, 9);
});

test('V175 B4 unrelated or malformed family IDs cannot forge serial authority', () => {
  const social = createSocialState();
  social.familyMembers.push(
    { id: 'family.life.v175.father' },
    { id: 'family.child.life.v175.not-a-number' },
    { id: 'family.child.life.v175.9007199254740991' },
  );
  social.familySerial = 4;
  normalizeSocialFamilyIdentityV175(social);
  assert.equal(social.familySerial, 4);
});

test('V175 B5 full restore repairs identity before the real child-ID consumer runs', () => {
  const registry = buildRegistry();
  const state = createPlayableAdventureState();
  const lifeId = 'life.v175.restore';
  const partner = { id: 'npc.v175.partner', potential: 72 };
  const first = createChildForLife(
    state.social,
    lifeId,
    partner,
    state.character,
    state.worldTimeYears,
    state.locationId,
    17501,
    68,
  );
  assert.equal(first.id, `family.child.${lifeId}.0`);
  assert.equal(state.social.familySerial, 1);

  const session = new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 17502, state);
  const save = session.snapshot();
  save.state.social.familySerial = 0;

  const restored = SimulationSession.restore(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, save);
  const restoredState = restored.snapshot().state;
  assert.equal(restoredState.social.familySerial, 1);

  const existingIds = new Set(restoredState.social.familyMembers.map(member => member.id));
  const second = createChildForLife(
    restoredState.social,
    lifeId,
    partner,
    restoredState.character,
    restoredState.worldTimeYears,
    restoredState.locationId,
    17503,
    68,
  );
  assert.equal(second.id, `family.child.${lifeId}.1`);
  assert.ok(!existingIds.has(second.id));
  assert.equal(new Set(restoredState.social.familyMembers.map(member => member.id)).size, restoredState.social.familyMembers.length);
});

console.log(`\nV175 SOCIAL FAMILY IDENTITY RUNTIME AUTHORITY: ${passed}/${passed} PASS`);
