import {
  BACKEND_FEATURE_CLOSURE_MANIFESTS,
  backendFeatureClosureManifest,
  listBackendFeatureClosureIds,
} from './feature-closure-manifest.js';

export const BACKEND_FAST_GATES = Object.freeze([
  'v140-cultivation-core-test.js',
  'v143-hunt-reward-authority-test.js',
  'v147-spirit-beast-progression-test.js',
  'v148-confidant-rebuild-test.js',
  'v148-confidant-v129-balance-test.js',
  'v140-zero-legacy-test.js',
  'v129-stat-architecture-test.js',
  'v129-stat-provenance-test.js',
  'v129-stat-source-audit-test.js',
  'v129-major-systems-audit-test.js',
  'v129-combat-parity-test.js',
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
  'mind-dao-production-contract-test.js',
  'mind-dao-skill-form-contract-test.js',
  'feature-closure-framework-test.js',
  'dao-closure-scope-contract-test.js',
  'v129-gameplay-consistency-test.js',
  'v129-dao-suy-alchemy-balance-test.js',
  'v129-hunt-alchemy-tier-regression-test.js',
  'v129-endgame-continuity-structural-test.js',
  'v99-dongfu-production-test.js',
  'v170-reincarnation-meta-runtime-authority-test.js',
  'v171-endgame-runtime-authority-test.js',
  'v172-faction-membership-runtime-authority-test.js',
  'v173-world-to-hunt-runtime-authority-test.js',
  'v174-one-shot-settlement-runtime-authority-test.js',
  'v175-social-family-identity-runtime-authority-test.js',
  'v176-first-life-story-runtime-authority-test.js',
  'v177-session-action-identity-runtime-authority-test.js',
  'v178-current-life-identity-runtime-authority-test.js',
  'v179-guidance-worker-policy-runtime-authority-test.js',
]);

// Compatibility alias for the already-closed Fist slice. New work should use
// BACKEND_FEATURE_CLOSURE_MANIFESTS + runner mode `feature <feature-id>`.
export const BACKEND_DAO_CLOSURE_GATES = backendFeatureClosureManifest('dao-fist').gates;

export {
  BACKEND_FEATURE_CLOSURE_MANIFESTS,
  backendFeatureClosureManifest,
  listBackendFeatureClosureIds,
};
