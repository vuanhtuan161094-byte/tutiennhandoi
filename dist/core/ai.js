import { artifactAutoWindow } from './battle-dao-v2-contract.js';
import { poisonAutoWindow } from './battle-dao-v2-contract.js';
import { combatMaxHp, skillTrueEssenceCost } from './combat-rules.js';
import { canUseSkillRuntimeV117, resourceValueV117, skillSpiritCostMultiplierFromRuntimeV117 } from './five-element-combat-v117.js';
import { canUseBattleDaoSkillV118, daoResourceValueV118, daoSpiritCostMultiplierV118 } from './battle-dao-combat-v118.js';
import { BODY_BLOOD_RUSH_OFFENSE_EMERGENCY_HP_PCT_V1, bodyDaoAutoCounterForceMinV1 } from './body-dao-auto-v1.js';
import { BODY_BLOOD_RUSH_MIN_HP_PCT_V1, BODY_BLOOD_RUSH_SKILL_ID_V1, v2ResourceProjection } from './battle-dao-v2-runtime.js';
import { skillRuntimeV117 } from './skill-runtime-v117.js';
import { effectiveStats } from './stats.js';
function daoV2AiResourceValue(self, _target, resource, now) {
    const projected = v2ResourceProjection(self, now)[resource];
    return typeof projected === 'number' ? projected : undefined;
}
function bodyBloodRushAutoMinHpPct(self) {
    const rule = self?.aiProfile?.rules?.find?.(row => row?.skillId === BODY_BLOOD_RUSH_SKILL_ID_V1);
    const condition = rule?.conditions?.find?.(row => row?.type === 'selfHpAbove');
    const pct = Number(condition?.pct);
    return Number.isFinite(pct) ? Math.max(BODY_BLOOD_RUSH_MIN_HP_PCT_V1, pct) : 75;
}
function bodyBloodRushActivationCount(self) {
    return Math.max(0, Number(self?.battleDaoStateV2?.body?.core?.bodyBloodRushActivations) || 0);
}
function bodyBloodRushProtectsOffenseWindow(self, now) {
    if (self?.combatBuildV117?.mainDaoId !== 'body')
        return false;
    const projection = v2ResourceProjection(self, now);
    if (!projection.bodyBloodRushActive)
        return false;
    const hpPct = self.hp / Math.max(1, combatMaxHp(self.baseStats)) * 100;
    return hpPct + 1e-9 >= BODY_BLOOD_RUSH_OFFENSE_EMERGENCY_HP_PCT_V1;
}
function bodyBloodRushSuppressesRoutineDefense(self, skill, now) {
    if (!bodyBloodRushProtectsOffenseWindow(self, now))
        return false;
    return skill.id === 'skill.dao.body.guard'
        || skill.id === 'skill.dao.body.immovable'
        || skill.id === 'skill.dao.body.ultimate';
}
function checkCondition(condition, self, target, now) {
    switch (condition.type) {
        case 'always': return true;
        case 'artifactWindow': return artifactAutoWindow(self,target,condition.suffix,now);
        case 'poisonWindow': return poisonAutoWindow(self,target,condition.suffix,now);
        case 'spellNeedsSpirit': return self.combatBuildV117?.mainDaoId === 'spell' && self.spirit / Math.max(1, self.baseStats.maxSpirit) < .40;
        case 'spellPayoffReady': {
            const core = self.battleDaoStateV2?.spell?.core;
            if (!core?.dienPhapReady) return false;
            // Bạo keeps the single readiness for an equipped heavy spell when it is affordable
            // and will be available within four seconds. Other kits can use Break immediately.
            return condition.suffix !== 'break' || !self.skillIds.includes('skill.dao.spell.burst')
                || (self.cooldownUntil['skill.dao.spell.burst'] ?? 0) > now + 4
                || self.spirit < (self.baseStats.spiritStandard ?? 100) * .28;
        }
        case 'spellChannelWindow': {
            // A short Basic windup is not an authored interrupt telegraph. Long casts
            // and channels expose Dẫn Pháp; a Broken target is a safe window.
            const risky = target.channeling || target.casting && (!Number.isFinite(target.casting.startedAt)
                || target.casting.resolvesAt - target.casting.startedAt >= .75);
            return self.combatBuildV117?.mainDaoId === 'spell'
                && self.spirit >= (self.baseStats.spiritStandard ?? 100) * .24
                && (!risky || target.breakDebuffUntil > now);
        }
        case 'spellWheelStepReady': return self.battleDaoStateV2?.spell?.core?.expectedForm === condition.form
            && (condition.form !== 'Dẫn Pháp' || checkCondition({ type: 'spellChannelWindow' }, self, target, now));
        case 'selfHpBelow': return self.hp / combatMaxHp(self.baseStats) * 100 < condition.pct;
        case 'selfHpAbove': return self.hp / combatMaxHp(self.baseStats) * 100 + 1e-9 >= condition.pct;
        case 'selfSpiritBelow': return self.spirit / Math.max(1, self.baseStats.maxSpirit) * 100 < condition.pct;
        case 'targetHpBelow': return target.hp / combatMaxHp(target.baseStats) * 100 < condition.pct;
        case 'targetHpAbove': return target.hp / combatMaxHp(target.baseStats) * 100 > condition.pct;
        case 'targetMarkAtLeast': return (target.marks[condition.mark] ?? 0) >= condition.stacks;
        case 'targetHasShield': return target.shields.some(s => s.expiresAt > now && s.capacity > 0);
        case 'selfHasStatus': return self.statuses.some(s => s.id === condition.statusId && s.expiresAt > now);
        case 'targetHasStatus': return target.statuses.some(s => s.id === condition.statusId && s.expiresAt > now);
        case 'selfUltimateGaugeAtLeast': return self.ultimateGaugeV117 + 1e-9 >= condition.value;
        case 'selfElementResourceAtLeast': return resourceValueV117(self, condition.resource) + 1e-9 >= condition.value;
        case 'selfDaoResourceAtLeast': return daoResourceValueV118(self, condition.resource) + 1e-9 >= condition.value;
        case 'selfDaoResourceBelow': return daoResourceValueV118(self, condition.resource) < condition.value - 1e-9;
        case 'selfDaoV2ResourceAtLeast': {
            const value = daoV2AiResourceValue(self, target, condition.resource, now);
            return typeof value === 'number' && value + 1e-9 >= condition.value;
        }
        case 'selfDaoV2ResourceBelow': {
            const value = daoV2AiResourceValue(self, target, condition.resource, now);
            return typeof value === 'number' && value < condition.value - 1e-9;
        }
        case 'bodyBloodRushPayoffReady': {
            // First Huyết–Công activation is the deliberate opener while the actor is still healthy.
            // Repeats must prove a real Chịu→Hóa cycle by banking enough Phản Thế first.
            if (bodyBloodRushActivationCount(self) <= 0)
                return true;
            const value = daoV2AiResourceValue(self, target, condition.resource ?? 'counterForce', now);
            return typeof value === 'number' && value + 1e-9 >= condition.value;
        }
        case 'targetIsBroken': return target.breakDebuffUntil > now;
        case 'targetIsNotBroken': return target.breakDebuffUntil <= now;
        case 'swordFinisherKillWindow': {
            const projection = v2ResourceProjection(self, now);
            return self.combatBuildV117?.mainDaoId === 'sword'
                && (projection.swordQi ?? 0) >= 4
                && target.breakDebuffUntil > now
                && target.hp / Math.max(1, combatMaxHp(target.baseStats)) * 100 <= 30;
        }
        case 'swordPerfectUltimateWindow': {
            const projection = v2ResourceProjection(self, now);
            return self.combatBuildV117?.mainDaoId === 'sword'
                && self.ultimateGaugeV117 + 1e-9 >= 100
                && (projection.swordQi ?? 0) >= 5
                && (projection.swordIntentV2 ?? 0) >= 20;
        }
        case 'targetIsCasting': return Boolean(target.casting || target.channeling);
        case 'selfShieldBelow': {
            const maxHp = combatMaxHp(self.baseStats);
            const shield = self.shields.filter(x => x.expiresAt > now && x.capacity > 0).reduce((sum, x) => sum + x.capacity, 0);
            return shield / Math.max(1, maxHp) * 100 < condition.pct;
        }
    }
}
function activeSpiritCostMultiplier(self, registry, now) {
    let multiplier = 1;
    for (const active of self.statuses) {
        if (active.expiresAt <= now)
            continue;
        multiplier *= registry.status(active.id).spiritCostMultiplier ?? 1;
    }
    return multiplier;
}
export function canUseSkill(self, skill, registry, now) {
    if (!self.alive)
        return false;
    if ((self.cooldownUntil[skill.id] ?? 0) > now)
        return false;
    if (skill.id === BODY_BLOOD_RUSH_SKILL_ID_V1 && self.combatBuildV117?.mainDaoId === 'body') {
        const hpPct = self.hp / Math.max(1, combatMaxHp(self.baseStats)) * 100;
        if (hpPct + 1e-9 < BODY_BLOOD_RUSH_MIN_HP_PCT_V1)
            return false;
    }
    const stats = effectiveStats(self, registry, now);
    const cost = skillTrueEssenceCost(skill, stats, activeSpiritCostMultiplier(self, registry, now) * skillSpiritCostMultiplierFromRuntimeV117(self, skill, now) * daoSpiritCostMultiplierV118(self, skill));
    if (self.spirit + 1e-9 < cost)
        return false;
    if (!canUseSkillRuntimeV117(self, skill, now))
        return false;
    if (!canUseBattleDaoSkillV118(self, skill, now))
        return false;
    for (const active of self.statuses) {
        if (active.expiresAt <= now)
            continue;
        const status = registry.status(active.id);
        if (status.disablesActions)
            return false;
        if (status.disablesTaggedSkills?.some(tag => skill.tags.includes(tag)))
            return false;
    }
    return true;
}
function autoFallbackAllows(self, skill, target, now) {
    if(self.combatBuildV117?.battleDaoV2Enabled && skill.id.startsWith('skill.dao.artifact.'))return artifactAutoWindow(self,target,skill.id.split('.').at(-1),now);
    if (self.combatBuildV117?.battleDaoV2Enabled && skill.id.startsWith('skill.dao.formation.')) return skill.id.endsWith('.basic');
    if (self.combatBuildV117?.battleDaoV2Enabled && skill.id.startsWith('skill.dao.poison.')) return poisonAutoWindow(self,target,skill.id.split('.').at(-1),now);
    // M1: these Mind actions are tactical target-mark spenders. Their explicit
    // rotation rules own eligibility; generic cooldown fallback must not fire
    // them at zero Thần Ấn and bypass the resource contract.
    if ((skill.id === 'skill.dao.mind.interfere' || skill.id === 'skill.dao.mind.burst')
        && (target.marks['Thần Ấn'] ?? 0) < 1)
        return false;
    if (bodyBloodRushSuppressesRoutineDefense(self, skill, now))
        return false;
    if (skill.id === BODY_BLOOD_RUSH_SKILL_ID_V1 && self.combatBuildV117?.mainDaoId === 'body') {
        const hpPct = self.hp / Math.max(1, combatMaxHp(self.baseStats)) * 100;
        const projection = v2ResourceProjection(self, now);
        const minCounterForce = bodyDaoAutoCounterForceMinV1(self.aiProfile);
        const repeatNeedsForce = bodyBloodRushActivationCount(self) > 0;
        if (hpPct + 1e-9 < bodyBloodRushAutoMinHpPct(self)
            || projection.bodyBloodRushActive
            || (repeatNeedsForce && (Number(projection.counterForce) || 0) + 1e-9 < minCounterForce))
            return false;
    }
    return true;
}
export function chooseSkill(self, target, registry, now) {
    const rules = [...self.aiProfile.rules].sort((a, b) => b.priority - a.priority);
    const swordMain = self.combatBuildV117?.mainDaoId === 'sword';
    const fistMain = self.combatBuildV117?.mainDaoId === 'fist';
    const bodyMain = self.combatBuildV117?.mainDaoId === 'body';
    const projection = swordMain || fistMain ? v2ResourceProjection(self, now) : {};
    const swordGaugeReady = swordMain && self.ultimateGaugeV117 + 1e-9 >= 100;
    const swordPerfectUltimate = swordGaugeReady && (projection.swordQi ?? 0) >= 5 && (projection.swordIntentV2 ?? 0) >= 20;
    if (!swordGaugeReady)
        delete self.pendingSetFlagsV117['swordUltimateHoldUntil'];
    else if ((self.pendingSetFlagsV117['swordUltimateHoldUntil'] ?? 0) <= 0)
        self.pendingSetFlagsV117['swordUltimateHoldUntil'] = now + 4;
    const fistUltimateEligible = fistMain && self.ultimateGaugeV117 + 1e-9 >= 100 && (projection.fistForce ?? 0) >= 4;
    const fistPerfectUltimate = fistUltimateEligible && (projection.fistForce ?? 0) >= 5;
    if (!fistUltimateEligible)
        delete self.pendingSetFlagsV117['fistUltimateHoldUntil'];
    else if ((self.pendingSetFlagsV117['fistUltimateHoldUntil'] ?? 0) <= 0)
        self.pendingSetFlagsV117['fistUltimateHoldUntil'] = now + 3;
    for (const rule of rules) {
        if (rule.conditions.length > 2)
            throw new Error(`${self.aiProfile.name}/${rule.skillId}: AI V1 chỉ cho tối đa 2 điều kiện AND.`);
        const skill = registry.skill(rule.skillId);
        if (!self.skillIds.includes(skill.id))
            continue;
        if (swordMain && skill.id === 'skill.dao.sword.ultimate' && swordGaugeReady && !swordPerfectUltimate && now + 1e-9 < (self.pendingSetFlagsV117['swordUltimateHoldUntil'] ?? now))
            continue;
        if (fistMain && skill.id === 'skill.dao.fist.ultimate' && fistUltimateEligible && !fistPerfectUltimate && now + 1e-9 < (self.pendingSetFlagsV117['fistUltimateHoldUntil'] ?? now))
            continue;
        if (bodyMain && bodyBloodRushSuppressesRoutineDefense(self, skill, now))
            continue;
        if (!canUseSkill(self, skill, registry, now))
            continue;
        if (rule.conditions.every(c => checkCondition(c, self, target, now)))
            return skill;
    }
    // Counter actions are tactical-only. Mind mark-spenders and Body Huyết–Công
    // are also protected from generic zero-context fallback when their contract is not met.
    return self.skillIds
        .map(id => registry.skill(id))
        .filter(s => skillRuntimeV117(s).form !== 'counter')
        .filter(s => autoFallbackAllows(self, s, target, now))
        .filter(s => canUseSkill(self, s, registry, now))
        .sort((a, b) => a.cooldown - b.cooldown)[0];
}
//# sourceMappingURL=ai.js.map
