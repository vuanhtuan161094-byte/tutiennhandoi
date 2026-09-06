const FIVE_ELEMENTS = ['Metal', 'Wood', 'Water', 'Fire', 'Earth'];
const ROOT_GRADE_BONUS = {
    'Phàm': { elementAttackMax: 10, cultivationPct: 5, band: 'COMMON' },
    'Linh': { elementAttackMax: 18, cultivationPct: 8, band: 'COMMON' },
    'Huyền': { elementAttackMax: 28, cultivationPct: 12, band: 'SPIRIT' },
    'Địa': { elementAttackMax: 40, cultivationPct: 18, band: 'HEAVEN' },
    'Thiên': { elementAttackMax: 55, cultivationPct: 24, band: 'MONSTROUS' },
    'Tiên': { elementAttackMax: 70, cultivationPct: 30, band: 'MONSTROUS' },
    'Cực': { elementAttackMax: 85, cultivationPct: 36, band: 'EXTREME' },
    'Phá': { elementAttackMax: 100, cultivationPct: 42, band: 'BREAK' },
};
const ROOT_COUNT_EFF = { 1: 1, 2: .8, 3: .65, 4: .55, 5: .5 };
function weighted(rng, pool) {
    const total = pool.reduce((s, x) => s + Math.max(0, x.weight), 0);
    let roll = rng.next() * total;
    for (const item of pool) {
        roll -= Math.max(0, item.weight);
        if (roll <= 0)
            return item.value;
    }
    return pool[pool.length - 1].value;
}
function pick(rng, pool) { return pool[Math.min(pool.length - 1, Math.floor(rng.next() * pool.length))]; }
function shuffle(rng, input) { const a = [...input]; for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
} return a; }
function cloneEffects(x) { return { ...x }; }
function cloneOrigin(x) { return { ...x, effects: cloneEffects(x.effects) }; }
function rootGradeWeights(seal) {
    if (seal >= 9)
        return [
            { weight: 22, value: 'Phàm' }, { weight: 34, value: 'Linh' }, { weight: 27, value: 'Huyền' }, { weight: 12, value: 'Địa' },
            { weight: 4, value: 'Thiên' }, { weight: .8, value: 'Tiên' }, { weight: .19, value: 'Cực' }, { weight: .01, value: 'Phá' },
        ];
    if (seal >= 7)
        return [
            { weight: 35, value: 'Phàm' }, { weight: 34, value: 'Linh' }, { weight: 20, value: 'Huyền' }, { weight: 8, value: 'Địa' },
            { weight: 2.3, value: 'Thiên' }, { weight: .6, value: 'Tiên' }, { weight: .1, value: 'Cực' },
        ];
    if (seal >= 5)
        return [
            { weight: 50, value: 'Phàm' }, { weight: 30, value: 'Linh' }, { weight: 13, value: 'Huyền' }, { weight: 5, value: 'Địa' },
            { weight: 1.8, value: 'Thiên' }, { weight: .2, value: 'Tiên' },
        ];
    if (seal >= 3)
        return [
            { weight: 65, value: 'Phàm' }, { weight: 25, value: 'Linh' }, { weight: 7.5, value: 'Huyền' }, { weight: 2.3, value: 'Địa' }, { weight: .2, value: 'Thiên' },
        ];
    return [{ weight: 75, value: 'Phàm' }, { weight: 20, value: 'Linh' }, { weight: 4.5, value: 'Huyền' }, { weight: .5, value: 'Địa' }];
}
function rootBandGradePool(band) { return band === 'BREAK' ? ['Phá'] : ['Cực']; }
function rootLegacyId(elements) {
    if (elements.length === 5)
        return 'root.five_elements';
    if (elements.length === 1) {
        if (elements[0] === 'Wood')
            return 'root.wood';
        if (elements[0] === 'Fire')
            return 'root.fire';
        if (elements[0] === 'Water')
            return 'root.ice';
        if (elements[0] === 'Metal')
            return 'root.metal_fire';
        return 'root.mixed';
    }
    if (elements.includes('Metal') && elements.includes('Fire') && elements.length === 2)
        return 'root.metal_fire';
    return 'root.mixed';
}
function rootName(elements, grade) {
    const names = { Metal: 'Kim', Wood: 'Mộc', Water: 'Thủy', Fire: 'Hỏa', Earth: 'Thổ', Lightning: 'Lôi', Ice: 'Băng', Wind: 'Phong', Yin: 'Âm', Yang: 'Dương', Soul: 'Hồn', Poison: 'Độc', Blood: 'Huyết' };
    const countLabel = ['', 'Đơn', 'Song', 'Tam', 'Tứ', 'Ngũ'][elements.length] ?? `${elements.length}`;
    return `${countLabel} ${elements.map(x => names[x]).join('·')} Linh Căn · ${grade}`;
}
function rollRoot(rng, seal, forcedBand) {
    const count = weighted(rng, [{ weight: 75, value: 1 }, { weight: 15, value: 2 }, { weight: 6, value: 3 }, { weight: 3, value: 4 }, { weight: 1, value: 5 }]);
    const elements = shuffle(rng, FIVE_ELEMENTS).slice(0, count);
    const grade = forcedBand ? pick(rng, rootBandGradePool(forcedBand)) : weighted(rng, rootGradeWeights(seal));
    const quality = .70 + rng.next() * .30;
    const gradeDef = ROOT_GRADE_BONUS[grade];
    const eff = ROOT_COUNT_EFF[count];
    return {
        id: `root.v101.${grade}.${elements.join('_').toLowerCase()}`, name: rootName(elements, grade), band: forcedBand ?? gradeDef.band, tierLabel: grade,
        description: `${count} hệ; mỗi hệ phát huy ${(eff * 100).toFixed(0)}% hiệu suất Linh Căn. Chất lượng ${(quality * 100).toFixed(0)}%.`,
        grade, elements, elementCount: count, perElementEfficiency: eff, quality, legacyRootId: rootLegacyId(elements),
        effects: { cultivationPct: gradeDef.cultivationPct * quality * eff },
    };
}
const PHYSIQUE_POOLS = {
    NONE: [{ id: 'physique.none', name: 'Phàm Thể', band: 'NONE', tierLabel: 'Phàm Thể', description: 'Thân thể bình thường, không có cơ chế đặc thù.', effects: {} }],
    COMMON: [
        { id: 'physique.strong_bones', name: 'Cường Cốt Thể', band: 'COMMON', tierLabel: 'Phổ Thể', description: 'Xương cốt rắn chắc.', effects: { maxHpPct: 12, defensePct: 7 } },
        { id: 'physique.spirit_meridian', name: 'Linh Hải Thể', band: 'COMMON', tierLabel: 'Phổ Thể', description: 'Linh Hải chứa được nhiều Chân Nguyên.', effects: { maxSpiritPct: 15 } },
        { id: 'physique.light_body', name: 'Khinh Linh Thể', band: 'COMMON', tierLabel: 'Phổ Thể', description: 'Thân pháp nhẹ và nhanh.', effects: { actionSpeedPct: 10, dodgeFlatPct: 4 } },
        { id: 'physique.medicine_body', name: 'Dược Linh Thể', band: 'COMMON', tierLabel: 'Phổ Thể', description: 'Thân thể hợp dược lực.', effects: { cultivationPct: 4, healingPct: 8 } },
        { id: 'physique.calm_heart', name: 'Thanh Tâm Thể', band: 'COMMON', tierLabel: 'Phổ Thể', description: 'Tâm khí ổn định, ít tạp loạn.', effects: { cultivationPct: 5, controlReductionPct: 6 } },
        { id: 'physique.acquired_war', name: 'Hậu Thiên Chiến Thể', band: 'COMMON', tierLabel: 'Phổ Thể', description: 'Thân thể cân bằng công thủ.', effects: { attackPct: 8, maxHpPct: 8 } },
    ],
    SPIRIT: [
        { id: 'physique.indestructible_gold', name: 'Bất Diệt Kim Thân', band: 'SPIRIT', tierLabel: 'Linh Thể', description: 'Thiên phòng thủ và chống burst.', effects: { maxHpPct: 25, defensePct: 18, damageReductionPct: 3 } },
        { id: 'physique.flawless', name: 'Vô Cấu Linh Thể', band: 'SPIRIT', tierLabel: 'Linh Thể', description: 'Tu luyện ổn định và hồi phục tốt.', effects: { cultivationPct: 12, healingPct: 12 } },
        { id: 'physique.taixu', name: 'Thái Hư Linh Thể', band: 'SPIRIT', tierLabel: 'Linh Thể', description: 'Chân Nguyên dồi dào.', effects: { maxSpiritPct: 28, spiritEfficiencyPct: 6 } },
        { id: 'physique.innate_sword_bone', name: 'Tiên Thiên Kiếm Cốt', band: 'SPIRIT', tierLabel: 'Linh Thể', description: 'Thiên hướng sát phạt bằng kiếm.', effects: { attackPct: 18, armorPenPct: 5 } },
        { id: 'physique.spirit_orifice', name: 'Linh Khiếu Thể', band: 'SPIRIT', tierLabel: 'Linh Thể', description: 'Hấp thu linh khí nhanh.', effects: { cultivationPct: 14 } },
        { id: 'physique.iron_blood', name: 'Thiết Huyết Chi Thể', band: 'SPIRIT', tierLabel: 'Linh Thể', description: 'Càng chiến càng bền.', effects: { attackPct: 12, maxHpPct: 15 } },
    ],
    HEAVEN: [
        { id: 'physique.ancient_war', name: 'Hoang Cổ Chiến Thể', band: 'HEAVEN', tierLabel: 'Thánh Thể', description: 'Nhục thân chiến đấu mạnh.', effects: { maxHpPct: 25, attackPct: 18 } },
        { id: 'physique.nine_turn_bone', name: 'Cửu Chuyển Chiến Cốt', band: 'HEAVEN', tierLabel: 'Thánh Thể', description: 'Thiên đánh vượt cấp.', effects: { maxHpPct: 18, armorPenPct: 10, attackPct: 10 } },
        { id: 'physique.devour_heaven', name: 'Thôn Thiên Ma Thể', band: 'HEAVEN', tierLabel: 'Thánh Thể', description: 'Hợp chiến đấu dài và Bí Cảnh.', effects: { attackPct: 16, maxHpPct: 18, healingPct: 8 } },
        { id: 'physique.longevity_saint', name: 'Trường Sinh Thánh Thể', band: 'HEAVEN', tierLabel: 'Thánh Thể', description: 'Sinh cơ dồi dào.', effects: { maxHpPct: 22, healingPct: 18, cultivationPct: 8 } },
        { id: 'physique.diamond', name: 'Kim Cương Bất Hoại Thể', band: 'HEAVEN', tierLabel: 'Thánh Thể', description: 'Càng chịu đòn càng ổn định.', effects: { defensePct: 25, maxHpPct: 18, damageReductionPct: 5 } },
    ],
    MONSTROUS: [
        { id: 'physique.hunyuan_dao', name: 'Hỗn Nguyên Đạo Thai', band: 'MONSTROUS', tierLabel: 'Tiên Thể / Đạo Thai', description: 'Khả năng vận hành đa hệ và Chân Nguyên xuất sắc.', effects: { maxSpiritPct: 20, spiritEfficiencyPct: 10, controlReductionPct: 8 } },
        { id: 'physique.longevity_immortal', name: 'Trường Sinh Tiên Thể', band: 'MONSTROUS', tierLabel: 'Tiên Thể', description: 'Sinh cơ cực thịnh.', effects: { maxHpPct: 30, healingPct: 22, cultivationPct: 10 } },
        { id: 'physique.myriad_law', name: 'Vạn Pháp Tiên Thai', band: 'MONSTROUS', tierLabel: 'Đạo Thai', description: 'Hợp nhiều công pháp.', effects: { cultivationPct: 18, attackPct: 10, maxSpiritPct: 12 } },
        { id: 'physique.primordial_immortal', name: 'Thái Sơ Tiên Thể', band: 'MONSTROUS', tierLabel: 'Tiên Thể', description: 'Cân bằng công thủ và Chân Nguyên.', effects: { maxHpPct: 15, attackPct: 12, maxSpiritPct: 15 } },
        { id: 'physique.leakless', name: 'Vô Lậu Tiên Thể', band: 'MONSTROUS', tierLabel: 'Tiên Thể', description: 'Tu hành sạch và ổn định.', effects: { cultivationPct: 24, healingPct: 14, controlReductionPct: 10 } },
    ],
    EXTREME: [
        { id: 'physique.myriad_tribulation', name: 'Vạn Kiếp Bất Diệt Thần Thể', band: 'EXTREME', tierLabel: 'Thần Thể', description: 'Nhục thân sinh tồn cực mạnh.', effects: { maxHpPct: 35, defensePct: 24, damageReductionPct: 7 } },
        { id: 'physique.supreme_war', name: 'Chí Tôn Chiến Thể', band: 'EXTREME', tierLabel: 'Chí Tôn Thể', description: 'Thiên sinh để vượt cấp chiến đấu.', effects: { attackPct: 28, armorPenPct: 12, maxHpPct: 12 } },
        { id: 'physique.spacetime', name: 'Thời Không Đạo Thai', band: 'EXTREME', tierLabel: 'Đạo Thai', description: 'Thân pháp và nhịp hành động vượt trội.', effects: { actionSpeedPct: 22, dodgeFlatPct: 8, maxSpiritPct: 12 } },
        { id: 'physique.great_sun', name: 'Đại Nhật Thần Thể', band: 'EXTREME', tierLabel: 'Thần Thể', description: 'Bùng nổ công lực và Chân Nguyên.', effects: { attackPct: 24, maxSpiritPct: 25 } },
        { id: 'physique.great_yin', name: 'Thái Âm Thần Thể', band: 'EXTREME', tierLabel: 'Thần Thể', description: 'Chân Nguyên sâu, khống chế ổn định.', effects: { maxSpiritPct: 30, controlReductionPct: 15, attackPct: 12 } },
    ],
    BREAK: [
        { id: 'physique.chaos_infinite', name: 'Hỗn Độn Vô Cực Thể', band: 'BREAK', tierLabel: 'Cấm Kỵ Thể', description: 'Cấm kỵ toàn diện, cơ thể tự thích nghi.', effects: { maxHpPct: 28, attackPct: 25, maxSpiritPct: 28, defensePct: 12, actionSpeedPct: 8 } },
        { id: 'physique.devour_dao', name: 'Thôn Thiên Phệ Đạo Thể', band: 'BREAK', tierLabel: 'Cấm Kỵ Thể', description: 'Thân thể lấy chiến dưỡng chiến.', effects: { attackPct: 32, maxHpPct: 22, armorPenPct: 12, healingPct: 10 } },
        { id: 'physique.reincarnation_undying', name: 'Luân Hồi Bất Diệt Thể', band: 'BREAK', tierLabel: 'Cấm Kỵ Thể', description: 'Sinh tồn cực mạnh trong chính đời hiện tại; vẫn reset khi Luân Hồi.', effects: { maxHpPct: 40, defensePct: 26, damageReductionPct: 9, controlReductionPct: 15 } },
    ],
};
const TALENT_POOLS = {
    NONE: [{ id: 'talent.none', name: 'Vô Thiên Phú', band: 'NONE', tierLabel: 'Vô', description: 'Không có thiên phú đặc biệt.', effects: {} }],
    COMMON: [
        { id: 'talent.diligent', name: 'Cần Tu', band: 'COMMON', tierLabel: 'Phàm Tài', description: 'Tu Vi nền +6%.', effects: { cultivationPct: 6 } },
        { id: 'talent.fighter', name: 'Thiện Chiến', band: 'COMMON', tierLabel: 'Phàm Tài', description: 'Chiến lực +6%.', effects: { combatPct: 6 } },
        { id: 'talent.alchemy_sense', name: 'Đan Cảm', band: 'COMMON', tierLabel: 'Phàm Tài', description: 'Hợp đan dược và hồi phục.', effects: { cultivationPct: 4, healingPct: 4 } },
        { id: 'talent.calm', name: 'Tâm Tĩnh', band: 'COMMON', tierLabel: 'Phàm Tài', description: 'Ổn định khi tu luyện.', effects: { cultivationPct: 5, controlReductionPct: 4 } },
    ],
    SPIRIT: [
        { id: 'talent.dao_spirit', name: 'Tu Đạo Linh Tài', band: 'SPIRIT', tierLabel: 'Linh Tài', description: 'Tu Vi +13%.', effects: { cultivationPct: 13 } },
        { id: 'talent.break_spirit', name: 'Tụ Khí Linh Tài', band: 'SPIRIT', tierLabel: 'Linh Tài', description: 'Tu Vi +10%.', effects: { cultivationPct: 10 } },
        { id: 'talent.combat_instinct', name: 'Chiến Đấu Trực Giác', band: 'SPIRIT', tierLabel: 'Linh Tài', description: 'Chiến lực +13%.', effects: { combatPct: 13 } },
        { id: 'talent.sword_spirit', name: 'Kiếm Đạo Linh Tài', band: 'SPIRIT', tierLabel: 'Linh Tài', description: 'Thiên hướng công kích.', effects: { attackPct: 14, armorPenPct: 3 } },
    ],
    HEAVEN: [
        { id: 'talent.dao_sense', name: 'Thiên Sinh Đạo Cảm', band: 'HEAVEN', tierLabel: 'Thiên Tài', description: 'Tu Vi +22%, công pháp tiến nhanh hơn.', effects: { cultivationPct: 22 } },
        { id: 'talent.break_genius', name: 'Tu Luyện Thiên Tài', band: 'HEAVEN', tierLabel: 'Thiên Tài', description: 'Tu Vi +18%.', effects: { cultivationPct: 18 } },
        { id: 'talent.hundred_battles', name: 'Bách Chiến Chi Tài', band: 'HEAVEN', tierLabel: 'Thiên Tài', description: 'Chiến lực +22%.', effects: { combatPct: 22 } },
        { id: 'talent.sword_heart', name: 'Kiếm Tâm Thông Minh', band: 'HEAVEN', tierLabel: 'Thiên Tài', description: 'Sát phạt mạnh.', effects: { attackPct: 23, armorPenPct: 5 } },
    ],
    MONSTROUS: [
        { id: 'talent.one_orifice_dao', name: 'Nhất Khiếu Thông Đạo', band: 'MONSTROUS', tierLabel: 'Yêu Nghiệt', description: 'Tu Vi +34%.', effects: { cultivationPct: 34 } },
        { id: 'talent.war_god_heart', name: 'Vạn Chiến Thần Tâm', band: 'MONSTROUS', tierLabel: 'Yêu Nghiệt', description: 'Chiến lực +34%.', effects: { combatPct: 34, armorPenPct: 5 } },
        { id: 'talent.alchemy_flawless', name: 'Đan Tâm Vô Cấu', band: 'MONSTROUS', tierLabel: 'Yêu Nghiệt', description: 'Tu luyện nhờ đan cực hiệu quả.', effects: { cultivationPct: 28, healingPct: 12 } },
        { id: 'talent.innate_sword_heart', name: 'Thiên Sinh Kiếm Tâm', band: 'MONSTROUS', tierLabel: 'Yêu Nghiệt', description: 'Sát phạt cực mạnh.', effects: { attackPct: 35, armorPenPct: 7 } },
    ],
    EXTREME: [
        { id: 'talent.dao_affinity', name: 'Đại Đạo Thân Hòa', band: 'EXTREME', tierLabel: 'Chí Tôn', description: 'Tu Vi +50%.', effects: { cultivationPct: 50 } },
        { id: 'talent.born_wargod', name: 'Thiên Sinh Chiến Thần', band: 'EXTREME', tierLabel: 'Chí Tôn', description: 'Chiến lực +50%, Phá Thế cao.', effects: { combatPct: 50, armorPenPct: 8 } },
        { id: 'talent.myriad_law', name: 'Vạn Pháp Thông Minh', band: 'EXTREME', tierLabel: 'Chí Tôn', description: 'Tu pháp cực nhanh và chiến kỹ mạnh.', effects: { cultivationPct: 30, attackPct: 25, maxSpiritPct: 18 } },
        { id: 'talent.one_sword_myriad', name: 'Nhất Kiếm Sinh Vạn Pháp', band: 'EXTREME', tierLabel: 'Chí Tôn', description: 'Kiếm đạo cực hạn.', effects: { attackPct: 50, armorPenPct: 10 } },
    ],
    BREAK: [
        { id: 'talent.near_dao', name: 'Thiên Sinh Cận Đạo', band: 'BREAK', tierLabel: 'Cấm Kỵ', description: 'Tu Vi +70%.', effects: { cultivationPct: 70 } },
        { id: 'talent.eternal_war_immortal', name: 'Vạn Cổ Chiến Tiên', band: 'BREAK', tierLabel: 'Cấm Kỵ', description: 'Chiến lực +65%, Phá Thế cực cao.', effects: { combatPct: 65, armorPenPct: 14 } },
        { id: 'talent.eternal_sword_embryo', name: 'Vạn Cổ Kiếm Thai', band: 'BREAK', tierLabel: 'Cấm Kỵ', description: 'Sát phạt kiếm đạo cực hạn.', effects: { attackPct: 70, armorPenPct: 15, critDamagePct: 20 } },
        { id: 'talent.alchemy_sacred_heart', name: 'Đan Đạo Thánh Tâm', band: 'BREAK', tierLabel: 'Cấm Kỵ', description: 'Dược lực và tu hành bằng đan cực mạnh.', effects: { cultivationPct: 60, healingPct: 25 } },
        { id: 'talent.heavenly_craftsman', name: 'Thiên Công Thánh Thủ', band: 'BREAK', tierLabel: 'Cấm Kỵ', description: 'Khả năng chế tác cực hạn; bonus kinh tế được nối ở các hook nghề về sau.', effects: { lootPct: 30, luckFlat: 12 } },
    ],
};
const FATE_POOLS = {
    NONE: [],
    COMMON: [
        { id: 'fate.ordinary', name: 'Bình Phàm Chi Mệnh', band: 'COMMON', tierLabel: 'Phàm Mệnh', polarity: 'Bình', description: 'Số mệnh bình thường.', effects: {} },
        { id: 'fate.small_fortune', name: 'Tiểu Phúc Chi Mệnh', band: 'COMMON', tierLabel: 'Phàm Mệnh', polarity: 'Cát', description: 'Cơ duyên nhỏ dễ xuất hiện hơn.', effects: { luckFlat: 6, lootPct: 3 } },
        { id: 'fate.small_calamity', name: 'Tiểu Tai Tiểu Nạn', band: 'COMMON', tierLabel: 'Phàm Mệnh', polarity: 'Hung', description: 'Hay gặp rắc rối nhỏ; may mắn tổng thể giảm nhẹ.', effects: { luckFlat: -4, lootPct: 4 } },
        { id: 'fate.choke_on_water', name: 'Uống Nước Cũng Sặc', band: 'COMMON', tierLabel: 'Phàm Mệnh', polarity: 'Hỗn', description: 'Rất hay gặp chuyện lặt vặt kỳ quặc.', effects: { luckFlat: -6, lootPct: 6 } },
    ],
    SPIRIT: [
        { id: 'fate.lucky_star', name: 'Phúc Tinh', band: 'SPIRIT', tierLabel: 'Linh Mệnh', polarity: 'Cát', description: 'Cơ duyên tốt hơn rõ rệt.', effects: { luckFlat: 14, lootPct: 6 } },
        { id: 'fate.wealth', name: 'Tài Vận Hanh Thông', band: 'SPIRIT', tierLabel: 'Linh Mệnh', polarity: 'Cát', description: 'Tài vận thuận.', effects: { lootPct: 10, luckFlat: 8 } },
        { id: 'fate.pettty_villain', name: 'Mệnh Phạm Tiểu Nhân', band: 'SPIRIT', tierLabel: 'Linh Mệnh', polarity: 'Hung', description: 'Dễ bị người khác gây khó.', effects: { luckFlat: -12 } },
        { id: 'fate.shameless_luck', name: 'Mặt Dày Phúc Lớn', band: 'SPIRIT', tierLabel: 'Linh Mệnh', polarity: 'Hỗn', description: 'Thất bại vẫn thường nhặt được chút lợi.', effects: { luckFlat: 6, lootPct: 8 } },
    ],
    HEAVEN: [
        { id: 'fate.red_fortune', name: 'Hồng Phúc Chiếu Mệnh', band: 'HEAVEN', tierLabel: 'Kỳ Mệnh', polarity: 'Cát', description: 'Cơ duyên và rare reward tăng.', effects: { luckFlat: 24, lootPct: 10 } },
        { id: 'fate.comet', name: 'Sao Chổi Nhập Mệnh', band: 'HEAVEN', tierLabel: 'Kỳ Mệnh', polarity: 'Hỗn', description: 'Chuyện tốt xấu đều dễ xảy ra.', effects: { luckFlat: 5, lootPct: 14 } },
        { id: 'fate.everywhere_events', name: 'Đi Đâu Cũng Gặp Chuyện', band: 'HEAVEN', tierLabel: 'Kỳ Mệnh', polarity: 'Hỗn', description: 'Đời nhiều biến cố và cơ hội.', effects: { luckFlat: 10, lootPct: 12 } },
        { id: 'fate.ancestor_tomb', name: 'Mộ Tổ Nhà Ai Đây?', band: 'HEAVEN', tierLabel: 'Kỳ Mệnh', polarity: 'Dị', description: 'Hay gặp cổ mộ, đôi lúc chủ mộ còn sống.', effects: { luckFlat: 12, lootPct: 16 } },
    ],
    MONSTROUS: [
        { id: 'fate.purple_qi', name: 'Tử Khí Đông Lai', band: 'MONSTROUS', tierLabel: 'Đại Mệnh', polarity: 'Cát', description: 'Đại cảnh giới thường kéo theo cơ duyên.', effects: { luckFlat: 32, lootPct: 14 } },
        { id: 'fate.fortune_in_disaster', name: 'Họa Trung Tàng Phúc', band: 'MONSTROUS', tierLabel: 'Đại Mệnh', polarity: 'Hỗn', description: 'Hung sự nhiều hơn nhưng reward sau vượt nạn lớn hơn.', effects: { luckFlat: -8, lootPct: 24, combatPct: 8 } },
        { id: 'fate.lonely_star', name: 'Cô Tinh Chiếu Mệnh', band: 'MONSTROUS', tierLabel: 'Đại Mệnh', polarity: 'Hung', description: 'Độc hành khó kết duyên nhưng cơ duyên cá nhân mạnh.', effects: { luckFlat: 20, lootPct: 16 } },
    ],
    EXTREME: [
        { id: 'fate.great_fortune', name: 'Hồng Phúc Tề Thiên', band: 'EXTREME', tierLabel: 'Thiên Mệnh', polarity: 'Cát', description: 'Khí vận cực thịnh.', effects: { luckFlat: 55, lootPct: 22 } },
        { id: 'fate.heaven_mandate', name: 'Thiên Mệnh Chiếu Thân', band: 'EXTREME', tierLabel: 'Thiên Mệnh', polarity: 'Cát', description: 'Mỗi giai đoạn đời dễ gặp đại cơ duyên.', effects: { luckFlat: 48, lootPct: 24, cultivationPct: 8 } },
        { id: 'fate.myriad_tribulation', name: 'Vạn Kiếp Chi Mệnh', band: 'EXTREME', tierLabel: 'Thiên Mệnh', polarity: 'Hung', description: 'Đại kiếp nhiều nhưng vượt qua rất lời.', effects: { luckFlat: -18, lootPct: 32, combatPct: 12 } },
    ],
    BREAK: [
        { id: 'fate.child_of_destiny', name: 'Thiên Mệnh Chi Tử', band: 'BREAK', tierLabel: 'Cấm Kỵ Mệnh', polarity: 'Cát', description: 'Khí vận gần như được thiên đạo ưu ái.', effects: { luckFlat: 100, lootPct: 40, cultivationPct: 10 } },
        { id: 'fate.heavenly_lonely', name: 'Thiên Sát Cô Tinh', band: 'BREAK', tierLabel: 'Cấm Kỵ Mệnh', polarity: 'Hung', description: 'Cực hung với quan hệ nhưng cơ duyên cá nhân cực mạnh.', effects: { luckFlat: 65, lootPct: 35, combatPct: 12 } },
        { id: 'fate.outside_destiny', name: 'Nghịch Thiên Vô Mệnh', band: 'BREAK', tierLabel: 'Cấm Kỵ Mệnh', polarity: 'Dị', description: 'Ngoài mệnh số, biến cố hiếm dày đặc.', effects: { luckFlat: 70, lootPct: 38 } },
        { id: 'fate.unlucky_then_lucky', name: 'Càng Xui Càng Hên', band: 'BREAK', tierLabel: 'Cấm Kỵ Mệnh', polarity: 'Hỗn', description: 'Rất xui nhưng chuỗi xui mở đại cát.', effects: { luckFlat: 20, lootPct: 45, combatPct: 8 } },
    ],
};
const BACKGROUND_POOLS = {
    NONE: [
        { id: 'background.orphan', name: 'Cô Nhi Vô Y', band: 'NONE', tierLabel: 'Hàn Môn', description: 'Không hậu thuẫn, không nghĩa vụ.', effects: {}, startingSpiritStones: 1 },
        { id: 'background.hunter_village', name: 'Thợ Săn Sơn Thôn', band: 'NONE', tierLabel: 'Hàn Môn', description: 'Có chút kinh nghiệm săn bắt.', effects: { combatPct: 3, lootPct: 2 }, startingSpiritStones: 3 },
    ],
    COMMON: [
        { id: 'background.farmer', name: 'Nông Hộ', band: 'COMMON', tierLabel: 'Phàm Gia', description: 'Khởi đầu bình dị.', effects: { cultivationPct: 2 }, startingSpiritStones: 5 },
        { id: 'background.merchant', name: 'Thương Hộ', band: 'COMMON', tierLabel: 'Phàm Gia', description: 'Có chút vốn.', effects: { lootPct: 3 }, startingSpiritStones: 10 },
        { id: 'background.medicine_shop', name: 'Dược Phường Thế Gia', band: 'COMMON', tierLabel: 'Phàm Gia', description: 'Tiếp xúc đan dược sớm.', effects: { cultivationPct: 4, healingPct: 3 }, startingSpiritStones: 8 },
        { id: 'background.smith_family', name: 'Thợ Rèn Gia Truyền', band: 'COMMON', tierLabel: 'Phàm Gia', description: 'Có trang bị và vật liệu ban đầu khá hơn.', effects: { combatPct: 4 }, startingSpiritStones: 8 },
        { id: 'background.martial_family', name: 'Võ Lâm Thế Gia', band: 'COMMON', tierLabel: 'Phàm Gia', description: 'Có nền võ học.', effects: { combatPct: 6 }, startingSpiritStones: 7 },
    ],
    SPIRIT: [
        { id: 'background.small_cultivator_clan', name: 'Tiểu Tu Tiên Gia Tộc', band: 'SPIRIT', tierLabel: 'Tiểu Tu Tiên Gia Tộc', description: 'Có tài nguyên nhập môn và viện trợ nhỏ.', effects: { cultivationPct: 7, lootPct: 5 }, startingSpiritStones: 18 },
        { id: 'background.alchemy_clan', name: 'Đan Đạo Tiểu Tộc', band: 'SPIRIT', tierLabel: 'Tiểu Tu Tiên Gia Tộc', description: 'Có nguồn đan dược ổn định.', effects: { cultivationPct: 9, healingPct: 5 }, startingSpiritStones: 16 },
        { id: 'background.forging_clan', name: 'Luyện Khí Tiểu Tộc', band: 'SPIRIT', tierLabel: 'Tiểu Tu Tiên Gia Tộc', description: 'Trang bị nhập môn tốt hơn.', effects: { combatPct: 8, lootPct: 4 }, startingSpiritStones: 16 },
    ],
    HEAVEN: [
        { id: 'background.elder_descendant', name: 'Trưởng Lão Hậu Duệ', band: 'HEAVEN', tierLabel: 'Danh Môn / Tiên Môn', description: 'Có trưởng bối chỉ điểm.', effects: { cultivationPct: 12, combatPct: 8, lootPct: 7 }, startingSpiritStones: 30 },
        { id: 'background.alchemy_great_house', name: 'Đan Đạo Thế Gia', band: 'HEAVEN', tierLabel: 'Danh Môn', description: 'Có quyền tiếp cận đan dược tốt.', effects: { cultivationPct: 14, healingPct: 8 }, startingSpiritStones: 32 },
        { id: 'background.forging_great_house', name: 'Luyện Khí Thế Gia', band: 'HEAVEN', tierLabel: 'Danh Môn', description: 'Có trang bị và bảo khố tốt.', effects: { combatPct: 10, lootPct: 10 }, startingSpiritStones: 34 },
    ],
    MONSTROUS: [
        { id: 'background.great_clan_heir', name: 'Đại Tộc Đích Hệ', band: 'MONSTROUS', tierLabel: 'Đại Thế Gia', description: 'Hậu thuẫn mạnh và nhiều tài nguyên.', effects: { cultivationPct: 16, combatPct: 12, lootPct: 12, luckFlat: 8 }, startingSpiritStones: 52 },
        { id: 'background.useless_young_master', name: 'Phế Vật Thiếu Gia', band: 'MONSTROUS', tierLabel: 'Đại Thế Gia', description: 'Bị coi thường nhưng tiềm lực hậu thuẫn lớn.', effects: { cultivationPct: 8, combatPct: 8, lootPct: 16, luckFlat: -5 }, startingSpiritStones: 26 },
    ],
    EXTREME: [
        { id: 'background.ancient_clan_young_lord', name: 'Cổ Tộc Thiếu Chủ', band: 'EXTREME', tierLabel: 'Cổ Tộc / Thánh Địa', description: 'Bảo khố và cơ duyên gia tộc cực mạnh.', effects: { cultivationPct: 22, combatPct: 16, lootPct: 18, luckFlat: 14 }, startingSpiritStones: 80 },
        { id: 'background.holy_land_core', name: 'Thánh Địa Hạch Tâm Đệ Tử', band: 'EXTREME', tierLabel: 'Cổ Tộc / Thánh Địa', description: 'Được trọng điểm bồi dưỡng.', effects: { cultivationPct: 24, combatPct: 14, lootPct: 18, luckFlat: 15 }, startingSpiritStones: 84 },
    ],
    BREAK: [
        { id: 'background.holy_son', name: 'Tiên Môn Thánh Tử', band: 'BREAK', tierLabel: 'Chí Tôn Xuất Thân', description: 'Hạt giống truyền thừa tối cao.', effects: { cultivationPct: 32, combatPct: 20, lootPct: 25, luckFlat: 24 }, startingSpiritStones: 120 },
        { id: 'background.hidden_emperor_clan', name: 'Ẩn Thế Đế Tộc', band: 'BREAK', tierLabel: 'Chí Tôn Xuất Thân', description: 'Bảo khố cực hiếm và nền tảng kinh người.', effects: { cultivationPct: 26, combatPct: 24, lootPct: 28, luckFlat: 20 }, startingSpiritStones: 135 },
        { id: 'background.sect_master_only_child', name: 'Chưởng Giáo Độc Tử', band: 'BREAK', tierLabel: 'Chí Tôn Xuất Thân', description: 'Hậu thuẫn và hộ đạo cực mạnh.', effects: { cultivationPct: 25, combatPct: 22, lootPct: 22, luckFlat: 28 }, startingSpiritStones: 125 },
    ],
};
function bl(id, name, band, tierLabel, description, max, legacyBloodlineId) { return { id: `bloodline.v101.${id}`, name, band, tierLabel, description, effects: {}, max, legacyBloodlineId }; }
const BLOODLINE_POOLS = {
    NONE: [bl('none', 'Vô Huyết Mạch', 'NONE', 'Vô Huyết', 'Không có huyết mạch đặc biệt.', {})],
    COMMON: [
        bl('black_wolf', 'Hắc Lang Huyết', 'COMMON', 'Phổ Huyết', 'Săn mồi và kết liễu.', { attackPct: 18, actionSpeedPct: 7 }, 'bloodline.shadow_wolf'),
        bl('iron_bull', 'Thiết Giáp Man Ngưu Huyết', 'COMMON', 'Phổ Huyết', 'Công thủ bền bỉ.', { maxHpPct: 24, defensePct: 10 }, 'bloodline.ancient_human'),
        bl('gale_hawk', 'Thanh Phong Ưng Huyết', 'COMMON', 'Phổ Huyết', 'Tốc độ và né.', { actionSpeedPct: 14, dodgeFlatPct: 4 }, 'bloodline.shadow_wolf'),
        bl('spirit_deer', 'Linh Giác Lộc Huyết', 'COMMON', 'Phổ Huyết', 'Sinh cơ và hồi phục.', { maxHpPct: 15, healingPct: 16 }, 'bloodline.wood_spirit'),
        bl('red_fang_hound', 'Xích Nha Khuyển Huyết', 'COMMON', 'Phổ Huyết', 'Nhịp crit.', { attackPct: 15, critDamagePct: 14 }, 'bloodline.shadow_wolf'),
        bl('jade_serpent', 'Bích Lân Xà Huyết', 'COMMON', 'Phổ Huyết', 'Khống chế và kỹ năng.', { attackPct: 10, controlReductionPct: 6 }, 'bloodline.wood_spirit'),
        bl('mountain_ape', 'Sơn Viên Huyết', 'COMMON', 'Phổ Huyết', 'Đánh lâu càng khỏe.', { attackPct: 16, maxHpPct: 14 }, 'bloodline.ancient_human'),
        bl('ironback_turtle', 'Thiết Bối Quy Huyết', 'COMMON', 'Phổ Huyết', 'Phòng thủ thấp máu.', { maxHpPct: 22, defensePct: 12 }, 'bloodline.black_tortoise'),
    ],
    SPIRIT: [
        bl('moonhowl_wolf', 'Khiếu Nguyệt Lang Huyết', 'SPIRIT', 'Linh Thú Huyết', 'Execute và tốc.', { attackPct: 25, actionSpeedPct: 12 }, 'bloodline.shadow_wolf'),
        bl('crimson_lion', 'Xích Huyết Sư Huyết', 'SPIRIT', 'Linh Thú Huyết', 'Berserker.', { attackPct: 25, maxHpPct: 22 }, 'bloodline.ancient_human'),
        bl('thunder_rhino', 'Lôi Giác Tê Huyết', 'SPIRIT', 'Linh Thú Huyết', 'Đòn nặng phá phòng.', { maxHpPct: 28, armorPenPct: 7 }, 'bloodline.thunder_beast'),
        bl('goldwing_hawk', 'Kim Sí Ưng Huyết', 'SPIRIT', 'Linh Thú Huyết', 'Tốc và crit.', { actionSpeedPct: 20, critDamagePct: 18 }, 'bloodline.shadow_wolf'),
        bl('darkscale_croc', 'Huyền Giáp Ngạc Huyết', 'SPIRIT', 'Linh Thú Huyết', 'Chống nhiều hit.', { maxHpPct: 30, damageReductionPct: 5 }, 'bloodline.black_tortoise'),
        bl('dream_fox', 'Mộng Hồ Huyết', 'SPIRIT', 'Linh Thú Huyết', 'Khống chế nhịp.', { actionSpeedPct: 13, controlReductionPct: 10 }, 'bloodline.shadow_wolf'),
        bl('white_crane', 'Bạch Vân Hạc Huyết', 'SPIRIT', 'Linh Thú Huyết', 'Chân Nguyên bền.', { maxSpiritPct: 28, spiritEfficiencyPct: 8 }, 'bloodline.wood_spirit'),
        bl('devouring_ape', 'Thôn Sơn Viên Huyết', 'SPIRIT', 'Linh Thú Huyết', 'Bruiser kéo dài.', { attackPct: 22, defensePct: 18 }, 'bloodline.ancient_human'),
    ],
    HEAVEN: [
        bl('flood_dragon', 'Giao Long Huyết', 'HEAVEN', 'Cổ Thú Huyết', 'Sustained DPS.', { attackPct: 30, maxSpiritPct: 28 }, 'bloodline.azure_flood_dragon'),
        bl('azure_luan', 'Thanh Loan Huyết', 'HEAVEN', 'Cổ Thú Huyết', 'Skill sustain.', { attackPct: 26, maxSpiritPct: 22 }, 'bloodline.vermilion_bird'),
        bl('suanni', 'Toan Nghê Huyết', 'HEAVEN', 'Cổ Thú Huyết', 'Công thủ boss.', { attackPct: 28, damageReductionPct: 7 }, 'bloodline.white_tiger'),
        bl('pixiu', 'Tỳ Hưu Huyết', 'HEAVEN', 'Cổ Thú Huyết', 'Anti-debuff.', { maxHpPct: 32, controlReductionPct: 15 }, 'bloodline.black_tortoise'),
        bl('nine_nether_serpent', 'Cửu U Minh Xà Huyết', 'HEAVEN', 'Cổ Thú Huyết', 'Control/debuff.', { attackPct: 24, controlReductionPct: 12 }, 'bloodline.shadow_wolf'),
        bl('celestial_horse', 'Thiên Mã Huyết', 'HEAVEN', 'Cổ Thú Huyết', 'Tốc/CN efficiency.', { actionSpeedPct: 24, spiritEfficiencyPct: 12 }, 'bloodline.ancient_human'),
        bl('thunder_roc', 'Lôi Bằng Huyết', 'HEAVEN', 'Cổ Thú Huyết', 'Tốc/Phá Thế.', { actionSpeedPct: 23, armorPenPct: 11 }, 'bloodline.thunder_beast'),
        bl('baize', 'Bạch Trạch Huyết', 'HEAVEN', 'Cổ Thú Huyết', 'Thích nghi/anti-CC.', { controlReductionPct: 18, maxSpiritPct: 25 }, 'bloodline.ancient_human'),
    ],
    MONSTROUS: [],
    EXTREME: [
        bl('white_tiger', 'Bạch Hổ Huyết', 'EXTREME', 'Thần Thú Huyết', 'Burst/Boss/Phá Thế.', { attackPct: 45, armorPenPct: 18 }, 'bloodline.white_tiger'),
        bl('black_tortoise', 'Huyền Vũ Huyết', 'EXTREME', 'Thần Thú Huyết', 'Tank.', { maxHpPct: 55, damageReductionPct: 10, defensePct: 12 }, 'bloodline.black_tortoise'),
        bl('kunpeng', 'Côn Bằng Huyết', 'EXTREME', 'Thần Thú Huyết', 'Tốc/né.', { actionSpeedPct: 30, dodgeFlatPct: 10 }, 'bloodline.shadow_wolf'),
        bl('true_dragon', 'Chân Long Huyết', 'EXTREME', 'Thần Thú Huyết', 'Sustained/CN.', { attackPct: 32, maxSpiritPct: 40 }, 'bloodline.azure_flood_dragon'),
        bl('phoenix', 'Phượng Hoàng Huyết', 'EXTREME', 'Thần Thú Huyết', 'Sustain/hồi phục.', { maxHpPct: 35, healingPct: 35 }, 'bloodline.vermilion_bird'),
        bl('qilin', 'Kỳ Lân Huyết', 'EXTREME', 'Thần Thú Huyết', 'Ổn định/anti-CC.', { defensePct: 40, controlReductionPct: 20 }, 'bloodline.ancient_human'),
        bl('golden_crow', 'Kim Ô Huyết', 'EXTREME', 'Thần Thú Huyết', 'Skill burst/CN.', { attackPct: 32, maxSpiritPct: 20, spiritEfficiencyPct: 12 }, 'bloodline.vermilion_bird'),
        bl('nine_tailed_fox', 'Cửu Vĩ Thiên Hồ Huyết', 'EXTREME', 'Thần Thú Huyết', 'Control/né.', { actionSpeedPct: 18, controlReductionPct: 20, dodgeFlatPct: 5 }, 'bloodline.shadow_wolf'),
    ],
    BREAK: [
        bl('ancestral_dragon', 'Tổ Long Huyết', 'BREAK', 'Cấm Kỵ Tổ Huyết', 'Sustained apex.', { attackPct: 45, maxSpiritPct: 50, armorPenPct: 12 }, 'bloodline.azure_flood_dragon'),
        bl('primordial_phoenix', 'Nguyên Phượng Huyết', 'BREAK', 'Cấm Kỵ Tổ Huyết', 'Sustain apex.', { maxHpPct: 45, healingPct: 50, controlReductionPct: 12 }, 'bloodline.vermilion_bird'),
        bl('chaos_godfiend', 'Hỗn Độn Thần Ma Huyết', 'BREAK', 'Cấm Kỵ Tổ Huyết', 'Adaptive all-round.', { attackPct: 30, maxHpPct: 30, maxSpiritPct: 35, defensePct: 12 }, 'bloodline.ancient_human'),
        bl('primordial_dao', 'Hồng Mông Đạo Huyết', 'BREAK', 'Cấm Kỵ Tổ Huyết', 'Skill/resource apex.', { attackPct: 50, spiritEfficiencyPct: 18, maxSpiritPct: 28 }, 'bloodline.ancient_human'),
        bl('tribulation_undying', 'Vạn Kiếp Bất Diệt Huyết', 'BREAK', 'Cấm Kỵ Tổ Huyết', 'Tank apex.', { maxHpPct: 70, damageReductionPct: 12, defensePct: 25 }, 'bloodline.black_tortoise'),
        bl('primordial_wargod', 'Thái Sơ Sát Thần Huyết', 'BREAK', 'Cấm Kỵ Tổ Huyết', 'Boss/vượt cấp apex.', { attackPct: 55, armorPenPct: 20, critDamagePct: 30 }, 'bloodline.white_tiger'),
    ],
};
function rollBand(rng, weights) { return weighted(rng, weights.map(([value, weight]) => ({ value, weight }))); }
function rollPhysique(rng, forcedBand) {
    const band = forcedBand ?? rollBand(rng, [['NONE', 35], ['COMMON', 25], ['SPIRIT', 22], ['HEAVEN', 10], ['MONSTROUS', 5.5], ['EXTREME', 2.4], ['BREAK', .1]]);
    const d = pick(rng, PHYSIQUE_POOLS[band]);
    const stage = band === 'NONE' ? 'Phàm Thể' : 'Sơ Tỉnh';
    const factor = band === 'NONE' ? 0 : .27;
    const effects = Object.fromEntries(Object.entries(d.effects).map(([k, v]) => [k, (v ?? 0) * factor]));
    const legacyMap = {
        'physique.indestructible_gold': 'physique.thunder_bones', 'physique.taixu': 'physique.empty_spirit', 'physique.innate_sword_bone': 'physique.sword_bone',
        'physique.ancient_war': 'physique.blood_cauldron', 'physique.hunyuan_dao': 'physique.yin_yang', 'physique.chaos_infinite': 'physique.yin_yang',
    };
    return { ...cloneOrigin(d), effects, stage, legacyPhysiqueId: band === 'NONE' ? undefined : (legacyMap[d.id] ?? 'physique.clear_spirit') };
}
function rollTalent(rng, forcedBand) {
    const band = forcedBand ?? rollBand(rng, [['NONE', 35], ['COMMON', 25], ['SPIRIT', 20], ['HEAVEN', 12], ['MONSTROUS', 6], ['EXTREME', 1.9], ['BREAK', .1]]);
    return cloneOrigin(pick(rng, TALENT_POOLS[band]));
}
function rollFate(rng, forcedBand) {
    const band = forcedBand ?? rollBand(rng, [['COMMON', 45], ['SPIRIT', 30], ['HEAVEN', 15], ['MONSTROUS', 7], ['EXTREME', 2.9], ['BREAK', .1]]);
    const d = pick(rng, FATE_POOLS[band]);
    return { ...cloneOrigin(d), polarity: d.polarity };
}
function rollBackground(rng, forcedBand) {
    const band = forcedBand ?? rollBand(rng, [['NONE', 25], ['COMMON', 35], ['SPIRIT', 20], ['HEAVEN', 12], ['MONSTROUS', 6], ['EXTREME', 1.9], ['BREAK', .1]]);
    const d = pick(rng, BACKGROUND_POOLS[band]);
    return { ...cloneOrigin(d), startingSpiritStones: d.startingSpiritStones };
}
function bloodlineRealizationFactor(grade, purity) {
    const gradeFactor = { 'Phàm': .25, 'Linh': .30, 'Huyền': .38, 'Địa': .47, 'Thiên': .58, 'Tiên': .70, 'Cực': .84, 'Phá': 1 };
    return gradeFactor[grade] * (.85 + .15 * Math.max(0, Math.min(100, purity)) / 100);
}
function rollBloodline(rng, forcedBand) {
    const band = forcedBand ?? rollBand(rng, [['NONE', 35], ['COMMON', 25], ['SPIRIT', 22], ['HEAVEN', 12], ['EXTREME', 5.9], ['BREAK', .1]]);
    const d = pick(rng, BLOODLINE_POOLS[band]);
    const grade = 'Phàm', purity = 0;
    const f = band === 'NONE' ? 0 : bloodlineRealizationFactor(grade, purity);
    const effects = Object.fromEntries(Object.entries(d.max).map(([k, v]) => [k, (v ?? 0) * f]));
    return { ...cloneOrigin(d), effects, grade, purity, originKind: band === 'NONE' ? undefined : 'NATIVE', switchedThisLife: false, incompatibilityActive: false, legacyBloodlineId: d.legacyBloodlineId };
}
const PHYSIQUE_STAGE_FACTOR = { 'Phàm Thể': 0, 'Sơ Tỉnh': .27, 'Nhập Môn': .45, 'Tiểu Thành': .65, 'Đại Thành': .82, 'Viên Mãn': 1 };
const BLOODLINE_GRADE_FACTOR = { 'Phàm': .25, 'Linh': .30, 'Huyền': .38, 'Địa': .47, 'Thiên': .58, 'Tiên': .70, 'Cực': .84, 'Phá': 1 };
export const BLOODLINE_GRADES = ['Phàm', 'Linh', 'Huyền', 'Địa', 'Thiên', 'Tiên', 'Cực', 'Phá'];
export const PHYSIQUE_STAGES = ['Sơ Tỉnh', 'Nhập Môn', 'Tiểu Thành', 'Đại Thành', 'Viên Mãn'];
function findPhysiqueDef(id) { for (const pool of Object.values(PHYSIQUE_POOLS)) {
    const x = pool.find(v => v.id === id);
    if (x)
        return x;
} return undefined; }
function findBloodlineDef(id) { for (const pool of Object.values(BLOODLINE_POOLS)) {
    const x = pool.find(v => v.id === id);
    if (x)
        return x;
} return undefined; }
export function recomputePhysiqueEffects(physique) {
    if (physique.band === 'NONE')
        return { ...physique, stage: 'Phàm Thể', effects: {} };
    const def = findPhysiqueDef(physique.id);
    if (!def)
        return physique;
    const f = PHYSIQUE_STAGE_FACTOR[physique.stage] ?? .27;
    return { ...physique, effects: Object.fromEntries(Object.entries(def.effects).map(([k, v]) => [k, (v ?? 0) * f])) };
}
export function recomputeBloodlineEffects(bloodline) {
    if (bloodline.band === 'NONE')
        return { ...bloodline, grade: 'Phàm', purity: 0, effects: {} };
    const def = findBloodlineDef(bloodline.id);
    if (!def)
        return bloodline;
    const f = BLOODLINE_GRADE_FACTOR[bloodline.grade] * (.85 + .15 * Math.max(0, Math.min(100, bloodline.purity)) / 100);
    return { ...bloodline, effects: Object.fromEntries(Object.entries(def.max).map(([k, v]) => [k, (v ?? 0) * f])) };
}
export function nextBloodlineGrade(grade) { const i = BLOODLINE_GRADES.indexOf(grade); return i >= 0 && i < BLOODLINE_GRADES.length - 1 ? BLOODLINE_GRADES[i + 1] : undefined; }
export function nextPhysiqueStage(stage) { if (stage === 'Phàm Thể')
    return 'Sơ Tỉnh'; const i = PHYSIQUE_STAGES.indexOf(stage); return i >= 0 && i < PHYSIQUE_STAGES.length - 1 ? PHYSIQUE_STAGES[i + 1] : undefined; }
export function bloodlineDefinition(id) { const d = findBloodlineDef(id); return d ? { id: d.id, name: d.name, band: d.band, tierLabel: d.tierLabel, description: d.description, legacyBloodlineId: d.legacyBloodlineId, effects: { ...d.max } } : undefined; }
export function bloodlineIds() { return Object.values(BLOODLINE_POOLS).flat().filter(x => x.band !== 'NONE').map(x => x.id); }
export function physiqueDefinition(id) { const d = findPhysiqueDef(id); return d ? { id: d.id, name: d.name, band: d.band, tierLabel: d.tierLabel, description: d.description, legacyPhysiqueId: d.legacyId, effects: { ...d.effects } } : undefined; }
export function physiqueIds() { return Object.values(PHYSIQUE_POOLS).flat().filter(x => x.band !== 'NONE').map(x => x.id); }
export function createPhysiqueRoll(id, stage = 'Sơ Tỉnh') { const d = findPhysiqueDef(id); if (!d || d.band === 'NONE')
    throw new Error(`Unknown physique type: ${id}`); return recomputePhysiqueEffects({ ...cloneOrigin(d), stage, legacyPhysiqueId: d.legacyId }); }
export function createBloodlineRoll(id, originKind = 'SWAPPED', grade = 'Phàm') {
    const d = findBloodlineDef(id);
    if (!d || d.band === 'NONE')
        throw new Error(`Unknown bloodline type: ${id}`);
    return recomputeBloodlineEffects({ ...cloneOrigin(d), grade, purity: 0, originKind, switchedThisLife: originKind === 'SWAPPED', incompatibilityActive: originKind !== 'NATIVE', legacyBloodlineId: d.legacyBloodlineId });
}
export function bloodlineRarityFactor(band) { return band === 'COMMON' ? 1 : band === 'SPIRIT' ? 1.35 : band === 'HEAVEN' ? 1.8 : band === 'EXTREME' ? 2.6 : band === 'BREAK' ? 4 : 1; }
export function derivedAptitude(bundle) {
    const root = bandRank(bundle.spiritualRoot.band), talent = bandRank(bundle.talent.band), physique = bandRank(bundle.physique.band);
    const rootQuality = (bundle.spiritualRoot.quality ?? .7) * 18;
    return Math.max(20, Math.min(100, Math.round(28 + root * 6 + talent * 5 + physique * 2 + rootQuality)));
}
export function derivedLuck(bundle) {
    const fate = bandRank(bundle.fate.band), background = bandRank(bundle.background.band);
    const polarity = bundle.fate.polarity;
    const polarityAdj = polarity === 'Cát' ? 10 : polarity === 'Hung' ? -8 : polarity === 'Hỗn' ? 2 : polarity === 'Dị' ? 4 : 0;
    return Math.max(0, Math.min(100, Math.round(38 + fate * 7 + background * 2 + polarityAdj)));
}
function naturalAnchor(bundle) {
    const systems = ['spiritualRoot', 'bloodline', 'physique', 'talent', 'fate', 'background'];
    const breakKey = systems.find(k => bundle[k].band === 'BREAK');
    if (breakKey)
        return { band: 'BREAK', system: breakKey };
    const extremeKey = systems.find(k => bundle[k].band === 'EXTREME');
    if (extremeKey)
        return { band: 'EXTREME', system: extremeKey };
    return undefined;
}
function rerollSystem(rng, key, band, seal) {
    if (key === 'spiritualRoot')
        return rollRoot(rng, seal, band);
    if (key === 'bloodline')
        return rollBloodline(rng, band);
    if (key === 'physique')
        return rollPhysique(rng, band);
    if (key === 'talent')
        return rollTalent(rng, band);
    if (key === 'fate')
        return rollFate(rng, band);
    return rollBackground(rng, band);
}
export function rollBirthOriginBundle(rng, sealLevel = 0, resonancePoints = 0) {
    const bundle = {
        spiritualRoot: rollRoot(rng, sealLevel), bloodline: rollBloodline(rng), physique: rollPhysique(rng), talent: rollTalent(rng), fate: rollFate(rng), background: rollBackground(rng),
    };
    const anchor = naturalAnchor(bundle);
    const points = Math.max(0, Math.min(15, Math.floor(resonancePoints)));
    const chancePct = points * 5;
    if (!anchor || chancePct <= 0)
        return bundle;
    const attempts = [];
    const systems = shuffle(rng, ['spiritualRoot', 'bloodline', 'physique', 'talent', 'fate', 'background'].filter(k => k !== anchor.system && bundle[k].band !== anchor.band));
    for (const key of systems) {
        const success = rng.chance(chancePct);
        if (!success) {
            attempts.push({ system: key, success: false });
            break;
        }
        const result = rerollSystem(rng, key, anchor.band, sealLevel);
        bundle[key] = result;
        attempts.push({ system: key, success: true, resultName: result.name });
    }
    bundle.resonance = { points, chancePct, anchorBand: anchor.band, anchorSystem: anchor.system, attempts };
    return bundle;
}
export function originBundleEffects(bundle) {
    if (!bundle)
        return {};
    const total = {};
    const keys = Object.keys(bundle).filter(k => k !== 'resonance');
    for (const key of keys) {
        for (const [effect, value] of Object.entries(bundle[key].effects)) {
            total[effect] = (total[effect] ?? 0) + (value ?? 0);
        }
    }
    return total;
}
export function rootElementAffinityPct(root) {
    const max = ROOT_GRADE_BONUS[root.grade].elementAttackMax * root.quality * root.perElementEfficiency;
    return Object.fromEntries(root.elements.map(e => [e, Math.max(0, Math.min(100, max))]));
}
export function bundleSummaryLines(bundle) {
    if (!bundle)
        return [];
    const lines = [
        `Linh Căn: ${bundle.spiritualRoot.name}`,
        `Huyết Mạch: ${bundle.bloodline.name}${bundle.bloodline.band === 'NONE' ? '' : ` · ${bundle.bloodline.grade} ${bundle.bloodline.purity}%`}`,
        `Thể Chất: ${bundle.physique.name}${bundle.physique.band === 'NONE' ? '' : ` · ${bundle.physique.stage}`}`,
        `Thiên Phú: ${bundle.talent.name}`,
        `Mệnh Cách: ${bundle.fate.name} · ${bundle.fate.polarity}`,
        `Xuất Thân: ${bundle.background.name}`,
    ];
    if (bundle.resonance?.anchorBand) {
        const ok = bundle.resonance.attempts.filter(x => x.success).length;
        const failed = bundle.resonance.attempts.some(x => !x.success);
        lines.push(`Luân Hồi · Chuỗi Cộng Hưởng ${bundle.resonance.anchorBand === 'BREAK' ? 'Phá/Cấm Kỵ' : 'Cực'}: ${bundle.resonance.chancePct}% · thành công ${ok}${failed ? ' · đã dừng khi thất bại' : ''}`);
    }
    return lines;
}
export function legacyTalentRoll(talent) {
    if (talent.band === 'NONE')
        return [];
    const rarity = talent.band === 'COMMON' ? 'common' : talent.band === 'SPIRIT' ? 'uncommon' : talent.band === 'HEAVEN' ? 'rare' : talent.band === 'MONSTROUS' ? 'epic' : talent.band === 'EXTREME' ? 'legendary' : 'mythic';
    return [{ id: talent.id, name: talent.name, rarity, description: talent.description }];
}
export function bandRank(band) { return { NONE: 0, COMMON: 1, SPIRIT: 2, HEAVEN: 3, MONSTROUS: 4, EXTREME: 5, BREAK: 6 }[band]; }
//# sourceMappingURL=birth-origins-v101.js.map