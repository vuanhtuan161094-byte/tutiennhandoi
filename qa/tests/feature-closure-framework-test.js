import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BACKEND_FEATURE_CLOSURE_MANIFESTS,
  backendFeatureClosureManifest,
  listBackendFeatureClosureIds,
} from '../runners/v140-backend-gate-manifest.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const repoRoot=path.resolve(here,'../..');
const runnerSource=fs.readFileSync(new URL('../runners/v140-backend-gates.js',import.meta.url),'utf8');
const launcherSource=fs.readFileSync(new URL('../../DONG_BO_VA_TEST_FEATURE.cmd',import.meta.url),'utf8');
const ids=listBackendFeatureClosureIds();

assert.deepEqual(ids,['dao-body','dao-fist','dao-mind','dao-sword'],'registered feature ids must be deterministic');
assert.equal(Object.keys(BACKEND_FEATURE_CLOSURE_MANIFESTS).length,ids.length,'feature registry must not hide duplicate ids');

const deferredDaoPattern=/(artifact|relic|spirit-beast|confidant|alchemy|equipment|economy|reincarnation-v4-gameplay-balance|v121-balance-production|v129-global-build-balance|v129-power-budget|v168-combat-stat-runtime-authority)/i;

for(const id of ids){
  const manifest=backendFeatureClosureManifest(id);
  assert.equal(manifest.id,id,`${id} manifest id mismatch`);
  assert.equal(manifest.schema,'feature-closure-manifest.v1',`${id} schema mismatch`);
  assert.equal(manifest.kind,'dao',`${id} must be registered as Dao feature`);
  assert.equal(typeof manifest.closureReady,'boolean',`${id} closureReady must be explicit`);
  assert(manifest.gates.length>0,`${id} has no scoped gates`);
  assert.equal(new Set(manifest.gates).size,manifest.gates.length,`${id} has duplicate gates`);
  assert(manifest.gates.includes('feature-closure-framework-test.js'),`${id} must guard the generic feature framework`);

  // An OPEN feature may be registered at Scope Lock before its deterministic benchmark exists.
  // A READY feature may never close without both benchmark launcher and benchmark contract gate.
  if(manifest.closureReady){
    assert(manifest.benchmarkContractGate,`${id} READY feature must register its benchmark contract gate`);
    assert(manifest.gates.includes(manifest.benchmarkContractGate),`${id} benchmark contract must be in feature closure`);
    assert(manifest.benchmarkCommand,`${id} READY feature must register a deterministic benchmark command`);
  }
  if(manifest.benchmarkContractGate){
    assert(manifest.gates.includes(manifest.benchmarkContractGate),`${id} registered benchmark contract must be in feature closure`);
  }
  if(manifest.benchmarkCommand){
    const benchmarkPath=path.join(repoRoot,manifest.benchmarkCommand.replaceAll('\\','/'));
    assert(fs.existsSync(benchmarkPath),`${id} benchmark command does not exist: ${manifest.benchmarkCommand}`);
  }

  const leaked=manifest.gates.filter(name=>deferredDaoPattern.test(name));
  assert.deepEqual(leaked,[],`${id} leaked deferred subsystem audits: ${leaked.join(', ')}`);
  for(const name of manifest.gates){
    assert(fs.existsSync(path.join(here,name)),`${id} references missing gate ${name}`);
  }
}

const sword=backendFeatureClosureManifest('dao-sword');
for(const gate of ['sword-dao-production-contract-test.js','sword-dao-five-stat-migration-test.js','sword-dao-f6-harness-contract-test.js']){
  assert(sword.gates.includes(gate),`dao-sword missing ${gate}`);
}

const fist=backendFeatureClosureManifest('dao-fist');
for(const gate of [
  'sword-dao-production-contract-test.js',
  'sword-dao-five-stat-migration-test.js',
  'fist-dao-five-stat-migration-test.js',
  'fist-dao-counter-runtime-test.js',
  'fist-dao-q4-harness-contract-test.js',
  'fist-dao-q5-chain-tuning-test.js',
]) assert(fist.gates.includes(gate),`dao-fist missing locked/shared regression ${gate}`);

const mind=backendFeatureClosureManifest('dao-mind');
assert.equal(mind.closureReady,false,'new Thần Niệm slice must remain fail-closed until correctness/parity/benchmark evidence exists');
for(const gate of [
  'sword-dao-production-contract-test.js',
  'sword-dao-five-stat-migration-test.js',
  'sword-dao-f6-harness-contract-test.js',
  'fist-dao-five-stat-migration-test.js',
  'fist-dao-counter-runtime-test.js',
  'fist-dao-q4-harness-contract-test.js',
  'fist-dao-q5-chain-tuning-test.js',
  'mind-dao-production-contract-test.js',
  'mind-dao-skill-form-contract-test.js',
]) assert(mind.gates.includes(gate),`dao-mind missing locked/shared regression ${gate}`);
assert.deepEqual(mind.lockedRegressionFeatures,['dao-sword','dao-fist']);

const body=backendFeatureClosureManifest('dao-body');
assert.equal(body.closureReady,false,'Body B0/B1 must remain fail-closed before passive migration/parity/benchmark evidence');
assert.equal(body.benchmarkCommand,undefined,'Body benchmark must not be invented before B3/B4 correctness and parity are installed');
assert.equal(body.benchmarkContractGate,undefined,'Body benchmark contract is deferred until the benchmark harness is actually authored');
assert(body.gates.includes('body-dao-production-contract-test.js'),'dao-body must lock its B0/B1 production contract');
for(const gate of [
  'sword-dao-production-contract-test.js',
  'sword-dao-five-stat-migration-test.js',
  'fist-dao-five-stat-migration-test.js',
  'fist-dao-counter-runtime-test.js',
]) assert(body.gates.includes(gate),`dao-body missing locked/shared regression ${gate}`);
assert.deepEqual(body.lockedRegressionFeatures,['dao-sword','dao-fist']);

assert(runnerSource.includes("mode==='feature-list'"),'backend runner must expose feature-list mode');
assert(runnerSource.includes("mode==='feature-info'"),'backend runner must expose feature-info mode');
assert(runnerSource.includes("mode==='feature'"),'backend runner must expose feature closure mode');
assert(runnerSource.includes("mode==='closure'"),'full backend closure must remain a separate mode');
assert(runnerSource.includes('tests=closure()'),'full backend closure must remain the independent directory sweep');

assert(launcherSource.includes('run-local-ci.mjs" full --require-clean'),'generic launcher must require FULL CLEAN before scoped closure');
assert(launcherSource.includes('v140-backend-gates.js" feature "!FEATURE!"'),'generic launcher must run the registered feature gate');
assert(!launcherSource.includes('v140-backend-gates.js" closure'),'generic feature launcher must never substitute the full-game closure sweep');

assert.throws(()=>backendFeatureClosureManifest('dao-does-not-exist'),/Unknown feature closure id/,'unknown feature ids must fail closed');

console.log(`FEATURE CLOSURE FRAMEWORK: PASS (${ids.length} registered feature manifests)`);
