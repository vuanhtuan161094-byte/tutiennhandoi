import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { createBattleDaoRuntimeStateV2, prepareRemainingDaoCoreActionV2, finishRemainingDaoActionV2, remainingDaoPassiveBonusesV2, v2ResourceProjection } from '../../dist/core/battle-dao-v2-runtime.js';
import { canUseBattleDaoSkillV118, prepareBattleDaoActionV118 } from '../../dist/core/battle-dao-combat-v118.js';

const registry=buildRegistry();
const makeEntity=(main='spell',secondary)=>{
  const e={id:'spell-p1',name:'Spell P1',combatBuildV117:{battleDaoV2Enabled:true,mainDaoId:main,secondaryDaoId:secondary,learnedDaoPassiveIdsV118:Array.from({length:8},(_,i)=>'passive.v2.spell.p'+(i+1)),passiveLevelsV125:Object.fromEntries(Array.from({length:8},(_,i)=>['passive.v2.spell.p'+(i+1),20]))},daoStateV118:{spellSeal:3},pendingSetFlagsV117:{}};
  e.battleDaoStateV2=createBattleDaoRuntimeStateV2(e,0);
  return e;
};
const makeAction=()=>({battleDaoV2:{daoData:{}},effectBonusPct:0,breakBonusPct:0,recoveryMultiplier:1});
const prepare=(e,id)=>{
  const skill=registry.skills.get(id),action=makeAction();
  prepareBattleDaoActionV118(e,{id:'target'},skill,action,0);
  prepareRemainingDaoCoreActionV2(e,{id:'target'},skill,action,0);
  return {skill,action};
};
const finish=(e,skill,action,now=1)=>finishRemainingDaoActionV2(e,{id:'target'},skill,action,now,()=>false);

{
  const e=makeEntity(),core=e.battleDaoStateV2.spell.core;
  assert.equal(core.expectedForm,'Tốc Pháp');
  const wrong=prepare(e,'skill.dao.spell.seal');
  finish(e,wrong.skill,wrong.action);
  assert.equal(core.lawWheelStage,0,'wrong form cannot advance the ordered wheel');
  assert.equal(core.expectedForm,'Tốc Pháp');
  const first=prepare(e,'skill.dao.spell.light');finish(e,first.skill,first.action,2);
  assert.equal(core.lawWheelStage,1);assert.equal(core.expectedForm,'Thi Triển');
  const repeat=prepare(e,'skill.dao.spell.light');finish(e,repeat.skill,repeat.action,3);
  assert.equal(core.lawWheelStage,1,'repeating an old form preserves the current stage');
  const interruptedCast=prepare(e,'skill.dao.spell.seal');
  assert.equal(core.lawWheelStage,1);
  // An interrupted cast has no finish callback, matching CombatEngine.interruptAction.
  assert.equal(core.expectedForm,'Thi Triển');
  const cast=prepare(e,'skill.dao.spell.seal');finish(e,cast.skill,cast.action,5);
  assert.equal(core.expectedForm,'Dẫn Pháp');
  const partialChannel=prepare(e,'skill.dao.spell.channel');
  assert.equal(core.completedCycles,0);
  // Channel interruption leaves resolved ticks intact but never runs channel completion.
  assert.equal(core.expectedForm,'Dẫn Pháp');
  const channel=prepare(e,'skill.dao.spell.channel');finish(e,channel.skill,channel.action,8);
  assert.equal(core.completedCycles,1);assert.equal(core.lawWheelStage,0);assert.equal(core.dienPhapReady,true);
  assert.equal(core.expectedForm,'Tốc Pháp');
  void interruptedCast;void partialChannel;
}
{
  const e=makeEntity(),core=e.battleDaoStateV2.spell.core;
  core.dienPhapReady=true;
  const burst=prepare(e,'skill.dao.spell.burst');
  assert.equal(core.dienPhapReady,true,'preparing the payoff must not consume readiness');
  assert.equal(burst.action.effectBonusPct,47,'base Diễn Pháp + p6 payoff + capped p8 payoff are snapshotted action-locally');
  assert.equal(burst.action.battleDaoV2.daoData.spellDienPhapSnapshot,true);
  // Cast interruption before resolution: no finish callback, so readiness is retained.
  assert.equal(core.dienPhapReady,true);
  finish(e,burst.skill,burst.action,2);
  assert.equal(core.dienPhapReady,false);assert.equal(core.dienPhapCommits,1);
  finish(e,burst.skill,burst.action,3);
  assert.equal(core.dienPhapCommits,1,'one root transaction cannot spend twice');
  const projection=v2ResourceProjection(e,4);
  assert.equal(projection.dienPhapReady,false);assert.equal(projection.dienPhapCommits,1);
}
{
  const e=makeEntity();
  const normal=remainingDaoPassiveBonusesV2(e,0);
  assert.equal(normal.directDamagePct,0,'Spell passives must not create a generic damage multiplier');
  assert.equal(normal.recoveryReductionPct,0,'Spell passives must not create generic recovery reduction');
  const secondary=makeEntity('sword','spell');
  assert.equal(secondary.battleDaoStateV2.spell.core,undefined);
  assert.equal(canUseBattleDaoSkillV118(secondary,registry.skills.get('skill.dao.spell.burst')),false);
  secondary.battleDaoStateV2.spell.stack.stacks=20;secondary.battleDaoStateV2.spell.stack.expiresAt=12;
  const bonuses=remainingDaoPassiveBonusesV2(secondary,0);
  assert.equal(bonuses.directDamagePct,0);assert.equal(bonuses.recoveryReductionPct,0);
  assert.equal(secondary.daoStateV118.spellSeal,3,'legacy V1 field is inert');
}
{
  const e=makeEntity();
  const core=e.battleDaoStateV2.spell.core;
  delete core.schema;core.lawWheelForms=['Tốc Pháp','Thi Triển'];
  const projection=v2ResourceProjection(e,0);
  assert.equal(projection.lawWheel,0,'unordered legacy progress is reset deterministically');
  assert.equal(projection.lawWheelExpectedForm,'Tốc Pháp');
  assert.equal(Object.hasOwn(core,'lawWheelForms'),false);
}
{
  const e=makeEntity(),restore=prepare(e,'skill.dao.spell.restore');
  assert.equal(finish(e,restore.skill,restore.action,2).notices.length,0);
  assert.equal(e.battleDaoStateV2.spell.core.lawWheelStage,0,'restore is explicitly not wheel eligible');
  const basic=prepare(e,'skill.dao.spell.basic');finish(e,basic.skill,basic.action,3);
  assert.equal(e.battleDaoStateV2.spell.core.lawWheelStage,1,'Basic completes only the genuine Instant Tốc step');
  assert.equal(prepare(e,'skill.dao.spell.transform').skill.spellDaoV1,undefined);
}
console.log('SPELL DAO P1 ORDERED WHEEL AND TRANSACTION PASS');
