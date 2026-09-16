import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('ui-combat-target-v1.css','utf8');
const polish=fs.readFileSync('ui-combat-visual-polish.css','utf8');
const camera=fs.readFileSync('ui-combat-camera-polish.css','utf8');
const info=fs.readFileSync('ui-combat-information-v1.css','utf8');
const runtime=fs.readFileSync('modules/combat-presentation-runtime-v140.js','utf8');
const bridge=fs.readFileSync('ui-combat-target-v1.js','utf8');
const hunt=fs.readFileSync('modules/hunt-combat-v2.js','utf8');

assert.match(html,/ui-combat-target-v1\.css\?v=combat-readability-target-v1-20260914/,'Combat target CSS must be loaded after locked UI layers');
assert.match(html,/ui-combat-visual-polish\.css\?v=combat-visual-polish-v1-20260915/,'Combat visual polish layer must be loaded');
assert.match(html,/ui-combat-camera-polish\.css\?v=combat-camera-polish-v14-20260916/,'Combat camera/compact polish cache key must include V180 portrait geometry');
assert.match(html,/ui-combat-information-v1\.css\?v=combat-information-v3-20260916/,'Combat information cache key must include active-state/farm semantics');
assert.match(html,/ui-combat-target-v1\.js\?v=combat-information-v6-20260916/,'Combat context bridge cache key must include timed-farm semantics');
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
assert.match(camera,/@media\(max-width:360px\)[\s\S]*?\.huntv2-status-tray\.player\{[\s\S]*?top:calc\(48% \+ 70px\)!important/,'360px player statuses must clear the player face lane');
assert.match(camera,/@media\(max-width:360px\)[\s\S]*?\.huntv2-skill-callout\.tier-ultimate[\s\S]*?max-width:82%!important[\s\S]*?min-height:48px!important/,'360px ultimate callout must keep a readable two-line footprint');
assert.doesNotMatch(camera,/\.huntv2-skill:last-child\{transform:translateX\(/,'Final skill slot must not require edge-specific nudging');

/* V180: one portrait geometry for every 360–430px height. Height must never select another composition. */
assert.doesNotMatch(camera,/@media\(max-width:430px\) and \(max-height:/,'Combat portrait geometry must not fork by viewport height');
assert.doesNotMatch(camera,/@media\(max-width:360px\) and \(max-height:/,'360px geometry must not fork by viewport height');
assert.match(camera,/@media\(max-width:430px\)[\s\S]*?\.huntv2-enemy-hud\{[\s\S]*?top:86px!important[\s\S]*?width:168px!important[\s\S]*?height:68px!important/,'Portrait boss vitals must use one compact upper-right footprint');
assert.match(camera,/@media\(max-width:430px\)[\s\S]*?\.huntv2-actor\.enemy,[\s\S]*?\.huntv2-actor\.enemy\.boss\{[\s\S]*?bottom:48%!important/,'Portrait boss actor must share one vertical geometry');
assert.match(camera,/@media\(max-width:430px\)[\s\S]*?\.huntv2-skill-callout\.ultimate\{[\s\S]*?bottom:30px!important/,'Portrait ultimate plaque must use the common lower battlefield lane');
assert.match(camera,/@media\(max-width:430px\)[\s\S]*?\.huntv2-skills\{[\s\S]*?position:absolute!important[\s\S]*?left:8px!important[\s\S]*?right:8px!important[\s\S]*?bottom:39px!important[\s\S]*?height:58px!important[\s\S]*?grid-template-columns:repeat\(7,minmax\(0,1fr\)\)!important[\s\S]*?transform:none!important/,'Portrait skill rail must be pinned across seven equal tracks at every supported height');
assert.match(camera,/@media\(max-width:430px\)[\s\S]*?\.huntv2-skill,[\s\S]*?\.huntv2-skill\.ultimate\{[\s\S]*?width:100%!important[\s\S]*?height:58px!important[\s\S]*?min-width:0!important[\s\S]*?justify-self:stretch!important/,'Portrait skill cells must fill equal-width tracks without device-specific offsets');
assert.match(camera,/\.huntv2-intel-lane\{[\s\S]*?z-index:85!important[\s\S]*?height:25px!important/,'Portrait Bản Đạo resource lane must remain above the skill rail');
assert.match(camera,/\.huntv2-intel-meter span,[\s\S]*?\.huntv2-intel-meter b\{[\s\S]*?font-size:10px!important/,'Portrait Bản Đạo resource text must respect the 10px legibility floor');
assert.doesNotMatch(camera,/\.huntv2-intel-meter b\{font-size:9(?:\.5)?px!important/,'Compact Bản Đạo text must never shrink below the visual-proof legibility floor');
assert.match(camera,/V180 portrait tactical text floor[\s\S]*?\.huntv2-enemy-intent span,[\s\S]*?\.huntv2-result-pop span,[\s\S]*?font-size:10px!important/,'Transient combat text must have an explicit 10px portrait floor');
assert.match(camera,/\.huntv2-skill-callout small,[\s\S]*?font-size:10px!important/,'Ultimate/callout labels must never render below 10px on portrait');
assert.match(camera,/V180 exact visible DoT damage-label floor[\s\S]*?\.huntv2-float\.damage-main>span\{[\s\S]*?font-size:10px!important/,'Visible DoT damage labels must never render below 10px on portrait');
assert.match(camera,/\.huntv2-intel-meter\[data-intel-resource="swordIntentV2"\]\{[\s\S]*?border-color:rgba\(134,217,255,\.72\)!important/,'Kiếm Ý meter must have a dedicated readable visual state');
assert.match(camera,/\.huntv2-intel-meter\[data-intel-resource="swordIntentV2"\]>i>em\{[\s\S]*?background:linear-gradient\(90deg,#3e82c7,#86d9ff 66%,#f1fbff\)!important/,'Kiếm Ý fill must remain visually distinct from the meter background');
assert.match(camera,/\.huntv2-enemy-info\{[\s\S]*?display:grid!important[\s\S]*?width:20px!important[\s\S]*?height:20px!important/,'Compact Boss HUD must keep the canonical monster-detail affordance visible');
assert.doesNotMatch(camera,/\/api\/|localStorage|sessionStorage/,'Combat camera polish must remain presentation-only');

assert.match(info,/is-prefight:not\(\.is-active-combat\) \.v5-boss-briefing\{display:grid\}/,'Boss briefing must exist only before active combat');
assert.match(info,/is-active-combat \.v5-boss-briefing,[\s\S]*?is-active-combat \.huntv2-action-deck\{display:none!important\}/,'Active combat must hide all pre-fight briefing/challenge controls');
assert.match(info,/is-active-combat \.v5-boss-mechanic-compact:not\(\[hidden\]\)\{display:grid\}/,'Active combat must expose only the compact Boss mechanic affordance');
assert.match(info,/\.v5-critical-signal-active \.v5-boss-mechanic-compact\{display:none!important\}/,'Lethal/telegraph/counter signals must outrank the mechanic chip');
assert.match(info,/\.huntv2-context-button\.v5-farm-summary\{display:flex!important/,'Unlocked farm summary must reuse backend-authored context');
assert.match(info,/\.huntv2-result-pop\.show\.victory/,'Victory result cue must remain visually explicit');
assert.match(info,/\.huntv2-result-pop\.show\.defeat/,'Defeat result cue must remain visually explicit');
assert.match(info,/@media\(max-width:430px\)/,'Boss briefing must share the width-only portrait policy');
assert.doesNotMatch(info,/@media\(max-width:430px\) and \(max-height:/,'Boss briefing must not fork by viewport height');
assert.doesNotMatch(info,/\/api\/|localStorage|sessionStorage/,'Combat information layer must remain presentation-only');

assert.match(runtime,/function rendererEventForVisualReadability\(event=\{\}\)/,'Pixi façade must keep the visual-readability guard');
assert.match(runtime,/swordImpact=type==='impact'.*skillId\.startsWith\('skill\.dao\.sword\.'\)/,'Sword impact readability guard must remain scoped to Sword presentation');
assert.match(runtime,/strong:false,[\s\S]*?tags:\['Sword'\]/,'Sword contact flash must normalize only the renderer impact primitive');
assert.match(bridge,/stage\.dataset\.monsterLevel/,'Enemy level must come from runtime-authored stage data');
assert.match(bridge,/stage\.dataset\.env/,'Enemy element context must come from runtime-authored stage data');
assert.match(bridge,/\[data-sheet-panel="monster"\]/,'Boss briefing must read the canonical monster sheet instead of inventing Boss stats');
assert.match(bridge,/\.v110-readiness strong/,'Boss readiness must come from the backend-authored readiness block');
assert.match(bridge,/\.v110-boss-plan header strong/,'Boss mechanic must come from the canonical Boss plan');
assert.match(bridge,/FARM SAU PHÁ TẦNG/,'Boss information must describe the timed-farm consequence, not direct battle loot');
assert.match(bridge,/Reward tích theo thời gian/,'Boss information must state timed reward semantics');
assert.doesNotMatch(bridge,/THƯỞNG DỰ KIẾN|findBossRewardPanel/,'Presentation must not retain the retired direct-Boss reward preview');
assert.match(bridge,/const farmButton = actionDeck\?\.querySelector\('\.huntv2-context-button\.loot'\)/,'Timed-farm briefing must reuse the backend-authored farm context');
assert.match(bridge,/fight\?\.disabled/,'Fight blocker presentation must follow the canonical disabled challenge action');
assert.match(bridge,/v5-farm-summary/,'Farm summary must reuse the existing backend-authored loot context button');
assert.match(bridge,/v5-critical-signal-active/,'Critical combat signals must suppress lower-priority mechanic chrome');
assert.doesNotMatch(bridge,/spiritStonesHint|equipmentChancePct/,'Presentation bridge must not recalculate or directly author reward truth');
assert.doesNotMatch(bridge,/\/api\//,'Presentation bridge must not call backend actions');
assert.doesNotMatch(bridge,/localStorage|sessionStorage/,'Presentation bridge must not author persistent state');
assert.match(hunt,/event\.type==='battleEnd'[\s\S]*?showResult\(root,won\?'TRẤN SÁT':'THẤT BẠI'/,'Canonical battleEnd must remain the authority for victory/defeat result');
assert.doesNotMatch(bridge,/battleEnd/,'Presentation bridge must not reinterpret battle outcome');

assert.match(info,/Combat composition reset candidate[\s\S]*?\.huntv2-actor\.player\{[\s\S]*?bottom:20%!important[\s\S]*?\.huntv2-actor\.enemy\{[\s\S]*?bottom:20%!important/,'Player and Boss must share the same portrait ground plane');
assert.match(info,/\.huntv2-status-tray \.status\.status-hidden\{display:none!important\}/,'Status overflow must never reveal runtime-hidden chips');
assert.match(info,/\.v5-combat-engaged :is\(\.v5-boss-briefing,\.huntv2-action-deck,\.huntv2-log-preview\)\{display:none!important\}/,'Engaged combat must remove pre-fight chrome');
assert.match(info,/\.v5-combat-engaged \.huntv2-console\{[\s\S]*?min-height:92px!important/,'Active combat must reclaim lower-console space for battlefield');
assert.match(bridge,/function syncEngagedPresentation\(screen, stage\)/,'Bridge must derive engaged presentation without gameplay authority');
assert.match(bridge,/stage\.classList\.contains\('presentation-active'\)/,'Engaged presentation must follow canonical presentation activity');
assert.match(bridge,/v5-combat-engaged/,'Engaged presentation class must drive state-specific UI');


assert.ok(Buffer.byteLength(css,'utf8')<30000,'Combat target CSS must stay under 30 KB');
assert.ok(Buffer.byteLength(polish,'utf8')<36000,'Combat visual polish CSS must stay under 36 KB');
assert.ok(Buffer.byteLength(camera,'utf8')<18000,'Combat camera/compact polish CSS must stay under 18 KB');
assert.ok(Buffer.byteLength(info,'utf8')<13000,'Combat information architecture CSS must stay under 13 KB');
/* Combat V8 has a dense legacy cascade. This isolated final layer intentionally
   uses explicit overrides; cap it to a reviewed finite budget instead of forcing
   selectors to lose against the locked legacy !important rules. */
const importantCount=(css.match(/!important/g)||[]).length;
assert.ok(importantCount<=260,`Combat target CSS must stay under 260 !important declarations (${importantCount})`);
console.log(`UI Combat readability target PASS · !important=${importantCount}`);

assert.match(camera,/V180 high-specificity visible tactical text floor[\s\S]*?\.huntv2-screen \.huntv2-stage \.huntv2-skill-callout>small[\s\S]*?font-size:10px!important/,'High-specificity tactical labels must preserve the 10px portrait floor');
