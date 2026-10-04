import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { CombatEngine } from '../../dist/core/combat.js';
import { runCombatKernelV3,runCompiledCombatEncounterV3 } from '../../dist/core/combat-kernel-v2.js';
import { chooseSkill } from '../../dist/core/ai.js';
import { carryBattleDaoV2StateToNextMonsterV2 } from '../../dist/core/battle-dao-v2-runtime.js';
import { poisonObserveRoot,poisonDotUtility,poisonAutoWindow } from '../../dist/core/battle-dao-v2-contract.js';
import { POISON_P4_PROFILES,createPoisonP4Player,createPoisonP4Target } from '../benchmarks/poison-dao-p4-benchmark.js';
const registry=buildRegistry();
function setup(i=0) {const engine=new CombatEngine(registry,64001,[createPoisonP4Player(POISON_P4_PROFILES[i]),createPoisonP4Target()]);const [e,t]=[...engine.entities.values()];return{engine,e,t,c:e.battleDaoStateV2.poison.core};}
function manual(e,id){e.aiProfile={name:'manual test',rules:[{skillId:id,priority:100,conditions:[{type:'always'}]}]};}
for(const mode of ['pve','pvp','hunt','boss']) {
 const entities=[createPoisonP4Player(POISON_P4_PROFILES[0]),createPoisonP4Target()];
 const raw=runCombatKernelV3({registry,seed:64001,entities,maxDuration:18,mode:'simulation'});
 const compiled=runCompiledCombatEncounterV3({schema:'combat-encounter.v1',encounterId:'poison-'+mode,activity:mode,mode:'simulation',seed:64001,entities,maxDuration:18,metadata:{}},registry);
 assert.deepEqual(compiled.battle.finalState,raw.battle.finalState);assert.deepEqual(compiled.combatResult.summary,raw.combatResult.summary);
}
for(const [file,pattern] of [['pvp-v91.js',/runCompiledCombatEncounterV3/],['session.js',/representativeCombat = resolveEndlessHuntWithCombatKernelV3/],['endless-hunt-combat-kernel-v2.js',/runCompiledCombatEncounterV3/],['activity.js',/carryBattleDaoV2StateToNextMonsterV2/]])assert.match(fs.readFileSync(new URL('../../dist/core/'+file,import.meta.url),'utf8'),pattern);
for(const interrupt of [true,false]) {
 const {engine,e,t,c}=setup();manual(e,'skill.dao.poison.insects');engine.handleDecision(e,t,0);engine.handleSkillResolve(e,t,'skill.dao.poison.insects',e.casting.token,.4);
 assert.equal(c.poisonSeedStage,0,'channel start grants no stage');const token=e.channeling.token,total=e.channeling.totalHits;engine.applyDamage=()=>({hit:true,hpDamage:1});
 engine.handleChannelTick(e,t,'skill.dao.poison.insects',token,0,.9);assert.equal(c.poisonSeedStage,0);
 if(interrupt){assert(engine.queue.some(x=>x.dot?.poisonPacket),'first landed channel tick owns a finite DoT, retained on interruption');engine.interruptAction(e,t,registry.skill('skill.dao.poison.insects'),'test',1);engine.handleChannelEnd(e,t,'skill.dao.poison.insects',token,3);assert.equal(c.poisonSeedStage,0);assert.equal(engine.queue.filter(x=>x.dot?.poisonPacket).length,1,'interrupted channel has no Cực Ý completion packet');}
 else{for(let i=2;i<=total;i++)engine.handleChannelTick(e,t,'skill.dao.poison.insects',token,0,.4+i*.5);engine.handleChannelEnd(e,t,'skill.dao.poison.insects',token,3);assert.equal(c.poisonSeedStage,2);const before=structuredClone(c);engine.handleChannelEnd(e,t,'skill.dao.poison.insects',token,4);assert.deepEqual(c,before);assert(engine.queue.some(x=>x.dot?.poisonPacket));}
}
{
 const {engine,e,t,c}=setup();c.targetId=t.id;c.poisonSeedStage=4;manual(e,'skill.dao.poison.consume');engine.handleDecision(e,t,0);const token=e.casting.token;engine.interruptAction(e,t,registry.skill('skill.dao.poison.consume'),'test',.1);engine.handleSkillResolve(e,t,'skill.dao.poison.consume',token,1);assert.equal(c.poisonSeedStage,4,'interrupt before payoff preserves stage');
}
{
 const {engine,e,t,c}=setup(2);e.hp=e.baseStats.maxHp*.3;assert.equal(chooseSkill(e,t,registry,0).id,'skill.dao.poison.guard');manual(e,'skill.dao.poison.guard');engine.handleDecision(e,t,0);engine.handleSkillResolve(e,t,'skill.dao.poison.guard',e.casting.token,0);assert(e.shields.length>0,'pressure uses actual Guard');
 c.targetId=t.id;c.poisonSeedStage=3;c.dotUntil={mist:8};c.lastApplicationAt=0;assert.equal(poisonAutoWindow(e,t,'transform',1),false);assert.equal(poisonAutoWindow(e,t,'transform',2),true);e.ultimateGaugeV117=100;c.poisonSeedStage=0;assert.equal(poisonAutoWindow(e,t,'ultimate',3),false);assert.equal(poisonAutoWindow(e,t,'ultimate',7),true,'bounded hold');
}
{
 const {e,t,c}=setup();c.targetId=t.id;c.poisonSeedStage=4;e.battleDaoStateV2.poison.stack.stacks=10;e.battleDaoStateV2.poison.stack.expiresAt=15;
 const carried=carryBattleDaoV2StateToNextMonsterV2(e.battleDaoStateV2,8);assert.equal(carried.poison.core.poisonSeedStage,0);assert.equal(carried.poison.core.targetId,undefined);assert.equal(carried.poison.stack.expiresAt,7);assert.equal(c.poisonSeedStage,4);
 const player=createPoisonP4Player(POISON_P4_PROFILES[0]);player.initialBattleDaoStateV2=JSON.parse(JSON.stringify(e.battleDaoStateV2));const restored=new CombatEngine(registry,64001,[player,createPoisonP4Target()]).entities.get(player.id);assert.equal(restored.battleDaoStateV2.poison.core.poisonSeedStage,0,'new encounter never restores target core even if target id repeats');assert.equal(restored.battleDaoStateV2.poison.stack.stacks,10);assert.equal(restored.battleDaoStateV2.poison.stack.expiresAt,15);
}
{
 const player=createPoisonP4Player(POISON_P4_PROFILES[0]);player.combatBuildV117.mainDaoId='sword';player.combatBuildV117.secondaryDaoId='poison';player.skillIds=['skill.dao.sword.basic'];manual(player,'skill.dao.sword.basic');
 const engine=new CombatEngine(registry,64001,[player,createPoisonP4Target()]),[e,t]=[...engine.entities.values()];e.battleDaoStateV2.poison.stack.stacks=10;engine.handleDecision(e,t,0);const action=e.casting.runtimeV117;engine.handleSkillResolve(e,t,'skill.dao.sword.basic',e.casting.token,0);const st=structuredClone(e.battleDaoStateV2.poison.stack);poisonObserveRoot(e,registry.skill('skill.dao.sword.basic'),action,1,()=>true);assert.deepEqual(e.battleDaoStateV2.poison.stack,st);assert.equal(e.battleDaoStateV2.poison.core,undefined);assert.equal(poisonDotUtility(e).extraTicks,1);
}
console.log('POISON P3: compiled PvE/PvP/Hunt/Boss parity, manual/Auto/Guard, channel partial/full, interruption, JSON/new-encounter reset, Secondary root idempotence PASS');
