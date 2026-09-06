function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
export function createDaoState() {
    return { awakened: false, known: {}, domain: { active: false, manifestedYears: 0 }, totalInsight: 0 };
}
export function cloneDaoState(state) {
    const source = state ?? createDaoState();
    return {
        awakened: Boolean(source.awakened),
        mainDaoId: source.mainDaoId,
        known: Object.fromEntries(Object.entries(source.known).map(([id, progress]) => [id, { ...progress }])),
        domain: { ...source.domain },
        totalInsight: source.totalInsight,
    };
}
export function synchronizeDaoForRealm(state, realmOrder) {
    if (realmOrder < 26) {
        state.awakened = false;
        state.domain.active = false;
        return state;
    }
    state.awakened = true;
    return state;
}
export function discoverDao(state, definition, startingInsight = 0) {
    if (!state.awakened)
        throw new Error('Chỉ khi bước vào Hóa Thần mới có thể chính thức kết Đạo Ý.');
    const existing = state.known[definition.id];
    if (existing)
        return existing;
    const progress = {
        daoId: definition.id,
        depth: Math.min(12, Math.max(1, startingInsight * 0.08 + 3)),
        insight: Math.max(0, startingInsight),
        marks: 0,
        contemplations: 0,
    };
    state.known[definition.id] = progress;
    state.totalInsight += Math.max(0, startingInsight);
    return progress;
}
export function setMainDao(state, daoId) {
    if (!state.awakened)
        throw new Error('Hệ Đạo chưa thức tỉnh.');
    if (!state.known[daoId])
        throw new Error(`Chưa lĩnh ngộ Đạo: ${daoId}`);
    state.mainDaoId = daoId;
    if (state.domain.active && state.domain.daoId !== daoId)
        state.domain.active = false;
}
export function chooseDaoInterpretation(state, definition, interpretationId) {
    const progress = state.known[definition.id];
    if (!progress)
        throw new Error(`Chưa lĩnh ngộ ${definition.name}.`);
    const interpretation = definition.interpretations.find(item => item.id === interpretationId);
    if (!interpretation)
        throw new Error(`Không tồn tại diễn giải ${interpretationId} của ${definition.name}.`);
    progress.interpretationId = interpretationId;
}
export function daoStageName(depth) {
    if (depth < 20)
        return 'Cảm Đạo';
    if (depth < 40)
        return 'Đạo Ý';
    if (depth < 60)
        return 'Đạo Thế';
    if (depth < 80)
        return 'Sơ Thành Đạo Vực';
    return 'Đạo Vực Viên Dung';
}
export function domainAvailable(state) {
    if (!state.mainDaoId)
        return false;
    const progress = state.known[state.mainDaoId];
    return Boolean(progress && progress.depth >= 60 && progress.interpretationId);
}
export function setDaoDomainActive(state, active) {
    if (!active) {
        state.domain.active = false;
        return;
    }
    if (!domainAvailable(state))
        throw new Error('Chủ Đạo cần đạt Sơ Thành Đạo Vực và có diễn giải rõ ràng mới manifest Domain.');
    state.domain.active = true;
    state.domain.daoId = state.mainDaoId;
}
export function previewDaoContemplation(definition, years, soulStrength, matchingTags, insightMultiplier = 1, currentInsight = 0, currentDepth = 0, currentMarks = 0) {
    const elapsed = Math.max(0.1, years);
    const tags = new Set(matchingTags);
    const matches = definition.resonanceTags.filter(tag => tags.has(tag)).length;
    const resonanceMultiplier = 1 + Math.min(0.45, matches * 0.09) + Math.min(0.25, Math.max(0, soulStrength - 100) / 1200);
    const insightGain = elapsed * (2.8 + Math.sqrt(Math.max(0, soulStrength)) * 0.11) * resonanceMultiplier * Math.max(0.1, insightMultiplier);
    const insightAfter = Math.max(0, currentInsight) + insightGain;
    const targetDepth = Math.min(100, 4 + Math.sqrt(insightAfter) * 5.2);
    const depthAfter = Math.max(currentDepth, targetDepth);
    const marksAfter = Math.max(currentMarks, Math.floor(depthAfter / 20));
    return {
        daoId: definition.id,
        years: elapsed,
        insightGain,
        insightAfter,
        depthAfter,
        depthGain: depthAfter - currentDepth,
        marksAfter,
        marksGained: marksAfter - currentMarks,
        resonanceMultiplier,
        domainUnlocked: currentDepth < 60 && depthAfter >= 60,
    };
}
export function contemplateDao(state, definition, years, soulStrength, matchingTags, insightMultiplier = 1) {
    if (!state.awakened)
        throw new Error('Hóa Thần trở lên mới có thể chủ động ngộ Đạo.');
    const progress = state.known[definition.id] ?? discoverDao(state, definition, 0);
    const projection = previewDaoContemplation(definition, years, soulStrength, matchingTags, insightMultiplier, progress.insight, progress.depth, progress.marks);
    progress.insight = projection.insightAfter;
    progress.depth = projection.depthAfter;
    progress.marks = projection.marksAfter;
    progress.contemplations += 1;
    state.totalInsight += projection.insightGain;
    return {
        daoId: definition.id,
        years: projection.years,
        insightGain: projection.insightGain,
        depthGain: projection.depthGain,
        marksGained: projection.marksGained,
        resonanceMultiplier: projection.resonanceMultiplier,
        domainUnlocked: projection.domainUnlocked,
    };
}
function applyModifiers(entity, modifiers) {
    if (!modifiers)
        return entity;
    return {
        ...entity,
        stats: {
            ...entity.stats,
            maxHp: entity.stats.maxHp * (modifiers.maxHpMultiplier ?? 1),
            maxSpirit: entity.stats.maxSpirit * (modifiers.maxSpiritMultiplier ?? 1),
            attack: entity.stats.attack * (modifiers.attackMultiplier ?? 1),
            defense: entity.stats.defense * (modifiers.defenseMultiplier ?? 1),
            mobility: entity.stats.mobility * (modifiers.mobilityMultiplier ?? 1),
            accuracy: entity.stats.accuracy * (modifiers.accuracyMultiplier ?? 1),
            resolve: entity.stats.resolve * (modifiers.resolveMultiplier ?? 1),
            controlPower: entity.stats.controlPower * (modifiers.controlPowerMultiplier ?? 1),
            actionSpeed: entity.stats.actionSpeed * (modifiers.actionSpeedMultiplier ?? 1),
            critChancePct: entity.stats.critChancePct + (modifiers.critChanceFlat ?? 0),
        },
    };
}
export function applyDaoToEntity(entity, state, registry) {
    if (!state.awakened || !state.mainDaoId)
        return entity;
    const progress = state.known[state.mainDaoId];
    if (!progress?.interpretationId)
        return entity;
    const definition = registry.dao(state.mainDaoId);
    const interpretation = definition.interpretations.find(item => item.id === progress.interpretationId);
    if (!interpretation)
        return entity;
    const strength = clamp(progress.depth / 100, 0.15, 1);
    const scaled = (profile) => profile ? {
        maxHpMultiplier: 1 + ((profile.maxHpMultiplier ?? 1) - 1) * strength,
        maxSpiritMultiplier: 1 + ((profile.maxSpiritMultiplier ?? 1) - 1) * strength,
        attackMultiplier: 1 + ((profile.attackMultiplier ?? 1) - 1) * strength,
        defenseMultiplier: 1 + ((profile.defenseMultiplier ?? 1) - 1) * strength,
        mobilityMultiplier: 1 + ((profile.mobilityMultiplier ?? 1) - 1) * strength,
        accuracyMultiplier: 1 + ((profile.accuracyMultiplier ?? 1) - 1) * strength,
        resolveMultiplier: 1 + ((profile.resolveMultiplier ?? 1) - 1) * strength,
        controlPowerMultiplier: 1 + ((profile.controlPowerMultiplier ?? 1) - 1) * strength,
        actionSpeedMultiplier: 1 + ((profile.actionSpeedMultiplier ?? 1) - 1) * strength,
        critChanceFlat: (profile.critChanceFlat ?? 0) * strength,
    } : undefined;
    let resolved = applyModifiers(entity, scaled(interpretation.combat));
    const tags = new Set(resolved.tags);
    tags.add('DaoManifestation');
    for (const tag of definition.tags)
        tags.add(tag);
    for (const tag of interpretation.tags)
        tags.add(tag);
    const triggers = [...(resolved.triggers ?? []), ...(interpretation.grantedTriggers ?? [])];
    if (state.domain.active && state.domain.daoId === state.mainDaoId && progress.depth >= 60) {
        resolved = applyModifiers(resolved, scaled(interpretation.domainCombat));
        triggers.push(...(interpretation.domainTriggers ?? []));
        tags.add('DaoDomain');
    }
    return { ...resolved, tags: [...tags], triggers };
}
//# sourceMappingURL=dao.js.map