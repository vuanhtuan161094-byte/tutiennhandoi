import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../ui-system-v1.css', import.meta.url), 'utf8');

assert.match(index, /\/ui-system-v1\.css\?v=ui-shell-hud-v1-20260913/, 'UI System V1 shell stylesheet must be loaded');
assert.ok(index.indexOf('/ui-system-v1.css') > index.indexOf('/combat-v2.css'), 'shell stylesheet must close the presentation cascade');

assert.match(app, /document\.body\.dataset\.uxShell='p0'/, 'canonical shell scope must remain runtime-owned');
assert.match(app, /group===id\?'aria-current="page"'/, 'active primary destination must remain announced');
assert.match(app, /const primaryTabs=\[[\s\S]*character[\s\S]*cultivation[\s\S]*dungeons[\s\S]*dongfu[\s\S]*locations/, 'five canonical primary destinations must remain intact');

assert.match(css, /UI SYSTEM V1 · APP SHELL \/ HUD/);
for (const token of ['--ui-shell-gold','--ui-shell-jade','--ui-shell-text','--ui-shell-touch']) {
  assert.ok(css.includes(token), `missing shell design token ${token}`);
}
assert.match(css, /--ui-shell-touch:44px/, 'shell touch target must remain 44px');
assert.match(css, /\.system-menu>summary[\s\S]*var\(--ui-shell-touch\)/, 'system menu must use the shared touch target');
assert.match(css, /\.nav-button\[aria-current="page"\]/, 'dock visuals must follow semantic current-page state');
assert.match(css, /\.nav-button:focus-visible/, 'dock must expose keyboard focus');
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/, 'shell motion must honor reduced-motion');
for (const state of ['loading','empty','blocked','error','success']) {
  assert.ok(css.includes(`data-state="${state}"`), `missing StatePanel grammar for ${state}`);
}
assert.match(css, /\.player-meta>span[\s\S]*font-size:10px!important/, 'essential HUD metadata must not drop below 10px');
assert.match(css, /\.nav-button>span[\s\S]*font-size:10px!important/, 'essential dock labels must not drop below 10px');
assert.doesNotMatch(css, /fetch\(|\/api\//, 'presentation layer must not introduce transport or gameplay authority');

console.log('UI App Shell / HUD: PASS');