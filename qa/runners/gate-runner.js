import { spawn } from 'node:child_process';
import path from 'node:path';

const DEFAULT_CONCURRENCY = Math.max(1, Math.min(6, Number(process.env.V140_QA_CONCURRENCY) || 4));
const DEFAULT_TIMEOUT_MS = Math.max(5_000, Number(process.env.V140_QA_TIMEOUT_MS) || 120_000);
const MAX_BUFFER_CHARS = 32 * 1024 * 1024;

function tail(text, lines = 60) {
  return String(text ?? '').split(/\r?\n/).slice(-lines).join('\n');
}

function runOne(file, { testsDir, repoRoot, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [path.join(testsDir, file)], {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const append = (current, chunk) => {
      if (current.length >= MAX_BUFFER_CHARS) return current;
      return (current + chunk.toString()).slice(0, MAX_BUFFER_CHARS);
    };
    child.stdout.on('data', chunk => { stdout = append(stdout, chunk); });
    child.stderr.on('data', chunk => { stderr = append(stderr, chunk); });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);
    child.on('error', error => {
      clearTimeout(timer);
      resolve({ file, ok: false, stdout, stderr: `${stderr}\n${error.stack ?? error}`, timedOut });
    });
    child.on('close', code => {
      clearTimeout(timer);
      resolve({ file, ok: !timedOut && code === 0, stdout, stderr, timedOut, code });
    });
  });
}

export async function runGateFiles({ label, tests, testsDir, repoRoot, concurrency = DEFAULT_CONCURRENCY }) {
  console.log(`${label} · ${tests.length} · concurrency=${Math.min(concurrency, tests.length)}`);
  const results = new Array(tests.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= tests.length) return;
      results[index] = await runOne(tests[index], { testsDir, repoRoot });
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tests.length) }, () => worker()));

  const failed = [];
  for (const result of results) {
    if (result.ok) {
      console.log(`✓ ${result.file}`);
      continue;
    }
    failed.push(result.file);
    console.error(`✗ ${result.file}${result.timedOut ? ' (timeout)' : ''}`);
    console.error(tail(`${result.stdout}\n${result.stderr}`));
  }
  console.log(`${label}: ${tests.length - failed.length}/${tests.length} PASS`);
  if (failed.length) process.exitCode = 1;
  return { pass: tests.length - failed.length, total: tests.length, failed };
}
