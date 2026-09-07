import { spawnSync } from 'node:child_process';

const tests = [
  'qa/tests/v142-equipment-core-test.js',
  'qa/tests/v142-equipment-stat-balance-test.js',
  'qa/tests/v142-equipment-hunt-balance-test.js',
  'qa/tests/v142-equipment-fragment-economy-test.js',
  'qa/tests/v142-equipment-fragment-drop-distribution-test.js',
  'qa/tests/v142-equipment-hunt-settlement-test.js',
  'qa/tests/v142-equipment-crafting-test.js',
  'qa/tests/v142-equipment-set-engraving-test.js',
  'qa/tests/v142-equipment-dungeon-conversion-test.js',
  'qa/tests/v142-equipment-hunt-runtime-integration-test.js',
  'qa/tests/v142-equipment-combat-live-test.js',
  'qa/tests/v142-equipment-ui-transport-test.js',
  'qa/tests/v142-equipment-legacy-lane-test.js',
  'qa/tests/v143-hunt-equipment-resource-closure-test.js',
];

for (const file of tests) {
  const result = spawnSync(process.execPath, [file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('V143 equipment x Hunt gate PASS');
