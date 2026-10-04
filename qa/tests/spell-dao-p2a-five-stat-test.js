import assert from 'node:assert/strict';
import { battleDaoSkillsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';

const skills=battleDaoSkillsV118.filter(skill=>skill.runtimeV117?.daoBinding==='spell');
assert.equal(skills.length,10);
const allowed=new Set(['power','body','agility','spirit','sense']);
for(const skill of skills){
  assert(skill.fiveStatScalingV5,skill.id+' must declare an explicit five-stat family');
  const entries=Object.entries(skill.fiveStatScalingV5);
  assert(entries.length>0,skill.id+' must name at least one authored scaling family');
  assert(entries.every(([stat,value])=>allowed.has(stat)&&Number.isFinite(value)&&value>0),skill.id+' contains an invalid/sixth stat or coefficient');
  assert(Number.isFinite(skill.fiveStatBaselineCoefficientV5)&&skill.fiveStatBaselineCoefficientV5>0,skill.id+' requires a positive authored baseline coefficient');
}
const get=id=>skills.find(skill=>skill.id==='skill.dao.spell.'+id);
assert.deepEqual(get('light').fiveStatScalingV5,{power:1.2,agility:1});
assert.deepEqual(get('channel').fiveStatScalingV5,{power:1.2,sense:4.8});
assert.deepEqual(get('restore').fiveStatScalingV5,{spirit:1});
assert.deepEqual(get('shield').fiveStatScalingV5,{body:1.2});
assert.deepEqual(get('burst').fiveStatScalingV5,{power:3});
assert.deepEqual(get('break').fiveStatScalingV5,{power:1.5,sense:1.2});
assert.deepEqual(get('ultimate').fiveStatScalingV5,{power:2.5,sense:1.5});
assert(skills.every(skill=>!skill.fiveStatScalingV5.agility||skill.id==='skill.dao.spell.light'),
  'TPH is authored on the quick rotation skill only');
assert(skills.every(skill=>!skill.fiveStatScalingV5.sense||['skill.dao.spell.channel','skill.dao.spell.break','skill.dao.spell.ultimate'].includes(skill.id)),
  'TT is local to channel/control/ultimate skills');
assert(skills.every(skill=>!skill.fiveStatScalingV5.spirit||['skill.dao.spell.restore','skill.dao.spell.transform'].includes(skill.id)),
  'LL is local to CN recovery utility and cannot grant generic damage scaling');
console.log('SPELL DAO P2A FIVE-STAT MIGRATION PASS');
