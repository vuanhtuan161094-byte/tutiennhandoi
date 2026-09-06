import { cloneAdventureState } from './world.js';
import { normalizeEquipmentStateV98 } from './equipment.js';
import { clonePotentialState, legacyPotentialMigrationPayloadV127 } from './potential.js';
import { cloneCurrentLifeMeta, cloneMetaProgressState, createInitialLifeMeta, createMetaProgressState } from './life.js';
import { createWorldSimulationState } from './npc.js';
import { createSocialState } from './social.js';
import { createFactionState, playerFactionMembership } from './faction.js';
import { createEconomyState } from './economy.js';
import { createGuidanceState } from './guidance.js';
import { clonePlayerFlowState, createFirstLifeStoryState, createPlayerFlowState } from './player-flow.js';
import { cloneSoulState, createSoulState } from './soul.js';
import { createDaoState } from './dao.js';
import { cloneTribulationState, createTribulationState } from './tribulation.js';
import { cloneImmortalState, createImmortalState } from './immortal.js';
import { createFateEmbryoState } from './fate-embryo.js';
import { cloneOrthodoxyState, createOrthodoxyState } from './orthodoxy.js';
import { cloneGenesisWorldState, createGenesisWorldState } from './genesis-world.js';
import { createOuterAscendantState } from './ascendant.js';
import { cloneEndlessHuntState, createEndlessHuntState } from './endless-hunt.js';
import { lootDungeonIdsForRealmV122 } from './loot-economy-v122.js';
import { repairAdventureStateReferences } from './save-stability.js';
import { cloneLifeCorePotentialState } from './reincarnation-progression-v1102.js';
import { migrateStateV1, migrateStateV2, migrateStateV3, migrateStateV5, migrateStateV6, migrateStateV7, migrateStateV8, starterProfessionState } from './session-save-migrations.js';

export function restoreSimulationSession(SessionClass, saveVersion, registry, world, entityDefinitions, profile, save) {
    if (save.profileId !== profile.id) {
        throw new Error(`Save profile mismatch: ${save.profileId} != ${profile.id}`);
    }
    let state;
    let meta = createMetaProgressState();
    let currentLife = createInitialLifeMeta(save.rootSeed);
    if (save.schemaVersion === 1)
        state = migrateStateV1(registry, world, save.state);
    else if (save.schemaVersion === 2)
        state = migrateStateV2(registry, world, save.state);
    else if (save.schemaVersion === 3)
        state = migrateStateV3(world, save.state);
    else if (save.schemaVersion === 4) {
        state = migrateStateV3(world, save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 5) {
        state = migrateStateV5(world, save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 6) {
        state = migrateStateV6(world, save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 7) {
        state = migrateStateV7(world, save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 8) {
        state = migrateStateV8(world, save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 9) {
        state = cloneAdventureState({
            ...save.state,
            dungeons: {
                ...save.state.dungeons,
                highestClearedFloor: Object.fromEntries(save.state.dungeons.unlockedDungeonIds.map(id => [id, 1])),
            },
            worldSimulation: createWorldSimulationState(world, save.state.worldTimeYears),
            professions: starterProfessionState(),
            social: createSocialState(save.state.worldTimeYears),
            factions: createFactionState(world.factions ?? {}, save.state.worldTimeYears), guidance: createGuidanceState(), soul: createSoulState(), dao: createDaoState(), tribulation: createTribulationState(), immortal: createImmortalState(),
        });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 10) {
        state = cloneAdventureState({ ...save.state, worldSimulation: createWorldSimulationState(world, save.state.worldTimeYears), professions: starterProfessionState(), social: createSocialState(save.state.worldTimeYears), factions: createFactionState(world.factions ?? {}, save.state.worldTimeYears), guidance: createGuidanceState(), soul: createSoulState(), dao: createDaoState() });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 11) {
        const oldWorld = save.state.worldSimulation;
        const opportunityClaims = {};
        for (const opportunityId of oldWorld.claimedOpportunityIds ?? []) {
            const claimant = Object.values(oldWorld.npcs).find(npc => npc.claimedOpportunityIds.includes(opportunityId));
            opportunityClaims[opportunityId] = {
                opportunityId, claimantType: 'npc', claimantId: claimant?.id ?? 'unknown', worldYear: oldWorld.simulatedUntilWorldYear,
            };
        }
        state = cloneAdventureState({
            ...save.state,
            worldSimulation: { ...oldWorld, opportunityClaims, playerRelationships: {} },
            professions: starterProfessionState(),
            social: createSocialState(save.state.worldTimeYears),
            factions: createFactionState(world.factions ?? {}, save.state.worldTimeYears), guidance: createGuidanceState(), soul: createSoulState(), dao: createDaoState(), tribulation: createTribulationState(), immortal: createImmortalState(),
        });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 12) {
        state = cloneAdventureState({ ...save.state, professions: starterProfessionState(), social: createSocialState(save.state.worldTimeYears), factions: createFactionState(world.factions ?? {}, save.state.worldTimeYears), guidance: createGuidanceState(), soul: createSoulState(), dao: createDaoState() });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 13) {
        state = cloneAdventureState({ ...save.state, social: createSocialState(save.state.worldTimeYears), factions: createFactionState(world.factions ?? {}, save.state.worldTimeYears), guidance: createGuidanceState(), soul: createSoulState(), dao: createDaoState() });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 14) {
        state = cloneAdventureState({ ...save.state, factions: createFactionState(world.factions ?? {}, save.state.worldTimeYears), economy: createEconomyState(world.markets ?? {}, save.state.worldTimeYears), guidance: createGuidanceState(), soul: createSoulState(), dao: createDaoState() });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 15) {
        state = cloneAdventureState({ ...save.state, economy: createEconomyState(world.markets ?? {}, save.state.worldTimeYears), guidance: createGuidanceState(), soul: createSoulState(), dao: createDaoState() });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 16) {
        state = cloneAdventureState({ ...save.state, guidance: createGuidanceState(), soul: createSoulState(), dao: createDaoState(), tribulation: createTribulationState(), immortal: createImmortalState(), flow: createPlayerFlowState() });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 17) {
        state = cloneAdventureState({ ...save.state, soul: cloneSoulState(save.state.soul), dao: createDaoState(), tribulation: createTribulationState(), immortal: createImmortalState(), flow: createPlayerFlowState() });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 18) {
        const completed = ['first.awakening'];
        if (save.state.realm.maxRealmOrder >= 1)
            completed.push('first.qi_awakened');
        if ((save.state.dungeons.highestClearedFloor['dungeon.spirit_gathering_cave'] ?? 0) >= 1)
            completed.push('first.first_clear');
        const membership = playerFactionMembership(save.state.factions, save.currentLife.lifeId);
        const path = membership ? 'sect' : completed.includes('first.first_clear') ? 'wanderer' : undefined;
        if (path)
            completed.push('first.choose_path');
        state = cloneAdventureState({ ...save.state, soul: cloneSoulState(save.state.soul), dao: createDaoState(), tribulation: createTribulationState(), immortal: createImmortalState(), flow: { ...clonePlayerFlowState(save.state.flow), firstLifeStory: createFirstLifeStoryState(completed, path) } });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 19) {
        state = cloneAdventureState({ ...save.state, soul: cloneSoulState(save.state.soul), dao: createDaoState() });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 20) {
        state = cloneAdventureState({ ...save.state, soul: cloneSoulState(save.state.soul), dao: createDaoState() });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 21) {
        state = cloneAdventureState({ ...save.state, dao: createDaoState(), tribulation: createTribulationState(), immortal: createImmortalState() });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 22) {
        state = cloneAdventureState({ ...save.state, tribulation: createTribulationState(), immortal: createImmortalState() });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 23) {
        state = cloneAdventureState({ ...save.state, tribulation: cloneTribulationState(save.state.tribulation), immortal: createImmortalState() });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 24) {
        state = cloneAdventureState({ ...save.state, immortal: cloneImmortalState(save.state.immortal) });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 25) {
        state = cloneAdventureState({ ...save.state, immortal: cloneImmortalState(save.state.immortal) });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 26) {
        state = cloneAdventureState({ ...save.state, immortal: cloneImmortalState(save.state.immortal) });
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 27) {
        state = cloneAdventureState(save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
        state.fateEmbryo = createFateEmbryoState(meta, currentLife.birth, currentLife.lifeNumber);
    }
    else if (save.schemaVersion === 28) {
        state = cloneAdventureState(save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
        // v0.49 had Mệnh Cơ but no Luân Hồi Ấn/Thai phẩm; deterministic birth seed can safely rebuild the current-life shell.
        state.fateEmbryo = createFateEmbryoState(meta, currentLife.birth, currentLife.lifeNumber, currentLife.reincarnation?.orientationId ?? 'balanced');
    }
    else if (save.schemaVersion === 29) {
        state = cloneAdventureState(save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
        state.orthodoxy = createOrthodoxyState(state.worldTimeYears);
        state.genesisWorlds = createGenesisWorldState(state.worldTimeYears);
    }
    else if (save.schemaVersion === 30) {
        state = cloneAdventureState(save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
        state.orthodoxy = cloneOrthodoxyState(state.orthodoxy ?? createOrthodoxyState(state.worldTimeYears));
        state.genesisWorlds = cloneGenesisWorldState(state.genesisWorlds ?? createGenesisWorldState(state.worldTimeYears));
        state.ascendants = createOuterAscendantState(state.worldTimeYears);
    }
    else if (save.schemaVersion === 31) {
        state = cloneAdventureState(save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
        state.orthodoxy = cloneOrthodoxyState(state.orthodoxy ?? createOrthodoxyState(state.worldTimeYears));
        state.genesisWorlds = cloneGenesisWorldState(state.genesisWorlds ?? createGenesisWorldState(state.worldTimeYears));
        state.ascendants = createOuterAscendantState(state.worldTimeYears);
    }
    else if (save.schemaVersion === 32) {
        state = cloneAdventureState(save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 33) {
        state = cloneAdventureState(save.state);
        state.endlessHunt = cloneEndlessHuntState(save.state.endlessHunt ?? createEndlessHuntState());
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 34) {
        state = cloneAdventureState(save.state);
        state.timeModel = 'live-v1';
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 35) {
        state = cloneAdventureState(save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 36) {
        state = cloneAdventureState(save.state);
        state.endlessHunt = cloneEndlessHuntState(save.state.endlessHunt ?? createEndlessHuntState());
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 37) {
        state = cloneAdventureState(save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 38) {
        // v1.14 migration is conservative: equipment normalization below deterministically hydrates
        // ordinary affixes from the item's authored grade/slot/seed and never invents Đạo Văn.
        state = cloneAdventureState(save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 39) {
        // v1.15 adds only per-item reforgeCount. Equipment normalization below defaults missing counters to 0.
        state = cloneAdventureState(save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 40) {
        // v1.19 persists Công Pháp Biến Thức/Chân Ý knowledge inside BuildFoundation. Clone normalization fills missing arrays conservatively.
        state = cloneAdventureState(save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 41) {
        // v1.22 adds targetable Set/forging dungeons. Unlocking the dungeon shell is deterministic;
        // individual floors remain realm-gated, so migration does not mint items or progression rewards.
        state = cloneAdventureState(save.state);
        state.dungeons.unlockedDungeonIds = [...new Set([...(state.dungeons.unlockedDungeonIds ?? []), ...lootDungeonIdsForRealmV122(state.realm.maxRealmOrder)])];
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 42) {
        // v1.25 migration: BuildFoundation clone hydrates raw 0..1,000,000 Thục Luyện from legacy 0..1000 Mastery and preserves learned Bị Động at Lv10.
        state = cloneAdventureState(save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === 43) {
        // V127 schema 44 retires the six-axis Potential runtime. Its points are migrated/refunded once into corePotential.
        state = cloneAdventureState(save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else if (save.schemaVersion === saveVersion) {
        state = cloneAdventureState(save.state);
        meta = cloneMetaProgressState(save.meta);
        currentLife = cloneCurrentLifeMeta(save.currentLife);
    }
    else
        throw new Error(`Unsupported simulation save version: ${save.schemaVersion}`);
    state.timeModel = 'live-v1';
    normalizeEquipmentStateV98(state.equipment, registry.equipmentTemplates);
    repairAdventureStateReferences(state, world, registry);
    if (save.schemaVersion < 44 && !state.character.potentialV127Migrated) {
        const payload = legacyPotentialMigrationPayloadV127(save.state?.character?.potential);
        const core = state.character.corePotential ?? { life: undefined, permanent: { power:0, body:0, defense:0 } };
        const life = cloneLifeCorePotentialState(core.life);
        life.allocations.power += payload.power;
        life.allocations.body += payload.body;
        life.unspent += payload.refundedUnspent;
        life.lifetimeEarned += payload.migratedTotal;
        state.character.corePotential = { life, permanent: { power:Math.max(0,core.permanent?.power??0), body:Math.max(0,core.permanent?.body??0), defense:Math.max(0,core.permanent?.defense??0) } };
        state.character.potentialV127Migrated = true;
    }
    state.character.potential = clonePotentialState(undefined);
    return new SessionClass(registry, world, entityDefinitions, profile, save.rootSeed, state, save.actionIndex, save.history, meta, currentLife);
        
}
