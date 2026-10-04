import assert from 'node:assert/strict';
import fs from 'node:fs';
import { battleDaoSkillsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';
import { spellDaoV2 } from '../../dist/content/spell-dao-v2.js';
import { backendFeatureClosureManifest } from '../runners/feature-closure-manifest.js';

const contract=fs.readFileSync(new URL('../../docs/runtime/SPELL_DAO_PRODUCTION_CONTRACT_20261004.md',import.meta.url),'utf8');
const skills=battleDaoSkillsV118.filter(skill=>skill.runtimeV117?.daoBinding==='spell');
const ids=[
  'skill.dao.spell.basic','skill.dao.spell.light','skill.dao.spell.channel','skill.dao.spell.restore',
  'skill.dao.spell.shield','skill.dao.spell.seal','skill.dao.spell.burst','skill.dao.spell.break',
  'skill.dao.spell.transform','skill.dao.spell.ultimate',
];
assert.deepEqual(skills.map(skill=>skill.id),ids,'stable spell inventory must remain exactly ten skills');
assert.equal(skills.filter(skill=>skill.runtimeV117.slotClass==='basic').length,1);
assert.equal(skills.filter(skill=>skill.runtimeV117.slotClass==='active').length,8);
assert.equal(skills.filter(skill=>skill.runtimeV117.slotClass==='ultimate').length,1);
assert.equal(spellDaoV2.passives.length,8);
assert.deepEqual(spellDaoV2.passives.map(x=>x.id),Array.from({length:8},(_,i)=>'passive.v2.spell.p'+(i+1)));
assert.equal(spellDaoV2.mastery.length,10);
for(const row of spellDaoV2.mastery)
  assert.deepEqual(Object.keys(row.milestones).map(Number),[100,250,500,750,1000],row.skillId+' must keep five mastery milestones');
assert.equal(spellDaoV2.tree.length,8);
const manifest=backendFeatureClosureManifest('dao-spell');
assert.equal(manifest.closureReady,true,'P6 is ready only after all correctness, parity, deterministic identity and band gates pass');
for(const gate of ['spell-dao-p2c-mastery-architecture-test.js','spell-dao-p3-consumer-parity-test.js','spell-dao-benchmark-contract-test.js']) assert(manifest.gates.includes(gate));
const evidence=JSON.parse(fs.readFileSync(new URL('../../docs/runtime/SPELL_DAO_BENCHMARK_EVIDENCE_20261004.json',import.meta.url),'utf8'));
assert.equal(evidence.passed,true);assert.equal(evidence.runs.length,36);
assert.deepEqual(manifest.lockedRegressionFeatures,['dao-sword','dao-fist','dao-body','dao-mind']);
assert(manifest.gates.includes('spell-dao-production-contract-test.js'));
assert.equal(manifest.benchmarkContractGate,'spell-dao-benchmark-contract-test.js');
for(const phrase of [
  'Tốc Pháp → Thi Triển → Dẫn Pháp','Diễn Pháp is a one-shot readiness flag',
  'Five-stat ownership','P0 contract and manifest','closureReady:false','Pháp Ý','Secondary Pháp',
])
  assert(contract.includes(phrase),'production contract must define '+phrase);
assert(skills.every(skill=>skill.spellDaoV1!==undefined || ['basic','restore','shield','transform','ultimate'].some(role=>skill.id.endsWith('.'+role))),
  'every Spell Active role must explicitly opt into wheel/payoff or remain a non-eligible utility');
console.log('SPELL DAO P0 PRODUCTION CONTRACT PASS');
