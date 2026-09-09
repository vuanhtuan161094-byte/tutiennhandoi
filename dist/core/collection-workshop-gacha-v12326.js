import { bloodlineDefinition, bloodlineIds, createBloodlineRoll, createPhysiqueRoll, physiqueDefinition, physiqueIds, recomputeBloodlineEffects } from './birth-origins-v101.js';
import { BLOODLINE_ESSENCE_RESOURCE_ID, BLOODLINE_PROTECTION_RESOURCE_ID, BODY_ESSENCE_RESOURCE_ID } from './origin-progression-v102.js';
import { SeededRng } from './rng.js';
import { workshopProductionSummaryV12328 } from './workshop-production-v12328.js';
import { COLLECTION_GRADE_LABEL_V12316, grantCollectionItemV12316, cloneCollectionProgressStateV12316, } from './collection-progression-v12316.js';
import { collectionCatalogV12325, collectionDefinitionV12325, collectionEconomySummaryV12325, ensureCollectionEconomyV12325, } from './gacha-collection-economy-v12325.js';
import { ARTIFACTS_V88, RELICS_V88, ARTIFACT_MAX_GRADE_V88, ARTIFACT_MAX_REFINEMENT_V88 } from './artifact-v88.js';
import { MANUAL_LEVEL_MAX_V127, MANUAL_ADVANCE_MAX_V127, manualUnlockedV127, manualComposeCostV127 } from './manual-progression-v127.js';
export const COLLECTION_WORKSHOP_SCHEMA_V12326 = 'collection-workshop-gacha.v12326';
export const VAN_TUONG_PRODUCTION_VERSION_V100 = 'v100';
export const VAN_TUONG_CANONICAL_GACHA_ACTION_V100 = 'collectionGachaV12326';
export const BODY_BREAKTHROUGH_RESOURCE_ID = 'resource.body_breakthrough_crystal';
const CATEGORIES = ['manual', 'heart', 'artifact', 'relic', 'pet', 'companion', 'bloodline', 'physique'];
const GRADE_ORDER = ['mundane', 'spirit', 'mystic', 'earth', 'heaven', 'immortal', 'extreme', 'breaker'];
const GRADE_RATE = { mundane: 18, spirit: 25, mystic: 30, earth: 18, heaven: 7, immortal: 1.5, extreme: .4, breaker: .1 };
const CATEGORY_LABEL = { manual: 'Công Pháp', heart: 'Tâm Pháp', artifact: 'Pháp Bảo', relic: 'Chí Bảo', pet: 'Linh Thú', companion: 'Tri Kỷ', bloodline: 'Huyết Mạch', physique: 'Thể Chất' };
const GACHA_NAME = { manual: 'Chiêu Mộ Công Pháp', heart: 'Chiêu Mộ Tâm Pháp', artifact: 'Chiêu Mộ Pháp Bảo', relic: 'Chiêu Mộ Chí Bảo', pet: 'Linh Khế Linh Thú', companion: 'Duyên Khế Tri Kỷ', bloodline: 'Huyết Mạch Chiêu Hoán', physique: 'Thể Chất Thức Tỉnh' };
const ROLE = { manual: 'Nền chỉ số · Tu Vi · utility', heart: 'Build Bản Đạo · stat + mechanic', artifact: '2/3/4 slot · Bảo Tính + Pháp Kỹ · Bảo Khí', relic: '1 slot · Chí Bảo đổi luật build', pet: 'Trợ chiến · 1 Nội Tại + 3 kỹ năng · Linh Khế toàn bộ', companion: 'Thân Mật 1–100 · Duyên I–V · Sở Trường · Trợ Chiến/Hộ Đạo/Tâm Ý', bloodline: 'Độ Thuần · Bậc Huyết · chỉ số huyết mạch', physique: 'Cảnh Luyện Thể · chỉ số thân thể' };
export const MATERIAL_NAME_V12326 = { manual: 'Công Pháp Tàn Ý', heart: 'Tâm Pháp Tàn Quyển', artifact: 'Luyện Bảo Tinh Hoa', relic: 'Chí Bảo Linh Tinh', pet: 'Linh Thú Tinh Phách', companion: 'Đồng Tâm Ngọc', bloodline: 'Huyết Tinh', physique: 'Thể Phách Tinh Hoa' };
export const BREAK_NAME_V12326 = { manual: 'Thiên Tinh Công Pháp', heart: 'Thiên Tinh Tâm Pháp', artifact: 'Thiên Tinh Pháp Bảo', relic: 'Thiên Tinh Chí Bảo', pet: 'Linh Thú Đột Phá Đan', companion: 'Duyên Tinh Đột Phá', bloodline: 'Hộ Huyết Phù', physique: 'Luyện Thể Đạo Tinh' };
const FACILITY = { manual: 'scripture', heart: 'scripture', artifact: 'artifact', relic: 'artifact', pet: 'beast', companion: 'companion', bloodline: 'bloodline', physique: 'physique' };
function bannerId(c) { return `banner.${c}`; }
function track() { return { pulls: 0, sinceMystic: 0, sinceHeaven: 0, sinceImmortal: 0, guaranteedFeatured: false }; }
function defaultState() { return { schema: COLLECTION_WORKSHOP_SCHEMA_V12326, tracks: Object.fromEntries(CATEGORIES.map(c => [bannerId(c), track()])), history: [], originItems: {}, manualBanner: { realmStageIndex: null, orientationId: '', orientationGuaranteed: false }, daily: { dayKey: '', clearedIds: [] } }; }
export function ensureCollectionWorkshopV12326(state) {
    const holder = state;
    const e = holder.economyV12326 ?? (holder.economyV12326 = defaultState());
    e.tracks ??= defaultState().tracks;
    for (const c of CATEGORIES)
        e.tracks[bannerId(c)] ??= track();
    e.history ??= [];
    e.originItems ??= {};
    e.manualBanner ??= { realmStageIndex: null, orientationId: '', orientationGuaranteed: false };
    e.manualBanner.orientationGuaranteed = Boolean(e.manualBanner.orientationGuaranteed);
    e.daily ??= { dayKey: '', clearedIds: [] };
    return e;
}
function bandGrade(b) { return b === 'COMMON' ? 'spirit' : b === 'SPIRIT' ? 'mystic' : b === 'HEAVEN' ? 'heaven' : b === 'MONSTROUS' ? 'immortal' : b === 'EXTREME' ? 'extreme' : b === 'BREAK' ? 'breaker' : 'mundane'; }
function oldDef(d) { return { id: d.id, category: d.category, name: d.name, grade: d.grade, gradeLabel: COLLECTION_GRADE_LABEL_V12316[d.grade], description: d.description, realmStageIndex: d.realmStageIndex, realmName: d.realmName, requiredRealmOrder: d.requiredRealmOrder, manualRole: d.manualRole, manualArchetype: d.manualArchetype, maxLevel: d.maxLevel, maxAdvance: d.maxAdvance, strengthScoreV127: d.strengthScoreV127, strengthCostWeightV127: d.strengthCostWeightV127, levelMilestones: d.levelMilestones, old: d }; }
export function collectionCatalogV12326(category) {
    let out = [];
    if (!category || !['bloodline', 'physique'].includes(category))
        out = collectionCatalogV12325(category && category !== 'bloodline' && category !== 'physique' ? category : undefined).map(oldDef);
    if (!category || category === 'bloodline')
        out.push(...bloodlineIds().map(id => { const d = bloodlineDefinition(id); const g = bandGrade(d.band); return { id: d.id, category: 'bloodline', name: d.name, grade: g, gradeLabel: COLLECTION_GRADE_LABEL_V12316[g], description: d.description, band: d.band, effects: { ...d.effects } }; }));
    if (!category || category === 'physique')
        out.push(...physiqueIds().map(id => { const d = physiqueDefinition(id); const g = bandGrade(d.band); return { id: d.id, category: 'physique', name: d.name, grade: g, gradeLabel: COLLECTION_GRADE_LABEL_V12316[g], description: d.description, band: d.band, effects: { ...d.effects } }; }));
    return out;
}
export function collectionDefinitionV12326(id) { const found = collectionCatalogV12326().find(x => x.id === id); if (!found)
    throw new Error(`Không có mục collection: ${id}`); return found; }
export function manualBannerRealmOptionsV127(realmOrder = 117) {
    const unlocked = collectionCatalogV12326('manual').filter(x => manualUnlockedV127(x, realmOrder));
    const by = new Map();
    for (const d of unlocked) if (!by.has(d.realmStageIndex)) by.set(d.realmStageIndex, { realmStageIndex:d.realmStageIndex, realmName:d.realmName, requiredRealmOrder:d.requiredRealmOrder });
    return [...by.values()].sort((a,b)=>a.realmStageIndex-b.realmStageIndex);
}
function resolveManualBannerV127(e, realmOrder = 117) {
    const options = manualBannerRealmOptionsV127(realmOrder);
    const latest = options.at(-1)?.realmStageIndex ?? 0;
    const selected = options.some(x=>x.realmStageIndex===Number(e.manualBanner?.realmStageIndex)) ? Number(e.manualBanner.realmStageIndex) : latest;
    e.manualBanner ??= { realmStageIndex:selected, orientationId:'', orientationGuaranteed:false };
    e.manualBanner.orientationGuaranteed = Boolean(e.manualBanner.orientationGuaranteed);
    e.manualBanner.realmStageIndex = selected;
    const pool = collectionCatalogV12326('manual').filter(x=>x.realmStageIndex===selected && manualUnlockedV127(x,realmOrder));
    if (!pool.some(x=>x.id===e.manualBanner.orientationId)) e.manualBanner.orientationId = pool[0]?.id ?? '';
    return { options, selectedRealmStageIndex:selected, pool, orientationId:e.manualBanner.orientationId, orientationGuaranteed:Boolean(e.manualBanner.orientationGuaranteed) };
}
export function setManualGachaRealmV127(state, realmStageIndex, realmOrder = 117) {
    const e=ensureCollectionWorkshopV12326(state), options=manualBannerRealmOptionsV127(realmOrder), target=Math.floor(Number(realmStageIndex));
    if(!options.some(x=>x.realmStageIndex===target)) throw new Error('Cảnh giới Công Pháp này chưa mở hoặc không tồn tại.');
    e.manualBanner.realmStageIndex=target; e.manualBanner.orientationId=''; e.manualBanner.orientationGuaranteed=false; return resolveManualBannerV127(e,realmOrder);
}
export function setManualGachaOrientationV127(state, manualId, realmOrder = 117) {
    const e=ensureCollectionWorkshopV12326(state), banner=resolveManualBannerV127(e,realmOrder);
    if(!banner.pool.some(x=>x.id===manualId)) throw new Error('Định Hướng phải là một trong 9 Công Pháp của banner cảnh giới đang chọn.');
    if(e.manualBanner.orientationId!==manualId) e.manualBanner.orientationGuaranteed=false; e.manualBanner.orientationId=manualId; return resolveManualBannerV127(e,realmOrder);
}
function gachaPoolV127(category, realmOrder = 117, e = undefined) { const all = collectionCatalogV12326(category); if(category!=='manual') return all; if(e) return resolveManualBannerV127(e,realmOrder).pool; const unlocked=all.filter(x=>manualUnlockedV127(x,realmOrder)); const latest=Math.max(...unlocked.map(x=>x.realmStageIndex??0),0); return unlocked.filter(x=>x.realmStageIndex===latest); }
function firstFeatured(c, realmOrder = 117, e = undefined) { const pool = gachaPoolV127(c, realmOrder, e); if(c==='manual'&&e){ const directed=resolveManualBannerV127(e,realmOrder).orientationId; if(pool.some(x=>x.id===directed)) return directed; } return pool.find(x => GRADE_ORDER.indexOf(x.grade) >= GRADE_ORDER.indexOf('immortal'))?.id ?? pool.at(-1)?.id ?? pool[0]?.id ?? ''; }
export function featuredRateUpRuleV100(category, realmOrder = 117, state = undefined) {
    const e=state?ensureCollectionWorkshopV12326(state):undefined, pool = gachaPoolV127(category, realmOrder, e), featuredId = firstFeatured(category, realmOrder, e), featured = pool.find(x => x.id === featuredId);
    if (!featured)
        return { enabled: false, featuredId: '', strictFiftyFifty: false, alternativeCount: 0 };
    const sameGrade = pool.filter(x => x.grade === featured.grade), alternatives = sameGrade.filter(x => x.id !== featured.id);
    return { enabled: alternatives.length > 0, featuredId: featured.id, featuredGrade: featured.grade, featuredGradeLabel: featured.gradeLabel, strictFiftyFifty: alternatives.length > 0, alternativeCount: alternatives.length };
}
export const GACHA_BANNERS_V12326 = CATEGORIES.map(category => ({ id: bannerId(category), category, name: GACHA_NAME[category], subtitle: `Chỉ ${CATEGORY_LABEL[category]} · phần lớn ${MATERIAL_NAME_V12326[category]} · mảnh riêng chỉ từ gacha`, featuredId: firstFeatured(category) }));
function weightedGrade(rng, min) { const floor = min ? GRADE_ORDER.indexOf(min) : 0, pool = GRADE_ORDER.slice(Math.max(0, floor)); const total = pool.reduce((s, g) => s + GRADE_RATE[g], 0); let r = rng.next() * total; for (const g of pool) {
    r -= GRADE_RATE[g];
    if (r <= 0)
        return g;
} return pool.at(-1); }
function isAtLeast(g, min) { return GRADE_ORDER.indexOf(g) >= GRADE_ORDER.indexOf(min); }
function rollPity(rng, t) { if (t.sinceImmortal >= 119)
    return { grade: weightedGrade(rng, 'immortal'), pity: '120' }; if (t.sinceHeaven >= 59)
    return { grade: weightedGrade(rng, 'heaven'), pity: '60' }; if (t.sinceMystic >= 9)
    return { grade: weightedGrade(rng, 'mystic'), pity: '10' }; return undefined; }
function updateTrack(t, grade) { t.pulls += 1; t.sinceMystic = grade && isAtLeast(grade, 'mystic') ? 0 : t.sinceMystic + 1; t.sinceHeaven = grade && isAtLeast(grade, 'heaven') ? 0 : t.sinceHeaven + 1; t.sinceImmortal = grade && isAtLeast(grade, 'immortal') ? 0 : t.sinceImmortal + 1; }
function chooseByGrade(rng, category, grade, t, realmOrder = 117, e = undefined) { const all = gachaPoolV127(category, realmOrder, e); if (!all.length) throw new Error('Chưa mở Công Pháp của cảnh giới hiện tại.'); let exact = all.filter(x => x.grade === grade); if (!exact.length) {
    const target = GRADE_ORDER.indexOf(grade);
    let best = 99;
    for (const d of all)
        best = Math.min(best, Math.abs(GRADE_ORDER.indexOf(d.grade) - target));
    exact = all.filter(d => Math.abs(GRADE_ORDER.indexOf(d.grade) - target) === best);
} const rule = featuredRateUpRuleV100(category, realmOrder, e), featured = rule.featuredId ? collectionDefinitionV12326(rule.featuredId) : undefined, eligible = Boolean(rule.enabled && featured && exact.some(x => x.id === featured.id)); if (eligible) {
    const hit = t.guaranteedFeatured || rng.next() < .5;
    if (hit) {
        t.guaranteedFeatured = false;
        return { def: featured, featured: true, rateUpEligible: true };
    }
    t.guaranteedFeatured = true;
    const offBanner = exact.filter(x => x.id !== featured.id);
    return { def: offBanner[Math.floor(rng.next() * offBanner.length)], featured: false, rateUpEligible: true };
} return { def: exact[Math.floor(rng.next() * exact.length)], featured: false, rateUpEligible: false }; }
function chooseManualFragmentWithOrientationV127(rng, grade, t, realmOrder = 117, e) {
    const banner = resolveManualBannerV127(e, realmOrder), target = banner.pool.find(x => x.id === banner.orientationId);
    if (!target)
        return chooseByGrade(rng, 'manual', grade, t, realmOrder, e);
    const guaranteed = Boolean(e.manualBanner.orientationGuaranteed), directedHit = guaranteed || rng.next() < .5;
    if (directedHit) {
        e.manualBanner.orientationGuaranteed = false;
        return { def: target, featured: true, rateUpEligible: true, orientationHit: true, orientationGuaranteedUsed: guaranteed };
    }
    e.manualBanner.orientationGuaranteed = true;
    const natural = chooseByGrade(rng, 'manual', grade, t, realmOrder, e);
    if (natural.def.id === target.id) {
        e.manualBanner.orientationGuaranteed = false;
        return { ...natural, featured: true, rateUpEligible: true, orientationHit: true, orientationNaturalHit: true };
    }
    return { ...natural, featured: false, rateUpEligible: true, orientationHit: false };
}
function fragmentYield(g) { return { mundane: 4, spirit: 5, mystic: 6, earth: 8, heaven: 10, immortal: 14, extreme: 20, breaker: 28 }[g]; }
export function composeCostV12326(g) { return { mundane: 20, spirit: 30, mystic: 40, earth: 60, heaven: 90, immortal: 140, extreme: 220, breaker: 360 }[g]; }
function itemComposeCostV127(def) { return def?.category === 'manual' ? manualComposeCostV127(def) : composeCostV12326(def.grade); }
function oldProgress(state, id) { const e25 = ensureCollectionEconomyV12325(state), d = collectionDefinitionV12325(id); if (d.category === 'manual' || d.category === 'artifact' || d.category === 'pet' || d.category === 'companion')
    return state.items[id] ?? (state.items[id] = { owned: false, level: 1, advance: 0, specificFragments: 0 }); return e25.extraItems[id] ?? (e25.extraItems[id] = { owned: false, level: 1, advance: 0, specificFragments: 0 }); }
function originProgress(e, id) { return e.originItems[id] ?? (e.originItems[id] = { owned: false, specificFragments: 0 }); }
function addFragments(state, e, def, amount) { if (def.category === 'bloodline' || def.category === 'physique') {
    const p = originProgress(e, def.id);
    p.specificFragments += amount;
    return p.specificFragments;
} const p = oldProgress(state, def.id); p.specificFragments += amount; return p.specificFragments; }
function directGrant(state, e, def, knownHearts) { if (def.category === 'bloodline' || def.category === 'physique') {
    const p = originProgress(e, def.id), first = !p.owned;
    p.owned = true;
    if (def.category === 'bloodline') {
        p.bloodlineGrade ??= 'Phàm';
        p.purity ??= 0;
    }
    else
        p.physiqueStage ??= 'Sơ Tỉnh';
    if (!first)
        p.specificFragments += fragmentYield(def.grade) * 2;
    return { first, fragments: first ? 0 : fragmentYield(def.grade) * 2 };
} if (def.category === 'heart' && def.old?.linkedPassiveId && knownHearts.has(def.old.linkedPassiveId)) {
    const p = oldProgress(state, def.id);
    p.owned = true;
    p.specificFragments += fragmentYield(def.grade) * 2;
    return { first: false, fragments: fragmentYield(def.grade) * 2 };
} if (def.category === 'manual' || def.category === 'artifact' || def.category === 'pet' || def.category === 'companion') {
    const p = state.items[def.id];
    const first = !p?.owned;
    grantCollectionItemV12316(state, def.id, fragmentYield(def.grade) * 2);
    return { first, fragments: first ? 0 : fragmentYield(def.grade) * 2 };
} const p = oldProgress(state, def.id), first = !p.owned; p.owned = true; if (!first)
    p.specificFragments += fragmentYield(def.grade) * 2; return { first, fragments: first ? 0 : fragmentYield(def.grade) * 2 }; }
export function addStrengthMaterialV12326(state, inventory, category, amount) { const e25 = ensureCollectionEconomyV12325(state); if (category === 'manual' || category === 'artifact' || category === 'pet' || category === 'companion')
    state.genericFragments[category] += amount;
else if (category === 'heart')
    e25.genericFragments.heart += amount;
else if (category === 'relic')
    e25.genericFragments.relic += amount;
else if (category === 'bloodline')
    inventory[BLOODLINE_ESSENCE_RESOURCE_ID] = (inventory[BLOODLINE_ESSENCE_RESOURCE_ID] ?? 0) + amount;
else
    inventory[BODY_ESSENCE_RESOURCE_ID] = (inventory[BODY_ESSENCE_RESOURCE_ID] ?? 0) + amount; }
export function addBreakMaterialV12326(state, inventory, category, amount) { const e25 = ensureCollectionEconomyV12325(state); if (category === 'bloodline')
    inventory[BLOODLINE_PROTECTION_RESOURCE_ID] = (inventory[BLOODLINE_PROTECTION_RESOURCE_ID] ?? 0) + amount;
else if (category === 'physique')
    inventory[BODY_BREAKTHROUGH_RESOURCE_ID] = (inventory[BODY_BREAKTHROUGH_RESOURCE_ID] ?? 0) + amount;
else
    e25.ascensionEssence[category] += amount; }
function strengthAmount(category, grade) { const rank = grade ? GRADE_ORDER.indexOf(grade) : 2; const base = category === 'bloodline' || category === 'physique' ? 10 : 18; return base + Math.max(0, rank) * 4; }
function breakAmount(_category) { return 1; }
function gachaCollectionV12326LegacyV146(state, inventory, banner, count, seed, usePremium = false, knownHeartPassiveIds = [], realmOrder = 117) {
    const def = GACHA_BANNERS_V12326.find(x => x.id === banner);
    if (!def)
        throw new Error('Banner gacha không tồn tại.');
    const e = ensureCollectionWorkshopV12326(state), t = e.tracks[banner];
    count = Math.max(1, Math.min(10, Math.floor(count)));
    const cost = count === 10 ? 1440 : 160 * count, key = usePremium ? 'immortalJade' : 'boundImmortalJade';
    if (state.currencies[key] < cost)
        throw new Error(`Không đủ ${usePremium ? 'Tiên Ngọc' : 'Tiên Ngọc Khóa'}: cần ${cost}.`);
    state.currencies[key] -= cost;
    const rng = new SeededRng(seed >>> 0), known = new Set(knownHeartPassiveIds), results = [];
    for (let i = 0; i < count; i++) {
        const pity = rollPity(rng, t);
        let kind;
        let grade = pity?.grade;
        if (pity)
            kind = rng.next() < .08 ? 'item' : 'fragment';
        else {
            const r = rng.next();
            kind = r < .74 ? 'material' : r < .82 ? 'breakthrough' : r < .98 ? 'fragment' : 'item';
            if (kind === 'fragment' || kind === 'item')
                grade = weightedGrade(rng);
        }
        let row = { category: def.category, categoryLabel: CATEGORY_LABEL[def.category], kind, pity: pity?.pity };
        if (kind === 'material') {
            const amount = strengthAmount(def.category);
            addStrengthMaterialV12326(state, inventory, def.category, amount);
            row = { ...row, name: MATERIAL_NAME_V12326[def.category], amount };
        }
        else if (kind === 'breakthrough') {
            const amount = breakAmount(def.category);
            addBreakMaterialV12326(state, inventory, def.category, amount);
            row = { ...row, name: BREAK_NAME_V12326[def.category], amount };
        }
        else {
            const picked = (def.category === 'manual' && kind === 'fragment') ? chooseManualFragmentWithOrientationV127(rng, grade, t, realmOrder, e) : chooseByGrade(rng, def.category, grade, t, realmOrder, e), item = picked.def;
            if (kind === 'fragment') {
                const amount = fragmentYield(item.grade);
                addFragments(state, e, item, amount);
                row = { ...row, id: item.id, name: item.name, grade: item.grade, gradeLabel: item.gradeLabel, amount, fragments: amount, featured: picked.featured, rateUpEligible: picked.rateUpEligible, orientationHit: picked.orientationHit, orientationGuaranteedUsed: picked.orientationGuaranteedUsed, first: false };
            }
            else {
                const g = directGrant(state, e, item, known);
                row = { ...row, id: item.id, name: item.name, grade: item.grade, gradeLabel: item.gradeLabel, amount: 1, fragments: g.fragments, featured: picked.featured, rateUpEligible: picked.rateUpEligible, first: g.first };
            }
        }
        updateTrack(t, grade);
        results.push(row);
        e.history.unshift({ pull: t.pulls, bannerId: banner, category: def.category, kind: row.kind, itemId: row.id, name: row.name, grade: row.grade, gradeLabel: row.gradeLabel, amount: row.amount, first: row.first, featured: row.featured, currency: key });
    }
    e.history = e.history.slice(0, 120);
    return { schema: COLLECTION_WORKSHOP_SCHEMA_V12326, bannerId: banner, bannerName: def.name, cost, currency: key, results, track: { ...t }, manualOrientationGuaranteed: def.category==='manual'?Boolean(e.manualBanner.orientationGuaranteed):undefined, pity: { mystic: `${t.sinceMystic}/10`, heaven: `${t.sinceHeaven}/60`, immortal: `${t.sinceImmortal}/120`, featuredGuaranteed: t.guaranteedFeatured } };
}
export function composeCollectionItemV12326(state, itemId, realmOrder = 117) { const e = ensureCollectionWorkshopV12326(state), d = collectionDefinitionV12326(itemId), cost = itemComposeCostV127(d); if (d.category === 'manual' && !manualUnlockedV127(d, realmOrder)) throw new Error(`${d.name} mở ở ${d.realmName}.`); if (d.category === 'heart')
    throw new Error('Tâm Pháp lĩnh ngộ từ Công Pháp; mảnh Tâm Pháp dùng để Tiến Bậc.'); if (d.category === 'bloodline' || d.category === 'physique') {
    const p = originProgress(e, itemId);
    if (p.owned)
        throw new Error(`${d.name} đã sở hữu.`);
    if (p.specificFragments < cost)
        throw new Error(`Thiếu mảnh ${d.name}: cần ${cost}, có ${p.specificFragments}.`);
    p.specificFragments -= cost;
    p.owned = true;
    if (d.category === 'bloodline') {
        p.bloodlineGrade = 'Phàm';
        p.purity = 0;
    }
    else
        p.physiqueStage = 'Sơ Tỉnh';
    return { definition: d, cost, progress: { ...p } };
} const p = oldProgress(state, itemId); if (p.owned)
    throw new Error(`${d.name} đã sở hữu.`); if (p.specificFragments < cost)
    throw new Error(`Thiếu mảnh ${d.name}: cần ${cost}, có ${p.specificFragments}.`); p.specificFragments -= cost; p.owned = true; return { definition: d, cost, progress: { ...p } }; }
export function syncOriginCollectionV12326(state, bundle) { if (!bundle)
    return; const e = ensureCollectionWorkshopV12326(state); if (bundle.bloodline.band !== 'NONE') {
    const p = originProgress(e, bundle.bloodline.id);
    p.owned = true;
    p.bloodlineGrade = bundle.bloodline.grade;
    p.purity = bundle.bloodline.purity;
} if (bundle.physique.band !== 'NONE') {
    const p = originProgress(e, bundle.physique.id);
    p.owned = true;
    p.physiqueStage = bundle.physique.stage;
} }
export function activateOriginCollectionV12326(state, bundle, category, itemId) { const e = ensureCollectionWorkshopV12326(state); syncOriginCollectionV12326(state, bundle); const p = originProgress(e, itemId); const d = collectionDefinitionV12326(itemId); if (d.category !== category)
    throw new Error('Sai loại căn nguyên.'); if (!p.owned)
    throw new Error(`Chưa sở hữu ${d.name}; mảnh chỉ nhận từ Gacha ${CATEGORY_LABEL[category]}.`); if (category === 'bloodline') {
    const next = createBloodlineRoll(itemId, 'NATIVE', p.bloodlineGrade ?? 'Phàm');
    next.purity = Math.max(0, Math.min(100, p.purity ?? 0));
    next.effects = recomputeBloodlineEffects(next).effects;
    next.switchedThisLife = false;
    next.incompatibilityActive = false;
    bundle.bloodline = next;
}
else
    bundle.physique = createPhysiqueRoll(itemId, p.physiqueStage ?? 'Sơ Tỉnh'); return { category, itemId, name: d.name }; }
function materialCount(state, inventory, category) { const e25 = ensureCollectionEconomyV12325(state); if (category === 'manual' || category === 'artifact' || category === 'pet' || category === 'companion')
    return state.genericFragments[category]; if (category === 'heart')
    return e25.genericFragments.heart; if (category === 'relic')
    return e25.genericFragments.relic; if (category === 'bloodline')
    return inventory[BLOODLINE_ESSENCE_RESOURCE_ID] ?? 0; return inventory[BODY_ESSENCE_RESOURCE_ID] ?? 0; }
function breakCount(state, inventory, category) { const e25 = ensureCollectionEconomyV12325(state); if (category === 'bloodline')
    return inventory[BLOODLINE_PROTECTION_RESOURCE_ID] ?? 0; if (category === 'physique')
    return inventory[BODY_BREAKTHROUGH_RESOURCE_ID] ?? 0; return e25.ascensionEssence[category] ?? 0; }
export const DAILY_WORKSHOP_DUNGEONS_V12326 = [
    { id: 'daily.v2326.manual', name: 'Tàng Kinh Bí Cảnh', category: 'manual', openDays: [1, 4], material: 48, breakthrough: 1, boundJade: 0 },
    { id: 'daily.v2326.heart', name: 'Tâm Kinh Cốc', category: 'heart', openDays: [2, 5], material: 42, breakthrough: 1, boundJade: 0 },
    { id: 'daily.v2326.artifact', name: 'Vạn Bảo Bí Khố', category: 'artifact', openDays: [3, 6], material: 36, breakthrough: 1, boundJade: 0 },
    { id: 'daily.v2326.relic', name: 'Chí Bảo Tàn Giới', category: 'relic', openDays: [0, 4], material: 28, breakthrough: 1, boundJade: 0 },
    { id: 'daily.v2326.pet', name: 'Vạn Thú Cốc', category: 'pet', openDays: [1, 5], material: 38, breakthrough: 1, boundJade: 0 },
    { id: 'daily.v2326.companion', name: 'Hồng Trần Mộng Cảnh', category: 'companion', openDays: [2, 6], material: 38, breakthrough: 1, boundJade: 0 },
    { id: 'daily.v2326.bloodline', name: 'Thái Cổ Huyết Uyên', category: 'bloodline', openDays: [0, 3], material: 32, breakthrough: 1, boundJade: 0 },
    { id: 'daily.v2326.physique', name: 'Luyện Thể Cổ Cảnh', category: 'physique', openDays: [0, 4], material: 32, breakthrough: 1, boundJade: 0 },
];
function vnKey(now) { const d = new Date(now + 7 * 3600_000); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`; }
function vnDay(now) { return new Date(now + 7 * 3600_000).getUTCDay(); }
function syncDaily(e, now) { const k = vnKey(now); if (e.daily.dayKey !== k)
    e.daily = { dayKey: k, clearedIds: [] }; }
export function dailyWorkshopSummaryV12326(state, now = Date.now()) { const e = ensureCollectionWorkshopV12326(state), day = vnDay(now), cleared = e.daily.dayKey === vnKey(now) ? e.daily.clearedIds : []; return DAILY_WORKSHOP_DUNGEONS_V12326.map(d => ({ ...d, open: d.openDays.includes(day), cleared: cleared.includes(d.id), reward: { boundJade: d.boundJade, summary: `${d.material} ${MATERIAL_NAME_V12326[d.category]} · ${d.breakthrough} ${BREAK_NAME_V12326[d.category]} · không rơi mảnh` } })); }
export function clearDailyWorkshopV12326(state, inventory, id, now = Date.now()) { const e = ensureCollectionWorkshopV12326(state); syncDaily(e, now); const d = DAILY_WORKSHOP_DUNGEONS_V12326.find(x => x.id === id); if (!d)
    throw new Error('Phó bản tài nguyên không tồn tại.'); if (!d.openDays.includes(vnDay(now)))
    throw new Error(`${d.name} hôm nay không mở.`); if (e.daily.clearedIds.includes(id))
    throw new Error(`${d.name} hôm nay đã nhận thưởng.`); e.daily.clearedIds.push(id); addStrengthMaterialV12326(state, inventory, d.category, d.material); addBreakMaterialV12326(state, inventory, d.category, d.breakthrough); return { dungeon: d, boundJade: d.boundJade, material: d.material, breakthrough: d.breakthrough, drops: [`${MATERIAL_NAME_V12326[d.category]} +${d.material}`, `${BREAK_NAME_V12326[d.category]} +${d.breakthrough}`] }; }
export function collectionWorkshopSummaryV12326(state, inventory, foundation, bundle, now = Date.now(), realmOrder = 10) {
    state = cloneCollectionProgressStateV12316(state);
    inventory = { ...inventory };
    const e = ensureCollectionWorkshopV12326(state);
    syncOriginCollectionV12326(state, bundle);
    const legacy = collectionEconomySummaryV12325(state, foundation, now, realmOrder);
    const legacyBy = new Map(legacy.categories.map(x => [x.category, x]));
    const categories = CATEGORIES.map(category => {
        if (category === 'bloodline' || category === 'physique') {
            const all = collectionCatalogV12326(category);
            const items = all.map(d => { const p = e.originItems[d.id] ?? { owned: false, specificFragments: 0 }; const active = category === 'bloodline' ? bundle?.bloodline.id === d.id : bundle?.physique.id === d.id; return { ...d, progress: { ...p }, active, composeCost: !p.owned ? itemComposeCostV127(d) : undefined }; });
            return { category, label: CATEGORY_LABEL[category], role: ROLE[category], facilityId: FACILITY[category], genericFragmentName: MATERIAL_NAME_V12326[category], genericFragments: materialCount(state, inventory, category), ascensionName: BREAK_NAME_V12326[category], ascensionEssence: breakCount(state, inventory, category), total: all.length, owned: items.filter(x => x.progress.owned).length, items };
        }
        const base = legacyBy.get(category);
        return { ...base, role: ROLE[category], facilityId: FACILITY[category], genericFragmentName: MATERIAL_NAME_V12326[category], ascensionName: BREAK_NAME_V12326[category], items: base.items.map((x) => ({ ...x, composeCost: !x.progress?.owned && category !== 'heart' && (category !== 'manual' || x.unlocked) ? itemComposeCostV127(x) : undefined })) };
    });
    return { schema: COLLECTION_WORKSHOP_SCHEMA_V12326, artifactV88: structuredClone(legacy.artifactV88), active: structuredClone(legacy.active), confidantV87: structuredClone(legacy.confidantV87), v107: { schema: 'artifact-production.v107', canonicalRuntime: 'artifact.production.v88', artifactCount: ARTIFACTS_V88.length, relicCount: RELICS_V88.length, slotCapacity: legacy.artifactV88.slotCapacity, activeArtifactIds: [...legacy.artifactV88.activeArtifactIds], activeRelicId: legacy.artifactV88.activeRelicId, refinementMax: ARTIFACT_MAX_REFINEMENT_V88, gradeMax: ARTIFACT_MAX_GRADE_V88, caveFacility: 'artifact', loadoutSource: 'collectionV12316.activeArtifactIds', relicLoadoutSource: 'collectionV12316.economyV12325.activeRelicId', legacyArtifactLoadoutCompatible: true, combatEngine: 'CombatKernel V2', triggerEvents: [...new Set([...ARTIFACTS_V88.map(x => x.skill.event), ...RELICS_V88.map(x => x.trigger?.event).filter(Boolean)])].sort(), effectTypes: [...new Set([...ARTIFACTS_V88.flatMap(x => [...x.skill.effects, ...(x.skill.grade3Effects ?? []), ...(x.skill.grade5Effects ?? [])]), ...RELICS_V88.flatMap(x => x.trigger?.effects ?? [])].map(x => x.type))].sort() }, v100: { schema: 'van-tuong.v100', canonicalGachaAction: VAN_TUONG_CANONICAL_GACHA_ACTION_V100, legacyGachaWritesRetired: ['collectionGachaV12316','collectionGachaV12325'], oneTrackPerCategory: true, tenPullCost: 1440, singlePullCost: 160 }, production: workshopProductionSummaryV12328(state), currencies: { ...state.currencies }, categories, banners: GACHA_BANNERS_V12326.map(b => { const t = e.tracks[b.id], rateUp = featuredRateUpRuleV100(b.category, realmOrder, state), f = collectionDefinitionV12326(rateUp.featuredId || b.featuredId); return { ...b, featuredId: f.id, featured: [{ id: f.id, name: f.name, grade: f.grade, gradeLabel: f.gradeLabel, category: f.category }], rateUp, track: { ...t }, pity: { mystic: `${t.sinceMystic}/10`, heaven: `${t.sinceHeaven}/60`, immortal: `${t.sinceImmortal}/120`, featuredGuaranteed: t.guaranteedFeatured } }; }), manualBanner: (()=>{ const m=resolveManualBannerV127(e,realmOrder); return { selectedRealmStageIndex:m.selectedRealmStageIndex, options:m.options, orientationId:m.orientationId, orientationGuaranteed:m.orientationGuaranteed, orientationRule:{scope:'specific-fragment',strictFiftyFifty:true,guaranteeAfterLoss:true,totalFragmentRateUnchanged:true,totalItemRateUnchanged:true}, pool:m.pool.map(x=>({id:x.id,name:x.name,grade:x.grade,gradeLabel:x.gradeLabel,manualRole:x.manualRole,realmName:x.realmName})) }; })(), rates: { material: 74, breakthrough: 8, fragment: 16, item: 2 }, gradeRates: { ...GRADE_RATE }, history: e.history.map(x => ({ ...x })), daily: { dayKey: e.daily.dayKey, retiredProduction: true, replacement: 'resource-pve.v109', dungeons: dailyWorkshopSummaryV12326(state, now).map(x=>({...x, open:false, retiredProduction:true, replacement:'Phó Bản > Bí Cảnh Tài Nguyên'})) }, v109: { schema:'resource-dungeon-production.v109', canonicalFarm:'resource-pve-v12329 + DungeonEngine', dailyWorkshopWritesRetired:true, specificFragments:'gacha-only', farmCap:null, repeatGuardianMaterialReward:false }, rule: { gacha: 'Mảnh sở hữu/tiến giai chỉ từ gacha; phần lớn lượt quay là nguyên liệu đúng hệ.', dungeon: 'Phó Bản chỉ farm nguyên liệu cường hóa và đột phá; không rơi mảnh riêng.', cave: 'Động Phủ là nơi nâng hệ: Công Pháp Lv1–1000 + Đột Phá mốc 100–1000; Pháp Bảo Luyện Hóa 1–100 + Bảo Giai I–V; các hệ khác dùng progression riêng.' } };
}
export function simulateGachaV12326(category, pulls = 10000, seed = 12326) { const state = { schema: 'collection-progression.v12316', currencies: { immortalJade: 99999999, boundImmortalJade: 99999999 }, genericFragments: { manual: 0, artifact: 0, pet: 0, companion: 0 }, items: {}, activeArtifactIds: [], gacha: { manual: { pulls: 0, pity: 0 }, artifact: { pulls: 0, pity: 0 }, pet: { pulls: 0, pity: 0 }, companion: { pulls: 0, pity: 0 } }, cave: { level: 1, facilities: [] }, daily: { dayKey: '', clearedIds: [] } }; const inventory = {}, counts = { material: 0, breakthrough: 0, fragment: 0, item: 0 }, grades = Object.fromEntries(GRADE_ORDER.map(g => [g, 0])); for (let i = 0; i < Math.max(1, Math.min(100000, pulls)); i++) {
    const r = gachaCollectionV12326(state, inventory, bannerId(category), 1, (seed + i * 977) >>> 0, false, []).results[0];
    counts[r.kind]++;
    if (r.grade)
        grades[r.grade]++;
    state.currencies.boundImmortalJade += 160;
} return { category, pulls: Object.values(counts).reduce((a, b) => a + b, 0), counts, grades }; }
export function devMaxWorkshopV12326(state, inventory) { const e = ensureCollectionWorkshopV12326(state); state.currencies.boundImmortalJade = 9_999_999; state.currencies.immortalJade = 9_999_999; const e25 = ensureCollectionEconomyV12325(state); for (const c of ['manual', 'artifact', 'pet', 'companion'])
    state.genericFragments[c] = 999999; e25.genericFragments.heart = 999999; e25.genericFragments.relic = 999999; for (const c of ['manual', 'heart', 'artifact', 'relic', 'pet', 'companion'])
    e25.ascensionEssence[c] = 9999; inventory[BLOODLINE_ESSENCE_RESOURCE_ID] = 999999; inventory[BLOODLINE_PROTECTION_RESOURCE_ID] = 99999; inventory[BODY_ESSENCE_RESOURCE_ID] = 999999; inventory[BODY_BREAKTHROUGH_RESOURCE_ID] = 99999; for (const d of collectionCatalogV12326()) {
    if (d.category === 'bloodline' || d.category === 'physique') {
        const p = originProgress(e, d.id);
        p.owned = true;
        p.specificFragments = 9999;
        if (d.category === 'bloodline') {
            p.bloodlineGrade = 'Phá';
            p.purity = 100;
        }
        else
            p.physiqueStage = 'Viên Mãn';
    }
    else {
        const p = oldProgress(state, d.id);
        p.owned = true;
        p.level = d.category === 'manual' ? MANUAL_LEVEL_MAX_V127 : d.category === 'companion' || d.category === 'artifact' || d.category === 'relic' ? 100 : 50;
        p.advance = d.category === 'manual' ? MANUAL_ADVANCE_MAX_V127 : d.category === 'companion' || d.category === 'artifact' || d.category === 'relic' ? 4 : 6;
        p.specificFragments = 9999;
    }
} return e; }
//# sourceMappingURL=collection-workshop-gacha-v12326.js.map

// V147 canonical overrides. Legacy V146 implementation is retained above as internal fallback only.
import { SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147, SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147 } from './spirit-beast-v147.js';

function normalizePetPullsV147(state,result){
  const rows=result?.results??[];
  for(const row of rows){
    if(row?.category!=='pet'||!row.id)continue;
    const p=state.items?.[row.id];
    if(row.kind==='fragment'&&p){
      const old=Math.max(0,Number(row.fragments??row.amount)||0);
      const delta=SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147-old;
      p.specificFragments=Math.max(0,Math.floor(Number(p.specificFragments)||0)+delta);
      row.amount=SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147;
      row.fragments=SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147;
    }else if(row.kind==='item'&&!row.first){
      row.fragments=SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147;
    }
  }
  const history=state.economyV12326?.history??[];
  for(let i=0;i<Math.min(rows.length,history.length);i++){
    const row=rows[rows.length-1-i],h=history[i];
    if(row?.category==='pet'&&row.kind==='fragment'&&h?.category==='pet'&&h.kind==='fragment')h.amount=SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147;
  }
  return result;
}

export function gachaCollectionV12326(state,inventory,banner,count,seed,usePremium=false,knownHeartPassiveIds=[],realmOrder=117){
  return normalizePetPullsV147(state,gachaCollectionV12326LegacyV146(state,inventory,banner,count,seed,usePremium,knownHeartPassiveIds,realmOrder));
}
