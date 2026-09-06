export const ARTIFACT_SCHEMA_V88 = 'artifact.production.v88';
export const ARTIFACT_MAX_REFINEMENT_V88 = 100;
export const ARTIFACT_MAX_GRADE_V88 = 5;
export const ARTIFACT_BASE_BAO_QI_MAX_V88 = 100;
export const ARTIFACT_BASE_BAO_QI_GAIN_V88 = 10;
export const ARTIFACT_GRADE_LABELS_V88 = ['I', 'II', 'III', 'IV', 'V'];
const dmg = (coefficient, extra = {}) => ({ type: 'damage', coefficient, sourceTag: 'Summon', canCrit: false, canDodge: true, procCoefficient: 0, ...extra });
const shield = (maxHpPct, duration = 5) => ({ type: 'shield', capacity: 0, stability: Infinity, duration, maxHpPct, overflowDamageRatio: .25 });
export const ARTIFACTS_V88 = [
    { id: 'artifact.spirit_suppressing_bell', name: 'Trấn Linh Chung', grade: 'earth', role: 'Phòng thủ', description: 'Cổ chung hộ chủ, chuyên chặn nhịp burst nguy hiểm.', passive: { name: 'Trấn Thể', description: 'Pháp Kỹ tạo khiên của bản thân mạnh hơn 10%.', shieldPct: 10 }, skill: { name: 'Chung Minh Hộ Chủ', description: 'Khi chịu sát thương và HP thấp, tiêu Bảo Khí dựng hộ thuẫn.', event: 'OnDamageTaken', cooldown: 12, baoQiCost: 45, hpBelowPct: 45, effects: [shield(12, 6)], grade3Effects: [{ type: 'restoreSpirit', flat: 10 }], grade5Effects: [shield(4, 4)] } },
    { id: 'artifact.thunder_guiding_mirror', name: 'Dẫn Lôi Kính', grade: 'earth', role: 'Đánh dấu / setup', description: 'Mặt kính dẫn điện quang, mở đường cho Pháp Bảo hệ Lôi.', passive: { name: 'Dẫn Khí', description: 'Tăng 5% Bảo Khí nhận từ hành động.', baoQiGainPct: 5 }, skill: { name: 'Kính Chiếu Lôi Ấn', description: 'Đòn đánh chủ động tích đủ nhịp sẽ đặt Lôi Ấn lên mục tiêu.', event: 'OnHit', sourceTags: ['ActiveHit'], cooldown: 6.5, baoQiCost: 22, baoQiGain: 5, effects: [{ type: 'addMark', mark: 'Lôi Ấn', stacks: 1, maxStacks: 10 }], grade3Effects: [{ type: 'addMark', mark: 'Lôi Ấn', stacks: 1, maxStacks: 10 }], grade5Effects: [dmg(.32, { elementalCoefficients: { Lightning: 1 }, canDodge: false })] } },
    { id: 'artifact.thunder_punishment_sword', name: 'Lôi Phạt Kiếm', grade: 'heaven', role: 'Burst', description: 'Phi kiếm thu Kiếp Lôi, chuyên truy kích mục tiêu đã bị dẫn lôi.', passive: { name: 'Kiếp Lôi', description: 'Pháp Kỹ Lôi Phạt gây thêm 8% hiệu lực.', powerPct: 8 }, skill: { name: 'Thiên Lôi Phạt', description: 'Sau nhịp công kích, tiêu Bảo Khí gọi thiên lôi đánh mục tiêu.', event: 'OnHit', sourceTags: ['ActiveHit'], cooldown: 8.5, baoQiCost: 55, effects: [dmg(.9, { elementalCoefficients: { Lightning: 1 }, breakDamagePct: 8 })], grade3Effects: [{ type: 'addMark', mark: 'Lôi Ấn', stacks: 1, maxStacks: 10 }], grade5Effects: [dmg(.45, { elementalCoefficients: { Lightning: 1 }, canDodge: false })] } },
    { id: 'artifact.true_sight_mirror', name: 'Phá Vọng Kính', grade: 'heaven', role: 'Khắc chế né', description: 'Bắt quỹ tích thân pháp và phản kích ngay khi đối thủ né.', passive: { name: 'Chiếu Chân', description: 'Pháp Kỹ của kính không thể bị né.', powerPct: 4 }, skill: { name: 'Phá Vọng Tỏa Ảnh', description: 'Khi mục tiêu né, lập tức chiếu chân và truy kích.', event: 'OnTargetDodge', sourceTags: ['ActiveHit'], cooldown: 6, baoQiCost: 28, effects: [dmg(.52, { canDodge: false, unavoidable: true }), { type: 'applyStatus', statusId: 'status.true_sight_focus', duration: 4, target: 'self' }], grade3Effects: [dmg(.22, { canDodge: false, unavoidable: true })], grade5Effects: [{ type: 'addMark', mark: 'Phá Vọng', stacks: 1, maxStacks: 3 }] } },
    { id: 'artifact.mountain_breaking_seal', name: 'Chấn Sơn Ấn', grade: 'heaven', role: 'Phá Thế', description: 'Ấn nặng phá hộ giới, ép mục tiêu sau khi khiên vỡ.', passive: { name: 'Trấn Sơn', description: 'Pháp Kỹ tăng 10% hiệu lực Phá Thế.', powerPct: 5 }, skill: { name: 'Chấn Sơn Phá Giáp', description: 'Khi phá khiên, giáng ấn gây sát thương và Giáp Liệt.', event: 'OnShieldBreak', sourceTags: ['ActiveHit', 'ProcHit'], cooldown: 7.5, baoQiCost: 35, effects: [dmg(.58, { breakDamagePct: 18, canDodge: false }), { type: 'applyStatus', statusId: 'status.armor_fracture', duration: 4, target: 'target' }], grade3Effects: [dmg(.28, { breakDamagePct: 8, canDodge: false })], grade5Effects: [{ type: 'addMark', mark: 'Sơn Chấn', stacks: 2, maxStacks: 5 }] } },
    { id: 'artifact.blood_severing_gourd', name: 'Đoạn Huyết Hồ', grade: 'heaven', role: 'DoT / anti-heal', description: 'Cảm ứng hồi phục của đối thủ rồi khóa đường sinh cơ.', passive: { name: 'Đoạn Sinh', description: 'Pháp Kỹ kéo dài áp lực anti-heal và huyết phệ.', powerPct: 6 }, skill: { name: 'Đoạn Huyết Phản Lưu', description: 'Khi địch hồi phục, tiêu Bảo Khí áp anti-heal và huyết phệ.', event: 'OnEnemyHeal', cooldown: 8, baoQiCost: 32, effects: [{ type: 'applyStatus', statusId: 'status.healing_suppressed', duration: 4.5, target: 'target' }, { type: 'damageOverTime', coefficientPerTick: .18, ticks: 3, interval: 1, element: 'Blood', procCoefficient: 0 }], grade3Effects: [dmg(.3, { elementalCoefficients: { Blood: 1 }, canDodge: false })], grade5Effects: [{ type: 'applyStatus', statusId: 'status.healing_suppressed', duration: 2, target: 'target' }] } },
    { id: 'artifact.purple_mansion_lamp', name: 'Tử Phủ Minh Đăng', grade: 'immortal', role: 'Bảo Khí engine', description: 'Minh đăng dưỡng thần, giữ nhịp Pháp Bảo trong trường chiến.', passive: { name: 'Minh Hỏa Dưỡng Bảo', description: 'Tăng 12% Bảo Khí nhận từ hành động.', baoQiGainPct: 12 }, skill: { name: 'Minh Đăng Hồi Vận', description: 'Định kỳ theo đòn chủ động, sinh Bảo Khí và hồi Chân Nguyên.', event: 'OnHit', sourceTags: ['ActiveHit'], cooldown: 8, baoQiCost: 0, baoQiGain: 24, effects: [{ type: 'restoreSpirit', flat: 8 }], grade3Effects: [shield(3, 4)], grade5Effects: [{ type: 'restoreSpirit', flat: 10 }] } },
    { id: 'artifact.golden_core_cauldron', name: 'Kim Đan Hỏa Đỉnh', grade: 'immortal', role: 'Burn / ramp', description: 'Đan hỏa nung lâu càng mạnh, tạo áp lực sát thương kéo dài.', passive: { name: 'Đan Hỏa', description: 'Tăng 7% hiệu lực Pháp Kỹ của Hỏa Đỉnh.', powerPct: 7 }, skill: { name: 'Đan Hỏa Phần Thân', description: 'Tiêu Bảo Khí phóng Đan Hỏa gây sát thương và thiêu đốt.', event: 'OnHit', sourceTags: ['ActiveHit'], cooldown: 8.5, baoQiCost: 44, effects: [dmg(.55, { elementalCoefficients: { Fire: 1 } }), { type: 'damageOverTime', coefficientPerTick: .2, ticks: 4, interval: 1, element: 'Fire', procCoefficient: 0 }], grade3Effects: [{ type: 'addMark', mark: 'Đan Hỏa', stacks: 1, maxStacks: 5 }], grade5Effects: [dmg(.4, { elementalCoefficients: { Fire: 1 } })] } },
    { id: 'artifact.starfall_sword_box', name: 'Tinh Lạc Kiếm Hạp', grade: 'immortal', role: 'Multi-hit / follow-up', description: 'Kiếm hạp phóng tinh kiếm nối đòn bạo kích.', passive: { name: 'Tinh Kiếm', description: 'Giảm 6% hồi chiêu Pháp Kỹ của Kiếm Hạp.', cooldownPct: 6 }, skill: { name: 'Tinh Lạc Truy Kiếm', description: 'Sau bạo kích, tiêu Bảo Khí phóng chuỗi tinh kiếm.', event: 'OnCrit', sourceTags: ['ActiveHit'], cooldown: 7, baoQiCost: 42, effects: [dmg(.38), dmg(.38)], grade3Effects: [dmg(.28)], grade5Effects: [dmg(.38)] } },
    { id: 'artifact.soul_nourishing_lotus', name: 'Dưỡng Hồn Liên', grade: 'extreme', role: 'Sustain / cleanse', description: 'Hồn liên hộ thần niệm, thanh tẩy và giữ Chân Nguyên.', passive: { name: 'Liên Tâm', description: 'Giảm 8% Bảo Khí tiêu hao của Pháp Kỹ bản thân.', costReductionPct: 8 }, skill: { name: 'Hồn Liên Tĩnh Tức', description: 'Khi chịu đòn lúc HP thấp, thanh tẩy khống chế nhẹ và hộ hồn.', event: 'OnDamageTaken', cooldown: 11, baoQiCost: 40, hpBelowPct: 55, effects: [{ type: 'removeStatus', groups: ['BodyControl', 'SpiritControl'], target: 'self' }, shield(7, 5), { type: 'restoreSpirit', flat: 12 }], grade3Effects: [{ type: 'heal', maxHpPct: 4, target: 'self' }], grade5Effects: [shield(4, 4)] } },
    { id: 'artifact.nascent_soul_banner', name: 'Nguyên Anh Phân Hồn Phiên', grade: 'extreme', role: 'Echo / duplicate hit', description: 'Phân hóa thần niệm thành nhiều tuyến công kích nối tiếp.', passive: { name: 'Phân Hồn', description: 'Pháp Kỹ gây thêm 9% hiệu lực.', powerPct: 9 }, skill: { name: 'Phân Hồn Tập Kích', description: 'Tiêu nhiều Bảo Khí để tạo hai ảnh hồn nối đòn.', event: 'OnHit', sourceTags: ['ActiveHit'], cooldown: 9.5, baoQiCost: 60, effects: [dmg(.5, { canDodge: false }), dmg(.5, { canDodge: false })], grade3Effects: [{ type: 'restoreSpirit', flat: 8 }], grade5Effects: [dmg(.5, { canDodge: false })] } },
    { id: 'artifact.green_spirit_gourd', name: 'Thanh Linh Hồ Lô', grade: 'breaker', role: 'Chân Nguyên engine', description: 'Hồ lô ôn dưỡng Chân Nguyên, cứu nhịp khi tài nguyên xuống thấp.', passive: { name: 'Hồi Linh', description: 'Tăng 8% Bảo Khí nhận từ hành động.', baoQiGainPct: 8 }, skill: { name: 'Linh Dịch Hồi Nguyên', description: 'Khi Chân Nguyên thấp, tiêu Bảo Khí để hồi Chân Nguyên chuẩn.', event: 'OnHit', sourceTags: ['ActiveHit'], cooldown: 10, baoQiCost: 30, spiritBelowPct: 30, effects: [{ type: 'restoreSpirit', flat: 26 }], grade3Effects: [shield(3, 4)], grade5Effects: [{ type: 'restoreSpirit', flat: 20 }] } },
];
export const RELICS_V88 = [
    { id: 'relic.1', name: 'Sơn Hà Đồ', grade: 'immortal', role: 'Đạo vực phòng thủ', description: 'Một Chí Bảo đổi nhịp nguy hiểm thành cửa phản công.', ruleName: 'Sơn Hà Giới', ruleDescription: 'Một lần/trận khi HP dưới 35%, triển khai Sơn Hà Giới: tạo khiên lớn và sinh Bảo Khí.', trigger: { name: 'Sơn Hà Giới', description: 'Một lần/trận khi HP dưới 35%, tạo hộ thuẫn và sinh Bảo Khí.', event: 'OnDamageTaken', cooldown: 999, baoQiCost: 0, baoQiGain: 25, hpBelowPct: 35, oncePerBattle: true, effects: [shield(18, 6)] } },
    { id: 'relic.2', name: 'Luân Hồi Kính', grade: 'extreme', role: 'Hộ mệnh', description: 'Không tăng stat thô; đổi quy tắc tử vong một lần mỗi trận.', ruleName: 'Luân Hồi Phản Chiếu', ruleDescription: 'Một lần/trận khi nhận đòn chí tử, giữ lại 1 HP và dựng hộ thuẫn.', reincarnationMirror: true },
    { id: 'relic.3', name: 'Trảm Tiên Đài', grade: 'extreme', role: 'Execute', description: 'Mở cửa kết liễu khi Boss bước vào vùng nguy hiểm.', ruleName: 'Trảm Tiên', ruleDescription: 'Khi mục tiêu dưới 20% HP, Pháp Kỹ định kỳ tung một nhát Trảm Tiên.', trigger: { name: 'Trảm Tiên', description: 'Địch dưới 20% HP sẽ bị Chí Bảo trảm kích.', event: 'OnHit', sourceTags: ['ActiveHit'], cooldown: 9, baoQiCost: 35, targetHpBelowPct: 20, effects: [dmg(.85, { canDodge: false, trueDamage: true })] } },
    { id: 'relic.4', name: 'Thái Hư Châu', grade: 'immortal', role: 'Tiết kiệm Bảo Khí', description: 'Nén hao tổn, phù hợp loadout nhiều spender.', ruleName: 'Thái Hư Dưỡng Khí', ruleDescription: 'Giảm 15% Bảo Khí tiêu hao của mọi Pháp Kỹ.', costReductionPct: 15 },
    { id: 'relic.5', name: 'Vạn Pháp Đạo Chung', grade: 'immortal', role: 'Bảo Khí engine', description: 'Đồng bộ nhịp pháp khí để loadout quay vòng ổn định hơn.', ruleName: 'Vạn Pháp Đồng Minh', ruleDescription: 'Tăng 15% Bảo Khí nhận từ hành động.', baoQiGainPct: 15 },
    { id: 'relic.6', name: 'Hỗn Độn Đỉnh', grade: 'extreme', role: 'Bể Bảo Khí', description: 'Mở rộng dung lượng để tích cho chuỗi Pháp Kỹ nặng.', ruleName: 'Hỗn Độn Dung Lô', ruleDescription: 'Tăng trần Bảo Khí thêm 25.', baoQiMaxBonus: 25 },
    { id: 'relic.7', name: 'Càn Khôn Xích', grade: 'immortal', role: 'Khắc chế né', description: 'Khóa không gian sau khi đối thủ né.', ruleName: 'Định Càn Khôn', ruleDescription: 'Khi mục tiêu né, phản kích không thể né và hoàn lại Bảo Khí.', trigger: { name: 'Định Càn Khôn', description: 'Khi mục tiêu né, phản kích không thể né.', event: 'OnTargetDodge', sourceTags: ['ActiveHit'], cooldown: 8, baoQiCost: 15, baoQiGain: 10, effects: [dmg(.58, { canDodge: false, unavoidable: true })] } },
    { id: 'relic.8', name: 'Tịnh Thế Liên', grade: 'breaker', role: 'Thanh tẩy', description: 'Chuyển một nhịp nguy hiểm thành trạng thái ổn định.', ruleName: 'Tịnh Thế', ruleDescription: 'Một lần mỗi 14 giây khi HP thấp, thanh tẩy khống chế và dựng khiên.', trigger: { name: 'Tịnh Thế', description: 'HP thấp: thanh tẩy khống chế và hộ thân.', event: 'OnDamageTaken', cooldown: 14, baoQiCost: 28, hpBelowPct: 45, effects: [{ type: 'removeStatus', groups: ['BodyControl', 'SpiritControl'], target: 'self' }, shield(9, 5)] } },
];
const A_BY_ID = new Map(ARTIFACTS_V88.map(x => [x.id, x]));
const R_BY_ID = new Map(RELICS_V88.map(x => [x.id, x]));
export function artifactDefinitionV88(id) { return A_BY_ID.get(id); }
export function relicDefinitionV88(id) { return R_BY_ID.get(id); }
export function artifactSlotCapacityV88(realmOrder) { return realmOrder < 10 ? 0 : realmOrder < 14 ? 2 : realmOrder < 22 ? 3 : 4; }
export function artifactGradeIndexV88(p) { return Math.max(0, Math.min(4, Math.floor(p?.advance ?? 0))); }
export function artifactGradeLabelV88(p) { return ARTIFACT_GRADE_LABELS_V88[artifactGradeIndexV88(p)]; }
export function artifactRefinementCostV88(p) { return Math.max(6, Math.ceil(7 + Math.max(1, p.level) * 1.75 + Math.max(0, p.advance) * 6)); }
export function artifactGradeCostV88(p) { return [20, 40, 75, 130][artifactGradeIndexV88(p)] ?? Infinity; }
export function artifactAscensionEssenceCostV88(p) { return [1, 2, 3, 5][artifactGradeIndexV88(p)] ?? Infinity; }
export function artifactFacilityDiscountPctV88(facilityLevel) { return Math.min(18, Math.max(0, Math.floor(facilityLevel) - 1) * 2); }
export function artifactRefinementEffectiveCostV88(p, facilityLevel = 1) { const base = artifactRefinementCostV88(p), discount = artifactFacilityDiscountPctV88(facilityLevel); return Math.max(1, Math.ceil(base * (1 - discount / 100))); }
export function artifactNextSlotUnlockV88(realmOrder) { const cap = artifactSlotCapacityV88(realmOrder); return cap <= 0 ? { slot: 1, realmOrder: 10, realm: 'Trúc Cơ' } : cap === 2 ? { slot: 3, realmOrder: 14, realm: 'Tử Phủ' } : cap === 3 ? { slot: 4, realmOrder: 22, realm: 'Nguyên Anh' } : undefined; }
export function equipArtifactSlotV88(state, id, capacity, slotIndex) {
    const d = A_BY_ID.get(id);
    if (!d)
        throw new Error('Pháp Bảo V88 không tồn tại.');
    const p = state.items[id];
    if (!p?.owned)
        throw new Error(`Chưa sở hữu ${d.name}.`);
    const cap = Math.max(0, Math.min(4, Math.floor(capacity)));
    if (cap <= 0)
        throw new Error('Pháp Bảo mở từ Trúc Cơ.');
    const current = [...new Set((state.activeArtifactIds ?? []).filter(x => A_BY_ID.has(x) && state.items[x]?.owned))].slice(0, cap);
    const existing = current.indexOf(id);
    if (slotIndex === undefined) {
        if (existing >= 0) {
            state.activeArtifactIds = current;
            return { slotIndex: existing, activeArtifactIds: [...current] };
        }
        if (current.length >= cap)
            throw new Error(`Đã dùng đủ ${cap}/${cap} ô Pháp Bảo. Hãy chọn rõ ô cần thay.`);
        current.push(id);
        state.activeArtifactIds = current;
        return { slotIndex: current.length - 1, activeArtifactIds: [...current] };
    }
    const target = Math.floor(slotIndex);
    if (target < 0 || target >= cap)
        throw new Error(`Ô Pháp Bảo ${target + 1} chưa mở.`);
    if (target > current.length)
        throw new Error('Hãy lấp các ô Pháp Bảo theo thứ tự trước khi dùng ô này.');
    if (existing >= 0) {
        if (existing === target) {
            state.activeArtifactIds = current;
            return { slotIndex: existing, activeArtifactIds: [...current] };
        }
        if (target < current.length) {
            const displaced = current[target];
            current[target] = id;
            current[existing] = displaced;
        }
        else {
            current.splice(existing, 1);
            current.push(id);
        }
    }
    else if (target < current.length)
        current[target] = id;
    else
        current.push(id);
    state.activeArtifactIds = current.slice(0, cap);
    return { slotIndex: state.activeArtifactIds.indexOf(id), activeArtifactIds: [...state.activeArtifactIds] };
}
export function migrateArtifactsV88(state) {
    const migrated = state.artifactV88Migrated === true;
    if (migrated)
        return state;
    const legacy = Object.entries(state.items ?? {}).filter(([id]) => /^treasure\.\d+$/.test(id));
    for (const [id, p] of legacy) {
        if (!p.owned && !p.specificFragments)
            continue;
        const n = Math.max(1, Number(id.split('.')[1] || 1));
        const def = ARTIFACTS_V88[(n - 1) % ARTIFACTS_V88.length];
        const dest = state.items[def.id] ?? (state.items[def.id] = { owned: false, level: 1, advance: 0, specificFragments: 0 });
        dest.owned = dest.owned || p.owned;
        dest.level = Math.max(dest.level, Math.min(ARTIFACT_MAX_REFINEMENT_V88, Math.max(1, p.level)));
        dest.advance = Math.max(dest.advance, Math.min(4, Math.floor(p.advance)));
        dest.specificFragments += Math.max(0, p.specificFragments || 0);
    }
    state.activeArtifactIds = [...new Set((state.activeArtifactIds ?? []).map(id => { if (!/^treasure\.\d+$/.test(id))
            return id; const n = Math.max(1, Number(id.split('.')[1] || 1)); return ARTIFACTS_V88[(n - 1) % ARTIFACTS_V88.length].id; }).filter(id => A_BY_ID.has(id)))].slice(0, 4);
    state.artifactV88Migrated = true;
    return state;
}
export function migrateRelicsV88(state) { const e = state.economyV12325; if (!e)
    return state; if (e.relicV88Migrated === true)
    return state; for (const [id, p] of Object.entries(e.extraItems ?? {})) {
    if (!/^relic\.\d+$/.test(id))
        continue;
    const n = Math.max(1, Number(id.split('.')[1] || 1));
    if (n <= 8)
        continue;
    const destId = `relic.${((n - 1) % 8) + 1}`, dest = e.extraItems[destId] ?? (e.extraItems[destId] = { owned: false, level: 1, advance: 0, specificFragments: 0 });
    dest.owned = dest.owned || p.owned;
    dest.level = Math.max(dest.level, Math.min(100, Math.max(1, p.level)));
    dest.advance = Math.max(dest.advance, Math.min(4, Math.floor(p.advance)));
    dest.specificFragments += Math.max(0, p.specificFragments || 0);
    if (e.activeRelicId === id)
        e.activeRelicId = destId;
} if (e.activeRelicId && !R_BY_ID.has(e.activeRelicId))
    e.activeRelicId = undefined; e.relicV88Migrated = true; return state; }
export function artifactFortuneSummaryV88(state) { migrateArtifactsV88(state); const owned = ARTIFACTS_V88.filter(d => state.items[d.id]?.owned); let points = 0; for (const d of owned) {
    const p = state.items[d.id];
    points += 1 + Math.floor(Math.max(1, p.level) / 20) + artifactGradeIndexV88(p) * 2;
} const artifactPowerPct = Math.min(12, points * .12), baoQiGainPct = Math.min(10, points * .10), cooldownRecoveryPct = Math.min(6, points * .055), relicPowerPct = Math.min(8, points * .07); return { schema: ARTIFACT_SCHEMA_V88, owned: owned.length, total: ARTIFACTS_V88.length, points, artifactPowerPct: Number(artifactPowerPct.toFixed(2)), baoQiGainPct: Number(baoQiGainPct.toFixed(2)), cooldownRecoveryPct: Number(cooldownRecoveryPct.toFixed(2)), relicPowerPct: Number(relicPowerPct.toFixed(2)) }; }
function scaleEffect(e, m) { const x = { ...e }; if (x.type === 'damage') {
    x.coefficient *= m;
    if (x.attackCoefficient)
        x.attackCoefficient *= m;
}
else if (x.type === 'damageOverTime')
    x.coefficientPerTick *= m;
else if (x.type === 'heal') {
    if (x.flat)
        x.flat *= m;
    if (x.maxHpPct)
        x.maxHpPct *= m;
    if (x.attackCoefficient)
        x.attackCoefficient *= m;
}
else if (x.type === 'shield') {
    x.capacity *= m;
    if (x.maxHpPct)
        x.maxHpPct *= m;
    if (x.attackCoefficient)
        x.attackCoefficient *= m;
}
else if (x.type === 'restoreSpirit')
    x.flat *= m;
else if (x.type === 'consumeMarkDamage') {
    x.baseCoefficient *= m;
    x.coefficientPerStack *= m;
} return x; }
function triggerFor(def, p, fortune) { const grade = artifactGradeIndexV88(p) + 1, refine = 0.82 + Math.max(1, Math.min(100, p.level)) * .0058, passive = 1 + (def.passive.powerPct ?? 0) / 100, fortuneMul = 1 + fortune.artifactPowerPct / 100, m = refine * (1 + (grade - 1) * .08) * passive * fortuneMul; const effectScale = (e) => scaleEffect(e, m * (e.type === 'shield' ? (1 + (def.passive.shieldPct ?? 0) / 100) : 1)); let effects = def.skill.effects.map(effectScale); if (grade >= 3 && def.skill.grade3Effects)
    effects.push(...def.skill.grade3Effects.map(effectScale)); if (grade >= 5 && def.skill.grade5Effects)
    effects.push(...def.skill.grade5Effects.map(effectScale)); const cd = def.skill.cooldown * (1 - (grade >= 4 ? .12 : 0)) * (1 - (def.passive.cooldownPct ?? 0) / 100) * (1 - fortune.cooldownRecoveryPct / 100); const cost = Math.max(0, Math.round(def.skill.baoQiCost * (1 - (def.passive.costReductionPct ?? 0) / 100))); return { id: `artifact.v88.skill.${def.id}`, event: def.skill.event, chancePct: 100, sourceTags: def.skill.sourceTags, effects, cooldown: Number(cd.toFixed(2)), runtimeV88: { kind: 'artifactSkill', itemId: def.id, itemName: def.name, abilityName: def.skill.name, label: 'PHÁP KỸ', baoQiCost: cost, baoQiGain: def.skill.baoQiGain ?? 0, hpBelowPct: def.skill.hpBelowPct, spiritBelowPct: def.skill.spiritBelowPct, targetHpBelowPct: def.skill.targetHpBelowPct, oncePerBattle: def.skill.oncePerBattle } }; }
export function artifactCombatRuntimeV88(state) {
    migrateArtifactsV88(state);
    migrateRelicsV88(state);
    const fortune = artifactFortuneSummaryV88(state), defs = state.activeArtifactIds.map(id => A_BY_ID.get(id)).filter(Boolean);
    const triggers = defs.map(d => triggerFor(d, state.items[d.id], fortune));
    let baoQiGainPct = fortune.baoQiGainPct, costReductionPct = 0, baoQiMax = ARTIFACT_BASE_BAO_QI_MAX_V88;
    for (const d of defs) {
        baoQiGainPct += d.passive.baoQiGainPct ?? 0;
    }
    const relicId = state.economyV12325?.activeRelicId, relic = relicId ? R_BY_ID.get(relicId) : undefined;
    if (relic) {
        baoQiGainPct += relic.baoQiGainPct ?? 0;
        costReductionPct += relic.costReductionPct ?? 0;
        baoQiMax += relic.baoQiMaxBonus ?? 0;
        if (relic.trigger) {
            const p = state.economyV12325?.extraItems?.[relic.id] ?? { owned: true, level: 1, advance: 0, specificFragments: 0 };
            const scale = (.9 + Math.max(1, Math.min(100, p.level)) * .0045) * (1 + artifactGradeIndexV88(p) * .06) * (1 + fortune.relicPowerPct / 100);
            triggers.push({ id: `artifact.v88.relic.${relic.id}`, event: relic.trigger.event, chancePct: 100, sourceTags: relic.trigger.sourceTags, effects: relic.trigger.effects.map(e => scaleEffect(e, scale)), cooldown: relic.trigger.cooldown, runtimeV88: { kind: 'relicRule', itemId: relic.id, itemName: relic.name, abilityName: relic.ruleName, label: 'CHÍ BẢO', baoQiCost: relic.trigger.baoQiCost, baoQiGain: relic.trigger.baoQiGain, hpBelowPct: relic.trigger.hpBelowPct, spiritBelowPct: relic.trigger.spiritBelowPct, targetHpBelowPct: relic.trigger.targetHpBelowPct, oncePerBattle: relic.trigger.oncePerBattle } });
        }
    }
    return { schema: ARTIFACT_SCHEMA_V88, equippedCount: defs.length, baoQiMax, baseGainPerAction: ARTIFACT_BASE_BAO_QI_GAIN_V88, baoQiGainPct: Number(baoQiGainPct.toFixed(2)), baoQiCostReductionPct: Math.min(40, Number(costReductionPct.toFixed(2))), artifactPowerPct: fortune.artifactPowerPct, relicPowerPct: fortune.relicPowerPct, relicId, triggers, reincarnationMirror: Boolean(relic?.reincarnationMirror), fortune };
}
export function applyArtifactsV88ToEntity(base, state) { const runtime = artifactCombatRuntimeV88(state); if (!runtime.equippedCount && !runtime.relicId)
    return base; return { ...base, tags: [...base.tags, ...(runtime.reincarnationMirror ? ['ArtifactV88:Relic:ReincarnationMirror'] : [])], triggers: [...(base.triggers ?? []), ...runtime.triggers], combatBuildV117: { ...(base.combatBuildV117 ?? {}), artifactV88: { schema: ARTIFACT_SCHEMA_V88, equippedCount: runtime.equippedCount, baoQiMax: runtime.baoQiMax, baseGainPerAction: runtime.baseGainPerAction, baoQiGainPct: runtime.baoQiGainPct, baoQiCostReductionPct: runtime.baoQiCostReductionPct, artifactPowerPct: runtime.artifactPowerPct, relicPowerPct: runtime.relicPowerPct, relicId: runtime.relicId } } }; }
export function artifactViewV88(state, id) { const d = A_BY_ID.get(id); if (!d)
    return undefined; const p = state.items[id] ?? { owned: false, level: 1, advance: 0, specificFragments: 0 }; return { ...d, progress: { ...p }, refinementLevel: Math.max(1, Math.min(100, p.level)), grade: artifactGradeLabelV88(p), gradeIndex: artifactGradeIndexV88(p) + 1, refinementCost: p.owned && p.level < 100 ? artifactRefinementCostV88(p) : undefined, gradeCost: p.owned && p.advance < 4 ? artifactGradeCostV88(p) : undefined, active: state.activeArtifactIds.includes(id) }; }
export function relicViewV88(state, id) { const d = R_BY_ID.get(id); if (!d)
    return undefined; const p = state.economyV12325?.extraItems?.[id] ?? { owned: false, level: 1, advance: 0, specificFragments: 0 }; return { ...d, progress: { ...p }, refinementLevel: Math.max(1, Math.min(100, p.level)), gradeLabel: artifactGradeLabelV88(p), gradeIndex: artifactGradeIndexV88(p) + 1, active: state.economyV12325?.activeRelicId === id }; }
//# sourceMappingURL=artifact-v88.js.map