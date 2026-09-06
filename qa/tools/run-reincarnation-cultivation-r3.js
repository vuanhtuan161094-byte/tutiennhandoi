#!/usr/bin/env node
import fs from 'node:fs';
const p='qa/tools/apply-reincarnation-cultivation-r3.js';
let s=fs.readFileSync(p,'utf8');
const old="function replaceRegexOnce(text,re,after,label){const matches=[...text.matchAll(new RegExp(re.source,re.flags.includes('g')?re.flags:re.flags+'g'))];must(matches.length===1,`${label}: expected 1 match, got ${matches.length}`);return text.replace(re,after);}";
const next=String.raw`function replaceRegexOnce(text,re,after,label){
  const rx=re instanceof RegExp?re:new RegExp(re);
  const flags=rx.flags.includes('g')?rx.flags:rx.flags+'g';
  const matches=[...text.matchAll(new RegExp(rx.source,flags))];
  if(matches.length===1)return text.replace(rx,after);
  if(matches.length===0){
    if(label==='clone migration'){
      const a=text.indexOf('  let ranks={...(value?.tree?.ranks??{})};');
      const marker='  for(const [id,r] of Object.entries(ranks)) ranks[id]=clamp(Math.floor(Number(r)||0),0,50);';
      const b=text.indexOf(marker,a);
      must(a>=0&&b>=0,'clone migration fallback markers missing');
      return text.slice(0,a)+after+text.slice(b+marker.length);
    }
    if(label==='mixed cost curve'){
      const a=text.indexOf('function baseRankCost(rank){');
      const marker='export function nodeSpentPoints';
      const b=text.indexOf(marker,a);
      must(a>=0&&b>=0,'mixed cost curve fallback markers missing');
      return text.slice(0,a)+after+text.slice(b+marker.length);
    }
    if(label==='retreat R3'){
      const a=text.indexOf('    instantRetreatV140(');
      const marker='\n    ascendRealmV140() {';
      const b=text.indexOf(marker,a);
      must(a>=0&&b>=0,'retreat fallback anchors missing');
      return text.slice(0,a)+after+text.slice(b);
    }
  }
  must(false,label+': expected 1 match, got '+matches.length);
}`;
if(!s.includes(old)) throw new Error('R3 patcher compatibility target not found');
s=s.replace(old,next);
const badHistory='this.currentLifeValue.history.push(event);this.historyValue.push(event);this.actionIndexValue+=1;';
const goodHistory='this.historyValue.append(event);this.actionIndexValue+=1;';
if(!s.includes(badHistory)) throw new Error('R3 retreat history target not found');
s=s.replace(badHistory,goodHistory);
const loopStart='while(remaining>1e-9){const slice=Math.min(1,remaining),seedBase=';
const loopStartFixed='while(remaining>1e-9){let slice=Math.min(1,remaining);const seedBase=';
if(!s.includes(loopStart)) throw new Error('R3 retreat loop start target not found');
s=s.replace(loopStart,loopStartFixed);
const missingGate='if(missing<=1e-9)break;const grant=';
const missingGateFixed='if(missing<=1e-9)break;slice=Math.min(slice,basePerHour*mult>0?missing/(basePerHour*mult):0);if(slice<=1e-9)break;const grant=';
if(!s.includes(missingGate)) throw new Error('R3 retreat partial-hour target not found');
s=s.replace(missingGate,missingGateFixed);
const transitionGate='if(mult>1)insights.push(mult);const rp=';
const transitionGateFixed='if(mult>1)insights.push(mult);if(this.stateValue.realm.maxRealmOrder!==order)break;const rp=';
if(!s.includes(transitionGate)) throw new Error('R3 retreat transition target not found');
s=s.replace(transitionGate,transitionGateFixed);
const refundChance='rr.chance(rp.chancePct)';
const refundChanceFixed='rr.chance(rp.chancePct*slice)';
if(!s.includes(refundChance)) throw new Error('R3 retreat refund chance target not found');
s=s.replace(refundChance,refundChanceFixed);
fs.writeFileSync(p,s);
await import('./apply-reincarnation-cultivation-r3.js');

// Keep the V141 initial module graph budget unchanged: R3 helpers live in the
// already-eager reincarnation progression module instead of adding a new edge.
const r3Path='dist/core/reincarnation-cultivation-r3.js';
const progressionPath='dist/core/reincarnation-progression-v1102.js';
let embedded=fs.readFileSync(r3Path,'utf8');
embedded=embedded
  .replace("const PREFIX='reincarnation.tree.v127.';","const CULTIVATION_R3_PREFIX='reincarnation.tree.v127.';")
  .replace("const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));\n",'')
  .replaceAll('PREFIX+','CULTIVATION_R3_PREFIX+');
let progression=fs.readFileSync(progressionPath,'utf8');
if(!progression.includes('export function cultivationR3Rank(')){
  progression += '\n\n// Luân Hồi Tu Luyện R3 — embedded here to preserve the V141 eager-module budget.\n'+embedded;
  fs.writeFileSync(progressionPath,progression);
}
const rewrites=[
  ['dist/core/cultivation-v140.js',"from './reincarnation-cultivation-r3.js'","from './reincarnation-progression-v1102.js'"],
  ['dist/core/session.js',"from './reincarnation-cultivation-r3.js'","from './reincarnation-progression-v1102.js'"],
  ['qa/tests/reincarnation-cultivation-r3-test.js',"from '../../dist/core/reincarnation-cultivation-r3.js'","from '../../dist/core/reincarnation-progression-v1102.js'"]
];
for(const [file,from,to] of rewrites){
  let text=fs.readFileSync(file,'utf8');
  if(!text.includes(from)) throw new Error('R3 graph rewrite target missing: '+file);
  text=text.replace(from,to);
  fs.writeFileSync(file,text);
}
