import { SeededRng } from './rng.js';
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function rngInt(rng, min, max) {
    return min + Math.floor(rng.next() * (max - min + 1));
}
function rngPick(rng, values) {
    if (values.length === 0)
        throw new Error('Cannot pick from an empty list');
    return values[Math.min(values.length - 1, Math.floor(rng.next() * values.length))];
}
function parentName(seed, relation) {
    const surnames = ['Tần', 'Lạc', 'Hàn', 'Mặc', 'Tô', 'Giang', 'Yến', 'Lâm', 'Chu', 'Trình'];
    const male = ['Trọng Sơn', 'Hoài An', 'Thanh Hà', 'Viễn Sơn', 'Thủ Nhất', 'Huyền Đức'];
    const female = ['Vân Nương', 'Thanh Hà', 'Nhược Lan', 'Tĩnh Y', 'Mộc Nương', 'Vãn Thu'];
    const rng = new SeededRng(seed >>> 0);
    return `${rngPick(rng, surnames)} ${rngPick(rng, relation === 'father' ? male : female)}`;
}
function childName(seed) {
    const surnames = ['Lâm', 'Tần', 'Lạc', 'Hàn', 'Mặc', 'Tô', 'Giang', 'Yến'];
    const given = ['Thanh Vũ', 'Trường Sinh', 'Nhược Ly', 'Tử Yên', 'Hoài Kiếm', 'Minh Nguyệt', 'Vân Khê', 'Thiên Hành'];
    const rng = new SeededRng(seed >>> 0);
    return `${rngPick(rng, surnames)} ${rngPick(rng, given)}`;
}
function allocatedChildSerialV175(id) {
    const match = /^family\.child\..+\.(\d+)$/.exec(String(id ?? ''));
    if (!match)
        return undefined;
    const serial = Number(match[1]);
    return Number.isSafeInteger(serial) && serial >= 0 && serial < Number.MAX_SAFE_INTEGER ? serial : undefined;
}
/** V175: allocated family child IDs are durable authority for the next identity serial. */
export function normalizeSocialFamilyIdentityV175(state) {
    let nextSerial = Number.isSafeInteger(state?.familySerial) && state.familySerial >= 0 ? state.familySerial : 0;
    for (const member of state?.familyMembers ?? []) {
        const allocated = allocatedChildSerialV175(member?.id);
        if (allocated !== undefined)
            nextSerial = Math.max(nextSerial, allocated + 1);
    }
    if (state)
        state.familySerial = nextSerial;
    return state;
}
export function createSocialState(currentWorldYear = 0) {
    return {
        simulatedUntilWorldYear: currentWorldYear,
        bonds: [],
        familyMembers: [],
        majorEvents: [],
        eventSerial: 0,
        familySerial: 0,
    };
}
export function cloneSocialState(state) {
    const cloned = {
        simulatedUntilWorldYear: state.simulatedUntilWorldYear,
        bonds: state.bonds.map(bond => ({ ...bond, transmittedKnowledgeIds: [...bond.transmittedKnowledgeIds] })),
        familyMembers: state.familyMembers.map(member => ({
            ...member,
            bloodlines: member.bloodlines.map(lineage => ({ ...lineage })),
        })),
        majorEvents: state.majorEvents.map(event => ({ ...event, tags: [...event.tags], data: event.data ? { ...event.data } : undefined })),
        eventSerial: state.eventSerial,
        familySerial: state.familySerial,
    };
    return normalizeSocialFamilyIdentityV175(cloned);
}
export function socialBond(state, lifeId, npcId, role) {
    return state.bonds.find(bond => bond.lifeId === lifeId && bond.npcId === npcId && bond.role === role && bond.active);
}
export function establishSocialBond(state, lifeId, npcId, role, worldYear, ageYears, initialDepth) {
    const existing = socialBond(state, lifeId, npcId, role);
    if (existing)
        return existing;
    const bond = {
        lifeId,
        npcId,
        role,
        active: true,
        sinceWorldYear: worldYear,
        sinceAgeYears: ageYears,
        bondDepth: clamp(initialDepth, 0, 100),
        teachingsGiven: 0,
        teachingsReceived: 0,
        jointCultivations: 0,
        transmittedKnowledgeIds: [],
        lastMajorInteractionWorldYear: worldYear,
    };
    state.bonds.push(bond);
    return bond;
}
export function ensureParentsForLife(state, lifeId, birth, character, worldYear, locationId, seed) {
    const existing = state.familyMembers.filter(member => member.sourceLifeId === lifeId && (member.relation === 'father' || member.relation === 'mother'));
    if (existing.length >= 2)
        return existing;
    if (state.familyMembers.length === 0 && state.bonds.length === 0 && state.majorEvents.length === 0) {
        state.simulatedUntilWorldYear = Math.max(state.simulatedUntilWorldYear, worldYear);
    }
    const lineage = character.bloodlines[0];
    const createParent = (relation, offset) => {
        const rng = new SeededRng((seed ^ offset) >>> 0);
        const age = relation === 'father' ? 38 + rngInt(rng, 0, 18) : 35 + rngInt(rng, 0, 16);
        const rootId = relation === 'father' ? character.spiritualRootId : (rng.next() < 0.55 ? character.spiritualRootId : 'root.mixed');
        const hasLineage = Boolean(lineage) && rng.next() < 0.72;
        const member = {
            id: `family.${lifeId}.${relation}`,
            sourceLifeId: lifeId,
            relation,
            name: parentName(seed ^ offset, relation),
            alive: true,
            bornWorldYear: worldYear - age,
            ageYears: age,
            lifespanYears: 88 + rngInt(rng, 0, 58),
            realmOrder: Math.max(0, rngInt(rng, 0, Math.max(1, Math.floor(birth.aptitude / 18)))),
            cultivationProgress: 0,
            potential: clamp(Math.round(birth.aptitude * (0.68 + rng.next() * 0.34)), 20, 92),
            locationId,
            spiritualRootId: rootId,
            physiqueId: rng.next() < 0.18 ? character.physiqueIds[0] : undefined,
            bloodlines: hasLineage && lineage ? [{ id: lineage.id, purity: clamp(lineage.purity * (0.95 + rng.next() * 0.35), lineage.purity, 100) }] : [],
            breakthroughs: 0,
            majorEvents: 0,
            guidanceGiven: 0,
        };
        state.familyMembers.push(member);
        return member;
    };
    if (!existing.some(member => member.relation === 'father'))
        createParent('father', 0x41c64e6d);
    if (!existing.some(member => member.relation === 'mother'))
        createParent('mother', 0x9e3779b9);
    return state.familyMembers.filter(member => member.sourceLifeId === lifeId && (member.relation === 'father' || member.relation === 'mother'));
}
export function createChildForLife(state, lifeId, partner, character, worldYear, locationId, seed, playerAptitude) {
    normalizeSocialFamilyIdentityV175(state);
    const rng = new SeededRng(seed >>> 0);
    const rootPool = ['root.mixed', 'root.wood', 'root.fire', 'root.wind', 'root.lightning', 'root.ice', 'root.five_elements'];
    const rootId = rng.next() < 0.62 ? character.spiritualRootId : rngPick(rng, rootPool);
    const physiqueId = character.physiqueIds[0] && rng.next() < 0.28 ? character.physiqueIds[0] : undefined;
    const bloodlines = character.bloodlines
        .filter(() => rng.next() < 0.68)
        .map(lineage => ({ id: lineage.id, purity: clamp(lineage.purity * (0.62 + rng.next() * 0.35), 1, 100) }));
    const partnerPotentialHint = partner.potential;
    const potential = clamp(Math.round((playerAptitude + partnerPotentialHint) / 2 + (rng.next() - 0.5) * 24), 20, 98);
    const id = `family.child.${lifeId}.${state.familySerial++}`;
    const member = {
        id,
        sourceLifeId: lifeId,
        relation: 'child',
        name: childName(seed ^ state.familySerial),
        alive: true,
        bornWorldYear: worldYear,
        ageYears: 0,
        lifespanYears: 92 + rngInt(rng, 0, 70),
        realmOrder: 0,
        cultivationProgress: 0,
        potential,
        locationId,
        spiritualRootId: rootId,
        physiqueId,
        bloodlines,
        parentNpcId: partner.id,
        parentLifeId: lifeId,
        breakthroughs: 0,
        majorEvents: 0,
        guidanceGiven: 0,
    };
    state.familyMembers.push(member);
    return member;
}
function familyCultivationThreshold(realmOrder) {
    return 7 + realmOrder * 1.35;
}
function appendArchive(state, event) {
    if (event.significance < 10)
        return;
    state.majorEvents.push({ ...event, tags: [...event.tags], data: event.data ? { ...event.data } : undefined });
    if (state.majorEvents.length > 240)
        state.majorEvents.splice(0, state.majorEvents.length - 240);
}
export function syncSocialState(state, targetWorldYear, seed, registry, world) {
    const target = Math.max(targetWorldYear, state.simulatedUntilWorldYear);
    let remaining = target - state.simulatedUntilWorldYear;
    if (remaining <= 1e-9)
        return { elapsedYears: 0, events: [] };
    const elapsedYears = remaining;
    const rng = new SeededRng(seed >>> 0);
    const events = [];
    let cursor = state.simulatedUntilWorldYear;
    while (remaining > 1e-9) {
        const dt = Math.min(1, remaining);
        const endYear = cursor + dt;
        for (const member of state.familyMembers) {
            if (!member.alive)
                continue;
            member.ageYears += dt;
            if (member.ageYears + 1e-9 >= member.lifespanYears) {
                member.alive = false;
                member.majorEvents += 1;
                const event = {
                    id: `social.${Math.floor(endYear * 1000)}.${state.eventSerial++}`,
                    worldTimeYears: endYear,
                    significance: member.relation === 'child' ? 34 : 30,
                    message: `${member.name} thọ tận, hưởng thọ ${Math.floor(member.ageYears)} tuổi.`,
                    actorId: member.id,
                    locationId: member.locationId,
                    tags: ['SocialSimulation', 'Family', 'FamilyDeath', member.relation],
                    data: { sourceLifeId: member.sourceLifeId, familyMemberId: member.id, relation: member.relation, ageYears: member.ageYears },
                };
                events.push(event);
                appendArchive(state, event);
                continue;
            }
            const ageFactor = member.ageYears < 8 ? 0.12 : member.ageYears < 16 ? 0.48 : 1;
            member.cultivationProgress += dt * ageFactor * (0.35 + member.potential / 92);
            const threshold = familyCultivationThreshold(member.realmOrder);
            if (member.ageYears >= 8 && member.cultivationProgress >= threshold) {
                const chance = clamp(0.42 + member.potential / 180 - member.realmOrder * 0.012, 0.2, 0.92);
                if (rng.next() < chance) {
                    member.cultivationProgress -= threshold;
                    member.realmOrder += 1;
                    member.breakthroughs += 1;
                    const realm = [...registry.realms.values()].filter(candidate => candidate.order <= member.realmOrder).sort((a, b) => b.order - a.order)[0];
                    if (realm)
                        member.lifespanYears = Math.max(member.lifespanYears, realm.lifespanYears);
                    const major = member.realmOrder === 5 || member.realmOrder === 9 || member.realmOrder === 14 || member.realmOrder === 18;
                    if (major) {
                        member.majorEvents += 1;
                        const event = {
                            id: `social.${Math.floor(endYear * 1000)}.${state.eventSerial++}`,
                            worldTimeYears: endYear,
                            significance: member.relation === 'child' ? 22 : 14,
                            message: `${member.name} đột phá ${realm?.name ?? `cảnh giới bậc ${member.realmOrder}`}.`,
                            actorId: member.id,
                            locationId: member.locationId,
                            tags: ['SocialSimulation', 'Family', 'FamilyBreakthrough', member.relation],
                            data: { sourceLifeId: member.sourceLifeId, familyMemberId: member.id, relation: member.relation, realmOrder: member.realmOrder },
                        };
                        events.push(event);
                        appendArchive(state, event);
                    }
                }
                else
                    member.cultivationProgress = threshold * 0.72;
            }
            if (!world.locations[member.locationId])
                member.locationId = world.startLocationId;
        }
        cursor = endYear;
        remaining -= dt;
    }
    state.simulatedUntilWorldYear = target;
    return { elapsedYears, events };
}
export function socialChronicle(state, limit = 20) {
    return state.majorEvents
        .slice()
        .sort((a, b) => b.significance - a.significance || b.worldTimeYears - a.worldTimeYears)
        .slice(0, Math.max(0, limit))
        .sort((a, b) => a.worldTimeYears - b.worldTimeYears)
        .map(event => ({ ...event, tags: [...event.tags], data: event.data ? { ...event.data } : undefined }));
}
//# sourceMappingURL=social.js.map