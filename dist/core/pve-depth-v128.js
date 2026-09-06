import { ENDLESS_HUNT_FLOOR_POWER_GROWTH, ENDLESS_HUNT_KILLS_PER_FLOOR, endlessHuntGrades } from '../content/endless-hunt.js';
import { realmMapDefinitionForFloor } from '../content/realm-maps.js';
import { applyCorePotentialStats } from './reincarnation-progression-v1102.js';
import { combatPowerBreakdown } from './personal-power.js';
/**
 * V1.28 PvE depth guardrail.
 *
 * This is a balance/reference model only. It never gives the player hidden power and never hard-gates
 * a floor by reincarnation count. Strong builds may push earlier; weak builds must farm/reincarnate more.
 */
export const PVE_DEPTH_POLICY_V128 = {
    version: 'pve-depth.v128',
    noHardReincarnationGate: true,
    /** Stage-X Phá permanent potential reward in the authoritative reincarnation table. */
    breakerPermanentPotentialPerLife: 520,
    /** Reference allocation used only by the regression model: offense first, but not glass-cannon only. */
    referenceAllocation: { powerPct: 60, bodyPct: 20, defensePct: 20 },
    /** Hunt runtime itself already grants at most +50% scalar from equipped non-basic skills. */
    referenceHuntSkillMultiplier: 1.5,
    /** Mature current-life gear/manual/artifact/Dao envelope; this is NOT a runtime multiplier. */
    referenceMatureBuildScoreMultiplier: 1.9,
    /** Same lower edge as the canonical Ngang Cơ readiness band. */
    referenceTargetRatio: 0.88,
    /** User-facing design target: Luyện Khí floor ~400 should be a many-life achievement, not first-life clear. */
    floor400BreakerEquivalentTarget: { minLives: 8, maxLives: 12 },
};
const HUNT_BASE_POWER_V128 = 170;
export function huntBossScalarPowerV128(globalFloor, extraEnemyPowerMultiplier = 1) {
    const floor = Math.max(1, Math.floor(globalFloor));
    const map = realmMapDefinitionForFloor(floor);
    const depth = Math.max(1, map.localFloor);
    const base = HUNT_BASE_POWER_V128 * Math.pow(ENDLESS_HUNT_FLOOR_POWER_GROWTH, depth - 1);
    return base
        * endlessHuntGrades.boss.powerMultiplier
        * (map.powerByGrade.boss ?? map.powerMultiplier)
        * Math.max(0.05, extraEnemyPowerMultiplier);
}
export function huntEncountersToClearThroughFloorV128(localFloor) {
    const floor = Math.max(0, Math.floor(localFloor));
    return floor * (ENDLESS_HUNT_KILLS_PER_FLOOR + 1);
}
export function referenceBreakerHuntScoreV128(baseEntity, breakerLives) {
    const lives = Math.max(0, Math.floor(breakerLives));
    const points = lives * PVE_DEPTH_POLICY_V128.breakerPermanentPotentialPerLife;
    const allocation = PVE_DEPTH_POLICY_V128.referenceAllocation;
    const power = Math.round(points * allocation.powerPct / 100);
    const body = Math.round(points * allocation.bodyPct / 100);
    const defense = Math.max(0, points - power - body);
    const stats = applyCorePotentialStats(baseEntity.stats, {
        life: { unspent: 0, lifetimeEarned: 0, allocations: { power: 0, body: 0, defense: 0 }, awardedMilestones: [] },
        permanent: { power, body, defense },
    });
    const personalScore = combatPowerBreakdown({ ...baseEntity, stats }).score;
    return personalScore
        * PVE_DEPTH_POLICY_V128.referenceHuntSkillMultiplier
        * PVE_DEPTH_POLICY_V128.referenceMatureBuildScoreMultiplier;
}
export function estimatedBreakerLivesForHuntBossV128(baseEntity, globalFloor, maxLives = 200, targetRatio = PVE_DEPTH_POLICY_V128.referenceTargetRatio) {
    const enemy = huntBossScalarPowerV128(globalFloor);
    for (let lives = 0; lives <= Math.max(0, Math.floor(maxLives)); lives += 1) {
        if (referenceBreakerHuntScoreV128(baseEntity, lives) / enemy >= targetRatio)
            return lives;
    }
    return undefined;
}
//# sourceMappingURL=pve-depth-v128.js.map