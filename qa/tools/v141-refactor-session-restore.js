#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const sessionPath=path.join(ROOT,'dist/core/session.js');
const restorePath=path.join(ROOT,'dist/core/session-restore.js');
let source=fs.readFileSync(sessionPath,'utf8');
const importLine="import { restoreSimulationSession } from './session-restore.js';";
if(source.includes(importLine)&&fs.existsSync(restorePath)){
  console.log('Session restore extraction already applied.');
  process.exit(0);
}

const signature='    static restore(registry, world, entityDefinitions, profile, save) {';
const start=source.indexOf(signature);
if(start<0)throw new Error('SimulationSession.restore signature not found');
const openIndex=source.indexOf('{',start);
function matchingBrace(text,open){
  let depth=0,quote=null,lineComment=false,blockComment=false,escape=false;
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
  throw new Error('Unbalanced restore method braces');
}
const closeIndex=matchingBrace(source,openIndex);
let body=source.slice(openIndex+1,closeIndex);
body=body.split('\n').map(line=>line.startsWith('        ')?line.slice(8):line).join('\n');
body=body.replaceAll('save.schemaVersion === SIMULATION_SAVE_VERSION','save.schemaVersion === saveVersion');
body=body.replace('return new SimulationSession(','return new SessionClass(');

const imports=`import { cloneAdventureState } from './world.js';\nimport { normalizeEquipmentStateV98 } from './equipment.js';\nimport { clonePotentialState, legacyPotentialMigrationPayloadV127 } from './potential.js';\nimport { cloneCurrentLifeMeta, cloneMetaProgressState, createInitialLifeMeta, createMetaProgressState } from './life.js';\nimport { createWorldSimulationState } from './npc.js';\nimport { createSocialState } from './social.js';\nimport { createFactionState, playerFactionMembership } from './faction.js';\nimport { createEconomyState } from './economy.js';\nimport { createGuidanceState } from './guidance.js';\nimport { clonePlayerFlowState, createFirstLifeStoryState, createPlayerFlowState } from './player-flow.js';\nimport { cloneSoulState, createSoulState } from './soul.js';\nimport { createDaoState } from './dao.js';\nimport { cloneTribulationState, createTribulationState } from './tribulation.js';\nimport { cloneImmortalState, createImmortalState } from './immortal.js';\nimport { createFateEmbryoState } from './fate-embryo.js';\nimport { cloneOrthodoxyState, createOrthodoxyState } from './orthodoxy.js';\nimport { cloneGenesisWorldState, createGenesisWorldState } from './genesis-world.js';\nimport { createOuterAscendantState } from './ascendant.js';\nimport { cloneEndlessHuntState, createEndlessHuntState } from './endless-hunt.js';\nimport { lootDungeonIdsForRealmV122 } from './loot-economy-v122.js';\nimport { repairAdventureStateReferences } from './save-stability.js';\nimport { cloneLifeCorePotentialState } from './reincarnation-progression-v1102.js';\nimport { migrateStateV1, migrateStateV2, migrateStateV3, migrateStateV5, migrateStateV6, migrateStateV7, migrateStateV8, starterProfessionState } from './session-save-migrations.js';\n\n`;
const indented=body.split('\n').map(line=>line?`    ${line}`:'').join('\n');
fs.writeFileSync(restorePath,`${imports}export function restoreSimulationSession(SessionClass, saveVersion, registry, world, entityDefinitions, profile, save) {${indented}\n}\n`);

const replacement="    static restore(registry, world, entityDefinitions, profile, save) {\n        return restoreSimulationSession(SimulationSession, SIMULATION_SAVE_VERSION, registry, world, entityDefinitions, profile, save);\n    }";
source=source.slice(0,start)+replacement+source.slice(closeIndex+1);
const anchor="import { EventHistory } from './history.js';\n";
if(!source.includes(anchor))throw new Error('Session import anchor not found');
source=source.replace(anchor,`${anchor}${importLine}\n`);
fs.writeFileSync(sessionPath,source);
console.log('Extracted SimulationSession.restore into session-restore.js without changing schema compatibility.');
