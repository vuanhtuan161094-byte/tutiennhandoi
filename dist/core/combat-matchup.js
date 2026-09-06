import { buildTacticalLoadoutPresets, tacticalLoadoutStyleName } from './combat-loadout-presets.js';
const SIGNAL_LABELS = {
    evasive: 'truy kích/né cao',
    shielding: 'phá khiên',
    healing: 'anti-heal',
    control: 'chống khống chế',
    burst: 'sống qua burst',
    multiHit: 'chịu chuỗi multi-hit',
};
const SIGNAL_WEIGHTS = {
    evasive: 1.2,
    shielding: 1.35,
    healing: 1.55,
    control: 1.25,
    burst: 1,
    multiHit: 0.85,
};
function skillEffects(entity, registry) {
    return entity.skillIds.map(id => registry.skill(id));
}
function triggerHasEffect(triggers, type) {
    return Boolean(triggers?.some(trigger => trigger.effects.some(effect => effect.type === type)));
}
function phaseHasEffect(entity, type) {
    return Boolean(entity.phases?.some(phase => phase.onEnterEffects?.some(effect => effect.type === type)));
}
function appliesControl(skill, registry) {
    return skill.effects.some(effect => effect.type === 'applyStatus' && ['BodyControl', 'SpiritControl'].includes(registry.status(effect.statusId).group));
}
function appliesAntiHeal(skill, registry) {
    return skill.effects.some(effect => effect.type === 'applyStatus' && (registry.status(effect.statusId).healingReceivedMultiplier ?? 1) < 0.8);
}
function grantsStatBuff(skill, registry, key) {
    return skill.effects.some(effect => effect.type === 'applyStatus' && effect.target === 'self' && (registry.status(effect.statusId)[key] ?? 1) > 1.05);
}
function phaseGrantsStatBuff(entity, registry, key) {
    return Boolean(entity.phases?.some(phase => phase.onEnterEffects?.some(effect => effect.type === 'applyStatus' && effect.target === 'self' && (registry.status(effect.statusId)[key] ?? 1) > 1.05)));
}
function stabilityDamage(skill) {
    return skill.effects.reduce((sum, effect) => {
        if (effect.type === 'damage' || effect.type === 'drain')
            return sum + (effect.stabilityDamage ?? 0);
        if (effect.type === 'damageOverTime')
            return sum + (effect.stabilityDamagePerTick ?? 0) * effect.ticks;
        if (effect.type === 'consumeMarkDamage')
            return sum + (effect.stabilityDamagePerStack ?? 0) * effect.maxConsume;
        return sum;
    }, 0);
}
function damageHits(skill) {
    return skill.effects.filter(effect => ['damage', 'drain', 'consumeMarkDamage'].includes(effect.type)).length;
}
export function detectMatchupSignals(player, enemy, registry) {
    const skills = skillEffects(enemy, registry);
    const shielding = skills.some(skill => skill.effects.some(effect => effect.type === 'shield')) || phaseHasEffect(enemy, 'shield');
    const healing = skills.some(skill => skill.effects.some(effect => effect.type === 'heal' || effect.type === 'drain'));
    const control = skills.some(skill => appliesControl(skill, registry));
    const multiHit = skills.some(skill => skill.tags.includes('MultiHit') || damageHits(skill) >= 3);
    const burst = enemy.stats.critChancePct >= 80
        || skills.some(skill => skill.tags.includes('Heavy') || skill.tags.includes('Burst') || grantsStatBuff(skill, registry, 'attackMultiplier'))
        || phaseGrantsStatBuff(enemy, registry, 'attackMultiplier');
    const movementBuff = skills.some(skill => grantsStatBuff(skill, registry, 'mobilityMultiplier') || grantsStatBuff(skill, registry, 'actionSpeedMultiplier'))
        || phaseGrantsStatBuff(enemy, registry, 'mobilityMultiplier')
        || phaseGrantsStatBuff(enemy, registry, 'actionSpeedMultiplier');
    const evasive = enemy.tags.includes('BossMechanic:predator') || enemy.stats.mobility > player.stats.accuracy * 1.06 || movementBuff;
    return { evasive, shielding, healing, control, burst, multiHit };
}
function skillCounterStrength(skill, signal, registry) {
    if (signal === 'evasive') {
        if (skill.effects.some(effect => effect.type === 'damage' && effect.canDodge === false))
            return 1;
        if (skill.tags.includes('Movement') || grantsStatBuff(skill, registry, 'accuracyMultiplier') || grantsStatBuff(skill, registry, 'mobilityMultiplier'))
            return 0.9;
        if (skill.tags.includes('MultiHit') || damageHits(skill) >= 3)
            return 0.8;
        if (skill.castTime <= 0.5 && skill.cooldown <= 2.8)
            return 0.55;
        return 0;
    }
    if (signal === 'shielding') {
        const stability = stabilityDamage(skill);
        if (stability >= 100)
            return 1;
        if (stability >= 60)
            return 0.85;
        if (stability >= 45 || skill.tags.includes('Heavy'))
            return 0.7;
        return 0;
    }
    if (signal === 'healing')
        return appliesAntiHeal(skill, registry) ? 1 : 0;
    if (signal === 'control') {
        if (skill.effects.some(effect => effect.type === 'removeStatus'))
            return 1;
        if (grantsStatBuff(skill, registry, 'resolveMultiplier'))
            return 0.9;
        if (skill.tags.includes('Shield') || skill.effects.some(effect => effect.type === 'shield'))
            return 0.35;
        return 0;
    }
    if (signal === 'burst' || signal === 'multiHit') {
        if (skill.tags.includes('Shield') || skill.effects.some(effect => effect.type === 'shield'))
            return 1;
        if (skill.tags.includes('Heal') || skill.effects.some(effect => effect.type === 'heal'))
            return 0.85;
        if (skill.effects.some(effect => effect.type === 'drain'))
            return 0.6;
        return 0;
    }
    return 0;
}
function loadoutCoverage(skillIds, signals, registry) {
    const active = Object.keys(signals).filter(key => signals[key]);
    if (active.length === 0)
        return { scorePct: 100, covered: [], missing: [] };
    const skills = [...new Set(skillIds)].map(id => registry.skill(id));
    let weighted = 0;
    let total = 0;
    const covered = [];
    const missing = [];
    for (const signal of active) {
        const best = skills.reduce((max, skill) => Math.max(max, skillCounterStrength(skill, signal, registry)), 0);
        const weight = SIGNAL_WEIGHTS[signal];
        weighted += best * weight;
        total += weight;
        if (best >= 0.6)
            covered.push(SIGNAL_LABELS[signal]);
        else
            missing.push(SIGNAL_LABELS[signal]);
    }
    return { scorePct: Math.round(weighted / Math.max(0.001, total) * 100), covered, missing };
}
function genericPresetScores(signals) {
    return {
        balanced: 1,
        pursuit: (signals.evasive ? 12 : 0) + (signals.multiHit ? 4 : 0),
        breaker: (signals.shielding ? 13 : 0) + (signals.burst ? 2 : 0),
        disruption: (signals.healing ? 13 : 0) + (signals.control ? 9 : 0),
        survival: (signals.burst ? 8 : 0) + (signals.multiHit ? 5 : 0) + (signals.control ? 2 : 0),
    };
}
function presetReason(style, signals, coveragePct) {
    const reasons = [];
    if (style === 'pursuit') {
        if (signals.evasive)
            reasons.push('đối thủ né/cướp nhịp cao');
        if (signals.multiHit)
            reasons.push('đấu nhịp multi-hit');
    }
    else if (style === 'breaker') {
        if (signals.shielding)
            reasons.push('cần Heavy/Stability phá khiên');
        if (signals.burst)
            reasons.push('nên rút ngắn phase nguy hiểm');
    }
    else if (style === 'disruption') {
        if (signals.healing)
            reasons.push('anti-heal cắt vòng hồi phục');
        if (signals.control)
            reasons.push('debuff/cleanse giữ rotation');
    }
    else if (style === 'survival') {
        if (signals.burst)
            reasons.push('cần sống qua burst');
        if (signals.multiHit)
            reasons.push('Shield/Heal hấp thụ chuỗi hit');
        if (signals.control)
            reasons.push('ưu tiên ổn định khi bị khóa nhịp');
    }
    else
        reasons.push('chưa có cơ chế nào đủ áp đảo để buộc chuyên hóa');
    if (coveragePct < 55)
        reasons.push('skill hiện biết chưa phủ đủ hard-counter');
    return reasons.join('; ');
}
function recommendPreset(signals, knownSkillIds, registry) {
    const generic = genericPresetScores(signals);
    const presets = buildTacticalLoadoutPresets(knownSkillIds, registry);
    if (presets.length === 0) {
        return { style: 'balanced', name: tacticalLoadoutStyleName('balanced'), score: 1, coveragePct: 0, reason: 'chưa có skill để dựng preset.' };
    }
    const candidates = presets.map(preset => {
        const coverage = loadoutCoverage(preset.skillIds, signals, registry);
        const score = generic[preset.style] + coverage.scorePct / 20;
        return { preset, coverage, score };
    }).sort((a, b) => b.score - a.score || b.coverage.scorePct - a.coverage.scorePct || a.preset.id.localeCompare(b.preset.id));
    const best = candidates[0];
    return {
        style: best.preset.style,
        name: best.preset.name,
        score: Number(best.score.toFixed(2)),
        coveragePct: best.coverage.scorePct,
        reason: presetReason(best.preset.style, signals, best.coverage.scorePct),
    };
}
function counterWindowRequirement(phase) {
    const window = phase.counterWindow;
    if (!window)
        return undefined;
    const trigger = window.trigger;
    if (trigger.type === 'skillRole')
        return `${trigger.requiredActions ?? 1} hành động: ${trigger.roles.join('/')}`;
    if (trigger.type === 'antiHeal')
        return 'tái áp anti-heal sau khi phase mở';
    if (trigger.type === 'shieldBreak')
        return 'phá vỡ khiên trong cửa sổ';
    return undefined;
}
function phaseSkillIds(enemy, phase) {
    const rules = phase?.aiProfile?.rules ?? enemy.aiProfile.rules;
    const ids = [...new Set(rules.map(rule => rule.skillId))];
    return ids.length > 0 ? ids : enemy.skillIds;
}
function phasePlans(player, enemy, knownSkillIds, registry) {
    const plans = [];
    const p1Entity = { ...enemy, skillIds: phaseSkillIds(enemy), phases: [] };
    const p1Signals = detectMatchupSignals(player, p1Entity, registry);
    plans.push({
        id: 'phase.base', name: 'Khai Chiến', phaseIndex: 1, signals: p1Signals,
        currentLoadoutCoverage: loadoutCoverage(player.skillIds, p1Signals, registry),
        recommendedPreset: recommendPreset(p1Signals, knownSkillIds, registry),
    });
    for (const [index, phase] of (enemy.phases ?? []).entries()) {
        const phaseEntity = { ...enemy, skillIds: phaseSkillIds(enemy, phase), aiProfile: phase.aiProfile ?? enemy.aiProfile, phases: [phase] };
        const signals = detectMatchupSignals(player, phaseEntity, registry);
        const requirement = counterWindowRequirement(phase);
        plans.push({
            id: phase.id, name: phase.name, phaseIndex: index + 2, hpBelowPct: phase.hpBelowPct,
            counterWindow: phase.counterWindow && requirement ? { name: phase.counterWindow.name, duration: phase.counterWindow.duration, requirement } : undefined,
            signals,
            currentLoadoutCoverage: loadoutCoverage(player.skillIds, signals, registry),
            recommendedPreset: recommendPreset(signals, knownSkillIds, registry),
        });
    }
    return plans;
}
function skillRecommendation(skill, signals, registry) {
    let score = 0;
    const reasons = [];
    if (signals.evasive) {
        if (skill.tags.includes('MultiHit') || damageHits(skill) >= 3) {
            score += 6;
            reasons.push('multi-hit bào Dodge Pressure');
        }
        if (skill.tags.includes('Movement') || grantsStatBuff(skill, registry, 'mobilityMultiplier') || grantsStatBuff(skill, registry, 'accuracyMultiplier')) {
            score += 5;
            reasons.push('tăng nhịp truy kích/chính xác');
        }
        if (skill.castTime <= 0.5 && skill.cooldown <= 2.8) {
            score += 3;
            reasons.push('ra đòn nhanh, ít mất nhịp khi hụt');
        }
        if (skill.effects.some(effect => effect.type === 'damage' && effect.canDodge === false)) {
            score += 7;
            reasons.push('đòn không thể né');
        }
    }
    if (signals.shielding) {
        const stability = stabilityDamage(skill);
        if (stability >= 45) {
            score += 7 + Math.min(4, stability / 40);
            reasons.push(`phá ổn định khiên (${stability.toFixed(0)})`);
        }
        if (skill.tags.includes('Heavy')) {
            score += 3;
            reasons.push('Heavy hợp matchup khiên');
        }
    }
    if (signals.healing && appliesAntiHeal(skill, registry)) {
        score += 11;
        reasons.push('anti-heal cắt trực tiếp vòng hồi phục');
    }
    if (signals.control) {
        if (skill.effects.some(effect => effect.type === 'removeStatus')) {
            score += 4;
            reasons.push('có giải debuff/khống chế nhẹ');
        }
        if (grantsStatBuff(skill, registry, 'resolveMultiplier')) {
            score += 6;
            reasons.push('tăng Resolve chống khóa nhịp');
        }
        if (skill.tags.includes('Shield')) {
            score += 2;
            reasons.push('giữ máu khi bị mất lượt');
        }
    }
    if (signals.burst || signals.multiHit) {
        if (skill.tags.includes('Shield') || skill.effects.some(effect => effect.type === 'shield')) {
            score += 7;
            reasons.push('Shield hấp thụ đợt burst');
        }
        if (skill.tags.includes('Heal') || skill.effects.some(effect => effect.type === 'heal')) {
            score += 6;
            reasons.push('Heal kéo qua phase áp lực');
        }
    }
    return { score, reasons };
}
function artifactRecommendation(item, active, signals, registry) {
    const template = registry.artifactTemplate(item.templateId);
    const triggers = [...(template.triggers ?? []), ...(item.spirit.state === 'awakened' ? (template.awakenedTriggers ?? []) : [])];
    let score = 0;
    const reasons = [];
    const stat = (key) => Number(item.stats[key] ?? 0);
    if (signals.evasive) {
        if (template.tags.includes('Counter:Evasive')) {
            score += 18;
            reasons.push('hard-counter né/cướp nhịp');
        }
        const chase = stat('accuracy') * 0.45 + stat('mobility') * 0.35 + stat('actionSpeed') * 10;
        if (chase > 1) {
            score += Math.min(9, chase);
            reasons.push('bổ sung Accuracy/Mobility cho truy kích');
        }
    }
    if (signals.shielding) {
        if (template.tags.includes('Counter:Shield')) {
            score += 18;
            reasons.push('hard-counter hộ thuẫn');
        }
        if (triggers.some(trigger => trigger.event === 'OnShieldBreak')) {
            score += 12;
            reasons.push('kích phát trực tiếp khi phá khiên');
        }
        const offense = stat('attack') * 0.18 + stat('critChancePct') * 0.22;
        if (offense > 1) {
            score += Math.min(6, offense);
            reasons.push('tăng áp lực phá khiên');
        }
    }
    if (signals.control) {
        const resolve = stat('resolve') * 0.5 + stat('maxSpirit') * 0.05;
        if (resolve > 1) {
            score += Math.min(9, resolve);
            reasons.push('Resolve/Linh Lực giúp chịu khóa nhịp');
        }
    }
    if (signals.burst || signals.multiHit) {
        const tank = stat('maxHp') * 0.025 + stat('defense') * 0.45;
        if (tank > 1) {
            score += Math.min(8, tank);
            reasons.push('tăng nền sinh tồn trước burst');
        }
        if (triggerHasEffect(triggers, 'shield')) {
            score += 9;
            reasons.push('có Shield chủ động từ trigger');
        }
        if (triggerHasEffect(triggers, 'heal')) {
            score += 8;
            reasons.push('có hồi phục trong combat');
        }
    }
    if (signals.healing && template.tags.includes('Counter:Healing')) {
        score += 20;
        reasons.push('hard-counter vòng hồi phục');
    }
    if (signals.healing && triggers.some(trigger => trigger.effects.some(effect => effect.type === 'damage'))) {
        score += 1.5;
        reasons.push('thêm áp lực sát thương để rút ngắn vòng hồi phục');
    }
    return { id: item.id, name: item.name, score, active, reason: reasons.length ? reasons.slice(0, 2).join('; ') : 'không có lợi thế matchup nổi bật' };
}
export function analyzeCombatMatchup(player, enemy, knownSkillIds, artifacts, registry, limit = 3) {
    const signals = detectMatchupSignals(player, enemy, registry);
    const skillRecommendations = [...new Set(knownSkillIds)]
        .map(id => registry.skill(id))
        .map(skill => {
        const value = skillRecommendation(skill, signals, registry);
        return { id: skill.id, name: skill.name, score: value.score, active: player.skillIds.includes(skill.id), reason: value.reasons.length ? value.reasons.slice(0, 2).join('; ') : 'không có lợi thế matchup nổi bật' };
    })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score || Number(b.active) - Number(a.active) || a.id.localeCompare(b.id))
        .slice(0, limit);
    const artifactRecommendations = artifacts.items
        .map(item => artifactRecommendation(item, artifacts.activeIds.includes(item.id), signals, registry))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score || Number(b.active) - Number(a.active) || a.id.localeCompare(b.id))
        .slice(0, limit);
    return {
        signals,
        currentLoadoutCoverage: loadoutCoverage(player.skillIds, signals, registry),
        recommendedPreset: recommendPreset(signals, knownSkillIds, registry),
        phasePlans: phasePlans(player, enemy, knownSkillIds, registry),
        skillRecommendations,
        artifactRecommendations,
    };
}
//# sourceMappingURL=combat-matchup.js.map