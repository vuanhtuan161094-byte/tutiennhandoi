import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);
const baseUrl = String(args.get('--base') || process.env.TUTIEN_VISUAL_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const outDir = resolve(args.get('--out') || process.env.TUTIEN_VISUAL_OUT_DIR || 'artifacts/ui-visual');
const chromePath = args.get('--chrome') || process.env.CHROME_PATH || process.env.GOOGLE_CHROME_BIN || 'google-chrome';
const seed = Number(args.get('--seed') || process.env.TUTIEN_VISUAL_SEED || 20260913);
const realmOrder = Number(args.get('--realm') || process.env.TUTIEN_VISUAL_REALM || 10);
const cdpPort = Number(args.get('--cdp-port') || 9222);
const profileDir = resolve('.tmp/ui-visual-chrome-profile');

await rm(profileDir, { recursive: true, force: true });
await mkdir(profileDir, { recursive: true });
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--hide-scrollbars',
  '--mute-audio',
  `--remote-debugging-port=${cdpPort}`,
  `--user-data-dir=${profileDir}`,
  'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });

let chromeLog = '';
chrome.stdout.on('data', chunk => { chromeLog += chunk.toString(); });
chrome.stderr.on('data', chunk => { chromeLog += chunk.toString(); });

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function pollJson(url, timeoutMs = 15000) {
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
  throw new Error(`CDP unavailable at ${url}: ${lastError?.message || 'timeout'}`);
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();
  }
  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket connect timeout')), 10000);
      this.ws.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
      this.ws.addEventListener('error', event => { clearTimeout(timer); reject(new Error(`WebSocket error: ${event?.message || 'unknown'}`)); }, { once: true });
    });
    this.ws.addEventListener('message', event => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const entry = this.pending.get(message.id);
        if (!entry) return;
        this.pending.delete(message.id);
        if (message.error) entry.reject(new Error(`${entry.method}: ${message.error.message}`));
        else entry.resolve(message.result || {});
        return;
      }
      const listeners = this.events.get(message.method) || [];
      this.events.set(message.method, listeners.filter(listener => {
        try { listener.resolve(message.params || {}); } catch {}
        return false;
      }));
    });
    this.ws.addEventListener('close', () => {
      for (const entry of this.pending.values()) entry.reject(new Error(`CDP closed while waiting for ${entry.method}`));
      this.pending.clear();
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { method, resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  once(method, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const listener = { resolve, reject };
      const list = this.events.get(method) || [];
      list.push(listener);
      this.events.set(method, list);
      setTimeout(() => {
        const current = this.events.get(method) || [];
        if (current.includes(listener)) {
          this.events.set(method, current.filter(x => x !== listener));
          reject(new Error(`Timed out waiting for ${method}`));
        }
      }, timeoutMs);
    });
  }
  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
    if (result.exceptionDetails) {
      const description = result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Runtime.evaluate failed';
      throw new Error(description);
    }
    return result.result?.value;
  }
  close() { try { this.ws?.close(); } catch {} }
}

async function waitFor(client, expression, label, timeoutMs = 20000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      if (await client.evaluate(`Boolean(${expression})`)) return;
    } catch (error) { lastError = error; }
    await sleep(180);
  }
  throw new Error(`Timeout waiting for ${label}${lastError ? `: ${lastError.message}` : ''}`);
}

async function navigate(client, url) {
  const loaded = client.once('Page.loadEventFired', 20000).catch(() => null);
  await client.send('Page.navigate', { url });
  await loaded;
  await waitFor(client, `document.readyState === 'complete'`, `document ready at ${url}`);
}

async function setViewport(client, width, height) {
  await client.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: true, screenWidth: width, screenHeight: height,
    screenOrientation: { type: 'portraitPrimary', angle: 0 },
  });
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
}

async function waitForVisualReady(client, screen) {
  const selector = screen === 'cultivation' ? '.ui-home-hero' : '#content';
  await waitFor(client, `document.body.dataset.uxShell === 'p0' && document.body.dataset.gameScreen === ${JSON.stringify(screen)} && document.querySelector(${JSON.stringify(selector)})`, `${screen} runtime shell`);
  await waitFor(client, `!document.querySelector('#notice') || document.querySelector('#notice').classList.contains('hidden')`, `${screen} transient notice cleared`, 6000);
  await client.evaluate(`(async()=>{ if(document.fonts?.ready) await document.fonts.ready; const images=[...document.images]; await Promise.all(images.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});setTimeout(resolve,3000);}))); return true; })()`);
  await sleep(350);
}

async function capture(client, name, width, height, screen) {
  await setViewport(client, width, height);
  await waitForVisualReady(client, screen);
  const metrics = await client.evaluate(`({
    screen:document.body.dataset.gameScreen,
    uxShell:document.body.dataset.uxShell,
    viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
    scrollWidth:document.documentElement.scrollWidth,
    scrollHeight:document.documentElement.scrollHeight,
    hasHorizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,
    title:document.title,
    url:location.href
  })`);
  if (metrics.hasHorizontalOverflow) throw new Error(`${name}: horizontal overflow ${metrics.scrollWidth}px > ${metrics.viewport.width}px`);
  const result = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  const file = resolve(outDir, `${name}.png`);
  await writeFile(file, Buffer.from(result.data, 'base64'));
  return { name, file: `${name}.png`, width, height, screen, metrics };
}

async function smokeHomeSideRail(client) {
  const selector='[data-home-target-side-rail="left"] [data-home-target-route="roots"]';
  await waitFor(client, `document.querySelector(${JSON.stringify(selector)})`, 'Home canonical Linh Căn side-rail control');
  const before=await client.evaluate(`({screen:document.body.dataset.gameScreen,label:document.querySelector(${JSON.stringify(selector)})?.getAttribute('aria-label')||''})`);
  await client.evaluate(`(()=>{const button=document.querySelector(${JSON.stringify(selector)});if(!button)throw new Error('Home roots side rail missing');button.click();return true;})()`);
  await waitFor(client, `document.body.dataset.gameScreen === 'roots' && document.querySelector('.v2314-roots')`, 'Home side rail canonical roots navigation');
  const after=await client.evaluate(`({screen:document.body.dataset.gameScreen,heading:document.querySelector('.v2314-roots h1')?.textContent||''})`);
  if(before.screen!=='cultivation'||after.screen!=='roots')throw new Error(`Home side-rail smoke failed: ${before.screen} -> ${after.screen}`);
  await navigate(client, `${baseUrl}/?tab=cultivation&visualqa=1`);
  await waitForVisualReady(client, 'cultivation');
  return {name:'home-side-rail-roots',from:before.screen,to:after.screen,label:before.label,heading:after.heading,canonicalProxy:true};
}

let client;
try {
  const version = await pollJson(`http://127.0.0.1:${cdpPort}/json/version`);
  let target;
  try {
    const response = await fetch(`http://127.0.0.1:${cdpPort}/json/new?about:blank`, { method: 'PUT' });
    if (response.ok) target = await response.json();
  } catch {}
  if (!target) {
    const targets = await pollJson(`http://127.0.0.1:${cdpPort}/json/list`);
    target = targets.find(item => item.type === 'page');
  }
  if (!target?.webSocketDebuggerUrl) throw new Error('No page target available from Chrome CDP.');
  client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Network.enable');

  await setViewport(client, 390, 844);
  await navigate(client, `${baseUrl}/?dev=1&tab=cultivation&visualqa=1`);
  await waitFor(client, `document.body.dataset.uxShell === 'p0' && document.querySelector('#content')?.children.length > 0`, 'DEV runtime bootstrap');
  const fixture = await client.evaluate(`(async()=>{
    const headers={'content-type':'application/json'};
    const post=async(path,body)=>{const response=await fetch(path,{method:'POST',headers,body:JSON.stringify(body)});const data=await response.json();if(!response.ok||data.ok===false)throw new Error(data.error||('HTTP '+response.status));return data;};
    await post('/api/dev/new',{seed:${JSON.stringify(seed)}});
    await post('/api/dev/action',{action:'devSandboxPreset',realmOrder:${JSON.stringify(realmOrder)},dao:'sword',forceBoss:false});
    const response=await fetch('/api/dev/save',{cache:'no-store'});const data=await response.json();if(!response.ok||data.ok===false||!data.save)throw new Error(data.error||'DEV save unavailable');
    localStorage.setItem('tutien.web.save.v1',JSON.stringify(data.save));
    return {seed:${JSON.stringify(seed)},realmOrder:${JSON.stringify(realmOrder)},schema:data.save?.schema||null};
  })()`);

  const screens = [];
  const interactionChecks = [];
  await navigate(client, `${baseUrl}/?tab=cultivation&visualqa=1`);
  await waitForVisualReady(client, 'cultivation');
  screens.push(await capture(client, 'home-hud-390x844', 390, 844, 'cultivation'));
  interactionChecks.push(await smokeHomeSideRail(client));
  screens.push(await capture(client, 'home-hud-412x915', 412, 915, 'cultivation'));

  await navigate(client, `${baseUrl}/?tab=character&visualqa=1`);
  await waitForVisualReady(client, 'character');
  screens.push(await capture(client, 'character-baseline-390x844', 390, 844, 'character'));

  const manifest = {
    schema: 'tutien-ui-visual-proof.v1',
    generatedAt: new Date().toISOString(),
    baseUrl,
    chromeVersion: version.Browser || null,
    fixture,
    sourceMode: 'actual-runtime-production-url-after-save-safe-dev-fixture-bootstrap',
    mockOrReconstruction: false,
    interactionChecks,
    screens,
  };
  await writeFile(resolve(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`VISUAL PROOF PASS · ${screens.length} runtime screenshots · ${interactionChecks.length} runtime interaction smoke · ${outDir}`);
  for (const check of interactionChecks) console.log(`- interaction ${check.name} · ${check.from} -> ${check.to}`);
  for (const screen of screens) console.log(`- ${screen.file} · ${screen.width}x${screen.height} · ${screen.screen}`);
} catch (error) {
  console.error(`[ui-visual] ${error?.stack || error}`);
  console.error(chromeLog.slice(-6000));
  process.exitCode = 1;
} finally {
  client?.close();
  try { chrome.kill('SIGTERM'); } catch {}
  await sleep(200);
  try { if (!chrome.killed) chrome.kill('SIGKILL'); } catch {}
}
