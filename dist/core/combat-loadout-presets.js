import { tacticalIdentity } from './combat-roles.js';
function hasTag(skill, tag) {
    return skill.tags.includes(tag);
}
function hasEffect(skill, type) {
    return skill.effects.some(effect => effect.type === type);
}
function totalStabilityDamage(skill) {
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
function appliesAntiHeal(skill, registry) {
    return skill.effects.some(effect => effect.type === 'applyStatus' && (registry.status(effect.statusId).healingReceivedMultiplier ?? 1) < 0.8);
}
function appliesControl(skill, registry) {
    return skill.effects.some(effect => effect.type === 'applyStatus' && ['BodyControl', 'SpiritControl'].includes(registry.status(effect.statusId).group));
}
function scoreSkill(skill, style, registry) {
    let score = skill.id === 'skill.basic_strike' ? 3 : 8;
    const roles = tacticalIdentity(skill, registry).roles;
    const fast = skill.castTime <= 0.45;
    const multi = roles.includes('MultiHit');
    const movement = roles.includes('Chase');
    const heavy = roles.includes('Break');
    const burst = roles.includes('Burst') || roles.includes('Finisher');
    const shield = hasTag(skill, 'Shield') || hasEffect(skill, 'shield');
    const heal = hasTag(skill, 'Heal') || hasEffect(skill, 'heal') || hasEffect(skill, 'drain');
    const cleanse = hasTag(skill, 'Cleanse') || hasEffect(skill, 'removeStatus');
    const debuff = hasTag(skill, 'Debuff') || skill.effects.some(effect => effect.type === 'applyStatus');
    const mark = hasEffect(skill, 'addMark');
    const restore = hasEffect(skill, 'restoreSpirit');
    const antiHeal = roles.includes('AntiHeal') || appliesAntiHeal(skill, registry);
    const control = roles.includes('Control') || appliesControl(skill, registry);
    if (style === 'balanced') {
        if (fast)
            score += 3;
        if (shield || heal)
            score += 5;
        if (burst || mark)
            score += 4;
        if (movement || debuff)
            score += 2;
    }
    else if (style === 'pursuit') {
        if (fast)
            score += 9;
        if (multi)
            score += 11;
        if (movement)
            score += 12;
        if (mark)
            score += 4;
        if (skill.cooldown <= 2.5)
            score += 4;
        if (heavy && skill.castTime > 0.75)
            score -= 7;
        if (shield || heal)
            score -= 2;
    }
    else if (style === 'breaker') {
        if (heavy)
            score += 13;
        if (burst)
            score += 12;
        if (debuff)
            score += 7;
        if (mark)
            score += 6;
        score += Math.min(8, totalStabilityDamage(skill) / 15);
        if (shield || heal)
            score -= 2;
        if (movement && !heavy)
            score -= 2;
        if (antiHeal && !heavy)
            score -= 9;
    }
    else if (style === 'disruption') {
        if (antiHeal)
            score += 22;
        if (control)
            score += 11;
        if (cleanse)
            score += 10;
        if (debuff)
            score += 7;
        if (fast)
            score += 5;
        if (skill.cooldown <= 5)
            score += 3;
        if (heal || shield)
            score += 3;
        if (heavy && !antiHeal && !control)
            score -= 6;
    }
    else {
        if (shield)
            score += 15;
        if (heal)
            score += 13;
        if (cleanse)
            score += 9;
        if (restore)
            score += 8;
        if (movement)
            score += 5;
        if (fast)
            score += 3;
        if (skill.spiritCost <= 6)
            score += 2;
        if (burst || heavy)
            score -= 5;
    }
    return score;
}
function markConsumedBy(skill) {
    return skill.effects.find((effect) => effect.type === 'consumeMarkDamage')?.mark;
}
function generatesMark(skill, mark) {
    return skill.effects.some(effect => effect.type === 'addMark' && effect.mark === mark);
}
function chooseSkills(known, style, registry, slots = 6) {
    const ranked = [...known].sort((a, b) => scoreSkill(b, style, registry) - scoreSkill(a, style, registry) || a.id.localeCompare(b.id));
    const selected = ranked.slice(0, Math.max(1, Math.min(slots, ranked.length)));
    // A burst finisher without a way to build its mark is a fake preset. Pull one generator in.
    for (const finisher of [...selected]) {
        const mark = markConsumedBy(finisher);
        if (!mark || selected.some(skill => generatesMark(skill, mark)))
            continue;
        const generator = ranked.find(skill => generatesMark(skill, mark));
        if (!generator)
            continue;
        const replaceIndex = selected.length - 1;
        if (replaceIndex >= 0 && !selected.includes(generator))
            selected[replaceIndex] = generator;
    }
    // Keep a zero-cost fallback when the character knows one, so a specialized rotation cannot deadlock on Spirit.
    const basic = known.find(skill => skill.id === 'skill.basic_strike');
    if (basic && !selected.includes(basic)) {
        if (selected.length < slots)
            selected.push(basic);
        else
            selected[selected.length - 1] = basic;
    }
    return [...new Map(selected.map(skill => [skill.id, skill])).values()];
}
function rule(skill, priority, conditions) {
    return { skillId: skill.id, priority, conditions };
}
function buildRules(skills, style, registry) {
    const rules = [];
    for (const skill of skills) {
        if (skill.id === 'skill.basic_strike') {
            rules.push(rule(skill, 10, [{ type: 'always' }]));
            continue;
        }
        if (style === 'disruption' && appliesAntiHeal(skill, registry)) {
            rules.push(rule(skill, 148, [{ type: 'always' }]));
            continue;
        }
        if (style === 'disruption' && hasEffect(skill, 'removeStatus')) {
            rules.push(rule(skill, 142, [{ type: 'always' }]));
            continue;
        }
        if (style === 'disruption' && appliesControl(skill, registry)) {
            rules.push(rule(skill, 128, [{ type: 'always' }]));
            continue;
        }
        if (hasEffect(skill, 'restoreSpirit')) {
            rules.push(rule(skill, style === 'survival' ? 128 : 105, [{ type: 'selfSpiritBelow', pct: style === 'survival' ? 42 : 25 }]));
            continue;
        }
        if (hasTag(skill, 'Shield') || hasEffect(skill, 'shield')) {
            rules.push(rule(skill, style === 'survival' ? 140 : 112, [{ type: 'selfHpBelow', pct: style === 'survival' ? 72 : 46 }]));
            continue;
        }
        if (hasTag(skill, 'Heal') || hasEffect(skill, 'heal')) {
            rules.push(rule(skill, style === 'survival' ? 138 : 110, [{ type: 'selfHpBelow', pct: style === 'survival' ? 58 : 34 }]));
            continue;
        }
        const mark = markConsumedBy(skill);
        if (mark) {
            rules.push(rule(skill, style === 'breaker' ? 136 : 118, [{ type: 'targetMarkAtLeast', mark, stacks: style === 'breaker' ? 3 : 4 }]));
            continue;
        }
        if (hasTag(skill, 'Heavy') || totalStabilityDamage(skill) >= 45) {
            rules.push(rule(skill, style === 'breaker' ? 132 : 104, [{ type: 'targetHasShield' }]));
            rules.push(rule(skill, style === 'breaker' ? 106 : 76, [{ type: 'always' }]));
            continue;
        }
        if (hasTag(skill, 'Movement')) {
            rules.push(rule(skill, style === 'pursuit' ? 132 : 86, [{ type: 'always' }]));
            continue;
        }
        if (hasTag(skill, 'Buff')) {
            rules.push(rule(skill, style === 'survival' ? 112 : 96, [{ type: 'always' }]));
            continue;
        }
        const base = style === 'pursuit'
            ? (hasTag(skill, 'MultiHit') ? 120 : skill.castTime <= 0.45 ? 108 : 82)
            : style === 'breaker'
                ? (hasTag(skill, 'Debuff') ? 116 : hasTag(skill, 'Burst') ? 122 : 88)
                : style === 'disruption'
                    ? (hasTag(skill, 'Debuff') ? 118 : 92)
                    : style === 'survival'
                        ? 72
                        : 88;
        rules.push(rule(skill, base, [{ type: 'always' }]));
    }
    return rules.sort((a, b) => b.priority - a.priority);
}
const STYLE_META = {
    balanced: {
        id: 'preset.tactical.balanced',
        name: 'Cân Bằng',
        description: 'Giữ đủ công, thủ và tài nguyên; dùng khi chưa biết rõ matchup.',
        strengths: ['ổn định', 'không lệch tài nguyên'],
        tradeoff: 'không có hard-counter nổi bật khi boss ép một cơ chế cụ thể.',
    },
    pursuit: {
        id: 'preset.tactical.pursuit',
        name: 'Truy Kích',
        description: 'Ưu tiên kỹ năng nhanh, multi-hit và thân pháp để chống mục tiêu né cao/cướp nhịp.',
        strengths: ['truy kích', 'multi-hit', 'ra tay nhanh'],
        tradeoff: 'hy sinh bớt hồi phục/phòng thủ và đòn chậm nặng.',
    },
    breaker: {
        id: 'preset.tactical.breaker',
        name: 'Phá Trận',
        description: 'Ưu tiên Heavy, Stability Damage, Burst và debuff để phá khiên hoặc kết thúc phase nguy hiểm.',
        strengths: ['phá khiên', 'burst', 'Stability Damage'],
        tradeoff: 'rotation chậm hơn và kém an toàn nếu trận bị kéo dài.',
    },
    disruption: {
        id: 'preset.tactical.disruption',
        name: 'Đoạn Mạch',
        description: 'Ưu tiên anti-heal, khống chế, giải trạng thái và nhịp nhanh để cắt hồi phục/rotation khó chịu.',
        strengths: ['anti-heal', 'khống chế', 'cleanse'],
        tradeoff: 'ít sát thương thô nếu đối thủ không có hồi phục/khóa nhịp để cắt.',
    },
    survival: {
        id: 'preset.tactical.survival',
        name: 'Thủ Phản',
        description: 'Ưu tiên Shield/Heal/Hồi Linh và kỹ năng ổn định để sống qua burst hoặc trận kéo dài.',
        strengths: ['sinh tồn', 'hồi phục', 'duy trì Linh Lực'],
        tradeoff: 'giảm tốc độ kết liễu và khả năng tận dụng cửa sổ burst ngắn.',
    },
};
export function tacticalLoadoutStyleName(style) {
    return STYLE_META[style].name;
}
export function buildTacticalLoadoutPresets(knownSkillIds, registry) {
    const known = [...new Set(knownSkillIds)].map(id => registry.skill(id));
    if (known.length === 0)
        return [];
    return Object.keys(STYLE_META).map(style => {
        const meta = STYLE_META[style];
        const skills = chooseSkills(known, style, registry);
        return {
            id: meta.id,
            style,
            name: meta.name,
            description: meta.description,
            strengths: [...meta.strengths],
            tradeoff: meta.tradeoff,
            skillIds: skills.map(skill => skill.id),
            aiProfile: { name: `Preset · ${meta.name}`, rules: buildRules(skills, style, registry) },
        };
    });
}
//# sourceMappingURL=combat-loadout-presets.js.map