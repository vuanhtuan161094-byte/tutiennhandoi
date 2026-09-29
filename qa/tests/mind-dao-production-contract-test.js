import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { battleDaoSkillsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';
import { mindDaoV2, mindCoreV2, mindPassiveStackV2 } from '../../dist/content/mind-dao-v2.js';
import { REMAINING_DAO_V2_DEFAULTS } from '../../dist/core/battle-dao-v2-contract.js';
import { backendFeatureClosureManifest } from '../runners/feature-closure-manifest.js';

const here=fileURLToPath(new URL('.',import.meta.url));
const contract=fs.readFileSync(new URL('../../docs/runtime/MIND_DAO_PRODUCTION_CONTRACT_20260929.md',import.meta.url),'utf8');
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
assert.deepEqual(mindSkills.map(skill=>skill.id),expectedSkills,'M0 must keep the audited 10-skill Thần Niệm inventory exact');

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
assert.equal(mindDaoV2.passives.length,8,'M0 canonical V2 passive lane must remain p1-p8');
assert.deepEqual(mindDaoV2.passives.map(x=>x.id),Array.from({length:8},(_,i)=>`passive.v2.mind.p${i+1}`));
assert.equal(mindDaoV2.mastery.length,10,'M0 mastery inventory must remain one row per audited skill');
assert.equal(mindDaoV2.tree.length,8,'M0 V2 realm tree must remain eight rows');

// Workflow guard learned from Sword/Fist: do not accidentally tune/migrate stats before M1 seam correctness.
assert(mindSkills.every(skill=>skill.fiveStatScalingV5!==undefined),'M2A requires explicit five-stat families on all ten Mind skills');

const manifest=backendFeatureClosureManifest('dao-mind');
assert.equal(manifest.closureReady,false,'dao-mind must fail closed while M0/M1 is open');
assert.equal(manifest.benchmarkContractGate,'mind-dao-production-contract-test.js');
assert(manifest.gates.includes('mind-dao-production-contract-test.js'));
assert(manifest.lockedRegressionFeatures.includes('dao-sword'));
assert(manifest.lockedRegressionFeatures.includes('dao-fist'));

assert.match(contract,/M1 CLOSED \/ M2A OPEN/);
assert.match(contract,/Thần Ấn/);
assert.match(contract,/Niệm Lực/);
assert.match(contract,/Niệm Ảnh/);
assert.match(contract,/mindEchoCounter.*internal cadence counter/i);
assert.match(contract,/Nhiễu ownership is bypassed under V2/);
assert.match(contract,/Auto Burst gates on the wrong semantic/);
assert.match(contract,/Niệm Ảnh runtime does not match the authored snapshot contract/);
assert.match(contract,/five-stat migration is not done/);
assert.match(contract,/Niệm Lực p8 refresh is still read-owned/);

assert.match(benchmarkGuard,/MIND_M5_BENCHMARK_BLOCKED/,'M0 benchmark launcher must fail closed instead of pretending identity evidence exists');
assert.match(benchmarkGuard,/exit \/b 2/i);
void here;

console.log('MIND DAO M0 PRODUCTION CONTRACT: PASS');
