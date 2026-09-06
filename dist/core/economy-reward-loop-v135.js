export const REWARD_LOOP_V135_SCHEMA = 'reward-loop.v1.35';
export const HUNT_JACKPOT_SOFT_PITY_START_V135 = 50;
export const HUNT_JACKPOT_SOFT_PITY_CAP_SCORE_V135 = 240;
export const HUNT_JACKPOT_SOFT_PITY_MAX_MULTIPLIER_V135 = 4.5;
export const HUNT_OFFLINE_SPECIAL_OPPORTUNITY_FACTOR_V135 = .85;
const GRADE_DRY_WEIGHT_V135 = { common: 1, enhanced: 1.4, elite: 2.5, boss: 5 };
export function createRewardLoopV135State() {
    return { schema: REWARD_LOOP_V135_SCHEMA, hunt: { jackpotDryScore: 0, highestJackpotDryScore: 0, eligibleWins: 0, jackpotHits: 0, namedTreasureHits: 0, materialBundleHits: 0, onlineWins: 0, offlineWins: 0, onlineJackpotHits: 0, offlineJackpotHits: 0 }, telemetry: { equipmentSold: 0, equipmentDisassembled: 0, spiritStonesFromEquipmentSales: 0 } };
}
export function cloneRewardLoopV135State(state) {
    if (!state)
        return undefined;
    const base = createRewardLoopV135State();
    return { schema: REWARD_LOOP_V135_SCHEMA, hunt: { ...base.hunt, ...state.hunt, jackpotDryScore: Math.max(0, Math.min(HUNT_JACKPOT_SOFT_PITY_CAP_SCORE_V135, Number(state.hunt?.jackpotDryScore ?? 0) || 0)), highestJackpotDryScore: Math.max(0, Number(state.hunt?.highestJackpotDryScore ?? 0) || 0) }, telemetry: { ...base.telemetry, ...state.telemetry } };
}
export function ensureRewardLoopV135State(container) {
    const cloned = cloneRewardLoopV135State(container.v135RewardLoop);
    return container.v135RewardLoop = cloned ?? createRewardLoopV135State();
}
export function huntJackpotChanceV135(container, baseChancePct, context, offlineSpecialOpportunityFactor = HUNT_OFFLINE_SPECIAL_OPPORTUNITY_FACTOR_V135) {
    const state = ensureRewardLoopV135State(container), dry = Math.max(0, state.hunt.jackpotDryScore);
    const progress = Math.max(0, Math.min(1, (dry - HUNT_JACKPOT_SOFT_PITY_START_V135) / (HUNT_JACKPOT_SOFT_PITY_CAP_SCORE_V135 - HUNT_JACKPOT_SOFT_PITY_START_V135)));
    const softPityMultiplier = 1 + (HUNT_JACKPOT_SOFT_PITY_MAX_MULTIPLIER_V135 - 1) * Math.pow(progress, 1.2);
    const resolvedOfflineFactor = Math.max(HUNT_OFFLINE_SPECIAL_OPPORTUNITY_FACTOR_V135, Math.min(1, Number(offlineSpecialOpportunityFactor) || HUNT_OFFLINE_SPECIAL_OPPORTUNITY_FACTOR_V135));
    const specialOpportunityFactor = context === 'offline' ? resolvedOfflineFactor : 1;
    return { baseChancePct: Math.max(0, baseChancePct), effectiveChancePct: Math.min(12, Math.max(0, baseChancePct) * softPityMultiplier * specialOpportunityFactor), softPityMultiplier, specialOpportunityFactor, dryScore: dry };
}
export function settleHuntJackpotV135(container, grade, context, hit, namedTreasure = false) {
    const state = ensureRewardLoopV135State(container), h = state.hunt;
    h.eligibleWins += 1;
    if (context === 'offline')
        h.offlineWins += 1;
    else
        h.onlineWins += 1;
    if (hit) {
        h.jackpotHits += 1;
        if (context === 'offline')
            h.offlineJackpotHits += 1;
        else
            h.onlineJackpotHits += 1;
        if (namedTreasure)
            h.namedTreasureHits += 1;
        else
            h.materialBundleHits += 1;
        h.jackpotDryScore = 0;
    }
    else {
        h.jackpotDryScore = Math.min(HUNT_JACKPOT_SOFT_PITY_CAP_SCORE_V135, h.jackpotDryScore + GRADE_DRY_WEIGHT_V135[grade]);
        h.highestJackpotDryScore = Math.max(h.highestJackpotDryScore, h.jackpotDryScore);
    }
    return state;
}
export function recordEquipmentDispositionV135(container, input) {
    const t = ensureRewardLoopV135State(container).telemetry;
    t.equipmentSold += Math.max(0, Math.floor(input.sold));
    t.equipmentDisassembled += Math.max(0, Math.floor(input.disassembled));
    t.spiritStonesFromEquipmentSales += Math.max(0, Math.floor(input.spiritStonesFromSales));
}
export function rewardLoopSummaryV135(container, offlineSpecialOpportunityFactor = HUNT_OFFLINE_SPECIAL_OPPORTUNITY_FACTOR_V135) {
    const state = ensureRewardLoopV135State(container), h = state.hunt;
    const resolvedOfflineFactor = Math.max(HUNT_OFFLINE_SPECIAL_OPPORTUNITY_FACTOR_V135, Math.min(1, Number(offlineSpecialOpportunityFactor) || HUNT_OFFLINE_SPECIAL_OPPORTUNITY_FACTOR_V135));
    return { schema: state.schema, lootPhilosophy: { jackpot: true, softPityHidden: true, hardPity: false, targetFarmViaSources: true, offlineBaselineParityPct: 100, offlineSpecialOpportunityPct: resolvedOfflineFactor * 100, equipmentJunk: ['sell', 'disassemble'] }, hunt: { ...h, currentSoftPity: huntJackpotChanceV135(container, 1, 'online').softPityMultiplier }, telemetry: { ...state.telemetry } };
}
//# sourceMappingURL=economy-reward-loop-v135.js.map