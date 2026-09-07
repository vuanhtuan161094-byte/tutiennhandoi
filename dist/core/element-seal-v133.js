import { skillRuntimeV117, skillSlotClassV117 } from './skill-runtime-v117.js';
export const ELEMENT_SEAL_SCHEMA_V133 = 'element-seal.v133';
export const ELEMENT_SEAL_MIN_TECHNIQUE_MASTERY_V133 = 20;
const ROOT_ELEMENT_V133 = { metal: 'Metal', wood: 'Wood', water: 'Water', fire: 'Fire', earth: 'Earth' };

/** V144: manual-driven Hành Ấn retired with V103/V119. */
export function elementSealCandidatesV133(_state, _skill, _lookupTechnique) { return []; }
export function resolveAuthorizedSkillRootBindingsV133(_state, _lookupTechnique, _lookupSkill) { return {}; }
export function setSkillElementSealV133(_state, foundation, skillId, _root, _lookupTechnique, _lookupSkill) {
    if (foundation?.skillRootBindingsV133) delete foundation.skillRootBindingsV133[skillId];
    throw new Error('Hành Ấn từ Công Pháp V119 đã nghỉ production ở V144.');
}
export function elementSealSummaryV133(_state, _lookupTechnique, _lookupSkill) {
    return { schema: ELEMENT_SEAL_SCHEMA_V133, retired: true, skills: [], canonicalManualSchema: 'manual-progression.v127.production' };
}
/**
 * Preserve authored elemental skill identity. Dynamic roots formerly injected by V119 manuals are ignored.
 */
export function elementSealDamageCoefficientV133(_entity, skill) {
    const root = skillRuntimeV117(skill).primaryRoot;
    if (!root) return undefined;
    const role = skill.daoRuntimeV118?.elementRole;
    if (!role) return undefined;
    const slot = skillSlotClassV117(skill);
    let coefficient = role === 'generate' ? .12 : role === 'defense' ? .08 : role === 'spend' ? .20 : .28;
    if (slot === 'ultimate') coefficient += .10;
    if (skillRuntimeV117(skill).form === 'finisher' && role !== 'generate') coefficient += .04;
    return { element: ROOT_ELEMENT_V133[root], coefficient };
}
