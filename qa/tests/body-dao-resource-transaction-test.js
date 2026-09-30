import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import {
  createBattleDaoRuntimeStateV2,
  finishRemainingDaoActionV2,
  prepareRemainingDaoCoreActionV2,
  v2ResourceProjection,
} from '../../dist/core/battle-dao-v2-runtime.js';

const registry=buildRegistry();
function entity(force=0){
  const e={
    id:'P',name:'Body TX QA',
    combatBuildV117:{
      battleDaoV2Enabled:true,
      mainDaoId:'body',
      learnedDaoPassiveIdsV118:Array.from({length:8},(_,i)=>`passive.v2.body.p${i+1}`),
      passiveLevelsV125:Object.fromEntries(Array.from({length:8},(_,i)=>[`passive.v2.body.p${i+1}`,20])),
    },
  };
  e.battleDaoStateV2=createBattleDaoRuntimeStateV2(e,0);
  e.battleDaoStateV2.body.core.counterForce=force;
  return e;
}
function action(){return{battleDaoV2:{daoData:{}},effectBonusPct:0,breakBonusPct:0,recoveryMultiplier:1};}
function prepare(id,force){
  const e=entity(force),skill=registry.skills.get(id),a=action();
  prepareRemainingDaoCoreActionV2(e,{id:'T'},skill,a,1);
  return{e,skill,a,d:a.battleDaoV2.daoData,core:e.battleDaoStateV2.body.core};
}

{
  const x=prepare('skill.dao.body.counter',10);
  assert.equal(x.d.counterForceSpent,0,'Counter below 20 Phản Thế must not fake a cash-out');
  assert.equal(x.core.counterForce,10);
  assert.equal(x.core.bodyCashoutEvents,0);
}
{
  const x=prepare('skill.dao.body.counter',30);
  assert.equal(x.d.counterForceSpent,30);
  assert.equal(x.d.counterForceAfter,0);
  assert.equal(x.core.counterForce,0);
  assert.equal(x.core.bodyCashoutEvents,1);
}
{
  const x=prepare('skill.dao.body.recover',25);
  assert.equal(x.d.counterForceSpent,25,'Recover may partially cash available force once minimum 20 is met');
  assert.equal(x.core.counterForce,0);
}
{
  const x=prepare('skill.dao.body.recover',80);
  assert.equal(x.d.counterForceSpent,40,'Recover must cap its survival cash-out at 40');
  assert.equal(x.core.counterForce,40);
}
{
  const x=prepare('skill.dao.body.break',100);
  assert.equal(x.d.counterForceSpent,20);
  assert.equal(x.d.bodyPerfectCashout,true,'100 Phản Thế must empower the deliberately chosen spend action');
  assert.equal(x.a.effectBonusPct,40);
  assert.equal(x.core.counterForce,80);
}
{
  const x=prepare('skill.dao.body.guard',100);
  assert.equal(x.d.counterForceSpent,0,'Guard must not trigger the old arbitrary cap auto-spend');
  assert.equal(x.d.bodyPerfectCashout,false);
  assert.equal(x.a.effectBonusPct,0);
  assert.equal(x.core.counterForce,100,'non-cash-out actions must preserve full Phản Thế');
  assert.equal(x.core.bodyCashoutEvents,0);
}
{
  const x=prepare('skill.dao.body.finisher',70);
  assert.equal(x.d.counterForceSpent,70,'Finisher must cash all available Phản Thế once minimum 30 is met');
  assert.equal(x.core.counterForce,0);
  finishRemainingDaoActionV2(x.e,{id:'T'},x.skill,x.a,1.2,()=>false);
  assert.ok(x.core.bodyCycleWindowUntil>1.2,'p8 must open its post-cash-out cycle window only after a real transaction');
  const projection=v2ResourceProjection(x.e,1.2);
  assert.equal(projection.counterForce,0);
  assert.equal(projection.bodyCashoutEvents,1);
  assert.equal(projection.bodyCycleWindowActive,true);
}

console.log('BODY DAO B3 RESOURCE TRANSACTION PASS');
