function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}


export const V127_SIX_DAO_CLONES = Object.freeze([
    { id: 'heaven', name: 'Thiên Đạo', title: 'Thiên Đạo Phân Thân', primaryPurpose: 'cultivation', purposes: ['cultivation'], description: 'Hộ Pháp / hỗ trợ Tu Luyện, tăng hiệu suất Bản Thể.', protectorBasePct: 8 },
    { id: 'human', name: 'Nhân Đạo', title: 'Nhân Đạo Phân Thân', primaryPurpose: 'dao', purposes: ['dao', 'cultivation'], description: 'Công Pháp / Tâm Pháp / Tri Kỷ, thiên về phát triển tổng hợp.', protectorBasePct: 5 },
    { id: 'asura', name: 'A Tu La Đạo', title: 'A Tu La Phân Thân', primaryPurpose: 'artifact', purposes: ['artifact', 'soul'], description: 'Chiến đấu, Săn Yêu, Boss và nguyên liệu Pháp Bảo/Chí Bảo.', protectorBasePct: 5 },
    { id: 'animal', name: 'Súc Sinh Đạo', title: 'Súc Sinh Phân Thân', primaryPurpose: 'beast', purposes: ['beast', 'integration'], description: 'Linh Thú / Thể Chất và các hệ thân thể–thú.', protectorBasePct: 5 },
    { id: 'hungry_ghost', name: 'Ngạ Quỷ Đạo', title: 'Ngạ Quỷ Phân Thân', primaryPurpose: 'alchemy', purposes: ['alchemy', 'beast'], description: 'Huyết Mạch / tài nguyên hiếm, thiên về tham thực–thôn phệ.', protectorBasePct: 5 },
    { id: 'hell', name: 'Địa Ngục Đạo', title: 'Địa Ngục Phân Thân', primaryPurpose: 'tribulation', purposes: ['tribulation', 'great_vehicle', 'immortal', 'space'], description: 'Nội dung khó, tài nguyên đột phá và phó bản nguy hiểm/cấp cao.', protectorBasePct: 5 },
]);

export const V128_DAO_HANH_MAX_LEVEL = 50;
export const V128_LUC_DAO_SEAL_LADDER = Object.freeze([
    { index: 0, id: 'mortal', name: 'Phàm Ấn', minLevel: 1 },
    { index: 1, id: 'first', name: 'Nhất Chuyển', minLevel: 10 },
    { index: 2, id: 'second', name: 'Nhị Chuyển', minLevel: 20 },
    { index: 3, id: 'third', name: 'Tam Chuyển', minLevel: 30 },
    { index: 4, id: 'fourth', name: 'Tứ Chuyển', minLevel: 40 },
    { index: 5, id: 'fifth', name: 'Ngũ Chuyển', minLevel: 50 },
]);
function v128SealIndex(clone) { return clamp(Math.floor(Number(clone?.daoSealIndex) || 0), 0, 5); }
function v128DaoLevel(clone) { return clamp(Math.floor(Number(clone?.daoHanhLevel) || 1), 1, V128_DAO_HANH_MAX_LEVEL); }
export function cloneDaoQualityV128(clone) {
    const level = v128DaoLevel(clone);
    const seal = v128SealIndex(clone);
    const levelProgress = (level - 1) / (V128_DAO_HANH_MAX_LEVEL - 1);
    const sealProgress = seal / 5;
    return clamp(levelProgress * 0.75 + sealProgress * 0.25, 0, 1);
}
export function cloneSpecialtyEfficiencyV128(clone) { return 1.20 + 0.10 * cloneDaoQualityV128(clone); }
export function cloneProtectorQualityMultiplierV128(clone) { return 1 + 0.20 * cloneDaoQualityV128(clone); }
export function cloneDaoHanhTrainCostV128(clone) {
    const level = v128DaoLevel(clone);
    const band = Math.floor((level - 1) / 10);
    return { soulDew: 4 + band * 2, soulEssence: 1 + Math.floor(band / 2) };
}
export function cloneSealUpgradeCostV128(clone) {
    const seal = v128SealIndex(clone);
    if (seal >= 5) return undefined;
    const target = seal + 1;
    return { soulDew: 16 + target * 8, soulEssence: 4 + target * 3 };
}
export function cloneProgressionProfileV128(clone) {
    const level = v128DaoLevel(clone), sealIndex = v128SealIndex(clone);
    const seal = V128_LUC_DAO_SEAL_LADDER[sealIndex];
    const nextSeal = V128_LUC_DAO_SEAL_LADDER[sealIndex + 1];
    const nextSealRequiredLevel = nextSeal?.minLevel;
    const blockedBySeal = Boolean(nextSeal && level >= nextSealRequiredLevel);
    const maxed = level >= V128_DAO_HANH_MAX_LEVEL && sealIndex >= 5;
    return {
        level, maxLevel: V128_DAO_HANH_MAX_LEVEL, sealIndex, seal: { ...seal }, nextSeal: nextSeal ? { ...nextSeal } : undefined,
        nextSealRequiredLevel, blockedBySeal, maxed, canTrain: !maxed && !blockedBySeal && level < V128_DAO_HANH_MAX_LEVEL,
        canUpgradeSeal: Boolean(nextSeal && level >= nextSealRequiredLevel),
        trainCost: !maxed && !blockedBySeal && level < V128_DAO_HANH_MAX_LEVEL ? cloneDaoHanhTrainCostV128(clone) : undefined,
        sealCost: nextSeal && level >= nextSealRequiredLevel ? cloneSealUpgradeCostV128(clone) : undefined,
        quality: cloneDaoQualityV128(clone), specialtyEfficiency: cloneSpecialtyEfficiencyV128(clone), protectorQualityMultiplier: cloneProtectorQualityMultiplierV128(clone),
    };
}
function sixDaoDefinitionForIndex(index) { return V127_SIX_DAO_CLONES[Math.max(0, Math.min(5, Math.floor(index)))] ?? V127_SIX_DAO_CLONES[0]; }
function normalizeSixDaoCloneV127(clone, index) {
    const dao = V127_SIX_DAO_CLONES.find(x => x.id === clone?.sixDaoId) ?? sixDaoDefinitionForIndex(index);
    return {
        ...clone,
        sixDaoId: dao.id,
        sixDaoName: dao.name,
        sixDaoDescription: dao.description,
        specialization: dao.primaryPurpose,
        specializationPurposes: [...dao.purposes],
        role: clone?.role === 'protector' ? 'protector' : 'farm',
        protectorBasePct: dao.protectorBasePct,
        daoHanhLevel: v128DaoLevel(clone),
        daoSealIndex: v128SealIndex(clone),
        daoSealName: V128_LUC_DAO_SEAL_LADDER[v128SealIndex(clone)].name,
    };
}

export const V127_SOUL_CLONE_AUTHORITY_MILESTONES = Object.freeze([
    { realmOrder: 22, majorRealm: 'Nguyên Anh', slot: 1 },
    { realmOrder: 26, majorRealm: 'Hóa Thần', slot: 2 },
    { realmOrder: 30, majorRealm: 'Luyện Hư', slot: 3 },
    { realmOrder: 34, majorRealm: 'Hợp Thể', slot: 4 },
    { realmOrder: 38, majorRealm: 'Đại Thừa', slot: 5 },
    { realmOrder: 42, majorRealm: 'Độ Kiếp', slot: 6 },
]);
export function soulCloneAuthorityCapacityV127(realmOrder) {
    const order = Math.max(0, Math.floor(Number(realmOrder) || 0));
    let capacity = 0;
    for (const milestone of V127_SOUL_CLONE_AUTHORITY_MILESTONES) {
        if (order < milestone.realmOrder)
            break;
        capacity = milestone.slot;
    }
    return capacity;
}
export function soulCloneAuthorityProfileV127(realmOrder, ownedCount = 0) {
    const capacity = soulCloneAuthorityCapacityV127(realmOrder);
    const next = V127_SOUL_CLONE_AUTHORITY_MILESTONES.find(milestone => milestone.slot === capacity + 1);
    const owned = Math.max(0, Math.floor(Number(ownedCount) || 0));
    return {
        capacity,
        maxCapacity: 6,
        activeOwned: Math.min(owned, capacity),
        sealedOwned: Math.max(0, owned - capacity),
        nextMilestone: next ? { ...next } : undefined,
        authority: 'V127_AUTHORED_CLONE_GATE',
        legacyParallelWorkerCapacityIsNotAuthority: true,
    };
}
export function createSoulState() {
    return {
        awakened: false,
        strength: 18,
        purity: 55,
        stability: 70,
        loadCapacity: 0,
        insight: 0,
        clones: [],
    };
}
export function cloneSoulState(state) {
    const source = state ?? createSoulState();
    return {
        awakened: Boolean(source.awakened),
        strength: source.strength,
        purity: source.purity,
        stability: source.stability,
        loadCapacity: source.loadCapacity,
        insight: source.insight,
        clones: source.clones.map((clone, index) => normalizeSixDaoCloneV127(clone, index)),
    };
}
export function totalSoulLoad(state, authorityCap = Number.POSITIVE_INFINITY) {
    const cap = Number.isFinite(authorityCap) ? Math.max(0, Math.floor(authorityCap)) : state.clones.length;
    return state.clones.slice(0, cap).reduce((sum, clone) => sum + clone.soulLoad, 0);
}
export function soulPressureMultiplier(state, authorityCap = Number.POSITIVE_INFINITY) {
    const load = totalSoulLoad(state, authorityCap);
    if (load <= 0 || state.loadCapacity <= 0)
        return load <= 0 ? 1 : 0.35;
    const ratio = load / state.loadCapacity;
    if (ratio <= 0.72)
        return 1;
    if (ratio <= 1)
        return clamp(1 - (ratio - 0.72) * 0.72, 0.80, 1);
    return clamp(0.80 - (ratio - 1) * 0.62, 0.35, 0.80);
}
export function synchronizeSoulForRealm(state, realmOrder, parallelCapacity) {
    if (realmOrder < 22)
        return state;
    state.awakened = true;
    const stage = Math.max(0, realmOrder - 22);
    state.strength = Math.max(state.strength, 100 + stage * 24);
    state.purity = Math.max(state.purity, 68 + stage * 3);
    state.stability = Math.max(state.stability, 76 + stage * 3);
    // Capacity is deliberately related to, but not identical with, the number of available worker slots.
    state.loadCapacity = Math.max(state.loadCapacity, 62 + stage * 34 + parallelCapacity * 24);
    return state;
}
function cloneWorker(clone, pressure) {
    clone = normalizeSixDaoCloneV127(clone, 0);
    const stabilityMultiplier = 0.72 + clamp(clone.stability, 0, 100) / 100 * 0.28;
    return {
        id: clone.id,
        name: clone.name,
        kind: 'avatar',
        efficiency: clamp(clone.baseEfficiency * pressure * stabilityMultiplier, 0.20, 1.05),
        baseEfficiency: clone.baseEfficiency,
        soulLoad: clone.soulLoad,
        stability: clone.stability,
        specialization: clone.specialization,
        specializationPurposes: [...(clone.specializationPurposes ?? [])],
        sixDaoId: clone.sixDaoId,
        sixDaoName: clone.sixDaoName,
        daoHanhLevel: v128DaoLevel(clone),
        daoSealIndex: v128SealIndex(clone),
        specializationEfficiencyBonus: cloneSpecialtyEfficiencyV128(clone),
    };
}
export function syncSoulDungeonWorkers(soul, dungeons, authorityCap = Number.POSITIVE_INFINITY) {
    const pressure = soulPressureMultiplier(soul, authorityCap);
    const cap = Number.isFinite(authorityCap) ? Math.max(0, Math.floor(authorityCap)) : soul.clones.length;
    for (let i = 0; i < soul.clones.length; i++) Object.assign(soul.clones[i], normalizeSixDaoCloneV127(soul.clones[i], i));
    const authorizedClones = soul.clones.slice(0, cap);
    const activeClones = authorizedClones.filter(clone => clone.role !== 'protector');
    const cloneIds = new Set(activeClones.map(clone => clone.id));
    // Remove stale Phân Thân workers but keep dev/puppet workers that do not belong to SoulState.
    dungeons.workers = dungeons.workers.filter(worker => worker.kind !== 'avatar' || cloneIds.has(worker.id));
    for (const clone of activeClones) {
        const worker = cloneWorker(clone, pressure);
        const index = dungeons.workers.findIndex(existing => existing.id === clone.id);
        if (index >= 0)
            dungeons.workers[index] = worker;
        else
            dungeons.workers.push(worker);
    }
    for (const workerId of Object.keys(dungeons.assignments)) {
        if (!dungeons.workers.some(worker => worker.id === workerId))
            delete dungeons.assignments[workerId];
    }
}
export function nourishSoul(soul, inventory, requestedBatches = 1) {
    if (!soul.awakened)
        throw new Error('Thần Hồn chưa đủ để chủ động dưỡng luyện; cần bước vào Nguyên Anh.');
    const batches = Math.max(1, Math.floor(requestedBatches));
    const dewPerBatch = 4;
    const essencePerBatch = 1;
    const maxByDew = Math.floor((inventory['resource.soul_dew'] ?? 0) / dewPerBatch);
    const maxByEssence = Math.floor((inventory['resource.soul_essence'] ?? 0) / essencePerBatch);
    const used = Math.min(batches, maxByDew, maxByEssence);
    if (used <= 0)
        throw new Error('Cần 4 Dưỡng Hồn Lộ + 1 Thần Hồn Tinh Hoa cho mỗi lần dưỡng hồn.');
    inventory['resource.soul_dew'] -= used * dewPerBatch;
    inventory['resource.soul_essence'] -= used * essencePerBatch;
    const strengthGain = used * 2.8;
    const purityGain = used * 0.9;
    const stabilityGain = used * 1.6;
    const capacityGain = used * 2.2;
    soul.strength += strengthGain;
    soul.purity = clamp(soul.purity + purityGain, 0, 100);
    soul.stability = clamp(soul.stability + stabilityGain, 0, 100);
    soul.loadCapacity += capacityGain;
    soul.insight += used * 1.5;
    for (const clone of soul.clones)
        clone.stability = clamp(clone.stability + used * 0.7, 0, 100);
    return {
        spentSoulDew: used * dewPerBatch,
        spentSoulEssence: used * essencePerBatch,
        strengthGain,
        purityGain,
        stabilityGain,
        loadCapacityGain: capacityGain,
    };
}
export function createSoulClone(soul, dungeons, inventory, options) {
    if (!soul.awakened)
        throw new Error('Chỉ sau khi kết Nguyên Anh mới có thể tạo Phân Thân ổn định.');
    const authorityCap = Number.isFinite(options.authorityCap) ? Math.max(0, Math.floor(options.authorityCap)) : dungeons.parallelWorkerCapacity;
    const effectiveCap = authorityCap;
    if (soul.clones.length >= effectiveCap) {
        throw new Error(`Không còn Phân Thân V127 đã mở: ${Math.min(soul.clones.length, effectiveCap)}/${effectiveCap}. parallelWorkerCapacity legacy không mở thêm Lục Đạo.`);
    }
    const dewCost = 18 + soul.clones.length * 8;
    const essenceCost = 6 + soul.clones.length * 3;
    if ((inventory['resource.soul_dew'] ?? 0) < dewCost || (inventory['resource.soul_essence'] ?? 0) < essenceCost) {
        throw new Error(`Tạo Phân Thân cần ${dewCost} Dưỡng Hồn Lộ và ${essenceCost} Thần Hồn Tinh Hoa.`);
    }
    const loadBefore = totalSoulLoad(soul, authorityCap);
    inventory['resource.soul_dew'] -= dewCost;
    inventory['resource.soul_essence'] -= essenceCost;
    const index = soul.clones.length + 1;
    const dao = sixDaoDefinitionForIndex(index - 1);
    const specialization = dao.primaryPurpose;
    const clone = {
        id: options.id ?? `soul.clone.${index}`,
        name: options.name ?? dao.title,
        sixDaoId: dao.id,
        sixDaoName: dao.name,
        sixDaoDescription: dao.description,
        specialization,
        specializationPurposes: [...dao.purposes],
        role: 'farm',
        protectorBasePct: dao.protectorBasePct,
        soulLoad: 38 + soul.clones.length * 7,
        baseEfficiency: clamp(0.60 + soul.strength / 1000 + soul.purity / 1000, 0.58, 0.88),
        stability: clamp(72 + soul.stability * 0.16 - soul.clones.length * 4, 48, 92),
        daoHanhLevel: 1,
        daoSealIndex: 0,
        daoSealName: V128_LUC_DAO_SEAL_LADDER[0].name,
        yearsActive: 0,
        dungeonWorkYears: 0,
        dungeonWorkRuns: 0,
        createdWorldYear: options.worldYear,
    };
    soul.clones.push(clone);
    syncSoulDungeonWorkers(soul, dungeons, authorityCap);
    return {
        clone: { ...clone },
        authorityCap,
        spentSoulDew: dewCost,
        spentSoulEssence: essenceCost,
        loadBefore,
        loadAfter: totalSoulLoad(soul, authorityCap),
        pressureMultiplier: soulPressureMultiplier(soul, authorityCap),
    };
}
export function dismissSoulClone(soul, dungeons, cloneId, authorityCap = Number.POSITIVE_INFINITY) {
    const index = soul.clones.findIndex(clone => clone.id === cloneId);
    if (index < 0)
        throw new Error(`Không tìm thấy Phân Thân: ${cloneId}`);
    const [clone] = soul.clones.splice(index, 1);
    delete dungeons.assignments[cloneId];
    syncSoulDungeonWorkers(soul, dungeons, authorityCap);
    return { ...clone };
}
export function recordSoulCloneYears(soul, years) {
    const elapsed = Math.max(0, years);
    if (elapsed <= 0)
        return;
    for (const clone of soul.clones)
        clone.yearsActive += elapsed;
}
export function specializationEfficiencyBonus(specialization, purpose, specializationPurposes = [], specialtyMultiplier = 1.20) {
    if (specialization === 'general') return 1;
    return specialization === purpose || specializationPurposes.includes(purpose) ? Math.max(1, Number(specialtyMultiplier) || 1.20) : 1;
}
export function trainSoulCloneDaoHanhV128(soul, inventory, cloneId, requestedLevels = 1) {
    const index = soul.clones.findIndex(clone => clone.id === cloneId);
    if (index < 0) throw new Error(`Không tìm thấy Phân Thân: ${cloneId}`);
    Object.assign(soul.clones[index], normalizeSixDaoCloneV127(soul.clones[index], index));
    const clone = soul.clones[index];
    const wanted = Math.max(1, Math.floor(Number(requestedLevels) || 1));
    let gained = 0, spentSoulDew = 0, spentSoulEssence = 0;
    while (gained < wanted) {
        const profile = cloneProgressionProfileV128(clone);
        if (!profile.canTrain) break;
        const cost = profile.trainCost;
        if ((inventory['resource.soul_dew'] ?? 0) < cost.soulDew || (inventory['resource.soul_essence'] ?? 0) < cost.soulEssence) break;
        inventory['resource.soul_dew'] -= cost.soulDew;
        inventory['resource.soul_essence'] -= cost.soulEssence;
        spentSoulDew += cost.soulDew; spentSoulEssence += cost.soulEssence;
        clone.daoHanhLevel = Math.min(V128_DAO_HANH_MAX_LEVEL, v128DaoLevel(clone) + 1);
        gained += 1;
    }
    if (gained <= 0) {
        const profile = cloneProgressionProfileV128(clone);
        if (profile.blockedBySeal) throw new Error(`${clone.name} đã đạt Lv${profile.level}; cần Thăng Ấn ${profile.nextSeal?.name} trước khi tiếp tục Bồi Dưỡng.`);
        if (profile.maxed) throw new Error(`${clone.name} đã đạt Đạo Hạnh Lv50 · Ngũ Chuyển.`);
        const cost = profile.trainCost ?? cloneDaoHanhTrainCostV128(clone);
        throw new Error(`Thiếu tài nguyên Bồi Dưỡng: cần ${cost.soulDew} Dưỡng Hồn Lộ + ${cost.soulEssence} Thần Hồn Tinh Hoa.`);
    }
    Object.assign(clone, normalizeSixDaoCloneV127(clone, index));
    return { clone: { ...clone }, gainedLevels: gained, spentSoulDew, spentSoulEssence, progression: cloneProgressionProfileV128(clone) };
}
export function upgradeSoulCloneSealV128(soul, inventory, cloneId) {
    const index = soul.clones.findIndex(clone => clone.id === cloneId);
    if (index < 0) throw new Error(`Không tìm thấy Phân Thân: ${cloneId}`);
    Object.assign(soul.clones[index], normalizeSixDaoCloneV127(soul.clones[index], index));
    const clone = soul.clones[index];
    const profile = cloneProgressionProfileV128(clone);
    if (!profile.nextSeal) throw new Error(`${clone.name} đã đạt Ngũ Chuyển.`);
    if (!profile.canUpgradeSeal) throw new Error(`Cần Đạo Hạnh Lv${profile.nextSealRequiredLevel} mới có thể Thăng Ấn ${profile.nextSeal.name}.`);
    const cost = profile.sealCost;
    if ((inventory['resource.soul_dew'] ?? 0) < cost.soulDew || (inventory['resource.soul_essence'] ?? 0) < cost.soulEssence)
        throw new Error(`Thăng Ấn ${profile.nextSeal.name} cần ${cost.soulDew} Dưỡng Hồn Lộ + ${cost.soulEssence} Thần Hồn Tinh Hoa.`);
    inventory['resource.soul_dew'] -= cost.soulDew;
    inventory['resource.soul_essence'] -= cost.soulEssence;
    clone.daoSealIndex = profile.sealIndex + 1;
    clone.daoSealName = V128_LUC_DAO_SEAL_LADDER[clone.daoSealIndex].name;
    Object.assign(clone, normalizeSixDaoCloneV127(clone, index));
    return { clone: { ...clone }, spentSoulDew: cost.soulDew, spentSoulEssence: cost.soulEssence, progression: cloneProgressionProfileV128(clone) };
}
export function setSoulCloneProtectorV127(soul, dungeons, cloneId, enabled, authorityCap = Number.POSITIVE_INFINITY) {
    const index = soul.clones.findIndex(clone => clone.id === cloneId);
    if (index < 0) throw new Error(`Không tìm thấy Phân Thân: ${cloneId}`);
    const cap = Number.isFinite(authorityCap) ? Math.max(0, Math.floor(authorityCap)) : soul.clones.length;
    if (index >= cap) throw new Error('Phân Thân này chưa được quyền hoạt động ở cảnh giới hiện tại.');
    for (let i=0;i<soul.clones.length;i++) Object.assign(soul.clones[i], normalizeSixDaoCloneV127(soul.clones[i], i));
    const clone = soul.clones[index];
    if (enabled) {
        const activeProtectors = soul.clones.slice(0, cap).filter(x => x.role === 'protector' && x.id !== cloneId);
        if (activeProtectors.length >= 2) throw new Error('V127 chỉ cho tối đa 2 Phân Thân Hộ Pháp cùng lúc.');
        clone.role = 'protector';
        delete dungeons.assignments[cloneId];
    } else clone.role = 'farm';
    syncSoulDungeonWorkers(soul, dungeons, cap);
    return { ...clone };
}
export function soulProtectorCultivationBonusPctV127(soul, authorityCap = Number.POSITIVE_INFINITY, treeEffectPct = 0) {
    const cap = Number.isFinite(authorityCap) ? Math.max(0, Math.floor(authorityCap)) : soul.clones.length;
    const treeRelative = 1 + Math.max(0, Math.min(100, Number(treeEffectPct) || 0)) / 100;
    return soul.clones.slice(0, cap).map((clone,index)=>normalizeSixDaoCloneV127(clone,index)).filter(clone=>clone.role==='protector').slice(0,2).reduce((sum,clone)=>sum + clone.protectorBasePct * treeRelative * cloneProtectorQualityMultiplierV128(clone), 0);
}
//# sourceMappingURL=soul.js.map