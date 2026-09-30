// Canonical life/reincarnation boundary.
// The existing implementation is preserved byte-for-byte in life-runtime-core.js so
// connector-side fixes can stay atomic instead of replacing the monolithic runtime blindly.
export * from './life-runtime-core.js';

import { buildReincarnatedState as buildReincarnatedStateCore } from './life-runtime-core.js';
import { cloneSpiritualRootStateV145 } from './spiritual-root-v145.js';

export function buildReincarnatedState(previous, world, registry, meta, birth, worldYearsUntilPlayable, plan = {}) {
    const reincarnated = buildReincarnatedStateCore(previous, world, registry, meta, birth, worldYearsUntilPlayable, plan);
    // Linh Căn V145 is permanent progression. Reincarnation rerolls the new-life identity axes,
    // but must not reset Linh Căn level, nourishment, meridians, insights or Hunt pity progress.
    reincarnated.character.spiritualRootV145 = cloneSpiritualRootStateV145(previous.character.spiritualRootV145);
    return reincarnated;
}
