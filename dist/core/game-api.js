// Stable application API boundary.
// The implementation is intentionally separated from the public surface so retired
// transports cannot silently remain callable forever.
export * from './game-api-core.js';

import { LocalGameApplicationApi } from './game-api-core.js';

// V162 B1: V12326 is the sole player-facing Collection/Gacha authority.
for (const legacyMethod of ['gachaCollectionV12316', 'gachaCollectionV12325']) {
  if (Object.prototype.hasOwnProperty.call(LocalGameApplicationApi.prototype, legacyMethod)) {
    delete LocalGameApplicationApi.prototype[legacyMethod];
  }
}

// V162 B2: establish V12326 as the canonical progression namespace before the UI/transport
// migration. V12325 names stay temporarily as compatibility shims because the current web
// transport still calls them; all canonical calls delegate to the same locked implementation.
const progressionAliases = {
  strengthenCollectionV12326: 'strengthenCollectionV12325',
  advanceCollectionV12326: 'advanceCollectionV12325',
  equipCollectionV12326: 'equipCollectionV12325',
  unequipCollectionV12326: 'unequipCollectionV12325',
};
for (const [canonicalMethod, compatibilityMethod] of Object.entries(progressionAliases)) {
  if (typeof LocalGameApplicationApi.prototype[canonicalMethod] === 'function') continue;
  Object.defineProperty(LocalGameApplicationApi.prototype, canonicalMethod, {
    configurable: true,
    value: function (...args) {
      return this[compatibilityMethod](...args);
    },
  });
}
