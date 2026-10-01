// B2/B3/B4/B6 Body production facade.
// The historical all-Dao implementation is preserved verbatim in battle-dao-v2-runtime-base.js.
// Explicit exports below override only Main Body behavior; every unrelated Dao remains delegated.
export * from './battle-dao-v2-runtime-base.js';
import * as base from './battle-dao-v2-runtime-base.js';

export const BODY_DAO_RUNTIME_PRODUCTION_SCHEMA_V1 = 'body-dao.runtime.production.v1';
export const BODY_BLOOD_RUSH_SKILL_ID_V1 = 'skill.dao.body.elephant';
export const BODY_BLOOD_RUSH_HP_COST_PCT_V1 = 10;
export const BODY_BLOOD_RUSH_MIN_HP_PCT_V1 = 35;
export const BODY_BLOOD_RUSH_DURATION_SECONDS_V1 = 6;
export const BODY_BLOOD_RUSH_DAMAGE_BONUS_PCT_V1 = 20;
export const BODY_IMMOVABLE_CHANNEL_DR_PCT_V1 = 25;

const BODY_PASSIVE_PREFIX='passive.v2.body.';
const BODY_IMMOVABLE_SKILL_ID='skill.dao.body.immovable';
const BODY_COUNTER_PAYOFF_SKILLS=new Set([
  'skill.dao.body.transform',
  'skill.dao.body.counter',
  'skill.dao.body.break',
  'skill.dao.body.finisher',
]);
const BODY_CASHOUT_V1=Object.freeze({
  'skill.dao.body.counter':Object.freeze({amount:30,minimum:20}),
  'skill.dao.body.break':Object.freeze({amount:20,minimum:20}),
  'skill.dao.body.recover':Object.freeze({amount:40,minimum:20}),
  'skill.dao.body.finisher':Object.freeze({amount:'all',minimum:30}),
});

const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number.isFinite(v)?v:min));
const scale=(level,a,b)=>a+(b-a)*((clamp(level,1,20)-1)/19);
const mainBody=entity=>entity?.combatBuildV117?.mainDaoId==='body';
const bodyPassiveId=n=>`${BODY_PASSIVE_PREFIX}p${n}`;
const hasBodyPassive=(entity,n)=>Boolean(entity?.combatBuildV117?.learnedDaoPassiveIdsV118?.includes(bodyPassiveId(n)));
const bodyPassiveLevel=(entity,n)=>clamp(Math.floor(entity?.combatBuildV117?.passiveLevelsV125?.[bodyPassiveId(n)]??1),1,20);
const bodyMaxHp=entity=>Math.max(1,Number(entity?.baseStats?.maxHp)||Number(entity?.hp)||1);
const bodyHpPct=entity=>Math.max(0,Number(entity?.hp)||0)/bodyMaxHp(entity)*100;

function bodyMaskedBuild(entity){
  const build=entity?.combatBuildV117;
  if(!build||!mainBody(entity)) return build;
  return {
    ...build,
    // Main Body production no longer lets the generic get-hit stack own p1..p8 behavior.
    learnedDaoPassiveIdsV118:(build.learnedDaoPassiveIdsV118??[]).filter(id=>!String(id).startsWith(BODY_PASSIVE_PREFIX)),
  };
}
function bodyView(entity,{zeroCounter=false}={}){
  if(!entity||!mainBody(entity)) return entity;
  let state=entity.battleDaoStateV2;
  if(zeroCounter&&state?.body?.core){
    state={...state,body:{...state.body,core:{...state.body.core,counterForce:0}}};
  }
  return {...entity,combatBuildV117:bodyMaskedBuild(entity),battleDaoStateV2:state};
}
function ensureBodyProductionState(entity,now=0){
  if(!mainBody(entity)||!base.battleDaoV2Enabled(entity)) return undefined;
  if(!entity.battleDaoStateV2){
    entity.battleDaoStateV2=base.createBattleDaoRuntimeStateV2(bodyView(entity),now);
  }
  const holder=entity.battleDaoStateV2?.body;
  if(!holder) return undefined;
  // Runtime stack is transient combat state, so removing it is non-destructive to persistent passive ids/save identity.
  delete holder.stack;
  const core=holder.core;
  if(core){
    core.productionAuthorityV1=BODY_DAO_RUNTIME_PRODUCTION_SCHEMA_V1;
    core.bodyGuardWindowUntil=Math.max(0,Number(core.bodyGuardWindowUntil)||0);
    core.bodyCycleWindowUntil=Math.max(0,Number(core.bodyCycleWindowUntil)||0);
    core.bodyMitigationEvents=Math.max(0,Math.floor(Number(core.bodyMitigationEvents)||0));
    core.bodyCashoutEvents=Math.max(0,Math.floor(Number(core.bodyCashoutEvents)||0));
    core.bodyBloodRushUntil=Math.max(0,Number(core.bodyBloodRushUntil)||0);
    core.bodyBloodRushActivations=Math.max(0,Math.floor(Number(core.bodyBloodRushActivations)||0));
    core.bodyBloodRushHpPaid=Math.max(0,Number(core.bodyBloodRushHpPaid)||0);
    if(core.bodyBloodRushUntil>0&&now>=core.bodyBloodRushUntil) core.bodyBloodRushUntil=0;
  }
  return core;
}
function bodyGuardWindowSeconds(entity){
  return 2+(hasBodyPassive(entity,3)?scale(bodyPassiveLevel(entity,3),1,3):0);
}
function bodyGuardWindowActive(entity,now){
  return (entity?.battleDaoStateV2?.body?.core?.bodyGuardWindowUntil??0)>now;
}
function bodyCycleWindowActive(entity,now){
  return (entity?.battleDaoStateV2?.body?.core?.bodyCycleWindowUntil??0)>now;
}
function bodyBloodRushActive(entity,now){
  return (entity?.battleDaoStateV2?.body?.core?.bodyBloodRushUntil??0)>now;
}
function bodyImmovableChannelActive(entity){
  return entity?.channeling?.skillId===BODY_IMMOVABLE_SKILL_ID;
}
function isBodySkillId(skillId){ return String(skillId??'').startsWith('skill.dao.body.'); }
function isMainBodySkill(entity,skill){
  return mainBody(entity)&&skill?.runtimeV117?.daoBinding==='body'&&isBodySkillId(skill?.id);
}

export function createBattleDaoRuntimeStateV2(entity,now=0){
  if(!mainBody(entity)) return base.createBattleDaoRuntimeStateV2(entity,now);
  const state=base.createBattleDaoRuntimeStateV2(bodyView(entity),now);
  if(state?.body){
    delete state.body.stack;
    if(state.body.core){
      state.body.core.productionAuthorityV1=BODY_DAO_RUNTIME_PRODUCTION_SCHEMA_V1;
      state.body.core.bodyGuardWindowUntil=0;
      state.body.core.bodyCycleWindowUntil=0;
      state.body.core.bodyMitigationEvents=0;
      state.body.core.bodyCashoutEvents=0;
      state.body.core.bodyBloodRushUntil=0;
      state.body.core.bodyBloodRushActivations=0;
      state.body.core.bodyBloodRushHpPaid=0;
    }
  }
  return state;
}

export function syncBattleDaoV2Timers(entity,now){
  if(!mainBody(entity)) return base.syncBattleDaoV2Timers(entity,now);
  ensureBodyProductionState(entity,now);
  const result=base.syncBattleDaoV2Timers(bodyView(entity),now);
  ensureBodyProductionState(entity,now);
  return result;
}

export function remainingDaoPassiveBonusesV2(entity,now){
  return base.remainingDaoPassiveBonusesV2(mainBody(entity)?bodyView(entity):entity,now);
}

export function battleDaoV2OutgoingMultiplier(entity,target,now,sourceTag,skillId){
  if(!mainBody(entity)) return base.battleDaoV2OutgoingMultiplier(entity,target,now,sourceTag,skillId);
  ensureBodyProductionState(entity,now);
  // Zero the legacy “hold Phản Thế = free damage” lane; production payoff comes from executed windows/cash-outs.
  let multiplier=base.battleDaoV2OutgoingMultiplier(bodyView(entity,{zeroCounter:true}),target,now,sourceTag,skillId);
  if(isBodySkillId(skillId)&&bodyBloodRushActive(entity,now)){
    multiplier*=1+BODY_BLOOD_RUSH_DAMAGE_BONUS_PCT_V1/100;
  }
  if(isBodySkillId(skillId)&&BODY_COUNTER_PAYOFF_SKILLS.has(skillId)&&bodyGuardWindowActive(entity,now)&&hasBodyPassive(entity,4)){
    multiplier*=1+scale(bodyPassiveLevel(entity,4),4,12)/100;
  }
  if(isBodySkillId(skillId)&&bodyCycleWindowActive(entity,now)&&hasBodyPassive(entity,8)){
    multiplier*=1+scale(bodyPassiveLevel(entity,8),8,20)/100;
  }
  return multiplier;
}

export function battleDaoV2IncomingDamageMultiplier(entity,now){
  if(!mainBody(entity)) return base.battleDaoV2IncomingDamageMultiplier(entity,now);
  ensureBodyProductionState(entity,now);
  // Remove legacy passive DR from simply holding resource.
  let multiplier=base.battleDaoV2IncomingDamageMultiplier(bodyView(entity,{zeroCounter:true}),now);
  // B6 Bất Động identity: the actor is actually harder to hurt only while the channel is live.
  if(bodyImmovableChannelActive(entity)){
    multiplier*=1-BODY_IMMOVABLE_CHANNEL_DR_PCT_V1/100;
  }
  if(bodyGuardWindowActive(entity,now)&&hasBodyPassive(entity,7)){
    const reduction=scale(bodyPassiveLevel(entity,7),4,12);
    multiplier*=1-reduction/100;
  }
  return Math.max(.2,multiplier);
}

export function battleDaoV2BreakMultiplier(entity,now,skillId){
  return base.battleDaoV2BreakMultiplier(mainBody(entity)?bodyView(entity):entity,now,skillId);
}
export function battleDaoV2SpiritCostMultiplier(entity,skill,now){
  return base.battleDaoV2SpiritCostMultiplier(mainBody(entity)?bodyView(entity):entity,skill,now);
}
export function battleDaoV2RecoveryMultiplier(entity,now){
  return base.battleDaoV2RecoveryMultiplier(mainBody(entity)?bodyView(entity):entity,now);
}
export function battleDaoV2GaugeMultiplier(entity,now){
  if(!mainBody(entity)) return base.battleDaoV2GaugeMultiplier(entity,now);
  ensureBodyProductionState(entity,now);
  let multiplier=base.battleDaoV2GaugeMultiplier(bodyView(entity),now);
  const force=entity.battleDaoStateV2?.body?.core?.counterForce??0;
  if(force>=80&&hasBodyPassive(entity,5)) multiplier*=1+scale(bodyPassiveLevel(entity,5),5,12)/100;
  return multiplier;
}
export function battleDaoV2HealShieldMultiplier(entity,now){
  return base.battleDaoV2HealShieldMultiplier(mainBody(entity)?bodyView(entity):entity,now);
}

export function onBattleDaoV2HpDamageTaken(entity,...args){
  // Main Body must not farm a second Huyết Khí meter from raw HP loss.
  if(mainBody(entity)){
    ensureBodyProductionState(entity,args[1]??0);
    return 0;
  }
  return base.onBattleDaoV2HpDamageTaken(entity,...args);
}

export function onBattleDaoV2Mitigation(entity,eventBudget,mitigatedRatio,now){
  if(!mainBody(entity)) return base.onBattleDaoV2Mitigation(entity,eventBudget,mitigatedRatio,now);
  const core=ensureBodyProductionState(entity,now);
  if(!core) return 0;
  const before=Math.max(0,Number(core.counterForce)||0);
  base.onBattleDaoV2Mitigation(bodyView(entity),eventBudget,mitigatedRatio,now);
  let gained=Math.max(0,(Number(core.counterForce)||0)-before);
  if(gained<=0) return 0;

  // p1/p2 now improve successful conversion instead of rewarding HP loss.
  let bonusPct=hasBodyPassive(entity,1)?5:0;
  if(hasBodyPassive(entity,2)) bonusPct+=scale(bodyPassiveLevel(entity,2),10,25);
  const bonus=gained*bonusPct/100;
  if(bonus>0){
    const prior=core.counterForce;
    core.counterForce=Math.min(core.counterForceCap??100,prior+bonus);
    gained+=Math.max(0,core.counterForce-prior);
  }
  core.bodyMitigationEvents+=1;
  core.bodyGuardWindowUntil=Math.max(core.bodyGuardWindowUntil,now+bodyGuardWindowSeconds(entity));
  return gained;
}

export function prepareRemainingDaoCoreActionV2(entity,target,skill,action,now,...rest){
  if(!isMainBodySkill(entity,skill)){
    return base.prepareRemainingDaoCoreActionV2(mainBody(entity)?bodyView(entity):entity,target,skill,action,now,...rest);
  }
  const core=ensureBodyProductionState(entity,now);
  if(!core||!action?.battleDaoV2) return;
  const d=action.battleDaoV2.daoData??(action.battleDaoV2.daoData={});
  const before=clamp(Number(core.counterForce)||0,0,core.counterForceCap??100);
  const spendRule=BODY_CASHOUT_V1[skill.id];
  let spent=0;
  let perfect=false;

  d.counterForceBefore=before;
  d.counterForceSpent=0;
  d.counterForceAfter=before;
  d.bodyCashoutSkillId=undefined;
  d.bodyPerfectCashout=false;
  d.bodyRecoverySpendBonusPct=0;
  d.bodyBloodRushActivated=false;
  d.bodyBloodRushSuppressedLowHp=false;
  d.bodyBloodRushHpPaid=0;
  d.bodyBloodRushUntil=core.bodyBloodRushUntil;

  if(skill.id===BODY_BLOOD_RUSH_SKILL_ID_V1){
    const hpPct=bodyHpPct(entity);
    if(hpPct+1e-9>=BODY_BLOOD_RUSH_MIN_HP_PCT_V1){
      const requested=bodyMaxHp(entity)*BODY_BLOOD_RUSH_HP_COST_PCT_V1/100;
      const paid=Math.min(requested,Math.max(0,(Number(entity.hp)||0)-1));
      if(paid>0){
        entity.hp=Math.max(1,(Number(entity.hp)||0)-paid);
        core.bodyBloodRushUntil=now+BODY_BLOOD_RUSH_DURATION_SECONDS_V1;
        core.bodyBloodRushActivations+=1;
        core.bodyBloodRushHpPaid+=paid;
        d.bodyBloodRushActivated=true;
        d.bodyBloodRushHpPaid=paid;
        d.bodyBloodRushUntil=core.bodyBloodRushUntil;
      }
    }else{
      d.bodyBloodRushSuppressedLowHp=true;
    }
  }

  if(spendRule&&before+1e-9>=spendRule.minimum){
    const wanted=spendRule.amount==='all'?before:Math.max(0,Number(spendRule.amount)||0);
    spent=Math.min(before,wanted);
    perfect=before>=100-1e-9&&spent>0;
    core.counterForce=Math.max(0,before-spent);
    core.bodyCashoutEvents+=1;
    d.counterForceSpent=spent;
    d.counterForceAfter=core.counterForce;
    d.bodyCashoutSkillId=skill.id;
    d.bodyPerfectCashout=perfect;

    // Chân Thân Viên Mãn empowers the deliberately chosen cash-out only.
    if(perfect) action.effectBonusPct+=40;

    // p6 keeps its historical 4→12% coefficient, but ownership is now intentional
    // Phản Thế spend: each full 20 spent by Quy Nguyên strengthens that root's heal/shield.
    if(skill.id==='skill.dao.body.recover'&&hasBodyPassive(entity,6)){
      const groups=Math.min(2,Math.floor(spent/20));
      if(groups>0){
        const bonusPct=groups*scale(bodyPassiveLevel(entity,6),4,12);
        d.bodyRecoverySpendBonusPct=bonusPct;
        action.effectBonusPct+=bonusPct;
      }
    }
  }

  // Preserve the shared V2 recovery multiplier without invoking the old Body cap auto-spend branch.
  action.recoveryMultiplier*=battleDaoV2RecoveryMultiplier(entity,now);
}

export function finishRemainingDaoActionV2(entity,target,skill,action,now,chance,...rest){
  if(!mainBody(entity)) return base.finishRemainingDaoActionV2(entity,target,skill,action,now,chance,...rest);
  const core=ensureBodyProductionState(entity,now);
  const result=base.finishRemainingDaoActionV2(bodyView(entity),target,skill,action,now,chance,...rest);
  ensureBodyProductionState(entity,now);
  const spent=Math.max(0,Number(action?.battleDaoV2?.daoData?.counterForceSpent)||0);
  if(core&&spent>0&&isBodySkillId(skill?.id)&&hasBodyPassive(entity,8)){
    core.bodyCycleWindowUntil=Math.max(core.bodyCycleWindowUntil,now+scale(bodyPassiveLevel(entity,8),2,4));
  }
  return result;
}

export function recordDamageOutcomeV2(entity,...args){
  return base.recordDamageOutcomeV2(mainBody(entity)?bodyView(entity):entity,...args);
}

export function v2ResourceProjection(entity,now){
  if(!mainBody(entity)) return base.v2ResourceProjection(entity,now);
  syncBattleDaoV2Timers(entity,now);
  const out=base.v2ResourceProjection(bodyView(entity),now);
  if(out&&typeof out==='object'){
    const core=entity.battleDaoStateV2?.body?.core;
    out.bodyProductionAuthorityV1=BODY_DAO_RUNTIME_PRODUCTION_SCHEMA_V1;
    out.bodyGuardWindowActive=bodyGuardWindowActive(entity,now);
    out.bodyCycleWindowActive=bodyCycleWindowActive(entity,now);
    out.bodyMitigationEvents=core?.bodyMitigationEvents??0;
    out.bodyCashoutEvents=core?.bodyCashoutEvents??0;
    out.bodyBloodRushActive=bodyBloodRushActive(entity,now);
    out.bodyBloodRushRemainingSeconds=Math.max(0,(core?.bodyBloodRushUntil??0)-now);
    out.bodyBloodRushActivations=core?.bodyBloodRushActivations??0;
    out.bodyBloodRushHpPaid=core?.bodyBloodRushHpPaid??0;
    delete out.bodyPassiveStack;
    delete out.bodyPassiveStackCap;
  }
  return out;
}
