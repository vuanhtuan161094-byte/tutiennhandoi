export const bodyCoreV2 = {
    dao: 'body',
    name: "Chân Thân · Phản Thế",
    mainOnly: true,
    resource: 'counterForce',
    cap: 100,
    productionAuthority: 'body-dao.runtime.production.v1',
    summary: "Chủ Thể tích Phản Thế 0–100 từ áp lực thực sự được giảm/đỡ, rồi chủ động tiêu tài nguyên qua Counter, Break, Recover hoặc Finisher. Giữ Phản Thế không tự cộng sát thương hay giảm thương; đạt 100 chỉ cường hóa lần cash-out hợp lệ kế tiếp theo runtime production.",
};

// Stable compatibility object only. Main Body production deletes/masks this historical stack at runtime.
export const bodyPassiveStackV2 = {
    dao: 'body',
    id: 'bodyPassiveStack',
    name: "Huyết Khí (legacy)",
    cap: 20,
    durationSeconds: 12,
    decayEverySeconds: 1,
    carryAcrossHuntKill: true,
    retiredForMainBody: true,
    productionMainBody: false,
    summary: 'Dữ liệu tương thích cũ. Chủ Thể Thể Đạo production không sinh, không hiển thị và không nhận hiệu ứng chiến đấu từ Huyết Khí; Phản Thế là tài nguyên ngắn hạn duy nhất.',
};

export const bodyPassivesV2 = [
    { id: 'passive.v2.body.p1', dao: 'body', name: "Huyết Khí Quyết", realm: 'mundane', summary: "Phòng thủ thành công cường hóa chuyển hóa áp lực thành Phản Thế; mất HP thuần túy không tạo tài nguyên.", lv1: "+5% lượng Phản Thế nhận từ một lần giảm/đỡ hợp lệ.", lv20: "+5% lượng Phản Thế nhận từ một lần giảm/đỡ hợp lệ." },
    { id: 'passive.v2.body.p2', dao: 'body', name: "Dưỡng Huyết Chân Kinh", realm: 'spirit', summary: "Tăng hiệu suất chuyển hóa khi một lần giảm/đỡ thực sự tạo Phản Thế.", lv1: "+10% lượng Phản Thế chuyển hóa.", lv20: "+25% lượng Phản Thế chuyển hóa." },
    { id: 'passive.v2.body.p3', dao: 'body', name: "Huyết Khí Trường Tồn", realm: 'mystic', summary: "Một lần giảm/đỡ hợp lệ mở cửa sổ thủ–phản để các kỹ năng phản kích nhận hiệu ứng tiếp theo.", lv1: "Cửa sổ thủ–phản kéo dài 3 giây.", lv20: "Cửa sổ thủ–phản kéo dài 5 giây." },
    { id: 'passive.v2.body.p4', dao: 'body', name: "Thiết Cốt Chân Ý", realm: 'earth', summary: "Trong cửa sổ thủ–phản, Hóa Kình/Counter/Break/Finisher gây thêm sát thương.", lv1: "+4% sát thương các kỹ năng payoff hợp lệ.", lv20: "+12% sát thương các kỹ năng payoff hợp lệ." },
    { id: 'passive.v2.body.p5', dao: 'body', name: "Huyết Hải Vô Cực", realm: 'heaven', summary: "Khi Phản Thế đạt trạng thái cao, tăng tốc tích Nộ cho Ultimate.", lv1: "Từ 80 Phản Thế: +5% Nộ nhận.", lv20: "Từ 80 Phản Thế: +12% Nộ nhận." },
    { id: 'passive.v2.body.p6', dao: 'body', name: "Khí Huyết Quy Nguyên", realm: 'immortal', summary: "Quy Nguyên Luyện Thể mạnh hơn khi chủ động tiêu Phản Thế; chỉ Recover sở hữu hiệu ứng này.", lv1: "Mỗi đủ 20 Phản Thế đã tiêu: +4% hiệu quả Hồi/Khiên, tối đa 2 nhóm.", lv20: "Mỗi đủ 20 Phản Thế đã tiêu: +12% hiệu quả Hồi/Khiên, tối đa 2 nhóm." },
    { id: 'passive.v2.body.p7', dao: 'body', name: "Bất Khuất Chân Thể", realm: 'extreme', summary: "Trong cửa sổ thủ–phản sau một lần phòng thủ hợp lệ, giảm sát thương nhận vào.", lv1: "+4% giảm thương trong cửa sổ thủ–phản.", lv20: "+12% giảm thương trong cửa sổ thủ–phản." },
    { id: 'passive.v2.body.p8', dao: 'body', name: "Huyết Khí Bất Diệt", realm: 'breaker', summary: "Một lần cash-out Phản Thế thực sự mở chu kỳ phản công ngắn; nhận đòn thông thường không duy trì chu kỳ này.", lv1: "Sau cash-out: 2 giây, Skill Thể +8% sát thương.", lv20: "Sau cash-out: 4 giây, Skill Thể +20% sát thương." },
];

const productionMasteryMilestones = Object.freeze({
    100: 'Mốc Thuần Thục tương thích; không thêm override Thể Đạo riêng ngoài runtime production hiện hành.',
    250: 'Mốc Thuần Thục tương thích; không thêm override Thể Đạo riêng ngoài runtime production hiện hành.',
    500: 'Mốc Thuần Thục tương thích; không thêm override Thể Đạo riêng ngoài runtime production hiện hành.',
    750: 'Mốc Thuần Thục tương thích; không thêm override Thể Đạo riêng ngoài runtime production hiện hành.',
    1000: 'Mốc Thuần Thục tương thích; không thêm override Thể Đạo riêng ngoài runtime production hiện hành.',
});
const productionMastery = (skillId, productionName) => ({
    dao: 'body',
    skillId,
    productionName,
    productionExtraMechanics: false,
    authority: 'shared-skill-practice + body-dao.runtime.production.v1',
    milestones: { ...productionMasteryMilestones },
});

// Keep all ten stable mastery rows for save/UI compatibility, but retire the old unsupported
// Body-specific milestone promises. Any future mastery extension must be implemented in runtime
// and benchmarked before these player-facing descriptions claim an extra mechanic.
export const bodySkillMasteryV2 = [
    productionMastery('skill.dao.body.basic', 'Thiết Cốt Khai Bi'),
    productionMastery('skill.dao.body.guard', 'Kim Cang Hộ Thể'),
    productionMastery('skill.dao.body.transform', 'Hóa Kình Tán Lực'),
    productionMastery('skill.dao.body.immovable', 'Bất Động Như Sơn'),
    productionMastery('skill.dao.body.counter', 'Chấn Cốt Phản Kình'),
    productionMastery('skill.dao.body.elephant', 'Nhiên Huyết Chấn Thân'),
    productionMastery('skill.dao.body.break', 'Cương Thân Phá Kình'),
    productionMastery('skill.dao.body.recover', 'Quy Nguyên Luyện Thể'),
    productionMastery('skill.dao.body.finisher', 'Băng Sơn Chấn Thể'),
    productionMastery('skill.dao.body.ultimate', 'Vạn Kiếp Bất Diệt Chân Thân'),
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