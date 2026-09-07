import { readFile, writeFile } from 'node:fs/promises';

const ROOTS = ['metal', 'wood', 'water', 'fire', 'earth'];

async function read(path) { return readFile(path, 'utf8'); }
async function write(path, content) { await writeFile(path, content, 'utf8'); }

function replaceOnce(source, from, to, label) {
  const first = source.indexOf(from);
  if (first < 0) throw new Error(`V145 patch missing ${label}`);
  const second = source.indexOf(from, first + from.length);
  if (second >= 0) throw new Error(`V145 patch ambiguous ${label}`);
  return source.slice(0, first) + to + source.slice(first + from.length);
}

function replaceAllCount(source, from, to, expected, label) {
  let count = 0;
  let cursor = 0;
  let out = '';
  while (true) {
    const i = source.indexOf(from, cursor);
    if (i < 0) break;
    out += source.slice(cursor, i) + to;
    cursor = i + from.length;
    count++;
  }
  out += source.slice(cursor);
  if (count !== expected) throw new Error(`V145 patch ${label}: expected ${expected}, got ${count}`);
  return out;
}

function replaceRegexOnce(source, regex, to, label) {
  const matches = [...source.matchAll(new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g'))];
  if (matches.length !== 1) throw new Error(`V145 patch ${label}: expected 1, got ${matches.length}`);
  return source.replace(regex, to);
}

const canonicalModule = `import { skillRuntimeV117, skillSlotClassV117 } from './skill-runtime-v117.js';

export const SPIRITUAL_ROOT_COMBAT_SCHEMA_V145 = 'spiritual-root-combat.v145';
export const ROOT_COMBAT_EFFECTIVENESS_CAP_PCT_V145 = 450;
export const ROOT_ELEMENT_V145 = Object.freeze({
    metal: 'Metal', wood: 'Wood', water: 'Water', fire: 'Fire', earth: 'Earth',
});

/** V145: elemental skill identity is authored content only. Save/runtime root-binding maps are compatibility data, never authority. */
export function authoredSkillRootV145(skill) {
    const root = skillRuntimeV117(skill).primaryRoot;
    return root && ROOT_ELEMENT_V145[root] ? root : undefined;
}

/** Lv1000 base effectiveness 150% × Đạo Chất 3 = 450%; hard cap prevents malformed save amplification. */
export function rootCombatEffectivenessPctV145(levelEffectivenessPct, qualityMultiplier) {
    const levelPct = Math.max(0, Number(levelEffectivenessPct) || 0);
    const quality = Math.max(1, Number(qualityMultiplier) || 1);
    return Math.min(ROOT_COMBAT_EFFECTIVENESS_CAP_PCT_V145, levelPct * quality);
}

/** Shared authored-root elemental coefficient consumed by CombatKernel and lightweight Hunt parity resolver. */
export function rootElementDamageCoefficientV145(skill) {
    const root = authoredSkillRootV145(skill);
    if (!root) return undefined;
    const role = skill.daoRuntimeV118?.elementRole;
    if (!role) return undefined;
    const slot = skillSlotClassV117(skill);
    let coefficient = role === 'generate' ? .12 : role === 'defense' ? .08 : role === 'spend' ? .20 : .28;
    if (slot === 'ultimate') coefficient += .10;
    if (skillRuntimeV117(skill).form === 'finisher' && role !== 'generate') coefficient += .04;
    return { root, element: ROOT_ELEMENT_V145[root], coefficient };
}
`;
await write('dist/core/spiritual-root-combat-v145.js', canonicalModule);

const elementSealTombstone = `export const ELEMENT_SEAL_SCHEMA_V133 = 'element-seal.v133';
export const ELEMENT_SEAL_MIN_TECHNIQUE_MASTERY_V133 = 20;

/** V145 compatibility tombstone. Manual-driven Hành Ấn was retired in V144 and has no live combat consumer. */
export function elementSealCandidatesV133(_state, _skill, _lookupTechnique) { return []; }
export function resolveAuthorizedSkillRootBindingsV133(_state, _lookupTechnique, _lookupSkill) { return {}; }
export function setSkillElementSealV133(_state, foundation, skillId, _root, _lookupTechnique, _lookupSkill) {
    if (foundation?.skillRootBindingsV133) delete foundation.skillRootBindingsV133[skillId];
    throw new Error('Hành Ấn từ Công Pháp V119 đã nghỉ production ở V144.');
}
export function elementSealSummaryV133(_state, _lookupTechnique, _lookupSkill) {
    return { schema: ELEMENT_SEAL_SCHEMA_V133, retired: true, skills: [], canonicalRootAuthority: 'spiritual-root-combat.v145', canonicalManualSchema: 'manual-progression.v127.production' };
}
`;
await write('dist/core/element-seal-v133.js', elementSealTombstone);

{
  const path = 'dist/core/spiritual-root-milestones-v133.js';
  let s = await read(path);
  s = replaceAllCount(s, "skillRuntimeV117(skill).primaryRoot ?? entity.combatBuildV117?.skillRootBindingsV118?.[skill.id]", "skillRuntimeV117(skill).primaryRoot", 4, 'milestone authored root authority');
  await write(path, s);
}

{
  const path = 'dist/core/root-origin-combat-v132.js';
  let s = await read(path);
  s = replaceOnce(s, "function skillRootV132(entity, skill) { return skillRuntimeV117(skill).primaryRoot ?? entity.combatBuildV117?.skillRootBindingsV118?.[skill.id]; }", "function skillRootV132(_entity, skill) { return skillRuntimeV117(skill).primaryRoot; }", 'Căn Nguyên authored root authority');
  await write(path, s);
}

{
  const path = 'dist/core/battle-dao-combat-v118.js';
  let s = await read(path);
  s = replaceOnce(s, "export function effectiveSkillRootV118(entity, skill) {\n    return skill.runtimeV117?.primaryRoot ?? entity.combatBuildV117?.skillRootBindingsV118?.[skill.id];\n}", "export function effectiveSkillRootV118(_entity, skill) {\n    return skillRuntimeV117(skill).primaryRoot;\n}", 'Bản Đạo authored root authority');
  await write(path, s);
}

{
  const path = 'dist/core/combat.js';
  let s = await read(path);
  s = replaceOnce(s, "import { elementSealDamageCoefficientV133 } from './element-seal-v133.js';", "import { rootElementDamageCoefficientV145 } from './spiritual-root-combat-v145.js';", 'CombatKernel import');
  s = replaceAllCount(s, 'elementSealDamageCoefficientV133(source, skill)', 'rootElementDamageCoefficientV145(skill)', 1, 'CombatKernel coefficient call');
  const oldBudgetCount = (s.match(/elementSealBudgetUsedV133/g) || []).length;
  if (oldBudgetCount < 1) throw new Error('V145 patch CombatKernel budget flag missing');
  s = s.replaceAll('elementSealBudgetUsedV133', 'rootElementBudgetUsedV145');
  if (/elementSeal/i.test(s)) throw new Error('V145 CombatKernel still references Element Seal');
  await write(path, s);
}

{
  const path = 'dist/core/hunt-real-combat-v130.js';
  let s = await read(path);
  s = replaceOnce(s, "import { elementSealDamageCoefficientV133 } from './element-seal-v133.js';", "import { rootElementDamageCoefficientV145 } from './spiritual-root-combat-v145.js';", 'Hunt parity import');
  const callRegex = /elementSealDamageCoefficientV133\([^,]+,\s*skill\)/g;
  const calls = [...s.matchAll(callRegex)].length;
  if (calls !== 1) throw new Error(`V145 Hunt coefficient call expected 1, got ${calls}`);
  s = s.replace(callRegex, 'rootElementDamageCoefficientV145(skill)');
  if (/elementSeal/i.test(s)) throw new Error('V145 Hunt resolver still references Element Seal');
  await write(path, s);
}

{
  const path = 'dist/core/character.js';
  let s = await read(path);
  s = replaceOnce(s, "import { resolveAuthorizedSkillRootBindingsV133 } from './element-seal-v133.js';\n", '', 'character retired Element Seal import');
  const anchor = "import { createBuildFoundationV113, elementQualityMultiplier, rootEffectivenessPct } from './build-foundation-v113.js';\n";
  if (!s.includes("./spiritual-root-combat-v145.js")) s = replaceOnce(s, anchor, anchor + "import { rootCombatEffectivenessPctV145 } from './spiritual-root-combat-v145.js';\n", 'character V145 import');
  s = replaceOnce(s, "    const authorizedRootBindingsV133 = resolveAuthorizedSkillRootBindingsV133(state, id => registry.technique(id), id => registry.skill(id));\n", '', 'character retired binding resolution');
  s = replaceRegexOnce(s, /        rootEffectivenessPct: \{\n            metal: rootEffectivenessPct\(foundation\.roots\.metal\.level\), wood: rootEffectivenessPct\(foundation\.roots\.wood\.level\), water: rootEffectivenessPct\(foundation\.roots\.water\.level\), fire: rootEffectivenessPct\(foundation\.roots\.fire\.level\), earth: rootEffectivenessPct\(foundation\.roots\.earth\.level\),\n        \},/, `        rootEffectivenessPct: {
            metal: rootCombatEffectivenessPctV145(rootEffectivenessPct(foundation.roots.metal.level), elementQualityMultiplier(foundation.elementQuality.Metal)),
            wood: rootCombatEffectivenessPctV145(rootEffectivenessPct(foundation.roots.wood.level), elementQualityMultiplier(foundation.elementQuality.Wood)),
            water: rootCombatEffectivenessPctV145(rootEffectivenessPct(foundation.roots.water.level), elementQualityMultiplier(foundation.elementQuality.Water)),
            fire: rootCombatEffectivenessPctV145(rootEffectivenessPct(foundation.roots.fire.level), elementQualityMultiplier(foundation.elementQuality.Fire)),
            earth: rootCombatEffectivenessPctV145(rootEffectivenessPct(foundation.roots.earth.level), elementQualityMultiplier(foundation.elementQuality.Earth)),
        },`, 'quality-aware root effectiveness projection');
  s = replaceRegexOnce(s, /        skillRootBindingsV118: \{ \.\.\.\(entity\.combatBuildV117\?\.skillRootBindingsV118 \?\? \{\}\), \.\.\.authorizedRootBindingsV133, \.\.\.techniqueRuntimeV119\.fixedRootBindings \},/, "        // V145: legacy root-binding save data may survive migration, but elemental identity is authored primaryRoot only.\n        skillRootBindingsV118: {},", 'runtime legacy binding neutralization');
  if (s.includes('resolveAuthorizedSkillRootBindingsV133')) throw new Error('V145 character still resolves legacy Hành Ấn');
  await write(path, s);
}

{
  const path = 'dist/core/spiritual-root-progression-v131.js';
  let s = await read(path);
  const oldRule = 'Linh Căn không tự biến mọi kỹ năng thành một Hành. Hành của kỹ năng chỉ có khi Công Pháp/Hành Ấn cho phép; Set Ngũ Hành và Căn Nguyên sau đó mới khuếch đại đúng package.';
  const newRule = 'Hành của kỹ năng chỉ lấy từ primaryRoot được authored trong content; Linh Căn, Căn Nguyên và Set Ngũ Hành khuếch đại đúng package đó, không có đường gắn Hành động từ Công Pháp.';
  s = replaceOnce(s, oldRule, newRule, 'player-facing combat rule');
  await write(path, s);
}

{
  const path = 'dist/core/session.js';
  let s = await read(path);
  s = replaceRegexOnce(s, /import \{ elementSealSummaryV133, setSkillElementSealV133 as setSkillElementSealStateV133 \} from '\.\/element-seal-v133\.js';\n/, '', 'session retired Element Seal import');
  s = replaceRegexOnce(s, /\n    elementSealSummaryV133\(\) \{[\s\S]*?\n    commitSpecializationV125/, '\n    commitSpecializationV125', 'session retired Element Seal methods');
  if (/elementSeal/i.test(s)) throw new Error('V145 session still exposes Element Seal');
  await write(path, s);
}

{
  const path = 'dist/core/client-shell.js';
  let s = await read(path);
  s = replaceOnce(s, "roots: (api) => ({ character: api.getCharacterRootV129(), spiritualRoots: api.getSpiritualRootsV131(), elementSeals: api.getElementSealsV133() }),", "roots: (api) => ({ character: api.getCharacterRootV129(), spiritualRoots: api.getSpiritualRootsV131() }),", 'client roots snapshot');
  const devCount = (s.match(/elementSeals: api\.getElementSealsV133\(\),?/g) || []).length;
  if (devCount < 1) throw new Error('V145 client dev snapshot Element Seal field missing');
  s = s.replace(/\s*elementSeals: api\.getElementSealsV133\(\),?/g, '');
  if (s.includes('getElementSealsV133')) throw new Error('V145 client shell still calls retired API');
  await write(path, s);
}

{
  const path = 'standalone-runtime.js';
  let s = await read(path);
  s = replaceRegexOnce(s, /^\s*case 'elementSealV133':[^\n]*\n/m, '', 'standalone retired action');
  if (s.includes('elementSealV133')) throw new Error('V145 standalone runtime still exposes retired action');
  await write(path, s);
}

{
  const path = 'app.js';
  let s = await read(path);
  s = replaceRegexOnce(s, /\nfunction v2314SealSheet\(seal\)\{[^\n]*\}\n/, '\n', 'frontend Hành Ấn sheet');
  s = replaceOnce(s, "const sr=model.spiritualRoots||{},roots=sr.roots||[],seals=(model.elementSeals?.skills||[]),focus=", "const sr=model.spiritualRoots||{},roots=sr.roots||[],focus=", 'frontend retired seal model');
  s = replaceRegexOnce(s, /const sealRows=seals\.filter\([^;]+;const birthCard=/, 'const birthCard=', 'frontend retired seal rows');
  s = replaceOnce(s, '<small>Lv${num(nextQ.minLevel)} · ${num(nextQ.materialHave)}/${num(nextQ.materialCount)} vật liệu</small>', '<small>Lv${num(nextQ.minLevel)} · ${num(nextQ.materialHave)}/${num(nextQ.materialCount)} vật liệu · Nguồn: Săn Yêu quái ${esc(meta.label)} Hành đúng phẩm cấp</small>', 'frontend material source hint');
  s = replaceOnce(s, '<section class=\"v2314-section\"><header><div><small>CẦU NỐI COMBAT</small><strong>Hành Ấn kỹ năng</strong></div><button data-tab-jump=\"skills\">Kỹ Năng ›</button></header><p class=\"v2314-rule\">${esc(sr.combatRule||\'\')}</p><div class=\"v2314-seal-list\">${sealRows||\'<div class=\"v2314-empty\">Chưa có kỹ năng/Công Pháp đủ điều kiện Hành Ấn. Kỹ năng Vô Hành vẫn hoạt động bình thường.</div>\'}</div></section>', '<section class=\"v2314-section\"><header><div><small>CẦU NỐI COMBAT</small><strong>Ngũ Hành authored</strong></div><button data-tab-jump=\"skills\">Kỹ Năng ›</button></header><p class=\"v2314-rule\">${esc(sr.combatRule||\'\')}</p><div class=\"v2314-seal-list\"><div class=\"v2314-rule\"><b>primaryRoot là authority duy nhất.</b> Kỹ năng có Kim/Mộc/Thủy/Hỏa/Thổ theo content authored; Linh Căn, Căn Nguyên và Set chỉ khuếch đại đúng package đó.</div></div></section>', 'frontend combat bridge');
  s = replaceRegexOnce(s, /\$\{seals\.map\(\(x,i\)=>v106Sheet\(`seal-\$\{i\}`,[\s\S]*?\)\)\.join\('\'\)\}/, '', 'frontend retired seal sheets');
  s = replaceOnce(s, '<article><b>4 · Hành Ấn</b><span>Kỹ năng Bản Đạo mặc định có thể Vô Hành. Công Pháp đủ mastery mới cấp hoặc khóa Hành Ấn; sau đó Linh Căn/Set mới khuếch đại package đó.</span></article>', '<article><b>4 · Hành kỹ năng</b><span>primaryRoot được authored trực tiếp trong content; không còn gắn/gỡ Hành từ Công Pháp.</span></article>', 'frontend rules');
  s = replaceRegexOnce(s, /^\s*qsaV129\('\[data-element-seal\]'\)[^\n]*\n/m, '', 'frontend retired action handler');
  for (const token of ['data-element-seal', 'elementSealV133', 'Hành Ấn kỹ năng', 'sealRows', 'v2314SealSheet', 'model.elementSeals', 'seals.map']) {
    if (s.includes(token)) throw new Error(`V145 frontend still contains retired token: ${token}`);
  }
  await write(path, s);
}

{
  const path = '.github/workflows/v140-ci.yml';
  let s = await read(path);
  if (!s.includes('v145-spiritual-root-closure-test.js')) {
    s = replaceRegexOnce(s, /(\s+- name: V142[^\n]*\n\s+run: node qa\/runners\/v142-equipment-hunt-gate\.js\n)/, `$1
      - name: V145 Linh Can x Ngu Hanh closure
        run: node qa/tests/v145-spiritual-root-closure-test.js
`, 'canonical V145 QA step');
  }
  await write(path, s);
}

const test = `import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { FIVE_ELEMENT_ROOT_IDS, ROOT_ORIGIN_IDS_V113, createBuildFoundationV113, cloneBuildFoundationV113, elementQualityMultiplier, rootEffectivenessPct } from '../../dist/core/build-foundation-v113.js';
import { ROOT_ELEMENT_V131, breakthroughRootQualityV131, nextRootQualityBreakthroughV131, rootQualityMaterialDropsFromHuntV131, rollTargetRootOriginV131, setRootOriginTargetV131 } from '../../dist/core/spiritual-root-progression-v131.js';
import { ROOT_COMBAT_EFFECTIVENESS_CAP_PCT_V145, authoredSkillRootV145, rootCombatEffectivenessPctV145, rootElementDamageCoefficientV145 } from '../../dist/core/spiritual-root-combat-v145.js';
import { rootGenerateMultiplierV117, rootPayoffMultiplierV117 } from '../../dist/core/five-element-combat-v117.js';
import { rootMilestoneHuntSkillTuningV133 } from '../../dist/core/spiritual-root-milestones-v133.js';
import { rootOriginHuntSkillTuningV132 } from '../../dist/core/root-origin-combat-v132.js';
import { effectiveSkillRootV118 } from '../../dist/core/battle-dao-combat-v118.js';
import { EQUIPMENT_SET_CATALOG_V116 } from '../../dist/core/equipment-set-v116.js';
import { boundedStatCapV129 } from '../../dist/core/combat-rules.js';
import { elementSealCandidatesV133, resolveAuthorizedSkillRootBindingsV133 } from '../../dist/core/element-seal-v133.js';

assert.deepEqual(FIVE_ELEMENT_ROOT_IDS, ['metal', 'wood', 'water', 'fire', 'earth']);

const qualityCases = [
  { from: 'common', to: 'spirit', level: 200, grade: 'enhanced' },
  { from: 'spirit', to: 'true', level: 500, grade: 'elite' },
  { from: 'true', to: 'dao', level: 800, grade: 'boss' },
];
for (const root of FIVE_ELEMENT_ROOT_IDS) {
  for (const c of qualityCases) {
    const f = createBuildFoundationV113();
    const element = ROOT_ELEMENT_V131[root];
    f.roots[root].level = c.level;
    f.elementQuality[element] = c.from;
    const next = nextRootQualityBreakthroughV131(f, root);
    assert.equal(next?.to, c.to, root + ' quality target');
    const drops = rootQualityMaterialDropsFromHuntV131(f, [element], c.grade, () => 0);
    assert.ok(drops.some(x => x.resourceId === next.materialId && x.amount > 0), root + ' ' + c.to + ' must have Hunt source');
    assert.equal(rootQualityMaterialDropsFromHuntV131(f, [element === 'Metal' ? 'Water' : 'Metal'], c.grade, () => 0).some(x => x.resourceId === next.materialId), false, 'wrong element must not mint target material');
    const inventory = { [next.materialId]: next.materialCount };
    breakthroughRootQualityV131(f, inventory, root);
    assert.equal(f.elementQuality[element], c.to, root + ' breakthrough sink');
    assert.equal(inventory[next.materialId], 0, root + ' breakthrough consumes material');
  }
}

{
  const f = createBuildFoundationV113();
  f.roots.metal.level = 250;
  const target = ROOT_ORIGIN_IDS_V113.metal[2];
  setRootOriginTargetV131(f, 'metal', target);
  for (let i = 0; i < 9; i++) {
    const r = rollTargetRootOriginV131(f, 'metal', 'enhanced', () => .9999);
    assert.equal(r.unlocked, false, 'pity should not fire early');
  }
  const pity = rollTargetRootOriginV131(f, 'metal', 'enhanced', () => .9999);
  assert.equal(pity.unlocked, true, 'Lv250 target must unlock on pity 10');
  assert.ok(f.roots.metal.knownOriginIds.includes(target));
}

const fireSkill = {
  id: 'skill.v145.fire', tags: [], effects: [], cooldown: 1, castTime: 0,
  runtimeV117: { primaryRoot: 'fire', slotClass: 'active', form: 'finisher', domains: [] },
  daoRuntimeV118: { elementRole: 'spend' },
};
assert.equal(authoredSkillRootV145(fireSkill), 'fire');
assert.equal(effectiveSkillRootV118({ combatBuildV117: { skillRootBindingsV118: { [fireSkill.id]: 'metal' } } }, fireSkill), 'fire');
const coeff = rootElementDamageCoefficientV145(fireSkill);
assert.equal(coeff?.element, 'Fire');
assert.ok((coeff?.coefficient ?? 0) > 0);

const noRootSkill = { id: 'skill.v145.no_root', tags: [], effects: [], cooldown: 1, castTime: 0, runtimeV117: { slotClass: 'active', form: 'instant', domains: [] }, daoRuntimeV118: { elementRole: 'spend' } };
const legacyEntity = { combatBuildV117: { skillRootBindingsV118: { [noRootSkill.id]: 'fire' }, rootLevelsV133: { fire: 1000 }, activeRootOriginIdsV132: { fire: ROOT_ORIGIN_IDS_V113.fire[0] } } };
assert.equal(authoredSkillRootV145(noRootSkill), undefined);
assert.equal(effectiveSkillRootV118(legacyEntity, noRootSkill), undefined);
assert.deepEqual(rootOriginHuntSkillTuningV132(legacyEntity, noRootSkill), {});
assert.deepEqual(rootMilestoneHuntSkillTuningV133(legacyEntity, noRootSkill), { damageMultiplier: 1, spiritCostMultiplier: 1, cycleMultiplier: 1, shieldMultiplier: 1, healMultiplier: 1 });

assert.equal(rootCombatEffectivenessPctV145(rootEffectivenessPct(1000), elementQualityMultiplier('dao')), 450);
assert.equal(rootCombatEffectivenessPctV145(9999, 99), ROOT_COMBAT_EFFECTIVENESS_CAP_PCT_V145);
const mkEntity = pct => ({ combatBuildV117: { rootEffectivenessPct: { fire: pct }, rootLevelsV133: { fire: 1 } } });
assert.ok(rootGenerateMultiplierV117(mkEntity(450), 'fire') > rootGenerateMultiplierV117(mkEntity(150), 'fire'));
assert.ok(rootPayoffMultiplierV117(mkEntity(450), 'fire') > rootPayoffMultiplierV117(mkEntity(150), 'fire'));

const elementalSets = EQUIPMENT_SET_CATALOG_V116.filter(x => x.category === 'attire' && x.identity === 'element');
assert.equal(elementalSets.length, 5, 'five elemental attire Sets');
for (const element of ['Metal', 'Wood', 'Water', 'Fire', 'Earth']) {
  const set = elementalSets.find(x => x.tags?.includes('Root:' + element));
  assert.ok(set, element + ' Set must bind matching root');
  assert.ok((set.mechanics ?? []).length > 0, element + ' Set must have live mechanics');
}

assert.equal(boundedStatCapV129('damageReductionPct'), 80);
assert.equal(boundedStatCapV129('spiritEfficiencyPct'), 50);
assert.equal(boundedStatCapV129('dodgeChancePct'), 100);

{
  const old = createBuildFoundationV113();
  old.roots.fire.level = 777;
  old.elementQuality.Fire = 'true';
  old.skillRootBindingsV133['skill.legacy'] = 'fire';
  const migrated = cloneBuildFoundationV113(old);
  assert.equal(migrated.roots.fire.level, 777);
  assert.equal(migrated.elementQuality.Fire, 'true');
  assert.equal(migrated.skillRootBindingsV133['skill.legacy'], 'fire', 'old save field may remain compatibility data');
}
assert.deepEqual(elementSealCandidatesV133({}, {}, () => undefined), []);
assert.deepEqual(resolveAuthorizedSkillRootBindingsV133({}, () => undefined, () => undefined), {});

const coreFiles = (await readdir(new URL('../../dist/core/', import.meta.url))).filter(x => x.endsWith('.js') && x !== 'element-seal-v133.js');
for (const file of coreFiles) {
  const src = await readFile(new URL('../../dist/core/' + file, import.meta.url), 'utf8');
  assert.equal(src.includes("from './element-seal-v133.js'"), false, file + ' must not consume retired Element Seal');
}

const app = await readFile(new URL('../../app.js', import.meta.url), 'utf8');
const client = await readFile(new URL('../../dist/core/client-shell.js', import.meta.url), 'utf8');
const standalone = await readFile(new URL('../../standalone-runtime.js', import.meta.url), 'utf8');
const session = await readFile(new URL('../../dist/core/session.js', import.meta.url), 'utf8');
const character = await readFile(new URL('../../dist/core/character.js', import.meta.url), 'utf8');
assert.ok(app.includes('primaryRoot là authority duy nhất'));
for (const token of ['data-element-seal', 'elementSealV133', 'Hành Ấn kỹ năng']) assert.equal(app.includes(token), false, 'frontend retired: ' + token);
assert.equal(client.includes('getElementSealsV133'), false);
assert.equal(standalone.includes('elementSealV133'), false);
assert.equal(session.toLowerCase().includes('elementseal'), false);
assert.ok(character.includes('skillRootBindingsV118: {}'), 'legacy binding runtime lane must be inert');
assert.ok(character.includes('rootCombatEffectivenessPctV145'), 'quality-aware projection must reach combat build');

console.log('V145 Linh Căn × Ngũ Hành Closure: PASS');
`;
await write('qa/tests/v145-spiritual-root-closure-test.js', test);

console.log('V145 patch applied successfully.');
