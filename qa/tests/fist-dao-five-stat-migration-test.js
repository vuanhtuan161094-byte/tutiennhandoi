import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { battleDaoSkillsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';
import { createBattleDaoRuntimeStateV2, fistPassiveDefensePctV2 } from '../../dist/core/battle-dao-v2-runtime.js';
import { effectiveStats } from '../../dist/core/stats.js';

let passed=0;
function testCase(name,fn){fn();passed++;console.log('✓',name);}

function entity({level=20,stacks=20}={}){
  const e={
    id:'fist.q1',name:'Quyền Q1',tags:[],combatModel:'locked-v1',
    baseStats:{
      attack:100,defense:100,maxHp:2000,physique:100,maxSpirit:100,
      mobility:100,accuracy:100,resolve:100,controlPower:100,actionSpeed:1,
      dodgeChancePct:0,heartChancePct:0,critChancePct:0,critPowerPerLayer:.5,
      primaryStatsV5:{power:100,body:100,agility:100,spirit:100,sense:100},
    },
    statuses:[],breakDebuffUntil:0,
    combatBuildV117:{
      battleDaoV2Enabled:true,
      mainDaoId:'fist',
      learnedDaoPassiveIdsV118:['passive.v2.fist.p1','passive.v2.fist.p4'],
      passiveLevelsV125:{'passive.v2.fist.p1':20,'passive.v2.fist.p4':level},
      activeSetMechanics:[],
    },
  };
  e.battleDaoStateV2=createBattleDaoRuntimeStateV2(e,0);
  e.battleDaoStateV2.fist.stack.stacks=stacks;
  e.battleDaoStateV2.fist.stack.expiresAt=999;
  return e;
}

testCase('Q1 Hùng Kình Hộ Thể Lv20 grants +0.50% Defense per Liên Kình',()=>{
  const e=entity({level:20,stacks:20});
  assert.equal(fistPassiveDefensePctV2(e,0),10);
  const s=effectiveStats(e,buildRegistry(),0);
  assert.equal(s.defense,110);
  assert.equal(s.attack,100);
  assert.equal(s.mobility,100);
});

testCase('Q1 Hùng Kình Hộ Thể Lv1 grants +0.15% Defense per Liên Kình',()=>{
  const e=entity({level:1,stacks:20});
  assert.equal(Number(fistPassiveDefensePctV2(e,0).toFixed(6)),3);
  assert.equal(Number(effectiveStats(e,buildRegistry(),0).defense.toFixed(6)),103);
});

testCase('Q1 p4 has no Defense bonus without Liên Kình',()=>{
  const e=entity({level:20,stacks:0});
  assert.equal(fistPassiveDefensePctV2(e,0),0);
  assert.equal(effectiveStats(e,buildRegistry(),0).defense,100);
});

testCase('Q1 player-facing Fist skill copy uses Quyền Thế, not stale Liên Quyền',()=>{
  const fist=battleDaoSkillsV118.filter(x=>x.dao==='fist');
  assert.equal(fist.length,10);
  assert(fist.some(x=>String(x.description).includes('Quyền Thế')));
  assert.equal(fist.filter(x=>String(x.description).includes('Liên Quyền')).length,0);
});

console.log(`FIST DAO Q1: ${passed}/${passed} PASS`);
