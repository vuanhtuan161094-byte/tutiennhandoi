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
const registrySource=fs.readFileSync(new URL('../../dist/content/registry.js',import.meta.url),'utf8');
const mindRuntimeSource=fs.readFileSync(new URL('../../dist/core/mind-dao-v2-runtime.js',import.meta.url),'utf8');

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
assert.equal(manifest.closureReady,true,'dao-mind must remain closure-ready after exact-SHA M6 closure so scoped regressions stay runnable');
assert.equal(manifest.benchmarkContractGate,'mind-dao-m4-harness-contract-test.js','M4/M5 must retain the deterministic identity-valid harness contract gate');
for(const gate of [
  'mind-dao-production-contract-test.js','mind-dao-skill-form-contract-test.js','mind-dao-m1-seal-transaction-test.js',
  'mind-dao-m1-authority-test.js','mind-dao-m2-five-stat-test.js','mind-dao-m2-passive-architecture-test.js',
  'mind-dao-m2-mastery-architecture-test.js','mind-dao-m3-consumer-parity-test.js','mind-dao-m4-harness-contract-test.js',
]) assert(manifest.gates.includes(gate),`dao-mind scoped gate must retain ${gate}`);
assert(manifest.lockedRegressionFeatures.includes('dao-sword'));
assert(manifest.lockedRegressionFeatures.includes('dao-fist'));

assert.match(contract,/CLOSED \/ LOCKED/);
assert.match(contract,/Thần Ấn/);
assert.match(contract,/Niệm Lực/);
assert.match(contract,/Niệm Ảnh/);
assert.match(contract,/M1 — CLOSED/);
assert.match(contract,/M2A — CLOSED/);
assert.match(contract,/M2B — CLOSED/);
assert.match(contract,/M2C — CLOSED/);
assert.match(contract,/M3 — CLOSED/);
assert.match(contract,/M4 — CLOSED/);
assert.match(contract,/M5 — CLOSED/);
assert.match(contract,/M6 — CLOSED/);
assert.match(contract,/d69b33c80b874fb28471855324afbdf95712b730/,'contract must retain the exact verified Mind closure SHA');
assert.match(contract,/MIND_DAO_PRODUCTION_CLOSURE_20261004\.md/,'contract must point to the dated Mind closure record');
assert.match(contract,/1004\.046/);
assert.match(contract,/740\.728/);
assert.match(contract,/556\.468/);
assert.match(contract,/19\.565/);
assert.match(contract,/890\.397/,'contract must retain measured M5-1 Echo DPS');
assert.match(contract,/88\.68%/,'contract must retain measured M5-1 Echo relative DPS');
assert.match(contract,/10\.49%/,'contract must retain measured M5-1 Echo contribution');
assert.match(contract,/675\.563/,'contract must retain measured M5-1 Interference DPS');
assert.match(contract,/67\.28%/,'contract must retain measured M5-1 Interference relative DPS');
assert.match(contract,/1011\.576/,'contract must retain measured M5-2 Burst DPS');
assert.match(contract,/906\.994/,'contract must retain measured M5-2 Echo DPS');
assert.match(contract,/89\.66%/,'contract must retain measured M5-2 Echo relative DPS');
assert.match(contract,/12\.13%/,'contract must retain measured M5-2 Echo contribution');
assert.match(contract,/66\.78%/,'contract must retain measured M5-2 Interference relative DPS');
assert.match(contract,/6971\.022/,'contract must retain measured M5-2 Burst-sourced Echo damage');
assert.match(contract,/1033\.595/,'contract must retain measured M5-3 Burst reference DPS');
assert.match(contract,/940\.190/,'contract must retain measured M5-3 Echo DPS');
assert.match(contract,/90\.96%/,'contract must retain measured M5-3 Echo relative DPS');
assert.match(contract,/15\.23%/,'contract must retain measured M5-3 Echo contribution');
assert.match(contract,/65\.36%/,'contract must retain measured M5-3 Interference relative DPS');
assert.match(contract,/12946\.185/,'contract must retain measured M5-3 Burst-sourced Echo damage');
assert.match(contract,/782\.540/,'contract must retain measured M5-4 Interference DPS');
assert.match(contract,/75\.71%/,'contract must retain measured M5-4 Interference relative DPS');
assert.match(contract,/12\.23%/,'contract must retain measured M5-4 Interference echo contribution');
assert.match(contract,/M5-4 — MEASURED \/ RETAINED · M5 CLOSED/,'contract must record accepted M5-4 evidence');
assert.match(contract,/0\.75 → 2\.80/,'contract must retain the accepted M5-4 Nhiễu direct-damage lever');
assert.match(contract,/17ec773bb057e7e6145bea10de91e532bff0efdf/);
assert.doesNotMatch(contract,/M4 — OPEN/,'M4 must not regress to open after identity-valid canonical baseline');

assert.match(registrySource,/MIND_M5_OBSERVE_CHANNEL_DAMAGE_COEFFICIENT\s*=\s*1\.10/,'M5-1 retained Observe coefficient must stay at 1.10 while later M5 iterations are measured');
assert.match(mindRuntimeSource,/MIND_M5_BURST_SNAPSHOT_RETENTION\s*=\s*1\.30/,'M5-3 must refine only the existing Burst sanitized snapshot multiplier to 1.30');
assert.match(mindRuntimeSource,/MIND_V2_BASE_ECHO_COEFFICIENT\s*=\s*\.35/,'M5 must not alter the canonical 35% base echo coefficient');
assert.match(mindRuntimeSource,/Math\.min\(\.70,/,'M5 must retain the canonical 70% echo safety ceiling');
assert.equal(battleDaoSkillsV118.find(skill=>skill.id==='skill.dao.mind.interfere')?.effects?.find(effect=>effect.type==='damage')?.coefficient,2.80,'M5-4 tunes only the Nhiễu Thần Chỉ direct damage coefficient to 2.80');

assert.match(m2bAudit,/M2B CLOSED/);
assert.match(m2bAudit,/24c608f1764c9e5a34c65e5c66602e3e30d3a499/);
assert.match(m2cAudit,/M2C CLOSED \/ M3 OPEN/);
assert.match(m2cAudit,/17ec773bb057e7e6145bea10de91e532bff0efdf/);
assert.match(m3Audit,/M3 CLOSED \/ M4 OPEN/);
assert.match(m3Audit,/ee86e719c47d8f3f57f33ea95b676373224ea73c/);
assert.match(m3Audit,/mind-dao-m3-consumer-parity-test\.js/);

assert.match(benchmarkLauncher,/mind-dao-m4-benchmark\.js/i,'M5 launcher must execute the accepted deterministic Mind harness');
assert.doesNotMatch(benchmarkLauncher,/MIND_M5_BENCHMARK_BLOCKED/,'M4 harness installation removes the bootstrap fail-closed placeholder');
assert.match(benchmarkLauncher,/sourceHead=/,'M5 log must stamp the exact source HEAD');
assert.match(benchmarkLauncher,/observePatch=/,'M5 log must stamp the retained Observe tuning');
assert.match(benchmarkLauncher,/burstSnapshotPatch=/,'M5 log must stamp the active Burst snapshot tuning');
assert.match(benchmarkLauncher,/interferePatch=/,'M5 log must stamp the active Nhiễu tuning');
assert.match(benchmarkHarness,/MIND_M4_INVALID_IDENTITY_RUN/,'identity-invalid zero-mechanic runs must be rejected');
assert.match(benchmarkHarness,/Diagnostic only: does not modify gameplay or auto-tune coefficients\./);
assert.match(benchmarkHarness,/echoDamageBySkillMean/,'M5 diagnostics must expose source-local echo damage without changing gameplay');

console.log('MIND DAO PRODUCTION CONTRACT: PASS');
