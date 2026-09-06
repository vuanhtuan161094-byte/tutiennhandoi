import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const testsDir=path.resolve(here,'../tests');
const repoRoot=path.resolve(here,'../..');
const mode=String(process.argv[2]??'fast').trim().toLowerCase();
const FAST=['v140-cultivation-core-test.js','v140-zero-legacy-test.js','v129-stat-architecture-test.js','v129-stat-provenance-test.js','v129-stat-source-audit-test.js','v129-major-systems-audit-test.js','v129-combat-parity-test.js','v129-gameplay-consistency-test.js','v129-dao-suy-alchemy-balance-test.js','v129-hunt-alchemy-tier-regression-test.js','v129-endgame-continuity-structural-test.js','v99-dongfu-production-test.js'];
const excluded=name=>name.includes('transport')||name.includes('frontend')||name.includes('web-launcher')||name.includes('performance')||name==='pvp-v91-balance-test.js';
const closure=()=>fs.readdirSync(testsDir).filter(n=>n.endsWith('test.js')&&!excluded(n)).sort();
const tests=mode==='fast'?FAST:mode==='closure'?closure():null;
if(!tests)throw new Error('Use fast | closure');
for(const n of tests)if(!fs.existsSync(path.join(testsDir,n)))throw new Error(`Missing gate ${n}`);
let pass=0;const fail=[];console.log(`V140 BACKEND GATES · ${mode} · ${tests.length}`);
for(const n of tests){const r=spawnSync(process.execPath,[path.join(testsDir,n)],{cwd:repoRoot,encoding:'utf8',maxBuffer:32*1024*1024,timeout:120000});if(r.status===0&&!r.error){pass++;console.log(`✓ ${n}`)}else{fail.push(n);console.error(`✗ ${n}`);console.error(`${r.stdout??''}\n${r.stderr??''}`.split(/\r?\n/).slice(-60).join('\n'));}}
console.log(`V140 BACKEND ${mode.toUpperCase()}: ${pass}/${tests.length} PASS`);if(fail.length)process.exitCode=1;
