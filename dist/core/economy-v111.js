import { SeededRng } from './rng.js';
import { equipmentGradeIndex } from './equipment.js';
export const ECONOMY_V111_SCHEMA = 'economy.v1.11';
export const PHUONG_THI_REFRESH_WORLD_YEARS = 25; // 6 real hours under the locked 100 years/day clock.
export const ECONOMY_REALM_TIER_NAMES = ['Phàm', 'Linh', 'Huyền', 'Địa', 'Thiên', 'Tiên', 'Cực', 'Phá'];
export const ECONOMY_V111_BALANCE = {
    ordinaryMaterialChancePct: 40,
    ordinaryEquipmentChancePct: 5,
    ordinaryRareChancePct: .1,
    enhancedMaterialChancePct: 55,
    enhancedEquipmentChancePct: 8,
    enhancedRareChancePct: .25,
    eliteMaterialChancePct: 75,
    eliteEquipmentChancePct: 15,
    eliteRareChancePct: .5,
    bossEquipmentChancePct: 30,
    bossRareChancePct: 1,
    materialUpgradeRatio: 10,
    spiritStoneBandMultiplier: 5,
    shopNaturalRefreshHours: 6,
    shopFixedSlots: 3,
    shopRandomSlots: 6,
    shopManualRefreshIncomeShare: .03,
    shopManualRefreshMultipliers: [1, 2, 4, 8],
    targetConcurrentDemandCoveragePct: 65,
    shopExpectedSixHourSpiritStonesBand1: 100_000,
    deterministicFoundationTreasureBossInterval: 250,
    specialStorageCapacity: 200,
};
const herbVariants = [
    { variant: 'qi', name: 'Tụ Linh Thảo', tags: ['Herb', 'Qi'], value: 10 },
    { variant: 'meridian', name: 'Dưỡng Mạch Diệp', tags: ['Herb', 'Meridian'], value: 13 },
    { variant: 'purity', name: 'Thanh Tâm Hoa', tags: ['Herb', 'Purification'], value: 16 },
];
const oreVariants = [
    { variant: 'iron', name: 'Huyền Thiết Khoáng', tags: ['Ore', 'Forging'], value: 14 },
    { variant: 'spiritCrystal', name: 'Linh Tinh Khoáng', tags: ['Ore', 'Spirit'], value: 18 },
    { variant: 'fiveElement', name: 'Ngũ Hành Tinh Khoáng', tags: ['Ore', 'FiveElements'], value: 22 },
];
const beastVariants = [
    { variant: 'beast', name: 'Yêu Đan', tags: ['BeastCore', 'General'], value: 18 },
    { variant: 'blood', name: 'Huyết Yêu Đan', tags: ['BeastCore', 'Blood'], value: 22 },
    { variant: 'elemental', name: 'Ngũ Hành Yêu Đan', tags: ['BeastCore', 'FiveElements'], value: 27 },
];
export const heavenlyTreasureDefinitions = {
    'resource.foundation_treasure': { resourceId: 'resource.foundation_treasure', name: 'Địa Tâm Linh Nhũ', tags: ['HeavenlyTreasure', 'FoundationRecovery'], baseValue: 900 },
    'resource.heavenly.five_element_jade': { resourceId: 'resource.heavenly.five_element_jade', name: 'Ngũ Hành Đạo Ngọc', tags: ['HeavenlyTreasure', 'FiveElements', 'Breakthrough'], baseValue: 1300 },
    'resource.heavenly.void_lotus': { resourceId: 'resource.heavenly.void_lotus', name: 'Hư Không Tiên Liên', tags: ['HeavenlyTreasure', 'RareRecipe'], baseValue: 1800 },
};
export function economyRealmTierName(tier) { return ECONOMY_REALM_TIER_NAMES[Math.max(1, Math.min(8, Math.floor(tier))) - 1]; }
export function clampEconomyRealmTier(tier) { return Math.max(1, Math.min(8, Math.floor(tier))); }
export function economyMaterialResourceId(family, realmTier, variant = 'qi') {
    const t = clampEconomyRealmTier(realmTier);
    if (family === 'equipmentEssence' && t === 1)
        return 'resource.forging_essence'; // compatibility alias = Phàm Tinh Hoa Trang Bị.
    return `resource.economy.${family}.t${t}.${variant}`;
}
export function parseEconomyMaterialResourceId(id) {
    if (id === 'resource.forging_essence')
        return { family: 'equipmentEssence', realmTier: 1, variant: 'essence' };
    const m = /^resource\.economy\.(herb|ore|beastCore|equipmentEssence)\.t([1-8])\.([A-Za-z]+)$/.exec(id);
    if (!m)
        return undefined;
    return { family: m[1], realmTier: Number(m[2]), variant: m[3] };
}
export function economyMaterialDefinition(resourceId) {
    const parsed = parseEconomyMaterialResourceId(resourceId);
    if (!parsed)
        return undefined;
    const tierScale = Math.pow(3, parsed.realmTier - 1);
    if (parsed.family === 'equipmentEssence')
        return { resourceId, family: parsed.family, variant: 'essence', realmTier: parsed.realmTier, name: `Tinh Hoa Trang Bị · ${economyRealmTierName(parsed.realmTier)}`, tags: ['EquipmentEssence', 'Salvage'], baseValue: 24 * tierScale };
    const pool = parsed.family === 'herb' ? herbVariants : parsed.family === 'ore' ? oreVariants : beastVariants;
    const base = pool.find(x => x.variant === parsed.variant) ?? pool[0];
    return { resourceId, family: parsed.family, variant: base.variant, realmTier: parsed.realmTier, name: `${base.name} · ${economyRealmTierName(parsed.realmTier)}`, tags: [...base.tags], baseValue: base.value * tierScale };
}
export function economyMaterialCatalogueForTier(realmTier) {
    const tier = clampEconomyRealmTier(realmTier);
    const out = [];
    for (const base of herbVariants)
        out.push(economyMaterialDefinition(economyMaterialResourceId('herb', tier, base.variant)));
    for (const base of oreVariants)
        out.push(economyMaterialDefinition(economyMaterialResourceId('ore', tier, base.variant)));
    for (const base of beastVariants)
        out.push(economyMaterialDefinition(economyMaterialResourceId('beastCore', tier, base.variant)));
    out.push(economyMaterialDefinition(economyMaterialResourceId('equipmentEssence', tier, 'essence')));
    return out;
}
export function economyBandScale(majorRealmIndex) {
    const index = Math.max(1, Math.floor(majorRealmIndex));
    return Math.min(9e15, Math.pow(ECONOMY_V111_BALANCE.spiritStoneBandMultiplier, index - 1));
}
/** Backend-only broad tier used by Phường Thị when no hunting-zone tier is explicitly selected. */
export function economyTierForMajorRealmIndex(majorRealmIndex) {
    const i = Math.max(1, Math.min(28, Math.floor(majorRealmIndex)));
    // 28 authored major realms are distributed across all eight economy tiers; endgame must actually reach Phá stock.
    return clampEconomyRealmTier(Math.ceil(i * 8 / 28));
}
export function createEconomyV111Telemetry() {
    return { huntFights: 0, huntWins: 0, huntBosses: 0, spiritStonesFromHunt: 0, spiritStonesFromSalvage: 0, spiritStonesSpentShop: 0, spiritStonesEarnedMaterialSales: 0, materialDropsByFamily: {}, materialConversions: 0, equipmentSalvaged: 0, equipmentEssenceRecovered: 0, rareTreasuresFound: 0, shopPurchases: 0, manualShopRefreshes: 0, naturalShopRefreshes: 0 };
}
export function createEconomyV111State() { return { schema: ECONOMY_V111_SCHEMA, telemetry: createEconomyV111Telemetry(), specialStorage: { capacity: ECONOMY_V111_BALANCE.specialStorageCapacity, stacks: {}, protectedOverflow: 0 } }; }
export function cloneEconomyV111State(state) {
    if (!state)
        return undefined;
    return { schema: ECONOMY_V111_SCHEMA, telemetry: { ...state.telemetry, materialDropsByFamily: { ...state.telemetry.materialDropsByFamily } }, specialStorage: { capacity: Math.max(1, state.specialStorage?.capacity ?? ECONOMY_V111_BALANCE.specialStorageCapacity), stacks: { ...(state.specialStorage?.stacks ?? {}) }, protectedOverflow: Math.max(0, state.specialStorage?.protectedOverflow ?? 0) }, phuongThi: state.phuongThi ? { ...state.phuongThi, slots: state.phuongThi.slots.map(x => ({ ...x, tags: [...x.tags] })) } : undefined };
}
export function ensureEconomyV111State(container) {
    const state = container.v111 ?? (container.v111 = createEconomyV111State());
    // Safe hydration for saves created while v1.11 was in development or legacy saves that omitted the optional block.
    state.specialStorage ??= { capacity: ECONOMY_V111_BALANCE.specialStorageCapacity, stacks: {}, protectedOverflow: 0 };
    state.specialStorage.capacity = Math.max(1, Math.floor(state.specialStorage.capacity || ECONOMY_V111_BALANCE.specialStorageCapacity));
    state.specialStorage.stacks ??= {};
    state.specialStorage.protectedOverflow = Math.max(0, Math.floor(state.specialStorage.protectedOverflow || 0));
    return state;
}
export function isHeavenlyTreasureResourceId(id) { return Object.prototype.hasOwnProperty.call(heavenlyTreasureDefinitions, id); }
/** Read special-item storage with a legacy inventory fallback so old saves remain consumable. */
export function heavenlyTreasureQuantity(container, legacyInventory, resourceId) {
    const storage = container.v111?.specialStorage;
    return Math.max(0, Math.floor(storage?.stacks?.[resourceId] ?? 0)) + Math.max(0, Math.floor(legacyInventory[resourceId] ?? 0));
}
/** New v1.11 treasure drops/purchases go to protected special storage, not the material/currency ledger. */
export function addHeavenlyTreasure(container, resourceId, quantity = 1) {
    if (!isHeavenlyTreasureResourceId(resourceId))
        throw new Error(`Không phải Thiên Tài Địa Bảo V1.11: ${resourceId}`);
    const storage = ensureEconomyV111State(container).specialStorage, qty = Math.max(0, Math.floor(quantity));
    if (qty > 0)
        storage.stacks[resourceId] = Math.max(0, Math.floor(storage.stacks[resourceId] ?? 0)) + qty;
    const usedSlots = Object.values(storage.stacks).filter(n => Math.max(0, Math.floor(n ?? 0)) > 0).length;
    storage.protectedOverflow = Math.max(0, usedSlots - storage.capacity);
    return { quantity: Math.max(0, Math.floor(storage.stacks[resourceId] ?? 0)), usedSlots, capacity: storage.capacity, protectedOverflow: storage.protectedOverflow };
}
/** Spend legacy inventory first, then protected v1.11 storage. Returns false atomically when quantity is insufficient. */
export function spendHeavenlyTreasure(container, legacyInventory, resourceId, quantity = 1) {
    const need = Math.max(0, Math.floor(quantity));
    if (need <= 0)
        return true;
    if (heavenlyTreasureQuantity(container, legacyInventory, resourceId) < need)
        return false;
    let remaining = need;
    const legacy = Math.max(0, Math.floor(legacyInventory[resourceId] ?? 0)), fromLegacy = Math.min(legacy, remaining);
    if (fromLegacy > 0) {
        legacyInventory[resourceId] = legacy - fromLegacy;
        remaining -= fromLegacy;
    }
    if (remaining > 0) {
        const storage = ensureEconomyV111State(container).specialStorage, current = Math.max(0, Math.floor(storage.stacks[resourceId] ?? 0));
        storage.stacks[resourceId] = Math.max(0, current - remaining);
    }
    return true;
}
export function applyHeavenlyTreasureDrops(container, drops) {
    let total = 0;
    for (const [id, raw] of Object.entries(drops)) {
        if (!isHeavenlyTreasureResourceId(id))
            continue;
        const qty = Math.max(0, Math.floor(raw));
        if (!qty)
            continue;
        addHeavenlyTreasure(container, id, qty);
        total += qty;
    }
    return total;
}
function gradeDropProfile(grade) {
    if (grade === 'boss')
        return { material: 100, equipment: ECONOMY_V111_BALANCE.bossEquipmentChancePct, rare: ECONOMY_V111_BALANCE.bossRareChancePct, qty: [1, 1] };
    if (grade === 'elite')
        return { material: ECONOMY_V111_BALANCE.eliteMaterialChancePct, equipment: ECONOMY_V111_BALANCE.eliteEquipmentChancePct, rare: ECONOMY_V111_BALANCE.eliteRareChancePct, qty: [2, 3] };
    if (grade === 'enhanced')
        return { material: ECONOMY_V111_BALANCE.enhancedMaterialChancePct, equipment: ECONOMY_V111_BALANCE.enhancedEquipmentChancePct, rare: ECONOMY_V111_BALANCE.enhancedRareChancePct, qty: [1, 2] };
    return { material: ECONOMY_V111_BALANCE.ordinaryMaterialChancePct, equipment: ECONOMY_V111_BALANCE.ordinaryEquipmentChancePct, rare: ECONOMY_V111_BALANCE.ordinaryRareChancePct, qty: [1, 1] };
}
function weightedFamily(rng, primaryElement, monsterTags = []) {
    let herb = 34, ore = 31, beast = 35;
    if (primaryElement === 'Wood' || primaryElement === 'Water')
        herb += 20;
    if (primaryElement === 'Earth' || primaryElement === 'Metal')
        ore += 20;
    if (primaryElement === 'Fire')
        beast += 15;
    if (monsterTags.some(x => /Wolf|Serpent|Demon|Dragon|Beast|Yêu|Lang|Xà/i.test(x)))
        beast += 18;
    const total = herb + ore + beast, roll = rng.next() * total;
    if (roll < herb)
        return 'herb';
    if (roll < herb + ore)
        return 'ore';
    return 'beastCore';
}
function variantForFamily(rng, family) {
    const pool = family === 'herb' ? herbVariants : family === 'ore' ? oreVariants : beastVariants;
    const roll = rng.next();
    return (roll < .62 ? pool[0] : roll < .90 ? pool[1] : pool[2]).variant;
}
export function huntEconomyDropChances(grade, lootMultiplier = 1) {
    const profile = gradeDropProfile(grade), loot = Math.max(.25, Math.min(4, lootMultiplier));
    return {
        materialChancePct: grade === 'boss' ? 100 : Math.min(95, profile.material * loot),
        equipmentChancePct: Math.min(80, profile.equipment * loot),
        rareChancePct: Math.min(10, profile.rare * Math.sqrt(loot)),
    };
}
export function rollHuntEconomyLoot(input) {
    const rng = new SeededRng((input.seed ^ 0x51e11eaf) >>> 0), profile = gradeDropProfile(input.grade), loot = Math.max(.25, Math.min(4, input.lootMultiplier ?? 1));
    // Loot bonuses improve the chance but do not multiply guaranteed boss drops into many separate items.
    const chances = huntEconomyDropChances(input.grade, loot), materialChance = chances.materialChancePct, rareChance = Math.max(0, Math.min(100, input.rareChancePctOverride ?? chances.rareChancePct)), equipmentChancePct = chances.equipmentChancePct;
    const materialDrops = {}, rareTreasureDrops = {};
    let materialRollSucceeded = false, rareRollSucceeded = false;
    if (rng.chance(materialChance)) {
        materialRollSucceeded = true;
        const family = weightedFamily(rng, input.primaryElement, input.monsterTags ?? []), variant = variantForFamily(rng, family), id = economyMaterialResourceId(family, input.realmTier, variant);
        const qty = profile.qty[0] + Math.floor(rng.next() * (profile.qty[1] - profile.qty[0] + 1));
        materialDrops[id] = (materialDrops[id] ?? 0) + qty;
    }
    if (rng.chance(rareChance)) {
        rareRollSucceeded = true;
        // The locked 0.1% / 1% lane is a jackpot lane, not a promise that every jackpot is a Heavenly Treasure.
        // Most jackpots are a large bundle of ordinary tier materials; named Thiên Tài Địa Bảo remain memorable special items.
        if (rng.next() < .35) {
            const roll = rng.next();
            const id = roll < .58 ? 'resource.foundation_treasure' : roll < .88 ? 'resource.heavenly.five_element_jade' : 'resource.heavenly.void_lotus';
            rareTreasureDrops[id] = (rareTreasureDrops[id] ?? 0) + 1;
        }
        else {
            const family = weightedFamily(rng, input.primaryElement, input.monsterTags ?? []), variant = variantForFamily(rng, family), id = economyMaterialResourceId(family, input.realmTier, variant);
            materialDrops[id] = (materialDrops[id] ?? 0) + 3 + Math.floor(rng.next() * 4);
        }
    }
    let guaranteedMilestoneTreasure;
    if (input.grade === 'boss' && input.bossKillNumber && input.bossKillNumber > 0 && input.bossKillNumber % ECONOMY_V111_BALANCE.deterministicFoundationTreasureBossInterval === 0) {
        guaranteedMilestoneTreasure = 'resource.foundation_treasure';
        rareTreasureDrops[guaranteedMilestoneTreasure] = (rareTreasureDrops[guaranteedMilestoneTreasure] ?? 0) + 1;
    }
    return { materialDrops, rareTreasureDrops, materialRollSucceeded, rareRollSucceeded, equipmentChancePct, guaranteedMilestoneTreasure };
}
export function applyEconomyResourceDrops(inventory, drops) {
    let total = 0;
    for (const [id, raw] of Object.entries(drops)) {
        const amount = Math.max(0, Math.floor(raw));
        if (!amount)
            continue;
        inventory[id] = (inventory[id] ?? 0) + amount;
        total += amount;
    }
    return total;
}
export function recordHuntEconomyTelemetry(container, input) {
    const t = ensureEconomyV111State(container).telemetry;
    t.huntFights++;
    if (input.won)
        t.huntWins++;
    if (input.won && input.boss)
        t.huntBosses++;
    t.spiritStonesFromHunt += Math.max(0, input.spiritStones);
    for (const [id, n] of Object.entries(input.materialDrops)) {
        const p = parseEconomyMaterialResourceId(id);
        if (p)
            t.materialDropsByFamily[p.family] = (t.materialDropsByFamily[p.family] ?? 0) + Math.max(0, n);
    }
    t.rareTreasuresFound += Object.values(input.rareDrops).reduce((a, b) => a + Math.max(0, b), 0);
}
export function convertEconomyMaterial(inventory, resourceId, batches = 1) {
    const p = parseEconomyMaterialResourceId(resourceId);
    if (!p)
        throw new Error('Vật liệu này không thuộc hệ Economy V1.11.');
    if (p.realmTier >= 8)
        throw new Error('Vật liệu Phá đã ở tier tối đa, không thể hợp thành cao hơn.');
    const usedBatches = Math.max(1, Math.floor(batches));
    const spent = usedBatches * ECONOMY_V111_BALANCE.materialUpgradeRatio;
    const have = Math.max(0, Math.floor(inventory[resourceId] ?? 0));
    if (have < spent)
        throw new Error(`Cần ${spent} nguyên liệu để hợp thành ${usedBatches} đơn vị tier kế.`);
    const toId = economyMaterialResourceId(p.family, p.realmTier + 1, p.variant);
    inventory[resourceId] = have - spent;
    inventory[toId] = (inventory[toId] ?? 0) + usedBatches;
    return { fromId: resourceId, toId, spent, received: usedBatches, ratio: ECONOMY_V111_BALANCE.materialUpgradeRatio };
}
const qualityValue = { low: .85, mid: 1, high: 1.25, supreme: 1.6, perfect: 2.1 };
export function equipmentEssenceResourceIdForItem(item) { return economyMaterialResourceId('equipmentEssence', equipmentGradeIndex(item.grade ?? 'mundane') + 1, 'essence'); }
export function equipmentSalvageV111(item) {
    const gradeIndex = Math.max(0, equipmentGradeIndex(item.grade ?? 'mundane'));
    const q = qualityValue[item.quality];
    const level = Math.max(1, item.itemLevel || 1);
    const nominalValue = Math.max(10, Math.round((30 + Math.sqrt(level) * 9) * (gradeIndex + 1) ** 1.35 * q));
    const spiritStones = Math.max(1, Math.round(nominalValue * .075)); // locked 5-10% band: V1 midpoint 7.5%.
    const essence = Math.max(1, Math.round((1.5 + Math.sqrt(level) / 18) * (1 + gradeIndex * .28) * q));
    return { spiritStones, essenceResourceId: equipmentEssenceResourceIdForItem(item), essence, nominalValue };
}
export function expectedSpiritStoneIncomeSixHours(majorRealmIndex) { return Math.max(100, Math.round(ECONOMY_V111_BALANCE.shopExpectedSixHourSpiritStonesBand1 * economyBandScale(majorRealmIndex))); }
export function phuongThiManualRefreshCost(majorRealmIndex, manualRefreshCount) {
    const multiplier = ECONOMY_V111_BALANCE.shopManualRefreshMultipliers[Math.min(ECONOMY_V111_BALANCE.shopManualRefreshMultipliers.length - 1, Math.max(0, Math.floor(manualRefreshCount)))];
    return Math.max(1, Math.round(expectedSpiritStoneIncomeSixHours(majorRealmIndex) * ECONOMY_V111_BALANCE.shopManualRefreshIncomeShare * multiplier));
}
function marketUnitPrice(resourceId, majorRealmIndex) {
    const material = economyMaterialDefinition(resourceId);
    if (material)
        return Math.max(1, Math.round(material.baseValue * economyBandScale(majorRealmIndex)));
    const treasure = heavenlyTreasureDefinitions[resourceId];
    if (treasure)
        return Math.max(1, Math.round(treasure.baseValue * economyBandScale(majorRealmIndex)));
    return Math.max(1, Math.round(30 * economyBandScale(majorRealmIndex)));
}
function pickMaterialSlot(rng, tier, majorRealmIndex, fixed, index, family) {
    const actualTier = rng.next() < .20 && tier > 1 ? (tier - 1) : tier;
    const f = family ?? ['herb', 'ore', 'beastCore'][Math.floor(rng.next() * 3)];
    const variant = variantForFamily(rng, f);
    const id = economyMaterialResourceId(f, actualTier, variant);
    const def = economyMaterialDefinition(id);
    const qty = fixed ? (f === 'herb' ? 24 : f === 'ore' ? 16 : 10) : 5 + Math.floor(rng.next() * 16);
    return { id: `slot.${index}`, kind: 'resource', name: def.name, quantity: qty, pricePerUnit: marketUnitPrice(id, majorRealmIndex), fixed, resourceId: id, tags: [...def.tags, actualTier < tier ? 'PreviousTier' : 'CurrentTier'] };
}
function equipmentGradeForEconomyTier(tier) { return ['mundane', 'spirit', 'mystic', 'earth', 'heaven', 'immortal', 'extreme', 'breaker'][tier - 1]; }
function randomQuality(rng) { const r = rng.next(); return r < .50 ? 'mid' : r < .82 ? 'high' : r < .96 ? 'supreme' : 'perfect'; }
export function generatePhuongThiState(input) {
    const major = Math.max(1, Math.floor(input.majorRealmIndex)), tier = clampEconomyRealmTier(input.materialTier), serial = Math.max(0, Math.floor(input.refreshSerial ?? 0));
    const rng = new SeededRng((input.seed ^ major * 0x9e3779b9 ^ tier * 0x85ebca6b ^ serial * 0xc2b2ae35) >>> 0);
    const slots = [];
    slots.push(pickMaterialSlot(rng, tier, major, true, 0, 'herb'), pickMaterialSlot(rng, tier, major, true, 1, 'ore'), pickMaterialSlot(rng, tier, major, true, 2, 'beastCore'));
    const templates = input.equipmentTemplateIds ?? [];
    for (let i = 3; i < 9; i++) {
        const roll = rng.next();
        if (roll < .58) {
            slots.push(pickMaterialSlot(rng, tier, major, false, i));
            continue;
        }
        if (roll < .74) {
            const id = economyMaterialResourceId('equipmentEssence', rng.next() < .20 && tier > 1 ? tier - 1 : tier, 'essence');
            const def = economyMaterialDefinition(id);
            slots.push({ id: `slot.${i}`, kind: 'resource', name: def.name, quantity: 2 + Math.floor(rng.next() * 8), pricePerUnit: marketUnitPrice(id, major), fixed: false, resourceId: id, tags: [...def.tags] });
            continue;
        }
        if (roll < .90 && templates.length) {
            const templateId = templates[Math.floor(rng.next() * templates.length)], quality = randomQuality(rng), grade = equipmentGradeForEconomyTier(tier), legacyTier = Math.max(0, Math.min(20, Math.floor((major - 1) / 2) + (tier - 1)));
            const price = Math.max(1, Math.round((250 + legacyTier * 90) * (1 + equipmentGradeIndex(grade) * .65) * qualityValue[quality] * economyBandScale(major)));
            slots.push({ id: `slot.${i}`, kind: 'equipment', name: `Trang bị ${economyRealmTierName(tier)} · ${quality}`, quantity: 1, pricePerUnit: price, fixed: false, equipmentTemplateId: templateId, equipmentQuality: quality, equipmentGrade: grade, equipmentTier: legacyTier, equipmentSeed: rng.nextUint32(), tags: ['Equipment', 'RandomStock'] });
            continue;
        }
        const treasureIds = Object.keys(heavenlyTreasureDefinitions);
        const id = treasureIds[Math.floor(rng.next() * treasureIds.length)], def = heavenlyTreasureDefinitions[id];
        slots.push({ id: `slot.${i}`, kind: 'resource', name: def.name, quantity: 1, pricePerUnit: marketUnitPrice(id, major), fixed: false, resourceId: id, tags: [...def.tags, 'RareStock'] });
    }
    const periodStart = Math.floor(Math.max(0, input.worldYear) / PHUONG_THI_REFRESH_WORLD_YEARS) * PHUONG_THI_REFRESH_WORLD_YEARS;
    return { schema: 'phuong-thi.v1', economyBand: major, materialTier: tier, refreshSerial: serial, lastRefreshWorldYear: periodStart, nextRefreshWorldYear: periodStart + PHUONG_THI_REFRESH_WORLD_YEARS, manualRefreshCount: Math.max(0, Math.floor(input.manualRefreshCount ?? 0)), slots };
}
export function syncPhuongThi(input) {
    const v = ensureEconomyV111State(input.container), major = Math.max(1, Math.floor(input.majorRealmIndex)), tier = clampEconomyRealmTier(input.materialTier);
    let shop = v.phuongThi;
    if (!shop || shop.economyBand !== major || shop.materialTier !== tier) {
        shop = generatePhuongThiState({ ...input, refreshSerial: (shop?.refreshSerial ?? 0) + 1, manualRefreshCount: 0 });
        v.phuongThi = shop;
        return shop;
    }
    if (input.worldYear + 1e-9 >= shop.nextRefreshWorldYear) {
        const periods = Math.max(1, Math.floor((input.worldYear - shop.nextRefreshWorldYear) / PHUONG_THI_REFRESH_WORLD_YEARS) + 1);
        shop = generatePhuongThiState({ ...input, refreshSerial: shop.refreshSerial + periods, manualRefreshCount: 0 });
        v.phuongThi = shop;
        v.telemetry.naturalShopRefreshes += periods;
    }
    return shop;
}
export function manualRefreshPhuongThi(input) {
    const current = syncPhuongThi(input), cost = phuongThiManualRefreshCost(input.majorRealmIndex, current.manualRefreshCount), stones = Math.max(0, Math.floor(input.inventory['resource.spirit_stone'] ?? 0));
    if (stones < cost)
        throw new Error(`Không đủ Linh Thạch để làm mới Phường Thị: cần ${cost}.`);
    input.inventory['resource.spirit_stone'] = stones - cost;
    const next = generatePhuongThiState({ ...input, refreshSerial: current.refreshSerial + 1, manualRefreshCount: current.manualRefreshCount + 1 });
    ensureEconomyV111State(input.container).phuongThi = next;
    const t = ensureEconomyV111State(input.container).telemetry;
    t.spiritStonesSpentShop += cost;
    t.manualShopRefreshes++;
    return { shop: next, cost };
}
export function buyPhuongThiResource(input) {
    const slot = input.shop.slots.find(x => x.id === input.slotId);
    if (!slot)
        throw new Error('Không tìm thấy ô Phường Thị.');
    if (slot.kind !== 'resource' || !slot.resourceId)
        throw new Error('Ô này là trang bị, cần dùng giao dịch trang bị.');
    const qty = Math.max(1, Math.floor(input.quantity));
    if (slot.quantity < qty)
        throw new Error('Phường Thị không còn đủ hàng trong ô này.');
    const cost = slot.pricePerUnit * qty, stones = Math.max(0, Math.floor(input.inventory['resource.spirit_stone'] ?? 0));
    if (stones < cost)
        throw new Error(`Không đủ Linh Thạch: cần ${cost}.`);
    input.inventory['resource.spirit_stone'] = stones - cost;
    if (isHeavenlyTreasureResourceId(slot.resourceId))
        addHeavenlyTreasure(input.container, slot.resourceId, qty);
    else
        input.inventory[slot.resourceId] = (input.inventory[slot.resourceId] ?? 0) + qty;
    slot.quantity -= qty;
    const t = ensureEconomyV111State(input.container).telemetry;
    t.spiritStonesSpentShop += cost;
    t.shopPurchases += qty;
    return { slot, quantity: qty, cost };
}
export function sellEconomyMaterial(input) {
    const def = economyMaterialDefinition(input.resourceId);
    if (!def)
        throw new Error('Chỉ vật liệu phổ thông mới được bán trực tiếp; trang bị phải Phân Giải.');
    const qty = Math.max(1, Math.floor(input.quantity)), have = Math.max(0, Math.floor(input.inventory[input.resourceId] ?? 0));
    if (have < qty)
        throw new Error('Không đủ vật liệu để bán.');
    const unitPrice = Math.max(1, Math.floor(marketUnitPrice(input.resourceId, input.majorRealmIndex) * .12));
    const earned = unitPrice * qty;
    input.inventory[input.resourceId] = have - qty;
    input.inventory['resource.spirit_stone'] = (input.inventory['resource.spirit_stone'] ?? 0) + earned;
    const t = ensureEconomyV111State(input.container).telemetry;
    t.spiritStonesEarnedMaterialSales += earned;
    return { resourceId: input.resourceId, quantity: qty, unitPrice, earned };
}
//# sourceMappingURL=economy-v111.js.map