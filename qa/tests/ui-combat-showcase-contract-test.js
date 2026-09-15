import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const combat=read('modules/hunt-combat-v2.js');
const pixi=read('modules/combat-pixi-scene-v140.js');
const capture=read('qa/visual/capture-combat-runtime.mjs');
const app=read('app.js');

for(const scene of ['scene-01-clean','scene-02-status-stress','scene-03-skill-cast','scene-04-damage-stress','scene-05-boss-break','scene-06-full-chaos']){
  assert.match(combat,new RegExp(`data-dev-showcase="${scene}"`),`DEV showcase must expose ${scene}`);
  assert.match(capture,new RegExp(scene.replace(/^scene-/,'') ),`runtime capture must cover ${scene}`);
}
for(const kind of ['light','heavy','critical','ultimate','boss']){
  assert.match(combat,new RegExp(`data-dev-showcase-shake="${kind}"`),`DEV showcase must expose ${kind} shake`);
}
assert.match(capture,/for \(const kind of \['light','heavy','critical','ultimate','boss'\]\)/,'runtime capture must cover every shake variant');
assert.match(capture,/screen-shake-\$\{kind\}/,'runtime capture must retain named shake frames');

assert.match(combat,/combat-visual-showcase\.v1/,'showcase API must be versioned');
assert.match(combat,/listSkills:\(\)=>skills\.filter\(Boolean\)/,'showcase must enumerate the mounted runtime skills');
assert.match(combat,/addDevStatuses\('player','buff'/,'status stress must use the existing DEV status fixture');
assert.match(combat,/addDevStatuses\('enemy','debuff'/,'enemy status stress must use the existing DEV status fixture');
assert.match(combat,/sampleStop=key==='light'\?22/,'shake capture must keep DEV hit-stop sampling deterministic');
assert.match(combat,/dev\.showcase\.ultimate/,'ultimate shake fixture must be explicitly DEV-only');

const showcaseStart=combat.indexOf('const showcaseBegin=');
const showcaseEnd=combat.indexOf('globalThis.__TUTIEN_COMBAT_SHOWCASE__',showcaseStart);
assert.ok(showcaseStart>=0&&showcaseEnd>showcaseStart,'showcase implementation must remain bounded in the DEV mount');
assert.doesNotMatch(combat.slice(showcaseStart,showcaseEnd),/action\(\{action:'endlessFight'/,'showcase scenes must not invoke production combat authority');

assert.match(pixi,/dataset\.combatPixiCameraX/,'Pixi camera X telemetry must be exposed for shake proof');
assert.match(pixi,/stats\.cameraActive/,'Pixi camera active telemetry must be exposed for shake proof');
assert.match(capture,/mockOrReconstruction:false/,'combat proof must reject mock or reconstructed evidence');
assert.match(capture,/Page\.captureScreenshot/,'combat proof must capture the real browser surface');
for(const phase of ['before','impact','peak','settled'])assert.match(capture,new RegExp(`screen-shake-.*-${phase}`),`shake proof must retain ${phase} frames`);
assert.match(capture,/combat-showcase-\$\{viewport\}-metrics\.json/,'showcase manifest must be written per viewport');
assert.match(app,/DEV_MODE&&document\.querySelector\('\.huntv2-screen\.is-dev-showcase'\)/,'live polling guard must stay limited to DEV showcase screens');

console.log('UI Combat Visual Showcase contract PASS');
