import { tacticalIdentity } from './combat-roles.js';
import { endlessHuntFloorEfficiency, highestUnlockedLocalFloor } from './endless-hunt.js';
export const PVE_PROGRESSION_V123_VERSION = '1.23.0';
/**
 * Reward falloff is deliberately based on progression gap, not current Combat Power.
 * Gear/build swaps therefore never change reward legality, and low-floor speed farming remains viable.
 */
export function huntFarmRewardEfficiencyV123(selectedLocalFloor, highestUnlockedLocal) {
    const selected = Math.max(1, Math.floor(selectedLocalFloor));
    const highest = Math.max(selected, Math.floor(highestUnlockedLocal));
    const gap = Math.max(0, highest - selected);
    let multiplier = 1;
    if (gap > 240)
        multiplier = .72;
    else if (gap > 120)
        multiplier = .82;
    else if (gap > 60)
        multiplier = .90;
    else if (gap > 20)
        multiplier = .96;
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
        if (!Number.isFinite(floor) || floor < start || floor > end)
            continue;
        const row = endlessHuntFloorEfficiency(floor, stats);
        if (row)
            rows.push(row);
    }
    return rows;
}
function preferReady(rows) {
    const ready = rows.filter(x => x.sampleReady);
    return ready.length ? ready : rows;
}
/** Three views only. Never auto-switch the player's selected floor. */
export function endlessHuntFarmRecommendationsV123(state, majorRealmIndex) {
    const rows = preferReady(telemetryRows(state, majorRealmIndex));
    const reliable = rows.filter(x => x.winRatePct >= 80);
    const speedPool = reliable.length ? reliable : rows;
    const speed = [...speedPool].sort((a, b) => (b.winRatePct - a.winRatePct) || (a.avgBattleSeconds - b.avgBattleSeconds) || (b.floor - a.floor))[0];
    // V77 compatibility: the legacy `cultivation` response key is retained for callers, but Hunt no longer grants Tu Vi.
    // Rank this lane by resource throughput instead.
    const cultivation = [...rows].sort((a, b) => (b.spiritStonesPerMinute - a.spiritStonesPerMinute) || (b.winRatePct - a.winRatePct) || (b.floor - a.floor))[0];
    const loot = [...rows].sort((a, b) => (b.dropsPerMinute - a.dropsPerMinute) || (b.spiritStonesPerMinute - a.spiritStonesPerMinute) || (b.winRatePct - a.winRatePct) || (b.floor - a.floor))[0];
    return {
        speed: { goal: 'speed', label: 'Tốc độ', description: 'Ưu tiên thắng ổn định và thời gian trận ngắn.', floor: speed },
        cultivation: { goal: 'cultivation', label: 'Tài nguyên', description: 'V77: ưu tiên Linh Thạch/phút; Săn Yêu không còn cấp Tu Vi trực tiếp.', floor: cultivation },
        loot: { goal: 'loot', label: 'Loot', description: 'Ưu tiên drop/phút, dùng Linh Thạch/phút để phá hòa.', floor: loot },
    };
}
export const huntBossMechanicsV123 = {
    Wood: { id: 'huntboss.v123.wood.van_moc_hoi_sinh', element: 'Wood', name: 'Vạn Mộc Hồi Sinh', description: 'Thủ Lĩnh Mộc lấy sức sống kéo dài giao tranh; build chỉ có sát thương đều dễ bị bào mòn.', counterHint: 'Dùng Cấm Hồi/Anti-Heal, hoặc chuẩn bị một cửa sổ Bộc Phát/Kết Liễu đủ rõ.', counterGroups: [{ label: 'Khóa hồi phục', roles: ['AntiHeal'] }, { label: 'Dứt điểm', roles: ['Burst', 'Finisher', 'Execute'] }] },
    Fire: { id: 'huntboss.v123.fire.phan_mach_bao_viem', element: 'Fire', name: 'Phần Mạch Bạo Viêm', description: 'Thủ Lĩnh Hỏa ép một cửa sổ bộc phát rất cao; build mỏng sẽ chết trước khi vòng xoay dài phát huy.', counterHint: 'Có Khiên/Hồi Phục để sống qua bộc phát, hoặc Ngắt/Phản Kích đúng cửa sổ.', counterGroups: [{ label: 'Chống bộc phát', roles: ['Barrier', 'Sustain'] }, { label: 'Bẻ nhịp', roles: ['Interrupt', 'Counter'] }] },
    Earth: { id: 'huntboss.v123.earth.tran_son_ho_the', element: 'Earth', name: 'Trấn Sơn Hộ Thế', description: 'Thủ Lĩnh Thổ dựa vào nền phòng thủ và Thế cao; đánh lan man kéo trận càng lâu.', counterHint: 'Chuẩn bị kỹ năng Phá Thế/Heavy và một cú Bộc Phát/Kết Liễu sau khi mở cửa sổ.', counterGroups: [{ label: 'Phá thế', roles: ['Break'] }, { label: 'Khai thác cửa sổ', roles: ['Burst', 'Finisher'] }] },
    Metal: { id: 'huntboss.v123.metal.bat_hoai_phong_mang', element: 'Metal', name: 'Bất Hoại Phong Mang', description: 'Thủ Lĩnh Kim vừa cứng vừa có nhịp phản sát khi người chơi tham công.', counterHint: 'Có Phá Thế để phá lớp cứng và Khiên/Phản Kích để không bị trả đòn trong cửa sổ nguy hiểm.', counterGroups: [{ label: 'Phá cứng', roles: ['Break'] }, { label: 'Đỡ phản sát', roles: ['Barrier', 'Counter', 'Sustain'] }] },
    Water: { id: 'huntboss.v123.water.trieu_tuc_nhieu_phap', element: 'Water', name: 'Triều Tức Nhiễu Pháp', description: 'Thủ Lĩnh Thủy kéo lệch nhịp Thi Triển/Thu Chiêu và ép người chơi đánh sai chuỗi.', counterHint: 'Dùng Giải Khống/Kháng Khống để giữ vòng xoay, hoặc Control/Interrupt để cắt nhịp đối phương.', counterGroups: [{ label: 'Giữ nhịp', roles: ['Cleanse', 'AntiControl'] }, { label: 'Đảo nhịp', roles: ['Control', 'Interrupt'] }] },
};
function rolesForLoadout(skillIds, registry) {
    const roles = new Set();
    for (const id of skillIds) {
        if (!registry.skills.has(id))
            continue;
        for (const role of tacticalIdentity(registry.skill(id), registry).roles)
            roles.add(role);
    }
    return [...roles];
}
/**
 * Legacy V1.23 fields retain scalar telemetry for save/UI compatibility. Since v1.30,
 * Săn Yêu resolves these mechanics as real HP/DPS/DEF effects; enemyPowerMultiplier no longer decides the fight.
 */
export function evaluateHuntBossMechanicV123(element, activeSkillIds, registry) {
    if (!element)
        return undefined;
    const def = huntBossMechanicsV123[element];
    if (!def)
        return undefined;
    const activeRoles = rolesForLoadout(activeSkillIds, registry);
    const matchedGroups = def.counterGroups.filter(group => group.roles.some(role => activeRoles.includes(role))).length;
    const totalGroups = def.counterGroups.length;
    const coveragePct = totalGroups ? Math.round(matchedGroups / totalGroups * 100) : 100;
    const verdict = matchedGroups >= totalGroups ? 'full' : matchedGroups > 0 ? 'partial' : 'none';
    const enemyPowerMultiplier = verdict === 'full' ? 1 : verdict === 'partial' ? 1.06 : 1.14;
    return { ...def, matchedGroups, totalGroups, coveragePct, enemyPowerMultiplier, enemyPowerModifierPct: Number(((enemyPowerMultiplier - 1) * 100).toFixed(1)), activeRoles, verdict };
}
//# sourceMappingURL=pve-progression-v123.js.map