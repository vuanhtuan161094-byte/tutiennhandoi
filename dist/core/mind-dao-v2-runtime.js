import { skillRuntimeV117, skillSlotClassV117 } from './skill-runtime-v117.js';

export const MIND_V2_MARK = 'Thần Ấn';
export const MIND_V2_MARK_CAP = 5;
export const MIND_V2_ECHO_DELAY_SECONDS = .6;
export const MIND_V2_BASE_ECHO_COEFFICIENT = .35;
export const MIND_V2_FLOW_SECONDS = 5;
export const MIND_V2_FLOW_MASTERY_SECONDS = 6;
export const MIND_V2_ULTIMATE_DOMAIN_SECONDS = 5;
export const MIND_M5_BURST_SNAPSHOT_RETENTION = .70;

function isMainMind(entity, skill) {
    return entity?.combatBuildV117?.battleDaoV2Enabled === true
        && entity?.combatBuildV117?.mainDaoId === 'mind'
        && (!skill || skillRuntimeV117(skill).daoBinding === 'mind');
}

const clampLevel = value => Math.max(1, Math.min(20, Math.floor(Number(value) || 1)));
const scaleLevel = (level, min, max) => min + (max - min) * ((clampLevel(level) - 1) / 19);
const mindPassiveId = n => `passive.v2.mind.p${n}`;
function hasMindPassive(entity, n) {
    return Boolean(entity?.combatBuildV117?.learnedDaoPassiveIdsV118?.includes(mindPassiveId(n)));
}
function mindPassiveLevel(entity, n) {
    return clampLevel(entity?.combatBuildV117?.passiveLevelsV125?.[mindPassiveId(n)] ?? 1);
}
function isSecondaryMind(entity) {
    return entity?.combatBuildV117?.battleDaoV2Enabled === true
        && entity?.combatBuildV117?.mainDaoId !== 'mind'
        && entity?.combatBuildV117?.secondaryDaoId === 'mind';
}
export function mindMasteryTierV2(entity, skillOrId) {
    const id = typeof skillOrId === 'string' ? skillOrId : skillOrId?.id;
    if (!id)
        return 0;
    return Math.max(0, Math.min(1000, Math.floor(Number(entity?.combatBuildV117?.skillPracticeTierV125?.[id]) || 0)));
}
function mindCoreV2(entity) {
    return entity?.battleDaoStateV2?.mind?.core;
}
function cloneStoredSnapshot(snapshot) {
    if (!snapshot)
        return undefined;
    return {
        sourceSkillId: snapshot.sourceSkillId,
        targetId: snapshot.targetId,
        createdAt: snapshot.createdAt,
        payloadId: snapshot.payloadId,
        procDepth: snapshot.procDepth ?? 0,
        packets: (snapshot.packets ?? []).filter(packet => ['damage', 'shield', 'heal'].includes(packet?.type)).map(packet => ({ ...packet })),
    };
}

export function mindPassiveBonusesV2(entity, now = 0) {
    void now;
    const out = {
        echoCoefficientBonus: 0,
        accuracyPct: 0,
        controlPowerPct: 0,
        interferencePct: 0,
        echoBreakPct: 0,
        resolvePct: 0,
        conditionalArmorPenPct: 0,
    };
    if (entity?.combatBuildV117?.battleDaoV2Enabled !== true || !hasMindPassive(entity, 1))
        return out;
    const stack = entity.battleDaoStateV2?.mind?.stack;
    const stacks = Math.max(0, Math.floor(stack?.stacks ?? 0));
    if (!stack || stacks <= 0)
        return out;
    const groups = Math.floor(stacks / 10);
    const atCap = stacks >= Math.max(1, Math.floor(stack.cap ?? 20));
    if (isMainMind(entity)) {
        if (groups > 0) {
            const p1 = mindPassiveLevel(entity, 1);
            const p1Control = groups * scaleLevel(p1, 2, 5);
            out.echoCoefficientBonus += groups * scaleLevel(p1, .02, .04);
            out.controlPowerPct += p1Control;
            out.interferencePct += p1Control;
            if (hasMindPassive(entity, 4)) {
                const p4 = mindPassiveLevel(entity, 4);
                out.accuracyPct += groups * scaleLevel(p4, 2, 6);
                out.controlPowerPct += groups * scaleLevel(p4, 2, 6);
            }
            if (hasMindPassive(entity, 6)) {
                const p6 = mindPassiveLevel(entity, 6);
                out.interferencePct += groups * scaleLevel(p6, 3, 7);
                out.echoBreakPct += groups * scaleLevel(p6, 2, 5);
            }
        }
        if (stacks >= 20 && hasMindPassive(entity, 7))
            out.conditionalArmorPenPct = scaleLevel(mindPassiveLevel(entity, 7), 5, 18);
        if (atCap && hasMindPassive(entity, 8)) {
            const p8 = mindPassiveLevel(entity, 8);
            out.echoCoefficientBonus += scaleLevel(p8, .05, .10);
            const peakControl = scaleLevel(p8, 5, 12);
            out.controlPowerPct += peakControl;
            out.interferencePct += peakControl;
        }
    }
    else if (isSecondaryMind(entity)) {
        if (groups > 0) {
            out.resolvePct += groups * scaleLevel(mindPassiveLevel(entity, 1), 2, 5);
            if (hasMindPassive(entity, 4))
                out.resolvePct += groups * scaleLevel(mindPassiveLevel(entity, 4), 2, 6);
        }
        if (atCap && hasMindPassive(entity, 8))
            out.resolvePct += scaleLevel(mindPassiveLevel(entity, 8), 5, 10);
    }
    return out;
}
export function mindDirectArmorPenBonusV2(source, target, action, now = 0) {
    if (!isMainMind(source) || (action?.battleDaoV2?.procDepth ?? 0) !== 0)
        return 0;
    const bonus = mindPassiveBonusesV2(source, now).conditionalArmorPenPct;
    if (bonus <= 0)
        return 0;
    const pressured = mindMarkCountV2(target) > 0
        || Math.max(0, Number(target?.pendingSetFlagsV117?.mindRecoveryPenaltyPct ?? 0)) > 0
        || Math.max(0, Number(action?.battleDaoV2?.mindMarksBefore ?? 0)) > 0;
    return pressured ? bonus : 0;
}

export function mindGuardFiveStatMultiplierV2(stats, skill) {
    if (skill?.id !== 'skill.dao.mind.guard' || !skill?.fiveStatScalingV5)
        return 1;
    const primary = stats?.primaryStatsV5;
    if (!primary)
        return 1;
    const scaling = skill.fiveStatScalingV5;
    const weighted = Math.max(0, Number(primary.body) || 0) * Math.max(0, Number(scaling.body) || 0)
        + Math.max(0, Number(primary.sense) || 0) * Math.max(0, Number(scaling.sense) || 0);
    const normalized = weighted / Math.max(0.0001, Number(skill.fiveStatBaselineCoefficientV5) || 1);
    const powerAnchor = Math.max(0.0001, Number(primary.power) || 0);
    return Math.max(0, normalized / powerAnchor);
}

export function mindMarkCountV2(target) {
    return Math.max(0, Math.min(MIND_V2_MARK_CAP, Math.floor(target?.marks?.[MIND_V2_MARK] ?? 0)));
}

export function addMindMarksV2(source, target, amount) {
    if (!isMainMind(source) || !target?.marks)
        return 0;
    const before = mindMarkCountV2(target);
    const after = Math.min(MIND_V2_MARK_CAP, before + Math.max(0, Math.floor(amount)));
    target.marks[MIND_V2_MARK] = after;
    return after - before;
}

export function consumeMindMarksV2(source, target, maxConsume = MIND_V2_MARK_CAP) {
    if (!isMainMind(source) || !target?.marks)
        return { consumed: 0, before: mindMarkCountV2(target), after: mindMarkCountV2(target) };
    const before = mindMarkCountV2(target);
    const consumed = Math.min(before, Math.max(0, Math.floor(maxConsume)));
    const after = before - consumed;
    target.marks[MIND_V2_MARK] = after;
    return { consumed, before, after };
}

export function addMindPassiveStacksV2(source, amount, now) {
    if (!isMainMind(source) || !hasMindPassive(source, 1))
        return 0;
    const stack = source.battleDaoStateV2?.mind?.stack;
    if (!stack)
        return 0;
    const before = Math.max(0, Math.floor(stack.stacks ?? 0));
    stack.stacks = Math.min(Math.max(1, Math.floor(stack.cap ?? 20)), before + Math.max(0, Math.floor(amount)));
    const gained = stack.stacks - before;
    if (gained > 0) {
        stack.expiresAt = now + Math.max(.1, Number(stack.durationSeconds ?? 12));
        stack.nextDecayAt = undefined;
    }
    return gained;
}

export function gainMindPassiveStackV2(source, skill, now, chance = () => false) {
    if (!isMainMind(source, skill) || !hasMindPassive(source, 1))
        return 0;
    const slot = skillSlotClassV117(skill);
    if (slot !== 'active' && slot !== 'ultimate')
        return 0;
    const stack = source.battleDaoStateV2?.mind?.stack;
    if (!stack)
        return 0;
    const before = Math.max(0, Math.floor(stack.stacks ?? 0));
    let requested = slot === 'ultimate' ? 2 : 1;
    if (hasMindPassive(source, 2) && chance(scaleLevel(mindPassiveLevel(source, 2), 10, 30)))
        requested += 1;
    stack.stacks = Math.min(Math.max(1, Math.floor(stack.cap ?? 20)), before + requested);
    const gained = stack.stacks - before;
    if (gained > 0) {
        stack.expiresAt = now + Math.max(.1, Number(stack.durationSeconds ?? 12));
        stack.nextDecayAt = undefined;
    }
    if (stack.stacks >= Math.max(1, Math.floor(stack.cap ?? 20)) && hasMindPassive(source, 8)) {
        const hold = scaleLevel(mindPassiveLevel(source, 8), 1, 2);
        stack.expiresAt = Math.max(Number(stack.expiresAt ?? 0), now + hold);
        stack.nextDecayAt = undefined;
    }
    return gained;
}

export function prepareMindMasteryActionV2(source, target, skill, action, now = 0) {
    if (!isMainMind(source, skill) || !action?.battleDaoV2)
        return action;
    const tier = mindMasteryTierV2(source, skill);
    const v2 = action.battleDaoV2;
    const core = mindCoreV2(source);
    const slot = skillSlotClassV117(skill);
    v2.mindMasteryTier = tier;
    v2.mindTargetBrokenBefore = Boolean(target?.breakDebuffUntil && target.breakDebuffUntil > now);

    if (skill.id === 'skill.dao.mind.basic') {
        const next = Math.max(0, Math.floor(core?.basicActionCounter ?? 0)) + 1;
        v2.mindBasicCounterNext = next;
        v2.mindBasicExtremeSecondHit = tier >= 1000 && next % 3 === 0;
        if (tier >= 500 && core?.nextBasicDamageBonusReady) {
            action.effectBonusPct += 20;
            v2.mindConsumeBasicEchoBoost = true;
        }
    }
    if ((skill.id === 'skill.dao.mind.mark' || skill.id === 'skill.dao.mind.split') && tier >= 100)
        action.effectBonusPct += 15;
    if (skill.id === 'skill.dao.mind.interfere' && tier >= 1000)
        action.breakBonusPct += 25;
    if (skill.id === 'skill.dao.mind.burst' && tier >= 250 && v2.mindTargetBrokenBefore)
        action.effectBonusPct += 20;

    if (slot === 'active' && (core?.guardEmpowerUntil ?? 0) > now) {
        action.effectBonusPct += 10;
        v2.mindConsumeGuardEmpower = true;
    }

    if (skill.id === 'skill.dao.mind.basic' && tier >= 750)
        action.recoveryMultiplier *= .95 / 1.10;
    else if (skill.id === 'skill.dao.mind.mark' && tier >= 750)
        action.recoveryMultiplier *= .55 / .75;
    else if (skill.id === 'skill.dao.mind.split' && tier >= 750)
        action.recoveryMultiplier *= .60 / .80;
    else if (skill.id === 'skill.dao.mind.interfere' && tier >= 750)
        action.recoveryMultiplier *= .60 / .80;
    else if (skill.id === 'skill.dao.mind.guard' && tier >= 750)
        action.recoveryMultiplier *= .60 / .85;
    else if (skill.id === 'skill.dao.mind.chase') {
        if (tier >= 100)
            action.castTimeMultiplier *= .65 / .80;
        if (tier >= 750)
            action.recoveryMultiplier *= .55 / .75;
    }
    else if (skill.id === 'skill.dao.mind.burst' && tier >= 750)
        action.recoveryMultiplier *= .65 / .85;
    else if (skill.id === 'skill.dao.mind.observe') {
        if (tier >= 100)
            action.channelDurationMultiplierV118 = Math.max(.1, Number(action.channelDurationMultiplierV118 ?? 1)) * (2.2 / 2.5);
        if (tier >= 750)
            action.recoveryMultiplier *= .70 / .90;
        if (tier >= 1000)
            v2.mindPreActionSnapshot = cloneStoredSnapshot(core?.snapshot);
    }
    else if (skill.id === 'skill.dao.mind.flow') {
        if (tier >= 750)
            action.castTimeMultiplier *= .60 / .80;
    }
    else if (skill.id === 'skill.dao.mind.ultimate') {
        if (tier >= 750)
            action.recoveryMultiplier *= 1.15 / 1.50;
        if (tier >= 250)
            v2.mindPreActionSnapshot = cloneStoredSnapshot(core?.snapshot);
    }
    return action;
}

export function mindMasteryExtraDirectHitsV2(source, skill, action) {
    if (!isMainMind(source, skill) || !action?.battleDaoV2 || (action.battleDaoV2.procDepth ?? 0) !== 0)
        return [];
    const v2 = action.battleDaoV2;
    if (v2.mindMasteryExtraHitsIssued)
        return [];
    const tier = mindMasteryTierV2(source, skill);
    let hits = [];
    if (skill.id === 'skill.dao.mind.basic' && v2.mindBasicExtremeSecondHit)
        hits = [{ coefficient: .60, breakDamagePct: 0, armorPenBonusPct: 15 }];
    else if (skill.id === 'skill.dao.mind.mark' && tier >= 1000)
        hits = [{ coefficient: .70, breakDamagePct: 0, armorPenBonusPct: 0 }];
    else if (skill.id === 'skill.dao.mind.split') {
        if (tier >= 1000)
            hits = [{ coefficient: .55, breakDamagePct: 0, armorPenBonusPct: 0 }, { coefficient: .55, breakDamagePct: 0, armorPenBonusPct: 0 }];
        else if (tier >= 250)
            hits = [{ coefficient: .45, breakDamagePct: 0, armorPenBonusPct: 0 }];
    }
    else if (skill.id === 'skill.dao.mind.chase' && tier >= 1000)
        hits = [{ coefficient: .80, breakDamagePct: 0, armorPenBonusPct: 0 }];
    if (hits.length > 0)
        v2.mindMasteryExtraHitsIssued = true;
    return hits;
}

export function mindMasteryShieldMultiplierV2(source, skill) {
    if (!isMainMind(source, skill) || skill?.id !== 'skill.dao.mind.guard')
        return 1;
    const tier = mindMasteryTierV2(source, skill);
    if (tier >= 1000)
        return 1.45;
    if (tier >= 100)
        return 1.20;
    return 1;
}

function snapshotActionEligible(source, skill, action) {
    return isMainMind(source, skill)
        && skillSlotClassV117(skill) === 'active'
        && (action?.battleDaoV2?.procDepth ?? 0) === 0;
}

function packetStore(action) {
    const v2 = action?.battleDaoV2;
    if (!v2)
        return undefined;
    return v2.mindSnapshotPackets ?? (v2.mindSnapshotPackets = []);
}

export function captureMindDamagePacketV2(source, skill, action, ctx) {
    if (!snapshotActionEligible(source, skill, action))
        return;
    const store = packetStore(action);
    if (!store)
        return;
    const effectMultiplier = 1 + Math.max(0, Number(ctx.runtimeEffectBonusPct ?? 0)) / 100;
    const breakMultiplier = 1 + Math.max(0, Number(ctx.runtimeBreakBonusPct ?? 0)) / 100;
    let coefficient = Math.max(0, Number(ctx.coefficient ?? 0)) * effectMultiplier;
    let breakDamagePct = Math.max(0, Number(ctx.breakDamagePct ?? 0)) * breakMultiplier;
    const tier = mindMasteryTierV2(source, skill);
    if (skill.id === 'skill.dao.mind.mark' && tier >= 250)
        coefficient *= 1.10;
    if (skill.id === 'skill.dao.mind.burst' && tier >= 1000) {
        coefficient *= MIND_M5_BURST_SNAPSHOT_RETENTION;
        breakDamagePct *= MIND_M5_BURST_SNAPSHOT_RETENTION;
    }
    store.push({
        type: 'damage',
        coefficient,
        breakDamagePct,
        canCrit: ctx.canCrit !== false,
        canDodge: ctx.canDodge !== false,
        canHeart: ctx.canHeart !== false,
    });
}

export function captureMindShieldPacketV2(source, skill, action, effect, runtimeMultiplier = 1) {
    if (!snapshotActionEligible(source, skill, action))
        return;
    const store = packetStore(action);
    if (!store)
        return;
    store.push({
        type: 'shield',
        capacity: Math.max(0, Number(effect.capacity ?? 0)) * Math.max(0, runtimeMultiplier),
        maxHpPct: Math.max(0, Number(effect.maxHpPct ?? 0)) * Math.max(0, runtimeMultiplier),
        attackCoefficient: Math.max(0, Number(effect.attackCoefficient ?? 0)) * Math.max(0, runtimeMultiplier),
        stability: Math.max(0, Number(effect.stability ?? 100)),
        duration: Math.max(0, Number(effect.duration ?? 0)),
    });
}

export function captureMindHealPacketV2(source, skill, action, effect, runtimeMultiplier = 1) {
    if (!snapshotActionEligible(source, skill, action))
        return;
    const store = packetStore(action);
    if (!store)
        return;
    store.push({
        type: 'heal',
        flat: Math.max(0, Number(effect.flat ?? 0)) * Math.max(0, runtimeMultiplier),
        maxHpPct: Math.max(0, Number(effect.maxHpPct ?? 0)) * Math.max(0, runtimeMultiplier),
        attackCoefficient: Math.max(0, Number(effect.attackCoefficient ?? 0)) * Math.max(0, runtimeMultiplier),
        target: effect.target === 'target' ? 'target' : 'self',
    });
}

export function resolveMindInterfereV2(source, target, skill, action, now) {
    if (!isMainMind(source, skill) || skill?.daoRuntimeV118?.signature !== 'mindInterfere')
        return { consumed: 0, targetCastDelaySeconds: 0, mentalStaggerSeconds: 0, masteryStackGain: 0 };
    const spent = consumeMindMarksV2(source, target, 3);
    if (action?.battleDaoV2) {
        action.battleDaoV2.mindMarksBefore = spent.before;
        action.battleDaoV2.mindMarksSpent = spent.consumed;
    }
    if (spent.consumed <= 0)
        return { consumed: 0, targetCastDelaySeconds: 0, mentalStaggerSeconds: 0, masteryStackGain: 0 };
    const tier = mindMasteryTierV2(source, skill);
    const passive = mindPassiveBonusesV2(source, now);
    let potencyPct = spent.consumed * 6 * (1 + passive.interferencePct / 100);
    if (tier >= 100)
        potencyPct *= 1.15;
    if (target?.tags?.includes('Boss'))
        potencyPct *= .5;
    const delay = Math.min(1.5, potencyPct / 100 * 2.5);
    target.pendingSetFlagsV117 ??= {};
    target.pendingSetFlagsV117['mindRecoveryPenaltyPct'] = Math.max(target.pendingSetFlagsV117['mindRecoveryPenaltyPct'] ?? 0, potencyPct);
    const acting = Boolean(target.casting || target.channeling);
    const masteryStackGain = tier >= 250 && spent.consumed >= 2 ? addMindPassiveStacksV2(source, 1, now) : 0;
    return {
        consumed: spent.consumed,
        targetCastDelaySeconds: delay,
        mentalStaggerSeconds: spent.consumed >= 3 && acting ? (tier >= 1000 ? .50 : .35) : 0,
        masteryStackGain,
    };
}

export function resolveMindConsumeDamageV2(source, target, skill, effect, action) {
    if (!isMainMind(source, skill) || effect?.mark !== MIND_V2_MARK)
        return undefined;
    const spent = consumeMindMarksV2(source, target, Math.min(MIND_V2_MARK_CAP, effect.maxConsume ?? MIND_V2_MARK_CAP));
    if (action?.battleDaoV2) {
        action.battleDaoV2.mindMarksBefore = spent.before;
        action.battleDaoV2.mindMarksSpent = spent.consumed;
    }
    const tier = mindMasteryTierV2(source, skill);
    let baseCoefficient = Math.max(0, Number(effect.baseCoefficient ?? 0));
    if (skill.id === 'skill.dao.mind.ultimate' && tier >= 100)
        baseCoefficient *= 1.15;
    let coefficient = baseCoefficient + spent.consumed * Math.max(0, Number(effect.coefficientPerStack ?? 0));
    let breakDamagePct = spent.consumed * Math.max(0, Number(effect.breakDamagePctPerStack ?? effect.stabilityDamagePerStack ?? 0));
    if (skill.id === 'skill.dao.mind.burst') {
        if (tier >= 100)
            coefficient += spent.consumed * .08;
        if (tier >= 1000) {
            coefficient *= 1.40;
            breakDamagePct *= 1.30;
        }
    }
    return { ...spent, coefficient, breakDamagePct };
}

export function resolveMindUltimateInterferenceV2(source, target, skill, tx, now) {
    if (!isMainMind(source, skill) || skill?.id !== 'skill.dao.mind.ultimate' || (tx?.consumed ?? 0) < 3)
        return { targetCastDelaySeconds: 0, mentalPulseSeconds: 0, potencyPct: 0 };
    const passive = mindPassiveBonusesV2(source, now);
    let potencyPct = Math.max(0, Number(tx.consumed ?? 0)) * 6 * (1 + passive.interferencePct / 100);
    if (target?.tags?.includes('Boss'))
        potencyPct *= .5;
    const delay = Math.min(1.5, potencyPct / 100 * 2.5);
    target.pendingSetFlagsV117 ??= {};
    target.pendingSetFlagsV117['mindRecoveryPenaltyPct'] = Math.max(target.pendingSetFlagsV117['mindRecoveryPenaltyPct'] ?? 0, potencyPct);
    return {
        targetCastDelaySeconds: delay,
        mentalPulseSeconds: (tx.consumed ?? 0) >= 5 ? .60 : 0,
        potencyPct,
    };
}

export function mindObserveProgressV2(source, target, skill, action, resolvedTicks, totalTicks) {
    if (!isMainMind(source, skill) || skill?.id !== 'skill.dao.mind.observe' || !action?.battleDaoV2)
        return 0;
    const total = Math.max(1, Math.floor(totalTicks));
    const ticks = Math.max(0, Math.min(total, Math.floor(resolvedTicks)));
    const earned = Math.floor(3 * ticks / total);
    const before = Math.max(0, Math.floor(action.battleDaoV2.mindObserveEarnedMarks ?? 0));
    const delta = Math.max(0, earned - before);
    action.battleDaoV2.mindObserveResolvedTicks = ticks;
    action.battleDaoV2.mindObserveEarnedMarks = earned;
    return delta > 0 ? addMindMarksV2(source, target, delta) : 0;
}

function cloneSnapshotPackets(action) {
    return (action?.battleDaoV2?.mindSnapshotPackets ?? [])
        .filter(packet => ['damage', 'shield', 'heal'].includes(packet?.type))
        .map(packet => ({ ...packet }));
}

function echoStateBonusV2(source, now) {
    const core = mindCoreV2(source);
    let bonus = mindPassiveBonusesV2(source, now).echoCoefficientBonus;
    if ((core?.flowUntil ?? 0) > now && mindMasteryTierV2(source, 'skill.dao.mind.flow') >= 500)
        bonus += .10;
    if ((core?.guardEchoBuffUntil ?? 0) > now && mindMasteryTierV2(source, 'skill.dao.mind.guard') >= 1000)
        bonus += .10;
    if ((core?.ultimateDomainUntil ?? 0) > now && mindMasteryTierV2(source, 'skill.dao.mind.ultimate') >= 1000)
        bonus += .20;
    return bonus;
}

function baseEchoCoefficientForSkillV2(source, skillId, fallback) {
    let coefficient = Math.max(0, Number(fallback ?? MIND_V2_BASE_ECHO_COEFFICIENT));
    const tier = mindMasteryTierV2(source, skillId);
    if (skillId === 'skill.dao.mind.split' && tier >= 500)
        coefficient = Math.max(coefficient, .45);
    if (skillId === 'skill.dao.mind.chase' && tier >= 1000)
        coefficient = Math.max(coefficient, .50);
    return coefficient;
}

function buildEchoV2(source, snapshot, now, baseCoefficient = MIND_V2_BASE_ECHO_COEFFICIENT, delayOverride) {
    const core = mindCoreV2(source);
    const safe = cloneStoredSnapshot(snapshot);
    if (!safe || safe.packets.length <= 0)
        return undefined;
    const packets = safe.packets.map(packet => ({ ...packet }));
    if (safe.sourceSkillId === 'skill.dao.mind.mark' && mindMasteryTierV2(source, safe.sourceSkillId) >= 500)
        packets.push({ type: 'damage', coefficient: .40, breakDamagePct: 0, canCrit: true, canDodge: true, canHeart: true });
    const nextBonus = Math.max(0, Number(core?.nextEchoBonusPct ?? 0));
    const coefficient = Math.min(.70, baseEchoCoefficientForSkillV2(source, safe.sourceSkillId, baseCoefficient) + echoStateBonusV2(source, now) + nextBonus);
    return {
        delay: delayOverride ?? MIND_V2_ECHO_DELAY_SECONDS,
        coefficient,
        sourceSkillId: safe.sourceSkillId,
        targetId: safe.targetId,
        payloadId: safe.payloadId,
        packets,
        consumeNextEchoBonus: nextBonus > 0,
    };
}

export function mindMasteryEchoBreakBonusPctV2(source, target, sourceSkillId) {
    let bonus = 0;
    if (sourceSkillId === 'skill.dao.mind.chase' && mindMasteryTierV2(source, sourceSkillId) >= 500)
        bonus += 20;
    if (mindMasteryTierV2(source, 'skill.dao.mind.interfere') >= 500
        && Math.max(0, Number(target?.pendingSetFlagsV117?.mindRecoveryPenaltyPct ?? 0)) > 0)
        bonus += 20;
    return bonus;
}

export function mindEchoBreakBonusV2(source, target, sourceSkillId, now) {
    return mindPassiveBonusesV2(source, now).echoBreakPct + mindMasteryEchoBreakBonusPctV2(source, target, sourceSkillId);
}

export function markMindEchoScheduledV2(source, echo) {
    if (!echo?.consumeNextEchoBonus)
        return;
    const core = mindCoreV2(source);
    if (core)
        core.nextEchoBonusPct = 0;
}

export function mindEchoResolvedV2(source) {
    const core = mindCoreV2(source);
    if (core && mindMasteryTierV2(source, 'skill.dao.mind.basic') >= 500)
        core.nextBasicDamageBonusReady = true;
}

export function mindGuardShieldBreakV2(owner, now) {
    if (!isMainMind(owner) || mindMasteryTierV2(owner, 'skill.dao.mind.guard') < 250)
        return 0;
    return addMindPassiveStacksV2(owner, 1, now);
}

export function mindMasteryBasicFollowUpV2(source, skill, action, chance = () => false) {
    if (!isMainMind(source, skill) || skill?.id !== 'skill.dao.mind.basic' || !action?.battleDaoV2)
        return undefined;
    const tier = mindMasteryTierV2(source, skill);
    if (tier < 100 || action.battleDaoV2.mindBasicExtremeSecondHit || (action.battleDaoV2.directDamagingHitCount ?? 0) <= 0 || !chance(15))
        return undefined;
    return {
        delay: .05,
        coefficient: .50,
        breakDamagePct: 0,
        gaugeGain: tier >= 250 ? 1 : 0,
    };
}

export function finishMindRootV2(source, target, skill, action, now) {
    const out = { notices: [], echo: undefined, flowBonusMarkGain: 0, flowBonusStackGain: 0, masteryStackGain: 0 };
    if (!isMainMind(source, skill) || action?.battleDaoV2?.mindInvalidSpend)
        return out;
    const core = mindCoreV2(source);
    const v2 = action?.battleDaoV2;
    if (!core || !v2)
        return out;
    const tier = mindMasteryTierV2(source, skill);
    const slot = skillSlotClassV117(skill);

    if (slot === 'basic') {
        core.basicActionCounter = Math.max(0, Math.floor(v2.mindBasicCounterNext ?? ((core.basicActionCounter ?? 0) + 1)));
        if (v2.mindConsumeBasicEchoBoost)
            core.nextBasicDamageBonusReady = false;
        return out;
    }

    if (slot === 'ultimate') {
        if (tier >= 1000) {
            core.ultimateDomainUntil = now + MIND_V2_ULTIMATE_DOMAIN_SECONDS;
            out.notices.push({ message: `${source.name} mở Tịch Chiếu Niệm Vực trong ${MIND_V2_ULTIMATE_DOMAIN_SECONDS}s.`, data: { mindUltimateDomainUntil: core.ultimateDomainUntil } });
        }
        if (tier >= 250) {
            const pre = v2.mindPreActionSnapshot ?? cloneStoredSnapshot(core.snapshot);
            out.echo = buildEchoV2(source, pre, now, .50);
        }
        return out;
    }

    if (slot !== 'active')
        return out;

    if (v2.mindConsumeGuardEmpower)
        core.guardEmpowerUntil = 0;

    let observeImmediateEcho;
    if (skill.id === 'skill.dao.mind.observe' && v2.mindObserveCompleted) {
        if (tier >= 250) {
            out.masteryStackGain += addMindPassiveStacksV2(source, 2, now);
        }
        if (tier >= 500)
            core.nextEchoBonusPct = Math.max(Number(core.nextEchoBonusPct ?? 0), .10);
        if (tier >= 1000)
            observeImmediateEcho = buildEchoV2(source, v2.mindPreActionSnapshot, now, MIND_V2_BASE_ECHO_COEFFICIENT, 0);
    }

    if (skill.id === 'skill.dao.mind.interfere')
        out.masteryStackGain += Math.max(0, Number(v2.mindInterfereResult?.masteryStackGain ?? 0));

    if (skill.id === 'skill.dao.mind.guard') {
        if (tier >= 500)
            core.guardEmpowerUntil = now + 4;
        if (tier >= 1000)
            core.guardEchoBuffUntil = now + 3;
    }

    const opensFlow = skill.id === 'skill.dao.mind.flow';
    if (opensFlow) {
        const duration = tier >= 100 ? MIND_V2_FLOW_MASTERY_SECONDS : MIND_V2_FLOW_SECONDS;
        core.flowUntil = now + duration;
        core.flowEligibleActiveCount = 0;
        out.notices.push({ message: `${source.name} mở Vạn Niệm Phân Lưu trong ${duration}s.`, data: { mindFlowUntil: core.flowUntil } });
    }

    const baseEchoInterval = Math.max(1, Number(core.echoEvery ?? 3));
    const ultimateDomainCadence = (core.ultimateDomainUntil ?? 0) > now
        && mindMasteryTierV2(source, 'skill.dao.mind.ultimate') >= 1000;
    const echoInterval = ultimateDomainCadence ? baseEchoInterval * .75 : baseEchoInterval;
    core.eligibleActiveCount = Math.max(0, Number(core.eligibleActiveCount ?? 0)) + 1;
    let flowEcho;
    if (!opensFlow && (core.flowUntil ?? 0) > now) {
        core.flowEligibleActiveCount = Math.max(0, Math.floor(core.flowEligibleActiveCount ?? 0)) + 1;
        const flowTier = mindMasteryTierV2(source, 'skill.dao.mind.flow');
        if (core.flowEligibleActiveCount % 3 === 0) {
            out.flowBonusMarkGain = addMindMarksV2(source, target, 1);
            if (flowTier >= 250)
                out.flowBonusStackGain = addMindPassiveStacksV2(source, 1, now);
        }
    }

    const packets = cloneSnapshotPackets(action);
    core.snapshot = {
        sourceSkillId: skill.id,
        targetId: target?.id,
        createdAt: now,
        payloadId: `${v2.rootActionId ?? skill.id}:snapshot`,
        procDepth: 0,
        packets,
    };

    if (!opensFlow && (core.flowUntil ?? 0) > now) {
        const flowTier = mindMasteryTierV2(source, 'skill.dao.mind.flow');
        if (flowTier >= 1000 && core.flowEligibleActiveCount % 2 === 0)
            flowEcho = buildEchoV2(source, core.snapshot, now, .25);
    }

    let ordinaryEcho;
    if (core.eligibleActiveCount >= echoInterval) {
        core.eligibleActiveCount = ultimateDomainCadence
            ? Math.max(0, core.eligibleActiveCount - echoInterval)
            : 0;
        ordinaryEcho = buildEchoV2(source, core.snapshot, now, Number(core.echoCoefficient ?? MIND_V2_BASE_ECHO_COEFFICIENT));
    }

    out.echo = observeImmediateEcho ?? ordinaryEcho ?? flowEcho;
    v2.mindMasteryStackGainResolved = Math.max(0, Number(out.masteryStackGain ?? 0)) + Math.max(0, Number(out.flowBonusStackGain ?? 0));
    return out;
}
