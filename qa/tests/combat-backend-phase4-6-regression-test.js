import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../../dist/content/registry.js';
import { lightningSwordCultivator, heavySwordCultivator, playableMortalCultivator, blackWindWolf } from '../../dist/content/entities.js';
import { applyCombatPacingV124 } from '../../dist/core/combat-pacing-v124.js';
import { runCombatKernelV2, combatKernelMechanicsProjectionV2 } from '../../dist/core/combat-kernel-v2.js';
import { compileCombatEncounterV1, runCompiledCombatEncounterV2 } from '../../dist/core/combat-kernel-v2.js';
import {
  applyCombatSettlementPolicyV1,
  contentEventDefeatPolicyV1,
  daoSuyDefeatPolicyV1,
  dungeonDefeatPolicyV1,
  endlessHuntSettlementPolicyV1,
} from '../../dist/core/combat-kernel-v2.js';
import { buildCombatResultV1 } from '../../dist/core/combat-kernel-v2.js';
import { analyzeBattle } from '../../dist/core/combat-analytics.js';

const registry = buildRegistry();
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); };

test('Phase 4 compiled encounter preserves V2 mechanics when pacing is disabled', () => {
  const seed = 46001;
  const entities = structuredClone([lightningSwordCultivator, heavySwordCultivator]);
  const direct = runCombatKernelV2({ registry, seed, entities: structuredClone(entities), mode: 'headless', maxDuration: 40 });
  const encounter = compileCombatEncounterV1({
    encounterId: 'qa.phase4.no-pacing',
    activity: 'qa',
    seed,
    entities,
    mode: 'headless',
    maxDuration: 40,
    applyPacing: false,
  });
  const compiled = runCompiledCombatEncounterV2(encounter, registry);
  assert.deepEqual(
    combatKernelMechanicsProjectionV2(compiled.battle),
    combatKernelMechanicsProjectionV2(direct.battle),
  );
});

test('Phase 4 compiled encounter preserves V2 mechanics when pacing is explicitly enabled', () => {
  const seed = 46002;
  const entities = structuredClone([playableMortalCultivator, blackWindWolf]);
  const direct = runCombatKernelV2({
    registry,
    seed,
    entities: entities.map(entity => applyCombatPacingV124(structuredClone(entity))),
    mode: 'realtime',
    maxDuration: 30,
  });
  const encounter = compileCombatEncounterV1({
    encounterId: 'qa.phase4.paced',
    activity: 'qa',
    seed,
    entities,
    mode: 'realtime',
    maxDuration: 30,
    applyPacing: true,
  });
  const compiled = runCompiledCombatEncounterV2(encounter, registry);
  assert.deepEqual(
    combatKernelMechanicsProjectionV2(compiled.battle),
    combatKernelMechanicsProjectionV2(direct.battle),
  );
});

test('Phase 4 compiled result carries encounter identity for transport/replay consumers', () => {
  const encounter = compileCombatEncounterV1({
    encounterId: 'qa.phase4.identity',
    activity: 'qa-activity',
    seed: 46006,
    entities: structuredClone([playableMortalCultivator, blackWindWolf]),
    mode: 'headless',
    maxDuration: 12,
    applyPacing: false,
    metadata: { boss: false, source: 'qa' },
  });
  const kernel = runCompiledCombatEncounterV2(encounter, registry);
  assert.equal(kernel.combatResult.encounter.encounterId, 'qa.phase4.identity');
  assert.equal(kernel.combatResult.encounter.activity, 'qa-activity');
  assert.equal(kernel.combatResult.encounter.maxDuration, 12);
  assert.deepEqual(kernel.combatResult.encounter.metadata, { boss: false, source: 'qa' });
  assert.equal(kernel.combatResult.replay.encounterId, 'qa.phase4.identity');
  assert.equal(kernel.combatResult.replay.activity, 'qa-activity');
});

test('Phase 4 compiler clones encounter entities and metadata instead of mutating caller snapshots', () => {
  const player = structuredClone(playableMortalCultivator);
  const metadata = { nested: { value: 7 } };
  const encounter = compileCombatEncounterV1({
    seed: 46003,
    entities: [player, structuredClone(blackWindWolf)],
    metadata,
  });
  encounter.entities[0].stats.attack += 999;
  encounter.metadata.nested.value = 9;
  assert.notEqual(encounter.entities[0].stats.attack, player.stats.attack);
  assert.equal(player.stats.attack, playableMortalCultivator.stats.attack);
  assert.equal(metadata.nested.value, 7);
});

test('Phase 4 all active V2 activity boundaries use CombatEncounterCompiler instead of direct kernel calls', () => {
  for (const relative of [
    '../../dist/core/session.js',
    '../../dist/core/session-dungeon.js',
    '../../dist/core/pvp-v91.js',
    '../../dist/core/endless-hunt-combat-kernel-v2.js',
  ]) {
    const source = fs.readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');
    assert(source.includes('compileCombatEncounterV1'), `${relative} missing encounter compiler`);
    assert.equal(source.includes('runCombatKernelV2('), false, `${relative} still owns a direct V2 kernel launch`);
  }
});

test('Phase 5 settlement policies preserve existing injury semantics exactly', () => {
  const content = { injury: 10 };
  const contentSettlement = applyCombatSettlementPolicyV1({
    state: content,
    policy: contentEventDefeatPolicyV1('content:qa'),
    applyCanonicalDeathPenalty: context => {
      assert.equal(context, 'content:qa');
      const before = content.injury;
      content.injury = Math.min(100, content.injury + 15);
      return { applied: true, injuryBefore: before, injuryAfter: content.injury, lostYears: 0 };
    },
  });
  assert.equal(content.injury, 25);
  assert.equal(contentSettlement.directInjuryDelta, 0);

  const dungeon = { injury: 10 };
  const dungeonSettlement = applyCombatSettlementPolicyV1({
    state: dungeon,
    policy: dungeonDefeatPolicyV1('dungeon.qa', 3),
    applyCanonicalDeathPenalty: context => {
      assert.equal(context, 'dungeon:dungeon.qa:floor:3');
      const before = dungeon.injury;
      dungeon.injury = Math.min(100, dungeon.injury + 15);
      return { applied: true, injuryBefore: before, injuryAfter: dungeon.injury, lostYears: 0 };
    },
  });
  assert.equal(dungeonSettlement.directInjuryDelta, 20);
  assert.equal(dungeon.injury, 45, 'Dungeon keeps authored (14 + floor×2) then canonical +15');

  const huntLoss = { injury: 10 };
  applyCombatSettlementPolicyV1({
    state: huntLoss,
    policy: endlessHuntSettlementPolicyV1({ won: false, injuryGain: 7, fateInjuryDelta: 2 }),
  });
  assert.equal(huntLoss.injury, 19);

  const huntWin = { injury: 10 };
  applyCombatSettlementPolicyV1({
    state: huntWin,
    policy: endlessHuntSettlementPolicyV1({ won: true, injuryGain: 99, fateInjuryDelta: 3 }),
  });
  assert.equal(huntWin.injury, 13);

  const daoSuy = { injury: 10 };
  applyCombatSettlementPolicyV1({ state: daoSuy, policy: daoSuyDefeatPolicyV1() });
  assert.equal(daoSuy.injury, 28);
});

test('Phase 6 V2 kernel emits stable typed CombatResultV1 with actual cast counts and numeric combat data', () => {
  const kernel = runCombatKernelV2({
    registry,
    seed: 46004,
    entities: structuredClone([lightningSwordCultivator, heavySwordCultivator]),
    mode: 'headless',
    maxDuration: 18,
  });
  const result = kernel.combatResult;
  assert.equal(result.schema, 'combat-result.v1');
  assert.equal(result.engineVersion, 'combat.v2');
  assert.equal(result.replay.engineVersion, 'combat.v2');
  assert(result.events.some(event => event.type === 'battle.started'));
  assert(result.events.some(event => event.type === 'battle.ended'));
  assert(result.events.every(event => event.schema === 'combat-event.v1'));
  assert(result.events.every(event => ['CRITICAL', 'ACTION', 'DETAIL'].includes(event.importance)));

  const actorId = lightningSwordCultivator.id;
  const rawCastCounts = {};
  for (const log of kernel.battle.logs) {
    if (log.type === 'castStart' && log.actorId === actorId && log.skillId)
      rawCastCounts[log.skillId] = (rawCastCounts[log.skillId] ?? 0) + 1;
  }
  assert.deepEqual(result.summary.castCountsByActor[actorId] ?? {}, rawCastCounts);

  const analytics = analyzeBattle(kernel.battle);
  assert.equal(result.summary.damageByActor[actorId], analytics.combatants[actorId].damageDealt);
  assert.equal(result.summary.healingByActor[actorId], analytics.combatants[actorId].healingDone);

  const damage = result.events.find(event => event.type === 'damage.applied');
  assert(damage, 'expected at least one typed damage event');
  assert(Number.isFinite(Number(damage.data.damage)), 'damage event must carry numeric authority directly');
  assert(Number.isFinite(Number(damage.impactAt)), 'damage event must carry impact time directly');

  const cast = result.events.find(event => event.type === 'action.cast_started');
  assert(cast?.actionId, 'cast event requires deterministic action identity');
  assert(Number.isFinite(Number(cast.startedAt)));
  assert(Number.isFinite(Number(cast.resolvedAt)));
});

test('Phase 6 typed player-facing contract excludes retired Bảo Khí events', () => {
  const battle = {
    seed: 46005,
    duration: 1,
    winnerId: undefined,
    loserId: undefined,
    draw: true,
    finalState: {
      a: { hp: 10, spirit: 10, poise: 100, alive: true },
      b: { hp: 10, spirit: 10, poise: 100, alive: true },
    },
    logs: [
      { time: 0, type: 'battleStart', message: 'start' },
      {
        time: .5,
        type: 'resource',
        actorId: 'a',
        targetId: 'a',
        message: 'legacy bao qi',
        data: { artifactRuntime: 'artifact.v88', artifactEvent: 'baoQi', baoQi: 99, baoQiMax: 100 },
      },
      { time: 1, type: 'battleEnd', message: 'end' },
    ],
  };
  const result = buildCombatResultV1({ battle, registry, maxDuration: 1, engineVersion: 'combat.v2' });
  assert.equal(result.events.some(event => event.data?.artifactEvent === 'baoQi'), false);
  assert.equal(JSON.stringify(result).includes('baoQi'), false);
});

test('Phase 6 activity consumers expose typed result while compatibility battle/log surfaces remain available', () => {
  const dungeon = fs.readFileSync(fileURLToPath(new URL('../../dist/core/session-dungeon.js', import.meta.url)), 'utf8');
  const pvp = fs.readFileSync(fileURLToPath(new URL('../../dist/core/pvp-v91.js', import.meta.url)), 'utf8');
  const hunt = fs.readFileSync(fileURLToPath(new URL('../../dist/core/endless-hunt-combat-kernel-v2.js', import.meta.url)), 'utf8');
  const session = fs.readFileSync(fileURLToPath(new URL('../../dist/core/session.js', import.meta.url)), 'utf8');
  assert(dungeon.includes('combatResult: kernel.combatResult'));
  assert(dungeon.includes('combatSettlement'));
  assert(pvp.includes('combatResult: kernel.combatResult'));
  assert(hunt.includes('combatResult: kernel.combatResult'));
  assert.equal(hunt.includes('combatSettlement:'), false, 'Hunt kernel bridge must not own activity settlement');
  assert(session.includes('combatSettlement: huntSettlement'), 'Session must own Endless Hunt settlement after V3 cutover');
  assert(session.includes('combatSettlement, chronicleEvent'));
  assert(session.includes('combatResult: kernel.combatResult, combatSettlement'));
  assert(pvp.includes("engineVersion: 'combat.v3'"), 'new PvP replay records must be engine-versioned as V3');
});

console.log(`\nCOMBAT BACKEND PHASE 4-6 REGRESSION: ${passed}/${passed} PASS`);
