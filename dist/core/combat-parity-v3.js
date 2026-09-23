import { runCombatKernelV2, combatKernelMechanicsProjectionV2 } from './combat-kernel-v2.js';
import { runCombatKernelV3, combatKernelMechanicsProjectionV3 } from './combat-kernel-v3.js';

function stable(value) {
    if (Array.isArray(value))
        return `[${value.map(stable).join(',')}]`;
    if (value && typeof value === 'object')
        return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
    return JSON.stringify(value);
}

function same(a, b) {
    return stable(a) === stable(b);
}

function compareField(differences, name, a, b) {
    if (!same(a, b))
        differences.push({ field: name, v2: structuredClone(a), v3: structuredClone(b) });
}

/**
 * Deterministic V2↔V3 parity runner.
 *
 * V3 currently executes the locked V168 engine through its compatibility
 * executor, so parity is expected to be exact. Keeping this as a first-class
 * API means later subsystem extraction must continue proving the same contract.
 */
export function compareCombatKernelsV2V3(input) {
    const base = {
        registry: input.registry,
        seed: Number(input.seed) >>> 0,
        entities: structuredClone(input.entities),
        mode: input.mode ?? 'headless',
        maxDuration: input.maxDuration ?? 120,
    };
    const v2 = runCombatKernelV2({ ...base, entities: structuredClone(base.entities) });
    const v3 = runCombatKernelV3({ ...base, entities: structuredClone(base.entities) });

    const v2Projection = combatKernelMechanicsProjectionV2(v2.battle);
    const v3Projection = combatKernelMechanicsProjectionV3(v3.battle);
    const differences = [];
    compareField(differences, 'mechanics', v2Projection, v3Projection);
    compareField(differences, 'castCountsByActor', v2.combatResult.summary.castCountsByActor, v3.combatResult.summary.castCountsByActor);
    compareField(differences, 'damageByActor', v2.combatResult.summary.damageByActor, v3.combatResult.summary.damageByActor);
    compareField(differences, 'healingByActor', v2.combatResult.summary.healingByActor, v3.combatResult.summary.healingByActor);
    compareField(differences, 'shieldAbsorbedByActor', v2.combatResult.summary.shieldAbsorbedByActor, v3.combatResult.summary.shieldAbsorbedByActor);
    compareField(differences, 'phaseTransitions', v2.combatResult.summary.phaseTransitions, v3.combatResult.summary.phaseTransitions);
    compareField(differences, 'counterWindows', v2.combatResult.summary.counterWindows, v3.combatResult.summary.counterWindows);

    return {
        schema: 'combat-parity.v3',
        parity: differences.length === 0,
        seed: base.seed,
        mode: base.mode,
        maxDuration: base.maxDuration,
        differences,
        v2,
        v3,
    };
}
