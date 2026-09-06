import { economyMaterialResourceId } from './economy-v111.js';
import { craftEquipmentCostV115, AFFIX_FAMILY_CHANGE_RESOURCE_V115 } from './equipment-reforge-v115.js';
import { EQUIPMENT_ANTI_DOWNGRADE_RESOURCE, EQUIPMENT_TRANSFER_GEM_RESOURCE } from './equipment.js';
import { SET_GRADE_ORDER_V116 } from './equipment-set-v116.js';
/**
 * v1.22 Loot / Drop Economy.
 *
 * This layer deliberately does NOT replace Economy V17 Hunt E2/F1.
 * It adds targetable equipment-progression sources so random Hunt remains broad loot,
 * while players who need a specific Set identity or forging material have a clear place to go.
 * No new currency is introduced.
 */
export const LOOT_ECONOMY_V122_SCHEMA = 'loot-economy.v1.22';
export const V122_TARGET_SET_DUNGEONS = {
    elementAttire: 'dungeon.v122.ngu_hanh_dao_kho',
    daoAttire: 'dungeon.v122.bat_dao_chan_dien',
    jewelry: 'dungeon.v122.hop_dao_bao_kho',
};
export const V122_FORGE_DUNGEON_ID = 'dungeon.v122.thien_cong_luyen_vuc';
export const V122_ALL_DUNGEON_IDS = [...Object.values(V122_TARGET_SET_DUNGEONS), V122_FORGE_DUNGEON_ID];
/** V1.22 dungeons appear only when the current-life realm can actually enter their opening floor. */
export function lootDungeonIdsForRealmV122(realmOrder) {
    const order = Math.max(0, Math.floor(realmOrder));
    const ids = [];
    if (order >= 1)
        ids.push(V122_FORGE_DUNGEON_ID);
    if (order >= 10)
        ids.push(V122_TARGET_SET_DUNGEONS.elementAttire);
    if (order >= 18)
        ids.push(V122_TARGET_SET_DUNGEONS.daoAttire);
    if (order >= 26)
        ids.push(V122_TARGET_SET_DUNGEONS.jewelry);
    return ids;
}
/** 100 world-years / real day => 4.1666.. world-years / real hour. Challenge dungeon consumes 0.02 world-year. */
export const V122_WORLD_YEARS_PER_REAL_HOUR = 100 / 24;
export const V122_CHALLENGE_WORLD_YEARS = 0.02;
export const V122_CHALLENGES_PER_REAL_HOUR = V122_WORLD_YEARS_PER_REAL_HOUR / V122_CHALLENGE_WORLD_YEARS;
/** Targeted Set repeat boss chance. At ~208 challenge opportunities/hour this is about one set piece/hour. */
export const V122_TARGET_SET_REPEAT_CHANCE_PCT = 0.50;
/** Parallel workers use the same long-run Set-piece expectation as active guardian repeats. */
export const V122_TARGET_SET_WORKER_PIECES_PER_WORLD_YEAR = (V122_TARGET_SET_REPEAT_CHANCE_PCT / 100) / V122_CHALLENGE_WORLD_YEARS;
export const V122_FORGE_REALM_ORDER_THRESHOLDS = [1, 18, 34, 46, 62, 74, 90, 102];
export const V122_FORGE_GRADE_ORDER = [...SET_GRADE_ORDER_V116];
function chanceBundle(resourceId, name, expected, floor, firstClearGuaranteed = false) {
    const safe = Math.max(0, expected);
    if (safe <= 0)
        return { resourceId, name, amount: 1, minFloor: floor, maxFloor: floor, chancePct: 0, firstClearGuaranteed };
    const amount = Math.max(1, Math.ceil(safe));
    return { resourceId, name, amount, minFloor: floor, maxFloor: floor, chancePct: Math.min(100, safe / amount * 100), firstClearGuaranteed };
}
/**
 * Dedicated forge source is pegged to the actual equipment craft sink instead of hard-coding one flat count.
 * This keeps Phàm and Phá both meaningful even though craft essence cost scales x2.5/grade.
 */
export function forgeFloorEconomyV122(floor) {
    const index = Math.max(0, Math.min(7, Math.floor(floor) - 1));
    const grade = V122_FORGE_GRADE_ORDER[index];
    const realmTier = index + 1;
    const craft = craftEquipmentCostV115(grade);
    const expectedEssencePerChallenge = craft.equipmentEssence * 0.01;
    const expectedCraftEquivalentsPerHour = expectedEssencePerChallenge * V122_CHALLENGES_PER_REAL_HOUR / Math.max(1, craft.equipmentEssence);
    const essenceId = economyMaterialResourceId('equipmentEssence', realmTier, 'essence');
    const oreId = economyMaterialResourceId('ore', realmTier, 'iron');
    const oreExpectedPerChallenge = Math.max(0.08, 0.15 * Math.pow(2.15, index));
    const familyChangeChancePct = 0.40 + index * 0.10;
    const protectionChancePct = 3.0 + index * 0.45;
    const transferGemChancePct = 0.15 + index * 0.05;
    const firstClearSpecial = index === 3 || index === 7;
    return {
        floor: index + 1, grade, realmTier, requiredRealmOrder: V122_FORGE_REALM_ORDER_THRESHOLDS[index], craftEssenceCost: craft.equipmentEssence,
        expectedEssencePerChallenge, expectedCraftEquivalentsPerHour, familyChangeChancePct, protectionChancePct, transferGemChancePct,
        rewards: [
            { resourceId: essenceId, name: `Tinh Hoa Trang Bị · T${realmTier}`, baseYieldPerYear: craft.equipmentEssence * 0.50, rarity: 'uncommon', minFloor: index + 1, maxFloor: index + 1 },
            { resourceId: oreId, name: `Huyền Thiết Khoáng · T${realmTier}`, baseYieldPerYear: oreExpectedPerChallenge / V122_CHALLENGE_WORLD_YEARS, rarity: 'common', minFloor: index + 1, maxFloor: index + 1 },
        ],
        guardianResources: [
            chanceBundle(essenceId, `Tinh Hoa Trang Bị · T${realmTier}`, expectedEssencePerChallenge, index + 1),
            chanceBundle(oreId, `Huyền Thiết Khoáng · T${realmTier}`, oreExpectedPerChallenge, index + 1),
            { resourceId: AFFIX_FAMILY_CHANGE_RESOURCE_V115, name: 'Chuyển Tính Thạch', amount: 1, minFloor: index + 1, maxFloor: index + 1, chancePct: familyChangeChancePct, firstClearGuaranteed: firstClearSpecial },
            { resourceId: EQUIPMENT_ANTI_DOWNGRADE_RESOURCE, name: 'Bùa Chống Tụt', amount: 1, minFloor: index + 1, maxFloor: index + 1, chancePct: protectionChancePct },
            { resourceId: EQUIPMENT_TRANSFER_GEM_RESOURCE, name: 'Ngọc Chuyển Cường Hóa', amount: 1, minFloor: index + 1, maxFloor: index + 1, chancePct: transferGemChancePct, firstClearGuaranteed: index === 7 },
        ],
    };
}
export const V122_FORGE_FLOORS = Array.from({ length: 8 }, (_, i) => forgeFloorEconomyV122(i + 1));
export function projectLootEconomyV122(hours) {
    const h = Math.max(0, hours);
    const runs = V122_CHALLENGES_PER_REAL_HOUR * h;
    return {
        hours: h,
        targetedSetPieces: runs * V122_TARGET_SET_REPEAT_CHANCE_PCT / 100,
        familyChangeStonesByForgeFloor: V122_FORGE_FLOORS.map(f => runs * f.familyChangeChancePct / 100),
        protectionTalismansByForgeFloor: V122_FORGE_FLOORS.map(f => runs * f.protectionChancePct / 100),
        transferGemsByForgeFloor: V122_FORGE_FLOORS.map(f => runs * f.transferGemChancePct / 100),
        craftEquivalentsByForgeFloor: V122_FORGE_FLOORS.map(f => h * f.expectedCraftEquivalentsPerHour),
    };
}
//# sourceMappingURL=loot-economy-v122.js.map