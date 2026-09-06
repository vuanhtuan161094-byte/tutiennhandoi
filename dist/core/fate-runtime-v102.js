export function createFateRuntimeState() { return { badLuckStreak: 0, fortuneInDisasterStacks: 0, nextOpportunityBoost: 0, tribulationMarks: 0, triggeredMajorRealmOrders: [], calamitiesSurvived: 0 }; }
export function cloneFateRuntimeState(v) { return { badLuckStreak: Math.max(0, v?.badLuckStreak ?? 0), fortuneInDisasterStacks: Math.max(0, v?.fortuneInDisasterStacks ?? 0), nextOpportunityBoost: Math.max(0, v?.nextOpportunityBoost ?? 0), tribulationMarks: Math.max(0, v?.tribulationMarks ?? 0), triggeredMajorRealmOrders: [...(v?.triggeredMajorRealmOrders ?? [])], calamitiesSurvived: Math.max(0, v?.calamitiesSurvived ?? 0) }; }
/** Deterministic, hunt-scoped Fate events. These are gameplay events, never flavor-only text. */
export function fateResolveHuntEvent(fate, rng, won, isEliteOrBoss) {
    const out = { rewardMultiplier: 1, spiritStoneDelta: 0, injuryDelta: 0, notes: [] };
    if (!fate)
        return out;
    const note = (text) => out.notes.push(`[Mệnh Cách · ${fate.name}] ${text}`);
    if (fate.id === 'fate.choke_on_water' && rng.chance(15)) {
        if (rng.chance(50)) {
            out.injuryDelta += 1;
            note('Đang thu chiến lợi phẩm lại trượt chân ngã: Thương Thế +1.');
        }
        else {
            out.spiritStoneDelta += 3;
            note('Vấp một cú nhưng nhặt được túi Linh Thạch rơi: Linh Thạch +3.');
        }
    }
    if (fate.id === 'fate.small_calamity' && rng.chance(10)) {
        out.injuryDelta += 1;
        out.rewardMultiplier *= 1.05;
        note('Tiểu tai ập tới; chịu thêm Thương Thế +1 nhưng mò được chút chiến lợi phẩm (+5%).');
    }
    if (fate.id === 'fate.shameless_luck' && !won && rng.chance(50)) {
        out.spiritStoneDelta += 2;
        note('Thua trận vẫn tiện tay nhặt nhạnh: Linh Thạch +2.');
    }
    if (fate.id === 'fate.wealth' && won && rng.chance(18)) {
        out.spiritStoneDelta += 5;
        note('Tài Vận phát tác: phát hiện thêm Linh Thạch +5.');
    }
    if (fate.id === 'fate.comet' && rng.chance(15)) {
        const r = rng.next();
        if (r < .45) {
            out.rewardMultiplier *= 1.25;
            note('Sao Chổi kéo tới cát biến: phần thưởng trận này +25%.');
        }
        else if (r < .90) {
            out.injuryDelta += 2;
            note('Sao Chổi kéo tới hung biến: Thương Thế +2.');
        }
        else {
            out.rewardMultiplier *= 1.60;
            out.injuryDelta += 2;
            note('Cực biến cùng lúc giáng xuống: phần thưởng +60% nhưng Thương Thế +2.');
        }
    }
    if (fate.id === 'fate.everywhere_events' && rng.chance(18)) {
        if (rng.chance(55)) {
            out.spiritStoneDelta += 4;
            note('Lại gặp chuyện: vô tình cứu được một tán tu, nhận Linh Thạch +4.');
        }
        else {
            out.injuryDelta += 1;
            note('Lại gặp chuyện: bị dư ba cuốn vào, Thương Thế +1.');
        }
    }
    if (fate.id === 'fate.ancestor_tomb' && won && rng.chance(isEliteOrBoss ? 12 : 6)) {
        if (rng.chance(30)) {
            out.rewardMultiplier *= 1.50;
            out.injuryDelta += 2;
            note('Phát hiện Cổ Mộ ẩn — chủ mộ vẫn còn sống! Cưỡng đoạt thành công: phần thưởng +50%, Thương Thế +2.');
        }
        else {
            out.rewardMultiplier *= 1.35;
            note('Phát hiện Cổ Mộ ẩn không người trông giữ: phần thưởng +35%.');
        }
    }
    if (fate.id === 'fate.outside_destiny' && rng.chance(isEliteOrBoss ? 18 : 9)) {
        if (rng.chance(50)) {
            out.rewardMultiplier *= 1.80;
            note('Ngoài Mệnh Số: biến cố hiếm chuyển thành đại cơ duyên, phần thưởng +80%.');
        }
        else {
            out.rewardMultiplier *= 1.20;
            out.injuryDelta += 3;
            note('Ngoài Mệnh Số: biến cố méo lệch thành hung cơ, phần thưởng +20% nhưng Thương Thế +3.');
        }
    }
    return out;
}
export function fateHuntModifiers(fate, state) {
    const out = { rewardMultiplier: 1, equipmentChanceBonusPct: 0, notes: [], consumeOpportunityBoost: false };
    if (!fate)
        return out;
    if (state.nextOpportunityBoost > 0) {
        out.rewardMultiplier *= 1 + state.nextOpportunityBoost;
        out.equipmentChanceBonusPct += Math.min(25, state.nextOpportunityBoost * 20);
        out.consumeOpportunityBoost = true;
        out.notes.push(`[Mệnh Cách · ${fate.name}] Phúc vận tích lũy kích hoạt: phần thưởng cơ duyên +${Math.round(state.nextOpportunityBoost * 100)}%.`);
    }
    if (fate.id === 'fate.child_of_destiny') {
        out.rewardMultiplier *= 1.18;
        out.equipmentChanceBonusPct += 8;
        out.notes.push(`[Mệnh Cách · ${fate.name}] Thiên Mệnh gia trì phần thưởng Bí Cảnh.`);
    }
    if (fate.id === 'fate.great_fortune') {
        out.rewardMultiplier *= 1.10;
        out.equipmentChanceBonusPct += 5;
    }
    if (fate.id === 'fate.heavenly_lonely') {
        out.rewardMultiplier *= 1.15;
        out.equipmentChanceBonusPct += 6;
        out.notes.push(`[Mệnh Cách · ${fate.name}] Độc hành: phần thưởng cá nhân được tăng.`);
    }
    if (fate.id === 'fate.myriad_tribulation' && state.tribulationMarks > 0) {
        out.rewardMultiplier *= 1 + Math.min(.4, state.tribulationMarks * .08);
        out.notes.push(`[Mệnh Cách · ${fate.name}] Kiếp Ấn ${state.tribulationMarks}/5 tăng phần thưởng.`);
    }
    return out;
}
export function fateOnHuntResult(fate, state, won, isEliteOrBoss) {
    if (!fate)
        return [];
    const notes = [];
    if (won) {
        if (state.nextOpportunityBoost > 0)
            state.nextOpportunityBoost = 0;
        if (fate.id === 'fate.unlucky_then_lucky' && state.badLuckStreak > 0) {
            notes.push(`[Mệnh Cách · ${fate.name}] Chuỗi vận rủi kết thúc ở ${state.badLuckStreak}.`);
            state.badLuckStreak = 0;
        }
        return notes;
    }
    if (fate.id === 'fate.unlucky_then_lucky') {
        state.badLuckStreak = Math.min(5, state.badLuckStreak + 1);
        const bonus = state.badLuckStreak >= 5 ? 1 : state.badLuckStreak === 4 ? 1 : state.badLuckStreak === 3 ? .5 : state.badLuckStreak === 2 ? .2 : 0;
        if (bonus > 0)
            state.nextOpportunityBoost = Math.max(state.nextOpportunityBoost, bonus);
        notes.push(`[Mệnh Cách · ${fate.name}] Vận rủi ${state.badLuckStreak}/5${bonus > 0 ? ` · cơ duyên kế +${Math.round(bonus * 100)}%` : ''}.`);
    }
    if (fate.id === 'fate.fortune_in_disaster' && isEliteOrBoss) {
        state.fortuneInDisasterStacks = Math.min(3, state.fortuneInDisasterStacks + 1);
        notes.push(`[Mệnh Cách · ${fate.name}] Phúc Duyên +1 (${state.fortuneInDisasterStacks}/3).`);
        if (state.fortuneInDisasterStacks >= 3) {
            state.fortuneInDisasterStacks = 0;
            state.nextOpportunityBoost = Math.max(state.nextOpportunityBoost, .5);
            notes.push(`[Mệnh Cách · ${fate.name}] Đủ Phúc Duyên: cơ duyên kế tiếp +50% phần thưởng.`);
        }
    }
    if (fate.id === 'fate.myriad_tribulation' && isEliteOrBoss) {
        state.calamitiesSurvived += 1;
        if (state.tribulationMarks < 5) {
            state.tribulationMarks += 1;
            notes.push(`[Mệnh Cách · ${fate.name}] Sống qua đại hung, Kiếp Ấn +1 (${state.tribulationMarks}/5).`);
        }
    }
    return notes;
}
export function fateOnBreakthrough(fate, state, success, toRealmOrder) {
    const notes = [];
    let spiritStones = 0, cultivationResource = 0;
    if (!fate)
        return { notes, spiritStones, cultivationResource };
    if (!success) {
        if (fate.id === 'fate.unlucky_then_lucky') {
            state.badLuckStreak = Math.min(5, state.badLuckStreak + 1);
            if (state.badLuckStreak >= 3)
                state.nextOpportunityBoost = Math.max(state.nextOpportunityBoost, state.badLuckStreak >= 5 ? 1 : state.badLuckStreak === 4 ? 1 : .5);
            notes.push(`[Mệnh Cách · ${fate.name}] Đột phá thất bại được tính vào chuỗi vận rủi (${state.badLuckStreak}/5).`);
        }
        if (fate.id === 'fate.fortune_in_disaster') {
            state.fortuneInDisasterStacks = Math.min(3, state.fortuneInDisasterStacks + 1);
            notes.push(`[Mệnh Cách · ${fate.name}] Phúc Duyên +1 (${state.fortuneInDisasterStacks}/3).`);
            if (state.fortuneInDisasterStacks >= 3) {
                state.fortuneInDisasterStacks = 0;
                state.nextOpportunityBoost = Math.max(state.nextOpportunityBoost, .5);
            }
        }
        return { notes, spiritStones, cultivationResource };
    }
    if (toRealmOrder !== undefined && [1, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46].includes(toRealmOrder) && !state.triggeredMajorRealmOrders.includes(toRealmOrder)) {
        state.triggeredMajorRealmOrders.push(toRealmOrder);
        if (fate.id === 'fate.purple_qi') {
            spiritStones = 10 + toRealmOrder * 2;
            cultivationResource = 1;
            notes.push(`[Mệnh Cách · ${fate.name}] Đại cảnh giới dẫn Tử Khí: nhận cơ duyên cảnh giới.`);
        }
        if (fate.id === 'fate.heaven_mandate' || fate.id === 'fate.child_of_destiny') {
            spiritStones = 20 + toRealmOrder * 3;
            cultivationResource = fate.id === 'fate.child_of_destiny' ? 2 : 1;
            notes.push(`[Mệnh Cách · ${fate.name}] Thiên Mệnh Sự Kiện kích hoạt theo đại cảnh giới.`);
        }
    }
    return { notes, spiritStones, cultivationResource };
}
//# sourceMappingURL=fate-runtime-v102.js.map