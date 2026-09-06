const trig=(id,event,chancePct,effects,sourceTags)=>({id,event,chancePct,...(sourceTags?{sourceTags}:{}),effects});
export const daoDefinitions = [
  {
    id:'dao.sword',battleDaoId:'sword',name:'Kiếm Đạo',description:'Kiếm Ý từ Chủ Đạo Kiếm được đẩy thành quy tắc: càng rõ đường kiếm, càng sắc nhịp kết liễu.',
    tags:['Dao','SwordDao'],resonanceTags:['Sword','Metal','Severance'],interpretations:[
      {id:'dao.sword.severance',name:'Đoạn',description:'Lấy một đường kiếm phân ranh thắng bại; trọng sát thương, chuẩn xác và hội tâm.',tags:['Severance'],combat:{attackMultiplier:1.12,accuracyMultiplier:1.08,critChanceFlat:18},grantedTriggers:[trig('dao.sword.severance.trigger','OnHit',18,[{type:'applyStatus',statusId:'status.dao_severed_guard',duration:4,target:'target'}],['ActiveHit'])],domainCombat:{attackMultiplier:1.06,accuracyMultiplier:1.08,actionSpeedMultiplier:1.06},domainTriggers:[trig('dao.sword.domain.trigger','OnCrit',32,[{type:'applyStatus',statusId:'status.dao_severed_guard',duration:6,target:'target'}],['ActiveHit'])]},
      {id:'dao.sword.guardian',name:'Hộ',description:'Kiếm thành giới tuyến hộ thân; giảm nhịp vỡ thế và giữ ổn định khi bị ép.',tags:['Protection'],combat:{defenseMultiplier:1.10,resolveMultiplier:1.12,accuracyMultiplier:1.05},grantedTriggers:[trig('dao.sword.guard.trigger','OnDamageTaken',16,[{type:'shield',capacity:88,stability:46,duration:4}])],domainCombat:{defenseMultiplier:1.09,resolveMultiplier:1.08}}
    ]
  },
  {
    id:'dao.fist',battleDaoId:'fist',name:'Quyền Đạo',description:'Liên Quyền từ nhịp đánh trở thành đạo lý áp sát: quyền sau nối quyền trước, càng đánh càng ép nhịp.',
    tags:['Dao','FistDao'],resonanceTags:['Fist','Melee','Combo','Yang'],interpretations:[
      {id:'dao.fist.continuum',name:'Liên Miên',description:'Không cầu một quyền định thắng; dùng chuỗi quyền liên tục đoạt quyền hành động.',tags:['Combo'],combat:{attackMultiplier:1.09,actionSpeedMultiplier:1.10,mobilityMultiplier:1.05},grantedTriggers:[trig('dao.fist.continuum.trigger','OnHit',22,[{type:'restoreSpirit',flat:6}],['ActiveHit'])],domainCombat:{actionSpeedMultiplier:1.09,attackMultiplier:1.06}},
      {id:'dao.fist.collapse',name:'Băng Kình',description:'Tích thế trong từng quyền rồi dồn lực vào điểm phá; thiên về bộc phát và xuyên thế.',tags:['Burst'],combat:{attackMultiplier:1.13,critChanceFlat:12,accuracyMultiplier:1.06},domainCombat:{attackMultiplier:1.09,controlPowerMultiplier:1.05}}
    ]
  },
  {
    id:'dao.body',battleDaoId:'body',name:'Thể Đạo',description:'Thể Phách không chỉ là chịu đòn; thân thể tự thân trở thành pháp tắc sinh tồn và phản áp.',
    tags:['Dao','BodyDao'],resonanceTags:['Body','Defense','Earth','Blood'],interpretations:[
      {id:'dao.body.indestructible',name:'Bất Hoại',description:'Lấy thân làm thành; càng chịu áp lực càng giữ được tuyến sống.',tags:['Endurance'],combat:{maxHpMultiplier:1.15,defenseMultiplier:1.10,resolveMultiplier:1.08},grantedTriggers:[trig('dao.body.indestructible.trigger','OnDamageTaken',14,[{type:'heal',maxHpPct:0.028,target:'self'}])],domainCombat:{maxHpMultiplier:1.10,defenseMultiplier:1.08}},
      {id:'dao.body.rebound',name:'Phản Chấn',description:'Đem lực đối phương nhập vào nhịp thân, đổi bị động thành thế đứng vững và phản công.',tags:['Counter'],combat:{defenseMultiplier:1.12,controlPowerMultiplier:1.07,maxHpMultiplier:1.08},grantedTriggers:[trig('dao.body.rebound.trigger','OnDamageTaken',18,[{type:'shield',capacity:96,stability:58,duration:4}])],domainCombat:{resolveMultiplier:1.10,defenseMultiplier:1.07}}
    ]
  },
  {
    id:'dao.spell',battleDaoId:'spell',name:'Pháp Đạo',description:'Pháp thuật từ chiêu thức rời rạc thành hệ quy tắc vận hành Chân Nguyên, khống chế và bộc phát.',
    tags:['Dao','SpellDao'],resonanceTags:['Spell','Fire','Water','Lightning','Control'],interpretations:[
      {id:'dao.spell.resonance',name:'Cộng Minh',description:'Dùng Chân Nguyên cộng hưởng với thuật thức để duy trì chu kỳ thi pháp ổn định.',tags:['Resonance'],combat:{maxSpiritMultiplier:1.14,controlPowerMultiplier:1.10,accuracyMultiplier:1.06},grantedTriggers:[trig('dao.spell.resonance.trigger','OnHit',18,[{type:'restoreSpirit',flat:8}],['ActiveHit'])],domainCombat:{maxSpiritMultiplier:1.09,actionSpeedMultiplier:1.06}},
      {id:'dao.spell.cataclysm',name:'Thiên Biến',description:'Nén thuật thức thành một đợt bộc phát lớn; mạnh hơn nhưng đòi hỏi nhịp Chân Nguyên rõ ràng.',tags:['Burst'],combat:{attackMultiplier:1.11,controlPowerMultiplier:1.09,critChanceFlat:10},domainCombat:{attackMultiplier:1.08,controlPowerMultiplier:1.08}}
    ]
  },
  {
    id:'dao.poison',battleDaoId:'poison',name:'Độc Đạo',description:'Độc Tầng trở thành điều kiện chiến trường: không cần thắng ngay, chỉ cần khiến mọi nhịp sau của đối thủ tệ hơn.',
    tags:['Dao','PoisonDao'],resonanceTags:['Poison','Blood','Wood','Debuff'],interpretations:[
      {id:'dao.poison.erosion',name:'Ăn Mòn',description:'Từng lớp độc làm phòng tuyến mất dần ý nghĩa.',tags:['Erosion'],combat:{controlPowerMultiplier:1.10,accuracyMultiplier:1.06},grantedTriggers:[trig('dao.poison.erosion.trigger','OnHit',20,[{type:'applyStatus',statusId:'status.dao_erosion',duration:5,target:'target'}],['ActiveHit'])],domainCombat:{actionSpeedMultiplier:1.05,controlPowerMultiplier:1.08}},
      {id:'dao.poison.infiltration',name:'Thẩm Thấu',description:'Không tăng độc bằng lượng đơn thuần; tăng khả năng duy trì áp lực qua thời gian.',tags:['Sustain'],combat:{maxSpiritMultiplier:1.08,controlPowerMultiplier:1.12,resolveMultiplier:1.05},grantedTriggers:[trig('dao.poison.infiltration.trigger','OnHit',16,[{type:'damageOverTime',coefficientPerTick:0.13,ticks:3,interval:1.2}],['ActiveHit'])],domainCombat:{controlPowerMultiplier:1.09,accuracyMultiplier:1.06}}
    ]
  },
  {
    id:'dao.artifact',battleDaoId:'artifact',name:'Ngự Khí Đạo',description:'Ngự Khí không còn là gọi nhiều pháp khí; cốt lõi là điều phối nhiều nguồn lực thành một trận tuyến thống nhất.',
    tags:['Dao','ArtifactDao'],resonanceTags:['Artifact','Control','Metal','Spirit'],interpretations:[
      {id:'dao.artifact.orchestra',name:'Vạn Khí Đồng Nhịp',description:'Mỗi pháp khí là một nhịp; đồng bộ càng tốt, vòng công thủ càng ít khoảng trống.',tags:['Orchestration'],combat:{maxSpiritMultiplier:1.10,controlPowerMultiplier:1.10,defenseMultiplier:1.06},grantedTriggers:[trig('dao.artifact.orchestra.trigger','OnDamageTaken',15,[{type:'shield',capacity:82,stability:50,duration:4}])],domainCombat:{controlPowerMultiplier:1.08,maxSpiritMultiplier:1.07}},
      {id:'dao.artifact.command',name:'Ngự Lệnh',description:'Tập trung vào quyền điều khiển và độ chính xác của từng lần điều khí.',tags:['Command'],combat:{accuracyMultiplier:1.10,actionSpeedMultiplier:1.07,controlPowerMultiplier:1.08},grantedTriggers:[trig('dao.artifact.command.trigger','OnHit',18,[{type:'restoreSpirit',flat:7}],['ActiveHit'])],domainCombat:{accuracyMultiplier:1.08,actionSpeedMultiplier:1.07}}
    ]
  },
  {
    id:'dao.formation',battleDaoId:'formation',name:'Trận Đạo',description:'Trận thế từ công cụ chuẩn bị thành luật không gian chiến đấu: vị trí, tiết tấu và vùng an toàn đều do mình định nghĩa.',
    tags:['Dao','FormationDao'],resonanceTags:['Formation','Control','Earth','Space'],interpretations:[
      {id:'dao.formation.lock',name:'Định Giới',description:'Ổn định trận giới để giảm biến số, giữ nhịp phòng thủ và khống chế.',tags:['Field'],combat:{defenseMultiplier:1.11,resolveMultiplier:1.09,controlPowerMultiplier:1.09},grantedTriggers:[trig('dao.formation.lock.trigger','OnDamageTaken',16,[{type:'shield',capacity:90,stability:62,duration:5}])],domainCombat:{defenseMultiplier:1.09,controlPowerMultiplier:1.08}},
      {id:'dao.formation.shift',name:'Chuyển Trận',description:'Không giữ trận cố định; dùng biến hóa trận vị để giành tiên thủ và chính xác.',tags:['Mobility'],combat:{mobilityMultiplier:1.10,accuracyMultiplier:1.09,actionSpeedMultiplier:1.06},domainCombat:{mobilityMultiplier:1.09,accuracyMultiplier:1.08}}
    ]
  },
  {
    id:'dao.mind',battleDaoId:'mind',name:'Thần Niệm Đạo',description:'Thần Niệm từ tài nguyên khống chế thành quyền quyết định nhịp nhận biết, khóa mục tiêu và chống nhiễu.',
    tags:['Dao','MindDao'],resonanceTags:['Mind','Soul','Control','Void'],interpretations:[
      {id:'dao.mind.suppression',name:'Trấn Niệm',description:'Dùng thần niệm ép nhịp đối phương, thiên về khống chế và độ chính xác.',tags:['Suppression'],combat:{controlPowerMultiplier:1.14,accuracyMultiplier:1.10,maxSpiritMultiplier:1.06},grantedTriggers:[trig('dao.mind.suppression.trigger','OnHit',18,[{type:'restoreSpirit',flat:7}],['ActiveHit'])],domainCombat:{controlPowerMultiplier:1.10,accuracyMultiplier:1.08}},
      {id:'dao.mind.clarity',name:'Minh Tâm',description:'Giữ tâm cảnh trong suốt để chống nhiễu và duy trì vòng kỹ năng dài.',tags:['Clarity'],combat:{resolveMultiplier:1.12,maxSpiritMultiplier:1.12,actionSpeedMultiplier:1.05},grantedTriggers:[trig('dao.mind.clarity.trigger','OnDamageTaken',12,[{type:'restoreSpirit',flat:10}])],domainCombat:{resolveMultiplier:1.09,maxSpiritMultiplier:1.08}}
    ]
  },
  // Legacy V94 definitions remain loadable so old saves never lose referenced Dao ids.
  {id:'dao.lightning',legacy:true,name:'Lôi Đạo · Legacy',description:'Định nghĩa tương thích save cũ; không còn là lựa chọn Đạo Ý production.',tags:['Dao','LegacyDao','LightningDao'],resonanceTags:['Lightning','Thunder'],interpretations:[{id:'dao.lightning.judgment',name:'Thiên Phạt',description:'Legacy interpretation.',tags:['Judgment'],combat:{actionSpeedMultiplier:1.10,critChanceFlat:22,controlPowerMultiplier:1.08},domainCombat:{mobilityMultiplier:1.10,actionSpeedMultiplier:1.08}}]},
  {id:'dao.fire',legacy:true,name:'Hỏa Đạo · Legacy',description:'Định nghĩa tương thích save cũ; không còn là lựa chọn Đạo Ý production.',tags:['Dao','LegacyDao','FireDao'],resonanceTags:['Fire'],interpretations:[{id:'dao.fire.refinement',name:'Luyện Hóa',description:'Legacy interpretation.',tags:['Refinement'],combat:{attackMultiplier:1.10,maxSpiritMultiplier:1.08},domainCombat:{attackMultiplier:1.08}}]},
  {id:'dao.life',legacy:true,name:'Sinh Mệnh Đạo · Legacy',description:'Định nghĩa tương thích save cũ; không còn là lựa chọn Đạo Ý production.',tags:['Dao','LegacyDao','LifeDao'],resonanceTags:['Life','Wood','Healing'],interpretations:[{id:'dao.life.cycle',name:'Tuần Hoàn',description:'Legacy interpretation.',tags:['Cycle'],combat:{maxHpMultiplier:1.14,defenseMultiplier:1.05},domainCombat:{maxHpMultiplier:1.09,resolveMultiplier:1.06}}]},
  {id:'dao.space',legacy:true,name:'Không Gian Đạo · Legacy',description:'Định nghĩa tương thích save cũ; không còn là lựa chọn Đạo Ý production.',tags:['Dao','LegacyDao','SpaceDao'],resonanceTags:['Space','Void','Star'],interpretations:[{id:'dao.space.folding',name:'Chiết Điệp',description:'Legacy interpretation.',tags:['Folding'],combat:{mobilityMultiplier:1.16,accuracyMultiplier:1.10,actionSpeedMultiplier:1.06},domainCombat:{mobilityMultiplier:1.12,accuracyMultiplier:1.08}}]}
];
