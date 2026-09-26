import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';
import { skillRuntimeV117 } from '../../dist/core/skill-runtime-v117.js';
import {
  FIST_Q4_PROFILES,
  createFistQ4Player,
  createFistQ4Target,
  summarizeFistQ4Run,
} from '../benchmarks/fist-dao-q4-benchmark.js';

const registry=buildRegistry();
const fistCounter=registry.skill('skill.dao.fist.counter');
const swordCounter=registry.skill('skill.dao.sword.counter');
assert.equal(skillRuntimeV117(fistCounter).requiresCounterWindow,false,'Hồi Thân must use live target cast/channel instead of legacy boss counter window');
assert.notEqual(skillRuntimeV117(swordCounter).requiresCounterWindow,false,'Sword counter gate must remain unchanged');

const base=FIST_Q4_PROFILES.find(x=>x.id==='counter');
assert(base,'missing Fist counter profile');
const profile={
  ...base,
  activeSkillIds:[
    'skill.dao.fist.nurture',
    'skill.dao.fist.heavy',
    'skill.dao.fist.counter',
    'skill.dao.fist.chain_heavy',
    'skill.dao.fist.finisher',
  ],
};
const player=createFistQ4Player(profile);
player.aiProfile=battleDaoAutoRotationV127('fist',player.skillIds);
const target=createFistQ4Target();
target.skillIds=['skill.boss.v81.cataclysm'];
target.aiProfile={name:'Fist Counter Runtime Target',rules:[{skillId:'skill.boss.v81.cataclysm',priority:100,conditions:[{type:'always'}]}]};
target.stats.attack=1;
const kernel=runCombatKernelV3({registry,seed:63001,entities:[player,target],maxDuration:90,mode:'simulation'});
const summary=summarizeFistQ4Run(kernel,profile,63001);
const counterCasts=Number(summary.casts['skill.dao.fist.counter']??0);
assert(counterCasts>0,`Hồi Thân must cast against a live target cast window, got ${counterCasts}`);
assert(summary.counterSuccess>0,`Hồi Thân must resolve successful counters, got ${summary.counterSuccess}`);
assert(summary.counterStaggers>0,`successful Hồi Thân must apply Phản Chấn, got ${summary.counterStaggers}`);

const aiSource=fs.readFileSync(new URL('../../dist/core/ai.js',import.meta.url),'utf8');
assert(aiSource.includes("skillRuntimeV117(s).form !== 'counter'"),'generic AI fallback must not spam tactical Counter skills');
console.log(`FIST DAO COUNTER RUNTIME: PASS (${counterCasts} casts / ${summary.counterSuccess} success in 90s)`);
