export const EQUIPMENT_AFFIX_COUNTS_V114 = {
    mundane: 3, spirit: 3, mystic: 4, earth: 4, heaven: 5, immortal: 5, extreme: 6, breaker: 6,
};
export const EQUIPMENT_MAX_BUILD_AFFIXES_V114 = 3;
export const EQUIPMENT_MAX_ROOT_ORIGIN_AFFIXES_V114 = 1;
export const EQUIPMENT_MAX_DAO_INSCRIPTIONS_V114 = 1;
export const EQUIPMENT_AFFIX_MIN_ROLL_PCT_V114 = 80;
export const EQUIPMENT_AFFIX_MAX_ROLL_PCT_V114 = 100;
const SLOT_BIAS_WEIGHT = 4;
const GRADE_AFFIX_SCALE = {
    mundane: 1,
    spirit: 1.18,
    mystic: 1.38,
    earth: 1.62,
    heaven: 1.90,
    immortal: 2.22,
    extreme: 2.58,
    breaker: 3.00,
};
const ALL_SLOTS = ['weapon', 'head', 'robe', 'belt', 'bracelet', 'gloves', 'boots', 'necklace', 'ring', 'talisman'];
const ATTACK_SLOTS = ['weapon', 'gloves', 'ring', 'head'];
const SURVIVAL_SLOTS = ['robe', 'belt', 'bracelet', 'talisman', 'head'];
const RESOURCE_SLOTS = ['head', 'belt', 'necklace', 'ring', 'talisman'];
const SPEED_SLOTS = ['boots', 'bracelet', 'gloves', 'ring'];
const ELEMENT_SLOTS = ['weapon', 'head', 'gloves', 'necklace', 'ring', 'talisman'];
const FIVE_ELEMENTS = ['Metal', 'Wood', 'Water', 'Fire', 'Earth'];
function elementAffix(element, name) {
    return {
        id: `affix.element.${element.toLowerCase()}.affinity`, name: `${name} Hành`, family: 'element', exclusiveGroup: `element.${element}.affinity`,
        effect: { kind: 'elementAffinityPct', element }, live: true, buildAffix: true, biasSlots: ELEMENT_SLOTS, commonAllowed: true,
        baseTarget: 7.5, enhancementScales: false,
    };
}
/**
 * Only effects that already change live combat are in this pool.
 * Dao/Căn Nguyên/Skill/Mechanic definitions are intentionally withheld until a concrete runtime hook exists.
 */
export const EQUIPMENT_AFFIX_DEFINITIONS_V114 = [
    { id: 'affix.core.attack', name: 'Công Lực', family: 'core', exclusiveGroup: 'core.attack', effect: { kind: 'localBaseStatPct', stat: 'attack' }, live: true, buildAffix: false, biasSlots: ATTACK_SLOTS, commonAllowed: true, baseTarget: 8, enhancementScales: true },
    { id: 'affix.core.hp', name: 'Thể Phách · Sinh Mệnh', family: 'core', exclusiveGroup: 'core.hp', effect: { kind: 'localBaseStatPct', stat: 'maxHp' }, live: true, buildAffix: false, biasSlots: SURVIVAL_SLOTS, commonAllowed: true, baseTarget: 8, enhancementScales: true },
    { id: 'affix.core.defense', name: 'Phòng Ngự', family: 'core', exclusiveGroup: 'core.defense', effect: { kind: 'localBaseStatPct', stat: 'defense' }, live: true, buildAffix: false, biasSlots: SURVIVAL_SLOTS, commonAllowed: true, baseTarget: 8, enhancementScales: true },
    { id: 'affix.combat.crit', name: 'Bạo Kích', family: 'combat', exclusiveGroup: 'combat.crit', effect: { kind: 'flatStat', stat: 'critChancePct' }, live: true, buildAffix: false, biasSlots: ATTACK_SLOTS, allowedSlots: ATTACK_SLOTS, commonAllowed: false, baseTarget: 4.5, enhancementScales: false },
    { id: 'affix.combat.heart', name: 'Hội Tâm', family: 'combat', exclusiveGroup: 'combat.heart', effect: { kind: 'flatStat', stat: 'heartChancePct' }, live: true, buildAffix: false, biasSlots: ['head', 'necklace', 'ring', 'gloves'], allowedSlots: ['head', 'necklace', 'ring', 'gloves'], commonAllowed: false, baseTarget: 3.5, enhancementScales: false },
    { id: 'affix.combat.dodge', name: 'Né Tránh', family: 'combat', exclusiveGroup: 'combat.dodge', effect: { kind: 'flatStat', stat: 'dodgeChancePct' }, live: true, buildAffix: false, biasSlots: SPEED_SLOTS, allowedSlots: SPEED_SLOTS, commonAllowed: false, baseTarget: 4.5, enhancementScales: false, rollWeightMultiplier: 0.16 },
    { id: 'affix.combat.armor_pen', name: 'Xuyên Phòng', family: 'combat', exclusiveGroup: 'combat.armor_pen', effect: { kind: 'flatStat', stat: 'armorPenPct' }, live: true, buildAffix: false, biasSlots: ['weapon', 'gloves', 'ring'], allowedSlots: ['weapon', 'gloves', 'ring'], commonAllowed: false, baseTarget: 2.5, enhancementScales: false },
    { id: 'affix.combat.spirit_efficiency', name: 'Hiệu Suất Chân Nguyên', family: 'combat', exclusiveGroup: 'combat.spirit_efficiency', effect: { kind: 'flatStat', stat: 'spiritEfficiencyPct' }, live: true, buildAffix: false, biasSlots: RESOURCE_SLOTS, allowedSlots: RESOURCE_SLOTS, commonAllowed: false, baseTarget: 3, enhancementScales: false },
    { id: 'affix.combat.control_reduction', name: 'Giảm Thời Gian Khống Chế', family: 'combat', exclusiveGroup: 'combat.control_reduction', effect: { kind: 'flatStat', stat: 'controlDurationReductionPct' }, live: true, buildAffix: false, biasSlots: ['head', 'robe', 'talisman', 'necklace'], allowedSlots: ['head', 'robe', 'talisman', 'necklace'], commonAllowed: false, baseTarget: 4, enhancementScales: false },
    { id: 'affix.combat.life_steal', name: 'Hút Sinh Mệnh', family: 'combat', exclusiveGroup: 'combat.life_steal', effect: { kind: 'flatStat', stat: 'lifeStealPct' }, live: true, buildAffix: false, biasSlots: ['weapon', 'ring', 'bracelet'], allowedSlots: ['weapon', 'ring', 'bracelet'], commonAllowed: false, baseTarget: 1.25, enhancementScales: false },
    { id: 'affix.combat.action_speed', name: 'Tốc Độ Hành Động', family: 'combat', exclusiveGroup: 'combat.action_speed', effect: { kind: 'flatStat', stat: 'actionSpeed' }, live: true, buildAffix: false, biasSlots: SPEED_SLOTS, allowedSlots: SPEED_SLOTS, commonAllowed: false, baseTarget: 0.012, enhancementScales: false },
    { id: 'affix.combat.max_spirit', name: 'Chân Nguyên', family: 'combat', exclusiveGroup: 'combat.max_spirit', effect: { kind: 'localBaseStatPct', stat: 'maxSpirit' }, live: true, buildAffix: false, biasSlots: RESOURCE_SLOTS, allowedSlots: RESOURCE_SLOTS, commonAllowed: false, baseTarget: 8, enhancementScales: false },
    elementAffix('Metal', 'Kim'), elementAffix('Wood', 'Mộc'), elementAffix('Water', 'Thủy'), elementAffix('Fire', 'Hỏa'), elementAffix('Earth', 'Thổ'),
];
const AFFIX_BY_ID = new Map(EQUIPMENT_AFFIX_DEFINITIONS_V114.map(x => [x.id, x]));
export function equipmentAffixDefinitionV114(id) { return AFFIX_BY_ID.get(id); }
export function equipmentAffixNameV114(id) { return AFFIX_BY_ID.get(id)?.name ?? id; }
export function equipmentAffixCountV114(grade) { return EQUIPMENT_AFFIX_COUNTS_V114[grade]; }
export function isBuildAffixFamilyV114(family) { return family === 'element' || family === 'dao' || family === 'rootOrigin' || family === 'skill' || family === 'mechanic'; }
function hash01(seed, salt) {
    let x = ((seed >>> 0) ^ Math.imul((salt + 1) >>> 0, 0x9e3779b1)) >>> 0;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
}
function legalForSlot(def, slot) {
    if (def.allowedSlots?.includes(slot))
        return true;
    if (def.commonAllowed)
        return true;
    return !def.allowedSlots || def.allowedSlots.length === 0;
}
function definitionWeight(def, slot) {
    if (!def.live || !legalForSlot(def, slot))
        return 0;
    const slotWeight = def.biasSlots?.includes(slot) ? SLOT_BIAS_WEIGHT : 1;
    return slotWeight * Math.max(0, def.rollWeightMultiplier ?? 1);
}
function weightedPick(candidates, slot, seed, salt) {
    const weighted = candidates.map(def => ({ def, w: definitionWeight(def, slot) })).filter(x => x.w > 0);
    const total = weighted.reduce((sum, x) => sum + x.w, 0);
    if (total <= 0)
        return undefined;
    let r = hash01(seed, salt) * total;
    for (const entry of weighted) {
        r -= entry.w;
        if (r < 0)
            return entry.def;
    }
    return weighted[weighted.length - 1]?.def;
}
function rollFromDefinition(def, grade, seed, salt) {
    const rollPct = EQUIPMENT_AFFIX_MIN_ROLL_PCT_V114 + (EQUIPMENT_AFFIX_MAX_ROLL_PCT_V114 - EQUIPMENT_AFFIX_MIN_ROLL_PCT_V114) * hash01(seed, salt);
    const target = def.baseTarget * GRADE_AFFIX_SCALE[grade];
    const value = target * rollPct / 100;
    return { id: def.id, family: def.family, exclusiveGroup: def.exclusiveGroup, value: Math.round(value * 10000) / 10000, rollPct: Math.round(rollPct * 100) / 100, buildAffix: def.buildAffix, rootOriginId: def.rootOriginId };
}
function legacyTraitAffixId(traitId) {
    if (traitId.startsWith('trait.element.')) {
        const key = traitId.slice('trait.element.'.length);
        const element = FIVE_ELEMENTS.find(x => x.toLowerCase() === key);
        return element ? `affix.element.${element.toLowerCase()}.affinity` : undefined;
    }
    const map = {
        'trait.crit_focus': 'affix.combat.crit',
        'trait.armor_break': 'affix.combat.armor_pen',
        'trait.spirit_flow': 'affix.combat.spirit_efficiency',
        'trait.heart_focus': 'affix.combat.heart',
        'trait.swift_step': 'affix.combat.action_speed',
        'trait.control_guard': 'affix.combat.control_reduction',
        'trait.blood_breath': 'affix.combat.life_steal',
    };
    return map[traitId];
}
export function validateEquipmentAffixesV114(affixes, daoInscription, maxBuildAffixes = EQUIPMENT_MAX_BUILD_AFFIXES_V114) {
    const groups = new Set();
    let build = 0, roots = 0;
    for (const roll of affixes) {
        if (groups.has(roll.exclusiveGroup))
            throw new Error(`Duplicate equipment affix group: ${roll.exclusiveGroup}`);
        groups.add(roll.exclusiveGroup);
        if (roll.buildAffix)
            build++;
        if (roll.family === 'rootOrigin')
            roots++;
        if (roll.rollPct + 1e-9 < EQUIPMENT_AFFIX_MIN_ROLL_PCT_V114 || roll.rollPct - 1e-9 > EQUIPMENT_AFFIX_MAX_ROLL_PCT_V114)
            throw new Error(`Equipment affix roll must stay in 80..100: ${roll.id}`);
    }
    if (build > maxBuildAffixes)
        throw new Error(`Equipment has ${build} Build affixes; max is ${maxBuildAffixes}.`);
    if (roots > EQUIPMENT_MAX_ROOT_ORIGIN_AFFIXES_V114)
        throw new Error(`Equipment has ${roots} Căn Nguyên affixes; max is ${EQUIPMENT_MAX_ROOT_ORIGIN_AFFIXES_V114}.`);
    if (daoInscription && !daoInscription.id)
        throw new Error('Đạo Văn id cannot be empty.');
}
export function rollEquipmentAffixesV114(template, grade, seed, legacyTraitIds = [], maxBuildAffixes = EQUIPMENT_MAX_BUILD_AFFIXES_V114) {
    const slot = template.slot === 'accessory' ? ['necklace', 'ring', 'bracelet', 'talisman'][Math.abs(seed >>> 0) % 4] : template.slot;
    const count = equipmentAffixCountV114(grade);
    const result = [];
    const used = new Set();
    let buildCount = 0, rootCount = 0, salt = 140;
    // Preserve the semantic lane of legacy traits first, then fill to the new locked affix count.
    for (const traitId of legacyTraitIds) {
        if (result.length >= count)
            break;
        const affixId = legacyTraitAffixId(traitId);
        const def = affixId ? AFFIX_BY_ID.get(affixId) : undefined;
        if (!def || !def.live || used.has(def.exclusiveGroup) || !legalForSlot(def, slot))
            continue;
        if (def.buildAffix && buildCount >= maxBuildAffixes)
            continue;
        if (def.family === 'rootOrigin' && rootCount >= EQUIPMENT_MAX_ROOT_ORIGIN_AFFIXES_V114)
            continue;
        const roll = rollFromDefinition(def, grade, seed, salt++);
        result.push(roll);
        used.add(def.exclusiveGroup);
        if (def.buildAffix)
            buildCount++;
        if (def.family === 'rootOrigin')
            rootCount++;
    }
    while (result.length < count) {
        const candidates = EQUIPMENT_AFFIX_DEFINITIONS_V114.filter(def => {
            if (!def.live || used.has(def.exclusiveGroup) || !legalForSlot(def, slot))
                return false;
            if (def.buildAffix && buildCount >= maxBuildAffixes)
                return false;
            if (def.family === 'rootOrigin' && rootCount >= EQUIPMENT_MAX_ROOT_ORIGIN_AFFIXES_V114)
                return false;
            return true;
        });
        const picked = weightedPick(candidates, slot, seed, salt++);
        if (!picked)
            break;
        const roll = rollFromDefinition(picked, grade, seed, salt++);
        result.push(roll);
        used.add(picked.exclusiveGroup);
        if (picked.buildAffix)
            buildCount++;
        if (picked.family === 'rootOrigin')
            rootCount++;
    }
    validateEquipmentAffixesV114(result, undefined, maxBuildAffixes);
    return result;
}
function addStat(target, key, value) { target[key] = ((target[key] ?? 0) + value); }
export function equipmentAffixPowerV114(item, enhancementBonusPct) {
    const out = { flatStats: {}, elementalAffinities: {}, elementalResistancesPct: {}, grantedTags: [] };
    for (const roll of item.affixes ?? []) {
        const def = AFFIX_BY_ID.get(roll.id);
        if (!def || !def.live)
            continue;
        const enhance = def.enhancementScales ? 1 + Math.max(0, enhancementBonusPct) / 100 : 1;
        if (def.effect.kind === 'localBaseStatPct' && def.effect.stat) {
            const local = typeof item.stats[def.effect.stat] === 'number' ? item.stats[def.effect.stat] : 0;
            if (local !== 0)
                addStat(out.flatStats, def.effect.stat, local * roll.value / 100 * enhance);
        }
        else if (def.effect.kind === 'flatStat' && def.effect.stat) {
            addStat(out.flatStats, def.effect.stat, roll.value * enhance);
        }
        else if (def.effect.kind === 'elementAffinityPct' && def.effect.element) {
            const element = def.effect.element;
            const current = out.elementalAffinities[element] ?? { pct: 0, evolutionMultiplier: 1 };
            out.elementalAffinities[element] = { pct: current.pct + roll.value, evolutionMultiplier: current.evolutionMultiplier };
            out.grantedTags.push(`EquipmentElement:${element}`);
        }
        else if (def.effect.kind === 'elementResistancePct' && def.effect.element) {
            out.elementalResistancesPct[def.effect.element] = (out.elementalResistancesPct[def.effect.element] ?? 0) + roll.value;
        }
        else if (def.effect.kind === 'grantedTag' && def.effect.tag) {
            out.grantedTags.push(def.effect.tag);
        }
    }
    return out;
}
export function formatEquipmentAffixV114(roll) {
    const def = AFFIX_BY_ID.get(roll.id);
    if (!def)
        return `${roll.id} ${roll.value}`;
    const stat = def.effect.stat;
    if (def.effect.kind === 'localBaseStatPct')
        return `${def.name} +${roll.value.toFixed(1)}% nền món`;
    if (def.effect.kind === 'elementAffinityPct')
        return `${def.name} +${roll.value.toFixed(1)}%`;
    if (stat === 'actionSpeed')
        return `${def.name} +${(roll.value * 100).toFixed(1)}%`;
    if (def.effect.kind === 'flatStat')
        return `${def.name} +${roll.value.toFixed(1)}${stat && ['critChancePct', 'heartChancePct', 'dodgeChancePct', 'armorPenPct', 'spiritEfficiencyPct', 'controlDurationReductionPct', 'lifeStealPct'].includes(stat) ? '%' : ''}`;
    return `${def.name} +${roll.value.toFixed(1)}`;
}
/** Pure deterministic reforge primitive. Economy cost/rare-material identity deliberately stays outside until its source/sink is locked. */
export function reforgeEquipmentAffixV114(item, index, seed, options = {}) {
    const affixes = item.affixes ?? [];
    const old = affixes[index];
    if (!old)
        throw new Error('Không tìm thấy dòng affix cần Tái Luyện.');
    const family = options.targetFamily ?? old.family;
    if (family !== old.family && !options.familyChangeAuthorized)
        throw new Error('Đổi affix family cần vật liệu hiếm đã được economy layer xác nhận tiêu hao.');
    const slot = item.slot;
    const used = new Set(affixes.filter((_, i) => i !== index).map(x => x.exclusiveGroup));
    const buildCount = affixes.filter((x, i) => i !== index && x.buildAffix).length;
    const rootCount = affixes.filter((x, i) => i !== index && x.family === 'rootOrigin').length;
    const maxBuildAffixes = item.setId?.startsWith('set.v116.') ? 2 : EQUIPMENT_MAX_BUILD_AFFIXES_V114;
    let candidates = EQUIPMENT_AFFIX_DEFINITIONS_V114.filter(def => def.live && def.family === family && def.id !== old.id && !used.has(def.exclusiveGroup) && legalForSlot(def, slot) && (!def.buildAffix || buildCount < maxBuildAffixes) && (def.family !== 'rootOrigin' || rootCount < EQUIPMENT_MAX_ROOT_ORIGIN_AFFIXES_V114));
    // V129 slot lanes can make the current family fully occupied on this slot. In that case
    // Tái Luyện remains valid by rerolling the same authored affix instead of escaping its slot lane.
    if (!candidates.length) {
        candidates = EQUIPMENT_AFFIX_DEFINITIONS_V114.filter(def => def.live && def.family === family && def.id === old.id && legalForSlot(def, slot));
    }
    const picked = weightedPick(candidates, slot, seed, 911);
    if (!picked)
        throw new Error(`Không có affix ${family} hợp lệ cho ô ${slot}.`);
    const grade = item.grade ?? 'mundane';
    const next = rollFromDefinition(picked, grade, seed, 919);
    const copy = [...affixes];
    copy[index] = next;
    validateEquipmentAffixesV114(copy, item.daoInscription, maxBuildAffixes);
    item.affixes = copy;
    return next;
}
/**
 * Đạo Văn acquisition is hybrid by lock: RNG drop + deterministic path.
 * This function has no default chance: content must provide an explicit authored chance.
 */
export function rollDaoInscriptionDropV114(seed, chancePct, inscriptionId) {
    const chance = Math.max(0, Math.min(100, chancePct));
    return hash01(seed, 1201) * 100 < chance ? { id: inscriptionId, source: 'drop' } : undefined;
}
/** Deterministic crafting/targeting primitive; caller must already have paid the authored deterministic cost. */
export function forgeDaoInscriptionDeterministicV114(item, inscriptionId, costAuthorized) {
    if (!costAuthorized)
        throw new Error('Chưa thanh toán đường deterministic của Đạo Văn.');
    const inscription = { id: inscriptionId, source: 'deterministic' };
    item.daoInscription = inscription;
    return inscription;
}
export function slotBiasAuditV114(slot) { return EQUIPMENT_AFFIX_DEFINITIONS_V114.filter(x => x.live && legalForSlot(x, slot)).map(x => ({ id: x.id, weight: definitionWeight(x, slot) })); }
export const EQUIPMENT_AFFIX_LIVE_ELEMENTS_V114 = FIVE_ELEMENTS;
export const EQUIPMENT_AFFIX_ALL_CANONICAL_SLOTS_V114 = ALL_SLOTS;
//# sourceMappingURL=equipment-affix-v114.js.map