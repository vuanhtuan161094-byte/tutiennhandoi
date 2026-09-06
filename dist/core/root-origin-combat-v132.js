import { skillDomainsV117, skillRuntimeV117 } from './skill-runtime-v117.js';
import { ROOT_ORIGIN_IDS_V113, ROOT_ORIGIN_NAMES_V113, } from './build-foundation-v113.js';
import { combineStatPctV129 } from './combat-rules.js';
export const ROOT_ORIGIN_COMBAT_SCHEMA_V132 = 'root-origin-combat.v132';
function d(root, order, role, description, staticStats, hunt) {
    const id = ROOT_ORIGIN_IDS_V113[root][order - 1];
    return { id, name: ROOT_ORIGIN_NAMES_V113[id] ?? id, root, order, role, description, static: staticStats, hunt };
}
export const ROOT_ORIGIN_COMBAT_DEFINITIONS_V132 = [
    // Kim — Phong Mang / Kim Cương
    d('metal', 1, 'Phá Thế', 'Canh Kim thiên công: tăng sinh Phong Mang; skill Kim phá thế mạnh hơn khi giữ Phong Mang.', undefined, { effectPct: 5, breakPct: 11 }),
    d('metal', 2, 'Tinh Chuẩn', 'Tân Kim thiên tinh luyện: Xuyên Giáp và tiết tấu Kim tốt hơn; phù hợp combo liên tục.', { armorPenPct: 6 }, { effectPct: 6, cyclePct: -6 }),
    d('metal', 3, 'Thiết Giáp', 'Huyền Thiết thiên thủ: tăng Phòng Ngự; sinh Kim Cương từ package phòng thủ hiệu quả hơn.', { defensePct: 8 }, { shieldPct: 12 }),
    d('metal', 4, 'Bất Hoại', 'Bất Hoại Kim thiên sinh tồn: giảm sát thương nhận; skill Kim phòng thủ nhận payoff lớn.', { damageReductionPct: 5 }, { shieldPct: 16 }),
    d('metal', 5, 'Sát Phạt', 'Thái Bạch Kim thưởng việc giữ Phong Mang cao trước khi ra đòn quyết định.', { critChancePct: 4, critDamagePct: 8 }, { effectPct: 13, breakPct: 5 }),
    d('metal', 6, 'Đoạn Giới', 'Đoạn Giới Kim biến lần xả Phong Mang lớn thành package Kết Liễu/Phá Thế cực mạnh nhưng hao Chân Nguyên hơn.', { armorPenPct: 5 }, { effectPct: 20, breakPct: 20, costPct: 8 }),
    // Mộc — Sinh Cơ / Mộc Chủng
    d('wood', 1, 'Sinh Cơ', 'Thanh Mộc tăng tốc sinh Sinh Cơ/Mộc Chủng và cường hóa package hồi phục Mộc.', { healingPct: 5 }, { healPct: 12, effectPct: 4 }),
    d('wood', 2, 'Trường Sinh', 'Trường Sinh Mộc tăng sinh mệnh nền và khả năng hồi phục dài hạn.', { maxHpPct: 9, healingPct: 10 }, { healPct: 14 }),
    d('wood', 3, 'Khô Vinh', 'Khô Vinh Mộc mạnh rõ khi HP thấp: càng nguy hiểm càng tăng payoff Mộc, nhưng không auto cứu chết.', { healingReceivedPct: 6 }, { effectPct: 12, healPct: 8 }),
    d('wood', 4, 'Cổ Thụ', 'Cổ Mộc chuyên nuôi Mộc Chủng; thu hoạch Chủng chín có payoff lớn hơn.', { defensePct: 5 }, { effectPct: 14, shieldPct: 6 }),
    d('wood', 5, 'Ký Sinh', 'Ký Sinh Mộc lấy sát thương kéo ngược thành sinh tồn; DoT/Drain Mộc được ưu tiên.', { lifeStealPct: 7 }, { effectPct: 13, healPct: 7 }),
    d('wood', 6, 'Vạn Sinh', 'Vạn Linh Mộc cực mạnh ở vòng nuôi–thu hoạch Mộc Chủng chín và hồi phục sau payoff.', { maxHpPct: 5, healingPct: 8 }, { effectPct: 20, healPct: 15 }),
    // Thủy — Lưu Thế / Triều Ấn / Thích Ứng
    d('water', 1, 'Nhu Thủy', 'Nhược Thủy thiên né/giảm áp lực, thưởng package Thủy phòng thủ.', { dodgePct: 3, damageReductionPct: 3 }, { shieldPct: 10 }),
    d('water', 2, 'Trường Lưu', 'Thương Hải mở rotation dài: thêm Chân Nguyên, hồi CN và tăng sinh Lưu Thế.', { maxSpiritPct: 9, spiritRegenPct: 11 }, { effectPct: 5, costPct: -5 }),
    d('water', 3, 'Triều Tịch', 'Triều Tịch tập trung Triều Ấn: xả Ấn cho payoff lớn, nhịp tạo/xả rõ hơn.', undefined, { effectPct: 16, breakPct: 6 }),
    d('water', 4, 'Huyền Minh', 'Huyền Minh thiên khống chế/phá nhịp: package Control/Break Thủy hiệu quả hơn.', undefined, { effectPct: 7, breakPct: 14, controlPct: 18 }),
    d('water', 5, 'Kính Phản', 'Kính Thủy thiên hộ thân: Né và package Shield/Defense Thủy mạnh hơn.', { dodgePct: 4 }, { shieldPct: 18 }),
    d('water', 6, 'Vô Hình', 'Vô Hình Thủy giảm thời gian Thi Triển/Thu Chiêu và chi phí CN của skill Thủy, ưu tiên nhịp linh hoạt hơn burst thô.', { dodgePct: 3 }, { effectPct: 8, costPct: -8, cyclePct: -12 }),
    // Hỏa — Viêm Ấn / Nhiệt Thế / Cực Viêm
    d('fire', 1, 'Tích Nhiệt', 'Liệt Viêm tăng tốc sinh Viêm Ấn/Nhiệt Thế và thêm payoff Hỏa nhỏ, dễ vào vòng bộc phát.', undefined, { effectPct: 7 }),
    d('fire', 2, 'Dương Bạo', 'Dương Viêm thiên Bạo Kích: tăng tỷ lệ và Bạo Thương, phù hợp Hỏa trực thương.', { critChancePct: 5, critDamagePct: 10 }, { effectPct: 8 }),
    d('fire', 3, 'Tâm Viêm', 'Tâm Hỏa dùng Chân Nguyên hiệu quả hơn; khi CN thấp, package Hỏa được bù lực có giới hạn.', { spiritEfficiencyPct: 6, spiritRegenPct: 5 }, { effectPct: 9, costPct: -8 }),
    d('fire', 4, 'Tịnh Hỏa', 'Tịnh Hỏa cân công–thủ: tăng hồi phục và giảm áp lực nhận để sống qua Tàn Hỏa.', { healingPct: 8, damageReductionPct: 3 }, { healPct: 10, effectPct: 7 }),
    d('fire', 5, 'U Minh', 'U Minh Hỏa thiên DoT/hút sinh lực, đổi burst tức thời lấy sát thương kéo dài ổn định.', { lifeStealPct: 5 }, { effectPct: 15, healPct: 5 }),
    d('fire', 6, 'Phần Thiên', 'Phần Thiên Hỏa dồn sức vào Cực Viêm: payoff trong cửa sổ Cực Viêm rất cao, ngoài cửa sổ không được cộng miễn phí.', { critDamagePct: 8 }, { effectPct: 21 }),
    // Thổ — Trọng Thế / Phản Chấn
    d('earth', 1, 'Hậu Thổ', 'Hậu Thổ tăng giảm thương và hồi nhận, làm nền cho build đứng lâu.', { damageReductionPct: 4, healingReceivedPct: 7 }, { shieldPct: 7 }),
    d('earth', 2, 'Sơn Nhạc', 'Sơn Nhạc tăng Phòng Ngự và tốc độ tích Trọng Thế từ package Thổ.', { defensePct: 10 }, { effectPct: 5, shieldPct: 9 }),
    d('earth', 3, 'Địa Mạch', 'Địa Mạch tăng Chân Nguyên/hồi CN, giúp Thổ duy trì vòng thủ–phản dài.', { maxSpiritPct: 6, spiritRegenPct: 9 }, { costPct: -5, effectPct: 5 }),
    d('earth', 4, 'Chấn Địa', 'Chấn Thổ thiên Phá Thế/Phản Chấn, đặc biệt mạnh khi tiêu Phản Chấn.', undefined, { effectPct: 10, breakPct: 17 }),
    d('earth', 5, 'Hoang Vực', 'Hoang Thổ thưởng việc giữ Trọng Thế cao: càng đứng vững càng tăng payoff công/thủ Thổ.', { damageReductionPct: 3 }, { effectPct: 14, shieldPct: 8 }),
    d('earth', 6, 'Trấn Thiên', 'Trấn Thiên Thổ đẩy lần xả Phản Chấn thành phản công cực mạnh và tăng nền chống burst.', { damageReductionPct: 5, defensePct: 5 }, { effectPct: 22, breakPct: 12 }),
];
const BY_ID = new Map(ROOT_ORIGIN_COMBAT_DEFINITIONS_V132.map(x => [x.id, x]));
export function rootOriginCombatDefinitionV132(id) { return id ? BY_ID.get(id) : undefined; }
export function activeRootOriginIdV132(entity, root) { return entity.combatBuildV117?.activeRootOriginIdsV132?.[root]; }
export function activeRootOriginDefinitionV132(entity, root) { return rootOriginCombatDefinitionV132(activeRootOriginIdV132(entity, root)); }
export function activeRootOriginIdsFromFoundationV132(foundation) {
    const out = {};
    for (const root of ['metal', 'wood', 'water', 'fire', 'earth']) {
        const id = foundation.roots[root].activeOriginId;
        if (id && BY_ID.has(id))
            out[root] = id;
    }
    return out;
}
function add(v, x) { return (v ?? 0) + (x ?? 0); }
function mulPct(v, pct) { return v * (1 + (pct ?? 0) / 100); }
export function applyActiveRootOriginStatsV132(stats, foundation) {
    const s = { ...stats, elementalAffinities: stats.elementalAffinities ? { ...stats.elementalAffinities } : undefined, elementalResistancesPct: stats.elementalResistancesPct ? { ...stats.elementalResistancesPct } : undefined };
    for (const root of ['metal', 'wood', 'water', 'fire', 'earth']) {
        const def = rootOriginCombatDefinitionV132(foundation.roots[root].activeOriginId);
        const m = def?.static;
        if (!m)
            continue;
        if (m.maxHpPct) {
            if (s.physique !== undefined)
                s.physique = mulPct(s.physique, m.maxHpPct);
            else
                s.maxHp = mulPct(s.maxHp, m.maxHpPct);
        }
        if (m.maxSpiritPct)
            s.maxSpirit = mulPct(s.maxSpirit, m.maxSpiritPct);
        if (m.defensePct)
            s.defense = mulPct(s.defense, m.defensePct);
        s.armorPenPct = combineStatPctV129('armorPenPct', s.armorPenPct ?? 0, m.armorPenPct ?? 0);
        s.critChancePct = add(s.critChancePct, m.critChancePct);
        s.critDamagePct = add(s.critDamagePct, m.critDamagePct);
        s.damageReductionPct = combineStatPctV129('damageReductionPct', s.damageReductionPct ?? 0, m.damageReductionPct ?? 0);
        s.dodgeChancePct = combineStatPctV129('dodgeChancePct', s.dodgeChancePct ?? 0, m.dodgePct ?? 0);
        s.healingEffectivenessPct = add(s.healingEffectivenessPct, m.healingPct);
        s.healingReceivedPct = add(s.healingReceivedPct, m.healingReceivedPct);
        s.lifeStealPct = add(s.lifeStealPct, m.lifeStealPct);
        s.spiritRegenStandardPctPerSecond = add(s.spiritRegenStandardPctPerSecond, m.spiritRegenPct);
        s.spiritEfficiencyPct = combineStatPctV129('spiritEfficiencyPct', s.spiritEfficiencyPct ?? 0, m.spiritEfficiencyPct ?? 0);
        if (m.actionSpeedPct)
            s.actionSpeed = mulPct(s.actionSpeed, m.actionSpeedPct);
    }
    return s;
}
function skillRootV132(entity, skill) { return skillRuntimeV117(skill).primaryRoot ?? entity.combatBuildV117?.skillRootBindingsV118?.[skill.id]; }
function stateMaxHpV132(entity) { return entity.baseStats.physique !== undefined ? Math.max(1, entity.baseStats.physique * 20 * (entity.baseStats.combatHpMultiplierV124 ?? 1)) : Math.max(1, entity.baseStats.maxHp); }
function hpPct(entity) { const max = stateMaxHpV132(entity); return entity.hp / max * 100; }
function spiritPct(entity) { const max = Math.max(1, entity.baseStats.maxSpirit); return entity.spirit / max * 100; }
/** V129 material resource-generation specializations. Values are percent bonuses on owned root lanes. */
export const ROOT_ORIGIN_GENERATION_BONUS_V129 = Object.freeze({
    'origin.metal.geng': Object.freeze({ metalEdge: 25 }),
    'origin.metal.black_iron': Object.freeze({ metalArmor: 35 }),
    'origin.wood.azure': Object.freeze({ woodLife: 28, woodSeed: 28 }),
    'origin.wood.ancient': Object.freeze({ woodSeed: 40 }),
    'origin.water.vast_sea': Object.freeze({ waterFlow: 26 }),
    'origin.water.tide': Object.freeze({ waterTide: 35 }),
    'origin.fire.fierce': Object.freeze({ fireSeal: 30, fireHeat: 30 }),
    'origin.earth.mountain': Object.freeze({ earthWeight: 30 }),
    'origin.earth.vein': Object.freeze({ earthWeight: 24, earthRecoil: 24 }),
});
export function rootOriginGenerationBonusPctV129(originId, resource) {
    return Number(ROOT_ORIGIN_GENERATION_BONUS_V129[originId]?.[resource] ?? 0);
}
export function rootOriginPeakGenerationBonusPctV129(originId) {
    const row = ROOT_ORIGIN_GENERATION_BONUS_V129[originId];
    return row ? Math.max(0, ...Object.values(row).map(Number)) : 0;
}
/** Runtime generation modifiers. Returns a multiplicative scalar; only the active Căn Nguyên of that root can contribute. */
export function rootOriginGenerateMultiplierV132(entity, root, resource) {
    const id = activeRootOriginIdV132(entity, root);
    return 1 + rootOriginGenerationBonusPctV129(id, resource) / 100;
}
/** Signed percentage: negative = cheaper, positive = more expensive. */
export function rootOriginSpiritCostPctV132(entity, skill) {
    const root = skillRootV132(entity, skill);
    if (!root)
        return 0;
    const id = activeRootOriginIdV132(entity, root);
    if (!id)
        return 0;
    if (id === 'origin.metal.sever_world')
        return 8;
    if (id === 'origin.water.formless')
        return -8;
    if (id === 'origin.fire.heart')
        return -10;
    if (id === 'origin.earth.vein')
        return -6;
    return 0;
}
export function rootOriginCastRecoveryMultiplierV132(entity, skill) {
    const root = skillRootV132(entity, skill);
    if (!root)
        return 1;
    const id = activeRootOriginIdV132(entity, root);
    if (id === 'origin.metal.xin')
        return .90;
    if (id === 'origin.water.formless')
        return .84;
    return 1;
}
/** Apply the behavioral package to the real action after resource spend has been observed. */
export function applyRootOriginActionV132(entity, skill, action, now) {
    const root = skillRootV132(entity, skill);
    if (!root)
        return;
    const id = activeRootOriginIdV132(entity, root);
    if (!id)
        return;
    const domains = new Set(skillDomainsV117(skill));
    const addEffect = (x) => { action.effectBonusPct += x; };
    const addBreak = (x) => { action.breakBonusPct += x; };
    switch (id) {
        case 'origin.metal.geng':
            addBreak(10);
            if (entity.fiveElementsV117.metalEdge >= 60)
                addEffect(6);
            break;
        case 'origin.metal.xin':
            addEffect(5);
            break;
        case 'origin.metal.black_iron':
            if (domains.has('DefenseUtility'))
                addEffect(16);
            break;
        case 'origin.metal.indestructible':
            if (domains.has('DefenseUtility'))
                addEffect(18);
            break;
        case 'origin.metal.taibai':
            if (entity.fiveElementsV117.metalEdge >= 70)
                addEffect(14);
            break;
        case 'origin.metal.sever_world': {
            const spent = action.spentResources.metalEdge ?? 0;
            if (spent >= 50) {
                addEffect(24);
                addBreak(24);
            }
            break;
        }
        case 'origin.wood.azure':
            if (domains.has('Healing') || domains.has('Heal') || domains.has('DefenseUtility'))
                addEffect(10);
            break;
        case 'origin.wood.longevity':
            if (domains.has('Healing') || domains.has('Heal'))
                addEffect(12);
            break;
        case 'origin.wood.wither_bloom':
            addEffect(hpPct(entity) <= 45 ? 18 : 5);
            break;
        case 'origin.wood.ancient':
            if (skillRuntimeV117(skill).signature === 'woodHarvestSeed')
                addEffect(18);
            break;
        case 'origin.wood.parasitic':
            if (domains.has('DoT') || domains.has('Drain') || domains.has('Poison'))
                addEffect(18);
            else
                addEffect(5);
            break;
        case 'origin.wood.myriad_life':
            if (skillRuntimeV117(skill).signature === 'woodHarvestSeed' && entity.fiveElementsV117.woodSeed >= 90)
                addEffect(28);
            else if (domains.has('Healing') || domains.has('Heal'))
                addEffect(10);
            break;
        case 'origin.water.weak':
            if (domains.has('DefenseUtility'))
                addEffect(12);
            break;
        case 'origin.water.vast_sea':
            addEffect(4);
            break;
        case 'origin.water.tide':
            if (skillRuntimeV117(skill).signature === 'waterTideSpend' || (action.spentResources.waterTide ?? 0) > 0) {
                addEffect(20);
                addBreak(6);
            }
            break;
        case 'origin.water.dark_ming':
            if (domains.has('Control') || domains.has('Break') || domains.has('Phá') || domains.has('PháThế')) {
                addEffect(10);
                addBreak(16);
            }
            break;
        case 'origin.water.mirror':
            if (domains.has('DefenseUtility') || domains.has('Counter'))
                addEffect(18);
            break;
        case 'origin.water.formless':
            addEffect(6);
            break;
        case 'origin.fire.fierce':
            addEffect(7);
            break;
        case 'origin.fire.yang':
            addEffect(7);
            break;
        case 'origin.fire.heart':
            addEffect(spiritPct(entity) <= 40 ? 14 : 5);
            break;
        case 'origin.fire.purifying':
            if (domains.has('DefenseUtility') || domains.has('Healing') || domains.has('Heal'))
                addEffect(15);
            else
                addEffect(4);
            break;
        case 'origin.fire.nether':
            if (domains.has('DoT') || domains.has('Drain') || domains.has('Burn'))
                addEffect(20);
            else
                addEffect(5);
            break;
        case 'origin.fire.burn_heaven':
            if (entity.fiveElementsV117.fireExtremeUntil > now)
                addEffect(28);
            break;
        case 'origin.earth.houtu':
            if (domains.has('DefenseUtility'))
                addEffect(10);
            break;
        case 'origin.earth.mountain':
            if (domains.has('DefenseUtility'))
                addEffect(12);
            break;
        case 'origin.earth.vein':
            addEffect(5);
            break;
        case 'origin.earth.quake':
            if ((action.spentResources.earthRecoil ?? 0) > 0 || domains.has('Break') || domains.has('Phá')) {
                addEffect(13);
                addBreak(20);
            }
            break;
        case 'origin.earth.wasteland':
            if (entity.fiveElementsV117.earthWeight >= 80)
                addEffect(16);
            break;
        case 'origin.earth.suppress_heaven':
            if (skillRuntimeV117(skill).signature === 'earthCounterSpend' || (action.spentResources.earthRecoil ?? 0) > 0) {
                addEffect(30);
                addBreak(12);
            }
            break;
    }
}
/** Expected-value bridge for the lightweight Hunt resolver. Full CombatEngine uses the dynamic runtime above. */
export function rootOriginHuntSkillTuningV132(entity, skill) {
    const root = skillRootV132(entity, skill);
    if (!root)
        return {};
    const def = activeRootOriginDefinitionV132(entity, root);
    if (!def)
        return {};
    const domains = new Set(skillDomainsV117(skill));
    const out = { effectPct: def.hunt?.effectPct ?? 0, breakPct: def.hunt?.breakPct ?? 0, healPct: def.hunt?.healPct ?? 0, shieldPct: def.hunt?.shieldPct ?? 0, controlPct: def.hunt?.controlPct ?? 0, costPct: def.hunt?.costPct ?? 0, cyclePct: def.hunt?.cyclePct ?? 0 };
    // Preserve identity in the expected-value bridge instead of treating every skill as if the condition were always met.
    if (def.id === 'origin.metal.sever_world' && skillRuntimeV117(skill).form !== 'finisher') {
        out.effectPct *= .45;
        out.breakPct *= .55;
    }
    if (def.id === 'origin.wood.ancient' && skillRuntimeV117(skill).signature !== 'woodHarvestSeed')
        out.effectPct *= .35;
    if (def.id === 'origin.wood.parasitic' && !domains.has('DoT') && !domains.has('Drain') && !domains.has('Poison'))
        out.effectPct *= .35;
    if (def.id === 'origin.water.tide' && skillRuntimeV117(skill).signature !== 'waterTideSpend')
        out.effectPct *= .35;
    if (def.id === 'origin.water.dark_ming' && !domains.has('Control') && !domains.has('Break') && !domains.has('Phá') && !domains.has('PháThế')) {
        out.effectPct *= .3;
        out.breakPct *= .3;
        out.controlPct *= .3;
    }
    if (def.id === 'origin.water.mirror' && !domains.has('DefenseUtility') && !domains.has('Counter'))
        out.shieldPct *= .4;
    if (def.id === 'origin.fire.nether' && !domains.has('DoT') && !domains.has('Drain') && !domains.has('Burn'))
        out.effectPct *= .3;
    if (def.id === 'origin.fire.burn_heaven')
        out.effectPct *= .58; // expected Cực Viêm uptime, never permanent full payoff
    if (def.id === 'origin.earth.quake' && !domains.has('Break') && !domains.has('Phá')) {
        out.effectPct *= .45;
        out.breakPct *= .55;
    }
    if (def.id === 'origin.earth.suppress_heaven' && skillRuntimeV117(skill).signature !== 'earthCounterSpend') {
        out.effectPct *= .3;
        out.breakPct *= .4;
    }
    return out;
}
export function rootOriginCombatSummaryV132(foundation) {
    return { schema: ROOT_ORIGIN_COMBAT_SCHEMA_V132, active: ['metal', 'wood', 'water', 'fire', 'earth'].map(root => { const def = rootOriginCombatDefinitionV132(foundation.roots[root].activeOriginId); return { root, originId: def?.id, originName: def?.name, role: def?.role, description: def?.description }; }), definitions: ROOT_ORIGIN_COMBAT_DEFINITIONS_V132.map(x => ({ id: x.id, name: x.name, root: x.root, order: x.order, role: x.role, description: x.description })) };
}
//# sourceMappingURL=root-origin-combat-v132.js.map