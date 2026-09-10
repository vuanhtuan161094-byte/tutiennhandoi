import { createCollectionProgressStateV12316 } from './collection-progression-v12316.js';
import {
  GACHA_BANNERS_V12326,
  collectionCatalogV12326,
  gachaCollectionV12326,
  setManualGachaOrientationV127,
  setManualGachaRealmV127,
} from './collection-workshop-gacha-v12326.js';
import { manualAdvanceCostV127 } from './manual-progression-v127.js';
import { recurringBoundJadePerDayV160 } from './full-life-acquisition-v160.js';

export const BOUND_JADE_SPEND_MODEL_V161_SCHEMA='bound-jade-spend-model.v161';
export const V161_SPEND_HORIZONS_DAYS=Object.freeze([28,90,180,365]);
export const V161_SPEND_SEEDS=Object.freeze([16101,16131,16161,16191,16221]);
const CATEGORIES=Object.freeze(GACHA_BANNERS_V12326.map(x=>x.category));
const round=(v,d=3)=>Number(Number(v||0).toFixed(d));

export const V161_SPEND_PROFILES=Object.freeze({
  manualFocused:Object.freeze({
    id:'manualFocused',label:'Công Pháp trọng tâm',
    weights:Object.freeze({manual:.50,heart:.10,artifact:.10,relic:.08,pet:.07,companion:.05,bloodline:.05,physique:.05}),
  }),
  balanced:Object.freeze({
    id:'balanced',label:'Cân bằng 8 hệ',
    weights:Object.freeze({manual:.125,heart:.125,artifact:.125,relic:.125,pet:.125,companion:.125,bloodline:.125,physique:.125}),
  }),
  combatFirst:Object.freeze({
    id:'combatFirst',label:'Combat collection trước',
    weights:Object.freeze({manual:.10,heart:.15,artifact:.18,relic:.14,pet:.14,companion:.11,bloodline:.09,physique:.09}),
  }),
});

function validateProfiles(){
  for(const profile of Object.values(V161_SPEND_PROFILES)){
    const sum=CATEGORIES.reduce((s,c)=>s+Number(profile.weights[c]||0),0);
    if(Math.abs(sum-1)>1e-9)throw new Error(`V161 spend profile ${profile.id} must total 100%, got ${sum}`);
  }
}
validateProfiles();

function pullPlanFromBudget(budget){
  const b=Math.max(0,Math.floor(Number(budget)||0));
  const tens=Math.floor(b/1440);
  const remainder=b-tens*1440;
  const singles=Math.floor(remainder/160);
  return {budget:b,tens,singles,pulls:tens*10+singles,cost:tens*1440+singles*160,unspent:b-(tens*1440+singles*160)};
}

function manualTarget(){
  const pool=collectionCatalogV12326('manual').filter(x=>Number(x.realmStageIndex)===28);
  return [...pool].sort((a,b)=>{
    const grade=['mundane','spirit','mystic','earth','heaven','immortal','extreme','breaker'];
    return grade.indexOf(b.grade)-grade.indexOf(a.grade)||String(a.id).localeCompare(String(b.id));
  })[0];
}

function affordableManualGates(def,fragments){
  let spent=0,count=0;
  for(let advance=0;advance<10;advance++){
    const cost=manualAdvanceCostV127(def,{advance,level:(advance+1)*100});
    if(spent+cost>fragments)break;
    spent+=cost;count++;
  }
  return {count,spent,next:count<10?manualAdvanceCostV127(def,{advance:count,level:(count+1)*100}):0};
}

function simulateCategory(state,inventory,banner,plan,seed,seen,kinds){
  let cursor=0;
  for(let i=0;i<plan.tens;i++){
    const result=gachaCollectionV12326(state,inventory,banner.id,10,seed+cursor*17,false,[],117);
    cursor+=10;
    for(const row of result.results){if(row.id)seen.add(row.id);kinds[row.kind]=(kinds[row.kind]||0)+1;}
  }
  for(let i=0;i<plan.singles;i++){
    const result=gachaCollectionV12326(state,inventory,banner.id,1,seed+cursor*17,false,[],117);
    cursor+=1;
    for(const row of result.results){if(row.id)seen.add(row.id);kinds[row.kind]=(kinds[row.kind]||0)+1;}
  }
}

export function simulateBoundJadeSpendV161(profileId,days,seed){
  const profile=V161_SPEND_PROFILES[profileId];
  if(!profile)throw new Error(`Unknown V161 spend profile: ${profileId}`);
  const horizon=Math.max(1,Math.floor(Number(days)||1));
  const totalBudget=Math.floor(recurringBoundJadePerDayV160()*horizon);
  const state=createCollectionProgressStateV12316();
  state.currencies.boundImmortalJade=totalBudget;
  const inventory={};
  const target=manualTarget();
  setManualGachaRealmV127(state,28,117);
  setManualGachaOrientationV127(state,target.id,117);
  const categories={};
  let totalCost=0,totalPulls=0;
  for(let index=0;index<GACHA_BANNERS_V12326.length;index++){
    const banner=GACHA_BANNERS_V12326[index];
    const allocated=Math.floor(totalBudget*profile.weights[banner.category]);
    const plan=pullPlanFromBudget(allocated);
    const seen=new Set(),kinds={};
    simulateCategory(state,inventory,banner,plan,Number(seed)+index*100003,seen,kinds);
    categories[banner.category]={...plan,allocatedBudget:allocated,uniqueItemIds:[...seen].sort(),uniqueItemCount:seen.size,kinds};
    totalCost+=plan.cost;totalPulls+=plan.pulls;
  }
  const progress=state.items?.[target.id]??{specificFragments:0,owned:false};
  const targetFragments=Math.max(0,Number(progress.specificFragments)||0);
  const affordable=affordableManualGates(target,targetFragments);
  return {
    schema:BOUND_JADE_SPEND_MODEL_V161_SCHEMA,
    profileId:profile.id,
    profileLabel:profile.label,
    assumptions:{weights:{...profile.weights},note:'Diagnostic player-spend allocation only. It does not change banner rates, prices or game rules.'},
    horizonDays:horizon,
    seed:Number(seed),
    recurringBoundJadePerDay:round(recurringBoundJadePerDayV160()),
    totalBudget,
    totalCost,
    unspentBudget:totalBudget-totalCost,
    totalPulls,
    categories,
    manualTarget:{id:target.id,name:target.name,grade:target.grade,fragments:targetFragments,owned:progress.owned===true,affordableGates:affordable.count,fragmentsSpentIfAdvanced:affordable.spent,nextGateFragments:affordable.next},
  };
}

function average(values){return values.length?values.reduce((a,b)=>a+b,0)/values.length:0;}
function aggregateProfile(profileId,days){
  const runs=V161_SPEND_SEEDS.map(seed=>simulateBoundJadeSpendV161(profileId,days,seed));
  const categories=Object.fromEntries(CATEGORIES.map(category=>[category,{
    avgPulls:round(average(runs.map(x=>x.categories[category].pulls)),2),
    avgUniqueItems:round(average(runs.map(x=>x.categories[category].uniqueItemCount)),2),
    minUniqueItems:Math.min(...runs.map(x=>x.categories[category].uniqueItemCount)),
    maxUniqueItems:Math.max(...runs.map(x=>x.categories[category].uniqueItemCount)),
  }]));
  return {
    profileId,days,runCount:runs.length,
    avgTotalPulls:round(average(runs.map(x=>x.totalPulls)),2),
    categories,
    manualTarget:{
      avgFragments:round(average(runs.map(x=>x.manualTarget.fragments)),2),
      minFragments:Math.min(...runs.map(x=>x.manualTarget.fragments)),
      maxFragments:Math.max(...runs.map(x=>x.manualTarget.fragments)),
      avgAffordableGates:round(average(runs.map(x=>x.manualTarget.affordableGates)),2),
      minAffordableGates:Math.min(...runs.map(x=>x.manualTarget.affordableGates)),
      maxAffordableGates:Math.max(...runs.map(x=>x.manualTarget.affordableGates)),
    },
  };
}

export function buildBoundJadeSpendAuditV161(){
  const profiles=Object.keys(V161_SPEND_PROFILES);
  const matrix=[];
  for(const days of V161_SPEND_HORIZONS_DAYS)for(const profile of profiles)matrix.push(aggregateProfile(profile,days));
  return {
    schema:BOUND_JADE_SPEND_MODEL_V161_SCHEMA,
    bannerCategories:[...CATEGORIES],
    horizons:[...V161_SPEND_HORIZONS_DAYS],
    seeds:[...V161_SPEND_SEEDS],
    profiles:Object.fromEntries(Object.entries(V161_SPEND_PROFILES).map(([k,v])=>[k,{label:v.label,weights:{...v.weights}}])),
    matrix,
    interpretation:'Use the same recurring Bound Jade budget across production banners. This measures opportunity cost and starvation; it is not a recommendation to force players into any profile.',
  };
}
