import { CombatEngine } from './combat.js';
import { prepareBossGameplayV2 } from './boss-gameplay-v2.js';
import { analyzeBattle } from './combat-analytics.js';
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
const CRITICAL = new Set([
    'boss.phase_entered',
    'boss.counter_opened',
    'boss.counter_succeeded',
    'boss.counter_failed',
    'entity.defeated',
    'battle.ended',
]);
const ACTION = new Set([
    'action.cast_started',
    'action.resolved',
    'hit.missed',
    'hit.heart',
    'hit.critical',
    'damage.applied',
    'heal.applied',
    'shield.applied',
    'shield.absorbed',
    'shield.broken',
    'break.changed',
    'trigger.fired',
]);

function importanceFor(type) {
    return CRITICAL.has(type) ? 'CRITICAL' : ACTION.has(type) ? 'ACTION' : 'DETAIL';
}

function typedName(log) {
    if (log.type === 'battleStart') return 'battle.started';
    if (log.type === 'castStart') return 'action.cast_started';
    if (log.type === 'skillResolve') return 'action.resolved';
    if (log.type === 'dodge') return 'hit.missed';
    if (log.type === 'heart') return 'hit.heart';
    if (log.type === 'crit') return 'hit.critical';
    if (log.type === 'damage') return 'damage.applied';
    if (log.type === 'heal') return 'heal.applied';
    if (log.type === 'shieldBreak') return 'shield.broken';
    if (log.type === 'shield') return typeof log.data?.absorbed === 'number' ? 'shield.absorbed' : 'shield.applied';
    if (log.type === 'status') return log.data?.immune === true ? 'status.resisted' : 'status.applied';
    if (log.type === 'info' && typeof log.data?.removed === 'number') return 'status.removed';
    if (log.type === 'resource') return 'resource.changed';
    if (log.type === 'break') return 'break.changed';
    if (log.type === 'phase') return 'boss.phase_entered';
    if (log.type === 'counterWindow') {
        if (log.data?.opens === true) return 'boss.counter_opened';
        if (log.data?.success === true) return 'boss.counter_succeeded';
        if (log.data?.failure === true) return 'boss.counter_failed';
        return 'boss.counter_progressed';
    }
    if (log.type === 'trigger') return 'trigger.fired';
    if (log.type === 'death') return 'entity.defeated';
    if (log.type === 'battleEnd') return 'battle.ended';
    if (log.type === 'channel') return 'action.channel_changed';
    if (log.type === 'reaction') return 'effect.reaction';
    if (log.type === 'mark') return 'effect.mark_changed';
    return 'combat.info';
}

function animationTagFor(log, type, registry) {
    if (type === 'entity.defeated') return 'death';
    if (type === 'heal.applied') return 'heal';
    if (type === 'shield.applied' || type === 'shield.absorbed') return 'shield';
    if (type === 'shield.broken') return 'shield_break';
    if (type === 'break.changed' && log.data?.broken === true) return 'break';
    if (type === 'hit.missed') return 'dodge';
    if (type.startsWith('boss.counter_')) return 'boss_counter';
    if (type === 'boss.phase_entered') return 'boss_phase';
    const skillId = log.skillId;
    if (!skillId || !registry?.skills?.has(skillId)) return undefined;
    const skill = registry.skill(skillId);
    const tags = new Set(skill.tags ?? []);
    if (skill.channel) return 'channel';
    if (tags.has('BossUltimate')) return 'boss_ultimate';
    if (tags.has('Heal') || tags.has('Sustain')) return 'heal';
    if (tags.has('Shield') || tags.has('Guard')) return 'shield';
    if (tags.has('Sword')) return tags.has('Heavy') || tags.has('Finisher') ? 'sword_finisher' : 'sword_slash';
    if (tags.has('Heavy')) return 'melee_heavy';
    if (tags.has('Spell')) return 'ranged_spell';
    if (tags.has('Basic')) return 'melee_light';
    return 'skill';
}

function isRetiredPlayerFacingResource(log) {
    return log.type === 'resource'
        && log.data?.artifactRuntime === 'artifact.v88'
        && log.data?.artifactEvent === 'baoQi';
}

function sanitizePlayerFacingData(data) {
    const clean = structuredClone(data ?? {});
    // V150 retired Bảo Khí as a live player resource. Artifact trigger/cooldown
    // events remain valid, but their compatibility-only Bảo Khí bookkeeping
    // must never enter the typed Godot-facing contract.
    delete clean.baoQi;
    delete clean.baoQiMax;
    delete clean.baoQiCost;
    delete clean.baoQiGain;
    return clean;
}

function countByActor(events, type) {
    const out = {};
    for (const event of events) {
        if (event.type !== type || !event.actorId) continue;
        out[event.actorId] = (out[event.actorId] ?? 0) + 1;
    }
    return out;
}

function castCounts(events) {
    const byActor = {};
    for (const event of events) {
        if (event.type !== 'action.cast_started' || !event.actorId || !event.skillId) continue;
        const actor = byActor[event.actorId] ??= {};
        actor[event.skillId] = (actor[event.skillId] ?? 0) + 1;
    }
    return byActor;
}

function numericActorMap(analytics, field) {
    return Object.fromEntries(Object.entries(analytics.combatants).map(([id, row]) => [id, Number(row[field] ?? 0)]));
}

/**
 * Final typed adapter shared by V2 now and V3 later.
 * Raw human-readable logs remain compatibility/debug only and are not required
 * by this contract.
 */
export function buildCombatResultV1(input) {
    const { battle, registry } = input;
    if (!battle)
        throw new Error('CombatResultV1 requires a battle');
    const maxDuration = Number(input.maxDuration ?? battle.duration);
    const actionSeq = {};
    const activeAction = {};
    const events = [];

    for (let index = 0; index < battle.logs.length; index += 1) {
        const log = battle.logs[index];
        if (isRetiredPlayerFacingResource(log))
            continue;
        const type = typedName(log);
        let actionId;
        if (log.type === 'castStart' && log.actorId) {
            const seq = (actionSeq[log.actorId] ?? 0) + 1;
            actionSeq[log.actorId] = seq;
            actionId = `${log.actorId}.action.${seq}`;
            activeAction[log.actorId] = { id: actionId, skillId: log.skillId };
        }
        else if (log.actorId && log.skillId && activeAction[log.actorId]?.skillId === log.skillId) {
            actionId = activeAction[log.actorId].id;
        }

        const data = sanitizePlayerFacingData(log.data);
        const event = {
            schema: 'combat-event.v1',
            id: `combat-event.v1.${index}`,
            sequence: index,
            time: Number(log.time ?? 0),
            type,
            importance: importanceFor(type),
            actorId: log.actorId,
            targetId: log.targetId,
            skillId: log.skillId,
            actionId,
            animationTag: animationTagFor(log, type, registry),
            data,
            message: String(log.message ?? ''),
        };
        if (type === 'action.cast_started') {
            event.startedAt = event.time;
            event.resolvedAt = event.time + Math.max(0, Number(data.castTime ?? 0));
            event.impactAt = event.resolvedAt;
        }
        else if (type === 'action.resolved') {
            event.resolvedAt = event.time;
            event.impactAt = event.time;
        }
        else if (['damage.applied', 'heal.applied', 'shield.applied', 'shield.absorbed', 'shield.broken', 'hit.missed', 'hit.heart', 'hit.critical', 'break.changed'].includes(type)) {
            event.impactAt = event.time;
        }
        events.push(event);
    }

    const analytics = analyzeBattle(battle);
    const phases = events.filter(event => event.type === 'boss.phase_entered').map(event => ({
        time: event.time,
        actorId: event.actorId,
        targetId: event.targetId,
        phaseId: String(event.data.phaseId ?? ''),
        phaseName: String(event.data.phaseName ?? ''),
        hpPct: Number(event.data.hpPct ?? 0),
    }));
    const counters = events.filter(event => event.type.startsWith('boss.counter_')).map(event => ({
        time: event.time,
        type: event.type,
        actorId: event.actorId,
        targetId: event.targetId,
        skillId: event.skillId,
        counterWindowId: String(event.data.counterWindowId ?? ''),
        counterWindowName: String(event.data.counterWindowName ?? ''),
        progress: Number(event.data.progress ?? 0),
        required: Number(event.data.required ?? 0),
    }));

    const livingCount = Object.values(battle.finalState ?? {}).filter(state => state?.alive === true).length;
    const timedOut = Boolean(battle.draw)
        && livingCount > 1
        && Number.isFinite(maxDuration)
        && Number(battle.duration) >= maxDuration - 1e-9;
    const outcome = battle.draw ? (timedOut ? 'timeout' : 'draw') : 'victory';
    const result = {
        schema: 'combat-result.v1',
        engineVersion: String(input.engineVersion ?? 'combat.v2'),
        seed: Number(battle.seed) >>> 0,
        outcome,
        duration: Number(battle.duration ?? 0),
        maxDuration,
        timedOut,
        draw: Boolean(battle.draw),
        winnerId: battle.winnerId,
        loserId: battle.loserId,
        finalState: structuredClone(battle.finalState ?? {}),
        events,
        summary: {
            castCountsByActor: castCounts(events),
            damageByActor: numericActorMap(analytics, 'damageDealt'),
            damageBySkillByActor: Object.fromEntries(Object.entries(analytics.combatants).map(([id, row]) => [id, { ...(row.damageBySkill ?? {}) }])),
            healingByActor: numericActorMap(analytics, 'healingDone'),
            healingBySkillByActor: Object.fromEntries(Object.entries(analytics.combatants).map(([id, row]) => [id, { ...(row.healingBySkill ?? {}) }])),
            shieldAbsorbedByActor: numericActorMap(analytics, 'shieldAbsorbed'),
            dodgesByActor: numericActorMap(analytics, 'dodges'),
            critEventsByActor: numericActorMap(analytics, 'critEvents'),
            heartEventsByActor: countByActor(events, 'hit.heart'),
            phaseTransitions: phases,
            counterWindows: counters,
        },
        replay: {
            engineVersion: String(input.engineVersion ?? 'combat.v2'),
            seed: Number(battle.seed) >>> 0,
        },
    };

    const ended = events.findLast?.(event => event.type === 'battle.ended')
        ?? [...events].reverse().find(event => event.type === 'battle.ended');
    if (ended) {
        ended.data = {
            ...ended.data,
            outcome: result.outcome,
            winnerId: result.winnerId,
            loserId: result.loserId,
            draw: result.draw,
            timedOut: result.timedOut,
            duration: result.duration,
        };
    }
    return result;
}

export class CombatKernelV2 {
    run(input) {
        const entities = input.entities.map(entity => prepareBossGameplayV2(entity));
        const engine = new CombatEngine(input.registry, input.seed, entities);
        const maxDuration = input.maxDuration ?? 120;
        const battle = engine.run(maxDuration);
        const combatResult = buildCombatResultV1({
            battle,
            registry: input.registry,
            maxDuration,
            engineVersion: 'combat.v2',
        });
        return {
            mode: input.mode,
            battle,
            combatResult,
            presentationPolicy: input.mode === 'realtime' ? 'timeline-1to1' : 'none',
        };
    }
}
export function runCombatKernelV2(input) {
    return new CombatKernelV2().run(input);
}
/** Stable mechanics projection used by parity gates. Mode/presentation metadata is intentionally excluded. */
export function combatKernelMechanicsProjectionV2(result) {
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
//# sourceMappingURL=combat-kernel-v2.js.map

/**
 * Combat V3 migration/runtime boundary.
 *
 * Hosted in the existing combat-kernel-v2 compatibility module to preserve the
 * locked eager-browser module budget while V2 remains the parity/historical oracle.
 * Logical V3 authority remains exposed only through the V3 exports below.
 */
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
