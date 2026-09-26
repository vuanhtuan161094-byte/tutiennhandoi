import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BACKEND_DAO_CLOSURE_GATES,
  BACKEND_FAST_GATES,
  backendFeatureClosureManifest,
} from '../runners/v140-backend-gate-manifest.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const runnerSource=fs.readFileSync(new URL('../runners/v140-backend-gates.js',import.meta.url),'utf8');
const fist=backendFeatureClosureManifest('dao-fist');

assert.deepEqual(BACKEND_DAO_CLOSURE_GATES,fist.gates,'legacy dao mode must remain a compatibility alias of dao-fist feature closure');
assert.equal(new Set(BACKEND_DAO_CLOSURE_GATES).size,BACKEND_DAO_CLOSURE_GATES.length,'Dao compatibility gate list must not contain duplicates');
assert(BACKEND_FAST_GATES.includes('feature-closure-framework-test.js'),'Fast must guard generic feature closure framework drift');
assert(BACKEND_FAST_GATES.includes('dao-closure-scope-contract-test.js'),'Fast must keep compatibility scope coverage');

for(const name of [
  'combat-backend-phase1-3-regression-test.js',
  'combat-backend-phase4-6-regression-test.js',
  'combat-backend-phase7-8-parity-test.js',
  'combat-backend-phase9-cutover-test.js',
  'sword-dao-production-contract-test.js',
  'sword-dao-five-stat-migration-test.js',
  'fist-dao-five-stat-migration-test.js',
  'fist-dao-counter-runtime-test.js',
  'fist-dao-q4-harness-contract-test.js',
  'fist-dao-q5-chain-tuning-test.js',
  'v129-combat-parity-test.js',
  'v129-stat-provenance-test.js',
  'v98-dao-domain-test.js',
]) assert(BACKEND_DAO_CLOSURE_GATES.includes(name),`Dao compatibility closure missing required gate ${name}`);

const deferredPattern=/(artifact|relic|spirit-beast|confidant|alchemy|equipment|economy|reincarnation-v4-gameplay-balance|v121-balance-production|v129-global-build-balance|v129-power-budget|v168-combat-stat-runtime-authority)/i;
const leaked=BACKEND_DAO_CLOSURE_GATES.filter(name=>deferredPattern.test(name));
assert.deepEqual(leaked,[],`Dao compatibility closure must not pull deferred subsystem audits into the Dao slice: ${leaked.join(', ')}`);

for(const name of BACKEND_DAO_CLOSURE_GATES){
  assert(fs.existsSync(path.join(here,name)),`Dao compatibility closure references missing test ${name}`);
}
assert(runnerSource.includes("mode==='dao'"),'Backend runner must retain explicit dao compatibility mode');
assert(runnerSource.includes("mode==='feature'"),'Backend runner must expose generic feature mode');
assert(runnerSource.includes('tests=closure()'),'Full backend closure must remain the independent directory sweep');

console.log(`DAO CLOSURE SCOPE COMPATIBILITY: PASS (${BACKEND_DAO_CLOSURE_GATES.length} scoped gates)`);
