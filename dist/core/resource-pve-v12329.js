import { addBreakMaterialV12326, addStrengthMaterialV12326, BREAK_NAME_V12326, MATERIAL_NAME_V12326, } from './collection-workshop-gacha-v12326.js';
import { SeededRng } from './rng.js';
export const RESOURCE_PVE_SCHEMA_V12329 = 'resource-pve-loop.v12329';
export const RESOURCE_PVE_DUNGEONS_V12329 = [
    { id: 'dungeon.v12329.manual', category: 'manual', name: 'Tàng Kinh Bí Cảnh', description: 'Thu Công Pháp Tàn Ý và Thiên Tinh Công Pháp. Không rơi mảnh Công Pháp.', purpose: 'cultivation' },
    { id: 'dungeon.v12329.heart', category: 'heart', name: 'Tâm Kinh Cốc', description: 'Thu Tâm Pháp Tàn Quyển và Thiên Tinh Tâm Pháp. Không rơi mảnh Tâm Pháp.', purpose: 'dao' },
    { id: 'dungeon.v12329.artifact', category: 'artifact', name: 'Vạn Bảo Bí Khố', description: 'Thu Luyện Bảo Tinh Hoa và Thiên Tinh Pháp Bảo. Không rơi mảnh Pháp Bảo.', purpose: 'artifact' },
    { id: 'dungeon.v12329.relic', category: 'relic', name: 'Chí Bảo Tàn Giới', description: 'Thu Chí Bảo Linh Tinh và Thiên Tinh Chí Bảo. Không rơi mảnh Chí Bảo.', purpose: 'artifact' },
    { id: 'dungeon.v12329.pet', category: 'pet', name: 'Vạn Thú Cốc', description: 'Thu Linh Thú Tinh Phách và Linh Thú Đột Phá Đan. Không rơi mảnh Linh Thú.', purpose: 'beast' },
    { id: 'dungeon.v12329.companion', category: 'companion', name: 'Hồng Trần Mộng Cảnh', description: 'Thu Đồng Tâm Ngọc và Duyên Tinh Đột Phá. Không rơi mảnh Tri Kỷ.', purpose: 'dao' },
    { id: 'dungeon.v12329.bloodline', category: 'bloodline', name: 'Thái Cổ Huyết Uyên', description: 'Thu Huyết Tinh và Hộ Huyết Phù để tinh luyện, thăng phẩm Huyết Mạch. Không rơi mảnh Huyết Mạch.', purpose: 'beast' },
    { id: 'dungeon.v12329.physique', category: 'physique', name: 'Luyện Thể Cổ Cảnh', description: 'Thu Thể Phách Tinh Hoa và Luyện Thể Đạo Tinh. Không rơi mảnh Thể Chất.', purpose: 'integration' },
];
const FLOOR_REQUIRED_REALM = [0, 10, 26, 42, 58, 74, 90, 106];
const FLOOR_MATERIAL = [24, 36, 52, 74, 104, 144, 196, 264];
const FLOOR_BREAK_CHANCE = [18, 22, 28, 34, 42, 52, 64, 78];
// V109 production farm rate: repeated material income is time-based after first-clear.
// This closes the old loophole where spam-clicking a cleared guardian outperformed idle/clone farming by orders of magnitude.
const FLOOR_FARM_MATERIAL_PER_YEAR_V109 = [4, 6, 9, 13, 18, 25, 34, 46];
const FLOOR_FARM_BREAK_PER_YEAR_V109 = [0.04, 0.055, 0.075, 0.10, 0.14, 0.20, 0.28, 0.40];
const GUARDIAN_POOLS = [
    ['entity.enemy.black_wind_wolf', 'entity.enemy.thunder_snake', 'entity.enemy.thunder_snake', 'entity.enemy.black_wind_wolf'],
    ['entity.boss.thunder_horn_rhino', 'entity.boss.blood_river_rogue', 'entity.elite.purple_mist_spider', 'entity.boss.purple_mirror_guardian'],
    ['entity.boss.soul_pool_warden', 'entity.boss.dao_echo_avatar', 'entity.elite.void_rift_stalker', 'entity.boss.three_origin_avatar'],
    ['entity.elite.tribulation_thunder_avatar', 'entity.boss.heart_demon_tribulation', 'entity.elite.immortal_spirit_crane', 'entity.boss.immortal_pool_warden'],
    ['entity.boss.true_law_avatar', 'entity.elite.mystic_law_weaver', 'entity.boss.mystic_law_sovereign', 'entity.elite.golden_immortal_guard'],
    ['entity.elite.grand_luo_fruit_shade', 'entity.boss.grand_luo_timeless_one', 'entity.elite.immortal_king_marshal', 'entity.boss.immortal_king_throne'],
    ['entity.elite.extremity_breaker', 'entity.boss.extremity_boundary', 'entity.elite.supreme_dao_echo', 'entity.boss.supreme_dao_self'],
    ['entity.elite.world_core_guardian', 'entity.boss.world_devourer', 'entity.elite.eternity_shade', 'entity.boss.eternity_reaper'],
];
const POWER_MULTIPLIER = [0.62, 0.76, 0.82, 0.88, 0.94, 1.00, 1.04, 1.08];
const MECHANICS = ['predator', 'iron_wall', 'soul_pressure', 'blood_frenzy'];
function resourceFloors(categoryIndex) {
    return FLOOR_REQUIRED_REALM.map((requiredRealmOrder, i) => ({
        floor: i + 1,
        requiredRealmOrder,
        rewardMultiplier: 1,
        equipmentTier: 0,
        artifactTier: 0,
        equipmentDropChance: 0,
        artifactDropChance: 0,
        qualityBias: 0,
        guardianEntityId: GUARDIAN_POOLS[i][categoryIndex % GUARDIAN_POOLS[i].length],
        guardianPowerMultiplier: POWER_MULTIPLIER[i],
        guardianMechanicId: MECHANICS[(categoryIndex + i) % MECHANICS.length],
    }));
}
export const RESOURCE_PVE_DUNGEON_DEFINITIONS_V12329 = Object.fromEntries(RESOURCE_PVE_DUNGEONS_V12329.map((def, index) => [def.id, {
        id: def.id,
        name: def.name,
        description: def.description,
        purpose: def.purpose,
        tier: 1,
        danger: 35 + index * 2,
        tags: ['V12329', 'ResourcePVE', `ResourceCategory:${def.category}`, 'NoSpecificFragments', 'NoEquipmentLoot', 'NoArtifactLoot'],
        floors: resourceFloors(index),
        rewards: [],
        guardianLoot: { resources: [], equipmentLoot: [], artifactLoot: [], equipmentRepeatChancePct: 0 },
        workerEquipmentRatePerYear: 0,
    }]));
const DEF_BY_ID = new Map(RESOURCE_PVE_DUNGEONS_V12329.map(x => [x.id, x]));
export function resourcePveDefinitionV12329(dungeonId) { return DEF_BY_ID.get(dungeonId); }
export function isResourcePveDungeonV12329(dungeonId) { return DEF_BY_ID.has(dungeonId); }
export function resourcePveVirtualMaterialIdV12329(category) { return `resource.v12329.${category}.strength`; }
export function resourcePveVirtualBreakIdV12329(category) { return `resource.v12329.${category}.breakthrough`; }
export function resourcePveFloorRewardPreviewV12329(category, floor) {
    const i = Math.max(0, Math.min(FLOOR_MATERIAL.length - 1, Math.floor(floor) - 1));
    return { material: FLOOR_MATERIAL[i], materialName: MATERIAL_NAME_V12326[category], breakthroughName: BREAK_NAME_V12326[category], breakthroughChancePct: FLOOR_BREAK_CHANCE[i], firstClearBreakthrough: 1 + (i >= 4 ? 1 : 0) };
}
export function resourcePveFarmRewardPreviewV109(category, floor, years = 1, efficiency = 1) {
    const i = Math.max(0, Math.min(FLOOR_FARM_MATERIAL_PER_YEAR_V109.length - 1, Math.floor(floor) - 1));
    const safeYears = Math.max(0, Number(years) || 0);
    const safeEfficiency = Math.max(0, Number(efficiency) || 0);
    return {
        schema: 'resource-pve-farm.v109', category, floor: i + 1, years: safeYears, efficiency: safeEfficiency,
        materialName: MATERIAL_NAME_V12326[category], breakthroughName: BREAK_NAME_V12326[category],
        materialPerYear: FLOOR_FARM_MATERIAL_PER_YEAR_V109[i], breakthroughPerYear: FLOOR_FARM_BREAK_PER_YEAR_V109[i],
        expectedMaterial: FLOOR_FARM_MATERIAL_PER_YEAR_V109[i] * safeYears * safeEfficiency,
        expectedBreakthrough: FLOOR_FARM_BREAK_PER_YEAR_V109[i] * safeYears * safeEfficiency,
    };
}
export function grantResourcePveFarmRewardsV109(state, inventory, dungeonId, floor, years, efficiency, seed) {
    const def = resourcePveDefinitionV12329(dungeonId);
    if (!def)
        return undefined;
    const treeBonus = def.category === 'manual' ? Math.max(0, Math.min(100, Number(state?.manualTreeV127?.dungeonMaterialGainPct ?? 0))) : 0;
    const previewBase = resourcePveFarmRewardPreviewV109(def.category, floor, years, efficiency);
    const preview = { ...previewBase, expectedMaterial: previewBase.expectedMaterial * (1 + treeBonus/100), expectedBreakthrough: previewBase.expectedBreakthrough * (1 + treeBonus/100), reincarnationTreeBonusPct: treeBonus };
    const rng = new SeededRng((seed ^ 0x109f4a6d) >>> 0);
    const materialRaw = preview.expectedMaterial * (0.92 + rng.next() * 0.16);
    const material = Math.max(0, Math.floor(materialRaw));
    const breakRaw = preview.expectedBreakthrough;
    const breakWhole = Math.floor(breakRaw);
    const breakthrough = breakWhole + (rng.next() < Math.max(0, Math.min(1, breakRaw - breakWhole)) ? 1 : 0);
    if (material > 0)
        addStrengthMaterialV12326(state, inventory, def.category, material);
    if (breakthrough > 0)
        addBreakMaterialV12326(state, inventory, def.category, breakthrough);
    return { ...preview, material, breakthrough, drops: [
        `${preview.materialName} +${material}`,
        breakthrough > 0 ? `${preview.breakthroughName} +${breakthrough}` : `${preview.breakthroughName}: chưa tích lũy đủ`,
    ] };
}
export function resourcePveProductionCatalogV109() {
    return RESOURCE_PVE_DUNGEONS_V12329.map((def, index) => ({
        ...def, firstClearMode: 'CombatKernelV2', farmMode: 'time-based-dungeon', repeatGuardianMaterialReward: false,
        floorCount: FLOOR_REQUIRED_REALM.length,
        materialPerYear: [...FLOOR_FARM_MATERIAL_PER_YEAR_V109], breakthroughPerYear: [...FLOOR_FARM_BREAK_PER_YEAR_V109],
        specificFragments: 'gacha-only', equipmentLoot: false, artifactLoot: false,
    }));
}
export function grantResourcePveRewardsV12329(state, inventory, dungeonId, floor, firstClear, seed) {
    const def = resourcePveDefinitionV12329(dungeonId);
    if (!def)
        return undefined;
    const preview = resourcePveFloorRewardPreviewV12329(def.category, floor);
    if (!firstClear)
        return { schema: 'resource-pve-loop.v109', category: def.category, materialName: preview.materialName, material: 0, breakthroughName: preview.breakthroughName, breakthrough: 0, breakthroughChancePct: 0, firstClearBonus: false, repeatGuardianMaterialReward: false, farmMode: 'time-based-dungeon', drops: ['Tầng đã công phá · treo Phó Bản để farm nguyên liệu theo thời gian.'] };
    const treeBonus = def.category === 'manual' ? Math.max(0, Math.min(100, Number(state?.manualTreeV127?.dungeonMaterialGainPct ?? 0))) : 0;
    const resourceMultiplier = 1 + treeBonus/100;
    const material = Math.max(1, Math.round(preview.material * 1.5 * resourceMultiplier));
    const breakthrough = Math.max(0, Math.round(preview.firstClearBreakthrough * resourceMultiplier));
    addStrengthMaterialV12326(state, inventory, def.category, material);
    if (breakthrough > 0)
        addBreakMaterialV12326(state, inventory, def.category, breakthrough);
    const drops = [`${preview.materialName} +${material}`, `${preview.breakthroughName} +${breakthrough}`];
    return { schema: 'resource-pve-loop.v109', category: def.category, materialName: preview.materialName, material, breakthroughName: preview.breakthroughName, breakthrough, breakthroughChancePct: 0, firstClearBonus: true, reincarnationTreeBonusPct: treeBonus, specificFragmentsGranted:0, repeatGuardianMaterialReward: false, farmMode: 'time-based-dungeon', drops };
}
//# sourceMappingURL=resource-pve-v12329.js.map