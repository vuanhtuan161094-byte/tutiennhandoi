import { cloneEconomyV111State } from './economy-v111.js';
import { cloneAlchemyV112State } from './alchemy-v112.js';
import { cloneRewardLoopV135State } from './economy-reward-loop-v135.js';
export const factionServiceDefinitions = {
    'alchemy.spirit_pill': {
        id: 'alchemy.spirit_pill', name: 'Đan Điện · Đổi Tụ Linh Đan', facility: 'alchemyHall', minFacilityLevel: 1,
        meritCost: 12, personalSpiritStoneCost: 2,
        treasuryCosts: { 'resource.spirit_herb': 3 },
        description: 'Dùng công đức đổi một viên Tụ Linh Đan do Đan Điện luyện chế.',
        output: { kind: 'craftedProduct', productId: 'product.pill.spirit_gathering', quality: 'mid', quantity: 1 },
    },
    'alchemy.injury_care': {
        id: 'alchemy.injury_care', name: 'Đan Điện · Trị Thương', facility: 'alchemyHall', minFacilityLevel: 1,
        meritCost: 18, personalSpiritStoneCost: 4,
        treasuryCosts: { 'resource.spirit_herb': 5 },
        description: 'Đan sư tông môn trị thương và giúp thân thể ổn định.',
        output: { kind: 'injuryCare', injuryReduction: 12 },
    },
    'forge.qingfeng_sword': {
        id: 'forge.qingfeng_sword', name: 'Luyện Khí Điện · Ủy Thác Thanh Phong Kiếm', facility: 'forgeHall', minFacilityLevel: 2,
        meritCost: 36, personalSpiritStoneCost: 18,
        treasuryCosts: { 'resource.black_iron_ore': 8 },
        description: 'Ủy thác Luyện Khí Điện rèn một Thanh Phong Kiếm tiêu chuẩn của tông môn.',
        output: { kind: 'equipment', templateId: 'equipment.qingfeng_sword', quality: 'high', tier: 1 },
    },
};
export function createEconomyState(definitions = {}, currentWorldYear = 0) {
    const markets = {};
    for (const definition of Object.values(definitions)) {
        markets[definition.id] = {
            id: definition.id,
            name: definition.name,
            locationId: definition.locationId,
            listings: Object.fromEntries(definition.listings.map(listing => [listing.resourceId, {
                    resourceId: listing.resourceId,
                    stock: Math.max(0, listing.initialStock),
                    boughtByPlayer: 0,
                    soldByPlayer: 0,
                }])),
        };
    }
    return {
        simulatedUntilWorldYear: currentWorldYear,
        markets,
        lifetime: { spiritStonesSpent: 0, spiritStonesEarned: 0, unitsBought: 0, unitsSold: 0, meritSpent: 0, servicesUsed: 0 },
        transactionSerial: 0,
    };
}
export function cloneEconomyState(state) {
    return {
        simulatedUntilWorldYear: state.simulatedUntilWorldYear,
        markets: Object.fromEntries(Object.entries(state.markets).map(([id, market]) => [id, {
                ...market,
                listings: Object.fromEntries(Object.entries(market.listings).map(([resourceId, listing]) => [resourceId, { ...listing }])),
            }])),
        lifetime: { ...state.lifetime },
        transactionSerial: state.transactionSerial,
        v111: cloneEconomyV111State(state.v111),
        v112Alchemy: cloneAlchemyV112State(state.v112Alchemy),
        v135RewardLoop: cloneRewardLoopV135State(state.v135RewardLoop),
    };
}
function listingDefinition(definitions, marketId, resourceId) {
    const market = definitions[marketId];
    if (!market)
        throw new Error(`Unknown market: ${marketId}`);
    const listing = market.listings.find(candidate => candidate.resourceId === resourceId);
    if (!listing)
        throw new Error(`${resourceId} is not traded at ${market.name}`);
    return listing;
}
function scarcityMultiplier(stock, targetStock) {
    const target = Math.max(1, targetStock);
    const ratio = stock / target;
    return Math.max(0.58, Math.min(2.6, 1 + (1 - ratio) * 0.78));
}
function buyUnitPrice(definition, stock) {
    return Math.max(1, Math.round(definition.basePrice * (definition.localPriceMultiplier ?? 1) * scarcityMultiplier(stock, definition.targetStock)));
}
function sellUnitPrice(definition, stock) {
    const buy = buyUnitPrice(definition, stock);
    return Math.max(1, Math.floor(buy * (definition.sellRatio ?? 0.62)));
}
export function marketsAtLocation(state, locationId) {
    return Object.values(state.markets).filter(market => market.locationId === locationId);
}
export function marketQuotes(state, definitions, marketId) {
    const market = state.markets[marketId];
    const definition = definitions[marketId];
    if (!market || !definition)
        throw new Error(`Unknown market: ${marketId}`);
    return definition.listings.map(listing => {
        const runtime = market.listings[listing.resourceId];
        return {
            marketId, marketName: market.name, resourceId: listing.resourceId, resourceName: listing.name, stock: runtime.stock,
            buyUnitPrice: listing.buyEnabled === false ? undefined : buyUnitPrice(listing, runtime.stock),
            sellUnitPrice: listing.sellEnabled === false ? undefined : sellUnitPrice(listing, runtime.stock),
        };
    });
}
export function buyFromMarket(state, definitions, marketId, resourceId, quantity) {
    const units = Math.max(0, Math.floor(quantity));
    if (units <= 0)
        throw new Error('Buy quantity must be positive');
    const definition = listingDefinition(definitions, marketId, resourceId);
    if (definition.buyEnabled === false)
        throw new Error(`${resourceId} cannot be bought at ${marketId}`);
    const market = state.markets[marketId];
    const runtime = market.listings[resourceId];
    if (runtime.stock + 1e-9 < units)
        throw new Error(`Market stock too low: ${runtime.stock}/${units}`);
    let total = 0;
    for (let i = 0; i < units; i++)
        total += buyUnitPrice(definition, runtime.stock - i);
    runtime.stock -= units;
    runtime.boughtByPlayer += units;
    state.lifetime.spiritStonesSpent += total;
    state.lifetime.unitsBought += units;
    state.transactionSerial += 1;
    return { marketId, resourceId, quantity: units, totalSpiritStones: total, averageUnitPrice: total / units, stockAfter: runtime.stock };
}
export function sellToMarket(state, definitions, marketId, resourceId, quantity) {
    const units = Math.max(0, Math.floor(quantity));
    if (units <= 0)
        throw new Error('Sell quantity must be positive');
    const definition = listingDefinition(definitions, marketId, resourceId);
    if (definition.sellEnabled === false)
        throw new Error(`${resourceId} cannot be sold at ${marketId}`);
    const runtime = state.markets[marketId].listings[resourceId];
    let total = 0;
    for (let i = 0; i < units; i++)
        total += sellUnitPrice(definition, runtime.stock + i);
    runtime.stock += units;
    runtime.soldByPlayer += units;
    state.lifetime.spiritStonesEarned += total;
    state.lifetime.unitsSold += units;
    state.transactionSerial += 1;
    return { marketId, resourceId, quantity: units, totalSpiritStones: total, averageUnitPrice: total / units, stockAfter: runtime.stock };
}
export function syncEconomyState(state, definitions, targetWorldYear) {
    const target = Math.max(targetWorldYear, state.simulatedUntilWorldYear);
    const elapsed = target - state.simulatedUntilWorldYear;
    if (elapsed <= 1e-9)
        return 0;
    for (const [marketId, market] of Object.entries(state.markets)) {
        const definition = definitions[marketId];
        if (!definition)
            continue;
        for (const listingDefinition of definition.listings) {
            const runtime = market.listings[listingDefinition.resourceId];
            if (!runtime)
                continue;
            const halfLife = Math.max(0.25, listingDefinition.normalizationYears ?? 4);
            const relaxation = 1 - Math.exp(-elapsed / halfLife);
            runtime.stock += (listingDefinition.targetStock - runtime.stock) * relaxation;
            runtime.stock = Math.max(0, Math.min(listingDefinition.targetStock * 2.2, runtime.stock));
        }
    }
    state.simulatedUntilWorldYear = target;
    return elapsed;
}
//# sourceMappingURL=economy.js.map