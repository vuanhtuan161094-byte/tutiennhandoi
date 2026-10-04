import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { CombatEngine } from '../../dist/core/combat.js';
import { runCombatKernelV3, runCompiledCombatEncounterV3 } from '../../dist/core/combat-kernel-v2.js';
import { chooseSkill } from '../../dist/core/ai.js';
import { createSpellP4Player, createSpellP4Target, SPELL_P4_PROFILES } from '../benchmarks/spell-dao-p4-benchmark.js';
import { carryBattleDaoV2StateToNextMonsterV2, finishRemainingDaoActionV2 } from '../../dist/core/battle-dao-v2-runtime.js';
const registry=buildRegistry();
const setup=(profile=0)=>{const engine=new CombatEngine(registry,64001,[createSpellP4Player(SPELL_P4_PROFILES[profile]),createSpellP4Target()]);const [e,t]=[...engine.entities.values()];return{engine,e,t,c:e.battleDaoStateV2.spell.core};};
const read=p=>fs.readFileSync(new URL('../../dist/core/'+p,import.meta.url),'utf8');
for(const path of ['pvp-v91.js','session.js']) assert.match(read(path),/runCompiledCombatEncounterV3/);
assert.match(read('endless-hunt-combat-kernel-v2.js'),/resolveEndlessHuntWithCombatKernel\(input, runCompiledCombatEncounterV3/);
assert.match(read('session.js'),/initialBattleDaoStateV2: huntRuntime\?\.battleDaoStateV2/);
assert.match(read('session.js'),/representativeCombat = resolveEndlessHuntWithCombatKernelV3/,'offline rate comes from representative production combat');
assert.match(read('activity.js'),/battleDaoStateV2: carryBattleDaoV2StateToNextMonsterV2/,'real Hunt settlement must use the tested carry authority');
{
 const entities=[createSpellP4Player(SPELL_P4_PROFILES[1]),createSpellP4Target()];
 const raw=runCombatKernelV3({registry,seed:64001,entities,maxDuration:40,mode:'simulation'});
 for(const activity of ['pvp','hunt','boss']){
  const compiled=runCompiledCombatEncounterV3({schema:'combat-encounter.v1',encounterId:'spell-parity-'+activity,activity,mode:'simulation',seed:64001,entities,maxDuration:40},registry);
  assert.deepEqual(compiled.battle.finalState,raw.battle.finalState,'compiled '+activity+' shares the same wheel, CN, mastery and completion state');
  assert.deepEqual(compiled.combatResult.summary,raw.combatResult.summary);
 }
}
{
 const player=createSpellP4Player(SPELL_P4_PROFILES[0]);player.combatBuildV117.mainDaoId='sword';player.combatBuildV117.secondaryDaoId='spell';
 player.skillIds=['skill.dao.sword.basic','skill.dao.sword.flow_slash'];player.aiProfile={name:'secondary Spell',rules:[{skillId:'skill.dao.sword.flow_slash',priority:1,conditions:[{type:'always'}]}]};
 const engine=new CombatEngine(registry,64001,[player,createSpellP4Target()]),[e,t]=[...engine.entities.values()];
 assert.equal(e.battleDaoStateV2.spell.core,undefined);
 engine.handleDecision(e,t,0);const action=e.casting.runtimeV117;
 engine.handleSkillResolve(e,t,'skill.dao.sword.flow_slash',e.casting.token,0);
 const stacks=e.battleDaoStateV2.spell.stack.stacks;assert(stacks>=1&&stacks<=2,'Secondary Spell observes a real paid Sword root');
 finishRemainingDaoActionV2(e,t,registry.skill('skill.dao.sword.flow_slash'),action,1,()=>true);
 assert.equal(e.battleDaoStateV2.spell.stack.stacks,stacks,'replayed observer cannot double-generate');
}
for(let i=0;i<3;i++){
 const {e,t,c}=setup(i);
 assert.equal(chooseSkill(e,t,registry,0).id,'skill.dao.spell.'+(i===1?'light':'basic'));
 c.lawWheelStage=1;c.expectedForm='Thi Triển';assert.equal(chooseSkill(e,t,registry,0).id,'skill.dao.spell.seal');
 c.lawWheelStage=2;c.expectedForm='Dẫn Pháp';assert.equal(chooseSkill(e,t,registry,0).id,'skill.dao.spell.channel');
 c.dienPhapReady=true;assert.equal(chooseSkill(e,t,registry,0).id,'skill.dao.spell.'+(i===2?'break':'burst'));
 e.spirit=10;assert.equal(chooseSkill(e,t,registry,0).id,'skill.dao.spell.restore');
 e.spirit=100;c.dienPhapReady=false;t.casting={skillId:'risk',resolvesAt:3};assert.notEqual(chooseSkill(e,t,registry,0).id,'skill.dao.spell.channel','Auto avoids an exposed offensive channel');
 t.casting=undefined;e.ultimateGaugeV117=100;assert.equal(chooseSkill(e,t,registry,0).id,'skill.dao.spell.ultimate','Gauge cannot be held indefinitely');
}
{
 const {engine,e,t,c}=setup();c.expectedForm='Thi Triển';c.lawWheelStage=1;
 engine.handleDecision(e,t,0);const cost=e.baseStats.maxSpirit-e.spirit;assert(cost>0);
 engine.interruptAction(e,t,registry.skill('skill.dao.spell.seal'),'test',.2);
 engine.handleSkillResolve(e,t,'skill.dao.spell.seal',1,1);assert.equal(c.lawWheelStage,1,'interrupted cast does not advance');assert.equal(e.baseStats.maxSpirit-e.spirit,cost,'paid start CN is not refunded');
}
{
 const {engine,e,t,c}=setup();c.expectedForm='Dẫn Pháp';c.lawWheelStage=2;
 engine.handleDecision(e,t,0);engine.handleSkillResolve(e,t,'skill.dao.spell.channel',e.casting.token,.4);
 const token=e.channeling.token,start=e.spirit;
 engine.handleChannelTick(e,t,'skill.dao.spell.channel',token,2,.9);
 assert.equal(e.spirit,start-2);assert.equal(c.completedCycles,0);
 engine.interruptAction(e,t,registry.skill('skill.dao.spell.channel'),'test',1);
 engine.handleChannelEnd(e,t,'skill.dao.spell.channel',token,2.4);assert.equal(c.completedCycles,0,'partial channel never completes');
}
{
 const {engine,e,t,c}=setup();c.expectedForm='Dẫn Pháp';c.lawWheelStage=2;
 engine.handleDecision(e,t,0);engine.handleSkillResolve(e,t,'skill.dao.spell.channel',e.casting.token,.4);
 const token=e.channeling.token;e.spirit=0;engine.handleChannelTick(e,t,'skill.dao.spell.channel',token,2,.9);
 engine.handleChannelEnd(e,t,'skill.dao.spell.channel',token,2.4);assert.equal(c.completedCycles,0,'insufficient per-tick CN cancels completion');
}
{
 const {engine,e,t,c}=setup();c.expectedForm='Dẫn Pháp';c.lawWheelStage=2;
 engine.handleDecision(e,t,0);engine.handleSkillResolve(e,t,'skill.dao.spell.channel',e.casting.token,.4);
 const token=e.channeling.token;t.alive=false;engine.handleChannelEnd(e,t,'skill.dao.spell.channel',token,2.4);
 assert.equal(c.completedCycles,0,'target death during channel cannot grant full completion');
}
{
 const {engine,e,t,c}=setup();c.dienPhapReady=true;
 engine.handleDecision(e,t,0);const token=e.casting.token;assert.equal(c.dienPhapReady,true);
 engine.interruptAction(e,t,registry.skill('skill.dao.spell.burst'),'test',.3);
 engine.handleSkillResolve(e,t,'skill.dao.spell.burst',token,2);assert.equal(c.dienPhapReady,true);
 c.expectedForm='Dẫn Pháp';c.lawWheelStage=2;
 const generated={battleDaoV2:{procDepth:1,daoData:{spellCnPaid:16}},effectBonusPct:0};
 finishRemainingDaoActionV2(e,t,registry.skill('skill.dao.spell.channel'),generated,3,()=>true);
 assert.equal(c.completedCycles,0,'generated follow-up never completes a root form');
 c.completedCycles=3;const stack=e.battleDaoStateV2.spell.stack;stack.stacks=10;stack.expiresAt=15;
 const carried=carryBattleDaoV2StateToNextMonsterV2(e.battleDaoStateV2,8);
 assert.equal(carried.spell.stack.expiresAt,7);assert.equal(carried.spell.stack.stacks,10);
 assert.equal(carried.spell.core.expectedForm,'Tốc Pháp');assert.equal(carried.spell.core.dienPhapReady,false);
 assert.equal(c.dienPhapReady,true,'carry does not mutate the finished battle');
 const next=createSpellP4Player(SPELL_P4_PROFILES[0]);next.initialBattleDaoStateV2=JSON.parse(JSON.stringify(carried));
 const restored=new CombatEngine(registry,64001,[next,createSpellP4Target()]).entities.get(next.id);
 assert.deepEqual(restored.battleDaoStateV2.spell,JSON.parse(JSON.stringify(carried.spell)),'JSON Hunt/save restore keeps durable remaining state without action tokens');
}
{
 const {engine,e,t,c}=setup(1);engine.handleDecision(e,t,0);
 engine.handleSkillResolve(e,t,'skill.dao.spell.light',e.casting.token,0);
 assert.equal(c.quickCycle,true,'Light 1000 primes only a genuine completed quick form');
 engine.handleDecision(e,t,.7);
 assert(Math.abs(e.casting.runtimeV117.castTimeMultiplier-.65)<1e-9);
 engine.handleSkillResolve(e,t,'skill.dao.spell.seal',e.casting.token,1.35);
 engine.handleDecision(e,t,2);engine.handleSkillResolve(e,t,'skill.dao.spell.channel',e.casting.token,2.25);
 const token=e.channeling.token,before=e.spirit;e.cooldownUntil['skill.dao.spell.burst']=10;
 for(let i=1;i<=4;i++)engine.handleChannelTick(e,t,'skill.dao.spell.channel',token,2,2.25+i*.5);
 engine.handleChannelEnd(e,t,'skill.dao.spell.channel',token,4.25);
 assert.equal(c.completedCycles,1);assert.equal(c.quickCycle,false);assert.equal(c.dienPhapReady,true);
 assert.equal(e.spirit,before-8);assert.equal(e.cooldownUntil['skill.dao.spell.burst'],8.5);
 const stack=e.battleDaoStateV2.spell.stack.stacks;
 engine.handleChannelEnd(e,t,'skill.dao.spell.channel',token,5);
 assert.equal(c.completedCycles,1);assert.equal(e.battleDaoStateV2.spell.stack.stacks,stack,'replayed channel completion has no duplicate stack or reward');
}
{
 const {engine,e,t}=setup();e.spirit=20;e.aiProfile={name:'manual restore',rules:[{skillId:'skill.dao.spell.restore',priority:1,conditions:[{type:'always'}]}]};
 engine.handleDecision(e,t,0);engine.handleSkillResolve(e,t,'skill.dao.spell.restore',e.casting.token,.3);
 const token=e.channeling.token;engine.handleChannelTick(e,t,'skill.dao.spell.restore',token,0,.8);
 const partial=e.spirit;assert(partial>20);
 engine.interruptAction(e,t,registry.skill('skill.dao.spell.restore'),'test',.9);
 engine.handleChannelTick(e,t,'skill.dao.spell.restore',token,0,1.3);engine.handleChannelEnd(e,t,'skill.dao.spell.restore',token,2.8);
 assert.equal(e.spirit,partial,'interrupted restore grants only resolved start/tick recovery');
}
{
 const {engine,e,t}=setup();e.spirit=0;
 engine.resolveEffectRestoreSpiritV141(e,t,{flat:10},'ActiveHit',0,'skill.dao.spell.restore',0,{},registry.skill('skill.dao.spell.restore'),1.13,1);
 assert.equal(e.spirit,11.299999999999999,'utility mastery affects actual CN recovery');
}
console.log('SPELL DAO P3 AUTO / CONSUMER / INTERRUPT / HUNT CARRY PASS');
