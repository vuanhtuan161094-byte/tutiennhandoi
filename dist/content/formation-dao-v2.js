export const formationCoreV2 = { dao: 'formation', name: "Chủ Trận", mainOnly: true, summary: "Chủ Trận có Dưỡng Độ 0–100 và Độ Bền 0–100. Mỗi 20 Dưỡng Độ +5% damage/+5% Phá Thế Skill Trận. Kích Trận tiêu Dưỡng Độ; tại 100 Dưỡng = Đại Thành, Kích Trận kế +50% hiệu quả và tiêu thêm 25 Độ Bền." };
export const formationPassiveStackV2 = { dao: 'formation', id: 'formationPassiveStack', name: "Trận Văn", cap: 20, durationSeconds: 12, decayEverySeconds: 1, carryAcrossHuntKill: true, summary: 'Passive 1 mở stack này; giết quái không reset, nhận stack mới refresh duration, hết duration mới decay dần.' };
export const formationPassivesV2 = [
    { id: 'passive.v2.formation.p1', dao: 'formation', name: "Trận Văn Quyết", realm: 'mundane', summary: "Mở Trận Văn: dùng root skill khác skill ngay trước đó nhận +1 tầng.", lv1: "Mỗi tầng +0,4% Phòng và +0,4% Phá Thế; 10 tầng +5% damage; 20 tầng +8% CDR.", lv20: "Mỗi tầng +1% Phòng và +1% Phá Thế; 10 tầng +10% damage; 20 tầng +15% CDR." },
    { id: 'passive.v2.formation.p2', dao: 'formation', name: "Dưỡng Trận Chân Kinh", realm: 'spirit', summary: "Root skill khác skill trước có xác suất nhận thêm +1 Trận Văn.", lv1: "10% xác suất.", lv20: "30% xác suất." },
    { id: 'passive.v2.formation.p3', dao: 'formation', name: "Trận Văn Trường Tồn", realm: 'mystic', summary: "Trận Văn tồn tại lâu hơn và rơi chậm hơn.", lv1: "+2 giây duration.", lv20: "+8 giây duration; decay 1 tầng / 2 giây." },
    { id: 'passive.v2.formation.p4', dao: 'formation', name: "Hộ Nhãn Chân Giải", realm: 'earth', summary: "Mỗi Trận Văn tăng thêm hiệu quả Khiên/Hồi.", lv1: "+0,15%/tầng.", lv20: "+0,50%/tầng." },
    { id: 'passive.v2.formation.p5', dao: 'formation', name: "Chu Thiên Vô Cực", realm: 'heaven', summary: "Tăng giới hạn Trận Văn.", lv1: "+2 cap.", lv20: "+10 cap." },
    { id: 'passive.v2.formation.p6', dao: 'formation', name: "Kích Trận Chân Ý", realm: 'immortal', summary: "Cứ mỗi 10 Trận Văn tăng damage trực tiếp.", lv1: "+4% / 10 tầng.", lv20: "+12% / 10 tầng." },
    { id: 'passive.v2.formation.p7', dao: 'formation', name: "Trận Thế Lăng Thiên", realm: 'extreme', summary: "Khi Trận Văn ≥20 tăng Phá Thế và giảm thương.", lv1: "+8% Break; +4% giảm thương.", lv20: "+25% Break; +12% giảm thương." },
    { id: 'passive.v2.formation.p8', dao: 'formation', name: "Trận Văn Bất Diệt", realm: 'breaker', summary: "Khi Trận Văn đạt cap nhận bonus lớn và đổi skill duy trì trạng thái đỉnh.", lv1: "+10% damage; refresh 1 giây.", lv20: "+30% damage; +20% Nộ gain; refresh 2 giây." },
];
export const formationSkillMasteryV2 = [
    { dao: 'formation', skillId: 'skill.dao.formation.basic', milestones: { 100: "Dưỡng Độ gain +20%.", 250: "Mỗi Basic thứ 3 hồi 3 Độ Bền.", 500: "Ở ≥60 Dưỡng Độ, Basic +20% damage.", 750: "Recovery 0,95s.", 1000: "Cực Ý · Tam Văn Điểm Trận: mỗi Basic thứ 3 khắc 3 văn, +15 Dưỡng Độ và hit phụ 70%." } },
    { dao: 'formation', skillId: 'skill.dao.formation.deploy', milestones: { 100: "Cast 0,80s.", 250: "Dựng trận bắt đầu với 20 Dưỡng Độ.", 500: "Dựng trận tạo khiên 8% max HP.", 750: "Cast 0,60s.", 1000: "Bố Trận Đại Thành: dựng mới bắt đầu 40 Dưỡng/100 Độ Bền; CD +15%." } },
    { dao: 'formation', skillId: 'skill.dao.formation.nourish', milestones: { 100: "Channel 1,8s.", 250: "Hoàn tất +40 Dưỡng thay vì 30.", 500: "Ở ≥60 Dưỡng, channel đồng thời hồi 10 Độ Bền.", 750: "Recovery 0,70s.", 1000: "Tụ Linh Đại Dưỡng: nếu Dưỡng <30, hoàn tất đưa thẳng lên 70." } },
    { dao: 'formation', skillId: 'skill.dao.formation.fortify', milestones: { 100: "Hồi Độ Bền +20%.", 250: "Độ Bền dưới 40: hồi thêm +15.", 500: "Hồi vượt 100 chuyển 50% phần dư thành Dưỡng Độ.", 750: "Recovery 0,55s.", 1000: "Hộ Nhãn Bất Phá: +40 Độ Bền và khiên 12% max HP." } },
    { dao: 'formation', skillId: 'skill.dao.formation.small_activate', milestones: { 100: "Damage +15%.", 250: "Chi phí Dưỡng 25→20.", 500: "Ở ≥80 Dưỡng, +20% Break.", 750: "Recovery 0,55s.", 1000: "Tiểu Kích Liên Hoàn: không tiêu quá 20 Dưỡng; thêm hit phụ 90%." } },
    { dao: 'formation', skillId: 'skill.dao.formation.full_activate', milestones: { 100: "Break +20%.", 250: "Dưỡng ≥90: +20% damage.", 500: "Đại Thành 100: bonus core +50→70%.", 750: "Cast 0,75s.", 1000: "Toàn Kích Chu Thiên: 2 hit 520% + 180%; tiêu tối đa 80 Dưỡng và 20 Độ Bền." } },
    { dao: 'formation', skillId: 'skill.dao.formation.seal', milestones: { 100: "Dưỡng gain +20%.", 250: "Sau cast giảm 10% damage nhận 3s.", 500: "Ở Dưỡng <50, gain thêm +15.", 750: "Recovery 0,60s.", 1000: "Phong Trận Tụ Thế: lập tức đưa Dưỡng tối thiểu lên 60 và khóa decay 4s." } },
    { dao: 'formation', skillId: 'skill.dao.formation.convert', milestones: { 100: "Tỷ lệ chuyển Dưỡng→Độ Bền +20%.", 250: "Tiêu 20 Dưỡng hồi 20 Độ Bền.", 500: "Độ Bền <30: hiệu suất +50%.", 750: "Recovery 0,60s.", 1000: "Chuyển Nhãn Hoàn Chân: có thể tiêu 30 Dưỡng để hồi 45 Độ Bền." } },
    { dao: 'formation', skillId: 'skill.dao.formation.break', milestones: { 100: "Hồi Chân Nguyên +20%.", 250: "Phá trận giữ lại 20 Trận Văn passive stack.", 500: "Độ Bền còn >50: hồi thêm 10% CN chuẩn.", 750: "Recovery 0,65s.", 1000: "Phá Trận Quy Nguyên: phá Chủ Trận hồi 25% CN chuẩn và lần Deploy kế CD -50%." } },
    { dao: 'formation', skillId: 'skill.dao.formation.ultimate', milestones: { 100: "Base effect +15%.", 250: "Dưỡng hiện có chuyển thành coefficient +0,3%/điểm.", 500: "Đại Thành thêm finishing hit 180%.", 750: "Recovery 1,30s.", 1000: "Chu Thiên Tinh Đấu Vực 6s: Chủ Trận tự giữ Dưỡng ≥50 và Kích Trận không tiêu Độ Bền 3s đầu." } },
];
export const formationTreeV2 = [
    { realm: 'mundane', activeSkillId: 'skill.dao.formation.deploy', passiveId: 'passive.v2.formation.p1' },
    { realm: 'spirit', activeSkillId: 'skill.dao.formation.nourish', passiveId: 'passive.v2.formation.p2' },
    { realm: 'mystic', activeSkillId: 'skill.dao.formation.fortify', passiveId: 'passive.v2.formation.p3' },
    { realm: 'earth', activeSkillId: 'skill.dao.formation.small_activate', passiveId: 'passive.v2.formation.p4' },
    { realm: 'heaven', activeSkillId: 'skill.dao.formation.full_activate', passiveId: 'passive.v2.formation.p5' },
    { realm: 'immortal', activeSkillId: 'skill.dao.formation.seal', passiveId: 'passive.v2.formation.p6' },
    { realm: 'extreme', activeSkillId: 'skill.dao.formation.convert', passiveId: 'passive.v2.formation.p7' },
    { realm: 'breaker', activeSkillId: 'skill.dao.formation.break', passiveId: 'passive.v2.formation.p8' },
];
export const formationDaoV2 = { dao: 'formation', name: "Trận Đạo", core: formationCoreV2, passiveStack: formationPassiveStackV2, passives: formationPassivesV2, mastery: formationSkillMasteryV2, tree: formationTreeV2 };
//# sourceMappingURL=formation-dao-v2.js.map