import { skillRuntimeV117, skillSlotClassV117 } from './skill-runtime-v117.js';

export const MIND_V2_MARK = 'Thần Ấn';
export const MIND_V2_MARK_CAP = 5;
export const MIND_V2_ECHO_DELAY_SECONDS = .6;
export const MIND_V2_BASE_ECHO_COEFFICIENT = .35;
export const MIND_V2_FLOW_SECONDS = 5;

function isMainMind(entity, skill) {
    return entity?.combatBuildV117?.battleDaoV2Enabled === true
        && entity?.combatBuildV117?.mainDaoId === 'mind'
        && (!skill || skillRuntimeV117(skill).daoBinding === 'mind');
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
    store.push({
        type: 'damage',
        coefficient: Math.max(0, Number(ctx.coefficient ?? 0)) * effectMultiplier,
        breakDamagePct: Math.max(0, Number(ctx.breakDamagePct ?? 0)) * breakMultiplier,
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
        return { consumed: 0, targetCastDelaySeconds: 0, mentalStaggerSeconds: 0 };
    const spent = consumeMindMarksV2(source, target, 3);
    if (action?.battleDaoV2)
        action.battleDaoV2.mindMarksSpent = spent.consumed;
    if (spent.consumed <= 0)
        return { consumed: 0, targetCastDelaySeconds: 0, mentalStaggerSeconds: 0 };
    let potencyPct = spent.consumed * 6;
    if (target?.tags?.includes('Boss'))
        potencyPct *= .5;
    const delay = Math.min(1.5, potencyPct / 100 * 2.5);
    target.pendingSetFlagsV117 ??= {};
    target.pendingSetFlagsV117['mindRecoveryPenaltyPct'] = Math.max(target.pendingSetFlagsV117['mindRecoveryPenaltyPct'] ?? 0, potencyPct);
    const acting = Boolean(target.casting || target.channeling);
    return {
        consumed: spent.consumed,
        targetCastDelaySeconds: delay,
        mentalStaggerSeconds: spent.consumed >= 3 && acting ? .35 : 0,
    };
}

export function resolveMindConsumeDamageV2(source, target, skill, effect, action) {
    if (!isMainMind(source, skill) || effect?.mark !== MIND_V2_MARK)
        return undefined;
    const spent = consumeMindMarksV2(source, target, Math.min(MIND_V2_MARK_CAP, effect.maxConsume ?? MIND_V2_MARK_CAP));
    if (action?.battleDaoV2)
        action.battleDaoV2.mindMarksSpent = spent.consumed;
    const coefficient = Math.max(0, Number(effect.baseCoefficient ?? 0))
        + spent.consumed * Math.max(0, Number(effect.coefficientPerStack ?? 0));
    const breakDamagePct = spent.consumed * Math.max(0, Number(effect.breakDamagePctPerStack ?? effect.stabilityDamagePerStack ?? 0));
    return { ...spent, coefficient, breakDamagePct };
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

export function finishMindRootV2(source, target, skill, action, now) {
    const out = { notices: [], echo: undefined, flowBonusMarkGain: 0 };
    if (!isMainMind(source, skill))
        return out;
    const core = source.battleDaoStateV2?.mind?.core;
    if (!core)
        return out;
    const opensFlow = skill.id === 'skill.dao.mind.flow';
    if (skillSlotClassV117(skill) !== 'active')
        return out;
    core.eligibleActiveCount = Math.max(0, Math.floor(core.eligibleActiveCount ?? 0)) + 1;
    if (!opensFlow && (core.flowUntil ?? 0) > now) {
        core.flowEligibleActiveCount = Math.max(0, Math.floor(core.flowEligibleActiveCount ?? 0)) + 1;
        if (core.flowEligibleActiveCount >= 3) {
            core.flowEligibleActiveCount = 0;
            out.flowBonusMarkGain = addMindMarksV2(source, target, 1);
        }
    }
    const packets = cloneSnapshotPackets(action);
    core.snapshot = {
        sourceSkillId: skill.id,
        createdAt: now,
        payloadId: `${action?.battleDaoV2?.rootActionId ?? skill.id}:snapshot`,
        procDepth: 0,
        packets,
    };
    if (core.eligibleActiveCount >= Math.max(1, Math.floor(core.echoEvery ?? 3))) {
        core.eligibleActiveCount = 0;
        if (packets.length > 0) {
            out.echo = {
                delay: MIND_V2_ECHO_DELAY_SECONDS,
                coefficient: Math.min(.70, Math.max(0, Number(core.echoCoefficient ?? MIND_V2_BASE_ECHO_COEFFICIENT))),
                sourceSkillId: skill.id,
                payloadId: core.snapshot.payloadId,
                packets: packets.map(packet => ({ ...packet })),
            };
        }
    }
    if (opensFlow) {
        core.flowUntil = now + MIND_V2_FLOW_SECONDS;
        core.flowEligibleActiveCount = 0;
        out.notices.push({ message: `${source.name} mở Vạn Niệm Phân Lưu trong ${MIND_V2_FLOW_SECONDS}s.`, data: { mindFlowUntil: core.flowUntil } });
    }
    return out;
}
