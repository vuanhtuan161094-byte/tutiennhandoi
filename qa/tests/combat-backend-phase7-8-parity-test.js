import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import {
  playableMortalCultivator,
  lightningSwordCultivator,
  heavySwordCultivator,
  controlCultivator,
  fireCultivator,
  poisonCultivator,
  windSwordCultivator,
  blackWindWolf,
  blackWindWolfKing,
  thunderHornRhino,
} from '../../dist/content/entities.js';
import { battleDaoV2StarterPackage } from '../../dist/content/battle-dao-v2-catalog.js';
import { compareCombatKernelsV2V3 } from '../../dist/core/combat-parity-v3.js';
import { runCombatKernelV3, combatKernelMechanicsProjectionV3 } from '../../dist/core/combat-kernel-v3.js';

const registry = buildRegistry();
let passed = 0;
function test(name, fn) { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); }

function assertParity(label, entities, seed, maxDuration = 40, mode = 'headless') {
  const result = compareCombatKernelsV2V3({
    registry,
    seed,
    entities: structuredClone(entities),
    maxDuration,
    mode,
  });
  assert.equal(result.parity, true, `${label} V2/V3 drift: ${JSON.stringify(result.differences)}`);
  assert.equal(result.v3.engineVersion, 'combat.v3');
  assert.equal(result.v3.combatResult.engineVersion, 'combat.v3');
  assert.equal(result.v3.combatResult.replay.engineVersion, 'combat.v3');
  return result;
}

function daoEntity(dao, index) {
  const starter = battleDaoV2StarterPackage(dao);
  const entity = structuredClone(playableMortalCultivator);
  entity.id = `entity.qa.dao.${dao}`;
  entity.name = `QA ${dao}`;
  entity.combatModel = 'locked-v1';
  entity.stats = {
    ...entity.stats,
    maxHp: 5000 + index * 200,
    maxSpirit: 1000,
    spiritStandard: 1000,
    spiritRegenStandardPctPerSecond: 10,
    attack: 240 + index * 5,
    defense: 150,
    accuracy: 300,
    mobility: 110,
    resolve: 180,
    controlPower: 140,
    actionSpeed: 1.05,
  };
  entity.skillIds = [starter.activeSkillId, starter.basicSkillId, 'skill.basic_strike'];
  entity.aiProfile = {
    name: `QA ${dao} V2 rotation`,
    rules: [
      { skillId: starter.activeSkillId, priority: 100, conditions: [{ type: 'always' }] },
      { skillId: starter.basicSkillId, priority: 50, conditions: [{ type: 'always' }] },
      { skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] },
    ],
  };
  entity.combatBuildV117 = {
    battleDaoV2Enabled: true,
    mainDaoId: dao,
    learnedDaoPassiveIdsV118: [starter.passiveId],
    passiveLevelsV125: { [starter.passiveId]: 1 },
    skillPracticeTierV125: {},
    skillLevelsV12317: {},
    skillGradesV12317: {},
    rootUnlocked: {},
    rootEffectivenessPct: {},
    rootLevelsV133: {},
    activeRootOriginIdsV132: {},
    activeSetMechanics: [],
    skillRootBindingsV118: {},
    activeVariantIdsV118: [],
  };
  return entity;
}

test('Phase 8 ordinary archetype matrix preserves exact V2 mechanics', () => {
  const rows = [
    ['sword-heavy', lightningSwordCultivator, heavySwordCultivator],
    ['fire-control', fireCultivator, controlCultivator],
    ['poison-control', poisonCultivator, controlCultivator],
    ['wind-heavy', windSwordCultivator, heavySwordCultivator],
  ];
  rows.forEach(([id, a, b], index) => assertParity(id, [a, b], 78010 + index, 45));
});

test('Phase 8 Boss phase/counter preparation preserves exact V2 mechanics', () => {
  assertParity('wolf-king-boss', [lightningSwordCultivator, blackWindWolfKing], 78101, 70);
  assertParity('thunder-rhino-boss', [poisonCultivator, thunderHornRhino], 78102, 70);
});

test('Phase 8 hard-timeout edge remains identical', () => {
  const parity = assertParity('hard-timeout', [playableMortalCultivator, blackWindWolf], 78201, 0.001);
  assert.equal(parity.v2.battle.draw, true);
  assert.equal(parity.v3.battle.draw, true);
  assert(parity.v3.battle.duration <= 0.001 + 1e-9);
});

test('Phase 8 all eight Battle Dao identities preserve V2 mechanics', () => {
  const daos = ['sword', 'fist', 'body', 'spell', 'poison', 'artifact', 'formation', 'mind'];
  const enemy = {
    ...structuredClone(blackWindWolf),
    id: 'entity.qa.dao.target',
    combatModel: 'locked-v1',
    stats: {
      ...blackWindWolf.stats,
      maxHp: 9000,
      maxSpirit: 1000,
      spiritStandard: 1000,
      spiritRegenStandardPctPerSecond: 8,
      attack: 150,
      defense: 130,
      accuracy: 250,
      resolve: 200,
    },
  };
  daos.forEach((dao, index) => {
    const parity = assertParity(`dao-${dao}`, [daoEntity(dao, index), enemy], 78300 + index, 35);
    assert(
      parity.v3.combatResult.summary.castCountsByActor[`entity.qa.dao.${dao}`],
      `${dao} should produce typed cast counts`,
    );
  });
});

test('Phase 8 V3 remains deterministic independently of V2 comparison', () => {
  const input = {
    registry,
    seed: 78401,
    entities: structuredClone([lightningSwordCultivator, blackWindWolfKing]),
    maxDuration: 60,
    mode: 'headless',
  };
  const a = runCombatKernelV3({ ...input, entities: structuredClone(input.entities) });
  const b = runCombatKernelV3({ ...input, entities: structuredClone(input.entities) });
  assert.deepEqual(combatKernelMechanicsProjectionV3(a.battle), combatKernelMechanicsProjectionV3(b.battle));
  assert.deepEqual(a.combatResult.summary, b.combatResult.summary);
});

test('Phase 8 V3 preserves legacy authored semantics explicitly instead of silently upgrading them', () => {
  const result = runCombatKernelV3({
    registry,
    seed: 78402,
    entities: structuredClone([playableMortalCultivator, blackWindWolf]),
    maxDuration: 10,
    mode: 'headless',
  });
  assert.equal(result.compatibility.hasLegacyCombatModel, true);
  assert(result.compatibility.legacyCombatModelEntityIds.includes(playableMortalCultivator.id));
  assert(result.compatibility.legacyCombatModelEntityIds.includes(blackWindWolf.id));
});

test('Phase 8 V3 rejects unknown future combat models', () => {
  const bad = { ...structuredClone(playableMortalCultivator), combatModel: 'future-unknown' };
  assert.throws(
    () => runCombatKernelV3({ registry, seed: 78403, entities: [bad, structuredClone(blackWindWolf)], maxDuration: 10, mode: 'headless' }),
    /unsupported combatModel/,
  );
});

console.log(`\nCOMBAT BACKEND PHASE 7-8 PARITY: ${passed}/${passed} PASS`);
