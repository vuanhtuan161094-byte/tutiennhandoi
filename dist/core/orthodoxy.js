export function createOrthodoxyState(currentWorldYear = 0) {
    return {
        simulatedUntilWorldYear: currentWorldYear,
        nextDiplomacyPulseWorldYear: currentWorldYear + 5,
        orthodoxies: {},
        territoryOwnerByLocation: {},
        wars: {},
        relations: {},
        leagues: {},
        warSerial: 0,
        leagueSerial: 0,
    };
}
export function cloneOrthodoxyState(state) {
    const base = createOrthodoxyState(state?.simulatedUntilWorldYear ?? 0);
    return {
        ...base,
        ...state,
        nextDiplomacyPulseWorldYear: state?.nextDiplomacyPulseWorldYear ?? ((state?.simulatedUntilWorldYear ?? 0) + 5),
        orthodoxies: Object.fromEntries(Object.entries(state?.orthodoxies ?? {}).map(([id, value]) => [id, {
                ...value, doctrineTags: [...value.doctrineTags], territoryIds: [...value.territoryIds],
                treasury: value.treasury ?? 0, prosperity: value.prosperity ?? 45, logistics: value.logistics ?? 35, tradePower: value.tradePower ?? 25,
                tributeReceivedLifetime: value.tributeReceivedLifetime ?? 0, tradeIncomeLifetime: value.tradeIncomeLifetime ?? 0,
            }])),
        territoryOwnerByLocation: { ...(state?.territoryOwnerByLocation ?? {}) },
        wars: Object.fromEntries(Object.entries(state?.wars ?? {}).map(([id, value]) => [id, {
                ...value,
                attackerSupportFactionIds: [...(value.attackerSupportFactionIds ?? [])], defenderSupportFactionIds: [...(value.defenderSupportFactionIds ?? [])],
                theaterLocationIds: [...(value.theaterLocationIds ?? [value.contestedLocationId])], transferredLocationIds: [...(value.transferredLocationIds ?? [])],
                scale: value.scale ?? 'border',
            }])),
        relations: Object.fromEntries(Object.entries(state?.relations ?? {}).map(([id, value]) => [id, { ...value }])),
        leagues: Object.fromEntries(Object.entries(state?.leagues ?? {}).map(([id, value]) => [id, { ...value, memberFactionIds: [...value.memberFactionIds] }])),
        leagueSerial: state?.leagueSerial ?? 0,
    };
}
function clamp100(value) { return Math.max(0, Math.min(100, value)); }
function relationKey(a, b) { return a < b ? `${a}|${b}` : `${b}|${a}`; }
function deterministicUnit(seed) {
    let x = seed | 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 1_000_000) / 1_000_000;
}
export function ensureOrthodoxyRelation(state, aFactionId, bFactionId, worldYear) {
    if (aFactionId === bFactionId)
        throw new Error('An orthodoxy cannot have a diplomatic relation with itself');
    const id = relationKey(aFactionId, bFactionId);
    const existing = state.relations[id];
    if (existing)
        return existing;
    const relation = {
        id,
        aFactionId: aFactionId < bFactionId ? aFactionId : bFactionId,
        bFactionId: aFactionId < bFactionId ? bFactionId : aFactionId,
        status: 'neutral', trust: 45, tension: 20, sinceWorldYear: worldYear, tributeRate: 0,
    };
    state.relations[id] = relation;
    return relation;
}
export function orthodoxyRelation(state, aFactionId, bFactionId) {
    return state.relations[relationKey(aFactionId, bFactionId)];
}
export function formOrthodoxyAlliance(state, aFactionId, bFactionId, worldYear) {
    if (!state.orthodoxies[aFactionId] || !state.orthodoxies[bFactionId])
        throw new Error('Both sides must be established orthodoxies');
    if (Object.values(state.wars).some(w => w.active && new Set([w.attackerFactionId, w.defenderFactionId]).has(aFactionId) && new Set([w.attackerFactionId, w.defenderFactionId]).has(bFactionId)))
        throw new Error('Cannot form an alliance while the two sides are at war');
    const relation = ensureOrthodoxyRelation(state, aFactionId, bFactionId, worldYear);
    if (relation.status === 'vassal')
        throw new Error('Vassal relation must be dissolved before forming an alliance');
    if (relation.trust < 40 || relation.tension > 65)
        throw new Error('Diplomatic foundation is too weak for an alliance');
    relation.status = 'allied';
    relation.trust = Math.max(58, relation.trust);
    relation.tension = Math.min(22, relation.tension);
    relation.sinceWorldYear = worldYear;
    relation.overlordFactionId = undefined;
    relation.vassalFactionId = undefined;
    relation.tributeRate = 0;
    return relation;
}
export function establishOrthodoxyVassalage(state, overlordFactionId, vassalFactionId, worldYear) {
    const overlord = state.orthodoxies[overlordFactionId];
    const vassal = state.orthodoxies[vassalFactionId];
    if (!overlord || !vassal)
        throw new Error('Both sides must be established orthodoxies');
    if (overlordFactionId === vassalFactionId)
        throw new Error('Cannot vassalize the same orthodoxy');
    if (overlord.militaryPower < vassal.militaryPower * 1.35 && overlord.doctrineAuthority < vassal.doctrineAuthority + 18)
        throw new Error('Not enough military/doctrinal pressure to establish vassalage');
    const relation = ensureOrthodoxyRelation(state, overlordFactionId, vassalFactionId, worldYear);
    if (relation.status === 'hostile' && relation.tension > 75)
        throw new Error('Active hostility is too deep; end the war first');
    relation.status = 'vassal';
    relation.overlordFactionId = overlordFactionId;
    relation.vassalFactionId = vassalFactionId;
    relation.trust = Math.max(32, relation.trust);
    relation.tension = Math.min(58, relation.tension);
    relation.tributeRate = 0.08;
    relation.sinceWorldYear = worldYear;
    return relation;
}
export function dissolveOrthodoxyPact(state, aFactionId, bFactionId, worldYear) {
    const relation = ensureOrthodoxyRelation(state, aFactionId, bFactionId, worldYear);
    relation.status = 'neutral';
    relation.trust = Math.max(10, relation.trust - 18);
    relation.tension = Math.min(100, relation.tension + 20);
    relation.sinceWorldYear = worldYear;
    relation.overlordFactionId = undefined;
    relation.vassalFactionId = undefined;
    relation.tributeRate = 0;
    return relation;
}
export function ensureOrthodoxyFaction(state, factions, factionId, worldYear) {
    const existing = state.orthodoxies[factionId];
    if (existing)
        return existing;
    const faction = factions.factions[factionId];
    if (!faction)
        throw new Error(`Unknown faction: ${factionId}`);
    const strategic = {
        factionId, name: faction.name, doctrineTags: [...faction.doctrineTags], territoryIds: [faction.locationId], level: 1,
        doctrineAuthority: Math.max(5, Math.min(100, faction.prestige * 0.12)),
        militaryPower: Math.max(10, faction.prestige * 0.65 + Object.values(faction.members).filter(member => member.active).length * 8),
        warFatigue: 0, victories: 0, defeats: 0, foundedWorldYear: worldYear,
        treasury: Math.max(10, faction.prestige * 0.18), prosperity: 52, logistics: 42, tradePower: 35, tributeReceivedLifetime: 0, tradeIncomeLifetime: 0,
    };
    state.orthodoxies[factionId] = strategic;
    state.territoryOwnerByLocation[faction.locationId] = factionId;
    for (const otherId of Object.keys(state.orthodoxies))
        if (otherId !== factionId)
            ensureOrthodoxyRelation(state, factionId, otherId, worldYear);
    return strategic;
}
export function createIndependentOrthodoxy(state, factionId, name, doctrineTags, territoryId, worldYear, power, authority) {
    const existing = state.orthodoxies[factionId];
    if (existing)
        return existing;
    const runtime = { factionId, name, doctrineTags: [...doctrineTags], territoryIds: [], level: Math.max(1, 1 + Math.floor(authority / 35)), doctrineAuthority: clamp100(authority), militaryPower: Math.max(15, power * 1.1), warFatigue: 0, victories: 0, defeats: 0, foundedWorldYear: worldYear, treasury: 20 + power * 0.5, prosperity: 45, logistics: 35, tradePower: 25, tributeReceivedLifetime: 0, tradeIncomeLifetime: 0, independentFounderId: factionId };
    state.orthodoxies[factionId] = runtime;
    if (territoryId && !state.territoryOwnerByLocation[territoryId]) {
        runtime.territoryIds.push(territoryId);
        state.territoryOwnerByLocation[territoryId] = factionId;
    }
    for (const otherId of Object.keys(state.orthodoxies))
        if (otherId !== factionId)
            ensureOrthodoxyRelation(state, factionId, otherId, worldYear);
    return runtime;
}
function allianceSupportIds(state, factionId) {
    const result = new Set();
    for (const rel of Object.values(state.relations)) {
        if (rel.status === 'allied') {
            if (rel.aFactionId === factionId)
                result.add(rel.bFactionId);
            else if (rel.bFactionId === factionId)
                result.add(rel.aFactionId);
        }
        if (rel.status === 'vassal' && rel.overlordFactionId === factionId && rel.vassalFactionId)
            result.add(rel.vassalFactionId);
    }
    for (const league of Object.values(state.leagues))
        if (league.active && league.memberFactionIds.includes(factionId))
            for (const id of league.memberFactionIds)
                if (id !== factionId)
                    result.add(id);
    return [...result].filter(id => Boolean(state.orthodoxies[id]));
}
export function formOrthodoxyLeague(state, founderFactionId, memberFactionIds, name, worldYear) {
    const unique = [...new Set([founderFactionId, ...memberFactionIds])];
    if (unique.length < 3)
        throw new Error('Liên Vực Minh cần ít nhất ba Đạo Thống.');
    if (unique.some(id => !state.orthodoxies[id]))
        throw new Error('Mọi thành viên Liên Vực Minh phải là Đạo Thống đã thành lập.');
    for (let i = 0; i < unique.length; i++)
        for (let j = i + 1; j < unique.length; j++) {
            const rel = ensureOrthodoxyRelation(state, unique[i], unique[j], worldYear);
            if (rel.status !== 'allied' && !(rel.status === 'vassal' && (rel.overlordFactionId === unique[i] || rel.overlordFactionId === unique[j])))
                throw new Error('Các Đạo Thống phải có Tiên Minh/chư hầu trước khi kết Liên Vực Minh.');
        }
    const existing = Object.values(state.leagues).find(l => l.active && unique.some(id => l.memberFactionIds.includes(id)));
    if (existing)
        throw new Error(`Một thành viên đã thuộc Liên Vực Minh ${existing.name}.`);
    const league = { id: `orthodoxy.league.${state.leagueSerial++}`, name: name.trim() || `Vạn Vực Minh ${state.leagueSerial}`, founderFactionId, memberFactionIds: unique, formedWorldYear: worldYear, cohesion: 58, treasury: 0, victories: 0, active: true };
    state.leagues[league.id] = league;
    return league;
}
export function orthodoxyEconomicSummary(state, factionId) {
    const o = state.orthodoxies[factionId];
    if (!o)
        throw new Error('Unknown orthodoxy');
    const territory = Math.max(1, o.territoryIds.length);
    const allies = Object.values(state.relations).filter(r => r.status === 'allied' && (r.aFactionId === factionId || r.bFactionId === factionId)).length;
    const vassals = Object.values(state.relations).filter(r => r.status === 'vassal' && r.overlordFactionId === factionId).length;
    const incomePerYear = territory * (0.12 + o.prosperity * 0.006 + o.tradePower * 0.003) * (1 + allies * 0.08 + vassals * 0.12);
    return { treasury: o.treasury, prosperity: o.prosperity, logistics: o.logistics, tradePower: o.tradePower, incomePerYear, vassals, allies };
}
export function withdrawOrthodoxyTribute(state, factionId, requested) { const o = state.orthodoxies[factionId]; if (!o)
    throw new Error('Unknown orthodoxy'); const cap = Math.max(0, o.treasury * 0.25); const amount = Math.max(0, Math.min(requested, cap, o.treasury)); o.treasury -= amount; return amount; }
export function mobilizeOrthodoxyTreasury(state, factionId, requested) { const o = state.orthodoxies[factionId]; if (!o)
    throw new Error('Unknown orthodoxy'); const spent = Math.max(0, Math.min(requested, o.treasury)); if (spent <= 0)
    return { spent: 0, militaryGain: 0, logisticsGain: 0 }; o.treasury -= spent; const militaryGain = Math.sqrt(spent) * 2.4; const logisticsGain = Math.sqrt(spent) * 0.6; o.militaryPower += militaryGain; o.logistics = clamp100(o.logistics + logisticsGain); return { spent, militaryGain, logisticsGain }; }
export function orthodoxyTerritoryCapacity(domainAuthority, orthodoxyWeight, level) {
    return 1 + Math.max(0, level - 1) + Math.floor((Math.max(0, domainAuthority) + Math.max(0, orthodoxyWeight)) / 35);
}
export function elevateOrthodoxy(state, factions, factionId, worldYear, domainAuthority, orthodoxyWeight) {
    const orthodoxy = ensureOrthodoxyFaction(state, factions, factionId, worldYear);
    const targetLevel = Math.max(1, 1 + Math.floor((Math.max(0, domainAuthority) + Math.max(0, orthodoxyWeight)) / 45));
    orthodoxy.level = Math.max(orthodoxy.level, targetLevel);
    orthodoxy.doctrineAuthority = Math.min(100, Math.max(orthodoxy.doctrineAuthority, 12 + orthodoxyWeight * 0.72));
    orthodoxy.militaryPower = Math.max(orthodoxy.militaryPower, 20 + domainAuthority * 0.75 + orthodoxyWeight * 0.55);
    return orthodoxy;
}
export function claimOrthodoxyTerritory(state, factionId, locationId, capacity) {
    const orthodoxy = state.orthodoxies[factionId];
    if (!orthodoxy)
        throw new Error('Faction has not established an immortal orthodoxy');
    if (orthodoxy.territoryIds.includes(locationId))
        return { claimed: false, territoryCount: orthodoxy.territoryIds.length };
    const currentOwner = state.territoryOwnerByLocation[locationId];
    if (currentOwner && currentOwner !== factionId)
        throw new Error(`Territory is controlled by ${currentOwner}; war is required to seize it`);
    if (orthodoxy.territoryIds.length >= Math.max(1, capacity))
        throw new Error(`Orthodoxy territory capacity reached: ${orthodoxy.territoryIds.length}/${capacity}`);
    orthodoxy.territoryIds.push(locationId);
    state.territoryOwnerByLocation[locationId] = factionId;
    orthodoxy.doctrineAuthority = Math.min(100, orthodoxy.doctrineAuthority + 1.8);
    orthodoxy.militaryPower += 4;
    return { claimed: true, previousOwnerFactionId: currentOwner, territoryCount: orthodoxy.territoryIds.length };
}
export function declareOrthodoxyWar(state, attackerFactionId, defenderFactionId, contestedLocationId, worldYear) {
    if (attackerFactionId === defenderFactionId)
        throw new Error('Cannot declare war on the same orthodoxy');
    if (!state.orthodoxies[attackerFactionId] || !state.orthodoxies[defenderFactionId])
        throw new Error('Both sides must be established orthodoxies');
    const owner = state.territoryOwnerByLocation[contestedLocationId];
    if (owner !== defenderFactionId)
        throw new Error('The defender does not control the contested territory');
    const active = Object.values(state.wars).find(war => war.active && ((war.attackerFactionId === attackerFactionId && war.defenderFactionId === defenderFactionId) || (war.attackerFactionId === defenderFactionId && war.defenderFactionId === attackerFactionId)));
    if (active)
        throw new Error(`An active war already exists: ${active.id}`);
    const relation = ensureOrthodoxyRelation(state, attackerFactionId, defenderFactionId, worldYear);
    if (relation.status === 'allied')
        throw new Error('Alliance must be dissolved before war can be declared');
    if (relation.status === 'vassal')
        throw new Error('Vassal pact must be dissolved before war can be declared');
    relation.status = 'hostile';
    relation.trust = Math.min(relation.trust, 12);
    relation.tension = Math.max(relation.tension, 85);
    relation.sinceWorldYear = worldYear;
    const id = `orthodoxy.war.${state.warSerial++}`;
    const attackerSupportFactionIds = allianceSupportIds(state, attackerFactionId).filter(id => id !== defenderFactionId);
    const defenderSupportFactionIds = allianceSupportIds(state, defenderFactionId).filter(id => id !== attackerFactionId);
    const theaterLocationIds = [contestedLocationId, ...state.orthodoxies[defenderFactionId].territoryIds.filter(id => id !== contestedLocationId).slice(0, (attackerSupportFactionIds.length + defenderSupportFactionIds.length) > 0 ? 1 : 0)];
    const war = { id, attackerFactionId, defenderFactionId, contestedLocationId, startedWorldYear: worldYear, score: 0, attackerWins: 0, defenderWins: 0, campaigns: 0, active: true, attackerSupportFactionIds, defenderSupportFactionIds, theaterLocationIds, transferredLocationIds: [], scale: (attackerSupportFactionIds.length + defenderSupportFactionIds.length) > 0 ? 'interdomain' : 'border' };
    state.wars[id] = war;
    return war;
}
export function resolveOrthodoxyCampaign(state, warId, playerFactionId, playerPower, seedRoll) {
    const war = state.wars[warId];
    if (!war?.active)
        throw new Error(`War is not active: ${warId}`);
    if (playerFactionId !== war.attackerFactionId && playerFactionId !== war.defenderFactionId)
        throw new Error('Player faction is not a participant in this war');
    const attacker = state.orthodoxies[war.attackerFactionId];
    const defender = state.orthodoxies[war.defenderFactionId];
    const playerOnAttack = playerFactionId === attacker.factionId;
    const attackSupport = war.attackerSupportFactionIds.reduce((sum, id) => sum + (state.orthodoxies[id]?.militaryPower ?? 0) * 0.26, 0);
    const defendSupport = war.defenderSupportFactionIds.reduce((sum, id) => sum + (state.orthodoxies[id]?.militaryPower ?? 0) * 0.26, 0);
    const attackPower = attacker.militaryPower * (1 - Math.min(0.55, attacker.warFatigue / 180)) + attackSupport + (playerOnAttack ? playerPower : 0);
    const defendPower = defender.militaryPower * (1 - Math.min(0.55, defender.warFatigue / 180)) + defendSupport + (!playerOnAttack ? playerPower : 0) + 12;
    const ratio = attackPower / Math.max(1, attackPower + defendPower);
    const attackerWon = seedRoll < ratio;
    const margin = Math.max(8, Math.min(28, Math.round(Math.abs(attackPower - defendPower) / Math.max(15, Math.min(attackPower, defendPower)) * 9 + 10)));
    const scoreDelta = attackerWon ? margin : -margin;
    war.score += scoreDelta;
    war.campaigns += 1;
    if (attackerWon) {
        war.attackerWins += 1;
        attacker.victories += 1;
        defender.defeats += 1;
    }
    else {
        war.defenderWins += 1;
        defender.victories += 1;
        attacker.defeats += 1;
    }
    attacker.warFatigue = Math.min(100, attacker.warFatigue + 7 + (attackerWon ? 2 : 5));
    defender.warFatigue = Math.min(100, defender.warFatigue + 7 + (attackerWon ? 5 : 2));
    attacker.militaryPower = Math.max(5, attacker.militaryPower * (attackerWon ? 0.992 : 0.975));
    defender.militaryPower = Math.max(5, defender.militaryPower * (attackerWon ? 0.975 : 0.992));
    let territoryTransferred = false;
    if (war.score >= 70 || war.score <= -70 || war.campaigns >= 7) {
        war.active = false;
        const winner = war.score >= 0 ? attacker : defender;
        war.winnerFactionId = winner.factionId;
        if (winner.factionId === attacker.factionId) {
            const transferIds = war.scale === 'interdomain' && war.score >= 35 ? war.theaterLocationIds.slice(0, 2) : [war.contestedLocationId];
            for (const locationId of transferIds) {
                if (state.territoryOwnerByLocation[locationId] !== defender.factionId)
                    continue;
                defender.territoryIds = defender.territoryIds.filter(id => id !== locationId);
                if (!attacker.territoryIds.includes(locationId))
                    attacker.territoryIds.push(locationId);
                state.territoryOwnerByLocation[locationId] = attacker.factionId;
                war.transferredLocationIds.push(locationId);
                territoryTransferred = true;
            }
        }
        winner.doctrineAuthority = Math.min(100, winner.doctrineAuthority + 4);
        const relation = ensureOrthodoxyRelation(state, attacker.factionId, defender.factionId, war.startedWorldYear);
        relation.status = 'neutral';
        relation.trust = Math.min(28, relation.trust + 8);
        relation.tension = Math.max(38, relation.tension - 32);
    }
    return { warId, attackerWon, scoreDelta, warEnded: !war.active, winnerFactionId: war.winnerFactionId, territoryTransferred };
}
export function syncOrthodoxyState(state, targetWorldYear, seed = 0, playerFactionId) {
    const elapsed = Math.max(0, targetWorldYear - state.simulatedUntilWorldYear);
    const events = [];
    if (elapsed <= 0)
        return events;
    for (const orthodoxy of Object.values(state.orthodoxies)) {
        const territoryFactor = Math.max(1, orthodoxy.territoryIds.length);
        const allianceCount = Object.values(state.relations).filter(r => r.status === 'allied' && (r.aFactionId === orthodoxy.factionId || r.bFactionId === orthodoxy.factionId)).length;
        const income = elapsed * territoryFactor * (0.12 + orthodoxy.prosperity * 0.006 + orthodoxy.tradePower * 0.003) * (1 + allianceCount * 0.08);
        orthodoxy.treasury += income;
        orthodoxy.tradeIncomeLifetime += income;
        orthodoxy.tradePower = clamp100(orthodoxy.tradePower + elapsed * (0.0025 * allianceCount + 0.0008 * orthodoxy.logistics));
        orthodoxy.prosperity = clamp100(orthodoxy.prosperity + elapsed * (0.003 + allianceCount * 0.0015 - orthodoxy.warFatigue * 0.00018));
        orthodoxy.logistics = clamp100(orthodoxy.logistics + elapsed * (0.002 * territoryFactor - orthodoxy.warFatigue * 0.00012));
        orthodoxy.militaryPower += elapsed * (0.025 * territoryFactor + 0.012 * orthodoxy.level) * (0.7 + orthodoxy.logistics / 200);
        orthodoxy.doctrineAuthority = Math.min(100, orthodoxy.doctrineAuthority + elapsed * 0.004 * territoryFactor);
        orthodoxy.warFatigue = Math.max(0, orthodoxy.warFatigue - elapsed * 0.18);
    }
    const ids = Object.keys(state.orthodoxies).sort();
    while (state.nextDiplomacyPulseWorldYear <= targetWorldYear + 1e-9) {
        const pulseYear = state.nextDiplomacyPulseWorldYear;
        for (let i = 0; i < ids.length; i++)
            for (let j = i + 1; j < ids.length; j++) {
                const a = state.orthodoxies[ids[i]];
                const b = state.orthodoxies[ids[j]];
                const rel = ensureOrthodoxyRelation(state, a.factionId, b.factionId, pulseYear);
                const pairSeed = seed ^ Math.floor(pulseYear * 97) ^ ((i + 1) * 0x45d9f3b) ^ ((j + 1) * 0x119de1f3);
                const roll = deterministicUnit(pairSeed);
                const activeWar = Object.values(state.wars).find(w => w.active && ((w.attackerFactionId === a.factionId && w.defenderFactionId === b.factionId) || (w.attackerFactionId === b.factionId && w.defenderFactionId === a.factionId)));
                if (activeWar) {
                    rel.status = 'hostile';
                    rel.tension = clamp100(rel.tension + 4);
                    rel.trust = clamp100(rel.trust - 3);
                    continue;
                }
                if (rel.status === 'allied') {
                    rel.trust = clamp100(rel.trust + 1.5);
                    rel.tension = clamp100(rel.tension - 2);
                }
                else if (rel.status === 'vassal') {
                    rel.trust = clamp100(rel.trust + 0.4);
                    rel.tension = clamp100(rel.tension - 0.5);
                    const overlord = state.orthodoxies[rel.overlordFactionId ?? ''];
                    const vassal = state.orthodoxies[rel.vassalFactionId ?? ''];
                    if (overlord && vassal) {
                        const tribute = Math.max(0.25, Math.min(vassal.treasury * 0.08, vassal.militaryPower * rel.tributeRate * 0.08));
                        vassal.treasury = Math.max(0, vassal.treasury - tribute);
                        overlord.treasury += tribute;
                        overlord.tributeReceivedLifetime += tribute;
                        vassal.doctrineAuthority = clamp100(vassal.doctrineAuthority + 0.25);
                        if (roll > 0.76)
                            events.push({ type: 'tribute', significance: 18, message: `${vassal.name} nộp ${tribute.toFixed(1)} Tiên Vực cống cho ${overlord.name}; quan hệ chư hầu tiếp tục.`, factionIds: [overlord.factionId, vassal.factionId] });
                    }
                }
                else {
                    const powerRatio = Math.max(a.militaryPower, b.militaryPower) / Math.max(1, Math.min(a.militaryPower, b.militaryPower));
                    const rivalry = Math.abs(a.doctrineAuthority - b.doctrineAuthority) < 18 ? 1.8 : -0.4;
                    rel.tension = clamp100(rel.tension + (roll - 0.46) * 8 + rivalry + Math.max(0, powerRatio - 1.6) * 2.5);
                    rel.trust = clamp100(rel.trust + (0.48 - roll) * 5 - Math.max(0, rel.tension - 55) * 0.035);
                    if (rel.trust >= 72 && rel.tension <= 24 && roll < 0.34) {
                        rel.status = 'allied';
                        rel.sinceWorldYear = pulseYear;
                        events.push({ type: 'alliance', significance: 62, message: `${a.name} và ${b.name} kết Tiên Minh, trao đổi đạo thống và cam kết tương trợ.`, factionIds: [a.factionId, b.factionId] });
                    }
                    else if (powerRatio >= 2.25 && rel.tension >= 52 && rel.trust <= 42 && roll < 0.22) {
                        const overlord = a.militaryPower >= b.militaryPower ? a : b;
                        const vassal = overlord === a ? b : a;
                        rel.status = 'vassal';
                        rel.overlordFactionId = overlord.factionId;
                        rel.vassalFactionId = vassal.factionId;
                        rel.tributeRate = 0.08;
                        rel.sinceWorldYear = pulseYear;
                        events.push({ type: 'vassal', significance: 74, message: `${vassal.name} chấp nhận làm chư hầu của ${overlord.name} để tránh một trận Tiên Vực chiến bất lợi.`, factionIds: [overlord.factionId, vassal.factionId] });
                    }
                    else if (rel.tension >= 82 && roll > 0.78) {
                        const attacker = a.militaryPower >= b.militaryPower ? a : b;
                        const defender = attacker === a ? b : a;
                        const target = defender.territoryIds[0];
                        if (target) {
                            try {
                                const war = declareOrthodoxyWar(state, attacker.factionId, defender.factionId, target, pulseYear);
                                events.push({ type: 'war', significance: 96, message: `${attacker.name} tự phát tuyên chiến ${defender.name}; Tiên Vực bước vào một vòng tranh bá mới.`, factionIds: [attacker.factionId, defender.factionId], warId: war.id, locationId: target });
                            }
                            catch { }
                        }
                    }
                }
            }
        const unaligned = ids.filter(id => !Object.values(state.leagues).some(l => l.active && l.memberFactionIds.includes(id)));
        for (const founderId of unaligned) {
            const allied = unaligned.filter(id => id !== founderId && orthodoxyRelation(state, founderId, id)?.status === 'allied');
            if (allied.length >= 2) {
                const members = [founderId, ...allied.slice(0, 2)];
                const cohesion = Math.min(...members.flatMap((a, i) => members.slice(i + 1).map(b => orthodoxyRelation(state, a, b)?.trust ?? 0)));
                if (cohesion >= 76) {
                    try {
                        const league = formOrthodoxyLeague(state, founderId, members.slice(1), `${state.orthodoxies[founderId].name} Liên Vực Minh`, pulseYear);
                        events.push({ type: 'league', significance: 84, message: `${league.name} thành lập với ${league.memberFactionIds.length} Đạo Thống; chiến tranh từ đây có thể huy động đồng minh liên vực.`, factionIds: [...league.memberFactionIds] });
                    }
                    catch { }
                    break;
                }
            }
        }
        for (const league of Object.values(state.leagues).filter(l => l.active)) {
            const members = league.memberFactionIds.map(id => state.orthodoxies[id]).filter(Boolean);
            const contribution = members.reduce((sum, o) => sum + Math.max(0, o.treasury) * 0.002, 0);
            league.treasury += contribution;
            league.cohesion = clamp100(league.cohesion + 0.15 - members.reduce((s, o) => s + o.warFatigue, 0) / Math.max(1, members.length) * 0.004);
        }
        for (const war of Object.values(state.wars).filter(w => w.active)) {
            if (playerFactionId && (war.attackerFactionId === playerFactionId || war.defenderFactionId === playerFactionId))
                continue;
            const roll = deterministicUnit(seed ^ Math.floor(pulseYear * 131) ^ war.id.length * 0x9e3779b1 ^ war.campaigns * 17);
            const result = resolveOrthodoxyCampaign(state, war.id, war.attackerFactionId, 0, roll);
            const a = state.orthodoxies[war.attackerFactionId], b = state.orthodoxies[war.defenderFactionId];
            events.push({ type: 'campaign', significance: result.warEnded ? 104 : 46, message: `NPC Tiên Vực chiến: ${a.name} ${result.attackerWon ? 'thắng' : 'thua'} một chiến dịch trước ${b.name}${result.warEnded ? `; chiến tranh kết thúc, ${state.orthodoxies[result.winnerFactionId]?.name ?? result.winnerFactionId} thắng` : ''}.`, factionIds: [a.factionId, b.factionId], warId: war.id, locationId: war.contestedLocationId });
        }
        state.nextDiplomacyPulseWorldYear += 5;
    }
    state.simulatedUntilWorldYear = targetWorldYear;
    return events;
}
//# sourceMappingURL=orthodoxy.js.map