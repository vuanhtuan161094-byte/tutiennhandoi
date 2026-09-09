const PET_ASSET_MARKER='/assets/huntv2/beasts/';

function isBeastScope(el){
  if(!(el instanceof Element))return false;
  if(el.closest('.v86-beast-panel'))return true;
  const card=el.closest('.v2326-item-card,.v2326-detail');
  return Boolean(card?.querySelector(`img[src*="${PET_ASSET_MARKER}"]`));
}
function rewrite(text){
  return String(text)
    .replace(/LINH THÚ V86/g,'LINH THÚ V147')
    .replace(/Đột Phá Huyết Mạch/g,'Tăng Sao')
    .replace(/Mở ở Huyết Mạch\s+(\d+)/g,'Mở ở $1★')
    .replace(/Huyết Mạch\s+(\d+)\s*\/\s*(?:\d+|Infinity)/g,'$1★')
    .replace(/Linh Khế luôn có hiệu lực/g,'Linh Khế chỉ có hiệu lực khi Trợ Chiến')
    .replace(/Kể cả khi không trợ chiến\.?\s*Mỗi species chỉ tính một lần\.?/gi,'Tất cả Linh Thú sở hữu cộng raw; chỉ Linh Thú Trợ Chiến kích hoạt % Linh Khế.');
}
function patch(root=document){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];let node;
  while((node=walker.nextNode()))if(isBeastScope(node.parentElement)&&/V86|Huyết Mạch|Đột Phá/.test(node.nodeValue||''))nodes.push(node);
  for(const textNode of nodes){const next=rewrite(textNode.nodeValue);if(next!==textNode.nodeValue)textNode.nodeValue=next;}
}
function boot(){patch(document);const observer=new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes){if(n.nodeType===Node.ELEMENT_NODE||n.nodeType===Node.DOCUMENT_FRAGMENT_NODE)patch(n);}});observer.observe(document.documentElement,{childList:true,subtree:true});globalThis.__SPIRIT_BEAST_UI_V147__={schema:'spirit-beast-ui.v147',patch};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
