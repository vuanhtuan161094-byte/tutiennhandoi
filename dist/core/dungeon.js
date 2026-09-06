import { SeededRng } from './rng.js';
import { addEquipment, buildEquipmentInstance, equipmentQualityName, equipmentTierName } from './equipment.js';
import { addArtifact, artifactQualityName, artifactTierName, buildArtifactInstance } from './artifact.js';
import { ensureCollectionProgressStateV12316 } from './collection-progression-v12316.js';
import { grantResourcePveFarmRewardsV109, isResourcePveDungeonV12329, resourcePveVirtualBreakIdV12329, resourcePveVirtualMaterialIdV12329 } from './resource-pve-v12329.js';
export const dungeonGuardianMechanics = {
    predator: {
        id: 'predator', name: 'Liệp Sát Du Kích',
        description: 'Thủ vệ lấy tốc độ, né tránh và độ chính xác để cướp nhịp; phòng ngự trực diện thấp hơn.',
        counterHint: 'Ưu tiên Cơ động/Chính xác hoặc burst đủ mạnh để kết thúc trước khi bị kéo lệch nhịp.',
        statMultipliers: { mobility: 1.34, accuracy: 1.22, actionSpeed: 1.12, defense: 0.88 },
    },
    iron_wall: {
        id: 'iron_wall', name: 'Thiết Bì Trấn Thủ',
        description: 'Thủ vệ dồn lực vào phòng ngự và định lực, đổi lại nhịp ra tay chậm hơn.',
        counterHint: 'Ưu tiên Sát thương ổn định, Crit và kỹ năng chủ lực; đừng hy sinh quá nhiều damage cho phòng ngự dư thừa.',
        statMultipliers: { maxHp: 1.18, defense: 1.42, resolve: 1.28, actionSpeed: 0.91, mobility: 0.90 },
    },
    soul_pressure: {
        id: 'soul_pressure', name: 'Thần Niệm Trấn Áp',
        description: 'Thủ vệ dùng Linh lực và Khống Chế để khóa nhịp chiến đấu, ép build Thần Hồn yếu phải trả giá.',
        counterHint: 'Ưu tiên Spirit/Resolve/Control Power và kỹ năng giải khống chế; một build chỉ có DPS dễ bị bóp nhịp.',
        statMultipliers: { maxSpirit: 1.32, controlPower: 1.44, resolve: 1.18, attack: 0.94 },
    },
    blood_frenzy: {
        id: 'blood_frenzy', name: 'Huyết Chiến Cuồng Công',
        description: 'Thủ vệ bỏ bớt phòng ngự để tăng công kích và bạo kích, tạo áp lực sống sót rất lớn.',
        counterHint: 'Ưu tiên Sinh tồn, shield/heal và Resolve; sống qua đợt bộc phát đầu thường quan trọng hơn thêm chút DPS.',
        statMultipliers: { attack: 1.32, maxHp: 1.10, defense: 0.84 },
        flatStats: { critChancePct: 28 },
    },
};
export function createDungeonProgressState(unlockedDungeonIds = []) {
    return {
        unlockedDungeonIds: [...unlockedDungeonIds],
        highestClearedFloor: {},
        parallelWorkerCapacity: 0,
        workers: [],
        assignments: {},
    };
}
export function cloneDungeonProgressState(state) {
    return {
        unlockedDungeonIds: [...state.unlockedDungeonIds],
        highestClearedFloor: { ...(state.highestClearedFloor ?? {}) },
        parallelWorkerCapacity: state.parallelWorkerCapacity,
        workers: state.workers.map(worker => ({ ...worker })),
        assignments: Object.fromEntries(Object.entries(state.assignments).map(([id, assignment]) => [id, { ...assignment }])),
    };
}
function rarityFactor(rarity) {
    if (rarity === 'rare')
        return 0.35;
    if (rarity === 'uncommon')
        return 0.65;
    return 1;
}
function formatNumber(value) {
    if (Math.abs(value) >= 1000)
        return value.toFixed(0);
    if (Math.abs(value) >= 100)
        return value.toFixed(1);
    return value.toFixed(2).replace(/\.00$/, '');
}
function floorDefinition(dungeon, floor) {
    const value = dungeon.floors.find(candidate => candidate.floor === floor);
    if (!value)
        throw new Error(`Unknown floor ${floor} for dungeon ${dungeon.id}`);
    return value;
}
function weightedLootRule(rng, rules) {
    const total = rules.reduce((sum, rule) => sum + Math.max(0, rule.weight), 0);
    if (total <= 0)
        return undefined;
    let roll = rng.next() * total;
    for (const rule of rules) {
        roll -= Math.max(0, rule.weight);
        if (roll <= 0)
            return rule;
    }
    return rules[rules.length - 1];
}
function rollQuality(rng, qualityBias) {
    const roll = rng.next() + qualityBias;
    if (roll >= 1.30)
        return 'perfect';
    if (roll >= 1.05)
        return 'supreme';
    if (roll >= 0.74)
        return 'high';
    if (roll >= 0.36)
        return 'mid';
    return 'low';
}
function rollArtifactQuality(rng, qualityBias) {
    return rollQuality(rng, qualityBias);
}
const qualityOrder = ['low', 'mid', 'high', 'supreme', 'perfect'];
function qualityAtLeast(quality, minimum) {
    return qualityOrder.indexOf(quality) >= qualityOrder.indexOf(minimum) ? quality : minimum;
}
export function highestClearedDungeonFloor(state, dungeonId) {
    return Math.max(0, Math.floor(state.highestClearedFloor?.[dungeonId] ?? 0));
}
export function isDungeonFloorCleared(state, dungeonId, floor) {
    return highestClearedDungeonFloor(state, dungeonId) >= floor;
}
export function canChallengeDungeonFloor(state, dungeon, floor) {
    if (!state.unlockedDungeonIds.includes(dungeon.id))
        return { ok: false, reason: 'dungeonLocked' };
    const spec = dungeon.floors.find(candidate => candidate.floor === floor);
    if (!spec)
        return { ok: false, reason: 'unknownFloor' };
    if (!spec.guardianEntityId)
        return { ok: false, reason: 'noGuardian' };
    const highest = highestClearedDungeonFloor(state, dungeon.id);
    if (floor > highest + 1)
        return { ok: false, reason: 'previousFloorUncleared' };
    return { ok: true };
}
export function markDungeonFloorCleared(state, dungeonId, floor) {
    const before = highestClearedDungeonFloor(state, dungeonId);
    if (floor <= before)
        return false;
    state.highestClearedFloor[dungeonId] = floor;
    return true;
}
export function guardianMechanicForFloor(dungeon, floor) {
    const id = floorDefinition(dungeon, floor).guardianMechanicId;
    return id ? dungeonGuardianMechanics[id] : undefined;
}
function guardianMechanicPhasesV123(mechanic) {
    if (!mechanic)
        return [];
    const spec = {
        predator: { phaseName: 'Liệp Sát Đoạt Nhịp', description: 'Thủ vệ tăng tốc cướp nhịp; nếu truy dấu đúng sẽ lộ sơ hở.', roles: ['Chase', 'Accuracy', 'MultiHit'], required: 2 },
        iron_wall: { phaseName: 'Thiết Bích Phong Quan', description: 'Thủ vệ ép phòng tuyến tới cực hạn; chỉ đòn Phá/Bộc Phát đúng lúc mới làm Đạo Cơ dao động.', roles: ['Break', 'Burst', 'Finisher'], required: 2 },
        soul_pressure: { phaseName: 'Thần Niệm Trấn Tâm', description: 'Áp lực thần niệm dâng cao; giải khống hoặc cắt nhịp đúng lúc sẽ phá thế trấn áp.', roles: ['Cleanse', 'AntiControl', 'Interrupt'], required: 1 },
        blood_frenzy: { phaseName: 'Huyết Cuồng Đoạt Mệnh', description: 'Thủ vệ bước vào đợt bộc phát liều mạng; sống qua hoặc phản đúng nhịp sẽ tạo cửa sổ phản công.', roles: ['Barrier', 'Sustain', 'Counter'], required: 1 },
    };
    const x = spec[mechanic.id];
    return [{
            id: `phase.v123.guardian.${mechanic.id}`, name: x.phaseName, hpBelowPct: 62, description: x.description, counterHint: mechanic.counterHint, interruptCasting: true,
            counterWindow: { id: `counter.v123.guardian.${mechanic.id}`, name: `Phá ${x.phaseName}`, description: mechanic.counterHint, duration: 5, trigger: { type: 'skillRole', roles: x.roles, requiredActions: x.required }, successText: 'Đạo Cơ của thủ vệ dao động — cửa sổ phản công đã mở.', failureText: 'Thủ vệ giữ vững cơ chế — áp lực phản công dâng cao.', onSuccessEffects: [{ type: 'applyStatus', statusId: 'status.guardian_counter_exposed', duration: 4, target: 'target' }], onFailureEffects: mechanic.id === 'iron_wall' ? [{ type: 'shield', capacity: 0, stability: 100, duration: 5, maxHpPct: 8 }] : mechanic.id === 'soul_pressure' ? [{ type: 'applyStatus', statusId: 'status.stun', duration: 1.1, target: 'target' }] : mechanic.id === 'blood_frenzy' ? [{ type: 'damage', coefficient: 2.1, breakDamagePct: 12, canCrit: false }] : [{ type: 'damage', coefficient: 1.8, breakDamagePct: 10, canCrit: false }] },
        }];
}
export function buildDungeonGuardian(base, dungeon, floor) {
    const spec = floorDefinition(dungeon, floor);
    const m = Math.max(0.15, spec.guardianPowerMultiplier ?? 1);
    const hpM = 0.85 + m * 0.45;
    const statM = 0.72 + m * 0.28;
    const stats = {
        ...base.stats,
        maxHp: Math.round(base.stats.maxHp * hpM),
        maxSpirit: Math.round(base.stats.maxSpirit * (0.85 + m * 0.20)),
        attack: base.stats.attack * statM,
        defense: base.stats.defense * statM,
        mobility: base.stats.mobility * (0.88 + m * 0.12),
        accuracy: base.stats.accuracy * (0.88 + m * 0.12),
        controlPower: base.stats.controlPower * statM,
        resolve: base.stats.resolve * statM,
        actionSpeed: base.stats.actionSpeed * (0.92 + m * 0.08),
    };
    const mechanic = guardianMechanicForFloor(dungeon, floor);
    if (mechanic) {
        for (const [key, multiplier] of Object.entries(mechanic.statMultipliers)) {
            if (multiplier === undefined)
                continue;
            stats[key] = Math.max(0, (stats[key] ?? 0) * multiplier);
        }
        for (const [key, flat] of Object.entries(mechanic.flatStats ?? {})) {
            if (flat === undefined)
                continue;
            stats[key] = Math.max(0, (stats[key] ?? 0) + flat);
        }
    }
    return {
        ...base,
        id: `${base.id}.dungeon.${dungeon.id}.${floor}`,
        name: `${base.name} · ${dungeon.name} Tầng ${floor}`,
        tags: [...new Set([...base.tags, 'DungeonGuardian', `DungeonFloor${floor}`, ...(mechanic ? [`BossMechanic:${mechanic.id}`] : []), ...dungeon.tags])],
        stats,
        aiProfile: {
            name: `${base.aiProfile.name} [${dungeon.name} T${floor}]`,
            rules: base.aiProfile.rules.map(rule => ({ ...rule, conditions: rule.conditions.map(condition => ({ ...condition })) })),
        },
        phases: [...(base.phases ?? []).map(phase => ({ ...phase, counterWindow: phase.counterWindow ? { ...phase.counterWindow, onSuccessEffects: phase.counterWindow.onSuccessEffects?.map(effect => ({ ...effect })) } : undefined })), ...(dungeon.tags.includes('V122') ? guardianMechanicPhasesV123(mechanic) : [])],
    };
}
export function grantDungeonGuardianLoot(state, dungeon, floor, registry, seed, firstClear, ownerLifeId) {
    const table = dungeon.guardianLoot;
    const spec = floorDefinition(dungeon, floor);
    const rng = new SeededRng(seed);
    const rewards = {};
    const equipmentDrops = [];
    const artifactDrops = [];
    if (!table)
        return { rewards, equipmentDrops, artifactDrops };
    for (const reward of (table.resources ?? []).filter(rule => (rule.minFloor ?? 1) <= floor && (rule.maxFloor ?? Number.MAX_SAFE_INTEGER) >= floor)) {
        const guaranteed = firstClear && reward.firstClearGuaranteed;
        const chancePct = reward.chancePct ?? 100;
        if (!guaranteed && !rng.chance(chancePct))
            continue;
        const amount = Math.max(1, Math.round(reward.amount * spec.rewardMultiplier * (firstClear ? 2 : 1)));
        rewards[reward.resourceId] = (rewards[reward.resourceId] ?? 0) + amount;
        state.inventory[reward.resourceId] = (state.inventory[reward.resourceId] ?? 0) + amount;
    }
    const equipmentRules = (table.equipmentLoot ?? []).filter(rule => (rule.minFloor ?? 1) <= floor && (rule.maxFloor ?? Number.MAX_SAFE_INTEGER) >= floor);
    const guaranteedEquipment = firstClear ? equipmentRules.filter(rule => rule.firstClearGuaranteed) : [];
    const rolledEquipmentRules = guaranteedEquipment.length > 0
        ? guaranteedEquipment
        : (equipmentRules.length > 0 && rng.chance(firstClear ? 62 : (table.equipmentRepeatChancePct ?? 28)) ? [weightedLootRule(rng, equipmentRules)].filter((x) => Boolean(x)) : []);
    for (let guaranteedIndex = 0; guaranteedIndex < rolledEquipmentRules.length; guaranteedIndex++) {
        const rule = rolledEquipmentRules[guaranteedIndex];
        // First-clear gear should feel like a milestone, not a guaranteed low-quality junk roll.
        // A key early floor may deliberately guarantee several same-slot sidegrades so the player chooses a build.
        const rolledQuality = rollQuality(rng, spec.qualityBias + (firstClear ? 0.10 : 0));
        const quality = firstClear ? qualityAtLeast(rolledQuality, dungeon.tier <= 1 ? 'high' : 'mid') : rolledQuality;
        const itemSeed = (seed ^ 0x6ac690c5 ^ Math.imul(guaranteedIndex + 1, 0x9e3779b1) ^ rng.nextUint32()) >>> 0;
        const item = buildEquipmentInstance(registry.equipmentTemplate(rule.templateId), spec.equipmentTier, quality, floor, { kind: 'dungeon', dungeonId: dungeon.id, floor, seed: itemSeed }, state.worldTimeYears);
        addEquipment(state.equipment, item);
        equipmentDrops.push(item);
    }
    const artifactRules = (table.artifactLoot ?? []).filter(rule => (rule.minFloor ?? 1) <= floor && (rule.maxFloor ?? Number.MAX_SAFE_INTEGER) >= floor);
    const guaranteedArtifact = firstClear ? artifactRules.find(rule => rule.firstClearGuaranteed) : undefined;
    if (artifactRules.length > 0 && (guaranteedArtifact || rng.chance(firstClear ? 38 : 14))) {
        const rule = guaranteedArtifact ?? weightedLootRule(rng, artifactRules);
        if (rule) {
            const rolledQuality = rollArtifactQuality(rng, spec.qualityBias + (firstClear ? 0.06 : 0));
            const quality = firstClear ? qualityAtLeast(rolledQuality, dungeon.tier <= 1 ? 'high' : 'mid') : rolledQuality;
            const itemSeed = (seed ^ 0x85ebca6b ^ rng.nextUint32()) >>> 0;
            const item = buildArtifactInstance(registry.artifactTemplate(rule.templateId), spec.artifactTier ?? Math.max(0, spec.equipmentTier - 1), quality, floor, { kind: 'dungeon', dungeonId: dungeon.id, floor, seed: itemSeed }, state.worldTimeYears, ownerLifeId);
            addArtifact(state.artifacts, item);
            artifactDrops.push(item);
        }
    }
    return { rewards, equipmentDrops, artifactDrops };
}
export class DungeonEngine {
    run(state, dungeon, years, seed, efficiency = 1, floor = 1, registry) {
        const safeYears = Math.max(0, years);
        const safeEfficiency = Math.max(0, efficiency);
        const rng = new SeededRng(seed);
        const floorSpec = floorDefinition(dungeon, floor);
        if (state.realm.maxRealmOrder < floorSpec.requiredRealmOrder) {
            throw new Error(`Realm order ${state.realm.maxRealmOrder} is too low for ${dungeon.name} floor ${floor}; requires ${floorSpec.requiredRealmOrder}`);
        }
        const rewards = {};
        const equipmentDrops = [];
        const artifactDrops = [];
        for (const reward of dungeon.rewards.filter(rule => (rule.minFloor ?? 1) <= floor && (rule.maxFloor ?? Number.MAX_SAFE_INTEGER) >= floor)) {
            // Long idle periods stay predictable, while a small seeded variance keeps runs from feeling mechanical.
            const variance = 0.9 + rng.next() * 0.2;
            const raw = reward.baseYieldPerYear * safeYears * safeEfficiency * floorSpec.rewardMultiplier * rarityFactor(reward.rarity) * variance;
            const floorAmount = Math.max(0, Math.floor(raw));
            const amount = dungeon.workerRewardRounding === 'stochastic'
                ? floorAmount + (rng.chance(Math.max(0, Math.min(1, raw - floorAmount)) * 100) ? 1 : 0)
                : floorAmount;
            if (amount <= 0)
                continue;
            rewards[reward.resourceId] = (rewards[reward.resourceId] ?? 0) + amount;
            state.inventory[reward.resourceId] = (state.inventory[reward.resourceId] ?? 0) + amount;
        }
        // V109: Resource Phó Bản farm is time-based after first-clear and works for both main body and clone/offline DungeonEngine paths.
        if (isResourcePveDungeonV12329(dungeon.id) && safeYears > 0) {
            const collectionState = ensureCollectionProgressStateV12316(state);
            const farm = grantResourcePveFarmRewardsV109(collectionState, state.inventory, dungeon.id, floor, safeYears, safeEfficiency, seed);
            if (farm) {
                if (farm.material > 0)
                    rewards[resourcePveVirtualMaterialIdV12329(farm.category)] = (rewards[resourcePveVirtualMaterialIdV12329(farm.category)] ?? 0) + farm.material;
                if (farm.breakthrough > 0)
                    rewards[resourcePveVirtualBreakIdV12329(farm.category)] = (rewards[resourcePveVirtualBreakIdV12329(farm.category)] ?? 0) + farm.breakthrough;
            }
        }
        if (registry && dungeon.equipmentLoot && dungeon.equipmentLoot.length > 0 && safeYears > 0) {
            const eligible = dungeon.equipmentLoot.filter(rule => (rule.minFloor ?? 1) <= floor && (rule.maxFloor ?? Number.MAX_SAFE_INTEGER) >= floor);
            const workerRate = Math.max(0, dungeon.workerEquipmentRatePerYear ?? 0);
            if (workerRate > 0) {
                // Target-loot workers are time-based instead of call-count based. Splitting one offline span into
                // many short syncs therefore does not create a higher expected Set income.
                const expected = safeYears * Math.max(0, safeEfficiency) * workerRate;
                const whole = Math.floor(expected);
                const count = whole + (rng.chance(Math.max(0, Math.min(1, expected - whole)) * 100) ? 1 : 0);
                for (let i = 0; i < count; i++) {
                    const rule = weightedLootRule(rng, eligible);
                    if (!rule)
                        break;
                    const template = registry.equipmentTemplate(rule.templateId);
                    const quality = rollQuality(rng, floorSpec.qualityBias);
                    const itemSeed = (seed ^ Math.imul(i + 1, 0x27d4eb2d) ^ rng.nextUint32()) >>> 0;
                    const item = buildEquipmentInstance(template, floorSpec.equipmentTier, quality, floor, { kind: 'dungeon', dungeonId: dungeon.id, floor, seed: itemSeed }, state.worldTimeYears);
                    addEquipment(state.equipment, item);
                    equipmentDrops.push(item);
                }
            }
            else {
                const opportunities = Math.min(5, Math.max(1, Math.ceil(Math.log2(1 + safeYears * Math.max(0.2, safeEfficiency)))));
                for (let i = 0; i < opportunities && equipmentDrops.length < 3; i++) {
                    const chance = Math.min(0.95, floorSpec.equipmentDropChance * Math.min(1, safeEfficiency));
                    if (!rng.chance(chance * 100))
                        continue;
                    const rule = weightedLootRule(rng, eligible);
                    if (!rule)
                        continue;
                    const template = registry.equipmentTemplate(rule.templateId);
                    const quality = rollQuality(rng, floorSpec.qualityBias);
                    const itemSeed = (seed ^ Math.imul(i + 1, 0x27d4eb2d) ^ rng.nextUint32()) >>> 0;
                    const item = buildEquipmentInstance(template, floorSpec.equipmentTier, quality, floor, { kind: 'dungeon', dungeonId: dungeon.id, floor, seed: itemSeed }, state.worldTimeYears);
                    addEquipment(state.equipment, item);
                    equipmentDrops.push(item);
                }
            }
        }
        if (registry && dungeon.artifactLoot && dungeon.artifactLoot.length > 0 && safeYears > 0) {
            const eligible = dungeon.artifactLoot.filter(rule => (rule.minFloor ?? 1) <= floor && (rule.maxFloor ?? Number.MAX_SAFE_INTEGER) >= floor);
            const opportunities = Math.min(4, Math.max(1, Math.ceil(Math.log2(1 + safeYears * Math.max(0.2, safeEfficiency)))));
            for (let i = 0; i < opportunities && artifactDrops.length < 2; i++) {
                const baseChance = floorSpec.artifactDropChance ?? Math.min(0.26, floorSpec.equipmentDropChance * 0.38);
                const chance = Math.min(0.75, baseChance * Math.min(1, safeEfficiency));
                if (!rng.chance(chance * 100))
                    continue;
                const rule = weightedLootRule(rng, eligible);
                if (!rule)
                    continue;
                const template = registry.artifactTemplate(rule.templateId);
                const quality = rollArtifactQuality(rng, floorSpec.qualityBias * 0.85);
                const itemSeed = (seed ^ Math.imul(i + 1, 0x165667b1) ^ rng.nextUint32()) >>> 0;
                const artifactTier = floorSpec.artifactTier ?? Math.max(0, floorSpec.equipmentTier - 1);
                const item = buildArtifactInstance(template, artifactTier, quality, floor, { kind: 'dungeon', dungeonId: dungeon.id, floor, seed: itemSeed }, state.worldTimeYears);
                addArtifact(state.artifacts, item);
                artifactDrops.push(item);
            }
        }
        let rewardText = dungeon.rewards
            .map(reward => [reward.name, rewards[reward.resourceId] ?? 0])
            .filter(([, amount]) => amount > 0)
            .map(([name, amount]) => `${name} ×${formatNumber(amount)}`)
            .join(', ');
        if (!rewardText && isResourcePveDungeonV12329(dungeon.id))
            rewardText = Object.entries(rewards).filter(([, amount]) => amount > 0).map(([id, amount]) => `${id.endsWith('.breakthrough') ? 'Nguyên liệu đột phá' : 'Nguyên liệu cường hóa'} ×${formatNumber(amount)}`).join(', ');
        return {
            dungeonId: dungeon.id,
            floor,
            elapsedYears: safeYears,
            rewards,
            equipmentDrops,
            artifactDrops,
            summaryLines: [
                `${dungeon.name} · Tầng ${floor}: ${formatNumber(safeYears)} năm${safeEfficiency !== 1 ? ` @${formatNumber(safeEfficiency * 100)}%` : ''}.`,
                rewardText.length > 0 ? `Thu hoạch: ${rewardText}.` : 'Không có thu hoạch đáng kể.',
                ...(equipmentDrops.length > 0 ? [`Trang bị đáng chú ý: ${equipmentDrops.map(item => `${equipmentTierName(item.tier)} ${equipmentQualityName(item.quality)} ${registry?.equipmentTemplate(item.templateId).name ?? item.name}`).join(', ')}.`] : []),
                ...(artifactDrops.length > 0 ? [`Pháp bảo xuất thế: ${artifactDrops.map(item => `${artifactTierName(item.tier)} ${artifactQualityName(item.quality)} ${registry?.artifactTemplate(item.templateId).name ?? item.name}`).join(', ')}.`] : []),
            ],
        };
    }
    resolveParallel(state, dungeons, elapsedYears, seed, registry, globalEfficiencyMultiplier = 1) {
        const years = Math.max(0, elapsedYears);
        if (years <= 0)
            return { elapsedYears: 0, events: [], summaryLines: [] };
        const events = [];
        const summaryLines = [];
        let index = 0;
        for (const worker of state.dungeons.workers) {
            const assignment = state.dungeons.assignments[worker.id];
            if (!assignment)
                continue;
            const dungeon = dungeons[assignment.dungeonId];
            if (!dungeon)
                throw new Error(`Unknown assigned dungeon: ${assignment.dungeonId}`);
            if (!state.dungeons.unlockedDungeonIds.includes(dungeon.id)) {
                throw new Error(`Assigned dungeon is not unlocked: ${dungeon.id}`);
            }
            const workerSeed = (seed ^ Math.imul(index + 1, 0x85ebca6b)) >>> 0;
            const specializationBonus = worker.specialization && worker.specialization !== 'general' ? (worker.specialization === dungeon.purpose || (worker.specializationPurposes ?? []).includes(dungeon.purpose) ? Math.max(1.20, Number(worker.specializationEfficiencyBonus) || 1.20) : 1) : 1;
            const effectiveEfficiency = Math.max(0.15, worker.efficiency * specializationBonus * Math.max(0.1, globalEfficiencyMultiplier));
            const result = this.run(state, dungeon, years, workerSeed, effectiveEfficiency, assignment.floor, registry);
            assignment.totalYears += years;
            assignment.totalRuns += 1;
            const rewardCount = Object.values(result.rewards).reduce((sum, amount) => sum + amount, 0);
            events.push({
                id: `dungeon.parallel.${seed}.${index}`,
                worldTimeYears: state.worldTimeYears,
                ageYears: state.ageYears,
                type: 'dungeon',
                significance: dungeon.tier >= 2 ? 9 : 5,
                message: `${worker.name} treo ${dungeon.name} ${formatNumber(years)} năm; thu hoạch ${formatNumber(rewardCount)} đơn vị tài nguyên.`,
                tags: ['Dungeon', 'Parallel', worker.kind, dungeon.purpose, ...dungeon.tags],
                data: {
                    workerId: worker.id,
                    dungeonId: dungeon.id,
                    floor: assignment.floor,
                    years,
                    efficiency: effectiveEfficiency,
                    baseEfficiency: worker.baseEfficiency ?? worker.efficiency,
                    globalEfficiencyMultiplier: Math.max(0.1, globalEfficiencyMultiplier),
                    soulLoad: worker.soulLoad ?? 0,
                    specialization: worker.specialization ?? 'general',
                },
            });
            summaryLines.push(`${worker.name} → ${result.summaryLines.join(' ')}`);
            index += 1;
        }
        return { elapsedYears: years, events, summaryLines };
    }
}
export function addDungeonWorker(state, worker) {
    if (state.workers.length >= state.parallelWorkerCapacity) {
        throw new Error(`No free parallel dungeon worker slot: ${state.workers.length}/${state.parallelWorkerCapacity}`);
    }
    if (state.workers.some(existing => existing.id === worker.id)) {
        throw new Error(`Dungeon worker already exists: ${worker.id}`);
    }
    if (worker.efficiency <= 0)
        throw new Error('Dungeon worker efficiency must be positive');
    state.workers.push({ ...worker });
}
export function assignDungeonWorker(state, workerId, dungeonId, floor = 1) {
    if (!state.unlockedDungeonIds.includes(dungeonId))
        throw new Error(`Dungeon is not unlocked: ${dungeonId}`);
    if (floor <= 0 || !Number.isInteger(floor))
        throw new Error('Dungeon floor must be a positive integer');
    const worker = state.workers.find(candidate => candidate.id === workerId);
    if (!worker)
        throw new Error(`Unknown dungeon worker: ${workerId}`);
    const occupied = Object.values(state.assignments).find(assignment => assignment.dungeonId === dungeonId && assignment.workerId !== workerId);
    if (occupied)
        throw new Error(`Dungeon already has an assigned worker: ${dungeonId}`);
    const previous = state.assignments[workerId];
    state.assignments[workerId] = {
        workerId,
        dungeonId,
        floor,
        totalYears: previous?.dungeonId === dungeonId && previous.floor === floor ? previous.totalYears : 0,
        totalRuns: previous?.dungeonId === dungeonId && previous.floor === floor ? previous.totalRuns : 0,
    };
}
export function maxAccessibleDungeonFloor(dungeon, realmOrder) {
    return dungeon.floors
        .filter(floor => floor.requiredRealmOrder <= realmOrder)
        .reduce((max, floor) => Math.max(max, floor.floor), 0);
}
export function clearDungeonWorker(state, workerId) {
    delete state.assignments[workerId];
}
//# sourceMappingURL=dungeon.js.map