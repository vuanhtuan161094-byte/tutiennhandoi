import { actionSpeedMultiplier, adjustedActionTime, combatMaxHp, defenseFactor as v2DefenseFactor, combineBoundedPct, combineStatPctV129, } from './combat-rules.js';
import { fistPassiveDefensePctV2, swordIntentBonusesV2, syncBattleDaoV2Timers } from './battle-dao-v2-runtime.js';
import { mindPassiveBonusesV2 } from './mind-dao-v2-runtime.js';
function simpleSetParam(entity, mechanic, key) {
    return entity.combatBuildV117?.activeSetMechanics?.find(x => x.mechanic === mechanic)?.params[key] ?? 0;
}
export function effectiveStats(entity, registry, now) {
    // Alpha.23.18: five-element equipment Sets expose direct stats only. No extra elemental meter is required.
    const setArmorPenPct = simpleSetParam(entity, 'simple_metal_armor_pen', 'armorPenPct');
    const setHealingPct = simpleSetParam(entity, 'simple_wood_healing', 'healingPct');
    const setLifeStealPct = simpleSetParam(entity, 'simple_wood_lifesteal', 'lifeStealPct');
    const setSpiritEfficiencyPct = simpleSetParam(entity, 'simple_water_spirit_efficiency', 'spiritEfficiencyPct');
    const setCritChancePct = simpleSetParam(entity, 'simple_fire_crit', 'critChancePct');
    const setCritDamagePct = simpleSetParam(entity, 'simple_fire_crit_damage', 'critDamagePct');
    const setDefensePct = simpleSetParam(entity, 'simple_earth_defense', 'defensePct');
    const setDamageReductionPct = simpleSetParam(entity, 'simple_earth_damage_reduction', 'damageReductionPct');
    let attackMul = 1;
    let defenseMul = 1;
    let mobilityMul = 1;
    let accuracyMul = 1;
    let actionSpeedMul = 1;
    let resolveMul = 1;
    let controlPowerMul = 1;
    let dodgeChancePct = entity.baseStats.dodgeChancePct ?? 0;
    let heartChancePct = entity.baseStats.heartChancePct ?? 0;
    let critFlat = 0;
    let damageReductionPct = combineStatPctV129('damageReductionPct', entity.baseStats.damageReductionPct ?? 0, setDamageReductionPct);
    let healingEffectivenessPct = (entity.baseStats.healingEffectivenessPct ?? 0) + setHealingPct;
    let controlDurationReductionPct = entity.baseStats.controlDurationReductionPct ?? 0;
    const resistances = { ...(entity.baseStats.elementalResistancesPct ?? {}) };
    for (const active of entity.statuses) {
        if (active.expiresAt <= now)
            continue;
        const def = registry.status(active.id);
        attackMul *= def.attackMultiplier ?? 1;
        defenseMul *= def.defenseMultiplier ?? 1;
        mobilityMul *= def.mobilityMultiplier ?? 1;
        accuracyMul *= def.accuracyMultiplier ?? 1;
        actionSpeedMul *= def.actionSpeedMultiplier ?? 1;
        resolveMul *= def.resolveMultiplier ?? 1;
        controlPowerMul *= def.controlPowerMultiplier ?? 1;
        dodgeChancePct = combineStatPctV129('dodgeChancePct', dodgeChancePct, def.dodgeChancePctFlat ?? 0);
        heartChancePct = combineStatPctV129('heartChancePct', heartChancePct, def.heartChancePctFlat ?? 0);
        critFlat += def.critChancePctFlat ?? 0;
        damageReductionPct = combineStatPctV129('damageReductionPct', damageReductionPct, def.damageReductionPct ?? 0);
        healingEffectivenessPct += def.healingEffectivenessPct ?? 0;
        controlDurationReductionPct = combineStatPctV129('controlDurationReductionPct', controlDurationReductionPct, def.controlDurationReductionPct ?? 0);
        for (const [element, amount] of Object.entries(def.elementalResistancePct ?? {})) {
            const key = element;
            resistances[key] = combineBoundedPct(resistances[key] ?? 0, amount ?? 0, 75);
        }
    }
    // Thất Thế: -30% Defense; boss receives 50% debuff effect => -15%.
    if (entity.breakDebuffUntil > now) {
        const bossEffectiveness = entity.tags.includes('Boss') ? 0.5 : 1;
        defenseMul *= 1 - 0.30 * bossEffectiveness;
    }
    syncBattleDaoV2Timers(entity, now);
    const swordV2 = swordIntentBonusesV2(entity, now);
    const fistDefensePct = fistPassiveDefensePctV2(entity, now);
    const mindV2 = mindPassiveBonusesV2(entity, now);
    const mindActionAccuracyPct = Math.max(0, Number(entity.pendingSetFlagsV117?.mindV2ActionAccuracyPct ?? 0));
    const mindActionControlPowerPct = Math.max(0, Number(entity.pendingSetFlagsV117?.mindV2ActionControlPowerPct ?? 0));
    heartChancePct = combineStatPctV129('heartChancePct', heartChancePct, swordV2.heartChancePct);
    const armorPenPct = combineStatPctV129('armorPenPct',
        combineStatPctV129('armorPenPct', entity.baseStats.armorPenPct ?? 0, setArmorPenPct),
        swordV2.armorPenPct);
    const result = {
        ...entity.baseStats,
        maxHp: combatMaxHp(entity.baseStats),
        attack: entity.baseStats.attack * attackMul,
        defense: entity.baseStats.defense * defenseMul * (1 + (setDefensePct + fistDefensePct) / 100),
        mobility: entity.baseStats.mobility * mobilityMul,
        accuracy: entity.baseStats.accuracy * accuracyMul * (1 + mindActionAccuracyPct / 100),
        actionSpeed: actionSpeedMultiplier(entity.baseStats.actionSpeed * actionSpeedMul),
        resolve: entity.baseStats.resolve * resolveMul * (1 + mindV2.resolvePct / 100),
        controlPower: entity.baseStats.controlPower * controlPowerMul * (1 + mindActionControlPowerPct / 100),
        dodgeChancePct,
        heartChancePct,
        critChancePct: entity.baseStats.critChancePct + critFlat + setCritChancePct + swordV2.critChancePct,
        armorPenPct,
        lifeStealPct: (entity.baseStats.lifeStealPct ?? 0) + setLifeStealPct,
        spiritEfficiencyPct: combineStatPctV129('spiritEfficiencyPct', entity.baseStats.spiritEfficiencyPct ?? 0, setSpiritEfficiencyPct),
        critDamagePct: setCritDamagePct > 0
            ? (entity.baseStats.critDamagePct ?? (100 + Math.max(0, entity.baseStats.critPowerPerLayer) * 100)) + setCritDamagePct
            : entity.baseStats.critDamagePct,
        damageReductionPct,
        healingEffectivenessPct,
        controlDurationReductionPct,
        elementalResistancesPct: resistances,
    };
    return result;
}
/** Locked Công Lực-vs-Phòng Ngự curve: A / (A + D). */
export function defenseFactor(attack, defense) {
    return v2DefenseFactor(attack, defense, 0);
}
/**
 * Legacy helper retained for old analytics/self-tests. Combat v0.95 no longer uses crit layers;
 * V129 real combat keeps direct Bạo Kích %; values above 100% create additional named critical layers.
 */
export function critLayers(critChancePct, roll01) {
    const guaranteed = Math.floor(Math.max(0, critChancePct) / 100);
    const remainder = Math.max(0, critChancePct) % 100;
    return guaranteed + (roll01 * 100 < remainder ? 1 : 0);
}
/** Legacy helper retained for compatibility with old content/tests. */
export function critMultiplier(layers, critPowerPerLayer) {
    return 1 + Math.max(0, layers) * Math.max(0, critPowerPerLayer);
}
/** F five-stat Dodge contest base: Mobility vs Accuracy with anti-streak pressure. */
export function evadeChancePct(mobility, accuracy, dodgePressure) {
    const m = Math.max(1, mobility);
    const a = Math.max(1, accuracy);
    const ratio = m / a;
    const centered = ratio - 1;
    const raw = 15 + 50 * (centered / (1 + Math.abs(centered)));
    const pressurePenalty = Math.min(35, Math.max(0, dodgePressure) * 7);
    return Math.max(2, Math.min(65, raw - pressurePenalty));
}
export function contestedDodgeChancePctV5(mobility, accuracy, directDodgeChancePct = 0, dodgePressure = 0) {
    return combineBoundedPct(evadeChancePct(mobility, accuracy, dodgePressure), Math.max(0, Number(directDodgeChancePct) || 0), 75);
}
export function adjustedCastTime(baseCastTime, actionSpeed) {
    return adjustedActionTime(baseCastTime, actionSpeed);
}
export function adjustedRecoveryTime(baseRecoveryTime, actionSpeed) {
    return adjustedActionTime(baseRecoveryTime, actionSpeed);
}
//# sourceMappingURL=stats.js.map