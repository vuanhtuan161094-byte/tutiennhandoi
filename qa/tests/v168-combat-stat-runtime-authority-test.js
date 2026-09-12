import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { createGameApplicationApi } from '../../dist/core/game-api.js';
import { combatMaxHp } from '../../dist/core/combat-rules.js';
import { applyAlchemyStatBonuses, alchemyPillResourceId, ensureAlchemyV112State } from '../../dist/core/alchemy-v112.js';
import { characterStatSourceStagesV129, cloneCharacterSystemState } from '../../dist/core/character.js';
import { integrationSummary } from '../../dist/core/integration.js';
import {
  normalizeCanonicalAlchemyInventoryAfterRestore,
  normalizeCanonicalEquipmentAfterRestore,
  normalizeCanonicalSkillHeartAfterRestore,
} from '../../dist/core/session-restore.js';
import { repairAdventureStateReferences } from '../../dist/core/save-stability.js';
import { ARTIFACTS_V88, RELICS_V88 } from '../../dist/core/artifact-v88.js';

const registry = buildRegistry();
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); };
const approx = (a, b, label = '') => assert(Math.abs(Number(a) - Number(b)) < 1e-5, `${label}: ${a} != ${b}`);
const newSession = (seed = 16801) => new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, seed, createPlayableAdventureState());
const stat = (summary, key) => summary.statProvenance.stats.find(x => x.key === key);

test('V168 B1 provenance covers every live combat stat family required by the authority audit', () => {
  const s = newSession();
  const rows = new Set(s.personalPowerSummary().statProvenance.stats.map(x => x.key));
  for (const key of [
    'attack', 'maxHp', 'defense', 'maxSpirit',
    'critChancePct', 'critDamagePct', 'armorPenPct', 'dodgeChancePct',
    'mobility', 'accuracy', 'controlPower', 'resolve', 'controlDurationReductionPct',
    'damageReductionPct', 'spiritEfficiencyPct', 'actionSpeed', 'breakEffectPct',
  ]) assert(rows.has(key), `missing V168 provenance stat: ${key}`);
});

test('V168 B3 HP authority distinguishes canonical materialized HP from legacy compatibility maxHp', () => {
  const legacy = { physique: 100, maxHp: 2600, combatHpMultiplierV124: 1.2 };
  assert.equal(combatMaxHp(legacy), 2400, 'unmarked legacy/synthetic entity must keep physique×20 authority');
  const materialized = { ...legacy, maxHpAuthorityV168: 'materialized' };
  assert.equal(combatMaxHp(materialized), 3120, 'canonical materialized raw/% HP must survive and receive the combat multiplier once');

  const entity = { stats: { attack: 10, defense: 10, physique: 100, maxHp: 2600, maxHpAuthorityV168: 'materialized', maxSpirit: 100 } };
  const unchanged = applyAlchemyStatBonuses(entity, { power: 0, body: 0, defense: 0 }, { power: 0, body: 0, defense: 0 });
  assert.equal(unchanged.stats.physique, 100);
  assert.equal(unchanged.stats.maxHp, 2600, 'zero-pill pass must not erase canonical raw/% HP from earlier sources');
  assert.equal(unchanged.stats.maxHpAuthorityV168, 'materialized');

  const bodyFive = applyAlchemyStatBonuses(entity, { power: 0, body: 5, defense: 0 }, { power: 0, body: 0, defense: 0 });
  assert.equal(bodyFive.stats.physique, 105);
  assert.equal(bodyFive.stats.maxHp, 2700, '+5 body must add exactly 100 HP without re-adding the existing body lane');
  assert.equal(combatMaxHp(bodyFive.stats), 2700);
});

test('V168 B1 character provenance replays the exact non-commutative runtime order', () => {
  const s = newSession();
  s.stateValue.character.corePotential.life.allocations = { power: 7, body: 5, defense: 3 };
  s.stateValue.character.spiritualRootV145.level = 101;
  s.stateValue.character.spiritualRootV145.ascensions = 1;
  const stages = characterStatSourceStagesV129(
    playablePlayerProfile.combatEntity,
    cloneCharacterSystemState(s.stateValue.character),
    registry,
  );
  const ids = stages.map(x => x.id);
  assert(ids.indexOf('character.physique') < ids.indexOf('character.potential'));
  assert(ids.indexOf('character.potential') < ids.indexOf('character.dao_nature'));
  assert(ids.indexOf('character.dao_nature') < ids.indexOf('character.spiritual_root_v145'), 'V145 Linh Căn must run after Potential/Fate/Đạo Tính exactly like applyCharacterToEntity');
  assert(ids.indexOf('character.spiritual_root_v145') < ids.indexOf('character.heart_methods'));
});

test('V168 B4 stale legacy ArtifactState cannot become a second Integration combat source', () => {
  const realm = { maxRealmOrder: 34 };
  const soul = { strength: 320, purity: 100, stability: 100 };
  const dao = { mainDaoId: undefined, known: {}, domain: { active: false } };
  const empty = integrationSummary(realm, 0, soul, dao, { activeIds: [], items: [] });
  const tampered = integrationSummary(realm, 0, soul, dao, {
    activeIds: ['legacy.overpowered'],
    items: [{ id: 'legacy.overpowered', nourishmentStage: 999, history: { cultivatedYears: 999999 }, spirit: { state: 'SacredSpirit' } }],
  });
  assert.deepEqual(tampered, empty, 'legacy ArtifactState must be compatibility/history only');
  assert.equal(tampered.artifact, 52, 'Integration keeps its historical no-active-artifact baseline; Collection owns canonical artifact power');
});

test('V168 B4 restore barrier sanitizes retired lanes, duplicate passives, old pills and duplicate/dangling loadout references', () => {
  const state = createPlayableAdventureState();
  state.equipment.items.push({
    id: 'v168.tampered.v142', schema: 'equipment.v142', enhancementLevel: 999, tier: 99,
    grade: 'breaker', quality: 'perfect', traitIds: ['trait.fake'], daoInscription: { id: 'dao.fake' },
    gemSockets: [{ element: 'fire', level: 99 }], setId: 'set.v116.attire.taibach_canhkim', setResonanceLevelV143: 999,
  });
  normalizeCanonicalEquipmentAfterRestore(state);
  const sanitized = state.equipment.items.at(-1);
  assert.equal(sanitized.enhancementLevel, 15);
  assert.equal(sanitized.tier, 0);
  assert.equal(sanitized.grade, 'mundane');
  assert.deepEqual(sanitized.traitIds, []);
  assert.equal(sanitized.daoInscription, undefined);
  assert.deepEqual(sanitized.gemSockets, []);
  assert.equal(sanitized.setId, undefined);

  state.character.buildFoundation.learnedDaoPassiveIdsV118 = ['passive.fake.v168', 'passive.fake.v168'];
  normalizeCanonicalSkillHeartAfterRestore(state);
  assert.deepEqual(state.character.buildFoundation.learnedDaoPassiveIdsV118, []);

  const oldPill = alchemyPillResourceId('daoPower', 8, 'supreme');
  state.inventory[oldPill] = 4;
  normalizeCanonicalAlchemyInventoryAfterRestore(state);
  assert.equal(state.inventory[oldPill], undefined);
  assert.equal(state.inventory['resource.pill.alchemy.v146.lifePower.m25.supreme'], 4);

  state.artifacts.items = [{ id: 'legacy.v168' }];
  state.artifacts.activeCapacity = 1;
  state.artifacts.activeIds = ['legacy.v168', 'legacy.v168', 'missing.legacy'];
  state.character.knownSkillIds = ['skill.basic_strike', 'skill.basic_strike', 'skill.missing.v168'];
  state.character.activeSkillIds = ['skill.basic_strike', 'skill.basic_strike', 'skill.missing.v168'];
  state.character.savedCombatLoadouts = [{
    id: 'loadout.v168', name: 'V168', skillIds: ['skill.basic_strike', 'skill.basic_strike', 'skill.missing.v168'],
    artifactIds: ['legacy.v168', 'legacy.v168', 'missing.legacy'],
    legacyArtifactIds: ['legacy.v168', 'legacy.v168', 'missing.legacy'],
    equipmentIds: { weapon: 'missing.equipment' },
  }];
  repairAdventureStateReferences(state, thanhHaWorld, registry);
  assert.deepEqual(state.artifacts.activeIds, ['legacy.v168']);
  assert.deepEqual(state.character.knownSkillIds, ['skill.basic_strike']);
  assert.deepEqual(state.character.activeSkillIds, ['skill.basic_strike']);
  assert.deepEqual(state.character.savedCombatLoadouts[0].skillIds, ['skill.basic_strike']);
  assert.deepEqual(state.character.savedCombatLoadouts[0].legacyArtifactIds, ['legacy.v168']);
  assert.deepEqual(state.character.savedCombatLoadouts[0].equipmentIds, {});
});

test('V168 B2/B3 Collection raw HP survives the whole final combat pipeline instead of being erased by Alchemy', () => {
  const s = newSession(16802);
  const game = new GameplayFacade(s, registry, thanhHaWorld);
  const api = createGameApplicationApi(game);
  const collection = s.stateValue.collectionV12316;
  collection.items['pet.1'] = { owned: true, level: 100, advance: 5, stars: 20, specificFragments: 0, spiritBeastV147Migrated: true };
  collection.activePetId = 'pet.1';
  collection.spiritBeastV147Migrated = true;
  const power = api.getPersonalPower();
  const hp = stat(power, 'maxHp');
  const entity = s.personalCombatEntity();
  assert.equal(entity.stats.maxHpAuthorityV168, 'materialized', 'production player combat must carry the explicit HP authority marker');
  assert(hp.sources.some(x => x.id === 'collection.pet'), 'pet raw/% HP must be observable at the final HP authority');
  approx(hp.finalValue, combatMaxHp(entity.stats), 'pet HP provenance vs combat');
});

test('V168 B5 full build parity: source breakdown = sheet = public API = final CombatEntity with no duplicate source stage', () => {
  const s = newSession(16803);
  s.stateValue.realm.maxRealmOrder = 22;
  s.stateValue.character.corePotential.life.allocations = { power: 9, body: 7, defense: 5 };
  s.stateValue.character.corePotential.permanent = { power: 3, body: 2, defense: 4 };
  s.stateValue.character.spiritualRootV145.level = 201;
  s.stateValue.character.spiritualRootV145.ascensions = 2;

  const item = {
    id: 'equipment.v168.fullbuild', templateId: 'equipment.v168.fullbuild', name: 'V168 Full Build', slot: 'weapon',
    tier: 1, quality: 'high', grade: 'heaven', enhancementLevel: 0, traitIds: [], affixes: [], reforgeCount: 0,
    gemSockets: [null, null], itemLevel: 100,
    stats: { attack: 100, maxHp: 600, defense: 50, accuracy: 20, controlPower: 10 }, tags: [],
    daoInscription: { id: 'dao.v128.heavenly_craft' }, source: { kind: 'test', seed: 168 }, acquiredWorldYear: 0,
  };
  s.stateValue.equipment.items = [item];
  s.stateValue.equipment.equipped.weapon = item.id;

  const game = new GameplayFacade(s, registry, thanhHaWorld);
  const api = createGameApplicationApi(game);
  api.devGrantCollectionV12326();
  const artifact = ARTIFACTS_V88[0];
  const relic = RELICS_V88[0];
  assert(artifact && relic);
  api.equipCollectionV12326(artifact.id, 0);
  api.equipCollectionV12326(relic.id);
  api.equipCollectionV12326('pet.1');
  api.equipCollectionV12326('companion.1');

  const alchemy = ensureAlchemyV112State(s.stateValue.economy);
  alchemy.life.lifeStatBonus = { power: 3, body: 4, defense: 2 };

  const sheet = s.personalPowerSummary();
  const facade = game.personalPower();
  const publicApi = api.getPersonalPower();
  const entity = s.personalCombatEntity();
  assert.deepEqual(publicApi.statProvenance, facade.statProvenance, 'public API and UI-facing facade must expose one stat breakdown');

  const pipeline = new Set(sheet.sources.map(x => x.id));
  for (const id of ['character', 'equipment', 'collection', 'artifact_talent', 'dao', 'integration', 'great_vehicle', 'immortal', 'reincarnation_talents', 'birth_roll', 'alchemy'])
    assert(pipeline.has(id), `missing final combat stage: ${id}`);

  const keys = [
    'attack', 'maxHp', 'defense', 'maxSpirit', 'critChancePct', 'critDamagePct', 'armorPenPct',
    'dodgeChancePct', 'accuracy', 'controlPower', 'resolve', 'controlDurationReductionPct', 'actionSpeed',
  ];
  for (const key of keys) {
    const combatValue = key === 'maxHp' ? combatMaxHp(entity.stats) : (Number(entity.stats[key]) || 0);
    const sheetRow = stat(sheet, key);
    const apiRow = stat(publicApi, key);
    assert(sheetRow, `missing sheet row ${key}`);
    assert(apiRow, `missing API row ${key}`);
    approx(sheetRow.finalValue, combatValue, `sheet ${key}`);
    approx(apiRow.finalValue, combatValue, `api ${key}`);
    const ids = sheetRow.sources.map(x => x.id);
    assert.equal(new Set(ids).size, ids.length, `${key} contains a duplicate stat source stage`);
  }
});

console.log(`\nV168 COMBAT / STAT RUNTIME AUTHORITY: ${passed}/${passed} PASS`);
