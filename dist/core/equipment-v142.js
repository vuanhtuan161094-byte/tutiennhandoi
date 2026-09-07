import { EQUIPMENT_AFFIX_DEFINITIONS_V114, EQUIPMENT_AFFIX_MIN_ROLL_PCT_V114, EQUIPMENT_AFFIX_MAX_ROLL_PCT_V114 } from './equipment-affix-v114.js';

/**
 * V142 canonical equipment progression.
 *
 * Design locks:
 * - one equipment rank axis only: Phàm -> 28 cultivation major realms -> endless Đạo Chuyển.
 * - one universal Equipment Fragment currency. A Phàm item costs 50 fragments; every next rank costs x3.
 * - Hunt/dungeon equipment loot is converted to fragments. Finished gear is deliberately crafted/merged.
 * - 6 attire slots own uncapped/long-growth Set stats; 4 jewelry slots own bounded utility Set stats.
 * - no live Grade/Quality/Star/Gem/Đạo Văn layer in V142 items.
 * - Enhancement is finite (+15); Affix Tinh Luyện/Tái Luyện stays a separate deterministic lane.
 */
export const EQUIPMENT_V142_SCHEMA = 'equipment.v142';
export const EQUIPMENT_FRAGMENT_RESOURCE_V142 = 'resource.equipment.fragment.v142';
export const EQUIPMENT_FRAGMENT_NAME_V142 = 'Mảnh Trang Bị';
export const EQUIPMENT_BASE_FRAGMENT_COST_V142 = 50n;
export const EQUIPMENT_SET_FRAGMENT_COST_V142 = 50n;
export const EQUIPMENT_MAX_ENHANCEMENT_V142 = 15;

export const EQUIPMENT_REALM_NAMES_V142 = Object.freeze([
  'Phàm',
  'Luyện Khí', 'Trúc Cơ', 'Tử Phủ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Độ Kiếp',
  'Nhân Tiên', 'Địa Tiên', 'Thiên Tiên', 'Chân Tiên', 'Huyền Tiên', 'Kim Tiên', 'Thái Ất Tiên', 'Đại La Kim Tiên', 'Tiên Vương', 'Tiên Đế',
  'Cực Hạn', 'Cực Đạo Chân Cảnh', 'Hỗn Độn Cảnh', 'Hồng Mông Cảnh', 'Khai Thiên Cảnh', 'Thế Giới Chủ', 'Vĩnh Sinh Cảnh', 'Sáng Thế Chủ',
]);
export const EQUIPMENT_SANG_THE_INDEX_V142 = EQUIPMENT_REALM_NAMES_V142.length - 1;

export const EQUIPMENT_ATTIRE_SLOTS_V142 = Object.freeze(['weapon', 'head', 'robe', 'belt', 'gloves', 'boots']);
export const EQUIPMENT_JEWELRY_SLOTS_V142 = Object.freeze(['necklace', 'ring', 'bracelet', 'talisman']);
export const EQUIPMENT_SLOTS_V142 = Object.freeze([...EQUIPMENT_ATTIRE_SLOTS_V142, ...EQUIPMENT_JEWELRY_SLOTS_V142]);
export const EQUIPMENT_SLOT_LABELS_V142 = Object.freeze({
  weapon: 'Đạo Binh', head: 'Đạo Quan', robe: 'Pháp Bào', belt: 'Huyền Đái', gloves: 'Hộ Uyển', boots: 'Vân Ngoa',
  necklace: 'Ngọc Bội', ring: 'Đạo Giới', bracelet: 'Linh Trạc', talisman: 'Hộ Phù',
});

/** Only long-scaling/raw stats live in item bases. Bounded utility belongs to Affix/Jewelry Set. */
export const EQUIPMENT_SLOT_BASE_STATS_V142 = Object.freeze({
  weapon: Object.freeze({ attack: 18 }),
  head: Object.freeze({ maxSpirit: 18, resolve: 6 }),
  robe: Object.freeze({ maxHp: 92, defense: 10 }),
  belt: Object.freeze({ maxHp: 58, maxSpirit: 10 }),
  gloves: Object.freeze({ attack: 8, accuracy: 5 }),
  boots: Object.freeze({ mobility: 7, resolve: 4 }),
  necklace: Object.freeze({ maxSpirit: 22, controlPower: 5 }),
  ring: Object.freeze({ attack: 6, maxSpirit: 10 }),
  bracelet: Object.freeze({ maxHp: 44, defense: 5 }),
  talisman: Object.freeze({ resolve: 7, controlPower: 5 }),
});

const ATTIRE_SETS = [
  {
    id: 'set.v142.attire.metal', key: 'metal', name: 'Thái Bạch Canh Kim Phá Giới Bộ', category: 'attire', element: 'Metal',
    bonuses: [
      { pieces: 2, name: 'Kim · Sát Phạt', statMultipliers: { attack: 0.08 } },
      { pieces: 4, name: 'Kim · Phá Thế', flatStats: { breakPowerPct: 18 } },
      { pieces: 6, name: 'Kim · Trảm Thất Thế', flatStats: { brokenTargetDamagePct: 30 } },
    ],
  },
  {
    id: 'set.v142.attire.wood', key: 'wood', name: 'Thanh Đế Trường Sinh Vạn Mộc Bộ', category: 'attire', element: 'Wood',
    bonuses: [
      { pieces: 2, name: 'Mộc · Trường Sinh', statMultipliers: { maxHp: 0.10 } },
      { pieces: 4, name: 'Mộc · Thực Cốt', flatStats: { dotDamagePct: 18 } },
      { pieces: 6, name: 'Mộc · Sinh Sinh', flatStats: { healingEffectivenessPct: 25 } },
    ],
  },
  {
    id: 'set.v142.attire.water', key: 'water', name: 'Huyền Minh Thương Hải Vạn Lưu Bộ', category: 'attire', element: 'Water',
    bonuses: [
      { pieces: 2, name: 'Thủy · Hải Nạp', statMultipliers: { maxSpirit: 0.12 } },
      { pieces: 4, name: 'Thủy · Chân Nguyên', flatStats: { trueEssenceScalingPct: 20 } },
      { pieces: 6, name: 'Thủy · Hộ Lưu', flatStats: { shieldEffectPct: 30 } },
    ],
  },
  {
    id: 'set.v142.attire.fire', key: 'fire', name: 'Đại Nhật Phần Thiên Cực Viêm Bộ', category: 'attire', element: 'Fire',
    bonuses: [
      { pieces: 2, name: 'Hỏa · Liệt Diễm', statMultipliers: { attack: 0.08 } },
      { pieces: 4, name: 'Hỏa · Trọng Bạo', flatStats: { critChancePct: 12 } },
      { pieces: 6, name: 'Hỏa · Phần Thiên', flatStats: { critDamagePct: 30 } },
    ],
  },
  {
    id: 'set.v142.attire.earth', key: 'earth', name: 'Hậu Thổ Trấn Nhạc Bất Động Bộ', category: 'attire', element: 'Earth',
    bonuses: [
      { pieces: 2, name: 'Thổ · Trấn Nhạc', statMultipliers: { defense: 0.10 } },
      { pieces: 4, name: 'Thổ · Hậu Tải', statMultipliers: { maxHp: 0.12 } },
      { pieces: 6, name: 'Thổ · Phản Chấn', flatStats: { counterDamagePct: 30 } },
    ],
  },
];

const JEWELRY_SETS = [
  {
    id: 'set.v142.jewelry.huyen_nguyen', key: 'huyen_nguyen', name: 'Huyền Nguyên Luân Chuyển Bộ', category: 'jewelry',
    bonuses: [
      { pieces: 2, name: 'Huyền Nguyên · Tiết Nguyên', flatStats: { spiritEfficiencyPct: 8 } },
      { pieces: 4, name: 'Huyền Nguyên · Luân Chuyển', flatStats: { cooldownReductionPct: 10 } },
    ],
  },
  {
    id: 'set.v142.jewelry.pha_gioi', key: 'pha_gioi', name: 'Phá Giới Minh Tâm Bộ', category: 'jewelry',
    bonuses: [
      { pieces: 2, name: 'Phá Giới · Xuyên', flatStats: { armorPenPct: 8 } },
      { pieces: 4, name: 'Minh Tâm · Hội', flatStats: { heartChancePct: 10 } },
    ],
  },
  {
    id: 'set.v142.jewelry.hu_khong', key: 'hu_khong', name: 'Hư Không Vô Ảnh Bộ', category: 'jewelry',
    bonuses: [
      { pieces: 2, name: 'Vô Ảnh · Né', flatStats: { dodgeChancePct: 8 } },
      { pieces: 4, name: 'Hư Không · Tật Hành', flatStats: { actionSpeed: 0.10 } },
    ],
  },
  {
    id: 'set.v142.jewelry.tran_thu', key: 'tran_thu', name: 'Trấn Thủ Định Tâm Bộ', category: 'jewelry',
    bonuses: [
      { pieces: 2, name: 'Định Tâm · Kháng Khống', flatStats: { controlDurationReductionPct: 12 } },
      { pieces: 4, name: 'Trấn Thủ · Bất Xâm', flatStats: { damageReductionPct: 6 } },
    ],
  },
];

export const EQUIPMENT_SET_CATALOG_V142 = Object.freeze([...ATTIRE_SETS, ...JEWELRY_SETS].map(x => Object.freeze(x)));
const SET_BY_ID = new Map(EQUIPMENT_SET_CATALOG_V142.map(x => [x.id, x]));
const SET_BY_ELEMENT = new Map(ATTIRE_SETS.map(x => [x.element, x]));

export function equipmentSetDefinitionV142(id) { return SET_BY_ID.get(String(id ?? '')); }
export function equipmentAttireSetForElementV142(element) { return SET_BY_ELEMENT.get(element); }
export function equipmentSetFragmentResourceIdV142(setId) { return `resource.equipment.set_fragment.v142.${String(setId).split('.').pop()}`; }
export function equipmentSetFragmentNameV142(setId) {
  const def = equipmentSetDefinitionV142(setId);
  return def ? `${def.name} · Tàn Ấn` : `Tàn Ấn ${setId}`;
}

function asBigInt(value) {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(Math.max(0, Math.floor(Number.isFinite(value) ? value : 0)));
  if (typeof value === 'string' && /^\d+$/.test(value)) return BigInt(value);
  return 0n;
}
function addBigIntString(current, delta) { return (asBigInt(current) + asBigInt(delta)).toString(); }
function spendBigIntString(current, cost) {
  const have = asBigInt(current), need = asBigInt(cost);
  if (have < need) throw new Error(`Không đủ ${EQUIPMENT_FRAGMENT_NAME_V142}: ${have}/${need}.`);
  return (have - need).toString();
}

export function equipmentRankNameV142(index) {
  const i = Math.max(0, Math.floor(Number(index) || 0));
  if (i <= EQUIPMENT_SANG_THE_INDEX_V142) return EQUIPMENT_REALM_NAMES_V142[i];
  return `Đạo Chuyển ${i - EQUIPMENT_SANG_THE_INDEX_V142}`;
}
export function equipmentFragmentCostV142(rankIndex) {
  const i = Math.max(0, Math.floor(Number(rankIndex) || 0));
  return EQUIPMENT_BASE_FRAGMENT_COST_V142 * (3n ** BigInt(i));
}
export function equipmentFragmentUnitForRealmV142(rankIndex) {
  const i = Math.max(0, Math.floor(Number(rankIndex) || 0));
  return 3n ** BigInt(i);
}
export function equipmentRealmMultiplierV142(rankIndex) {
  const i = Math.max(0, Math.floor(Number(rankIndex) || 0));
  const canonical = Math.min(EQUIPMENT_SANG_THE_INDEX_V142, i);
  const endless = Math.max(0, i - EQUIPMENT_SANG_THE_INDEX_V142);
  return Math.pow(1.55, canonical) * Math.pow(1.12, endless);
}
export function equipmentAffixCountForRankV142(rankIndex) {
  const i = Math.max(0, Math.floor(Number(rankIndex) || 0));
  if (i <= 2) return 2;
  if (i <= 10) return 3;
  if (i <= 20) return 4;
  return 5;
}
export function equipmentRankIndexFromRealmOrderV142(realmOrder) {
  const order = Math.max(0, Math.floor(Number(realmOrder) || 0));
  if (order <= 0) return 0;
  if (order <= 9) return 1;
  return Math.min(EQUIPMENT_SANG_THE_INDEX_V142, 2 + Math.floor((order - 10) / 4));
}

export function ensureEquipmentProgressionV142(state) {
  const p = state.equipmentProgressionV142 ?? (state.equipmentProgressionV142 = {});
  p.schema = EQUIPMENT_V142_SCHEMA;
  p.fragments = String(p.fragments ?? '0');
  if (!/^\d+$/.test(p.fragments)) p.fragments = '0';
  p.setFragments = p.setFragments && typeof p.setFragments === 'object' ? { ...p.setFragments } : {};
  for (const key of Object.keys(p.setFragments)) {
    const value = String(p.setFragments[key] ?? '0');
    p.setFragments[key] = /^\d+$/.test(value) ? value : '0';
  }
  p.totalFragmentsEarned = String(p.totalFragmentsEarned ?? '0');
  if (!/^\d+$/.test(p.totalFragmentsEarned)) p.totalFragmentsEarned = '0';
  p.totalFragmentsSpent = String(p.totalFragmentsSpent ?? '0');
  if (!/^\d+$/.test(p.totalFragmentsSpent)) p.totalFragmentsSpent = '0';
  p.crafted = Math.max(0, Math.floor(Number(p.crafted) || 0));
  p.merged = Math.max(0, Math.floor(Number(p.merged) || 0));
  return p;
}
export function equipmentProgressionSummaryV142(state) {
  const p = ensureEquipmentProgressionV142(state);
  return {
    schema: p.schema,
    fragments: p.fragments,
    setFragments: { ...p.setFragments },
    crafted: p.crafted,
    merged: p.merged,
    sangTheCostPerItem: equipmentFragmentCostV142(EQUIPMENT_SANG_THE_INDEX_V142).toString(),
  };
}
export function grantEquipmentFragmentsV142(state, amount, source = 'unknown') {
  const p = ensureEquipmentProgressionV142(state);
  const delta = asBigInt(amount);
  if (delta <= 0n) return { source, amount: '0', balance: p.fragments };
  p.fragments = addBigIntString(p.fragments, delta);
  p.totalFragmentsEarned = addBigIntString(p.totalFragmentsEarned, delta);
  return { source, amount: delta.toString(), balance: p.fragments };
}
export function grantEquipmentSetFragmentsV142(state, setId, amount, source = 'unknown') {
  const def = equipmentSetDefinitionV142(setId);
  if (!def) return { source, setId, amount: '0', balance: '0', ignored: true };
  const p = ensureEquipmentProgressionV142(state);
  const delta = asBigInt(amount);
  const id = equipmentSetFragmentResourceIdV142(setId);
  const before = p.setFragments[id] ?? '0';
  p.setFragments[id] = addBigIntString(before, delta);
  return { source, setId, resourceId: id, amount: delta.toString(), balance: p.setFragments[id] };
}

export function equipmentFragmentsFromHuntEventsV142(majorRealmIndex, zone, events) {
  const rankIndex = Math.max(1, Math.min(EQUIPMENT_SANG_THE_INDEX_V142, Math.floor(Number(majorRealmIndex) || 1)));
  const z = Math.max(1, Math.min(8, Math.floor(Number(zone) || 1)));
  const count = Math.max(0, Math.floor(Number(events) || 0));
  return equipmentFragmentUnitForRealmV142(rankIndex) * BigInt(z) * BigInt(count);
}
export function equipmentFragmentsForRealHuntWinV142(majorRealmIndex, zone, equipmentEvent, bossFirstClear = false) {
  const rankIndex = Math.max(1, Math.min(EQUIPMENT_SANG_THE_INDEX_V142, Math.floor(Number(majorRealmIndex) || 1)));
  const z = Math.max(1, Math.min(8, Math.floor(Number(zone) || 1)));
  const unit = equipmentFragmentUnitForRealmV142(rankIndex);
  const eventYield = equipmentEvent ? unit * BigInt(z) : 0n;
  const firstClearYield = bossFirstClear ? unit * BigInt(2 + z) : 0n;
  return eventYield + firstClearYield;
}
export function rollElementSetFragmentFromHuntV142(monsterElements, monsterGrade, firstClear, roll01) {
  const elements = [...new Set(monsterElements ?? [])].filter(x => SET_BY_ELEMENT.has(x));
  if (!elements.length) return undefined;
  const gradeChance = monsterGrade === 'boss' ? 0.10 : monsterGrade === 'elite' ? 0.035 : monsterGrade === 'enhanced' ? 0.008 : 0;
  const chance = Math.min(0.35, gradeChance + (firstClear ? 0.06 : 0));
  if (chance <= 0 || Math.max(0, Math.min(0.999999999, Number(roll01) || 0)) >= chance) return undefined;
  const element = elements[Math.floor(Math.max(0, Math.min(0.999999999, Number(roll01) || 0)) * elements.length) % elements.length];
  const set = SET_BY_ELEMENT.get(element);
  return { setId: set.id, setName: set.name, amount: monsterGrade === 'boss' ? (firstClear ? 2 : 1) : 1 };
}

function hash01(seed, salt) {
  let x = ((seed >>> 0) ^ Math.imul((salt + 1) >>> 0, 0x9e3779b1)) >>> 0;
  x ^= x >>> 16; x = Math.imul(x, 0x7feb352d) >>> 0; x ^= x >>> 15; x = Math.imul(x, 0x846ca68b) >>> 0; x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
function legalAffixForSlot(def, slot) {
  if (!def?.live) return false;
  if (Array.isArray(def.allowedSlots) && def.allowedSlots.length > 0) return def.allowedSlots.includes(slot);
  return true;
}
function rollAffixesV142(slot, rankIndex, seed) {
  const count = equipmentAffixCountForRankV142(rankIndex);
  const candidates = EQUIPMENT_AFFIX_DEFINITIONS_V114.filter(def => legalAffixForSlot(def, slot));
  const result = [], used = new Set();
  for (let i = 0; i < count && candidates.length; i++) {
    const available = candidates.filter(def => !used.has(def.exclusiveGroup));
    if (!available.length) break;
    const def = available[Math.floor(hash01(seed, 140 + i * 3) * available.length) % available.length];
    const rollPct = EQUIPMENT_AFFIX_MIN_ROLL_PCT_V114 + (EQUIPMENT_AFFIX_MAX_ROLL_PCT_V114 - EQUIPMENT_AFFIX_MIN_ROLL_PCT_V114) * hash01(seed, 141 + i * 3);
    const target = Number(def.baseTarget) || 0;
    result.push({
      id: def.id, family: def.family, exclusiveGroup: def.exclusiveGroup,
      value: Math.round(target * rollPct / 100 * 10000) / 10000,
      rollPct: Math.round(rollPct * 100) / 100,
      buildAffix: Boolean(def.buildAffix), rootOriginId: def.rootOriginId,
    });
    used.add(def.exclusiveGroup);
  }
  return result;
}
function baseStatsForRank(slot, rankIndex) {
  const base = EQUIPMENT_SLOT_BASE_STATS_V142[slot];
  if (!base) throw new Error(`Ô trang bị V142 không hợp lệ: ${slot}`);
  const m = equipmentRealmMultiplierV142(rankIndex);
  return Object.fromEntries(Object.entries(base).map(([key, value]) => [key, Math.round(value * m * 1000) / 1000]));
}
function removeEquipmentByIds(equipmentState, ids) {
  const remove = new Set(ids);
  equipmentState.items = equipmentState.items.filter(item => !remove.has(item.id));
  for (const [slot, id] of Object.entries(equipmentState.equipped ?? {})) if (remove.has(id)) delete equipmentState.equipped[slot];
}

export function craftEquipmentFromFragmentsV142(state, equipmentState, slot, rankIndex, seed = 1, acquiredWorldYear = 0) {
  if (!EQUIPMENT_SLOTS_V142.includes(slot)) throw new Error(`Ô trang bị không hợp lệ: ${slot}`);
  const rank = Math.max(0, Math.floor(Number(rankIndex) || 0));
  const p = ensureEquipmentProgressionV142(state);
  const cost = equipmentFragmentCostV142(rank);
  p.fragments = spendBigIntString(p.fragments, cost);
  p.totalFragmentsSpent = addBigIntString(p.totalFragmentsSpent, cost);
  p.crafted += 1;
  const id = `equipment.v142.${slot}.${rank}.${seed >>> 0}.${p.crafted}`;
  const item = {
    schema: EQUIPMENT_V142_SCHEMA,
    id, templateId: `equipment.v142.${slot}`, name: `${equipmentRankNameV142(rank)} · ${EQUIPMENT_SLOT_LABELS_V142[slot]}`,
    slot, equipmentRankIndex: rank, equipmentRankName: equipmentRankNameV142(rank),
    enhancementLevel: 0, affixes: rollAffixesV142(slot, rank, seed >>> 0), reforgeCount: 0,
    stats: baseStatsForRank(slot, rank), tags: ['EquipmentV142', `EquipmentRank:${equipmentRankNameV142(rank)}`],
    source: { kind: 'craft', recipeId: 'equipment.v142.fragments', floor: rank + 1, seed: seed >>> 0 }, acquiredWorldYear,
  };
  equipmentState.items.push(item);
  return { item, cost: cost.toString(), fragmentBalance: p.fragments };
}

export function mergeEquipmentRankV142(state, mainItemId, fodderItemAId, fodderItemBId) {
  const ids = [mainItemId, fodderItemAId, fodderItemBId];
  if (new Set(ids).size !== 3) throw new Error('Hợp thành cần 3 trang bị khác nhau.');
  const items = ids.map(id => state.items.find(item => item.id === id));
  if (items.some(x => !x || x.schema !== EQUIPMENT_V142_SCHEMA)) throw new Error('Hợp thành V142 chỉ nhận trang bị V142.');
  const [main, a, b] = items;
  if (a.slot !== main.slot || b.slot !== main.slot) throw new Error('Ba trang bị hợp thành phải cùng ô.');
  if (a.equipmentRankIndex !== main.equipmentRankIndex || b.equipmentRankIndex !== main.equipmentRankIndex) throw new Error('Ba trang bị hợp thành phải cùng Bậc.');
  const nextRank = main.equipmentRankIndex + 1;
  removeEquipmentByIds(state, [a.id, b.id]);
  main.equipmentRankIndex = nextRank;
  main.equipmentRankName = equipmentRankNameV142(nextRank);
  main.name = `${main.setId ? `${equipmentSetDefinitionV142(main.setId)?.name ?? 'Bộ'} · ` : ''}${main.equipmentRankName} · ${EQUIPMENT_SLOT_LABELS_V142[main.slot]}`;
  main.stats = baseStatsForRank(main.slot, nextRank);
  main.tags = [...new Set([...(main.tags ?? []).filter(x => !String(x).startsWith('EquipmentRank:')), `EquipmentRank:${main.equipmentRankName}`])];
  return { item: main, consumedItemIds: [a.id, b.id], nextRankIndex: nextRank, nextRankName: main.equipmentRankName };
}

export function engraveEquipmentSetV142(state, equipmentState, itemId, setId) {
  const item = equipmentState.items.find(x => x.id === itemId);
  if (!item || item.schema !== EQUIPMENT_V142_SCHEMA) throw new Error('Không tìm thấy trang bị V142 để Khắc Bộ.');
  const set = equipmentSetDefinitionV142(setId);
  if (!set) throw new Error(`Bộ Trang Bị V142 không hợp lệ: ${setId}`);
  const slotCategory = EQUIPMENT_ATTIRE_SLOTS_V142.includes(item.slot) ? 'attire' : EQUIPMENT_JEWELRY_SLOTS_V142.includes(item.slot) ? 'jewelry' : 'none';
  if (slotCategory !== set.category) throw new Error(`${set.name} chỉ khắc lên ${set.category === 'attire' ? '6 Y Trang' : '4 Trang Sức'}.`);
  const p = ensureEquipmentProgressionV142(state);
  const resourceId = equipmentSetFragmentResourceIdV142(setId);
  const have = asBigInt(p.setFragments[resourceId] ?? '0');
  if (have < EQUIPMENT_SET_FRAGMENT_COST_V142) throw new Error(`Thiếu ${equipmentSetFragmentNameV142(setId)}: ${have}/${EQUIPMENT_SET_FRAGMENT_COST_V142}.`);
  p.setFragments[resourceId] = (have - EQUIPMENT_SET_FRAGMENT_COST_V142).toString();
  item.setId = setId;
  item.name = `${set.name} · ${item.equipmentRankName ?? equipmentRankNameV142(item.equipmentRankIndex)} · ${EQUIPMENT_SLOT_LABELS_V142[item.slot]}`;
  item.tags = [...new Set([...(item.tags ?? []).filter(x => !String(x).startsWith('SetV142:')), `SetV142:${set.key}`])];
  return { item, setId, setName: set.name, cost: EQUIPMENT_SET_FRAGMENT_COST_V142.toString(), balance: p.setFragments[resourceId] };
}

function addObjectNumbers(target, source) {
  for (const [key, value] of Object.entries(source ?? {})) if (typeof value === 'number' && Number.isFinite(value)) target[key] = (target[key] ?? 0) + value;
}
export function equipmentSetPowerV142(equipmentState) {
  const counts = new Map();
  for (const itemId of Object.values(equipmentState.equipped ?? {})) {
    const item = equipmentState.items.find(x => x.id === itemId);
    if (!item || item.schema !== EQUIPMENT_V142_SCHEMA || !item.setId || !SET_BY_ID.has(item.setId)) continue;
    const set = SET_BY_ID.get(item.setId);
    const legal = set.category === 'attire' ? EQUIPMENT_ATTIRE_SLOTS_V142.includes(item.slot) : EQUIPMENT_JEWELRY_SLOTS_V142.includes(item.slot);
    if (!legal) continue;
    counts.set(item.setId, (counts.get(item.setId) ?? 0) + 1);
  }
  const flatStats = {}, statMultipliers = {}, activeSets = [];
  for (const [setId, pieces] of counts) {
    const set = SET_BY_ID.get(setId), activeBonuses = [];
    for (const bonus of set.bonuses) {
      if (pieces < bonus.pieces) continue;
      addObjectNumbers(flatStats, bonus.flatStats);
      addObjectNumbers(statMultipliers, bonus.statMultipliers);
      activeBonuses.push(`${bonus.pieces} món: ${bonus.name}`);
    }
    if (activeBonuses.length) activeSets.push({ setId, setName: set.name, pieces, activeBonuses, category: set.category });
  }
  return { flatStats, statMultipliers, activeSets };
}

export function dungeonEquipmentFragmentGrantV142(state, dungeonId, realmOrder, floor, firstClear, equipmentRollCount = 1) {
  const rank = equipmentRankIndexFromRealmOrderV142(realmOrder);
  const rolls = Math.max(0, Math.floor(Number(equipmentRollCount) || 0));
  const basePerRoll = BigInt(firstClear ? 12 : 4) * equipmentFragmentUnitForRealmV142(rank);
  const generic = grantEquipmentFragmentsV142(state, basePerRoll * BigInt(rolls), `dungeon:${dungeonId}`);
  const setGrants = [];
  if (String(dungeonId).includes('ngu_hanh_dao_kho')) {
    const set = ATTIRE_SETS[(Math.max(1, Math.floor(Number(floor) || 1)) - 1) % ATTIRE_SETS.length];
    setGrants.push(grantEquipmentSetFragmentsV142(state, set.id, firstClear ? 5 : 1, `dungeon:${dungeonId}`));
  }
  else if (String(dungeonId).includes('hop_dao_bao_kho')) {
    const set = JEWELRY_SETS[(Math.max(1, Math.floor(Number(floor) || 1)) - 1) % JEWELRY_SETS.length];
    setGrants.push(grantEquipmentSetFragmentsV142(state, set.id, firstClear ? 5 : 1, `dungeon:${dungeonId}`));
  }
  return { generic, setGrants };
}
