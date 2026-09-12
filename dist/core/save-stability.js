import { normalizeGuidanceAutomationPolicy } from './guidance.js';
import { factionPromotionRequirements } from './faction.js';
function duplicateIds(values) {
    const seen = new Set();
    const duplicate = new Set();
    for (const value of values) {
        if (seen.has(value))
            duplicate.add(value);
        else
            seen.add(value);
    }
    return [...duplicate];
}
function finite(label, value, errors) { if (!Number.isFinite(value))
    errors.push(`${label} không phải số hữu hạn.`); }
function v172NonNegative(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
}
const V172_FACTION_RANKS = Object.freeze(factionPromotionRequirements.map(x => x.rank));
function v172RankIndex(rank) { return V172_FACTION_RANKS.indexOf(rank); }
function v172MaxJoinedRank(membership, realmOrder) {
    let maxRank = 'outerDisciple';
    const contribution = v172NonNegative(membership?.lifetimeContribution);
    const realm = Math.max(0, Math.floor(Number(realmOrder) || 0));
    for (const requirement of factionPromotionRequirements) {
        if (requirement.rank === 'leader') break;
        if (contribution + 1e-9 >= requirement.minMerit && realm >= requirement.minRealmOrder)
            maxRank = requirement.rank;
    }
    return maxRank;
}
/** V172: membership rank is live-earned authority; restore may only remove impossible authority. */
export function normalizeCanonicalFactionAfterRestore(state) {
    const factionState = state?.factions;
    if (!factionState?.playerMemberships || !factionState?.factions)
        return factionState;
    const realmOrder = state?.realm?.maxRealmOrder ?? 0;
    for (const [lifeKey, membership] of Object.entries(factionState.playerMemberships)) {
        if (!membership?.active)
            continue;
        const faction = factionState.factions[membership.factionId];
        const member = faction?.members?.[`player:${lifeKey}`];
        const identityValid = Boolean(faction
            && membership.lifeId === lifeKey
            && member
            && member.memberId === lifeKey
            && member.memberType === 'player'
            && member.sourceLifeId === lifeKey
            && member.active);
        if (!identityValid) {
            membership.active = false;
            if (member)
                member.active = false;
            continue;
        }
        membership.merit = v172NonNegative(membership.merit);
        membership.lifetimeContribution = v172NonNegative(membership.lifetimeContribution);
        const founder = faction.id === membership.factionId
            && faction.id.startsWith('faction.player.')
            && faction.founderLifeId === lifeKey;
        const maxRank = founder ? 'leader' : v172MaxJoinedRank(membership, realmOrder);
        const savedIndex = v172RankIndex(membership.rank);
        const maxIndex = v172RankIndex(maxRank);
        const canonicalRank = savedIndex < 0 ? 'outerDisciple' : V172_FACTION_RANKS[Math.min(savedIndex, maxIndex)];
        membership.rank = canonicalRank;
        member.rank = canonicalRank;
    }
    return factionState;
}
/** Audit references that can break a long-lived save without mutating it. */
export function auditAdventureState(state, history, world, registry) {
    const errors = [];
    const warnings = [];
    const repaired = [];
    finite('worldTimeYears', state.worldTimeYears, errors);
    finite('ageYears', state.ageYears, errors);
    finite('injury', state.injury, errors);
    if (!world.locations[state.locationId])
        errors.push(`Location hiện tại không tồn tại: ${state.locationId}`);
    if (!registry.realms.has(state.realm.realmId))
        errors.push(`Cảnh giới không tồn tại: ${state.realm.realmId}`);
    const dupLocations = duplicateIds(state.knownLocationIds);
    if (dupLocations.length)
        warnings.push(`knownLocationIds trùng: ${dupLocations.join(', ')}`);
    const unknownKnown = state.knownLocationIds.filter(id => !world.locations[id]);
    if (unknownKnown.length)
        warnings.push(`knownLocationIds lạ: ${[...new Set(unknownKnown)].join(', ')}`);
    const equipmentIds = new Set(state.equipment.items.map(item => item.id));
    for (const [slot, id] of Object.entries(state.equipment.equipped))
        if (id && !equipmentIds.has(id))
            errors.push(`Equipment slot ${slot} trỏ tới item đã mất: ${id}`);
    const artifactIds = new Set(state.artifacts.items.map(item => item.id));
    for (const id of state.artifacts.activeIds)
        if (!artifactIds.has(id))
            errors.push(`Pháp Bảo trực chiến đã mất: ${id}`);
    if (duplicateIds(state.artifacts.activeIds).length)
        warnings.push('Danh sách Pháp Bảo trực chiến có ID trùng.');
    const knownSkills = new Set(state.character.knownSkillIds);
    for (const id of state.character.activeSkillIds)
        if (!knownSkills.has(id) || !registry.skills.has(id))
            errors.push(`Skill trực chiến không hợp lệ: ${id}`);
    const battleDaoCommitted = Boolean(state.character.buildFoundation?.battleDao?.committed && state.character.buildFoundation?.progressionV125?.daoNatureCommitted);
    const activeSkillCap = battleDaoCommitted ? 7 : 6;
    if (state.character.activeSkillIds.length > activeSkillCap)
        warnings.push(`Có ${state.character.activeSkillIds.length} skill trực chiến; loadout chuẩn tối đa ${activeSkillCap}.`);
    const policy = normalizeGuidanceAutomationPolicy(state.guidance.automationPolicy);
    for (const id of policy.blockedDungeonIds)
        if (!world.dungeons[id])
            warnings.push(`Automation blacklist phó bản lạ: ${id}`);
    const eventIds = history.map(event => event.id);
    const dupHistory = duplicateIds(eventIds);
    if (dupHistory.length)
        warnings.push(`History có event ID trùng (${dupHistory.length}).`);
    return { schema: 'save-integrity.v1', ok: errors.length === 0, errors, warnings, repaired };
}
/** Conservative repair: only removes dangling/duplicate references; never invents rewards or progression. */
export function repairAdventureStateReferences(state, world, registry) {
    const repaired = [];
    const validLocations = [...new Set(state.knownLocationIds.filter(id => Boolean(world.locations[id])))];
    if (!world.locations[state.locationId]) {
        state.locationId = world.startLocationId;
        repaired.push('Khôi phục location hiện tại về điểm xuất phát.');
    }
    if (!validLocations.includes(state.locationId))
        validLocations.push(state.locationId);
    if (validLocations.length !== state.knownLocationIds.length || validLocations.some((id, i) => state.knownLocationIds[i] !== id)) {
        state.knownLocationIds = validLocations;
        repaired.push('Dọn knownLocationIds trùng/không tồn tại.');
    }
    const equipmentIds = new Set(state.equipment.items.map(item => item.id));
    for (const [slot, id] of Object.entries(state.equipment.equipped))
        if (id && !equipmentIds.has(id)) {
            delete state.equipment.equipped[slot];
            repaired.push(`Bỏ equipment reference hỏng ở ${slot}.`);
        }
    const artifactIds = new Set(state.artifacts.items.map(item => item.id));
    const active = [...new Set(state.artifacts.activeIds.filter(id => artifactIds.has(id)))].slice(0, Math.max(0, state.artifacts.activeCapacity));
    if (active.length !== state.artifacts.activeIds.length || active.some((id, i) => state.artifacts.activeIds[i] !== id)) {
        state.artifacts.activeIds = active;
        repaired.push('Dọn Pháp Bảo trực chiến bị mất/trùng/quá capacity.');
    }
    state.character.knownSkillIds = [...new Set(state.character.knownSkillIds.filter(id => registry.skills.has(id)))];
    const known = new Set(state.character.knownSkillIds);
    const battleDaoCommitted = Boolean(state.character.buildFoundation?.battleDao?.committed && state.character.buildFoundation?.progressionV125?.daoNatureCommitted);
    const activeSkillCap = battleDaoCommitted ? 7 : 6;
    const activeSkills = [...new Set(state.character.activeSkillIds.filter(id => known.has(id) && registry.skills.has(id)))].slice(0, activeSkillCap);
    if (activeSkills.length !== state.character.activeSkillIds.length || activeSkills.some((id, i) => state.character.activeSkillIds[i] !== id)) {
        state.character.activeSkillIds = activeSkills;
        repaired.push(`Dọn active skill reference hỏng/trùng/quá ${activeSkillCap} slot.`);
    }
    if (state.character.savedCombatLoadouts) {
        const validEquipment = new Set(state.equipment.items.map(item => item.id));
        const validLegacyArtifacts = new Set(state.artifacts.items.map(item => item.id));
        const validV88Artifacts = new Set(Object.entries(state.collectionV12316?.items ?? {}).filter(([, progress]) => progress?.owned).map(([id]) => id));
        const validRelics = new Set(Object.entries(state.collectionV12316?.economyV12325?.extraItems ?? {}).filter(([id, progress]) => id.startsWith('relic.') && progress?.owned).map(([id]) => id));
        for (const loadout of state.character.savedCombatLoadouts) {
            loadout.skillIds = [...new Set(loadout.skillIds.filter(id => known.has(id) && registry.skills.has(id)))].slice(0, activeSkillCap);
            loadout.artifactIds = [...new Set((loadout.artifactIds ?? []).filter(id => validV88Artifacts.has(id) || validLegacyArtifacts.has(id)))];
            loadout.legacyArtifactIds = [...new Set((loadout.legacyArtifactIds ?? []).filter(id => validLegacyArtifacts.has(id)))];
            if (loadout.relicId && !validRelics.has(loadout.relicId)) loadout.relicId = undefined;
            loadout.equipmentIds = Object.fromEntries(Object.entries(loadout.equipmentIds).filter(([, id]) => validEquipment.has(id)));
        }
    }
    normalizeCanonicalFactionAfterRestore(state);
    const policy = normalizeGuidanceAutomationPolicy(state.guidance.automationPolicy);
    const blocked = policy.blockedDungeonIds.filter(id => Boolean(world.dungeons[id]));
    if (blocked.length !== policy.blockedDungeonIds.length)
        repaired.push('Bỏ dungeon blacklist không còn tồn tại.');
    state.guidance.automationPolicy = { ...policy, blockedDungeonIds: [...new Set(blocked)] };
    if (state.flow) {
        state.flow.firstLifeStory.completedBeatIds = [...new Set(state.flow.firstLifeStory.completedBeatIds)];
        state.flow.contentEvents.completedEventIds = [...new Set(state.flow.contentEvents.completedEventIds)];
    }
    return repaired;
}
//# sourceMappingURL=save-stability.js.map