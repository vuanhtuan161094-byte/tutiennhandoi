const T = (id, name, slot, grade, school, description, options = {}) => ({
    id, name, slot, grade, school, description, tags: ['Technique', slot, school, grade, ...(options.tags ?? [])],
    preferredAffinities: options.preferredAffinities, combat: options.combat,
    grantedTriggers: options.grantedTriggers, requiredRealmOrder: options.requiredRealmOrder ?? 0, grantedSkillIds: options.grantedSkillIds,
    masteryFloor: options.masteryFloor ?? 0.25,
});
/**
 * v1.03 manual pool. Philosophy:
 * - Tâm Pháp (inner): cultivation + resource/combat identity.
 * - Võ Học/Thần Thông (art): grants a usable active skill and a smaller passive.
 * - Thân Pháp (movement): speed/evasion/tempo.
 * - Bí Thuật (secret): powerful conditional active/passive, usually with a real cost or long cooldown.
 * Grade is the manual's rarity/potential, not a second level ladder; mastery 0..100 is the actual study progression.
 */
export const techniqueManualsV103 = {
    // --- high-tier inner methods ---
    primalQi: T('technique.v103.primal_qi', '《Hỗn Nguyên Nhất Khí Kinh》', 'inner', 'heaven', 'universal', 'Tâm pháp dung hòa Ngũ Hành, thiên về Chân Nguyên dày và tu luyện ổn định.', {
        tags: ['FiveElements', 'Stable'], preferredAffinities: ['Metal', 'Wood', 'Water', 'Fire', 'Earth'], requiredRealmOrder: 22,
        combat: { maxSpiritMultiplier: 1.18, defenseMultiplier: 1.06 }, masteryFloor: .22,
    }),
    myriadLaw: T('technique.v103.myriad_law', '《Thái Hư Vạn Pháp Kinh》', 'inner', 'immortal', 'spell', 'Tiên kinh vận hành nhiều pháp môn trong cùng một Linh Hải; mạnh ở kỹ năng và hồi nguyên.', {
        tags: ['Spell', 'Sustain'], preferredAffinities: ['Water', 'Fire', 'Metal', 'Wood', 'Earth'], requiredRealmOrder: 31,
        combat: { maxSpiritMultiplier: 1.24, attackMultiplier: 1.10, actionSpeedMultiplier: 1.04 }, masteryFloor: .18,
    }),
    chaosReturn: T('technique.v103.chaos_return', '《Hỗn Độn Quy Nguyên Kinh》', 'inner', 'extreme', 'universal', 'Cực phẩm tâm pháp, lấy hỗn độn quy nhất để thích ứng mọi build nhưng không chuyên môn hóa tuyệt đối.', {
        tags: ['Chaos', 'Adaptive'], requiredRealmOrder: 40,
        combat: { maxHpMultiplier: 1.12, maxSpiritMultiplier: 1.22, attackMultiplier: 1.12, defenseMultiplier: 1.10 }, masteryFloor: .15,
    }),
    primordialDao: T('technique.v103.primordial_dao', '《Hồng Mông Thái Sơ Kinh》', 'inner', 'breaker', 'universal', 'Phá phẩm cổ kinh. Tiềm năng cực cao nhưng phải Hóa Cảnh mới phát huy gần trọn uy lực.', {
        tags: ['Primordial', 'Apex'], requiredRealmOrder: 49,
        combat: { maxHpMultiplier: 1.18, maxSpiritMultiplier: 1.32, attackMultiplier: 1.20, defenseMultiplier: 1.14, actionSpeedMultiplier: 1.05 }, masteryFloor: .10,
    }),
    // --- art manuals ---
    sevenStarSword: T('technique.v103.seven_star_sword', '《Thất Tinh Liên Kiếm Quyết》', 'art', 'mundane', 'sword', 'Kiếm phổ nhập môn theo nhịp liên kích; dễ dùng, dễ ghép với Kiếm Ý.', {
        tags: ['Sword', 'Combo'], combat: { attackMultiplier: 1.04 }, grantedSkillIds: ['skill.manual.seven_star_sword'], masteryFloor: .35,
    }),
    breakArmySword: T('technique.v103.break_army_sword', '《Phá Quân Kiếm Điển》', 'art', 'mystic', 'sword', 'Trọng kiếm điển thiên phá giáp, Boss và mục tiêu phòng thủ cao.', {
        tags: ['Sword', 'Break', 'Heavy'], preferredAffinities: ['Metal'], requiredRealmOrder: 10, combat: { attackMultiplier: 1.08, critPowerPerLayerFlat: .05 }, grantedSkillIds: ['skill.manual.break_army_sword'], masteryFloor: .25,
    }),
    eightExtremes: T('technique.v103.eight_extremes', '《Bát Cực Chấn Sơn Quyền》', 'art', 'spirit', 'martial', 'Quyền pháp cận chiến nặng, dùng kình lực phá ổn định và ép nhịp.', {
        tags: ['Martial', 'Body', 'Break'], requiredRealmOrder: 4, combat: { attackMultiplier: 1.06, defenseMultiplier: 1.03 }, grantedSkillIds: ['skill.manual.eight_extremes_fist'], masteryFloor: .30,
    }),
    taiji: T('technique.v103.taiji', '《Thái Cực Hóa Kình Công》', 'art', 'mystic', 'martial', 'Lấy nhu hóa cương, chuyển phòng thủ thành nhịp phản công và kéo dài duel.', {
        tags: ['Martial', 'Counter', 'Defense'], requiredRealmOrder: 10, combat: { defenseMultiplier: 1.10, resolveMultiplier: 1.08 }, grantedSkillIds: ['skill.manual.taiji_counter'], masteryFloor: .25,
    }),
    heavenThunder: T('technique.v103.heaven_thunder', '《Thiên Lôi Ngự Pháp》', 'art', 'spirit', 'spell', 'Lôi pháp dùng ấn ký để nối setup và burst.', {
        tags: ['Spell', 'Lightning', 'Setup'], preferredAffinities: ['Lightning'], requiredRealmOrder: 4, combat: { attackMultiplier: 1.06, actionSpeedMultiplier: 1.03 }, grantedSkillIds: ['skill.manual.heaven_thunder'], masteryFloor: .30,
    }),
    nineTurnTalisman: T('technique.v103.nine_turn_talisman', '《Cửu Chuyển Phù Kinh》', 'art', 'mystic', 'talisman', 'Phù kinh chuyên phong tỏa và phá nhịp; damage vừa nhưng khống chế rõ.', {
        tags: ['Talisman', 'Control'], requiredRealmOrder: 10, combat: { controlPowerMultiplier: 1.12, maxSpiritMultiplier: 1.05 }, grantedSkillIds: ['skill.manual.nine_turn_talisman'], masteryFloor: .25,
    }),
    netherSoul: T('technique.v103.nether_soul', '《U Minh Ngự Hồn Thuật》', 'art', 'earth', 'spirit', 'Ngự hồn công pháp đánh vào thần thức, thiên silence và attrition.', {
        tags: ['Soul', 'Control', 'Summon'], requiredRealmOrder: 16, combat: { controlPowerMultiplier: 1.14, maxSpiritMultiplier: 1.10 }, grantedSkillIds: ['skill.manual.nether_soul'], masteryFloor: .22,
    }),
    bloodSea: T('technique.v103.blood_sea', '《Huyết Hải Ma Kinh》', 'art', 'heaven', 'blood', 'Ma công dùng huyết khí đổi bộc phát và hút sinh lực; mạnh nhưng chủ động trả giá.', {
        tags: ['Blood', 'Demonic', 'Drain'], requiredRealmOrder: 22, combat: { attackMultiplier: 1.12, maxHpMultiplier: 1.10 }, grantedSkillIds: ['skill.manual.blood_sea'], masteryFloor: .20,
    }),
    // --- movement manuals ---
    greenWindStep: T('technique.v103.green_wind_step', '《Thanh Phong Bộ》', 'movement', 'mundane', 'universal', 'Thân pháp phổ thông, tăng nhịp hành động và cơ động.', {
        tags: ['Movement', 'Wind'], combat: { mobilityMultiplier: 1.08, actionSpeedMultiplier: 1.025 }, grantedSkillIds: ['skill.manual.green_wind_step'], masteryFloor: .35,
    }),
    lightningShadow: T('technique.v103.lightning_shadow', '《Lôi Ảnh Độn》', 'movement', 'mystic', 'spell', 'Lôi độn bộc phát ngắn, thích hợp pháp tu và kiếm tu tốc chiến.', {
        tags: ['Movement', 'Lightning'], preferredAffinities: ['Lightning'], requiredRealmOrder: 10, combat: { mobilityMultiplier: 1.13, actionSpeedMultiplier: 1.06 }, grantedSkillIds: ['skill.manual.lightning_shadow_step'], masteryFloor: .25,
    }),
    kunpengStep: T('technique.v103.kunpeng_step', '《Côn Bằng Tiêu Dao Bộ》', 'movement', 'immortal', 'universal', 'Tiên cấp thân pháp lấy nhịp đầu trận và né tránh làm lợi thế.', {
        tags: ['Movement', 'Speed', 'Kunpeng'], requiredRealmOrder: 31, combat: { mobilityMultiplier: 1.22, actionSpeedMultiplier: 1.10 }, grantedSkillIds: ['skill.manual.kunpeng_step'], masteryFloor: .18,
    }),
    voidShift: T('technique.v103.void_shift', '《Hư Không Na Di Pháp》', 'movement', 'extreme', 'universal', 'Cực phẩm không gian thân pháp, dùng na di để phá nhịp burst của đối thủ.', {
        tags: ['Movement', 'Void', 'Space'], requiredRealmOrder: 40, combat: { mobilityMultiplier: 1.26, actionSpeedMultiplier: 1.12, resolveMultiplier: 1.08 }, grantedSkillIds: ['skill.manual.void_shift'], masteryFloor: .15,
    }),
    // --- secret manuals ---
    lifeBurn: T('technique.v103.life_burn', '《Nhiên Mệnh Bí Thuật》', 'secret', 'spirit', 'universal', 'Bí thuật lấy sinh mệnh làm giá để bộc phát; chỉ dùng khi muốn đánh đổi thật.', {
        tags: ['Secret', 'Risk', 'Life'], requiredRealmOrder: 4, combat: { attackMultiplier: 1.04 }, grantedSkillIds: ['skill.manual.life_burn'], masteryFloor: .28,
    }),
    demonDisintegration: T('technique.v103.demon_disintegration', '《Thiên Ma Giải Thể Đại Pháp》', 'secret', 'earth', 'blood', 'Bí thuật Ma Đạo ép thân thể quá tải để đổi một cửa burst lớn.', {
        tags: ['Secret', 'Demonic', 'Risk'], requiredRealmOrder: 16, combat: { attackMultiplier: 1.08 }, grantedSkillIds: ['skill.manual.demon_disintegration'], masteryFloor: .20,
    }),
    immovableKing: T('technique.v103.immovable_king', '《Bất Động Minh Vương Ấn》', 'secret', 'heaven', 'body', 'Bí ấn phòng thủ cấp cao; dùng một cửa Hộ Thể cực dày để sống qua boss burst.', {
        tags: ['Secret', 'Defense', 'Body'], requiredRealmOrder: 22, combat: { defenseMultiplier: 1.10, resolveMultiplier: 1.10 }, grantedSkillIds: ['skill.manual.immovable_king'], masteryFloor: .18,
    }),
    oneThoughtReturn: T('technique.v103.one_thought_return', '《Nhất Niệm Quy Nhất Pháp》', 'secret', 'immortal', 'spell', 'Tiên cấp bí pháp gom Chân Nguyên và thần niệm vào một nhịp, tái lập rotation.', {
        tags: ['Secret', 'Spell', 'Sustain'], requiredRealmOrder: 31, combat: { maxSpiritMultiplier: 1.10, actionSpeedMultiplier: 1.05 }, grantedSkillIds: ['skill.manual.one_thought_return'], masteryFloor: .15,
    }),
};
export const techniqueGradeLabels = { mundane: 'Phàm', spirit: 'Linh', mystic: 'Huyền', earth: 'Địa', heaven: 'Thiên', immortal: 'Tiên', extreme: 'Cực', breaker: 'Phá' };
export const techniqueSlotLabels = { inner: 'Tâm Pháp', art: 'Võ Học/Thần Thông', movement: 'Thân Pháp', secret: 'Bí Thuật' };
export const techniqueSchoolLabels = { universal: 'Vạn Dụng', sword: 'Kiếm', spell: 'Pháp', martial: 'Võ', body: 'Thể', talisman: 'Phù', spirit: 'Hồn', poison: 'Độc', blood: 'Huyết' };
//# sourceMappingURL=techniques-v103.js.map