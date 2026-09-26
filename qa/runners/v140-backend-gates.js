import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runGateFiles } from './gate-runner.js';
import { BACKEND_FAST_GATES, BACKEND_DAO_CLOSURE_GATES } from './v140-backend-gate-manifest.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const testsDir=path.resolve(here,'../tests');
const repoRoot=path.resolve(here,'../..');
const mode=String(process.argv[2]??'fast').trim().toLowerCase();
const excluded=name=>name.includes('transport')||name.includes('frontend')||name.includes('web-launcher')||name.includes('performance')||name==='pvp-v91-balance-test.js';
const closure=()=>fs.readdirSync(testsDir).filter(n=>n.endsWith('test.js')&&!excluded(n)).sort();
const tests=mode==='fast'?[...BACKEND_FAST_GATES]:mode==='dao'?[...BACKEND_DAO_CLOSURE_GATES]:mode==='closure'?closure():null;
if(!tests)throw new Error('Use fast | dao | closure');
for(const n of tests)if(!fs.existsSync(path.join(testsDir,n)))throw new Error(`Missing gate ${n}`);
await runGateFiles({ label:`V140 BACKEND ${mode.toUpperCase()}`, tests, testsDir, repoRoot });
