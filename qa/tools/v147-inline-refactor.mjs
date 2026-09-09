import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const abs=p=>path.join(repoRoot,p);
const read=p=>fs.readFileSync(abs(p),'utf8');
const write=(p,s)=>fs.writeFileSync(abs(p),s,'utf8');
const exists=p=>fs.existsSync(abs(p));
const remove=p=>{if(exists(p))fs.unlinkSync(abs(p));};

function renameLegacyExports(source,names){
  let out=source;
  for(const name of names){
    const re=new RegExp(`export\\s+function\\s+${name}\\s*\\(`);
    if(!re.test(out))throw new Error(`Không tìm thấy legacy export ${name}.`);
    out=out.replace(re,`function ${name}LegacyV146(`);
  }
  return out;
}

function foldFacade({canonical,legacy,conflicts,transformWrapper}){
  if(!exists(legacy)){
    console.log(`[v147-inline] ${legacy} đã được fold.`);
    return;
  }
  const legacySource=renameLegacyExports(read(legacy),conflicts);
  let wrapper=read(canonical)
    .replace(new RegExp(`^export \\* from ['\"]\\./${path.basename(legacy).replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}['\"];?\\s*\\n?`),'')
    .replace(new RegExp(`^import \\* as legacy from ['\"]\\./${path.basename(legacy).replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}['\"];?\\s*\\n?`),'');
  if(transformWrapper)wrapper=transformWrapper(wrapper);
  for(const name of conflicts)wrapper=wrapper.replaceAll(`legacy.${name}`,`${name}LegacyV146`);
  wrapper=wrapper.replaceAll('legacy.','');
  if(wrapper.includes('legacy.'))throw new Error(`${canonical} còn legacy namespace sau transform.`);
  write(canonical,`${legacySource.trimEnd()}\n\n// V147 canonical overrides. Legacy V146 implementation is retained above as internal fallback only.\n${wrapper.trim()}\n`);
  remove(legacy);
  console.log(`[v147-inline] folded ${legacy} -> ${canonical}`);
}

// 1) Inline authored Spirit Beast data into the canonical V147 module.
{
  const dataPath='dist/core/spirit-beast-data-v147.js';
  const corePath='dist/core/spirit-beast-v147.js';
  if(exists(dataPath)){
    const data=read(dataPath).trim();
    let core=read(corePath);
    const importLine="import { SPIRIT_BEAST_SPECIES_V147, SPIRIT_BEAST_COMBAT_TUNING_V147 } from './spirit-beast-data-v147.js';";
    if(!core.includes(importLine))throw new Error('spirit-beast-v147.js không còn import data V147 như dự kiến.');
    core=core.replace(importLine,'').replace(/^\s*\n/,'');
    write(corePath,`${data}\n\n${core}`);
    remove(dataPath);
    console.log('[v147-inline] inlined spirit-beast-data-v147.js');
  }
}

// 2) Fold collection progression façade. Keep V146 functions as private fallbacks;
// internal legacy calls resolve to the V147 public overrides after the fold.
foldFacade({
  canonical:'dist/core/collection-progression-v12316.js',
  legacy:'dist/core/collection-progression-v12316-legacy.js',
  conflicts:['grantCollectionItemV12316','strengthenCollectionItemV12316','advanceCollectionItemV12316'],
  transformWrapper:src=>src.replace("import { activeConfidantSpecialtyV87 } from './confidant-v87.js';\n",''),
});

// 3) Fold collection economy façade. Two collection functions are already imported
// by the V146 body, so retain only the new V147 strengthen-cost import.
foldFacade({
  canonical:'dist/core/gacha-collection-economy-v12325.js',
  legacy:'dist/core/gacha-collection-economy-v12325-legacy.js',
  conflicts:['strengthenCollectionEconomyV12325','advanceCollectionEconomyV12325','collectionEconomySummaryV12325'],
  transformWrapper:src=>src.replace(
    "import { advanceCollectionItemV12316, spiritBeastStrengthenCostV147, strengthenCollectionItemV12316 } from './collection-progression-v12316.js';",
    "import { spiritBeastStrengthenCostV147 } from './collection-progression-v12316.js';"
  ),
});

// 4) Fold V12326 gacha façade; only the gacha entrypoint is overridden by V147.
foldFacade({
  canonical:'dist/core/collection-workshop-gacha-v12326.js',
  legacy:'dist/core/collection-workshop-gacha-v12326-legacy.js',
  conflicts:['gachaCollectionV12326'],
});

for(const retired of [
  'dist/core/spirit-beast-data-v147.js',
  'dist/core/collection-progression-v12316-legacy.js',
  'dist/core/gacha-collection-economy-v12325-legacy.js',
  'dist/core/collection-workshop-gacha-v12326-legacy.js',
]){
  if(exists(retired))throw new Error(`Refactor chưa loại bỏ ${retired}.`);
}
console.log('[v147-inline] canonical inline refactor complete.');
