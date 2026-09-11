import {
  createCollectionProgressStateV12316,
  collectionManualCultivationPer15sV127,
  strengthenCollectionItemV12316,
  advanceCollectionItemV12316,
} from './collection-progression-v12316.js';
import {
  collectionCatalogV12326,
  composeCollectionItemV12326,
  gachaCollectionV12326,
  setManualGachaOrientationV127,
  setManualGachaRealmV127,
} from './collection-workshop-gacha-v12326.js';
import {
  MANUAL_REALM_STAGES_V127,
  manualAdvanceCostV127,
  manualCanAdvanceV127,
  manualComposeCostV127,
} from './manual-progression-v127.js';
import { cultivationRealmV140 } from './cultivation-v140.js';
import {
  V161_SPEND_HORIZONS_DAYS,
  V161_SPEND_PROFILES,
  V161_SPEND_SEEDS,
  simulateBoundJadeSpendV161,
} from './bound-jade-spend-model-v161.js';

export const MANUAL_ACQUISITION_PACING_V161_SCHEMA='manual-acquisition-pacing.v161';
export const V161_MANUAL_AUDIT_STAGE_INDEXES=Object.freeze([2,14,28]);
export const V161_MANUAL_SAMPLING_MODE='independent-horizon-production-rng';
const GRADE_ORDER=['mundane','spirit','mystic','earth','heaven','immortal','extreme','breaker'];
const round=(v,d=3)=>Number(Number(v||0).toFixed(d));

function stageByIndex(stageIndex){
  const index=Math.max(0,Math.min(MANUAL_REALM_STAGES_V127.length-1,Math.floor(Number(stageIndex)||0)));
  return MANUAL_REALM_STAGES_V127[index];
}

function stagePool(stageIndex){
  return collectionCatalogV12326('manual').filter(x=>Number(x.realmStageIndex)===Number(stageIndex));
}

function orientedTarget(stageIndex){
  return [...stagePool(stageIndex)].sort((a,b)=>GRADE_ORDER.indexOf(b.grade)-GRADE_ORDER.indexOf(a.grade)||Number(b.strengthCostWeightV127||1)-Number(a.strengthCostWeightV127||1)||String(a.id).localeCompare(String(b.id)))[0];
}

function replayManualPulls(state,stage,target,pulls,seed){
  const inventory={};
  state.currencies.boundImmortalJade=999_999_999;
  setManualGachaRealmV127(state,stage.index,stage.requiredRealmOrder);
  setManualGachaOrientationV127(state,target.id,stage.requiredRealmOrder);
  const tens=Math.floor(Math.max(0,pulls)/10),singles=Math.max(0,pulls)%10;
  let cursor=0;
  for(let i=0;i<tens;i++){
    gachaCollectionV12326(state,inventory,'banner.manual',10,Number(seed)+cursor*17,false,[],stage.requiredRealmOrder);
    cursor+=10;
  }
  for(let i=0;i<singles;i++){
    gachaCollectionV12326(state,inventory,'banner.manual',1,Number(seed)+cursor*17,false,[],stage.requiredRealmOrder);
    cursor+=1;
  }
  return inventory;
}

function maxCurrentStageManualFlat(stageIndex){
  const state=createCollectionProgressStateV12316();
  state.items={};
  for(const def of stagePool(stageIndex))state.items[def.id]={owned:true,level:1000,advance:10,specificFragments:0};
  return collectionManualCultivationPer15sV127(state);
}

function progressTargetFirst(state,target,realmOrder){
  const beforeGeneric=Math.max(0,Number(state.genericFragments?.manual)||0);
  const beforeTarget={...(state.items?.[target.id]??{owned:false,level:1,advance:0,specificFragments:0})};
  let composed=false;
  if(!beforeTarget.owned&&Number(beforeTarget.specificFragments||0)>=manualComposeCostV127(target)){
    composeCollectionItemV12326(state,target.id,realmOrder);
    composed=true;
  }
  for(let safety=0;safety<24;safety++){
    const p=state.items?.[target.id];
    if(!p?.owned)break;
    let moved=false;
    if(Number(p.level||1)<1000){
      try{
        const out=strengthenCollectionItemV12316(state,target.id,1000);
        if(Number(out?.levels||0)>0)moved=true;
      }catch{}
    }
    const afterStrength=state.items?.[target.id];
    if(afterStrength?.owned&&Number(afterStrength.advance||0)<10&&manualCanAdvanceV127(afterStrength)){
      const cost=manualAdvanceCostV127(target,afterStrength);
      if(Number(afterStrength.specificFragments||0)>=cost){
        advanceCollectionItemV12316(state,target.id);
        moved=true;
        continue;
      }
    }
    if(!moved)break;
  }
  const after={...(state.items?.[target.id]??{owned:false,level:1,advance:0,specificFragments:0})};
  return {
    composed,
    before:beforeTarget,
    after,
    genericFragmentsBefore:beforeGeneric,
    genericFragmentsSpent:beforeGeneric-Math.max(0,Number(state.genericFragments?.manual)||0),
    genericFragmentsRemaining:Math.max(0,Number(state.genericFragments?.manual)||0),
  };
}

export function simulateManualAcquisitionPacingV161(profileId,stageIndex,days,seed){
  const stage=stageByIndex(stageIndex),target=orientedTarget(stage.index);
  if(!target)throw new Error(`V161 manual stage ${stage.index} has no target.`);
  const spend=simulateBoundJadeSpendV161(profileId,days,seed);
  const manualPulls=Math.max(0,Math.floor(Number(spend.categories?.manual?.pulls)||0));
  const state=createCollectionProgressStateV12316();
  replayManualPulls(state,stage,target,manualPulls,seed);
  const gachaGenericFragments=Math.max(0,Number(state.genericFragments?.manual)||0);
  const gachaBreakthroughEssence=Math.max(0,Number(state.economyV12325?.ascensionEssence?.manual)||0);
  const progression=progressTargetFirst(state,target,stage.requiredRealmOrder);
  const manualFlatPer15s=collectionManualCultivationPer15sV127(state);
  const stageMaxFlatPer15s=maxCurrentStageManualFlat(stage.index);
  const realm=cultivationRealmV140(stage.requiredRealmOrder);
  const base=Math.max(0,Number(realm?.baseTuViPer15s)||0);
  const required=Math.max(0,Number(realm?.requiredTuVi)||0);
  const baselineDays=realm?.nextRealmId&&base>0?required/base*15/86400:0;
  const adjustedRate=base+manualFlatPer15s;
  const adjustedDays=realm?.nextRealmId&&adjustedRate>0?required/adjustedRate*15/86400:0;
  const ownedCurrentStage=stagePool(stage.index).filter(def=>state.items?.[def.id]?.owned).length;
  return {
    schema:MANUAL_ACQUISITION_PACING_V161_SCHEMA,
    samplingMode:V161_MANUAL_SAMPLING_MODE,
    profileId,
    profileLabel:V161_SPEND_PROFILES[profileId]?.label??profileId,
    stageIndex:stage.index,
    stageName:stage.name,
    requiredRealmOrder:stage.requiredRealmOrder,
    horizonDays:Math.max(1,Math.floor(Number(days)||1)),
    seed:Number(seed),
    manualBudget:spend.categories.manual.allocatedBudget,
    manualPulls,
    target:{
      id:target.id,name:target.name,grade:target.grade,
      composeCost:manualComposeCostV127(target),
      composed:progression.composed,
      ownedByGacha:progression.before.owned===true,
      specificFragmentsAfterGacha:Math.max(0,Number(progression.before.specificFragments)||0),
      ownedAfterSpend:progression.after.owned===true,
      level:Math.max(1,Number(progression.after.level)||1),
      advance:Math.max(0,Number(progression.after.advance)||0),
      specificFragmentsRemaining:Math.max(0,Number(progression.after.specificFragments)||0),
    },
    resources:{
      genericFragmentsAfterGacha:gachaGenericFragments,
      genericFragmentsSpent:progression.genericFragmentsSpent,
      genericFragmentsRemaining:progression.genericFragmentsRemaining,
      manualBreakthroughEssenceAfterGacha:gachaBreakthroughEssence,
      note:'Manual levels consume Công Pháp Tàn Ý; 100-level gates consume specific manual fragments through V127 collection authority. Thiên Tinh Công Pháp is reported separately for the later source/sink audit.',
    },
    currentStageOwnedManuals:ownedCurrentStage,
    cultivation:{
      baseTuViPer15s:base,
      acquiredManualFlatPer15s:round(manualFlatPer15s,4),
      acquiredManualPctOfBase:round(base>0?manualFlatPer15s/base*100:0,3),
      theoreticalCurrentStageMaxFlatPer15s:round(stageMaxFlatPer15s,4),
      acquiredShareOfStageMaxPct:round(stageMaxFlatPer15s>0?manualFlatPer15s/stageMaxFlatPer15s*100:0,3),
      baselineRealmDays:round(baselineDays,6),
      realmDaysWithAcquiredManuals:round(adjustedDays,6),
      passiveSpeedup:round(base>0?adjustedRate/base:1,4),
    },
    assumptions:{
      strategy:'Spend the B3 profile manual allocation on the current-stage oriented banner, then invest generic material and specific fragments into the oriented target first. Other manuals obtained by item drops remain active at their acquired level.',
      sampling:'Each horizon is an independent deterministic production-RNG Monte Carlo snapshot using the fixed B3 seed set. It is not a continuation of the same player save, so incidental Lv1 non-target ownership and total flat Tu Vi need not be monotonic between adjacent horizons. Pull opportunity and oriented-target progression are the monotonic pacing signals.',
      excluded:'No Resource-PvE material farming, no previous-realm manual inventory, no reincarnation manual-tree bonuses. This isolates Vạn Tượng acquisition and is conservative for total long-life manual power.',
    },
  };
}

function avg(values){return values.length?values.reduce((a,b)=>a+b,0)/values.length:0;}
function aggregate(stageIndex,profileId,days){
  const runs=V161_SPEND_SEEDS.map(seed=>simulateManualAcquisitionPacingV161(profileId,stageIndex,days,seed));
  return {
    stageIndex:runs[0].stageIndex,stageName:runs[0].stageName,profileId,days,runCount:runs.length,
    samplingMode:V161_MANUAL_SAMPLING_MODE,
    avgManualPulls:round(avg(runs.map(x=>x.manualPulls)),2),
    avgOwnedCurrentStageManuals:round(avg(runs.map(x=>x.currentStageOwnedManuals)),2),
    target:{
      avgLevel:round(avg(runs.map(x=>x.target.level)),2),
      minLevel:Math.min(...runs.map(x=>x.target.level)),maxLevel:Math.max(...runs.map(x=>x.target.level)),
      avgAdvance:round(avg(runs.map(x=>x.target.advance)),2),
      minAdvance:Math.min(...runs.map(x=>x.target.advance)),maxAdvance:Math.max(...runs.map(x=>x.target.advance)),
      ownedAfterSpendCount:runs.filter(x=>x.target.ownedAfterSpend).length,
    },
    cultivation:{
      avgManualFlatPer15s:round(avg(runs.map(x=>x.cultivation.acquiredManualFlatPer15s)),4),
      avgManualPctOfBase:round(avg(runs.map(x=>x.cultivation.acquiredManualPctOfBase)),3),
      avgShareOfStageMaxPct:round(avg(runs.map(x=>x.cultivation.acquiredShareOfStageMaxPct)),3),
      avgPassiveSpeedup:round(avg(runs.map(x=>x.cultivation.passiveSpeedup)),4),
      avgRealmDaysWithAcquiredManuals:round(avg(runs.map(x=>x.cultivation.realmDaysWithAcquiredManuals)),6),
      theoreticalCurrentStageMaxFlatPer15s:runs[0].cultivation.theoreticalCurrentStageMaxFlatPer15s,
      baselineRealmDays:runs[0].cultivation.baselineRealmDays,
    },
    resources:{
      avgGenericAfterGacha:round(avg(runs.map(x=>x.resources.genericFragmentsAfterGacha)),2),
      avgGenericSpent:round(avg(runs.map(x=>x.resources.genericFragmentsSpent)),2),
      avgBreakthroughEssenceAfterGacha:round(avg(runs.map(x=>x.resources.manualBreakthroughEssenceAfterGacha)),2),
    },
  };
}

export function buildManualAcquisitionPacingAuditV161(){
  const matrix=[];
  for(const stageIndex of V161_MANUAL_AUDIT_STAGE_INDEXES){
    for(const days of V161_SPEND_HORIZONS_DAYS){
      for(const profileId of Object.keys(V161_SPEND_PROFILES))matrix.push(aggregate(stageIndex,profileId,days));
    }
  }
  return {
    schema:MANUAL_ACQUISITION_PACING_V161_SCHEMA,
    samplingMode:V161_MANUAL_SAMPLING_MODE,
    stageIndexes:[...V161_MANUAL_AUDIT_STAGE_INDEXES],
    horizons:[...V161_SPEND_HORIZONS_DAYS],
    seeds:[...V161_SPEND_SEEDS],
    profiles:Object.keys(V161_SPEND_PROFILES),
    matrix,
    interpretation:'Acquisition-adjusted current-stage Công Pháp pacing. Theoretical V160 max envelopes are retained only as ceilings. Production gacha ownership, generic strengthen material and specific-fragment gates determine reachable V127 Tu Vi. Horizon rows are independent Monte Carlo snapshots, not one save replayed through time.',
  };
}
