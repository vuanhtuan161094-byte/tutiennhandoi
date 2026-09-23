import { executeCombatRuntimeCompatV3, COMBAT_V3_ENGINE_VERSION } from './combat-v3-runtime.js';

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
