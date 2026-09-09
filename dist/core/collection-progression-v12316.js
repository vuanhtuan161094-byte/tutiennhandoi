import { SeededRng } from './rng.js';
import { cloneWorkshopProductionV12328 } from './workshop-production-v12328.js';
import { SPIRIT_BEAST_SPECIES_V86, SPIRIT_BEAST_MAX_BLOODLINE_V86, migrateSpiritBeastsV86, spiritBeastBondSummaryV86, spiritBeastCombatTriggersV86, spiritBeastLevelCapV86 } from './spirit-beast-v86.js';
import { CONFIDANTS_V87, CONFIDANT_MAX_INTIMACY_V87, CONFIDANT_MAX_FATE_V87, migrateConfidantsV87, confidantCombatTriggersV87, confidantViewV87, confidantFortuneSummaryV87, confidantIntimacyCostV87, confidantFateCostV87, activeConfidantSpecialtyV87 } from './confidant-v87.js';
import { ARTIFACTS_V88, ARTIFACT_MAX_REFINEMENT_V88, artifactRefinementCostV88, artifactGradeCostV88, migrateArtifactsV88, artifactViewV88, artifactFortuneSummaryV88, applyArtifactsV88ToEntity, equipArtifactSlotV88 } from './artifact-v88.js';
import { MANUAL_LEVEL_MAX_V127, MANUAL_ADVANCE_MAX_V127, buildManualCatalogV127, manualEffectMultiplierV127, manualStrengthenCostV127, manualAdvanceCostV127, manualCanStrengthenV127, manualCanAdvanceV127, migrateManualProgressV127 } from './manual-progression-v127.js';
import { combineStatPctV129 } from './combat-rules.js';
export const COLLECTION_SCHEMA_V12316 = 'collection-progression.v12316';
const GRADE_ORDER = ['mundane', 'spirit', 'mystic', 'earth', 'heaven', 'immortal', 'extreme', 'breaker'];
export const COLLECTION_GRADE_LABEL_V12316 = { mundane: 'Phàm', spirit: 'Linh', mystic: 'Huyền', earth: 'Địa', heaven: 'Thiên', immortal: 'Tiên', extreme: 'Cực', breaker: 'Phá' };
const CATEGORY_LABEL = { manual: 'Công Pháp', artifact: 'Pháp Bảo', pet: 'Thú Sủng', companion: 'Tri Kỷ' };
const GENERIC_FRAGMENT_NAME = { manual: 'Tàn Ý Công Pháp', artifact: 'Tinh Hoa Pháp Bảo', pet: 'Linh Thú Tinh Phách', companion: 'Đồng Tâm Ngọc' };
// V88: generic collection assist retired. Artifact combat is authored in artifact-v88.ts.
function buildCatalog() {
    const out = [];
    out.push(...buildManualCatalogV127());
    ARTIFACTS_V88.forEach(d => out.push({ id: d.id, category: 'artifact', name: d.name, grade: d.grade, description: `${d.role} · ${d.description}`, stats: [] }));
    SPIRIT_BEAST_SPECIES_V86.forEach(beast => out.push({ id: beast.id, category: 'pet', name: beast.name, grade: beast.grade, description: `${beast.description} · ${beast.roleLabel}.`, stats: [] }));
    CONFIDANTS_V87.forEach(d => out.push({ id: d.id, category: 'companion', name: d.name, grade: d.grade, description: `${d.title} · ${d.specialty.name}. Thân Mật/Duyên quyết định Trợ Chiến, Hộ Đạo và Tâm Ý.`, stats: [] }));
    return out;
}
export const COLLECTION_CATALOG_V12316 = buildCatalog();
const BY_ID = new Map(COLLECTION_CATALOG_V12316.map(x => [x.id, x]));
export function collectionDefinitionV12316(id) { const d = BY_ID.get(id); if (!d)
    throw new Error(`Không có vật phẩm sưu tập: ${id}`); return d; }
export function collectionCatalogV12316(category) { return COLLECTION_CATALOG_V12316.filter(x => !category || x.category === category); }
export function createCollectionProgressStateV12316() {
    return { schema: COLLECTION_SCHEMA_V12316, manualV127Migrated: true, manualV127MigrationVersion: 2, currencies: { immortalJade: 0, boundImmortalJade: 1600 }, genericFragments: { manual: 180, artifact: 80, pet: 80, companion: 80 }, items: {}, activeArtifactIds: [], manualTreeV127: {}, gacha: { manual: { pulls: 0, pity: 0 }, artifact: { pulls: 0, pity: 0 }, pet: { pulls: 0, pity: 0 }, companion: { pulls: 0, pity: 0 } }, cave: { level: 1, facilities: [{ id: 'alchemy', level: 1 }, { id: 'forge', level: 1 }, { id: 'artifact', level: 1 }, { id: 'beast', level: 1 }, { id: 'companion', level: 1 }, { id: 'scripture', level: 1 }, { id: 'bloodline', level: 1 }, { id: 'physique', level: 1 }] }, daily: { dayKey: '', clearedIds: [] } };
}
export function cloneCollectionProgressStateV12316(state) {
    const s = state ?? createCollectionProgressStateV12316();
    const out = { schema: COLLECTION_SCHEMA_V12316, manualTreeV127: { ...(s.manualTreeV127 ?? {}) }, currencies: { ...s.currencies }, genericFragments: { ...s.genericFragments }, items: Object.fromEntries(Object.entries(s.items).map(([k, v]) => [k, { ...v }])), activeArtifactIds: [...(s.activeArtifactIds ?? [])], activePetId: s.activePetId, activeCompanionId: s.activeCompanionId, gacha: { manual: { ...s.gacha.manual }, artifact: { ...s.gacha.artifact }, pet: { ...s.gacha.pet }, companion: { ...s.gacha.companion } }, cave: { level: s.cave.level, facilities: s.cave.facilities.map(x => ({ ...x })) }, daily: { dayKey: s.daily.dayKey, clearedIds: [...s.daily.clearedIds] } };
    if (s.manualV127Migrated)
        out.manualV127Migrated = true;
    if (s.manualV127MigrationVersion !== undefined)
        out.manualV127MigrationVersion = Number(s.manualV127MigrationVersion);
    migrateManualProgressV127(out);
    if (s.artifactV88Migrated)
        out.artifactV88Migrated = true;
    if (s.economyV12325?.relicV88Migrated && out.economyV12325)
        out.economyV12325.relicV88Migrated = true;
    const v89 = s.economyV89;
    if (v89)
        out.economyV89 = structuredClone(v89);
    const w28 = s.workshopV12328;
    if (w28)
        out.workshopV12328 = cloneWorkshopProductionV12328(w28);
    const e = s.economyV12325;
    if (e)
        out.economyV12325 = { ...e, genericFragments: { ...e.genericFragments }, ascensionEssence: { ...e.ascensionEssence }, extraItems: Object.fromEntries(Object.entries(e.extraItems ?? {}).map(([k, v]) => [k, { ...v }])), tracks: Object.fromEntries(Object.entries(e.tracks ?? {}).map(([k, v]) => [k, { ...v }])), history: (e.history ?? []).map((x) => ({ ...x })), daily: { dayKey: e.daily?.dayKey ?? '', clearedIds: [...(e.daily?.clearedIds ?? [])] } };
    if (e?.relicV88Migrated && out.economyV12325)
        out.economyV12325.relicV88Migrated = true;
    const e26 = s.economyV12326;
    if (e26)
        out.economyV12326 = { ...e26, manualBanner: { ...(e26.manualBanner ?? { realmStageIndex:null, orientationId:'', orientationGuaranteed:false }) }, tracks: Object.fromEntries(Object.entries(e26.tracks ?? {}).map(([k, v]) => [k, { ...v }])), history: (e26.history ?? []).map((x) => ({ ...x })), originItems: Object.fromEntries(Object.entries(e26.originItems ?? {}).map(([k, v]) => [k, { ...v }])), daily: { dayKey: e26.daily?.dayKey ?? '', clearedIds: [...(e26.daily?.clearedIds ?? [])] } };
    return out;
}
export function ensureCollectionProgressStateV12316(container) {
    const state = container.collectionV12316 ?? (container.collectionV12316 = createCollectionProgressStateV12316());
    const required = ['alchemy', 'forge', 'artifact', 'beast', 'companion', 'scripture', 'bloodline', 'physique'];
    state.cave ??= { level: 1, facilities: [] };
    state.cave.facilities ??= [];
    for (const id of required)
        if (!state.cave.facilities.some(x => x.id === id))
            state.cave.facilities.push({ id, level: 1 });
    migrateManualProgressV127(state);
    migrateSpiritBeastsV86(state);
    migrateConfidantsV87(state);
    migrateConfidantsV148(state);
    migrateArtifactsV88(state);
    return state;
}
function itemMultiplier(p) { return (1 + (Math.max(1, p.level) - 1) * .035) * (1 + Math.max(0, p.advance) * .18); }
export function collectionStrengthenCostV12316(p) { return Math.max(5, Math.floor(8 + p.level * 2.4 + p.advance * 4)); }
export function caveFacilityLevelV99(state, facilityId) { return Math.max(1, Math.min(10, Math.floor(state?.cave?.facilities?.find(x => x.id === facilityId)?.level ?? 1))); }
export function caveFacilityDiscountPctV99(state, facilityId) { return Math.min(18, Math.max(0, caveFacilityLevelV99(state, facilityId) - 1) * 2); }
export function caveFacilityCostMultiplierV99(state, facilityId) { return 1 - caveFacilityDiscountPctV99(state, facilityId) / 100; }
export function facilityDiscountedCostV99(state, facilityId, cost) { return Math.max(1, Math.round(Math.max(0, cost) * caveFacilityCostMultiplierV99(state, facilityId))); }
export function collectionAdvanceCostV12316(p) { return [20, 35, 60, 100, 160, 240][Math.max(0, p.advance)] ?? Infinity; }
function grantCollectionItemV12316LegacyV146(state, id, fragmentAmount) {
    const def = collectionDefinitionV12316(id);
    const p = state.items[id] ?? (state.items[id] = { owned: false, level: 1, advance: 0, specificFragments: 0 });
    const first = !p.owned;
    p.owned = true;
    if (!first)
        p.specificFragments += Math.max(1, fragmentAmount ?? duplicateFragmentYield(def.grade));
    return { first, progress: { ...p }, definition: def };
}
function duplicateFragmentYield(grade) { return { mundane: 8, spirit: 10, mystic: 14, earth: 20, heaven: 28, immortal: 40, extreme: 60, breaker: 90 }[grade]; }
function strengthenCollectionItemV12316LegacyV146(state, id, levels = 1) {
    const def = collectionDefinitionV12316(id), p = state.items[id];
    if (!p?.owned)
        throw new Error(`Chưa sở hữu ${def.name}.`);
    const levelCap = def.category === 'artifact' ? ARTIFACT_MAX_REFINEMENT_V88 : def.category === 'pet' ? spiritBeastLevelCapV86(state) : def.category === 'companion' ? CONFIDANT_MAX_INTIMACY_V87 : def.category === 'manual' ? MANUAL_LEVEL_MAX_V127 : 50;
    let done = 0, cost = 0;
    for (let i = 0; i < Math.max(1, Math.floor(levels)); i++) {
        if (p.level >= levelCap)
            break;
        if (def.category === 'manual' && !manualCanStrengthenV127(p))
            break;
        let c = def.category === 'artifact' ? artifactRefinementCostV88(p) : def.category === 'companion' ? confidantIntimacyCostV87(p) : def.category === 'manual' ? manualStrengthenCostV127(def, p, state.manualTreeV127 ?? {}) : collectionStrengthenCostV12316(p);
        if (def.category === 'manual')
            c = facilityDiscountedCostV99(state, 'scripture', c);
        if (def.category === 'companion')
            c = facilityDiscountedCostV99(state, 'companion', c);
        const specialty = activeConfidantSpecialtyV87(state);
        if (def.category === 'pet' && specialty?.unlocked && specialty.id === 'spiritBeast')
            c = Math.max(1, Math.ceil(c * (1 - specialty.strengthPct / 100)));
        if (def.category !== 'companion' && specialty?.unlocked && specialty.id === 'resource')
            c = Math.max(1, Math.ceil(c * (1 - specialty.strengthPct / 100)));
        if (state.genericFragments[def.category] < c)
            break;
        state.genericFragments[def.category] -= c;
        p.level += 1;
        cost += c;
        done += 1;
    }
    if (done <= 0)
        throw new Error(`Không đủ ${GENERIC_FRAGMENT_NAME[def.category]} hoặc đã đạt ${def.category === 'companion' ? `Thân Mật ${levelCap}` : `Lv${levelCap}`}.`);
    return { definition: def, levels: done, cost, levelCap, progress: { ...p } };
}
function advanceCollectionItemV12316LegacyV146(state, id) {
    const def = collectionDefinitionV12316(id), p = state.items[id];
    if (!p?.owned)
        throw new Error(`Chưa sở hữu ${def.name}.`);
    const maxAdvance = def.category === 'artifact' ? 4 : def.category === 'pet' ? SPIRIT_BEAST_MAX_BLOODLINE_V86 : def.category === 'companion' ? CONFIDANT_MAX_FATE_V87 - 1 : def.category === 'manual' ? MANUAL_ADVANCE_MAX_V127 : 6;
    if (p.advance >= maxAdvance)
        throw new Error(`${def.name} đã ${def.category === 'pet' ? 'đạt Huyết Mạch tối đa' : def.category === 'companion' ? 'đạt Duyên V' : def.category === 'artifact' ? 'đạt Bảo Giai V' : 'tiến giai tối đa'}.`);
    if (def.category === 'manual' && !manualCanAdvanceV127(p))
        throw new Error(`${def.name} chưa đạt mốc Lv${(p.advance + 1) * 100} để Đột Phá Công Pháp.`);
    const cost = def.category === 'artifact' ? artifactGradeCostV88(p) : def.category === 'companion' ? confidantFateCostV87(p) : def.category === 'manual' ? manualAdvanceCostV127(def, p) : collectionAdvanceCostV12316(p);
    if (p.specificFragments < cost)
        throw new Error(`Thiếu mảnh riêng ${def.name}: cần ${cost}, có ${p.specificFragments}.`);
    p.specificFragments -= cost;
    p.advance += 1;
    return { definition: def, cost, progress: { ...p } };
}
export function equipCollectionItemV12316(state, id, artifactCapacity = 2) {
    const def = collectionDefinitionV12316(id), p = state.items[id];
    if (!p?.owned)
        throw new Error(`Chưa sở hữu ${def.name}.`);
    if (def.category === 'artifact') {
        equipArtifactSlotV88(state, id, artifactCapacity);
    }
    else if (def.category === 'pet')
        state.activePetId = id;
    else if (def.category === 'companion')
        state.activeCompanionId = id;
    else
        throw new Error('Công Pháp sưu tập luôn có hiệu lực, không cần trang bị.');
}
export function unequipCollectionItemV12316(state, id) { const def = collectionDefinitionV12316(id); if (def.category === 'artifact')
    state.activeArtifactIds = state.activeArtifactIds.filter(x => x !== id);
else if (def.category === 'pet' && state.activePetId === id)
    state.activePetId = undefined;
else if (def.category === 'companion' && state.activeCompanionId === id)
    state.activeCompanionId = undefined; }
function gradeRoll(rng, pity) {
    if (pity >= 59)
        return 'immortal';
    const r = rng.next();
    if (r < .002)
        return 'breaker';
    if (r < .012)
        return 'extreme';
    if (r < .065)
        return 'immortal';
    if (r < .19)
        return 'heaven';
    if (r < .42)
        return 'earth';
    if (r < .68)
        return 'mystic';
    if (r < .88)
        return 'spirit';
    return 'mundane';
}
function pickGradeCandidate(rng, category, grade) { const pool = collectionCatalogV12316(category).filter(x => x.grade === grade); const fallback = collectionCatalogV12316(category); return (pool.length ? pool : fallback)[Math.floor(rng.next() * (pool.length ? pool.length : fallback.length))]; }
export function gachaCollectionV12316(state, category, count, seed, usePremium = false) {
    count = Math.max(1, Math.min(10, Math.floor(count)));
    const cost = count === 10 ? 1440 : 160 * count;
    const key = usePremium ? 'immortalJade' : 'boundImmortalJade';
    if (state.currencies[key] < cost)
        throw new Error(`Không đủ ${usePremium ? 'Tiên Ngọc' : 'Tiên Ngọc Khóa'}: cần ${cost}.`);
    state.currencies[key] -= cost;
    const track = state.gacha[category], rng = new SeededRng(seed >>> 0), results = [];
    for (let i = 0; i < count; i++) {
        const grade = gradeRoll(rng, track.pity), def = pickGradeCandidate(rng, category, grade);
        const before = state.items[def.id]?.specificFragments ?? 0;
        const grant = grantCollectionItemV12316(state, def.id);
        const after = grant.progress.specificFragments;
        track.pulls += 1;
        track.pity = grade === 'immortal' || grade === 'extreme' || grade === 'breaker' ? 0 : track.pity + 1;
        results.push({ id: def.id, name: def.name, grade: def.grade, first: grant.first, fragments: Math.max(0, after - before) });
    }
    return { category, cost, currency: key, results, pulls: track.pulls, pity: track.pity };
}
function addStat(total, line, mult) { total[line.id] = (total[line.id] ?? 0) + line.value * mult; }
function manualTree(state) { return { ...(state?.manualTreeV127 ?? {}) }; }
function manualCompletedRealmStagesV127(state) {
    const completed = new Set();
    for (let realm = 0; realm < 29; realm++) {
        let ok = true;
        for (let slot = 1; slot <= 9; slot++) {
            const p = state.items[`manual.${realm * 9 + slot}`];
            if (!p?.owned || p.level < 1000 || p.advance < 10) { ok = false; break; }
        }
        if (ok) completed.add(realm);
    }
    return completed;
}
function manualLineTreeMultiplier(lineId, tree) {
    if (['attackFlat','powerPct'].includes(lineId)) return 1 + Math.max(0, tree.offenseBaseEffectPct ?? 0) / 100;
    if (['physiqueFlat','hpFlat','hpPct','defenseFlat','defensePct'].includes(lineId)) return 1 + Math.max(0, tree.defenseBaseEffectPct ?? 0) / 100;
    if (['critPct','critDamagePct','heartPct','heartDamagePct','armorPenPct','breakEffectPct'].includes(lineId)) return 1 + Math.max(0, tree.offenseSecondaryEffectPct ?? 0) / 100;
    if (['damageReductionPct','dodgePct','controlResistPct','healingPct','shieldPct'].includes(lineId)) return 1 + Math.max(0, tree.defenseSecondaryEffectPct ?? 0) / 100;
    return 1;
}
export function syncCollectionManualTreeV127(state, treeModifiers = {}) { if (state) state.manualTreeV127 = { ...treeModifiers }; return state; }
export function collectionStatSummaryV12316(state) {
    const total = { attackFlat:0, powerPct:0, physiqueFlat:0, bodyPct:0, hpFlat:0, hpPct:0, defenseFlat:0, defensePct:0, damageReductionPct:0, critPct:0, critDamagePct:0, heartPct:0, heartDamagePct:0, armorPenPct:0, breakEffectPct:0, accuracyPct:0, dodgePct:0, controlPct:0, controlResistPct:0, healingPct:0, shieldPct:0, actionSpeedPct:0, cultivationFlatPer15s:0, lootPct:0 };
    if (!state) return total;
    const tree = manualTree(state), completed = manualCompletedRealmStagesV127(state);
    for (const [id, p] of Object.entries(state.items)) {
        if (!p.owned) continue;
        const d = BY_ID.get(id);
        if (!d || d.category !== 'manual') continue;
        const group = completed.has(d.realmStageIndex) ? 1.20 + Math.max(0, Math.min(30, tree.nineUnityBonusPct ?? 0)) / 100 : 1;
        const effect = manualEffectMultiplierV127(p, tree) * group;
        for (const line of d.stats) addStat(total, line, effect * manualLineTreeMultiplier(line.id, tree));
    }
    const bond = spiritBeastBondSummaryV86(state);
    // V147: every owned beast contributes raw stats; only activePetId contributes percentage Linh Khế.
    total.attackFlat += bond.attackFlat ?? 0;
    total.hpFlat += bond.hpFlat ?? 0;
    total.defenseFlat += bond.defenseFlat ?? 0;
    total.powerPct += bond.powerPct;
    total.bodyPct += bond.bodyPct;
    total.defensePct += bond.defensePct;
    // V148: all owned Tri Kỷ contribute raw account progression only; no collection-wide percentage inflation.
    const confidantFortuneV148 = confidantFortuneSummaryV148(state);
    total.cultivationFlatPer15s += Math.max(0, Number(confidantFortuneV148.cultivationFlatPer15s)||0);
    const active = [...state.activeArtifactIds];
    for (const id of active) {
        const p = state.items[id], d = BY_ID.get(id);
        if (!p?.owned || !d) continue;
        for (const line of d.stats) addStat(total, line, itemMultiplier(p));
    }
    return Object.fromEntries(Object.entries(total).map(([k,v])=>[k,Number(v.toFixed(6))]));
}
export function collectionCompletedManualRealmsV127(state) { return manualCompletedRealmStagesV127(state).size; }
export function collectionManualCultivationPer15sV127(state) {
    if (!state) return 0;
    const b = collectionStatSummaryV12316(state), tree = manualTree(state), manualBoost = 1 + Math.max(0, Math.min(100, tree.cultivationGainPct ?? 0)) / 100;
    const completed = manualCompletedRealmStagesV127(state).size;
    const global = 1 + completed * (2 + Math.max(0, Math.min(1, tree.completedRealmCultivationBonusPct ?? 0))) / 100;
    return Math.max(0, b.cultivationFlatPer15s * manualBoost * global);
}
export function applyCollectionToEntityV12316(base, state) {
    if (!state) return base;
    const b = collectionStatSummaryV12316(state), stats = { ...base.stats };
    stats.attack = Math.max(1, (stats.attack + b.attackFlat) * (1 + b.powerPct / 100));
    const oldPhysique = typeof stats.physique === 'number' ? stats.physique : Math.max(1, stats.maxHp / 20);
    stats.physique = Math.max(1, (oldPhysique + b.physiqueFlat) * (1 + b.bodyPct / 100));
    stats.maxHp = Math.max(1, (Math.max(stats.maxHp, stats.physique * 20) + b.hpFlat) * (1 + b.hpPct / 100));
    stats.defense = Math.max(0, (stats.defense + b.defenseFlat) * (1 + b.defensePct / 100));
    stats.critChancePct = (stats.critChancePct ?? 0) + b.critPct;
    stats.critDamagePct = (stats.critDamagePct ?? 0) + b.critDamagePct;
    stats.heartChancePct = combineStatPctV129('heartChancePct', stats.heartChancePct ?? 0, b.heartPct);
    stats.heartDamagePct = (stats.heartDamagePct ?? 0) + b.heartDamagePct;
    stats.armorPenPct = combineStatPctV129('armorPenPct', stats.armorPenPct ?? 0, b.armorPenPct);
    stats.damageReductionPct = combineStatPctV129('damageReductionPct', stats.damageReductionPct ?? 0, b.damageReductionPct);
    stats.dodgeChancePct = combineStatPctV129('dodgeChancePct', stats.dodgeChancePct ?? 0, b.dodgePct);
    stats.accuracy = Math.max(1, (stats.accuracy ?? 1) * (1 + b.accuracyPct / 100));
    stats.controlPower = Math.max(0, (stats.controlPower ?? 0) * (1 + b.controlPct / 100));
    stats.controlDurationReductionPct = combineStatPctV129('controlDurationReductionPct', stats.controlDurationReductionPct ?? 0, b.controlResistPct);
    stats.healingEffectivenessPct = (stats.healingEffectivenessPct ?? 0) + b.healingPct;
    stats.breakEffectPct = (stats.breakEffectPct ?? 0) + b.breakEffectPct;
    stats.shieldEffectPct = (stats.shieldEffectPct ?? 0) + b.shieldPct;
    stats.actionSpeed = Math.max(0.01, (stats.actionSpeed ?? 1) * (1 + b.actionSpeedPct / 100));
    let enriched = { ...base, tags: [...new Set([...base.tags, 'CollectionV12316', 'ManualV127', 'SpiritBeastV86', 'ConfidantV148', 'ArtifactV88'])], stats, triggers: [...(base.triggers ?? []), ...spiritBeastCombatTriggersV86(state), ...confidantCombatTriggersV148(state)] };
    enriched = applyArtifactsV88ToEntity(enriched, state);
    return enriched;
}
export function collectionCultivationMultiplierV12316(state) {
    if (!state) return 1;
    // V148 Phúc Duyên is raw. Only active Lạc Dao may provide the bounded cultivation specialty %.
    const specialty = activeConfidantSpecialtyV148(state), specialtyPct = specialty?.unlocked && specialty.id === 'cultivation' ? specialty.strengthPct : 0;
    const tree = manualTree(state), completed = manualCompletedRealmStagesV127(state).size;
    const completePct = completed * (2 + Math.max(0, Math.min(1, tree.completedRealmCultivationBonusPct ?? 0)));
    return 1 + (specialtyPct + completePct) / 100;
}
export function collectionConfidantV87Summary(state) { migrateConfidantsV148(state); return { schema:'confidant.v148', fortune: confidantFortuneSummaryV148(state), activeSpecialty: activeConfidantSpecialtyV148(state) }; }
export const DAILY_DUNGEONS_V12316 = [
    { id: 'daily.manual', name: 'Tàng Kinh Bí Cảnh', openDays: [1, 4], description: 'Legacy tài nguyên Công Pháp; V89 không mint Tiên Ngọc Khóa từ endpoint cũ.', reward: { boundJade: 0, genericCategory: 'manual', genericFragments: 45, specificPulls: 1 } },
    { id: 'daily.artifact', name: 'Vạn Bảo Các', openDays: [2, 5], description: 'Legacy tài nguyên Pháp Bảo; V89 không mint Tiên Ngọc Khóa từ endpoint cũ.', reward: { boundJade: 0, genericCategory: 'artifact', genericFragments: 30, specificPulls: 1 } },
    { id: 'daily.pet', name: 'Vạn Thú Cốc', openDays: [3, 6], description: 'Legacy tài nguyên Linh Thú; V89 không mint Tiên Ngọc Khóa từ endpoint cũ.', reward: { boundJade: 0, genericCategory: 'pet', genericFragments: 30, specificPulls: 1 } },
    { id: 'daily.companion', name: 'Hồng Trần Mộng Cảnh', openDays: [0, 3], description: 'Legacy tài nguyên Tri Kỷ; V89 không mint Tiên Ngọc Khóa từ endpoint cũ.', reward: { boundJade: 0, genericCategory: 'companion', genericFragments: 30, specificPulls: 1 } },
    { id: 'daily.all', name: 'Thiên Ngoại Di Tích', openDays: [0, 6], description: 'Legacy tài nguyên tổng hợp; V89 không mint Tiên Ngọc Khóa từ endpoint cũ.', reward: { boundJade: 0, genericCategory: 'manual', genericFragments: 35, specificPulls: 2 } },
];
export function vietnamDayKeyV12316(nowUnixMs = Date.now()) { const shifted = new Date(nowUnixMs + 7 * 3600_000); return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`; }
export function vietnamWeekdayV12316(nowUnixMs = Date.now()) { return new Date(nowUnixMs + 7 * 3600_000).getUTCDay(); }
function syncDaily(state, now) { const key = vietnamDayKeyV12316(now); if (state.daily.dayKey !== key)
    state.daily = { dayKey: key, clearedIds: [] }; }
export function dailyDungeonSummaryV12316(state, now = Date.now()) { const wd = vietnamWeekdayV12316(now), key = vietnamDayKeyV12316(now), cleared = state.daily.dayKey === key ? state.daily.clearedIds : []; return DAILY_DUNGEONS_V12316.map(d => ({ ...d, open: d.openDays.includes(wd), cleared: cleared.includes(d.id) })); }
export function clearDailyDungeonV12316(state, id, seed, now = Date.now()) {
    syncDaily(state, now);
    const d = DAILY_DUNGEONS_V12316.find(x => x.id === id);
    if (!d)
        throw new Error('Phó bản ngày không tồn tại.');
    if (!d.openDays.includes(vietnamWeekdayV12316(now)))
        throw new Error(`${d.name} hôm nay không mở.`);
    if (state.daily.clearedIds.includes(id))
        throw new Error(`${d.name} hôm nay đã nhận thưởng.`);
    state.daily.clearedIds.push(id);
    state.currencies.boundImmortalJade += d.reward.boundJade;
    state.genericFragments[d.reward.genericCategory] += d.reward.genericFragments;
    const drops = [`${GENERIC_FRAGMENT_NAME[d.reward.genericCategory]} +${d.reward.genericFragments}`];
    return { dungeon: d, boundJade: d.reward.boundJade, genericFragments: d.reward.genericFragments, drops };
}
export function caveFacilityUpgradeCostV12316(level) { return { spiritStone: Math.round(10 * Math.pow(1.65, Math.max(0, level - 1))), boundJade: Math.round(20 * Math.pow(1.35, Math.max(0, level - 1))) }; }
export function upgradeCaveFacilityV12316(state, facilityId, inventory) { const f = state.cave.facilities.find(x => x.id === facilityId); if (!f)
    throw new Error('Công trình Động Phủ không tồn tại.'); if (f.level >= 10)
    throw new Error('Công trình đã Lv10.'); const c = caveFacilityUpgradeCostV12316(f.level); if ((inventory['resource.spirit_stone'] ?? 0) < c.spiritStone)
    throw new Error(`Thiếu Linh Thạch: cần ${c.spiritStone}.`); if (state.currencies.boundImmortalJade < c.boundJade)
    throw new Error(`Thiếu Tiên Ngọc Khóa: cần ${c.boundJade}.`); inventory['resource.spirit_stone'] -= c.spiritStone; state.currencies.boundImmortalJade -= c.boundJade; f.level += 1; state.cave.level = Math.max(state.cave.level, Math.max(...state.cave.facilities.map(x => x.level))); return { facility: { ...f }, cost: c }; }
export function collectionSummaryV12316(container, now = Date.now()) {
    const state = cloneCollectionProgressStateV12316(container.collectionV12316);
    migrateConfidantsV87(state);
    migrateArtifactsV88(state);
    const stats = collectionStatSummaryV12316(state);
    const categories = ['manual', 'artifact', 'pet', 'companion'].map(category => { const all = collectionCatalogV12316(category), owned = all.filter(x => state.items[x.id]?.owned); return { category, label: CATEGORY_LABEL[category], total: all.length, owned: owned.length, genericFragments: state.genericFragments[category], genericFragmentName: GENERIC_FRAGMENT_NAME[category], items: all.map(d => { const p = state.items[d.id] ?? { owned: false, level: 1, advance: 0, specificFragments: 0 }; const active = d.category === 'artifact' ? state.activeArtifactIds.includes(d.id) : d.category === 'pet' ? state.activePetId === d.id : d.category === 'companion' ? state.activeCompanionId === d.id : false; const maxAdvance = d.category === 'artifact' ? 4 : d.category === 'pet' ? SPIRIT_BEAST_MAX_BLOODLINE_V86 : d.category === 'companion' ? CONFIDANT_MAX_FATE_V87 - 1 : d.category === 'manual' ? MANUAL_ADVANCE_MAX_V127 : 6; return { ...d, gradeLabel: COLLECTION_GRADE_LABEL_V12316[d.grade], progress: { ...p }, active, artifact: d.category === 'artifact' ? artifactViewV88(state, d.id) : undefined, confidant: d.category === 'companion' ? confidantViewV87(state, d.id) : undefined, strengthenCost: p.owned ? (d.category === 'artifact' ? artifactRefinementCostV88(p) : d.category === 'companion' ? facilityDiscountedCostV99(state, 'companion', confidantIntimacyCostV87(p)) : d.category === 'manual' ? facilityDiscountedCostV99(state, 'scripture', manualStrengthenCostV127(d, p)) : collectionStrengthenCostV12316(p)) : undefined, advanceCost: p.owned && p.advance < maxAdvance ? (d.category === 'artifact' ? artifactGradeCostV88(p) : d.category === 'companion' ? confidantFateCostV87(p) : d.category === 'manual' ? manualAdvanceCostV127(d, p) : collectionAdvanceCostV12316(p)) : undefined }; }) }; });
    return { schema: COLLECTION_SCHEMA_V12316, currencies: { ...state.currencies }, stats, categories, gacha: { manual: { ...state.gacha.manual }, artifact: { ...state.gacha.artifact }, pet: { ...state.gacha.pet }, companion: { ...state.gacha.companion } }, active: { artifactIds: [...state.activeArtifactIds], petId: state.activePetId, companionId: state.activeCompanionId }, artifactV88: { fortune: artifactFortuneSummaryV88(state) }, confidantV87: collectionConfidantV87Summary(state), cave: { level: state.cave.level, facilities: state.cave.facilities.map(f => ({ ...f, cost: f.level < 10 ? caveFacilityUpgradeCostV12316(f.level) : undefined })) }, daily: { dayKey: state.daily.dayKey, dungeons: dailyDungeonSummaryV12316(state, now) } };
}
//# sourceMappingURL=collection-progression-v12316.js.map

// V147 canonical overrides. Legacy V146 implementation is retained above as internal fallback only.
import { SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147, SPIRIT_BEAST_FRAGMENT_PER_STAR_V147, migrateSpiritBeastsV147, spiritBeastEffectiveLevelV147, spiritBeastLevelCapV147, spiritBeastStarEssenceCostV147, spiritBeastStarUpV147 } from './spirit-beast-v147.js';
import { CONFIDANT_DUPLICATE_FRAGMENT_V148, CONFIDANT_FRAGMENT_PER_STAR_V148, migrateConfidantsV148, confidantCombatTriggersV148, confidantViewV148, confidantFortuneSummaryV148, confidantIntimacyCostV148, confidantIntimacyCapV148, confidantStarEssenceCostV148, confidantStarUpV148, confidantStarsV148, activeConfidantSpecialtyV148, spendConfidantHeartPointV148 } from './confidant-v87.js';

export function spiritBeastStrengthenCostV147(state,progress){
  const effective=spiritBeastEffectiveLevelV147(progress?.level??1);
  let cost=Math.max(5,Math.floor(8+effective*2.4));
  cost=facilityDiscountedCostV99(state,'beast',cost);
  const specialty=activeConfidantSpecialtyV87(state);
  if(specialty?.unlocked&&specialty.id==='spiritBeast')cost=Math.max(1,Math.ceil(cost*(1-specialty.strengthPct/100)));
  if(specialty?.unlocked&&specialty.id==='resource')cost=Math.max(1,Math.ceil(cost*(1-specialty.strengthPct/100)));
  return cost;
}

function grantCollectionItemV12316V147Canonical(state,id,fragmentAmount){
  const def=collectionDefinitionV12316(id);
  if(def.category!=='pet')return grantCollectionItemV12316LegacyV146(state,id,fragmentAmount);
  migrateSpiritBeastsV147(state);
  const p=state.items[id]??(state.items[id]={owned:false,level:1,advance:5,stars:0,specificFragments:0,spiritBeastV147Migrated:true});
  const first=!p.owned;
  p.owned=true;
  p.advance=5;
  p.spiritBeastV147Migrated=true;
  if(!first)p.specificFragments=Math.max(0,Math.floor(Number(p.specificFragments)||0))+SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147;
  return {first,progress:{...p},definition:def};
}

function strengthenCollectionItemV12316V147Canonical(state,id,levels=1){
  const def=collectionDefinitionV12316(id);
  if(def.category!=='pet')return strengthenCollectionItemV12316LegacyV146(state,id,levels);
  migrateSpiritBeastsV147(state);
  const p=state.items[id];
  if(!p?.owned)throw new Error(`Chưa sở hữu ${def.name}.`);
  const levelCap=spiritBeastLevelCapV147(p);
  let done=0,cost=0;
  for(let i=0;i<Math.max(1,Math.floor(Number(levels)||1));i++){
    if(p.level>=levelCap)break;
    const c=spiritBeastStrengthenCostV147(state,p);
    if((state.genericFragments?.pet??0)<c)break;
    state.genericFragments.pet-=c;
    p.level+=1;cost+=c;done+=1;
  }
  if(done<=0)throw new Error(`Không đủ Linh Thú Tinh Phách hoặc đã đạt Lv${levelCap}.`);
  return {definition:def,levels:done,cost,levelCap,progress:{...p}};
}

function advanceCollectionItemV12316V147Canonical(state,id){
  const def=collectionDefinitionV12316(id);
  if(def.category!=='pet')return advanceCollectionItemV12316LegacyV146(state,id);
  migrateSpiritBeastsV147(state);
  const p=state.items?.[id];
  if(!p?.owned)throw new Error(`Chưa sở hữu ${def.name}.`);
  const fragmentCost=SPIRIT_BEAST_FRAGMENT_PER_STAR_V147;
  const essenceCost=spiritBeastStarEssenceCostV147(p.stars);
  const fragments=Math.max(0,Math.floor(Number(p.specificFragments)||0));
  const essence=Math.max(0,Math.floor(Number(state.economyV12325?.ascensionEssence?.pet)||0));
  if(fragments<fragmentCost)throw new Error(`Thiếu mảnh riêng ${def.name}: cần ${fragmentCost}, có ${fragments}.`);
  if(essence<essenceCost)throw new Error(`Thiếu Linh Thú Đột Phá Đan: cần ${essenceCost}, có ${essence}.`);
  const result=spiritBeastStarUpV147(p,1);
  if(essenceCost>0)state.economyV12325.ascensionEssence.pet-=essenceCost;
  p.advance=5;
  return {definition:def,cost:fragmentCost,fragmentCost,essenceCost,stars:result.stars,levelCap:result.levelCap,progress:{...p}};
}


// V148 canonical collection wrappers.
export function grantCollectionItemV12316(state,id,fragmentAmount){
  const def=collectionDefinitionV12316(id);
  if(def.category!=='companion')return grantCollectionItemV12316V147Canonical(state,id,fragmentAmount);
  migrateConfidantsV148(state);
  const p=state.items[id]??(state.items[id]={owned:false,level:1,advance:0,stars:0,specificFragments:0,confidantHeartV148:{assist:0,guard:0,harmony:0,raw:0},confidantV148Migrated:true});
  const first=!p.owned;p.owned=true;
  if(!first)p.specificFragments=Math.max(0,Math.floor(Number(p.specificFragments)||0))+CONFIDANT_DUPLICATE_FRAGMENT_V148;
  return {first,progress:{...p,confidantHeartV148:{...(p.confidantHeartV148??{})}},definition:def};
}

export function strengthenCollectionItemV12316(state,id,levels=1){
  const def=collectionDefinitionV12316(id);
  if(def.category!=='companion')return strengthenCollectionItemV12316V147Canonical(state,id,levels);
  migrateConfidantsV148(state);
  const p=state.items?.[id];if(!p?.owned)throw new Error(`Chưa sở hữu ${def.name}.`);
  const levelCap=confidantIntimacyCapV148(p);let done=0,cost=0;
  for(let i=0;i<Math.max(1,Math.floor(Number(levels)||1));i++){
    if(p.level>=levelCap)break;
    const c=facilityDiscountedCostV99(state,'companion',confidantIntimacyCostV148(p));
    if((state.genericFragments?.companion??0)<c)break;
    state.genericFragments.companion-=c;p.level+=1;cost+=c;done+=1;
  }
  if(done<=0)throw new Error(`Không đủ Đồng Tâm Ngọc hoặc đã đạt Thân Mật ${levelCap}.`);
  return {definition:def,levels:done,cost,levelCap,progress:{...p,confidantHeartV148:{...(p.confidantHeartV148??{})}}};
}

export function advanceCollectionItemV12316(state,id){
  const def=collectionDefinitionV12316(id);
  if(def.category!=='companion')return advanceCollectionItemV12316V147Canonical(state,id);
  const result=confidantStarUpV148(state,id,1);
  return {...result,cost:CONFIDANT_FRAGMENT_PER_STAR_V148,advanceCost:CONFIDANT_FRAGMENT_PER_STAR_V148};
}

export function spendCollectionConfidantHeartPointV148(state,id,branch){
  return spendConfidantHeartPointV148(state,id,branch);
}
