import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { CombatEngine } from '../../dist/core/combat.js';
import { createRootActionV2,prepareRemainingDaoCoreActionV2,addPoisonSeedStageV2,battleDaoV2OutgoingMultiplier,v2ResourceProjection } from '../../dist/core/battle-dao-v2-runtime.js';
import { poisonStage,poisonPayoffCoefficient,commitPoisonConsume } from '../../dist/core/battle-dao-v2-contract.js';
import { POISON_P4_PROFILES,createPoisonP4Player,createPoisonP4Target } from '../benchmarks/poison-dao-p4-benchmark.js';
const registry=buildRegistry();
export function setupPoison(i=0) {const engine=new CombatEngine(registry,64001,[createPoisonP4Player(POISON_P4_PROFILES[i]),createPoisonP4Target()]);const [e,t]=[...engine.entities.values()];return {engine,e,t,c:e.battleDaoStateV2.poison.core};}
function action(e,t,suffix) {const skill=registry.skill('skill.dao.poison.'+suffix),a={effectBonusPct:0,breakBonusPct:0,recoveryMultiplier:1,battleDaoV2:createRootActionV2(e,skill,0)};prepareRemainingDaoCoreActionV2(e,t,skill,a,0);return{skill,a};}
function resolve(engine,e,t,skill,a,now=1){engine.resolveEffects(e,t,skill.effects,'ActiveHit',now,skill.id,0,a);return a;}
{
 const {engine,e,t,c}=setupPoison();addPoisonSeedStageV2(e,t.id,4,0);
 const before=structuredClone(c);for(let i=0;i<10;i++){battleDaoV2OutgoingMultiplier(e,{...t,id:'other'},0,'DoT','skill.dao.poison.bone');v2ResourceProjection(e,0);poisonStage(e,'other');}assert.deepEqual(c,before);
 addPoisonSeedStageV2(e,'other',1,1);assert.equal(poisonStage(e,t.id),0);assert.equal(poisonStage(e,'other'),1);addPoisonSeedStageV2(e,t.id,1,2);assert.equal(poisonStage(e,t.id),1,'returning target cannot restore previous stage');
}
for(const suffix of ['transform','consume','ultimate']) {
 const {engine,e,t,c}=setupPoison();addPoisonSeedStageV2(e,t.id,4,0);const {skill,a}=action(e,t,suffix),tx=a.battleDaoV2.daoData.poisonTransaction;
 assert.equal(c.poisonSeedStage,4,'prepare never spends');
 const effect=skill.effects[0];assert.equal(poisonPayoffCoefficient(effect,tx,suffix!=='transform'),(effect.baseCoefficient+Math.min(4,effect.maxConsume)*effect.coefficientPerStack)*(suffix!=='transform'?1.5:1));assert.equal(a.effectBonusPct,0,'no second Công Tâm bonus');
 assert.equal(commitPoisonConsume(e,t,a,false,suffix!=='transform'),undefined);assert.equal(c.poisonSeedStage,4);
 const original=engine.applyDamage.bind(engine);engine.applyDamage=()=>({hit:true,hpDamage:0,crit:false,heart:false});
 resolve(engine,e,t,skill,a);assert.equal(c.poisonSeedStage,suffix==='transform'?2:1,'shield absorbed canonical hit still commits');const commits=c.consumeCommits;
 resolve(engine,e,t,skill,a,2);assert.equal(c.consumeCommits,commits,'duplicate callback cannot hit/spend twice');
 engine.applyDamage=original;
}
{
 const {engine,e,t,c}=setupPoison();addPoisonSeedStageV2(e,t.id,4,0);let {skill,a}=action(e,t,'consume');engine.applyDamage=()=>({hit:false,hpDamage:0});resolve(engine,e,t,skill,a);assert.equal(c.poisonSeedStage,4);
 ({skill,a}=action(e,t,'consume'));a.battleDaoV2.procDepth=1;resolve(engine,e,t,skill,a);assert.equal(c.poisonSeedStage,4);
 ({skill,a}=action(e,t,'consume'));t.alive=false;resolve(engine,e,t,skill,a);assert.equal(c.poisonSeedStage,4,'death before resolve no spend');
}
for(const suffix of ['basic','bone','heart','calamity']){
 const {engine,e,t,c}=setupPoison();const {skill,a}=action(e,t,suffix);engine.applyDamage=()=>({hit:false,hpDamage:0});resolve(engine,e,t,skill,a);assert.equal(c.poisonSeedStage,0);assert.equal(engine.queue.filter(x=>x.kind==='dotTick').length,0,'dodge cannot apply mark/DoT');
 const b=action(e,t,suffix);engine.applyDamage=()=>({hit:true,hpDamage:0});resolve(engine,e,t,b.skill,b.a,2);assert(c.poisonSeedStage>0&&c.poisonSeedStage<4,'no single ordinary root reaches stage4 from0');
}
{
 const {engine,e,t,c}=setupPoison(2),{skill,a}=action(e,t,'mist');resolve(engine,e,t,skill,a);assert.equal(c.poisonSeedStage,2,'field deploy explicit hit exception');const packet=engine.queue.find(x=>x.kind==='dotTick').dot;assert.equal(packet.procDepth,0);assert.equal(packet.followUpBudget,0);
 let contexts=[];engine.applyDamage=(s,t,ctx)=>{contexts.push(ctx);return{hit:true,hpDamage:ctx.flatDamage};};engine.handleDotTick(e,t,skill.id,packet,2);const low=contexts.at(-1).flatDamage;addPoisonSeedStageV2(e,t.id,2,2);engine.handleDotTick(e,t,skill.id,packet,3);assert(contexts.at(-1).flatDamage>low,'same-target live stage strengthens existing snapshot');
 addPoisonSeedStageV2(e,'other',4,3);const before=structuredClone(c);engine.handleDotTick(e,t,skill.id,packet,4);assert.deepEqual(c,before);assert.equal(contexts.at(-1).flatDamage,low/1.16,'old target receives no new-target stage');assert.equal(contexts.at(-1).canDodge,false);
 e.baseStats.primaryStatsV5.power*=10;engine.handleDotTick(e,t,skill.id,packet,5);assert.equal(contexts.at(-1).flatDamage,low/1.16,'five-stat source packet is snapshotted');
 t.alive=false;const count=contexts.length;engine.handleDotTick(e,t,skill.id,packet,6);assert.equal(contexts.length,count);
}
{
 const {engine,e,t,c}=setupPoison();addPoisonSeedStageV2(e,t.id,4,0);const {skill,a}=action(e,t,'consume');t.shields.push({capacity:1000000,stability:100,expiresAt:10,source:'direct',sourceSkillId:'qa.shield'});const hp=t.hp;resolve(engine,e,t,skill,a);assert.equal(t.hp,hp,'actual production shield absorbs the complete hit');assert.equal(c.poisonSeedStage,1,'actual canonical landed outcome commits without HP damage');
}
{
 const {engine,e,t,c}=setupPoison();addPoisonSeedStageV2(e,t.id,4,0);const {skill,a}=action(e,t,'consume');addPoisonSeedStageV2(e,'new-target',2,1);let calls=0;engine.applyDamage=()=>{calls++;return{hit:true,hpDamage:1};};resolve(engine,e,t,skill,a,2);assert.equal(calls,0,'pending old-target snapshot cannot cash out new bound state');assert.equal(c.targetId,'new-target');assert.equal(c.poisonSeedStage,2);
}
{
 const {engine,e,t,c}=setupPoison();addPoisonSeedStageV2(e,t.id,4,0);t.hp=1;e.aiProfile={name:'manual kill',rules:[{skillId:'skill.dao.poison.consume',priority:100,conditions:[{type:'always'}]}]};engine.handleDecision(e,t,0);engine.handleSkillResolve(e,t,'skill.dao.poison.consume',e.casting.token,1);assert.equal(t.alive,false);assert.equal(c.consumeCommits,1,'valid landed killing payoff commits');assert.equal(c.poisonSeedStage,0);assert.equal(c.targetId,undefined,'kill explicitly clears current target');
}
console.log('POISON TRANSACTIONS: target reads/swap, hit gate, finite live-stage snapshot, exact single bonus, miss/death/real shield/stale target/idempotence PASS');
