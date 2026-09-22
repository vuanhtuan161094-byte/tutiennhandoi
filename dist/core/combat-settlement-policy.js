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
