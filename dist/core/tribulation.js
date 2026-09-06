import { SeededRng } from './rng.js';
export function createTribulationState() { return { attention: 0, faced: 0, passed: 0, failed: 0, lightningRefined: 0, heavenlyScars: 0, history: [] }; }
export function cloneTribulationState(s) { const x = s ?? createTribulationState(); return { ...x, history: x.history.map(h => ({ ...h })) }; }
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export class TribulationEngine {
    attempt(args) {
        const { realm, injury: currentInjury = 0, soul, dao, integration } = args;
        const intensity = clamp(Math.floor(args.intensity || 1), 1, 3);
        const stageIndex = realm.maxRealmOrder < 42 ? 0 : Math.min(3, realm.maxRealmOrder - 42);
        const kinds = ['heavenly_lightning', 'heart_demon', 'karma_fire', 'dao_judgment'];
        const kind = kinds[stageIndex];
        const main = dao.mainDaoId ? dao.known[dao.mainDaoId] : undefined;
        const body = clamp(100 - Math.max(0, Number(currentInjury) || 0), 0, 100);
        const soulScore = (Math.min(100, soul.strength / 3.2) + soul.purity + soul.stability) / 3;
        const daoScore = (main?.depth ?? 0) + Math.min(20, (main?.marks ?? 0) * 2);
        const base = 50 + body * 0.20 + soulScore * 0.18 + daoScore * 0.20 + integration.harmony * 0.12;
        const chance = clamp(base + Math.max(0, Number(args.successBonusPct) || 0) - (intensity - 1) * 16 - stageIndex * 4, 5, 99);
        const rng = new SeededRng(args.seed);
        const passed = rng.next() * 100 < chance;
        const tuViCostPct = 8 + intensity * 4 + stageIndex * 2;
        const injuryGain = passed ? Math.max(0, intensity * 2 - stageIndex) : 12 + intensity * 8 + stageIndex * 3;
        const rewardEssence = passed ? 8 + intensity * 7 + stageIndex * 4 : 0;
        const rewardMarks = passed ? Math.max(1, intensity + Math.floor(stageIndex / 2)) : 0;
        return { ok: true, passed, kind, intensity, chance, injury: injuryGain, tuViCostPct, rewardEssence, rewardMarks, nextRealmId: passed ? args.nextRealmId : undefined, reason: [`body ${body.toFixed(1)}`, `soul ${soulScore.toFixed(1)}`, `dao ${daoScore.toFixed(1)}`, `integration ${integration.harmony.toFixed(1)}`, `tree +${Math.max(0, Number(args.successBonusPct) || 0).toFixed(1)}%`] };
    }
}
//# sourceMappingURL=tribulation.js.map