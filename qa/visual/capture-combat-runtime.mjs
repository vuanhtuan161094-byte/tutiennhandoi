import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);
const baseUrl = String(args.get('--base') || process.env.TUTIEN_VISUAL_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const outDir = resolve(args.get('--out') || process.env.TUTIEN_VISUAL_OUT_DIR || 'artifacts/ui-visual');
const chromePath = args.get('--chrome') || process.env.CHROME_PATH || process.env.GOOGLE_CHROME_BIN || 'google-chrome';
const cdpPort = Number(args.get('--cdp-port') || 9223);
const width = Number(args.get('--width') || 390);
const height = Number(args.get('--height') || 844);
const viewport = `${width}x${height}`;
const profileDir = resolve(`.tmp/ui-combat-visual-chrome-profile-${cdpPort}`);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

await mkdir(outDir, { recursive: true });
await rm(profileDir, { recursive: true, force: true });
await mkdir(profileDir, { recursive: true });
const chrome = spawn(chromePath, [
  '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
  '--hide-scrollbars', '--mute-audio', `--remote-debugging-port=${cdpPort}`,
  `--user-data-dir=${profileDir}`, 'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });
let chromeLog = '';
chrome.stdout.on('data', chunk => { chromeLog += chunk.toString(); });
chrome.stderr.on('data', chunk => { chromeLog += chunk.toString(); });

async function poll(url, timeoutMs = 15000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) { lastError = error; }
    await sleep(150);
  }
  throw new Error(`CDP unavailable: ${lastError?.message || 'timeout'}`);
}

class CDP {
  constructor(wsUrl) { this.wsUrl = wsUrl; this.id = 1; this.pending = new Map(); }
  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CDP connect timeout')), 10000);
      this.ws.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
      this.ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('CDP connect error')); }, { once: true });
    });
    this.ws.addEventListener('message', event => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result || {});
    });
  }
  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression, awaitPromise: true, returnByValue: true, userGesture: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'evaluate failed');
    return result.result?.value;
  }
  close() { try { this.ws?.close(); } catch {} }
}

async function waitFor(client, expression, label, timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try { if (await client.eval(`Boolean(${expression})`)) return; } catch {}
    await sleep(180);
  }
  throw new Error(`Timeout waiting for ${label}`);
}
async function navigate(client, url) {
  await client.send('Page.navigate', { url });
  await waitFor(client, `document.readyState==='complete'`, 'document ready');
}
async function visualReady(client) {
  await client.eval(`(async()=>{if(document.fonts?.ready)await document.fonts.ready;await Promise.all([...document.images].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});setTimeout(resolve,2500)})));return true})()`);
  await sleep(300);
}
async function screenshot(client, file) {
  const shot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  await writeFile(resolve(outDir, file), Buffer.from(shot.data, 'base64'));
  return file;
}

async function metrics(client) {
  return client.eval(`(()=>{
    const visible=e=>{if(!e)return false;const r=e.getBoundingClientRect();if(!(r.width>0&&r.height>0))return false;for(let n=e;n&&n.nodeType===1;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity||1)<=0)return false;}return true;};
    const largeLayers=[...document.querySelectorAll('.huntv2-stage *')].filter(visible).map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return{tag:e.tagName.toLowerCase(),cls:String(e.className||'').slice(0,160),id:e.id||'',x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),z:s.zIndex,bg:s.backgroundColor,bgi:s.backgroundImage,opacity:s.opacity,filter:s.filter,blend:s.mixBlendMode}}).filter(x=>x.w*x.h>=18000).sort((a,b)=>Number(a.z||0)-Number(b.z||0));
    const topNodes=[...document.querySelectorAll('body *')].filter(visible).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e),before=getComputedStyle(e,'::before'),after=getComputedStyle(e,'::after');const text=String(e.textContent||'').replace(/\\s+/g,' ').trim();return{tag:e.tagName.toLowerCase(),cls:String(e.className||'').slice(0,140),id:e.id||'',text:text.slice(0,180),before:before.content,after:after.content,top:Math.round(r.top),bottom:Math.round(r.bottom),left:Math.round(r.left),right:Math.round(r.right),z:s.zIndex,font:parseFloat(s.fontSize)||0,overflow:s.overflow,position:s.position}}).filter(x=>x.bottom>0&&x.top<28&&(x.text||(x.before&&x.before!=='none'&&x.before!=='normal')||(x.after&&x.after!=='none'&&x.after!=='normal'))).sort((a,b)=>a.top-b.top||a.left-b.left).slice(0,120);
    const topPointStacks=[4,10,18,24].flatMap(y=>[24,96,170,244,318,380].map(x=>({x,y,stack:document.elementsFromPoint(x,y).slice(0,10).map(e=>({tag:e.tagName.toLowerCase(),cls:String(e.className||'').slice(0,100),id:e.id||'',text:String(e.textContent||'').replace(/\\s+/g,' ').trim().slice(0,120)}))})));
    return{screen:document.body.dataset.gameScreen,width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,hasHorizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,hasCombat:!!document.querySelector('.huntv2-screen'),hasPlayerHud:!!document.querySelector('.huntv2-player-hud'),hasEnemyHud:!!document.querySelector('.huntv2-enemy-hud'),hasEnemyContext:!!document.querySelector('.ui-combat-enemy-context'),hasSpiritBeastHud:!!document.querySelector('.huntv2-beast-companion-hud'),hasConfidantHud:!!document.querySelector('.huntv2-confidant-hud'),hasArtifactHud:!!document.querySelector('.huntv2-artifact-hud'),supportHudCount:document.querySelectorAll('.huntv2-beast-companion-hud,.huntv2-confidant-hud,.huntv2-artifact-hud').length,skillCount:document.querySelectorAll('.huntv2-skill').length,filledSkillCount:document.querySelectorAll('.huntv2-skill.filled').length,visibleText:[...document.querySelectorAll('.huntv2-screen *')].filter(e=>visible(e)&&e.children.length===0&&e.textContent.trim()).map(e=>({text:e.textContent.trim().slice(0,48),font:parseFloat(getComputedStyle(e).fontSize)||0})).filter(x=>x.font>0&&x.font<10).slice(0,80),largeLayers,topNodes,topPointStacks};
  })()`);
}
async function combatLayout(client) {
  return client.eval(`(()=>{const pick=s=>document.querySelector(s)?.getBoundingClientRect?.();const supports=[...document.querySelectorAll('.huntv2-beast-companion-hud,.huntv2-confidant-hud,.huntv2-artifact-hud')].map((e,i)=>{const r=e.getBoundingClientRect();return{index:i,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}});const ys=supports.map(x=>x.y);const player=pick('.huntv2-player-hud'),hp=pick('.huntv2-player-hud .huntv2-vital.hp'),cn=pick('.huntv2-player-hud .huntv2-vital.spirit');return{supportCount:supports.length,supports,supportYSpread:ys.length?Math.max(...ys)-Math.min(...ys):999,playerHudTop:player?Math.round(player.top):999,playerHudBottom:player?Math.round(player.bottom):0,playerHpTop:hp?Math.round(hp.top):999,playerCnTop:cn?Math.round(cn.top):999}})()`);
}
async function showcaseState(client) {
  return client.eval(`(()=>{const api=globalThis.__TUTIEN_COMBAT_SHOWCASE__;const root=document.querySelector('.huntv2-screen');const visible=e=>{if(!e)return false;const r=e.getBoundingClientRect();if(!(r.width>0&&r.height>0))return false;for(let n=e;n&&n.nodeType===1;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity||1)<=0)return false;}return true;};const stage=document.querySelector('#huntV2Stage');const rect=e=>{const r=e?.getBoundingClientRect?.();return r?{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}:null};const tray=side=>{const t=document.querySelector('.huntv2-status-tray.'+side);return t?{all:t.querySelectorAll('.status').length,visible:t.querySelectorAll('.status:not(.status-hidden)').length,more:t.querySelector('.status-more')?.textContent||'',timed:t.querySelectorAll('.status[data-timed="1"]').length,mark:t.querySelector('.status.mark')?.textContent||'',visuals:[...t.querySelectorAll('.status')].map(x=>x.dataset.statusVisual||'')}:{all:0,visible:0,more:'',timed:0,mark:'',visuals:[]}};const state=api?.state?.()||{};const rootBounds=root?.getBoundingClientRect?.();const structuralSelectors=['.huntv2-player-hud','.huntv2-enemy-hud','.huntv2-skills','.huntv2-intel-lane','.huntv2-hud-extension-slots','.huntv2-quick-controls','.huntv2-meta-strip','.huntv2-map-compact','.huntv2-action-deck','.v5-boss-briefing'];const structuralOverflow=rootBounds?structuralSelectors.flatMap(sel=>[...document.querySelectorAll(sel)].filter(visible).map(e=>{const r=e.getBoundingClientRect();return{sel,cls:String(e.className||'').slice(0,120),left:Math.round(r.left-rootBounds.left),right:Math.round(r.right-rootBounds.right),top:Math.round(r.top-rootBounds.top),bottom:Math.round(r.bottom-rootBounds.bottom)}}).filter(x=>x.left < -2 || x.right > 2 || x.top < -2 || x.bottom > 2)):[];return{...state,rootRect:rect(root),stageRect:rect(stage),stageClass:stage?.className||'',structuralOverflow,callout:document.querySelector('#huntv2SkillCallout.show strong')?.textContent||'',enemyIntent:document.querySelector('#huntv2EnemyIntent.show strong')?.textContent||'',breakWindow:document.querySelector('#huntv2BreakWindow.show strong')?.textContent||'',damageNumbers:[...document.querySelectorAll('.huntv2-float.show')].map(x=>({class:x.className,text:x.textContent.trim()})),statusStress:{player:tray('player'),enemy:tray('enemy')},hp:{player:document.querySelector('#huntv2PlayerHpText')?.textContent||'',enemy:document.querySelector('#huntv2EnemyHpText')?.textContent||'',cn:document.querySelector('.huntv2-vital.spirit em')?.textContent||''},cooldowns:[...document.querySelectorAll('.huntv2-skill')].map((x,i)=>({index:i,active:x.classList.contains('cooldown'),text:x.querySelector('[data-cd-text]')?.textContent||'',name:x.dataset.huntv2SkillName||''})),pixi:{state:document.body.dataset.combatPixiState||'',events:Number(document.body.dataset.combatPixiFxEvents||0),impacts:Number(document.body.dataset.combatPixiImpacts||0),camera:Number(document.body.dataset.combatPixiCamera||0),cameraX:Number(document.body.dataset.combatPixiCameraX||0),cameraY:Number(document.body.dataset.combatPixiCameraY||0),cameraActive:document.body.dataset.combatPixiCameraActive==='1'},rootTransform:getComputedStyle(root||document.body).transform,stageTransform:getComputedStyle(stage||document.body).transform,rootOverflow:root?root.scrollWidth>root.clientWidth+1:false,docOverflow:document.documentElement.scrollWidth>innerWidth+1,activeCombat:root?.classList.contains('is-active-combat')||false,preFightVisible:visible(document.querySelector('.v5-boss-briefing')),actionDeckVisible:visible(document.querySelector('.huntv2-action-deck')),smallText:[...document.querySelectorAll('.huntv2-screen *')].filter(e=>visible(e)&&e.children.length===0&&String(e.textContent||'').trim()).map(e=>({text:String(e.textContent||'').trim().slice(0,48),font:parseFloat(getComputedStyle(e).fontSize)||0,tag:e.tagName?.toLowerCase?.()||'',cls:String(e.className||'').slice(0,120),parentTag:e.parentElement?.tagName?.toLowerCase?.()||'',parentCls:String(e.parentElement?.className||'').slice(0,160),html:String(e.outerHTML||'').replace(/\s+/g,' ').slice(0,260)})).filter(x=>x.font>0&&x.font<10).slice(0,80)};})()`);
}
async function verifiedShowcaseState(client) {
  const state=await showcaseState(client);
  if(state.docOverflow||state.structuralOverflow?.length)throw new Error(`Combat structural overflow: ${JSON.stringify({docOverflow:state.docOverflow,rootOverflowTelemetry:state.rootOverflow,structuralOverflow:state.structuralOverflow,stageClass:state.stageClass})}`);
  if(state.smallText?.length)throw new Error(`Combat text below 10px: ${JSON.stringify(state.smallText)}`);
  if(state.activeCombat&&(state.preFightVisible||state.actionDeckVisible))throw new Error(`Active Combat leaked pre-fight UI: ${JSON.stringify({preFightVisible:state.preFightVisible,actionDeckVisible:state.actionDeckVisible})}`);
  return state;
}
async function callShowcase(client, expression) {
  return client.eval(`(()=>{const api=globalThis.__TUTIEN_COMBAT_SHOWCASE__;if(!api)throw new Error('DEV Combat Visual Showcase API unavailable');return ${expression}})()`);
}
async function bootstrapFixture(client) {
  return client.eval(`(async()=>{const headers={'content-type':'application/json'};const post=async(path,body)=>{const response=await fetch(path,{method:'POST',headers,body:JSON.stringify(body)});const data=await response.json();if(!response.ok||data.ok===false)throw new Error(data.error||('HTTP '+response.status));return data;};const locateSummary=(value,seen=new Set())=>{if(!value||typeof value!=='object'||seen.has(value))return null;seen.add(value);if(Array.isArray(value.categories))return value;for(const child of Object.values(value)){const found=locateSummary(child,seen);if(found)return found;}return null;};await post('/api/dev/new',{seed:20260913});await post('/api/dev/action',{action:'devSandboxPreset',realmOrder:62,dao:'sword',forceBoss:true});const grant=await post('/api/dev/action',{action:'devCollectionGrantV12326'});const summary=locateSummary(grant);if(!summary)throw new Error('DEV collection summary unavailable');const cat=id=>summary.categories.find(x=>x.category===id);const owned=id=>(cat(id)?.items||[]).filter(x=>x?.progress?.owned);const artifacts=owned('artifact').slice(0,2),pet=owned('pet')[0],companion=owned('companion')[0],relic=owned('relic')[0];if(!artifacts.length||!pet||!companion||!relic)throw new Error('DEV support collection fixtures unavailable');for(let i=0;i<artifacts.length;i++)await post('/api/dev/action',{action:'collectionEquipV12325',itemId:artifacts[i].id,slotIndex:i});await post('/api/dev/action',{action:'collectionEquipV12325',itemId:pet.id});await post('/api/dev/action',{action:'collectionEquipV12325',itemId:companion.id});await post('/api/dev/action',{action:'collectionEquipV12325',itemId:relic.id});const response=await fetch('/api/dev/save',{cache:'no-store'});const data=await response.json();if(!response.ok||data.ok===false||!data.save)throw new Error(data.error||'DEV save unavailable');localStorage.setItem('tutien.web.save.v1',JSON.stringify(data.save));return{seed:20260913,realmOrder:62,dao:'sword',forceBoss:true,artifactIds:artifacts.map(x=>x.id),petId:pet.id,companionId:companion.id,relicId:relic.id}})()`);
}
function assertClean(metricsValue, layout) {
  if (metricsValue.hasHorizontalOverflow || metricsValue.skillCount !== 7 || metricsValue.filledSkillCount !== 7) throw new Error(`Combat clean structure incomplete: ${JSON.stringify(metricsValue)}`);
  if (!metricsValue.hasPlayerHud || !metricsValue.hasEnemyHud || !metricsValue.hasEnemyContext || !metricsValue.hasSpiritBeastHud || !metricsValue.hasConfidantHud || !metricsValue.hasArtifactHud) throw new Error('Combat clean support/HUD proof incomplete');
  if (metricsValue.visibleText.length || layout.supportCount !== 3 || layout.supportYSpread > 14 || layout.playerHudTop >= 310) throw new Error(`Combat clean layout/legibility proof incomplete: ${JSON.stringify(layout)}`);
}
async function captureNamed(client, file, { ready = true } = {}) { if (ready) await visualReady(client); return screenshot(client, file); }

let client;
try {
  await poll(`http://127.0.0.1:${cdpPort}/json/version`);
  let target = null;
  try { const response = await fetch(`http://127.0.0.1:${cdpPort}/json/new?about:blank`, { method: 'PUT' }); if (response.ok) target = await response.json(); } catch {}
  if (!target) { const list = await poll(`http://127.0.0.1:${cdpPort}/json/list`); target = list.find(item => item.type === 'page'); }
  if (!target?.webSocketDebuggerUrl) throw new Error('No page target');
  client = new CDP(target.webSocketDebuggerUrl); await client.connect();
  await client.send('Page.enable'); await client.send('Runtime.enable');
  await client.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true,screenWidth:width,screenHeight:height,screenOrientation:{type:'portraitPrimary',angle:0}});
  await client.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});

  await navigate(client, `${baseUrl}/?dev=1&tab=cultivation&visualqa=1`);
  await waitFor(client, `document.body.dataset.uxShell==='p0' && document.querySelector('#content')?.children.length>0`, 'canonical DEV runtime bootstrap');
  const fixture = await bootstrapFixture(client);
  await navigate(client, `${baseUrl}/?dev=1&tab=hunt&visualqa=1`);
  await waitFor(client, `document.body.dataset.uxShell==='p0' && document.querySelector('.huntv2-screen')`, 'Combat runtime');
  await waitFor(client, `document.querySelector('[data-endless-fight]:not([disabled])')`, 'backend-authored Boss fight action');
  await waitFor(client, `document.querySelector('.ui-combat-enemy-context')`, 'Combat backend context bridge');
  await waitFor(client, `document.querySelector('.huntv2-beast-companion-hud') && document.querySelector('.huntv2-confidant-hud') && document.querySelector('.huntv2-artifact-hud')`, 'backend-authored Combat support HUDs');
  await waitFor(client, `globalThis.__TUTIEN_COMBAT_SHOWCASE__?.version==='combat-visual-showcase.v1'`, 'DEV Combat Visual Showcase API');
  await waitFor(client, `!document.querySelector('#notice') || document.querySelector('#notice').classList.contains('hidden')`, 'Combat transient notice cleared', 6000);

  const manifest = { schema:'tutien-combat-visual-showcase.v1', mockOrReconstruction:false, viewport:{width,height}, fixture, scenes:[], skills:[], shake:[], legacy:[] };
  await callShowcase(client, `api.scene('01-clean')`); await sleep(220);
  const clean = await metrics(client); const cleanLayout = await combatLayout(client); clean.combatLayout = cleanLayout; clean.showcase = await verifiedShowcaseState(client); assertClean(clean, cleanLayout);
  await captureNamed(client, `01-clean-${viewport}.png`); await screenshot(client, `combat-runtime-${viewport}.png`); manifest.scenes.push({id:'01-clean',file:`01-clean-${viewport}.png`,metrics:'combat-runtime-metrics.json'}); manifest.legacy.push(`combat-runtime-${viewport}.png`);
  await writeFile(resolve(outDir,'combat-runtime-metrics.json'), JSON.stringify(clean,null,2));

  await callShowcase(client, `api.scene('02-status-stress')`); await sleep(220);
  const statusMetrics = await metrics(client); statusMetrics.showcase = await verifiedShowcaseState(client);
  if (statusMetrics.hasHorizontalOverflow || statusMetrics.showcase.statusStress.player.visible < 4 || statusMetrics.showcase.statusStress.enemy.visible < 4 || !statusMetrics.showcase.statusStress.player.more || !statusMetrics.showcase.statusStress.enemy.more || !statusMetrics.showcase.statusStress.enemy.mark.includes('6/6')) throw new Error(`Combat status stress proof incomplete: ${JSON.stringify(statusMetrics.showcase.statusStress)}`);
  await captureNamed(client, `02-status-stress-${viewport}.png`); await screenshot(client, `combat-runtime-stress-${viewport}.png`); manifest.scenes.push({id:'02-status-stress',file:`02-status-stress-${viewport}.png`,metrics:'combat-runtime-stress-metrics.json'}); manifest.legacy.push(`combat-runtime-stress-${viewport}.png`);
  await writeFile(resolve(outDir,'combat-runtime-stress-metrics.json'), JSON.stringify({...statusMetrics,statusStress:statusMetrics.showcase.statusStress},null,2));

  const skills = await callShowcase(client, `api.listSkills()`); if (!Array.isArray(skills) || skills.length !== 7) throw new Error(`Expected seven real combat skills, got ${skills?.length || 0}`); manifest.skills = skills;
  const skillFrames = [];
  for (let index = 0; index < skills.length; index += 1) {
    const started = await callShowcase(client, `api.skill(${index})`); if (!started?.ok) throw new Error(`Skill ${index + 1} showcase unavailable`);
    await waitFor(client, `document.querySelector('[data-dev-showcase-phase="cast"]') && document.querySelector('#huntv2SkillCallout.show')`, `skill ${index + 1} cast`); await sleep(100);
    const castFile = `03-skill-cast-${String(index + 1).padStart(2,'0')}-cast-${viewport}.png`; await captureNamed(client, castFile, { ready:false }); const castMetrics = await verifiedShowcaseState(client);
    await waitFor(client, `document.querySelector('[data-dev-showcase-phase="impact"]')`, `skill ${index + 1} impact`, 4000); await sleep(100);
    const impactFile = `03-skill-cast-${String(index + 1).padStart(2,'0')}-impact-${viewport}.png`; await captureNamed(client, impactFile, { ready:false }); const impactMetrics = await verifiedShowcaseState(client);
    if (castMetrics.callout !== started.name + '!' || !castMetrics.cooldowns[index]?.active) throw new Error(`Skill ${index + 1} cast/cooldown proof incomplete: ${JSON.stringify(castMetrics)}`);
    if (castMetrics.docOverflow || impactMetrics.docOverflow) throw new Error(`Skill ${index + 1} overflow`);
    skillFrames.push({index,id:started.id,name:started.name,cast:{file:castFile,metrics:castMetrics},impact:{file:impactFile,metrics:impactMetrics}});
  }
  await callShowcase(client, `api.scene('03-skill-cast',{index:0})`); await sleep(180); await screenshot(client, `03-skill-cast-${viewport}.png`); manifest.scenes.push({id:'03-skill-cast',file:`03-skill-cast-${viewport}.png`,frames:skillFrames});

  await callShowcase(client, `api.scene('04-damage-stress')`); await sleep(150); const damageNormalMetrics = await verifiedShowcaseState(client); if (damageNormalMetrics.docOverflow || !damageNormalMetrics.damageNumbers.some(entry => entry.class.includes('kind-direct') && !entry.class.includes('crit'))) throw new Error(`Normal damage presentation proof incomplete: ${JSON.stringify(damageNormalMetrics.damageNumbers)}`); const damageNormalFile = `04-damage-stress-normal-${viewport}.png`; await captureNamed(client, damageNormalFile, { ready:false });
  await waitFor(client, `document.querySelector('.huntv2-float.damage-main.kind-markBurst.show')`, 'canonical mark damage event', 5000); const damageMetrics = await verifiedShowcaseState(client); if (damageMetrics.docOverflow || damageMetrics.damageNumbers.length < 2) throw new Error(`Damage presentation proof incomplete: ${JSON.stringify(damageMetrics)}`); const damageFile = `04-damage-stress-${viewport}.png`; await captureNamed(client, damageFile, { ready:false }); manifest.scenes.push({id:'04-damage-stress',file:damageFile,frames:[{id:'normal-multi-hit',file:damageNormalFile,metrics:damageNormalMetrics}],metrics:damageMetrics}); await screenshot(client, `combat-runtime-damage-stress-${viewport}.png`); manifest.legacy.push(`combat-runtime-damage-stress-${viewport}.png`);

  const bossFrames = [];
  for (const state of ['near-break','broken','recovery']) { await callShowcase(client, `api.bossBreak(${JSON.stringify(state)})`); await sleep(260); const stateMetrics = await verifiedShowcaseState(client); const file = `05-boss-break-${state}-${viewport}.png`; await captureNamed(client,file); bossFrames.push({state,file,metrics:stateMetrics}); if (stateMetrics.docOverflow) throw new Error(`Boss break viewport overflow in ${state}: ${JSON.stringify(stateMetrics)}`); }
  await callShowcase(client, `api.bossBreak('broken')`); await sleep(180); const bossFile = `05-boss-break-${viewport}.png`; await screenshot(client,bossFile); manifest.scenes.push({id:'05-boss-break',file:bossFile,frames:bossFrames});

  await callShowcase(client, `api.scene('06-full-chaos')`); await sleep(980); const chaosMetrics = await verifiedShowcaseState(client); if (chaosMetrics.docOverflow || chaosMetrics.statusStress.player.visible < 4 || chaosMetrics.statusStress.enemy.visible < 4 || !chaosMetrics.enemyIntent) throw new Error(`Full chaos proof incomplete: ${JSON.stringify(chaosMetrics)}`); const chaosFile = `06-full-chaos-${viewport}.png`; await captureNamed(client,chaosFile); manifest.scenes.push({id:'06-full-chaos',file:chaosFile,metrics:chaosMetrics});

  const shakeFrames = [];
  for (const kind of ['light','heavy','critical','ultimate','boss']) {
    await callShowcase(client, `api.scene('01-clean')`); await sleep(180); const before = await verifiedShowcaseState(client); const beforeFile = `screen-shake-${kind}-before-${viewport}.png`; await screenshot(client,beforeFile);
    const started = await callShowcase(client, `api.shake(${JSON.stringify(kind)})`); if (!started?.ok) throw new Error(`Shake ${kind} unavailable`);
    await sleep(45); const impactState = await verifiedShowcaseState(client); const impactFile = `screen-shake-${kind}-impact-${viewport}.png`; await screenshot(client,impactFile);
    // Screenshot transport can outlive the short camera impulse. Fire one more
    // DEV-only presentation pulse for the peak frame, then let it settle cleanly.
    await callShowcase(client, `api.shake(${JSON.stringify(kind)})`);
    await sleep(Math.max(40,Math.round(started.durationMs*.35)+25)); const peakState = await verifiedShowcaseState(client); const peakFile = `screen-shake-${kind}-peak-${viewport}.png`; await screenshot(client,peakFile);
    await sleep(Math.round(started.durationMs*.65)+190); const settled = await verifiedShowcaseState(client); const settledFile = `screen-shake-${kind}-settled-${viewport}.png`; await screenshot(client,settledFile);
    if (settled.docOverflow || settled.rootTransform !== 'none' || settled.stageTransform !== 'none' || settled.cameraActive || Math.abs(settled.cameraX)>0.05 || Math.abs(settled.cameraY)>0.05) throw new Error(`Shake ${kind} did not settle to neutral transform: ${JSON.stringify(settled)}`);
    if (Math.abs(peakState.cameraX)<=0.05 && Math.abs(peakState.cameraY)<=0.05 && Math.abs(impactState.cameraX)<=0.05 && Math.abs(impactState.cameraY)<=0.05) throw new Error(`Shake ${kind} has no measured camera impulse`);
    shakeFrames.push({kind,durationMs:started.durationMs,before:{file:beforeFile,state:before},impact:{file:impactFile,state:impactState},peak:{file:peakFile,state:peakState},settled:{file:settledFile,state:settled},neutral:true});
  }
  manifest.shake = shakeFrames;
  await writeFile(resolve(outDir,'combat-shake-metrics.json'), JSON.stringify({schema:'tutien-combat-screen-shake.v1',viewport:{width,height},frames:shakeFrames},null,2));
  await writeFile(resolve(outDir,`combat-showcase-${viewport}-metrics.json`),JSON.stringify(manifest,null,2));

  await callShowcase(client, `api.scene('01-clean')`); await sleep(180); await client.eval(`document.querySelector('.huntv2-screen.is-dev-showcase')?.classList.remove('is-dev-showcase')`); const fight = await client.eval(`(()=>{const button=document.querySelector('[data-endless-fight]:not([disabled])');if(!button)throw new Error('Boss fight action unavailable');button.click();return true})()`); if (!fight) throw new Error('Boss fight action unavailable');
  await waitFor(client, `document.querySelector('.huntv2-stage.presentation-active,.huntv2-actor.player.state-cast,.huntv2-actor.player.state-attack,.huntv2-actor.player.state-ultimate,.huntv2-actor.enemy.state-hit,.huntv2-float.show,.huntv2-skill-callout.show')`, 'real backend Combat presentation', 10000); await waitFor(client, `document.querySelector('.huntv2-enemy-intent.show')`, 'backend-authored enemy telegraph', 10000); await sleep(180);
  const actionFile = `combat-runtime-action-${viewport}.png`; await captureNamed(client,actionFile); const actionMetrics = await metrics(client); actionMetrics.showcase = await verifiedShowcaseState(client); if (actionMetrics.hasHorizontalOverflow) throw new Error(`Combat action horizontal overflow ${actionMetrics.scrollWidth}px`); await writeFile(resolve(outDir,'combat-runtime-action-metrics.json'),JSON.stringify(actionMetrics,null,2)); manifest.legacy.push(actionFile);
  await writeFile(resolve(outDir,`combat-showcase-${viewport}-metrics.json`),JSON.stringify(manifest,null,2));
  console.log(`COMBAT VISUAL SHOWCASE PASS · ${viewport} · scenes=${manifest.scenes.length} · skills=${manifest.skills.length} · shake=${manifest.shake.length} · support=${clean.supportHudCount}`);
} catch (error) {
  console.error(`[combat-visual] ${error?.stack || error}`); console.error(chromeLog.slice(-4000)); process.exitCode = 1;
} finally {
  client?.close(); try { chrome.kill('SIGTERM'); } catch {} await sleep(200); try { if (!chrome.killed) chrome.kill('SIGKILL'); } catch {}
}
