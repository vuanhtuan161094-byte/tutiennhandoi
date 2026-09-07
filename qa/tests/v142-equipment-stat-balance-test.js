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
  EQUIPMENT_UTILITY_DAO_CHUYEN_GROWTH_V142,
  EQUIPMENT_UTILITY_MAJOR_STEP_V142,
  equipmentBaseStatsForRankV142,
  equipmentRealmMultiplierV142,
  equipmentUtilityRealmMultiplierV142,
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
assert.equal(EQUIPMENT_MAJOR_REALM_GROWTH_V142, 3, 'Raw core phải x3 mỗi đại cảnh để khớp ladder 3->1.');
assert.equal(EQUIPMENT_SANG_THE_POWER_MULTIPLIER_V142, 3 ** 28);
assert.equal(equipmentRealmMultiplierV142(EQUIPMENT_SANG_THE_INDEX_V142), EQUIPMENT_SANG_THE_POWER_MULTIPLIER_V142);
assert.equal(EQUIPMENT_DAO_CHUYEN_GROWTH_V142, 1.25);
assert.equal(EQUIPMENT_UTILITY_MAJOR_STEP_V142, .25);
assert.equal(EQUIPMENT_UTILITY_DAO_CHUYEN_GROWTH_V142, 1.04);
assert.equal(equipmentUtilityRealmMultiplierV142(EQUIPMENT_SANG_THE_INDEX_V142), 8);

let previousCore = 0;
let previousUtility = 0;
for (let rank = 0; rank <= EQUIPMENT_SANG_THE_INDEX_V142 + 25; rank++) {
  const core = equipmentRealmMultiplierV142(rank);
  const utility = equipmentUtilityRealmMultiplierV142(rank);
  assert.ok(core > previousCore, `rank ${rank} core multiplier must grow: ${previousCore} -> ${core}`);
  assert.ok(utility > previousUtility, `rank ${rank} utility multiplier must grow: ${previousUtility} -> ${utility}`);
  previousCore = core;
  previousUtility = utility;
  for (const slot of EQUIPMENT_SLOTS_V142) {
    const stats = equipmentBaseStatsForRankV142(slot, rank);
    for (const [key, value] of Object.entries(stats)) {
      assert.ok(Number.isFinite(value), `${slot} rank ${rank} ${key} must stay finite, got ${value}`);
      assert.ok(Number.isInteger(value), `${slot} rank ${rank} ${key} must display as an integer, got ${value}`);
      assert.ok(value > 0, `${slot} rank ${rank} ${key} must stay positive`);
    }
  }
}

const mortal = packageAt(0);
assert.deepEqual(mortal, {
  attack: 40,
  maxSpirit: 8,
  defense: 30,
  resolve: 7,
  maxHp: 300,
  accuracy: 4,
  mobility: 5,
  controlPower: 6,
});
// Phàm gear is meaningful raw power, while Chân Nguyên remains a small resource supplement.
assert.ok(mortal.attack / playableMortalCultivator.stats.attack >= .30 && mortal.attack / playableMortalCultivator.stats.attack <= .40);
assert.ok(mortal.maxHp / playableMortalCultivator.stats.maxHp >= .20 && mortal.maxHp / playableMortalCultivator.stats.maxHp <= .30);
assert.ok(mortal.defense / playableMortalCultivator.stats.defense >= .25 && mortal.defense / playableMortalCultivator.stats.defense <= .40);
assert.ok(mortal.maxSpirit / playableMortalCultivator.stats.maxSpirit < .10, 'Trang bị Phàm không được bơm Chân Nguyên quá mạnh.');

const luyệnKhí = packageAt(1);
assert.deepEqual(luyệnKhí, {
  attack: 120,
  maxSpirit: 11,
  defense: 90,
  resolve: 10,
  maxHp: 900,
  accuracy: 5,
  mobility: 6,
  controlPower: 8,
});
assert.equal(luyệnKhí.attack, mortal.attack * 3);
assert.equal(luyệnKhí.maxHp, mortal.maxHp * 3);
assert.equal(luyệnKhí.defense, mortal.defense * 3);
assert.ok(luyệnKhí.maxSpirit < mortal.maxSpirit * 1.5, 'Chân Nguyên không được chạy theo raw x3.');

const sángThế = packageAt(EQUIPMENT_SANG_THE_INDEX_V142);
assert.deepEqual(sángThế, {
  attack: 915_071_698_198_440,
  maxSpirit: 64,
  defense: 686_303_773_648_830,
  resolve: 56,
  maxHp: 6_863_037_736_488_300,
  accuracy: 32,
  mobility: 40,
  controlPower: 48,
});
assert.ok(sángThế.attack > 1e14, `Sáng Thế phải có raw Công cỡ endgame private-server, got ${sángThế.attack}`);
assert.ok(sángThế.maxHp > 1e15);
assert.ok(sángThế.defense > 1e14);
assert.ok(sángThế.maxSpirit <= 64, `Chân Nguyên Sáng Thế chỉ scale chậm, got ${sángThế.maxSpirit}`);

const sángThế15 = enhancedPackageAt(EQUIPMENT_SANG_THE_INDEX_V142, 15);
assert.ok(sángThế15.attack > 2e15, `Sáng Thế +15 Công=${sángThế15.attack}`);
assert.ok(sángThế15.maxHp > 1.5e16, `Sáng Thế +15 HP=${sángThế15.maxHp}`);
assert.ok(sángThế15.defense > 1.5e15, `Sáng Thế +15 Phòng=${sángThế15.defense}`);
assert.equal(sángThế15.maxSpirit, 144, 'Ngay cả +15, Chân Nguyên không được nổ theo raw core.');

// 3 món cùng bậc -> 1 món bậc mới và raw stat x3: material value and combat value use one intuitive ladder.
for (let rank = 0; rank < EQUIPMENT_SANG_THE_INDEX_V142; rank++) {
  const a = packageAt(rank), b = packageAt(rank + 1);
  assert.equal(b.attack, a.attack * 3, `attack rank ${rank}->${rank + 1}`);
  assert.equal(b.maxHp, a.maxHp * 3, `HP rank ${rank}->${rank + 1}`);
  assert.equal(b.defense, a.defense * 3, `def rank ${rank}->${rank + 1}`);
}
// Previous-rank +15 = x2.25, so a fresh next-rank x3 item is still an upgrade while preserving room for enhancement.
assert.ok(EQUIPMENT_MAJOR_REALM_GROWTH_V142 > 1 + enhancementBonusPct(15) / 100);

console.log('V142 equipment stat balance PASS');