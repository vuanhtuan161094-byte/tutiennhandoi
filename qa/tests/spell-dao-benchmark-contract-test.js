import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SPELL_P4_DURATION_SECONDS, SPELL_P4_SEEDS, SPELL_P4_PROFILES, createSpellP4Player, validateSpellP4Profiles, runSpellP4Benchmark } from '../benchmarks/spell-dao-p4-benchmark.js';
assert.equal(SPELL_P4_DURATION_SECONDS,180);assert.equal(SPELL_P4_SEEDS.length,12);assert.equal(new Set(SPELL_P4_SEEDS).size,12);
assert.deepEqual(validateSpellP4Profiles(),[]);
assert.deepEqual(SPELL_P4_PROFILES.map(p=>Object.values(p.allocation)),[[165,25,20,65,25],[115,25,85,55,20],[90,30,20,65,95]]);
for(const profile of SPELL_P4_PROFILES){
 const e=createSpellP4Player(profile);
 assert.equal(e.skillIds.length,7);assert.equal(e.combatBuildV117.learnedDaoPassiveIdsV118.length,8);
 assert(Object.values(e.combatBuildV117.passiveLevelsV125).every(x=>x===20));
 assert.equal(Object.keys(e.combatBuildV117.skillPracticeTierV125).length,10);
 assert(Object.values(e.combatBuildV117.skillPracticeTierV125).every(x=>x===1000));
 assert.equal(e.stats.actionSpeed,1,'no generic TPH speed authority');
}
const result=runSpellP4Benchmark();
const archived=JSON.parse(fs.readFileSync(new URL('../../docs/runtime/SPELL_DAO_BENCHMARK_EVIDENCE_20261004.json',import.meta.url),'utf8'));
assert.deepEqual(result,archived,'committed 36-run evidence and source digest must reproduce on the current source');
assert.equal(result.runs.length,36);assert.equal(result.identityValid,true);assert.equal(result.cadenceValid,true);assert.equal(result.passed,true,'all fixed archetype bands are blocking');
for(const row of result.aggregates)assert.equal(row.validRuns,12);
for(const run of result.runs){
 assert.equal(run.duration,180);assert.equal(run.readinessCount,run.completedCycles-run.wastedReadyCycles,'wasted cycles must not count as new readiness');
 assert.equal(run.danCompletions,run.completedCycles);
 assert(run.cnSpent>0&&run.cnRestored>0&&run.channelCnSpent>0);
 assert(run.phapYUptimeSeconds>0&&run.ultimateCasts>0&&run.breakEvents>0);
}
const paired=runSpellP4Benchmark({seeds:[SPELL_P4_SEEDS[0]]});
for(const row of paired.runs)assert.deepEqual(row,result.runs.find(x=>x.profileId===row.profileId&&x.seed===row.seed),'seed replay reproduces all mechanics and output');
console.log('SPELL DAO P4/P5 BENCHMARK CONTRACT: 36/36 IDENTITY VALID, BANDS PASS, DETERMINISTIC REPLAY PASS');
