import { MORTAL_MAJOR_STAGE_V113 } from './progression-closure-v113.js';
import { IMMORTAL_MAJOR_STAGES_V114 } from './immortal-progression-v114.js';
export function lateGamePacingAuditV122(worldDungeons){
 const stages=[...MORTAL_MAJOR_STAGE_V113,...IMMORTAL_MAJOR_STAGES_V114];const rows=[];const deadZones=[];
 for(const stage of stages){const d=worldDungeons?.[stage.dungeonId];const floors=d?.floors||[];const unlockOrders=[...new Set(floors.map(f=>Number(f.requiredRealmOrder)))].sort((a,b)=>a-b);const expected=[];for(let o=stage.start;o<=stage.end;o++)expected.push(o);const missing=expected.filter(o=>!unlockOrders.includes(o));if(missing.length)deadZones.push({stage:stage.name,missingOrders:missing});rows.push({id:stage.id,name:stage.name,start:stage.start,end:stage.end,dungeonId:stage.dungeonId,floors:floors.length,unlockOrders,missingOrders:missing});}
 const trib=worldDungeons?.['dungeon.heavenly_tribulation_field'];const tribOrders=[...new Set((trib?.floors||[]).map(f=>Number(f.requiredRealmOrder)))].sort((a,b)=>a-b);if([42,43,44,45].some(x=>!tribOrders.includes(x)))deadZones.push({stage:'Độ Kiếp',missingOrders:[42,43,44,45].filter(x=>!tribOrders.includes(x))});
 return{schema:'late-game-pacing.v122',verifiedRange:{from:26,to:117},policy:'Late-game pacing dùng content unlock theo tiểu cảnh giới + đại cảnh giới gate; không hard-code tuổi đời. Bế Quan/quota V84 giữ nguyên.',stages:rows,tribulation:{floors:trib?.floors?.length||0,unlockOrders:tribOrders},deadZones,pass:deadZones.length===0};
}
