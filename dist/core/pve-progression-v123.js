import { tacticalIdentity } from './combat-roles.js';
import { endlessHuntFloorEfficiency, highestUnlockedLocalFloor } from './endless-hunt.js';
export const PVE_PROGRESSION_V123_VERSION = '1.23.0';

export function huntFarmRewardEfficiencyV123(selectedLocalFloor, highestUnlockedLocal) {
    const selected = Math.max(1, Math.floor(selectedLocalFloor));
    const highest = Math.max(selected, Math.floor(highestUnlockedLocal));
    const gap = Math.max(0, highest - selected);
    let multiplier = 1;
    if (gap > 240) multiplier = .72;
    else if (gap > 120) multiplier = .82;
    else if (gap > 60) multiplier = .90;
    else if (gap > 20) multiplier = .96;
    const pct = Math.round(multiplier * 100);
    const label = pct === 100 ? 'Đầy đủ' : pct >= 96 ? 'Gần đầy đủ' : pct >= 90 ? 'Giảm nhẹ' : pct >= 82 ? 'Giảm vừa' : 'Giảm sâu';
    return { gap, multiplier, pct, label, reason: gap <= 20 ? 'Tầng farm còn sát tiến độ cao nhất.' : `Thấp hơn tiến độ cao nhất ${gap} tầng; phần thưởng biến đổi còn ${pct}%.` };
}
function telemetryRows(state, majorRealmIndex) {
    const major = Math.max(1, Math.floor(majorRealmIndex));
    const maxLocal = highestUnlockedLocalFloor(state, major);
    const start = (major - 1) * 800 + 1, end = (major - 1) * 800 + Math.max(1, maxLocal);
    const rows = [];
    for (const [key, stats] of Object.entries(state.floorStats)) {
        const floor = Math.floor(Number(key));
        if (!Number.isFinite(floor) || floor < start || floor > end) continue;
        const row = endlessHuntFloorEfficiency(floor, stats);
        if (row) rows.push(row);
    }
    return rows;
}
function preferReady(rows) { const ready = rows.filter(x => x.sampleReady); return ready.length ? ready : rows; }
export function endlessHuntFarmRecommendationsV123(state, majorRealmIndex) {
    const rows = preferReady(telemetryRows(state, majorRealmIndex));
    const reliable = rows.filter(x => x.winRatePct >= 80);
    const speedPool = reliable.length ? reliable : rows;
    const speed = [...speedPool].sort((a, b) => (b.winRatePct - a.winRatePct) || (a.avgBattleSeconds - b.avgBattleSeconds) || (b.floor - a.floor))[0];
    const cultivation = [...rows].sort((a, b) => (b.spiritStonesPerMinute - a.spiritStonesPerMinute) || (b.winRatePct - a.winRatePct) || (b.floor - a.floor))[0];
    const loot = [...rows].sort((a, b) => (b.dropsPerMinute - a.dropsPerMinute) || (b.spiritStonesPerMinute - a.spiritStonesPerMinute) || (b.winRatePct - a.winRatePct) || (b.floor - a.floor))[0];
    return {
        speed: { goal: 'speed', label: 'Tốc độ', description: 'Ưu tiên TTK ngắn và thắng ổn định.', floor: speed },
        cultivation: { goal: 'cultivation', label: 'Tài nguyên', description: 'Ưu tiên Linh Thạch/phút; Săn Yêu không cấp Tu Vi trực tiếp.', floor: cultivation },
        loot: { goal: 'loot', label: 'Loot', description: 'Ưu tiên drop/phút, không mặc định chọn Vực sâu nhất.', floor: loot },
    };
}

/** V143 Boss packages: lore skill name + an existing scalable CombatKernel boss skill template. */
export const huntBossMechanicsV123 = {
    Wood: {
        id: 'huntboss.v143.wood.van_moc_hoi_sinh', element: 'Wood', name: 'Vạn Mộc Hồi Sinh',
        description: 'Thủ Lĩnh Mộc kéo dài giao tranh bằng hồi phục, độc mộc và bộc phát sinh mệnh cuối trận.',
        counterHint: 'Cấm Hồi/Anti-Heal hoặc dồn Burst/Execute vào cửa sổ trước khi Boss hồi lại.',
        skills: [
            { id: 'moc.can_nguyen_phuc_sinh', name: 'Căn Nguyên Phục Sinh', role: 'Sustain', effect: 'Hút sinh lực và hồi HP.', runtimeSkillId: 'skill.boss.v81.life_siphon' },
            { id: 'moc.van_moc_ho_the', name: 'Vạn Mộc Hộ Thế', role: 'Barrier', effect: 'Dựng hộ thể để kéo dài giao tranh.', runtimeSkillId: 'skill.boss.v81.guard' },
            { id: 'moc.thanh_de_hoan_sinh', name: 'Thanh Đế Hoàn Sinh', role: 'Enrage', effect: 'Dưới 30% HP tung đại sát.', runtimeSkillId: 'skill.boss.v81.cataclysm' },
        ],
        enrageHpPct: 30,
        counterGroups: [{ label: 'Khóa hồi phục', roles: ['AntiHeal'] }, { label: 'Dứt điểm', roles: ['Burst', 'Finisher', 'Execute'] }],
    },
    Fire: {
        id: 'huntboss.v143.fire.phan_mach_bao_viem', element: 'Fire', name: 'Phần Mạch Bạo Viêm',
        description: 'Thủ Lĩnh Hỏa có chu kỳ đánh dấu rồi kích nổ, buộc build mỏng phải có lớp sống sót thật.',
        counterHint: 'Khiên/Hồi Phục để sống qua bộc phát hoặc Ngắt/Phản Kích đúng cửa sổ tụ Hỏa Ấn.',
        skills: [
            { id: 'hoa.hoa_an', name: 'Phần Thiên Hỏa Ấn', role: 'Setup', effect: 'Trọng kích tạo nhịp báo trước.', runtimeSkillId: 'skill.boss.v81.crushing_slam' },
            { id: 'hoa.bao_viem', name: 'Phần Mạch Bạo Viêm', role: 'Burst', effect: 'Xung bạo viêm vừa gây thương vừa khóa nhịp.', runtimeSkillId: 'skill.boss.v81.binding_wave' },
            { id: 'hoa.dai_nhat', name: 'Đại Nhật Diệt Thế', role: 'Enrage', effect: 'Dưới 30% HP tung đại sát.', runtimeSkillId: 'skill.boss.v81.cataclysm' },
        ],
        enrageHpPct: 30,
        counterGroups: [{ label: 'Chống bộc phát', roles: ['Barrier', 'Sustain'] }, { label: 'Bẻ nhịp', roles: ['Interrupt', 'Counter'] }],
    },
    Earth: {
        id: 'huntboss.v143.earth.tran_son_ho_the', element: 'Earth', name: 'Trấn Sơn Hộ Thế',
        description: 'Thủ Lĩnh Thổ dựng Hộ Thế, phản chấn và ép người chơi phải mở cửa sổ Phá Thế.',
        counterHint: 'Phá Thế/Heavy trước, sau đó Burst/Finisher khi phòng tuyến bị mở.',
        skills: [
            { id: 'tho.bat_dong', name: 'Bất Động Sơn Hà', role: 'Barrier', effect: 'Dựng khiên theo % HP.', runtimeSkillId: 'skill.boss.v81.guard' },
            { id: 'tho.tran_son', name: 'Trấn Sơn Trọng Kích', role: 'Break', effect: 'Trọng kích gây Phá Thế lớn.', runtimeSkillId: 'skill.boss.v81.crushing_slam' },
            { id: 'tho.tran_thien', name: 'Trấn Thiên Nhạc', role: 'Enrage', effect: 'Dưới 30% HP tung đại sát.', runtimeSkillId: 'skill.boss.v81.cataclysm' },
        ],
        enrageHpPct: 30,
        counterGroups: [{ label: 'Phá thế', roles: ['Break'] }, { label: 'Khai thác cửa sổ', roles: ['Burst', 'Finisher'] }],
    },
    Metal: {
        id: 'huntboss.v143.metal.bat_hoai_phong_mang', element: 'Metal', name: 'Bất Hoại Phong Mang',
        description: 'Thủ Lĩnh Kim vừa cứng vừa phản sát, có nhịp Phá Giáp và kết liễu người chơi tham công.',
        counterHint: 'Phá Thế để mở lớp cứng; Barrier/Counter/Sustain để không chết trong nhịp phản sát.',
        skills: [
            { id: 'kim.pha_giap', name: 'Canh Kim Phá Giáp', role: 'Break', effect: 'Trọng kích phá phòng tuyến.', runtimeSkillId: 'skill.boss.v81.crushing_slam' },
            { id: 'kim.bat_hoai', name: 'Bất Hoại Kiếm Giới', role: 'Barrier', effect: 'Dựng lớp hộ thế chống burst.', runtimeSkillId: 'skill.boss.v81.guard' },
            { id: 'kim.tram_menh', name: 'Nhất Kiếm Trảm Mệnh', role: 'Execute', effect: 'Dưới 30% HP tung đại sát kết liễu.', runtimeSkillId: 'skill.boss.v81.cataclysm' },
        ],
        enrageHpPct: 30,
        counterGroups: [{ label: 'Phá cứng', roles: ['Break'] }, { label: 'Đỡ phản sát', roles: ['Barrier', 'Counter', 'Sustain'] }],
    },
    Water: {
        id: 'huntboss.v143.water.trieu_tuc_nhieu_phap', element: 'Water', name: 'Triều Tức Nhiễu Pháp',
        description: 'Thủ Lĩnh Thủy khóa nhịp, kéo lệch vòng skill rồi chôn mục tiêu trong chu kỳ thủy triều.',
        counterHint: 'Giải Khống/Kháng Khống giữ rotation hoặc Control/Interrupt để cắt nhịp thủy triều.',
        skills: [
            { id: 'thuy.trieu_tuc', name: 'Triều Tức Phược Linh', role: 'Control', effect: 'Xung khóa nhịp ngắn.', runtimeSkillId: 'skill.boss.v81.binding_wave' },
            { id: 'thuy.thuong_hai_ho', name: 'Thương Hải Hộ Giới', role: 'Barrier', effect: 'Dựng khiên trì hoãn vòng burst.', runtimeSkillId: 'skill.boss.v81.guard' },
            { id: 'thuy.thuong_hai', name: 'Thương Hải Táng Thiên', role: 'Enrage', effect: 'Dưới 30% HP tung đại sát.', runtimeSkillId: 'skill.boss.v81.cataclysm' },
        ],
        enrageHpPct: 30,
        counterGroups: [{ label: 'Giữ nhịp', roles: ['Cleanse', 'AntiControl'] }, { label: 'Đảo nhịp', roles: ['Control', 'Interrupt'] }],
    },
};
function rolesForLoadout(skillIds, registry) {
    const roles = new Set();
    for (const id of skillIds) {
        if (!registry.skills.has(id)) continue;
        for (const role of tacticalIdentity(registry.skill(id), registry).roles) roles.add(role);
    }
    return [...roles];
}
export function evaluateHuntBossMechanicV123(element, activeSkillIds, registry) {
    if (!element) return undefined;
    const def = huntBossMechanicsV123[element];
    if (!def) return undefined;
    const activeRoles = rolesForLoadout(activeSkillIds, registry);
    const matchedGroups = def.counterGroups.filter(group => group.roles.some(role => activeRoles.includes(role))).length;
    const totalGroups = def.counterGroups.length;
    const coveragePct = totalGroups ? Math.round(matchedGroups / totalGroups * 100) : 100;
    const verdict = matchedGroups >= totalGroups ? 'full' : matchedGroups > 0 ? 'partial' : 'none';
    const enemyPowerMultiplier = verdict === 'full' ? 1 : verdict === 'partial' ? 1.06 : 1.14;
    return {
        ...def, matchedGroups, totalGroups, coveragePct, enemyPowerMultiplier,
        enemyPowerModifierPct: Number(((enemyPowerMultiplier - 1) * 100).toFixed(1)), activeRoles, verdict,
        skillNames: def.skills.map(skill => skill.name), runtimeSkillIds: def.skills.map(skill => skill.runtimeSkillId), phaseCount: def.skills.length,
    };
}
//# sourceMappingURL=pve-progression-v123.js.map