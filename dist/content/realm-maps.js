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
const zones = {
    1: { name: 'Phàm Vực', grade: 'mundane', equipmentGrade: 'mundane', power: .70, powerByGrade: { common: .70, enhanced: .62, elite: .52, boss: .24 }, reward: .90, description: 'Vực nhập môn. Ngũ Hành đã tồn tại nhưng quái chủ yếu đơn hệ, giúp người chơi học khắc chế.', gradeWeights: { common: 88, enhanced: 10, elite: 2 }, maxMonsterElements: 1 },
    2: { name: 'Linh Vực', grade: 'spirit', equipmentGrade: 'spirit', power: .80, powerByGrade: { common: .80, enhanced: .72, elite: .62, boss: .28 }, reward: 1.04, description: 'Linh tính đậm hơn, quái cường hóa xuất hiện thường xuyên hơn.', gradeWeights: { common: 82, enhanced: 15, elite: 3 }, maxMonsterElements: 1 },
    3: { name: 'Huyền Vực', grade: 'mystic', equipmentGrade: 'mystic', power: .92, powerByGrade: { common: .92, enhanced: .82, elite: .70, boss: .32 }, reward: 1.20, description: 'Khắc chế Ngũ Hành bắt đầu ảnh hưởng rõ tới khả năng leo tầng.', gradeWeights: { common: 76, enhanced: 19, elite: 5 }, maxMonsterElements: 1 },
    4: { name: 'Địa Vực', grade: 'earth', equipmentGrade: 'earth', power: 1.05, powerByGrade: { common: 1.05, enhanced: .92, elite: .78, boss: .36 }, reward: 1.38, description: 'Tinh anh mạnh hơn; Boss có thể mang song hệ theo chủ hệ của tầng.', gradeWeights: { common: 70, enhanced: 23, elite: 7 }, maxMonsterElements: 2 },
    5: { name: 'Thiên Vực', grade: 'heaven', equipmentGrade: 'heaven', power: 1.18, powerByGrade: { common: 1.18, enhanced: 1.02, elite: .86, boss: .40 }, reward: 1.58, description: 'Song hệ xuất hiện thường xuyên ở quái hiếm, buộc build phải có phương án chống khắc.', gradeWeights: { common: 64, enhanced: 26, elite: 10 }, maxMonsterElements: 2 },
    6: { name: 'Tiên Vực', grade: 'immortal', equipmentGrade: 'immortal', power: 1.32, powerByGrade: { common: 1.32, enhanced: 1.12, elite: .94, boss: .44 }, reward: 1.80, description: 'Tài nguyên tốt hơn rõ rệt nhưng độ khó Ngũ Hành và quái hiếm cùng tăng.', gradeWeights: { common: 58, enhanced: 29, elite: 13 }, maxMonsterElements: 2 },
    7: { name: 'Cực Vực', grade: 'extreme', equipmentGrade: 'extreme', power: 1.48, powerByGrade: { common: 1.48, enhanced: 1.24, elite: 1.02, boss: .49 }, reward: 2.05, description: 'Vực dành cho build mạnh và tích lũy Luân Hồi; quái hiếm có thể song hệ rất khó chịu.', gradeWeights: { common: 52, enhanced: 32, elite: 16 }, maxMonsterElements: 2 },
    8: { name: 'Phá Vực', grade: 'breaker', equipmentGrade: 'breaker', power: 1.68, powerByGrade: { common: 1.68, enhanced: 1.38, elite: 1.12, boss: .55 }, reward: 2.34, description: 'Khu vực cực sâu. Boss và tinh anh có thể mang ba hệ, phần thưởng cao nhưng không bùng nổ vô hạn.', gradeWeights: { common: 46, enhanced: 34, elite: 20 }, maxMonsterElements: 3 },
};
const gradeRewards = {
    common: { spiritStoneMultiplier: 1, equipmentChancePct: 5, cultivationPillChancePct: .15 },
    enhanced: { spiritStoneMultiplier: 2.3, equipmentChancePct: 8, cultivationPillChancePct: .60 },
    elite: { spiritStoneMultiplier: 5.5, equipmentChancePct: 15, cultivationPillChancePct: 2.4 },
    boss: { spiritStoneMultiplier: 18, equipmentChancePct: 30, cultivationPillChancePct: 20 },
};
/**
 * V142 major-realm combat scale follows the x3 core equipment ladder.
 * 70.5% of the relative equipment delta is assigned to the enemy because the player's fixed 113 Công
 * remains in the denominator at Luyện Khí. With a full same-realm +15 package (40 Phàm-base Công),
 * this tracks player attack growth to within a tiny rounding margin across all 28 major realms.
 */
export const HUNT_EQUIPMENT_MAJOR_GROWTH_V142 = 3;
export const HUNT_MAJOR_REALM_EQUIPMENT_SHARE_V142 = .705;
export function huntMajorRealmPowerScaleV142(majorRealmIndex) {
    const major = Math.max(1, Math.min(majorRealmNames.length, Math.floor(Number(majorRealmIndex) || 1)));
    const relativeGearScale = Math.pow(HUNT_EQUIPMENT_MAJOR_GROWTH_V142, major - 1);
    return 1 + (relativeGearScale - 1) * HUNT_MAJOR_REALM_EQUIPMENT_SHARE_V142;
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
export function zoneForMapFloor(floor) { return (Math.floor((localFloorForMapFloor(floor) - 1) / REALM_MAP_FLOORS_PER_ZONE) + 1); }
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
const ELEMENT_CYCLE = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
/** Five elements are distributed evenly across every 100-floor zone: 20 floors per primary element.
 * The order rotates by zone so a new realm does not repeat the exact same elemental route. */
export function primaryElementForZoneFloor(zone, zoneFloor) {
    const band = Math.min(4, Math.floor((Math.max(1, Math.min(100, Math.floor(zoneFloor))) - 1) / 20));
    return ELEMENT_CYCLE[(band + (zone - 1)) % ELEMENT_CYCLE.length];
}
export function elementPoolForZoneFloor(zone, zoneFloor) {
    const primary = primaryElementForZoneFloor(zone, zoneFloor);
    const primaryIndex = ELEMENT_CYCLE.indexOf(primary);
    if (zone <= 3)
        return [primary];
    const previous = ELEMENT_CYCLE[(primaryIndex + ELEMENT_CYCLE.length - 1) % ELEMENT_CYCLE.length];
    if (zone <= 5)
        return [primary, previous];
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
    const globalDepth01 = (localFloor - 1) / (REALM_MAP_FLOORS_PER_MAJOR_REALM - 1);
    const generalRewardScale = .90 + 1.50 * Math.pow(globalDepth01, .92);
    const spiritStoneRewardScale = .90 + 3.35 * Math.pow(globalDepth01, 1.02);
    const primaryElement = primaryElementForZoneFloor(zone, zf);
    const elementPool = elementPoolForZoneFloor(zone, zf);
    const majorPowerScale = huntMajorRealmPowerScaleV142(majorRealmIndex);
    return { id: `realm-map.${majorRealmIndex}.${zone}`, realmOrder: majorStart, majorRealmIndex, realmName: majorRealmNameForIndex(majorRealmIndex) || realmName, biomeName: biomes[majorRealmIndex - 1] ?? majorRealmNameForIndex(majorRealmIndex), name: `${biomes[majorRealmIndex - 1] ?? majorRealmNameForIndex(majorRealmIndex)} · ${majorRealmNameForIndex(majorRealmIndex)}`, description: `${z.description} Mỗi vực có 100 tầng; mỗi tầng là một Boss thật. Hạ Boss để mở tầng kế và biến tầng vừa vượt thành bãi Săn Ảo; sức mạnh build quyết định tốc độ farm. Chủ hệ đổi sau mỗi 20 tầng.`, zone, zoneName: z.name, zoneGradeId: z.grade, equipmentGrade: z.equipmentGrade, floor, zoneFloor: zf, localFloor, floorsPerZone: REALM_MAP_FLOORS_PER_ZONE, majorPowerScale, powerMultiplier: z.power * majorPowerScale, powerByGrade: Object.fromEntries(Object.entries(z.powerByGrade).map(([grade, value]) => [grade, value * majorPowerScale])), rewardMultiplier: generalRewardScale, rewardDepthMultiplier: spiritStoneRewardScale, gradeWeights: { ...z.gradeWeights }, elementPool, primaryElement, maxMonsterElements: z.maxMonsterElements };
}
export function realmMapDefinitionForFloor(floor) {
    const order = realmOrderForMapFloor(floor);
    return realmMapDefinition(order, majorRealmNameForIndex(majorRealmIndexForMapFloor(floor)), zoneForMapFloor(floor), zoneFloorForMapFloor(floor));
}
export function realmMapRewardProfile(grade, zone, zoneFloor = 1) {
    const base = gradeRewards[grade];
    const floor = Math.max(1, Math.min(100, Math.floor(zoneFloor)));
    const local = (zone - 1) * 100 + floor;
    const depth01 = (local - 1) / (REALM_MAP_FLOORS_PER_MAJOR_REALM - 1);
    // Smooth 1..800 progression avoids reward cliffs at zone boundaries.
    const stoneScale = .90 + 3.35 * Math.pow(depth01, 1.02);
    const equipmentScale = 1 + .85 * Math.pow(depth01, .88);
    const pillScale = 1 + 1.10 * Math.pow(depth01, .90);
    return { spiritStoneMultiplier: base.spiritStoneMultiplier * stoneScale, equipmentChancePct: Math.min(100, base.equipmentChancePct * equipmentScale), cultivationPillChancePct: Math.min(100, base.cultivationPillChancePct * pillScale) };
}
export function availableRealmMaps(currentRealmOrder, _realmNameByOrder) {
    if (currentRealmOrder < 1)
        return [];
    const currentMajor = majorRealmIndexForRealmOrder(currentRealmOrder);
    const result = [];
    // Every previously reached major-realm map remains revisit-able. The portrait client filters this
    // list to the selected realm so old gauntlets never disappear just because cultivation advanced.
    for (let major = 1; major <= currentMajor; major++) {
        const order = majorRealmStartOrderForIndex(major);
        for (let zone = 1; zone <= 8; zone++)
            result.push(realmMapDefinition(order, majorRealmNameForIndex(major), zone, 1));
    }
    return result;
}
//# sourceMappingURL=realm-maps.js.map