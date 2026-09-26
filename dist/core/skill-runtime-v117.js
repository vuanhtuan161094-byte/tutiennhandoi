/** v1.17 Skill Runtime Contract. UI-facing names stay Vietnamese; internal ids are stable ASCII. */
export const SKILL_FORM_NAMES_V117 = {
    instant: 'Tức Thời',
    cast: 'Thi Triển',
    channel: 'Dẫn Pháp',
    charge: 'Tụ Lực',
    combo: 'Liên Kích',
    finisher: 'Kết Liễu',
    counter: 'Phản Kích',
    deploy: 'Triển Khai',
};
export const SKILL_COST_STANDARD_PCT_V117 = {
    zero: 0,
    low: 8,
    medium: 16,
    high: 28,
};
export const ULTIMATE_GAUGE_MAX_V117 = 100;
export const ULTIMATE_GAUGE_DEFAULT_COST_V117 = 100;
export const ULTIMATE_GAUGE_DEFAULT_GAIN_BASIC_V117 = 4;
export const ULTIMATE_GAUGE_DEFAULT_GAIN_ACTIVE_V117 = 6;
const elementRoot = {
    Metal: 'metal', Wood: 'wood', Water: 'water', Fire: 'fire', Earth: 'earth',
};
function inferForm(skill) {
    if (skill.channel)
        return 'channel';
    if (skill.tags.includes('Counter'))
        return 'counter';
    if (skill.tags.includes('Finisher') || skill.tags.includes('Execute'))
        return 'finisher';
    if (skill.tags.includes('Deploy') || skill.tags.includes('Formation') || skill.behaviorType === 'summonArtifact')
        return 'deploy';
    if (skill.tags.includes('Combo') || skill.behaviorType === 'multiHit')
        return 'combo';
    if (skill.behaviorType === 'chargeAttack')
        return 'charge';
    if (skill.castTime > 0)
        return 'cast';
    return 'instant';
}
function inferSlot(skill) {
    if (skill.id === 'skill.basic_strike' || skill.behaviorType === 'basicAttack')
        return 'basic';
    if (skill.behaviorType === 'rageUltimate' || skill.tags.includes('Ultimate'))
        return 'ultimate';
    return 'active';
}
function inferDao(skill) {
    if (skill.tags.includes('Sword'))
        return 'sword';
    if (skill.tags.includes('Fist') || skill.tags.includes('Punch'))
        return 'fist';
    if (skill.tags.includes('Body'))
        return 'body';
    if (skill.tags.includes('Spell'))
        return 'spell';
    if (skill.tags.includes('Poison'))
        return 'poison';
    if (skill.tags.includes('Artifact'))
        return 'artifact';
    if (skill.tags.includes('Formation'))
        return 'formation';
    if (skill.tags.includes('Mind') || skill.tags.includes('Soul'))
        return 'mind';
    return undefined;
}
function inferDomains(skill) {
    const out = new Set();
    const slot = inferSlot(skill);
    out.add(slot === 'basic' ? 'Basic' : slot === 'ultimate' ? 'Ultimate' : 'NormalActive');
    const form = inferForm(skill);
    out.add(SKILL_FORM_NAMES_V117[form].replace(/\s+/g, ''));
    for (const tag of skill.tags)
        out.add(tag);
    if (skill.primaryElement)
        out.add(skill.primaryElement);
    if (skill.effects.some(e => e.type === 'shield'))
        out.add('DefenseUtility');
    if (skill.effects.some(e => e.type === 'heal' || e.type === 'restoreSpirit'))
        out.add('DefenseUtility');
    if (skill.effects.some(e => e.type === 'damage' || e.type === 'drain' || e.type === 'consumeMarkDamage'))
        out.add('Damage');
    if (skill.effects.some(e => e.type === 'damageOverTime'))
        out.add('DoT');
    return [...out];
}
/**
 * Legacy bridge: old skills keep working without being silently re-authored. New content should author runtimeV117 explicitly.
 */
export function skillRuntimeV117(skill) {
    if (skill.runtimeV117) {
        const runtime = {
            ...skill.runtimeV117,
            domains: [...(skill.runtimeV117.domains ?? [])],
            spend: skill.runtimeV117.spend?.map(x => ({ ...x })),
            generate: skill.runtimeV117.generate?.map(x => ({ ...x })),
        };
        // Quyền Q4: Hồi Thân Phản Quyền reacts to the target's live cast/channel,
        // not the legacy boss-only activeCounterWindow mechanic. Other Counter
        // skills retain the old gate unless their authored runtime says otherwise.
        if (skill.id === 'skill.dao.fist.counter')
            runtime.requiresCounterWindow = false;
        return runtime;
    }
    return {
        form: inferForm(skill),
        slotClass: inferSlot(skill),
        daoBinding: inferDao(skill),
        primaryRoot: skill.primaryElement ? elementRoot[skill.primaryElement] : undefined,
        domains: inferDomains(skill),
        eventBudget: 1,
    };
}
export function skillSlotClassV117(skill) {
    return skillRuntimeV117(skill).slotClass ?? inferSlot(skill);
}
export function skillStandardCostPctV117(skill) {
    if (skill.spiritCostStandardPct !== undefined)
        return Math.max(0, skill.spiritCostStandardPct);
    const costClass = skill.runtimeV117?.costClass;
    return costClass ? SKILL_COST_STANDARD_PCT_V117[costClass] : 0;
}
export function skillUltimateGaugeCostV117(skill) {
    // Compatibility: an old rageUltimate/tag is not silently migrated to the new 0-100 Gauge economy.
    if (!skill.runtimeV117 || skillSlotClassV117(skill) !== 'ultimate')
        return 0;
    return Math.max(0, skill.runtimeV117.ultimateGaugeCost ?? ULTIMATE_GAUGE_DEFAULT_COST_V117);
}
export function skillUltimateGaugeGenerateV117(skill) {
    // Only explicitly migrated v1.17 skills participate in Gauge. Legacy content keeps its old combat cadence.
    if (!skill.runtimeV117)
        return 0;
    const runtime = skillRuntimeV117(skill);
    if (runtime.ultimateGaugeGenerate !== undefined)
        return Math.max(0, runtime.ultimateGaugeGenerate);
    const slot = runtime.slotClass ?? inferSlot(skill);
    if (slot === 'ultimate')
        return 0;
    return slot === 'basic' ? ULTIMATE_GAUGE_DEFAULT_GAIN_BASIC_V117 : ULTIMATE_GAUGE_DEFAULT_GAIN_ACTIVE_V117;
}
export function skillDomainsV117(skill) {
    const runtime = skillRuntimeV117(skill);
    const out = new Set([...(runtime.domains ?? []), ...inferDomains(skill)]);
    if (runtime.daoBinding)
        out.add(`Dao:${runtime.daoBinding}`);
    if (runtime.primaryRoot) {
        out.add(`Root:${runtime.primaryRoot}`);
        out.add('HasRoot');
    }
    if (runtime.costClass)
        out.add(`Cost:${runtime.costClass}`);
    if (runtime.form === 'finisher')
        out.add('Finisher');
    if (runtime.form === 'counter')
        out.add('Counter');
    if (runtime.form === 'channel')
        out.add('Channel');
    if (runtime.form === 'cast')
        out.add('Cast');
    return [...out];
}
export function validateSkillRuntimeV117(skill) {
    const errors = [];
    const r = skillRuntimeV117(skill);
    if ((r.domains ?? []).some(x => x.toLowerCase() === 'totaldamage'))
        errors.push(`${skill.id}: runtime domain TotalDamage bị cấm.`);
    if (r.slotClass === 'ultimate' && (r.ultimateGaugeGenerate ?? 0) > 0)
        errors.push(`${skill.id}: Tuyệt Kỹ không được tự Generate Gauge trong cùng action.`);
    if ((r.spend ?? []).some(x => typeof x.amount === 'number' && x.amount < 0))
        errors.push(`${skill.id}: Spend âm.`);
    if ((r.generate ?? []).some(x => typeof x.amount === 'number' && x.amount < 0))
        errors.push(`${skill.id}: Generate âm.`);
    return errors;
}
//# sourceMappingURL=skill-runtime-v117.js.map