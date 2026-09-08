import fs from 'node:fs';
const p='dist/core/battle-dao-v2-runtime.js';
let s=fs.readFileSync(p,'utf8');
const re=/export const BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID = Object\.freeze\(\{[\s\S]*?\n\}\);/;
const hit=s.match(re);
if(!hit) throw new Error('V129 MID tuning object not found; abort calibration patch.');
const to=`export const BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID = Object.freeze({
    sword: 1.62,
    fist: 1.10,
    body: 1.25,
    spell: 1.55,
    poison: 1.02,
    artifact: 1.15,
    formation: 1.95,
    mind: 2.55,
});`;
s=s.replace(re,to);
fs.writeFileSync(p,s);
console.log('V145 Dao rebalance candidate applied');
