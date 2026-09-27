import { spawnSync } from 'node:child_process';

const regression = spawnSync(process.execPath, ['qa/tests/nguhanh-equipment-retirement-regression-test.js'], {
  cwd: process.cwd(), stdio: 'inherit', shell: false, windowsHide: true,
});
if (regression.status !== 0) process.exit(regression.status ?? 1);
await import('./run-local-ci-pre-nguhanh-retirement.mjs');
