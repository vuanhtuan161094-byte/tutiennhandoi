import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const stripComments=source=>source.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
const bridge=read('ui-combat-target-v1.js');
const loader=read('modules/third-party-runtime-v1.js');
const anime=read('modules/combat-motion-anime-v1.js');
const devTools=read('modules/dev-third-party-tools-v1.js');
const devToolsCode=stripComments(devTools);
const layoutEditor=read('modules/combat-layout-editor-v1.js');
const layoutEditorCode=stripComments(layoutEditor);
const harness=read('modules/dev-test-harness-v1.js');
const entry=read('standalone-entry.js');
const index=read('index.html');
const devLauncher=read('tools/web/CHOI_UI_DEV.cmd');

assert.match(bridge,/const devMode = params\.get\('dev'\) === '1'/,'combat bridge must identify DEV mode');
assert.match(bridge,/const toolsOptIn = params\.get\('tools'\) === '1' \|\| params\.get\('devtools'\) === '1'/,'external DEV tools must require explicit opt-in');
assert.match(bridge,/const animeOptIn = params\.get\('anime'\) === '1' \|\| \(devMode && toolsOptIn\)/,'Anime.js must stay explicit opt-in');
assert.match(bridge,/if \(devMode && toolsOptIn\)/,'stats.js/lil-gui must not load for ordinary DEV visual proof');
assert.match(bridge,/import\('\.\/modules\/combat-motion-anime-v1\.js'\)/,'Anime.js presentation enhancer must lazy-load');
assert.match(bridge,/import\('\.\/modules\/dev-third-party-tools-v1\.js'\)/,'DEV stats/lil-gui tools must lazy-load');
assert.doesNotMatch(bridge,/^import\s/m,'classic combat bridge must not add eager module imports');

assert.match(loader,/version:'4\.5\.0'/,'Anime.js version must be pinned');
assert.match(loader,/animejs@4\.5\.0/,'Anime.js CDN path must be version pinned');
assert.match(loader,/version:'0\.17\.0'/,'stats.js version must be pinned');
assert.match(loader,/stats\.js@0\.17\.0/,'stats.js CDN path must be version pinned');
assert.match(loader,/version:'0\.21\.0'/,'lil-gui version must be pinned');
assert.match(loader,/lil-gui@0\.21\.0/,'lil-gui CDN path must be version pinned');
assert.match(loader,/license:'MIT'/,'third-party specs must record license');
assert.match(loader,/export async function loadAnimeJsV1/,'Anime.js loader missing');
assert.match(loader,/export async function loadStatsJsV1/,'stats.js loader missing');
assert.match(loader,/export async function loadLilGuiV1/,'lil-gui loader missing');

assert.match(anime,/prefers-reduced-motion: reduce/,'Anime.js motion must respect reduced motion');
assert.match(anime,/\.huntv2-float\.show/,'Anime.js must enhance existing damage presentation');
assert.match(anime,/\.huntv2-skill-callout\.show/,'Anime.js must enhance existing skill-name presentation');
assert.match(anime,/\.huntv2-status-tray/,'Anime.js must support status presentation');
assert.doesNotMatch(anime,/fetch\s*\(|localStorage\.setItem|sessionStorage\.setItem|\/api\//,'Anime presentation layer must not mutate gameplay/save or call backend');

assert.match(devTools,/if\(!isDev\(\)\)return \{ok:false,reason:'dev-only'\}/,'stats.js/lil-gui module must reject non-DEV execution');
assert.match(devTools,/loadStatsJsV1\(\)/,'DEV tools must load stats.js');
assert.match(devTools,/loadLilGuiV1\(\)/,'DEV tools must load lil-gui');
assert.match(devTools,/Combat DEV Tuning/,'lil-gui combat tuning panel missing');
assert.match(devTools,/damagePunch/,'damage motion tuning missing');
assert.match(devTools,/skillPunch/,'skill-name motion tuning missing');
assert.match(devTools,/import\('\.\/dev-test-harness-v1\.js'\)/,'DEV Test Harness must stay behind the DEV tools lazy boundary');
assert.match(devTools,/combat-layout-editor-v1\.js/,'Combat Layout Editor must stay behind the DEV tools lazy boundary');
assert.doesNotMatch(devToolsCode,/fetch\s*\(|localStorage\.setItem|sessionStorage\.setItem|\/api\//,'motion tuning owner must remain presentation-only');

assert.match(layoutEditor,/tutien\.dev\.combat-layout-draft\.v1/,'Layout Editor draft storage must use an isolated DEV key');
assert.match(layoutEditor,/dev-tools-only/,'Layout Editor must reject execution without DEV + tools opt-in');
assert.match(layoutEditor,/\.huntv2-actor\.player/,'Layout Editor must expose Player geometry');
assert.match(layoutEditor,/\.huntv2-actor\.enemy/,'Layout Editor must expose Boss\/Enemy geometry');
assert.match(layoutEditor,/\.huntv2-player-hud/,'Layout Editor must expose Player HUD geometry');
assert.match(layoutEditor,/\.huntv2-enemy-hud/,'Layout Editor must expose Boss HUD geometry');
assert.match(layoutEditor,/setProperty\('translate'/,'Layout Editor must preview position without replacing transform choreography');
assert.match(layoutEditor,/__TUTIEN_COMBAT_LAYOUT_PREVIEW_SYNC__/,'HUD Tuner must request live Pixi re-layout after geometry changes');
assert.match(layoutEditor,/navigator\.clipboard\.writeText/,'Layout Editor must export copyable JSON');
assert.match(layoutEditor,/combat-layout-\$\{data\.viewport\.width\}x\$\{data\.viewport\.height\}\.json/,'Layout Editor must export a viewport-labelled JSON file');
assert.doesNotMatch(layoutEditorCode,/fetch\s*\(|\/api\//,'Layout Editor must never call gameplay or DEV action APIs');

assert.match(harness,/p\.get\('dev'\)==='1'/,'Test Harness must require DEV mode');
assert.match(harness,/p\.get\('tools'\)==='1'/,'Test Harness must require tools opt-in');
assert.match(harness,/\/api\/dev\/action/,'Test Harness must use isolated DEV action transport');
assert.match(harness,/\/api\/dev\/new/,'Test Harness must expose isolated DEV reset');
assert.match(harness,/\/api\/dev\/save/,'Test Harness must persist isolated DEV fixtures');
assert.match(harness,/devSandboxSyncSave/,'Harness must sync the current sandbox before cumulative DEV actions');
assert.match(harness,/devSandboxPreset/,'Boss/sandbox preset missing');
assert.match(harness,/devSkillLabV12317/,'full-system Skill Lab preset missing');
assert.match(harness,/BEFORE_FIXTURE_KEY/,'Harness must provide a fixture rollback snapshot');
assert.doesNotMatch(harness,/['"]\/api\/(?:action|save|new|state)/,'Test Harness must never call production mutation/state endpoints directly');

assert.doesNotMatch(entry,/combat-portrait-safety-v1\.js/,'retired portrait geometry shim must not load with the production presentation shell');
assert.equal(fs.existsSync(path.join(root,'modules/combat-portrait-safety-v1.js')),false,'retired portrait geometry shim must be removed from the repository once CSS owns portrait geometry');

assert.match(index,/ui-combat-target-v1\.js\?v=combat-information-v7-scoped-lifecycle-20260917/,'combat bridge cache token must expose the scoped presentation lifecycle integration');
assert.doesNotMatch(index,/animejs@|stats\.js@|lil-gui@/,'third-party libraries must not be eagerly loaded from index.html');
assert.match(devLauncher,/for %%P in \(4273 4274 4275 4276 4277 4278 4279 4280\)/,'UI DEV launcher must use an origin isolated from normal-play ports');
assert.match(devLauncher,/\?dev=1&tools=1&anime=1&tab=hunt/,'UI DEV launcher must explicitly enable integrated tuning tools');

console.log('Combat tools contract PASS · portrait geometry shim removed · isolated DEV Test Harness · no eager third-party production load');
