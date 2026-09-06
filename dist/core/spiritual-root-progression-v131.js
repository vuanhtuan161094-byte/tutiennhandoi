import { ELEMENT_QUALITY_V113, FIVE_ELEMENT_ROOT_IDS, ROOT_ORIGIN_IDS_V113, ROOT_ORIGIN_NAMES_V113, ROOT_LEVEL_MAX, clampRootLevel, rootEffectivenessPct, rootGrandGrade, unlockRootOriginV113, } from './build-foundation-v113.js';
import { rootOriginCombatDefinitionV132 } from './root-origin-combat-v132.js';
import { rootMilestoneSummaryV133 } from './spiritual-root-milestones-v133.js';
export const ROOT_NOURISHMENT_CONVERSION_V131 = 0.70;
export const ROOT_FOCUS_NOURISHMENT_MULTIPLIER_V131 = 2.25;
export const ROOT_BACKGROUND_NOURISHMENT_MULTIPLIER_V131 = 0.45;
export const ROOT_NEUTRAL_AFFINITY_WEIGHT_V131 = 0.12;
export const ROOT_ELEMENT_V131 = {
    metal: 'Metal', wood: 'Wood', water: 'Water', fire: 'Fire', earth: 'Earth',
};
export const ELEMENT_ROOT_V131 = {
    Metal: 'metal', Wood: 'wood', Water: 'water', Fire: 'fire', Earth: 'earth',
};
export const ROOT_NAMES_V131 = {
    metal: 'Kim Linh Căn', wood: 'Mộc Linh Căn', water: 'Thủy Linh Căn', fire: 'Hỏa Linh Căn', earth: 'Thổ Linh Căn',
};
const QUALITY_ORDER = ['common', 'spirit', 'true', 'dao'];
const QUALITY_RULES = [
    { from: 'common', to: 'spirit', minLevel: 200, count: 12, label: 'Linh Chất Tinh Hoa' },
    { from: 'spirit', to: 'true', minLevel: 500, count: 24, label: 'Chân Chất Tinh Tủy' },
    { from: 'true', to: 'dao', minLevel: 800, count: 40, label: 'Đạo Chất Bản Nguyên' },
];
export function rootQualityMaterialIdV131(root, target) {
    return `resource.root.${root}.quality.${target}`;
}
export function rootQualityMaterialNameV131(root, target) {
    const rule = QUALITY_RULES.find(x => x.to === target);
    return `${ROOT_NAMES_V131[root]} · ${rule.label}`;
}
export function nextRootQualityBreakthroughV131(foundation, root) {
    const element = ROOT_ELEMENT_V131[root];
    const current = foundation.elementQuality[element] ?? 'common';
    const rule = QUALITY_RULES.find(x => x.from === current);
    if (!rule)
        return undefined;
    return { from: rule.from, to: rule.to, minLevel: rule.minLevel, materialId: rootQualityMaterialIdV131(root, rule.to), materialName: rootQualityMaterialNameV131(root, rule.to), materialCount: rule.count };
}
export function canBreakthroughRootQualityV131(foundation, inventory, root) {
    const requirement = nextRootQualityBreakthroughV131(foundation, root);
    if (!requirement)
        return { ok: false, reason: 'Đã đạt Đạo Chất; không còn tầng Chất Hành để đột phá.' };
    const level = foundation.roots[root].level;
    if (level < requirement.minLevel)
        return { ok: false, reason: `${ROOT_NAMES_V131[root]} cần Lv${requirement.minLevel} để đủ tư cách đột phá ${ELEMENT_QUALITY_V113[requirement.to].name}.`, requirement };
    const have = Math.max(0, inventory[requirement.materialId] ?? 0);
    if (have < requirement.materialCount)
        return { ok: false, reason: `Thiếu ${requirement.materialName}: ${have}/${requirement.materialCount}.`, requirement };
    return { ok: true, requirement };
}
export function breakthroughRootQualityV131(foundation, inventory, root) {
    const check = canBreakthroughRootQualityV131(foundation, inventory, root);
    if (!check.ok || !check.requirement)
        throw new Error(check.reason ?? 'Không thể đột phá Chất Hành.');
    const r = check.requirement;
    inventory[r.materialId] = Math.max(0, (inventory[r.materialId] ?? 0) - r.materialCount);
    foundation.elementQuality[ROOT_ELEMENT_V131[root]] = r.to;
    return r;
}
/** Cost from the current level to the next level. Total curve is intentionally multi-life. */
export function rootNourishmentRequiredForNextLevelV131(level) {
    const lv = clampRootLevel(level);
    if (lv >= ROOT_LEVEL_MAX)
        return Number.POSITIVE_INFINITY;
    return 60 + lv * .65 + lv * lv * .0025;
}
function environmentElementRoots(environment) {
    const roots = [];
    for (const affinity of environment.affinities ?? []) {
        const root = ELEMENT_ROOT_V131[affinity];
        if (root && !roots.includes(root))
            roots.push(root);
    }
    return roots;
}
function rootAffinityWeight(environment, root) {
    const direct = environmentElementRoots(environment);
    if (direct.length === 0)
        return ROOT_NEUTRAL_AFFINITY_WEIGHT_V131;
    return ROOT_NEUTRAL_AFFINITY_WEIGHT_V131 + (direct.includes(root) ? (1 - ROOT_NEUTRAL_AFFINITY_WEIGHT_V131) / direct.length : 0);
}
const PROGRESSION_ORIGIN_LEVELS = [50, 150];
export function syncGuaranteedRootOriginsV131(foundation) {
    const granted = [];
    for (const root of FIVE_ELEMENT_ROOT_IDS) {
        const track = foundation.roots[root];
        track.unlocked = true;
        for (let i = 0; i < PROGRESSION_ORIGIN_LEVELS.length; i++)
            if (track.level >= PROGRESSION_ORIGIN_LEVELS[i]) {
                const id = ROOT_ORIGIN_IDS_V113[root][i];
                if (!track.knownOriginIds.includes(id)) {
                    unlockRootOriginV113(foundation, root, id);
                    granted.push(id);
                }
                if (!track.activeOriginId)
                    track.activeOriginId = id;
            }
    }
    return granted;
}
function grantProgressionOriginsV131(foundation, root, levelBefore, levelAfter) {
    const granted = [];
    for (let i = 0; i < PROGRESSION_ORIGIN_LEVELS.length; i++) {
        const at = PROGRESSION_ORIGIN_LEVELS[i];
        if (levelBefore < at && levelAfter >= at) {
            const id = ROOT_ORIGIN_IDS_V113[root][i];
            const had = foundation.roots[root].knownOriginIds.includes(id);
            unlockRootOriginV113(foundation, root, id);
            if (!foundation.roots[root].activeOriginId)
                foundation.roots[root].activeOriginId = id;
            if (!had)
                granted.push(id);
        }
    }
    return granted;
}
export function gainRootNourishmentFromCultivationV131(foundation, environment, absorbedEnergy) {
    syncGuaranteedRootOriginsV131(foundation);
    const absorbed = Math.max(0, Number(absorbedEnergy) || 0);
    const pool = absorbed * ROOT_NOURISHMENT_CONVERSION_V131;
    const gains = [];
    for (const root of FIVE_ELEMENT_ROOT_IDS) {
        const track = foundation.roots[root];
        track.unlocked = true;
        const focusMult = foundation.rootFocusId === root ? ROOT_FOCUS_NOURISHMENT_MULTIPLIER_V131 : ROOT_BACKGROUND_NOURISHMENT_MULTIPLIER_V131;
        let xp = Math.max(0, pool * rootAffinityWeight(environment, root) * focusMult);
        const before = track.level;
        let progress = Math.max(0, track.nourishmentXp ?? 0);
        while (xp > 1e-12 && track.level < ROOT_LEVEL_MAX) {
            const need = rootNourishmentRequiredForNextLevelV131(track.level) - progress;
            if (xp + 1e-12 < need) {
                progress += xp;
                xp = 0;
                break;
            }
            xp -= need;
            progress = 0;
            track.level += 1;
        }
        if (track.level >= ROOT_LEVEL_MAX)
            progress = 0;
        track.nourishmentXp = progress;
        const origins = grantProgressionOriginsV131(foundation, root, before, track.level);
        gains.push({ root, xpGain: Math.max(0, pool * rootAffinityWeight(environment, root) * focusMult), levelBefore: before, levelAfter: track.level, levelsGained: track.level - before, autoUnlockedOriginIds: origins });
    }
    return { absorbedEnergy: absorbed, focusRootId: foundation.rootFocusId, gains };
}
const ORIGIN_RULES = [
    { minRootLevel: 50, tier: 'progression', dropChancePct: 100, pity: 0, minimumGrade: null },
    { minRootLevel: 150, tier: 'progression', dropChancePct: 100, pity: 0, minimumGrade: null },
    { minRootLevel: 250, tier: 'enhanced', dropChancePct: 10, pity: 10, minimumGrade: 'enhanced' },
    { minRootLevel: 450, tier: 'elite', dropChancePct: 7, pity: 16, minimumGrade: 'elite' },
    { minRootLevel: 650, tier: 'boss', dropChancePct: 5, pity: 22, minimumGrade: 'boss' },
    { minRootLevel: 900, tier: 'apex', dropChancePct: 3, pity: 35, minimumGrade: 'boss' },
];
export const ROOT_ORIGIN_DEFINITIONS_V131 = FIVE_ELEMENT_ROOT_IDS.flatMap(root => ROOT_ORIGIN_IDS_V113[root].map((id, index) => ({ id, name: ROOT_ORIGIN_NAMES_V113[id] ?? id, root, order: index + 1, ...ORIGIN_RULES[index] })));
export function rootOriginDefinitionV131(id) { return ROOT_ORIGIN_DEFINITIONS_V131.find(x => x.id === id); }
function gradeRank(grade) { return grade === 'boss' ? 3 : grade === 'elite' ? 2 : grade === 'enhanced' ? 1 : 0; }
export function setRootOriginTargetV131(foundation, root, originId) {
    const track = foundation.roots[root];
    if (originId === undefined) {
        track.targetOriginId = undefined;
        return;
    }
    const def = rootOriginDefinitionV131(originId);
    if (!def || def.root !== root)
        throw new Error(`${originId} không thuộc ${ROOT_NAMES_V131[root]}.`);
    if (track.knownOriginIds.includes(originId))
        throw new Error(`${def.name} đã sở hữu; không cần target farm.`);
    track.targetOriginId = originId;
    track.originPity = 0;
}
function defaultEligibleTargetV131(foundation, root) {
    const track = foundation.roots[root];
    return ROOT_ORIGIN_DEFINITIONS_V131.filter(x => x.root === root && x.tier !== 'progression' && x.minRootLevel <= track.level && !track.knownOriginIds.includes(x.id)).sort((a, b) => a.order - b.order)[0];
}
export function rollTargetRootOriginV131(foundation, root, monsterGrade, roll01) {
    const track = foundation.roots[root];
    let target = track.targetOriginId ? rootOriginDefinitionV131(track.targetOriginId) : undefined;
    if (target && track.knownOriginIds.includes(target.id)) {
        track.targetOriginId = undefined;
        track.originPity = 0;
        target = undefined;
    }
    target = target ?? defaultEligibleTargetV131(foundation, root);
    if (!target)
        return { root, eligible: false, unlocked: false, pityBefore: track.originPity ?? 0, pityAfter: track.originPity ?? 0, reason: 'Chưa có Căn Nguyên target đủ điều kiện Lv.' };
    if (target.minRootLevel > track.level)
        return { root, targetId: target.id, targetName: target.name, eligible: false, unlocked: false, pityBefore: track.originPity ?? 0, pityAfter: track.originPity ?? 0, reason: `Cần ${ROOT_NAMES_V131[root]} Lv${target.minRootLevel}.` };
    const minRank = target.minimumGrade ? gradeRank(target.minimumGrade) : 0;
    if (gradeRank(monsterGrade) < minRank)
        return { root, targetId: target.id, targetName: target.name, eligible: false, unlocked: false, pityBefore: track.originPity ?? 0, pityAfter: track.originPity ?? 0, reason: `${target.name} cần quái tối thiểu ${target.minimumGrade}.` };
    const before = Math.max(0, Math.floor(track.originPity ?? 0));
    const after = before + 1;
    const hit = roll01 < target.dropChancePct / 100 || (target.pity > 0 && after >= target.pity);
    if (hit) {
        unlockRootOriginV113(foundation, root, target.id);
        if (!track.activeOriginId)
            track.activeOriginId = target.id;
        track.originPity = 0;
        if (track.targetOriginId === target.id)
            track.targetOriginId = undefined;
        return { root, targetId: target.id, targetName: target.name, eligible: true, unlocked: true, pityBefore: before, pityAfter: 0, reason: after >= target.pity && target.pity > 0 ? 'Pity bảo đảm target.' : 'Target Căn Nguyên rơi thành công.' };
    }
    track.originPity = after;
    return { root, targetId: target.id, targetName: target.name, eligible: true, unlocked: false, pityBefore: before, pityAfter: after, reason: `Target chưa rơi; pity ${after}/${target.pity}.` };
}
export function rootQualityMaterialDropsFromHuntV131(foundation, monsterElements, monsterGrade, roll01) {
    const roots = [...new Set(monsterElements.map(e => ELEMENT_ROOT_V131[e]).filter((x) => Boolean(x)))];
    const drops = [];
    for (const root of roots) {
        const next = nextRootQualityBreakthroughV131(foundation, root);
        if (!next || foundation.roots[root].level < next.minLevel)
            continue;
        let amount = 0;
        if (next.to === 'spirit') {
            const chance = monsterGrade === 'boss' ? 1 : monsterGrade === 'elite' ? .72 : monsterGrade === 'enhanced' ? .32 : 0;
            if (chance > 0 && roll01() < chance)
                amount = monsterGrade === 'boss' ? 3 : monsterGrade === 'elite' ? 2 : 1;
        }
        else if (next.to === 'true') {
            const chance = monsterGrade === 'boss' ? .78 : monsterGrade === 'elite' ? .16 : 0;
            if (chance > 0 && roll01() < chance)
                amount = monsterGrade === 'boss' ? 2 : 1;
        }
        else {
            const chance = monsterGrade === 'boss' ? .55 : 0;
            if (chance > 0 && roll01() < chance)
                amount = 1;
        }
        if (amount > 0)
            drops.push({ root, target: next.to, resourceId: next.materialId, resourceName: next.materialName, amount });
    }
    return drops;
}
const ROOT_PLAYSTYLE_V131 = {
    metal: { identity: 'Phá giáp · Phá Thế · kết liễu', strength: 'Tạo Phong Mang rồi đổi thành các nhịp xuyên giáp và phá thế chính xác.', resource: 'Phong Mang', farmHint: 'Ưu tiên môi trường Kim và mục tiêu thiên Kim; Căn Nguyên cao tầng cần quái Cường Hóa/Tinh Anh/Thủ Lĩnh.' },
    wood: { identity: 'Hồi phục · duy trì · tích lũy', strength: 'Nuôi Sinh Cơ, kéo dài giao tranh và đổi tích lũy thành nhịp thu hoạch lớn.', resource: 'Sinh Cơ', farmHint: 'Ưu tiên môi trường Mộc và mục tiêu thiên Mộc; build Mộc mạnh khi duy trì được nhịp hồi phục/DoT.' },
    water: { identity: 'Nhịp độ · khống chế · thuận thế', strength: 'Tích Lưu Thế, giữ tempo và dùng Triều Ấn để bùng nổ đúng nhịp.', resource: 'Lưu Thế / Triều Ấn', farmHint: 'Ưu tiên môi trường Thủy và mục tiêu thiên Thủy; farm Căn Nguyên theo đúng cấp quái yêu cầu.' },
    fire: { identity: 'Bộc phát · thiêu đốt · Cực Viêm', strength: 'Tăng nhiệt nhanh, duy trì Hỏa thế và tận dụng cửa sổ Cực Viêm để dồn sát thương.', resource: 'Nhiệt / Cực Viêm', farmHint: 'Ưu tiên môi trường Hỏa và mục tiêu thiên Hỏa; Căn Nguyên cao tầng cần săn boss ổn định.' },
    earth: { identity: 'Chống chịu · phản công · Trọng Thế', strength: 'Tích Trọng Thế từ giảm sát thương thật rồi chuyển phòng thủ thành nhịp phản công.', resource: 'Trọng Thế / Phản Lực', farmHint: 'Ưu tiên môi trường Thổ và mục tiêu thiên Thổ; build cần nguồn giảm sát thương thật để tích thế.' },
};
const ROOT_GRADE_LABEL_V131 = { common: 'Thường', enhanced: 'Cường Hóa', elite: 'Tinh Anh', boss: 'Thủ Lĩnh' };
function rootOriginFarmInstructionV131(def, level) {
    if (level < def.minRootLevel)
        return `Nâng ${ROOT_NAMES_V131[def.root]} đến Lv${def.minRootLevel}.`;
    if (def.tier === 'progression')
        return `Tự mở khi ${ROOT_NAMES_V131[def.root]} đạt Lv${def.minRootLevel}.`;
    return `Săn quái ${def.minimumGrade ? ROOT_GRADE_LABEL_V131[def.minimumGrade] ?? def.minimumGrade : 'phù hợp'} · ${def.dropChancePct}%/lượt hợp lệ · pity ${def.pity}.`;
}
export function rootProgressionSummaryV131(foundation, inventory) {
    syncGuaranteedRootOriginsV131(foundation);
    const roots = FIVE_ELEMENT_ROOT_IDS.map(root => { const t = foundation.roots[root]; const element = ROOT_ELEMENT_V131[root]; const quality = foundation.elementQuality[element] ?? 'common'; const breakthrough = nextRootQualityBreakthroughV131(foundation, root); const have = breakthrough ? Math.max(0, inventory[breakthrough.materialId] ?? 0) : 0; const milestones = rootMilestoneSummaryV133(root, t.level); const nourishmentRequired = t.level >= ROOT_LEVEL_MAX ? 0 : rootNourishmentRequiredForNextLevelV131(t.level); const nourishmentXp = Math.max(0, t.nourishmentXp ?? 0); const originCatalog = ROOT_ORIGIN_DEFINITIONS_V131.filter(x => x.root === root).map(def => { const combat = rootOriginCombatDefinitionV132(def.id); const owned = t.knownOriginIds.includes(def.id); return { id: def.id, name: def.name, order: def.order, minRootLevel: def.minRootLevel, tier: def.tier, dropChancePct: def.dropChancePct, pity: def.pity, minimumGrade: def.minimumGrade, owned, active: t.activeOriginId === def.id, targeted: t.targetOriginId === def.id, eligible: t.level >= def.minRootLevel, farmInstruction: rootOriginFarmInstructionV131(def, t.level), combatRole: combat?.role, combatDescription: combat?.description }; }); return { id: root, name: ROOT_NAMES_V131[root], element, level: t.level, maxLevel: ROOT_LEVEL_MAX, grandGrade: rootGrandGrade(t.level).name, effectivenessPct: rootEffectivenessPct(t.level), nourishmentXp, nourishmentRequired, nourishmentProgressPct: nourishmentRequired > 0 ? Math.max(0, Math.min(100, nourishmentXp / nourishmentRequired * 100)) : 100, qualityId: quality, qualityName: ELEMENT_QUALITY_V113[quality].name, qualityMultiplier: ELEMENT_QUALITY_V113[quality].multiplier, combatEffectivenessPct: rootEffectivenessPct(t.level) * ELEMENT_QUALITY_V113[quality].multiplier, playstyle: ROOT_PLAYSTYLE_V131[root], activeOriginId: t.activeOriginId, activeOriginName: t.activeOriginId ? ROOT_ORIGIN_NAMES_V113[t.activeOriginId] : undefined, activeOriginCombat: t.activeOriginId ? (() => { const d = rootOriginCombatDefinitionV132(t.activeOriginId); return d ? { role: d.role, description: d.description } : undefined; })() : undefined, knownOrigins: t.knownOriginIds.map(id => { const d = rootOriginCombatDefinitionV132(id); return { id, name: ROOT_ORIGIN_NAMES_V113[id] ?? id, combatRole: d?.role, combatDescription: d?.description }; }), originCatalog, targetOriginId: t.targetOriginId, targetOriginName: t.targetOriginId ? ROOT_ORIGIN_NAMES_V113[t.targetOriginId] : undefined, originPity: t.originPity ?? 0, milestonesV133: milestones, nextMilestone: milestones.next ? { level: milestones.next.level, name: milestones.next.name, description: milestones.next.description } : undefined, nextQuality: breakthrough ? { ...breakthrough, materialHave: have, eligible: t.level >= breakthrough.minLevel && have >= breakthrough.materialCount } : undefined }; });
    const ranked = [...roots].sort((a, b) => b.combatEffectivenessPct - a.combatEffectivenessPct || b.level - a.level);
    const top = ranked[0], runnerUp = ranked[1];
    const dominant = top && (!runnerUp || Math.abs(top.combatEffectivenessPct - runnerUp.combatEffectivenessPct) > .0001 || top.level !== runnerUp.level || top.qualityId !== runnerUp.qualityId) ? top : undefined;
    const focus = foundation.rootFocusId ? roots.find(x => x.id === foundation.rootFocusId) : undefined;
    return { schema: 'spiritual-root.v131', productionRevision: 'alpha.23.14', focusRootId: foundation.rootFocusId, focusRootName: foundation.rootFocusId ? ROOT_NAMES_V131[foundation.rootFocusId] : undefined, focusSwitch: { free: true, cooldownSeconds: 0, cost: 0, outsideCombatOnly: true, focusedMultiplier: ROOT_FOCUS_NOURISHMENT_MULTIPLIER_V131, backgroundMultiplier: ROOT_BACKGROUND_NOURISHMENT_MULTIPLIER_V131 }, dominantRootId: dominant?.id, dominantRootName: dominant?.name ?? 'Ngũ Căn cân bằng', dominantIdentity: dominant?.playstyle.identity ?? 'Chưa có Hành nào vượt rõ bốn căn còn lại; đây là trạng thái cân bằng, không tự gán Kim/Hỏa chỉ vì thứ tự dữ liệu.', trainingSummary: focus ? `Đang ưu tiên ${focus.name}: Dưỡng Căn ×${ROOT_FOCUS_NOURISHMENT_MULTIPLIER_V131}; bốn căn còn lại vẫn nhận nền ×${ROOT_BACKGROUND_NOURISHMENT_MULTIPLIER_V131}.` : `Chưa đặt Trọng Tâm: năm căn vẫn nhận Dưỡng Căn theo môi trường, không có căn được tăng tốc tập trung.`, combatRule: 'Linh Căn không tự biến mọi kỹ năng thành một Hành. Hành của kỹ năng chỉ có khi Công Pháp/Hành Ấn cho phép; Set Ngũ Hành và Căn Nguyên sau đó mới khuếch đại đúng package.', roots };
}
export function qualityRankV131(id) { return QUALITY_ORDER.indexOf(id); }
export function setRootFocusV131(foundation, root) {
    if (root !== undefined && !FIVE_ELEMENT_ROOT_IDS.includes(root))
        throw new Error(`Linh Căn không hợp lệ: ${root}`);
    foundation.rootFocusId = root;
    if (root)
        foundation.roots[root].unlocked = true;
}
export function activateKnownRootOriginV131(foundation, root, originId) {
    const track = foundation.roots[root];
    const def = rootOriginDefinitionV131(originId);
    if (!def || def.root !== root)
        throw new Error(`${originId} không thuộc ${ROOT_NAMES_V131[root]}.`);
    if (!track.knownOriginIds.includes(originId))
        throw new Error(`Chưa sở hữu Căn Nguyên ${def.name}.`);
    track.activeOriginId = originId;
}
//# sourceMappingURL=spiritual-root-progression-v131.js.map