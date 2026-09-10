import { createCollectionProgressStateV12316 } from './collection-progression-v12316.js';
import {
  setManualGachaRealmV127,
  setManualGachaOrientationV127,
  gachaCollectionV12326,
} from './collection-workshop-gacha-v12326.js';
import {
  MANUAL_REALM_STAGES_V127,
  buildManualCatalogV127,
  manualAdvanceCostV127,
} from './manual-progression-v127.js';
import {
  SPIRITUAL_ROOT_ASCENSION_INTERVAL_V145,
  SPIRITUAL_ROOT_VIRTUAL_ORIGIN_PITY_KILLS_V145,
  spiritualRootCultivationBonusPctV145,
  spiritualRootNourishmentCostV145,
  spiritualRootOriginCostV145,
  spiritualRootOriginTierForAscensionV145,
} from './spiritual-root-v145.js';
import {
  reincarnationTreeNodesV136,
  nodeSpentPoints,
  totalTreeMaxCostV127,
  previewReincarnationV2Reward,
} from './reincarnation-progression-v1102.js';
import { FATE_BUILD_TOTAL_UNLOCK_COST_V4 } from './reincarnation-fate-build-v4.js';
import { ECONOMY_PRODUCTION_V111 } from './economy-production-v111.js';

export const FULL_LIFE_ACQUISITION_V160_SCHEMA = 'full-life-acquisition.v160';
const MANUALS = buildManualCatalogV127();
const round = (v, d = 3) => Number(Number(v || 0).toFixed(d));

export function recurringBoundJadePerDayV160() {
  const pvpDaily = ECONOMY_PRODUCTION_V111.dailyPvpPaidWins * ECONOMY_PRODUCTION_V111.pvpRewardPerWin;
  const weeklyDaily = ECONOMY_PRODUCTION_V111.weeklyRecurringBoundJade / 7;
  return ECONOMY_PRODUCTION_V111.dailyActivityBoundJade + pvpDaily + weeklyDaily;
}

function manualTotalGateFragmentsV160(def) {
  let total = 0;
  for (let advance = 0; advance < 10; advance++) total += manualAdvanceCostV127(def, { advance, level: (advance + 1) * 100 });
  return total;
}

function affordableManualGatesV160(def, fragments) {
  let spent = 0;
  let count = 0;
  for (let advance = 0; advance < 10; advance++) {
    const cost = manualAdvanceCostV127(def, { advance, level: (advance + 1) * 100 });
    if (spent + cost > fragments) break;
    spent += cost;
    count += 1;
  }
  return { count, spent, next: count < 10 ? manualAdvanceCostV127(def, { advance: count, level: (count + 1) * 100 }) : 0 };
}

function gachaCostV160(pulls) {
  const p = Math.max(0, Math.floor(Number(pulls) || 0));
  const tens = Math.floor(p / 10);
  const singles = p % 10;
  return tens * ECONOMY_PRODUCTION_V111.gachaTenCost + singles * ECONOMY_PRODUCTION_V111.gachaSingleCost;
}

export function manualAcquisitionSampleV160(stageIndex, pulls, seed = 160000) {
  const stage = MANUAL_REALM_STAGES_V127[Math.max(0, Math.min(MANUAL_REALM_STAGES_V127.length - 1, Math.floor(Number(stageIndex) || 0)))];
  const pool = MANUALS.filter(x => x.realmStageIndex === stage.index);
  const target = [...pool].sort((a, b) => manualTotalGateFragmentsV160(b) - manualTotalGateFragmentsV160(a))[0];
  const state = createCollectionProgressStateV12316();
  state.currencies.boundImmortalJade = 999_999_999;
  const inventory = {};
  setManualGachaRealmV127(state, stage.index, stage.requiredRealmOrder);
  setManualGachaOrientationV127(state, target.id, stage.requiredRealmOrder);
  const seen = new Set();
  let fragmentDrops = 0;
  let itemDrops = 0;
  let orientationHits = 0;
  const totalPulls = Math.max(0, Math.floor(Number(pulls) || 0));
  for (let done = 0; done < totalPulls;) {
    const count = Math.min(10, totalPulls - done);
    const result = gachaCollectionV12326(state, inventory, 'banner.manual', count, seed + done * 17, false, [], stage.requiredRealmOrder);
    for (const row of result.results) {
      if (row.id) seen.add(row.id);
      if (row.kind === 'fragment') {
        fragmentDrops += 1;
        if (row.orientationHit) orientationHits += 1;
      }
      if (row.kind === 'item') itemDrops += 1;
    }
    done += count;
  }
  const progress = state.items[target.id] ?? { owned: false, specificFragments: 0 };
  const fragments = Math.max(0, Number(progress.specificFragments) || 0);
  const affordable = affordableManualGatesV160(target, fragments);
  const jadeCost = gachaCostV160(totalPulls);
  const jadePerDay = recurringBoundJadePerDayV160();
  return {
    stageIndex: stage.index,
    realm: stage.name,
    requiredRealmOrder: stage.requiredRealmOrder,
    pulls: totalPulls,
    targetId: target.id,
    targetName: target.name,
    targetGrade: target.grade,
    targetFragments: fragments,
    targetOwned: progress.owned === true,
    totalFragmentsForLv1000: manualTotalGateFragmentsV160(target),
    affordableGates: affordable.count,
    fragmentsSpentIfAdvanced: affordable.spent,
    nextGateFragments: affordable.next,
    uniqueManualsSeen: seen.size,
    fragmentDrops,
    itemDrops,
    orientationHits,
    boundJadeCost: jadeCost,
    recurringBoundJadePerDay: round(jadePerDay),
    calendarDaysIfAllRecurringBoundJadeWentHere: round(jadeCost / jadePerDay, 2),
    disclaimer: 'Deterministic production-gacha sample. Calendar conversion assumes every recurring Bound Jade is spent on this one manual banner and excludes competing sinks/banners.',
  };
}

function cumulativeTendonCostToLevelV160(targetLevel) {
  const target = Math.max(1, Math.floor(Number(targetLevel) || 1));
  let total = 0n;
  for (let level = 1; level < target; level++) total += spiritualRootNourishmentCostV145(level);
  return total;
}

export function spiritualRootAcquisitionReferenceV160(level) {
  const lv = Math.max(1, Math.floor(Number(level) || 1));
  const ascensionsNeeded = Math.floor((lv - 1) / SPIRITUAL_ROOT_ASCENSION_INTERVAL_V145);
  const gateLevel = ascensionsNeeded > 0 ? ascensionsNeeded * SPIRITUAL_ROOT_ASCENSION_INTERVAL_V145 : 0;
  return {
    level: lv,
    cultivationBonusPctBase: round(spiritualRootCultivationBonusPctV145(lv), 3),
    cumulativeTendonCost: cumulativeTendonCostToLevelV160(lv).toString(),
    ascensionsNeeded,
    latestGateLevel: gateLevel,
    latestRequiredOriginTier: gateLevel > 0 ? spiritualRootOriginTierForAscensionV145(gateLevel) : 0,
    latestOriginCost: gateLevel > 0 ? spiritualRootOriginCostV145(gateLevel).toString() : '0',
    virtualOriginPityKills: SPIRITUAL_ROOT_VIRTUAL_ORIGIN_PITY_KILLS_V145,
    note: 'Each 100-level gate also requires the matching realm-tier origin; natural source is realm-gated Hunt first-clear / virtual-Hunt pity, so level is not freely purchasable from Linh Tủy alone.',
  };
}

function nodeCostV160(id) {
  const node = reincarnationTreeNodesV136.find(x => x.id === id);
  if (!node) return undefined;
  return { id, name: node.name, maxRank: node.maxRank, maxCostRp: nodeSpentPoints(node, node.maxRank) };
}

export function reincarnationAcquisitionReferenceV160() {
  const orders = [18, 45, 85, 117];
  const rewards = orders.map(order => {
    const repeat = previewReincarnationV2Reward({ lifeId: `v160.repeat.${order}`, realmOrder: order, combatPower: 100, combatPowerBenchmark: 100, isNewRealmRecord: false });
    const record = previewReincarnationV2Reward({ lifeId: `v160.record.${order}`, realmOrder: order, combatPower: 100, combatPowerBenchmark: 100, isNewRealmRecord: true });
    const boosted = previewReincarnationV2Reward({ lifeId: `v160.boost.${order}`, realmOrder: order, combatPower: 100, combatPowerBenchmark: 100, isNewRealmRecord: false, reincarnationPointsGainPct: 25 });
    return { order, repeatRp: repeat.reincarnationPoints, newRecordRp: record.reincarnationPoints, maxRpGainNodeRepeatRp: boosted.reincarnationPoints, energyCost: repeat.energyCost };
  });
  const terminalRepeat = rewards.find(x => x.order === 117)?.repeatRp ?? 1;
  return {
    totalTreeMaxCostRp: totalTreeMaxCostV127(),
    fateBuildTotalUnlockCostRp: FATE_BUILD_TOTAL_UNLOCK_COST_V4,
    combinedTreeAndFateCostRp: totalTreeMaxCostV127() + FATE_BUILD_TOTAL_UNLOCK_COST_V4,
    keyNodes: [
      nodeCostV160('cultivation.base_gain'),
      nodeCostV160('cultivation.major_requirement'),
      nodeCostV160('cultivation.retrain'),
      nodeCostV160('reincarnation.rp_gain'),
      nodeCostV160('manual.cultivation'),
    ].filter(Boolean),
    rewards,
    simpleTerminalRepeatLivesForTreeOnly: Math.ceil(totalTreeMaxCostV127() / terminalRepeat),
    note: 'The simple terminal-life count is a scale reference only. Real multi-life pacing changes with record bonuses, RP-gain investment, earlier passing choices and shared RP spending on Fate.',
  };
}

export function buildFullLifeAcquisitionAuditV160() {
  const manualSamples = [];
  for (const stageIndex of [0, 14, 28]) {
    manualSamples.push(manualAcquisitionSampleV160(stageIndex, 100, 160100 + stageIndex * 1000));
    manualSamples.push(manualAcquisitionSampleV160(stageIndex, 1000, 161000 + stageIndex * 1000));
  }
  return {
    schema: FULL_LIFE_ACQUISITION_V160_SCHEMA,
    gacha: {
      categoryBannerCount: 8,
      singleCost: ECONOMY_PRODUCTION_V111.gachaSingleCost,
      tenCost: ECONOMY_PRODUCTION_V111.gachaTenCost,
      recurringBoundJadePerDay: round(recurringBoundJadePerDayV160()),
      samples: manualSamples,
    },
    spiritualRoot: [1, 100, 1000, 10_000].map(spiritualRootAcquisitionReferenceV160),
    reincarnation: reincarnationAcquisitionReferenceV160(),
  };
}
