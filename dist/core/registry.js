import { validateSkillRuntimeV117 } from './skill-runtime-v117.js';
export class GameRegistry {
    skills = new Map();
    statuses = new Map();
    elementalReactions = new Map();
    realms = new Map();
    equipmentTemplates = new Map();
    equipmentSets = new Map();
    artifactTemplates = new Map();
    artifactResonances = new Map();
    spiritualRoots = new Map();
    techniques = new Map();
    characterPhysiques = new Map();
    bloodlines = new Map();
    professions = new Map();
    professionRecipes = new Map();
    craftedProducts = new Map();
    daos = new Map();
    daoPassivesV118 = new Map();
    daoVariantsV118 = new Map();
    registerDaoPassiveV118(definition) {
        if (this.daoPassivesV118.has(definition.id))
            throw new Error(`Duplicate Dao passive id: ${definition.id}`);
        this.daoPassivesV118.set(definition.id, definition);
        return this;
    }
    daoPassiveV118(id) { const value = this.daoPassivesV118.get(id); if (!value)
        throw new Error(`Unknown Dao passive: ${id}`); return value; }
    registerDaoVariantV118(definition) {
        if (this.daoVariantsV118.has(definition.id))
            throw new Error(`Duplicate Dao variant id: ${definition.id}`);
        this.daoVariantsV118.set(definition.id, definition);
        return this;
    }
    daoVariantV118(id) { const value = this.daoVariantsV118.get(id); if (!value)
        throw new Error(`Unknown Dao variant: ${id}`); return value; }
    registerDao(definition) {
        if (this.daos.has(definition.id))
            throw new Error(`Duplicate dao id: ${definition.id}`);
        this.daos.set(definition.id, definition);
        return this;
    }
    dao(id) {
        const value = this.daos.get(id);
        if (!value)
            throw new Error(`Unknown dao: ${id}`);
        return value;
    }
    registerProfession(definition) {
        if (this.professions.has(definition.id))
            throw new Error(`Duplicate profession id: ${definition.id}`);
        this.professions.set(definition.id, definition);
        return this;
    }
    registerProfessionRecipe(recipe) {
        if (this.professionRecipes.has(recipe.id))
            throw new Error(`Duplicate profession recipe id: ${recipe.id}`);
        this.professionRecipes.set(recipe.id, recipe);
        return this;
    }
    registerCraftedProduct(product) {
        if (this.craftedProducts.has(product.id))
            throw new Error(`Duplicate crafted product id: ${product.id}`);
        this.craftedProducts.set(product.id, product);
        return this;
    }
    professionRecipe(id) {
        const value = this.professionRecipes.get(id);
        if (!value)
            throw new Error(`Unknown profession recipe: ${id}`);
        return value;
    }
    craftedProduct(id) {
        const value = this.craftedProducts.get(id);
        if (!value)
            throw new Error(`Unknown crafted product: ${id}`);
        return value;
    }
    registerSpiritualRoot(root) {
        if (this.spiritualRoots.has(root.id))
            throw new Error(`Duplicate spiritual root id: ${root.id}`);
        this.spiritualRoots.set(root.id, root);
        return this;
    }
    registerTechnique(technique) {
        if (this.techniques.has(technique.id))
            throw new Error(`Duplicate technique id: ${technique.id}`);
        this.techniques.set(technique.id, technique);
        return this;
    }
    registerCharacterPhysique(physique) {
        if (this.characterPhysiques.has(physique.id))
            throw new Error(`Duplicate character physique id: ${physique.id}`);
        this.characterPhysiques.set(physique.id, physique);
        return this;
    }
    registerBloodline(bloodline) {
        if (this.bloodlines.has(bloodline.id))
            throw new Error(`Duplicate bloodline id: ${bloodline.id}`);
        this.bloodlines.set(bloodline.id, bloodline);
        return this;
    }
    spiritualRoot(id) {
        const value = this.spiritualRoots.get(id);
        if (!value)
            throw new Error(`Unknown spiritual root: ${id}`);
        return value;
    }
    technique(id) {
        const value = this.techniques.get(id);
        if (!value)
            throw new Error(`Unknown technique: ${id}`);
        return value;
    }
    characterPhysique(id) {
        const value = this.characterPhysiques.get(id);
        if (!value)
            throw new Error(`Unknown character physique: ${id}`);
        return value;
    }
    bloodline(id) {
        const value = this.bloodlines.get(id);
        if (!value)
            throw new Error(`Unknown bloodline: ${id}`);
        return value;
    }
    registerElementalReaction(reaction) {
        if (this.elementalReactions.has(reaction.id))
            throw new Error(`Duplicate elemental reaction id: ${reaction.id}`);
        this.elementalReactions.set(reaction.id, reaction);
        return this;
    }
    elementalReaction(id) {
        const value = this.elementalReactions.get(id);
        if (!value)
            throw new Error(`Unknown elemental reaction: ${id}`);
        return value;
    }
    registerSkill(skill) {
        if (this.skills.has(skill.id))
            throw new Error(`Duplicate skill id: ${skill.id}`);
        this.skills.set(skill.id, skill);
        return this;
    }
    registerRealm(realm) {
        if (this.realms.has(realm.id))
            throw new Error(`Duplicate realm id: ${realm.id}`);
        this.realms.set(realm.id, realm);
        return this;
    }
    registerStatus(status) {
        if (this.statuses.has(status.id))
            throw new Error(`Duplicate status id: ${status.id}`);
        this.statuses.set(status.id, status);
        return this;
    }
    registerArtifactTemplate(template) {
        if (this.artifactTemplates.has(template.id))
            throw new Error(`Duplicate artifact template id: ${template.id}`);
        this.artifactTemplates.set(template.id, template);
        return this;
    }
    registerArtifactResonance(resonance) {
        if (this.artifactResonances.has(resonance.id))
            throw new Error(`Duplicate artifact resonance id: ${resonance.id}`);
        this.artifactResonances.set(resonance.id, resonance);
        return this;
    }
    artifactTemplate(id) {
        const value = this.artifactTemplates.get(id);
        if (!value)
            throw new Error(`Unknown artifact template: ${id}`);
        return value;
    }
    artifactResonance(id) {
        const value = this.artifactResonances.get(id);
        if (!value)
            throw new Error(`Unknown artifact resonance: ${id}`);
        return value;
    }
    registerEquipmentTemplate(template) {
        if (this.equipmentTemplates.has(template.id))
            throw new Error(`Duplicate equipment template id: ${template.id}`);
        this.equipmentTemplates.set(template.id, template);
        return this;
    }
    registerEquipmentSet(set) {
        if (this.equipmentSets.has(set.id))
            throw new Error(`Duplicate equipment set id: ${set.id}`);
        this.equipmentSets.set(set.id, set);
        return this;
    }
    equipmentTemplate(id) {
        const value = this.equipmentTemplates.get(id);
        if (!value)
            throw new Error(`Unknown equipment template: ${id}`);
        return value;
    }
    equipmentSet(id) {
        const value = this.equipmentSets.get(id);
        if (!value)
            throw new Error(`Unknown equipment set: ${id}`);
        return value;
    }
    skill(id) {
        const value = this.skills.get(id);
        if (!value)
            throw new Error(`Unknown skill: ${id}`);
        return value;
    }
    realm(id) {
        const value = this.realms.get(id);
        if (!value)
            throw new Error(`Unknown realm: ${id}`);
        return value;
    }
    status(id) {
        const value = this.statuses.get(id);
        if (!value)
            throw new Error(`Unknown status: ${id}`);
        return value;
    }
    validate() {
        const errors = [];
        for (const realm of this.realms.values()) {
            if (realm.nextRealmId && !this.realms.has(realm.nextRealmId))
                errors.push(`${realm.id}: unknown next realm ${realm.nextRealmId}`);
            if ((realm.requiredTuVi ?? 0) < 0)
                errors.push(`${realm.id}: requiredTuVi must be non-negative`);
        }
        for (const template of this.equipmentTemplates.values()) {
            if (template.setId && !this.equipmentSets.has(template.setId))
                errors.push(`${template.id}: unknown equipment set ${template.setId}`);
        }
        for (const set of this.equipmentSets.values()) {
            const thresholds = set.bonuses.map(bonus => bonus.pieces);
            if (thresholds.some(value => value <= 0))
                errors.push(`${set.id}: set bonus pieces must be positive`);
        }
        for (const template of this.artifactTemplates.values()) {
            if (template.resonanceId && !this.artifactResonances.has(template.resonanceId))
                errors.push(`${template.id}: unknown artifact resonance ${template.resonanceId}`);
            for (const trigger of [...(template.triggers ?? []), ...(template.awakenedTriggers ?? [])]) {
                if (trigger.chancePct < 0)
                    errors.push(`${template.id}: trigger chance < 0`);
            }
        }
        for (const resonance of this.artifactResonances.values()) {
            if (resonance.bonuses.some(bonus => bonus.pieces <= 0))
                errors.push(`${resonance.id}: resonance bonus pieces must be positive`);
        }
        for (const recipe of this.professionRecipes.values()) {
            if (!this.professions.has(recipe.professionId))
                errors.push(`${recipe.id}: unknown profession ${recipe.professionId}`);
            if (recipe.output.kind === 'stack' && !this.craftedProducts.has(recipe.output.productId))
                errors.push(`${recipe.id}: unknown crafted product ${recipe.output.productId}`);
            if (recipe.output.kind === 'equipment' && !this.equipmentTemplates.has(recipe.output.templateId))
                errors.push(`${recipe.id}: unknown equipment template ${recipe.output.templateId}`);
            if (recipe.difficulty <= 0 || recipe.timeYears <= 0)
                errors.push(`${recipe.id}: invalid difficulty/time`);
            if (recipe.ingredients.some(requirement => requirement.options.length === 0))
                errors.push(`${recipe.id}: ingredient requirement has no options`);
        }
        for (const product of this.craftedProducts.values()) {
            if (!this.professions.has(product.professionId))
                errors.push(`${product.id}: unknown profession ${product.professionId}`);
        }
        for (const technique of this.techniques.values()) {
            if (technique.contentV119) {
                const seen = new Set();
                for (const milestone of technique.contentV119.milestones) {
                    if (![20, 40, 60, 80, 100].includes(milestone.at))
                        errors.push(`${technique.id}: mốc Lĩnh Ngộ v1.19 không hợp lệ ${milestone.at}`);
                    if (seen.has(milestone.at))
                        errors.push(`${technique.id}: trùng mốc Lĩnh Ngộ ${milestone.at}`);
                    seen.add(milestone.at);
                    for (const id of milestone.unlockSkillIds ?? [])
                        if (!this.skills.has(id))
                            errors.push(`${technique.id}: unknown v1.19 skill ${id}`);
                    for (const id of milestone.unlockPassiveIds ?? [])
                        if (!this.daoPassivesV118.has(id))
                            errors.push(`${technique.id}: unknown v1.19 passive ${id}`);
                    for (const id of milestone.unlockVariantIds ?? [])
                        if (!this.daoVariantsV118.has(id))
                            errors.push(`${technique.id}: unknown v1.19 variant ${id}`);
                    for (const m of milestone.modifiers ?? [])
                        if (m.domain?.toLowerCase() === 'totaldamage')
                            errors.push(`${technique.id}: TotalDamage domain bị cấm.`);
                }
                if (seen.size !== 5)
                    errors.push(`${technique.id}: Công Pháp v1.19 phải có đủ mốc 20/40/60/80/100.`);
                if (technique.contentV119.elementMode === 'fixed' && !technique.contentV119.fixedRoot)
                    errors.push(`${technique.id}: Cố Định Hành phải có fixedRoot.`);
            }
        }
        for (const root of this.spiritualRoots.values()) {
            for (const [affinity, value] of Object.entries(root.affinities)) {
                if (value < 0 || value > 100)
                    errors.push(`${root.id}: affinity ${affinity} must be 0..100`);
            }
        }
        for (const dao of this.daos.values()) {
            if (dao.interpretations.length === 0)
                errors.push(`${dao.id}: Dao must define at least one interpretation`);
            const ids = new Set();
            for (const interpretation of dao.interpretations) {
                if (ids.has(interpretation.id))
                    errors.push(`${dao.id}: duplicate interpretation ${interpretation.id}`);
                ids.add(interpretation.id);
                for (const trigger of [...(interpretation.grantedTriggers ?? []), ...(interpretation.domainTriggers ?? [])]) {
                    for (const effect of trigger.effects) {
                        if (effect.type === 'applyStatus' && !this.statuses.has(effect.statusId))
                            errors.push(`${dao.id}/${interpretation.id}: unknown status ${effect.statusId}`);
                    }
                }
            }
        }
        for (const passive of this.daoPassivesV118.values()) {
            if (!['sword', 'fist', 'body', 'spell', 'poison', 'artifact', 'formation', 'mind'].includes(passive.dao))
                errors.push(`${passive.id}: invalid Dao ${passive.dao}`);
        }
        for (const variant of this.daoVariantsV118.values()) {
            if (!['sword', 'fist', 'body', 'spell', 'poison', 'artifact', 'formation', 'mind'].includes(variant.dao))
                errors.push(`${variant.id}: invalid Dao ${variant.dao}`);
        }
        for (const skill of this.skills.values()) {
            errors.push(...validateSkillRuntimeV117(skill));
            if (skill.castTime < 0)
                errors.push(`${skill.id}: castTime < 0`);
            if (skill.cooldown < 0)
                errors.push(`${skill.id}: cooldown < 0`);
            if (skill.spiritCost < 0)
                errors.push(`${skill.id}: spiritCost < 0`);
            for (const effect of skill.effects) {
                if (effect.type === 'applyStatus' && !this.statuses.has(effect.statusId)) {
                    errors.push(`${skill.id}: unknown status ${effect.statusId}`);
                }
                if (effect.type === 'damage' && (effect.targetMaxHpPct ?? 0) > 0) {
                    if (!(effect.targetMaxHpAttackCapCoefficient && effect.targetMaxHpAttackCapCoefficient > 0)) {
                        errors.push(`${skill.id}: offensive % Max HP damage requires targetMaxHpAttackCapCoefficient > 0`);
                    }
                    if ((effect.targetMaxHpPct ?? 0) > 100)
                        errors.push(`${skill.id}: targetMaxHpPct > 100`);
                }
            }
        }
        return errors;
    }
}
//# sourceMappingURL=registry.js.map