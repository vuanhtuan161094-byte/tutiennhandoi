import { normalizeGuidanceAutomationPolicy } from './guidance.js';
import { factionPromotionRequirements } from './faction.js';
import { genesisWorldCapacity } from './genesis-world.js';
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
function v173FiniteNonNegative(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
}
function v173NonNegativeInt(value) { return Math.floor(v173FiniteNonNegative(value)); }
function v173Clamp100(value) { return Math.min(100, v173FiniteNonNegative(value)); }
function v173PairKey(a, b) { return a < b ? `${a}|${b}` : `${b}|${a}`; }
function v173HuntMajor(floor) { return Math.floor((Math.max(1, Math.floor(floor)) - 1) / 800) + 1; }
function v173HuntLocal(floor) { return ((Math.max(1, Math.floor(floor)) - 1) % 800) + 1; }
function v173HuntGlobal(major, local) { return (Math.max(1, Math.floor(major)) - 1) * 800 + Math.max(1, Math.min(800, Math.floor(local))); }
/** V173: consolidate mirrored World/Economy/Genesis/Hunt runtime authority after restore. */
export function normalizeCanonicalWorldToHuntAfterRestore(state, world) {
    if (state?.inventory && typeof state.inventory === 'object') {
        for (const [resourceId, raw] of Object.entries(state.inventory))
            state.inventory[resourceId] = v173FiniteNonNegative(raw);
    }
    const economy = state?.economy;
    if (economy) {
        for (const market of Object.values(economy.markets ?? {}))
            for (const listing of Object.values(market.listings ?? {})) {
                listing.stock = v173FiniteNonNegative(listing.stock);
                listing.boughtByPlayer = v173FiniteNonNegative(listing.boughtByPlayer);
                listing.soldByPlayer = v173FiniteNonNegative(listing.soldByPlayer);
            }
        for (const key of Object.keys(economy.lifetime ?? {}))
            economy.lifetime[key] = v173FiniteNonNegative(economy.lifetime[key]);
        economy.transactionSerial = v173NonNegativeInt(economy.transactionSerial);
    }
    const orthodoxyState = state?.orthodoxy;
    if (orthodoxyState?.orthodoxies) {
        const savedOwners = orthodoxyState.territoryOwnerByLocation ?? {};
        const canonicalOwners = {};
        for (const [factionId, orthodoxy] of Object.entries(orthodoxyState.orthodoxies)) {
            orthodoxy.factionId = factionId;
            orthodoxy.level = Math.max(1, v173NonNegativeInt(orthodoxy.level));
            orthodoxy.doctrineAuthority = v173Clamp100(orthodoxy.doctrineAuthority);
            orthodoxy.militaryPower = v173FiniteNonNegative(orthodoxy.militaryPower);
            orthodoxy.warFatigue = v173Clamp100(orthodoxy.warFatigue);
            orthodoxy.victories = v173NonNegativeInt(orthodoxy.victories);
            orthodoxy.defeats = v173NonNegativeInt(orthodoxy.defeats);
            orthodoxy.treasury = v173FiniteNonNegative(orthodoxy.treasury);
            orthodoxy.prosperity = v173Clamp100(orthodoxy.prosperity);
            orthodoxy.logistics = v173Clamp100(orthodoxy.logistics);
            orthodoxy.tradePower = v173Clamp100(orthodoxy.tradePower);
            orthodoxy.tributeReceivedLifetime = v173FiniteNonNegative(orthodoxy.tributeReceivedLifetime);
            orthodoxy.tradeIncomeLifetime = v173FiniteNonNegative(orthodoxy.tradeIncomeLifetime);
            orthodoxy.territoryIds = [...new Set((orthodoxy.territoryIds ?? []).filter(locationId => typeof locationId === 'string'
                && Boolean(world?.locations?.[locationId])
                && savedOwners[locationId] === factionId))];
            for (const locationId of orthodoxy.territoryIds)
                canonicalOwners[locationId] = factionId;
        }
        orthodoxyState.territoryOwnerByLocation = canonicalOwners;
        const validOrthodoxies = new Set(Object.keys(orthodoxyState.orthodoxies));
        for (const [key, relation] of Object.entries({ ...(orthodoxyState.relations ?? {}) })) {
            const a = relation?.aFactionId;
            const b = relation?.bFactionId;
            if (!validOrthodoxies.has(a) || !validOrthodoxies.has(b) || a === b || key !== v173PairKey(a, b)) {
                delete orthodoxyState.relations[key];
                continue;
            }
            relation.id = key;
            relation.trust = v173Clamp100(relation.trust);
            relation.tension = v173Clamp100(relation.tension);
            relation.tributeRate = Math.min(1, v173FiniteNonNegative(relation.tributeRate));
            if (!['neutral', 'allied', 'hostile', 'vassal'].includes(relation.status))
                relation.status = 'neutral';
            if (relation.status === 'vassal') {
                const endpoints = new Set([a, b]);
                if (!endpoints.has(relation.overlordFactionId) || !endpoints.has(relation.vassalFactionId) || relation.overlordFactionId === relation.vassalFactionId) {
                    relation.status = 'neutral';
                    relation.overlordFactionId = undefined;
                    relation.vassalFactionId = undefined;
                    relation.tributeRate = 0;
                }
            }
            else {
                relation.overlordFactionId = undefined;
                relation.vassalFactionId = undefined;
                relation.tributeRate = 0;
            }
        }
    }
    const simulation = state?.worldSimulation;
    if (simulation) {
        const validOpportunities = new Set(Object.keys(world?.opportunities ?? {}));
        const claimed = new Set();
        for (const id of simulation.claimedOpportunityIds ?? [])
            if (validOpportunities.has(id)) claimed.add(id);
        for (const [id, claim] of Object.entries(simulation.opportunityClaims ?? {}))
            if (validOpportunities.has(id) && claim?.opportunityId === id) claimed.add(id);
        for (const npc of Object.values(simulation.npcs ?? {})) {
            npc.claimedOpportunityIds = [...new Set((npc.claimedOpportunityIds ?? []).filter(id => validOpportunities.has(id)))];
            for (const id of npc.claimedOpportunityIds) claimed.add(id);
        }
        simulation.claimedOpportunityIds = [...claimed];
        for (const id of Object.keys(simulation.opportunityClaims ?? {}))
            if (!validOpportunities.has(id) || simulation.opportunityClaims[id]?.opportunityId !== id)
                delete simulation.opportunityClaims[id];
        const validNpcs = new Set(Object.keys(world?.npcs ?? {}));
        for (const [key, relation] of Object.entries({ ...(simulation.relationships ?? {}) })) {
            if (!validNpcs.has(relation?.aId) || !validNpcs.has(relation?.bId) || relation.aId === relation.bId || key !== v173PairKey(relation.aId, relation.bId)) {
                delete simulation.relationships[key];
                continue;
            }
            relation.trust = v173Clamp100(relation.trust);
            relation.respect = v173Clamp100(relation.respect);
            relation.grudge = v173Clamp100(relation.grudge);
            relation.karmaDepth = v173Clamp100(relation.karmaDepth);
        }
        for (const [key, relation] of Object.entries({ ...(simulation.playerRelationships ?? {}) })) {
            const canonicalKey = `${relation?.lifeId ?? ''}|${relation?.npcId ?? ''}`;
            if (!relation?.lifeId || !validNpcs.has(relation?.npcId) || key !== canonicalKey) {
                delete simulation.playerRelationships[key];
                continue;
            }
            relation.trust = v173Clamp100(relation.trust);
            relation.respect = v173Clamp100(relation.respect);
            relation.debt = v173Clamp100(relation.debt);
            relation.grudge = v173Clamp100(relation.grudge);
            relation.karmaDepth = v173Clamp100(relation.karmaDepth);
            relation.interactionCount = v173NonNegativeInt(relation.interactionCount);
            relation.flags = [...new Set((relation.flags ?? []).filter(flag => typeof flag === 'string' && flag.length > 0))];
        }
    }
    const genesis = state?.genesisWorlds;
    if (genesis?.worlds) {
        const cap = genesisWorldCapacity(v173NonNegativeInt(state?.immortal?.creationEpochs), v173Clamp100(state?.immortal?.genesisAuthority));
        const active = Object.entries(genesis.worlds)
            .filter(([, created]) => !created?.extinct)
            .sort((a, b) => v173FiniteNonNegative(a[1]?.createdAtWorldYear) - v173FiniteNonNegative(b[1]?.createdAtWorldYear) || a[0].localeCompare(b[0]));
        const keepActive = new Set(active.slice(0, cap).map(([id]) => id));
        for (const [id, created] of Object.entries({ ...genesis.worlds })) {
            if (!created?.extinct && !keepActive.has(id)) {
                delete genesis.worlds[id];
                continue;
            }
            created.id = id;
        }
        genesis.serial = v173NonNegativeInt(genesis.serial);
    }
    const hunt = state?.endlessHunt;
    if (hunt) {
        hunt.floorStats ??= {};
        const majors = new Set([
            ...Object.keys(hunt.highestUnlockedByMajor ?? {}),
            ...Object.keys(hunt.highestClearedByMajor ?? {}),
        ]);
        const bossEvidence = {};
        for (const [key, stats] of Object.entries(hunt.floorStats)) {
            const floor = Math.floor(Number(key));
            if (!Number.isFinite(floor) || floor < 1) continue;
            stats.bossWins = v173NonNegativeInt(stats.bossWins) > 0 ? 1 : 0;
            if (stats.bossWins > 0) {
                const major = v173HuntMajor(floor);
                const local = v173HuntLocal(floor);
                majors.add(String(major));
                bossEvidence[String(major)] = Math.max(bossEvidence[String(major)] ?? 0, local);
            }
        }
        const canonicalUnlocked = {};
        const canonicalCleared = {};
        for (const rawKey of majors) {
            const major = Math.max(1, Math.floor(Number(rawKey) || 1));
            const key = String(major);
            const savedCleared = Math.min(800, v173NonNegativeInt(hunt.highestClearedByMajor?.[key]));
            const evidencedCleared = Math.min(800, v173NonNegativeInt(bossEvidence[key]));
            const cleared = Math.max(savedCleared, evidencedCleared);
            const hadMap = v173NonNegativeInt(hunt.highestUnlockedByMajor?.[key]) > 0 || cleared > 0;
            if (cleared > 0) canonicalCleared[key] = cleared;
            if (hadMap) canonicalUnlocked[key] = cleared >= 800 ? 800 : Math.max(1, cleared + 1);
        }
        if (Object.keys(canonicalUnlocked).length === 0) canonicalUnlocked['1'] = 1;
        hunt.highestUnlockedByMajor = canonicalUnlocked;
        hunt.highestClearedByMajor = canonicalCleared;
        hunt.highestClearedFloor = Object.entries(canonicalCleared).reduce((max, [major, local]) => Math.max(max, v173HuntGlobal(Number(major), local)), 0);
        hunt.highestUnlockedFloor = Object.entries(canonicalUnlocked).reduce((max, [major, local]) => Math.max(max, v173HuntGlobal(Number(major), local)), 1);
        const isUnlocked = floor => v173HuntLocal(floor) <= (canonicalUnlocked[String(v173HuntMajor(floor))] ?? 0);
        const isCleared = floor => v173HuntLocal(floor) <= (canonicalCleared[String(v173HuntMajor(floor))] ?? 0);
        hunt.selectedFloor = Math.max(1, Math.floor(Number(hunt.selectedFloor) || 1));
        if (!isUnlocked(hunt.selectedFloor)) hunt.selectedFloor = hunt.highestUnlockedFloor;
        hunt.farmFloor = Math.max(0, Math.floor(Number(hunt.farmFloor) || 0));
        if (hunt.farmFloor > 0 && !isCleared(hunt.farmFloor)) hunt.farmFloor = hunt.highestClearedFloor;
        hunt.totalBossKills = Math.max(v173NonNegativeInt(hunt.totalBossKills), Object.values(canonicalCleared).reduce((sum, value) => sum + value, 0));
        if (hunt.activeMonster) {
            const floor = Math.max(1, Math.floor(Number(hunt.activeMonster.floor) || hunt.selectedFloor));
            if (floor !== hunt.selectedFloor || !isUnlocked(floor) || (hunt.activeMonster.grade === 'boss' && isCleared(floor)))
                hunt.activeMonster = undefined;
        }
    }
    return state;
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
    normalizeCanonicalWorldToHuntAfterRestore(state, world);
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