import { parseAlchemyPillResourceId } from './alchemy-v112.js';
import { alchemyPillResourceIdV146, alchemyRecipeAvailableV146, parseAlchemyPillResourceIdV146 } from './alchemy-v146.js';

const LEGACY_TIER_TO_MAJOR_V167 = Object.freeze([1, 4, 8, 11, 15, 18, 22, 25]);
const LEGACY_FAMILY_TO_V146_V167 = Object.freeze({
    cultivation: 'cultivation',
    injury: 'injury',
    lifespan: 'lifespan',
    daoSuy: 'daoSuy',
    lifePower: 'lifePower',
    lifeBody: 'lifeBody',
    lifeDefense: 'lifeDefense',
    buffPower: 'buffPower',
    buffGuard: 'buffGuard',
    buffSpirit: 'buffSpirit',
    forbidden: 'forbidden',
    daoPower: 'lifePower',
    daoBody: 'lifeBody',
    daoDefense: 'lifeDefense',
});

function safeInventoryCount(value) {
    if (typeof value === 'bigint') return Number(value > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : value);
    return Math.max(0, Math.floor(Number(value) || 0));
}

// V167: current saves must not carry a second, realm-gated V112 pill authority.
// Preserve every valid legacy pill by converting it immediately to its V146 ID, including
// pills above the character's current realm. The V146 consumer remains responsible for
// realm eligibility, quotas and effects when the pill is eventually used.
export function normalizeCanonicalAlchemyInventoryAfterRestore(state) {
    const inventory = state?.inventory;
    if (!inventory || typeof inventory !== 'object') return inventory;
    for (const [resourceId, raw] of Object.entries({ ...inventory })) {
        if (parseAlchemyPillResourceIdV146(resourceId)) continue;
        const legacy = parseAlchemyPillResourceId(resourceId);
        if (!legacy) continue;
        const family = LEGACY_FAMILY_TO_V146_V167[legacy.family];
        if (!family) continue;
        let majorRealmIndex = LEGACY_TIER_TO_MAJOR_V167[Math.max(1, Math.min(8, Math.floor(Number(legacy.realmTier) || 1))) - 1];
        if (family === 'daoSuy') majorRealmIndex = Math.max(11, majorRealmIndex);
        if (!alchemyRecipeAvailableV146(family, majorRealmIndex)) continue;
        const count = safeInventoryCount(raw);
        delete inventory[resourceId];
        if (count <= 0) continue;
        const canonicalId = alchemyPillResourceIdV146(family, majorRealmIndex, legacy.quality);
        inventory[canonicalId] = safeInventoryCount(inventory[canonicalId]) + count;
    }
    return inventory;
}
