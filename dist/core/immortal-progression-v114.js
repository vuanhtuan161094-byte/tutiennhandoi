import { highestClearedDungeonFloor } from './dungeon.js';

export const IMMORTAL_MAJOR_STAGES_V114 = Object.freeze([
  {start:46,end:49,id:'human_immortal',name:'Nhân Tiên',dungeonId:'dungeon.immortal_spirit_pool',dungeonName:'Tiên Linh Trì',finalFloor:5,nextOrder:50,nextName:'Địa Tiên',metrics:[['essencePurity','Tiên Nguyên thuần',45],['immortalBody','Tiên Thể',45],['lawAdaptation','Thích nghi pháp tắc',35]]},
  {start:50,end:53,id:'earth_immortal',name:'Địa Tiên',dungeonId:'dungeon.earth_immortal_vein',dungeonName:'Địa Tiên Mạch',finalFloor:5,nextOrder:54,nextName:'Thiên Tiên',metrics:[['earthAnchor','Địa Mạch Neo',60],['earthVeinHarmony','Địa Luật Hòa Hợp',55]]},
  {start:54,end:57,id:'heaven_immortal',name:'Thiên Tiên',dungeonId:'dungeon.heaven_immortal_palace',dungeonName:'Thiên Tiên Cung',finalFloor:5,nextOrder:58,nextName:'Chân Tiên',metrics:[['heavenResonance','Thiên Luật Cộng Hưởng',65],['celestialCirculation','Thiên Chu',60]]},
  {start:58,end:61,id:'true_immortal',name:'Chân Tiên',dungeonId:'dungeon.true_immortal_law_sea',dungeonName:'Chân Luật Hải',finalFloor:5,nextOrder:62,nextName:'Huyền Tiên',metrics:[['trueLawBody','Chân Pháp Thân',70],['trueLawAuthority','Chân Luật Quyền',65]]},
  {start:62,end:65,id:'mystic_immortal',name:'Huyền Tiên',dungeonId:'dungeon.mystic_law_loom',dungeonName:'Huyền Luật Thiên Cơ',finalFloor:5,nextOrder:66,nextName:'Kim Tiên',metrics:[['mysticLawWeave','Huyền Luật Dệt',65],['mysticLawStability','Ổn định Huyền Luật',60]]},
  {start:66,end:69,id:'golden_immortal',name:'Kim Tiên',dungeonId:'dungeon.golden_immortal_forge',dungeonName:'Kim Tiên Thần Lô',finalFloor:5,nextOrder:70,nextName:'Thái Ất Tiên',metrics:[['goldenImmortalSeal','Kim Tiên Ấn',68],['indestructibleEssence','Bất Hoại Tính',62]]},
  {start:70,end:73,id:'taiyi_immortal',name:'Thái Ất Tiên',dungeonId:'dungeon.taiyi_epoch_river',dungeonName:'Thái Ất Kỷ Nguyên Hà',finalFloor:5,nextOrder:74,nextName:'Đại La Kim Tiên',metrics:[['taiyiEpochRiver','Kỷ Nguyên Hà',70],['causalStability','Nhân Quả Ổn Định',65]]},
  {start:74,end:77,id:'grand_luo',name:'Đại La Kim Tiên',dungeonId:'dungeon.grand_luo_orchard',dungeonName:'Đại La Đạo Quả Viên',finalFloor:5,nextOrder:78,nextName:'Tiên Vương',metrics:[['grandLuoDaoFruit','Đại La Đạo Quả',72],['timelineFreedom','Vô Thời Tự Do',68]]},
  {start:78,end:81,id:'immortal_king',name:'Tiên Vương',dungeonId:'dungeon.immortal_king_court',dungeonName:'Tiên Vương Đạo Đình',finalFloor:5,nextOrder:82,nextName:'Tiên Đế',metrics:[['kingDomainAuthority','Vương Vực Quyền',75],['orthodoxyWeight','Vương Đạo Trọng',70]]},
  {start:82,end:85,id:'immortal_emperor',name:'Tiên Đế',dungeonId:'dungeon.immortal_emperor_throne',dungeonName:'Tiên Đế Thiên Tọa',finalFloor:5,nextOrder:86,nextName:'Cực Hạn',metrics:[['emperorMandate','Đế Mệnh',80],['worldAuthority','Giới Quyền',75]]},
  {start:86,end:89,id:'extremity',name:'Cực Hạn',dungeonId:'dungeon.extremity_boundary',dungeonName:'Cực Hạn Biên Giới',finalFloor:5,nextOrder:90,nextName:'Cực Đạo Chân Cảnh',metrics:[['extremityLayers','Lớp Phá Cực',3],['extremityAuthority','Cực Hạn Quyền',24],['extremityInsight','Cực Hạn Ngộ',50]]},
  {start:90,end:93,id:'supreme_dao',name:'Cực Đạo Chân Cảnh',dungeonId:'dungeon.supreme_dao_origin',dungeonName:'Cực Đạo Bản Nguyên',finalFloor:5,nextOrder:94,nextName:'Hỗn Độn',metrics:[['supremeDaoCore','Cực Đạo Chân Hạch',70],['supremeLawConsistency','Tự Luật Nhất Quán',65]]},
  {start:94,end:97,id:'chaos',name:'Hỗn Độn',dungeonId:'dungeon.chaos_abyss',dungeonName:'Hỗn Độn Uyên',finalFloor:5,nextOrder:98,nextName:'Hồng Mông',metrics:[['chaosAffinity','Hỗn Độn Tương Tính',70],['chaosBody','Hỗn Độn Thân',65]]},
  {start:98,end:101,id:'hongmeng',name:'Hồng Mông',dungeonId:'dungeon.hongmeng_origin_sea',dungeonName:'Hồng Mông Bản Nguyên Hải',finalFloor:5,nextOrder:102,nextName:'Khai Thiên',metrics:[['hongmengSeed','Hồng Mông Chủng',72],['primordialVitality','Thái Sơ Sinh Cơ',68]]},
  {start:102,end:105,id:'heaven_opening',name:'Khai Thiên',dungeonId:'dungeon.heaven_opening_trial',dungeonName:'Khai Thiên Thí Luyện',finalFloor:5,nextOrder:106,nextName:'Thế Giới Chủ',metrics:[['heavenOpeningAuthority','Khai Thiên Quyền',75],['innerCosmosStability','Nội Vũ Trụ Ổn Định',70]]},
  {start:106,end:109,id:'world_lord',name:'Thế Giới Chủ',dungeonId:'dungeon.world_core_cradle',dungeonName:'Giới Tâm Thai Tàng',finalFloor:5,nextOrder:110,nextName:'Vĩnh Sinh',metrics:[['worldCore','Giới Tâm',78],['worldLifePotential','Chúng Sinh Tiềm Năng',72]]},
  {start:110,end:113,id:'eternity',name:'Vĩnh Sinh',dungeonId:'dungeon.eternity_river',dungeonName:'Vĩnh Sinh Trường Hà',finalFloor:5,nextOrder:114,nextName:'Sáng Thế Chủ',metrics:[['eternityAnchor','Vĩnh Sinh Neo',82],['deathlessContinuity','Bất Diệt Liên Tục',78]]},
  {start:114,end:117,id:'creation',name:'Sáng Thế Chủ',dungeonId:'dungeon.genesis_source',dungeonName:'Sáng Thế Bản Nguyên',finalFloor:5,nextOrder:null,nextName:null,metrics:[['creationSource','Sáng Thế Nguyên',100],['genesisAuthority','Sáng Thế Quyền',100]]},
]);

export function immortalMajorStageV114(realmOrder){
  const n=Math.max(0,Math.floor(Number(realmOrder)||0));
  return IMMORTAL_MAJOR_STAGES_V114.find(x=>n>=x.start&&n<=x.end);
}

export function immortalCadenceV159(realmOrder){
  const stage=immortalMajorStageV114(realmOrder);
  if(!stage)return {id:'inactive',label:'Chưa vào Tiên cảnh',loop:'Tu Luyện và hoàn thiện mortal progression.'};
  if(stage.id==='extremity')return {id:'limit-break',label:'Phá Cực theo lớp',loop:'Tích Áp Lực + Cực Hạn Ngộ → Phá Cực → áp lực lùi một phần → lặp đến đủ lớp → công phá Biên Giới.'};
  if(stage.id==='creation')return {id:'genesis-cycle',label:'Chu kỳ Sáng Thế',loop:'Luyện Sáng Thế Nguyên/Quyền → công phá Nguyên Hải → Khai Kỷ Nguyên → nguồn sáng thế hạ về 35/40 → tái cô đọng cho Kỷ Nguyên sau.'};
  if(stage.start>=90)return {id:'cosmic-refinement',label:'Cô đọng đại đạo cấp vũ trụ',loop:'Farm bản nguyên đúng cảnh → luyện hai trục cảnh giới → first-clear content → thăng đại cảnh.'};
  if(stage.start>=62)return {id:'law-refinement',label:'Luyện luật + build manifestation',loop:'Farm vật liệu luật → luyện hai trục cảnh giới → dùng Biểu Hiện như preset combat hữu hạn → first-clear content.'};
  return {id:'immortal-foundation',label:'Dựng Tiên cơ',loop:'Farm vật liệu Tiên cảnh → luyện nền thân/pháp/law → first-clear content → thăng đại cảnh.'};
}

function genericMetricObjectives(state,stage){
  return (stage.metrics||[]).map(([key,name,target])=>({
    id:`metric.${key}`,name,complete:Number(state?.immortal?.[key]||0)>=target,current:Number(state?.immortal?.[key]||0),target,route:'character',
    detail:`Dùng refinement canonical của ${stage.name}; không có hệ stat song song.`,
  }));
}

function extremityNextActionV159(state,order,objectives){
  const immortal=state?.immortal??{};
  const layers=Math.max(0,Number(immortal.extremityLayers)||0);
  const pressure=Math.max(0,Number(immortal.extremityPressure)||0);
  const insight=Math.max(0,Number(immortal.extremityInsight)||0);
  const needInsight=30+layers*5;
  if(layers<3){
    if(order===89&&pressure>=100&&insight>=needInsight){
      return {route:'character',name:`Phá Cực lớp ${layers+1}`,detail:`Điều kiện đã đủ: Áp Lực ${pressure}/100 · Ngộ ${insight}/${needInsight}. Phá lớp giới hạn thật; sau đó Áp Lực lùi về 20 và phải tích lại.`};
    }
    return {route:'character',name:'Tích Cực Hạn Áp Lực',detail:`Mục tiêu là Phá Cực 3 lớp. Hiện ${layers}/3 lớp · Áp Lực ${pressure}/100 · Ngộ ${insight}/${needInsight}. Chỉ Cực Hạn · Biên Giới mới thực hiện được cú Phá Cực.`};
  }
  return objectives.find(x=>!x.complete)??null;
}

function creationEpochObjectivesV159(state,order){
  if(order!==117)return [];
  const immortal=state?.immortal??{};
  const inventory=state?.inventory??{};
  const epochs=Math.max(0,Math.floor(Number(immortal.creationEpochs)||0));
  const coreNeed=20+epochs*5;
  const authorityNeed=epochs*3;
  return [
    {id:'epoch.core',name:'Nguyên Hạch Khai Kỷ',complete:Number(inventory['resource.genesis_core']||0)>=coreNeed,current:Number(inventory['resource.genesis_core']||0),target:coreNeed,route:'dungeons',detail:'Farm Sáng Thế Nguyên Hải; Kỷ Nguyên sau tốn thêm 5 Sáng Thế Nguyên Hạch.'},
    {id:'epoch.dawn',name:'Sơ Quang Tàn Phiến',complete:Number(inventory['resource.first_dawn_fragment']||0)>=1,current:Number(inventory['resource.first_dawn_fragment']||0),target:1,route:'dungeons',detail:'Nguồn canonical là Sáng Thế Nguyên Hải; đây là sink bắt buộc của mỗi lần Khai Kỷ Nguyên.'},
    {id:'epoch.authority',name:'Kỷ Nguyên Quyền',complete:Number(immortal.creationEpochAuthority||0)>=authorityNeed,current:Number(immortal.creationEpochAuthority||0),target:authorityNeed,route:'character',detail:'Kỷ Nguyên mới chỉ sinh khi quyền tích lũy từ các Kỷ Nguyên trước đủ chống spam vô hạn.'},
  ];
}

export function immortalProgressionSummaryV114(state,dungeons){
  const order=Math.max(0,Number(state?.realm?.maxRealmOrder)||0);
  const stage=immortalMajorStageV114(order);
  if(!stage)return {schema:'immortal-progression.v114',active:false,verifiedThroughRealmOrder:117};
  const cadence=immortalCadenceV159(order);
  const cleared=highestClearedDungeonFloor(dungeons,stage.dungeonId);
  const objectives=genericMetricObjectives(state,stage);
  objectives.push({id:'dungeon',name:`Công phá ${stage.dungeonName}`,complete:cleared>=stage.finalFloor,current:cleared,target:stage.finalFloor,route:'dungeons',detail:'First-clear bằng Main Body; worker chỉ farm tầng đã mở.'});
  objectives.push(...creationEpochObjectivesV159(state,order));
  const missing=objectives.filter(x=>!x.complete);
  const terminal=stage.nextOrder==null;

  let next;
  if(stage.id==='extremity')next=extremityNextActionV159(state,order,objectives);
  if(!next)next=missing[0]??null;
  if(!next&&stage.id==='creation'&&order===117){
    next={route:'character',name:'Khai Kỷ Nguyên',detail:'Sáng Thế Nguyên/Quyền, Nguyên Hải tầng 5 và tài nguyên Khai Kỷ đều đã đủ. Khai Kỷ sẽ đưa nguồn sáng thế về 35/40 để bắt đầu một vòng sáng tạo mới.'};
  }
  if(!next)next={route:terminal?'dungeons':'cultivation',name:terminal?'Hoàn thiện Sáng Thế':'Chuẩn bị thăng cảnh',detail:terminal?'Chinh phục tầng cuối và hoàn thiện chu kỳ Sáng Thế.':`Đủ gameplay gate để tiến ${stage.nextName}.`};

  return {
    schema:'immortal-progression.v114',active:true,stage:{...stage},cadence,objectives,
    finalGate:{applies:order===stage.end,ready:missing.length===0,missing:missing.map(x=>x.name)},
    terminal,nextAction:{route:next.route,title:next.name,detail:next.detail},verifiedThroughRealmOrder:117,
  };
}
