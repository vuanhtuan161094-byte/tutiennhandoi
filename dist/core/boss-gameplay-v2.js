export const BOSS_GAMEPLAY_V2_VERSION = '1.0.0';
const GENERIC_SKILLS = {
    slam: 'skill.boss.v81.crushing_slam',
    cataclysm: 'skill.boss.v81.cataclysm',
    guard: 'skill.boss.v81.guard',
    siphon: 'skill.boss.v81.life_siphon',
    bind: 'skill.boss.v81.binding_wave',
};
function hasAny(tags, values) { return values.some(value => tags.has(value.toLowerCase())); }
export function isBossEntityV81(entity) {
    return entity.tags.some(tag => ['boss', 'dungeonguardian', 'bosslike'].includes(String(tag).toLowerCase()));
}
export function bossArchetypeForEntityV81(entity) {
    const tags = new Set(entity.tags.map(tag => String(tag).toLowerCase()));
    const dominant = String(entity.stats.dominantElement ?? '').toLowerCase();
    if (hasAny(tags, ['wood', 'poison', 'blood']) || ['wood'].includes(dominant))
        return 'regenerator';
    if (hasAny(tags, ['water', 'soul', 'mirror', 'control']) || ['water'].includes(dominant))
        return 'controller';
    if (hasAny(tags, ['earth', 'construct', 'rhino', 'body']) || ['earth'].includes(dominant))
        return 'bulwark';
    if (hasAny(tags, ['metal', 'sword', 'blade']) || ['metal'].includes(dominant))
        return 'executioner';
    return 'berserker';
}
function genericSkills(archetype, intro = false) {
    if (intro)
        return [];
    if (archetype === 'bulwark')
        return [GENERIC_SKILLS.guard, GENERIC_SKILLS.slam, GENERIC_SKILLS.cataclysm];
    if (archetype === 'regenerator')
        return [GENERIC_SKILLS.siphon, GENERIC_SKILLS.slam, GENERIC_SKILLS.cataclysm];
    if (archetype === 'controller')
        return [GENERIC_SKILLS.bind, GENERIC_SKILLS.slam, GENERIC_SKILLS.cataclysm];
    if (archetype === 'executioner')
        return [GENERIC_SKILLS.slam, GENERIC_SKILLS.cataclysm];
    return [GENERIC_SKILLS.slam, GENERIC_SKILLS.cataclysm];
}
function mergeRules(base, prefix) {
    return {
        name: `${base.name} · Boss V2`,
        rules: [...prefix.map(row => ({ skillId: row.skillId, priority: row.priority, conditions: row.conditions.map(x => ({ ...x })) })), ...base.rules.map(rule => ({ ...rule, conditions: rule.conditions.map(x => ({ ...x })) }))],
    };
}
function phaseOne(archetype, intro = false) {
    if (archetype === 'regenerator')
        return {
            id: 'phase.boss.v81.regrowth', name: 'Sinh Cơ Nghịch Chuyển', hpBelowPct: 68,
            description: 'Boss cưỡng ép sinh cơ quay về bản thể; nếu không cắt hồi phục đúng lúc, trận đấu sẽ bị kéo dài mạnh.',
            counterHint: 'Anti-Heal/Cấm Hồi trong 5.5s sẽ phá nghi thức và mở cửa sổ bộc phát.', interruptCasting: true,
            counterWindow: { id: 'counter.boss.v81.regrowth', name: 'Cắt Sinh Cơ', description: 'Khóa hồi phục hoặc dồn một nhịp Bộc Phát/Kết Liễu trước khi sinh cơ khép vòng.', duration: 5.5, trigger: { type: 'skillRole', roles: ['AntiHeal', 'Burst', 'Finisher', 'Execute'], requiredActions: 1 }, successText: 'Sinh cơ bị cắt đứt — Boss lộ Đạo Cơ.', failureText: 'Sinh cơ khép vòng — Boss hồi phục một phần Sinh Mệnh.', onSuccessEffects: [{ type: 'applyStatus', statusId: 'status.guardian_counter_exposed', duration: 5, target: 'target' }], onFailureEffects: [{ type: 'heal', maxHpPct: intro ? 2 : 14, target: 'self' }] },
        };
    if (archetype === 'controller')
        return {
            id: 'phase.boss.v81.mind_lock', name: 'Trấn Tâm Đoạt Nhịp', hpBelowPct: 68,
            description: 'Boss khóa nhịp thi triển bằng áp lực thần niệm, ép build thiếu kháng khống rơi khỏi rotation.',
            counterHint: 'Giải Khống/Kháng Khống hoặc Ngắt đúng cửa 5s để đảo nhịp.', interruptCasting: true,
            counterWindow: { id: 'counter.boss.v81.mind_lock', name: 'Phản Trấn Tâm', description: 'Dùng Giải Khống/Kháng Khống/Ngắt để phá áp lực thần niệm.', duration: 5, trigger: { type: 'skillRole', roles: ['Cleanse', 'AntiControl', 'Interrupt', 'Control'], requiredActions: 1 }, successText: 'Áp lực thần niệm bị phản chấn — Boss lộ sơ hở.', failureText: 'Trấn Tâm hoàn tất — người chơi bị khóa nhịp ngắn.', onSuccessEffects: [{ type: 'applyStatus', statusId: 'status.guardian_counter_exposed', duration: 4.5, target: 'target' }], onFailureEffects: intro ? [{ type: 'shield', capacity: 0, stability: 100, duration: 4, maxHpPct: 2 }] : [{ type: 'applyStatus', statusId: 'status.stun', duration: 1.35, target: 'target' }] },
        };
    if (archetype === 'bulwark')
        return {
            id: 'phase.boss.v81.fortress', name: 'Trấn Sơn Hộ Thế', hpBelowPct: 68,
            description: 'Boss dựng thế phòng thủ dày, buộc build phải thật sự có nhịp Phá Thế/Bộc Phát thay vì chỉ rải DPS.',
            counterHint: 'Dùng 2 hành động có vai trò Phá Thế/Bộc Phát trong 6s để làm Đạo Cơ dao động.', interruptCasting: true,
            onEnterEffects: [{ type: 'shield', capacity: 0, stability: 100, duration: 7, maxHpPct: intro ? 2 : 10 }],
            counterWindow: { id: 'counter.boss.v81.fortress', name: 'Phá Trấn Sơn', description: 'Ép đủ hai nhịp Phá/Bộc Phát trước khi thế phòng thủ ổn định.', duration: 6, trigger: { type: 'skillRole', roles: ['Break', 'Burst', 'Finisher'], requiredActions: 2 }, successText: 'Trấn Sơn vỡ nhịp — Boss lộ Đạo Cơ.', failureText: 'Trấn Sơn ổn định — Boss bồi thêm hộ thể.', onSuccessEffects: [{ type: 'applyStatus', statusId: 'status.guardian_counter_exposed', duration: 5, target: 'target' }], onFailureEffects: [{ type: 'shield', capacity: 0, stability: 100, duration: 6, maxHpPct: intro ? 2 : 10 }] },
        };
    if (archetype === 'executioner')
        return {
            id: 'phase.boss.v81.edge', name: 'Phong Mang Đoạt Mệnh', hpBelowPct: 68,
            description: 'Boss gom sát ý vào một cửa phản sát; build tham công mà không có lớp sống sót sẽ bị trừng phạt.',
            counterHint: 'Khiên/Hồi Phục/Phản Kích hoặc Phá Thế đúng cửa 5s để bẻ đòn kết liễu.', interruptCasting: true,
            counterWindow: { id: 'counter.boss.v81.edge', name: 'Bẻ Phong Mang', description: 'Dùng phòng thủ chủ động, phản kích hoặc Phá Thế để bẻ sát ý.', duration: 5, trigger: { type: 'skillRole', roles: ['Barrier', 'Sustain', 'Counter', 'Break'], requiredActions: 1 }, successText: 'Phong mang bị bẻ — Boss lộ sơ hở.', failureText: 'Phong mang thành hình — Boss tung phản sát.', onSuccessEffects: [{ type: 'applyStatus', statusId: 'status.guardian_counter_exposed', duration: 4.5, target: 'target' }], onFailureEffects: intro ? [{ type: 'shield', capacity: 0, stability: 100, duration: 4, maxHpPct: 2 }] : [{ type: 'damage', coefficient: 1.8, breakDamagePct: 14, canCrit: false }] },
        };
    return {
        id: 'phase.boss.v81.overheat', name: 'Bạo Liệt Đoạt Nhịp', hpBelowPct: 68,
        description: 'Boss nén lực cho một nhịp bộc phát lớn; đây là bài kiểm tra sống sót và khả năng cắt rotation.',
        counterHint: 'Khiên/Hồi Phục/Phản Kích hoặc Ngắt trong 5s để giảm áp lực bộc phát.', interruptCasting: true,
        counterWindow: { id: 'counter.boss.v81.overheat', name: 'Cắt Bạo Liệt', description: 'Dùng phòng thủ chủ động hoặc Ngắt/Phản Kích để phá nhịp bộc phát.', duration: 5, trigger: { type: 'skillRole', roles: ['Barrier', 'Sustain', 'Counter', 'Interrupt'], requiredActions: 1 }, successText: 'Bạo Liệt bị cắt nhịp — Boss lộ sơ hở.', failureText: 'Bạo Liệt hoàn tất — người chơi hứng một đợt sát thương lớn.', onSuccessEffects: [{ type: 'applyStatus', statusId: 'status.guardian_counter_exposed', duration: 4.5, target: 'target' }], onFailureEffects: intro ? [{ type: 'shield', capacity: 0, stability: 100, duration: 4, maxHpPct: 2 }] : [{ type: 'damage', coefficient: 1.7, breakDamagePct: 12, canCrit: false }] },
    };
}
function phaseTwo(archetype, base, intro = false) {
    const buff = archetype === 'bulwark' ? 'status.class_body_fortress' : archetype === 'controller' ? 'status.soul_haste' : archetype === 'executioner' ? 'status.starfall_sword_intent' : archetype === 'regenerator' ? 'status.blood_frenzy' : 'status.class_body_berserk';
    const phaseName = archetype === 'bulwark' ? 'Địa Mạch Quyết Trận' : archetype === 'controller' ? 'Vạn Niệm Phong Tỏa' : archetype === 'executioner' ? 'Nhất Trảm Định Mệnh' : archetype === 'regenerator' ? 'Huyết Sinh Tuyệt Mệnh' : 'Bạo Tẩu Tuyệt Mệnh';
    return {
        id: `phase.boss.v81.climax.${archetype}`, name: phaseName, hpBelowPct: 30,
        description: 'Boss bước vào phase cuối: nhịp đánh nhanh và đòn đại sát được ưu tiên. Đây là cửa kết liễu, không phải phase kéo dài vô hạn.',
        counterHint: 'Tận dụng Thất Thế/Đạo Cơ Dao Động để dồn burst trước khi đại sát lặp lại.', interruptCasting: true,
        onEnterEffects: intro ? [] : [{ type: 'applyStatus', statusId: buff, duration: 6, target: 'self' }],
        aiProfile: intro ? base : mergeRules(base, [{ skillId: GENERIC_SKILLS.cataclysm, priority: 150, conditions: [{ type: 'always' }] }, { skillId: GENERIC_SKILLS.slam, priority: 128, conditions: [{ type: 'always' }] }]),
    };
}
/**
 * Canonical V81 boss authoring bridge. Existing hand-authored 2+ phase bosses are preserved.
 * Bosses with zero/one authored phase receive a common readable encounter skeleton instead of remaining HP bags.
 */
export function prepareBossGameplayV2(entity) {
    if (entity.tags.some(tag => String(tag).toLowerCase() === 'tutorialguardian'))
        return entity;
    if (!isBossEntityV81(entity))
        return entity;
    const archetype = bossArchetypeForEntityV81(entity);
    const authored = (entity.phases ?? []).map(phase => ({ ...phase, counterWindow: phase.counterWindow ? { ...phase.counterWindow, onSuccessEffects: phase.counterWindow.onSuccessEffects?.map(x => ({ ...x })), onFailureEffects: phase.counterWindow.onFailureEffects?.map(x => ({ ...x })) } : undefined }));
    const tags = [...new Set([...entity.tags, 'BossGameplayV2', `BossArchetype:${archetype}`])];
    if (authored.length >= 2)
        return { ...entity, tags, phases: authored };
    const floorTag = entity.tags.find(tag => /^DungeonFloor\d+$/i.test(String(tag)));
    const floor = floorTag ? Number(String(floorTag).replace(/\D/g, '')) : Number.POSITIVE_INFINITY;
    const intro = entity.tags.some(tag => String(tag).toLowerCase() === 'dungeonguardian') && floor <= 2;
    const skills = [...new Set([...entity.skillIds, ...genericSkills(archetype, intro)])];
    const baseAi = intro ? { name: `${entity.aiProfile.name} · Boss V2 nhập môn`, rules: entity.aiProfile.rules.map(rule => ({ ...rule, conditions: rule.conditions.map(x => ({ ...x })) })) } : mergeRules(entity.aiProfile, [
        ...(archetype === 'bulwark' ? [{ skillId: GENERIC_SKILLS.guard, priority: 116, conditions: [{ type: 'selfHpBelow', pct: 82 }] }] : []),
        ...(archetype === 'regenerator' ? [{ skillId: GENERIC_SKILLS.siphon, priority: 112, conditions: [{ type: 'selfHpBelow', pct: 78 }] }] : []),
        ...(archetype === 'controller' ? [{ skillId: GENERIC_SKILLS.bind, priority: 108, conditions: [{ type: 'always' }] }] : []),
        { skillId: GENERIC_SKILLS.slam, priority: 96, conditions: [{ type: 'always' }] },
    ]);
    const phases = [...authored];
    if (!phases.some(x => x.hpBelowPct >= 55))
        phases.push(phaseOne(archetype, intro));
    if (!phases.some(x => x.hpBelowPct <= 40))
        phases.push(phaseTwo(archetype, baseAi, intro));
    return { ...entity, tags, skillIds: skills, aiProfile: baseAi, phases };
}
export function bossDangerMetaV81(actor, skill, castTime) {
    if (!isBossEntityV81(actor))
        return undefined;
    const tags = new Set(skill.tags.map(tag => String(tag).toLowerCase()));
    const dangerous = tags.has('bossmechanic') || tags.has('heavy') || tags.has('burst') || tags.has('finisher') || tags.has('execute') || tags.has('control') || castTime >= 1.05;
    if (!dangerous)
        return undefined;
    const lethal = tags.has('burst') || tags.has('finisher') || tags.has('execute') || tags.has('bossultimate') || castTime >= 1.35;
    return { bossTelegraph: true, bossDangerLevel: lethal ? 'lethal' : castTime >= .8 || tags.has('heavy') ? 'danger' : 'warning', bossDangerLabel: lethal ? 'ĐẠI SÁT' : tags.has('control') ? 'KHỐNG CHẾ' : 'NGUY HIỂM' };
}
//# sourceMappingURL=boss-gameplay-v2.js.map