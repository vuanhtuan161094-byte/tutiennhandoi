import { economyMaterialResourceId } from './economy-v111.js';
import { addEquipment, buildEquipmentInstance, equipmentGradeIndex, EQUIPMENT_ENHANCE_ESSENCE_RESOURCE } from './equipment.js';
import { requireAuthoredDaoInscriptionV128 } from './equipment-inscription-gem-v128.js';
import { EQUIPMENT_AFFIX_MAX_ROLL_PCT_V114, EQUIPMENT_AFFIX_MIN_ROLL_PCT_V114, forgeDaoInscriptionDeterministicV114, reforgeEquipmentAffixV114, validateEquipmentAffixesV114 } from './equipment-affix-v114.js';
import { EQUIPMENT_V142_SCHEMA } from './equipment-v142.js';

/**
 * V143 Reforge + Tinh Luyện economy.
 * Legacy items keep Grade-based costs. V142 ranked items ignore visible Grade and scale costs from equipmentRankIndex.
 * The canonical V142 material is Khí Luyện Tinh Hoa, sourced by Thiên Công Luyện Vực.
 */
export const REFORGE_REPEAT_MULTIPLIER_V115 = 1.50;
export const REFORGE_GRADE_MULTIPLIER_V115 = 2.50;
export const REFORGE_V142_RANK_MULTIPLIER_V143 = 1.32;
export const REFORGE_BASE_SPIRIT_STONES_MUNDANE_V115 = 1_000;
export const REFORGE_BASE_ESSENCE_MUNDANE_V115 = 1;
export const AFFIX_FAMILY_CHANGE_RESOURCE_V115 = 'resource.affix_family_change_core';
export const AFFIX_FAMILY_CHANGE_RESOURCE_NAME_V115 = 'Chuyển Tính Thạch';
export const AFFIX_REFINE_BASE_SPIRIT_STONES_MUNDANE_V115 = 250;
export const AFFIX_REFINE_BASE_ESSENCE_MUNDANE_V115 = 1;
export const EQUIPMENT_CRAFT_BASE_SPIRIT_STONES_MUNDANE_V115 = 5_000;
export const EQUIPMENT_CRAFT_BASE_ESSENCE_MUNDANE_V115 = 5;
export const DAO_INSCRIPTION_FRAGMENT_RESOURCE_V115 = 'resource.dao_inscription_fragment';
export const DAO_INSCRIPTION_FRAGMENT_RESOURCE_NAME_V115 = 'Tàn Văn';
export const DAO_INSCRIPTION_BASE_FRAGMENT_COST_MUNDANE_V115 = 30;
export const DAO_INSCRIPTION_BASE_SPIRIT_STONES_MUNDANE_V115 = 20_000;
export const DAO_INSCRIPTION_BASE_ESSENCE_MUNDANE_V115 = 20;
export const DAO_INSCRIPTION_SALVAGE_RETURN_RATE_V115 = 1 / 3;

function isV142Item(value) { return Boolean(value && typeof value === 'object' && value.schema === EQUIPMENT_V142_SCHEMA); }
function v142RankIndex(item) { return Math.max(0, Math.floor(Number(item?.equipmentRankIndex) || 0)); }
function gradeIndex(itemOrGrade) {
    const grade = typeof itemOrGrade === 'string' ? itemOrGrade : (itemOrGrade.grade ?? 'mundane');
    return Math.max(0, equipmentGradeIndex(grade));
}
export function equipmentGradeCostScaleV115(itemOrGrade) {
    if (isV142Item(itemOrGrade)) return Math.pow(REFORGE_V142_RANK_MULTIPLIER_V143, v142RankIndex(itemOrGrade));
    return Math.pow(REFORGE_GRADE_MULTIPLIER_V115, gradeIndex(itemOrGrade));
}
export function equipmentEssenceResourceForGradeV115(grade) {
    return economyMaterialResourceId('equipmentEssence', gradeIndex(grade) + 1, 'essence');
}
export function equipmentEssenceResourceForItemV143(item) {
    return isV142Item(item) ? EQUIPMENT_ENHANCE_ESSENCE_RESOURCE : equipmentEssenceResourceForGradeV115(item?.grade ?? 'mundane');
}
function roundPositive(value) { return Math.max(1, Math.round(value)); }

export function reforgeCostV115(item, targetFamily) {
    const costScale = equipmentGradeCostScaleV115(item);
    const repeats = Math.max(0, Math.floor(item.reforgeCount ?? 0));
    const repeatScale = Math.pow(REFORGE_REPEAT_MULTIPLIER_V115, repeats);
    const currentFamily = item.affixes?.[0]?.family;
    const familyChanged = Boolean(targetFamily && currentFamily && targetFamily !== currentFamily);
    return {
        spiritStones: roundPositive(REFORGE_BASE_SPIRIT_STONES_MUNDANE_V115 * costScale * repeatScale),
        essenceResourceId: equipmentEssenceResourceForItemV143(item),
        equipmentEssence: roundPositive(REFORGE_BASE_ESSENCE_MUNDANE_V115 * costScale * repeatScale),
        ...(familyChanged ? { familyChangeResourceId: AFFIX_FAMILY_CHANGE_RESOURCE_V115, familyChangeMaterial: 1 } : {}),
    };
}
export function reforgeAffixCostV115(item, index, targetFamily) {
    const old = item.affixes?.[index];
    if (!old) throw new Error('Không tìm thấy dòng affix cần Tái Luyện.');
    const cost = reforgeCostV115(item);
    if (targetFamily && targetFamily !== old.family) {
        cost.familyChangeResourceId = AFFIX_FAMILY_CHANGE_RESOURCE_V115;
        cost.familyChangeMaterial = 1;
    }
    return cost;
}
export function refineAffixCostV115(item, index) {
    const roll = item.affixes?.[index];
    if (!roll) throw new Error('Không tìm thấy dòng affix cần Tinh Luyện.');
    if (roll.rollPct >= EQUIPMENT_AFFIX_MAX_ROLL_PCT_V114 - 1e-9) throw new Error('Dòng affix đã đạt 100%.');
    const costScale = equipmentGradeCostScaleV115(item);
    const nearPerfectScale = 1 + Math.max(0, roll.rollPct - EQUIPMENT_AFFIX_MIN_ROLL_PCT_V114) / 20;
    return {
        spiritStones: roundPositive(AFFIX_REFINE_BASE_SPIRIT_STONES_MUNDANE_V115 * costScale * nearPerfectScale),
        essenceResourceId: equipmentEssenceResourceForItemV143(item),
        equipmentEssence: roundPositive(AFFIX_REFINE_BASE_ESSENCE_MUNDANE_V115 * costScale * nearPerfectScale),
    };
}
export function craftEquipmentCostV115(grade) {
    const scale = equipmentGradeCostScaleV115(grade);
    return {
        spiritStones: roundPositive(EQUIPMENT_CRAFT_BASE_SPIRIT_STONES_MUNDANE_V115 * scale),
        essenceResourceId: equipmentEssenceResourceForGradeV115(grade),
        equipmentEssence: roundPositive(EQUIPMENT_CRAFT_BASE_ESSENCE_MUNDANE_V115 * scale),
    };
}
export function daoEngraveCostV115(item) {
    const grade = item.grade ?? 'mundane';
    const scale = equipmentGradeCostScaleV115(grade);
    return {
        spiritStones: roundPositive(DAO_INSCRIPTION_BASE_SPIRIT_STONES_MUNDANE_V115 * scale),
        essenceResourceId: equipmentEssenceResourceForGradeV115(grade),
        equipmentEssence: roundPositive(DAO_INSCRIPTION_BASE_ESSENCE_MUNDANE_V115 * scale),
        daoFragmentResourceId: DAO_INSCRIPTION_FRAGMENT_RESOURCE_V115,
        daoFragments: roundPositive(DAO_INSCRIPTION_BASE_FRAGMENT_COST_MUNDANE_V115 * scale),
    };
}
export function daoInscriptionFragmentYieldV115(item) {
    if (!item.daoInscription) return 0;
    const cost = daoEngraveCostV115(item).daoFragments ?? 0;
    return Math.max(1, Math.round(cost * DAO_INSCRIPTION_SALVAGE_RETURN_RATE_V115));
}
export function spendEquipmentEconomyCostV115(inventory, cost) {
    const requirements = [
        ['resource.spirit_stone', cost.spiritStones, 'Linh Thạch'],
        [cost.essenceResourceId, cost.equipmentEssence, cost.essenceResourceId === EQUIPMENT_ENHANCE_ESSENCE_RESOURCE ? 'Khí Luyện Tinh Hoa' : 'Tinh Hoa Trang Bị'],
    ];
    if (cost.familyChangeResourceId && cost.familyChangeMaterial) requirements.push([cost.familyChangeResourceId, cost.familyChangeMaterial, AFFIX_FAMILY_CHANGE_RESOURCE_NAME_V115]);
    if (cost.daoFragmentResourceId && cost.daoFragments) requirements.push([cost.daoFragmentResourceId, cost.daoFragments, DAO_INSCRIPTION_FRAGMENT_RESOURCE_NAME_V115]);
    const missing = requirements.filter(([id, n]) => Math.max(0, Math.floor(inventory[id] ?? 0)) < n);
    if (missing.length) throw new Error(`Thiếu tài nguyên: ${missing.map(([id, n, name]) => `${name} ${Math.max(0, Math.floor(inventory[id] ?? 0))}/${n}`).join(' · ')}.`);
    for (const [id, n] of requirements) inventory[id] = Math.max(0, Math.floor(inventory[id] ?? 0) - n);
}
export function reforgeEquipmentAffixEconomyV115(item, index, seed, inventory, targetFamily) {
    const old = item.affixes?.[index];
    if (!old) throw new Error('Không tìm thấy dòng affix cần Tái Luyện.');
    const cost = reforgeAffixCostV115(item, index, targetFamily);
    const test = structuredClone(item);
    const after = reforgeEquipmentAffixV114(test, index, seed, { targetFamily, familyChangeAuthorized: Boolean(targetFamily && targetFamily !== old.family) });
    spendEquipmentEconomyCostV115(inventory, cost);
    const countBefore = Math.max(0, Math.floor(item.reforgeCount ?? 0));
    item.affixes = (test.affixes ?? []).map(x => ({ ...x }));
    item.reforgeCount = countBefore + 1;
    return { itemId: item.id, index, before: { ...old }, after: { ...after }, reforgeCountBefore: countBefore, reforgeCountAfter: item.reforgeCount, familyChanged: after.family !== old.family, cost };
}
export function refineEquipmentAffixV115(item, index, inventory) {
    const old = item.affixes?.[index];
    if (!old) throw new Error('Không tìm thấy dòng affix cần Tinh Luyện.');
    const cost = refineAffixCostV115(item, index);
    const nextPct = Math.min(EQUIPMENT_AFFIX_MAX_ROLL_PCT_V114, old.rollPct + 1);
    const target = old.rollPct > 0 ? old.value / (old.rollPct / 100) : old.value;
    const next = { ...old, value: Math.round(target * nextPct / 100 * 10000) / 10000, rollPct: Math.round(nextPct * 100) / 100 };
    const copy = (item.affixes ?? []).map(x => ({ ...x }));
    copy[index] = next;
    validateEquipmentAffixesV114(copy, item.daoInscription);
    spendEquipmentEconomyCostV115(inventory, cost);
    item.affixes = copy;
    return { itemId: item.id, index, before: { ...old }, after: { ...next }, cost };
}
export function ensureCraftPreferredAffixFamilyV115(item, preferredFamily, seed) {
    const affixes = item.affixes ?? [];
    if (affixes.some(x => x.family === preferredFamily)) return;
    const indices = [...affixes.keys()];
    for (const index of indices) {
        const test = structuredClone(item);
        try {
            reforgeEquipmentAffixV114(test, index, seed + index * 97, { targetFamily: preferredFamily, familyChangeAuthorized: true });
            if (test.affixes?.some(x => x.family === preferredFamily)) {
                item.affixes = (test.affixes ?? []).map(x => ({ ...x }));
                validateEquipmentAffixesV114(item.affixes, item.daoInscription);
                return;
            }
        } catch { /* try another line */ }
    }
    throw new Error(`Không có affix family ${preferredFamily} đang live và hợp lệ cho món craft này.`);
}
export function craftEquipmentWithPreferredFamilyV115(input) {
    const cost = craftEquipmentCostV115(input.grade);
    const item = buildEquipmentInstance(input.template, input.tier, input.quality, input.floor, input.source, input.acquiredWorldYear, input.grade);
    ensureCraftPreferredAffixFamilyV115(item, input.preferredFamily, input.source.seed ^ 0x115c0de);
    spendEquipmentEconomyCostV115(input.inventory, cost);
    addEquipment(input.equipmentState, item);
    return { item, cost };
}
export function engraveDaoInscriptionExactV115(item, inscriptionId, inventory) {
    const id = String(inscriptionId ?? '').trim();
    if (!id) throw new Error('Đạo Văn đích không được để trống.');
    const authored = requireAuthoredDaoInscriptionV128(id);
    const cost = daoEngraveCostV115(item);
    spendEquipmentEconomyCostV115(inventory, cost);
    const inscription = forgeDaoInscriptionDeterministicV114(item, id, true);
    return { itemId: item.id, inscription: { ...inscription, name: authored.name, description: authored.description }, cost };
}
export function canDirectTransferDaoInscriptionV115() { return false; }
//# sourceMappingURL=equipment-reforge-v115.js.map