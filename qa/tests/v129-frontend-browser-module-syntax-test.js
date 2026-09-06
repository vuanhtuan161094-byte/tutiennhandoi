import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const distDir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(distDir,'../..');
const candidates=[];
const add=(relative)=>{const abs=path.join(root,relative);if(fs.existsSync(abs)&&fs.statSync(abs).isFile())candidates.push(relative);};
const addDir=(relative)=>{const abs=path.join(root,relative);if(!fs.existsSync(abs))return;for(const name of fs.readdirSync(abs).sort()){const rel=path.join(relative,name);const full=path.join(root,rel);if(fs.statSync(full).isDirectory())addDir(rel);else if(/\.(?:js|mjs)$/i.test(name))candidates.push(rel);}};

// Browser/runtime entry points are parsed explicitly as ES modules. Plain `node --check file.js`
// can infer the wrong goal for .js files when there is no package.json with `type: module`.
for(const rel of ['app.js','standalone-entry.js','standalone-runtime.js','pwa-register.js','web/server.mjs'])add(rel);
addDir('modules');

const failures=[];
for(const rel of [...new Set(candidates)]){
  const source=fs.readFileSync(path.join(root,rel));
  const run=spawnSync(process.execPath,['--input-type=module','--check'],{input:source,encoding:null,maxBuffer:16*1024*1024});
  if(run.status!==0||run.error){
    failures.push({rel,diag:Buffer.concat([Buffer.from(run.stdout||''),Buffer.from(run.stderr||'')]).toString('utf8').trim()});
  }
}
if(failures.length){
  for(const failure of failures){console.error(`FAIL ${failure.rel}`);if(failure.diag)console.error(failure.diag);}
  console.error(`V129 BROWSER MODULE SYNTAX: ${candidates.length-failures.length}/${candidates.length} PASS · ${failures.length} FAIL`);
  process.exit(1);
}
console.log(`V129 BROWSER MODULE SYNTAX: ${candidates.length}/${candidates.length} PASS`);
