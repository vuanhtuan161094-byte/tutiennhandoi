export const reincarnationOrientations = {
    balanced: { id: 'balanced', name: 'Bình Hành Mệnh Thai', description: 'Không cưỡng ép thiên hướng; giữ Mệnh Thai cân bằng.', requiredSeal: 0, cpCost: 0, capacityModifiers: {} },
    battle_body: { id: 'battle_body', name: 'Thiên Sinh Chiến Thể', description: 'Ưu tiên Nhục Thân và Huyết Mạch; Đạo Dung hẹp hơn đôi chút.', requiredSeal: 2, cpCost: 24, capacityModifiers: { body: 18, bloodline: 12, dao: -7 }, basePotentialModifier: 2 },
    dao_embryo: { id: 'dao_embryo', name: 'Tiên Thiên Đạo Thai', description: 'Đạo Dung và Công Pháp xuất chúng; Nhục Thân không phải sở trường.', requiredSeal: 3, cpCost: 36, capacityModifiers: { dao: 22, technique: 12, body: -8 }, basePotentialModifier: 2 },
    pure_soul: { id: 'pure_soul', name: 'Vô Cấu Hồn Thai', description: 'Thần Hồn bền sạch, hợp Phân Thân và chống Tâm Ma.', requiredSeal: 3, cpCost: 34, capacityModifiers: { soul: 24, technique: 5, body: -5 }, basePotentialModifier: 1 },
    myriad_arts: { id: 'myriad_arts', name: 'Vạn Pháp Thai', description: 'Dung nạp nhiều Công Pháp/biểu hiện hơn, đổi lại chuyên cực hạn kém hơn.', requiredSeal: 5, cpCost: 55, capacityModifiers: { technique: 20, artifact: 10, dao: 6, body: -4, bloodline: -4 }, manifestationBonus: 1 },
    chaos_embryo: { id: 'chaos_embryo', name: 'Hỗn Độn Thai', description: 'Mệnh Thai hiếm, hợp Hỗn Độn và đa hệ; chi phí chuyển sinh rất cao.', requiredSeal: 7, cpCost: 95, capacityModifiers: { chaos: 32, body: 8, soul: 8, bloodline: 8, creation: -6 }, basePotentialModifier: 4, manifestationBonus: 1 },
    creation_embryo: { id: 'creation_embryo', name: 'Sáng Thế Nguyên Thai', description: 'Mệnh Thai hướng Sáng Thế; mạnh nhất khi tài khoản đã có Sáng Thế Căn Nguyên.', requiredSeal: 9, cpCost: 140, capacityModifiers: { creation: 38, dao: 12, soul: 8, chaos: 8 }, basePotentialModifier: 6, manifestationBonus: 2 },
};
const sealThresholds = [0, 500, 2000, 7500, 20000, 50000, 120000, 250000, 500000, 1000000];
export function reincarnationSealLevel(xp) {
    let level = 0;
    for (let i = 1; i < sealThresholds.length; i++)
        if (xp >= sealThresholds[i])
            level = i;
    return level;
}
export function reincarnationSealName(level) {
    if (level <= 0)
        return 'Chưa Kết Ấn';
    const numerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
    return `Luân Hồi Ấn ${numerals[Math.min(9, Math.max(1, Math.floor(level)))]}`;
}
export function createReincarnationMasteryState() {
    return { xp: 0, sealLevel: 0, effectiveLives: 0, totalReincarnations: 0, daoSeeds: [], memoryArchives: [] };
}
export function cloneReincarnationMasteryState(state) {
    const xp = Math.max(0, Number(state?.xp ?? 0) || 0);
    return {
        xp,
        sealLevel: reincarnationSealLevel(xp),
        effectiveLives: Math.max(0, Math.floor(Number(state?.effectiveLives ?? 0) || 0)),
        totalReincarnations: Math.max(0, Math.floor(Number(state?.totalReincarnations ?? 0) || 0)),
        daoSeeds: (state?.daoSeeds ?? []).map(x => ({ ...x })),
        memoryArchives: (state?.memoryArchives ?? []).map(x => ({ ...x, npcIds: [...x.npcIds] })),
    };
}
export function birthPreviewCountForSeal(seal) {
    if (seal >= 9)
        return 9;
    if (seal >= 7)
        return 7;
    if (seal >= 4)
        return 5;
    if (seal >= 2)
        return 3;
    if (seal >= 1)
        return 2;
    return 1;
}
export function nextSealXp(level) {
    const next = Math.max(1, Math.floor(level) + 1);
    return next < sealThresholds.length ? sealThresholds[next] : undefined;
}
export function fateLockSlotsForSeal(seal) {
    if (seal >= 9)
        return 5;
    if (seal >= 7)
        return 4;
    if (seal >= 5)
        return 3;
    if (seal >= 3)
        return 2;
    if (seal >= 1)
        return 1;
    return 0;
}
export function karmaInheritanceSlotsForSeal(seal) {
    return seal >= 8 ? 3 : seal >= 5 ? 2 : seal >= 3 ? 1 : 0;
}
export function boundRelicSlotsForSeal(seal) {
    return seal >= 9 ? 2 : seal >= 4 ? 1 : 0;
}
export function availableOrientations(seal) {
    return Object.values(reincarnationOrientations).filter(x => seal >= x.requiredSeal);
}
export function addReincarnationLegacyGain(state, gain) {
    if (!gain)
        return;
    const xp = Math.max(0, gain.xp || 0);
    state.xp += xp;
    if (gain.effective && xp > 0)
        state.effectiveLives += 1;
    state.sealLevel = reincarnationSealLevel(state.xp);
    if (gain.daoSeed) {
        const current = state.daoSeeds.find(x => x.daoId === gain.daoSeed.daoId);
        if (!current)
            state.daoSeeds.push({ ...gain.daoSeed });
        else if (gain.daoSeed.strength > current.strength) {
            Object.assign(current, gain.daoSeed);
        }
    }
    if (gain.memoryArchive && !state.memoryArchives.some(x => x.id === gain.memoryArchive.id))
        state.memoryArchives.push({ ...gain.memoryArchive, npcIds: [...gain.memoryArchive.npcIds] });
    state.daoSeeds.sort((a, b) => b.strength - a.strength || a.daoId.localeCompare(b.daoId));
    state.memoryArchives.sort((a, b) => b.sourceLifeNumber - a.sourceLifeNumber);
    if (state.memoryArchives.length > 80)
        state.memoryArchives.splice(80);
}
export function buildMemoryFragments(archive) {
    if (!archive)
        return [];
    const result = [];
    if (archive.techniqueId)
        result.push({ id: `memory.technique.${archive.sourceLifeId}`, type: 'technique', title: `Công pháp tiền kiếp · ${archive.title}`, unlockRealmOrder: 1, payloadId: archive.techniqueId, unlocked: false });
    if (archive.npcIds[0])
        result.push({ id: `memory.karma.${archive.sourceLifeId}`, type: 'karma', title: `Nhân duyên tiền kiếp · ${archive.title}`, unlockRealmOrder: 10, payloadId: archive.npcIds[0], unlocked: false });
    if (archive.artifactId)
        result.push({ id: `memory.artifact.${archive.sourceLifeId}`, type: 'artifact', title: `Di vật tiền kiếp · ${archive.title}`, unlockRealmOrder: 22, payloadId: archive.artifactId, unlocked: false });
    if (archive.daoId)
        result.push({ id: `memory.dao.${archive.sourceLifeId}`, type: 'dao', title: `Đạo niệm tiền kiếp · ${archive.title}`, unlockRealmOrder: 26, payloadId: archive.daoId, unlocked: false });
    return result;
}
export function cloneReincarnationInheritance(value) {
    if (!value)
        return undefined;
    return { ...value, inheritedKarmaNpcIds: [...value.inheritedKarmaNpcIds], boundRelicArtifactIds: [...value.boundRelicArtifactIds], memoryFragments: value.memoryFragments.map(x => ({ ...x })) };
}
//# sourceMappingURL=reincarnation.js.map