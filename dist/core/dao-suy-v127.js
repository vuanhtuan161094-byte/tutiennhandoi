import { WORLD_YEARS_PER_REAL_DAY, targetIdleSecondsForRealm } from './realtime-balance.js';
import { reincarnationTreeRuntimeModifierV136 } from './reincarnation-progression-v1102.js';

export const DAO_SUY_START_REALM_ORDER_V127 = 46;
export const DAO_SUY_MAX_V127 = 100;
/** V129 balance: a baseline player gains about 30 Đạo Suy over one full Immortal+ major realm. */
export const DAO_SUY_TARGET_PER_MAJOR_REALM_V129 = 30;
export const DAO_SUY_MAJOR_ASCENSION_RELIEF_V140 = 15;
export const DAO_SUY_TRIBULATION_SUCCESS_RELIEF_V127 = 40;
export const DAO_SUY_TRIBULATION_FAILURE_GAIN_V127 = 10;
export const DAO_SUY_TRIBULATION_MIN_V127 = 80;
// A life may rescue itself only a finite number of times inside one Immortal major realm.
// Advancing to the next major realm opens a fresh quota, but camping the same realm can no
// longer be sustained forever by repeatedly farming Suy Kiep.
export const DAO_SUY_TRIBULATION_MAX_SUCCESSES_PER_MAJOR_V127 = 5;

export function daoSuyMajorKeyV127(realmOrder = DAO_SUY_START_REALM_ORDER_V127) {
  const order = Math.max(DAO_SUY_START_REALM_ORDER_V127, Math.floor(Number(realmOrder) || DAO_SUY_START_REALM_ORDER_V127));
  const start = DAO_SUY_START_REALM_ORDER_V127 + Math.floor((order - DAO_SUY_START_REALM_ORDER_V127) / 4) * 4;
  return String(start);
}

export function ensureDaoSuyStateV127(immortal = {}) {
  immortal.daoSuy = Math.max(0, Math.min(DAO_SUY_MAX_V127, Number(immortal.daoSuy) || 0));
  immortal.daoSuyTribulationsPassed = Math.max(0, Math.floor(Number(immortal.daoSuyTribulationsPassed) || 0));
  immortal.daoSuyTribulationsFailed = Math.max(0, Math.floor(Number(immortal.daoSuyTribulationsFailed) || 0));
  const raw = immortal.daoSuyTribulationsPassedByMajor && typeof immortal.daoSuyTribulationsPassedByMajor === 'object'
    ? immortal.daoSuyTribulationsPassedByMajor : {};
  immortal.daoSuyTribulationsPassedByMajor = Object.fromEntries(Object.entries(raw).map(([key,value])=>[
    String(key), Math.max(0, Math.min(DAO_SUY_TRIBULATION_MAX_SUCCESSES_PER_MAJOR_V127, Math.floor(Number(value) || 0)))
  ]));
  return immortal;
}

export function daoSuyTribulationSuccessesThisMajorV127(immortal, realmOrder) {
  ensureDaoSuyStateV127(immortal);
  return Math.max(0, Math.floor(Number(immortal.daoSuyTribulationsPassedByMajor[daoSuyMajorKeyV127(realmOrder)]) || 0));
}

export function daoSuyTribulationRescuesRemainingV127(immortal, realmOrder) {
  return Math.max(0, DAO_SUY_TRIBULATION_MAX_SUCCESSES_PER_MAJOR_V127 - daoSuyTribulationSuccessesThisMajorV127(immortal, realmOrder));
}

export function daoSuyRateReductionPctV127(origins = {}) {
  return Math.max(0, Math.min(25, reincarnationTreeRuntimeModifierV136(origins, 'cultivation.daoDecayRateReductionPct')));
}

export function daoSuyMajorBaselineRealDaysV129(realmOrder = DAO_SUY_START_REALM_ORDER_V127) {
  const order = Math.max(DAO_SUY_START_REALM_ORDER_V127, Math.min(117, Math.floor(Number(realmOrder) || DAO_SUY_START_REALM_ORDER_V127)));
  const start = DAO_SUY_START_REALM_ORDER_V127 + Math.floor((order - DAO_SUY_START_REALM_ORDER_V127) / 4) * 4;
  const end = Math.min(117, start + 3);
  let seconds = 0;
  for (let stage = start; stage <= end; stage++) seconds += targetIdleSecondsForRealm(stage);
  return Math.max(1, seconds / 86_400);
}

export function daoSuyPerRealDayV127(origins = {}, realmOrder = DAO_SUY_START_REALM_ORDER_V127) {
  const baselineDays = daoSuyMajorBaselineRealDaysV129(realmOrder);
  return DAO_SUY_TARGET_PER_MAJOR_REALM_V129 / baselineDays * (1 - daoSuyRateReductionPctV127(origins) / 100);
}

export function advanceDaoSuyByWorldYearsV127(immortal, realmOrder, worldYears, origins = {}) {
  ensureDaoSuyStateV127(immortal);
  if (Math.max(0, Number(realmOrder) || 0) < DAO_SUY_START_REALM_ORDER_V127) return 0;
  const days = Math.max(0, Number(worldYears) || 0) / Math.max(1e-12, WORLD_YEARS_PER_REAL_DAY);
  const gain = days * daoSuyPerRealDayV127(origins, realmOrder);
  const before = immortal.daoSuy;
  immortal.daoSuy = Math.min(DAO_SUY_MAX_V127, before + gain);
  return immortal.daoSuy - before;
}

export function relieveDaoSuyOnMajorAscensionV140(immortal, fromOrder, toOrder) {
  ensureDaoSuyStateV127(immortal);
  const from = Math.max(0, Math.floor(Number(fromOrder) || 0));
  const to = Math.max(0, Math.floor(Number(toOrder) || 0));
  if (to < DAO_SUY_START_REALM_ORDER_V127 || to <= from || to % 4 !== 2) return 0;
  const before = immortal.daoSuy;
  immortal.daoSuy = Math.max(0, before - DAO_SUY_MAJOR_ASCENSION_RELIEF_V140);
  return before - immortal.daoSuy;
}

export function daoSuyCultivationMultiplierV127(immortal, realmOrder) {
  ensureDaoSuyStateV127(immortal);
  if (Math.max(0, Number(realmOrder) || 0) < DAO_SUY_START_REALM_ORDER_V127) return 1;
  if (immortal.daoSuy >= 80) return 0.8;
  if (immortal.daoSuy >= 60) return 0.9;
  return 1;
}

export function daoSuyCombatMultiplierV127(immortal, realmOrder) {
  ensureDaoSuyStateV127(immortal);
  if (Math.max(0, Number(realmOrder) || 0) < DAO_SUY_START_REALM_ORDER_V127) return 1;
  return immortal.daoSuy >= 80 ? 0.9 : 1;
}

export function daoSuyLongActivityLockedV127(immortal, realmOrder) {
  ensureDaoSuyStateV127(immortal);
  return Math.max(0, Number(realmOrder) || 0) >= DAO_SUY_START_REALM_ORDER_V127 && immortal.daoSuy >= DAO_SUY_MAX_V127 - 1e-9;
}


export function resolveDaoSuyTribulationV127(immortal, won, origins = {}, realmOrder = DAO_SUY_START_REALM_ORDER_V127) {
  ensureDaoSuyStateV127(immortal);
  if (immortal.daoSuy < DAO_SUY_TRIBULATION_MIN_V127 - 1e-9)
    throw new Error(`Suy Kiếp chỉ có thể dẫn khi Đạo Suy đạt ${DAO_SUY_TRIBULATION_MIN_V127}.`);
  const before = immortal.daoSuy;
  if (won) {
    const majorKey = daoSuyMajorKeyV127(realmOrder);
    const passedThisMajor = daoSuyTribulationSuccessesThisMajorV127(immortal, realmOrder);
    if (passedThisMajor >= DAO_SUY_TRIBULATION_MAX_SUCCESSES_PER_MAJOR_V127)
      throw new Error(`Đại cảnh hiện tại đã dùng hết ${DAO_SUY_TRIBULATION_MAX_SUCCESSES_PER_MAJOR_V127} lần Suy Kiếp cứu mệnh; không thể trì hoãn Đạo Suy vô hạn.`);
    const passedBefore = immortal.daoSuyTribulationsPassed;
    // Each rescue becomes less efficient. This keeps repeated Suy Kiếp useful but prevents one
    // fixed encounter from functioning as a permanent reset button.
    const relief = Math.max(20, DAO_SUY_TRIBULATION_SUCCESS_RELIEF_V127 - passedBefore * 4);
    immortal.daoSuy = Math.max(0, before - relief);
    immortal.daoSuyTribulationsPassed += 1;
    immortal.daoSuyTribulationsPassedByMajor[majorKey] = passedThisMajor + 1;
    return { won: true, before, after: immortal.daoSuy, relief: before - immortal.daoSuy, gain: 0,
      majorKey, successesThisMajor: passedThisMajor + 1,
      rescuesRemainingThisMajor: DAO_SUY_TRIBULATION_MAX_SUCCESSES_PER_MAJOR_V127 - passedThisMajor - 1 };
  }
  const guardPct = Math.max(0, Math.min(30, reincarnationTreeRuntimeModifierV136(origins, 'cultivation.tribulationFailureDaoDecayLossReductionPct')));
  const gain = DAO_SUY_TRIBULATION_FAILURE_GAIN_V127 * (1 - guardPct / 100);
  immortal.daoSuy = Math.min(DAO_SUY_MAX_V127, before + gain);
  immortal.daoSuyTribulationsFailed += 1;
  return { won: false, before, after: immortal.daoSuy, relief: 0, gain: immortal.daoSuy - before, failureGuardPct: guardPct };
}

export function daoSuyStatusV127(immortal, realmOrder, origins = {}) {
  ensureDaoSuyStateV127(immortal);
  const active = Math.max(0, Number(realmOrder) || 0) >= DAO_SUY_START_REALM_ORDER_V127;
  const value = active ? immortal.daoSuy : 0;
  const successesThisMajor = active ? daoSuyTribulationSuccessesThisMajorV127(immortal, realmOrder) : 0;
  const rescuesRemainingThisMajor = active ? daoSuyTribulationRescuesRemainingV127(immortal, realmOrder) : 0;
  return {
    schema: 'dao-suy.v127', active, value, max: DAO_SUY_MAX_V127,
    perRealDay: active ? daoSuyPerRealDayV127(origins, realmOrder) : 0,
    rateReductionPct: active ? daoSuyRateReductionPctV127(origins) : 0,
    cultivationPenaltyPct: active ? Math.round((1 - daoSuyCultivationMultiplierV127(immortal, realmOrder)) * 100) : 0,
    combatPenaltyPct: active ? Math.round((1 - daoSuyCombatMultiplierV127(immortal, realmOrder)) * 100) : 0,
    longActivityLocked: active && daoSuyLongActivityLockedV127(immortal, realmOrder),
    nextThreshold: value < 60 ? 60 : value < 80 ? 80 : value < 100 ? 100 : 100,
    canChallengeSuyKiep: active && value >= DAO_SUY_TRIBULATION_MIN_V127 && rescuesRemainingThisMajor > 0,
    tribulationsPassed: immortal.daoSuyTribulationsPassed,
    tribulationsFailed: immortal.daoSuyTribulationsFailed,
    tribulationMaxSuccessesPerMajor: DAO_SUY_TRIBULATION_MAX_SUCCESSES_PER_MAJOR_V127,
    tribulationSuccessesThisMajor: successesThisMajor,
    tribulationRescuesRemainingThisMajor: rescuesRemainingThisMajor,
    tribulationRescueExhausted: active && rescuesRemainingThisMajor <= 0,
  };
}
