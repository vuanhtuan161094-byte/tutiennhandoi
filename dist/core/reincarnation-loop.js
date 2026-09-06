export function projectLifeLegacy(settlement, previous) {
    const categories = Object.entries(settlement.categories)
        .map(([id, value]) => ({ id, score: value.score }))
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    const strongestCategory = categories[0] ?? { id: 'cultivation', score: 0 };
    const weakestCategory = categories[categories.length - 1] ?? { id: 'cultivation', score: 0 };
    const effective = settlement.reincarnationLegacy?.effective ?? false;
    const talentPoints = settlement.talentPointGain ?? 0;
    const reincarnationXp = settlement.reincarnationLegacy?.xp ?? 0;
    const mingJi = settlement.mingJiGain ?? 0;
    const readiness = !effective
        ? 'developing'
        : settlement.cpEarned >= 20 && talentPoints >= 3 && settlement.maxRealmOrder >= 10
            ? 'strong'
            : 'meaningful';
    const bestCp = previous.reduce((best, archive) => Math.max(best, archive.cpEarned), 0);
    const recommendations = [];
    if (!effective)
        recommendations.push('Đời này chưa đủ trọng lượng để sinh meta-progression đầy đủ; ưu tiên cảnh giới, First Clear hoặc thành tựu có ý nghĩa trước khi kết đời.');
    if (settlement.maxRealmOrder < 10)
        recommendations.push('Trúc Cơ là mốc đầu tiên giúp một đời bắt đầu có nền tảng Luân Hồi đáng kể.');
    if (talentPoints <= 0 && effective)
        recommendations.push('CP dự kiến còn thấp nên chưa sinh Điểm Thiên Phú; kéo dài đời hoặc tăng thành tựu đa dạng sẽ có lợi hơn reset sớm.');
    if (weakestCategory.score <= Math.max(8, strongestCategory.score * 0.2))
        recommendations.push(`Mảng ${weakestCategory.id} đang rất thấp; thêm một thành tựu thực ở mảng này sẽ tăng chất lượng một đời thay vì chỉ farm cùng một hành động.`);
    if (bestCp > 0 && settlement.cpEarned < bestCp * 0.65)
        recommendations.push(`CP dự kiến mới bằng ${Math.round(settlement.cpEarned / bestCp * 100)}% đời tốt nhất; chưa phải thời điểm tối ưu nếu mục tiêu là Luân Hồi lấy nền.`);
    if (readiness === 'strong')
        recommendations.push('Đời hiện tại đã tạo một gói kế thừa mạnh; có thể cân nhắc Tọa Hóa khi mục tiêu build của đời này đã hoàn tất.');
    return {
        score: settlement.totalScore,
        grade: settlement.grade,
        cp: settlement.cpEarned,
        talentPoints,
        reincarnationXp,
        mingJi,
        effective,
        readiness,
        strongestCategory,
        weakestCategory,
        versusBestCp: bestCp > 0 ? settlement.cpEarned / bestCp : undefined,
        recommendations,
    };
}
//# sourceMappingURL=reincarnation-loop.js.map