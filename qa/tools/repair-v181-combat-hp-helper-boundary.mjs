import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const write=(p,s)=>fs.writeFileSync(p,s);

let combat=read('modules/hunt-combat-v2.js');
for(const name of ['setSpirit','setBossPhaseBadge','resetCombatStagingState']){
  if(combat.includes(`function ${name}(`))throw new Error(`${name} unexpectedly already present; abort repair`);
}
const anchor='function setPoise(root,poisePct=100,state=\'ready\',defenseReductionPct=0){';
const pos=combat.indexOf(anchor);if(pos<0)throw new Error('setPoise anchor missing');
const helpers=`function setSpirit(root,pct,current='',max=''){
  const vital=q(root,'.huntv2-vital.spirit'),bar=vital?.querySelector('i'),label=vital?.querySelector('em');if(!bar||!label)return;
  const maxValue=Number(max)||Number(vital?.dataset?.maxValue||0)||0;
  const value=Number.isFinite(Number(pct))?clamp(Number(pct),0,100):(maxValue>0&&Number.isFinite(Number(current))?clamp(Number(current)/maxValue*100,0,100):100);
  const currentValue=Number.isFinite(Number(current))&&current!==''?Math.max(0,Number(current)):(maxValue>0?maxValue*value/100:0);
  bar.style.width=\`${'${value}'}%\`;
  label.textContent=maxValue>0?\`${'${displayCombatAmount(currentValue)}'} / ${'${displayCombatAmount(maxValue)}'}\`:displayCombatAmount(currentValue);
}
function setBossPhaseBadge(root,phase=1,label=''){
  const badge=q(root,'#huntv2BossPhase');if(!badge)return;const p=Math.max(1,Math.min(3,Math.round(Number(phase)||1)));badge.textContent=\`P${'${p}'}\`;badge.dataset.phase=String(p);badge.hidden=p<=1;badge.title=label?\`P${'${p}'} · ${'${label}'}\`:\`Boss Phase ${'${p}'}\`;
}
function resetCombatStagingState(root){
  if(!root?.isConnected)return;
  clearEnemyIntent(root);stopBreakWindow(root);clearStatuses(root);resetCombatIntelligence(root);resetBossState(root);
  const playerVital=q(root,'.huntv2-vital.hp');const playerMax=playerVital?.dataset?.maxValue||'';
  const spiritVital=q(root,'.huntv2-vital.spirit');const spiritMax=spiritVital?.dataset?.maxValue||'';
  const enemyHp=q(root,'.huntv2-hp.enemy')?.dataset?.maxDisplay||'';
  setHp(root,'player',100,playerMax,playerMax);setSpirit(root,100,spiritMax,spiritMax);setHp(root,'enemy',100,enemyHp,enemyHp);setPoise(root,100,'ready');setBossPhaseBadge(root,1);
  const stage=q(root,'#huntV2Stage');if(stage){stage.dataset.bossPhase='1';stage.classList.remove('boss-phase-2','boss-phase-3','boss-phase-transition');}
}

`;
combat=combat.slice(0,pos)+helpers+combat.slice(pos);
write('modules/hunt-combat-v2.js',combat);

let test=read('qa/tests/ui-combat-hp-display-contract-test.js');
const marker="assert.doesNotMatch(body,/Number\\(current\\)/,'setHp must not reverse-parse formatted current HP');";
if(!test.includes(marker))throw new Error('HP test marker missing');
test=test.replace(marker,marker+"\nfor(const helper of ['setSpirit','setBossPhaseBadge','resetCombatStagingState'])assert.match(combat,new RegExp(`function ${helper}\\\\(`),`${helper} must survive HP contract migrations`);");
write('qa/tests/ui-combat-hp-display-contract-test.js',test);
console.log('V181 HP helper boundary repair applied.');
