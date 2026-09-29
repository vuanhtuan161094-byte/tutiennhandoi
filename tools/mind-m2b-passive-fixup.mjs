import fs from 'node:fs';

const path='dist/content/mind-dao-v2.js';
let text=fs.readFileSync(path,'utf8');
const duplicate='export const mindSkillMasteryV2 =export const mindSkillMasteryV2 =';
const count=text.split(duplicate).length-1;
if(count!==1) throw new Error(`M2B passive boundary fix expected one duplicate marker, found ${count}`);
text=text.replace(duplicate,'export const mindSkillMasteryV2 =');
fs.writeFileSync(path,text);
console.log('MIND M2B PASSIVE BOUNDARY FIX: APPLIED');
