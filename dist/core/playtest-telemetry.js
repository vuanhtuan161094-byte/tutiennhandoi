import { FIRST_LIFE_START_AGE_V84, milestoneAgeBandV84 } from './progression-pacing-v84.js';
const LOOP_IDS = ['retreat', 'ascend', 'event', 'dungeon', 'boss', 'hunt', 'gather', 'explore', 'craft', 'travel', 'social', 'other'];
function loopOf(event) {
    const tags = new Set(event.tags.map(tag => tag.toLowerCase()));
    if (tags.has('retreat'))
        return 'retreat';
    if (tags.has('realmadvance'))
        return 'ascend';
    if (tags.has('contentevent'))
        return 'event';
    if (tags.has('firstclear') || tags.has('firstclearlike') || tags.has('guardian') || tags.has('bossmilestone'))
        return 'boss';
    if (tags.has('dungeon') || event.type === 'dungeon')
        return 'dungeon';
    if (tags.has('hunt'))
        return 'hunt';
    if (tags.has('gather'))
        return 'gather';
    if (tags.has('explore') || event.type === 'exploration')
        return 'explore';
    if (tags.has('craft') || tags.has('crafting') || event.type === 'crafting')
        return 'craft';
    if (tags.has('travel') || event.type === 'travel')
        return 'travel';
    if (tags.has('relationship') || tags.has('social') || tags.has('karma'))
        return 'social';
    return 'other';
}
function milestoneAge(history, realmOrderMin) {
    const realmPrefix = realmOrderMin === 1 ? 'realm.qi.1' : realmOrderMin === 10 ? 'realm.foundation.early' : realmOrderMin === 14 ? 'realm.purple_palace.early' : 'realm.golden_core.early';
    const event = history.find(entry => entry.tags.includes('RealmAdvance') && entry.data?.toRealmId === realmPrefix);
    return event?.ageYears;
}
export function analyzePlaytestTelemetry(state, life, history, projected) {
    // History persists across reincarnations; telemetry is intentionally scoped to the current incarnation.
    const lastLifeStart = [...history].map((event, index) => ({ event, index })).reverse().find(entry => entry.event.tags.includes('LifeStart'));
    const lifeHistory = lastLifeStart ? history.slice(lastLifeStart.index) : history;
    const byLoop = Object.fromEntries(LOOP_IDS.map(id => [id, 0]));
    const signature = new Map();
    let wins = 0, losses = 0, firstClears = 0, bossAttempts = 0, resourceGainEvents = 0, craftEvents = 0;
    const uniqueEventIds = new Set();
    const uniqueChoices = new Set();
    for (const event of lifeHistory) {
        const loop = loopOf(event);
        byLoop[loop] += 1;
        if (event.tags.includes('Victory'))
            wins += 1;
        if (event.tags.includes('Defeat'))
            losses += 1;
        if (event.tags.includes('FirstClear') || event.tags.includes('FirstClearLike'))
            firstClears += 1;
        if (loop === 'boss')
            bossAttempts += 1;
        if (event.type === 'resource' || Object.keys(event.data ?? {}).some(key => key.toLowerCase().includes('reward') || key.toLowerCase().includes('amount')))
            resourceGainEvents += 1;
        if (loop === 'craft')
            craftEvents += 1;
        const skill = typeof event.data?.signatureSkillId === 'string' ? event.data.signatureSkillId : '';
        if (skill)
            signature.set(skill, (signature.get(skill) ?? 0) + 1);
        if (event.tags.includes('ContentEvent')) {
            const id = String(event.data?.eventId ?? event.id);
            const choice = String(event.data?.choiceId ?? '');
            uniqueEventIds.add(id);
            if (choice)
                uniqueChoices.add(`${id}|${choice}`);
        }
    }
    const total = Object.values(byLoop).reduce((a, b) => a + b, 0);
    const decisionActions = byLoop.event + byLoop.boss + byLoop.dungeon + byLoop.craft + byLoop.social + byLoop.explore;
    const meaningful = lifeHistory.filter(event => event.significance >= 10).length;
    const retreatSharePct = total ? byLoop.retreat / total * 100 : 0;
    const decisionDensityPer10Actions = total ? decisionActions / total * 10 : 0;
    const lifeStartAge = lastLifeStart?.event.ageYears ?? FIRST_LIFE_START_AGE_V84;
    const milestoneSpec = [
        { id: 'qi', label: 'Luyện Khí', realmOrder: 1 },
        { id: 'foundation', label: 'Trúc Cơ', realmOrder: 10 },
        { id: 'purplePalace', label: 'Tử Phủ', realmOrder: 14 },
        { id: 'goldenCore', label: 'Kim Đan', realmOrder: 18 },
    ];
    const milestones = milestoneSpec.map(spec => {
        const band = milestoneAgeBandV84(spec.realmOrder, lifeStartAge);
        const ageYears = milestoneAge(lifeHistory, spec.realmOrder);
        return {
            id: spec.id, label: spec.label, reached: state.realm.maxRealmOrder >= spec.realmOrder, ageYears,
            targetAge: band.targetAge, targetAgeMin: band.toleranceMinAge, targetAgeMax: band.toleranceMaxAge,
            deltaYears: ageYears === undefined ? undefined : ageYears - band.targetAge,
        };
    });
    const warnings = [];
    const recommendations = [];
    if (total >= 8 && retreatSharePct > 55) {
        warnings.push(`Bế quan chiếm ${retreatSharePct.toFixed(0)}% log hành động.`);
        recommendations.push('Tăng mật độ event/boss/nghề trước khi giảm thêm requirement cảnh giới.');
    }
    if (total >= 8 && decisionDensityPer10Actions < 2.5) {
        warnings.push(`Chỉ ${decisionDensityPer10Actions.toFixed(1)} quyết định có trade-off trên mỗi 10 hành động.`);
        recommendations.push('Ưu tiên content có lựa chọn và công phá Boss/tầng mới thay vì thêm reward thụ động.');
    }
    if (state.realm.maxRealmOrder >= 10 && firstClears === 0) {
        warnings.push('Đã Trúc Cơ nhưng chưa có lần công phá Boss/tầng mới trong telemetry đời này.');
        recommendations.push('Đảm bảo boss đầu xuất hiện trước khi người chơi có thể grind xuyên vertical slice.');
    }
    const outOfBand = life.lifeNumber === 1 ? milestones.filter(m => m.reached && m.ageYears !== undefined && (m.ageYears < m.targetAgeMin || m.ageYears > m.targetAgeMax)) : [];
    if (outOfBand.length) {
        warnings.push(`Có ${outOfBand.length} mốc đời đầu nằm ngoài dải pacing V84.`);
        recommendations.push('Kiểm tra tốc độ Tu Luyện/Bế Quan hoặc nhịp Thăng Cảnh trước khi đổi requirement cảnh giới.');
    }
    if (uniqueEventIds.size < 3 && state.realm.maxRealmOrder >= 10) {
        warnings.push('Event variety đời này còn mỏng trước Trúc Cơ.');
        recommendations.push('Đưa thêm event theo build/location/domain vào pool early game.');
    }
    const band = warnings.length >= 3 ? 'warning' : warnings.length ? 'watch' : 'healthy';
    if (!recommendations.length)
        recommendations.push('Nhịp hiện tại đủ khỏe để tiếp tục playtest; ưu tiên kiểm chứng nhiều seed/build thay vì buff thêm tốc độ.');
    return {
        schema: 'playtest-telemetry.v1', life: { lifeNumber: life.lifeNumber, ageYears: state.ageYears, realmOrder: state.realm.maxRealmOrder, realmId: state.realm.realmId, alive: state.alive }, milestones,
        actions: { total, byLoop, meaningful, decisionActions, retreatSharePct, decisionDensityPer10Actions },
        combat: { wins, losses, firstClears, bossAttempts, signatureSkills: [...signature.entries()].map(([skillId, uses]) => ({ skillId, uses })).sort((a, b) => b.uses - a.uses || a.skillId.localeCompare(b.skillId)).slice(0, 8) },
        economy: { resourceGainEvents, craftEvents }, content: { resolvedEvents: lifeHistory.filter(e => e.tags.includes('ContentEvent')).length, uniqueEvents: uniqueEventIds.size, choiceVariety: uniqueChoices.size },
        projectedLegacy: projected ? { score: projected.totalScore, grade: projected.grade, cp: projected.cpEarned, talentPoints: projected.talentPointGain ?? 0 } : undefined,
        health: { band, warnings, recommendations: [...new Set(recommendations)].slice(0, 6) },
    };
}
//# sourceMappingURL=playtest-telemetry.js.map