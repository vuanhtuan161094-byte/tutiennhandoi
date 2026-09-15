import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const workflow=read('.github/workflows/ui-visual.yml');
const capture=read('qa/visual/capture-runtime-ui.mjs');
const combatCapture=read('qa/visual/capture-combat-runtime.mjs');

assert.match(workflow,/browser-actions\/setup-chrome@v2/,'visual workflow must provision a real Chrome runtime');
assert.match(workflow,/node web\/server\.mjs 4173 127\.0\.0\.1/,'visual workflow must run the canonical local web server');
assert.match(workflow,/node qa\/visual\/capture-runtime-ui\.mjs/,'visual workflow must execute the runtime capture runner');
assert.match(workflow,/node qa\/visual\/capture-combat-runtime\.mjs/,'visual workflow must execute the combat showcase capture runner');
assert.match(workflow,/actions\/upload-artifact@v4/,'visual proof must be exported as a workflow artifact');
assert.match(workflow,/ui-visual-\$\{\{ github\.sha \}\}/,'artifact must be tied to the exact candidate SHA');

assert.match(capture,/Page\.captureScreenshot/,'capture must use the real browser surface');
assert.match(capture,/\/api\/dev\/new/,'fixture must start from deterministic canonical runtime state');
assert.match(capture,/devSandboxPreset/,'fixture may use the existing save-safe dev authority to prepare representative progression');
assert.match(capture,/localStorage\.setItem\('tutien\.web\.save\.v1'/,'dev fixture must be handed back through the canonical web save path');
assert.match(capture,/\?tab=cultivation&visualqa=1/,'final Home capture must use the production URL without dev=1');
assert.match(capture,/\?tab=character&visualqa=1/,'baseline Character capture must use the production URL without dev=1');
assert.match(capture,/home-hud-390x844/,'390×844 reference viewport must be captured');
assert.match(capture,/home-hud-412x915/,'412×915 tall viewport must be captured');
assert.match(capture,/data-home-target-route=\\?"roots\\?"/,'visual proof must exercise the Home canonical Linh Căn side rail');
assert.match(capture,/document\.body\.dataset\.gameScreen === 'roots'/,'visual proof must verify the rail reaches the real roots runtime screen');
assert.match(capture,/interactionChecks\.push\(await smokeHomeSideRail\(client\)\)/,'runtime side-rail smoke must be part of exact-SHA proof');
assert.match(capture,/mockOrReconstruction:\s*false/,'manifest must explicitly reject mock/reconstruction proof');
assert.doesNotMatch(capture,/\.innerHTML\s*=/,'visual runner must not reconstruct or replace game markup');

assert.match(combatCapture,/schema:'tutien-combat-visual-showcase\.v1'/,'combat capture must emit the versioned showcase manifest');
for(const scene of ['01-clean','02-status-stress','03-skill-cast','04-damage-stress','05-boss-break','06-full-chaos'])assert.match(combatCapture,new RegExp(scene),`combat capture must cover ${scene}`);
for(const phase of ['before','impact','peak','settled'])assert.match(combatCapture,new RegExp(`screen-shake-.*-${phase}`),`combat capture must retain ${phase} shake frames`);
assert.match(combatCapture,/manifest\.skills\.length/,'combat capture must report the complete skill list');
assert.match(combatCapture,/manifest\.shake = shakeFrames/,'combat capture must report all shake variants');
assert.match(workflow,/name: ui-visual-\$\{\{ github\.sha \}\}/,'combat showcase proof must be uploaded under the exact candidate SHA artifact');
assert.match(workflow,/s\.enemy\?\.mark/,'status stress validation must read the canonical enemy mark projection');

console.log('UI visual workflow contract PASS');
