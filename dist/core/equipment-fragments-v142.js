import { EQUIPMENT_REALM_NAMES_V142, EQUIPMENT_SANG_THE_INDEX_V142 } from './equipment-v142.js';

/**
 * V142 realm-ranked fragment economy.
 *
 * One item always costs 50 fragments OF ITS OWN RANK.
 * Fragments can be refined upward at 3 lower -> 1 next-rank fragment.
 * Therefore a Luyện Khí item is 50 Luyện Khí fragments OR 150 Phàm fragments,
 * while the UI never needs to display quadrillions of one universal currency.
 *
 * Hunt regions can drop their own-rank fragment at a deliberately low rate and
 * also drop fragments from lower ranks. This preserves value for old ranks and
 * makes deep farming exciting without directly dropping finished gear.
 */
export const EQUIPMENT_FRAGMENT_CRAFT_COST_V142 = 50;
export const EQUIPMENT_FRAGMENT_UPGRADE_RATIO_V142 = 3;
export const EQUIPMENT_FRAGMENT_SCHEMA_V142 = 'equipment.fragments.v142';

function rankIndex(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}
function count(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}
export function equipmentFragmentRankNameV142(index) {
  const i = rankIndex(index);
  if (i <= EQUIPMENT_SANG_THE_INDEX_V142) return EQUIPMENT_REALM_NAMES_V142[i];
  return `Đạo Chuyển ${i - EQUIPMENT_SANG_THE_INDEX_V142}`;
}
export function equipmentFragmentResourceIdV142(index) {
  return `resource.equipment.fragment.v142.rank.${rankIndex(index)}`;
}
export function equipmentFragmentDisplayNameV142(index) {
  return `Mảnh Trang Bị · ${equipmentFragmentRankNameV142(index)}`;
}
export function phamEquivalentCostV142(index) {
  return BigInt(EQUIPMENT_FRAGMENT_CRAFT_COST_V142) * (BigInt(EQUIPMENT_FRAGMENT_UPGRADE_RATIO_V142) ** BigInt(rankIndex(index)));
}

export function ensureEquipmentFragmentWalletV142(state) {
  const wallet = state.equipmentFragmentsV142 ?? (state.equipmentFragmentsV142 = {});
  wallet.schema = EQUIPMENT_FRAGMENT_SCHEMA_V142;
  wallet.byRank = wallet.byRank && typeof wallet.byRank === 'object' ? { ...wallet.byRank } : {};
  for (const [key, value] of Object.entries(wallet.byRank)) wallet.byRank[key] = count(value);
  wallet.totalDrops = count(wallet.totalDrops);
  wallet.totalCrafted = count(wallet.totalCrafted);
  wallet.totalRefined = count(wallet.totalRefined);
  return wallet;
}
export function equipmentFragmentBalanceV142(state, rank) {
  const wallet = ensureEquipmentFragmentWalletV142(state);
  return count(wallet.byRank[equipmentFragmentResourceIdV142(rank)]);
}
export function grantEquipmentFragmentRankV142(state, rank, amount = 1, source = 'unknown') {
  const wallet = ensureEquipmentFragmentWalletV142(state);
  const r = rankIndex(rank), delta = count(amount), id = equipmentFragmentResourceIdV142(r);
  if (delta <= 0) return { source, rankIndex: r, rankName: equipmentFragmentRankNameV142(r), amount: 0, balance: equipmentFragmentBalanceV142(state, r) };
  wallet.byRank[id] = count(wallet.byRank[id]) + delta;
  wallet.totalDrops += delta;
  return { source, resourceId: id, rankIndex: r, rankName: equipmentFragmentRankNameV142(r), amount: delta, balance: wallet.byRank[id] };
}
export function spendEquipmentFragmentRankV142(state, rank, amount, reason = 'spend') {
  const wallet = ensureEquipmentFragmentWalletV142(state);
  const r = rankIndex(rank), need = count(amount), id = equipmentFragmentResourceIdV142(r), have = count(wallet.byRank[id]);
  if (have < need) throw new Error(`Không đủ ${equipmentFragmentDisplayNameV142(r)}: ${have}/${need}.`);
  wallet.byRank[id] = have - need;
  return { reason, rankIndex: r, rankName: equipmentFragmentRankNameV142(r), amount: need, balance: wallet.byRank[id] };
}
export function canCraftEquipmentRankV142(state, rank) {
  return equipmentFragmentBalanceV142(state, rank) >= EQUIPMENT_FRAGMENT_CRAFT_COST_V142;
}
export function consumeEquipmentCraftFragmentsV142(state, rank) {
  const wallet = ensureEquipmentFragmentWalletV142(state);
  const spent = spendEquipmentFragmentRankV142(state, rank, EQUIPMENT_FRAGMENT_CRAFT_COST_V142, 'craft');
  wallet.totalCrafted += 1;
  return spent;
}
export function refineEquipmentFragmentsUpV142(state, fromRank, batches = 1) {
  const wallet = ensureEquipmentFragmentWalletV142(state);
  const from = rankIndex(fromRank), batchCount = count(batches);
  if (batchCount <= 0) return { fromRank: from, toRank: from + 1, consumed: 0, produced: 0 };
  const consumed = batchCount * EQUIPMENT_FRAGMENT_UPGRADE_RATIO_V142;
  spendEquipmentFragmentRankV142(state, from, consumed, 'refine-up');
  grantEquipmentFragmentRankV142(state, from + 1, batchCount, 'refine-up');
  wallet.totalRefined += batchCount;
  return { fromRank: from, fromName: equipmentFragmentRankNameV142(from), toRank: from + 1, toName: equipmentFragmentRankNameV142(from + 1), consumed, produced: batchCount };
}

/**
 * Drop table for an equipment-fragment EVENT at Hunt rank R.
 * Same-rank fragments remain rare, but the chance improves slightly in deeper zones.
 * The remaining mass is distributed over lower ranks with a strong recency bias.
 *
 * Examples at zone 1/8:
 * - same-rank: 0.60% / 2.00% of fragment events
 * - R-1: about 10-12%
 * - R-2: about 20-22%
 * - R-3: about 28-30%
 * - the rest spreads across deeper lower ranks.
 */
export function huntEquipmentFragmentDropTableV142(currentRank, zone = 1) {
  const r = rankIndex(currentRank), z = Math.max(1, Math.min(8, rankIndex(zone) || 1));
  if (r <= 0) return [{ rankIndex: 0, rankName: equipmentFragmentRankNameV142(0), weight: 1, chancePct: 100 }];
  const sameChance = 0.4 + z * 0.2; // 0.6% -> 2.0%
  const preferred = [
    { gap: 1, weight: 11 + z * 0.15 },
    { gap: 2, weight: 21 + z * 0.12 },
    { gap: 3, weight: 29 + z * 0.08 },
    { gap: 4, weight: 20 },
    { gap: 5, weight: 12 },
  ];
  const table = [{ rankIndex: r, rankName: equipmentFragmentRankNameV142(r), weight: sameChance }];
  let used = sameChance;
  for (const entry of preferred) {
    if (r - entry.gap < 0) continue;
    table.push({ rankIndex: r - entry.gap, rankName: equipmentFragmentRankNameV142(r - entry.gap), weight: entry.weight });
    used += entry.weight;
  }
  const remaining = Math.max(0, 100 - used);
  const oldestMax = Math.max(0, r - 6);
  if (oldestMax >= 0) {
    const candidates = [];
    for (let i = oldestMax; i >= 0; i--) candidates.push(i);
    if (candidates.length) {
      const each = remaining / candidates.length;
      for (const i of candidates) table.push({ rankIndex: i, rankName: equipmentFragmentRankNameV142(i), weight: each });
    }
  }
  const merged = new Map();
  for (const row of table) merged.set(row.rankIndex, (merged.get(row.rankIndex) ?? 0) + row.weight);
  const total = [...merged.values()].reduce((a, b) => a + b, 0) || 1;
  return [...merged.entries()]
    .map(([i, weight]) => ({ rankIndex: i, rankName: equipmentFragmentRankNameV142(i), weight, chancePct: weight / total * 100 }))
    .sort((a, b) => b.rankIndex - a.rankIndex);
}
export function rollHuntEquipmentFragmentRankV142(currentRank, zone, roll01) {
  const table = huntEquipmentFragmentDropTableV142(currentRank, zone);
  let x = Math.max(0, Math.min(0.999999999, Number(roll01) || 0)) * 100;
  for (const row of table) {
    x -= row.chancePct;
    if (x <= 0) return row.rankIndex;
  }
  return table[table.length - 1]?.rankIndex ?? 0;
}

/** Elite/Boss quality of the fragment EVENT affects amount, not the rank lottery. */
export function huntEquipmentFragmentAmountV142(monsterGrade, firstClear = false, zone = 1) {
  const z = Math.max(1, Math.min(8, rankIndex(zone) || 1));
  const base = monsterGrade === 'boss' ? 3 : monsterGrade === 'elite' ? 2 : 1;
  return base + (firstClear && monsterGrade === 'boss' ? 2 + Math.floor(z / 2) : 0);
}
export function settleHuntEquipmentFragmentEventV142(state, { currentRank, zone = 1, monsterGrade = 'common', firstClear = false, roll01 = 0, source = 'hunt' }) {
  const dropRank = rollHuntEquipmentFragmentRankV142(currentRank, zone, roll01);
  const amount = huntEquipmentFragmentAmountV142(monsterGrade, firstClear, zone);
  const grant = grantEquipmentFragmentRankV142(state, dropRank, amount, source);
  return {
    ...grant,
    currentRank: rankIndex(currentRank), currentRankName: equipmentFragmentRankNameV142(currentRank),
    sameRank: dropRank === rankIndex(currentRank),
    lowerRank: dropRank < rankIndex(currentRank),
    table: huntEquipmentFragmentDropTableV142(currentRank, zone),
  };
}

/**
 * Preview helper: this is the chance after an equipment-fragment event occurs.
 * The outer Hunt equipment-event chance is kept separate so economy balancing can
 * tune frequency without changing the relative rank ladder.
 */
export function huntSameRankFragmentChancePctV142(currentRank, zone = 1) {
  return huntEquipmentFragmentDropTableV142(currentRank, zone).find(x => x.rankIndex === rankIndex(currentRank))?.chancePct ?? 0;
}
