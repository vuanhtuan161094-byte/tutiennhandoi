import { battleDaoSkillsV118 } from './battle-dao-skill-pack-v118.js';
import { statuses } from './statuses.js';
import { thunderHornRhino } from './entities.js';
import { skills } from './skills.js';
export const COMBAT_ASSET_CONTRACT_VERSION_V138 = '1.38.0-alpha.17.0';
export const COMBAT_ASSET_ROOT_V138 = '/assets/runtime/v138';
const DAO_ORDER = ['sword', 'fist', 'body', 'spell', 'poison', 'artifact', 'formation', 'mind'];
const DAO_FX = {
    sword: {
        family: 'sword', cast: 'fx.sword.cast.sigil', trail: 'fx.sword.trail.slash', projectile: 'fx.sword.projectile.flying_sword', summon: 'fx.sword.summon.sword_array', impact: 'fx.sword.impact.hit', break: 'fx.sword.impact.break', field: 'fx.sword.field.sword_domain', aura: 'fx.sword.aura.sword_intent', ultimate: 'fx.sword.ultimate.heaven_sever',
    },
    fist: {
        family: 'fist', cast: 'fx.fist.cast.gather_force', trail: 'fx.fist.trail.fist_force', projectile: 'fx.fist.projectile.fist_force', summon: 'fx.fist.summon.chain_fists', impact: 'fx.fist.impact.hit', break: 'fx.fist.impact.break', field: 'fx.fist.field.pressure', aura: 'fx.fist.aura.fist_chain', ultimate: 'fx.fist.ultimate.prison_fist',
    },
    body: {
        family: 'body', cast: 'fx.body.cast.body_force', trail: 'fx.body.trail.body_strike', projectile: 'fx.body.projectile.force_wave', summon: 'fx.body.summon.dragon_elephant', impact: 'fx.body.impact.hit', break: 'fx.body.impact.counter_break', field: 'fx.body.field.immovable', aura: 'fx.body.aura.guard', ultimate: 'fx.body.ultimate.undying_body',
    },
    spell: {
        family: 'spell', cast: 'fx.spell.cast.arcane_sigil', trail: 'fx.spell.trail.arcane_light', projectile: 'fx.spell.projectile.arcane_bolt', summon: 'fx.spell.summon.spell_orbs', impact: 'fx.spell.impact.hit', break: 'fx.spell.impact.break_seal', field: 'fx.spell.field.myriad_law', aura: 'fx.spell.aura.spirit_flow', ultimate: 'fx.spell.ultimate.myriad_laws',
    },
    poison: {
        family: 'poison', cast: 'fx.poison.cast.poison_seal', trail: 'fx.poison.trail.venom', projectile: 'fx.poison.projectile.poison_dart', summon: 'fx.poison.summon.insects', impact: 'fx.poison.impact.hit', break: 'fx.poison.impact.consume', field: 'fx.poison.field.poison_mist', aura: 'fx.poison.aura.toxin', ultimate: 'fx.poison.ultimate.nine_abyss',
    },
    artifact: {
        family: 'artifact', cast: 'fx.artifact.cast.command_sigil', trail: 'fx.artifact.trail.spirit_weapon', projectile: 'fx.artifact.projectile.spirit_weapon', summon: 'fx.artifact.summon.artifacts', impact: 'fx.artifact.impact.hit', break: 'fx.artifact.impact.void_break', field: 'fx.artifact.field.myriad_treasures', aura: 'fx.artifact.aura.command', ultimate: 'fx.artifact.ultimate.heavens_treasures',
    },
    formation: {
        family: 'formation', cast: 'fx.formation.cast.array_sigil', trail: 'fx.formation.trail.rune_line', projectile: 'fx.formation.projectile.array_beam', summon: 'fx.formation.summon.nodes', impact: 'fx.formation.impact.activate', break: 'fx.formation.impact.break_array', field: 'fx.formation.field.array', aura: 'fx.formation.aura.nourish', ultimate: 'fx.formation.ultimate.star_array',
    },
    mind: {
        family: 'mind', cast: 'fx.mind.cast.mind_sigil', trail: 'fx.mind.trail.thought', projectile: 'fx.mind.projectile.mind_needle', summon: 'fx.mind.summon.split_minds', impact: 'fx.mind.impact.hit', break: 'fx.mind.impact.burst_mark', field: 'fx.mind.field.thousand_thoughts', aura: 'fx.mind.aura.mind_mark', ultimate: 'fx.mind.ultimate.silent_illumination',
    },
};
const slugFromId = (id) => id.split('.').slice(3).join('_');
const has = (s, token) => Boolean(s.runtimeV117?.domains?.includes(token) || s.tags?.includes(token));
function choosePose(s) {
    if (s.runtimeV117?.slotClass === 'ultimate')
        return 'combat_ultimate';
    const form = s.runtimeV117?.form;
    if (form === 'cast' || form === 'charge' || form === 'channel' || form === 'deploy')
        return 'combat_cast';
    if (form === 'counter')
        return 'combat_idle';
    return 'combat_attack';
}
function chooseIntensity(s) {
    if (s.runtimeV117?.slotClass === 'ultimate')
        return 'ultimate';
    if (s.runtimeV117?.form === 'finisher' || has(s, 'Heavy') || has(s, 'Break') || has(s, 'PháThế'))
        return 'heavy';
    return 'normal';
}
function recipeForSkill(s) {
    const dao = s.runtimeV117?.daoBinding;
    const fx = DAO_FX[dao];
    const form = s.runtimeV117?.form;
    const domains = s.runtimeV117?.domains ?? [];
    const out = [];
    const add = (role, key, timing, repeat) => out.push({ role, key, timing, ...(repeat && repeat > 1 ? { repeat } : {}) });
    const defensive = domains.includes('DefenseUtility') && !domains.includes('Damage');
    const breakSkill = domains.includes('Break') || domains.includes('PháThế');
    const isUltimate = s.runtimeV117?.slotClass === 'ultimate';
    if (form === 'cast' || form === 'charge' || form === 'channel' || form === 'deploy' || isUltimate)
        add('cast', fx.cast, 'start');
    if (defensive)
        add('aura', fx.aura, 'sustain');
    if (form === 'deploy') {
        add('summon', fx.summon, 'start');
        add('field', fx.field, 'sustain');
    }
    else if (form === 'channel') {
        add('field', fx.field, 'sustain');
        if (domains.includes('Damage'))
            add('projectile', fx.projectile, 'travel', Math.max(3, s.channel?.baseHits ?? 3));
    }
    else if (form === 'combo') {
        add('trail', fx.trail, 'travel', Math.max(2, s.effects?.filter(e => e.type === 'damage').length || 3));
    }
    else if (form === 'counter') {
        add('aura', fx.aura, 'start');
        if (domains.includes('Damage'))
            add('trail', fx.trail, 'travel');
    }
    else if (form === 'finisher') {
        add(dao === 'spell' || dao === 'artifact' || dao === 'mind' ? 'projectile' : 'trail', dao === 'spell' || dao === 'artifact' || dao === 'mind' ? fx.projectile : fx.trail, 'travel');
    }
    else if (!defensive) {
        const projectileDao = dao === 'spell' || dao === 'artifact' || dao === 'mind' || dao === 'poison';
        add(projectileDao ? 'projectile' : 'trail', projectileDao ? fx.projectile : fx.trail, 'travel');
    }
    if (domains.includes('SpellSeal') || domains.includes('FormationNourish') || domains.includes('FormationFortify') || domains.includes('MindBuild') || domains.includes('ArtifactGenerate')) {
        add('aura', fx.aura, 'sustain');
    }
    if (domains.includes('FormationActivate') || domains.includes('SpellChannel') || domains.includes('PoisonBuild') && form === 'deploy')
        add('field', fx.field, 'sustain');
    if (domains.includes('ArtifactGenerate'))
        add('summon', fx.summon, 'start');
    if (domains.includes('MindBuild') && form === 'instant' && s.id.includes('.split'))
        add('summon', fx.summon, 'start');
    const dealsDamage = Boolean(s.effects?.some(e => e.type === 'damage' || e.type === 'damageOverTime' || e.type === 'consumeMarkDamage') || s.channel?.effects?.some(e => e.type === 'damage' || e.type === 'damageOverTime' || e.type === 'consumeMarkDamage'));
    if (dealsDamage)
        add(breakSkill ? 'break' : 'impact', breakSkill ? fx.break : fx.impact, 'impact');
    if (isUltimate)
        add('ultimate', fx.ultimate, 'finish');
    const seen = new Set();
    return out.filter(step => {
        const k = `${step.role}|${step.key}|${step.timing}|${step.repeat ?? 1}`;
        if (seen.has(k))
            return false;
        seen.add(k);
        return true;
    });
}
export const skillVisualMappingsV138 = battleDaoSkillsV118.map((s) => {
    const dao = s.runtimeV117?.daoBinding;
    const slug = slugFromId(s.id);
    return {
        skillId: s.id,
        name: s.name,
        dao,
        form: String(s.runtimeV117?.form ?? 'instant'),
        slotClass: String(s.runtimeV117?.slotClass ?? 'active'),
        iconKey: `icon.skill.${dao}.${slug}`,
        iconPath: `${COMBAT_ASSET_ROOT_V138}/icons/skills/${dao}/${slug}.webp`,
        castPose: choosePose(s),
        intensity: chooseIntensity(s),
        fxFamily: DAO_FX[dao].family,
        recipe: recipeForSkill(s),
        fallbackIconPath: '/assets/v107/skill-1.webp',
        assetState: 'production',
    };
});
const APPROVED_CORE_STATUS_IDS = new Set([
    'status.stun', 'status.silence', 'status.lightning_haste', 'status.wind_step', 'status.fire_focus', 'status.blood_frenzy', 'status.true_sight_focus', 'status.starfall_sword_intent',
    'status.iron_bones', 'status.class_body_guard', 'status.class_body_fortress', 'status.purple_mirror_guard', 'status.soul_guard',
    'status.sword_pressure', 'status.poison_weakened', 'status.healing_suppressed', 'status.armor_fracture', 'status.predator_off_balance', 'status.rhino_armor_broken', 'status.blood_qi_backlash', 'status.soul_exposed',
    'status.dao_severed_guard', 'status.dao_thunder_pressure', 'status.dao_erosion', 'status.spatial_dislocation', 'status.guardian_counter_exposed', 'status.rhino_overcharge',
]);
export const statusVisualMappingsV138 = statuses.map((status) => {
    const category = status.group === 'Buff' ? 'buff' : status.group === 'Debuff' ? 'debuff' : 'control';
    const slug = status.id.replace(/^status\./, '').replace(/\./g, '_');
    return {
        statusId: status.id,
        name: status.name,
        backendGroup: status.group,
        category,
        iconKey: `icon.status.${slug}`,
        iconPath: `${COMBAT_ASSET_ROOT_V138}/icons/status/${category}/${slug}.webp`,
        approvedCore: APPROVED_CORE_STATUS_IDS.has(status.id),
        fallbackKey: `icon.status.fallback.${category}`,
        assetState: 'planned',
    };
});
export const daoResourceVisualMappingsV138 = [
    { dao: 'sword', resourceId: 'swordIntent', name: 'Kiếm Ý', iconKey: 'icon.resource.sword_intent' },
    { dao: 'fist', resourceId: 'fistChain', name: 'Liên Quyền', iconKey: 'icon.resource.fist_chain' },
    { dao: 'body', resourceId: 'bodyCounter', name: 'Phản Thế', iconKey: 'icon.resource.body_counter' },
    { dao: 'spell', resourceId: 'spellSeal', name: 'Pháp Ấn', iconKey: 'icon.resource.spell_seal' },
    { dao: 'poison', resourceId: 'Độc Tầng', name: 'Độc Tầng', iconKey: 'icon.resource.poison_stack' },
    { dao: 'artifact', resourceId: 'artifactSources', name: 'Pháp Bảo', iconKey: 'icon.resource.artifact_sources' },
    { dao: 'formation', resourceId: 'formationNurture', name: 'Dưỡng Độ', iconKey: 'icon.resource.formation_nurture' },
    { dao: 'formation', resourceId: 'formationIntegrity', name: 'Độ Bền Trận', iconKey: 'icon.resource.formation_integrity' },
    { dao: 'mind', resourceId: 'Thần Ấn', name: 'Thần Ấn', iconKey: 'icon.resource.mind_mark' },
];
export const playerVisualContractV138 = {
    characterKey: 'character.production.immortal_swordsman_01',
    assetState: 'production',
    portraitPath: '/assets/runtime/v138/characters/immortal_swordsman_01/portrait.webp',
    posePaths: {
        combat_idle: '/assets/runtime/v138/characters/immortal_swordsman_01/idle.webp',
        combat_cast: '/assets/runtime/v138/characters/immortal_swordsman_01/cast.webp',
        combat_attack: '/assets/runtime/v138/characters/immortal_swordsman_01/attack.webp',
        combat_hit: '/assets/runtime/v138/characters/immortal_swordsman_01/hit.webp',
        combat_ultimate: '/assets/runtime/v138/characters/immortal_swordsman_01/ultimate.webp',
        combat_defeat: '/assets/runtime/v138/characters/immortal_swordsman_01/defeat.webp',
    },
    poses: { combat_idle: { state: 'production' }, combat_cast: { state: 'production' }, combat_attack: { state: 'production' }, combat_hit: { state: 'production' }, combat_ultimate: { state: 'production' }, combat_defeat: { state: 'production' } },
    hairStates: {},
    expressionFallback: 'neutral',
    layerOrder: ['fullBody'],
    fallbackPath: '/assets/runtime/v138/characters/immortal_swordsman_01/idle.webp',
    geometry: { visualBounds: { x: .01, y: 0, w: .98, h: .99 }, baseline: { x: .50, y: .985 }, pivot: { x: .50, y: .86 }, combatScale: 1, offset: { x: 0, y: 0 }, impactAnchor: { x: .72, y: .43 } },
    sourcePolicy: 'direct_transparent_render_no_sheet_crop',
};
const canonicalSkillMap = new Map(skills.map(s => [s.id, s]));
const rhinoSkillIds = thunderHornRhino.skillIds ?? [];
export const thunderHornRhinoVisualContractV138 = {
    entityId: thunderHornRhino.id,
    name: thunderHornRhino.name,
    assetState: 'fallback',
    portraitPath: '',
    iconPath: '',
    posePaths: {},
    portraitKey: '',
    iconKey: '',
    poses: {},
    phases: (thunderHornRhino.phases ?? []).map((phase, index) => ({ phaseId: phase.id, name: phase.name, hpBelowPct: phase.hpBelowPct, overlayKey: index === 0 ? 'boss.thunder_horn_rhino.phase.thunder_armor' : 'boss.thunder_horn_rhino.phase.overcharge' })),
    skills: rhinoSkillIds.map(id => ({ skillId: id, name: canonicalSkillMap.get(id)?.name ?? id, recipeKey: `boss.thunder_horn_rhino.skill.${id.replace(/^skill\./, '').replace(/\./g, '_')}` })),
    stateRuntime: { schema: 'boss-state-runtime.v1', mode: 'single_base_asset', portraitMode: 'reuse_base_asset', states: ['idle', 'attack', 'cast', 'hit', 'phase2', 'phase3', 'defeat'], extraPoseAssets: 0, backendAuthoritative: true },
    fallbackPath: '/assets/huntv2/beasts/thunder-wolf.png',
    geometry: { visualBounds: { x: .04, y: .06, w: .92, h: .90 }, baseline: { x: .52, y: .94 }, pivot: { x: .52, y: .76 }, combatScale: 1, offset: { x: 0, y: 0 }, impactAnchor: { x: .35, y: .42 } },
    sourcePolicy: 'family_fallback_until_true_transparent_production_asset',
};
export const fxAssetPathsV138 = {
    spell: ['/assets/huntv2/fx/spell-cast.webp', '/assets/huntv2/fx/spell-travel.webp', '/assets/huntv2/fx/spell-impact.webp', '/assets/huntv2/fx/spell-field.webp', '/assets/huntv2/fx/spell-ultimate.webp'],
    poison: ['/assets/huntv2/fx/poison-cast.webp', '/assets/huntv2/fx/poison-travel.webp', '/assets/huntv2/fx/poison-impact.webp', '/assets/huntv2/fx/poison-field.webp', '/assets/huntv2/fx/poison-ultimate.webp'],
};
export const productionFxRuntimeV138 = {
    version: '1.38.0-alpha.17.0',
    assetState: 'production',
    mode: 'hybrid_primitives_authored_library',
    primitives: ['cast', 'travel', 'impact', 'field', 'ultimate'],
    daoThemes: DAO_ORDER,
    perSkillRasterAssets: 0,
    sheetDerivedAssets: 10,
    approvedReusableRasterAssets: 10,
    authoredDaos: ['spell', 'poison'],
    mapping: 'skill.dao.* -> dao theme + skill pattern + runtime phase; Pháp/Độc may use approved shared raster library',
    backendAuthoritative: true,
};
export const fxPrimitiveCatalogV138 = Object.fromEntries(DAO_ORDER.map(dao => [dao, DAO_FX[dao]]));
export const combatAssetContractV138 = {
    contractVersion: COMBAT_ASSET_CONTRACT_VERSION_V138,
    root: COMBAT_ASSET_ROOT_V138,
    policy: { backendAuthoritative: true, missingAssetBehavior: 'fallback', runtimeMayChangeCombatOutcome: false, designSheetsAreRuntimeAssets: false, runtimeRequiresExplicitProductionApproval: true, sheetDerivedActorFxMayBeLive: false, approvedSheetDerivedFxMayBeLive: true, sheetDerivedIconsRequireApproval: true, quarantinedRuntimeArtifactsRemoved: true },
    player: playerVisualContractV138,
    bosses: { [thunderHornRhino.id]: thunderHornRhinoVisualContractV138 },
    skills: skillVisualMappingsV138,
    statuses: statusVisualMappingsV138,
    daoResources: daoResourceVisualMappingsV138,
    fxPrimitives: fxPrimitiveCatalogV138,
    fxRuntime: productionFxRuntimeV138,
    fxAssets: fxAssetPathsV138,
};
//# sourceMappingURL=combat-asset-contract-v138.js.map