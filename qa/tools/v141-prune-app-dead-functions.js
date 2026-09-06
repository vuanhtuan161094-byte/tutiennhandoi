#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const FILE='app.js';
let source=fs.readFileSync(FILE,'utf8');
const originalBytes=Buffer.byteLength(source);
const removed=[];
const rejected=[];
const blocked=new Set();

const escapeRe=value=>String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const occurrenceCount=(text,name)=>(text.match(new RegExp(`\\b${escapeRe(name)}\\b`,'g'))||[]).length;
const declarationNames=text=>[...text.matchAll(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)]
  .map(m=>m[1])
  .filter(name=>!blocked.has(name)&&occurrenceCount(text,name)===1);

function removeCandidate(text,name){
  const re=new RegExp(`^function\\s+${escapeRe(name)}\\s*\\(`,'m');
  const match=re.exec(text);
  if(!match)return null;
  const start=match.index;
  let lineEnd=text.indexOf('\n',start);
  if(lineEnd<0)lineEnd=text.length;
  const firstLine=text.slice(start,lineEnd);
  const opens=(firstLine.match(/{/g)||[]).length;
  const closes=(firstLine.match(/}/g)||[]).length;
  if(opens>0&&opens===closes){
    const end=lineEnd<text.length?lineEnd+1:lineEnd;
    return text.slice(0,start)+text.slice(end);
  }
  let pos=lineEnd<text.length?lineEnd+1:lineEnd;
  while(pos<text.length){
    let end=text.indexOf('\n',pos);
    if(end<0)end=text.length;
    const line=text.slice(pos,end).replace(/\r$/,'');
    if(/^}\s*;?\s*$/.test(line)){
      const cutEnd=end<text.length?end+1:end;
      return text.slice(0,start)+text.slice(cutEnd);
    }
    pos=end<text.length?end+1:end;
  }
  return null;
}

function syntaxOk(text){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tutien-app-prune-'));
  const file=path.join(dir,'app.js');
  try{
    fs.writeFileSync(file,text);
    const run=spawnSync(process.execPath,['--check',file],{encoding:'utf8',timeout:30_000});
    return run.status===0&&!run.error;
  }finally{
    fs.rmSync(dir,{recursive:true,force:true});
  }
}

let rounds=0;
const MAX_ROUNDS=64;
while(rounds<MAX_ROUNDS){
  const candidates=declarationNames(source);
  if(!candidates.length)break;
  let changed=false;
  for(const name of candidates){
    if(occurrenceCount(source,name)!==1)continue;
    const proposal=removeCandidate(source,name);
    if(!proposal){blocked.add(name);rejected.push({name,reason:'boundary'});continue;}
    if(!syntaxOk(proposal)){blocked.add(name);rejected.push({name,reason:'syntax'});continue;}
    source=proposal;
    removed.push(name);
    changed=true;
  }
  rounds++;
  if(!changed)break;
}
if(rounds>=MAX_ROUNDS&&declarationNames(source).length)throw new Error(`Dead-function convergence exceeded ${MAX_ROUNDS} rounds`);

if(!syntaxOk(source))throw new Error('Final app.js syntax check failed after dead-function pruning');
fs.writeFileSync(FILE,source);
console.log(JSON.stringify({
  rounds,
  removedCount:removed.length,
  removed,
  rejected,
  bytesBefore:originalBytes,
  bytesAfter:Buffer.byteLength(source),
  bytesRemoved:originalBytes-Buffer.byteLength(source)
},null,2));
