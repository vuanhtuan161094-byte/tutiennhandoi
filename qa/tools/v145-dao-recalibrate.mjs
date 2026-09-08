import fs from 'node:fs';
const p='dist/core/battle-dao-v2-runtime.js';
let s=fs.readFileSync(p,'utf8');
const old=`export const BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID = Object.freeze({
    sword: 1.73,
    fist: 1.05,
    body: 1.15,
    spell: 1.75,
    poison: 0.88,
    artifact: 1.15,
    formation: 1.75,
    mind: 2.70,
});`;
const next=`export const BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID = Object.freeze({
    // V145 recalibration after elemental Linh Căn V131–V133 combat hooks were retired.
    // Shared-kernel only: no PvP/PvE/Boss-specific coefficient.
    sword: 1.55,
    fist: 1.05,
    body: 1.27,
    spell: 1.40,
    poison: 1.01,
    artifact: 1.12,
    formation: 2.02,
    mind: 2.55,
});`;
const n=s.split(old).length-1;
if(n!==1) throw new Error('mid tuning anchor expected 1 got '+n);
s=s.replace(old,next);
fs.writeFileSync(p,s);
console.log('V145 post-root-retirement Dao midgame recalibration staged');
