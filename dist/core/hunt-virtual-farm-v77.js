import { critProfile, heartProfile } from './combat-rules.js';
export const HUNT_VIRTUAL_FARM_BATCH_SECONDS_V77 = 30;
// V141 closure: preview uses the same 0.25s hard floor as the representative CombatKernel V2 batch resolver.
// At the canonical 24h offline cap this is at most 345,600 kills, below OFFLINE_HUNT_MAX_FIGHTS=350,000.
export const HUNT_VIRTUAL_FARM_MIN_SECONDS_PER_KILL_V77 = .25;
export const HUNT_VIRTUAL_FARM_MAX_SECONDS_PER_KILL_V77 = 180;
export const HUNT_VIRTUAL_FARM_ELITE_CHANCE_PCT_V77 = 1.5;
export const HUNT_VIRTUAL_FARM_MODEL_VERSION_V141 = 'v141-build-parity';

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

/**
 * Legacy cheap read-only sustained-DPS estimator retained for compatibility/tests.
 * Production Session preview now uses huntPreviewPlayerDpsLog10V130 so Sword F scaling
 * is represented; settlement authority is the representative CombatKernel V3 encounter.
 *
 * Historical V141 parity closure:
 * - generic Combat Power is never used to mint farm throughput;
 * - current offensive stats, Crit/Hội Tâm, Action Speed, Xuyên and active-skill breadth are reflected;
 * - real outgoing Damage% layers carried by the canonical CombatEntity (currently Mệnh Cách V4)
 *   are reflected in the preview instead of being silently ignored;
 * - Boss Damage% is intentionally excluded because Săn Ảo farms ordinary/elite mobs, not Bosses.
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
    // Active skills improve sustained clear speed with diminishing returns; slot count itself never dominates a build.
    const skillFactor = 1 + Math.min(.55, skillCount * .085);

    // CombatKernel V2 consumes Fate V4 outgoing damage as a separate multiplicative layer rather than Attack.
    // Mirror that layer in the read-only preview so Chiến Mệnh never looks weaker in Săn Ảo than in live combat.
    const fateDamagePct = clamp(entity.combatBuildV117?.fateV4?.damagePct, -90, 500);
    const outgoingDamageFactor = Math.max(.1, 1 + fateDamagePct / 100);

    const sustained = Math.max(1, attack * speed * critFactor * penFactor * skillFactor * outgoingDamageFactor);
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
