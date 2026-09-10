import { SeededRng } from './rng.js';
import { COLLECTION_GRADE_LABEL_V12316, collectionCatalogV12316, collectionDefinitionV12316, grantCollectionItemV12316, collectionStrengthenCostV12316, collectionAdvanceCostV12316, strengthenCollectionItemV12316, advanceCollectionItemV12316, equipCollectionItemV12316, unequipCollectionItemV12316, applyCollectionToEntityV12316, cloneCollectionProgressStateV12316, caveFacilityCostMultiplierV99, caveFacilityDiscountPctV99, facilityDiscountedCostV99, } from './collection-progression-v12316.js';
import { MANUAL_LEVEL_MAX_V127, MANUAL_ADVANCE_MAX_V127, manualStrengthenCostV127, manualAdvanceCostV127, manualUnlockedV127, manualEffectMultiplierV127, manualCanStrengthenV127, manualCanAdvanceV127, manualNextMilestoneV127 } from './manual-progression-v127.js';
import { daoPassivesV118 } from '../content/battle-dao-skill-pack-v118.js';
import { SPIRIT_BEAST_MAX_BLOODLINE_V86, spiritBeastBondSummaryV86, spiritBeastViewV86 } from './spirit-beast-v86.js';
import { CONFIDANT_MAX_FATE_V87, confidantViewV87, confidantFortuneSummaryV87, activeConfidantSpecialtyV87, confidantIntimacyCostV87, confidantFateCostV87 } from './confidant-v87.js';
import { RELICS_V88, artifactGradeCostV88, artifactAscensionEssenceCostV88, artifactFacilityDiscountPctV88, artifactRefinementEffectiveCostV88, artifactNextSlotUnlockV88, equipArtifactSlotV88, artifactViewV88, relicViewV88, artifactFortuneSummaryV88, artifactSlotCapacityV88, migrateRelicsV88 } from './artifact-v88.js';
import { HEART_METHOD_LEVEL_MAX_V12317, SKILL_GRADE_LABEL_V12317, SKILL_GRADE_ORDER_V12317, heartMethodGradeV12317, heartMethodStatSummaryV12317, } from './skill-heart-method-v12317.js';
export const COLLECTION_ECONOMY_SCHEMA_V12325 = 'collection-economy.v12325';
const GRADE_ORDER = ['mundane', 'spirit', 'mystic', 'earth', 'heaven', 'immortal', 'extreme', 'breaker'];
const GRADE_RATES = { mundane: 18, spirit: 25, mystic: 30, earth: 18, heaven: 7, immortal: 1.5, extreme: .4, breaker: .1 };
const CATEGORY_LABEL = { manual: 'Công Pháp', heart: 'Tâm Pháp', artifact: 'Pháp Bảo', relic: 'Chí Bảo', pet: 'Linh Thú', companion: 'Tri Kỷ' };
const GENERIC_FRAGMENT_LABEL = { manual: 'Tàn Ý Công Pháp', heart: 'Tâm Pháp Tàn Quyển', artifact: 'Tinh Hoa Pháp Bảo', relic: 'Chí Bảo Linh Tinh', pet: 'Linh Thú Tinh Phách', companion: 'Đồng Tâm Ngọc' };
const ASCENSION_LABEL = 'Thiên Tinh Tiến Giai';
function gradeAtIndex(i, total) {
    const distribution = [['mundane', .15], ['spirit', .20], ['mystic', .20], ['earth', .175], ['heaven', .125], ['immortal', .075], ['extreme', .04], ['breaker', .015]];
    const p = (i + .5) / Math.max(1, total);
    let acc = 0;
    for (const [g, w] of distribution) {
        acc += w;
        if (p <= acc + 1e-9)
            return g;
    }
    return 'breaker';
}
function stat(id, value) { return { id, value: Number(value.toFixed(3)) }; }
function gradePower(g) { return { mundane: 1, spirit: 1.25, mystic: 1.55, earth: 1.9, heaven: 2.35, immortal: 2.9, extreme: 3.6, breaker: 4.5 }[g]; }
function heartStats(i, g) { const p = gradePower(g), v = .34 * p; return i % 3 === 0 ? [stat('powerPct', v), stat('breakPct', v * .25)] : i % 3 === 1 ? [stat('bodyPct', v), stat('defensePct', v * .45)] : [stat('powerPct', v * .6), stat('bodyPct', v * .55)]; }
function relicStats(i, g) { const p = gradePower(g), v = .78 * p; return i % 4 === 0 ? [stat('powerPct', v), stat('critPct', v * .18)] : i % 4 === 1 ? [stat('bodyPct', v), stat('healingPct', v * .25)] : i % 4 === 2 ? [stat('defensePct', v), stat('breakPct', v * .18)] : [stat('spiritPct', v * .8), stat('powerPct', v * .45)]; }
function relicAssist(i, g) { const p = gradePower(g); if (i % 2 === 0) {
    const coeff = .65 + p * .18;
    return { name: 'Chí Bảo Trấn Sát', description: `Mỗi 12 giây, Chí Bảo trấn sát mục tiêu khoảng ${Math.round(coeff * 100)}% Công Lực.`, trigger: { id: `collection.relic.strike.${i}`, event: 'OnHit', chancePct: 100, sourceTags: ['ActiveHit'], cooldown: 12, effects: [{ type: 'damage', coefficient: coeff, sourceTag: 'Summon', canCrit: false, canDodge: true, procCoefficient: 0 }] } };
} const heal = .08 + p * .018; return { name: 'Chí Bảo Hộ Mệnh', description: 'Khi chịu đòn, Chí Bảo định kỳ hộ chủ và hồi phục.', trigger: { id: `collection.relic.guard.${i}`, event: 'OnDamageTaken', chancePct: 100, cooldown: 14, effects: [{ type: 'heal', attackCoefficient: heal, target: 'self' }] } }; }
const HEART_GRADE_PATTERN = [
    'mundane', 'mundane', 'spirit', 'spirit', 'mystic', 'mystic', 'earth', 'earth', 'heaven', 'heaven',
    'mundane', 'spirit', 'spirit', 'mystic', 'mystic', 'earth', 'earth', 'heaven', 'immortal', 'immortal',
    'mundane', 'spirit', 'mystic', 'mystic', 'earth', 'earth', 'heaven', 'heaven', 'immortal', 'extreme',
    'mundane', 'spirit', 'mystic', 'earth', 'earth', 'heaven', 'immortal', 'extreme', 'extreme', 'breaker',
];
export const HEART_METHOD_GACHA_CATALOG_V12325 = daoPassivesV118.map((p, i) => { const grade = HEART_GRADE_PATTERN[i % HEART_GRADE_PATTERN.length]; return { id: `heart.${p.id}`, category: 'heart', name: p.name, grade, description: `Tâm Pháp Bản Đạo · ${p.description}`, stats: heartStats(i, grade), linkedPassiveId: p.id }; });
export const RELIC_CATALOG_V12325 = RELICS_V88.map(d => ({ id: d.id, category: 'relic', name: d.name, grade: d.grade, description: `${d.role} · ${d.ruleName}: ${d.ruleDescription}`, stats: [] }));
function normalizeOldDefinition(id) { const d = collectionDefinitionV12316(id); return { id: d.id, category: d.category, name: d.name, grade: d.grade, description: d.description, stats: d.stats, assist: d.assist, realmStageIndex: d.realmStageIndex, realmName: d.realmName, requiredRealmOrder: d.requiredRealmOrder, manualRole: d.manualRole, manualArchetype: d.manualArchetype, maxLevel: d.maxLevel, maxAdvance: d.maxAdvance, strengthScoreV127: d.strengthScoreV127, strengthCostWeightV127: d.strengthCostWeightV127, levelMilestones: d.levelMilestones }; }
const EXTRA_BY_ID = new Map([...HEART_METHOD_GACHA_CATALOG_V12325, ...RELIC_CATALOG_V12325].map(x => [x.id, x]));
export function collectionDefinitionV12325(id) { return EXTRA_BY_ID.get(id) ?? normalizeOldDefinition(id); }
export function collectionCatalogV12325(category) {
    const old = ['manual', 'artifact', 'pet', 'companion'].flatMap(c => collectionCatalogV12316(c).map(d => normalizeOldDefinition(d.id)));
    const all = [...old, ...HEART_METHOD_GACHA_CATALOG_V12325, ...RELIC_CATALOG_V12325];
    return category ? all.filter(x => x.category === category) : all;
}
function firstHigh(category, grade = 'immortal') { return collectionCatalogV12325(category).find(x => GRADE_ORDER.indexOf(x.grade) >= GRADE_ORDER.indexOf(grade))?.id ?? collectionCatalogV12325(category)[0]?.id ?? ''; }
export const GACHA_BANNERS_V12325 = [
    { id: 'banner.myriad', name: 'Vạn Tượng Chiêu Mộ', subtitle: 'Công Pháp · Tâm Pháp · Pháp Bảo', categories: ['manual', 'heart', 'artifact'], featuredIds: [firstHigh('manual'), firstHigh('heart'), firstHigh('artifact')] },
    { id: 'banner.spirit_bond', name: 'Linh Khế', subtitle: 'Thú Sủng · Tri Kỷ', categories: ['pet', 'companion'], featuredIds: [firstHigh('pet'), firstHigh('companion')] },
    { id: 'banner.heaven_treasure', name: 'Thiên Bảo', subtitle: 'Pháp Bảo · Chí Bảo', categories: ['artifact', 'relic'], featuredIds: [firstHigh('artifact', 'extreme'), firstHigh('relic', 'immortal')] },
];
const BANNER_BY_ID = new Map(GACHA_BANNERS_V12325.map(x => [x.id, x]));
function createTrack() { return { pulls: 0, sinceMystic: 0, sinceHeaven: 0, sinceImmortal: 0, guaranteedFeatured: false }; }
export function createCollectionEconomyStateV12325() { return { schema: COLLECTION_ECONOMY_SCHEMA_V12325, genericFragments: { heart: 120, relic: 40 }, ascensionEssence: { manual: 0, heart: 0, artifact: 0, relic: 0, pet: 0, companion: 0 }, extraItems: {}, tracks: { 'banner.myriad': createTrack(), 'banner.spirit_bond': createTrack(), 'banner.heaven_treasure': createTrack() }, history: [], daily: { dayKey: '', clearedIds: [] } }; }
export function ensureCollectionEconomyV12325(state) {
    const holder = state;
    const e = holder.economyV12325 ?? (holder.economyV12325 = createCollectionEconomyStateV12325());
    e.genericFragments ??= { heart: 0, relic: 0 };
    e.genericFragments.heart = Math.max(0, Math.floor(e.genericFragments.heart ?? 0));
    e.genericFragments.relic = Math.max(0, Math.floor(e.genericFragments.relic ?? 0));
    e.ascensionEssence ??= { manual: 0, heart: 0, artifact: 0, relic: 0, pet: 0, companion: 0 };
    for (const c of ['manual', 'heart', 'artifact', 'relic', 'pet', 'companion'])
        e.ascensionEssence[c] = Math.max(0, Math.floor(e.ascensionEssence[c] ?? 0));
    e.extraItems ??= {};
    e.tracks ??= { 'banner.myriad': createTrack(), 'banner.spirit_bond': createTrack(), 'banner.heaven_treasure': createTrack() };
    for (const b of GACHA_BANNERS_V12325)
        e.tracks[b.id] ??= createTrack();
    e.history ??= [];
    e.daily ??= { dayKey: '', clearedIds: [] };
    migrateRelicsV88(state);
    return e;
}
function weightedGrade(rng, minGrade) { const min = minGrade ? GRADE_ORDER.indexOf(minGrade) : 0; const candidates = GRADE_ORDER.slice(min); const total = candidates.reduce((s, g) => s + GRADE_RATES[g], 0); let r = rng.next() * total; for (const g of candidates) {
    r -= GRADE_RATES[g];
    if (r <= 0)
        return g;
} return candidates.at(-1); }
function gradeRollV12325(rng, t) {
    if (t.sinceImmortal >= 119)
        return { grade: weightedGrade(rng, 'immortal'), pity: '120' };
    if (t.sinceHeaven >= 59)
        return { grade: weightedGrade(rng, 'heaven'), pity: '60' };
    if (t.sinceMystic >= 9)
        return { grade: weightedGrade(rng, 'mystic'), pity: '10' };
    return { grade: weightedGrade(rng) };
}
function isAtLeast(g, min) { return GRADE_ORDER.indexOf(g) >= GRADE_ORDER.indexOf(min); }
function bannerPool(banner, grade) { const all = banner.categories.flatMap(c => collectionCatalogV12325(c)); const exact = all.filter(x => x.grade === grade); if (exact.length)
    return exact; const target = GRADE_ORDER.indexOf(grade); let best = 99; let pool = []; for (const d of all) {
    const diff = Math.abs(GRADE_ORDER.indexOf(d.grade) - target);
    if (diff < best) {
        best = diff;
        pool = [d];
    }
    else if (diff === best)
        pool.push(d);
} return pool; }
function duplicateFragmentYield(grade) { return { mundane: 8, spirit: 10, mystic: 14, earth: 20, heaven: 28, immortal: 40, extreme: 60, breaker: 90 }[grade]; }
function extraProgress(e, id) { return e.extraItems[id] ?? (e.extraItems[id] = { owned: false, level: 1, advance: 0, specificFragments: 0 }); }
function grantEconomyItem(state, e, def, knownHearts) {
    if (def.category === 'manual' || def.category === 'artifact' || def.category === 'pet' || def.category === 'companion')
        return grantCollectionItemV12316(state, def.id);
    const p = extraProgress(e, def.id);
    if (def.category === 'heart' && def.linkedPassiveId && knownHearts.has(def.linkedPassiveId))
        p.owned = true;
    const first = !p.owned;
    p.owned = true;
    if (!first)
        p.specificFragments += duplicateFragmentYield(def.grade);
    return { first, progress: { ...p }, definition: def };
}
function chooseDefinition(rng, banner, grade, t) {
    if (isAtLeast(grade, 'immortal')) {
        const featured = banner.featuredIds.map(id => collectionDefinitionV12325(id)).filter(Boolean);
        const hit = t.guaranteedFeatured || rng.next() < .5;
        if (hit && featured.length) {
            t.guaranteedFeatured = false;
            return { def: featured[Math.floor(rng.next() * featured.length)], featured: true };
        }
        t.guaranteedFeatured = true;
    }
    const pool = bannerPool(banner, grade);
    return { def: pool[Math.floor(rng.next() * pool.length)], featured: false };
}
function updateTrack(t, grade) { t.pulls += 1; t.sinceMystic = isAtLeast(grade, 'mystic') ? 0 : t.sinceMystic + 1; t.sinceHeaven = isAtLeast(grade, 'heaven') ? 0 : t.sinceHeaven + 1; t.sinceImmortal = isAtLeast(grade, 'immortal') ? 0 : t.sinceImmortal + 1; }
export function gachaCollectionEconomyV12325(state, bannerId, count, seed, usePremium = false, knownHeartPassiveIds = []) {
    const e = ensureCollectionEconomyV12325(state), banner = BANNER_BY_ID.get(bannerId);
    if (!banner)
        throw new Error('Banner gacha không tồn tại.');
    count = Math.max(1, Math.min(10, Math.floor(count)));
    const cost = count === 10 ? 1440 : 160 * count, key = usePremium ? 'immortalJade' : 'boundImmortalJade';
    if (state.currencies[key] < cost)
        throw new Error(`Không đủ ${usePremium ? 'Tiên Ngọc' : 'Tiên Ngọc Khóa'}: cần ${cost}.`);
    state.currencies[key] -= cost;
    const rng = new SeededRng(seed >>> 0), track = e.tracks[bannerId], known = new Set(knownHeartPassiveIds), results = [];
    for (let i = 0; i < count; i++) {
        const rolled = gradeRollV12325(rng, track), picked = chooseDefinition(rng, banner, rolled.grade, track), def = picked.def, before = (def.category === 'manual' || def.category === 'artifact' || def.category === 'pet' || def.category === 'companion') ? (state.items[def.id]?.specificFragments ?? 0) : (e.extraItems[def.id]?.specificFragments ?? 0), grant = grantEconomyItem(state, e, def, known), after = grant.progress.specificFragments;
        updateTrack(track, def.grade);
        const row = { id: def.id, name: def.name, category: def.category, categoryLabel: CATEGORY_LABEL[def.category], grade: def.grade, gradeLabel: COLLECTION_GRADE_LABEL_V12316[def.grade], first: grant.first, fragments: Math.max(0, after - before), featured: picked.featured, pity: rolled.pity };
        results.push(row);
        e.history.unshift({ pull: track.pulls, bannerId, itemId: def.id, name: def.name, category: def.category, grade: def.grade, gradeLabel: COLLECTION_GRADE_LABEL_V12316[def.grade], first: grant.first, fragments: row.fragments, featured: picked.featured, currency: key });
    }
    e.history = e.history.slice(0, 100);
    return { schema: COLLECTION_ECONOMY_SCHEMA_V12325, bannerId, bannerName: banner.name, cost, currency: key, results, track: { ...track }, pity: { mystic: `${track.sinceMystic}/10`, heaven: `${track.sinceHeaven}/60`, immortal: `${track.sinceImmortal}/120`, featuredGuaranteed: track.guaranteedFeatured } };
}
function oldGeneric(state, c) { return c === 'manual' || c === 'artifact' || c === 'pet' || c === 'companion' ? state.genericFragments[c] : undefined; }
function genericFragments(state, e, c) { return oldGeneric(state, c) ?? (c === 'heart' ? e.genericFragments.heart : e.genericFragments.relic); }
function addGeneric(state, e, c, amount) { if (c === 'manual' || c === 'artifact' || c === 'pet' || c === 'companion')
    state.genericFragments[c] += amount;
else if (c === 'heart')
    e.genericFragments.heart += amount;
else
    e.genericFragments.relic += amount; }
function ascensionCost(advance) { return advance < 3 ? 0 : [1, 2, 4][Math.min(2, advance - 3)]; }
function artifactFacilityLevelV88(state) { return Math.max(1, Math.floor(state.cave?.facilities?.find(x => x.id === 'artifact')?.level ?? 1)); }
function manualAdvanceResourceCostsV127(def, progress, tree = {}) {
    const fragmentCost = manualAdvanceCostV127(def, progress);
    const ordinaryCost = Math.max(1, Math.ceil(manualStrengthenCostV127(def, progress, tree) * (4 + Number(progress?.advance ?? 0) * .75)));
    const secondaryReduction = Math.max(0, Math.min(50, Number(tree.currencyCostReductionPct ?? 0)));
    const essenceBase = Math.max(1, Math.ceil((Number(progress?.advance ?? 0) + 1) / 2));
    const essenceCost = Math.max(1, Math.ceil(essenceBase * (1 - secondaryReduction / 100)));
    const historical = Math.max(0, Math.floor(Number(tree.historicalRealmOrder ?? 0)));
    const retrainSpeed = historical > Math.max(0, Math.floor(Number(def?.requiredRealmOrder ?? 0))) ? Math.max(0, Math.min(200, Number(tree.retrainSpeedPct ?? 0))) : 0;
    return { fragmentCost, ordinaryCost, essenceCost, essenceBase, retrainMaterialMultiplier: 1 / (1 + retrainSpeed / 100) };
}
function strengthenCollectionEconomyV12325LegacyV146(state, itemId, levels = 1) { const e = ensureCollectionEconomyV12325(state), d = collectionDefinitionV12325(itemId); if (d.category === 'heart')
    throw new Error('Tâm Pháp dùng Tu Luyện Tâm Pháp riêng.'); if (d.category !== 'artifact' && d.category !== 'relic')
    return strengthenCollectionItemV12316(state, itemId, levels); const p = d.category === 'relic' ? extraProgress(e, itemId) : state.items[itemId]; if (!p?.owned)
    throw new Error(`Chưa sở hữu ${d.name}.`); const facilityLevel = artifactFacilityLevelV88(state), discountPct = artifactFacilityDiscountPctV88(facilityLevel); let done = 0, cost = 0; for (let i = 0; i < Math.max(1, Math.floor(levels)); i++) {
    if (p.level >= 100)
        break;
    const c = artifactRefinementEffectiveCostV88(p, facilityLevel), available = d.category === 'relic' ? e.genericFragments.relic : state.genericFragments.artifact;
    if (available < c)
        break;
    if (d.category === 'relic')
        e.genericFragments.relic -= c;
    else
        state.genericFragments.artifact -= c;
    p.level++;
    done++;
    cost += c;
} if (!done)
    throw new Error(`Không đủ ${GENERIC_FRAGMENT_LABEL[d.category]} hoặc đã đạt Luyện Hóa 100.`); return { definition: d, levels: done, cost, facilityLevel, discountPct, progress: { ...p } }; }
function advanceCollectionEconomyV12325LegacyV146(state, itemId) { const e = ensureCollectionEconomyV12325(state), d = collectionDefinitionV12325(itemId); if (d.category === 'heart')
    throw new Error('Tâm Pháp dùng Tiến Bậc Tâm Pháp riêng.'); if (d.category === 'companion')
    return advanceCollectionItemV12316(state, itemId); if (d.category === 'manual') {
        const p=state.items[itemId]; if(!p?.owned) throw new Error(`Chưa sở hữu ${d.name}.`);
        if(p.advance>=MANUAL_ADVANCE_MAX_V127) throw new Error(`${d.name} đã Đại Viên Mãn.`);
        if(!manualCanAdvanceV127(p)) throw new Error(`${d.name} chưa đạt mốc Lv${(p.advance+1)*100} để Đột Phá Công Pháp.`);
        const tree=state.manualTreeV127??{};
        const {fragmentCost,ordinaryCost,essenceCost}=manualAdvanceResourceCostsV127(d,p,tree);
        const ordinaryHave=Math.max(0,state.genericFragments.manual??0), essenceHave=Math.max(0,e.ascensionEssence.manual??0), fragmentHave=Math.max(0,p.specificFragments??0);
        // Atomic validation: no resource is deducted until ALL three requirements pass.
        if(ordinaryHave<ordinaryCost) throw new Error(`Thiếu Công Pháp Tàn Ý: cần ${ordinaryCost}, có ${ordinaryHave}.`);
        if(essenceHave<essenceCost) throw new Error(`Thiếu Thiên Tinh Công Pháp: cần ${essenceCost}, có ${essenceHave}.`);
        if(fragmentHave<fragmentCost) throw new Error(`Thiếu mảnh riêng ${d.name}: cần ${fragmentCost}, có ${fragmentHave}.`);
        state.genericFragments.manual-=ordinaryCost; e.ascensionEssence.manual-=essenceCost; p.specificFragments-=fragmentCost; p.advance+=1;
        return {definition:d,cost:fragmentCost,ordinaryCost,essenceCost,progress:{...p}};
    } let p; if (d.category === 'relic') {
    p = extraProgress(e, itemId);
    if (!p.owned)
        throw new Error(`Chưa sở hữu ${d.name}.`);
}
else {
    p = state.items[itemId];
    if (!p?.owned)
        throw new Error(`Chưa sở hữu ${d.name}.`);
} const maxAdvance = d.category === 'relic' || d.category === 'artifact' ? 4 : d.category === 'pet' ? SPIRIT_BEAST_MAX_BLOODLINE_V86 : 6; if (p.advance >= maxAdvance)
    throw new Error(`${d.name} đã ${d.category === 'pet' ? 'đạt Huyết Mạch tối đa' : d.category === 'relic' || d.category === 'artifact' ? 'đạt Bảo Giai V' : 'tiến giai tối đa'}.`); const fragmentCost = d.category === 'relic' || d.category === 'artifact' ? artifactGradeCostV88(p) : collectionAdvanceCostV12316(p), essenceCost = d.category === 'artifact' || d.category === 'relic' ? artifactAscensionEssenceCostV88(p) : d.category === 'pet' ? ([1, 1, 2, 3, 5][Math.max(0, Math.min(4, p.advance))] ?? 5) : ascensionCost(p.advance); if (p.specificFragments < fragmentCost)
    throw new Error(`Thiếu mảnh riêng ${d.name}: cần ${fragmentCost}.`); if (e.ascensionEssence[d.category] < essenceCost)
    throw new Error(`Thiếu ${d.category === 'pet' ? 'Linh Thú Đột Phá Đan' : ASCENSION_LABEL}: cần ${essenceCost}.`); p.specificFragments -= fragmentCost; e.ascensionEssence[d.category] -= essenceCost; p.advance += 1; return { definition: d, cost: fragmentCost, essenceCost, progress: { ...p }, bloodline: d.category === 'pet' ? p.advance : undefined }; }
export function equipCollectionEconomyV12325(state, itemId, artifactCapacity = 2, artifactSlotIndex) { const e = ensureCollectionEconomyV12325(state), d = collectionDefinitionV12325(itemId); if (d.category === 'relic') {
    const p = extraProgress(e, itemId);
    if (!p.owned)
        throw new Error(`Chưa sở hữu ${d.name}.`);
    e.activeRelicId = itemId;
    return { activeRelicId: itemId };
} if (d.category === 'heart' || d.category === 'manual')
    throw new Error(`${CATEGORY_LABEL[d.category]} không dùng slot trang bị.`); if (d.category === 'artifact') {
    const result = equipArtifactSlotV88(state, itemId, artifactCapacity, artifactSlotIndex);
    return { ...result, activeRelicId: e.activeRelicId };
} equipCollectionItemV12316(state, itemId, artifactCapacity); return { activeRelicId: e.activeRelicId }; }
export function unequipCollectionEconomyV12325(state, itemId) { const e = ensureCollectionEconomyV12325(state), d = collectionDefinitionV12325(itemId); if (d.category === 'relic' && e.activeRelicId === itemId)
    e.activeRelicId = undefined;
else if (d.category !== 'heart' && d.category !== 'manual')
    unequipCollectionItemV12316(state, itemId); }
export function applyCollectionEconomyToEntityV12325(base, state) {
    const collected = applyCollectionToEntityV12316(base, state);
    if (!state)
        return collected;
    const e = ensureCollectionEconomyV12325(state);
    return { ...collected, tags: [...new Set([...collected.tags, 'CollectionEconomyV12325', ...(e.activeRelicId ? ['ActiveRelic', 'ArtifactV88Relic'] : [])])] };
}
export function heartItemIdV12325(passiveId) { return `heart.${passiveId}`; }
export function heartGenericFragmentsV12325(state) { return ensureCollectionEconomyV12325(state).genericFragments.heart; }
export function strengthenHeartMethodV12325(state, foundation, passiveId) { const e = ensureCollectionEconomyV12325(state), p = foundation.progressionV125; if (!(foundation.learnedDaoPassiveIdsV118 ?? []).includes(passiveId))
    throw new Error('Chưa lĩnh ngộ Tâm Pháp này.'); const before = Math.max(1, Math.min(HEART_METHOD_LEVEL_MAX_V12317, Math.floor(p.passiveLevels[passiveId] ?? 1))); if (before >= 20)
    throw new Error('Tâm Pháp đã Lv20; hãy Tiến Bậc.'); const baseCost = Math.ceil(8 + before * 2.2 + Math.pow(before, 1.26) * .75), cost = facilityDiscountedCostV99(state, 'scripture', baseCost); if (e.genericFragments.heart < cost)
    throw new Error(`Thiếu Tâm Pháp Tàn Quyển: cần ${cost}, có ${e.genericFragments.heart}.`); e.genericFragments.heart -= cost; p.passiveLevels[passiveId] = before + 1; return { before, after: before + 1, cost, baseCost, facilityLevel: Math.max(1, Math.floor(state.cave?.facilities?.find(x => x.id === 'scripture')?.level ?? 1)), discountPct: caveFacilityDiscountPctV99(state, 'scripture') }; }
export function advanceHeartMethodV12325(state, foundation, passiveId) { const e = ensureCollectionEconomyV12325(state), p = foundation.progressionV125; if (!(foundation.learnedDaoPassiveIdsV118 ?? []).includes(passiveId))
    throw new Error('Chưa lĩnh ngộ Tâm Pháp này.'); const beforeLevel = Math.max(1, Math.min(20, Math.floor(p.passiveLevels[passiveId] ?? 1))); if (beforeLevel < 20)
    throw new Error('Tâm Pháp cần Lv20 trước khi Tiến Bậc.'); const grade = heartMethodGradeV12317(foundation, passiveId), idx = SKILL_GRADE_ORDER_V12317.indexOf(grade); if (idx >= SKILL_GRADE_ORDER_V12317.length - 1)
    throw new Error('Tâm Pháp đã Bậc Phá.'); const itemId = heartItemIdV12325(passiveId), gp = extraProgress(e, itemId); const fragmentCost = [16, 28, 45, 70, 105, 155, 225][idx], essenceCost = idx >= 4 ? Math.max(1, idx - 3) : 0; if (gp.specificFragments < fragmentCost)
    throw new Error(`Thiếu mảnh riêng Tâm Pháp: cần ${fragmentCost}, có ${gp.specificFragments}.`); if (e.ascensionEssence.heart < essenceCost)
    throw new Error(`Thiếu ${ASCENSION_LABEL}: cần ${essenceCost}.`); gp.specificFragments -= fragmentCost; e.ascensionEssence.heart -= essenceCost; p.heartMethodGradesV12317[passiveId] = SKILL_GRADE_ORDER_V12317[idx + 1]; p.passiveLevels[passiveId] = 1; return { from: grade, to: SKILL_GRADE_ORDER_V12317[idx + 1], fragmentCost, essenceCost }; }
export const DAILY_ECONOMY_DUNGEONS_V12325 = [
    { id: 'daily.heart', name: 'Tâm Kinh Cốc', openDays: [2, 5], category: 'heart', boundJade: 0, genericFragments: 36, ascensionEssence: 1 },
    { id: 'daily.relic', name: 'Chí Bảo Tàn Giới', openDays: [0, 6], category: 'relic', boundJade: 0, genericFragments: 24, ascensionEssence: 1 },
];
function vnKey(now) { const d = new Date(now + 7 * 3600_000); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`; }
function vnDay(now) { return new Date(now + 7 * 3600_000).getUTCDay(); }
function syncDaily(e, now) { const key = vnKey(now); if (e.daily.dayKey !== key)
    e.daily = { dayKey: key, clearedIds: [] }; }
export function dailyEconomySummaryV12325(state, now = Date.now()) { const e = ensureCollectionEconomyV12325(state), key = vnKey(now), cleared = e.daily.dayKey === key ? e.daily.clearedIds : [], day = vnDay(now); return DAILY_ECONOMY_DUNGEONS_V12325.map(d => ({ ...d, open: d.openDays.includes(day), cleared: cleared.includes(d.id), reward: { boundJade: d.boundJade, summary: `${d.genericFragments} ${GENERIC_FRAGMENT_LABEL[d.category]} · ${d.ascensionEssence} ${ASCENSION_LABEL}` } })); }
export function clearDailyEconomyDungeonV12325(state, id, seed, now = Date.now()) { const e = ensureCollectionEconomyV12325(state); syncDaily(e, now); const d = DAILY_ECONOMY_DUNGEONS_V12325.find(x => x.id === id); if (!d)
    throw new Error('Phó bản tài nguyên V2 không tồn tại.'); if (!d.openDays.includes(vnDay(now)))
    throw new Error(`${d.name} hôm nay không mở.`); if (e.daily.clearedIds.includes(id))
    throw new Error(`${d.name} hôm nay đã nhận thưởng.`); e.daily.clearedIds.push(id); addGeneric(state, e, d.category, d.genericFragments); e.ascensionEssence[d.category] += d.ascensionEssence; return { dungeon: d, boundJade: d.boundJade, genericFragments: d.genericFragments, ascensionEssence: d.ascensionEssence, drops: [`${GENERIC_FRAGMENT_LABEL[d.category]} +${d.genericFragments}`, `${ASCENSION_LABEL} +${d.ascensionEssence}`] }; }
export function simulateGachaEconomyV12325(bannerId, pulls = 10000, seed = 12325) { const banner = BANNER_BY_ID.get(bannerId); if (!banner)
    throw new Error('Banner không tồn tại.'); const rng = new SeededRng(seed >>> 0), t = createTrack(), counts = Object.fromEntries(GRADE_ORDER.map(g => [g, 0])); let featured = 0, pity10 = 0, pity60 = 0, pity120 = 0; for (let i = 0; i < Math.max(1, Math.min(100000, pulls)); i++) {
    const roll = gradeRollV12325(rng, t), picked = chooseDefinition(rng, banner, roll.grade, t);
    counts[picked.def.grade]++;
    if (picked.featured)
        featured++;
    if (roll.pity === '10')
        pity10++;
    if (roll.pity === '60')
        pity60++;
    if (roll.pity === '120')
        pity120++;
    updateTrack(t, picked.def.grade);
} return { bannerId, pulls: Object.values(counts).reduce((a, b) => a + b, 0), counts, featured, pityHits: { mystic: pity10, heaven: pity60, immortal: pity120 }, finalTrack: { ...t } }; }
export function devMaxCollectionEconomyV12325(state) { const e = ensureCollectionEconomyV12325(state); state.currencies.boundImmortalJade = 9999999; state.currencies.immortalJade = 9999999; for (const c of ['manual', 'artifact', 'pet', 'companion'])
    state.genericFragments[c] = 999999; for (const c of ['manual', 'heart', 'artifact', 'relic', 'pet', 'companion'])
    e.ascensionEssence[c] = 9999; e.genericFragments.heart = 999999; e.genericFragments.relic = 999999; for (const d of collectionCatalogV12325()) {
    if (d.category === 'manual' || d.category === 'artifact' || d.category === 'pet' || d.category === 'companion') {
        const g = grantCollectionItemV12316(state, d.id);
        const p = state.items[d.id];
        p.level = d.category === 'manual' ? MANUAL_LEVEL_MAX_V127 : d.category === 'companion' || d.category === 'artifact' ? 100 : 50;
        p.advance = d.category === 'artifact' ? 4 : d.category === 'pet' ? SPIRIT_BEAST_MAX_BLOODLINE_V86 : d.category === 'companion' ? CONFIDANT_MAX_FATE_V87 - 1 : d.category === 'manual' ? MANUAL_ADVANCE_MAX_V127 : 6;
        p.specificFragments = Math.max(p.specificFragments, 9999);
        if (d.category === 'companion') { p.stars = 100; p.level = 5100; p.advance = 4; p.confidantV148Migrated = true; p.confidantHeartV148 ??= { assist: 10, guard: 10, harmony: 10, raw: 0 }; }
    }
    else {
        const p = extraProgress(e, d.id);
        p.owned = true;
        p.level = d.category === 'relic' ? 100 : 50;
        p.advance = d.category === 'relic' ? 4 : 6;
        p.specificFragments = 9999;
    }
} return e; }
function collectionEconomySummaryV12325LegacyV146(state, foundation, now = Date.now(), realmOrder = 10) {
    state = cloneCollectionProgressStateV12316(state);
    const e = ensureCollectionEconomyV12325(state), learned = new Set(foundation?.learnedDaoPassiveIdsV118 ?? []), beastBond = spiritBeastBondSummaryV86(state), fortune = confidantFortuneSummaryV87(state), activeSpecialty = activeConfidantSpecialtyV87(state);
    const categories = ['manual', 'heart', 'artifact', 'relic', 'pet', 'companion'].map(category => { const all = collectionCatalogV12325(category); const items = all.map(d => { let p; if (category === 'manual' || category === 'artifact' || category === 'pet' || category === 'companion')
        p = state.items[d.id] ?? { owned: false, level: 1, advance: 0, specificFragments: 0 };
    else
        p = e.extraItems[d.id] ?? { owned: false, level: 1, advance: 0, specificFragments: 0 }; const heartLearned = category === 'heart' && d.linkedPassiveId ? learned.has(d.linkedPassiveId) : false; const owned = Boolean(p.owned || heartLearned); const active = category === 'artifact' ? state.activeArtifactIds.includes(d.id) : category === 'pet' ? state.activePetId === d.id : category === 'companion' ? state.activeCompanionId === d.id : category === 'relic' ? e.activeRelicId === d.id : false; let heart = undefined; if (category === 'heart' && d.linkedPassiveId && foundation) {
        const lv = Math.max(1, Math.min(20, Math.floor(foundation.progressionV125?.passiveLevels[d.linkedPassiveId] ?? 1))), g = heartMethodGradeV12317(foundation, d.linkedPassiveId);
        heart = { learned: heartLearned, level: lv, grade: g, gradeLabel: SKILL_GRADE_LABEL_V12317[g], statSummary: heartMethodStatSummaryV12317(d.linkedPassiveId, lv, g) };
    } const spiritBeast = category === 'pet' ? spiritBeastViewV86(state, d.id) : undefined, confidant = category === 'companion' ? confidantViewV87(state, d.id) : undefined, artifact = category === 'artifact' ? artifactViewV88(state, d.id) : undefined, relic = category === 'relic' ? relicViewV88(state, d.id) : undefined; const maxAdvance = category === 'artifact' || category === 'relic' ? 4 : category === 'pet' ? SPIRIT_BEAST_MAX_BLOODLINE_V86 : category === 'companion' ? CONFIDANT_MAX_FATE_V87 - 1 : category === 'manual' ? MANUAL_ADVANCE_MAX_V127 : 6; const artifactFacilityLevel = artifactFacilityLevelV88(state), petEssence = category === 'artifact' || category === 'relic' ? artifactAscensionEssenceCostV88(p) : category === 'pet' ? ([1, 1, 2, 3, 5][Math.max(0, Math.min(4, p.advance || 0))] ?? 5) : ascensionCost(p.advance); const strengthenCost = owned && category !== 'heart' ? (category === 'artifact' || category === 'relic' ? artifactRefinementEffectiveCostV88(p, artifactFacilityLevel) : category === 'companion' ? facilityDiscountedCostV99(state, 'companion', confidantIntimacyCostV87(p)) : category === 'manual' ? facilityDiscountedCostV99(state, 'scripture', manualStrengthenCostV127(d, p)) : collectionStrengthenCostV12316(p)) : undefined; const advanceCost = owned && category !== 'heart' && p.advance < maxAdvance ? (category === 'artifact' || category === 'relic' ? artifactGradeCostV88(p) : category === 'companion' ? confidantFateCostV87(p) : category === 'manual' ? manualAdvanceCostV127(d, p) : collectionAdvanceCostV12316(p)) : undefined; const manualEffectMultiplier = category === 'manual' && owned ? manualEffectMultiplierV127(p) : undefined; const effectiveStats = category === 'manual' && owned ? (d.stats ?? []).map(line => ({ ...line, value: Number((line.value * manualEffectMultiplier).toFixed(3)) })) : undefined; const manualGate = category === 'manual' && owned ? (()=>{ const tree=state.manualTreeV127??{}, costs=p.advance<MANUAL_ADVANCE_MAX_V127?manualAdvanceResourceCostsV127(d,p,tree):undefined; return { nextMilestone: manualNextMilestoneV127(p), canStrengthen: manualCanStrengthenV127(p), canAdvance: manualCanAdvanceV127(p), fragmentCost: costs?.fragmentCost, ordinaryCost: costs?.ordinaryCost, essenceCost: costs?.essenceCost, retrainMaterialMultiplier: costs?.retrainMaterialMultiplier ?? 1 }; })() : undefined; return { ...d, gradeLabel: COLLECTION_GRADE_LABEL_V12316[d.grade], unlocked: manualUnlockedV127(d, realmOrder), progress: { ...p, owned }, heart, spiritBeast, confidant, artifact, relic, active, strengthenCost, advanceCost, manualEffectMultiplier, effectiveStats, manualGate, ascensionCost: owned && category !== 'heart' && category !== 'companion' && p.advance < maxAdvance ? petEssence : undefined }; }); return { category, label: CATEGORY_LABEL[category], genericFragmentName: GENERIC_FRAGMENT_LABEL[category], genericFragments: genericFragments(state, e, category), ascensionEssence: e.ascensionEssence[category], total: all.length, owned: items.filter(x => x.progress.owned).length, spiritBeastBond: category === 'pet' ? beastBond : undefined, confidantFortune: category === 'companion' ? fortune : undefined, artifactFortune: category === 'artifact' ? artifactFortuneSummaryV88(state) : undefined, artifactSlotCapacity: category === 'artifact' ? artifactSlotCapacityV88(realmOrder) : undefined, activeSpecialty: category === 'companion' ? activeSpecialty : undefined, items }; });
    const artifactFacilityLevel = artifactFacilityLevelV88(state), artifactSlotCapacity = artifactSlotCapacityV88(realmOrder);
    return { schema: COLLECTION_ECONOMY_SCHEMA_V12325, artifactV88: { slotCapacity: artifactSlotCapacity, nextSlotUnlock: artifactNextSlotUnlockV88(realmOrder), facilityLevel: artifactFacilityLevel, refinementDiscountPct: artifactFacilityDiscountPctV88(artifactFacilityLevel), activeArtifactIds: [...state.activeArtifactIds], activeRelicId: e.activeRelicId, fortune: artifactFortuneSummaryV88(state) }, currencies: { ...state.currencies }, categories, banners: GACHA_BANNERS_V12325.map(b => ({ ...b, featured: b.featuredIds.map(id => { const d = collectionDefinitionV12325(id); return { id, name: d.name, grade: d.grade, gradeLabel: COLLECTION_GRADE_LABEL_V12316[d.grade], category: d.category }; }), track: { ...e.tracks[b.id] }, pity: { mystic: `${e.tracks[b.id].sinceMystic}/10`, heaven: `${e.tracks[b.id].sinceHeaven}/60`, immortal: `${e.tracks[b.id].sinceImmortal}/120`, featuredGuaranteed: e.tracks[b.id].guaranteedFeatured } })), rates: { ...GRADE_RATES }, history: e.history.map(x => ({ ...x })), active: { relicId: e.activeRelicId, companionId: state.activeCompanionId }, confidantV87: { fortune, activeSpecialty }, daily: { dayKey: e.daily.dayKey, dungeons: dailyEconomySummaryV12325(state, now) } };
}
//# sourceMappingURL=gacha-collection-economy-v12325.js.map

// V147 canonical overrides. Legacy V146 implementation is retained above as internal fallback only.
import { spiritBeastStrengthenCostV147 } from './collection-progression-v12316.js';
import { SPIRIT_BEAST_FRAGMENT_PER_STAR_V147, spiritBeastLevelCapV147, spiritBeastStarEssenceCostV147, spiritBeastViewV147 } from './spirit-beast-v147.js';
import { CONFIDANT_FRAGMENT_PER_STAR_V148, migrateConfidantsV148, confidantStarsV148, confidantIntimacyCapV148, confidantIntimacyCostV148, confidantStarEssenceCostV148, confidantViewV148, confidantFortuneSummaryV148, activeConfidantSpecialtyV148 } from './confidant-v87.js';

function petDefinition(id){const d=collectionDefinitionV12325(id);return d?.category==='pet'?d:undefined;}
function summaryStars(progress){
  if(Number.isFinite(Number(progress?.stars)))return Math.max(0,Math.floor(Number(progress.stars)));
  return Math.max(0,Math.min(5,Math.floor(Number(progress?.advance)||0)))*4;
}

export function strengthenCollectionEconomyV12325(state,itemId,levels=1){
  if(!petDefinition(itemId))return strengthenCollectionEconomyV12325LegacyV146(state,itemId,levels);
  ensureCollectionEconomyV12325(state);
  return strengthenCollectionItemV12316(state,itemId,levels);
}

export function advanceCollectionEconomyV12325(state,itemId){
  if(!petDefinition(itemId))return advanceCollectionEconomyV12325LegacyV146(state,itemId);
  ensureCollectionEconomyV12325(state);
  const result=advanceCollectionItemV12316(state,itemId);
  return {...result,bloodline:result.stars};
}

export function collectionEconomySummaryV12325(state,foundation,now=Date.now(),realmOrder=10){
  migrateConfidantsV148(state);
  const out=collectionEconomySummaryV12325LegacyV146(state,foundation,now,realmOrder);
  const cat=out.categories?.find(x=>x.category==='pet');
  if(!cat)return out;
  cat.items=cat.items.map(item=>{
    const progress={...(item.progress??{})};
    const stars=summaryStars(progress);
    progress.stars=stars;
    progress.advance=stars;
    const liveProgress={...progress,advance:5};
    const viewState={items:{[item.id]:liveProgress},activePetId:state?.activePetId};
    const view=spiritBeastViewV147(viewState,item.id);
    const owned=Boolean(progress.owned);
    const levelCap=spiritBeastLevelCapV147(liveProgress);
    return {
      ...item,
      progress,
      spiritBeast:view?{...view,bloodline:stars,maxBloodline:stars+1}:item.spiritBeast,
      strengthenCost:owned&&Number(progress.level??1)<levelCap?spiritBeastStrengthenCostV147(state,liveProgress):undefined,
      advanceCost:owned?SPIRIT_BEAST_FRAGMENT_PER_STAR_V147:undefined,
      ascensionCost:owned?spiritBeastStarEssenceCostV147(stars):undefined,
    };
  });
  const companionCat=out.categories?.find(x=>x.category==='companion');
  if(companionCat){
    const fortune=confidantFortuneSummaryV148(state),activeSpecialty=activeConfidantSpecialtyV148(state);
    companionCat.confidantFortune=fortune;companionCat.activeSpecialty=activeSpecialty;
    companionCat.items=companionCat.items.map(item=>{
      const progress={...(item.progress??{})},stars=confidantStarsV148(progress);progress.stars=stars;
      const live={...progress,stars},viewState={items:{[item.id]:live},activeCompanionId:state?.activeCompanionId};
      const view=confidantViewV148(viewState,item.id),owned=Boolean(progress.owned),levelCap=confidantIntimacyCapV148(live);
      return {...item,progress,confidant:view,active:state?.activeCompanionId===item.id,
        strengthenCost:owned&&Number(progress.level??1)<levelCap?facilityDiscountedCostV99(state,'companion',confidantIntimacyCostV148(live)):undefined,
        advanceCost:owned?CONFIDANT_FRAGMENT_PER_STAR_V148:undefined,
        ascensionCost:owned?confidantStarEssenceCostV148(stars):undefined};
    });
    out.confidantV87={fortune,activeSpecialty};out.confidantV148={fortune,activeSpecialty};
  }
  return out;
}
