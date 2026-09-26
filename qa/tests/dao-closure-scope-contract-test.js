import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BACKEND_DAO_CLOSURE_GATES, BACKEND_FAST_GATES } from '../runners/v140-backend-gate-manifest.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const runnerSource=fs.readFileSync(new URL('../runners/v140-backend-gates.js',import.meta.url),'utf8');
const required=[
  'combat-backend-phase1-3-regression-test.js',
  'combat-backend-phase4-6-regression-test.js',
  'combat-backend-phase7-8-parity-test.js',
  'combat-backend-phase9-cutover-test.js',
  'sword-dao-production-contract-test.js',
  'sword-dao-five-stat-migration-test.js',
  'sword-dao-f6-harness-contract-test.js',
  'fist-dao-five-stat-migration-test.js',
  'fist-dao-counter-runtime-test.js',
  'fist-dao-q4-harness-contract-test.js',
  'fist-dao-q5-chain-tuning-test.js',
  'v129-combat-parity-test.js',
  'v129-stat-provenance-test.js',
  'v98-dao-domain-test.js',
];

assert.equal(new Set(BACKEND_DAO_CLOSURE_GATES).size,BACKEND_DAO_CLOSURE_GATES.length,'Dao closure gate list must not contain duplicates');
for(const name of required)assert(BACKEND_DAO_CLOSURE_GATES.includes(name),`Dao closure missing required gate ${name}`);
assert(BACKEND_DAO_CLOSURE_GATES.includes('dao-closure-scope-contract-test.js'),'Dao closure must guard its own scope contract');
assert(BACKEND_FAST_GATES.includes('dao-closure-scope-contract-test.js'),'Fast must detect accidental Dao closure scope drift');

const deferredPattern=/(artifact|relic|spirit-beast|confidant|alchemy|equipment|economy|reincarnation-v4-gameplay-balance|v121-balance-production|v129-global-build-balance|v129-power-budget|v168-combat-stat-runtime-authority)/i;
const leaked=BACKEND_DAO_CLOSURE_GATES.filter(name=>deferredPattern.test(name));
assert.deepEqual(leaked,[],`Dao closure must not pull deferred subsystem audits into the Dao slice: ${leaked.join(', ')}`);

for(const name of BACKEND_DAO_CLOSURE_GATES){
  assert(fs.existsSync(path.join(here,name)),`Dao closure references missing test ${name}`);
}
assert(runnerSource.includes("mode==='dao'"),'Backend runner must expose explicit dao mode');
assert(runnerSource.includes("mode==='closure'?closure()"),'Full backend closure must remain the independent directory sweep');

console.log(`DAO CLOSURE SCOPE CONTRACT: PASS (${BACKEND_DAO_CLOSURE_GATES.length} scoped gates)`);
