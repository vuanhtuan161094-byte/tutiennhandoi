import assert from 'node:assert/strict';
import fs from 'node:fs';
import { battleDaoSkillsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';
import { fiveStatSkillPowerV5 } from '../../dist/core/combat-rules.js';
import { mindGuardFiveStatMultiplierV2 } from '../../dist/core/mind-dao-v2-runtime.js';

const expected = {
  'skill.dao.mind.basic': [{ power:2.00, sense:.55 }, 2.55],
  'skill.dao.mind.mark': [{ power:1.15, sense:1.20 }, 2.35],
  'skill.dao.mind.split': [{ power:.95, agility:1.05, sense:1.00 }, 3.00],
  'skill.dao.mind.interfere': [{ power:.65, sense:1.30 }, 1.95],
  'skill.dao.mind.guard': [{ body:.75, sense:1.55 }, 2.30],
  'skill.dao.mind.chase': [{ power:1.20, agility:.80, sense:1.15 }, 3.15],
  'skill.dao.mind.burst': [{ power:2.35, sense:1.15 }, 3.50],
  'skill.dao.mind.observe': [{ power:.80, sense:2.10 }, 2.90],
  'skill.dao.mind.flow': [{ power:.95, agility:.75, sense:1.60 }, 3.30],
  'skill.dao.mind.ultimate': [{ power:2.10, sense:1.90 }, 4.00],
};

const skills = battleDaoSkillsV118.filter(x => x.runtimeV117?.daoBinding === 'mind');
assert.equal(skills.length,10);
for (const skill of skills) {
  const row=expected[skill.id];
  assert(row,`unexpected Mind skill ${skill.id}`);
  assert.deepEqual(skill.fiveStatScalingV5,row[0],`${skill.id} five-stat family drifted`);
  assert.equal(skill.fiveStatBaselineCoefficientV5,row[1],`${skill.id} neutral baseline drifted`);
  assert.equal(skill.fiveStatScalingV5.spirit,undefined,`${skill.id} must not turn LL into hidden damage/effect scaling`);
}

// M2A uses a neutral denominator: equal relevant primary axes preserve the old Attack anchor.
const equalStats={
  attack:100,
  primaryStatsV5:{power:100,body:100,agility:100,spirit:100,sense:100},
};
for(const skill of skills.filter(x=>x.id!=='skill.dao.mind.guard')){
  const got=fiveStatSkillPowerV5(equalStats,skill.fiveStatScalingV5,skill.fiveStatBaselineCoefficientV5);
  assert.equal(Number(got.toFixed(8)),100,`${skill.id} must be neutral at equal-axis baseline`);
}

// Guard is a TP+TT effect family, not dead metadata and not CL/Attack shield scaling.
const guard=skills.find(x=>x.id==='skill.dao.mind.guard');
assert(Math.abs(mindGuardFiveStatMultiplierV2(equalStats,guard)-1)<1e-9,'equal-axis Tâm Kính baseline must remain neutral');
const mentalGuardStats={attack:100,primaryStatsV5:{power:100,body:150,agility:100,spirit:100,sense:200}};
assert(mindGuardFiveStatMultiplierV2(mentalGuardStats,guard)>1,'TP+TT allocation must strengthen Tâm Kính');
const powerOnlyGuardStats={attack:200,primaryStatsV5:{power:200,body:100,agility:100,spirit:100,sense:100}};
assert(mindGuardFiveStatMultiplierV2(powerOnlyGuardStats,guard)<1,'CL-only allocation must not masquerade as Tâm Kính scaling');

const combatSource=fs.readFileSync(new URL('../../dist/core/combat.js',import.meta.url),'utf8');
assert(combatSource.includes('mindGuardFiveStatMultiplierV2'),'CombatEngine must consume the Tâm Kính TP+TT effect family');
assert(/fiveStatBaselineCoefficientV5:\s*(?:skill|mindSkill)\.fiveStatBaselineCoefficientV5/.test(combatSource),'Mind packets must carry five-stat metadata into applyDamage regardless of wrapper-local variable name');

console.log('MIND DAO M2A FIVE-STAT MIGRATION: PASS');
