import { skillRuntimeV117, skillSlotClassV117 } from './skill-runtime-v117.js';
export const ELEMENT_SEAL_SCHEMA_V133 = 'element-seal.v133';
export const ELEMENT_SEAL_MIN_TECHNIQUE_MASTERY_V133 = 20;
const ROOT_ELEMENT_V133 = { metal: 'Metal', wood: 'Wood', water: 'Water', fire: 'Fire', earth: 'Earth' };
function equippedTechniqueIds(state) { return [...new Set([state.activeTechniqueId, state.equippedTechniqueIds?.art, state.equippedTechniqueIds?.movement, state.equippedTechniqueIds?.secret].filter((x) => Boolean(x)))]; }
function techniqueCanTouchSkill(def, skill) {
    const c = def.contentV119;
    if (!c)
        return false;
    if (def.slot === 'art') {
        if ((def.grantedSkillIds ?? []).length > 0 && !(def.grantedSkillIds ?? []).includes(skill.id))
            return false;
        const dao = skillRuntimeV117(skill).daoBinding;
        if ((c.daoBindings?.length ?? 0) > 0 && (!dao || !c.daoBindings.includes(dao)))
            return false;
    }
    return true;
}
export function elementSealCandidatesV133(state, skill, lookupTechnique) {
    const byRoot = new Map();
    for (const id of equippedTechniqueIds(state)) {
        let def;
        try {
            def = lookupTechnique(id);
        }
        catch {
            continue;
        }
        const c = def.contentV119;
        if (!c || !techniqueCanTouchSkill(def, skill))
            continue;
        const mastery = Math.max(0, Math.min(100, state.techniqueMastery[id] ?? 0));
        if (mastery + 1e-9 < ELEMENT_SEAL_MIN_TECHNIQUE_MASTERY_V133)
            continue;
        if (c.elementMode === 'fixed' && c.fixedRoot) {
            const x = byRoot.get(c.fixedRoot) ?? { sources: new Set(), forced: true };
            x.forced = true;
            x.sources.add(def.name);
            byRoot.set(c.fixedRoot, x);
            continue;
        }
        if (c.elementMode === 'heaven')
            for (const root of c.favoredRoots ?? []) {
                const x = byRoot.get(root) ?? { sources: new Set(), forced: false };
                x.sources.add(def.name);
                byRoot.set(root, x);
            }
    }
    const forced = [...byRoot.entries()].filter(([, x]) => x.forced);
    if (forced.length > 0) {
        const [root, x] = forced[0];
        return [{ root, sources: [...x.sources], forced: true }];
    }
    return [...byRoot.entries()].map(([root, x]) => ({ root, sources: [...x.sources], forced: false })).sort((a, b) => a.root.localeCompare(b.root));
}
export function resolveAuthorizedSkillRootBindingsV133(state, lookupTechnique, lookupSkill) {
    const foundation = state.buildFoundation;
    const stored = foundation?.skillRootBindingsV133 ?? {};
    const out = {};
    for (const skillId of state.knownSkillIds ?? []) {
        let skill;
        try {
            skill = lookupSkill(skillId);
        }
        catch {
            continue;
        }
        const candidates = elementSealCandidatesV133(state, skill, lookupTechnique);
        const forced = candidates.find(x => x.forced);
        if (forced) {
            out[skillId] = forced.root;
            continue;
        }
        const chosen = stored[skillId];
        if (chosen && candidates.some(x => x.root === chosen))
            out[skillId] = chosen;
    }
    return out;
}
export function setSkillElementSealV133(state, foundation, skillId, root, lookupTechnique, lookupSkill) {
    if (!(state.knownSkillIds ?? []).includes(skillId))
        throw new Error('Chưa lĩnh ngộ kỹ năng này.');
    const skill = lookupSkill(skillId);
    const candidates = elementSealCandidatesV133(state, skill, lookupTechnique);
    const forced = candidates.find(x => x.forced);
    if (forced) {
        if (root && root !== forced.root)
            throw new Error(`Kỹ năng bị Công Pháp Cố Định Hành khóa ${forced.root}.`);
        delete (foundation.skillRootBindingsV133 ??= {})[skillId];
        return;
    }
    if (root && !candidates.some(x => x.root === root))
        throw new Error('Công Pháp đang trang bị không cho phép gắn Hành Ấn này lên kỹ năng.');
    const map = foundation.skillRootBindingsV133 ?? (foundation.skillRootBindingsV133 = {});
    if (root)
        map[skillId] = root;
    else
        delete map[skillId];
}
export function elementSealSummaryV133(state, lookupTechnique, lookupSkill) {
    const resolved = resolveAuthorizedSkillRootBindingsV133(state, lookupTechnique, lookupSkill);
    const skills = [];
    for (const skillId of state.knownSkillIds ?? []) {
        let skill;
        try {
            skill = lookupSkill(skillId);
        }
        catch {
            continue;
        }
        if (!skillRuntimeV117(skill).daoBinding)
            continue;
        const candidates = elementSealCandidatesV133(state, skill, lookupTechnique);
        skills.push({ skillId, skillName: skill.name, dao: skillRuntimeV117(skill).daoBinding, selectedRoot: resolved[skillId], forcedRoot: candidates.find(x => x.forced)?.root, candidates });
    }
    return { schema: ELEMENT_SEAL_SCHEMA_V133, skills };
}
/** Authored elemental component for a Hành Ấn. It is additive to the base physical/neutral coefficient and still needs % Hành to deal elemental damage. */
export function elementSealDamageCoefficientV133(entity, skill) {
    const root = skillRuntimeV117(skill).primaryRoot ?? entity.combatBuildV117?.skillRootBindingsV118?.[skill.id];
    if (!root)
        return undefined;
    const role = skill.daoRuntimeV118?.elementRole;
    if (!role)
        return undefined;
    const slot = skillSlotClassV117(skill);
    let coefficient = role === 'generate' ? .12 : role === 'defense' ? .08 : role === 'spend' ? .20 : .28;
    if (slot === 'ultimate')
        coefficient += .10;
    if (skillRuntimeV117(skill).form === 'finisher' && role !== 'generate')
        coefficient += .04;
    return { element: ROOT_ELEMENT_V133[root], coefficient };
}
//# sourceMappingURL=element-seal-v133.js.map