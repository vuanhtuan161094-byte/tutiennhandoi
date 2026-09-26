import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { fistSkillMasteryV2 } from '../../dist/content/fist-dao-v2.js';
import {
  createBattleDaoRuntimeStateV2,
  createRootActionV2,
  fistV2EffectsForSkill,
  prepareFistCoreActionV2,
} from '../../dist/core/battle-dao-v2-runtime.js';

const registry=buildRegistry();
const skill=registry.skill('skill.dao.fist.triple');
const entity={
  id:'fist.q5.chain',name:'Q5 Liên Hoàn',tags:[],combatModel:'locked-v1',
  baseStats:{
    attack:100,defense:100,maxHp:2000,physique:100,maxSpirit:100,
    mobility:100,accuracy:100,resolve:100,controlPower:100,actionSpeed:1,
    dodgeChancePct:0,heartChancePct:0,critChancePct:0,critPowerPerLayer:.5,
    primaryStatsV5:{power:100,body:100,agility:100,spirit:100,sense:100},
  },
  hp:2000,spirit:100,statuses:[],breakDebuffUntil:0,pendingSetFlagsV117:{},
  combatBuildV117:{
    battleDaoV2Enabled:true,mainDaoId:'fist',
    learnedDaoPassiveIdsV118:[],passiveLevelsV125:{},
    skillPracticeTierV125:{[skill.id]:1000},activeSetMechanics:[],
  },
};
entity.battleDaoStateV2=createBattleDaoRuntimeStateV2(entity,0);
entity.battleDaoStateV2.fist.core.fistForce=5;
const action={
  skillId:skill.id,effectBonusPct:0,breakBonusPct:0,recoveryMultiplier:1,
  battleDaoV2:createRootActionV2(entity,skill,1),
};
prepareFistCoreActionV2(entity,{id:'target',breakDebuffUntil:0},skill,action,0);
const effects=fistV2EffectsForSkill(entity,skill,action,()=>false).filter(x=>x.type==='damage');
assert.deepEqual(effects.map(x=>x.coefficient),[.55,.55,.55,1.25]);
assert.equal(effects[3].breakDamagePct,skill.effects[0].breakDamagePct*1.25);
const mastery=fistSkillMasteryV2.find(x=>x.skillId===skill.id);
assert(mastery);
assert(String(mastery.milestones[1000]).includes('125%'));
console.log('FIST DAO Q5 CHAIN TUNING: PASS');
