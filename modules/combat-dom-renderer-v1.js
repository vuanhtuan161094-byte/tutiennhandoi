/* Combat DOM Renderer V1 — presentation-only DOM applier.
   Consumes the canonical Combat Presentation Model and transient visual state.
   No gameplay decisions, backend calls, save writes, or source-DOM interpretation live here. */
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const elementLabel=value=>({water:'Thủy',fire:'Hỏa',wood:'Mộc',metal:'Kim',earth:'Thổ'})[String(value||'').toLowerCase()]||clean(value);

function setText(node,value){if(!node)return;const next=clean(value);if(node.textContent!==next)node.textContent=next;}

function ensureBossBriefing(stage){
  let briefing=stage.querySelector('.v5-boss-briefing');
  if(briefing)return briefing;
  briefing=document.createElement('section');
  briefing.className='v5-boss-briefing';
  briefing.setAttribute('aria-label','Thông tin khiêu chiến Boss');
  briefing.innerHTML=`
    <header class="v5-boss-briefing-head">
      <div><small>THỦ LĨNH ĐANG CHỜ</small><strong data-v5-boss-name>Boss</strong><span data-v5-boss-meta></span></div>
      <button type="button" class="v5-boss-detail" data-sheet-open="monster" aria-label="Mở hồ sơ Boss" title="Hồ sơ Boss">i</button>
    </header>
    <div class="v5-boss-briefing-signals">
      <button type="button" class="v5-boss-readiness" data-sheet-open="monster"><small>ĐỘ NGUY HIỂM</small><strong data-v5-readiness>Đang rà soát</strong><span data-v5-readiness-detail></span></button>
      <button type="button" class="v5-boss-reward" data-sheet-open="loot"><small>FARM SAU PHÁ TẦNG</small><strong data-v5-reward>Mở bãi Săn Ảo tầng này</strong><span data-v5-reward-detail>Reward tích theo thời gian</span></button>
    </div>
    <button type="button" class="v5-boss-mechanic-summary" data-sheet-open="monster"><span data-v5-mechanic>Dị tượng chưa rõ</span><b data-v5-counter></b></button>
    <div class="v5-boss-blocker" data-v5-blocker hidden><strong>CHƯA THỂ KHIÊU CHIẾN</strong><span></span></div>`;
  stage.appendChild(briefing);
  return briefing;
}

function ensureActiveMechanic(enemyHud){
  let chip=enemyHud.querySelector('.v5-boss-mechanic-compact');
  if(chip)return chip;
  chip=document.createElement('button');chip.type='button';chip.className='v5-boss-mechanic-compact';chip.setAttribute('data-sheet-open','monster');chip.setAttribute('aria-label','Xem dị tượng và đối sách Boss');chip.innerHTML='<small>DỊ TƯỢNG</small><strong></strong><span></span>';enemyHud.appendChild(chip);return chip;
}

function renderEnemyContext(enemyHud,model={}){
  const enemy=model.enemy||{};
  let context=enemyHud.querySelector('.ui-combat-enemy-context');
  if(!context){context=document.createElement('div');context.className='ui-combat-enemy-context';context.setAttribute('aria-label','Thông tin yêu thú');enemyHud.appendChild(context);}
  const signature=[enemy.id,enemy.name,enemy.level,enemy.isBoss?1:0,enemy.element].join('|');
  if(context.dataset.signature===signature)return;
  context.dataset.signature=signature;context.replaceChildren();
  const level=document.createElement('span');level.textContent=`Lv.${Math.max(1,Number(enemy.level)||1)}`;context.appendChild(level);
  if(enemy.isBoss){const boss=document.createElement('span');boss.className='boss';boss.textContent='BOSS';context.appendChild(boss);}
  const element=elementLabel(enemy.stageElement||enemy.element);if(element){const chip=document.createElement('span');chip.textContent=element;context.appendChild(chip);}
  if(enemy.name)enemyHud.setAttribute('aria-label',`${clean(enemy.name)}, cấp ${Math.max(1,Number(enemy.level)||1)}${enemy.isBoss?', Boss':''}${element?`, hệ ${element}`:''}`);
}

function renderBoss(screen,stage,enemyHud,model={}){
  const boss=model.boss||{};const challenge=model.challenge||{};const farm=model.farm||{};
  screen.classList.toggle('v5-boss-context-ready',Boolean(boss.isBoss));
  screen.classList.toggle('v5-farm-ready',Boolean(farm.available));
  const farmButton=screen.querySelector('.huntv2-context-button.loot');
  farmButton?.classList.toggle('v5-farm-summary',Boolean(farm.available));
  if(!boss.isBoss){stage.querySelector('.v5-boss-briefing')?.remove();enemyHud.querySelector('.v5-boss-mechanic-compact')?.remove();return;}

  const briefing=ensureBossBriefing(stage);
  const enemy=model.enemy||{};
  const meta=[`Lv.${Math.max(1,Number(enemy.level)||1)}`,enemy.grade&&String(enemy.grade).toLowerCase()!=='boss'?enemy.grade:'',elementLabel(enemy.element),challenge.floor?`Boss tầng ${challenge.floor}`:''].filter(Boolean).join(' · ');
  setText(briefing.querySelector('[data-v5-boss-name]'),enemy.name||'Thủ Lĩnh');setText(briefing.querySelector('[data-v5-boss-meta]'),meta);

  const readiness=boss.readiness||{};const readinessButton=briefing.querySelector('.v5-boss-readiness');readinessButton.hidden=!readiness.label;setText(briefing.querySelector('[data-v5-readiness]'),readiness.label||'Đang rà soát');setText(briefing.querySelector('[data-v5-readiness-detail]'),readiness.description||'');
  const mechanic=boss.mechanic||null;const mechanicButton=briefing.querySelector('.v5-boss-mechanic-summary');mechanicButton.hidden=!mechanic?.name&&!mechanic?.counterSummary;setText(briefing.querySelector('[data-v5-mechanic]'),mechanic?.name||'Đối sách Boss');setText(briefing.querySelector('[data-v5-counter]'),mechanic?.counterSummary||'');
  setText(briefing.querySelector('[data-v5-reward]'),farm.label||'Mở bãi Săn Ảo tầng này');setText(briefing.querySelector('[data-v5-reward-detail]'),farm.detail||'Reward tích theo thời gian');

  const blocker=briefing.querySelector('[data-v5-blocker]');blocker.hidden=!challenge.blocked;setText(blocker.querySelector('span'),challenge.blocked?challenge.blockedReason:'');briefing.classList.toggle('blocked',Boolean(challenge.blocked));
  const mechanicChip=ensureActiveMechanic(enemyHud);mechanicChip.hidden=!mechanic?.name;setText(mechanicChip.querySelector('strong'),mechanic?.name||'');setText(mechanicChip.querySelector('span'),mechanic?.counterSummary||'');
}

function renderActivity(screen,transient={}){screen.classList.toggle('v5-critical-signal-active',Boolean(transient.criticalSignal));screen.classList.toggle('v5-combat-engaged',Boolean(transient.engaged));}

export function renderCombatPresentationV1(screen,model,transient={}){
  if(!screen?.isConnected||!model)return false;
  const stage=screen.querySelector('#huntV2Stage, .huntv2-stage');const enemyHud=screen.querySelector('.huntv2-enemy-hud');if(!stage||!enemyHud)return false;
  renderActivity(screen,transient);renderEnemyContext(enemyHud,model);renderBoss(screen,stage,enemyHud,model);screen.dataset.combatPresentationModel=String(model.version||'');screen.dataset.combatPresentationSignature=String(model.signature||'');return true;
}
