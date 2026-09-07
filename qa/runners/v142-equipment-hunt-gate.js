import { spawnSync } from 'node:child_process';

const tests = [
  'qa/tests/v142-equipment-fragment-economy-test.js',
];

for (const file of tests) {
  const result = spawnSync(process.execPath, [file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('V142 equipment x Hunt gate PASS');
