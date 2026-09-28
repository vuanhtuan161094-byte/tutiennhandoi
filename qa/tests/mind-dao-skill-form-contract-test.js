import assert from 'node:assert/strict';
import fs from 'node:fs';
import { battleDaoSkillsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';
import { mindDaoV2, mindPassiveStackV2 } from '../../dist/content/mind-dao-v2.js';
import {
  SKILL_ACTIVE_SLOT_COUNT_V113,
  SKILL_MASTERY_MAX_V113,
} from '../../dist/core/build-foundation-v113.js';
import {
  BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125,
  PASSIVE_LEVEL_MAX_V125,
  SKILL_PRACTICE_STAGE_TIERS_V125,
} from '../../dist/core/specialization-skill-progression-v125.js';
import { skillStandardCostPctV117 } from '../../dist/core/skill-runtime-v117.js';

const contract=fs.readFileSync(new URL('../../docs/runtime/MIND_DAO_SKILL_FORM_LOCK_20260929.md',import.meta.url),'utf8');
const skills=battleDaoSkillsV118.filter(skill=>skill.runtimeV117?.daoBinding==='mind');
const byId=new Map(skills.map(skill=>[skill.id,skill]));

const expected=[
  ['skill.dao.mind.basic','basic','instant','zero',0,0,1.10,0],
  ['skill.dao.mind.mark','active','instant','low',4,0,.75,8],
  ['skill.dao.mind.split','active','instant','medium',6,0,.80,16],
  ['skill.dao.mind.interfere','active','instant','medium',7,0,.80,16],
  ['skill.dao.mind.guard','active','instant','medium',9,0,.85,16],
  ['skill.dao.mind.chase','active','cast','low',6,.80,.75,8],
  ['skill.dao.mind.burst','active','finisher','medium',8,.45,.85,16],
  ['skill.dao.mind.observe','active','channel','medium',10,.40,.90,16],
  ['skill.dao.mind.flow','active','deploy','high',12,.80,1.00,28],
  ['skill.dao.mind.ultimate','ultimate','finisher','zero',0,1.20,1.50,0],
];

assert.equal(skills.length,10,'Thần Niệm production shape must remain 10 authored skills');
assert.deepEqual(skills.map(skill=>skill.id),expected.map(row=>row[0]),'Mind skill order/inventory drifted');

for(const [id,slot,form,cost,cooldown,cast,recovery,standardCostPct] of expected){
  const skill=byId.get(id);
  assert(skill,`missing ${id}`);
  assert.equal(skill.runtimeV117.slotClass,slot,`${id} slot mismatch`);
  assert.equal(skill.runtimeV117.form,form,`${id} form mismatch`);
  assert.equal(skill.runtimeV117.costClass,cost,`${id} cost class mismatch`);
  assert.equal(skill.cooldown,cooldown,`${id} cooldown mismatch`);
  assert.equal(skill.castTime,cast,`${id} cast mismatch`);
  assert.equal(skill.recoveryTime,recovery,`${id} recovery mismatch`);
  assert.equal(skillStandardCostPctV117(skill),standardCostPct,`${id} standard Chân Nguyên cost mismatch`);
  assert.equal(skill.runtimeV117.eventBudget,1,`${id} must keep one root event budget`);
}

assert.equal(byId.get('skill.dao.mind.ultimate').unavoidable,true,'Mind Ultimate must remain Tất Trúng');
const observe=byId.get('skill.dao.mind.observe');
assert.equal(observe.channel?.duration,2.5,'Observe channel duration drifted');
assert.equal(observe.channel?.baseHits,5,'Observe channel hit count drifted');

const builders={
  'skill.dao.mind.basic':1,
  'skill.dao.mind.mark':2,
  'skill.dao.mind.split':2,
  'skill.dao.mind.chase':1,
  'skill.dao.mind.flow':2,
};
for(const [id,amount] of Object.entries(builders)){
  const marks=byId.get(id).effects.filter(effect=>effect.type==='addMark'&&effect.mark==='Thần Ấn');
  assert.equal(marks.length,1,`${id} must have one root Thần Ấn build effect`);
  assert.equal(marks[0].stacks,amount,`${id} Thần Ấn build amount drifted`);
  assert.equal(marks[0].maxStacks,5,`${id} Thần Ấn cap must remain 5`);
}

for(const id of ['skill.dao.mind.burst','skill.dao.mind.ultimate']){
  const consumes=byId.get(id).effects.filter(effect=>effect.type==='consumeMarkDamage'&&effect.mark==='Thần Ấn');
  assert.equal(consumes.length,1,`${id} must retain exactly one Thần Ấn consume packet`);
  assert.equal(consumes[0].maxConsume,5,`${id} may consume at most 5 Thần Ấn`);
}
assert.equal(byId.get('skill.dao.mind.interfere').daoRuntimeV118?.signature,'mindInterfere');
assert.equal(byId.get('skill.dao.mind.interfere').daoRuntimeV118?.elementRole,'spend');

assert.equal(SKILL_ACTIVE_SLOT_COUNT_V113,5,'shared active slot count drifted');
assert.equal(BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125,5,'Bản Đạo V2 active loadout cap must remain 5');
assert.equal(SKILL_MASTERY_MAX_V113,1000,'skill Thuần thục cap must remain 1000');
assert.deepEqual(SKILL_PRACTICE_STAGE_TIERS_V125,[100,250,500,750,1000],'canonical Thuần thục milestones drifted');
assert.equal(PASSIVE_LEVEL_MAX_V125,20,'passive level cap must remain 20');
assert.equal(mindPassiveStackV2.cap,20,'base Niệm Lực cap must remain 20 before p5');
assert.equal(mindDaoV2.passives.length,8,'Mind must retain eight V2 passives');
assert.equal(mindDaoV2.mastery.length,10,'Mind must retain one mastery row per skill');

for(const row of mindDaoV2.mastery){
  assert(byId.has(row.skillId),`mastery references unknown Mind skill ${row.skillId}`);
  assert.deepEqual(Object.keys(row.milestones).map(Number).sort((a,b)=>a-b),[100,250,500,750,1000],`${row.skillId} must author all five Thuần thục milestones`);
}

const forms=[...new Set(skills.map(skill=>skill.runtimeV117.form))].sort();
assert.deepEqual(forms,['cast','channel','deploy','finisher','instant'],'Mind forms are identity-driven; do not copy Counter/Charge/Combo just to fill a form checklist');

assert.match(contract,/Ordinary hard cap: \*\*5\*\*/);
assert.match(contract,/resolution\/commit event/);
assert.match(contract,/cancelled\/interrupted before resolution -> spend 0/);
assert.match(contract,/Dodge \/ control resistance \/ boss reduction does \*\*not\*\* refund/);
assert.match(contract,/requires at least 1 Thần Ấn/);
assert.match(contract,/floor\(3 \* resolvedHits \/ totalHits\)/);
assert.match(contract,/mindEchoCounter.*must \*\*never\*\* gate Bạo Ấn spending/);
assert.match(contract,/100 \/ 250 \/ 500 \/ 750 \/ 1000/);

console.log('MIND DAO SKILL FORM CONTRACT: PASS');
