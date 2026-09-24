import { formatLogMagnitude } from './endless-number.js';
import { COMBAT_RULES } from './combat-rules.js';
function delivery(skill) {
    if (!skill)
        return 'arcane';
    const raw = [skill.name, ...skill.tags, skill.primaryElement ?? ''].join(' ').toLowerCase();
    if (/heal|hồi|shield|khiên|hộ thể/.test(raw) || skill.effects.some(x => x.type === 'heal' || x.type === 'shield'))
        return 'support';
    if (/lôi|lightning|thunder|sét/.test(raw))
        return 'lightning';
    if (/hỏa|fire|flame|viêm/.test(raw))
        return 'fire';
    if (/băng|ice|thủy|water/.test(raw))
        return 'ice';
    if (/độc|poison|mộc|wood/.test(raw))
        return 'poison';
    if (/kiếm|sword|đao|blade|melee|trảm/.test(raw))
        return 'melee';
    return 'projectile';
}
function enemyDelivery(tags) {
    const raw = tags.join(' ').toLowerCase();
    if (raw.includes('speed'))
        return 'melee';
    if (raw.includes('poison'))
        return 'poison';
    if (raw.includes('element'))
        return 'projectile';
    if (raw.includes('dragon'))
        return 'arcane';
    if (raw.includes('construct'))
        return 'melee';
    return 'arcane';
}
function pct(value) { return Math.max(0, Math.min(100, Number(value.toFixed(1)))); }
function safeShare(v) { return Math.max(0, Number.isFinite(v) ? v : 0); }
function amountFromLog(totalLog, share) {
    if (!Number.isFinite(totalLog) || share <= 0)
        return '0';
    return formatLogMagnitude({ log10: totalLog + Math.log10(Math.max(1e-12, share)) });
}
function hpFromPct(maxLog, hpPct) {
    if (hpPct <= 0)
        return '0';
    if (!Number.isFinite(maxLog))
        return '—';
    return formatLogMagnitude({ log10: maxLog + Math.log10(Math.max(1e-12, hpPct / 100)) });
}
function maxHp(maxLog) { return Number.isFinite(maxLog) ? formatLogMagnitude({ log10: maxLog }) : '—'; }
function damageWeight(skill) {
    if (!skill)
        return 1;
    let out = 0;
    for (const effect of skill.effects) {
        if (effect.type === 'damage')
            out += Math.max(0, effect.coefficient);
        else if (effect.type === 'damageOverTime')
            out += Math.max(0, effect.coefficientPerTick) * Math.max(0, effect.ticks) * .8;
        else if (effect.type === 'drain')
            out += Math.max(0, effect.coefficient);
        else if (effect.type === 'consumeMarkDamage')
            out += Math.max(0, effect.baseCoefficient) + Math.max(0, effect.coefficientPerStack) * Math.max(0, effect.maxConsume) * .5;
    }
    return out;
}
function dotWeight(skill) {
    if (!skill)
        return 0;
    let out = 0;
    for (const effect of skill.effects)
        if (effect.type === 'damageOverTime')
            out += Math.max(0, effect.coefficientPerTick) * Math.max(0, effect.ticks) * .8;
    if (skill.channel)
        for (const effect of skill.channel.effects)
            if (effect.type === 'damageOverTime')
                out += Math.max(0, effect.coefficientPerTick) * Math.max(0, effect.ticks) * .8;
    return out;
}
function skillDamageKind(skill) {
    if (!skill)
        return 'direct';
    const direct = skill.effects.some(x => x.type === 'damage' || x.type === 'drain' || x.type === 'consumeMarkDamage') || (skill.channel?.effects.some(x => x.type === 'damage' || x.type === 'drain' || x.type === 'consumeMarkDamage') ?? false);
    const dot = skill.effects.some(x => x.type === 'damageOverTime') || (skill.channel?.effects.some(x => x.type === 'damageOverTime') ?? false);
    return dot && !direct ? 'dot' : 'direct';
}
function visualHitCount(skill) {
    if (!skill)
        return 1;
    const id = String(skill.id || '');
    if (skill.channel?.baseHits)
        return Math.max(2, Math.min(5, Math.round(skill.channel.baseHits)));
    const direct = skill.effects.filter(x => x.type === 'damage' || x.type === 'drain' || x.type === 'consumeMarkDamage').length;
    if (direct > 1)
        return Math.max(2, Math.min(4, direct));
    if (/\.myriad$|\.insects$|\.suppress$|\.ultimate$/.test(id) && skill.runtimeV117?.slotClass === 'ultimate')
        return 1;
    if (/\.sync$|\.split$/.test(id))
        return 3;
    return 1;
}
function visualBeat(skill, d, window) {
    const form = skill?.runtimeV117?.form ?? 'instant';
    const ultimate = skill?.runtimeV117?.slotClass === 'ultimate';
    const hits = visualHitCount(skill);
    const melee = d === 'melee';
    const support = d === 'support';
    const castBias = ultimate ? .30 : form === 'charge' || form === 'channel' ? .28 : form === 'cast' ? .24 : form === 'combo' ? .15 : .11;
    const launch = Math.max(.035, window * castBias);
    const firstImpact = Math.max(launch + .045, window * (ultimate ? .55 : melee ? .40 : support ? .34 : form === 'channel' ? .43 : .50));
    const available = Math.max(.04, window * .84 - firstImpact);
    const gap = hits > 1 ? Math.max(.045, Math.min(.12, available / (hits - 1))) : 0;
    const lastImpact = firstImpact + gap * (hits - 1);
    return { launch, firstImpact, lastImpact, gap, hits, end: Math.max(lastImpact + .07, window * .76) };
}
const RESOURCE_META = {
    swordIntent: { name: 'Kiếm Ý', max: 100 },
    fistForce: { name: 'Quyền Thế', max: 5 }, fistPassiveStack: { name: 'Liên Kình', max: 20 },
    counterForce: { name: 'Phản Thế', max: 100 }, bodyPassiveStack: { name: 'Huyết Khí', max: 20 },
    lawWheel: { name: 'Pháp Luân', max: 3 }, spellPassiveStack: { name: 'Pháp Ý', max: 20 },
    poisonSeedStage: { name: 'Độc Chủng', max: 4 }, poisonPassiveStack: { name: 'Độc Tức', max: 20 },
    artifactSourcesV2: { name: 'Nguồn Pháp Bảo', max: 3 }, artifactPassiveStack: { name: 'Khí Cảm', max: 20 },
    formationNurtureV2: { name: 'Dưỡng Độ', max: 100 }, formationIntegrityV2: { name: 'Độ Bền', max: 100 }, formationPassiveStack: { name: 'Trận Văn', max: 20 },
    mindEchoCounter: { name: 'Niệm Ảnh', max: 3 }, mindPassiveStack: { name: 'Niệm Lực', max: 20 },
};
function resourceClamp(id, value) { return Math.max(0, Math.min(RESOURCE_META[id]?.max ?? 100, value)); }
function markLabel(mark) {
    const raw = String(mark || 'Ấn');
    if (/mind|thần|niem|niệm/i.test(raw))
        return 'Thần Ấn';
    if (/poison|độc/i.test(raw))
        return 'Độc Tầng';
    if (/seal|ấn/i.test(raw))
        return 'Ấn';
    return raw.replace(/^mark[.:_-]?/i, '').replace(/[._-]+/g, ' ') || 'Ấn';
}
/**
 * v1.38 alpha.12 combat-truth stream.
 * Endless Hunt uses a log-scale HP resolver so it can remain stable at extreme floors where ordinary
 * floating-point CombatEngine entities would overflow. This stream therefore does NOT invent crit/dodge
 * rolls or probabilistic statuses. Damage totals and terminal HP are anchored exactly to the authoritative
 * resolver; the totals are deterministically distributed across authored skill beats for readable replay.
 */
export function buildEndlessHuntCombatStream(input) {
    const { registry, result, player } = input;
    const events = [];
    let seq = 0;
    const push = (time, type, actor, message, extra = {}) => events.push({ seq: seq++, time: Number(time.toFixed(3)), type, actor, message, ...extra });
    const skillIds = input.activeSkillIds.filter(id => registry.skills.has(id));
    if (!skillIds.length && registry.skills.has('skill.basic_strike'))
        skillIds.push('skill.basic_strike');
    const skills = skillIds.map(id => registry.skills.get(id)).filter(Boolean);
    const duration = Math.max(.8, result.battleSeconds);
    const exchanges = Math.max(2, Math.min(8, Math.round(duration / 1.25)));
    const playerMax = maxHp(result.playerMaxHpLog10), enemyMax = maxHp(result.enemyMaxHpLog10);
    const marks = new Map();
    const daoResources = new Map();
    let ultimateGauge = 0;
    let breakCount = 0, markBurstCount = 0;
    const emitResource = (time, id, value, delta, skill) => { const meta = RESOURCE_META[id]; if (!meta)
        return; const next = resourceClamp(id, value); daoResources.set(id, next); push(time, 'resource', 'player', `${meta.name} ${delta >= 0 ? '+' : ''}${delta} → ${next}/${meta.max}.`, { target: 'player', skillId: skill?.id, skillName: skill?.name, resourceId: id, resourceName: meta.name, resourceValue: next, resourceMax: meta.max, resourceDelta: delta, ultimateGauge }); };
    const emitGauge = (time, delta, skill) => push(time, 'resource', 'player', `Tuyệt Kỹ ${delta >= 0 ? '+' : ''}${delta} → ${ultimateGauge}/100.`, { target: 'player', skillId: skill?.id, skillName: skill?.name, resourceId: 'ultimateGauge', resourceName: 'Tuyệt Kỹ', resourceValue: ultimateGauge, resourceMax: 100, resourceDelta: delta, ultimateGauge });
    // Hunt uses a log-scale resolver, but breakPressurePctPerSecond is authored from the real equipped rotation.
    // Replay integrates that authoritative pressure over visible time; it never changes the fight result.
    const breakPressure = Math.max(0, Number(result.breakPressurePctPerSecond || 0));
    let enemyPoise = 100, lastBreakAt = 0, stableUntil = 0;
    const breakDefenseReductionPct = COMBAT_RULES.breakDefenseReductionPct * (result.monster.grade === 'boss' ? COMBAT_RULES.bossBreakDebuffEffectiveness : 1);
    const advanceBreak = (time) => {
        if (breakPressure <= 0)
            return;
        if (stableUntil > 0) {
            if (time < stableUntil)
                return;
            stableUntil = 0;
            enemyPoise = 100;
            lastBreakAt = time;
        }
        const elapsed = Math.max(.12, time - lastBreakAt);
        lastBreakAt = time;
        const loss = Math.min(100, Math.max(0, breakPressure * elapsed));
        if (loss <= .05)
            return;
        enemyPoise = Math.max(0, enemyPoise - loss);
        const accumulated = pct(100 - enemyPoise);
        push(time, 'break', 'player', `Phá Thế +${loss.toFixed(1)} · ${accumulated}/100.`, { target: 'enemy', breakDamagePct: Number(loss.toFixed(1)), poisePct: pct(enemyPoise), breakState: 'pressure' });
        if (enemyPoise <= 0) {
            const brokenAt = time + .002;
            stableUntil = time + COMBAT_RULES.breakDebuffSeconds + COMBAT_RULES.breakStableSeconds;
            breakCount++;
            push(brokenAt, 'break', 'player', `${result.monster.name} Thất Thế: Phòng Ngự -${breakDefenseReductionPct.toFixed(0)}% trong ${COMBAT_RULES.breakDebuffSeconds}s.`, { target: 'enemy', poisePct: 0, breakState: 'broken', breakDefenseReductionPct, durationSeconds: COMBAT_RULES.breakDebuffSeconds });
            const recoverAt = time + COMBAT_RULES.breakDebuffSeconds;
            if (recoverAt < duration)
                push(recoverAt, 'break', 'player', `${result.monster.name} vào Ổn Thế ${COMBAT_RULES.breakStableSeconds}s.`, { target: 'enemy', poisePct: 100, breakState: 'recovering', durationSeconds: COMBAT_RULES.breakStableSeconds });
            const readyAt = stableUntil;
            if (readyAt < duration)
                push(readyAt, 'break', 'player', `${result.monster.name} hết Ổn Thế.`, { target: 'enemy', poisePct: 100, breakState: 'ready' });
        }
    };
    push(0, 'battleStart', 'player', `${player.name} giao chiến với ${result.monster.name}.`, { target: 'enemy', hpPct: 100, hpCurrent: enemyMax, hpMax: enemyMax, monsterId: result.monster.id, monsterName: result.monster.name, monsterGrade: result.monster.grade, monsterTags: [...result.monster.tags], monsterElements: [...result.monster.elements] });
    if (result.monster.grade === 'boss' && input.bossMechanic)
        push(.01, 'status', 'enemy', `Dị tượng · ${input.bossMechanic.name}: ${input.bossMechanic.description}`, { target: 'player', statusId: 'hunt.boss.mechanic', statusName: input.bossMechanic.name, statusKind: 'debuff', durationSeconds: Math.min(6, duration), hpPct: 100, hpCurrent: playerMax, hpMax: playerMax });
    const rows = Array.from({ length: exchanges }, (_, i) => { const skill = skills[i % Math.max(1, skills.length)]; return { skill, weight: damageWeight(skill) }; });
    let playerWeightSum = rows.reduce((sum, row) => sum + safeShare(row.weight), 0);
    if (playerWeightSum <= 1e-9) {
        for (const row of rows)
            row.weight = 1;
        playerWeightSum = rows.length;
    }
    const enemyWeights = rows.map((_, i) => .85 + (i % 3) * .15);
    const enemyWeightSum = enemyWeights.reduce((a, b) => a + b, 0);
    let enemyProgress = 0, playerProgress = 0;
    for (let i = 0; i < rows.length; i++) {
        const base = Math.max(.06, duration * (i + .35) / (exchanges + .2));
        const nextBase = i < rows.length - 1 ? Math.max(.08, duration * (i + 1 + .35) / (exchanges + .2)) : duration;
        const slotWindow = Math.max(.24, Math.min(.78, (nextBase - base) * .86));
        const skill = rows[i].skill;
        const d = delivery(skill);
        const name = skill?.name ?? 'Phá Không Kích';
        const beat = visualBeat(skill, d, slotWindow);
        let spentNurture = 0;
        push(base, 'castStart', 'player', `Thi triển ${name}.`, { target: 'enemy', skillId: skill?.id, skillName: name, behaviorType: skill?.behaviorType, delivery: d });
        if (skill) {
            const runtime = skill.runtimeV117;
            const dao = skill.daoRuntimeV118;
            let ro = .012;
            if ((runtime?.slotClass ?? 'active') === 'ultimate') {
                const before = ultimateGauge;
                ultimateGauge = 0;
                if (before !== 0)
                    emitGauge(base + ro, ultimateGauge - before, skill);
                ro += .006;
            }
            for (const change of dao?.spend ?? []) {
                const before = daoResources.get(change.resource) ?? 0;
                const requested = change.amount === 'all' ? before : Number(change.amount || 0);
                const amount = Math.min(before, Math.max(0, requested));
                if (change.resource === 'formationNurture')
                    spentNurture = amount;
                emitResource(base + ro, change.resource, before - amount, -amount, skill);
                ro += .006;
            }
        }
        if (d !== 'support') {
            push(base + beat.launch, 'projectile', 'player', `${name} xuất kích.`, { target: 'enemy', skillId: skill?.id, skillName: name, behaviorType: skill?.behaviorType, delivery: d, shotIndex: 1, shotCount: beat.hits });
        }
        const share = safeShare(rows[i].weight) / playerWeightSum;
        if (share > 0) {
            const hitShare = share / beat.hits;
            const hasMarkBurst = Boolean(skill?.effects.some(effect => effect.type === 'consumeMarkDamage' && (marks.get(effect.mark)?.stacks ?? 0) > 0));
            for (let hit = 0; hit < beat.hits; hit++) {
                const hitTime = base + beat.firstImpact + beat.gap * hit;
                enemyProgress = Math.min(1, enemyProgress + hitShare);
                const enemyHp = pct(100 - (100 - result.enemyHpRemainingPct) * enemyProgress);
                const amount = amountFromLog(result.effectiveDamageLog10, hitShare);
                push(hitTime, 'damage', 'player', `${name} gây ${amount} sát thương${beat.hits > 1 ? ` · nhịp ${hit + 1}/${beat.hits}` : ''}.`, { target: 'enemy', skillId: skill?.id, skillName: name, behaviorType: skill?.behaviorType, delivery: d, amount, damageKind: hasMarkBurst ? 'markBurst' : skillDamageKind(skill), hpPct: enemyHp, hpCurrent: hpFromPct(result.enemyMaxHpLog10, enemyHp), hpMax: enemyMax, shotIndex: hit + 1, shotCount: beat.hits });
                advanceBreak(hitTime);
            }
        }
        if (skill) {
            let offset = beat.lastImpact + .035;
            for (const effect of skill.effects) {
                if (effect.type === 'addMark') {
                    const prev = marks.get(effect.mark)?.stacks ?? 0;
                    const next = Math.min(effect.maxStacks, prev + Math.max(0, effect.stacks));
                    marks.set(effect.mark, { stacks: next, maxStacks: effect.maxStacks });
                    const label = markLabel(effect.mark);
                    push(base + offset, 'mark', 'player', `${label} +${effect.stacks} → ${next}/${effect.maxStacks}.`, { target: 'enemy', skillId: skill.id, skillName: name, markId: effect.mark, statusName: label, stacks: next, maxStacks: effect.maxStacks });
                    offset += .02;
                }
                else if (effect.type === 'consumeMarkDamage') {
                    const state = marks.get(effect.mark) ?? { stacks: 0, maxStacks: effect.maxConsume };
                    const used = Math.min(state.stacks, effect.maxConsume);
                    const next = Math.max(0, state.stacks - used);
                    marks.set(effect.mark, { stacks: next, maxStacks: state.maxStacks });
                    const label = markLabel(effect.mark);
                    if (used > 0)
                        markBurstCount++;
                    push(base + offset, 'mark', 'player', used > 0 ? `Nổ ${label}: tiêu ${used} tầng, còn ${next}/${state.maxStacks}.` : `${label}: chưa có tầng để tiêu.`, { target: 'enemy', skillId: skill.id, skillName: name, markId: effect.mark, statusName: label, stacks: next, maxStacks: state.maxStacks, consumedStacks: used });
                    offset += .02;
                }
                else if (effect.type === 'applyStatus') {
                    const def = registry.statuses.get(effect.statusId);
                    const target = effect.target === 'self' ? 'player' : 'enemy';
                    const statusKind = def?.group === 'Buff' ? 'buff' : def?.group === 'Debuff' || def?.group === 'BodyControl' || def?.group === 'SpiritControl' ? 'debuff' : target === 'enemy' ? 'debuff' : 'buff';
                    push(base + offset, 'status', 'player', `${def?.name ?? effect.statusId} được áp dụng.`, { target, skillId: skill.id, skillName: name, statusId: effect.statusId, statusName: def?.name ?? effect.statusId, statusKind, statusGroup: def?.group, stacks: typeof effect.stacks === 'number' ? Number(effect.stacks) : undefined, maxStacks: typeof effect.maxStacks === 'number' ? Number(effect.maxStacks) : undefined, durationSeconds: typeof effect.duration === 'number' ? Number(effect.duration) : undefined });
                    offset += .02;
                }
            }
            let ro = beat.lastImpact + .10;
            for (const change of skill.daoRuntimeV118?.generate ?? []) {
                const before = daoResources.get(change.resource) ?? 0;
                const amount = change.amount === 'all' ? 0 : Number(change.amount || 0);
                emitResource(base + ro, change.resource, before + amount, amount, skill);
                ro += .006;
            }
            const sig = skill.daoRuntimeV118?.signature;
            if (sig === 'formationDeploy') {
                const n = daoResources.get('formationNurture') ?? 0;
                if (n !== 0) {
                    emitResource(base + ro, 'formationNurture', 0, -n, skill);
                    ro += .006;
                }
                const before = daoResources.get('formationIntegrity') ?? 0;
                emitResource(base + ro, 'formationIntegrity', 100, 100 - before, skill);
                ro += .006;
            }
            else if (sig === 'formationActivate') {
                const before = daoResources.get('formationIntegrity') ?? 0;
                if (before > 0) {
                    const loss = (skill.runtimeV117?.slotClass === 'ultimate' || spentNurture >= 55) ? 25 : 10;
                    const actual = Math.min(before, loss);
                    emitResource(base + ro, 'formationIntegrity', before - actual, -actual, skill);
                    ro += .006;
                }
            }
            else if (sig === 'formationBreak') {
                for (const id of ['formationNurture', 'formationIntegrity']) {
                    const before = daoResources.get(id) ?? 0;
                    if (before > 0) {
                        emitResource(base + ro, id, 0, -before, skill);
                        ro += .006;
                    }
                }
            }
            const gaugeGain = Math.max(0, Number(skill.runtimeV117?.ultimateGaugeGenerate || 0));
            if ((skill.runtimeV117?.slotClass ?? 'active') !== 'ultimate' && gaugeGain > 0) {
                const before = ultimateGauge;
                ultimateGauge = Math.min(100, ultimateGauge + gaugeGain);
                if (ultimateGauge !== before)
                    emitGauge(base + ro, ultimateGauge - before, skill);
            }
        }
        if (i < exchanges - 1 || !result.won) {
            const enemyTime = base + Math.max(beat.end, slotWindow * .80);
            const eDelivery = enemyDelivery(result.monster.tags);
            push(enemyTime, 'castStart', 'enemy', `${result.monster.name} phản kích.`, { target: 'player', delivery: eDelivery });
            push(enemyTime + .09, 'projectile', 'enemy', eDelivery === 'melee' ? `${result.monster.name} áp sát.` : 'Yêu lực lao tới.', { target: 'player', delivery: eDelivery });
            const enemyShare = enemyWeights[i] / enemyWeightSum;
            if (Number.isFinite(result.enemyDamageLog10) && enemyShare > 0) {
                playerProgress = Math.min(1, playerProgress + enemyShare);
                const playerHp = pct(100 - (100 - result.playerHpRemainingPct) * playerProgress);
                const amount = amountFromLog(result.enemyDamageLog10, enemyShare);
                push(enemyTime + .25, 'damage', 'enemy', `${result.monster.name} gây ${amount} sát thương.`, { target: 'player', delivery: eDelivery, amount, damageKind: 'direct', hpPct: playerHp, hpCurrent: hpFromPct(result.playerMaxHpLog10, playerHp), hpMax: playerMax });
            }
        }
    }
    const end = Math.max(duration - .08, events.at(-1)?.time ?? duration);
    if (result.won)
        push(end, 'death', 'player', `${result.monster.name} bị trấn sát.`, { target: 'enemy', hpPct: 0, hpCurrent: '0', hpMax: enemyMax });
    else if (result.outcome === 'defeat')
        push(end, 'death', 'enemy', `${player.name} mất khả năng chiến đấu.`, { target: 'player', hpPct: 0, hpCurrent: '0', hpMax: playerMax });
    const skillShares = new Map();
    let dotTotal = 0;
    for (const row of rows) {
        if (!row.skill)
            continue;
        const key = row.skill.id;
        const prev = skillShares.get(key) ?? { name: row.skill.name, weight: 0 };
        prev.weight += safeShare(row.weight);
        skillShares.set(key, prev);
        dotTotal += dotWeight(row.skill);
    }
    const topSkill = [...skillShares.values()].sort((a, b) => b.weight - a.weight)[0]?.name ?? 'Đánh Thường';
    const dotShare = playerWeightSum > 0 ? Math.max(0, Math.min(1, dotTotal / playerWeightSum)) : 0;
    const battleSummary = { totalDamage: amountFromLog(result.effectiveDamageLog10, 1), damageReceived: Number.isFinite(result.enemyDamageLog10) ? amountFromLog(result.enemyDamageLog10, 1) : '0', topSkill, dotDamage: dotShare > 0 ? amountFromLog(result.effectiveDamageLog10, dotShare) : '0', breakCount, markBurstCount };
    push(Math.max(end + .004, duration - .035), 'summary', result.won ? 'player' : 'enemy', 'Tổng kết giao phong.', { target: result.won ? 'enemy' : 'player', battleSummary });
    push(duration, 'battleEnd', result.won ? 'player' : 'enemy', result.won ? 'Chiến thắng.' : result.outcome === 'timeout' ? 'Hết thời gian giao phong, chưa thể hạ mục tiêu.' : 'Giao phong thất lợi.', { target: result.won ? 'enemy' : 'player', hpPct: result.won ? 0 : pct(result.playerHpRemainingPct), hpCurrent: result.won ? '0' : hpFromPct(result.playerMaxHpLog10, result.playerHpRemainingPct), hpMax: result.won ? enemyMax : playerMax });
    return events.sort((a, b) => a.time - b.time || a.seq - b.seq).slice(0, 180).map((event, index) => ({ ...event, seq: index }));
}
/**
 * Canonical presentation adapter for typed/structured kernel output.
 * Mechanics are already settled by the production CombatKernel V3 boundary;
 * this function only reshapes the real battle log for the portrait/web renderer.
 */
export function buildEndlessHuntCombatStreamFromKernel(input) {
    const { registry, battle, result } = input;
    const events = [];
    let seq = 0;
    const playerMaxNum = Number.isFinite(result.playerMaxHpLog10) ? 10 ** Math.max(-300, Math.min(300, result.playerMaxHpLog10)) : 0;
    const enemyMaxNum = Number.isFinite(result.enemyMaxHpLog10) ? 10 ** Math.max(-300, Math.min(300, result.enemyMaxHpLog10)) : 0;
    const hp = { [input.playerId]: playerMaxNum, [input.enemyId]: enemyMaxNum };
    const max = { [input.playerId]: playerMaxNum, [input.enemyId]: enemyMaxNum };
    const side = (id) => id === input.enemyId ? 'enemy' : 'player';
    const targetSide = (id) => id ? side(id) : undefined;
    const fmt = (value) => value > 0 && Number.isFinite(value) ? formatLogMagnitude({ log10: Math.log10(value) }) : '0';
    const hpFields = (id) => {
        if (!id)
            return {};
        const m = Math.max(1e-12, max[id] ?? 0), v = Math.max(0, hp[id] ?? 0);
        return { hpPct: pct(v / m * 100), hpCurrent: fmt(v), hpMax: fmt(m) };
    };
    const push = (time, type, actor, message, extra = {}) => events.push({ seq: seq++, time: Number(Math.max(0, time).toFixed(3)), type, actor, message, ...extra });
    push(0, 'battleStart', 'player', `${result.monster.name} xuất hiện.`, { target: 'enemy', ...hpFields(input.enemyId), monsterId: result.monster.id, monsterName: result.monster.name, monsterGrade: result.monster.grade, monsterTags: [...result.monster.tags], monsterElements: [...result.monster.elements] });
    if (result.monster.grade === 'boss' && input.bossMechanic)
        push(.01, 'status', 'enemy', `Dị tượng · ${input.bossMechanic.name}: ${input.bossMechanic.description}`, { target: 'player', statusId: 'hunt.boss.mechanic', statusName: input.bossMechanic.name, statusKind: 'debuff', durationSeconds: Math.min(6, battle.duration), ...hpFields(input.playerId) });
    let breakCount = 0, markBurstCount = 0;
    for (const log of battle.logs) {
        if (log.type === 'battleStart' || log.type === 'battleEnd' || log.type === 'info' || log.type === 'skillResolve' || log.type === 'channel' || log.type === 'heart' || log.type === 'crit' || log.type === 'reaction')
            continue;
        const actor = side(log.actorId), target = targetSide(log.targetId), skill = log.skillId && registry.skills.has(log.skillId) ? registry.skill(log.skillId) : undefined, d = delivery(skill);
        if (log.type === 'phase') {
            push(log.time, 'phase', actor, log.message, { target, phaseId: String(log.data?.phaseId ?? ''), phaseName: String(log.data?.phaseName ?? 'Phase Boss'), thresholdPct: typeof log.data?.thresholdPct === 'number' ? Number(log.data.thresholdPct) : undefined });
            continue;
        }
        if (log.type === 'counterWindow') {
            const id = String(log.data?.counterWindowId ?? '');
            const state = log.data?.opens === true ? 'open' : log.data?.success === true ? 'success' : log.data?.failure === true ? 'failure' : undefined;
            push(log.time, 'counterWindow', actor, log.message, { target, counterWindowId: id || undefined, counterWindowName: typeof log.data?.counterWindowName === 'string' ? log.data.counterWindowName : id || undefined, counterState: state, durationSeconds: typeof log.data?.duration === 'number' ? Number(log.data.duration) : undefined });
            continue;
        }
        if (log.type === 'trigger') {
            if (log.data?.confidantRuntime === 'confidant.v87') {
                push(log.time, 'trigger', actor, log.message, { target, confidantRuntime: 'confidant.v87', confidantEvent: typeof log.data?.confidantEvent === 'string' ? log.data.confidantEvent : undefined, confidantId: typeof log.data?.confidantId === 'string' ? log.data.confidantId : undefined, abilityName: typeof log.data?.abilityName === 'string' ? log.data.abilityName : undefined, oncePerBattle: log.data?.oncePerBattle === true });
            }
            else if (log.data?.artifactRuntime === 'artifact.v88') {
                push(log.time, 'trigger', actor, log.message, { target, artifactRuntime: 'artifact.v88', artifactEvent: typeof log.data?.artifactEvent === 'string' ? log.data.artifactEvent : undefined, artifactId: typeof log.data?.artifactId === 'string' ? log.data.artifactId : undefined, abilityName: typeof log.data?.abilityName === 'string' ? log.data.abilityName : undefined, baoQi: typeof log.data?.baoQi === 'number' ? Number(log.data.baoQi) : undefined, baoQiMax: typeof log.data?.baoQiMax === 'number' ? Number(log.data.baoQiMax) : undefined, baoQiCost: typeof log.data?.baoQiCost === 'number' ? Number(log.data.baoQiCost) : undefined, oncePerBattle: log.data?.oncePerBattle === true });
            }
            continue;
        }
        if (log.type === 'castStart') {
            push(log.time, 'castStart', actor, log.message, { target, skillId: log.skillId, skillName: skill?.name, behaviorType: skill?.behaviorType, delivery: d, castTime: typeof log.data?.castTime === 'number' ? Number(log.data.castTime) : undefined, bossTelegraph: log.data?.bossTelegraph === true, bossDangerLevel: typeof log.data?.bossDangerLevel === 'string' ? log.data.bossDangerLevel : undefined, bossDangerLabel: typeof log.data?.bossDangerLabel === 'string' ? log.data.bossDangerLabel : undefined });
            if (target && d !== 'melee' && d !== 'support')
                push(log.time + .025, 'projectile', actor, `${skill?.name ?? 'Kỹ năng'} xuất kích.`, { target, skillId: log.skillId, skillName: skill?.name, behaviorType: skill?.behaviorType, delivery: d, shotIndex: 1, shotCount: 1 });
            continue;
        }
        if (log.type === 'damage') {
            const amount = Math.max(0, Number(log.data?.damage ?? 0));
            if (log.targetId)
                hp[log.targetId] = Math.max(0, (hp[log.targetId] ?? 0) - amount);
            const sourceTag = String(log.data?.sourceTag ?? 'ActiveHit');
            const kind = sourceTag === 'DoT' ? 'dot' : String(log.data?.markBurst ?? '') === 'true' ? 'markBurst' : 'direct';
            if (kind === 'markBurst')
                markBurstCount++;
            push(log.time, 'damage', actor, log.message, { target, skillId: log.skillId, skillName: skill?.name, behaviorType: skill?.behaviorType, delivery: d, amount: fmt(amount), crit: Boolean(log.data?.crit), damageKind: kind, ...hpFields(log.targetId) });
            continue;
        }
        if (log.type === 'heal') {
            const amount = Math.max(0, Number(log.data?.heal ?? 0));
            if (log.targetId)
                hp[log.targetId] = Math.min(max[log.targetId] ?? Infinity, (hp[log.targetId] ?? 0) + amount);
            push(log.time, 'heal', actor, log.message, { target, skillId: log.skillId, skillName: skill?.name, delivery: 'support', amount: fmt(amount), ...hpFields(log.targetId) });
            continue;
        }
        if (log.type === 'shield') {
            push(log.time, 'shield', actor, log.message, { target, skillId: log.skillId, skillName: skill?.name, delivery: 'support', amount: fmt(Math.max(0, Number(log.data?.capacity ?? log.data?.shield ?? 0))), ...hpFields(log.targetId) });
            continue;
        }
        if (log.type === 'shieldBreak') {
            push(log.time, 'shieldBreak', actor, log.message, { target, skillId: log.skillId, skillName: skill?.name, ...hpFields(log.targetId) });
            continue;
        }
        if (log.type === 'break') {
            const amount = Math.max(0, Number(log.data?.breakDamagePct ?? 0));
            if (amount > 0)
                breakCount++;
            push(log.time, 'break', actor, log.message, { target, skillId: log.skillId, skillName: skill?.name, breakDamagePct: amount, poisePct: typeof log.data?.poise === 'number' ? pct(Number(log.data.poise)) : undefined, breakState: String(log.message).includes('Thất Thế') ? 'broken' : 'pressure' });
            continue;
        }
        if (log.type === 'status') {
            const statusId = String(log.data?.statusId ?? '');
            const def = statusId && registry.statuses.has(statusId) ? registry.status(statusId) : undefined;
            const statusKind = def?.group === 'Buff' ? 'buff' : def?.group === 'Debuff' || def?.group === 'BodyControl' || def?.group === 'SpiritControl' ? 'debuff' : target === actor ? 'buff' : 'debuff';
            push(log.time, 'status', actor, log.message, { target, skillId: log.skillId, skillName: skill?.name, statusId: statusId || undefined, statusName: def?.name, statusKind, statusGroup: def?.group, stacks: typeof log.data?.stacks === 'number' ? Number(log.data.stacks) : undefined, maxStacks: typeof log.data?.maxStacks === 'number' ? Number(log.data.maxStacks) : undefined, durationSeconds: typeof log.data?.duration === 'number' ? Number(log.data.duration) : undefined });
            continue;
        }
        if (log.type === 'mark') {
            const markId = String(log.data?.mark ?? log.data?.markId ?? '');
            push(log.time, 'mark', actor, log.message, { target, skillId: log.skillId, skillName: skill?.name, markId: markId || undefined, statusName: markId ? markLabel(markId) : undefined, stacks: typeof log.data?.stacks === 'number' ? Number(log.data.stacks) : undefined, maxStacks: typeof log.data?.maxStacks === 'number' ? Number(log.data.maxStacks) : undefined, consumedStacks: typeof log.data?.consumed === 'number' ? Number(log.data.consumed) : undefined });
            if (typeof log.data?.poisonSeedStage === 'number') {
                const meta = RESOURCE_META.poisonSeedStage;
                push(log.time + .0005, 'resource', actor, log.message, { target: 'player', skillId: log.skillId, skillName: skill?.name, resourceId: 'poisonSeedStage', resourceName: meta.name, resourceValue: Number(log.data.poisonSeedStage), resourceMax: meta.max });
            }
            continue;
        }
        if (log.type === 'resource') {
            const data = log.data || {};
            if (data.artifactRuntime === 'artifact.v88' && typeof data.baoQi === 'number') {
                push(log.time, 'resource', actor, log.message, { target: 'player', skillId: log.skillId, skillName: skill?.name, resourceId: 'artifactBaoQiV88', resourceName: 'Bảo Khí', resourceValue: Number(data.baoQi), resourceMax: typeof data.baoQiMax === 'number' ? Number(data.baoQiMax) : 100, resourceDelta: typeof data.baoQiGain === 'number' ? Number(data.baoQiGain) : undefined, artifactRuntime: 'artifact.v88', artifactEvent: 'baoQi', baoQi: Number(data.baoQi), baoQiMax: typeof data.baoQiMax === 'number' ? Number(data.baoQiMax) : 100 });
                continue;
            }
            if (data.v2DaoProjection === true) {
                for (const [resourceId, meta] of Object.entries(RESOURCE_META)) {
                    if (typeof data[resourceId] !== 'number')
                        continue;
                    push(log.time, 'resource', actor, `${meta.name}: ${Number(data[resourceId]).toFixed(Number.isInteger(Number(data[resourceId])) ? 0 : 1)}/${meta.max}.`, { target: 'player', skillId: log.skillId, skillName: skill?.name, resourceId, resourceName: meta.name, resourceValue: Number(data[resourceId]), resourceMax: typeof data[`${resourceId}Cap`] === 'number' ? Number(data[`${resourceId}Cap`]) : meta.max });
                }
                continue;
            }
            if (typeof data.swordQi === 'number' || typeof data.swordQiCap === 'number') {
                const value = typeof data.swordQi === 'number' ? Number(data.swordQi) : 0;
                const maxValue = typeof data.swordQiCap === 'number' ? Number(data.swordQiCap) : 5;
                const delta = (typeof data.swordQiGenerated === 'number' ? Number(data.swordQiGenerated) : 0) - (typeof data.swordQiSpent === 'number' ? Number(data.swordQiSpent) : 0);
                push(log.time, 'resource', actor, log.message, { target: 'player', skillId: log.skillId, skillName: skill?.name, resourceId: 'swordQi', resourceName: 'Kiếm Khí', resourceValue: value, resourceMax: maxValue, resourceDelta: delta });
                continue;
            }
            if (typeof data.swordIntent === 'number') {
                const detailParts = [];
                const addDetail = (label, key) => { const value = Number(data[key]); if (Number.isFinite(value) && Math.abs(value) > .001)
                    detailParts.push(`${label} +${Number(value.toFixed(1))}%`); };
                addDetail('Bạo Kích', 'swordIntentCritChancePct');
                addDetail('Hội Tâm', 'swordIntentHeartChancePct');
                addDetail('Xuyên Phòng', 'swordIntentArmorPenPct');
                addDetail('DMG trực tiếp', 'swordIntentDirectDamagePct');
                addDetail('Hội Tâm DMG', 'swordIntentCritHeartDamagePct');
                addDetail('Nộ', 'swordIntentGaugeGainPct');
                push(log.time, 'resource', actor, log.message, { target: 'player', skillId: log.skillId, skillName: skill?.name, resourceId: 'swordIntentV2', resourceName: 'Kiếm Ý', resourceValue: Number(data.swordIntent), resourceMax: typeof data.swordIntentCap === 'number' ? Number(data.swordIntentCap) : 20, resourceDelta: typeof data.swordIntentGain === 'number' ? Number(data.swordIntentGain) : undefined, durationSeconds: typeof data.swordIntentDurationSeconds === 'number' ? Number(data.swordIntentDurationSeconds) : undefined, resourceDetail: detailParts.join(' · ') });
                continue;
            }
            const resourceId = String(data.resourceId ?? data.resource ?? '');
            const meta = RESOURCE_META[resourceId];
            push(log.time, 'resource', actor, log.message, { target, skillId: log.skillId, skillName: skill?.name, resourceId: resourceId || undefined, resourceName: meta?.name ?? (resourceId || undefined), resourceValue: typeof data.value === 'number' ? Number(data.value) : undefined, resourceMax: typeof data.max === 'number' ? Number(data.max) : meta?.max, resourceDelta: typeof data.delta === 'number' ? Number(data.delta) : undefined, ultimateGauge: typeof data.ultimateGauge === 'number' ? Number(data.ultimateGauge) : undefined });
            continue;
        }
        if (log.type === 'death') {
            if (log.targetId)
                hp[log.targetId] = 0;
            push(log.time, 'death', actor, log.message, { target, ...hpFields(log.targetId) });
            continue;
        }
        if (log.type === 'dodge')
            push(log.time, 'status', actor, log.message, { target, statusId: 'combat.dodge', statusName: 'Né', statusKind: 'buff' });
    }
    // Summary totals stay anchored to the canonical battle result already stored in EndlessHuntFightResult.
    push(battle.duration, 'summary', 'player', result.won ? 'Trấn Sát.' : 'Giao tranh kết thúc.', { target: 'enemy', battleSummary: { totalDamage: formatLogMagnitude({ log10: result.effectiveDamageLog10 }), damageReceived: formatLogMagnitude({ log10: result.enemyDamageLog10 }), topSkill: '—', dotDamage: '0', breakCount, markBurstCount } });
    push(battle.duration + .001, 'battleEnd', result.won ? 'player' : 'enemy', result.won ? `${result.monster.name} bị hạ.` : `${result.monster.name} vẫn đứng vững.`, { target: result.won ? 'enemy' : 'player' });
    return events.sort((a, b) => a.time - b.time || a.seq - b.seq).map((event, index) => ({ ...event, seq: index }));
}

/**
 * Compatibility alias for callers outside the production Session cutover.
 * New production code should use buildEndlessHuntCombatStreamFromKernel().
 */
export const buildEndlessHuntCombatStreamFromKernelV2 = buildEndlessHuntCombatStreamFromKernel;
//# sourceMappingURL=hunt-combat-stream.js.map
