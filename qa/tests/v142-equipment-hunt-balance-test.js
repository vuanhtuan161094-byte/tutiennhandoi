import assert from 'node:assert/strict';
import { playableMortalCultivator } from '../../dist/content/entities.js';
import { ENDLESS_HUNT_FLOOR_POWER_GROWTH } from '../../dist/content/endless-hunt.js';
import {
  HUNT_MAJOR_REALM_EQUIPMENT_SHARE_V142,
  huntMajorRealmPowerScaleV142,
  realmMapDefinitionForFloor,
} from '../../dist/content/realm-maps.js';
import { enhancementBonusPct } from '../../dist/core/equipment.js';
import {
  EQUIPMENT_SANG_THE_INDEX_V142,
  EQUIPMENT_SLOTS_V142,
  equipmentBaseStatsForRankV142,
} from '../../dist/core/equipment-v142.js';

function fullGearAttack(rankIndex, enhancementLevel = 15) {
  const enhance = 1 + enhancementBonusPct(enhancementLevel) / 100;
  let total = 0;
  for (const slot of EQUIPMENT_SLOTS_V142) {
    const attack = equipmentBaseStatsForRankV142(slot, rankIndex).attack;
    if (typeof attack === 'number') total += Math.round(attack * enhance);
  }
  return total;
}

assert.equal(ENDLESS_HUNT_FLOOR_POWER_GROWTH, 1.0005);
assert.equal(HUNT_MAJOR_REALM_EQUIPMENT_SHARE_V142, .45);
const intraFloorGrowth = Math.pow(ENDLESS_HUNT_FLOOR_POWER_GROWTH, 799);
assert.ok(intraFloorGrowth > 1.45 && intraFloorGrowth < 1.55, `1→800 raw floor growth=${intraFloorGrowth}`);

// With authored boss zone pressure .24 -> .55, a whole 800-floor major-realm map is ~3.4x,
// reachable through +15 + affixes + Set + other build systems rather than hundreds-fold inflation.
const firstMap = realmMapDefinitionForFloor(1);
const lastMap = realmMapDefinitionForFloor(800);
const sameRealmBossGrowth = intraFloorGrowth * lastMap.powerByGrade.boss / firstMap.powerByGrade.boss;
assert.ok(sameRealmBossGrowth > 3.2 && sameRealmBossGrowth < 3.6, `same-realm Boss growth=${sameRealmBossGrowth}`);

const baseAttack = playableMortalCultivator.stats.attack;
const firstRealmProxy = baseAttack + fullGearAttack(1, 15);
let previousMajorScale = 0;
for (let major = 1; major <= EQUIPMENT_SANG_THE_INDEX_V142; major++) {
  const scale = huntMajorRealmPowerScaleV142(major);
  assert.ok(scale > previousMajorScale, `Hunt major ${major} must be stronger than previous major`);
  previousMajorScale = scale;
  const map = realmMapDefinitionForFloor((major - 1) * 800 + 1);
  assert.ok(Math.abs(map.majorPowerScale - scale) < 1e-12, `map major scale drift at ${major}`);
  const playerProxyRatio = (baseAttack + fullGearAttack(major, 15)) / firstRealmProxy;
  const alignment = scale / playerProxyRatio;
  assert.ok(alignment >= .94 && alignment <= 1.01, `major ${major} Hunt/player alignment=${alignment}`);
}

// Sáng Thế floor 1 must no longer have Luyện-Khí-level enemies.
const sangTheScale = huntMajorRealmPowerScaleV142(28);
assert.ok(sangTheScale > 700 && sangTheScale < 800, `Sáng Thế major scale=${sangTheScale}`);
const sangTheFirst = realmMapDefinitionForFloor((28 - 1) * 800 + 1);
assert.ok(sangTheFirst.powerByGrade.boss / firstMap.powerByGrade.boss > 700);

console.log('V142 equipment-aligned Hunt balance PASS');
