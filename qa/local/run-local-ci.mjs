import { spawnSync } from 'node:child_process';

const preflightTests = [
  'qa/tests/nguhanh-equipment-retirement-regression-test.js',
  'qa/tests/v145-spiritual-root-reincarnation-test.js',
];

for (const testFile of preflightTests) {
  const result = spawnSync(process.execPath, [testFile], {
    cwd: process.cwd(), stdio: 'inherit', shell: false, windowsHide: true,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

await import('./run-local-ci-core.mjs');
