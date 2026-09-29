import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mindPassivesV2 } from '../../dist/content/mind-dao-v2.js';
import { remainingDaoPassiveBonusesV2 } from '../../dist/core/battle-dao-v2-runtime.js';
import { effectiveStats } from '../../dist/core/stats.js';
import {
  mindDirectArmorPenBonusV2,
  mindPassiveBonusesV2,
} from '../../dist/core/mind-dao-v2-runtime.js';

const ALL=Array.from({length:8},(_,i)=>`passive.v2.mind.p${i+1}`);
function entity({main=true,stacks=30,cap=30,level=20}={}){
  return {
    combatBuildV117:{
      battleDaoV2Enabled:true,
      mainDaoId:main?'mind':'sword',
      secondaryDaoId:main?'sword':'mind',
      learnedDaoPassiveIdsV118:[...ALL],
      passiveLevelsV125:Object.fromEntries(ALL.map(id=>[id,level])),
    },
    battleDaoStateV2:{mind:{stack:{stacks,cap,durationSeconds:20,decayEverySeconds:2,expiresAt:999}}},
    baseStats:{
      attack:100,defense:100,mobility:100,accuracy:100,actionSpeed:1,resolve:100,controlPower:100,
      maxHp:2000,maxSpirit:100,physique:100,critChancePct:0,dodgeChancePct:0,heartChancePct:0,
    },
    statuses:[],tags:[],pendingSetFlagsV117:{},breakDebuffUntil:0,
  };
}

assert.equal(mindPassivesV2.length,8);
const passiveText=mindPassivesV2.map(x=>`${x.summary} ${x.lv1} ${x.lv20}`).join('\n');
assert(!/Skill damage|Nộ gain|Crit\/Heart damage|Hội Tâm/i.test(passiveText),'production Mind passive copy must retire generic DPS/Gauge identity');
assert.match(passiveText,/Niệm Ảnh/);
assert.match(passiveText,/Resolve/);
assert.match(passiveText,/Nhiễu/);

{
  const e=entity();
  const b=mindPassiveBonusesV2(e,10);
  assert.equal(Number(b.echoCoefficientBonus.toFixed(6)),.22,'P1 groups + P8 peak must reinforce echo coefficient at the P5-expanded cap');
  assert.equal(Number(b.accuracyPct.toFixed(6)),18,'P4 must own Main-Mind precision');
  assert.equal(Number(b.controlPowerPct.toFixed(6)),45,'P1+P4+P8 must reinforce Main-Mind control locally');
  assert.equal(Number(b.interferencePct.toFixed(6)),48,'P1+P6+P8 must reinforce Nhiễu soft potency');
  assert.equal(Number(b.echoBreakPct.toFixed(6)),15,'P6 must reinforce Niệm Ảnh Break per 10 stacks');
  assert.equal(Number(b.resolvePct.toFixed(6)),0,'Main Mind must not receive the Secondary-safe Resolve lane');
  assert.equal(Number(b.conditionalArmorPenPct.toFixed(6)),18,'P7 must expose its localized pressure payoff');

  const legacy=remainingDaoPassiveBonusesV2(e,10);
  assert.equal(legacy.directDamagePct,0,'Mind must not leak generic passive Skill Damage');
  assert.equal(legacy.gaugeGainPct,0,'Mind p8 must not leak generic Gauge gain');
  assert.equal(legacy.armorPenPct,0,'Mind p7 Armor Pen must be action-local, not generic');
}

{
  const e=entity({main:false});
  const b=mindPassiveBonusesV2(e,10);
  assert.equal(b.echoCoefficientBonus,0);
  assert.equal(b.accuracyPct,0);
  assert.equal(b.controlPowerPct,0);
  assert.equal(b.interferencePct,0);
  assert.equal(b.echoBreakPct,0);
  assert.equal(b.conditionalArmorPenPct,0);
  assert.equal(Number(b.resolvePct.toFixed(6)),43,'Secondary Mind gets only the p1+p4+p8 Resolve-safe lane at the P5-expanded peak');
  const stats=effectiveStats(e,{status(){throw new Error('no statuses expected');}},10);
  assert.equal(Number(stats.resolve.toFixed(6)),143,'Secondary Resolve must materialize into canonical effectiveStats');
}

{
  const e=entity();
  const target={marks:{'Thần Ấn':1},pendingSetFlagsV117:{}};
  const action={battleDaoV2:{procDepth:0}};
  assert.equal(Number(mindDirectArmorPenBonusV2(e,target,action,10).toFixed(6)),18);
  target.marks['Thần Ấn']=0;
  assert.equal(mindDirectArmorPenBonusV2(e,target,action,10),0);
  target.pendingSetFlagsV117.mindRecoveryPenaltyPct=12;
  assert.equal(Number(mindDirectArmorPenBonusV2(e,target,action,10).toFixed(6)),18,'Nhiễu pressure must also qualify P7');
}

const statsSource=fs.readFileSync(new URL('../../dist/core/stats.js',import.meta.url),'utf8');
const combatSource=fs.readFileSync(new URL('../../dist/core/combat.js',import.meta.url),'utf8');
const genericSource=fs.readFileSync(new URL('../../dist/core/battle-dao-v2-runtime.js',import.meta.url),'utf8');
assert(statsSource.includes('mindPassiveBonusesV2'),'effectiveStats must consume Secondary-safe Mind Resolve');
assert(statsSource.includes('mindV2ActionAccuracyPct'),'Main accuracy must remain action-local via transient combat context');
assert(statsSource.includes('mindV2ActionControlPowerPct'),'Main control-power bonus must remain action-local via transient combat context');
assert(combatSource.includes('mindDirectArmorPenBonusV2'),'CombatEngine must consume localized P7 armor penetration');
assert(combatSource.includes('echoBreakPct'),'Niệm Ảnh must consume P6 Break effectiveness');
assert(genericSource.includes("else if (dao === 'mind') {\n            // M2B: Mind passive output is owned by mind-dao-v2-runtime.js"));
assert(genericSource.includes("if (dao !== 'mind' && atCap && hasPassiveN(entity, dao, 8))"),'generic p8 damage/gauge package must exclude Mind');

console.log('MIND DAO M2B PASSIVE ARCHITECTURE: PASS');
