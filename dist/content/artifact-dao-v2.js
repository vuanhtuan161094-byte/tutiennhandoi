export const artifactCoreV2 = { dao: 'artifact', name: "Bản Mệnh Khí Linh", mainOnly: true, summary: "Chủ Ngự Khí có 1–3 Nguồn Pháp Bảo. Mỗi nguồn +12% hiệu quả Artifact Command và +8% Khiên Pháp Bảo. Sau một Artifact Command gây damage, các nguồn phụ tạo một generated follow-up chung: mỗi nguồn phụ 20% Công Lực, vẫn chỉ tốn 1 followUpBudget." };
export const artifactPassiveStackV2 = { dao: 'artifact', id: 'artifactPassiveStack', name: "Khí Cảm", cap: 20, durationSeconds: 12, decayEverySeconds: 1, carryAcrossHuntKill: true, summary: 'Passive 1 mở stack này; giết quái không reset, nhận stack mới refresh duration, hết duration mới decay dần.' };
export const artifactPassivesV2 = [
    { id: 'passive.v2.artifact.p1', dao: 'artifact', name: "Khí Cảm Quyết", realm: 'mundane', summary: "Mở Khí Cảm: mỗi 3 root actions nhận +1 tầng.", lv1: "Mỗi tầng +0,4% Nộ gain và +0,4% Action Speed; 10 tầng +5% damage; 20 tầng +8% Khiên.", lv20: "Mỗi tầng +1% Nộ gain và +0,8% Action Speed; 10 tầng +10% damage; 20 tầng +15% Khiên." },
    { id: 'passive.v2.artifact.p2', dao: 'artifact', name: "Dưỡng Khí Chân Kinh", realm: 'spirit', summary: "Mỗi root action có xác suất nhận thêm +1 Khí Cảm.", lv1: "10% xác suất.", lv20: "30% xác suất." },
    { id: 'passive.v2.artifact.p3', dao: 'artifact', name: "Khí Cảm Trường Tồn", realm: 'mystic', summary: "Khí Cảm tồn tại lâu hơn và rơi chậm hơn.", lv1: "+2 giây duration.", lv20: "+8 giây duration; decay 1 tầng / 2 giây." },
    { id: 'passive.v2.artifact.p4', dao: 'artifact', name: "Hộ Chủ Linh Quang", realm: 'earth', summary: "Mỗi Khí Cảm tăng thêm hiệu quả Khiên.", lv1: "+0,15%/tầng.", lv20: "+0,50%/tầng." },
    { id: 'passive.v2.artifact.p5', dao: 'artifact', name: "Vạn Khí Vô Cực", realm: 'heaven', summary: "Tăng giới hạn Khí Cảm.", lv1: "+2 cap.", lv20: "+10 cap." },
    { id: 'passive.v2.artifact.p6', dao: 'artifact', name: "Bảo Khí Tương Sinh", realm: 'immortal', summary: "Cứ mỗi 10 Khí Cảm tăng damage trực tiếp.", lv1: "+4% / 10 tầng.", lv20: "+12% / 10 tầng." },
    { id: 'passive.v2.artifact.p7', dao: 'artifact', name: "Ngự Tâm Nhất Ý", realm: 'extreme', summary: "Khi Khí Cảm ≥20 tăng CDR và Action Speed.", lv1: "+4% CDR; +4% tốc.", lv20: "+12% CDR; +12% tốc." },
    { id: 'passive.v2.artifact.p8', dao: 'artifact', name: "Khí Cảm Bất Diệt", realm: 'breaker', summary: "Khi Khí Cảm đạt cap nhận bonus lớn và root action duy trì trạng thái đỉnh.", lv1: "+10% damage; refresh 1 giây.", lv20: "+30% damage; +20% Nộ gain; refresh 2 giây." },
];
export const artifactSkillMasteryV2 = [
    { dao: 'artifact', skillId: 'skill.dao.artifact.basic', milestones: { 100: "Nguồn phụ follow-up +10% coefficient.", 250: "Mỗi Basic thứ 3 giảm 1s CD Deploy nếu chưa đủ 3 nguồn.", 500: "Ở 3 nguồn, Basic +20% damage.", 750: "Recovery 0,85s.", 1000: "Cực Ý · Tam Khí Đồng Kích: mỗi Basic thứ 3 gọi 3 nhịp 70% + 35% + 35% trong một root action." } },
    { dao: 'artifact', skillId: 'skill.dao.artifact.deploy', milestones: { 100: "Cast 0,65s.", 250: "Deploy thành công tạo khiên 6% max HP.", 500: "Nếu đang 1 nguồn, Deploy đầu tiên không tốn CN.", 750: "Recovery 0,65s.", 1000: "Phân Khí Thành Tam: nếu đang 1 nguồn, cast hoàn chỉnh đưa thẳng lên 3 nguồn; CD tăng 20%." } },
    { dao: 'artifact', skillId: 'skill.dao.artifact.guard', milestones: { 100: "Khiên +20%.", 250: "Mỗi nguồn hiện có +8% shield.", 500: "Khiên vỡ hồi 5% Chân Nguyên chuẩn.", 750: "Recovery 0,55s.", 1000: "Huyền Kính Vạn Hóa: ở 3 nguồn khiên +50% và giảm thương 15% trong 3s." } },
    { dao: 'artifact', skillId: 'skill.dao.artifact.strike', milestones: { 100: "Damage +15%.", 250: "Mỗi nguồn phụ +10% Break.", 500: "Ở 3 nguồn thêm hit phụ 80%.", 750: "Recovery 0,60s.", 1000: "Phá Không Tam Ngự: 3 hit 210% + 70% + 70%; hit cuối +30% Break." } },
    { dao: 'artifact', skillId: 'skill.dao.artifact.sync', milestones: { 100: "Mỗi nguồn +8% coefficient.", 250: "Ở 3 nguồn +20% Nộ gain.", 500: "Follow-up nguồn phụ có thể Hội Tâm.", 750: "Recovery 0,75s.", 1000: "Bách Khí Đồng Minh · Cực: 1 root action 5 hit; hit cuối 130%, không vượt followUpBudget." } },
    { dao: 'artifact', skillId: 'skill.dao.artifact.recall', milestones: { 100: "Hồi Chân Nguyên +20%.", 250: "Thu hồi nguồn tạo khiên +25%.", 500: "Thu hồi khi 3 nguồn giữ lại 2 thay vì 1.", 750: "Recovery 0,65s.", 1000: "Quy Khí Đại Hoàn: mỗi nguồn thu hồi hồi thêm 5% CN chuẩn; tối đa 2 nguồn." } },
    { dao: 'artifact', skillId: 'skill.dao.artifact.split', milestones: { 100: "Cast 0,55s.", 250: "Nguồn mới tồn tại nhận +15% command effect 5s.", 500: "Ở 2 nguồn, Split đưa lên 3 và giảm CD 20%.", 750: "Recovery 0,65s.", 1000: "Phân Quang Vạn Khí: source cap tạm +1 trong 5s; nguồn thứ 4 chỉ có 60% hiệu quả." } },
    { dao: 'artifact', skillId: 'skill.dao.artifact.merge', milestones: { 100: "Mỗi nguồn gộp +12% damage.", 250: "Gộp ≥3: +20% Break.", 500: "Sau Merge, Basic/Command +20% damage 4s.", 750: "Cast 0,75s.", 1000: "Hợp Khí Chân Nhất: gộp 3 nguồn thành 1 Đại Khí Linh 6s, command effect +60%." } },
    { dao: 'artifact', skillId: 'skill.dao.artifact.suppress', milestones: { 100: "Break +20%.", 250: "Mỗi nguồn +10% damage.", 500: "Ở 3 nguồn debuff -10% Phòng 4s.", 750: "Cast 0,85s.", 1000: "Vạn Bảo Trấn Không: 3 nguồn → damage ×1,45, Break ×1,35, debuff -18% Phòng 5s." } },
    { dao: 'artifact', skillId: 'skill.dao.artifact.ultimate', milestones: { 100: "Mỗi nguồn +15% coefficient.", 250: "3 nguồn thêm finishing hit 160%.", 500: "Sau Ultimate giữ lại ít nhất 2 nguồn.", 750: "Recovery 1,20s.", 1000: "Chư Thiên Bảo Vực 5s: source cap +1, command follow-up coefficient +50%." } },
];
export const artifactTreeV2 = [
    { realm: 'mundane', activeSkillId: 'skill.dao.artifact.deploy', passiveId: 'passive.v2.artifact.p1' },
    { realm: 'spirit', activeSkillId: 'skill.dao.artifact.guard', passiveId: 'passive.v2.artifact.p2' },
    { realm: 'mystic', activeSkillId: 'skill.dao.artifact.strike', passiveId: 'passive.v2.artifact.p3' },
    { realm: 'earth', activeSkillId: 'skill.dao.artifact.sync', passiveId: 'passive.v2.artifact.p4' },
    { realm: 'heaven', activeSkillId: 'skill.dao.artifact.recall', passiveId: 'passive.v2.artifact.p5' },
    { realm: 'immortal', activeSkillId: 'skill.dao.artifact.split', passiveId: 'passive.v2.artifact.p6' },
    { realm: 'extreme', activeSkillId: 'skill.dao.artifact.merge', passiveId: 'passive.v2.artifact.p7' },
    { realm: 'breaker', activeSkillId: 'skill.dao.artifact.suppress', passiveId: 'passive.v2.artifact.p8' },
];
export const artifactDaoV2 = { dao: 'artifact', name: "Ngự Khí Đạo", core: artifactCoreV2, passiveStack: artifactPassiveStackV2, passives: artifactPassivesV2, mastery: artifactSkillMasteryV2, tree: artifactTreeV2 };
//# sourceMappingURL=artifact-dao-v2.js.map