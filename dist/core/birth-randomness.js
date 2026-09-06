import { originBundleEffects, rootElementAffinityPct } from './birth-origins-v101.js';
import { combineStatPctV129 } from './combat-rules.js';
export const birthRarityNames = { common: 'Phàm', uncommon: 'Lương', rare: 'Hiếm', epic: 'Sử Thi', legendary: 'Truyền Thuyết', mythic: 'Thần Thoại' };
export const birthFamilyDefinitions = [
    { name: 'Phàm tục gia đình', rarity: 'common', weight: 34, requiredSeal: 0, startingSpiritStones: 4, description: 'Khởi đầu nghèo nhưng không gánh nhân quả lớn.' },
    { name: 'Dược nông thế gia', rarity: 'uncommon', weight: 18, requiredSeal: 0, startingSpiritStones: 8, description: 'Có chút vốn và hiểu biết về dược liệu.' },
    { name: 'Tán tu hậu duệ', rarity: 'uncommon', weight: 18, requiredSeal: 0, startingSpiritStones: 9, description: 'Sớm tiếp xúc con đường tu hành.' },
    { name: 'Tiểu tu tiên gia tộc', rarity: 'rare', weight: 13, requiredSeal: 0, startingSpiritStones: 18, description: 'Có tài nguyên nhập môn tốt hơn.' },
    { name: 'Suy tàn thế gia', rarity: 'rare', weight: 9, requiredSeal: 0, startingSpiritStones: 12, description: 'Di sản còn sót lại nhưng vận nhà đã suy.' },
    { name: 'Thiếu chủ Linh tộc', rarity: 'epic', weight: 5, requiredSeal: 2, startingSpiritStones: 34, description: 'Khởi đầu giàu có và khí vận nổi bật.' },
    { name: 'Thánh tử thất lạc', rarity: 'legendary', weight: 2.2, requiredSeal: 4, startingSpiritStones: 52, description: 'Thân thế kinh người, dễ kéo theo đại nhân quả.' },
    { name: 'Hậu duệ Tiên Vương', rarity: 'mythic', weight: 0.8, requiredSeal: 7, startingSpiritStones: 88, description: 'Huyết thống gia thế cực hiếm, chỉ hiện trong Luân Hồi sâu.' },
];
export const birthTalentDefinitions = [
    { id: 'birth.talent.quick_meridian', name: 'Chu Thiên Thông Tuệ', rarity: 'common', description: 'Tu luyện nhanh hơn 6%.', weight: 20, requiredSeal: 0, cultivationMultiplier: 1.06 },
    { id: 'birth.talent.steady_foundation', name: 'Đạo Tâm Vững Chắc', rarity: 'uncommon', description: 'Tu luyện +8%, chiến đấu +3%.', weight: 16, requiredSeal: 0, cultivationMultiplier: 1.08, combatMultiplier: 1.03 },
    { id: 'birth.talent.sword_heart', name: 'Trời Sinh Kiếm Tâm', rarity: 'rare', description: 'Chiến lực hiệu dụng +10%.', weight: 11, requiredSeal: 0, combatMultiplier: 1.10 },
    { id: 'birth.talent.fortune_child', name: 'Thiên Mệnh Chiếu Cố', rarity: 'rare', description: 'Cơ duyên +10 và chiến lợi phẩm +12%.', weight: 10, requiredSeal: 0, lootMultiplier: 1.12, luckFlat: 10 },
    { id: 'birth.talent.battle_maniac', name: 'Bách Chiến Cuồng Tâm', rarity: 'epic', description: 'Chiến lực +18%, nhưng tu luyện chậm 4%.', weight: 6, requiredSeal: 2, combatMultiplier: 1.18, cultivationMultiplier: 0.96 },
    { id: 'birth.talent.dao_comprehension', name: 'Ngộ Tính Kinh Người', rarity: 'epic', description: 'Tu luyện +20%.', weight: 5.5, requiredSeal: 2, cultivationMultiplier: 1.20 },
    { id: 'birth.talent.treasure_affinity', name: 'Vạn Bảo Hữu Duyên', rarity: 'epic', description: 'Chiến lợi phẩm +24%.', weight: 4.5, requiredSeal: 3, lootMultiplier: 1.24 },
    { id: 'birth.talent.heaven_jealous', name: 'Thiên Đố Chi Tài', rarity: 'legendary', description: 'Tu luyện +34%, chiến lực +12%.', weight: 2.4, requiredSeal: 4, cultivationMultiplier: 1.34, combatMultiplier: 1.12 },
    { id: 'birth.talent.fate_breaker', name: 'Nghịch Mệnh Giả', rarity: 'legendary', description: 'Chiến lực +24%, cơ duyên +14.', weight: 1.8, requiredSeal: 5, combatMultiplier: 1.24, luckFlat: 14 },
    { id: 'birth.talent.chaos_seed', name: 'Hỗn Độn Đạo Chủng Bẩm Sinh', rarity: 'mythic', description: 'Tu luyện +45%, chiến lực +30%, loot +15%.', weight: 0.55, requiredSeal: 7, cultivationMultiplier: 1.45, combatMultiplier: 1.30, lootMultiplier: 1.15 },
];
export const divineAbilityDefinitions = [
    { id: 'birth.divine.immortal_breath', name: 'Tiên Thiên Nhất Khí', rarity: 'epic', description: 'Thần thông bẩm sinh: tu luyện +25%.', weight: 8, requiredSeal: 1, cultivationMultiplier: 1.25 },
    { id: 'birth.divine.war_god', name: 'Chiến Thần Ý', rarity: 'epic', description: 'Thần thông bẩm sinh: chiến lực +25%.', weight: 8, requiredSeal: 1, combatMultiplier: 1.25 },
    { id: 'birth.divine.devour_heaven', name: 'Thôn Thiên', rarity: 'legendary', description: 'Thần thông bẩm sinh: chiến lực +20%, loot +25%.', weight: 3.8, requiredSeal: 3, combatMultiplier: 1.20, lootMultiplier: 1.25 },
    { id: 'birth.divine.reincarnation_eye', name: 'Luân Hồi Nhãn', rarity: 'legendary', description: 'Thần thông bẩm sinh: cơ duyên +25, loot +18%.', weight: 3.2, requiredSeal: 4, luckFlat: 25, lootMultiplier: 1.18 },
    { id: 'birth.divine.three_pure', name: 'Nhất Khí Hóa Tam Thanh', rarity: 'mythic', description: 'Thần thông Thái Cổ: chiến lực +38%, tu luyện +16%.', weight: 0.8, requiredSeal: 7, combatMultiplier: 1.38, cultivationMultiplier: 1.16 },
    { id: 'birth.divine.primordial_body', name: 'Thái Sơ Thần Thể', rarity: 'mythic', description: 'Thần thông Thái Cổ: chiến lực +48%.', weight: 0.65, requiredSeal: 8, combatMultiplier: 1.48 },
];
function weighted(rng, pool) {
    const total = pool.reduce((s, x) => s + Math.max(0, x.weight), 0);
    let roll = rng.next() * total;
    for (const item of pool) {
        roll -= Math.max(0, item.weight);
        if (roll <= 0)
            return item;
    }
    return pool[pool.length - 1];
}
export function rollBirthFamily(rng, sealLevel = 0) {
    return weighted(rng, birthFamilyDefinitions.filter(x => x.requiredSeal <= sealLevel));
}
export function birthFamily(name) { return birthFamilyDefinitions.find(x => x.name === name); }
export function rollBirthTraits(rng, sealLevel = 0) {
    const eligible = birthTalentDefinitions.filter(x => x.requiredSeal <= sealLevel);
    const count = 1 + (rng.chance(Math.min(58, 14 + sealLevel * 5)) ? 1 : 0) + (sealLevel >= 5 && rng.chance(Math.min(35, sealLevel * 3)) ? 1 : 0);
    const picked = [];
    for (let i = 0; i < count && picked.length < eligible.length; i++) {
        const pool = eligible.filter(x => !picked.some(y => y.id === x.id));
        const item = weighted(rng, pool);
        picked.push(item);
    }
    const divineChance = Math.min(14, 0.8 + sealLevel * 1.05);
    const divinePool = divineAbilityDefinitions.filter(x => x.requiredSeal <= sealLevel);
    const divine = divinePool.length && rng.chance(divineChance) ? weighted(rng, divinePool) : undefined;
    return { talents: picked.map(({ id, name, rarity, description }) => ({ id, name, rarity, description })), divineAbility: divine ? { id: divine.id, name: divine.name, rarity: divine.rarity, description: divine.description } : undefined };
}
export function birthTraitModifiers(value) {
    const ids = [...(value.birthTalents ?? []).map(x => x.id), ...(value.divineAbility ? [value.divineAbility.id] : [])];
    let cultivationMultiplier = 1, combatMultiplier = 1, lootMultiplier = 1, luckFlat = 0;
    for (const id of ids) {
        const def = birthTalentDefinitions.find(x => x.id === id) ?? divineAbilityDefinitions.find(x => x.id === id);
        if (!def)
            continue;
        cultivationMultiplier *= def.cultivationMultiplier ?? 1;
        combatMultiplier *= def.combatMultiplier ?? 1;
        lootMultiplier *= def.lootMultiplier ?? 1;
        luckFlat += def.luckFlat ?? 0;
    }
    return { cultivationMultiplier, combatMultiplier, lootMultiplier, luckFlat };
}
export function writeBirthModifiersToOrigins(origins, value) {
    const modern = originBundleEffects(value.originsV101);
    const legacy = value.originsV101 ? { cultivationMultiplier: 1, combatMultiplier: 1, lootMultiplier: 1, luckFlat: 0 } : birthTraitModifiers(value);
    origins['birth.v101.authoritative'] = value.originsV101 ? 1 : 0;
    origins['birth.cultivation.multiplier'] = Math.max(0.25, legacy.cultivationMultiplier * (1 + (modern.cultivationPct ?? 0) / 100));
    origins['birth.combat.multiplier'] = Math.max(0.4, legacy.combatMultiplier * (1 + (modern.combatPct ?? 0) / 100));
    origins['birth.loot.multiplier'] = Math.max(0.5, legacy.lootMultiplier * (1 + (modern.lootPct ?? 0) / 100));
    origins['birth.luck.flat'] = legacy.luckFlat + (modern.luckFlat ?? 0);
    origins['birth.hp.pct'] = modern.maxHpPct ?? 0;
    origins['birth.attack.pct'] = modern.attackPct ?? 0;
    origins['birth.defense.pct'] = modern.defensePct ?? 0;
    origins['birth.spirit.pct'] = modern.maxSpiritPct ?? 0;
    origins['birth.speed.pct'] = modern.actionSpeedPct ?? 0;
    origins['birth.dodge.flat_pct'] = modern.dodgeFlatPct ?? 0;
    origins['birth.crit.flat_pct'] = modern.critChanceFlatPct ?? 0;
    origins['birth.crit_damage.pct'] = modern.critDamagePct ?? 0;
    origins['birth.armor_pen.pct'] = modern.armorPenPct ?? 0;
    origins['birth.dr.pct'] = modern.damageReductionPct ?? 0;
    origins['birth.healing.pct'] = modern.healingPct ?? 0;
    origins['birth.control_reduction.pct'] = modern.controlReductionPct ?? 0;
    origins['birth.spirit_efficiency.pct'] = modern.spiritEfficiencyPct ?? 0;
    // Clear mutable identity markers before writing the current-life authoritative origin identities.
    for (const key of Object.keys(origins))
        if (key.startsWith('birth.identity.'))
            delete origins[key];
    if (value.originsV101) {
        for (const [element, pct] of Object.entries(rootElementAffinityPct(value.originsV101.spiritualRoot)))
            origins[`birth.element.${element}.pct`] = pct ?? 0;
        origins[`birth.identity.bloodline.${value.originsV101.bloodline.id}`] = 1;
        origins['birth.identity.bloodline.grade'] = ['Phàm', 'Linh', 'Huyền', 'Địa', 'Thiên', 'Tiên', 'Cực', 'Phá'].indexOf(value.originsV101.bloodline.grade);
        origins[`birth.identity.physique.${value.originsV101.physique.id}`] = 1;
        origins['birth.identity.physique.stage'] = ['Phàm Thể', 'Sơ Tỉnh', 'Nhập Môn', 'Tiểu Thành', 'Đại Thành', 'Viên Mãn'].indexOf(value.originsV101.physique.stage);
    }
}
export function birthCultivationMultiplierFromOrigins(origins) { return Math.max(0.25, Math.min(8, origins?.['birth.cultivation.multiplier'] ?? 1)); }
export function birthLootMultiplierFromOrigins(origins) { return Math.max(0.5, Math.min(8, origins?.['birth.loot.multiplier'] ?? 1)); }
export function birthLuckFlatFromOrigins(origins) { return Math.max(-100, Math.min(250, origins?.['birth.luck.flat'] ?? 0)); }
export function birthCombatMultiplierFromOrigins(origins) { return Math.max(0.4, Math.min(12, origins?.['birth.combat.multiplier'] ?? 1)); }
function modernOriginCombatTraits(origins) {
    if (!origins?.['birth.v101.authoritative'])
        return { tags: [], triggers: [] };
    const tags = [];
    const triggers = [];
    const has = (id) => Boolean(origins[`birth.identity.bloodline.${id}`] || origins[`birth.identity.physique.${id}`]);
    const grade = Math.max(0, Math.floor(origins['birth.identity.bloodline.grade'] ?? 0));
    const stage = Math.max(0, Math.floor(origins['birth.identity.physique.stage'] ?? 0));
    const gf = [.25, .30, .38, .47, .58, .70, .84, 1][Math.min(7, grade)];
    const sf = [0, .27, .45, .65, .82, 1][Math.min(5, stage)];
    const add = (t) => triggers.push(t);
    if (has('bloodline.v101.white_tiger'))
        add({ id: '[Huyết Mạch · Bạch Hổ] Sát Phạt', event: 'OnCrit', chancePct: 35, sourceTags: ['ActiveHit'], cooldown: 1.2, effects: [{ type: 'damage', coefficient: .16 + .20 * gf, sourceTag: 'ProcHit', canCrit: false, canDodge: true, stabilityDamage: 5 }] });
    if (has('bloodline.v101.black_tortoise'))
        add({ id: '[Huyết Mạch · Huyền Vũ] Huyền Giáp', event: 'OnDamageTaken', chancePct: 24, cooldown: 10, effects: [{ type: 'shield', capacity: 0, stability: 100, duration: 7, maxHpPct: 3 + 5 * gf }] });
    if (has('bloodline.v101.kunpeng'))
        add({ id: '[Huyết Mạch · Côn Bằng] Bằng Dực', event: 'OnDodge', chancePct: 100, cooldown: 4, effects: [{ type: 'restoreSpirit', flat: 4 + Math.round(6 * gf) }] });
    if (has('bloodline.v101.true_dragon'))
        add({ id: '[Huyết Mạch · Chân Long] Long Nguyên', event: 'OnHit', chancePct: 20, sourceTags: ['ActiveHit'], cooldown: 3, effects: [{ type: 'restoreSpirit', flat: 3 + Math.round(5 * gf) }] });
    if (has('bloodline.v101.phoenix'))
        add({ id: '[Huyết Mạch · Phượng Hoàng] Phượng Tức', event: 'OnDamageTaken', chancePct: 22, cooldown: 12, effects: [{ type: 'heal', maxHpPct: 2 + 4 * gf, target: 'self' }] });
    if (has('bloodline.v101.qilin'))
        add({ id: '[Huyết Mạch · Kỳ Lân] Linh Hộ', event: 'OnDamageTaken', chancePct: 18, cooldown: 12, effects: [{ type: 'shield', capacity: 0, stability: 90, duration: 6, maxHpPct: 2 + 4 * gf }] });
    if (has('bloodline.v101.golden_crow'))
        add({ id: '[Huyết Mạch · Kim Ô] Nhật Tức', event: 'OnHit', chancePct: 25, sourceTags: ['ActiveHit'], cooldown: 4, effects: [{ type: 'restoreSpirit', flat: 5 + Math.round(7 * gf) }] });
    if (has('bloodline.v101.nine_tailed_fox'))
        add({ id: '[Huyết Mạch · Cửu Vĩ Thiên Hồ] Hồ Ảnh', event: 'OnDodge', chancePct: 100, cooldown: 5, effects: [{ type: 'restoreSpirit', flat: 5 + Math.round(5 * gf) }] });
    if (has('bloodline.v101.ancestral_dragon'))
        add({ id: '[Huyết Mạch · Tổ Long] Vạn Long Quy Nguyên', event: 'OnHit', chancePct: 22, sourceTags: ['ActiveHit'], cooldown: 2.5, effects: [{ type: 'damage', coefficient: .20 + .30 * gf, sourceTag: 'ProcHit', canCrit: false, canDodge: true, stabilityDamage: 8 }] });
    if (has('bloodline.v101.primordial_phoenix'))
        add({ id: '[Huyết Mạch · Nguyên Phượng] Nguyên Hỏa Sinh Cơ', event: 'OnDamageTaken', chancePct: 30, cooldown: 9, effects: [{ type: 'heal', maxHpPct: 4 + 6 * gf, target: 'self' }] });
    if (has('bloodline.v101.chaos_godfiend'))
        add({ id: '[Huyết Mạch · Hỗn Độn Thần Ma] Hỗn Độn Hộ Thể', event: 'OnBattleStart', chancePct: 100, effects: [{ type: 'shield', capacity: 0, stability: 120, duration: 10, maxHpPct: 5 + 5 * gf }] });
    if (has('bloodline.v101.primordial_dao'))
        add({ id: '[Huyết Mạch · Hồng Mông Đạo Huyết] Nhất Khí', event: 'OnHit', chancePct: 26, sourceTags: ['ActiveHit'], cooldown: 3, effects: [{ type: 'restoreSpirit', flat: 8 + Math.round(8 * gf) }] });
    if (has('bloodline.v101.tribulation_undying'))
        add({ id: '[Huyết Mạch · Vạn Kiếp Bất Diệt] Kiếp Thân', event: 'OnDamageTaken', chancePct: 28, cooldown: 10, effects: [{ type: 'shield', capacity: 0, stability: 140, duration: 7, maxHpPct: 5 + 7 * gf }] });
    if (has('bloodline.v101.primordial_wargod'))
        add({ id: '[Huyết Mạch · Thái Sơ Sát Thần] Sát Thần', event: 'OnCrit', chancePct: 45, sourceTags: ['ActiveHit'], cooldown: 1.5, effects: [{ type: 'damage', coefficient: .25 + .35 * gf, sourceTag: 'ProcHit', canCrit: false, canDodge: true, stabilityDamage: 10 }] });
    if (has('physique.devour_heaven'))
        add({ id: '[Thể Chất · Thôn Thiên Ma Thể] Thôn Phệ', event: 'OnHit', chancePct: 18, sourceTags: ['ActiveHit'], cooldown: 3, effects: [{ type: 'drain', coefficient: .10 + .12 * sf, healRatio: .55, canCrit: false, canDodge: true, procCoefficient: .5 }] });
    if (has('physique.indestructible_gold'))
        add({ id: '[Thể Chất · Bất Diệt Kim Thân] Kim Thân', event: 'OnDamageTaken', chancePct: 16, cooldown: 12, effects: [{ type: 'shield', capacity: 0, stability: 100, duration: 6, maxHpPct: 2 + 5 * sf }] });
    if (has('physique.taixu'))
        add({ id: '[Thể Chất · Thái Hư Linh Thể] Linh Hải', event: 'OnHit', chancePct: 18, sourceTags: ['ActiveHit'], cooldown: 4, effects: [{ type: 'restoreSpirit', flat: 4 + Math.round(7 * sf) }] });
    if (has('physique.chaos_infinite'))
        add({ id: '[Thể Chất · Hỗn Độn Vô Cực] Hỗn Độn Tự Diễn', event: 'OnBattleStart', chancePct: 100, effects: [{ type: 'shield', capacity: 0, stability: 140, duration: 12, maxHpPct: 4 + 6 * sf }] });
    if (has('physique.devour_dao'))
        add({ id: '[Thể Chất · Thôn Thiên Phệ Đạo] Phệ Đạo', event: 'OnHit', chancePct: 24, sourceTags: ['ActiveHit'], cooldown: 2.5, effects: [{ type: 'drain', coefficient: .14 + .18 * sf, healRatio: .6, canCrit: false, canDodge: true, procCoefficient: .5 }] });
    if (grade >= 7 && has('bloodline.v101.phoenix'))
        tags.push('BirthTrait:PhoenixNirvana25');
    if (grade >= 7 && has('bloodline.v101.primordial_phoenix'))
        tags.push('BirthTrait:PrimordialPhoenixNirvana40');
    if (grade >= 7 && has('bloodline.v101.tribulation_undying'))
        tags.push('BirthTrait:UndyingBloodLastStand');
    if (stage >= 5 && has('physique.reincarnation_undying'))
        tags.push('BirthTrait:ReincarnationBodyLastStand');
    return { tags, triggers };
}
export function applyBirthCombatOrigins(entity, origins) {
    const multiplier = birthCombatMultiplierFromOrigins(origins);
    const stats = { ...entity.stats };
    const pct = (key, min = -90, max = 300) => Math.max(min, Math.min(max, origins?.[key] ?? 0));
    stats.maxHp *= multiplier * (1 + pct('birth.hp.pct') / 100);
    stats.attack *= multiplier * (1 + pct('birth.attack.pct') / 100);
    stats.defense *= multiplier * (1 + pct('birth.defense.pct') / 100);
    stats.maxSpirit *= Math.sqrt(multiplier) * (1 + pct('birth.spirit.pct') / 100);
    stats.accuracy *= Math.sqrt(multiplier);
    stats.mobility *= Math.sqrt(multiplier);
    stats.actionSpeed = Math.max(0.25, (stats.actionSpeed ?? 1) * (1 + pct('birth.speed.pct', -75, 200) / 100));
    stats.dodgeChancePct = combineStatPctV129('dodgeChancePct', stats.dodgeChancePct ?? 0, pct('birth.dodge.flat_pct', -20, 20));
    stats.critChancePct = (stats.critChancePct ?? 0) + pct('birth.crit.flat_pct', -20, 35);
    stats.critDamagePct = (stats.critDamagePct ?? ((stats.critPowerPerLayer ?? 0.5) + 1) * 100) + pct('birth.crit_damage.pct', -50, 100);
    stats.armorPenPct = combineStatPctV129('armorPenPct', stats.armorPenPct ?? 0, pct('birth.armor_pen.pct', -20, 25));
    stats.damageReductionPct = combineStatPctV129('damageReductionPct', stats.damageReductionPct ?? 0, pct('birth.dr.pct', -20, 15));
    stats.healingEffectivenessPct = (stats.healingEffectivenessPct ?? 0) + pct('birth.healing.pct', -50, 80);
    stats.controlDurationReductionPct = combineStatPctV129('controlDurationReductionPct', stats.controlDurationReductionPct ?? 0, pct('birth.control_reduction.pct', -50, 35));
    stats.spiritEfficiencyPct = combineStatPctV129('spiritEfficiencyPct', stats.spiritEfficiencyPct ?? 0, pct('birth.spirit_efficiency.pct', -50, 50));
    const affinities = { ...(stats.elementalAffinities ?? {}) };
    for (const element of ['Metal', 'Wood', 'Water', 'Fire', 'Earth']) {
        const v = origins?.[`birth.element.${element}.pct`] ?? 0;
        if (v > 0) {
            const prev = affinities[element];
            affinities[element] = { pct: Math.min(100, (prev?.pct ?? 0) + v), evolutionMultiplier: Math.max(1, prev?.evolutionMultiplier ?? 1) };
        }
    }
    stats.elementalAffinities = affinities;
    const traits = modernOriginCombatTraits(origins);
    const changed = Math.abs(multiplier - 1) > 1e-9 || Object.keys(origins ?? {}).some(k => k.startsWith('birth.'));
    return changed ? { ...entity, stats, tags: [...new Set([...entity.tags, 'BirthOriginV101', ...traits.tags])], triggers: [...(entity.triggers ?? []), ...traits.triggers] } : entity;
}
//# sourceMappingURL=birth-randomness.js.map