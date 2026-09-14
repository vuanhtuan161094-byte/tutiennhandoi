import { spawn } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);

const baseUrl = String(args.get('--base') || process.env.TUTIEN_PLAYTEST_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const outDir = resolve(args.get('--out') || process.env.TUTIEN_PLAYTEST_OUT_DIR || 'artifacts/ai-playtest');
const chromePath = args.get('--chrome') || process.env.CHROME_PATH || process.env.GOOGLE_CHROME_BIN || 'google-chrome';
const cdpPort = Number(args.get('--cdp-port') || process.env.TUTIEN_PLAYTEST_CDP_PORT || 9333);
const profileDir = resolve('.tmp/ai-playtest-chrome-profile');
const config = JSON.parse(await readFile(args.get('--scenarios') || 'qa/playtest/scenarios.json', 'utf8'));

if (config.schema !== 'tutien-ai-playtest.scenarios.v1') throw new Error(`Unsupported scenario schema: ${config.schema}`);

await rm(profileDir, { recursive: true, force: true });
await rm(outDir, { recursive: true, force: true });
await mkdir(profileDir, { recursive: true });
await mkdir(outDir, { recursive: true });

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
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

async function pollJson(url, timeoutMs = 15000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(150);
  }
  throw new Error(`CDP unavailable: ${lastError?.message || 'timeout'}`);
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = new Map();
  }
  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CDP connect timeout')), 10000);
      this.ws.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
      this.ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('CDP connect error')); }, { once: true });
    });
    this.ws.addEventListener('message', event => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`));
        else pending.resolve(message.result || {});
        return;
      }
      for (const handler of this.handlers.get(message.method) || []) {
        try { handler(message.params || {}); } catch {}
      }
    });
  }
  on(method, handler) {
    const list = this.handlers.get(method) || [];
    list.push(handler);
    this.handlers.set(method, list);
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { method, resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Runtime.evaluate failed');
    }
    return result.result?.value;
  }
  close() { try { this.ws?.close(); } catch {} }
}

async function waitFor(client, expression, label, timeoutMs) {
  const started = Date.now();
  const limit = timeoutMs || config.defaults?.timeoutMs || 20000;
  let lastError;
  while (Date.now() - started < limit) {
    try {
      if (await client.eval(`Boolean(${expression})`)) return;
    } catch (error) {
      lastError = error;
    }
    await sleep(180);
  }
  throw new Error(`Timeout waiting for ${label}${lastError ? `: ${lastError.message}` : ''}`);
}

async function navigate(client, url) {
  await client.send('Page.navigate', { url });
  await waitFor(client, `document.readyState === 'complete'`, `document ready at ${url}`);
}

async function setViewport(client, viewport) {
  const width = Number(viewport?.width || 390);
  const height = Number(viewport?.height || 844);
  await client.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: true,
    screenWidth: width,
    screenHeight: height,
    screenOrientation: { type: 'portraitPrimary', angle: 0 },
  });
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
}

async function visualReady(client) {
  await client.eval(`(async()=>{
    if(document.fonts?.ready) await document.fonts.ready;
    await Promise.all([...document.images].map(img => img.complete ? Promise.resolve() : new Promise(resolve => {
      img.addEventListener('load', resolve, { once:true });
      img.addEventListener('error', resolve, { once:true });
      setTimeout(resolve, 2500);
    })));
    return true;
  })()`);
  await sleep(250);
}

async function screenshot(client, name) {
  const shot = await client.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  });
  const file = `${name}.png`;
  await writeFile(resolve(outDir, file), Buffer.from(shot.data, 'base64'));
  return file;
}

async function collectMetrics(client) {
  return client.eval(`(()=>{
    const visible = e => {
      const s=getComputedStyle(e), r=e.getBoundingClientRect();
      return s.display!=='none' && s.visibility!=='hidden' && Number(s.opacity||1)>0 && r.width>0 && r.height>0;
    };
    const controls=[...document.querySelectorAll('button,a,[role="button"],input,select,textarea,[data-action],[data-home-target-route],[data-endless-fight]')]
      .filter(visible)
      .slice(0,80)
      .map(e => ({
        tag:e.tagName.toLowerCase(),
        id:e.id||'',
        text:String(e.textContent||e.value||'').replace(/\\s+/g,' ').trim().slice(0,100),
        aria:e.getAttribute('aria-label')||'',
        action:e.getAttribute('data-action')||'',
        route:e.getAttribute('data-home-target-route')||'',
        disabled:Boolean(e.disabled || e.getAttribute('aria-disabled')==='true')
      }));
    const missingImages=[...document.images]
      .filter(img => img.complete && img.naturalWidth===0)
      .map(img => img.currentSrc||img.src||'')
      .slice(0,30);
    return {
      screen:document.body.dataset.gameScreen||null,
      uxShell:document.body.dataset.uxShell||null,
      viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
      scrollWidth:document.documentElement.scrollWidth,
      scrollHeight:document.documentElement.scrollHeight,
      hasHorizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,
      contentChildren:document.querySelector('#content')?.children.length||0,
      savePresent:Boolean(localStorage.getItem('tutien.web.save.v1')),
      missingImages,
      controls,
      title:document.title,
      url:location.href
    };
  })()`);
}

async function bootstrapFixture(client, scenario) {
  const seed = Number(config.fixture?.seed || 20260914);
  const dao = String(config.fixture?.dao || 'sword');
  const realmOrder = Number(scenario.realmOrder || 10);
  const forceBoss = Boolean(scenario.forceBoss);
  return client.eval(`(async()=>{
    const headers={'content-type':'application/json'};
    const post=async(path,body)=>{
      const response=await fetch(path,{method:'POST',headers,body:JSON.stringify(body)});
      const data=await response.json();
      if(!response.ok||data.ok===false) throw new Error(data.error||('HTTP '+response.status));
      return data;
    };
    await post('/api/dev/new',{seed:${JSON.stringify(seed)}});
    await post('/api/dev/action',{action:'devSandboxPreset',realmOrder:${JSON.stringify(realmOrder)},dao:${JSON.stringify(dao)},forceBoss:${JSON.stringify(forceBoss)}});
    const response=await fetch('/api/dev/save',{cache:'no-store'});
    const data=await response.json();
    if(!response.ok||data.ok===false||!data.save) throw new Error(data.error||'DEV save unavailable');
    localStorage.setItem('tutien.web.save.v1',JSON.stringify(data.save));
    return {seed:${JSON.stringify(seed)},realmOrder:${JSON.stringify(realmOrder)},dao:${JSON.stringify(dao)},forceBoss:${JSON.stringify(forceBoss)},schema:data.save?.schema||null};
  })()`);
}

function requiredSelectorExpression(selectors) {
  return selectors.map(selector => `document.querySelector(${JSON.stringify(selector)})`).join(' && ');
}

async function executeInteraction(client, scenario) {
  const interaction = scenario.interaction;
  if (!interaction) return null;

  if (interaction.type === 'reload') {
    const before = await client.eval(`localStorage.getItem('tutien.web.save.v1')`);
    if (!before) throw new Error('Save restore smoke: save missing before reload');
    await client.send('Page.reload', { ignoreCache: true });
    await waitFor(client, `document.readyState === 'complete'`, `${scenario.id} reload`);
    await waitFor(client, `document.body.dataset.uxShell === 'p0' && document.querySelector('#content')?.children.length > 0`, `${scenario.id} restored shell`);
    const after = await client.eval(`localStorage.getItem('tutien.web.save.v1')`);
    if (!after) throw new Error('Save restore smoke: save missing after reload');
    return { type: interaction.type, saveBytesBefore: before.length, saveBytesAfter: after.length };
  }

  await waitFor(client, `document.querySelector(${JSON.stringify(interaction.selector)})`, `${scenario.id} interaction control`);
  await client.eval(`(()=>{
    const el=document.querySelector(${JSON.stringify(interaction.selector)});
    if(!el) throw new Error('interaction control unavailable');
    el.click();
    return true;
  })()`);

  if (interaction.type === 'click-route') {
    await waitFor(client, `document.body.dataset.gameScreen === ${JSON.stringify(interaction.waitForScreen)} && document.querySelector(${JSON.stringify(interaction.waitForSelector)})`, `${scenario.id} routed screen`);
    return { type: interaction.type, reachedScreen: await client.eval(`document.body.dataset.gameScreen`) };
  }

  if (interaction.type === 'click-action') {
    const selectors = interaction.waitForAnySelectors || [];
    const expression = selectors.map(selector => `document.querySelector(${JSON.stringify(selector)})`).join(' || ');
    await waitFor(client, expression || 'false', `${scenario.id} action presentation`, 10000);
    await sleep(120);
    return { type: interaction.type, presentationDetected: true };
  }

  throw new Error(`${scenario.id}: unknown interaction type ${interaction.type}`);
}

let client;
const report = {
  schema: 'tutien-ai-playtest.report.v1',
  generatedAt: new Date().toISOString(),
  baseUrl,
  sourceMode: 'actual-runtime-production-url-after-save-safe-dev-fixture-bootstrap',
  mockOrReconstruction: false,
  chromeVersion: null,
  scenarios: [],
};

const active = {
  id: null,
  consoleErrors: [],
  networkFailures: [],
};

try {
  const version = await pollJson(`http://127.0.0.1:${cdpPort}/json/version`);
  report.chromeVersion = version.Browser || null;
  let target;
  try {
    const response = await fetch(`http://127.0.0.1:${cdpPort}/json/new?about:blank`, { method: 'PUT' });
    if (response.ok) target = await response.json();
  } catch {}
  if (!target) {
    const list = await pollJson(`http://127.0.0.1:${cdpPort}/json/list`);
    target = list.find(item => item.type === 'page');
  }
  if (!target?.webSocketDebuggerUrl) throw new Error('No Chrome page target');

  client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Network.enable');
  await client.send('Log.enable');

  client.on('Runtime.exceptionThrown', params => {
    if (active.id) active.consoleErrors.push({ type:'exception', text:params.exceptionDetails?.text || 'Runtime exception' });
  });
  client.on('Runtime.consoleAPICalled', params => {
    if (active.id && params.type === 'error') {
      active.consoleErrors.push({
        type:'console.error',
        text:(params.args || []).map(arg => arg.value ?? arg.description ?? '').join(' ').slice(0,1000)
      });
    }
  });
  client.on('Log.entryAdded', params => {
    if (active.id && params.entry?.level === 'error') {
      active.consoleErrors.push({ type:'log.error', text:String(params.entry.text || '').slice(0,1000) });
    }
  });
  client.on('Network.loadingFailed', params => {
    if (active.id) {
      active.networkFailures.push({ type:'loadingFailed', errorText:params.errorText, canceled:Boolean(params.canceled) });
    }
  });
  client.on('Network.responseReceived', params => {
    const status = Number(params.response?.status || 0);
    if (active.id && status >= 400) {
      active.networkFailures.push({ type:'http', status, url:params.response?.url || '' });
    }
  });

  for (const scenario of config.scenarios) {
    active.id = scenario.id;
    active.consoleErrors = [];
    active.networkFailures = [];
    const result = {
      id: scenario.id,
      status: 'FAIL',
      fixture: null,
      before: null,
      interaction: null,
      after: null,
      screenshots: [],
      consoleErrors: active.consoleErrors,
      networkFailures: active.networkFailures,
      error: null,
    };

    try {
      await setViewport(client, scenario.viewport || config.defaults?.viewport);
      await navigate(client, `${baseUrl}/?dev=1&tab=cultivation&visualqa=1`);
      await waitFor(client, `document.body.dataset.uxShell === 'p0' && document.querySelector('#content')?.children.length > 0`, `${scenario.id} DEV bootstrap shell`);
      result.fixture = await bootstrapFixture(client, scenario);

      await navigate(client, `${baseUrl}/?tab=${encodeURIComponent(scenario.tab)}&visualqa=1`);
      await waitFor(client, `document.body.dataset.uxShell === 'p0'`, `${scenario.id} P0 shell`);
      if (scenario.expectedScreen) {
        await waitFor(client, `document.body.dataset.gameScreen === ${JSON.stringify(scenario.expectedScreen)}`, `${scenario.id} expected screen`);
      }
      await waitFor(client, requiredSelectorExpression(scenario.requiredSelectors), `${scenario.id} required selectors`);
      await waitFor(client, `!document.querySelector('#notice') || document.querySelector('#notice').classList.contains('hidden')`, `${scenario.id} transient notice clear`, 6000);
      await visualReady(client);

      result.before = await collectMetrics(client);
      if (result.before.hasHorizontalOverflow) throw new Error(`Horizontal overflow ${result.before.scrollWidth}px > ${result.before.viewport.width}px`);
      if (!result.before.savePresent) throw new Error('Expected deterministic save in localStorage');
      if (result.before.missingImages.length) throw new Error(`Missing images: ${result.before.missingImages.join(', ')}`);
      result.screenshots.push(await screenshot(client, scenario.id));

      result.interaction = await executeInteraction(client, scenario);
      if (scenario.interaction) {
        await visualReady(client);
        result.after = await collectMetrics(client);
        if (result.after.hasHorizontalOverflow) throw new Error(`Post-action horizontal overflow ${result.after.scrollWidth}px > ${result.after.viewport.width}px`);
        result.screenshots.push(await screenshot(client, `${scenario.id}-after`));
      }

      const hardConsole = active.consoleErrors.filter(entry => !/favicon|ResizeObserver/i.test(entry.text || ''));
      const hardNetwork = active.networkFailures.filter(entry => !(entry.canceled || /favicon/i.test(entry.url || '')));
      if (hardConsole.length) throw new Error(`Console/runtime errors: ${hardConsole.map(x => x.text).join(' | ').slice(0,1200)}`);
      if (hardNetwork.length) throw new Error(`Network failures: ${hardNetwork.map(x => `${x.status || ''} ${x.url || x.errorText || ''}`).join(' | ').slice(0,1200)}`);

      result.status = 'PASS';
      console.log(`PASS · ${scenario.id} · screen=${result.before.screen} · controls=${result.before.controls.length}`);
    } catch (error) {
      result.error = String(error?.stack || error);
      console.error(`FAIL · ${scenario.id} · ${error?.message || error}`);
    } finally {
      report.scenarios.push(result);
    }
  }
} catch (error) {
  report.fatalError = String(error?.stack || error);
  console.error(`[ai-playtest] ${error?.stack || error}`);
  console.error(chromeLog.slice(-5000));
} finally {
  active.id = null;
  await writeFile(resolve(outDir, 'playtest-report.json'), JSON.stringify(report, null, 2));
  client?.close();
  try { chrome.kill('SIGTERM'); } catch {}
  await sleep(200);
  try { if (!chrome.killed) chrome.kill('SIGKILL'); } catch {}
}

const failed = Boolean(report.fatalError) || report.scenarios.some(scenario => scenario.status !== 'PASS');
if (failed) {
  console.error(`AI PLAYTEST FAIL · ${report.scenarios.filter(s => s.status !== 'PASS').map(s => s.id).join(', ') || 'fatal'}`);
  process.exitCode = 1;
} else {
  console.log(`AI PLAYTEST PASS · ${report.scenarios.length}/${report.scenarios.length} scenarios · ${outDir}`);
}
