/* Combat Readability Target V1 — DOM presentation bridge only.
   Reads already-rendered/backend-authored combat context; never mutates gameplay state. */
(() => {
  const elementLabel = value => ({water:'Thủy',fire:'Hỏa',wood:'Mộc',metal:'Kim',earth:'Thổ'})[String(value || '').toLowerCase()] || '';
  const params = (() => { try { return new URLSearchParams(location.search); } catch { return new URLSearchParams(); } })();
  const devMode = params.get('dev') === '1' || globalThis.__TUTIEN_DEV_FORCE__ === true;
  const toolsOptIn = params.get('tools') === '1' || params.get('devtools') === '1';
  const animeOptIn = params.get('anime') === '1' || (devMode && toolsOptIn);

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

  function syncCombatContext() {
    const screen = document.querySelector('.huntv2-screen');
    const stage = screen?.querySelector('#huntV2Stage, .huntv2-stage');
    const enemyHud = screen?.querySelector('.huntv2-enemy-hud');
    if (!screen || !stage || !enemyHud) return;

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
    const monsterName = String(stage.dataset.monsterName || '').trim();
    const signature = `${level}|${element}|${boss ? 1 : 0}|${monsterName}`;
    if (context.dataset.signature === signature) return;
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
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'data-monster-level', 'data-monster-name', 'data-env'] });
    bootPresentationTools();
    scheduleSync();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
