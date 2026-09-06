import { ENDLESS_HUNT_FLOOR_POWER_GROWTH, endlessHuntArchetypes, endlessHuntGrades } from '../content/endless-hunt.js';
import { SeededRng } from './rng.js';
import { formatLogMagnitude, ratioFromLogs } from './endless-number.js';
import { endlessHuntBattleSecondsV124, endlessHuntLifeMultiplierV124 } from './combat-pacing-v124.js';
const FLOORS_PER_MAJOR = 800;
function majorForFloor(floor) { return Math.floor((Math.max(1, Math.floor(floor)) - 1) / FLOORS_PER_MAJOR) + 1; }
function localForFloor(floor) { return ((Math.max(1, Math.floor(floor)) - 1) % FLOORS_PER_MAJOR) + 1; }
function globalForMajorLocal(major, local) { return (Math.max(1, Math.floor(major)) - 1) * FLOORS_PER_MAJOR + Math.max(1, Math.min(FLOORS_PER_MAJOR, Math.floor(local))); }
export function createEndlessHuntState() { return { selectedFloor: 1, highestUnlockedFloor: 1, highestClearedFloor: 0, highestUnlockedByMajor: { '1': 1 }, highestClearedByMajor: {}, killsByFloor: {}, totalKills: 0, totalBossKills: 0, trainingPowerLog10: 0, autoAdvance: true, farmFloor: 0, farmKillProgress: 0, farmBatchIndex: 0, farmTotalVirtualKills: 0, farmTotalEliteKills: 0, floorStats: {} }; }
export function cloneEndlessHuntState(state) {
    const s = state ?? createEndlessHuntState();
    const unlocked = { ...(s.highestUnlockedByMajor ?? {}) };
    const cleared = { ...(s.highestClearedByMajor ?? {}) };
    if (Object.keys(unlocked).length === 0) {
        const legacy = Math.max(1, Math.floor(s.highestUnlockedFloor ?? 1));
        unlocked['1'] = Math.min(FLOORS_PER_MAJOR, legacy);
    }
    if (Object.keys(cleared).length === 0 && Math.max(0, Math.floor(s.highestClearedFloor ?? 0)) > 0) {
        const legacy = Math.max(0, Math.floor(s.highestClearedFloor ?? 0));
        cleared['1'] = Math.min(FLOORS_PER_MAJOR, legacy);
    }
    const floorStats = {};
    for (const [key, value] of Object.entries(s.floorStats ?? {})) {
        const v = value;
        floorStats[key] = { attempts: Math.max(0, Math.floor(v.attempts ?? 0)), wins: Math.max(0, Math.floor(v.wins ?? 0)), losses: Math.max(0, Math.floor(v.losses ?? 0)), totalBattleSeconds: Math.max(0, Number(v.totalBattleSeconds ?? 0) || 0), totalCultivationGain: Math.max(0, Number(v.totalCultivationGain ?? 0) || 0), totalSpiritStones: Math.max(0, Number(v.totalSpiritStones ?? 0) || 0), equipmentDrops: Math.max(0, Math.floor(v.equipmentDrops ?? 0)), pillDrops: Math.max(0, Math.floor(v.pillDrops ?? 0)), bossWins: Math.max(0, Math.floor(v.bossWins ?? 0)), lastBattleSeconds: Math.max(0, Number(v.lastBattleSeconds ?? 0) || 0) };
    }
    return { selectedFloor: Math.max(1, Math.floor(s.selectedFloor ?? 1)), highestUnlockedFloor: Math.max(1, Math.floor(s.highestUnlockedFloor ?? 1)), highestClearedFloor: Math.max(0, Math.floor(s.highestClearedFloor ?? 0)), highestUnlockedByMajor: unlocked, highestClearedByMajor: cleared, killsByFloor: { ...(s.killsByFloor ?? {}) }, totalKills: Math.max(0, Math.floor(s.totalKills ?? 0)), totalBossKills: Math.max(0, Math.floor(s.totalBossKills ?? 0)), trainingPowerLog10: Math.max(0, Number(s.trainingPowerLog10 ?? 0) || 0), activeMonster: s.activeMonster ? { ...s.activeMonster, elements: [...(s.activeMonster.elements ?? [])], tags: [...s.activeMonster.tags] } : undefined, autoAdvance: s.autoAdvance !== false, farmFloor: Math.max(0, Math.floor(s.farmFloor ?? s.highestClearedFloor ?? 0)), farmKillProgress: Math.max(0, Math.min(.999999, Number(s.farmKillProgress ?? 0) || 0)), farmBatchIndex: Math.max(0, Math.floor(s.farmBatchIndex ?? 0)), farmTotalVirtualKills: Math.max(0, Math.floor(s.farmTotalVirtualKills ?? s.totalKills ?? 0)), farmTotalEliteKills: Math.max(0, Math.floor(s.farmTotalEliteKills ?? 0)), floorStats };
}
export function createEndlessMetaProgress() { return { bestFloorEver: 0, totalFloorBossKills: 0, legacyPowerLog10: 0 }; }
export function cloneEndlessMetaProgress(value) { return { bestFloorEver: Math.max(0, Math.floor(value?.bestFloorEver ?? 0)), totalFloorBossKills: Math.max(0, Math.floor(value?.totalFloorBossKills ?? 0)), legacyPowerLog10: Math.max(0, Number(value?.legacyPowerLog10 ?? 0) || 0) }; }
export function floorKills(_state, _floor = _state.selectedFloor) { return 0; }
export function isEndlessHuntFloorCleared(state, floor = state.selectedFloor) { const major = majorForFloor(floor), local = localForFloor(floor); return local <= Math.max(0, Math.floor(state.highestClearedByMajor[String(major)] ?? 0)); }
/** V77: an unlocked uncleared floor is immediately a Boss challenge; there is no 20-kill gate. */
export function bossReady(state, floor = state.selectedFloor) { return isEndlessHuntFloorUnlocked(state, floor) && !isEndlessHuntFloorCleared(state, floor); }
export function ensureMajorHuntMapUnlocked(state, majorRealmIndex) { const key = String(Math.max(1, Math.floor(majorRealmIndex))); state.highestUnlockedByMajor[key] = Math.max(1, state.highestUnlockedByMajor[key] ?? 0); state.highestUnlockedFloor = Math.max(state.highestUnlockedFloor, globalForMajorLocal(majorRealmIndex, state.highestUnlockedByMajor[key])); }
export function highestUnlockedLocalFloor(state, majorRealmIndex) { return Math.max(0, Math.min(FLOORS_PER_MAJOR, Math.floor(state.highestUnlockedByMajor[String(Math.max(1, Math.floor(majorRealmIndex)))] ?? 0))); }
export function isEndlessHuntFloorUnlocked(state, floor) { const major = majorForFloor(floor); return localForFloor(floor) <= highestUnlockedLocalFloor(state, major); }
function weightedGrade(rng, luck, profile) {
    const base = profile ?? { common: endlessHuntGrades.common.weight, enhanced: endlessHuntGrades.enhanced.weight, elite: endlessHuntGrades.elite.weight };
    const luckShift = Math.max(0, Math.min(Math.max(0, base.common - 35), luck * .06));
    const weights = [['common', Math.max(20, base.common - luckShift)], ['enhanced', Math.max(0, base.enhanced) + luckShift * .68], ['elite', Math.max(0, base.elite) + luckShift * .32]];
    let roll = rng.next() * weights.reduce((s, x) => s + x[1], 0);
    for (const [id, w] of weights) {
        roll -= w;
        if (roll <= 0)
            return id;
    }
    return 'common';
}
function monsterName(floor, grade, rng) {
    const archetype = endlessHuntArchetypes[Math.floor(rng.next() * endlessHuntArchetypes.length)];
    const root = archetype.names[Math.floor(rng.next() * archetype.names.length)];
    const prefix = grade === 'boss' ? 'Thủ Tầng · ' : grade === 'elite' ? 'Tinh Anh · ' : grade === 'enhanced' ? 'Cường Hóa · ' : '';
    return { name: `${prefix}${root}`, tags: [...archetype.tags], hpBias: archetype.hpBias, attackBias: archetype.attackBias, defenseBias: archetype.defenseBias };
}
function rollElements(rng, pool, maxElements, grade) {
    if (pool.length === 0 || maxElements <= 0)
        return [];
    const desired = grade === 'boss' ? maxElements : grade === 'elite' ? Math.min(maxElements, 2) : 1;
    const copy = [...pool];
    const out = [];
    for (let i = 0; i < desired && copy.length; i++) {
        const index = Math.floor(rng.next() * copy.length);
        out.push(copy.splice(index, 1)[0]);
    }
    return out;
}
export function generateEndlessHuntMonster(state, seed, luck = 50, lootMultiplier = 1, gradeWeights, powerIndex, elementPool = [], maxMonsterElements = 0, challengeBoss = false) {
    const rng = new SeededRng(seed >>> 0);
    const floor = Math.max(1, Math.floor(state.selectedFloor));
    const grade = challengeBoss && bossReady(state, floor) ? 'boss' : weightedGrade(rng, luck, gradeWeights);
    const g = endlessHuntGrades[grade];
    const archetype = monsterName(floor, grade, rng);
    const depth = Math.max(1, Math.floor(powerIndex ?? localForFloor(floor)));
    const basePower = 170;
    const floorLog = Math.log10(basePower) + (depth - 1) * Math.log10(ENDLESS_HUNT_FLOOR_POWER_GROWTH);
    const powerLog10 = floorLog + Math.log10(g.powerMultiplier);
    const fortuneChance = Math.min(.24, .025 + Math.max(0, luck) * .0007);
    const fortune = rng.next() < fortuneChance;
    const great = fortune && rng.next() < .1;
    const fortuneBonusPct = fortune ? (great ? 70 + rng.next() * 55 : 18 + rng.next() * 28) : 0;
    const elements = rollElements(rng, elementPool, maxMonsterElements, grade);
    return { id: `hunt.${floor}.${seed >>> 0}.${grade}`, floor, level: depth, grade, gradeName: g.name, name: archetype.name, tags: [...archetype.tags, ...elements.map(x => `Element:${x}`), grade === 'boss' ? 'Boss' : grade === 'elite' ? 'Elite' : grade === 'enhanced' ? 'Enhanced' : 'Common'], elements, powerLog10, hpLog10: powerLog10 + Math.log10(3.1 * archetype.hpBias * endlessHuntLifeMultiplierV124(grade)), attackLog10: powerLog10 + Math.log10(.86 * archetype.attackBias), defenseLog10: powerLog10 + Math.log10(.52 * archetype.defenseBias), cultivationPct: g.cultivationPct, spiritStoneMultiplier: g.spiritStoneMultiplier, equipmentChancePct: Math.min(100, g.equipmentChancePct * lootMultiplier * (1 + fortuneBonusPct / 100)), fortuneBonusPct };
}
export function ensureEndlessHuntMonster(state, seed, luck = 50, lootMultiplier = 1, gradeWeights, powerIndex, elementPool = [], maxMonsterElements = 0, challengeBoss = false) { const wantsBoss = challengeBoss && bossReady(state); if (!state.activeMonster || state.activeMonster.floor !== state.selectedFloor || (state.activeMonster.grade === 'boss') !== wantsBoss || state.activeMonster.level !== (powerIndex ?? state.activeMonster.level))
    state.activeMonster = generateEndlessHuntMonster(state, seed, luck, lootMultiplier, gradeWeights, powerIndex, elementPool, maxMonsterElements, challengeBoss); return state.activeMonster; }
export function selectEndlessHuntFloor(state, floor, seed, luck = 50, lootMultiplier = 1, gradeWeights, powerIndex, elementPool = [], maxMonsterElements = 0) { const target = Math.floor(floor); if (target < 1 || !isEndlessHuntFloorUnlocked(state, target))
    throw new Error(`Tầng ${target} chưa mở trong Bí Cảnh của đại cảnh giới này.`); state.selectedFloor = target; state.activeMonster = generateEndlessHuntMonster(state, seed, luck, lootMultiplier, gradeWeights, powerIndex, elementPool, maxMonsterElements); }
export function resolveEndlessHuntFight(state, playerPowerLog10, seed, luck = 50, lootMultiplier = 1, enemyPowerMultiplier = 1, gradeWeights, powerIndex, elementPool = [], maxMonsterElements = 0, realCombat, challengeBoss = false) {
    const monster = ensureEndlessHuntMonster(state, seed ^ 0x6d2b79f5, luck, lootMultiplier, gradeWeights, powerIndex, elementPool, maxMonsterElements, challengeBoss);
    const rng = new SeededRng(seed >>> 0);
    const enemyPowerLog10 = monster.powerLog10 + Math.log10(Math.max(.05, enemyPowerMultiplier));
    const jitter = (rng.next() - .5) * .16;
    const margin = playerPowerLog10 - enemyPowerLog10 + jitter;
    const won = realCombat?.won ?? (margin >= -.025);
    const outcome = realCombat?.outcome ?? (won ? 'victory' : 'defeat');
    const powerRatio = ratioFromLogs(playerPowerLog10, enemyPowerLog10, 1e9);
    const battleSeconds = realCombat?.battleSeconds ?? endlessHuntBattleSecondsV124(monster.grade, margin, rng.next());
    const effectiveDamageLog10 = realCombat?.playerDamageLog10 ?? (playerPowerLog10 + Math.log10(.68 + rng.next() * .54));
    const playerHpRemainingPct = realCombat?.playerHpRemainingPct ?? (won ? Math.max(18, 70 - margin * -8) : 0);
    const enemyHpRemainingPct = realCombat?.enemyHpRemainingPct ?? (won ? 0 : Math.max(8, 55 + margin * 20));
    const playerDpsLog10 = realCombat?.playerDpsLog10 ?? playerPowerLog10;
    const enemyDpsLog10 = realCombat?.enemyDpsLog10 ?? enemyPowerLog10;
    let spiritStones = 0, cultivationPct = 0, equipmentChancePct = 0, injuryGain = 0, bossCleared = false, unlockedFloor, trainingPowerLogGain = 0;
    if (won) {
        const g = endlessHuntGrades[monster.grade];
        const depth = Math.max(1, powerIndex ?? localForFloor(monster.floor));
        const floorReward = Math.pow(depth, .72);
        spiritStones = Math.max(1, Math.min(9e15, Math.round((4 + floorReward * 1.2) * g.spiritStoneMultiplier * (.88 + rng.next() * .28) * lootMultiplier * (1 + monster.fortuneBonusPct / 140))));
        cultivationPct = 0;
        equipmentChancePct = Math.min(100, monster.equipmentChancePct);
        trainingPowerLogGain = 0; // V77: Săn Yêu never mints direct Tu Vi; Tu Luyện runs independently at 100%. // v1.10.4: hidden kill-based combat growth is disabled; keep field only for save compatibility.
        if (monster.grade === 'boss') {
            bossCleared = true;
            state.totalBossKills += 1;
            state.highestClearedFloor = Math.max(state.highestClearedFloor, monster.floor);
            state.farmFloor = monster.floor;
            state.farmKillProgress = 0;
            const major = majorForFloor(monster.floor), local = localForFloor(monster.floor), key = String(major);
            state.highestClearedByMajor[key] = Math.max(state.highestClearedByMajor[key] ?? 0, local);
            delete state.killsByFloor[String(monster.floor)];
            if (local < FLOORS_PER_MAJOR) {
                const nextLocal = local + 1;
                state.highestUnlockedByMajor[key] = Math.max(state.highestUnlockedByMajor[key] ?? 1, nextLocal);
                unlockedFloor = globalForMajorLocal(major, nextLocal);
                state.highestUnlockedFloor = Math.max(state.highestUnlockedFloor, unlockedFloor);
                if (state.autoAdvance && monster.floor === state.selectedFloor)
                    state.selectedFloor = unlockedFloor;
            }
        }
        else {
            state.totalKills += 1; /* legacy direct ordinary fights are no longer part of V77 progression. */
        }
        state.activeMonster = undefined;
    }
    else {
        const severity = Math.max(0, 1 - playerHpRemainingPct / 100);
        injuryGain = Math.max(2, Math.min(28, Math.round((outcome === 'timeout' ? 3 : 6) + severity * 18 + rng.next() * 4)));
        state.activeMonster = undefined;
    }
    const playerMaxHpLog10 = realCombat?.playerHpLog10 ?? playerPowerLog10;
    const enemyMaxHpLog10 = realCombat?.enemyHpLog10 ?? monster.hpLog10 + Math.log10(Math.max(.05, enemyPowerMultiplier));
    const enemyDamageLog10 = realCombat?.enemyDamageLog10 ?? (playerHpRemainingPct < 100 ? playerMaxHpLog10 + Math.log10(Math.max(1e-9, 1 - playerHpRemainingPct / 100)) : -Infinity);
    return { won, outcome, monster, playerPowerLog10, enemyPowerLog10, powerRatio, battleSeconds, effectiveDamageLog10, playerMaxHpLog10, enemyMaxHpLog10, enemyDamageLog10, playerHpRemainingPct, enemyHpRemainingPct, playerDpsLog10, enemyDpsLog10, breakPressurePctPerSecond: realCombat?.breakPressurePctPerSecond, cultivationPct, spiritStones, equipmentChancePct, injuryGain, bossCleared, unlockedFloor, trainingPowerLogGain };
}
export function endlessLifeLegacyGain(_hunt) { return 0; }
export function applyEndlessLifeLegacy(meta, hunt) { if (!hunt)
    return 0; meta.bestFloorEver = Math.max(meta.bestFloorEver, hunt.highestClearedFloor); meta.totalFloorBossKills += Math.max(0, hunt.totalBossKills); /* v1.10.4: do not mint hidden Hunt combat power. legacyPowerLog10 is retained only for old-save compatibility. */ /* v1.10.4: do not mint hidden Hunt combat power. legacyPowerLog10 is retained only for old-save compatibility. */ return 0; }
export function endlessHuntDisplay(monster) { return { power: formatLogMagnitude({ log10: monster.powerLog10 }), hp: formatLogMagnitude({ log10: monster.hpLog10 }), attack: formatLogMagnitude({ log10: monster.attackLog10 }), defense: formatLogMagnitude({ log10: monster.defenseLog10 }) }; }
export function recordEndlessHuntFloorStats(state, floor, sample) {
    const key = String(Math.max(1, Math.floor(floor)));
    const prev = state.floorStats[key] ?? { attempts: 0, wins: 0, losses: 0, totalBattleSeconds: 0, totalCultivationGain: 0, totalSpiritStones: 0, equipmentDrops: 0, pillDrops: 0, bossWins: 0, lastBattleSeconds: 0 };
    const next = { ...prev, attempts: prev.attempts + 1, wins: prev.wins + (sample.won ? 1 : 0), losses: prev.losses + (sample.won ? 0 : 1), totalBattleSeconds: prev.totalBattleSeconds + Math.max(.05, Number(sample.battleSeconds) || 0), totalCultivationGain: prev.totalCultivationGain + Math.max(0, Number(sample.cultivationGain) || 0), totalSpiritStones: prev.totalSpiritStones + Math.max(0, Number(sample.spiritStones) || 0), equipmentDrops: prev.equipmentDrops + Math.max(0, Math.floor(sample.equipmentDrops ?? 0)), pillDrops: prev.pillDrops + Math.max(0, Math.floor(sample.pillDrops ?? 0)), bossWins: prev.bossWins + (sample.bossWin ? 1 : 0), lastBattleSeconds: Math.max(.05, Number(sample.battleSeconds) || 0) };
    state.floorStats[key] = next;
    return next;
}
export function endlessHuntFloorEfficiency(floor, stats) {
    if (!stats || stats.attempts <= 0)
        return undefined;
    const minutes = Math.max(1 / 60, stats.totalBattleSeconds / 60);
    const winRatePct = stats.wins / stats.attempts * 100;
    const avgBattleSeconds = stats.totalBattleSeconds / stats.attempts;
    const cultivationPerMinute = stats.totalCultivationGain / minutes;
    const spiritStonesPerMinute = stats.totalSpiritStones / minutes;
    const dropsPerMinute = (stats.equipmentDrops + stats.pillDrops) / minutes;
    const sampleReady = stats.attempts >= 3;
    const reliability = Math.min(1, stats.attempts / 8);
    const winFactor = Math.max(.05, winRatePct / 100);
    const efficiencyScore = (Math.log10(1 + cultivationPerMinute) * 1.15 + Math.log10(1 + spiritStonesPerMinute) * .42 + dropsPerMinute * .45) * winFactor * (.65 + .35 * reliability);
    return { floor, ...stats, winRatePct, avgBattleSeconds, cultivationPerMinute, spiritStonesPerMinute, dropsPerMinute, efficiencyScore, sampleReady };
}
export function bestEndlessHuntFarmFloors(state, majorRealmIndex, limit = 5) {
    const major = Math.max(1, Math.floor(majorRealmIndex));
    const start = globalForMajorLocal(major, 1), end = globalForMajorLocal(major, highestUnlockedLocalFloor(state, major));
    const rows = [];
    for (const [key, stats] of Object.entries(state.floorStats)) {
        const floor = Math.floor(Number(key));
        if (!Number.isFinite(floor) || floor < start || floor > end)
            continue;
        const row = endlessHuntFloorEfficiency(floor, stats);
        if (row)
            rows.push(row);
    }
    return rows.sort((a, b) => (Number(b.sampleReady) - Number(a.sampleReady)) || (b.efficiencyScore - a.efficiencyScore) || (b.floor - a.floor)).slice(0, Math.max(1, Math.floor(limit)));
}
//# sourceMappingURL=endless-hunt.js.map