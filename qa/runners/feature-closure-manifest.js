const freezeList=values=>Object.freeze([...new Set(values)]);

export const DAO_SHARED_CLOSURE_GATES=freezeList([
  'feature-closure-framework-test.js',
  'combat-backend-phase1-3-regression-test.js',
  'combat-backend-phase4-6-regression-test.js',
  'combat-backend-phase7-8-parity-test.js',
  'combat-backend-phase9-cutover-test.js',
  'v129-combat-parity-test.js',
  'v129-stat-provenance-test.js',
  'v98-dao-domain-test.js',
]);

export const SWORD_LOCK_REGRESSION_GATES=freezeList([
  'sword-dao-production-contract-test.js',
  'sword-dao-five-stat-migration-test.js',
  'sword-dao-f6-harness-contract-test.js',
]);

export const FIST_LOCK_REGRESSION_GATES=freezeList([
  'fist-dao-five-stat-migration-test.js',
  'fist-dao-counter-runtime-test.js',
  'fist-dao-q4-harness-contract-test.js',
  'fist-dao-q5-chain-tuning-test.js',
]);

const makeManifest=spec=>Object.freeze({
  schema:'feature-closure-manifest.v1',
  workflow:'docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md',
  closureReady:false,
  ...spec,
  gates:freezeList(spec.gates??[]),
  deferredFamilies:freezeList(spec.deferredFamilies??[]),
  lockedRegressionFeatures:freezeList(spec.lockedRegressionFeatures??[]),
});

const DAO_DEFERRED=[
  'artifact/relic',
  'spirit-beast',
  'confidant',
  'equipment-balance',
  'alchemy-balance',
  'economy',
  'reincarnation-global-balance',
  'collection-global-balance',
];

export const BACKEND_FEATURE_CLOSURE_MANIFESTS=Object.freeze({
  'dao-sword':makeManifest({
    id:'dao-sword',
    label:'Sword Dao / Kiếm Đạo',
    kind:'dao',
    closureReady:true,
    benchmarkCommand:'tools\\web\\RUN_SWORD_F6_BENCHMARK.cmd',
    benchmarkContractGate:'sword-dao-f6-harness-contract-test.js',
    lockedRegressionFeatures:[],
    deferredFamilies:DAO_DEFERRED,
    gates:[...DAO_SHARED_CLOSURE_GATES,...SWORD_LOCK_REGRESSION_GATES],
  }),
  'dao-fist':makeManifest({
    id:'dao-fist',
    label:'Fist Dao / Quyền Đạo',
    kind:'dao',
    closureReady:true,
    benchmarkCommand:'tools\\web\\RUN_FIST_Q4_BENCHMARK.cmd',
    benchmarkContractGate:'fist-dao-q4-harness-contract-test.js',
    lockedRegressionFeatures:['dao-sword'],
    deferredFamilies:DAO_DEFERRED,
    gates:[...DAO_SHARED_CLOSURE_GATES,...SWORD_LOCK_REGRESSION_GATES,...FIST_LOCK_REGRESSION_GATES],
  }),
});

export function listBackendFeatureClosureIds(){
  return Object.keys(BACKEND_FEATURE_CLOSURE_MANIFESTS).sort();
}

export function backendFeatureClosureManifest(featureId){
  const id=String(featureId??'').trim().toLowerCase();
  const manifest=BACKEND_FEATURE_CLOSURE_MANIFESTS[id];
  if(!manifest){
    throw new Error(`Unknown feature closure id "${featureId??''}". Available: ${listBackendFeatureClosureIds().join(', ')}`);
  }
  return manifest;
}
