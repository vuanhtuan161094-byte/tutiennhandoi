import { COMBAT_RULES, combatMaxHp, combatSpiritStandard, combineBoundedPct, cooldownProfile, critProfile, heartProfile } from './combat-rules.js';
import { skillPracticeProfileFromTierV125 } from './specialization-skill-progression-v125.js';
import { battleDaoSkillGrowthProfileV126 } from './battle-dao-skill-growth-v126.js';
import { tacticalIdentity } from './combat-roles.js';
import { SeededRng } from './rng.js';
import { elementSealDamageCoefficientV133 } from './element-seal-v133.js';
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const safe = (v, floor = 1e-9) => Math.max(floor, Number.isFinite(v) ? v : floor);
const log10 = (v) => Math.log10(safe(v));
const pow10Clamped = (x) => 10 ** clamp(x, -12, 12);
function expectedCritMultiplier(entity) {
    const s = entity.stats;
    const crit = critProfile(s);
    const expectedCritLayers = crit.guaranteedLayers + crit.nextLayerChancePct / 100;
    const critBonus = expectedCritLayers * Math.max(0, crit.damagePctPerLayer - 100) / 100;
    const heart = heartProfile(s);
    const heartBonus = heart.chancePct / 100 * Math.max(0, heart.damagePct - 100) / 100;
    // V129 parity: Crit may exceed 100% as real layers. Hội Tâm is a separate direct-% bonus layer.
    // Expected value mirrors CombatKernel's additive bonus portions instead of reintroducing a hidden 90% cap.
    return Math.max(1, 1 + critBonus + heartBonus);
}
function conditionFactor(skillId, entity) {
    const rules = entity.aiProfile.rules.filter(r => r.skillId === skillId);
    if (!rules.length)
        return 1;
    let best = 0;
    for (const rule of rules) {
        let factor = 1;
        for (const c of rule.conditions) {
            if (c.type === 'always')
                continue;
            if (c.type === 'selfHpBelow' || c.type === 'selfShieldBelow')
                factor *= .42;
            else if (c.type === 'selfSpiritBelow')
                factor *= .35;
            else if (c.type === 'targetHpBelow')
                factor *= clamp((100 - c.pct) / 100 + .18, .28, .82);
            else if (c.type === 'targetHpAbove')
                factor *= clamp(c.pct / 100 + .12, .35, .95);
            else if (c.type === 'targetIsCasting' || c.type === 'targetHasShield' || c.type === 'targetIsBroken')
                factor *= .42;
            else if (c.type === 'selfUltimateGaugeAtLeast')
                factor *= .20;
            else
                factor *= .58; // marks, Dao/Element resources, status windows
        }
        best = Math.max(best, factor);
    }
    return clamp(best, .12, 1);
}
function skillTotals(skill, entity) {
    const maxHp = combatMaxHp(entity.stats), attack = safe(entity.stats.attack), standard = combatSpiritStandard(entity.stats);
    const tier = entity.combatBuildV117?.skillPracticeTierV125?.[skill.id] ?? 0;
    const practice = skillPracticeProfileFromTierV125(tier);
    const growth = battleDaoSkillGrowthProfileV126(skill, tier);
    const effectMult = 1 + (practice.effectBonusPct + (growth?.effectBonusPct ?? 0)) / 100;
    let damageCoeff = 0, heal = 0, shield = 0, breakPct = 0, control = 0;
    const scan = (effects, channelHits = 1) => {
        for (const e of effects) {
            if (e.type === 'damage') {
                damageCoeff += (Math.max(0, e.coefficient ?? 0) + Math.max(0, e.targetMaxHpAttackCapCoefficient ?? 0)) * channelHits;
                breakPct += Math.max(0, e.breakDamagePct ?? e.stabilityDamage ?? 0) * channelHits;
            }
            else if (e.type === 'damageOverTime') {
                damageCoeff += Math.max(0, e.coefficientPerTick ?? 0) * Math.max(0, e.ticks ?? 0) * .88;
                breakPct += Math.max(0, e.breakDamagePctPerTick ?? e.stabilityDamagePerTick ?? 0) * Math.max(0, e.ticks ?? 0);
            }
            else if (e.type === 'drain') {
                damageCoeff += Math.max(0, e.coefficient ?? 0);
                heal += attack * Math.max(0, e.coefficient ?? 0) * Math.max(0, e.healRatio ?? 0);
                breakPct += Math.max(0, e.breakDamagePct ?? e.stabilityDamage ?? 0);
            }
            else if (e.type === 'consumeMarkDamage') {
                damageCoeff += Math.max(0, e.baseCoefficient ?? 0) + Math.max(0, e.coefficientPerStack ?? 0) * Math.max(0, e.maxConsume ?? 0) * .55;
                breakPct += Math.max(0, e.breakDamagePctPerStack ?? e.stabilityDamagePerStack ?? 0) * Math.max(0, e.maxConsume ?? 0) * .55;
            }
            else if (e.type === 'heal' && (e.target ?? 'self') === 'self') {
                heal += Math.max(0, e.flat ?? 0) + maxHp * Math.max(0, e.maxHpPct ?? 0) / 100 + attack * Math.max(0, e.attackCoefficient ?? 0);
            }
            else if (e.type === 'shield') {
                shield += Math.max(0, e.capacity ?? 0) + maxHp * Math.max(0, e.maxHpPct ?? 0) / 100 + attack * Math.max(0, e.attackCoefficient ?? 0);
            }
            else if (e.type === 'applyStatus' && (e.target ?? 'target') === 'target')
                control += 1;
        }
    };
    scan(skill.effects);
    if (skill.channel)
        scan(skill.channel.effects, Math.max(1, skill.channel.baseHits ?? 1));
    if (damageCoeff > 0) {
        const elemental = { ...(skill.elementalCoefficients ?? {}) };
        const seal = elementSealDamageCoefficientV133(entity, skill);
        if (seal)
            elemental[seal.element] = (elemental[seal.element] ?? 0) + seal.coefficient;
        for (const [element, coefficient] of Object.entries(elemental)) {
            const affinity = entity.stats.elementalAffinities?.[element];
            damageCoeff += Math.max(0, coefficient ?? 0) * Math.max(0, Math.min(100, affinity?.pct ?? 0)) / 100 * Math.max(0, affinity?.evolutionMultiplier ?? 1);
        }
    }
    damageCoeff *= effectMult;
    heal *= effectMult;
    shield *= effectMult;
    // V145: Linh Căn no longer modifies authored elemental skill packages.
    const cdrSources = [entity.stats.cooldownReductionBySkillPct?.[skill.id] ?? 0, practice.cooldownReductionPct, growth?.cooldownReductionPct ?? 0, ...skill.tags.map(t => entity.stats.cooldownReductionByTagPct?.[t] ?? 0)];
    let effectiveCdr = 0;
    for (const source of cdrSources)
        effectiveCdr = combineBoundedPct(effectiveCdr, source, COMBAT_RULES.cooldownNormalCapPct);
    const cd = cooldownProfile(skill, effectiveCdr, 0, false).actualCooldown;
    const speed = clamp(entity.stats.actionSpeed ?? 1, .25, 3);
    const cast = Math.max(.05, skill.castTime * (1 - (growth?.castTimeReductionPct ?? 0) / 100) / speed);
    const recovery = Math.max(.05, (skill.recoveryTime ?? .2) * (1 - (growth?.recoveryReductionPct ?? 0) / 100) / speed);
    const cycleBase = Math.max(.35, cd, cast + recovery, skill.channel?.duration ?? 0);
    const cycle = Math.max(.25, cycleBase);
    const authored = skill.spiritCostStandardPct !== undefined ? standard * skill.spiritCostStandardPct / 100 : skill.spiritCost;
    const baseEfficiency = clamp(entity.stats.spiritEfficiencyPct ?? 0, 0, COMBAT_RULES.spiritEfficiencyCapPct);
    const practiceMultiplier = 1 - clamp(practice.spiritCostReductionPct, 0, 95) / 100;
    const growthMultiplier = 1 - clamp(growth?.spiritCostReductionPct ?? 0, 0, 95) / 100;
    const cost = Math.max(0, authored * (1 - baseEfficiency / 100) * practiceMultiplier * growthMultiplier);
    return { damageCoeff, heal, shield, breakPct, control, cost, cycle, gate: conditionFactor(skill.id, entity) };
}
export function buildHuntCombatProfileV130(entity, registry) {
    const maxHp = combatMaxHp(entity.stats), attack = safe(entity.stats.attack), defense = safe(entity.stats.defense);
    const rules = [...entity.aiProfile.rules].sort((a, b) => b.priority - a.priority);
    const orderedIds = [...new Set([...rules.map(r => r.skillId), ...entity.skillIds])].filter(id => registry.skills.has(id));
    const basic = orderedIds.find(id => id === 'skill.basic_strike') ?? entity.skillIds.find(id => id === 'skill.basic_strike');
    const standard = combatSpiritStandard(entity.stats);
    const regenPerSecond = standard * Math.max(0, entity.stats.spiritRegenStandardPctPerSecond ?? 0) / 100;
    const startingSpirit = Math.max(0, entity.stats.maxSpirit);
    const horizon = 60;
    let desiredActions = 0, damageCoeff = 0, healPerSecond = 0, shieldPerSecond = 0, breakPressure = 0, controlPressure = 0, spiritDemand = 0;
    for (const id of orderedIds) {
        const skill = registry.skill(id);
        if (id === basic)
            continue;
        const t = skillTotals(skill, entity);
        const rate = t.gate / t.cycle;
        desiredActions += rate;
        damageCoeff += t.damageCoeff * rate;
        healPerSecond += t.heal * rate;
        shieldPerSecond += t.shield * rate;
        breakPressure += t.breakPct * rate;
        controlPressure += t.control * rate;
        spiritDemand += t.cost * rate;
    }
    const speed = clamp(entity.stats.actionSpeed ?? 1, .25, 3);
    const actionBudget = Math.max(.45, .92 * speed); // decisions/second after cast/recovery occupancy
    const actionScale = desiredActions > actionBudget ? actionBudget / desiredActions : 1;
    damageCoeff *= actionScale;
    healPerSecond *= actionScale;
    shieldPerSecond *= actionScale;
    breakPressure *= actionScale;
    controlPressure *= actionScale;
    spiritDemand *= actionScale;
    const availableSpiritPerSecond = regenPerSecond + startingSpirit / horizon;
    const spiritSustain = spiritDemand <= 1e-9 ? 1 : clamp(availableSpiritPerSecond / spiritDemand, .25, 1);
    // Only paid skills are throttled by CN. Basic fills the freed action budget.
    damageCoeff *= spiritSustain;
    healPerSecond *= spiritSustain;
    shieldPerSecond *= spiritSustain;
    breakPressure *= spiritSustain;
    controlPressure *= spiritSustain;
    const usedRate = desiredActions * actionScale * spiritSustain;
    const basicSkill = basic && registry.skills.has(basic) ? registry.skill(basic) : undefined;
    const basicCoeff = basicSkill ? skillTotals(basicSkill, entity).damageCoeff : 1.05;
    damageCoeff += Math.max(0, actionBudget - usedRate) * basicCoeff;
    damageCoeff *= expectedCritMultiplier(entity);
    const roles = new Set();
    for (const id of orderedIds) {
        const skill = registry.skill(id);
        for (const r of tacticalIdentity(skill, registry).roles)
            roles.add(r);
    }
    if (roles.has('Break'))
        breakPressure *= 1.12;
    if (roles.has('Control') || roles.has('Interrupt'))
        controlPressure += .2;
    return {
        maxHp, attack, defense,
        armorPenPct: clamp(entity.stats.armorPenPct ?? 0, 0, 100),
        damageReductionPct: clamp(entity.stats.damageReductionPct ?? 0, 0, 80),
        dodgePct: clamp(entity.stats.dodgeChancePct ?? 0, 0, 100),
        actionSpeed: speed, damageCoeffPerSecond: Math.max(.1, damageCoeff),
        healPerSecond: Math.max(0, healPerSecond) * (1 + Math.max(-90, entity.stats.healingEffectivenessPct ?? 0) / 100),
        shieldPerSecond: Math.max(0, shieldPerSecond), lifeStealPct: clamp(entity.stats.lifeStealPct ?? 0, 0, 60),
        breakPressure: Math.max(0, breakPressure), controlPressure: Math.max(0, controlPressure), spiritSustain,
    };
}
function defenseFactorLog(attackerAttackLog, targetDefenseLog, armorPenPct) {
    const pen = clamp(armorPenPct, 0, 100);
    if (pen >= 100 - 1e-9)
        return 1;
    const effectiveDefLog = targetDefenseLog + Math.log10(Math.max(1e-9, 1 - pen / 100));
    const defToAtk = pow10Clamped(effectiveDefLog - attackerAttackLog);
    return 1 / (1 + defToAtk);
}
function monsterAttackRate(monster) {
    let rate = monster.grade === 'boss' ? .82 : monster.grade === 'elite' ? .72 : monster.grade === 'enhanced' ? .62 : .55;
    if (monster.tags.includes('Speed'))
        rate *= 1.18;
    if (monster.tags.includes('Control'))
        rate *= .94;
    if (monster.tags.includes('BossLike'))
        rate *= 1.05;
    return rate;
}
function timeoutFor(monster) {
    return monster.grade === 'boss' ? 180 : monster.grade === 'elite' ? 90 : monster.grade === 'enhanced' ? 60 : 40;
}
/**
 * v1.30 Săn Yêu resolver: winner is derived only from an HP race.
 * Chiến Lực/log-power may scale monster stats and provide telemetry, but it never declares victory.
 */
export function resolveHuntRealCombatV130(input) {
    const { registry, player, monster } = input;
    const profile = buildHuntCombatProfileV130(player, registry);
    const rng = new SeededRng(input.seed >>> 0);
    const statMult = Math.max(.05, input.enemyStatMultiplier);
    let enemyHpLog = monster.hpLog10 + Math.log10(statMult), enemyAttackLog = monster.attackLog10 + Math.log10(statMult), enemyDefenseLog = monster.defenseLog10 + Math.log10(statMult);
    const playerAttackLog = log10(profile.attack), playerDefenseLog = log10(profile.defense), playerHpLog = log10(profile.maxHp);
    const diagnosis = [];
    // Archetype is a real combat bias, not a pre-decided result.
    let enemyOutgoingMult = .96 + rng.next() * .08, playerOutgoingMult = .98 + rng.next() * .04, enemyRegenPctPerSecond = 0;
    if (monster.tags.includes('Poison'))
        enemyOutgoingMult *= 1.08;
    if (monster.tags.includes('Defense'))
        enemyDefenseLog += Math.log10(1.08);
    if (monster.tags.includes('Element'))
        enemyOutgoingMult *= 1.06;
    if (monster.tags.includes('Control'))
        playerOutgoingMult *= .94;
    if (monster.grade === 'boss' && input.bossMechanic) {
        const m = input.bossMechanic;
        const severity = m.verdict === 'none' ? 1 : m.verdict === 'partial' ? .55 : .20;
        if (m.element === 'Wood') {
            enemyRegenPctPerSecond = .0065 * severity;
            diagnosis.push(`Vạn Mộc Hồi Sinh: Boss hồi ${(enemyRegenPctPerSecond * 100).toFixed(2)}% HP/s.`);
        }
        else if (m.element === 'Fire') {
            enemyOutgoingMult *= 1 + .28 * severity;
            diagnosis.push('Phần Mạch Bạo Viêm: áp lực sát thương Boss tăng theo mức thiếu đối sách.');
        }
        else if (m.element === 'Earth') {
            enemyDefenseLog += Math.log10(1 + .34 * severity);
            diagnosis.push('Trấn Sơn Hộ Thế: Phòng Ngự Boss tăng theo mức thiếu Phá Thế.');
        }
        else if (m.element === 'Metal') {
            enemyDefenseLog += Math.log10(1 + .18 * severity);
            enemyOutgoingMult *= 1 + .16 * severity;
            diagnosis.push('Bất Hoại Phong Mang: Boss vừa cứng vừa tăng phản áp lực.');
        }
        else if (m.element === 'Water') {
            playerOutgoingMult *= 1 - .22 * severity;
            diagnosis.push('Triều Tức Nhiễu Pháp: nhịp gây sát thương của người chơi bị kéo lệch.');
        }
    }
    // Phá Thế becomes average defense exposure. Bosses only receive half ordinary break pressure.
    const breakEffect = clamp(profile.breakPressure / 110, 0, monster.grade === 'boss' ? .15 : .28);
    enemyDefenseLog += Math.log10(1 - breakEffect);
    if (breakEffect > .01)
        diagnosis.push(`Phá Thế duy trì làm giảm hiệu dụng Phòng Ngự mục tiêu ~${(breakEffect * 100).toFixed(0)}%.`);
    // Control/interrupt lowers incoming action throughput; hard-capped so it cannot create permanent immunity.
    const controlSuppression = clamp(profile.controlPressure * .055, 0, monster.grade === 'boss' ? .12 : .22);
    enemyOutgoingMult *= 1 - controlSuppression;
    const playerDefenseFactor = defenseFactorLog(playerAttackLog, enemyDefenseLog, profile.armorPenPct);
    const playerDpsLog = playerAttackLog + Math.log10(profile.damageCoeffPerSecond * playerDefenseFactor * playerOutgoingMult);
    const enemyDefenseFactor = defenseFactorLog(enemyAttackLog, playerDefenseLog, 0);
    const incomingAvoid = (1 - profile.damageReductionPct / 100) * (1 - profile.dodgePct / 100 * .72); // deterministic expected dodge; never full immunity
    const enemyDpsLog = enemyAttackLog + Math.log10(monsterAttackRate(monster) * enemyDefenseFactor * enemyOutgoingMult * Math.max(.05, incomingAvoid));
    const playerDps = 10 ** clamp(playerDpsLog, -300, 300), enemyDps = 10 ** clamp(enemyDpsLog, -300, 300);
    const enemyHp = 10 ** clamp(enemyHpLog, -300, 300), playerHp = 10 ** clamp(playerHpLog, -300, 300);
    const playerSustain = Math.max(0, profile.healPerSecond + profile.shieldPerSecond + playerDps * profile.lifeStealPct / 100 * .65);
    const netIncoming = Math.max(0, enemyDps - playerSustain);
    const enemyRegen = enemyHp * enemyRegenPctPerSecond;
    const netOutgoing = Math.max(0, playerDps - enemyRegen);
    const playerTimeToKill = netOutgoing > 1e-12 ? enemyHp / netOutgoing : Number.POSITIVE_INFINITY;
    const enemyTimeToKill = netIncoming > 1e-12 ? playerHp / netIncoming : Number.POSITIVE_INFINITY;
    const timeoutSeconds = timeoutFor(monster);
    let outcome, battleSeconds;
    if (playerTimeToKill <= enemyTimeToKill && playerTimeToKill <= timeoutSeconds) {
        outcome = 'victory';
        battleSeconds = Math.max(.5, playerTimeToKill);
    }
    else if (enemyTimeToKill < playerTimeToKill && enemyTimeToKill <= timeoutSeconds) {
        outcome = 'defeat';
        battleSeconds = Math.max(.5, enemyTimeToKill);
    }
    else {
        outcome = 'timeout';
        battleSeconds = timeoutSeconds;
    }
    const won = outcome === 'victory';
    const enemyDamageTaken = Math.min(enemyHp, netOutgoing * battleSeconds), playerDamageTaken = Math.min(playerHp, netIncoming * battleSeconds);
    const enemyHpRemainingPct = clamp((enemyHp - enemyDamageTaken) / enemyHp * 100, 0, 100), playerHpRemainingPct = clamp((playerHp - playerDamageTaken) / playerHp * 100, 0, 100);
    if (outcome === 'timeout')
        diagnosis.push('Hết giới hạn giao tranh khi cả hai bên vẫn còn HP: tính là không vượt ải, không có thưởng thắng.');
    if (profile.spiritSustain < .75)
        diagnosis.push(`Chân Nguyên chỉ đáp ứng ~${(profile.spiritSustain * 100).toFixed(0)}% nhu cầu rotation dài.`);
    return {
        outcome, won, battleSeconds, playerHpRemainingPct, enemyHpRemainingPct,
        playerDamageLog10: enemyDamageTaken > 0 ? Math.log10(enemyDamageTaken) : -Infinity,
        enemyDamageLog10: playerDamageTaken > 0 ? Math.log10(playerDamageTaken) : -Infinity,
        playerDpsLog10: playerDpsLog, enemyDpsLog10: enemyDpsLog, enemyHpLog10: enemyHpLog, playerHpLog10: playerHpLog,
        playerTimeToKill, enemyTimeToKill, timeoutSeconds, breakPressurePctPerSecond: profile.breakPressure, diagnosis,
    };
}
//# sourceMappingURL=hunt-real-combat-v130.js.map