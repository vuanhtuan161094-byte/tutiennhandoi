import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import {
  battleDaoV2HealShieldMultiplier,
  createBattleDaoRuntimeStateV2,
  prepareRemainingDaoCoreActionV2,
} from '../../dist/core/battle-dao-v2-runtime.js';

const combatSource=fs.readFileSync(new URL('../../dist/core/combat-m1-base.js',import.meta.url),'utf8');
assert(combatSource.includes('runtimeEffectMultiplier * (1 + Math.max(0, source.combatBuildV117?.daoNatureShieldEffectPctV125 ?? 0) / 100) * battleDaoV2HealShieldMultiplier(source, now)'),
  'shared shield consumer must keep V2 heal/shield multiplier in the canonical CombatEngine path');
assert(combatSource.includes('amount * sourceMultiplier * targetBaseMultiplier * statusMultiplier * techniqueHealMultiplier * battleDaoV2HealShieldMultiplier(source, now)'),
  'shared heal consumer must keep V2 heal/shield multiplier in the canonical CombatEngine path');

const registry=buildRegistry();
const recover=registry.skills.get('skill.dao.body.recover');
const counter=registry.skills.get('skill.dao.body.counter');

function entity(force=0,{p6=true,p6Level=20}={}){
  const learned=Array.from({length:8},(_,i)=>`passive.v2.body.p${i+1}`).filter(id=>p6||id!=='passive.v2.body.p6');
  const e={
    id:'P',name:'Body B4 QA',
    combatBuildV117:{
      battleDaoV2Enabled:true,
      mainDaoId:'body',
      learnedDaoPassiveIdsV118:learned,
      passiveLevelsV125:Object.fromEntries(Array.from({length:8},(_,i)=>[`passive.v2.body.p${i+1}`,i===5?p6Level:20])),
    },
  };
  e.battleDaoStateV2=createBattleDaoRuntimeStateV2(e,0);
  e.battleDaoStateV2.body.core.counterForce=force;
  return e;
}
function action(){return{battleDaoV2:{daoData:{}},effectBonusPct:0,breakBonusPct:0,recoveryMultiplier:1};}
function prepare(skill,force,opts){
  const e=entity(force,opts),a=action();
  prepareRemainingDaoCoreActionV2(e,{id:'T'},skill,a,1);
  return{e,a,d:a.battleDaoV2.daoData};
}

{
  const x=prepare(recover,19);
  assert.equal(x.d.counterForceSpent,0);
  assert.equal(x.d.bodyRecoverySpendBonusPct,0,'p6 must not grant recovery power without a real Phản Thế spend');
  assert.equal(x.a.effectBonusPct,0);
}
{
  const x=prepare(recover,20);
  assert.equal(x.d.counterForceSpent,20);
  assert.equal(x.d.bodyRecoverySpendBonusPct,12,'Lv20 p6: one full 20-point spend group = +12% recovery root effect');
  assert.equal(x.a.effectBonusPct,12);
}
{
  const x=prepare(recover,40);
  assert.equal(x.d.counterForceSpent,40);
  assert.equal(x.d.bodyRecoverySpendBonusPct,24,'Lv20 p6: two spend groups = +24% recovery root effect');
  assert.equal(x.a.effectBonusPct,24);
}
{
  const x=prepare(recover,40,{p6:false});
  assert.equal(x.d.counterForceSpent,40,'resource transaction remains independent of owning p6');
  assert.equal(x.d.bodyRecoverySpendBonusPct,0,'without p6, intentional spend must not mint a hidden recovery bonus');
  assert.equal(x.a.effectBonusPct,0);
}
{
  const x=prepare(counter,40);
  assert.equal(x.d.counterForceSpent,30);
  assert.equal(x.d.bodyRecoverySpendBonusPct,0,'p6 is recovery-only and must not buff Counter cash-outs');
  assert.equal(x.a.effectBonusPct,0);
}
{
  const x=prepare(recover,100);
  assert.equal(x.d.counterForceSpent,40);
  assert.equal(x.d.bodyPerfectCashout,true);
  assert.equal(x.d.bodyRecoverySpendBonusPct,24);
  assert.equal(x.a.effectBonusPct,64,'perfect Body cash-out +40% and p6 +24% compose on the chosen Recover root only');
}
{
  const e=entity(100);
  assert.equal(battleDaoV2HealShieldMultiplier(e,1),1,'Main Body p6 must not leak into the generic always-on heal/shield multiplier');
}

console.log('BODY DAO B4 CONSUMER PARITY PASS');
