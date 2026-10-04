export const formationCoreV2 = {
  "dao": "formation",
  "name": "Chủ Trận",
  "mainOnly": true,
  "summary": "Bố → Dưỡng ↔ Hộ → Kích. Deploy0/100; Dưỡng100 Đại Thành readiness, Full action-local payoff only. Small25/Full70; Độ Bền0 collapses. No generic damage/Break."
};
export const formationPassiveStackV2 = {
  "dao": "formation",
  "id": "formationPassiveStack",
  "name": "Trận Văn",
  "cap": 20,
  "durationSeconds": 12,
  "decayEverySeconds": 1,
  "carryAcrossHuntKill": true,
  "summary": "Passive 1 mở stack này; giết quái không reset, nhận stack mới refresh duration, hết duration mới decay dần."
};
export const formationPassivesV2 = [
  {
    "id": "passive.v2.formation.p1",
    "dao": "formation",
    "name": "Trận Văn Quyết",
    "realm": "mundane",
    "summary": "Successful distinct Formation root +1; Secondary distinct Main roots for bounded CN utility.",
    "lv1": "Nurture +0.1%/stack; Secondary CN -0.1%/stack, cap3%.",
    "lv20": "Nurture +0.3%/stack; Secondary CN max3%."
  },
  {
    "id": "passive.v2.formation.p2",
    "dao": "formation",
    "name": "Dưỡng Trận Chân Kinh",
    "realm": "spirit",
    "summary": "One extra-stack roll per eligible distinct root.",
    "lv1": "10% extra +1.",
    "lv20": "30% extra +1."
  },
  {
    "id": "passive.v2.formation.p3",
    "dao": "formation",
    "name": "Trận Văn Trường Tồn",
    "realm": "mystic",
    "summary": "Longer duration and slower decay; no read refresh.",
    "lv1": "+2s hold; decay1/s.",
    "lv20": "+8s hold; decay1/2s."
  },
  {
    "id": "passive.v2.formation.p4",
    "dao": "formation",
    "name": "Hộ Nhãn Chân Giải",
    "realm": "earth",
    "summary": "Fortify/Convert restoration efficiency; never creates nurture.",
    "lv1": "Restoration +0.2%/stack.",
    "lv20": "Restoration +0.5%/stack."
  },
  {
    "id": "passive.v2.formation.p5",
    "dao": "formation",
    "name": "Chu Thiên Vô Cực",
    "realm": "heaven",
    "summary": "Trận Văn cap.",
    "lv1": "Cap+2.",
    "lv20": "Cap+10."
  },
  {
    "id": "passive.v2.formation.p6",
    "dao": "formation",
    "name": "Kích Trận Chân Ý",
    "realm": "immortal",
    "summary": "Main activation-local quality at each10 stacks.",
    "lv1": "Activation +2%/10stacks.",
    "lv20": "Activation +6%/10stacks."
  },
  {
    "id": "passive.v2.formation.p7",
    "dao": "formation",
    "name": "Trận Thế Lăng Thiên",
    "realm": "extreme",
    "summary": "Main integrity wear reduction at20 stacks.",
    "lv1": "Wear -5% at20.",
    "lv20": "Wear -15% at20."
  },
  {
    "id": "passive.v2.formation.p8",
    "dao": "formation",
    "name": "Trận Văn Bất Diệt",
    "realm": "breaker",
    "summary": "Main cap Grand stability and event-owned hold.",
    "lv1": "Grand wear -5%; Grand event hold1s.",
    "lv20": "Grand wear -10%; Grand event hold2s."
  }
];
export const formationSkillMasteryV2 = [
  {
    "dao": "formation",
    "skillId": "skill.dao.formation.basic",
    "milestones": {
      "100": "Dưỡng package +5%.",
      "250": "Dưỡng package +10%, cap60 mỗi root.",
      "500": "Thu Chiêu chiêu -5%.",
      "750": "Thu Chiêu thêm -5%.",
      "1000": "Cực Ý: Dưỡng package thêm10%, không floor."
    }
  },
  {
    "dao": "formation",
    "skillId": "skill.dao.formation.deploy",
    "milestones": {
      "100": "Thi Triển -10%.",
      "250": "Chân Nguyên chiêu -3%.",
      "500": "Thu Chiêu chiêu -5%.",
      "750": "Hồi Chiêu chiêu -5%.",
      "1000": "Cực Ý: Thi Triển thêm -15%; vẫn0 Dưỡng/100 Bền."
    }
  },
  {
    "dao": "formation",
    "skillId": "skill.dao.formation.nourish",
    "milestones": {
      "100": "Dưỡng package +5%.",
      "250": "Dưỡng package +10%, cap60 mỗi root.",
      "500": "Thu Chiêu chiêu -5%.",
      "750": "Hồi Chiêu chiêu -5%.",
      "1000": "Cực Ý: Dưỡng package thêm10%, không floor."
    }
  },
  {
    "dao": "formation",
    "skillId": "skill.dao.formation.fortify",
    "milestones": {
      "100": "Hiệu suất hồi Bền +20%.",
      "250": "Chân Nguyên chiêu -3%.",
      "500": "Thu Chiêu chiêu -5%.",
      "750": "Hồi Chiêu chiêu -5%.",
      "1000": "Cực Ý: hiệu suất hồi Bền thêm20%."
    }
  },
  {
    "dao": "formation",
    "skillId": "skill.dao.formation.small_activate",
    "milestones": {
      "100": "Hiệu quả riêng +5%.",
      "250": "Chân Nguyên chiêu -3%.",
      "500": "Thu Chiêu chiêu -5%.",
      "750": "Hồi Chiêu chiêu -5%.",
      "1000": "Cực Ý: hiệu quả riêng thêm10%, không bypass setup."
    }
  },
  {
    "dao": "formation",
    "skillId": "skill.dao.formation.full_activate",
    "milestones": {
      "100": "Hiệu quả riêng +5%.",
      "250": "Chân Nguyên chiêu -3%.",
      "500": "Thu Chiêu chiêu -5%.",
      "750": "Hồi Chiêu chiêu -5%.",
      "1000": "Cực Ý: hiệu quả riêng thêm10%, không bypass setup."
    }
  },
  {
    "dao": "formation",
    "skillId": "skill.dao.formation.seal",
    "milestones": {
      "100": "Dưỡng package +5%.",
      "250": "Dưỡng package +10%, cap60 mỗi root.",
      "500": "Thu Chiêu chiêu -5%.",
      "750": "Hồi Chiêu chiêu -5%.",
      "1000": "Cực Ý: Dưỡng package thêm10%, không floor."
    }
  },
  {
    "dao": "formation",
    "skillId": "skill.dao.formation.convert",
    "milestones": {
      "100": "Hiệu suất hồi Bền +20%.",
      "250": "Chân Nguyên chiêu -3%.",
      "500": "Thu Chiêu chiêu -5%.",
      "750": "Hồi Chiêu chiêu -5%.",
      "1000": "Cực Ý: hiệu suất hồi Bền thêm20%."
    }
  },
  {
    "dao": "formation",
    "skillId": "skill.dao.formation.break",
    "milestones": {
      "100": "CN thu hồi +20%.",
      "250": "Thi Triển -10%.",
      "500": "Thu Chiêu chiêu -5%.",
      "750": "Thu Chiêu thêm -5%.",
      "1000": "CN thu hồi thêm10% từ giá trị thật."
    }
  },
  {
    "dao": "formation",
    "skillId": "skill.dao.formation.ultimate",
    "milestones": {
      "100": "Hiệu quả riêng +5%.",
      "250": "Uy lực riêng thêm5%, vẫn đọc Dưỡng thật.",
      "500": "Thu Chiêu chiêu -5%.",
      "750": "Thu Chiêu thêm -5%.",
      "1000": "Cực Ý: hiệu quả riêng thêm10%, không bypass setup."
    }
  }
];
export const formationTreeV2 = [
  {
    "realm": "mundane",
    "activeSkillId": "skill.dao.formation.deploy",
    "passiveId": "passive.v2.formation.p1"
  },
  {
    "realm": "spirit",
    "activeSkillId": "skill.dao.formation.nourish",
    "passiveId": "passive.v2.formation.p2"
  },
  {
    "realm": "mystic",
    "activeSkillId": "skill.dao.formation.fortify",
    "passiveId": "passive.v2.formation.p3"
  },
  {
    "realm": "earth",
    "activeSkillId": "skill.dao.formation.small_activate",
    "passiveId": "passive.v2.formation.p4"
  },
  {
    "realm": "heaven",
    "activeSkillId": "skill.dao.formation.full_activate",
    "passiveId": "passive.v2.formation.p5"
  },
  {
    "realm": "immortal",
    "activeSkillId": "skill.dao.formation.seal",
    "passiveId": "passive.v2.formation.p6"
  },
  {
    "realm": "extreme",
    "activeSkillId": "skill.dao.formation.convert",
    "passiveId": "passive.v2.formation.p7"
  },
  {
    "realm": "breaker",
    "activeSkillId": "skill.dao.formation.break",
    "passiveId": "passive.v2.formation.p8"
  }
];
export const formationDaoV2 = {dao:'formation',name:'Trận Đạo',core:formationCoreV2,passiveStack:formationPassiveStackV2,passives:formationPassivesV2,mastery:formationSkillMasteryV2,tree:formationTreeV2};
