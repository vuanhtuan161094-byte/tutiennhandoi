import { applyCharacterToEntity } from './character.js';
import { applyEquipmentToEntity } from './equipment.js';
import { applyCollectionEconomyToEntityV12325 } from './gacha-collection-economy-v12325.js';
import { applyReincarnationArtifactTalents, applyReincarnationCombatTalents, techniquePassiveStrengthMultiplier } from './reincarnation-talents.js';
import { applyDaoToEntity } from './dao.js';
import { applyIntegrationToEntity, integrationSummary as deriveIntegrationSummary } from './integration.js';
import { applyGreatVehicleToEntity, greatVehicleSummary as deriveGreatVehicleSummary } from './great-vehicle.js';
import { applyImmortalToEntity } from './immortal.js';
import { applyBirthCombatOrigins } from './birth-randomness.js';
import { activeAlchemyBuff, applyAlchemyStatBonuses, emptyAlchemyAllocation, ensureAlchemyV112State } from './alchemy-v112.js';

/**
 * Canonical player CombatEntity factory.
 *
 * This preserves the locked V168 composition order while removing activity-owned
 * copies of that pipeline. Activities may override encounter-local identity only
 * after this factory returns.
 *
 * Retired Fate Embryo/Mệnh Thai power is intentionally absent from this path.
 */
export function buildPlayerCombatEntityV1(input) {
    const { profileCombatEntity, state, registry, currentLifeId, alchemyPermanentStats } = input;
    if (!profileCombatEntity || !state || !registry)
        throw new Error('CombatEntityFactory requires profileCombatEntity, state and registry');

    const character = applyCharacterToEntity(
        profileCombatEntity,
        state.character,
        registry,
        techniquePassiveStrengthMultiplier(state.inheritedOrigins),
        Boolean(state.inheritedOrigins['birth.v101.authoritative']),
    );
    const equipped = applyEquipmentToEntity(character, state.equipment, registry.equipmentSets);
    const collected = applyCollectionEconomyToEntityV12325(equipped, state.collectionV12316);
    const artifactTalents = applyReincarnationArtifactTalents(collected, state.inheritedOrigins);
    const dao = applyDaoToEntity(artifactTalents, state.dao, registry);
    const integration = deriveIntegrationSummary(state.realm, state.cultivation, state.soul, state.dao, state.artifacts);
    const integrated = applyIntegrationToEntity(dao, integration);
    const great = applyGreatVehicleToEntity(
        integrated,
        deriveGreatVehicleSummary(state.realm, integration, state.dao, state.factions, currentLifeId),
    );
    const immortal = applyImmortalToEntity(great, state.immortal, state.realm, state.immortal.manifestationCapacity);
    const reincarnated = applyReincarnationCombatTalents(immortal, state.inheritedOrigins);
    const born = applyBirthCombatOrigins(reincarnated, state.inheritedOrigins);

    const alchemy = ensureAlchemyV112State(state.economy);
    const lifeBonus = {
        ...emptyAlchemyAllocation(),
        power: Math.max(0, alchemy.life.lifeStatBonus?.power ?? 0),
        body: Math.max(0, alchemy.life.lifeStatBonus?.body ?? 0),
        defense: Math.max(0, alchemy.life.lifeStatBonus?.defense ?? 0),
    };
    const permanent = { ...emptyAlchemyAllocation(), ...(alchemyPermanentStats ?? {}) };
    const buff = activeAlchemyBuff(alchemy, state.worldTimeYears);
    return applyAlchemyStatBonuses(born, lifeBonus, permanent, buff);
}
