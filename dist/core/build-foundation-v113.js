export const FIVE_ELEMENT_ROOT_IDS = ['metal', 'wood', 'water', 'fire', 'earth'];
export const ROOT_LEVEL_MAX = 1000;
export const ROOT_MILESTONE_TEMPLATE = [1, 10, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 900, 1000];
export const ROOT_GRAND_GRADES = [
    { id: 'mortal', minLevel: 1, maxLevel: 100, name: 'Phàm Căn' },
    { id: 'spirit', minLevel: 101, maxLevel: 200, name: 'Linh Căn' },
    { id: 'mystic', minLevel: 201, maxLevel: 300, name: 'Huyền Căn' },
    { id: 'earth', minLevel: 301, maxLevel: 400, name: 'Địa Căn' },
    { id: 'heaven', minLevel: 401, maxLevel: 500, name: 'Thiên Căn' },
    { id: 'true', minLevel: 501, maxLevel: 600, name: 'Chân Căn' },
    { id: 'dao', minLevel: 601, maxLevel: 700, name: 'Đạo Căn' },
    { id: 'immortal', minLevel: 701, maxLevel: 800, name: 'Tiên Căn' },
    { id: 'divine', minLevel: 801, maxLevel: 900, name: 'Thần Căn' },
    { id: 'extreme', minLevel: 901, maxLevel: 1000, name: 'Cực Căn' },
];
const ROOT_EFFECTIVENESS_POINTS = [[1, 0.2], [100, 20], [300, 40], [600, 60], [800, 100], [1000, 150]];
export function clampRootLevel(level) { return Math.max(1, Math.min(ROOT_LEVEL_MAX, Math.floor(Number.isFinite(level) ? level : 1))); }
export function rootGrandGrade(level) {
    const lv = clampRootLevel(level);
    return ROOT_GRAND_GRADES.find(x => lv >= x.minLevel && lv <= x.maxLevel) ?? ROOT_GRAND_GRADES[0];
}
export function rootEffectivenessPct(level) {
    const lv = clampRootLevel(level);
    for (let i = 1; i < ROOT_EFFECTIVENESS_POINTS.length; i++) {
        const [x1, y1] = ROOT_EFFECTIVENESS_POINTS[i - 1];
        const [x2, y2] = ROOT_EFFECTIVENESS_POINTS[i];
        if (lv <= x2) {
            const t = (lv - x1) / Math.max(1, x2 - x1);
            return y1 + (y2 - y1) * Math.max(0, Math.min(1, t));
        }
    }
    return 150;
}
export function unlockedRootMilestones(level) { const lv = clampRootLevel(level); return ROOT_MILESTONE_TEMPLATE.filter(x => x <= lv); }
export const ROOT_ORIGIN_IDS_V113 = {
    metal: ['origin.metal.geng', 'origin.metal.xin', 'origin.metal.black_iron', 'origin.metal.indestructible', 'origin.metal.taibai', 'origin.metal.sever_world'],
    wood: ['origin.wood.azure', 'origin.wood.longevity', 'origin.wood.wither_bloom', 'origin.wood.ancient', 'origin.wood.parasitic', 'origin.wood.myriad_life'],
    water: ['origin.water.weak', 'origin.water.vast_sea', 'origin.water.tide', 'origin.water.dark_ming', 'origin.water.mirror', 'origin.water.formless'],
    fire: ['origin.fire.fierce', 'origin.fire.yang', 'origin.fire.heart', 'origin.fire.purifying', 'origin.fire.nether', 'origin.fire.burn_heaven'],
    earth: ['origin.earth.houtu', 'origin.earth.mountain', 'origin.earth.vein', 'origin.earth.quake', 'origin.earth.wasteland', 'origin.earth.suppress_heaven'],
};
export const ROOT_ORIGIN_NAMES_V113 = {
    'origin.metal.geng': 'Canh Kim', 'origin.metal.xin': 'Tân Kim', 'origin.metal.black_iron': 'Huyền Thiết', 'origin.metal.indestructible': 'Bất Hoại Kim', 'origin.metal.taibai': 'Thái Bạch Kim', 'origin.metal.sever_world': 'Đoạn Giới Kim',
    'origin.wood.azure': 'Thanh Mộc', 'origin.wood.longevity': 'Trường Sinh Mộc', 'origin.wood.wither_bloom': 'Khô Vinh Mộc', 'origin.wood.ancient': 'Cổ Mộc', 'origin.wood.parasitic': 'Ký Sinh Mộc', 'origin.wood.myriad_life': 'Vạn Linh Mộc',
    'origin.water.weak': 'Nhược Thủy', 'origin.water.vast_sea': 'Thương Hải', 'origin.water.tide': 'Triều Tịch', 'origin.water.dark_ming': 'Huyền Minh', 'origin.water.mirror': 'Kính Thủy', 'origin.water.formless': 'Vô Hình Thủy',
    'origin.fire.fierce': 'Liệt Viêm', 'origin.fire.yang': 'Dương Viêm', 'origin.fire.heart': 'Tâm Hỏa', 'origin.fire.purifying': 'Tịnh Hỏa', 'origin.fire.nether': 'U Minh Hỏa', 'origin.fire.burn_heaven': 'Phần Thiên Hỏa',
    'origin.earth.houtu': 'Hậu Thổ', 'origin.earth.mountain': 'Sơn Nhạc Thổ', 'origin.earth.vein': 'Địa Mạch Thổ', 'origin.earth.quake': 'Chấn Thổ', 'origin.earth.wasteland': 'Hoang Thổ', 'origin.earth.suppress_heaven': 'Trấn Thiên Thổ',
};
export const ELEMENT_QUALITY_V113 = {
    common: { name: 'Phổ Chất', multiplier: 1 }, spirit: { name: 'Linh Chất', multiplier: 1.5 }, true: { name: 'Chân Chất', multiplier: 2 }, dao: { name: 'Đạo Chất', multiplier: 3 },
};
export function elementQualityMultiplier(id) { return ELEMENT_QUALITY_V113[id ?? 'common'].multiplier; }
export const BATTLE_DAO_IDS = ['sword', 'fist', 'body', 'spell', 'poison', 'artifact', 'formation', 'mind'];
export const BATTLE_DAO_NAMES = { sword: 'Kiếm', fist: 'Quyền', body: 'Thể', spell: 'Pháp', poison: 'Độc', artifact: 'Ngự Khí', formation: 'Trận', mind: 'Thần Niệm' };
export const SECONDARY_DAO_PACKAGE_STRENGTH = 0.60;
export function daoStageNameV113(value) { const v = Math.max(0, Math.min(100, value)); if (v >= 100)
    return 'Cực Đạo'; if (v >= 90)
    return 'Hợp Đạo'; if (v >= 80)
    return 'Chưởng Đạo'; if (v >= 70)
    return 'Đạo Thành'; if (v >= 60)
    return 'Nhập Đạo'; if (v >= 50)
    return 'Hóa Cảnh'; if (v >= 40)
    return 'Đại Thành'; if (v >= 30)
    return 'Tiểu Thành'; if (v >= 20)
    return 'Thuần Thục'; if (v >= 10)
    return 'Nhập Môn'; return 'Sơ Ngộ'; }
export function daoPackageStrength(state, daoId) { if (state.mainDaoId === daoId)
    return 1; if (state.secondaryDaoId === daoId)
    return SECONDARY_DAO_PACKAGE_STRENGTH; return 0; }
export const SKILL_ACTIVE_SLOT_COUNT_V113 = 5;
/** Legacy constant name retained for compatibility; UI/design term is Biến Thức. */
export const SKILL_BUILD_PASSIVE_SLOT_COUNT_V113 = 4;
export const SKILL_VARIANT_SLOT_COUNT_V118 = 4;
export const SKILL_MASTERY_MAX_V113 = 1000;
/** v1.25: old Mastery remains as a derived 0..1000 tier for save/runtime compatibility. Raw practice is 0..1,000,000. */
export const SKILL_PRACTICE_XP_MAX_V125 = 1_000_000;
export const SKILL_PRACTICE_XP_PER_TIER_V125 = 1_000;
/** Nội Uẩn is aligned to the visible proficiency stages from v1.25. */
export const SKILL_INNER_PASSIVE_MILESTONES_V113 = [100, 250, 500, 750, 1000];
export function skillInnerPassiveMilestones(mastery) { const m = Math.max(0, Math.min(SKILL_MASTERY_MAX_V113, mastery)); return SKILL_INNER_PASSIVE_MILESTONES_V113.filter(x => m >= x); }
export function diminishInnerPassivePoolPct(rawPct) { let x = Math.max(0, rawPct), out = 0; const take = (n, rate) => { const a = Math.min(x, n); out += a * rate; x -= a; }; take(25, 1); take(50, .7); take(75, .4); if (x > 0)
    out += x * .2; return out; }
export function resolveInnerPassivePool(grants, mastery) { const raw = {}; for (const g of grants) {
    if ((mastery[g.skillId] ?? 0) + 1e-9 < g.milestone)
        continue;
    raw[g.stat] = (raw[g.stat] ?? 0) + Math.max(0, g.amountPct);
} for (const k of Object.keys(raw))
    raw[k] = diminishInnerPassivePoolPct(raw[k] ?? 0); return raw; }
export const DAO_NATURE_TIER_IDS_V125 = ['mundane', 'spirit', 'mystic', 'earth', 'heaven', 'immortal', 'extreme', 'breaker'];
function blankDaoNatureTiersV125() { return Object.fromEntries(DAO_NATURE_TIER_IDS_V125.map(id => [id, { earnedPoints: 0, allocatedByBranch: {}, cultivationXp: 0 }])); }
export function createSpecializationSkillProgressionV125() { return { daoNatureCommitted: false, daoNatureTiers: blankDaoNatureTiersV125(), skillPoints: 0, skillPracticeXp: {}, skillPracticeMilestonesClaimed: {}, passiveLevels: {}, techniqueFragments: {}, restoredTechniqueIds: [], rewardedRealmOrders: [] }; }
export function cloneSpecializationSkillProgressionV125(value, legacySkillMastery = {}, legacyLearnedPassives = []) {
    const s = value ?? createSpecializationSkillProgressionV125();
    const tiers = blankDaoNatureTiersV125();
    for (const id of DAO_NATURE_TIER_IDS_V125) {
        const x = s.daoNatureTiers?.[id];
        if (x)
            tiers[id] = { earnedPoints: Math.max(0, Math.min(20, Math.floor(x.earnedPoints ?? 0))), allocatedByBranch: { ...(x.allocatedByBranch ?? {}) }, majorBranchChoice: x.majorBranchChoice, cultivationXp: Math.max(0, x.cultivationXp ?? 0) };
    }
    const xp = { ...(s.skillPracticeXp ?? {}) };
    for (const [id, m] of Object.entries(legacySkillMastery))
        if (xp[id] === undefined)
            xp[id] = Math.max(0, Math.min(SKILL_PRACTICE_XP_MAX_V125, (m ?? 0) * SKILL_PRACTICE_XP_PER_TIER_V125));
    const passiveLevels = { ...(s.passiveLevels ?? {}) };
    for (const id of legacyLearnedPassives)
        if (passiveLevels[id] === undefined)
            passiveLevels[id] = 10;
    return { daoNatureId: s.daoNatureId, daoNatureCommitted: Boolean(s.daoNatureCommitted), daoNatureCommittedRealmOrder: s.daoNatureCommittedRealmOrder, daoNatureTiers: tiers, skillPoints: Math.max(0, Math.floor(s.skillPoints ?? 0)), skillPracticeXp: xp, skillPracticeMilestonesClaimed: Object.fromEntries(Object.entries(s.skillPracticeMilestonesClaimed ?? {}).map(([id, a]) => [id, [...(a ?? [])].map(x => Math.floor(x))])), passiveLevels, skillLevelsV12317: { ...(s.skillLevelsV12317 ?? {}) }, skillGradesV12317: { ...(s.skillGradesV12317 ?? {}) }, skillGenericFragmentsV12317: Math.max(0, Math.floor(s.skillGenericFragmentsV12317 ?? 0)), skillSpecificFragmentsV12317: { ...(s.skillSpecificFragmentsV12317 ?? {}) }, heartMethodGradesV12317: { ...(s.heartMethodGradesV12317 ?? {}) }, techniqueFragments: { ...(s.techniqueFragments ?? {}) }, restoredTechniqueIds: [...new Set(s.restoredTechniqueIds ?? [])], rewardedRealmOrders: [...new Set((s.rewardedRealmOrders ?? []).map(x => Math.floor(x)))] };
}
function legacyRootUnlocks(legacyRootId) {
    const s = new Set();
    const id = legacyRootId ?? 'root.mixed';
    if (id.includes('metal'))
        s.add('metal');
    if (id.includes('wood'))
        s.add('wood');
    if (id.includes('water'))
        s.add('water');
    if (id.includes('fire'))
        s.add('fire');
    if (id.includes('earth'))
        s.add('earth');
    if (id === 'root.five_elements' || id === 'root.mixed' || s.size === 0)
        for (const x of FIVE_ELEMENT_ROOT_IDS)
            s.add(x);
    return s;
}
export function createBuildFoundationV113(legacyRootId = 'root.mixed') {
    legacyRootUnlocks(legacyRootId); // compatibility read only; v1.31 all five tracks are soft-unlocked.
    const roots = Object.fromEntries(FIVE_ELEMENT_ROOT_IDS.map(id => [id, { id, unlocked: true, level: 1, knownOriginIds: [], nourishmentXp: 0, originPity: 0 }]));
    return { version: 'build-foundation-v1.13', roots, elementQuality: { Metal: 'common', Wood: 'common', Water: 'common', Fire: 'common', Earth: 'common' }, skillRootBindingsV133: {}, battleDao: { committed: false, currentLifeDaoHanh: {}, bestDaoHanhEver: {}, natureTags: [] }, skillMastery: {}, learnedDaoPassiveIdsV118: [], unlockedVariantIdsV119: [], techniqueTrueMeaningIdsV119: [], progressionV125: createSpecializationSkillProgressionV125(), skillLoadout: { activeSkillIds: [], buildPassiveIds: [] }, techniqueLoadout: {} };
}
export function cloneBuildFoundationV113(value, legacyRootId = 'root.mixed') {
    const s = value ?? createBuildFoundationV113(legacyRootId);
    const fallback = createBuildFoundationV113(legacyRootId);
    const roots = Object.fromEntries(FIVE_ELEMENT_ROOT_IDS.map(id => { const r = s.roots?.[id] ?? fallback.roots[id]; return [id, { ...r, id, unlocked: true, level: clampRootLevel(r.level), knownOriginIds: [...(r.knownOriginIds ?? [])], nourishmentXp: Math.max(0, Number(r.nourishmentXp ?? 0) || 0), originPity: Math.max(0, Math.floor(Number(r.originPity ?? 0) || 0)) }]; }));
    return { version: 'build-foundation-v1.13', roots, elementQuality: { ...(s.elementQuality ?? {}) }, rootFocusId: s.rootFocusId, skillRootBindingsV133: { ...(s.skillRootBindingsV133 ?? {}) }, battleDao: { committed: Boolean(s.battleDao?.committed), mainDaoId: s.battleDao?.mainDaoId, secondaryDaoId: s.battleDao?.secondaryDaoId, currentLifeDaoHanh: { ...(s.battleDao?.currentLifeDaoHanh ?? {}) }, bestDaoHanhEver: { ...(s.battleDao?.bestDaoHanhEver ?? {}) }, natureTags: [...(s.battleDao?.natureTags ?? [])] }, skillMastery: { ...(s.skillMastery ?? {}) }, learnedDaoPassiveIdsV118: [...(s.learnedDaoPassiveIdsV118 ?? [])], unlockedVariantIdsV119: [...(s.unlockedVariantIdsV119 ?? [])], techniqueTrueMeaningIdsV119: [...(s.techniqueTrueMeaningIdsV119 ?? [])], progressionV125: cloneSpecializationSkillProgressionV125(s.progressionV125, s.skillMastery ?? {}, s.learnedDaoPassiveIdsV118 ?? []), skillLoadout: { basicSkillId: s.skillLoadout?.basicSkillId, activeSkillIds: [...(s.skillLoadout?.activeSkillIds ?? [])].slice(0, SKILL_ACTIVE_SLOT_COUNT_V113), ultimateSkillId: s.skillLoadout?.ultimateSkillId, buildPassiveIds: [...(s.skillLoadout?.buildPassiveIds ?? [])].slice(0, SKILL_BUILD_PASSIVE_SLOT_COUNT_V113) }, techniqueLoadout: { ...(s.techniqueLoadout ?? {}) } };
}
export function validateSkillLoadoutV113(loadout) { if (new Set(loadout.activeSkillIds).size !== loadout.activeSkillIds.length)
    throw new Error('Active skill loadout contains duplicates.'); if (loadout.activeSkillIds.length > SKILL_ACTIVE_SLOT_COUNT_V113)
    throw new Error(`V1.13 allows at most ${SKILL_ACTIVE_SLOT_COUNT_V113} active skills.`); if (new Set(loadout.buildPassiveIds).size !== loadout.buildPassiveIds.length)
    throw new Error('Biến Thức loadout contains duplicates.'); if (loadout.buildPassiveIds.length > SKILL_VARIANT_SLOT_COUNT_V118)
    throw new Error(`Chỉ được trang bị tối đa ${SKILL_VARIANT_SLOT_COUNT_V118} Biến Thức.`); }
export function learnDaoPassiveV118(state, passiveId) { const arr = state.learnedDaoPassiveIdsV118 ?? (state.learnedDaoPassiveIdsV118 = []); if (!arr.includes(passiveId))
    arr.push(passiveId); }
export function unlockSkillVariantV119(state, variantId) { const arr = state.unlockedVariantIdsV119 ?? (state.unlockedVariantIdsV119 = []); if (!arr.includes(variantId))
    arr.push(variantId); }
export function unlockTechniqueTrueMeaningV119(state, trueMeaningId) { const arr = state.techniqueTrueMeaningIdsV119 ?? (state.techniqueTrueMeaningIdsV119 = []); if (!arr.includes(trueMeaningId))
    arr.push(trueMeaningId); }
export function setSkillVariantsV118(state, variantIds) { if (new Set(variantIds).size !== variantIds.length)
    throw new Error('Biến Thức không được trùng.'); if (variantIds.length > SKILL_VARIANT_SLOT_COUNT_V118)
    throw new Error(`Chỉ được trang bị tối đa ${SKILL_VARIANT_SLOT_COUNT_V118} Biến Thức.`); const known = state.unlockedVariantIdsV119 ?? []; for (const id of variantIds)
    if (known.length > 0 && !known.includes(id))
        throw new Error(`Chưa lĩnh ngộ Biến Thức: ${id}`); state.skillLoadout.buildPassiveIds = [...variantIds]; }
export function setRootLevelV113(state, id, level) { const track = state.roots[id]; track.unlocked = true; track.level = clampRootLevel(level); }
export function unlockRootOriginV113(state, id, originId) { if (!ROOT_ORIGIN_IDS_V113[id].includes(originId))
    throw new Error(`${originId} is not a ${id} Căn Nguyên.`); const t = state.roots[id]; t.unlocked = true; if (!t.knownOriginIds.includes(originId))
    t.knownOriginIds.push(originId); }
export function activateRootOriginV113(state, id, originId) { unlockRootOriginV113(state, id, originId); state.roots[id].activeOriginId = originId; }
export function setBattleDaosV113(state, main, secondary, commit = true) { if (secondary === main)
    throw new Error('Chủ Đạo và Phụ Đạo phải khác nhau.'); if (state.battleDao.committed && (state.battleDao.mainDaoId !== main || state.battleDao.secondaryDaoId !== secondary))
    throw new Error('Đã Định Đạo trong đời hiện tại; chỉ Luân Hồi mới được chọn lại.'); state.battleDao.mainDaoId = main; state.battleDao.secondaryDaoId = secondary; state.battleDao.committed = commit; }
export function gainBattleDaoHanhV113(state, daoId, baseGain) { const strength = daoPackageStrength(state.battleDao, daoId); if (strength <= 0)
    return 0; const before = Math.max(0, Math.min(100, state.battleDao.currentLifeDaoHanh[daoId] ?? 0)); const after = Math.min(100, before + Math.max(0, baseGain) * strength); state.battleDao.currentLifeDaoHanh[daoId] = after; state.battleDao.bestDaoHanhEver[daoId] = Math.max(state.battleDao.bestDaoHanhEver[daoId] ?? 0, after); return after - before; }
export function gainSkillMasteryV113(state, skillId, amount) { const before = Math.max(0, Math.min(SKILL_MASTERY_MAX_V113, state.skillMastery[skillId] ?? 0)); const after = Math.min(SKILL_MASTERY_MAX_V113, before + Math.max(0, amount)); state.skillMastery[skillId] = after; const p = state.progressionV125 ?? (state.progressionV125 = createSpecializationSkillProgressionV125()); p.skillPracticeXp[skillId] = Math.max(p.skillPracticeXp[skillId] ?? 0, after * SKILL_PRACTICE_XP_PER_TIER_V125); return after - before; }
export function inheritBuildFoundationOnReincarnationV113(previous, legacyRootId = 'root.mixed') { const next = cloneBuildFoundationV113(previous, legacyRootId); const best = { ...next.battleDao.bestDaoHanhEver }; const inherited = {}; for (const id of BATTLE_DAO_IDS) {
    const b = Math.max(0, Math.min(100, best[id] ?? 0));
    if (b > 0)
        inherited[id] = Math.min(20, b * .20);
} next.battleDao = { committed: false, currentLifeDaoHanh: inherited, bestDaoHanhEver: best, natureTags: [] }; next.skillLoadout = { activeSkillIds: [], buildPassiveIds: [] }; const p = cloneSpecializationSkillProgressionV125(next.progressionV125, next.skillMastery, next.learnedDaoPassiveIdsV118 ?? []); p.daoNatureId = undefined; p.daoNatureCommitted = false; p.daoNatureCommittedRealmOrder = undefined; p.daoNatureTiers = blankDaoNatureTiersV125(); next.progressionV125 = p; return next; }
//# sourceMappingURL=build-foundation-v113.js.map