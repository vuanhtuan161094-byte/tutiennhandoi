import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const write=(p,s)=>fs.writeFileSync(p,s);

function replaceOnce(source,from,to,label){
  const i=source.indexOf(from);
  if(i<0)throw new Error(`Missing ${label}`);
  if(source.indexOf(from,i+from.length)>=0)throw new Error(`Ambiguous ${label}`);
  return source.slice(0,i)+to+source.slice(i+from.length);
}

let combat=read('modules/hunt-combat-v2.js');
combat=replaceOnce(
  combat,
  '<div class="huntv2-hp enemy" data-max-value="${esc(m.hp||\'\')}">',
  '<div class="huntv2-hp enemy" data-max-display="${esc(m.hp||\'\')}">',
  'enemy formatted HP numeric dataset'
);
combat=combat.replaceAll(
  "const enemyHp=q(root,'.huntv2-hp.enemy')?.dataset?.maxValue||'';",
  "const enemyHp=q(root,'.huntv2-hp.enemy')?.dataset?.maxDisplay||'';"
);

const hpStart=combat.indexOf("function setHp(root,target,pct,current='',max=''){");
const hpEnd=combat.indexOf('\nfunction setPoise(',hpStart);
if(hpStart<0||hpEnd<0)throw new Error('Cannot bound setHp');
const setHp=`function setHp(root,target,pct,current='',max=''){
  const value=clamp(Number(pct)||0,0,100);
  const bar=q(root,target==='enemy'?'#huntv2EnemyHp':'#huntv2PlayerHp');
  const lag=q(root,target==='enemy'?'#huntv2EnemyHpLag':'#huntv2PlayerHpLag');
  const label=q(root,target==='enemy'?'#huntv2EnemyHpText':'#huntv2PlayerHpText');
  if(bar)bar.style.width=\`${'${value}'}%\`;
  const container=bar?.closest?.('.huntv2-vital,.huntv2-hp')||bar?.parentElement;
  const numericMax=Number(container?.dataset?.maxValue||0);
  const hasNumericMax=Number.isFinite(numericMax)&&numericMax>0;
  const storedMaxDisplay=String(container?.dataset?.maxDisplay||'').trim();
  const hasCurrent=current!==''&&current!==undefined&&current!==null;
  const hasMax=max!==''&&max!==undefined&&max!==null;
  const explicitCurrentDisplay=hasCurrent?displayCombatAmount(current):'';
  const explicitMaxDisplay=hasMax?displayCombatAmount(max):'';
  const maxDisplay=explicitMaxDisplay||storedMaxDisplay||(hasNumericMax?displayCombatAmount(numericMax):'');
  if(container&&maxDisplay)container.dataset.maxDisplay=maxDisplay;
  let currentDisplay=explicitCurrentDisplay;
  if(!currentDisplay){
    if(value<=0)currentDisplay='0';
    else if(value>=99.95&&maxDisplay)currentDisplay=maxDisplay;
    else if(hasNumericMax)currentDisplay=displayCombatAmount(numericMax*value/100);
    else currentDisplay=String(label?.dataset?.currentDisplay||'').trim()||'—';
  }
  if(label){label.dataset.currentDisplay=currentDisplay;label.textContent=maxDisplay?\`${'${currentDisplay}'} / ${'${maxDisplay}'}\`:currentDisplay;}
  if(lag){clearTimeout(lag._lagTimer);lag._lagTimer=setTimeout(()=>{if(lag.isConnected)lag.style.width=\`${'${value}'}%\`;},220);}
  const hud=q(root,\`[data-actor-hud="${'${target}'}"]\`); if(hud)hud.classList.toggle('danger',value<=30);
}`;
combat=combat.slice(0,hpStart)+setHp+combat.slice(hpEnd);
if(combat.includes('<div class="huntv2-hp enemy" data-max-value="${esc(m.hp'))throw new Error('Enemy display HP still stored as numeric data-max-value');
if(combat.slice(combat.indexOf('function setHp('),combat.indexOf('\nfunction setPoise(')).includes('Number(max)'))throw new Error('setHp still reverse-parses display max');
write('modules/hunt-combat-v2.js',combat);

let capture=read('qa/visual/capture-combat-runtime.mjs');
const verifiedMarker=`async function verifiedShowcaseState(client) {\n  const state=await showcaseState(client);`;
const verifiedReplacement=`async function verifiedShowcaseState(client) {\n  const state=await showcaseState(client);\n  const hpSemantic=await client.eval(\`(()=>{const bar=document.querySelector('#huntv2EnemyHp');const label=document.querySelector('#huntv2EnemyHpText');const parent=bar?.parentElement;const styled=parseFloat(bar?.style?.width||'');const br=bar?.getBoundingClientRect?.(),pr=parent?.getBoundingClientRect?.();const pct=Number.isFinite(styled)?styled:(br&&pr&&pr.width>0?100*br.width/pr.width:0);return{enemyPct:Number(pct||0),enemyLabel:String(label?.textContent||'').trim()};})()\`);\n  state.hpSemantic=hpSemantic;\n  if(hpSemantic.enemyPct>0.5&&(!hpSemantic.enemyLabel||/^0(?:\\s*\\/|$)/.test(hpSemantic.enemyLabel)||/^—/.test(hpSemantic.enemyLabel)))throw new Error(\`Combat HP semantic mismatch: ${'${JSON.stringify(hpSemantic)}'}\`);`;
capture=replaceOnce(capture,verifiedMarker,verifiedReplacement,'verified showcase HP semantic guard');
write('qa/visual/capture-combat-runtime.mjs',capture);

const hpTest=`import assert from 'node:assert/strict';
import fs from 'node:fs';

const combat=fs.readFileSync('modules/hunt-combat-v2.js','utf8');
const stream=fs.readFileSync('dist/core/hunt-combat-stream.js','utf8');
const capture=fs.readFileSync('qa/visual/capture-combat-runtime.mjs','utf8');

assert.match(combat,/huntv2-hp enemy" data-max-display="\\$\\{esc\\(m\\.hp\\|\\|''\\)\\}"/,'enemy formatted HP must be stored as display authority');
assert.doesNotMatch(combat,/huntv2-hp enemy" data-max-value="\\$\\{esc\\(m\\.hp/,'formatted enemy HP must never be exposed as numeric data-max-value');
const start=combat.indexOf('function setHp('),end=combat.indexOf('\\nfunction setPoise(',start);assert.ok(start>=0&&end>start,'setHp must remain bounded');const body=combat.slice(start,end);
assert.match(body,/dataset\\?\\.maxDisplay/,'setHp must retain formatted max HP separately');
assert.match(body,/displayCombatAmount\\(current\\)/,'setHp must render explicit current HP as display data');
assert.match(body,/displayCombatAmount\\(max\\)/,'setHp must render explicit max HP as display data');
assert.doesNotMatch(body,/Number\\(max\\)/,'setHp must not reverse-parse formatted max HP');
assert.doesNotMatch(body,/Number\\(current\\)/,'setHp must not reverse-parse formatted current HP');
assert.match(combat,/dataset\\?\\.maxDisplay\\|\\|''/,'clean/reset flow must reuse enemy display max instead of numeric coercion');
assert.match(stream,/function hpFromPct\\(maxLog, hpPct\\)/,'combat stream must remain the owner of log-scale HP formatting');
assert.match(stream,/hpCurrent: enemyMax, hpMax: enemyMax/,'battleStart must supply display HP values from the authoritative stream');
assert.match(capture,/Combat HP semantic mismatch/,'visual proof must reject nonzero Boss bar with zero/empty display HP');
console.log('Combat HP display contract PASS · pct bar authority · display label authority · no suffix reverse parsing');
`;
write('qa/tests/ui-combat-hp-display-contract-test.js',hpTest);

let runner=read('qa/runners/v140-frontend-gates.js');
const anchor="'ui-combat-status-authority-test.js','ui-combat-showcase-contract-test.js'";
if(!runner.includes(anchor))throw new Error('Frontend FAST anchor missing');
runner=runner.replace(anchor,"'ui-combat-status-authority-test.js','ui-combat-hp-display-contract-test.js','ui-combat-showcase-contract-test.js'");
write('qa/runners/v140-frontend-gates.js',runner);

console.log('V181 Combat HP display contract migration applied.');
