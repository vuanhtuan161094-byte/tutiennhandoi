const AXIS_LABELS={offense:'Sát thương',survival:'Sinh tồn',resource:'Tài nguyên / Chân Nguyên',tempo:'Nhịp chiến đấu',control:'Tài nguyên / Chân Nguyên',mobility:'Nhịp chiến đấu'};
const CLARITY_CATALOG=[
 {id:'cultivation',name:'Tu Luyện / Bế Quan',unlock:0,route:'cultivation',purpose:'Tạo Tu Vi và tiến tới cảnh giới tiếp theo.',do:'Tu Luyện chạy liên tục; dùng Bế Quan khi muốn nhận trước Tu Vi theo quota ngày.',cost:'Thời gian; Bế Quan dùng tối đa 3 giờ quy đổi mỗi ngày.',gain:'Tu Vi và cảnh giới mới.',source:'Tự tăng theo thời gian; không cần farm vật phẩm để Tu Luyện cơ bản.'},
 {id:'hunt',name:'Săn Yêu',unlock:1,route:'hunt',purpose:'PvE lặp lại để kiểm tra build và farm tài nguyên nền.',do:'Hạ Boss tầng thật để mở tầng tiếp theo; tầng đã hạ trở thành bãi Săn Ảo.',cost:'Sức mạnh build; không tiêu lượt đánh.',gain:'Linh Thạch, Yêu Đan và loot theo tầng; Săn Yêu không cộng Tu Vi trực tiếp.',source:'Boss Săn Yêu và Săn Ảo; Tu Luyện vẫn chạy độc lập 100% trong lúc săn.'},
 {id:'dungeons',name:'Phó Bản',unlock:1,route:'dungeons',purpose:'Nguồn farm nguyên liệu chuyên biệt cho từng hệ.',do:'Chọn Phó Bản đúng loại tài nguyên đang thiếu và vượt first-clear trước khi treo farm.',cost:'Khả năng vượt Boss và thời gian farm.',gain:'Nguyên liệu cường hóa/đột phá theo đúng hệ.',source:'Mỗi Phó Bản có purpose và reward riêng.'},
 {id:'dao',name:'Bản Đạo / Kỹ Năng',unlock:10,route:'skills',purpose:'Xác định cách nhân vật chiến đấu: resource, rotation, Active/Passive/Core/Tuyệt Kỹ.',do:'Tại Trúc Cơ chọn một Chủ Đạo; sau đó nâng kỹ năng và Tâm Pháp theo build.',cost:'Điểm kỹ năng, mảnh kỹ năng/Công Pháp và tài nguyên liên quan.',gain:'Cơ chế combat, DPS/sustain/control và nhịp sử dụng Chân Nguyên.',source:'Định Đạo, progression cảnh giới, mảnh skill/Công Pháp.'},
 {id:'roots',name:'Linh Căn / Căn Nguyên',unlock:0,route:'roots',purpose:'Nuôi 5 Hành và khuếch đại đúng package Ngũ Hành của skill/build.',do:'Chọn Trọng Tâm Dưỡng Căn; farm Căn Nguyên khi đạt mốc cấp.',cost:'Thời gian Dưỡng Căn và vật phẩm Căn Nguyên theo mốc.',gain:'Hiệu lực Hành, milestone và mechanic Căn Nguyên.',source:'Môi trường, Săn Yêu/Phó Bản và mốc Linh Căn.'},
 {id:'origins',name:'Huyết Mạch / Thể Chất / Tiềm Năng',unlock:0,route:'character',purpose:'Ba lớp nền nhân vật: thiên hướng bẩm sinh, thân thể và điểm stat đời hiện tại.',do:'Nâng Huyết Mạch/Thể Chất khi đủ nguyên liệu; phân Tiềm Năng theo build đang thiếu.',cost:'Huyết Tinh, Thể Phách Tinh Hoa và Điểm Tiềm Năng.',gain:'Stat combat và hiệu ứng origin trực tiếp.',source:'Phó Bản tương ứng, reward progression và Điểm Tiềm Năng.'},
 {id:'alchemy',name:'Đan Dược',unlock:10,route:'dongfu',purpose:'Tạo consumable hỗ trợ progression, trị Thương Thế và buff đời hiện tại.',do:'Trồng/thu dược liệu, luyện đúng recipe rồi dùng theo nhu cầu.',cost:'Dược liệu, Dược Tính Tinh Hoa và thời gian lò.',gain:'Hỗ trợ Tu Vi/hồi phục/buff theo loại đan.',source:'Dược Viên, Phó Bản và economy material.'},
 {id:'dongfu',name:'Động Phủ',unlock:10,route:'dongfu',purpose:'Nơi đầu tư lâu dài để làm các hệ phát triển hiệu quả hơn.',do:'Nâng đúng công trình gắn với hệ bạn đang nuôi; không cần nâng đều mọi thứ.',cost:'Linh Thạch + Tiên Ngọc Khóa theo cấp công trình.',gain:'Giảm chi phí hoặc tăng hiệu suất cho Đan, Khí, Linh Thú, Tri Kỷ, Công Pháp, Huyết Mạch, Thể Chất, Pháp Bảo.',source:'Tài nguyên tích lũy từ gameplay; Động Phủ là nơi nâng, không phải nơi farm.'},
 {id:'collection',name:'Vạn Tượng / Gacha',unlock:10,route:'collection',purpose:'Chọn hệ muốn đầu tư và đổi Ngọc lấy nguyên liệu/mảnh/sưu tập với pity riêng.',do:'Quay đúng banner của hệ đang nuôi; có thể giữ Ngọc nếu build chưa cần.',cost:'160 Ngọc/1 lượt hoặc 1440/10 lượt; không giới hạn lượt quay.',gain:'Chủ yếu nguyên liệu + mảnh; vật phẩm hiếm qua pool/rate-up/pity.',source:'Tiên Ngọc Khóa từ hoạt động V89 và Tiên Ngọc premium nếu có.'},
 {id:'pvp',name:'Đấu Pháp',unlock:18,route:'pvp',purpose:'PvP async để kiểm tra build, rating và nhận thưởng mùa/ngày.',do:'Chọn 1 trong 3 đối thủ, Tactical preset rồi để CombatKernel tự đánh.',cost:'Không mất mạng, Thương Thế hay Thọ Nguyên; không giới hạn số trận.',gain:'Rating/rank; 5 trận thắng nhận thưởng đầu mỗi ngày, thưởng cuối mùa.',source:'Đấu Pháp mở tại Kim Đan.'},
 {id:'soul',name:'Thần Hồn / Phân Thân',unlock:22,route:'soul',purpose:'Trục gameplay Nguyên Anh: nuôi Anh Thể và biến content đã first-clear thành farm song song/offline.',do:'Dưỡng Hồn → tạo Phân Thân → điều phối đúng chuyên môn Lục Đạo → cho worker chạy tầng đã first-clear; đồng thời công phá Dưỡng Hồn Trì.',cost:'Dưỡng Hồn Lộ + Thần Hồn Tinh Hoa và tải Thần Hồn.',gain:'Farm song song/offline; hoàn tất gameplay Nguyên Anh và mở sâu hệ Phân Thân.',source:'Dưỡng Hồn Trì và reward midgame; không cần Gacha.'},
 {id:'faction',name:'Tông Môn',unlock:14,route:'faction',purpose:'Phát triển thế lực, truyền thừa và ngân khố dùng chung của tổ chức.',do:'Gia nhập hoặc khai sơn; cống hiến → tích Công Đức/ngân khố → nâng cơ sở/truyền thừa.',cost:'Tài nguyên cá nhân khi cống hiến; ngân khố khi xây.',gain:'Danh phận, facility, truyền thừa, môn nhân và ảnh hưởng thế lực.',source:'NPC/thế giới, cống hiến và hoạt động Tông Môn.'},
 {id:'social',name:'Nhân Duyên',unlock:1,route:'social',purpose:'Biến NPC thành quan hệ gameplay thay vì chỉ hội thoại.',do:'Kết giao/tương trợ/luận đạo/tặng lễ; đủ điều kiện mới mở Sư Phụ, Đệ Tử, Đạo Lữ.',cost:'Thời gian, vị trí NPC và một số Linh Thạch cho hành động.',gain:'Truyền thụ, truyền công, song tu, gia đình và Nhân Quả.',source:'NPC sống trong world simulation.'},
 {id:'daoIntent',name:'Đạo Ý / Đạo Vực',unlock:26,route:'dao',purpose:'Tầng tiến hóa của Chủ Đạo đã chọn, không phải một Chủ Đạo thứ hai.',do:'Tĩnh Ngộ → tăng Độ sâu → chọn Diễn Giải → đủ điều kiện manifest Đạo Vực.',cost:'Thời gian/nguyên liệu Ngộ Đạo theo progression.',gain:'Modifier combat và Đạo Vực gắn đúng Chủ Đạo.',source:'Mở tại Hóa Thần, cộng hưởng từ build/Thần Hồn/môi trường.'},
 {id:'reincarnation',name:'Luân Hồi',unlock:10,route:'reincarnation',purpose:'Meta progression: kết một đời và chuyển thành sức mạnh lâu dài cho đời sau.',do:'Khi muốn kết đời, xem reward dự kiến → Tọa Hóa → kết toán → chọn kế thừa và mở đời kế; không có bước Thí Luyện giả bắt buộc.',cost:'Kết thúc đời hiện tại và dùng Năng Lượng Luân Hồi; một số lựa chọn kế thừa dùng CP.',gain:'RP/CP, Mệnh Cơ, Thiên Phú, Tiềm Năng permanent và di sản theo thành tựu thật.',source:'Cảnh giới, Lực Chiến, kỷ lục và Tiềm Năng đạt được trong đời.'},
 {id:'myriadLives',name:'Vạn Thế',unlock:10,route:'myriadLives',purpose:'Hồ sơ so sánh các đời để biết đời sau nên sửa điểm yếu nào.',do:'Xem record, 6 trục thành tựu và projection đời hiện tại trước khi Luân Hồi.',cost:'Không tốn tài nguyên; read-only.',gain:'Thông tin quyết định: đời này hơn/kém đời trước ở đâu.',source:'LifeSettlement archive canonical.'},
];
const MILESTONES=[
 {order:0,name:'Phàm Nhân',goal:'Khai mạch, hiểu Tu Luyện và chuẩn bị Luyện Khí.',features:['Tu Luyện','Linh Căn','Huyết Mạch · Thể Chất · Tiềm Năng']},
 {order:1,name:'Luyện Khí',goal:'Học vòng combat → first-clear → farm → nâng.',features:['Săn Yêu','Phó Bản','Hành Trang','Nhân Duyên']},
 {order:10,name:'Trúc Cơ',goal:'Khóa identity build và bắt đầu đầu tư hệ dài hạn.',features:['Định Đạo','Kỹ Năng/Passive','Động Phủ','Vạn Tượng','Luân Hồi']},
 {order:14,name:'Tử Phủ',goal:'Mở rộng build và xây thế lực nếu muốn.',features:['Tông Môn','Build sâu hơn']},
 {order:18,name:'Kim Đan',goal:'Đưa build vào cạnh tranh và tối ưu rotation.',features:['Đấu Pháp','Season/Tactical PvP']},
 {order:22,name:'Nguyên Anh',goal:'Nuôi Anh Thể, vận hành Phân Thân và công phá Dưỡng Hồn Trì.',features:['Thần Hồn','Phân Thân','Worker Phó Bản']},
 {order:26,name:'Hóa Thần',goal:'Biến Chủ Đạo thành Đạo Ý/Đạo Vực và vượt Ngộ Đạo Đài.',features:['Đạo Ý','Diễn Giải','Đạo Vực','Ngộ Đạo Đài']},
 {order:30,name:'Luyện Hư',goal:'Dùng Hư Không Liệt Giới làm checkpoint build trước Hợp Thể.',features:['Hư Không Liệt Giới','Không Gian Tắc Phiến']},
 {order:34,name:'Hợp Thể',goal:'Cân thân–hồn–đạo–pháp bảo rồi vượt Tam Nguyên Hợp Lô.',features:['Integration','Tam Nguyên Hợp Lô']},
 {order:38,name:'Đại Thừa',goal:'Mở rộng Đạo Quyền/Đạo Vực và chinh phục Vạn Đạo Thiên Mạc.',features:['Đạo Quyền','Vạn Đạo Thiên Mạc']},
 {order:42,name:'Độ Kiếp',goal:'Mỗi Thiên Kiếp thật phải được luyện trước tại Thiên Kiếp Cổ Trường.',features:['Thiên Kiếp Cổ Trường','Thiên Ngân']},
 {order:46,name:'Nhân Tiên',goal:'Luyện Tiên Nguyên/Tiên Thể và first-clear Tiên Linh Tẩy Trì.',features:['Tiên Nguyên','Tiên Linh Tẩy Trì']},
 {order:50,name:'Địa Tiên',goal:'Neo Tiên Thể vào Địa Luật và vượt Địa Mạch Tiên Phủ.',features:['Địa Mạch Neo','Địa Luật']},
 {order:54,name:'Thiên Tiên',goal:'Ổn định Thiên Chu và Thiên Luật Cộng Hưởng.',features:['Thiên Chu','Thiên Luật Vân Cung']},
 {order:58,name:'Chân Tiên',goal:'Rèn Chân Pháp Thân và Chân Luật Quyền.',features:['Chân Pháp Thân','Chân Luật Hải']},
 {order:62,name:'Huyền Tiên',goal:'Dệt Huyền Luật và bắt đầu chọn Manifestation theo build.',features:['Huyền Luật','Manifestation']},
 {order:66,name:'Kim Tiên',goal:'Rèn Bất Hoại Kim Tính và Kim Tiên Ấn.',features:['Kim Tiên Ấn','Bất Hoại Kim Lô']},
 {order:70,name:'Thái Ất Tiên',goal:'Ổn định kỷ nguyên và nhân quả của bản thân.',features:['Kỷ Nguyên Hà','Nhân Quả']},
 {order:74,name:'Đại La Kim Tiên',goal:'Tự chứng Đạo Quả và thoát ràng buộc thời tuyến.',features:['Đại La Đạo Quả','Vô Thời']},
 {order:78,name:'Tiên Vương',goal:'Xây Vương Vực Quyền cá nhân; Tông Môn không phải điều kiện bắt buộc.',features:['Vương Vực','Đạo Thống']},
 {order:82,name:'Tiên Đế',goal:'Tăng Đế Mệnh/Giới Quyền để bước qua giới hạn Tiên cảnh.',features:['Đế Mệnh','Giới Quyền']},
 {order:86,name:'Cực Hạn',goal:'Phá Cực theo lớp và chứng minh build tại Cực Hạn Biên Giới.',features:['Phá Cực','Cực Hạn Quyền']},
 {order:90,name:'Cực Đạo Chân Cảnh',goal:'Kết Cực Đạo Chân Hạch và luật nhất quán của chính mình.',features:['Cực Đạo','Tự Luật']},
 {order:94,name:'Hỗn Độn',goal:'Rèn Hỗn Độn Thân mà không mất bản sắc Đạo.',features:['Hỗn Độn Tương Tính','Hỗn Độn Uyên']},
 {order:98,name:'Hồng Mông',goal:'Nuôi Hồng Mông Chủng và Thái Sơ Sinh Cơ.',features:['Hồng Mông Tử Khí','Thái Sơ Chủng']},
 {order:102,name:'Khai Thiên',goal:'Ổn định Nội Vũ Trụ và Khai Thiên Quyền.',features:['Nội Vũ Trụ','Khai Thiên Thí Luyện']},
 {order:106,name:'Thế Giới Chủ',goal:'Nuôi Giới Tâm và tiềm năng chúng sinh.',features:['Giới Tâm','Chúng Sinh']},
 {order:110,name:'Vĩnh Sinh',goal:'Neo Bất Diệt Liên Tục trước Sáng Thế.',features:['Vĩnh Sinh Neo','Bất Diệt']},
 {order:114,name:'Sáng Thế Chủ',goal:'Chinh phục Sáng Thế Nguyên Hải và khai Kỷ Nguyên mới ở viên mãn.',features:['Sáng Thế','Kỷ Nguyên','Endgame loop']},
];
function systemAttention(id,args){
 const {order,specialization,potential,soul,dao,pvp}=args;
 if(id==='dao'&&order>=10&&!specialization?.mainDaoId)return 'attention';
 if(id==='origins'&&Number(potential?.unspent||0)>0)return 'attention';
 if(id==='soul'&&order>=22&&soul?.awakened&&(soul?.clones?.length||0)===0)return 'attention';
 if(id==='daoIntent'&&order>=26&&dao?.awakened&&!dao?.selected)return 'attention';
 if(id==='pvp'&&order>=18&&pvp?.unlocked&&(!pvp?.joined||Number(pvp?.reward?.remainingPaidWins||0)>0))return 'attention';
 return 'normal';
}
export function buildGameplayClarityV102(args){
 const order=Number(args.order||0);
 const systems=CLARITY_CATALOG.map(x=>({...x,unlocked:order>=x.unlock,status:order<x.unlock?'locked':systemAttention(x.id,args)}));
 return {schema:'gameplay-clarity.v102',revision:'v158',coreLoop:[
  {id:'cultivate',name:'Tu luyện',text:'Tích Tu Vi và mở cảnh giới.'},{id:'farm',name:'Farm',text:'Săn Yêu/Phó Bản lấy đúng tài nguyên đang thiếu.'},{id:'build',name:'Nuôi build',text:'Đầu tư vào các hệ tạo sức mạnh thật.'},{id:'challenge',name:'Công phá',text:'Boss/PvP kiểm tra build và mở content mới.'},{id:'reincarnate',name:'Luân Hồi',text:'Đổi thành tựu đời này thành lợi thế lâu dài.'}
 ],rules:['Động Phủ = nơi nâng; Phó Bản/Săn Yêu = nơi farm.','Tu Luyện tiếp tục độc lập khi Săn Yêu/farm; nguồn farm không được giả làm Tu Vi trực tiếp.','Vạn Tượng là lựa chọn tiêu Ngọc, không phải điều kiện bắt buộc để tiến cảnh.','Mỗi hệ phải chỉ rõ: làm gì · tốn gì · nhận gì · nguồn ở đâu.'],systems,attention:systems.filter(x=>x.status==='attention').map(x=>x.id)};
}
export function buildProgressionGuideV103(args){
 const order=Number(args.order||0);const capped=Math.min(order,117);
 let current=MILESTONES[0],next;
 for(let i=0;i<MILESTONES.length;i++){if(order>=MILESTONES[i].order)current=MILESTONES[i];else{next=MILESTONES[i];break;}}
 const steps=MILESTONES.map((m,i)=>{const upcoming=MILESTONES[i+1];const status=order>=m.order&&(!upcoming||order<upcoming.order)?'current':order>=m.order?'done':'upcoming';return {...m,status,realmName:args.realmNameAtOrder?.(m.order)||m.name};});
 const segmentEnd=next?.order??Math.max(117,order);const segmentStart=current.order;const pct=segmentEnd>segmentStart?Math.max(0,Math.min(100,(capped-segmentStart)/(segmentEnd-segmentStart)*100)):100;
 return {schema:'progression-guide.v103',revision:'v158',currentRealmOrder:order,currentRealmName:args.currentRealmName,currentMilestone:current,nextMilestone:next,segmentProgressPct:Number(pct.toFixed(1)),productionVerifiedThroughRealmOrder:117,immortalPlusProvisional:false,steps};
}
export function buildSessionLoopV104(args){
 const tasks=[]; const push=x=>tasks.push(x); const o=args.overview||{},cult=o.cultivation||{},order=Number(args.realmOrder||o.life?.realmOrder||0),nascent=args.soul?.midgame;
 const progression=args.progressionClosure?.active?args.progressionClosure:args.immortalProgression?.active?args.immortalProgression:undefined;
 const gate=progression?.finalGate,progressPct=Number(cult.progressPct||0);
 if(!args.alive){push({id:'life-end',priority:'primary',route:'reincarnation',title:'Hoàn tất đời hiện tại',reason:'Đời đã kết thúc; ưu tiên kết toán/chuẩn bị Luân Hồi trước mọi hoạt động khác.',gain:'Chuyển thành tựu thành meta progression.',optional:false});}
 else{
  if(Number(args.injury??o.injury??o.life?.injury??0)>60)push({id:'recover-injury',priority:'primary',route:'dongfu',title:'Trị Thương trước',reason:`Thương Thế đang ở ${Number(args.injury??o.injury??o.life?.injury??0).toFixed(0)}/100.`,gain:'Khôi phục khả năng Bế Quan, Thăng Cảnh và vượt nội dung khó.',optional:false});
  else if(order>=41&&order<=45&&cult.ready&&gate?.applies&&!gate.ready)push({id:'tribulation-prep',priority:'primary',route:progression.nextAction?.route||'dungeons',title:progression.nextAction?.title||'Luyện Kiếp trước',reason:progression.nextAction?.detail||'Thiên Kiếp thật đang bị chặn bởi milestone luyện kiếp.',gain:'Mở quyền Dẫn Thiên Kiếp thật.',optional:false});
  else if(order>=41&&order<=45&&cult.ready)push({id:'tribulation',priority:'primary',route:'cultivation',title:'Dẫn Thiên Kiếp',reason:'Tu Vi đã đầy và milestone luyện kiếp đã sẵn sàng.',gain:'Vượt mốc Độ Kiếp / Phi Thăng.',optional:false});
  else if(cult.ready&&cult.nextRealm)push({id:'ascend',priority:'primary',route:'cultivation',title:`Thăng Cảnh → ${cult.nextRealm}`,reason:'Tu Vi đã đạt yêu cầu của cảnh hiện tại.',gain:'Mở cảnh giới và content tiếp theo.',optional:false});
  else push({id:'cultivate',priority:'primary',route:'cultivation',title:'Tiếp tục Tu Luyện',reason:`Tiến độ Tu Vi ${progressPct.toFixed(0)}%.`,gain:'Tu Vi và tiến độ cảnh giới.',optional:false});
  if(order>=10&&!args.specialization?.mainDaoId)push({id:'define-dao',priority:'primary',route:'path',title:'Định Đạo',reason:'Đã tới Trúc Cơ nhưng chưa khóa Chủ Đạo; build chưa có identity hoàn chỉnh.',gain:'Mở bộ cơ chế Chủ Đạo và progression kỹ năng.',optional:false});
  if(Number(args.potential?.unspent||0)>0)push({id:'potential',priority:'normal',route:'character',title:`Dùng ${args.potential.unspent} Điểm Tiềm Năng`,reason:`Nút thắt Chiến Lực hiện là ${AXIS_LABELS[args.power?.bottleneckAxis]||args.power?.bottleneckAxis||'chưa rõ'}.`,gain:'Stat đời hiện tại.',optional:true});
  if(order===25&&nascent?.finalGate?.applies&&!nascent.finalGate.ready)push({id:'nascent-content',priority:'normal',route:nascent.nextAction?.route||'soul',title:nascent.nextAction?.title||'Hoàn tất Nguyên Anh Tu Nghiệp',reason:'Đây là content/build milestone, không chặn Thăng Cảnh V140.',gain:'Mở thêm gameplay Nguyên Anh.',optional:true});
  if(progression?.active&&!gate?.ready)push({id:'stage-content',priority:'normal',route:progression.nextAction?.route||'dungeons',title:progression.nextAction?.title||`Khám phá ${progression.stage?.name}`,reason:progression.nextAction?.detail||'Hoàn tất content milestone của cảnh giới hiện tại.',gain:'First-clear và tài nguyên/build progression.',optional:true});
  if(o.nextChallenge&&Number(o.nextChallenge.ratio??0)>=0.67)push({id:'boss',priority:'normal',route:'dungeons',title:`Thử ${o.nextChallenge.dungeonName} tầng ${o.nextChallenge.floor}`,reason:`Kèo ${o.nextChallenge.bandLabel||''} ${Number(o.nextChallenge.ratio||0).toFixed(2)}×; đủ gần để một thay đổi build có ý nghĩa.`,gain:'First-clear và mốc farm mới.',optional:true});
  if(args.contentLoop?.active&&!tasks.some(x=>x.id==='stage-content'))push({id:'stage-content',priority:'normal',route:args.contentLoop.activePlay?.route||'dungeons',title:args.contentLoop.activePlay?.title||'Công phá content cảnh giới',reason:args.contentLoop.activePlay?.reason||'Main Body mở tiến độ trước khi automation farm.',gain:'First-clear + tài nguyên đúng hệ.',optional:true});
  if(order>=1)push({id:'farm',priority:'low',route:'hunt',title:'Farm nút thắt build',reason:'Săn Yêu/Phó Bản là nguồn tài nguyên; chọn đúng thứ đang thiếu thay vì farm tất cả.',gain:'Linh Thạch, Yêu Đan và nguyên liệu nâng hệ.',optional:true});
 }
 const priorityRank={primary:0,normal:1,low:2};tasks.sort((a,b)=>(priorityRank[a.priority]??9)-(priorityRank[b.priority]??9));
 return {schema:'smart-session-loop.v140',revision:'v158',headline:args.alive?'Hôm nay nên làm gì?':'Đời này đã kết thúc',principle:'Gợi ý theo save hiện tại. Đủ Tu Vi thì Thăng Cảnh; chỉ Thiên Kiếp là cửa challenge riêng.',tasks:tasks.slice(0,6),loop:['Nhận tiến triển/offline','Xử lý nút thắt','First-clear content','Farm đúng tài nguyên','Nâng build','Boss/PvP hoặc Bế Quan']};
}

export function buildBuildOverviewV105(args){
 const p=args.power||{},b=args.build||{},c=args.character||{},roots=args.roots||{},sp=args.specialization||{},collection=args.collection||{},soul=args.soul||{},dao=args.dao||{};
 const sourceRows=(p.sources||[]).map(x=>({...x,impact:x.gainPctFromPrevious>=8?'major':x.gainPctFromPrevious>=2?'medium':x.gainPctFromPrevious>0?'minor':'none'}));
 const sorted=[...sourceRows].filter(x=>x.gainPctFromPrevious>0).sort((a,b)=>b.gainPctFromPrevious-a.gainPctFromPrevious);
 const entity=args.entity?.stats||{};const allocations=c.potential?.allocations||{};
 const systems=[
  {id:'dao',name:'Chủ Đạo',route:'path',value:sp.mainDaoName?`${sp.mainDaoName} Chủ${sp.secondaryDaoName?` · ${sp.secondaryDaoName} Phụ`:''}`:'Chưa Định Đạo',detail:`${(b.skills||[]).length} kỹ năng active · ${(b.roleCoverage||[]).join(', ')||'chưa có role coverage'}`},
  {id:'potential',name:'Tiềm Năng',route:'character',value:`Công ${allocations.power||0} · Thể ${allocations.body||0} · Phòng ${allocations.defense||0}`,detail:`Còn ${Number(c.potential?.unspent||0)} điểm chưa dùng.`},
  {id:'roots',name:'Linh Căn',route:'roots',value:roots.dominantRootName||'Ngũ Căn cân bằng',detail:roots.focusRootName?`Đang tập trung ${roots.focusRootName}`:'Chưa đặt Trọng Tâm Dưỡng Căn.'},
  {id:'origins',name:'Huyết Mạch / Thể Chất',route:'character',value:`${c.originDetails?.bloodline?.name||c.bloodlines?.[0]?.name||'Không'} · ${c.originDetails?.physique?.name||c.physiques?.[0]||'Không'}`,detail:'Origin đi trực tiếp vào CombatEntity; xem Nhân Vật để nâng phẩm/tiến cảnh.'},
  {id:'collection',name:'Sưu Tập / Linh Thú / Tri Kỷ',route:'collection',value:`${(collection.categories||[]).reduce((n,x)=>n+Number(x.owned||0),0)} món sở hữu`,detail:`Fortune Tri Kỷ ${Number(collection.confidantV87?.fortune?.points||0)} · Pháp Bảo fortune ${Number(collection.artifactV88?.fortune?.points||0)}.`},
  {id:'soul',name:'Thần Hồn / Phân Thân',route:'soul',value:soul.awakened?`${(soul.clones||[]).length} Phân Thân · tải ${Number(soul.totalLoad||0)}/${Number(soul.loadCapacity||0)}`:'Chưa thức tỉnh',detail:'Tăng khả năng farm song song và tham gia tầng hợp nhất midgame.'},
  {id:'daoIntent',name:'Đạo Ý / Đạo Vực',route:'dao',value:dao.awakened?(dao.selected?`${dao.mainDaoName||'Đạo'} · sâu ${Number(dao.selected.depth||0)}`:'Đã thức tỉnh · chưa Tĩnh Ngộ'):'Chưa mở',detail:dao.domain?.active?'Đạo Vực đang manifest.':'Đạo Vực cần Độ sâu + Diễn Giải.'},
 ];
 const bottleneck=AXIS_LABELS[p.bottleneckAxis]||p.bottleneckAxis||'Chưa xác định';const strongest=AXIS_LABELS[p.strongestAxis]||p.strongestAxis||'Chưa xác định';
 const recommendations=[`Nút thắt hiện tại: ${bottleneck}.`,`Sở trường hiện tại: ${strongest}.`];
 if(p.bottleneckAxis==='offense')recommendations.push('Ưu tiên kỹ năng/Công Pháp, Công Lực và nguồn tăng DPS trước khi đầu tư thêm hệ phụ.');
 if(p.bottleneckAxis==='survival')recommendations.push('Ưu tiên Thể Phách/Phòng Ngự và các nguồn giảm sát thương trước khi đẩy DPS tiếp.');
 if(p.bottleneckAxis==='resource'||p.bottleneckAxis==='control')recommendations.push('Ưu tiên Chân Nguyên, Hồi Chân Nguyên hoặc Hiệu suất Chân Nguyên để rotation không hụt tài nguyên.');
 if(p.bottleneckAxis==='tempo'||p.bottleneckAxis==='mobility')recommendations.push('Ưu tiên Tốc Độ Hành Động, Phá Thế và rotation ít thời gian chết; không cần stat Accuracy/Mobility legacy.');
 return {schema:'build-overview.v105',revision:'v158',score:p.score,identity:p.identity,stats:{attack:entity.attack,maxHp:entity.maxHp,defense:entity.defense,maxSpirit:entity.maxSpirit,actionSpeed:entity.actionSpeed},axes:{...p.breakdown},strongestAxis:p.strongestAxis,bottleneckAxis:p.bottleneckAxis,sourceContribution:sourceRows,topSources:sorted.slice(0,5),systems,recommendations,truth:'Nguồn sức mạnh lấy từ các stage CombatEntity canonical; không cộng một chỉ số power riêng cho UI.'};
}
