import { cloneAdventureState } from './world.js';
import { normalizeEquipmentStateV98 } from './equipment.js';
import { EQUIPMENT_MAX_ENHANCEMENT_V142, equipmentSetDefinitionV142 } from './equipment-v142.js';
import { clonePotentialState } from './potential.js';
import { cloneCurrentLifeMeta, cloneMetaProgressState } from './life.js';
import { repairAdventureStateReferences } from './save-stability.js';

// V165: restore must enforce the same canonical V142 contract as live mutation.
// V142 progression is Rank + Enhancement(+15) + Affix + V142 Set only. Retired legacy
// Grade/Quality/Trait/Dao-Wen/Gem lanes must never be resurrected by stale/tampered saves.
export function normalizeCanonicalEquipmentAfterRestore(state) {
    for (const item of state?.equipment?.items ?? []) {
        if (item?.schema !== 'equipment.v142') continue;
        item.enhancementLevel = Math.max(0, Math.min(EQUIPMENT_MAX_ENHANCEMENT_V142, Math.floor(Number(item.enhancementLevel) || 0)));
        item.tier = 0;
        item.grade = 'mundane';
        item.quality = 'mid';
        item.traitIds = [];
        item.daoInscription = undefined;
        item.gemSockets = [];
        if (item.setId && !equipmentSetDefinitionV142(item.setId)) {
            item.setId = undefined;
            item.setResonanceLevelV143 = 0;
        }
    }
    return state?.equipment;
}

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
    normalizeCanonicalEquipmentAfterRestore(state);
    repairAdventureStateReferences(state, world, registry);
    state.character.potential = clonePotentialState(undefined);
    return new SessionClass(registry, world, entityDefinitions, profile, save.rootSeed, state, save.actionIndex, save.history, meta, currentLife);
}
