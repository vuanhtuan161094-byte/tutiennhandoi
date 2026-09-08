import fs from 'node:fs';
const p='dist/core/battle-dao-v2-runtime.js';
let s=fs.readFileSync(p,'utf8');
const from=`export const BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID = Object.freeze({
    sword: 1.73,
    fist: 1.05,
    body: 1.15,
    spell: 1.75,
    poison: 0.88,
    artifact: 1.45,
    formation: 1.60,
    mind: 2.65,
});`;
const to=`export const BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID = Object.freeze({
    sword: 1.62,
    fist: 1.10,
    body: 1.25,
    spell: 1.55,
    poison: 1.02,
    artifact: 1.45,
    formation: 1.82,
    mind: 2.55,
});`;
if(!s.includes(from)) throw new Error('V129 MID tuning block changed; abort calibration patch.');
s=s.replace(from,to);
fs.writeFileSync(p,s);
console.log('V145 Dao rebalance candidate applied');
