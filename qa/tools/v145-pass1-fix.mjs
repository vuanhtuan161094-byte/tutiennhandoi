import fs from 'node:fs';
const p='dist/core/five-element-combat-v117.js';
let s=fs.readFileSync(p,'utf8');
const retired=[
  '    applyRootOriginActionV132(entity, skill, action, now);\n',
  '    rootMilestoneActionBonusV133(entity, skill, action);\n',
  '    action.recoveryMultiplier *= rootMilestoneCastRecoveryMultiplierV133(entity, skill);\n',
];
for(const line of retired){
  const n=s.split(line).length-1;
  if(n>1) throw new Error(`unexpected duplicate retired hook: ${line.trim()} x${n}`);
  if(n===1) s=s.replace(line,'');
}
s=s.replace('    // v1.32 Căn Nguyên is an actual behavioral layer on the matching Hành action, never a global Total Damage stat.\n','    // V145: Linh Căn is independent from this authored skill-resource package.\n');
for(const token of ['applyRootOriginActionV132','rootMilestoneActionBonusV133','rootMilestoneCastRecoveryMultiplierV133']){
  if(s.includes(token)) throw new Error(`retired root hook survived: ${token}`);
}
fs.writeFileSync(p,s);
console.log('V145 pass1 remaining root hooks retired');
