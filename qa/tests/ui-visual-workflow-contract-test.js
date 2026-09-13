import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const workflow=read('.github/workflows/ui-visual.yml');
const capture=read('qa/visual/capture-runtime-ui.mjs');

assert.match(workflow,/browser-actions\/setup-chrome@v2/,'visual workflow must provision a real Chrome runtime');
assert.match(workflow,/node web\/server\.mjs 4173 127\.0\.0\.1/,'visual workflow must run the canonical local web server');
assert.match(workflow,/node qa\/visual\/capture-runtime-ui\.mjs/,'visual workflow must execute the runtime capture runner');
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
assert.match(capture,/mockOrReconstruction:\s*false/,'manifest must explicitly reject mock/reconstruction proof');
assert.doesNotMatch(capture,/\.innerHTML\s*=/,'visual runner must not reconstruct or replace game markup');

console.log('UI visual workflow contract PASS');
