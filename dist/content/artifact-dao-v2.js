export const artifactCoreV2={
  "dao": "artifact",
  "name": "Bản Mệnh Khí Linh",
  "mainOnly": true,
  "summary": "PHÂN → NGỰ → HỢP / THU. Internal Khí Linh1–3, Deploy/Split+1, Recall-1, Merge≥2→1+6s Đại Khí Linh; rebuild locked in window. One source-scaling authority and one shared snapshot follow-up budget1. No collection Pháp Bảo/Chí Bảo authority."
};
export const artifactPassiveStackV2={
  "dao": "artifact",
  "id": "artifactPassiveStack",
  "name": "Khí Cảm",
  "cap": 20,
  "durationSeconds": 12,
  "decayEverySeconds": 1,
  "carryAcrossHuntKill": true,
  "summary": "Passive 1 mở stack này; giết quái không reset, nhận stack mới refresh duration, hết duration mới decay dần."
};
export const artifactPassivesV2=[
  {
    "id": "passive.v2.artifact.p1",
    "dao": "artifact",
    "name": "Khí Cảm Quyết",
    "realm": "mundane",
    "summary": "Every3 successful eligible roots +1, generated packets never count.",
    "lv1": "Every3 roots +1.",
    "lv20": "Every3 roots +1."
  },
  {
    "id": "passive.v2.artifact.p2",
    "dao": "artifact",
    "name": "Dưỡng Khí Chân Kinh",
    "realm": "spirit",
    "summary": "One extra-stack roll per real root.",
    "lv1": "10% chance.",
    "lv20": "30% chance."
  },
  {
    "id": "passive.v2.artifact.p3",
    "dao": "artifact",
    "name": "Khí Cảm Trường Tồn",
    "realm": "mystic",
    "summary": "Long hold/slower decay; pure reads.",
    "lv1": "+2s hold; decay1/s.",
    "lv20": "+8s hold; decay1/2s."
  },
  {
    "id": "passive.v2.artifact.p4",
    "dao": "artifact",
    "name": "Hộ Chủ Linh Quang",
    "realm": "earth",
    "summary": "Guard/Recall shield and bounded Secondary CN/shield utility.",
    "lv1": "Main shield +0.15%/stack; Secondary bounded3%CN/5%shield.",
    "lv20": "Main shield +0.5%/stack; Recall CN +0.3%/stack; Secondary bounded3%CN/5%shield."
  },
  {
    "id": "passive.v2.artifact.p5",
    "dao": "artifact",
    "name": "Vạn Khí Vô Cực",
    "realm": "heaven",
    "summary": "Stack cap only, never source cap.",
    "lv1": "Stack cap+2.",
    "lv20": "Stack cap+10."
  },
  {
    "id": "passive.v2.artifact.p6",
    "dao": "artifact",
    "name": "Bảo Khí Tương Sinh",
    "realm": "immortal",
    "summary": "Main shared-follow-up efficiency per10 stacks.",
    "lv1": "Follow-up +4%/10stacks.",
    "lv20": "Follow-up +12%/10stacks."
  },
  {
    "id": "passive.v2.artifact.p7",
    "dao": "artifact",
    "name": "Ngự Tâm Nhất Ý",
    "realm": "extreme",
    "summary": "Main Recall/Merge CN efficiency at20 stacks.",
    "lv1": "Recall/Merge CN -4% at20.",
    "lv20": "Recall/Merge CN -10% at20."
  },
  {
    "id": "passive.v2.artifact.p8",
    "dao": "artifact",
    "name": "Khí Cảm Bất Diệt",
    "realm": "breaker",
    "summary": "Real multi-source Command/Merge peak event: bounded hold/next follow-up or merge quality.",
    "lv1": "Hold1s; next follow-up+6%, merge quality3%.",
    "lv20": "Hold2s; next follow-up+15%, merge quality8%."
  }
];
export const artifactSkillMasteryV2=[
  {
    "dao": "artifact",
    "skillId": "skill.dao.artifact.basic",
    "milestones": {
      "100": "Hiệu quả riêng +5%; eligible multi-source follow-up +10%.",
      "250": "Hiệu quả riêng thêm4%.",
      "500": "Thu Chiêu -5%.",
      "750": "Thu Chiêu thêm5%.",
      "1000": "Cực Ý: hiệu quả riêng +8%; shared follow-up +15%, không thêm proc."
    }
  },
  {
    "dao": "artifact",
    "skillId": "skill.dao.artifact.deploy",
    "milestones": {
      "100": "Thi Triển -10%.",
      "250": "Chân Nguyên chiêu -3%.",
      "500": "Thu Chiêu -5%.",
      "750": "Hồi Chiêu -5%.",
      "1000": "Cực Ý: Thu Chiêu thêm10%; vẫn chỉ +1/cap3."
    }
  },
  {
    "dao": "artifact",
    "skillId": "skill.dao.artifact.guard",
    "milestones": {
      "100": "Hiệu quả riêng +5%; eligible multi-source follow-up +10%.",
      "250": "Chân Nguyên chiêu -3%.",
      "500": "Thu Chiêu -5%.",
      "750": "Hồi Chiêu -5%.",
      "1000": "Cực Ý: hiệu quả riêng +8%; shared follow-up +15%, không thêm proc."
    }
  },
  {
    "dao": "artifact",
    "skillId": "skill.dao.artifact.strike",
    "milestones": {
      "100": "Hiệu quả riêng +5%; eligible multi-source follow-up +10%.",
      "250": "Chân Nguyên chiêu -3%.",
      "500": "Thu Chiêu -5%.",
      "750": "Hồi Chiêu -5%.",
      "1000": "Cực Ý: hiệu quả riêng +8%; shared follow-up +15%, không thêm proc."
    }
  },
  {
    "dao": "artifact",
    "skillId": "skill.dao.artifact.sync",
    "milestones": {
      "100": "Hiệu quả riêng +5%; eligible multi-source follow-up +10%.",
      "250": "Chân Nguyên chiêu -3%.",
      "500": "Thu Chiêu -5%.",
      "750": "Hồi Chiêu -5%.",
      "1000": "Cực Ý: hiệu quả riêng +8%; shared follow-up +15%, không thêm proc."
    }
  },
  {
    "dao": "artifact",
    "skillId": "skill.dao.artifact.recall",
    "milestones": {
      "100": "CN thu hồi +20%, chỉ sau exactly-1 source commit.",
      "250": "Chân Nguyên chiêu -3%.",
      "500": "Thu Chiêu -5%.",
      "750": "Hồi Chiêu -5%.",
      "1000": "Cực Ý: CN thu hồi thêm10%; vẫn chỉ -1."
    }
  },
  {
    "dao": "artifact",
    "skillId": "skill.dao.artifact.split",
    "milestones": {
      "100": "Thi Triển -10%.",
      "250": "Chân Nguyên chiêu -3%.",
      "500": "Thu Chiêu -5%.",
      "750": "Hồi Chiêu -5%.",
      "1000": "Cực Ý: Thu Chiêu thêm10%; vẫn chỉ +1/cap3."
    }
  },
  {
    "dao": "artifact",
    "skillId": "skill.dao.artifact.merge",
    "milestones": {
      "100": "Hiệu quả riêng +5%; eligible multi-source follow-up +10%.",
      "250": "Chân Nguyên chiêu -3%.",
      "500": "Thu Chiêu -5%.",
      "750": "Hồi Chiêu -5%.",
      "1000": "Cực Ý: merge-local Command quality +10%; không rebuild trong window."
    }
  },
  {
    "dao": "artifact",
    "skillId": "skill.dao.artifact.suppress",
    "milestones": {
      "100": "Hiệu quả riêng +5%; eligible multi-source follow-up +10%.",
      "250": "Chân Nguyên chiêu -3%.",
      "500": "Thu Chiêu -5%.",
      "750": "Hồi Chiêu -5%.",
      "1000": "Cực Ý: hiệu quả riêng +8%; shared follow-up +15%, không thêm proc."
    }
  },
  {
    "dao": "artifact",
    "skillId": "skill.dao.artifact.ultimate",
    "milestones": {
      "100": "Hiệu quả riêng +5%; eligible multi-source follow-up +10%.",
      "250": "Hiệu quả riêng thêm4%.",
      "500": "Thu Chiêu -5%.",
      "750": "Thu Chiêu thêm5%.",
      "1000": "Cực Ý: hiệu quả riêng +8%; shared follow-up +15%, không thêm proc."
    }
  }
];
export const artifactTreeV2=[
  {
    "realm": "mundane",
    "activeSkillId": "skill.dao.artifact.deploy",
    "passiveId": "passive.v2.artifact.p1"
  },
  {
    "realm": "spirit",
    "activeSkillId": "skill.dao.artifact.guard",
    "passiveId": "passive.v2.artifact.p2"
  },
  {
    "realm": "mystic",
    "activeSkillId": "skill.dao.artifact.strike",
    "passiveId": "passive.v2.artifact.p3"
  },
  {
    "realm": "earth",
    "activeSkillId": "skill.dao.artifact.sync",
    "passiveId": "passive.v2.artifact.p4"
  },
  {
    "realm": "heaven",
    "activeSkillId": "skill.dao.artifact.recall",
    "passiveId": "passive.v2.artifact.p5"
  },
  {
    "realm": "immortal",
    "activeSkillId": "skill.dao.artifact.split",
    "passiveId": "passive.v2.artifact.p6"
  },
  {
    "realm": "extreme",
    "activeSkillId": "skill.dao.artifact.merge",
    "passiveId": "passive.v2.artifact.p7"
  },
  {
    "realm": "breaker",
    "activeSkillId": "skill.dao.artifact.suppress",
    "passiveId": "passive.v2.artifact.p8"
  }
];
export const artifactDaoV2={dao:'artifact',name:'Ngự Khí Đạo',core:artifactCoreV2,passiveStack:artifactPassiveStackV2,passives:artifactPassivesV2,mastery:artifactSkillMasteryV2,tree:artifactTreeV2};
