import { ENDLESS_HUNT_FLOOR_POWER_GROWTH, endlessHuntGrades } from './endless-hunt.js';

export const REALM_MAP_ZONES = 8;
export const REALM_MAP_FLOORS_PER_ZONE = 100;
export const REALM_MAP_FLOORS_PER_MAJOR_REALM = REALM_MAP_ZONES * REALM_MAP_FLOORS_PER_ZONE;
const majorRealmNames = [
    'Luyện Khí', 'Trúc Cơ', 'Tử Phủ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Độ Kiếp',
    'Nhân Tiên', 'Địa Tiên', 'Thiên Tiên', 'Chân Tiên', 'Huyền Tiên', 'Kim Tiên', 'Thái Ất Tiên', 'Đại La Kim Tiên', 'Tiên Vương', 'Tiên Đế',
    'Cực Hạn', 'Cực Đạo Chân Cảnh', 'Hỗn Độn Cảnh', 'Hồng Mông Cảnh', 'Khai Thiên Cảnh', 'Thế Giới Chủ', 'Vĩnh Sinh Cảnh', 'Sáng Thế Chủ',
];
const biomes = [
    'Thanh Hư Sơn Mạch', 'Lôi Minh Cốc', 'Tử Kính Hồ', 'Đan Hỏa Sơn', 'Vân Hồn Hải', 'Ngộ Đạo Thiên Nhai', 'Hư Không Liệt Cốc', 'Vạn Tượng Hợp Vực',
    'Đại Thừa Thiên Nguyên', 'Thiên Kiếp Hoang Nguyên', 'Tiên Linh Cổ Vực', 'Địa Mạch Tiên Uyên', 'Thiên Khung Tiên Hải', 'Chân Tiên Cổ Lộ', 'Huyền Pháp Thiên Khư',
    'Kim Tiên Thần Sơn', 'Thái Ất Kỷ Hà', 'Đại La Vạn Giới', 'Tiên Vương Cổ Đình', 'Tiên Đế Thần Vực', 'Cực Hạn Biên Giới', 'Cực Đạo Hỗn Độn Hải', 'Hỗn Độn Tổ Vực',
    'Hồng Mông Nguyên Hải', 'Khai Thiên Nguyên Giới', 'Vạn Giới Chủ Vực', 'Vĩnh Sinh Thần Hà', 'Sáng Thế Hư Không',
];

/**
 * V143 Hunt authority: the strongest Boss of a major realm is the ceiling.
 * Every weaker Boss, Elite, Enhanced and Common monster is derived downward from that ceiling.
 * This intentionally does NOT guarantee that a same-realm character can clear floor 800.
 */
export const HUNT_BOSS_APEX_EFFECTIVE_SCALE_V143 = 6;
export const HUNT_BOSS_FLOOR1_SHARE_V143 = .24;
export const HUNT_GRADE_SHARE_OF_BOSS_V143 = Object.freeze({ common: .20, enhanced: .30, elite: .50, boss: 1 });
export const HUNT_ZONE_REWARD_PER_KILL_V143 = Object.freeze([1, 1.30, 1.70, 2.20, 2.90, 3.80, 5.00, 6.50]);

const zones = {
    1: { name: 'Phàm Vực', grade: 'mundane', equipmentGrade: 'mundane', description: 'Vực nhập môn. Quái yếu nhất trong đại cảnh nhưng vẫn dùng cùng trục Boss-authority; phù hợp farm tốc độ.', gradeWeights: { common: 88, enhanced: 10, elite: 2 }, maxMonsterElements: 1 },
    2: { name: 'Linh Vực', grade: 'spirit', equipmentGrade: 'spirit', description: 'Linh tính đậm hơn; reward/kill tăng nhưng TTK bắt đầu cao hơn rõ.', gradeWeights: { common: 82, enhanced: 15, elite: 3 }, maxMonsterElements: 1 },
    3: { name: 'Huyền Vực', grade: 'mystic', equipmentGrade: 'mystic', description: 'Khắc chế Ngũ Hành bắt đầu ảnh hưởng rõ tới tốc độ farm.', gradeWeights: { common: 76, enhanced: 19, elite: 5 }, maxMonsterElements: 1 },
    4: { name: 'Địa Vực', grade: 'earth', equipmentGrade: 'earth', description: 'Tinh Anh nhiều hơn; Boss có thể mang song hệ.', gradeWeights: { common: 70, enhanced: 23, elite: 7 }, maxMonsterElements: 2 },
    5: { name: 'Thiên Vực', grade: 'heaven', equipmentGrade: 'heaven', description: 'Reward/kill cao, đòi hỏi build bắt đầu hoàn thiện.', gradeWeights: { common: 64, enhanced: 26, elite: 10 }, maxMonsterElements: 2 },
    6: { name: 'Tiên Vực', grade: 'immortal', equipmentGrade: 'immortal', description: 'Tài nguyên tốt nhưng TTK có thể khiến Vực thấp hơn lời hơn theo giờ.', gradeWeights: { common: 58, enhanced: 29, elite: 13 }, maxMonsterElements: 2 },
    7: { name: 'Cực Vực', grade: 'extreme', equipmentGrade: 'extreme', description: 'Vực cho build mạnh; reward/kill lớn nhưng không mặc định là farm tối ưu.', gradeWeights: { common: 52, enhanced: 32, elite: 16 }, maxMonsterElements: 2 },
    8: { name: 'Phá Vực', grade: 'breaker', equipmentGrade: 'breaker', description: 'Trần thử thách của đại cảnh. Boss cuối vực là authority sức mạnh của toàn bộ 800 tầng.', gradeWeights: { common: 46, enhanced: 34, elite: 20 }, maxMonsterElements: 3 },
};
const gradeRewards = {
    common: { spiritStoneMultiplier: 1, equipmentChancePct: 5, cultivationPillChancePct: .15 },
    enhanced: { spiritStoneMultiplier: 2.3, equipmentChancePct: 8, cultivationPillChancePct: .60 },
    elite: { spiritStoneMultiplier: 5.5, equipmentChancePct: 15, cultivationPillChancePct: 2.4 },
    boss: { spiritStoneMultiplier: 18, equipmentChancePct: 30, cultivationPillChancePct: 20 },
};

/** x3 equipment rank growth is also the major-realm Hunt backbone. */
export const HUNT_EQUIPMENT_MAJOR_GROWTH_V142 = 3;
/** Compatibility export; V143 no longer mixes fixed player base into enemy authority. */
export const HUNT_MAJOR_REALM_EQUIPMENT_SHARE_V142 = 1;
export function huntMajorRealmPowerScaleV142(majorRealmIndex) {
    const major = Math.max(1, Math.min(majorRealmNames.length, Math.floor(Number(majorRealmIndex) || 1)));
    return Math.pow(HUNT_EQUIPMENT_MAJOR_GROWTH_V142, major - 1);
}
export function majorRealmIndexForRealmOrder(realmOrder) {
    const order = Math.max(1, Math.floor(realmOrder));
    return order <= 9 ? 1 : Math.min(majorRealmNames.length, 2 + Math.floor((order - 10) / 4));
}
export function majorRealmStartOrderForIndex(index) { const i = Math.max(1, Math.floor(index)); return i === 1 ? 1 : 10 + (i - 2) * 4; }
export function majorRealmStartOrderForRealmOrder(order) { return majorRealmStartOrderForIndex(majorRealmIndexForRealmOrder(order)); }
export function majorRealmNameForIndex(index) { return majorRealmNames[Math.max(1, Math.min(majorRealmNames.length, Math.floor(index))) - 1] ?? `Đại Cảnh ${index}`; }
export function majorRealmIndexForMapFloor(floor) { return Math.floor((Math.max(1, Math.floor(floor)) - 1) / REALM_MAP_FLOORS_PER_MAJOR_REALM) + 1; }
export function localFloorForMapFloor(floor) { return ((Math.max(1, Math.floor(floor)) - 1) % REALM_MAP_FLOORS_PER_MAJOR_REALM) + 1; }
export function zoneForMapFloor(floor) { return Math.floor((localFloorForMapFloor(floor) - 1) / REALM_MAP_FLOORS_PER_ZONE) + 1; }
export function zoneFloorForMapFloor(floor) { return ((localFloorForMapFloor(floor) - 1) % REALM_MAP_FLOORS_PER_ZONE) + 1; }
export function realmOrderForMapFloor(floor) { return majorRealmStartOrderForIndex(majorRealmIndexForMapFloor(floor)); }
export function mapFloorForRealmZone(realmOrder, zone, zoneFloor = 1) {
    const major = majorRealmIndexForRealmOrder(realmOrder);
    const z = Math.max(1, Math.min(REALM_MAP_ZONES, Math.floor(zone)));
    const f = Math.max(1, Math.min(REALM_MAP_FLOORS_PER_ZONE, Math.floor(zoneFloor)));
    return (major - 1) * REALM_MAP_FLOORS_PER_MAJOR_REALM + (z - 1) * REALM_MAP_FLOORS_PER_ZONE + f;
}
export function mapStartFloorForRealm(realmOrder) { return mapFloorForRealmZone(realmOrder, 1, 1); }
export function mapEndFloorForRealm(realmOrder) { return mapFloorForRealmZone(realmOrder, 8, 100); }

export function huntBossAuthorityShareV143(localFloor) {
    const local = Math.max(1, Math.min(REALM_MAP_FLOORS_PER_MAJOR_REALM, Math.floor(Number(localFloor) || 1)));
    const depth01 = (local - 1) / (REALM_MAP_FLOORS_PER_MAJOR_REALM - 1);
    return HUNT_BOSS_FLOOR1_SHARE_V143 + (1 - HUNT_BOSS_FLOOR1_SHARE_V143) * Math.pow(depth01, 1.18);
}
export function huntBossEffectiveScaleV143(majorRealmIndex, localFloor = REALM_MAP_FLOORS_PER_MAJOR_REALM) {
    return huntMajorRealmPowerScaleV142(majorRealmIndex) * HUNT_BOSS_APEX_EFFECTIVE_SCALE_V143 * huntBossAuthorityShareV143(localFloor);
}
export function huntGradeEffectiveScaleV143(majorRealmIndex, localFloor, grade = 'common') {
    const share = HUNT_GRADE_SHARE_OF_BOSS_V143[grade] ?? HUNT_GRADE_SHARE_OF_BOSS_V143.common;
    return huntBossEffectiveScaleV143(majorRealmIndex, localFloor) * share;
}
function huntMapScalarForGradeV143(majorRealmIndex, localFloor, grade) {
    const intrinsic = Math.max(.0001, endlessHuntGrades[grade]?.powerMultiplier ?? 1);
    const internalFloor = Math.pow(ENDLESS_HUNT_FLOOR_POWER_GROWTH, Math.max(0, localFloor - 1));
    return huntGradeEffectiveScaleV143(majorRealmIndex, localFloor, grade) / (intrinsic * internalFloor);
}
export function huntZoneRewardPerKillV143(zone, zoneFloor = 1) {
    const z = Math.max(1, Math.min(8, Math.floor(Number(zone) || 1)));
    const f = Math.max(1, Math.min(100, Math.floor(Number(zoneFloor) || 1)));
    const withinZone = 1 + .12 * ((f - 1) / 99);
    return HUNT_ZONE_REWARD_PER_KILL_V143[z - 1] * withinZone;
}

const ELEMENT_CYCLE = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
export function primaryElementForZoneFloor(zone, zoneFloor) {
    const band = Math.min(4, Math.floor((Math.max(1, Math.min(100, Math.floor(zoneFloor))) - 1) / 20));
    return ELEMENT_CYCLE[(band + (zone - 1)) % ELEMENT_CYCLE.length];
}
export function elementPoolForZoneFloor(zone, zoneFloor) {
    const primary = primaryElementForZoneFloor(zone, zoneFloor);
    const primaryIndex = ELEMENT_CYCLE.indexOf(primary);
    if (zone <= 3) return [primary];
    const previous = ELEMENT_CYCLE[(primaryIndex + ELEMENT_CYCLE.length - 1) % ELEMENT_CYCLE.length];
    if (zone <= 5) return [primary, previous];
    const next = ELEMENT_CYCLE[(primaryIndex + 1) % ELEMENT_CYCLE.length];
    return [primary, previous, next];
}
export function realmMapDefinition(realmOrder, realmName, zone, zoneFloor = 1) {
    const majorRealmIndex = majorRealmIndexForRealmOrder(realmOrder);
    const majorStart = majorRealmStartOrderForIndex(majorRealmIndex);
    const z = zones[zone];
    const zf = Math.max(1, Math.min(100, Math.floor(zoneFloor)));
    const localFloor = (zone - 1) * 100 + zf;
    const floor = mapFloorForRealmZone(majorStart, zone, zf);
    const primaryElement = primaryElementForZoneFloor(zone, zf);
    const elementPool = elementPoolForZoneFloor(zone, zf);
    const majorPowerScale = huntMajorRealmPowerScaleV142(majorRealmIndex);
    const powerByGrade = {
        common: huntMapScalarForGradeV143(majorRealmIndex, localFloor, 'common'),
        enhanced: huntMapScalarForGradeV143(majorRealmIndex, localFloor, 'enhanced'),
        elite: huntMapScalarForGradeV143(majorRealmIndex, localFloor, 'elite'),
        boss: huntMapScalarForGradeV143(majorRealmIndex, localFloor, 'boss'),
    };
    const rewardPerKill = huntZoneRewardPerKillV143(zone, zf);
    return {
        id: `realm-map.${majorRealmIndex}.${zone}`, realmOrder: majorStart, majorRealmIndex,
        realmName: majorRealmNameForIndex(majorRealmIndex) || realmName,
        biomeName: biomes[majorRealmIndex - 1] ?? majorRealmNameForIndex(majorRealmIndex),
        name: `${biomes[majorRealmIndex - 1] ?? majorRealmNameForIndex(majorRealmIndex)} · ${majorRealmNameForIndex(majorRealmIndex)}`,
        description: `${z.description} Mỗi vực có 100 tầng; mỗi tầng là một Boss thật. Boss cuối Phá Vực là trần sức mạnh của đại cảnh, mọi quái bên dưới được suy giảm từ trần đó. Hạ Boss để mở tầng kế và mở Săn Ảo tầng vừa vượt.`,
        zone, zoneName: z.name, zoneGradeId: z.grade, equipmentGrade: z.equipmentGrade,
        floor, zoneFloor: zf, localFloor, floorsPerZone: REALM_MAP_FLOORS_PER_ZONE,
        majorPowerScale, powerMultiplier: powerByGrade.common, powerByGrade,
        bossAuthority: {
            apexEffectiveScale: huntBossEffectiveScaleV143(majorRealmIndex, REALM_MAP_FLOORS_PER_MAJOR_REALM),
            currentEffectiveScale: huntBossEffectiveScaleV143(majorRealmIndex, localFloor),
            currentShareOfApex: huntBossAuthorityShareV143(localFloor),
        },
        rewardMultiplier: rewardPerKill, rewardDepthMultiplier: rewardPerKill,
        gradeWeights: { ...z.gradeWeights }, elementPool, primaryElement, maxMonsterElements: z.maxMonsterElements,
    };
}
export function realmMapDefinitionForFloor(floor) {
    const order = realmOrderForMapFloor(floor);
    return realmMapDefinition(order, majorRealmNameForIndex(majorRealmIndexForMapFloor(floor)), zoneForMapFloor(floor), zoneFloorForMapFloor(floor));
}
export function realmMapRewardProfile(grade, zone, zoneFloor = 1) {
    const base = gradeRewards[grade];
    const z = Math.max(1, Math.min(8, Math.floor(Number(zone) || 1)));
    const f = Math.max(1, Math.min(100, Math.floor(Number(zoneFloor) || 1)));
    const local = (z - 1) * REALM_MAP_FLOORS_PER_ZONE + f;
    const depth01 = (local - 1) / (REALM_MAP_FLOORS_PER_MAJOR_REALM - 1);
    const rewardPerKill = huntZoneRewardPerKillV143(z, f);
    // Equipment/pill opportunity must never reset at a Vực boundary. Vực controls reward-per-kill;
    // these chances use one continuous 1→800 depth curve so floor 101 can never be worse than 100.
    const equipmentScale = 1 + .85 * Math.pow(depth01, .88);
    const pillScale = 1 + 1.10 * Math.pow(depth01, .90);
    return {
        spiritStoneMultiplier: base.spiritStoneMultiplier * rewardPerKill,
        equipmentChancePct: Math.min(100, base.equipmentChancePct * equipmentScale),
        cultivationPillChancePct: Math.min(100, base.cultivationPillChancePct * pillScale),
        rewardPerKillMultiplier: rewardPerKill,
    };
}
export function availableRealmMaps(currentRealmOrder, _realmNameByOrder) {
    if (currentRealmOrder < 1) return [];
    const currentMajor = majorRealmIndexForRealmOrder(currentRealmOrder);
    const result = [];
    for (let major = 1; major <= currentMajor; major++) {
        const order = majorRealmStartOrderForIndex(major);
        for (let zone = 1; zone <= 8; zone++) result.push(realmMapDefinition(order, majorRealmNameForIndex(major), zone, 1));
    }
    return result;
}
//# sourceMappingURL=realm-maps.js.map