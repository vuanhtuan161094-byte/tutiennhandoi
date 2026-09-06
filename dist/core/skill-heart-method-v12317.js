export const SKILL_HEART_SCHEMA_V12317 = 'skill-heart-method.v12317';
export const SKILL_GRADE_ORDER_V12317 = ['mundane', 'spirit', 'mystic', 'earth', 'heaven', 'immortal', 'extreme', 'breaker'];
export const SKILL_GRADE_LABEL_V12317 = { mundane: 'Phàm', spirit: 'Linh', mystic: 'Huyền', earth: 'Địa', heaven: 'Thiên', immortal: 'Tiên', extreme: 'Cực', breaker: 'Phá' };
const SKILL_GRADE_EFFECT_BONUS_PCT = { mundane: 0, spirit: 5, mystic: 11, earth: 18, heaven: 26, immortal: 35, extreme: 45, breaker: 56 };
const SKILL_ADVANCE_SPECIFIC_COST = [16, 28, 45, 70, 105, 155, 225];
export const SKILL_LEVEL_MAX_V12317 = 20;
export const HEART_METHOD_LEVEL_MAX_V12317 = 20;
// V129: Phụ Đạo keeps 100% authored passive mechanics; only the generic always-on core-stat package is bounded so it cannot dominate Dao choice.
export const HEART_METHOD_STATIC_STAT_SCALE_V129 = 0.25;
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function progression(foundation) { return foundation.progressionV125; }
export function ensureSkillHeartProgressionV12317(p) {
    p.skillLevelsV12317 ??= {};
    p.skillGradesV12317 ??= {};
    p.skillGenericFragmentsV12317 = Math.max(0, Math.floor(p.skillGenericFragmentsV12317 ?? 0));
    p.skillSpecificFragmentsV12317 ??= {};
    p.heartMethodGradesV12317 ??= {};
    return p;
}
export function skillLevelV12317(foundation, skillId) {
    const p = ensureSkillHeartProgressionV12317(progression(foundation));
    return clamp(Math.floor(p.skillLevelsV12317[skillId] ?? 1), 1, SKILL_LEVEL_MAX_V12317);
}
export function skillGradeV12317(foundation, skillId) {
    const p = ensureSkillHeartProgressionV12317(progression(foundation));
    const raw = p.skillGradesV12317[skillId];
    return SKILL_GRADE_ORDER_V12317.includes(raw) ? raw : 'mundane';
}
export function heartMethodGradeV12317(foundation, passiveId) {
    const p = ensureSkillHeartProgressionV12317(progression(foundation));
    const raw = p.heartMethodGradesV12317[passiveId];
    return SKILL_GRADE_ORDER_V12317.includes(raw) ? raw : 'mundane';
}
export function skillLevelCostV12317(level) { const lv = clamp(Math.floor(level), 1, SKILL_LEVEL_MAX_V12317 - 1); return Math.ceil(8 + lv * 2.4 + Math.pow(lv, 1.32) * .9); }
export function skillAdvanceCostV12317(grade) { const idx = SKILL_GRADE_ORDER_V12317.indexOf(grade); return idx < 0 || idx >= SKILL_ADVANCE_SPECIFIC_COST.length ? Infinity : SKILL_ADVANCE_SPECIFIC_COST[idx]; }
export function skillProgressEffectBonusFromRuntimeV12317(level, grade) { const lv = clamp(Math.floor(level || 1), 1, SKILL_LEVEL_MAX_V12317); const g = SKILL_GRADE_ORDER_V12317.includes(grade) ? grade : 'mundane'; return (lv - 1) * 1.5 + SKILL_GRADE_EFFECT_BONUS_PCT[g]; }
export function skillProgressEffectBonusPctV12317(foundation, skillId) {
    return skillProgressEffectBonusFromRuntimeV12317(skillLevelV12317(foundation, skillId), skillGradeV12317(foundation, skillId));
}
export function grantSkillGenericFragmentsV12317(foundation, amount) { const p = ensureSkillHeartProgressionV12317(progression(foundation)); const gain = Math.max(0, Math.floor(amount)); p.skillGenericFragmentsV12317 = (p.skillGenericFragmentsV12317 ?? 0) + gain; return gain; }
export function grantSkillSpecificFragmentsV12317(foundation, skillId, amount) { const p = ensureSkillHeartProgressionV12317(progression(foundation)); const gain = Math.max(0, Math.floor(amount)); p.skillSpecificFragmentsV12317[skillId] = (p.skillSpecificFragmentsV12317[skillId] ?? 0) + gain; return gain; }
export function upgradeSkillLevelV12317(foundation, skillId) { const p = ensureSkillHeartProgressionV12317(progression(foundation)); const before = skillLevelV12317(foundation, skillId); if (before >= SKILL_LEVEL_MAX_V12317)
    throw new Error('Kỹ năng đã đạt Lv20.'); const cost = skillLevelCostV12317(before); const have = p.skillGenericFragmentsV12317 ?? 0; if (have < cost)
    throw new Error(`Thiếu Mảnh Kỹ Năng: cần ${cost}, hiện có ${have}.`); p.skillGenericFragmentsV12317 = have - cost; p.skillLevelsV12317[skillId] = before + 1; return { before, after: before + 1, cost }; }
export function advanceSkillGradeV12317(foundation, skillId) { const p = ensureSkillHeartProgressionV12317(progression(foundation)); const grade = skillGradeV12317(foundation, skillId), idx = SKILL_GRADE_ORDER_V12317.indexOf(grade); if (idx >= SKILL_GRADE_ORDER_V12317.length - 1)
    throw new Error('Kỹ năng đã đạt Bậc Phá.'); if (skillLevelV12317(foundation, skillId) < SKILL_LEVEL_MAX_V12317)
    throw new Error('Cần Kỹ năng Lv20 trước khi Tiến Bậc.'); const cost = skillAdvanceCostV12317(grade); const have = p.skillSpecificFragmentsV12317[skillId] ?? 0; if (have < cost)
    throw new Error(`Thiếu Mảnh riêng kỹ năng: cần ${cost}, hiện có ${have}.`); p.skillSpecificFragmentsV12317[skillId] = have - cost; p.skillGradesV12317[skillId] = SKILL_GRADE_ORDER_V12317[idx + 1]; p.skillLevelsV12317[skillId] = 1; return { from: grade, to: SKILL_GRADE_ORDER_V12317[idx + 1], cost }; }
export function skillStatScalingV12317(skill) {
    const dao = skill.runtimeV117?.daoBinding;
    const sig = skill.daoRuntimeV118?.signature;
    if (dao === 'body') {
        if (sig === 'bodyDefense' || sig === 'bodyRecovery')
            return { physiqueRatio: .55, defenseRatio: .20, label: 'Thể Phách + Phòng Ngự' };
        if (sig === 'bodyCounter')
            return { physiqueRatio: .40, defenseRatio: .25, label: 'Thể Phách + Phòng Ngự' };
        return { physiqueRatio: .45, defenseRatio: .10, label: 'Thể Phách' };
    }
    if (dao === 'poison') {
        if (sig === 'poisonDefend')
            return { physiqueRatio: .35, defenseRatio: .15, label: 'Thể Phách + Phòng Ngự' };
        return { physiqueRatio: .25, defenseRatio: 0, label: 'Thể Phách' };
    }
    if (dao === 'sword')
        return sig === 'swordGuard' ? { physiqueRatio: 0, defenseRatio: .25, label: 'Phòng Ngự' } : { physiqueRatio: 0, defenseRatio: 0, label: 'Công Lực' };
    if (dao === 'fist')
        return { physiqueRatio: .15, defenseRatio: sig === 'fistCounter' ? .10 : 0, label: sig === 'fistCounter' ? 'Thể Phách + Phòng Ngự' : 'Thể Phách' };
    if (dao === 'formation')
        return { physiqueRatio: 0, defenseRatio: .20, label: 'Phòng Ngự' };
    if (dao === 'artifact')
        return { physiqueRatio: 0, defenseRatio: .10, label: 'Phòng Ngự' };
    if (dao === 'mind')
        return sig === 'mindDefense' ? { physiqueRatio: .10, defenseRatio: .15, label: 'Thể Phách + Phòng Ngự' } : { physiqueRatio: .12, defenseRatio: 0, label: 'Thể Phách' };
    if (dao === 'spell')
        return { physiqueRatio: .08, defenseRatio: 0, label: 'Thể Phách' };
    return { physiqueRatio: 0, defenseRatio: 0, label: 'Công Lực' };
}
/** Phòng Ngự is normalized by /3 because one Core Potential point grants +3 Defense. */
export function skillSecondaryEffectBonusPctV12317(stats, skill) {
    const profile = skillStatScalingV12317(skill);
    if (profile.physiqueRatio <= 0 && profile.defenseRatio <= 0)
        return 0;
    const attack = Math.max(1, stats.attack);
    const physique = Math.max(0, stats.physique ?? stats.maxHp / 20);
    const defenseNormalized = Math.max(0, stats.defense) / 3;
    return Math.max(0, (physique * profile.physiqueRatio + defenseNormalized * profile.defenseRatio) / attack * 100);
}
export function skillScalingSummaryV12317(skill) {
    const p = skillStatScalingV12317(skill);
    const parts = ['100% hệ số Công Lực nền'];
    if (p.physiqueRatio > 0)
        parts.push(`+${Math.round(p.physiqueRatio * 100)}% Thể Phách tương ứng`);
    if (p.defenseRatio > 0)
        parts.push(`+${Math.round(p.defenseRatio * 100)}% Phòng Ngự quy đổi tương ứng`);
    return parts.join(' · ');
}
function heartMethodBaseStatPackage(passiveId) {
    const dao = (passiveId.split('.')[2] ?? '');
    const suffix = passiveId.split('.').slice(3).join('.');
    if (dao === 'sword') {
        if (suffix.includes('guard'))
            return { attackPct: 0, physiquePct: 0, defensePct: 8 };
        if (suffix.includes('hidden'))
            return { attackPct: 2, physiquePct: 4, defensePct: 4 };
        if (suffix.includes('break'))
            return { attackPct: 4, physiquePct: 0, defensePct: 0 };
        return { attackPct: 6, physiquePct: 0, defensePct: 0 };
    }
    if (dao === 'fist')
        return suffix.includes('counter') ? { attackPct: 2, physiquePct: 5, defensePct: 3 } : { attackPct: 5, physiquePct: 4, defensePct: 0 };
    if (dao === 'body')
        return suffix.includes('recoil') ? { attackPct: 2, physiquePct: 6, defensePct: 5 } : { attackPct: 0, physiquePct: 8, defensePct: 7 };
    if (dao === 'spell')
        return suffix.includes('guard') ? { attackPct: 2, physiquePct: 2, defensePct: 5 } : { attackPct: 7, physiquePct: 2, defensePct: 0 };
    if (dao === 'poison') {
        if (suffix.includes('guard'))
            return { attackPct: 0, physiquePct: 8, defensePct: 6 };
        if (suffix.includes('nurture'))
            return { attackPct: 1, physiquePct: 7, defensePct: 0 };
        return { attackPct: 5, physiquePct: 5, defensePct: 0 };
    }
    if (dao === 'artifact')
        return suffix.includes('guard') ? { attackPct: 1, physiquePct: 0, defensePct: 7 } : { attackPct: 5, physiquePct: 0, defensePct: 2 };
    if (dao === 'formation')
        return suffix.includes('activate') ? { attackPct: 5, physiquePct: 0, defensePct: 3 } : { attackPct: 1, physiquePct: 4, defensePct: 7 };
    if (dao === 'mind')
        return suffix.includes('guard') ? { attackPct: 1, physiquePct: 4, defensePct: 6 } : { attackPct: 5, physiquePct: 4, defensePct: 0 };
    return { attackPct: 0, physiquePct: 0, defensePct: 0 };
}
function heartLevelScalar(level) { const lv = clamp(Math.floor(level), 1, 20); if (lv <= 5)
    return .50 + (lv - 1) * (.25 / 4); if (lv <= 10)
    return .75 + (lv - 5) * (.25 / 5); if (lv <= 15)
    return 1 + (lv - 10) * (.25 / 5); return 1.25 + (lv - 15) * (.25 / 5); }
function gradeScalar(grade) { return 1 + SKILL_GRADE_EFFECT_BONUS_PCT[grade] / 100; }
export function heartMethodStatPackageV12317(passiveId, level, grade, daoStrength = 1) {
    const base = heartMethodBaseStatPackage(passiveId), m = heartLevelScalar(level) * gradeScalar(grade) * Math.max(0, daoStrength) * HEART_METHOD_STATIC_STAT_SCALE_V129;
    return { attackPct: base.attackPct * m, physiquePct: base.physiquePct * m, defensePct: base.defensePct * m };
}
export function resolveHeartMethodStatsV12317(foundation) {
    const p = ensureSkillHeartProgressionV12317(progression(foundation));
    const out = { attackPct: 0, physiquePct: 0, defensePct: 0 };
    for (const id of foundation.learnedDaoPassiveIdsV118 ?? []) {
        const dao = (id.split('.')[2] ?? '');
        const strength = dao === foundation.battleDao.mainDaoId ? 1 : dao === foundation.battleDao.secondaryDaoId ? 1 : 0;
        if (strength <= 0)
            continue;
        const level = p.passiveLevels[id] ?? 1, grade = heartMethodGradeV12317(foundation, id), b = heartMethodStatPackageV12317(id, level, grade, strength);
        out.attackPct += b.attackPct;
        out.physiquePct += b.physiquePct;
        out.defensePct += b.defensePct;
    }
    return out;
}
export function applyHeartMethodStatsV12317(stats, foundation) { const bonus = resolveHeartMethodStatsV12317(foundation); const out = { ...stats, attack: stats.attack * (1 + bonus.attackPct / 100), defense: stats.defense * (1 + bonus.defensePct / 100) }; if (stats.physique !== undefined)
    out.physique = stats.physique * (1 + bonus.physiquePct / 100);
else
    out.maxHp = stats.maxHp * (1 + bonus.physiquePct / 100); return { stats: out, bonus }; }
export function heartMethodStatSummaryV12317(passiveId, level, grade) { const b = heartMethodStatPackageV12317(passiveId, level, grade, 1); const p = []; if (b.attackPct > 0)
    p.push(`Công Lực +${b.attackPct.toFixed(1)}%`); if (b.physiquePct > 0)
    p.push(`Thể Phách +${b.physiquePct.toFixed(1)}%`); if (b.defensePct > 0)
    p.push(`Phòng Ngự +${b.defensePct.toFixed(1)}%`); return p.join(' · ') || 'Không cộng chỉ số lõi'; }
export function devMaxSkillHeartV12317(foundation, skillIds, heartMethodIds, grade = 'breaker') {
    const p = ensureSkillHeartProgressionV12317(progression(foundation));
    for (const id of skillIds) {
        p.skillLevelsV12317[id] = SKILL_LEVEL_MAX_V12317;
        p.skillGradesV12317[id] = grade;
        p.skillPracticeXp[id] = 1_000_000;
        foundation.skillMastery[id] = 1000;
        p.skillSpecificFragmentsV12317[id] = 9999;
    }
    for (const id of heartMethodIds) {
        p.passiveLevels[id] = HEART_METHOD_LEVEL_MAX_V12317;
        p.heartMethodGradesV12317[id] = grade;
    }
    p.skillGenericFragmentsV12317 = 999999;
}
//# sourceMappingURL=skill-heart-method-v12317.js.map