export const mindCoreV2 = { dao: 'mind', name: "Niệm Ảnh", mainOnly: true, summary: "Chủ Thần Niệm lưu snapshot whitelist của Active Thần Niệm hợp lệ. Sau mỗi 3 Active hợp lệ, phát một Niệm Ảnh sau 0,6s với 35% payload damage/heal/shield/break/effect được whitelist. Không charge CN, không sinh Nộ/Ultimate, không summon/channel và không tự echo tiếp." };
export const mindPassiveStackV2 = { dao: 'mind', id: 'mindPassiveStack', name: "Niệm Lực", cap: 20, durationSeconds: 12, decayEverySeconds: 1, carryAcrossHuntKill: true, summary: 'Passive 1 mở stack này; giết quái không reset, nhận stack mới refresh duration, hết duration mới decay dần.' };
export const mindPassivesV2 = [
    { id: 'passive.v2.mind.p1', dao: 'mind', name: "Niệm Lực Quyết", realm: 'mundane', summary: "Mở Niệm Lực: mỗi Active root action thành công nhận +1 tầng; Ultimate +2.", lv1: "Mỗi tầng +0,5% Skill damage và +0,25% Hội Tâm; 10 tầng +5% Crit/Heart damage; 20 tầng +8% Xuyên.", lv20: "Mỗi tầng +1,5% Skill damage và +0,5% Hội Tâm; 10 tầng +12% Crit/Heart damage; 20 tầng +15% Xuyên." },
    { id: 'passive.v2.mind.p2', dao: 'mind', name: "Dưỡng Niệm Chân Kinh", realm: 'spirit', summary: "Active root action có xác suất nhận thêm +1 Niệm Lực.", lv1: "10% xác suất.", lv20: "30% xác suất." },
    { id: 'passive.v2.mind.p3', dao: 'mind', name: "Niệm Lực Trường Tồn", realm: 'mystic', summary: "Niệm Lực tồn tại lâu hơn và rơi chậm hơn.", lv1: "+2 giây duration.", lv20: "+8 giây duration; decay 1 tầng / 2 giây." },
    { id: 'passive.v2.mind.p4', dao: 'mind', name: "Minh Tâm Chân Ý", realm: 'earth', summary: "Mỗi Niệm Lực tăng thêm Crit/Heart damage.", lv1: "+0,15%/tầng.", lv20: "+0,50%/tầng." },
    { id: 'passive.v2.mind.p5', dao: 'mind', name: "Vạn Niệm Vô Cực", realm: 'heaven', summary: "Tăng giới hạn Niệm Lực.", lv1: "+2 cap.", lv20: "+10 cap." },
    { id: 'passive.v2.mind.p6', dao: 'mind', name: "Thần Niệm Lăng Thiên", realm: 'immortal', summary: "Cứ mỗi 10 Niệm Lực tăng Skill damage.", lv1: "+4% / 10 tầng.", lv20: "+12% / 10 tầng." },
    { id: 'passive.v2.mind.p7', dao: 'mind', name: "Nhất Niệm Phá Vọng", realm: 'extreme', summary: "Khi Niệm Lực ≥20 tăng Xuyên Phòng.", lv1: "+5% Xuyên.", lv20: "+18% Xuyên." },
    { id: 'passive.v2.mind.p8', dao: 'mind', name: "Niệm Lực Bất Diệt", realm: 'breaker', summary: "Khi Niệm Lực đạt cap nhận bonus lớn và Active duy trì trạng thái đỉnh.", lv1: "+10% Skill damage; refresh 1 giây.", lv20: "+30% Skill damage; +20% Nộ gain; refresh 2 giây." },
];
export const mindSkillMasteryV2 = [
    { dao: 'mind', skillId: 'skill.dao.mind.basic', milestones: { 100: "15% xác suất thêm Niệm Châm 50%.", 250: "Niệm Châm bồi không tính Active nhưng +1 Nộ.", 500: "Sau một Niệm Ảnh vừa phát, Basic kế +20% damage.", 750: "Recovery 0,95s.", 1000: "Cực Ý · Song Niệm Châm: mỗi Basic thứ 3 thành 2 hit 72% + 60%; hit sau +15% Xuyên." } },
    { dao: 'mind', skillId: 'skill.dao.mind.mark', milestones: { 100: "Damage +15%.", 250: "Snapshot whitelist coefficient của skill này +10%.", 500: "Niệm Ảnh replay skill này thêm 1 hit 40%.", 750: "Recovery 0,55s.", 1000: "Lạc Niệm Song Ấn: 2 hit 70% + 70%; cả root action chỉ tạo một snapshot." } },
    { dao: 'mind', skillId: 'skill.dao.mind.split', milestones: { 100: "Damage +15%.", 250: "Ở procDepth 0, hit thứ hai +20% damage.", 500: "Niệm Ảnh của skill này coefficient 45% thay vì 35%.", 750: "Recovery 0,60s.", 1000: "Phân Thần Tam Niệm: 3 hit 115% + 55% + 55%; snapshot vẫn whitelist một action." } },
    { dao: 'mind', skillId: 'skill.dao.mind.interfere', milestones: { 100: "Nhiễu +15%.", 250: "Tiêu hiệu ứng/ấn ít hơn 1 ở mức tối thiểu.", 500: "Mục tiêu đang Nhiễu nhận +12% direct damage.", 750: "Recovery 0,60s.", 1000: "Nhiễu Thần Phong Thức: duration +50%, Break +25%, boss vẫn chịu cap canonical." } },
    { dao: 'mind', skillId: 'skill.dao.mind.guard', milestones: { 100: "Khiên +20%.", 250: "Khiên vỡ nhận +1 Niệm Lực.", 500: "Sau khiên, Active kế +10% damage.", 750: "Recovery 0,60s.", 1000: "Tâm Kính Chân Giới: khiên +45%; trong 3s đầu Niệm Ảnh coefficient +10 điểm %." } },
    { dao: 'mind', skillId: 'skill.dao.mind.chase', milestones: { 100: "Cast 0,65s.", 250: "Skill này luôn được chọn làm snapshot nếu là Active hợp lệ gần nhất.", 500: "Niệm Ảnh của skill này +20% Break.", 750: "Recovery 0,55s.", 1000: "Truy Hồn Định Ấn: 2 hit 120% + 80%; echo coefficient 50%." } },
    { dao: 'mind', skillId: 'skill.dao.mind.burst', milestones: { 100: "Mỗi hiệu ứng/ấn tiêu +8% coefficient.", 250: "Mục tiêu Thất Thế: +20% damage.", 500: "Niệm Ảnh không được echo Consume; chỉ snapshot damage packet đã sanitize.", 750: "Recovery 0,65s.", 1000: "Bạo Ấn Phá Thức · Cực: damage ×1,4, Break ×1,3, snapshot chỉ giữ 40% damage packet." } },
    { dao: 'mind', skillId: 'skill.dao.mind.observe', milestones: { 100: "Channel 2,2s.", 250: "Hoàn tất +2 Niệm Lực.", 500: "Hoàn tất làm Niệm Ảnh kế coefficient +10 điểm %.", 750: "Recovery 0,70s.", 1000: "Tịch Niệm Viên Mãn: 6 hit; hoàn tất lập tức kích 1 Niệm Ảnh nếu có snapshot, vẫn không recurse." } },
    { dao: 'mind', skillId: 'skill.dao.mind.flow', milestones: { 100: "Duration state +20%.", 250: "Trong state, Active gain Niệm Lực +1 mỗi 3 cast.", 500: "Niệm Ảnh trong state coefficient +10 điểm %.", 750: "Cast 0,60s.", 1000: "Vạn Niệm Phân Lưu 6s: mỗi Active thứ 2 tạo echo 25%; echo này vẫn sandbox và dùng chung echo cooldown." } },
    { dao: 'mind', skillId: 'skill.dao.mind.ultimate', milestones: { 100: "Base coefficient +15%.", 250: "Nếu có snapshot, sau Ultimate phát echo 50% snapshot.", 500: "Ultimate không bị echo và không tạo snapshot mới.", 750: "Recovery 1,15s.", 1000: "Tịch Chiếu Niệm Vực 5s: Niệm Ảnh coefficient +20 điểm %, echo cooldown -25%, procDepth vẫn khóa recursion." } },
];
export const mindTreeV2 = [
    { realm: 'mundane', activeSkillId: 'skill.dao.mind.mark', passiveId: 'passive.v2.mind.p1' },
    { realm: 'spirit', activeSkillId: 'skill.dao.mind.split', passiveId: 'passive.v2.mind.p2' },
    { realm: 'mystic', activeSkillId: 'skill.dao.mind.interfere', passiveId: 'passive.v2.mind.p3' },
    { realm: 'earth', activeSkillId: 'skill.dao.mind.guard', passiveId: 'passive.v2.mind.p4' },
    { realm: 'heaven', activeSkillId: 'skill.dao.mind.chase', passiveId: 'passive.v2.mind.p5' },
    { realm: 'immortal', activeSkillId: 'skill.dao.mind.burst', passiveId: 'passive.v2.mind.p6' },
    { realm: 'extreme', activeSkillId: 'skill.dao.mind.observe', passiveId: 'passive.v2.mind.p7' },
    { realm: 'breaker', activeSkillId: 'skill.dao.mind.flow', passiveId: 'passive.v2.mind.p8' },
];
export const mindDaoV2 = { dao: 'mind', name: "Thần Niệm Đạo", core: mindCoreV2, passiveStack: mindPassiveStackV2, passives: mindPassivesV2, mastery: mindSkillMasteryV2, tree: mindTreeV2 };
//# sourceMappingURL=mind-dao-v2.js.map