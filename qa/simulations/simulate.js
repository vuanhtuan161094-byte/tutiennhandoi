import { CombatEngine } from '../../dist/core/combat.js';
import { analyzeBattle } from '../../dist/core/combat-analytics.js';
import { buildRegistry } from '../../dist/content/registry.js';
import { combatArchetypes, combatBosses } from '../../dist/content/entities.js';
const registry = buildRegistry();
function duel(a, b, count, seedBase) {
    let aWin = 0;
    let bWin = 0;
    let draw = 0;
    let totalDuration = 0;
    for (let i = 1; i <= count; i++) {
        const result = new CombatEngine(registry, seedBase + i, [a, b]).run();
        totalDuration += result.duration;
        if (result.draw || !result.winnerId)
            draw++;
        else if (result.winnerId === a.id)
            aWin++;
        else
            bWin++;
    }
    return { aWin: aWin / count, bWin: bWin / count, draw: draw / count, avgDuration: totalDuration / count };
}
console.log('=== MA TRẬN ARCHETYPE v0.10 ===');
let seedBase = 910_000;
for (let i = 0; i < combatArchetypes.length; i++) {
    for (let j = i + 1; j < combatArchetypes.length; j++) {
        const a = combatArchetypes[i];
        const b = combatArchetypes[j];
        const r = duel(a, b, 300, seedBase);
        seedBase += 1000;
        console.log(`${a.name} vs ${b.name}: ${(r.aWin * 100).toFixed(1)}% / ${(r.bWin * 100).toFixed(1)}% | hòa ${(r.draw * 100).toFixed(1)}% | ${r.avgDuration.toFixed(1)}s`);
    }
}
console.log('\n=== THỬ THÁCH BOSS ===');
for (const boss of combatBosses) {
    for (const archetype of combatArchetypes) {
        const r = duel(archetype, boss, 200, seedBase);
        seedBase += 1000;
        console.log(`${archetype.name} vs ${boss.name}: thắng ${(r.aWin * 100).toFixed(1)}% | ${r.avgDuration.toFixed(1)}s`);
    }
}
const sample = new CombatEngine(registry, 2026081401, [combatArchetypes[0], combatArchetypes[3]]).run();
const analytics = analyzeBattle(sample);
console.log('\n=== ANALYTICS MẪU ===');
for (const [id, data] of Object.entries(analytics.combatants)) {
    console.log(`${id}: damage=${data.damageDealt.toFixed(0)}, heal=${data.healingDone.toFixed(0)}, shield=${data.shieldAbsorbed.toFixed(0)}, dodge=${data.dodges}, crit=${data.critEvents}`);
}
//# sourceMappingURL=simulate.js.map