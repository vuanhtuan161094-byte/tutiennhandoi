// Stable public Session boundary.
// Heavy implementation lives in session-core.js so public authority can be narrowed
// without duplicating gameplay algorithms or changing save/runtime semantics.
export * from './session-core.js';

import { SimulationSession } from './session-core.js';

// V162: V12326 is the only live Collection/Gacha authority. Older Gacha methods remain
// preserved in Git history/core source for forensic compatibility, but are not callable
// through the production Session boundary.
for (const legacyMethod of ['collectionGachaV12316', 'collectionGachaV12325']) {
  if (Object.prototype.hasOwnProperty.call(SimulationSession.prototype, legacyMethod)) {
    delete SimulationSession.prototype[legacyMethod];
  }
}
