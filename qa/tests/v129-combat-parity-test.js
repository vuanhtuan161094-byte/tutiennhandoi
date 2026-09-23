import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { SimulationSession } from '../../dist/core/session.js';
import { createEndlessHuntState } from '../../dist/core/endless-hunt.js';

let passed = 0;
function test(name, fn) { fn(); passed++; console.log(`✓ ${name}`); }

const registry = buildRegistry();
function makeSession(seed = 1293001) {
  const state = createPlayableAdventureState();
  return new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, seed, state);
}
function canonicalNoIdentity(entity) {
  const x = structuredClone(entity);
  delete x.id;
  delete x.name;
  return x;
}
function canonicalPowerPayload(entity) {
  return {
    tags: structuredClone(entity.tags ?? []),
    stats: structuredClone(entity.stats ?? {}),
    skillIds: structuredClone(entity.skillIds ?? []),
    triggers: structuredClone(entity.triggers ?? []),
    combatBuildV117: structuredClone(entity.combatBuildV117 ?? null),
    initialFiveElementsV117: structuredClone(entity.initialFiveElementsV117 ?? null),
    initialDaoStateV118: structuredClone(entity.initialDaoStateV118 ?? null),
    initialUltimateGaugeV117: entity.initialUltimateGaugeV117 ?? null,
    initialBattleDaoStateV2: structuredClone(entity.initialBattleDaoStateV2 ?? null),
  };
}

// Contract-level source audit. These are intentionally source-path checks: they guard against a future
// feature accidentally bypassing the canonical final player entity even when isolated unit tests stay green.
const sessionSource = fs.readFileSync(new URL('../../dist/core/session.js', import.meta.url), 'utf8');
const pvpSource = fs.readFileSync(new URL('../../dist/core/pvp-v91.js', import.meta.url), 'utf8');
function block(source, start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `missing source block ${start}`);
  return source.slice(a, b);
}

test('PvE live Hunt consumes the canonical final personal CombatEntity and CombatKernel V3', () => {
  const src = block(sessionSource, 'fightEndlessFloor(options = {})', 'equipmentCombatImpact(itemId)');
  assert(src.includes('this.personalCombatEntity()'), 'live Hunt must consume final personal entity');
  assert(src.includes('resolveEndlessHuntWithCombatKernelV3'), 'live Hunt must resolve through CombatKernel V3');
  assert(!src.includes('winnerByPowerScore'), 'live Hunt cannot declare winner from generic Power Score');
});

test('PvP join/defense/challenge all consume the same final personal CombatEntity', () => {
  for (const signature of ['joinPvpV91(nowUnixMs', 'refreshPvpDefenseV91(nowUnixMs', 'challengePvpV91(opponentId']) {
    const start = sessionSource.indexOf(signature);
    assert(start >= 0, `missing ${signature}`);
    const src = sessionSource.slice(start, start + 900);
    assert(src.includes('this.personalCombatEntity()'), `${signature} must consume final personal entity`);
  }
  assert(pvpSource.includes('runCompiledCombatEncounterV3(encounter, registry)'), 'new PvP challenge must use compiled CombatKernel V3');
});

test('PvP defense snapshot dynamically equals the final personal entity except snapshot identity', () => {
  const ss = makeSession(1293002);
  ss.stateValue.realm.maxRealmOrder = 18;
  const finalEntity = ss.personalCombatEntity();
  ss.joinPvpV91(1_800_000_000_000);
  const snap = ss.stateValue.pvpV91?.defenseSnapshot?.entity;
  assert(snap, 'PvP defense snapshot missing');
  assert.deepEqual(canonicalNoIdentity(snap), canonicalNoIdentity(finalEntity), 'PvP snapshot drifted from final personal CombatEntity');
});

test('PvP actual replay player dynamically preserves final build payload under balanced tactics', () => {
  const ss = makeSession(1293003);
  ss.stateValue.realm.maxRealmOrder = 18;
  const finalEntity = ss.personalCombatEntity();
  const now = 1_800_000_010_000;
  ss.joinPvpV91(now);
  const opponent = ss.pvpV91(now + 1).opponents.find(x => x.band === 'even');
  assert(opponent, 'missing PvP opponent');
  const result = ss.challengePvpV91(opponent.id, now + 2);
  const replay = ss.stateValue.pvpV91?.history?.find(x => x.fightId === result.fightId)?.replay?.playerEntity;
  assert(replay, 'missing PvP replay player entity');
  assert.deepEqual(canonicalPowerPayload(replay), canonicalPowerPayload(finalEntity), 'balanced PvP fight changed final personal power/build payload');
  assert.deepEqual(replay.aiProfile?.rules ?? [], finalEntity.aiProfile?.rules ?? [], 'balanced PvP tactics must not alter canonical AI rules');
  assert.equal(replay.pvpTacticalV93?.presetId, 'balanced', 'PvP replay must explicitly identify its tactical wrapper');
});

test('Offline/virtual Hunt derives TTK from one representative CombatKernel V3 fight and batches O(1)', () => {
  const src = block(sessionSource, 'resolveEndlessHuntFarmBatchV77(realSeconds', 'endlessHuntSummary()');
  assert(src.includes('const representativePlayer = this.personalCombatEntity()'), 'offline Hunt must use final personal entity');
  assert(src.includes('resolveEndlessHuntWithCombatKernelV3'), 'offline Hunt must sample CombatKernel V3');
  assert(src.includes('seconds / secondsPerKillV129'), 'offline kills must derive from representative CombatKernel TTK');
  assert(!/for\s*\([^)]*kills/.test(src), 'offline Hunt must not loop once per virtual kill');
});

test('Offline Hunt throughput dynamically responds to final CombatEntity strength through the representative kernel', () => {
  function prepared(seed) {
    const ss = makeSession(seed);
    ss.stateValue.realm.maxRealmOrder = 18;
    const hunt = ss.stateValue.endlessHunt = createEndlessHuntState();
    hunt.highestClearedByMajor['1'] = 1;
    hunt.highestClearedFloor = 1;
    hunt.highestUnlockedByMajor['1'] = 2;
    hunt.highestUnlockedFloor = 2;
    hunt.farmFloor = 1;
    hunt.selectedFloor = 2;
    return ss;
  }
  const base = prepared(1293004), boosted = prepared(1293004);
  // Make both synthetic seam entities safely capable of farming floor 1; only their relative
  // strength matters for this parity test, not the tutorial state's progression.
  const baseEntity = structuredClone(base.personalCombatEntity());
  baseEntity.stats.attack *= 100;
  baseEntity.stats.maxHp *= 50;
  baseEntity.stats.defense *= 50;
  baseEntity.stats.actionSpeed *= 2;
  const boostedEntity = structuredClone(baseEntity);
  boostedEntity.stats.attack *= 4;
  boostedEntity.stats.actionSpeed *= 1.5;
  // Override only the single canonical final-entity seam. If the offline resolver bypasses it,
  // the two batches will remain identical and this gate will fail.
  boosted.personalCombatEntity = () => structuredClone(boostedEntity);
  base.personalCombatEntity = () => structuredClone(baseEntity);
  const a = base.resolveEndlessHuntFarmBatchV77(3600);
  const b = boosted.resolveEndlessHuntFarmBatchV77(3600);
  assert(a.kills > 0, 'baseline representative farm should produce kills');
  assert(b.kills > a.kills, `stronger final CombatEntity must increase offline throughput (${a.kills} -> ${b.kills})`);
});

console.log(`\nV129 COMBAT PARITY — ${passed}/${passed} PASS`);
