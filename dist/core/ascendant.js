import { createIndependentOrthodoxy, declareOrthodoxyWar, ensureOrthodoxyRelation } from './orthodoxy.js';
export function createOuterAscendantState(worldYear = 0) {
    return { serial: 0, simulatedUntilWorldYear: worldYear, actors: {} };
}
export function cloneOuterAscendantState(state) {
    return {
        serial: state?.serial ?? 0,
        simulatedUntilWorldYear: state?.simulatedUntilWorldYear ?? 0,
        actors: Object.fromEntries(Object.entries(state?.actors ?? {}).map(([id, actor]) => [id, { ...actor, deeds: [...(actor.deeds ?? [])] }])),
    };
}
function clamp100(v) { return Math.max(0, Math.min(100, v)); }
function hashText(text) { let h = 2166136261; for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
} return h >>> 0; }
function unit(seed) { let x = seed | 0; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 1_000_000) / 1_000_000; }
function emergenceLocation(power, candidates) {
    const preferred = power >= 92 ? 'location.supreme_dao_origin_sea' : power >= 82 ? 'location.nameless_boundary' : 'location.ten_thousand_domain_king_court';
    return candidates.includes(preferred) ? preferred : (candidates[0] ?? 'location.nameless_boundary');
}
/** Materialize every native who actually self-transcended. Repeated calls are idempotent. */
export function materializeGenesisAscendants(state, genesis, outerWorldYear, locationCandidates) {
    const events = [];
    const existingSourceIds = new Set(Object.values(state.actors).map(a => `${a.sourceWorldId}|${a.sourcePersonId}`));
    for (const world of Object.values(genesis.worlds))
        for (const person of Object.values(world.notables)) {
            if (person.status !== 'transcended')
                continue;
            const key = `${world.id}|${person.id}`;
            if (existingSourceIds.has(key))
                continue;
            const id = `outer.ascendant.${state.serial++}`;
            const sourceDaoName = person.daoId ? world.emergentDaos[person.daoId]?.name : undefined;
            const sourceSectName = person.sectId ? world.sects[person.sectId]?.name : undefined;
            const relation = person.stance === 'reverent' ? 72 : person.stance === 'rebellious' ? 18 : 48;
            const actor = {
                id, sourceWorldId: world.id, sourcePersonId: person.id, sourceDaoName, sourceSectName, name: person.name,
                emergedWorldYear: outerWorldYear, lastSimulatedWorldYear: outerWorldYear, locationId: emergenceLocation(person.power, locationCandidates),
                power: Math.max(20, person.power), insight: person.insight, aptitude: person.aptitude, creatorStance: person.stance, creatorRelation: relation,
                disposition: person.stance === 'rebellious' ? 'rival' : 'wanderer', status: 'active', memoryOfCreator: person.stance === 'reverent' ? 95 : person.stance === 'rebellious' ? 88 : 68,
                deeds: [`Siêu Thoát khỏi ${world.name}${sourceDaoName ? ` bằng ${sourceDaoName}` : ''}.`],
            };
            state.actors[id] = actor;
            existingSourceIds.add(key);
            events.push({ type: 'emergence', significance: 145, actorId: id, locationId: actor.locationId, message: `${actor.name}, thiên tài từng sinh trong ${world.name}, xuyên qua giới bích và thật sự xuất hiện tại Đại Thế Giới${sourceDaoName ? ` với ${sourceDaoName}` : ''}.` });
        }
    return events;
}
function unownedTerritory(orth, candidates) { return candidates.find(id => !orth.territoryOwnerByLocation[id]); }
function strongestTarget(orth, exclude) { return Object.values(orth.orthodoxies).filter(o => o.factionId !== exclude && o.territoryIds.length > 0).sort((a, b) => b.doctrineAuthority - a.doctrineAuthority)[0]?.factionId; }
/** Outer ascendants continue living in the same strategic world as the orthodoxies. */
export function syncOuterAscendants(state, orth, targetWorldYear, seed, playerFactionId, locationCandidates) {
    const elapsed = Math.max(0, targetWorldYear - state.simulatedUntilWorldYear);
    if (elapsed <= 1e-9)
        return [];
    const events = [];
    for (const actor of Object.values(state.actors).filter(a => a.status === 'active')) {
        const actorElapsed = Math.max(0, targetWorldYear - actor.lastSimulatedWorldYear);
        actor.lastSimulatedWorldYear = targetWorldYear;
        actor.power = clamp100(actor.power + Math.log1p(actorElapsed) * 0.45 * (0.6 + actor.aptitude / 120));
        actor.insight = clamp100(actor.insight + Math.log1p(actorElapsed) * 0.32);
        const roll = unit(seed ^ hashText(actor.id) ^ Math.floor(targetWorldYear * 17));
        if (actor.disposition === 'wanderer' && playerFactionId && actor.creatorStance === 'reverent' && actor.creatorRelation >= 65 && roll < Math.min(0.6, actorElapsed / 120)) {
            actor.disposition = 'ally';
            actor.alignedFactionId = playerFactionId;
            const home = orth.orthodoxies[playerFactionId];
            if (home) {
                home.militaryPower += actor.power * 0.45;
                home.doctrineAuthority = clamp100(home.doctrineAuthority + actor.insight * 0.035);
            }
            actor.deeds.push('Sau khi bước ra Đại Thế Giới, lựa chọn tương trợ Đạo Thống của Sáng Thế Chủ.');
            events.push({ type: 'alignment', significance: 96, actorId: actor.id, factionIds: [playerFactionId], message: `${actor.name} nhận ra dấu vết của Sáng Thế Chủ trong Đại Thế Giới và lựa chọn đứng cùng Đạo Thống của ngươi.` });
        }
        if ((actor.disposition === 'wanderer' || actor.disposition === 'rival') && actor.power >= 72 && actor.insight >= 70 && actorElapsed >= 5 && roll > 0.44) {
            const factionId = `faction.ascendant.${actor.id}`;
            const territory = unownedTerritory(orth, locationCandidates);
            const daoTag = actor.sourceDaoName ?? 'Tự Sinh Đạo';
            const founded = createIndependentOrthodoxy(orth, factionId, `${actor.name} Đạo Đình`, [daoTag, 'AscendantFounded'], territory, targetWorldYear, actor.power, actor.insight);
            founded.independentFounderId = actor.id;
            actor.disposition = 'sovereign';
            actor.foundedFactionId = factionId;
            actor.locationId = territory ?? actor.locationId;
            actor.deeds.push(`Tự lập ${founded.name} tại Đại Thế Giới.`);
            events.push({ type: 'founding', significance: 128, actorId: actor.id, factionIds: [factionId], locationId: territory, message: `${actor.name} không còn là một “NPC nội giới”: người này tự lập ${founded.name}${territory ? ' và chiếm một phương Tiên Vực' : ' giữa khe hở các Tiên Vực'}.` });
            if (playerFactionId) {
                const rel = ensureOrthodoxyRelation(orth, factionId, playerFactionId, targetWorldYear);
                if (actor.creatorStance === 'rebellious') {
                    rel.trust = 8;
                    rel.tension = 88;
                    rel.status = 'hostile';
                }
                else if (actor.creatorStance === 'reverent') {
                    rel.trust = 78;
                    rel.tension = 12;
                }
            }
        }
        if (actor.disposition === 'sovereign' && actor.foundedFactionId && actor.creatorStance === 'rebellious' && playerFactionId && roll > 0.77) {
            const own = orth.orthodoxies[actor.foundedFactionId];
            const player = orth.orthodoxies[playerFactionId];
            if (own && player && player.territoryIds.length > 0 && !Object.values(orth.wars).some(w => w.active && [w.attackerFactionId, w.defenderFactionId].includes(own.factionId) && [w.attackerFactionId, w.defenderFactionId].includes(player.factionId))) {
                try {
                    const war = declareOrthodoxyWar(orth, own.factionId, player.factionId, player.territoryIds[0], targetWorldYear);
                    actor.deeds.push('Tuyên chiến với chính Đạo Thống của Sáng Thế Chủ.');
                    events.push({ type: 'war', significance: 150, actorId: actor.id, factionIds: [own.factionId, player.factionId], warId: war.id, locationId: war.contestedLocationId, message: `${actor.name} từng sinh trong thế giới của ngươi nay tự xưng một Đạo, công khai tuyên chiến Đạo Thống của chính Sáng Thế Chủ.` });
                }
                catch { }
            }
        }
        if (actor.disposition === 'rival' && !actor.foundedFactionId && actor.power >= 78 && roll > 0.7) {
            const target = strongestTarget(orth, '');
            if (target)
                actor.creatorRelation = clamp100(actor.creatorRelation - 2);
        }
    }
    state.simulatedUntilWorldYear = targetWorldYear;
    return events;
}
export function befriendOuterAscendant(state, actorId) {
    const actor = state.actors[actorId];
    if (!actor || actor.status !== 'active')
        throw new Error(`Không tìm thấy Siêu Thoát giả: ${actorId}`);
    actor.creatorRelation = clamp100(actor.creatorRelation + (actor.creatorStance === 'rebellious' ? 6 : actor.creatorStance === 'reverent' ? 18 : 12));
    if (actor.creatorRelation >= 70 && actor.disposition === 'rival')
        actor.disposition = 'wanderer';
    actor.deeds.push('Sáng Thế Chủ chủ động gặp lại và thừa nhận con đường độc lập của người này.');
    return actor;
}
export function alignOuterAscendant(state, orth, actorId, playerFactionId) {
    const actor = state.actors[actorId];
    const home = orth.orthodoxies[playerFactionId];
    if (!actor || actor.status !== 'active')
        throw new Error(`Không tìm thấy Siêu Thoát giả: ${actorId}`);
    if (!home)
        throw new Error('Cần có Đạo Thống của chính mình trước khi mời Siêu Thoát giả tương trợ.');
    if (actor.foundedFactionId)
        throw new Error(`${actor.name} đã tự lập Đạo Thống; chỉ có thể ngoại giao với thế lực của họ.`);
    if (actor.disposition === 'ally' && actor.alignedFactionId === playerFactionId)
        return actor;
    if (actor.alignedFactionId && actor.alignedFactionId !== playerFactionId)
        throw new Error(`${actor.name} đã đứng cùng một Đạo Thống khác.`);
    if (actor.creatorRelation < 55)
        throw new Error(`${actor.name} chưa đủ tín nhiệm để cùng Đạo Thống của ngươi.`);
    actor.disposition = 'ally';
    actor.alignedFactionId = playerFactionId;
    home.militaryPower += actor.power * 0.45;
    home.doctrineAuthority = clamp100(home.doctrineAuthority + actor.insight * 0.03);
    actor.deeds.push('Gia nhập hàng ngũ khách khanh của Đạo Thống Sáng Thế Chủ.');
    return actor;
}
//# sourceMappingURL=ascendant.js.map