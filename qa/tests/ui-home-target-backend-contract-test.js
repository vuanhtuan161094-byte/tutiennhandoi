import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../ui-home-target-v1.css', import.meta.url), 'utf8');

assert.match(index, /\/ui-home-target-v1\.css\?v=target-home-v1-20260913/, 'target Home stylesheet must be loaded');
assert.ok(index.indexOf('/ui-home-target-v1.css') > index.indexOf('/ui-home-v2.css'), 'target pass must load after Home V2');

const start = app.indexOf('renderCultivation=function(){');
const end = app.indexOf('/* v1.25 — Định Đạo', start);
assert.ok(start >= 0 && end > start, 'cultivation renderer must remain discoverable');
const renderer = app.slice(start, end);

// Target visuals may change presentation only. These runtime/read-model sources are mandatory.
for (const authority of [
  /character\?\.schema==='character-cultivation\.v140'/,
  /const tuVi=Math\.max/,
  /cult\.requiredTuVi/,
  /cult\.finalTuViPer15s/,
  /cult\.etaRealSeconds/,
  /cult\.injury\?\?o\.injury/,
  /retreat\.bankHours/,
  /model\.spiritualRoot/,
  /model\.alchemy/,
  /playerExperience\?\.sessionLoop\?\.tasks/,
  /model\?\.flow\?\.journey/,
]) assert.match(renderer, authority, `Home target must remain grounded in canonical data: ${authority}`);

// All target actions must map to existing runtime actions/navigation.
for (const action of [
  /data-sheet-open="cultivate"/,
  /data-ascend-realm-v140/,
  /data-tribulation-v140/,
  /data-use-cultivation-pill/,
  /data-tab-jump="roots"/,
  /data-tab-jump="dungeons"/,
]) assert.match(renderer, action, `Home target must keep canonical action: ${action}`);

// Real HUD resources are Spirit Stone + Reincarnation CP; target concept must not invent gold/gems/mail state.
assert.match(app, /resourceQuantity\('resource\.spirit_stone'\)/, 'header must keep Spirit Stone authority');
assert.match(app, /reincarnationCp\?\?model\.reincarnation\?\.cp/, 'header must keep reincarnation CP authority');
assert.doesNotMatch(css, /data-mail|mail-count|gold-balance|gem-balance|equipment-side-rail/i, 'target CSS must not invent unsupported Home state');
assert.doesNotMatch(renderer, /fetch\(|\/api\//, 'Home renderer must not create parallel transport');

for (const selector of ['.ui-home-hero','.ui-home-progress','.ui-home-primary','.ui-home-quick','.v90-journey-card','.bottom-nav']) {
  assert.ok(css.includes(selector), `missing target treatment for ${selector}`);
}
assert.match(css, /\.ui-home-primary\{[\s\S]*min-height:70px/, 'target primary CTA must preserve a large touch target');
assert.match(css, /@media\(max-width:380px\)/, 'target pass must cover compact portrait');
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/, 'target pass must preserve reduced-motion behavior');
assert.doesNotMatch(css, /url\(/, 'target pass reuses canonical runtime art; no hidden asset dependency');
assert.ok((css.match(/!important/g) || []).length <= 12, 'target pass must stay a controlled override');
assert.ok(Buffer.byteLength(css, 'utf8') < 16000, 'target pass must remain small enough to consolidate after approval');

console.log('UI Home target/backend contract: PASS');
