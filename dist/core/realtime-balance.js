import { baseTuViPer15sV140, cultivationRealmV140, CULTIVATION_TICK_SECONDS_V140, RETREAT_DAILY_BANK_HOURS_V140, RETREAT_BANK_CAP_HOURS_V140 } from './cultivation-v140.js';
export const WORLD_YEARS_PER_REAL_DAY = 100;
export const WORLD_YEARS_PER_REAL_HOUR = WORLD_YEARS_PER_REAL_DAY / 24;
export const REAL_SECONDS_PER_WORLD_YEAR = 86_400 / WORLD_YEARS_PER_REAL_DAY;
export const WORLD_YEARS_PER_REAL_SECOND = WORLD_YEARS_PER_REAL_DAY / 86_400;
export const LIVE_COMMIT_REAL_SECONDS = CULTIVATION_TICK_SECONDS_V140;
export const OFFLINE_CAP_REAL_HOURS = 24;
export const RETREAT_DEFAULT_REAL_HOURS = RETREAT_DAILY_BANK_HOURS_V140;
export const RETREAT_MAX_REAL_HOURS = RETREAT_BANK_CAP_HOURS_V140;
export const RETREAT_DAILY_MAX_REAL_HOURS = RETREAT_DAILY_BANK_HOURS_V140;
export const HUNT_CULTIVATION_CYCLES_PER_YEAR = 1;
export function cultivationMajorRealmIndex(realmOrder){ return cultivationRealmV140(Math.max(0,Math.min(117,Math.floor(Number(realmOrder)||0)))).majorRealmIndex; }
export function targetIdleSecondsForRealm(order){ return cultivationRealmV140(Math.max(0,Math.min(117,Math.floor(Number(order)||0)))).targetSeconds; }
export function realtimeCultivationYieldMultiplier(){ return 1; }
export function nominalIdleTuViPerSecond(realm){ return Math.max(0,baseTuViPer15sV140(realm?.order??0))/CULTIVATION_TICK_SECONDS_V140; }
export function nominalHuntTuViPerSecond(realm){ return nominalIdleTuViPerSecond(realm); }
