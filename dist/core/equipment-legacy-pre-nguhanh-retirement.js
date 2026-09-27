import { equipmentAffixPowerV114, equipmentAffixCountV114, formatEquipmentAffixV114, rollEquipmentAffixesV114, validateEquipmentAffixesV114 } from './equipment-affix-v114.js';
import { activeEquipmentSetMechanicsV116, equipmentSetMechanicTagsV116, isEquipmentSetV116, isLiveEquipmentSetV12310, RETIRED_EQUIPMENT_SET_IDS_V12310, EQUIPMENT_SET_MAX_BUILD_AFFIXES_V116 } from './equipment-set-v116.js';
import { daoInscriptionPowerV128, equipmentGemEffectV128, equipmentGemSocketCountV128 } from './equipment-inscription-gem-v128.js';
import { boundedStatCapV129, combineBoundedPct, combineStatPctV129 } from './combat-rules.js';
import { EQUIPMENT_MAX_ENHANCEMENT_V142, equipmentSetPowerV142 } from './equipment-v142.js';
export const CANONICAL_EQUIPMENT_SLOTS = [
    'weapon', 'head', 'robe', 'belt', 'bracelet', 'gloves', 'boots', 'necklace', 'ring', 'talisman',
];
export const EQUIPMENT_SLOT_LABELS = {
    weapon: 'Vũ Khí', head: 'Đầu', robe: 'Y Phục', belt: 'Đai', bracelet: 'Vòng',
    gloves: 'Hộ Thủ', boots: 'Giày', necklace: 'Ngọc Bội', ring: 'Nhẫn', talisman: 'Hộ Phù',
};
/** Legacy progression scale. It stays intact so all pre-v0.98 dungeon floors keep their authored pacing. */
export const equipmentTiers = {
    0: { tier: 0, name: 'Phàm Khí', powerMultiplier: 1 },
    1: { tier: 1, name: 'Pháp Khí', powerMultiplier: 1.55 },
    2: { tier: 2, name: 'Linh Khí', powerMultiplier: 2.4 },
    3: { tier: 3, name: 'Bảo Khí', powerMultiplier: 3.7 },
    4: { tier: 4, name: 'Huyền Bảo', powerMultiplier: 5.8 },
    5: { tier: 5, name: 'Chân Bảo', powerMultiplier: 9.0 },
    6: { tier: 6, name: 'Tiên Khí', powerMultiplier: 13.5 },
    7: { tier: 7, name: 'Huyền Tiên Khí', powerMultiplier: 19.5 },
    8: { tier: 8, name: 'Kim Tiên Khí', powerMultiplier: 28.0 },
    9: { tier: 9, name: 'Thái Ất Tiên Khí', powerMultiplier: 40.0 },
    10: { tier: 10, name: 'Đại La Tiên Khí', powerMultiplier: 57.0 },
    11: { tier: 11, name: 'Vương Khí', powerMultiplier: 81.0 },
    12: { tier: 12, name: 'Đế Khí', powerMultiplier: 116.0 },
    13: { tier: 13, name: 'Cực Khí', powerMultiplier: 166.0 },
    14: { tier: 14, name: 'Cực Đạo Chân Khí', powerMultiplier: 238.0 },
    15: { tier: 15, name: 'Hỗn Độn Khí', powerMultiplier: 342.0 },
    16: { tier: 16, name: 'Hồng Mông Khí', powerMultiplier: 493.0 },
    17: { tier: 17, name: 'Khai Thiên Khí', powerMultiplier: 712.0 },
    18: { tier: 18, name: 'Giới Chủ Khí', powerMultiplier: 1030.0 },
    19: { tier: 19, name: 'Vĩnh Sinh Khí', powerMultiplier: 1490.0 },
    20: { tier: 20, name: 'Sáng Thế Thần Khí', powerMultiplier: 2160.0 },
};
/** New locked grade curve. Tiên is the long-run common target; Phá is deliberately exceptional. */
export const equipmentGrades = {
    mundane: { id: 'mundane', name: 'Phàm', powerMultiplier: 1.0, traitCount: 1, affixCount: 3, costMultiplier: 0.75 },
    spirit: { id: 'spirit', name: 'Linh', powerMultiplier: 1.5, traitCount: 1, affixCount: 3, costMultiplier: 0.9 },
    mystic: { id: 'mystic', name: 'Huyền', powerMultiplier: 2.2, traitCount: 2, affixCount: 4, costMultiplier: 1.05 },
    earth: { id: 'earth', name: 'Địa', powerMultiplier: 3.1, traitCount: 2, affixCount: 4, costMultiplier: 1.25 },
    heaven: { id: 'heaven', name: 'Thiên', powerMultiplier: 4.5, traitCount: 3, affixCount: 5, costMultiplier: 1.55 },
    immortal: { id: 'immortal', name: 'Tiên', powerMultiplier: 7.5, traitCount: 3, affixCount: 5, costMultiplier: 2.0 },
    extreme: { id: 'extreme', name: 'Cực', powerMultiplier: 12.0, traitCount: 4, affixCount: 6, costMultiplier: 2.8 },
    breaker: { id: 'breaker', name: 'Phá', powerMultiplier: 18.0, traitCount: 5, affixCount: 6, costMultiplier: 4.0 },
};
export const EQUIPMENT_MAX_ENHANCEMENT = 20;
export const EQUIPMENT_ANTI_DOWNGRADE_RESOURCE = 'resource.enhancement_protection_talisman';
export const EQUIPMENT_TRANSFER_GEM_RESOURCE = 'resource.enhancement_transfer_gem';
export const EQUIPMENT_ENHANCE_ESSENCE_RESOURCE = 'resource.forging_essence';
const qualityMultipliers = {
    low: 0.86,
    mid: 1,
    high: 1.16,
    supreme: 1.34,
    perfect: 1.55,
};
const qualityNames = {
    low: 'Hạ Phẩm',
    mid: 'Trung Phẩm',
    high: 'Thượng Phẩm',
    supreme: 'Cực Phẩm',
    perfect: 'Hoàn Mỹ',
};
const gradeOrder = ['mundane', 'spirit', 'mystic', 'earth', 'heaven', 'immortal', 'extreme', 'breaker'];
const elementTags = [
    ['Metal', 'Metal'], ['Wood', 'Wood'], ['Water', 'Water'], ['Fire', 'Fire'], ['Earth', 'Earth'],
    ['Lightning', 'Lightning'], ['Wind', 'Wind'], ['Ice', 'Ice'], ['Poison', 'Poison'], ['Blood', 'Blood'],
    ['Yin', 'Yin'], ['Yang', 'Yang'], ['Soul', 'Soul'],
];
export function equipmentQualityName(quality) { return qualityNames[quality]; }
export function equipmentTierName(tier) { return equipmentTiers[tier]?.name ?? `Tier ${tier}`; }
export function equipmentGradeName(grade) { return equipmentGrades[grade ?? 'mundane'].name; }
export function equipmentGradeMultiplier(grade) { return equipmentGrades[grade ?? 'mundane'].powerMultiplier; }
export function equipmentGradeIndex(grade) { return gradeOrder.indexOf(grade); }
export function canonicalEquipmentSlot(slot, seed = 0) {
    if (slot !== 'accessory')
        return slot;
    const accessorySlots = ['necklace', 'ring', 'bracelet', 'talisman'];
    return accessorySlots[Math.abs(seed >>> 0) % accessorySlots.length];
}
export function equipmentSlotGroup(slot) {
    const canonical = canonicalEquipmentSlot(slot);
    return ['necklace', 'ring', 'bracelet', 'talisman'].includes(canonical) ? 'jewelry' : 'attire';
}
export function createEquipmentState() { return { items: [], equipped: {}, unlockedSetIds: [] }; }
export function cloneEquipmentState(state) {
    return {
        items: state.items.map(item => ({
            ...item,
            grade: item.grade ?? inferLegacyEquipmentGrade(item.tier),
            enhancementLevel: clampEnhancement(item.enhancementLevel ?? 0),
            traitIds: [...(item.traitIds ?? [])],
            affixes: (item.affixes ?? []).map(affix => ({ ...affix })),
            daoInscription: item.daoInscription ? { ...item.daoInscription } : undefined,
            gemSockets: (item.gemSockets ?? []).map(gem => gem ? { ...gem } : null),
            reforgeCount: Math.max(0, Math.floor(item.reforgeCount ?? 0)),
            stats: cloneStats(item.stats),
            tags: [...item.tags],
            source: { ...item.source },
        })),
        equipped: { ...state.equipped },
        unlockedSetIds: [...(state.unlockedSetIds ?? [])],
    };
}
function cloneStats(stats) {
    return {
        ...stats,
        ...(stats.elementalAffinities ? { elementalAffinities: structuredClone(stats.elementalAffinities) } : {}),
        ...(stats.elementalResistancesPct ? { elementalResistancesPct: { ...stats.elementalResistancesPct } } : {}),
        ...(stats.cooldownReductionBySkillPct ? { cooldownReductionBySkillPct: { ...stats.cooldownReductionBySkillPct } } : {}),
        ...(stats.cooldownReductionByTagPct ? { cooldownReductionByTagPct: { ...stats.cooldownReductionByTagPct } } : {}),
    };
}
function scaleStat(value, multiplier) { return Math.round(value * multiplier * 1000) / 1000; }
/**
 * Main equipment budget can grow with the full tier/grade curve, but percentage/utility stats must not
 * explode at apex/endless floors. Crit is the explicit exception because locked combat converts crit
 * overflow into crit damage. Elemental affinity is supplied by traits and follows its own bounded rules.
 */
function rolledStatMultiplier(key, fullMultiplier) {
    if (['maxHp', 'maxSpirit', 'attack', 'defense', 'physique'].includes(key))
        return fullMultiplier;
    if (key === 'critChancePct')
        return Math.min(250, Math.sqrt(Math.max(1, fullMultiplier)));
    if (['mobility', 'accuracy', 'controlPower', 'resolve'].includes(key))
        return Math.min(25, Math.pow(Math.max(1, fullMultiplier), 0.30));
    return Math.min(12, Math.pow(Math.max(1, fullMultiplier), 0.20));
}
function clampEnhancement(level) { return Math.max(0, Math.min(EQUIPMENT_MAX_ENHANCEMENT, Math.floor(Number(level) || 0))); }
function hash01(seed, salt) {
    let x = ((seed >>> 0) ^ Math.imul((salt + 1) >>> 0, 0x9e3779b1)) >>> 0;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
}
export function inferLegacyEquipmentGrade(tier) {
    if (tier <= 0)
        return 'mundane';
    if (tier <= 2)
        return 'spirit';
    if (tier === 3)
        return 'mystic';
    if (tier === 4)
        return 'earth';
    if (tier === 5)
        return 'heaven';
    return 'immortal';
}
/**
 * Mature/immortal content intentionally centers on Tiên grade. Cực is uncommon and Phá remains sub-1% even at apex tiers.
 */
export function rollEquipmentGrade(tier, quality, floor, seed) {
    if (tier < 6) {
        const base = inferLegacyEquipmentGrade(tier);
        const baseIndex = equipmentGradeIndex(base);
        const qualityBoost = { low: 0.04, mid: 0.08, high: 0.13, supreme: 0.19, perfect: 0.27 }[quality];
        const floorBoost = Math.min(0.08, Math.max(0, floor - 1) * 0.008);
        return hash01(seed, 17) < qualityBoost + floorBoost ? gradeOrder[Math.min(5, baseIndex + 1)] : base;
    }
    const q = { low: 0, mid: 0.01, high: 0.02, supreme: 0.04, perfect: 0.07 }[quality];
    const depth = Math.max(0, tier - 6);
    const breakerChance = Math.min(0.008, 0.00035 + depth * 0.00022 + q * 0.025 + Math.max(0, floor - 4) * 0.00008);
    const extremeChance = Math.min(0.12, 0.025 + depth * 0.003 + q * 0.65);
    const heavenChance = Math.max(0.025, 0.08 - Math.min(0.05, depth * 0.004));
    const roll = hash01(seed, 31);
    if (roll < breakerChance)
        return 'breaker';
    if (roll < breakerChance + extremeChance)
        return 'extreme';
    if (roll < breakerChance + extremeChance + heavenChance)
        return 'heaven';
    return 'immortal';
}
function itemElement(template, seed) {
    for (const [tag, element] of elementTags)
        if (template.tags.includes(tag))
            return element;
    const fallback = ['Metal', 'Wood', 'Water', 'Fire', 'Earth'];
    return fallback[Math.floor(hash01(seed, 53) * fallback.length)];
}
const nonElementTraitPool = [
    'trait.crit_focus',
    'trait.armor_break',
    'trait.iron_body',
    'trait.spirit_flow',
    'trait.heart_focus',
    'trait.swift_step',
    'trait.control_guard',
    'trait.blood_breath',
];
export function rollEquipmentTraits(template, grade, seed) {
    const count = equipmentGrades[grade].traitCount;
    const element = itemElement(template, seed);
    const result = [`trait.element.${element.toLowerCase()}`];
    if (count <= 1)
        return result;
    const candidates = [...nonElementTraitPool];
    for (let i = 1; i < count && candidates.length; i++) {
        const index = Math.floor(hash01(seed, 70 + i) * candidates.length);
        result.push(candidates.splice(index, 1)[0]);
    }
    return result;
}
export function buildEquipmentInstance(template, tier, quality, floor, source, acquiredWorldYear, forcedGrade) {
    const tierDef = equipmentTiers[tier];
    if (!tierDef)
        throw new Error(`Unknown equipment tier: ${tier}`);
    const floorMultiplier = 1 + Math.max(0, floor - 1) * 0.08;
    const grade = template.fixedGrade ?? forcedGrade ?? rollEquipmentGrade(tier, quality, floor, source.seed);
    const gradeMultiplier = equipmentGrades[grade].powerMultiplier;
    const multiplier = tierDef.powerMultiplier * qualityMultipliers[quality] * floorMultiplier * gradeMultiplier;
    const stats = {};
    for (const [key, value] of Object.entries(template.baseStats)) {
        if (value === undefined)
            continue;
        stats[key] = scaleStat(value, rolledStatMultiplier(key, multiplier));
    }
    const slot = canonicalEquipmentSlot(template.slot, source.seed);
    const itemLevel = tier * 1000 + equipmentGradeIndex(grade) * 100 + floor * 10 + Math.round(qualityMultipliers[quality] * 10);
    const legacyTraits = rollEquipmentTraits(template, grade, source.seed);
    const affixes = rollEquipmentAffixesV114({ ...template, slot }, grade, source.seed, legacyTraits, template.setId?.startsWith('set.v116.') ? EQUIPMENT_SET_MAX_BUILD_AFFIXES_V116 : undefined);
    return {
        id: `equipment.${source.kind}.${source.dungeonId ?? source.recipeId ?? source.serviceId ?? 'unknown'}.${source.floor}.${source.seed}.${template.id}`,
        templateId: template.id,
        name: `${equipmentGrades[grade].name} · ${qualityNames[quality]} ${tierDef.name} · ${template.name}`,
        slot,
        tier,
        quality,
        grade,
        enhancementLevel: 0,
        traitIds: legacyTraits,
        affixes,
        reforgeCount: 0,
        gemSockets: Array.from({ length: equipmentGemSocketCountV128(grade) }, () => null),
        itemLevel,
        stats,
        tags: [...template.tags, `Grade:${equipmentGrades[grade].name}`],
        setId: template.setId,
        source: { ...source },
        acquiredWorldYear,
    };
}
export function addEquipment(state, item) {
    if (state.items.some(existing => existing.id === item.id))
        throw new Error(`Duplicate equipment instance: ${item.id}`);
    state.items.push({ ...item, grade: item.grade ?? inferLegacyEquipmentGrade(item.tier), enhancementLevel: clampEnhancement(item.enhancementLevel ?? 0), traitIds: [...(item.traitIds ?? [])], affixes: (item.affixes ?? []).map(affix => ({ ...affix })), daoInscription: item.daoInscription ? { ...item.daoInscription } : undefined, gemSockets: (item.gemSockets ?? []).map(gem => gem ? { ...gem } : null), reforgeCount: Math.max(0, Math.floor(item.reforgeCount ?? 0)), stats: cloneStats(item.stats), tags: [...item.tags], source: { ...item.source } });
    if (item.setId?.startsWith('set.v116.'))
        state.unlockedSetIds = [...new Set([...(state.unlockedSetIds ?? []), item.setId])];
}
export function equipItem(state, itemId) {
    const item = state.items.find(candidate => candidate.id === itemId);
    if (!item)
        throw new Error(`Unknown equipment instance: ${itemId}`);
    const slot = canonicalEquipmentSlot(item.slot, item.source.seed);
    item.slot = slot;
    state.equipped[slot] = item.id;
}
export function unequipSlot(state, slot) { delete state.equipped[canonicalEquipmentSlot(slot)]; }
export function equippedItems(state) {
    return [...new Set(Object.values(state.equipped))]
        .map(id => state.items.find(item => item.id === id))
        .filter((item) => Boolean(item));
}
/** Locked cumulative enhancement curve: +10=50%, +15=125%, +20=250%. */
export function enhancementBonusPct(level) {
    const lv = clampEnhancement(level);
    if (lv <= 10)
        return lv * 5;
    if (lv <= 15)
        return 50 + (lv - 10) * 15;
    return 125 + (lv - 15) * 25;
}
/** Success starts at 50%, reaches 30% at +10, 20% at +15, 10% at +20. */
export function enhancementSuccessChancePct(targetLevel) {
    const target = Math.max(1, Math.min(EQUIPMENT_MAX_ENHANCEMENT, Math.floor(targetLevel)));
    if (target <= 10)
        return Math.round((50 - (target - 1) * (20 / 9)) * 100) / 100;
    if (target <= 15)
        return Math.round((30 - (target - 10) * 2) * 100) / 100;
    return Math.round((20 - (target - 15) * 2) * 100) / 100;
}
export function enhancementDowngradeChancePct(targetLevel) {
    const target = Math.max(1, Math.min(EQUIPMENT_MAX_ENHANCEMENT, Math.floor(targetLevel)));
    if (target <= 5)
        return 0;
    if (target <= 10)
        return 25;
    if (target <= 15)
        return 50;
    return 75;
}
/** Cost depends on both grade and the level being attempted, as locked in design. */
export function enhancementEssenceCost(item, targetLevel) {
    const target = Math.max(1, Math.min(EQUIPMENT_MAX_ENHANCEMENT, Math.floor(targetLevel)));
    const grade = equipmentGrades[item.grade ?? inferLegacyEquipmentGrade(item.tier)];
    const levelCost = 4 + target * 2.2 + target * target * 0.28;
    return Math.max(1, Math.ceil(levelCost * grade.costMultiplier));
}
export function attemptEquipmentEnhancement(state, itemId, roll01, downgradeRoll01, useProtection, inventory) {
    const item = state.items.find(candidate => candidate.id === itemId);
    if (!item)
        throw new Error(`Unknown equipment instance: ${itemId}`);
    const beforeLevel = clampEnhancement(item.enhancementLevel ?? 0);
    const maxEnhancement = item.schema === 'equipment.v142' ? EQUIPMENT_MAX_ENHANCEMENT_V142 : EQUIPMENT_MAX_ENHANCEMENT;
    if (beforeLevel >= maxEnhancement)
        throw new Error(`Trang bị đã đạt +${maxEnhancement}.`);
    const targetLevel = beforeLevel + 1;
    const essenceCost = enhancementEssenceCost(item, targetLevel);
    const ownedEssence = inventory[EQUIPMENT_ENHANCE_ESSENCE_RESOURCE] ?? 0;
    if (ownedEssence + 1e-9 < essenceCost)
        throw new Error(`Không đủ Khí Luyện Tinh Hoa: cần ${essenceCost}.`);
    inventory[EQUIPMENT_ENHANCE_ESSENCE_RESOURCE] = ownedEssence - essenceCost;
    const successChancePct = enhancementSuccessChancePct(targetLevel);
    const success = Math.max(0, Math.min(0.999999999, roll01)) * 100 < successChancePct;
    const downgradeChancePct = enhancementDowngradeChancePct(targetLevel);
    let afterLevel = beforeLevel;
    let downgraded = false;
    let protectionUsed = false;
    const downgradeRollPct = Math.max(0, Math.min(0.999999999, downgradeRoll01)) * 100;
    if (success)
        afterLevel = targetLevel;
    else if (beforeLevel > 0 && downgradeRollPct < downgradeChancePct) {
        if (useProtection && (inventory[EQUIPMENT_ANTI_DOWNGRADE_RESOURCE] ?? 0) >= 1) {
            inventory[EQUIPMENT_ANTI_DOWNGRADE_RESOURCE] = (inventory[EQUIPMENT_ANTI_DOWNGRADE_RESOURCE] ?? 0) - 1;
            protectionUsed = true;
        }
        else {
            afterLevel = beforeLevel - 1;
            downgraded = true;
        }
    }
    item.enhancementLevel = afterLevel;
    return {
        itemId, beforeLevel, targetLevel, afterLevel, success, successChancePct, downgradeChancePct,
        downgraded, protectionUsed, essenceCost, rollPct: Math.max(0, Math.min(0.999999999, roll01)) * 100,
        ...(success ? {} : { downgradeRollPct }),
    };
}
export function transferEquipmentEnhancement(state, fromItemId, toItemId, inventory) {
    if (fromItemId === toItemId)
        throw new Error('Không thể chuyển cường hóa vào chính trang bị đó.');
    const source = state.items.find(item => item.id === fromItemId);
    const target = state.items.find(item => item.id === toItemId);
    if (!source || !target)
        throw new Error('Không tìm thấy trang bị nguồn/đích để chuyển cường hóa.');
    if (canonicalEquipmentSlot(source.slot, source.source.seed) !== canonicalEquipmentSlot(target.slot, target.source.seed))
        throw new Error('Ngọc Chuyển Cường Hóa chỉ chuyển giữa trang bị cùng ô.');
    const sourceLevel = clampEnhancement(source.enhancementLevel ?? 0);
    const targetLevel = clampEnhancement(target.enhancementLevel ?? 0);
    const targetMaxEnhancement = target.schema === 'equipment.v142' ? EQUIPMENT_MAX_ENHANCEMENT_V142 : EQUIPMENT_MAX_ENHANCEMENT;
    if (sourceLevel > targetMaxEnhancement)
        throw new Error(`Trang bị đích chỉ cho phép Cường Hóa tối đa +${targetMaxEnhancement}.`);
    if (sourceLevel <= 0)
        throw new Error('Trang bị nguồn chưa có cường hóa.');
    if (targetLevel >= sourceLevel)
        throw new Error('Trang bị đích đã có cấp cường hóa bằng hoặc cao hơn nguồn.');
    if ((inventory[EQUIPMENT_TRANSFER_GEM_RESOURCE] ?? 0) < 1)
        throw new Error('Không có Ngọc Chuyển Cường Hóa.');
    inventory[EQUIPMENT_TRANSFER_GEM_RESOURCE] = (inventory[EQUIPMENT_TRANSFER_GEM_RESOURCE] ?? 0) - 1;
    source.enhancementLevel = 0;
    target.enhancementLevel = sourceLevel;
    return { fromItemId, toItemId, transferredLevel: sourceLevel, sourceAfterLevel: 0, targetAfterLevel: sourceLevel };
}
export function effectiveEquipmentStats(item) {
    const multiplier = 1 + enhancementBonusPct(item.enhancementLevel ?? 0) / 100;
    const result = {};
    for (const [key, value] of Object.entries(item.stats)) {
        if (value === undefined)
            continue;
        result[key] = scaleStat(value, multiplier);
    }
    return result;
}
function addPartialStats(target, source) {
    for (const [key, value] of Object.entries(source)) {
        if (value === undefined || typeof value !== 'number')
            continue;
        target[key] = boundedStatCapV129(key) === undefined
            ? ((target[key] ?? 0) + value)
            : combineStatPctV129(key, target[key] ?? 0, value);
    }
}
function mergeAffinity(target, element, pct, evolutionMultiplier) {
    const current = target[element] ?? { pct: 0, evolutionMultiplier: 1 };
    target[element] = { pct: current.pct + pct, evolutionMultiplier: Math.max(current.evolutionMultiplier, evolutionMultiplier) };
}
function addTraitPower(item, flatStats, statMultipliers, affinities, resistances, grantedTags) {
    const grade = equipmentGrades[item.grade ?? inferLegacyEquipmentGrade(item.tier)];
    const gradeIndex = equipmentGradeIndex(grade.id);
    const traitScale = 1 + gradeIndex * 0.22;
    for (const traitId of item.traitIds ?? []) {
        if (traitId.startsWith('trait.element.')) {
            const key = traitId.slice('trait.element.'.length);
            const element = elementTags.find(([, id]) => id.toLowerCase() === key)?.[1];
            if (element) {
                // Phàm gear stays relevant as an inexpensive way to activate/build elemental affinity.
                const pct = Math.min(100, 9 + gradeIndex * 4.5);
                mergeAffinity(affinities, element, pct, 1 + Math.max(0, gradeIndex - 3) * 0.15);
                resistances[element] = combineBoundedPct(resistances[element] ?? 0, 3 + gradeIndex * 1.5, 75);
                grantedTags.push(`EquipmentElement:${element}`);
            }
            continue;
        }
        switch (traitId) {
            case 'trait.crit_focus':
                flatStats.critChancePct = (flatStats.critChancePct ?? 0) + 7 * traitScale;
                break;
            case 'trait.armor_break':
                flatStats.armorPenPct = combineStatPctV129('armorPenPct', flatStats.armorPenPct ?? 0, 4.5 * traitScale);
                break;
            case 'trait.iron_body':
                flatStats.damageReductionPct = combineStatPctV129('damageReductionPct', flatStats.damageReductionPct ?? 0, 2.5 * traitScale);
                break;
            case 'trait.spirit_flow':
                flatStats.spiritEfficiencyPct = combineStatPctV129('spiritEfficiencyPct', flatStats.spiritEfficiencyPct ?? 0, 3.5 * traitScale);
                break;
            case 'trait.heart_focus':
                flatStats.heartChancePct = combineStatPctV129('heartChancePct', flatStats.heartChancePct ?? 0, 4.5 * traitScale);
                break;
            case 'trait.swift_step':
                flatStats.actionSpeed = (flatStats.actionSpeed ?? 0) + 0.012 * traitScale;
                break;
            case 'trait.control_guard':
                flatStats.controlDurationReductionPct = combineStatPctV129('controlDurationReductionPct', flatStats.controlDurationReductionPct ?? 0, 4 * traitScale);
                break;
            case 'trait.blood_breath':
                flatStats.lifeStealPct = (flatStats.lifeStealPct ?? 0) + 1.8 * traitScale;
                break;
        }
    }
}
export function equipmentPower(state, sets) {
    const flatStats = {};
    const statMultipliers = {};
    const elementalAffinities = {};
    const elementalResistancesPct = {};
    const triggers = [];
    const grantedTags = [];
    const activeSets = [];
    const setCounts = new Map();
    const activeSetMechanics = activeEquipmentSetMechanicsV116(state);
    for (const item of equippedItems(state)) {
        addPartialStats(flatStats, effectiveEquipmentStats(item));
        if ((item.affixes?.length ?? 0) > 0) {
            const affixPower = equipmentAffixPowerV114(item, enhancementBonusPct(item.enhancementLevel ?? 0));
            addPartialStats(flatStats, affixPower.flatStats);
            for (const [element, value] of Object.entries(affixPower.elementalAffinities))
                mergeAffinity(elementalAffinities, element, value.pct, value.evolutionMultiplier);
            for (const [element, value] of Object.entries(affixPower.elementalResistancesPct))
                elementalResistancesPct[element] = combineBoundedPct(elementalResistancesPct[element] ?? 0, value, 75);
            grantedTags.push(...affixPower.grantedTags);
        }
        else {
            // Old saves without v1.14 affixes keep their deterministic legacy trait power until normalization hydrates affixes.
            addTraitPower(item, flatStats, statMultipliers, elementalAffinities, elementalResistancesPct, grantedTags);
        }
        const inscriptionPower = daoInscriptionPowerV128(item.daoInscription);
        if (inscriptionPower) {
            addPartialStats(flatStats, inscriptionPower.flatStats);
            addPartialStats(statMultipliers, inscriptionPower.statMultipliers);
            grantedTags.push(`DaoInscription:${inscriptionPower.id}`);
        }
        const countedGemElementsV129 = new Set();
        for (const gem of item.gemSockets ?? []) {
            if (!gem) continue;
            const gemPower = equipmentGemEffectV128(gem);
            if (!gemPower || countedGemElementsV129.has(gemPower.element)) continue;
            countedGemElementsV129.add(gemPower.element);
            addPartialStats(flatStats, gemPower.flatStats);
            addPartialStats(statMultipliers, gemPower.statMultipliers);
            grantedTags.push(`EquipmentGem:${gemPower.element}`);
        }
        if (item.setId)
            setCounts.set(item.setId, (setCounts.get(item.setId) ?? 0) + 1);
    }
    for (const [setId, pieces] of setCounts.entries()) {
        const set = sets.get(setId);
        if (!set)
            continue;
        if (isEquipmentSetV116(setId))
            continue;
        const activeBonuses = [];
        for (const bonus of [...set.bonuses].sort((a, b) => a.pieces - b.pieces)) {
            if (pieces < bonus.pieces)
                continue;
            activeBonuses.push(`${bonus.pieces} món: ${bonus.name}`);
            if (bonus.flatStats)
                addPartialStats(flatStats, bonus.flatStats);
            if (bonus.statMultipliers)
                addPartialStats(statMultipliers, bonus.statMultipliers);
            if (bonus.triggers)
                triggers.push(...bonus.triggers.map(trigger => ({ ...trigger, effects: trigger.effects.map(effect => ({ ...effect })) })));
            if (bonus.grantedTags)
                grantedTags.push(...bonus.grantedTags);
        }
        if (activeBonuses.length > 0)
            activeSets.push({ setId, setName: set.name, pieces, activeBonuses });
    }
    const v116Groups = new Map();
    for (const mechanic of activeSetMechanics) {
        const group = v116Groups.get(mechanic.setId) ?? [];
        group.push(mechanic);
        v116Groups.set(mechanic.setId, group);
    }
    for (const [setId, mechanics] of v116Groups) {
        const first = mechanics[0];
        activeSets.push({ setId, setName: first.setName, pieces: first.equippedPieces, activeBonuses: mechanics.map(m => `${m.pieces} món [${equipmentGrades[m.effectiveGrade].name}]: ${m.name} — ${m.summary}`) });
    }
    grantedTags.push(...equipmentSetMechanicTagsV116(activeSetMechanics));
    const v142SetPower = equipmentSetPowerV142(state);
    addPartialStats(flatStats, v142SetPower.flatStats);
    for (const [key, value] of Object.entries(v142SetPower.statMultipliers))
        statMultipliers[key] = (statMultipliers[key] ?? 0) + value;
    activeSets.push(...v142SetPower.activeSets);
    return { flatStats, statMultipliers, elementalAffinities, elementalResistancesPct, activeSets, activeSetMechanics, triggers, grantedTags: [...new Set(grantedTags)] };
}
export function applyEquipmentToEntity(base, state, sets) {
    const power = equipmentPower(state, sets);
    const stats = cloneStats(base.stats);
    for (const key of Object.keys(stats)) {
        if (typeof stats[key] !== 'number')
            continue;
        const flat = power.flatStats[key] ?? 0;
        const multiplier = power.statMultipliers[key] ?? 0;
        if (boundedStatCapV129(key) !== undefined) {
            stats[key] = combineStatPctV129(key, stats[key] ?? 0, flat);
            continue;
        }
        stats[key] = Math.max(0, ((stats[key] ?? 0) + flat) * (1 + multiplier));
    }
    // Optional numeric stats absent on the base entity still need to be materialized from equipment.
    for (const [key, flat] of Object.entries(power.flatStats)) {
        if (flat === undefined || typeof flat !== 'number' || typeof stats[key] === 'number')
            continue;
        const multiplier = power.statMultipliers[key] ?? 0;
        stats[key] = boundedStatCapV129(key) !== undefined
            ? combineStatPctV129(key, 0, flat)
            : Math.max(0, flat * (1 + multiplier));
    }
    const affinities = { ...(stats.elementalAffinities ?? {}) };
    for (const [element, value] of Object.entries(power.elementalAffinities)) {
        const current = affinities[element] ?? { pct: 0, evolutionMultiplier: 1 };
        affinities[element] = { pct: current.pct + value.pct, evolutionMultiplier: Math.max(current.evolutionMultiplier, value.evolutionMultiplier) };
    }
    const resistances = { ...(stats.elementalResistancesPct ?? {}) };
    for (const [element, value] of Object.entries(power.elementalResistancesPct))
        resistances[element] = combineBoundedPct(resistances[element] ?? 0, value, 75);
    stats.elementalAffinities = affinities;
    stats.elementalResistancesPct = resistances;
    const activeBuildMechanics = [...(base.combatBuildV117?.activeSetMechanics ?? []), ...power.activeSetMechanics];
    return {
        ...base,
        tags: [...new Set([...base.tags, ...power.grantedTags])],
        stats,
        triggers: [...(base.triggers ?? []), ...power.triggers],
        combatBuildV117: { ...(base.combatBuildV117 ?? {}), activeSetMechanics: activeBuildMechanics },
    };
}
/** Normalize pre-v0.98 equipment in-place. Safe to call for every restored save. */
export function normalizeEquipmentStateV98(state, templates) {
    const nextEquipped = {};
    for (const item of state.items) {
        item.grade = item.grade ?? inferLegacyEquipmentGrade(item.tier);
        item.enhancementLevel = clampEnhancement(item.enhancementLevel ?? 0);
        item.reforgeCount = Math.max(0, Math.floor(item.reforgeCount ?? 0));
        const template = templates.get(item.templateId);
        if (!item.traitIds || item.traitIds.length === 0)
            item.traitIds = template ? rollEquipmentTraits(template, item.grade, item.source.seed) : [];
        item.slot = canonicalEquipmentSlot(item.slot, item.source.seed);
        if (!item.affixes || item.affixes.length === 0) {
            const canonicalTemplate = template ? { ...template, slot: item.slot } : undefined;
            item.affixes = canonicalTemplate ? rollEquipmentAffixesV114(canonicalTemplate, item.grade, item.source.seed, item.traitIds ?? [], item.setId?.startsWith('set.v116.') ? EQUIPMENT_SET_MAX_BUILD_AFFIXES_V116 : undefined) : [];
        }
        if ((item.affixes?.length ?? 0) > 0) {
            const expected = equipmentAffixCountV114(item.grade);
            if (item.affixes.length !== expected && template)
                item.affixes = rollEquipmentAffixesV114({ ...template, slot: item.slot }, item.grade, item.source.seed, item.traitIds ?? [], item.setId?.startsWith('set.v116.') ? EQUIPMENT_SET_MAX_BUILD_AFFIXES_V116 : undefined);
            validateEquipmentAffixesV114(item.affixes, item.daoInscription, item.setId?.startsWith('set.v116.') ? EQUIPMENT_SET_MAX_BUILD_AFFIXES_V116 : undefined);
        }
        // alpha.23.10: Bản Đạo/Hybrid/Universal Set identities are retired from equipment.
        // Existing pieces remain perfectly usable ordinary gear with all stats/affixes/enhancement intact.
        if (item.setId && RETIRED_EQUIPMENT_SET_IDS_V12310.has(item.setId))
            item.setId = undefined;
    }
    for (const id of Object.values(state.equipped)) {
        if (!id)
            continue;
        const item = state.items.find(candidate => candidate.id === id);
        if (!item)
            continue;
        nextEquipped[item.slot] = item.id;
    }
    state.equipped = nextEquipped;
    state.unlockedSetIds = [...new Set([...(state.unlockedSetIds ?? []).filter(id => isLiveEquipmentSetV12310(id)), ...state.items.map(item => item.setId).filter((id) => Boolean(id && isLiveEquipmentSetV12310(id)))])];
    return state;
}
const traitNames = {
    'trait.crit_focus': 'Bạo Kích Hội Tụ',
    'trait.armor_break': 'Phá Giáp',
    'trait.iron_body': 'Hộ Thể',
    'trait.spirit_flow': 'Chân Nguyên Lưu Chuyển',
    'trait.heart_focus': 'Hội Tâm',
    'trait.swift_step': 'Tật Hành',
    'trait.control_guard': 'Định Thần',
    'trait.blood_breath': 'Huyết Tức',
};
export function equipmentTraitName(id) {
    if (id.startsWith('trait.element.'))
        return `Kích Hệ ${id.slice('trait.element.'.length).replace(/^./, x => x.toUpperCase())}`;
    return traitNames[id] ?? id;
}
/** v1.14 UI helper; ordinary affixes are canonical, legacy traits remain migration-only. */
export function equipmentAffixLinesV114(item) { return (item.affixes ?? []).map(formatEquipmentAffixV114); }
//# sourceMappingURL=equipment.js.map