import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { poisonDaoV2 } from '../../dist/content/poison-dao-v2.js';
import { battleDaoSkillGrowthProfileV126 } from '../../dist/core/battle-dao-skill-growth-v126.js';
import { fiveStatSkillPowerV5 } from '../../dist/core/combat-rules.js';
import { canUseBattleDaoSkillV118 } from '../../dist/core/battle-dao-combat-v118.js';
import { remainingDaoPassiveBonusesV2 } from '../../dist/core/battle-dao-v2-runtime.js';
import { CombatEngine } from '../../dist/core/combat.js';
import { POISON_P4_PROFILES,createPoisonP4Player,createPoisonP4Target } from '../benchmarks/poison-dao-p4-benchmark.js';
const registry=buildRegistry(),names=['basic','bone','heart','insects','mist','transform','guard','consume','calamity','ultimate'];
const families=[['power'],['power','agility'],['power','sense'],['power','spirit'],['power','sense','agility'],['power','agility'],['body'],['power','sense'],['power','spirit'],['power','sense']];
assert.equal(poisonDaoV2.passives.length,8);assert.equal(poisonDaoV2.mastery.length,10);
for(let i=0;i<10;i++) {
 const skill=registry.skill('skill.dao.poison.'+names[i]);
 assert.deepEqual(Object.keys(skill.fiveStatScalingV5).sort(),families[i].sort());
 const primary={power:100,body:100,agility:100,spirit:100,sense:100},base=fiveStatSkillPowerV5({primaryStatsV5:primary,attack:100},skill.fiveStatScalingV5,skill.fiveStatBaselineCoefficientV5);
 for(const key of Object.keys(primary)){ const scaled=fiveStatSkillPowerV5({primaryStatsV5:{...primary,[key]:200},attack:key==='power'?200:100},skill.fiveStatScalingV5,skill.fiveStatBaselineCoefficientV5);assert.equal(scaled>base,families[i].includes(key),`${skill.id} ${key} owned scaling`); }
 let previous=battleDaoSkillGrowthProfileV126(skill,0);
 for(const tier of [100,250,500,750,1000]) {const current=battleDaoSkillGrowthProfileV126(skill,tier);assert.notDeepEqual(current,previous);assert.equal(current.daoGeneratePct,0);assert.equal(current.daoRefundPct,0);assert.equal(current.milestones.find(x=>x.at===tier).summary,poisonDaoV2.mastery[i].milestones[tier]);previous=current;}
 assert(!skill.effects.some(x=>x.type==='applyStatus'&&x.target!=='self'),'Poison has no hard CC');
}
const player=createPoisonP4Player(POISON_P4_PROFILES[0]);player.combatBuildV117.mainDaoId='sword';player.combatBuildV117.secondaryDaoId='poison';
const engine=new CombatEngine(registry,1,[player,createPoisonP4Target()]),e=[...engine.entities.values()][0];
assert.equal(e.battleDaoStateV2.poison.core,undefined);
for(const suffix of names)assert.equal(canUseBattleDaoSkillV118(e,registry.skill('skill.dao.poison.'+suffix)),false);
e.battleDaoStateV2.poison.stack.stacks=30;e.battleDaoStateV2.poison.stack.expiresAt=50;
const before=structuredClone(e.battleDaoStateV2.poison.stack),bonuses=remainingDaoPassiveBonusesV2(e,0);
assert.equal(bonuses.directDamagePct,0);assert.equal(bonuses.armorPenPct,0);assert.equal(bonuses.gaugeGainPct,0);assert.deepEqual(e.battleDaoStateV2.poison.stack,before);
console.log('POISON CONTRACT: 10 skills / 8 passives / 50 executable local mastery / five-stat / Secondary PASS');
