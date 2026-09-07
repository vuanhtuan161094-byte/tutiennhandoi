import { readFile, writeFile } from 'node:fs/promises';
const path = 'qa/tools/v145-apply-patch.mjs';
let s = await readFile(path, 'utf8');

const importFrom = `  const anchor = "import { createBuildFoundationV113, elementQualityMultiplier, rootEffectivenessPct } from './build-foundation-v113.js';\\n";`;
const importTo = `  const anchor = "import { cloneBuildFoundationV113, createBuildFoundationV113, elementQualityMultiplier, rootEffectivenessPct } from './build-foundation-v113.js';\\n";`;
const importCount = s.split(importFrom).length - 1;
if (importCount !== 1) throw new Error(`V145 fixer expected 1 character anchor, got ${importCount}`);
s = s.replace(importFrom, importTo);

const standaloneFrom = `  s = replaceRegexOnce(s, /^\\s*case 'elementSealV133':[^\\n]*\\n/m, '', 'standalone retired action');`;
const standaloneTo = `  if (s.includes('elementSealV133')) s = replaceRegexOnce(s, /^\\s*case 'elementSealV133':[^\\n]*\\n/m, '', 'standalone retired action');`;
const standaloneCount = s.split(standaloneFrom).length - 1;
if (standaloneCount !== 1) throw new Error(`V145 fixer expected 1 standalone guard, got ${standaloneCount}`);
s = s.replace(standaloneFrom, standaloneTo);

await writeFile(path, s, 'utf8');
console.log('V145 patcher guards aligned with live source.');
