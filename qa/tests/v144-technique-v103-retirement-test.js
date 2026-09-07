import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolveTechniqueRuntimeV119 } from '../../dist/core/technique-runtime-v119.js';
import { elementSealCandidatesV133, resolveAuthorizedSkillRootBindingsV133 } from '../../dist/core/element-seal-v133.js';
import { buildManualCatalogV127, MANUAL_LEVEL_MAX_V127, MANUAL_ADVANCE_MAX_V127 } from '../../dist/core/manual-progression-v127.js';

await assert.rejects(access(new URL('../../dist/core/technique-progression-v103.js', import.meta.url)), 'V103 progression module must be physically retired');
const manuals = buildManualCatalogV127();
assert.equal(manuals.length, 261);
assert.equal(MANUAL_LEVEL_MAX_V127, 1000);
assert.equal(MANUAL_ADVANCE_MAX_V127, 10);

const fakeState = { knownTechniqueIds:['legacy.x'], techniqueMastery:{'legacy.x':100}, activeTechniqueId:'legacy.x', equippedTechniqueIds:{secret:'legacy.x'}, buildFoundation:{ learnedDaoPassiveIdsV118:['passive.legacy'] } };
const runtime = resolveTechniqueRuntimeV119(fakeState, () => ({ id:'legacy.x', contentV119:{ milestones:[{at:1,unlockPassiveIds:['passive.legacy'],modifiers:[{kind:'damageReductionPct',value:99}]}] } }));
assert.deepEqual(runtime.runtime.sourceTechniqueIds, []);
assert.deepEqual(runtime.runtime.modifiers, []);
assert.equal(runtime.staticMaxSpiritPct, 0);
assert.deepEqual(runtime.learnedPassiveIds, []);
assert.deepEqual(elementSealCandidatesV133(fakeState, {id:'skill.x'}, () => ({})), []);
assert.deepEqual(resolveAuthorizedSkillRootBindingsV133(fakeState, () => ({}), () => ({})), {});

const session = await readFile(new URL('../../dist/core/session.js', import.meta.url), 'utf8');
const fight = session.slice(session.indexOf('    fightEndlessFloor(options = {}) {'), session.indexOf('    equipmentCombatImpact(itemId) {'));
for (const token of ['TECHNIQUE_INSIGHT_RESOURCE_ID','techniqueFragmentDrops','daoTechniqueFragment','learnTechniqueManual','battleDaoTechniqueFragmentTargetsV125']) assert.ok(!fight.includes(token), `Hunt legacy Công Pháp token survived: ${token}`);
assert.ok(!session.includes("from './technique-progression-v103.js'"));
assert.ok(session.includes('technique-manuals.v144.retired'));
assert.ok(!session.includes('battleManuals, passives'));

const character = await readFile(new URL('../../dist/core/character.js', import.meta.url), 'utf8');
assert.ok(!character.includes('combineCombat(modifiers, technique.combat'));
assert.ok(!character.includes('combineCombat(techniqueModifiers, technique.combat'));

const gameplay = await readFile(new URL('../../dist/core/gameplay.js', import.meta.url), 'utf8');
for (const token of ['techniqueManuals: this.session.techniqueManualSummary()', 'equipTechniqueManual(techniqueId)', 'studyTechniqueManual(techniqueId', 'elementSealsV133()']) assert.ok(!gameplay.includes(token), `player-facing legacy surface survived: ${token}`);

const api = await readFile(new URL('../../dist/core/game-api.js', import.meta.url), 'utf8');
for (const token of ['getTechniqueManuals()', 'equipTechniqueManual(techniqueId)', 'restoreTechniqueManualV125(techniqueId)', 'getElementSealsV133()']) assert.ok(!api.includes(token), `API legacy surface survived: ${token}`);

const spec = await readFile(new URL('../../dist/core/specialization-skill-progression-v125.js', import.meta.url), 'utf8');
const summaryStart = spec.indexOf('export function v125SpecializationSummary');
assert.ok(summaryStart >= 0);
const summary = spec.slice(summaryStart);
assert.ok(!summary.includes('techniqueFragments: { ...p.techniqueFragments }'));
assert.ok(!summary.includes('restoredTechniqueIds: [...p.restoredTechniqueIds]'));

console.log('V144 V103/V119 technique retirement PASS');
