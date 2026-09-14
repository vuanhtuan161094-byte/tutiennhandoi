import fs from 'node:fs';
import assert from 'node:assert/strict';

const stream = fs.readFileSync('dist/core/hunt-combat-stream.js', 'utf8');
const moduleSource = fs.readFileSync('modules/hunt-combat-v2.js', 'utf8');
const composition = fs.readFileSync('ui-combat-composition.css', 'utf8');

assert.match(stream, /const def = statusId && registry\.statuses\.has\(statusId\) \? registry\.status\(statusId\) : undefined;/,
  'status stream must resolve names and groups through the canonical registry');
assert.match(stream, /statusGroup: def\?\.group/,
  'status stream must preserve the canonical status group for presentation');
assert.match(stream, /stacks: typeof log\.data\?\.stacks === 'number'/,
  'status stream must preserve authored status stacks');
assert.match(stream, /maxStacks: typeof log\.data\?\.maxStacks === 'number'/,
  'status stream must preserve authored status stack caps');

assert.match(moduleSource, /const hasDuration=Number\.isFinite\(duration\)&&duration>0/,
  'status chips must gate timers on a real positive duration');
assert.doesNotMatch(moduleSource, /durationSeconds\|\|2\.1/,
  'status chips must not invent a fallback timer');
assert.doesNotMatch(moduleSource, /durationSeconds:1\.5/,
  'heal events must not become synthetic timed statuses');
assert.doesNotMatch(moduleSource, /durationSeconds:Number\(event\.durationSeconds\)\|\|2\.4/,
  'shield events must not invent a fallback timer');
assert.match(stream, /statusId: 'hunt\.boss\.mechanic'/,
  'boss mechanic identity must remain explicit in the stream contract');
assert.match(moduleSource, /if\(String\(event\.statusId\|\|'\'\)\!==\'hunt\.boss\.mechanic\'\)addStatus/,
  'boss mechanic must stay out of the normal status tray');
assert.match(moduleSource, /chip\.dataset\.priority='2';/,
  'mark stacks must outrank generic statuses in the four-chip tray');

assert.match(composition, /\.huntv2-hud-extension-slots\{\s*left:10px!important;\s*right:auto!important;\s*bottom:24px!important;[\s\S]*display:flex!important;/,
  'support extensions must share one horizontal row');
assert.match(composition, /\.huntv2-hud-extension-slots>\[data-combat-hud-slot\]\{\s*display:contents!important;/,
  'support slot wrappers must flatten into one row');
assert.match(composition, /\.huntv2-artifact-hud\{\s*position:relative!important;[\s\S]*flex:0 0 58px!important;/,
  'each support must occupy a stable horizontal row cell');
assert.match(composition, /\.huntv2-player-hud\{\s*top:278px!important;\s*bottom:auto!important;/,
  'player HP/CN must be lifted above the support row');
assert.match(composition, /\.huntv2-player-hud\{top:266px!important\}/,
  'compact player HP/CN must remain lifted');
assert.match(composition, /\.huntv2-status-tray \.status\[data-timed="1"\]::after/,
  'timed status chips need a visible countdown treatment');
assert.match(composition, /\.huntv2-status-tray \.status-more/,
  'status overflow must remain grouped behind +N');
assert.match(composition, /\.huntv2-poise-row\.near-break/,
  'Poise must expose the runtime near-break state');

console.log('UI Combat status authority contract PASS');
