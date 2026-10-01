import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BODY_B6_PROFILES, validateBodyB6Profiles } from '../benchmarks/body-dao-b6-immovable-ablation.js';

assert.deepEqual(validateBodyB6Profiles(),[]);
assert.equal(BODY_B6_PROFILES.length,2);
const baseline=BODY_B6_PROFILES.find(x=>x.id==='immovable');
const control=BODY_B6_PROFILES.find(x=>x.id==='control');
assert(baseline&&control);
assert.deepEqual(control.allocation,baseline.allocation,'B6 must keep five-stat allocation identical');
assert.equal(baseline.activeSkillIds.length,5);
assert.equal(control.activeSkillIds.length,5);
assert(baseline.activeSkillIds.includes('skill.dao.body.immovable'));
assert(!control.activeSkillIds.includes('skill.dao.body.immovable'));
const removed=baseline.activeSkillIds.filter(x=>!control.activeSkillIds.includes(x));
const added=control.activeSkillIds.filter(x=>!baseline.activeSkillIds.includes(x));
assert.deepEqual(removed,['skill.dao.body.immovable']);
assert.deepEqual(added,['skill.dao.body.finisher']);

const source=fs.readFileSync(new URL('../benchmarks/body-dao-b6-immovable-ablation.js',import.meta.url),'utf8');
assert(source.includes('runCombatKernelV3({registry,seed,entities:[player,target]'),'B6 must use production CombatKernel V3');
assert(source.includes("schema:'body-dao-b6-immovable-ablation.v1'"));
assert(source.includes('No pass/fail survival threshold is authored before evidence.'),'B6 must remain evidence-first');
assert(source.includes('immovableCompletionsMean<=0'),'B6 must reject a baseline where Bất Động never completes');
assert(source.includes('finalHpDeltaPct'));
assert(source.includes('shieldAbsorbedDeltaPct'));
assert(source.includes('hpDamageTakenDeltaPct'));
assert(source.includes('dpsDeltaPct'));

console.log('BODY DAO B6 ABLATION CONTRACT: PASS');
