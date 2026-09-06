import { highestClearedDungeonFloor } from './dungeon.js';

export const MORTAL_MAJOR_STAGE_V113 = Object.freeze([
  { start:26, end:29, id:'spirit_transformation', name:'Hóa Thần', dungeonId:'dungeon.dao_comprehension_platform', dungeonName:'Ngộ Đạo Đài', finalFloor:5, nextOrder:30, nextName:'Luyện Hư' },
  { start:30, end:33, id:'void_refinement', name:'Luyện Hư', dungeonId:'dungeon.void_rift', dungeonName:'Hư Không Liệt Giới', finalFloor:5, nextOrder:34, nextName:'Hợp Thể' },
  { start:34, end:37, id:'integration', name:'Hợp Thể', dungeonId:'dungeon.integration_crucible', dungeonName:'Tam Nguyên Hợp Lô', finalFloor:5, nextOrder:38, nextName:'Đại Thừa' },
  { start:38, end:41, id:'great_vehicle', name:'Đại Thừa', dungeonId:'dungeon.great_vehicle_domain', dungeonName:'Vạn Đạo Thiên Mạc', finalFloor:5, nextOrder:42, nextName:'Độ Kiếp' },
]);

export function mortalMajorStageV113(realmOrder){
  const n=Math.max(0,Math.floor(Number(realmOrder)||0));
  return MORTAL_MAJOR_STAGE_V113.find(x=>n>=x.start&&n<=x.end);
}

function mainDaoProgress(state){
  const id=state?.dao?.mainDaoId;
  return id?state?.dao?.known?.[id]:undefined;
}

export function mortalProgressionSummaryV113(state, dungeons, integrationSummary, greatVehicleSummary){
  const order=Math.max(0,Number(state?.realm?.maxRealmOrder)||0);
  const stage=mortalMajorStageV113(order);
  if(order>=42&&order<=45){
    const need=order-41;
    const cleared=highestClearedDungeonFloor(dungeons,'dungeon.heavenly_tribulation_field');
    const complete=cleared>=need;
    return {schema:'progression-closure.v113',active:true,stage:{start:42,end:45,id:'tribulation',name:'Độ Kiếp',dungeonId:'dungeon.heavenly_tribulation_field',dungeonName:'Thiên Kiếp Cổ Trường',finalFloor:4,nextOrder:46,nextName:'Nhân Tiên'},objectives:[{id:'tribulation-field',name:`Luyện Kiếp tầng ${need}`,complete,current:`Tầng ${cleared}/${need}`,target:`First-clear tầng ${need}`,route:'dungeons',detail:'Mỗi lần Thiên Kiếp thật chỉ mở sau khi Main Body vượt tầng mô phỏng tương ứng.'}],finalGate:{applies:true,ready:complete,missing:complete?[]:[`Luyện Kiếp tầng ${need}`]},nextAction:complete?{route:'cultivation',title:'Dẫn Thiên Kiếp',detail:'Mốc luyện kiếp đã đủ; có thể dẫn Thiên Kiếp thật.'}:{route:'dungeons',title:`First-clear Thiên Kiếp Cổ Trường tầng ${need}`,detail:'Vượt bài kiểm tra build trước khi gọi Thiên Kiếp thật.'},verifiedThroughRealmOrder:45};
  }
  if(!stage)return {schema:'progression-closure.v113',active:false,verifiedThroughRealmOrder:45};
  const cleared=highestClearedDungeonFloor(dungeons,stage.dungeonId);
  const dao=mainDaoProgress(state);
  const objectives=[
    {id:'dungeon',name:`Công phá ${stage.dungeonName}`,complete:cleared>=stage.finalFloor,current:`Tầng ${cleared}/${stage.finalFloor}`,target:`First-clear tầng ${stage.finalFloor}`,route:'dungeons',detail:'Main Body phải tự first-clear; sau đó Phân Thân mới được treo farm tầng đã mở.'},
  ];
  if(stage.id==='spirit_transformation'){
    objectives.unshift({id:'dao-domain',name:'Kết Đạo Ý thành Đạo Vực',complete:Boolean(dao?.interpretationId)&&Number(dao?.depth||0)>=60&&Number(state?.dao?.domain?.manifestedYears||0)>=1,current:`Độ sâu ${Number(dao?.depth||0).toFixed(1)} · manifest ${Number(state?.dao?.domain?.manifestedYears||0).toFixed(1)} năm`,target:'Độ sâu ≥60 + Diễn Giải + manifest ≥1 năm',route:'dao',detail:'Đạo Vực phải được dùng thật trong dòng thời gian, không chỉ mở nút rồi bỏ.'});
  }
  if(stage.id==='integration'){
    objectives.unshift({id:'integration',name:'Tam Nguyên cân bằng',complete:Number(integrationSummary?.harmony||0)>=60,current:`Hợp nhất ${Number(integrationSummary?.harmony||0).toFixed(1)}/100`,target:'Harmony ≥60',route:'character',detail:`Nút thắt hiện tại: ${integrationSummary?.bottleneck||'chưa xác định'}; cân thân–hồn–đạo–pháp bảo thay vì chỉ đẩy một stat.`});
  }
  if(stage.id==='great_vehicle'){
    objectives.unshift({id:'authority',name:'Đạo Quyền đủ trấn vực',complete:Number(greatVehicleSummary?.daoAuthority||0)>=60&&Number(greatVehicleSummary?.domainScale||0)>=55,current:`Đạo Quyền ${Number(greatVehicleSummary?.daoAuthority||0).toFixed(1)} · Quy mô ${Number(greatVehicleSummary?.domainScale||0).toFixed(1)}`,target:'Đạo Quyền ≥60 + Quy mô Đạo Vực ≥55',route:'dao',detail:'Đại Thừa kiểm tra khả năng áp Đạo lên phạm vi lớn; Tông Môn chỉ là accelerator, không phải điều kiện bắt buộc.'});
  }
  const finalGate=order===stage.end;
  const missing=objectives.filter(x=>!x.complete).map(x=>x.name);
  const nextAction=objectives.find(x=>!x.complete)??{route:'cultivation',name:`Chuẩn bị ${stage.nextName}`,detail:'Các milestone gameplay của đại cảnh giới đã hoàn tất.'};
  return {schema:'progression-closure.v113',active:true,stage:{...stage},objectives,finalGate:{applies:finalGate,ready:missing.length===0,missing},nextAction:{route:nextAction.route,title:nextAction.name,detail:nextAction.detail},verifiedThroughRealmOrder:45};
}

export function tribulationMilestoneBlockersV113(state,dungeons){
  const order=Math.max(0,Number(state?.realm?.maxRealmOrder)||0);
  if(order===41){
    const cleared=highestClearedDungeonFloor(dungeons,'dungeon.great_vehicle_domain');
    return cleared>=5?[]:[`Đại Thừa viên mãn cần first-clear Vạn Đạo Thiên Mạc tầng 5 (${cleared}/5)`];
  }
  if(order>=42&&order<=45){
    const need=order-41;
    const cleared=highestClearedDungeonFloor(dungeons,'dungeon.heavenly_tribulation_field');
    return cleared>=need?[]:[`Trước lần Thiên Kiếp kế tiếp cần first-clear Thiên Kiếp Cổ Trường tầng ${need} (${cleared}/${need})`];
  }
  return [];
}
