#!/usr/bin/env node
import fs from 'node:fs';
const p='qa/tools/apply-reincarnation-cultivation-r3.js';
let s=fs.readFileSync(p,'utf8');
const old="function replaceRegexOnce(text,re,after,label){const matches=[...text.matchAll(new RegExp(re.source,re.flags.includes('g')?re.flags:re.flags+'g'))];must(matches.length===1,`${label}: expected 1 match, got ${matches.length}`);return text.replace(re,after);}";
const next="function replaceRegexOnce(text,re,after,label){const rx=re instanceof RegExp?re:new RegExp(re);const flags=rx.flags.includes('g')?rx.flags:rx.flags+'g';const matches=[...text.matchAll(new RegExp(rx.source,flags))];if(matches.length===1)return text.replace(rx,after);if(matches.length===0){if(label==='clone migration'){const a=text.indexOf('  let ranks={...(value?.tree?.ranks??{})};');const marker='  for(const [id,r] of Object.entries(ranks)) ranks[id]=clamp(Math.floor(Number(r)||0),0,50);';const b=text.indexOf(marker,a);must(a>=0&&b>=0,'clone migration fallback markers missing');return text.slice(0,a)+after+text.slice(b+marker.length);}if(label==='mixed cost curve'){const a=text.indexOf('function baseRankCost(rank){');const marker='export function nodeSpentPoints';const b=text.indexOf(marker,a);must(a>=0&&b>=0,'mixed cost curve fallback markers missing');return text.slice(0,a)+after+text.slice(b+marker.length);}if(label==='retreat R3'){const a=text.indexOf('    instantRetreatV140(');must(a>=0,'retreat fallback start missing');const rest=text.slice(a+5);const m=rest.match(/\n    [A-Za-z_$][\w$]*\(/);must(m,'retreat fallback next method missing');const b=a+5+m.index+1;return text.slice(0,a)+after+'\n'+text.slice(b);}}must(false,`${label}: expected 1 match, got ${matches.length}`);}";
if(!s.includes(old)) throw new Error('R3 patcher compatibility target not found');
s=s.replace(old,next);
fs.writeFileSync(p,s);
await import('./apply-reincarnation-cultivation-r3.js');
