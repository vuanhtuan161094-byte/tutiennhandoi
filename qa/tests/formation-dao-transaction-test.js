import assert from 'node:assert/strict';
import {buildRegistry} from '../../dist/content/registry.js';
import {CombatEngine} from '../../dist/core/combat.js';
import {createRootActionV2,prepareRemainingDaoCoreActionV2,carryBattleDaoV2StateToNextMonsterV2} from '../../dist/core/battle-dao-v2-runtime.js';
import {commitFormation,formationCanUse} from '../../dist/core/battle-dao-v2-contract.js';
import {createFormationP4Player,createFormationP4Target,FORMATION_P4_PROFILES} from '../benchmarks/formation-dao-p4-benchmark.js';
const registry=buildRegistry();
export function setupFormation(){const engine=new CombatEngine(registry,64001,[createFormationP4Player(FORMATION_P4_PROFILES[0]),createFormationP4Target()]),[e,t]=[...engine.entities.values()];return{engine,e,t,c:e.battleDaoStateV2.formation.core};}
function action(e,t,k){const s=registry.skill('skill.dao.formation.'+k),a={effectBonusPct:0,breakBonusPct:0,recoveryMultiplier:1,battleDaoV2:createRootActionV2(e,s,0)};prepareRemainingDaoCoreActionV2(e,t,s,a,0);return{s,a};}
{
 const{e,t,c}=setupFormation();assert(!c.deployed);assert(formationCanUse(e,registry.skill('skill.dao.formation.basic')));const{s,a}=action(e,t,'deploy');assert(!c.deployed);commitFormation(e,t,s,a,1);assert.deepEqual([c.deployed,c.nurture,c.integrity],[true,0,100]);assert(!formationCanUse(e,s));commitFormation(e,t,s,a,2);assert.equal(c.nurture,0);
}
for(const [k,n,w] of [['small_activate',25,8],['full_activate',70,30],['convert',20,0]]){
 const {e,t,c}=setupFormation();c.deployed=true;c.nurture=100;c.integrity=60;e.combatBuildV117.learnedDaoPassiveIdsV118=[];
 const{s,a}=action(e,t,k),before=structuredClone(c);assert.deepEqual(c,before);assert.equal(a.battleDaoV2.daoData.formationTransaction.grand,k==='full_activate');
 const event=commitFormation(e,t,s,a,1);assert.equal(c.nurture,100-n);assert.equal(event.integritySpent,w);const after=structuredClone(c);assert.equal(commitFormation(e,t,s,a,2),undefined);assert.deepEqual(c,after);
}
{
 const{e,t,c}=setupFormation();c.deployed=true;c.nurture=19;c.integrity=20;const{s,a}=action(e,t,'convert');assert(!formationCanUse(e,s));assert.equal(commitFormation(e,t,s,a,1),undefined);assert.equal(c.integrity,20);
}
for(const k of ['full_activate','break','nourish']){
 const{e,t,c}=setupFormation();c.deployed=true;c.nurture=100;c.integrity=60;const{s,a}=action(e,t,k),before=structuredClone(c);assert.deepEqual(c,before,'prepare cannot spend');
 if(k==='nourish'){c.nurture=0;assert.equal(commitFormation(e,t,s,a,1),undefined);assert.equal(c.nurture,0);a.battleDaoV2.daoData.formationChannelCompleted=true;commitFormation(e,t,s,a,2);assert(c.nurture>0&&c.nurture<=60);}
 if(k==='break'){commitFormation(e,t,s,a,2);assert.deepEqual([c.deployed,c.nurture,c.integrity],[false,0,0]);}
}
{
 const{e,t,c}=setupFormation();c.deployed=true;c.nurture=17;c.integrity=100;const{s,a}=action(e,t,'ultimate');commitFormation(e,t,s,a,1);assert.equal(c.nurture,17);
 c.nurture=25;c.integrity=1;const small=action(e,t,'small_activate');commitFormation(e,t,small.s,small.a,2);assert(!c.deployed);assert.equal(c.nurture,0);
}
{
 const{e,c}=setupFormation();c.deployed=true;c.nurture=45;c.integrity=75;const carry=carryBattleDaoV2StateToNextMonsterV2(e.battleDaoStateV2,0),p=createFormationP4Player(FORMATION_P4_PROFILES[0]);p.initialBattleDaoStateV2=carry;let engine=new CombatEngine(registry,1,[p,createFormationP4Target()]);assert.equal([...engine.entities.values()][0].battleDaoStateV2.formation.core.nurture,45);delete carry.formationHuntCarryV1;engine=new CombatEngine(registry,1,[p,createFormationP4Target()]);assert.equal([...engine.entities.values()][0].battleDaoStateV2.formation.core.nurture,0);
}
console.log('FORMATION transactions: exact spend/Grand/atomic/prepare/duplicate/channel/teardown/Ultimate/collapse/Hunt/new battle PASS');
