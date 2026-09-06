import { equipTechniqueManual, learnTechnique, techniqueMasteryStage } from './character.js';
import { cloneBuildFoundationV113, learnDaoPassiveV118, unlockSkillVariantV119, unlockTechniqueTrueMeaningV119 } from './build-foundation-v113.js';
export const TECHNIQUE_INSIGHT_RESOURCE_ID = 'resource.technique_insight';
export const TECHNIQUE_FRAGMENT_NAME = 'Bí Thuật Tàn Trang';
export const TECHNIQUE_GRADE_ORDER = ['mundane', 'spirit', 'mystic', 'earth', 'heaven', 'immortal', 'extreme', 'breaker'];
export const TECHNIQUE_GRADE_LABEL = { mundane: 'Phàm', spirit: 'Linh', mystic: 'Huyền', earth: 'Địa', heaven: 'Thiên', immortal: 'Tiên', extreme: 'Cực', breaker: 'Phá' };
export const TECHNIQUE_SLOT_LABEL = { inner: 'Tâm Pháp', art: 'Đạo Quyết', movement: 'Thân Pháp', secret: 'Bí Thuật' };
const STUDY_PER_FRAGMENT = { mundane: 4.2, spirit: 3.2, mystic: 2.45, earth: 1.85, heaven: 1.35, immortal: .95, extreme: .62, breaker: .38 };
export function techniqueStudyGain(def, batches, currentMastery) {
    const grade = def.grade ?? 'mundane';
    const count = Math.max(0, Math.floor(batches));
    const base = STUDY_PER_FRAGMENT[grade] * count;
    // Mastery slows near Hóa Cảnh but never becomes a pure RNG wall.
    const slowdown = .65 + .35 * Math.max(0, (100 - currentMastery) / 100);
    return Math.max(0, base * slowdown);
}
export function studyTechniqueWithFragments(state, def, batches) {
    if (!state.knownTechniqueIds.includes(def.id))
        throw new Error('Chưa lĩnh ngộ công pháp này.');
    const used = Math.max(1, Math.floor(batches));
    const before = Math.max(0, Math.min(100, state.techniqueMastery[def.id] ?? 0));
    const gain = Math.min(100 - before, techniqueStudyGain(def, used, before));
    const after = Math.min(100, before + gain);
    state.techniqueMastery[def.id] = after;
    return { used, before, after, gain, stage: techniqueMasteryStage(after) };
}
export function techniqueSkillUnlockMastery(def) {
    if (def.contentV119) {
        const values = def.contentV119.milestones.filter(x => (x.unlockSkillIds?.length ?? 0) > 0).map(x => x.at);
        return values.length ? Math.min(...values) : 0;
    }
    return Math.max(0, Math.min(100, def.skillUnlockMastery ?? ((def.grantedSkillIds?.length ?? 0) > 0 ? 20 : 0)));
}
export function syncTechniqueMilestonesV119(state, def) {
    const out = { skills: [], passives: [], variants: [], trueMeanings: [] };
    const mastery = Math.max(0, Math.min(100, state.techniqueMastery[def.id] ?? 0));
    if (def.contentV119) {
        const foundation = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
        state.buildFoundation = foundation;
        for (const milestone of def.contentV119.milestones) {
            if (mastery + 1e-9 < milestone.at)
                continue;
            // v1.25: Battle-Dao Actives are only exposed by the manual milestone here; actual learning is an explicit
            // action gated by current-life specialization, realm, restored fragments and Điểm Kỹ Năng. Legacy/manual skills keep the old auto-learn behavior.
            for (const skillId of milestone.unlockSkillIds ?? []) {
                if (skillId.startsWith('skill.dao.'))
                    continue;
                if (!state.knownSkillIds.includes(skillId)) {
                    state.knownSkillIds.push(skillId);
                    out.skills.push(skillId);
                }
            }
            // v1.25: Bị Động Bản Đạo is learned explicitly by the specialization layer so realm + current-life Dao gates cannot be bypassed by early manual study.
            for (const passiveId of milestone.unlockPassiveIds ?? []) {
                if (passiveId.startsWith('passive.dao.'))
                    continue;
                const before = (foundation.learnedDaoPassiveIdsV118 ?? []).includes(passiveId);
                learnDaoPassiveV118(foundation, passiveId);
                if (!before) {
                    const p = foundation.progressionV125;
                    if (p && p.passiveLevels[passiveId] === undefined)
                        p.passiveLevels[passiveId] = 1;
                    out.passives.push(passiveId);
                }
            }
            for (const variantId of milestone.unlockVariantIds ?? []) {
                const before = (foundation.unlockedVariantIdsV119 ?? []).includes(variantId);
                unlockSkillVariantV119(foundation, variantId);
                if (!before)
                    out.variants.push(variantId);
            }
            if (milestone.trueMeaningId) {
                const before = (foundation.techniqueTrueMeaningIdsV119 ?? []).includes(milestone.trueMeaningId);
                unlockTechniqueTrueMeaningV119(foundation, milestone.trueMeaningId);
                if (!before)
                    out.trueMeanings.push(milestone.trueMeaningId);
            }
        }
        return out;
    }
    if (mastery + 1e-9 < techniqueSkillUnlockMastery(def))
        return out;
    for (const skillId of def.grantedSkillIds ?? []) {
        if (!state.knownSkillIds.includes(skillId)) {
            state.knownSkillIds.push(skillId);
            out.skills.push(skillId);
        }
    }
    return out;
}
export function unlockTechniqueGrantedSkills(state, def) { return syncTechniqueMilestonesV119(state, def).skills; }
export function learnTechniqueManual(state, def, startingMastery = 0) {
    learnTechnique(state, def.id, startingMastery);
    return syncTechniqueMilestonesV119(state, def).skills;
}
export function equipManual(state, def) { equipTechniqueManual(state, def); }
export function techniqueMasteryReport(def, mastery, equipped) {
    return {
        id: def.id, name: def.name, slot: def.slot ?? 'inner', slotLabel: TECHNIQUE_SLOT_LABEL[def.slot ?? 'inner'], grade: def.grade ?? 'mundane', gradeLabel: TECHNIQUE_GRADE_LABEL[def.grade ?? 'mundane'], school: def.school ?? 'universal', description: def.description ?? '',
        mastery: Math.max(0, Math.min(100, mastery)), stage: techniqueMasteryStage(mastery), equipped, requiredRealmOrder: def.requiredRealmOrder ?? 0, grantedSkillIds: [...(def.grantedSkillIds ?? [])], skillUnlockMastery: techniqueSkillUnlockMastery(def), skillUnlocked: mastery + 1e-9 >= techniqueSkillUnlockMastery(def), tags: [...def.tags],
        contentV119: def.contentV119 ? { elementMode: def.contentV119.elementMode, fixedRoot: def.contentV119.fixedRoot, favoredRoots: [...(def.contentV119.favoredRoots ?? [])], daoBindings: [...(def.contentV119.daoBindings ?? [])], milestones: def.contentV119.milestones.map(x => ({ at: x.at, name: x.name, description: x.description, unlocked: mastery + 1e-9 >= x.at, unlockSkillIds: [...(x.unlockSkillIds ?? [])], unlockPassiveIds: [...(x.unlockPassiveIds ?? [])], unlockVariantIds: [...(x.unlockVariantIds ?? [])], trueMeaningId: x.trueMeaningId })) } : undefined,
    };
}
//# sourceMappingURL=technique-progression-v103.js.map