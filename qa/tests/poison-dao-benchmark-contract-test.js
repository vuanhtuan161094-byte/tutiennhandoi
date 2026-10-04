import assert from 'node:assert/strict';
import fs from 'node:fs';
import { POISON_P4_DURATION_SECONDS,POISON_P4_SEEDS,POISON_P4_PROFILES,validatePoisonP4Profiles,createPoisonP4Player,runPoisonP4Benchmark } from '../benchmarks/poison-dao-p4-benchmark.js';
assert.equal(POISON_P4_DURATION_SECONDS,180);assert.equal(POISON_P4_SEEDS.length,12);assert.equal(new Set(POISON_P4_SEEDS).size,12);assert.deepEqual(validatePoisonP4Profiles(),[]);
assert.deepEqual(POISON_P4_PROFILES.map(p=>Object.values(p.allocation)),[[155,25,15,30,75],[105,25,20,90,60],[85,30,60,30,95]]);
assert.deepEqual(POISON_P4_PROFILES.map(p=>p.activeSkillIds.map(id=>id.split('.').at(-1))),[['bone','heart','insects','consume','calamity'],['bone','heart','insects','mist','calamity'],['bone','heart','mist','transform','guard']]);
for(const p of POISON_P4_PROFILES){const e=createPoisonP4Player(p);assert.equal(e.skillIds.length,7);assert.equal(Object.keys(e.combatBuildV117.skillPracticeTierV125).length,10);assert(Object.values(e.combatBuildV117.skillPracticeTierV125).every(x=>x===1000));assert.equal(Object.keys(e.combatBuildV117.passiveLevelsV125).length,8);assert(Object.values(e.combatBuildV117.passiveLevelsV125).every(x=>x===20));assert.equal(e.stats.actionSpeed,1);}
const result=runPoisonP4Benchmark(),archived=JSON.parse(fs.readFileSync(new URL('../../docs/runtime/POISON_DAO_BENCHMARK_EVIDENCE_20261005.json',import.meta.url),'utf8'));
assert.equal(archived.sourceDigest,'2661cd6e8e0952b09c6be897b5091653e48de8fe729b71c4f54754f39268c530','accepted Poison closure retains its historical source digest');
assert.match(result.sourceDigest,/^[a-f0-9]{64}$/);
const {sourceDigest:currentDigest,...currentGameplay}=result;
const {sourceDigest:acceptedDigest,...acceptedGameplay}=archived;
assert.deepEqual(currentGameplay,acceptedGameplay,'all36 complete accepted Poison gameplay results remain exact after a separately opened Dao');assert.equal(result.runs.length,36);assert.equal(result.identityValid,true);assert.equal(result.attritionValid,true);assert.equal(result.passed,true);
for(const r of result.runs){assert.equal(r.targetStageLeaks,0);assert.equal(r.duplicateRootTransactions,0);assert.equal(r.duration,180);assert(r.ultimateCasts>0);assert(r.cnSpent>0);assert(r.congTamEntries>0);assert(Math.abs(r.stageSeconds.reduce((a,b)=>a+b,0)-180)<.01);assert(r.scheduledTicks>=r.resolvedTicks);}
const replay=runPoisonP4Benchmark({seeds:[POISON_P4_SEEDS[0]]});for(const r of replay.runs)assert.deepEqual(r,result.runs.find(x=>x.profileId===r.profileId&&x.seed===r.seed));
console.log('POISON P4/P5: 36/36 identity valid / fixed bands / all metrics source-bound / exact replay PASS');
