import { learnSkill as learnCombatSkill, learnTechnique } from './character.js';
import { adjustPlayerNpcRelationship } from './npc.js';
import { unlockEligibleProfessionRecipes } from './profession.js';
import { playerFactionMembership } from './faction.js';
import { scaleContentEventEffectByTalents } from './content-event-director.js';
import { soulCloneAuthorityCapacityV127, syncSoulDungeonWorkers } from './soul.js';
import { chooseDaoInterpretation, discoverDao, setDaoDomainActive, setMainDao } from './dao.js';

// V141: content-event reward/effect mutation is isolated from the central session container.
export function applySessionContentEventEffectV141(effect, definition, choice) {
        if (!effect)
            return;
        const actualEffect = definition && choice ? (scaleContentEventEffectByTalents(effect, definition, choice, this.stateValue.inheritedOrigins) ?? effect) : effect;
        for (const [resourceId, delta] of Object.entries(actualEffect.resources ?? {})) {
            const current = this.stateValue.inventory[resourceId] ?? 0;
            if (delta < 0 && current + delta < -1e-9)
                throw new Error(`Not enough ${resourceId} for content event`);
            this.stateValue.inventory[resourceId] = Math.max(0, current + delta);
        }
        const eventTuVi = Math.max(0, Number(actualEffect.tuVi) || 0);
        if (eventTuVi > 0)
            this.grantTuViV140(eventTuVi, 'content-event');
        if (actualEffect.injury)
            this.stateValue.injury = Math.max(0, Math.min(100, this.stateValue.injury + actualEffect.injury));
        if (actualEffect.factionMerit) {
            const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
            if (!membership)
                throw new Error('Content event tried to grant faction merit without active membership');
            membership.merit = Math.max(0, membership.merit + actualEffect.factionMerit);
            membership.lifetimeContribution = Math.max(membership.lifetimeContribution, membership.lifetimeContribution + Math.max(0, actualEffect.factionMerit));
        }
        if (actualEffect.professionMastery) {
            for (const [professionId, delta] of Object.entries(actualEffect.professionMastery)) {
                const track = this.stateValue.professions.tracks[professionId];
                track.mastery = Math.max(0, Math.min(100, track.mastery + (delta ?? 0)));
            }
            unlockEligibleProfessionRecipes(this.stateValue.professions, this.registry);
        }
        if (actualEffect.soulStrength)
            this.stateValue.soul.strength = Math.max(0, this.stateValue.soul.strength + actualEffect.soulStrength);
        if (actualEffect.soulPurity)
            this.stateValue.soul.purity = Math.max(0, Math.min(100, this.stateValue.soul.purity + actualEffect.soulPurity));
        if (actualEffect.soulStability)
            this.stateValue.soul.stability = Math.max(0, Math.min(100, this.stateValue.soul.stability + actualEffect.soulStability));
        if (actualEffect.soulInsight)
            this.stateValue.soul.insight = Math.max(0, this.stateValue.soul.insight + actualEffect.soulInsight);
        if (actualEffect.soulStrength || actualEffect.soulPurity || actualEffect.soulStability || actualEffect.soulInsight) {
            syncSoulDungeonWorkers(this.stateValue.soul, this.stateValue.dungeons, soulCloneAuthorityCapacityV127(this.stateValue.realm.maxRealmOrder));
        }
        for (const [daoId, delta] of Object.entries(actualEffect.daoInsight ?? {})) {
            const definition = this.registry.dao(daoId);
            const progress = this.stateValue.dao.known[daoId] ?? discoverDao(this.stateValue.dao, definition, 0);
            progress.insight += delta ?? 0;
            this.stateValue.dao.totalInsight += delta ?? 0;
            progress.depth = Math.max(progress.depth, Math.min(100, 4 + Math.sqrt(Math.max(0, progress.insight)) * 5.2));
        }
        for (const [daoId, delta] of Object.entries(actualEffect.daoDepth ?? {})) {
            const definition = this.registry.dao(daoId);
            const progress = this.stateValue.dao.known[daoId] ?? discoverDao(this.stateValue.dao, definition, 0);
            progress.depth = Math.max(0, Math.min(100, progress.depth + (delta ?? 0)));
            progress.marks = Math.max(progress.marks, Math.floor(progress.depth / 20));
        }
        for (const [daoId, delta] of Object.entries(actualEffect.daoMarks ?? {})) {
            const definition = this.registry.dao(daoId);
            const progress = this.stateValue.dao.known[daoId] ?? discoverDao(this.stateValue.dao, definition, 0);
            progress.marks = Math.max(0, progress.marks + Math.floor(delta ?? 0));
        }
        if (actualEffect.setMainDaoId) {
            const definition = this.registry.dao(actualEffect.setMainDaoId);
            if (!this.stateValue.dao.known[definition.id])
                discoverDao(this.stateValue.dao, definition, 3);
            setMainDao(this.stateValue.dao, definition.id);
        }
        if (actualEffect.setDaoInterpretation) {
            const definition = this.registry.dao(actualEffect.setDaoInterpretation.daoId);
            if (!this.stateValue.dao.known[definition.id])
                discoverDao(this.stateValue.dao, definition, 3);
            chooseDaoInterpretation(this.stateValue.dao, definition, actualEffect.setDaoInterpretation.interpretationId);
        }
        if (actualEffect.domainActive !== undefined)
            setDaoDomainActive(this.stateValue.dao, actualEffect.domainActive);
        if (actualEffect.immortalEssence)
            this.stateValue.immortal.immortalEssence = Math.max(0, this.stateValue.immortal.immortalEssence + actualEffect.immortalEssence);
        if (actualEffect.immortalPurity)
            this.stateValue.immortal.essencePurity = Math.max(0, Math.min(100, this.stateValue.immortal.essencePurity + actualEffect.immortalPurity));
        if (actualEffect.immortalBody)
            this.stateValue.immortal.immortalBody = Math.max(0, Math.min(100, this.stateValue.immortal.immortalBody + actualEffect.immortalBody));
        if (actualEffect.lawAdaptation)
            this.stateValue.immortal.lawAdaptation = Math.max(0, Math.min(100, this.stateValue.immortal.lawAdaptation + actualEffect.lawAdaptation));
        if (actualEffect.earthAnchor)
            this.stateValue.immortal.earthAnchor = Math.max(0, Math.min(100, this.stateValue.immortal.earthAnchor + actualEffect.earthAnchor));
        if (actualEffect.earthVeinHarmony)
            this.stateValue.immortal.earthVeinHarmony = Math.max(0, Math.min(100, this.stateValue.immortal.earthVeinHarmony + actualEffect.earthVeinHarmony));
        if (actualEffect.heavenResonance)
            this.stateValue.immortal.heavenResonance = Math.max(0, Math.min(100, this.stateValue.immortal.heavenResonance + actualEffect.heavenResonance));
        if (actualEffect.celestialCirculation)
            this.stateValue.immortal.celestialCirculation = Math.max(0, Math.min(100, this.stateValue.immortal.celestialCirculation + actualEffect.celestialCirculation));
        if (actualEffect.trueLawBody)
            this.stateValue.immortal.trueLawBody = Math.max(0, Math.min(100, this.stateValue.immortal.trueLawBody + actualEffect.trueLawBody));
        if (actualEffect.trueLawAuthority)
            this.stateValue.immortal.trueLawAuthority = Math.max(0, Math.min(100, this.stateValue.immortal.trueLawAuthority + actualEffect.trueLawAuthority));
        for (const recipeId of actualEffect.learnRecipeIds ?? []) {
            const recipe = this.registry.professionRecipe(recipeId);
            const track = this.stateValue.professions.tracks[recipe.professionId];
            if (!track.knownRecipeIds.includes(recipeId))
                track.knownRecipeIds.push(recipeId);
        }
        for (const locationId of actualEffect.unlockLocationIds ?? []) {
            if (!this.world.locations[locationId])
                throw new Error(`Unknown content-event location: ${locationId}`);
            if (!this.stateValue.knownLocationIds.includes(locationId))
                this.stateValue.knownLocationIds.push(locationId);
        }
        for (const dungeonId of actualEffect.unlockDungeonIds ?? [])
            this.unlockDungeon(dungeonId);
        for (const skillId of actualEffect.learnSkillIds ?? []) {
            this.registry.skill(skillId);
            learnCombatSkill(this.stateValue.character, skillId);
        }
        for (const techniqueId of actualEffect.learnTechniqueIds ?? []) {
            this.registry.technique(techniqueId);
            learnTechnique(this.stateValue.character, techniqueId, 8);
        }
        for (const relation of actualEffect.relationships ?? []) {
            adjustPlayerNpcRelationship(this.stateValue.worldSimulation, this.currentLifeValue.lifeId, relation.npcId, this.stateValue.worldTimeYears, {
                trust: relation.trust, respect: relation.respect, debt: relation.debt, grudge: relation.grudge, karmaDepth: relation.karmaDepth,
            }, relation.flags ?? ['ContentEvent']);
        }
    
}
