import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const app=read('app.js'),runtime=read('standalone-runtime.js'),shell=read('dist/core/client-shell.js'),hybrid=read('modules/hybrid-pixi-runtime-v139.js'),dongfu=read('modules/dongfu-pixi-scene-v139.js'),server=read('web/server.mjs'),historySource=read('dist/core/history.js');
let pass=0;const ok=(name,fn)=>{fn();pass++;console.log(`PASS ${String(pass).padStart(2,'0')} ${name}`)};
ok('client shell exposes active-view patch transport',()=>assert.match(shell,/export function buildWebClientViewPatch\(/));
ok('catalog projection strips inactive category item arrays',()=>{assert.match(shell,/function projectCatalogV129\(/);assert.match(shell,/stripCatalogItemsV129/);});
ok('manual catalog keeps only selected realm full DTO',()=>{assert.match(shell,/manualIndexItemV129/);assert.match(shell,/realmStageIndex/);});
ok('action transport sends active view and subview',()=>{assert.match(app,/clientView:activeTab,clientSubview:activeSubviewV129\(\),clientTransport:'view-patch\.v140'/);});
ok('bootstrap uses view patch instead of unconditional full state',()=>{const boot=app.slice(app.indexOf('async function bootstrap()'),app.indexOf('function resourceQuantity'));assert.match(boot,/\/api\/view\?view=/);assert.doesNotMatch(boot,/request\('\/api\/state'\)/);});
ok('local save generation and writes are coalesced off click path',()=>{assert.match(app,/setTimeout\(writePendingLocalSaveV129,180\)/);assert.match(app,/scheduleRuntimeSaveV129/);assert.match(app,/request\('\/api\/save'\)/);assert.match(app,/pagehide',flushRuntimeSaveSyncV129/);assert.match(runtime,/pathname==='\/api\/save'/);assert.match(runtime,/saveDirty:true/);});
ok('long-session history reads avoid cloning the full log for counters and tails',()=>{const history=read('dist/core/history.js'),session=read('dist/core/session.js');assert.match(history,/size\(\)/);assert.match(history,/sliceFrom\(/);assert.match(history,/countTag\(/);assert.doesNotMatch(session,/historyValue\.all\(\)\.slice\(/);});
ok('journal top-N keeps a bounded candidate window instead of sorting lifetime history',()=>{assert.match(historySource,/const best = \[\]/);assert.match(historySource,/best\.length < n/);assert.doesNotMatch(historySource,/\[\.\.\.this\.records\]\s*\.sort/);});
ok('show-all replay suppresses transient FX/timer churn',()=>{assert.match(app,/applyBattleReplayEvent\(evt,\{animate=true,render=true\}/);assert.match(app,/applyBattleReplayEvent\(evt,\{animate:false,render:false\}\)/);});
ok('dynamic binding builds one data-attribute index',()=>{assert.match(app,/bindDataIndexV129=new Map\(\)/);assert.match(app,/exactDataSelectorV129/);const start=app.indexOf('function bindDynamic(){'),end=app.indexOf('async function hydrateViewV129',start);const body=app.slice(start,end);assert.ok((body.match(/content\.querySelectorAll\(/g)||[]).length<=2,'bindDynamic must not rescan content per handler');});
ok('inventory long-press uses delegated pointer lifecycle instead of per-card listeners',()=>{assert.match(app,/const itemLongPressV129=/);assert.match(app,/content\.addEventListener\('pointerdown'/);const start=app.indexOf('function bindDynamic(){'),end=app.indexOf('async function hydrateViewV129',start);const body=app.slice(start,end);assert.doesNotMatch(body,/\[data-item-long\].*addEventListener\('pointerdown'/s);});
ok('content renderer skips identical full DOM replacement',()=>{assert.match(app,/renderedContentHtmlV129/);assert.match(app,/const needsDomReplace=/);});
ok('UI continuity restoration is coalesced and skipped for cached DOM',()=>{assert.match(app,/cancelUiContinuityRestoreV129/);assert.match(app,/if\(!domReplaced\)return/);assert.doesNotMatch(app,/setTimeout\(apply,80\)/);assert.doesNotMatch(app,/setTimeout\(apply,220\)/);});
ok('inventory DOM is rendered in bounded batches',()=>{assert.match(app,/visibleLimit:72/);assert.match(app,/visibleFiltered=filtered\.slice\(0,visibleLimit\)/);assert.match(app,/data-inventory-more/);});
ok('standalone local API json path avoids Response stringify-parse loop',()=>{const block=runtime.slice(runtime.indexOf('function jsonResponse'),runtime.indexOf('function decodeBody'));assert.match(block,/async json\(\)\{return value;\}/);assert.doesNotMatch(block,/new Response\(JSON\.stringify/);});
ok('hybrid Pixi adapts resolution and max FPS on low-end devices',()=>{assert.match(hybrid,/lowEndDevice/);assert.match(hybrid,/app\.ticker\.maxFPS/);assert.match(hybrid,/resolutionCap/);});
ok('DongFu Pixi is capped below 60 FPS for ambient scene',()=>{assert.match(dongfu,/app\.ticker\.maxFPS=.*45/);});
ok('LAN static server uses gzip and content-hash ETag revalidation for heavy assets',()=>{assert.match(server,/gzipSync/);assert.match(server,/createHash\('sha256'\)/);assert.match(server,/contentHash/);assert.match(server,/sha256-/);assert.match(server,/if-none-match/);assert.match(server,/content-encoding':'gzip'/);assert.match(server,/must-revalidate/);assert.match(server,/vary':'Accept-Encoding'/);assert.doesNotMatch(server,/const etag = `W\\"\$\{s\.size/);});

// Runtime payload regression: use the same in-browser standalone transport contract in Node.
globalThis.location={protocol:'http:',href:'http://127.0.0.1/',origin:'http://127.0.0.1'};
globalThis.document={baseURI:'http://127.0.0.1/'};
globalThis.CustomEvent=class CustomEvent{constructor(type,init){this.type=type;this.detail=init?.detail}};
globalThis.dispatchEvent=()=>true;
await import('../../standalone-runtime.js');
async function payloadBytes(view,subview=''){
  const response=await fetch(`/api/view?view=${encodeURIComponent(view)}&subview=${encodeURIComponent(subview)}`);
  const value=await response.json();
  return Buffer.byteLength(JSON.stringify(value));
}
const runtimeChecks=[['PvP view stays below 100 KiB','pvp','',100],['DongFu home stays below 120 KiB','dongfu','home',120],['Dungeon hub stays below 120 KiB','dungeons','home',120],['manual Collection stage stays below 160 KiB','collection','manual',160]];
for(const [name,view,subview,limitKiB] of runtimeChecks){const bytes=await payloadBytes(view,subview);assert.ok(bytes<limitKiB*1024,`${name}: ${(bytes/1024).toFixed(1)} KiB`);pass++;console.log(`PASS ${String(pass).padStart(2,'0')} ${name} · ${(bytes/1024).toFixed(1)} KiB`);}
console.log(`V129 PERFORMANCE ARCHITECTURE: ${pass}/${pass} PASS`);
process.exit(0);
