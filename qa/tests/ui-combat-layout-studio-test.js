import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const html=read('combat-layout-studio.html');
const studio=read('modules/combat-layout-studio-v1.js');
const bridge=read('ui-combat-target-v1.js');
const launcher=read('CHINH_UI_COMBAT.cmd');

assert.match(html,/id="gameFrame"/,'studio must contain the real-game iframe preview');
assert.match(html,/390 × 844/,'studio must expose primary 390x844 viewport');
assert.match(html,/360 × 800/,'studio must expose compact viewport');
assert.match(html,/412 × 915/,'studio must expose tall portrait viewport');
assert.match(html,/modules\/combat-layout-studio-v1\.js/,'studio must load its isolated DEV module');

assert.match(studio,/dev','1'/,'preview must load the game in DEV mode');
assert.match(studio,/anime','1'/,'preview may load presentation motion explicitly');
assert.match(studio,/tab','hunt'/,'preview must boot directly into Hunt\/Combat');
assert.match(studio,/studio','1'/,'preview must identify the standalone studio context');
assert.doesNotMatch(studio,/tools','1'/,'studio preview must not recursively mount HUD Tuner\/third-party panels');
assert.match(studio,/\.huntv2-actor\.player/,'studio must expose Player geometry');
assert.match(studio,/\.huntv2-actor\.enemy/,'studio must expose Boss geometry');
assert.match(studio,/\.huntv2-player-hud/,'studio must expose Player HUD geometry');
assert.match(studio,/\.huntv2-enemy-hud/,'studio must expose Boss HUD geometry');
assert.match(studio,/\.huntv2-intel-lane/,'studio must expose combat resource geometry');
assert.match(studio,/setProperty\('translate'/,'studio must preview position without replacing transform choreography');
assert.match(studio,/setProperty\('width'/,'studio must preview width live');
assert.match(studio,/setProperty\('height'/,'studio must preview height live');
assert.match(studio,/frame\.contentWindow\?\.__TUTIEN_COMBAT_LAYOUT_PREVIEW_SYNC__/,'studio geometry changes must request live Pixi re-layout');
assert.match(bridge,/__TUTIEN_COMBAT_LAYOUT_PREVIEW_SYNC__/,'combat bridge must expose DEV-only live layout sync');
assert.match(bridge,/requestCombatPresentationLayout/,'combat bridge live layout sync must remeasure the Pixi actor anchors');
assert.match(studio,/tutien\.dev\.combat-layout-draft\.v1/,'studio draft storage must stay isolated from the game save');
assert.match(studio,/navigator\.clipboard\.writeText/,'studio must copy JSON for production handoff');
assert.match(studio,/combat-layout-\$\{data\.viewport\.width\}x\$\{data\.viewport\.height\}\.json/,'studio must download viewport-labelled JSON');
assert.doesNotMatch(studio,/fetch\s*\(|\/api\//,'studio must not call gameplay or DEV action APIs');

assert.match(launcher,/combat-layout-studio\.html/,'dedicated CMD must open Combat Layout Studio');
assert.match(launcher,/4273 4274 4275 4276 4277 4278 4279 4280/,'studio launcher must stay on isolated DEV ports');

console.log('Combat Layout Studio contract PASS · real runtime iframe preview · geometry-only DEV handoff');
