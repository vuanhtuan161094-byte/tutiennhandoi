import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('ui-combat-target-v1.css','utf8');
const polish=fs.readFileSync('ui-combat-visual-polish.css','utf8');
const camera=fs.readFileSync('ui-combat-camera-polish.css','utf8');
const runtime=fs.readFileSync('modules/combat-presentation-runtime-v140.js','utf8');
const bridge=fs.readFileSync('ui-combat-target-v1.js','utf8');

assert.match(html,/ui-combat-target-v1\.css\?v=combat-readability-target-v1-20260914/,'Combat target CSS must be loaded after locked UI layers');
assert.match(html,/ui-combat-visual-polish\.css\?v=combat-visual-polish-v1-20260915/,'Combat visual polish layer must be loaded');
assert.match(html,/ui-combat-camera-polish\.css\?v=combat-camera-polish-v3-20260915/,'Combat camera/compact polish must be loaded after visual polish');
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
assert.match(polish,/\.huntv2-skill-callout\.tier-ultimate[\s\S]*?white-space:normal!important/,'Ultimate skill names must remain fully readable and wrap instead of ellipsizing');
assert.match(polish,/@media\(max-width:360px\)[\s\S]*?grid-template-columns:repeat\(7,minmax\(0,1fr\)\)!important/,'Compact combat must protect all seven skill slots');
assert.match(polish,/\.huntv2-float\.damage-main\.crit strong/,'Critical damage hierarchy missing');
assert.match(polish,/\.huntv2-float\.damage-main\.kind-dot strong/,'DOT damage hierarchy missing');
assert.match(polish,/\.huntv2-status-tray \.status\.fx-shield>b::before/,'Status rune treatment must include shield semantics');
assert.match(polish,/\.huntv2-artifact-hud \.huntv2-support-crest/,'Combat support art treatment missing');
assert.doesNotMatch(polish,/\/api\/|localStorage|sessionStorage/,'Combat visual polish must remain presentation-only');
assert.match(camera,/\.huntv2-stage\.shake,\s*\nbody\[data-game-screen="hunt"\] \.huntv2-stage\.shake-strong\{[\s\S]*?animation:none!important;[\s\S]*?transform:none!important/,'Stage/HUD shell must stay neutral during shake');
assert.match(camera,/\.huntv2-stage\.shake \.huntv2-arena\{[\s\S]*?animation:huntCvpArenaShake/,'Light shake must move battlefield arena only');
assert.match(camera,/\.huntv2-stage\.shake-strong \.huntv2-arena\{[\s\S]*?animation:huntCvpArenaShakeStrong/,'Heavy shake must move battlefield arena only');
assert.match(camera,/@keyframes huntCvpArenaShakeStrong\{[\s\S]*?100%\{transform:translate3d\(0,0,0\)\}/,'Arena shake must settle to neutral transform');
assert.match(camera,/@media\(max-width:360px\)[\s\S]*?\.huntv2-status-tray\.player\{[\s\S]*?top:calc\(48% \+ 70px\)!important/,'Compact player statuses must clear the player face lane');
assert.match(camera,/@media\(max-width:360px\)[\s\S]*?\.huntv2-skill-callout\.tier-ultimate[\s\S]*?max-width:82%!important[\s\S]*?min-height:48px!important/,'Compact ultimate callout must keep a readable two-line footprint');
assert.match(camera,/@media\(max-width:360px\)[\s\S]*?\.huntv2-skill:last-child\{transform:translateX\(-2px\)!important\}/,'Compact seventh skill must stay clear of the viewport edge');
assert.doesNotMatch(camera,/\/api\/|localStorage|sessionStorage/,'Combat camera polish must remain presentation-only');
assert.match(runtime,/function rendererEventForVisualReadability\(event=\{\}\)/,'Pixi façade must keep the visual-readability guard');
assert.match(runtime,/swordImpact=type==='impact'.*skillId\.startsWith\('skill\.dao\.sword\.'\)/,'Sword impact readability guard must remain scoped to Sword presentation');
assert.match(runtime,/strong:false,[\s\S]*?tags:\['Sword'\]/,'Sword contact flash must normalize only the renderer impact primitive');
assert.match(bridge,/stage\.dataset\.monsterLevel/,'Enemy level must come from runtime-authored stage data');
assert.match(bridge,/stage\.dataset\.env/,'Enemy element context must come from runtime-authored stage data');
assert.doesNotMatch(bridge,/\/api\//,'Presentation bridge must not call backend actions');
assert.doesNotMatch(bridge,/localStorage|sessionStorage/,'Presentation bridge must not author persistent state');
assert.ok(Buffer.byteLength(css,'utf8')<30000,'Combat target CSS must stay under 30 KB');
assert.ok(Buffer.byteLength(polish,'utf8')<36000,'Combat visual polish CSS must stay under 36 KB');
assert.ok(Buffer.byteLength(camera,'utf8')<10000,'Combat camera/compact polish CSS must stay under 10 KB');
/* Combat V8 has a dense legacy cascade. This isolated final layer intentionally
   uses explicit overrides; cap it to a reviewed finite budget instead of forcing
   selectors to lose against the locked legacy !important rules. */
const importantCount=(css.match(/!important/g)||[]).length;
assert.ok(importantCount<=260,`Combat target CSS must stay under 260 !important declarations (${importantCount})`);
console.log(`UI Combat readability target contract PASS · !important=${importantCount}`);
