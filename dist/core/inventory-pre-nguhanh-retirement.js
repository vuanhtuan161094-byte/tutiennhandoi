import { equipmentGradeIndex } from './equipment.js';
import { OFFLINE_HUNT_LOOT_CACHE_CAPACITY } from './offline.js';
import { economyMaterialDefinition, equipmentSalvageV111, ensureEconomyV111State } from './economy-v111.js';
import { DAO_INSCRIPTION_FRAGMENT_RESOURCE_NAME_V115, DAO_INSCRIPTION_FRAGMENT_RESOURCE_V115, daoInscriptionFragmentYieldV115 } from './equipment-reforge-v115.js';
import { EQUIPMENT_GEM_BLANK_RESOURCE_NAME_V128, EQUIPMENT_GEM_BLANK_RESOURCE_V128, equipmentDaoFragmentBaseYieldV128, equipmentGemBlankSalvageYieldV128 } from './equipment-inscription-gem-v128.js';
import { recordEquipmentDispositionV135 } from './economy-reward-loop-v135.js';
const qualityRank = {
    low: 0,
    mid: 1,
    high: 2,
    supreme: 3,
    perfect: 4,
};
const qualityValue = {
    low: 0.85,
    mid: 1,
    high: 1.25,
    supreme: 1.6,
    perfect: 2.1,
};
export function createDefaultLootPolicy() {
    return {
        enabled: true,
        equipment: {
            protectEquipped: true,
            protectSetPieces: true,
            minKeepTier: 1,
            minKeepQuality: 'high',
            keepTags: [],
            defaultAction: 'keep',
        },
        artifacts: {
            protectActive: true,
            protectResonancePieces: true,
            protectInvested: true,
            protectHistoric: true,
            minKeepTier: 1,
            minKeepQuality: 'high',
            keepTags: [],
            // Pháp bảo unique mặc định giữ. Người chơi phải chủ động đổi policy mới tự bán/phân giải.
            defaultAction: 'keep',
        },
    };
}
export function createSalvageLootPolicy() {
    const policy = createDefaultLootPolicy();
    policy.equipment.defaultAction = 'disassemble';
    return policy;
}
export function createSellJunkLootPolicy() {
    const policy = createDefaultLootPolicy();
    policy.equipment.defaultAction = 'sell';
    return policy;
}
export function createOfflineLootCacheState(capacity = OFFLINE_HUNT_LOOT_CACHE_CAPACITY) {
    return { capacity: Math.max(1, Math.floor(capacity)), equipmentIds: [], artifactIds: [], overflowSalvaged: 0, protectedOverflow: 0 };
}
export function createInventoryManagementState() {
    return {
        lockedItemIds: [],
        policy: createDefaultLootPolicy(),
        lifetime: {
            kept: 0,
            sold: 0,
            disassembled: 0,
            spiritStonesEarned: 0,
            forgingEssenceRecovered: 0,
            artifactDustRecovered: 0,
        },
        offlineLootCache: createOfflineLootCacheState(),
    };
}
export function cloneInventoryManagementState(state) {
    return {
        lockedItemIds: [...state.lockedItemIds],
        policy: {
            enabled: state.policy.enabled,
            equipment: { ...state.policy.equipment, keepTags: [...state.policy.equipment.keepTags] },
            artifacts: { ...state.policy.artifacts, keepTags: [...state.policy.artifacts.keepTags] },
        },
        lifetime: { ...state.lifetime },
        offlineLootCache: state.offlineLootCache ? { ...state.offlineLootCache, equipmentIds: [...state.offlineLootCache.equipmentIds], artifactIds: [...state.offlineLootCache.artifactIds] } : createOfflineLootCacheState(),
    };
}
export function lockLootItem(state, itemId) {
    if (!state.lockedItemIds.includes(itemId))
        state.lockedItemIds.push(itemId);
}
export function unlockLootItem(state, itemId) {
    state.lockedItemIds = state.lockedItemIds.filter(id => id !== itemId);
}
function hasAnyTag(itemTags, wanted) {
    return wanted.find(tag => itemTags.includes(tag));
}
function keepByQuality(tier, quality, minTier, minQuality) {
    if (tier > minTier)
        return true;
    if (tier < minTier)
        return false;
    return qualityRank[quality] >= qualityRank[minQuality];
}
export function equipmentSaleValueV135(item) {
    // V1.35: selling is the quick-cash branch. It pays more immediate Spirit Stones than
    // disassembly, but gives no Equipment Essence / Dao fragments. Kept deliberately well below
    // nominal item value to preserve the buy->sell anti-arbitrage invariant.
    const salvage = equipmentSalvageV111(item);
    return Math.max(1, Math.round(salvage.nominalValue * 0.18));
}
function equipmentDisassemblyValue(item) {
    return equipmentSalvageV111(item).essence;
}
function artifactSaleValue(item) {
    return Math.max(2, Math.round(22 * (item.tier + 1) ** 2 * qualityValue[item.quality] * (1 + item.nourishmentStage * 0.15)));
}
function artifactDisassemblyValue(item) {
    return Math.max(1, Math.round((item.tier + 1) * 5 * qualityValue[item.quality] + item.nourishmentStage * 2));
}
export function explainEquipmentLoot(state, item) {
    const policy = state.lootManagement.policy.equipment;
    const reasons = [];
    const locked = state.lootManagement.lockedItemIds.includes(item.id);
    const equipped = Object.values(state.equipment.equipped).includes(item.id);
    const keptTag = hasAnyTag(item.tags, policy.keepTags);
    if (locked)
        reasons.push('Đã khóa thủ công; AI không được xử lý.');
    if (policy.protectEquipped && equipped)
        reasons.push('Đang được trang bị.');
    if (policy.protectSetPieces && item.setId)
        reasons.push(`Thuộc bộ ${item.setId}; policy bảo vệ mảnh bộ.`);
    if (keptTag)
        reasons.push(`Khớp tag ưu tiên giữ: ${keptTag}.`);
    if (keepByQuality(item.tier, item.quality, policy.minKeepTier, policy.minKeepQuality)) {
        reasons.push(`Đạt ngưỡng giữ: tier ${item.tier}, phẩm chất ${item.quality}.`);
    }
    if (reasons.length > 0) {
        return { kind: 'equipment', itemId: item.id, itemName: item.name, action: 'keep', reasons, outputs: {}, protected: true };
    }
    if (policy.defaultAction === 'sell') {
        const stones = equipmentSaleValueV135(item);
        return { kind: 'equipment', itemId: item.id, itemName: item.name, action: 'sell', reasons: ['Không khớp quy tắc giữ; Bán cho Linh Thạch tức thời. Nhánh này không hoàn Tinh Hoa/Đạo Văn.'], outputs: { 'resource.spirit_stone': stones }, protected: false };
    }
    if (policy.defaultAction === 'disassemble') {
        const salvage = equipmentSalvageV111(item);
        return {
            kind: 'equipment', itemId: item.id, itemName: item.name, action: 'disassemble',
            reasons: ['Không khớp quy tắc giữ; Phân Giải hoàn Tinh Hoa + Linh Thạch + Tàn Văn; Huyền phẩm trở lên còn cho Ngũ Hành Ngọc Phôi theo số ô Ngọc của phẩm.'],
            outputs: { [salvage.essenceResourceId]: salvage.essence, 'resource.spirit_stone': salvage.spiritStones, [DAO_INSCRIPTION_FRAGMENT_RESOURCE_V115]: equipmentDaoFragmentBaseYieldV128(item) + daoInscriptionFragmentYieldV115(item), ...(equipmentGemBlankSalvageYieldV128(item) > 0 ? { [EQUIPMENT_GEM_BLANK_RESOURCE_V128]: equipmentGemBlankSalvageYieldV128(item) } : {}) }, protected: false,
        };
    }
    return {
        kind: 'equipment', itemId: item.id, itemName: item.name, action: 'keep',
        reasons: ['Policy mặc định giữ trang bị.'], outputs: {}, protected: false,
    };
}
export function explainArtifactLoot(state, item) {
    const policy = state.lootManagement.policy.artifacts;
    const reasons = [];
    const locked = state.lootManagement.lockedItemIds.includes(item.id);
    const active = state.artifacts.activeIds.includes(item.id);
    const keptTag = hasAnyTag(item.tags, policy.keepTags);
    if (locked)
        reasons.push('Đã khóa thủ công; AI không được xử lý.');
    if (policy.protectActive && active)
        reasons.push('Đang trực chiến.');
    if (policy.protectResonancePieces && item.resonanceId)
        reasons.push(`Có cộng hưởng pháp bảo ${item.resonanceId}.`);
    if (policy.protectInvested && (item.nourishmentStage > 0 || item.spirit.state !== 'dormant')) {
        reasons.push('Đã được dưỡng bảo hoặc Khí Linh đã có biến hóa.');
    }
    if (policy.protectHistoric && (item.history.battles > 0 || item.history.ownerLifeIds.length > 1 || item.history.tribulations > 0)) {
        reasons.push('Có lịch sử chiến đấu/chủ nhân/Thiên Kiếp; được xem là bảo vật lịch sử.');
    }
    if (keptTag)
        reasons.push(`Khớp tag ưu tiên giữ: ${keptTag}.`);
    if (keepByQuality(item.tier, item.quality, policy.minKeepTier, policy.minKeepQuality)) {
        reasons.push(`Đạt ngưỡng giữ pháp bảo: tier ${item.tier}, phẩm chất ${item.quality}.`);
    }
    if (reasons.length > 0) {
        return { kind: 'artifact', itemId: item.id, itemName: item.name, action: 'keep', reasons, outputs: {}, protected: true };
    }
    if (policy.defaultAction === 'sell') {
        const value = artifactSaleValue(item);
        return {
            kind: 'artifact', itemId: item.id, itemName: item.name, action: 'sell',
            reasons: ['Không khớp quy tắc bảo vệ; áp dụng defaultAction=sell cho pháp bảo.'],
            outputs: { 'resource.spirit_stone': value }, protected: false,
        };
    }
    if (policy.defaultAction === 'disassemble') {
        const value = artifactDisassemblyValue(item);
        return {
            kind: 'artifact', itemId: item.id, itemName: item.name, action: 'disassemble',
            reasons: ['Không khớp quy tắc bảo vệ; áp dụng defaultAction=disassemble cho pháp bảo.'],
            outputs: { 'resource.artifact_dust': value }, protected: false,
        };
    }
    return {
        kind: 'artifact', itemId: item.id, itemName: item.name, action: 'keep',
        reasons: ['Pháp bảo unique mặc định được giữ lại.'], outputs: {}, protected: false,
    };
}
export function explainLootItem(state, itemId) {
    const equipment = state.equipment.items.find(item => item.id === itemId);
    if (equipment)
        return explainEquipmentLoot(state, equipment);
    const artifact = state.artifacts.items.find(item => item.id === itemId);
    if (artifact)
        return explainArtifactLoot(state, artifact);
    throw new Error(`Unknown loot item: ${itemId}`);
}
function resourceDisplayName(resourceId) {
    if (resourceId === 'resource.spirit_stone')
        return 'Hạ Phẩm Linh Thạch';
    if (resourceId === 'resource.forging_essence')
        return 'Khí Luyện Tinh Hoa';
    if (resourceId === 'resource.artifact_dust')
        return 'Bảo Khí Tàn Tinh';
    if (resourceId === DAO_INSCRIPTION_FRAGMENT_RESOURCE_V115)
        return DAO_INSCRIPTION_FRAGMENT_RESOURCE_NAME_V115;
    const economy = economyMaterialDefinition(resourceId);
    if (economy)
        return economy.name;
    return resourceId;
}
function addOutput(target, key, amount) {
    if (amount <= 0)
        return;
    target[key] = (target[key] ?? 0) + amount;
}
export function processLootBatch(state, candidateEquipmentIds, candidateArtifactIds) {
    const traces = [];
    const outputs = {};
    if (!state.lootManagement.policy.enabled) {
        return { processed: 0, kept: 0, sold: 0, disassembled: 0, outputs, traces, summaryLines: ['Tự xử lý loot đang tắt.'] };
    }
    const equipmentCandidates = state.equipment.items.filter(item => !candidateEquipmentIds || candidateEquipmentIds.has(item.id));
    const artifactCandidates = state.artifacts.items.filter(item => !candidateArtifactIds || candidateArtifactIds.has(item.id));
    for (const item of equipmentCandidates)
        traces.push(explainEquipmentLoot(state, item));
    for (const item of artifactCandidates)
        traces.push(explainArtifactLoot(state, item));
    const removedEquipment = new Set(traces.filter(trace => trace.kind === 'equipment' && trace.action !== 'keep').map(trace => trace.itemId));
    const removedArtifacts = new Set(traces.filter(trace => trace.kind === 'artifact' && trace.action !== 'keep').map(trace => trace.itemId));
    state.equipment.items = state.equipment.items.filter(item => !removedEquipment.has(item.id));
    for (const [slot, itemId] of Object.entries(state.equipment.equipped)) {
        if (itemId && removedEquipment.has(itemId))
            delete state.equipment.equipped[slot];
    }
    state.artifacts.items = state.artifacts.items.filter(item => !removedArtifacts.has(item.id));
    state.artifacts.activeIds = state.artifacts.activeIds.filter(id => !removedArtifacts.has(id));
    state.lootManagement.lockedItemIds = state.lootManagement.lockedItemIds.filter(id => !removedEquipment.has(id) && !removedArtifacts.has(id));
    let kept = 0;
    let sold = 0;
    let disassembled = 0;
    for (const trace of traces) {
        if (trace.action === 'keep')
            kept += 1;
        if (trace.action === 'sell')
            sold += 1;
        if (trace.action === 'disassemble')
            disassembled += 1;
        for (const [key, amount] of Object.entries(trace.outputs)) {
            addOutput(outputs, key, amount);
            state.inventory[key] = (state.inventory[key] ?? 0) + amount;
        }
    }
    state.lootManagement.lifetime.kept += kept;
    state.lootManagement.lifetime.sold += sold;
    state.lootManagement.lifetime.disassembled += disassembled;
    state.lootManagement.lifetime.spiritStonesEarned += outputs['resource.spirit_stone'] ?? 0;
    state.lootManagement.lifetime.forgingEssenceRecovered += outputs['resource.forging_essence'] ?? 0;
    state.lootManagement.lifetime.artifactDustRecovered += outputs['resource.artifact_dust'] ?? 0;
    const equipmentDisassemblyTraces = traces.filter(trace => trace.kind === 'equipment' && trace.action === 'disassemble');
    const equipmentSaleTraces = traces.filter(trace => trace.kind === 'equipment' && trace.action === 'sell');
    if (equipmentDisassemblyTraces.length > 0) {
        const telemetry = ensureEconomyV111State(state.economy).telemetry;
        telemetry.equipmentSalvaged += equipmentDisassemblyTraces.length;
        telemetry.spiritStonesFromSalvage += equipmentDisassemblyTraces.reduce((sum, trace) => sum + (trace.outputs['resource.spirit_stone'] ?? 0), 0);
        telemetry.equipmentEssenceRecovered += equipmentDisassemblyTraces.reduce((sum, trace) => sum + Object.entries(trace.outputs).reduce((inner, [id, amount]) => inner + (economyMaterialDefinition(id)?.family === 'equipmentEssence' ? amount : 0), 0), 0);
    }
    recordEquipmentDispositionV135(state.economy, { sold: equipmentSaleTraces.length, disassembled: equipmentDisassemblyTraces.length, spiritStonesFromSales: equipmentSaleTraces.reduce((sum, trace) => sum + (trace.outputs['resource.spirit_stone'] ?? 0), 0) });
    const outputText = Object.entries(outputs).map(([id, amount]) => `${resourceDisplayName(id)} ×${amount}`).join(', ');
    return {
        processed: traces.length,
        kept,
        sold,
        disassembled,
        outputs,
        traces,
        summaryLines: traces.length === 0
            ? ['Không có loot mới cần tự xử lý.']
            : [
                `Tự xử lý ${traces.length} món: giữ ${kept}, bán ${sold}, phân giải ${disassembled}.`,
                ...(outputText ? [`Thu hồi: ${outputText}.`] : []),
            ],
    };
}
const gradeRank = {
    mundane: 0, spirit: 1, mystic: 2, earth: 3, heaven: 4, immortal: 5, extreme: 6, breaker: 7,
};
function hardProtectedOfflineEquipment(state, item) {
    if (state.lootManagement.lockedItemIds.includes(item.id))
        return true;
    if (state.lootManagement.policy.equipment.protectEquipped && Object.values(state.equipment.equipped).includes(item.id))
        return true;
    if (hasAnyTag(item.tags, state.lootManagement.policy.equipment.keepTags))
        return true;
    return item.tags.some(tag => ['Unique', 'Signature', 'Quest', 'Milestone', 'Protected'].includes(tag));
}
function offlineEquipmentKeepScore(item) {
    const grade = item.grade ?? 'mundane';
    // Grade dominates; craftsmanship/tier/item level settle ties. Higher score survives cache pressure.
    return (gradeRank[grade] ?? equipmentGradeIndex(grade)) * 1_000_000 + item.tier * 10_000 + qualityRank[item.quality] * 1_000 + (item.setId ? 250 : 0) + Math.max(0, item.itemLevel);
}
export function offlineLootCacheState(state) {
    const cache = state.lootManagement.offlineLootCache ?? (state.lootManagement.offlineLootCache = createOfflineLootCacheState());
    cache.capacity = Math.max(1, Math.floor(cache.capacity || OFFLINE_HUNT_LOOT_CACHE_CAPACITY));
    const equipmentSet = new Set(state.equipment.items.map(item => item.id));
    const artifactSet = new Set(state.artifacts.items.map(item => item.id));
    cache.equipmentIds = [...new Set(cache.equipmentIds)].filter(id => equipmentSet.has(id));
    cache.artifactIds = [...new Set(cache.artifactIds)].filter(id => artifactSet.has(id));
    return cache;
}
/**
 * Register newly kept offline loot. When the 200-slot cache is full, the lowest-priority
 * non-protected equipment is disassembled first. Locked/equipped/unique/special items are never
 * silently destroyed; they may temporarily exceed the nominal cache capacity.
 */
export function registerOfflineLoot(state, keptEquipmentIds, keptArtifactIds) {
    const cache = offlineLootCacheState(state);
    const beforeCount = cache.equipmentIds.length + cache.artifactIds.length;
    for (const id of keptEquipmentIds)
        if (!cache.equipmentIds.includes(id) && state.equipment.items.some(item => item.id === id))
            cache.equipmentIds.push(id);
    for (const id of keptArtifactIds)
        if (!cache.artifactIds.includes(id) && state.artifacts.items.some(item => item.id === id))
            cache.artifactIds.push(id);
    let salvaged = 0, forgingEssence = 0, spiritStones = 0, daoFragments = 0, gemBlanks = 0;
    while (cache.equipmentIds.length + cache.artifactIds.length > cache.capacity) {
        const candidates = cache.equipmentIds
            .map(id => state.equipment.items.find(item => item.id === id))
            .filter((item) => Boolean(item) && !hardProtectedOfflineEquipment(state, item))
            .sort((a, b) => offlineEquipmentKeepScore(a) - offlineEquipmentKeepScore(b));
        const victim = candidates[0];
        if (!victim)
            break;
        // v1.11: cache overflow follows the exact same salvage law as ordinary equipment cleanup.
        // No hidden legacy resource is minted just because the player is offline.
        const salvage = equipmentSalvageV111(victim);
        const inscriptionFragments = equipmentDaoFragmentBaseYieldV128(victim) + daoInscriptionFragmentYieldV115(victim);
        const blankYield = equipmentGemBlankSalvageYieldV128(victim);
        forgingEssence += salvage.essence;
        spiritStones += salvage.spiritStones;
        daoFragments += inscriptionFragments;
        gemBlanks += blankYield;
        salvaged += 1;
        state.inventory[salvage.essenceResourceId] = (state.inventory[salvage.essenceResourceId] ?? 0) + salvage.essence;
        state.inventory['resource.spirit_stone'] = (state.inventory['resource.spirit_stone'] ?? 0) + salvage.spiritStones;
        if (inscriptionFragments > 0)
            state.inventory[DAO_INSCRIPTION_FRAGMENT_RESOURCE_V115] = (state.inventory[DAO_INSCRIPTION_FRAGMENT_RESOURCE_V115] ?? 0) + inscriptionFragments;
        if (blankYield > 0)
            state.inventory[EQUIPMENT_GEM_BLANK_RESOURCE_V128] = (state.inventory[EQUIPMENT_GEM_BLANK_RESOURCE_V128] ?? 0) + blankYield;
        state.equipment.items = state.equipment.items.filter(item => item.id !== victim.id);
        cache.equipmentIds = cache.equipmentIds.filter(id => id !== victim.id);
        state.lootManagement.lockedItemIds = state.lootManagement.lockedItemIds.filter(id => id !== victim.id);
    }
    cache.overflowSalvaged += salvaged;
    const count = cache.equipmentIds.length + cache.artifactIds.length;
    const protectedOverflow = Math.max(0, count - cache.capacity);
    cache.protectedOverflow = protectedOverflow;
    state.lootManagement.lifetime.disassembled += salvaged;
    state.lootManagement.lifetime.forgingEssenceRecovered += forgingEssence;
    state.lootManagement.lifetime.spiritStonesEarned += spiritStones;
    if (salvaged > 0) {
        const telemetry = ensureEconomyV111State(state.economy).telemetry;
        telemetry.equipmentSalvaged += salvaged;
        telemetry.equipmentEssenceRecovered += forgingEssence;
        telemetry.spiritStonesFromSalvage += spiritStones;
    }
    return { added: Math.max(0, count - beforeCount + salvaged), salvaged, protectedOverflow, count, capacity: cache.capacity, forgingEssence };
}
export function claimOfflineLootCache(state) {
    const cache = offlineLootCacheState(state);
    const equipmentIds = [...cache.equipmentIds], artifactIds = [...cache.artifactIds];
    cache.equipmentIds = [];
    cache.artifactIds = [];
    cache.protectedOverflow = 0;
    return { equipmentIds, artifactIds, count: equipmentIds.length + artifactIds.length };
}
//# sourceMappingURL=inventory.js.map