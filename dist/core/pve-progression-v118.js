import { mortalMajorStageV113 } from './progression-closure-v113.js';
import { immortalMajorStageV114 } from './immortal-progression-v114.js';
import { highestClearedDungeonFloor } from './dungeon.js';
export function pveProgressionSummaryV118(state,worldDungeons,readinessFn){
 const order=Number(state?.realm?.maxRealmOrder||0),stage=mortalMajorStageV113(order)||immortalMajorStageV114(order);if(!stage)return{schema:'pve-progression.v118',active:false,engine:'CombatKernel V2'};
 const cleared=highestClearedDungeonFloor(state?.dungeons,stage.dungeonId);const def=worldDungeons?.[stage.dungeonId];const nextFloor=(def?.floors||[]).find(f=>f.floor===Math.min(stage.finalFloor,cleared+1));let readiness;
 if(nextFloor&&typeof readinessFn==='function'){try{const r=readinessFn(stage.dungeonId,nextFloor.floor);readiness={floor:nextFloor.floor,ready:Boolean(r?.ready??r?.canChallenge??true),ratio:Number(r?.powerRatio??r?.ratio??0),recommendation:r?.recommendation??r?.reason};}catch(e){readiness={floor:nextFloor.floor,ready:false,recommendation:String(e?.message||e)}}}
 return{schema:'pve-progression.v118',active:true,engine:'CombatKernel V2',dungeon:{id:stage.dungeonId,name:stage.dungeonName,cleared,finalFloor:stage.finalFloor,nextFloor:nextFloor?.floor},readiness,policy:['Boss/Phó Bản dùng CombatKernel V2 canonical.','Main Body phải first-clear; automation không vượt tiến độ.','Difficulty kiểm build thực qua guardian, không có resolver Boss riêng.']};
}
