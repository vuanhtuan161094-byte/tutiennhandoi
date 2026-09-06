export const COMBAT_PACING_V124 = {
    /**
     * CombatEngine thật dùng cùng hệ số cho hai bên để kéo dài trận mà không âm thầm đổi kèo thắng/thua.
     * Hệ số này áp SAU quy tắc Thể Phách ×20, nên 1 Thể Phách vẫn = 20 HP chuẩn.
     */
    runtimeLifeMultiplier: 2.2,
    /** Săn Yêu là mô phỏng log-power riêng; HP hiển thị theo cấp quái để Boss/Tinh Anh có cảm giác dày hơn. */
    huntLifeMultiplier: {
        common: 2.0,
        enhanced: 2.4,
        elite: 3.0,
        boss: 4.5,
    },
    equalPowerTargetSeconds: {
        common: { min: 6, max: 12, center: 9 },
        enhanced: { min: 10, max: 20, center: 14 },
        elite: { min: 15, max: 30, center: 22 },
        boss: { min: 45, max: 90, center: 65 },
        hardBoss: { min: 90, max: 180, center: 125 },
    },
    bossBurstTargetHpPct: { min: 20, max: 45 },
    playerFailureTargetSeconds: { min: 15, max: 25 },
};
export function combatLifeMultiplierForTagsV124(_tags) {
    return COMBAT_PACING_V124.runtimeLifeMultiplier;
}
export function applyCombatPacingV124(def) {
    if (def.stats.combatHpMultiplierV124 !== undefined)
        return def;
    return {
        ...def,
        stats: { ...def.stats, combatHpMultiplierV124: COMBAT_PACING_V124.runtimeLifeMultiplier },
    };
}
export function endlessHuntLifeMultiplierV124(grade) {
    return COMBAT_PACING_V124.huntLifeMultiplier[grade];
}
/**
 * Legacy v1.24 scalar pacing helper kept for old simulations/telemetry. v1.30 runtime Hunt
 * uses HP/DPS time-to-kill instead; this helper no longer declares live Hunt duration.
 */
export function endlessHuntBattleSecondsV124(grade, margin, random01) {
    const profile = grade === 'boss'
        ? { center: 65, sensitivity: 34, spread: 10, min: 18, max: 125 }
        : grade === 'elite'
            ? { center: 22, sensitivity: 14, spread: 4, min: 6, max: 45 }
            : grade === 'enhanced'
                ? { center: 14, sensitivity: 10, spread: 3, min: 4, max: 30 }
                : { center: 9, sensitivity: 7, spread: 2, min: 2.5, max: 20 };
    const jitter = (Math.max(0, Math.min(1, random01)) - 0.5) * 2 * profile.spread;
    return Math.max(profile.min, Math.min(profile.max, profile.center - margin * profile.sensitivity + jitter));
}
//# sourceMappingURL=combat-pacing-v124.js.map