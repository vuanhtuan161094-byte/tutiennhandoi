import { cloneAdventureState } from './world.js';
import { normalizeEquipmentStateV98 } from './equipment.js';
import { clonePotentialState } from './potential.js';
import { cloneCurrentLifeMeta, cloneMetaProgressState } from './life.js';
import { repairAdventureStateReferences } from './save-stability.js';

// V141 pre-release policy: only the current canonical save schema is supported.
// Historical migration ladders are intentionally removed; stale DEV saves must be reset.
export function restoreSimulationSession(SessionClass, saveVersion, registry, world, entityDefinitions, profile, save) {
    if (save.profileId !== profile.id) {
        throw new Error(`Save profile mismatch: ${save.profileId} != ${profile.id}`);
    }
    if (save.schemaVersion !== saveVersion) {
        throw new Error(`Unsupported simulation save version: ${save.schemaVersion}. Current canonical version is ${saveVersion}.`);
    }
    const state = cloneAdventureState(save.state);
    const meta = cloneMetaProgressState(save.meta);
    const currentLife = cloneCurrentLifeMeta(save.currentLife);
    state.timeModel = 'live-v1';
    normalizeEquipmentStateV98(state.equipment, registry.equipmentTemplates);
    repairAdventureStateReferences(state, world, registry);
    state.character.potential = clonePotentialState(undefined);
    return new SessionClass(registry, world, entityDefinitions, profile, save.rootSeed, state, save.actionIndex, save.history, meta, currentLife);
}
