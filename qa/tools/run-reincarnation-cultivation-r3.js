#!/usr/bin/env node
import fs from 'node:fs';
const p='qa/tools/apply-reincarnation-cultivation-r3.js';
let s=fs.readFileSync(p,'utf8');
const old="function replaceRegexOnce(text,re,after,label){const matches=[...text.matchAll(new RegExp(re.source,re.flags.includes('g')?re.flags:re.flags+'g'))];must(matches.length===1,`${label}: expected 1 match, got ${matches.length}`);return text.replace(re,after);}";
const next="function replaceRegexOnce(text,re,after,label){const rx=re instanceof RegExp?re:new RegExp(re);const flags=rx.flags.includes('g')?rx.flags:rx.flags+'g';const matches=[...text.matchAll(new RegExp(rx.source,flags))];must(matches.length===1,`${label}: expected 1 match, got ${matches.length}`);return text.replace(rx,after);}";
if(!s.includes(old)) throw new Error('R3 patcher compatibility target not found');
s=s.replace(old,next);
fs.writeFileSync(p,s);
await import('./apply-reincarnation-cultivation-r3.js');
