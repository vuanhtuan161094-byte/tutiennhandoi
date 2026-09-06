export const artifactTiers = {
    0: { tier: 0, name: 'Phàm Bảo', powerMultiplier: 1 },
    1: { tier: 1, name: 'Pháp Bảo', powerMultiplier: 1.7 },
    2: { tier: 2, name: 'Linh Bảo', powerMultiplier: 2.8 },
    3: { tier: 3, name: 'Huyền Bảo', powerMultiplier: 4.6 },
    4: { tier: 4, name: 'Chân Bảo', powerMultiplier: 7.4 },
    5: { tier: 5, name: 'Đạo Bảo', powerMultiplier: 12 },
    6: { tier: 6, name: 'Tiên Bảo', powerMultiplier: 18 },
    7: { tier: 7, name: 'Huyền Tiên Bảo', powerMultiplier: 27 },
    8: { tier: 8, name: 'Kim Tiên Bảo', powerMultiplier: 40 },
    9: { tier: 9, name: 'Thái Ất Tiên Bảo', powerMultiplier: 59 },
    10: { tier: 10, name: 'Đại La Đạo Bảo', powerMultiplier: 86 },
    11: { tier: 11, name: 'Vương Đạo Bảo', powerMultiplier: 125 },
    12: { tier: 12, name: 'Đế Đạo Bảo', powerMultiplier: 182 },
    13: { tier: 13, name: 'Cực Đạo Bảo', powerMultiplier: 265 },
    14: { tier: 14, name: 'Cực Đạo Chân Bảo', powerMultiplier: 390 },
    15: { tier: 15, name: 'Hỗn Độn Chí Bảo', powerMultiplier: 575 },
    16: { tier: 16, name: 'Hồng Mông Chí Bảo', powerMultiplier: 850 },
    17: { tier: 17, name: 'Khai Thiên Thánh Bảo', powerMultiplier: 1260 },
    18: { tier: 18, name: 'Giới Chủ Thần Bảo', powerMultiplier: 1870 },
    19: { tier: 19, name: 'Vĩnh Sinh Bất Diệt Bảo', powerMultiplier: 2780 },
    20: { tier: 20, name: 'Sáng Thế Nguyên Bảo', powerMultiplier: 4140 },
};
const qualityMultipliers = {
    low: 0.86,
    mid: 1,
    high: 1.18,
    supreme: 1.38,
    perfect: 1.62,
};
const qualityNames = {
    low: 'Hạ Phẩm',
    mid: 'Trung Phẩm',
    high: 'Thượng Phẩm',
    supreme: 'Cực Phẩm',
    perfect: 'Hoàn Mỹ',
};
export function artifactTierName(tier) {
    return artifactTiers[tier]?.name ?? `Tier ${tier}`;
}
export function artifactQualityName(quality) {
    return qualityNames[quality];
}
export function createArtifactState(activeCapacity = 1) {
    return { items: [], activeIds: [], activeCapacity, discoveredResonanceIds: [] };
}
function cloneTrigger(trigger, idSuffix = '') {
    return {
        ...trigger,
        id: `${trigger.id}${idSuffix}`,
        sourceTags: trigger.sourceTags ? [...trigger.sourceTags] : undefined,
        effects: trigger.effects.map(effect => ({ ...effect })),
    };
}
export function cloneArtifactInstance(item) {
    return {
        ...item,
        stats: { ...item.stats },
        tags: [...item.tags],
        source: { ...item.source },
        spirit: { ...item.spirit },
        history: {
            ...item.history,
            ownerLifeIds: [...item.history.ownerLifeIds],
            majorEvents: item.history.majorEvents.map(event => ({ ...event })),
        },
    };
}
export function cloneArtifactState(state) {
    return {
        items: state.items.map(cloneArtifactInstance),
        activeIds: [...state.activeIds],
        activeCapacity: state.activeCapacity,
        discoveredResonanceIds: [...state.discoveredResonanceIds],
    };
}
function scaleStat(value, multiplier) {
    return Math.round(value * multiplier * 1000) / 1000;
}
export function buildArtifactInstance(template, tier, quality, floor, source, acquiredWorldYear, ownerLifeId) {
    const tierDef = artifactTiers[tier];
    if (!tierDef)
        throw new Error(`Unknown artifact tier: ${tier}`);
    const floorMultiplier = 1 + Math.max(0, floor - 1) * 0.06;
    const multiplier = tierDef.powerMultiplier * qualityMultipliers[quality] * floorMultiplier;
    const stats = {};
    for (const [key, value] of Object.entries(template.baseStats ?? {})) {
        if (value === undefined)
            continue;
        stats[key] = scaleStat(value, multiplier);
    }
    const itemLevel = tier * 100 + floor * 10 + Math.round(qualityMultipliers[quality] * 10);
    return {
        id: `artifact.${source.kind}.${source.dungeonId ?? source.sourceLifeId ?? 'unknown'}.${floor}.${source.seed}.${template.id}`,
        templateId: template.id,
        name: `${qualityNames[quality]} ${tierDef.name} · ${template.name}`,
        tier,
        quality,
        itemLevel,
        stats,
        tags: [...template.tags],
        resonanceId: template.resonanceId,
        source: { ...source },
        acquiredWorldYear,
        nourishmentExp: 0,
        nourishmentStage: 0,
        spirit: { state: 'dormant' },
        history: {
            yearsOwned: 0,
            battles: 0,
            victories: 0,
            tribulations: 0,
            ownerLifeIds: ownerLifeId ? [ownerLifeId] : [],
            majorEvents: [{
                    worldYear: acquiredWorldYear,
                    type: 'acquired',
                    summary: `Được thu nhận vào năm ${Math.round(acquiredWorldYear)}.`,
                    significance: 8,
                }],
        },
    };
}
export function addArtifact(state, item) {
    if (state.items.some(existing => existing.id === item.id))
        throw new Error(`Duplicate artifact instance: ${item.id}`);
    state.items.push(cloneArtifactInstance(item));
}
export function activateArtifact(state, artifactId) {
    if (!state.items.some(item => item.id === artifactId))
        throw new Error(`Unknown artifact instance: ${artifactId}`);
    if (state.activeIds.includes(artifactId))
        return;
    if (state.activeIds.length >= state.activeCapacity)
        throw new Error(`No free artifact slot: ${state.activeIds.length}/${state.activeCapacity}`);
    state.activeIds.push(artifactId);
}
export function deactivateArtifact(state, artifactId) {
    state.activeIds = state.activeIds.filter(id => id !== artifactId);
}
export function activeArtifacts(state) {
    return state.activeIds
        .map(id => state.items.find(item => item.id === id))
        .filter((item) => Boolean(item));
}
function addPartialStats(target, source, multiplier = 1) {
    for (const [key, value] of Object.entries(source)) {
        if (value === undefined)
            continue;
        target[key] = ((target[key] ?? 0) + value * multiplier);
    }
}
export function artifactPower(state, templates, resonances) {
    const flatStats = {};
    const statMultipliers = {};
    const triggers = [];
    const grantedTags = [];
    const resonanceCounts = new Map();
    for (const item of activeArtifacts(state)) {
        const template = templates.get(item.templateId);
        if (!template)
            continue;
        const nourishmentMultiplier = 1 + item.nourishmentStage * 0.08;
        const spiritMultiplier = item.spirit.state === 'awakened' ? 1.10 : 1;
        addPartialStats(flatStats, item.stats, nourishmentMultiplier * spiritMultiplier);
        for (const trigger of template.triggers ?? [])
            triggers.push(cloneTrigger(trigger, ` [${item.id}]`));
        if (item.spirit.state === 'awakened') {
            grantedTags.push('ArtifactSpirit');
            for (const trigger of template.awakenedTriggers ?? [])
                triggers.push(cloneTrigger(trigger, ` [Khí Linh:${item.id}]`));
        }
        if (item.resonanceId)
            resonanceCounts.set(item.resonanceId, (resonanceCounts.get(item.resonanceId) ?? 0) + 1);
    }
    const activeResonances = [];
    for (const [resonanceId, pieces] of resonanceCounts.entries()) {
        const resonance = resonances.get(resonanceId);
        if (!resonance)
            continue;
        const activeBonuses = [];
        for (const bonus of [...resonance.bonuses].sort((a, b) => a.pieces - b.pieces)) {
            if (pieces < bonus.pieces)
                continue;
            activeBonuses.push(`${bonus.pieces} bảo: ${bonus.name}`);
            if (bonus.flatStats)
                addPartialStats(flatStats, bonus.flatStats);
            if (bonus.statMultipliers)
                addPartialStats(statMultipliers, bonus.statMultipliers);
            for (const trigger of bonus.triggers ?? [])
                triggers.push(cloneTrigger(trigger, ` [Cộng Hưởng:${resonanceId}]`));
            if (bonus.grantedTags)
                grantedTags.push(...bonus.grantedTags);
        }
        if (activeBonuses.length > 0) {
            activeResonances.push({
                resonanceId,
                resonanceName: resonance.name,
                pieces,
                activeBonuses,
                hidden: Boolean(resonance.hidden),
            });
        }
    }
    return {
        flatStats,
        statMultipliers,
        triggers,
        grantedTags: [...new Set(grantedTags)],
        activeResonances,
    };
}
export function applyArtifactsToEntity(base, state, templates, resonances) {
    const power = artifactPower(state, templates, resonances);
    const stats = { ...base.stats };
    // NumericStatKey is a compile-time convenience; Stats also contains nested maps (Ngũ Hành, CDR...).
    // Never coerce those objects through arithmetic or later combat layers silently lose them.
    for (const key of Object.keys(stats)) {
        const current = stats[key];
        if (typeof current !== 'number')
            continue;
        const flat = power.flatStats[key] ?? 0;
        const multiplier = power.statMultipliers[key] ?? 0;
        stats[key] = Math.max(0, (current + flat) * (1 + multiplier));
    }
    return {
        ...base,
        tags: [...new Set([...base.tags, ...power.grantedTags])],
        stats,
        triggers: [...(base.triggers ?? []), ...power.triggers],
    };
}
const NOURISHMENT_THRESHOLDS = [0, 100, 260, 560, 1050, 1800];
export function nourishmentStageFor(exp) {
    let stage = 0;
    for (let i = 1; i < NOURISHMENT_THRESHOLDS.length; i++) {
        if (exp >= NOURISHMENT_THRESHOLDS[i])
            stage = i;
    }
    return stage;
}
export function nourishArtifact(item, essenceUnits) {
    const units = Math.max(0, Math.floor(essenceUnits));
    const beforeStage = item.nourishmentStage;
    const expGained = units * 12;
    item.nourishmentExp += expGained;
    item.nourishmentStage = nourishmentStageFor(item.nourishmentExp);
    if (item.nourishmentStage >= 2 && item.spirit.state === 'dormant')
        item.spirit.state = 'stirring';
    return { beforeStage, afterStage: item.nourishmentStage, expGained };
}
export function canAwakenArtifactSpirit(item) {
    return item.spirit.state !== 'awakened' && item.nourishmentStage >= 3 && item.history.battles >= 5;
}
export function awakenArtifactSpirit(item, worldYear, spiritName) {
    if (!canAwakenArtifactSpirit(item))
        throw new Error('Artifact spirit awakening requirements are not met');
    item.spirit = { state: 'awakened', name: spiritName ?? `${item.name} · Khí Linh`, awakenedWorldYear: worldYear };
    item.history.majorEvents.push({
        worldYear,
        type: 'awakening',
        summary: `Khí Linh thức tỉnh trong ${item.name}.`,
        significance: 32,
    });
}
export function recordArtifactOwnershipYears(state, years, ownedArtifactIds) {
    const safe = Math.max(0, years);
    if (safe <= 0)
        return;
    for (const item of state.items) {
        if (ownedArtifactIds && !ownedArtifactIds.has(item.id))
            continue;
        item.history.yearsOwned += safe;
    }
}
export function recordActiveArtifactBattle(state, won, worldYear, opponentName, ownerLifeId) {
    for (const item of activeArtifacts(state)) {
        item.history.battles += 1;
        if (won)
            item.history.victories += 1;
        if (ownerLifeId && !item.history.ownerLifeIds.includes(ownerLifeId))
            item.history.ownerLifeIds.push(ownerLifeId);
        if (won && (item.history.victories === 1 || item.history.victories % 25 === 0)) {
            item.history.majorEvents.push({
                worldYear,
                type: 'battle',
                summary: `${item.name} cùng chủ nhân đánh bại ${opponentName}.`,
                significance: item.history.victories === 1 ? 12 : 18,
            });
        }
    }
}
export function artifactLegacyScore(item) {
    return item.itemLevel
        + item.nourishmentStage * 35
        + item.history.battles * 2
        + item.history.tribulations * 45
        + (item.spirit.state === 'awakened' ? 180 : item.spirit.state === 'stirring' ? 40 : 0);
}
export function markArtifactLost(item, worldYear) {
    item.history.majorEvents.push({
        worldYear,
        type: 'lost',
        summary: `${item.name} thất lạc sau khi chủ nhân kết thúc một đời.`,
        significance: 25,
    });
}
export function markArtifactRecovered(item, worldYear, lifeId) {
    if (!item.history.ownerLifeIds.includes(lifeId))
        item.history.ownerLifeIds.push(lifeId);
    item.history.majorEvents.push({
        worldYear,
        type: 'recovered',
        summary: `${item.name} được chủ nhân chuyển thế tìm lại.`,
        significance: 38,
    });
}
//# sourceMappingURL=artifact.js.map