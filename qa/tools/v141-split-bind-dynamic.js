#!/usr/bin/env node
import fs from 'node:fs';

const FILE='app.js';
const MARKER='/* V141 bindDynamic split helpers */';
const text=fs.readFileSync(FILE,'utf8');
if(text.includes(MARKER)){
  console.log(JSON.stringify({file:FILE,changed:false,reason:'already-split'}));
  process.exit(0);
}

function matchingBrace(source,open){
  let depth=0,quote=null,escape=false,lineComment=false,blockComment=false;
  for(let i=open;i<source.length;i++){
    const ch=source[i],next=source[i+1];
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

const signature='function bindDynamic(){';
const start=text.indexOf(signature);
if(start<0)throw new Error('bindDynamic not found');
const open=text.indexOf('{',start);
const close=matchingBrace(text,open);
if(close<0)throw new Error('bindDynamic closing brace not found');
const full=text.slice(start,close+1);
const body=full.slice(signature.length,-1);

const firstAnchor="  qsaV129('[data-guide-section]')";
const anchors=[
  [firstAnchor,'bindWorldSocialActionsV141'],
  ['  v239BindDongFuPanelActions(content);','bindDongFuEconomyActionsV141'],
  ["  qsaV129('[data-v90-journey-action]')",'bindJourneyCultivationActionsV141'],
  ["  qsaV129('[data-open-inventory]')",'bindInventoryNavigationActionsV141'],
  ["  qsaV129('[data-visual-skin]')",'bindBuildCollectionActionsV141'],
  ["  qsV129('[data-meditative-passing]')",'bindReincarnationReplayActionsV141'],
];
const endAnchor='\n  bindingPhaseV129=false;';
const setupEnd=body.indexOf(firstAnchor);
const actionsEnd=body.indexOf(endAnchor);
if(setupEnd<0||actionsEnd<0)throw new Error('bindDynamic split anchors missing');

const positions=anchors.map(([anchor,name])=>({anchor,name,pos:body.indexOf(anchor)}));
for(const item of positions)if(item.pos<0)throw new Error(`missing anchor: ${item.anchor}`);
for(let i=1;i<positions.length;i++)if(positions[i].pos<=positions[i-1].pos)throw new Error(`anchor order invalid: ${positions[i].name}`);

const helpers=[];
for(let i=0;i<positions.length;i++){
  const cur=positions[i];
  const end=i+1<positions.length?positions[i+1].pos:actionsEnd;
  const segment=body.slice(cur.pos,end).trimEnd();
  helpers.push(`function ${cur.name}(qsaV129,qsV129){\n${segment}\n}\n`);
}

const setup=body.slice(0,setupEnd).trimEnd();
const calls=positions.map(x=>`  ${x.name}(qsaV129,qsV129);`).join('\n');
const tail=body.slice(actionsEnd).trimEnd();
const replacement=`${MARKER}\n${helpers.join('\n')}\nfunction bindDynamic(){${setup}\n${calls}${tail}\n}`;
const out=text.slice(0,start)+replacement+text.slice(close+1);
fs.writeFileSync(FILE,out);
console.log(JSON.stringify({file:FILE,changed:true,beforeLines:full.split(/\r?\n/).length,afterBindDynamicLines:replacement.slice(replacement.lastIndexOf('function bindDynamic(){')).split(/\r?\n/).length,helperCount:helpers.length,bytesBefore:Buffer.byteLength(text),bytesAfter:Buffer.byteLength(out)},null,2));
