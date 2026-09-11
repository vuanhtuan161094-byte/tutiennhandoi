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

// V162 B2/B3: V12326 owns the public collection-progression authority while the locked
// V12325 implementation remains underneath. Capture the original implementation once,
// expose canonical V12326 methods, then turn the old V12325 names into compatibility
// shims that route back through the canonical methods. This lets the current monolithic
// standalone/UI action strings keep working without retaining a second public authority.
const progressionPairs = {
  strengthenCollectionV12326: 'strengthenCollectionV12325',
  advanceCollectionV12326: 'advanceCollectionV12325',
  equipCollectionV12326: 'equipCollectionV12325',
  unequipCollectionV12326: 'unequipCollectionV12325',
};
for (const [canonicalMethod, compatibilityMethod] of Object.entries(progressionPairs)) {
  const implementation = LocalGameApplicationApi.prototype[compatibilityMethod];
  if (typeof implementation !== 'function') continue;
  Object.defineProperty(LocalGameApplicationApi.prototype, canonicalMethod, {
    configurable: true,
    value: function (...args) {
      return implementation.apply(this, args);
    },
  });
  Object.defineProperty(LocalGameApplicationApi.prototype, compatibilityMethod, {
    configurable: true,
    value: function (...args) {
      return this[canonicalMethod](...args);
    },
  });
}

// V162 B4: V12316 progression names are transport-only compatibility aliases. The old
// standalone action labels may continue to exist for save/client compatibility, but they
// cannot bypass the V12326 public authority.
const v12316ProgressionAliases = {
  strengthenCollectionV12316: 'strengthenCollectionV12326',
  advanceCollectionV12316: 'advanceCollectionV12326',
  equipCollectionV12316: 'equipCollectionV12326',
  unequipCollectionV12316: 'unequipCollectionV12326',
};
for (const [legacyMethod, canonicalMethod] of Object.entries(v12316ProgressionAliases)) {
  if (typeof LocalGameApplicationApi.prototype[legacyMethod] !== 'function') continue;
  Object.defineProperty(LocalGameApplicationApi.prototype, legacyMethod, {
    configurable: true,
    value: function (...args) {
      return this[canonicalMethod](...args);
    },
  });
}
