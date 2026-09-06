import { critProfile, heartProfile } from './combat-rules.js';
export const HUNT_VIRTUAL_FARM_BATCH_SECONDS_V77 = 30;
export const HUNT_VIRTUAL_FARM_MIN_SECONDS_PER_KILL_V77 = 2;
export const HUNT_VIRTUAL_FARM_MAX_SECONDS_PER_KILL_V77 = 180;
export const HUNT_VIRTUAL_FARM_ELITE_CHANCE_PCT_V77 = 1.5;
/**
 * Cheap sustained-DPS estimator used only for virtual-farm throughput.
 * It intentionally does NOT use combat power score. It follows the live build's offensive stats,
 * crit profile, action speed, armor penetration and authored active-skill count.
 */
export function huntVirtualFarmPlayerDpsLog10V77(entity) {
    const s = entity.stats;
    const attack = Math.max(1, Number(s.attack) || 1);
    const speed = Math.max(.25, Math.min(3, Number(s.actionSpeed) || 1));
    const crit = critProfile(s);
    const heart = heartProfile(s);
    const expectedCritLayers = crit.guaranteedLayers + crit.nextLayerChancePct / 100;
    const critFactor = 1
        + expectedCritLayers * Math.max(0, crit.damagePctPerLayer - 100) / 100
        + heart.chancePct / 100 * Math.max(0, heart.damagePct - 100) / 100;
    const penFactor = 1 + Math.max(0, Math.min(100, Number(s.armorPenPct) || 0)) / 180;
    const skillCount = Math.max(0, (entity.skillIds || []).filter(id => id && id !== 'skill.basic_strike').length);
    // Active skills improve sustained clear speed, but with diminishing returns so slot count itself never dominates a build.
    const skillFactor = 1 + Math.min(.55, skillCount * .085);
    const sustained = Math.max(1, attack * speed * critFactor * penFactor * skillFactor);
    return Math.log10(sustained);
}
export function huntVirtualFarmProfileV77(input) {
    const raw = Math.pow(10, Math.max(-12, Math.min(12, input.mobHpLog10 - input.playerDpsLog10)));
    const secondsPerKill = Math.max(HUNT_VIRTUAL_FARM_MIN_SECONDS_PER_KILL_V77, Math.min(HUNT_VIRTUAL_FARM_MAX_SECONDS_PER_KILL_V77, raw));
    const killsPerHour = 3600 / secondsPerKill;
    const eliteChancePct = Math.max(0, Math.min(25, Number(input.eliteChancePct ?? HUNT_VIRTUAL_FARM_ELITE_CHANCE_PCT_V77) || 0));
    return { floor: Math.max(1, Math.floor(input.floor)), playerDpsLog10: input.playerDpsLog10, mobHpLog10: input.mobHpLog10, secondsPerKill, killsPerHour, eliteChancePct, elitePerHour: killsPerHour * eliteChancePct / 100, capped: raw <= HUNT_VIRTUAL_FARM_MIN_SECONDS_PER_KILL_V77 + 1e-9 };
}
function normal01(rng) {
    const u1 = Math.max(1e-12, rng.next()), u2 = Math.max(1e-12, rng.next());
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
/** Deterministic binomial with exact small-N rolls and O(1) normal approximation for huge offline batches. */
export function deterministicBinomialV77(nRaw, pRaw, rng) {
    const n = Math.max(0, Math.floor(nRaw)), p = Math.max(0, Math.min(1, pRaw));
    if (n === 0 || p <= 0)
        return 0;
    if (p >= 1)
        return n;
    if (n <= 240) {
        let hits = 0;
        for (let i = 0; i < n; i++)
            if (rng.next() < p)
                hits++;
        return hits;
    }
    const mean = n * p, variance = n * p * (1 - p), sample = Math.round(mean + normal01(rng) * Math.sqrt(Math.max(1e-9, variance)));
    return Math.max(0, Math.min(n, sample));
}
export function deterministicJitteredTotalV77(expected, rng, jitterPct = .08) {
    const base = Math.max(0, Number(expected) || 0);
    if (base <= 0)
        return 0;
    const jitter = 1 + (rng.next() * 2 - 1) * Math.max(0, Math.min(.5, jitterPct));
    return Math.max(0, Math.round(base * jitter));
}
//# sourceMappingURL=hunt-virtual-farm-v77.js.map