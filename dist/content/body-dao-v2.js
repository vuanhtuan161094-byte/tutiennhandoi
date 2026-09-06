export const bodyCoreV2 = { dao: 'body', name: "Chân Thân · Phản Thế", mainOnly: true, summary: "Chủ Thể tích Phản Thế 0–100 từ sát thương thực sự được giảm/đỡ. Mỗi 20 Phản Thế +3% damage Skill Thể và +2% giảm thương. 100 Phản Thế mở Chân Thân Viên Mãn; Active Thể kế tiếp có thể tiêu 40 để +40% hiệu quả." };
export const bodyPassiveStackV2 = { dao: 'body', id: 'bodyPassiveStack', name: "Huyết Khí", cap: 20, durationSeconds: 12, decayEverySeconds: 1, carryAcrossHuntKill: true, summary: 'Passive 1 mở stack này; giết quái không reset, nhận stack mới refresh duration, hết duration mới decay dần.' };
export const bodyPassivesV2 = [
    { id: 'passive.v2.body.p1', dao: 'body', name: "Huyết Khí Quyết", realm: 'mundane', summary: "Mở Huyết Khí: mỗi incoming root action làm mất HP nhận +1 tầng.", lv1: "Mỗi tầng +0,4% hiệu quả Hồi/Khiên; 10 tầng +5% Phòng; 20 tầng +5% giảm thương.", lv20: "Mỗi tầng +1% hiệu quả Hồi/Khiên; 10 tầng +10% Phòng; 20 tầng +12% giảm thương." },
    { id: 'passive.v2.body.p2', dao: 'body', name: "Dưỡng Huyết Chân Kinh", realm: 'spirit', summary: "Incoming root action có xác suất nhận thêm +1 Huyết Khí.", lv1: "10% xác suất.", lv20: "30% xác suất." },
    { id: 'passive.v2.body.p3', dao: 'body', name: "Huyết Khí Trường Tồn", realm: 'mystic', summary: "Huyết Khí tồn tại lâu hơn và rơi chậm hơn.", lv1: "+2 giây duration.", lv20: "+8 giây duration; decay 1 tầng / 2 giây." },
    { id: 'passive.v2.body.p4', dao: 'body', name: "Thiết Cốt Chân Ý", realm: 'earth', summary: "Mỗi Huyết Khí tăng thêm Phòng Ngự.", lv1: "+0,15% Phòng/tầng.", lv20: "+0,50% Phòng/tầng." },
    { id: 'passive.v2.body.p5', dao: 'body', name: "Huyết Hải Vô Cực", realm: 'heaven', summary: "Tăng giới hạn Huyết Khí.", lv1: "+2 cap.", lv20: "+10 cap." },
    { id: 'passive.v2.body.p6', dao: 'body', name: "Khí Huyết Quy Nguyên", realm: 'immortal', summary: "Cứ mỗi 10 Huyết Khí tăng hiệu quả Hồi/Khiên.", lv1: "+4% / 10 tầng.", lv20: "+12% / 10 tầng." },
    { id: 'passive.v2.body.p7', dao: 'body', name: "Bất Khuất Chân Thể", realm: 'extreme', summary: "Khi Huyết Khí ≥20 tăng giảm thương.", lv1: "+5% giảm thương.", lv20: "+15% giảm thương." },
    { id: 'passive.v2.body.p8', dao: 'body', name: "Huyết Khí Bất Diệt", realm: 'breaker', summary: "Khi Huyết Khí đạt cap nhận bonus lớn và chịu/gây damage duy trì trạng thái đỉnh.", lv1: "+10% damage; refresh 1 giây.", lv20: "+25% damage; +20% Nộ gain; refresh 2 giây." },
];
export const bodySkillMasteryV2 = [
    { dao: 'body', skillId: 'skill.dao.body.basic', milestones: { 100: "15% xác suất thêm Chấn Kình 50%.", 250: "Chấn Kình sinh +8 Phản Thế.", 500: "Ở ≥80 Phản Thế, mỗi Basic thứ 3 +25% damage và Break.", 750: "Basic trúng giảm 0,10s Recovery Basic kế.", 1000: "Cực Ý · Thiết Sơn Kháo: mỗi Basic thứ 3 thành 2 hit 105% + 85%, hit sau +20% Break." } },
    { dao: 'body', skillId: 'skill.dao.body.guard', milestones: { 100: "Khiên +15%.", 250: "Khiên hấp thụ đủ 10% max HP sinh +15 Phản Thế.", 500: "Ở ≥60 Phản Thế, shield +20% nữa.", 750: "Recovery 0,55s.", 1000: "Kim Cang Bất Hoại: khiên +35%, hết khiên còn 20% lượng dư thành hộ thể 2s." } },
    { dao: 'body', skillId: 'skill.dao.body.transform', milestones: { 100: "Counter damage +20%.", 250: "Counter thành công +25 Phản Thế.", 500: "Counter thành công giảm 15% damage nhận 3s.", 750: "Recovery 0,50s.", 1000: "Hóa Kình Quy Nguyên: counter thành công hồi 6% max HP và đưa Phản Thế tối thiểu lên 60." } },
    { dao: 'body', skillId: 'skill.dao.body.immovable', milestones: { 100: "Channel duration 2,2s.", 250: "Trong channel, Phản Thế gain +30%.", 500: "Hoàn tất channel tạo khiên 12% max HP.", 750: "Recovery 0,75s.", 1000: "Bất Động Chân Thân: channel 2,0s; trong thời gian này giảm thương thêm 25%." } },
    { dao: 'body', skillId: 'skill.dao.body.counter', milestones: { 100: "Tiêu Phản Thế: damage +20%.", 250: "Tiêu ≥30: +20% Break.", 500: "Ở ≥80 trước khi tiêu, thêm hit phản chấn 70%.", 750: "Recovery 0,65s.", 1000: "Chấn Cốt Phản Thiên: tiêu 50; 2 hit 190% + 120%, hit sau +35% Break." } },
    { dao: 'body', skillId: 'skill.dao.body.elephant', milestones: { 100: "Damage +15%.", 250: "≥40 Phản Thế: +15% damage.", 500: "≥80 Phản Thế: thêm shockwave 65%.", 750: "Cast 0,90s.", 1000: "Long Tượng Trấn Thiên: ở 100 Phản Thế tiêu 40, damage ×1,45 và shockwave 100%." } },
    { dao: 'body', skillId: 'skill.dao.body.break', milestones: { 100: "Break +20%.", 250: "Tiêu đủ 20 Phản Thế: +20% damage.", 500: "Mục tiêu Thất Thế: không tiêu Phản Thế.", 750: "Cast 0,70s.", 1000: "Cương Thân Phá Giới: tiêu 40 nếu có; Break ×1,5 và +20% Xuyên riêng skill." } },
    { dao: 'body', skillId: 'skill.dao.body.recover', milestones: { 100: "Hồi HP +20%.", 250: "Tiêu ≥40 Phản Thế: khiên +25%.", 500: "Hồi vượt max HP chuyển 50% phần dư thành khiên.", 750: "Recovery 0,70s.", 1000: "Quy Nguyên Viên Mãn: tiêu tối đa 60; mỗi 20 tăng thêm 3% max HP hồi." } },
    { dao: 'body', skillId: 'skill.dao.body.finisher', milestones: { 100: "Mỗi 20 Phản Thế tiêu +6% coefficient.", 250: "Mục tiêu Thất Thế: +20% damage.", 500: "Tiêu ≥60: +15% Break.", 750: "Recovery 0,85s.", 1000: "Băng Sơn Chấn Thể: tiêu tối đa 100; damage ×1,45, Break ×1,35, còn lại 20 Phản Thế." } },
    { dao: 'body', skillId: 'skill.dao.body.ultimate', milestones: { 100: "Khiên +20%.", 250: "Kích hoạt đưa Phản Thế tối thiểu lên 60.", 500: "Trong 5s, Phản Thế gain +50%.", 750: "Recovery 1,15s.", 1000: "Vạn Kiếp Chân Thân 5s: giảm thương +25%, Skill Thể không tiêu Phản Thế trong 3s đầu." } },
];
export const bodyTreeV2 = [
    { realm: 'mundane', activeSkillId: 'skill.dao.body.guard', passiveId: 'passive.v2.body.p1' },
    { realm: 'spirit', activeSkillId: 'skill.dao.body.transform', passiveId: 'passive.v2.body.p2' },
    { realm: 'mystic', activeSkillId: 'skill.dao.body.immovable', passiveId: 'passive.v2.body.p3' },
    { realm: 'earth', activeSkillId: 'skill.dao.body.counter', passiveId: 'passive.v2.body.p4' },
    { realm: 'heaven', activeSkillId: 'skill.dao.body.elephant', passiveId: 'passive.v2.body.p5' },
    { realm: 'immortal', activeSkillId: 'skill.dao.body.break', passiveId: 'passive.v2.body.p6' },
    { realm: 'extreme', activeSkillId: 'skill.dao.body.recover', passiveId: 'passive.v2.body.p7' },
    { realm: 'breaker', activeSkillId: 'skill.dao.body.finisher', passiveId: 'passive.v2.body.p8' },
];
export const bodyDaoV2 = { dao: 'body', name: "Thể Đạo", core: bodyCoreV2, passiveStack: bodyPassiveStackV2, passives: bodyPassivesV2, mastery: bodySkillMasteryV2, tree: bodyTreeV2 };
//# sourceMappingURL=body-dao-v2.js.map