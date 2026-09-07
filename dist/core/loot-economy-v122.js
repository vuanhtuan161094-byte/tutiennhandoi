import { economyMaterialResourceId } from './economy-v111.js';
import { craftEquipmentCostV115, AFFIX_FAMILY_CHANGE_RESOURCE_V115 } from './equipment-reforge-v115.js';
import { EQUIPMENT_ANTI_DOWNGRADE_RESOURCE, EQUIPMENT_TRANSFER_GEM_RESOURCE, EQUIPMENT_ENHANCE_ESSENCE_RESOURCE } from './equipment.js';
import { SET_GRADE_ORDER_V116 } from './equipment-set-v116.js';
import { equipmentRankNameV142 } from './equipment-v142.js';

/**
 * V143 targetable equipment economy, kept behind the V1.22 compatibility API.
 * Hunt owns broad/random fragment income. Dedicated dungeons own target Set identity and forging sinks.
 * Every live equipment sink below has at least one explicit source here.
 */
export const LOOT_ECONOMY_V122_SCHEMA = 'loot-economy.v1.22';
export const V122_TARGET_SET_DUNGEONS = {
    elementAttire: 'dungeon.v122.ngu_hanh_dao_kho',
    daoAttire: 'dungeon.v122.bat_dao_chan_dien', // compatibility-only retired Set lane
    jewelry: 'dungeon.v122.hop_dao_bao_kho',
};
export const V122_FORGE_DUNGEON_ID = 'dungeon.v122.thien_cong_luyen_vuc';
/** Keep all historic IDs for migration/content integrity; live surfacing is controlled by lootDungeonIdsForRealmV122. */
export const V122_ALL_DUNGEON_IDS = [...Object.values(V122_TARGET_SET_DUNGEONS), V122_FORGE_DUNGEON_ID];

/** Only live V142 Set dungeons are surfaced. Bát Đạo Chân Điện remains migration/history content only. */
export function lootDungeonIdsForRealmV122(realmOrder) {
    const order = Math.max(0, Math.floor(realmOrder));
    const ids = [];
    if (order >= 1) ids.push(V122_FORGE_DUNGEON_ID);
    if (order >= 10) ids.push(V122_TARGET_SET_DUNGEONS.elementAttire);
    if (order >= 26) ids.push(V122_TARGET_SET_DUNGEONS.jewelry);
    return ids;
}

export const V122_WORLD_YEARS_PER_REAL_HOUR = 100 / 24;
export const V122_CHALLENGE_WORLD_YEARS = 0.02;
export const V122_CHALLENGES_PER_REAL_HOUR = V122_WORLD_YEARS_PER_REAL_HOUR / V122_CHALLENGE_WORLD_YEARS;
export const V122_TARGET_SET_REPEAT_CHANCE_PCT = 0.50;
export const V122_TARGET_SET_WORKER_PIECES_PER_WORLD_YEAR = (V122_TARGET_SET_REPEAT_CHANCE_PCT / 100) / V122_CHALLENGE_WORLD_YEARS;

/** Eight forge floors are checkpoints across the 28 equipment ranks, not eight visible gear Grades. */
export const V143_FORGE_RANK_INDEX_BY_FLOOR = Object.freeze([1, 5, 9, 13, 17, 21, 25, 28]);
export const V122_FORGE_REALM_ORDER_THRESHOLDS = [1, 22, 38, 54, 70, 86, 102, 114];
export const V122_FORGE_GRADE_ORDER = [...SET_GRADE_ORDER_V116]; // compatibility for old saves/tests only

function chanceBundle(resourceId, name, expected, floor, firstClearGuaranteed = false) {
    const safe = Math.max(0, expected);
    if (safe <= 0) return { resourceId, name, amount: 1, minFloor: floor, maxFloor: floor, chancePct: 0, firstClearGuaranteed };
    const amount = Math.max(1, Math.ceil(safe));
    return { resourceId, name, amount, minFloor: floor, maxFloor: floor, chancePct: Math.min(100, safe / amount * 100), firstClearGuaranteed };
}

/**
 * Dedicated forge source. Khí Luyện Tinh Hoa is the canonical V142 enhancement/reforge/refine material.
 * Legacy Tinh Hoa Trang Bị is still emitted for old items but is not a V142 progression axis.
 */
export function forgeFloorEconomyV122(floor) {
    const index = Math.max(0, Math.min(7, Math.floor(floor) - 1));
    const grade = V122_FORGE_GRADE_ORDER[index];
    const realmTier = index + 1;
    const rankIndex = V143_FORGE_RANK_INDEX_BY_FLOOR[index];
    const rankName = equipmentRankNameV142(rankIndex);
    const craft = craftEquipmentCostV115(grade);
    const legacyEssenceId = economyMaterialResourceId('equipmentEssence', realmTier, 'essence');
    const oreId = economyMaterialResourceId('ore', realmTier, 'iron');

    const forgingEssenceExpectedPerChallenge = Math.max(1, Math.round(2 * Math.pow(1.70, index)));
    const legacyExpectedPerChallenge = Math.max(1, Math.round(craft.equipmentEssence * .01));
    const oreExpectedPerChallenge = Math.max(.10, .18 * Math.pow(1.95, index));
    const familyChangeChancePct = .50 + index * .18;
    const protectionChancePct = 3.5 + index * .65;
    const transferGemChancePct = .18 + index * .08;
    const firstClearSpecial = index === 3 || index === 7;

    return {
        floor: index + 1, grade, realmTier, rankIndex, rankName,
        requiredRealmOrder: V122_FORGE_REALM_ORDER_THRESHOLDS[index],
        craftEssenceCost: craft.equipmentEssence,
        // compatibility metric: old callers can still project a craft-equivalent lane.
        expectedEssencePerChallenge: legacyExpectedPerChallenge,
        expectedCraftEquivalentsPerHour: legacyExpectedPerChallenge * V122_CHALLENGES_PER_REAL_HOUR / Math.max(1, craft.equipmentEssence),
        forgingEssenceExpectedPerChallenge,
        familyChangeChancePct, protectionChancePct, transferGemChancePct,
        rewards: [
            { resourceId: EQUIPMENT_ENHANCE_ESSENCE_RESOURCE, name: `Khí Luyện Tinh Hoa · ${rankName}`, baseYieldPerYear: forgingEssenceExpectedPerChallenge / V122_CHALLENGE_WORLD_YEARS, rarity: 'common', minFloor: index + 1, maxFloor: index + 1 },
            { resourceId: legacyEssenceId, name: `Tinh Hoa Trang Bị · T${realmTier}`, baseYieldPerYear: legacyExpectedPerChallenge / V122_CHALLENGE_WORLD_YEARS, rarity: 'uncommon', minFloor: index + 1, maxFloor: index + 1 },
            { resourceId: oreId, name: `Huyền Thiết Khoáng · T${realmTier}`, baseYieldPerYear: oreExpectedPerChallenge / V122_CHALLENGE_WORLD_YEARS, rarity: 'common', minFloor: index + 1, maxFloor: index + 1 },
        ],
        guardianResources: [
            chanceBundle(EQUIPMENT_ENHANCE_ESSENCE_RESOURCE, `Khí Luyện Tinh Hoa · ${rankName}`, forgingEssenceExpectedPerChallenge, index + 1, index === 0),
            chanceBundle(legacyEssenceId, `Tinh Hoa Trang Bị · T${realmTier}`, legacyExpectedPerChallenge, index + 1),
            chanceBundle(oreId, `Huyền Thiết Khoáng · T${realmTier}`, oreExpectedPerChallenge, index + 1),
            { resourceId: AFFIX_FAMILY_CHANGE_RESOURCE_V115, name: 'Chuyển Tính Thạch', amount: 1, minFloor: index + 1, maxFloor: index + 1, chancePct: familyChangeChancePct, firstClearGuaranteed: firstClearSpecial },
            { resourceId: EQUIPMENT_ANTI_DOWNGRADE_RESOURCE, name: 'Bùa Chống Tụt', amount: 1, minFloor: index + 1, maxFloor: index + 1, chancePct: protectionChancePct },
            { resourceId: EQUIPMENT_TRANSFER_GEM_RESOURCE, name: 'Ngọc Chuyển Cường Hóa', amount: 1, minFloor: index + 1, maxFloor: index + 1, chancePct: transferGemChancePct, firstClearGuaranteed: index === 7 },
        ],
    };
}
export const V122_FORGE_FLOORS = Array.from({ length: 8 }, (_, i) => forgeFloorEconomyV122(i + 1));

export function equipmentResourceSourceCoverageV143() {
    const allGuardian = V122_FORGE_FLOORS.flatMap(floor => floor.guardianResources);
    const sourceIds = new Set(allGuardian.filter(row => (row.chancePct ?? 0) > 0 || row.firstClearGuaranteed).map(row => row.resourceId));
    return {
        enhancementEssence: sourceIds.has(EQUIPMENT_ENHANCE_ESSENCE_RESOURCE),
        affixFamilyChange: sourceIds.has(AFFIX_FAMILY_CHANGE_RESOURCE_V115),
        antiDowngrade: sourceIds.has(EQUIPMENT_ANTI_DOWNGRADE_RESOURCE),
        enhancementTransfer: sourceIds.has(EQUIPMENT_TRANSFER_GEM_RESOURCE),
        sourceIds: [...sourceIds],
    };
}

export function projectLootEconomyV122(hours) {
    const h = Math.max(0, hours);
    const runs = V122_CHALLENGES_PER_REAL_HOUR * h;
    const targeted = runs * V122_TARGET_SET_REPEAT_CHANCE_PCT / 100;
    return {
        hours: h,
        targetedSetPieces: targeted, // compatibility alias: V142 interprets this budget as targeted Set fragments/identity progress.
        targetedSetFragmentsProxy: targeted,
        forgingEssenceByFloor: V122_FORGE_FLOORS.map(f => runs * f.forgingEssenceExpectedPerChallenge),
        familyChangeStonesByForgeFloor: V122_FORGE_FLOORS.map(f => runs * f.familyChangeChancePct / 100),
        protectionTalismansByForgeFloor: V122_FORGE_FLOORS.map(f => runs * f.protectionChancePct / 100),
        transferGemsByForgeFloor: V122_FORGE_FLOORS.map(f => runs * f.transferGemChancePct / 100),
        craftEquivalentsByForgeFloor: V122_FORGE_FLOORS.map(f => h * f.expectedCraftEquivalentsPerHour),
    };
}
//# sourceMappingURL=loot-economy-v122.js.map