import { SeededRng } from './rng.js';
import { PILL_QUALITY_BASE_WEIGHTS, PILL_QUALITY_LABEL, PILL_QUALITY_MULTIPLIER } from './recovery.js';
import { clampEconomyRealmTier, economyMaterialDefinition, economyMaterialResourceId, heavenlyTreasureQuantity, isHeavenlyTreasureResourceId, spendHeavenlyTreasure } from './economy-v111.js';
export const ALCHEMY_V112_SCHEMA = 'alchemy.v1.12';
export const ALCHEMY_RANK_NAMES = ['Đan Đồ', 'Đan Sư', 'Đại Đan Sư', 'Đan Tông', 'Đan Vương', 'Đan Hoàng', 'Đan Tôn', 'Đan Thánh', 'Đan Đế'];
export const ALCHEMY_TURN_NAMES = ['Nhất Chuyển', 'Nhị Chuyển', 'Tam Chuyển', 'Tứ Chuyển', 'Ngũ Chuyển', 'Lục Chuyển', 'Thất Chuyển', 'Bát Chuyển', 'Cửu Chuyển'];
/** F2: total equivalent-craft EXP needed to traverse all nine Chuyển of each major Dan Dao rank. */
export const ALCHEMY_RANK_TOTAL_EXP = [5_000, 10_000, 20_000, 40_000, 80_000, 160_000, 320_000, 640_000, 1_280_000];
export const ALCHEMY_TURN_EXP_SHARE = [.06, .07, .08, .09, .10, .11, .13, .15, .21];
export const ALCHEMY_SPECIALIZATION_THRESHOLD_BY_TIER = [500_000, 700_000, 1_000_000, 1_400_000, 2_000_000, 2_750_000, 3_750_000, 5_000_000];
export const ALCHEMY_PERMANENT_PILL_CAP_AT_RANK9 = [0, 3, 6, 10, 15, 22, 30, 40, 55];
export const ALCHEMY_TEMP_STAT_PILL_CAP_PER_TIER = 50;
export const ALCHEMY_CULTIVATION_PILL_CAP_PER_MAJOR_REALM = 20;
/** V129: Tĩnh Suy Đan can soften Đạo Suy, but cannot be spammed as a permanent reset. */
export const ALCHEMY_DAO_SUY_PILL_CAP_PER_MAJOR_REALM = 2;
export const ALCHEMY_BUFF_PILL_DAILY_CAP = 5;
export const ALCHEMY_BUFF_DURATION_REAL_MINUTES = 30;
export const ALCHEMY_LIFESPAN_PILL_CAP_PCT = .10;
export const ALCHEMY_GLOBAL_TIME_REDUCTION_CAP_PCT = 85;
export const ALCHEMY_YIELD_BASE_PCT = 90;
export const ALCHEMY_YIELD_CAP_PCT = 120;
export const ALCHEMY_MATERIAL_EFFICIENCY_CAP_PCT = 30;
export const ALCHEMY_MASTERY_MAX = 1000;
const QUALITY_ORDER = ['low', 'mid', 'high', 'supreme'];
const QUALITY_SCORE = { low: 1, mid: 2, high: 5, supreme: 10 };
const QUALITY_RANK = { low: 0, mid: 1, high: 2, supreme: 3 };
const TEMP_STAT_BASE_BY_TIER = [1, 2, 3, 5, 8, 13, 19, 28];
const CULTIVATION_PILL_PCT_BY_TIER = [1, .75, .55, .40, .28, .18, .10, .06];
const PERMANENT_STAT_BY_QUALITY = { low: 1, mid: 1, high: 2, supreme: 3 };
const BIG_BATCH_TIME_MULTIPLIER = { 1: 1, 5: 3, 10: 5 };
const NORMAL_BATCH_TIME_MULTIPLIER = { 1: 1, 10: 4, 100: 12 };
const ADVANCED_BATCH_TIME_MULTIPLIER = { 1: 1, 10: 4 };
/** Locked A2 recipe-family time: same family uses same base time at every realm tier. */
export const ALCHEMY_BASE_CRAFT_MINUTES = {
    cultivation: 15, injury: 25,
    lifePower: 30, lifeBody: 30, lifeDefense: 30,
    buffPower: 35, buffGuard: 35, buffSpirit: 35, forbidden: 60,
    daoSuy: 45, lifespan: 60,
    daoPower: 180, daoBody: 180, daoDefense: 180,
};
const FAMILY_LABEL = {
    cultivation: 'Tu Vi Đan', daoSuy: 'Tĩnh Suy Đan', injury: 'Trị Thương Đan', lifespan: 'Thọ Nguyên Đan',
    lifePower: 'Công Lực Đan', lifeBody: 'Thể Phách Đan', lifeDefense: 'Hộ Thể Đan', buffPower: 'Chiến Ý Đan', buffGuard: 'Kim Cương Đan', buffSpirit: 'Tụ Nguyên Đan', forbidden: 'Bạo Huyết Cấm Đan', daoPower: 'Công Lực Đạo Đan', daoBody: 'Thể Phách Đạo Đan', daoDefense: 'Hộ Thể Đạo Đan',
};
function cloneQualityCounts(value) { return { low: Math.max(0, Math.floor(value?.low ?? 0)), mid: Math.max(0, Math.floor(value?.mid ?? 0)), high: Math.max(0, Math.floor(value?.high ?? 0)), supreme: Math.max(0, Math.floor(value?.supreme ?? 0)) }; }
export function createAlchemyRecipeProgress(initialMastery = 0) { return { mastery: Math.max(0, Math.min(ALCHEMY_MASTERY_MAX, initialMastery)), specializationPoints: 0, specializationLevel: 0, batchesCompleted: 0, pillsCrafted: 0, highestQuality: 'low', qualityCounts: cloneQualityCounts() }; }
export function cloneAlchemyRecipeProgress(value) { const p = createAlchemyRecipeProgress(value?.mastery ?? 0); p.specializationPoints = Math.max(0, Number(value?.specializationPoints) || 0); p.specializationLevel = Math.max(0, Math.min(100, Math.floor(Number(value?.specializationLevel) || 0))); p.batchesCompleted = Math.max(0, Math.floor(Number(value?.batchesCompleted) || 0)); p.pillsCrafted = Math.max(0, Math.floor(Number(value?.pillsCrafted) || 0)); p.highestQuality = QUALITY_ORDER.includes(value?.highestQuality) ? value.highestQuality : 'low'; p.qualityCounts = cloneQualityCounts(value?.qualityCounts); return p; }
export function createAlchemyV112State() { return { schema: ALCHEMY_V112_SCHEMA, rank: 1, turn: 1, turnExp: 0, examReady: false, knownRecipeIds: ['cultivation.t1', 'injury.t1'], recipeProgress: {}, queues: [], serial: 0, garden: { plots: [], planted: 0, harvested: 0, herbsHarvested: 0 }, life: { temporaryStatPillsUsedByTier: {}, cultivationPillsUsedByMajorRealm: {}, daoSuyPillsUsedByMajorRealm: {}, buffDaily: { dayKey: '', used: 0 }, lifeStatBonus: emptyAlchemyAllocation(), permanentPillsUsed: 0, lifespanPillBonusYears: 0, maxBaseLifespanObserved: 0 }, telemetry: { batchesStarted: 0, batchesCompleted: 0, nominalPillsStarted: 0, pillsProduced: 0, supremePillsProduced: 0, materialsSpent: 0, treasuresSpent: 0, alchemyExpEarned: 0, permanentPillsConsumed: 0, temporaryStatPillsConsumed: 0, lifespanPillsConsumed: 0, cultivationPillsConsumed: 0, daoSuyPillsConsumed: 0, injuryPillsConsumed: 0, buffPillsConsumed: 0, recipesLearned: 0 } }; }
export function cloneAlchemyV112State(value) { if (!value)
    return undefined; const base = createAlchemyV112State(), rank = Math.max(1, Math.min(9, Math.floor(Number(value.rank) || 1))); const known = Array.isArray(value.knownRecipeIds) ? [...new Set(value.knownRecipeIds.map(String).filter(id => /^.+\.t[1-8]$/.test(id)))] : alchemyRecipeCatalogue().filter(r => r.requiredAlchemyRank <= rank).map(r => r.id); return { schema: ALCHEMY_V112_SCHEMA, rank, turn: Math.max(1, Math.min(9, Math.floor(Number(value.turn) || 1))), turnExp: Math.max(0, Number(value.turnExp) || 0), examReady: Boolean(value.examReady), knownRecipeIds: known, recipeProgress: Object.fromEntries(Object.entries(value.recipeProgress ?? {}).map(([k, v]) => [k, cloneAlchemyRecipeProgress(v)])), queues: (value.queues ?? []).map(j => ({ ...j, ingredientsSpent: j.ingredientsSpent.map(x => ({ ...x })), snapshot: { ...j.snapshot } })), serial: Math.max(0, Math.floor(Number(value.serial) || 0)), garden: { plots: (value.garden?.plots ?? []).map(x => ({ slot: Math.max(0, Math.floor(Number(x.slot) || 0)), variant: (['qi', 'meridian', 'purity'].includes(String(x.variant)) ? x.variant : 'qi'), realmTier: clampEconomyRealmTier(x.realmTier), plantedWorldYear: Number(x.plantedWorldYear) || 0, maturesWorldYear: Number(x.maturesWorldYear) || 0 })), planted: Math.max(0, Math.floor(Number(value.garden?.planted) || 0)), harvested: Math.max(0, Math.floor(Number(value.garden?.harvested) || 0)), herbsHarvested: Math.max(0, Math.floor(Number(value.garden?.herbsHarvested) || 0)) }, life: { temporaryStatPillsUsedByTier: { ...(value.life?.temporaryStatPillsUsedByTier ?? {}) }, cultivationPillsUsedByMajorRealm: { ...(value.life?.cultivationPillsUsedByMajorRealm ?? {}) }, daoSuyPillsUsedByMajorRealm: { ...(value.life?.daoSuyPillsUsedByMajorRealm ?? {}) }, buffDaily: { dayKey: String(value.life?.buffDaily?.dayKey ?? ''), used: Math.max(0, Math.floor(Number(value.life?.buffDaily?.used) || 0)) }, activeBuff: value.life?.activeBuff ? { ...value.life.activeBuff } : undefined, lifeStatBonus: { ...emptyAlchemyAllocation(), ...(value.life?.lifeStatBonus ?? {}) }, permanentPillsUsed: Math.max(0, Math.floor(Number(value.life?.permanentPillsUsed) || 0)), lifespanPillBonusYears: Math.max(0, Number(value.life?.lifespanPillBonusYears) || 0), maxBaseLifespanObserved: Math.max(0, Number(value.life?.maxBaseLifespanObserved) || 0) }, telemetry: { ...base.telemetry, ...(value.telemetry ?? {}) } }; }
export function ensureAlchemyV112State(container) { return container.v112Alchemy ?? (container.v112Alchemy = createAlchemyV112State()); }
export function alchemyRecipeKey(family, realmTier) { return `${family}.t${clampEconomyRealmTier(realmTier)}`; }
export function alchemyPillResourceId(family, realmTier, quality) {
    const tier = clampEconomyRealmTier(realmTier);
    return `resource.pill.alchemy.${family}.t${tier}.${quality}`;
}
export function parseAlchemyPillResourceId(resourceId) {
    const m = /^resource\.pill\.alchemy\.(cultivation|daoSuy|injury|lifespan|lifePower|lifeBody|lifeDefense|buffPower|buffGuard|buffSpirit|forbidden|daoPower|daoBody|daoDefense)\.t([1-8])\.(low|mid|high|supreme)$/.exec(resourceId);
    if (!m)
        return undefined;
    return { family: m[1], realmTier: Number(m[2]), quality: m[3] };
}
export function alchemyPillName(family, realmTier, quality) { return `${FAMILY_LABEL[family]} · T${clampEconomyRealmTier(realmTier)} · ${PILL_QUALITY_LABEL[quality]}`; }
function material(family, tier, variant, quantity) { return { kind: 'material', resourceId: economyMaterialResourceId(family, tier, variant), quantity }; }
function treasure(resourceId, quantity = 1) { return { kind: 'treasure', resourceId, quantity }; }
function recipeClass(family) { return ['forbidden', 'daoPower', 'daoBody', 'daoDefense'].includes(family) ? 'great' : ['daoSuy', 'lifespan'].includes(family) ? 'advanced' : 'ordinary'; }
function batchSizes(family) { return recipeClass(family) === 'great' ? [1, 5, 10] : recipeClass(family) === 'advanced' ? [1, 10] : [1, 10, 100]; }
function requiredRankFor(family, tier) { const offset = recipeClass(family) === 'ordinary' ? 0 : recipeClass(family) === 'advanced' ? 1 : 2; return Math.min(9, tier + offset); }
function ingredientsFor(family, tier) {
    switch (family) {
        case 'cultivation': return [material('herb', tier, 'qi', 4)];
        case 'injury': return [material('herb', tier, 'meridian', 7), material('beastCore', tier, 'blood', 1)];
        case 'lifePower': return [material('herb', tier, 'qi', 6), material('beastCore', tier, 'beast', 1)];
        case 'lifeBody': return [material('herb', tier, 'meridian', 6), material('beastCore', tier, 'blood', 1)];
        case 'lifeDefense': return [material('ore', tier, 'spiritCrystal', 6), material('beastCore', tier, 'elemental', 1)];
        case 'buffPower': return [material('herb', tier, 'qi', 8), material('beastCore', tier, 'beast', 2)];
        case 'buffGuard': return [material('herb', tier, 'meridian', 8), material('ore', tier, 'spiritCrystal', 3)];
        case 'buffSpirit': return [material('herb', tier, 'purity', 8), material('beastCore', tier, 'elemental', 2)];
        case 'forbidden': return [material('herb', tier, 'qi', 16), material('beastCore', tier, 'blood', 5), material('beastCore', tier, 'elemental', 3)];
        case 'daoSuy': return [material('herb', tier, 'purity', 10), material('beastCore', tier, 'elemental', 2)];
        case 'lifespan': return [material('herb', tier, 'meridian', 12), material('beastCore', tier, 'blood', 2), material('herb', tier, 'purity', 1)];
        case 'daoPower': return [material('herb', tier, 'qi', 25), material('beastCore', tier, 'elemental', 8), treasure('resource.heavenly.five_element_jade', 1)];
        case 'daoBody': return [material('herb', tier, 'meridian', 25), material('beastCore', tier, 'blood', 8), treasure('resource.heavenly.void_lotus', 1)];
        case 'daoDefense': return [material('ore', tier, 'spiritCrystal', 25), material('beastCore', tier, 'elemental', 8), treasure('resource.heavenly.five_element_jade', 1)];
    }
}
export function alchemyRecipeDefinition(family, realmTier) { const tier = clampEconomyRealmTier(realmTier); return { id: alchemyRecipeKey(family, tier), family, realmTier: tier, name: `${FAMILY_LABEL[family]} · T${tier}`, recipeClass: recipeClass(family), requiredAlchemyRank: requiredRankFor(family, tier), baseCraftMinutes: ALCHEMY_BASE_CRAFT_MINUTES[family], allowedBatchSizes: batchSizes(family), ingredients: ingredientsFor(family, tier) }; }
export function alchemyRecipeCatalogue() { const f = Object.keys(FAMILY_LABEL); const out = []; for (const family of f)
    for (let tier = 1; tier <= 8; tier++)
        out.push(alchemyRecipeDefinition(family, tier)); return out; }
export function isAlchemyRecipeKnown(state, recipeId) { return state.knownRecipeIds.includes(recipeId); }
export function alchemyRecipeResearchCost(recipe) { const cls = recipe.recipeClass === 'ordinary' ? 0 : recipe.recipeClass === 'advanced' ? 1 : 2; return { alchemyEssence: Math.max(1, 2 + recipe.realmTier * (1 + cls) + cls * 3) }; }
export function learnAlchemyRecipeV85(input) {
    const recipe = alchemyRecipeCatalogue().find(x => x.id === input.recipeId);
    if (!recipe)
        throw new Error(`Không tồn tại Đan Phương: ${input.recipeId}.`);
    if (input.state.rank < recipe.requiredAlchemyRank)
        throw new Error(`${recipe.name} cần ${ALCHEMY_RANK_NAMES[recipe.requiredAlchemyRank - 1]}.`);
    if (isAlchemyRecipeKnown(input.state, recipe.id))
        throw new Error(`${recipe.name} đã được lĩnh ngộ.`);
    const cost = alchemyRecipeResearchCost(recipe), id = 'resource.alchemy_essence', available = Math.max(0, Math.floor(input.inventory[id] ?? 0));
    if (available < cost.alchemyEssence)
        throw new Error(`Cần ${cost.alchemyEssence} Dược Tính Tinh Hoa để lĩnh ngộ ${recipe.name}.`);
    input.inventory[id] = available - cost.alchemyEssence;
    input.state.knownRecipeIds.push(recipe.id);
    input.state.telemetry.recipesLearned++;
    return { recipeId: recipe.id, cost };
}
export function alchemyFurnaceCount(rank) { return Math.max(2, Math.min(18, Math.floor(rank) * 2)); }
export function alchemyTurnExpRequirement(rank, turn) { const r = Math.max(1, Math.min(9, Math.floor(rank))), t = Math.max(1, Math.min(9, Math.floor(turn))); return Math.max(1, Math.round(ALCHEMY_RANK_TOTAL_EXP[r - 1] * ALCHEMY_TURN_EXP_SHARE[t - 1])); }
export function permanentPillCap(rank, turn, flatBonus = 0) { const r = Math.max(1, Math.min(9, Math.floor(rank))), t = Math.max(1, Math.min(9, Math.floor(turn))); const target = ALCHEMY_PERMANENT_PILL_CAP_AT_RANK9[r - 1], prev = r <= 1 ? 0 : ALCHEMY_PERMANENT_PILL_CAP_AT_RANK9[r - 2]; return Math.max(0, Math.floor(prev + (target - prev) * t / 9) + Math.floor(flatBonus)); }
export function alchemyRankTurnModifiers(rank, turn) { const r = Math.max(1, Math.min(9, rank)), t = Math.max(1, Math.min(9, turn)); const major = r - 1, minor = t - 1; return { yieldPct: major * 1 + minor * .10, timeReductionPct: major * 1.5 + minor * .20, materialEfficiencyPct: major * .75 + minor * .08, qualityWeightBonus: major * 2.5 + minor * .4, masteryGainPct: major * 3 + minor * .5, expGainPct: major * 3 + minor * .5, permanentPillCapFlat: 0, masteryRetentionPct: 0 }; }
export function recipeProgressModifiers(progress) { const m = Math.max(0, Math.min(1, progress.mastery / ALCHEMY_MASTERY_MAX)), ct = Math.max(0, Math.min(1, progress.specializationLevel / 100)); return { yieldPct: m * 8 + ct * 12, timeReductionPct: m * 20 + ct * 40, materialEfficiencyPct: m * 5 + ct * 10, qualityWeightBonus: m * 18 + ct * 20, masteryGainPct: m * 5, expGainPct: m * 5 }; }
function addMods(a, b) { return { yieldPct: a.yieldPct + (b.yieldPct ?? 0), timeReductionPct: a.timeReductionPct + (b.timeReductionPct ?? 0), materialEfficiencyPct: a.materialEfficiencyPct + (b.materialEfficiencyPct ?? 0), qualityWeightBonus: a.qualityWeightBonus + (b.qualityWeightBonus ?? 0), masteryGainPct: a.masteryGainPct + (b.masteryGainPct ?? 0), expGainPct: a.expGainPct + (b.expGainPct ?? 0), permanentPillCapFlat: a.permanentPillCapFlat + (b.permanentPillCapFlat ?? 0), masteryRetentionPct: a.masteryRetentionPct + (b.masteryRetentionPct ?? 0) }; }
export function alchemyCraftSnapshot(state, progress, global = {}) { let m = alchemyRankTurnModifiers(state.rank, state.turn); m = addMods(m, recipeProgressModifiers(progress)); m = addMods(m, global); return { alchemyRank: state.rank, alchemyTurn: state.turn, mastery: progress.mastery, specializationLevel: progress.specializationLevel, yieldPct: Math.min(ALCHEMY_YIELD_CAP_PCT, ALCHEMY_YIELD_BASE_PCT + m.yieldPct), timeReductionPct: Math.min(ALCHEMY_GLOBAL_TIME_REDUCTION_CAP_PCT, Math.max(0, m.timeReductionPct)), materialEfficiencyPct: Math.min(ALCHEMY_MATERIAL_EFFICIENCY_CAP_PCT, Math.max(0, m.materialEfficiencyPct)), qualityWeightBonus: Math.max(0, m.qualityWeightBonus), masteryGainPct: Math.max(0, m.masteryGainPct), expGainPct: Math.max(0, m.expGainPct) }; }
function batchTimeMultiplier(recipe, batchSize) { const table = recipe.recipeClass === 'great' ? BIG_BATCH_TIME_MULTIPLIER : recipe.recipeClass === 'advanced' ? ADVANCED_BATCH_TIME_MULTIPLIER : NORMAL_BATCH_TIME_MULTIPLIER; const value = table[batchSize]; if (value === undefined)
    throw new Error(`Batch ${batchSize} không hợp lệ cho ${recipe.name}.`); return value; }
export function alchemyCraftDurationRealSeconds(recipe, batchSize, snapshot) { return Math.max(1, recipe.baseCraftMinutes * 60 * batchTimeMultiplier(recipe, batchSize) * (1 - snapshot.timeReductionPct / 100)); }
function effectiveIngredients(recipe, batchSize, snapshot) { return recipe.ingredients.map(x => { if (x.kind === 'treasure')
    return { ...x, quantity: x.quantity * batchSize }; const raw = x.quantity * batchSize * (1 - snapshot.materialEfficiencyPct / 100); return { ...x, quantity: Math.max(1, Math.ceil(raw)) }; }); }
export function alchemyIngredientAvailability(container, inventory, ingredients) { return ingredients.map(x => { const available = x.kind === 'treasure' && isHeavenlyTreasureResourceId(x.resourceId) ? heavenlyTreasureQuantity(container, inventory, x.resourceId) : Math.max(0, Math.floor(inventory[x.resourceId] ?? 0)); return { ...x, available, missing: Math.max(0, x.quantity - available) }; }); }
export function spendAlchemyIngredients(container, inventory, ingredients) { const check = alchemyIngredientAvailability(container, inventory, ingredients); const missing = check.filter(x => x.missing > 0); if (missing.length)
    throw new Error(`Thiếu nguyên liệu: ${missing.map(x => `${economyMaterialDefinition(x.resourceId)?.name ?? x.resourceId} thiếu ${x.missing}`).join(', ')}.`); for (const x of ingredients) {
    if (x.kind === 'treasure' && isHeavenlyTreasureResourceId(x.resourceId)) {
        if (!spendHeavenlyTreasure(container, inventory, x.resourceId, x.quantity))
            throw new Error(`Không thể tiêu ${x.resourceId}.`);
    }
    else
        inventory[x.resourceId] = Math.max(0, Math.floor(inventory[x.resourceId] ?? 0) - x.quantity);
} }
function inheritedMasteryForRecipe(state, family, tier, legacy, retentionPct = 0) { let inherited = 0; if (tier > 1) {
    const prev = state.recipeProgress[alchemyRecipeKey(family, tier - 1)];
    if (prev)
        inherited = Math.max(inherited, prev.mastery * .20);
} if (legacy) {
    const exact = Math.max(0, legacy.bestMasteryByRecipe[alchemyRecipeKey(family, tier)] ?? 0);
    inherited = Math.max(inherited, exact * Math.max(0, retentionPct) / 100);
} return Math.min(ALCHEMY_MASTERY_MAX, Math.floor(inherited)); }
export function ensureAlchemyRecipeProgress(state, family, tier, legacy, retentionPct = 0) { const key = alchemyRecipeKey(family, tier); let progress = state.recipeProgress[key]; if (!progress) {
    progress = createAlchemyRecipeProgress(inheritedMasteryForRecipe(state, family, tier, legacy, retentionPct));
    state.recipeProgress[key] = progress;
} return progress; }
export function startAlchemyCraft(input) {
    const state = ensureAlchemyV112State(input.container), recipe = alchemyRecipeDefinition(input.family, input.realmTier), furnace = Math.max(0, Math.floor(input.furnaceIndex));
    if (!isAlchemyRecipeKnown(state, recipe.id))
        throw new Error(`Chưa lĩnh ngộ Đan Phương ${recipe.name}.`);
    if (state.rank < recipe.requiredAlchemyRank)
        throw new Error(`${recipe.name} cần ${ALCHEMY_RANK_NAMES[recipe.requiredAlchemyRank - 1]}.`);
    if (furnace >= alchemyFurnaceCount(state.rank))
        throw new Error(`Lò ${furnace + 1} chưa mở; hiện có ${alchemyFurnaceCount(state.rank)} lò.`);
    if (state.queues.some(x => x.furnaceIndex === furnace))
        throw new Error(`Lò ${furnace + 1} đang luyện đan.`);
    if (!recipe.allowedBatchSizes.includes(input.batchSize))
        throw new Error(`Batch ${input.batchSize} không hợp lệ cho ${recipe.name}.`);
    const retention = Math.max(0, input.globalModifiers?.masteryRetentionPct ?? 0), progress = ensureAlchemyRecipeProgress(state, input.family, recipe.realmTier, input.legacy, retention), snapshot = alchemyCraftSnapshot(state, progress, input.globalModifiers), durationRealSeconds = alchemyCraftDurationRealSeconds(recipe, input.batchSize, snapshot), ingredients = effectiveIngredients(recipe, input.batchSize, snapshot);
    spendAlchemyIngredients(input.container, input.inventory, ingredients);
    const job = { id: `alchemy.${++state.serial}.${input.seed >>> 0}`, furnaceIndex: furnace, recipeId: recipe.id, batchSize: input.batchSize, seed: input.seed >>> 0, startedWorldYear: input.worldYear, completesWorldYear: input.worldYear + durationRealSeconds / 3600 * Math.max(1e-9, input.worldYearsPerRealHour), durationRealSeconds, ingredientsSpent: ingredients.map(x => ({ ...x })), snapshot };
    state.queues.push(job);
    state.telemetry.batchesStarted++;
    state.telemetry.nominalPillsStarted += input.batchSize;
    state.telemetry.materialsSpent += ingredients.filter(x => x.kind === 'material').reduce((a, b) => a + b.quantity, 0);
    state.telemetry.treasuresSpent += ingredients.filter(x => x.kind === 'treasure').reduce((a, b) => a + b.quantity, 0);
    return { ...job, ingredientsSpent: job.ingredientsSpent.map(x => ({ ...x })), snapshot: { ...job.snapshot } };
}
function specSupremeTargetPct(level) { const l = Math.max(0, Math.min(100, level)); const points = [[0, 1], [20, 8], [40, 20], [60, 40], [80, 70], [90, 85], [95, 94], [99, 99], [100, 100]]; for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    if (l <= b[0]) {
        const t = (l - a[0]) / (b[0] - a[0]);
        return a[1] + (b[1] - a[1]) * t;
    }
} return 100; }
export function alchemyQualityWeights(snapshot) { if (snapshot.specializationLevel >= 100)
    return { low: 0, mid: 0, high: 0, supreme: 100 }; const base = { ...PILL_QUALITY_BASE_WEIGHTS }; const q = Math.max(0, snapshot.qualityWeightBonus); const generalSupreme = Math.min(20, base.supreme + q * .10), generalHigh = Math.min(45, base.high + q * .35), generalMid = Math.min(60, base.mid + q * .55); let supreme = Math.max(generalSupreme, specSupremeTargetPct(snapshot.specializationLevel)); const remaining = Math.max(0, 100 - supreme); const nonSupTotal = Math.max(1, generalMid + generalHigh + Math.max(0, 100 - generalMid - generalHigh - generalSupreme)); let high = remaining * (generalHigh / nonSupTotal), mid = remaining * (generalMid / nonSupTotal), low = Math.max(0, remaining - high - mid); if (snapshot.specializationLevel >= 95) {
    low = 0;
    const sum = mid + high;
    if (sum > 0) {
        mid = remaining * mid / sum;
        high = remaining * high / sum;
    }
} return { low, mid, high, supreme }; }
function rollQuality(rng, weights) { const r = rng.next() * 100; let acc = 0; for (const q of QUALITY_ORDER) {
    acc += weights[q];
    if (r < acc)
        return q;
} return 'supreme'; }
function addAlchemyExp(state, gain) { let remaining = Math.max(0, gain); while (remaining > 1e-9) {
    if (state.examReady)
        return;
    const req = alchemyTurnExpRequirement(state.rank, state.turn), need = Math.max(0, req - state.turnExp), take = Math.min(remaining, need);
    state.turnExp += take;
    remaining -= take;
    if (state.turnExp + 1e-9 < req)
        return;
    state.turnExp = req;
    if (state.turn < 9) {
        state.turn = (state.turn + 1);
        state.turnExp = 0;
        continue;
    }
    if (state.rank < 9) {
        state.examReady = true;
        return;
    }
    return;
} }
function expTierEfficiency(recipeTier, rank) { const gap = Math.max(0, rank - recipeTier); if (gap <= 0)
    return 1; if (gap === 1)
    return .4; if (gap === 2)
    return .1; return 0; }
function qualityExpMultiplier(q) { return q === 'low' ? 1 : q === 'mid' ? 1.2 : q === 'high' ? 1.5 : 2; }
export function completeAlchemyJob(input) {
    const state = ensureAlchemyV112State(input.container), recipeParts = /^(.*)\.t([1-8])$/.exec(input.job.recipeId);
    if (!recipeParts)
        throw new Error(`Recipe job hỏng: ${input.job.recipeId}`);
    const family = recipeParts[1], tier = Number(recipeParts[2]), recipe = alchemyRecipeDefinition(family, tier), progress = state.recipeProgress[input.job.recipeId] ?? (state.recipeProgress[input.job.recipeId] = createAlchemyRecipeProgress(input.job.snapshot.mastery));
    const rng = new SeededRng(input.job.seed ^ 0xa1c4e9b7), outputFloat = input.job.batchSize * input.job.snapshot.yieldPct / 100, outputCount = Math.max(0, Math.floor(outputFloat) + (rng.next() < outputFloat - Math.floor(outputFloat) ? 1 : 0)), weights = alchemyQualityWeights(input.job.snapshot), qualities = cloneQualityCounts();
    for (let i = 0; i < outputCount; i++)
        qualities[rollQuality(rng, weights)]++;
    for (const q of QUALITY_ORDER) {
        const count = qualities[q];
        if (count <= 0)
            continue;
        const resourceId = alchemyPillResourceId(family, tier, q);
        input.inventory[resourceId] = (input.inventory[resourceId] ?? 0) + count;
        progress.qualityCounts[q] += count;
        if (QUALITY_RANK[q] > QUALITY_RANK[progress.highestQuality])
            progress.highestQuality = q;
    }
    const rankBefore = state.rank, turnBefore = state.turn, masteryBefore = progress.mastery, specializationBefore = progress.specializationLevel;
    let masteryPoints = 0;
    for (const q of QUALITY_ORDER)
        masteryPoints += qualities[q] * QUALITY_SCORE[q];
    masteryPoints *= 1 + input.job.snapshot.masteryGainPct / 100;
    const masteryNeed = Math.max(0, ALCHEMY_MASTERY_MAX - progress.mastery), toMastery = Math.min(masteryNeed, masteryPoints);
    progress.mastery = Math.min(ALCHEMY_MASTERY_MAX, progress.mastery + toMastery);
    const toSpec = Math.max(0, masteryPoints - toMastery);
    progress.specializationPoints += toSpec;
    const threshold = ALCHEMY_SPECIALIZATION_THRESHOLD_BY_TIER[tier - 1];
    progress.specializationLevel = Math.max(progress.specializationLevel, Math.min(100, Math.floor(progress.specializationPoints / threshold * 100)));
    progress.batchesCompleted++;
    progress.pillsCrafted += outputCount;
    let exp = 0;
    const tierEff = expTierEfficiency(tier, input.job.snapshot.alchemyRank);
    for (const q of QUALITY_ORDER)
        exp += qualities[q] * qualityExpMultiplier(q);
    exp *= tierEff * (1 + input.job.snapshot.expGainPct / 100);
    addAlchemyExp(state, exp);
    state.telemetry.batchesCompleted++;
    state.telemetry.pillsProduced += outputCount;
    state.telemetry.supremePillsProduced += qualities.supreme;
    state.telemetry.alchemyExpEarned += exp;
    return { jobId: input.job.id, recipeId: recipe.id, recipeName: recipe.name, batchSize: input.job.batchSize, outputCount, qualities, masteryBefore, masteryAfter: progress.mastery, specializationBefore, specializationAfter: progress.specializationLevel, alchemyExpGained: exp, rankBefore, turnBefore, rankAfter: state.rank, turnAfter: state.turn, examReady: state.examReady };
}
export function syncAlchemyV112(input) { const state = ensureAlchemyV112State(input.container), ready = state.queues.filter(x => x.completesWorldYear <= input.worldYear + 1e-9).sort((a, b) => a.completesWorldYear - b.completesWorldYear || a.furnaceIndex - b.furnaceIndex), done = []; for (const job of ready) {
    done.push(completeAlchemyJob({ container: input.container, inventory: input.inventory, job }));
    state.queues = state.queues.filter(x => x.id !== job.id);
} return done; }
export const ALCHEMY_GARDEN_GROWTH_REAL_MINUTES_BY_TIER = [20, 30, 45, 60, 90, 120, 180, 240];
export function alchemyGardenSlotCountV85(facilityLevel) { return Math.max(3, Math.min(12, 2 + Math.max(1, Math.floor(facilityLevel)))); }
export function alchemyGardenGrowthRealMinutesV85(realmTier, facilityLevel = 1) { const tier = clampEconomyRealmTier(realmTier), steps = Math.max(0, Math.min(9, Math.floor(facilityLevel) - 1)), reduction = Math.min(.27, steps * .03); return ALCHEMY_GARDEN_GROWTH_REAL_MINUTES_BY_TIER[tier - 1] * (1 - reduction); }
export function alchemyGardenHerbResourceIdV85(variant, realmTier) { return economyMaterialResourceId('herb', clampEconomyRealmTier(realmTier), variant); }
export function alchemyGardenPlotStatusV85(plot, worldYear) { const span = Math.max(1e-9, plot.maturesWorldYear - plot.plantedWorldYear), elapsed = Math.max(0, worldYear - plot.plantedWorldYear), ageMultiple = elapsed / span, progressPct = Math.min(100, ageMultiple * 100); let stage = 'growing', yieldCount = 0; if (ageMultiple >= 4) {
    stage = 'ancient';
    yieldCount = 7;
}
else if (ageMultiple >= 2) {
    stage = 'old';
    yieldCount = 5;
}
else if (ageMultiple >= 1) {
    stage = 'mature';
    yieldCount = 4;
} return { stage, progressPct, ageMultiple, yield: yieldCount }; }
export function plantAlchemyGardenV85(input) { const slot = Math.max(0, Math.floor(input.slot)), slots = alchemyGardenSlotCountV85(input.facilityLevel); if (slot >= slots)
    throw new Error(`Dược Viên hiện chỉ mở ${slots} ô.`); if (input.state.garden.plots.some(x => x.slot === slot))
    throw new Error(`Ô Dược Viên ${slot + 1} đang có Linh Thực.`); const tier = clampEconomyRealmTier(input.realmTier), resourceId = alchemyGardenHerbResourceIdV85(input.variant, tier), available = Math.max(0, Math.floor(input.inventory[resourceId] ?? 0)); if (available < 1)
    throw new Error(`Cần 1 ${economyMaterialDefinition(resourceId)?.name ?? resourceId} làm Linh Chủng.`); input.inventory[resourceId] = available - 1; const minutes = alchemyGardenGrowthRealMinutesV85(tier, input.facilityLevel), durationYears = minutes / 60 * Math.max(1e-9, input.worldYearsPerRealHour), plot = { slot, variant: input.variant, realmTier: tier, plantedWorldYear: input.worldYear, maturesWorldYear: input.worldYear + durationYears }; input.state.garden.plots.push(plot); input.state.garden.planted++; return { ...plot }; }
export function harvestAlchemyGardenV85(input) { const slot = Math.max(0, Math.floor(input.slot)), idx = input.state.garden.plots.findIndex(x => x.slot === slot); if (idx < 0)
    throw new Error('Ô Dược Viên đang trống.'); const plot = input.state.garden.plots[idx], status = alchemyGardenPlotStatusV85(plot, input.worldYear); if (status.stage === 'growing')
    throw new Error(`Linh Thực mới sinh trưởng ${status.progressPct.toFixed(0)}%; chưa thể thu hoạch.`); const facilityBonus = Math.floor(Math.max(0, Math.min(9, Math.floor(input.facilityLevel) - 1)) / 3), yieldCount = Math.max(1, status.yield + facilityBonus), resourceId = alchemyGardenHerbResourceIdV85(plot.variant, plot.realmTier); input.inventory[resourceId] = (input.inventory[resourceId] ?? 0) + yieldCount; input.state.garden.plots.splice(idx, 1); input.state.garden.harvested++; input.state.garden.herbsHarvested += yieldCount; return { plot: { ...plot }, stage: status.stage, yield: yieldCount, resourceId }; }
function representativeQualityForPromotion(rank) { return rank <= 2 ? 'mid' : rank <= 6 ? 'high' : 'supreme'; }
export function alchemyPromotionRequirements(state) { const reasons = []; if (state.rank >= 9) {
    reasons.push('Đã đạt Đan Đế.');
    return { ready: false, reasons, requiredRepresentativeQuality: 'supreme', mastery600: 0, mastery300: 0 };
} if (!state.examReady)
    reasons.push('Chưa hoàn thành Cửu Chuyển của đại bậc hiện tại.'); const progresses = Object.values(state.recipeProgress), mastery600 = progresses.filter(x => x.mastery >= 600).length, mastery300 = progresses.filter(x => x.mastery >= 300).length; if (mastery600 < 1)
    reasons.push('Cần ít nhất 1 recipe đạt ≥600 Mastery.'); if (mastery300 < 3)
    reasons.push('Cần tổng cộng ít nhất 3 recipe đạt ≥300 Mastery.'); const q = representativeQualityForPromotion(state.rank), repKey = alchemyRecipeKey('cultivation', Math.min(8, state.rank)), rep = state.recipeProgress[repKey]; if (!rep || QUALITY_RANK[rep.highestQuality] < QUALITY_RANK[q])
    reasons.push(`Cần từng luyện ${FAMILY_LABEL.cultivation} đại diện đạt ít nhất ${PILL_QUALITY_LABEL[q]}.`); return { ready: reasons.length === 0, reasons, requiredRepresentativeQuality: q, mastery600, mastery300 }; }
export function promoteAlchemyRank(state) { const req = alchemyPromotionRequirements(state); if (!req.ready)
    throw new Error(req.reasons.join(' ')); const from = state.rank; state.rank = (state.rank + 1); state.turn = 1; state.turnExp = 0; state.examReady = false; return { from, to: state.rank }; }
export function alchemyTemporaryStatBase(realmTier) { return TEMP_STAT_BASE_BY_TIER[clampEconomyRealmTier(realmTier) - 1]; }
export function alchemyCultivationPillPct(realmTier) { return CULTIVATION_PILL_PCT_BY_TIER[clampEconomyRealmTier(realmTier) - 1]; }
export function alchemyPermanentStatGain(quality) { return PERMANENT_STAT_BY_QUALITY[quality]; }
export function alchemyTemporaryStatGain(realmTier, quality) { return Math.max(1, Math.round(alchemyTemporaryStatBase(realmTier) * PILL_QUALITY_MULTIPLIER[quality])); }
/** V129: one Tĩnh Suy Đan removes a modest fixed amount; quality matters, realm efficiency is applied by the caller. */
export function alchemyDaoSuyPillRelief(quality) { return 6 * PILL_QUALITY_MULTIPLIER[quality]; }
export function alchemyLifespanPillPct(quality) { return .005 * PILL_QUALITY_MULTIPLIER[quality]; }
export function alchemyPillRealmEfficiency(currentTier, pillTier) { const gap = Math.max(0, Math.floor(currentTier) - Math.floor(pillTier)); return gap <= 0 ? 1 : gap === 1 ? .4 : gap === 2 ? .1 : 0; }
export function isAlchemyBuffFamily(family) { return family === 'buffPower' || family === 'buffGuard' || family === 'buffSpirit' || family === 'forbidden'; }
export function alchemyVietnamDayKey(nowUnixMs = Date.now()) { const d = new Date(nowUnixMs + 7 * 3600_000); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`; }
export function syncAlchemyBuffDailyQuota(state, nowUnixMs = Date.now()) { const key = alchemyVietnamDayKey(nowUnixMs); if (state.life.buffDaily.dayKey !== key)
    state.life.buffDaily = { dayKey: key, used: 0 }; }
export function alchemyInjuryPillHeal(realmTier, quality) { return Math.max(1, Math.round((8 + clampEconomyRealmTier(realmTier) * 4) * PILL_QUALITY_MULTIPLIER[quality])); }
export function alchemyCombatBuffEffect(family, realmTier, quality, realmEfficiency = 1) { const tier = clampEconomyRealmTier(realmTier), m = PILL_QUALITY_MULTIPLIER[quality] * Math.max(0, realmEfficiency), base = alchemyTemporaryStatBase(tier); if (family === 'buffPower')
    return { powerFlat: Math.max(1, Math.round(base * 3 * m)), bodyFlat: 0, defenseFlat: 0, spiritFlat: 0 }; if (family === 'buffGuard')
    return { powerFlat: 0, bodyFlat: Math.max(1, Math.round(base * 2 * m)), defenseFlat: Math.max(1, Math.round(base * 2.5 * m)), spiritFlat: 0 }; if (family === 'buffSpirit')
    return { powerFlat: 0, bodyFlat: 0, defenseFlat: 0, spiritFlat: Math.max(5, Math.round(base * 18 * m)) }; return { powerFlat: Math.max(1, Math.round(base * 6 * m)), bodyFlat: 0, defenseFlat: 0, spiritFlat: Math.max(0, Math.round(base * 6 * m)) }; }
export function alchemyForbiddenPillCost(quality) { const clean = quality === 'low' ? 1 : quality === 'mid' ? .85 : quality === 'high' ? .70 : .55; return { injury: Math.max(1, Math.round(12 * clean)) }; }
export function activeAlchemyBuff(state, worldYear) { const b = state.life.activeBuff; if (!b)
    return undefined; if (b.expiresWorldYear <= worldYear + 1e-9) {
    state.life.activeBuff = undefined;
    return undefined;
} return b; }
export function daoPillStat(family) { return family === 'daoPower' ? 'power' : family === 'daoBody' ? 'body' : family === 'daoDefense' ? 'defense' : undefined; }
export function lifePillStat(family) { return family === 'lifePower' ? 'power' : family === 'lifeBody' ? 'body' : family === 'lifeDefense' ? 'defense' : undefined; }
export function applyAlchemyStatBonuses(entity, life, permanent, buff) { const power = Math.max(0, life.power) + Math.max(0, permanent.power) + Math.max(0, buff?.powerFlat ?? 0), body = Math.max(0, life.body) + Math.max(0, permanent.body) + Math.max(0, buff?.bodyFlat ?? 0), defense = Math.max(0, life.defense) + Math.max(0, permanent.defense) + Math.max(0, buff?.defenseFlat ?? 0), spirit = Math.max(0, buff?.spiritFlat ?? 0); const basePhysique = Number.isFinite(entity.stats.physique) ? Math.max(0, entity.stats.physique) : Math.max(0, entity.stats.maxHp / 20), physique = basePhysique + body; return { ...entity, stats: { ...entity.stats, attack: entity.stats.attack + power, defense: entity.stats.defense + defense, physique, maxHp: physique * 20, maxSpirit: entity.stats.maxSpirit + spirit, spiritStandard: Math.max(entity.stats.spiritStandard ?? entity.stats.maxSpirit, (entity.stats.spiritStandard ?? entity.stats.maxSpirit) + spirit) } }; }
export function emptyAlchemyAllocation() { return { power: 0, body: 0, defense: 0 }; }
export function cloneAlchemyLegacy(value) { return { highestRank: Math.max(1, Math.min(9, Math.floor(Number(value?.highestRank) || 1))), highestTurn: Math.max(1, Math.min(9, Math.floor(Number(value?.highestTurn) || 1))), bestMasteryByRecipe: { ...(value?.bestMasteryByRecipe ?? {}) }, knownRecipeIds: [...new Set(value?.knownRecipeIds ?? [])] }; }
export function archiveAlchemyLegacy(legacy, state) { const next = cloneAlchemyLegacy(legacy); if (state.rank > next.highestRank || (state.rank === next.highestRank && state.turn > next.highestTurn)) {
    next.highestRank = state.rank;
    next.highestTurn = state.turn;
} for (const [key, p] of Object.entries(state.recipeProgress))
    next.bestMasteryByRecipe[key] = Math.max(next.bestMasteryByRecipe[key] ?? 0, p.mastery); next.knownRecipeIds = [...new Set([...next.knownRecipeIds, ...state.knownRecipeIds])]; return next; }
//# sourceMappingURL=alchemy-v112.js.map