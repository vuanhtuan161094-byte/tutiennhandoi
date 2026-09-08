import {
  ALCHEMY_V146_FAMILIES,
  ALCHEMY_V146_LIVE_FAMILY_IDS,
  ALCHEMY_V146_MAJOR_REALM_COUNT,
  ALCHEMY_V146_QUALITY_NAMES,
  alchemyHerbResourceIdV146,
  alchemyIngredientNameV146,
  alchemyPillNameV146,
  alchemyPillResourceIdV146,
  alchemyRecipeAvailableV146,
  alchemyRecipeIngredientsV146,
  parseAlchemyPillResourceIdV146,
} from './alchemy-v146.js';
import {
  ALCHEMY_RANK_NAMES,
  ALCHEMY_TURN_NAMES,
  alchemyTurnExpRequirement,
  ensureAlchemyV112State,
  parseAlchemyPillResourceId,
} from './alchemy-v112.js';

export const ALCHEMY_PRODUCTION_V146_SCHEMA = 'alchemy-production.v146';
export const ALCHEMY_V146_MAX_FURNACES = 4;
export const ALCHEMY_V146_MASTERY_MAX = 1000;
export const ALCHEMY_V146_GARDEN_YIELD = Object.freeze({ mature: 4, old: 5, ancient: 7 });
export const ALCHEMY_V146_GARDEN_GROWTH_REAL_MINUTES_BY_BAND = Object.freeze([20, 30, 45, 60, 90, 120, 180, 240]);
export const ALCHEMY_V146_BASE_QUALITY_WEIGHTS = Object.freeze({ low: 65, mid: 27, high: 7, supreme: 1 });
export const ALCHEMY_V146_MASTER_QUALITY_WEIGHTS = Object.freeze({ low: 5, mid: 15, high: 50, supreme: 30 });

const BASE_CRAFT_MINUTES = Object.freeze({
  cultivation: 15,
  injury: 25,
  lifePower: 30,
  lifeBody: 30,
  lifeDefense: 30,
  buffPower: 35,
  buffGuard: 35,
  buffSpirit: 35,
  forbidden: 60,
  lifespan: 60,
  daoSuy: 45,
});
const ADVANCED_BATCH_FAMILIES = new Set(['forbidden', 'lifespan', 'daoSuy']);
const LEGACY_TIER_TO_MAJOR = Object.freeze([1, 4, 8, 11, 15, 18, 22, 25]);
const LEGACY_FAMILY_MAP = Object.freeze({
  cultivation: 'cultivation', injury: 'injury', lifespan: 'lifespan', daoSuy: 'daoSuy',
  lifePower: 'lifePower', lifeBody: 'lifeBody', lifeDefense: 'lifeDefense',
  buffPower: 'buffPower', buffGuard: 'buffGuard', buffSpirit: 'buffSpirit', forbidden: 'forbidden',
  daoPower: 'lifePower', daoBody: 'lifeBody', daoDefense: 'lifeDefense',
});
const QUALITY_ORDER = Object.freeze(['low', 'mid', 'high', 'supreme']);

const safeInt = (value, fallback = 0) => Math.max(0, Math.floor(Number.isFinite(Number(value)) ? Number(value) : fallback));
const safeNumber = (value, fallback = 0) => Math.max(0, Number.isFinite(Number(value)) ? Number(value) : fallback);
const clampMajor = value => Math.max(0, Math.min(ALCHEMY_V146_MAJOR_REALM_COUNT, safeInt(value)));
const clampRank = value => Math.max(1, Math.min(9, safeInt(value, 1)));
const clampTurn = value => Math.max(1, Math.min(9, safeInt(value, 1)));

function cloneCounterMap(value, max = Number.MAX_SAFE_INTEGER) {
  const out = {};
  for (const [key, raw] of Object.entries(value ?? {})) {
    const major = clampMajor(key);
    if (String(major) !== String(safeInt(key))) continue;
    out[String(major)] = Math.min(max, safeInt(raw));
  }
  return out;
}
function inventoryNumber(inventory, resourceId) {
  const raw = inventory?.[resourceId];
  if (typeof raw === 'bigint') return Number(raw > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : raw);
  return Math.max(0, Number(raw) || 0);
}
function addInventory(inventory, resourceId, amount) {
  const gain = safeInt(amount);
  if (gain <= 0) return inventoryNumber(inventory, resourceId);
  inventory[resourceId] = inventoryNumber(inventory, resourceId) + gain;
  return inventory[resourceId];
}
function spendInventory(inventory, resourceId, amount) {
  const need = safeInt(amount);
  const have = inventoryNumber(inventory, resourceId);
  if (have + 1e-9 < need) throw new Error(`Thiếu ${alchemyIngredientNameV146(resourceId) ?? resourceId}: ${Math.floor(have)}/${need}.`);
  inventory[resourceId] = have - need;
}
function xorshift32(seed) {
  let x = (safeInt(seed, 1) || 1) >>> 0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
    return x / 0x100000000;
  };
}
function qualityFromRoll(roll, weights) {
  let cursor = 0;
  for (const quality of QUALITY_ORDER) {
    cursor += Math.max(0, Number(weights[quality]) || 0) / 100;
    if (roll < cursor) return quality;
  }
  return 'supreme';
}
function highestQualityFromCounts(counts) {
  return [...QUALITY_ORDER].reverse().find(q => safeInt(counts?.[q]) > 0) ?? 'low';
}

export function createAlchemyProductionV146State() {
  return {
    schema: ALCHEMY_PRODUCTION_V146_SCHEMA,
    serial: 0,
    queues: [],
    garden: { plots: [], planted: 0, harvested: 0, herbsHarvested: 0, starterSeedUsedByMajor: {} },
    migration: { legacyQueuesRetired: false, essenceConverted: 0, legacyPillsConverted: 0 },
  };
}
export function cloneAlchemyProductionV146State(value) {
  const base = createAlchemyProductionV146State();
  const src = value ?? base;
  return {
    schema: ALCHEMY_PRODUCTION_V146_SCHEMA,
    serial: safeInt(src.serial),
    queues: (src.queues ?? []).map(q => ({
      id: String(q.id ?? ''), family: String(q.family ?? 'cultivation'), majorRealmIndex: clampMajor(q.majorRealmIndex),
      batchSize: Math.max(1, safeInt(q.batchSize, 1)), furnaceIndex: safeInt(q.furnaceIndex), seed: safeInt(q.seed, 1),
      startedWorldYear: safeNumber(q.startedWorldYear), completesWorldYear: safeNumber(q.completesWorldYear),
      durationRealSeconds: safeNumber(q.durationRealSeconds), requiredAlchemyRank: clampRank(q.requiredAlchemyRank),
      ingredientsSpent: (q.ingredientsSpent ?? []).map(x => ({ resourceId: String(x.resourceId ?? ''), quantity: safeInt(x.quantity) })),
    })).filter(q => ALCHEMY_V146_FAMILIES[q.family] && q.id),
    garden: {
      plots: (src.garden?.plots ?? []).map(p => ({
        slot: safeInt(p.slot), majorRealmIndex: clampMajor(p.majorRealmIndex), plantedWorldYear: safeNumber(p.plantedWorldYear),
        maturesWorldYear: safeNumber(p.maturesWorldYear), resourceId: alchemyHerbResourceIdV146(p.majorRealmIndex),
      })),
      planted: safeInt(src.garden?.planted), harvested: safeInt(src.garden?.harvested), herbsHarvested: safeInt(src.garden?.herbsHarvested),
      starterSeedUsedByMajor: cloneCounterMap(src.garden?.starterSeedUsedByMajor, 1),
    },
    migration: {
      legacyQueuesRetired: Boolean(src.migration?.legacyQueuesRetired),
      essenceConverted: safeInt(src.migration?.essenceConverted),
      legacyPillsConverted: safeInt(src.migration?.legacyPillsConverted),
    },
  };
}
export function ensureAlchemyProductionV146(container) {
  const legacy = ensureAlchemyV112State(container);
  legacy.telemetry ??= {};
  const production = cloneAlchemyProductionV146State(legacy.telemetry.v146Production);
  legacy.telemetry.v146Production = production;
  return production;
}

export function alchemyFamilyMasteryKeyV146(family) {
  if (!ALCHEMY_V146_FAMILIES[family]) throw new Error(`Họ Đan V146 không tồn tại: ${family}`);
  return `v146.family.${family}`;
}
export function ensureAlchemyFamilyMasteryProgressV146(alchemyState, family, legacyKnowledge) {
  const key = alchemyFamilyMasteryKeyV146(family);
  const inherited = Math.min(ALCHEMY_V146_MASTERY_MAX, safeInt(legacyKnowledge?.bestMasteryByRecipe?.[key]));
  const existing = alchemyState.recipeProgress?.[key] ?? {};
  const mastery = Math.max(inherited, Math.min(ALCHEMY_V146_MASTERY_MAX, safeInt(existing.mastery)));
  const progress = {
    mastery,
    specializationPoints: 0,
    specializationLevel: 0,
    batchesCompleted: safeInt(existing.batchesCompleted),
    pillsCrafted: safeInt(existing.pillsCrafted),
    highestQuality: ALCHEMY_V146_QUALITY_NAMES[existing.highestQuality] ? existing.highestQuality : 'low',
    qualityCounts: Object.fromEntries(QUALITY_ORDER.map(q => [q, safeInt(existing.qualityCounts?.[q])])),
  };
  alchemyState.recipeProgress ??= {};
  alchemyState.recipeProgress[key] = progress;
  return progress;
}
export function hydrateAlchemyFamilyMasteriesV146(alchemyState, legacyKnowledge) {
  for (const family of ALCHEMY_V146_LIVE_FAMILY_IDS) ensureAlchemyFamilyMasteryProgressV146(alchemyState, family, legacyKnowledge);
  return alchemyState;
}

export function alchemyRequiredRankV146(majorRealmIndex) {
  const major = clampMajor(majorRealmIndex);
  return Math.max(1, Math.min(9, 1 + Math.floor(major * 8 / ALCHEMY_V146_MAJOR_REALM_COUNT)));
}
export function alchemyFurnaceCountV146(rank) {
  const r = clampRank(rank);
  if (r >= 9) return 4;
  if (r >= 6) return 3;
  if (r >= 3) return 2;
  return 1;
}
export function alchemyAllowedBatchSizesV146(family) {
  if (!ALCHEMY_V146_FAMILIES[family]) return [];
  return ADVANCED_BATCH_FAMILIES.has(family) ? [1, 10] : [1, 10, 100];
}
export function alchemyBaseCraftMinutesV146(family) {
  return BASE_CRAFT_MINUTES[family] ?? 30;
}
export function alchemyQualityWeightsV146(mastery = 0, rank = 1) {
  const m = Math.max(0, Math.min(1, safeNumber(mastery) / ALCHEMY_V146_MASTERY_MAX));
  const rankShift = Math.max(0, clampRank(rank) - 1) / 8;
  const t = Math.min(1, m * 0.92 + rankShift * 0.08);
  const raw = Object.fromEntries(QUALITY_ORDER.map(q => [q, ALCHEMY_V146_BASE_QUALITY_WEIGHTS[q] * (1 - t) + ALCHEMY_V146_MASTER_QUALITY_WEIGHTS[q] * t]));
  const total = QUALITY_ORDER.reduce((sum, q) => sum + raw[q], 0) || 100;
  const out = Object.fromEntries(QUALITY_ORDER.map(q => [q, raw[q] / total * 100]));
  out.supreme = Math.min(30, out.supreme);
  const normalized = out.low + out.mid + out.high + out.supreme;
  if (Math.abs(normalized - 100) > 1e-9) out.high += 100 - normalized;
  return out;
}
export function alchemyCraftModifiersV146(mastery = 0, facilityModifiers = {}) {
  const m = Math.max(0, Math.min(1, safeNumber(mastery) / ALCHEMY_V146_MASTERY_MAX));
  const facilityTime = Math.max(0, Math.min(70, safeNumber(facilityModifiers.timeReductionPct)));
  const timeReductionPct = Math.min(85, facilityTime + 15 * m);
  const materialReductionPct = Math.min(20, 20 * m);
  return { timeReductionPct, materialReductionPct };
}
export function alchemyRecipeCostV146(family, majorRealmIndex, batchSize, mastery = 0) {
  const batch = Math.max(1, safeInt(batchSize, 1));
  const factor = 1 - Math.min(20, 20 * Math.max(0, Math.min(1, safeNumber(mastery) / ALCHEMY_V146_MASTERY_MAX))) / 100;
  return alchemyRecipeIngredientsV146(family, majorRealmIndex).map(x => ({
    ...x,
    quantity: Math.max(1, Math.ceil(x.quantity * batch * factor)),
  }));
}
export function alchemyRecipeCanCraftV146(inventory, family, majorRealmIndex, batchSize, mastery = 0) {
  return alchemyRecipeCostV146(family, majorRealmIndex, batchSize, mastery).every(x => inventoryNumber(inventory, x.resourceId) >= x.quantity);
}

function bandForMajor(majorRealmIndex) {
  const major = clampMajor(majorRealmIndex);
  return major <= 0 ? 1 : Math.max(1, Math.min(8, Math.ceil(major * 8 / ALCHEMY_V146_MAJOR_REALM_COUNT)));
}
export function alchemyGardenGrowthRealMinutesV146(majorRealmIndex, facilityLevel = 1) {
  const band = bandForMajor(majorRealmIndex);
  const facilityReduction = Math.min(27, Math.max(0, safeInt(facilityLevel, 1) - 1) * 3);
  return ALCHEMY_V146_GARDEN_GROWTH_REAL_MINUTES_BY_BAND[band - 1] * (1 - facilityReduction / 100);
}
export function alchemyGardenSlotCountV146(facilityLevel = 1) {
  return Math.max(3, Math.min(8, 2 + Math.max(1, safeInt(facilityLevel, 1))));
}
export function alchemyGardenStarterSeedAvailableV146(production, majorRealmIndex) {
  const major = clampMajor(majorRealmIndex);
  return safeInt(production?.garden?.starterSeedUsedByMajor?.[String(major)]) <= 0;
}
export function alchemyGardenPlotStatusV146(plot, worldYear) {
  const span = Math.max(1e-9, safeNumber(plot.maturesWorldYear) - safeNumber(plot.plantedWorldYear));
  const elapsed = Math.max(0, safeNumber(worldYear) - safeNumber(plot.plantedWorldYear));
  const ageMultiple = elapsed / span;
  const progressPct = Math.min(100, ageMultiple * 100);
  if (ageMultiple >= 4) return { stage: 'ancient', yield: ALCHEMY_V146_GARDEN_YIELD.ancient, ageMultiple, progressPct };
  if (ageMultiple >= 2) return { stage: 'old', yield: ALCHEMY_V146_GARDEN_YIELD.old, ageMultiple, progressPct };
  if (ageMultiple >= 1) return { stage: 'mature', yield: ALCHEMY_V146_GARDEN_YIELD.mature, ageMultiple, progressPct };
  return { stage: 'growing', yield: 0, ageMultiple, progressPct };
}
export function plantAlchemyGardenV146({ container, inventory, worldYear, worldYearsPerRealHour, facilityLevel = 1, slot = 0, majorRealmIndex = 0, currentMajorRealmIndex = 0 }) {
  const production = ensureAlchemyProductionV146(container);
  const major = clampMajor(majorRealmIndex);
  const current = clampMajor(currentMajorRealmIndex);
  const s = safeInt(slot);
  const slotCount = alchemyGardenSlotCountV146(facilityLevel);
  if (s >= slotCount) throw new Error(`Dược Viên hiện chỉ mở ${slotCount} ô.`);
  if (major > current) throw new Error('Không thể gieo Linh Thảo vượt đại cảnh đã đạt.');
  if (production.garden.plots.some(x => x.slot === s)) throw new Error(`Ô Dược Viên ${s + 1} đang có Linh Thảo.`);
  const resourceId = alchemyHerbResourceIdV146(major);
  const have = inventoryNumber(inventory, resourceId);
  let starterSeedUsed = false;
  if (have >= 1) inventory[resourceId] = have - 1;
  else if (alchemyGardenStarterSeedAvailableV146(production, major)) {
    production.garden.starterSeedUsedByMajor[String(major)] = 1;
    starterSeedUsed = true;
  } else throw new Error(`Cần 1 ${alchemyIngredientNameV146(resourceId)} làm Linh Chủng.`);
  const minutes = alchemyGardenGrowthRealMinutesV146(major, facilityLevel);
  const durationYears = minutes / 60 * Math.max(1e-9, safeNumber(worldYearsPerRealHour, 1));
  const plot = { slot: s, majorRealmIndex: major, resourceId, plantedWorldYear: safeNumber(worldYear), maturesWorldYear: safeNumber(worldYear) + durationYears };
  production.garden.plots.push(plot);
  production.garden.planted++;
  return { ...plot, starterSeedUsed, growthRealMinutes: minutes };
}
export function harvestAlchemyGardenV146({ container, inventory, worldYear, slot = 0 }) {
  const production = ensureAlchemyProductionV146(container);
  const s = safeInt(slot);
  const index = production.garden.plots.findIndex(x => x.slot === s);
  if (index < 0) throw new Error('Ô Dược Viên đang trống.');
  const plot = production.garden.plots[index];
  const status = alchemyGardenPlotStatusV146(plot, worldYear);
  if (status.stage === 'growing') throw new Error(`Linh Thảo mới sinh trưởng ${status.progressPct.toFixed(0)}%; chưa thể thu hoạch.`);
  const resourceId = alchemyHerbResourceIdV146(plot.majorRealmIndex);
  addInventory(inventory, resourceId, status.yield);
  production.garden.plots.splice(index, 1);
  production.garden.harvested++;
  production.garden.herbsHarvested += status.yield;
  return { plot: { ...plot }, stage: status.stage, yield: status.yield, resourceId, name: alchemyIngredientNameV146(resourceId) };
}

export function startAlchemyCraftV146({ container, inventory, family, majorRealmIndex, batchSize = 1, furnaceIndex = 0, seed = 1, worldYear = 0, worldYearsPerRealHour = 1, currentMajorRealmIndex = 0, facilityModifiers = {}, legacyKnowledge }) {
  const alchemy = ensureAlchemyV112State(container);
  const production = ensureAlchemyProductionV146(container);
  hydrateAlchemyFamilyMasteriesV146(alchemy, legacyKnowledge);
  const major = clampMajor(majorRealmIndex);
  const current = clampMajor(currentMajorRealmIndex);
  if (!alchemyRecipeAvailableV146(family, major)) throw new Error(`${ALCHEMY_V146_FAMILIES[family]?.name ?? family} chưa có Đan Phương ở đại cảnh này.`);
  if (major > current) throw new Error('Không thể luyện Đan vượt đại cảnh đã đạt.');
  const requiredAlchemyRank = alchemyRequiredRankV146(major);
  if (alchemy.rank < requiredAlchemyRank) throw new Error(`Cần Đan Đạo bậc ${requiredAlchemyRank} trước khi luyện Đan đại cảnh này.`);
  const batch = Math.max(1, safeInt(batchSize, 1));
  if (!alchemyAllowedBatchSizesV146(family).includes(batch)) throw new Error(`Mẻ ${batch} không hợp lệ cho ${ALCHEMY_V146_FAMILIES[family].name}.`);
  const furnaces = alchemyFurnaceCountV146(alchemy.rank);
  const furnace = safeInt(furnaceIndex);
  if (furnace >= furnaces) throw new Error(`Hiện chỉ mở ${furnaces} lò luyện.`);
  if (production.queues.some(q => q.furnaceIndex === furnace)) throw new Error(`Lò ${furnace + 1} đang bận.`);
  const progress = ensureAlchemyFamilyMasteryProgressV146(alchemy, family, legacyKnowledge);
  const ingredientsSpent = alchemyRecipeCostV146(family, major, batch, progress.mastery);
  for (const ingredient of ingredientsSpent) if (inventoryNumber(inventory, ingredient.resourceId) < ingredient.quantity)
    throw new Error(`Thiếu ${alchemyIngredientNameV146(ingredient.resourceId) ?? ingredient.resourceId}: ${Math.floor(inventoryNumber(inventory, ingredient.resourceId))}/${ingredient.quantity}.`);
  for (const ingredient of ingredientsSpent) spendInventory(inventory, ingredient.resourceId, ingredient.quantity);
  const modifiers = alchemyCraftModifiersV146(progress.mastery, facilityModifiers);
  const durationRealSeconds = alchemyBaseCraftMinutesV146(family) * 60 * Math.max(1, batch) * (1 - modifiers.timeReductionPct / 100);
  const durationYears = durationRealSeconds / 3600 * Math.max(1e-9, safeNumber(worldYearsPerRealHour, 1));
  const serial = ++production.serial;
  const job = {
    id: `alchemy.v146.job.${serial}`,
    family, majorRealmIndex: major, batchSize: batch, furnaceIndex: furnace, seed: safeInt(seed, serial),
    startedWorldYear: safeNumber(worldYear), completesWorldYear: safeNumber(worldYear) + durationYears,
    durationRealSeconds, requiredAlchemyRank, ingredientsSpent: ingredientsSpent.map(x => ({ resourceId: x.resourceId, quantity: x.quantity })),
  };
  production.queues.push(job);
  return { ...job, name: alchemyPillNameV146(family, major, 'low').replace(` · ${ALCHEMY_V146_QUALITY_NAMES.low}`, ''), modifiers };
}

function craftExpEfficiency(rank, requiredRank) {
  const gap = Math.max(0, clampRank(rank) - clampRank(requiredRank));
  if (gap <= 1) return 1;
  if (gap === 2) return .5;
  if (gap === 3) return .25;
  return .1;
}
function grantAlchemyCraftExpV146(alchemy, requiredRank, batchSize) {
  const gain = Math.max(1, Math.round(Math.max(1, safeInt(batchSize, 1)) * 20 * craftExpEfficiency(alchemy.rank, requiredRank)));
  alchemy.turnExp = safeNumber(alchemy.turnExp) + gain;
  if (alchemy.rank >= 9 && alchemy.turn >= 9) alchemy.turnExp = Math.min(alchemy.turnExp, alchemyTurnExpRequirement(9, 9));
  return gain;
}
export function syncAlchemyProductionV146({ container, inventory, worldYear = 0, legacyKnowledge } = {}) {
  const alchemy = ensureAlchemyV112State(container);
  const production = ensureAlchemyProductionV146(container);
  hydrateAlchemyFamilyMasteriesV146(alchemy, legacyKnowledge);
  const done = [];
  for (const job of [...production.queues].sort((a, b) => a.completesWorldYear - b.completesWorldYear || a.furnaceIndex - b.furnaceIndex)) {
    if (job.completesWorldYear > safeNumber(worldYear) + 1e-9) continue;
    const progress = ensureAlchemyFamilyMasteryProgressV146(alchemy, job.family, legacyKnowledge);
    const weights = alchemyQualityWeightsV146(progress.mastery, alchemy.rank);
    const rng = xorshift32(job.seed ^ safeInt(job.majorRealmIndex * 0x9e3779b1) ^ safeInt(job.batchSize * 131));
    const qualityCounts = { low: 0, mid: 0, high: 0, supreme: 0 };
    for (let i = 0; i < job.batchSize; i++) qualityCounts[qualityFromRoll(rng(), weights)]++;
    for (const quality of QUALITY_ORDER) if (qualityCounts[quality] > 0)
      addInventory(inventory, alchemyPillResourceIdV146(job.family, job.majorRealmIndex, quality), qualityCounts[quality]);
    const masteryGain = Math.max(1, Math.ceil(Math.sqrt(job.batchSize) * 2));
    progress.mastery = Math.min(ALCHEMY_V146_MASTERY_MAX, progress.mastery + masteryGain);
    progress.batchesCompleted++;
    progress.pillsCrafted += job.batchSize;
    for (const quality of QUALITY_ORDER) progress.qualityCounts[quality] = safeInt(progress.qualityCounts[quality]) + qualityCounts[quality];
    progress.highestQuality = highestQualityFromCounts(progress.qualityCounts);
    const alchemyExpGained = grantAlchemyCraftExpV146(alchemy, job.requiredAlchemyRank, job.batchSize);
    production.queues = production.queues.filter(x => x.id !== job.id);
    done.push({
      schema: ALCHEMY_PRODUCTION_V146_SCHEMA, jobId: job.id, family: job.family, majorRealmIndex: job.majorRealmIndex,
      recipeId: `alchemy.v146.${job.family}.m${job.majorRealmIndex}`,
      recipeName: alchemyPillNameV146(job.family, job.majorRealmIndex, 'low').replace(` · ${ALCHEMY_V146_QUALITY_NAMES.low}`, ''),
      outputCount: job.batchSize, qualities: qualityCounts, masteryAfter: progress.mastery, specializationAfter: 0, alchemyExpGained,
    });
  }
  return done;
}

export function alchemyPromotionStatusV146(alchemyState) {
  const rank = clampRank(alchemyState?.rank), turn = clampTurn(alchemyState?.turn);
  if (rank >= 9 && turn >= 9) return { ready: false, maxed: true, reasons: ['Đã đạt Đan Đế · Cửu Chuyển.'] };
  const required = alchemyTurnExpRequirement(rank, turn);
  const current = safeNumber(alchemyState?.turnExp);
  return { ready: current + 1e-9 >= required, maxed: false, required, current, reasons: current >= required ? [] : [`Cần ${Math.ceil(required - current)} EXP Đan Đạo.`] };
}
export function promoteAlchemyV146(alchemyState) {
  const status = alchemyPromotionStatusV146(alchemyState);
  if (!status.ready) throw new Error(status.reasons[0] ?? 'Chưa đủ điều kiện đột phá Đan Đạo.');
  const from = { rank: clampRank(alchemyState.rank), turn: clampTurn(alchemyState.turn) };
  const cost = alchemyTurnExpRequirement(from.rank, from.turn);
  alchemyState.turnExp = Math.max(0, safeNumber(alchemyState.turnExp) - cost);
  if (from.turn < 9) alchemyState.turn = from.turn + 1;
  else { alchemyState.rank = Math.min(9, from.rank + 1); alchemyState.turn = 1; }
  alchemyState.examReady = false;
  return {
    from, to: { rank: alchemyState.rank, turn: alchemyState.turn },
    rankName: ALCHEMY_RANK_NAMES[alchemyState.rank - 1], turnName: ALCHEMY_TURN_NAMES[alchemyState.turn - 1],
    expRemaining: alchemyState.turnExp,
  };
}

function refundLegacyQueues(alchemy, inventory) {
  let refunded = 0;
  for (const job of alchemy.queues ?? []) {
    for (const ingredient of job.ingredientsSpent ?? []) {
      const resourceId = String(ingredient.resourceId ?? '');
      const quantity = safeInt(ingredient.quantity);
      if (!resourceId || quantity <= 0) continue;
      addInventory(inventory, resourceId, quantity);
      refunded += quantity;
    }
  }
  alchemy.queues = [];
  return refunded;
}
function convertLegacyEssence(inventory, currentMajorRealmIndex) {
  const oldId = 'resource.alchemy_essence';
  const amount = safeInt(inventory?.[oldId]);
  if (amount <= 0) { if (Object.prototype.hasOwnProperty.call(inventory ?? {}, oldId)) delete inventory[oldId]; return 0; }
  const herbGain = Math.max(1, Math.ceil(amount / 10));
  addInventory(inventory, alchemyHerbResourceIdV146(clampMajor(currentMajorRealmIndex)), herbGain);
  delete inventory[oldId];
  return amount;
}
function legacyPillTarget(desc, currentMajorRealmIndex) {
  const family = LEGACY_FAMILY_MAP[desc.family];
  if (!family) return undefined;
  let major = LEGACY_TIER_TO_MAJOR[Math.max(1, Math.min(8, safeInt(desc.realmTier, 1))) - 1];
  if (family === 'daoSuy') major = Math.max(11, major);
  if (!alchemyRecipeAvailableV146(family, major)) return undefined;
  if (major > clampMajor(currentMajorRealmIndex)) return undefined;
  return { family, majorRealmIndex: major, quality: desc.quality };
}
export function migrateAlchemyV112ToV146({ container, inventory, currentMajorRealmIndex = 0 } = {}) {
  const alchemy = ensureAlchemyV112State(container);
  const production = ensureAlchemyProductionV146(container);
  let queuesRefunded = 0;
  if (!production.migration.legacyQueuesRetired) {
    queuesRefunded = refundLegacyQueues(alchemy, inventory);
    production.migration.legacyQueuesRetired = true;
  }
  const essenceConverted = convertLegacyEssence(inventory, currentMajorRealmIndex);
  production.migration.essenceConverted += essenceConverted;
  let legacyPillsConverted = 0;
  for (const [resourceId, raw] of Object.entries({ ...(inventory ?? {}) })) {
    if (parseAlchemyPillResourceIdV146(resourceId)) continue;
    const desc = parseAlchemyPillResourceId(resourceId);
    const count = safeInt(raw);
    if (!desc || count <= 0) continue;
    const target = legacyPillTarget(desc, currentMajorRealmIndex);
    if (!target) continue;
    const targetId = alchemyPillResourceIdV146(target.family, target.majorRealmIndex, target.quality);
    addInventory(inventory, targetId, count);
    delete inventory[resourceId];
    legacyPillsConverted += count;
  }
  production.migration.legacyPillsConverted += legacyPillsConverted;
  // V146 has automatic recipe unlocks. Old recipe research data remains archival only; no live queue or specialization can consume it.
  alchemy.knownRecipeIds = [];
  for (const [key, progress] of Object.entries(alchemy.recipeProgress ?? {})) {
    if (!key.startsWith('v146.family.')) continue;
    progress.specializationPoints = 0;
    progress.specializationLevel = 0;
  }
  return { schema: ALCHEMY_PRODUCTION_V146_SCHEMA, queuesRefunded, essenceConverted, legacyPillsConverted, production };
}
