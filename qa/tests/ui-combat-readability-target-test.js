import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('ui-combat-target-v1.css','utf8');
const polish=fs.readFileSync('ui-combat-visual-polish.css','utf8');
const camera=fs.readFileSync('ui-combat-camera-polish.css','utf8');
const info=fs.readFileSync('ui-combat-information-v1.css','utf8');
const runtime=fs.readFileSync('modules/combat-presentation-runtime-v140.js','utf8');
const arch=fs.readFileSync('modules/combat-presentation-architecture-v140.js','utf8');
const renderer=fs.readFileSync('modules/combat-dom-renderer-v1.js','utf8');
const bridge=fs.readFileSync('ui-combat-target-v1.js','utf8');
const hunt=fs.readFileSync('modules/hunt-combat-v2.js','utf8');

assert.match(html,/ui-combat-target-v1\.css\?v=combat-readability-target-v1-20260914/,'Combat target CSS must be loaded');
assert.match(html,/ui-combat-visual-polish\.css\?v=combat-visual-polish-v1-20260915/,'Combat visual polish layer must be loaded');
assert.match(html,/ui-combat-camera-polish\.css\?v=combat-camera-polish-v14-20260916/,'Combat camera layer must remain the compact geometry owner');
assert.match(html,/ui-combat-information-v1\.css\?v=combat-information-v3-20260916/,'Combat information layer must remain final state owner');
assert.match(html,/ui-combat-target-v1\.js\?v=combat-information-v7-scoped-lifecycle-20260917-model-v1/,'Combat bridge cache key must expose model/renderer boundary');

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

assert.match(polish,/\.huntv2-skill-callout\.tier-ultimate[\s\S]*?white-space:normal!important/,'Ultimate skill names must remain fully readable');
assert.match(polish,/\.huntv2-float\.damage-main\.crit strong/,'Critical damage hierarchy missing');
assert.match(polish,/\.huntv2-float\.damage-main\.kind-dot strong/,'DOT damage hierarchy missing');
assert.match(polish,/\.huntv2-status-tray \.status\.fx-shield>b::before/,'Shield status rune treatment missing');
assert.doesNotMatch(polish,/\/api\/|localStorage|sessionStorage/,'Combat visual polish must remain presentation-only');

assert.match(camera,/\.huntv2-stage\.shake[\s\S]*?animation:none!important;[\s\S]*?transform:none!important/,'Stage/HUD shell must stay neutral during shake');
assert.match(camera,/\.huntv2-stage\.shake \.huntv2-arena\{[\s\S]*?animation:huntCvpArenaShake/,'Light shake must move battlefield arena only');
assert.match(camera,/@keyframes huntCvpArenaShakeStrong/,'Heavy camera impulse keyframes missing');
assert.doesNotMatch(camera,/@media\(max-width:430px\) and \(max-height:/,'Portrait geometry must not fork by viewport height');
assert.match(camera,/@media\(max-width:430px\)[\s\S]*?\.huntv2-enemy-hud\{[\s\S]*?top:86px!important[\s\S]*?width:168px!important[\s\S]*?height:68px!important/,'Portrait boss vitals must stay compact');
assert.match(camera,/\.huntv2-intel-meter\[data-intel-resource="swordIntentV2"\]/,'Kiếm Ý meter dedicated visual state missing');
assert.match(camera,/\.huntv2-intel-meter\[data-intel-resource="swordIntentV2"\]>i>em\{[\s\S]*?background:linear-gradient\(90deg,#3e82c7,#86d9ff 66%,#f1fbff\)!important/,'Kiếm Ý fill must remain visually distinct');
assert.match(camera,/\.huntv2-enemy-info\{[\s\S]*?display:grid!important/,'Compact Boss HUD must keep detail affordance visible');
assert.doesNotMatch(camera,/\/api\/|localStorage|sessionStorage/,'Combat camera layer must remain presentation-only');

assert.match(info,/is-prefight:not\(\.is-active-combat\) \.v5-boss-briefing\{display:grid\}/,'Boss briefing must exist only before active combat');
assert.match(info,/is-active-combat \.v5-boss-briefing,[\s\S]*?is-active-combat \.huntv2-action-deck\{display:none!important\}/,'Active combat must hide pre-fight controls');
assert.match(info,/is-active-combat \.v5-boss-mechanic-compact:not\(\[hidden\]\)\{display:grid\}/,'Active combat must expose compact Boss mechanic affordance');
assert.match(info,/\.v5-critical-signal-active \.v5-boss-mechanic-compact\{display:none!important\}/,'Critical signals must outrank mechanic chrome');
assert.match(info,/\.huntv2-context-button\.v5-farm-summary\{display:flex!important/,'Unlocked farm summary must reuse the canonical context button');
assert.match(info,/data-combat-action-state="available"/,'Available challenge state styling missing');
assert.match(info,/data-combat-action-state="blocked"/,'Blocked challenge state styling missing');
assert.doesNotMatch(info,/\.huntv2-actor\.(?:player|enemy)[^{]*\{[^}]*\b(?:left|right|top|bottom):/s,'Final information owner must not reposition battlefield actors');
assert.doesNotMatch(info,/\/api\/|localStorage|sessionStorage/,'Combat information layer must remain presentation-only');

assert.match(runtime,/function rendererEventForVisualReadability\(event=\{\}\)/,'Pixi façade visual-readability guard missing');
assert.match(runtime,/swordImpact=type==='impact'.*skillId\.startsWith\('skill\.dao\.sword\.'\)/,'Sword impact readability guard must stay scoped');

assert.match(arch,/export const COMBAT_PRESENTATION_MODEL_VERSION='combat-view-model\.v1'/,'Canonical model version missing');
assert.match(arch,/export function buildCombatPresentationModelV1\(/,'Canonical presentation builder missing');
assert.match(arch,/const production=h\.productionV110\|\|\{\}/,'Presentation model must consume backend-authored production context');
assert.match(arch,/const bossIntel=production\.boss\|\|\{\}/,'Boss presentation must consume production boss context');
assert.match(arch,/Boss tầng \$\{floor\} · thắng mở tầng kế/,'Boss copy must remain progression-oriented');
assert.match(arch,/Reward tích theo thời gian/,'Farm copy must retain timed settlement semantics');
assert.doesNotMatch(arch,/THƯỞNG DỰ KIẾN|equipmentChancePct.*Boss|spiritStonesHint.*Boss/,'Presentation model must not invent direct Boss loot');

assert.match(bridge,/import\('\.\/modules\/combat-dom-renderer-v1\.js'\)/,'Combat bridge must lazy-load its renderer');
assert.match(bridge,/__TUTIEN_COMBAT_PRESENTATION_MODEL_V1__/,'Combat bridge must consume the canonical snapshot');
assert.match(bridge,/function transientModel\(screen\)/,'Bridge may derive transient visual state only');
assert.match(bridge,/stage\.classList\.contains\('presentation-active'\)/,'Engaged presentation must follow canonical presentation activity');
assert.doesNotMatch(bridge,/metricValue|data-sheet-panel|v110-readiness|v110-boss-plan|huntv2-action-deck|fight\?\.disabled/,'Bridge must not reverse-read canonical Boss/challenge/farm truth from rendered DOM');
assert.doesNotMatch(bridge,/\/api\/|localStorage|sessionStorage/,'Bridge must not call backend actions or author persistence');

assert.match(renderer,/export function renderCombatPresentationV1\(/,'DOM renderer boundary missing');
assert.match(renderer,/function renderChallengeState\(/,'Challenge interaction projection missing');
assert.match(renderer,/data-combat-action-state/,'Challenge interaction state must be exposed to CSS/accessibility');
assert.doesNotMatch(renderer,/FARM SAU PHÁ TẦNG|data-v5-reward/,'Boss briefing must not duplicate Săn Ảo economy/reward copy');
assert.match(renderer,/v5-farm-summary/,'Renderer must reuse existing farm affordance instead of authoring economy truth');
assert.doesNotMatch(renderer,/productionV110|metric-row|data-sheet-panel|v110-readiness|v110-boss-plan/,'Renderer must consume view-model rather than scrape source DOM');
assert.doesNotMatch(renderer,/\/api\/|localStorage|sessionStorage/,'Renderer must remain presentation-only');

assert.match(hunt,/event\.type==='battleEnd'[\s\S]*?showResult\(root,won\?'TRẤN SÁT':'THẤT BẠI'/,'Canonical battleEnd must remain victory/defeat authority');
assert.doesNotMatch(bridge,/battleEnd/,'Bridge must not reinterpret battle outcome');

assert.ok(Buffer.byteLength(css,'utf8')<30000,'Combat target CSS must stay under 30 KB');
assert.ok(Buffer.byteLength(polish,'utf8')<36000,'Combat visual polish CSS must stay under 36 KB');
assert.ok(Buffer.byteLength(camera,'utf8')<18000,'Combat camera CSS must stay under 18 KB');
assert.ok(Buffer.byteLength(info,'utf8')<13000,'Combat information CSS must stay under 13 KB');
assert.ok(Buffer.byteLength(bridge,'utf8')<6*1024,'Combat orchestration bridge must stay under 6 KiB');
assert.ok(Buffer.byteLength(renderer,'utf8')<10*1024,'Combat DOM renderer must stay under 10 KiB');
const importantCount=(css.match(/!important/g)||[]).length;assert.ok(importantCount<=260,`Combat target CSS must stay under 260 !important declarations (${importantCount})`);
console.log(`UI Combat readability target PASS · canonical model → renderer · !important=${importantCount}`);
