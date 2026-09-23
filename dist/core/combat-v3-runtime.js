import { CombatEngine } from './combat.js';
import { prepareBossGameplayV2 } from './boss-gameplay-v2.js';
import { buildCombatResultV1 } from './combat-result-v1.js';

export const COMBAT_V3_ENGINE_VERSION = 'combat.v3';
export const COMBAT_V3_COMPAT_EXECUTOR = 'combat-engine.v168-compat';

/**
 * Phase-7 V3 boundary normalizer.
 *
 * V3 intentionally accepts only the locked combat model. Legacy entities remain
 * available through CombatKernelV2 for historical replay/compatibility, but new
 * V3 production fights cannot silently fall into the old damage path.
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
        if (entity.combatModel !== 'locked-v1')
            throw new Error(`CombatKernelV3 rejects unsupported combatModel for ${entity.id}: ${entity.combatModel ?? 'missing'}`);
        return structuredClone(entity);
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
    return {
        engineVersion: COMBAT_V3_ENGINE_VERSION,
        executor: COMBAT_V3_COMPAT_EXECUTOR,
        mode: input.mode,
        battle,
        combatResult,
        presentationPolicy: input.mode === 'realtime' ? 'timeline-1to1' : 'none',
    };
}
