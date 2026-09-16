import assert from 'node:assert/strict';
import fs from 'node:fs';

const combat=fs.readFileSync('modules/hunt-combat-v2.js','utf8');
const stream=fs.readFileSync('dist/core/hunt-combat-stream.js','utf8');
const capture=fs.readFileSync('qa/visual/capture-combat-runtime.mjs','utf8');

assert.match(combat,/huntv2-hp enemy" data-max-display="\$\{esc\(m\.hp\|\|''\)\}"/,'enemy formatted HP must be stored as display authority');
assert.doesNotMatch(combat,/huntv2-hp enemy" data-max-value="\$\{esc\(m\.hp/,'formatted enemy HP must never be exposed as numeric data-max-value');
const start=combat.indexOf('function setHp('),spiritStart=combat.indexOf('\nfunction setSpirit(',start),poiseStart=combat.indexOf('\nfunction setPoise(',start);const end=spiritStart>start?spiritStart:poiseStart;assert.ok(start>=0&&end>start,'setHp must remain bounded');const body=combat.slice(start,end);
assert.match(body,/dataset\?\.maxDisplay/,'setHp must retain formatted max HP separately');
assert.match(body,/displayCombatAmount\(current\)/,'setHp must render explicit current HP as display data');
assert.match(body,/displayCombatAmount\(max\)/,'setHp must render explicit max HP as display data');
assert.doesNotMatch(body,/Number\(max\)/,'setHp must not reverse-parse formatted max HP');
assert.doesNotMatch(body,/Number\(current\)/,'setHp must not reverse-parse formatted current HP');
for(const helper of ['setSpirit','setBossPhaseBadge','resetCombatStagingState'])assert.match(combat,new RegExp(`function ${helper}\\(`),`${helper} must survive HP contract migrations`);
assert.match(combat,/dataset\?\.maxDisplay\|\|''/,'clean/reset flow must reuse enemy display max instead of numeric coercion');
assert.match(stream,/function hpFromPct\(maxLog, hpPct\)/,'combat stream must remain the owner of log-scale HP formatting');
assert.match(stream,/hpCurrent: enemyMax, hpMax: enemyMax/,'battleStart must supply display HP values from the authoritative stream');
assert.match(capture,/Combat HP semantic mismatch/,'visual proof must reject nonzero Boss bar with zero/empty display HP');
console.log('Combat HP display contract PASS · pct bar authority · display label authority · no suffix reverse parsing');
