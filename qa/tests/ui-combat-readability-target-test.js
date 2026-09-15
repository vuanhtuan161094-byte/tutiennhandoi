import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('ui-combat-target-v1.css','utf8');
const bridge=fs.readFileSync('ui-combat-target-v1.js','utf8');

assert.match(html,/ui-combat-target-v1\.css\?v=combat-readability-target-v1-20260914/,'Combat target CSS must be loaded after locked UI layers');
assert.match(html,/ui-combat-target-v1\.js\?v=combat-third-party-tools-v3-20260915/,'Combat context bridge must be loaded');
assert.match(css,/body\[data-game-screen="hunt"\] \.huntv2-player-hud/,'Combat target must stay isolated to Hunt');
assert.match(css,/body\[data-game-screen="hunt"\] \.huntv2-enemy-hud/,'Enemy HUD readability target missing');
assert.match(css,/grid-template-columns:repeat\(7,minmax\(0,1fr\)\)/,'All seven backend-authored skill slots must remain visible');
assert.match(css,/\.huntv2-skill\.ready \.huntv2-skill-art/,'READY state must be visually distinct');
assert.match(css,/\.huntv2-cooldown b/,'Current cooldown number must remain primary');
assert.match(css,/\.huntv2-poise/,'Poise / Phá Thế presentation must remain visible');
assert.match(css,/\.huntv2-status-tray\.player/,'Player status tray must have a protected HUD zone');
assert.match(css,/\.huntv2-status-tray\.enemy/,'Enemy status tray must have a protected HUD zone');
assert.match(css,/\.huntv2-enemy-intent/,'Enemy intent must have a protected battlefield zone');
assert.match(css,/\.huntv2-break-window/,'Break window must have a protected battlefield zone');
assert.match(css,/\.huntv2-quick-controls/,'Secondary controls must be compacted');
assert.match(bridge,/stage\.dataset\.monsterLevel/,'Enemy level must come from runtime-authored stage data');
assert.match(bridge,/stage\.dataset\.env/,'Enemy element context must come from runtime-authored stage data');
assert.doesNotMatch(bridge,/\/api\//,'Presentation bridge must not call backend actions');
assert.doesNotMatch(bridge,/localStorage|sessionStorage/,'Presentation bridge must not author persistent state');
assert.ok(Buffer.byteLength(css,'utf8')<30000,'Combat target CSS must stay under 30 KB');
/* Combat V8 has a dense legacy cascade. This isolated final layer intentionally
   uses explicit overrides; cap it to a reviewed finite budget instead of forcing
   selectors to lose against the locked legacy !important rules. */
const importantCount=(css.match(/!important/g)||[]).length;
assert.ok(importantCount<=260,`Combat target CSS must stay under 260 !important declarations (${importantCount})`);
console.log(`UI Combat readability target contract PASS · !important=${importantCount}`);
