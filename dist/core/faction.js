export const factionPromotionRequirements = [
    { rank: 'outerDisciple', minMerit: 0, minRealmOrder: 0 },
    { rank: 'innerDisciple', minMerit: 40, minRealmOrder: 3 },
    { rank: 'coreDisciple', minMerit: 140, minRealmOrder: 9 },
    { rank: 'elder', minMerit: 420, minRealmOrder: 14 },
    { rank: 'leader', minMerit: Number.POSITIVE_INFINITY, minRealmOrder: 18 },
];
const rankOrder = {
    outerDisciple: 0,
    innerDisciple: 1,
    coreDisciple: 2,
    elder: 3,
    leader: 4,
};
export const factionRankNames = {
    outerDisciple: 'Ngoại Môn Đệ Tử',
    innerDisciple: 'Nội Môn Đệ Tử',
    coreDisciple: 'Chân Truyền Đệ Tử',
    elder: 'Trưởng Lão',
    leader: 'Tông Chủ',
};
function cloneArchive(archive) {
    return { techniqueIds: [...archive.techniqueIds], skillIds: [...archive.skillIds], recipeIds: [...archive.recipeIds] };
}
function cloneRuntime(faction) {
    return {
        ...faction,
        doctrineTags: [...faction.doctrineTags],
        treasury: { ...faction.treasury },
        facilities: { ...faction.facilities },
        archive: cloneArchive(faction.archive),
        members: Object.fromEntries(Object.entries(faction.members).map(([id, member]) => [id, { ...member }])),
    };
}
export function createFactionState(definitions = {}, currentWorldYear = 0) {
    const factions = {};
    for (const definition of Object.values(definitions)) {
        const members = {};
        for (const member of definition.initialNpcMembers) {
            members[`npc:${member.npcId}`] = {
                memberId: member.npcId,
                memberType: 'npc',
                rank: member.rank,
                joinedWorldYear: currentWorldYear,
                contribution: 0,
                active: true,
            };
        }
        factions[definition.id] = {
            id: definition.id,
            name: definition.name,
            locationId: definition.locationId,
            doctrineTags: [...definition.doctrineTags],
            foundedWorldYear: Math.max(0, currentWorldYear - 260),
            treasury: { ...definition.initialTreasury },
            facilities: { ...definition.facilities },
            archive: cloneArchive(definition.archive),
            members,
            prestige: definition.initialPrestige ?? (55 + Object.keys(members).length * 4),
            stability: definition.initialStability ?? 78,
            totalContribution: 0,
        };
    }
    return {
        simulatedUntilWorldYear: currentWorldYear,
        factions,
        playerMemberships: {},
        majorEvents: [],
        eventSerial: 0,
        playerCreatedSerial: 0,
    };
}
export function cloneFactionState(state) {
    return {
        simulatedUntilWorldYear: state.simulatedUntilWorldYear,
        factions: Object.fromEntries(Object.entries(state.factions).map(([id, faction]) => [id, cloneRuntime(faction)])),
        playerMemberships: Object.fromEntries(Object.entries(state.playerMemberships).map(([id, membership]) => [id, { ...membership }])),
        majorEvents: state.majorEvents.map(event => ({ ...event, tags: [...event.tags], data: event.data ? { ...event.data } : undefined })),
        eventSerial: state.eventSerial,
        playerCreatedSerial: state.playerCreatedSerial,
    };
}
export function playerFactionMembership(state, lifeId) {
    const membership = state.playerMemberships[lifeId];
    return membership?.active ? membership : undefined;
}
export function deactivateFactionMembership(state, lifeId) {
    const membership = state.playerMemberships[lifeId];
    if (!membership || !membership.active)
        return;
    membership.active = false;
    const faction = state.factions[membership.factionId];
    const member = faction?.members[`player:${lifeId}`];
    if (member)
        member.active = false;
}
export function joinFaction(state, factionId, lifeId, worldYear) {
    if (playerFactionMembership(state, lifeId))
        throw new Error(`Life ${lifeId} already belongs to a faction`);
    const faction = state.factions[factionId];
    if (!faction)
        throw new Error(`Unknown faction: ${factionId}`);
    const membership = {
        lifeId,
        factionId,
        rank: 'outerDisciple',
        merit: 0,
        lifetimeContribution: 0,
        joinedWorldYear: worldYear,
        active: true,
    };
    state.playerMemberships[lifeId] = membership;
    faction.members[`player:${lifeId}`] = {
        memberId: lifeId,
        memberType: 'player',
        rank: membership.rank,
        joinedWorldYear: worldYear,
        contribution: 0,
        active: true,
        sourceLifeId: lifeId,
    };
    return membership;
}
function resourceMeritValue(resourceId) {
    if (resourceId === 'resource.spirit_stone')
        return 1;
    if (resourceId.includes('essence'))
        return 1.7;
    if (resourceId.includes('ore') || resourceId.includes('iron'))
        return 1.25;
    if (resourceId.includes('herb'))
        return 1.1;
    if (resourceId.includes('crystal') || resourceId.includes('marrow'))
        return 2.4;
    return 0.9;
}
export function contributeFactionResource(state, lifeId, resourceId, quantity) {
    const membership = playerFactionMembership(state, lifeId);
    if (!membership)
        throw new Error(`Life ${lifeId} has no active faction membership`);
    const faction = state.factions[membership.factionId];
    if (!faction)
        throw new Error(`Unknown faction: ${membership.factionId}`);
    const safeQuantity = Math.max(0, Math.floor(quantity));
    if (safeQuantity <= 0)
        throw new Error('Contribution quantity must be positive');
    const meritGained = Math.max(1, Math.round(safeQuantity * resourceMeritValue(resourceId)));
    faction.treasury[resourceId] = (faction.treasury[resourceId] ?? 0) + safeQuantity;
    faction.totalContribution += meritGained;
    membership.merit += meritGained;
    membership.lifetimeContribution += meritGained;
    const member = faction.members[`player:${lifeId}`];
    if (member)
        member.contribution += meritGained;
    return { resourceId, quantity: safeQuantity, meritGained, treasuryAfter: faction.treasury[resourceId] };
}
export function nextFactionRank(current) {
    const currentOrder = rankOrder[current];
    return factionPromotionRequirements.find(entry => rankOrder[entry.rank] === currentOrder + 1)?.rank;
}
export function promoteFactionMembership(state, lifeId, realmOrder) {
    const membership = playerFactionMembership(state, lifeId);
    if (!membership)
        throw new Error(`Life ${lifeId} has no active faction membership`);
    const next = nextFactionRank(membership.rank);
    if (!next || next === 'leader')
        throw new Error(`No ordinary promotion available from ${membership.rank}`);
    const requirement = factionPromotionRequirements.find(entry => entry.rank === next);
    if (membership.lifetimeContribution < requirement.minMerit)
        throw new Error(`Insufficient faction contribution: ${membership.lifetimeContribution}/${requirement.minMerit}`);
    if (realmOrder < requirement.minRealmOrder)
        throw new Error(`Realm order too low for ${next}: ${realmOrder}/${requirement.minRealmOrder}`);
    membership.rank = next;
    const faction = state.factions[membership.factionId];
    const member = faction.members[`player:${lifeId}`];
    if (member)
        member.rank = next;
    faction.prestige += 1.5 + rankOrder[next];
    return membership;
}
export function contributeFactionKnowledge(state, lifeId, kind, knowledgeId) {
    const membership = playerFactionMembership(state, lifeId);
    if (!membership)
        throw new Error(`Life ${lifeId} has no active faction membership`);
    const faction = state.factions[membership.factionId];
    const list = kind === 'technique' ? faction.archive.techniqueIds : kind === 'skill' ? faction.archive.skillIds : faction.archive.recipeIds;
    if (list.includes(knowledgeId))
        return { added: false, meritGained: 0 };
    list.push(knowledgeId);
    const meritGained = kind === 'technique' ? 45 : kind === 'skill' ? 28 : 34;
    membership.merit += meritGained;
    membership.lifetimeContribution += meritGained;
    faction.totalContribution += meritGained;
    faction.prestige += 2.5;
    const member = faction.members[`player:${lifeId}`];
    if (member)
        member.contribution += meritGained;
    return { added: true, meritGained };
}
export function rankArchiveAccess(rank) {
    return rankOrder[rank];
}
export function factionCultivationMultiplier(state, lifeId, locationId) {
    const membership = playerFactionMembership(state, lifeId);
    if (!membership)
        return 1;
    const faction = state.factions[membership.factionId];
    if (!faction || faction.locationId !== locationId)
        return 1;
    const facility = Math.max(0, faction.facilities.spiritVein ?? 0);
    const rankBonus = rankOrder[membership.rank] * 0.012;
    return 1 + facility * 0.035 + rankBonus;
}
export function foundPlayerFaction(state, lifeId, worldYear, name, locationId, doctrineTags) {
    if (playerFactionMembership(state, lifeId))
        throw new Error(`Life ${lifeId} already belongs to a faction`);
    const serial = state.playerCreatedSerial++;
    const id = `faction.player.${serial}`;
    const faction = {
        id,
        name: name.trim() || `Vô Danh Tông ${serial + 1}`,
        locationId,
        doctrineTags: [...new Set(doctrineTags)].slice(0, 6),
        foundedWorldYear: worldYear,
        founderLifeId: lifeId,
        treasury: {},
        facilities: { spiritVein: 1, scriptureHall: 1, alchemyHall: 0, forgeHall: 0, formationHall: 0 },
        archive: { techniqueIds: [], skillIds: [], recipeIds: [] },
        members: {},
        prestige: 12,
        stability: 70,
        totalContribution: 0,
    };
    state.factions[id] = faction;
    const membership = {
        lifeId,
        factionId: id,
        rank: 'leader',
        merit: 0,
        lifetimeContribution: 0,
        joinedWorldYear: worldYear,
        active: true,
    };
    state.playerMemberships[lifeId] = membership;
    faction.members[`player:${lifeId}`] = {
        memberId: lifeId,
        memberType: 'player',
        rank: 'leader',
        joinedWorldYear: worldYear,
        contribution: 0,
        active: true,
        sourceLifeId: lifeId,
    };
    return { faction, membership };
}
export function upgradeFactionFacility(state, lifeId, facilityId) {
    const membership = playerFactionMembership(state, lifeId);
    if (!membership)
        throw new Error(`Life ${lifeId} has no active faction membership`);
    if (rankOrder[membership.rank] < rankOrder.elder)
        throw new Error('Only elders or the leader may upgrade faction facilities');
    const faction = state.factions[membership.factionId];
    const before = faction.facilities[facilityId] ?? 0;
    const spiritStoneCost = 80 * (before + 1) * (before + 1);
    const available = faction.treasury['resource.spirit_stone'] ?? 0;
    if (available < spiritStoneCost)
        throw new Error(`Faction treasury lacks spirit stones: ${available}/${spiritStoneCost}`);
    faction.treasury['resource.spirit_stone'] = available - spiritStoneCost;
    faction.facilities[facilityId] = before + 1;
    faction.prestige += 4 + before * 2;
    return { levelBefore: before, levelAfter: before + 1, spiritStoneCost };
}
export function syncFactionState(state, targetWorldYear) {
    const target = Math.max(targetWorldYear, state.simulatedUntilWorldYear);
    const elapsedYears = target - state.simulatedUntilWorldYear;
    if (elapsedYears <= 1e-9)
        return { elapsedYears: 0, events: [] };
    const events = [];
    for (const faction of Object.values(state.factions)) {
        const activeMembers = Object.values(faction.members).filter(member => member.active).length;
        const spiritIncome = elapsedYears * (1.4 * faction.facilities.spiritVein + 0.12 * activeMembers);
        const herbIncome = elapsedYears * (0.45 * faction.facilities.alchemyHall);
        faction.treasury['resource.spirit_stone'] = (faction.treasury['resource.spirit_stone'] ?? 0) + spiritIncome;
        if (herbIncome > 0)
            faction.treasury['resource.spirit_herb'] = (faction.treasury['resource.spirit_herb'] ?? 0) + herbIncome;
        faction.prestige += elapsedYears * (0.018 * activeMembers + 0.025 * faction.facilities.scriptureHall);
        faction.stability = Math.min(100, faction.stability + elapsedYears * 0.01);
    }
    state.simulatedUntilWorldYear = target;
    return { elapsedYears, events };
}
export function factionChronicle(state, limit = 20) {
    return state.majorEvents
        .slice()
        .sort((a, b) => b.significance - a.significance || b.worldTimeYears - a.worldTimeYears)
        .slice(0, Math.max(0, limit))
        .sort((a, b) => a.worldTimeYears - b.worldTimeYears)
        .map(event => ({ ...event, tags: [...event.tags], data: event.data ? { ...event.data } : undefined }));
}
//# sourceMappingURL=faction.js.map