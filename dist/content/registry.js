import { GameRegistry } from '../core/registry.js';
import { skills } from './skills.js';
import { statuses } from './statuses.js';
import { realms } from './realms.js';
import { equipmentSets, equipmentTemplates } from './equipment.js';
import { artifactResonances, artifactTemplates } from './artifacts.js';
import { bloodlines, characterPhysiques, characterTechniques, spiritualRoots } from './character.js';
import { craftedProducts, professionDefinitions, professionRecipes } from './professions.js';
import { daoDefinitions } from './daos.js';
import { battleDaoSkillsV118, daoPassivesV118, daoVariantsV118 } from './battle-dao-skill-pack-v118.js';
import { bodyDaoProductionSkillsV1 } from './body-dao-production-v1.js';

// Thần Niệm M5 tuning candidate #1.
// One lever only: Tịch Niệm Quan Tâm channel damage. Structure, costs,
// Thần Ấn transactions, control and Niệm Ảnh cadence remain unchanged.
const MIND_M5_OBSERVE_CHANNEL_DAMAGE_COEFFICIENT = 1.10;
function mindDaoM5TuningCandidateV1(skill) {
    if (skill?.id !== 'skill.dao.mind.observe')
        return skill;
    return {
        ...skill,
        productionAuthorityV1: 'mind-dao.m5-candidate.v1',
        channel: {
            ...(skill.channel ?? {}),
            effects: (skill.channel?.effects ?? []).map(effect => effect?.type === 'damage'
                ? { ...effect, coefficient: MIND_M5_OBSERVE_CHANNEL_DAMAGE_COEFFICIENT }
                : { ...effect }),
        },
    };
}

export function buildRegistry() {
    const registry = new GameRegistry();
    for (const dao of daoDefinitions)
        registry.registerDao(dao);
    for (const passive of daoPassivesV118)
        registry.registerDaoPassiveV118(passive);
    for (const variant of daoVariantsV118)
        registry.registerDaoVariantV118(variant);
    for (const profession of professionDefinitions)
        registry.registerProfession(profession);
    for (const product of craftedProducts)
        registry.registerCraftedProduct(product);
    for (const root of Object.values(spiritualRoots))
        registry.registerSpiritualRoot(root);
    for (const technique of Object.values(characterTechniques))
        registry.registerTechnique(technique);
    for (const physique of Object.values(characterPhysiques))
        registry.registerCharacterPhysique(physique);
    for (const bloodline of Object.values(bloodlines))
        registry.registerBloodline(bloodline);
    for (const realm of Object.values(realms))
        registry.registerRealm(realm);
    for (const resonance of artifactResonances)
        registry.registerArtifactResonance(resonance);
    for (const template of artifactTemplates)
        registry.registerArtifactTemplate(template);
    for (const set of equipmentSets)
        registry.registerEquipmentSet(set);
    for (const template of equipmentTemplates)
        registry.registerEquipmentTemplate(template);
    for (const recipe of professionRecipes)
        registry.registerProfessionRecipe(recipe);
    for (const status of statuses)
        registry.registerStatus(status);
    for (const skill of skills)
        registry.registerSkill(skill);
    for (const skill of bodyDaoProductionSkillsV1(battleDaoSkillsV118).map(mindDaoM5TuningCandidateV1))
        registry.registerSkill(skill);
    const errors = registry.validate();
    if (errors.length)
        throw new Error(`Content validation failed:\n${errors.join('\n')}`);
    return registry;
}
//# sourceMappingURL=registry.js.map