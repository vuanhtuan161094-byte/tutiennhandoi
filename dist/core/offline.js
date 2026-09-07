import { WORLD_YEARS_PER_REAL_HOUR } from './realtime-balance.js';
export const OFFLINE_BASE_CAP_REAL_HOURS = 24;
export const OFFLINE_HUNT_LOOT_CACHE_CAPACITY = 200;
/** V141: safety ceiling above the 24h Hunt maximum at the canonical 0.25s/fight floor (345,600 fights). */
export const OFFLINE_HUNT_MAX_FIGHTS = 350_000;
export const OFFLINE_HUNT_MIN_BATCH = 25;
export const OFFLINE_HUNT_MEDIUM_BATCH = 100;
export const OFFLINE_HUNT_MAX_BATCH = 200;
/** A true combat death shortens the current life's maximum lifespan by 0.1%. */
export const COMBAT_DEATH_LIFESPAN_LOSS_PCT = 0.1;
export function realSecondsUntilNaturalDeath(state) {
    if (state.realm.maxRealmOrder >= 46)
        return Number.POSITIVE_INFINITY;
    const remainingYears = Math.max(0, state.lifespanYears - state.ageYears);
    return remainingYears / Math.max(1e-12, WORLD_YEARS_PER_REAL_HOUR) * 3600;
}
/**
 * Combat death is not the same as natural lifespan exhaustion. The current life revives,
 * but maximum lifespan is permanently shortened by 0.1%. If that reduction pushes the
 * maximum below the current age, the life ends immediately.
 */
export function applyCombatDeathLifespanPenalty(state) {
    const before = Math.max(0, state.lifespanYears);
    if (state.realm.maxRealmOrder >= 46 || !state.alive || before <= 0) {
        return { applied: false, lostYears: 0, lifespanBefore: before, lifespanAfter: before, lifeEnded: !state.alive };
    }
    const lostYears = before * (COMBAT_DEATH_LIFESPAN_LOSS_PCT / 100);
    state.lifespanYears = Math.max(0, before - lostYears);
    if (state.ageYears + 1e-9 >= state.lifespanYears)
        state.alive = false;
    return { applied: true, lostYears, lifespanBefore: before, lifespanAfter: state.lifespanYears, lifeEnded: !state.alive };
}
export function offlineHuntDynamicBatchSize(sample, bossReady = false) {
    if (bossReady)
        return 1;
    if (!sample || sample.attempts < 3)
        return OFFLINE_HUNT_MIN_BATCH;
    const winRate = sample.wins / Math.max(1, sample.attempts);
    const avgSeconds = sample.totalBattleSeconds / Math.max(1, sample.attempts);
    if (winRate >= 0.98 && avgSeconds <= 6)
        return OFFLINE_HUNT_MAX_BATCH;
    if (winRate >= 0.90 && avgSeconds <= 10)
        return OFFLINE_HUNT_MEDIUM_BATCH;
    return OFFLINE_HUNT_MIN_BATCH;
}
//# sourceMappingURL=offline.js.map
