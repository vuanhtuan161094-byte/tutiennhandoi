import fs from 'node:fs';

const path = 'qa/tools/apply-v144-technique-retirement.mjs';
let src = fs.readFileSync(path, 'utf8');
const marker = "    '', 'V125 battleManuals summary block');";
const endAt = src.indexOf(marker);
if (endAt < 0) throw new Error('V144 r1: battleManuals patch marker not found');
const startAt = src.lastIndexOf('  s = regex(s,', endAt);
if (startAt < 0) throw new Error('V144 r1: battleManuals patch start not found');
const afterAt = endAt + marker.length;
const replacement = `  s = regex(s,\n    /        const battleManuals = [^\\n]*\\n/,\n    '', 'V125 battleManuals summary block');`;
src = src.slice(0, startAt) + replacement + src.slice(afterAt);
fs.writeFileSync(path, src);
console.log('V144 patcher r1 adjusted battleManuals matcher');
