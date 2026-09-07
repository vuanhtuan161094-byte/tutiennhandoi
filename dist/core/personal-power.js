import { boundedStatCapV129, combatMaxHp } from './combat-rules.js';
const safe = (n, floor = 0.0001) => Math.max(floor, Number.isFinite(n) ? n : floor);
const round = (n, digits = 2) => Number(n.toFixed(digits));
export function combatPowerBreakdown(entity) {
    const s = entity.stats;
    const maxHp = combatMaxHp(s);
    const critLayers = Math.max(0, s.critChancePct ?? 0) / 100;
    const critDamagePct = Math.max(100, s.critDamagePct ?? 150);
    const critExpected = 1 + critLayers * Math.max(0, critDamagePct - 100) / 100;
    const heartChance = Math.min(100, Math.max(0, s.heartChancePct ?? 0)) / 100;
    const heartExpected = 1 + heartChance * Math.max(0, (s.heartDamagePct ?? 125) - 100) / 100;
    const pen = Math.min(100, Math.max(0, s.armorPenPct ?? 0));
    const speed = Math.max(.25, Math.min(3, s.actionSpeed ?? 1));
    // V129 axes are normalized to the same rough scale. They are guidance scores, never combat multipliers.
    const fateDamageMultiplierV4=1+Math.max(0,Number(entity?.combatBuildV117?.fateV4?.damagePct)||0)/100;
    const offense = Math.sqrt(safe(s.attack)) * 10 * fateDamageMultiplierV4
        * Math.sqrt(Math.max(1, critExpected * heartExpected))
        * (1 + pen / 250)
        * Math.pow(speed, .20);
    const dr = Math.min(80, Math.max(0, s.damageReductionPct ?? 0));
    const dodge = Math.min(100, Math.max(0, s.dodgeChancePct ?? 0));
    const healing = Math.max(0, s.healingEffectivenessPct ?? 0);
    const shield = Math.max(0, s.shieldEffectPct ?? 0);
    const survival = Math.pow(safe(maxHp) * safe(s.defense), .25) * 6
        * (1 + dr / 100 * 1.5)
        * (1 + dodge / 100 * .60)
        * (1 + Math.min(200, healing + shield) / 1000);
    const spirit = safe(s.maxSpirit);
    const efficiency = Math.min(50, Math.max(0, s.spiritEfficiencyPct ?? 0));
    const regen = Math.max(0, s.spiritRegenStandardPctPerSecond ?? 0);
    const resource = Math.sqrt(spirit) * 9
        * (1 + efficiency / 100)
        * (1 + Math.min(100, regen) / 250);
    const breakEffect = Math.max(0, s.breakEffectPct ?? 0);
    const controlResist = Math.min(200 / 3, Math.max(0, s.controlDurationReductionPct ?? 0));
    const tempo = 100 * speed
        * (1 + Math.min(200, breakEffect) / 400)
        * (1 + controlResist / 500);
    // Geometric mix keeps one extreme stat from hiding a genuine weak axis.
    const score = Math.pow(offense, .38) * Math.pow(survival, .34) * Math.pow(resource, .14) * Math.pow(tempo, .14);
    // control/mobility are compatibility aliases for old read clients only. V129 logic never ranks them.
    return { score: round(score), offense: round(offense), survival: round(survival), resource: round(resource), tempo: round(tempo), control: round(resource), mobility: round(tempo) };
}
function axisEntries(x) {
    return [['offense', x.offense], ['survival', x.survival], ['resource', x.resource], ['tempo', x.tempo]];
}
const axisVi = {
    offense: 'Sát thương', survival: 'Sinh tồn', resource: 'Tài nguyên / Chân Nguyên', tempo: 'Nhịp chiến đấu',
};
export function compareCombatPower(playerEntity, enemyEntity) {
    const player = combatPowerBreakdown(playerEntity);
    const enemy = combatPowerBreakdown(enemyEntity);
    const ratio = player.score / safe(enemy.score);
    const band = ratio >= 1.32 ? 'overwhelming' : ratio >= 1.08 ? 'favorable' : ratio >= 0.88 ? 'even' : ratio >= 0.67 ? 'risky' : 'deadly';
    const bandLabel = band === 'overwhelming' ? 'ÁP ĐẢO' : band === 'favorable' ? 'THUẬN LỢI' : band === 'even' ? 'NGANG CƠ' : band === 'risky' ? 'MẠO HIỂM' : 'CỰC NGUY';
    const ratios = axisEntries(player).map(([axis, value]) => [axis, value / safe(enemy[axis])]).sort((a, b) => a[1] - b[1]);
    const weakest = ratios[0];
    const strongest = ratios[ratios.length - 1];
    const diagnosis = `${axisVi[weakest[0]]} là điểm yếu tương đối (${weakest[1].toFixed(2)}× đối thủ); ${axisVi[strongest[0]]} là lợi thế (${strongest[1].toFixed(2)}×).`;
    const recommendations = [];
    if (weakest[0] === 'offense')
        recommendations.push('Ưu tiên Công Lực, skill/Công Pháp chủ lực, Bạo Kích/Hội Tâm hoặc Xuyên Phòng đúng build trước khi tái chiến.');
    if (weakest[0] === 'survival')
        recommendations.push('Ưu tiên Thể Phách, Phòng Ngự, Khiên/Hồi phục hoặc Giảm Sát Thương; đừng cố thắng bằng DPS nếu bị hạ quá sớm.');
    if (weakest[0] === 'resource')
        recommendations.push('Ưu tiên Chân Nguyên, Hồi Chân Nguyên hoặc Hiệu suất Chân Nguyên để rotation không hụt tài nguyên.');
    if (weakest[0] === 'tempo')
        recommendations.push('Ưu tiên Tốc Độ Hành Động, Phá Thế và rotation ít thời gian chết; không cần stack Accuracy/Mobility legacy.');
    if (ratio < 0.88)
        recommendations.push('Nếu chênh lệch vẫn lớn, đi first-clear tầng thấp hơn/farm trang bị rồi quay lại; game không scale boss theo Chiến Lực của ngươi.');
    else if (ratio < 1.08)
        recommendations.push('Kèo gần 50/50: đổi đúng 1–2 mảnh build có thể đáng giá hơn tăng thêm một cảnh giới phụ.');
    return { player, enemy, ratio: round(ratio, 3), band, bandLabel, diagnosis, recommendations };
}
export function summarizePersonalPower(args) {
    const breakdown = combatPowerBreakdown(args.finalEntity);
    const sorted = axisEntries(breakdown).sort((a, b) => a[1] - b[1]);
    const bottleneckAxis = sorted[0][0];
    const strongestAxis = sorted[sorted.length - 1][0];
    const identity = strongestAxis === 'offense' && bottleneckAxis === 'survival' ? 'Sát phạt cực đoan'
        : strongestAxis === 'survival' ? 'Phòng thủ vững chắc'
            : strongestAxis === 'resource' ? 'Linh hải trường tồn'
                : strongestAxis === 'tempo' ? 'Tiên cơ chưởng nhịp'
                    : 'Cân bằng chứng đạo';
    const sources = [];
    let previous = combatPowerBreakdown(args.stages[0]?.entity ?? args.finalEntity).score;
    let strategicGain = 0;
    let totalPositiveGain = 0;
    for (const stage of args.stages) {
        const score = combatPowerBreakdown(stage.entity).score;
        const gainPct = previous > 0 ? Math.max(0, (score / previous - 1) * 100) : 0;
        if (gainPct > 0) {
            totalPositiveGain += gainPct;
            if (stage.strategic)
                strategicGain += gainPct;
        }
        sources.push({ id: stage.id, name: stage.name, scoreAfter: round(score), gainPctFromPrevious: round(gainPct, 1) });
        previous = score;
    }
    const factionSharePct = totalPositiveGain > 0 ? Math.min(100, strategicGain / totalPositiveGain * 100) : 0;
    const personalSharePct = 100 - factionSharePct;
    const nextGoals = [
        `Nút thắt hiện tại: ${axisVi[bottleneckAxis]}.`,
        `Sở trường hiện tại: ${axisVi[strongestAxis]}.`,
        'Ưu tiên nâng chính bản thân trước; Tông Môn/Đạo Thống chỉ là con đường tài nguyên và ảnh hưởng tùy chọn.',
    ];
    return { score: breakdown.score, realmOrder: args.realmOrder, realmName: args.realmName, lifeNumber: args.lifeNumber, breakdown, strongestAxis, bottleneckAxis, identity, sources, personalSharePct: round(personalSharePct, 1), factionSharePct: round(factionSharePct, 1), nextGoals };
}

const STAT_PROVENANCE_DEFS_V129 = [
    { key: 'attack', name: 'Công', unit: 'number', group: 'Công kích' },
    { key: 'physique', name: 'Thể Phách', unit: 'number', group: 'Chỉ số Gốc' },
    { key: 'maxHp', name: 'Khí Huyết', unit: 'number', group: 'Sinh tồn' },
    { key: 'defense', name: 'Phòng', unit: 'number', group: 'Sinh tồn' },
    { key: 'maxSpirit', name: 'Chân Nguyên', unit: 'number', group: 'Tài nguyên' },
    { key: 'spiritRegenStandardPctPerSecond', name: 'Hồi Chân Nguyên', unit: 'pct_per_second', group: 'Tài nguyên' },
    { key: 'critChancePct', name: 'Bạo Kích', unit: 'pct_point', group: 'Công kích' },
    { key: 'critDamagePct', name: 'Bạo Thương', unit: 'pct_point', group: 'Công kích' },
    { key: 'heartChancePct', name: 'Hội Tâm', unit: 'pct_point', group: 'Công kích' },
    { key: 'heartDamagePct', name: 'Hội Tâm Thương', unit: 'pct_point', group: 'Công kích' },
    { key: 'dodgeChancePct', name: 'Né Tránh', unit: 'pct_point', group: 'Sinh tồn' },
    { key: 'armorPenPct', name: 'Xuyên Phòng', unit: 'pct_point', group: 'Công kích' },
    { key: 'damageReductionPct', name: 'Giảm Sát Thương', unit: 'pct_point', group: 'Sinh tồn' },
    { key: 'controlDurationReductionPct', name: 'Kháng Khống Chế', unit: 'pct_point', group: 'Sinh tồn' },
    { key: 'lifeStealPct', name: 'Hút Sinh Mệnh', unit: 'pct_point', group: 'Hồi phục' },
    { key: 'healingEffectivenessPct', name: 'Hiệu quả Hồi Phục', unit: 'pct_point', group: 'Hồi phục' },
    { key: 'spiritEfficiencyPct', name: 'Hiệu suất Chân Nguyên', unit: 'pct_point', group: 'Tài nguyên' },
    { key: 'actionSpeed', name: 'Tốc Độ Hành Động', unit: 'multiplier', group: 'Nhịp chiến đấu' },
    { key: 'breakEffectPct', name: 'Hiệu quả Phá Thế', unit: 'pct_point', group: 'Công kích' },
    { key: 'shieldEffectPct', name: 'Hiệu quả Khiên', unit: 'pct_point', group: 'Sinh tồn' },
];
function statValueV129(entity, key) {
    if (key === 'maxHp' && entity?.stats)
        return combatMaxHp(entity.stats);
    const value = entity?.stats?.[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
function changedV129(a, b) {
    return Math.abs(a - b) > Math.max(1e-9, Math.abs(a) * 1e-10, Math.abs(b) * 1e-10);
}
export function statProvenanceV129(stages, finalEntity, context = {}) {
    const ordered = (stages ?? []).filter(x => x?.entity?.stats);
    const baseEntity = ordered[0]?.entity ?? finalEntity;
    const out = [];
    for (const def of STAT_PROVENANCE_DEFS_V129) {
        const baseValue = statValueV129(baseEntity, def.key);
        const finalValue = statValueV129(finalEntity, def.key);
        const sources = [];
        let previous = baseValue;
        for (let i = 1; i < ordered.length; i++) {
            const stage = ordered[i];
            const after = statValueV129(stage.entity, def.key);
            if (changedV129(previous, after)) {
                const exactFlat = Number(stage.meta?.flatStats?.[def.key] ?? 0);
                const exactMultiplier = Number(stage.meta?.statMultipliers?.[def.key] ?? 0);
                sources.push({
                    id: stage.id,
                    name: stage.name,
                    before: round(previous, 6),
                    after: round(after, 6),
                    realizedDelta: round(after - previous, 6),
                    unit: def.unit,
                    flatInput: Number.isFinite(exactFlat) && exactFlat !== 0 ? round(exactFlat, 6) : undefined,
                    multiplierPctInput: Number.isFinite(exactMultiplier) && exactMultiplier !== 0 ? round(exactMultiplier * 100, 6) : undefined,
                    meta: stage.meta?.provenance ?? stage.meta?.sourceSummary,
                });
            }
            previous = after;
        }
        const boundedCap = boundedStatCapV129(def.key);
        const stackingRule = def.key === 'critChancePct'
            ? { id: 'additive_unbounded', name: 'Cộng thẳng · không trần', detail: 'Bạo Kích cộng trực tiếp; vượt 100% tạo tầng Bạo Kích cao hơn.' }
            : boundedCap !== undefined
                ? { id: 'remaining_space', name: `Theo phần còn lại · trần ${round(boundedCap, 2)}%`, detail: 'Mỗi nguồn mới ăn vào phần hiệu lực còn lại; không cộng số học rồi vứt phần vượt trần.' }
                : undefined;
        out.push({
            key: def.key,
            name: def.name,
            group: def.group,
            unit: def.unit,
            baseValue: round(baseValue, 6),
            finalValue: round(finalValue, 6),
            totalDelta: round(finalValue - baseValue, 6),
            stackingRule,
            sources,
        });
    }
    const life = context.corePotential?.life?.allocations ?? {};
    const permanent = context.corePotential?.permanent ?? {};
    const rootStats = [
        { id: 'power', name: 'Công Lực', lifePoints: Math.max(0, Number(life.power) || 0), permanentPoints: Math.max(0, Number(permanent.power) || 0), combatStat: 'Công', perPointText: '+1 Công', combatPerPoint: 1 },
        { id: 'body', name: 'Thể Phách', lifePoints: Math.max(0, Number(life.body) || 0), permanentPoints: Math.max(0, Number(permanent.body) || 0), combatStat: 'Thể Phách / Khí Huyết', perPointText: '+1 Thể Phách · +20 Khí Huyết chuẩn', combatPerPoint: 1 },
        { id: 'defense', name: 'Phòng Ngự', lifePoints: Math.max(0, Number(life.defense) || 0), permanentPoints: Math.max(0, Number(permanent.defense) || 0), combatStat: 'Phòng', perPointText: '+3 Phòng', combatPerPoint: 3 },
    ].map(x => ({ ...x, totalPoints: x.lifePoints + x.permanentPoints, combatContribution: (x.lifePoints + x.permanentPoints) * x.combatPerPoint }));
    return {
        schema: 'stat-provenance.v129',
        rootStats,
        terminology: {
            rootStat: 'Chỉ số Gốc = Công Lực / Thể Phách / Phòng Ngự dùng để phân Tiềm Năng.',
            baseValue: 'Giá trị Nền = stat của CombatEntity trước khi các hệ thống cá nhân cộng thêm.',
            flat: 'Cộng thẳng = +X đơn vị.',
            percentagePoint: 'Điểm % = mức tỷ lệ do nguồn ghi. Bạo Kích cộng thẳng; Né/Hội Tâm/Xuyên/Giảm Thương/Kháng Khống cộng theo phần hiệu lực còn lại.',
            multiplier: '% nhân = nhân giá trị số của chính nguồn theo thứ tự runtime.',
            realized: 'Delta nguồn = thay đổi thực tế sau khi nguồn đó được áp. Với % có trần, delta có thể nhỏ hơn con số nguồn ghi vì cộng theo phần còn lại.',
        },
        stats: out,
    };
}

//# sourceMappingURL=personal-power.js.map