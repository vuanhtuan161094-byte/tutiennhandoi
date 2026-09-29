export const MIND_SEAL_MARK_V2 = 'Thần Ấn';
export const MIND_SEAL_CAP_V2 = 5;

function isMainMindV2(source) {
    return source?.combatBuildV117?.battleDaoV2Enabled === true
        && source?.combatBuildV117?.mainDaoId === 'mind';
}

function normalizedMindSealCount(target) {
    const raw = Number(target?.marks?.[MIND_SEAL_MARK_V2] ?? 0);
    if (!Number.isFinite(raw))
        return 0;
    return Math.max(0, Math.min(MIND_SEAL_CAP_V2, Math.floor(raw)));
}

export function mindSealCountV2(target) {
    return normalizedMindSealCount(target);
}

export function addMindSealV2(source, target, amount) {
    const before = normalizedMindSealCount(target);
    if (!isMainMindV2(source) || !target?.marks)
        return { before, gained: 0, after: before, cap: MIND_SEAL_CAP_V2 };
    const requested = Math.max(0, Math.floor(Number(amount) || 0));
    const after = Math.min(MIND_SEAL_CAP_V2, before + requested);
    target.marks[MIND_SEAL_MARK_V2] = after;
    return { before, gained: after - before, after, cap: MIND_SEAL_CAP_V2 };
}

export function consumeMindSealV2(source, target, maxConsume = MIND_SEAL_CAP_V2) {
    const before = normalizedMindSealCount(target);
    if (!isMainMindV2(source) || !target?.marks)
        return { before, consumed: 0, after: before, cap: MIND_SEAL_CAP_V2 };
    const limit = Math.max(0, Math.floor(Number(maxConsume) || 0));
    const consumed = Math.min(before, limit);
    const after = before - consumed;
    target.marks[MIND_SEAL_MARK_V2] = after;
    return { before, consumed, after, cap: MIND_SEAL_CAP_V2 };
}
