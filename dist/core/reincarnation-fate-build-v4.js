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

const fate = (pathId, pathName, tier, order, id, name, summary, modifiers, passive) => ({
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

const cultivation = [
  fate('cultivation','Tu Mệnh','mortal',0,'fate.v4.cultivation.diligent','Cần Tu','Đời này thiên về tốc độ tu hành.',{ selfCultivationPct:5 }),
  fate('cultivation','Tu Mệnh','spirit',1,'fate.v4.cultivation.spirit_mind','Linh Tâm','Tự Tu và Bế Quan đồng thời hiệu quả hơn.',{ selfCultivationPct:8, retreatPct:5 }),
  fate('cultivation','Tu Mệnh','mystic',2,'fate.v4.cultivation.clear_dao_heart','Đạo Tâm Thông Minh','Tu hành nhanh và khi nhập đại cảnh mới có một nhịp tăng tốc ngắn.',{ selfCultivationPct:12, retreatPct:8 },{ id:'major_realm_burst', name:'Đại Cảnh Khai Ngộ', description:'Lần đầu bước vào một đại cảnh trong đời: Tự Tu +10% trong 30 phút thực.' }),
  fate('cultivation','Tu Mệnh','heaven',3,'fate.v4.cultivation.dao_affinity','Đại Đạo Thân Hòa','Đạo vận theo sát quá trình phá cảnh.',{ selfCultivationPct:16, retreatPct:10 },{ id:'dao_rhythm', name:'Đạo Vận', description:'Lần đầu bước vào đại cảnh mới: Tự Tu +15% cho tới khi vượt thêm một tiểu cảnh.' }),
  fate('cultivation','Tu Mệnh','immortal',4,'fate.v4.cultivation.destined_dao_child','Thiên Mệnh Đạo Tử','Build chuyên phá kỷ lục cảnh giới.',{ selfCultivationPct:22, retreatPct:15 },{ id:'record_heaven_blessing', name:'Thiên Đạo Gia Thân', description:'Lần đầu mỗi đời phá kỷ lục đại cảnh: Tự Tu +25% trong đại cảnh mới.' }),
];

const combat = [
  fate('combat','Chiến Mệnh','mortal',0,'fate.v4.combat.fighter','Thiện Chiến','Tăng sức chiến đấu trực tiếp.',{ damagePct:4 }),
  fate('combat','Chiến Mệnh','spirit',1,'fate.v4.combat.hundred_battles','Bách Chiến','Thiên về PvE và Boss.',{ damagePct:7, bossDamagePct:3 }),
  fate('combat','Chiến Mệnh','mystic',2,'fate.v4.combat.slaying_heart','Sát Phạt Chi Tâm','Boss đời này càng đánh càng thuận tay.',{ damagePct:10, bossDamagePct:5 },{ id:'next_boss_momentum', name:'Sát Ý Dư Uy', description:'Sau khi hạ Boss, trận Boss hợp lệ kế tiếp trong ngày nhận thêm +5% Damage.' }),
  fate('combat','Chiến Mệnh','heaven',3,'fate.v4.combat.war_immortal_reborn','Chiến Tiên Chuyển Thế','Kết liễu mục tiêu lớn càng lúc càng mạnh.',{ damagePct:14, bossDamagePct:8 },{ id:'execute_pressure', name:'Chiến Thế', description:'HP Boss càng thấp, Damage tăng dần; tối đa +10% khi Boss gần cạn HP.' }),
  fate('combat','Chiến Mệnh','immortal',4,'fate.v4.combat.eternal_war_immortal','Vạn Cổ Chiến Tiên','Build Boss/push chiến đấu của một đời.',{ damagePct:20, bossDamagePct:12 },{ id:'life_war_intent', name:'Chiến Ý Nhất Kiếp', description:'Mỗi Boss First Clear trong đời +1 Chiến Ý, tối đa 5; mỗi tầng +2% Boss Damage. Tọa Hóa reset.' }),
];

const body = [
  fate('body','Thể Mệnh','mortal',0,'fate.v4.body.strong_body','Cường Thân','Tăng sức sống nền.',{ maxHpPct:6 }),
  fate('body','Thể Mệnh','spirit',1,'fate.v4.body.diamond_bone','Kim Cang Cốt','Tăng HP và Phòng.',{ maxHpPct:10, defensePct:5 }),
  fate('body','Thể Mệnh','mystic',2,'fate.v4.body.unyielding','Bất Khuất Chi Thể','Càng nguy cấp càng khó bị hạ.',{ maxHpPct:15, defensePct:8 },{ id:'low_hp_guard', name:'Bất Khuất', description:'Khi HP dưới 30%, nhận thêm một lượng Giảm Sát Thương nhỏ; không cộng chồng nhiều tầng.' }),
  fate('body','Thể Mệnh','heaven',3,'fate.v4.body.undying_fate','Bất Diệt Chi Mệnh','Build phòng thủ cao cấp.',{ maxHpPct:20, defensePct:10, damageReductionPct:3 }),
  fate('body','Thể Mệnh','immortal',4,'fate.v4.body.myriad_tribulation_undying','Vạn Kiếp Bất Diệt','Chống burst và sống sót qua Boss khó.',{ maxHpPct:28, damageReductionPct:6 },{ id:'once_per_battle_shield', name:'Bất Diệt Hộ Mệnh', description:'Mỗi trận một lần, khi HP xuống 20% tạo Khiên lớn theo Max HP.' }),
];

const wealth = [
  fate('wealth','Tài Mệnh','mortal',0,'fate.v4.wealth.small_fortune','Tiểu Tài','Tăng Linh Thạch nhận được.',{ spiritStoneGainPct:5 }),
  fate('wealth','Tài Mệnh','spirit',1,'fate.v4.wealth.gather_wealth','Tụ Tài','Tăng Linh Thạch nhận được.',{ spiritStoneGainPct:8 }),
  fate('wealth','Tài Mệnh','mystic',2,'fate.v4.wealth.prosperous','Tài Vận Hanh Thông','Một đời thiên về tích lũy Linh Thạch.',{ spiritStoneGainPct:12 },{ id:'daily_large_income_bonus', name:'Tài Vận', description:'Mỗi ngày, nguồn Linh Thạch hợp lệ lớn đầu tiên nhận thêm +20%.' }),
  fate('wealth','Tài Mệnh','heaven',3,'fate.v4.wealth.wealth_star','Tài Tinh Chiếu Mệnh','Tăng mạnh Linh Thạch toàn đời.',{ spiritStoneGainPct:18 }),
  fate('wealth','Tài Mệnh','immortal',4,'fate.v4.wealth.treasure_destiny','Tụ Bảo Thiên Mệnh','Build kinh tế Linh Thạch cao cấp.',{ spiritStoneGainPct:25 },{ id:'daily_double_income', name:'Bạo Tài', description:'Mỗi ngày một lần, một nguồn Linh Thạch hợp lệ được nhân ×2.' }),
];

const idle = [
  fate('idle','Nhàn Mệnh','mortal',0,'fate.v4.idle.idle_cultivator','Nhàn Tu','Thiên về Tự Tu khi offline.',{ offlineSelfCultivationPct:5 }),
  fate('idle','Nhàn Mệnh','spirit',1,'fate.v4.idle.free_cloud','Nhàn Vân','Tăng hiệu quả thu hoạch offline.',{ offlineRewardPct:8 }),
  fate('idle','Nhàn Mệnh','mystic',2,'fate.v4.idle.great_dream','Đại Mộng Tu Sĩ','Offline dài bắt đầu có lợi thế riêng.',{ offlineRewardPct:12 },{ id:'long_offline_tail', name:'Đại Mộng', description:'Khi offline đủ 4 giờ, phần cuối phiên offline nhận thêm hiệu suất; luôn tuân theo offline cap của hệ nguồn.' }),
  fate('idle','Nhàn Mệnh','heaven',3,'fate.v4.idle.wandering_immortal','Nhàn Vân Dã Hạc','Build idle/offline cao cấp.',{ offlineRewardPct:18 }),
  fate('idle','Nhàn Mệnh','immortal',4,'fate.v4.idle.great_dream_immortal','Đại Mộng Tiên Nhân','Tối ưu đời chơi nhàn.',{ offlineRewardPct:25 },{ id:'great_dream_harvest', name:'Đại Mộng Thu Hoạch', description:'Phiên offline đủ dài nhận thêm một khoản Đại Mộng Thu Hoạch có cap; không nhân vô hạn với chính nó.' }),
];

const raw = [...cultivation, ...combat, ...body, ...wealth, ...idle];
for (const path of ['cultivation','combat','body','wealth','idle']) {
  const ordered = raw.filter(x=>x.pathId===path).sort((a,b)=>a.order-b.order);
  for (let i=1;i<ordered.length;i++) ordered[i].prerequisiteId = ordered[i-1].id;
}

export const FATE_BUILD_DEFINITIONS_V4 = Object.freeze(raw.map(x=>Object.freeze({ ...x, modifiers:Object.freeze({ ...x.modifiers }), passive:x.passive?Object.freeze({ ...x.passive }):undefined })));
export const FATE_BUILD_BY_ID_V4 = new Map(FATE_BUILD_DEFINITIONS_V4.map(x=>[x.id,x]));
export const FATE_BUILD_PATHS_V4 = Object.freeze(['cultivation','combat','body','wealth','idle'].map(pathId=>{
  const nodes=FATE_BUILD_DEFINITIONS_V4.filter(x=>x.pathId===pathId).sort((a,b)=>a.order-b.order);
  return Object.freeze({ id:pathId, name:nodes[0].pathName, nodes:Object.freeze(nodes) });
}));
export const FATE_BUILD_TOTAL_UNLOCK_COST_V4 = FATE_BUILD_DEFINITIONS_V4.reduce((s,x)=>s+x.unlockCostRp,0);

const starterIds = () => FATE_BUILD_DEFINITIONS_V4.filter(x=>x.tier==='mortal').map(x=>x.id);
export function createFateBuildStateV4(){ return { version:4, unlockedIds:starterIds(), activeFateId:'fate.v4.cultivation.diligent' }; }
export function cloneFateBuildStateV4(value){
  const known=new Set((value?.unlockedIds??[]).filter(id=>FATE_BUILD_BY_ID_V4.has(id)));
  for(const id of starterIds()) known.add(id);
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
