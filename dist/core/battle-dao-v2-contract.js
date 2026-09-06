export const BATTLE_DAO_V2_SCHEMA = 'battle-dao.v2';
export function canGenerateDamagingFollowUpV2(b) { return b.followUpsUsed < b.followUpBudget; }
export function consumeDamagingFollowUpV2(b) {
    if (!canGenerateDamagingFollowUpV2(b))
        return b;
    return { ...b, followUpsUsed: b.followUpsUsed + 1 };
}
export function canUseDaoActiveV2(e, dao) { return e.mainDaoId === dao; }
export function canUseDaoCoreV2(e, dao) { return e.mainDaoId === dao; }
export function canLearnDaoPassiveV2(e, dao) { return e.mainDaoId === dao || e.secondaryDaoId === dao; }
export function daoPassiveStrengthV2(e, dao) { return canLearnDaoPassiveV2(e, dao) ? 1 : 0; }
export const SWORD_V2_DEFAULTS = {
    swordQiCap: 5,
    swordQiSkillDamagePctPerStack: 4,
    swordQiBreakPctPerStack: 3,
    swordQiFullFollowUpCoefficient: .40,
    swordQiFullFollowUpSpend: 2,
    swordIntentCap: 20,
    swordIntentDurationSeconds: 12,
    swordIntentDecayEverySeconds: 1,
    swordIntentActionsPerStack: 3,
};
export function createSwordCoreStateV2() { return { swordQi: 0, swordQiCap: SWORD_V2_DEFAULTS.swordQiCap }; }
export function createSwordIntentStateV2(now = 0) { return { id: 'swordIntent', stacks: 0, cap: SWORD_V2_DEFAULTS.swordIntentCap, durationSeconds: SWORD_V2_DEFAULTS.swordIntentDurationSeconds, expiresAt: now, decayEverySeconds: SWORD_V2_DEFAULTS.swordIntentDecayEverySeconds, directActionCounter: 0 }; }
export function addSwordIntentV2(state, amount, now) {
    const gain = Math.max(0, Math.floor(amount));
    if (gain <= 0)
        return state;
    return { ...state, stacks: Math.min(state.cap, state.stacks + gain), expiresAt: now + state.durationSeconds, nextDecayAt: undefined };
}
export function advanceSwordIntentDecayV2(state, now) {
    if (state.stacks <= 0)
        return { ...state, stacks: 0, nextDecayAt: undefined };
    if (now < state.expiresAt)
        return state;
    let next = state.nextDecayAt ?? state.expiresAt + state.decayEverySeconds;
    let stacks = state.stacks;
    while (stacks > 0 && now >= next) {
        stacks--;
        next += state.decayEverySeconds;
    }
    return { ...state, stacks, nextDecayAt: stacks > 0 ? next : undefined };
}
export const REMAINING_DAO_V2_DEFAULTS = {
    fist: { coreCap: 5, passiveStackCap: 20, passiveDurationSeconds: 12 },
    body: { coreCap: 100, passiveStackCap: 20, passiveDurationSeconds: 12 },
    spell: { coreCap: 3, passiveStackCap: 20, passiveDurationSeconds: 12 },
    poison: { coreCap: 4, passiveStackCap: 20, passiveDurationSeconds: 12 },
    artifact: { coreCap: 3, passiveStackCap: 20, passiveDurationSeconds: 12 },
    formation: { nurtureCap: 100, integrityCap: 100, passiveStackCap: 20, passiveDurationSeconds: 12 },
    mind: { echoEvery: 3, echoCoefficient: .35, passiveStackCap: 20, passiveDurationSeconds: 12 },
};
export function createFistCoreStateV2() { return { fistForce: 0, fistForceCap: REMAINING_DAO_V2_DEFAULTS.fist.coreCap }; }
export function createBodyCoreStateV2() { return { counterForce: 0, counterForceCap: REMAINING_DAO_V2_DEFAULTS.body.coreCap }; }
export function createSpellCoreStateV2() { return { lawWheelForms: [], lawWheelCap: REMAINING_DAO_V2_DEFAULTS.spell.coreCap }; }
export function createPoisonCoreStateV2() { return { poisonSeedStage: 0, poisonSeedCap: REMAINING_DAO_V2_DEFAULTS.poison.coreCap }; }
export function createArtifactCoreStateV2() { return { artifactSources: 1, artifactSourceCap: REMAINING_DAO_V2_DEFAULTS.artifact.coreCap }; }
export function createFormationCoreStateV2() { return { deployed: false, nurture: 0, nurtureCap: 100, integrity: 0, integrityCap: 100 }; }
export function createMindCoreStateV2() { return { eligibleActiveCount: 0, echoEvery: REMAINING_DAO_V2_DEFAULTS.mind.echoEvery, echoCoefficient: REMAINING_DAO_V2_DEFAULTS.mind.echoCoefficient }; }
//# sourceMappingURL=battle-dao-v2-contract.js.map