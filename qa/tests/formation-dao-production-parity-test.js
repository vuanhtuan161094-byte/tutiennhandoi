import assert from 'node:assert/strict';
import {buildRegistry} from '../../dist/content/registry.js';
import {formationDaoV2} from '../../dist/content/formation-dao-v2.js';
import {battleDaoSkillGrowthProfileV126} from '../../dist/core/battle-dao-skill-growth-v126.js';
import {battleDaoV2OutgoingMultiplier,battleDaoV2BreakMultiplier,remainingDaoPassiveBonusesV2,v2ResourceProjection} from '../../dist/core/battle-dao-v2-runtime.js';
import {runCombatKernelV3,runCompiledCombatEncounterV3} from '../../dist/core/combat-kernel-v2.js';
import {CombatEngine} from '../../dist/core/combat.js';
import {canUseBattleDaoSkillV118} from '../../dist/core/battle-dao-combat-v118.js';
import {createFormationP4Player,createFormationP4Target,FORMATION_P4_PROFILES} from '../benchmarks/formation-dao-p4-benchmark.js';
import {setupFormation} from './formation-dao-transaction-test.js';
const registry=buildRegistry();
assert.equal(formationDaoV2.passives.length,8);assert.equal(formationDaoV2.mastery.length,10);
for(const row of formationDaoV2.mastery){const s=registry.skill(row.skillId);assert(s.fiveStatScalingV5);assert(!s.fiveStatScalingV5.agility);assert.equal(Object.keys(row.milestones).length,5);assert.equal(battleDaoSkillGrowthProfileV126(s,1000).milestones.length,5);assert.equal(battleDaoSkillGrowthProfileV126(s,1000).daoRefundPct,0);}
{
 const{e,t,c}=setupFormation();c.deployed=true;c.nurture=0;e.battleDaoStateV2.formation.stack.stacks=30;e.battleDaoStateV2.formation.stack.cap=30;e.battleDaoStateV2.formation.stack.expiresAt=20;
 const mult=battleDaoV2OutgoingMultiplier(e,t,0,'ActiveHit','skill.dao.formation.basic'),br=battleDaoV2BreakMultiplier(e,0);c.nurture=100;assert.equal(battleDaoV2OutgoingMultiplier(e,t,0,'ActiveHit','skill.dao.formation.basic'),mult);assert.equal(battleDaoV2BreakMultiplier(e,0),br);
 const before=structuredClone(e.battleDaoStateV2);for(let i=0;i<10;i++){remainingDaoPassiveBonusesV2(e,0);v2ResourceProjection(e,0);}assert.deepEqual(e.battleDaoStateV2,before,'reads never refresh');
 const lateBefore=structuredClone(e.battleDaoStateV2.formation);remainingDaoPassiveBonusesV2(e,25);assert(v2ResourceProjection(e,25).formationPassiveStack<30);assert.deepEqual(e.battleDaoStateV2.formation,lateBefore,'expired read projects decay without mutating stored timers');
}
for(const interrupted of [true,false]){
 const{engine,e,t,c}=setupFormation();c.deployed=true;c.nurture=0;c.integrity=100;e.aiProfile={rules:[{skillId:'skill.dao.formation.nourish',priority:100,conditions:[{type:'always'}]}]};engine.handleDecision(e,t,0);const cast=e.casting;engine.handleSkillResolve(e,t,cast.skillId,cast.token,1);const ch=e.channeling;assert(ch);
 if(interrupted){e.channeling=undefined;engine.handleChannelEnd(e,t,ch.skillId,ch.token,4);assert.equal(c.nurture,0);}else{ch.resolvedHits=ch.totalHits;engine.handleChannelEnd(e,t,ch.skillId,ch.token,4);assert(c.nurture>0&&c.nurture<=60);const n=c.nurture;engine.handleChannelEnd(e,t,ch.skillId,ch.token,5);assert.equal(c.nurture,n);}
}
for(const mode of ['pve','pvp','hunt','boss']){
 const entities=[createFormationP4Player(FORMATION_P4_PROFILES[0]),createFormationP4Target()],raw=runCombatKernelV3({registry,seed:64001,entities,maxDuration:18,mode:'simulation'}),compiled=runCompiledCombatEncounterV3({schema:'combat-encounter.v1',encounterId:'formation-'+mode,activity:mode,mode:'simulation',seed:64001,entities,maxDuration:18,metadata:{}},registry);
 assert.deepEqual(compiled.battle.finalState,raw.battle.finalState);assert.deepEqual(compiled.combatResult.summary,raw.combatResult.summary);
}
{
 const p=createFormationP4Player(FORMATION_P4_PROFILES[0]);p.combatBuildV117.mainDaoId='sword';p.combatBuildV117.secondaryDaoId='formation';p.skillIds=['skill.dao.sword.basic'];p.aiProfile={rules:[{skillId:p.skillIds[0],priority:100,conditions:[{type:'always'}]}]};
 const engine=new CombatEngine(registry,64001,[p,createFormationP4Target()]),[e,t]=[...engine.entities.values()];assert.equal(e.battleDaoStateV2.formation.core,undefined);assert(!canUseBattleDaoSkillV118(e,registry.skill('skill.dao.formation.deploy')));engine.handleDecision(e,t,0);const a=e.casting.runtimeV117;engine.handleSkillResolve(e,t,p.skillIds[0],e.casting.token,0);assert(e.battleDaoStateV2.formation.stack.stacks>0);const st=structuredClone(e.battleDaoStateV2.formation.stack);engine.finishBattleDaoV2Action(e,t,registry.skill(p.skillIds[0]),a,1);assert.deepEqual(e.battleDaoStateV2.formation.stack,st);
}
{
 const{engine,e,t,c}=setupFormation();c.deployed=true;c.nurture=100;c.integrity=100;e.aiProfile={rules:[{skillId:'skill.dao.formation.full_activate',priority:100,conditions:[{type:'always'}]}]};engine.handleDecision(e,t,0);assert.equal(c.nurture,100);assert.equal(c.integrity,100);const cast=e.casting,a=cast.runtimeV117;e.casting=undefined;engine.handleSkillResolve(e,t,cast.skillId,cast.token,1);assert.equal(c.nurture,100);assert.equal(c.integrity,100);
 engine.resolveEffects(e,t,registry.skill(cast.skillId).effects,'ActiveHit',2,cast.skillId,0,a);const hp=t.hp;engine.resolveEffects(e,t,registry.skill(cast.skillId).effects,'ActiveHit',3,cast.skillId,0,a);assert.equal(t.hp,hp,'payload cannot duplicate');
}
console.log('FORMATION 10/8/50/five-stat, no generic bonuses/read refresh, real channel full/interrupt/duplicate, compiled consumer parity PASS');
