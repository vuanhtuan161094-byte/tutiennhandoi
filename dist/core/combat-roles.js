import { skillDomainsV117, skillRuntimeV117 } from './skill-runtime-v117.js';
function stabilityDamage(skill) {
    return skill.effects.reduce((sum, effect) => {
        if (effect.type === 'damage' || effect.type === 'drain')
            return sum + (effect.stabilityDamage ?? 0);
        if (effect.type === 'damageOverTime')
            return sum + (effect.stabilityDamagePerTick ?? 0) * effect.ticks;
        if (effect.type === 'consumeMarkDamage')
            return sum + (effect.stabilityDamagePerStack ?? 0) * effect.maxConsume;
        return sum;
    }, 0);
}
function damageHits(skill) {
    return skill.effects.filter(effect => effect.type === 'damage' || effect.type === 'drain').length;
}
export function tacticalIdentity(skill, registry) {
    const roles = new Set();
    const setupMarks = skill.effects.filter((effect) => effect.type === 'addMark').map(effect => effect.mark);
    const finisherMarks = skill.effects.filter((effect) => effect.type === 'consumeMarkDamage').map(effect => effect.mark);
    const runtime = skillRuntimeV117(skill);
    const domains = new Set(skillDomainsV117(skill));
    // Bản Đạo V2 authors tactical identity primarily through runtime domains/form.
    // Boss counter windows must consume the same canonical skill truth instead of requiring duplicate UI tags.
    if (domains.has('Break') || domains.has('PháThế') || domains.has('Heavy'))
        roles.add('Break');
    if (domains.has('Finisher')) {
        roles.add('Finisher');
        roles.add('Burst');
    }
    if (domains.has('Counter') || runtime.form === 'counter')
        roles.add('Counter');
    if (domains.has('Combo'))
        roles.add('MultiHit');
    if (domains.has('DoT'))
        roles.add('DoT');
    if (domains.has('MindInterfere'))
        roles.add('Control');
    for (const tag of skill.tags) {
        if (tag === 'Burst')
            roles.add('Burst');
        if (tag === 'MultiHit')
            roles.add('MultiHit');
        if (tag === 'Movement')
            roles.add('Chase');
        if (tag === 'Control')
            roles.add('Control');
        if (tag === 'Cleanse')
            roles.add('Cleanse');
        if (tag === 'DoT')
            roles.add('DoT');
        if (tag === 'Shield')
            roles.add('Barrier');
        if (tag === 'Heal')
            roles.add('Sustain');
        if (tag === 'Setup')
            roles.add('Setup');
        if (tag === 'Finisher')
            roles.add('Finisher');
        if (tag === 'Execute')
            roles.add('Execute');
        if (tag === 'Counter')
            roles.add('Counter');
        if (tag === 'Interrupt')
            roles.add('Interrupt');
        if (tag === 'Accuracy')
            roles.add('Accuracy');
    }
    if (damageHits(skill) >= 3)
        roles.add('MultiHit');
    if (stabilityDamage(skill) >= 45 || skill.tags.includes('Heavy'))
        roles.add('Break');
    if (setupMarks.length > 0)
        roles.add('Setup');
    if (finisherMarks.length > 0) {
        roles.add('Finisher');
        roles.add('Burst');
    }
    if (skill.effects.some(effect => effect.type === 'damageOverTime'))
        roles.add('DoT');
    if (skill.effects.some(effect => effect.type === 'shield'))
        roles.add('Barrier');
    if (skill.effects.some(effect => effect.type === 'heal' || effect.type === 'drain'))
        roles.add('Sustain');
    if (skill.effects.some(effect => effect.type === 'restoreSpirit'))
        roles.add('Resource');
    if (skill.effects.some(effect => effect.type === 'removeStatus')) {
        roles.add('Cleanse');
        roles.add('AntiControl');
    }
    for (const effect of skill.effects) {
        if (effect.type !== 'applyStatus')
            continue;
        const status = registry.status(effect.statusId);
        if ((status.healingReceivedMultiplier ?? 1) < 0.8)
            roles.add('AntiHeal');
        if (status.group === 'BodyControl' || status.group === 'SpiritControl') {
            roles.add('Control');
            if (status.disablesActions)
                roles.add('Interrupt');
        }
        if (effect.target === 'self' && (status.resolveMultiplier ?? 1) > 1.05)
            roles.add('AntiControl');
        if (effect.target === 'self' && (status.accuracyMultiplier ?? 1) > 1.05)
            roles.add('Accuracy');
        if (effect.target === 'self' && ((status.mobilityMultiplier ?? 1) > 1.05 || (status.actionSpeedMultiplier ?? 1) > 1.05))
            roles.add('Chase');
    }
    return { roles: [...roles], setupMarks: [...new Set(setupMarks)], finisherMarks: [...new Set(finisherMarks)] };
}
export function skillHasRole(skill, role, registry) {
    return tacticalIdentity(skill, registry).roles.includes(role);
}
export function roleSummary(skill, registry) {
    const identity = tacticalIdentity(skill, registry);
    return identity.roles.length > 0 ? identity.roles.join(' · ') : 'Damage';
}
//# sourceMappingURL=combat-roles.js.map