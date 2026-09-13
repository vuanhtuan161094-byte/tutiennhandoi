import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const index=readFileSync(new URL('../../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../../app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../../ui-home-target-v1.css',import.meta.url),'utf8');
const rail=readFileSync(new URL('../../ui-home-target-v1.js',import.meta.url),'utf8');

assert.match(index,/\/ui-home-target-v1\.js\?v=target-home-v1-rail2-20260913/,'canonical side-rail adapter must be loaded');
assert.ok(index.indexOf('/ui-home-target-v1.js')>index.indexOf('/standalone-entry.js'),'side-rail adapter must load after the production runtime entry');

for(const route of ['overview','roots','path','build','automation']){
  assert.match(rail,new RegExp(`route:'${route}'`),`side rail must expose real route ${route}`);
  assert.match(app,new RegExp(`data-tab-jump=\\\\?"${route}\\\\?"`),`route ${route} must already exist in canonical UI`);
}
assert.match(rail,/querySelectorAll\('\[data-tab-jump\]'\)/,'side rail must locate canonical navigation controls');
assert.match(rail,/candidate\?\.click\(\)/,'side rail must proxy clicks into canonical bound controls');
assert.match(rail,/MutationObserver/,'side rail must follow Home rerenders without modifying app renderer');
assert.match(rail,/data-home-target-side-rail/,'side rail must exclude itself from canonical target lookup');
assert.match(rail,/identity\.style\.width='min\(66%, 250px\)'/,'Home realm title must retain the proven readable width');
assert.match(rail,/title\.style\.fontSize='clamp\(27px, 7\.5vw, 34px\)'/,'Home realm title must retain the proven readable scale');

for(const forbidden of [/activeTab/,/navigateTo/,/fetch\(/,/\/api\//,/action\(/,/localStorage/,/sessionStorage/]){
  assert.doesNotMatch(rail,forbidden,`presentation rail must not own runtime/navigation authority: ${forbidden}`);
}
assert.doesNotMatch(rail,/^\s*import\s/m,'side rail stays outside the locked initial static module graph');
assert.ok(Buffer.byteLength(rail,'utf8')<4096,'side rail adapter must remain tiny');

assert.match(css,/\.ui-home-target-side-rail/,'target CSS must style the canonical-route rails');
assert.match(css,/\.ui-home-target-side-rail button\{[^}]*min-height:58px/,'default rail controls must retain large touch targets');
assert.match(css,/@media\(max-width:380px\)/,'side rails must include compact portrait treatment');
assert.match(css,/@media\(max-height:760px\)/,'side rails must include short portrait treatment');

console.log('UI Home target side-rail contract: PASS');
