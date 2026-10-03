import assert from 'node:assert/strict';
import fs from 'node:fs';
import { battleDaoSkillsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';
import { mindDaoV2, mindCoreV2, mindPassiveStackV2 } from '../../dist/content/mind-dao-v2.js';
import { REMAINING_DAO_V2_DEFAULTS } from '../../dist/core/battle-dao-v2-contract.js';
import { backendFeatureClosureManifest } from '../runners/feature-closure-manifest.js';

const contract=fs.readFileSync(new URL('../../docs/runtime/MIND_DAO_PRODUCTION_CONTRACT_20260929.md',import.meta.url),'utf8');
const m2bAudit=fs.readFileSync(new URL('../../docs/runtime/MIND_DAO_M2B_CLOSURE_AUDIT_20260929.md',import.meta.url),'utf8');
const m2cAudit=fs.readFileSync(new URL('../../docs/runtime/MIND_DAO_M2C_CLOSURE_AUDIT_20260929.md',import.meta.url),'utf8');
const m3Audit=fs.readFileSync(new URL('../../docs/runtime/MIND_DAO_M3_CLOSURE_AUDIT_20260929.md',import.meta.url),'utf8');
const benchmarkLauncher=fs.readFileSync(new URL('../../tools/web/RUN_MIND_M5_BENCHMARK.cmd',import.meta.url),'utf8');
const benchmarkHarness=fs.readFileSync(new URL('../benchmarks/mind-dao-m4-benchmark.js',import.meta.url),'utf8');

const expectedSkills=[
  'skill.dao.mind.basic','skill.dao.mind.mark','skill.dao.mind.split','skill.dao.mind.interfere','skill.dao.mind.guard',
  'skill.dao.mind.chase','skill.dao.mind.burst','skill.dao.mind.observe','skill.dao.mind.flow','skill.dao.mind.ultimate',
];
const mindSkills=battleDaoSkillsV118.filter(skill=>skill.runtimeV117?.daoBinding==='mind');
assert.deepEqual(mindSkills.map(skill=>skill.id),expectedSkills,'production Mind inventory must remain exactly ten audited skills');

assert.equal(mindCoreV2.dao,'mind');
assert.equal(mindCoreV2.mainOnly,true);
assert.equal(mindCoreV2.name,'Niệm Ảnh');
assert.equal(mindPassiveStackV2.name,'Niệm Lực');
assert.equal(mindPassiveStackV2.cap,20);
assert.equal(mindPassiveStackV2.durationSeconds,12);
assert.equal(mindPassiveStackV2.decayEverySeconds,1);
assert.equal(mindPassiveStackV2.carryAcrossHuntKill,true);
assert.equal(REMAINING_DAO_V2_DEFAULTS.mind.echoEvery,3);
assert.equal(REMAINING_DAO_V2_DEFAULTS.mind.echoCoefficient,.35);
assert.equal(mindDaoV2.passives.length,8,'canonical V2 passive lane must remain p1-p8');
assert.deepEqual(mindDaoV2.passives.map(x=>x.id),Array.from({length:8},(_,i)=>`passive.v2.mind.p${i+1}`));
assert.equal(mindDaoV2.mastery.length,10,'mastery inventory must remain one row per audited skill');
for(const row of mindDaoV2.mastery)
  assert.deepEqual(Object.keys(row.milestones).map(Number),[100,250,500,750,1000],`${row.skillId} must retain all five M2C milestones`);
assert.equal(mindDaoV2.tree.length,8,'V2 realm tree must remain eight rows');
assert(mindSkills.every(skill=>skill.fiveStatScalingV5!==undefined),'M2A closure requires explicit five-stat families on all ten Mind skills');

const manifest=backendFeatureClosureManifest('dao-mind');
assert.equal(manifest.closureReady,false,'dao-mind must remain fail-closed until M5 tuning and final closure phases are complete');
assert.equal(manifest.benchmarkContractGate,'mind-dao-m4-harness-contract-test.js','M4/M5 must retain the deterministic identity-valid harness contract gate');
for(const gate of [
  'mind-dao-production-contract-test.js','mind-dao-skill-form-contract-test.js','mind-dao-m1-seal-transaction-test.js',
  'mind-dao-m1-authority-test.js','mind-dao-m2-five-stat-test.js','mind-dao-m2-passive-architecture-test.js',
  'mind-dao-m2-mastery-architecture-test.js','mind-dao-m3-consumer-parity-test.js','mind-dao-m4-harness-contract-test.js',
]) assert(manifest.gates.includes(gate),`dao-mind scoped gate must retain ${gate}`);
assert(manifest.lockedRegressionFeatures.includes('dao-sword'));
assert(manifest.lockedRegressionFeatures.includes('dao-fist'));

assert.match(contract,/M4 CLOSED \/ M5 ACTIVE/);
assert.match(contract,/Thần Ấn/);
assert.match(contract,/Niệm Lực/);
assert.match(contract,/Niệm Ảnh/);
assert.match(contract,/M1 — CLOSED/);
assert.match(contract,/M2A — CLOSED/);
assert.match(contract,/M2B — CLOSED/);
assert.match(contract,/M2C — CLOSED/);
assert.match(contract,/M3 — CLOSED/);
assert.match(contract,/M4 — CLOSED/);
assert.match(contract,/M5 — ACTIVE/);
assert.match(contract,/1004\.046/);
assert.match(contract,/740\.728/);
assert.match(contract,/556\.468/);
assert.match(contract,/19\.565/);
assert.match(contract,/17ec773bb057e7e6145bea10de91e532bff0efdf/);
assert.doesNotMatch(contract,/M4 — OPEN/,'M4 must not regress to open after identity-valid canonical baseline');

assert.match(m2bAudit,/M2B CLOSED/);
assert.match(m2bAudit,/24c608f1764c9e5a34c65e5c66602e3e30d3a499/);
assert.match(m2cAudit,/M2C CLOSED \/ M3 OPEN/);
assert.match(m2cAudit,/17ec773bb057e7e6145bea10de91e532bff0efdf/);
assert.match(m3Audit,/M3 CLOSED \/ M4 OPEN/);
assert.match(m3Audit,/ee86e719c47d8f3f57f33ea95b676373224ea73c/);
assert.match(m3Audit,/mind-dao-m3-consumer-parity-test\.js/);

assert.match(benchmarkLauncher,/mind-dao-m4-benchmark\.js/i,'M5 launcher must execute the accepted deterministic Mind harness');
assert.doesNotMatch(benchmarkLauncher,/MIND_M5_BENCHMARK_BLOCKED/,'M4 harness installation removes the bootstrap fail-closed placeholder');
assert.match(benchmarkHarness,/MIND_M4_INVALID_IDENTITY_RUN/,'identity-invalid zero-mechanic runs must be rejected');
assert.match(benchmarkHarness,/Diagnostic only: does not modify gameplay or auto-tune coefficients\./);

console.log('MIND DAO PRODUCTION CONTRACT: PASS');