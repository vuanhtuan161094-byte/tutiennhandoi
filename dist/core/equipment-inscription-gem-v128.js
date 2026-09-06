/** V128 authored Đạo Văn + Ngũ Hành Ngọc runtime. Standalone to avoid equipment/reforge import cycles. */
export const V128_DAO_INSCRIPTIONS = Object.freeze([
    { id: 'dao.v128.heavenly_craft', name: 'Thiên Công Văn', description: 'Công +1,5%.', effect: { statMultipliers: { attack: 0.015 } } },
    { id: 'dao.v128.long_life', name: 'Trường Sinh Văn', description: 'HP tối đa +2%.', effect: { statMultipliers: { maxHp: 0.02 } } },
    { id: 'dao.v128.mystic_armor', name: 'Huyền Giáp Văn', description: 'Phòng +1,5% · Giảm sát thương +0,3%.', effect: { statMultipliers: { defense: 0.015 }, flatStats: { damageReductionPct: 0.3 } } },
    { id: 'dao.v128.explosive', name: 'Bạo Liệt Văn', description: 'Bạo Kích +2% · Bạo Thương +4%.', effect: { flatStats: { critChancePct: 2, critDamagePct: 4 } } },
    { id: 'dao.v128.heart', name: 'Hội Tâm Văn', description: 'Hội Tâm +0,8% · Hội Tâm Thương +3%.', effect: { flatStats: { heartChancePct: 0.8, heartDamagePct: 3 } } },
    { id: 'dao.v128.army_breaker', name: 'Phá Quân Văn', description: 'Xuyên Phòng +1,2%.', effect: { flatStats: { armorPenPct: 1.2 } } },
    { id: 'dao.v128.steady_mind', name: 'Định Tâm Văn', description: 'Kháng Khống Chế +1,5%.', effect: { flatStats: { controlDurationReductionPct: 1.5 } } },
    { id: 'dao.v128.revival', name: 'Hồi Sinh Văn', description: 'Hút Sinh Mệnh +0,5% · Hồi phục nhận +1,5%.', effect: { flatStats: { lifeStealPct: 0.5, healingReceivedPct: 1.5 } } },
]);
const DAO_BY_ID = new Map(V128_DAO_INSCRIPTIONS.map(x => [x.id, x]));
export function daoInscriptionDefinitionV128(id) { return DAO_BY_ID.get(String(id ?? '').trim()); }
export function requireAuthoredDaoInscriptionV128(id) {
    const def = daoInscriptionDefinitionV128(id);
    if (!def)
        throw new Error(`Đạo Văn không hợp lệ. V128 chỉ cho phép 8 Đạo Văn authored: ${V128_DAO_INSCRIPTIONS.map(x => x.name).join(', ')}.`);
    return def;
}
export function daoInscriptionPowerV128(inscription) {
    const def = daoInscriptionDefinitionV128(inscription?.id);
    if (!def) return undefined; // preserve legacy payload but never execute unknown IDs.
    return { id: def.id, name: def.name, description: def.description, flatStats: { ...(def.effect.flatStats ?? {}) }, statMultipliers: { ...(def.effect.statMultipliers ?? {}) } };
}

export const EQUIPMENT_GEM_BLANK_RESOURCE_V128 = 'resource.five_element_gem_blank';
export const EQUIPMENT_GEM_BLANK_RESOURCE_NAME_V128 = 'Ngũ Hành Ngọc Phôi';
const SOCKETS_BY_GRADE = Object.freeze({ mundane: 0, spirit: 0, mystic: 1, earth: 1, heaven: 2, immortal: 3, extreme: 4, breaker: 4 });
export function equipmentGemSocketCountV128(itemOrGrade) {
    const grade = typeof itemOrGrade === 'string' ? itemOrGrade : (itemOrGrade?.grade ?? 'mundane');
    return SOCKETS_BY_GRADE[grade] ?? 0;
}
const GEM_UPGRADE_COST = Object.freeze([0, 1, 2, 4, 7, 11]); // incremental Ngọc Phôi cost for Lv1..5
const GEM_EFFECTS = Object.freeze({
    metal: [null, { armorPenPct: 0.3 }, { armorPenPct: 0.55 }, { armorPenPct: 0.8 }, { armorPenPct: 1.1 }, { armorPenPct: 1.5 }],
    wood: [null, { healingReceivedPct: 0.8, lifeStealPct: .1 }, { healingReceivedPct: 1.4, lifeStealPct: .2 }, { healingReceivedPct: 2, lifeStealPct: .3 }, { healingReceivedPct: 2.7, lifeStealPct: .45 }, { healingReceivedPct: 3.5, lifeStealPct: .6 }],
    water: [null, { shieldEffectPct: 1, damageReductionPct: .1 }, { shieldEffectPct: 1.8, damageReductionPct: .2 }, { shieldEffectPct: 2.6, damageReductionPct: .3 }, { shieldEffectPct: 3.5, damageReductionPct: .45 }, { shieldEffectPct: 4.5, damageReductionPct: .6 }],
    fire: [null, { critChancePct: .8, critDamagePct: 1.5 }, { critChancePct: 1.5, critDamagePct: 3 }, { critChancePct: 2.2, critDamagePct: 4.5 }, { critChancePct: 3.1, critDamagePct: 6.2 }, { critChancePct: 4, critDamagePct: 8 }],
    earth: [null, { hpPct: .8, defensePct: .6 }, { hpPct: 1.5, defensePct: 1.1 }, { hpPct: 2.2, defensePct: 1.7 }, { hpPct: 3.1, defensePct: 2.3 }, { hpPct: 4, defensePct: 3 }],
});
export const V128_EQUIPMENT_GEMS = Object.freeze([
    { id: 'metal', name: 'Kim Ngọc', identity: 'Kim · Xuyên', description: 'Tăng Xuyên Giáp.' },
    { id: 'wood', name: 'Mộc Ngọc', identity: 'Mộc · Hồi Phục', description: 'Tăng hồi phục nhận và Hút Sinh Mệnh.' },
    { id: 'water', name: 'Thủy Ngọc', identity: 'Thủy · Khiên', description: 'Tăng hiệu lực Khiên và Giảm Sát Thương.' },
    { id: 'fire', name: 'Hỏa Ngọc', identity: 'Hỏa · Bạo Kích', description: 'Tăng Bạo Kích và Bạo Thương.' },
    { id: 'earth', name: 'Thổ Ngọc', identity: 'Thổ · HP/Phòng', description: 'Tăng HP và Phòng theo tỷ lệ.' },
]);
const GEM_BY_ID = new Map(V128_EQUIPMENT_GEMS.map(x => [x.id, x]));
export function equipmentGemDefinitionV128(id) { return GEM_BY_ID.get(String(id ?? '').trim()); }
export function equipmentGemUpgradeCostV128(targetLevel) {
    const lv = Math.max(1, Math.min(5, Math.floor(Number(targetLevel) || 1)));
    return GEM_UPGRADE_COST[lv];
}
export function equipmentGemEffectV128(gem) {
    const def = equipmentGemDefinitionV128(gem?.element ?? gem?.id);
    if (!def) return undefined;
    const level = Math.max(1, Math.min(5, Math.floor(Number(gem?.level) || 1)));
    const raw = GEM_EFFECTS[def.id][level];
    const flatStats = { ...raw };
    const statMultipliers = {};
    if (def.id === 'earth') {
        statMultipliers.maxHp = (flatStats.hpPct ?? 0) / 100;
        statMultipliers.defense = (flatStats.defensePct ?? 0) / 100;
        delete flatStats.hpPct; delete flatStats.defensePct;
    }
    const detail = def.id === 'metal' ? `Xuyên Giáp +${raw.armorPenPct}%`
        : def.id === 'wood' ? `Hồi phục nhận +${raw.healingReceivedPct}% · Hút Sinh Mệnh +${raw.lifeStealPct}%`
        : def.id === 'water' ? `Khiên +${raw.shieldEffectPct}% · Giảm Sát Thương +${raw.damageReductionPct}%`
        : def.id === 'fire' ? `Bạo Kích +${raw.critChancePct}% · Bạo Thương +${raw.critDamagePct}%`
        : `HP +${raw.hpPct}% · Phòng +${raw.defensePct}%`;
    return { element: def.id, name: def.name, identity: def.identity, level, detail, flatStats, statMultipliers };
}
function requireSocketIndex(item, socketIndex) {
    const count = equipmentGemSocketCountV128(item);
    const index = Math.floor(Number(socketIndex));
    if (!Number.isInteger(index) || index < 0 || index >= count)
        throw new Error(`Ô Ngọc không hợp lệ: trang bị ${item.name ?? item.id} có ${count} ô.`);
    item.gemSockets = Array.from({ length: count }, (_, i) => item.gemSockets?.[i] ? { ...item.gemSockets[i] } : null);
    return index;
}
function spendBlanks(inventory, n) {
    const have = Math.max(0, Math.floor(inventory[EQUIPMENT_GEM_BLANK_RESOURCE_V128] ?? 0));
    if (have < n) throw new Error(`Thiếu ${EQUIPMENT_GEM_BLANK_RESOURCE_NAME_V128}: ${have}/${n}.`);
    inventory[EQUIPMENT_GEM_BLANK_RESOURCE_V128] = have - n;
}
export function socketEquipmentGemV128(item, socketIndex, element, inventory) {
    const index = requireSocketIndex(item, socketIndex);
    if (item.gemSockets[index]) throw new Error(`Ô Ngọc ${index + 1} đã có Ngọc; cần Tháo trước khi thay.`);
    const def = equipmentGemDefinitionV128(element);
    if (!def) throw new Error('Ngũ Hành Ngọc chỉ gồm Kim/Mộc/Thủy/Hỏa/Thổ.');
    if ((item.gemSockets ?? []).some((gem, i) => i !== index && gem?.element === def.id))
        throw new Error(`Mỗi trang bị chỉ được khảm 1 ${def.name}; hãy chọn Hành khác cho ô còn lại.`);
    const cost = equipmentGemUpgradeCostV128(1);
    spendBlanks(inventory, cost);
    const gem = { id: `gem.v128.${def.id}`, element: def.id, level: 1, spentBlanks: cost };
    item.gemSockets[index] = gem;
    return { itemId: item.id, socketIndex: index, gem: { ...gem }, effect: equipmentGemEffectV128(gem), spentBlanks: cost };
}
export function upgradeEquipmentGemV128(item, socketIndex, inventory) {
    const index = requireSocketIndex(item, socketIndex);
    const gem = item.gemSockets[index];
    if (!gem) throw new Error(`Ô Ngọc ${index + 1} đang trống.`);
    const level = Math.max(1, Math.min(5, Math.floor(Number(gem.level) || 1)));
    if (level >= 5) throw new Error('Ngọc đã đạt Lv5.');
    if (!equipmentGemDefinitionV128(gem.element)) throw new Error('Ngọc legacy/không xác định không thể nâng bằng V128.');
    const targetLevel = level + 1;
    const cost = equipmentGemUpgradeCostV128(targetLevel);
    spendBlanks(inventory, cost);
    gem.level = targetLevel;
    gem.spentBlanks = Math.max(0, Math.floor(gem.spentBlanks ?? 0)) + cost;
    return { itemId: item.id, socketIndex: index, gem: { ...gem }, effect: equipmentGemEffectV128(gem), spentBlanks: cost };
}
export function unsocketEquipmentGemV128(item, socketIndex, inventory) {
    const index = requireSocketIndex(item, socketIndex);
    const gem = item.gemSockets[index];
    if (!gem) throw new Error(`Ô Ngọc ${index + 1} đang trống.`);
    const refund = Math.max(1, Math.floor(gem.spentBlanks ?? 1));
    inventory[EQUIPMENT_GEM_BLANK_RESOURCE_V128] = Math.max(0, Math.floor(inventory[EQUIPMENT_GEM_BLANK_RESOURCE_V128] ?? 0)) + refund;
    item.gemSockets[index] = null;
    return { itemId: item.id, socketIndex: index, gem: { ...gem }, refundedBlanks: refund };
}
export function equipmentGemBlankSalvageYieldV128(item) {
    return equipmentGemSocketCountV128(item); // Huyền/Địa 1 · Thiên 2 · Tiên 3 · Cực/Phá 4; low grade 0.
}
export function equipmentDaoFragmentBaseYieldV128(item) {
    const rank = ['mundane','spirit','mystic','earth','heaven','immortal','extreme','breaker'].indexOf(item?.grade ?? 'mundane');
    return Math.max(1, rank + 1);
}
