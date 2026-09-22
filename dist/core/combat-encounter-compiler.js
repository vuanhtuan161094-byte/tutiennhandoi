import { applyCombatPacingV124 } from './combat-pacing-v124.js';
import { runCombatKernelV2 } from './combat-kernel-v2.js';

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

/** Execute a compiled encounter through the frozen CombatKernel V2 oracle. */
export function runCompiledCombatEncounterV2(encounter, registry) {
    if (encounter?.schema !== 'combat-encounter.v1')
        throw new Error('runCompiledCombatEncounterV2 requires combat-encounter.v1');
    return runCombatKernelV2({
        registry,
        seed: encounter.seed,
        entities: encounter.entities.map(cloneEntity),
        mode: encounter.mode,
        maxDuration: encounter.maxDuration,
    });
}
