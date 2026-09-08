import { SimulationSession } from './session.js';
import {
  ALCHEMY_BUFF_DURATION_REAL_MINUTES,
  ALCHEMY_BUFF_PILL_DAILY_CAP,
  ALCHEMY_DAO_SUY_PILL_CAP_PER_MAJOR_REALM,
  ALCHEMY_LIFESPAN_PILL_CAP_PCT,
  ALCHEMY_RANK_NAMES,
  ALCHEMY_TURN_NAMES,
  alchemyGardenHerbResourceIdV85,
  alchemyTurnExpRequirement,
  alchemyVietnamDayKey,
  archiveAlchemyLegacy,
  cloneAlchemyLegacy,
  emptyAlchemyAllocation,
  ensureAlchemyV112State,
} from './alchemy-v112.js';
import {
  ALCHEMY_V146_CULTIVATION_PILL_CAP_PER_MAJOR_REALM,
  ALCHEMY_V146_LIVE_FAMILY_IDS,
  ALCHEMY_V146_PERMANENT_PILL_CAP_PER_FAMILY_MAJOR_LIFE,
  ALCHEMY_V146_QUALITY_NAMES,
  alchemyHerbResourceIdV146,
  alchemyIngredientNameV146,
  alchemyPermanentFamilyStatV146,
  alchemyPermanentQuotaKeyV146,
  alchemyPillNameV146,
  alchemyRecipeCatalogueV146,
  parseAlchemyPillResourceIdV146,
} from './alchemy-v146.js';
import {
  ALCHEMY_PRODUCTION_V146_SCHEMA,
  ALCHEMY_V146_MASTERY_MAX,
  alchemyAllowedBatchSizesV146,
  alchemyBaseCraftMinutesV146,
  alchemyCraftModifiersV146,
  alchemyFamilyMasteryKeyV146,
  alchemyFurnaceCountV146,
  alchemyGardenGrowthRealMinutesV146,
  alchemyGardenPlotStatusV146,
  alchemyGardenSlotCountV146,
  alchemyGardenStarterSeedAvailableV146,
  alchemyPromotionStatusV146,
  alchemyQualityWeightsV146,
  alchemyRecipeCanCraftV146,
  alchemyRecipeCostV146,
  alchemyRequiredRankV146,
  ensureAlchemyFamilyMasteryProgressV146,
  ensureAlchemyProductionV146,
  harvestAlchemyGardenV146,
  hydrateAlchemyFamilyMasteriesV146,
  migrateAlchemyV112ToV146,
  plantAlchemyGardenV146,
  promoteAlchemyV146,
  startAlchemyCraftV146,
  syncAlchemyProductionV146,
} from './alchemy-production-v146.js';
import { WORLD_YEARS_PER_REAL_HOUR } from './realtime-balance.js';
import { majorRealmIndexForRealmOrder } from '../content/realm-maps.js';

export const ALCHEMY_SESSION_BRIDGE_V146_SCHEMA = 'alchemy-session-bridge.v146';
const INSTALL_KEY = Symbol.for('tutien.alchemy.session.bridge.v146');

const safeInt = (value, fallback = 0) => Math.max(0, Math.floor(Number.isFinite(Number(value)) ? Number(value) : fallback));
const safeNumber = (value, fallback = 0) => Math.max(0, Number.isFinite(Number(value)) ? Number(value) : fallback);
function inventoryNumber(inventory, resourceId) {
  const raw = inventory?.[resourceId];
  if (typeof raw === 'bigint') return Number(raw > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : raw);
  return Math.max(0, Number(raw) || 0);
}
function currentMajorRealmIndex(session) {
  const order = Math.max(0, safeInt(session?.stateValue?.realm?.maxRealmOrder));
  return order <= 0 ? 0 : Math.max(1, Math.min(28, majorRealmIndexForRealmOrder(order)));
}
function v146RealmEfficiency(currentMajor, pillMajor) {
  const current = Math.max(0, safeInt(currentMajor));
  const pill = Math.max(0, safeInt(pillMajor));
  if (pill > current) return 0;
  const gap = current - pill;
  if (gap <= 0) return 1;
  if (gap === 1) return .4;
  if (gap === 2) return .1;
  return 0;
}
function familyLabel(family) {
  return ({ cultivation:'Tu Vi', injury:'Trị Thương', lifePower:'Công Lực', lifeBody:'Khí Huyết', lifeDefense:'Hộ Thể', buffPower:'Chiến Ý', buffGuard:'Kim Cương', buffSpirit:'Tụ Nguyên', forbidden:'Bạo Huyết', lifespan:'Thọ Nguyên', daoSuy:'Tĩnh Suy' })[family] ?? family;
}
function refundLegacyGarden(session) {
  const alchemy = ensureAlchemyV112State(session.stateValue.economy);
  if (!Array.isArray(alchemy.garden?.plots) || alchemy.garden.plots.length <= 0) return 0;
  let refunded = 0;
  for (const plot of alchemy.garden.plots) {
    const resourceId = alchemyGardenHerbResourceIdV85(plot.variant, plot.realmTier);
    session.stateValue.inventory[resourceId] = inventoryNumber(session.stateValue.inventory, resourceId) + 1;
    refunded++;
  }
  alchemy.garden.plots = [];
  return refunded;
}
function prepareSessionAlchemyV146(session) {
  const currentMajor = currentMajorRealmIndex(session);
  const alchemy = ensureAlchemyV112State(session.stateValue.economy);
  const legacy = cloneAlchemyLegacy(session.metaValue?.reincarnationProgress?.alchemyLegacy);
  refundLegacyGarden(session);
  const migration = migrateAlchemyV112ToV146({ container: session.stateValue.economy, inventory: session.stateValue.inventory, currentMajorRealmIndex: currentMajor });
  hydrateAlchemyFamilyMasteriesV146(alchemy, legacy);
  return { currentMajor, alchemy, production: ensureAlchemyProductionV146(session.stateValue.economy), legacy, migration };
}
function persistAlchemyKnowledgeV146(session, alchemy) {
  const progress = session.metaValue?.reincarnationProgress;
  if (!progress) return;
  progress.alchemyLegacy = archiveAlchemyLegacy(cloneAlchemyLegacy(progress.alchemyLegacy), alchemy);
}
function settleProductionV146(session) {
  const prepared = prepareSessionAlchemyV146(session);
  const completions = syncAlchemyProductionV146({
    container: session.stateValue.economy,
    inventory: session.stateValue.inventory,
    worldYear: session.stateValue.worldTimeYears,
    legacyKnowledge: prepared.legacy,
  });
  if (completions.length) {
    persistAlchemyKnowledgeV146(session, prepared.alchemy);
    for (const done of completions) {
      session.historyValue?.append?.({
        id: `alchemy.v146.sync.${Math.floor(session.stateValue.worldTimeYears * 1000)}.${done.jobId}`,
        worldTimeYears: session.stateValue.worldTimeYears,
        ageYears: session.stateValue.ageYears,
        type: 'resource', significance: done.qualities.supreme > 0 ? 10 : 4,
        message: `Luyện đan hoàn tất: ${done.recipeName} ×${done.outputCount} · Cực phẩm ${done.qualities.supreme}.`,
        locationId: session.stateValue.locationId,
        tags: ['Alchemy', 'V146', 'CraftComplete'],
        data: { recipeId: done.recipeId, outputCount: done.outputCount, supreme: done.qualities.supreme, masteryAfter: done.masteryAfter, alchemyExpGained: done.alchemyExpGained },
      });
    }
  }
  return { ...prepared, completions };
}

export function buildAlchemySummaryV146(session) {
  const { currentMajor, alchemy, production, legacy } = prepareSessionAlchemyV146(session);
  const facility = session.alchemyFacilityProfileV85?.() ?? { level: 1, modifiers: {} };
  const facilityModifiers = session.alchemyProductionModifiersV85?.() ?? facility.modifiers ?? {};
  const rank = Math.max(1, Math.min(9, safeInt(alchemy.rank, 1)));
  const turn = Math.max(1, Math.min(9, safeInt(alchemy.turn, 1)));
  const recipes = alchemyRecipeCatalogueV146()
    .filter(recipe => recipe.majorRealmIndex <= currentMajor && alchemyRequiredRankV146(recipe.majorRealmIndex) <= rank)
    .map(recipe => {
      const progress = ensureAlchemyFamilyMasteryProgressV146(alchemy, recipe.family, legacy);
      const modifiers = alchemyCraftModifiersV146(progress.mastery, facilityModifiers);
      const ingredients = alchemyRecipeCostV146(recipe.family, recipe.majorRealmIndex, 1, progress.mastery).map(x => ({
        ...x,
        available: inventoryNumber(session.stateValue.inventory, x.resourceId),
        name: alchemyIngredientNameV146(x.resourceId) ?? x.resourceId,
      }));
      return {
        ...recipe,
        realmTier: recipe.majorRealmIndex,
        requiredAlchemyRank: alchemyRequiredRankV146(recipe.majorRealmIndex),
        baseCraftMinutes: alchemyBaseCraftMinutesV146(recipe.family),
        allowedBatchSizes: alchemyAllowedBatchSizesV146(recipe.family),
        known: true,
        autoUnlocked: true,
        researchCost: { alchemyEssence: 0 },
        canResearch: false,
        ingredients,
        progress: { ...progress, qualityCounts: { ...progress.qualityCounts }, specializationLevel: 0, specializationPoints: 0 },
        craftModifiers: modifiers,
        qualityWeights: alchemyQualityWeightsV146(progress.mastery, rank),
        canCraftBase: alchemyRecipeCanCraftV146(session.stateValue.inventory, recipe.family, recipe.majorRealmIndex, 1, progress.mastery),
      };
    })
    .sort((a, b) => b.majorRealmIndex - a.majorRealmIndex || ALCHEMY_V146_LIVE_FAMILY_IDS.indexOf(a.family) - ALCHEMY_V146_LIVE_FAMILY_IDS.indexOf(b.family));

  const slotCount = alchemyGardenSlotCountV146(facility.level);
  const gardenPlots = production.garden.plots.map(plot => {
    const status = alchemyGardenPlotStatusV146(plot, session.stateValue.worldTimeYears);
    const remainingRealSeconds = Math.max(0, (plot.maturesWorldYear - session.stateValue.worldTimeYears) / WORLD_YEARS_PER_REAL_HOUR * 3600);
    return {
      ...plot, realmTier: plot.majorRealmIndex, variant: 'v146', ...status,
      resourceId: alchemyHerbResourceIdV146(plot.majorRealmIndex),
      name: alchemyIngredientNameV146(alchemyHerbResourceIdV146(plot.majorRealmIndex)),
      remainingRealSeconds,
    };
  }).sort((a, b) => a.slot - b.slot);
  const activeGardenMajors = new Set(gardenPlots.map(x => x.majorRealmIndex));
  const seedMajors = [];
  for (let major = 0; major <= currentMajor; major++) {
    const id = alchemyHerbResourceIdV146(major);
    if (major === currentMajor || inventoryNumber(session.stateValue.inventory, id) > 0 || activeGardenMajors.has(major)) seedMajors.push(major);
  }
  const gardenSeeds = [...new Set(seedMajors)].sort((a, b) => b - a).map(major => {
    const resourceId = alchemyHerbResourceIdV146(major);
    const inventory = inventoryNumber(session.stateValue.inventory, resourceId);
    const starter = alchemyGardenStarterSeedAvailableV146(production, major) ? 1 : 0;
    return { resourceId, realmTier: major, majorRealmIndex: major, variant: 'v146', name: alchemyIngredientNameV146(resourceId), available: inventory + starter, inventoryAvailable: inventory, starterSeedAvailable: Boolean(starter) };
  });

  const currentDayKey = alchemyVietnamDayKey(Date.now());
  const buffDaily = alchemy.life.buffDaily?.dayKey === currentDayKey ? { ...alchemy.life.buffDaily } : { dayKey: currentDayKey, used: 0 };
  const storedBuff = alchemy.life.activeBuff;
  const activeBuff = storedBuff && storedBuff.expiresWorldYear > session.stateValue.worldTimeYears + 1e-9
    ? { ...storedBuff, remainingRealSeconds: Math.max(0, (storedBuff.expiresWorldYear - session.stateValue.worldTimeYears) / WORLD_YEARS_PER_REAL_HOUR * 3600) }
    : undefined;
  const majorKey = String(currentMajor);
  const pills = Object.entries(session.stateValue.inventory).flatMap(([resourceId, raw]) => {
    const desc = parseAlchemyPillResourceIdV146(resourceId);
    const count = safeInt(raw);
    if (!desc || count <= 0) return [];
    let realmEfficiency = v146RealmEfficiency(currentMajor, desc.majorRealmIndex);
    if (desc.family === 'cultivation' && desc.majorRealmIndex !== currentMajor) realmEfficiency = 0;
    const quotaKey = alchemyPermanentFamilyStatV146(desc.family) ? alchemyPermanentQuotaKeyV146(desc.family, desc.majorRealmIndex) : undefined;
    return [{
      resourceId, count, name: alchemyPillNameV146(desc.family, desc.majorRealmIndex, desc.quality), family: desc.family,
      realmTier: desc.majorRealmIndex, majorRealmIndex: desc.majorRealmIndex, quality: desc.quality, realmEfficiency,
      lifeStatUsed: quotaKey ? safeInt(alchemy.life.temporaryStatPillsUsedByTier?.[quotaKey]) : undefined,
    }];
  }).sort((a, b) => b.majorRealmIndex - a.majorRealmIndex || a.family.localeCompare(b.family) || a.quality.localeCompare(b.quality));
  const promotion = alchemyPromotionStatusV146(alchemy);
  const furnacesUnlocked = alchemyFurnaceCountV146(rank);
  const queues = production.queues.map(q => ({
    ...q,
    recipeId: `alchemy.v146.${q.family}.m${q.majorRealmIndex}`,
    remainingRealSeconds: Math.max(0, (q.completesWorldYear - session.stateValue.worldTimeYears) / WORLD_YEARS_PER_REAL_HOUR * 3600),
    name: alchemyPillNameV146(q.family, q.majorRealmIndex, 'low').replace(` · ${ALCHEMY_V146_QUALITY_NAMES.low}`, ''),
  }));
  return {
    schema: 'alchemy.v146',
    rank, rankName: ALCHEMY_RANK_NAMES[rank - 1], turn, turnName: ALCHEMY_TURN_NAMES[turn - 1],
    turnExp: safeNumber(alchemy.turnExp), turnExpRequired: alchemyTurnExpRequirement(rank, turn), examReady: promotion.ready,
    currentMajorRealmIndex: currentMajor,
    facility: { level: facility.level ?? 1, modifiers: { ...(facility.modifiers ?? facilityModifiers ?? {}) } },
    garden: {
      slots: slotCount, plots: gardenPlots, seeds: gardenSeeds,
      telemetry: { planted: production.garden.planted, harvested: production.garden.harvested, herbsHarvested: production.garden.herbsHarvested },
      rules: { spatialPacking: false, seedRarity: false, consumeOneHerbAsSeed: true, oneStarterSeedPerReachedMajor: true, ageStages: ['mature', 'old', 'ancient'], yields: { mature: 4, old: 5, ancient: 7 } },
    },
    furnaces: { unlocked: furnacesUnlocked, busy: queues.length, queues },
    promotion,
    recipeKnowledge: { known: recipes.length, total: 299, availableEssence: 0, autoUnlock: true, researchRetired: true, persistentAcrossReincarnation: true },
    recipes,
    pills,
    life: {
      ...alchemy.life,
      lifeStatBonus: { ...(alchemy.life.lifeStatBonus ?? {}) },
      temporaryStatPillsUsedByTier: { ...(alchemy.life.temporaryStatPillsUsedByTier ?? {}) },
      cultivationPillsUsedByMajorRealm: { ...(alchemy.life.cultivationPillsUsedByMajorRealm ?? {}) },
      daoSuyPillsUsedByMajorRealm: { ...(alchemy.life.daoSuyPillsUsedByMajorRealm ?? {}) },
      buffDaily,
      activeBuff,
      permanentPillCap: ALCHEMY_V146_PERMANENT_PILL_CAP_PER_FAMILY_MAJOR_LIFE,
      temporaryStatPillCapPerTier: ALCHEMY_V146_PERMANENT_PILL_CAP_PER_FAMILY_MAJOR_LIFE,
      cultivationPillCapPerMajorRealm: ALCHEMY_V146_CULTIVATION_PILL_CAP_PER_MAJOR_REALM,
      cultivationPillsUsedCurrentMajorRealm: safeInt(alchemy.life.cultivationPillsUsedByMajorRealm?.[majorKey]),
      daoSuyPillCapPerMajorRealm: ALCHEMY_DAO_SUY_PILL_CAP_PER_MAJOR_REALM,
      daoSuyPillsUsedCurrentMajorRealm: safeInt(alchemy.life.daoSuyPillsUsedByMajorRealm?.[majorKey]),
      buffPillDailyCap: ALCHEMY_BUFF_PILL_DAILY_CAP,
      lifespanPillCapPct: ALCHEMY_LIFESPAN_PILL_CAP_PCT,
    },
    permanentStats: { ...emptyAlchemyAllocation(), ...(session.metaValue?.reincarnationProgress?.alchemyPermanentStats ?? {}) },
    legacy: cloneAlchemyLegacy(session.metaValue?.reincarnationProgress?.alchemyLegacy),
    telemetry: { ...(alchemy.telemetry ?? {}), v146Production: undefined },
    rules: {
      canonicalPillSystem: 'alchemy.v146', onlyTwoIngredientFamilies: true, ingredientFamilies: ['herb', 'demonCore'],
      autoUnlockRecipes: true, recipeResearchRetired: true, specializationRetired: true, familyMastery: true, masteryMax: ALCHEMY_V146_MASTERY_MAX,
      maxFurnaces: 4, noHpCnRecoveryPills: true, oneActiveBuff: true, buffDurationRealMinutes: ALCHEMY_BUFF_DURATION_REAL_MINUTES,
      permanentStatsSurviveReincarnation: true, perLifeQuotaResetsOnReincarnation: true,
    },
  };
}

function installBridge() {
  const proto = SimulationSession.prototype;
  if (proto[INSTALL_KEY]) return;
  Object.defineProperty(proto, INSTALL_KEY, { value: true, configurable: false, enumerable: false });
  const originalAdvanceRealtime = proto.advanceRealtimeCultivationV140;
  const originalResolveOffline = proto.resolveRealtimeOffline;

  proto.alchemyV112Summary = function alchemyV146SummaryCompatibility() {
    return buildAlchemySummaryV146(this);
  };
  proto.startAlchemyV112 = function startAlchemyV146Compatibility(family, realmTier, batchSize, furnaceIndex = 0) {
    if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc; không thể bắt đầu mẻ đan mới.');
    settleProductionV146(this);
    const { currentMajor, legacy } = prepareSessionAlchemyV146(this);
    const facilityModifiers = this.alchemyProductionModifiersV85?.() ?? {};
    const seed = ((safeInt(this.rootSeed) ^ 0x146a1c4e ^ (safeInt(this.actionIndexValue) * 2654435761) ^ (safeInt(realmTier) * 131) ^ (safeInt(batchSize) * 17)) >>> 0) || 1;
    const job = startAlchemyCraftV146({
      container: this.stateValue.economy, inventory: this.stateValue.inventory, family, majorRealmIndex: realmTier, batchSize, furnaceIndex, seed,
      worldYear: this.stateValue.worldTimeYears, worldYearsPerRealHour: WORLD_YEARS_PER_REAL_HOUR, currentMajorRealmIndex: currentMajor,
      facilityModifiers, legacyKnowledge: legacy,
    });
    this.historyValue?.append?.({
      id: `alchemy.v146.start.${job.id}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
      type: 'resource', significance: 4, message: `Lò ${job.furnaceIndex + 1} bắt đầu ${job.name} ×${job.batchSize}.`,
      locationId: this.stateValue.locationId, tags: ['Alchemy', 'V146', 'CraftStart'],
      data: { recipeId: `alchemy.v146.${family}.m${job.majorRealmIndex}`, batchSize: job.batchSize, furnaceIndex: job.furnaceIndex, durationRealSeconds: job.durationRealSeconds },
    });
    this.actionIndexValue = safeInt(this.actionIndexValue) + 1;
    return { job, state: this.state, alchemy: buildAlchemySummaryV146(this) };
  };
  proto.learnAlchemyRecipeV85 = function retireAlchemyRecipeResearchV146(recipeId) {
    prepareSessionAlchemyV146(this);
    return { schema: ALCHEMY_SESSION_BRIDGE_V146_SCHEMA, recipeId: String(recipeId ?? ''), learned: true, autoUnlocked: true, researchRetired: true, cost: { alchemyEssence: 0 }, alchemy: buildAlchemySummaryV146(this), state: this.state };
  };
  proto.plantAlchemyGardenV85 = function plantAlchemyGardenV146Compatibility(_variant, realmTier, slot) {
    if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');
    settleProductionV146(this);
    const currentMajor = currentMajorRealmIndex(this);
    const facility = this.alchemyFacilityProfileV85?.() ?? { level: 1 };
    const plot = plantAlchemyGardenV146({
      container: this.stateValue.economy, inventory: this.stateValue.inventory, worldYear: this.stateValue.worldTimeYears,
      worldYearsPerRealHour: WORLD_YEARS_PER_REAL_HOUR, facilityLevel: facility.level, slot, majorRealmIndex: realmTier, currentMajorRealmIndex: currentMajor,
    });
    this.historyValue?.append?.({
      id: `alchemy.v146.garden.plant.${safeInt(this.actionIndexValue)}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
      type: 'resource', significance: 3,
      message: `Dược Viên ô ${plot.slot + 1}: gieo ${alchemyIngredientNameV146(plot.resourceId)}${plot.starterSeedUsed ? ' · dùng Linh Chủng khởi nguyên' : ''}.`,
      locationId: this.stateValue.locationId, tags: ['Alchemy', 'V146', 'Garden', 'Plant'], data: { ...plot },
    });
    this.actionIndexValue = safeInt(this.actionIndexValue) + 1;
    return { plot, alchemy: buildAlchemySummaryV146(this), state: this.state };
  };
  proto.harvestAlchemyGardenV85 = function harvestAlchemyGardenV146Compatibility(slot) {
    if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');
    settleProductionV146(this);
    const result = harvestAlchemyGardenV146({ container: this.stateValue.economy, inventory: this.stateValue.inventory, worldYear: this.stateValue.worldTimeYears, slot });
    this.historyValue?.append?.({
      id: `alchemy.v146.garden.harvest.${safeInt(this.actionIndexValue)}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
      type: 'resource', significance: result.stage === 'ancient' ? 10 : result.stage === 'old' ? 6 : 3,
      message: `Dược Viên thu ${result.yield} ${result.name} · ${result.stage === 'ancient' ? 'Cổ Linh' : result.stage === 'old' ? 'Lâu Năm' : 'Thành Thục'}.`,
      locationId: this.stateValue.locationId, tags: ['Alchemy', 'V146', 'Garden', 'Harvest', result.stage], data: { ...result },
    });
    this.actionIndexValue = safeInt(this.actionIndexValue) + 1;
    return { ...result, alchemy: buildAlchemySummaryV146(this), state: this.state };
  };
  proto.promoteAlchemyV112 = function promoteAlchemyV146Compatibility() {
    if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');
    settleProductionV146(this);
    const { alchemy } = prepareSessionAlchemyV146(this);
    const result = promoteAlchemyV146(alchemy);
    persistAlchemyKnowledgeV146(this, alchemy);
    const tree = this.metaValue?.reincarnationProgress?.tree;
    if (tree?.highestAchievementTierByTree) tree.highestAchievementTierByTree.alchemy = Math.max(tree.highestAchievementTierByTree.alchemy ?? 0, alchemy.rank - 1);
    this.historyValue?.append?.({
      id: `alchemy.v146.promote.${safeInt(this.actionIndexValue)}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
      type: 'system', significance: 20 + alchemy.rank * 3,
      message: `Đan Đạo tiến cảnh: ${ALCHEMY_RANK_NAMES[result.from.rank - 1]} · ${ALCHEMY_TURN_NAMES[result.from.turn - 1]} → ${ALCHEMY_RANK_NAMES[result.to.rank - 1]} · ${ALCHEMY_TURN_NAMES[result.to.turn - 1]}.`,
      locationId: this.stateValue.locationId, tags: ['Alchemy', 'V146', 'Promotion'], data: result,
    });
    this.actionIndexValue = safeInt(this.actionIndexValue) + 1;
    return { ...result, state: this.state, alchemy: buildAlchemySummaryV146(this) };
  };
  if (typeof originalAdvanceRealtime === 'function') {
    proto.advanceRealtimeCultivationV140 = function advanceRealtimeWithAlchemyV146(...args) {
      const result = originalAdvanceRealtime.apply(this, args);
      const alchemyV146Completions = settleProductionV146(this).completions;
      return alchemyV146Completions.length ? { ...result, alchemyV146Completions } : result;
    };
  }
  if (typeof originalResolveOffline === 'function') {
    proto.resolveRealtimeOffline = function resolveRealtimeOfflineWithAlchemyV146(...args) {
      const result = originalResolveOffline.apply(this, args);
      settleProductionV146(this);
      return result;
    };
  }
}

installBridge();

export function alchemySessionBridgeV146Status() {
  return { schema: ALCHEMY_SESSION_BRIDGE_V146_SCHEMA, installed: Boolean(SimulationSession.prototype[INSTALL_KEY]), compatibilityMethodNames: true, canonicalSystem: 'alchemy.v146' };
}
