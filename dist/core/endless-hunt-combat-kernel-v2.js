import { runCombatKernelV2 } from './combat-kernel-v2.js';
import { applyCombatPacingV124 } from './combat-pacing-v124.js';
import { analyzeBattle } from './combat-analytics.js';
import { combatMaxHp } from './combat-rules.js';
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const safePow10 = (log) => 10 ** clamp(log, -300, 300);
const safeLog10 = (value) => value > 0 && Number.isFinite(value) ? Math.log10(value) : value === Infinity ? 300 : -Infinity;
function timeoutFor(monster) {
    return monster.grade === 'boss' ? 180 : monster.grade === 'elite' ? 90 : monster.grade === 'enhanced' ? 60 : 40;
}
function monsterActionSpeed(monster) {
    let speed = monster.grade === 'boss' ? 1.08 : monster.grade === 'elite' ? 1.12 : monster.grade === 'enhanced' ? 1.06 : 1;
    if (monster.tags.includes('Speed'))
        speed *= 1.18;
    if (monster.tags.includes('Control'))
        speed *= .96;
    return clamp(speed, .7, 1.7);
}
/**
 * Build a real locked-v1 EntityDefinition for Endless Hunt.
 * Log-space remains the storage/display format, but combat itself is resolved by CombatKernelV2.
 */
export function buildEndlessHuntKernelEnemyV2(input) {
    const { monster } = input;
    const statMult = Math.max(.05, input.enemyStatMultiplier);
    let hp = safePow10(monster.hpLog10) * statMult;
    let attack = safePow10(monster.attackLog10) * statMult;
    let defense = safePow10(monster.defenseLog10) * statMult;
    let healingEffectivenessPct = 0;
    const skillIds = ['skill.basic_strike'];
    const rules = [{ skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] }];
    if (monster.grade === 'boss' && input.bossMechanic) {
        const m = input.bossMechanic;
        const severity = m.verdict === 'none' ? 1 : m.verdict === 'partial' ? .55 : .20;
        if (m.element === 'Wood') {
            // Approx. old 0.65% HP/s pressure via the canonical authored heal skill.
            // 22% base heal / 8s is reduced to ~0.7% HP/s at full severity.
            skillIds.unshift('skill.rejuvenation');
            rules.unshift({ skillId: 'skill.rejuvenation', priority: 120, conditions: [{ type: 'selfHpBelow', pct: 96 }] });
            healingEffectivenessPct = -75 - 20 * (1 - severity);
        }
        else if (m.element === 'Fire')
            attack *= 1 + .28 * severity;
        else if (m.element === 'Earth')
            defense *= 1 + .34 * severity;
        else if (m.element === 'Metal') {
            defense *= 1 + .18 * severity;
            attack *= 1 + .16 * severity;
        }
    }
    return {
        id: `${monster.id}.kernel-v2`,
        name: monster.name,
        tags: [...monster.tags, ...monster.elements, ...(monster.grade === 'boss' ? ['Boss'] : []), 'EndlessHunt', 'KernelV2'],
        combatModel: 'locked-v1',
        stats: {
            maxHp: Math.max(1, hp), maxSpirit: 1000, spiritStandard: 1000, spiritRegenStandardPctPerSecond: 8,
            attack: Math.max(1, attack), defense: Math.max(1, defense), mobility: 0, accuracy: 1e9,
            critChancePct: monster.grade === 'boss' ? 12 : monster.grade === 'elite' ? 9 : monster.grade === 'enhanced' ? 6 : 3,
            critPowerPerLayer: .5, controlPower: 0, resolve: 1e9, actionSpeed: monsterActionSpeed(monster),
            healingEffectivenessPct, dominantElement: monster.elements[0], breakDamageTakenMultiplier: monster.grade === 'boss' ? .5 : 1,
        },
        skillIds,
        aiProfile: { name: `${monster.name} · Bí Cảnh Kernel V2`, rules },
    };
}
function bossAdjustedPlayerV2(player, bossMechanic) {
    if (!bossMechanic || bossMechanic.element !== 'Water')
        return player;
    const severity = bossMechanic.verdict === 'none' ? 1 : bossMechanic.verdict === 'partial' ? .55 : .20;
    return { ...player, stats: { ...player.stats, actionSpeed: Math.max(.25, (player.stats.actionSpeed ?? 1) * (1 - .22 * severity)) } };
}
/** Canonical Endless Hunt combat bridge. No expected-value / HP-race winner declaration remains here. */
export function resolveEndlessHuntWithCombatKernelV2(input) {
    const timeoutSeconds = timeoutFor(input.monster);
    const playerPrepared = applyCombatPacingV124(bossAdjustedPlayerV2(input.player, input.bossMechanic));
    const enemyPrepared = applyCombatPacingV124(buildEndlessHuntKernelEnemyV2(input));
    const kernel = runCombatKernelV2({ registry: input.registry, seed: input.seed, entities: [playerPrepared, enemyPrepared], maxDuration: timeoutSeconds, mode: input.mode ?? 'headless' });
    const battle = kernel.battle;
    const analytics = analyzeBattle(battle);
    const playerAnalytics = analytics.combatants[playerPrepared.id];
    const enemyAnalytics = analytics.combatants[enemyPrepared.id];
    const playerMaxHp = Math.max(1, combatMaxHp(playerPrepared.stats));
    const enemyMaxHp = Math.max(1, combatMaxHp(enemyPrepared.stats));
    const playerFinal = battle.finalState[playerPrepared.id];
    const enemyFinal = battle.finalState[enemyPrepared.id];
    const playerHpRemainingPct = clamp((playerFinal?.hp ?? 0) / playerMaxHp * 100, 0, 100);
    const enemyHpRemainingPct = clamp((enemyFinal?.hp ?? 0) / enemyMaxHp * 100, 0, 100);
    const playerDamage = Math.max(0, playerAnalytics?.damageDealt ?? 0);
    const enemyDamage = Math.max(0, enemyAnalytics?.damageDealt ?? 0);
    const duration = Math.max(.001, battle.duration);
    const playerDps = playerDamage / duration;
    const enemyDps = enemyDamage / duration;
    const won = battle.winnerId === playerPrepared.id;
    const outcome = won ? 'victory' : battle.winnerId === enemyPrepared.id ? 'defeat' : 'timeout';
    let playerBreak = 0;
    for (const log of battle.logs)
        if (log.type === 'break' && log.actorId === playerPrepared.id && typeof log.data?.breakDamagePct === 'number')
            playerBreak += Math.max(0, log.data.breakDamagePct);
    const diagnosis = [];
    if (outcome === 'timeout')
        diagnosis.push('CombatKernel V2 hết giới hạn giao tranh khi cả hai bên vẫn còn HP: tính là không vượt ải.');
    if (input.monster.grade === 'boss' && input.bossMechanic)
        diagnosis.push(`${input.bossMechanic.name}: cơ chế Boss đã được áp trực tiếp trong CombatKernel V2.`);
    return {
        outcome, won, battleSeconds: battle.duration, playerHpRemainingPct, enemyHpRemainingPct,
        playerDamageLog10: safeLog10(playerDamage), enemyDamageLog10: safeLog10(enemyDamage),
        playerDpsLog10: safeLog10(playerDps), enemyDpsLog10: safeLog10(enemyDps),
        enemyHpLog10: safeLog10(enemyMaxHp), playerHpLog10: safeLog10(playerMaxHp),
        playerTimeToKill: won ? battle.duration : Number.POSITIVE_INFINITY,
        enemyTimeToKill: outcome === 'defeat' ? battle.duration : Number.POSITIVE_INFINITY,
        timeoutSeconds, breakPressurePctPerSecond: playerBreak / duration, diagnosis, battle,
        playerEntity: playerPrepared, enemyEntity: enemyPrepared,
    };
}
//# sourceMappingURL=endless-hunt-combat-kernel-v2.js.map