import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../../dist/content/registry.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { SimulationSession } from '../../dist/core/session.js';

const registry = buildRegistry();
let passed = 0;
function test(name, fn) { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); }
function source(relative) {
  return fs.readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');
}
function makeSession(seed = 79001) {
  const state = createPlayableAdventureState();
  state.realm.maxRealmOrder = 18;
  return new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, seed, state);
}

test('Phase 9 production Session consumers are cut to V3 boundaries', () => {
  const session = source('../../dist/core/session.js');
  assert(session.includes("from './endless-hunt-combat-kernel-v2.js'"));
  assert(session.includes('resolveEndlessHuntWithCombatKernelV3'));
  assert(session.includes('runCompiledCombatEncounterV3'));
  assert.equal(session.includes('runCompiledCombatEncounterV2'), false);
  assert.equal(session.includes('resolveEndlessHuntWithCombatKernelV2'), false);

  const dungeon = source('../../dist/core/session-dungeon.js');
  assert(dungeon.includes('runCompiledCombatEncounterV3'));
  assert.equal(dungeon.includes('runCompiledCombatEncounterV2'), false);
});

test('Phase 9 PvP new fights use V3 while replay retains explicit V2 compatibility', () => {
  const pvp = source('../../dist/core/pvp-v91.js');
  const challengeStart = pvp.indexOf('export function challengePvpV91');
  const replayStart = pvp.indexOf('export function replayPvpV91');
  assert(challengeStart >= 0 && replayStart > challengeStart);
  const challenge = pvp.slice(challengeStart, replayStart);
  const replay = pvp.slice(replayStart);
  assert(challenge.includes('runCompiledCombatEncounterV3(encounter, registry)'));
  assert(challenge.includes("engineVersion: 'combat.v3'"));
  assert.equal(challenge.includes('runCompiledCombatEncounterV2'), false);
  assert(replay.includes("engineVersion === 'combat.v3'"));
  assert(replay.includes('runCompiledCombatEncounterV3'));
  assert(replay.includes('runCompiledCombatEncounterV2'));
  assert(replay.includes("replay.engineVersion ?? 'combat.v2'"));
});

test('Phase 9 new PvP replay is V3 and historical V2 replay remains deterministic', () => {
  const session = makeSession(79002);
  const now = 1_900_000_000_000;
  session.joinPvpV91(now);
  const opponent = session.pvpV91(now + 1).opponents.find(row => row.band === 'even');
  assert(opponent, 'missing deterministic PvP opponent');

  const fight = session.challengePvpV91(opponent.id, now + 2);
  assert.equal(fight.combatResult.engineVersion, 'combat.v3');
  assert.equal(fight.combatResult.encounter.activity, 'pvp');

  const stored = session.stateValue.pvpV91.history.find(row => row.fightId === fight.fightId);
  assert(stored?.replay, 'missing PvP replay payload');
  assert.equal(stored.replay.engineVersion, 'combat.v3');

  const currentReplay = session.replayPvpV91(fight.fightId);
  assert.equal(currentReplay.verified, true);
  assert.equal(currentReplay.source, 'CombatKernelV3');
  assert.equal(currentReplay.engineVersion, 'combat.v3');

  // Engine version is deliberately outside the integrity fingerprint so old
  // historical entries that predate this field continue to replay as V2.
  stored.replay.engineVersion = 'combat.v2';
  const legacyReplay = session.replayPvpV91(fight.fightId);
  assert.equal(legacyReplay.verified, true);
  assert.equal(legacyReplay.source, 'CombatKernelV2');
  assert.equal(legacyReplay.engineVersion, 'combat.v2');
});

test('Phase 9 V2 remains compatibility/parity code, not the production Session authority', () => {
  const compiler = source('../../dist/core/combat-v3-runtime.js');
  const parity = source('../../dist/core/combat-parity-v3.js');
  const v2 = source('../../dist/core/combat-kernel-v2.js');
  assert(compiler.includes('runCompiledCombatEncounterV2'));
  assert(compiler.includes('runCompiledCombatEncounterV3'));
  assert(parity.includes('runCombatKernelV2'));
  assert(parity.includes('runCombatKernelV3'));
  assert(v2.includes('CombatKernelV2'));
});

console.log(`\nCOMBAT BACKEND PHASE 9 CUTOVER: ${passed}/${passed} PASS`);
