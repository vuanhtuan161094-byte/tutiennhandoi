import { runCombatKernelV2 } from '../../dist/core/combat-kernel-v2.js';
import { analyzeBattle } from '../../dist/core/combat-analytics.js';
import { buildRegistry } from '../../dist/content/registry.js';
import { buildBalanceEntityV120 } from './balance-lab-v120.js';
import { ELEMENT_QUALITY_V113, rootEffectivenessPct } from '../../dist/core/build-foundation-v113.js';
import { ROOT_ORIGIN_COMBAT_DEFINITIONS_V132, rootOriginCombatDefinitionV132 } from '../../dist/core/root-origin-combat-v132.js';
import { applyCombatPacingV124 } from '../../dist/core/combat-pacing-v124.js';
import { buildHuntCombatProfileV130 } from '../../dist/core/hunt-real-combat-v130.js';
import { combatMaxHp } from '../../dist/core/combat-rules.js';
export const BUILD_MATRIX_SCHEMA_V134 = 'build-matrix.v134';
export const BUILD_MATRIX_ROOT_LEVEL_V134 = 1000;
export const BUILD_MATRIX_QUALITY_V134 = 'dao';
const ROOTS = ['metal', 'wood', 'water', 'fire', 'earth'];
const ROOT_ELEMENT = { metal: 'Metal', wood: 'Wood', water: 'Water', fire: 'Fire', earth: 'Earth' };
function cloneStats(s) { return { ...s, elementalAffinities: s.elementalAffinities ? { ...s.elementalAffinities } : undefined, elementalResistancesPct: s.elementalResistancesPct ? { ...s.elementalResistancesPct } : undefined }; }
function add(v, x) { return (v ?? 0) + (x ?? 0); }
function mulPct(v, pct) { return v * (1 + (pct ?? 0) / 100); }
/**
 * Lab-only projection of the exact v1.32 static Căn Nguyên package.
 * Dynamic packages stay authoritative in CombatEngine/Hunt through activeRootOriginIdsV132.
 */
export function applyOriginStackStaticStatsV134(stats, activeOriginIds) {
    const s = cloneStats(stats);
    for (const root of ROOTS) {
        const id = activeOriginIds[root];
        if (!id)
            continue;
        const def = rootOriginCombatDefinitionV132(id);
        if (!def || def.root !== root)
            throw new Error(`Invalid ${root} origin in build matrix: ${id}`);
        const m = def.static;
        if (!m)
            continue;
        if (m.maxHpPct) {
            if (s.physique !== undefined)
                s.physique = mulPct(s.physique, m.maxHpPct);
            else
                s.maxHp = mulPct(s.maxHp, m.maxHpPct);
        }
        if (m.maxSpiritPct)
            s.maxSpirit = mulPct(s.maxSpirit, m.maxSpiritPct);
        if (m.defensePct)
            s.defense = mulPct(s.defense, m.defensePct);
        s.armorPenPct = add(s.armorPenPct, m.armorPenPct);
        s.critChancePct = add(s.critChancePct, m.critChancePct);
        s.critDamagePct = add(s.critDamagePct, m.critDamagePct);
        s.damageReductionPct = add(s.damageReductionPct, m.damageReductionPct);
        s.dodgeChancePct = add(s.dodgeChancePct, m.dodgePct);
        s.healingEffectivenessPct = add(s.healingEffectivenessPct, m.healingPct);
        s.healingReceivedPct = add(s.healingReceivedPct, m.healingReceivedPct);
        s.lifeStealPct = add(s.lifeStealPct, m.lifeStealPct);
        s.spiritRegenStandardPctPerSecond = add(s.spiritRegenStandardPctPerSecond, m.spiritRegenPct);
        s.spiritEfficiencyPct = add(s.spiritEfficiencyPct, m.spiritEfficiencyPct);
        if (m.actionSpeedPct)
            s.actionSpeed = mulPct(s.actionSpeed, m.actionSpeedPct);
    }
    return s;
}
export function buildMatrixEntityV134(spec) {
    const rootLevel = Math.max(1, Math.min(1000, Math.floor(spec.rootLevel ?? BUILD_MATRIX_ROOT_LEVEL_V134)));
    const quality = spec.elementQuality ?? BUILD_MATRIX_QUALITY_V134;
    const activeOriginIds = { ...(spec.activeOriginIds ?? {}) };
    const base = buildBalanceEntityV120(spec);
    const rootLevels = Object.fromEntries(ROOTS.map(r => [r, rootLevel]));
    const rootEffectiveness = Object.fromEntries(ROOTS.map(r => [r, rootEffectivenessPct(rootLevel)]));
    const stats = applyOriginStackStaticStatsV134(base.stats, activeOriginIds);
    const element = ROOT_ELEMENT[spec.root];
    stats.elementalAffinities = { ...(stats.elementalAffinities ?? {}), [element]: { pct: rootEffectivenessPct(rootLevel), evolutionMultiplier: ELEMENT_QUALITY_V113[quality].multiplier } };
    return {
        ...base,
        stats,
        combatBuildV117: {
            ...(base.combatBuildV117 ?? {}),
            rootLevelsV133: rootLevels,
            rootEffectivenessPct: rootEffectiveness,
            activeRootOriginIdsV132: activeOriginIds,
        },
    };
}
function harmlessSkill() { return { id: 'skill.balance.v134.harmless', name: 'Mộc Nhân Bất Động', description: 'Benchmark v1.34.', tags: ['BalanceSimV134'], spiritCost: 0, cooldown: 0, castTime: 0, recoveryTime: 1, effects: [] }; }
function enemyStrike() { return { id: 'skill.balance.v134.enemy_strike', name: 'Áp Lực Build Matrix', description: 'Boss pressure benchmark v1.34.', tags: ['BalanceSimV134'], spiritCost: 0, cooldown: 0, castTime: .6, recoveryTime: 1, effects: [{ type: 'damage', coefficient: 1.05, breakDamagePct: 5 }] }; }
function baseStats(axis) { return { maxHp: axis * 20, physique: axis, maxSpirit: 1000, spiritStandard: 1000, spiritRegenStandardPctPerSecond: 3, attack: axis, defense: axis, mobility: 100, accuracy: 100, critChancePct: 35, critPowerPerLayer: .5, heartChancePct: 10, dodgeChancePct: 10, controlPower: 100, resolve: 100, actionSpeed: 1, elementalAffinities: {}, elementalResistancesPct: {}, dominantElement: 'Metal' }; }
function benchmarkEntity(kind, axis) {
    if (kind === 'offense')
        return { id: 'balance.v134.target', combatModel: 'locked-v1', name: 'Mộc Nhân Build Matrix', tags: ['BalanceSimV134'], stats: { ...baseStats(axis), maxHp: axis * 20 * 1000, physique: axis * 1000, attack: 1, defense: axis }, skillIds: ['skill.balance.v134.harmless'], aiProfile: { name: 'idle-v134', rules: [{ skillId: 'skill.balance.v134.harmless', priority: 1, conditions: [{ type: 'always' }] }] } };
    const foeScale = 1.85;
    return { id: 'balance.v134.pressure', combatModel: 'locked-v1', name: 'Boss Pressure Build Matrix', tags: ['BalanceSimV134', 'Boss'], stats: { ...baseStats(axis), maxHp: axis * 20 * 100, physique: axis * 100, attack: axis * foeScale, defense: axis * foeScale, actionSpeed: 1.02 }, skillIds: ['skill.balance.v134.enemy_strike'], aiProfile: { name: 'pressure-v134', rules: [{ skillId: 'skill.balance.v134.enemy_strike', priority: 1, conditions: [{ type: 'always' }] }] } };
}
const REGISTRY = buildRegistry();
function registry() { if (!REGISTRY.skills.has('skill.balance.v134.harmless'))
    REGISTRY.registerSkill(harmlessSkill()); if (!REGISTRY.skills.has('skill.balance.v134.enemy_strike'))
    REGISTRY.registerSkill(enemyStrike()); return REGISTRY; }
export function evaluateBuildMatrixV134(spec) {
    const axis = spec.totalPotential, player = buildMatrixEntityV134(spec), r = registry();
    const offense = runCombatKernelV2({ registry: r, seed: 813400, entities: [player, applyCombatPacingV124(benchmarkEntity('offense', axis))], maxDuration: 60, mode: 'simulation' }).battle;
    const offenseA = analyzeBattle(offense).combatants[player.id];
    const dps = (offenseA?.damageDealt ?? 0) / Math.max(1, Math.min(60, offense.duration));
    const survival = runCombatKernelV2({ registry: r, seed: 823400, entities: [player, applyCombatPacingV124(benchmarkEntity('survival', axis))], maxDuration: 90, mode: 'simulation' }).battle;
    const survivalA = analyzeBattle(survival).combatants[player.id];
    const pressureDps = (survivalA?.damageDealt ?? 0) / Math.max(1, Math.min(90, survival.duration));
    const fs = survival.finalState[player.id];
    const maxHp = Math.max(1, combatMaxHp(player.stats));
    const hpPct = Math.max(0, Math.min(100, fs.hp / maxHp * 100));
    const survivalSeconds = fs.alive ? 90 : Math.min(90, survival.duration);
    const survivalScore = survivalSeconds + (fs.alive ? hpPct * .15 : 0);
    const profile = buildHuntCombatProfileV130(player, r);
    const offenseScore = dps;
    const balancedScore = Math.sqrt(Math.max(1e-9, offenseScore) * Math.max(1e-9, survivalScore));
    return { dps, survivalSeconds, survivalHpPct: hpPct, pressureDps, offenseScore, survivalScore, balancedScore, spiritSustain: profile.spiritSustain, armorPenPct: profile.armorPenPct, damageReductionPct: profile.damageReductionPct, dodgePct: profile.dodgePct };
}
export function fastBuildMatrixProfileV134(spec) { const entity = buildMatrixEntityV134(spec), profile = buildHuntCombatProfileV130(entity, registry()); const offense = profile.attack * profile.damageCoeffPerSecond; const avoid = Math.max(.05, (1 - profile.damageReductionPct / 100) * (1 - profile.dodgePct / 100 * .72)); const defenseMult = 1 + profile.defense / Math.max(1, spec.totalPotential * 1.85); const sustain = profile.healPerSecond + profile.shieldPerSecond + offense * profile.lifeStealPct / 100 * .65; const ehp = profile.maxHp * defenseMult / avoid; const survival = ehp * (1 + Math.min(2, sustain / Math.max(1, profile.maxHp / 60))); return { entity, profile, offense, survival, balanced: Math.sqrt(Math.max(1e-9, offense) * Math.max(1e-9, survival)) }; }
export function validateBuildMatrixOriginCatalogV134() { const errors = []; for (const root of ROOTS) {
    const rows = ROOT_ORIGIN_COMBAT_DEFINITIONS_V132.filter(x => x.root === root);
    if (rows.length !== 6)
        errors.push(`${root}: ${rows.length}/6 Căn Nguyên`);
} return errors; }
//# sourceMappingURL=build-matrix-v134.js.map