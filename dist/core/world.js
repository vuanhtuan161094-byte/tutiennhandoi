import { cloneDungeonProgressState } from './dungeon.js';
import { cloneEquipmentState } from './equipment.js';
import { cloneArtifactState } from './artifact.js';
import { cloneInventoryManagementState } from './inventory.js';
import { cloneCharacterSystemState } from './character.js';
import { cloneProfessionState } from './profession.js';
import { cloneWorldSimulationState } from './npc.js';
import { cloneSocialState } from './social.js';
import { cloneFactionState } from './faction.js';
import { cloneEconomyState } from './economy.js';
import { cloneGuidanceState } from './guidance.js';
import { clonePlayerFlowState } from './player-flow.js';
import { cloneSoulState } from './soul.js';
import { cloneDaoState } from './dao.js';
import { cloneTribulationState } from './tribulation.js';
import { cloneImmortalState } from './immortal.js';
import { cloneFateEmbryoState } from './fate-embryo.js';
import { cloneOrthodoxyState } from './orthodoxy.js';
import { cloneGenesisWorldState } from './genesis-world.js';
import { cloneOuterAscendantState } from './ascendant.js';
import { cloneEndlessHuntState } from './endless-hunt.js';
import { cloneCollectionProgressStateV12316 } from './collection-progression-v12316.js';
export function cloneAdventureState(state) {
    return {
        ...state,
        knownLocationIds: [...state.knownLocationIds],
        inventory: { ...state.inventory },
        cultivation: { ...state.cultivation },
        realm: { ...state.realm },
        dungeons: cloneDungeonProgressState(state.dungeons),
        equipment: cloneEquipmentState(state.equipment),
        artifacts: cloneArtifactState(state.artifacts),
        lootManagement: cloneInventoryManagementState(state.lootManagement),
        inheritedOrigins: { ...state.inheritedOrigins },
        character: cloneCharacterSystemState(state.character),
        worldSimulation: cloneWorldSimulationState(state.worldSimulation),
        professions: cloneProfessionState(state.professions),
        social: cloneSocialState(state.social),
        factions: cloneFactionState(state.factions),
        economy: cloneEconomyState(state.economy),
        guidance: cloneGuidanceState(state.guidance),
        soul: cloneSoulState(state.soul),
        dao: cloneDaoState(state.dao),
        tribulation: cloneTribulationState(state.tribulation),
        immortal: cloneImmortalState(state.immortal),
        fateEmbryo: cloneFateEmbryoState(state.fateEmbryo),
        orthodoxy: cloneOrthodoxyState(state.orthodoxy),
        genesisWorlds: cloneGenesisWorldState(state.genesisWorlds),
        ascendants: cloneOuterAscendantState(state.ascendants),
        flow: clonePlayerFlowState(state.flow),
        endlessHunt: cloneEndlessHuntState(state.endlessHunt),
        huntCombatRuntimeV117: state.huntCombatRuntimeV117 ? { fiveElements: { ...state.huntCombatRuntimeV117.fiveElements }, daoStateV118: state.huntCombatRuntimeV117.daoStateV118 ? { ...state.huntCombatRuntimeV117.daoStateV118 } : undefined, ultimateGauge: state.huntCombatRuntimeV117.ultimateGauge, battleDaoStateV2: state.huntCombatRuntimeV117.battleDaoStateV2 ? structuredClone(state.huntCombatRuntimeV117.battleDaoStateV2) : undefined } : undefined,
        collectionV12316: cloneCollectionProgressStateV12316(state.collectionV12316),
        pvpV91: state.pvpV91 ? structuredClone(state.pvpV91) : undefined,
    };
}
export function locationOf(world, locationId) {
    const location = world.locations[locationId];
    if (!location)
        throw new Error(`Unknown location: ${locationId}`);
    return location;
}
//# sourceMappingURL=world.js.map