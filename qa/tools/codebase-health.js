#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const SCAN_ROOTS=['dist','modules','web','qa'];
const ROOT_FILES=['app.js','standalone-entry.js','standalone-runtime.js','pwa-register.js','pwa-sw.js'];
const EXCLUDE_DIRS=new Set(['node_modules','vendor','assets','.git']);
const SOURCE_EXTS=new Set(['.js','.mjs','.cjs','.css','.html']);

function walk(target,out=[]){
  if(!fs.existsSync(target))return out;
  const stat=fs.statSync(target);
  if(stat.isFile()){out.push(target);return out;}
  for(const name of fs.readdirSync(target)){
    if(EXCLUDE_DIRS.has(name))continue;
    walk(path.join(target,name),out);
  }
  return out;
}

const files=[
  ...ROOT_FILES.map(name=>path.join(ROOT,name)).filter(fs.existsSync),
  ...SCAN_ROOTS.flatMap(dir=>walk(path.join(ROOT,dir)))
].filter(file=>SOURCE_EXTS.has(path.extname(file)));

const rel=file=>path.relative(ROOT,file).replaceAll('\\','/');
const rows=[];
const unresolved=[];
const importGraph=new Map();
const versioned=[];
const risky=[];

const importRe=/(?:import\s+(?:[^'";]+?\s+from\s+)?|export\s+[^'";]+?\s+from\s+|import\s*\()(['"])([^'"]+)\1/g;

for(const file of files){
  const text=fs.readFileSync(file,'utf8');
  const bytes=Buffer.byteLength(text);
  const lines=text.split(/\r?\n/).length;
  const fileRel=rel(file);
  const imports=[];
  let match;
  while((match=importRe.exec(text))){
    const spec=match[2];
    if(!spec.startsWith('.'))continue;
    imports.push(spec);
    let resolved=path.resolve(path.dirname(file),spec);
    if(!path.extname(resolved)){
      const options=[`${resolved}.js`,`${resolved}.mjs`,`${resolved}.cjs`,path.join(resolved,'index.js')];
      resolved=options.find(fs.existsSync)||resolved;
    }
    if(!fs.existsSync(resolved))unresolved.push({from:fileRel,spec});
  }
  importGraph.set(fileRel,imports);
  if(/(?:^|[-_.])v\d+(?:[-_.]|$)/i.test(path.basename(file)))versioned.push(fileRel);
  if(/\beval\s*\(|\bnew\s+Function\s*\(/.test(text))risky.push({file:fileRel,type:'dynamic-code'});
  rows.push({file:fileRel,bytes,lines,imports:imports.length});
}

rows.sort((a,b)=>b.bytes-a.bytes);
const large=rows.filter(x=>x.bytes>=100_000||x.lines>=2500);
const medium=rows.filter(x=>(x.bytes>=50_000||x.lines>=1200)&&!large.includes(x));

const stemGroups=new Map();
for(const file of versioned){
  const dir=path.dirname(file);
  const base=path.basename(file).replace(/[-_.]v\d+(?=[-_.]|\.|$)/ig,'');
  const key=`${dir}/${base}`;
  const list=stemGroups.get(key)||[];
  list.push(file);
  stemGroups.set(key,list);
}
const versionFamilies=[...stemGroups.entries()].filter(([,list])=>list.length>1).map(([stem,list])=>({stem,files:list.sort()}));

const result={
  scannedFiles:rows.length,
  totalBytes:rows.reduce((sum,x)=>sum+x.bytes,0),
  largeFiles:large,
  mediumFiles:medium.slice(0,40),
  unresolvedRelativeImports:unresolved,
  riskyPatterns:risky,
  versionedFiles:versioned.sort(),
  versionFamilies,
  topFiles:rows.slice(0,40)
};

const fmt=n=>new Intl.NumberFormat('en-US').format(n);
const md=[];
md.push('# Codebase Health — generated');
md.push('');
md.push(`- Scanned source files: **${fmt(result.scannedFiles)}**`);
md.push(`- Source bytes scanned: **${fmt(result.totalBytes)}**`);
md.push(`- Large files: **${large.length}**`);
md.push(`- Unresolved relative imports: **${unresolved.length}**`);
md.push(`- Version-suffixed source files: **${versioned.length}**`);
md.push(`- Multi-version families: **${versionFamilies.length}**`);
md.push('');
md.push('## Largest files');
md.push('');
md.push('| File | KiB | Lines | Imports |');
md.push('|---|---:|---:|---:|');
for(const row of rows.slice(0,30))md.push(`| \`${row.file}\` | ${(row.bytes/1024).toFixed(1)} | ${row.lines} | ${row.imports} |`);
md.push('');
md.push('## Large-file refactor candidates');
md.push('');
for(const row of large)md.push(`- \`${row.file}\` — ${(row.bytes/1024).toFixed(1)} KiB / ${row.lines} lines`);
md.push('');
md.push('## Unresolved relative imports');
md.push('');
if(unresolved.length)for(const x of unresolved)md.push(`- \`${x.from}\` → \`${x.spec}\``);else md.push('- None');
md.push('');
md.push('## Multi-version filename families');
md.push('');
if(versionFamilies.length){
  for(const family of versionFamilies){
    md.push(`- **${family.stem}**`);
    for(const file of family.files)md.push(`  - \`${file}\``);
  }
}else md.push('- None');
md.push('');
md.push('## Policy');
md.push('');
md.push('- Large files are refactor candidates, not automatic failures.');
md.push('- Version-suffixed files are candidates for canonical renaming only after import/QA closure.');
md.push('- This scanner must not mutate production source.');

const outDir=path.join(ROOT,'docs','generated');
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'CODEBASE_HEALTH.json'),JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'CODEBASE_HEALTH.md'),md.join('\n')+'\n');
console.log(JSON.stringify({
  scannedFiles:result.scannedFiles,
  totalBytes:result.totalBytes,
  largeFiles:large,
  unresolvedRelativeImports:unresolved,
  riskyPatterns:risky,
  versioned:versioned.length,
  versionFamilies,
  topFiles:rows.slice(0,15)
},null,2));
if(unresolved.length)process.exitCode=2;
