import { ROOT_MILESTONE_TEMPLATE } from './build-foundation-v113.js';
import { skillRuntimeV117 } from './skill-runtime-v117.js';
export const SPIRITUAL_ROOT_MILESTONE_SCHEMA_V133 = 'spiritual-root-milestones.v133';
const ROOT_NAMES = { metal: 'Kim', wood: 'Mộc', water: 'Thủy', fire: 'Hỏa', earth: 'Thổ' };
const SUFFIX = ['Sơ Dẫn', 'Tụ Tức', 'Dẫn Mạch', 'Hợp Khí', 'Nội Uẩn', 'Tiểu Chu Thiên', 'Ngưng Tính', 'Linh Hợp', 'Tàng Ý', 'Hóa Cơ', 'Chân Tức', 'Địa Mạch', 'Thiên Hợp', 'Chân Căn', 'Đạo Ý', 'Hợp Đạo', 'Tiên Uẩn', 'Đạo Tướng', 'Thần Ý', 'Đạo Thể', 'Cực Ý', 'Viên Cực'];
const MAJOR = new Set([100, 300, 500, 700, 900, 1000]);
function baseEffect(root, level, i) {
    const major = MAJOR.has(level);
    const role = level === 1000 ? 'capstone' : major ? (root === 'metal' ? 'break' : root === 'wood' || root === 'earth' ? 'guard' : root === 'water' ? 'tempo' : 'payoff') : (i % 2 === 0 ? 'growth' : 'payoff');
    if (root === 'metal')
        return { role, generatePct: i % 3 === 0 ? 1.2 : .45, payoffPct: i % 3 !== 0 ? 1.3 : .55, breakPct: major ? 2.5 : 0 };
    if (root === 'wood')
        return { role, generatePct: i % 2 === 0 ? 1.35 : .55, payoffPct: i % 2 ? 1.0 : .35, matchingEffectPct: major ? 2.5 : 0 };
    if (root === 'water')
        return { role, generatePct: i % 2 === 0 ? 1.15 : .50, payoffPct: i % 2 ? 0.85 : .30, recoveryReductionPct: major ? 1.5 : 0, spiritCostReductionPct: level >= 500 && major ? 1 : 0 };
    if (root === 'fire')
        return { role, generatePct: i % 3 === 0 ? 1.2 : .45, payoffPct: i % 3 !== 0 ? 1.35 : .55, matchingEffectPct: major ? 2.25 : 0 };
    return { role, generatePct: i % 2 === 0 ? 1.1 : .45, payoffPct: i % 2 ? 0.85 : .30, matchingEffectPct: major ? 2.8 : 0, breakPct: level >= 700 && major ? 1.5 : 0 };
}
function desc(root, e, level) {
    const parts = [];
    if (e.generatePct)
        parts.push(`Generate Hành +${e.generatePct}%`);
    if (e.payoffPct)
        parts.push(`Payoff Hành +${e.payoffPct}%`);
    if (e.matchingEffectPct)
        parts.push(`package hợp Hành +${e.matchingEffectPct}%`);
    if (e.breakPct)
        parts.push(`Phá Thế hợp Hành +${e.breakPct}%`);
    if (e.recoveryReductionPct)
        parts.push(`Thu Chiêu hợp Hành -${e.recoveryReductionPct}%`);
    if (e.spiritCostReductionPct)
        parts.push(`CN hợp Hành -${e.spiritCostReductionPct}%`);
    return `${ROOT_NAMES[root]} Linh Căn Lv${level}: ${parts.join(' · ')}.`;
}
export const ROOT_MILESTONE_DEFINITIONS_V133 = ['metal', 'wood', 'water', 'fire', 'earth'].flatMap(root => ROOT_MILESTONE_TEMPLATE.map((level, i) => { const e = baseEffect(root, level, i); return { root, level, name: `${ROOT_NAMES[root]} · ${SUFFIX[i]}`, description: desc(root, e, level), ...e }; }));
function level(entity, root) { return Math.max(0, Math.min(1000, Math.floor(entity.combatBuildV117?.rootLevelsV133?.[root] ?? 0))); }
function unlocked(entity, root) { const lv = level(entity, root); return ROOT_MILESTONE_DEFINITIONS_V133.filter(x => x.root === root && x.level <= lv); }
const sum = (entity, root, key) => unlocked(entity, root).reduce((a, x) => a + (typeof x[key] === 'number' ? Number(x[key]) : 0), 0);
export function rootMilestoneGenerateMultiplierV133(entity, root) { return 1 + sum(entity, root, 'generatePct') / 100; }
export function rootMilestonePayoffMultiplierV133(entity, root) { return 1 + sum(entity, root, 'payoffPct') / 100; }
export function rootMilestoneSpiritCostPctV133(entity, skill) { const root = skillRuntimeV117(skill).primaryRoot ?? entity.combatBuildV117?.skillRootBindingsV118?.[skill.id]; return root ? -Math.min(12, sum(entity, root, 'spiritCostReductionPct')) : 0; }
export function rootMilestoneCastRecoveryMultiplierV133(entity, skill) { const root = skillRuntimeV117(skill).primaryRoot ?? entity.combatBuildV117?.skillRootBindingsV118?.[skill.id]; return root ? Math.max(.82, 1 - sum(entity, root, 'recoveryReductionPct') / 100) : 1; }
export function rootMilestoneActionBonusV133(entity, skill, action) { const root = skillRuntimeV117(skill).primaryRoot ?? entity.combatBuildV117?.skillRootBindingsV118?.[skill.id]; if (!root)
    return; action.effectBonusPct += sum(entity, root, 'matchingEffectPct'); action.breakBonusPct += sum(entity, root, 'breakPct'); }
export function rootMilestoneResourceCapV133(entity, resource, base) { const r = resource.startsWith('metal') ? 'metal' : resource.startsWith('wood') ? 'wood' : resource.startsWith('water') ? 'water' : resource.startsWith('fire') ? 'fire' : 'earth'; const lv = level(entity, r); if (resource === 'waterTide' && lv >= 900)
    return Math.max(base, 4); if (resource === 'earthWeight' && lv >= 900)
    return base * 1.15; if (resource === 'earthRecoil' && lv >= 1000)
    return Math.max(base, 120); return base; }
export function rootMilestoneFireExtremeRequirementPctV133(entity) { const lv = level(entity, 'fire'); return lv >= 1000 ? 88 : lv >= 900 ? 92 : lv >= 700 ? 96 : 100; }
export function rootMilestoneWoodHarvestRequirementPctV133(entity) { const lv = level(entity, 'wood'); return lv >= 1000 ? 88 : lv >= 900 ? 92 : lv >= 700 ? 96 : 100; }
export function rootMilestoneFireExtremeDurationBonusSecondsV133(entity) { const lv = level(entity, 'fire'); return lv >= 1000 ? 1.5 : lv >= 900 ? 1 : lv >= 700 ? 0.5 : 0; }
export function rootMilestoneHuntSkillTuningV133(entity, skill) {
    const root = skillRuntimeV117(skill).primaryRoot ?? entity.combatBuildV117?.skillRootBindingsV118?.[skill.id];
    if (!root)
        return { effectPct: 0, breakPct: 0, costPct: 0, cyclePct: 0 };
    const role = skill.daoRuntimeV118?.elementRole;
    const generate = sum(entity, root, 'generatePct'), payoff = sum(entity, root, 'payoffPct'), matching = sum(entity, root, 'matchingEffectPct');
    const effectPct = matching + (role === 'signature' ? payoff * .65 : role === 'spend' ? payoff * .50 : role === 'generate' ? generate * .22 : matching * .35);
    return { effectPct, breakPct: sum(entity, root, 'breakPct'), costPct: -Math.min(12, sum(entity, root, 'spiritCostReductionPct')), cyclePct: -Math.min(18, sum(entity, root, 'recoveryReductionPct')) * .5 };
}
export function rootMilestoneSummaryV133(root, lv) { const unlockedDefs = ROOT_MILESTONE_DEFINITIONS_V133.filter(x => x.root === root && x.level <= lv); return { schema: SPIRITUAL_ROOT_MILESTONE_SCHEMA_V133, root, level: lv, unlocked: unlockedDefs, next: ROOT_MILESTONE_DEFINITIONS_V133.find(x => x.root === root && x.level > lv) }; }
//# sourceMappingURL=spiritual-root-milestones-v133.js.map