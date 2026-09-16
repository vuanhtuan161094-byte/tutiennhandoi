import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const write=(p,s)=>fs.writeFileSync(p,s);
const replaceOnce=(text,from,to,label)=>{
  const i=text.indexOf(from);
  if(i<0)throw new Error(`${label} marker missing`);
  if(text.indexOf(from,i+from.length)>=0)throw new Error(`${label} marker duplicated`);
  return text.slice(0,i)+to+text.slice(i+from.length);
};

// 1) Remove runtime geometry patcher from eager bootstrap.
let entry=read('standalone-entry.js');
const safetyBoot=`try{\n  await import(\`./modules/combat-portrait-safety-v1.js?v=\${WIP_CACHE_TOKEN}\`);\n}catch(error){console.warn('[bootstrap] combat portrait safety unavailable:',error?.message||error);}\n`;
entry=replaceOnce(entry,safetyBoot,'','standalone safety bootstrap');
write('standalone-entry.js',entry);

// 2) Make Combat Presentation Architecture own vital display normalization.
let arch=read('modules/combat-presentation-architecture-v140.js');
if(!arch.includes('export function resolveCombatVitalDisplayV1(')){
  const anchor=`const esc=value=>String(value??'').replace(/[&<>'\\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));\n`;
  const helper=`\nexport function resolveCombatVitalDisplayV1({pct=0,current='',max='',storedMaxDisplay='',numericMax=0,formatValue=value=>String(value??'')}={}){\n  const value=Math.max(0,Math.min(100,Number(pct)||0));\n  const format=typeof formatValue==='function'?formatValue:(value=>String(value??''));\n  const hasCurrent=current!==''&&current!==undefined&&current!==null;\n  const hasMax=max!==''&&max!==undefined&&max!==null;\n  const numeric=Number(numericMax);\n  const hasNumeric=Number.isFinite(numeric)&&numeric>0;\n  const explicitCurrentDisplay=hasCurrent?String(format(current)||'').trim():'';\n  const explicitMaxDisplay=hasMax?String(format(max)||'').trim():'';\n  const maxDisplay=explicitMaxDisplay||String(storedMaxDisplay||'').trim()||(hasNumeric?String(format(numeric)||'').trim():'');\n  let currentDisplay=explicitCurrentDisplay;\n  if(!currentDisplay){\n    if(value<=0)currentDisplay='0';\n    else if(value>=99.95&&maxDisplay)currentDisplay=maxDisplay;\n    else if(hasNumeric)currentDisplay=String(format(numeric*value/100)||'').trim();\n    else currentDisplay='—';\n  }\n  return {pct:value,currentDisplay,maxDisplay};\n}\n`;
  arch=replaceOnce(arch,anchor,anchor+helper,'presentation architecture helper anchor');
}
write('modules/combat-presentation-architecture-v140.js',arch);

// 3) Hunt renderer becomes a DOM applier, not a display-value interpreter.
let combat=read('modules/hunt-combat-v2.js');
const importOld=`import {createProductionCombatPresentationRegistry,dispatchCombatPresentationEvent,COMBAT_PRESENTATION_ARCH_VERSION} from './combat-presentation-architecture-v140.js';`;
const importNew=`import {createProductionCombatPresentationRegistry,dispatchCombatPresentationEvent,COMBAT_PRESENTATION_ARCH_VERSION,resolveCombatVitalDisplayV1} from './combat-presentation-architecture-v140.js';`;
if(!combat.includes('resolveCombatVitalDisplayV1'))combat=replaceOnce(combat,importOld,importNew,'combat architecture import');
const setHpStart=combat.indexOf('function setHp(root,target,pct,current=\'\',max=\'\'){');
const setSpiritStart=combat.indexOf('\nfunction setSpirit(',setHpStart);
if(setHpStart<0||setSpiritStart<=setHpStart)throw new Error('setHp function boundary missing');
const setHpNew=`function setHp(root,target,pct,current='',max=''){\n  const bar=q(root,target==='enemy'?'#huntv2EnemyHp':'#huntv2PlayerHp');\n  const lag=q(root,target==='enemy'?'#huntv2EnemyHpLag':'#huntv2PlayerHpLag');\n  const label=q(root,target==='enemy'?'#huntv2EnemyHpText':'#huntv2PlayerHpText');\n  const container=bar?.closest?.('.huntv2-vital,.huntv2-hp')||bar?.parentElement;\n  const vital=resolveCombatVitalDisplayV1({\n    pct,current,max,storedMaxDisplay:container?.dataset?.maxDisplay||'',\n    numericMax:Number(container?.dataset?.maxValue||0),formatValue:displayCombatAmount,\n  });\n  if(bar)bar.style.width=\`${'${vital.pct}'}%\`;\n  if(container&&vital.maxDisplay)container.dataset.maxDisplay=vital.maxDisplay;\n  if(label){label.dataset.currentDisplay=vital.currentDisplay;label.textContent=vital.maxDisplay?\`${'${vital.currentDisplay}'} / ${'${vital.maxDisplay}'}\`:vital.currentDisplay;}\n  if(lag){clearTimeout(lag._lagTimer);lag._lagTimer=setTimeout(()=>{if(lag.isConnected)lag.style.width=\`${'${vital.pct}'}%\`;},220);}\n  const hud=q(root,\`[data-actor-hud="${'${target}'}"]\`);if(hud)hud.classList.toggle('danger',vital.pct<=30);\n}\n`;
combat=combat.slice(0,setHpStart)+setHpNew+combat.slice(setSpiritStart+1);
write('modules/hunt-combat-v2.js',combat);

// 4) Existing final Combat information layer becomes the sole portrait geometry owner.
let css=read('ui-combat-information-v1.css');
css=replaceOnce(css,
  `.huntv2-combat-v8 .huntv2-status-tray.player{left:11px!important;top:calc(var(--v5-player-hud-top) + 64px)!important;bottom:auto!important;max-width:132px!important}`,
  `.huntv2-combat-v8 .huntv2-status-tray.player{left:121px!important;top:calc(var(--v5-player-hud-top) - 35px)!important;bottom:auto!important;max-width:132px!important}`,
  'player status lane');
css=replaceOnce(css,
  `.huntv2-combat-v8 .huntv2-hud-extension-slots{left:11px!important;right:auto!important;top:calc(var(--v5-player-hud-top) + 99px)!important;bottom:auto!important;width:106px!important;height:34px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:4px!important}`,
  `.huntv2-combat-v8 .huntv2-hud-extension-slots{left:11px!important;right:auto!important;top:calc(var(--v5-player-hud-top) - 37px)!important;bottom:auto!important;width:106px!important;height:34px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:4px!important}`,
  'support accessory lane');
const ultimateOwner=`.huntv2-combat-v8 .huntv2-skill-callout:is(.tier-ultimate,.ultimate):not(.enemy){left:10px!important;right:10px!important;width:auto!important;max-width:none!important;transform:none!important}`;
if(!css.includes(ultimateOwner)){
  const ultimateAnchor=`.huntv2-combat-v8 .huntv2-skill-callout:is(.tier-ultimate,.ultimate){bottom:74px!important;max-width:min(74%,286px)!important;min-height:52px!important;padding:6px 9px!important}`;
  css=replaceOnce(css,ultimateAnchor,ultimateAnchor+ultimateOwner,'ultimate safe area');
}
if(Buffer.byteLength(css)>13*1024)css=css.replace(/\/\*[\s\S]*?\*\//g,'');
if(Buffer.byteLength(css)>13*1024)throw new Error(`ui-combat-information-v1.css exceeds 13KB: ${Buffer.byteLength(css)}`);
write('ui-combat-information-v1.css',css);

// 5) Architecture regression guards.
const hpTest=`import assert from 'node:assert/strict';\nimport fs from 'node:fs';\n\nconst combat=fs.readFileSync('modules/hunt-combat-v2.js','utf8');\nconst arch=fs.readFileSync('modules/combat-presentation-architecture-v140.js','utf8');\nconst stream=fs.readFileSync('dist/core/hunt-combat-stream.js','utf8');\nconst capture=fs.readFileSync('qa/visual/capture-combat-runtime.mjs','utf8');\n\nassert.match(combat,/huntv2-hp enemy" data-max-display="\\$\\{esc\\(m\\.hp\\|\\|''\\)\\}"/,'enemy formatted HP must be stored as display authority');\nassert.doesNotMatch(combat,/huntv2-hp enemy" data-max-value="\\$\\{esc\\(m\\.hp/,'formatted enemy HP must never be exposed as numeric data-max-value');\nassert.match(arch,/export function resolveCombatVitalDisplayV1\\(/,'presentation architecture must own vital display normalization');\nconst start=combat.indexOf('function setHp('),end=combat.indexOf('\\nfunction setSpirit(',start);assert.ok(start>=0&&end>start,'setHp must remain bounded');const body=combat.slice(start,end);\nassert.match(body,/resolveCombatVitalDisplayV1\\(/,'setHp must consume the presentation view-model resolver');\nassert.doesNotMatch(body,/Number\\(current\\)|Number\\(max\\)/,'setHp must not reverse-parse display HP');\nassert.match(combat,/dataset\\?\\.maxDisplay\\|\\|''/,'clean/reset flow must reuse enemy display max');\nfor(const helper of ['setSpirit','setBossPhaseBadge','resetCombatStagingState'])assert.match(combat,new RegExp(\`function \\${helper}\\\\(\`),\`\\${helper} must remain present\`);\nassert.match(stream,/function hpFromPct\\(maxLog, hpPct\\)/,'combat stream remains log-scale HP display authority');\nassert.match(stream,/hpCurrent: enemyMax, hpMax: enemyMax/,'battleStart supplies display HP values');\nassert.match(capture,/Combat HP semantic mismatch/,'visual proof must reject nonzero Boss bar with zero\/empty display HP');\nconsole.log('Combat HP display contract PASS · pure view-model resolver · DOM applier only');\n`;
write('qa/tests/ui-combat-hp-display-contract-test.js',hpTest);

const ownershipTest=`import assert from 'node:assert/strict';\nimport fs from 'node:fs';\n\nconst entry=fs.readFileSync('standalone-entry.js','utf8');\nconst css=fs.readFileSync('ui-combat-information-v1.css','utf8');\nconst index=fs.readFileSync('index.html','utf8');\nconst combat=fs.readFileSync('modules/hunt-combat-v2.js','utf8');\nassert.doesNotMatch(entry,/combat-portrait-safety-v1/,'bootstrap must not load a second JS geometry owner');\nassert.equal(fs.existsSync('modules/combat-portrait-safety-v1.js'),false,'runtime geometry patcher must be retired');\nassert.match(css,/huntv2-status-tray\\.player\\{left:121px!important;top:calc\\(var\\(--v5-player-hud-top\\) - 35px\\)/,'player status lane must be CSS-owned above HP HUD');\nassert.match(css,/huntv2-hud-extension-slots\\{left:11px!important;right:auto!important;top:calc\\(var\\(--v5-player-hud-top\\) - 37px\\)/,'support lane must be CSS-owned above HP HUD');\nassert.match(css,/skill-callout:is\\(\\.tier-ultimate,\\.ultimate\\):not\\(\\.enemy\\).*left:10px!important;right:10px!important/,'player ultimate safe area must be CSS-owned');\nconst layers=[...index.matchAll(/href="([^\"]*combat[^\"]*\\.css[^\"]*)"/g)].map(m=>m[1].split('?')[0]);\nassert.deepEqual(layers,['/combat-v2.css','/ui-combat-target-v1.css','/ui-combat-polish-v2.css','/ui-combat-polish-v3.css','/ui-combat-polish-v4.css','/ui-combat-composition.css','/ui-combat-visual-polish.css','/ui-combat-camera-polish.css','/ui-combat-information-v1.css'],'Combat CSS layer count/order is locked; consolidate instead of adding layers');\nassert.ok(Buffer.byteLength(css)<=13*1024,'final Combat information owner stays under 13KB');\nassert.ok(Buffer.byteLength(combat)<=180*1024,'hunt-combat monolith may not grow beyond 180KB; future work must extract/consolidate');\nconsole.log('Combat presentation ownership PASS · one portrait geometry owner · no MutationObserver patcher · layer budget locked');\n`;
write('qa/tests/ui-combat-presentation-ownership-test.js',ownershipTest);

let runner=read('qa/runners/v140-frontend-gates.js');
const gateMarker=`'ui-combat-hp-display-contract-test.js','ui-combat-showcase-contract-test.js'`;
runner=replaceOnce(runner,gateMarker,`'ui-combat-hp-display-contract-test.js','ui-combat-presentation-ownership-test.js','ui-combat-showcase-contract-test.js'`,'frontend fast ownership gate');
write('qa/runners/v140-frontend-gates.js',runner);

if(fs.existsSync('modules/combat-portrait-safety-v1.js'))fs.unlinkSync('modules/combat-portrait-safety-v1.js');
console.log('Combat presentation ownership consolidation applied.');
