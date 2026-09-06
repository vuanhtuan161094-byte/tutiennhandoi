export const poisonCoreV2 = { dao: 'poison', name: "Độc Chủng", mainOnly: true, summary: "Chủ Độc gieo Độc Chủng lên mục tiêu hiện tại, stage 0–4. Skill Độc build tăng stage; mỗi stage -3% Phòng mục tiêu và +8% hiệu quả DoT Độc. Stage 4 = Công Tâm; skill Consume Độc kế +50% payoff rồi hạ stage về 1. Không có lan mục tiêu." };
export const poisonPassiveStackV2 = { dao: 'poison', id: 'poisonPassiveStack', name: "Độc Tức", cap: 20, durationSeconds: 12, decayEverySeconds: 1, carryAcrossHuntKill: true, summary: 'Passive 1 mở stack này; giết quái không reset, nhận stack mới refresh duration, hết duration mới decay dần.' };
export const poisonPassivesV2 = [
    { id: 'passive.v2.poison.p1', dao: 'poison', name: "Độc Tức Quyết", realm: 'mundane', summary: "Mở Độc Tức: mỗi 3 root damaging actions nhận +1 tầng.", lv1: "Mỗi tầng làm mục tiêu hiện tại -0,35% Phòng đối với người chơi; 10 tầng +5% damage; 20 tầng +8% Xuyên.", lv20: "Mỗi tầng -0,75% Phòng; 10 tầng +10% damage; 20 tầng +15% Xuyên." },
    { id: 'passive.v2.poison.p2', dao: 'poison', name: "Dưỡng Độc Chân Kinh", realm: 'spirit', summary: "Mỗi root damaging action có xác suất nhận thêm +1 Độc Tức.", lv1: "8% xác suất.", lv20: "25% xác suất." },
    { id: 'passive.v2.poison.p3', dao: 'poison', name: "Độc Tức Trường Tồn", realm: 'mystic', summary: "Độc Tức tồn tại lâu hơn và rơi chậm hơn.", lv1: "+2 giây duration.", lv20: "+8 giây duration; decay 1 tầng / 2 giây." },
    { id: 'passive.v2.poison.p4', dao: 'poison', name: "Thực Cốt Chi Độc", realm: 'earth', summary: "Mỗi Độc Tức giảm thêm Phòng mục tiêu.", lv1: "-0,10%/tầng.", lv20: "-0,30%/tầng." },
    { id: 'passive.v2.poison.p5', dao: 'poison', name: "Vạn Độc Vô Cực", realm: 'heaven', summary: "Tăng giới hạn Độc Tức.", lv1: "+2 cap.", lv20: "+10 cap." },
    { id: 'passive.v2.poison.p6', dao: 'poison', name: "Độc Sát Nhập Cốt", realm: 'immortal', summary: "Cứ mỗi 10 Độc Tức tăng damage gây lên mục tiêu hiện tại.", lv1: "+4% / 10 tầng.", lv20: "+12% / 10 tầng." },
    { id: 'passive.v2.poison.p7', dao: 'poison', name: "Phệ Tâm Chân Ý", realm: 'extreme', summary: "Khi Độc Tức ≥20 tăng damage lên mục tiêu dưới 50% HP.", lv1: "+10% damage.", lv20: "+35% damage." },
    { id: 'passive.v2.poison.p8', dao: 'poison', name: "Độc Tức Bất Diệt", realm: 'breaker', summary: "Khi Độc Tức đạt cap nhận bonus lớn và gây damage duy trì trạng thái đỉnh.", lv1: "+10% damage; refresh 1 giây.", lv20: "+30% damage; +20% Nộ gain; refresh 2 giây." },
];
export const poisonSkillMasteryV2 = [
    { dao: 'poison', skillId: 'skill.dao.poison.basic', milestones: { 100: "20% xác suất thêm 1 tick Độc 35%.", 250: "Đòn bồi tăng Độc Chủng +1 stage nếu chưa Công Tâm.", 500: "Ở stage 4, Basic +20% damage nhưng không tiêu Công Tâm.", 750: "Recovery 0,90s.", 1000: "Cực Ý · Song Độc Chỉ: mỗi Basic thứ 3 thành 2 hit 75% + 60%; hit sau thêm DoT 3s." } },
    { dao: 'poison', skillId: 'skill.dao.poison.bone', milestones: { 100: "DoT +20%.", 250: "Độc Chủng gain +1 stage thêm nếu mục tiêu chưa stage 2.", 500: "Ở Công Tâm, DoT tick nhanh hơn 20%.", 750: "Recovery 0,60s.", 1000: "Hủ Cốt Nhập Tủy: DoT 6 tick; mỗi tick +10% hiệu quả so tick trước." } },
    { dao: 'poison', skillId: 'skill.dao.poison.heart', milestones: { 100: "DoT duration +1s.", 250: "Cast hoàn tất tăng Độc Chủng +2 stage.", 500: "Mục tiêu stage ≥3 nhận -10% Phòng thêm trong 4s.", 750: "Cast 0,60s.", 1000: "Phệ Tâm Độc Ấn · Cực: DoT 6 tick, tick cuối +120% và +20% Break." } },
    { dao: 'poison', skillId: 'skill.dao.poison.insects', milestones: { 100: "Channel 2,2s.", 250: "Hoàn tất tăng Độc Chủng +2 stage.", 500: "Ở Công Tâm thêm hit cuối 80%.", 750: "Recovery 0,70s.", 1000: "Vạn Trùng Phệ Mạch: 7 hit; hit cuối +150%, DoT hiệu quả +25% 4s." } },
    { dao: 'poison', skillId: 'skill.dao.poison.mist', milestones: { 100: "DoT +15%.", 250: "Độc vụ kéo dài +2s.", 500: "Trong độc vụ, mục tiêu -10% Phòng thêm.", 750: "Cast/Deploy 0,45s.", 1000: "Độc Vụ Phong Giới: 8s; người chơi gây +20% damage lên mục tiêu trong vụ." } },
    { dao: 'poison', skillId: 'skill.dao.poison.transform', milestones: { 100: "Consume tối đa +1 stage.", 250: "Mỗi stage tiêu hồi 3% Chân Nguyên chuẩn.", 500: "Tiêu ở Công Tâm không hạ dưới stage 2.", 750: "Recovery 0,60s.", 1000: "Chuyển Độc Hóa Nguyên: tiêu tối đa 3; damage +60% và hồi 5% CN mỗi stage." } },
    { dao: 'poison', skillId: 'skill.dao.poison.guard', milestones: { 100: "Khiên +20%.", 250: "Stage Độc Chủng ≥2: khiên +15% nữa.", 500: "Khiên vỡ hồi 5% max HP.", 750: "Recovery 0,60s.", 1000: "Nghịch Độc Hộ Mệnh: Công Tâm cho khiên +50% và giảm thương 15% trong 3s." } },
    { dao: 'poison', skillId: 'skill.dao.poison.consume', milestones: { 100: "Mỗi stage tiêu +8% coefficient.", 250: "Mục tiêu dưới 50% HP: +20% damage.", 500: "Công Tâm: +15% Xuyên riêng skill.", 750: "Recovery 0,70s.", 1000: "Phệ Độc Quy Nguyên · Cực: tiêu stage 4 cho 2 hit 220% + 150%; hạ Độc Chủng về stage 1." } },
    { dao: 'poison', skillId: 'skill.dao.poison.calamity', milestones: { 100: "Độc Chủng gain +1 stage.", 250: "DoT +20%.", 500: "Nếu từ stage ≤1 cast xong đưa thẳng lên stage 4.", 750: "Cast 1,05s.", 1000: "Tam Sinh Độc Kiếp: 3 đợt DoT; đợt cuối +100% và Công Tâm kéo dài 3s không bị tiêu." } },
    { dao: 'poison', skillId: 'skill.dao.poison.ultimate', milestones: { 100: "Mỗi stage Độc Chủng +12% coefficient.", 250: "Công Tâm: thêm finishing hit 160%.", 500: "Sau Ultimate giữ Độc Chủng stage 1.", 750: "Recovery 1,15s.", 1000: "Cửu U Độc Vực 5s: DoT tick +30%, Độc Chủng không giảm stage khi Consume." } },
];
export const poisonTreeV2 = [
    { realm: 'mundane', activeSkillId: 'skill.dao.poison.bone', passiveId: 'passive.v2.poison.p1' },
    { realm: 'spirit', activeSkillId: 'skill.dao.poison.heart', passiveId: 'passive.v2.poison.p2' },
    { realm: 'mystic', activeSkillId: 'skill.dao.poison.insects', passiveId: 'passive.v2.poison.p3' },
    { realm: 'earth', activeSkillId: 'skill.dao.poison.mist', passiveId: 'passive.v2.poison.p4' },
    { realm: 'heaven', activeSkillId: 'skill.dao.poison.transform', passiveId: 'passive.v2.poison.p5' },
    { realm: 'immortal', activeSkillId: 'skill.dao.poison.guard', passiveId: 'passive.v2.poison.p6' },
    { realm: 'extreme', activeSkillId: 'skill.dao.poison.consume', passiveId: 'passive.v2.poison.p7' },
    { realm: 'breaker', activeSkillId: 'skill.dao.poison.calamity', passiveId: 'passive.v2.poison.p8' },
];
export const poisonDaoV2 = { dao: 'poison', name: "Độc Đạo", core: poisonCoreV2, passiveStack: poisonPassiveStackV2, passives: poisonPassivesV2, mastery: poisonSkillMasteryV2, tree: poisonTreeV2 };
//# sourceMappingURL=poison-dao-v2.js.map