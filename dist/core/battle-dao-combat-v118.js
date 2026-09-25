import { addResourceV117, resourceValueV117, rootPayoffMultiplierV117, setMechanicV117 } from './five-element-combat-v117.js';
import { skillDomainsV117, skillRuntimeV117, skillSlotClassV117 } from './skill-runtime-v117.js';
import { daoPassivesV118, daoVariantsV118 } from '../content/battle-dao-skill-pack-v118.js';
import { techniqueDaoGenerateMultiplierV119, techniqueElementGenerateMultiplierV119, techniqueEquippedMasteryV119 } from './technique-runtime-v119.js';
import { passiveLevelScalarV125 } from './specialization-skill-progression-v125.js';
import { battleDaoSkillGrowthProfileV126 } from './battle-dao-skill-growth-v126.js';
import { rootMilestoneFireExtremeDurationBonusSecondsV133, rootMilestoneFireExtremeRequirementPctV133, rootMilestoneWoodHarvestRequirementPctV133 } from './spiritual-root-milestones-v133.js';
import { battleDaoV2Enabled, canUseDaoActiveV2Runtime, canLearnDaoPassiveV2Runtime } from './battle-dao-v2-runtime.js';
const PASSIVES = new Map(daoPassivesV118.map(x => [x.id, x]));
const VARIANTS = new Map(daoVariantsV118.map(x => [x.id, x]));
/** v1.20 runtime-only tuning constants. They do not alter Master numeric locks. */
export const FIST_BASE_COMBO_WINDOW_SECONDS_V120 = 3;
export const BODY_EMPOWERED_COUNTER_THRESHOLD_V120 = 70;
export const BODY_EMPOWERED_COUNTER_BASE_HOLD_SECONDS_V120 = 1;
function setParamV120(entity, mechanic, key, fallback = 0) {
    return setMechanicV117(entity, mechanic)?.params[key] ?? fallback;
}
function hasSetV120(entity, mechanic) { return Boolean(setMechanicV117(entity, mechanic)); }
function skillGrowthV126(entity, skill) { return battleDaoSkillGrowthProfileV126(skill, entity.combatBuildV117?.skillPracticeTierV125?.[skill.id] ?? 0); }
export function createBattleDaoCombatStateV118() { return { swordIntent: 0, fistChain: 0, bodyCounter: 0, spellSeal: 0, artifactSources: 0, formationActive: false, formationNurture: 0, formationIntegrity: 0 }; }
export function daoStrengthV118(entity, dao) {
    if (!dao)
        return 0;
    if (entity.combatBuildV117?.mainDaoId === dao)
        return 1;
    // Bản Đạo V2: Phụ Đạo never grants active/core runtime. Legacy V1 keeps the old 60% bridge until migration.
    if (entity.combatBuildV117?.secondaryDaoId === dao)
        return battleDaoV2Enabled(entity) ? 0 : .60;
    return 0;
}
function daoPassiveStrengthV118(entity, dao) {
    if (!dao)
        return 0;
    if (battleDaoV2Enabled(entity))
        return canLearnDaoPassiveV2Runtime(entity, dao) ? 1 : 0;
    return daoStrengthV118(entity, dao);
}
function passiveDefs(entity, dao) {
    if (!dao)
        return [];
    return (entity.combatBuildV117?.learnedDaoPassiveIdsV118 ?? []).map(id => PASSIVES.get(id)).filter((x) => Boolean(x && x.dao === dao));
}
function variantDefs(entity, dao) {
    if (!dao)
        return [];
    return (entity.combatBuildV117?.activeVariantIdsV118 ?? []).map(id => VARIANTS.get(id)).filter((x) => Boolean(x && x.dao === dao));
}
function passiveSum(entity, dao, key) {
    const strength = daoPassiveStrengthV118(entity, dao);
    if (strength <= 0)
        return 0;
    const levels = entity.combatBuildV117?.passiveLevelsV125 ?? {};
    return passiveDefs(entity, dao).reduce((sum, p) => sum + (p.effect[key] ?? 0) * passiveLevelScalarV125(levels[p.id]), 0) * strength;
}
function variantParam(entity, dao, rule, key, fallback = 0) {
    return variantDefs(entity, dao).filter(v => v.rule === rule).reduce((value, v) => v.params[key] ?? value, fallback);
}
function hasVariant(entity, id) { return (entity.combatBuildV117?.activeVariantIdsV118 ?? []).includes(id); }
export function effectiveSkillRootV118(entity, skill) {
    return skill.runtimeV117?.primaryRoot ?? entity.combatBuildV117?.skillRootBindingsV118?.[skill.id];
}
export function daoResourceCapV118(entity, resource) {
    switch (resource) {
        case 'swordIntent': {
            const base = variantParam(entity, 'sword', 'swordIntentCap', 'cap', 100);
            const extra = setParamV120(entity, 'sword_over_spend_finisher', 'maxExtraSpendPct');
            return Math.max(base, 100 * (1 + Math.max(0, extra) / 100));
        }
        case 'fistChain': {
            const base = variantParam(entity, 'fist', 'fistChainCap', 'cap', 5);
            const extra = 5 * Math.max(0, setParamV120(entity, 'fist_combo_overcap', 'comboCapBonusPct')) / 100;
            return Math.max(5, base + extra);
        }
        case 'bodyCounter': return 100;
        case 'spellSeal': return 3;
        case 'artifactSources': return variantParam(entity, 'artifact', 'artifactSourceCap', 'cap', 3);
        case 'formationNurture': return variantParam(entity, 'formation', 'formationNurtureCap', 'cap', 100);
        case 'formationIntegrity': return 100;
    }
}
export function daoResourceValueV118(entity, resource) { return entity.daoStateV118[resource]; }
function setDaoResource(entity, resource, value) {
    const next = Math.max(0, Math.min(daoResourceCapV118(entity, resource), value));
    entity.daoStateV118[resource] = next;
    return next;
}
function addDaoResource(entity, skill, resource, base, now) {
    const dao = skillRuntimeV117(skill).daoBinding;
    const strength = daoStrengthV118(entity, dao);
    if (strength <= 0 || base <= 0)
        return 0;
    if (resource === 'artifactSources' && (entity.pendingSetFlagsV117['artifactFusionUntil'] ?? 0) > now)
        return 0;
    if (resource === 'bodyCounter' && (entity.pendingSetFlagsV117['bodyCounterGenerateLockedUntil'] ?? 0) > now)
        return 0;
    if (resource === 'fistChain') {
        const expires = entity.pendingSetFlagsV117['fistComboExpiresAt'] ?? 0;
        if (expires > 0 && expires <= now) {
            entity.daoStateV118.fistChain = 0;
            delete entity.pendingSetFlagsV117['fistComboExpiresAt'];
        }
    }
    let amount = base * strength * techniqueDaoGenerateMultiplierV119(entity, skill, now);
    amount *= 1 + passiveSum(entity, dao, 'generatePct') / 100;
    amount *= 1 + (skillGrowthV126(entity, skill)?.daoGeneratePct ?? 0) / 100;
    if (resource === 'artifactSources') {
        // V1.28: nguồn Pháp Bảo là đơn vị rời rạc. Bonus Generate tăng tiến độ triển khai,
        // không được tạo trạng thái vô nghĩa kiểu 1,94 nguồn. Secondary 60% tích tiến độ qua nhiều lần deploy.
        const cap = Math.max(0, Math.floor(daoResourceCapV118(entity, 'artifactSources')));
        const current = Math.max(0, Math.floor(entity.daoStateV118.artifactSources + 1e-9));
        if (current >= cap) {
            entity.daoStateV118.artifactSources = cap;
            entity.pendingSetFlagsV117['artifactSourceProgressV128'] = 0;
            return 0;
        }
        const progress = Math.max(0, entity.pendingSetFlagsV117['artifactSourceProgressV128'] ?? 0);
        const total = progress + Math.max(0, amount);
        const whole = Math.floor(total + 1e-9);
        const room = Math.max(0, cap - current);
        const gained = Math.min(room, whole);
        entity.daoStateV118.artifactSources = current + gained;
        entity.pendingSetFlagsV117['artifactSourceProgressV128'] = entity.daoStateV118.artifactSources >= cap ? 0 : Math.max(0, total - gained);
        return gained;
    }
    if (resource === 'swordIntent') {
        amount *= 1 - variantParam(entity, 'sword', 'swordIntentCap', 'generatePenaltyPct') / 100;
        if (hasVariant(entity, 'variant.dao.sword.guard_true_body'))
            amount *= skillRuntimeV117(skill).form === 'counter' ? 1.4 : .8;
    }
    if (resource === 'fistChain') {
        amount *= 1 - variantParam(entity, 'fist', 'fistChainCap', 'generatePenaltyPct') / 100;
        if (hasVariant(entity, 'variant.dao.fist.defense_offense'))
            amount *= skillRuntimeV117(skill).form === 'counter' ? 1.5 : .75;
        amount *= 1 + passiveSum(entity, dao, skillRuntimeV117(skill).form === 'counter' ? 'counterGeneratePct' : '__none') / 100;
    }
    if (resource === 'formationIntegrity')
        amount *= 1 + passiveSum(entity, dao, 'integrityGeneratePct') / 100 + variantParam(entity, 'formation', 'formationGuardTrade', 'integrityGenerateBonusPct') / 100;
    if (resource === 'formationNurture') {
        amount *= 1 + setParamV120(entity, 'formation_nourish_speed', 'bonusPct') / 100;
        const penalty = entity.pendingSetFlagsV117['formationNextNourishPenaltyPct'] ?? 0;
        if (penalty > 0) {
            amount *= 1 - penalty / 100;
            delete entity.pendingSetFlagsV117['formationNextNourishPenaltyPct'];
        }
    }
    const before = daoResourceValueV118(entity, resource);
    const after = setDaoResource(entity, resource, before + amount);
    const gained = Math.max(0, after - before);
    if (resource === 'fistChain' && gained > 0) {
        const bonus = setParamV120(entity, 'fist_combo_window', 'windowBonusPct');
        entity.pendingSetFlagsV117['fistComboExpiresAt'] = now + FIST_BASE_COMBO_WINDOW_SECONDS_V120 * (1 + bonus / 100);
    }
    return gained;
}
function spendDaoResource(entity, skill, resource, amount, minimum = 0) {
    const dao = skillRuntimeV117(skill).daoBinding;
    const strength = daoStrengthV118(entity, dao);
    if (strength <= 0)
        return 0;
    const current = daoResourceValueV118(entity, resource);
    let scaledMin = Math.max(0, minimum * strength);
    let wanted = amount === 'all' ? current : Math.max(0, amount * strength);
    if (resource === 'formationNurture' && skill.daoRuntimeV118?.signature === 'formationActivate' && typeof amount === 'number' && amount >= 70) {
        const variantEarly = variantParam(entity, 'formation', 'formationEarlyActivate', 'minimum', 0);
        const setEarly = setParamV120(entity, 'formation_early_activate', 'minimumCompletionPct', 0);
        const early = [variantEarly, setEarly].filter(x => x > 0).reduce((m, x) => Math.min(m, x), 70);
        if (early < 70) {
            scaledMin = Math.min(scaledMin, early * strength);
            wanted = Math.min(wanted, current);
        }
    }
    if (current + 1e-9 < scaledMin)
        return 0;
    if (resource === 'swordIntent' && amount === 'all' && hasVariant(entity, 'variant.dao.sword.unbroken_chain'))
        wanted = Math.min(wanted, current * .60);
    const spent = Math.min(current, wanted);
    setDaoResource(entity, resource, current - spent);
    return spent;
}
export function canUseBattleDaoSkillV118(entity, skill) {
    const r = skill.runtimeV117;
    const d = skill.daoRuntimeV118;
    if (battleDaoV2Enabled(entity) && r?.daoBinding && !canUseDaoActiveV2Runtime(entity, r.daoBinding))
        return false;
    // Bản Đạo V2 owns Dao resources/requirements. Legacy V1 resources must not shadow V2 cores.
    if (battleDaoV2Enabled(entity) && r?.daoBinding) {
        const dao = r.daoBinding;
        const state = entity.battleDaoStateV2;
        const sig = d?.signature;
        if (dao === 'formation') {
            const c = state?.formation?.core;
            if (!c)
                return true;
            if (sig === 'formationDeploy')
                return !c.deployed;
            if (!c.deployed)
                return false;
            if (sig === 'formationActivate') {
                const need = skill.id === 'skill.dao.formation.full_activate' ? 60 : 20;
                return c.nurture + 1e-9 >= need;
            }
            return true;
        }
        if (dao === 'artifact') {
            const c = state?.artifact?.core;
            if (!c)
                return true;
            if (sig === 'artifactDeploy')
                return c.artifactSources < c.artifactSourceCap;
            if (sig === 'artifactMerge')
                return c.artifactSources >= 2;
            if (sig === 'artifactRecall')
                return c.artifactSources > 1;
            return true;
        }
        if (dao === 'fist') {
            const force = Math.max(0, Number(state?.fist?.core?.fistForce) || 0);
            if (skill.id === 'skill.dao.fist.heavy')
                return force + 1e-9 >= 2;
            if (skill.id === 'skill.dao.fist.finisher')
                return force + 1e-9 >= 1;
        }
        return true;
    }
    const strength = daoStrengthV118(entity, r?.daoBinding);
    if (!d || strength <= 0)
        return true;
    for (const change of d.spend ?? []) {
        const current = daoResourceValueV118(entity, change.resource);
        let need = change.amount === 'all' ? Math.max(0, (change.minimum ?? 0) * strength) : Math.max((change.minimum ?? 0) * strength, typeof change.amount === 'number' ? change.amount * strength : 0);
        if (change.resource === 'formationNurture' && d.signature === 'formationActivate' && typeof change.amount === 'number' && change.amount >= 70) {
            const variantEarly = variantParam(entity, 'formation', 'formationEarlyActivate', 'minimum', 0);
            const setEarly = setParamV120(entity, 'formation_early_activate', 'minimumCompletionPct', 0);
            const early = [variantEarly, setEarly].filter(x => x > 0).reduce((m, x) => Math.min(m, x), 70);
            if (early < 70)
                need = Math.min(need, early * strength);
        }
        if (current + 1e-9 < need)
            return false;
    }
    if (d.signature === 'artifactDeploy' && entity.daoStateV118.artifactSources >= daoResourceCapV118(entity, 'artifactSources') - 1e-9)
        return false;
    if (d.signature === 'artifactMerge' && entity.daoStateV118.artifactSources < 2)
        return false;
    if (d.signature?.startsWith('formation')) {
        if (d.signature === 'formationDeploy')
            return true;
        if (!entity.daoStateV118.formationActive)
            return false;
        if (d.signature === 'formationActivate') {
            if ((entity.pendingSetFlagsV117['swordFormationLinked'] ?? 0) > 0)
                return false;
            const variantMin = variantParam(entity, 'formation', 'formationEarlyActivate', 'minimum', 0);
            const setMin = setParamV120(entity, 'formation_early_activate', 'minimumCompletionPct', 0);
            const min = [variantMin, setMin].filter(x => x > 0).reduce((m, x) => Math.min(m, x), 70);
            if (min < 70 && entity.daoStateV118.formationNurture + 1e-9 < min)
                return false;
        }
    }
    return true;
}
function applyElementSpendV118(entity, target, skill, action, now) {
    const root = effectiveSkillRootV118(entity, skill);
    const role = skill.daoRuntimeV118?.elementRole;
    if (!root || !role || role === 'generate' || role === 'defense')
        return;
    const payoff = (pct) => { action.effectBonusPct += pct * rootPayoffMultiplierV117(entity, root); };
    if (root === 'metal') {
        const current = resourceValueV117(entity, 'metalEdge');
        if (current >= 25) {
            const spent = Math.min(current, role === 'signature' ? current : 50);
            entity.fiveElementsV117.metalEdge -= spent;
            action.spentResources.metalEdge = (action.spentResources.metalEdge ?? 0) + spent;
            const b = spent * .5 * rootPayoffMultiplierV117(entity, 'metal');
            action.effectBonusPct += b;
            action.breakBonusPct += b;
            const full = setMechanicV117(entity, 'metal_full_edge_break_spend');
            if (full && spent >= 99.999) {
                action.effectBonusPct += setParamV120(entity, 'metal_full_edge_break_spend', 'breakPackageBonusPct');
                action.breakBonusPct += setParamV120(entity, 'metal_full_edge_break_spend', 'breakPackageBonusPct');
                entity.pendingSetFlagsV117['metalArmorGeneratePenaltyUntil'] = now + setParamV120(entity, 'metal_full_edge_break_spend', 'penaltySeconds', 3);
            }
        }
    }
    else if (root === 'wood') {
        const minimum = Math.min(rootMilestoneWoodHarvestRequirementPctV133(entity), Math.max(0, Math.min(100, setParamV120(entity, 'wood_early_harvest', 'minimumMaturityPct', 100))));
        if (role === 'signature' && entity.fiveElementsV117.woodSeed + 1e-9 >= minimum) {
            const maturity = entity.fiveElementsV117.woodSeed;
            payoff(35 * maturity / 100);
            entity.fiveElementsV117.woodSeed = 0;
            entity.fiveElementsV117.woodSeedMature = false;
            entity.fiveElementsV117.woodSeedInvestedLife = 0;
        }
        else {
            const spend = Math.min(entity.fiveElementsV117.woodLife, 35);
            if (spend > 0) {
                entity.fiveElementsV117.woodLife -= spend;
                action.spentResources.woodLife = (action.spentResources.woodLife ?? 0) + spend;
                const wasMature = entity.fiveElementsV117.woodSeedMature;
                const grown = addResourceV117(entity, 'woodSeed', spend, now);
                entity.fiveElementsV117.woodSeedInvestedLife += spend;
                if (grown > 0)
                    action.generatedResources.woodSeed = (action.generatedResources.woodSeed ?? 0) + grown;
                if (!wasMature && entity.fiveElementsV117.woodSeedMature) {
                    const refundPct = setParamV120(entity, 'wood_mature_refund', 'refundPct');
                    const refund = entity.fiveElementsV117.woodSeedInvestedLife * refundPct / 100;
                    if (refund > 0)
                        addResourceV117(entity, 'woodLife', refund, now);
                }
                const hybrid = setMechanicV117(entity, 'wood_consume_poison_to_seed');
                const poolKey = `poisonDotPool:${entity.id}`;
                const pool = Math.max(0, target.pendingSetFlagsV117[poolKey] ?? 0);
                if (hybrid && pool > 0) {
                    const conversion = setParamV120(entity, 'wood_consume_poison_to_seed', 'dotToMaturityConversionPct') / 100;
                    const seedGain = pool * conversion * 18;
                    const actual = addResourceV117(entity, 'woodSeed', seedGain, now);
                    if (actual > 0)
                        action.generatedResources.woodSeed = (action.generatedResources.woodSeed ?? 0) + actual;
                    target.pendingSetFlagsV117[poolKey] = 0;
                    const epochKey = `poisonDotEpoch:${entity.id}`;
                    target.pendingSetFlagsV117[epochKey] = (target.pendingSetFlagsV117[epochKey] ?? 0) + 1;
                }
            }
        }
    }
    else if (root === 'water') {
        if (role === 'signature') {
            addResourceV117(entity, 'waterTide', 1, now);
        }
        else if (entity.fiveElementsV117.waterTide >= 1 && entity.fiveElementsV117.waterFlow >= 20) {
            entity.fiveElementsV117.waterTide -= 1;
            let flowLoss = 20;
            flowLoss *= 1 - setParamV120(entity, 'water_spend_flow_retention', 'retainedLossPct') / 100;
            entity.fiveElementsV117.waterFlow = Math.max(0, entity.fiveElementsV117.waterFlow - flowLoss);
            action.spentResources.waterTide = (action.spentResources.waterTide ?? 0) + 1;
            action.spentResources.waterFlow = (action.spentResources.waterFlow ?? 0) + flowLoss;
            payoff(12);
        }
    }
    else if (root === 'fire') {
        if (role === 'signature') {
            const min = Math.min(rootMilestoneFireExtremeRequirementPctV133(entity), Math.max(0, Math.min(100, setParamV120(entity, 'fire_early_extreme_heat', 'minimumRequirementPct', 100))));
            if (entity.fiveElementsV117.fireExtremeUntil <= now && entity.fiveElementsV117.fireAftermathUntil <= now && entity.fiveElementsV117.fireHeat + 1e-9 >= min) {
                const heat = entity.fiveElementsV117.fireHeat;
                const missing = Math.max(0, 100 - heat);
                entity.fiveElementsV117.fireHeat = 0;
                entity.fiveElementsV117.fireExtremeUntil = now + 6 + rootMilestoneFireExtremeDurationBonusSecondsV133(entity);
                entity.fiveElementsV117.fireAftermathPenaltyPct = missing * setParamV120(entity, 'fire_early_extreme_heat', 'aftermathPenaltyPerMissingPct', 1.5);
            }
            else if (entity.fiveElementsV117.fireSeal >= 2) {
                const seals = entity.fiveElementsV117.fireSeal;
                entity.fiveElementsV117.fireSeal = 0;
                action.spentResources.fireSeal = (action.spentResources.fireSeal ?? 0) + seals;
                payoff(seals * 8);
                const heat = entity.fiveElementsV117.fireHeat;
                const baselineAfter = heat * .5;
                const retainedLoss = (heat - baselineAfter) * setParamV120(entity, 'fire_burst_heat_retention', 'heatRetainedPct') / 100;
                entity.fiveElementsV117.fireHeat = baselineAfter + retainedLoss;
            }
        }
    }
    else if (root === 'earth') {
        const before = entity.fiveElementsV117.earthWeight;
        if (before >= 25) {
            const spent = Math.min(before, role === 'signature' ? before : 50);
            entity.fiveElementsV117.earthWeight -= spent;
            action.spentResources.earthWeight = (action.spentResources.earthWeight ?? 0) + spent;
            payoff(spent * .45);
            const conversion = .40 + setParamV120(entity, 'earth_spend_to_recoil', 'conversionPct') / 100;
            addResourceV117(entity, 'earthRecoil', spent * conversion, now);
            if (before > 100 && spent > 0)
                entity.pendingSetFlagsV117['earthWeightGeneratePenaltyUntil'] = now + setParamV120(entity, 'earth_overcap_weight', 'penaltySeconds', 3);
        }
    }
}
function applyElementGenerateV118(entity, skill, action, now) {
    const root = effectiveSkillRootV118(entity, skill);
    const role = skill.daoRuntimeV118?.elementRole;
    if (!root || !role || role !== 'generate')
        return;
    const add = (resource, amount) => { const g = addResourceV117(entity, resource, amount * techniqueElementGenerateMultiplierV119(entity, skill, now), now); if (g > 0)
        action.generatedResources[resource] = (action.generatedResources[resource] ?? 0) + g; };
    if (root === 'metal')
        add('metalEdge', 15);
    else if (root === 'wood')
        add('woodLife', 18);
    else if (root === 'water')
        add('waterFlow', 14);
    else if (root === 'fire') {
        add('fireSeal', 1);
        add('fireHeat', 12);
    }
    // Thổ intentionally does not create Trọng Thế from offensive actions; it still comes from mitigation.
}
export const SPELL_OVERCHANNEL_MIN_SPIRIT_PCT_V134 = 60;
export function shouldSpellOverchannelV134(currentSpirit, maxSpirit) { return currentSpirit / Math.max(1, maxSpirit) * 100 >= SPELL_OVERCHANNEL_MIN_SPIRIT_PCT_V134; }
function spellOverchannelEnabledV134(entity, skill) {
    if (skillRuntimeV117(skill).form !== 'channel')
        return false;
    const extra = setParamV120(entity, 'spell_overchannel', 'maxExtraChannelPct');
    if (extra <= 0)
        return false;
    // V1.34: 6p says "cho phép Overchannel", not "ép Overchannel".
    // Auto-combat only invests extra channel/cost while the CN pool is healthy; below this line it releases the normal channel.
    return shouldSpellOverchannelV134(entity.spirit, entity.baseStats.maxSpirit);
}
export function daoSpiritCostMultiplierV118(entity, skill) {
    const dao = skillRuntimeV117(skill).daoBinding;
    if (battleDaoV2Enabled(entity) && dao)
        return 1;
    const strength = daoStrengthV118(entity, dao);
    if (strength <= 0)
        return 1;
    let mul = 1 - passiveSum(entity, dao, 'costReductionPct') / 100;
    if (dao === 'spell') {
        const quick = variantParam(entity, 'spell', 'spellTempo', 'costIncreasePct');
        if (quick > 0)
            mul *= 1 + quick / 100;
        const low = variantDefs(entity, 'spell').find(v => v.rule === 'spellLowSpirit');
        if (low && entity.spirit / Math.max(1, entity.baseStats.maxSpirit) * 100 < low.params.thresholdPct)
            mul *= 1 - (low.params.costReductionPct ?? 0) / 100;
        if (spellOverchannelEnabledV134(entity, skill)) {
            const extra = setParamV120(entity, 'spell_overchannel', 'maxExtraChannelPct');
            const rate = setParamV120(entity, 'spell_overchannel', 'extraSpiritCostPctOfOverchannel', 100);
            mul *= 1 + (extra / 100) * (rate / 100);
        }
    }
    return Math.max(.1, mul);
}
export function daoCastTimeMultiplierV118(entity, skill) {
    const dao = skillRuntimeV117(skill).daoBinding;
    if (battleDaoV2Enabled(entity) && dao)
        return 1;
    if (dao !== 'spell' || daoStrengthV118(entity, dao) <= 0)
        return 1;
    let mul = 1;
    mul *= 1 - variantParam(entity, 'spell', 'spellTempo', 'castReductionPct') / 100;
    mul *= 1 + variantParam(entity, 'spell', 'spellHeavy', 'castPenaltyPct') / 100;
    return Math.max(.4, mul);
}
export function prepareBattleDaoActionV118(entity, target, skill, action, now) {
    const d = skill.daoRuntimeV118;
    const dao = skillRuntimeV117(skill).daoBinding;
    const strength = daoStrengthV118(entity, dao);
    const notices = [];
    action.daoSpentResourcesV118 = {};
    action.daoGeneratedResourcesV118 = {};
    action.daoSignatureV118 = d?.signature;
    // v1.20: consume queued penalties/tempo before this action resolves. These are one-action effects.
    if ((entity.pendingSetFlagsV117['fistInterruptRecoveryPenaltyPct'] ?? 0) > 0 && dao === 'fist') {
        action.recoveryMultiplier *= 1 + (entity.pendingSetFlagsV117['fistInterruptRecoveryPenaltyPct'] ?? 0) / 100;
        delete entity.pendingSetFlagsV117['fistInterruptRecoveryPenaltyPct'];
    }
    if ((entity.pendingSetFlagsV117['mindNextBuildRecoveryReductionPct'] ?? 0) > 0 && d?.signature === 'mindBuild') {
        action.recoveryMultiplier *= Math.max(.1, 1 - (entity.pendingSetFlagsV117['mindNextBuildRecoveryReductionPct'] ?? 0) / 100);
        delete entity.pendingSetFlagsV117['mindNextBuildRecoveryReductionPct'];
    }
    if ((entity.pendingSetFlagsV117['artifactNextActionAdvancePct'] ?? 0) > 0 && dao === 'artifact') {
        action.recoveryMultiplier *= Math.max(.1, 1 - (entity.pendingSetFlagsV117['artifactNextActionAdvancePct'] ?? 0) / 100);
        delete entity.pendingSetFlagsV117['artifactNextActionAdvancePct'];
    }
    if (dao === 'fist') {
        const expires = entity.pendingSetFlagsV117['fistComboExpiresAt'] ?? 0;
        if (expires > 0 && expires <= now) {
            entity.daoStateV118.fistChain = 0;
            delete entity.pendingSetFlagsV117['fistComboExpiresAt'];
        }
    }
    if (!d || strength <= 0) {
        applyElementSpendV118(entity, target, skill, action, now);
        return notices;
    }
    // V2 owns all Dao resources/signatures. Keep only the Hành Ấn bridge; suppress V1 Dao mutations.
    if (battleDaoV2Enabled(entity) && dao) {
        applyElementSpendV118(entity, target, skill, action, now);
        return notices;
    }
    // Dynamic Hành binding: Thủy adaptation follows the authored Dao role, while a Set may lock it.
    const effectiveRoot = effectiveSkillRootV118(entity, skill);
    // Dynamic Hành Ấn must inherit the same Cực Viêm payoff as an authored Hỏa skill.
    // `prepareSkillActionRuntimeV117` only sees `runtimeV117.primaryRoot`, so without this bridge
    // a skill bound to Hỏa at runtime could enter Cực Viêm but never receive its offensive window.
    if (effectiveRoot === 'fire' && entity.fiveElementsV117.fireExtremeUntil > now && skillDomainsV117(skill).some(x => ['Damage', 'Fire', 'BạoViêm', 'Finisher'].includes(x))) {
        action.effectBonusPct += 30 * rootPayoffMultiplierV117(entity, 'fire');
    }
    if (effectiveRoot === 'water') {
        const desired = skill.daoRuntimeV118?.elementRole === 'defense' ? 'soften' : skill.daoRuntimeV118?.elementRole === 'spend' || skill.daoRuntimeV118?.elementRole === 'signature' ? 'tide' : 'flow';
        if (entity.fiveElementsV117.waterAdaptationLockedUntil <= now || entity.fiveElementsV117.waterAdaptation === desired)
            entity.fiveElementsV117.waterAdaptation = desired;
        const lock = setMechanicV117(entity, 'water_lock_adaptation');
        if (lock && entity.fiveElementsV117.waterFlow >= setParamV120(entity, 'water_lock_adaptation', 'requiredFlowPct', 80) && entity.fiveElementsV117.waterAdaptationLockedUntil <= now) {
            entity.fiveElementsV117.waterAdaptationLockedUntil = now + setParamV120(entity, 'water_lock_adaptation', 'lockSeconds', 2);
            action.effectBonusPct += setParamV120(entity, 'water_lock_adaptation', 'lockedPackageBonusPct');
        }
    }
    for (const ch of d.spend ?? []) {
        const spent = spendDaoResource(entity, skill, ch.resource, ch.amount, ch.minimum);
        if (spent > 0)
            action.daoSpentResourcesV118[ch.resource] = (action.daoSpentResourcesV118[ch.resource] ?? 0) + spent;
    }
    const spent = action.daoSpentResourcesV118;
    if (d.signature === 'swordBreak') {
        const s = spent.swordIntent ?? 0;
        action.breakBonusPct += s * .6 * (1 + passiveSum(entity, dao, 'breakPct') / 100);
        action.effectBonusPct += passiveSum(entity, dao, 'spendEffectPct');
        if (hasVariant(entity, 'variant.dao.sword.heavy_break')) {
            action.effectBonusPct -= 10;
            action.breakBonusPct += 25;
        }
    }
    if (d.signature === 'swordFinisher') {
        const s = spent.swordIntent ?? 0;
        const normal = Math.min(100, s);
        const extra = Math.max(0, s - 100);
        const extraEfficiency = setParamV120(entity, 'sword_over_spend_finisher', 'extraSpendEfficiencyPct', 70) / 100;
        let eff = normal * .5 + extra * .5 * extraEfficiency + passiveSum(entity, dao, 'spendEffectPct');
        if (hasVariant(entity, 'variant.dao.sword.unbroken_chain'))
            eff *= .85;
        if (hasVariant(entity, 'variant.dao.sword.nurture_strike'))
            eff *= 1.2;
        action.effectBonusPct += eff;
        if (target.breakDebuffUntil > now)
            action.effectBonusPct += 10 * strength;
        if (extra > 0)
            action.recoveryMultiplier *= 1 + (extra / 100) * setParamV120(entity, 'sword_over_spend_finisher', 'recoveryPenaltyPerExtraSpendPct', .5);
        const linked = entity.pendingSetFlagsV117['swordFormationLinked'] ?? 0;
        if (linked > 0 && entity.daoStateV118.formationActive) {
            const use = Math.min(entity.daoStateV118.formationNurture, 70);
            if (use > 0) {
                entity.daoStateV118.formationNurture -= use;
                action.effectBonusPct += setParamV120(entity, 'sword_link_formation_finisher', 'linkedActivationBonusPct');
                entity.daoStateV118.formationIntegrity = Math.max(0, entity.daoStateV118.formationIntegrity - (use >= 55 ? 25 : 10));
                delete entity.pendingSetFlagsV117['swordFormationLinked'];
            }
        }
    }
    if (d.signature === 'fistHeavy' || d.signature === 'fistFinisher') {
        const s = spent.fistChain ?? 0;
        action.effectBonusPct += s * (d.signature === 'fistFinisher' ? 10 : 8) + passiveSum(entity, dao, 'spendEffectPct');
        if (hasVariant(entity, 'variant.dao.fist.breaking')) {
            action.effectBonusPct -= 10;
            action.breakBonusPct += 25;
        }
    }
    if (d.signature === 'bodyCounter') {
        const s = spent.bodyCounter ?? 0;
        action.effectBonusPct += s * .5 + passiveSum(entity, dao, 'spendEffectPct');
        if ((entity.pendingSetFlagsV117['bodyEmpoweredCounterUntil'] ?? 0) > now) {
            action.effectBonusPct += setParamV120(entity, 'body_threshold_counter', 'counterBonusPct');
            delete entity.pendingSetFlagsV117['bodyEmpoweredCounterUntil'];
            delete entity.pendingSetFlagsV117['bodyCounterGenerateLockedUntil'];
        }
        if (hasVariant(entity, 'variant.dao.body.recoil_extreme'))
            action.effectBonusPct += 22;
        if (hasVariant(entity, 'variant.dao.body.extreme_burst')) {
            action.effectBonusPct += 22;
            entity.pendingSetFlagsV117['bodyDefensePenaltyUntil'] = now + 3;
        }
    }
    if (d.signature === 'bodyRecovery') {
        const s = spent.bodyCounter ?? 0;
        action.effectBonusPct += s * .35 + passiveSum(entity, dao, 'defenseEffectPct');
        if (hasVariant(entity, 'variant.dao.body.transform_return'))
            action.effectBonusPct += 20;
    }
    if (d.signature === 'spellSealSpend') {
        const s = spent.spellSeal ?? 0;
        if (s > 0)
            entity.pendingSetFlagsV117['spellNextDaoBonusPct'] = s * 8 + passiveSum(entity, dao, 'spendEffectPct');
    }
    else if (dao === 'spell' && skillSlotClassV117(skill) === 'active') {
        const queued = entity.pendingSetFlagsV117['spellNextDaoBonusPct'] ?? 0;
        if (queued > 0) {
            action.effectBonusPct += queued;
            delete entity.pendingSetFlagsV117['spellNextDaoBonusPct'];
        }
    }
    if (dao === 'spell') {
        action.effectBonusPct += variantParam(entity, 'spell', 'spellHeavy', 'effectBonusPct');
        if (skillRuntimeV117(skill).form === 'channel' && hasVariant(entity, 'variant.dao.spell.long_channel')) {
            action.effectBonusPct += variantParam(entity, 'spell', 'spellChannel', 'channelEffectBonusPct');
            action.channelDurationMultiplierV118 = 1 + variantParam(entity, 'spell', 'spellChannel', 'channelDurationPct') / 100;
        }
        if (spellOverchannelEnabledV134(entity, skill)) {
            const extra = setParamV120(entity, 'spell_overchannel', 'maxExtraChannelPct');
            action.channelDurationMultiplierV118 = (action.channelDurationMultiplierV118 ?? 1) * (1 + extra / 100);
            action.effectBonusPct += extra * setParamV120(entity, 'spell_overchannel', 'effectEfficiencyPct', 80) / 100;
        }
        const low = variantDefs(entity, 'spell').find(v => v.rule === 'spellLowSpirit');
        if (low && entity.spirit / Math.max(1, entity.baseStats.maxSpirit) * 100 < (low.params.thresholdPct ?? 35))
            action.effectBonusPct -= low.params.effectPenaltyPct ?? 0;
    }
    if (d.signature === 'artifactDeploy') {
        const p = entity.pendingSetFlagsV117['artifactNextDeployPenaltyPct'] ?? 0;
        if (p > 0) {
            action.recoveryMultiplier *= 1 + p / 100;
            delete entity.pendingSetFlagsV117['artifactNextDeployPenaltyPct'];
        }
    }
    if (d.signature === 'poisonConsume') {
        const marks = target.marks['Độc Tầng'] ?? 0;
        action.effectBonusPct += Math.min(30, marks * 2) + passiveSum(entity, dao, 'spendEffectPct');
        if (hasVariant(entity, 'variant.dao.poison.devour'))
            action.effectBonusPct += 24;
    }
    if (d.signature === 'poisonDefend') {
        const marks = target.marks['Độc Tầng'] ?? 0;
        action.effectBonusPct += Math.min(20, marks * 2) + passiveSum(entity, dao, 'defenseEffectPct') + variantParam(entity, 'poison', 'poisonDefenseTrade', 'defenseBonusPct');
    }
    if (d.signature === 'artifactCommand') {
        const sources = Math.max(1, entity.daoStateV118.artifactSources);
        let per = 6;
        per += variantParam(entity, 'artifact', 'artifactSourceCap', 'perSourceBonusPct') / 4;
        per -= variantParam(entity, 'artifact', 'artifactSourceCap', 'perSourcePenaltyPct') / 4;
        action.effectBonusPct += (sources - 1) * per + passiveSum(entity, dao, 'commandEffectPct') + passiveSum(entity, dao, 'sourceScalingPct') * Math.max(0, sources - 1);
    }
    if (dao === 'artifact' && d?.elementRole === 'signature' && (entity.pendingSetFlagsV117['artifactFusionUntil'] ?? 0) > now)
        action.effectBonusPct += setParamV120(entity, 'artifact_fusion', 'primarySignatureBonusPct');
    if (d.signature === 'artifactMerge') {
        const s = spent.artifactSources ?? 0;
        action.effectBonusPct += Math.max(0, s - 1) * 18 + passiveSum(entity, dao, 'spendEffectPct') + variantParam(entity, 'artifact', 'artifactMergeTrade', 'mergeBonusPct');
        if (hasVariant(entity, 'variant.dao.artifact.merge_true'))
            action.recoveryMultiplier *= 1.2;
    }
    if (d.signature === 'formationActivate') {
        // V1.27: Tuyệt Kỹ Chu Thiên tự đẩy Chủ Trận tới đại thành trước khi kích; không bị -45% vì không có spend array.
        // V1.28: Trận thiên thủ được thưởng nếu thật sự giữ Chủ Trận khỏe. Độ Bền chỉ buff package Kích Trận hẹp, không thành Total Damage.
        const ultimateActivation = skillSlotClassV117(skill) === 'ultimate';
        const s = ultimateActivation ? 70 : (spent.formationNurture ?? 0);
        let ratio = Math.min(1, s / 70);
        if (!ultimateActivation && (hasVariant(entity, 'variant.dao.formation.quick_activate') || hasSetV120(entity, 'formation_early_activate')) && s < 70)
            ratio = s / 70;
        const integrityPayoff = Math.min(30, Math.max(0, entity.daoStateV118.formationIntegrity) * .30);
        action.effectBonusPct += Math.max(-45, (ratio - 1) * 100) + integrityPayoff + passiveSum(entity, dao, 'spendEffectPct') + variantParam(entity, 'formation', 'formationNurtureCap', 'activateBonusPct');
        action.effectBonusPct -= variantParam(entity, 'formation', 'formationGuardTrade', 'activatePenaltyPct');
    }
    if (d.signature === 'mindInterfere')
        action.effectBonusPct += passiveSum(entity, dao, 'interferePct');
    if (d.signature === 'mindBurst') {
        action.effectBonusPct += passiveSum(entity, dao, 'spendEffectPct');
        if (hasVariant(entity, 'variant.dao.mind.interfere'))
            action.effectBonusPct -= 18;
        if (hasVariant(entity, 'variant.dao.mind.burst'))
            action.effectBonusPct += 25;
        if (hasVariant(entity, 'variant.dao.mind.multi'))
            action.effectBonusPct -= 15;
        if (hasVariant(entity, 'variant.dao.mind.focus'))
            action.effectBonusPct += 25;
    }
    if (d.signature === 'bodyDefense') {
        action.effectBonusPct += passiveSum(entity, dao, 'defenseEffectPct') + variantParam(entity, 'body', 'bodyDefenseSlow', 'defenseBonusPct');
        if ((entity.pendingSetFlagsV117['bodyDefensePenaltyUntil'] ?? 0) > now)
            action.effectBonusPct -= 18;
    }
    if (d.signature === 'swordGuard')
        action.effectBonusPct += passiveSum(entity, dao, 'counterEffectPct');
    if (d.signature === 'fistCounter')
        action.effectBonusPct += passiveSum(entity, dao, 'counterEffectPct');
    action.recoveryMultiplier *= 1 - passiveSum(entity, dao, 'recoveryReductionPct') / 100;
    if (hasVariant(entity, 'variant.dao.body.immovable_true') && dao === 'body')
        action.recoveryMultiplier *= 1.12;
    applyElementSpendV118(entity, target, skill, action, now);
    const totalDaoSpend = Object.values(action.daoSpentResourcesV118 ?? {}).reduce((sum, value) => sum + Math.max(0, Number(value ?? 0)), 0);
    if (totalDaoSpend > 0 && (techniqueEquippedMasteryV119(entity, 'technique.v119.secret.steal_heaven') >= 40 || techniqueEquippedMasteryV119(entity, 'technique.v119.secret.hidden_edge') >= 40))
        entity.pendingSetFlagsV117['techniqueAfterDaoSpendUntil'] = Math.max(entity.pendingSetFlagsV117['techniqueAfterDaoSpendUntil'] ?? 0, now + 4);
    return notices;
}
export function finishBattleDaoActionV118(entity, target, skill, action, now) {
    const d = skill.daoRuntimeV118;
    const dao = skillRuntimeV117(skill).daoBinding;
    const strength = daoStrengthV118(entity, dao);
    const notices = [];
    let targetCastDelaySeconds = 0;
    if (d && strength > 0 && !(battleDaoV2Enabled(entity) && dao)) {
        for (const ch of d.generate ?? []) {
            if (ch.amount === 'all')
                continue;
            if (ch.resource === 'formationNurture' && !entity.daoStateV118.formationActive)
                continue;
            const g = addDaoResource(entity, skill, ch.resource, ch.amount, now);
            if (g > 0) {
                action.daoGeneratedResourcesV118[ch.resource] = (action.daoGeneratedResourcesV118[ch.resource] ?? 0) + g;
            }
        }
        if (dao === 'fist') {
            if (d.signature === 'fistHeavy' || d.signature === 'fistFinisher') {
                const spent = action.daoSpentResourcesV118?.fistChain ?? 0;
                const retainPct = setParamV120(entity, 'fist_finisher_pressure_retention', 'pressureRetainedPct');
                if (spent > 0 && retainPct > 0)
                    setDaoResource(entity, 'fistChain', entity.daoStateV118.fistChain + spent * retainPct / 100);
            }
            if (entity.daoStateV118.fistChain > 0) {
                const bonus = setParamV120(entity, 'fist_combo_window', 'windowBonusPct');
                entity.pendingSetFlagsV117['fistComboExpiresAt'] = now + FIST_BASE_COMBO_WINDOW_SECONDS_V120 * (1 + bonus / 100);
            }
        }
        if (d.signature === 'swordFinisher' && target.breakDebuffUntil > now) {
            const spent = action.daoSpentResourcesV118?.swordIntent ?? 0;
            const pct = Math.min(setParamV120(entity, 'sword_finisher_refund', 'refundPct'), setParamV120(entity, 'sword_finisher_refund', 'globalRefundCapPct', 40));
            if (spent > 0 && pct > 0)
                setDaoResource(entity, 'swordIntent', entity.daoStateV118.swordIntent + spent * pct / 100);
        }
        if (d.signature === 'formationDeploy') {
            entity.daoStateV118.formationActive = true;
            entity.daoStateV118.formationNurture = 0;
            entity.daoStateV118.formationIntegrity = 100;
        }
        if (d.signature === 'formationActivate') {
            const ultimateActivation = skillSlotClassV117(skill) === 'ultimate';
            const spentN = ultimateActivation ? 70 : (action.daoSpentResourcesV118?.formationNurture ?? 0);
            if (ultimateActivation)
                entity.daoStateV118.formationNurture = 0;
            const heavy = spentN >= 55;
            const baseLoss = heavy ? 25 : 10;
            const variantPenalty = variantParam(entity, 'formation', 'formationEarlyActivate', 'integrityPenaltyPct');
            const setPenalty = !ultimateActivation && spentN < 70 ? setParamV120(entity, 'formation_early_activate', 'integrityCostPenaltyPct') : 0;
            entity.daoStateV118.formationIntegrity = Math.max(0, entity.daoStateV118.formationIntegrity - baseLoss * (1 + (variantPenalty + setPenalty) / 100));
            if (hasVariant(entity, 'variant.dao.formation.chain') && heavy) {
                entity.daoStateV118.formationNurture = Math.max(entity.daoStateV118.formationNurture, 20);
                entity.pendingSetFlagsV117['formationNextNourishPenaltyPct'] = 25;
            }
            const chainPct = setParamV120(entity, 'formation_chain_nourish', 'progressRequirementPct');
            if (chainPct > 0 && entity.daoStateV118.formationActive)
                addDaoResource(entity, skill, 'formationNurture', 70 * chainPct / 100, now);
            if (entity.daoStateV118.formationIntegrity <= 0) {
                entity.daoStateV118.formationActive = false;
                entity.daoStateV118.formationNurture = 0;
                delete entity.pendingSetFlagsV117['swordFormationLinked'];
            }
        }
        if (d.signature === 'formationBreak') {
            if (entity.daoStateV118.formationActive) {
                const refund = (entity.daoStateV118.formationNurture + entity.daoStateV118.formationIntegrity) * .04 * (1 + passiveSum(entity, dao, 'recoverySpiritPct') / 100);
                entity.spirit = Math.min(entity.baseStats.maxSpirit, entity.spirit + refund);
            }
            entity.daoStateV118.formationActive = false;
            entity.daoStateV118.formationNurture = 0;
            entity.daoStateV118.formationIntegrity = 0;
            delete entity.pendingSetFlagsV117['swordFormationLinked'];
        }
        if (d.signature === 'artifactMerge') {
            const merged = Math.max(2, action.daoSpentResourcesV118?.artifactSources ?? 2);
            entity.daoStateV118.artifactSources = 1;
            entity.pendingSetFlagsV117['artifactSourceProgressV128'] = 0;
            const duration = setParamV120(entity, 'artifact_fusion', 'durationSeconds');
            if (duration > 0) {
                entity.pendingSetFlagsV117['artifactFusionUntil'] = now + duration;
                entity.pendingSetFlagsV117['artifactFusionStoredSources'] = merged;
            }
        }
        if (dao === 'artifact' && d.signature !== 'artifactMerge') {
            const advance = setParamV120(entity, 'artifact_alternate_advance', 'nextOtherSourceAdvancePct');
            if (advance > 0 && entity.daoStateV118.artifactSources >= 2)
                entity.pendingSetFlagsV117['artifactNextActionAdvancePct'] = advance;
        }
        if (d.signature === 'artifactRecall' && hasVariant(entity, 'variant.dao.artifact.sacrifice')) {
            entity.spirit = Math.min(entity.baseStats.maxSpirit, entity.spirit + 8);
            entity.pendingSetFlagsV117['artifactNextDeployPenaltyPct'] = 25;
        }
        if (d.signature === 'mindInterfere') {
            const cap = daoMarkCapV118(entity, skill, 'Thần Ấn', 5);
            const current = Math.min(cap, target.marks['Thần Ấn'] ?? 0);
            const used = Math.min(3, current);
            if (used > 0) {
                target.marks['Thần Ấn'] = Math.max(0, (target.marks['Thần Ấn'] ?? 0) - used);
                entity.pendingSetFlagsV117['lastConsumedMindMarksV120'] = used;
                let pct = used * 6 * (1 + passiveSum(entity, dao, 'interferePct') / 100);
                pct *= 1 + (skillGrowthV126(entity, skill)?.controlEffectPct ?? 0) / 100;
                if (hasVariant(entity, 'variant.dao.mind.interfere'))
                    pct *= 1.3;
                if (target.tags.includes('Boss'))
                    pct *= .5;
                targetCastDelaySeconds = Math.min(1.5, pct / 100 * 2.5);
                target.pendingSetFlagsV117['mindRecoveryPenaltyPct'] = Math.max(target.pendingSetFlagsV117['mindRecoveryPenaltyPct'] ?? 0, pct);
            }
        }
        const consumedMind = entity.pendingSetFlagsV117['lastConsumedMindMarksV120'] ?? 0;
        if (consumedMind > 0 && (d.signature === 'mindInterfere' || d.signature === 'mindBurst')) {
            const rec = setParamV120(entity, 'mind_mark_next_recovery', 'recoveryReductionPct');
            if (rec > 0)
                entity.pendingSetFlagsV117['mindNextBuildRecoveryReductionPct'] = rec;
            const disrupt = setMechanicV117(entity, 'mind_consume_all_disrupt');
            if (disrupt) {
                const cap = Math.max(1, daoMarkCapV118(entity, skill, 'Thần Ấn', 5));
                let pct = setParamV120(entity, 'mind_consume_all_disrupt', 'disruptionCapPct') * Math.min(1, consumedMind / cap);
                if (target.tags.includes('Boss'))
                    pct *= .5;
                targetCastDelaySeconds = Math.max(targetCastDelaySeconds, Math.min(1.5, pct / 100 * 2.5));
                target.pendingSetFlagsV117['mindRecoveryPenaltyPct'] = Math.max(target.pendingSetFlagsV117['mindRecoveryPenaltyPct'] ?? 0, pct);
                entity.pendingSetFlagsV117['mindBuildPenaltyUntil'] = now + setParamV120(entity, 'mind_consume_all_disrupt', 'penaltySeconds', 4);
                entity.pendingSetFlagsV117['mindBuildPenaltyPct'] = setParamV120(entity, 'mind_consume_all_disrupt', 'postConsumeGeneratePenaltyPct', 40);
            }
            delete entity.pendingSetFlagsV117['lastConsumedMindMarksV120'];
        }
        if ((d.signature === 'poisonConsume' || d.signature === 'mindBurst') && hasVariant(entity, d.signature === 'poisonConsume' ? 'variant.dao.poison.devour' : 'variant.dao.mind.burst'))
            entity.pendingSetFlagsV117[d.signature === 'poisonConsume' ? 'poisonBuildPenaltyUntil' : 'mindBuildPenaltyUntil'] = now + 4;
        if (dao === 'sword' && entity.daoStateV118.formationActive) {
            const nourish = setParamV120(entity, 'sword_formation_nourish', 'standardFormationContributionPct');
            if (nourish > 0)
                addDaoResource(entity, skill, 'formationNurture', 30 * nourish / 100, now);
            if (setMechanicV117(entity, 'sword_link_formation_finisher') && entity.daoStateV118.formationNurture >= 70 && !entity.pendingSetFlagsV117['swordFormationLinked'])
                entity.pendingSetFlagsV117['swordFormationLinked'] = 1;
        }
        const gaugeFlat = passiveSum(entity, dao, 'gaugeGainFlat');
        if (gaugeFlat > 0 && d.signature && ['swordFinisher', 'fistFinisher', 'poisonConsume'].includes(d.signature)) {
            entity.ultimateGaugeV117 = Math.min(100, entity.ultimateGaugeV117 + gaugeFlat);
        }
    }
    const growth = skillGrowthV126(entity, skill);
    if ((growth?.daoRefundPct ?? 0) > 0) {
        for (const [resource, rawSpent] of Object.entries(action.daoSpentResourcesV118 ?? {})) {
            const spent = Math.max(0, Number(rawSpent ?? 0));
            if (spent <= 0)
                continue;
            const before = daoResourceValueV118(entity, resource);
            const after = setDaoResource(entity, resource, before + spent * growth.daoRefundPct / 100);
            const refunded = Math.max(0, after - before);
            if (refunded > 0) {
                action.daoGeneratedResourcesV118[resource] = (action.daoGeneratedResourcesV118[resource] ?? 0) + refunded;
                notices.push({ message: `${entity.name} vận Cực Ý ${skill.name}, hoàn ${refunded.toFixed(1)} ${resource}.`, data: { practiceRefund: refunded, practiceRefundPct: growth.daoRefundPct } });
            }
        }
    }
    applyElementGenerateV118(entity, skill, action, now);
    if (dao !== 'fist' && entity.daoStateV118.fistChain > 0) {
        const retain = hasVariant(entity, 'variant.dao.fist.endless') ? .5 : 0;
        entity.daoStateV118.fistChain = Math.floor(entity.daoStateV118.fistChain * retain);
        if (retain === 0)
            delete entity.pendingSetFlagsV117['fistComboExpiresAt'];
    }
    return { notices, targetCastDelaySeconds };
}
export function formationFieldGuardV133(entity, incomingCoefficient) {
    if (battleDaoV2Enabled(entity))
        return { mitigationPct: 0, integritySpent: 0 };
    const strength = daoStrengthV118(entity, 'formation');
    if (strength <= 0 || !entity.daoStateV118.formationActive || entity.daoStateV118.formationIntegrity <= 0)
        return { mitigationPct: 0, integritySpent: 0 };
    const integrity = Math.max(0, Math.min(100, entity.daoStateV118.formationIntegrity));
    // V1.33: Chủ Trận is a persistent defensive field, not a hidden hard-stun. Main Trận receives 55–65%
    // mitigation while the field remains active; Độ Bền supplies the final 10 points. Secondary Trận receives
    // the canonical 60% Dao package through `strength`, so it cannot copy Main Trận's full tank identity.
    const mitigationPct = Math.min(65, (55 + integrity * .10) * strength);
    // Incoming hits do not directly erase Độ Bền. Kích Trận is the authored offense trade-off that spends
    // Độ Bền; Fortify/Convert restore it. Reaching 0 collapses the field and removes this mitigation.
    return { mitigationPct, integritySpent: 0 };
}
export function onMitigationEventV118(entity, eventBudget, mitigatedRatio, now = 0) {
    if (battleDaoV2Enabled(entity))
        return [];
    const strength = daoStrengthV118(entity, 'body');
    if (strength <= 0)
        return [];
    if ((entity.pendingSetFlagsV117['bodyCounterGenerateLockedUntil'] ?? 0) > now)
        return [];
    let amount = eventBudget * Math.max(0, Math.min(1, mitigatedRatio)) * .8 * strength;
    amount *= 1 + passiveSum(entity, 'body', 'mitigationGeneratePct') / 100;
    amount *= 1 + setParamV120(entity, 'body_mitigated_pressure_conversion', 'conversionBonusPct') / 100;
    if (hasVariant(entity, 'variant.dao.body.recoil_extreme'))
        amount *= .8;
    const before = entity.daoStateV118.bodyCounter;
    entity.daoStateV118.bodyCounter = Math.min(100, before + amount);
    const gained = entity.daoStateV118.bodyCounter - before;
    if (before < BODY_EMPOWERED_COUNTER_THRESHOLD_V120 && entity.daoStateV118.bodyCounter >= BODY_EMPOWERED_COUNTER_THRESHOLD_V120 && hasSetV120(entity, 'body_threshold_counter')) {
        const hold = Math.max(BODY_EMPOWERED_COUNTER_BASE_HOLD_SECONDS_V120, setParamV120(entity, 'body_hold_empowered_counter', 'holdSeconds', BODY_EMPOWERED_COUNTER_BASE_HOLD_SECONDS_V120));
        entity.pendingSetFlagsV117['bodyEmpoweredCounterUntil'] = now + hold;
        if (hasSetV120(entity, 'body_hold_empowered_counter'))
            entity.pendingSetFlagsV117['bodyCounterGenerateLockedUntil'] = now + hold;
    }
    return gained > 0 ? [{ message: `${entity.name} tích ${gained.toFixed(1)} Phản Thế từ mitigation thật.`, data: { bodyCounter: entity.daoStateV118.bodyCounter } }] : [];
}
export function daoMarkCapV118(entity, skill, mark, baseCap) {
    const dao = skillRuntimeV117(skill).daoBinding;
    if (dao === 'mind' && mark === 'Thần Ấn')
        return variantParam(entity, 'mind', 'mindMarkCap', 'cap', baseCap);
    return baseCap;
}
export function adjustDaoMarkStacksV118(entity, skill, mark, baseStacks, now) {
    const dao = skillRuntimeV117(skill).daoBinding;
    let raw = baseStacks;
    if (dao === 'poison' && mark === 'Độc Tầng')
        raw *= 1 + (passiveSum(entity, dao, 'markGeneratePct') + setParamV120(entity, 'poison_generate_maintain', 'bonusPct')) / 100;
    if (dao === 'mind' && mark === 'Thần Ấn')
        raw *= 1 + (passiveSum(entity, dao, 'markGeneratePct') + setParamV120(entity, 'mind_mark_generate_maintain', 'bonusPct')) / 100;
    if ((dao === 'poison' && mark === 'Độc Tầng') || (dao === 'mind' && mark === 'Thần Ấn'))
        raw *= 1 + (skillGrowthV126(entity, skill)?.daoGeneratePct ?? 0) / 100;
    const penaltyUntil = dao === 'poison' ? entity.pendingSetFlagsV117['poisonBuildPenaltyUntil'] ?? 0 : dao === 'mind' ? entity.pendingSetFlagsV117['mindBuildPenaltyUntil'] ?? 0 : 0;
    if (penaltyUntil > now) {
        const pct = dao === 'poison' ? entity.pendingSetFlagsV117['poisonBuildPenaltyPct'] ?? 25 : entity.pendingSetFlagsV117['mindBuildPenaltyPct'] ?? 25;
        raw *= Math.max(0, 1 - pct / 100);
    }
    const key = dao === 'poison' ? 'poisonMarkCarryV118' : dao === 'mind' ? 'mindMarkCarryV118' : '';
    if (!key)
        return Math.max(0, Math.floor(raw));
    const carry = entity.pendingSetFlagsV117[key] ?? 0;
    const total = raw + carry;
    const out = Math.floor(total + 1e-9);
    entity.pendingSetFlagsV117[key] = total - out;
    return Math.max(0, out);
}
export function adjustDaoDotV118(entity, skill, coefficientPerTick, ticks) {
    if (skillRuntimeV117(skill).daoBinding !== 'poison')
        return { coefficientPerTick, ticks };
    let c = coefficientPerTick * (1 + (passiveSum(entity, 'poison', 'dotEffectPct') + setParamV120(entity, 'poison_generate_maintain', 'bonusPct')) / 100);
    let t = ticks;
    if (hasVariant(entity, 'variant.dao.poison.long')) {
        t = Math.max(1, Math.round(t * 1.4));
        c *= .8;
    }
    if (hasVariant(entity, 'variant.dao.poison.fast')) {
        t = Math.max(1, Math.round(t * .75));
        c *= 1.28;
    }
    if (hasVariant(entity, 'variant.dao.poison.reverse'))
        c *= .85;
    return { coefficientPerTick: c, ticks: t };
}
export function daoRecoveryMultiplierForTargetV118(entity, now) {
    const pct = entity.pendingSetFlagsV117['mindRecoveryPenaltyPct'] ?? 0;
    if (pct <= 0)
        return 1;
    delete entity.pendingSetFlagsV117['mindRecoveryPenaltyPct'];
    return 1 + Math.min(50, pct) / 100;
}
/** v1.20 combat-local timers for Set mechanics that must survive across actions but not combats. */
export function updateBattleDaoTimersV120(entity, now) {
    const out = [];
    const fistUntil = entity.pendingSetFlagsV117['fistComboExpiresAt'] ?? 0;
    if (fistUntil > 0 && fistUntil <= now) {
        entity.daoStateV118.fistChain = 0;
        delete entity.pendingSetFlagsV117['fistComboExpiresAt'];
    }
    const fusionUntil = entity.pendingSetFlagsV117['artifactFusionUntil'] ?? 0;
    if (fusionUntil > 0 && fusionUntil <= now) {
        const restore = entity.pendingSetFlagsV117['artifactFusionStoredSources'] ?? 1;
        entity.daoStateV118.artifactSources = Math.min(daoResourceCapV118(entity, 'artifactSources'), Math.max(1, restore));
        delete entity.pendingSetFlagsV117['artifactFusionUntil'];
        delete entity.pendingSetFlagsV117['artifactFusionStoredSources'];
        out.push({ message: `${entity.name} kết thúc Hợp Khí, các nguồn Pháp Bảo trở lại.`, data: { artifactSources: entity.daoStateV118.artifactSources } });
    }
    const bodyUntil = entity.pendingSetFlagsV117['bodyEmpoweredCounterUntil'] ?? 0;
    if (bodyUntil > 0 && bodyUntil <= now) {
        delete entity.pendingSetFlagsV117['bodyEmpoweredCounterUntil'];
        delete entity.pendingSetFlagsV117['bodyCounterGenerateLockedUntil'];
    }
    return out;
}
export function onBattleDaoInterruptedV120(entity, now) {
    const chain = entity.daoStateV118.fistChain;
    if (chain > 5 && hasSetV120(entity, 'fist_combo_overcap'))
        entity.pendingSetFlagsV117['fistInterruptRecoveryPenaltyPct'] = setParamV120(entity, 'fist_combo_overcap', 'interruptRecoveryPenaltyPct', 25);
    if (chain > 0)
        entity.daoStateV118.fistChain = 0;
    delete entity.pendingSetFlagsV117['fistComboExpiresAt'];
    if ((entity.pendingSetFlagsV117['bodyEmpoweredCounterUntil'] ?? 0) > now) {
        delete entity.pendingSetFlagsV117['bodyEmpoweredCounterUntil'];
        delete entity.pendingSetFlagsV117['bodyCounterGenerateLockedUntil'];
    }
}
/** Hunt baseline: personal Dao meters keep 50%; deploy/setup states are combat-local and reset between monsters. */
export function carryBattleDaoStateToNextMonsterV118(state) {
    return {
        swordIntent: state.swordIntent * .5,
        fistChain: Math.floor(state.fistChain * .5),
        bodyCounter: state.bodyCounter * .5,
        spellSeal: Math.floor(state.spellSeal * .5),
        artifactSources: 0,
        formationActive: false,
        formationNurture: 0,
        formationIntegrity: 0,
    };
}
//# sourceMappingURL=battle-dao-combat-v118.js.map