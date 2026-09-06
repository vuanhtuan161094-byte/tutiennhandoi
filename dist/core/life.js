import { SeededRng } from './rng.js';
import { createEquipmentState } from './equipment.js';
import { cloneArtifactInstance, createArtifactState } from './artifact.js';
import { createInventoryManagementState } from './inventory.js';
import { createProfessionState, unlockEligibleProfessionRecipes } from './profession.js';
import { characterTags, createCharacterSystemState } from './character.js';
import { cloneSocialState, createSocialState } from './social.js';
import { cloneFactionState } from './faction.js';
import { cloneEconomyState } from './economy.js';
import { cloneGuidanceState } from './guidance.js';
import { createSoulState } from './soul.js';
import { createDaoState } from './dao.js';
import { createTribulationState } from './tribulation.js';
import { createImmortalState } from './immortal.js';
import { createPlayerFlowState } from './player-flow.js';
import { createFateEmbryoState, emptyMingJiDomains, normalizeMingJiDomains } from './fate-embryo.js';
import { addReincarnationLegacyGain, cloneReincarnationInheritance, cloneReincarnationMasteryState, createReincarnationMasteryState, karmaInheritanceSlotsForSeal, boundRelicSlotsForSeal, birthPreviewCountForSeal, reincarnationOrientations } from './reincarnation.js';
import { cloneReincarnationTalentState, commitPendingMajorTalents, createReincarnationTalentState, grantReincarnationTalentPoints, syncReincarnationTalentsToOrigins, talentPointsFromLife } from './reincarnation-talents.js';
import { applyMajorLifeOpeningBoon } from './reincarnation-diversity.js';
import { writeBirthModifiersToOrigins } from './birth-randomness.js';
import { bundleSummaryLines, derivedAptitude, derivedLuck, legacyTalentRoll, rollBirthOriginBundle } from './birth-origins-v101.js';
import { cloneFateRuntimeState, createFateRuntimeState } from './fate-runtime-v102.js';
import { cloneEndlessMetaProgress, createEndlessHuntState, createEndlessMetaProgress } from './endless-hunt.js';
import { cloneReincarnationProgressStateV1102, createReincarnationProgressStateV1102, ensureLifePotentialForRealm, nodeModifierValue, syncReincarnationTreeRuntimeOriginsV136 } from './reincarnation-progression-v1102.js';
import { inheritBuildFoundationOnReincarnationV113 } from './build-foundation-v113.js';
import { cloneCollectionProgressStateV12316 } from './collection-progression-v12316.js';
import { cleanCultivationStateV140 } from './cultivation-v140.js';
const CATEGORY_ORDER = [
    'cultivation', 'combat', 'exploration', 'profession', 'relationships', 'fate',
];
const CATEGORY_NAMES = {
    cultivation: 'Tu Hành',
    combat: 'Chiến Đấu',
    exploration: 'Khám Phá',
    profession: 'Nghề/Năng Lực',
    relationships: 'Quan Hệ',
    fate: 'Nghịch Mệnh',
};
function round2(value) {
    return Math.round(value * 100) / 100;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function categoryFor(event) {
    if (event.tags.includes('WorldNews') || event.tags.includes('WorldSimulation'))
        return undefined;
    if (event.type === 'breakthrough' || event.type === 'cultivation')
        return 'cultivation';
    if (event.type === 'combat' || (event.type === 'injury' && event.tags.includes('Hunt')) || (event.type === 'dungeon' && event.tags.includes('Challenge')))
        return 'combat';
    if (event.type === 'crafting')
        return 'profession';
    if (event.type === 'exploration' || event.type === 'travel')
        return 'exploration';
    if (event.type === 'resource')
        return 'exploration';
    if (event.tags.includes('Artifact'))
        return 'profession';
    if (event.type === 'dungeon') {
        if (event.tags.some(tag => ['alchemy', 'forging', 'artifact', 'beast', 'talisman'].includes(tag)))
            return 'profession';
        if (event.tags.includes('soul'))
            return 'cultivation';
        if (event.tags.includes('cultivation'))
            return 'cultivation';
        return 'profession';
    }
    if (event.tags.some(tag => ['Relationship', 'DaoCompanion', 'Master', 'Disciple', 'Family'].includes(tag)))
        return 'relationships';
    if (event.tags.some(tag => ['Fate', 'CrossRealm', 'Record', 'Hidden', 'NghịchMệnh', 'strongSuccess'].includes(tag)))
        return 'fate';
    return undefined;
}
function eventMatchesCategory(category, event) {
    if (event.tags.includes('WorldNews') || event.tags.includes('WorldSimulation'))
        return false;
    if (categoryFor(event) === category)
        return true;
    if (category === 'fate' && event.tags.some(tag => ['Fate', 'CrossRealm', 'Record', 'Hidden', 'Legendary', 'Unique', 'NghịchMệnh', 'strongSuccess'].includes(tag)))
        return true;
    if (category === 'relationships' && event.tags.some(tag => ['Relationship', 'DaoCompanion', 'Master', 'Disciple', 'Family'].includes(tag)))
        return true;
    return false;
}
function milestoneSignature(category, event) {
    const data = event.data ?? {};
    if (event.type === 'breakthrough')
        return `${category}:breakthrough:${String(data.toRealmId ?? event.tags.at(-1) ?? 'unknown')}`;
    if (event.type === 'combat')
        return `${category}:combat:${String(data.enemyId ?? event.targetId ?? event.tags.find(tag => tag !== 'Hunt' && tag !== 'Victory') ?? 'generic')}:${event.tags.includes('Victory') ? 'win' : 'other'}`;
    if (event.type === 'travel' || event.type === 'exploration')
        return `${category}:${event.type}:${String(data.discoveredLocationId ?? data.to ?? event.locationId ?? 'unknown')}`;
    if (event.type === 'crafting')
        return `${category}:craft:${String(data.recipeId ?? 'unknown')}`;
    if (event.type === 'dungeon')
        return `${category}:dungeon:${String(data.dungeonId ?? 'unknown')}:floor:${String(data.floor ?? 0)}:${event.tags.includes('FirstClear') ? 'first' : event.tags.includes('Challenge') ? 'challenge' : 'farm'}:${event.tags.find(tag => ['cultivation', 'alchemy', 'forging', 'artifact', 'beast', 'talisman', 'soul'].includes(tag)) ?? 'other'}`;
    if (event.type === 'resource')
        return `${category}:resource:${String(data.resourceId ?? 'unknown')}`;
    return `${category}:${event.type}:${event.tags.slice(0, 3).join('|')}`;
}
function eventValue(event) {
    // Significance is already contextual; this mild super-linear term lets genuinely historic events
    // stand above routine milestones without allowing raw counters to inflate score.
    return event.significance * (1 + Math.log2(1 + Math.max(0, event.significance)) / 10);
}
function scoreEvents(category, events) {
    const bestByMilestone = new Map();
    for (const event of events) {
        if (!eventMatchesCategory(category, event))
            continue;
        if (event.tags.includes('LifeEnd'))
            continue;
        const signature = milestoneSignature(category, event);
        const value = eventValue(event);
        const current = bestByMilestone.get(signature);
        if (!current || value > current.value)
            bestByMilestone.set(signature, { value, event });
    }
    const values = [...bestByMilestone.values()].sort((a, b) => b.value - a.value);
    const weights = [1, 0.62, 0.42, 0.3, 0.22, 0.17, 0.13, 0.1];
    let score = 0;
    for (let i = 0; i < Math.min(values.length, weights.length); i++)
        score += values[i].value * weights[i];
    // Breadth is useful but deliberately tiny compared with peak achievements.
    score += Math.min(10, values.length) * 2;
    return {
        category,
        score: Math.round(score),
        peakEventScore: Math.round(values[0]?.value ?? 0),
        uniqueMilestones: values.length,
        reasons: values.slice(0, 3).map(item => item.event.message),
    };
}
function gradeFor(score) {
    if (score >= 1800)
        return 'SSS';
    if (score >= 1200)
        return 'SS';
    if (score >= 760)
        return 'S';
    if (score >= 460)
        return 'A';
    if (score >= 260)
        return 'B';
    if (score >= 120)
        return 'C';
    return 'D';
}
function cpFromScore(score) {
    if (score <= 0)
        return 5;
    // Sub-linear by design: life score can expand with future content without making CP inflate 1:1.
    return 5 + Math.round(28 * Math.pow(score / 250, 0.62));
}
function cpRareBonus(events) {
    const signatures = new Set();
    for (const event of events) {
        if (event.tags.includes('WorldNews') || event.tags.includes('WorldSimulation'))
            continue;
        for (const tag of ['CrossRealm', 'Record', 'Hidden', 'Legendary', 'Unique']) {
            if (event.tags.includes(tag))
                signatures.add(`${tag}:${milestoneSignature('fate', event)}`);
        }
    }
    return Math.min(30, signatures.size * 3);
}
function deathCause(events) {
    const death = [...events].reverse().find(event => event.tags.includes('LifeEnd'));
    if (!death)
        return 'Không rõ';
    if (death.tags.includes('NaturalDeath'))
        return 'Thọ tận';
    if (death.tags.includes('CombatDeath'))
        return 'Chiến tử';
    return death.message;
}
function chronicleFrom(events, maxEntries = 16) {
    const candidates = events.filter(event => {
        if (event.tags.includes('WorldNews') || event.tags.includes('WorldSimulation'))
            return false;
        if (event.tags.includes('LifeEnd'))
            return true;
        if (event.type === 'breakthrough')
            return true;
        if (event.significance >= 20)
            return true;
        if ((event.type === 'exploration' || event.type === 'travel') && event.tags.includes('Discovery'))
            return true;
        return false;
    });
    const bySignature = new Map();
    for (const event of candidates) {
        const category = categoryFor(event) ?? 'fate';
        const signature = event.tags.includes('LifeEnd') ? `lifeEnd:${event.id}` : milestoneSignature(category, event);
        const existing = bySignature.get(signature);
        if (!existing || event.significance > existing.significance)
            bySignature.set(signature, event);
    }
    const deduped = [...bySignature.values()];
    const mandatory = deduped.filter(event => event.type === 'breakthrough' || event.tags.includes('LifeEnd'));
    const remaining = deduped
        .filter(event => !mandatory.includes(event))
        .sort((a, b) => b.significance - a.significance)
        .slice(0, Math.max(0, maxEntries - mandatory.length));
    return [...mandatory, ...remaining]
        .sort((a, b) => a.ageYears - b.ageYears || a.worldTimeYears - b.worldTimeYears)
        .slice(-maxEntries)
        .map(event => ({
        ageYears: event.ageYears,
        worldTimeYears: event.worldTimeYears,
        eventId: event.id,
        text: event.message,
        significance: event.significance,
    }));
}
function legacyFrom(lifeId, lifeNumber, events) {
    const event = events
        .filter(candidate => !candidate.tags.includes('LifeEnd'))
        .filter(candidate => !candidate.tags.includes('WorldNews') && !candidate.tags.includes('WorldSimulation'))
        .sort((a, b) => b.significance - a.significance || b.worldTimeYears - a.worldTimeYears)[0];
    if (!event || event.significance < 12)
        return undefined;
    return {
        id: `legacy.${lifeId}`,
        sourceLifeId: lifeId,
        sourceEventId: event.id,
        title: `Dấu Ấn Đời Thứ ${lifeNumber}`,
        summary: event.message,
        significance: event.significance,
    };
}
function originGains(state, profile, categories, events, registry) {
    const gains = [];
    const totalTuViGain = events.reduce((sum, event) => {
        const gain = typeof event.data?.tuViGain === 'number' ? Math.max(0, event.data.tuViGain) : 0;
        return sum + gain;
    }, 0);
    const cultivationValue = state.realm.maxRealmOrder * 0.09
        + Math.log10(1 + totalTuViGain) * 0.18
        + categories.cultivation.score * 0.0015;
    if (cultivationValue > 0)
        gains.push({
            key: 'origin.cultivation', name: 'Tu Hành Căn Nguyên', value: round2(cultivationValue),
            reason: `Cảnh giới cao nhất bậc ${state.realm.maxRealmOrder}; tiến độ tu hành đời này đã được ghi nhận.`,
        });
    const bodyCondition = Math.max(0, 100 - Math.max(0, Number(state.injury) || 0));
    const bodyValue = bodyCondition / 100 * 0.47;
    gains.push({ key: 'origin.body', name: 'Thể Căn Nguyên', value: round2(bodyValue), reason: `Trạng thái thân thể cuối đời ${bodyCondition.toFixed(0)}/100.` });
    const combatBase = categories.combat.score * 0.004;
    if (combatBase > 0) {
        const tags = new Set([...profile.combatEntity.tags, ...characterTags(state.character, registry)]);
        if (tags.has('Sword'))
            gains.push({ key: 'origin.sword', name: 'Kiếm Căn Nguyên', value: round2(combatBase), reason: 'Chiến tích đời này chủ yếu được tạo bằng Kiếm đạo/kiếm kỹ.' });
        if (tags.has('Lightning'))
            gains.push({ key: 'origin.lightning', name: 'Lôi Căn Nguyên', value: round2(combatBase * 0.85), reason: 'Lôi pháp được sử dụng xuyên suốt chiến đấu của đời này.' });
        if (!tags.has('Sword') && !tags.has('Lightning'))
            gains.push({ key: 'origin.combat', name: 'Chiến Căn Nguyên', value: round2(combatBase), reason: 'Tích lũy thực chiến của đời này.' });
    }
    for (const progress of Object.values(state.dao.known ?? {})) {
        if (progress.depth < 8)
            continue;
        const definition = registry.dao(progress.daoId);
        const value = round2(progress.depth * 0.008 + progress.marks * 0.09 + Math.sqrt(Math.max(0, progress.insight)) * 0.015);
        if (value > 0)
            gains.push({ key: `origin.dao.${progress.daoId}`, name: `${definition.name} Căn Nguyên`, value, reason: `${definition.name} đạt depth ${progress.depth.toFixed(1)}, ${progress.marks} Đạo Ngân.` });
    }
    // Named late realms do not erase the reincarnation economy. Deep upper-immortal
    // practice becomes a separate Căn Nguyên axis, while a new life still has to
    // rebuild its active ImmortalState before expressing that accumulated depth.
    if (state.realm.maxRealmOrder >= 62) {
        const im = state.immortal;
        const refinementWeight = im.mysticRefinements + im.goldenRefinements + im.taiyiRefinements + im.grandLuoRefinements + im.kingRefinements + im.emperorRefinements + im.extremityRefinements;
        const authorityWeight = (im.mysticLawWeave + im.goldenImmortalSeal + im.taiyiEpochRiver + im.grandLuoDaoFruit + im.kingDomainAuthority + im.emperorMandate) / 600;
        const apexValue = round2(Math.max(0, (state.realm.maxRealmOrder - 61) * 0.055 + Math.sqrt(Math.max(0, refinementWeight)) * 0.045 + authorityWeight * 0.7 + im.extremityLayers * 0.32));
        if (apexValue > 0)
            gains.push({ key: 'origin.apex', name: 'Cực Đạo Căn Nguyên', value: apexValue, reason: `Thượng Tiên bậc ${state.realm.maxRealmOrder}; ${refinementWeight} lượt tinh luyện; ${im.extremityLayers} lớp Phá Cực.` });
    }
    // Beyond the old Extremity boundary, creation-scale practice becomes a second
    // permanent origin axis. Reincarnation preserves the earned depth, never the
    // active post-apex realm/state itself.
    if (state.realm.maxRealmOrder >= 90) {
        const im = state.immortal;
        const transcendentRefinements = im.supremeDaoRefinements + im.chaosRefinements + im.hongmengRefinements + im.heavenOpeningRefinements + im.worldLordRefinements + im.eternityRefinements + im.creationRefinements;
        const creationAuthority = (im.supremeDaoCore + im.chaosAffinity + im.hongmengSeed + im.heavenOpeningAuthority + im.worldCore + im.eternityAnchor + im.genesisAuthority) / 700;
        const genesisValue = round2(Math.max(0, (state.realm.maxRealmOrder - 89) * 0.065
            + Math.sqrt(Math.max(0, transcendentRefinements)) * 0.055
            + creationAuthority * 0.9
            + im.creationEpochs * 0.75
            + Math.log2(1 + Math.max(0, im.creationEpochAuthority)) * 0.08));
        if (genesisValue > 0)
            gains.push({ key: 'origin.genesis', name: 'Sáng Thế Căn Nguyên', value: genesisValue, reason: `Hậu Cực Đạo bậc ${state.realm.maxRealmOrder}; ${transcendentRefinements} lượt tinh luyện; ${im.creationEpochs} Kỷ Nguyên Sáng Thế.` });
    }
    const professionValue = categories.profession.score * 0.0025;
    if (professionValue > 0.01)
        gains.push({ key: 'origin.profession', name: 'Bách Nghệ Căn Nguyên', value: round2(professionValue), reason: 'Tích lũy từ các phó bản/nghề nghiệp khác nhau.' });
    return gains.filter(gain => gain.value > 0);
}
function mingJiGainsForLife(state, totalScore, origins) {
    const domains = emptyMingJiDomains();
    // No prestige from throwaway lives: there must be a meaningful score or actual realm progress.
    const achievementFactor = clamp((totalScore - 80) / 520, 0, 1.25) * clamp(0.35 + state.realm.maxRealmOrder / 120, 0.35, 1.35);
    if (achievementFactor <= 0)
        return { total: 0, domains };
    const origin = (key) => origins.filter(g => g.key === key || g.key.startsWith(key + '.')).reduce((a, g) => a + g.value, 0);
    const daoDepth = Object.values(state.dao.known ?? {}).reduce((m, p) => Math.max(m, p.depth), 0);
    const techMastery = Math.max(0, ...Object.values(state.character.techniqueMastery ?? {}));
    const bloodPurity = Math.max(0, ...state.character.bloodlines.map(b => b.purity));
    const artifactMaturity = state.artifacts.items.reduce((m, a) => Math.max(m, a.nourishmentStage * 18 + Math.min(28, a.history.yearsOwned * 0.6)), 0);
    domains.body = round2((origin('origin.body') * 5 + Math.max(0, 100 - state.injury) * 0.010) * achievementFactor);
    domains.soul = round2(((state.soul.awakened ? (state.soul.strength + state.soul.purity) / 45 : 0) + state.soul.clones.length * 0.45) * achievementFactor);
    domains.dao = round2((origin('origin.dao') * 5 + daoDepth * 0.018) * achievementFactor);
    domains.technique = round2((origin('origin.cultivation') * 2.2 + techMastery * 0.016) * achievementFactor);
    domains.bloodline = round2((bloodPurity * 0.018) * achievementFactor);
    domains.artifact = round2((artifactMaturity * 0.020) * achievementFactor);
    domains.chaos = round2((origin('origin.apex') * 4 + (state.immortal.chaosAffinity + state.immortal.chaosBody) * 0.012) * achievementFactor);
    domains.creation = round2((origin('origin.genesis') * 5 + (state.immortal.creationEpochs * 1.4) + (state.immortal.genesisAuthority * 0.012)) * achievementFactor);
    const raw = Object.values(domains).reduce((a, b) => a + b, 0);
    return { total: round2(raw), domains };
}
function reincarnationLegacyForLife(state, life, totalScore, mingJiGain, events) {
    const meaningful = totalScore >= 120 || state.realm.maxRealmOrder >= 3 || mingJiGain >= 1;
    if (!meaningful)
        return { xp: 0, effective: false };
    const uniqueMilestones = new Set(events.filter(e => e.significance >= 10 && !e.tags.includes('WorldNews')).map(e => milestoneSignature(categoryFor(e) ?? 'fate', e))).size;
    const xp = Math.max(1, Math.round(Math.pow(Math.max(1, totalScore), 0.64) * 2.1 + state.realm.maxRealmOrder * 1.9 + Math.min(80, uniqueMilestones * 2.2) + mingJiGain * 1.4));
    const mainDaoId = state.dao.mainDaoId;
    const mainDao = mainDaoId ? state.dao.known[mainDaoId] : undefined;
    const daoSeed = mainDaoId && mainDao && mainDao.depth >= 35 ? {
        id: `dao-seed.${life.lifeId}.${mainDaoId}`, daoId: mainDaoId, sourceLifeId: life.lifeId, sourceLifeNumber: life.lifeNumber,
        strength: round2(clamp(mainDao.depth * 0.72 + mainDao.marks * 4, 1, 100)),
    } : undefined;
    const bestArtifact = state.artifacts.items.slice().sort((a, b) => (b.tier * 100 + b.nourishmentStage * 10 + b.itemLevel) - (a.tier * 100 + a.nourishmentStage * 10 + a.itemLevel))[0];
    const npcIds = Object.values(state.worldSimulation.playerRelationships ?? {}).filter(r => r.lifeId === life.lifeId && r.met).sort((a, b) => b.karmaDepth - a.karmaDepth).slice(0, 3).map(r => r.npcId);
    const memoryArchive = {
        id: `memory.${life.lifeId}`, sourceLifeId: life.lifeId, sourceLifeNumber: life.lifeNumber, title: `Ký Ức Đời ${life.lifeNumber}`, maxRealmOrder: state.realm.maxRealmOrder,
        techniqueId: state.character.activeTechniqueId, daoId: mainDaoId, artifactId: bestArtifact?.id, npcIds,
    };
    return { xp, effective: true, daoSeed, memoryArchive };
}
export function createMetaProgressState() {
    return {
        currentCp: 0,
        lifetimeCpEarned: 0,
        lifetimeCpSpent: 0,
        totalLifeScore: 0,
        completedLives: 0,
        origins: {},
        archives: [],
        legacies: [],
        artifactRelics: [],
        mingJi: 0,
        mingJiDomains: emptyMingJiDomains(),
        reincarnation: createReincarnationMasteryState(),
        talents: createReincarnationTalentState(),
        endless: createEndlessMetaProgress(),
        reincarnationProgress: createReincarnationProgressStateV1102(),
    };
}
export function cloneMetaProgressState(meta) {
    return {
        ...meta,
        origins: { ...meta.origins },
        archives: meta.archives.map(archive => ({
            ...archive,
            categories: Object.fromEntries(Object.entries(archive.categories).map(([key, value]) => [key, { ...value, reasons: [...value.reasons] }])),
            originGains: archive.originGains.map(gain => ({ ...gain })),
            mingJiDomainGains: archive.mingJiDomainGains ? { ...archive.mingJiDomainGains } : undefined,
            reincarnationLegacy: archive.reincarnationLegacy ? { ...archive.reincarnationLegacy, daoSeed: archive.reincarnationLegacy.daoSeed ? { ...archive.reincarnationLegacy.daoSeed } : undefined, memoryArchive: archive.reincarnationLegacy.memoryArchive ? { ...archive.reincarnationLegacy.memoryArchive, npcIds: [...archive.reincarnationLegacy.memoryArchive.npcIds] } : undefined } : undefined,
            chronicle: archive.chronicle.map(entry => ({ ...entry })),
            legacy: archive.legacy ? { ...archive.legacy } : undefined,
            notableStats: { ...archive.notableStats },
        })),
        legacies: meta.legacies.map(legacy => ({ ...legacy })),
        mingJi: Math.max(0, meta.mingJi ?? 0),
        mingJiDomains: normalizeMingJiDomains(meta.mingJiDomains),
        reincarnation: cloneReincarnationMasteryState(meta.reincarnation),
        talents: cloneReincarnationTalentState(meta.talents, meta.archives),
        endless: cloneEndlessMetaProgress(meta.endless),
        reincarnationProgress: cloneReincarnationProgressStateV1102(meta.reincarnationProgress),
        artifactRelics: (meta.artifactRelics ?? []).map(relic => ({
            ...relic, artifact: cloneArtifactInstance(relic.artifact), recoveredByLifeIds: [...relic.recoveredByLifeIds],
        })),
    };
}
export function createInitialLifeMeta(rootSeed) {
    return {
        lifeId: 'life.1',
        lifeNumber: 1,
        birth: rollBirth((rootSeed ^ 0x1f123bb5) >>> 0, 0),
        fateRuntime: createFateRuntimeState(),
    };
}
export function createInitialLifeMetaForCharacter(rootSeed, state, registry) {
    const life = createInitialLifeMeta(rootSeed);
    const root = registry.spiritualRoot(state.character.spiritualRootId);
    const physiqueId = state.character.physiqueIds[0];
    const physique = physiqueId ? registry.characterPhysique(physiqueId) : undefined;
    const lineage = state.character.bloodlines[0];
    const bloodline = lineage ? registry.bloodline(lineage.id) : undefined;
    // Runtime proxy ids remain synchronized with the supplied body for compatibility. The authoritative
    // v1.01 six-axis identity stays in `originsV101` and applies through live origin modifiers.
    life.birth.spiritualRootId = root.id;
    life.birth.physiqueId = physique?.id;
    life.birth.bloodlineId = bloodline?.id;
    life.birth.bloodlinePurity = lineage?.purity;
    if (!life.birth.originsV101) {
        life.birth.spiritualRoot = root.name;
        life.birth.physique = physique?.name;
        life.birth.bloodline = bloodline?.name;
    }
    return life;
}
export function cloneCurrentLifeMeta(life) {
    return { ...life, birth: { ...life.birth, birthTalents: (life.birth.birthTalents ?? []).map(x => ({ ...x })), divineAbility: life.birth.divineAbility ? { ...life.birth.divineAbility } : undefined, originsV101: life.birth.originsV101 ? structuredClone(life.birth.originsV101) : undefined }, reincarnation: cloneReincarnationInheritance(life.reincarnation), fateRuntime: cloneFateRuntimeState(life.fateRuntime) };
}
/** Alpha.23.24: persistent cultivation identities are not rerolled by reincarnation.
 * Modern Mệnh Thai RNG only changes Thiên Tư / Mệnh Cách / Xuất Thân.
 * Linh Căn, Huyết Mạch and Thể Chất are copied from the current soul/body progression.
 */
export function carryPersistentBirthOrigins(next, previous) {
    if (!next.originsV101 || !previous.originsV101)
        return next;
    const bundle = structuredClone(next.originsV101);
    bundle.spiritualRoot = structuredClone(previous.originsV101.spiritualRoot);
    bundle.bloodline = structuredClone(previous.originsV101.bloodline);
    // Progression persists, but per-life action flags must reset on a new incarnation.
    bundle.bloodline.switchedThisLife = false;
    bundle.bloodline.incompatibilityActive = Boolean(bundle.bloodline.originKind && bundle.bloodline.originKind !== 'NATIVE' && bundle.bloodline.purity < 100);
    bundle.physique = structuredClone(previous.originsV101.physique);
    // Resonance may only describe the three current-life random axes after consolidation.
    if (bundle.resonance) {
        bundle.resonance.attempts = bundle.resonance.attempts.filter(x => x.system === 'talent' || x.system === 'fate' || x.system === 'background');
        if (bundle.resonance.anchorSystem === 'spiritualRoot' || bundle.resonance.anchorSystem === 'bloodline' || bundle.resonance.anchorSystem === 'physique') {
            bundle.resonance.anchorSystem = undefined;
            bundle.resonance.anchorBand = undefined;
        }
    }
    const aptitude = Math.round(clamp(derivedAptitude(bundle), 0, 100));
    const luck = Math.round(clamp(derivedLuck(bundle), 0, 100));
    return {
        ...next,
        spiritualRoot: bundle.spiritualRoot.name,
        spiritualRootId: bundle.spiritualRoot.legacyRootId,
        physique: bundle.physique.band === 'NONE' ? undefined : bundle.physique.name,
        physiqueId: bundle.physique.legacyPhysiqueId,
        bloodline: bundle.bloodline.band === 'NONE' ? undefined : bundle.bloodline.name,
        bloodlineId: bundle.bloodline.legacyBloodlineId,
        bloodlinePurity: bundle.bloodline.band === 'NONE' ? undefined : bundle.bloodline.purity,
        aptitude, luck, originsV101: bundle,
    };
}
export function reincarnationCost(plan = {}, mastery = createReincarnationMasteryState()) {
    // v1.02: Tư Chất / Khí Vận are derived compatibility projections, never independent CP-controlled birth axes.
    const floor = 0;
    const aptitudeFloorCost = 0;
    const birthCandidate = Math.max(1, Math.floor(plan.birthCandidate ?? 1));
    const previewCount = birthPreviewCountForSeal(mastery.sealLevel);
    if (birthCandidate > previewCount)
        throw new Error(`${mastery.sealLevel > 0 ? 'Luân Hồi Ấn' : 'Hiện tại'} chỉ soi được ${previewCount} Mệnh Thai; không thể chọn ứng viên ${birthCandidate}.`);
    const orientation = reincarnationOrientations[plan.orientationId ?? 'balanced'] ?? reincarnationOrientations.balanced;
    if (mastery.sealLevel < orientation.requiredSeal)
        throw new Error(`${orientation.name} yêu cầu Luân Hồi Ấn ${orientation.requiredSeal}.`);
    // Exact-origin Fate Locks are disabled. Session-level reincarnation preserves Linh Căn / Huyết Mạch / Thể Chất and rerolls only the life-specific axes.
    const fateLockCount = 0;
    const fateLockCost = 0;
    let daoSeedCost = 0;
    if (plan.daoSeedId) {
        if (mastery.sealLevel < 4)
            throw new Error('Đạo Chủng yêu cầu Luân Hồi Ấn IV.');
        if (!mastery.daoSeeds.some(x => x.id === plan.daoSeedId))
            throw new Error(`Không có Đạo Chủng: ${plan.daoSeedId}`);
        daoSeedCost = 32;
    }
    let memoryCost = 0;
    if (plan.memoryArchiveId) {
        if (mastery.sealLevel < 2)
            throw new Error('Ký Ức Luân Hồi yêu cầu Luân Hồi Ấn II.');
        if (!mastery.memoryArchives.some(x => x.id === plan.memoryArchiveId))
            throw new Error(`Không có ký ức: ${plan.memoryArchiveId}`);
        memoryCost = 18;
    }
    const karmaCount = (plan.inheritKarmaNpcIds ?? []).length;
    if (karmaCount > karmaInheritanceSlotsForSeal(mastery.sealLevel))
        throw new Error(`Luân Hồi Ấn hiện chỉ giữ được ${karmaInheritanceSlotsForSeal(mastery.sealLevel)} mối Nhân Quả.`);
    const karmaCost = karmaCount * 22;
    const relicCount = (plan.bindRelicArtifactIds ?? []).length;
    if (relicCount > boundRelicSlotsForSeal(mastery.sealLevel))
        throw new Error(`Luân Hồi Ấn hiện chỉ neo được ${boundRelicSlotsForSeal(mastery.sealLevel)} Di Vật.`);
    const relicCost = relicCount * 60;
    const orientationCost = orientation.cpCost;
    return { aptitudeFloor: floor, aptitudeFloorCost, birthCandidate, orientationCost, fateLockCount, fateLockCost, daoSeedCost, memoryCost, karmaCost, relicCost, totalCpCost: aptitudeFloorCost + orientationCost + fateLockCost + daoSeedCost + memoryCost + karmaCost + relicCost };
}
export function rollBirth(seed, aptitudeFloor = 0, plan = {}, reincarnationSealLevel = 0, resonancePoints = 0) {
    const rng = new SeededRng(seed);
    const originsV101 = rollBirthOriginBundle(rng, reincarnationSealLevel, resonancePoints);
    // v1.02 compatibility: Tư Chất / Khí Vận are projections derived from the complete origin bundle.
    // They are no longer independent birth RNG axes. aptitudeFloor may still raise the derived projection as
    // a legacy CP intervention, but it never rerolls or replaces origin identity.
    const aptitude = Math.round(clamp(derivedAptitude(originsV101), 0, 100));
    const luck = Math.round(clamp(derivedLuck(originsV101), 0, 100));
    // Exact Fate Locks are no longer applied to modern birth bundles. Proxy IDs only mirror the resolved
    // authoritative origins so legacy registries can supply tags/technique compatibility without changing identity.
    const spiritualRootId = originsV101.spiritualRoot.legacyRootId;
    const physiqueId = originsV101.physique.legacyPhysiqueId;
    const bloodlineId = originsV101.bloodline.legacyBloodlineId;
    const family = originsV101.background.name;
    const startingSpiritStones = originsV101.background.startingSpiritStones;
    const fate = originsV101.fate.name;
    const familyRarity = originsV101.background.band === 'BREAK' ? 'mythic' : originsV101.background.band === 'EXTREME' ? 'legendary' : originsV101.background.band === 'MONSTROUS' ? 'epic' : originsV101.background.band === 'HEAVEN' ? 'rare' : originsV101.background.band === 'SPIRIT' ? 'uncommon' : 'common';
    const talents = legacyTalentRoll(originsV101.talent);
    return {
        seed,
        spiritualRoot: originsV101.spiritualRoot.name,
        spiritualRootId,
        physique: originsV101.physique.band === 'NONE' ? undefined : originsV101.physique.name,
        physiqueId,
        bloodline: originsV101.bloodline.band === 'NONE' ? undefined : originsV101.bloodline.name,
        bloodlineId,
        bloodlinePurity: originsV101.bloodline.band === 'NONE' ? undefined : 0,
        family,
        fate,
        aptitude,
        luck,
        startingSpiritStones,
        familyRarity,
        birthTalents: talents,
        originsV101,
    };
}
export class LifeSettlementEngine {
    settle(state, events, profile, life, registry) {
        if (state.alive)
            throw new Error('Cannot settle a life that is still alive');
        const categories = Object.fromEntries(CATEGORY_ORDER.map(category => [category, scoreEvents(category, events)]));
        // Realm depth is a real achievement even if a test/save has compressed some low-significance breakthrough logs.
        categories.cultivation.score += state.realm.maxRealmOrder * 9;
        categories.exploration.score += Math.max(0, state.knownLocationIds.length - 1) * 6;
        categories.profession.score += new Set(events.filter(event => event.type === 'dungeon').flatMap(event => event.tags.filter(tag => ['alchemy', 'forging', 'artifact', 'beast', 'talisman', 'soul'].includes(tag)))).size * 8;
        const professionTracks = Object.values(state.professions.tracks);
        categories.profession.score += Math.round(professionTracks.reduce((sum, track) => sum + Math.sqrt(Math.max(0, track.mastery)) * 4.2, 0));
        categories.profession.score += new Set(professionTracks.flatMap(track => track.knownRecipeIds)).size * 2;
        // Endless Hunt contributes by DEPTH, not by raw kill spam. Repeating an old floor gives
        // diminishing value, while pushing a new floor is a meaningful reincarnation achievement.
        const endlessFloor = Math.max(0, state.endlessHunt?.highestClearedFloor ?? 0);
        const endlessBossKills = Math.max(0, state.endlessHunt?.totalBossKills ?? 0);
        categories.combat.score += Math.round(Math.sqrt(endlessFloor) * 12 + Math.log2(1 + endlessBossKills) * 8);
        categories.exploration.score += Math.round(Math.log2(1 + endlessFloor) * 5);
        const totalScore = CATEGORY_ORDER.reduce((sum, category) => sum + categories[category].score, 0);
        const cpBase = cpFromScore(totalScore);
        const cpBonus = cpRareBonus(events);
        const cpEarned = cpBase + cpBonus;
        const finalRealm = registry.realm(state.realm.realmId);
        const legacy = legacyFrom(life.lifeId, life.lifeNumber, events);
        const origins = originGains(state, profile, categories, events, registry);
        const mingJi = mingJiGainsForLife(state, totalScore, origins);
        const reincarnationLegacy = reincarnationLegacyForLife(state, life, totalScore, mingJi.total, events);
        const talentPointGain = talentPointsFromLife(cpEarned, reincarnationLegacy.effective);
        const victories = events.filter(event => (event.type === 'combat' || event.type === 'dungeon') && event.tags.includes('Victory')).length;
        const defeats = events.filter(event => (event.type === 'combat' || event.type === 'injury' || event.type === 'dungeon') && event.tags.includes('Defeat')).length;
        const dungeonFirstClears = events.filter(event => event.type === 'dungeon' && event.tags.includes('FirstClear')).length;
        const highestDungeonFloor = events.filter(event => event.type === 'dungeon' && event.tags.includes('FirstClear')).reduce((max, event) => Math.max(max, typeof event.data?.floor === 'number' ? event.data.floor : 0), 0);
        const dungeonYears = events.filter(event => event.type === 'dungeon').reduce((sum, event) => sum + (typeof event.data?.years === 'number' ? event.data.years : 0), 0);
        const artifactCount = state.artifacts.items.length;
        const awakenedArtifacts = state.artifacts.items.filter(item => item.spirit.state === 'awakened').length;
        const highestArtifactLevel = state.artifacts.items.reduce((max, item) => Math.max(max, item.itemLevel), 0);
        const lifeRelationships = Object.values(state.worldSimulation.playerRelationships ?? {}).filter(relation => relation.lifeId === life.lifeId && relation.met);
        const deepestKarma = lifeRelationships.reduce((max, relation) => Math.max(max, relation.karmaDepth), 0);
        const deepestDebt = lifeRelationships.reduce((max, relation) => Math.max(max, relation.debt), 0);
        const deepestGrudge = lifeRelationships.reduce((max, relation) => Math.max(max, relation.grudge), 0);
        const socialBonds = state.social.bonds.filter(bond => bond.lifeId === life.lifeId);
        const daoPartners = socialBonds.filter(bond => bond.role === 'daoPartner' && bond.active).length;
        const masters = socialBonds.filter(bond => bond.role === 'master' && bond.active).length;
        const disciples = socialBonds.filter(bond => bond.role === 'disciple' && bond.active).length;
        const children = state.social.familyMembers.filter(member => member.sourceLifeId === life.lifeId && member.relation === 'child');
        const transmissionsGiven = socialBonds.reduce((sum, bond) => sum + bond.teachingsGiven, 0);
        const transmissionsReceived = socialBonds.reduce((sum, bond) => sum + bond.teachingsReceived, 0);
        const jointCultivations = socialBonds.reduce((sum, bond) => sum + bond.jointCultivations, 0);
        const factionMembership = state.factions.playerMemberships[life.lifeId];
        const faction = factionMembership ? state.factions.factions[factionMembership.factionId] : undefined;
        const foundedFaction = Object.values(state.factions.factions).find(candidate => candidate.founderLifeId === life.lifeId);
        return {
            lifeId: life.lifeId,
            lifeNumber: life.lifeNumber,
            lifespanYears: state.lifespanYears,
            ageAtDeathYears: state.ageYears,
            finalRealmId: state.realm.realmId,
            maxRealmOrder: state.realm.maxRealmOrder,
            causeOfDeath: deathCause(events),
            categories,
            totalScore,
            grade: gradeFor(totalScore),
            cpBase,
            cpBonus,
            cpEarned,
            originGains: origins,
            mingJiGain: mingJi.total,
            mingJiDomainGains: mingJi.domains,
            reincarnationLegacy,
            talentPointGain,
            chronicle: chronicleFrom(events),
            legacy,
            notableStats: {
                'Cảnh giới cuối': finalRealm.name,
                'Tuổi thọ': Math.round(state.ageYears),
                'Chiến thắng': victories,
                'Thất bại': defeats,
                'Năm treo phó bản': round2(dungeonYears),
                'Tầng phó bản công phá lần đầu': dungeonFirstClears,
                'Tầng phó bản cao nhất đã công phá': highestDungeonFloor,
                'Vô Tận tầng cao nhất': state.endlessHunt?.highestClearedFloor ?? 0,
                'Boss Tầng đã hạ': state.endlessHunt?.totalBossKills ?? 0,
                'Tổng quái Vô Tận đã hạ': state.endlessHunt?.totalKills ?? 0,
                'Địa điểm từng biết': state.knownLocationIds.length,
                'Pháp bảo từng sở hữu': artifactCount,
                'Khí Linh thức tỉnh': awakenedArtifacts,
                'Item Level pháp bảo cao nhất': highestArtifactLevel,
                'Luyện Đan mastery': round2(state.professions.tracks.alchemy.mastery),
                'Luyện Khí mastery': round2(state.professions.tracks.forging.mastery),
                'Phù/Trận mastery': round2(state.professions.tracks.talisman.mastery),
                'Luyện chế thành công': professionTracks.reduce((sum, track) => sum + track.successes, 0),
                'Luyện chế thất bại': professionTracks.reduce((sum, track) => sum + track.failures, 0),
                'NPC từng kết duyên': lifeRelationships.length,
                'Nhân quả sâu nhất': Math.round(deepestKarma),
                'Ân tình sâu nhất': Math.round(deepestDebt),
                'Oán sâu nhất': Math.round(deepestGrudge),
                'Sư phụ': masters,
                'Đệ tử': disciples,
                'Đạo lữ': daoPartners,
                'Con cái': children.length,
                'Con cái còn sống': children.filter(child => child.alive).length,
                'Lần truyền công': transmissionsGiven,
                'Lần thụ giáo': transmissionsReceived,
                'Lần đồng tu': jointCultivations,
                'Tông môn từng gia nhập': faction ? faction.name : 'Không',
                'Chức vị tông môn cao nhất': factionMembership?.rank ?? 'Không',
                'Công đức tông môn còn lại': Math.round(factionMembership?.merit ?? 0),
                'Tổng cống hiến tông môn': Math.round(factionMembership?.lifetimeContribution ?? 0),
                'Tông môn tự lập': foundedFaction?.name ?? 'Không',
            },
        };
    }
}
export function applySettlement(meta, settlement) {
    if (meta.archives.some(archive => archive.lifeId === settlement.lifeId))
        return false;
    meta.archives.push(settlement);
    meta.currentCp += settlement.cpEarned;
    meta.lifetimeCpEarned += settlement.cpEarned;
    meta.totalLifeScore += settlement.totalScore;
    meta.completedLives += 1;
    for (const gain of settlement.originGains)
        meta.origins[gain.key] = round2((meta.origins[gain.key] ?? 0) + gain.value);
    meta.mingJi = round2((meta.mingJi ?? 0) + (settlement.mingJiGain ?? 0));
    const md = normalizeMingJiDomains(meta.mingJiDomains);
    for (const [key, value] of Object.entries(settlement.mingJiDomainGains ?? {}))
        md[key] = round2(md[key] + Math.max(0, Number(value) || 0));
    meta.mingJiDomains = md;
    addReincarnationLegacyGain(meta.reincarnation, settlement.reincarnationLegacy);
    if (!meta.talents)
        meta.talents = cloneReincarnationTalentState(undefined, meta.archives.slice(0, -1));
    grantReincarnationTalentPoints(meta.talents, settlement.talentPointGain ?? talentPointsFromLife(settlement.cpEarned, settlement.reincarnationLegacy?.effective !== false));
    if (settlement.legacy && !meta.legacies.some(legacy => legacy.id === settlement.legacy.id))
        meta.legacies.push({ ...settlement.legacy });
    return true;
}
export function spendReincarnationCp(meta, plan = {}) {
    const trace = reincarnationCost(plan, meta.reincarnation);
    if (meta.currentCp < trace.totalCpCost)
        throw new Error(`Insufficient CP: ${meta.currentCp}/${trace.totalCpCost}`);
    meta.currentCp -= trace.totalCpCost;
    meta.lifetimeCpSpent += trace.totalCpCost;
    return trace;
}
export function buildReincarnatedState(previous, world, registry, meta, birth, worldYearsUntilPlayable, plan = {}) {
    const firstRealm = [...registry.realms.values()].sort((a, b) => a.order - b.order)[0];
    if (!firstRealm)
        throw new Error('Registry has no realms');
    // Major Talent selection is queued during the dying life and only becomes active at rebirth.
    commitPendingMajorTalents(meta.talents);
    syncReincarnationTalentsToOrigins(meta.origins, meta.talents);
    const cultivationOrigin = meta.origins['origin.cultivation'] ?? 0;
    const bodyOrigin = meta.origins['origin.body'] ?? 0;
    const techniqueByRoot = {
        'root.wood': 'technique.qingmu',
        'root.fire': 'technique.blazing_yang',
        'root.metal_fire': 'technique.sword_breath',
        'root.wind': 'technique.wind_breath',
        'root.lightning': 'technique.thunder_meridian',
        'root.ice': 'technique.cold_moon',
        'root.five_elements': 'technique.qingmu',
        'root.mixed': 'technique.qingmu',
    };
    const rootId = birth.spiritualRootId ?? 'root.mixed';
    const techniqueId = techniqueByRoot[rootId] ?? 'technique.qingmu';
    const character = createCharacterSystemState(rootId, techniqueId, birth.physiqueId ? [birth.physiqueId] : [], birth.bloodlineId ? [{ id: birth.bloodlineId, purity: birth.bloodlinePurity ?? 15, awakened: false }] : []);
    character.buildFoundation = inheritBuildFoundationOnReincarnationV113(previous.character.buildFoundation, rootId);
    const reincarnationProgress = meta.reincarnationProgress ?? (meta.reincarnationProgress = createReincarnationProgressStateV1102());
    character.corePotential = {
        life: ensureLifePotentialForRealm(undefined, firstRealm.order, nodeModifierValue(reincarnationProgress.tree, 'cultivation.lifePotentialGainPct')),
        permanent: { ...reincarnationProgress.permanentPotential.allocations },
    };
    const reincarnated = {
        timeModel: 'live-v1',
        worldTimeYears: previous.worldTimeYears + Math.max(0, worldYearsUntilPlayable),
        ageYears: 18,
        locationId: world.startLocationId,
        knownLocationIds: [world.startLocationId],
        inventory: { 'resource.spirit_stone': birth.startingSpiritStones },
        cultivation: cleanCultivationStateV140(),
        injury: 0,
        alive: true,
        lifespanYears: firstRealm.lifespanYears,
        realm: {
            realmId: firstRealm.id,
            maxRealmOrder: firstRealm.order,
        },
        dungeons: {
            unlockedDungeonIds: Object.values(world.dungeons).filter(dungeon => dungeon.tier <= 1).map(dungeon => dungeon.id),
            highestClearedFloor: {},
            parallelWorkerCapacity: 0,
            workers: [],
            assignments: {},
        },
        equipment: createEquipmentState(),
        artifacts: createArtifactState(1),
        lootManagement: createInventoryManagementState(),
        inheritedOrigins: (() => { const origins = { ...meta.origins }; syncReincarnationTalentsToOrigins(origins, meta.talents); syncReincarnationTreeRuntimeOriginsV136(origins, reincarnationProgress.tree); return origins; })(),
        character,
        worldSimulation: previous.worldSimulation,
        social: cloneSocialState(previous.social ?? createSocialState(previous.worldTimeYears)),
        factions: cloneFactionState(previous.factions),
        economy: cloneEconomyState(previous.economy),
        // Alpha.23.26: collection/gacha/workshop progression is account-long and survives reincarnation.
        collectionV12316: cloneCollectionProgressStateV12316(previous.collectionV12316),
        guidance: { ...cloneGuidanceState(previous.guidance), decisionHistory: [] },
        soul: createSoulState(),
        dao: createDaoState(),
        tribulation: createTribulationState(),
        immortal: createImmortalState(),
        fateEmbryo: createFateEmbryoState(meta, birth, meta.completedLives + 1, plan.orientationId ?? 'balanced'),
        flow: createPlayerFlowState(),
        endlessHunt: createEndlessHuntState(),
        professions: (() => {
            const origin = meta.origins['origin.profession'] ?? 0;
            const state = createProfessionState(Math.min(30, origin * 0.65));
            state.tracks.alchemy.knownRecipeIds.push('recipe.alchemy.spirit_gathering_pill');
            state.tracks.forging.knownRecipeIds.push('recipe.forging.black_iron_blade');
            state.tracks.talisman.knownRecipeIds.push('recipe.talisman.mind_guard');
            unlockEligibleProfessionRecipes(state, registry);
            return state;
        })(),
    };
    writeBirthModifiersToOrigins(reincarnated.inheritedOrigins, birth);
    applyMajorLifeOpeningBoon(reincarnated, meta.talents?.activeMajorIds);
    return reincarnated;
}
export function birthSummary(life) {
    if (life.birth.originsV101) {
        return `Đời ${life.lifeNumber}: ${bundleSummaryLines(life.birth.originsV101).join('; ')}.`;
    }
    const extras = [life.birth.physique, life.birth.bloodline].filter(Boolean).join('; ');
    const talents = (life.birth.birthTalents ?? []).map(x => x.name).join(', ');
    const divine = life.birth.divineAbility?.name;
    return `Đời ${life.lifeNumber}: ${life.birth.family}; ${life.birth.spiritualRoot}${extras ? `; ${extras}` : ''}; ${life.birth.fate}; tư chất ${life.birth.aptitude}/100${talents ? `; thiên phú ${talents}` : ''}${divine ? `; thần thông ${divine}` : ''}.`;
}
export function categoryDisplayName(category) {
    return CATEGORY_NAMES[category];
}
//# sourceMappingURL=life.js.map