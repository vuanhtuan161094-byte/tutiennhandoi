import { combatMaxHp, skillTrueEssenceCost } from './combat-rules.js';
import { canUseSkillRuntimeV117, resourceValueV117, skillSpiritCostMultiplierFromRuntimeV117 } from './five-element-combat-v117.js';
import { canUseBattleDaoSkillV118, daoResourceValueV118, daoSpiritCostMultiplierV118 } from './battle-dao-combat-v118.js';
import { v2ResourceProjection } from './battle-dao-v2-runtime.js';
import { effectiveStats } from './stats.js';
function daoV2AiResourceValue(self, _target, resource, now) {
    const projected = v2ResourceProjection(self, now)[resource];
    return typeof projected === 'number' ? projected : undefined;
}
function checkCondition(condition, self, target, now) {
    switch (condition.type) {
        case 'always': return true;
        case 'selfHpBelow': return self.hp / combatMaxHp(self.baseStats) * 100 < condition.pct;
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
        case 'targetIsBroken': return target.breakDebuffUntil > now;
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
    const stats = effectiveStats(self, registry, now);
    const cost = skillTrueEssenceCost(skill, stats, activeSpiritCostMultiplier(self, registry, now) * skillSpiritCostMultiplierFromRuntimeV117(self, skill, now) * daoSpiritCostMultiplierV118(self, skill));
    if (self.spirit + 1e-9 < cost)
        return false;
    if (!canUseSkillRuntimeV117(self, skill, now))
        return false;
    if (!canUseBattleDaoSkillV118(self, skill))
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
export function chooseSkill(self, target, registry, now) {
    const rules = [...self.aiProfile.rules].sort((a, b) => b.priority - a.priority);
    for (const rule of rules) {
        if (rule.conditions.length > 2)
            throw new Error(`${self.aiProfile.name}/${rule.skillId}: AI V1 chỉ cho tối đa 2 điều kiện AND.`);
        const skill = registry.skill(rule.skillId);
        if (!self.skillIds.includes(skill.id))
            continue;
        if (!canUseSkill(self, skill, registry, now))
            continue;
        if (rule.conditions.every(c => checkCondition(c, self, target, now)))
            return skill;
    }
    return self.skillIds
        .map(id => registry.skill(id))
        .filter(s => canUseSkill(self, s, registry, now))
        .sort((a, b) => a.cooldown - b.cooldown)[0];
}
//# sourceMappingURL=ai.js.map