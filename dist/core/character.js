import { applyPotentialStats, clonePotentialState, potentialCultivationMultipliers } from './potential.js';
import { applyCorePotentialStats, createLifeCorePotentialState, cloneLifeCorePotentialState } from './reincarnation-progression-v1102.js';
import { cloneBuildFoundationV113, createBuildFoundationV113, elementQualityMultiplier, rootEffectivenessPct } from './build-foundation-v113.js';
import { activeRootOriginIdsFromFoundationV132, applyActiveRootOriginStatsV132 } from './root-origin-combat-v132.js';
import { resolveTechniqueRuntimeV119 } from './technique-runtime-v119.js';
import { applyDaoNatureStatsV125, skillPracticeTierV125 } from './specialization-skill-progression-v125.js';
import { resolveAuthorizedSkillRootBindingsV133 } from './element-seal-v133.js';
import { activeSectManualMechanicsV12310 } from './sect-manual-v12310.js';
import { applyHeartMethodStatsV12317, ensureSkillHeartProgressionV12317 } from './skill-heart-method-v12317.js';
import { combineStatPctV129 } from './combat-rules.js';
function mul(value) {
    return value ?? 1;
}
function add(value) {
    return value ?? 0;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function combineCombat(target, source, strength = 1) {
    if (!source)
        return;
    const blend = (value) => value === undefined ? 1 : 1 + (value - 1) * strength;
    target.maxHpMultiplier = mul(target.maxHpMultiplier) * blend(source.maxHpMultiplier);
    target.maxSpiritMultiplier = mul(target.maxSpiritMultiplier) * blend(source.maxSpiritMultiplier);
    target.attackMultiplier = mul(target.attackMultiplier) * blend(source.attackMultiplier);
    target.defenseMultiplier = mul(target.defenseMultiplier) * blend(source.defenseMultiplier);
    target.mobilityMultiplier = mul(target.mobilityMultiplier) * blend(source.mobilityMultiplier);
    target.accuracyMultiplier = mul(target.accuracyMultiplier) * blend(source.accuracyMultiplier);
    target.resolveMultiplier = mul(target.resolveMultiplier) * blend(source.resolveMultiplier);
    target.controlPowerMultiplier = mul(target.controlPowerMultiplier) * blend(source.controlPowerMultiplier);
    target.actionSpeedMultiplier = mul(target.actionSpeedMultiplier) * blend(source.actionSpeedMultiplier);
    target.critChanceFlat = add(target.critChanceFlat) + add(source.critChanceFlat) * strength;
    target.critPowerPerLayerFlat = add(target.critPowerPerLayerFlat) + add(source.critPowerPerLayerFlat) * strength;
}
function masteryStrength(mastery, floor = 0.68) {
    // v1.03 manuals can start weaker and realize more of their written power through actual study.
    const f = clamp(floor, 0, 1);
    return f + clamp(mastery, 0, 100) / 100 * (1 - f);
}
export function techniqueMasteryStage(mastery) {
    const m = clamp(mastery, 0, 100);
    if (m >= 100)
        return 'Viên Mãn';
    if (m >= 80)
        return 'Đại Thành';
    if (m >= 60)
        return 'Tiểu Thành';
    if (m >= 40)
        return 'Thuần Thục';
    if (m >= 20)
        return 'Nhập Môn';
    return 'Sơ Ngộ';
}
/**
 * V19/V31 canonical rule: the legacy Đạo Lộ/Tu Hệ class system was superseded by
 * Đạo Tính + Chủ/Phụ Bản Đạo. Keep technique.school metadata for old saves/content
 * classification only; it must not grant a hidden runtime multiplier.
 */
function techniqueSchoolSynergy(_def, _state) { return 1; }
function applyCombatModifiers(stats, modifiers) {
    return {
        maxHp: stats.maxHp * mul(modifiers.maxHpMultiplier),
        maxSpirit: stats.maxSpirit * mul(modifiers.maxSpiritMultiplier),
        attack: stats.attack * mul(modifiers.attackMultiplier),
        defense: stats.defense * mul(modifiers.defenseMultiplier),
        mobility: stats.mobility * mul(modifiers.mobilityMultiplier),
        accuracy: stats.accuracy * mul(modifiers.accuracyMultiplier),
        critChancePct: stats.critChancePct + add(modifiers.critChanceFlat),
        critPowerPerLayer: stats.critPowerPerLayer + add(modifiers.critPowerPerLayerFlat),
        controlPower: stats.controlPower * mul(modifiers.controlPowerMultiplier),
        resolve: stats.resolve * mul(modifiers.resolveMultiplier),
        actionSpeed: stats.actionSpeed * mul(modifiers.actionSpeedMultiplier),
    };
}
function applyFateBuildStatsV4(stats, modifiers = {}) {
    const damagePct = Math.max(0, Number(modifiers.damagePct) || 0);
    const maxHpPct = Math.max(0, Number(modifiers.maxHpPct) || 0);
    const defensePct = Math.max(0, Number(modifiers.defensePct) || 0);
    const damageReductionPct = Math.max(0, Number(modifiers.damageReductionPct) || 0);
    let physique = stats.physique;
    let maxHp = stats.maxHp;
    if (maxHpPct > 0) {
        if (Number.isFinite(physique)) { physique = physique * (1 + maxHpPct / 100); maxHp = physique * 20; }
        else maxHp = Math.max(1, Number(maxHp) || 1) * (1 + maxHpPct / 100);
    }
    return { ...stats, attack: Math.max(0, Number(stats.attack) || 0), defense: Math.max(0, Number(stats.defense) || 0) * (1 + defensePct / 100), physique, maxHp, damageReductionPct: combineStatPctV129('damageReductionPct', stats.damageReductionPct ?? 0, damageReductionPct) };
}
export function applyCharacterToEntity(entity, state, registry, techniquePassiveMultiplier = 1, suppressLegacyBirthOrigins = false) {
    const root = registry.spiritualRoot(state.spiritualRootId);
    const modifiers = {};
    const tags = new Set(entity.tags);
    const triggers = [...(entity.triggers ?? [])];
    for (const tag of root.tags)
        tags.add(tag);
    if (!suppressLegacyBirthOrigins)
        combineCombat(modifiers, root.combat);
    // V144: V103/V119 manual combat packages are retired. Keep only a neutral runtime object
    // because CombatKernel modules still import the compatibility helper surface.
    const techniqueRuntimeV119 = resolveTechniqueRuntimeV119(state, id => registry.technique(id));
    if (!suppressLegacyBirthOrigins) {
        for (const id of state.physiqueIds) {
            const physique = registry.characterPhysique(id);
            for (const tag of physique.tags)
                tags.add(tag);
            combineCombat(modifiers, physique.combat);
            triggers.push(...(physique.grantedTriggers ?? []));
        }
        for (const lineage of state.bloodlines) {
            const bloodline = registry.bloodline(lineage.id);
            const strength = clamp(lineage.purity / 100, 0.05, 1);
            for (const tag of bloodline.tags)
                tags.add(tag);
            combineCombat(modifiers, bloodline.combat, strength);
            triggers.push(...(bloodline.grantedTriggers ?? []));
            if (lineage.awakened) {
                combineCombat(modifiers, bloodline.awakenedCombat, strength);
                triggers.push(...(bloodline.awakenedTriggers ?? []));
            }
        }
    }
    // V19/V31 canonical specialization is applied below through buildFoundation/Đạo Tính/Bản Đạo.
    const foundation = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
    const legacyPotentialStats = applyPotentialStats(applyCombatModifiers(entity.stats, modifiers), state.potential);
    let finalStats = applyCorePotentialStats(legacyPotentialStats, state.corePotential);
    finalStats = applyFateBuildStatsV4(finalStats, state.fateModifiersV4);
    const daoNatureApplied = applyDaoNatureStatsV125(finalStats, foundation);
    finalStats = daoNatureApplied.stats;
    finalStats.dodgeChancePct = combineStatPctV129('dodgeChancePct', finalStats.dodgeChancePct ?? 0, techniqueRuntimeV119.staticDodgeFlatPct);
    if ((finalStats.spiritRegenStandardPctPerSecond ?? 0) > 0)
        finalStats.spiritRegenStandardPctPerSecond = (finalStats.spiritRegenStandardPctPerSecond ?? 0) * (1 + techniqueRuntimeV119.staticSpiritRegenPct / 100);
    // Legacy Class 2.0 stat conversions were superseded by V19/V31 and no longer run.
    // v1.32 Căn Nguyên static package is projected from the five active root choices before combat entity creation.
    // Behavioral effects remain in root-origin-combat-v132 and are consumed only by matching Hành actions.
    finalStats = applyActiveRootOriginStatsV132(finalStats, foundation);
    // v1.31 Chất Hành is permanent root progression and only multiplies the elemental component.
    // Materialize all five entries at 0% so later equipment/birth sources can add affinity without losing quality.
    const rootAffinities = { ...(finalStats.elementalAffinities ?? {}) };
    for (const [rootId, element] of [['metal', 'Metal'], ['wood', 'Wood'], ['water', 'Water'], ['fire', 'Fire'], ['earth', 'Earth']]) {
        const current = rootAffinities[element] ?? { pct: 0, evolutionMultiplier: 1 };
        rootAffinities[element] = { pct: current.pct, evolutionMultiplier: Math.max(current.evolutionMultiplier, elementQualityMultiplier(foundation.elementQuality[element])) };
    }
    finalStats.elementalAffinities = rootAffinities;
    // skill.class.* belongs to the superseded Tu Hệ runtime. Preserve knowledge in migrated saves,
    // but never execute those skills in the canonical combat entity.
    const activeCanonicalSkillIds = state.activeSkillIds.filter(id => !id.startsWith('skill.class.'));
    const entityCanonicalSkillIds = entity.skillIds.filter(id => !id.startsWith('skill.class.'));
    const resolvedSkillIds = activeCanonicalSkillIds.length > 0 ? activeCanonicalSkillIds : entityCanonicalSkillIds;
    for (const id of techniqueRuntimeV119.learnedPassiveIds)
        if (!(foundation.learnedDaoPassiveIdsV118 ?? []).includes(id))
            (foundation.learnedDaoPassiveIdsV118 ?? (foundation.learnedDaoPassiveIdsV118 = [])).push(id);
    ensureSkillHeartProgressionV12317(foundation.progressionV125);
    finalStats = applyHeartMethodStatsV12317(finalStats, foundation).stats;
    for (const id of techniqueRuntimeV119.unlockedVariantIds)
        if (!(foundation.unlockedVariantIdsV119 ?? []).includes(id))
            (foundation.unlockedVariantIdsV119 ?? (foundation.unlockedVariantIdsV119 = [])).push(id);
    for (const id of techniqueRuntimeV119.trueMeaningIds)
        if (!(foundation.techniqueTrueMeaningIdsV119 ?? []).includes(id))
            (foundation.techniqueTrueMeaningIdsV119 ?? (foundation.techniqueTrueMeaningIdsV119 = [])).push(id);
    state.buildFoundation = foundation;
    const authorizedRootBindingsV133 = resolveAuthorizedSkillRootBindingsV133(state, id => registry.technique(id), id => registry.skill(id));
    const sectManualMechanicsV12310 = activeSectManualMechanicsV12310(foundation);
    const combatBuildV117 = {
        ...(entity.combatBuildV117 ?? {}),
        rootUnlocked: {
            metal: foundation.roots.metal.unlocked, wood: foundation.roots.wood.unlocked, water: foundation.roots.water.unlocked, fire: foundation.roots.fire.unlocked, earth: foundation.roots.earth.unlocked,
        },
        rootEffectivenessPct: {
            metal: rootEffectivenessPct(foundation.roots.metal.level), wood: rootEffectivenessPct(foundation.roots.wood.level), water: rootEffectivenessPct(foundation.roots.water.level), fire: rootEffectivenessPct(foundation.roots.fire.level), earth: rootEffectivenessPct(foundation.roots.earth.level),
        },
        rootLevelsV133: { metal: foundation.roots.metal.level, wood: foundation.roots.wood.level, water: foundation.roots.water.level, fire: foundation.roots.fire.level, earth: foundation.roots.earth.level },
        activeRootOriginIdsV132: activeRootOriginIdsFromFoundationV132(foundation),
        mainDaoId: foundation.battleDao.mainDaoId,
        secondaryDaoId: foundation.battleDao.secondaryDaoId,
        // V80 integration closure: V79 đã runtime hóa đủ 8 Bản Đạo V2.
        // Bất kỳ nhân vật đã chốt Chủ Đạo nào đều phải bật cùng CombatKernel V2 runtime; không còn ngoại lệ chỉ Kiếm.
        battleDaoV2Enabled: Boolean(foundation.battleDao.mainDaoId),
        activeSetMechanics: [...(entity.combatBuildV117?.activeSetMechanics ?? []), ...sectManualMechanicsV12310],
        skillRootBindingsV118: { ...(entity.combatBuildV117?.skillRootBindingsV118 ?? {}), ...authorizedRootBindingsV133, ...techniqueRuntimeV119.fixedRootBindings },
        learnedDaoPassiveIdsV118: [...new Set([...(foundation.learnedDaoPassiveIdsV118 ?? []), ...techniqueRuntimeV119.learnedPassiveIds])],
        activeVariantIdsV118: [...(foundation.skillLoadout.buildPassiveIds ?? [])],
        techniqueRuntimeV119: techniqueRuntimeV119.runtime,
        skillPracticeTierV125: Object.fromEntries(Object.entries(foundation.progressionV125?.skillPracticeXp ?? {}).map(([id, xp]) => [id, skillPracticeTierV125(xp)])),
        passiveLevelsV125: { ...(foundation.progressionV125?.passiveLevels ?? {}) },
        skillLevelsV12317: { ...(foundation.progressionV125?.skillLevelsV12317 ?? {}) },
        skillGradesV12317: { ...(foundation.progressionV125?.skillGradesV12317 ?? {}) },
        daoNatureBreakBonusPctV125: daoNatureApplied.breakPct,
        daoNatureShieldEffectPctV125: daoNatureApplied.shieldEffectPct,
        fateV4: { ...(state.fateModifiersV4 ?? {}) },
    };
    return {
        ...entity,
        tags: [...tags],
        stats: finalStats,
        skillIds: resolvedSkillIds,
        aiProfile: state.combatAiProfile ? {
            name: state.combatAiProfile.name,
            rules: state.combatAiProfile.rules.filter(rule => !rule.skillId.startsWith('skill.class.')).map(rule => ({ ...rule, conditions: rule.conditions.map(condition => ({ ...condition })) })),
        } : entity.aiProfile,
        triggers,
        combatBuildV117,
    };
}

function cloneStatsV129(stats) {
    return {
        ...stats,
        elementalAffinities: stats.elementalAffinities ? Object.fromEntries(Object.entries(stats.elementalAffinities).map(([k, v]) => [k, { ...v }])) : undefined,
        elementalResistancesPct: stats.elementalResistancesPct ? { ...stats.elementalResistancesPct } : undefined,
    };
}
/**
 * V129 read-only provenance helper.
 * Replays the exact stat-producing portion of applyCharacterToEntity in canonical order,
 * but exposes source boundaries so UI can attribute a final stat to the real owner.
 */
export function characterStatSourceStagesV129(entity, state, registry, techniquePassiveMultiplier = 1, suppressLegacyBirthOrigins = false) {
    let current = { ...entity, stats: cloneStatsV129(entity.stats) };
    const stages = [];
    const push = (id, name, stats, meta = {}) => {
        current = { ...current, stats: cloneStatsV129(stats) };
        stages.push({ id, name, entity: current, meta });
    };
    const root = registry.spiritualRoot(state.spiritualRootId);
    // Linh Căn bẩm sinh (legacy birth roots are intentionally suppressed on authoritative-birth saves).
    let rootStats = current.stats;
    if (!suppressLegacyBirthOrigins && root.combat) {
        const modifiers = {};
        combineCombat(modifiers, root.combat);
        rootStats = applyCombatModifiers(rootStats, modifiers);
    }
    push('character.spiritual_root', 'Linh Căn', rootStats, { sourceId: state.spiritualRootId, suppressed: suppressLegacyBirthOrigins });

    // V144: legacy manual stats remain visible only as a zero-delta provenance marker for migrated saves.
    const techniqueRuntimeV119 = resolveTechniqueRuntimeV119(state, id => registry.technique(id));
    push('character.techniques', 'Công Pháp legacy V103/V119 · đã nghỉ', current.stats, { retired: true });

    // Thể Chất.
    const physiqueModifiers = {};
    if (!suppressLegacyBirthOrigins) {
        for (const id of state.physiqueIds) {
            const physique = registry.characterPhysique(id);
            combineCombat(physiqueModifiers, physique.combat);
        }
    }
    push('character.physique', 'Thể Chất', applyCombatModifiers(current.stats, physiqueModifiers), { sourceIds: [...state.physiqueIds], suppressed: suppressLegacyBirthOrigins });

    // Huyết Mạch.
    const bloodlineModifiers = {};
    if (!suppressLegacyBirthOrigins) {
        for (const lineage of state.bloodlines) {
            const bloodline = registry.bloodline(lineage.id);
            const strength = clamp(lineage.purity / 100, 0.05, 1);
            combineCombat(bloodlineModifiers, bloodline.combat, strength);
            if (lineage.awakened)
                combineCombat(bloodlineModifiers, bloodline.awakenedCombat, strength);
        }
    }
    push('character.bloodline', 'Huyết Mạch', applyCombatModifiers(current.stats, bloodlineModifiers), {
        sources: state.bloodlines.map(x => ({ id: x.id, purity: x.purity, awakened: Boolean(x.awakened) })),
        suppressed: suppressLegacyBirthOrigins,
    });

    // Canonical Chỉ số Gốc / Tiềm Năng V127: only corePotential has live stat impact.
    const afterLegacyPotential = applyPotentialStats(current.stats, state.potential);
    const potentialStats = applyCorePotentialStats(afterLegacyPotential, state.corePotential);
    push('character.potential', 'Tiềm Năng · Chỉ số Gốc', potentialStats, {
        life: { ...(state.corePotential?.life?.allocations ?? {}) },
        permanent: { ...(state.corePotential?.permanent ?? {}) },
    });
    push('character.fate_v4', 'Mệnh Cách', applyFateBuildStatsV4(current.stats, state.fateModifiersV4), { modifiers: { ...(state.fateModifiersV4 ?? {}) } });

    // These stages mirror applyCharacterToEntity() exactly after Potential.
    const foundation = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
    const daoNatureApplied = applyDaoNatureStatsV125(current.stats, foundation);
    push('character.dao_nature', 'Đạo Tính', daoNatureApplied.stats, {
        mainDaoId: foundation.battleDao.mainDaoId,
        secondaryDaoId: foundation.battleDao.secondaryDaoId,
        bonuses: daoNatureApplied.bonuses,
    });

    let techniqueRuntimeStats = cloneStatsV129(current.stats);
    techniqueRuntimeStats.dodgeChancePct = combineStatPctV129('dodgeChancePct', techniqueRuntimeStats.dodgeChancePct ?? 0, techniqueRuntimeV119.staticDodgeFlatPct);
    if ((techniqueRuntimeStats.spiritRegenStandardPctPerSecond ?? 0) > 0)
        techniqueRuntimeStats.spiritRegenStandardPctPerSecond = (techniqueRuntimeStats.spiritRegenStandardPctPerSecond ?? 0) * (1 + techniqueRuntimeV119.staticSpiritRegenPct / 100);
    push('character.technique_runtime', 'Runtime Công Pháp legacy · trung tính', techniqueRuntimeStats, { retired: true,
        dodgeFlatPct: techniqueRuntimeV119.staticDodgeFlatPct,
        spiritRegenPct: techniqueRuntimeV119.staticSpiritRegenPct,
    });

    let rootOriginStats = applyActiveRootOriginStatsV132(current.stats, foundation);
    const rootAffinities = { ...(rootOriginStats.elementalAffinities ?? {}) };
    for (const [rootId, element] of [['metal', 'Metal'], ['wood', 'Wood'], ['water', 'Water'], ['fire', 'Fire'], ['earth', 'Earth']]) {
        const cur = rootAffinities[element] ?? { pct: 0, evolutionMultiplier: 1 };
        rootAffinities[element] = { pct: cur.pct, evolutionMultiplier: Math.max(cur.evolutionMultiplier, elementQualityMultiplier(foundation.elementQuality[element])) };
    }
    rootOriginStats.elementalAffinities = rootAffinities;
    push('character.root_origin', 'Căn Nguyên · Chất Hành', rootOriginStats, {
        activeRootOriginIdsV132: activeRootOriginIdsFromFoundationV132(foundation),
    });

    ensureSkillHeartProgressionV12317(foundation.progressionV125);
    const heartMethodStats = applyHeartMethodStatsV12317(current.stats, foundation);
    push('character.heart_methods', 'Tâm Pháp Bản Đạo', heartMethodStats.stats, {
        mainDaoId: foundation.battleDao.mainDaoId,
        secondaryDaoId: foundation.battleDao.secondaryDaoId,
        staticBonus: heartMethodStats.bonus,
    });

    return stages;
}

export function cloneCharacterSystemState(state) {
    return {
        spiritualRootId: state.spiritualRootId,
        activeTechniqueId: state.activeTechniqueId,
        knownTechniqueIds: [...state.knownTechniqueIds],
        techniqueMastery: { ...state.techniqueMastery },
        equippedTechniqueIds: { inner: state.activeTechniqueId, ...(state.equippedTechniqueIds ?? {}) },
        physiqueIds: [...state.physiqueIds],
        bloodlines: state.bloodlines.map(lineage => ({ ...lineage })),
        knownSkillIds: [...(state.knownSkillIds ?? [])],
        activeSkillIds: [...(state.activeSkillIds ?? [])],
        combatAiProfile: state.combatAiProfile ? {
            name: state.combatAiProfile.name,
            rules: state.combatAiProfile.rules.map(rule => ({ ...rule, conditions: rule.conditions.map(condition => ({ ...condition })) })),
        } : undefined,
        potential: clonePotentialState(state.potential),
        corePotential: state.corePotential ? { life: cloneLifeCorePotentialState(state.corePotential.life), permanent: { ...state.corePotential.permanent } } : { life: createLifeCorePotentialState(), permanent: { power: 0, body: 0, defense: 0 } },
        fateModifiersV4: { ...(state.fateModifiersV4 ?? {}) },
        buildFoundation: (() => { const foundation = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId); foundation.techniqueLoadout = { inner: state.activeTechniqueId, dao: state.equippedTechniqueIds?.art, movement: state.equippedTechniqueIds?.movement, secret: state.equippedTechniqueIds?.secret }; return foundation; })(),
        savedCombatLoadouts: (state.savedCombatLoadouts ?? []).map(loadout => ({
            ...loadout, skillIds: [...loadout.skillIds], artifactIds: [...(loadout.artifactIds ?? [])], legacyArtifactIds: [...(loadout.legacyArtifactIds ?? [])], equipmentIds: { ...loadout.equipmentIds },
            aiProfile: { name: loadout.aiProfile.name, rules: loadout.aiProfile.rules.map(rule => ({ ...rule, conditions: rule.conditions.map(condition => ({ ...condition })) })) },
        })),
    };
}
export function createCharacterSystemState(spiritualRootId = 'root.mixed', techniqueId = 'technique.thunder_meridian', physiqueIds = ['physique.thunder_bones'], bloodlines = []) {
    return {
        spiritualRootId,
        activeTechniqueId: techniqueId,
        knownTechniqueIds: [techniqueId],
        techniqueMastery: { [techniqueId]: 60 },
        equippedTechniqueIds: { inner: techniqueId },
        physiqueIds: [...physiqueIds],
        bloodlines: bloodlines.map(lineage => ({ ...lineage })),
        knownSkillIds: [],
        activeSkillIds: [],
        combatAiProfile: undefined,
        savedCombatLoadouts: [],
        potential: clonePotentialState(),
        corePotential: { life: createLifeCorePotentialState(), permanent: { power: 0, body: 0, defense: 0 } },
        fateModifiersV4: {},
        buildFoundation: (() => { const foundation = createBuildFoundationV113(spiritualRootId); foundation.techniqueLoadout.inner = techniqueId; return foundation; })(),
    };
}
export function learnTechnique(state, techniqueId, startingMastery = 0) {
    if (!state.knownTechniqueIds.includes(techniqueId))
        state.knownTechniqueIds.push(techniqueId);
    state.techniqueMastery[techniqueId] = Math.max(state.techniqueMastery[techniqueId] ?? 0, clamp(startingMastery, 0, 100));
}
export function setActiveTechnique(state, techniqueId) {
    if (!state.knownTechniqueIds.includes(techniqueId))
        throw new Error(`Technique is not known: ${techniqueId}`);
    state.activeTechniqueId = techniqueId;
    state.equippedTechniqueIds = { ...(state.equippedTechniqueIds ?? {}), inner: techniqueId };
    if (state.buildFoundation)
        state.buildFoundation.techniqueLoadout.inner = techniqueId;
}
export function equipTechniqueManual(state, definition) {
    if (!state.knownTechniqueIds.includes(definition.id))
        throw new Error(`Technique is not known: ${definition.id}`);
    const slot = definition.slot ?? 'inner';
    if (slot === 'inner') {
        setActiveTechnique(state, definition.id);
        return;
    }
    state.equippedTechniqueIds = { ...(state.equippedTechniqueIds ?? {}), inner: state.activeTechniqueId, [slot]: definition.id };
    if (state.buildFoundation) {
        const key = slot === 'art' ? 'dao' : slot;
        state.buildFoundation.techniqueLoadout[key] = definition.id;
    }
}
export function equippedTechniqueIds(state) {
    return { inner: state.activeTechniqueId, ...(state.equippedTechniqueIds ?? {}) };
}
export function gainTechniqueMastery(state, years, gainMultiplier = 1) {
    const id = state.activeTechniqueId;
    const before = state.techniqueMastery[id] ?? 0;
    const gain = Math.max(0, years) * (0.28 + (100 - before) / 500) * Math.max(0, gainMultiplier);
    const after = clamp(before + gain, 0, 100);
    state.techniqueMastery[id] = after;
    return after - before;
}
export function awakenBloodline(state, bloodlineId) {
    const lineage = state.bloodlines.find(entry => entry.id === bloodlineId);
    if (!lineage || lineage.awakened)
        return false;
    lineage.awakened = true;
    return true;
}
export function characterTags(state, registry) {
    const tags = new Set();
    for (const tag of registry.spiritualRoot(state.spiritualRootId).tags)
        tags.add(tag);
    for (const tag of registry.technique(state.activeTechniqueId).tags)
        tags.add(tag);
    for (const id of Object.values(state.equippedTechniqueIds ?? {})) {
        if (!id || id === state.activeTechniqueId)
            continue;
        try {
            for (const tag of registry.technique(id).tags)
                tags.add(tag);
        }
        catch { }
    }
    for (const id of state.physiqueIds)
        for (const tag of registry.characterPhysique(id).tags)
            tags.add(tag);
    for (const lineage of state.bloodlines)
        for (const tag of registry.bloodline(lineage.id).tags)
            tags.add(tag);
    return [...tags];
}
export function learnSkill(state, skillId) {
    if (!state.knownSkillIds.includes(skillId))
        state.knownSkillIds.push(skillId);
}
export function setCombatLoadout(state, skillIds, aiProfile) {
    const unique = [...new Set(skillIds)];
    for (const id of unique) {
        if (!state.knownSkillIds.includes(id))
            throw new Error(`Skill is not known: ${id}`);
    }
    const referenced = aiProfile.rules.map(rule => rule.skillId);
    for (const id of referenced) {
        if (!unique.includes(id))
            throw new Error(`AI profile references inactive skill: ${id}`);
    }
    state.activeSkillIds = unique;
    state.combatAiProfile = {
        name: aiProfile.name,
        rules: aiProfile.rules.map(rule => ({ ...rule, conditions: rule.conditions.map(condition => ({ ...condition })) })),
    };
}
//# sourceMappingURL=character.js.map