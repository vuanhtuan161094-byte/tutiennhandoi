import { CULTIVATION_REALMS_V140 } from './cultivation-v140.js';
import { buildGameplayClarityV102 } from './player-experience-v105.js';

export const EARLY_PACING_V161_SCHEMA='early-pacing.v161';
const round=(v,d=3)=>Number(Number(v||0).toFixed(d));

function unlockedIds(order){
  return new Set(buildGameplayClarityV102({order}).systems.filter(x=>x.unlocked).map(x=>x.id));
}
function newlyUnlocked(order,previousOrder){
  const current=unlockedIds(order),previous=unlockedIds(previousOrder);
  return [...current].filter(x=>!previous.has(x));
}
function row(order){
  const r=CULTIVATION_REALMS_V140[order];
  return {
    order:r.order,
    name:r.name,
    majorRealmName:r.majorRealmName,
    targetSeconds:r.targetSeconds,
    targetMinutes:round(r.targetSeconds/60,2),
    targetHours:round(r.targetSeconds/3600,3),
    previousDurationRatio:order>0?round(r.targetSeconds/CULTIVATION_REALMS_V140[order-1].targetSeconds,2):1,
  };
}

export function buildEarlyPacingAuditV161(){
  const qi=row(1),foundation=row(10);
  const qiUnlocks=newlyUnlocked(1,0);
  const foundationUnlocks=newlyUnlocked(10,9);
  const foundationTotalHours=round(CULTIVATION_REALMS_V140.filter(x=>x.majorRealmIndex===2).reduce((s,x)=>s+x.targetSeconds,0)/3600,2);
  return {
    schema:EARLY_PACING_V161_SCHEMA,
    findings:[
      {
        id:'qi-entry',
        ...qi,
        newSystems:qiUnlocks,
        classification:'keep-authored-duration',
        rationale:'The relative jump is large because Phàm Nhân is only a five-minute opening. The absolute 28.6-minute first Luyện Khí step gives the player time to enter Hunt / dungeon / social loops without producing an hours-long opening stall.',
      },
      {
        id:'foundation-entry',
        ...foundation,
        majorRealmTotalHours:foundationTotalHours,
        newSystems:foundationUnlocks,
        classification:'keep-duration-sequence-onboarding',
        rationale:'The 2.7-hour first Trúc Cơ step is not excessive by itself for an idle game, but six long-term systems become available together. Preserve pacing for now and solve cognitive overload through progressive guidance/reveal before touching the cultivation curve.',
      },
    ],
    action:'No V140 cultivation-number change from B2. Lock the measured durations; carry Trúc Cơ system-density into UI/onboarding and later player QA.',
  };
}
