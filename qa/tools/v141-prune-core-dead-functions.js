#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const TARGETS={
  'dist/core/gameplay.js':['pct'],
  'modules/hunt-combat-v2.js':['mmss','combatPixiFxActive','idleSequence'],
  'dist/core/session.js':['offlineRewardMultiplierV127'],
};
const escapeRe=value=>String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const occurrenceCount=(text,name)=>(text.match(new RegExp(`\\b${escapeRe(name)}\\b`,'g'))||[]).length;

function removeFunction(text,name){
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

function syntaxOk(file,text){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tutien-core-prune-'));
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
for(const [file,names] of Object.entries(TARGETS)){
  let source=fs.readFileSync(file,'utf8');
  const before=Buffer.byteLength(source);
  const removed=[];
  for(const name of names){
    const count=occurrenceCount(source,name);
    if(count===0)continue; // idempotent
    if(count!==1)throw new Error(`${file}: ${name} now has ${count} references; refusing automatic removal`);
    const proposal=removeFunction(source,name);
    if(!proposal||!syntaxOk(file,proposal))throw new Error(`${file}: unsafe boundary/syntax while removing ${name}`);
    source=proposal;
    removed.push(name);
  }
  if(removed.length)fs.writeFileSync(file,source);
  report.push({file,removed,bytesBefore:before,bytesAfter:Buffer.byteLength(source),bytesRemoved:before-Buffer.byteLength(source)});
}
console.log(JSON.stringify(report,null,2));
