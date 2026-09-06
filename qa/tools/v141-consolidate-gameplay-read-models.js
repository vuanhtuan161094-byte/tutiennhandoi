#!/usr/bin/env node
import fs from 'node:fs';

const GAMEPLAY='dist/core/gameplay.js';
const FLOW='dist/core/gameplay-flow.js';
const MYRIAD='dist/core/gameplay-myriad-lives.js';
const marker='// V141: Vạn Thế archive/projection DTO assembly is isolated from the facade shell.';
let gameplay=fs.readFileSync(GAMEPLAY,'utf8');
let flow=fs.readFileSync(FLOW,'utf8');

if(flow.includes(marker)&&!fs.existsSync(MYRIAD)){
  console.log('Gameplay read models already consolidated.');
  process.exit(0);
}
if(!fs.existsSync(MYRIAD))throw new Error('gameplay-myriad-lives.js missing before consolidation');
const myriad=fs.readFileSync(MYRIAD,'utf8');
const importLines=[...myriad.matchAll(/^import .*;\s*$/gm)].map(m=>m[0].trim());
const body=myriad.replace(/^import .*;\s*$/gm,'').trim();
for(const line of importLines){
  if(flow.includes(line))continue;
  const imports=[...flow.matchAll(/^import .*;\s*$/gm)];
  if(imports.length){const last=imports.at(-1);const at=last.index+last[0].length;flow=flow.slice(0,at)+`\n${line}`+flow.slice(at);}else flow=`${line}\n${flow}`;
}
flow=`${flow.trimEnd()}\n\n${body}\n`;
const separate="import { buildMyriadLivesV141 } from './gameplay-myriad-lives.js';";
if(!gameplay.includes(separate))throw new Error('separate myriad import missing');
gameplay=gameplay.replace(separate,'');
const flowImport=/import \{([^}]*)\} from '\.\/gameplay-flow\.js';/;
const match=gameplay.match(flowImport);if(!match)throw new Error('gameplay-flow import missing');
const names=match[1].split(',').map(x=>x.trim()).filter(Boolean);
if(!names.includes('buildMyriadLivesV141'))names.push('buildMyriadLivesV141');
gameplay=gameplay.replace(flowImport,`import { ${names.join(', ')} } from './gameplay-flow.js';`);
fs.writeFileSync(GAMEPLAY,gameplay);
fs.writeFileSync(FLOW,flow);
fs.unlinkSync(MYRIAD);
console.log(JSON.stringify({consolidated:true,target:FLOW,removed:MYRIAD,gameplayBytes:Buffer.byteLength(gameplay),flowBytes:Buffer.byteLength(flow)},null,2));
