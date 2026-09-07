import fs from 'node:fs';

const path = 'qa/tools/apply-v144-technique-retirement.mjs';
let src = fs.readFileSync(path, 'utf8');

function replacePatchBlock(marker, starter, replacement, label) {
  const endAt = src.indexOf(marker);
  if (endAt < 0) throw new Error(`V144 retry helper: ${label} marker not found`);
  const startAt = src.lastIndexOf(starter, endAt);
  if (startAt < 0) throw new Error(`V144 retry helper: ${label} start not found`);
  const afterAt = endAt + marker.length;
  src = src.slice(0, startAt) + replacement + src.slice(afterAt);
}

replacePatchBlock(
  "    '', 'V125 battleManuals summary block');",
  '  s = regex(s,',
  `  s = regex(s,\n    /        const battleManuals = [^\\n]*\\n/,\n    '', 'V125 battleManuals summary block');`,
  'battleManuals',
);

replacePatchBlock(
  "    'V144 gate registration');",
  '  s = exact(s,',
  `  s = regex(s,\n    /\\n];/,\n    "\\n  'qa/tests/v144-technique-v103-retirement-test.js',\\n];",\n    'V144 gate registration');`,
  'gate registration',
);

fs.writeFileSync(path, src);
console.log('V144 retry helper adjusted battleManuals + gate-registration matchers');
