import fs from 'node:fs';

function read(path) { return fs.readFileSync(path, 'utf8'); }
function write(path, text) { fs.writeFileSync(path, text); }
function exact(text, oldText, newText, label) {
  if (!text.includes(oldText)) throw new Error(`V144 exact patch miss: ${label}`);
  return text.replace(oldText, newText);
}
function regex(text, pattern, replacement, label) {
  pattern.lastIndex = 0;
  if (!pattern.test(text)) throw new Error(`V144 regex patch miss: ${label}`);
  pattern.lastIndex = 0;
  return text.replace(pattern, replacement);
}
function removeImportNames(text, modulePath, names) {
  const pattern = new RegExp(`import \\{([^}]*)\\} from '${modulePath.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}';`);
  const match = text.match(pattern);
  if (!match) throw new Error(`V144 import not found: ${modulePath}`);
  const drop = new Set(names);
  const kept = match[1].split(',').map(x => x.trim()).filter(Boolean).filter(x => !drop.has(x));
  return text.replace(match[0], `import { ${kept.join(', ')} } from '${modulePath}';`);
}

// 1) Central session: retire V103/V119 acquisition, progression and Hunt minting.
{
  const path = 'dist/core/session.js';
  let s = read(path);
  s = exact(s,
    "import { TECHNIQUE_GRADE_ORDER, TECHNIQUE_INSIGHT_RESOURCE_ID, equipManual, learnTechniqueManual, studyTechniqueWithFragments, techniqueMasteryReport, unlockTechniqueGrantedSkills } from './technique-progression-v103.js';\n",
    '', 'session V103 import');
  s = removeImportNames(s, './specialization-skill-progression-v125.js', [
    'addTechniqueFragmentsV125', 'battleDaoTechniqueFragmentTargetsV125', 'restoreTechniqueManualV125', 'techniqueRestoreFragmentRequirementV125'
  ]);
  s = exact(s,
    '// v1.25 compatibility: hydrate raw Thục Luyện / passive levels, grandfather already-known v1.19 Dao manuals as restored, and award missed realm Skill Points once.',
    '// V144 compatibility: preserve migrated raw save fields, but legacy Công Pháp/manual restoration is inert; only V127 manuals are live progression.',
    'session compatibility comment');
  s = regex(s,
    /        for \(const id of this\.stateValue\.character\.knownTechniqueIds\) \{[\s\S]*?        \}\n        retroactiveSkillPointsForRealmV125/,
    '        retroactiveSkillPointsForRealmV125', 'session grandfather restore loop');
  s = exact(s,
    '        let cultivationGain = 0, spiritStones = 0, cultivationPillDrops = 0, injuryPillDropId, injuryPillDropName, techniqueFragmentDrops = 0, daoTechniqueFragmentTechniqueId, daoTechniqueFragmentTechniqueName, daoTechniqueFragmentAmount = 0, learnedTechniqueId, learnedTechniqueName, trueBloodDropId, equipmentDropId, equipmentDropName, jackpotHit = false, jackpotChancePctApplied = 0;',
    '        let cultivationGain = 0, spiritStones = 0, cultivationPillDrops = 0, injuryPillDropId, injuryPillDropName, trueBloodDropId, equipmentDropId, equipmentDropName, jackpotHit = false, jackpotChancePctApplied = 0;',
    'Hunt legacy technique locals');
  s = regex(s,
    /            \/\/ v1\.03 Công Pháp loop:[\s\S]*?            \/\/ v1\.31 Linh Căn:/,
    '            // V144: Hunt no longer mints V103/V119 manual fragments or complete legacy manuals.\n            // V127 Công Pháp progression is owned by the collection/manual economy.\n            // v1.31 Linh Căn:',
    'Hunt V103 reward block');
  s = s.replace(/\$\{techniqueFragmentDrops \? `, Bí Thuật Tàn Trang \+\$\{techniqueFragmentDrops\}` : ''\}\$\{learnedTechniqueName \? `, lĩnh ngộ \$\{learnedTechniqueName\}` : ''\}/g, '');
  s = s.replace(", daoTechniqueFragmentTechniqueId: daoTechniqueFragmentTechniqueId ?? '', daoTechniqueFragmentAmount", '');
  s = regex(s,
    /, \.\.\.\(techniqueFragmentDrops \? \[[^\n]*?\] : learnedTechniqueName \? \[[^\n]*?\] : \[\]\)/,
    '', 'Hunt legacy technique summary');
  s = exact(s,
    ', techniqueFragmentDrops, daoTechniqueFragmentTechniqueId, daoTechniqueFragmentTechniqueName, daoTechniqueFragmentAmount, skillPractice, learnedTechniqueId, learnedTechniqueName, equipmentDropId',
    ', skillPractice, equipmentDropId', 'Hunt legacy technique return fields');

  const retiredBlock = `    legacyTechniqueRetiredV144(action = 'Công Pháp legacy') {\n        throw new Error(\`${'${action}'} đã nghỉ production ở V144. Công Pháp canonical dùng hệ V127 (Lv1000 / 10 lần tiến giai).\`);\n    }\n    learnTechnique() { return this.legacyTechniqueRetiredV144('Học Công Pháp V103/V119'); }\n    useTechnique() { return this.legacyTechniqueRetiredV144('Kích hoạt Tâm Pháp V103/V119'); }\n    equipTechniqueManual() { return this.legacyTechniqueRetiredV144('Trang bị Công Pháp V103/V119'); }\n    studyTechniqueManual() { return this.legacyTechniqueRetiredV144('Tham ngộ mastery V103/V119'); }\n    setTechniqueVariantsV119() { return this.legacyTechniqueRetiredV144('Biến Thức phụ thuộc Công Pháp V119'); }\n    techniqueManualSummary() {\n        return { schema: 'technique-manuals.v144.retired', retired: true, canonicalSchema: 'manual-progression.v127.production', note: 'V103/V119 chỉ còn dữ liệu save tương thích; không tạo sức mạnh, loot hay progression.' };\n    }\n    collectionSummaryV12316`;
  s = regex(s,
    /    learnTechnique\(techniqueId, startingMastery = 0\) \{[\s\S]*?    techniqueManualSummary\(\) \{[\s\S]*?\n    \}\n    collectionSummaryV12316/,
    retiredBlock, 'session legacy manual API block');
  s = regex(s,
    /        const battleManuals = \[\.\.\.this\.registry\.techniques\.values\(\)\][\s\S]*?        \}\)\.sort\(\(a, b\) => a\.requiredRealmOrder - b\.requiredRealmOrder \|\| a\.name\.localeCompare\(b\.name\)\);\n/,
    '', 'V125 battleManuals summary block');
  s = exact(s, ' }, skills, battleManuals, passives };', ' }, skills, passives };', 'V125 summary battleManuals field');
  s = regex(s,
    /    addTechniqueFragmentsV125\(techniqueId, amount\) \{[\s\S]*?    restoreTechniqueManualV125\(techniqueId\) \{[\s\S]*? return result; \}\n/,
    '', 'V125 fragment/restore public methods');
  s = regex(s,
    /    upgradeDaoPassiveV125\(passiveId, sourceTechniqueId\) \{[^\n]*\}\n/,
    "    upgradeDaoPassiveV125() { return this.legacyTechniqueRetiredV144('Nâng Bị Động qua Công Pháp legacy'); }\n",
    'legacy passive-upgrade route');
  write(path, s);
}

// 2) Character combat + stat provenance: old manuals are inert save data, never a stat source.
{
  const path = 'dist/core/character.js';
  let s = read(path);
  s = regex(s,
    /    const technique = registry\.technique\(state\.activeTechniqueId\);\n    const modifiers = \{\};[\s\S]*?    combineCombat\(modifiers, \{ maxSpiritMultiplier: 1 \+ techniqueRuntimeV119\.staticMaxSpiritPct \/ 100, actionSpeedMultiplier: 1 \+ techniqueRuntimeV119\.staticActionSpeedPct \/ 100 \}\);/,
    `    const modifiers = {};\n    const tags = new Set(entity.tags);\n    const triggers = [...(entity.triggers ?? [])];\n    for (const tag of root.tags)\n        tags.add(tag);\n    if (!suppressLegacyBirthOrigins)\n        combineCombat(modifiers, root.combat);\n    // V144: V103/V119 manual combat packages are retired. Keep only a neutral runtime object\n    // because CombatKernel modules still import the compatibility helper surface.\n    const techniqueRuntimeV119 = resolveTechniqueRuntimeV119(state, id => registry.technique(id));`,
    'character live legacy manual combat block');
  s = exact(s, '    const technique = registry.technique(state.activeTechniqueId);\n\n    // Linh Căn bẩm sinh', '    // Linh Căn bẩm sinh', 'character provenance technique lookup');
  s = regex(s,
    /    \/\/ Bí Thuật & Võ Học: active \+ equipped secondary manuals \+ their static runtime package\.[\s\S]*?    push\('character\.techniques', 'Bí Thuật & Võ Học · chỉ số nền', techniqueStats, \{ sourceIds: equippedIds \}\);/,
    `    // V144: legacy manual stats remain visible only as a zero-delta provenance marker for migrated saves.\n    const techniqueRuntimeV119 = resolveTechniqueRuntimeV119(state, id => registry.technique(id));\n    push('character.techniques', 'Công Pháp legacy V103/V119 · đã nghỉ', current.stats, { retired: true });`,
    'character provenance legacy manual stage');
  s = exact(s,
    "    push('character.technique_runtime', 'Bí Thuật & Võ Học · hiệu ứng tĩnh', techniqueRuntimeStats, {",
    "    push('character.technique_runtime', 'Runtime Công Pháp legacy · trung tính', techniqueRuntimeStats, { retired: true,",
    'character runtime provenance label');
  write(path, s);
}

// 3) Combat compatibility boundary: preserve exported helper API but return an empty manual runtime.
{
  const path = 'dist/core/technique-runtime-v119.js';
  let s = read(path);
  s = regex(s,
    /export function resolveTechniqueRuntimeV119\(state, lookup\) \{[\s\S]*?\n\}\nfunction effectiveRoot/,
    `/** V144 compatibility shim. V103/V119 manual state is migrated but no longer owns live combat. */\nexport function resolveTechniqueRuntimeV119(_state, _lookup) {\n    return {\n        runtime: { sourceTechniqueIds: [], masteryByTechniqueId: {}, modifiers: [], rules: [] },\n        fixedRootBindings: {},\n        staticMaxSpiritPct: 0, staticDodgeFlatPct: 0, staticActionSpeedPct: 0, staticSpiritRegenPct: 0,\n        learnedPassiveIds: [], unlockedVariantIds: [], trueMeaningIds: [],\n    };\n}\nfunction effectiveRoot`,
    'neutralize V119 runtime resolver');
  write(path, s);
}

// 4) Hành Ấn: retire manual-selected roots, but preserve authored primary-root elemental coefficients.
{
  const path = 'dist/core/element-seal-v133.js';
  write(path, `import { skillRuntimeV117, skillSlotClassV117 } from './skill-runtime-v117.js';\nexport const ELEMENT_SEAL_SCHEMA_V133 = 'element-seal.v133';\nexport const ELEMENT_SEAL_MIN_TECHNIQUE_MASTERY_V133 = 20;\nconst ROOT_ELEMENT_V133 = { metal: 'Metal', wood: 'Wood', water: 'Water', fire: 'Fire', earth: 'Earth' };\n\n/** V144: manual-driven Hành Ấn retired with V103/V119. */\nexport function elementSealCandidatesV133(_state, _skill, _lookupTechnique) { return []; }\nexport function resolveAuthorizedSkillRootBindingsV133(_state, _lookupTechnique, _lookupSkill) { return {}; }\nexport function setSkillElementSealV133(_state, foundation, skillId, _root, _lookupTechnique, _lookupSkill) {\n    if (foundation?.skillRootBindingsV133) delete foundation.skillRootBindingsV133[skillId];\n    throw new Error('Hành Ấn từ Công Pháp V119 đã nghỉ production ở V144.');\n}\nexport function elementSealSummaryV133(_state, _lookupTechnique, _lookupSkill) {\n    return { schema: ELEMENT_SEAL_SCHEMA_V133, retired: true, skills: [], canonicalManualSchema: 'manual-progression.v127.production' };\n}\n/**\n * Preserve authored elemental skill identity. Dynamic roots formerly injected by V119 manuals are ignored.\n */\nexport function elementSealDamageCoefficientV133(_entity, skill) {\n    const root = skillRuntimeV117(skill).primaryRoot;\n    if (!root) return undefined;\n    const role = skill.daoRuntimeV118?.elementRole;\n    if (!role) return undefined;\n    const slot = skillSlotClassV117(skill);\n    let coefficient = role === 'generate' ? .12 : role === 'defense' ? .08 : role === 'spend' ? .20 : .28;\n    if (slot === 'ultimate') coefficient += .10;\n    if (skillRuntimeV117(skill).form === 'finisher' && role !== 'generate') coefficient += .04;\n    return { element: ROOT_ELEMENT_V133[root], coefficient };\n}\n`);
}

// 5) Dungeon combat no longer advances dead 0..100 technique mastery.
{
  const path = 'dist/core/session-dungeon.js';
  let s = read(path);
  s = exact(s, "import { applyCharacterToEntity, gainTechniqueMastery } from './character.js';", "import { applyCharacterToEntity } from './character.js';", 'dungeon mastery import');
  s = exact(s,
    "import { applyReincarnationArtifactTalents, applyReincarnationCombatTalents, dungeonPhaseInsightStudyYears, techniqueMasteryGainMultiplier, techniquePassiveStrengthMultiplier } from './reincarnation-talents.js';",
    "import { applyReincarnationArtifactTalents, applyReincarnationCombatTalents, techniquePassiveStrengthMultiplier } from './reincarnation-talents.js';",
    'dungeon technique talent imports');
  s = regex(s,
    /            \/\/ A prepared boss attempt should teach something even when it fails\.[\s\S]*?            battleInsightGain = gainTechniqueMastery\([^\n]*\);\n/,
    '            // V144: defeat never advances retired V103/V119 technique mastery.\n',
    'dungeon defeat mastery grant');
  s = regex(s,
    /        const phaseStudyYears = dungeonPhaseInsightStudyYears[\s\S]*?        \}\n        const equipmentFragmentText/,
    '        // V144: phase reading still feeds combat review/skill practice elsewhere; legacy manual mastery is inert.\n        const equipmentFragmentText',
    'dungeon phase/secondary mastery grants');
  write(path, s);
}

// 6) Remove old manual/Hành Ấn surfaces from gameplay snapshots/actions.
{
  const path = 'dist/core/gameplay.js';
  let s = read(path);
  s = regex(s, /        if \(report\.phaseTransitions\.length > 0 && report\.battleInsightGain > 0\)\n            lessons\.push\(`Đọc phase mang lại \$\{report\.battleInsightGain\.toFixed\(2\)\} mastery quy đổi\.`\);\n/, '', 'combat review legacy mastery copy');
  s = regex(s,
    /    characterSkillsV129\(\) \{[\s\S]*?\n    \}\n    characterCultivationV140/,
    "    characterSkillsV129() { return { schema: 'character-skills.v144', knownSkills: this.clientKnownSkillsV129() }; }\n    characterCultivationV140",
    'character skills old manual summary');
  s = exact(s, '        const activeTechnique = this.registry.technique(state.character.activeTechniqueId);\n', '', 'character active legacy technique lookup');
  s = regex(s, /            activeTechniqueDetail: \{[^\n]*\},\n/, '', 'character activeTechniqueDetail field');
  s = regex(s, /            knownTechniques: state\.character\.knownTechniqueIds\.map\([^\n]*\),\n/, '', 'character knownTechniques field');
  s = exact(s, '            techniqueManuals: this.session.techniqueManualSummary(),\n', '', 'character techniqueManuals field');
  s = regex(s,
    /\n    equipTechniqueManual\(techniqueId\) \{[^\n]*\}\n    studyTechniqueManual\(techniqueId, batches = 1\) \{[^\n]*\}\n    setTechniqueVariantsV119\(variantIds\) \{[^\n]*\}\n    techniqueManuals\(\) \{[^\n]*\}\n/,
    '\n', 'gameplay old manual actions');
  s = regex(s, /    restoreTechniqueManualV125\(techniqueId\) \{[^\n]*\}\n/, '', 'gameplay restore legacy manual');
  s = regex(s, /    upgradeDaoPassiveV125\(passiveId, sourceTechniqueId\) \{[^\n]*\}\n/, '', 'gameplay legacy passive upgrade');
  s = regex(s, /    elementSealsV133\(\) \{[^\n]*\}\n    setSkillElementSealV133\(skillId, root\) \{[^\n]*\}\n/, '', 'gameplay element seal actions');
  write(path, s);
}

// 7) Remove obsolete application API methods; V127 manual gacha APIs remain untouched.
{
  const path = 'dist/core/game-api.js';
  let s = read(path);
  for (const pattern of [
    /    equipTechniqueManual\(techniqueId\) \{[^\n]*\}\n/,
    /    studyTechniqueManual\(techniqueId, batches = 1\) \{[^\n]*\}\n/,
    /    setTechniqueVariantsV119\(variantIds\) \{[^\n]*\}\n/,
    /    getTechniqueManuals\(\) \{[^\n]*\}\n/,
    /    restoreTechniqueManualV125\(techniqueId\) \{[^\n]*\}\n/,
    /    upgradeDaoPassiveV125\(passiveId, sourceTechniqueId\) \{[^\n]*\}\n/,
    /    getElementSealsV133\(\) \{[^\n]*\}\n/,
    /    setSkillElementSealV133\(skillId, root\) \{[^\n]*\}\n/,
  ]) s = regex(s, pattern, '', `game-api ${pattern}`);
  write(path, s);
}

// 8) V125 public summary must not expose dead manual fragment/restoration wallets.
{
  const path = 'dist/core/specialization-skill-progression-v125.js';
  let s = read(path);
  s = exact(s,
    ', techniqueFragments: { ...p.techniqueFragments }, restoredTechniqueIds: [...p.restoredTechniqueIds]',
    '', 'V125 summary dead manual wallets');
  write(path, s);
}

// 9) Tighten Hunt authority regression now that the old Công Pháp lane is retired.
{
  const path = 'qa/tests/v143-hunt-reward-authority-test.js';
  let s = read(path);
  s = exact(s,
    "  'bloodlineProtectionDrops',\n]) {",
    "  'bloodlineProtectionDrops',\n  'TECHNIQUE_INSIGHT_RESOURCE_ID',\n  'techniqueFragmentDrops',\n  'daoTechniqueFragment',\n  'learnTechniqueManual',\n  'battleDaoTechniqueFragmentTargetsV125',\n]) {",
    'V143 forbidden technique Hunt tokens');
  s = exact(s,
    "  'trueBloodResourceId',\n  'TECHNIQUE_INSIGHT_RESOURCE_ID',\n  'rootQualityMaterialDropsFromHuntV131',",
    "  'trueBloodResourceId',\n  'rootQualityMaterialDropsFromHuntV131',",
    'V143 intentional technique lane removal');
  write(path, s);
}

// 10) New V144 closure gate.
fs.writeFileSync('qa/tests/v144-technique-v103-retirement-test.js', `import assert from 'node:assert/strict';\nimport { access, readFile } from 'node:fs/promises';\nimport { resolveTechniqueRuntimeV119 } from '../../dist/core/technique-runtime-v119.js';\nimport { elementSealCandidatesV133, resolveAuthorizedSkillRootBindingsV133 } from '../../dist/core/element-seal-v133.js';\nimport { buildManualCatalogV127, MANUAL_LEVEL_MAX_V127, MANUAL_ADVANCE_MAX_V127 } from '../../dist/core/manual-progression-v127.js';\n\nawait assert.rejects(access(new URL('../../dist/core/technique-progression-v103.js', import.meta.url)), 'V103 progression module must be physically retired');\nconst manuals = buildManualCatalogV127();\nassert.equal(manuals.length, 261);\nassert.equal(MANUAL_LEVEL_MAX_V127, 1000);\nassert.equal(MANUAL_ADVANCE_MAX_V127, 10);\n\nconst fakeState = { knownTechniqueIds:['legacy.x'], techniqueMastery:{'legacy.x':100}, activeTechniqueId:'legacy.x', equippedTechniqueIds:{secret:'legacy.x'}, buildFoundation:{ learnedDaoPassiveIdsV118:['passive.legacy'] } };\nconst runtime = resolveTechniqueRuntimeV119(fakeState, () => ({ id:'legacy.x', contentV119:{ milestones:[{at:1,unlockPassiveIds:['passive.legacy'],modifiers:[{kind:'damageReductionPct',value:99}]}] } }));\nassert.deepEqual(runtime.runtime.sourceTechniqueIds, []);\nassert.deepEqual(runtime.runtime.modifiers, []);\nassert.equal(runtime.staticMaxSpiritPct, 0);\nassert.deepEqual(runtime.learnedPassiveIds, []);\nassert.deepEqual(elementSealCandidatesV133(fakeState, {id:'skill.x'}, () => ({})), []);\nassert.deepEqual(resolveAuthorizedSkillRootBindingsV133(fakeState, () => ({}), () => ({})), {});\n\nconst session = await readFile(new URL('../../dist/core/session.js', import.meta.url), 'utf8');\nconst fight = session.slice(session.indexOf('    fightEndlessFloor(options = {}) {'), session.indexOf('    equipmentCombatImpact(itemId) {'));
for (const token of ['TECHNIQUE_INSIGHT_RESOURCE_ID','techniqueFragmentDrops','daoTechniqueFragment','learnTechniqueManual','battleDaoTechniqueFragmentTargetsV125']) assert.ok(!fight.includes(token), \`Hunt legacy Công Pháp token survived: \${token}\`);\nassert.ok(!session.includes("from './technique-progression-v103.js'"));\nassert.ok(session.includes('technique-manuals.v144.retired'));\nassert.ok(!session.includes('battleManuals, passives'));\n\nconst character = await readFile(new URL('../../dist/core/character.js', import.meta.url), 'utf8');\nassert.ok(!character.includes('combineCombat(modifiers, technique.combat'));
assert.ok(!character.includes('combineCombat(techniqueModifiers, technique.combat'));
\nconst gameplay = await readFile(new URL('../../dist/core/gameplay.js', import.meta.url), 'utf8');\nfor (const token of ['techniqueManuals: this.session.techniqueManualSummary()', 'equipTechniqueManual(techniqueId)', 'studyTechniqueManual(techniqueId', 'elementSealsV133()']) assert.ok(!gameplay.includes(token), \`player-facing legacy surface survived: \${token}\`);\n\nconst api = await readFile(new URL('../../dist/core/game-api.js', import.meta.url), 'utf8');\nfor (const token of ['getTechniqueManuals()', 'equipTechniqueManual(techniqueId)', 'restoreTechniqueManualV125(techniqueId)', 'getElementSealsV133()']) assert.ok(!api.includes(token), \`API legacy surface survived: \${token}\`);\n\nconst spec = await readFile(new URL('../../dist/core/specialization-skill-progression-v125.js', import.meta.url), 'utf8');\nconst summaryStart = spec.indexOf('export function v125SpecializationSummary');\nassert.ok(summaryStart >= 0);\nconst summary = spec.slice(summaryStart);\nassert.ok(!summary.includes('techniqueFragments: { ...p.techniqueFragments }'));
assert.ok(!summary.includes('restoredTechniqueIds: [...p.restoredTechniqueIds]'));
\nconsole.log('V144 V103/V119 technique retirement PASS');\n`);

// Add the new test to the focused Equipment x Hunt runner, which is already canonical V140 CI.
{
  const path = 'qa/runners/v142-equipment-hunt-gate.js';
  let s = read(path);
  s = exact(s,
    "  'qa/tests/v143-equipment-set-resonance-test.js',\n];",
    "  'qa/tests/v143-equipment-set-resonance-test.js',\n  'qa/tests/v144-technique-v103-retirement-test.js',\n];",
    'V144 gate registration');
  write(path, s);
}

// 11) Physical cleanup: V103 progression + stale source map and all temporary V144 tooling/workflows.
for (const path of [
  'dist/core/technique-progression-v103.js',
  'dist/core/technique-progression-v103.js.map',
  '.github/workflows/v144-technique-audit.yml',
  '.github/workflows/v144-technique-retirement.yml',
  'qa/tools/apply-v144-technique-retirement.mjs',
]) if (fs.existsSync(path)) fs.rmSync(path);

// Final source authority checks before Actions executes the full canonical suite.
const sessionFinal = read('dist/core/session.js');
if (sessionFinal.includes('technique-progression-v103') || sessionFinal.includes('TECHNIQUE_INSIGHT_RESOURCE_ID')) throw new Error('V144 session still references V103');
const gameplayFinal = read('dist/core/gameplay.js');
if (gameplayFinal.includes('techniqueManuals: this.session.techniqueManualSummary()')) throw new Error('V144 gameplay still exposes legacy manuals');
console.log('V144 technique retirement source patch applied');
