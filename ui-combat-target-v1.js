/* Combat Readability Target V1 — DOM presentation bridge + optional motion/dev tools.
   Reads already-rendered/backend-authored combat context; never mutates gameplay state. */
(() => {
  const elementLabel = value => ({water:'Thủy',fire:'Hỏa',wood:'Mộc',metal:'Kim',earth:'Thổ'})[String(value || '').toLowerCase()] || '';
  const params = (() => { try { return new URLSearchParams(location.search); } catch { return new URLSearchParams(); } })();
  const devMode = params.get('dev') === '1' || globalThis.__TUTIEN_DEV_FORCE__ === true;
  const toolsOptIn = params.get('tools') === '1' || params.get('devtools') === '1';
  const animeOptIn = params.get('anime') === '1' || (devMode && toolsOptIn);
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
  const normalized = value => clean(value).toLocaleLowerCase('vi');

  function bootPresentationTools() {
    if (animeOptIn) {
      import('./modules/combat-motion-anime-v1.js')
        .then(mod => mod.initCombatAnimeMotionV1?.())
        .catch(() => { try { document.body.dataset.combatMotionEngine = 'css-fallback'; } catch {} });
    }
    if (devMode && toolsOptIn) {
      import('./modules/dev-third-party-tools-v1.js')
        .then(mod => mod.initDevThirdPartyToolsV1?.())
        .catch(() => { try { document.body.dataset.devThirdPartyTools = 'fallback'; } catch {} });
    }
  }

  function setText(node, value) {
    if (!node) return;
    const next = clean(value);
    if (node.textContent !== next) node.textContent = next;
  }

  function metricValue(panel, label) {
    if (!panel) return '';
    const wanted = normalized(label);
    const rows = panel.querySelectorAll('.metric-row');
    for (const row of rows) {
      if (normalized(row.querySelector('span')?.textContent) === wanted) return clean(row.querySelector('strong')?.textContent);
    }
    return '';
  }

  function ensureBossBriefing(stage) {
    let briefing = stage.querySelector('.v5-boss-briefing');
    if (briefing) return briefing;
    briefing = document.createElement('section');
    briefing.className = 'v5-boss-briefing';
    briefing.setAttribute('aria-label', 'Thông tin khiêu chiến Boss');
    briefing.innerHTML = `
      <header class="v5-boss-briefing-head">
        <div>
          <small>THỦ LĨNH ĐANG CHỜ</small>
          <strong data-v5-boss-name>Boss</strong>
          <span data-v5-boss-meta></span>
        </div>
        <button type="button" class="v5-boss-detail" data-sheet-open="monster" aria-label="Mở hồ sơ Boss" title="Hồ sơ Boss">i</button>
      </header>
      <div class="v5-boss-briefing-signals">
        <button type="button" class="v5-boss-readiness" data-sheet-open="monster">
          <small>ĐỘ NGUY HIỂM</small>
          <strong data-v5-readiness>Đang rà soát</strong>
          <span data-v5-readiness-detail></span>
        </button>
        <button type="button" class="v5-boss-reward" data-sheet-open="loot">
          <small>FARM SAU PHÁ TẦNG</small>
          <strong data-v5-reward>Mở bãi Săn Ảo tầng này</strong>
          <span data-v5-reward-detail>Reward tích theo thời gian</span>
        </button>
      </div>
      <button type="button" class="v5-boss-mechanic-summary" data-sheet-open="monster">
        <span data-v5-mechanic>Dị tượng chưa rõ</span>
        <b data-v5-counter></b>
      </button>
      <div class="v5-boss-blocker" data-v5-blocker hidden>
        <strong>CHƯA THỂ KHIÊU CHIẾN</strong>
        <span></span>
      </div>`;
    stage.appendChild(briefing);
    return briefing;
  }

  function ensureActiveMechanic(enemyHud) {
    let chip = enemyHud.querySelector('.v5-boss-mechanic-compact');
    if (chip) return chip;
    chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'v5-boss-mechanic-compact';
    chip.setAttribute('data-sheet-open', 'monster');
    chip.setAttribute('aria-label', 'Xem dị tượng và đối sách Boss');
    chip.innerHTML = '<small>DỊ TƯỢNG</small><strong></strong><span></span>';
    enemyHud.appendChild(chip);
    return chip;
  }

  function syncBossInformation(screen, stage, enemyHud) {
    const monsterSheet = screen.querySelector('[data-sheet-panel="monster"]') || document.querySelector('[data-sheet-panel="monster"]');
    const actionDeck = screen.querySelector('.huntv2-action-deck');
    const fight = actionDeck?.querySelector('[data-endless-fight]');
    const isBoss = enemyHud.classList.contains('boss') || Boolean(monsterSheet && fight);

    screen.classList.toggle('v5-boss-context-ready', isBoss);
    if (!isBoss) {
      stage.querySelector('.v5-boss-briefing')?.remove();
      enemyHud.querySelector('.v5-boss-mechanic-compact')?.remove();
      return;
    }

    const briefing = ensureBossBriefing(stage);
    const name = clean(stage.dataset.monsterName) || metricValue(monsterSheet, 'Tên') || clean(enemyHud.querySelector('strong')?.textContent) || 'Thủ Lĩnh';
    const levelMetric = metricValue(monsterSheet, 'Cấp');
    const level = levelMetric || `Lv.${Math.max(1, Number(stage.dataset.monsterLevel || 1))}`;
    const grade = metricValue(monsterSheet, 'Phẩm');
    const element = metricValue(monsterSheet, 'Ngũ Hành') || elementLabel(stage.dataset.env);
    const floorMatch = clean(fight?.textContent).match(/Boss tầng\s*(\d+)/i);
    const meta = [level, grade && normalized(grade) !== 'boss' ? grade : '', element, floorMatch ? `Boss tầng ${floorMatch[1]}` : ''].filter(Boolean).join(' · ');

    setText(briefing.querySelector('[data-v5-boss-name]'), name);
    setText(briefing.querySelector('[data-v5-boss-meta]'), meta);

    const readiness = clean(monsterSheet?.querySelector('.v110-readiness strong')?.textContent);
    const readinessDetail = clean(monsterSheet?.querySelector('.v110-readiness > span')?.textContent || monsterSheet?.querySelector('.v110-readiness span')?.textContent);
    const readinessButton = briefing.querySelector('.v5-boss-readiness');
    readinessButton.hidden = !readiness;
    setText(briefing.querySelector('[data-v5-readiness]'), readiness || 'Đang rà soát');
    setText(briefing.querySelector('[data-v5-readiness-detail]'), readinessDetail);

    const mechanic = clean(monsterSheet?.querySelector('.v110-boss-plan header strong')?.textContent || monsterSheet?.querySelector('.huntv2-boss-mechanic strong')?.textContent);
    const counterRows = [...(monsterSheet?.querySelectorAll('.v110-counter') || [])];
    const covered = counterRows.filter(row => row.classList.contains('covered')).length;
    const coverage = clean(monsterSheet?.querySelector('.v110-boss-plan header b')?.textContent).replace(/counter/i, 'đối sách');
    const counterSummary = counterRows.length ? `${covered}/${counterRows.length} đối sách` : coverage;
    const mechanicButton = briefing.querySelector('.v5-boss-mechanic-summary');
    mechanicButton.hidden = !mechanic && !counterSummary;
    setText(briefing.querySelector('[data-v5-mechanic]'), mechanic || 'Đối sách Boss');
    setText(briefing.querySelector('[data-v5-counter]'), counterSummary);

    const farmButton = actionDeck?.querySelector('.huntv2-context-button.loot');
    const farmLabel = clean(farmButton?.querySelector('strong')?.textContent);
    const farmDetail = clean(farmButton?.querySelector('span')?.textContent);
    const farmReady = Boolean(farmButton && farmLabel && !/^CHƯA/i.test(farmLabel));
    const rewardButton = briefing.querySelector('.v5-boss-reward');
    rewardButton.hidden = false;
    setText(briefing.querySelector('[data-v5-reward]'), farmReady ? farmLabel : 'Mở bãi Săn Ảo tầng này');
    setText(briefing.querySelector('[data-v5-reward-detail]'), farmReady && farmDetail ? farmDetail : 'Reward tích theo thời gian');

    const blocker = briefing.querySelector('[data-v5-blocker]');
    const blockerReason = clean(fight?.querySelector('span')?.textContent);
    const blocked = Boolean(fight?.disabled && blockerReason && !/đã hạ/i.test(blockerReason));
    blocker.hidden = !blocked;
    setText(blocker.querySelector('span'), blocked ? blockerReason : '');
    briefing.classList.toggle('blocked', blocked);

    const mechanicChip = ensureActiveMechanic(enemyHud);
    mechanicChip.hidden = !mechanic;
    setText(mechanicChip.querySelector('strong'), mechanic);
    setText(mechanicChip.querySelector('span'), counterSummary);

    farmButton?.classList.toggle('v5-farm-summary', farmReady);
    screen.classList.toggle('v5-farm-ready', farmReady);

    const phase = screen.querySelector('.huntv2-phase-badge, .huntv2-boss-phase, [data-boss-phase]');
    const phaseText = clean(phase?.textContent);
    if (phase && phaseText) phase.setAttribute('aria-label', `Giai đoạn Boss ${phaseText}`);
  }

  function syncEngagedPresentation(screen, stage) {
    const criticalSignal = Boolean(screen.querySelector('.huntv2-stage-boss-telegraph.visible, .huntv2-stage-boss-telegraph.show, .huntv2-enemy-intent.visible, .huntv2-enemy-intent.show, .huntv2-break-window.visible, .huntv2-break-window.show, .huntv2-stage-skill-callout.visible, .huntv2-skill-callout.show'));
    const transientSignal = Boolean(screen.querySelector('.huntv2-float.show, .huntv2-status-callout.show, .huntv2-result-pop.show'));
    const engaged = screen.classList.contains('is-active-combat') || stage.classList.contains('presentation-active') || criticalSignal || transientSignal;
    screen.classList.toggle('v5-critical-signal-active', criticalSignal);
    screen.classList.toggle('v5-combat-engaged', engaged);
  }

  function syncCombatContext() {
    const screen = document.querySelector('.huntv2-screen');
    const stage = screen?.querySelector('#huntV2Stage, .huntv2-stage');
    const enemyHud = screen?.querySelector('.huntv2-enemy-hud');
    if (!screen || !stage || !enemyHud) return;

    syncEngagedPresentation(screen, stage);

    let context = enemyHud.querySelector('.ui-combat-enemy-context');
    if (!context) {
      context = document.createElement('div');
      context.className = 'ui-combat-enemy-context';
      context.setAttribute('aria-label', 'Thông tin yêu thú');
      enemyHud.appendChild(context);
    }

    const level = Math.max(1, Number(stage.dataset.monsterLevel || 1));
    const element = elementLabel(stage.dataset.env);
    const boss = enemyHud.classList.contains('boss');
    const monsterName = clean(stage.dataset.monsterName);
    const signature = `${level}|${element}|${boss ? 1 : 0}|${monsterName}`;
    if (context.dataset.signature !== signature) {
      context.dataset.signature = signature;
      context.replaceChildren();

      const levelChip = document.createElement('span');
      levelChip.textContent = `Lv.${level}`;
      context.appendChild(levelChip);

      if (boss) {
        const bossChip = document.createElement('span');
        bossChip.className = 'boss';
        bossChip.textContent = 'BOSS';
        context.appendChild(bossChip);
      }

      if (element) {
        const elementChip = document.createElement('span');
        elementChip.textContent = element;
        context.appendChild(elementChip);
      }

      if (monsterName) enemyHud.setAttribute('aria-label', `${monsterName}, cấp ${level}${boss ? ', Boss' : ''}${element ? `, hệ ${element}` : ''}`);
    }

    syncBossInformation(screen, stage, enemyHud);
  }

  let scheduled = false;
  const scheduleSync = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      syncCombatContext();
    });
  };

  const observer = new MutationObserver(scheduleSync);
  const start = () => {
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden', 'data-monster-level', 'data-monster-name', 'data-env', 'data-boss-phase'] });
    bootPresentationTools();
    scheduleSync();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
