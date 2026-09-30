import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { BODY_DAO_PRODUCTION_PATCH_V1, BODY_DAO_PRODUCTION_SCHEMA_V1 } from '../../dist/content/body-dao-production-v1.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import { backendFeatureClosureManifest } from '../runners/feature-closure-manifest.js';

const BODY_IDS=[
  'skill.dao.body.basic',
  'skill.dao.body.guard',
  'skill.dao.body.transform',
  'skill.dao.body.immovable',
  'skill.dao.body.counter',
  'skill.dao.body.elephant',
  'skill.dao.body.break',
  'skill.dao.body.recover',
  'skill.dao.body.finisher',
  'skill.dao.body.ultimate',
];
const DAMAGE_IDS=[
  'skill.dao.body.basic',
  'skill.dao.body.transform',
  'skill.dao.body.counter',
  'skill.dao.body.elephant',
  'skill.dao.body.break',
  'skill.dao.body.finisher',
];
const DEFENSIVE_IDS=[
  'skill.dao.body.guard',
  'skill.dao.body.immovable',
  'skill.dao.body.recover',
  'skill.dao.body.ultimate',
];

assert.deepEqual(Object.keys(BODY_DAO_PRODUCTION_PATCH_V1).sort(),[...BODY_IDS].sort(),'B1 overlay must own exactly the ten stable Body skill ids');
const registry=buildRegistry();
const bodySkills=BODY_IDS.map(id=>registry.skills.get(id));
assert.ok(bodySkills.every(Boolean),'all ten Body production skills must be registered');
assert.equal(bodySkills.length,10);

for(const id of DAMAGE_IDS){
  const skill=registry.skills.get(id);
  assert.equal(skill.productionAuthorityV1,BODY_DAO_PRODUCTION_SCHEMA_V1,`${id}: production authority missing`);
  assert.ok(skill.fiveStatScalingV5&&typeof skill.fiveStatScalingV5==='object',`${id}: explicit five-stat scaling required`);
  const total=Object.values(skill.fiveStatScalingV5).reduce((n,v)=>n+Number(v||0),0);
  assert.ok(Math.abs(total-skill.fiveStatBaselineCoefficientV5)<1e-9,`${id}: equal-stat baseline must remain normalized`);
  assert.ok((skill.fiveStatScalingV5.body??0)>0,`${id}: Thể Phách must participate in Body damage identity`);
}

for(const id of DEFENSIVE_IDS){
  const skill=registry.skills.get(id);
  assert.equal(skill.productionAuthorityV1,BODY_DAO_PRODUCTION_SCHEMA_V1,`${id}: production authority missing`);
  const shields=(skill.effects??[]).filter(e=>e.type==='shield');
  assert.ok(shields.length>=1,`${id}: expected bounded defensive shield effect`);
  assert.ok(shields.every(e=>(e.maxHpPct??0)>0),`${id}: launch-era flat-only shield authority must not remain live`);
  assert.ok(shields.every(e=>(e.capacity??0)===0),`${id}: Body B1 shield must derive from HP authority, not hidden flat capacity`);
}

const profile=battleDaoAutoRotationV127('body',BODY_IDS);
const rulesFor=id=>profile.rules.filter(r=>r.skillId===id);
const hasCondition=(rule,type,predicate=()=>true)=>rule.conditions.some(c=>c.type===type&&predicate(c));
assert.ok(rulesFor('skill.dao.body.transform').some(r=>hasCondition(r,'targetIsCasting')),'Hóa Kình must react to a real cast window in Auto');
assert.ok(rulesFor('skill.dao.body.counter').some(r=>hasCondition(r,'targetIsCasting')&&hasCondition(r,'selfDaoV2ResourceAtLeast',c=>c.resource==='counterForce'&&c.value>=30)),'counter cash-out must require threat + Phản Thế');
assert.ok(rulesFor('skill.dao.body.finisher').some(r=>hasCondition(r,'targetIsBroken')&&hasCondition(r,'selfDaoV2ResourceAtLeast',c=>c.resource==='counterForce'&&c.value>=70)),'finisher must cash high Phản Thế into Broken window');
assert.ok(rulesFor('skill.dao.body.break').some(r=>hasCondition(r,'targetIsNotBroken')&&hasCondition(r,'selfDaoV2ResourceAtLeast',c=>c.resource==='counterForce'&&c.value>=20)),'Break cash-out must target a non-Broken opponent');
assert.equal(rulesFor('skill.dao.body.transform').some(r=>r.conditions.some(c=>c.type==='always')),false,'Hóa Kình must not be unconditional Auto filler');
assert.equal(rulesFor('skill.dao.body.counter').some(r=>r.conditions.some(c=>c.type==='always')),false,'counter must not be unconditional Auto filler');

const manifest=backendFeatureClosureManifest('dao-body');
assert.equal(manifest.closureReady,false,'Body remains OPEN until B2+ correctness/parity/benchmark complete');
assert.ok(manifest.gates.includes('body-dao-production-contract-test.js'));
assert.deepEqual(manifest.lockedRegressionFeatures,['dao-sword','dao-fist']);

const contract=fs.readFileSync('docs/runtime/BODY_DAO_PRODUCTION_CONTRACT_20260930.md','utf8');
assert.match(contract,/Chịu → Hóa → Phản/);
assert.match(contract,/old HP-loss-driven stack gain is removed/);
assert.match(contract,/closureReady.*false/s);

console.log('BODY DAO B0/B1 PRODUCTION CONTRACT PASS');
