#!/usr/bin/env node
import fs from 'node:fs';

const FILE='dist/core/gameplay.js';
const FLOW='dist/core/gameplay-flow.js';
const OUT='dist/core/gameplay-myriad-lives.js';
const IMPORT="import { buildMyriadLivesV141 } from './gameplay-myriad-lives.js';";
const CONSOLIDATED_MARKER='// V141: Vạn Thế archive/projection DTO assembly is isolated from the facade shell.';
let source=fs.readFileSync(FILE,'utf8');
if(fs.existsSync(FLOW)&&fs.readFileSync(FLOW,'utf8').includes(CONSOLIDATED_MARKER)&&!fs.existsSync(OUT)&&source.includes('return buildMyriadLivesV141.call(this);')){
  console.log('Gameplay myriadLives extraction already consolidated into gameplay-flow.js.');
  process.exit(0);
}
if(source.includes(IMPORT)&&fs.existsSync(OUT)){
  console.log('Gameplay myriadLives extraction already applied.');
  process.exit(0);
}
function matchingBrace(text,open){let depth=0,quote=null,escape=false,lineComment=false,blockComment=false;for(let i=open;i<text.length;i++){const ch=text[i],next=text[i+1];if(lineComment){if(ch==='\n')lineComment=false;continue;}if(blockComment){if(ch==='*'&&next==='/'){blockComment=false;i++;}continue;}if(quote){if(escape){escape=false;continue;}if(ch==='\\'){escape=true;continue;}if(ch===quote)quote=null;continue;}if(ch==='/'&&next==='/'){lineComment=true;i++;continue;}if(ch==='/'&&next==='*'){blockComment=true;i++;continue;}if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}if(ch==='{')depth++;else if(ch==='}'&&--depth===0)return i;}throw new Error('Unbalanced braces');}
const esc=v=>String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const used=(body,name)=>new RegExp(`\\b${esc(name)}\\b`).test(body);
const classMarker='export class GameplayFacade {';
const classIndex=source.indexOf(classMarker);if(classIndex<0)throw new Error('GameplayFacade missing');
const prelude=source.slice(0,classIndex);
const signature='    myriadLives() {';
const start=source.indexOf(signature,classIndex);if(start<0)throw new Error('myriadLives missing');
const open=source.indexOf('{',start),close=matchingBrace(source,open),body=source.slice(open+1,close);
const localDecls=[...prelude.matchAll(/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\b|^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)].map(m=>m[1]||m[2]).filter(Boolean);
const localDeps=localDecls.filter(name=>used(body,name));if(localDeps.length)throw new Error(`myriadLives depends on prelude locals: ${localDeps.join(', ')}`);
const imports=[];
for(const match of prelude.matchAll(/^import\s*\{([^}]*)\}\s*from\s*(['"][^'"]+['"])\s*;?\s*$/gm)){const specs=match[1].split(',').map(x=>x.trim()).filter(Boolean);const keep=specs.filter(spec=>used(body,spec.split(/\s+as\s+/i).map(x=>x.trim()).filter(Boolean).at(-1)));if(keep.length)imports.push(`import { ${keep.join(', ')} } from ${match[2]};`);}
for(const match of prelude.matchAll(/^import\s+([A-Za-z_$][\w$]*)\s+from\s+(['"][^'"]+['"])\s*;?\s*$/gm))if(used(body,match[1]))imports.push(match[0].trim());
fs.writeFileSync(OUT,`${imports.join('\n')}\n\n// V141: Vạn Thế archive/projection DTO assembly is isolated from the facade shell.\nexport function buildMyriadLivesV141() {${body}\n}\n`);
const replacement=`    myriadLives() {\n        return buildMyriadLivesV141.call(this);\n    }`;
source=source.slice(0,start)+replacement+source.slice(close+1);
const updatedClassIndex=source.indexOf(classMarker);const importMatches=[...source.slice(0,updatedClassIndex).matchAll(/^import .*;\s*$/gm)];if(!importMatches.length)throw new Error('No import anchor');const last=importMatches.at(-1),insertAt=last.index+last[0].length;source=source.slice(0,insertAt)+`\n${IMPORT}`+source.slice(insertAt);fs.writeFileSync(FILE,source);
console.log(JSON.stringify({extractedMethod:'GameplayFacade.myriadLives',output:OUT,bodyBytes:Buffer.byteLength(body),importCount:imports.length,gameplayBytesAfter:Buffer.byteLength(source)},null,2));
