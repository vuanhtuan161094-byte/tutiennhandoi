#!/usr/bin/env node
import fs from 'node:fs';

const SESSION='dist/core/session.js';
const RESTORE='dist/core/session-restore.js';
const MIGRATIONS='dist/core/session-save-migrations.js';

let session=fs.readFileSync(SESSION,'utf8');
const legacyImport="import './session-save-migrations.js';\n";
if(session.includes(legacyImport)){
  session=session.replace(legacyImport,'');
  fs.writeFileSync(SESSION,session);
}
const restore=fs.readFileSync(RESTORE,'utf8');
if(!restore.includes('save.schemaVersion !== saveVersion')){
  throw new Error('Current-only restore policy marker not found; refusing to delete legacy migrations');
}
if(fs.existsSync(MIGRATIONS))fs.rmSync(MIGRATIONS);
console.log(JSON.stringify({
  removedLegacySessionImport:!session.includes(legacyImport),
  removedMigrationModule:!fs.existsSync(MIGRATIONS),
  currentOnlyRestore:true
},null,2));
