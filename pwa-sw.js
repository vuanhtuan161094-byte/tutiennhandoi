const CACHE='tu-tien-v140-1.40.0-alpha.24.0-cultivation-clean-20260906-shell-v1';
const CORE=['/','/index.html','/app.js','/standalone-runtime.js','/standalone-entry.js','/styles.css','/combat-v2.css','/visual-catalog.json','/manifest.webmanifest','/assets/app-icon-192.png','/assets/app-icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
function cachePut(request,response){if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy)).catch(()=>{});}return response;}
function networkFirst(request){return fetch(request).then(response=>cachePut(request,response)).catch(()=>caches.match(request).then(hit=>hit||Response.error()));}
function cacheFirst(request){return caches.match(request).then(hit=>hit||fetch(request).then(response=>cachePut(request,response)));}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  if(u.origin!==self.location.origin) return;
  const mutable=e.request.mode==='navigate'||/\.(?:html?|js|mjs|css|json)$/i.test(u.pathname)||u.pathname==='/manifest.webmanifest';
  e.respondWith(mutable?networkFirst(e.request):cacheFirst(e.request));
});
