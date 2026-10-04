import { poisonSkillGrowthProfileV1 } from '../core/battle-dao-skill-growth-v126.js';
export const poisonCoreV2 = { dao: 'poison', name: "Độc Chủng", mainOnly: true, summary: "Gieo → Dưỡng → Công Tâm → Giữ hoặc Phệ. Stage 0–4 trên một target; mỗi stage +8% DoT Độc. Full Công Tâm consume có duy nhất ×1,5 payoff và giữ stage 1. Không generic damage/giảm Phòng." };
export const poisonPassiveStackV2 = { dao: 'poison', id: 'poisonPassiveStack', name: "Độc Tức", cap: 20, durationSeconds: 12, decayEverySeconds: 1, carryAcrossHuntKill: true, summary: 'Passive 1 mở stack này; giết quái không reset, nhận stack mới refresh duration, hết duration mới decay dần.' };
export const poisonPassivesV2 = [
  {
    "id": "passive.v2.poison.p1",
    "dao": "poison",
    "name": "Độc Tức Quyết",
    "realm": "mundane",
    "summary": "Mỗi ba real root ứng dụng Độc nhận một Độc Tức; Secondary quan sát landed root.",
    "lv1": "Không generic damage/Xuyên.",
    "lv20": "Không generic damage/Xuyên.",
    "secondaryEligible": true
  },
  {
    "id": "passive.v2.poison.p2",
    "dao": "poison",
    "name": "Dưỡng Độc Chân Kinh",
    "realm": "spirit",
    "summary": "Tối đa một roll thêm tầng trên eligible root.",
    "lv1": "8% xác suất.",
    "lv20": "25% xác suất.",
    "secondaryEligible": true
  },
  {
    "id": "passive.v2.poison.p3",
    "dao": "poison",
    "name": "Độc Tức Trường Tồn",
    "realm": "mystic",
    "summary": "Hold và decay.",
    "lv1": "+2s hold.",
    "lv20": "+8s hold; decay mỗi 2s.",
    "secondaryEligible": true
  },
  {
    "id": "passive.v2.poison.p4",
    "dao": "poison",
    "name": "Thực Cốt Chi Độc",
    "realm": "earth",
    "summary": "Đủ mười Độc Tức kéo dài packet DoT hữu hạn.",
    "lv1": "Thêm một tick; Secondary chỉ hỗ trợ DoT thật.",
    "lv20": "Thêm một tick; không giảm Phòng.",
    "secondaryEligible": true
  },
  {
    "id": "passive.v2.poison.p5",
    "dao": "poison",
    "name": "Vạn Độc Vô Cực",
    "realm": "heaven",
    "summary": "Tăng cap.",
    "lv1": "+2 cap.",
    "lv20": "+10 cap.",
    "secondaryEligible": true
  },
  {
    "id": "passive.v2.poison.p6",
    "dao": "poison",
    "name": "Độc Sát Nhập Cốt",
    "realm": "immortal",
    "summary": "Mỗi mười Độc Tức tăng riêng DoT.",
    "lv1": "+4% mỗi nhóm10.",
    "lv20": "+12% mỗi nhóm10.",
    "secondaryEligible": true
  },
  {
    "id": "passive.v2.poison.p7",
    "dao": "poison",
    "name": "Phệ Tâm Chân Ý",
    "realm": "extreme",
    "summary": "Main-only: đủ20Độc Tức tăng chất lượng full Công Tâm payoff.",
    "lv1": "+4% full payoff.",
    "lv20": "+10% full payoff; không Secondary core.",
    "secondaryEligible": false
  },
  {
    "id": "passive.v2.poison.p8",
    "dao": "poison",
    "name": "Độc Tức Bất Diệt",
    "realm": "breaker",
    "summary": "Main-only: real transition Công Tâm ở cap kéo dài peak hold.",
    "lv1": "Hold tối thiểu thêm1s.",
    "lv20": "Hold tối thiểu thêm2s; không Nộ/read refresh.",
    "secondaryEligible": false
  }
];
export const poisonSkillMasteryV2 = ['basic','bone','heart','insects','mist','transform','guard','consume','calamity','ultimate'].map(suffix=>{ const skillId='skill.dao.poison.'+suffix; return {dao:'poison',skillId,milestones:Object.fromEntries(poisonSkillGrowthProfileV1({id:skillId},0).milestones.map(x=>[x.at,x.summary]))}; });
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