#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const TARGETS=[
  'dist/core/session.js',
  'app.js',
  'dist/core/gameplay.js',
  'dist/core/combat.js',
  'modules/hunt-combat-v2.js',
];

function matchingBrace(text,open){
  let depth=0,quote=null,escape=false,lineComment=false,blockComment=false;
  for(let i=open;i<text.length;i++){
    const ch=text[i],next=text[i+1];
    if(lineComment){if(ch==='\n')lineComment=false;continue;}
    if(blockComment){if(ch==='*'&&next==='/'){blockComment=false;i++;}continue;}
    if(quote){
      if(escape){escape=false;continue;}
      if(ch==='\\'){escape=true;continue;}
      if(ch===quote)quote=null;
      continue;
    }
    if(ch==='/'&&next==='/'){lineComment=true;i++;continue;}
    if(ch==='/'&&next==='*'){blockComment=true;i++;continue;}
    if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
    if(ch==='{')depth++;
    else if(ch==='}'&&--depth===0)return i;
  }
  return -1;
}
function lineAt(text,index){return text.slice(0,index).split(/\n/).length;}
function collect(text,re,kind){
  const out=[];let m;
  re.lastIndex=0;
  while((m=re.exec(text))){
    const open=text.indexOf('{',m.index);
    if(open<0)continue;
    const close=matchingBrace(text,open);
    if(close<0)continue;
    const startLine=lineAt(text,m.index),endLine=lineAt(text,close);
    out.push({kind,name:m[1],startLine,endLine,lines:endLine-startLine+1,bytes:Buffer.byteLength(text.slice(m.index,close+1))});
    re.lastIndex=Math.max(re.lastIndex,open+1);
  }
  return out;
}

const report=[];
for(const file of TARGETS){
  const text=fs.readFileSync(file,'utf8');
  const topFunctions=collect(text,/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm,'function');
  const classMethods=collect(text,/^\s{4}(?:static\s+|async\s+)?([A-Za-z_$][\w$]*)\s*\([^\n]*\)\s*\{/gm,'method')
    .filter(x=>!topFunctions.some(f=>f.startLine===x.startLine));
  const declarations=[...topFunctions,...classMethods]
    .filter((item,index,array)=>array.findIndex(x=>x.startLine===item.startLine&&x.name===item.name)===index)
    .sort((a,b)=>b.lines-a.lines||a.startLine-b.startLine);
  report.push({
    file,
    bytes:Buffer.byteLength(text),
    lines:text.split(/\r?\n/).length,
    declarationCount:declarations.length,
    largestDeclarations:declarations.slice(0,30),
  });
}

const outDir='docs/generated';
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'HOTSPOT_STRUCTURE.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
