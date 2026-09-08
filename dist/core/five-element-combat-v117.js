import { skillDomainsV117, skillRuntimeV117, skillSlotClassV117, skillUltimateGaugeCostV117, skillUltimateGaugeGenerateV117, ULTIMATE_GAUGE_MAX_V117, } from './skill-runtime-v117.js';
import { techniqueEligibleEffectBonusPctV119, techniqueElementGenerateMultiplierV119, techniqueGaugeMultiplierV119 } from './technique-runtime-v119.js';
import { swordV2GaugeMultiplier } from './battle-dao-v2-runtime.js';
export const ROOT_GENERATE_EFFECTIVENESS_COEF_V117 = 0.20;
export const ROOT_PAYOFF_EFFECTIVENESS_COEF_V117 = 0.50;
export const FIRE_EXTREME_BASE_SECONDS_V117 = 6;
export const FIRE_AFTERMATH_BASE_SECONDS_V117 = 5;
export const FIRE_AFTERMATH_GENERATE_PENALTY_PCT_V117 = 40;
export const ELEMENT_RESOURCE_CARRY_RATIO_V117 = 0.50;
export function createFiveElementCombatStateV117() {
    return {
        metalEdge: 0, metalArmor: 0,
        woodLife: 0, woodSeed: 0, woodSeedInvestedLife: 0, woodSeedMature: false,
        waterFlow: 0, waterTide: 0, waterAdaptation: 'flow', waterAdaptationLockedUntil: 0,
        fireSeal: 0, fireHeat: 0, fireExtremeUntil: 0, fireAftermathUntil: 0, fireAftermathPenaltyPct: 0,
        earthWeight: 0, earthRecoil: 0,
    };
}
export function cloneFiveElementCombatStateV117(s) { return { ...s }; }
export function setMechanicV117(entity, mechanic) {
    return entity.combatBuildV117?.activeSetMechanics?.find(x => x.mechanic === mechanic);
}
function param(m, key, fallback = 0) { return m?.params[key] ?? fallback; }
export function rootUnlockedV117(_entity, _root) { return true; }
export function rootEffectivenessPctV117(_entity, _root) { return 0; }
export function rootGenerateMultiplierV117(_entity, _root) { return 1; }
export function rootPayoffMultiplierV117(_entity, _root) { return 1; }
export function earthWeightCapV117(entity) {
    const m = setMechanicV117(entity, 'earth_overcap_weight');
    return 100 * (1 + Math.max(0, param(m, 'capBonusPct')) / 100);
}
export function resourceValueV117(entity, resource) {
    return entity.fiveElementsV117[resource];
}
function resourceCapV117(entity, resource) {
    let base = 100;
    if (resource === 'waterTide')
        base = 3;
    else if (resource === 'fireSeal')
        base = 5;
    else if (resource === 'earthWeight')
        base = earthWeightCapV117(entity);
    return base;
}
function setResourceV117(entity, resource, value) {
    const cap = resourceCapV117(entity, resource);
    const next = Math.max(0, Math.min(cap, value));
    entity.fiveElementsV117[resource] = next;
    if (resource === 'woodSeed')
        entity.fiveElementsV117.woodSeedMature = next >= 100 - 1e-9;
    return next;
}
function rootForResource(resource) {
    if (resource.startsWith('metal'))
        return 'metal';
    if (resource.startsWith('wood'))
        return 'wood';
    if (resource.startsWith('water'))
        return 'water';
    if (resource.startsWith('fire'))
        return 'fire';
    return 'earth';
}
function generateSetMultiplier(entity, resource, now) {
    if (resource === 'fireSeal' || resource === 'fireHeat')
        return 1 + param(setMechanicV117(entity, 'fire_heat_generate'), 'generateBonusPct') / 100;
    if (resource === 'earthWeight') {
        let bonus = param(setMechanicV117(entity, 'earth_weight_generate'), 'generateBonusPct');
        bonus += param(setMechanicV117(entity, 'earth_body_mitigation_weight'), 'weightGenerateBonusPct');
        if ((entity.pendingSetFlagsV117['earthBodyStandUntil'] ?? 0) > now)
            bonus += param(setMechanicV117(entity, 'earth_body_stand_ground'), 'weightGenerateBonusPct');
        return 1 + bonus / 100;
    }
    if (resource === 'woodSeed')
        return 1 + param(setMechanicV117(entity, 'wood_seed_growth'), 'growthBonusPct') / 100;
    return 1;
}
function fireAftermathGenerateMultiplier(entity, now) {
    if (entity.fiveElementsV117.fireAftermathUntil <= now)
        return 1;
    const severity = 1 + Math.max(0, entity.fiveElementsV117.fireAftermathPenaltyPct) / 100;
    return Math.max(0.1, 1 - FIRE_AFTERMATH_GENERATE_PENALTY_PCT_V117 / 100 * severity);
}
export function addResourceV117(entity, resource, baseAmount, now) {
    if (baseAmount <= 0)
        return 0;
    // Locked Hỏa cycle: Cực Viêm freezes Nhiệt Thế generation, while Viêm Ấn may still be generated.
    if (resource === 'fireHeat' && entity.fiveElementsV117.fireExtremeUntil > now)
        return 0;
    const root = rootForResource(resource);
    if (!rootUnlockedV117(entity, root))
        return 0;
    let amount = baseAmount * generateSetMultiplier(entity, resource, now);
    if (resource === 'fireSeal' || resource === 'fireHeat')
        amount *= fireAftermathGenerateMultiplier(entity, now);
    if (resource === 'metalArmor' && (entity.pendingSetFlagsV117['metalArmorGeneratePenaltyUntil'] ?? 0) > now)
        amount *= 0.75;
    if (resource === 'earthWeight' && (entity.pendingSetFlagsV117['earthWeightGeneratePenaltyUntil'] ?? 0) > now)
        amount *= 0.75;
    if (resource === 'metalEdge') {
        const nextBonus = entity.pendingSetFlagsV117['metalNextEdgeGenerateBonusPct'] ?? 0;
        if (nextBonus > 0) {
            amount *= 1 + nextBonus / 100;
            delete entity.pendingSetFlagsV117['metalNextEdgeGenerateBonusPct'];
        }
    }
    const before = resourceValueV117(entity, resource);
    const after = setResourceV117(entity, resource, before + amount);
    return Math.max(0, after - before);
}
function spendOneV117(entity, change) {
    const current = resourceValueV117(entity, change.resource);
    const min = Math.max(0, change.minimum ?? 0);
    if (current + 1e-9 < min)
        return 0;
    const wanted = change.amount === 'all' ? current : Math.max(0, change.amount);
    const spent = Math.min(current, wanted);
    setResourceV117(entity, change.resource, current - spent);
    return spent;
}
export function minimumFireExtremeRequirementV117(entity) {
    return Math.max(0, Math.min(100, param(setMechanicV117(entity, 'fire_early_extreme_heat'), 'minimumRequirementPct', 100)));
}
export function minimumWoodHarvestRequirementV117(entity) {
    return Math.max(0, Math.min(100, param(setMechanicV117(entity, 'wood_early_harvest'), 'minimumMaturityPct', 100)));
}
export function canUseSkillRuntimeV117(entity, skill, now) {
    const r = skillRuntimeV117(skill);
    const gaugeCost = skillUltimateGaugeCostV117(skill);
    if (gaugeCost > 0 && entity.ultimateGaugeV117 + 1e-9 < gaugeCost)
        return false;
    if (skill.runtimeV117 && r.form === 'counter' && r.requiresCounterWindow !== false) {
        const w = entity.activeCounterWindow;
        if (!w || w.succeeded || w.expiresAt <= now)
            return false;
    }
    for (const change of r.spend ?? []) {
        const current = resourceValueV117(entity, change.resource);
        const need = change.amount === 'all' ? Math.max(0, change.minimum ?? 0) : Math.max(change.minimum ?? 0, change.amount);
        if (current + 1e-9 < need)
            return false;
    }
    if (r.signature === 'fireBurst' && entity.fiveElementsV117.fireSeal < 2)
        return false;
    if (r.signature === 'fireExtreme') {
        if (entity.fiveElementsV117.fireExtremeUntil > now || entity.fiveElementsV117.fireAftermathUntil > now)
            return false;
        if (entity.fiveElementsV117.fireHeat + 1e-9 < minimumFireExtremeRequirementV117(entity))
            return false;
    }
    if (r.signature === 'woodHarvestSeed' && entity.fiveElementsV117.woodSeed + 1e-9 < minimumWoodHarvestRequirementV117(entity))
        return false;
    if (r.signature === 'waterTideSpend' && (entity.fiveElementsV117.waterTide < 1 || entity.fiveElementsV117.waterFlow < 20))
        return false;
    const domains = skillDomainsV117(skill);
    const gaugeSet = setMechanicV117(entity, 'ultimate_gauge_spend_active');
    if (gaugeSet && domains.includes('SpendUltimateGauge')) {
        const lock = entity.setLockoutsV117['ultimate_gauge_spend_active'] ?? 0;
        if (lock > now)
            return false;
        if (entity.ultimateGaugeV117 + 1e-9 < param(gaugeSet, 'minimumGaugeBeforeAction', 40))
            return false;
    }
    return true;
}
function daoStrengthV117(entity, skill) {
    const dao = skillRuntimeV117(skill).daoBinding;
    if (!dao)
        return 0;
    if (entity.combatBuildV117?.mainDaoId === dao)
        return 1;
    if (entity.combatBuildV117?.secondaryDaoId === dao)
        return .60;
    return 0;
}
export function skillSpiritCostMultiplierFromRuntimeV117(entity, skill, now) {
    let mul = 1;
    const r = skillRuntimeV117(skill);
    const domains = skillDomainsV117(skill);
    const rotation = setMechanicV117(entity, 'rotation_alternate_skill_efficiency');
    const last = entity.lastResolvedActiveSkillIdsV117[0];
    if (rotation && skillSlotClassV117(skill) === 'active' && last && last !== skill.id)
        mul *= 1 - param(rotation, 'nextActiveCostReductionPct') / 100;
    const spellEfficiency = setMechanicV117(entity, 'spell_spirit_efficiency');
    if (spellEfficiency && r.daoBinding === 'spell' && (r.form === 'cast' || r.form === 'channel' || domains.some(x => ['SpellCast', 'SpellChannel'].includes(x))))
        mul *= 1 - param(spellEfficiency, 'efficiencyBonusPct') / 100;
    const chain = setMechanicV117(entity, 'water_spell_chain_cast');
    if (chain && r.daoBinding === 'spell' && entity.fiveElementsV117.waterFlow >= param(chain, 'requiredFlowPct', 80))
        mul *= 1 + entity.waterSpellChainStacksV117 * param(chain, 'spiritCostIncreasePerStackPct', 10) / 100;
    return Math.max(.05, mul);
}
export function skillCastTimeMultiplierFromRuntimeV117(entity, skill) {
    const r = skillRuntimeV117(skill);
    const chain = setMechanicV117(entity, 'water_spell_chain_cast');
    let mul = 1;
    if (chain && r.daoBinding === 'spell' && entity.fiveElementsV117.waterFlow >= param(chain, 'requiredFlowPct', 80)) {
        const per = param(chain, 'castTimeReductionPerStackPct');
        mul *= Math.max(.1, 1 - entity.waterSpellChainStacksV117 * per / 100);
    }
    return Math.max(.1, mul);
}
export function prepareSkillActionRuntimeV117(entity, skill, now) {
    const r = skillRuntimeV117(skill);
    const domains = skillDomainsV117(skill);
    const notices = [];
    entity.pendingSetFlagsV117['mitigationEventBudgetUsed'] = 0;
    const action = { skillId: skill.id, effectBonusPct: 0, breakBonusPct: 0, castTimeMultiplier: 1, recoveryMultiplier: 1, suppressGaugeGenerate: false, spentResources: {}, generatedResources: {}, signature: r.signature, domains };
    action.effectBonusPct += techniqueEligibleEffectBonusPctV119(entity, skill, now);
    const queuedSpellTempo = entity.pendingSetFlagsV117['spellNextTempoReductionPct'] ?? 0;
    if (queuedSpellTempo > 0 && r.daoBinding === 'spell' && skillSlotClassV117(skill) === 'active') {
        const mul = Math.max(.1, 1 - queuedSpellTempo / 100);
        action.castTimeMultiplier *= mul;
        action.recoveryMultiplier *= mul;
        delete entity.pendingSetFlagsV117['spellNextTempoReductionPct'];
    }
    const gaugeCost = skillUltimateGaugeCostV117(skill);
    if (gaugeCost > 0) {
        entity.ultimateGaugeV117 = Math.max(0, entity.ultimateGaugeV117 - gaugeCost);
        notices.push({ message: `${skill.name} tiêu ${gaugeCost.toFixed(0)} Thanh Tuyệt Kỹ.`, data: { ultimateGauge: entity.ultimateGaugeV117, gaugeSpent: gaugeCost } });
    }
    // Universal accessory set: opt-in via authored domain, never automatic on every Active.
    const gaugeSet = setMechanicV117(entity, 'ultimate_gauge_spend_active');
    if (gaugeSet && skillSlotClassV117(skill) === 'active' && domains.includes('SpendUltimateGauge')) {
        const cost = param(gaugeSet, 'gaugeCost', 20);
        const min = param(gaugeSet, 'minimumGaugeBeforeAction', 40);
        const lock = entity.setLockoutsV117['ultimate_gauge_spend_active'] ?? 0;
        if (lock <= now && entity.ultimateGaugeV117 >= min && entity.ultimateGaugeV117 >= cost) {
            entity.ultimateGaugeV117 -= cost;
            action.effectBonusPct += param(gaugeSet, 'eligibleEffectBonusPct');
            action.suppressGaugeGenerate = param(gaugeSet, 'buffedActionGaugeGeneratePct', 0) <= 0;
            entity.setLockoutsV117['ultimate_gauge_spend_active'] = now + param(gaugeSet, 'lockoutSeconds', 6);
            notices.push({ message: `${skill.name} tiêu ${cost} Thanh Tuyệt Kỹ để cường hóa package hợp lệ.`, data: { ultimateGauge: entity.ultimateGaugeV117, gaugeSpent: cost } });
        }
    }
    // Rotation 4p: reward only after four distinct normal Actives were already completed.
    const rotation4 = setMechanicV117(entity, 'rotation_four_distinct_payoff');
    if (rotation4 && skillSlotClassV117(skill) === 'active') {
        const need = Math.max(1, param(rotation4, 'distinctActivesRequired', 4));
        if (entity.lastResolvedActiveSkillIdsV117.length >= need && new Set(entity.lastResolvedActiveSkillIdsV117.slice(0, need)).size >= need) {
            action.effectBonusPct += param(rotation4, 'payoffBonusPct');
            entity.lastResolvedActiveSkillIdsV117 = [];
        }
    }
    for (const original of r.spend ?? []) {
        let change = original;
        if (r.signature === 'waterTideSpend' && original.resource === 'waterFlow' && typeof original.amount === 'number') {
            const retain = setMechanicV117(entity, 'water_spend_flow_retention');
            change = { ...original, amount: original.amount * (1 - param(retain, 'retainedLossPct') / 100) };
        }
        const before = resourceValueV117(entity, change.resource);
        const spent = spendOneV117(entity, change);
        if (spent > 0) {
            action.spentResources[change.resource] = (action.spentResources[change.resource] ?? 0) + spent;
            if (change.resource === 'earthWeight' && before > 100)
                entity.pendingSetFlagsV117['earthSpentOverBaseCap'] = 1;
        }
    }
    const metalArtifactSpend = setMechanicV117(entity, 'metal_artifact_next_break');
    if (metalArtifactSpend && (action.spentResources.metalEdge ?? 0) > 0)
        entity.pendingSetFlagsV117['metalArtifactNextBreakPct'] = param(metalArtifactSpend, 'nextBreakPackageBonusPct');
    const queuedMetalArtifactBreak = entity.pendingSetFlagsV117['metalArtifactNextBreakPct'] ?? 0;
    if (queuedMetalArtifactBreak > 0 && r.daoBinding === 'artifact' && domains.some(x => ['Break', 'Phá', 'PháThế', 'ArtifactBreak'].includes(x))) {
        action.effectBonusPct += queuedMetalArtifactBreak;
        action.breakBonusPct += queuedMetalArtifactBreak;
        delete entity.pendingSetFlagsV117['metalArtifactNextBreakPct'];
    }
    if (r.signature === 'metalConvertArmorToEdge') {
        const spent = action.spentResources.metalArmor ?? 0;
        const set = setMechanicV117(entity, 'metal_conversion_efficiency');
        const efficiency = .80 * (1 + param(set, 'conversionBonusPct') / 100);
        if (spent > 0)
            addResourceV117(entity, 'metalEdge', spent * efficiency, now);
    }
    else if (r.signature === 'metalConvertEdgeToArmor') {
        const spent = action.spentResources.metalEdge ?? 0;
        const set = setMechanicV117(entity, 'metal_conversion_efficiency');
        const efficiency = .80 * (1 + param(set, 'conversionBonusPct') / 100);
        if (spent > 0)
            addResourceV117(entity, 'metalArmor', spent * efficiency, now);
    }
    else if (r.signature === 'metalBreakSpend') {
        const spent = action.spentResources.metalEdge ?? 0;
        action.effectBonusPct += spent * .5 * rootPayoffMultiplierV117(entity, 'metal');
        action.breakBonusPct += spent * .5 * rootPayoffMultiplierV117(entity, 'metal');
        const full = setMechanicV117(entity, 'metal_full_edge_break_spend');
        if (full && spent >= 99.999) {
            action.effectBonusPct += param(full, 'breakPackageBonusPct');
            action.breakBonusPct += param(full, 'breakPackageBonusPct');
            entity.pendingSetFlagsV117['metalArmorGeneratePenaltyUntil'] = now + param(full, 'penaltySeconds', 3);
        }
    }
    else if (r.signature === 'metalDefenseSpend') {
        const spent = action.spentResources.metalArmor ?? 0;
        action.effectBonusPct += spent * .4 * rootPayoffMultiplierV117(entity, 'metal');
    }
    else if (r.signature === 'woodHarvestSeed') {
        const maturity = entity.fiveElementsV117.woodSeed;
        action.effectBonusPct += 35 * (maturity / 100) * rootPayoffMultiplierV117(entity, 'wood');
        entity.fiveElementsV117.woodSeed = 0;
        entity.fiveElementsV117.woodSeedMature = false;
        entity.fiveElementsV117.woodSeedInvestedLife = 0;
    }
    else if (r.signature === 'waterTideSpend') {
        // If the skill authored explicit Spend hooks, those were consumed above and are the source of truth.
        // Otherwise the signature consumes 1..3 Ấn + 20 Lưu Thế per Ấn. This prevents double-spending.
        const explicitTide = action.spentResources.waterTide ?? 0;
        const explicitFlow = action.spentResources.waterFlow ?? 0;
        let used = explicitTide;
        if (used <= 0) {
            used = Math.min(3, Math.max(1, entity.fiveElementsV117.waterTide));
            entity.fiveElementsV117.waterTide = Math.max(0, entity.fiveElementsV117.waterTide - used);
            action.spentResources.waterTide = (action.spentResources.waterTide ?? 0) + used;
        }
        if (explicitFlow <= 0) {
            let flowLoss = Math.min(entity.fiveElementsV117.waterFlow, 20 * used);
            const retain = setMechanicV117(entity, 'water_spend_flow_retention');
            flowLoss *= 1 - param(retain, 'retainedLossPct') / 100;
            entity.fiveElementsV117.waterFlow = Math.max(0, entity.fiveElementsV117.waterFlow - flowLoss);
            action.spentResources.waterFlow = (action.spentResources.waterFlow ?? 0) + flowLoss;
        }
        action.effectBonusPct += 12 * used * rootPayoffMultiplierV117(entity, 'water');
    }
    else if (r.signature === 'fireBurst') {
        // Spend hooks run before effects. If fireSeal was explicit, do not consume a second time.
        let seals = action.spentResources.fireSeal ?? 0;
        if (seals <= 0) {
            seals = entity.fiveElementsV117.fireSeal;
            entity.fiveElementsV117.fireSeal = 0;
            action.spentResources.fireSeal = (action.spentResources.fireSeal ?? 0) + seals;
        }
        action.effectBonusPct += 8 * seals * rootPayoffMultiplierV117(entity, 'fire');
        const heat = entity.fiveElementsV117.fireHeat;
        const baselineAfter = heat * .5;
        const retain = setMechanicV117(entity, 'fire_burst_heat_retention');
        const retainedLoss = (heat - baselineAfter) * param(retain, 'heatRetainedPct') / 100;
        entity.fiveElementsV117.fireHeat = baselineAfter + retainedLoss;
    }
    else if (r.signature === 'fireExtreme') {
        const heat = entity.fiveElementsV117.fireHeat;
        const missing = Math.max(0, 100 - heat);
        const early = setMechanicV117(entity, 'fire_early_extreme_heat');
        entity.fiveElementsV117.fireHeat = 0;
        entity.fiveElementsV117.fireExtremeUntil = now + FIRE_EXTREME_BASE_SECONDS_V117;
        entity.fiveElementsV117.fireAftermathPenaltyPct = missing * param(early, 'aftermathPenaltyPerMissingPct', 0);
    }
    else if (r.signature === 'earthAttackSpend') {
        const spent = action.spentResources.earthWeight ?? 0;
        action.effectBonusPct += spent * .45 * rootPayoffMultiplierV117(entity, 'earth');
        let conversion = .40;
        conversion += param(setMechanicV117(entity, 'earth_spend_to_recoil'), 'conversionPct') / 100;
        addResourceV117(entity, 'earthRecoil', spent * conversion, now);
        if (spent > 0 && (entity.pendingSetFlagsV117['earthSpentOverBaseCap'] ?? 0) > 0) {
            const over = setMechanicV117(entity, 'earth_overcap_weight');
            entity.pendingSetFlagsV117['earthWeightGeneratePenaltyUntil'] = now + param(over, 'penaltySeconds', 3);
            delete entity.pendingSetFlagsV117['earthSpentOverBaseCap'];
        }
    }
    else if (r.signature === 'earthCounterSpend') {
        const spent = action.spentResources.earthRecoil ?? 0;
        action.effectBonusPct += spent * .5 * rootPayoffMultiplierV117(entity, 'earth');
        const stand = setMechanicV117(entity, 'earth_body_stand_ground');
        if ((entity.pendingSetFlagsV117['earthBodyStandUntil'] ?? 0) > now)
            action.effectBonusPct += param(stand, 'counterBonusPct');
    }
    if (r.signature === 'waterSetAdaptation') {
        const desired = domains.includes('Adaptation:soften') ? 'soften' : domains.includes('Adaptation:tide') ? 'tide' : 'flow';
        setWaterAdaptationV117(entity, desired, now);
        const lock = setMechanicV117(entity, 'water_lock_adaptation');
        if (lock && entity.fiveElementsV117.waterFlow >= param(lock, 'requiredFlowPct', 80)) {
            entity.fiveElementsV117.waterAdaptationLockedUntil = now + param(lock, 'lockSeconds', 2);
            action.effectBonusPct += param(lock, 'lockedPackageBonusPct');
        }
    }
    // Holding resources has a modest authored benefit; spending them sacrifices that stored value.
    if (r.primaryRoot === 'metal') {
        if (domains.some(x => ['Phá', 'MetalBreak', 'Break'].includes(x))) {
            const b = 10 * Math.min(100, entity.fiveElementsV117.metalEdge) / 100 * rootPayoffMultiplierV117(entity, 'metal');
            action.effectBonusPct += b;
            action.breakBonusPct += b;
        }
        if (domains.includes('DefenseUtility'))
            action.effectBonusPct += 10 * Math.min(100, entity.fiveElementsV117.metalArmor) / 100 * rootPayoffMultiplierV117(entity, 'metal');
    }
    if (r.primaryRoot === 'water') {
        const match = entity.fiveElementsV117.waterAdaptation === 'flow' ? domains.some(x => ['WaterFlow', 'Combo', 'Cast', 'Generate'].includes(x)) :
            entity.fiveElementsV117.waterAdaptation === 'soften' ? domains.includes('DefenseUtility') :
                domains.some(x => ['WaterSpend', 'Control', 'Break', 'Phá'].includes(x));
        if (match)
            action.effectBonusPct += 15 * (entity.fiveElementsV117.waterFlow / 100) * rootPayoffMultiplierV117(entity, 'water');
    }
    const sword2 = setMechanicV117(entity, 'sword_finisher_break');
    if (sword2 && r.daoBinding === 'sword') {
        const b = param(sword2, 'eligibleEffectBonusPct');
        // Một bonus Set chỉ đi vào một lane trên cùng action: Finisher nhận payoff, skill Phá nhận Phá Thế.
        // Không cộng đồng thời effect + break chỉ vì một Finisher cũng mang tag Break (chống double-dip V1.21).
        if (r.form === 'finisher')
            action.effectBonusPct += b;
        else if (domains.some(x => ['Break', 'Phá', 'PháThế'].includes(x)))
            action.breakBonusPct += b;
    }
    const artifact2 = setMechanicV117(entity, 'artifact_generate_spend');
    if (artifact2 && r.daoBinding === 'artifact' && domains.some(x => ['ArtifactGenerate', 'ArtifactSpend'].includes(x)))
        action.effectBonusPct += param(artifact2, 'bonusPct');
    // Root payoff of Cực Viêm is a narrow Fire offensive package, not Total Damage.
    if (r.primaryRoot === 'fire' && entity.fiveElementsV117.fireExtremeUntil > now && domains.some(x => ['Damage', 'Fire', 'BạoViêm', 'Finisher'].includes(x)))
        action.effectBonusPct += 30 * rootPayoffMultiplierV117(entity, 'fire');
    const fireSword = setMechanicV117(entity, 'fire_sword_extreme_finisher');
    if (fireSword && r.daoBinding === 'sword' && r.form === 'finisher' && entity.fiveElementsV117.fireExtremeUntil > now)
        action.effectBonusPct += param(fireSword, 'finisherBonusPct');
    // V145: Linh Căn is independent from this authored skill-resource package.
    // Dao package bridge is intentionally narrow: only authored runtime domains can consume it later.
    const daoStrength = daoStrengthV117(entity, skill);
    if (daoStrength > 0)
        action.domains.push(daoStrength === 1 ? 'DaoMain100' : 'DaoSecondary60');
    return { action, notices };
}
function applyGenerateHookV117(entity, skill, change, now) {
    if (change.amount === 'all')
        return 0;
    const r = skillRuntimeV117(skill);
    let amount = change.amount * techniqueElementGenerateMultiplierV119(entity, skill, now);
    if (change.resource === 'metalEdge' && r.primaryRoot === 'metal' && r.daoBinding === 'artifact')
        amount *= 1 + param(setMechanicV117(entity, 'metal_artifact_edge_generate'), 'generateBonusPct') / 100;
    if ((change.resource === 'fireSeal' || change.resource === 'fireHeat') && r.primaryRoot === 'fire' && r.daoBinding === 'sword' && r.form === 'finisher')
        amount *= 1 + param(setMechanicV117(entity, 'fire_sword_finisher_generate'), 'fireGenerateBonusPct') / 100;
    return addResourceV117(entity, change.resource, amount, now);
}
function updateRotationV117(entity, skill) {
    if (skillSlotClassV117(skill) !== 'active')
        return;
    const arr = entity.lastResolvedActiveSkillIdsV117;
    if (arr.includes(skill.id))
        entity.lastResolvedActiveSkillIdsV117 = [skill.id];
    else
        entity.lastResolvedActiveSkillIdsV117 = [...arr, skill.id].slice(-4);
}
export function finishSkillActionRuntimeV117(entity, skill, action, now) {
    const r = skillRuntimeV117(skill);
    const notices = [];
    for (const change of r.generate ?? []) {
        const generated = applyGenerateHookV117(entity, skill, change, now);
        if (generated > 0)
            action.generatedResources[change.resource] = (action.generatedResources[change.resource] ?? 0) + generated;
    }
    if (r.signature === 'woodNourishSeed') {
        const spent = action.spentResources.woodLife ?? 0;
        if (spent > 0) {
            const growth = addResourceV117(entity, 'woodSeed', spent, now);
            entity.fiveElementsV117.woodSeedInvestedLife += spent;
            if (entity.fiveElementsV117.woodSeedMature) {
                const refund = setMechanicV117(entity, 'wood_mature_refund');
                const amount = entity.fiveElementsV117.woodSeedInvestedLife * param(refund, 'refundPct') / 100;
                if (amount > 0)
                    addResourceV117(entity, 'woodLife', amount, now);
            }
        }
    }
    if (r.signature === 'waterTideGenerate')
        addResourceV117(entity, 'waterTide', 1, now);
    if (r.form === 'channel' && r.daoBinding === 'spell') {
        const tempo = setMechanicV117(entity, 'spell_channel_next_tempo');
        const pct = param(tempo, 'castRecoveryReductionPct');
        if (pct > 0)
            entity.pendingSetFlagsV117['spellNextTempoReductionPct'] = pct;
    }
    // Core Thủy cadence is action-based, never wall-clock decay.
    if (r.primaryRoot === 'water') {
        const match = entity.fiveElementsV117.waterAdaptation === 'flow' ? action.domains.some(x => ['WaterFlow', 'Combo', 'Cast', 'Generate'].includes(x)) :
            entity.fiveElementsV117.waterAdaptation === 'soften' ? action.domains.includes('DefenseUtility') :
                action.domains.some(x => ['WaterSpend', 'Control', 'Break', 'Phá'].includes(x));
        if (!(r.generate ?? []).some(x => x.resource === 'waterFlow'))
            addResourceV117(entity, 'waterFlow', (match ? 18 : 14) * techniqueElementGenerateMultiplierV119(entity, skill, now), now);
    }
    else {
        const loss = skillSlotClassV117(skill) === 'basic' ? 6 : skillSlotClassV117(skill) === 'active' ? 12 : 0;
        if (loss > 0) {
            const set = setMechanicV117(entity, 'water_flow_decay_reduction');
            const actual = loss * (1 - param(set, 'decayReductionPct') / 100);
            entity.fiveElementsV117.waterFlow = Math.max(0, entity.fiveElementsV117.waterFlow - actual);
        }
    }
    const gaugeGain = action.suppressGaugeGenerate ? 0 : skillUltimateGaugeGenerateV117(skill) * techniqueGaugeMultiplierV119(entity, skill, now) * swordV2GaugeMultiplier(entity, now);
    if (gaugeGain > 0) {
        const set = setMechanicV117(entity, 'ultimate_gauge_generate');
        const gain = gaugeGain * (1 + param(set, 'gaugeGenerateBonusPct') / 100);
        const before = entity.ultimateGaugeV117;
        entity.ultimateGaugeV117 = Math.min(ULTIMATE_GAUGE_MAX_V117, before + gain);
        if (entity.ultimateGaugeV117 > before)
            notices.push({ message: `${entity.name} tích ${(entity.ultimateGaugeV117 - before).toFixed(1)} Thanh Tuyệt Kỹ.`, data: { ultimateGauge: entity.ultimateGaugeV117, gaugeGenerated: entity.ultimateGaugeV117 - before } });
    }
    // Water×Spell chain: previous stacks modify current cast; successful qualifying cast builds the next stack.
    const chain = setMechanicV117(entity, 'water_spell_chain_cast');
    if (chain && r.daoBinding === 'spell' && skillSlotClassV117(skill) === 'active' && entity.fiveElementsV117.waterFlow >= param(chain, 'requiredFlowPct', 80)) {
        entity.waterSpellChainStacksV117 = Math.min(param(chain, 'maxStacks', 4), entity.waterSpellChainStacksV117 + 1);
        entity.waterSpellChainLastSkillIdV117 = skill.id;
        const waterSet = setMechanicV117(entity, 'water_spell_flow_generate');
        if (waterSet)
            addResourceV117(entity, 'waterFlow', 14 * param(waterSet, 'flowGenerateBonusPct') / 100, now);
    }
    else if (skillSlotClassV117(skill) === 'basic' || r.daoBinding !== 'spell' || action.domains.includes('DefenseUtility')) {
        entity.waterSpellChainStacksV117 = 0;
        entity.waterSpellChainLastSkillIdV117 = undefined;
    }
    // Hỏa×Kiếm: the payoff shortens the active extreme window and increases later aftermath severity.
    const fireSword = setMechanicV117(entity, 'fire_sword_extreme_finisher');
    if (fireSword && r.daoBinding === 'sword' && r.form === 'finisher' && entity.fiveElementsV117.fireExtremeUntil > now) {
        entity.fiveElementsV117.fireExtremeUntil = Math.max(now, entity.fiveElementsV117.fireExtremeUntil - param(fireSword, 'extremeDurationCutPerFinisherSeconds', .5));
        entity.fiveElementsV117.fireAftermathPenaltyPct = Math.min(param(fireSword, 'aftermathIncreaseCapPct', 32), entity.fiveElementsV117.fireAftermathPenaltyPct + param(fireSword, 'aftermathIncreasePerFinisherPct', 8));
    }
    // Thổ×Thể requires a real Defense/Utility action at high Trọng Thế, no toggle button.
    const earthBody = setMechanicV117(entity, 'earth_body_stand_ground');
    if (earthBody && action.domains.includes('DefenseUtility') && entity.fiveElementsV117.earthWeight >= param(earthBody, 'requiredWeightPct', 90) && (entity.setLockoutsV117['earth_body_stand_ground'] ?? 0) <= now) {
        entity.pendingSetFlagsV117['earthBodyStandUntil'] = now + param(earthBody, 'durationSeconds', 5);
        entity.setLockoutsV117['earth_body_stand_ground'] = now + param(earthBody, 'internalCooldownSeconds', 10);
    }
    updateRotationV117(entity, skill);
    return notices;
}
export function updateElementTimersV117(entity, now) {
    const out = [];
    if (entity.fiveElementsV117.fireExtremeUntil > 0 && entity.fiveElementsV117.fireExtremeUntil <= now) {
        entity.fiveElementsV117.fireExtremeUntil = 0;
        entity.fiveElementsV117.fireAftermathUntil = now + FIRE_AFTERMATH_BASE_SECONDS_V117;
        out.push({ message: `${entity.name} rời Cực Viêm, bước vào Tàn Hỏa ${FIRE_AFTERMATH_BASE_SECONDS_V117}s.`, data: { fireAftermathUntil: entity.fiveElementsV117.fireAftermathUntil, aftermathPenaltyPct: entity.fiveElementsV117.fireAftermathPenaltyPct } });
    }
    if (entity.fiveElementsV117.fireAftermathUntil > 0 && entity.fiveElementsV117.fireAftermathUntil <= now) {
        entity.fiveElementsV117.fireAftermathUntil = 0;
        entity.fiveElementsV117.fireAftermathPenaltyPct = 0;
    }
    if (entity.fiveElementsV117.waterAdaptationLockedUntil > 0 && entity.fiveElementsV117.waterAdaptationLockedUntil <= now)
        entity.fiveElementsV117.waterAdaptationLockedUntil = 0;
    return out;
}
export function setWaterAdaptationV117(entity, next, now) {
    if (entity.fiveElementsV117.waterAdaptationLockedUntil > now && entity.fiveElementsV117.waterAdaptation !== next)
        return false;
    entity.fiveElementsV117.waterAdaptation = next;
    return true;
}
function addMitigationResourceCappedV117(entity, resource, baseAmount, now) {
    const before = resourceValueV117(entity, resource);
    const generated = addResourceV117(entity, resource, baseAmount, now);
    const actual = Math.min(25, generated);
    if (generated > actual)
        setResourceV117(entity, resource, before + actual);
    return actual;
}
export function onMitigationEventV117(entity, eventBudget, mitigatedRatio, now) {
    const ratio = Math.max(0, Math.min(1, mitigatedRatio));
    if (ratio <= 0)
        return [];
    const out = [];
    if (rootUnlockedV117(entity, 'metal')) {
        const base = eventBudget === 25 ? 20 : eventBudget === 18 ? 12 : 8;
        const generated = addMitigationResourceCappedV117(entity, 'metalArmor', base * ratio, now);
        const set4 = setMechanicV117(entity, 'metal_defense_to_edge');
        if (set4 && ratio * 100 >= param(set4, 'requiredBudgetUsedPct', 50))
            entity.pendingSetFlagsV117['metalNextEdgeGenerateBonusPct'] = param(set4, 'nextGenerateBonusPct');
        if (generated > 0)
            out.push({ message: `${entity.name} sinh ${generated.toFixed(1)} Kim Cương từ phòng thủ thực tế.`, data: { metalArmor: entity.fiveElementsV117.metalArmor } });
    }
    if (rootUnlockedV117(entity, 'earth')) {
        const generated = addMitigationResourceCappedV117(entity, 'earthWeight', eventBudget * ratio, now);
        if (generated > 0)
            out.push({ message: `${entity.name} tích ${generated.toFixed(1)} Trọng Thế từ mitigation.`, data: { earthWeight: entity.fiveElementsV117.earthWeight } });
    }
    return out;
}
/** Locked Hunt carry bridge: meters/progress keep 50%, short windows are cleared. */
export function carryFiveElementStateToNextMonsterV117(state) {
    return {
        ...state,
        metalEdge: state.metalEdge * .5, metalArmor: state.metalArmor * .5,
        woodLife: state.woodLife * .5, woodSeed: state.woodSeed * .5, woodSeedInvestedLife: state.woodSeedInvestedLife * .5, woodSeedMature: false,
        waterFlow: state.waterFlow * .5, waterTide: Math.floor(state.waterTide * .5), waterAdaptationLockedUntil: 0,
        fireSeal: Math.floor(state.fireSeal * .5), fireHeat: state.fireHeat * .5, fireExtremeUntil: 0, fireAftermathUntil: 0, fireAftermathPenaltyPct: 0,
        earthWeight: state.earthWeight * .5, earthRecoil: state.earthRecoil * .5,
    };
}
//# sourceMappingURL=five-element-combat-v117.js.map