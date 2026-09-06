export const majorTalentDefinitions = {
    'major.alchemy_sage': { id: 'major.alchemy_sage', name: 'Đan Đạo Chân Nhân', description: 'Một đời chuyên tâm Đan Đạo, đổi breadth lấy độ ổn định phẩm chất.', requirements: [{ id: 'profession.alchemy', rank: 4 }], effect: 'Hiệu quả node Luyện Đan ×1.5 và +4 quality score khi luyện đan.' },
    'major.myriad_law': { id: 'major.myriad_law', name: 'Vạn Pháp Đạo Thai', description: 'Ưu tiên học và nội hóa Công Pháp hơn các đường tăng trưởng khác.', requirements: [{ id: 'technique.insight', rank: 4 }, { id: 'technique.passive', rank: 2 }], effect: 'Hiệu quả Ngộ Pháp/Chân Ý ×1.35.' },
    'major.war_immortal': { id: 'major.war_immortal', name: 'Chiến Tiên', description: 'Đem ký ức giao chiến tiền kiếp làm bản năng của đời mới.', requirements: [{ id: 'combat.active_skill', rank: 4 }, { id: 'combat.flow', rank: 2 }], effect: 'Hiệu quả Bách Chiến/Chiến Trận Trực Giác ×1.35.' },
    'major.treasure_lord': { id: 'major.treasure_lord', name: 'Vạn Bảo Chi Chủ', description: 'Dành trọng tâm đời này cho Pháp Bảo, Bảo Khí và Bảo Vận.', requirements: [{ id: 'artifact.attunement', rank: 4 }], effect: 'Bonus Bảo Khí/hiệu lực Pháp Kỹ từ Thiên Phú Pháp Bảo ×1.5.' },
    'major.idle_cloud': { id: 'major.idle_cloud', name: 'Nhàn Vân Dã Hạc', description: 'Tối ưu tiến trình nhàn rỗi, phân thân và thu thập thay vì ép combat trực diện.', requirements: [{ id: 'automation.cycle', rank: 4 }, { id: 'dungeon.expedition', rank: 2 }], effect: 'Bonus offline +50%; hiệu suất worker/Phân Thân thêm 10% và thu thập thêm 5%.' },
};
const rankCosts = [1, 2, 3, 4, 5];
export const reincarnationTalentDefinitions = {
    'birth.resonance': {
        id: 'birth.resonance', name: 'Thiên Tuyển Cộng Hưởng', domain: 'fate', maxRank: 15, requiredSeal: 0,
        description: 'Khi một trong sáu căn nguyên bẩm sinh tự nhiên đạt Cực hoặc Phá/Cấm Kỵ, mở chuỗi cộng hưởng đồng cấp. Mỗi lần thành công mới được thử thuộc tính tiếp theo; thất bại dừng chuỗi.',
        rankCosts: Array.from({ length: 15 }, () => 1), effectPerRank: '+5% xác suất cho mỗi bước Chuỗi Cộng Hưởng Cực/Phá, tối đa 75%.',
    },
    'cultivation.cycle': {
        id: 'cultivation.cycle', name: 'Bế Quan Túc Mệnh', domain: 'cultivation', maxRank: 5, requiredSeal: 0,
        description: 'Kinh nghiệm nhiều đời giúp tận dụng thời gian Bế Quan hiệu quả hơn.',
        rankCosts, effectPerRank: '+3% Tu Vi nhận từ Bế Quan mỗi bậc.',
    },
    'cultivation.stability': {
        id: 'cultivation.stability', name: 'Tĩnh Tức Tự Tri', domain: 'cultivation', maxRank: 5, requiredSeal: 1, prerequisite: { id: 'cultivation.cycle', rank: 2 },
        description: 'Bản năng điều tức nhiều đời giúp cơ thể phục hồi Thương Thế nhanh hơn.',
        rankCosts, effectPerRank: '+8% tốc độ hồi Thương Thế tự nhiên mỗi bậc.',
    },
    'technique.insight': {
        id: 'technique.insight', name: 'Ngộ Pháp Thiên Thành', domain: 'technique', maxRank: 5, requiredSeal: 0,
        description: 'Kinh nghiệm qua nhiều đời khiến việc hiểu và thuần thục Công Pháp nhanh hơn.',
        rankCosts, effectPerRank: '+7% tốc độ tăng mastery Công Pháp mỗi bậc.',
    },
    'technique.passive': {
        id: 'technique.passive', name: 'Chân Ý Nội Tàng', domain: 'technique', maxRank: 5, requiredSeal: 1,
        prerequisite: { id: 'technique.insight', rank: 2 },
        description: 'Không chỉ thuộc chiêu thức; ngươi khai thác sâu hơn phần hiệu quả bị động được viết trong Công Pháp.',
        rankCosts, effectPerRank: '+4% phần hiệu quả bị động của Công Pháp mỗi bậc.',
    },
    'combat.active_skill': {
        id: 'combat.active_skill', name: 'Bách Chiến Linh Giác', domain: 'combat', maxRank: 5, requiredSeal: 0,
        description: 'Mỗi kỹ năng chủ động mang thêm kinh nghiệm thực chiến tích lũy từ tiền kiếp.',
        rankCosts, effectPerRank: 'ActiveHit gây thêm đòn phụ nhỏ bằng 1.2% hệ số công kích mỗi bậc.',
    },
    'combat.flow': {
        id: 'combat.flow', name: 'Chiến Trận Trực Giác', domain: 'combat', maxRank: 5, requiredSeal: 1,
        prerequisite: { id: 'combat.active_skill', rank: 2 },
        description: 'Đọc nhịp giao chiến nhanh hơn, giúp loadout phát huy đúng rotation thay vì chỉ tăng sát thương thô.',
        rankCosts, effectPerRank: '+1.2% Action Speed mỗi bậc.',
    },
    'profession.alchemy': {
        id: 'profession.alchemy', name: 'Đan Tâm Bất Diệt', domain: 'alchemy', maxRank: 5, requiredSeal: 0,
        description: 'Kinh nghiệm hỏa hậu và dược tính không biến mất hoàn toàn qua Luân Hồi.',
        rankCosts, effectPerRank: '+1.5% xác suất thành công, +2 điểm quality, +5% mastery gain Luyện Đan mỗi bậc.',
    },
    'profession.forging': {
        id: 'profession.forging', name: 'Khí Cảm Tiền Kiếp', domain: 'forging', maxRank: 5, requiredSeal: 0,
        description: 'Cảm giác vật liệu và nhịp rèn được khắc vào bản năng.',
        rankCosts, effectPerRank: '+1.5% xác suất thành công, +2 điểm quality, +5% mastery gain Luyện Khí mỗi bậc.',
    },
    'profession.talisman': {
        id: 'profession.talisman', name: 'Nhất Niệm Thành Văn', domain: 'talisman', maxRank: 5, requiredSeal: 0,
        description: 'Phù văn và trận lý quen thuộc hơn qua mỗi đời, giảm sai lệch khi luyện chế.',
        rankCosts, effectPerRank: '+1.5% xác suất thành công, +2 điểm quality, +5% mastery gain Phù/Trận mỗi bậc.',
    },
    'gather.herbalism': {
        id: 'gather.herbalism', name: 'Linh Thực · Dược Viên', domain: 'gathering', maxRank: 5, requiredSeal: 0,
        description: 'Nhận biết linh thực, dược thảo và hạt giống tốt hơn. Hiện áp dụng cho thu thập dược liệu; về sau cùng hook dùng cho trồng dược.',
        rankCosts, effectPerRank: '+8% sản lượng dược thảo/linh thực khi Thu Thập mỗi bậc.',
    },
    'gather.instinct': {
        id: 'gather.instinct', name: 'Tầm Linh Bản Năng', domain: 'gathering', maxRank: 5, requiredSeal: 1,
        prerequisite: { id: 'gather.herbalism', rank: 1 },
        description: 'Bản năng tìm tài nguyên hiếm mở rộng từ dược liệu sang mọi loại tài nguyên tự nhiên.',
        rankCosts, effectPerRank: '+4% sản lượng mọi tài nguyên Thu Thập mỗi bậc.',
    },
    'artifact.attunement': {
        id: 'artifact.attunement', name: 'Vạn Bảo Đồng Cảm', domain: 'artifact', maxRank: 5, requiredSeal: 1,
        description: 'Kinh nghiệm điều khiển Pháp Bảo qua nhiều đời giúp luân chuyển Bảo Khí nhanh hơn.',
        rankCosts, effectPerRank: '+4% Bảo Khí nhận từ hành động mỗi bậc.',
    },
    'artifact.spirit': {
        id: 'artifact.spirit', name: 'Bảo Vận Tương Sinh', domain: 'artifact', maxRank: 5, requiredSeal: 2,
        prerequisite: { id: 'artifact.attunement', rank: 2 },
        description: 'Bảo vận tiền kiếp cộng hưởng với Pháp Kỹ đang trang bị; chỉ nuôi hệ Pháp Bảo, không bơm stat nhân vật.',
        rankCosts, effectPerRank: '+3% hiệu lực Pháp Kỹ mỗi bậc.',
    },
    'dungeon.expedition': {
        id: 'dungeon.expedition', name: 'Tầm Cơ Định Lộ', domain: 'dungeon', maxRank: 5, requiredSeal: 1,
        description: 'Ký ức đường đi và nhịp khai thác giúp Phân Thân/phụ trợ vận hành phó bản hiệu quả hơn.',
        rankCosts, effectPerRank: '+4% hiệu suất worker phó bản song song mỗi bậc.',
    },
    'dungeon.phase_insight': {
        id: 'dungeon.phase_insight', name: 'Tàn Cục Ngộ Chiến', domain: 'dungeon', maxRank: 5, requiredSeal: 2,
        prerequisite: { id: 'dungeon.expedition', rank: 2 },
        description: 'Mỗi lần thật sự ép boss lộ phase, ngươi rút ra thêm kinh nghiệm Công Pháp từ biến hóa của trận chiến.',
        rankCosts, effectPerRank: 'Mỗi phase boss đã kích hoạt cho thêm 0.04 năm quy đổi mastery Công Pháp mỗi bậc.',
    },
    'clone.parallel': {
        id: 'clone.parallel', name: 'Nhất Tâm Đa Dụng', domain: 'clone', maxRank: 5, requiredSeal: 2, prerequisite: { id: 'dungeon.expedition', rank: 2 },
        description: 'Ký ức phân niệm giúp Phân Thân giữ hiệu suất khi làm việc độc lập lâu ngày.',
        rankCosts, effectPerRank: '+3% hiệu suất worker Phân Thân/phó bản song song mỗi bậc.',
    },
    'dao.contemplation': {
        id: 'dao.contemplation', name: 'Vạn Kiếp Đạo Tâm', domain: 'dao', maxRank: 5, requiredSeal: 2,
        prerequisite: { id: 'technique.insight', rank: 2 },
        description: 'Kinh nghiệm chứng ngộ không mang nguyên Đạo Ý sang đời mới, nhưng giúp ngươi nhận ra cộng hưởng và sai lầm cũ nhanh hơn khi chủ động Ngộ Đạo.',
        rankCosts, effectPerRank: '+5% cảm ngộ nhận được từ hành động Ngộ Đạo mỗi bậc.',
    },
    'social.karma_sense': {
        id: 'social.karma_sense', name: 'Nhân Quả Tri Vi', domain: 'social', maxRank: 5, requiredSeal: 1,
        description: 'Trực giác nhân quả giúp ngươi đọc thiện ý, kính ý và chiều sâu duyên phận tốt hơn trong những tương tác NPC tích cực.',
        rankCosts, effectPerRank: '+4% Trust/Respect/KarmaDepth dương từ tương tác NPC mỗi bậc; không giảm Grudge hay xóa nợ.',
    },
    'automation.cycle': {
        id: 'automation.cycle', name: 'Tự Vận Chu Thiên', domain: 'automation', maxRank: 5, requiredSeal: 1,
        description: 'Mở rộng thời lượng offline được xử lý mà không làm lệch clock 100 năm/ngày.',
        rankCosts, effectPerRank: '+4 giờ cap offline mỗi bậc; Nhàn Vân Dã Hạc cộng thêm +4 giờ, tổng cap tối đa 48 giờ.',
    },
};
export function createReincarnationTalentState() {
    return { pointsAvailable: 0, lifetimePointsEarned: 0, lifetimePointsSpent: 0, ranks: {}, activeMajorIds: [], pendingMajorIds: [] };
}
export function talentPointsFromLife(cpEarned, effectiveLife = true) {
    if (!effectiveLife)
        return 0;
    const cp = Math.max(0, Number(cpEarned) || 0);
    if (cp <= 0)
        return 0;
    // CP still determines the reward, but square-root scaling prevents late-game CP inflation
    // from turning the permanent tree into an automatic max-out after one exceptional life.
    return Math.max(1, Math.floor(Math.sqrt(cp) * 0.82));
}
export function cloneReincarnationTalentState(state, legacyArchives = []) {
    if (!state) {
        const retroactive = legacyArchives.reduce((sum, archive) => {
            // Saves from before Luân Hồi XP may not carry `reincarnationLegacy`. Reuse the
            // same meaningful-life thresholds instead of treating every old archive as effective.
            const effective = archive.reincarnationLegacy?.effective ?? ((archive.totalScore ?? 0) >= 120 || (archive.maxRealmOrder ?? 0) >= 3 || (archive.mingJiGain ?? 0) >= 1);
            return sum + talentPointsFromLife(archive.cpEarned, effective);
        }, 0);
        return { pointsAvailable: retroactive, lifetimePointsEarned: retroactive, lifetimePointsSpent: 0, ranks: {}, activeMajorIds: [], pendingMajorIds: [] };
    }
    const ranks = {};
    for (const definition of Object.values(reincarnationTalentDefinitions)) {
        const raw = Number(state.ranks?.[definition.id] ?? 0) || 0;
        if (raw > 0)
            ranks[definition.id] = Math.min(definition.maxRank, Math.max(0, Math.floor(raw)));
    }
    const earned = Math.max(0, Math.floor(Number(state.lifetimePointsEarned ?? 0) || 0));
    const spent = Math.max(0, Math.floor(Number(state.lifetimePointsSpent ?? 0) || 0));
    const available = Math.max(0, Math.floor(Number(state.pointsAvailable ?? Math.max(0, earned - spent)) || 0));
    const validMajors = (ids) => [...new Set((ids ?? []).filter(id => Boolean(majorTalentDefinitions[id])))];
    return { pointsAvailable: available, lifetimePointsEarned: Math.max(earned, available + spent), lifetimePointsSpent: spent, ranks, activeMajorIds: validMajors(state.activeMajorIds), pendingMajorIds: validMajors(state.pendingMajorIds) };
}
export function grantReincarnationTalentPoints(state, amount) {
    const gain = Math.max(0, Math.floor(Number(amount) || 0));
    if (gain <= 0)
        return 0;
    state.pointsAvailable += gain;
    state.lifetimePointsEarned += gain;
    return gain;
}
export function talentRank(state, id) {
    const definition = reincarnationTalentDefinitions[id];
    return Math.min(definition.maxRank, Math.max(0, Math.floor(Number(state?.ranks?.[id] ?? 0) || 0)));
}
export function nextTalentRankCost(state, id) {
    const definition = reincarnationTalentDefinitions[id];
    const rank = talentRank(state, id);
    return rank >= definition.maxRank ? undefined : definition.rankCosts[rank] ?? definition.rankCosts.at(-1) ?? 1;
}
export function spendReincarnationTalentPoints(state, sealLevel, id, requestedRanks = 1) {
    const definition = reincarnationTalentDefinitions[id];
    if (!definition)
        throw new Error(`Unknown reincarnation talent: ${id}`);
    if (sealLevel < definition.requiredSeal)
        throw new Error(`${definition.name} yêu cầu Luân Hồi Ấn ${definition.requiredSeal}.`);
    if (definition.prerequisite) {
        const have = talentRank(state, definition.prerequisite.id);
        if (have < definition.prerequisite.rank) {
            const prerequisite = reincarnationTalentDefinitions[definition.prerequisite.id];
            throw new Error(`${definition.name} yêu cầu ${prerequisite.name} bậc ${definition.prerequisite.rank}.`);
        }
    }
    const rankBefore = talentRank(state, id);
    if (rankBefore >= definition.maxRank)
        throw new Error(`${definition.name} đã đạt bậc tối đa ${definition.maxRank}.`);
    const buy = Math.min(definition.maxRank - rankBefore, Math.max(1, Math.floor(requestedRanks)));
    let cost = 0;
    let bought = 0;
    for (let offset = 0; offset < buy; offset++) {
        const rankIndex = rankBefore + offset;
        const nextCost = definition.rankCosts[rankIndex] ?? definition.rankCosts.at(-1) ?? 1;
        if (cost + nextCost > state.pointsAvailable)
            break;
        cost += nextCost;
        bought += 1;
    }
    if (bought <= 0) {
        const next = definition.rankCosts[rankBefore] ?? 1;
        throw new Error(`Thiếu Điểm Thiên Phú: có ${state.pointsAvailable}, cần ${next} cho bậc kế.`);
    }
    const rankAfter = rankBefore + bought;
    state.pointsAvailable -= cost;
    state.lifetimePointsSpent += cost;
    state.ranks[id] = rankAfter;
    return { id, name: definition.name, ranksBought: bought, rankBefore, rankAfter, cost, pointsRemaining: state.pointsAvailable };
}
const ORIGIN_PREFIX = 'talent.';
export function syncReincarnationTalentsToOrigins(origins, state) {
    for (const key of Object.keys(origins))
        if (key.startsWith(ORIGIN_PREFIX))
            delete origins[key];
    if (!state)
        return;
    for (const definition of Object.values(reincarnationTalentDefinitions)) {
        const rank = talentRank(state, definition.id);
        if (rank > 0)
            origins[`${ORIGIN_PREFIX}${definition.id}`] = rank;
    }
    for (const key of Object.keys(origins))
        if (key.startsWith('major.'))
            delete origins[key];
    for (const id of state.activeMajorIds ?? [])
        origins[id] = 1;
}
export function majorTalentSlots(sealLevel) { return sealLevel >= 7 ? 3 : sealLevel >= 4 ? 2 : sealLevel >= 1 ? 1 : 0; }
export function majorTalentActive(origins, id) { return (origins?.[id] ?? 0) > 0; }
export function queueMajorTalents(state, sealLevel, ids) {
    const unique = [...new Set(ids)];
    const slots = majorTalentSlots(sealLevel);
    if (unique.length > slots)
        throw new Error(`Luân Hồi Ấn hiện chỉ cho ${slots} Major Talent mỗi đời.`);
    for (const id of unique) {
        const def = majorTalentDefinitions[id];
        if (!def)
            throw new Error(`Unknown Major Talent: ${id}`);
        for (const req of def.requirements) {
            if (talentRank(state, req.id) < req.rank)
                throw new Error(`${def.name} yêu cầu ${reincarnationTalentDefinitions[req.id].name} bậc ${req.rank}.`);
        }
    }
    state.pendingMajorIds = unique;
    return [...unique];
}
export function commitPendingMajorTalents(state) { if (!state)
    return; state.activeMajorIds = [...(state.pendingMajorIds ?? state.activeMajorIds ?? [])]; }
export function talentRankFromOrigins(origins, id) {
    return Math.max(0, Math.min(reincarnationTalentDefinitions[id].maxRank, Math.floor(Number(origins?.[`${ORIGIN_PREFIX}${id}`] ?? 0) || 0)));
}
export function techniqueMasteryGainMultiplier(origins) {
    const scale = majorTalentActive(origins, 'major.myriad_law') ? 1.35 : 1;
    return 1 + talentRankFromOrigins(origins, 'technique.insight') * 0.07 * scale;
}
export function techniquePassiveStrengthMultiplier(origins) {
    const scale = majorTalentActive(origins, 'major.myriad_law') ? 1.35 : 1;
    return 1 + talentRankFromOrigins(origins, 'technique.passive') * 0.04 * scale;
}
export function cultivationTalentBonuses(origins) {
    const cycle = talentRankFromOrigins(origins, 'cultivation.cycle'), stable = talentRankFromOrigins(origins, 'cultivation.stability');
    return { retreatGainPct: cycle * 3, injuryRecoveryPct: stable * 8 };
}
export function professionTalentModifiers(origins, professionId) {
    const id = professionId === 'alchemy' ? 'profession.alchemy' : professionId === 'forging' ? 'profession.forging' : 'profession.talisman';
    const rank = talentRankFromOrigins(origins, id);
    const major = professionId === 'alchemy' && majorTalentActive(origins, 'major.alchemy_sage');
    const scale = major ? 1.5 : 1;
    return { successChanceFlat: rank * 0.015 * scale, qualityScoreBonus: rank * 2 * scale + (major ? 4 : 0), masteryGainMultiplier: 1 + rank * 0.05 * scale };
}
function herbalResource(resourceId) {
    const id = resourceId.toLowerCase();
    return ['herb', 'grass', 'plant', 'flower', 'root', 'fruit', 'seed', 'qingling', 'medicine'].some(token => id.includes(token));
}
export function gatheringYieldMultiplier(origins, resourceId) {
    const general = talentRankFromOrigins(origins, 'gather.instinct') * 0.04;
    const herb = herbalResource(resourceId) ? talentRankFromOrigins(origins, 'gather.herbalism') * 0.08 : 0;
    const major = majorTalentActive(origins, 'major.idle_cloud') ? 0.05 : 0;
    return 1 + general + herb + major;
}
export function offlineCapRealHours(origins) {
    const rank = talentRankFromOrigins(origins, 'automation.cycle');
    const majorBonus = majorTalentActive(origins, 'major.idle_cloud') ? 4 : 0;
    return Math.min(48, 24 + rank * 4 + majorBonus);
}
export function applyReincarnationCombatTalents(entity, origins) {
    const activeRank = talentRankFromOrigins(origins, 'combat.active_skill');
    const flowRank = talentRankFromOrigins(origins, 'combat.flow');
    const majorScale = majorTalentActive(origins, 'major.war_immortal') ? 1.35 : 1;
    if (activeRank <= 0 && flowRank <= 0)
        return entity;
    const triggers = [...(entity.triggers ?? [])];
    if (activeRank > 0) {
        triggers.push({
            id: `talent.combat.active_skill.r${activeRank}`,
            event: 'OnHit',
            chancePct: 100,
            sourceTags: ['ActiveHit'],
            effects: [{ type: 'damage', coefficient: activeRank * 0.012 * majorScale, sourceTag: 'ProcHit', canCrit: false, canDodge: false, procCoefficient: 0 }],
        });
    }
    return {
        ...entity,
        stats: flowRank > 0 ? { ...entity.stats, actionSpeed: entity.stats.actionSpeed * (1 + flowRank * 0.012 * majorScale) } : entity.stats,
        triggers,
        tags: [...new Set([...entity.tags, ...(activeRank > 0 || flowRank > 0 ? ['ReincarnationTalent'] : [])])],
    };
}
function artifactAuthoredTrigger(trigger) {
    return trigger.id.includes('[artifact.') || trigger.id.includes('[Khí Linh:') || trigger.id.includes('[Cộng Hưởng:');
}
function improveTrigger(trigger, chancePoints, cooldownReduction) {
    const chancePct = trigger.chancePct >= 100 ? trigger.chancePct : Math.min(100, trigger.chancePct + chancePoints);
    const cooldown = trigger.cooldown === undefined ? undefined : Math.max(0, trigger.cooldown * Math.max(0.25, 1 - cooldownReduction));
    return { ...trigger, chancePct, cooldown, effects: trigger.effects.map(effect => ({ ...effect })) };
}
function scaleArtifactV88TalentEffect(effect, multiplier) {
    const out = { ...effect };
    if (out.type === 'damage') {
        out.coefficient *= multiplier;
        if (out.attackCoefficient !== undefined)
            out.attackCoefficient *= multiplier;
    }
    else if (out.type === 'damageOverTime')
        out.coefficientPerTick *= multiplier;
    else if (out.type === 'heal') {
        if (out.flat !== undefined)
            out.flat *= multiplier;
        if (out.maxHpPct !== undefined)
            out.maxHpPct *= multiplier;
        if (out.attackCoefficient !== undefined)
            out.attackCoefficient *= multiplier;
    }
    else if (out.type === 'shield') {
        if (out.capacity !== undefined)
            out.capacity *= multiplier;
        if (out.maxHpPct !== undefined)
            out.maxHpPct *= multiplier;
        if (out.attackCoefficient !== undefined)
            out.attackCoefficient *= multiplier;
    }
    else if (out.type === 'restoreSpirit')
        out.flat *= multiplier;
    else if (out.type === 'consumeMarkDamage') {
        out.baseCoefficient *= multiplier;
        out.coefficientPerStack *= multiplier;
    }
    return out;
}
export function applyReincarnationArtifactTalents(entity, origins) {
    const attunement = talentRankFromOrigins(origins, 'artifact.attunement');
    const spirit = talentRankFromOrigins(origins, 'artifact.spirit');
    const majorScale = majorTalentActive(origins, 'major.treasure_lord') ? 1.5 : 1;
    if (attunement <= 0 && spirit <= 0)
        return entity;
    // V88 production bridge. IDs remain stable for old saves, but power now belongs to Bảo Khí + Pháp Kỹ.
    const artifactV88 = entity.combatBuildV117?.artifactV88;
    if (artifactV88) {
        const baoQiBonus = attunement * 4 * majorScale;
        const skillPowerBonus = spirit * 3 * majorScale;
        const skillMultiplier = 1 + skillPowerBonus / 100;
        const triggers = (entity.triggers ?? []).map(trigger => {
            if (trigger.runtimeV88?.kind !== 'artifactSkill' || spirit <= 0)
                return trigger;
            return { ...trigger, effects: trigger.effects.map(effect => scaleArtifactV88TalentEffect(effect, skillMultiplier)) };
        });
        return {
            ...entity,
            triggers,
            combatBuildV117: { ...entity.combatBuildV117, artifactV88: { ...artifactV88, baoQiGainPct: Number((artifactV88.baoQiGainPct + baoQiBonus).toFixed(2)), artifactPowerPct: Number((artifactV88.artifactPowerPct + skillPowerBonus).toFixed(2)) } },
            tags: [...new Set([...entity.tags, 'ReincarnationArtifactTalent'])],
        };
    }
    // Compatibility only: historical pre-V88 saves may still materialize legacy authored triggers.
    if (!entity.triggers?.some(artifactAuthoredTrigger))
        return entity;
    const triggers = entity.triggers.map(trigger => {
        if (!artifactAuthoredTrigger(trigger))
            return trigger;
        let improved = improveTrigger(trigger, attunement * 2 * majorScale, attunement * 0.02 * majorScale);
        if (trigger.id.includes('[Khí Linh:') && spirit > 0)
            improved = improveTrigger(improved, spirit * 3 * majorScale, spirit * 0.03 * majorScale);
        return improved;
    });
    return { ...entity, triggers, tags: [...new Set([...entity.tags, 'ReincarnationArtifactTalent'])] };
}
export function daoContemplationInsightMultiplier(origins) {
    return 1 + talentRankFromOrigins(origins, 'dao.contemplation') * 0.05;
}
export function socialPositiveRelationshipMultiplier(origins) {
    return 1 + talentRankFromOrigins(origins, 'social.karma_sense') * 0.04;
}
export function parallelDungeonEfficiencyMultiplier(origins) {
    const dungeon = talentRankFromOrigins(origins, 'dungeon.expedition') * 0.04;
    const clone = talentRankFromOrigins(origins, 'clone.parallel') * 0.03;
    const major = majorTalentActive(origins, 'major.idle_cloud') ? 0.10 : 0;
    return 1 + dungeon + clone + major;
}
export function dungeonPhaseInsightStudyYears(origins, phaseCount) {
    const rank = talentRankFromOrigins(origins, 'dungeon.phase_insight');
    return Math.max(0, Math.floor(phaseCount)) * rank * 0.04;
}
/** Bounded multiplier used by authored event rewards so permanent talents affect the same domain everywhere. */
export function contentEventDomainMultiplier(origins, domain) {
    switch (domain) {
        case 'cultivation': {
            const c = cultivationTalentBonuses(origins);
            return 1 + (c.retreatGainPct + c.injuryRecoveryPct * 0.25) / 100;
        }
        case 'technique': return techniqueMasteryGainMultiplier(origins);
        case 'combat': {
            const active = talentRankFromOrigins(origins, 'combat.active_skill') * 0.025;
            const flow = talentRankFromOrigins(origins, 'combat.flow') * 0.018;
            return 1 + (active + flow) * (majorTalentActive(origins, 'major.war_immortal') ? 1.35 : 1);
        }
        case 'artifact': {
            const r = talentRankFromOrigins(origins, 'artifact.attunement') * 0.035 + talentRankFromOrigins(origins, 'artifact.spirit') * 0.02;
            return 1 + r * (majorTalentActive(origins, 'major.treasure_lord') ? 1.5 : 1);
        }
        case 'dungeon': return 1 + talentRankFromOrigins(origins, 'dungeon.expedition') * 0.04;
        case 'dao': return daoContemplationInsightMultiplier(origins);
        case 'social': return socialPositiveRelationshipMultiplier(origins);
    }
}
//# sourceMappingURL=reincarnation-talents.js.map