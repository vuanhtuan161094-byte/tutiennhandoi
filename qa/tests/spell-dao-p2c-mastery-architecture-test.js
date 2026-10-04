import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { spellSkillMasteryV2 } from '../../dist/content/spell-dao-v2.js';
import { battleDaoSkillGrowthProfileV126 } from '../../dist/core/battle-dao-skill-growth-v126.js';
const registry=buildRegistry();
assert.equal(spellSkillMasteryV2.length,10);
for(const row of spellSkillMasteryV2){
  const skill=registry.skill(row.skillId);
  assert.deepEqual(Object.keys(row.milestones).map(Number),[100,250,500,750,1000]);
  let previous=battleDaoSkillGrowthProfileV126(skill,0);
  for(const at of [100,250,500,750,1000]){
    const current=battleDaoSkillGrowthProfileV126(skill,at);
    assert.equal(current.daoGeneratePct,0,'mastery never manufactures form completion');
    assert.equal(current.daoRefundPct,0,'one-shot readiness cannot be refunded');
    assert(current.effectBonusPct+current.breakBonusPct+current.spiritCostReductionPct+current.cooldownReductionPct+current.castTimeReductionPct+current.recoveryReductionPct > previous.effectBonusPct+previous.breakBonusPct+previous.spiritCostReductionPct+previous.cooldownReductionPct+previous.castTimeReductionPct+previous.recoveryReductionPct, row.skillId+'@'+at+' is executable');
    assert.equal(row.milestones[at],current.milestones.find(x=>x.at===at).summary);
    assert(current.spiritCostReductionPct<=3 && current.castTimeReductionPct<=4 && current.recoveryReductionPct<=7,'bounded skill-local timing/economy');
    previous=current;
  }
}
console.log('SPELL DAO P2C MASTERY ARCHITECTURE PASS');
