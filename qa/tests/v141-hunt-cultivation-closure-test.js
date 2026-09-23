import assert from 'node:assert/strict';
import fs from 'node:fs';
import { playableMortalCultivator } from '../../dist/content/entities.js';
import { CULTIVATION_REALMS_V140 } from '../../dist/core/cultivation-v140.js';
import {
  REALM_MAP_FLOORS_PER_MAJOR_REALM,
  majorRealmIndexForRealmOrder,
  mapStartFloorForRealm,
  realmMapDefinitionForFloor,
  realmMapRewardProfile,
} from '../../dist/content/realm-maps.js';
import { endlessHuntGrades } from '../../dist/content/endless-hunt.js';
import {
  createEndlessHuntState,
  ensureMajorHuntMapUnlocked,
  generateEndlessHuntMonster,
  resolveEndlessHuntFight,
} from '../../dist/core/endless-hunt.js';
import {
  HUNT_VIRTUAL_FARM_MIN_SECONDS_PER_KILL_V77,
  HUNT_VIRTUAL_FARM_MODEL_VERSION_V141,
  huntVirtualFarmPlayerDpsLog10V77,
  huntVirtualFarmProfileV77,
} from '../../dist/core/hunt-virtual-farm-v77.js';
import {
  HUNT_CULTIVATION_CLOSURE_V141,
  buildHuntProductionV110,
} from '../../dist/core/hunt-production-v110.js';
import { economyBandScale } from '../../dist/core/economy-v111.js';
import { OFFLINE_BASE_CAP_REAL_HOURS, OFFLINE_HUNT_MAX_FIGHTS } from '../../dist/core/offline.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };

test('V140 118 cảnh map đúng 28 đại cảnh Săn Yêu, 800 tầng mỗi đại cảnh', () => {
  assert.equal(CULTIVATION_REALMS_V140.length, 118);
  const majors = [...new Set(CULTIVATION_REALMS_V140.filter(x => x.majorRealmIndex > 0).map(x => x.majorRealmIndex))];
  assert.deepEqual(majors, Array.from({ length: 28 }, (_, i) => i + 1));
  assert.equal(REALM_MAP_FLOORS_PER_MAJOR_REALM, 800);
  for (const major of majors) {
    const startRealm = CULTIVATION_REALMS_V140.find(x => x.majorRealmIndex === major && x.stageIndex === 0);
    assert(startRealm, `missing V140 start realm for major ${major}`);
    assert.equal(majorRealmIndexForRealmOrder(startRealm.order), major);
    assert.equal(mapStartFloorForRealm(startRealm.order), (major - 1) * 800 + 1);
  }
});

test('Độ khó quái Săn Yêu tăng liên tục qua 8 vực, không reset ở biên 100 tầng', () => {
  let previous = -Infinity;
  const checkpoints = [1, 20, 100, 101, 200, 201, 400, 401, 600, 601, 800];
  for (const floor of checkpoints) {
    const map = realmMapDefinitionForFloor(floor);
    const state = createEndlessHuntState();
    state.selectedFloor = floor;
    const mob = generateEndlessHuntMonster(state, 141000 + floor, 0, 1, { common: 100, enhanced: 0, elite: 0 }, map.localFloor, map.elementPool, map.maxMonsterElements, false);
    const effectiveLog10 = mob.powerLog10 + Math.log10(map.powerByGrade.common ?? map.powerMultiplier);
    assert(effectiveLog10 > previous, `difficulty reset at floor ${floor}: ${previous} -> ${effectiveLog10}`);
    previous = effectiveLog10;
  }
});

test('Reward tầng 1→800 tăng mượt, không có cliff giảm ở biên vực', () => {
  let previousStone = 0, previousEquipment = 0, previousPill = 0;
  for (let local = 1; local <= 800; local++) {
    const zone = Math.floor((local - 1) / 100) + 1;
    const zoneFloor = ((local - 1) % 100) + 1;
    const reward = realmMapRewardProfile('common', zone, zoneFloor);
    assert(reward.spiritStoneMultiplier + 1e-12 >= previousStone, `stone reward regressed at local ${local}`);
    assert(reward.equipmentChancePct + 1e-12 >= previousEquipment, `equipment reward regressed at local ${local}`);
    assert(reward.cultivationPillChancePct + 1e-12 >= previousPill, `pill reward regressed at local ${local}`);
    previousStone = reward.spiritStoneMultiplier;
    previousEquipment = reward.equipmentChancePct;
    previousPill = reward.cultivationPillChancePct;
  }
  assert(previousStone > realmMapRewardProfile('common', 1, 1).spiritStoneMultiplier);
});

test('Săn Yêu tuyệt đối không mint Tu Vi trực tiếp: common/enhanced/elite/boss đều 0', () => {
  assert(Object.values(endlessHuntGrades).every(x => x.cultivationPct === 0));
  const state = createEndlessHuntState();
  ensureMajorHuntMapUnlocked(state, 1);
  const realCombat = { won: true, outcome: 'victory', battleSeconds: 12, playerDamageLog10: 4, playerHpRemainingPct: 80, enemyHpRemainingPct: 0, playerDpsLog10: 3, enemyDpsLog10: 2 };
  const result = resolveEndlessHuntFight(state, 4, 141141, 0, 1, 1, { common: 100, enhanced: 0, elite: 0 }, 1, ['Wood'], 1, realCombat, true);
  assert.equal(result.cultivationPct, 0);
  assert.equal(result.trainingPowerLogGain, 0);
});

test('Preview Săn Ảo phản ánh Damage% của Chiến Mệnh nhưng không dùng Boss Damage%', () => {
  assert.equal(HUNT_VIRTUAL_FARM_MODEL_VERSION_V141, 'v141-build-parity');
  const base = structuredClone(playableMortalCultivator);
  base.combatBuildV117 = { ...(base.combatBuildV117 ?? {}), fateV4: { damagePct: 0, bossDamagePct: 0 } };
  const damage = structuredClone(base);
  damage.combatBuildV117.fateV4.damagePct = 20;
  const bossOnly = structuredClone(base);
  bossOnly.combatBuildV117.fateV4.bossDamagePct = 100;
  const a = huntVirtualFarmPlayerDpsLog10V77(base);
  const b = huntVirtualFarmPlayerDpsLog10V77(damage);
  const c = huntVirtualFarmPlayerDpsLog10V77(bossOnly);
  assert(Math.abs((10 ** (b - a)) - 1.2) < 1e-9, `${10 ** (b - a)}`);
  assert(Math.abs(c - a) < 1e-12, `${a} -> ${c}`);
});

test('Preview và settlement Săn Ảo dùng cùng hard floor 0.25s; 24h không vượt safety cap', () => {
  assert.equal(HUNT_VIRTUAL_FARM_MIN_SECONDS_PER_KILL_V77, .25);
  const preview = huntVirtualFarmProfileV77({ floor: 1, playerDpsLog10: 12, mobHpLog10: 0, eliteChancePct: 0 });
  assert.equal(preview.secondsPerKill, .25);
  assert.equal(preview.killsPerHour, 14_400);
  const theoreticalMax = OFFLINE_BASE_CAP_REAL_HOURS * 3600 / HUNT_VIRTUAL_FARM_MIN_SECONDS_PER_KILL_V77;
  assert.equal(theoreticalMax, 345_600);
  assert(theoreticalMax <= OFFLINE_HUNT_MAX_FIGHTS, `${theoreticalMax} > ${OFFLINE_HUNT_MAX_FIGHTS}`);
});

test('Settlement Săn Ảo lấy TTK từ CombatKernel V2 đại diện, không lấy preview Power Score', () => {
  const session = fs.readFileSync(new URL('../../dist/core/session.js', import.meta.url), 'utf8');
  assert(session.includes('const representativeCombat = resolveEndlessHuntWithCombatKernelV3'));
  assert(session.includes('const secondsPerKillV129 = representativeCombat.won'));
  assert(session.includes("mode: 'simulation'"));
  assert(session.includes('this.fateSpiritStoneGainV4(deterministicJitteredTotalV77'));
});

test('Contract production khóa: Boss thật mở tầng, Săn Ảo farm, Tu Luyện V140 chạy song song 100%', () => {
  assert.equal(HUNT_CULTIVATION_CLOSURE_V141, 'closed');
  const view = buildHuntProductionV110({ farm: { available: true, floor: 1 }, map: { zoneFloor: 1 } });
  assert.equal(view.cultivationClosure, 'closed');
  assert(view.farm.rule.includes('không cấp Tu Vi trực tiếp'));
  assert(view.farm.rule.includes('100% song song'));
  assert(view.farm.rule.includes('CombatKernel V2'));
});

test('Linh Thạch Săn Yêu scale theo 28 đại cảnh nhưng có hard cap, không overflow vô hạn', () => {
  let previous = 0;
  for (let major = 1; major <= 28; major++) {
    const scale = economyBandScale(major);
    assert(Number.isFinite(scale));
    assert(scale >= previous);
    assert(scale <= 9e15);
    previous = scale;
  }
});

console.log(`\nV141 HUNT × CULTIVATION CLOSURE — ${passed}/${passed} PASS`);
