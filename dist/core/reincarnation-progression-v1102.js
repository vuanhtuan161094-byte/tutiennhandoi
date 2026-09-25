// Luân Hồi V4 — Mệnh Cách là lựa chọn build, không phải gacha/reroll.
// Mỗi Mệnh Lộ đi tuần tự Phàm → Linh → Huyền → Thiên → Tiên; người chơi có thể mở nhiều lộ,
// nhưng mỗi đời chỉ kích hoạt một Mệnh chính. Không có currency riêng: mọi unlock dùng RP.

export const FATE_V4_TIERS = ['mortal', 'spirit', 'mystic', 'heaven', 'immortal'];
export const FATE_V4_TIER_NAMES = {
  mortal: 'Phàm Mệnh', spirit: 'Linh Mệnh', mystic: 'Huyền Mệnh', heaven: 'Thiên Mệnh', immortal: 'Tiên Mệnh',
};

// Một Mệnh Lộ hoàn chỉnh tốn 62.000 RP; 5 lộ = 310.000 RP, cùng cỡ nhánh Tu Luyện R3 (294.500 RP).
// Phàm Mệnh là lựa chọn nền miễn phí để đời đầu đã có quyền chọn build, không phải roll.
export const FATE_V4_UNLOCK_COST_BY_TIER = {
  mortal: 0,
  spirit: 3_000,
  mystic: 9_000,
  heaven: 18_000,
  immortal: 32_000,
};

const fateV4Node = (pathId, pathName, tier, order, id, name, summary, modifiers, passive) => ({
  id,
  pathId,
  pathName,
  tier,
  tierName: FATE_V4_TIER_NAMES[tier],
  order,
  name,
  summary,
  modifiers: { ...modifiers },
  passive: passive ? { ...passive } : undefined,
  unlockCostRp: FATE_V4_UNLOCK_COST_BY_TIER[tier],
  prerequisiteId: order > 0 ? null : undefined,
});

const fateV4Cultivation = [
  fateV4Node('cultivation','Tu Mệnh','mortal',0,'fate.v4.cultivation.diligent','Cần Tu','Đời này thiên về tốc độ tu hành.',{ selfCultivationPct:5 }),
  fateV4Node('cultivation','Tu Mệnh','spirit',1,'fate.v4.cultivation.spirit_mind','Linh Tâm','Tự Tu và Bế Quan đồng thời hiệu quả hơn.',{ selfCultivationPct:8, retreatPct:5 }),
  fateV4Node('cultivation','Tu Mệnh','mystic',2,'fate.v4.cultivation.clear_dao_heart','Đạo Tâm Thông Minh','Tu hành nhanh và khi nhập đại cảnh mới có một nhịp tăng tốc ngắn.',{ selfCultivationPct:12, retreatPct:8 },{ id:'major_realm_burst', name:'Đại Cảnh Khai Ngộ', description:'Lần đầu bước vào một đại cảnh trong đời: Tự Tu +10% trong 30 phút thực.' }),
  fateV4Node('cultivation','Tu Mệnh','heaven',3,'fate.v4.cultivation.dao_affinity','Đại Đạo Thân Hòa','Đạo vận theo sát quá trình phá cảnh.',{ selfCultivationPct:16, retreatPct:10 },{ id:'dao_rhythm', name:'Đạo Vận', description:'Lần đầu bước vào đại cảnh mới: Tự Tu +15% cho tới khi vượt thêm một tiểu cảnh.' }),
  fateV4Node('cultivation','Tu Mệnh','immortal',4,'fate.v4.cultivation.destined_dao_child','Thiên Mệnh Đạo Tử','Build chuyên phá kỷ lục cảnh giới.',{ selfCultivationPct:22, retreatPct:15 },{ id:'record_heaven_blessing', name:'Thiên Đạo Gia Thân', description:'Lần đầu mỗi đời phá kỷ lục đại cảnh: Tự Tu +25% trong đại cảnh mới.' }),
];

const fateV4Combat = [
  fateV4Node('combat','Chiến Mệnh','mortal',0,'fate.v4.combat.fighter','Thiện Chiến','Tăng sức chiến đấu trực tiếp.',{ damagePct:4 }),
  fateV4Node('combat','Chiến Mệnh','spirit',1,'fate.v4.combat.hundred_battles','Bách Chiến','Thiên về PvE và Boss.',{ damagePct:7, bossDamagePct:3 }),
  fateV4Node('combat','Chiến Mệnh','mystic',2,'fate.v4.combat.slaying_heart','Sát Phạt Chi Tâm','Boss đời này càng đánh càng thuận tay.',{ damagePct:10, bossDamagePct:5 },{ id:'next_boss_momentum', name:'Sát Ý Dư Uy', description:'Sau khi hạ Boss, trận Boss hợp lệ kế tiếp trong ngày nhận thêm +5% Damage.' }),
  fateV4Node('combat','Chiến Mệnh','heaven',3,'fate.v4.combat.war_immortal_reborn','Chiến Tiên Chuyển Thế','Kết liễu mục tiêu lớn càng lúc càng mạnh.',{ damagePct:14, bossDamagePct:8 },{ id:'execute_pressure', name:'Chiến Thế', description:'HP Boss càng thấp, Damage tăng dần; tối đa +10% khi Boss gần cạn HP.' }),
  fateV4Node('combat','Chiến Mệnh','immortal',4,'fate.v4.combat.eternal_war_immortal','Vạn Cổ Chiến Tiên','Build Boss/push chiến đấu của một đời.',{ damagePct:20, bossDamagePct:12 },{ id:'life_war_intent', name:'Chiến Ý Nhất Kiếp', description:'Mỗi Boss First Clear trong đời +1 Chiến Ý, tối đa 5; mỗi tầng +2% Boss Damage. Tọa Hóa reset.' }),
];

const fateV4Body = [
  fateV4Node('body','Thể Mệnh','mortal',0,'fate.v4.body.strong_body','Cường Thân','Tăng sức sống nền.',{ maxHpPct:6 }),
  fateV4Node('body','Thể Mệnh','spirit',1,'fate.v4.body.diamond_bone','Kim Cang Cốt','Tăng HP và Phòng.',{ maxHpPct:10, defensePct:5 }),
  fateV4Node('body','Thể Mệnh','mystic',2,'fate.v4.body.unyielding','Bất Khuất Chi Thể','Càng nguy cấp càng khó bị hạ.',{ maxHpPct:15, defensePct:8 },{ id:'low_hp_guard', name:'Bất Khuất', description:'Khi HP dưới 30%, nhận thêm một lượng Giảm Sát Thương nhỏ; không cộng chồng nhiều tầng.' }),
  fateV4Node('body','Thể Mệnh','heaven',3,'fate.v4.body.undying_fate','Bất Diệt Chi Mệnh','Build phòng thủ cao cấp.',{ maxHpPct:20, defensePct:10, damageReductionPct:3 }),
  fateV4Node('body','Thể Mệnh','immortal',4,'fate.v4.body.myriad_tribulation_undying','Vạn Kiếp Bất Diệt','Chống burst và sống sót qua Boss khó.',{ maxHpPct:28, damageReductionPct:6 },{ id:'once_per_battle_shield', name:'Bất Diệt Hộ Mệnh', description:'Mỗi trận một lần, khi HP xuống 20% tạo Khiên lớn theo Max HP.' }),
];

const fateV4Wealth = [
  fateV4Node('wealth','Tài Mệnh','mortal',0,'fate.v4.wealth.small_fortune','Tiểu Tài','Tăng Linh Thạch nhận được.',{ spiritStoneGainPct:5 }),
  fateV4Node('wealth','Tài Mệnh','spirit',1,'fate.v4.wealth.gather_wealth','Tụ Tài','Tăng Linh Thạch nhận được.',{ spiritStoneGainPct:8 }),
  fateV4Node('wealth','Tài Mệnh','mystic',2,'fate.v4.wealth.prosperous','Tài Vận Hanh Thông','Một đời thiên về tích lũy Linh Thạch.',{ spiritStoneGainPct:12 },{ id:'daily_large_income_bonus', name:'Tài Vận', description:'Mỗi ngày, nguồn Linh Thạch hợp lệ lớn đầu tiên nhận thêm +20%.' }),
  fateV4Node('wealth','Tài Mệnh','heaven',3,'fate.v4.wealth.wealth_star','Tài Tinh Chiếu Mệnh','Tăng mạnh Linh Thạch toàn đời.',{ spiritStoneGainPct:18 }),
  fateV4Node('wealth','Tài Mệnh','immortal',4,'fate.v4.wealth.treasure_destiny','Tụ Bảo Thiên Mệnh','Build kinh tế Linh Thạch cao cấp.',{ spiritStoneGainPct:25 },{ id:'daily_double_income', name:'Bạo Tài', description:'Mỗi ngày một lần, một nguồn Linh Thạch hợp lệ được nhân ×2.' }),
];

const fateV4Idle = [
  fateV4Node('idle','Nhàn Mệnh','mortal',0,'fate.v4.idle.idle_cultivator','Nhàn Tu','Thiên về Tự Tu khi offline.',{ offlineSelfCultivationPct:5 }),
  fateV4Node('idle','Nhàn Mệnh','spirit',1,'fate.v4.idle.free_cloud','Nhàn Vân','Tăng hiệu quả thu hoạch offline.',{ offlineRewardPct:8 }),
  fateV4Node('idle','Nhàn Mệnh','mystic',2,'fate.v4.idle.great_dream','Đại Mộng Tu Sĩ','Offline dài bắt đầu có lợi thế riêng.',{ offlineRewardPct:12 },{ id:'long_offline_tail', name:'Đại Mộng', description:'Khi offline đủ 4 giờ, phần cuối phiên offline nhận thêm hiệu suất; luôn tuân theo offline cap của hệ nguồn.' }),
  fateV4Node('idle','Nhàn Mệnh','heaven',3,'fate.v4.idle.wandering_immortal','Nhàn Vân Dã Hạc','Build idle/offline cao cấp.',{ offlineRewardPct:18 }),
  fateV4Node('idle','Nhàn Mệnh','immortal',4,'fate.v4.idle.great_dream_immortal','Đại Mộng Tiên Nhân','Tối ưu đời chơi nhàn.',{ offlineRewardPct:25 },{ id:'great_dream_harvest', name:'Đại Mộng Thu Hoạch', description:'Phiên offline đủ dài nhận thêm một khoản Đại Mộng Thu Hoạch có cap; không nhân vô hạn với chính nó.' }),
];

const fateV4Raw = [...fateV4Cultivation, ...fateV4Combat, ...fateV4Body, ...fateV4Wealth, ...fateV4Idle];
for (const path of ['cultivation','combat','body','wealth','idle']) {
  const ordered = fateV4Raw.filter(x=>x.pathId===path).sort((a,b)=>a.order-b.order);
  for (let i=1;i<ordered.length;i++) ordered[i].prerequisiteId = ordered[i-1].id;
}

export const FATE_BUILD_DEFINITIONS_V4 = Object.freeze(fateV4Raw.map(x=>Object.freeze({ ...x, modifiers:Object.freeze({ ...x.modifiers }), passive:x.passive?Object.freeze({ ...x.passive }):undefined })));
export const FATE_BUILD_BY_ID_V4 = new Map(FATE_BUILD_DEFINITIONS_V4.map(x=>[x.id,x]));
export const FATE_BUILD_PATHS_V4 = Object.freeze(['cultivation','combat','body','wealth','idle'].map(pathId=>{
  const nodes=FATE_BUILD_DEFINITIONS_V4.filter(x=>x.pathId===pathId).sort((a,b)=>a.order-b.order);
  return Object.freeze({ id:pathId, name:nodes[0].pathName, nodes:Object.freeze(nodes) });
}));
export const FATE_BUILD_TOTAL_UNLOCK_COST_V4 = FATE_BUILD_DEFINITIONS_V4.reduce((s,x)=>s+x.unlockCostRp,0);

const fateV4StarterIds = () => FATE_BUILD_DEFINITIONS_V4.filter(x=>x.tier==='mortal').map(x=>x.id);
export function createFateBuildStateV4(){ return { version:4, unlockedIds:fateV4StarterIds(), activeFateId:'fate.v4.cultivation.diligent' }; }
export function cloneFateBuildStateV4(value){
  const known=new Set((value?.unlockedIds??[]).filter(id=>FATE_BUILD_BY_ID_V4.has(id)));
  for(const id of fateV4StarterIds()) known.add(id);
  const requested=FATE_BUILD_BY_ID_V4.has(value?.activeFateId)?value.activeFateId:'fate.v4.cultivation.diligent';
  const activeFateId=known.has(requested)?requested:'fate.v4.cultivation.diligent';
  return { version:4, unlockedIds:[...known], activeFateId };
}
export function fateBuildDefinitionV4(id){ const def=FATE_BUILD_BY_ID_V4.get(id); if(!def) throw new Error(`Mệnh Cách V4 không tồn tại: ${id}`); return def; }
export function fateBuildUnlockPreviewV4(state,id){
  const next=cloneFateBuildStateV4(state),def=fateBuildDefinitionV4(id),unlocked=new Set(next.unlockedIds);
  if(unlocked.has(id)) return { unlocked:true, costRp:0, eligible:true, reason:'Đã mở khóa.' };
  const prerequisiteOk=!def.prerequisiteId||unlocked.has(def.prerequisiteId);
  return { unlocked:false, costRp:def.unlockCostRp, eligible:prerequisiteOk, reason:prerequisiteOk?undefined:`Cần mở ${fateBuildDefinitionV4(def.prerequisiteId).name} trước.` };
}
export function unlockFateBuildV4(state,id,availableRp){
  const next=cloneFateBuildStateV4(state),preview=fateBuildUnlockPreviewV4(next,id);
  if(preview.unlocked) return { state:next, spentRp:0 };
  if(!preview.eligible) throw new Error(preview.reason);
  if(Math.max(0,Math.floor(Number(availableRp)||0))<preview.costRp) throw new Error(`Không đủ Điểm Luân Hồi: cần ${preview.costRp}.`);
  next.unlockedIds.push(id);
  return { state:next, spentRp:preview.costRp };
}
export function selectActiveFateBuildV4(state,id){
  const next=cloneFateBuildStateV4(state);
  if(!next.unlockedIds.includes(id)) throw new Error(`Mệnh Cách chưa mở khóa: ${fateBuildDefinitionV4(id).name}.`);
  next.activeFateId=id;
  return next;
}
export function activeFateBuildV4(state){ const next=cloneFateBuildStateV4(state); return fateBuildDefinitionV4(next.activeFateId); }
export function activeFateBuildModifiersV4(state){ return { ...activeFateBuildV4(state).modifiers }; }
export function fateBuildModifiersForIdV4(id){ return { ...fateBuildDefinitionV4(id).modifiers }; }
export function applyFateSpiritStoneGainV4(amount,modifiers={}){ const base=Math.max(0,Math.floor(Number(amount)||0)),pct=Math.max(0,Number(modifiers?.spiritStoneGainPct)||0); return Math.max(0,Math.round(base*(1+pct/100))); }

export const REINCARNATION_ENERGY_CAP = 300;
export const REINCARNATION_ENERGY_RECHARGE_PER_24H = 100;
export const REINCARNATION_TRIAL_DURATION_SECONDS = 60;
export const REINCARNATION_TREE_MAX_RANK_V127 = 50; // Công Pháp compatibility tree still uses 50 ranks.
export const REINCARNATION_CULTIVATION_TREE_MAX_RANK_R3 = 20;
export const REINCARNATION_TREE_MAX_TOTAL_COST_V127 = 1_533_870; // 532,000 Gốc Luân Hồi V4 + 294,500 Tu Luyện R3 + 707,370 Công Pháp.
export const REINCARNATION_PERMANENT_POTENTIAL_BASE_PCT_V127 = 3;
export const REINCARNATION_PERMANENT_POTENTIAL_MAX_PCT_V127 = 10;
export const REINCARNATION_TRIAL_MAX_BONUS_PCT_V127 = 120;

export const CORE_POTENTIAL_AXIS_VERSION_V5 = 5;
export const CORE_POTENTIAL_AXIS_IDS_V5 = Object.freeze(['power','body','agility','spirit','sense']);
export const corePotentialDefinitions = [
  { id: 'power', name: 'Công Lực', description: 'Nguồn công kích gốc; không tự sinh Bạo Kích/Bạo Thương.', perPoint: ['Công Lực +1'] },
  { id: 'body', name: 'Thể Phách', description: 'Tăng sinh tồn gốc và Phòng Ngự dẫn xuất.', perPoint: ['Thể Phách +1', 'Sinh Mệnh chuẩn +20', 'Phòng Ngự +1'] },
  { id: 'agility', name: 'Thân Pháp', description: 'Tăng Mobility cho đối kháng Né; không tăng Tốc Độ Hành Động.', perPoint: ['Thân Pháp +1', 'Mobility +1'] },
  { id: 'spirit', name: 'Linh Lực', description: 'Tăng dung lượng Chân Nguyên; không tự tăng hồi/CDR/hiệu suất.', perPoint: ['Linh Lực +1', 'Chân Nguyên tối đa +1'] },
  { id: 'sense', name: 'Thần Thức', description: 'Tăng Chính Xác, Khống Chế và Định Lực.', perPoint: ['Thần Thức +1', 'Chính Xác +1', 'Khống Chế +1', 'Định Lực +1'] },
];

// R3/V4: các node 20 cấp dùng cùng cost curve nặng; người chơi có thể đầu tư nhiều nhánh.
export const REINCARNATION_TREE_TIER_INVESTMENT = [0];
export const REINCARNATION_RANK_COSTS = Array.from({ length: 50 }, (_, i) => {
  const r = i + 1;
  return r <= 10 ? 50 : r <= 20 ? 150 : r <= 30 ? 400 : r <= 40 ? 1000 : 2500;
});
export const REINCARNATION_COST_CLASS_MULTIPLIER = { normal: 1, high: 1.25, rare: 1.5, core: 2, special: 2 };

const MAJOR_REALMS_V127 = [
  ['mortal','Phàm Nhân',0,50], ['qi','Luyện Khí',1,100], ['foundation','Trúc Cơ',10,180], ['purple','Tử Phủ',14,280],
  ['golden','Kim Đan',18,420], ['nascent','Nguyên Anh',22,650], ['spirit','Hóa Thần',26,950], ['void','Luyện Hư',30,1300],
  ['union','Hợp Thể',34,1750], ['mahayana','Đại Thừa',38,2300], ['tribulation','Độ Kiếp',42,3000], ['human_immortal','Nhân Tiên',46,3900],
  ['earth_immortal','Địa Tiên',50,5000], ['heaven_immortal','Thiên Tiên',54,6300], ['true_immortal','Chân Tiên',58,7800], ['mystic_immortal','Huyền Tiên',62,9500],
  ['gold_immortal','Kim Tiên',66,11500], ['taiyi','Thái Ất',70,13800], ['daluo','Đại La',74,16400], ['immortal_king','Tiên Vương',78,19300],
  ['immortal_emperor','Tiên Đế',82,22500], ['extreme','Cực Hạn',86,26000], ['true_extreme','Cực Đạo',90,30000], ['chaos','Hỗn Độn',94,34500],
  ['primordial','Hồng Mông',98,39500], ['heaven_opening','Khai Thiên',102,45000], ['world_lord','Thế Giới Chủ',106,51000], ['eternity','Vĩnh Sinh',110,57500],
  ['creation','Sáng Thế Chủ',114,65000],
].map((x,index)=>({ id:x[0], name:x[1], startOrder:x[2], reincarnationPoints:x[3], index }));
for (let i=0;i<MAJOR_REALMS_V127.length;i++) MAJOR_REALMS_V127[i].endOrder = i+1<MAJOR_REALMS_V127.length ? MAJOR_REALMS_V127[i+1].startOrder-1 : 117;
export const REINCARNATION_DEPTH_CONFIG = MAJOR_REALMS_V127.map((x,i)=>({ ...x, energyCost: Math.max(12, 60-Math.floor(i*48/28)) }));
export const REINCARNATION_STAGE_REWARD_SCALE = [1];

const n = (id, treeId, order, name, description, costClass, modifierKey, maxValue, prerequisites=[], additionalModifiers=[]) => ({
  id, treeId, tier: Math.floor(order/4), order, name, description, maxRank: 50, costClass, modifierKey,
  perRank: maxValue/50, milestoneBonus: {}, prerequisites,
  additionalModifiers: additionalModifiers.map(x => ({ ...x, perRank: x.maxValue/50 })),
});
const c = (id, order, name, description, costClass, modifierKey, maxValue, milestones={}) => ({
  id, treeId:'cultivation', tier:0, order, name, description, maxRank:20, costClass, modifierKey,
  perRank:maxValue/20, milestoneBonus:milestones, prerequisites:[], additionalModifiers:[],
});
const r = (id, order, name, description, costClass, modifierKey, maxValue, milestones={}, costScale=1) => ({
  id, treeId:'reincarnation', tier:0, order, name, description, maxRank:20, costClass, costScale, modifierKey,
  perRank:maxValue/20, milestoneBonus:milestones, prerequisites:[], additionalModifiers:[],
});

export const reincarnationTreeNodesV136 = [
  // GỐC LUÂN HỒI V4 — Phase 1. Không khóa chéo; mỗi node 20 cấp và dùng cost curve nặng như Tu Luyện R3.
  r('reincarnation.permanent_potential',0,'Căn Cơ Bất Diệt','Tăng tỷ lệ Điểm Tiềm Năng Đời được chuyển thành Điểm Tiềm Năng Vĩnh Viễn khi Luân Hồi: nền 3%, tối đa 10%.','core','cultivation.permanentPotentialBonusPct',7,{5:'4,75%',10:'6,5%',15:'8,25%',20:'10%'},4),
  r('reincarnation.life_potential',1,'Tiềm Mạch Khai Thiên','Tăng Điểm Tiềm Năng Đời nhận từ các mốc cảnh giới; áp dụng ngay khi mốc mới được ghi nhận trong đời.','high','cultivation.lifePotentialGainPct',25,{5:'+6,25%',10:'+12,5%',15:'+18,75%',20:'+25%'},4),
  r('reincarnation.energy_efficiency',2,'Luân Hồi Dư Lực','Giảm Năng Lượng Luân Hồi tiêu hao khi chủ động Tọa Hóa; không thay đổi quy luật cảnh giới càng cao thì giá năng lượng càng thấp.','high','cultivation.reincarnationEnergyCostReductionPct',25,{5:'-6,25%',10:'-12,5%',15:'-18,75%',20:'-25%'},4),
  r('reincarnation.rp_gain',3,'Vạn Thế Tích Lũy','Tăng Điểm Luân Hồi nhận khi chốt một đời. Càng lên cao càng đắt để tránh hoàn vốn quá nhanh ở late-game.','core','reincarnation.rpGainPct',25,{5:'+6,25%',10:'+12,5%',15:'+18,75%',20:'+25%'},5),

  // CÂY LUÂN HỒI — TU LUYỆN R3: 12 node độc lập × 20 cấp.
  c('cultivation.ling_quang',0,'Linh Quang Chợt Hiện','Mỗi tick Tự Tu 15 giây, kể cả offline, có thể nhận Tu Vi ×2 đến ×10. Mốc 5 mở ×3–×4; 10 mở ×5–×6; 15 mở ×7–×8; 20 mở ×9–×10.','rare','cultivation.lingGuangRank',20,{5:'Mở ×3–×4',10:'Mở ×5–×6',15:'Mở ×7–×8',20:'Mở ×9–×10'}),
  c('cultivation.heaven_reward',1,'Thiên Đạo Thù Cần','Tu đủ số tick sẽ chắc chắn nhận một khoản Tu Vi nền, không phụ thuộc may rủi và không nhân chồng với Linh Quang.','high','cultivation.heavenRewardRank',20,{5:'40 phút → +4 tick nền',10:'30 phút → +5 tick nền',15:'25 phút → +6 tick nền',20:'20 phút → +8 tick nền'}),
  c('cultivation.base_gain',2,'Tu Vi Tinh Tiến','Tăng trực tiếp Tu Vi nền của Tự Tu; chỉ áp dụng Tự Tu online/offline, không nhân Đan hoặc Bế Quan.','normal','cultivation.baseGainPct',25,{5:'+6,25%',10:'+12,5%',15:'+18,75%',20:'+25%'}),
  c('cultivation.major_requirement',3,'Đạo Lộ Thông Huyền','Giảm Tu Vi cần tích ở cửa Thăng Cảnh đại cảnh. Hard cap toàn game của nguồn Luân Hồi này là 5%.','rare','cultivation.majorBreakthroughRequirementReductionPct',5,{5:'-1,25%',10:'-2,5%',15:'-3,75%',20:'-5%'}),
  c('cultivation.retrain',4,'Trọng Tu Cựu Cảnh','Càng thấp hơn kỷ lục các đời trước càng tăng Tu Vi Tự Tu. Khi bắt kịp kỷ lục, bonus biến mất.','high','cultivation.retrainRank',20,{5:'+3%/đại cảnh, cap 15%',10:'+5%/đại cảnh, cap 30%',15:'+7%/đại cảnh, cap 50%',20:'+10%/đại cảnh, cap 80%'}),
  c('cultivation.skip_old_stage',5,'Một Niệm Vượt Cảnh','Khi tự động thăng một tiểu cảnh đã từng vượt, có xác suất đi thêm ngay 1 tiểu cảnh cũ. Không vượt đại cảnh/Thiên Kiếp và không proc dây chuyền.','rare','cultivation.skipOldStageChancePct',5,{5:'1%',10:'2%',15:'3,5%',20:'5%'}),
  c('cultivation.retreat_insight',6,'Bế Quan Ngộ Đạo','Mỗi giờ Bế Quan có thể Tiểu Ngộ, Đại Ngộ hoặc Đại Đốn Ngộ; chỉ lấy kết quả cao nhất cho giờ đó.','high','cultivation.retreatInsightRank',20,{5:'Mở Tiểu Ngộ',10:'Mở Đại Ngộ',15:'Mở Đại Đốn Ngộ',20:'18% ×1,25 · 6% ×1,5 · 1% ×2'}),
  c('cultivation.retreat_refund',7,'Bế Quan Tàng Thời','Mỗi giờ Bế Quan có cơ hội hoàn lại một phần thời gian vào bank. Tối đa hoàn 1 giờ/ngày; luật +3h/ngày và bank 9h không đổi.','high','cultivation.retreatRefundRank',20,{5:'5% hoàn 15 phút',10:'10% hoàn 15 phút',15:'15% hoàn 30 phút',20:'20% hoàn 30 phút'}),
  c('cultivation.major_momentum',8,'Dư Thế Thăng Cảnh','Sau khi bước sang đại cảnh mới, cảnh mới bắt đầu với một phần Tu Vi đã tích sẵn.','high','cultivation.majorMomentumPct',20,{5:'5%',10:'10%',15:'15%',20:'20%'}),
  c('cultivation.new_record',9,'Tân Cảnh Khai Ngộ','Khi đang ở vùng cảnh giới cao hơn mọi đời trước, tăng Tu Vi Tự Tu để khuyến khích phá kỷ lục.','high','cultivation.newRecordGainPct',20,{5:'+5%',10:'+10%',15:'+15%',20:'+20%'}),
  c('cultivation.tribulation_temper',10,'Kiếp Lôi Luyện Đạo','Mỗi Thiên Kiếp vượt thành công trong đời hiện tại tăng Tu Vi nền cho phần còn lại của đời đó; tối đa 5 tầng, Luân Hồi thì tích lại.','high','cultivation.tribulationTemperPctPerStack',3,{5:'+0,75%/Kiếp',10:'+1,5%/Kiếp',15:'+2,25%/Kiếp',20:'+3%/Kiếp'}),
  c('cultivation.perfect_stage',11,'Viên Mãn Tụ Linh','Tăng Tu Vi Tự Tu khi đang ở tiểu cảnh cuối của một đại cảnh, giúp đoạn tích Tu Vi trước Thăng Cảnh bớt ì.','high','cultivation.perfectStageGainPct',40,{5:'+10%',10:'+20%',15:'+30%',20:'+40%'}),

  // CÂY CÔNG PHÁP — 13 nhánh
  n('manual.cultivation','manual',0,'Kinh Khí Tương Sinh','Tăng riêng Tu Vi do Công Pháp tạo ra; không nhân Tu Vi nền cảnh giới.','normal','manual.cultivationGainPct',100),
  n('manual.offense_base','manual',1,'Công Phạt Chân Giải','Tăng phần Công phẳng và %Công đến từ Công Pháp.','normal','manual.offenseBaseEffectPct',80),
  n('manual.defense_base','manual',2,'Hộ Thể Chân Giải','Tăng phần Thể Phách, HP và Phòng đến từ Công Pháp.','high','manual.defenseBaseEffectPct',80),
  n('manual.offense_secondary','manual',3,'Sát Phạt Huyền Ý','Tăng Bạo Kích/Bạo Thương/Hội Tâm/Hội Tâm Damage/Xuyên/Phá Thế từ Công Pháp.','rare','manual.offenseSecondaryEffectPct',50),
  n('manual.defense_secondary','manual',4,'Hộ Mệnh Huyền Ý','Tăng giảm sát thương/né/kháng khống/hồi phục/khiên từ Công Pháp.','rare','manual.defenseSecondaryEffectPct',50),
  n('manual.milestone','manual',5,'Bách Tầng Cộng Hưởng','Tăng hiệu lực bonus các mốc 100–900; không nhân phần tầng cơ bản.','high','manual.milestoneBonusEffectPct',100),
  n('manual.grand_completion','manual',6,'Đại Viên Mãn Chân Giải','Lv1000 base ×2; mỗi cấp cây +0,02×, tối đa ×3. Cấp 50 mang surcharge 120 điểm để khóa đúng tổng cây canonical.','core','manual.grandCompletionMultiplierBonus',1),
  n('manual.nine_unity','manual',7,'Cửu Kinh Quy Nhất','9/9 Công Pháp một đại cảnh Lv1000: nâng bonus hiệu lực của chính 9 bộ từ +20% lên tối đa +50%.','rare','manual.nineUnityBonusPct',30),
  n('manual.all_scriptures','manual',8,'Vạn Kinh Đồng Quy','Mỗi đại cảnh 9/9 Lv1000: nâng Tu Vi toàn cục từ +2% lên tối đa +3% mỗi đại cảnh hoàn chỉnh.','core','manual.completedRealmCultivationBonusPct',1),
  n('manual.material_saving','manual',9,'Tàn Ý Tiết Dụng','Giảm nguyên liệu thường nâng tầng Công Pháp; không giảm Mảnh Riêng Gacha.','normal','manual.materialCostReductionPct',50),
  n('manual.currency_saving','manual',10,'Kinh Tàng Tiết Dụng','Giảm Linh Thạch/chi phí phụ khi nâng Công Pháp; không giảm Mảnh Riêng Gacha.','normal','manual.currencyCostReductionPct',50),
  n('manual.dungeon_yield','manual',11,'Bí Cảnh Kinh Tàng','Tăng nguyên liệu Công Pháp từ Tàng Kinh Bí Cảnh: first-clear/farm/clone/offline; tuyệt đối không sinh/nhân Mảnh Riêng.','normal','manual.dungeonMaterialGainPct',100),
  n('manual.retrain','manual',12,'Trọng Tu Cựu Kinh','Ở đời sau, Công Pháp thuộc cảnh đã từng vượt hoàn thiện nhanh hơn bằng nguyên liệu thường; Mảnh Riêng mốc 100 vẫn đủ nguyên số.','high','manual.retrainSpeedPct',200),
];
export const starterReincarnationTreeNodes = reincarnationTreeNodesV136;

const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
const emptyCorePotentialAllocationV5 = () => ({ power:0, body:0, agility:0, spirit:0, sense:0 });
const emptyLegacyThreeStatAllocation = () => ({ power:0, body:0, defense:0 });
const nonNegativeIntV5 = value => Math.max(0, Math.floor(Number(value) || 0));
function normalizedFiveAllocationV5(raw){
  const out=emptyCorePotentialAllocationV5();
  for(const key of CORE_POTENTIAL_AXIS_IDS_V5) out[key]=nonNegativeIntV5(raw?.[key]);
  return out;
}
function migratedFiveBudgetV5(value){
  const legacyAlloc=value?.allocations??{};
  const spent=['power','body','defense','agility','spirit','sense'].reduce((sum,key)=>sum+nonNegativeIntV5(legacyAlloc[key]),0);
  const rawUnspent=nonNegativeIntV5(value?.unspent);
  return Math.max(nonNegativeIntV5(value?.lifetimeEarned),spent+rawUnspent);
}
export function clonePermanentCorePotentialStateV5(value){
  if(value?.axisVersion===CORE_POTENTIAL_AXIS_VERSION_V5){
    const allocations=normalizedFiveAllocationV5(value?.allocations);
    const spent=CORE_POTENTIAL_AXIS_IDS_V5.reduce((sum,key)=>sum+allocations[key],0);
    const lifetimeEarned=Math.max(nonNegativeIntV5(value?.lifetimeEarned),spent+nonNegativeIntV5(value?.unspent));
    return { axisVersion:CORE_POTENTIAL_AXIS_VERSION_V5, unspent:Math.max(0,lifetimeEarned-spent), lifetimeEarned, allocations };
  }
  const lifetimeEarned=migratedFiveBudgetV5(value);
  return { axisVersion:CORE_POTENTIAL_AXIS_VERSION_V5, unspent:lifetimeEarned, lifetimeEarned, allocations:emptyCorePotentialAllocationV5() };
}
const NEW_NODE_IDS = new Set(reincarnationTreeNodesV136.map(x=>x.id));
export const REINCARNATION_TREE_RUNTIME_ORIGIN_PREFIX_V136 = 'reincarnation.tree.v127.';
const TREE_RUNTIME_KEYS_V136 = [...new Set(reincarnationTreeNodesV136.flatMap(x=>[x.modifierKey,...(x.additionalModifiers??[]).map(m=>m.modifierKey)]))];
export function reincarnationTreeRuntimeOriginKeyV136(key){ return `${REINCARNATION_TREE_RUNTIME_ORIGIN_PREFIX_V136}${key}`; }
export function syncReincarnationTreeRuntimeOriginsV136(origins,tree){ for(const key of TREE_RUNTIME_KEYS_V136) origins[reincarnationTreeRuntimeOriginKeyV136(key)] = nodeModifierValue(tree,key,reincarnationTreeNodesV136); }
export function reincarnationTreeRuntimeModifierV136(origins,key){ return Math.max(0,Number(origins?.[reincarnationTreeRuntimeOriginKeyV136(key)]??0)||0); }

export function createLifeCorePotentialState(){ return { axisVersion:CORE_POTENTIAL_AXIS_VERSION_V5, unspent:0, lifetimeEarned:0, allocations:emptyCorePotentialAllocationV5(), awardedMilestones:[] }; }
export function cloneLifeCorePotentialState(value){
  const awardedMilestones=[...new Set(value?.awardedMilestones??[])];
  if(value?.axisVersion===CORE_POTENTIAL_AXIS_VERSION_V5){
    const allocations=normalizedFiveAllocationV5(value?.allocations);
    const spent=CORE_POTENTIAL_AXIS_IDS_V5.reduce((sum,key)=>sum+allocations[key],0);
    const lifetimeEarned=Math.max(nonNegativeIntV5(value?.lifetimeEarned),spent+nonNegativeIntV5(value?.unspent));
    return { axisVersion:CORE_POTENTIAL_AXIS_VERSION_V5, unspent:Math.max(0,lifetimeEarned-spent), lifetimeEarned, allocations, awardedMilestones };
  }
  const lifetimeEarned=migratedFiveBudgetV5(value);
  return { axisVersion:CORE_POTENTIAL_AXIS_VERSION_V5, unspent:lifetimeEarned, lifetimeEarned, allocations:emptyCorePotentialAllocationV5(), awardedMilestones };
}
export function createReincarnationProgressStateV1102(nowUnixMs=0){ return { energy:{current:REINCARNATION_ENERGY_CAP,lastUpdatedUnixMs:nowUnixMs}, permanentPotential:clonePermanentCorePotentialStateV5(), alchemyPermanentStats:emptyLegacyThreeStatAllocation(), alchemyLegacy:{highestRank:1,highestTurn:1,bestMasteryByRecipe:{},knownRecipeIds:[]}, tree:{lifetimePointsEarned:0,sharedSpentPoints:0,ranks:{},highestAchievementTierByTree:{},cultivationR3:true}, fateBuild:createFateBuildStateV4(), highestRealmOrderV4:0, bestCombatPowerByRealmOrderV4:{}, rewardHistory:[] }; }
export function cloneReincarnationProgressStateV1102(value,nowUnixMs=0){
  const base=createReincarnationProgressStateV1102(nowUnixMs), permanentPotential=clonePermanentCorePotentialStateV5(value?.permanentPotential);
const rawRanks={...(value?.tree?.ranks??{})};
  const isR3=value?.tree?.cultivationR3===true;
  const ranks={};
  for(const [id,raw] of Object.entries(rawRanks)){
    const def=reincarnationTreeNodesV136.find(x=>x.id===id);
    if(!def) continue;
    // Existing Công Pháp investment is preserved. Old Tu Luyện nodes are refunded once by dropping their ranks while retaining lifetimePointsEarned.
    if(!isR3 && id.startsWith('cultivation.')) continue;
    ranks[id]=clamp(Math.floor(Number(raw)||0),0,def.maxRank);
  }
  const pending=value?.pendingTrial?{...value.pendingTrial,offenseBest:value.pendingTrial.offenseBest?{...value.pendingTrial.offenseBest}:undefined,survivalBest:value.pendingTrial.survivalBest?{...value.pendingTrial.survivalBest}:undefined,finalizedReward:value.pendingTrial.finalizedReward?{...value.pendingTrial.finalizedReward}:undefined}:undefined;
  return { energy:{current:clamp(Number(value?.energy?.current??base.energy.current)||0,0,REINCARNATION_ENERGY_CAP),lastUpdatedUnixMs:Math.max(0,Math.floor(Number(value?.energy?.lastUpdatedUnixMs??nowUnixMs)))}, permanentPotential, alchemyPermanentStats:{...emptyLegacyThreeStatAllocation(),...(value?.alchemyPermanentStats??{})}, alchemyLegacy:{highestRank:Math.max(1,Math.min(9,Math.floor(Number(value?.alchemyLegacy?.highestRank)||1))),highestTurn:Math.max(1,Math.min(9,Math.floor(Number(value?.alchemyLegacy?.highestTurn)||1))),bestMasteryByRecipe:{...(value?.alchemyLegacy?.bestMasteryByRecipe??{})},knownRecipeIds:[...new Set(value?.alchemyLegacy?.knownRecipeIds??[])]}, tree:{lifetimePointsEarned:Math.max(0,Math.floor(Number(value?.tree?.lifetimePointsEarned)||0)),sharedSpentPoints:Math.max(0,Math.floor(Number(value?.tree?.sharedSpentPoints)||0)),ranks,highestAchievementTierByTree:{...(value?.tree?.highestAchievementTierByTree??{})},cultivationR3:true}, fateBuild:cloneFateBuildStateV4(value?.fateBuild??base.fateBuild), highestRealmOrderV4:clamp(Math.floor(Number(value?.highestRealmOrderV4)||0),0,117), bestCombatPowerByRealmOrderV4:Object.fromEntries(Object.entries(value?.bestCombatPowerByRealmOrderV4??{}).map(([k,v])=>[String(clamp(Math.floor(Number(k)||0),0,117)),Math.max(0,Number(v)||0)])), rewardHistory:(value?.rewardHistory??[]).map(x=>({...x})) };
}

export function depthInfoForRealmOrder(realmOrder){
  const order=clamp(Math.floor(Number(realmOrder)||0),0,117); let index=MAJOR_REALMS_V127.findLastIndex(x=>order>=x.startOrder); if(index<0) index=0; const cfg=REINCARNATION_DEPTH_CONFIG[index];
  return { tierId:cfg.id,tierIndex:index,tierName:cfg.name,stage:order-cfg.startOrder+1,startOrder:cfg.startOrder,endOrder:cfg.endOrder };
}
export function depthConfigForRealmOrder(realmOrder){ return REINCARNATION_DEPTH_CONFIG[depthInfoForRealmOrder(realmOrder).tierIndex]; }
export function lifePotentialGainForRealmOrderV127(order){ const o=clamp(Math.floor(Number(order)||0),0,117); return Math.max(1,Math.round(2+0.1*o+0.0015*o*o)); }
export function lifePotentialMilestonesThroughRealmOrder(realmOrder){ const max=clamp(Math.floor(Number(realmOrder)||0),0,117),out=[]; for(let order=0;order<=max;order++) out.push({key:`realm.${order}`,amount:lifePotentialGainForRealmOrderV127(order),info:depthInfoForRealmOrder(order)}); return out; }
export function ensureLifePotentialForRealm(state,realmOrder,gainPct=0){ const next=cloneLifeCorePotentialState(state),awarded=new Set(next.awardedMilestones); let gain=0; for(const m of lifePotentialMilestonesThroughRealmOrder(realmOrder)){ if(awarded.has(m.key)) continue; awarded.add(m.key); gain+=Math.max(0,Math.round(m.amount*(1+Math.max(-95,gainPct)/100))); } if(gain>0){next.unspent+=gain;next.lifetimeEarned+=gain;} next.awardedMilestones=[...awarded]; return next; }
export function grantLifeCorePotential(state,amount){ const next=cloneLifeCorePotentialState(state),gain=Math.max(0,Math.floor(Number(amount)||0)); if(gain>0){next.unspent+=gain;next.lifetimeEarned+=gain;} return next; }
export function spendLifeCorePotential(state,id,points=1){ if(!CORE_POTENTIAL_AXIS_IDS_V5.includes(id)) throw new Error('Thuộc tính Tiềm Năng không hợp lệ.'); const next=cloneLifeCorePotentialState(state),n=Math.max(1,Math.floor(points)); if(next.unspent<n) throw new Error(`Không đủ Điểm Tiềm Năng Đời: cần ${n}, hiện có ${next.unspent}.`); next.unspent-=n; next.allocations[id]+=n; return next; }
export function spendPermanentCorePotential(state,id,points=1){ if(!CORE_POTENTIAL_AXIS_IDS_V5.includes(id)) throw new Error('Thuộc tính Tiềm Năng không hợp lệ.'); const next=clonePermanentCorePotentialStateV5(state),n=Math.max(1,Math.floor(points)); if(next.unspent<n) throw new Error(`Không đủ Điểm Tiềm Năng Luân Hồi: cần ${n}, hiện có ${next.unspent}.`); next.unspent-=n; next.allocations[id]+=n; return next; }
export const CORE_POTENTIAL_SOFT_CAP_MAX_PCT_V4=35;
export const CORE_POTENTIAL_HALF_SATURATION_V4=4500;
export function corePotentialPercentBonusV4(points){ const p=Math.max(0,Number(points)||0); return CORE_POTENTIAL_SOFT_CAP_MAX_PCT_V4*p/(p+CORE_POTENTIAL_HALF_SATURATION_V4); }
export function applyCorePotentialStats(stats,runtime){
  if(!runtime) return {...stats};
  const life=cloneLifeCorePotentialState(runtime.life).allocations;
  const permanent=normalizedFiveAllocationV5(runtime.permanent);
  const totals=Object.fromEntries(CORE_POTENTIAL_AXIS_IDS_V5.map(key=>[key,life[key]+permanent[key]]));
  const basePhysique=Number.isFinite(stats.physique)?Math.max(0,stats.physique):Math.max(0,(Number(stats.maxHp)||0)/20);
  const legacyPrimary=stats.primaryStatsV5 ?? {
    power:Math.max(0,Number(stats.attack)||0),
    body:basePhysique,
    agility:Math.max(0,Number(stats.mobility)||0),
    spirit:Math.max(0,Number(stats.maxSpirit)||0),
    // Compatibility seed until all old content authors explicit TT: pre-F Accuracy is the closest 1:1 base authority.
    sense:Math.max(0,Number(stats.accuracy)||0),
  };
  const primaryStatsV5={
    power:Math.max(0,(Number(legacyPrimary.power)||0)+totals.power),
    body:Math.max(0,(Number(legacyPrimary.body)||0)+totals.body),
    agility:Math.max(0,(Number(legacyPrimary.agility)||0)+totals.agility),
    spirit:Math.max(0,(Number(legacyPrimary.spirit)||0)+totals.spirit),
    sense:Math.max(0,(Number(legacyPrimary.sense)||0)+totals.sense),
  };
  return {
    ...stats,
    primaryStatsV5,
    attack:Math.max(0,(Number(stats.attack)||0)+totals.power),
    defense:Math.max(0,(Number(stats.defense)||0)+totals.body),
    physique:primaryStatsV5.body,
    maxHp:primaryStatsV5.body*20,
    mobility:Math.max(0,(Number(stats.mobility)||0)+totals.agility),
    maxSpirit:Math.max(0,(Number(stats.maxSpirit)||0)+totals.spirit),
    accuracy:Math.max(0,(Number(stats.accuracy)||0)+totals.sense),
    controlPower:Math.max(0,(Number(stats.controlPower)||0)+totals.sense),
    resolve:Math.max(0,(Number(stats.resolve)||0)+totals.sense),
  };
}

export function rechargeReincarnationEnergy(state,nowUnixMs=Date.now()){ const now=Math.max(state.lastUpdatedUnixMs,Math.floor(nowUnixMs)),elapsed=Math.max(0,now-state.lastUpdatedUnixMs),perMs=REINCARNATION_ENERGY_RECHARGE_PER_24H/(24*60*60*1000); return {current:Math.min(REINCARNATION_ENERGY_CAP,state.current+elapsed*perMs),lastUpdatedUnixMs:now}; }
export function reincarnationEnergyCostForRealmOrder(realmOrder){ return depthConfigForRealmOrder(realmOrder).energyCost; }
export function trialBonusPctForRatio(ratio){ const r=Math.max(0,Number(ratio)||0); if(r<.8)return 0;if(r<1)return 10;if(r<1.25)return 20;if(r<1.5)return 35;if(r<2)return 50;if(r<3)return 65;if(r<4)return 80;if(r<5)return 90;return 100; }
export function combinedTrialBonusPct(offenseBonus,survivalBonus){ const o=clamp(Number(offenseBonus)||0,0,100),s=clamp(Number(survivalBonus)||0,0,100); const synergy=o>=80&&s>=80?20:o>=50&&s>=50?10:0; return Math.min(120,o*.5+s*.5+synergy); }
export function buildTrialResult(kind,measured,benchmark,buildFingerprint,nowUnixMs=Date.now()){ const safe=Math.max(1e-9,benchmark),ratio=Math.max(0,measured)/safe; return {kind,measured:Math.max(0,measured),benchmark:safe,ratio,bonusPct:trialBonusPctForRatio(ratio),durationSeconds:REINCARNATION_TRIAL_DURATION_SECONDS,buildFingerprint,performedAtUnixMs:nowUnixMs}; }
export const REINCARNATION_REALM_RECORD_BONUS_PCT_V4=15;
export function reincarnationStageFactorV4(realmOrder){ const info=depthInfoForRealmOrder(realmOrder),span=Math.max(0,info.endOrder-info.startOrder); return span<=0?1:1+0.30*(Math.max(0,Math.min(span,Math.floor(Number(realmOrder)||0)-info.startOrder))/span); }
export function reincarnationPowerBonusPctV4(power,benchmark){ const b=Math.max(0,Number(benchmark)||0); if(b<=0)return 0; const ratio=Math.max(0,Number(power)||0)/b; return ratio>=5?50:ratio>=3?40:ratio>=2?30:ratio>=1.5?20:ratio>=1.25?10:0; }
export function previewReincarnationV2Reward(args){
  const realmOrder=clamp(Math.floor(Number(args.realmOrder)||0),0,117),info=depthInfoForRealmOrder(realmOrder),cfg=REINCARNATION_DEPTH_CONFIG[info.tierIndex];
  const lifePotential=Math.max(0,Math.floor(Number(args.lifePotentialEarned)||lifePotentialMilestonesThroughRealmOrder(realmOrder).reduce((sum,x)=>sum+x.amount,0)));
  const conversionPct=clamp(Number(args.permanentPotentialConversionPct)||REINCARNATION_PERMANENT_POTENTIAL_BASE_PCT_V127,REINCARNATION_PERMANENT_POTENTIAL_BASE_PCT_V127,REINCARNATION_PERMANENT_POTENTIAL_MAX_PCT_V127);
  const permanentBase=Math.max(0,Math.round(lifePotential*conversionPct/100));
  const energyReduction=clamp(Number(args.energyCostReductionPct)||0,0,25), energyCost=Math.max(1,Math.ceil(cfg.energyCost*(1-energyReduction/100)));
  const rpGainPct=clamp(Number(args.reincarnationPointsGainPct)||0,0,25),stageFactor=reincarnationStageFactorV4(realmOrder);
  const combatPower=Math.max(0,Number(args.combatPower)||0),combatPowerBenchmark=Math.max(0,Number(args.combatPowerBenchmark)||0),powerRatio=combatPowerBenchmark>0?combatPower/combatPowerBenchmark:1;
  const powerBonusPct=reincarnationPowerBonusPctV4(combatPower,combatPowerBenchmark),recordBonusPct=args.isNewRealmRecord?REINCARNATION_REALM_RECORD_BONUS_PCT_V4:0;
  const earned=Math.round(cfg.reincarnationPoints*stageFactor*(1+(powerBonusPct+recordBonusPct)/100)*(1+rpGainPct/100));
  return {lifeId:args.lifeId,realmOrder,depthTier:info.tierId,depthTierIndex:info.tierIndex,depthStage:info.stage,stageFactor,stageProgressPct:Math.round((stageFactor-1)/0.30*1000)/10,reincarnationPoints:earned,reincarnationPointsBase:cfg.reincarnationPoints,combatPower,combatPowerBenchmark,powerRatio,powerBonusPct,recordBonusPct,reincarnationPointsGainPct:rpGainPct,permanentPotentialBase:permanentBase,permanentPotentialConversionPct:conversionPct,permanentPotentialGain:permanentBase,energyCost,energyCostBase:cfg.energyCost,finalizedAtUnixMs:args.nowUnixMs??Date.now()};
}

function baseRankCost(rank){ const r=clamp(Math.floor(rank),1,50); return r<=10?50:r<=20?150:r<=30?400:r<=40?1000:2500; }
const TWENTY_RANK_NODE_IDS=new Set(reincarnationTreeNodesV136.filter(x=>x.maxRank===20).map(x=>x.id));
function twentyRankBaseCost(rank){ const r=clamp(Math.floor(rank),1,20); return r<=5?100:r<=10?300:r<=15?900:2500; }
export function rankCost(rankToBuy,costClass='normal',nodeId='',costScale=1){
  const isTwentyRank=TWENTY_RANK_NODE_IDS.has(nodeId);
  const rank=clamp(Math.floor(rankToBuy),1,isTwentyRank?20:50);
  const base=isTwentyRank?twentyRankBaseCost(rank):baseRankCost(rank);
  let cost;
  if(costClass==='high'){ const raw=base*1.25; cost=rank%2===1?Math.floor(raw):Math.ceil(raw); }
  else cost=Math.round(base*(REINCARNATION_COST_CLASS_MULTIPLIER[costClass]??1));
  if(nodeId==='manual.grand_completion'&&rank===50) cost+=120;
  return Math.round(cost*Math.max(1,Number(costScale)||1));
}
export function nodeSpentPoints(node,rank){ let total=0;for(let r=1;r<=clamp(Math.floor(rank),0,node.maxRank);r++) total+=rankCost(r,node.costClass,node.id,node.costScale??1);return total; }
export function totalTreeSpentPoints(state,treeId,definitions=starterReincarnationTreeNodes){ return definitions.filter(x=>x.treeId===treeId).reduce((sum,node)=>sum+nodeSpentPoints(node,state.ranks[node.id]??0),0); }
export function totalAllTreeSpentPoints(state,definitions=starterReincarnationTreeNodes){ return definitions.reduce((sum,node)=>sum+nodeSpentPoints(node,state.ranks[node.id]??0),0); }
export function totalTreeMaxCostV127(definitions=starterReincarnationTreeNodes){ return definitions.reduce((s,node)=>s+nodeSpentPoints(node,node.maxRank),0); }
export function availableTreePoints(state,definitions=starterReincarnationTreeNodes){ return Math.max(0,state.lifetimePointsEarned-totalAllTreeSpentPoints(state,definitions)-Math.max(0,Math.floor(Number(state.sharedSpentPoints)||0))); }
export function nodeModifierValue(state,modifierKey,definitions=starterReincarnationTreeNodes){ let total=0;for(const node of definitions){const rank=clamp(Math.floor(state?.ranks?.[node.id]??0),0,node.maxRank);if(node.modifierKey===modifierKey)total+=rank*node.perRank;for(const extra of node.additionalModifiers??[])if(extra.modifierKey===modifierKey)total+=rank*extra.perRank;}return total; }
export function permanentPotentialConversionPctV127(treeState){ return clamp(REINCARNATION_PERMANENT_POTENTIAL_BASE_PCT_V127+nodeModifierValue(treeState,'cultivation.permanentPotentialBonusPct'),REINCARNATION_PERMANENT_POTENTIAL_BASE_PCT_V127,REINCARNATION_PERMANENT_POTENTIAL_MAX_PCT_V127); }
export function reincarnationEnergyCostReductionPctV127(treeState){ return clamp(nodeModifierValue(treeState,'cultivation.reincarnationEnergyCostReductionPct'),0,25); }
export function reincarnationPointsGainPctV4(treeState){ return clamp(nodeModifierValue(treeState,'reincarnation.rpGainPct'),0,25); }
export function lifePotentialGainPctV4(treeState){ return clamp(nodeModifierValue(treeState,'cultivation.lifePotentialGainPct'),0,25); }
export function spendReincarnationTreeRank(state,nodeId,ranks=1,definitions=starterReincarnationTreeNodes){ const node=definitions.find(x=>x.id===nodeId);if(!node)throw new Error(`Node Luân Hồi không tồn tại: ${nodeId}`);const next={lifetimePointsEarned:state.lifetimePointsEarned,sharedSpentPoints:Math.max(0,Math.floor(Number(state.sharedSpentPoints)||0)),ranks:{...state.ranks},highestAchievementTierByTree:{...state.highestAchievementTierByTree},cultivationR3:true};const current=clamp(Math.floor(next.ranks[node.id]??0),0,node.maxRank),count=Math.max(1,Math.floor(ranks));if(current+count>node.maxRank)throw new Error(`${node.name} tối đa ${node.maxRank}/${node.maxRank}.`);for(const req of node.prerequisites??[])if((next.ranks[req.nodeId]??0)<req.minRank)throw new Error(`Cần ${req.nodeId} đạt ${req.minRank}/${node.maxRank}.`);let cost=0;for(let r=current+1;r<=current+count;r++)cost+=rankCost(r,node.costClass,node.id,node.costScale??1);if(availableTreePoints(next,definitions)<cost)throw new Error(`Không đủ Điểm Luân Hồi: cần ${cost}, hiện có ${availableTreePoints(next,definitions)}.`);next.ranks[node.id]=current+count;return next; }
export function resetReincarnationTreeRanks(state){ return {...state,ranks:{},highestAchievementTierByTree:{...state.highestAchievementTierByTree},cultivationR3:true}; }

if(totalTreeMaxCostV127()!==REINCARNATION_TREE_MAX_TOTAL_COST_V127) throw new Error(`V127 tree cost invariant failed: ${totalTreeMaxCostV127()} != ${REINCARNATION_TREE_MAX_TOTAL_COST_V127}`);


// Luân Hồi Tu Luyện R3 — embedded here to preserve the V141 eager-module budget.
const CULTIVATION_R3_PREFIX='reincarnation.tree.v127.';
const rank=(state,key)=>clamp(state?.inheritedOrigins?.[CULTIVATION_R3_PREFIX+key],0,20);
const lerp=(a,b,t)=>a+(b-a)*t;
const segment=(r,aRank,a,bRank,b)=>r<=aRank?a:r>=bRank?b:lerp(a,b,(r-aRank)/(bRank-aRank));

export function cultivationR3Rank(state,key){return rank(state,key);}

const LG5={2:4,3:.8,4:.2},LG10={2:6,3:1.5,4:.5,5:.15,6:.05},LG15={2:8,3:2.5,4:.8,5:.3,6:.12,7:.05,8:.02},LG20={2:10,3:3.5,4:1.2,5:.5,6:.2,7:.08,8:.04,9:.02,10:.01};
export function lingGuangWeightsR3(r){
  r=clamp(r,0,20); const out={}; if(r<=0)return out;
  if(r<5){out[2]=.8*r;return out;}
  const [loRank,lo,hiRank,hi]=r<10?[5,LG5,10,LG10]:r<15?[10,LG10,15,LG15]:[15,LG15,20,LG20];
  for(const m of Object.keys(lo))out[m]=segment(r,loRank,lo[m]??0,hiRank,hi[m]??0);
  if(r>=10&&r<15)for(const m of [5,6])out[m]=segment(r,10,LG10[m]??0,15,LG15[m]??0);
  if(r>=15&&r<20)for(const m of [7,8])out[m]=segment(r,15,LG15[m]??0,20,LG20[m]??0);
  if(r===10){out[5]=LG10[5];out[6]=LG10[6];}
  if(r===15){out[7]=LG15[7];out[8]=LG15[8];}
  if(r>=20){Object.assign(out,LG20);}
  return out;
}
export function rollLingGuangMultiplierR3(r,rng){const w=lingGuangWeightsR3(r);let x=rng.next()*100;for(let m=10;m>=2;m--){const p=Number(w[m]||0);if(x<p)return m;x-=p;}return 1;}

export function heavenRewardProfileR3(r){
  r=clamp(r,0,20); if(r<=0)return {thresholdTicks:Infinity,bonusTicks:0};
  if(r<5)return {thresholdTicks:Math.round(segment(r,1,224,5,160)),bonusTicks:Math.max(1,Math.round(segment(r,1,2,5,4)))};
  if(r<10)return {thresholdTicks:Math.round(segment(r,5,160,10,120)),bonusTicks:segment(r,5,4,10,5)};
  if(r<15)return {thresholdTicks:Math.round(segment(r,10,120,15,100)),bonusTicks:segment(r,10,5,15,6)};
  return {thresholdTicks:Math.round(segment(r,15,100,20,80)),bonusTicks:segment(r,15,6,20,8)};
}

export function retrainBonusPctR3(state,realmOrder,realms){
  const r=rank(state,'cultivation.retrainRank'); if(r<=0)return 0;
  const historical=Math.max(0,Math.floor(Number(state?.inheritedOrigins?.['reincarnation.v127.historicalRealmOrder'])||0));
  if(realmOrder>=historical)return 0;
  const currentMajor=realms[Math.max(0,Math.min(realms.length-1,realmOrder))]?.majorRealmIndex??0;
  const historicalMajor=realms[Math.max(0,Math.min(realms.length-1,historical))]?.majorRealmIndex??currentMajor;
  const gap=Math.max(0,historicalMajor-currentMajor); if(gap<=0)return 0;
  const perMajor=r<=5?segment(r,1,.6,5,3):r<=10?segment(r,5,3,10,5):r<=15?segment(r,10,5,15,7):segment(r,15,7,20,10);
  const cap=r<=5?segment(r,1,3,5,15):r<=10?segment(r,5,15,10,30):r<=15?segment(r,10,30,15,50):segment(r,15,50,20,80);
  return Math.min(cap,gap*perMajor);
}
export function isNewRecordRealmR3(state,realmOrder){const h=Math.max(0,Math.floor(Number(state?.inheritedOrigins?.['reincarnation.v127.historicalRealmOrder'])||0));return realmOrder>h;}
export function isOldRealmSkipEligibleR3(state,realmOrder,realms){
  const h=Math.max(0,Math.floor(Number(state?.inheritedOrigins?.['reincarnation.v127.historicalRealmOrder'])||0));
  if(realmOrder>=h)return false; const row=realms[realmOrder],next=realms[realmOrder+1],hist=realms[Math.min(h,realms.length-1)]; if(!row||!next||!hist)return false;
  return hist.majorRealmIndex-row.majorRealmIndex>=2 && next.majorRealmIndex===row.majorRealmIndex;
}

export function retreatInsightProfileR3(r){
  r=clamp(r,0,20); if(r<=0)return {small:0,medium:0,great:0};
  const small=r<=5?segment(r,1,2,5,10):r<=10?segment(r,5,10,10,13):r<=15?segment(r,10,13,15,15):segment(r,15,15,20,18);
  const medium=r<10?0:r<=15?segment(r,10,3,15,5):segment(r,15,5,20,6);
  const great=r<15?0:r<=20?segment(r,15,.5,20,1):1; return {small,medium,great};
}
export function rollRetreatInsightMultiplierR3(r,rng){const p=retreatInsightProfileR3(r),x=rng.next()*100;if(x<p.great)return 2;if(x<p.great+p.medium)return 1.5;if(x<p.great+p.medium+p.small)return 1.25;return 1;}
export function retreatRefundProfileR3(r){r=clamp(r,0,20);if(r<=0)return {chancePct:0,hours:.25};const chance=r<=5?segment(r,1,1,5,5):r<=10?segment(r,5,5,10,10):r<=15?segment(r,10,10,15,15):segment(r,15,15,20,20);return {chancePct:chance,hours:r>=15?.5:.25};}

export function effectiveMajorRequirementR3(state,row,isMajorGate){const pct=isMajorGate?clamp(state?.inheritedOrigins?.[CULTIVATION_R3_PREFIX+'cultivation.majorBreakthroughRequirementReductionPct'],0,5):0;return Math.max(0,Math.round(row.requiredTuVi*(1-pct/100)));}
export function additiveSelfCultivationPctR3(state,realmOrder,realms,isPerfectStage){
  let pct=clamp(state?.inheritedOrigins?.[CULTIVATION_R3_PREFIX+'cultivation.baseGainPct'],0,25);
  pct+=retrainBonusPctR3(state,realmOrder,realms);
  if(isNewRecordRealmR3(state,realmOrder))pct+=clamp(state?.inheritedOrigins?.[CULTIVATION_R3_PREFIX+'cultivation.newRecordGainPct'],0,20);
  if(isPerfectStage)pct+=clamp(state?.inheritedOrigins?.[CULTIVATION_R3_PREFIX+'cultivation.perfectStageGainPct'],0,40);
  const stacks=clamp(state?.cultivation?.reincarnationR3?.tribulationTemperStacks,0,5);
  pct+=stacks*clamp(state?.inheritedOrigins?.[CULTIVATION_R3_PREFIX+'cultivation.tribulationTemperPctPerStack'],0,3);
  return pct;
}
export function ensureCultivationRuntimeR3(cultivation){return cultivation.reincarnationR3??(cultivation.reincarnationR3={selfTicks:0,heavenRewardProgressTicks:0,skipRolls:0,tribulationTemperStacks:0,retreatRefundDayKey:'',retreatRefundedHours:0,lastLingGuangMultiplier:1,lastLingGuangTick:0});}
export function cloneCultivationRuntimeR3(v){return {selfTicks:Math.max(0,Math.floor(Number(v?.selfTicks)||0)),heavenRewardProgressTicks:Math.max(0,Number(v?.heavenRewardProgressTicks)||0),skipRolls:Math.max(0,Math.floor(Number(v?.skipRolls)||0)),tribulationTemperStacks:clamp(Math.floor(Number(v?.tribulationTemperStacks)||0),0,5),retreatRefundDayKey:String(v?.retreatRefundDayKey||''),retreatRefundedHours:clamp(v?.retreatRefundedHours,0,1),lastLingGuangMultiplier:clamp(v?.lastLingGuangMultiplier||1,1,10),lastLingGuangTick:Math.max(0,Math.floor(Number(v?.lastLingGuangTick)||0))};}
