const WIP_CACHE_TOKEN='ui-home-v1-20260913';

function isLocalWipHost(hostname){
  const host=String(hostname||'').toLowerCase();
  return host==='127.0.0.1'||host==='localhost'||host==='::1'||/^10\./.test(host)||/^192\.168\./.test(host)||/^172\.(?:1[6-9]|2\d|3[01])\./.test(host)||/^169\.254\./.test(host);
}

async function clearLocalWipWebCaches(){
  const host=String(globalThis.location?.hostname||'');
  if(!isLocalWipHost(host))return;
  try{
    if(globalThis.caches?.keys){
      const keys=await caches.keys();
      await Promise.all(keys.filter(key=>String(key).startsWith('tu-tien-')).map(key=>caches.delete(key)));
    }
  }catch(error){console.warn('[bootstrap] Không dọn được CacheStorage local:',error?.message||error);}
  try{
    if(globalThis.navigator?.serviceWorker?.getRegistrations){
      const registrations=await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg=>reg.unregister()));
    }
  }catch(error){console.warn('[bootstrap] Không unregister được Service Worker local:',error?.message||error);}
}

function escBoot(value){return String(value??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function showFatalBootError(error,stage='bootstrap'){
  console.error(`[bootstrap] ${stage} failed`,error);
  const content=document.querySelector('#content');
  const saveState=document.querySelector('#saveState');
  if(saveState){saveState.textContent='Lỗi khởi động';saveState.classList?.add?.('error');}
  if(content){
    const message=String(error?.message||error||'Không rõ lỗi');
    const stack=String(error?.stack||'').split('\n').slice(0,8).join('\n');
    content.innerHTML=`<div class="card bad" style="margin:16px"><h2>Game không khởi động được</h2><p><b>${escBoot(stage)}</b>: ${escBoot(message)}</p>${stack?`<pre style="white-space:pre-wrap;font-size:11px;opacity:.8">${escBoot(stack)}</pre>`:''}<p class="muted small">Đóng cửa sổ server, mở lại <code>tools\\web\\CHOI_WEB_GAME.cmd</code>. Nếu vẫn lỗi, chụp màn hình khối này gửi ChatGPT.</p></div>`;
  }
}

await clearLocalWipWebCaches();
try{
  await import(`./dist/core/alchemy-session-bridge-v146.js?v=${WIP_CACHE_TOKEN}`);
}catch(error){showFatalBootError(error,'alchemy-session-bridge-v146.js');throw error;}
try{
  await import(`./standalone-runtime.js?v=${WIP_CACHE_TOKEN}`);
}catch(error){showFatalBootError(error,'standalone-runtime.js');throw error;}
try{
  await import(`./app.js?v=${WIP_CACHE_TOKEN}`);
}catch(error){showFatalBootError(error,'app.js');throw error;}
try{
  await import(`./modules/endgame-ui-v159.js?v=${WIP_CACHE_TOKEN}`);
}catch(error){showFatalBootError(error,'endgame-ui-v159.js');throw error;}
try{
  await import(`./modules/spirit-beast-ui-v147.js?v=${WIP_CACHE_TOKEN}`);
}catch(error){showFatalBootError(error,'spirit-beast-ui-v147.js');throw error;}
try{
  await import(`./modules/alchemy-v146-ui-bridge.js?v=${WIP_CACHE_TOKEN}`);
}catch(error){showFatalBootError(error,'alchemy-v146-ui-bridge.js');throw error;}
