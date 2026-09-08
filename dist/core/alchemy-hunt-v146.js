import {
  ALCHEMY_V146_MAJOR_REALM_COUNT,
  alchemyBossFirstClearDemonCoreDeltaV146,
  alchemyDemonCoreResourceIdV146,
  settleAlchemyVirtualDemonCoresV146,
} from './alchemy-v146.js';

export const ALCHEMY_HUNT_V146_SCHEMA = 'alchemy-hunt.v146';

const safeInt = (value, fallback = 0) => Math.max(0, Math.floor(Number.isFinite(Number(value)) ? Number(value) : fallback));
const clampZone = value => Math.max(1, Math.min(8, safeInt(value, 1)));

function cloneCounterMap(value, maxValue = Number.MAX_SAFE_INTEGER) {
  const out = {};
  for (const [key, raw] of Object.entries(value ?? {})) {
    const major = safeInt(key);
    if (major < 1 || major > ALCHEMY_V146_MAJOR_REALM_COUNT) continue;
    out[String(major)] = Math.min(maxValue, safeInt(raw));
  }
  return out;
}

function inventoryCount(inventory, resourceId) {
  const raw = inventory?.[resourceId];
  if (typeof raw === 'bigint') return Number(raw > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : raw);
  if (typeof raw === 'string' && /^\d+$/.test(raw)) return Math.max(0, Number(raw));
  return Math.max(0, Number(raw) || 0);
}

function addInventory(inventory, resourceId, amount) {
  const gain = safeInt(amount);
  if (gain <= 0) return inventoryCount(inventory, resourceId);
  inventory[resourceId] = inventoryCount(inventory, resourceId) + gain;
  return inventory[resourceId];
}

export function createAlchemyHuntProgressV146() {
  return {
    schema: ALCHEMY_HUNT_V146_SCHEMA,
    virtualProgressByMajor: {},
    firstClearCountByMajor: {},
  };
}

export function cloneAlchemyHuntProgressV146(value) {
  return {
    schema: ALCHEMY_HUNT_V146_SCHEMA,
    virtualProgressByMajor: cloneCounterMap(value?.virtualProgressByMajor),
    firstClearCountByMajor: cloneCounterMap(value?.firstClearCountByMajor, 800),
  };
}

/**
 * Canonical V146 Hunt -> Yêu Đan settlement.
 *
 * - Realm-gated: a map above the character's reached major realm cannot mint V146 materials.
 * - Săn Ảo: deterministic O(1) meter, with the remainder persisted by major realm.
 * - Real Boss: first-clear count is sequential within a major realm; cumulative rewards are
 *   derived from the same 800-floor schedule used by alchemyBossFirstClearDemonCoreDeltaV146.
 *
 * This module owns only the Alchemy reward calculation. The caller remains the canonical Hunt
 * event authority and persists the returned progress state.
 */
export function settleAlchemyHuntRewardsV146(progressValue, inventory, context = {}) {
  const progress = cloneAlchemyHuntProgressV146(progressValue);
  const majorRealmIndex = safeInt(context.majorRealmIndex);
  const currentMajorRealmIndex = Math.min(ALCHEMY_V146_MAJOR_REALM_COUNT, safeInt(context.currentMajorRealmIndex));
  const zone = clampZone(context.zone);
  const kills = safeInt(context.kills);
  const sourceUnlocked = majorRealmIndex >= 1
    && majorRealmIndex <= ALCHEMY_V146_MAJOR_REALM_COUNT
    && majorRealmIndex <= currentMajorRealmIndex;

  if (!sourceUnlocked) {
    return {
      state: progress,
      schema: ALCHEMY_HUNT_V146_SCHEMA,
      majorRealmIndex,
      zone,
      kills,
      sourceUnlocked: false,
      resourceId: undefined,
      amount: 0,
      virtualAmount: 0,
      firstClearAmount: 0,
      virtualProgress: 0,
      firstClearCount: 0,
    };
  }

  const key = String(majorRealmIndex);
  const resourceId = alchemyDemonCoreResourceIdV146(majorRealmIndex);
  let virtualAmount = 0;
  let firstClearAmount = 0;
  let virtualProgress = safeInt(progress.virtualProgressByMajor[key]);
  let firstClearCount = Math.min(800, safeInt(progress.firstClearCountByMajor[key]));

  if (context.countForOriginMeter && kills > 0) {
    const settlement = settleAlchemyVirtualDemonCoresV146({ kills, zone, progress: virtualProgress });
    virtualAmount = settlement.amount;
    virtualProgress = settlement.progress;
    progress.virtualProgressByMajor[key] = virtualProgress;
  }

  if (context.firstClear && firstClearCount < 800) {
    const previous = firstClearCount;
    firstClearCount += 1;
    progress.firstClearCountByMajor[key] = firstClearCount;
    firstClearAmount = alchemyBossFirstClearDemonCoreDeltaV146(previous, firstClearCount);
  }

  const amount = virtualAmount + firstClearAmount;
  const ownedAfter = addInventory(inventory, resourceId, amount);
  return {
    state: progress,
    schema: ALCHEMY_HUNT_V146_SCHEMA,
    majorRealmIndex,
    zone,
    kills,
    sourceUnlocked: true,
    resourceId,
    amount,
    virtualAmount,
    firstClearAmount,
    virtualProgress,
    firstClearCount,
    ownedAfter,
  };
}
