#!/usr/bin/env node
import fs from 'node:fs';

const FILE='dist/core/combat.js';
const MARKER='resolveEffectDamageV141(';
let source=fs.readFileSync(FILE,'utf8');
if(source.includes(MARKER)){
  console.log('Combat resolveEffects split already applied.');
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
const pascal=value=>String(value).replace(/[^A-Za-z0-9]+(.)/g,(_,c)=>c.toUpperCase()).replace(/^./,c=>c.toUpperCase());

const signature='    resolveEffects(source, target, effects, defaultSourceTag, now, skillId, cooldownDamageBonusPct = 0, runtimeAction) {';
const methodStart=source.indexOf(signature);
if(methodStart<0)throw new Error('resolveEffects method not found');
const methodOpen=source.indexOf('{',methodStart);
const methodClose=matchingBrace(source,methodOpen);
const switchStart=source.indexOf('            switch (effect.type) {',methodOpen);
if(switchStart<0||switchStart>methodClose)throw new Error('effect switch not found');
const switchOpen=source.indexOf('{',switchStart);
const switchClose=matchingBrace(source,switchOpen);

const cases=[];
let i=switchOpen+1,depth=1,quote=null,escape=false,lineComment=false,blockComment=false;
while(i<switchClose){
  const ch=source[i],next=source[i+1];
  if(lineComment){if(ch==='\n')lineComment=false;i++;continue;}
  if(blockComment){if(ch==='*'&&next==='/'){blockComment=false;i+=2;continue;}i++;continue;}
  if(quote){if(escape)escape=false;else if(ch==='\\')escape=true;else if(ch===quote)quote=null;i++;continue;}
  if(ch==='/'&&next==='/'){lineComment=true;i+=2;continue;}
  if(ch==='/'&&next==='*'){blockComment=true;i+=2;continue;}
  if(ch==='"'||ch==="'"||ch==='`'){quote=ch;i++;continue;}
  if(ch==='{'){depth++;i++;continue;}
  if(ch==='}'){depth--;i++;continue;}
  if(depth===1){
    const m=/^\s*case\s+['"]([^'"]+)['"]\s*:\s*\{/.exec(source.slice(i));
    if(m){
      const caseStart=i+m[0].search(/case\s/);
      const open=source.indexOf('{',caseStart);
      const close=matchingBrace(source,open);
      const body=source.slice(open+1,close);
      // A direct case-level return would change semantics after extraction. Nested callback returns are safe.
      if(/^ {20}return\b/m.test(body))throw new Error(`case ${m[1]} contains a direct return; refusing automatic extraction`);
      cases.push({type:m[1],start:caseStart,open,close,body});
      i=close+1;
      continue;
    }
  }
  i++;
}
if(cases.length<5)throw new Error(`unexpected effect case count: ${cases.length}`);

const args='source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier';
const switchIndent='            ';
const generatedCases=cases.map(c=>`${switchIndent}    case '${c.type}':\n${switchIndent}        this.resolveEffect${pascal(c.type)}V141(${args});\n${switchIndent}        break;`).join('\n');
const switchReplacement=`${switchIndent}switch (effect.type) {\n${generatedCases}\n${switchIndent}}`;

const helperMethods=cases.map(c=>{
  const name=`resolveEffect${pascal(c.type)}V141`;
  return `\n    ${name}(${args}) {\n        do {${c.body}\n        } while (false);\n    }`;
}).join('');

source=source.slice(0,switchStart)+switchReplacement+source.slice(switchClose+1,methodClose+1)+helperMethods+source.slice(methodClose+1);
fs.writeFileSync(FILE,source);
console.log(JSON.stringify({file:FILE,caseCount:cases.length,effectTypes:cases.map(x=>x.type),bytes:Buffer.byteLength(source)},null,2));
