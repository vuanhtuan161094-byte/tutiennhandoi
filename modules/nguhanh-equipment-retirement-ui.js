/**
 * Presentation retirement for removed equipment Ngũ Hành Gem/Set systems.
 * Linh Căn/root UI is intentionally untouched.
 */
const RETIRED_SELECTORS = [
  '.v138247-socket-workshop', '.v138247-socket-unavailable', '.v138247-gem-legend', '.v138247-socket-runtime-note',
  '.v138233-set-screen', '.v138247-set-screen', '.v138247-set-hero', '.v138247-set-rules', '.v138242-set-card', '.v138244-set-mini', '.v138246-set-shift',
  '[data-gem-socket]', '[data-gem-upgrade]', '[data-gem-unsocket]', '[data-v142-engrave]', '[data-v142-set-id]',
  '[data-open-inventory="sets"]', '[data-inventory-view="sets"]', '[data-set-filter]', '[data-set-search]', '[data-clear-set-filters]', '[data-set-to-inventory]',
  '[data-sheet-open^="set-"]', 'label:has([data-inventory-filter="setId"])', '.v138244-copy em.set',
  '.v13819-element-detail', '.v13819-detail-group:has([data-stat-help="element"])',
];
const style = document.createElement('style');
style.dataset.nguhanhEquipmentRetired = '1';
style.textContent = `${RETIRED_SELECTORS.join(',')} { display:none !important; }`;
document.head.appendChild(style);

function pruneRetiredEquipmentUi(root = document) {
  for (const selector of RETIRED_SELECTORS) {
    try { root.querySelectorAll?.(selector).forEach(node => node.remove()); } catch {}
  }
  root.querySelectorAll?.('.v13819-detail-group').forEach(group => {
    if (group.querySelector('[data-stat-help="break"]')) {
      group.querySelectorAll('div').forEach(row => {
        const label = row.querySelector('span')?.textContent?.trim();
        if (label === 'Set đang kích hoạt') row.remove();
      });
    }
  });
}

pruneRetiredEquipmentUi();
const observer = new MutationObserver(records => {
  for (const record of records) for (const node of record.addedNodes) if (node?.nodeType === 1) {
    for (const selector of RETIRED_SELECTORS) { try { if (node.matches?.(selector)) node.remove(); } catch {} }
    if (node.isConnected) pruneRetiredEquipmentUi(node);
  }
});
observer.observe(document.documentElement, { childList: true, subtree: true });
globalThis.__tutienNguhanhEquipmentRetired = true;
