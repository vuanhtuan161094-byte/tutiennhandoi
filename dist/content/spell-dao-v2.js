import { spellSkillGrowthProfileV1 } from '../core/battle-dao-skill-growth-v126.js';
export const spellCoreV2 = { dao: 'spell', name: 'Pháp Luân', mainOnly: true, summary: 'Hoàn thành đúng Tốc Pháp → Thi Triển → Dẫn Pháp để mở một Diễn Pháp. Basic hoặc Linh Quang là Tốc Pháp; sai form giữ tiến độ. Burst/Break snapshot payoff và chỉ tiêu sau resolve; ngắt không nhận completion.' };
export const spellPassiveStackV2 = { dao: 'spell', id: 'spellPassiveStack', name: "Pháp Ý", cap: 20, durationSeconds: 12, decayEverySeconds: 1, carryAcrossHuntKill: true, summary: 'Passive 1 mở stack này; giết quái không reset, nhận stack mới refresh duration, hết duration mới decay dần.' };
export const spellPassivesV2 = [
    { id: 'passive.v2.spell.p1', dao: 'spell', name: "Pháp Ý Quyết", realm: 'mundane', summary: "Mở Pháp Ý: root Main Pháp thực trả Chân Nguyên sinh một tầng.", lv1: "Mở stack Pháp Ý 0–20; không tăng sát thương chung.", lv20: "Mở stack Pháp Ý 0–20; không tăng sát thương chung." },
    { id: 'passive.v2.spell.p2', dao: 'spell', name: "Dẫn Pháp Chân Kinh", realm: 'spirit', summary: "Một lần mỗi root hợp lệ có cơ hội nhận thêm Pháp Ý.", lv1: "10% cơ hội thêm một tầng.", lv20: "30% cơ hội thêm một tầng." },
    { id: 'passive.v2.spell.p3', dao: 'spell', name: "Pháp Ý Trường Tồn", realm: 'mystic', summary: "Gia hạn hold và làm chậm decay Pháp Ý.", lv1: "+2 giây hold; decay 1 tầng/giây.", lv20: "+8 giây hold; decay 1 tầng/2 giây." },
    { id: 'passive.v2.spell.p4', dao: 'spell', name: "Tụ Linh Chân Giải", realm: 'earth', summary: "Giảm nhẹ CN skill-local theo Pháp Ý, không tác động sát thương.", lv1: "Tối đa 2% giảm CN cho Main Pháp; Secondary nhận CN utility có giới hạn.", lv20: "Tối đa 5% giảm CN cho Main Pháp; Secondary nhận CN utility có giới hạn." },
    { id: 'passive.v2.spell.p5', dao: 'spell', name: "Vạn Pháp Vô Cực", realm: 'heaven', summary: "Tăng trần Pháp Ý, không thêm hệ số sát thương.", lv1: "+2 trần Pháp Ý.", lv20: "+10 trần Pháp Ý." },
    { id: 'passive.v2.spell.p6', dao: 'spell', name: "Pháp Uy Lăng Thiên", realm: 'immortal', summary: "Tăng payoff Diễn Pháp trên root đủ điều kiện.", lv1: "+4% hiệu quả action-local khi dùng Diễn Pháp.", lv20: "+12% hiệu quả action-local khi dùng Diễn Pháp." },
    { id: 'passive.v2.spell.p7', dao: 'spell', name: "Hồi Nguyên Thông Huyền", realm: 'extreme', summary: "Ở ngưỡng Pháp Ý cao giảm CN cho kỹ năng Pháp.", lv1: "Tại trần nền 20 tầng: giảm thêm 4% CN Pháp.", lv20: "Tại 20 tầng trở lên: giảm thêm 10% CN Pháp." },
    { id: 'passive.v2.spell.p8', dao: 'spell', name: "Pháp Ý Bất Diệt", realm: 'breaker', summary: "Ở trần Pháp Ý củng cố Diễn Pháp và gia hạn hold sau full cycle/payoff thật.", lv1: "+10% payoff; hoàn vòng/resolve Diễn Pháp gia hạn hold 1 giây.", lv20: "+20% payoff; hoàn vòng/resolve Diễn Pháp gia hạn hold 2 giây; không sinh thêm Nộ." },
];
export const spellSkillMasteryV2 = ['basic','light','channel','restore','shield','seal','burst','break','transform','ultimate'].map(suffix => {
    const skillId = 'skill.dao.spell.' + suffix;
    const profile = spellSkillGrowthProfileV1({ id: skillId }, 0);
    return { dao: 'spell', skillId, milestones: Object.fromEntries(profile.milestones.map(row => [row.at, row.summary])) };
});
export const spellTreeV2 = [
    { realm: 'mundane', activeSkillId: 'skill.dao.spell.light', passiveId: 'passive.v2.spell.p1' },
    { realm: 'spirit', activeSkillId: 'skill.dao.spell.channel', passiveId: 'passive.v2.spell.p2' },
    { realm: 'mystic', activeSkillId: 'skill.dao.spell.restore', passiveId: 'passive.v2.spell.p3' },
    { realm: 'earth', activeSkillId: 'skill.dao.spell.shield', passiveId: 'passive.v2.spell.p4' },
    { realm: 'heaven', activeSkillId: 'skill.dao.spell.seal', passiveId: 'passive.v2.spell.p5' },
    { realm: 'immortal', activeSkillId: 'skill.dao.spell.burst', passiveId: 'passive.v2.spell.p6' },
    { realm: 'extreme', activeSkillId: 'skill.dao.spell.break', passiveId: 'passive.v2.spell.p7' },
    { realm: 'breaker', activeSkillId: 'skill.dao.spell.transform', passiveId: 'passive.v2.spell.p8' },
];
export const spellDaoV2 = { dao: 'spell', name: "Pháp Đạo", core: spellCoreV2, passiveStack: spellPassiveStackV2, passives: spellPassivesV2, mastery: spellSkillMasteryV2, tree: spellTreeV2 };
//# sourceMappingURL=spell-dao-v2.js.map
