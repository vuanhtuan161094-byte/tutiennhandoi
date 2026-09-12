import { cloneAdventureState } from './world.js';
import { normalizeEquipmentStateV98 } from './equipment.js';
import { EQUIPMENT_MAX_ENHANCEMENT_V142, equipmentSetDefinitionV142 } from './equipment-v142.js';
import { battleDaoV2Passive } from '../content/battle-dao-v2-catalog.js';
import { parseAlchemyPillResourceId } from './alchemy-v112.js';
import { clonePotentialState } from './potential.js';
import { cloneCurrentLifeMeta, cloneMetaProgressState } from './life.js';
import { repairAdventureStateReferences } from './save-stability.js';
import { highestClearedDungeonFloor } from './dungeon.js';
import { normalizeSoulCloneAuthorityV169, soulCloneAuthorityCapacityV127, synchronizeSoulForRealm, syncSoulDungeonWorkers } from './soul.js';
import { ensureWorkshopProductionV12328 } from './workshop-production-v12328.js';
import { FATE_BUILD_DEFINITIONS_V4, nodeSpentPoints, starterReincarnationTreeNodes } from './reincarnation-progression-v1102.js';

const LEGACY_ALCHEMY_TIER_TO_MAJOR_V167 = Object.freeze([1, 4, 8, 11, 15, 18, 22, 25]);
const LEGACY_ALCHEMY_FAMILY_TO_V146_V167 = Object.freeze({
    cultivation: 'cultivation', injury: 'injury', lifespan: 'lifespan', daoSuy: 'daoSuy',
    lifePower: 'lifePower', lifeBody: 'lifeBody', lifeDefense: 'lifeDefense',
    buffPower: 'buffPower', buffGuard: 'buffGuard', buffSpirit: 'buffSpirit', forbidden: 'forbidden',
    daoPower: 'lifePower', daoBody: 'lifeBody', daoDefense: 'lifeDefense',
});
const V169_CAVE_FACILITY_IDS = Object.freeze(['alchemy', 'forge', 'artifact', 'beast', 'companion', 'scripture', 'bloodline', 'physique']);
const V171_BOUNDED_IMMORTAL_FIELDS = Object.freeze([
    'daoSuy', 'essencePurity', 'immortalBody', 'lawAdaptation',
    'earthAnchor', 'earthVeinHarmony', 'heavenResonance', 'celestialCirculation',
    'trueLawBody', 'trueLawAuthority', 'mysticLawWeave', 'mysticLawStability',
    'goldenImmortalSeal', 'indestructibleEssence', 'taiyiEpochRiver', 'causalStability',
    'grandLuoDaoFruit', 'timelineFreedom', 'kingDomainAuthority', 'orthodoxyWeight',
    'emperorMandate', 'worldAuthority', 'extremityPressure', 'supremeDaoCore',
    'supremeLawConsistency', 'chaosAffinity', 'chaosBody', 'hongmengSeed',
    'primordialVitality', 'heavenOpeningAuthority', 'innerCosmosStability',
    'worldCore', 'worldLifePotential', 'eternityAnchor', 'deathlessContinuity',
    'creationSource', 'genesisAuthority',
]);
const V171_NONNEGATIVE_IMMORTAL_FIELDS = Object.freeze([
    'immortalEssence', 'extremityInsight', 'extremityAuthority', 'creationEpochAuthority',
]);
const V171_NONNEGATIVE_INT_IMMORTAL_FIELDS = Object.freeze([
    'refinedBatches', 'earthRefinements', 'heavenRefinements', 'trueRefinements',
    'mysticRefinements', 'goldenRefinements', 'taiyiRefinements', 'grandLuoRefinements',
    'kingRefinements', 'emperorRefinements', 'extremityLayers', 'extremityRefinements',
    'supremeDaoRefinements', 'chaosRefinements', 'hongmengRefinements',
    'heavenOpeningRefinements', 'worldLordRefinements', 'eternityRefinements',
    'creationRefinements', 'creationEpochs', 'daoSuyTribulationsPassed', 'daoSuyTribulationsFailed',
]);
const V171_MANIFESTATION_CAPACITY_STEPS = Object.freeze([
    [114, 15], [110, 14], [106, 13], [102, 12], [98, 11], [94, 10],
    [90, 9], [86, 8], [82, 7], [78, 6], [74, 5], [66, 4], [62, 3],
]);
function safeAlchemyInventoryCountV167(value) {
    if (typeof value === 'bigint') return Number(value > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : value);
    return Math.max(0, Math.floor(Number(value) || 0));
}
function canonicalAlchemyPillIdV167(family, majorRealmIndex, quality) {
    return `resource.pill.alchemy.v146.${family}.m${majorRealmIndex}.${quality}`;
}
function finiteNonNegativeV171(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
}
function nonNegativeIntV171(value) {
    return Math.floor(finiteNonNegativeV171(value));
}
function clamp100V171(value) {
    return Math.min(100, finiteNonNegativeV171(value));
}
export function immortalManifestationCapacityV171(realmOrder) {
    const order = nonNegativeIntV171(realmOrder);
    for (const [minOrder, capacity] of V171_MANIFESTATION_CAPACITY_STEPS)
        if (order >= minOrder) return capacity;
    return 0;
}
function availableManifestationsV171(state, currentLife) {
    const available = new Set();
    if (nonNegativeIntV171(state?.realm?.maxRealmOrder) < 62) return available;
    available.add('law');
    if (state?.dao?.mainDaoId) available.add('dao');
    if (state?.dao?.domain?.active) available.add('domain');
    if (state?.soul?.awakened) available.add('soul');
    if ((state?.artifacts?.activeIds?.length ?? 0) > 0) available.add('artifact');
    if ((state?.character?.bloodlines?.length ?? 0) > 0) available.add('bloodline');
    if ((state?.character?.physiqueIds?.length ?? 0) > 0) available.add('physique');
    if (state?.character?.activeTechniqueId) available.add('technique');
    const lifeId = currentLife?.lifeId;
    if (lifeId && Object.values(state?.factions?.playerMemberships ?? {}).some(m => m?.lifeId === lifeId && m?.active))
        available.add('faction');
    if (Object.keys(state?.inheritedOrigins ?? {}).length > 0) available.add('origin');
    return available;
}

// V171: endgame restore authority repairs impossible/tampered state only; valid authored progress is preserved.
export function normalizeCanonicalEndgameAfterRestore(state, currentLife) {
    const immortal = state?.immortal;
    if (!immortal) return state;
    const realmOrder = nonNegativeIntV171(state?.realm?.maxRealmOrder);
    immortal.awakened = realmOrder >= 46;
    for (const key of V171_BOUNDED_IMMORTAL_FIELDS) immortal[key] = clamp100V171(immortal[key]);
    for (const key of V171_NONNEGATIVE_IMMORTAL_FIELDS) immortal[key] = finiteNonNegativeV171(immortal[key]);
    for (const key of V171_NONNEGATIVE_INT_IMMORTAL_FIELDS) immortal[key] = nonNegativeIntV171(immortal[key]);
    const byMajor = {};
    for (const [key, value] of Object.entries(immortal.daoSuyTribulationsPassedByMajor ?? {}))
        byMajor[String(key)] = Math.min(5, nonNegativeIntV171(value));
    immortal.daoSuyTribulationsPassedByMajor = byMajor;
    const accountedPasses = Object.values(byMajor).reduce((sum, value) => sum + value, 0);
    immortal.daoSuyTribulationsPassed = Math.max(immortal.daoSuyTribulationsPassed, accountedPasses);
    const capacity = immortalManifestationCapacityV171(realmOrder);
    immortal.manifestationCapacity = capacity;
    const available = availableManifestationsV171(state, currentLife);
    immortal.activeManifestationIds = [...new Set((immortal.activeManifestationIds ?? []).filter(id => typeof id === 'string' && available.has(id)))].slice(0, capacity);
    return state;
}

// V165: restore must enforce the same canonical V142 contract as live mutation.
export function normalizeCanonicalEquipmentAfterRestore(state) {
    for (const item of state?.equipment?.items ?? []) {
        if (item?.schema !== 'equipment.v142') continue;
        item.enhancementLevel = Math.max(0, Math.min(EQUIPMENT_MAX_ENHANCEMENT_V142, Math.floor(Number(item.enhancementLevel) || 0)));
        item.tier = 0;
        item.grade = 'mundane';
        item.quality = 'mid';
        item.traitIds = [];
        item.daoInscription = undefined;
        item.gemSockets = [];
        if (item.setId && !equipmentSetDefinitionV142(item.setId)) {
            item.setId = undefined;
            item.setResonanceLevelV143 = 0;
        }
    }
    return state?.equipment;
}

// V166: Tâm Pháp authority is the authored Bản Đạo V2 passive catalog.
export function normalizeCanonicalSkillHeartAfterRestore(state) {
    const foundation = state?.character?.buildFoundation;
    if (!foundation) return undefined;
    const learned = foundation.learnedDaoPassiveIdsV118 ?? [];
    foundation.learnedDaoPassiveIdsV118 = [...new Set(learned.filter(id => Boolean(battleDaoV2Passive(id))))];
    return foundation;
}

// V167: current saves must not carry a second, realm-gated V112 pill authority.
export function normalizeCanonicalAlchemyInventoryAfterRestore(state) {
    const inventory = state?.inventory;
    if (!inventory || typeof inventory !== 'object') return inventory;
    for (const [resourceId, raw] of Object.entries({ ...inventory })) {
        const legacy = parseAlchemyPillResourceId(resourceId);
        if (!legacy) continue;
        const family = LEGACY_ALCHEMY_FAMILY_TO_V146_V167[legacy.family];
        if (!family) continue;
        let majorRealmIndex = LEGACY_ALCHEMY_TIER_TO_MAJOR_V167[Math.max(1, Math.min(8, Math.floor(Number(legacy.realmTier) || 1))) - 1];
        if (family === 'daoSuy') majorRealmIndex = Math.max(11, majorRealmIndex);
        const count = safeAlchemyInventoryCountV167(raw);
        delete inventory[resourceId];
        if (count <= 0) continue;
        const canonicalId = canonicalAlchemyPillIdV167(family, majorRealmIndex, legacy.quality);
        inventory[canonicalId] = safeAlchemyInventoryCountV167(inventory[canonicalId]) + count;
    }
    return inventory;
}

// V169: canonicalize the three idle authorities before a restored session can execute rewards.
export function normalizeCanonicalIdleRuntimeAfterRestore(state, world) {
    const collection = state?.collectionV12316;
    if (collection) {
        collection.cave ??= { level: 1, facilities: [] };
        const firstById = new Map();
        for (const raw of collection.cave.facilities ?? []) {
            const id = String(raw?.id ?? '');
            if (!V169_CAVE_FACILITY_IDS.includes(id) || firstById.has(id)) continue;
            firstById.set(id, { ...raw, id, level: Math.max(1, Math.min(10, Math.floor(Number(raw?.level) || 1))) });
        }
        collection.cave.facilities = V169_CAVE_FACILITY_IDS.map(id => firstById.get(id) ?? { id, level: 1 });
        collection.cave.level = Math.max(1, ...collection.cave.facilities.map(x => x.level));
        if (collection.workshopV12328)
            ensureWorkshopProductionV12328(collection);
    }

    const soul = state?.soul;
    const dungeons = state?.dungeons;
    if (soul && dungeons) {
        normalizeSoulCloneAuthorityV169(soul);
        const cap = soulCloneAuthorityCapacityV127(state?.realm?.maxRealmOrder ?? 0);
        synchronizeSoulForRealm(soul, state?.realm?.maxRealmOrder ?? 0, Math.max(0, Math.floor(Number(dungeons.parallelWorkerCapacity) || 0)));
        syncSoulDungeonWorkers(soul, dungeons, cap);
        const valid = {};
        const occupiedDungeons = new Set();
        for (const [workerId, raw] of Object.entries(dungeons.assignments ?? {})) {
            if (!dungeons.workers.some(worker => worker.id === workerId)) continue;
            const dungeonId = String(raw?.dungeonId ?? '');
            const dungeon = world?.dungeons?.[dungeonId];
            if (!dungeon || !dungeons.unlockedDungeonIds.includes(dungeonId) || occupiedDungeons.has(dungeonId)) continue;
            const floor = Math.max(1, Math.floor(Number(raw?.floor) || 1));
            if (!dungeon.floors?.some(candidate => candidate.floor === floor)) continue;
            if (highestClearedDungeonFloor(dungeons, dungeonId) < floor) continue;
            occupiedDungeons.add(dungeonId);
            valid[workerId] = {
                workerId,
                dungeonId,
                floor,
                totalYears: Math.max(0, Number.isFinite(Number(raw?.totalYears)) ? Number(raw.totalYears) : 0),
                totalRuns: Math.max(0, Math.floor(Number.isFinite(Number(raw?.totalRuns)) ? Number(raw.totalRuns) : 0)),
            };
        }
        dungeons.assignments = valid;
    }
    return state;
}

function v170NonNegativeInt(value) {
    return Math.max(0, Math.floor(Number(value) || 0));
}
function canonicalPermanentPotentialV170(raw) {
    const earned = v170NonNegativeInt(raw?.lifetimeEarned);
    const requested = {
        power: v170NonNegativeInt(raw?.allocations?.power),
        body: v170NonNegativeInt(raw?.allocations?.body),
        defense: v170NonNegativeInt(raw?.allocations?.defense),
    };
    let remaining = earned;
    const allocations = { power: 0, body: 0, defense: 0 };
    for (const key of ['power', 'body', 'defense']) {
        const kept = Math.min(requested[key], remaining);
        allocations[key] = kept;
        remaining -= kept;
    }
    return { lifetimeEarned: earned, unspent: remaining, allocations };
}
function canonicalFateBuildV170(rawFate, sharedBudget) {
    const requested = new Set(rawFate?.unlockedIds ?? []);
    const starters = FATE_BUILD_DEFINITIONS_V4.filter(def => def.unlockCostRp === 0);
    const unlocked = new Set(starters.map(def => def.id));
    let spent = 0;
    for (const pathId of [...new Set(FATE_BUILD_DEFINITIONS_V4.map(def => def.pathId))]) {
        const path = FATE_BUILD_DEFINITIONS_V4.filter(def => def.pathId === pathId).sort((a, b) => a.order - b.order);
        for (const def of path) {
            if (def.unlockCostRp <= 0) continue;
            if (!requested.has(def.id)) break;
            if (def.prerequisiteId && !unlocked.has(def.prerequisiteId)) break;
            if (spent + def.unlockCostRp > sharedBudget) break;
            unlocked.add(def.id);
            spent += def.unlockCostRp;
        }
    }
    const requestedActive = String(rawFate?.activeFateId ?? '');
    const activeFateId = unlocked.has(requestedActive) ? requestedActive : 'fate.v4.cultivation.diligent';
    return { state: { version: 4, unlockedIds: [...unlocked], activeFateId }, spent };
}
function canonicalTreeRanksV170(rawRanks, availableBudget) {
    const ranks = {};
    let spent = 0;
    for (const node of starterReincarnationTreeNodes) {
        const wanted = Math.max(0, Math.min(node.maxRank, v170NonNegativeInt(rawRanks?.[node.id])));
        let kept = 0;
        for (let rank = 1; rank <= wanted; rank++) {
            const nextCost = nodeSpentPoints(node, rank) - nodeSpentPoints(node, rank - 1);
            if (spent + nextCost > availableBudget) break;
            spent += nextCost;
            kept = rank;
        }
        if (kept > 0) ranks[node.id] = kept;
    }
    return { ranks, spent };
}
function dedupeLifeRowsV170(rows) {
    const seen = new Set();
    const out = [];
    for (const row of rows ?? []) {
        const lifeId = typeof row?.lifeId === 'string' && row.lifeId.length > 0 ? row.lifeId : undefined;
        if (lifeId && seen.has(lifeId)) continue;
        if (lifeId) seen.add(lifeId);
        out.push(row);
    }
    return out;
}

// V170: earned meta progression is the authority. Restore may repair invalid allocation, but it may
// never invent earned RP/Potential from a tampered allocation. Valid saves are preserved exactly.
export function normalizeCanonicalReincarnationAfterRestore(meta, rawMeta) {
    const rp = meta?.reincarnationProgress;
    if (!rp) return meta;
    const rawRp = rawMeta?.reincarnationProgress ?? {};
    const lifetimePointsEarned = v170NonNegativeInt(rawRp?.tree?.lifetimePointsEarned);
    const requestedSharedSpend = Math.min(lifetimePointsEarned, v170NonNegativeInt(rawRp?.tree?.sharedSpentPoints));
    const fate = canonicalFateBuildV170(rawRp?.fateBuild, requestedSharedSpend);
    const sharedSpentPoints = Math.max(fate.spent, Math.min(requestedSharedSpend, lifetimePointsEarned));
    const treeBudget = Math.max(0, lifetimePointsEarned - sharedSpentPoints);
    const tree = canonicalTreeRanksV170(rawRp?.tree?.ranks, treeBudget);

    rp.tree.lifetimePointsEarned = lifetimePointsEarned;
    rp.tree.sharedSpentPoints = sharedSpentPoints;
    rp.tree.ranks = tree.ranks;
    rp.tree.cultivationR3 = true;
    rp.fateBuild = fate.state;
    rp.permanentPotential = canonicalPermanentPotentialV170(rawRp?.permanentPotential);
    rp.rewardHistory = dedupeLifeRowsV170(rp.rewardHistory);
    meta.archives = dedupeLifeRowsV170(meta.archives);
    return meta;
}

export function canonicalOfflineWindowV169(flow, lastSeenUnixMs, nowUnixMs) {
    const rawLast = Number(lastSeenUnixMs);
    const requestedLast = Number.isFinite(rawLast) && rawLast >= 0 ? rawLast : 0;
    const rawNow = Number(nowUnixMs);
    const requestedNow = Number.isFinite(rawNow) && rawNow >= 0 ? rawNow : requestedLast;
    const stored = Number(flow?.offlineLastResolvedUnixMsV169);
    const consumedThrough = Number.isFinite(stored) && stored >= 0 ? stored : requestedLast;
    const effectiveLastSeenUnixMs = Math.max(requestedLast, consumedThrough);
    const effectiveNowUnixMs = Math.max(effectiveLastSeenUnixMs, requestedNow);
    return { requestedLastSeenUnixMs: requestedLast, requestedNowUnixMs: requestedNow, effectiveLastSeenUnixMs, effectiveNowUnixMs, replayGuardApplied: effectiveLastSeenUnixMs > requestedLast };
}

export function installOfflineReplayGuardV169(session) {
    if (!session || session.offlineReplayGuardV169Installed) return session;
    const rawResolve = session.resolveRealtimeOffline.bind(session);
    session.resolveRealtimeOffline = (plan, lastSeenUnixMs, nowUnixMs) => {
        session.stateValue.flow ??= {};
        const window = canonicalOfflineWindowV169(session.stateValue.flow, lastSeenUnixMs, nowUnixMs);
        const result = rawResolve(plan, window.effectiveLastSeenUnixMs, window.effectiveNowUnixMs);
        session.stateValue.flow.offlineLastResolvedUnixMsV169 = window.effectiveNowUnixMs;
        return result;
    };
    session.resolveOffline = (plan, lastSeenUnixMs, nowUnixMs) => session.resolveRealtimeOffline(plan, lastSeenUnixMs, nowUnixMs);
    Object.defineProperty(session, 'offlineReplayGuardV169Installed', { value: true, enumerable: false, configurable: false, writable: false });
    return session;
}

// V174: one-shot settlement leaves durable mirrors. Restore must not let deletion of one mirror
// replay an already-accounted Content Event or Dungeon first-clear reward.
export function normalizeCanonicalOneShotSettlementAfterRestore(state, world) {
    const contentEvents = state?.flow?.contentEvents;
    const eventDefinitions = world?.contentEvents ?? {};
    if (contentEvents) {
        const validChoices = {};
        for (const [eventId, rawChoiceId] of Object.entries(contentEvents.choicesByEventId ?? {})) {
            const definition = eventDefinitions[eventId];
            const choiceId = String(rawChoiceId ?? '');
            if (!definition || !(definition.choices ?? []).some(choice => choice.id === choiceId)) continue;
            validChoices[eventId] = choiceId;
        }
        const completed = [];
        const seen = new Set();
        for (const eventId of [...(contentEvents.completedEventIds ?? []), ...Object.keys(validChoices)]) {
            if (typeof eventId !== 'string' || !eventDefinitions[eventId] || seen.has(eventId)) continue;
            seen.add(eventId);
            completed.push(eventId);
        }
        contentEvents.completedEventIds = completed;
        contentEvents.choicesByEventId = validChoices;
    }

    const dungeons = state?.dungeons;
    const progressionAwardedIds = state?.collectionV12316?.economyV89?.progressionAwardedIds;
    if (dungeons && Array.isArray(progressionAwardedIds)) {
        dungeons.highestClearedFloor ??= {};
        for (const dungeon of Object.values(world?.dungeons ?? {})) {
            if (!dungeon?.id) continue;
            const prefix = `first-clear.${dungeon.id}.`;
            let highest = highestClearedDungeonFloor(dungeons, dungeon.id);
            for (const rawKey of progressionAwardedIds) {
                const key = String(rawKey ?? '');
                if (!key.startsWith(prefix)) continue;
                const floor = Number(key.slice(prefix.length));
                if (!Number.isInteger(floor) || floor < 1 || !dungeon.floors?.some(candidate => candidate.floor === floor)) continue;
                highest = Math.max(highest, floor);
            }
            if (highest > highestClearedDungeonFloor(dungeons, dungeon.id))
                dungeons.highestClearedFloor[dungeon.id] = highest;
        }
    }
    return state;
}

// V141 pre-release policy: only the current canonical save schema is supported.
export function restoreSimulationSession(SessionClass, saveVersion, registry, world, entityDefinitions, profile, save) {
    if (save.profileId !== profile.id) {
        throw new Error(`Save profile mismatch: ${save.profileId} != ${profile.id}`);
    }
    if (save.schemaVersion !== saveVersion) {
        throw new Error(`Unsupported simulation save version: ${save.schemaVersion}. Current canonical version is ${saveVersion}.`);
    }
    const state = cloneAdventureState(save.state);
    const meta = cloneMetaProgressState(save.meta);
    const currentLife = cloneCurrentLifeMeta(save.currentLife);
    state.timeModel = 'live-v1';
    normalizeEquipmentStateV98(state.equipment, registry.equipmentTemplates);
    normalizeCanonicalEquipmentAfterRestore(state);
    normalizeCanonicalSkillHeartAfterRestore(state);
    normalizeCanonicalAlchemyInventoryAfterRestore(state);
    repairAdventureStateReferences(state, world, registry);
    normalizeCanonicalOneShotSettlementAfterRestore(state, world);
    normalizeCanonicalIdleRuntimeAfterRestore(state, world);
    normalizeCanonicalEndgameAfterRestore(state, currentLife);
    normalizeCanonicalReincarnationAfterRestore(meta, save.meta);
    state.character.potential = clonePotentialState(undefined);
    const session = new SessionClass(registry, world, entityDefinitions, profile, save.rootSeed, state, save.actionIndex, save.history, meta, currentLife);
    return installOfflineReplayGuardV169(session);
}