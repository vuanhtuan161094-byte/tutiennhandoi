import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { applyCharacterToEntity, createCharacterSystemState } from '../../dist/core/character.js';
import { ROOT_ORIGIN_IDS_V113 } from '../../dist/core/build-foundation-v113.js';
import { cloneSpiritualRootStateV145, createSpiritualRootStateV145 } from '../../dist/core/spiritual-root-v145.js';

const registry = buildRegistry();

function baseEntity() {
  return {
    id: 'v145.authority.guard',
    combatModel: 'locked-v1',
    name: 'V145 Authority Guard',
    tags: ['Human', 'Cultivator', 'BalanceSimV145'],
    stats: {
      maxHp: 2000,
      physique: 100,
      maxSpirit: 1000,
      spiritStandard: 1000,
      spiritRegenStandardPctPerSecond: 3,
      attack: 100,
      defense: 100,
      mobility: 100,
      accuracy: 100,
      critChancePct: 5,
      critPowerPerLayer: .5,
      heartChancePct: 0,
      dodgeChancePct: 0,
      controlPower: 100,
      resolve: 100,
      actionSpeed: 1,
      elementalAffinities: {},
      elementalResistancesPct: {},
      dominantElement: 'Metal',
    },
    skillIds: [],
    aiProfile: { name: 'idle', rules: [] },
  };
}

function state() {
  const s = createCharacterSystemState('root.mixed', 'technique.v119.inner.hunyuan', [], []);
  s.spiritualRootV145 = createSpiritualRootStateV145();
  s.activeSkillIds = [];
  s.knownSkillIds = [];
  return s;
}

function materialize(s) {
  return applyCharacterToEntity(baseEntity(), s, registry, 1, true);
}

const baselineState = state();
const baseline = materialize(baselineState);

const legacyState = state();
for (const root of ['metal', 'wood', 'water', 'fire', 'earth']) {
  legacyState.buildFoundation.roots[root].unlocked = true;
  legacyState.buildFoundation.roots[root].level = 600;
  legacyState.buildFoundation.roots[root].activeOriginId = ROOT_ORIGIN_IDS_V113[root][5];
}
const legacyInjected = materialize(legacyState);

assert.deepEqual(
  legacyInjected.stats,
  baseline.stats,
  'V145 canonical character stats must ignore legacy five-root levels and V132 active origins',
);
assert.deepEqual(
  legacyInjected.combatBuildV117?.skillRootBindingsV118,
  {},
  'V145 canonical character entity must expose no legacy skill-root bindings',
);
assert.equal(
  legacyInjected.combatBuildV117?.activeRootOriginIdsV132,
  undefined,
  'V145 canonical character entity must not expose V132 root-origin combat authority',
);
assert.equal(
  legacyState.buildFoundation.roots.metal.activeOriginId,
  ROOT_ORIGIN_IDS_V113.metal[5],
  'legacy root-origin metadata remains preserved for save compatibility even while inert',
);

const liveV145State = state();
liveV145State.spiritualRootV145 = cloneSpiritualRootStateV145({
  ...liveV145State.spiritualRootV145,
  level: 301,
  ascensions: 3,
  meridianPointsSpent: { gathering: 0, battle: 2, body: 1, spirit: 0 },
  insightRanks: { attack: 1 },
  insightChoices: ['attack'],
});
const liveV145 = materialize(liveV145State);
assert.ok(
  liveV145.stats.attack > baseline.stats.attack,
  'positive control: live V145 Linh Căn progression must still increase canonical combat stats',
);

console.log('V145 Spiritual Root authority guard PASS');
