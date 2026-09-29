import assert from 'node:assert/strict';
import fs from 'node:fs';
import { battleDaoSkillsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';
import { mindDaoV2, mindCoreV2, mindPassiveStackV2 } from '../../dist/content/mind-dao-v2.js';
import { REMAINING_DAO_V2_DEFAULTS } from '../../dist/core/battle-dao-v2-contract.js';
import { backendFeatureClosureManifest } from '../runners/feature-closure-manifest.js';

const contract=fs.readFileSync(new URL('../../docs/runtime/MIND_DAO_PRODUCTION_CONTRACT_20260929.md',import.meta.url),'utf8');
const audit=fs.readFileSync(new URL('../../docs/runtime/MIND_DAO_M2B_CLOSURE_AUDIT_20260929.md',import.meta.url),'utf8');
const benchmarkGuard=fs.readFileSync(new URL('../../tools/web/RUN_MIND_M5_BENCHMARK.cmd',import.meta.url),'utf8');

const expectedSkills=[
  'skill.dao.mind.basic',
  'skill.dao.mind.mark',
  'skill.dao.mind.split',
  'skill.dao.mind.interfere',
  'skill.dao.mind.guard',
  'skill.dao.mind.chase',
  'skill.dao.mind.burst',
  'skill.dao.mind.observe',
  'skill.dao.mind.flow',
  'skill.dao.mind.ultimate',
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
assert.equal(mindDaoV2.tree.length,8,'V2 realm tree must remain eight rows');
assert(mindSkills.every(skill=>skill.fiveStatScalingV5!==undefined),'M2A closure requires explicit five-stat families on all ten Mind skills');

const manifest=backendFeatureClosureManifest('dao-mind');
assert.equal(manifest.closureReady,false,'dao-mind must remain fail-closed until parity, benchmark and tuning phases are complete');
assert.equal(manifest.benchmarkContractGate,'mind-dao-production-contract-test.js','M4 has not yet replaced the fail-closed benchmark contract placeholder');
for(const gate of [
  'mind-dao-production-contract-test.js',
  'mind-dao-skill-form-contract-test.js',
  'mind-dao-m1-seal-transaction-test.js',
  'mind-dao-m1-authority-test.js',
  'mind-dao-m2-five-stat-test.js',
  'mind-dao-m2-passive-architecture-test.js',
  'mind-dao-m2-mastery-architecture-test.js',
]) assert(manifest.gates.includes(gate),`dao-mind scoped gate must retain ${gate}`);
assert(manifest.lockedRegressionFeatures.includes('dao-sword'));
assert(manifest.lockedRegressionFeatures.includes('dao-fist'));

assert.match(contract,/M2B CLOSED \/ M2C OPEN/);
assert.match(contract,/Thần Ấn/);
assert.match(contract,/Niệm Lực/);
assert.match(contract,/Niệm Ảnh/);
assert.match(contract,/M1 — CLOSED/);
assert.match(contract,/M2A — CLOSED/);
assert.match(contract,/M2B — CLOSED/);
assert.match(contract,/M2C — OPEN/);
assert.doesNotMatch(contract,/ownership is bypassed under V2/i,'resolved M1 blocker must not remain a current-state claim');
assert.doesNotMatch(contract,/five-stat migration is not done/i,'resolved M2A blocker must not remain a current-state claim');
assert.doesNotMatch(contract,/p8 refresh is still read-owned/i,'resolved M2B blocker must not remain a current-state claim');

assert.match(audit,/M2B CLOSED/);
assert.match(audit,/24c608f1764c9e5a34c65e5c66602e3e30d3a499/);
assert.match(audit,/36519206674/);
assert.match(audit,/closureReady:false/);

assert.match(benchmarkGuard,/MIND_M5_BENCHMARK_BLOCKED/,'benchmark launcher must remain fail closed before M4 identity harness exists');
assert.match(benchmarkGuard,/exit \/b 2/i);

console.log('MIND DAO PRODUCTION CONTRACT: PASS');
