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
        assist: { name: 'Phá Giáp Khí Văn', description: 'Một kích khí văn phá phòng và gây Phá Thế.', event: 'OnHit', cooldown: 7.5, effects: [damage(.40, 14, 'Metal'), status('status.armor_fracture', 4)] },
        guard: { name: 'Huyền Thiết Hộ Thân', description: 'Khi HP nguy hiểm, dựng khiên nặng; tối đa 1 lần/trận.', hpBelowPct: 34, effects: [shield(.18, 5)] },
        harmony: { name: 'Tâm Ý Hợp Kích · Thiên Công Đoạn Giáp', description: 'Phá giáp trước rồi giáng trọng kích Kim hệ.', cooldown: 13, effects: [status('status.armor_fracture', 5), damage(.86, 30, 'Metal')] },
    },
    {
        id: 'companion.5', code: 'ld', name: 'Lạc Dao', grade: 'mystic', title: 'Tĩnh Tu Cầm Sư', fantasy: 'Thanh tĩnh, bền bỉ; dùng nhịp cầm và hô hấp kéo người đồng hành về trạng thái nhập định.', asset: '/assets/hubs/companion.jpg', combatStyle: 'support',
        specialty: { id: 'cultivation', name: 'Tu Luyện', description: 'Tăng tốc nhận Tu Vi khi Đồng Hành và đã mở Sở Trường.' },
        assist: { name: 'Thanh Âm Trợ Đạo', description: 'Âm luật bồi Chân Nguyên rồi hóa thành linh nhận.', event: 'OnHit', cooldown: 8, effects: [spirit(12), status('status.wind_step', 4, 'self'), damage(.28, 4, 'Wind')] },
        guard: { name: 'Tĩnh Tâm Quy Nguyên', description: 'Khi HP nguy hiểm, hồi sinh lực và Chân Nguyên; tối đa 1 lần/trận.', hpBelowPct: 36, effects: [heal(4), spirit(20)] },
        harmony: { name: 'Tâm Ý Hợp Kích · Thiên Âm Đồng Luật', description: 'Đồng bộ nhịp chiến, hồi Chân Nguyên và tung âm nhận liên hoàn.', cooldown: 12, effects: [spirit(20), status('status.wind_step', 6, 'self'), damage(.64, 12, 'Wind')] },
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
        assist: { name: 'Truy Yêu Nhất Trảm', description: 'Trợ kích đơn mục tiêu với Phá Thế cao.', event: 'OnHit', cooldown: 7, effects: [damage(.46, 18, 'Metal')] },
        guard: { name: 'Nghịch Cảnh Phản Trảm', description: 'Khi HP nguy hiểm, dựng khiên rồi phản kích; tối đa 1 lần/trận.', hpBelowPct: 30, effects: [shield(.09, 2), damage(.38, 14, 'Metal')] },
        harmony: { name: 'Tâm Ý Hợp Kích · Tuyệt Sát Trảm Yêu', description: 'Đòn hợp kích bạo phát cực mạnh vào mục tiêu đang bị ép thế.', cooldown: 13, effects: [status('status.rhino_armor_broken', 4), damage(.94, 34, 'Metal')] },
    },
    {
        id: 'companion.8', code: 'btt', name: 'Bạch Tố Tâm', grade: 'heaven', title: 'Hồng Trần Thương Chủ', fantasy: 'Điềm đạm, linh hoạt; giỏi quan sát dòng tài nguyên và đổi thế bất lợi thành cơ hội.', asset: '/assets/hubs/companion.jpg', combatStyle: 'guard',
        specialty: { id: 'market', name: 'Phường Thị', description: 'Giảm chi phí giao dịch Phường Thị khi Đồng Hành và đã mở Sở Trường.' },
        assist: { name: 'Lưu Quang Ám Tiễn', description: 'Ám khí gây sát thương và làm suy yếu mục tiêu.', event: 'OnHit', cooldown: 8, effects: [damage(.34, 8, 'Poison'), status('status.poison_weakened', 4)] },
        guard: { name: 'Tàng Phong Hộ Tâm', description: 'Khi HP nguy hiểm, giải bất lợi và hồi phục; tối đa 1 lần/trận.', hpBelowPct: 37, effects: [{ type: 'removeStatus', groups: ['Debuff', 'BodyControl', 'SpiritControl'], target: 'self' }, heal(4)] },
        harmony: { name: 'Tâm Ý Hợp Kích · Hồng Trần Vạn Biến', description: 'Làm lộ sơ hở rồi tung liên kích hỗn hợp.', cooldown: 13.5, effects: [status('status.soul_exposed', 4), damage(.70, 20, 'Poison')] },
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