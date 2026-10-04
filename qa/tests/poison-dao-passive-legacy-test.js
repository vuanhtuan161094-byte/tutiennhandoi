import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { CombatEngine } from '../../dist/core/combat.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';
import { createRootActionV2,prepareRemainingDaoCoreActionV2,v2ResourceProjection,remainingDaoPassiveBonusesV2 } from '../../dist/core/battle-dao-v2-runtime.js';
import { poisonObserveRoot,poisonDotUtility } from '../../dist/core/battle-dao-v2-contract.js';
import { POISON_P4_PROFILES,createPoisonP4Player,createPoisonP4Target } from '../benchmarks/poison-dao-p4-benchmark.js';
const registry=buildRegistry(),skill=registry.skill('skill.dao.poison.basic');
function setup(){const engine=new CombatEngine(registry,64001,[createPoisonP4Player(POISON_P4_PROFILES[0]),createPoisonP4Target()]);const [e,t]=[...engine.entities.values()];return{engine,e,t,c:e.battleDaoStateV2.poison.core,st:e.battleDaoStateV2.poison.stack};}
const root=(e,n)=>({battleDaoV2:{...createRootActionV2(e,skill,n),directDamagingHitCount:1,daoData:{}},effectBonusPct:0,breakBonusPct:0});
{
 const {e,st}=setup();assert.equal(st.cap,30,'p5 cap');assert.equal(st.durationSeconds,20,'p3 hold');assert.equal(st.decayEverySeconds,2,'p3 decay');
 let rolls=0;const a=root(e,1);poisonObserveRoot(e,skill,a,0,()=>{rolls++;return true;});const before=structuredClone(st);poisonObserveRoot(e,skill,a,1,()=>{rolls++;return true;});assert.equal(rolls,1,'p2 once per eligible root');assert.deepEqual(st,before);assert.equal(st.stacks,1);
 for(let i=2;i<=3;i++)poisonObserveRoot(e,skill,root(e,i),i,()=>false);assert.equal(st.stacks,2,'p1 every three eligible roots');
 const failed=root(e,4);failed.battleDaoV2.directDamagingHitCount=0;poisonObserveRoot(e,skill,failed,4,()=>true);assert.equal(st.stacks,2,'miss/DoT visual tick does not generate');
 st.stacks=30;assert.deepEqual(poisonDotUtility(e),{extraTicks:1,multiplier:1.3599999999999999},'p4/p6 are bounded DoT-only utility');
 const bonuses=remainingDaoPassiveBonusesV2(e,3);assert.equal(bonuses.directDamagePct,0);assert.equal(bonuses.armorPenPct,0);assert.equal(bonuses.gaugeGainPct,0);
}
{
 const {engine,e,t,c,st}=setup();c.targetId=t.id;c.poisonSeedStage=3;st.stacks=30;st.expiresAt=8.01;
 const a=root(e,1);engine.poisonApplyStage(e,t,skill,a,1,8);assert.equal(st.expiresAt,10,'p8 real Công Tâm transition refresh');
 for(let i=0;i<5;i++)v2ResourceProjection(e,8.1);assert.equal(st.expiresAt,10,'p8 read cannot refresh');engine.poisonApplyStage(e,t,skill,a,1,9);assert.equal(st.expiresAt,10,'same root cannot refresh again');
 const consume=registry.skill('skill.dao.poison.consume'),b=root(e,2);b.battleDaoV2.sourceSkillId=consume.id;prepareRemainingDaoCoreActionV2(e,t,consume,b,9);
 let coefficient;engine.applyDamage=(_e,_t,ctx)=>{coefficient=ctx.coefficient;return{hit:true,hpDamage:0};};engine.resolveEffectConsumeMarkDamageV141(e,t,consume.effects[0],'ActiveHit',9,consume.id,0,b,consume,1,1);
 assert(Math.abs(coefficient-(1.05+4*.9)*1.5*1.10)<1e-12,'p7 explicit high-stack quality is separate from sole Công Tâm ×1.5');assert.equal(c.poisonSeedStage,1);
}
{
 const player=createPoisonP4Player(POISON_P4_PROFILES[0]);player.combatBuildV117.mainDaoId='spell';player.combatBuildV117.secondaryDaoId='poison';player.skillIds=['skill.ghost_soul_flame'];player.aiProfile={name:'real Secondary DoT',rules:[{skillId:'skill.ghost_soul_flame',priority:1,conditions:[{type:'always'}]}]};
 const engine=new CombatEngine(registry,64001,[player,createPoisonP4Target()]),[e,t]=[...engine.entities.values()];e.battleDaoStateV2.poison.stack.stacks=20;e.battleDaoStateV2.poison.stack.expiresAt=20;
 engine.handleDecision(e,t,0);engine.handleSkillResolve(e,t,'skill.ghost_soul_flame',e.casting.token,.55);const packet=engine.queue.find(x=>x.kind==='dotTick');assert.equal(packet.dot.remainingTicks,5,'Secondary p4 extends an actually equipped/resolved DoT, creates no fake Poison Active');assert(Math.abs(packet.dot.coefficient-.62*1.24)<1e-12);assert.equal(e.battleDaoStateV2.poison.core,undefined);
}
{
 const run=legacy=>{const player=createPoisonP4Player(POISON_P4_PROFILES[0]);if(legacy){player.combatBuildV117.activeVariantIdsV118=['long','fast','devour','reverse'].map(x=>'variant.dao.poison.'+x);player.combatBuildV117.learnedDaoPassiveIdsV118.push(...['nurture','erode','devour','guard','return'].map(x=>'passive.dao.poison.'+x));player.combatBuildV117.activeSetMechanics=['poison_full_consume_burst','poison_consume_retention','poison_generate_maintain','wood_poison_tick_growth'].map(mechanic=>({mechanic,eligibleDomains:[],params:{bonusPct:100,dotDamageBonusPct:500,retainedPct:100}}));player.initialDaoStateV118={poisonDotPool:100000};}
 return runCombatKernelV3({registry,seed:64001,entities:[player,createPoisonP4Target()],maxDuration:30,mode:'simulation'});};
 const normal=run(false),legacy=run(true);assert.deepEqual(legacy.combatResult.summary,normal.combatResult.summary,'V1 passives/variants/set hooks cannot shadow V2 Poison');assert.deepEqual(legacy.battle.finalState[createPoisonP4Player(POISON_P4_PROFILES[0]).id].battleDaoStateV2.poison,normal.battle.finalState[createPoisonP4Player(POISON_P4_PROFILES[0]).id].battleDaoStateV2.poison);
}
console.log('POISON PASSIVES / LEGACY: eight event owners, pure reads, Main/Secondary real DoT, single Công Tâm authority, inert V1 hooks PASS');
