const PREFIX='reincarnation.tree.v127.';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const rank=(state,key)=>clamp(state?.inheritedOrigins?.[PREFIX+key],0,20);
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

export function effectiveMajorRequirementR3(state,row,isMajorGate){const pct=isMajorGate?clamp(state?.inheritedOrigins?.[PREFIX+'cultivation.majorBreakthroughRequirementReductionPct'],0,5):0;return Math.max(0,Math.round(row.requiredTuVi*(1-pct/100)));}
export function additiveSelfCultivationPctR3(state,realmOrder,realms,isPerfectStage){
  let pct=clamp(state?.inheritedOrigins?.[PREFIX+'cultivation.baseGainPct'],0,25);
  pct+=retrainBonusPctR3(state,realmOrder,realms);
  if(isNewRecordRealmR3(state,realmOrder))pct+=clamp(state?.inheritedOrigins?.[PREFIX+'cultivation.newRecordGainPct'],0,20);
  if(isPerfectStage)pct+=clamp(state?.inheritedOrigins?.[PREFIX+'cultivation.perfectStageGainPct'],0,40);
  const stacks=clamp(state?.cultivation?.reincarnationR3?.tribulationTemperStacks,0,5);
  pct+=stacks*clamp(state?.inheritedOrigins?.[PREFIX+'cultivation.tribulationTemperPctPerStack'],0,3);
  return pct;
}
export function ensureCultivationRuntimeR3(cultivation){return cultivation.reincarnationR3??(cultivation.reincarnationR3={selfTicks:0,heavenRewardProgressTicks:0,skipRolls:0,tribulationTemperStacks:0,retreatRefundDayKey:'',retreatRefundedHours:0,lastLingGuangMultiplier:1,lastLingGuangTick:0});}
export function cloneCultivationRuntimeR3(v){return {selfTicks:Math.max(0,Math.floor(Number(v?.selfTicks)||0)),heavenRewardProgressTicks:Math.max(0,Number(v?.heavenRewardProgressTicks)||0),skipRolls:Math.max(0,Math.floor(Number(v?.skipRolls)||0)),tribulationTemperStacks:clamp(Math.floor(Number(v?.tribulationTemperStacks)||0),0,5),retreatRefundDayKey:String(v?.retreatRefundDayKey||''),retreatRefundedHours:clamp(v?.retreatRefundedHours,0,1),lastLingGuangMultiplier:clamp(v?.lastLingGuangMultiplier||1,1,10),lastLingGuangTick:Math.max(0,Math.floor(Number(v?.lastLingGuangTick)||0))};}
