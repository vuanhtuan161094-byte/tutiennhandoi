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

const LEGACY_ALCHEMY_TIER_TO_MAJOR_V167 = Object.freeze([1, 4, 8, 11, 15, 18, 22, 25]);
const LEGACY_ALCHEMY_FAMILY_TO_V146_V167 = Object.freeze({
    cultivation: 'cultivation', injury: 'injury', lifespan: 'lifespan', daoSuy: 'daoSuy',
    lifePower: 'lifePower', lifeBody: 'lifeBody', lifeDefense: 'lifeDefense',
    buffPower: 'buffPower', buffGuard: 'buffGuard', buffSpirit: 'buffSpirit', forbidden: 'forbidden',
    daoPower: 'lifePower', daoBody: 'lifeBody', daoDefense: 'lifeDefense',
});
const V169_CAVE_FACILITY_IDS = Object.freeze(['alchemy', 'forge', 'artifact', 'beast', 'companion', 'scripture', 'bloodline', 'physique']);
function safeAlchemyInventoryCountV167(value) {
    if (typeof value === 'bigint') return Number(value > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : value);
    return Math.max(0, Math.floor(Number(value) || 0));
}
function canonicalAlchemyPillIdV167(family, majorRealmIndex, quality) {
    return `resource.pill.alchemy.v146.${family}.m${majorRealmIndex}.${quality}`;
}

// V165: restore must enforce the same canonical V142 contract as live mutation.
// V142 progression is Rank + Enhancement(+15) + Affix + V142 Set only. Retired legacy
// Grade/Quality/Trait/Dao-Wen/Gem lanes must never be resurrected by stale/tampered saves.
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
// Normal gameplay already learns passives through canonical progression, but save payloads must not
// resurrect duplicate or invented passive IDs that would otherwise be interpreted as extra heart methods.
export function normalizeCanonicalSkillHeartAfterRestore(state) {
    const foundation = state?.character?.buildFoundation;
    if (!foundation) return undefined;
    const learned = foundation.learnedDaoPassiveIdsV118 ?? [];
    foundation.learnedDaoPassiveIdsV118 = [...new Set(learned.filter(id => Boolean(battleDaoV2Passive(id))))];
    return foundation;
}

// V167: current saves must not carry a second, realm-gated V112 pill authority.
// Preserve every valid legacy pill by converting it immediately to its V146 ID, including future-realm pills.
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
// - Collection owns Động Phủ facility levels (1..10, one row per authored facility).
// - Soul owns avatar workers; realm gates only active workers, not already-owned sealed clones.
// - Dungeon assignments must point to one live worker and one first-cleared/unlocked dungeon.
// - Workshop queue IDs are unique so one logical completed job cannot be consumed twice.
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

// V141 pre-release policy: only the current canonical save schema is supported.
// Historical migration ladders are intentionally removed; stale DEV saves must be reset.
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
    normalizeCanonicalIdleRuntimeAfterRestore(state, world);
    state.character.potential = clonePotentialState(undefined);
    return new SessionClass(registry, world, entityDefinitions, profile, save.rootSeed, state, save.actionIndex, save.history, meta, currentLife);
}