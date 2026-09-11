// Stable application API boundary.
// The implementation is intentionally separated from the public surface so retired
// transports cannot silently remain callable forever.
export * from './game-api-core.js';

import { LocalGameApplicationApi } from './game-api-core.js';

// V162: V12326 is the sole player-facing Collection/Gacha authority.
// Keep V12325 progression methods for now because strengthening/advance/equip still use
// that live implementation; only the retired Gacha entry points are removed here.
for (const legacyMethod of ['gachaCollectionV12316', 'gachaCollectionV12325']) {
  if (Object.prototype.hasOwnProperty.call(LocalGameApplicationApi.prototype, legacyMethod)) {
    delete LocalGameApplicationApi.prototype[legacyMethod];
  }
}
