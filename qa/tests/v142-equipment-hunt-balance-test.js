import assert from 'node:assert/strict';
import { ENDLESS_HUNT_FLOOR_POWER_GROWTH } from '../../dist/content/endless-hunt.js';
import {
  HUNT_BOSS_APEX_EFFECTIVE_SCALE_V143,
  HUNT_BOSS_FLOOR1_SHARE_V143,
  HUNT_EQUIPMENT_MAJOR_GROWTH_V142,
  HUNT_GRADE_SHARE_OF_BOSS_V143,
  HUNT_MAJOR_REALM_EQUIPMENT_SHARE_V142,
  HUNT_ZONE_REWARD_PER_KILL_V143,
  huntBossAuthorityShareV143,
  huntBossEffectiveScaleV143,
  huntGradeEffectiveScaleV143,
  huntMajorRealmPowerScaleV142,
  huntZoneRewardPerKillV143,
  realmMapDefinitionForFloor,
} from '../../dist/content/realm-maps.js';
import { EQUIPMENT_SANG_THE_INDEX_V142 } from '../../dist/core/equipment-v142.js';

assert.equal(ENDLESS_HUNT_FLOOR_POWER_GROWTH, 1.0005, 'intrinsic generator floor growth remains tiny; map authority owns final difficulty');
assert.equal(HUNT_EQUIPMENT_MAJOR_GROWTH_V142, 3);
assert.equal(HUNT_MAJOR_REALM_EQUIPMENT_SHARE_V142, 1, 'V143 enemy authority follows full x3 major-realm backbone');
assert.equal(HUNT_BOSS_APEX_EFFECTIVE_SCALE_V143, 6, 'floor-800 Boss is a deliberate wall, not same-realm guaranteed content');
assert.equal(HUNT_BOSS_FLOOR1_SHARE_V143, .24);
assert.deepEqual(HUNT_GRADE_SHARE_OF_BOSS_V143, { common: .20, enhanced: .30, elite: .50, boss: 1 });
assert.deepEqual(HUNT_ZONE_REWARD_PER_KILL_V143, [1, 1.30, 1.70, 2.20, 2.90, 3.80, 5.00, 6.50]);

assert.equal(huntBossAuthorityShareV143(1), .24);
assert.equal(huntBossAuthorityShareV143(800), 1);
const sameRealmBossWall = huntBossEffectiveScaleV143(1, 800) / huntBossEffectiveScaleV143(1, 1);
assert.ok(sameRealmBossWall > 4.15 && sameRealmBossWall < 4.18, `floor 1→800 Boss wall=${sameRealmBossWall}`);

// Every non-Boss grade is explicitly derived downward from the Boss authority.
for (const floor of [1, 100, 400, 800]) {
  const boss = huntGradeEffectiveScaleV143(7, floor, 'boss');
  assert.equal(huntGradeEffectiveScaleV143(7, floor, 'elite'), boss * .50);
  assert.equal(huntGradeEffectiveScaleV143(7, floor, 'enhanced'), boss * .30);
  assert.equal(huntGradeEffectiveScaleV143(7, floor, 'common'), boss * .20);
}

// Major realms are an exact x3 backbone all the way to Sáng Thế.
let prior = 0;
for (let major = 1; major <= EQUIPMENT_SANG_THE_INDEX_V142; major++) {
  const scale = huntMajorRealmPowerScaleV142(major);
  assert.equal(scale, 3 ** (major - 1));
  assert.ok(scale > prior);
  prior = scale;
  const first = realmMapDefinitionForFloor((major - 1) * 800 + 1);
  const apex = realmMapDefinitionForFloor(major * 800);
  assert.equal(first.majorPowerScale, scale);
  assert.equal(apex.bossAuthority.currentShareOfApex, 1);
  assert.equal(apex.bossAuthority.apexEffectiveScale, scale * HUNT_BOSS_APEX_EFFECTIVE_SCALE_V143);
}
const sangTheMajor = huntMajorRealmPowerScaleV142(28);
assert.equal(sangTheMajor, 3 ** 27);
assert.ok(huntBossEffectiveScaleV143(28, 800) > 4e13, 'Sáng Thế apex Boss must remain in the intended trillion-scale wall band');

// Reward-per-kill rises by Vực, but this never mints kills; TTK still comes from CombatKernel/Săn Ảo.
let last = 0;
for (let zone = 1; zone <= 8; zone++) {
  const start = huntZoneRewardPerKillV143(zone, 1);
  const end = huntZoneRewardPerKillV143(zone, 100);
  assert.ok(start > last, `zone ${zone} reward/kill must exceed prior zone start`);
  assert.ok(end > start, `zone ${zone} should progress smoothly inside 100 floors`);
  last = start;
}
assert.equal(huntZoneRewardPerKillV143(1, 1), 1);
assert.equal(huntZoneRewardPerKillV143(8, 1), 6.5);

console.log('V143 Boss-authority Hunt balance PASS');
