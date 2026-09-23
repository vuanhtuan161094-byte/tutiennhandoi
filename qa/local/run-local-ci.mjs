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
for (const file of ['web/server.mjs', 'qa/runners/v140-backend-gates.js', 'qa/runners/v140-frontend-gates.js']) {
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
const dirtyFiles = dirtyText.split(/\r?\n/).map(line => line.trimEnd()).filter(Boolean);
const dirty = dirtyFiles.length > 0;
const cleanRefusal = requireClean && dirty;

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
  dirtyFiles,
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
    return out.split(/\r?\n/).map(s => s.trim()).find(Boolean) || null;
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
  for (const candidate of [...envCandidates, ...fileCandidates]) if (candidate && fs.existsSync(candidate)) return candidate;
  const commands = process.platform === 'win32'
    ? ['chrome.exe', 'msedge.exe']
    : ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge'];
  for (const command of commands) {
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
let serverLogStream = null;
let shuttingDown = false;
const reservedPorts = new Set();

function canListen(port) {
  return new Promise(resolve => {
    const probe = net.createServer();
    probe.once('error', () => resolve(false));
    probe.listen(port, '127.0.0.1', () => probe.close(() => resolve(true)));
  });
}

async function reservePort(start, end) {
  for (let port = start; port <= end; port += 1) {
    if (reservedPorts.has(port)) continue;
    if (await canListen(port)) {
      reservedPorts.add(port);
      return port;
    }
  }
  throw new Error(`No free TCP port in ${start}-${end}`);
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
  const serverPort = await reservePort(4173, 4180);
  const base = `http://127.0.0.1:${serverPort}`;
  banner(`START CANONICAL SERVER ${base}`);
  serverLogStream = fs.createWriteStream(serverLogFile, { flags: 'a' });
  server = spawn(node, ['web/server.mjs', String(serverPort), '127.0.0.1'], {
    cwd: repoRoot,
    env: { ...process.env },
    shell: false,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.pipe(serverLogStream);
  server.stderr.pipe(serverLogStream);
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
    if (serverLogStream) {
      serverLogStream.end();
      serverLogStream = null;
    }
  }
}

process.on('SIGINT', async () => { await stopServer(); process.exit(130); });
process.on('SIGTERM', async () => { await stopServer(); process.exit(143); });

const activePhaseTests = [
  ['V161 B1 retreat', 'qa/tests/v161-retreat-contract-audit-test.js'],
  ['V161 B2 early pacing', 'qa/tests/v161-early-pacing-test.js'],
  ['V161 B3 Bound Jade', 'qa/tests/v161-bound-jade-spend-model-test.js'],
  ['V161 B4 manual pacing', 'qa/tests/v161-manual-acquisition-pacing-test.js'],
  ['V161 B5 Spiritual Root × Hunt', 'qa/tests/v161-spiritual-root-hunt-pacing-test.js'],
  ['V161 B6 economy source/sink', 'qa/tests/v161-economy-source-sink-test.js'],
  ['V162 Collection authority B1-B5', 'qa/tests/v162-collection-runtime-authority-test.js'],
  ['V163 B1 Artifact/Relic authority', 'qa/tests/v163-artifact-runtime-authority-test.js'],
  ['V163 B2 Artifact/Relic mutation authority', 'qa/tests/v163-artifact-mutation-authority-test.js'],
  ['V163 B3 Artifact/Relic read-combat authority', 'qa/tests/v163-artifact-read-combat-authority-test.js'],
  ['V163 B4 Artifact/Relic compatibility cleanup', 'qa/tests/v163-artifact-compatibility-cleanup-test.js'],
  ['V164 B1 Pet/Confidant runtime authority', 'qa/tests/v164-pet-confidant-runtime-authority-test.js'],
  ['V164 B2/B3 Pet/Confidant transport-combat', 'qa/tests/v164-pet-confidant-integration-authority-test.js'],
  ['V165 B1 Equipment runtime authority', 'qa/tests/v165-equipment-runtime-authority-test.js'],
  ['V166 Manual/Skill/Heart authority', 'qa/tests/v166-manual-skill-heart-runtime-authority-test.js'],
  ['V167 Alchemy authority', 'qa/tests/v167-alchemy-runtime-authority-test.js'],
  ['V168 Combat/Stat authority B1-B5', 'qa/tests/v168-combat-stat-runtime-authority-test.js'],
  ['V169 Idle authority B1-B5', 'qa/tests/v169-idle-runtime-authority-test.js'],
];

async function runFast() {
  await step('Contract validation', node, ['qa/playtest/validate-contracts.mjs']);
  for (const [label, file] of activePhaseTests) await step(`Active phase · ${label}`, node, [file]);
  await step('Backend Fast QA', node, ['qa/runners/v140-backend-gates.js', 'fast']);
  await step('Frontend Fast QA', node, ['qa/runners/v140-frontend-gates.js', 'fast']);
}

async function runBrowser(base, chromePath, skipContractValidation = false) {
  if (!skipContractValidation) await step('Browser contract validation', node, ['qa/playtest/validate-contracts.mjs']);
  const cdpPort = await reservePort(9333, 9399);
  await step('Deterministic browser playtest', node, [
    'qa/playtest/run-scenarios.mjs',
    '--base', base,
    '--out', playtestOut,
    '--chrome', chromePath,
    '--cdp-port', String(cdpPort),
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
  const uiPort = await reservePort(9222, 9299);
  await step('Runtime UI baseline capture', node, [
    'qa/visual/capture-runtime-ui.mjs',
    '--base', base,
    '--out', visualOut,
    '--chrome', chromePath,
    '--seed', '20260913',
    '--realm', '10',
    '--cdp-port', String(uiPort),
  ], { env: { CHROME_PATH: chromePath, TUTIEN_VISUAL_SEED: '20260913', TUTIEN_VISUAL_REALM: '10' } });

  const reference = path.resolve(repoRoot, 'docs/ui/reference/REFERENCE_COMBAT_TARGET_20260905.png');
  if (fs.existsSync(reference)) fs.copyFileSync(reference, path.join(visualOut, 'combat-target-reference.png'));

  const specs = [
    ['Combat visual 390x844', visualOut, 390, 844],
    ['Combat visual 360x800', path.join(visualOut, 'compact'), 360, 800],
    ['Combat visual 412x915', path.join(visualOut, 'portrait-412'), 412, 915],
    ['Combat visual 430x932', path.join(visualOut, 'portrait-430'), 430, 932],
  ];
  for (const [label, outDir, width, height] of specs) {
    const cdpPort = await reservePort(9222, 9299);
    await captureCombat(label, base, chromePath, outDir, cdpPort, width, height);
  }
  await step('Validate local visual proof', node, ['qa/local/validate-visual-proof.mjs', '--root', visualOut]);
}

function writeSummary() {
  summary.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(runRoot, 'local-ci-summary.json'), JSON.stringify(summary, null, 2));
  const passed = summary.steps.filter(item => item.status === 'pass').length;
  const failed = summary.steps.filter(item => item.status === 'fail').length;
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

if (cleanRefusal) {
  summary.status = 'fail';
  summary.error = 'Local CI --require-clean refused a dirty working tree.';
  banner('LOCAL CI PREFLIGHT FAIL');
  console.error(summary.error);
  console.error('Dirty working tree:');
  for (const line of dirtyFiles) console.error(`  ${line}`);
  appendLog(`${summary.error}\nDirty working tree:\n${dirtyFiles.map(line => `  ${line}`).join('\n')}\n`);
  writeSummary();
  console.log(`\nSummary: ${path.join(runRoot, 'README.md')}`);
  console.log(`Log    : ${logFile}`);
  process.exit(2);
}

let exitCode = 0;
try {
  if (mode === 'fast' || mode === 'full') await runFast();
  if (mode === 'browser' || mode === 'visual' || mode === 'full') {
    const chromePath = detectChrome();
    if (!chromePath) throw new Error('Chrome/Edge not found. Install Chrome/Edge or set CHROME_PATH to the browser executable.');
    summary.chromePath = chromePath;
    console.log(`Browser    : ${chromePath}`);
    const base = await startServer();
    if (mode === 'browser' || mode === 'full') await runBrowser(base, chromePath, mode === 'full');
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
