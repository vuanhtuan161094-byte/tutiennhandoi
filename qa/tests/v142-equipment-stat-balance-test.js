import assert from 'node:assert/strict';
import { playableMortalCultivator } from '../../dist/content/entities.js';
import { enhancementBonusPct } from '../../dist/core/equipment.js';
import {
  EQUIPMENT_DAO_CHUYEN_GROWTH_V142,
  EQUIPMENT_MAJOR_REALM_GROWTH_V142,
  EQUIPMENT_REALM_NAMES_V142,
  EQUIPMENT_SANG_THE_INDEX_V142,
  EQUIPMENT_SANG_THE_POWER_MULTIPLIER_V142,
  EQUIPMENT_SLOTS_V142,
  equipmentBaseStatsForRankV142,
  equipmentRealmMultiplierV142,
} from '../../dist/core/equipment-v142.js';

function packageAt(rankIndex) {
  const total = {};
  for (const slot of EQUIPMENT_SLOTS_V142) {
    const stats = equipmentBaseStatsForRankV142(slot, rankIndex);
    for (const [key, value] of Object.entries(stats)) total[key] = (total[key] ?? 0) + value;
  }
  return total;
}
function enhancedPackageAt(rankIndex, enhancementLevel) {
  const multiplier = 1 + enhancementBonusPct(enhancementLevel) / 100;
  return Object.fromEntries(Object.entries(packageAt(rankIndex)).map(([key, value]) => [key, Math.round(value * multiplier)]));
}

assert.equal(EQUIPMENT_REALM_NAMES_V142.length, 29);
assert.equal(EQUIPMENT_SANG_THE_INDEX_V142, 28);
assert.ok(EQUIPMENT_MAJOR_REALM_GROWTH_V142 > 1.30 && EQUIPMENT_MAJOR_REALM_GROWTH_V142 < 1.33, `realm growth=${EQUIPMENT_MAJOR_REALM_GROWTH_V142}`);
assert.equal(equipmentRealmMultiplierV142(EQUIPMENT_SANG_THE_INDEX_V142), EQUIPMENT_SANG_THE_POWER_MULTIPLIER_V142);
assert.equal(EQUIPMENT_SANG_THE_POWER_MULTIPLIER_V142, 2160);
assert.equal(EQUIPMENT_DAO_CHUYEN_GROWTH_V142, 1.12);

let previousMultiplier = 0;
for (let rank = 0; rank <= EQUIPMENT_SANG_THE_INDEX_V142 + 25; rank++) {
  const multiplier = equipmentRealmMultiplierV142(rank);
  assert.ok(multiplier > previousMultiplier, `rank ${rank} multiplier must grow: ${previousMultiplier} -> ${multiplier}`);
  previousMultiplier = multiplier;
  for (const slot of EQUIPMENT_SLOTS_V142) {
    const stats = equipmentBaseStatsForRankV142(slot, rank);
    for (const [key, value] of Object.entries(stats)) {
      assert.ok(Number.isSafeInteger(value), `${slot} rank ${rank} ${key} must be an integer, got ${value}`);
      assert.ok(value > 0, `${slot} rank ${rank} ${key} must stay positive`);
    }
  }
}

const mortal = packageAt(0);
assert.deepEqual(mortal, {
  attack: 34,
  maxSpirit: 40,
  resolve: 15,
  maxHp: 250,
  defense: 20,
  accuracy: 6,
  mobility: 8,
  controlPower: 10,
});
// Fresh Phàm gear must matter without replacing the character itself.
assert.ok(mortal.attack / playableMortalCultivator.stats.attack >= .25 && mortal.attack / playableMortalCultivator.stats.attack <= .35);
assert.ok(mortal.maxHp / playableMortalCultivator.stats.maxHp >= .15 && mortal.maxHp / playableMortalCultivator.stats.maxHp <= .25);
assert.ok(mortal.defense / playableMortalCultivator.stats.defense >= .18 && mortal.defense / playableMortalCultivator.stats.defense <= .28);
assert.ok(mortal.maxSpirit / playableMortalCultivator.stats.maxSpirit >= .25 && mortal.maxSpirit / playableMortalCultivator.stats.maxSpirit <= .40);

const luyệnKhí = packageAt(1);
assert.deepEqual(luyệnKhí, {
  attack: 45,
  maxSpirit: 53,
  resolve: 20,
  maxHp: 329,
  defense: 26,
  accuracy: 8,
  mobility: 11,
  controlPower: 14,
});

const sángThế = packageAt(EQUIPMENT_SANG_THE_INDEX_V142);
assert.deepEqual(sángThế, {
  attack: 73_440,
  maxSpirit: 86_400,
  resolve: 32_400,
  maxHp: 540_000,
  defense: 43_200,
  accuracy: 12_960,
  mobility: 17_280,
  controlPower: 21_600,
});
const sángThế15 = enhancedPackageAt(EQUIPMENT_SANG_THE_INDEX_V142, 15);
assert.equal(sángThế15.attack, 165_240);
assert.equal(sángThế15.maxHp, 1_215_000);
assert.equal(sángThế15.defense, 97_200);
assert.equal(sángThế15.maxSpirit, 194_400);
// Regression guard: old x1.55^28 curve was ~99x above this endpoint and must never return.
assert.ok(Math.pow(1.55, EQUIPMENT_SANG_THE_INDEX_V142) / equipmentRealmMultiplierV142(EQUIPMENT_SANG_THE_INDEX_V142) > 90);

console.log('V142 equipment stat balance PASS');
