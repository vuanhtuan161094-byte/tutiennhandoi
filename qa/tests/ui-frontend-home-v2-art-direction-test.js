import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../ui-home-v2.css', import.meta.url), 'utf8');

assert.match(index, /\/ui-home-v2\.css\?v=art-first-home-v2-20260913/, 'Home V2 stylesheet must be loaded');
assert.ok(index.indexOf('/ui-home-v2.css') > index.indexOf('/ui-system-v1.css'), 'Home V2 must be the final presentation override');

const start = app.indexOf('renderCultivation=function(){');
const end = app.indexOf('/* v1.25 — Định Đạo', start);
assert.ok(start >= 0 && end > start, 'cultivation renderer must remain discoverable');
const renderer = app.slice(start, end);

for (const authority of [
  /character\?\.schema==='character-cultivation\.v140'/,
  /playerExperience\?\.sessionLoop\?\.tasks/,
  /model\.flow/,
  /model\.spiritualRoot/,
  /model\.alchemy/,
  /data-live-energy/,
  /data-live-rate-compact/,
  /data-ascend-realm-v140/,
  /data-tribulation-v140/,
  /data-use-cultivation-pill/,
]) assert.match(renderer, authority, `Home V2 must preserve canonical runtime authority: ${authority}`);
assert.doesNotMatch(renderer, /fetch\(|\/api\//, 'Home renderer must not create parallel transport');

assert.match(css, /UI HOME V2 · ART-FIRST CULTIVATION SCENE/);
assert.match(css, /body\[data-game-screen="cultivation"\]/, 'V2 must remain scoped to cultivation');
for (const selector of ['.ui-home-hero','.ui-home-character','.ui-home-progress','.ui-home-primary','.ui-home-quick','.ui-home-next','.v90-journey-card']) {
  assert.ok(css.includes(selector), `missing art-direction treatment for ${selector}`);
}
assert.match(css, /\.ui-home-primary[\s\S]*min-height:58px/, 'primary action must keep a production touch target');
assert.match(css, /\.system-menu>summary\{[\s\S]*width:44px!important;[\s\S]*height:44px!important;/, 'Home HUD menu must preserve the 44px touch target');
assert.match(css, /\.player-meta>strong\{\s*display:none;/, 'Home HUD must not duplicate the realm title already carried by the hero');
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/, 'Home V2 must honor reduced motion');
assert.doesNotMatch(css, /fetch\(|\/api\//, 'presentation layer must not introduce transport/gameplay authority');
assert.doesNotMatch(css, /url\(/, 'Home V2 should reuse canonical runtime art instead of adding hidden asset dependencies');

const importantCount = (css.match(/!important/g) || []).length;
assert.ok(importantCount <= 32, `Home V2 must remain a controlled override; found ${importantCount} !important rules`);
assert.ok(Buffer.byteLength(css, 'utf8') < 26000, 'Home V2 must stay a small isolated art-direction layer');

console.log('UI Home V2 art direction: PASS');
