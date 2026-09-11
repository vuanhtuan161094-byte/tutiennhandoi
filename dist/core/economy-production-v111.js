import { caveFacilityUpgradeCostV12316 } from './collection-progression-v12316.js';

export const ECONOMY_PRODUCTION_V111_SCHEMA = 'economy-production.v111';
export const ECONOMY_PRODUCTION_V111 = Object.freeze({
  cycleDays: 28,
  dailyActivityBoundJade: 140,
  dailyPvpPaidWins: 5,
  pvpRewardPerWin: 8,
  weeklyRecurringBoundJade: 300,
  weeklyFirstClearBoundJade: 75,
  gachaSingleCost: 160,
  gachaTenCost: 1440,
  caveFacilityMaxLevel: 10,
});

export function caveBoundJadeRemainingV111(facilities = [], maxLevel = ECONOMY_PRODUCTION_V111.caveFacilityMaxLevel) {
  const rows = [];
  let total = 0;
  for (const facility of facilities ?? []) {
    const level = Math.max(1, Math.floor(Number(facility?.level ?? 1)));
    let remaining = 0;
    for (let l = level; l < maxLevel; l++) remaining += caveFacilityUpgradeCostV12316(l).boundJade;
    rows.push({ id: String(facility?.id ?? ''), level, maxLevel, remainingBoundJade: remaining });
    total += remaining;
  }
  return { total, facilities: rows };
}

function topEntries(obj = {}, limit = 6) {
  return Object.entries(obj).map(([id, amount]) => ({ id, amount: Math.max(0, Math.floor(Number(amount) || 0)) }))
    .filter(x => x.amount > 0).sort((a, b) => b.amount - a.amount || a.id.localeCompare(b.id)).slice(0, limit);
}

export function buildEconomyProductionV111(input = {}) {
  const activity = input.activity ?? {};
  const economy = input.economy ?? {};
  const collection = input.collection ?? {};
  const pvp = input.pvp ?? {};
  const jade = Math.max(0, Math.floor(Number(activity?.currencies?.boundImmortalJade ?? collection?.currencies?.boundImmortalJade ?? 0)));
  const premiumJade = Math.max(0, Math.floor(Number(activity?.currencies?.immortalJade ?? collection?.currencies?.immortalJade ?? 0)));
  const spiritStones = Math.max(0, Math.floor(Number(economy?.spiritStones ?? 0)));
  const dailyActivityMax = Math.max(0, Math.floor(Number(activity?.daily?.maxAuthored ?? ECONOMY_PRODUCTION_V111.dailyActivityBoundJade)));
  const pvpDailyMax = ECONOMY_PRODUCTION_V111.dailyPvpPaidWins * ECONOMY_PRODUCTION_V111.pvpRewardPerWin;
  const weeklyRecurringMax = Math.max(0, Math.floor(Number(activity?.weekly?.maxAuthored ?? ECONOMY_PRODUCTION_V111.weeklyRecurringBoundJade)));
  const weeklyFirstClearMax = ECONOMY_PRODUCTION_V111.weeklyFirstClearBoundJade;
  const fourWeeks = Math.floor(ECONOMY_PRODUCTION_V111.cycleDays / 7);
  const recurring28 = (dailyActivityMax + pvpDailyMax) * ECONOMY_PRODUCTION_V111.cycleDays + weeklyRecurringMax * fourWeeks;
  const firstClearBurst28 = weeklyFirstClearMax * fourWeeks;
  const seasonReward = Math.max(0, Math.floor(Number(pvp?.season?.rewardPreview?.boundJade ?? 0)));
  const recurringPlusBurst28 = recurring28 + firstClearBurst28 + seasonReward;
  const cave = caveBoundJadeRemainingV111(collection?.cave?.facilities ?? []);
  const shopOffers = activity?.shop?.offers ?? [];
  const shopRemainingSpend = shopOffers.reduce((sum, offer) => sum + Math.max(0, Number(offer?.remaining ?? 0)) * Math.max(0, Number(offer?.cost ?? 0)), 0);
  const tenPullsNow = Math.floor(jade / ECONOMY_PRODUCTION_V111.gachaTenCost);
  const singlePullsNow = Math.floor(jade / ECONOMY_PRODUCTION_V111.gachaSingleCost);
  const pullsFromRecurring28 = recurring28 / (ECONOMY_PRODUCTION_V111.gachaTenCost / 10);
  const jadeLedger = activity?.ledger ?? {};
  const telemetry = economy?.telemetry ?? {};
  const currentPaidWins = Math.max(0, Math.floor(Number(pvp?.reward?.paidWinsToday ?? 0)));
  const remainingPaidWins = Math.max(0, Math.floor(Number(pvp?.reward?.remainingPaidWins ?? ECONOMY_PRODUCTION_V111.dailyPvpPaidWins - currentPaidWins)));
  const currentDailyEarned = Math.max(0, Math.floor(Number(activity?.daily?.earned ?? 0)));
  const dailyNonPvpRemaining = Math.max(0, dailyActivityMax - currentDailyEarned);
  const todayRemaining = dailyNonPvpRemaining + remainingPaidWins * ECONOMY_PRODUCTION_V111.pvpRewardPerWin;
  const sourceCards = [
    { id: 'daily.activity', name: 'Hoạt động ngày', cap: dailyActivityMax, cadence: 'daily', repeatableGameplay: true, rewardCapped: true },
    { id: 'daily.pvp', name: 'Đấu Pháp', cap: pvpDailyMax, cadence: 'daily', repeatableGameplay: true, rewardCapped: true, note: 'Chỉ 5 thắng đầu có Ngọc; sau đó rating vẫn chạy.' },
    { id: 'weekly.activity', name: 'Hoạt động tuần', cap: weeklyRecurringMax, cadence: 'weekly', repeatableGameplay: true, rewardCapped: true },
    { id: 'weekly.first-clear', name: 'First-clear', cap: weeklyFirstClearMax, cadence: 'weekly-burst', repeatableGameplay: false, rewardCapped: true },
    { id: 'season.pvp', name: 'Thưởng mùa Đấu Pháp', cap: seasonReward, cadence: '28d', repeatableGameplay: true, rewardCapped: true },
  ];
  const sinkCards = [
    { id: 'gacha', name: 'Vạn Tượng', cost: ECONOMY_PRODUCTION_V111.gachaSingleCost, altCost: ECONOMY_PRODUCTION_V111.gachaTenCost, cap: null, priority: 'choice', note: 'Không giới hạn lượt quay; chỉ giới hạn số Ngọc kiếm từ nguồn lặp.' },
    { id: 'dongfu', name: 'Động Phủ', costRemaining: cave.total, cap: 'facility-level', priority: 'long-term', note: 'Chi phí một lần; không cần nâng đều 8 công trình.' },
    { id: 'acceleration-shop', name: 'Ngân Sách Tu Tiên', costRemaining: shopRemainingSpend, cap: 'weekly-offer', priority: 'acceleration', note: 'Tùy chọn tăng tốc; nguyên liệu vẫn farm được.' },
  ];
  const earned = Math.max(0, Math.floor(Number(jadeLedger?.boundJadeEarned ?? 0)));
  const spent = Math.max(0, Math.floor(Number(jadeLedger?.boundJadeSpent ?? 0)));
  const budgetStatus = jade >= ECONOMY_PRODUCTION_V111.gachaTenCost ? 'flexible' : jade >= ECONOMY_PRODUCTION_V111.gachaSingleCost ? 'tight' : 'reserve';
  const budgetAdvice = budgetStatus === 'flexible'
    ? 'Đủ ít nhất 10-pull. Chỉ quay nếu banner đúng build; nếu Động Phủ đang nghẽn, giữ Ngọc cho công trình trọng điểm.'
    : budgetStatus === 'tight'
      ? 'Đủ quay lẻ nhưng chưa đủ 10-pull giảm giá. Nên tích thêm trừ khi đang sát pity/rate-up cần thiết.'
      : 'Ngọc đang thấp; ưu tiên hoàn thành nguồn thưởng ngày/tuần, không có lý do phải tiêu ngay.';
  return {
    schema: ECONOMY_PRODUCTION_V111_SCHEMA,
    currencies: { boundImmortalJade: jade, immortalJade: premiumJade, spiritStones },
    boundJade: {
      today: { activityEarned: currentDailyEarned, activityMax: dailyActivityMax, pvpPaidWins: currentPaidWins, pvpPaidWinCap: ECONOMY_PRODUCTION_V111.dailyPvpPaidWins, remainingEarnable: todayRemaining },
      cycle28d: { recurringMax: recurring28, firstClearBurstMax: firstClearBurst28, seasonRewardPreview: seasonReward, authoredMaxWithBurstAndSeason: recurringPlusBurst28, equivalentPullsRecurring: Number(pullsFromRecurring28.toFixed(1)) },
      spendingPower: { tenPullsNow, singlePullsNow, tenPullCost: ECONOMY_PRODUCTION_V111.gachaTenCost, singlePullCost: ECONOMY_PRODUCTION_V111.gachaSingleCost },
      sources: sourceCards,
      sinks: sinkCards,
      ledger: { earned, spent, net: earned - spent, topEarnedSources: topEntries(jadeLedger?.earnedBySource), topSpentSinks: topEntries(jadeLedger?.spentBySink) },
      status: budgetStatus,
      advice: budgetAdvice,
    },
    premiumJade: {
      balance: premiumJade,
      sourceModel: 'external-or-dev-only',
      recurringInGameSource: 0,
      includedInBoundJadeBudget: false,
      gachaSpendSupported: true,
      rule: 'Runtime giữ Tiên Ngọc thường như kênh thanh toán tương thích/tùy chọn; gameplay hiện tại không phát nguồn lặp nội game, nên V161 không tính currency này vào pacing hay ngân sách Ngọc Khóa.',
    },
    spiritStone: {
      balance: spiritStones,
      telemetry: {
        fromHunt: Math.max(0, Math.floor(Number(telemetry?.spiritStonesFromHunt ?? 0))),
        fromSalvage: Math.max(0, Math.floor(Number(telemetry?.spiritStonesFromSalvage ?? 0))),
        fromMaterialSales: Math.max(0, Math.floor(Number(telemetry?.spiritStonesEarnedMaterialSales ?? 0))),
        spentPhuongThi: Math.max(0, Math.floor(Number(telemetry?.spiritStonesSpentShop ?? 0))),
      },
      market: { refreshCost: Math.max(0, Math.floor(Number(economy?.shop?.manualRefreshCost ?? 0))), stockSlots: economy?.shop?.slots?.length ?? 0, naturalRefreshHours: 6 },
      rule: 'Linh Thạch là currency farm/sink mở: Săn Yêu + bán/phân giải tạo nguồn; Trang Bị, Tông Môn, Động Phủ và Phường Thị tạo sink.',
    },
    cave,
    materials: {
      ownedStacks: economy?.ledger?.materials?.length ?? 0,
      upgradeRatio: Number(economy?.rules?.materialUpgradeRatio ?? 10),
      specificFragments: 'gacha-only',
      resourceFarmCap: null,
      rule: 'Phó Bản farm nguyên liệu cường hóa/đột phá không giới hạn; Mảnh Riêng không rơi từ farm.',
    },
    health: {
      noInfiniteBoundJadeFarm: Boolean(activity?.rules?.noInfiniteFarmBoundJade ?? true),
      gachaPullCap: activity?.rules?.gachaBoundJadePullCap ?? null,
      resourceFarmCap: activity?.rules?.resourceDungeonFarmCap ?? null,
      autoMilestoneRewards: Boolean(activity?.rules?.autoMilestoneRewards ?? true),
      noManualClaimChores: Boolean(activity?.rules?.noManualClaimChores ?? true),
      phuongThiFiniteStock: (economy?.shop?.slots?.length ?? 0) > 0,
      premiumJadeExcludedFromRecurringBudget: true,
      oneEconomyReadModel: true,
    },
    rules: [
      'Giới hạn nằm ở NGUỒN Ngọc Khóa lặp, không giới hạn gameplay hay lượt Gacha.',
      'Động Phủ = nơi nâng; Phó Bản = nơi farm; Vạn Tượng = mảnh sở hữu/rate-up/pity.',
      'Ngân Sách Tu Tiên chỉ tăng tốc và có weekly cap theo gói; không khóa progression.',
      'Tiên Ngọc thường không phải nguồn farm lặp của gameplay hiện tại và không được cộng vào pacing V161.',
      'Phường Thị dùng Linh Thạch, stock hữu hạn và refresh tự nhiên mỗi 6 giờ thật.',
    ],
  };
}
