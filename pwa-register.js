const PWA_WIP_TOKEN='v140-cultivation-clean-20260906';
function isLocalWipHost(hostname){
  const host=String(hostname||'').toLowerCase();
  return host==='127.0.0.1'||host==='localhost'||host==='::1'||/^10\./.test(host)||/^192\.168\./.test(host)||/^172\.(?:1[6-9]|2\d|3[01])\./.test(host)||/^169\.254\./.test(host);
}
async function clearLocalWipPwa(){
  try{const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister()));}catch{}
  try{if(globalThis.caches?.keys){const keys=await caches.keys();await Promise.all(keys.filter(k=>String(k).startsWith('tu-tien-')).map(k=>caches.delete(k)));}}catch{}
}
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  const localWip=isLocalWipHost(location.hostname);
  if(localWip){
    window.addEventListener('load',clearLocalWipPwa);
  }else{
    window.addEventListener('load',()=>navigator.serviceWorker.register(`/pwa-sw.js?v=${PWA_WIP_TOKEN}`,{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{}));
  }
}
