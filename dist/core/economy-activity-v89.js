import { addBreakMaterialV12326, addStrengthMaterialV12326, BREAK_NAME_V12326, MATERIAL_NAME_V12326 } from './collection-workshop-gacha-v12326.js';
export const ECONOMY_ACTIVITY_SCHEMA_V89 = 'economy-activity.v89';
// These are acceleration choices, never hard progression gates. Their caps control shop throughput,
// not the player's ability to spend Bound Jade on Gacha.
export const ECONOMY_SHOP_OFFERS_V89 = [
    { id: 'v89.offer.artifact.refine', name: 'Luyện Bảo Tinh Hoa', description: 'Đẩy Luyện Hóa Pháp Bảo hiện tại thay vì quay thêm món mới.', cost: 180, weeklyCap: 3, category: 'artifact', material: 60, breakthrough: 0 },
    { id: 'v89.offer.artifact.break', name: 'Thiên Tinh Pháp Bảo', description: 'Bù một nút thắt Bảo Giai; vẫn có thể farm từ Vạn Bảo Bí Khố.', cost: 320, weeklyCap: 1, category: 'artifact', material: 0, breakthrough: 1 },
    { id: 'v89.offer.pet.grow', name: 'Linh Thú Tinh Phách', description: 'Đẩy Linh Thú đang nuôi mà không nhận mảnh species.', cost: 180, weeklyCap: 3, category: 'pet', material: 60, breakthrough: 0 },
    { id: 'v89.offer.companion.grow', name: 'Đồng Tâm Ngọc', description: 'Đẩy Tri Kỷ đang Đồng Hành; không thay thế mảnh Duyên.', cost: 180, weeklyCap: 3, category: 'companion', material: 60, breakthrough: 0 },
    { id: 'v89.offer.relic.refine', name: 'Chí Bảo Linh Tinh', description: 'Đầu tư Chí Bảo hiện tại thay vì dùng Ngọc Khóa cho Gacha.', cost: 220, weeklyCap: 2, category: 'relic', material: 45, breakthrough: 0 },
    { id: 'v89.offer.manual.grow', name: 'Công Pháp Tàn Ý', description: 'Đẩy Công Pháp/Tâm Pháp nền cho build hiện tại.', cost: 160, weeklyCap: 3, category: 'manual', material: 55, breakthrough: 0 },
];
// Keep legacy Boss counters for save compatibility/activity telemetry only. Boss is progression authority;
// Săn Ảo/huntKills is the recurring Săn Yêu economy settlement path.
const EMPTY_COUNTERS = { huntBossWins: 0, huntKills: 0, resourceClears: 0, bossWins: 0, retreatHours: 0, craftActions: 0 };
const PROGRESSION_ONLY_ACTIVITY_METRICS = new Set(['huntBossWins', 'bossWins']);
function counters() { return { ...EMPTY_COUNTERS }; }
function dayKey(now) { const d = new Date(now + 7 * 3600_000); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`; }
function weekKey(now) { const d = new Date(now + 7 * 3600_000), day = (d.getUTCDay() + 6) % 7; const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day)); return `${monday.getUTCFullYear()}-${String(monday.getUTCMonth() + 1).padStart(2, '0')}-${String(monday.getUTCDate()).padStart(2, '0')}`; }
function freshPeriod(key, weekly = false) { return { key, counters: counters(), awardedIds: [], lanes: [], ...(weekly ? { activeDays: [], purchases: {}, firstClears: 0 } : {}) }; }
function defaultState(now = Date.now()) { return { schema: ECONOMY_ACTIVITY_SCHEMA_V89, daily: freshPeriod(dayKey(now)), weekly: freshPeriod(weekKey(now), true), progressionAwardedIds: [], lifetime: { boundJadeEarned: 0, boundJadeSpent: 0, earnedBySource: {}, spentBySink: {} } }; }
export function ensureEconomyActivityV89(state, now = Date.now()) {
    const host = state;
    const e = host.economyV89 ?? (host.economyV89 = defaultState(now));
    e.schema = ECONOMY_ACTIVITY_SCHEMA_V89;
    e.progressionAwardedIds ??= [];
    e.lifetime ??= { boundJadeEarned: 0, boundJadeSpent: 0, earnedBySource: {}, spentBySink: {} };
    e.lifetime.earnedBySource ??= {};
    e.lifetime.spentBySink ??= {};
    if (e.daily?.key !== dayKey(now))
        e.daily = freshPeriod(dayKey(now));
    if (e.weekly?.key !== weekKey(now))
        e.weekly = freshPeriod(weekKey(now), true);
    e.daily.counters = { ...EMPTY_COUNTERS, ...(e.daily.counters ?? {}) };
    e.daily.awardedIds ??= [];
    e.daily.lanes ??= [];
    e.weekly.counters = { ...EMPTY_COUNTERS, ...(e.weekly.counters ?? {}) };
    e.weekly.awardedIds ??= [];
    e.weekly.lanes ??= [];
    e.weekly.activeDays ??= [];
    e.weekly.purchases ??= {};
    e.weekly.firstClears ??= 0;
    // V89 migration: an earlier WIP tracked a weekly Gacha-pull quota. It is intentionally ignored.
    delete e.weekly.boundGachaPulls;
    return e;
}
function grantBoundJade(state, e, sourceId, amount) { amount = Math.max(0, Math.floor(amount)); if (!amount)
    return 0; state.currencies.boundImmortalJade += amount; e.lifetime.boundJadeEarned += amount; e.lifetime.earnedBySource[sourceId] = (e.lifetime.earnedBySource[sourceId] ?? 0) + amount; return amount; }
export function recordBoundJadeSpendV89(state, sinkId, amount, now = Date.now()) { const e = ensureEconomyActivityV89(state, now); amount = Math.max(0, Math.floor(amount)); if (amount <= 0)
    return { amount: 0 }; e.lifetime.boundJadeSpent += amount; e.lifetime.spentBySink[sinkId] = (e.lifetime.spentBySink[sinkId] ?? 0) + amount; return { amount }; }
export function recordPvpWinBoundJadeV91(state, now = Date.now()) {
    const e = ensureEconomyActivityV89(state, now);
    e.daily.pvpWins = Math.max(0, Math.floor(Number(e.daily.pvpWins ?? 0))) + 1;
    e.daily.pvpPaidWins = Math.max(0, Math.min(5, Math.floor(Number(e.daily.pvpPaidWins ?? 0))));
    let boundJade = 0;
    if (e.daily.pvpPaidWins < 5) {
        e.daily.pvpPaidWins += 1;
        boundJade = grantBoundJade(state, e, 'daily.pvp.win', 8);
    }
    return { winsToday: e.daily.pvpWins, paidWinsToday: e.daily.pvpPaidWins, paidWinCap: 5, rewardPerPaidWin: 8, boundJade, remainingPaidWins: Math.max(0, 5 - e.daily.pvpPaidWins) };
}
export function recordPvpSeasonBoundJadeV94(state, seasonId, amount, rankId = 'rookie', now = Date.now()) {
    const e = ensureEconomyActivityV89(state, now);
    const cleanSeasonId = String(seasonId ?? '').trim();
    if (!cleanSeasonId)
        throw new Error('Thiếu seasonId để ghi thưởng Đấu Pháp.');
    const key = `pvp-season.${cleanSeasonId}`;
    if (e.progressionAwardedIds.includes(key))
        return { awarded: false, boundJade: 0, seasonId: cleanSeasonId, rankId };
    e.progressionAwardedIds.push(key);
    const boundJade = grantBoundJade(state, e, `season.pvp.${rankId}`, amount);
    return { awarded: true, boundJade, seasonId: cleanSeasonId, rankId };
}
function laneForMetric(metric) { return metric === 'huntBossWins' || metric === 'huntKills' ? 'hunt' : metric === 'resourceClears' ? 'resource' : metric === 'bossWins' ? 'boss' : metric === 'retreatHours' ? 'cultivation' : 'craft'; }
// Bound Jade income is capped at the SOURCE. Gameplay remains repeatable after these thresholds.
// Resource dungeon: only first 3 wins/day pay Bound Jade. The 4th+ still pay materials normally.
const DAILY = [
    { scope: 'daily', id: 'resource.1', metric: 'resourceClears', threshold: 1, reward: 20, label: 'Bí Cảnh tài nguyên · lượt Ngọc 1/3' },
    { scope: 'daily', id: 'resource.2', metric: 'resourceClears', threshold: 2, reward: 20, label: 'Bí Cảnh tài nguyên · lượt Ngọc 2/3' },
    { scope: 'daily', id: 'resource.3', metric: 'resourceClears', threshold: 3, reward: 20, label: 'Bí Cảnh tài nguyên · lượt Ngọc 3/3' },
    { scope: 'daily', id: 'hunt.kills.150', metric: 'huntKills', threshold: 150, reward: 15, label: 'Săn Ảo · 150 yêu thú' },
];
const WEEKLY = [
    { scope: 'weekly', id: 'active.3d', threshold: 3, reward: 50, label: 'Có hoạt động thật trong 3 ngày' },
    { scope: 'weekly', id: 'active.5d', threshold: 5, reward: 70, label: 'Có hoạt động thật trong 5 ngày' },
    { scope: 'weekly', id: 'active.7d', threshold: 7, reward: 80, label: 'Có hoạt động thật đủ 7 ngày' },
    { scope: 'weekly', id: 'lanes.5', threshold: 5, reward: 50, label: 'Chạm đủ 5 loại gameplay' },
    { scope: 'weekly', id: 'combat.12', threshold: 12, reward: 50, label: 'Hoàn tất 12 lượt Bí Cảnh Tài Nguyên' },
];
function awardMilestones(state, e) {
    const awards = [];
    for (const m of DAILY) {
        if (e.daily.awardedIds.includes(m.id))
            continue;
        const value = m.metric ? e.daily.counters[m.metric] : 0;
        if (value + 1e-9 < m.threshold)
            continue;
        e.daily.awardedIds.push(m.id);
        awards.push({ id: m.id, label: m.label, boundJade: grantBoundJade(state, e, `daily.${m.id}`, m.reward) });
    }
    const dailyLaneCount = new Set(e.daily.lanes).size;
    for (const [id, threshold, reward, label] of [['diversity.3', 3, 15, 'Hôm nay trải nghiệm 3 loại gameplay'], ['diversity.5', 5, 10, 'Hôm nay chạm đủ 5 loại gameplay']]) {
        if (dailyLaneCount >= threshold && !e.daily.awardedIds.includes(id)) {
            e.daily.awardedIds.push(id);
            awards.push({ id, label, boundJade: grantBoundJade(state, e, `daily.${id}`, reward) });
        }
    }
    for (const m of WEEKLY) {
        if (e.weekly.awardedIds.includes(m.id))
            continue;
        let value = 0;
        if (m.id.startsWith('active.'))
            value = e.weekly.activeDays?.length ?? 0;
        else if (m.id === 'lanes.5')
            value = new Set(e.weekly.lanes).size;
        else if (m.id === 'combat.12')
            value = e.weekly.counters.resourceClears;
        if (value < m.threshold)
            continue;
        e.weekly.awardedIds.push(m.id);
        awards.push({ id: m.id, label: m.label, boundJade: grantBoundJade(state, e, `weekly.${m.id}`, m.reward) });
    }
    return awards;
}
export function recordEconomyActivityV89(state, metric, amount = 1, now = Date.now()) {
    const e = ensureEconomyActivityV89(state, now), v = Math.max(0, Number(amount) || 0), lane = laneForMetric(metric);
    if (v <= 0)
        return { awards: [], summary: e };
    e.daily.counters[metric] += v;
    e.weekly.counters[metric] += v;
    if (!e.daily.lanes.includes(lane))
        e.daily.lanes.push(lane);
    if (!e.weekly.lanes.includes(lane))
        e.weekly.lanes.push(lane);
    if (!e.weekly.activeDays.includes(e.daily.key))
        e.weekly.activeDays.push(e.daily.key);
    // Boss wins stay observable for compatibility/activity diversity, but a Boss action itself never settles economy rewards.
    if (PROGRESSION_ONLY_ACTIVITY_METRICS.has(metric))
        return { awards: [], summary: e };
    return { awards: awardMilestones(state, e), summary: e };
}
export function recordProgressionBoundJadeV89(state, id, reward, label, now = Date.now()) {
    const e = ensureEconomyActivityV89(state, now), key = `progression.${id}`;
    if (e.progressionAwardedIds.includes(key))
        return { awarded: false, boundJade: 0, label };
    e.progressionAwardedIds.push(key);
    return { awarded: true, boundJade: grantBoundJade(state, e, key, reward), label };
}
export function recordFirstClearBoundJadeV89(state, id, now = Date.now()) {
    const e = ensureEconomyActivityV89(state, now), key = `first-clear.${id}`;
    if (e.progressionAwardedIds.includes(key))
        return { awarded: false, boundJade: 0 };
    e.progressionAwardedIds.push(key);
    if ((e.weekly.firstClears ?? 0) >= 5)
        return { awarded: false, boundJade: 0 };
    e.weekly.firstClears = (e.weekly.firstClears ?? 0) + 1;
    return { awarded: true, boundJade: grantBoundJade(state, e, 'weekly.first-clear', 15) };
}
export function buyEconomyOfferV89(state, inventory, offerId, now = Date.now()) {
    const e = ensureEconomyActivityV89(state, now), offer = ECONOMY_SHOP_OFFERS_V89.find(x => x.id === offerId);
    if (!offer)
        throw new Error('Gói Ngân Sách Tu Tiên không tồn tại.');
    const bought = e.weekly.purchases?.[offer.id] ?? 0;
    if (bought >= offer.weeklyCap)
        throw new Error(`${offer.name} đã mua đủ ${offer.weeklyCap}/${offer.weeklyCap} tuần này.`);
    if (state.currencies.boundImmortalJade < offer.cost)
        throw new Error(`Không đủ Tiên Ngọc Khóa: cần ${offer.cost}.`);
    state.currencies.boundImmortalJade -= offer.cost;
    e.weekly.purchases[offer.id] = bought + 1;
    recordBoundJadeSpendV89(state, `shop.${offer.id}`, offer.cost, now);
    if (offer.material > 0)
        addStrengthMaterialV12326(state, inventory, offer.category, offer.material);
    if (offer.breakthrough > 0)
        addBreakMaterialV12326(state, inventory, offer.category, offer.breakthrough);
    return { offer: { ...offer }, purchased: e.weekly.purchases[offer.id], remaining: offer.weeklyCap - e.weekly.purchases[offer.id], currency: state.currencies.boundImmortalJade };
}
function metricProgress(e, metric, threshold) { return { value: Number(e.daily.counters[metric].toFixed(2)), target: threshold, pct: Math.max(0, Math.min(100, e.daily.counters[metric] / threshold * 100)) }; }
export function economyActivitySummaryV89(state, inventory, now = Date.now()) {
    const e = ensureEconomyActivityV89(state, now), awarded = new Set(e.daily.awardedIds), weeklyAwarded = new Set(e.weekly.awardedIds);
    const resourcePaid = Math.min(3, Math.floor(e.daily.counters.resourceClears));
    const laneCards = [
        { id: 'hunt', name: 'Săn Yêu', description: 'Boss thật chỉ mở tầng; Săn Ảo chạy lâu để farm throughput và kết toán kinh tế.', route: 'hunt', jade: `Săn ${Math.min(150, Math.floor(e.daily.counters.huntKills))}/150`, milestones: [{ label: 'Săn Ảo · 150 yêu thú', ...metricProgress(e, 'huntKills', 150), done: awarded.has('hunt.kills.150'), reward: 15 }] },
        { id: 'resource', name: 'Bí Cảnh Tài Nguyên', description: 'Farm đúng hệ đang thiếu. Chỉ 3 chiến thắng đầu/ngày phát Ngọc Khóa; lượt sau vẫn rơi nguyên liệu đầy đủ.', route: 'dungeons', jade: `${resourcePaid}/3 lượt Ngọc hôm nay`, milestones: [1, 2, 3].map(i => ({ label: `Lượt Ngọc ${i}/3`, ...metricProgress(e, 'resourceClears', i), done: awarded.has(`resource.${i}`), reward: 20 })) },
        { id: 'boss', name: 'Thủ Lĩnh & Thí Luyện', description: 'CombatKernel thật; Boss là cửa tiến trình/first-clear, không phải điểm kết toán kinh tế.', route: 'combat', jade: 'Không phát Ngọc trực tiếp', milestones: [] },
        { id: 'cultivation', name: 'Tu Luyện & Bế Quan', description: 'Đẩy cảnh giới theo nhịp của bạn. Không ép Bế Quan để lấy Ngọc; tham gia chỉ tính đa dạng hoạt động.', route: 'cultivation', jade: 'Không phát Ngọc trực tiếp', milestones: [] },
        { id: 'craft', name: 'Động Phủ', description: 'Luyện Đan, Luyện Khí, Luyện Bảo để biến nguyên liệu thành sức mạnh. Không phải nút daily claim.', route: 'dongfu', jade: 'Không phát Ngọc trực tiếp', milestones: [] },
    ];
    const weekly = [
        { id: 'active.3d', label: 'Hoạt động 3 ngày', value: e.weekly.activeDays?.length ?? 0, target: 3, reward: 50, done: weeklyAwarded.has('active.3d') },
        { id: 'active.5d', label: 'Hoạt động 5 ngày', value: e.weekly.activeDays?.length ?? 0, target: 5, reward: 70, done: weeklyAwarded.has('active.5d') },
        { id: 'active.7d', label: 'Hoạt động đủ 7 ngày', value: e.weekly.activeDays?.length ?? 0, target: 7, reward: 80, done: weeklyAwarded.has('active.7d') },
        { id: 'lanes.5', label: 'Chạm đủ 5 loại gameplay', value: new Set(e.weekly.lanes).size, target: 5, reward: 50, done: weeklyAwarded.has('lanes.5') },
        { id: 'combat.12', label: '12 lượt Bí Cảnh Tài Nguyên', value: e.weekly.counters.resourceClears, target: 12, reward: 50, done: weeklyAwarded.has('combat.12') },
    ];
    const offers = ECONOMY_SHOP_OFFERS_V89.map(o => { const bought = e.weekly.purchases?.[o.id] ?? 0; return { ...o, bought, remaining: o.weeklyCap - bought, affordable: state.currencies.boundImmortalJade >= o.cost, rewardText: [o.material ? `${o.material} ${MATERIAL_NAME_V12326[o.category]}` : '', o.breakthrough ? `${o.breakthrough} ${BREAK_NAME_V12326[o.category]}` : ''].filter(Boolean).join(' + ') }; });
    const dailyPotential = DAILY.reduce((a, x) => a + x.reward, 0) + 25, weeklyPotential = WEEKLY.reduce((a, x) => a + x.reward, 0);
    return { schema: ECONOMY_ACTIVITY_SCHEMA_V89, currencies: { ...state.currencies }, daily: { dayKey: e.daily.key, lanes: laneCards, diversity: { value: new Set(e.daily.lanes).size, target: 5, reward3: 15, reward5: 10 }, earned: e.daily.awardedIds.reduce((sum, id) => { const m = DAILY.find(x => x.id === id); if (m)
                return sum + m.reward; if (id === 'diversity.3')
                return sum + 15; if (id === 'diversity.5')
                return sum + 10; return sum; }, 0), maxAuthored: dailyPotential, resourceDungeonJade: { paidClears: resourcePaid, capClears: 3, rewardPerClear: 20, remainingClears: Math.max(0, 3 - resourcePaid), rule: 'Chỉ giới hạn lượt nhận Ngọc Khóa; không giới hạn lượt farm Phó Bản.' } }, weekly: { weekKey: e.weekly.key, activeDays: e.weekly.activeDays?.length ?? 0, lanes: new Set(e.weekly.lanes).size, milestones: weekly, firstClearBonusRemaining: Math.max(0, 5 - (e.weekly.firstClears ?? 0)), maxAuthored: weeklyPotential }, shop: { offers, rule: 'Shop là lựa chọn tăng tốc. Gacha bằng Ngọc Khóa KHÔNG có giới hạn lượt; chỉ số dư Ngọc quyết định quay được bao nhiêu.' }, ledger: { ...e.lifetime, earnedBySource: { ...e.lifetime.earnedBySource }, spentBySink: { ...e.lifetime.spentBySink } }, rules: { gachaBoundJadePullCap: null, noInfiniteFarmBoundJade: true, resourceDungeonJadePaidClearCap: 3, resourceDungeonFarmCap: null, autoMilestoneRewards: true, noManualClaimChores: true, bossProgressionOnly: true, huntEconomySettlement: true, budgetTarget: 'Nguồn Ngọc Khóa lặp có cap; sink mở. Người chơi tự chọn Gacha, tăng tốc hay dự trữ.' } };
}
//# sourceMappingURL=economy-activity-v89.js.map