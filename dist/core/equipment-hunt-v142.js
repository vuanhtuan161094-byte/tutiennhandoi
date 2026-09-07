import { SeededRng } from './rng.js';
import { deterministicBinomialV77 } from './hunt-virtual-farm-v77.js';
import {
  grantEquipmentFragmentRankV142,
  huntEquipmentFragmentDropTableV142,
  huntEquipmentFragmentAmountV142,
  rollHuntEquipmentFragmentRankV142,
} from './equipment-fragments-v142.js';

/**
 * V142 Hunt -> Equipment bridge.
 * This module intentionally contains no finished-equipment generation.
 * It converts the existing Hunt "equipment event" budget into ranked fragments.
 */

export function settleRealHuntEquipmentFragmentsV142(state, input) {
  const currentRank = Math.max(1, Math.floor(Number(input.majorRealmIndex) || 1));
  const zone = Math.max(1, Math.min(8, Math.floor(Number(input.zone) || 1)));
  const monsterGrade = String(input.monsterGrade ?? 'boss');
  const firstClear = Boolean(input.firstClear);
  const equipmentEvent = Boolean(input.equipmentEvent);
  if (!equipmentEvent) {
    return { equipmentEvent: false, drops: [], totalFragments: 0, currentRank, zone };
  }
  const roll = Math.max(0, Math.min(0.999999999, Number(input.rankRoll01) || 0));
  const dropRank = rollHuntEquipmentFragmentRankV142(currentRank, zone, roll);
  const amount = huntEquipmentFragmentAmountV142(monsterGrade, firstClear, zone);
  const grant = grantEquipmentFragmentRankV142(state, dropRank, amount, input.source ?? `hunt.real.${currentRank}.${zone}`);
  return {
    equipmentEvent: true,
    drops: [grant],
    totalFragments: amount,
    currentRank,
    zone,
    sameRank: dropRank === currentRank,
  };
}

/**
 * Offline/Săn Ảo batch settlement is O(number of ranks), never O(kills/events).
 * We split equipment events across the rank table using deterministic conditional binomials.
 */
export function settleVirtualHuntEquipmentFragmentsV142(state, input) {
  const currentRank = Math.max(1, Math.floor(Number(input.majorRealmIndex) || 1));
  const zone = Math.max(1, Math.min(8, Math.floor(Number(input.zone) || 1)));
  const eventCount = Math.max(0, Math.floor(Number(input.equipmentEvents) || 0));
  if (eventCount <= 0) return { equipmentEvents: 0, drops: [], totalFragments: 0, currentRank, zone };
  const table = huntEquipmentFragmentDropTableV142(currentRank, zone);
  const rng = new SeededRng((Number(input.seed) || 1) >>> 0);
  let remainingEvents = eventCount;
  let remainingProbability = 1;
  const byRank = new Map();
  for (let i = 0; i < table.length; i++) {
    const row = table[i];
    let eventsAtRank;
    if (i === table.length - 1) {
      eventsAtRank = remainingEvents;
    }
    else {
      const p = Math.max(0, Math.min(1, (row.chancePct / 100) / Math.max(1e-12, remainingProbability)));
      eventsAtRank = deterministicBinomialV77(remainingEvents, p, rng);
    }
    if (eventsAtRank > 0) byRank.set(row.rankIndex, (byRank.get(row.rankIndex) ?? 0) + eventsAtRank);
    remainingEvents -= eventsAtRank;
    remainingProbability -= row.chancePct / 100;
    if (remainingEvents <= 0) break;
  }
  const drops = [];
  let totalFragments = 0;
  for (const [rankIndex, events] of [...byRank.entries()].sort((a, b) => b[0] - a[0])) {
    // Săn Ảo represents ordinary farming. Elite pressure is already included in eventCount,
    // so event rank uses ordinary amount=1 to avoid double-paying elite multipliers.
    const amount = events;
    totalFragments += amount;
    drops.push(grantEquipmentFragmentRankV142(state, rankIndex, amount, input.source ?? `hunt.virtual.${currentRank}.${zone}`));
  }
  return {
    equipmentEvents: eventCount,
    drops,
    totalFragments,
    currentRank,
    zone,
    sameRankFragments: drops.find(x => x.rankIndex === currentRank)?.amount ?? 0,
  };
}

export function huntEquipmentFragmentPreviewV142(input) {
  const currentRank = Math.max(1, Math.floor(Number(input.majorRealmIndex) || 1));
  const zone = Math.max(1, Math.min(8, Math.floor(Number(input.zone) || 1)));
  const equipmentEventsPerHour = Math.max(0, Number(input.equipmentEventsPerHour) || 0);
  const table = huntEquipmentFragmentDropTableV142(currentRank, zone);
  return {
    currentRank,
    zone,
    equipmentEventsPerHour,
    fragmentDropsPerHour: equipmentEventsPerHour,
    sameRankChancePctPerFragmentEvent: table.find(x => x.rankIndex === currentRank)?.chancePct ?? 0,
    sameRankFragmentsPerHour: equipmentEventsPerHour * ((table.find(x => x.rankIndex === currentRank)?.chancePct ?? 0) / 100),
    table,
  };
}
