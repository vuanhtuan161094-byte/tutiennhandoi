export const spellCoreV2 = { dao: 'spell', name: "Pháp Luân", mainOnly: true, summary: "Pháp Luân có 3 ô Tốc Pháp/Cast/Dẫn Pháp. Hoàn thành một loại Main Pháp chưa có trong vòng sẽ lấp 1 ô. Mỗi ô +6% damage Skill Pháp và +5% hiệu suất Chân Nguyên. Đủ 3: Skill Pháp gây sát thương kế tiếp vào Diễn Pháp +35% damage/+20% Break rồi xóa 2 ô." };
export const spellPassiveStackV2 = { dao: 'spell', id: 'spellPassiveStack', name: "Pháp Ý", cap: 20, durationSeconds: 12, decayEverySeconds: 1, carryAcrossHuntKill: true, summary: 'Passive 1 mở stack này; giết quái không reset, nhận stack mới refresh duration, hết duration mới decay dần.' };
export const spellPassivesV2 = [
    { id: 'passive.v2.spell.p1', dao: 'spell', name: "Pháp Ý Quyết", realm: 'mundane', summary: "Mở Pháp Ý: mỗi root action có tiêu Chân Nguyên nhận +1 tầng.", lv1: "Mỗi tầng +0,5% Skill damage và +0,4% hồi Chân Nguyên; 10 tầng -5% CN cost; 20 tầng +5% CDR.", lv20: "Mỗi tầng +1,5% Skill damage và +1% hồi Chân Nguyên; 10 tầng -10% CN cost; 20 tầng +15% CDR." },
    { id: 'passive.v2.spell.p2', dao: 'spell', name: "Dẫn Pháp Chân Kinh", realm: 'spirit', summary: "Mỗi root action có tiêu Chân Nguyên có xác suất nhận thêm +1 Pháp Ý.", lv1: "10% xác suất.", lv20: "30% xác suất." },
    { id: 'passive.v2.spell.p3', dao: 'spell', name: "Pháp Ý Trường Tồn", realm: 'mystic', summary: "Pháp Ý tồn tại lâu hơn và rơi chậm hơn.", lv1: "+2 giây duration.", lv20: "+8 giây duration; decay 1 tầng / 2 giây." },
    { id: 'passive.v2.spell.p4', dao: 'spell', name: "Tụ Linh Chân Giải", realm: 'earth', summary: "Mỗi Pháp Ý tăng thêm hiệu suất Chân Nguyên.", lv1: "+0,15%/tầng.", lv20: "+0,50%/tầng." },
    { id: 'passive.v2.spell.p5', dao: 'spell', name: "Vạn Pháp Vô Cực", realm: 'heaven', summary: "Tăng giới hạn Pháp Ý.", lv1: "+2 cap.", lv20: "+10 cap." },
    { id: 'passive.v2.spell.p6', dao: 'spell', name: "Pháp Uy Lăng Thiên", realm: 'immortal', summary: "Cứ mỗi 10 Pháp Ý tăng Skill damage.", lv1: "+4% / 10 tầng.", lv20: "+12% / 10 tầng." },
    { id: 'passive.v2.spell.p7', dao: 'spell', name: "Hồi Nguyên Thông Huyền", realm: 'extreme', summary: "Khi Pháp Ý ≥20 tăng hồi Chân Nguyên và giảm CN cost.", lv1: "+8% hồi; -4% cost.", lv20: "+25% hồi; -10% cost." },
    { id: 'passive.v2.spell.p8', dao: 'spell', name: "Pháp Ý Bất Diệt", realm: 'breaker', summary: "Khi Pháp Ý đạt cap nhận bonus lớn và cast skill duy trì trạng thái đỉnh.", lv1: "+10% Skill damage; cast refresh 1 giây.", lv20: "+30% Skill damage; +20% Nộ gain; cast refresh 2 giây." },
];
export const spellSkillMasteryV2 = [
    { dao: 'spell', skillId: 'skill.dao.spell.basic', milestones: { 100: "Hồi Chân Nguyên +20%.", 250: "Mỗi Basic thứ 3 thêm pháp đạn 55%.", 500: "Ở đủ 3 ô Pháp Luân, Basic không tiêu Diễn Pháp nhưng +20% damage.", 750: "Recovery 0,90s.", 1000: "Cực Ý · Song Pháp Chỉ: mỗi Basic thứ 3 thành 2 hit 90% + 70% và hồi thêm Chân Nguyên." } },
    { dao: 'spell', skillId: 'skill.dao.spell.light', milestones: { 100: "Damage +15%.", 250: "Nếu lấp ô Tốc Pháp mới: +1 Nộ thêm.", 500: "Ở 3 ô Pháp Luân, skill này +25% damage nhưng không tự tiêu Diễn Pháp nếu có skill nặng sẵn sàng trong 1s.", 750: "Recovery 0,55s.", 1000: "Linh Quang Liên Thuật: 2 hit 150% + 80%; hit sau có thể Hội Tâm." } },
    { dao: 'spell', skillId: 'skill.dao.spell.channel', milestones: { 100: "Channel 1,8s.", 250: "Hoàn tất channel lấp ô Dẫn Pháp và hồi 6% Chân Nguyên chuẩn.", 500: "Ở ≥2 ô Pháp Luân thêm hit cuối 90%.", 750: "Recovery 0,70s.", 1000: "Huyền Pháp Cửu Châu: 6 hit, hit cuối 130%; hoàn tất đưa Pháp Luân tối thiểu lên 2 ô." } },
    { dao: 'spell', skillId: 'skill.dao.spell.restore', milestones: { 100: "Hồi Chân Nguyên +20%.", 250: "Hoàn tất channel nhận khiên 8% max HP.", 500: "Nếu CN dưới 30%, channel nhanh hơn 20%.", 750: "Recovery 0,75s.", 1000: "Quy Nguyên Viên Mãn: hoàn tất hồi thêm 15% Chân Nguyên chuẩn và lấp 1 ô Pháp Luân còn thiếu." } },
    { dao: 'spell', skillId: 'skill.dao.spell.shield', milestones: { 100: "Khiên +20%.", 250: "Khiên tồn tại +1s.", 500: "Khi khiên vỡ hồi 8% Chân Nguyên chuẩn.", 750: "Recovery 0,55s.", 1000: "Pháp Thuẫn Vạn Tượng: khiên +40%; trong 3s đầu cast/recovery Skill Pháp -10%." } },
    { dao: 'spell', skillId: 'skill.dao.spell.seal', milestones: { 100: "Cast 0,80s.", 250: "Hoàn tất lấp 1 ô Pháp Luân còn thiếu ưu tiên.", 500: "Sau cast, Skill Pháp kế +15% damage.", 750: "Cast 0,60s.", 1000: "Ngưng Pháp Thành Luân: nếu Pháp Luân 0–1 ô, cast hoàn tất đưa lên 3 ô; CD không đổi." } },
    { dao: 'spell', skillId: 'skill.dao.spell.burst', milestones: { 100: "Damage +15%.", 250: "CN cost cao nhưng +20% Nộ gain.", 500: "Ở đủ 3 ô, Diễn Pháp của skill này +50% thay vì +35%.", 750: "Cast 1,15s.", 1000: "Chân Nguyên Bạo Pháp · Cực: 2 hit 340% + 160%; hit sau +25% Break." } },
    { dao: 'spell', skillId: 'skill.dao.spell.break', milestones: { 100: "Break +20%.", 250: "Mục tiêu chưa Thất Thế: +15% Break.", 500: "Nếu Diễn Pháp kích trên skill này, debuff -12% Phòng 4s.", 750: "Cast 1,00s.", 1000: "Phá Giới Chân Ấn: Diễn Pháp +60% Break và +20% Xuyên riêng skill." } },
    { dao: 'spell', skillId: 'skill.dao.spell.transform', milestones: { 100: "Mỗi Pháp Ấn/ô tiêu tăng hiệu quả buff kế +10%.", 250: "Tiêu ≥2: giảm 10% CN cost skill kế.", 500: "Tiêu 3: Skill Pháp kế +25% damage.", 750: "Recovery 0,55s.", 1000: "Vạn Tượng Quy Nhất: tiêu 3 để Skill Pháp kế +40% damage, +25% Break và không tiêu CN." } },
    { dao: 'spell', skillId: 'skill.dao.spell.ultimate', milestones: { 100: "Channel 3,6s.", 250: "Mỗi ô Pháp Luân hiện có +1 hit phụ 60%.", 500: "Hoàn tất channel đưa Pháp Luân về 3 ô thay vì rỗng.", 750: "Recovery 1,20s.", 1000: "Thái Nhất Pháp Vực 5s: mỗi lần lấp ô Pháp Luân đồng thời +5% Skill damage, tối đa 5 tầng." } },
];
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