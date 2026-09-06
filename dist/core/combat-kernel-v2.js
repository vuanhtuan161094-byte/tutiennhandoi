import { CombatEngine } from './combat.js';
import { prepareBossGameplayV2 } from './boss-gameplay-v2.js';
export class CombatKernelV2 {
    run(input) {
        const entities = input.entities.map(entity => prepareBossGameplayV2(entity));
        const engine = new CombatEngine(input.registry, input.seed, entities);
        const battle = engine.run(input.maxDuration ?? 120);
        return {
            mode: input.mode,
            battle,
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