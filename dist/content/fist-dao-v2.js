export const fistCoreV2 = { dao: 'fist', name: "Quyền Thế", mainOnly: true, summary: "Quyền Thế là nhịp tích lực 0–5. Mỗi tầng đang giữ +3% damage Skill Quyền và +4% Phá Thế. Đạt 5 mở Trọng Thế; chỉ Băng Sơn Trọng Quyền, Trấn Nhạc Áp Quyền, Phá Quân Quyết hoặc Cửu Thiên Trấn Ngục Quyền mới nhận +35% hiệu quả/+35% Phá Thế và tiêu Quyền Thế theo kỹ năng." };
export const fistPassiveStackV2 = { dao: 'fist', id: 'fistPassiveStack', name: "Liên Kình", cap: 20, durationSeconds: 12, decayEverySeconds: 1, carryAcrossHuntKill: true, summary: 'Passive 1 mở stack này; giết quái không reset, nhận stack mới refresh duration, hết duration mới decay dần.' };
export const fistPassivesV2 = [
    { id: 'passive.v2.fist.p1', dao: 'fist', name: "Liên Kình Quyết", realm: 'mundane', summary: "Mở Liên Kình: mỗi root damaging action nối tiếp nhận +1 tầng.", lv1: "10 tầng +5% Phá Thế; 20 tầng +8% damage trực tiếp.", lv20: "10 tầng +10% Phá Thế; 20 tầng +15% damage trực tiếp." },
    { id: 'passive.v2.fist.p2', dao: 'fist', name: "Dưỡng Kình Chân Kinh", realm: 'spirit', summary: "Mỗi root damaging action có xác suất nhận thêm +1 Liên Kình.", lv1: "10% xác suất.", lv20: "30% xác suất." },
    { id: 'passive.v2.fist.p3', dao: 'fist', name: "Liên Kình Trường Tồn", realm: 'mystic', summary: "Liên Kình tồn tại lâu hơn và rơi chậm hơn.", lv1: "+2 giây duration.", lv20: "+8 giây duration; decay 1 tầng / 2 giây." },
    { id: 'passive.v2.fist.p4', dao: 'fist', name: "Hùng Kình Hộ Thể", realm: 'earth', summary: "Mỗi Liên Kình tăng thêm Phòng Ngự.", lv1: "+0,15% Phòng/tầng.", lv20: "+0,50% Phòng/tầng." },
    { id: 'passive.v2.fist.p5', dao: 'fist', name: "Quyền Tâm Vô Cực", realm: 'heaven', summary: "Tăng giới hạn Liên Kình.", lv1: "+2 cap.", lv20: "+10 cap." },
    { id: 'passive.v2.fist.p6', dao: 'fist', name: "Áp Thế Chân Ý", realm: 'immortal', summary: "Cứ mỗi 10 Liên Kình tăng Phá Thế.", lv1: "+4% / 10 tầng.", lv20: "+12% / 10 tầng." },
    { id: 'passive.v2.fist.p7', dao: 'fist', name: "Trọng Kình Lăng Thiên", realm: 'extreme', summary: "Khi Liên Kình ≥20 tăng damage trực tiếp.", lv1: "+10% damage.", lv20: "+35% damage." },
    { id: 'passive.v2.fist.p8', dao: 'fist', name: "Liên Kình Bất Tuyệt", realm: 'breaker', summary: "Khi Liên Kình đạt cap nhận bonus lớn và gây damage duy trì trạng thái đỉnh.", lv1: "+10% damage; damaging root refresh 1 giây.", lv20: "+30% damage; +20% Thanh Tuyệt Kỹ gain; damaging root refresh 2 giây." },
];
export const fistSkillMasteryV2 = [
    { dao: 'fist', skillId: 'skill.dao.fist.basic', milestones: { 100: "20% xác suất ra quyền bồi 55%.", 250: "Quyền bồi sinh thêm +1 Quyền Thế.", 500: "Ở 5 Quyền Thế, mỗi Basic thứ 3 tạo shockwave 65%.", 750: "Hit Basic liên tiếp giảm 0,15s Recovery Basic kế tiếp.", 1000: "Cực Ý · Tam Điệp Kình: mỗi Basic thứ 3 thành 3 hit 100% + 65% + 65%." } },
    { dao: 'fist', skillId: 'skill.dao.fist.triple', milestones: { 100: "Hit thứ 3 +20% damage.", 250: "Có ≥3 Quyền Thế thêm hit 4 = 40%.", 500: "Hit 4 tăng 70% và có thể Hội Tâm.", 750: "Ở 5 Quyền Thế, CD lần cast còn 2,4s.", 1000: "Tam Hoàn Hóa Tứ Kình: 4 hit; hit cuối 110% và +25% Break." } },
    { dao: 'fist', skillId: 'skill.dao.fist.shock', milestones: { 100: "Break +20%.", 250: "Mục tiêu chưa Thất Thế: thêm +15% Break.", 500: "Nếu chiêu này phá mục tiêu: mục tiêu nhận +10% direct damage 4s.", 750: "Recovery 0,65s.", 1000: "Chấn Mạch Phá Sơn: ở 5 Quyền Thế tiêu 2; damage ×1,4 và Break ×1,4." } },
    { dao: 'fist', skillId: 'skill.dao.fist.nurture', milestones: { 100: "Cast 1,30s.", 250: "Cast hoàn chỉnh sinh +3 Quyền Thế.", 500: "Sau cast +18% damage Skill Quyền 4s.", 750: "Cast 1,05s.", 1000: "Dưỡng Thế Viên Mãn: nếu đang 0–1 Quyền Thế, hoàn tất cast đưa thẳng lên 5." } },
    { dao: 'fist', skillId: 'skill.dao.fist.heavy', milestones: { 100: "Damage +15%.", 250: "Tiêu đủ 2 Quyền Thế: +20% Break.", 500: "Ở 5 Quyền Thế có thể tiêu 3 để thêm hit 80%.", 750: "Cast 0,75s.", 1000: "Băng Sơn Song Trọng: 2 hit 265% + 130%; hit cuối +35% Break." } },
    { dao: 'fist', skillId: 'skill.dao.fist.counter', milestones: { 100: "Counter thành công +20% damage.", 250: "Counter thành công hồi 4% max HP.", 500: "Counter thành công sinh +3 Quyền Thế.", 750: "Recovery 0,50s.", 1000: "≤30% HP: counter thành công tạo khiên 12% max HP trong 3s." } },
    { dao: 'fist', skillId: 'skill.dao.fist.chain_heavy', milestones: { 100: "Hit cuối +20% damage.", 250: "Có ≥3 Quyền Thế: hit cuối +20% Break.", 500: "Ở 5 Quyền Thế thêm hit nặng 75%.", 750: "Recovery 0,70s.", 1000: "Liệt Địa Ngũ Hoàn: 5 hit; hit cuối 125% và giữ lại 2 Quyền Thế." } },
    { dao: 'fist', skillId: 'skill.dao.fist.pressure', milestones: { 100: "Break +15%.", 250: "Mục tiêu Thất Thế: +15% damage.", 500: "Ở ≥4 Quyền Thế: debuff Phòng Ngự của mục tiêu -10% trong 4s.", 750: "Cast 0,70s.", 1000: "Trấn Nhạc Áp Thiên: ở 5 Quyền Thế tiêu 2, Break ×1,5 và debuff -18% Phòng 5s." } },
    { dao: 'fist', skillId: 'skill.dao.fist.finisher', milestones: { 100: "Mỗi Quyền Thế tiêu +5% coefficient.", 250: "Mục tiêu Thất Thế: +20% damage.", 500: "Tiêu ≥4: +15% Xuyên riêng skill.", 750: "Recovery 0,80s.", 1000: "Phá Quân Tận Kình: tiêu tối đa 5; hit cuối 1,5× Hội Tâm power." } },
    { dao: 'fist', skillId: 'skill.dao.fist.ultimate', milestones: { 100: "Base coefficient 640→700%.", 250: "Mỗi Quyền Thế hiện có +12% coefficient.", 500: "5 Quyền Thế: finishing hit thêm 160%.", 750: "Recovery 1,10s.", 1000: "Cửu Thiên Quyền Vực 4s: Quyền Thế cap +2 và mỗi root action Quyền sinh thêm +1." } },
];
export const fistTreeV2 = [
    { realm: 'mundane', activeSkillId: 'skill.dao.fist.triple', passiveId: 'passive.v2.fist.p1' },
    { realm: 'spirit', activeSkillId: 'skill.dao.fist.shock', passiveId: 'passive.v2.fist.p2' },
    { realm: 'mystic', activeSkillId: 'skill.dao.fist.nurture', passiveId: 'passive.v2.fist.p3' },
    { realm: 'earth', activeSkillId: 'skill.dao.fist.heavy', passiveId: 'passive.v2.fist.p4' },
    { realm: 'heaven', activeSkillId: 'skill.dao.fist.counter', passiveId: 'passive.v2.fist.p5' },
    { realm: 'immortal', activeSkillId: 'skill.dao.fist.chain_heavy', passiveId: 'passive.v2.fist.p6' },
    { realm: 'extreme', activeSkillId: 'skill.dao.fist.pressure', passiveId: 'passive.v2.fist.p7' },
    { realm: 'breaker', activeSkillId: 'skill.dao.fist.finisher', passiveId: 'passive.v2.fist.p8' },
];
export const fistDaoV2 = { dao: 'fist', name: "Quyền Đạo", core: fistCoreV2, passiveStack: fistPassiveStackV2, passives: fistPassivesV2, mastery: fistSkillMasteryV2, tree: fistTreeV2 };
//# sourceMappingURL=fist-dao-v2.js.map