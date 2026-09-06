import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const testsDir=path.resolve(here,'../tests');
const repoRoot=path.resolve(here,'../..');
const mode=String(process.argv[2]??'fast').trim().toLowerCase();
const FAST=['v140-cultivation-transport-test.js','v129-frontend-browser-module-syntax-test.js','v129-performance-architecture-test.js','v129-performance-stress-test.js','v129-frontend-performance-test.js','v129-web-launcher-test.js'];
const isFront=n=>n.includes('transport-test.js')||n.includes('frontend')||n.includes('web-launcher')||n.includes('performance');
const closure=()=>[...new Set([...FAST,...fs.readdirSync(testsDir).filter(n=>n.endsWith('test.js')&&isFront(n))])].sort();
const tests=mode==='fast'?FAST:mode==='closure'?closure():null;if(!tests)throw new Error('Use fast | closure');
let pass=0,fail=[];console.log(`V140 FRONTEND GATES · ${mode} · ${tests.length}`);
for(const n of tests){const r=spawnSync(process.execPath,[path.join(testsDir,n)],{cwd:repoRoot,encoding:'utf8',maxBuffer:32*1024*1024,timeout:120000});if(r.status===0&&!r.error){pass++;console.log(`✓ ${n}`)}else{fail.push(n);console.error(`✗ ${n}`);console.error(`${r.stdout??''}\n${r.stderr??''}`.split(/\r?\n/).slice(-60).join('\n'));}}
console.log(`V140 FRONTEND ${mode.toUpperCase()}: ${pass}/${tests.length} PASS`);if(fail.length)process.exitCode=1;
