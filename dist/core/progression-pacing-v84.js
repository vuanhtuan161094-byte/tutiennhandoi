import { WORLD_YEARS_PER_REAL_SECOND, targetIdleSecondsForRealm } from './realtime-balance.js';
import { cultivationRealmV140, RETREAT_DAILY_BANK_HOURS_V140 } from './cultivation-v140.js';

// Kept under the historic filename because EarlyGame/Telemetry import it, but the contract is V140.
export const PROGRESSION_PACING_SCHEMA_V84 = 'progression-pacing.v140';
export const FIRST_LIFE_START_AGE_V84 = 18;
export const PROGRESSION_PACING_LOCK_MAX_REALM_ORDER_V84 = 117;

export const PROGRESSION_MILESTONES_V84 = [
  { id: 'qi', realmOrder: 1, label: 'Luyện Khí', unlocks: ['Săn Yêu · Boss tầng + Săn Ảo', 'Bắt đầu vòng farm/build'] },
  { id: 'foundation', realmOrder: 10, label: 'Trúc Cơ', unlocks: ['Định Đạo', 'Chủ Đạo V2 · Active I + Passive I', 'Pháp Bảo slot 1–2'] },
  { id: 'purplePalace', realmOrder: 14, label: 'Tử Phủ', unlocks: ['Phó bản Tử Phủ', 'Pháp Bảo slot 3'] },
  { id: 'goldenCore', realmOrder: 18, label: 'Kim Đan', unlocks: ['Chủ Đạo V2 · Active II + Passive II', 'Mốc vertical slice đời đầu'] },
  { id: 'nascentSoul', realmOrder: 22, label: 'Nguyên Anh', unlocks: ['Phó bản song song bắt đầu', 'Pháp Bảo slot 4'] },
  { id: 'spiritTransformation', realmOrder: 26, label: 'Hóa Thần', unlocks: ['Chủ Đạo V2 · Passive III'] },
  { id: 'integration', realmOrder: 34, label: 'Hợp Thể', unlocks: ['Chủ Đạo V2 · Active III + Passive IV'] },
  { id: 'humanImmortal', realmOrder: 46, label: 'Nhân Tiên', unlocks: ['Phụ Đạo · chỉ Passive/Tâm Pháp 100%', 'Chủ Đạo V2 · Active IV + Passive V'] },
  { id: 'heavenTier', realmOrder: 62, label: 'Thiên giai', unlocks: ['Chủ Đạo V2 · Active V'] },
  { id: 'immortalTier', realmOrder: 74, label: 'Tiên giai', unlocks: ['Chủ Đạo V2 · Active VI'] },
  { id: 'extremeTier', realmOrder: 90, label: 'Cực giai', unlocks: ['Chủ Đạo V2 · Active VII'] },
  { id: 'breakerTier', realmOrder: 102, label: 'Phá giai', unlocks: ['Chủ Đạo V2 · Active VIII'] },
];

function orderedRealms(realms) { return [...realms].sort((a,b)=>a.order-b.order); }
export function realmMajorBoundsV84(order,maxOrder=117){
  const normalized=Math.max(0,Math.floor(Number(order)||0));
  if(normalized===0) return {start:0,end:0,index:0,count:1};
  if(normalized<=9) return {start:1,end:9,index:normalized-1,count:9};
  const start=10+Math.floor((normalized-10)/4)*4;
  const end=Math.min(maxOrder,start+3);
  return {start,end,index:normalized-start,count:end-start+1};
}
export function realmMajorNameV84(realm){ return cultivationRealmV140(realm.order).majorRealmName; }
export function realmStageLabelV84(realm){
  if(realm.order===0) return 'Phàm Nhân';
  if(realm.order>=1&&realm.order<=9) return `Tầng ${realm.order}`;
  const match=String(realm.name).match(/(sơ kỳ|trung kỳ|hậu kỳ|viên mãn)$/iu);
  return match?.[1] ?? `Bậc ${realm.order}`;
}

export function cumulativeBaselineSecondsToRealmV84(targetRealmOrder){
  const target=Math.max(0,Math.min(117,Math.floor(Number(targetRealmOrder)||0)));
  let seconds=0;
  for(let order=0;order<target;order++) seconds+=targetIdleSecondsForRealm(order);
  return seconds;
}

function effectiveStageSecondsWithDailyRetreat(order, remainingFraction=1){
  const row=cultivationRealmV140(order);
  const baseline=Math.max(0,row.targetSeconds)*Math.max(0,Math.min(1,remainingFraction));
  if(baseline<=0) return 0;
  const dailyProgress=(Math.max(0,row.retreat3hProgressPct)||0)/100;
  if(dailyProgress<=0) return baseline;
  // Continuous-equivalent estimate for product pacing only. Runtime Bế Quan remains a banked instant action.
  const passivePerDay=86400/baseline;
  const effectiveDays=1/(passivePerDay+dailyProgress);
  return effectiveDays*86400;
}

export function cumulativeDailyRetreatSecondsToRealmV140(targetRealmOrder){
  const target=Math.max(0,Math.min(117,Math.floor(Number(targetRealmOrder)||0)));
  let seconds=0;
  for(let order=0;order<target;order++) seconds+=effectiveStageSecondsWithDailyRetreat(order,1);
  return seconds;
}

export function milestoneAgeBandV84(targetRealmOrder,startAge=FIRST_LIFE_START_AGE_V84){
  const baselineSeconds=cumulativeBaselineSecondsToRealmV84(targetRealmOrder);
  const fastestCadenceSeconds=cumulativeDailyRetreatSecondsToRealmV140(targetRealmOrder);
  const fastestAge=startAge+fastestCadenceSeconds*WORLD_YEARS_PER_REAL_SECOND;
  const idleAge=startAge+baselineSeconds*WORLD_YEARS_PER_REAL_SECOND;
  const targetAge=(fastestAge+idleAge)/2;
  const width=Math.max(2,idleAge-fastestAge);
  return { fastestAge,idleAge,targetAge,toleranceMinAge:Math.max(startAge,fastestAge-width*.25),toleranceMaxAge:idleAge+width*.25 };
}

// Compatibility helper for external telemetry. V140 has stage-specific Bế Quan %, so there is no single exact global acceleration.
export function fullDailyRetreatAverageAccelerationV84(targetRealmOrder=18){
  const idle=cumulativeBaselineSecondsToRealmV84(targetRealmOrder);
  const accelerated=cumulativeDailyRetreatSecondsToRealmV140(targetRealmOrder);
  return accelerated>0?idle/accelerated:1;
}
export function baselineSecondsAtFullDailyRetreatCadenceV84(baselineSeconds,targetRealmOrder=18){
  const factor=fullDailyRetreatAverageAccelerationV84(targetRealmOrder);
  return Math.max(0,Number(baselineSeconds)||0)/Math.max(1,factor);
}

function remainingBaselineSecondsToOrder(currentOrder,targetOrder,progressPct){
  if(targetOrder<=currentOrder) return 0;
  let seconds=targetIdleSecondsForRealm(currentOrder)*(1-Math.max(0,Math.min(100,progressPct))/100);
  for(let order=currentOrder+1;order<targetOrder;order++) seconds+=targetIdleSecondsForRealm(order);
  return Math.max(0,seconds);
}

export function progressionPacingSnapshotV84(args){
  const list=orderedRealms(args.realms);
  const maxOrder=list.at(-1)?.order ?? 117;
  const currentOrder=Math.max(0,Math.min(maxOrder,Math.floor(Number(args.currentRealmOrder)||0)));
  const currentRealm=list.find(x=>x.order===currentOrder) ?? list[0];
  if(!currentRealm) throw new Error('Progression pacing requires at least one realm definition.');
  const row=cultivationRealmV140(currentOrder);
  const required=Math.max(0,Number(args.currentRequiredTuVi ?? args.currentRequiredEnergy ?? row.requiredTuVi ?? 0));
  const current=Math.max(0,Number(args.currentTuVi ?? args.currentEnergy ?? 0));
  const progressPct=required>0?Math.max(0,Math.min(100,current/required*100)):100;
  const bounds=realmMajorBoundsV84(currentOrder,maxOrder);
  const nextMajorOrder=Math.min(maxOrder+1,bounds.end+1);
  const nextMilestone=PROGRESSION_MILESTONES_V84.find(x=>x.realmOrder>currentOrder&&x.realmOrder<=maxOrder);
  const stageTarget=row.targetSeconds;
  const baselineRemaining=required>0?stageTarget*(1-progressPct/100):0;
  const baselineRemainingToNextMajor=nextMajorOrder>currentOrder?remainingBaselineSecondsToOrder(currentOrder,nextMajorOrder,progressPct):0;
  const milestoneAway=nextMilestone?remainingBaselineSecondsToOrder(currentOrder,nextMilestone.realmOrder,progressPct):0;
  const currentRetreat3hPct=row.retreat3hProgressPct;
  const sliceTarget=18;
  const sliceBaseline=cumulativeBaselineSecondsToRealmV84(sliceTarget);
  return {
    schema:PROGRESSION_PACING_SCHEMA_V84,
    current:{ realmOrder:currentOrder,majorRealm:realmMajorNameV84(currentRealm),stageLabel:realmStageLabelV84(currentRealm),majorStartOrder:bounds.start,majorEndOrder:bounds.end,stageIndex:bounds.index,stageCount:bounds.count,targetIdleSeconds:stageTarget,progressPct,baselineRemainingSeconds:baselineRemaining,baselineRemainingToNextMajorSeconds:baselineRemainingToNextMajor,pacingStatus:'v140' },
    nextMilestone:nextMilestone?{ id:nextMilestone.id,realmOrder:nextMilestone.realmOrder,label:nextMilestone.label,baselineSecondsAway:milestoneAway,unlocks:[...nextMilestone.unlocks] }:undefined,
    dailyRetreat:{ quotaHours:RETREAT_DAILY_BANK_HOURS_V140,bankCapHours:9,currentStageProgressPctPer3h:currentRetreat3hPct,currentStageProgressPctPerHour:currentRetreat3hPct/3 },
    firstLifeSlice:{ targetRealmOrder:sliceTarget,label:'Kim Đan · Vertical Slice',baselineIdleSeconds:sliceBaseline,fullRetreatCadenceSeconds:cumulativeDailyRetreatSecondsToRealmV140(sliceTarget),ageBand:milestoneAgeBandV84(sliceTarget) },
  };
}
