#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const sessionPath=path.join(ROOT,'dist/core/session.js');
const migrationPath=path.join(ROOT,'dist/core/session-save-migrations.js');
let source=fs.readFileSync(sessionPath,'utf8');

const importLine="import { migrateStateV1, migrateStateV2, migrateStateV3, migrateStateV5, migrateStateV6, migrateStateV7, migrateStateV8, starterProfessionState } from './session-save-migrations.js';";
if(source.includes(importLine)&&fs.existsSync(migrationPath)){
  console.log('Session migration extraction already applied.');
  process.exit(0);
}

const start=source.indexOf('function startingRealmState(registry) {');
const end=source.indexOf('const CONTENT_FACTION_RANK_ORDER',start);
if(start<0||end<=start)throw new Error('Expected V140 migration helper block not found');
let block=source.slice(start,end);
block=block.replace('function starterProfessionState(', 'export function starterProfessionState(');
for(const name of ['migrateStateV1','migrateStateV2','migrateStateV3','migrateStateV5','migrateStateV6','migrateStateV7','migrateStateV8']){
  block=block.replace(`function ${name}(`,`export function ${name}(`);
}

const imports=`import { cloneAdventureState } from './world.js';\nimport { cleanCultivationStateV140 } from './cultivation-v140.js';\nimport { createDungeonProgressState } from './dungeon.js';\nimport { createEquipmentState } from './equipment.js';\nimport { createArtifactState } from './artifact.js';\nimport { cloneInventoryManagementState, createInventoryManagementState } from './inventory.js';\nimport { createCharacterSystemState } from './character.js';\nimport { createWorldSimulationState } from './npc.js';\nimport { createProfessionState } from './profession.js';\nimport { createSocialState } from './social.js';\nimport { createFactionState } from './faction.js';\nimport { createEconomyState } from './economy.js';\nimport { createGuidanceState } from './guidance.js';\nimport { createSoulState } from './soul.js';\nimport { createDaoState } from './dao.js';\nimport { createTribulationState } from './tribulation.js';\nimport { createImmortalState } from './immortal.js';\n\n`;
fs.writeFileSync(migrationPath,imports+block);

const anchor="import { EventHistory } from './history.js';\n";
if(!source.includes(anchor))throw new Error('Session import anchor not found');
source=source.replace(anchor,`${anchor}${importLine}\n`);
const newStart=source.indexOf('function startingRealmState(registry) {');
const newEnd=source.indexOf('const CONTENT_FACTION_RANK_ORDER',newStart);
source=source.slice(0,newStart)+source.slice(newEnd);
fs.writeFileSync(sessionPath,source);
console.log('Extracted V1–V8 save migration helpers from session.js without changing restore behavior.');
