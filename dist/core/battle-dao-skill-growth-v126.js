const ROLE_NAME = {
    generator: 'Tích thế', breaker: 'Phá thế', spender: 'Xả thế', finisher: 'Kết liễu', defense: 'Hộ thân', channel: 'Dẫn pháp', control: 'Nhiễu thức', burst: 'Bộc phát',
};
const ROLE_BY_SKILL_ID = {
    // Kiếm
    'skill.dao.sword.flow_slash': 'generator', 'skill.dao.sword.nurture': 'generator', 'skill.dao.sword.break_mark': 'breaker', 'skill.dao.sword.chain': 'generator',
    'skill.dao.sword.counter': 'generator', 'skill.dao.sword.sever': 'breaker', 'skill.dao.sword.finisher': 'finisher', 'skill.dao.sword.myriad': 'channel', 'skill.dao.sword.ultimate': 'finisher',
    // Quyền
    'skill.dao.fist.triple': 'generator', 'skill.dao.fist.shock': 'breaker', 'skill.dao.fist.nurture': 'generator', 'skill.dao.fist.heavy': 'spender',
    'skill.dao.fist.counter': 'generator', 'skill.dao.fist.chain_heavy': 'generator', 'skill.dao.fist.pressure': 'breaker', 'skill.dao.fist.finisher': 'finisher', 'skill.dao.fist.ultimate': 'finisher',
    // Thể
    'skill.dao.body.guard': 'defense', 'skill.dao.body.transform': 'defense', 'skill.dao.body.immovable': 'defense', 'skill.dao.body.counter': 'spender',
    'skill.dao.body.elephant': 'burst', 'skill.dao.body.break': 'breaker', 'skill.dao.body.recover': 'defense', 'skill.dao.body.finisher': 'finisher', 'skill.dao.body.ultimate': 'finisher',
    // Pháp
    'skill.dao.spell.light': 'burst', 'skill.dao.spell.channel': 'channel', 'skill.dao.spell.restore': 'defense', 'skill.dao.spell.shield': 'defense',
    'skill.dao.spell.seal': 'generator', 'skill.dao.spell.burst': 'burst', 'skill.dao.spell.break': 'breaker', 'skill.dao.spell.transform': 'spender', 'skill.dao.spell.ultimate': 'burst',
    // Độc
    'skill.dao.poison.bone': 'generator', 'skill.dao.poison.heart': 'generator', 'skill.dao.poison.insects': 'channel', 'skill.dao.poison.mist': 'generator',
    'skill.dao.poison.transform': 'spender', 'skill.dao.poison.guard': 'defense', 'skill.dao.poison.consume': 'finisher', 'skill.dao.poison.calamity': 'generator', 'skill.dao.poison.ultimate': 'finisher',
    // Ngự Khí
    'skill.dao.artifact.deploy': 'generator', 'skill.dao.artifact.guard': 'defense', 'skill.dao.artifact.strike': 'breaker', 'skill.dao.artifact.sync': 'burst',
    'skill.dao.artifact.recall': 'defense', 'skill.dao.artifact.split': 'generator', 'skill.dao.artifact.merge': 'burst', 'skill.dao.artifact.suppress': 'breaker', 'skill.dao.artifact.ultimate': 'burst',
    // Trận
    'skill.dao.formation.deploy': 'generator', 'skill.dao.formation.nourish': 'channel', 'skill.dao.formation.fortify': 'defense', 'skill.dao.formation.small_activate': 'spender',
    'skill.dao.formation.full_activate': 'finisher', 'skill.dao.formation.seal': 'generator', 'skill.dao.formation.convert': 'defense', 'skill.dao.formation.break': 'defense', 'skill.dao.formation.ultimate': 'finisher',
    // Thần Niệm
    'skill.dao.mind.mark': 'generator', 'skill.dao.mind.split': 'generator', 'skill.dao.mind.interfere': 'control', 'skill.dao.mind.guard': 'defense',
    'skill.dao.mind.chase': 'generator', 'skill.dao.mind.burst': 'finisher', 'skill.dao.mind.observe': 'channel', 'skill.dao.mind.flow': 'generator', 'skill.dao.mind.ultimate': 'finisher',
};
const STAGE_NAME = { 100: 'Tiểu Thành', 250: 'Đại Thành', 500: 'Hóa Cảnh', 750: 'Viên Mãn', 1000: 'Cực Ý' };
const ZERO = { effectBonusPct: 0, breakBonusPct: 0, spiritCostReductionPct: 0, cooldownReductionPct: 0, castTimeReductionPct: 0, recoveryReductionPct: 0, daoGeneratePct: 0, daoRefundPct: 0, controlEffectPct: 0 };
const D = (summary, delta) => ({ summary, ...ZERO, ...delta });
const GROWTH = {
    generator: {
        100: D('Chiêu tích thế ổn định hơn: +3% hiệu quả chính.', { effectBonusPct: 3 }),
        250: D('Khả năng sinh tài nguyên Bản Đạo/Ấn tăng 10%.', { daoGeneratePct: 10 }),
        500: D('Vận chiêu thuần thục: giảm thêm 2% Chân Nguyên.', { spiritCostReductionPct: 2 }),
        750: D('Thu thế gọn hơn: giảm 4% Thu Chiêu.', { recoveryReductionPct: 4 }),
        1000: D('Cực Ý: sinh tài nguyên thêm 10% nữa và +3% hiệu quả chính.', { daoGeneratePct: 10, effectBonusPct: 3 }),
    },
    breaker: {
        100: D('Đường Phá rõ hơn: +8% hiệu quả Phá Thế của chiêu.', { breakBonusPct: 8 }),
        250: D('Thế phá ổn định: +4% hiệu quả chính.', { effectBonusPct: 4 }),
        500: D('Giảm thêm 2% Chân Nguyên khi vận chiêu.', { spiritCostReductionPct: 2 }),
        750: D('Thu thế nhanh hơn: giảm 4% Thu Chiêu.', { recoveryReductionPct: 4 }),
        1000: D('Cực Ý: +12% Phá Thế và +4% hiệu quả chính.', { breakBonusPct: 12, effectBonusPct: 4 }),
    },
    spender: {
        100: D('Xả thế chính xác hơn: +4% hiệu quả chính.', { effectBonusPct: 4 }),
        250: D('Payoff khi xả tăng thêm 4%.', { effectBonusPct: 4 }),
        500: D('Giảm thêm 2% Chân Nguyên.', { spiritCostReductionPct: 2 }),
        750: D('Giảm 4% Thu Chiêu sau lần xả.', { recoveryReductionPct: 4 }),
        1000: D('Cực Ý: hoàn 10% tài nguyên Bản Đạo thực đã tiêu và +4% hiệu quả chính.', { daoRefundPct: 10, effectBonusPct: 4 }),
    },
    finisher: {
        100: D('Kết chiêu sắc hơn: +5% hiệu quả chính.', { effectBonusPct: 5 }),
        250: D('Đòn kết có thêm +5% Phá Thế.', { breakBonusPct: 5 }),
        500: D('Giảm thêm 2% Chân Nguyên.', { spiritCostReductionPct: 2 }),
        750: D('Giảm 4% Thu Chiêu sau sát chiêu.', { recoveryReductionPct: 4 }),
        1000: D('Cực Ý: hoàn 12% tài nguyên Bản Đạo thực đã tiêu và +5% hiệu quả chính.', { daoRefundPct: 12, effectBonusPct: 5 }),
    },
    defense: {
        100: D('Hộ thân ổn định hơn: +5% hiệu quả khiên/hồi phục/hiệu quả chính.', { effectBonusPct: 5 }),
        250: D('Chuyển thủ sang nhịp kế nhanh hơn: giảm 3% Thu Chiêu.', { recoveryReductionPct: 3 }),
        500: D('Giảm thêm 3% Chân Nguyên.', { spiritCostReductionPct: 3 }),
        750: D('Giảm thêm 3% Hồi Chiêu.', { cooldownReductionPct: 3 }),
        1000: D('Cực Ý: +8% hiệu quả phòng thủ/hiệu quả chính.', { effectBonusPct: 8 }),
    },
    channel: {
        100: D('Dẫn pháp ổn định: +4% hiệu quả toàn lần dẫn.', { effectBonusPct: 4 }),
        250: D('Nhập dẫn nhanh hơn: giảm 4% Thi Triển.', { castTimeReductionPct: 4 }),
        500: D('Giảm thêm 3% Chân Nguyên.', { spiritCostReductionPct: 3 }),
        750: D('Kết dẫn gọn hơn: giảm 5% Thu Chiêu.', { recoveryReductionPct: 5 }),
        1000: D('Cực Ý: +6% hiệu quả và +10% sinh tài nguyên nếu chiêu có cơ chế tích.', { effectBonusPct: 6, daoGeneratePct: 10 }),
    },
    control: {
        100: D('Nhiễu thức sâu hơn: +5% hiệu quả Nhiễu.', { controlEffectPct: 5 }),
        250: D('Nhiễu tăng thêm 5% và +3% hiệu quả chính.', { controlEffectPct: 5, effectBonusPct: 3 }),
        500: D('Giảm thêm 3% Chân Nguyên.', { spiritCostReductionPct: 3 }),
        750: D('Giảm thêm 3% Hồi Chiêu.', { cooldownReductionPct: 3 }),
        1000: D('Cực Ý: +10% hiệu quả Nhiễu; vẫn chịu cap Boss/CC hiện hành.', { controlEffectPct: 10 }),
    },
    burst: {
        100: D('Bộc phát ổn định hơn: +4% hiệu quả chính.', { effectBonusPct: 4 }),
        250: D('Uy lực phá nhịp tăng: +4% Phá Thế.', { breakBonusPct: 4 }),
        500: D('Giảm thêm 3% Chân Nguyên.', { spiritCostReductionPct: 3 }),
        750: D('Khởi chiêu nhanh hơn: giảm 4% Thi Triển.', { castTimeReductionPct: 4 }),
        1000: D('Cực Ý: +7% hiệu quả chính.', { effectBonusPct: 7 }),
    },
};
function clampTier(tier) { return Math.max(0, Math.min(1000, Math.floor(tier || 0))); }
export function battleDaoSkillGrowthRoleV126(skill) { return ROLE_BY_SKILL_ID[skill.id]; }
export function battleDaoSkillGrowthProfileV126(skill, rawTier) {
    const role = battleDaoSkillGrowthRoleV126(skill);
    if (!role)
        return undefined;
    const tier = clampTier(rawTier);
    const out = { role, roleName: ROLE_NAME[role], ...ZERO, milestones: [] };
    for (const at of [100, 250, 500, 750, 1000]) {
        const d = GROWTH[role][at];
        out.milestones.push({ at, name: STAGE_NAME[at], summary: d.summary });
        if (tier < at)
            continue;
        out.effectBonusPct += d.effectBonusPct;
        out.breakBonusPct += d.breakBonusPct;
        out.spiritCostReductionPct += d.spiritCostReductionPct;
        out.cooldownReductionPct += d.cooldownReductionPct;
        out.castTimeReductionPct += d.castTimeReductionPct;
        out.recoveryReductionPct += d.recoveryReductionPct;
        out.daoGeneratePct += d.daoGeneratePct;
        out.daoRefundPct += d.daoRefundPct;
        out.controlEffectPct += d.controlEffectPct;
    }
    return out;
}
export function battleDaoSkillGrowthMilestonesV126(skill) { return battleDaoSkillGrowthProfileV126(skill, 0)?.milestones ?? []; }
export function battleDaoSkillGrowthCurrentSummaryV126(skill, tier) {
    const g = battleDaoSkillGrowthProfileV126(skill, tier);
    if (!g)
        return '';
    const parts = [];
    if (g.effectBonusPct)
        parts.push(`hiệu quả riêng +${g.effectBonusPct}%`);
    if (g.breakBonusPct)
        parts.push(`Phá Thế +${g.breakBonusPct}%`);
    if (g.daoGeneratePct)
        parts.push(`tích tài nguyên +${g.daoGeneratePct}%`);
    if (g.daoRefundPct)
        parts.push(`hoàn tài nguyên ${g.daoRefundPct}%`);
    if (g.controlEffectPct)
        parts.push(`Nhiễu +${g.controlEffectPct}%`);
    if (g.spiritCostReductionPct)
        parts.push(`CN -${g.spiritCostReductionPct}%`);
    if (g.cooldownReductionPct)
        parts.push(`CD -${g.cooldownReductionPct}%`);
    if (g.castTimeReductionPct)
        parts.push(`Thi Triển -${g.castTimeReductionPct}%`);
    if (g.recoveryReductionPct)
        parts.push(`Thu Chiêu -${g.recoveryReductionPct}%`);
    return parts.length ? `${g.roleName}: ${parts.join(' · ')}` : `${g.roleName}: chưa mở đại mốc riêng`;
}
export const BATTLE_DAO_SKILL_GROWTH_COUNT_V126 = Object.keys(ROLE_BY_SKILL_ID).length;
//# sourceMappingURL=battle-dao-skill-growth-v126.js.map