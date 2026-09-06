import { SeededRng } from './rng.js';
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function cloneRecord(record) {
    return {
        ...record,
        tags: [...record.tags],
        data: record.data ? { ...record.data } : undefined,
    };
}
export function createWorldSimulationState(world, currentWorldYear = 0) {
    const npcs = {};
    for (const definition of Object.values(world.npcs ?? {})) {
        npcs[definition.id] = {
            id: definition.id,
            alive: true,
            ageYears: definition.startingAgeYears,
            realmOrder: definition.startingRealmOrder,
            lifespanYears: definition.lifespanYears,
            cultivationProgress: 0,
            locationId: definition.startingLocationId ?? definition.homeLocationId,
            claimedOpportunityIds: [],
            breakthroughs: 0,
            majorEvents: 0,
        };
    }
    return {
        simulatedUntilWorldYear: currentWorldYear,
        npcs,
        claimedOpportunityIds: [],
        opportunityClaims: {},
        relationships: {},
        playerRelationships: {},
        majorEvents: [],
        eventSerial: 0,
    };
}
export function cloneWorldSimulationState(state) {
    return {
        simulatedUntilWorldYear: state.simulatedUntilWorldYear,
        npcs: Object.fromEntries(Object.entries(state.npcs).map(([id, npc]) => [id, {
                ...npc,
                claimedOpportunityIds: [...npc.claimedOpportunityIds],
            }])),
        claimedOpportunityIds: [...state.claimedOpportunityIds],
        opportunityClaims: Object.fromEntries(Object.entries(state.opportunityClaims ?? {}).map(([key, claim]) => [key, { ...claim }])),
        relationships: Object.fromEntries(Object.entries(state.relationships ?? {}).map(([key, relation]) => [key, { ...relation }])),
        playerRelationships: Object.fromEntries(Object.entries(state.playerRelationships ?? {}).map(([key, relation]) => [key, { ...relation, flags: [...relation.flags] }])),
        majorEvents: state.majorEvents.map(cloneRecord),
        eventSerial: state.eventSerial,
    };
}
function primaryGoal(definition) {
    return [...definition.goals].sort((a, b) => b.priority - a.priority)[0] ?? { id: 'goal.default.cultivate', type: 'cultivate', priority: 50 };
}
function realmName(registry, order) {
    const realm = [...registry.realms.values()].filter(candidate => candidate.order <= order).sort((a, b) => b.order - a.order)[0];
    return realm?.name ?? `Cảnh giới bậc ${order}`;
}
function realmLifespan(registry, order, fallback) {
    const realm = [...registry.realms.values()].filter(candidate => candidate.order <= order).sort((a, b) => b.order - a.order)[0];
    return Math.max(fallback, realm?.lifespanYears ?? fallback);
}
function cultivationThreshold(realmOrder) {
    return 5.5 + realmOrder * 1.25;
}
function canReachLocation(world, from, to) {
    if (from === to)
        return true;
    return Boolean(world.locations[from]?.neighbors.includes(to));
}
function appendMajorArchive(state, event) {
    if (event.significance < 10)
        return;
    state.majorEvents.push(cloneRecord(event));
    // Keep global history useful without letting saves grow without bound in the prototype.
    if (state.majorEvents.length > 240)
        state.majorEvents.splice(0, state.majorEvents.length - 240);
}
function playerRelationKey(lifeId, npcId) {
    return `${lifeId}|${npcId}`;
}
export function playerNpcRelationship(state, lifeId, npcId, worldYear) {
    const key = playerRelationKey(lifeId, npcId);
    const current = state.playerRelationships[key];
    if (current)
        return current;
    const relation = {
        lifeId,
        npcId,
        met: false,
        trust: 0,
        respect: 0,
        debt: 0,
        grudge: 0,
        karmaDepth: 0,
        interactionCount: 0,
        lastInteractionWorldYear: -1e9,
        flags: [],
    };
    state.playerRelationships[key] = relation;
    return relation;
}
export function pastLifeKarmaForNpc(state, currentLifeId, npcId) {
    return Object.values(state.playerRelationships)
        .filter(relation => relation.lifeId !== currentLifeId && relation.npcId === npcId)
        .reduce((max, relation) => Math.max(max, relation.karmaDepth), 0);
}
export function adjustPlayerNpcRelationship(state, lifeId, npcId, worldYear, delta, flags = []) {
    const relation = playerNpcRelationship(state, lifeId, npcId, worldYear);
    relation.met = true;
    relation.trust = clamp(relation.trust + (delta.trust ?? 0), 0, 100);
    relation.respect = clamp(relation.respect + (delta.respect ?? 0), 0, 100);
    relation.debt = clamp(relation.debt + (delta.debt ?? 0), 0, 100);
    relation.grudge = clamp(relation.grudge + (delta.grudge ?? 0), 0, 100);
    relation.karmaDepth = clamp(relation.karmaDepth + (delta.karmaDepth ?? 0), 0, 100);
    relation.interactionCount += 1;
    relation.lastInteractionWorldYear = worldYear;
    for (const flag of flags)
        if (!relation.flags.includes(flag))
            relation.flags.push(flag);
    return relation;
}
function relationKey(aId, bId) {
    return aId < bId ? `${aId}|${bId}` : `${bId}|${aId}`;
}
function relationshipBetween(state, aId, bId, worldYear) {
    const key = relationKey(aId, bId);
    const current = state.relationships[key];
    if (current)
        return current;
    const relation = {
        aId: aId < bId ? aId : bId,
        bId: aId < bId ? bId : aId,
        trust: 0,
        respect: 0,
        grudge: 0,
        karmaDepth: 0,
        lastChangedWorldYear: worldYear,
    };
    state.relationships[key] = relation;
    return relation;
}
export class WorldSimulator {
    world;
    registry;
    constructor(world, registry) {
        this.world = world;
        this.registry = registry;
    }
    sync(state, targetWorldYear, seed, playerContext) {
        const target = Math.max(state.simulatedUntilWorldYear, targetWorldYear);
        const elapsed = target - state.simulatedUntilWorldYear;
        if (elapsed <= 1e-9)
            return { elapsedYears: 0, events: [] };
        const events = [];
        const rng = new SeededRng(seed);
        let cursor = state.simulatedUntilWorldYear;
        let remaining = elapsed;
        while (remaining > 1e-9) {
            const dt = Math.min(1, remaining);
            const endYear = cursor + dt;
            this.advanceNpcs(state, cursor, endYear, dt, rng, events, playerContext);
            this.resolveOpportunities(state, endYear, rng, events);
            cursor = endYear;
            remaining -= dt;
        }
        state.simulatedUntilWorldYear = target;
        return { elapsedYears: elapsed, events };
    }
    emit(state, events, worldTimeYears, significance, message, tags, actorId, locationId, data) {
        const event = {
            id: `world.${Math.floor(worldTimeYears * 1000)}.${state.eventSerial++}`,
            worldTimeYears,
            significance,
            message,
            actorId,
            locationId,
            tags: ['WorldSimulation', ...tags],
            data,
        };
        events.push(event);
        appendMajorArchive(state, event);
    }
    advanceNpcs(state, startYear, endYear, dt, rng, events, playerContext) {
        for (const definition of Object.values(this.world.npcs ?? {})) {
            const npc = state.npcs[definition.id];
            if (!npc || !npc.alive)
                continue;
            npc.ageYears += dt;
            if (npc.ageYears + 1e-9 >= npc.lifespanYears) {
                npc.alive = false;
                npc.majorEvents += 1;
                this.emit(state, events, endYear, 22, `${definition.name} thọ tận tại ${this.world.locations[npc.locationId]?.name ?? 'nơi vô danh'}, hưởng thọ ${Math.floor(npc.ageYears)} tuổi.`, ['Npc', 'NpcDeath', 'NaturalDeath'], definition.id, npc.locationId, { realmOrder: npc.realmOrder, ageYears: npc.ageYears });
                continue;
            }
            const goal = primaryGoal(definition);
            const ambitionFactor = 0.82 + definition.personality.ambition / 250;
            const focusFactor = goal.type === 'cultivate' ? 1.18 : goal.type === 'guardHome' ? 0.88 : 1;
            const growth = dt * (0.42 + definition.potential / 85) * ambitionFactor * focusFactor;
            npc.cultivationProgress += growth;
            const threshold = cultivationThreshold(npc.realmOrder);
            if (npc.cultivationProgress >= threshold) {
                const readiness = clamp(52 + definition.potential * 0.33 + definition.personality.ambition * 0.12 - npc.realmOrder * 1.2, 18, 96);
                if (rng.next() * 100 <= readiness) {
                    npc.cultivationProgress -= threshold;
                    npc.realmOrder += 1;
                    npc.breakthroughs += 1;
                    npc.lifespanYears = realmLifespan(this.registry, npc.realmOrder, npc.lifespanYears + 2);
                    const significance = npc.realmOrder >= 22 ? 45
                        : npc.realmOrder >= 18 ? (npc.realmOrder === 18 || npc.realmOrder === 21 ? 34 : 9)
                            : npc.realmOrder >= 14 ? (npc.realmOrder === 14 || npc.realmOrder === 17 ? 28 : 8)
                                : npc.realmOrder >= 10 ? (npc.realmOrder === 10 || npc.realmOrder === 13 ? 22 : 7)
                                    : npc.realmOrder === 9 ? 14
                                        : npc.realmOrder === 5 ? 10
                                            : 4;
                    const surfacedSignificance = definition.simulationTier === 'background' && significance < 20 ? Math.min(6, significance) : significance;
                    if (surfacedSignificance >= 10)
                        npc.majorEvents += 1;
                    this.emit(state, events, endYear, surfacedSignificance, `${definition.name} đột phá ${realmName(this.registry, npc.realmOrder)}.`, ['Npc', 'NpcBreakthrough', `RealmOrder${npc.realmOrder}`], definition.id, npc.locationId, { realmOrder: npc.realmOrder, breakthroughs: npc.breakthroughs });
                }
                else {
                    npc.cultivationProgress = threshold * 0.72;
                }
            }
            const location = this.world.locations[npc.locationId];
            if (!location)
                continue;
            const dangerPressure = location.danger - npc.realmOrder * 4 - definition.personality.caution * 0.35;
            if (dangerPressure > 35) {
                const deathChance = clamp((dangerPressure - 35) * 0.0017 * dt, 0, 0.08);
                if (rng.next() < deathChance) {
                    npc.alive = false;
                    npc.majorEvents += 1;
                    this.emit(state, events, endYear, 32, `${definition.name} bỏ mạng tại ${location.name} trong một lần lịch luyện thất bại.`, ['Npc', 'NpcDeath', 'AdventureDeath'], definition.id, npc.locationId, { realmOrder: npc.realmOrder, danger: location.danger });
                    continue;
                }
            }
            const playerRelation = playerContext
                ? state.playerRelationships[playerRelationKey(playerContext.lifeId, definition.id)]
                : undefined;
            if (playerContext && playerRelation?.met) {
                const seeksPlayer = playerRelation.debt >= 28 || playerRelation.trust >= 45 || playerRelation.grudge >= 45;
                if (seeksPlayer && npc.locationId !== playerContext.locationId && canReachLocation(this.world, npc.locationId, playerContext.locationId)) {
                    const pull = playerRelation.grudge >= 45 ? 0.34 : 0.22;
                    if (rng.next() < pull * dt) {
                        npc.locationId = playerContext.locationId;
                        const hostile = playerRelation.grudge >= 45;
                        this.emit(state, events, endYear, hostile ? 16 : 12, hostile
                            ? `${definition.name} lần theo nhân quả, chủ động tìm tới nơi ngươi đang ở.`
                            : `${definition.name} vì một đoạn ân tình cũ mà tìm tới nơi ngươi đang ở.`, ['Npc', 'Relationship', hostile ? 'RivalApproach' : 'FriendlyApproach'], definition.id, npc.locationId, { playerLifeId: playerContext.lifeId, grudge: playerRelation.grudge, debt: playerRelation.debt, trust: playerRelation.trust });
                    }
                }
                if (npc.locationId === playerContext.locationId && playerRelation.debt >= 30 && endYear - playerRelation.lastInteractionWorldYear >= 0.5 && !playerRelation.flags.includes('DebtRepaidOnce')) {
                    playerRelation.flags.push('DebtRepaidOnce');
                    playerRelation.debt = clamp(playerRelation.debt - 18, 0, 100);
                    playerRelation.trust = clamp(playerRelation.trust + 4, 0, 100);
                    this.emit(state, events, endYear, 18, `${definition.name} tìm tới trả một phần ân tình, để lại một túi linh thạch rồi rời đi.`, ['Npc', 'Relationship', 'DebtRepaid', 'PlayerReward'], definition.id, npc.locationId, { playerLifeId: playerContext.lifeId, playerRewardSpiritStones: 8 + Math.floor(playerRelation.karmaDepth / 5), debtRemaining: playerRelation.debt });
                }
                if (npc.locationId === playerContext.locationId && playerRelation.grudge >= 45 && endYear - playerRelation.lastInteractionWorldYear >= 0.25 && !playerRelation.flags.includes('RivalChallengeSurfaced')) {
                    playerRelation.flags.push('RivalChallengeSurfaced');
                    this.emit(state, events, endYear, 24, `${definition.name} mang theo oán khí tìm tới, công khai hẹn ngươi một trận.`, ['Npc', 'Relationship', 'RivalChallenge', 'PendingEncounter'], definition.id, npc.locationId, { playerLifeId: playerContext.lifeId, grudge: playerRelation.grudge, karmaDepth: playerRelation.karmaDepth });
                }
            }
            const moveDrive = goal.type === 'explore' || goal.type === 'seekOpportunity'
                ? (definition.personality.curiosity + definition.personality.ambition) / 260
                : goal.type === 'guardHome' ? 0.015 : 0.045;
            if (location.neighbors.length > 0 && rng.next() < moveDrive * dt) {
                let options = [...location.neighbors];
                if (goal.type === 'seekOpportunity') {
                    const activeOpportunityLocations = Object.values(this.world.opportunities ?? {})
                        .filter(opportunity => !state.claimedOpportunityIds.includes(opportunity.id))
                        .filter(opportunity => opportunity.availableFromWorldYear <= endYear)
                        .filter(opportunity => opportunity.expiresAtWorldYear === undefined || opportunity.expiresAtWorldYear >= endYear)
                        .map(opportunity => opportunity.locationId);
                    const toward = options.filter(id => activeOpportunityLocations.includes(id));
                    if (toward.length > 0)
                        options = toward;
                }
                const next = options[Math.floor(rng.next() * options.length)];
                npc.locationId = next;
                if (definition.personality.curiosity >= 72 && rng.next() < 0.18) {
                    this.emit(state, events, endYear, 4, `${definition.name} rời ${location.name}, tới ${this.world.locations[next]?.name ?? next} lịch luyện.`, ['Npc', 'NpcTravel'], definition.id, next);
                }
            }
        }
    }
    resolveOpportunities(state, worldYear, rng, events) {
        for (const opportunity of Object.values(this.world.opportunities ?? {})) {
            if (state.claimedOpportunityIds.includes(opportunity.id))
                continue;
            if (opportunity.availableFromWorldYear > worldYear)
                continue;
            if (opportunity.expiresAtWorldYear !== undefined && opportunity.expiresAtWorldYear < worldYear)
                continue;
            const candidates = [];
            for (const definition of Object.values(this.world.npcs ?? {})) {
                const npc = state.npcs[definition.id];
                if (!npc?.alive)
                    continue;
                if (!canReachLocation(this.world, npc.locationId, opportunity.locationId))
                    continue;
                const goal = primaryGoal(definition);
                const goalBonus = goal.type === 'seekOpportunity' ? 20 : goal.type === 'explore' ? 7 : 0;
                const score = npc.realmOrder * 7
                    + definition.potential * 0.28
                    + definition.personality.ambition * 0.22
                    + definition.personality.curiosity * 0.12
                    + goalBonus
                    + rng.next() * 24;
                candidates.push({ definition, npc, score });
            }
            candidates.sort((a, b) => b.score - a.score);
            const winner = candidates[0];
            if (!winner || winner.score < opportunity.difficulty)
                continue;
            state.claimedOpportunityIds.push(opportunity.id);
            state.opportunityClaims[opportunity.id] = { opportunityId: opportunity.id, claimantType: 'npc', claimantId: winner.definition.id, worldYear };
            winner.npc.claimedOpportunityIds.push(opportunity.id);
            winner.npc.cultivationProgress += opportunity.realmProgressBonus ?? opportunity.value * 0.08;
            winner.npc.locationId = opportunity.locationId;
            winner.npc.majorEvents += 1;
            const runnerUp = candidates[1];
            if (runnerUp) {
                const relation = relationshipBetween(state, winner.definition.id, runnerUp.definition.id, worldYear);
                const rivalryPressure = clamp(6 + (runnerUp.definition.personality.ambition + runnerUp.definition.personality.pride) / 24, 6, 16);
                relation.grudge = clamp(relation.grudge + rivalryPressure, 0, 100);
                relation.respect = clamp(relation.respect + Math.max(2, (winner.score - runnerUp.score) / 10), 0, 100);
                relation.karmaDepth = clamp(relation.karmaDepth + opportunity.value / 10, 0, 100);
                relation.lastChangedWorldYear = worldYear;
                if (relation.grudge >= 24 && relation.grudge - rivalryPressure < 24) {
                    this.emit(state, events, worldYear, 13, `${runnerUp.definition.name} vì hụt cơ duyên “${opportunity.name}” mà kết oán với ${winner.definition.name}.`, ['Npc', 'Relationship', 'Rivalry', 'OpportunityConflict'], runnerUp.definition.id, opportunity.locationId, { counterpartId: winner.definition.id, grudge: relation.grudge, karmaDepth: relation.karmaDepth });
                }
            }
            this.emit(state, events, worldYear, opportunity.value, `${winner.definition.name} đoạt được cơ duyên “${opportunity.name}” tại ${this.world.locations[opportunity.locationId]?.name ?? opportunity.locationId}.`, ['Npc', 'OpportunityClaimed', ...opportunity.tags], winner.definition.id, opportunity.locationId, { opportunityId: opportunity.id, value: opportunity.value, realmOrder: winner.npc.realmOrder });
        }
    }
}
export function worldChronicle(state, limit = 20) {
    return state.majorEvents.slice(-Math.max(0, limit)).map(cloneRecord);
}
//# sourceMappingURL=npc.js.map