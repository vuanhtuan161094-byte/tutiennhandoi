import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { spellDaoV2 } from '../../dist/content/spell-dao-v2.js';
import { createBattleDaoRuntimeStateV2, prepareRemainingDaoCoreActionV2, finishRemainingDaoActionV2, remainingDaoPassiveBonusesV2, battleDaoV2SpiritCostMultiplier, v2ResourceProjection } from '../../dist/core/battle-dao-v2-runtime.js';

const registry=buildRegistry();
const make=(main='spell',secondary)=>{
  const e={id:'spell-p2b',name:'Spell P2B',combatBuildV117:{battleDaoV2Enabled:true,mainDaoId:main,secondaryDaoId:secondary,learnedDaoPassiveIdsV118:Array.from({length:8},(_,i)=>'passive.v2.spell.p'+(i+1)),passiveLevelsV125:Object.fromEntries(Array.from({length:8},(_,i)=>['passive.v2.spell.p'+(i+1),20]))},pendingSetFlagsV117:{},spirit:50,baseStats:{maxSpirit:100}};
  e.battleDaoStateV2=createBattleDaoRuntimeStateV2(e,0);return e;
};
const action=()=>({battleDaoV2:{daoData:{}},effectBonusPct:0,breakBonusPct:0,recoveryMultiplier:1});
const prepare=(e,id)=>{const s=registry.skills.get('skill.dao.spell.'+id),a=action();a.battleDaoV2.daoData.spellCnPaid=s.spiritCost+(s.runtimeV117?.costClass==='zero'?0:8);prepareRemainingDaoCoreActionV2(e,{id:'target'},s,a,1);return{s,a};};
const finish=(e,x,now=2,chance=()=>false)=>finishRemainingDaoActionV2(e,{id:'target'},x.s,x.a,now,chance);

assert.equal(spellDaoV2.passives.length,8);
for(const passive of spellDaoV2.passives){
  assert(passive.lv1&&passive.lv20,passive.id+' must have Lv1 and Lv20 intent');
  assert(/Pháp Ý|Chân Nguyên|CN|Diễn Pháp|hold|trần|tầng|payoff/i.test(passive.summary+' '+passive.lv1+' '+passive.lv20),passive.id+' must own a spell identity mechanic');
}
const content=spellDaoV2.passives.map(p=>p.summary+' '+p.lv1+' '+p.lv20).join('\n');
assert.doesNotMatch(content,/generic damage|Skill damage|\+\d+% CDR|Nộ gain/i);

{
  const e=make();
  assert.equal(e.battleDaoStateV2.spell.stack.stacks,0,'p1 opens the long-cycle stack');
  const basic=prepare(e,'basic');finish(e,basic,2);assert.equal(e.battleDaoStateV2.spell.stack.stacks,0,'free Basic does not manufacture Pháp Ý');
  const seal=prepare(e,'seal');finish(e,seal,3);assert.equal(e.battleDaoStateV2.spell.stack.stacks,1,'one resolved CN-paid root grants one stack');
  const next=prepare(e,'burst');finish(e,next,4,()=>true);assert.equal(e.battleDaoStateV2.spell.stack.stacks,3,'p2 may add only one bounded extra stack per eligible root');
}
{
  const e=make();const st=e.battleDaoStateV2.spell.stack;
  st.stacks=20;st.expiresAt=30;st.nextDecayAt=undefined;
  const tune= v2ResourceProjection(e,29);
  assert.equal(tune.spellPassiveStackCap,30,'p5 Lv20 raises the cap by ten');
  assert.equal(st.durationSeconds,20,'p3 Lv20 owns the +8 second duration');
  const before=st.expiresAt;remainingDaoPassiveBonusesV2(e,29);assert.equal(st.expiresAt,before,'read-only passive evaluation cannot refresh peak hold');
  assert(Math.abs(battleDaoV2SpiritCostMultiplier(e,registry.skills.get('skill.dao.spell.burst'),29)-.85)<1e-9,'p4 bounded 5% and p7 threshold 10% reduce only authored Main Spell CN cost');
  assert.equal(battleDaoV2SpiritCostMultiplier(e,registry.skills.get('skill.dao.fist.basic'),29),1,'Main Spell CN efficiency does not alter another Dao skill');
}
{
  const e=make();const st=e.battleDaoStateV2.spell.stack;st.stacks=30;st.expiresAt=3;st.nextDecayAt=undefined;
  const channel=prepare(e,'channel');e.battleDaoStateV2.spell.core.expectedForm='Dẫn Pháp';
  finish(e,channel,2);
  assert.equal(e.battleDaoStateV2.spell.core.dienPhapReady,true);
  assert.equal(st.expiresAt,4,'p8 peak hold refresh is owned by a completed cycle event');
  const readExpiry=st.expiresAt;remainingDaoPassiveBonusesV2(e,2.5);assert.equal(st.expiresAt,readExpiry,'passive reads cannot keep p8 active');
  const payoff=prepare(e,'burst');assert.equal(payoff.a.effectBonusPct,67,'35 base + 12 p6 + 20 p8 at Lv20');
}
{
  const e=make('sword','spell'),st=e.battleDaoStateV2.spell.stack;st.stacks=10;st.expiresAt=30;st.nextDecayAt=undefined;
  assert.equal(e.battleDaoStateV2.spell.core,undefined,'Secondary cannot receive Main core');
  assert.equal(battleDaoV2SpiritCostMultiplier(e,registry.skills.get('skill.dao.fist.basic'),1),.97,'Secondary p4 offers bounded CN sustain only');
  const out=remainingDaoPassiveBonusesV2(e,1);assert.equal(out.directDamagePct,0);assert.equal(out.recoveryReductionPct,0);
}
{
 const e=make();e.combatBuildV117.learnedDaoPassiveIdsV118=e.combatBuildV117.learnedDaoPassiveIdsV118.filter(id=>id!=='passive.v2.spell.p4');
 const st=e.battleDaoStateV2.spell.stack;st.stacks=20;st.expiresAt=30;
 assert.equal(battleDaoV2SpiritCostMultiplier(e,registry.skills.get('skill.dao.spell.burst'),1),.9,'p7 owns its own threshold effect without requiring p4');
}
console.log('SPELL DAO P2B PASSIVE ARCHITECTURE PASS');
