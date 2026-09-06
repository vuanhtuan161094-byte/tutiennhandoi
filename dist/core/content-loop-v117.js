import { mortalMajorStageV113 } from './progression-closure-v113.js';
import { immortalMajorStageV114 } from './immortal-progression-v114.js';
import { highestClearedDungeonFloor } from './dungeon.js';
export function contentLoopSummaryV117(state){
 const order=Number(state?.realm?.maxRealmOrder||0),stage=mortalMajorStageV113(order)||immortalMajorStageV114(order);if(!stage)return{schema:'content-loop.v117',active:false};
 const cleared=highestClearedDungeonFloor(state?.dungeons,stage.dungeonId);const firstClear=Math.min(stage.finalFloor,cleared+1);
 return{schema:'content-loop.v117',active:true,stage:{id:stage.id,name:stage.name},activePlay:{route:'dungeons',title:cleared>=stage.finalFloor?`Tối ưu clear ${stage.dungeonName}`:`First-clear ${stage.dungeonName} tầng ${firstClear}`,reason:'Main Body mở tiến độ và guardian reward; không tiêu lượt.'},semiIdle:{route:'soul',title:cleared>0?`Treo Phân Thân tầng ${cleared}`:'Mở tầng đầu trước khi treo',reason:'Phân Thân chỉ farm tầng đã first-clear, biến tiến độ active thành automation.'},idle:{route:'cultivation',title:'Tu Luyện tiếp tục chạy',reason:'Tu Vi là nền progression nhưng không tự thay thế content gate.'},rules:['Không giới hạn lượt đánh/phó bản.','Giới hạn Ngọc Khóa nằm ở nguồn thưởng, không khóa gameplay.','Farm đúng tài nguyên của hệ đang nâng; không biến mọi hoạt động thành cùng reward.']};
}
