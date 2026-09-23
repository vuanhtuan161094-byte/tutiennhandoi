import { CombatEngine } from './combat.js';
import { prepareBossGameplayV2 } from './boss-gameplay-v2.js';
import { buildCombatResultV1, runCombatKernelV2 } from './combat-kernel-v2.js';
import { applyCombatPacingV124 } from './combat-pacing-v124.js';
import { applyCharacterToEntity } from './character.js';
import { applyEquipmentToEntity } from './equipment.js';
import { applyCollectionEconomyToEntityV12325 } from './gacha-collection-economy-v12325.js';
import { applyReincarnationArtifactTalents, applyReincarnationCombatTalents, techniquePassiveStrengthMultiplier } from './reincarnation-talents.js';
import { applyDaoToEntity } from './dao.js';
import { applyIntegrationToEntity, integrationSummary as deriveIntegrationSummary } from './integration.js';
import { applyGreatVehicleToEntity, greatVehicleSummary as deriveGreatVehicleSummary } from './great-vehicle.js';
import { applyImmortalToEntity } from './immortal.js';
import { applyBirthCombatOrigins } from './birth-randomness.js';
import { activeAlchemyBuff, applyAlchemyStatBonuses, emptyAlchemyAllocation, ensureAlchemyV112State } from './alchemy-v112.js';

export { buildCombatResultV1 };

export const COMBAT_V3_ENGINE_VERSION = 'combat.v3';
export const COMBAT_V3_COMPAT_EXECUTOR = 'combat-engine.v168-compat';

/**
 * Phase-7 V3 boundary normalizer.
 *
 * Gameplay is frozen during the strangler cutover. Missing combatModel has
 * historically meant "legacy" inside CombatEngine, so V3 preserves that exact
 * behavior and makes it explicit instead of silently upgrading formulas.
 * Unknown future models are rejected. Retirement can remove legacy only after
 * parity-backed migration of the authored entities themselves.
 */
export function normalizeCombatEntitiesV3(entities) {
    if (!Array.isArray(entities) || entities.length !== 2)
        throw new Error(`CombatKernelV3 requires exactly 2 entities; received ${Array.isArray(entities) ? entities.length : 0}`);
    const ids = new Set();
    return entities.map(entity => {
        if (!entity?.id)
            throw new Error('CombatKernelV3 entity requires id');
        if (ids.has(entity.id))
            throw new Error(`CombatKernelV3 duplicate entity id: ${entity.id}`);
        ids.add(entity.id);
        const combatModel = entity.combatModel ?? 'legacy';
        if (combatModel !== 'locked-v1' && combatModel !== 'legacy')
            throw new Error(`CombatKernelV3 rejects unsupported combatModel for ${entity.id}: ${combatModel}`);
        return { ...structuredClone(entity), combatModel };
    });
}

/**
 * Compatibility executor used during the strangler cutover.
 *
 * This does NOT call CombatKernelV2. It invokes the locked V168 CombatEngine
 * directly behind the V3 boundary so consumers can move to engineVersion
 * combat.v3 while parity remains exact. The god-object internals can then be
 * extracted one subsystem at a time without reopening activity orchestration.
 */
export function executeCombatRuntimeCompatV3(input) {
    const entities = normalizeCombatEntitiesV3(input.entities).map(entity => prepareBossGameplayV2(entity));
    const maxDuration = Number.isFinite(Number(input.maxDuration)) && Number(input.maxDuration) > 0
        ? Number(input.maxDuration)
        : 120;
    const seed = Number(input.seed) >>> 0;
    const engine = new CombatEngine(input.registry, seed, entities);
    const battle = engine.run(maxDuration);
    const combatResult = buildCombatResultV1({
        battle,
        registry: input.registry,
        maxDuration,
        engineVersion: COMBAT_V3_ENGINE_VERSION,
    });
    const legacyCombatModelEntityIds = entities.filter(entity => entity.combatModel === 'legacy').map(entity => entity.id);
    return {
        engineVersion: COMBAT_V3_ENGINE_VERSION,
        executor: COMBAT_V3_COMPAT_EXECUTOR,
        mode: input.mode,
        battle,
        combatResult,
        compatibility: {
            legacyCombatModelEntityIds,
            hasLegacyCombatModel: legacyCombatModelEntityIds.length > 0,
        },
        presentationPolicy: input.mode === 'realtime' ? 'timeline-1to1' : 'none',
    };
}

/* Canonical V168 player entity composition boundary. */
/**
 * Canonical player CombatEntity factory.
 *
 * This preserves the locked V168 composition order while removing activity-owned
 * copies of that pipeline. Activities may override encounter-local identity only
 * after this factory returns.
 *
 * Retired Fate Embryo/Mệnh Thai power is intentionally absent from this path.
 */
export function buildPlayerCombatEntityV1(input) {
    const { profileCombatEntity, state, registry, currentLifeId, alchemyPermanentStats } = input;
    if (!profileCombatEntity || !state || !registry)
        throw new Error('CombatEntityFactory requires profileCombatEntity, state and registry');

    const character = applyCharacterToEntity(
        profileCombatEntity,
        state.character,
        registry,
        techniquePassiveStrengthMultiplier(state.inheritedOrigins),
        Boolean(state.inheritedOrigins['birth.v101.authoritative']),
    );
    const equipped = applyEquipmentToEntity(character, state.equipment, registry.equipmentSets);
    const collected = applyCollectionEconomyToEntityV12325(equipped, state.collectionV12316);
    const artifactTalents = applyReincarnationArtifactTalents(collected, state.inheritedOrigins);
    const dao = applyDaoToEntity(artifactTalents, state.dao, registry);
    const integration = deriveIntegrationSummary(state.realm, state.cultivation, state.soul, state.dao, state.artifacts);
    const integrated = applyIntegrationToEntity(dao, integration);
    const great = applyGreatVehicleToEntity(
        integrated,
        deriveGreatVehicleSummary(state.realm, integration, state.dao, state.factions, currentLifeId),
    );
    const immortal = applyImmortalToEntity(great, state.immortal, state.realm, state.immortal.manifestationCapacity);
    const reincarnated = applyReincarnationCombatTalents(immortal, state.inheritedOrigins);
    const born = applyBirthCombatOrigins(reincarnated, state.inheritedOrigins);

    const alchemy = ensureAlchemyV112State(state.economy);
    const lifeBonus = {
        ...emptyAlchemyAllocation(),
        power: Math.max(0, alchemy.life.lifeStatBonus?.power ?? 0),
        body: Math.max(0, alchemy.life.lifeStatBonus?.body ?? 0),
        defense: Math.max(0, alchemy.life.lifeStatBonus?.defense ?? 0),
    };
    const permanent = { ...emptyAlchemyAllocation(), ...(alchemyPermanentStats ?? {}) };
    const buff = activeAlchemyBuff(alchemy, state.worldTimeYears);
    return applyAlchemyStatBonuses(born, lifeBonus, permanent, buff);
}

/* Activity settlement boundary. */
/**
 * Explicit activity settlement policies for Combat outcomes.
 *
 * These functions preserve the current gameplay numbers. They do not decide
 * victory/defeat and they do not belong to CombatKernel.
 */

export function contentEventDefeatPolicyV1(context) {
    return {
        id: 'content-event.defeat.v1',
        activity: 'content-event',
        outcome: 'defeat',
        directInjuryDelta: 0,
        canonicalDeathPenalty: true,
        context,
    };
}

export function dungeonDefeatPolicyV1(dungeonId, floor) {
    return {
        id: 'dungeon.defeat.v1',
        activity: 'dungeon',
        outcome: 'defeat',
        // Preserve existing authored difficulty exactly: this pre-penalty injury
        // is followed by the canonical +15 combat-death penalty.
        directInjuryDelta: 14 + Number(floor) * 2,
        canonicalDeathPenalty: true,
        context: `dungeon:${dungeonId}:floor:${floor}`,
    };
}

export function endlessHuntSettlementPolicyV1(input) {
    const fateInjuryDelta = Number(input.fateInjuryDelta ?? 0);
    if (input.won) {
        return {
            id: 'endless-hunt.victory.v1',
            activity: 'endless-hunt',
            outcome: 'victory',
            directInjuryDelta: fateInjuryDelta > 0 ? fateInjuryDelta : 0,
            canonicalDeathPenalty: false,
            context: 'endless-hunt',
        };
    }
    return {
        id: 'endless-hunt.defeat.v1',
        activity: 'endless-hunt',
        outcome: 'defeat',
        directInjuryDelta: Number(input.injuryGain ?? 0) + fateInjuryDelta,
        canonicalDeathPenalty: false,
        context: 'endless-hunt',
    };
}

export function daoSuyDefeatPolicyV1() {
    return {
        id: 'dao-suy.defeat.v1',
        activity: 'dao-suy',
        outcome: 'defeat',
        directInjuryDelta: 18,
        canonicalDeathPenalty: false,
        context: 'dao-suy',
    };
}

/**
 * Apply an activity policy to AdventureState.
 *
 * The callback remains Session-owned because canonical death penalty also owns
 * history/action identity. SettlementPolicy only makes the composition explicit.
 */
export function applyCombatSettlementPolicyV1(input) {
    const { state, policy } = input;
    if (!state || !policy)
        throw new Error('Combat settlement requires state and policy');
    const injuryBefore = Number(state.injury ?? 0);
    const directInjuryDelta = Number(policy.directInjuryDelta ?? 0);
    if (directInjuryDelta !== 0)
        state.injury = Math.min(100, injuryBefore + directInjuryDelta);

    let canonicalDeathPenaltyResult;
    if (policy.canonicalDeathPenalty) {
        if (typeof input.applyCanonicalDeathPenalty !== 'function')
            throw new Error(`Settlement policy ${policy.id} requires canonical death penalty callback`);
        canonicalDeathPenaltyResult = input.applyCanonicalDeathPenalty(policy.context);
    }

    return {
        schema: 'combat-settlement.v1',
        policyId: policy.id,
        activity: policy.activity,
        outcome: policy.outcome,
        directInjuryDelta,
        injuryBefore,
        injuryAfter: Number(state.injury ?? 0),
        canonicalDeathPenaltyApplied: Boolean(policy.canonicalDeathPenalty),
        canonicalDeathPenaltyResult,
    };
}

/* CombatKernel V3 facade. */
export class CombatKernelV3 {
    run(input) {
        const runtime = executeCombatRuntimeCompatV3(input);
        return {
            ...runtime,
            engineVersion: COMBAT_V3_ENGINE_VERSION,
            combatResult: {
                ...runtime.combatResult,
                engineVersion: COMBAT_V3_ENGINE_VERSION,
                replay: {
                    ...runtime.combatResult.replay,
                    engineVersion: COMBAT_V3_ENGINE_VERSION,
                },
            },
        };
    }
}

export function runCombatKernelV3(input) {
    return new CombatKernelV3().run(input);
}

export function combatKernelMechanicsProjectionV3(result) {
    return {
        seed: result.seed,
        duration: result.duration,
        winnerId: result.winnerId,
        loserId: result.loserId,
        draw: result.draw,
        logs: result.logs,
        finalState: result.finalState,
    };
}

/* Canonical encounter compiler and V2/V3 runners. */
const MODES = new Set(['realtime', 'headless', 'offline', 'simulation']);

function finiteDuration(value, fallback = 120) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}

function cloneEntity(entity) {
    return structuredClone(entity);
}

/**
 * Canonical encounter compiler for the V2->V3 migration boundary.
 *
 * It owns encounter identity/configuration while preserving the exact current
 * gameplay behavior. Pacing is explicit per consumer because PvP/benchmarks
 * historically did not apply V124 pacing at this boundary.
 */
export function compileCombatEncounterV1(input) {
    const entities = Array.isArray(input?.entities) ? input.entities : [];
    if (entities.length !== 2)
        throw new Error(`CombatEncounterCompiler requires exactly 2 entities; received ${entities.length}`);
    const mode = MODES.has(input.mode) ? input.mode : 'headless';
    const applyPacing = input.applyPacing === true;
    const preparedEntities = entities.map(entity => {
        const cloned = cloneEntity(entity);
        return applyPacing ? applyCombatPacingV124(cloned) : cloned;
    });
    const seed = Number(input.seed) >>> 0;
    const maxDuration = finiteDuration(input.maxDuration, 120);
    return {
        schema: 'combat-encounter.v1',
        encounterId: String(input.encounterId ?? `combat.${seed}`),
        activity: String(input.activity ?? 'combat'),
        seed,
        mode,
        maxDuration,
        applyPacing,
        entities: preparedEntities,
        metadata: structuredClone(input.metadata ?? {}),
    };
}

function bindEncounterIdentity(kernel, encounter) {
    const encounterIdentity = {
        encounterId: encounter.encounterId,
        activity: encounter.activity,
        mode: encounter.mode,
        maxDuration: encounter.maxDuration,
        metadata: structuredClone(encounter.metadata ?? {}),
    };
    return {
        ...kernel,
        combatResult: {
            ...kernel.combatResult,
            encounter: encounterIdentity,
            replay: {
                ...kernel.combatResult.replay,
                encounterId: encounter.encounterId,
                activity: encounter.activity,
            },
        },
    };
}

/** Execute a compiled encounter through the frozen CombatKernel V2 oracle. */
export function runCompiledCombatEncounterV2(encounter, registry) {
    if (encounter?.schema !== 'combat-encounter.v1')
        throw new Error('runCompiledCombatEncounterV2 requires combat-encounter.v1');
    const kernel = runCombatKernelV2({
        registry,
        seed: encounter.seed,
        entities: encounter.entities.map(cloneEntity),
        mode: encounter.mode,
        maxDuration: encounter.maxDuration,
    });
    return bindEncounterIdentity(kernel, encounter);
}

/** Execute a compiled encounter through the production CombatKernel V3 boundary. */
export function runCompiledCombatEncounterV3(encounter, registry) {
    if (encounter?.schema !== 'combat-encounter.v1')
        throw new Error('runCompiledCombatEncounterV3 requires combat-encounter.v1');
    const kernel = runCombatKernelV3({
        registry,
        seed: encounter.seed,
        entities: encounter.entities.map(cloneEntity),
        mode: encounter.mode,
        maxDuration: encounter.maxDuration,
    });
    return bindEncounterIdentity(kernel, encounter);
}
