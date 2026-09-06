#!/usr/bin/env node
import fs from 'node:fs';

const FILE='dist/core/gameplay.js';
const OUT='dist/core/gameplay-dispatch.js';
const IMPORT="import { dispatchGameplayCommand } from './gameplay-dispatch.js';";
let source=fs.readFileSync(FILE,'utf8');

if(source.includes(IMPORT)&&fs.existsSync(OUT)){
  console.log('Gameplay dispatch extraction already applied.');
  process.exit(0);
}

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
  throw new Error('Unbalanced braces');
}

const classMarker='export class GameplayFacade {';
const classIndex=source.indexOf(classMarker);
if(classIndex<0)throw new Error('GameplayFacade class marker not found');
const prelude=source.slice(0,classIndex).trimEnd();

const signature='    dispatch(command) {';
const methodStart=source.indexOf(signature,classIndex);
if(methodStart<0)throw new Error('GameplayFacade.dispatch not found');
const open=source.indexOf('{',methodStart);
const close=matchingBrace(source,open);
const body=source.slice(open+1,close);

const generated=`${prelude}\n\n// V141: command mutation transport is isolated from read-model construction.\n// Keep facade semantics via Function#call so existing this.session/registry/world/result behavior is unchanged.\nexport function dispatchGameplayCommand(command) {${body}\n}\n`;
fs.writeFileSync(OUT,generated);

const replacement=`    dispatch(command) {\n        return dispatchGameplayCommand.call(this, command);\n    }`;
source=source.slice(0,methodStart)+replacement+source.slice(close+1);

const importMatches=[...source.slice(0,classIndex).matchAll(/^import .*;\s*$/gm)];
if(!importMatches.length)throw new Error('No import anchor found');
const last=importMatches.at(-1);
const insertAt=last.index+last[0].length;
source=source.slice(0,insertAt)+`\n${IMPORT}`+source.slice(insertAt);
fs.writeFileSync(FILE,source);

console.log(JSON.stringify({
  extractedMethod:'GameplayFacade.dispatch',
  output:OUT,
  dispatchBodyBytes:Buffer.byteLength(body),
  gameplayBytesAfter:Buffer.byteLength(source),
},null,2));
