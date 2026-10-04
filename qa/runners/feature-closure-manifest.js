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

export const MIND_OPEN_GATES=freezeList([
  'mind-dao-production-contract-test.js',
  'mind-dao-skill-form-contract-test.js',
  'mind-dao-m1-seal-transaction-test.js',
  'mind-dao-m1-authority-test.js',
  'mind-dao-m2-five-stat-test.js',
  'mind-dao-m2-passive-architecture-test.js',
  'mind-dao-m2-mastery-architecture-test.js',
  'mind-dao-m3-consumer-parity-test.js',
  'mind-dao-m4-harness-contract-test.js',
]);

export const BODY_CLOSURE_GATES=freezeList([
  'body-dao-production-contract-test.js',
  'body-dao-passive-architecture-test.js',
  'body-dao-resource-transaction-test.js',
  'body-dao-b4-consumer-parity-test.js',
  'body-dao-b5-harness-contract-test.js',
  'body-dao-b6-blood-immovable-correctness-test.js',
  'body-dao-b6-benchmark-contract-test.js',
  'body-dao-b7-content-closure-test.js',
]);

export const SPELL_OPEN_GATES=freezeList([
  'spell-dao-production-contract-test.js',
  'spell-dao-p1-transaction-test.js',
  'spell-dao-p2a-five-stat-test.js',
  'spell-dao-p2b-passive-architecture-test.js',
  'spell-dao-p2c-mastery-architecture-test.js',
  'spell-dao-p3-consumer-parity-test.js',
  'spell-dao-benchmark-contract-test.js',
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

const FORMATION_CANDIDATE_GATES=freezeList([...DAO_SHARED_CLOSURE_GATES,...SWORD_LOCK_REGRESSION_GATES,...FIST_LOCK_REGRESSION_GATES,...BODY_CLOSURE_GATES,...MIND_OPEN_GATES,...SPELL_OPEN_GATES,'poison-dao-production-contract-test.js','poison-dao-transaction-test.js','poison-dao-consumer-parity-test.js','poison-dao-passive-legacy-test.js','poison-dao-benchmark-contract-test.js','formation-dao-transaction-test.js','formation-dao-production-parity-test.js','formation-dao-benchmark-contract-test.js']);

export const BACKEND_FEATURE_CLOSURE_MANIFESTS=Object.freeze({
  'dao-artifact':makeManifest({id:'dao-artifact',label:'Artifact Dao / Ngự Khí Đạo',kind:'dao',closureReady:true,benchmarkCommand:'tools\\web\\RUN_ARTIFACT_P4_BENCHMARK.cmd',benchmarkContractGate:'artifact-dao-benchmark-contract-test.js',lockedRegressionFeatures:['dao-sword','dao-fist','dao-body','dao-mind','dao-spell','dao-poison','dao-formation'],deferredFamilies:DAO_DEFERRED,gates:[...FORMATION_CANDIDATE_GATES,'artifact-dao-transaction-test.js','artifact-dao-production-parity-test.js','artifact-dao-benchmark-contract-test.js']}),
  'dao-formation':makeManifest({
    id:'dao-formation',label:'Formation Dao / Trận Đạo',kind:'dao',closureReady:true,
    benchmarkCommand:'tools\\web\\RUN_FORMATION_P4_BENCHMARK.cmd',benchmarkContractGate:'formation-dao-benchmark-contract-test.js',
    lockedRegressionFeatures:['dao-sword','dao-fist','dao-body','dao-mind','dao-spell','dao-poison'],deferredFamilies:DAO_DEFERRED,
    gates:FORMATION_CANDIDATE_GATES,
  }),
  'dao-poison':makeManifest({
    id:'dao-poison', label:'Poison Dao / Độc Đạo', kind:'dao', closureReady:true,
    benchmarkCommand:'tools\\web\\RUN_POISON_P4_BENCHMARK.cmd',
    benchmarkContractGate:'poison-dao-benchmark-contract-test.js',
    lockedRegressionFeatures:['dao-sword','dao-fist','dao-body','dao-mind','dao-spell'],
    deferredFamilies:DAO_DEFERRED,
    gates:[...DAO_SHARED_CLOSURE_GATES,...SWORD_LOCK_REGRESSION_GATES,...FIST_LOCK_REGRESSION_GATES,...BODY_CLOSURE_GATES,...MIND_OPEN_GATES,...SPELL_OPEN_GATES,'poison-dao-production-contract-test.js','poison-dao-transaction-test.js','poison-dao-consumer-parity-test.js','poison-dao-passive-legacy-test.js','poison-dao-benchmark-contract-test.js'],
  }),
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
  'dao-mind':makeManifest({
    id:'dao-mind',
    label:'Mind Dao / Thần Niệm Đạo',
    kind:'dao',
    // CLOSED/LOCKED: exact-SHA local FULL CLEAN + scoped closure passed on d69b33c80b874fb28471855324afbdf95712b730 (24/24 scoped backend; browser smoke 4/4).
    closureReady:true,
    benchmarkCommand:'tools\\web\\RUN_MIND_M5_BENCHMARK.cmd',
    benchmarkContractGate:'mind-dao-m4-harness-contract-test.js',
    lockedRegressionFeatures:['dao-sword','dao-fist'],
    deferredFamilies:DAO_DEFERRED,
    gates:[...DAO_SHARED_CLOSURE_GATES,...SWORD_LOCK_REGRESSION_GATES,...FIST_LOCK_REGRESSION_GATES,...MIND_OPEN_GATES],
  }),
  'dao-body':makeManifest({
    id:'dao-body',
    label:'Body Dao / Thể Đạo',
    kind:'dao',
    // CLOSED/LOCKED: exact-SHA local FULL CLEAN + scoped closure passed on dbb823404afbe7c82811a3b7700eacc12dd8d265 (23/23 scoped backend).
    closureReady:true,
    benchmarkCommand:'tools\\web\\RUN_BODY_B6_BENCHMARK.cmd',
    benchmarkContractGate:'body-dao-b6-benchmark-contract-test.js',
    lockedRegressionFeatures:['dao-sword','dao-fist'],
    deferredFamilies:DAO_DEFERRED,
    gates:[...DAO_SHARED_CLOSURE_GATES,...SWORD_LOCK_REGRESSION_GATES,...FIST_LOCK_REGRESSION_GATES,...BODY_CLOSURE_GATES],
  }),
  'dao-spell':makeManifest({
    id:'dao-spell',
    label:'Spell Dao / Pháp Đạo',
    kind:'dao',
    benchmarkCommand:'tools\\web\\RUN_SPELL_P4_BENCHMARK.cmd',
    closureReady:true,
    benchmarkContractGate:'spell-dao-benchmark-contract-test.js',
    lockedRegressionFeatures:['dao-sword','dao-fist','dao-body','dao-mind'],
    deferredFamilies:DAO_DEFERRED,
    gates:[...DAO_SHARED_CLOSURE_GATES,...SWORD_LOCK_REGRESSION_GATES,...FIST_LOCK_REGRESSION_GATES,...BODY_CLOSURE_GATES,...MIND_OPEN_GATES,...SPELL_OPEN_GATES],
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
