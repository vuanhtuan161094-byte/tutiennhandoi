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
export function battleDaoSkillGrowthRoleV126(skill) { return skill.id.startsWith('skill.dao.spell.') ? SPELL_ROLES_V1[skill.id.slice('skill.dao.spell.'.length)] : ROLE_BY_SKILL_ID[skill.id]; }
export function battleDaoSkillGrowthProfileV126(skill, rawTier) {
    if (skill.id.startsWith('skill.dao.formation.')) return formationSkillGrowthProfileV1(skill, rawTier);
    if (skill.id.startsWith('skill.dao.poison.')) return poisonSkillGrowthProfileV1(skill, rawTier);
    if (skill.id.startsWith('skill.dao.spell.'))
        return spellSkillGrowthProfileV1(skill, rawTier);
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
// Spell milestones are executable, skill-local deltas. They never synthesize wheel forms,
// completion, follow-ups, or refunds of the one-shot Diễn Pháp flag.
const SPELL_ROLES_V1 = { basic: 'generator', light: 'burst', channel: 'channel', restore: 'defense', shield: 'defense', seal: 'generator', burst: 'burst', break: 'breaker', transform: 'defense', ultimate: 'channel' };
export function spellSkillGrowthProfileV1(skill, rawTier) {
    const suffix = skill.id.replace('skill.dao.spell.', '');
    const role = SPELL_ROLES_V1[suffix];
    if (!role) return undefined;
    const steps = GROWTH[role];
    const tier = clampTier(rawTier);
    const out = { role, roleName: ROLE_NAME[role], ...ZERO, milestones: [] };
    for (const at of [100, 250, 500, 750, 1000]) {
        let d = steps[at];
        if (at === 500 && ['basic', 'restore', 'transform', 'ultimate'].includes(suffix)) d = D('Chiêu không tiêu Chân Nguyên: hiệu quả riêng tăng thêm 3%.', { effectBonusPct: 3 });
        if (suffix === 'light' && at === 1000) d = D('Linh Quang Cực Ý: +7% hiệu quả riêng; đúng chuỗi giảm 35% cast/recovery Thi Triển/Dẫn Pháp; full completion rút tối đa 1,5s CD Bạo Pháp.', { effectBonusPct: 7 });
        if (d.daoGeneratePct) d = D('Hiệu quả riêng của chiêu +3%; vẫn cần hoàn thành đúng form.', { effectBonusPct: 3, ...(at === 1000 ? { recoveryReductionPct: 2 } : {}) });
        out.milestones.push({ at, name: STAGE_NAME[at], summary: d.summary });
        if (tier >= at) for (const key of Object.keys(ZERO)) out[key] += d[key];
    }
    return out;
}
export function formationSkillGrowthProfileV1(skill, rawTier) {
 const k=skill.id.split('.').at(-1),role=k==='basic'?'generator':ROLE_BY_SKILL_ID[skill.id];
 if(!role)return undefined;
 const out={role,roleName:ROLE_NAME[role],...ZERO,milestones:[]};
 const generator=['basic','nourish','seal'].includes(k),repair=['fortify','convert'].includes(k);
 const steps={
  100:D(repair?'Hiệu suất hồi Bền +20%.':generator?'Dưỡng package +5%.':k==='break'?'CN thu hồi +20%.':'Hiệu quả riêng +5%.',repair||generator||k==='break'?{}:{effectBonusPct:5}),
  250:D(generator?'Dưỡng package +10%, cap60 mỗi root.':'Chân Nguyên chiêu -3%.',generator?{}:{spiritCostReductionPct:3}),
  500:D('Thu Chiêu chiêu -5%.',{recoveryReductionPct:5}),
  750:D('Hồi Chiêu chiêu -5%.',{cooldownReductionPct:5}),
  1000:D(generator?'Cực Ý: Dưỡng package thêm10%, không floor.':repair?'Cực Ý: hiệu suất hồi Bền thêm20%.':'Cực Ý: hiệu quả riêng thêm10%, không bypass setup.',generator||repair?{}:{effectBonusPct:10})
 };
 if(k==='deploy'){steps[100]=D('Thi Triển -10%.',{castTimeReductionPct:10});steps[1000]=D('Cực Ý: Thi Triển thêm -15%; vẫn0 Dưỡng/100 Bền.',{castTimeReductionPct:15});}
 if(['basic','ultimate','break'].includes(k))steps[750]=D('Thu Chiêu thêm -5%.',{recoveryReductionPct:5});
 if(k==='ultimate')steps[250]=D('Uy lực riêng thêm5%, vẫn đọc Dưỡng thật.',{effectBonusPct:5});
 if(k==='break'){steps[250]=D('Thi Triển -10%.',{castTimeReductionPct:10});steps[1000]=D('CN thu hồi thêm10% từ giá trị thật.',{});}
 for(const at of [100,250,500,750,1000]){const d=steps[at];out.milestones.push({at,name:STAGE_NAME[at],summary:d.summary});if(clampTier(rawTier)>=at)for(const key of Object.keys(ZERO))out[key]+=d[key];}
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

export function poisonSkillGrowthProfileV1(skill, rawTier) {
 const suffix=skill.id.split('.').at(-1),role=suffix==='basic'?'generator':ROLE_BY_SKILL_ID[skill.id];
 if(!role)return undefined;
 const out={role,roleName:ROLE_NAME[role],...ZERO,milestones:[]};
 for(const at of [100,250,500,750,1000]){
  let d=GROWTH[role][at];
  if(d.daoGeneratePct||d.daoRefundPct)d=D('Hiệu quả riêng +4%; không tự tạo Công Tâm hoặc hoàn stage.',{effectBonusPct:4});
  if(at===500 && ['basic','ultimate'].includes(suffix))d=D('Chiêu zero CN: +3% hiệu quả riêng.',{effectBonusPct:3});
  if(at===1000 && suffix==='basic')d=D('Song Độc Chỉ: mỗi ba Basic landed roots đặt thêm một packet DoT ba tick hữu hạn.',{effectBonusPct:4});
  if(at===1000 && ['bone','heart','mist','calamity','insects'].includes(suffix))d=D('Cực Ý: thêm một tick hữu hạn vào packet DoT; không sinh stage hay proc.',{effectBonusPct:6});
  if(at===1000 && suffix==='insects')d=D('Vạn Trùng Cực Ý: full completion đặt thêm một packet độc tám tick hữu hạn; không stage/proc và không thưởng khi bị ngắt.',{effectBonusPct:6});
  if(at===1000 && suffix==='mist')d=D('Độc Vụ Phong Giới: thêm hai tick hữu hạn vào field packet; không generic damage/giảm Phòng.',{effectBonusPct:6});
  out.milestones.push({at,name:STAGE_NAME[at],summary:d.summary});
  if(rawTier>=at)for(const k of Object.keys(ZERO))out[k]+=d[k];
 }
 return out;
}
