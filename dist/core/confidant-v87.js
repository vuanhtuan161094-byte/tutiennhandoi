export const CONFIDANT_SCHEMA_V87 = 'confidant.v87';
export const CONFIDANT_MAX_INTIMACY_V87 = 100;
export const CONFIDANT_MAX_FATE_V87 = 5;
const damage = (coefficient, breakDamagePct = 0, element) => ({ type: 'damage', coefficient, sourceTag: 'Summon', canCrit: false, canDodge: true, canHeart: false, procCoefficient: 0, breakDamagePct, elementalCoefficients: element ? { [element]: 1 } : undefined });
const shield = (attackCoefficient, maxHpPct = 0) => ({ type: 'shield', capacity: 0, stability: 0, duration: 6, attackCoefficient, maxHpPct, overflowDamageRatio: .15 });
const heal = (maxHpPct) => ({ type: 'heal', maxHpPct, target: 'self' });
const spirit = (flat) => ({ type: 'restoreSpirit', flat });
const status = (statusId, duration, target = 'target') => ({ type: 'applyStatus', statusId, duration, target });
/**
 * V87 launch roster. IDs stay on companion.1..8 so V86 saves and gacha history migrate without a second identity layer.
 * Portrait art is intentionally shared until dedicated transparent actor art is authored; presentation is registry-driven.
 */
export const CONFIDANTS_V87 = [
    {
        id: 'companion.1', code: 'mq', name: 'Mộc Quỳnh', grade: 'heaven', title: 'Thanh Mộc Dược Sư', fantasy: 'Điềm tĩnh, tinh tế; lấy sinh cơ và dược lý để bảo hộ người đồng hành.', asset: '/assets/hubs/companion.jpg', combatStyle: 'sustain',
        specialty: { id: 'garden', name: 'Dược Viên', description: 'Tăng sản lượng Linh Thực khi Đồng Hành và đã mở Sở Trường.' },
        assist: { name: 'Thanh Mộc Sinh Tức', description: 'Tri Kỷ xuất hiện ngắn, hồi sinh lực và dựng hộ thuẫn.', event: 'OnDamageTaken', cooldown: 9, effects: [heal(2.2), shield(.07, 1.2)] },
        guard: { name: 'Mộc Linh Hộ Mệnh', description: 'Khi HP nguy hiểm, thanh tẩy và dựng khiên lớn; tối đa 1 lần/trận.', hpBelowPct: 35, effects: [{ type: 'removeStatus', groups: ['Debuff', 'BodyControl', 'SpiritControl'], target: 'self' }, heal(5), shield(.14, 4)] },
        harmony: { name: 'Tâm Ý Hợp Kích · Vạn Mộc Hồi Xuân', description: 'Hồi phục lớn, gia cố hộ thể rồi phản kích bằng Mộc linh.', cooldown: 14, effects: [heal(6), shield(.12, 3), damage(.52, 8, 'Wood')] },
    },
    {
        id: 'companion.2', code: 'nt', name: 'Ninh Tố', grade: 'earth', title: 'Tàng Các Chấp Sự', fantasy: 'Lạnh và chuẩn xác; nhìn ra sơ hở, tính toán giá trị và thời cơ trước khi ra tay.', asset: '/assets/hubs/companion.jpg', combatStyle: 'control',
        specialty: { id: 'resource', name: 'Kho Tàng', description: 'Tăng hiệu suất tài nguyên collection khi Đồng Hành và đã mở Sở Trường.' },
        assist: { name: 'Tố Quang Điểm Huyệt', description: 'Đánh dấu sơ hở, gây sát thương và phá phòng.', event: 'OnHit', cooldown: 8, effects: [damage(.32, 8, 'Soul'), status('status.armor_fracture', 4)] },
        guard: { name: 'Tĩnh Tâm Hộ Đạo', description: 'Khi HP nguy hiểm, hồi Chân Nguyên và dựng hộ thuẫn; tối đa 1 lần/trận.', hpBelowPct: 32, effects: [spirit(18), shield(.10, 3)] },
        harmony: { name: 'Tâm Ý Hợp Kích · Vô Sai Nhất Kích', description: 'Khóa sơ hở rồi tung một đòn Phá Thế mạnh.', cooldown: 13, effects: [status('status.soul_exposed', 4), damage(.78, 26, 'Soul')] },
    },
    {
        id: 'companion.3', code: 'hl', name: 'Hạ Liên', grade: 'heaven', title: 'Đan Hỏa Linh Tâm', fantasy: 'Ấm áp, tận tâm; giỏi ổn định đan hỏa và kéo nhịp chiến đấu về trạng thái có lợi.', asset: '/assets/hubs/companion.jpg', combatStyle: 'support',
        specialty: { id: 'alchemy', name: 'Đan Đạo', description: 'Tăng phẩm chất và hiệu suất Luyện Đan khi Đồng Hành và đã mở Sở Trường.' },
        assist: { name: 'Liên Hỏa Trợ Nguyên', description: 'Bổ sung Chân Nguyên và tạo khiên nhẹ.', event: 'OnHit', cooldown: 8.5, effects: [spirit(14), shield(.06, 1)] },
        guard: { name: 'Đan Tâm Hộ Mạch', description: 'Khi HP nguy hiểm, hồi phục và bảo hộ thân thể; tối đa 1 lần/trận.', hpBelowPct: 38, effects: [heal(4.5), shield(.11, 3)] },
        harmony: { name: 'Tâm Ý Hợp Kích · Cửu Chuyển Liên Hỏa', description: 'Bồi Chân Nguyên, gia trì thân pháp rồi đánh bùng Hỏa linh.', cooldown: 14, effects: [spirit(24), status('status.wind_step', 5, 'self'), damage(.48, 6, 'Fire')] },
    },
    {
        id: 'companion.4', code: 'tv', name: 'Tạ Vân', grade: 'earth', title: 'Khí Văn Đoán Sư', fantasy: 'Ít lời, thực tế; quen nhìn kết cấu binh khí nên ra tay chuyên phá giáp và giữ tuyến.', asset: '/assets/hubs/companion.jpg', combatStyle: 'burst',
        specialty: { id: 'forging', name: 'Luyện Khí', description: 'Tăng xác suất thành công/phẩm chất Luyện Khí khi Đồng Hành và đã mở Sở Trường.' },
        assist: { name: 'Phá Giáp Khí Văn', description: 'Một kích khí văn phá phòng và gây Phá Thế.', event: 'OnHit', cooldown: 7.5, effects: [damage(.42, 14, 'Metal'), status('status.armor_fracture', 4)] },
        guard: { name: 'Huyền Thiết Hộ Thân', description: 'Khi HP nguy hiểm, dựng khiên nặng; tối đa 1 lần/trận.', hpBelowPct: 34, effects: [shield(.18, 5)] },
        harmony: { name: 'Tâm Ý Hợp Kích · Thiên Công Đoạn Giáp', description: 'Phá giáp trước rồi giáng trọng kích Kim hệ.', cooldown: 13, effects: [status('status.armor_fracture', 5), damage(.90, 30, 'Metal')] },
    },
    {
        id: 'companion.5', code: 'ld', name: 'Lạc Dao', grade: 'mystic', title: 'Tĩnh Tu Cầm Sư', fantasy: 'Thanh tĩnh, bền bỉ; dùng nhịp cầm và hô hấp kéo người đồng hành về trạng thái nhập định.', asset: '/assets/hubs/companion.jpg', combatStyle: 'support',
        specialty: { id: 'cultivation', name: 'Tu Luyện', description: 'Tăng tốc nhận Tu Vi khi Đồng Hành và đã mở Sở Trường.' },
        assist: { name: 'Thanh Âm Trợ Đạo', description: 'Âm luật bồi Chân Nguyên rồi hóa thành linh nhận.', event: 'OnHit', cooldown: 8, effects: [spirit(12), status('status.wind_step', 2, 'self'), damage(.18, 4, 'Wind')] },
        guard: { name: 'Tĩnh Tâm Quy Nguyên', description: 'Khi HP nguy hiểm, hồi sinh lực và Chân Nguyên; tối đa 1 lần/trận.', hpBelowPct: 36, effects: [heal(4), spirit(20)] },
        harmony: { name: 'Tâm Ý Hợp Kích · Thiên Âm Đồng Luật', description: 'Đồng bộ nhịp chiến, hồi Chân Nguyên và tung âm nhận liên hoàn.', cooldown: 12, effects: [spirit(20), status('status.wind_step', 3, 'self'), damage(.42, 12, 'Wind')] },
    },
    {
        id: 'companion.6', code: 'cth', name: 'Cố Thanh Hà', grade: 'mystic', title: 'Ngự Thú Linh Nữ', fantasy: 'Nhanh nhẹn, gần gũi linh thú; giỏi trấn an và dẫn nhịp bản năng chiến đấu.', asset: '/assets/hubs/companion.jpg', combatStyle: 'control',
        specialty: { id: 'spiritBeast', name: 'Linh Thú', description: 'Giảm hao phí nuôi dưỡng Linh Thú khi Đồng Hành và đã mở Sở Trường.' },
        assist: { name: 'Linh Minh Khiếu', description: 'Linh áp đánh lệch nhịp mục tiêu và gây sát thương.', event: 'OnHit', cooldown: 8.5, effects: [damage(.30, 7, 'Soul'), status('status.predator_off_balance', 3)] },
        guard: { name: 'Vạn Thú Hộ Chủ', description: 'Khi HP nguy hiểm, gọi linh lực dựng khiên; tối đa 1 lần/trận.', hpBelowPct: 35, effects: [shield(.15, 4), heal(2.5)] },
        harmony: { name: 'Tâm Ý Hợp Kích · Bách Thú Đồng Minh', description: 'Linh áp trấn mục tiêu rồi hợp kích gây choáng ngắn.', cooldown: 14, effects: [damage(.58, 16, 'Soul'), status('status.stun', 1.0)] },
    },
    {
        id: 'companion.7', code: 'yv', name: 'Yến Vũ', grade: 'immortal', title: 'Trảm Yêu Du Hiệp', fantasy: 'Quyết đoán, ưa chiến; đọc thế Boss nhanh và chuyên chớp cửa sổ bạo phát.', asset: '/assets/hubs/companion.jpg', combatStyle: 'burst',
        specialty: { id: 'hunt', name: 'Săn Yêu', description: 'Tăng Linh Thạch/tài nguyên Săn Yêu khi Đồng Hành và đã mở Sở Trường.' },
        assist: { name: 'Truy Yêu Nhất Trảm', description: 'Trợ kích đơn mục tiêu với Phá Thế cao.', event: 'OnHit', cooldown: 7, effects: [damage(.52, 18, 'Metal')] },
        guard: { name: 'Nghịch Cảnh Phản Trảm', description: 'Khi HP nguy hiểm, dựng khiên rồi phản kích; tối đa 1 lần/trận.', hpBelowPct: 30, effects: [shield(.09, 2), damage(.45, 14, 'Metal')] },
        harmony: { name: 'Tâm Ý Hợp Kích · Tuyệt Sát Trảm Yêu', description: 'Đòn hợp kích bạo phát cực mạnh vào mục tiêu đang bị ép thế.', cooldown: 13, effects: [status('status.rhino_armor_broken', 4), damage(1.05, 34, 'Metal')] },
    },
    {
        id: 'companion.8', code: 'btt', name: 'Bạch Tố Tâm', grade: 'heaven', title: 'Hồng Trần Thương Chủ', fantasy: 'Điềm đạm, linh hoạt; giỏi quan sát dòng tài nguyên và đổi thế bất lợi thành cơ hội.', asset: '/assets/hubs/companion.jpg', combatStyle: 'guard',
        specialty: { id: 'market', name: 'Phường Thị', description: 'Giảm chi phí giao dịch Phường Thị khi Đồng Hành và đã mở Sở Trường.' },
        assist: { name: 'Lưu Quang Ám Tiễn', description: 'Ám khí gây sát thương và làm suy yếu mục tiêu.', event: 'OnHit', cooldown: 8, effects: [damage(.28, 8, 'Poison'), status('status.poison_weakened', 4)] },
        guard: { name: 'Tàng Phong Hộ Tâm', description: 'Khi HP nguy hiểm, giải bất lợi và hồi phục; tối đa 1 lần/trận.', hpBelowPct: 37, effects: [{ type: 'removeStatus', groups: ['Debuff', 'BodyControl', 'SpiritControl'], target: 'self' }, heal(8), shield(.14, 5)] },
        harmony: { name: 'Tâm Ý Hợp Kích · Hồng Trần Vạn Biến', description: 'Làm lộ sơ hở rồi tung liên kích hỗn hợp.', cooldown: 13.5, effects: [status('status.soul_exposed', 3), shield(.08, 2), damage(.55, 20, 'Poison')] },
    },
];
export const CONFIDANT_COMBAT_TUNING_V108 = Object.freeze({
    'companion.1': .72,
    'companion.2': 1.00,
    'companion.3': 1.08,
    'companion.4': 1.02,
    'companion.5': 1.00,
    'companion.6': 1.00,
    'companion.7': 1.00,
    'companion.8': 1.05,
});
const BY_ID = new Map(CONFIDANTS_V87.map(x => [x.id, x]));
export function confidantDefinitionV87(id) { return BY_ID.get(id); }
export function confidantIntimacyV87(p) { return Math.max(1, Math.min(CONFIDANT_MAX_INTIMACY_V87, Math.floor(p?.level || 1))); }
/** Storage `advance` stays zero-based for save compatibility: 0=I ... 4=V. */
export function confidantFateV87(p) { return Math.max(1, Math.min(CONFIDANT_MAX_FATE_V87, Math.floor(p?.advance || 0) + 1)); }
export function confidantFateRomanV87(fate) { return ['I', 'II', 'III', 'IV', 'V'][Math.max(1, Math.min(5, Math.floor(fate))) - 1] || 'I'; }
function specialtyStrengthPct(intimacy, fate) { if (intimacy < 30)
    return 0; return Number(Math.min(12, 3 + (intimacy - 30) * .07 + (fate - 1) * .85).toFixed(2)); }
export function activeConfidantSpecialtyV87(state) {
    const id = state?.activeCompanionId;
    if (!id)
        return undefined;
    const d = confidantDefinitionV87(id), p = state?.items?.[id];
    if (!d || !p?.owned)
        return undefined;
    const intimacy = confidantIntimacyV87(p), fate = confidantFateV87(p), strengthPct = specialtyStrengthPct(intimacy, fate);
    return { id: d.specialty.id, name: d.specialty.name, description: d.specialty.description, strengthPct, unlocked: intimacy >= 30, confidantId: d.id, confidantName: d.name };
}
export function confidantFortuneSummaryV87(state) {
    let points = 0, owned = 0;
    const rows = [];
    for (const d of CONFIDANTS_V87) {
        const p = state?.items?.[d.id];
        if (!p?.owned)
            continue;
        owned++;
        const intimacy = confidantIntimacyV87(p), fate = confidantFateV87(p);
        const intimacyPoints = [30, 50, 70, 100].filter(x => intimacy >= x).length;
        const fatePoints = Math.max(0, fate - 1);
        const contribution = intimacyPoints + fatePoints;
        points += contribution;
        rows.push({ id: d.id, name: d.name, intimacy, fate, points: contribution });
    }
    return { schema: CONFIDANT_SCHEMA_V87, owned, total: CONFIDANTS_V87.length, points, cultivationPct: Number((points * .12).toFixed(2)), huntRewardPct: Number((points * .15).toFixed(2)), craftQualityPct: Number((points * .08).toFixed(2)), rows };
}
function scaleEffect(e, scale) {
    if (e.type === 'damage')
        return { ...e, coefficient: e.coefficient * scale, breakDamagePct: (e.breakDamagePct ?? 0) * Math.min(1.45, scale) };
    if (e.type === 'damageOverTime')
        return { ...e, coefficientPerTick: e.coefficientPerTick * scale };
    if (e.type === 'heal')
        return { ...e, flat: (e.flat ?? 0) * scale, maxHpPct: (e.maxHpPct ?? 0) * scale, attackCoefficient: (e.attackCoefficient ?? 0) * scale };
    if (e.type === 'shield')
        return { ...e, capacity: e.capacity * scale, maxHpPct: (e.maxHpPct ?? 0) * scale, attackCoefficient: (e.attackCoefficient ?? 0) * scale };
    if (e.type === 'restoreSpirit')
        return { ...e, flat: e.flat * scale };
    if (e.type === 'applyStatus')
        return { ...e, duration: e.duration * Math.min(1.25, scale) };
    return { ...e };
}
function relationScale(intimacy, fate) { return Math.max(.82, Math.min(1.65, .82 + intimacy * .0048 + (fate - 1) * .075)); }
export function confidantCombatTriggersV87(state) {
    const id = state?.activeCompanionId;
    if (!id)
        return [];
    const d = confidantDefinitionV87(id), p = state?.items?.[id];
    if (!d || !p?.owned)
        return [];
    const intimacy = confidantIntimacyV87(p), fate = confidantFateV87(p), relation = relationScale(intimacy, fate) * (CONFIDANT_COMBAT_TUNING_V108[id] ?? 1), assistUpgrade = intimacy >= 50 ? 1.22 : 1;
    const out = [];
    // Duyên I: Trợ Chiến is always available for an owned active confidant.
    out.push({
        id: `confidant.v87.${d.id}.assist`, event: d.assist.event, chancePct: 100, sourceTags: d.assist.event === 'OnHit' ? ['ActiveHit'] : undefined,
        cooldown: Math.max(4, d.assist.cooldown * (intimacy >= 50 ? .84 : 1)), effects: d.assist.effects.map(e => scaleEffect(e, relation * assistUpgrade)),
        runtimeV87: { kind: 'assist', confidantId: d.id, confidantName: d.name, abilityName: d.assist.name, label: 'TRỢ CHIẾN' },
    });
    if (intimacy >= 70 && fate >= 2)
        out.push({
            id: `confidant.v87.${d.id}.guard`, event: 'OnDamageTaken', chancePct: 100, cooldown: 99999, effects: d.guard.effects.map(e => scaleEffect(e, relation * 1.08)),
            runtimeV87: { kind: 'guard', confidantId: d.id, confidantName: d.name, abilityName: d.guard.name, label: 'HỘ ĐẠO', hpBelowPct: d.guard.hpBelowPct, oncePerBattle: true },
        });
    if (intimacy >= 100 && fate >= 5)
        out.push({
            id: `confidant.v87.${d.id}.harmony`, event: 'OnHit', chancePct: 100, sourceTags: ['ActiveHit'], cooldown: d.harmony.cooldown, effects: d.harmony.effects.map(e => scaleEffect(e, relation * 1.18)),
            runtimeV87: { kind: 'harmony', confidantId: d.id, confidantName: d.name, abilityName: d.harmony.name, label: 'TÂM Ý HỢP KÍCH' },
        });
    return out;
}
export function confidantViewV87(state, id) {
    const d = confidantDefinitionV87(id);
    if (!d)
        return undefined;
    const p = state.items?.[id] ?? { owned: false, level: 1, advance: 0, specificFragments: 0 };
    const intimacy = confidantIntimacyV87(p), fate = confidantFateV87(p), specialty = activeConfidantSpecialtyV87({ ...state, activeCompanionId: id });
    return { schema: CONFIDANT_SCHEMA_V87, id: d.id, code: d.code, name: d.name, title: d.title, fantasy: d.fantasy, asset: d.asset, combatStyle: d.combatStyle, intimacy, maxIntimacy: CONFIDANT_MAX_INTIMACY_V87, fate, maxFate: CONFIDANT_MAX_FATE_V87, fateLabel: confidantFateRomanV87(fate), active: state.activeCompanionId === id, specialty: { ...d.specialty, unlocked: intimacy >= 30, strengthPct: specialty?.strengthPct ?? 0 }, assist: { ...d.assist, unlocked: fate >= 1, upgraded: intimacy >= 50 }, guard: { ...d.guard, unlocked: intimacy >= 70 && fate >= 2 }, harmony: { ...d.harmony, unlocked: intimacy >= 100 && fate >= 5 } };
}
export function confidantIntimacyCostV87(p) { const intimacy = confidantIntimacyV87(p), fate = confidantFateV87(p); return Math.max(4, Math.floor(6 + intimacy * .55 + (fate - 1) * 5)); }
export function confidantFateCostV87(p) { return [24, 45, 80, 140][Math.max(0, confidantFateV87(p) - 1)] ?? Infinity; }
/** Collapse the legacy 120-name pool into the eight canonical V87 identities. */
export function migrateConfidantsV87(state) {
    if (state.confidantV87Migrated)
        return { migrated: false };
    const snapshot = Object.entries(state.items || {}).filter(([id]) => /^companion\.\d+$/.test(id));
    if (snapshot.some(([id]) => Number(id.split('.')[1]) > 8)) {
        const merged = new Map();
        for (const [id, p] of snapshot) {
            const n = Math.max(1, Number(id.split('.')[1]) || 1), target = `companion.${((n - 1) % 8) + 1}`;
            const row = merged.get(target) ?? { owned: false, level: 1, advance: 0, specificFragments: 0 };
            row.owned = Boolean(row.owned || p.owned);
            row.level = Math.max(row.level, Math.min(100, Math.max(1, Math.floor(p.level || 1))));
            row.advance = Math.max(row.advance, Math.min(4, Math.max(0, Math.floor(p.advance || 0))));
            row.specificFragments += Math.max(0, Math.floor(p.specificFragments || 0));
            merged.set(target, row);
        }
        for (const [id] of snapshot)
            delete state.items[id];
        for (const [id, p] of merged)
            state.items[id] = p;
        if (state.activeCompanionId) {
            const n = Math.max(1, Number(state.activeCompanionId.split('.')[1]) || 1);
            state.activeCompanionId = `companion.${((n - 1) % 8) + 1}`;
        }
    }
    // Clamp V86-era progression into the two canonical axes.
    for (const d of CONFIDANTS_V87) {
        const p = state.items?.[d.id];
        if (!p)
            continue;
        p.level = confidantIntimacyV87(p);
        p.advance = Math.max(0, Math.min(4, Math.floor(p.advance || 0)));
    }
    state.confidantV87Migrated = true;
    return { migrated: true };
}
//# sourceMappingURL=confidant-v87.js.map
// V148 — canonical infinite Confidant progression. V87 exports above remain compatibility-only.
export const CONFIDANT_SCHEMA_V148 = 'confidant.v148';
export const CONFIDANT_FRAGMENT_PER_STAR_V148 = 10;
export const CONFIDANT_GACHA_FRAGMENT_ROLL_V148 = 5;
export const CONFIDANT_DUPLICATE_FRAGMENT_V148 = 10;
export const CONFIDANT_BASE_INTIMACY_CAP_V148 = 100;
export const CONFIDANT_INTIMACY_PER_STAR_V148 = 50;
export const CONFIDANT_HARMONY_GAUGE_MAX_V148 = 100;
export const CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148 = 10;

const CONFIDANT_GRADE_POWER_V148 = Object.freeze({ mystic: 1, earth: 1.08, heaven: 1.18, immortal: 1.32 });
const CONFIDANT_HEART_BRANCHES_V148 = Object.freeze({
  'companion.1': [
    {id:'assist',name:'Sinh Mệnh',description:'Thanh Mộc Sinh Tức mạnh hơn; thiên về hồi phục chủ động.'},
    {id:'guard',name:'Hộ Đạo',description:'Mộc Linh Hộ Mệnh mạnh hơn khi rơi vào nguy hiểm.'},
    {id:'harmony',name:'Mộc Linh',description:'Vạn Mộc Hồi Xuân mạnh hơn và tích Đồng Tâm hiệu quả hơn.'},
  ],
  'companion.2': [
    {id:'assist',name:'Định Huyệt',description:'Tố Quang Điểm Huyệt mạnh hơn khi khai thác sơ hở.'},
    {id:'guard',name:'Tĩnh Tâm',description:'Tăng khả năng tự bảo hộ và hồi Chân Nguyên.'},
    {id:'harmony',name:'Vô Sai',description:'Vô Sai Nhất Kích mạnh hơn khi đã khóa nhịp mục tiêu.'},
  ],
  'companion.3': [
    {id:'assist',name:'Trợ Nguyên',description:'Liên Hỏa Trợ Nguyên mạnh hơn và giữ nhịp kỹ năng.'},
    {id:'guard',name:'Hộ Mạch',description:'Đan Tâm Hộ Mạch tăng khả năng cứu nguy.'},
    {id:'harmony',name:'Liên Hỏa',description:'Cửu Chuyển Liên Hỏa tăng hiệu lực hợp kích.'},
  ],
  'companion.4': [
    {id:'assist',name:'Khí Văn',description:'Phá Giáp Khí Văn tăng sát thương và Phá Thế.'},
    {id:'guard',name:'Huyền Thiết',description:'Huyền Thiết Hộ Thân tạo bảo hộ mạnh hơn.'},
    {id:'harmony',name:'Đoạn Giáp',description:'Thiên Công Đoạn Giáp mạnh hơn khi phá tuyến phòng thủ.'},
  ],
  'companion.5': [
    {id:'assist',name:'Thanh Âm',description:'Thanh Âm Trợ Đạo ổn định nhịp chiến tốt hơn.'},
    {id:'guard',name:'Quy Nguyên',description:'Tĩnh Tâm Quy Nguyên hồi phục tốt hơn.'},
    {id:'harmony',name:'Đồng Luật',description:'Thiên Âm Đồng Luật tăng hiệu lực nhịp chiến.'},
  ],
  'companion.6': [
    {id:'assist',name:'Linh Minh',description:'Linh Minh Khiếu hỗ trợ chuỗi Linh Thú tốt hơn.'},
    {id:'guard',name:'Hộ Chủ',description:'Vạn Thú Hộ Chủ tăng bảo hộ khi nguy hiểm.'},
    {id:'harmony',name:'Bách Thú',description:'Bách Thú Đồng Minh tăng sức mạnh phối hợp với Linh Thú.'},
  ],
  'companion.7': [
    {id:'assist',name:'Truy Yêu',description:'Truy Yêu Nhất Trảm tăng áp lực lên Boss.'},
    {id:'guard',name:'Nghịch Cảnh',description:'Nghịch Cảnh Phản Trảm mạnh hơn khi bị ép thế.'},
    {id:'harmony',name:'Tuyệt Sát',description:'Tuyệt Sát Trảm Yêu tăng bạo phát kết liễu.'},
  ],
  'companion.8': [
    {id:'assist',name:'Ám Tiễn',description:'Lưu Quang Ám Tiễn tăng khả năng làm suy yếu.'},
    {id:'guard',name:'Tàng Phong',description:'Tàng Phong Hộ Tâm tăng khả năng hóa giải bất lợi.'},
    {id:'harmony',name:'Vạn Biến',description:'Hồng Trần Vạn Biến tăng hiệu lực ứng biến.'},
  ],
});

const CONFIDANT_GAUGE_PROFILE_V148 = Object.freeze({
  'companion.1': [{event:'OnDamageTaken',gain:16}],
  'companion.2': [{event:'OnHit',sourceTags:['ActiveHit'],gain:10},{event:'OnShieldBreak',gain:20}],
  'companion.3': [{event:'OnHit',sourceTags:['ActiveHit'],gain:9},{event:'OnCrit',sourceTags:['ActiveHit'],gain:4}],
  'companion.4': [{event:'OnHit',sourceTags:['ActiveHit'],gain:10},{event:'OnShieldBreak',gain:30}],
  'companion.5': [{event:'OnHit',sourceTags:['ActiveHit'],gain:5},{event:'OnDodge',gain:10}],
  'companion.6': [{event:'OnHit',sourceTags:['Summon'],gain:18},{event:'OnHit',sourceTags:['ActiveHit'],gain:4}],
  'companion.7': [{event:'OnHit',sourceTags:['ActiveHit'],gain:5},{event:'OnCrit',sourceTags:['ActiveHit'],gain:16},{event:'OnShieldBreak',gain:24}],
  'companion.8': [{event:'OnDamageTaken',gain:12},{event:'OnDodge',gain:20},{event:'OnTargetDodge',gain:8}],
});

function clampInt(v,min,max){return Math.max(min,Math.min(max,Math.floor(Number(v)||0)));}
export function confidantStarsV148(p){
  if(Number.isFinite(Number(p?.stars)))return Math.max(0,Math.floor(Number(p.stars)));
  return clampInt(p?.advance,0,4)*5;
}
export function confidantIntimacyV148(p){return Math.max(1,Math.floor(Number(p?.level)||1));}
export function confidantIntimacyCapV148(p){return CONFIDANT_BASE_INTIMACY_CAP_V148+CONFIDANT_INTIMACY_PER_STAR_V148*confidantStarsV148(p);}
export function confidantEffectiveIntimacyV148(p){
  const lv=confidantIntimacyV148(p);
  if(lv<=100)return lv;
  if(lv<=500)return 100+(lv-100)*.20;
  if(lv<=2000)return 180+(lv-500)*.08;
  return 300+(lv-2000)*.015;
}
function confidantHeartStateV148(p){
  const old=p?.confidantHeartV148??{};
  return {assist:clampInt(old.assist,0,CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148),guard:clampInt(old.guard,0,CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148),harmony:clampInt(old.harmony,0,CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148),raw:Math.max(0,Math.floor(Number(old.raw)||0))};
}
export function confidantHeartPointSummaryV148(p,id){
  const stars=confidantStarsV148(p),tree=confidantHeartStateV148(p),earned=Math.floor(stars/10),used=tree.assist+tree.guard+tree.harmony+tree.raw;
  const repeatableUnlocked=tree.assist>=CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148&&tree.guard>=CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148&&tree.harmony>=CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148;
  return {earned,used,available:Math.max(0,earned-used),tree,branches:(CONFIDANT_HEART_BRANCHES_V148[id]??[]).map(x=>({...x,level:tree[x.id]??0,maxLevel:CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148})),repeatableRaw:tree.raw,repeatableUnlocked};
}
export function spendConfidantHeartPointV148(state,id,branch){
  const d=confidantDefinitionV87(id),p=state?.items?.[id];
  if(!d||!p?.owned)throw new Error('Chưa sở hữu Tri Kỷ này.');
  migrateConfidantsV148(state);
  const summary=confidantHeartPointSummaryV148(p,id);
  if(summary.available<=0)throw new Error('Chưa có Điểm Tâm Ý khả dụng; mỗi 10★ nhận 1 điểm.');
  const key=String(branch||'');
  if(!['assist','guard','harmony','raw'].includes(key))throw new Error('Nhánh Tâm Ý không tồn tại.');
  const tree=confidantHeartStateV148(p);
  if(key!=='raw'&&tree[key]>=CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148)throw new Error('Nhánh Tâm Ý này đã đạt cấp tối đa.');
  if(key==='raw'&&(tree.assist<CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148||tree.guard<CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148||tree.harmony<CONFIDANT_HEART_BRANCH_LEVEL_MAX_V148))throw new Error('Cần hoàn thiện cả 3 nhánh Tâm Ý trước khi mở RAW lặp vô hạn.');
  tree[key]+=1;p.confidantHeartV148=tree;
  return confidantHeartPointSummaryV148(p,id);
}
export function confidantHeartPowerV148(p,id){
  const d=confidantDefinitionV87(id),factor=CONFIDANT_GRADE_POWER_V148[d?.grade]??1,stars=confidantStarsV148(p),effective=confidantEffectiveIntimacyV148(p),heart=confidantHeartStateV148(p);
  return Math.max(1,Math.round((35+effective*5.5)*factor*(1+Math.min(20,stars)*.025)+heart.raw*24));
}
export function confidantIntimacyCostV148(p){
  const effective=confidantEffectiveIntimacyV148(p),stars=confidantStarsV148(p);
  return Math.max(4,Math.floor(8+effective*.75+Math.min(100,stars)*.5));
}
export function confidantStarEssenceCostV148(stars){
  const next=Math.max(0,Math.floor(Number(stars)||0))+1;
  if(next%5!==0)return 0;
  return Math.min(5,1+Math.floor(Math.max(0,next-5)/25));
}
export function confidantStarUpV148(state,id,count=1){
  migrateConfidantsV148(state);
  const d=confidantDefinitionV87(id),p=state?.items?.[id];
  if(!d||!p?.owned)throw new Error('Chưa sở hữu Tri Kỷ này.');
  let done=0,fragmentCost=0,essenceCost=0;
  for(let i=0;i<Math.max(1,Math.floor(Number(count)||1));i++){
    const stars=confidantStarsV148(p),needFrag=CONFIDANT_FRAGMENT_PER_STAR_V148,needEssence=confidantStarEssenceCostV148(stars),haveFrag=Math.max(0,Math.floor(Number(p.specificFragments)||0)),haveEssence=Math.max(0,Math.floor(Number(state?.economyV12325?.ascensionEssence?.companion)||0));
    if(haveFrag<needFrag||haveEssence<needEssence)break;
    p.specificFragments=haveFrag-needFrag;
    if(needEssence>0)state.economyV12325.ascensionEssence.companion=haveEssence-needEssence;
    p.stars=stars+1;p.advance=Math.min(4,Math.floor(p.stars/5));
    done++;fragmentCost+=needFrag;essenceCost+=needEssence;
  }
  if(!done){const stars=confidantStarsV148(p),needEssence=confidantStarEssenceCostV148(stars);throw new Error(`Thiếu mảnh Tri Kỷ hoặc Duyên Tinh: cần ${CONFIDANT_FRAGMENT_PER_STAR_V148} mảnh${needEssence?` + ${needEssence} Duyên Tinh`:''}.`);}
  return {definition:d,stars:confidantStarsV148(p),levels:done,fragmentCost,essenceCost,levelCap:confidantIntimacyCapV148(p),progress:{...p,confidantHeartV148:{...confidantHeartStateV148(p)}}};
}
function specialtyStrengthPctV148(intimacy,stars){
  if(intimacy<30)return 0;
  const effective=confidantEffectiveIntimacyV148({level:intimacy});
  return Number(Math.min(12,3+Math.min(5,Math.max(0,effective-30)*.025)+Math.min(4,stars*.2)).toFixed(2));
}
export function activeConfidantSpecialtyV148(state){
  const id=state?.activeCompanionId;if(!id)return undefined;
  const d=confidantDefinitionV87(id),p=state?.items?.[id];if(!d||!p?.owned)return undefined;
  const intimacy=confidantIntimacyV148(p),stars=confidantStarsV148(p),strengthPct=specialtyStrengthPctV148(intimacy,stars);
  return {id:d.specialty.id,name:d.specialty.name,description:d.specialty.description,strengthPct,unlocked:intimacy>=30,confidantId:d.id,confidantName:d.name,progressionSchema:CONFIDANT_SCHEMA_V148};
}
export function confidantFortuneSummaryV148(state){
  let owned=0,cultivationFlatPer15s=0,resourceMastery=0,craftMastery=0,totalHeartPower=0;
  const rows=[];
  for(const d of CONFIDANTS_V87){
    const p=state?.items?.[d.id];if(!p?.owned)continue;owned++;
    const intimacy=confidantIntimacyV148(p),stars=confidantStarsV148(p),effective=confidantEffectiveIntimacyV148(p),heartPower=confidantHeartPowerV148(p,d.id);
    const cultivationFlat=Math.max(1,Math.floor(1+effective*.08+Math.min(500,stars)*.03));
    const resourceFlat=Math.max(1,Math.floor(1+effective*.045+Math.min(500,stars)*.018));
    const craftFlat=Math.max(1,Math.floor(1+effective*.035+Math.min(500,stars)*.012));
    cultivationFlatPer15s+=cultivationFlat;resourceMastery+=resourceFlat;craftMastery+=craftFlat;totalHeartPower+=heartPower;
    rows.push({id:d.id,name:d.name,intimacy,stars,heartPower,cultivationFlat,resourceFlat,craftFlat});
  }
  return {schema:CONFIDANT_SCHEMA_V148,owned,total:CONFIDANTS_V87.length,cultivationFlatPer15s,resourceMastery,craftMastery,totalHeartPower,cultivationPct:0,huntRewardPct:0,craftQualityPct:0,rows};
}
function relationScaleV148(p){
  const effective=confidantEffectiveIntimacyV148(p),stars=confidantStarsV148(p);
  return Math.max(.9,Math.min(1.6,.9+Math.min(.55,effective*.0015)+Math.min(.15,stars*.003)));
}
function scaleEffectV148(e,scale,heartPower,kind,branchLevel){
  const branchBonus=1+Math.max(0,branchLevel)*.02;
  if(e.type==='damage'){const heartCoefficient=Math.min(kind==='harmony'?.28:kind==='guard'?.10:.12,heartPower*(kind==='harmony'?.00008:.000035))*branchBonus;return {...e,coefficient:e.coefficient*Math.min(1.55,scale)*branchBonus+heartCoefficient,flatDamage:Math.max(0,Number(e.flatDamage??0)),breakDamagePct:(e.breakDamagePct??0)*Math.min(1.35,scale)};}
  if(e.type==='heal')return {...e,flat:Math.round((e.flat??0)+heartPower*(kind==='harmony'?1.2:.48)*branchBonus),maxHpPct:(e.maxHpPct??0)*Math.min(1.28,scale)*branchBonus,attackCoefficient:(e.attackCoefficient??0)*Math.min(1.28,scale)*branchBonus};
  if(e.type==='shield')return {...e,capacity:Math.round((e.capacity??0)+heartPower*(kind==='harmony'?1.15:.5)*branchBonus),maxHpPct:(e.maxHpPct??0)*Math.min(1.28,scale)*branchBonus,attackCoefficient:(e.attackCoefficient??0)*Math.min(1.28,scale)*branchBonus};
  if(e.type==='restoreSpirit')return {...e,flat:(e.flat??0)*Math.min(1.5,scale)*branchBonus};
  if(e.type==='applyStatus')return {...e,duration:e.duration*Math.min(1.22,scale)*(1+Math.min(.1,branchLevel*.01))};
  return {...e};
}
export function confidantCombatTriggersV148(state){
  const id=state?.activeCompanionId;if(!id)return[];
  const d=confidantDefinitionV87(id),p=state?.items?.[id];if(!d||!p?.owned)return[];
  const intimacy=confidantIntimacyV148(p),stars=confidantStarsV148(p),heart=confidantHeartStateV148(p),heartPower=confidantHeartPowerV148(p,id),relation=relationScaleV148(p)*(CONFIDANT_COMBAT_TUNING_V108[id]??1),out=[];
  const legacyAssist=Boolean(p.legacyAssistUpgradeV148),legacyGuard=Boolean(p.legacyGuardUnlockedV148),legacyHarmony=Boolean(p.legacyHarmonyUnlockedV148);
  const assistScale=relation*((stars>=10||legacyAssist)?1.12:1);
  out.push({id:`confidant.v148.${d.id}.assist`,event:d.assist.event,chancePct:100,sourceTags:d.assist.event==='OnHit'?['ActiveHit']:undefined,cooldown:Math.max(4,d.assist.cooldown*((stars>=10||legacyAssist)?.82:1)),effects:d.assist.effects.map(e=>scaleEffectV148(e,assistScale,heartPower,'assist',heart.assist)),runtimeV87:{kind:'assist',confidantId:d.id,confidantName:d.name,abilityName:d.assist.name,label:'TRỢ CHIẾN'},runtimeV148:{kind:'assist'}});
  if(legacyGuard||(intimacy>=150&&stars>=3))out.push({id:`confidant.v148.${d.id}.guard`,event:'OnDamageTaken',chancePct:100,cooldown:99999,effects:d.guard.effects.map(e=>scaleEffectV148(e,relation*(stars>=20?1.18:1.06),heartPower,'guard',heart.guard)),runtimeV87:{kind:'guard',confidantId:d.id,confidantName:d.name,abilityName:d.guard.name,label:'HỘ ĐẠO',hpBelowPct:d.guard.hpBelowPct,oncePerBattle:true},runtimeV148:{kind:'guard'}});
  if(legacyHarmony||(intimacy>=250&&stars>=5)){
    const harmonyBranchGain=1+heart.harmony*.015;
    for(const [idx,g] of (CONFIDANT_GAUGE_PROFILE_V148[id]??[]).entries())out.push({id:`confidant.v148.${d.id}.gauge.${idx}`,event:g.event,chancePct:100,sourceTags:g.sourceTags,effects:[],runtimeV148:{kind:'gauge',gaugeGain:g.gain*harmonyBranchGain,confidantId:d.id,confidantName:d.name}});
    out.push({id:`confidant.v148.${d.id}.harmony`,event:'OnHit',chancePct:100,sourceTags:['ActiveHit'],effects:d.harmony.effects.map(e=>scaleEffectV148(e,relation*(stars>=50?1.28:1.12),heartPower,'harmony',heart.harmony)),runtimeV87:{kind:'harmony',confidantId:d.id,confidantName:d.name,abilityName:d.harmony.name,label:'TÂM Ý HỢP KÍCH'},runtimeV148:{kind:'harmony',harmonyCost:CONFIDANT_HARMONY_GAUGE_MAX_V148}});
  }
  return out;
}
export function confidantViewV148(state,id){
  const d=confidantDefinitionV87(id);if(!d)return undefined;
  const p=state?.items?.[id]??{owned:false,level:1,advance:0,stars:0,specificFragments:0};
  const intimacy=confidantIntimacyV148(p),stars=confidantStarsV148(p),maxIntimacy=confidantIntimacyCapV148(p),heartPower=confidantHeartPowerV148(p,id),heartTree=confidantHeartPointSummaryV148(p,id),specialty=activeConfidantSpecialtyV148({...state,activeCompanionId:id});
  const legacyAssist=Boolean(p.legacyAssistUpgradeV148),legacyGuard=Boolean(p.legacyGuardUnlockedV148),legacyHarmony=Boolean(p.legacyHarmonyUnlockedV148);
  return {schema:CONFIDANT_SCHEMA_V148,compatibilitySchema:CONFIDANT_SCHEMA_V87,id:d.id,code:d.code,name:d.name,title:d.title,fantasy:d.fantasy,asset:d.asset,combatStyle:d.combatStyle,intimacy,maxIntimacy,stars,maxStars:null,heartPower,active:state?.activeCompanionId===id,specialty:{...d.specialty,unlocked:intimacy>=30,strengthPct:specialty?.strengthPct??0},assist:{...d.assist,unlocked:true,upgraded:stars>=10||legacyAssist},guard:{...d.guard,unlocked:legacyGuard||(intimacy>=150&&stars>=3),upgraded:stars>=20},harmony:{...d.harmony,unlocked:legacyHarmony||(intimacy>=250&&stars>=5),upgraded:stars>=50,gaugeMax:CONFIDANT_HARMONY_GAUGE_MAX_V148,cooldown:undefined},heartTree,gaugeProfile:(CONFIDANT_GAUGE_PROFILE_V148[id]??[]).map(x=>({...x})),legacyPreserved:{assist:legacyAssist,guard:legacyGuard,harmony:legacyHarmony},milestones:{guard:{stars:3,intimacy:150},harmony:{stars:5,intimacy:250},assistII:10,guardII:20,harmonyII:50,capstone:100}};
}
export function migrateConfidantsV148(state){
  if(!state||state.confidantV148Migrated)return {migrated:false};
  if(!state.confidantV87Migrated)migrateConfidantsV87(state);
  for(const d of CONFIDANTS_V87){
    const p=state.items?.[d.id];if(!p)continue;
    const hadStars=Number.isFinite(Number(p.stars)),legacyLevel=Math.max(1,Math.floor(Number(p.level)||1)),legacyFate=clampInt(p.advance,0,4)+1;
    if(!hadStars){
      if(legacyLevel>=50)p.legacyAssistUpgradeV148=true;
      if(legacyLevel>=70&&legacyFate>=2)p.legacyGuardUnlockedV148=true;
      if(legacyLevel>=100&&legacyFate>=5)p.legacyHarmonyUnlockedV148=true;
      p.stars=clampInt(p.advance,0,4)*5;
    } else p.stars=Math.max(0,Math.floor(Number(p.stars)));
    p.level=Math.max(1,Math.floor(Number(p.level)||1));
    p.advance=Math.min(4,Math.floor(p.stars/5));
    p.specificFragments=Math.max(0,Math.floor(Number(p.specificFragments)||0));
    p.confidantHeartV148=confidantHeartStateV148(p);
    p.confidantV148Migrated=true;
  }
  state.confidantV148Migrated=true;
  return {migrated:true};
}
