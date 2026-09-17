import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const rawArgs = process.argv.slice(2);
const modeArg = rawArgs.find(arg => !arg.startsWith('--')) || 'full';
const mode = String(modeArg).toLowerCase();
const requireClean = rawArgs.includes('--require-clean');
const allowedModes = new Set(['fast', 'browser', 'visual', 'full']);
if (!allowedModes.has(mode)) {
  console.error(`Unknown Local CI mode: ${mode}. Use fast | browser | visual | full.`);
  process.exit(2);
}

const repoRoot = process.cwd();
const required = ['web/server.mjs', 'qa/runners/v140-backend-gates.js', 'qa/runners/v140-frontend-gates.js'];
for (const file of required) {
  if (!fs.existsSync(path.resolve(repoRoot, file))) {
    console.error(`Run Local CI from repository root. Missing: ${file}`);
    process.exit(2);
  }
}

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (!Number.isFinite(nodeMajor) || nodeMajor < 22) {
  console.error(`Node.js 22+ required. Current: ${process.version}`);
  process.exit(2);
}

function git(args, fallback = '') {
  try {
    return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return fallback;
  }
}

const sha = git(['rev-parse', 'HEAD'], 'NO_GIT_SHA');
const branch = git(['branch', '--show-current'], 'unknown') || 'detached';
const dirtyText = git(['status', '--porcelain'], '');
const dirty = Boolean(dirtyText.trim());
if (requireClean && dirty) {
  console.error('Local CI --require-clean refused a dirty working tree. Commit/stash changes first.');
  process.exit(2);
}

const now = new Date();
const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const shaTag = sha === 'NO_GIT_SHA' ? 'nogit' : sha.slice(0, 8);
const runRoot = path.resolve(repoRoot, 'artifacts', 'local-ci', `${stamp}-${shaTag}-${dirty ? 'dirty' : 'clean'}-${mode}`);
const playtestOut = path.join(runRoot, 'ai-playtest');
const visualOut = path.join(runRoot, 'ui-visual');
const logFile = path.join(runRoot, 'local-ci.log');
const serverLogFile = path.join(runRoot, 'server.log');
fs.mkdirSync(runRoot, { recursive: true });
fs.writeFileSync(logFile, '');

const summary = {
  schema: 'tutien-local-ci.v1',
  mode,
  startedAt: now.toISOString(),
  repositoryRoot: repoRoot,
  sha,
  branch,
  dirty,
  exactShaEvidence: sha !== 'NO_GIT_SHA' && !dirty,
  node: process.version,
  platform: `${process.platform}-${process.arch}`,
  hostname: os.hostname(),
  chromePath: null,
  serverBase: null,
  status: 'running',
  steps: [],
  artifactRoot: runRoot,
};

function appendLog(text) {
  fs.appendFileSync(logFile, text);
}
function banner(text) {
  const line = `\n===== ${text} =====\n`;
  process.stdout.write(line);
  appendLog(line);
}

function commandFromPath(name) {
  try {
    const exe = process.platform === 'win32' ? 'where.exe' : 'which';
    const out = execFileSync(exe, [name], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const first = out.split(/\r?\n/).map(s => s.trim()).find(Boolean);
    return first || null;
  } catch {
    return null;
  }
}

function detectChrome() {
  const envCandidates = [process.env.CHROME_PATH, process.env.GOOGLE_CHROME_BIN].filter(Boolean);
  const fileCandidates = [];
  if (process.platform === 'win32') {
    for (const base of [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean)) {
      fileCandidates.push(
        path.join(base, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.join(base, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      );
    }
  } else if (process.platform === 'darwin') {
    fileCandidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    );
  } else {
    fileCandidates.push('/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser');
  }
  for (const candidate of [...envCandidates, ...fileCandidates]) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  for (const command of process.platform === 'win32'
    ? ['chrome.exe', 'msedge.exe']
    : ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge']) {
    const found = commandFromPath(command);
    if (found) return found;
  }
  return null;
}

async function runCommand(label, command, args = [], options = {}) {
  const started = Date.now();
  banner(label);
  appendLog(`$ ${command} ${args.map(arg => JSON.stringify(arg)).join(' ')}\n`);
  return new Promise(resolve => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: { ...process.env, ...(options.env || {}) },
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let combined = '';
    const onData = (stream, chunk) => {
      const text = chunk.toString();
      combined += text;
      stream.write(text);
      appendLog(text);
    };
    child.stdout.on('data', chunk => onData(process.stdout, chunk));
    child.stderr.on('data', chunk => onData(process.stderr, chunk));
    child.on('error', error => {
      const text = `\nPROCESS ERROR: ${error.stack || error.message}\n`;
      combined += text;
      process.stderr.write(text);
      appendLog(text);
    });
    child.on('close', code => resolve({ code: Number(code ?? 1), output: combined, durationMs: Date.now() - started }));
  });
}

async function step(label, command, args = [], options = {}) {
  const result = await runCommand(label, command, args, options);
  summary.steps.push({ label, status: result.code === 0 ? 'pass' : 'fail', durationMs: result.durationMs });
  if (result.code !== 0) throw new Error(`${label} failed with exit code ${result.code}`);
  return result;
}

const node = process.execPath;
let server = null;
let serverPort = null;
let shuttingDown = false;

function canListen(port) {
  return new Promise(resolve => {
    const probe = net.createServer();
    probe.once('error', () => resolve(false));
    probe.listen(port, '127.0.0.1', () => probe.close(() => resolve(true)));
  });
}

async function choosePort() {
  for (let port = 4173; port <= 4180; port += 1) if (await canListen(port)) return port;
  throw new Error('No free Local CI port in 4173-4180. Close an old local game server first.');
}

async function waitForHealth(baseUrl, timeoutMs = 20000) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/__tutien_launcher_health`);
      if (response.ok) return await response.text();
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  throw new Error(`Canonical server health timeout: ${lastError?.message || 'unknown'}`);
}

async function startServer() {
  if (server) return summary.serverBase;
  serverPort = await choosePort();
  const base = `http://127.0.0.1:${serverPort}`;
  banner(`START CANONICAL SERVER ${base}`);
  const out = fs.createWriteStream(serverLogFile, { flags: 'a' });
  server = spawn(node, ['web/server.mjs', String(serverPort), '127.0.0.1'], {
    cwd: repoRoot,
    env: { ...process.env },
    shell: false,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.pipe(out);
  server.stderr.pipe(out);
  server.on('exit', code => appendLog(`\n[server exit] ${code}\n`));
  await waitForHealth(base);
  summary.serverBase = base;
  fs.writeFileSync(path.join(runRoot, 'health.json'), JSON.stringify({ ok: true, base, port: serverPort }, null, 2));
  console.log(`PASS · canonical server healthy · ${base}`);
  return base;
}

async function stopServer() {
  if (!server || shuttingDown) return;
  shuttingDown = true;
  try {
    if (process.platform === 'win32' && server.pid) {
      try { execFileSync('taskkill.exe', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
    } else {
      try { server.kill('SIGTERM'); } catch {}
    }
  } finally {
    server = null;
  }
}

process.on('SIGINT', async () => { await stopServer(); process.exit(130); });
process.on('SIGTERM', async () => { await stopServer(); process.exit(143); });

async function runFast() {
  await step('Contract validation', node, ['qa/playtest/validate-contracts.mjs']);
  await step('Backend Fast QA', node, ['qa/runners/v140-backend-gates.js', 'fast']);
  await step('Frontend Fast QA', node, ['qa/runners/v140-frontend-gates.js', 'fast']);
}

async function runBrowser(base, chromePath) {
  await step('Browser contract validation', node, ['qa/playtest/validate-contracts.mjs']);
  await step('Deterministic browser playtest', node, [
    'qa/playtest/run-scenarios.mjs',
    '--base', base,
    '--out', playtestOut,
    '--chrome', chromePath,
    '--cdp-port', '9333',
  ], { env: { CHROME_PATH: chromePath } });
  await step('Strict browser summary', node, ['qa/playtest/summarize-report.mjs', path.join(playtestOut, 'playtest-report.json')], {
    env: { TUTIEN_PLAYTEST_SHA: dirty ? `${sha}-dirty` : sha },
  });
}

async function captureCombat(label, base, chromePath, outDir, port, width, height) {
  const args = [
    'qa/visual/capture-combat-runtime.mjs',
    '--base', base,
    '--out', outDir,
    '--chrome', chromePath,
    '--cdp-port', String(port),
    '--width', String(width),
    '--height', String(height),
  ];
  const first = await runCommand(`${label} · attempt 1`, node, args, { env: { CHROME_PATH: chromePath } });
  if (first.code === 0) {
    summary.steps.push({ label, status: 'pass', durationMs: first.durationMs, attempts: 1 });
    return;
  }
  if (!first.output.includes('has no measured camera impulse')) {
    summary.steps.push({ label, status: 'fail', durationMs: first.durationMs, attempts: 1 });
    throw new Error(`${label} failed; failure is not the permitted transient shake sampler case`);
  }
  console.log(`RETRY · ${label} · transient shake telemetry sampling only`);
  const second = await runCommand(`${label} · attempt 2`, node, args, { env: { CHROME_PATH: chromePath } });
  summary.steps.push({ label, status: second.code === 0 ? 'pass' : 'fail', durationMs: first.durationMs + second.durationMs, attempts: 2 });
  if (second.code !== 0) throw new Error(`${label} failed after one permitted shake-only retry`);
}

async function runVisual(base, chromePath) {
  await step('Visual workflow contract', node, ['qa/tests/ui-visual-workflow-contract-test.js']);
  await step('Runtime UI baseline capture', node, [
    'qa/visual/capture-runtime-ui.mjs',
    '--base', base,
    '--out', visualOut,
    '--chrome', chromePath,
    '--seed', '20260913',
    '--realm', '10',
    '--cdp-port', '9222',
  ], { env: { CHROME_PATH: chromePath, TUTIEN_VISUAL_SEED: '20260913', TUTIEN_VISUAL_REALM: '10' } });

  const reference = path.resolve(repoRoot, 'docs/ui/reference/REFERENCE_COMBAT_TARGET_20260905.png');
  if (fs.existsSync(reference)) fs.copyFileSync(reference, path.join(visualOut, 'combat-target-reference.png'));

  await captureCombat('Combat visual 390x844', base, chromePath, visualOut, 9223, 390, 844);
  await captureCombat('Combat visual 360x800', base, chromePath, path.join(visualOut, 'compact'), 9224, 360, 800);
  await captureCombat('Combat visual 412x915', base, chromePath, path.join(visualOut, 'portrait-412'), 9225, 412, 915);
  await captureCombat('Combat visual 430x932', base, chromePath, path.join(visualOut, 'portrait-430'), 9226, 430, 932);
  await step('Validate local visual proof', node, ['qa/local/validate-visual-proof.mjs', '--root', visualOut]);
}

function writeSummary() {
  summary.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(runRoot, 'local-ci-summary.json'), JSON.stringify(summary, null, 2));
  const passed = summary.steps.filter(step => step.status === 'pass').length;
  const failed = summary.steps.filter(step => step.status === 'fail').length;
  const md = [
    '# Tu Tien Local CI',
    '',
    `- Status: **${summary.status.toUpperCase()}**`,
    `- Mode: \`${mode}\``,
    `- SHA: \`${sha}\`${dirty ? ' + DIRTY WORKTREE' : ''}`,
    `- Branch: \`${branch}\``,
    `- Exact-SHA evidence: **${summary.exactShaEvidence ? 'YES' : 'NO'}**`,
    `- Node: \`${process.version}\``,
    `- Browser: \`${summary.chromePath || 'not required'}\``,
    `- Passed steps: **${passed}**`,
    `- Failed steps: **${failed}**`,
    '',
    '## Steps',
    ...summary.steps.map(item => `- ${item.status === 'pass' ? 'PASS' : 'FAIL'} · ${item.label}${item.attempts ? ` · attempts=${item.attempts}` : ''}`),
    '',
    `Artifacts: \`${runRoot}\``,
    '',
  ].join('\n');
  fs.writeFileSync(path.join(runRoot, 'README.md'), md);
  fs.mkdirSync(path.resolve(repoRoot, 'artifacts', 'local-ci'), { recursive: true });
  fs.writeFileSync(path.resolve(repoRoot, 'artifacts', 'local-ci', 'LAST_RUN.txt'), `${runRoot}\n`);
}

console.log('==============================================');
console.log(' TU TIEN NHAN ROI · LOCAL CI');
console.log('==============================================');
console.log(`Mode       : ${mode}`);
console.log(`SHA        : ${sha}${dirty ? ' + DIRTY' : ''}`);
console.log(`Branch     : ${branch}`);
console.log(`Node       : ${process.version}`);
console.log(`Artifacts  : ${runRoot}`);
if (dirty) console.log('NOTE       : dirty worktree => result is NOT exact-SHA closure evidence.');

let exitCode = 0;
try {
  if (mode === 'fast' || mode === 'full') await runFast();

  if (mode === 'browser' || mode === 'visual' || mode === 'full') {
    const chromePath = detectChrome();
    if (!chromePath) throw new Error('Chrome/Edge not found. Install Chrome/Edge or set CHROME_PATH to the browser executable.');
    summary.chromePath = chromePath;
    console.log(`Browser    : ${chromePath}`);
    const base = await startServer();
    if (mode === 'browser' || mode === 'full') await runBrowser(base, chromePath);
    if (mode === 'visual' || mode === 'full') await runVisual(base, chromePath);
  }
  summary.status = 'pass';
  banner('LOCAL CI PASS');
} catch (error) {
  exitCode = 1;
  summary.status = 'fail';
  summary.error = error?.stack || String(error);
  banner('LOCAL CI FAIL');
  console.error(error?.stack || error);
  appendLog(`${error?.stack || error}\n`);
} finally {
  await stopServer();
  writeSummary();
  console.log(`\nSummary: ${path.join(runRoot, 'README.md')}`);
  console.log(`Log    : ${logFile}`);
}

process.exit(exitCode);
