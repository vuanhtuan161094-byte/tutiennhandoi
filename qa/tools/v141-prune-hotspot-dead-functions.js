#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const FILES=[
  'dist/core/session.js',
  'dist/core/gameplay.js',
  'dist/core/combat.js',
  'modules/hunt-combat-v2.js',
];
const escapeRe=value=>String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const occurrenceCount=(text,name)=>(text.match(new RegExp(`\\b${escapeRe(name)}\\b`,'g'))||[]).length;

function topLevelDeadNames(text,blocked){
  return [...text.matchAll(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)]
    .map(m=>m[1])
    .filter(name=>!blocked.has(name)&&occurrenceCount(text,name)===1);
}
function removeFunction(text,name){
  const re=new RegExp(`^function\\s+${escapeRe(name)}\\s*\\(`,'m');
  const match=re.exec(text);
  if(!match)return null;
  const start=match.index;
  const open=text.indexOf('{',start);
  if(open<0)return null;
  let depth=0,quote=null,escape=false,lineComment=false,blockComment=false;
  for(let i=open;i<text.length;i++){
    const ch=text[i],next=text[i+1];
    if(lineComment){if(ch==='\n')lineComment=false;continue;}
    if(blockComment){if(ch==='*'&&next==='/'){blockComment=false;i++;}continue;}
    if(quote){
      if(escape){escape=false;continue;}
      if(ch==='\\'){escape=true;continue;}
      if(ch===quote){quote=null;continue;}
      continue;
    }
    if(ch==='/'&&next==='/'){lineComment=true;i++;continue;}
    if(ch==='/'&&next==='*'){blockComment=true;i++;continue;}
    if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
    if(ch==='{')depth++;
    else if(ch==='}'){
      depth--;
      if(depth===0){
        let end=i+1;
        while(end<text.length&&(text[end]==='\r'||text[end]==='\n'))end++;
        return text.slice(0,start)+text.slice(end);
      }
    }
  }
  return null;
}
function syntaxOk(file,text){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tutien-hotspot-prune-'));
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
  let source=fs.readFileSync(file,'utf8');
  const before=Buffer.byteLength(source);
  const removed=[];
  const rejected=[];
  const blocked=new Set();
  let rounds=0;
  while(rounds<64){
    const names=topLevelDeadNames(source,blocked);
    if(!names.length)break;
    let changed=false;
    for(const name of names){
      if(occurrenceCount(source,name)!==1)continue;
      const proposal=removeFunction(source,name);
      if(!proposal){blocked.add(name);rejected.push({name,reason:'boundary'});continue;}
      if(!syntaxOk(file,proposal)){blocked.add(name);rejected.push({name,reason:'syntax'});continue;}
      source=proposal;
      removed.push(name);
      changed=true;
    }
    rounds++;
    if(!changed)break;
  }
  if(rounds>=64&&topLevelDeadNames(source,blocked).length)throw new Error(`${file}: dead-function convergence exceeded 64 rounds`);
  if(!syntaxOk(file,source))throw new Error(`${file}: final syntax failure`);
  if(removed.length)fs.writeFileSync(file,source);
  report.push({file,rounds,removedCount:removed.length,removed,rejected,bytesRemoved:before-Buffer.byteLength(source)});
}
console.log(JSON.stringify(report,null,2));
