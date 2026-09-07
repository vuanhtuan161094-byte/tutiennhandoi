import { EQUIPMENT_AFFIX_DEFINITIONS_V114, EQUIPMENT_AFFIX_MIN_ROLL_PCT_V114, EQUIPMENT_AFFIX_MAX_ROLL_PCT_V114 } from './equipment-affix-v114.js';
import {
  EQUIPMENT_ATTIRE_SLOTS_V142,
  EQUIPMENT_JEWELRY_SLOTS_V142,
  EQUIPMENT_SLOTS_V142,
  EQUIPMENT_SLOT_LABELS_V142,
  EQUIPMENT_V142_SCHEMA,
  equipmentAffixCountForRankV142,
  equipmentBaseStatsForRankV142,
  equipmentRankNameV142,
  equipmentSetDefinitionV142,
} from './equipment-v142.js';
import {
  EQUIPMENT_FRAGMENT_CRAFT_COST_V142,
  consumeEquipmentCraftFragmentsV142,
  equipmentFragmentBalanceV142,
  equipmentFragmentDisplayNameV142,
  ensureEquipmentFragmentWalletV142,
  refineEquipmentFragmentsUpV142,
} from './equipment-fragments-v142.js';
import {
  EQUIPMENT_SET_FRAGMENT_ENGRAVE_COST_V142,
  ensureEquipmentSetFragmentWalletV142,
  equipmentSetFragmentBalanceV142,
  spendEquipmentSetFragmentsV142,
  settleEquipmentSetResonanceV143,
  syncEquipmentSetResonanceItemsV143,
} from './equipment-set-fragments-v142.js';

/** Hidden transport-only Grade. V142 progression is exclusively equipmentRankIndex. */
export function equipmentCompatGradeForRankV142(_rankIndex) {
  return 'mundane';
}

function hash01(seed, salt) {
  let x = ((seed >>> 0) ^ Math.imul((salt + 1) >>> 0, 0x9e3779b1)) >>> 0;
  x ^= x >>> 16; x = Math.imul(x, 0x7feb352d) >>> 0; x ^= x >>> 15; x = Math.imul(x, 0x846ca68b) >>> 0; x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
function legalAffixForSlot(def, slot) {
  if (!def?.live) return false;
  return !Array.isArray(def.allowedSlots) || def.allowedSlots.length === 0 || def.allowedSlots.includes(slot);
}
function rollAffixes(slot, rankIndex, seed) {
  const count = equipmentAffixCountForRankV142(rankIndex);
  const candidates = EQUIPMENT_AFFIX_DEFINITIONS_V114.filter(def => legalAffixForSlot(def, slot));
  const result = [], groups = new Set();
  for (let i = 0; i < count; i++) {
    const available = candidates.filter(def => !groups.has(def.exclusiveGroup));
    if (!available.length) break;
    const def = available[Math.floor(hash01(seed, 170 + i * 5) * available.length) % available.length];
    const rollPct = EQUIPMENT_AFFIX_MIN_ROLL_PCT_V114 + (EQUIPMENT_AFFIX_MAX_ROLL_PCT_V114 - EQUIPMENT_AFFIX_MIN_ROLL_PCT_V114) * hash01(seed, 171 + i * 5);
    result.push({
      id: def.id,
      family: def.family,
      exclusiveGroup: def.exclusiveGroup,
      value: Math.round((Number(def.baseTarget) || 0) * rollPct / 100 * 10000) / 10000,
      rollPct: Math.round(rollPct * 100) / 100,
      buildAffix: Boolean(def.buildAffix),
      rootOriginId: def.rootOriginId,
    });
    groups.add(def.exclusiveGroup);
  }
  return result;
}
function removeItems(equipmentState, ids) {
  const removed = new Set(ids);
  equipmentState.items = equipmentState.items.filter(item => !removed.has(item.id));
  for (const [slot, id] of Object.entries(equipmentState.equipped ?? {})) if (removed.has(id)) delete equipmentState.equipped[slot];
}

export function craftRankedEquipmentV142(state, equipmentState, input) {
  const slot = String(input.slot ?? '');
  if (!EQUIPMENT_SLOTS_V142.includes(slot)) throw new Error(`Ô trang bị không hợp lệ: ${slot}`);
  const rankIndex = Math.max(0, Math.floor(Number(input.rankIndex) || 0));
  const have = equipmentFragmentBalanceV142(state, rankIndex);
  if (have < EQUIPMENT_FRAGMENT_CRAFT_COST_V142) {
    throw new Error(`Không đủ ${equipmentFragmentDisplayNameV142(rankIndex)}: ${have}/${EQUIPMENT_FRAGMENT_CRAFT_COST_V142}.`);
  }
  consumeEquipmentCraftFragmentsV142(state, rankIndex);
  const wallet = ensureEquipmentFragmentWalletV142(state);
  const seed = (Number(input.seed) || 1) >>> 0;
  const serial = wallet.totalCrafted;
  const rankName = equipmentRankNameV142(rankIndex);
  const item = {
    schema: EQUIPMENT_V142_SCHEMA,
    id: `equipment.v142.${slot}.${rankIndex}.${seed}.${serial}`,
    templateId: `equipment.v142.${slot}`,
    name: `${rankName} · ${EQUIPMENT_SLOT_LABELS_V142[slot]}`,
    slot,
    equipmentRankIndex: rankIndex,
    equipmentRankName: rankName,
    tier: 0,
    grade: equipmentCompatGradeForRankV142(rankIndex),
    quality: 'mid',
    enhancementLevel: 0,
    traitIds: [],
    affixes: rollAffixes(slot, rankIndex, seed),
    reforgeCount: 0,
    gemSockets: [],
    itemLevel: rankIndex * 1000,
    stats: equipmentBaseStatsForRankV142(slot, rankIndex),
    tags: ['EquipmentV142', `EquipmentRank:${rankName}`],
    source: { kind: 'craft', recipeId: 'equipment.v142.ranked-fragments', floor: rankIndex + 1, seed },
    acquiredWorldYear: Number(input.acquiredWorldYear) || 0,
  };
  equipmentState.items.push(item);
  return { item, fragmentCost: EQUIPMENT_FRAGMENT_CRAFT_COST_V142, fragmentBalance: equipmentFragmentBalanceV142(state, rankIndex) };
}

export function mergeRankedEquipmentV142(equipmentState, mainId, fodderAId, fodderBId) {
  const ids = [mainId, fodderAId, fodderBId];
  if (new Set(ids).size !== 3) throw new Error('Hợp thành cần 3 trang bị khác nhau.');
  const [main, a, b] = ids.map(id => equipmentState.items.find(item => item.id === id));
  if (!main || !a || !b || [main, a, b].some(item => item.schema !== EQUIPMENT_V142_SCHEMA)) throw new Error('Hợp thành chỉ nhận trang bị V142.');
  if (a.slot !== main.slot || b.slot !== main.slot) throw new Error('Ba trang bị hợp thành phải cùng ô.');
  if (a.equipmentRankIndex !== main.equipmentRankIndex || b.equipmentRankIndex !== main.equipmentRankIndex) throw new Error('Ba trang bị hợp thành phải cùng Bậc.');
  removeItems(equipmentState, [a.id, b.id]);
  main.equipmentRankIndex += 1;
  main.equipmentRankName = equipmentRankNameV142(main.equipmentRankIndex);
  const set = main.setId ? equipmentSetDefinitionV142(main.setId) : undefined;
  main.name = `${set ? `${set.name} · ` : ''}${main.equipmentRankName} · ${EQUIPMENT_SLOT_LABELS_V142[main.slot]}`;
  main.itemLevel = main.equipmentRankIndex * 1000;
  main.grade = equipmentCompatGradeForRankV142(main.equipmentRankIndex);
  main.stats = equipmentBaseStatsForRankV142(main.slot, main.equipmentRankIndex);
  main.tags = [...new Set([...(main.tags ?? []).filter(tag => !String(tag).startsWith('EquipmentRank:')), `EquipmentRank:${main.equipmentRankName}`])];
  // Rank-up rebuilds base stats, so reapply the persistent Set Resonance exactly once afterwards.
  if (main.setId) syncEquipmentSetResonanceItemsV143(equipmentState, main.setId, main.setResonanceLevelV143 ?? 0);
  return { item: main, consumedItemIds: [a.id, b.id], nextRankIndex: main.equipmentRankIndex, nextRankName: main.equipmentRankName };
}

export function refineRankedEquipmentFragmentsV142(state, fromRank, batches) {
  return refineEquipmentFragmentsUpV142(state, fromRank, batches);
}

export function engraveRankedEquipmentSetV142(state, equipmentState, itemId, setId) {
  const item = equipmentState.items.find(candidate => candidate.id === itemId);
  if (!item || item.schema !== EQUIPMENT_V142_SCHEMA) throw new Error('Không tìm thấy trang bị V142 để Khắc Bộ.');
  const set = equipmentSetDefinitionV142(setId);
  if (!set) throw new Error(`Bộ V142 không hợp lệ: ${setId}`);
  const attire = EQUIPMENT_ATTIRE_SLOTS_V142.includes(item.slot);
  const jewelry = EQUIPMENT_JEWELRY_SLOTS_V142.includes(item.slot);
  if ((set.category === 'attire' && !attire) || (set.category === 'jewelry' && !jewelry)) {
    throw new Error(`${set.name} chỉ dùng cho ${set.category === 'attire' ? '6 Y Trang' : '4 Trang Sức'}.`);
  }
  spendEquipmentSetFragmentsV142(state, set.id, EQUIPMENT_SET_FRAGMENT_ENGRAVE_COST_V142);
  const wallet = ensureEquipmentSetFragmentWalletV142(state);
  wallet.totalEngraved += 1;
  item.setId = set.id;
  item.name = `${set.name} · ${item.equipmentRankName ?? equipmentRankNameV142(item.equipmentRankIndex)} · ${EQUIPMENT_SLOT_LABELS_V142[item.slot]}`;
  item.tags = [...new Set([...(item.tags ?? []).filter(tag => !String(tag).startsWith('SetV142:')), `SetV142:${set.key}`])];
  // Completing the last distinct Set slot unlocks endless Tàn Ấn -> Cộng Hưởng conversion.
  const resonance = settleEquipmentSetResonanceV143(state, equipmentState, set.id);
  return {
    item,
    setId: set.id,
    setName: set.name,
    cost: EQUIPMENT_SET_FRAGMENT_ENGRAVE_COST_V142,
    balance: equipmentSetFragmentBalanceV142(state, set.id),
    resonance,
  };
}

export function equipmentCraftingSummaryV142(state, equipmentState) {
  const wallet = ensureEquipmentFragmentWalletV142(state);
  const setWallet = ensureEquipmentSetFragmentWalletV142(state);
  return {
    schema: 'equipment-crafting.v143',
    craftCostPerItem: EQUIPMENT_FRAGMENT_CRAFT_COST_V142,
    setEngraveCostPerItem: EQUIPMENT_SET_FRAGMENT_ENGRAVE_COST_V142,
    fragmentWallet: { ...wallet.byRank },
    setFragmentWallet: { ...setWallet.bySetId },
    setResonanceBySetId: { ...setWallet.resonanceBySetId },
    setResonanceUnlockedSetIds: [...setWallet.resonanceUnlockedSetIds],
    v142Items: equipmentState.items.filter(item => item.schema === EQUIPMENT_V142_SCHEMA).map(item => ({
      id: item.id, name: item.name, slot: item.slot, rankIndex: item.equipmentRankIndex, rankName: item.equipmentRankName,
      enhancementLevel: item.enhancementLevel ?? 0, setId: item.setId ?? '', setResonanceLevel: item.setResonanceLevelV143 ?? 0,
    })),
  };
}
