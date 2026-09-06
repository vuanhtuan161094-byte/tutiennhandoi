import { controlCultivator, fireCultivator, heavySwordCultivator, lightningSwordCultivator, poisonCultivator, windSwordCultivator, } from './entities.js';
function preset(id, entity) {
    return {
        id,
        name: entity.aiProfile.name,
        skillIds: [...entity.skillIds],
        aiProfile: {
            name: entity.aiProfile.name,
            rules: entity.aiProfile.rules.map(rule => ({ ...rule, conditions: rule.conditions.map(condition => ({ ...condition })) })),
        },
    };
}
export const combatLoadouts = {
    lightningSword: preset('loadout.lightning_sword', lightningSwordCultivator),
    heavySword: preset('loadout.heavy_sword', heavySwordCultivator),
    control: preset('loadout.control', controlCultivator),
    fire: preset('loadout.fire', fireCultivator),
    poison: preset('loadout.poison', poisonCultivator),
    windSword: preset('loadout.wind_sword', windSwordCultivator),
};
//# sourceMappingURL=combat-loadouts.js.map