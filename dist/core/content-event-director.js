import { playerFactionMembership, factionRankNames } from './faction.js';
import { soulCloneAuthorityCapacityV127, totalSoulLoad } from './soul.js';
import { integrationSummary } from './integration.js';
import { highestClearedDungeonFloor } from './dungeon.js';
import { contentEventDomainMultiplier, gatheringYieldMultiplier, professionTalentModifiers, socialPositiveRelationshipMultiplier, } from './reincarnation-talents.js';
const FACTION_RANK_ORDER = Object.fromEntries(Object.keys(factionRankNames).map((rank, index) => [rank, index]));
function hasTag(tags, ...tokens) {
    for (const token of tokens)
        if (tags.has(token.toLowerCase()))
            return true;
    return false;
}
export function contentEventDomains(definition, choice) {
    const tags = new Set([...(definition.tags ?? []), ...(choice.tags ?? [])].map(tag => tag.toLowerCase()));
    const domains = new Set();
    if (choice.combat || hasTag(tags, 'combat', 'boss', 'duel'))
        domains.add('combat');
    if (hasTag(tags, 'cultivation', 'goldencore', 'purplepalace'))
        domains.add('cultivation');
    if (hasTag(tags, 'technique', 'sword', 'skill'))
        domains.add('technique');
    if (hasTag(tags, 'alchemy', 'pill'))
        domains.add('alchemy');
    if (hasTag(tags, 'forging', 'forge'))
        domains.add('forging');
    if (hasTag(tags, 'talisman', 'formation', 'rune'))
        domains.add('talisman');
    if (hasTag(tags, 'gather', 'herb', 'resource'))
        domains.add('gathering');
    if (hasTag(tags, 'artifact', 'treasure'))
        domains.add('artifact');
    if (hasTag(tags, 'dungeon', 'firstclear'))
        domains.add('dungeon');
    if (hasTag(tags, 'dao'))
        domains.add('dao');
    if (hasTag(tags, 'relationship', 'karma', 'social', 'sect'))
        domains.add('social');
    if (hasTag(tags, 'exploration', 'wanderer'))
        domains.add('exploration');
    const effect = choice.effects;
    if (effect?.professionMastery?.alchemy)
        domains.add('alchemy');
    if (effect?.professionMastery?.forging)
        domains.add('forging');
    if (effect?.professionMastery?.talisman)
        domains.add('talisman');
    if (effect?.relationships?.length)
        domains.add('social');
    if (effect?.daoInsight || effect?.daoDepth || effect?.daoMarks)
        domains.add('dao');
    if (effect?.tuVi)
        domains.add('cultivation');
    if (effect?.learnSkillIds?.length || effect?.learnTechniqueIds?.length)
        domains.add('technique');
    if (domains.size === 0)
        domains.add('general');
    return [...domains];
}
export function inspectContentEventChoice(definition, choice) {
    const effects = choice.effects;
    const hasCost = Object.values(effects?.resources ?? {}).some(value => (value ?? 0) < 0);
    const risk = choice.combat ? 'combat' : (effects?.injury ?? 0) > 0 ? 'injury' : hasCost ? 'cost' : 'safe';
    const domains = contentEventDomains(definition, choice);
    const permanentHooks = domains.filter(domain => domain !== 'general' && domain !== 'exploration').map(domain => `Talent:${domain}`);
    return { eventId: definition.id, choiceId: choice.id, domains, risk, permanentHooks };
}
/** Pure availability check extracted from SimulationSession in v0.70. */
export function isContentEventAvailable(definition, state, life, meta) {
    const condition = definition.condition;
    const flow = state.flow;
    if ((definition.oneShot ?? true) && flow?.contentEvents.completedEventIds.includes(definition.id))
        return false;
    if (!condition)
        return true;
    if (condition.lifeNumbers && !condition.lifeNumbers.includes(life.lifeNumber))
        return false;
    if (condition.locationIds && !condition.locationIds.includes(state.locationId))
        return false;
    if (condition.minWorldYear !== undefined && state.worldTimeYears < condition.minWorldYear)
        return false;
    if (condition.maxWorldYear !== undefined && state.worldTimeYears > condition.maxWorldYear)
        return false;
    if (condition.minRealmOrder !== undefined && state.realm.maxRealmOrder < condition.minRealmOrder)
        return false;
    if (condition.maxRealmOrder !== undefined && state.realm.maxRealmOrder > condition.maxRealmOrder)
        return false;
    if (condition.paths && !condition.paths.includes(flow?.firstLifeStory.path ?? 'unset'))
        return false;
    if (condition.requiredBeatIds?.some(id => !flow?.firstLifeStory.completedBeatIds.includes(id)))
        return false;
    if (condition.requiredCompletedEventIds?.some(id => !flow?.contentEvents.completedEventIds.includes(id)))
        return false;
    if (condition.forbiddenCompletedEventIds?.some(id => flow?.contentEvents.completedEventIds.includes(id)))
        return false;
    const membership = playerFactionMembership(state.factions, life.lifeId);
    if (condition.requiredFactionId && membership?.factionId !== condition.requiredFactionId)
        return false;
    if (condition.forbidFactionMembership && membership)
        return false;
    if (condition.minFactionRank && (!membership || (FACTION_RANK_ORDER[membership.rank] ?? -1) < (FACTION_RANK_ORDER[condition.minFactionRank] ?? 999)))
        return false;
    if (condition.knownSkillIds?.some(id => !state.character.knownSkillIds.includes(id)))
        return false;
    if (condition.knownTechniqueIds?.some(id => !state.character.knownTechniqueIds.includes(id)))
        return false;
    if (condition.professionMinMastery && Object.entries(condition.professionMinMastery).some(([id, mastery]) => state.professions.tracks[id].mastery + 1e-9 < (mastery ?? 0)))
        return false;
    if (condition.minImmortalPurity !== undefined && state.immortal.essencePurity < condition.minImmortalPurity)
        return false;
    if (condition.minImmortalBody !== undefined && state.immortal.immortalBody < condition.minImmortalBody)
        return false;
    if (condition.minEarthAnchor !== undefined && state.immortal.earthAnchor < condition.minEarthAnchor)
        return false;
    if (condition.minHeavenResonance !== undefined && state.immortal.heavenResonance < condition.minHeavenResonance)
        return false;
    if (condition.minTrueLawAuthority !== undefined && state.immortal.trueLawAuthority < condition.minTrueLawAuthority)
        return false;
    if (condition.minMingJi !== undefined && (meta.mingJi ?? 0) < condition.minMingJi)
        return false;
    if (condition.minReincarnationSealLevel !== undefined && meta.reincarnation.sealLevel < condition.minReincarnationSealLevel)
        return false;
    const inheritance = life.reincarnation;
    if (condition.orientationIds && !condition.orientationIds.includes(inheritance?.orientationId ?? 'balanced'))
        return false;
    if (condition.requiresInheritedDaoSeed && !inheritance?.selectedDaoSeedId)
        return false;
    if (condition.requiresInheritedMemory && !inheritance?.memoryFragments?.length)
        return false;
    if (condition.requiresInheritedKarma && !inheritance?.inheritedKarmaNpcIds?.length)
        return false;
    if (condition.requiresBoundRelic && !inheritance?.boundRelicArtifactIds?.length)
        return false;
    if (condition.activeMajorTalentIds?.some(id => !(meta.talents?.activeMajorIds ?? []).includes(id)))
        return false;
    if (condition.minSoulStrength !== undefined && state.soul.strength < condition.minSoulStrength)
        return false;
    if (condition.minSoulPurity !== undefined && state.soul.purity < condition.minSoulPurity)
        return false;
    if (condition.minSoulStability !== undefined && state.soul.stability < condition.minSoulStability)
        return false;
    const cloneAuthorityCapV127 = soulCloneAuthorityCapacityV127(state.realm.maxRealmOrder);
    const activeCloneCountV127 = Math.min(state.soul.clones.length, cloneAuthorityCapV127);
    if (condition.minCloneCount !== undefined && activeCloneCountV127 < condition.minCloneCount)
        return false;
    if (condition.maxCloneCount !== undefined && activeCloneCountV127 > condition.maxCloneCount)
        return false;
    if (condition.minSoulLoadRatio !== undefined && totalSoulLoad(state.soul, cloneAuthorityCapV127) / Math.max(1, state.soul.loadCapacity) < condition.minSoulLoadRatio)
        return false;
    if (condition.minDaoDepth) {
        const p = state.dao.known[condition.minDaoDepth.daoId];
        if (!p || p.depth < condition.minDaoDepth.depth)
            return false;
    }
    if (condition.requiredMainDaoId && state.dao.mainDaoId !== condition.requiredMainDaoId)
        return false;
    if (condition.requiresMainDaoInterpretation) {
        const id = state.dao.mainDaoId;
        if (!id || !state.dao.known[id]?.interpretationId)
            return false;
    }
    if (condition.domainActive !== undefined && state.dao.domain.active !== condition.domainActive)
        return false;
    if (condition.minIntegrationHarmony !== undefined || condition.maxIntegrationHarmony !== undefined || condition.integrationBottleneck) {
        const summary = integrationSummary(state.realm, state.injury, state.soul, state.dao, state.artifacts);
        if (!summary.awakened)
            return false;
        if (condition.minIntegrationHarmony !== undefined && summary.harmony < condition.minIntegrationHarmony)
            return false;
        if (condition.maxIntegrationHarmony !== undefined && summary.harmony > condition.maxIntegrationHarmony)
            return false;
        if (condition.integrationBottleneck && summary.bottleneck !== condition.integrationBottleneck)
            return false;
    }
    if (condition.requiredDungeonFloors?.some(req => highestClearedDungeonFloor(state.dungeons, req.dungeonId) < req.minFloor))
        return false;
    if (condition.spiritualRootIds && !condition.spiritualRootIds.includes(state.character.spiritualRootId))
        return false;
    if (condition.physiqueIds && !state.character.physiqueIds.some(id => condition.physiqueIds.includes(id)))
        return false;
    if (condition.bloodlineIds && !state.character.bloodlines.some(lineage => condition.bloodlineIds.includes(lineage.id)))
        return false;
    if (condition.requiredResources && Object.entries(condition.requiredResources).some(([id, amount]) => (state.inventory[id] ?? 0) < amount))
        return false;
    if (condition.relation) {
        const relation = state.worldSimulation.playerRelationships[`${life.lifeId}|${condition.relation.npcId}`];
        const trust = relation?.trust ?? 0, respect = relation?.respect ?? 0, debt = relation?.debt ?? 0, karmaDepth = relation?.karmaDepth ?? 0, grudge = relation?.grudge ?? 0;
        if (condition.relation.minTrust !== undefined && trust < condition.relation.minTrust)
            return false;
        if (condition.relation.minRespect !== undefined && respect < condition.relation.minRespect)
            return false;
        if (condition.relation.minDebt !== undefined && debt < condition.relation.minDebt)
            return false;
        if (condition.relation.minKarmaDepth !== undefined && karmaDepth < condition.relation.minKarmaDepth)
            return false;
        if (condition.relation.maxGrudge !== undefined && grudge > condition.relation.maxGrudge)
            return false;
    }
    return true;
}
function positive(value, multiplier) {
    if (value === undefined || value === 0)
        return value;
    return value > 0 ? value * multiplier : value;
}
/**
 * Event rewards inherit the same reincarnation talent domains as normal gameplay.
 * Costs, injuries, grudges and other negative consequences are deliberately never reduced.
 */
export function scaleContentEventEffectByTalents(effect, definition, choice, origins) {
    if (!effect)
        return effect;
    const domains = contentEventDomains(definition, choice);
    const base = { ...effect };
    const cultivation = domains.includes('cultivation') ? contentEventDomainMultiplier(origins, 'cultivation') : 1;
    const technique = domains.includes('technique') ? contentEventDomainMultiplier(origins, 'technique') : 1;
    const artifact = domains.includes('artifact') ? contentEventDomainMultiplier(origins, 'artifact') : 1;
    const dungeon = domains.includes('dungeon') ? contentEventDomainMultiplier(origins, 'dungeon') : 1;
    const dao = domains.includes('dao') ? contentEventDomainMultiplier(origins, 'dao') : 1;
    const social = domains.includes('social') ? socialPositiveRelationshipMultiplier(origins) : 1;
    base.resources = effect.resources ? Object.fromEntries(Object.entries(effect.resources).map(([id, delta]) => [id, (delta ?? 0) > 0 ? (delta ?? 0) * Math.max(domains.includes('gathering') ? gatheringYieldMultiplier(origins, id) : 1, artifact, dungeon) : delta])) : undefined;
    base.tuVi = positive(effect.tuVi, cultivation);
    base.professionMastery = effect.professionMastery ? Object.fromEntries(Object.entries(effect.professionMastery).map(([id, value]) => [id, positive(value, professionTalentModifiers(origins, id).masteryGainMultiplier)])) : undefined;
    base.daoInsight = effect.daoInsight ? Object.fromEntries(Object.entries(effect.daoInsight).map(([id, value]) => [id, value > 0 ? value * dao : value])) : undefined;
    base.daoDepth = effect.daoDepth ? Object.fromEntries(Object.entries(effect.daoDepth).map(([id, value]) => [id, value > 0 ? value * dao : value])) : undefined;
    base.daoMarks = effect.daoMarks ? Object.fromEntries(Object.entries(effect.daoMarks).map(([id, value]) => [id, value > 0 ? value * dao : value])) : undefined;
    base.relationships = effect.relationships?.map(relation => ({
        ...relation,
        trust: positive(relation.trust, social), respect: positive(relation.respect, social), karmaDepth: positive(relation.karmaDepth, social),
        debt: relation.debt, grudge: relation.grudge,
    }));
    return base;
}
//# sourceMappingURL=content-event-director.js.map