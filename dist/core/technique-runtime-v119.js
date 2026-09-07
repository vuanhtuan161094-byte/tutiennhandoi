import { skillDomainsV117, skillRuntimeV117 } from './skill-runtime-v117.js';
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const TECHNIQUE_COST_REDUCTION_CAP_V119 = 40;
export const TECHNIQUE_CAST_REDUCTION_CAP_V119 = 60;
export const TECHNIQUE_RECOVERY_REDUCTION_CAP_V119 = 60;
export const TECHNIQUE_COOLDOWN_REDUCTION_CAP_V119 = 50;
export function equippedTechniqueDefinitionsV119(state, lookup) {
    const ids = [state.activeTechniqueId, state.equippedTechniqueIds?.art, state.equippedTechniqueIds?.movement, state.equippedTechniqueIds?.secret].filter((x) => Boolean(x));
    const out = [];
    for (const id of [...new Set(ids)]) {
        try {
            out.push(lookup(id));
        }
        catch { }
    }
    return out;
}
/** V144 compatibility shim. V103/V119 manual state is migrated but no longer owns live combat. */
export function resolveTechniqueRuntimeV119(_state, _lookup) {
    return {
        runtime: { sourceTechniqueIds: [], masteryByTechniqueId: {}, modifiers: [], rules: [] },
        fixedRootBindings: {},
        staticMaxSpiritPct: 0, staticDodgeFlatPct: 0, staticActionSpeedPct: 0, staticSpiritRegenPct: 0,
        learnedPassiveIds: [], unlockedVariantIds: [], trueMeaningIds: [],
    };
}
function effectiveRoot(entity, skill) { return skill.runtimeV117?.primaryRoot ?? entity.combatBuildV117?.skillRootBindingsV118?.[skill.id]; }
function techniqueDomains(entity, skill) {
    const out = new Set(skillDomainsV117(skill));
    const r = skillRuntimeV117(skill);
    const root = effectiveRoot(entity, skill);
    if (root) {
        out.add(`Root:${root}`);
        out.add('HasRoot');
    }
    if (r.costClass)
        out.add(`Cost:${r.costClass}`);
    if ((r.spend?.length ?? 0) > 0)
        out.add('ElementSpend');
    if ((r.generate?.length ?? 0) > 0)
        out.add('ElementGenerate');
    if ((skill.daoRuntimeV118?.spend?.length ?? 0) > 0)
        out.add('DaoSpend');
    if ((skill.daoRuntimeV118?.generate?.length ?? 0) > 0)
        out.add('DaoGenerate');
    return out;
}
function conditionOk(entity, condition, now) {
    const c = condition ?? 'always';
    if (c === 'always')
        return true;
    const max = Math.max(1, entity.baseStats.maxSpirit);
    const pct = entity.spirit / max * 100;
    if (c === 'spiritBelow30')
        return pct < 30;
    if (c === 'spiritAbove50')
        return pct > 50;
    if (c === 'spiritMid35To65')
        return pct >= 35 && pct <= 65;
    if (c === 'gaugeAbove80')
        return entity.ultimateGaugeV117 >= 80;
    if (c === 'afterDodge')
        return (entity.pendingSetFlagsV117['techniqueAfterDodgeUntil'] ?? 0) > now;
    if (c === 'afterInterrupt')
        return (entity.pendingSetFlagsV117['techniqueAfterInterruptUntil'] ?? 0) > now;
    if (c === 'afterDaoSpend')
        return (entity.pendingSetFlagsV117['techniqueAfterDaoSpendUntil'] ?? 0) > now;
    if (c === 'secretBurst')
        return (entity.pendingSetFlagsV117['techniqueSecretBurstUntil'] ?? 0) > now;
    if (c === 'secretAftermath')
        return (entity.pendingSetFlagsV117['techniqueSecretAftermathUntil'] ?? 0) > now;
    return false;
}
function domainOk(domains, domain) { return !domain || domains.has(domain); }
export function techniqueModifierTotalV119(entity, skill, kind, now) {
    const runtime = entity.combatBuildV117?.techniqueRuntimeV119;
    if (!runtime)
        return 0;
    const domains = techniqueDomains(entity, skill);
    let total = 0;
    for (const m of runtime.modifiers)
        if (m.kind === kind && conditionOk(entity, m.condition, now) && domainOk(domains, m.domain))
            total += m.value;
    return total;
}
export function techniqueSpiritCostMultiplierV119(entity, skill, now) { return 1 - clamp(techniqueModifierTotalV119(entity, skill, 'spiritCostReductionPct', now), -100, TECHNIQUE_COST_REDUCTION_CAP_V119) / 100; }
export function techniqueCastMultiplierV119(entity, skill, now) { return 1 - clamp(techniqueModifierTotalV119(entity, skill, 'castTimeReductionPct', now), -100, TECHNIQUE_CAST_REDUCTION_CAP_V119) / 100; }
export function techniqueRecoveryMultiplierV119(entity, skill, now) { return 1 - clamp(techniqueModifierTotalV119(entity, skill, 'recoveryReductionPct', now), -100, TECHNIQUE_RECOVERY_REDUCTION_CAP_V119) / 100; }
export function techniqueCooldownReductionPctV119(entity, skill, now) { return clamp(techniqueModifierTotalV119(entity, skill, 'cooldownReductionPct', now), -100, TECHNIQUE_COOLDOWN_REDUCTION_CAP_V119); }
export function techniqueInterruptResistPctV119(entity, skill, now) { return clamp(techniqueModifierTotalV119(entity, skill, 'interruptResistPct', now), 0, 60); }
export function techniqueGaugeMultiplierV119(entity, skill, now) { return Math.max(0, 1 + techniqueModifierTotalV119(entity, skill, 'gaugeGainPct', now) / 100); }
export function techniqueElementGenerateMultiplierV119(entity, skill, now) { return Math.max(0, 1 + techniqueModifierTotalV119(entity, skill, 'elementGeneratePct', now) / 100); }
export function techniqueDaoGenerateMultiplierV119(entity, skill, now) { return Math.max(0, 1 + techniqueModifierTotalV119(entity, skill, 'daoGeneratePct', now) / 100); }
export function techniqueEligibleEffectBonusPctV119(entity, skill, now) { return techniqueModifierTotalV119(entity, skill, 'eligibleEffectPct', now) + techniqueModifierTotalV119(entity, skill, 'defenseEffectPct', now) + techniqueModifierTotalV119(entity, skill, 'shieldEffectPct', now) + techniqueModifierTotalV119(entity, skill, 'healingEffectPct', now); }
export function techniqueEquippedMasteryV119(entity, techniqueId) { return clamp(entity.combatBuildV117?.techniqueRuntimeV119?.masteryByTechniqueId?.[techniqueId] ?? 0, 0, 100); }
export function techniqueGlobalModifierTotalV119(entity, kind, now) {
    const runtime = entity.combatBuildV117?.techniqueRuntimeV119;
    if (!runtime)
        return 0;
    let total = 0;
    for (const m of runtime.modifiers)
        if (m.kind === kind && !m.domain && conditionOk(entity, m.condition, now))
            total += m.value;
    return total;
}
export function techniqueDamageReductionAdjustmentPctV119(entity, now) { return techniqueGlobalModifierTotalV119(entity, 'damageReductionPct', now); }
export function techniqueSpiritRegenMultiplierV119(entity, now) { return Math.max(0, 1 + techniqueGlobalModifierTotalV119(entity, 'spiritRegenPct', now) / 100); }
export function techniqueSpiritOverflowToGaugePctV119(entity, skill, now) { return clamp(techniqueModifierTotalV119(entity, skill, 'spiritOverflowToGaugePct', now), 0, 20); }
function milestoneValueV119(mastery, values) {
    const m = clamp(mastery, 0, 100);
    return m >= 100 ? values[4] : m >= 80 ? values[3] : m >= 60 ? values[2] : m >= 40 ? values[1] : m >= 20 ? values[0] : 0;
}
export function techniqueBurnBloodEfficiencyV119(entity) { const m = techniqueEquippedMasteryV119(entity, 'technique.v119.secret.burn_blood_qi'); return m < 20 ? 0 : .70 + (m >= 100 ? .15 : m >= 80 ? .11 : m >= 60 ? .075 : m >= 40 ? .035 : 0); }
export function techniqueBloodSacrificeCapPctV119(entity) { return milestoneValueV119(techniqueEquippedMasteryV119(entity, 'technique.v119.secret.blood_sacrifice'), [5, 7.5, 10, 12.5, 15]); }
export function techniqueBreakLimitExtraPctV119(entity) { return milestoneValueV119(techniqueEquippedMasteryV119(entity, 'technique.v119.secret.break_limit'), [10, 15, 20, 25, 30]); }
export function techniqueShieldConsumePctV119(entity) { return milestoneValueV119(techniqueEquippedMasteryV119(entity, 'technique.v119.secret.devour_shield'), [8, 12, 18, 24, 30]); }
export function techniqueShieldConsumeEffectBonusPctV119(entity) { return milestoneValueV119(techniqueEquippedMasteryV119(entity, 'technique.v119.secret.devour_shield'), [6, 9, 13, 18, 25]); }
export function techniqueDeferredDamagePctV119(entity) { return milestoneValueV119(techniqueEquippedMasteryV119(entity, 'technique.v119.secret.defer_wound'), [10, 15, 20, 25, 30]); }
export function techniqueDeferredHealingPenaltyPctV119(entity) { return milestoneValueV119(techniqueEquippedMasteryV119(entity, 'technique.v119.secret.defer_wound'), [0, 0, 10, 18, 25]); }
export function techniqueCooldownReturnPctV119(entity) { return milestoneValueV119(techniqueEquippedMasteryV119(entity, 'technique.v119.secret.cooldown_return'), [6, 10, 15, 20, 25]); }
export function techniqueCooldownReturnInternalSecondsV119(entity) { return milestoneValueV119(techniqueEquippedMasteryV119(entity, 'technique.v119.secret.cooldown_return'), [30, 28, 25, 22, 20]); }
export function techniqueCooldownReturnSpiritCostPctV119(entity) { return milestoneValueV119(techniqueEquippedMasteryV119(entity, 'technique.v119.secret.cooldown_return'), [20, 24, 28, 32, 36]); }
export function techniqueGuidingReturnRestoreStandardPctV119(entity) { return techniqueEquippedMasteryV119(entity, 'technique.v119.inner.guiding_return') >= 100 ? 10 : 0; }
export function techniqueGuidingReturnInternalSecondsV119(entity) { return techniqueGuidingReturnRestoreStandardPctV119(entity) > 0 ? 20 : 0; }
export function techniqueDemonHpLossPctV119(entity) { return milestoneValueV119(techniqueEquippedMasteryV119(entity, 'technique.v119.secret.demon_release'), [5, 7, 10, 12, 15]); }
export function initializeTechniqueCombatStateV119(entity, now = 0) {
    const m = techniqueEquippedMasteryV119(entity, 'technique.v119.secret.demon_release');
    if (m < 20)
        return;
    const duration = milestoneValueV119(m, [3, 4, 5, 5.5, 6]);
    entity.pendingSetFlagsV117['techniqueSecretBurstUntil'] = now + duration;
    entity.pendingSetFlagsV117['techniqueSecretAftermathUntil'] = now + duration + 6;
    entity.pendingSetFlagsV117['techniqueDemonHpLossPendingPct'] = techniqueDemonHpLossPctV119(entity);
}
export function techniqueHealingReceivedMultiplierV119(entity) {
    if ((entity.pendingSetFlagsV117['techniqueDeferredDamageDebt'] ?? 0) <= 0)
        return 1;
    return Math.max(0, 1 - techniqueDeferredHealingPenaltyPctV119(entity) / 100);
}
export function cloneTechniqueCombatRuntimeV119(runtime) { return runtime ? { sourceTechniqueIds: [...runtime.sourceTechniqueIds], masteryByTechniqueId: { ...runtime.masteryByTechniqueId }, modifiers: runtime.modifiers.map(x => ({ ...x })), rules: [...runtime.rules] } : undefined; }
export function withTechniqueRuntimeV119(build, runtime) { return { ...(build ?? {}), techniqueRuntimeV119: cloneTechniqueCombatRuntimeV119(runtime) }; }
;
//# sourceMappingURL=technique-runtime-v119.js.map