import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const write=(p,s)=>fs.writeFileSync(p,s);
const replaceOnce=(text,from,to,label)=>{
  const i=text.indexOf(from);
  if(i<0)throw new Error(`${label} marker missing`);
  if(text.indexOf(from,i+from.length)>=0)throw new Error(`${label} marker duplicated`);
  return text.slice(0,i)+to+text.slice(i+from.length);
};

// Retire the JS-after-CSS geometry owner. V168 gameplay/runtime authority is untouched.
let entry=read('standalone-entry.js');
const safetyBoot=`try{\n  await import(\`./modules/combat-portrait-safety-v1.js?v=\${WIP_CACHE_TOKEN}\`);\n}catch(error){console.warn('[bootstrap] combat portrait safety unavailable:',error?.message||error);}\n`;
entry=replaceOnce(entry,safetyBoot,'','standalone portrait safety bootstrap');
write('standalone-entry.js',entry);

// Preserve the accepted active-combat clearances in the existing final portrait CSS owner.
let css=read('ui-combat-information-v1.css');
css=replaceOnce(css,
  `.huntv2-combat-v8 .huntv2-status-tray.player{left:11px!important;top:calc(var(--v5-player-hud-top) + 64px)!important;bottom:auto!important;max-width:132px!important}`,
  `.huntv2-combat-v8 .huntv2-status-tray.player{left:121px!important;top:calc(var(--v5-player-hud-top) - 35px)!important;bottom:auto!important;max-width:132px!important}`,
  'player status lane');
css=replaceOnce(css,
  `.huntv2-combat-v8 .huntv2-hud-extension-slots{left:11px!important;right:auto!important;top:calc(var(--v5-player-hud-top) + 99px)!important;bottom:auto!important;width:106px!important;height:34px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:4px!important}`,
  `.huntv2-combat-v8 .huntv2-hud-extension-slots{left:11px!important;right:auto!important;top:calc(var(--v5-player-hud-top) - 37px)!important;bottom:auto!important;width:106px!important;height:34px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:4px!important}`,
  'support accessory lane');
const ultimateBase=`.huntv2-combat-v8 .huntv2-skill-callout:is(.tier-ultimate,.ultimate){bottom:74px!important;max-width:min(74%,286px)!important;min-height:52px!important;padding:6px 9px!important}`;
const ultimateSafe=`.huntv2-combat-v8 .huntv2-skill-callout:is(.tier-ultimate,.ultimate):not(.enemy){left:10px!important;right:10px!important;width:auto!important;max-width:none!important;transform:none!important}`;
if(!css.includes(ultimateSafe))css=replaceOnce(css,ultimateBase,ultimateBase+ultimateSafe,'ultimate safe area');
// Keep the existing hard size budget; comments are disposable, declarations are not.
if(Buffer.byteLength(css)>13*1024)css=css.replace(/\/\*[\s\S]*?\*\//g,'');
if(Buffer.byteLength(css)>13*1024)throw new Error(`ui-combat-information-v1.css exceeds 13KB: ${Buffer.byteLength(css)}`);
write('ui-combat-information-v1.css',css);

if(fs.existsSync('modules/combat-portrait-safety-v1.js'))fs.unlinkSync('modules/combat-portrait-safety-v1.js');

const ownershipTest=`import assert from 'node:assert/strict';
import fs from 'node:fs';

const entry=fs.readFileSync('standalone-entry.js','utf8');
const css=fs.readFileSync('ui-combat-information-v1.css','utf8');
const index=fs.readFileSync('index.html','utf8');
const combat=fs.readFileSync('modules/hunt-combat-v2.js','utf8');
assert.doesNotMatch(entry,/combat-portrait-safety-v1/,'bootstrap must not load a second JS geometry owner');
assert.equal(fs.existsSync('modules/combat-portrait-safety-v1.js'),false,'runtime MutationObserver geometry patcher must be retired');
assert.match(css,/huntv2-status-tray\\.player\\{left:121px!important;top:calc\\(var\\(--v5-player-hud-top\\) - 35px\\)/,'player status lane must be owned by final portrait CSS');
assert.match(css,/huntv2-hud-extension-slots\\{left:11px!important;right:auto!important;top:calc\\(var\\(--v5-player-hud-top\\) - 37px\\)/,'support lane must be owned by final portrait CSS');
assert.match(css,/skill-callout:is\\(\\.tier-ultimate,\\.ultimate\\):not\\(\\.enemy\\)\\{left:10px!important;right:10px!important/,'ultimate safe area must be owned by final portrait CSS');
const layers=[...index.matchAll(/href="([^\"]*combat[^\"]*\\.css[^\"]*)"/g)].map(m=>m[1].split('?')[0]);
assert.deepEqual(layers,['/combat-v2.css','/ui-combat-target-v1.css','/ui-combat-polish-v2.css','/ui-combat-polish-v3.css','/ui-combat-polish-v4.css','/ui-combat-composition.css','/ui-combat-visual-polish.css','/ui-combat-camera-polish.css','/ui-combat-information-v1.css'],'Combat CSS layer count/order is locked; consolidate instead of adding layers');
assert.ok(Buffer.byteLength(css)<=13*1024,'final portrait CSS owner must stay within 13KB');
assert.ok(Buffer.byteLength(combat)<=180*1024,'hunt-combat-v2.js may not grow beyond 180KB; future work must extract responsibilities');
console.log('Combat presentation ownership PASS · CSS owns portrait geometry · no MutationObserver geometry patcher');
`;
write('qa/tests/ui-combat-presentation-ownership-test.js',ownershipTest);

let runner=read('qa/runners/v140-frontend-gates.js');
const marker=`'ui-combat-hp-display-contract-test.js','ui-combat-showcase-contract-test.js'`;
if(!runner.includes('ui-combat-presentation-ownership-test.js')){
  runner=replaceOnce(runner,marker,`'ui-combat-hp-display-contract-test.js','ui-combat-presentation-ownership-test.js','ui-combat-showcase-contract-test.js'`,'frontend fast ownership gate');
}
write('qa/runners/v140-frontend-gates.js',runner);
console.log('Combat presentation geometry ownership consolidation V2 applied.');
