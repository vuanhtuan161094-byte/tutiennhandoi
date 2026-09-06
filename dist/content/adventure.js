import { lightningSwordCultivator, playableMortalCultivator } from './entities.js';
import { thanhHaWorld } from './world.js';
import { createDungeonProgressState } from '../core/dungeon.js';
import { prototypeUnlockedDungeonIds } from './dungeons.js';
import { realms, startingRealmId } from './realms.js';
import { createEquipmentState } from '../core/equipment.js';
import { createArtifactState } from '../core/artifact.js';
import { createInventoryManagementState } from '../core/inventory.js';
import { createCharacterSystemState } from '../core/character.js';
import { combatLoadouts } from './combat-loadouts.js';
import { createWorldSimulationState } from '../core/npc.js';
import { createProfessionState } from '../core/profession.js';
import { createSocialState } from '../core/social.js';
import { createFactionState } from '../core/faction.js';
import { createEconomyState } from '../core/economy.js';
import { createGuidanceState } from '../core/guidance.js';
import { createPlayerFlowState } from '../core/player-flow.js';
import { createSoulState } from '../core/soul.js';
import { createDaoState } from '../core/dao.js';
import { createTribulationState } from '../core/tribulation.js';
import { createImmortalState } from '../core/immortal.js';
import { createFateEmbryoState } from '../core/fate-embryo.js';
import { createOrthodoxyState } from '../core/orthodoxy.js';
import { createGenesisWorldState } from '../core/genesis-world.js';
import { createCollectionProgressStateV12316, grantCollectionItemV12316 } from '../core/collection-progression-v12316.js';
export const prototypeCultivationState = {
    tuVi: 0,
    commitRemainderSeconds: 0,
    retreatBankHours: 3,
    retreatBankDayKey: '',
};
export const prototypePlayerProfile = {
    id: 'profile.prototype.lightning_sword',
    combatEntity: lightningSwordCultivator,
};
/** Production/web profile. Kept separate from the legacy simulation preset so a new mortal never inherits dev combat stats/triggers. */
export const playablePlayerProfile = {
    id: 'profile.playable.mortal',
    combatEntity: playableMortalCultivator,
};
export function createPrototypeAdventureState() {
    const professions = createProfessionState();
    professions.tracks.alchemy.knownRecipeIds.push('recipe.alchemy.spirit_gathering_pill');
    professions.tracks.forging.knownRecipeIds.push('recipe.forging.black_iron_blade');
    professions.tracks.talisman.knownRecipeIds.push('recipe.talisman.mind_guard');
    const collectionV12316 = createCollectionProgressStateV12316();
    return {
        timeModel: 'live-v1',
        worldTimeYears: 0,
        ageYears: 18,
        locationId: thanhHaWorld.startLocationId,
        knownLocationIds: [thanhHaWorld.startLocationId],
        inventory: { 'resource.spirit_stone': 12 },
        cultivation: { ...prototypeCultivationState },
        injury: 0,
        alive: true,
        lifespanYears: realms[startingRealmId].lifespanYears,
        realm: { realmId: startingRealmId, maxRealmOrder: 0 },
        dungeons: createDungeonProgressState(prototypeUnlockedDungeonIds),
        equipment: createEquipmentState(),
        artifacts: createArtifactState(1),
        lootManagement: createInventoryManagementState(),
        inheritedOrigins: {},
        worldSimulation: createWorldSimulationState(thanhHaWorld, 0),
        professions,
        social: createSocialState(0),
        factions: createFactionState(thanhHaWorld.factions ?? {}, 0),
        economy: createEconomyState(thanhHaWorld.markets ?? {}, 0),
        guidance: createGuidanceState(),
        soul: createSoulState(),
        dao: createDaoState(),
        tribulation: createTribulationState(),
        immortal: createImmortalState(),
        fateEmbryo: createFateEmbryoState({}, { aptitude: 60, luck: 52, physiqueId: 'physique.thunder_bones', bloodlineId: 'bloodline.thunder_beast', bloodlinePurity: 22 }, 1),
        orthodoxy: createOrthodoxyState(0),
        genesisWorlds: createGenesisWorldState(0),
        flow: createPlayerFlowState(),
        collectionV12316,
        character: (() => {
            const character = createCharacterSystemState('root.lightning', 'technique.thunder_meridian', ['physique.thunder_bones'], [{ id: 'bloodline.thunder_beast', purity: 22, awakened: false }]);
            const loadout = combatLoadouts.lightningSword;
            character.knownSkillIds = [...loadout.skillIds];
            character.activeSkillIds = [...loadout.skillIds];
            character.combatAiProfile = { name: loadout.aiProfile.name, rules: loadout.aiProfile.rules.map(rule => ({ ...rule, conditions: rule.conditions.map(condition => ({ ...condition })) })) };
            return character;
        })(),
    };
}
/** v0.99 web-new-game state: the player starts as a true mortal, not the old developer combat preset. */
export function createPlayableAdventureState() {
    const state = createPrototypeAdventureState();
    // Playtest-only starter manual: keeps deterministic prototype/balance fixtures unchanged.
    grantCollectionItemV12316(state.collectionV12316, 'manual.1');
    state.character.knownSkillIds = ['skill.basic_strike'];
    state.character.activeSkillIds = ['skill.basic_strike'];
    state.character.combatAiProfile = {
        name: 'Phàm Nhân · Bản Năng',
        rules: [{ skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] }],
    };
    return state;
}
//# sourceMappingURL=adventure.js.map