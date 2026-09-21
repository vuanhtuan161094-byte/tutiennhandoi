import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const workflow=read('.github/workflows/ci.yml');
const runner=read('qa/playtest/run-scenarios.mjs');
const scenarios=JSON.parse(read('qa/playtest/scenarios.json'));

const provisionsRealChrome=/chrome\.exe/i.test(workflow)&&/CHROME_PATH/.test(workflow);
assert.ok(provisionsRealChrome,'Game CI must locate a real Chrome runtime');
assert.match(workflow,/node web\/server\.mjs 4173 127\.0\.0\.1/,'Game CI must boot the canonical server');
assert.match(workflow,/node qa\/playtest\/run-scenarios\.mjs/,'Game CI must execute the real-browser runtime smoke');
assert.match(workflow,/node qa\/runners\/v140-backend-gates\.js fast/,'Game CI must run backend fast QA');
assert.match(workflow,/node qa\/runners\/v140-frontend-gates\.js fast/,'Game CI must run frontend fast QA');
assert.match(workflow,/node qa\/runners\/v140-backend-gates\.js closure/,'Game CI must retain canonical backend closure QA');
assert.match(workflow,/node qa\/runners\/v140-frontend-gates\.js closure/,'Game CI must retain canonical frontend closure QA');
assert.match(workflow,/runtime-smoke-\$\{\{ github\.sha \}\}/,'runtime evidence artifact must be tied to exact SHA');
assert.match(workflow,/retention-days:\s*1/,'runtime smoke artifacts must use one-day retention while Actions storage is constrained');
assert.doesNotMatch(workflow,/^\s*push\s*:/m,'Game CI must remain manual-only; normal development uses Local CI');
assert.match(workflow,/workflow_dispatch:/,'manual Game CI dispatch must remain available');
assert.doesNotMatch(workflow,/capture-combat-runtime\.mjs/,'deep Combat visual matrix must not run in normal Game CI');
assert.doesNotMatch(workflow,/capture-runtime-ui\.mjs/,'separate heavyweight visual capture must not run in normal Game CI');

assert.match(runner,/Page\.captureScreenshot/,'runtime smoke must capture the real browser surface');
assert.match(runner,/mockOrReconstruction:\s*false/,'runtime smoke must explicitly reject mock/reconstruction proof');
assert.match(runner,/hasHorizontalOverflow/,'runtime smoke must guard horizontal overflow');
assert.match(runner,/missingImages/,'runtime smoke must guard missing runtime images');

assert.equal(scenarios.defaults?.viewport?.width,390,'primary runtime-smoke width must be 390');
assert.equal(scenarios.defaults?.viewport?.height,844,'primary runtime-smoke height must be 844');
const ids=new Set((scenarios.scenarios||[]).map(x=>x.id));
for(const id of ['home-navigation','character-equipment','combat-action','save-restore-smoke'])assert.ok(ids.has(id),`runtime smoke missing representative journey ${id}`);
assert.ok((scenarios.scenarios||[]).length<=4,'normal runtime smoke should stay intentionally small; add deep coverage to closure/targeted tests instead');

console.log('Lean runtime visual/smoke workflow contract PASS');
