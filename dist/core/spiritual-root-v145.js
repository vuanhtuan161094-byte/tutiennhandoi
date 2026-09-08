import { createAlchemyHuntProgressV146, cloneAlchemyHuntProgressV146, settleAlchemyHuntRewardsV146 } from './alchemy-hunt-v146.js';

export const SPIRITUAL_ROOT_SCHEMA_V145 = 'spiritual-root.v145';
export const SPIRITUAL_ROOT_TENDON_RESOURCE_V145 = 'resource.spiritual_root.tendon.v145';
export const SPIRITUAL_ROOT_ORIGIN_RESOURCE_V145 = 'resource.spiritual_root.origin.v145.realm.1';
export const SPIRITUAL_ROOT_MAX_REALM_TIER_V145 = 28;
export const SPIRITUAL_ROOT_TENDON_NAME_V145 = 'Linh Tủy';
export const SPIRITUAL_ROOT_ORIGIN_NAME_V145 = 'Bản Nguyên Linh Căn';
export const SPIRITUAL_ROOT_ASCENSION_INTERVAL_V145 = 100;

export function spiritualRootOriginRealmTierV145(value) {
  return Math.max(1, Math.min(SPIRITUAL_ROOT_MAX_REALM_TIER_V145, Math.floor(Number(value) || 1)));
}
export function spiritualRootOriginResourceIdV145(majorRealmIndex) {
  return `resource.spiritual_root.origin.v145.realm.${spiritualRootOriginRealmTierV145(majorRealmIndex)}`;
}
export function spiritualRootOriginTierForAscensionV145(level) {
  const ascension = Math.max(1, Math.floor(Math.max(100, Number(level) || 100) / SPIRITUAL_ROOT_ASCENSION_INTERVAL_V145));
  return spiritualRootOriginRealmTierV145(ascension);
}
export function combineSpiritualRootOriginV145(inventory, fromRealmTier, batches = 1, currentMajorRealmIndex = SPIRITUAL_ROOT_MAX_REALM_TIER_V145) {
  const fromTier = spiritualRootOriginRealmTierV145(fromRealmTier);
  if (fromTier >= SPIRITUAL_ROOT_MAX_REALM_TIER_V145) throw new Error('Bản Nguyên bậc cao nhất không thể ghép tiếp.');
  const count = Math.max(1, Math.floor(Number(batches) || 1));
  const fromId = spiritualRootOriginResourceIdV145(fromTier);
  const toTier = fromTier + 1;
  const unlockedTier = Math.max(0, Math.min(SPIRITUAL_ROOT_MAX_REALM_TIER_V145, Math.floor(Number(currentMajorRealmIndex) || 0)));
  if (toTier > unlockedTier) throw new Error(`Cần lên đại cảnh bậc ${toTier} trước khi tạo Bản Nguyên Linh Căn bậc ${toTier}.`);
  const toId = spiritualRootOriginResourceIdV145(toTier);
  const need = BigInt(count * 3);
  const have = bigintInventory(inventory, fromId);
  if (have < need) throw new Error(`Thiếu Bản Nguyên bậc ${fromTier}: ${have}/${need}.`);
  writeBigintInventory(inventory, fromId, have - need);
  writeBigintInventory(inventory, toId, bigintInventory(inventory, toId) + BigInt(count));
  return { fromRealmTier: fromTier, toRealmTier: toTier, fromResourceId: fromId, toResourceId: toId, spent: need.toString(), gained: String(count), ratio: '3:1', unlockedRealmTier: unlockedTier };
}

export const SPIRITUAL_ROOT_GRADE_NAMES_V145 = Object.freeze([
  'Phàm Căn', 'Linh Căn', 'Huyền Căn', 'Địa Căn', 'Thiên Căn',
  'Chân Căn', 'Đạo Căn', 'Tiên Căn', 'Thần Căn', 'Cực Căn',
]);

export const SPIRITUAL_ROOT_BRANCHES_V145 = Object.freeze({
  gathering: Object.freeze({ id: 'gathering', name: 'Tụ Linh Mạch', role: 'Tu Vi · Linh Tủy · Bế Quan' }),
  battle: Object.freeze({ id: 'battle', name: 'Chiến Linh Mạch', role: 'Công · Phá Thế · Bạo Thương hữu hạn' }),
  body: Object.freeze({ id: 'body', name: 'Huyền Thể Mạch', role: 'HP · Phòng · hồi phục · giảm thương hữu hạn' }),
  spirit: Object.freeze({ id: 'spirit', name: 'Linh Hải Mạch', role: 'Chân Nguyên · hồi CN · hiệu suất · hồi chiêu hữu hạn' }),
});

export const SPIRITUAL_ROOT_INSIGHTS_V145 = Object.freeze({
  attack: Object.freeze({ id: 'attack', name: 'Nhất Khí Quán Thể', description: 'Tăng Công nền vô hạn theo đường cong giảm dần.', repeatable: true }),
  vitality: Object.freeze({ id: 'vitality', name: 'Thiên Sinh Linh Thể', description: 'Tăng HP nền vô hạn theo đường cong giảm dần.', repeatable: true }),
  defense: Object.freeze({ id: 'defense', name: 'Huyền Giáp Nội Sinh', description: 'Tăng Phòng nền vô hạn theo đường cong giảm dần.', repeatable: true }),
  spirit: Object.freeze({ id: 'spirit', name: 'Linh Hải Vô Nhai', description: 'Tăng Chân Nguyên tối đa nhưng bị giới hạn mềm an toàn.', repeatable: true }),
  cultivation: Object.freeze({ id: 'cultivation', name: 'Thiên Địa Đồng Tức', description: 'Tăng hiệu suất Tu Luyện vô hạn theo đường cong giảm dần.', repeatable: true }),
  balanced: Object.freeze({ id: 'balanced', name: 'Đạo Cơ Viên Dung', description: 'Tăng đồng thời Công, HP và Phòng nền theo đường cong giảm dần.', repeatable: true }),
});

const safeInt = (value, fallback = 0) => Math.max(0, Math.floor(Number.isFinite(Number(value)) ? Number(value) : fallback));
const safeNumber = (value, fallback = 0) => Math.max(0, Number.isFinite(Number(value)) ? Number(value) : fallback);
const sqrtGrowth = (rank, perRoot) => perRoot * Math.sqrt(Math.max(0, safeNumber(rank)));

export function createSpiritualRootStateV145() {
  return {
    schema: SPIRITUAL_ROOT_SCHEMA_V145,
    level: 1,
    nourishment: 0,
    ascensions: 0,
    meridianPointsSpent: { gathering: 0, battle: 0, body: 0, spirit: 0 },
    insightRanks: {},
    insightChoices: [],
    huntOriginProgress: 0,
    // Integration-only persistence for V146 Hunt -> Yêu Đan meters. Alchemy owns the formula/resources;
    // this field lives here because every canonical real/virtual Hunt reward event already passes this state seam.
    alchemyHuntV146: createAlchemyHuntProgressV146(),
    migratedFromLegacy: false,
    legacyRefunded: false,
  };
}

export function cloneSpiritualRootStateV145(value) {
  const base = createSpiritualRootStateV145();
  const src = value ?? base;
  const level = Math.max(1, safeInt(src.level, 1));
  // Crossing a gate proves all earlier gates were cleared; the current exact 100-multiple may still be pending.
  const minimumAscensions = Math.floor((level - 1) / SPIRITUAL_ROOT_ASCENSION_INTERVAL_V145);
  const insightRanks = Object.fromEntries(Object.entries(src.insightRanks ?? {}).filter(([id]) => Boolean(SPIRITUAL_ROOT_INSIGHTS_V145[id])).map(([id, rank]) => [id, safeInt(rank)]));
  return {
    schema: SPIRITUAL_ROOT_SCHEMA_V145,
    level,
    nourishment: safeNumber(src.nourishment),
    ascensions: Math.max(minimumAscensions, safeInt(src.ascensions)),
    meridianPointsSpent: Object.fromEntries(Object.keys(SPIRITUAL_ROOT_BRANCHES_V145).map(id => [id, safeInt(src.meridianPointsSpent?.[id])])),
    insightRanks,
    insightChoices: Array.isArray(src.insightChoices) ? src.insightChoices.filter(id => Boolean(SPIRITUAL_ROOT_INSIGHTS_V145[id])) : [],
    huntOriginProgress: safeInt(src.huntOriginProgress) % 500,
    alchemyHuntV146: cloneAlchemyHuntProgressV146(src.alchemyHuntV146),
    migratedFromLegacy: Boolean(src.migratedFromLegacy),
    legacyRefunded: Boolean(src.legacyRefunded),
  };
}

export function spiritualRootGradeV145(level) {
  const lv = Math.max(1, safeInt(level, 1));
  if (lv <= 1000) {
    const index = Math.min(9, Math.floor((lv - 1) / 100));
    return { id: `grade.${index + 1}`, name: SPIRITUAL_ROOT_GRADE_NAMES_V145[index], cycle: 0, rankInCycle: index + 1 };
  }
  const cycle = Math.floor((lv - 1001) / 100) + 1;
  return { id: `infinite.${cycle}`, name: `Vô Cực Căn · Chuyển ${cycle}`, cycle, rankInCycle: cycle };
}

export function spiritualRootNourishmentCostV145(level) {
  const lv = Math.max(1, safeInt(level, 1));
  // Infinite, monotonic and sub-exponential. BigInt keeps long-run resource accounting stable.
  const a = BigInt(lv + 20);
  const b = BigInt(Math.floor(Math.sqrt(lv)) + 10);
  return 40n + a * b + BigInt(Math.floor(lv / 100)) * 250n;
}

export function spiritualRootOriginCostV145(targetLevel) {
  const lv = Math.max(100, safeInt(targetLevel, 100));
  const ascension = Math.max(1, Math.floor(lv / 100));
  return BigInt(1 + Math.floor((ascension - 1) / 3)) + BigInt(Math.floor(Math.sqrt(ascension) / 2));
}

/** Baseline Tu Vi bonus. No hard cap; logarithmic growth prevents infinite progression from exploding the economy. */
export function spiritualRootCultivationBonusPctV145(level, gatheringPoints = 0, cultivationInsightRanks = 0) {
  const lv = Math.max(1, safeInt(level, 1));
  const progress = Math.max(0, lv - 1);
  // Rough anchors remain ~10/46/102/162/223%; fresh Lv1 contributes exactly zero.
  const base = 60.885 * Math.log10(1 + progress / 216.95);
  const branch = 1.35 * Math.sqrt(Math.max(0, safeNumber(gatheringPoints)));
  const insight = sqrtGrowth(cultivationInsightRanks, 5);
  return Math.max(0, base + branch + insight);
}

/** Safe raw-stat lane only: Công/HP/Phòng can keep growing forever. */
export function spiritualRootCoreCombatBonusPctV145(level) {
  const lv = Math.max(1, safeInt(level, 1));
  const progress = Math.max(0, lv - 1);
  // Rough anchors remain ~3/16/36/59/81%; fresh Lv1 contributes exactly zero.
  return Math.max(0, 22.479 * Math.log10(1 + progress / 248.91));
}

function diminishingUtility(points, scale, cap) {
  const p = Math.max(0, safeNumber(points));
  return cap * (1 - Math.exp(-p / Math.max(1, scale)));
}

export function spiritualRootMeridianBonusesV145(state) {
  const s = cloneSpiritualRootStateV145(state);
  const g = s.meridianPointsSpent.gathering;
  const b = s.meridianPointsSpent.battle;
  const h = s.meridianPointsSpent.body;
  const l = s.meridianPointsSpent.spirit;
  return {
    cultivationBonusPct: 1.35 * Math.sqrt(g),
    tendonDropBonusPct: diminishingUtility(g, 24, 40),
    retreatBonusPct: diminishingUtility(g, 18, 18),
    attackPct: 1.5 * Math.sqrt(b),
    breakEffectPct: diminishingUtility(b, 16, 14),
    critDamagePct: diminishingUtility(b, 18, 24),
    maxHpPct: 1.8 * Math.sqrt(h),
    defensePct: 1.55 * Math.sqrt(h),
    healingReceivedPct: diminishingUtility(h, 18, 18),
    damageReductionPct: diminishingUtility(h, 24, 8),
    maxSpiritPct: diminishingUtility(l, 24, 36),
    spiritRegenPct: diminishingUtility(l, 18, 24),
    spiritEfficiencyPct: diminishingUtility(l, 24, 12),
    cooldownReductionPct: diminishingUtility(l, 30, 8),
  };
}

export function spiritualRootAvailableMeridianPointsV145(state) {
  const s = cloneSpiritualRootStateV145(state);
  const earned = s.ascensions;
  const spent = Object.values(s.meridianPointsSpent).reduce((a, b) => a + safeInt(b), 0);
  return Math.max(0, earned - spent);
}

export function allocateSpiritualRootMeridianPointV145(state, branchId) {
  const s = cloneSpiritualRootStateV145(state);
  if (!SPIRITUAL_ROOT_BRANCHES_V145[branchId]) throw new Error(`Căn Mạch không hợp lệ: ${branchId}`);
  if (spiritualRootAvailableMeridianPointsV145(s) <= 0) throw new Error('Không còn Điểm Căn Mạch chưa phân bổ.');
  s.meridianPointsSpent[branchId] += 1;
  return s;
}

export function spiritualRootInsightOptionsV145(state) {
  const s = cloneSpiritualRootStateV145(state);
  const seed = Math.max(1, s.ascensions);
  const pool = Object.keys(SPIRITUAL_ROOT_INSIGHTS_V145);
  const start = (seed * 7 + s.level) % pool.length;
  return [0, 1, 2].map(i => pool[(start + i * 2) % pool.length]).map(id => SPIRITUAL_ROOT_INSIGHTS_V145[id]);
}

export function chooseSpiritualRootInsightV145(state, insightId) {
  const s = cloneSpiritualRootStateV145(state);
  const choicesUsed = s.insightChoices.length;
  if (choicesUsed >= s.ascensions) throw new Error('Chưa có lần Tiến Cấp Linh Căn mới để chọn Căn Ngộ.');
  const options = spiritualRootInsightOptionsV145(s).map(x => x.id);
  if (!options.includes(insightId)) throw new Error(`Căn Ngộ ${insightId} không nằm trong 3 lựa chọn hiện tại.`);
  s.insightRanks[insightId] = safeInt(s.insightRanks[insightId]) + 1;
  s.insightChoices.push(insightId);
  return s;
}

export function spiritualRootInsightBonusesV145(state) {
  const ranks = cloneSpiritualRootStateV145(state).insightRanks;
  const rank = id => safeInt(ranks[id]);
  const spiritRank = rank('spirit');
  return {
    attackPct: sqrtGrowth(rank('attack'), 4) + sqrtGrowth(rank('balanced'), 2),
    maxHpPct: sqrtGrowth(rank('vitality'), 6) + sqrtGrowth(rank('balanced'), 2),
    defensePct: sqrtGrowth(rank('defense'), 5) + sqrtGrowth(rank('balanced'), 2),
    // Chân Nguyên is utility: repeated choices approach but never reach +48%.
    maxSpiritPct: diminishingUtility(spiritRank, 12, 48),
    cultivationPct: sqrtGrowth(rank('cultivation'), 5),
  };
}

export function spiritualRootCombatBonusesV145(state) {
  const s = cloneSpiritualRootStateV145(state);
  const core = spiritualRootCoreCombatBonusPctV145(s.level);
  const meridian = spiritualRootMeridianBonusesV145(s);
  const insight = spiritualRootInsightBonusesV145(s);
  return {
    attackPct: core + meridian.attackPct + insight.attackPct,
    maxHpPct: core + meridian.maxHpPct + insight.maxHpPct,
    defensePct: core + meridian.defensePct + insight.defensePct,
    maxSpiritPct: Math.min(60, meridian.maxSpiritPct + insight.maxSpiritPct),
    breakEffectPct: meridian.breakEffectPct,
    critDamagePct: meridian.critDamagePct,
    healingReceivedPct: meridian.healingReceivedPct,
    damageReductionPct: meridian.damageReductionPct,
    spiritRegenPct: meridian.spiritRegenPct,
    spiritEfficiencyPct: meridian.spiritEfficiencyPct,
    cooldownReductionPct: meridian.cooldownReductionPct,
  };
}

export function spiritualRootCultivationTotalBonusPctV145(state) {
  const s = cloneSpiritualRootStateV145(state);
  const insightRank = safeInt(s.insightRanks.cultivation);
  return spiritualRootCultivationBonusPctV145(s.level, s.meridianPointsSpent.gathering, insightRank);
}

function bigintInventory(inventory, id) {
  const v = inventory?.[id];
  if (typeof v === 'bigint') return v;
  if (typeof v === 'number' && Number.isFinite(v)) return BigInt(Math.max(0, Math.floor(v)));
  if (typeof v === 'string' && /^\d+$/.test(v)) return BigInt(v);
  return 0n;
}
function writeBigintInventory(inventory, id, value) { inventory[id] = value.toString(); }

export function nourishSpiritualRootV145(state, inventory, requestedLevels = 1) {
  let s = cloneSpiritualRootStateV145(state);
  let levels = Math.max(1, Math.min(1000, safeInt(requestedLevels, 1)));
  let spent = 0n;
  let raised = 0;
  while (levels-- > 0) {
    const requiredAscensions = s.level >= 100 && s.level % 100 === 0 ? Math.floor(s.level / 100) : 0;
    if (requiredAscensions > 0 && s.ascensions < requiredAscensions) break;
    const cost = spiritualRootNourishmentCostV145(s.level);
    const have = bigintInventory(inventory, SPIRITUAL_ROOT_TENDON_RESOURCE_V145);
    if (have < cost) break;
    writeBigintInventory(inventory, SPIRITUAL_ROOT_TENDON_RESOURCE_V145, have - cost);
    spent += cost;
    s.level += 1;
    raised += 1;
  }
  const requiredAscensions = s.level >= 100 && s.level % 100 === 0 ? Math.floor(s.level / 100) : 0;
  return { state: s, levelsRaised: raised, spentTendon: spent.toString(), blockedByAscension: requiredAscensions > 0 && s.ascensions < requiredAscensions };
}

export function ascendSpiritualRootV145(state, inventory, currentMajorRealmIndex = 0) {
  const s = cloneSpiritualRootStateV145(state);
  if (s.level < 100 || s.level % 100 !== 0) throw new Error('Linh Căn chỉ Tiến Cấp tại mốc mỗi 100 Lv.');
  const expectedAscensions = Math.floor(s.level / 100);
  if (s.ascensions >= expectedAscensions) throw new Error('Mốc Linh Căn này đã Tiến Cấp.');
  const requiredRealmTier = spiritualRootOriginTierForAscensionV145(s.level);
  const unlockedRealmTier = Math.max(0, Math.min(SPIRITUAL_ROOT_MAX_REALM_TIER_V145, Math.floor(Number(currentMajorRealmIndex) || 0)));
  if (unlockedRealmTier < requiredRealmTier) throw new Error(`Cần lên đại cảnh bậc ${requiredRealmTier} trước khi Tiến Cấp Linh Căn mốc này.`);
  const originResourceId = spiritualRootOriginResourceIdV145(requiredRealmTier);
  const cost = spiritualRootOriginCostV145(s.level);
  const have = bigintInventory(inventory, originResourceId);
  if (have < cost) throw new Error(`Thiếu ${SPIRITUAL_ROOT_ORIGIN_NAME_V145} bậc ${requiredRealmTier}: ${have}/${cost}.`);
  writeBigintInventory(inventory, originResourceId, have - cost);
  s.ascensions = expectedAscensions;
  return { state: s, cost: cost.toString(), requiredRealmTier, originResourceId, meridianPointGranted: 1, insightOptions: spiritualRootInsightOptionsV145(s) };
}

export function spiritualRootSummaryV145(state, inventory = {}, currentMajorRealmIndex = 0) {
  const s = cloneSpiritualRootStateV145(state);
  const grade = spiritualRootGradeV145(s.level);
  const nextCost = spiritualRootNourishmentCostV145(s.level);
  const atGate = s.level >= 100 && s.level % 100 === 0 && s.ascensions < Math.floor(s.level / 100);
  const requiredOriginTier = atGate ? spiritualRootOriginTierForAscensionV145(s.level) : spiritualRootOriginTierForAscensionV145(Math.max(100, (s.ascensions + 1) * 100));
  const requiredOriginResourceId = spiritualRootOriginResourceIdV145(requiredOriginTier);
  const unlockedRealmTier = Math.max(0, Math.min(SPIRITUAL_ROOT_MAX_REALM_TIER_V145, Math.floor(Number(currentMajorRealmIndex) || 0)));
  return {
    schema: SPIRITUAL_ROOT_SCHEMA_V145,
    level: s.level,
    grade,
    ascensions: s.ascensions,
    cultivationBonusPct: spiritualRootCultivationTotalBonusPctV145(s),
    combat: spiritualRootCombatBonusesV145(s),
    availableMeridianPoints: spiritualRootAvailableMeridianPointsV145(s),
    meridianPointsSpent: { ...s.meridianPointsSpent },
    meridianBonuses: spiritualRootMeridianBonusesV145(s),
    branches: SPIRITUAL_ROOT_BRANCHES_V145,
    insightRanks: { ...s.insightRanks },
    pendingInsightChoices: Math.max(0, s.ascensions - s.insightChoices.length),
    insightOptions: spiritualRootInsightOptionsV145(s),
    nextLevelCost: nextCost.toString(),
    tendonOwned: bigintInventory(inventory, SPIRITUAL_ROOT_TENDON_RESOURCE_V145).toString(),
    ascensionRequired: atGate,
    ascensionCost: atGate ? spiritualRootOriginCostV145(s.level).toString() : '0',
    requiredOriginTier,
    requiredOriginResourceId,
    requiredOriginRealmUnlocked: unlockedRealmTier >= requiredOriginTier,
    unlockedOriginRealmTier: unlockedRealmTier,
    originOwned: bigintInventory(inventory, requiredOriginResourceId).toString(),
    originTiers: Array.from({ length: SPIRITUAL_ROOT_MAX_REALM_TIER_V145 }, (_, index) => {
      const tier = index + 1;
      const resourceId = spiritualRootOriginResourceIdV145(tier);
      return { tier, resourceId, owned: bigintInventory(inventory, resourceId).toString(), naturalDropUnlocked: tier <= unlockedRealmTier, canCombineUp: tier < SPIRITUAL_ROOT_MAX_REALM_TIER_V145 };
    }),
  };
}

/** Deterministic one-time migration. Legacy five-element values are only an input for preserving earned effort. */
export function migrateLegacySpiritualRootV145(buildFoundation) {
  const roots = buildFoundation?.roots ?? {};
  const levels = ['metal', 'wood', 'water', 'fire', 'earth'].map(id => safeInt(roots[id]?.level, 1));
  const average = levels.reduce((a, b) => a + b, 0) / Math.max(1, levels.length);
  const peak = Math.max(...levels, 1);
  const legacyLevel = Math.max(1, Math.floor(average * 0.65 + peak * 0.35));
  const state = createSpiritualRootStateV145();
  state.level = legacyLevel;
  state.ascensions = Math.floor((legacyLevel - 1) / 100);
  state.migratedFromLegacy = true;
  return state;
}

export function resolveSpiritualRootStateV145(character) {
  if (character?.spiritualRootV145?.schema === SPIRITUAL_ROOT_SCHEMA_V145) return cloneSpiritualRootStateV145(character.spiritualRootV145);
  return migrateLegacySpiritualRootV145(character?.buildFoundation);
}

export const SPIRITUAL_ROOT_VIRTUAL_ORIGIN_PITY_KILLS_V145 = 500;

function addInventoryBigIntV145(inventory, id, amount) {
  const next = bigintInventory(inventory, id) + BigInt(amount);
  writeBigintInventory(inventory, id, next);
  return next;
}

/** One-time compatibility refund. Legacy elemental resources become generic V145 resources and never remain a live sink. */
export function settleLegacySpiritualRootMigrationV145(character, inventory = {}) {
  const hadV145 = character?.spiritualRootV145?.schema === SPIRITUAL_ROOT_SCHEMA_V145;
  const state = hadV145 ? cloneSpiritualRootStateV145(character.spiritualRootV145) : migrateLegacySpiritualRootV145(character?.buildFoundation);
  if (state.legacyRefunded) { if (character) character.spiritualRootV145 = state; return { state, refundedTendon: '0', refundedOrigin: '0' }; }
  let oldMaterials = 0n;
  for (const id of Object.keys(inventory ?? {})) {
    if (!id.startsWith('resource.root.')) continue;
    const amount = bigintInventory(inventory, id);
    if (amount <= 0n) continue;
    oldMaterials += amount;
    writeBigintInventory(inventory, id, 0n);
  }
  const oldOrigins = new Set();
  for (const root of Object.values(character?.buildFoundation?.roots ?? {}))
    for (const id of root?.knownOriginIds ?? []) oldOrigins.add(id);
  const tendonRefund = oldMaterials * 500n;
  const originRefund = BigInt(oldOrigins.size);
  const migrationOriginTier = spiritualRootOriginRealmTierV145(Math.max(1, state.ascensions + 1));
  const migrationOriginResourceId = spiritualRootOriginResourceIdV145(migrationOriginTier);
  if (tendonRefund > 0n) addInventoryBigIntV145(inventory, SPIRITUAL_ROOT_TENDON_RESOURCE_V145, tendonRefund);
  if (originRefund > 0n) addInventoryBigIntV145(inventory, migrationOriginResourceId, originRefund);
  state.legacyRefunded = true;
  if (character) character.spiritualRootV145 = state;
  return { state, refundedTendon: tendonRefund.toString(), refundedOrigin: originRefund.toString(), originResourceId: migrationOriginResourceId, originRealmTier: migrationOriginTier };
}

/**
 * Single Hunt source authority for V145. Settlement is O(1), including very large Săn Ảo batches.
 * First-clear Bosses grant one Bản Nguyên. Virtual farming grants one Bản Nguyên per 500 kills via deterministic meter.
 *
 * V146 integration note: this function is also the existing canonical fan-out seam reached by both real
 * and virtual Hunt rewards. It persists only the Alchemy Hunt meter; Alchemy itself owns Yêu Đan formulas.
 */
export function settleSpiritualRootHuntV145(character, inventory, context = {}) {
  const migration = settleLegacySpiritualRootMigrationV145(character, inventory);
  const state = cloneSpiritualRootStateV145(migration.state);
  const kills = Math.max(0, safeInt(context.kills));
  const majorRealmIndex = Math.max(0, safeInt(context.majorRealmIndex));
  const zone = Math.max(1, safeInt(context.zone, 1));
  const currentCost = spiritualRootNourishmentCostV145(state.level);
  const targetKillsPerLevel = BigInt(Math.max(40, Math.floor(70 + Math.sqrt(state.level) * 0.35)));
  const basePerKill = currentCost / targetKillsPerLevel > 0n ? currentCost / targetKillsPerLevel : 1n;
  const depthPct = BigInt(Math.min(260, 100 + majorRealmIndex * 5 + zone * 3));
  const dropBonusPct = spiritualRootMeridianBonusesV145(state).tendonDropBonusPct;
  const dropBasis = BigInt(Math.max(10000, Math.round(10000 * (1 + dropBonusPct / 100))));
  const tendon = basePerKill * BigInt(kills) * depthPct * dropBasis / 100n / 10000n;
  if (tendon > 0n) addInventoryBigIntV145(inventory, SPIRITUAL_ROOT_TENDON_RESOURCE_V145, tendon);
  const originRealmTier = spiritualRootOriginRealmTierV145(majorRealmIndex);
  const originResourceId = spiritualRootOriginResourceIdV145(originRealmTier);
  const currentMajorRealmIndex = Math.max(0, safeInt(context.currentMajorRealmIndex));
  const originSourceUnlocked = majorRealmIndex >= 1 && majorRealmIndex <= currentMajorRealmIndex;
  let origin = originSourceUnlocked && context.firstClear ? 1 : 0;
  if (originSourceUnlocked && context.countForOriginMeter && kills > 0) {
    const total = state.huntOriginProgress + kills;
    origin += Math.floor(total / SPIRITUAL_ROOT_VIRTUAL_ORIGIN_PITY_KILLS_V145);
    state.huntOriginProgress = total % SPIRITUAL_ROOT_VIRTUAL_ORIGIN_PITY_KILLS_V145;
  }
  if (origin > 0) addInventoryBigIntV145(inventory, originResourceId, BigInt(origin));

  const { state: alchemyHuntProgressV146, ...alchemyV146 } = settleAlchemyHuntRewardsV146(state.alchemyHuntV146, inventory, context);
  state.alchemyHuntV146 = alchemyHuntProgressV146;
  character.spiritualRootV145 = state;
  return { schema: 'spiritual-root-hunt.v145', kills, tendon: tendon.toString(), origin, originRealmTier, originResourceId, originSourceUnlocked, originProgress: state.huntOriginProgress, originPityKills: SPIRITUAL_ROOT_VIRTUAL_ORIGIN_PITY_KILLS_V145, firstClear: Boolean(context.firstClear), alchemyV146, migrationRefund: { tendon: migration.refundedTendon, origin: migration.refundedOrigin } };
}
