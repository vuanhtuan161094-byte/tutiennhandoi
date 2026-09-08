import fs from 'node:fs';

function edit(path, fn) {
  const before = fs.readFileSync(path, 'utf8');
  const after = fn(before);
  if (after === before) throw new Error(`No change applied: ${path}`);
  fs.writeFileSync(path, after);
}
function once(s, from, to, label) {
  const i = s.indexOf(from);
  if (i < 0) throw new Error(`Missing ${label}`);
  if (s.indexOf(from, i + from.length) >= 0) throw new Error(`Ambiguous ${label}`);
  return s.slice(0, i) + to + s.slice(i + from.length);
}

edit('dist/core/spiritual-root-v145.js', s => {
  s = once(s,
    'export function combineSpiritualRootOriginV145(inventory, fromRealmTier, batches = 1) {',
    'export function combineSpiritualRootOriginV145(inventory, fromRealmTier, batches = 1, currentMajorRealmIndex = SPIRITUAL_ROOT_MAX_REALM_TIER_V145) {',
    'combine signature');
  s = once(s,
    "  const toId = spiritualRootOriginResourceIdV145(fromTier + 1);\n  const need = BigInt(count * 3);",
    "  const toTier = fromTier + 1;\n  const unlockedTier = Math.max(0, Math.min(SPIRITUAL_ROOT_MAX_REALM_TIER_V145, Math.floor(Number(currentMajorRealmIndex) || 0)));\n  if (toTier > unlockedTier) throw new Error(`Cần lên đại cảnh bậc ${toTier} trước khi tạo Bản Nguyên Linh Căn bậc ${toTier}.`);\n  const toId = spiritualRootOriginResourceIdV145(toTier);\n  const need = BigInt(count * 3);",
    'combine realm lock');
  s = once(s,
    'return { fromRealmTier: fromTier, toRealmTier: fromTier + 1, fromResourceId: fromId, toResourceId: toId, spent: need.toString(), gained: String(count), ratio: \'3:1\' };',
    "return { fromRealmTier: fromTier, toRealmTier: toTier, fromResourceId: fromId, toResourceId: toId, spent: need.toString(), gained: String(count), ratio: '3:1', unlockedRealmTier: unlockedTier };",
    'combine return');
  return s;
});

edit('dist/core/session.js', s => once(s,
  'const result = combineSpiritualRootOriginStateV145(this.stateValue.inventory, fromRealmTier, batches);',
  'const result = combineSpiritualRootOriginStateV145(this.stateValue.inventory, fromRealmTier, batches, majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder));',
  'session combine realm authority'));

edit('qa/tests/v145-spiritual-root-realm-origin-test.js', s => {
  s = s.replace('// Exact 3:1 combine. High-tier pieces may be prepared early, but cannot bypass the character-realm gate.', '// Exact 3:1 combine is also realm-gated: no high-tier Bản Nguyên may exist before its realm is reached.');
  s = once(s,
    'let combined = root.combineSpiritualRootOriginV145(inv, 1, 2);',
    "assert.throws(() => root.combineSpiritualRootOriginV145(inv, 1, 1, 1), /Cần lên đại cảnh bậc 2/);\nlet combined = root.combineSpiritualRootOriginV145(inv, 1, 2, 2);",
    'combine test realm gate');
  s = once(s,
    "assert.ok(session.includes('combineSpiritualRootOriginV145(fromRealmTier, batches = 1)'));",
    "assert.ok(session.includes('combineSpiritualRootOriginStateV145(this.stateValue.inventory, fromRealmTier, batches, majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder))'));",
    'session structural test');
  return s;
});

console.log('V145 strict Bản Nguyên realm lock applied');