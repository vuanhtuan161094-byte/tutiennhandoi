import { cloneAdventureState } from './world.js';
import { cleanCultivationStateV140 } from './cultivation-v140.js';
import { createDungeonProgressState } from './dungeon.js';
import { createEquipmentState } from './equipment.js';
import { createArtifactState } from './artifact.js';
import { cloneInventoryManagementState, createInventoryManagementState } from './inventory.js';
import { createCharacterSystemState } from './character.js';
import { createWorldSimulationState } from './npc.js';
import { createProfessionState } from './profession.js';
import { createSocialState } from './social.js';
import { createFactionState } from './faction.js';
import { createEconomyState } from './economy.js';
import { createGuidanceState } from './guidance.js';
import { createSoulState } from './soul.js';
import { createDaoState } from './dao.js';
import { createTribulationState } from './tribulation.js';
import { createImmortalState } from './immortal.js';

function startingRealmState(registry) {
    const first = [...registry.realms.values()].sort((a,b)=>a.order-b.order)[0];
    if (!first) throw new Error('Registry has no realms');
    return { realm:{realmId:first.id,maxRealmOrder:first.order}, lifespanYears:first.lifespanYears };
}
function basicDungeons(world) {
    return Object.values(world.dungeons).filter(dungeon => dungeon.tier <= 1).map(dungeon => dungeon.id);
}
export function starterProfessionState(initialMastery = 0) {
    const state = createProfessionState(initialMastery);
    state.tracks.alchemy.knownRecipeIds.push('recipe.alchemy.spirit_gathering_pill');
    state.tracks.forging.knownRecipeIds.push('recipe.forging.black_iron_blade');
    state.tracks.talisman.knownRecipeIds.push('recipe.talisman.mind_guard');
    return state;
}
export function migrateStateV1(registry, world, state) {
    const starting = startingRealmState(registry);
    return {
        ...state,
        knownLocationIds: [...state.knownLocationIds],
        inventory: { ...state.inventory },
        cultivation: cleanCultivationStateV140(state.cultivation),
        dungeons: createDungeonProgressState(basicDungeons(world)),
        equipment: createEquipmentState(),
        artifacts: createArtifactState(1),
        lootManagement: createInventoryManagementState(),
        realm: starting.realm,
        lifespanYears: starting.lifespanYears,
        inheritedOrigins: {},
        character: createCharacterSystemState(),
        worldSimulation: createWorldSimulationState(world, state.worldTimeYears),
        professions: starterProfessionState(),
        social: createSocialState(state.worldTimeYears),
        factions: createFactionState(world.factions ?? {}, state.worldTimeYears), economy: createEconomyState(world.markets ?? {}, state.worldTimeYears), guidance: createGuidanceState(), soul: createSoulState(), dao: createDaoState(), tribulation: createTribulationState(), immortal: createImmortalState(),
    };
}
export function migrateStateV2(registry, world, state) {
    const starting = startingRealmState(registry);
    return {
        ...state,
        knownLocationIds: [...state.knownLocationIds],
        inventory: { ...state.inventory },
        cultivation: cleanCultivationStateV140(state.cultivation),
        dungeons: {
            ...state.dungeons,
            unlockedDungeonIds: [...state.dungeons.unlockedDungeonIds],
            parallelWorkerCapacity: state.dungeons.parallelWorkerCapacity ?? state.dungeons.workers.length,
            workers: state.dungeons.workers.map(worker => ({ ...worker })),
            assignments: Object.fromEntries(Object.entries(state.dungeons.assignments).map(([id, a]) => [id, { ...a, floor: a.floor ?? 1 }])),
        },
        equipment: createEquipmentState(),
        artifacts: createArtifactState(1),
        lootManagement: createInventoryManagementState(),
        realm: starting.realm,
        lifespanYears: starting.lifespanYears,
        inheritedOrigins: {},
        character: createCharacterSystemState(),
        worldSimulation: createWorldSimulationState(world, state.worldTimeYears),
        professions: starterProfessionState(),
        social: createSocialState(state.worldTimeYears),
        factions: createFactionState(world.factions ?? {}, state.worldTimeYears), economy: createEconomyState(world.markets ?? {}, state.worldTimeYears), guidance: createGuidanceState(), soul: createSoulState(), dao: createDaoState(), tribulation: createTribulationState(), immortal: createImmortalState(),
    };
}
export function migrateStateV3(world, state) {
    const dungeons = {
        ...state.dungeons,
        unlockedDungeonIds: [...state.dungeons.unlockedDungeonIds],
        workers: state.dungeons.workers.map(worker => ({ ...worker })),
        assignments: Object.fromEntries(Object.entries(state.dungeons.assignments).map(([id, a]) => [id, { ...a, floor: a.floor ?? 1 }])),
    };
    const migrated = {
        ...state,
        knownLocationIds: [...state.knownLocationIds],
        inventory: { ...state.inventory },
        cultivation: { ...state.cultivation },
        realm: { ...state.realm },
        dungeons,
        equipment: state.equipment ? { items: state.equipment.items.map(item => ({ ...item, stats: { ...item.stats }, tags: [...item.tags], source: { ...item.source } })), equipped: { ...state.equipment.equipped } } : createEquipmentState(),
        artifacts: createArtifactState(1),
        lootManagement: createInventoryManagementState(),
        inheritedOrigins: { ...(state.inheritedOrigins ?? {}) },
        character: createCharacterSystemState(),
        worldSimulation: createWorldSimulationState(world, state.worldTimeYears),
        professions: starterProfessionState(),
        social: createSocialState(state.worldTimeYears),
        factions: createFactionState(world.factions ?? {}, state.worldTimeYears), economy: createEconomyState(world.markets ?? {}, state.worldTimeYears), guidance: createGuidanceState(), soul: createSoulState(), dao: createDaoState(), tribulation: createTribulationState(), immortal: createImmortalState(),
    };
    return cloneAdventureState(migrated);
}
export function migrateStateV5(world, state) {
    const migrated = {
        ...state,
        knownLocationIds: [...state.knownLocationIds],
        inventory: { ...state.inventory },
        cultivation: { ...state.cultivation },
        realm: { ...state.realm },
        dungeons: {
            ...state.dungeons,
            unlockedDungeonIds: [...state.dungeons.unlockedDungeonIds],
            workers: state.dungeons.workers.map(worker => ({ ...worker })),
            assignments: Object.fromEntries(Object.entries(state.dungeons.assignments).map(([id, a]) => [id, { ...a }])),
        },
        equipment: { items: state.equipment.items.map(item => ({ ...item, stats: { ...item.stats }, tags: [...item.tags], source: { ...item.source } })), equipped: { ...state.equipment.equipped } },
        artifacts: state.artifacts ? state.artifacts : createArtifactState(1),
        lootManagement: createInventoryManagementState(),
        inheritedOrigins: { ...(state.inheritedOrigins ?? {}) },
        character: createCharacterSystemState(),
        worldSimulation: createWorldSimulationState(world, state.worldTimeYears),
        professions: starterProfessionState(),
        social: createSocialState(state.worldTimeYears),
        factions: createFactionState(world.factions ?? {}, state.worldTimeYears), economy: createEconomyState(world.markets ?? {}, state.worldTimeYears), guidance: createGuidanceState(), soul: createSoulState(), dao: createDaoState(), tribulation: createTribulationState(), immortal: createImmortalState(),
    };
    return cloneAdventureState(migrated);
}
export function migrateStateV6(world, state) {
    const migrated = {
        ...state,
        lootManagement: state.lootManagement ? cloneInventoryManagementState(state.lootManagement) : createInventoryManagementState(),
        character: createCharacterSystemState(),
        worldSimulation: createWorldSimulationState(world, state.worldTimeYears),
        professions: starterProfessionState(),
        social: createSocialState(state.worldTimeYears),
        factions: createFactionState(world.factions ?? {}, state.worldTimeYears), economy: createEconomyState(world.markets ?? {}, state.worldTimeYears), guidance: createGuidanceState(), soul: createSoulState(), dao: createDaoState(), tribulation: createTribulationState(), immortal: createImmortalState(),
    };
    return cloneAdventureState(migrated);
}
export function migrateStateV7(world, state) {
    const migrated = { ...state, character: createCharacterSystemState(), worldSimulation: createWorldSimulationState(world, state.worldTimeYears), professions: starterProfessionState(), social: createSocialState(state.worldTimeYears), factions: createFactionState(world.factions ?? {}, state.worldTimeYears), economy: createEconomyState(world.markets ?? {}, state.worldTimeYears), guidance: createGuidanceState(), soul: createSoulState(), dao: createDaoState() };
    return cloneAdventureState(migrated);
}
export function migrateStateV8(world, state) {
    const migrated = {
        ...state,
        character: {
            ...state.character,
            knownTechniqueIds: [...state.character.knownTechniqueIds],
            techniqueMastery: { ...state.character.techniqueMastery },
            physiqueIds: [...state.character.physiqueIds],
            bloodlines: state.character.bloodlines.map(lineage => ({ ...lineage })),
            knownSkillIds: [],
            activeSkillIds: [],
            combatAiProfile: undefined,
        },
        worldSimulation: createWorldSimulationState(world, state.worldTimeYears),
        professions: starterProfessionState(),
        social: createSocialState(state.worldTimeYears),
        factions: createFactionState(world.factions ?? {}, state.worldTimeYears), economy: createEconomyState(world.markets ?? {}, state.worldTimeYears), guidance: createGuidanceState(), soul: createSoulState(), dao: createDaoState(), tribulation: createTribulationState(), immortal: createImmortalState(),
    };
    return cloneAdventureState(migrated);
}
