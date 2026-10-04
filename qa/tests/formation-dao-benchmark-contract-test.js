import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runFormationP4Benchmark,FORMATION_P4_PROFILES,FORMATION_P4_SEEDS,createFormationP4Player} from '../benchmarks/formation-dao-p4-benchmark.js';
for(const p of FORMATION_P4_PROFILES){assert.equal(Object.values(p.allocation).reduce((a,b)=>a+b,0),300);const e=createFormationP4Player(p);assert.equal(e.skillIds.length,7);assert.equal(new Set(e.skillIds).size,7);assert.equal(Object.keys(e.combatBuildV117.skillPracticeTierV125).length,10);assert(Object.values(e.combatBuildV117.skillPracticeTierV125).every(x=>x===1000));assert.equal(Object.keys(e.combatBuildV117.passiveLevelsV125).length,8);assert(Object.values(e.combatBuildV117.passiveLevelsV125).every(x=>x===20));}
assert.equal(FORMATION_P4_SEEDS.length,12);assert.equal(new Set(FORMATION_P4_SEEDS).size,12);
const r=runFormationP4Benchmark(),a=JSON.parse(fs.readFileSync(new URL('../../docs/runtime/FORMATION_DAO_BENCHMARK_EVIDENCE_20261005.json',import.meta.url),'utf8'));
assert.equal(a.sourceDigest,'e330849e14096ebed8a6768174cc14c5fdd38f9ba3699bc13dfeaaa3f88c89ef','frozen Formation source digest remains immutable');
const {sourceDigest:currentDigest,...currentGameplay}=r,{sourceDigest:frozenDigest,...frozenGameplay}=a;assert.match(currentDigest,/^[a-f0-9]{64}$/);
assert.deepEqual(currentGameplay,frozenGameplay,'every complete frozen36 Formation gameplay output stays exact during Artifact');assert(r.passed&&r.identityValid&&r.comparativeIdentity);assert.equal(r.runs.length,36);for(const x of r.runs){assert.equal(x.duration,180);assert.equal(x.duplicates,0);assert(x.ultimate>0);assert(x.nourishCompleted>0);}
const replay=runFormationP4Benchmark({seeds:[FORMATION_P4_SEEDS[0]]});for(const x of replay.runs)assert.deepEqual(x,r.runs.find(y=>y.seed===x.seed&&y.profileId===x.profileId));
console.log('FORMATION36 identity/bands/exact source-bound replay PASS');
