import assert from 'node:assert/strict';
import fs from 'node:fs';
import { battleDaoSkillsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';
import { mindPassivesV2 } from '../../dist/content/mind-dao-v2.js';
import { remainingDaoPassiveBonusesV2 } from '../../dist/core/battle-dao-v2-runtime.js';
import { effectiveStats } from '../../dist/core/stats.js';
import {
  gainMindPassiveStackV2,
  mindDirectArmorPenBonusV2,
  mindPassiveBonusesV2,
} from '../../dist/core/mind-dao-v2-runtime.js';

const ALL=Array.from({length:8},(_,i)=>`passive.v2.mind.p${i+1}`);
function entity({main=true,stacks=30,cap=30,level=20}={}){
  return {
    combatBuildV117:{battleDaoV2Enabled:true,mainDaoId:main?'mind':'sword',secondaryDaoId:main?'sword':'mind',learnedDaoPassiveIdsV118:[...ALL],passiveLevelsV125:Object.fromEntries(ALL.map(id=>[id,level]))},
    battleDaoStateV2:{mind:{stack:{stacks,cap,durationSeconds:20,decayEverySeconds:2,expiresAt:999}}},
    baseStats:{attack:100,defense:100,mobility:100,accuracy:100,actionSpeed:1,resolve:100,controlPower:100,maxHp:2000,maxSpirit:100,physique:100,critChancePct:0,dodgeChancePct:0,heartChancePct:0},
    statuses:[],tags:[],pendingSetFlagsV117:{},breakDebuffUntil:0,
  };
}

assert.equal(mindPassivesV2.length,8);
const passiveText=mindPassivesV2.map(x=>`${x.summary} ${x.lv1} ${x.lv20}`).join('\n');
assert(!/Skill damage|Nộ gain|Crit\/Heart damage|Hội Tâm/i.test(passiveText),'production Mind passive copy must retire generic DPS/Gauge identity');
assert.match(passiveText,/Niệm Ảnh/); assert.match(passiveText,/Resolve/); assert.match(passiveText,/Nhiễu/);

{
  const e=entity(); const b=mindPassiveBonusesV2(e,10);
  assert.equal(Number(b.echoCoefficientBonus.toFixed(6)),.22);
  assert.equal(Number(b.accuracyPct.toFixed(6)),18);
  assert.equal(Number(b.controlPowerPct.toFixed(6)),45);
  assert.equal(Number(b.interferencePct.toFixed(6)),48);
  assert.equal(Number(b.echoBreakPct.toFixed(6)),15);
  assert.equal(Number(b.resolvePct.toFixed(6)),0);
  assert.equal(Number(b.conditionalArmorPenPct.toFixed(6)),18);
  const legacy=remainingDaoPassiveBonusesV2(e,10);
  assert.equal(legacy.directDamagePct,0); assert.equal(legacy.gaugeGainPct,0); assert.equal(legacy.armorPenPct,0);
}
{
  const e=entity({main:false}); const b=mindPassiveBonusesV2(e,10);
  assert.equal(b.echoCoefficientBonus,0); assert.equal(b.accuracyPct,0); assert.equal(b.controlPowerPct,0); assert.equal(b.interferencePct,0); assert.equal(b.echoBreakPct,0); assert.equal(b.conditionalArmorPenPct,0);
  assert.equal(Number(b.resolvePct.toFixed(6)),43);
  const stats=effectiveStats(e,{status(){throw new Error('no statuses expected');}},10);
  assert.equal(Number(stats.resolve.toFixed(6)),143);
}
{
  const e=entity(); const target={marks:{'Thần Ấn':1},pendingSetFlagsV117:{}}; const action={battleDaoV2:{procDepth:0}};
  assert.equal(Number(mindDirectArmorPenBonusV2(e,target,action,10).toFixed(6)),18);
  target.marks['Thần Ấn']=0; assert.equal(mindDirectArmorPenBonusV2(e,target,action,10),0);
  target.pendingSetFlagsV117.mindRecoveryPenaltyPct=12;
  assert.equal(Number(mindDirectArmorPenBonusV2(e,target,action,10).toFixed(6)),18);
}
{
  const e=entity(); const st=e.battleDaoStateV2.mind.stack; st.expiresAt=100; const registry={status(){throw new Error('no statuses expected');}};
  mindPassiveBonusesV2(e,10); remainingDaoPassiveBonusesV2(e,10); effectiveStats(e,registry,10);
  assert.equal(st.expiresAt,100,'Mind passive/stat reads must not refresh P8 peak hold');
}
{
  const e=entity(); const st=e.battleDaoStateV2.mind.stack; st.expiresAt=10.25; const active=battleDaoSkillsV118.find(x=>x.id==='skill.dao.mind.mark'); assert(active);
  assert.equal(gainMindPassiveStackV2(e,active,10,()=>false),0); assert.equal(st.expiresAt,12);
}

const statsSource=fs.readFileSync(new URL('../../dist/core/stats.js',import.meta.url),'utf8');
const combatSource=[fs.readFileSync(new URL('../../dist/core/combat.js',import.meta.url),'utf8'),fs.readFileSync(new URL('../../dist/core/combat-m2b-base.js',import.meta.url),'utf8')].join('\n');
const genericSource=fs.readFileSync(new URL('../../dist/core/battle-dao-v2-runtime-base.js',import.meta.url),'utf8');
assert(statsSource.includes('mindPassiveBonusesV2'));
assert(statsSource.includes('mindV2ActionAccuracyPct'));
assert(statsSource.includes('mindV2ActionControlPowerPct'));
assert(combatSource.includes('mindDirectArmorPenBonusV2'));
assert(combatSource.includes('echoBreakPct'));
assert(/else if \(dao === 'mind'\)\s*\{[\s\S]*?Mind passive output is owned by mind-dao-v2-runtime\.js/.test(genericSource));
assert(/if \(dao !== 'mind' && dao !== 'spell' && dao !== 'poison' && atCap && hasPassiveN\(entity, dao, 8\)\)/.test(genericSource),'Mind remains excluded from generic P8; separately opened Spell and Poison own their peak events too');
assert(/if \(dao !== 'fist' && dao !== 'mind'\)/.test(genericSource));

console.log('MIND DAO M2B PASSIVE ARCHITECTURE: PASS');
