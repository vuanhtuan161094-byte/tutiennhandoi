import { LIVE_EQUIPMENT_SET_CATALOG_V12310 } from '../core/equipment-set-v116.js';
import { V122_FORGE_FLOORS, V122_TARGET_SET_DUNGEONS, V122_FORGE_DUNGEON_ID, V122_TARGET_SET_REPEAT_CHANCE_PCT, V122_TARGET_SET_WORKER_PIECES_PER_WORLD_YEAR } from '../core/loot-economy-v122.js';
import { RESOURCE_PVE_DUNGEON_DEFINITIONS_V12329 } from '../core/resource-pve-v12329.js';
export const V125_DAO_NATURE_DUNGEON_ID = 'dungeon.v125.ask_dao_platform';
export const V125_DAO_NATURE_TIER_RESOURCE_IDS = {
    mundane: 'resource.v125.dao_nature_cultivation.mundane', spirit: 'resource.v125.dao_nature_cultivation.spirit', mystic: 'resource.v125.dao_nature_cultivation.mystic', earth: 'resource.v125.dao_nature_cultivation.earth',
    heaven: 'resource.v125.dao_nature_cultivation.heaven', immortal: 'resource.v125.dao_nature_cultivation.immortal', extreme: 'resource.v125.dao_nature_cultivation.extreme', breaker: 'resource.v125.dao_nature_cultivation.breaker',
};
const V125_DAO_NATURE_FLOORS = [
    { floor: 1, requiredRealmOrder: 10, rewardMultiplier: 1, equipmentTier: 1, equipmentDropChance: 0, artifactDropChance: 0, qualityBias: 0, guardianEntityId: 'entity.boss.thunder_horn_rhino', guardianPowerMultiplier: .82, guardianMechanicId: 'predator' },
    { floor: 2, requiredRealmOrder: 18, rewardMultiplier: 1, equipmentTier: 2, equipmentDropChance: 0, artifactDropChance: 0, qualityBias: 0, guardianEntityId: 'entity.boss.purple_mirror_guardian', guardianPowerMultiplier: .90, guardianMechanicId: 'soul_pressure' },
    { floor: 3, requiredRealmOrder: 34, rewardMultiplier: 1, equipmentTier: 3, equipmentDropChance: 0, artifactDropChance: 0, qualityBias: 0, guardianEntityId: 'entity.boss.dao_echo_avatar', guardianPowerMultiplier: .98, guardianMechanicId: 'predator' },
    { floor: 4, requiredRealmOrder: 46, rewardMultiplier: 1, equipmentTier: 4, equipmentDropChance: 0, artifactDropChance: 0, qualityBias: 0, guardianEntityId: 'entity.boss.soul_pool_warden', guardianPowerMultiplier: 2.30, guardianMechanicId: 'soul_pressure' },
    { floor: 5, requiredRealmOrder: 62, rewardMultiplier: 1, equipmentTier: 5, equipmentDropChance: 0, artifactDropChance: 0, qualityBias: 0, guardianEntityId: 'entity.boss.dao_domain_shadow', guardianPowerMultiplier: 1.10, guardianMechanicId: 'iron_wall' },
    { floor: 6, requiredRealmOrder: 74, rewardMultiplier: 1, equipmentTier: 6, equipmentDropChance: 0, artifactDropChance: 0, qualityBias: 0, guardianEntityId: 'entity.boss.dao_domain_shadow', guardianPowerMultiplier: 1.16, guardianMechanicId: 'blood_frenzy' },
    { floor: 7, requiredRealmOrder: 90, rewardMultiplier: 1, equipmentTier: 7, equipmentDropChance: 0, artifactDropChance: 0, qualityBias: 0, guardianEntityId: 'entity.boss.dao_domain_shadow', guardianPowerMultiplier: 1.60, guardianMechanicId: 'iron_wall' },
    { floor: 8, requiredRealmOrder: 102, rewardMultiplier: 1, equipmentTier: 8, equipmentDropChance: 0, artifactDropChance: 0, qualityBias: 0, guardianEntityId: 'entity.boss.dao_domain_shadow', guardianPowerMultiplier: 1.70, guardianMechanicId: 'blood_frenzy' },
];
function earlyFloors(tierOffset = 0) {
    const guardians = [
        ['entity.elite.black_wind_wolf_king', 0.52, 'predator'],
        ['entity.elite.iron_hide_demon_bear', 0.64, 'iron_wall'],
        ['entity.boss.thunder_horn_rhino', 0.72, 'blood_frenzy'],
        ['entity.boss.blood_river_rogue', 0.82, 'soul_pressure'],
        ['entity.boss.thunder_horn_rhino', 0.98, 'iron_wall'],
        ['entity.boss.blood_river_rogue', 1.08, 'predator'],
    ];
    return [
        { floor: 1, requiredRealmOrder: 0, rewardMultiplier: 1.00, equipmentTier: Math.min(5, tierOffset + 0), equipmentDropChance: 0.28, artifactTier: Math.min(5, tierOffset + 0), artifactDropChance: 0.08, qualityBias: 0.00 },
        { floor: 2, requiredRealmOrder: 3, rewardMultiplier: 1.35, equipmentTier: Math.min(5, tierOffset + 0), equipmentDropChance: 0.34, artifactTier: Math.min(5, tierOffset + 0), artifactDropChance: 0.10, qualityBias: 0.08 },
        { floor: 3, requiredRealmOrder: 7, rewardMultiplier: 1.78, equipmentTier: Math.min(5, tierOffset + 1), equipmentDropChance: 0.42, artifactTier: Math.min(5, tierOffset + 1), artifactDropChance: 0.13, qualityBias: 0.15 },
        { floor: 4, requiredRealmOrder: 10, rewardMultiplier: 2.30, equipmentTier: Math.min(5, tierOffset + 1), equipmentDropChance: 0.50, artifactTier: Math.min(5, tierOffset + 1), artifactDropChance: 0.17, qualityBias: 0.22 },
        { floor: 5, requiredRealmOrder: 14, rewardMultiplier: 3.00, equipmentTier: Math.min(5, tierOffset + 2), equipmentDropChance: 0.58, artifactTier: Math.min(5, tierOffset + 2), artifactDropChance: 0.22, qualityBias: 0.30 },
        { floor: 6, requiredRealmOrder: 18, rewardMultiplier: 3.90, equipmentTier: Math.min(5, tierOffset + 2), equipmentDropChance: 0.65, artifactTier: Math.min(5, tierOffset + 2), artifactDropChance: 0.28, qualityBias: 0.38 },
    ].map((floor, index) => ({ ...floor, guardianEntityId: guardians[index][0], guardianPowerMultiplier: guardians[index][1], guardianMechanicId: guardians[index][2] }));
}
function lateFloors(kind) {
    const purple = [
        ['entity.elite.purple_mist_spider', 0.88, 14, 2, 2, 1.00, 0.42, 0.14, 0.18],
        ['entity.boss.purple_mirror_guardian', 0.94, 15, 2, 2, 1.35, 0.48, 0.18, 0.23],
        ['entity.boss.starfall_sword_ghost', 0.92, 16, 3, 2, 1.78, 0.54, 0.21, 0.28],
        ['entity.boss.purple_mirror_guardian', 1.03, 17, 3, 3, 2.30, 0.60, 0.25, 0.34],
        ['entity.boss.golden_core_fire_ape', 0.92, 18, 3, 3, 3.00, 0.66, 0.29, 0.40],
        ['entity.boss.starfall_sword_ghost', 1.08, 20, 4, 3, 3.90, 0.72, 0.34, 0.46],
    ];
    const golden = [
        ['entity.boss.golden_core_fire_ape', 0.94, 18, 3, 3, 1.00, 0.46, 0.18, 0.22],
        ['entity.boss.starfall_sword_ghost', 0.96, 18, 3, 3, 1.38, 0.52, 0.22, 0.28],
        ['entity.boss.purple_mirror_guardian', 1.08, 19, 4, 3, 1.85, 0.58, 0.26, 0.34],
        ['entity.boss.golden_core_fire_ape', 1.12, 20, 4, 4, 2.45, 0.64, 0.31, 0.40],
        ['entity.boss.starfall_sword_ghost', 1.18, 21, 4, 4, 3.20, 0.70, 0.36, 0.47],
        ['entity.boss.golden_core_fire_ape', 1.28, 21, 5, 4, 4.15, 0.76, 0.42, 0.54],
    ];
    const rows = kind === 'purple' ? purple : golden;
    return rows.map((row, index) => ({
        floor: index + 1,
        guardianEntityId: row[0], guardianPowerMultiplier: row[1], requiredRealmOrder: row[2],
        equipmentTier: row[3], artifactTier: row[4], rewardMultiplier: row[5],
        equipmentDropChance: row[6], artifactDropChance: row[7], qualityBias: row[8],
    }));
}
function soulFloors() {
    return [
        { floor: 1, requiredRealmOrder: 22, rewardMultiplier: 1.00, equipmentTier: 3, artifactTier: 3, equipmentDropChance: 0.40, artifactDropChance: 0.16, qualityBias: 0.18, guardianEntityId: 'entity.elite.soul_eater_wraith', guardianPowerMultiplier: 0.96 },
        { floor: 2, requiredRealmOrder: 22, rewardMultiplier: 1.42, equipmentTier: 3, artifactTier: 3, equipmentDropChance: 0.46, artifactDropChance: 0.20, qualityBias: 0.24, guardianEntityId: 'entity.boss.soul_pool_warden', guardianPowerMultiplier: 1.00 },
        { floor: 3, requiredRealmOrder: 23, rewardMultiplier: 1.92, equipmentTier: 4, artifactTier: 3, equipmentDropChance: 0.54, artifactDropChance: 0.24, qualityBias: 0.31, guardianEntityId: 'entity.boss.nascent_mirror_child', guardianPowerMultiplier: 1.04 },
        { floor: 4, requiredRealmOrder: 23, rewardMultiplier: 2.58, equipmentTier: 4, artifactTier: 4, equipmentDropChance: 0.60, artifactDropChance: 0.29, qualityBias: 0.37, guardianEntityId: 'entity.boss.soul_pool_warden', guardianPowerMultiplier: 1.14 },
        { floor: 5, requiredRealmOrder: 24, rewardMultiplier: 3.38, equipmentTier: 4, artifactTier: 4, equipmentDropChance: 0.67, artifactDropChance: 0.34, qualityBias: 0.43, guardianEntityId: 'entity.boss.nascent_mirror_child', guardianPowerMultiplier: 1.22 },
        { floor: 6, requiredRealmOrder: 25, rewardMultiplier: 4.35, equipmentTier: 5, artifactTier: 4, equipmentDropChance: 0.74, artifactDropChance: 0.40, qualityBias: 0.50, guardianEntityId: 'entity.boss.soul_pool_warden', guardianPowerMultiplier: 1.34 },
    ];
}
const V122_ATTIRE_SUFFIXES = ['weapon', 'head', 'robe', 'belt', 'gloves', 'boots'];
const V122_JEWELRY_SUFFIXES = ['necklace', 'ring', 'bracelet', 'talisman'];
function v122SetTemplateIds(set) {
    const prefix = set.category === 'attire' ? 'equipment.v116.attire' : 'equipment.v116.jewelry';
    const suffixes = set.category === 'attire' ? V122_ATTIRE_SUFFIXES : V122_JEWELRY_SUFFIXES;
    return suffixes.map(suffix => `${prefix}.${set.key}.${suffix}`);
}
function v122SetLoot(entries) {
    const equipment = [];
    const guardian = [];
    entries.forEach((set, index) => {
        const floor = index + 1, ids = v122SetTemplateIds(set);
        ids.forEach((templateId, slotIndex) => {
            equipment.push({ templateId, weight: 1, minFloor: floor, maxFloor: floor });
            guardian.push({ templateId, weight: 1, minFloor: floor, maxFloor: floor, ...(slotIndex === 0 ? { firstClearGuaranteed: true } : {}) });
        });
    });
    return { equipment, guardian };
}
function v122SetFloors(count, requiredStart, equipmentTier, guardianA, guardianB) {
    return Array.from({ length: count }, (_, index) => ({
        floor: index + 1, requiredRealmOrder: requiredStart + index, rewardMultiplier: 1 + index * .18, equipmentTier,
        equipmentDropChance: .35, artifactDropChance: 0, qualityBias: .16 + index * .035,
        guardianEntityId: index < count / 2 ? guardianA : guardianB, guardianPowerMultiplier: .82 + index * .10,
        guardianMechanicId: index % 2 === 0 ? 'iron_wall' : 'predator',
    }));
}
const v122ElementAttireSets = LIVE_EQUIPMENT_SET_CATALOG_V12310;
const v122ElementSetLoot = v122SetLoot(v122ElementAttireSets);
const V12310_ACCESSORY_TARGET_IDS = ['equipment.v12310.accessory.lingyu_necklace', 'equipment.v12310.accessory.pojun_ring', 'equipment.v12310.accessory.xuanyu_bracelet', 'equipment.v12310.accessory.dingshen_talisman'];
const v12310AccessoryLoot = V12310_ACCESSORY_TARGET_IDS.map((templateId, index) => ({ templateId, weight: 1, minFloor: index + 1, maxFloor: index + 1 }));
const v12310AccessoryGuardian = V12310_ACCESSORY_TARGET_IDS.map((templateId, index) => ({ templateId, weight: 1, minFloor: index + 1, maxFloor: index + 1, firstClearGuaranteed: true }));
export const dungeons = {
    ...RESOURCE_PVE_DUNGEON_DEFINITIONS_V12329,
    [V122_TARGET_SET_DUNGEONS.elementAttire]: {
        id: V122_TARGET_SET_DUNGEONS.elementAttire, name: 'Ngũ Hành Đạo Khố',
        description: 'Đạo khố chuyên Trang Phục Ngũ Hành. Mỗi tầng ứng với một bộ Kim/Mộc/Thủy/Hỏa/Thổ; first-clear bảo đảm một mảnh để mở bộ cho con đường craft, tái chiến có tỷ lệ thấp rơi thêm đúng bộ của tầng.',
        purpose: 'forging', tier: 2, danger: 64, tags: ['V122', 'TargetLoot', 'Set', 'FiveElements'],
        floors: v122SetFloors(v122ElementAttireSets.length, 10, 2, 'entity.boss.thunder_horn_rhino', 'entity.boss.earth_vein_guardian'),
        rewards: [], equipmentLoot: v122ElementSetLoot.equipment,
        guardianLoot: { equipmentLoot: v122ElementSetLoot.guardian, equipmentRepeatChancePct: V122_TARGET_SET_REPEAT_CHANCE_PCT },
        workerEquipmentRatePerYear: V122_TARGET_SET_WORKER_PIECES_PER_WORLD_YEAR,
    },
    [V122_TARGET_SET_DUNGEONS.daoAttire]: {
        id: V122_TARGET_SET_DUNGEONS.daoAttire, name: 'Bát Đạo Chân Điện',
        description: 'Tám điện thử Kiếm, Quyền, Thể, Pháp, Độc, Ngự Khí, Trận và Thần Niệm. Alpha.23.10 không còn rơi Set Bản Đạo: Trấn Phái đã chuyển thành Bí Tịch gắn với Chủ Đạo và tiến sâu bằng Đạo Hạnh từ chiến đấu thật.',
        purpose: 'dao', tier: 3, danger: 108, tags: ['V122', 'V12310', 'BattleDao', 'SectManualTraining'],
        floors: v122SetFloors(8, 18, 3, 'entity.boss.dao_echo_avatar', 'entity.boss.dao_domain_shadow').map(f => ({ ...f, equipmentDropChance: 0 })),
        rewards: [], equipmentLoot: [],
        workerEquipmentRatePerYear: 0,
    },
    [V122_TARGET_SET_DUNGEONS.jewelry]: {
        id: V122_TARGET_SET_DUNGEONS.jewelry, name: 'Linh Bội Bảo Khố',
        description: 'Nguồn nhắm đích cho 4 ô phụ kiện thường: Ngọc Bội, Nhẫn, Vòng và Hộ Phù. Phụ kiện không còn Set riêng; sức mạnh đến từ stat, affix, phẩm và Cường Hóa.',
        purpose: 'artifact', tier: 4, danger: 154, tags: ['V122', 'V12310', 'TargetLoot', 'Accessory'],
        floors: v122SetFloors(4, 26, 4, 'entity.boss.purple_mirror_guardian', 'entity.boss.soul_pool_warden'),
        rewards: [], equipmentLoot: v12310AccessoryLoot,
        guardianLoot: { equipmentLoot: v12310AccessoryGuardian, equipmentRepeatChancePct: V122_TARGET_SET_REPEAT_CHANCE_PCT },
        workerEquipmentRatePerYear: V122_TARGET_SET_WORKER_PIECES_PER_WORLD_YEAR,
    },
    [V122_FORGE_DUNGEON_ID]: {
        id: V122_FORGE_DUNGEON_ID, name: 'Thiên Công Luyện Vực',
        description: 'Phó bản nguyên liệu Luyện Khí tám tầng ứng với Phàm→Phá. Đây là nguồn nhắm đích cho Tinh Hoa Trang Bị, Tinh Khoáng, Chuyển Tính Thạch, Bùa Chống Tụt và Ngọc Chuyển Cường Hóa; sản lượng Tinh Hoa được neo trực tiếp vào chi phí craft cùng phẩm để không vỡ ở late-game.',
        purpose: 'forging', tier: 2, danger: 72, tags: ['V122', 'TargetLoot', 'Forging', 'Economy'],
        floors: V122_FORGE_FLOORS.map((f, index) => ({ floor: f.floor, requiredRealmOrder: f.requiredRealmOrder, rewardMultiplier: 1, equipmentTier: Math.min(20, index * 2 + 1), equipmentDropChance: .08, artifactDropChance: 0, qualityBias: .12 + index * .06, guardianEntityId: index < 4 ? 'entity.boss.golden_core_fire_ape' : 'entity.boss.earth_vein_guardian', guardianPowerMultiplier: .86 + index * .14, guardianMechanicId: index % 2 === 0 ? 'iron_wall' : 'blood_frenzy' })),
        rewards: V122_FORGE_FLOORS.flatMap(f => f.rewards),
        guardianLoot: { resources: V122_FORGE_FLOORS.flatMap(f => f.guardianResources) },
        workerRewardRounding: 'stochastic',
    },
    'dungeon.spirit_gathering_cave': {
        id: 'dungeon.spirit_gathering_cave',
        name: 'Tụ Linh Động',
        description: 'Phó bản tu luyện cơ bản. Tầng càng sâu, linh áp càng cao và trang bị Linh hệ càng tốt.',
        purpose: 'cultivation', tier: 1, danger: 12, tags: ['Spirit', 'Cultivation'], floors: earlyFloors(0).map(f => f.floor === 1 ? { ...f, guardianEntityId: 'entity.guardian.spirit_gathering_trial_wolf', guardianPowerMultiplier: 1.35, guardianMechanicId: undefined } : f),
        rewards: [
            { resourceId: 'resource.cultivation_essence', name: 'Tu Vi Tinh Hoa', baseYieldPerYear: 10, rarity: 'common' },
            { resourceId: 'resource.spirit_stone', name: 'Hạ Phẩm Linh Thạch', baseYieldPerYear: 4, rarity: 'common' },
        ],
        guardianLoot: {
            resources: [{ resourceId: 'resource.cultivation_essence', name: 'Tu Vi Tinh Hoa', amount: 18 }],
            equipmentLoot: [
                { templateId: 'equipment.thunder_ring', weight: 1, firstClearGuaranteed: true },
                { templateId: 'equipment.stoneheart_talisman', weight: 1, firstClearGuaranteed: true },
                { templateId: 'equipment.cloudstep_token', weight: 1, firstClearGuaranteed: true },
                { templateId: 'equipment.thunder_robe', weight: 0.8 },
            ],
        },
        equipmentLoot: [
            { templateId: 'equipment.thunder_robe', weight: 1.0, minFloor: 2 },
            { templateId: 'equipment.thunder_ring', weight: 1.0, minFloor: 1 },
            { templateId: 'equipment.stoneheart_talisman', weight: 0.85, minFloor: 1, maxFloor: 2 },
            { templateId: 'equipment.cloudstep_token', weight: 0.85, minFloor: 1, maxFloor: 2 },
            { templateId: 'equipment.thunder_boots', weight: 0.7, minFloor: 3 },
        ],
    },
    'dungeon.hundred_herb_garden': {
        id: 'dungeon.hundred_herb_garden',
        name: 'Bách Thảo Viên',
        description: 'Dược viên bỏ hoang. Tầng sâu hơn có dược khí tinh thuần và trang bị phụ trợ Đan Tu.',
        purpose: 'alchemy', tier: 1, danger: 16, tags: ['Herb', 'Alchemy'], floors: earlyFloors(0),
        rewards: [
            { resourceId: 'resource.spirit_herb', name: 'Tụ Linh Thảo', baseYieldPerYear: 7, rarity: 'common' },
            { resourceId: 'resource.alchemy_essence', name: 'Dược Tính Tinh Hoa', baseYieldPerYear: 2.8, rarity: 'uncommon' },
        ],
        guardianLoot: { resources: [{ resourceId: 'resource.alchemy_essence', name: 'Dược Tính Tinh Hoa', amount: 8 }], equipmentLoot: [{ templateId: 'equipment.herbalist_charm', weight: 1, firstClearGuaranteed: true }] },
        equipmentLoot: [{ templateId: 'equipment.herbalist_charm', weight: 1.0 }],
    },
    'dungeon.black_iron_mine': {
        id: 'dungeon.black_iron_mine',
        name: 'Huyền Thiết Khoáng Động',
        description: 'Khoáng động nhiều yêu khí. Tầng sâu cho quặng và trang bị thiên về thân thể, phòng ngự, trọng binh.',
        purpose: 'forging', tier: 1, danger: 24, tags: ['Ore', 'Forging'], floors: earlyFloors(0),
        rewards: [
            { resourceId: 'resource.black_iron_ore', name: 'Huyền Thiết Khoáng', baseYieldPerYear: 6, rarity: 'common' },
            { resourceId: 'resource.forging_essence', name: 'Khí Luyện Tinh Hoa', baseYieldPerYear: 2.2, rarity: 'uncommon' },
        ],
        guardianLoot: { resources: [{ resourceId: 'resource.forging_essence', name: 'Khí Luyện Tinh Hoa', amount: 8 }], equipmentLoot: [{ templateId: 'equipment.black_iron_blade', weight: 1, firstClearGuaranteed: true }, { templateId: 'equipment.black_iron_armor', weight: 1 }] },
        equipmentLoot: [
            { templateId: 'equipment.black_iron_blade', weight: 1 },
            { templateId: 'equipment.black_iron_armor', weight: 1 },
        ],
    },
    'dungeon.ruined_treasure_pavilion': {
        id: 'dungeon.ruined_treasure_pavilion',
        name: 'Tàn Bảo Các',
        description: 'Tàn tích khí các cổ. Loot pool thiên pháp bảo/trang bị hiếm và các mảnh của nhiều bộ khác nhau.',
        purpose: 'artifact', tier: 1, danger: 32, tags: ['Artifact', 'Treasure'], floors: earlyFloors(0),
        rewards: [
            { resourceId: 'resource.artifact_dust', name: 'Bảo Khí Tàn Tinh', baseYieldPerYear: 3.2, rarity: 'uncommon' },
            { resourceId: 'resource.sword_fragment', name: 'Tàn Kiếm Phiến', baseYieldPerYear: 1.2, rarity: 'rare' },
        ],
        guardianLoot: {
            resources: [{ resourceId: 'resource.artifact_dust', name: 'Bảo Khí Tàn Tinh', amount: 7 }],
            equipmentLoot: [{ templateId: 'equipment.qingfeng_sword', weight: 1, firstClearGuaranteed: true }, { templateId: 'equipment.thunder_sword', weight: 0.7, minFloor: 3 }],
            artifactLoot: [{ templateId: 'artifact.green_spirit_gourd', weight: 1, minFloor: 2 }, { templateId: 'artifact.spirit_suppressing_bell', weight: 0.8, minFloor: 3, firstClearGuaranteed: true }, { templateId: 'artifact.true_sight_mirror', weight: 0.62, minFloor: 2 }, { templateId: 'artifact.mountain_breaking_seal', weight: 0.58, minFloor: 3 }, { templateId: 'artifact.blood_severing_gourd', weight: 0.52, minFloor: 4 }, { templateId: 'artifact.thunder_punishment_sword', weight: 0.4, minFloor: 5 }],
        },
        equipmentLoot: [
            { templateId: 'equipment.qingfeng_sword', weight: 0.9 },
            { templateId: 'equipment.qingfeng_head', weight: 0.8, minFloor: 2 },
            { templateId: 'equipment.qingfeng_boots', weight: 0.8, minFloor: 2 },
            { templateId: 'equipment.thunder_sword', weight: 0.7, minFloor: 3 },
            { templateId: 'equipment.thunder_ring', weight: 0.7 },
        ],
        artifactLoot: [
            { templateId: 'artifact.green_spirit_gourd', weight: 1.1, minFloor: 1 },
            { templateId: 'artifact.spirit_suppressing_bell', weight: 0.85, minFloor: 2 },
            { templateId: 'artifact.thunder_guiding_mirror', weight: 0.75, minFloor: 3 },
            { templateId: 'artifact.thunder_punishment_sword', weight: 0.55, minFloor: 4 },
            { templateId: 'artifact.true_sight_mirror', weight: 0.70, minFloor: 2 },
            { templateId: 'artifact.mountain_breaking_seal', weight: 0.65, minFloor: 3 },
            { templateId: 'artifact.blood_severing_gourd', weight: 0.60, minFloor: 4 },
        ],
    },
    'dungeon.beast_taming_valley': {
        id: 'dungeon.beast_taming_valley',
        name: 'Ngự Thú Cốc',
        description: 'Sơn cốc nhiều linh thú non. Hiện chủ yếu rơi tài nguyên linh thú; equipment pool sẽ mở rộng cùng hệ Ngự Thú.',
        purpose: 'beast', tier: 1, danger: 35, tags: ['Beast', 'Bloodline'], floors: earlyFloors(0),
        guardianLoot: { resources: [{ resourceId: 'resource.beast_essence', name: 'Yêu Thú Tinh Nguyên', amount: 10 }] },
        rewards: [
            { resourceId: 'resource.beast_essence', name: 'Yêu Thú Tinh Nguyên', baseYieldPerYear: 3.5, rarity: 'uncommon' },
            { resourceId: 'resource.beast_food', name: 'Linh Thú Huyết Thực', baseYieldPerYear: 6, rarity: 'common' },
        ],
    },
    'dungeon.rune_tower': {
        id: 'dungeon.rune_tower',
        name: 'Phù Văn Tháp',
        description: 'Cổ tháp khắc đầy phù văn. Tầng sâu sẽ là nguồn bộ Phù/Trận chuyên dụng.',
        purpose: 'talisman', tier: 2, danger: 46, tags: ['Talisman', 'Formation'], floors: earlyFloors(1),
        guardianLoot: { resources: [{ resourceId: 'resource.rune_insight', name: 'Phù Văn Cảm Ngộ', amount: 6 }] },
        rewards: [
            { resourceId: 'resource.talisman_paper', name: 'Linh Phù Chỉ', baseYieldPerYear: 4.5, rarity: 'common' },
            { resourceId: 'resource.rune_insight', name: 'Phù Văn Cảm Ngộ', baseYieldPerYear: 1.8, rarity: 'uncommon' },
        ],
    },
    'dungeon.purple_mirror_palace': {
        id: 'dungeon.purple_mirror_palace',
        name: 'Tử Kính Huyền Cung',
        description: 'Phó bản Tử Phủ. Kính quang và thần niệm đan xen; tầng sâu bắt đầu rơi bộ Tử Kính và pháp bảo dưỡng thần.',
        purpose: 'artifact', tier: 2, danger: 78, tags: ['PurplePalace', 'Mirror', 'Spirit'], floors: lateFloors('purple'),
        rewards: [
            { resourceId: 'resource.purple_mansion_essence', name: 'Tử Phủ Tinh Hoa', baseYieldPerYear: 2.8, rarity: 'uncommon' },
            { resourceId: 'resource.mirror_jade', name: 'Huyền Kính Ngọc', baseYieldPerYear: 1.1, rarity: 'rare' },
        ],
        guardianLoot: {
            resources: [{ resourceId: 'resource.purple_mansion_essence', name: 'Tử Phủ Tinh Hoa', amount: 9 }],
            equipmentLoot: [
                { templateId: 'equipment.purple_mirror_ring', weight: 1.0, firstClearGuaranteed: true },
                { templateId: 'equipment.purple_mirror_crown', weight: 0.9, minFloor: 2 },
                { templateId: 'equipment.purple_mirror_robe', weight: 0.8, minFloor: 3 },
                { templateId: 'equipment.purple_mirror_boots', weight: 0.75, minFloor: 4 },
            ],
            artifactLoot: [
                { templateId: 'artifact.purple_mansion_lamp', weight: 1.0, minFloor: 2, firstClearGuaranteed: true },
                { templateId: 'artifact.starfall_sword_box', weight: 0.45, minFloor: 5 },
            ],
        },
        equipmentLoot: [
            { templateId: 'equipment.purple_mirror_ring', weight: 1.0 },
            { templateId: 'equipment.purple_mirror_crown', weight: 0.9, minFloor: 2 },
            { templateId: 'equipment.purple_mirror_robe', weight: 0.85, minFloor: 2 },
            { templateId: 'equipment.purple_mirror_boots', weight: 0.8, minFloor: 3 },
            { templateId: 'equipment.starfall_sword', weight: 0.45, minFloor: 5 },
        ],
        artifactLoot: [
            { templateId: 'artifact.purple_mansion_lamp', weight: 1.0, minFloor: 1 },
            { templateId: 'artifact.starfall_sword_box', weight: 0.55, minFloor: 4 },
        ],
    },
    'dungeon.golden_core_furnace': {
        id: 'dungeon.golden_core_furnace',
        name: 'Kim Đan Hỏa Lô',
        description: 'Cổ lô từng dùng luyện đại đan. Nhiệt và Đan Hỏa tăng mạnh theo tầng, là nguồn bộ Kim Đan và vật liệu cao cấp.',
        purpose: 'alchemy', tier: 3, danger: 96, tags: ['GoldenCore', 'Fire', 'Alchemy'], floors: lateFloors('golden'),
        rewards: [
            { resourceId: 'resource.golden_core_essence', name: 'Kim Đan Tinh Hoa', baseYieldPerYear: 2.2, rarity: 'uncommon' },
            { resourceId: 'resource.core_fire_crystal', name: 'Đan Hỏa Tinh', baseYieldPerYear: 0.9, rarity: 'rare' },
        ],
        guardianLoot: {
            resources: [{ resourceId: 'resource.golden_core_essence', name: 'Kim Đan Tinh Hoa', amount: 10 }],
            equipmentLoot: [
                { templateId: 'equipment.golden_core_ring', weight: 1.0, firstClearGuaranteed: true },
                { templateId: 'equipment.golden_core_robe', weight: 0.9, minFloor: 2 },
                { templateId: 'equipment.golden_core_blade', weight: 0.85, minFloor: 3 },
                { templateId: 'equipment.starfall_sword', weight: 0.55, minFloor: 4 },
            ],
            artifactLoot: [
                { templateId: 'artifact.golden_core_cauldron', weight: 1.0, minFloor: 2, firstClearGuaranteed: true },
                { templateId: 'artifact.starfall_sword_box', weight: 0.55, minFloor: 4 },
            ],
        },
        equipmentLoot: [
            { templateId: 'equipment.golden_core_ring', weight: 1.0 },
            { templateId: 'equipment.golden_core_robe', weight: 0.9, minFloor: 2 },
            { templateId: 'equipment.golden_core_blade', weight: 0.85, minFloor: 3 },
            { templateId: 'equipment.starfall_sword', weight: 0.65, minFloor: 4 },
        ],
        artifactLoot: [
            { templateId: 'artifact.golden_core_cauldron', weight: 1.0, minFloor: 1 },
            { templateId: 'artifact.starfall_sword_box', weight: 0.65, minFloor: 3 },
        ],
    },
    'dungeon.soul_nourishing_pool': {
        id: 'dungeon.soul_nourishing_pool',
        name: 'Dưỡng Hồn Trì',
        description: 'Phó bản Nguyên Anh sáu tầng. Tầng sâu trực tiếp phục vụ Thần Hồn, Khống Chế, Phân Thân và bảo vật hồn hệ.',
        purpose: 'soul', tier: 4, danger: 128, tags: ['Soul', 'Clone', 'NascentSoul'], floors: soulFloors(),
        guardianLoot: {
            resources: [{ resourceId: 'resource.soul_essence', name: 'Thần Hồn Tinh Hoa', amount: 7 }, { resourceId: 'resource.soul_dew', name: 'Dưỡng Hồn Lộ', amount: 12 }],
            equipmentLoot: [
                { templateId: 'equipment.soul_crown', weight: 1.0, firstClearGuaranteed: true },
                { templateId: 'equipment.soul_robe', weight: 0.9, minFloor: 2 },
                { templateId: 'equipment.soul_ring', weight: 0.85, minFloor: 3 },
                { templateId: 'equipment.soul_boots', weight: 0.75, minFloor: 4 },
            ],
            artifactLoot: [
                { templateId: 'artifact.soul_nourishing_lotus', weight: 1.0, minFloor: 2, firstClearGuaranteed: true },
                { templateId: 'artifact.nascent_soul_banner', weight: 0.55, minFloor: 5 },
            ],
        },
        rewards: [
            { resourceId: 'resource.soul_dew', name: 'Dưỡng Hồn Lộ', baseYieldPerYear: 3.4, rarity: 'uncommon' },
            { resourceId: 'resource.soul_essence', name: 'Thần Hồn Tinh Hoa', baseYieldPerYear: 1.25, rarity: 'rare' },
        ],
        equipmentLoot: [
            { templateId: 'equipment.soul_crown', weight: 1.0 },
            { templateId: 'equipment.soul_robe', weight: 0.9, minFloor: 2 },
            { templateId: 'equipment.soul_ring', weight: 0.85, minFloor: 3 },
            { templateId: 'equipment.soul_boots', weight: 0.8, minFloor: 4 },
        ],
        artifactLoot: [
            { templateId: 'artifact.soul_nourishing_lotus', weight: 1.0, minFloor: 2 },
            { templateId: 'artifact.nascent_soul_banner', weight: 0.55, minFloor: 4 },
        ],
    },
    'dungeon.dao_comprehension_platform': {
        id: 'dungeon.dao_comprehension_platform',
        name: 'Ngộ Đạo Đài',
        description: 'Hóa Thần phó bản. Đạo vận hội tụ thành từng tầng áp lực; càng sâu càng dễ thu được Đạo Ngân và cảm ngộ cô đọng.',
        purpose: 'dao', tier: 4, danger: 188, tags: ['Dao', 'SpiritTransformation', 'Comprehension'],
        floors: [
            { floor: 1, requiredRealmOrder: 26, rewardMultiplier: 1.00, equipmentTier: 5, artifactTier: 4, equipmentDropChance: 0.36, artifactDropChance: 0.14, qualityBias: 0.34, guardianEntityId: 'entity.boss.dao_echo_avatar', guardianPowerMultiplier: 1.00 },
            { floor: 2, requiredRealmOrder: 26, rewardMultiplier: 1.48, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.42, artifactDropChance: 0.18, qualityBias: 0.40, guardianEntityId: 'entity.boss.dao_echo_avatar', guardianPowerMultiplier: 1.12 },
            { floor: 3, requiredRealmOrder: 27, rewardMultiplier: 2.08, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.49, artifactDropChance: 0.22, qualityBias: 0.46, guardianEntityId: 'entity.boss.dao_domain_shadow', guardianPowerMultiplier: 1.00 },
            { floor: 4, requiredRealmOrder: 28, rewardMultiplier: 2.82, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.56, artifactDropChance: 0.26, qualityBias: 0.52, guardianEntityId: 'entity.boss.dao_domain_shadow', guardianPowerMultiplier: 1.12 },
            { floor: 5, requiredRealmOrder: 29, rewardMultiplier: 3.72, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.63, artifactDropChance: 0.31, qualityBias: 0.58, guardianEntityId: 'entity.boss.dao_domain_shadow', guardianPowerMultiplier: 1.24 },
        ],
        rewards: [
            { resourceId: 'resource.dao_essence', name: 'Đạo Vận Tinh Hoa', baseYieldPerYear: 1.8, rarity: 'uncommon' },
            { resourceId: 'resource.dao_mark_fragment', name: 'Đạo Ngân Tàn Phiến', baseYieldPerYear: 0.55, rarity: 'rare' },
        ],
        guardianLoot: { resources: [
                { resourceId: 'resource.dao_essence', name: 'Đạo Vận Tinh Hoa', amount: 7 },
                { resourceId: 'resource.dao_mark_fragment', name: 'Đạo Ngân Tàn Phiến', amount: 2 },
            ] },
    },
    'dungeon.void_rift': {
        id: 'dungeon.void_rift',
        name: 'Hư Không Liệt Giới',
        description: 'Luyện Hư phó bản. Mỗi tầng là một đoạn không gian bị xé khỏi thế giới; tài nguyên chủ yếu phục vụ Không Gian Đạo và vượt giới.',
        purpose: 'space', tier: 5, danger: 248, tags: ['Space', 'Void', 'VoidRefinement'],
        floors: [
            { floor: 1, requiredRealmOrder: 30, rewardMultiplier: 1.00, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.42, artifactDropChance: 0.16, qualityBias: 0.40, guardianEntityId: 'entity.elite.void_rift_stalker', guardianPowerMultiplier: 1.00 },
            { floor: 2, requiredRealmOrder: 30, rewardMultiplier: 1.52, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.48, artifactDropChance: 0.20, qualityBias: 0.46, guardianEntityId: 'entity.elite.void_rift_stalker', guardianPowerMultiplier: 1.16 },
            { floor: 3, requiredRealmOrder: 31, rewardMultiplier: 2.18, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.54, artifactDropChance: 0.24, qualityBias: 0.52, guardianEntityId: 'entity.boss.void_gate_warden', guardianPowerMultiplier: 1.00 },
            { floor: 4, requiredRealmOrder: 32, rewardMultiplier: 3.02, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.60, artifactDropChance: 0.29, qualityBias: 0.58, guardianEntityId: 'entity.boss.void_gate_warden', guardianPowerMultiplier: 1.14 },
            { floor: 5, requiredRealmOrder: 33, rewardMultiplier: 4.05, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.67, artifactDropChance: 0.34, qualityBias: 0.64, guardianEntityId: 'entity.boss.void_gate_warden', guardianPowerMultiplier: 1.30 },
        ],
        rewards: [
            { resourceId: 'resource.void_crystal', name: 'Hư Không Tinh', baseYieldPerYear: 1.35, rarity: 'rare' },
            { resourceId: 'resource.space_mark_fragment', name: 'Không Gian Tắc Phiến', baseYieldPerYear: 0.42, rarity: 'rare' },
        ],
        guardianLoot: { resources: [
                { resourceId: 'resource.void_crystal', name: 'Hư Không Tinh', amount: 8 },
                { resourceId: 'resource.space_mark_fragment', name: 'Không Gian Tắc Phiến', amount: 2 },
            ], equipmentLoot: [
                { templateId: 'equipment.starfall_sword', weight: 1.0, firstClearGuaranteed: true },
                { templateId: 'equipment.purple_mirror_ring', weight: 0.7, minFloor: 2 },
            ], artifactLoot: [
                { templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 },
                { templateId: 'artifact.nascent_soul_banner', weight: 0.55, minFloor: 4 },
            ] },
        equipmentLoot: [
            { templateId: 'equipment.starfall_sword', weight: 1.0 },
            { templateId: 'equipment.purple_mirror_ring', weight: 0.75, minFloor: 2 },
        ],
        artifactLoot: [
            { templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 },
            { templateId: 'artifact.nascent_soul_banner', weight: 0.55, minFloor: 4 },
        ],
    },
    'dungeon.integration_crucible': {
        id: 'dungeon.integration_crucible',
        name: 'Tam Nguyên Hợp Lô',
        description: 'Hợp Thể phó bản. Mỗi tầng ép nhục thân, Thần Hồn, Chủ Đạo và pháp bảo cùng chịu một nhịp; lệch một hệ sẽ trở thành điểm vỡ.',
        purpose: 'integration', tier: 6, danger: 330, tags: ['Integration', 'Body', 'Soul', 'Dao'],
        floors: [
            { floor: 1, requiredRealmOrder: 34, rewardMultiplier: 1.00, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.48, artifactDropChance: 0.20, qualityBias: 0.48, guardianEntityId: 'entity.boss.three_origin_avatar', guardianPowerMultiplier: 0.92 },
            { floor: 2, requiredRealmOrder: 34, rewardMultiplier: 1.55, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.54, artifactDropChance: 0.24, qualityBias: 0.54, guardianEntityId: 'entity.boss.three_origin_avatar', guardianPowerMultiplier: 1.02 },
            { floor: 3, requiredRealmOrder: 35, rewardMultiplier: 2.25, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.60, artifactDropChance: 0.28, qualityBias: 0.60, guardianEntityId: 'entity.boss.three_origin_avatar', guardianPowerMultiplier: 1.12 },
            { floor: 4, requiredRealmOrder: 36, rewardMultiplier: 3.15, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.66, artifactDropChance: 0.32, qualityBias: 0.66, guardianEntityId: 'entity.boss.three_origin_avatar', guardianPowerMultiplier: 1.24 },
            { floor: 5, requiredRealmOrder: 37, rewardMultiplier: 4.30, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.72, artifactDropChance: 0.37, qualityBias: 0.72, guardianEntityId: 'entity.boss.three_origin_avatar', guardianPowerMultiplier: 1.38 },
        ],
        rewards: [
            { resourceId: 'resource.integration_essence', name: 'Hợp Nguyên Tinh Hoa', baseYieldPerYear: 1.10, rarity: 'rare' },
            { resourceId: 'resource.unity_fragment', name: 'Tam Nguyên Đồng Văn', baseYieldPerYear: 0.34, rarity: 'rare' },
        ],
        guardianLoot: { resources: [
                { resourceId: 'resource.integration_essence', name: 'Hợp Nguyên Tinh Hoa', amount: 9 },
                { resourceId: 'resource.unity_fragment', name: 'Tam Nguyên Đồng Văn', amount: 2 },
            ], equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0, firstClearGuaranteed: true }], artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.75, minFloor: 2 }] },
        equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0 }, { templateId: 'equipment.golden_core_robe', weight: 0.65, minFloor: 2 }],
        artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 }, { templateId: 'artifact.nascent_soul_banner', weight: 0.6, minFloor: 3 }],
    },
    'dungeon.great_vehicle_domain': {
        id: 'dungeon.great_vehicle_domain', name: 'Vạn Đạo Thiên Mạc',
        description: 'Đại Thừa phó bản. Không chỉ chịu một Đạo Vực, người vào phải giữ Đạo của mình ổn định khi phạm vi áp đặt mở rộng tới quy mô thiên địa cục bộ.',
        purpose: 'great_vehicle', tier: 7, danger: 430, tags: ['GreatVehicle', 'Dao', 'Domain'],
        floors: [
            { floor: 1, requiredRealmOrder: 38, rewardMultiplier: 1.00, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.50, artifactDropChance: 0.22, qualityBias: 0.55, guardianEntityId: 'entity.elite.great_vehicle_domain_beast', guardianPowerMultiplier: 0.95 },
            { floor: 2, requiredRealmOrder: 38, rewardMultiplier: 1.60, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.56, artifactDropChance: 0.26, qualityBias: 0.60, guardianEntityId: 'entity.elite.great_vehicle_domain_beast', guardianPowerMultiplier: 1.10 },
            { floor: 3, requiredRealmOrder: 39, rewardMultiplier: 2.35, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.62, artifactDropChance: 0.30, qualityBias: 0.66, guardianEntityId: 'entity.boss.great_vehicle_heaven_lord', guardianPowerMultiplier: 1.00 },
            { floor: 4, requiredRealmOrder: 40, rewardMultiplier: 3.30, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.68, artifactDropChance: 0.34, qualityBias: 0.72, guardianEntityId: 'entity.boss.great_vehicle_heaven_lord', guardianPowerMultiplier: 1.16 },
            { floor: 5, requiredRealmOrder: 41, rewardMultiplier: 4.55, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.74, artifactDropChance: 0.39, qualityBias: 0.78, guardianEntityId: 'entity.boss.great_vehicle_heaven_lord', guardianPowerMultiplier: 1.34 },
        ],
        rewards: [
            { resourceId: 'resource.great_vehicle_essence', name: 'Đại Thừa Đạo Tinh', baseYieldPerYear: 1.05, rarity: 'rare' },
            { resourceId: 'resource.domain_anchor', name: 'Vực Giới Đạo Đinh', baseYieldPerYear: 0.26, rarity: 'rare' },
        ],
        guardianLoot: { resources: [{ resourceId: 'resource.great_vehicle_essence', name: 'Đại Thừa Đạo Tinh', amount: 10 }, { resourceId: 'resource.domain_anchor', name: 'Vực Giới Đạo Đinh', amount: 2 }] },
    },
    'dungeon.heavenly_tribulation_field': {
        id: 'dungeon.heavenly_tribulation_field', name: 'Thiên Kiếp Cổ Trường',
        description: 'Độ Kiếp phó bản. Tàn ý của lôi kiếp, tâm ma, nghiệp hỏa và Đạo phán quyết vẫn lưu lại; dùng để luyện phản ứng trước Thiên Kiếp thật.',
        purpose: 'tribulation', tier: 8, danger: 520, tags: ['Tribulation', 'Heaven', 'Calamity'],
        floors: [
            { floor: 1, requiredRealmOrder: 42, rewardMultiplier: 1.00, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.52, artifactDropChance: 0.24, qualityBias: 0.60, guardianEntityId: 'entity.elite.tribulation_thunder_avatar', guardianPowerMultiplier: 0.96 },
            { floor: 2, requiredRealmOrder: 43, rewardMultiplier: 1.72, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.59, artifactDropChance: 0.28, qualityBias: 0.66, guardianEntityId: 'entity.elite.tribulation_thunder_avatar', guardianPowerMultiplier: 1.14 },
            { floor: 3, requiredRealmOrder: 44, rewardMultiplier: 2.65, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.66, artifactDropChance: 0.33, qualityBias: 0.72, guardianEntityId: 'entity.boss.heart_demon_tribulation', guardianPowerMultiplier: 1.04 },
            { floor: 4, requiredRealmOrder: 45, rewardMultiplier: 3.90, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.73, artifactDropChance: 0.38, qualityBias: 0.80, guardianEntityId: 'entity.boss.heart_demon_tribulation', guardianPowerMultiplier: 1.24 },
        ],
        rewards: [
            { resourceId: 'resource.tribulation_essence', name: 'Kiếp Vận Tinh Hoa', baseYieldPerYear: 0.92, rarity: 'rare' },
            { resourceId: 'resource.heaven_mark', name: 'Thiên Ngân', baseYieldPerYear: 0.20, rarity: 'rare' },
        ],
        guardianLoot: { resources: [{ resourceId: 'resource.tribulation_essence', name: 'Kiếp Vận Tinh Hoa', amount: 11 }, { resourceId: 'resource.heaven_mark', name: 'Thiên Ngân', amount: 2 }] },
    },
    'dungeon.immortal_spirit_pool': {
        id: 'dungeon.immortal_spirit_pool', name: 'Tiên Linh Tẩy Trì',
        description: 'Nhân Tiên phó bản. Linh khí phàm cấp bị lọc bỏ, chỉ còn Tiên Khí và tàn pháp tắc đủ để rèn Tiên Nguyên, Tiên Thể và khả năng thích nghi luật Tiên giới.',
        purpose: 'immortal', tier: 9, danger: 620, tags: ['Immortal', 'HumanImmortal', 'ImmortalQi'],
        floors: [
            { floor: 1, requiredRealmOrder: 46, rewardMultiplier: 1.00, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.56, artifactDropChance: 0.26, qualityBias: 0.66, guardianEntityId: 'entity.elite.immortal_spirit_crane', guardianPowerMultiplier: 0.94 },
            { floor: 2, requiredRealmOrder: 46, rewardMultiplier: 1.58, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.62, artifactDropChance: 0.30, qualityBias: 0.72, guardianEntityId: 'entity.elite.immortal_spirit_crane', guardianPowerMultiplier: 1.10 },
            { floor: 3, requiredRealmOrder: 47, rewardMultiplier: 2.38, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.68, artifactDropChance: 0.34, qualityBias: 0.78, guardianEntityId: 'entity.boss.immortal_pool_warden', guardianPowerMultiplier: 1.00 },
            { floor: 4, requiredRealmOrder: 48, rewardMultiplier: 3.42, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.74, artifactDropChance: 0.39, qualityBias: 0.84, guardianEntityId: 'entity.boss.immortal_pool_warden', guardianPowerMultiplier: 1.16 },
            { floor: 5, requiredRealmOrder: 49, rewardMultiplier: 4.82, equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.80, artifactDropChance: 0.44, qualityBias: 0.90, guardianEntityId: 'entity.boss.immortal_pool_warden', guardianPowerMultiplier: 1.34 },
        ],
        rewards: [
            { resourceId: 'resource.immortal_qi', name: 'Tiên Khí Tinh Túy', baseYieldPerYear: 1.18, rarity: 'rare' },
            { resourceId: 'resource.immortal_law_fragment', name: 'Tiên Tắc Tàn Phiến', baseYieldPerYear: 0.24, rarity: 'rare' },
        ],
        guardianLoot: { resources: [{ resourceId: 'resource.immortal_qi', name: 'Tiên Khí Tinh Túy', amount: 14 }, { resourceId: 'resource.immortal_law_fragment', name: 'Tiên Tắc Tàn Phiến', amount: 2 }] },
    },
    'dungeon.earth_immortal_vein': {
        id: 'dungeon.earth_immortal_vein', name: 'Địa Mạch Tiên Phủ', description: 'Địa Tiên phó bản. Tiên địa mạch liên tục đổi áp lực; người tu phải giữ Tiên Nguyên neo vào thân mà không để địa khí đồng hóa.', purpose: 'earth_immortal', tier: 10, danger: 760, tags: ['Immortal', 'EarthImmortal', 'EarthVein'],
        floors: [1, 2, 3, 4, 5].map((floor, i) => ({ floor, requiredRealmOrder: [50, 50, 51, 52, 53][i], rewardMultiplier: [1, 1.65, 2.5, 3.6, 5.0][i], equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.60 + i * 0.055, artifactDropChance: 0.28 + i * 0.045, qualityBias: 0.70 + i * 0.055, guardianEntityId: 'entity.boss.earth_vein_guardian', guardianPowerMultiplier: [0.92, 1.04, 1.14, 1.25, 1.38][i] })),
        rewards: [{ resourceId: 'resource.earth_immortal_essence', name: 'Địa Tiên Mạch Tinh', baseYieldPerYear: 1.06, rarity: 'rare' }, { resourceId: 'resource.earth_law_jade', name: 'Địa Luật Tiên Ngọc', baseYieldPerYear: 0.22, rarity: 'rare' }],
        guardianLoot: { resources: [{ resourceId: 'resource.earth_immortal_essence', name: 'Địa Tiên Mạch Tinh', amount: 16 }, { resourceId: 'resource.earth_law_jade', name: 'Địa Luật Tiên Ngọc', amount: 2 }] },
    },
    'dungeon.heaven_immortal_palace': {
        id: 'dungeon.heaven_immortal_palace', name: 'Thiên Luật Vân Cung', description: 'Thiên Tiên phó bản. Thiên khí lưu động thành luật; đứng yên quá cứng hay cưỡng hành quá mạnh đều bị thiên lưu bỏ lại.', purpose: 'heaven_immortal', tier: 11, danger: 910, tags: ['Immortal', 'HeavenImmortal', 'HeavenLaw'],
        floors: [1, 2, 3, 4, 5].map((floor, i) => ({ floor, requiredRealmOrder: [54, 54, 55, 56, 57][i], rewardMultiplier: [1, 1.7, 2.6, 3.75, 5.25][i], equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.63 + i * 0.055, artifactDropChance: 0.31 + i * 0.045, qualityBias: 0.74 + i * 0.05, guardianEntityId: 'entity.boss.heaven_law_warden', guardianPowerMultiplier: [0.93, 1.05, 1.16, 1.28, 1.42][i] })),
        rewards: [{ resourceId: 'resource.heaven_immortal_essence', name: 'Thiên Luật Thanh Khí', baseYieldPerYear: 0.98, rarity: 'rare' }, { resourceId: 'resource.celestial_law_thread', name: 'Thiên Tắc Tiên Ty', baseYieldPerYear: 0.20, rarity: 'rare' }],
        guardianLoot: { resources: [{ resourceId: 'resource.heaven_immortal_essence', name: 'Thiên Luật Thanh Khí', amount: 18 }, { resourceId: 'resource.celestial_law_thread', name: 'Thiên Tắc Tiên Ty', amount: 2 }] },
    },
    'dungeon.true_immortal_law_sea': {
        id: 'dungeon.true_immortal_law_sea', name: 'Chân Luật Hải', description: 'Chân Tiên phó bản. Luật ở đây tự phủ lên vật chất; mục tiêu là giữ Chân Pháp Thân và Đạo của mình tồn tại mà không bị biển luật viết lại.', purpose: 'true_immortal', tier: 12, danger: 1080, tags: ['Immortal', 'TrueImmortal', 'TrueLaw'],
        floors: [1, 2, 3, 4, 5].map((floor, i) => ({ floor, requiredRealmOrder: [58, 58, 59, 60, 61][i], rewardMultiplier: [1, 1.75, 2.7, 3.9, 5.5][i], equipmentTier: 5, artifactTier: 5, equipmentDropChance: 0.66 + i * 0.055, artifactDropChance: 0.34 + i * 0.045, qualityBias: 0.78 + i * 0.047, guardianEntityId: 'entity.boss.true_law_avatar', guardianPowerMultiplier: [0.94, 1.06, 1.18, 1.31, 1.46][i] })),
        rewards: [{ resourceId: 'resource.true_law_essence', name: 'Chân Luật Tinh Tủy', baseYieldPerYear: 0.90, rarity: 'rare' }, { resourceId: 'resource.true_law_mark', name: 'Chân Tiên Luật Ngân', baseYieldPerYear: 0.18, rarity: 'rare' }],
        guardianLoot: { resources: [{ resourceId: 'resource.true_law_essence', name: 'Chân Luật Tinh Tủy', amount: 20 }, { resourceId: 'resource.true_law_mark', name: 'Chân Tiên Luật Ngân', amount: 2 }] },
    },
    'dungeon.mystic_law_loom': {
        id: 'dungeon.mystic_law_loom', name: 'Huyền Luật Thiên Chức', description: 'Huyền Tiên phó bản. Hàng nghìn luật tuyến đan chéo; một nút mâu thuẫn đủ xé cả pháp thân.', purpose: 'mystic_immortal', tier: 13, danger: 1260, tags: ['Immortal', 'MysticImmortal', 'LawWeave'],
        floors: [1, 2, 3, 4, 5].map((floor, i) => ({ floor, requiredRealmOrder: [62, 62, 63, 64, 65][i], rewardMultiplier: [1, 1.8, 2.8, 4.05, 5.75][i], equipmentTier: 7, artifactTier: 7, equipmentDropChance: 0.68 + i * 0.05, artifactDropChance: 0.36 + i * 0.045, qualityBias: 0.80 + i * 0.045, guardianEntityId: i < 2 ? 'entity.elite.mystic_law_weaver' : 'entity.boss.mystic_law_sovereign', guardianPowerMultiplier: [0.94, 1.06, 1.18, 1.32, 1.48][i] })),
        rewards: [{ resourceId: 'resource.mystic_law_silk', name: 'Huyền Luật Tiên Ty', baseYieldPerYear: 0.84, rarity: 'rare' }, { resourceId: 'resource.law_weave_core', name: 'Vạn Luật Chức Tâm', baseYieldPerYear: 0.16, rarity: 'rare' }], guardianLoot: { resources: [{ resourceId: 'resource.mystic_law_silk', name: 'Huyền Luật Tiên Ty', amount: 22 }, { resourceId: 'resource.law_weave_core', name: 'Vạn Luật Chức Tâm', amount: 2 }] },
    },
    'dungeon.golden_immortal_forge': {
        id: 'dungeon.golden_immortal_forge', name: 'Bất Hoại Kim Lô', description: 'Kim Tiên phó bản. Mọi cấu trúc liên tục bị nung chảy rồi tái lập; chỉ thứ có Kim Tính thật mới giữ được bản ngã.', purpose: 'golden_immortal', tier: 14, danger: 1480, tags: ['Immortal', 'GoldenImmortal', 'Indestructible'],
        floors: [1, 2, 3, 4, 5].map((floor, i) => ({ floor, requiredRealmOrder: [66, 66, 67, 68, 69][i], rewardMultiplier: [1, 1.85, 2.9, 4.2, 6.0][i], equipmentTier: 8, artifactTier: 8, equipmentDropChance: 0.70 + i * 0.048, artifactDropChance: 0.38 + i * 0.045, qualityBias: 0.82 + i * 0.043, guardianEntityId: i < 2 ? 'entity.elite.golden_immortal_guard' : 'entity.boss.golden_immortal_ancestor', guardianPowerMultiplier: [0.95, 1.07, 1.20, 1.34, 1.51][i] })),
        rewards: [{ resourceId: 'resource.golden_immortal_marrow', name: 'Bất Hoại Kim Tủy', baseYieldPerYear: 0.78, rarity: 'rare' }, { resourceId: 'resource.golden_seal_fragment', name: 'Kim Tiên Ấn Phiến', baseYieldPerYear: 0.15, rarity: 'rare' }], guardianLoot: { resources: [{ resourceId: 'resource.golden_immortal_marrow', name: 'Bất Hoại Kim Tủy', amount: 24 }, { resourceId: 'resource.golden_seal_fragment', name: 'Kim Tiên Ấn Phiến', amount: 2 }] },
    },
    'dungeon.taiyi_epoch_river': {
        id: 'dungeon.taiyi_epoch_river', name: 'Thái Ất Kỷ Hà', description: 'Thái Ất phó bản. Dòng kỷ nguyên không chảy theo một chiều; lựa chọn cũ và tương lai chưa xảy ra cùng để lại áp lực.', purpose: 'taiyi', tier: 15, danger: 1730, tags: ['Immortal', 'TaiyiImmortal', 'Time', 'Causality'],
        floors: [1, 2, 3, 4, 5].map((floor, i) => ({ floor, requiredRealmOrder: [70, 70, 71, 72, 73][i], rewardMultiplier: [1, 1.9, 3.0, 4.4, 6.3][i], equipmentTier: 9, artifactTier: 9, equipmentDropChance: 0.72 + i * 0.046, artifactDropChance: 0.40 + i * 0.043, qualityBias: 0.84 + i * 0.04, guardianEntityId: i < 2 ? 'entity.elite.taiyi_river_hunter' : 'entity.boss.taiyi_epoch_lord', guardianPowerMultiplier: [0.96, 1.08, 1.21, 1.36, 1.54][i] })),
        rewards: [{ resourceId: 'resource.taiyi_epoch_sand', name: 'Thái Ất Kỷ Sa', baseYieldPerYear: 0.72, rarity: 'rare' }, { resourceId: 'resource.causal_pearl', name: 'Nhân Quả Định Châu', baseYieldPerYear: 0.14, rarity: 'rare' }], guardianLoot: { resources: [{ resourceId: 'resource.taiyi_epoch_sand', name: 'Thái Ất Kỷ Sa', amount: 26 }, { resourceId: 'resource.causal_pearl', name: 'Nhân Quả Định Châu', amount: 2 }] },
    },
    'dungeon.grand_luo_orchard': {
        id: 'dungeon.grand_luo_orchard', name: 'Đại La Đạo Quả Viên', description: 'Đại La phó bản. Mỗi cây là một khả năng tự chứng; kẻ không có Đạo Quả của mình sẽ bị vô số khả năng khác nuốt mất.', purpose: 'grand_luo', tier: 16, danger: 2010, tags: ['Immortal', 'GrandLuo', 'DaoFruit'],
        floors: [1, 2, 3, 4, 5].map((floor, i) => ({ floor, requiredRealmOrder: [74, 74, 75, 76, 77][i], rewardMultiplier: [1, 1.95, 3.15, 4.65, 6.65][i], equipmentTier: 10, artifactTier: 10, equipmentDropChance: 0.74 + i * 0.044, artifactDropChance: 0.42 + i * 0.041, qualityBias: 0.86 + i * 0.037, guardianEntityId: i < 2 ? 'entity.elite.grand_luo_fruit_shade' : 'entity.boss.grand_luo_timeless_one', guardianPowerMultiplier: [0.97, 1.09, 1.23, 1.38, 1.57][i] })),
        rewards: [{ resourceId: 'resource.grand_luo_origin', name: 'Đại La Đạo Quả Nguyên', baseYieldPerYear: 0.66, rarity: 'rare' }, { resourceId: 'resource.timeless_leaf', name: 'Vô Thời Diệp', baseYieldPerYear: 0.13, rarity: 'rare' }], guardianLoot: { resources: [{ resourceId: 'resource.grand_luo_origin', name: 'Đại La Đạo Quả Nguyên', amount: 28 }, { resourceId: 'resource.timeless_leaf', name: 'Vô Thời Diệp', amount: 2 }] },
    },
    'dungeon.immortal_king_court': {
        id: 'dungeon.immortal_king_court', name: 'Vạn Vực Vương Đình', description: 'Tiên Vương phó bản. Quyền lực ở đây đến từ việc duy trì cả một trật tự; cá nhân mạnh nhưng không giữ nổi hệ thống sẽ bị Vương Đình loại bỏ.', purpose: 'immortal_king', tier: 17, danger: 2340, tags: ['Immortal', 'ImmortalKing', 'Domain', 'Orthodoxy'],
        floors: [1, 2, 3, 4, 5].map((floor, i) => ({ floor, requiredRealmOrder: [78, 78, 79, 80, 81][i], rewardMultiplier: [1, 2.0, 3.3, 4.9, 7.0][i], equipmentTier: 11, artifactTier: 11, equipmentDropChance: 0.76 + i * 0.042, artifactDropChance: 0.44 + i * 0.039, qualityBias: 0.88 + i * 0.034, guardianEntityId: i < 2 ? 'entity.elite.immortal_king_marshal' : 'entity.boss.immortal_king_throne', guardianPowerMultiplier: [0.98, 1.10, 1.25, 1.41, 1.60][i] })),
        rewards: [{ resourceId: 'resource.king_domain_core', name: 'Vương Vực Hạch', baseYieldPerYear: 0.60, rarity: 'rare' }, { resourceId: 'resource.orthodoxy_seal', name: 'Đạo Thống Vương Ấn', baseYieldPerYear: 0.12, rarity: 'rare' }], guardianLoot: { resources: [{ resourceId: 'resource.king_domain_core', name: 'Vương Vực Hạch', amount: 30 }, { resourceId: 'resource.orthodoxy_seal', name: 'Đạo Thống Vương Ấn', amount: 2 }] },
    },
    'dungeon.immortal_emperor_throne': {
        id: 'dungeon.immortal_emperor_throne', name: 'Vạn Giới Đế Đình', description: 'Tiên Đế phó bản. Luật, thế lực và lịch sử đều bị kéo vào một Đế Mệnh; không đủ quyền tự chủ sẽ trở thành một phần sắc lệnh.', purpose: 'immortal_emperor', tier: 18, danger: 2720, tags: ['Immortal', 'ImmortalEmperor', 'Mandate', 'WorldAuthority'],
        floors: [1, 2, 3, 4, 5].map((floor, i) => ({ floor, requiredRealmOrder: [82, 82, 83, 84, 85][i], rewardMultiplier: [1, 2.05, 3.45, 5.15, 7.4][i], equipmentTier: 12, artifactTier: 12, equipmentDropChance: 0.78 + i * 0.04, artifactDropChance: 0.46 + i * 0.037, qualityBias: 0.90 + i * 0.031, guardianEntityId: i < 2 ? 'entity.elite.emperor_mandate_envoy' : 'entity.boss.immortal_emperor_shadow', guardianPowerMultiplier: [0.99, 1.11, 1.27, 1.44, 1.64][i] })),
        rewards: [{ resourceId: 'resource.emperor_mandate_fragment', name: 'Đế Mệnh Tàn Chương', baseYieldPerYear: 0.54, rarity: 'rare' }, { resourceId: 'resource.world_authority_crystal', name: 'Giới Quyền Đế Tinh', baseYieldPerYear: 0.11, rarity: 'rare' }], guardianLoot: { resources: [{ resourceId: 'resource.emperor_mandate_fragment', name: 'Đế Mệnh Tàn Chương', amount: 32 }, { resourceId: 'resource.world_authority_crystal', name: 'Giới Quyền Đế Tinh', amount: 2 }] },
    },
    'dungeon.extremity_boundary': {
        id: 'dungeon.extremity_boundary', name: 'Cực Hạn Biên Giới', description: 'Không phải tầng cuối vũ trụ. Đây là nơi giới hạn hiện tại của chính người tu phản chiếu thành đối thủ; phá xong chỉ thấy một biên giới mới xa hơn.', purpose: 'extremity', tier: 19, danger: 3200, tags: ['Immortal', 'Extremity', 'BreakLimit'],
        floors: [1, 2, 3, 4, 5].map((floor, i) => ({ floor, requiredRealmOrder: [86, 86, 87, 88, 89][i], rewardMultiplier: [1, 2.1, 3.6, 5.45, 7.9][i], equipmentTier: 13, artifactTier: 13, equipmentDropChance: 0.80 + i * 0.038, artifactDropChance: 0.48 + i * 0.035, qualityBias: 0.92 + i * 0.02, guardianEntityId: i < 2 ? 'entity.elite.extremity_breaker' : 'entity.boss.extremity_boundary', guardianPowerMultiplier: [1.0, 1.12, 1.29, 1.47, 1.68][i] })),
        rewards: [{ resourceId: 'resource.extremity_shard', name: 'Phá Cực Tinh Phiến', baseYieldPerYear: 0.48, rarity: 'rare' }, { resourceId: 'resource.boundary_dust', name: 'Biên Giới Trần Sa', baseYieldPerYear: 0.10, rarity: 'rare' }], guardianLoot: { resources: [{ resourceId: 'resource.extremity_shard', name: 'Phá Cực Tinh Phiến', amount: 36 }, { resourceId: 'resource.boundary_dust', name: 'Biên Giới Trần Sa', amount: 3 }] },
    },
    'dungeon.supreme_dao_origin': {
        id: 'dungeon.supreme_dao_origin', name: 'Cực Đạo Chân Nguyên Hải', description: 'Hậu-Cực Đạo phó bản. Càng sâu càng ít dựa vào Tiên Khí và càng ép người chơi chứng minh mechanic của chính cảnh giới.', purpose: 'supreme_dao', tier: 20, danger: 3900, tags: ['Transcendent', 'supreme_dao'],
        floors: [{ floor: 1, requiredRealmOrder: 90, rewardMultiplier: 1, equipmentTier: 14, artifactTier: 14, equipmentDropChance: 0.820, artifactDropChance: 0.500, qualityBias: 0.940, guardianEntityId: 'entity.elite.supreme_dao_echo', guardianPowerMultiplier: 1.0 }, { floor: 2, requiredRealmOrder: 90, rewardMultiplier: 2.2, equipmentTier: 14, artifactTier: 14, equipmentDropChance: 0.855, artifactDropChance: 0.532, qualityBias: 0.955, guardianEntityId: 'entity.elite.supreme_dao_echo', guardianPowerMultiplier: 1.13 }, { floor: 3, requiredRealmOrder: 91, rewardMultiplier: 3.9, equipmentTier: 14, artifactTier: 14, equipmentDropChance: 0.890, artifactDropChance: 0.564, qualityBias: 0.970, guardianEntityId: 'entity.boss.supreme_dao_self', guardianPowerMultiplier: 1.31 }, { floor: 4, requiredRealmOrder: 92, rewardMultiplier: 6.0, equipmentTier: 14, artifactTier: 14, equipmentDropChance: 0.925, artifactDropChance: 0.596, qualityBias: 0.985, guardianEntityId: 'entity.boss.supreme_dao_self', guardianPowerMultiplier: 1.52 }, { floor: 5, requiredRealmOrder: 93, rewardMultiplier: 9.0, equipmentTier: 14, artifactTier: 14, equipmentDropChance: 0.960, artifactDropChance: 0.628, qualityBias: 1.000, guardianEntityId: 'entity.boss.supreme_dao_self', guardianPowerMultiplier: 1.78 }],
        rewards: [{ resourceId: 'resource.supreme_dao_origin', name: 'Cực Đạo Nguyên Chất', baseYieldPerYear: 0.440, rarity: 'rare' }, { resourceId: 'resource.self_law_crystal', name: 'Tự Luật Kết Tinh', baseYieldPerYear: 0.085, rarity: 'rare' }],
        guardianLoot: { resources: [{ resourceId: 'resource.supreme_dao_origin', name: 'Cực Đạo Nguyên Chất', amount: 40 }, { resourceId: 'resource.self_law_crystal', name: 'Tự Luật Kết Tinh', amount: 3 }], equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0, firstClearGuaranteed: true }], artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 }] },
        equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0 }, { templateId: 'equipment.purple_mirror_ring', weight: 0.65, minFloor: 2 }], artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 }],
    },
    'dungeon.chaos_abyss': {
        id: 'dungeon.chaos_abyss', name: 'Hỗn Độn Vô Tướng Uyên', description: 'Hậu-Cực Đạo phó bản. Càng sâu càng ít dựa vào Tiên Khí và càng ép người chơi chứng minh mechanic của chính cảnh giới.', purpose: 'chaos', tier: 21, danger: 4750, tags: ['Transcendent', 'chaos'],
        floors: [{ floor: 1, requiredRealmOrder: 94, rewardMultiplier: 1, equipmentTier: 15, artifactTier: 15, equipmentDropChance: 0.820, artifactDropChance: 0.500, qualityBias: 0.940, guardianEntityId: 'entity.elite.chaos_spawn', guardianPowerMultiplier: 1.0 }, { floor: 2, requiredRealmOrder: 94, rewardMultiplier: 2.2, equipmentTier: 15, artifactTier: 15, equipmentDropChance: 0.855, artifactDropChance: 0.532, qualityBias: 0.955, guardianEntityId: 'entity.elite.chaos_spawn', guardianPowerMultiplier: 1.13 }, { floor: 3, requiredRealmOrder: 95, rewardMultiplier: 3.9, equipmentTier: 15, artifactTier: 15, equipmentDropChance: 0.890, artifactDropChance: 0.564, qualityBias: 0.970, guardianEntityId: 'entity.boss.chaos_primordial_beast', guardianPowerMultiplier: 1.31 }, { floor: 4, requiredRealmOrder: 96, rewardMultiplier: 6.0, equipmentTier: 15, artifactTier: 15, equipmentDropChance: 0.925, artifactDropChance: 0.596, qualityBias: 0.985, guardianEntityId: 'entity.boss.chaos_primordial_beast', guardianPowerMultiplier: 1.52 }, { floor: 5, requiredRealmOrder: 97, rewardMultiplier: 9.0, equipmentTier: 15, artifactTier: 15, equipmentDropChance: 0.960, artifactDropChance: 0.628, qualityBias: 1.000, guardianEntityId: 'entity.boss.chaos_primordial_beast', guardianPowerMultiplier: 1.78 }],
        rewards: [{ resourceId: 'resource.chaos_origin', name: 'Hỗn Độn Nguyên Chất', baseYieldPerYear: 0.415, rarity: 'rare' }, { resourceId: 'resource.chaos_heart', name: 'Hỗn Độn Tâm', baseYieldPerYear: 0.081, rarity: 'rare' }],
        guardianLoot: { resources: [{ resourceId: 'resource.chaos_origin', name: 'Hỗn Độn Nguyên Chất', amount: 44 }, { resourceId: 'resource.chaos_heart', name: 'Hỗn Độn Tâm', amount: 3 }], equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0, firstClearGuaranteed: true }], artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 }] },
        equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0 }, { templateId: 'equipment.purple_mirror_ring', weight: 0.65, minFloor: 2 }], artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 }],
    },
    'dungeon.hongmeng_origin_sea': {
        id: 'dungeon.hongmeng_origin_sea', name: 'Hồng Mông Tử Hải', description: 'Hậu-Cực Đạo phó bản. Càng sâu càng ít dựa vào Tiên Khí và càng ép người chơi chứng minh mechanic của chính cảnh giới.', purpose: 'hongmeng', tier: 22, danger: 5600, tags: ['Transcendent', 'hongmeng'],
        floors: [{ floor: 1, requiredRealmOrder: 98, rewardMultiplier: 1, equipmentTier: 16, artifactTier: 16, equipmentDropChance: 0.820, artifactDropChance: 0.500, qualityBias: 0.940, guardianEntityId: 'entity.elite.hongmeng_wisp', guardianPowerMultiplier: 1.0 }, { floor: 2, requiredRealmOrder: 98, rewardMultiplier: 2.2, equipmentTier: 16, artifactTier: 16, equipmentDropChance: 0.855, artifactDropChance: 0.532, qualityBias: 0.955, guardianEntityId: 'entity.elite.hongmeng_wisp', guardianPowerMultiplier: 1.13 }, { floor: 3, requiredRealmOrder: 99, rewardMultiplier: 3.9, equipmentTier: 16, artifactTier: 16, equipmentDropChance: 0.890, artifactDropChance: 0.564, qualityBias: 0.970, guardianEntityId: 'entity.boss.hongmeng_ancestor_shadow', guardianPowerMultiplier: 1.31 }, { floor: 4, requiredRealmOrder: 100, rewardMultiplier: 6.0, equipmentTier: 16, artifactTier: 16, equipmentDropChance: 0.925, artifactDropChance: 0.596, qualityBias: 0.985, guardianEntityId: 'entity.boss.hongmeng_ancestor_shadow', guardianPowerMultiplier: 1.52 }, { floor: 5, requiredRealmOrder: 101, rewardMultiplier: 9.0, equipmentTier: 16, artifactTier: 16, equipmentDropChance: 0.960, artifactDropChance: 0.628, qualityBias: 1.000, guardianEntityId: 'entity.boss.hongmeng_ancestor_shadow', guardianPowerMultiplier: 1.78 }],
        rewards: [{ resourceId: 'resource.hongmeng_purple_qi', name: 'Hồng Mông Tử Khí', baseYieldPerYear: 0.390, rarity: 'rare' }, { resourceId: 'resource.primordial_seed', name: 'Thái Sơ Chủng', baseYieldPerYear: 0.077, rarity: 'rare' }],
        guardianLoot: { resources: [{ resourceId: 'resource.hongmeng_purple_qi', name: 'Hồng Mông Tử Khí', amount: 48 }, { resourceId: 'resource.primordial_seed', name: 'Thái Sơ Chủng', amount: 3 }], equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0, firstClearGuaranteed: true }], artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 }] },
        equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0 }, { templateId: 'equipment.purple_mirror_ring', weight: 0.65, minFloor: 2 }], artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 }],
    },
    'dungeon.heaven_opening_trial': {
        id: 'dungeon.heaven_opening_trial', name: 'Khai Thiên Thí Giới', description: 'Hậu-Cực Đạo phó bản. Càng sâu càng ít dựa vào Tiên Khí và càng ép người chơi chứng minh mechanic của chính cảnh giới.', purpose: 'heaven_opening', tier: 23, danger: 6450, tags: ['Transcendent', 'heaven_opening'],
        floors: [{ floor: 1, requiredRealmOrder: 102, rewardMultiplier: 1, equipmentTier: 17, artifactTier: 17, equipmentDropChance: 0.820, artifactDropChance: 0.500, qualityBias: 0.940, guardianEntityId: 'entity.elite.heaven_opening_remnant', guardianPowerMultiplier: 1.0 }, { floor: 2, requiredRealmOrder: 102, rewardMultiplier: 2.2, equipmentTier: 17, artifactTier: 17, equipmentDropChance: 0.855, artifactDropChance: 0.532, qualityBias: 0.955, guardianEntityId: 'entity.elite.heaven_opening_remnant', guardianPowerMultiplier: 1.13 }, { floor: 3, requiredRealmOrder: 103, rewardMultiplier: 3.9, equipmentTier: 17, artifactTier: 17, equipmentDropChance: 0.890, artifactDropChance: 0.564, qualityBias: 0.970, guardianEntityId: 'entity.boss.heaven_opening_giant', guardianPowerMultiplier: 1.31 }, { floor: 4, requiredRealmOrder: 104, rewardMultiplier: 6.0, equipmentTier: 17, artifactTier: 17, equipmentDropChance: 0.925, artifactDropChance: 0.596, qualityBias: 0.985, guardianEntityId: 'entity.boss.heaven_opening_giant', guardianPowerMultiplier: 1.52 }, { floor: 5, requiredRealmOrder: 105, rewardMultiplier: 9.0, equipmentTier: 17, artifactTier: 17, equipmentDropChance: 0.960, artifactDropChance: 0.628, qualityBias: 1.000, guardianEntityId: 'entity.boss.heaven_opening_giant', guardianPowerMultiplier: 1.78 }],
        rewards: [{ resourceId: 'resource.heaven_opening_origin', name: 'Khai Thiên Bản Nguyên', baseYieldPerYear: 0.365, rarity: 'rare' }, { resourceId: 'resource.cosmos_membrane', name: 'Vũ Trụ Thai Màng', baseYieldPerYear: 0.073, rarity: 'rare' }],
        guardianLoot: { resources: [{ resourceId: 'resource.heaven_opening_origin', name: 'Khai Thiên Bản Nguyên', amount: 52 }, { resourceId: 'resource.cosmos_membrane', name: 'Vũ Trụ Thai Màng', amount: 3 }], equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0, firstClearGuaranteed: true }], artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 }] },
        equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0 }, { templateId: 'equipment.purple_mirror_ring', weight: 0.65, minFloor: 2 }], artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 }],
    },
    'dungeon.world_core_cradle': {
        id: 'dungeon.world_core_cradle', name: 'Giới Tâm Thai Tạng', description: 'Hậu-Cực Đạo phó bản. Càng sâu càng ít dựa vào Tiên Khí và càng ép người chơi chứng minh mechanic của chính cảnh giới.', purpose: 'world_lord', tier: 24, danger: 7300, tags: ['Transcendent', 'world_lord'],
        floors: [{ floor: 1, requiredRealmOrder: 106, rewardMultiplier: 1, equipmentTier: 18, artifactTier: 18, equipmentDropChance: 0.820, artifactDropChance: 0.500, qualityBias: 0.940, guardianEntityId: 'entity.elite.world_core_guardian', guardianPowerMultiplier: 1.0 }, { floor: 2, requiredRealmOrder: 106, rewardMultiplier: 2.2, equipmentTier: 18, artifactTier: 18, equipmentDropChance: 0.855, artifactDropChance: 0.532, qualityBias: 0.955, guardianEntityId: 'entity.elite.world_core_guardian', guardianPowerMultiplier: 1.13 }, { floor: 3, requiredRealmOrder: 107, rewardMultiplier: 3.9, equipmentTier: 18, artifactTier: 18, equipmentDropChance: 0.890, artifactDropChance: 0.564, qualityBias: 0.970, guardianEntityId: 'entity.boss.world_devourer', guardianPowerMultiplier: 1.31 }, { floor: 4, requiredRealmOrder: 108, rewardMultiplier: 6.0, equipmentTier: 18, artifactTier: 18, equipmentDropChance: 0.925, artifactDropChance: 0.596, qualityBias: 0.985, guardianEntityId: 'entity.boss.world_devourer', guardianPowerMultiplier: 1.52 }, { floor: 5, requiredRealmOrder: 109, rewardMultiplier: 9.0, equipmentTier: 18, artifactTier: 18, equipmentDropChance: 0.960, artifactDropChance: 0.628, qualityBias: 1.000, guardianEntityId: 'entity.boss.world_devourer', guardianPowerMultiplier: 1.78 }],
        rewards: [{ resourceId: 'resource.world_core_essence', name: 'Giới Tâm Tinh Tủy', baseYieldPerYear: 0.340, rarity: 'rare' }, { resourceId: 'resource.life_genesis_seed', name: 'Chúng Sinh Nguyên Chủng', baseYieldPerYear: 0.069, rarity: 'rare' }],
        guardianLoot: { resources: [{ resourceId: 'resource.world_core_essence', name: 'Giới Tâm Tinh Tủy', amount: 56 }, { resourceId: 'resource.life_genesis_seed', name: 'Chúng Sinh Nguyên Chủng', amount: 3 }], equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0, firstClearGuaranteed: true }], artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 }] },
        equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0 }, { templateId: 'equipment.purple_mirror_ring', weight: 0.65, minFloor: 2 }], artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 }],
    },
    'dungeon.eternity_river': {
        id: 'dungeon.eternity_river', name: 'Vĩnh Sinh Trường Hà', description: 'Hậu-Cực Đạo phó bản. Càng sâu càng ít dựa vào Tiên Khí và càng ép người chơi chứng minh mechanic của chính cảnh giới.', purpose: 'eternity', tier: 25, danger: 8150, tags: ['Transcendent', 'eternity'],
        floors: [{ floor: 1, requiredRealmOrder: 110, rewardMultiplier: 1, equipmentTier: 19, artifactTier: 19, equipmentDropChance: 0.820, artifactDropChance: 0.500, qualityBias: 0.940, guardianEntityId: 'entity.elite.eternity_shade', guardianPowerMultiplier: 1.0 }, { floor: 2, requiredRealmOrder: 110, rewardMultiplier: 2.2, equipmentTier: 19, artifactTier: 19, equipmentDropChance: 0.855, artifactDropChance: 0.532, qualityBias: 0.955, guardianEntityId: 'entity.elite.eternity_shade', guardianPowerMultiplier: 1.13 }, { floor: 3, requiredRealmOrder: 111, rewardMultiplier: 3.9, equipmentTier: 19, artifactTier: 19, equipmentDropChance: 0.890, artifactDropChance: 0.564, qualityBias: 0.970, guardianEntityId: 'entity.boss.eternity_reaper', guardianPowerMultiplier: 1.31 }, { floor: 4, requiredRealmOrder: 112, rewardMultiplier: 6.0, equipmentTier: 19, artifactTier: 19, equipmentDropChance: 0.925, artifactDropChance: 0.596, qualityBias: 0.985, guardianEntityId: 'entity.boss.eternity_reaper', guardianPowerMultiplier: 1.52 }, { floor: 5, requiredRealmOrder: 113, rewardMultiplier: 9.0, equipmentTier: 19, artifactTier: 19, equipmentDropChance: 0.960, artifactDropChance: 0.628, qualityBias: 1.000, guardianEntityId: 'entity.boss.eternity_reaper', guardianPowerMultiplier: 1.78 }],
        rewards: [{ resourceId: 'resource.eternity_mark', name: 'Vĩnh Sinh Ấn', baseYieldPerYear: 0.315, rarity: 'rare' }, { resourceId: 'resource.deathless_thread', name: 'Bất Diệt Mệnh Ty', baseYieldPerYear: 0.065, rarity: 'rare' }],
        guardianLoot: { resources: [{ resourceId: 'resource.eternity_mark', name: 'Vĩnh Sinh Ấn', amount: 60 }, { resourceId: 'resource.deathless_thread', name: 'Bất Diệt Mệnh Ty', amount: 3 }], equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0, firstClearGuaranteed: true }], artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 }] },
        equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0 }, { templateId: 'equipment.purple_mirror_ring', weight: 0.65, minFloor: 2 }], artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 }],
    },
    'dungeon.genesis_source': {
        id: 'dungeon.genesis_source', name: 'Sáng Thế Nguyên Hải', description: 'Hậu-Cực Đạo phó bản. Càng sâu càng ít dựa vào Tiên Khí và càng ép người chơi chứng minh mechanic của chính cảnh giới.', purpose: 'creation_lord', tier: 26, danger: 9000, tags: ['Transcendent', 'creation_lord'],
        floors: [{ floor: 1, requiredRealmOrder: 114, rewardMultiplier: 1, equipmentTier: 20, artifactTier: 20, equipmentDropChance: 0.820, artifactDropChance: 0.500, qualityBias: 0.940, guardianEntityId: 'entity.elite.genesis_witness', guardianPowerMultiplier: 1.0 }, { floor: 2, requiredRealmOrder: 114, rewardMultiplier: 2.2, equipmentTier: 20, artifactTier: 20, equipmentDropChance: 0.855, artifactDropChance: 0.532, qualityBias: 0.955, guardianEntityId: 'entity.elite.genesis_witness', guardianPowerMultiplier: 1.13 }, { floor: 3, requiredRealmOrder: 115, rewardMultiplier: 3.9, equipmentTier: 20, artifactTier: 20, equipmentDropChance: 0.890, artifactDropChance: 0.564, qualityBias: 0.970, guardianEntityId: 'entity.boss.genesis_anti_creator', guardianPowerMultiplier: 1.31 }, { floor: 4, requiredRealmOrder: 116, rewardMultiplier: 6.0, equipmentTier: 20, artifactTier: 20, equipmentDropChance: 0.925, artifactDropChance: 0.596, qualityBias: 0.985, guardianEntityId: 'entity.boss.genesis_anti_creator', guardianPowerMultiplier: 1.52 }, { floor: 5, requiredRealmOrder: 117, rewardMultiplier: 9.0, equipmentTier: 20, artifactTier: 20, equipmentDropChance: 0.960, artifactDropChance: 0.628, qualityBias: 1.000, guardianEntityId: 'entity.boss.genesis_anti_creator', guardianPowerMultiplier: 1.78 }],
        rewards: [{ resourceId: 'resource.genesis_core', name: 'Sáng Thế Nguyên Hạch', baseYieldPerYear: 0.290, rarity: 'rare' }, { resourceId: 'resource.first_dawn_fragment', name: 'Sơ Quang Tàn Phiến', baseYieldPerYear: 0.061, rarity: 'rare' }],
        guardianLoot: { resources: [{ resourceId: 'resource.genesis_core', name: 'Sáng Thế Nguyên Hạch', amount: 64 }, { resourceId: 'resource.first_dawn_fragment', name: 'Sơ Quang Tàn Phiến', amount: 3 }], equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0, firstClearGuaranteed: true }], artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 }] },
        equipmentLoot: [{ templateId: 'equipment.starfall_sword', weight: 1.0 }, { templateId: 'equipment.purple_mirror_ring', weight: 0.65, minFloor: 2 }], artifactLoot: [{ templateId: 'artifact.starfall_sword_box', weight: 0.8, minFloor: 2 }],
    },
    [V125_DAO_NATURE_DUNGEON_ID]: {
        id: V125_DAO_NATURE_DUNGEON_ID, name: 'Vấn Đạo Đài',
        description: 'Phó bản chuyên tu Đạo Tính. Tám tầng Phàm→Phá; first-clear cho Điểm Đạo Tính chắc chắn, treo lâu dài chỉ sinh Đạo Tính Tu Vi. Không rơi trang bị/pháp bảo để tránh biến thành phó bản đa năng.',
        purpose: 'dao', tier: 3, danger: 96, tags: ['V125', 'DaoNature', 'FocusedProgression'], floors: V125_DAO_NATURE_FLOORS,
        rewards: [
            { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.mundane, name: 'Đạo Tính Tu Vi · Phàm', baseYieldPerYear: 72, rarity: 'common', minFloor: 1, maxFloor: 1 },
            { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.spirit, name: 'Đạo Tính Tu Vi · Linh', baseYieldPerYear: 84, rarity: 'common', minFloor: 2, maxFloor: 2 },
            { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.mystic, name: 'Đạo Tính Tu Vi · Huyền', baseYieldPerYear: 78, rarity: 'common', minFloor: 3, maxFloor: 3 },
            { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.earth, name: 'Đạo Tính Tu Vi · Địa', baseYieldPerYear: 75, rarity: 'common', minFloor: 4, maxFloor: 4 },
            { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.heaven, name: 'Đạo Tính Tu Vi · Thiên', baseYieldPerYear: 67, rarity: 'common', minFloor: 5, maxFloor: 5 },
            { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.immortal, name: 'Đạo Tính Tu Vi · Tiên', baseYieldPerYear: 59, rarity: 'common', minFloor: 6, maxFloor: 6 },
            { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.extreme, name: 'Đạo Tính Tu Vi · Cực', baseYieldPerYear: 49, rarity: 'common', minFloor: 7, maxFloor: 7 },
            { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.breaker, name: 'Đạo Tính Tu Vi · Phá', baseYieldPerYear: 40, rarity: 'common', minFloor: 8, maxFloor: 8 },
        ], workerRewardRounding: 'stochastic',
        guardianLoot: { resources: [
                { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.mundane, name: 'Đạo Tính Tu Vi · Phàm', amount: 18, minFloor: 1, maxFloor: 1 },
                { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.spirit, name: 'Đạo Tính Tu Vi · Linh', amount: 20, minFloor: 2, maxFloor: 2 },
                { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.mystic, name: 'Đạo Tính Tu Vi · Huyền', amount: 22, minFloor: 3, maxFloor: 3 },
                { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.earth, name: 'Đạo Tính Tu Vi · Địa', amount: 24, minFloor: 4, maxFloor: 4 },
                { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.heaven, name: 'Đạo Tính Tu Vi · Thiên', amount: 26, minFloor: 5, maxFloor: 5 },
                { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.immortal, name: 'Đạo Tính Tu Vi · Tiên', amount: 28, minFloor: 6, maxFloor: 6 },
                { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.extreme, name: 'Đạo Tính Tu Vi · Cực', amount: 31, minFloor: 7, maxFloor: 7 },
                { resourceId: V125_DAO_NATURE_TIER_RESOURCE_IDS.breaker, name: 'Đạo Tính Tu Vi · Phá', amount: 34, minFloor: 8, maxFloor: 8 },
            ] },
    },
};
export const prototypeUnlockedDungeonIds = [
    'dungeon.spirit_gathering_cave',
    'dungeon.hundred_herb_garden',
    'dungeon.black_iron_mine',
    'dungeon.ruined_treasure_pavilion',
    'dungeon.beast_taming_valley',
];
//# sourceMappingURL=dungeons.js.map