import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../styles.css', import.meta.url), 'utf8');

const start = app.indexOf('renderCultivation=function(){');
const end = app.indexOf('/* v1.25 — Định Đạo', start);
assert.ok(start >= 0 && end > start, 'cultivation renderer must remain discoverable');
const renderer = app.slice(start, end);

assert.match(renderer, /class="ui-home-hero"/, 'home must be scene-led');
assert.match(renderer, /data-live-energy/, 'home must read the existing live Tu Vi projection');
assert.match(renderer, /data-live-rate-compact/, 'home must retain the live gain projection');
assert.match(renderer, /data-ascend-realm-v140/, 'realm ascension must use the existing action');
assert.match(renderer, /data-tribulation-v140/, 'tribulation must use the existing action');
assert.match(renderer, /data-retreat-hours/, 'retreat must use the existing action');
assert.match(renderer, /data-use-cultivation-pill/, 'pill use must use the existing action');
assert.match(renderer, /playerExperience\?\.sessionLoop\?\.tasks/, 'recommendations must come from the canonical session loop');
assert.doesNotMatch(renderer, /fetch\(|\/api\//, 'renderer must not introduce a parallel transport');
assert.match(app, /group===id\?'aria-current="page"'/, 'active primary destination must be announced');

assert.match(css, /UI SYSTEM V1 · HOME \/ CULTIVATION VERTICAL SLICE/);
for (const token of ['--ui1-gold', '--ui1-text', '--ui1-space-4', '--ui1-touch']) {
  assert.ok(css.includes(token), `missing design token ${token}`);
}
assert.match(css, /\.ui-home\s*:is\(button,\[role="button"\]\):focus-visible/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
assert.match(css, /\.ui-home-primary[\s\S]*min-height:58px/);

console.log('UI Home vertical slice: PASS');
