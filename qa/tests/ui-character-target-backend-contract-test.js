import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const app=read('app.js');
const index=read('index.html');
const css=read('ui-character-target-v1.css');

assert.match(index,/ui-character-target-v1\.css\?v=character-shrine-target-v2-20260913/,'Character V2 target layer must load with the current cache key');
assert.ok(index.indexOf('ui-character-target-v1.css')>index.indexOf('ui-home-target-v1.css'),'Character target stylesheet must remain last in the presentation cascade');

assert.match(app,/const c=model\.character,o=model\.overview,st=c\.combatStats\|\|\{\},core=c\.coreStats\|\|\{\},gear=model\.equipment\|\|\[\],sys=model\.equipmentSystem\|\|\{\}/,'Character renderer must continue binding canonical Character + Equipment read models');
assert.match(app,/canonicalSlots=Number\(sys\.canonicalSlotCount\?\?10\)/,'canonical equipment slot count must remain backend-owned with the existing 10-slot fallback');
assert.match(app,/v13819SetCategorySummary\(sys,'attire'\)/,'attire set summary must remain backend-owned');
assert.match(app,/v13819SetCategorySummary\(sys,'jewelry'\)/,'jewelry set summary must remain backend-owned');
assert.match(app,/v13819BreakSummary\(c,sys\)/,'Phá Thế summary must remain canonical');
assert.match(app,/data-open-inventory="gear"/,'Character target must retain canonical equipment navigation');
assert.match(app,/data-open-inventory="sets"/,'Character target must retain canonical set navigation in the renderer/detail surface');
assert.match(app,/data-sheet-open="stats"/,'Character target must retain canonical stat detail action');
assert.match(app,/data-sheet-open="origin"/,'Character target must retain canonical profile detail action');
assert.match(app,/data-tab-jump="path"/,'Character target must retain canonical path/build navigation');

assert.match(css,/\.v138237-character-scroll[\s\S]*overflow:hidden/,'Character first screen must not expose an internal scroll container');
assert.match(css,/\.v138247-cult-entry,[\s\S]*\.v138237-playstyle,[\s\S]*\.v138237-next\{display:none!important\}/,'deep secondary sections must leave the first viewport and remain reachable through canonical detail routes');
assert.match(css,/\.v138237-hero::before/,'target must provide a shrine\/ritual halo in the real Character scene');
assert.match(css,/\.v138237-equip-slot>span[\s\S]*border-radius:50%!important/,'equipment sockets must remain round inlaid seals');
assert.match(css,/\.v138237-hero-plaque span\{display:none!important\}/,'Ngũ Hành secondary text must not be repeated inside the hero build plaque');
assert.match(css,/\.v138237-core[\s\S]*grid-template-columns:1fr!important/,'three canonical stats must render as a compact engraved rail rather than dashboard cards');
assert.match(css,/\.v138237-action-grid\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/,'canonical Character detail routes must fit in one compact row');
assert.match(css,/--ct-display:/,'Character V2 must define a dedicated display typography stack');
assert.match(css,/--ct-ui:/,'Character V2 must define a dedicated UI typography stack');
assert.match(css,/@container \(max-width:390px\)/,'390px production viewport must have an explicit target pass');
assert.match(css,/@container \(max-width:360px\)/,'360px production viewport must have an explicit target pass');

const bytes=Buffer.byteLength(css,'utf8');
const important=(css.match(/!important/g)||[]).length;
assert.ok(bytes<22000,`Character target stylesheet must stay <22 KB, got ${bytes}`);
assert.ok(important<=85,`Character target stylesheet must stay <=85 !important declarations, got ${important}`);
assert.doesNotMatch(css,/mail|gold currency|gem currency|mount|wing/i,'target layer must not introduce concept-only/fake gameplay systems');

console.log(`UI Character target/backend contract PASS · ${bytes} bytes · ${important} !important`);
