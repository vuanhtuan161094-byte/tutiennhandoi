import {
  CULTIVATION_REALMS_V140,
  CULTIVATION_TICK_SECONDS_V140,
  RETREAT_DAILY_BANK_HOURS_V140,
  isMajorRealmGateV140,
} from './cultivation-v140.js';
import { buildManualCatalogV127, manualEffectMultiplierV127, manualUnlockedV127 } from './manual-progression-v127.js';
import {
  ALCHEMY_V146_FAMILIES,
  ALCHEMY_V146_LIVE_FAMILY_IDS,
  ALCHEMY_V146_MAJOR_REALM_COUNT,
  ALCHEMY_V146_CULTIVATION_PILL_CAP_PER_MAJOR_REALM,
  ALCHEMY_V146_VIRTUAL_CORE_KILLS_PER_DROP_BY_ZONE,
  alchemyBossFirstClearDemonCoresCumulativeV146,
  alchemyCultivationPillTotalSupremePctV146,
  alchemyRecipeAvailableV146,
  alchemyRecipeIngredientsV146,
} from './alchemy-v146.js';
import {
  ALCHEMY_V146_GARDEN_YIELD,
  alchemyGardenGrowthRealMinutesV146,
  alchemyGardenSlotCountV146,
} from './alchemy-production-v146.js';
import { resourcePveProductionCatalogV109 } from './resource-pve-v12329.js';
import { ECONOMY_PRODUCTION_V111 } from './economy-production-v111.js';

export const FULL_LIFE_ECONOMY_PACING_V160_SCHEMA = 'full-life-economy-pacing.v160';
const MANUALS_V127 = buildManualCatalogV127();
const round = (v, d = 4) => Number(Number(v || 0).toFixed(d));
const pct = v => Math.max(0, Number(v) || 0);

export const V160_MANUAL_AUDIT_PROFILES = Object.freeze({
  none: Object.freeze({ id: 'none', label: 'Không Công Pháp', progress: undefined }),
  learned100: Object.freeze({ id: 'learned100', label: 'Mọi bộ đã mở ở Lv100', progress: Object.freeze({ level: 100, advance: 0 }) }),
  learned500: Object.freeze({ id: 'learned500', label: 'Mọi bộ đã mở ở Lv500 / 4 gate', progress: Object.freeze({ level: 500, advance: 4 }) }),
  maxed: Object.freeze({ id: 'maxed', label: 'Audit envelope: mọi bộ đã mở max', progress: Object.freeze({ level: 1000, advance: 10 }) }),
});

function manualFlat(def) {
  return Math.max(0, Number(def?.stats?.find(x => x.id === 'cultivationFlatPer15s')?.value) || 0);
}
export function manualFlatTuViPer15sEnvelopeV160(realmOrder, profileId = 'none', tree = {}) {
  const profile = V160_MANUAL_AUDIT_PROFILES[profileId] ?? V160_MANUAL_AUDIT_PROFILES.none;
  if (!profile.progress) return 0;
  return MANUALS_V127.filter(def => manualUnlockedV127(def, realmOrder))
    .reduce((sum, def) => sum + manualFlat(def) * manualEffectMultiplierV127(profile.progress, tree), 0);
}

export function cultivationPacingRowV160(row, scenario = {}) {
  const required = Math.max(0, Number(row?.requiredTuVi) || 0);
  const terminal = !row?.nextRealmId || required <= 0;
  const authoredPct = pct(scenario.spiritualRootPct) + pct(scenario.reincarnationPct) + pct(scenario.fatePct) + pct(scenario.otherAuthoredPct);
  const manualTuVi = manualFlatTuViPer15sEnvelopeV160(row.order, scenario.manualProfile ?? 'none', scenario.manualTree ?? {});
  const extraFlat = Math.max(0, Number(scenario.reincarnationFlatTuViPer15s) || 0) + Math.max(0, Number(scenario.otherFlatTuViPer15s) || 0);
  const rate = Math.max(0, Number(row.baseTuViPer15s) || 0) * (1 + authoredPct / 100) + manualTuVi + extraFlat;
  const majorGate = !terminal && Boolean(isMajorRealmGateV140(row.order));
  const majorRequirementReductionPct = majorGate ? Math.min(5, pct(scenario.majorRequirementReductionPct)) : 0;
  const effectiveRequirement = required * (1 - majorRequirementReductionPct / 100);
  const passivePerDay = rate * 86400 / CULTIVATION_TICK_SECONDS_V140;
  const retreat3hProgressPct = Math.max(0, Number(row.retreat3hProgressPct) || 0);
  const retreatPerDay = required * retreat3hProgressPct / 100;
  const major = Math.max(0, Math.min(ALCHEMY_V146_MAJOR_REALM_COUNT, Math.floor(Number(row.majorRealmIndex) || 0)));
  const pillCapPct = terminal ? 0 : alchemyCultivationPillTotalSupremePctV146(major);
  const pillUsePct = scenario.useMaxCultivationPills ? pillCapPct : 0;
  const afterPills = Math.max(0, effectiveRequirement - required * pillUsePct / 100);
  const passiveDays = terminal || rate <= 0 ? 0 : effectiveRequirement / passivePerDay;
  const retreatDays = terminal || rate <= 0 ? 0 : effectiveRequirement / (passivePerDay + retreatPerDay);
  const retreatPillDays = terminal || rate <= 0 ? 0 : afterPills / (passivePerDay + retreatPerDay);
  return {
    order: row.order, realmId: row.id, name: row.name, majorRealmIndex: row.majorRealmIndex, majorRealmName: row.majorRealmName, stageIndex: row.stageIndex,
    terminal, majorGate, requiredTuVi: required, effectiveRequirement: round(effectiveRequirement, 2), baseTuViPer15s: row.baseTuViPer15s,
    percentOfBase: round(authoredPct, 3), manualFlatTuViPer15s: round(manualTuVi, 3), otherFlatTuViPer15s: round(extraFlat, 3), finalTuViPer15sEnvelope: round(rate, 3),
    authoredBaselineDays: round(terminal ? 0 : Math.max(0, Number(row.targetSeconds) || 0) / 86400, 6), passiveDaysEnvelope: round(passiveDays, 6),
    retreat: { dailyBankHours: RETREAT_DAILY_BANK_HOURS_V140, authored3hProgressPct: retreat3hProgressPct, tuViPerDailyClaim: round(retreatPerDay, 2), steadyDaysWithDailyRetreat: round(retreatDays, 6) },
    cultivationPills: { capCount: ALCHEMY_V146_CULTIVATION_PILL_CAP_PER_MAJOR_REALM, maxSupremeShortcutPct: round(pillCapPct, 3), modeledPct: round(pillUsePct, 3), steadyDaysWithRetreatAndPills: round(retreatPillDays, 6) },
    majorRequirementReductionPct: round(majorRequirementReductionPct, 3),
  };
}

function aggregateMajor(rows) {
  const map = new Map();
  for (const row of rows) {
    const b = map.get(row.majorRealmIndex) ?? { majorRealmIndex: row.majorRealmIndex, majorRealmName: row.majorRealmName, orders: [], baselineDays: 0, passiveDaysEnvelope: 0, retreatDaysEnvelope: 0, retreatAndPillDaysEnvelope: 0 };
    b.orders.push(row.order); b.baselineDays += row.authoredBaselineDays; b.passiveDaysEnvelope += row.passiveDaysEnvelope;
    b.retreatDaysEnvelope += row.retreat.steadyDaysWithDailyRetreat; b.retreatAndPillDaysEnvelope += row.cultivationPills.steadyDaysWithRetreatAndPills; map.set(row.majorRealmIndex, b);
  }
  return [...map.values()].map(x => ({ ...x, baselineDays: round(x.baselineDays), passiveDaysEnvelope: round(x.passiveDaysEnvelope), retreatDaysEnvelope: round(x.retreatDaysEnvelope), retreatAndPillDaysEnvelope: round(x.retreatAndPillDaysEnvelope) }));
}

export function alchemyEconomyAuditV160() {
  const majors = [];
  for (let major = 0; major <= ALCHEMY_V146_MAJOR_REALM_COUNT; major++) {
    let herbCostOneOfEach = 0, demonCoreCostOneOfEach = 0, recipeCount = 0;
    for (const family of ALCHEMY_V146_LIVE_FAMILY_IDS) {
      if (!alchemyRecipeAvailableV146(family, major)) continue;
      recipeCount++;
      for (const item of alchemyRecipeIngredientsV146(family, major)) {
        if (item.family === 'herb') herbCostOneOfEach += item.quantity;
        if (item.family === 'demonCore') demonCoreCostOneOfEach += item.quantity;
      }
    }
    const growth1 = alchemyGardenGrowthRealMinutesV146(major, 1), growth10 = alchemyGardenGrowthRealMinutesV146(major, 10);
    const slots1 = alchemyGardenSlotCountV146(1), slots10 = alchemyGardenSlotCountV146(10);
    majors.push({
      majorRealmIndex: major, recipeCount, herbCostOneOfEach, demonCoreCostOneOfEach,
      cultivationPillMaxSupremePct: round(alchemyCultivationPillTotalSupremePctV146(major), 3),
      garden: {
        level1: { slots: slots1, matureMinutes: round(growth1, 2), grossMatureHerbsPerDay: round(slots1 * ALCHEMY_V146_GARDEN_YIELD.mature * 1440 / growth1, 2) },
        level10: { slots: slots10, matureMinutes: round(growth10, 2), grossMatureHerbsPerDay: round(slots10 * ALCHEMY_V146_GARDEN_YIELD.mature * 1440 / growth10, 2) },
        note: 'Gross harvest; one harvested herb may be recycled as the next seed after the one-time starter seed.',
      },
      demonCore: major === 0 ? undefined : { bossFirstClearTotal800: alchemyBossFirstClearDemonCoresCumulativeV146(800), killsPerDropWorstZone: ALCHEMY_V146_VIRTUAL_CORE_KILLS_PER_DROP_BY_ZONE[0], killsPerDropBestZone: ALCHEMY_V146_VIRTUAL_CORE_KILLS_PER_DROP_BY_ZONE.at(-1) },
    });
  }
  return { familyCount: Object.keys(ALCHEMY_V146_FAMILIES).length, majorRealmCount: ALCHEMY_V146_MAJOR_REALM_COUNT, majors };
}

export function resourcePveEconomyAuditV160() {
  return resourcePveProductionCatalogV109().map(row => ({ id: row.id, category: row.category, floorCount: row.floorCount, firstClearMode: row.firstClearMode, farmMode: row.farmMode, specificFragments: row.specificFragments, materialPerYear: [...row.materialPerYear], breakthroughPerYear: [...row.breakthroughPerYear], maxMaterialPerYear: Math.max(...row.materialPerYear), maxBreakthroughPerYear: Math.max(...row.breakthroughPerYear) }));
}
export function boundJadeEconomyAuditV160() {
  const pvpDaily = ECONOMY_PRODUCTION_V111.dailyPvpPaidWins * ECONOMY_PRODUCTION_V111.pvpRewardPerWin;
  const weeks = Math.floor(ECONOMY_PRODUCTION_V111.cycleDays / 7);
  const recurring28 = (ECONOMY_PRODUCTION_V111.dailyActivityBoundJade + pvpDaily) * ECONOMY_PRODUCTION_V111.cycleDays + ECONOMY_PRODUCTION_V111.weeklyRecurringBoundJade * weeks;
  const firstClearBurst28 = ECONOMY_PRODUCTION_V111.weeklyFirstClearBoundJade * weeks;
  return { cycleDays: ECONOMY_PRODUCTION_V111.cycleDays, dailyActivityBoundJade: ECONOMY_PRODUCTION_V111.dailyActivityBoundJade, pvpDailyBoundJadeCap: pvpDaily, weeklyRecurringBoundJade: ECONOMY_PRODUCTION_V111.weeklyRecurringBoundJade, recurring28, firstClearBurst28, gachaSingleCost: ECONOMY_PRODUCTION_V111.gachaSingleCost, gachaTenCost: ECONOMY_PRODUCTION_V111.gachaTenCost, equivalentDiscountedPullsFromRecurring28: round(recurring28 / (ECONOMY_PRODUCTION_V111.gachaTenCost / 10), 2) };
}
function flagsFor(baselineRows, maxRows, resourcePve) {
  const flags = [];
  for (let i = 1; i < baselineRows.length - 1; i++) {
    const prev = baselineRows[i - 1].authoredBaselineDays, cur = baselineRows[i].authoredBaselineDays;
    if (prev > 0 && cur / prev >= 2.5) flags.push({ severity: 'review', id: 'baseline-duration-jump', order: baselineRows[i].order, ratio: round(cur / prev, 2) });
  }
  for (const row of maxRows) {
    if (row.terminal || row.baseTuViPer15s <= 0) continue;
    const ratio = row.finalTuViPer15sEnvelope / row.baseTuViPer15s;
    if (ratio >= 10) flags.push({ severity: 'review', id: 'manual-max-envelope-runaway', order: row.order, rateVsBase: round(ratio, 2), note: 'Theoretical max envelope, not a claim that a normal player owns/maxes every unlocked manual here.' });
  }
  if (resourcePve.some(x => x.specificFragments === 'gacha-only')) flags.push({ severity: 'measure', id: 'specific-fragment-pacing-unresolved', note: 'Resource PvE explicitly does not drop specific collection/manual fragments; acquisition-time must be measured through Vạn Tượng/pity/source authority before global pacing can be called complete.' });
  return flags;
}
export function buildFullLifeEconomyPacingAuditV160() {
  const baselineRows = CULTIVATION_REALMS_V140.map(row => cultivationPacingRowV160(row));
  const manual100Rows = CULTIVATION_REALMS_V140.map(row => cultivationPacingRowV160(row, { manualProfile: 'learned100' }));
  const manual500Rows = CULTIVATION_REALMS_V140.map(row => cultivationPacingRowV160(row, { manualProfile: 'learned500' }));
  const maxRows = CULTIVATION_REALMS_V140.map(row => cultivationPacingRowV160(row, { manualProfile: 'maxed' }));
  const pillRows = CULTIVATION_REALMS_V140.map(row => cultivationPacingRowV160(row, { useMaxCultivationPills: true }));
  const resourcePve = resourcePveEconomyAuditV160();
  const sum = (rows, fn) => round(rows.reduce((s, x) => s + fn(x), 0), 3);
  return {
    schema: FULL_LIFE_ECONOMY_PACING_V160_SCHEMA,
    scope: { realmOrders: CULTIVATION_REALMS_V140.length, nonTerminalOrders: CULTIVATION_REALMS_V140.filter(x => x.nextRealmId).length, majorMilestones: new Set(CULTIVATION_REALMS_V140.map(x => x.majorRealmIndex)).size, tickSeconds: CULTIVATION_TICK_SECONDS_V140, retreatDailyBankHours: RETREAT_DAILY_BANK_HOURS_V140, disclaimer: 'Audit/envelope model over production-authored authorities. Manual max profiles and steady-state retreat figures are diagnostics, not promises of player calendar completion time.' },
    totals: {
      authoredBaselineDays: sum(baselineRows, x => x.authoredBaselineDays),
      allUnlockedManualsLv100PassiveDaysEnvelope: sum(manual100Rows, x => x.passiveDaysEnvelope),
      allUnlockedManualsLv500PassiveDaysEnvelope: sum(manual500Rows, x => x.passiveDaysEnvelope),
      allUnlockedManualsMaxPassiveDaysEnvelope: sum(maxRows, x => x.passiveDaysEnvelope),
      baselineWithDailyRetreatSteadyDays: sum(baselineRows, x => x.retreat.steadyDaysWithDailyRetreat),
      baselineWithDailyRetreatAndMaxSupremePillsSteadyDays: sum(pillRows, x => x.cultivationPills.steadyDaysWithRetreatAndPills),
    },
    majors: aggregateMajor(baselineRows), rows: baselineRows,
    envelopes: { manualsLv100: manual100Rows, manualsLv500: manual500Rows, manualsMax: maxRows },
    alchemy: alchemyEconomyAuditV160(), resourcePve, boundJade: boundJadeEconomyAuditV160(), flags: flagsFor(baselineRows, maxRows, resourcePve),
  };
}
