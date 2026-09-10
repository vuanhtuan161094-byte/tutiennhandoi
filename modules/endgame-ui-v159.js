export const ENDGAME_UI_V159_SCHEMA = 'endgame-ui.v159';

const STORAGE_KEY = 'tutien.web.save.v1';
const ROOT_SELECTOR = '.v103-journey-hero + .card';

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

function commandFor(stage) {
  const title = String(stage?.nextAction?.title ?? '');
  if (/^Phá Cực lớp \d+/.test(title)) return { type:'breakExtremityLayerV159' };
  if (title === 'Khai Kỷ Nguyên') return { type:'createGenesisEpochV159' };
  return null;
}

function removeStaleProvisionalSurface(root = document) {
  for (const node of root.querySelectorAll?.('.v103-milestone em') ?? []) {
    if (String(node.textContent ?? '').includes('Immortal+ hiện là provisional')) node.remove();
  }
}

function renderStage(root, stage) {
  if (!(root instanceof Element) || !stage?.active) return;
  const title = root.querySelector('h2');
  const detail = root.querySelector('p');
  const list = root.querySelector('.list');
  if (title) title.textContent = stage.stage?.name ?? 'Tiên Lộ';
  if (detail) detail.textContent = stage.nextAction?.detail ?? 'Tu Vi là nền; đại cảnh giới cần gameplay milestone thật.';
  if (list) {
    list.innerHTML = (stage.objectives ?? []).map(x => `<div class="list-item"><b>${x.complete?'✓':'○'} ${esc(x.name)}</b><span>${esc(x.current ?? '')} → ${esc(x.target ?? '')}</span></div>`).join('');
  }

  let controls = root.querySelector('[data-v159-endgame-controls]');
  if (!controls) {
    controls = document.createElement('div');
    controls.dataset.v159EndgameControls = '1';
    controls.className = 'tag-row';
    controls.style.marginTop = '12px';
    root.appendChild(controls);
  }
  controls.replaceChildren();

  const command = commandFor(stage);
  if (!command) return;
  const button = document.createElement('button');
  button.className = 'button gold';
  button.dataset.v159EndgameAction = command.type;
  button.textContent = stage.nextAction.title;
  button.onclick = () => performEndgameAction(button, command);
  controls.appendChild(button);
}

async function readStage() {
  const response = await fetch('/api/state', { cache:'no-store' });
  const payload = await response.json();
  if (!response.ok || payload?.ok === false) throw new Error(payload?.error || `HTTP ${response.status}`);
  return { stage:payload?.snapshot?.playerExperience?.v114, payload };
}

async function performEndgameAction(button, command) {
  if (button.disabled) return;
  const previous = button.textContent;
  button.disabled = true;
  button.textContent = 'Đang thực hiện…';
  try {
    const response = await fetch('/api/action', {
      method:'POST',
      headers:{ 'content-type':'application/json' },
      body:JSON.stringify({ action:'perform', command }),
    });
    const payload = await response.json();
    if (!response.ok || payload?.ok === false) throw new Error(payload?.error || `HTTP ${response.status}`);
    if (payload?.save) localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.save));
    const root = document.querySelector(ROOT_SELECTOR);
    renderStage(root, payload?.snapshot?.playerExperience?.v114);
    const notice = document.createElement('small');
    notice.dataset.v159EndgameNotice = '1';
    notice.textContent = payload?.result?.summary ?? 'Đã hoàn tất hành động endgame.';
    root?.querySelector('[data-v159-endgame-controls]')?.appendChild(notice);
  } catch (error) {
    button.disabled = false;
    button.textContent = previous;
    const controls = button.closest('[data-v159-endgame-controls]');
    const notice = document.createElement('small');
    notice.dataset.v159EndgameNotice = '1';
    notice.textContent = error instanceof Error ? error.message : String(error);
    controls?.appendChild(notice);
  }
}

let scheduled = false;
async function processAll() {
  scheduled = false;
  removeStaleProvisionalSurface();
  const root = document.querySelector(ROOT_SELECTOR);
  if (!root || root.dataset.v159EndgameAttached === '1') return;
  root.dataset.v159EndgameAttached = '1';
  try {
    const { stage } = await readStage();
    renderStage(root, stage);
  } catch (error) {
    root.dataset.v159EndgameAttached = '0';
    console.warn('[v159-endgame-ui] sync failed', error?.message || error);
  }
}
function schedule() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(processAll);
}

if (typeof document !== 'undefined') {
  schedule();
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList:true, subtree:true });
  globalThis.__TUTIEN_ENDGAME_UI_V159__ = Object.freeze({ schema:ENDGAME_UI_V159_SCHEMA, installed:true });
}
