import { CombatEngine } from './combat.js';
import { prepareBossGameplayV2 } from './boss-gameplay-v2.js';
import { buildCombatResultV1 } from './combat-result-v1.js';

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
