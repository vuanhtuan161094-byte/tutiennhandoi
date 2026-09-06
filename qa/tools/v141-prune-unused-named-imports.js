#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const FILES=[
  'app.js',
  'dist/core/session.js',
  'dist/core/session-save-migrations.js',
  'dist/core/session-restore.js',
  'dist/core/gameplay.js',
  'dist/core/combat.js',
  'modules/hunt-combat-v2.js',
];
const escapeRe=value=>String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const occurrenceCount=(text,name)=>(text.match(new RegExp(`\\b${escapeRe(name)}\\b`,'g'))||[]).length;

function syntaxOk(file,text){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tutien-import-prune-'));
  const temp=path.join(dir,path.basename(file));
  try{
    fs.writeFileSync(temp,text);
    const run=spawnSync(process.execPath,['--check',temp],{encoding:'utf8',timeout:30_000});
    return run.status===0&&!run.error;
  }finally{
    fs.rmSync(dir,{recursive:true,force:true});
  }
}

const report=[];
for(const file of FILES){
  if(!fs.existsSync(file))continue;
  const original=fs.readFileSync(file,'utf8');
  let removed=[];
  const importRe=/^import\s*\{([^}]*)\}\s*from\s*(['"][^'"]+['"])\s*;?\s*$/gm;
  const proposal=original.replace(importRe,(full,body,moduleLiteral)=>{
    const specs=body.split(',').map(x=>x.trim()).filter(Boolean);
    const keep=[];
    for(const spec of specs){
      const parts=spec.split(/\s+as\s+/i).map(x=>x.trim()).filter(Boolean);
      const local=parts.at(-1);
      if(local&&/^[A-Za-z_$][\w$]*$/.test(local)&&occurrenceCount(original,local)===1){
        removed.push({local,spec,module:moduleLiteral.slice(1,-1)});
      }else{
        keep.push(spec);
      }
    }
    if(keep.length===specs.length)return full;
    if(keep.length)return `import { ${keep.join(', ')} } from ${moduleLiteral};`;
    return `import ${moduleLiteral};`;
  });
  if(removed.length){
    if(!syntaxOk(file,proposal))throw new Error(`${file}: syntax failed after unused named-import pruning`);
    fs.writeFileSync(file,proposal);
  }
  report.push({file,removedCount:removed.length,removed,bytesRemoved:Buffer.byteLength(original)-Buffer.byteLength(proposal)});
}
console.log(JSON.stringify(report,null,2));
