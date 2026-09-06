import { bloodlineDefinition, bloodlineRarityFactor, createBloodlineRoll, nextBloodlineGrade, nextPhysiqueStage, recomputeBloodlineEffects, recomputePhysiqueEffects } from './birth-origins-v101.js';
export const BLOODLINE_ESSENCE_RESOURCE_ID = 'resource.bloodline_essence';
export const BODY_ESSENCE_RESOURCE_ID = 'resource.body_essence';
export const BODY_BREAKTHROUGH_RESOURCE_ID = 'resource.body_breakthrough_crystal';
export const BLOODLINE_PROTECTION_RESOURCE_ID = 'resource.bloodline_protection';
export const TRUE_BLOOD_RESOURCE_PREFIX = 'resource.true_blood.';
const GRADE_GATE = { 'Phàm': 0, 'Linh': 10, 'Huyền': 14, 'Địa': 18, 'Thiên': 22, 'Tiên': 26, 'Cực': 34, 'Phá': 42 };
const GRADE_COST = { 'Phàm': 0, 'Linh': 24, 'Huyền': 42, 'Địa': 72, 'Thiên': 120, 'Tiên': 190, 'Cực': 300, 'Phá': 480 };
const PURITY_COST = { 'Phàm': 1, 'Linh': 1.5, 'Huyền': 2.1, 'Địa': 3, 'Thiên': 4.2, 'Tiên': 6, 'Cực': 8.5, 'Phá': 12 };
const BASE_BACKLASH = { 'Phàm': 0, 'Linh': 0, 'Huyền': 2, 'Địa': 5, 'Thiên': 10, 'Tiên': 16, 'Cực': 25, 'Phá': 35 };
const PHYSIQUE_GATE = { 'Phàm Thể': 0, 'Sơ Tỉnh': 1, 'Nhập Môn': 10, 'Tiểu Thành': 18, 'Đại Thành': 22, 'Viên Mãn': 26 };
const PHYSIQUE_COST = { 'Phàm Thể': 0, 'Sơ Tỉnh': 0, 'Nhập Môn': 45, 'Tiểu Thành': 90, 'Đại Thành': 170, 'Viên Mãn': 300 };
function shortBloodlineId(id) { return id.replace(/^bloodline\.v101\./, ''); }
export function trueBloodResourceId(id) { return `${TRUE_BLOOD_RESOURCE_PREFIX}${shortBloodlineId(id)}`; }
function requireResource(inv, id, amount) { const have = inv[id] ?? 0; if (have + 1e-9 < amount)
    throw new Error(`Thiếu ${id}: ${have.toFixed(0)}/${amount.toFixed(0)}`); }
function spend(inv, id, amount) { requireResource(inv, id, amount); inv[id] = (inv[id] ?? 0) - amount; }
function originMultiplier(kind) { return kind === 'SWAPPED' ? 1.6 : kind === 'IMPLANTED' ? 2 : 1; }
function protectionMultiplier(kind) { return kind === 'SWAPPED' ? 2 : kind === 'IMPLANTED' ? 3 : 1; }
function incompatibilityPenalty(kind, purity) { if (kind === 'SWAPPED')
    return Math.max(0, 35 * (1 - purity / 100)); if (kind === 'IMPLANTED')
    return Math.max(0, 50 * (1 - purity / 100)); return 0; }
export function effectiveBloodlineEffects(bundle) {
    const b = recomputeBloodlineEffects(bundle.bloodline);
    const penalty = incompatibilityPenalty(b.originKind, b.purity) / 100;
    if (penalty <= 0)
        return b.effects;
    return Object.fromEntries(Object.entries(b.effects).map(([k, v]) => [k, (v ?? 0) * (1 - penalty)]));
}
export function bloodlineProgressSummary(bundle, realmOrder, inv, facilityCostMultiplier = 1) {
    const b = bundle.bloodline;
    if (b.band === 'NONE')
        return { available: false, name: b.name, reason: 'Vô Huyết Mạch', canPurify: false, canAdvance: false };
    const next = nextBloodlineGrade(b.grade);
    const rarity = bloodlineRarityFactor(b.band);
    const purityCostRaw = Math.max(0.01, PURITY_COST[b.grade] * rarity * originMultiplier(b.originKind) * facilityCostMultiplier);
    const purityCost = Number(purityCostRaw.toFixed(2));
    const nextCost = next ? Math.max(1, Math.ceil(GRADE_COST[next] * rarity * originMultiplier(b.originKind) * facilityCostMultiplier)) : 0;
    const protectionCost = next ? Math.max(1, Math.ceil(Math.max(1, BASE_BACKLASH[next] / 5) * rarity * protectionMultiplier(b.originKind))) : 0;
    return { available: true, name: b.name, grade: b.grade, purity: b.purity, originKind: b.originKind ?? 'NATIVE', incompatibilityPct: incompatibilityPenalty(b.originKind, b.purity), purityCostPerPoint: purityCost, canPurify: b.purity < 100 && (inv[BLOODLINE_ESSENCE_RESOURCE_ID] ?? 0) >= purityCost, nextGrade: next, nextRealmGate: next ? GRADE_GATE[next] : undefined, advanceEssenceCost: nextCost, protectionCost, trueBloodId: next && ['Cực', 'Phá'].includes(next) ? trueBloodResourceId(b.id) : undefined, canAdvance: Boolean(next && b.purity >= 100 && realmOrder >= GRADE_GATE[next] && (inv[BLOODLINE_ESSENCE_RESOURCE_ID] ?? 0) >= nextCost) };
}
export function purifyBloodline(bundle, inv, points = 10, facilityCostMultiplier = 1) {
    const b = bundle.bloodline;
    if (b.band === 'NONE')
        throw new Error('Nhân vật hiện Vô Huyết Mạch.');
    const wanted = Math.max(1, Math.min(100 - b.purity, Math.floor(points)));
    if (wanted <= 0)
        throw new Error('Độ Thuần đã đạt 100%.');
    const unit = Math.max(0.01, PURITY_COST[b.grade] * bloodlineRarityFactor(b.band) * originMultiplier(b.originKind) * facilityCostMultiplier);
    const affordable = Math.min(wanted, Math.floor(((inv[BLOODLINE_ESSENCE_RESOURCE_ID] ?? 0) + 1e-9) / unit));
    if (affordable <= 0)
        throw new Error(`Thiếu Huyết Tinh: cần ${Math.ceil(unit)} cho 1% Độ Thuần.`);
    const totalCost = Math.max(1, Math.ceil(affordable * unit - 1e-9));
    spend(inv, BLOODLINE_ESSENCE_RESOURCE_ID, totalCost);
    b.purity = Math.min(100, b.purity + affordable);
    b.effects = effectiveBloodlineEffects(bundle);
    if (b.purity >= 100)
        b.incompatibilityActive = false;
    return { points: affordable, cost: totalCost, purity: b.purity, incompatibilityPct: incompatibilityPenalty(b.originKind, b.purity) };
}
export function advanceBloodlineGrade(bundle, realmOrder, inv, body, rng, useProtection = false, facilityCostMultiplier = 1) {
    const b = bundle.bloodline;
    if (b.band === 'NONE')
        throw new Error('Vô Huyết Mạch không thể thăng phẩm; cần Tạo Huyết trước.');
    if (b.purity < 100)
        throw new Error('Độ Thuần phải đạt 100% trước khi thăng phẩm.');
    const next = nextBloodlineGrade(b.grade);
    if (!next)
        throw new Error('Huyết Mạch đã đạt Phá phẩm.');
    if (realmOrder < GRADE_GATE[next])
        throw new Error(`Cảnh giới chưa đủ để thăng Huyết Mạch lên ${next}.`);
    const rarity = bloodlineRarityFactor(b.band);
    const essenceCost = Math.max(1, Math.ceil(GRADE_COST[next] * rarity * originMultiplier(b.originKind) * facilityCostMultiplier));
    let trueBloodId;
    if (next === 'Cực' || next === 'Phá')
        trueBloodId = trueBloodResourceId(b.id);
    const base = BASE_BACKLASH[next] * originMultiplier(b.originKind);
    let protectionCost = 0;
    if (useProtection && base > 0)
        protectionCost = Math.max(1, Math.ceil(Math.max(1, BASE_BACKLASH[next] / 5) * rarity * protectionMultiplier(b.originKind)));
    // Atomic validation: never consume one rare material before discovering another requirement is missing.
    requireResource(inv, BLOODLINE_ESSENCE_RESOURCE_ID, essenceCost);
    if (trueBloodId)
        requireResource(inv, trueBloodId, 1);
    if (protectionCost > 0)
        requireResource(inv, BLOODLINE_PROTECTION_RESOURCE_ID, protectionCost);
    spend(inv, BLOODLINE_ESSENCE_RESOURCE_ID, essenceCost);
    if (trueBloodId)
        spend(inv, trueBloodId, 1);
    if (protectionCost > 0)
        spend(inv, BLOODLINE_PROTECTION_RESOURCE_ID, protectionCost);
    const backlash = !useProtection && base > 0 && rng.chance(Math.min(75, base));
    if (backlash) {
        body.injury = Math.min(100, body.injury + Math.max(6, Math.round(base * .75)));
    }
    b.grade = next;
    b.purity = 0;
    b.effects = effectiveBloodlineEffects(bundle);
    return { grade: next, essenceCost, trueBloodId, protectionCost, backlash, backlashChancePct: Math.min(75, base) };
}
export function progressPhysique(bundle, realmOrder, inv, facilityCostMultiplier = 1) {
    const p = bundle.physique;
    if (p.band === 'NONE')
        throw new Error('Phàm Thể chưa có Thể Chất đặc biệt để tu luyện.');
    const next = nextPhysiqueStage(p.stage);
    if (!next)
        throw new Error('Thể Chất đã Viên Mãn.');
    if (realmOrder < PHYSIQUE_GATE[next])
        throw new Error(`Cảnh giới chưa đủ để Thể Chất đạt ${next}.`);
    const rarity = bloodlineRarityFactor(p.band);
    const cost = Math.max(1, Math.ceil(PHYSIQUE_COST[next] * rarity * facilityCostMultiplier));
    const breakthroughCost = (next === 'Đại Thành' || next === 'Viên Mãn') ? Math.max(1, Math.ceil(rarity * (next === 'Viên Mãn' ? 2 : 1))) : 0;
    requireResource(inv, BODY_ESSENCE_RESOURCE_ID, cost);
    if (breakthroughCost)
        requireResource(inv, BODY_BREAKTHROUGH_RESOURCE_ID, breakthroughCost);
    spend(inv, BODY_ESSENCE_RESOURCE_ID, cost);
    if (breakthroughCost)
        spend(inv, BODY_BREAKTHROUGH_RESOURCE_ID, breakthroughCost);
    p.stage = next;
    p.effects = recomputePhysiqueEffects(p).effects;
    return { stage: next, cost, breakthroughCost };
}
export function physiqueProgressSummary(bundle, realmOrder, inv, facilityCostMultiplier = 1) {
    const p = bundle.physique;
    if (p.band === 'NONE')
        return { available: false, name: p.name, stage: p.stage };
    const next = nextPhysiqueStage(p.stage);
    const rarity = bloodlineRarityFactor(p.band), cost = next ? Math.max(1, Math.ceil(PHYSIQUE_COST[next] * rarity * facilityCostMultiplier)) : 0, breakthroughCost = next && (next === 'Đại Thành' || next === 'Viên Mãn') ? Math.max(1, Math.ceil(rarity * (next === 'Viên Mãn' ? 2 : 1))) : 0;
    return { available: true, name: p.name, stage: p.stage, nextStage: next, nextRealmGate: next ? PHYSIQUE_GATE[next] : undefined, cost, breakthroughCost, canAdvance: Boolean(next && realmOrder >= PHYSIQUE_GATE[next] && (inv[BODY_ESSENCE_RESOURCE_ID] ?? 0) >= cost && (inv[BODY_BREAKTHROUGH_RESOURCE_ID] ?? 0) >= breakthroughCost) };
}
export function swapBloodline(bundle, targetId, inv) {
    const current = bundle.bloodline;
    if (current.band === 'NONE')
        throw new Error('Vô Huyết Mạch phải dùng Tạo Huyết, không thể Hoán Huyết.');
    if (current.switchedThisLife)
        throw new Error('Mỗi đời chỉ được Hoán Huyết một lần.');
    if (targetId === current.id)
        throw new Error('Không thể Hoán sang chính Huyết Mạch hiện tại.');
    const target = bloodlineDefinition(targetId);
    if (!target)
        throw new Error(`Không có Huyết Mạch: ${targetId}`);
    const trueId = trueBloodResourceId(targetId);
    const essenceCost = Math.ceil(50 * bloodlineRarityFactor(target.band));
    requireResource(inv, trueId, 1);
    requireResource(inv, BLOODLINE_ESSENCE_RESOURCE_ID, essenceCost);
    spend(inv, trueId, 1);
    spend(inv, BLOODLINE_ESSENCE_RESOURCE_ID, essenceCost);
    const replacement = createBloodlineRoll(targetId, 'SWAPPED', current.grade);
    replacement.switchedThisLife = true;
    replacement.incompatibilityActive = true;
    bundle.bloodline = replacement;
    return replacement;
}
export function implantBloodline(bundle, targetId, inv) {
    if (bundle.bloodline.band !== 'NONE')
        throw new Error('Chỉ Vô Huyết Mạch mới dùng Tạo Huyết.');
    const target = bloodlineDefinition(targetId);
    if (!target)
        throw new Error(`Không có Huyết Mạch: ${targetId}`);
    const trueId = trueBloodResourceId(targetId);
    const essenceCost = Math.ceil(80 * bloodlineRarityFactor(target.band));
    requireResource(inv, trueId, 1);
    requireResource(inv, BLOODLINE_ESSENCE_RESOURCE_ID, essenceCost);
    spend(inv, trueId, 1);
    spend(inv, BLOODLINE_ESSENCE_RESOURCE_ID, essenceCost);
    const replacement = createBloodlineRoll(targetId, 'IMPLANTED', 'Phàm');
    replacement.incompatibilityActive = true;
    bundle.bloodline = replacement;
    return replacement;
}
//# sourceMappingURL=origin-progression-v102.js.map