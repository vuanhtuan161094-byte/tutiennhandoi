import { economyMaterialResourceId } from './economy-v111.js';
import { addEquipment, buildEquipmentInstance, equipmentGradeIndex, } from './equipment.js';
import { requireAuthoredDaoInscriptionV128 } from './equipment-inscription-gem-v128.js';
import { EQUIPMENT_AFFIX_MAX_ROLL_PCT_V114, EQUIPMENT_AFFIX_MIN_ROLL_PCT_V114, forgeDaoInscriptionDeterministicV114, reforgeEquipmentAffixV114, validateEquipmentAffixesV114, } from './equipment-affix-v114.js';
/**
 * v1.15 Reforge + Crafting Economy V1.
 *
 * Locked decisions:
 * - ordinary reforge changes one affix to another affix in the SAME family and rerolls its value
 * - no line-lock UI because only the selected line changes
 * - ordinary reforge costs Linh Thạch + same-grade Tinh Hoa Trang Bị
 * - every successful reforge on the same item increases future reforge cost forever by x1.50
 * - grade base cost scales x2.5 per Phàm -> Phá step
 * - changing family also consumes one dedicated rare material; caller chooses target family, exact affix stays random
 * - refining keeps the exact affix and guarantees +1 roll percentage point until 100%; cost rises mildly near 100
 * - crafted equipment may guarantee at least one chosen live affix family, while keeping the same affix ceiling as drops
 * - Đạo Văn deterministic engraving is exact; dismantling any inscribed item returns ~33% of its Tàn Văn cost
 * - no direct Đạo Văn transfer item -> item
 */
export const REFORGE_REPEAT_MULTIPLIER_V115 = 1.50;
export const REFORGE_GRADE_MULTIPLIER_V115 = 2.50;
export const REFORGE_BASE_SPIRIT_STONES_MUNDANE_V115 = 1_000;
export const REFORGE_BASE_ESSENCE_MUNDANE_V115 = 1;
/** Rare dedicated material for changing affix family. Source/drop rate is intentionally authored elsewhere. */
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
function gradeIndex(itemOrGrade) {
    const grade = typeof itemOrGrade === 'string' ? itemOrGrade : (itemOrGrade.grade ?? 'mundane');
    return Math.max(0, equipmentGradeIndex(grade));
}
export function equipmentGradeCostScaleV115(itemOrGrade) {
    return Math.pow(REFORGE_GRADE_MULTIPLIER_V115, gradeIndex(itemOrGrade));
}
export function equipmentEssenceResourceForGradeV115(grade) {
    return economyMaterialResourceId('equipmentEssence', gradeIndex(grade) + 1, 'essence');
}
function roundPositive(value) { return Math.max(1, Math.round(value)); }
export function reforgeCostV115(item, targetFamily) {
    const grade = item.grade ?? 'mundane';
    const gradeScale = equipmentGradeCostScaleV115(grade);
    const repeats = Math.max(0, Math.floor(item.reforgeCount ?? 0));
    const repeatScale = Math.pow(REFORGE_REPEAT_MULTIPLIER_V115, repeats);
    const currentFamily = item.affixes?.[0]?.family;
    const familyChanged = Boolean(targetFamily && currentFamily && targetFamily !== currentFamily);
    return {
        spiritStones: roundPositive(REFORGE_BASE_SPIRIT_STONES_MUNDANE_V115 * gradeScale * repeatScale),
        essenceResourceId: equipmentEssenceResourceForGradeV115(grade),
        equipmentEssence: roundPositive(REFORGE_BASE_ESSENCE_MUNDANE_V115 * gradeScale * repeatScale),
        ...(familyChanged ? { familyChangeResourceId: AFFIX_FAMILY_CHANGE_RESOURCE_V115, familyChangeMaterial: 1 } : {}),
    };
}
/** Cost preview for a specific selected affix. This is the authoritative family-change detector. */
export function reforgeAffixCostV115(item, index, targetFamily) {
    const old = item.affixes?.[index];
    if (!old)
        throw new Error('Không tìm thấy dòng affix cần Tái Luyện.');
    const cost = reforgeCostV115(item);
    if (targetFamily && targetFamily !== old.family) {
        cost.familyChangeResourceId = AFFIX_FAMILY_CHANGE_RESOURCE_V115;
        cost.familyChangeMaterial = 1;
    }
    return cost;
}
export function refineAffixCostV115(item, index) {
    const roll = item.affixes?.[index];
    if (!roll)
        throw new Error('Không tìm thấy dòng affix cần Tinh Luyện.');
    if (roll.rollPct >= EQUIPMENT_AFFIX_MAX_ROLL_PCT_V114 - 1e-9)
        throw new Error('Dòng affix đã đạt 100%.');
    const grade = item.grade ?? 'mundane';
    const gradeScale = equipmentGradeCostScaleV115(grade);
    // Mild increase: 80% = x1.00, 90% = x1.50, 99% ~= x1.95.
    const nearPerfectScale = 1 + Math.max(0, roll.rollPct - EQUIPMENT_AFFIX_MIN_ROLL_PCT_V114) / 20;
    return {
        spiritStones: roundPositive(AFFIX_REFINE_BASE_SPIRIT_STONES_MUNDANE_V115 * gradeScale * nearPerfectScale),
        essenceResourceId: equipmentEssenceResourceForGradeV115(grade),
        equipmentEssence: roundPositive(AFFIX_REFINE_BASE_ESSENCE_MUNDANE_V115 * gradeScale * nearPerfectScale),
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
    if (!item.daoInscription)
        return 0;
    const cost = daoEngraveCostV115(item).daoFragments ?? 0;
    return Math.max(1, Math.round(cost * DAO_INSCRIPTION_SALVAGE_RETURN_RATE_V115));
}
export function spendEquipmentEconomyCostV115(inventory, cost) {
    const requirements = [
        ['resource.spirit_stone', cost.spiritStones, 'Linh Thạch'],
        [cost.essenceResourceId, cost.equipmentEssence, 'Tinh Hoa Trang Bị'],
    ];
    if (cost.familyChangeResourceId && cost.familyChangeMaterial)
        requirements.push([cost.familyChangeResourceId, cost.familyChangeMaterial, AFFIX_FAMILY_CHANGE_RESOURCE_NAME_V115]);
    if (cost.daoFragmentResourceId && cost.daoFragments)
        requirements.push([cost.daoFragmentResourceId, cost.daoFragments, DAO_INSCRIPTION_FRAGMENT_RESOURCE_NAME_V115]);
    const missing = requirements.filter(([id, n]) => Math.max(0, Math.floor(inventory[id] ?? 0)) < n);
    if (missing.length)
        throw new Error(`Thiếu tài nguyên: ${missing.map(([id, n, name]) => `${name} ${Math.max(0, Math.floor(inventory[id] ?? 0))}/${n}`).join(' · ')}.`);
    for (const [id, n] of requirements)
        inventory[id] = Math.max(0, Math.floor(inventory[id] ?? 0) - n);
}
/**
 * Transactional reforge: test the deterministic result on a clone first, then spend, then commit.
 * The per-item counter increments only after success and never resets by equip/storage/reload.
 */
export function reforgeEquipmentAffixEconomyV115(item, index, seed, inventory, targetFamily) {
    const old = item.affixes?.[index];
    if (!old)
        throw new Error('Không tìm thấy dòng affix cần Tái Luyện.');
    const cost = reforgeAffixCostV115(item, index, targetFamily);
    const test = structuredClone(item);
    const after = reforgeEquipmentAffixV114(test, index, seed, { targetFamily, familyChangeAuthorized: Boolean(targetFamily && targetFamily !== old.family) });
    spendEquipmentEconomyCostV115(inventory, cost);
    const countBefore = Math.max(0, Math.floor(item.reforgeCount ?? 0));
    item.affixes = (test.affixes ?? []).map(x => ({ ...x }));
    item.reforgeCount = countBefore + 1;
    return { itemId: item.id, index, before: { ...old }, after: { ...after }, reforgeCountBefore: countBefore, reforgeCountAfter: item.reforgeCount, familyChanged: after.family !== old.family, cost };
}
/** Guaranteed +1 percentage point, no fail/no downgrade/no affix replacement. */
export function refineEquipmentAffixV115(item, index, inventory) {
    const old = item.affixes?.[index];
    if (!old)
        throw new Error('Không tìm thấy dòng affix cần Tinh Luyện.');
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
/**
 * Guarantee one selected live family on a crafted item. Exact affix remains random and all v1.14 caps/exclusive groups stay enforced.
 * If the normal roll already contains the family, nothing is replaced.
 */
export function ensureCraftPreferredAffixFamilyV115(item, preferredFamily, seed) {
    const affixes = item.affixes ?? [];
    if (affixes.some(x => x.family === preferredFamily))
        return;
    const indices = [...affixes.keys()];
    // Try each line on a clone. This naturally rejects impossible Build/Căn Nguyên/exclusive combinations.
    for (const index of indices) {
        const test = structuredClone(item);
        try {
            reforgeEquipmentAffixV114(test, index, seed + index * 97, { targetFamily: preferredFamily, familyChangeAuthorized: true });
            if (test.affixes?.some(x => x.family === preferredFamily)) {
                item.affixes = (test.affixes ?? []).map(x => ({ ...x }));
                validateEquipmentAffixesV114(item.affixes, item.daoInscription);
                return;
            }
        }
        catch { /* try another line */ }
    }
    throw new Error(`Không có affix family ${preferredFamily} đang live và hợp lệ cho món craft này.`);
}
export function craftEquipmentWithPreferredFamilyV115(input) {
    const cost = craftEquipmentCostV115(input.grade);
    // Build and validate before spending to keep the transaction atomic.
    const item = buildEquipmentInstance(input.template, input.tier, input.quality, input.floor, input.source, input.acquiredWorldYear, input.grade);
    ensureCraftPreferredAffixFamilyV115(item, input.preferredFamily, input.source.seed ^ 0x115c0de);
    spendEquipmentEconomyCostV115(input.inventory, cost);
    addEquipment(input.equipmentState, item);
    return { item, cost };
}
export function engraveDaoInscriptionExactV115(item, inscriptionId, inventory) {
    const id = String(inscriptionId ?? '').trim();
    if (!id)
        throw new Error('Đạo Văn đích không được để trống.');
    const authored = requireAuthoredDaoInscriptionV128(id);
    const cost = daoEngraveCostV115(item);
    spendEquipmentEconomyCostV115(inventory, cost);
    const inscription = forgeDaoInscriptionDeterministicV114(item, id, true);
    return { itemId: item.id, inscription: { ...inscription, name: authored.name, description: authored.description }, cost };
}
/** Explicitly no direct item->item transfer API by lock. */
export function canDirectTransferDaoInscriptionV115() { return false; }
//# sourceMappingURL=equipment-reforge-v115.js.map