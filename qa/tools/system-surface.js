#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const RAW_ARGS=process.argv.slice(2);
const writeArg=RAW_ARGS.find(x=>x.startsWith('--write='));
const terms=RAW_ARGS.filter(x=>!x.startsWith('--')).join(' ').split(',').map(x=>x.trim()).filter(Boolean);
if(!terms.length){
  console.error('Usage: node qa/tools/system-surface.js "term one,termTwo,..." [--write=name]');
  process.exit(2);
}

const EXCLUDE=new Set(['.git','node_modules','vendor','assets','docs/generated']);
const EXTENSIONS=new Set(['.js','.mjs','.cjs','.css','.html','.md','.json','.csv']);
const rel=p=>path.relative(ROOT,p).replaceAll('\\','/');

function walk(dir,out=[]){
  if(!fs.existsSync(dir))return out;
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,ent.name);
    const r=rel(full);
    if(ent.isDirectory()){
      if(EXCLUDE.has(ent.name)||EXCLUDE.has(r))continue;
      walk(full,out);
    }else if(EXTENSIONS.has(path.extname(ent.name)))out.push(full);
  }
  return out;
}

function category(file){
  if(file.startsWith('dist/core/'))return 'backend-core';
  if(file.startsWith('dist/content/'))return 'content';
  if(file.startsWith('modules/')||file==='app.js'||file.endsWith('.css')||file==='index.html')return 'frontend';
  if(file.startsWith('qa/'))return 'qa';
  if(file.startsWith('web/'))return 'transport';
  if(file.startsWith('docs/')||file.endsWith('.md'))return 'docs';
  return 'other';
}
const WEIGHT={'backend-core':6,content:5,frontend:5,transport:4,qa:2,docs:1,other:1};

const files=walk(ROOT);
const text=new Map();
for(const file of files){
  try{text.set(rel(file),fs.readFileSync(file,'utf8'));}catch{}
}

const hits=[];
for(const [file,body] of text){
  const lower=body.toLocaleLowerCase('vi');
  const matched=[];
  let count=0;
  for(const term of terms){
    const needle=term.toLocaleLowerCase('vi');
    let at=0,n=0;
    while((at=lower.indexOf(needle,at))!==-1){n++;at+=Math.max(1,needle.length);}
    if(n){matched.push({term,count:n});count+=n;}
  }
  if(!count)continue;
  const cat=category(file);
  hits.push({file,category:cat,score:count*(WEIGHT[cat]||1),occurrences:count,matched});
}
hits.sort((a,b)=>b.score-a.score||b.occurrences-a.occurrences||a.file.localeCompare(b.file));

const hitSet=new Set(hits.map(x=>x.file));
const edges=[];
const importRe=/(?:import\s+(?:[^'";]+?\s+from\s+)?|export\s+[^'";]+?\s+from\s+|import\s*\()(['"])([^'"]+)\1/g;
for(const [from,body] of text){
  if(!/\.(?:m?js|cjs)$/.test(from))continue;
  let m;
  while((m=importRe.exec(body))){
    let spec=m[2];
    if(!spec.startsWith('.'))continue;
    spec=spec.split(/[?#]/,1)[0];
    const absFrom=path.join(ROOT,from);
    let target=path.resolve(path.dirname(absFrom),spec);
    if(!path.extname(target)){
      target=[`${target}.js`,`${target}.mjs`,`${target}.cjs`,path.join(target,'index.js')].find(fs.existsSync)||target;
    }
    if(!fs.existsSync(target))continue;
    const to=rel(target);
    if(hitSet.has(from)||hitSet.has(to))edges.push({from,to});
  }
}

const inbound=new Map(),outbound=new Map();
for(const e of edges){
  inbound.set(e.to,(inbound.get(e.to)||0)+1);
  outbound.set(e.from,(outbound.get(e.from)||0)+1);
}
for(const h of hits){h.inbound=inbound.get(h.file)||0;h.outbound=outbound.get(h.file)||0;}

const result={terms,hitCount:hits.length,categoryCounts:Object.fromEntries([...new Set(hits.map(x=>x.category))].map(cat=>[cat,hits.filter(x=>x.category===cat).length])),hits:hits.slice(0,120),edges:edges.slice(0,300)};
console.log(JSON.stringify(result,null,2));

if(writeArg){
  const name=writeArg.slice('--write='.length).replace(/[^a-z0-9_-]+/gi,'-').replace(/^-|-$/g,'')||'surface';
  const dir=path.join(ROOT,'docs','generated');
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,`SYSTEM_SURFACE_${name.toUpperCase()}.json`),JSON.stringify(result,null,2)+'\n');
}
