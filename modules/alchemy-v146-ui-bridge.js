export const ALCHEMY_UI_BRIDGE_V146_SCHEMA = 'alchemy-ui-bridge.v146';

const TEXT_REPLACEMENTS = [
  [/ALCHEMY ECOSYSTEM · V85/g, 'ĐAN DƯỢC · V146'],
  [/Đan Dược canonical · không có Đan hồi HP\/CN/g, 'Đan Dược V146 · Linh Thảo + Yêu Đan · không có Đan hồi HP/CN'],
  [/Công Lực đời/g, 'Công Lực'],
  [/Thể Phách đời/g, 'Khí Huyết'],
  [/Phòng Ngự đời/g, 'Hộ Thể'],
  [/Công Lực Đạo Đan/g, 'Công Lực'],
  [/Thể Phách Đạo Đan/g, 'Khí Huyết'],
  [/Phòng Ngự Đạo Đan/g, 'Hộ Thể'],
  [/ĐAN PHƯƠNG ĐÃ LĨNH NGỘ/g, 'ĐAN PHƯƠNG TỰ MỞ'],
  [/Đan Phương đã lĩnh ngộ/g, 'Đan Phương tự mở'],
  [/Đan Phương chưa lĩnh ngộ/g, 'Đan Phương chưa mở'],
  [/Stat Đan · family\/tier\/đời/g, 'Bồi Dưỡng · họ/đại cảnh/đời'],
  [/Linh Thực/g, 'Linh Thảo'],
  [/Linh Chủng/g, 'Linh Chủng'],
  [/Mastery (\d+(?:[.,]\d+)?) · Chuyên tinh \d+(?:[.,]\d+)?%/g, 'Mastery $1'],
];

function replaceTextNode(node) {
  let value = node.nodeValue ?? '';
  let next = value;
  for (const [pattern, replacement] of TEXT_REPLACEMENTS) next = next.replace(pattern, replacement);
  if (next !== value) node.nodeValue = next;
}
function rewriteText(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const tag = node.parentElement?.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE') continue;
    replaceTextNode(node);
  }
}
function setTextIfDifferent(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}
function processAlchemyRoot(root) {
  if (!(root instanceof Element)) return;
  rewriteText(root);
  const workshopEyebrow = root.querySelector('.v2328-workshop-head span');
  setTextIfDifferent(workshopEyebrow, 'ĐAN DƯỢC · V146');

  const toolbar = root.querySelector('.v85-alchemy-toolbar > span');
  setTextIfDifferent(toolbar, 'Đan Phương tự mở theo Đan Đạo + cảnh giới · Mastery dùng chung theo họ Đan.');

  for (const button of root.querySelectorAll('[data-alchemy-learn-recipe]')) button.remove();
  for (const card of root.querySelectorAll('[data-alchemy-recipe]')) {
    card.classList.remove('v85-recipe-locked');
    const recipeId = String(card.getAttribute('data-alchemy-recipe') ?? '');
    const match = /\.m(\d+)$/.exec(recipeId);
    const span = card.querySelector('span');
    if (span && match) {
      const major = Number(match[1]);
      const label = major === 0 ? 'Phàm Nhân' : `Đại cảnh ${major}`;
      const current = span.textContent ?? '';
      const suffix = current.replace(/^T\d+\s*·\s*/, '').replace(/^Đại cảnh \d+\s*·\s*/, '').replace(/^Phàm Nhân\s*·\s*/, '');
      const next = `${label}${suffix ? ` · ${suffix}` : ''}`;
      setTextIfDifferent(span, next);
    }
  }

  for (const pill of root.querySelectorAll('.v85-pill-card')) {
    const button = pill.querySelector('[data-alchemy-use-pill]');
    const id = String(button?.getAttribute('data-alchemy-use-pill') ?? '');
    const match = /\.m(\d+)\.(?:low|mid|high|supreme)$/.exec(id);
    const span = pill.querySelector('span');
    if (span && match) {
      const major = Number(match[1]);
      const label = major === 0 ? 'Phàm Nhân' : `Đại cảnh ${major}`;
      const current = span.textContent ?? '';
      const family = current.split('·')[0]?.trim() || 'Đan Dược';
      setTextIfDifferent(span, `${family} · ${label}`);
    }
  }

  const ruleCards = [...root.querySelectorAll('.v85-alchemy-rules > div')];
  for (const card of ruleCards) {
    const small = card.querySelector('small');
    if (small?.textContent?.includes('Bồi Dưỡng')) setTextIfDifferent(small, 'Bồi Dưỡng · mỗi họ/đại cảnh/đời');
  }

  const gardenHeader = root.querySelector('.v85-garden header small');
  if (gardenHeader) setTextIfDifferent(gardenHeader, 'Mỗi đại cảnh có 1 Linh Chủng khởi nguyên. Sau đó tiêu 1 Linh Thảo làm giống; thu 4/5/7 khi Thành Thục/Lâu Năm/Cổ Linh.');
  const productHeader = root.querySelector('.v85-pill-inventory header small');
  if (productHeader) setTextIfDifferent(productHeader, 'Bồi Dưỡng dùng raw Công/HP/Phòng vĩnh viễn; quota mở lại sau Luân Hồi nhưng stat đã hấp thu không mất.');
  root.dataset.alchemyCanonical = 'v146';
}

let scheduled = false;
function processAll() {
  scheduled = false;
  for (const root of document.querySelectorAll('.v85-alchemy')) processAlchemyRoot(root);
}
function schedule() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(processAll);
}

if (typeof document !== 'undefined') {
  processAll();
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  globalThis.__TUTIEN_ALCHEMY_UI_V146__ = Object.freeze({ schema: ALCHEMY_UI_BRIDGE_V146_SCHEMA, installed: true });
}
