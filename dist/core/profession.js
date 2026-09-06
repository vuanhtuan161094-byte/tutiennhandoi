import { addEquipment, buildEquipmentInstance } from './equipment.js';
import { SeededRng } from './rng.js';
import { addTuViV140 } from './cultivation-v140.js';
const QUALITY_ORDER = ['low', 'mid', 'high', 'supreme', 'perfect'];
const QUALITY_MULTIPLIER = {
    low: 0.82,
    mid: 1,
    high: 1.18,
    supreme: 1.42,
    perfect: 1.72,
};
export const productQualityNames = {
    low: 'Hạ Phẩm',
    mid: 'Trung Phẩm',
    high: 'Thượng Phẩm',
    supreme: 'Cực Phẩm',
    perfect: 'Hoàn Mỹ',
};
function newTrack(mastery = 0) {
    return { mastery: Math.max(0, Math.min(100, mastery)), attempts: 0, successes: 0, failures: 0, knownRecipeIds: [], highestQuality: null };
}
export function createProfessionState(initialMastery = 0) {
    return {
        tracks: { alchemy: newTrack(initialMastery), forging: newTrack(initialMastery), talisman: newTrack(initialMastery) },
        stock: [],
    };
}
export function cloneProfessionState(state) {
    return {
        tracks: {
            alchemy: { ...state.tracks.alchemy, knownRecipeIds: [...state.tracks.alchemy.knownRecipeIds] },
            forging: { ...state.tracks.forging, knownRecipeIds: [...state.tracks.forging.knownRecipeIds] },
            talisman: { ...state.tracks.talisman, knownRecipeIds: [...state.tracks.talisman.knownRecipeIds] },
        },
        stock: state.stock.map(entry => ({ ...entry })),
    };
}
function stockEntry(state, productId, quality) {
    let entry = state.stock.find(candidate => candidate.productId === productId && candidate.quality === quality);
    if (!entry) {
        entry = { productId, quality, quantity: 0 };
        state.stock.push(entry);
    }
    return entry;
}
export function craftedStock(state, productId, quality) {
    return state.stock
        .filter(entry => entry.productId === productId && (!quality || entry.quality === quality))
        .reduce((sum, entry) => sum + entry.quantity, 0);
}
export function learnProfessionRecipe(state, recipe) {
    const track = state.tracks[recipe.professionId];
    if (!track.knownRecipeIds.includes(recipe.id))
        track.knownRecipeIds.push(recipe.id);
}
export function unlockEligibleProfessionRecipes(state, registry) {
    const unlocked = [];
    for (const recipe of registry.professionRecipes.values()) {
        const track = state.tracks[recipe.professionId];
        if (track.mastery + 1e-9 < recipe.masteryRequired)
            continue;
        if (track.knownRecipeIds.includes(recipe.id))
            continue;
        track.knownRecipeIds.push(recipe.id);
        unlocked.push(recipe.id);
    }
    return unlocked;
}
function chooseOption(state, requirement, selections) {
    const selected = selections.get(requirement.id);
    if (selected) {
        const option = requirement.options.find(candidate => candidate.resourceId === selected);
        if (!option)
            throw new Error(`Recipe requirement ${requirement.id} does not accept ${selected}`);
        return (state.inventory[option.resourceId] ?? 0) >= option.quantity ? option : undefined;
    }
    return [...requirement.options]
        .sort((a, b) => (b.qualityModifier ?? 0) - (a.qualityModifier ?? 0))
        .find(option => (state.inventory[option.resourceId] ?? 0) >= option.quantity);
}
function qualityFromScore(score) {
    if (score >= 88)
        return 'perfect';
    if (score >= 70)
        return 'supreme';
    if (score >= 51)
        return 'high';
    if (score >= 31)
        return 'mid';
    return 'low';
}
function betterQuality(a, b) {
    if (!a)
        return b;
    return QUALITY_ORDER.indexOf(b) > QUALITY_ORDER.indexOf(a) ? b : a;
}
export class ProfessionEngine {
    craft(state, registry, recipe, quantity, seed, selections = [], modifiers = {}) {
        const count = Math.max(0, Math.floor(quantity));
        if (count <= 0)
            throw new Error('Craft quantity must be positive');
        const track = state.professions.tracks[recipe.professionId];
        if (!track.knownRecipeIds.includes(recipe.id))
            throw new Error(`Unknown recipe for current character: ${recipe.id}`);
        if (track.mastery + 1e-9 < recipe.masteryRequired)
            throw new Error(`Mastery too low for recipe: ${recipe.id}`);
        const selectionMap = new Map(selections.map(selection => [selection.requirementId, selection.resourceId]));
        const rng = new SeededRng(seed);
        const masteryBefore = track.mastery;
        const results = [];
        const consumed = {};
        for (let attempt = 0; attempt < count; attempt++) {
            const chosen = [];
            let missing;
            for (const requirement of recipe.ingredients) {
                const option = chooseOption(state, requirement, selectionMap);
                if (!option) {
                    missing = requirement;
                    break;
                }
                chosen.push(option);
            }
            if (missing) {
                results.push({ success: false, variantTags: [], reason: `Thiếu nguyên liệu: ${missing.name}` });
                break;
            }
            for (const option of chosen) {
                state.inventory[option.resourceId] = Math.max(0, (state.inventory[option.resourceId] ?? 0) - option.quantity);
                consumed[option.resourceId] = (consumed[option.resourceId] ?? 0) + option.quantity;
            }
            const inputModifier = chosen.reduce((sum, option) => sum + (option.qualityModifier ?? 0), 0);
            const realmOrder = state.realm.maxRealmOrder;
            const successChance = Math.max(0.08, Math.min(0.98, 0.58 + track.mastery * 0.0042 + realmOrder * 0.006 + inputModifier * 0.035 - recipe.difficulty * 0.045 + Math.max(0, modifiers.successChanceFlat ?? 0)));
            const success = rng.next() < successChance;
            track.attempts += 1;
            const variantTags = chosen.map(option => option.variantTag).filter((value) => Boolean(value));
            if (!success) {
                track.failures += 1;
                track.mastery = Math.min(100, track.mastery + (0.7 + recipe.difficulty * 0.22) * Math.max(0, modifiers.masteryGainMultiplier ?? 1));
                results.push({ success: false, variantTags, reason: 'Luyện chế thất bại; nguyên liệu đã tiêu hao.' });
                continue;
            }
            track.successes += 1;
            const qualityScore = track.mastery * 0.63 + realmOrder * 1.45 + inputModifier * 8 + rng.next() * 30 - recipe.difficulty * 5.5 + Math.max(0, modifiers.qualityScoreBonus ?? 0);
            const quality = qualityFromScore(qualityScore);
            track.highestQuality = betterQuality(track.highestQuality, quality);
            track.mastery = Math.min(100, track.mastery + (1.8 + recipe.difficulty * 0.48 + QUALITY_ORDER.indexOf(quality) * 0.25) * Math.max(0, modifiers.masteryGainMultiplier ?? 1));
            if (recipe.output.kind === 'stack') {
                const outputQuantity = Math.max(1, Math.round(recipe.output.quantity * (0.92 + QUALITY_MULTIPLIER[quality] * 0.18)));
                stockEntry(state.professions, recipe.output.productId, quality).quantity += outputQuantity;
                results.push({ success: true, quality, variantTags, outputProductId: recipe.output.productId, outputQuantity });
            }
            else {
                const template = registry.equipmentTemplate(recipe.output.templateId);
                const tierBoost = track.mastery >= 80 ? 2 : track.mastery >= 45 ? 1 : 0;
                const tier = Math.min(5, Math.max(0, recipe.output.baseTier + tierBoost + Math.floor(realmOrder / 12)));
                const pseudoFloor = Math.max(1, 1 + Math.floor(track.mastery / 20));
                const equipment = buildEquipmentInstance(template, tier, quality, pseudoFloor, { kind: 'craft', recipeId: recipe.id, floor: pseudoFloor, seed: rng.nextUint32() }, state.worldTimeYears + (attempt + 1) * recipe.timeYears);
                addEquipment(state.equipment, equipment);
                results.push({ success: true, quality, variantTags, equipment });
            }
        }
        const unlockedRecipeIds = unlockEligibleProfessionRecipes(state.professions, registry);
        const successes = results.filter(result => result.success).length;
        const failures = results.filter(result => !result.success).length;
        return {
            recipeId: recipe.id,
            professionId: recipe.professionId,
            attempts: results.length,
            successes,
            failures,
            masteryBefore,
            masteryAfter: track.mastery,
            masteryGain: Math.max(0, track.mastery - masteryBefore),
            elapsedYears: results.length * recipe.timeYears,
            results,
            consumed,
            unlockedRecipeIds,
        };
    }
}
export function useCraftedProduct(state, product, quality) {
    const entry = state.professions.stock.find(candidate => candidate.productId === product.id && candidate.quality === quality);
    if (!entry || entry.quantity <= 0)
        throw new Error(`No crafted product in stock: ${product.id} (${quality})`);
    entry.quantity -= 1;
    const multiplier = QUALITY_MULTIPLIER[quality];
    switch (product.useEffect.type) {
        case 'tuVi': {
            const amount = Math.max(0, product.useEffect.baseAmount * multiplier);
            const report = addTuViV140(state, amount, state.realm.maxRealmOrder);
            return { summary: `${product.name} bổ sung ${report.gained.toFixed(1)} Tu Vi.`, value: report.gained };
        }
        case 'injuryRecovery': {
            const amount = Math.max(0, product.useEffect.baseAmount * multiplier);
            const recovered = Math.min(Math.max(0, state.injury), amount);
            state.injury = Math.max(0, state.injury - recovered);
            return { summary: `${product.name} giảm ${recovered.toFixed(1)} Thương Thế.`, value: recovered };
        }
        default:
            throw new Error(`Unsupported crafted product effect: ${product.useEffect.type}`);
    }
}
//# sourceMappingURL=profession.js.map