import { runCombatKernelV2 } from '../../dist/core/combat-kernel-v2.js';
import { analyzeBattle } from '../../dist/core/combat-analytics.js';
import { applyCharacterToEntity, createCharacterSystemState, learnTechnique } from '../../dist/core/character.js';
import { buildRegistry } from '../../dist/content/registry.js';
import { daoVariantsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';
import { battleDaoV2Passives } from '../../dist/content/battle-dao-v2-catalog.js';
import { activeEquipmentSetMechanicsV116, ATTIRE_SET_SLOTS_V116, LIVE_EQUIPMENT_SET_CATALOG_V12310, equipmentSetCatalogEntryV116, isLiveEquipmentSetV12310 } from '../../dist/core/equipment-set-v116.js';
import { gainBattleDaoHanhV113, setBattleDaosV113 } from '../../dist/core/build-foundation-v113.js';
import { applyCombatPacingV124 } from '../../dist/core/combat-pacing-v124.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
export const POTENTIAL_PLANS_V120 = {
    balanced: { power: .34, body: .33, defense: .33 }, power: { power: 1, body: 0, defense: 0 }, body: { power: 0, body: 1, defense: 0 }, defense: { power: 0, body: 0, defense: 1 },
    power_body: { power: .6, body: .4, defense: 0 }, power_defense: { power: .6, body: 0, defense: .4 }, body_defense: { power: 0, body: .5, defense: .5 },
};
const DAO_LOADOUTS = {
    sword: { basic: 'skill.dao.sword.basic', actives: ['skill.dao.sword.flow_slash', 'skill.dao.sword.nurture', 'skill.dao.sword.break_mark', 'skill.dao.sword.sever', 'skill.dao.sword.finisher'], ultimate: 'skill.dao.sword.ultimate', art: 'technique.v119.dao.qingxu_sword' },
    fist: { basic: 'skill.dao.fist.basic', actives: ['skill.dao.fist.triple', 'skill.dao.fist.nurture', 'skill.dao.fist.heavy', 'skill.dao.fist.pressure', 'skill.dao.fist.finisher'], ultimate: 'skill.dao.fist.ultimate', art: 'technique.v119.dao.eight_wastes_fist' },
    body: { basic: 'skill.dao.body.basic', actives: ['skill.dao.body.guard', 'skill.dao.body.transform', 'skill.dao.body.counter', 'skill.dao.body.break', 'skill.dao.body.finisher'], ultimate: 'skill.dao.body.ultimate', art: 'technique.v119.dao.undying_body' },
    spell: { basic: 'skill.dao.spell.basic', actives: ['skill.dao.spell.light', 'skill.dao.spell.channel', 'skill.dao.spell.seal', 'skill.dao.spell.break', 'skill.dao.spell.transform'], ultimate: 'skill.dao.spell.ultimate', art: 'technique.v119.dao.taiyi_magic' },
    poison: { basic: 'skill.dao.poison.basic', actives: ['skill.dao.poison.bone', 'skill.dao.poison.heart', 'skill.dao.poison.insects', 'skill.dao.poison.consume', 'skill.dao.poison.calamity'], ultimate: 'skill.dao.poison.ultimate', art: 'technique.v119.dao.nine_nether_poison' },
    artifact: { basic: 'skill.dao.artifact.basic', actives: ['skill.dao.artifact.deploy', 'skill.dao.artifact.strike', 'skill.dao.artifact.sync', 'skill.dao.artifact.merge', 'skill.dao.artifact.suppress'], ultimate: 'skill.dao.artifact.ultimate', art: 'technique.v119.dao.myriad_artifact' },
    formation: { basic: 'skill.dao.formation.basic', actives: ['skill.dao.formation.deploy', 'skill.dao.formation.nourish', 'skill.dao.formation.fortify', 'skill.dao.formation.small_activate', 'skill.dao.formation.full_activate'], ultimate: 'skill.dao.formation.ultimate', art: 'technique.v119.dao.star_formation' },
    mind: { basic: 'skill.dao.mind.basic', actives: ['skill.dao.mind.mark', 'skill.dao.mind.interfere', 'skill.dao.mind.chase', 'skill.dao.mind.burst', 'skill.dao.mind.observe'], ultimate: 'skill.dao.mind.ultimate', art: 'technique.v119.dao.myriad_mind' },
};
const ROOT_ELEMENT = { metal: 'Metal', wood: 'Wood', water: 'Water', fire: 'Fire', earth: 'Earth' };
const ROOT_LEVEL_FOR_BALANCE = 600;
const STANDARD_TECHNIQUES = { inner: 'technique.v119.inner.hunyuan', movement: 'technique.v119.movement.carefree_void', secret: 'technique.v119.secret.steal_heaven' };
const BALANCE_REGISTRY = buildRegistry();
export function normalizePotentialRatioV120(r) { const s = Math.max(1e-9, Math.max(0, r.power) + Math.max(0, r.body) + Math.max(0, r.defense)); return { power: Math.max(0, r.power) / s, body: Math.max(0, r.body) / s, defense: Math.max(0, r.defense) / s }; }
export function allocatePotentialV120(total, ratio) { const r = normalizePotentialRatioV120(ratio), n = Math.max(0, Math.floor(total)); const p = Math.floor(n * r.power), b = Math.floor(n * r.body); return { power: p, body: b, defense: n - p - b }; }
export function potentialGridV120(stepPct = 10) { const step = Math.max(1, Math.min(50, Math.floor(stepPct))), out = []; for (let p = 0; p <= 100; p += step)
    for (let b = 0; b <= 100 - p; b += step) {
        const d = 100 - p - b;
        out.push({ power: p / 100, body: b / 100, defense: d / 100 });
    } return out; }
function setItems(setId, pieces, grade, seedBase) {
    const set = equipmentSetCatalogEntryV116(setId);
    if (!set)
        throw new Error(`Unknown set ${setId}`);
    if (!isLiveEquipmentSetV12310(setId) || set.category !== 'attire')
        throw new Error(`Alpha.23.10 Balance Lab chỉ nhận Set Ngũ Hành live: ${setId}`);
    const slots = ATTIRE_SET_SLOTS_V116.slice(0, pieces);
    const items = slots.map((slot, i) => ({ id: `sim.${setId}.${slot}.${i}`, templateId: 'sim', name: `${set.name} ${slot}`, slot, tier: 6, quality: 'perfect', grade, enhancementLevel: 0, traitIds: [], affixes: [], itemLevel: 100, stats: {}, tags: ['BalanceSimV120'], setId, source: { kind: 'field', floor: 1, seed: seedBase + i }, acquiredWorldYear: 0 }));
    return { items, equipped: Object.fromEntries(items.map(x => [x.slot, x.id])), unlockedSetIds: [setId] };
}
export function setMechanicsV120(attireSetId, attirePieces, jewelrySetId, jewelryPieces, grade) {
    if (jewelrySetId || jewelryPieces)
        throw new Error('Alpha.23.10: Bội/Nhẫn là trang bị thường, không còn mechanic Set trong Balance Lab.');
    const mechanics = [];
    if (attireSetId && attirePieces && isLiveEquipmentSetV12310(attireSetId))
        mechanics.push(...activeEquipmentSetMechanicsV116(setItems(attireSetId, attirePieces, grade, 1100)));
    return mechanics;
}
function baseStats(totalPotential) {
    const axis = Math.max(100, totalPotential);
    return { maxHp: axis * 20, physique: axis, maxSpirit: 1000, spiritStandard: 1000, spiritRegenStandardPctPerSecond: 3, attack: axis, defense: axis, mobility: 100, accuracy: 100, critChancePct: 35, critPowerPerLayer: .5, heartChancePct: 10, dodgeChancePct: 10, controlPower: 100, resolve: 100, actionSpeed: 1, elementalAffinities: {}, elementalResistancesPct: {}, dominantElement: 'Metal' };
}
function aiFor(dao, skillIds) {
    return battleDaoAutoRotationV127(dao, skillIds);
}
function configureTechniques(state, dao) { const ids = [STANDARD_TECHNIQUES.inner, DAO_LOADOUTS[dao].art, STANDARD_TECHNIQUES.movement, STANDARD_TECHNIQUES.secret]; state.activeTechniqueId = STANDARD_TECHNIQUES.inner; state.knownTechniqueIds = []; state.techniqueMastery = {}; for (const id of ids) {
    learnTechnique(state, id, 100);
} state.equippedTechniqueIds = { inner: STANDARD_TECHNIQUES.inner, art: DAO_LOADOUTS[dao].art, movement: STANDARD_TECHNIQUES.movement, secret: STANDARD_TECHNIQUES.secret }; }
export function buildBalanceEntityV120(spec) {
    const registry = BALANCE_REGISTRY, load = DAO_LOADOUTS[spec.dao], all = [load.basic, ...load.actives, load.ultimate];
    const base = { id: 'balance.player', combatModel: 'locked-v1', name: `${spec.dao}-${spec.root}`, tags: ['Human', 'Cultivator', 'BalanceSimV120'], stats: { ...baseStats(spec.totalPotential), dominantElement: ROOT_ELEMENT[spec.root] }, skillIds: all, aiProfile: aiFor(spec.dao, all) };
    const state = createCharacterSystemState('root.mixed', STANDARD_TECHNIQUES.inner, [], []);
    state.potential = undefined;
    configureTechniques(state, spec.dao);
    state.knownSkillIds = [...all];
    state.activeSkillIds = [...all];
    state.combatAiProfile = aiFor(spec.dao, all);
    const alloc = allocatePotentialV120(spec.totalPotential, spec.potential);
    state.corePotential = { life: { unspent: 0, lifetimeEarned: spec.totalPotential, allocations: alloc, awardedMilestones: [] }, permanent: { power: 0, body: 0, defense: 0 } };
    const f = state.buildFoundation;
    for (const root of ['metal', 'wood', 'water', 'fire', 'earth']) {
        f.roots[root].unlocked = root === spec.root;
        f.roots[root].level = root === spec.root ? ROOT_LEVEL_FOR_BALANCE : 1;
    }
    setBattleDaosV113(f, spec.dao, spec.secondaryDao);
    gainBattleDaoHanhV113(f, spec.dao, Math.max(0, Math.min(100, spec.daoHanh ?? 70)));
    if (spec.secondaryDao) gainBattleDaoHanhV113(f, spec.secondaryDao, Math.max(0, Math.min(100, spec.secondaryDaoHanh ?? spec.daoHanh ?? 70)));
    f.learnedDaoPassiveIdsV118 = [
        ...battleDaoV2Passives(spec.dao).map(x => x.id),
        ...(spec.secondaryDao ? battleDaoV2Passives(spec.secondaryDao).map(x => x.id) : []),
    ];
    f.unlockedVariantIdsV119 = daoVariantsV118.filter(x => x.dao === spec.dao).map(x => x.id);
    f.skillLoadout.buildPassiveIds = [];
    let entity = applyCharacterToEntity(base, state, registry, 1, true);
    const bind = Object.fromEntries(all.map(id => [id, spec.root]));
    const manualMechanics = [...(entity.combatBuildV117?.activeSetMechanics ?? [])];
    const elementMechanics = setMechanicsV120(spec.attireSetId, spec.attirePieces, spec.jewelrySetId, spec.jewelryPieces, spec.grade);
    entity = { ...entity, combatBuildV117: { ...(entity.combatBuildV117 ?? {}), skillRootBindingsV118: { ...(entity.combatBuildV117?.skillRootBindingsV118 ?? {}), ...bind }, activeSetMechanics: [...manualMechanics, ...elementMechanics] }, stats: { ...entity.stats, dominantElement: ROOT_ELEMENT[spec.root] } };
    return applyCombatPacingV124(entity);
}
function harmlessSkill() { return { id: 'skill.balance.harmless', name: 'Thử Chiêu', description: 'Không gây sát thương.', tags: ['BalanceSimV120'], spiritCost: 0, cooldown: 0, castTime: 0, recoveryTime: 1, effects: [] }; }
function enemyStrike() { return { id: 'skill.balance.enemy_strike', name: 'Áp Lực Chuẩn', description: 'Đòn áp lực chuẩn.', tags: ['BalanceSimV120'], spiritCost: 0, cooldown: 0, castTime: .6, recoveryTime: 1, effects: [{ type: 'damage', coefficient: 1.05, breakDamagePct: 5 }] }; }
function benchmarkEntity(kind, axis) {
    if (kind === 'offense')
        return { id: 'balance.target', combatModel: 'locked-v1', name: 'Mộc Nhân Thử Công', tags: ['BalanceSimV120'], stats: { ...baseStats(axis), maxHp: axis * 20 * 1000, physique: axis * 1000, attack: 1, defense: axis, mobility: 100, accuracy: 100, critChancePct: 0, critPowerPerLayer: .5, controlPower: 1, resolve: 100, actionSpeed: 1 }, skillIds: ['skill.balance.harmless'], aiProfile: { name: 'idle', rules: [{ skillId: 'skill.balance.harmless', priority: 1, conditions: [{ type: 'always' }] }] } };
    const survival = kind === 'survival';
    const foeScale = survival ? 1.85 : 1.48;
    return { id: 'balance.target', combatModel: 'locked-v1', name: survival ? 'Hộ Pháp Thử Sinh' : 'Đối Thủ Chuẩn', tags: ['BalanceSimV120', survival ? 'Boss' : 'Cultivator'], stats: { ...baseStats(axis), maxHp: axis * 20 * (survival ? 100 : foeScale), physique: axis * (survival ? 100 : foeScale), attack: axis * foeScale, defense: axis * foeScale, mobility: 100, accuracy: 100, critChancePct: 35, critPowerPerLayer: .5, heartChancePct: 10, dodgeChancePct: 10, controlPower: 100, resolve: 100, actionSpeed: 1.02 }, skillIds: ['skill.balance.enemy_strike'], aiProfile: { name: 'pressure', rules: [{ skillId: 'skill.balance.enemy_strike', priority: 1, conditions: [{ type: 'always' }] }] } };
}
function registryForBench() { const r = BALANCE_REGISTRY; if (!r.skills.has('skill.balance.harmless'))
    r.registerSkill(harmlessSkill()); if (!r.skills.has('skill.balance.enemy_strike'))
    r.registerSkill(enemyStrike()); return r; }
export function evaluateBuildV120(spec, seeds = 3) {
    const axis = spec.totalPotential, player = buildBalanceEntityV120(spec), r = registryForBench();
    const offense = runCombatKernelV2({ registry: r, seed: 720000, entities: [player, applyCombatPacingV124(benchmarkEntity('offense', axis))], maxDuration: 60, mode: 'simulation' }).battle;
    const offenseA = analyzeBattle(offense).combatants[player.id];
    const dps = (offenseA?.damageDealt ?? 0) / Math.max(1, Math.min(60, offense.duration));
    const survival = runCombatKernelV2({ registry: r, seed: 730000, entities: [player, applyCombatPacingV124(benchmarkEntity('survival', axis))], maxDuration: 60, mode: 'simulation' }).battle;
    const fs = survival.finalState[player.id], maxHp = Math.max(1, (player.stats.physique !== undefined ? player.stats.physique * 20 : player.stats.maxHp) * (player.stats.combatHpMultiplierV124 ?? 1));
    const hpPct = Math.max(0, Math.min(100, fs.hp / maxHp * 100));
    const survivalSeconds = fs.alive ? 60 : Math.min(60, survival.duration);
    const survivalScore = survivalSeconds + (fs.alive ? hpPct * .15 : 0);
    let wins = 0, totalDur = 0;
    const duelCount = Math.max(0, Math.floor(seeds));
    for (let i = 0; i < duelCount; i++) {
        const duel = runCombatKernelV2({ registry: r, seed: 740000 + i, entities: [player, applyCombatPacingV124(benchmarkEntity('duel', axis))], maxDuration: 60, mode: 'simulation' }).battle;
        if (duel.winnerId === player.id)
            wins++;
        totalDur += Math.min(60, duel.duration);
    }
    const duelWinRate = duelCount > 0 ? wins / duelCount : .5;
    const offenseScore = dps;
    const balancedScore = Math.sqrt(Math.max(1e-9, offenseScore) * Math.max(1e-9, survivalScore)) * (.75 + .25 * duelWinRate);
    return { dps, survivalSeconds, survivalHpPct: hpPct, duelWinRate, avgDuelSeconds: duelCount > 0 ? totalDur / duelCount : 0, offenseScore, survivalScore, balancedScore };
}
export function thematicAttireSetIdV120(_dao, root) {
    const rootTag = `Root:${ROOT_ELEMENT[root]}`;
    const rootSet = LIVE_EQUIPMENT_SET_CATALOG_V12310.find(x => x.tags.includes(rootTag));
    if (rootSet)
        return rootSet.id;
    return LIVE_EQUIPMENT_SET_CATALOG_V12310[0]?.id;
}
/** @deprecated Alpha.23.10: Bội/Nhẫn không còn Set. */
export function compatibleJewelrySetIdsV120(_dao, _root) { return []; }
//# sourceMappingURL=balance-lab-v120.js.map