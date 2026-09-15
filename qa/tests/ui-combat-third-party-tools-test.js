import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const bridge=read('ui-combat-target-v1.js');
const loader=read('modules/third-party-runtime-v1.js');
const anime=read('modules/combat-motion-anime-v1.js');
const devTools=read('modules/dev-third-party-tools-v1.js');
const index=read('index.html');
const devLauncher=read('CHOI_UI_DEV.cmd');

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
assert.doesNotMatch(devTools,/fetch\s*\(|localStorage\.setItem|sessionStorage\.setItem|\/api\//,'DEV tuning must remain presentation-only');

assert.match(index,/ui-combat-target-v1\.js\?v=combat-third-party-tools-v2-20260915/,'combat bridge cache token must expose the integration');
assert.doesNotMatch(index,/animejs@|stats\.js@|lil-gui@/,'third-party libraries must not be eagerly loaded from index.html');
assert.match(devLauncher,/\?dev=1&tools=1&anime=1&tab=hunt/,'UI DEV launcher must explicitly enable integrated tuning tools');

console.log('Combat third-party tools contract PASS · Anime.js opt-in · stats.js/lil-gui DEV-only · no eager production load');
