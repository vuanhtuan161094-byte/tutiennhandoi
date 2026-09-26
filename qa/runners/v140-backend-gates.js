import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runGateFiles } from './gate-runner.js';
import {
  BACKEND_FAST_GATES,
  BACKEND_DAO_CLOSURE_GATES,
  backendFeatureClosureManifest,
  listBackendFeatureClosureIds,
} from './v140-backend-gate-manifest.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const testsDir=path.resolve(here,'../tests');
const repoRoot=path.resolve(here,'../..');
const mode=String(process.argv[2]??'fast').trim().toLowerCase();
const featureId=String(process.argv[3]??'').trim().toLowerCase();
const excluded=name=>name.includes('transport')||name.includes('frontend')||name.includes('web-launcher')||name.includes('performance')||name==='pvp-v91-balance-test.js';
const closure=()=>fs.readdirSync(testsDir).filter(n=>n.endsWith('test.js')&&!excluded(n)).sort();

if(mode==='feature-info'){
  const manifest=backendFeatureClosureManifest(featureId);
  console.log(`Feature: ${manifest.id}`);
  console.log(`Label: ${manifest.label}`);
  console.log(`Closure ready: ${manifest.closureReady?'YES':'NO'}`);
  console.log(`Gates: ${manifest.gates.length}`);
  console.log(`Benchmark: ${manifest.benchmarkCommand||'not registered'}`);
  console.log(`Benchmark contract: ${manifest.benchmarkContractGate||'not registered'}`);
  console.log(`Locked regression features: ${manifest.lockedRegressionFeatures.join(', ')||'none'}`);
  process.exit(0);
}

let tests;
let label;
if(mode==='fast'){
  tests=[...BACKEND_FAST_GATES];
  label='V140 BACKEND FAST';
}else if(mode==='dao'){
  // Compatibility alias retained for the already-closed Fist slice.
  tests=[...BACKEND_DAO_CLOSURE_GATES];
  label='V140 BACKEND DAO';
}else if(mode==='feature'){
  const manifest=backendFeatureClosureManifest(featureId);
  if(!manifest.closureReady){
    throw new Error(`Feature ${manifest.id} is registered but closureReady=false. Complete correctness/parity/identity-valid benchmark before closure.`);
  }
  tests=[...manifest.gates];
  label=`V140 BACKEND FEATURE ${manifest.id.toUpperCase()}`;
}else if(mode==='closure'){
  tests=closure();
  label='V140 BACKEND CLOSURE';
}else{
  throw new Error(`Use fast | feature-info <id> | feature <id> | dao | closure. Features: ${listBackendFeatureClosureIds().join(', ')}`);
}

for(const n of tests)if(!fs.existsSync(path.join(testsDir,n)))throw new Error(`Missing gate ${n}`);
await runGateFiles({ label, tests, testsDir, repoRoot });
