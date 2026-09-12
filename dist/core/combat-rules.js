import { skillStandardCostPctV117 } from './skill-runtime-v117.js';
export const COMBAT_RULES = {
    physiqueHpMultiplier: 20,
    // V129: Bạo Kích is direct % and may exceed 100% to create real critical layers.
    // Né/Hội Tâm are naturally bounded probabilities; content is responsible for keeping them rare.
    cooldownNormalCapPct: 50,
    spiritEfficiencyCapPct: 50,
    actionSpeedMinMultiplier: 0.25,
    actionSpeedMaxMultiplier: 3,
    controlDurationReductionCapPct: 200 / 3,
    controlChainLimitSeconds: 5,
    controlChainResetGapSeconds: 1,
    controlImmunitySeconds: 3,
    breakDebuffSeconds: 5,
    breakStableSeconds: 3,
    breakDefenseReductionPct: 30,
    bossBreakDebuffEffectiveness: 0.5,
    elementResistanceMaxPct: 75,
    elementResistanceMinPct: -50,
    negativeResistanceEfficiency: 0.5,
    fiveElementCounterDamageBonusPct: 20,
    fiveElementCounterBreakBonusPct: 30,
    defaultHeartDamagePct: 125,
    defaultCritDamagePct: 150,
    defaultBloodBreathCapacityPct: 30,
    defaultBloodBreathAbsorbPctPerSecond: 5,
    defaultShieldCapMaxHpPct: 100,
    defaultOverhealShieldCapMaxHpPct: 50,
    directShieldOverflowDamageRatio: 0.25,
    dotLifestealEfficiency: 0.33,
};
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}
/**
 * V129 bounded-% composition.
 * Positive independent sources consume the remaining room to the authored ceiling instead of adding
 * into a hard cap. This keeps every source effective while making the final result order-independent.
 * Negative modifiers are penalties and subtract directly from the current effective value.
 */
export function combineBoundedPct(current = 0, added = 0, cap = 100) {
    const ceiling = Math.max(0, Number.isFinite(cap) ? cap : 100);
    if (ceiling <= 0)
        return 0;
    const c = clamp(current, 0, ceiling);
    const a = Number.isFinite(added) ? added : 0;
    if (a <= 0)
        return clamp(c + a, 0, ceiling);
    const source = clamp(a, 0, ceiling);
    return ceiling - (ceiling - c) * (1 - source / ceiling);
}
export function boundedStatCapV129(key) {
    if (key === 'damageReductionPct')
        return 80;
    if (key === 'controlDurationReductionPct')
        return COMBAT_RULES.controlDurationReductionCapPct;
    if (key === 'spiritEfficiencyPct')
        return COMBAT_RULES.spiritEfficiencyCapPct;
    if (key === 'dodgeChancePct' || key === 'heartChancePct' || key === 'armorPenPct')
        return 100;
    return undefined;
}
export function combineStatPctV129(key, current = 0, added = 0) {
    const cap = boundedStatCapV129(key);
    return cap === undefined ? (current ?? 0) + (added ?? 0) : combineBoundedPct(current, added, cap);
}
export function combatMaxHp(stats) {
    const authoredMaxHp = Math.max(0, Number.isFinite(stats.maxHp) ? stats.maxHp : 0);
    const derivedPhysiqueHp = Number.isFinite(stats.physique)
        ? Math.max(0, stats.physique) * COMBAT_RULES.physiqueHpMultiplier
        : 0;
    // V168 authority: physique owns the derived body lane, while authored maxHp may contain
    // independent raw/% HP from equipment/collection/integration. Use the stronger authored base once;
    // never add both representations of the same body HP together.
    const base = Number.isFinite(stats.physique)
        ? Math.max(derivedPhysiqueHp, authoredMaxHp)
        : authoredMaxHp;
    return Math.max(1, base * Math.max(0.01, stats.combatHpMultiplierV124 ?? 1));
}
export function combatSpiritStandard(stats) {
    return Math.max(0, stats.spiritStandard ?? stats.maxSpirit);
}
export function actionSpeedMultiplier(actionSpeed) {
    return clamp(actionSpeed, COMBAT_RULES.actionSpeedMinMultiplier, COMBAT_RULES.actionSpeedMaxMultiplier);
}
export function adjustedActionTime(baseSeconds, actionSpeed) {
    return Math.max(0, baseSeconds) / actionSpeedMultiplier(actionSpeed);
}
export function critProfile(stats, critChanceFlat = 0) {
    const raw = Math.max(0, (stats.critChancePct ?? 0) + critChanceFlat);
    const guaranteedLayers = Math.floor(raw / 100);
    const nextLayerChancePct = raw % 100;
    const damagePctPerLayer = Math.max(100, stats.critDamagePct ?? (100 + Math.max(0, stats.critPowerPerLayer) * 100));
    return { rawPct: raw, guaranteedLayers, nextLayerChancePct, damagePctPerLayer };
}
export function critLayerName(layers) {
    const names = ['—', 'Bạo Kích', 'Trọng Bạo', 'Cực Bạo', 'Thiên Bạo', 'Đạo Bạo', 'Hỗn Nguyên Bạo', 'Vô Cực Bạo'];
    if (layers <= 0)
        return names[0];
    return names[Math.min(layers, names.length - 1)] ?? `Vô Cực Bạo +${layers - names.length + 1}`;
}
export function heartProfile(stats, heartChanceFlat = 0) {
    const raw = Math.max(0, (stats.heartChancePct ?? 0) + heartChanceFlat);
    const chancePct = Math.min(100, raw);
    const damagePct = Math.max(100, stats.heartDamagePct ?? COMBAT_RULES.defaultHeartDamagePct);
    return { rawPct: raw, chancePct, damagePct };
}
export function dodgeProfile(stats, dodgeFlat = 0) {
    const raw = Math.max(0, (stats.dodgeChancePct ?? 0) + dodgeFlat);
    return { rawPct: raw, chancePct: Math.min(100, raw) };
}
export function defenseFactor(attack, defense, armorPenPct = 0) {
    const a = Math.max(0.0001, attack);
    const effectiveDefense = Math.max(0, defense * (1 - clamp(armorPenPct, 0, 100) / 100));
    return a / (a + effectiveDefense);
}
export function totalDamageReductionPct(stats, statuses = []) {
    let total = clamp(stats.damageReductionPct ?? 0, 0, 80);
    for (const status of statuses)
        total = combineBoundedPct(total, status.damageReductionPct ?? 0, 80);
    return total;
}
export function controlDurationReductionPct(stats, statuses = []) {
    let total = clamp(stats.controlDurationReductionPct ?? 0, 0, COMBAT_RULES.controlDurationReductionCapPct);
    for (const status of statuses)
        total = combineBoundedPct(total, status.controlDurationReductionPct ?? 0, COMBAT_RULES.controlDurationReductionCapPct);
    return total;
}
export function effectiveControlDuration(baseSeconds, reductionPct) {
    return Math.max(0, baseSeconds) * (1 - clamp(reductionPct, 0, COMBAT_RULES.controlDurationReductionCapPct) / 100);
}
export function trueEssenceEfficiencyPct(stats) {
    return clamp(stats.spiritEfficiencyPct ?? 0, 0, COMBAT_RULES.spiritEfficiencyCapPct);
}
export function skillTrueEssenceCost(skill, stats, statusCostMultiplier = 1) {
    const standard = combatSpiritStandard(stats);
    const preEfficiency = Math.max(0, skill.spiritCost) + standard * Math.max(0, skillStandardCostPctV117(skill)) / 100;
    const efficiency = trueEssenceEfficiencyPct(stats) / 100;
    return Math.max(0, preEfficiency * (1 - efficiency) * Math.max(0, statusCostMultiplier));
}
export function cooldownProfile(skill, rawReductionPct, cooldownIncreasePct, allowsOvercap) {
    const reductionCap = allowsOvercap ? 99.9 : COMBAT_RULES.cooldownNormalCapPct;
    const inputReduction = Math.max(0, Number(rawReductionPct) || 0);
    const skillReduction = Math.max(0, skill.cooldownReductionPct ?? 0);
    const raw = inputReduction + skillReduction;
    const appliedReductionPct = combineBoundedPct(combineBoundedPct(0, inputReduction, reductionCap), skillReduction, reductionCap);
    const overflowPct = Math.max(0, raw - appliedReductionPct);
    // V129: normal CDR overflow never turns into hidden Skill Damage.
    const overflowSkillDamagePct = 0;
    const currentBase = Math.max(0, skill.cooldown) * (1 + Math.max(-0.95, cooldownIncreasePct / 100));
    const floor = Math.max(0, skill.minimumCooldown ?? 0);
    const actualCooldown = Math.max(floor, currentBase * (1 - appliedReductionPct / 100));
    return { rawReductionPct: raw, appliedReductionPct, overflowPct, overflowSkillDamagePct, actualCooldown };
}
export function fiveElementCounter(attacker, defender) {
    if (!attacker || !defender)
        return false;
    return ((attacker === 'Metal' && defender === 'Wood')
        || (attacker === 'Wood' && defender === 'Earth')
        || (attacker === 'Earth' && defender === 'Water')
        || (attacker === 'Water' && defender === 'Fire')
        || (attacker === 'Fire' && defender === 'Metal'));
}
export function elementAffinity(stats, element) {
    const value = stats.elementalAffinities?.[element];
    return {
        pct: clamp(value?.pct ?? 0, 0, 100),
        evolutionMultiplier: Math.max(0, value?.evolutionMultiplier ?? 1),
    };
}
export function rawElementalDamage(attack, skillCoefficient, affinity) {
    return Math.max(0, attack) * Math.max(0, skillCoefficient) * (clamp(affinity.pct, 0, 100) / 100) * Math.max(0, affinity.evolutionMultiplier);
}
export function effectiveElementResistancePct(rawResistancePct) {
    return clamp(rawResistancePct, COMBAT_RULES.elementResistanceMinPct, COMBAT_RULES.elementResistanceMaxPct);
}
export function elementResistanceMultiplier(rawResistancePct) {
    const resistance = effectiveElementResistancePct(rawResistancePct);
    if (resistance >= 0)
        return 1 - resistance / 100;
    return 1 + (-resistance / 100) * COMBAT_RULES.negativeResistanceEfficiency;
}
export function fiveElementDamageMultiplier(isCounter) {
    return isCounter ? 1 + COMBAT_RULES.fiveElementCounterDamageBonusPct / 100 : 1;
}
export function fiveElementBreakMultiplier(isCounter) {
    return isCounter ? 1 + COMBAT_RULES.fiveElementCounterBreakBonusPct / 100 : 1;
}
export function combinedHeartCritMultiplier(heart, critLayers, heartDamagePct, critDamagePctPerLayer) {
    // V129: Hội Tâm adds its authored bonus once; every real Bạo Kích layer adds the crit bonus portion.
    // Example 125% Hội Tâm + two 150% crit layers = 225% total damage.
    let bonusPct = 0;
    if (heart)
        bonusPct += Math.max(0, heartDamagePct - 100);
    bonusPct += Math.max(0, Number(critLayers) || 0) * Math.max(0, critDamagePctPerLayer - 100);
    return 1 + bonusPct / 100;
}
//# sourceMappingURL=combat-rules.js.map