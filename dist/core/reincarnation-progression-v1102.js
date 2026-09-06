export const REINCARNATION_ENERGY_CAP = 500;
export const REINCARNATION_ENERGY_RECHARGE_PER_24H = 100;
export const REINCARNATION_TRIAL_DURATION_SECONDS = 60;
export const REINCARNATION_TREE_MAX_RANK_V127 = 50;
export const REINCARNATION_TREE_MAX_TOTAL_COST_V127 = 1_578_620;
export const REINCARNATION_PERMANENT_POTENTIAL_BASE_PCT_V127 = 3;
export const REINCARNATION_PERMANENT_POTENTIAL_MAX_PCT_V127 = 6;
export const REINCARNATION_TRIAL_MAX_BONUS_PCT_V127 = 120;

export const corePotentialDefinitions = [
  { id: 'power', name: 'Công Lực', description: 'Tăng trực tiếp Công Lực gốc của nhân vật.', perPoint: ['Công Lực +1'] },
  { id: 'body', name: 'Thể Phách', description: 'Tăng trực tiếp Thể Phách gốc; Sinh Mệnh chuẩn lấy từ Thể Phách.', perPoint: ['Thể Phách +1', 'Sinh Mệnh chuẩn +20'] },
  { id: 'defense', name: 'Phòng Ngự', description: 'Tăng trực tiếp Phòng Ngự gốc của nhân vật.', perPoint: ['Phòng Ngự +3'] },
];

export const REINCARNATION_TREE_TIER_INVESTMENT = [0, 41_000, 92_250, 153_750, 235_750];
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

export const reincarnationTreeNodesV136 = [
  // CÂY TU LUYỆN — 16 nhánh
  n('cultivation.self','cultivation',0,'Tự Tu Vô Tận','Tăng riêng Tu Vi Tự Tu /15 giây; không nhân trực tiếp Bế Quan.','normal','cultivation.selfGainPct',100),
  n('cultivation.retrain','cultivation',1,'Trọng Tu Cựu Cảnh','Khi đang ở cảnh thấp hơn kỷ lục của các đời trước, tăng Tu Vi; bonus biến mất ở vùng kỷ lục.','high','cultivation.retrainGainPct',150),
  n('cultivation.retreat','cultivation',2,'Bế Quan Chân Ý','Tăng lượng Tu Vi Bế Quan; quota vẫn cố định 3 giờ/ngày.','high','cultivation.retreatGainPct',50),
  n('cultivation.protector','cultivation',3,'Lục Đạo Hộ Pháp','Tăng tương đối hiệu lực Hộ Pháp của Phân Thân; không tạo thêm vòng simulation.','high','cultivation.protectorEffectPct',100),
  n('cultivation.tribulation_mastery','cultivation',4,'Thiên Kiếp Chân Ý','Tăng tỷ lệ vượt Thiên Kiếp; chỉ tác động challenge Thiên Kiếp, không thay đổi Tu Vi requirement.','core','cultivation.tribulationSuccessPct',15),
  n('cultivation.pill_yield','cultivation',5,'Đan Lực Hóa Tu','Tăng lượng Tu Vi nhận từ Tu Vi Đan; không nhân Tự Tu hay Bế Quan.','rare','cultivation.cultivationPillGainPct',50),
  n('cultivation.life_potential','cultivation',6,'Tiềm Mạch Khai Thiên','Tăng Tiềm Năng Đời nhận ở mọi tiểu cảnh.','normal','cultivation.lifePotentialGainPct',50),
  n('cultivation.permanent_potential','cultivation',7,'Tiềm Năng Bất Diệt','Tăng tỷ lệ chuyển Tiềm Năng Đời thành Tiềm Năng Vĩnh Viễn thêm 3 điểm %, từ base 3% lên tối đa 6%.','core','cultivation.permanentPotentialBonusPct',3),
  n('cultivation.lifespan','cultivation',8,'Trường Sinh Túc Mệnh','Phàm Nhân → Độ Kiếp: tăng Thọ Nguyên tối đa.','normal','cultivation.lifespanPct',50),
  n('cultivation.dao_decay','cultivation',9,'Đạo Suy Tĩnh Tức','Nhân Tiên trở lên: giảm tốc độ tích Đạo Suy.','rare','cultivation.daoDecayRateReductionPct',25),
  n('cultivation.offline_reward','cultivation',10,'Đại Mộng Nhàn Tu','Tăng phần thưởng offline thường; cơ hội đặc biệt chỉ hồi từ 85% lên tối đa ngang online.','high','cultivation.offlineRewardPct',50),
  n('cultivation.offline_cap','cultivation',11,'Đại Mộng Trường Tồn','Tăng cap phần thưởng offline từ 24 giờ lên tối đa 168 giờ; tuổi/Đạo Suy vẫn chạy toàn thời gian thật.','high','cultivation.offlineCapHoursBonus',144),
  n('cultivation.injury_recovery','cultivation',12,'Dưỡng Thân Tĩnh Tức','Tăng tốc hồi Thương Thế tự nhiên và hiệu lực hồi phục hợp lệ.','normal','cultivation.injuryRecoveryPct',100),
  n('cultivation.injury_guard','cultivation',13,'Hộ Thể Bất Khuất','Giảm Thương Thế nhận từ Thiên Kiếp và phản phệ tu luyện; không tăng Tu Vi.','rare','cultivation.injuryGainReductionPct',30),
  n('cultivation.tribulation_guard','cultivation',14,'Thiên Kiếp Dưỡng Mệnh','Giảm tổn thất Thọ Hạn/Đạo Suy do Thiên Kiếp hoặc Suy Kiếp thất bại; không làm Boss yếu đi.','rare','cultivation.tribulationFailureLifespanLossReductionPct',30,[],[{modifierKey:'cultivation.tribulationFailureDaoDecayLossReductionPct',maxValue:30}]),
  n('cultivation.reincarnation_energy','cultivation',15,'Luân Hồi Dư Lực','Giảm Năng Lượng Luân Hồi phải trả khi kết toán đời. Không tăng reward, Tu Vi hay combat.','normal','cultivation.reincarnationEnergyCostReductionPct',25),

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
const emptyAllocation = () => ({ power:0, body:0, defense:0 });
const NEW_NODE_IDS = new Set(reincarnationTreeNodesV136.map(x=>x.id));
export const REINCARNATION_TREE_RUNTIME_ORIGIN_PREFIX_V136 = 'reincarnation.tree.v127.';
const TREE_RUNTIME_KEYS_V136 = [...new Set(reincarnationTreeNodesV136.flatMap(x=>[x.modifierKey,...(x.additionalModifiers??[]).map(m=>m.modifierKey)]))];
export function reincarnationTreeRuntimeOriginKeyV136(key){ return `${REINCARNATION_TREE_RUNTIME_ORIGIN_PREFIX_V136}${key}`; }
export function syncReincarnationTreeRuntimeOriginsV136(origins,tree){ for(const key of TREE_RUNTIME_KEYS_V136) origins[reincarnationTreeRuntimeOriginKeyV136(key)] = nodeModifierValue(tree,key,reincarnationTreeNodesV136); }
export function reincarnationTreeRuntimeModifierV136(origins,key){ return Math.max(0,Number(origins?.[reincarnationTreeRuntimeOriginKeyV136(key)]??0)||0); }

export function createLifeCorePotentialState(){ return { unspent:0, lifetimeEarned:0, allocations:emptyAllocation(), awardedMilestones:[] }; }
export function cloneLifeCorePotentialState(value){
  const a={...emptyAllocation(),...(value?.allocations??{})}; for(const k of Object.keys(a)) a[k]=Math.max(0,Math.floor(Number(a[k])||0));
  const spent=a.power+a.body+a.defense, earned=Math.max(spent,Math.floor(Number(value?.lifetimeEarned)||0));
  return { unspent:Math.max(0,Math.floor(Number(value?.unspent)||Math.max(0,earned-spent))), lifetimeEarned:earned, allocations:a, awardedMilestones:[...new Set(value?.awardedMilestones??[])] };
}
export function createReincarnationProgressStateV1102(nowUnixMs=0){ return { energy:{current:REINCARNATION_ENERGY_CAP,lastUpdatedUnixMs:nowUnixMs}, permanentPotential:{unspent:0,lifetimeEarned:0,allocations:emptyAllocation()}, alchemyPermanentStats:emptyAllocation(), alchemyLegacy:{highestRank:1,highestTurn:1,bestMasteryByRecipe:{},knownRecipeIds:[]}, tree:{lifetimePointsEarned:0,ranks:{},highestAchievementTierByTree:{}}, rewardHistory:[] }; }
export function cloneReincarnationProgressStateV1102(value,nowUnixMs=0){
  const base=createReincarnationProgressStateV1102(nowUnixMs), p={...emptyAllocation(),...(value?.permanentPotential?.allocations??{})}; for(const k of Object.keys(p)) p[k]=Math.max(0,Math.floor(Number(p[k])||0));
  const spent=p.power+p.body+p.defense, earned=Math.max(spent,Math.floor(Number(value?.permanentPotential?.lifetimeEarned)||0));
  let ranks={...(value?.tree?.ranks??{})};
  // V127 tree is a full replacement. Unknown legacy ranks are refunded automatically because lifetimePointsEarned is retained while new spent = 0.
  if(Object.keys(ranks).some(id=>!NEW_NODE_IDS.has(id))) ranks={};
  for(const [id,r] of Object.entries(ranks)) ranks[id]=clamp(Math.floor(Number(r)||0),0,50);
  const pending=value?.pendingTrial?{...value.pendingTrial,offenseBest:value.pendingTrial.offenseBest?{...value.pendingTrial.offenseBest}:undefined,survivalBest:value.pendingTrial.survivalBest?{...value.pendingTrial.survivalBest}:undefined,finalizedReward:value.pendingTrial.finalizedReward?{...value.pendingTrial.finalizedReward}:undefined}:undefined;
  return { energy:{current:clamp(Number(value?.energy?.current??base.energy.current)||0,0,REINCARNATION_ENERGY_CAP),lastUpdatedUnixMs:Math.max(0,Math.floor(Number(value?.energy?.lastUpdatedUnixMs??nowUnixMs)))}, permanentPotential:{unspent:Math.max(0,Math.floor(Number(value?.permanentPotential?.unspent)||Math.max(0,earned-spent))),lifetimeEarned:earned,allocations:p}, alchemyPermanentStats:{...emptyAllocation(),...(value?.alchemyPermanentStats??{})}, alchemyLegacy:{highestRank:Math.max(1,Math.min(9,Math.floor(Number(value?.alchemyLegacy?.highestRank)||1))),highestTurn:Math.max(1,Math.min(9,Math.floor(Number(value?.alchemyLegacy?.highestTurn)||1))),bestMasteryByRecipe:{...(value?.alchemyLegacy?.bestMasteryByRecipe??{})},knownRecipeIds:[...new Set(value?.alchemyLegacy?.knownRecipeIds??[])]}, tree:{lifetimePointsEarned:Math.max(0,Math.floor(Number(value?.tree?.lifetimePointsEarned)||0)),ranks,highestAchievementTierByTree:{...(value?.tree?.highestAchievementTierByTree??{})}}, pendingTrial:pending, rewardHistory:(value?.rewardHistory??[]).map(x=>({...x})) };
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
export function spendLifeCorePotential(state,id,points=1){ if(!['power','body','defense'].includes(id)) throw new Error('Thuộc tính Tiềm Năng không hợp lệ.'); const next=cloneLifeCorePotentialState(state),n=Math.max(1,Math.floor(points)); if(next.unspent<n) throw new Error(`Không đủ Điểm Tiềm Năng Đời: cần ${n}, hiện có ${next.unspent}.`); next.unspent-=n; next.allocations[id]+=n; return next; }
export function spendPermanentCorePotential(state,id,points=1){ if(!['power','body','defense'].includes(id)) throw new Error('Thuộc tính Tiềm Năng không hợp lệ.'); const next={unspent:Math.max(0,Math.floor(state.unspent)),lifetimeEarned:Math.max(0,Math.floor(state.lifetimeEarned)),allocations:{...emptyAllocation(),...state.allocations}},n=Math.max(1,Math.floor(points)); if(next.unspent<n) throw new Error(`Không đủ Điểm Tiềm Năng Luân Hồi: cần ${n}, hiện có ${next.unspent}.`); next.unspent-=n; next.allocations[id]+=n; return next; }
export function applyCorePotentialStats(stats,runtime){ if(!runtime) return {...stats}; const life=cloneLifeCorePotentialState(runtime.life).allocations, permanent={...emptyAllocation(),...(runtime.permanent??{})}; const power=life.power+Math.max(0,permanent.power||0),body=life.body+Math.max(0,permanent.body||0),defense=life.defense+Math.max(0,permanent.defense||0); const basePhysique=Number.isFinite(stats.physique)?Math.max(0,stats.physique):Math.max(0,stats.maxHp/20); const physique=basePhysique+body; return {...stats,attack:stats.attack+power,defense:stats.defense+defense*3,physique,maxHp:physique*20}; }

export function rechargeReincarnationEnergy(state,nowUnixMs=Date.now()){ const now=Math.max(state.lastUpdatedUnixMs,Math.floor(nowUnixMs)),elapsed=Math.max(0,now-state.lastUpdatedUnixMs),perMs=REINCARNATION_ENERGY_RECHARGE_PER_24H/(24*60*60*1000); return {current:Math.min(REINCARNATION_ENERGY_CAP,state.current+elapsed*perMs),lastUpdatedUnixMs:now}; }
export function reincarnationEnergyCostForRealmOrder(realmOrder){ return depthConfigForRealmOrder(realmOrder).energyCost; }
export function trialBonusPctForRatio(ratio){ const r=Math.max(0,Number(ratio)||0); if(r<.8)return 0;if(r<1)return 10;if(r<1.25)return 20;if(r<1.5)return 35;if(r<2)return 50;if(r<3)return 65;if(r<4)return 80;if(r<5)return 90;return 100; }
export function combinedTrialBonusPct(offenseBonus,survivalBonus){ const o=clamp(Number(offenseBonus)||0,0,100),s=clamp(Number(survivalBonus)||0,0,100); const synergy=o>=80&&s>=80?20:o>=50&&s>=50?10:0; return Math.min(120,o*.5+s*.5+synergy); }
export function buildTrialResult(kind,measured,benchmark,buildFingerprint,nowUnixMs=Date.now()){ const safe=Math.max(1e-9,benchmark),ratio=Math.max(0,measured)/safe; return {kind,measured:Math.max(0,measured),benchmark:safe,ratio,bonusPct:trialBonusPctForRatio(ratio),durationSeconds:REINCARNATION_TRIAL_DURATION_SECONDS,buildFingerprint,performedAtUnixMs:nowUnixMs}; }
export function previewReincarnationV2Reward(args){
  const info=depthInfoForRealmOrder(args.realmOrder),cfg=REINCARNATION_DEPTH_CONFIG[info.tierIndex],trialBonus=combinedTrialBonusPct(args.offense?.bonusPct??0,args.survival?.bonusPct??0);
  const lifePotential=Math.max(0,Math.floor(Number(args.lifePotentialEarned)||lifePotentialMilestonesThroughRealmOrder(args.realmOrder).reduce((s,x)=>s+x.amount,0)));
  const conversionPct=clamp(Number(args.permanentPotentialConversionPct)||REINCARNATION_PERMANENT_POTENTIAL_BASE_PCT_V127,REINCARNATION_PERMANENT_POTENTIAL_BASE_PCT_V127,REINCARNATION_PERMANENT_POTENTIAL_MAX_PCT_V127);
  const permanentBase=Math.max(0,Math.round(lifePotential*conversionPct/100));
  const energyReduction=clamp(Number(args.energyCostReductionPct)||0,0,25), energyCost=Math.max(1,Math.ceil(cfg.energyCost*(1-energyReduction/100)));
  return {lifeId:args.lifeId,depthTier:info.tierId,depthTierIndex:info.tierIndex,depthStage:info.stage,reincarnationPoints:Math.round(cfg.reincarnationPoints*(1+trialBonus/100)),reincarnationPointsBase:cfg.reincarnationPoints,permanentPotentialBase:permanentBase,permanentPotentialConversionPct:conversionPct,trialBonusPct:trialBonus,permanentPotentialGain:Math.round(permanentBase*(1+trialBonus/100)),energyCost,energyCostBase:cfg.energyCost,offenseRatio:args.offense?.ratio??0,survivalRatio:args.survival?.ratio??0,finalizedAtUnixMs:args.nowUnixMs??Date.now()};
}

function baseRankCost(rank){ const r=clamp(Math.floor(rank),1,50); return r<=10?50:r<=20?150:r<=30?400:r<=40?1000:2500; }
export function rankCost(rankToBuy,costClass='normal',nodeId=''){ const rank=clamp(Math.floor(rankToBuy),1,50),base=baseRankCost(rank); let cost; if(costClass==='high'){ const raw=base*1.25; cost=rank%2===1?Math.floor(raw):Math.ceil(raw); } else cost=Math.round(base*(REINCARNATION_COST_CLASS_MULTIPLIER[costClass]??1)); if(nodeId==='manual.grand_completion'&&rank===50) cost+=120; return cost; }
export function nodeSpentPoints(node,rank){ let total=0;for(let r=1;r<=clamp(Math.floor(rank),0,node.maxRank);r++) total+=rankCost(r,node.costClass,node.id);return total; }
export function totalTreeSpentPoints(state,treeId,definitions=starterReincarnationTreeNodes){ return definitions.filter(x=>x.treeId===treeId).reduce((sum,node)=>sum+nodeSpentPoints(node,state.ranks[node.id]??0),0); }
export function totalAllTreeSpentPoints(state,definitions=starterReincarnationTreeNodes){ return definitions.reduce((sum,node)=>sum+nodeSpentPoints(node,state.ranks[node.id]??0),0); }
export function totalTreeMaxCostV127(definitions=starterReincarnationTreeNodes){ return definitions.reduce((s,node)=>s+nodeSpentPoints(node,node.maxRank),0); }
export function availableTreePoints(state,definitions=starterReincarnationTreeNodes){ return Math.max(0,state.lifetimePointsEarned-totalAllTreeSpentPoints(state,definitions)); }
export function nodeModifierValue(state,modifierKey,definitions=starterReincarnationTreeNodes){ let total=0;for(const node of definitions){const rank=clamp(Math.floor(state?.ranks?.[node.id]??0),0,node.maxRank);if(node.modifierKey===modifierKey)total+=rank*node.perRank;for(const extra of node.additionalModifiers??[])if(extra.modifierKey===modifierKey)total+=rank*extra.perRank;}return total; }
export function permanentPotentialConversionPctV127(treeState){ return clamp(REINCARNATION_PERMANENT_POTENTIAL_BASE_PCT_V127+nodeModifierValue(treeState,'cultivation.permanentPotentialBonusPct'),3,6); }
export function reincarnationEnergyCostReductionPctV127(treeState){ return clamp(nodeModifierValue(treeState,'cultivation.reincarnationEnergyCostReductionPct'),0,25); }
export function spendReincarnationTreeRank(state,nodeId,ranks=1,definitions=starterReincarnationTreeNodes){ const node=definitions.find(x=>x.id===nodeId);if(!node)throw new Error(`Node Luân Hồi không tồn tại: ${nodeId}`);const next={lifetimePointsEarned:state.lifetimePointsEarned,ranks:{...state.ranks},highestAchievementTierByTree:{...state.highestAchievementTierByTree}};const current=clamp(Math.floor(next.ranks[node.id]??0),0,node.maxRank),count=Math.max(1,Math.floor(ranks));if(current+count>node.maxRank)throw new Error(`${node.name} tối đa ${node.maxRank}/50.`);for(const req of node.prerequisites??[])if((next.ranks[req.nodeId]??0)<req.minRank)throw new Error(`Cần ${req.nodeId} đạt ${req.minRank}/50.`);let cost=0;for(let r=current+1;r<=current+count;r++)cost+=rankCost(r,node.costClass,node.id);if(availableTreePoints(next,definitions)<cost)throw new Error(`Không đủ Điểm Luân Hồi: cần ${cost}, hiện có ${availableTreePoints(next,definitions)}.`);next.ranks[node.id]=current+count;return next; }
export function resetReincarnationTreeRanks(state){ return {...state,ranks:{},highestAchievementTierByTree:{...state.highestAchievementTierByTree}}; }

if(totalTreeMaxCostV127()!==REINCARNATION_TREE_MAX_TOTAL_COST_V127) throw new Error(`V127 tree cost invariant failed: ${totalTreeMaxCostV127()} != ${REINCARNATION_TREE_MAX_TOTAL_COST_V127}`);
