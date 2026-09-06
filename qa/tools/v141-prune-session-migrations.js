#!/usr/bin/env node
import fs from 'node:fs';

const FILE='dist/core/session.js';
let source=fs.readFileSync(FILE,'utf8');

function findMatchingBrace(text,openIndex){
  let depth=0;
  let quote=null;
  let lineComment=false;
  let blockComment=false;
  let escape=false;
  for(let i=openIndex;i<text.length;i++){
    const ch=text[i],next=text[i+1];
    if(lineComment){if(ch==='\n')lineComment=false;continue;}
    if(blockComment){if(ch==='*'&&next==='/'){blockComment=false;i++;}continue;}
    if(quote){
      if(escape){escape=false;continue;}
      if(ch==='\\'){escape=true;continue;}
      if(ch===quote){quote=null;continue;}
      continue;
    }
    if(ch==='/'&&next==='/'){lineComment=true;i++;continue;}
    if(ch==='/'&&next==='*'){blockComment=true;i++;continue;}
    if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
    if(ch==='{')depth++;
    else if(ch==='}'){
      depth--;
      if(depth===0)return i;
    }
  }
  throw new Error('Unbalanced braces while locating restore method');
}

const helperStart=source.indexOf('function migrateStateV1(');
const helperEnd=source.indexOf('const CONTENT_FACTION_RANK_ORDER',helperStart);
if(helperStart>=0&&helperEnd>helperStart){
  source=source.slice(0,helperStart)+source.slice(helperEnd);
}

const signature='    static restore(registry, world, entityDefinitions, profile, save) {';
const methodStart=source.indexOf(signature);
if(methodStart<0){
  if(source.includes('V141_CURRENT_SAVE_ONLY_RESTORE')){
    console.log('V141 session migration prune already applied.');
    process.exit(0);
  }
  throw new Error('SimulationSession.restore signature not found');
}
const openBrace=source.indexOf('{',methodStart);
const methodEnd=findMatchingBrace(source,openBrace)+1;
const replacement=`    // V141_CURRENT_SAVE_ONLY_RESTORE\n    // Pre-release repository policy: only the current canonical save schema is maintained.\n    // Historical migration ladders were removed to keep Session focused on live gameplay.\n    static restore(registry, world, entityDefinitions, profile, save) {\n        if (save.profileId !== profile.id) {\n            throw new Error(\`Save profile mismatch: \${save.profileId} != \${profile.id}\`);\n        }\n        if (save.schemaVersion !== SIMULATION_SAVE_VERSION) {\n            throw new Error(\`Unsupported save version: \${save.schemaVersion}. Current canonical version is \${SIMULATION_SAVE_VERSION}.\`);\n        }\n        const state = cloneAdventureState(save.state);\n        const meta = cloneMetaProgressState(save.meta);\n        const currentLife = cloneCurrentLifeMeta(save.currentLife);\n        state.timeModel = 'live-v1';\n        normalizeEquipmentStateV98(state.equipment, registry.equipmentTemplates);\n        repairAdventureStateReferences(state, world, registry);\n        state.character.potential = clonePotentialState(undefined);\n        return new SimulationSession(registry, world, entityDefinitions, profile, save.rootSeed, state, save.actionIndex, save.history, meta, currentLife);\n    }`;
source=source.slice(0,methodStart)+replacement+source.slice(methodEnd);
fs.writeFileSync(FILE,source);
console.log('Pruned obsolete pre-V140 save migration ladder from dist/core/session.js');
