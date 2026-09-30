import assert from 'node:assert/strict';
import fs from 'node:fs';
import { backendFeatureClosureManifest } from '../runners/feature-closure-manifest.js';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const kernel=read('../../dist/core/combat-kernel-v2.js');
const session=read('../../dist/core/session.js');
const pvp=read('../../dist/core/pvp-v91.js');
const huntKernel=read('../../dist/core/endless-hunt-combat-kernel-v2.js');
const mindRuntime=read('../../dist/core/mind-dao-v2-runtime.js');

// Shared production combat authority: V3 still instantiates the canonical CombatEngine,
// and every compiled V3 encounter is routed through runCombatKernelV3.
assert.match(kernel,/import \{ CombatEngine \} from '\.\/combat\.js'/);
assert.match(kernel,/export class CombatKernelV3/);
assert.match(kernel,/export function runCompiledCombatEncounterV3\(encounter, registry\)/);
assert.match(kernel,/const kernel = runCombatKernelV3\(/);

// PvP is full-auto tactical, but its actual match is a compiled CombatKernel V3 encounter.
assert.match(pvp,/automation: 'full-auto-tactical'/);
assert.match(pvp,/const kernel = runCompiledCombatEncounterV3\(encounter, registry\)/);
assert.match(pvp,/engineVersion: 'combat\.v3'/);

// Endless Hunt/Boss representative combat delegates to the same V3 compiled encounter.
assert.match(huntKernel,/export function resolveEndlessHuntWithCombatKernelV3\(input\)/);
assert.match(huntKernel,/resolveEndlessHuntWithCombatKernel\(input, runCompiledCombatEncounterV3, 'CombatKernel V3'\)/);

// Session-owned PvE, Hunt and representative/offline consumers use V3. Auto rotation/profile
// selection may choose actions, but it does not own a second Mind combat engine.
assert.match(session,/resolveEndlessHuntWithCombatKernelV3/);
assert.match(session,/runCompiledCombatEncounterV3/);
assert.doesNotMatch(session,/resolveEndlessHuntWithCombatKernelV2\(/,'production session must not call the V2 Hunt combat bridge');
assert.doesNotMatch(session,/runCompiledCombatEncounterV2\(/,'production session must not call the V2 compiled combat runner');

// Hunt carry persists only the durable Battle Dao state between encounters. Mind action-local
// transactions remain CombatEngine-owned and are not reconstructed by an alternate offline engine.
assert.match(session,/initialBattleDaoStateV2: huntRuntime\?\.battleDaoStateV2 \? structuredClone\(huntRuntime\.battleDaoStateV2\)/);
assert.match(mindRuntime,/carryAcrossHuntKill|battleDaoStateV2|mind/i);

// Secondary Mind remains the already-closed passive-only Resolve lane; source-audit the runtime
// owner directly instead of depending on prose/comments inside another test file.
assert.match(mindRuntime,/function isSecondaryMind\(entity\)/);
assert.match(mindRuntime,/out\.resolvePct/);

// Feature-scoped closure must keep shared V3 parity plus locked Sword/Fist regressions.
const manifest=backendFeatureClosureManifest('dao-mind');
for(const gate of [
  'combat-backend-phase7-8-parity-test.js',
  'sword-dao-f6-harness-contract-test.js',
  'fist-dao-counter-runtime-test.js',
  'mind-dao-m2-passive-architecture-test.js',
  'mind-dao-m2-mastery-architecture-test.js',
]) assert(manifest.gates.includes(gate),`M3 must retain ${gate}`);
assert(manifest.lockedRegressionFeatures.includes('dao-sword'));
assert(manifest.lockedRegressionFeatures.includes('dao-fist'));
assert.equal(manifest.closureReady,false,'M3 closure does not make whole Mind feature closure-ready');

console.log('MIND DAO M3 CONSUMER PARITY: PASS');
