import assert from 'node:assert/strict';
import {buildRegistry} from '../../dist/content/registry.js';
import {CombatEngine} from '../../dist/core/combat.js';
import {createRootActionV2,prepareRemainingDaoCoreActionV2,battleDaoV2OutgoingMultiplier,carryBattleDaoV2StateToNextMonsterV2} from '../../dist/core/battle-dao-v2-runtime.js';
import {artifactCanUse,artifactMerged} from '../../dist/core/battle-dao-v2-contract.js';
import {createArtifactP4Player,createArtifactP4Target,ARTIFACT_P4_PROFILES} from '../benchmarks/artifact-dao-p4-benchmark.js';
const registry=buildRegistry();
export function setupArtifact(){const engine=new CombatEngine(registry,64001,[createArtifactP4Player(ARTIFACT_P4_PROFILES[0]),createArtifactP4Target()]),[e,t]=[...engine.entities.values()];return{engine,e,t,c:e.battleDaoStateV2.artifact.core};}
function action(e,t,k){const s=registry.skill('skill.dao.artifact.'+k),a={effectBonusPct:0,breakBonusPct:0,recoveryMultiplier:1,battleDaoV2:createRootActionV2(e,s,0)};prepareRemainingDaoCoreActionV2(e,t,s,a,0);return{s,a};}
function resolve(engine,e,t,s,a,now=1){engine.resolveEffects(e,t,s.effects,'ActiveHit',now,s.id,0,a);engine.finishBattleDaoV2Action(e,t,s,a,now);}
for(const k of ['deploy','split']){
 const{engine,e,t,c}=setupArtifact();assert.equal(c.artifactSources,1);assert.equal(c.artifactSourceCap,3);let{s,a}=action(e,t,k),before=structuredClone(c);assert.deepEqual(c,before);resolve(engine,e,t,s,a);assert.equal(c.artifactSources,2);resolve(engine,e,t,s,a,2);assert.equal(c.artifactSources,2);({s,a}=action(e,t,k));resolve(engine,e,t,s,a,3);assert.equal(c.artifactSources,3);assert(!artifactCanUse(e,s,3));
}
{
 const{engine,e,t,c}=setupArtifact();const{s,a}=action(e,t,'recall');assert(!artifactCanUse(e,s));resolve(engine,e,t,s,a);assert.equal(c.artifactSources,1);assert.equal(e.shields.length,0);
 c.artifactSources=3;e.spirit=0;const b=action(e,t,'recall');assert.equal(c.artifactSources,3);resolve(engine,e,t,b.s,b.a,1);assert.equal(c.artifactSources,2);assert(e.spirit>0&&e.shields.length>0);const spirit=e.spirit,shields=e.shields.length;resolve(engine,e,t,b.s,b.a,2);assert.equal(e.spirit,spirit);assert.equal(e.shields.length,shields);assert.equal(c.artifactSources,2);
}
{
 const{engine,e,t,c}=setupArtifact();c.artifactSources=3;const{s,a}=action(e,t,'merge');assert.equal(c.artifactSources,3);assert(!artifactMerged(e,0));engine.applyDamage=()=>({hit:false,hpDamage:0});resolve(engine,e,t,s,a);assert.equal(c.artifactSources,1);assert.equal(c.mergedFrom,3);assert(artifactMerged(e,2));for(const k of ['deploy','split'])assert(!artifactCanUse(e,registry.skill('skill.dao.artifact.'+k),2));assert(artifactCanUse(e,registry.skill('skill.dao.artifact.deploy'),8));assert.equal(c.artifactSources,1);
}
{
 const{engine,e,t,c}=setupArtifact();c.artifactSources=3;e.aiProfile={rules:[{skillId:'skill.dao.artifact.merge',priority:100,conditions:[{type:'always'}]}]};engine.handleDecision(e,t,0);const cast=e.casting;e.casting=undefined;engine.handleSkillResolve(e,t,cast.skillId,cast.token,2);assert.equal(c.artifactSources,3);assert(!artifactMerged(e,2));
}
{
 const{engine,e,t,c}=setupArtifact();const low=battleDaoV2OutgoingMultiplier(e,t,0,'ActiveHit','skill.dao.artifact.strike');c.artifactSources=3;assert.equal(battleDaoV2OutgoingMultiplier(e,t,0,'ActiveHit','skill.dao.artifact.strike'),low,'no generic source double-dip');const{s,a}=action(e,t,'strike');assert.equal(a.effectBonusPct,24,'one +12% per extra source authority');resolve(engine,e,t,s,a);const q=engine.queue.filter(x=>x.kind==='v2FollowUp'&&x.v2FollowUp.kind==='artifactSnapshot');assert.equal(q.length,1);const f=q[0].v2FollowUp;assert.equal(f.sourceCount,3);assert.equal(f.procDepth,1);assert.equal(f.followUpBudget,0);resolve(engine,e,t,s,a,2);assert.equal(engine.queue.filter(x=>x.kind==='v2FollowUp').length,1);
 const before=structuredClone(e.battleDaoStateV2.artifact),gauge=e.ultimateGaugeV117;let flat;engine.applyDamage=(source,target,ctx)=>{flat=ctx.flatDamage;return{hit:true,hpDamage:flat};};e.baseStats.primaryStatsV5.power*=10;engine.handleV2FollowUp(e,t,f,2);assert.equal(flat,f.snapshotPower*f.coefficient);assert.deepEqual(e.battleDaoStateV2.artifact,before);assert.equal(e.ultimateGaugeV117,gauge);const n=engine.logs.length;engine.handleV2FollowUp(e,t,f,3);assert.equal(engine.logs.length,n,'duplicate callback suppressed');
}
for(const swap of [false,true]){
 const{engine,e,t,c}=setupArtifact();c.artifactSources=3;const{s,a}=action(e,t,'basic');resolve(engine,e,t,s,a);const f=engine.queue.find(x=>x.v2FollowUp?.kind==='artifactSnapshot').v2FollowUp;let calls=0;engine.applyDamage=()=>{calls++;return{hit:true,hpDamage:1};};if(swap)t.id='new';else t.alive=false;engine.handleV2FollowUp(e,t,f,2);assert.equal(calls,0);assert(engine.logs.some(x=>x.data?.artifactFollowupSuppressed));
}
{
 const{e,t,c}=setupArtifact();c.artifactSources=1;let a=action(e,t,'ultimate').a;assert.equal(a.battleDaoV2.daoData.artifactTransaction.effectiveCount,1);c.artifactSources=3;a=action(e,t,'ultimate').a;assert.equal(a.battleDaoV2.daoData.artifactTransaction.effectiveCount,3);c.artifactSources=1;c.mergedFrom=3;c.mergeUntil=10;a=action(e,t,'ultimate').a;assert.equal(a.battleDaoV2.daoData.artifactTransaction.effectiveCount,3);assert.equal(c.artifactSources,1);
}
{
 const{e,c}=setupArtifact();c.artifactSources=3;c.mergeUntil=20;c.mergedFrom=3;const p=createArtifactP4Player(ARTIFACT_P4_PROFILES[0]),carry=carryBattleDaoV2StateToNextMonsterV2(e.battleDaoStateV2,5);p.initialBattleDaoStateV2=carry;let engine=new CombatEngine(registry,1,[p,createArtifactP4Target()]),next=[...engine.entities.values()][0];assert.equal(next.battleDaoStateV2.artifact.core.artifactSources,3);assert.equal(next.battleDaoStateV2.artifact.core.mergeUntil,15);delete carry.artifactHuntCarryV1;engine=new CombatEngine(registry,1,[p,createArtifactP4Target()]);assert.equal([...engine.entities.values()][0].battleDaoStateV2.artifact.core.artifactSources,1);
}
console.log('ARTIFACT topology/interrupt/dodge/atomic recall/exact+1/cap3/merge window/source scaling/shared snapshot followup/death/idempotence/Hunt/reset PASS');
{
 const{e,c}=setupArtifact();c.artifactSources=4;c.artifactSourceCap=4;const carry=carryBattleDaoV2StateToNextMonsterV2(e.battleDaoStateV2,0);assert.equal(carry.artifact.core.artifactSources,3);assert.equal(carry.artifact.core.artifactSourceCap,3);
 const p=createArtifactP4Player(ARTIFACT_P4_PROFILES[0]);p.initialBattleDaoStateV2=JSON.parse(JSON.stringify(carry));const engine=new CombatEngine(registry,1,[p,createArtifactP4Target()]),next=[...engine.entities.values()][0];assert.equal(next.battleDaoStateV2.artifact.core.artifactSourceCap,3);assert.equal(next.battleDaoStateV2.artifact.core.artifactSources,3);assert.equal(engine.queue.filter(x=>x.v2FollowUp?.kind==='artifactSnapshot').length,0);
 p.combatBuildV117.mainDaoId='sword';p.combatBuildV117.secondaryDaoId='artifact';const secondary=new CombatEngine(registry,1,[p,createArtifactP4Target()]);assert.equal([...secondary.entities.values()][0].battleDaoStateV2.artifact.core,undefined,'old Main carry cannot give Secondary a core');
}
