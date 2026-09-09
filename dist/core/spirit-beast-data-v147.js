const dmg = (coefficient, breakDamagePct = 0, element) => ({ type: 'damage', coefficient, sourceTag: 'Summon', canCrit: false, canDodge: true, canHeart: false, procCoefficient: 0, breakDamagePct, elementalCoefficients: element ? { [element]: 1 } : undefined });
const dot = (coefficientPerTick, ticks, element = 'Poison') => ({ type: 'damageOverTime', coefficientPerTick, ticks, interval: 1, procCoefficient: 0, element });
const shield = (attackCoefficient, maxHpPct = 0) => ({ type: 'shield', capacity: 0, stability: 0, duration: 6, attackCoefficient, maxHpPct, overflowDamageRatio: .15 });
const status = (statusId, duration, target = 'target') => ({ type: 'applyStatus', statusId, duration, target });

export const SPIRIT_BEAST_SPECIES_V147 = [
  { id:'pet.1', name:'Xích Viêm Sư', grade:'heaven', role:'DPS', roleLabel:'Bạo phát đơn mục tiêu', description:'Linh thú hỏa hệ chuyên ép Boss và khuếch đại cửa sổ bạo phát.', asset:'/assets/huntv2/beasts/light-lion.png', base:{hp:1050,attack:118,defense:72}, growth:{hp:.058,attack:.068,defense:.048}, passive:{id:'pet.1.passive',name:'Viêm Tâm',kind:'passive',description:'Kỹ năng Xích Viêm Sư gây thêm sát thương; 12★/20★ tăng hiệu lực Nội Tại.',modifiers:{skillDamagePct:12}}, actives:[
    {id:'pet.1.skill1',name:'Viêm Trảo',kind:'active',unlockStars:0,cooldown:5,trigger:'OnHit',description:'Trợ kích hỏa trảo đơn mục tiêu.',effects:[dmg(.38,5,'Fire')]},
    {id:'pet.1.skill2',name:'Liệt Diễm Phệ',kind:'active',unlockStars:8,cooldown:9,trigger:'OnHit',description:'Đốt mục tiêu trong vài nhịp.',effects:[dot(.10,4,'Fire')]},
    {id:'pet.1.skill3',name:'Sư Vương Nộ',kind:'active',unlockStars:16,cooldown:15,trigger:'OnHit',description:'Bạo phát lớn và phá phòng mục tiêu.',effects:[dmg(.72,16,'Fire'),status('status.armor_fracture',4)]}
  ]},
  { id:'pet.2', name:'Huyền Giáp Quy', grade:'earth', role:'TANK', roleLabel:'Hộ chủ · Khiên', description:'Linh thú phòng thủ, giúp chủ nhân chịu được các nhịp sát thương lớn.', asset:'/assets/huntv2/beasts/ice-tortoise.png', base:{hp:1420,attack:70,defense:124}, growth:{hp:.071,attack:.043,defense:.071}, passive:{id:'pet.2.passive',name:'Huyền Giáp',kind:'passive',description:'Khiên do Huyền Giáp Quy tạo ra mạnh hơn; 12★/20★ tăng hiệu lực Nội Tại.',modifiers:{shieldPct:18}}, actives:[
    {id:'pet.2.skill1',name:'Quy Giáp Chấn',kind:'active',unlockStars:0,cooldown:6,trigger:'OnHit',description:'Chấn kích và tạo khiên nhỏ.',effects:[dmg(.24,8,'Earth'),shield(.08,2)]},
    {id:'pet.2.skill2',name:'Trấn Nhạc',kind:'active',unlockStars:8,cooldown:10,trigger:'OnDamageTaken',description:'Khi chủ nhân chịu đòn, dựng khiên hộ chủ.',effects:[shield(.16,5)]},
    {id:'pet.2.skill3',name:'Huyền Giáp Phản Chấn',kind:'active',unlockStars:16,cooldown:16,trigger:'OnDamageTaken',description:'Phản chấn mạnh khi chịu sát thương.',effects:[dmg(.48,18,'Earth'),shield(.10,3)]}
  ]},
  { id:'pet.3', name:'Mộng Linh Hồ', grade:'heaven', role:'CONTROL', roleLabel:'Khống chế · Phá phòng', description:'Linh hồ thiên về làm chậm nhịp đối thủ và mở cơ hội cho build chính.', asset:'/assets/huntv2/beasts/dark-fox.png', base:{hp:980,attack:96,defense:76}, growth:{hp:.052,attack:.059,defense:.051}, passive:{id:'pet.3.passive',name:'Mộng Ảnh',kind:'passive',description:'Khống chế của Mộng Linh Hồ kéo dài hơn; 12★/20★ tăng hiệu lực Nội Tại.',modifiers:{controlDurationPct:20}}, actives:[
    {id:'pet.3.skill1',name:'Mộng Hỏa',kind:'active',unlockStars:0,cooldown:6,trigger:'OnHit',description:'Niệm hỏa gây sát thương linh hồn.',effects:[dmg(.30,4,'Soul')]},
    {id:'pet.3.skill2',name:'Mị Tâm',kind:'active',unlockStars:8,cooldown:11,trigger:'OnHit',description:'Gây sát thương và làm choáng ngắn.',effects:[dmg(.24,4,'Soul'),status('status.stun',1.1)]},
    {id:'pet.3.skill3',name:'Phá Mộng',kind:'active',unlockStars:16,cooldown:16,trigger:'OnHit',description:'Xé trạng thái phòng thủ và làm mục tiêu suy yếu.',effects:[dmg(.44,10,'Soul'),status('status.soul_exposed',4)]}
  ]},
  { id:'pet.4', name:'Thanh Vân Hạc', grade:'mystic', role:'SUPPORT', roleLabel:'Hỗ trợ · Nhịp chiến', description:'Linh hạc hỗ trợ nhịp kỹ năng và bảo vệ chủ nhân thay vì chạy theo raw DPS.', asset:'/assets/huntv2/beasts/wind-phoenix.png', base:{hp:990,attack:88,defense:80}, growth:{hp:.054,attack:.052,defense:.054}, passive:{id:'pet.4.passive',name:'Thanh Phong Linh Tức',kind:'passive',description:'Kỹ năng trợ chiến hồi nhanh hơn; 12★/20★ tăng hiệu lực Nội Tại.',modifiers:{cooldownPct:12}}, actives:[
    {id:'pet.4.skill1',name:'Phong Vũ',kind:'active',unlockStars:0,cooldown:6,trigger:'OnHit',description:'Phong nhận trợ kích.',effects:[dmg(.27,4,'Wind')]},
    {id:'pet.4.skill2',name:'Tường Vân Hộ Chủ',kind:'active',unlockStars:8,cooldown:11,trigger:'OnDamageTaken',description:'Tạo khiên nhẹ khi chủ nhân chịu đòn.',effects:[shield(.10,3)]},
    {id:'pet.4.skill3',name:'Thanh Phong Gia Trì',kind:'active',unlockStars:16,cooldown:17,trigger:'OnHit',description:'Gia trì tốc độ hành động trong thời gian ngắn.',effects:[status('status.wind_step',5,'self')]}
  ]},
  { id:'pet.5', name:'Lôi Ảnh Lang', grade:'earth', role:'DPS', roleLabel:'Liên kích · Tốc chiến', description:'Linh lang tốc độ cao, nhiều lần trợ kích và gây Phá Thế ổn định.', asset:'/assets/huntv2/beasts/thunder-wolf.png', base:{hp:1040,attack:108,defense:78}, growth:{hp:.056,attack:.064,defense:.050}, passive:{id:'pet.5.passive',name:'Lôi Bộ',kind:'passive',description:'Kỹ năng trợ kích hồi nhanh hơn; 12★/20★ tăng hiệu lực Nội Tại.',modifiers:{cooldownPct:15}}, actives:[
    {id:'pet.5.skill1',name:'Lôi Nha',kind:'active',unlockStars:0,cooldown:4.5,trigger:'OnHit',description:'Lôi kích nhanh.',effects:[dmg(.29,7,'Lightning')]},
    {id:'pet.5.skill2',name:'Truy Ảnh',kind:'active',unlockStars:8,cooldown:8,trigger:'OnHit',description:'Hai nhịp lôi kích liên tiếp.',effects:[dmg(.22,5,'Lightning'),dmg(.22,5,'Lightning')]},
    {id:'pet.5.skill3',name:'Thiên Lôi Phác Sát',kind:'active',unlockStars:16,cooldown:14,trigger:'OnHit',description:'Đòn lôi sát mạnh thiên về Phá Thế.',effects:[dmg(.58,22,'Lightning')]}
  ]},
  { id:'pet.6', name:'Bích Linh Lộc', grade:'mystic', role:'SUPPORT', roleLabel:'Thanh tẩy · Hộ chủ', description:'Linh lộc bảo hộ, giải trạng thái xấu và tạo lớp phòng vệ vừa phải.', asset:'/assets/huntv2/beasts/wood-stag.png', base:{hp:1160,attack:78,defense:94}, growth:{hp:.062,attack:.047,defense:.060}, passive:{id:'pet.6.passive',name:'Bích Mộc Sinh Cơ',kind:'passive',description:'Khiên hộ chủ mạnh hơn; 12★/20★ tăng hiệu lực Nội Tại.',modifiers:{shieldPct:20}}, actives:[
    {id:'pet.6.skill1',name:'Lộc Ảnh',kind:'active',unlockStars:0,cooldown:6,trigger:'OnHit',description:'Mộc linh trợ kích.',effects:[dmg(.25,3,'Wood')]},
    {id:'pet.6.skill2',name:'Thanh Tâm',kind:'active',unlockStars:8,cooldown:12,trigger:'OnDamageTaken',description:'Gỡ một nhóm trạng thái bất lợi và tạo khiên.',effects:[{type:'removeStatus',groups:['Debuff','BodyControl','SpiritControl'],target:'self'},shield(.08,2)]},
    {id:'pet.6.skill3',name:'Vạn Mộc Hộ Thể',kind:'active',unlockStars:16,cooldown:18,trigger:'OnDamageTaken',description:'Dựng khiên lớn bảo hộ chủ nhân.',effects:[shield(.18,6)]}
  ]},
  { id:'pet.7', name:'U Minh Xà', grade:'immortal', role:'DOT', roleLabel:'Độc · Suy yếu', description:'Linh xà tích độc và kéo dài áp lực trên mục tiêu lâu sống.', asset:'/assets/huntv2/beasts/water-dragon.png', base:{hp:1010,attack:110,defense:72}, growth:{hp:.054,attack:.066,defense:.047}, passive:{id:'pet.7.passive',name:'U Minh Độc Tức',kind:'passive',description:'Độc thương theo thời gian mạnh hơn; 12★/20★ tăng hiệu lực Nội Tại.',modifiers:{dotDamagePct:20}}, actives:[
    {id:'pet.7.skill1',name:'Độc Nha',kind:'active',unlockStars:0,cooldown:5.5,trigger:'OnHit',description:'Cắn độc và để lại DoT.',effects:[dmg(.22,3,'Poison'),dot(.07,4,'Poison')]},
    {id:'pet.7.skill2',name:'U Minh Thực Cốt',kind:'active',unlockStars:8,cooldown:10,trigger:'OnHit',description:'Làm mục tiêu suy yếu trước độc.',effects:[status('status.poison_weakened',5),dot(.09,5,'Poison')]},
    {id:'pet.7.skill3',name:'Vạn Độc Phệ Tâm',kind:'active',unlockStars:16,cooldown:16,trigger:'OnHit',description:'Đại độc thuật kéo dài.',effects:[dmg(.34,8,'Poison'),dot(.12,6,'Poison')]}
  ]},
  { id:'pet.8', name:'Sơn Nhạc Hùng', grade:'earth', role:'BRUISER', roleLabel:'Phá Thế · Cận chiến', description:'Linh hùng nặng, bền và đặc biệt hữu dụng trước Boss có cơ chế Phá Thế.', asset:'/assets/huntv2/beasts/earth-qilin.png', base:{hp:1280,attack:96,defense:108}, growth:{hp:.066,attack:.057,defense:.066}, passive:{id:'pet.8.passive',name:'Sơn Nhạc Thể',kind:'passive',description:'Đòn Linh Thú gây Phá Thế mạnh hơn; 12★/20★ tăng hiệu lực Nội Tại.',modifiers:{breakPct:25}}, actives:[
    {id:'pet.8.skill1',name:'Chấn Sơn Chưởng',kind:'active',unlockStars:0,cooldown:6,trigger:'OnHit',description:'Đòn nặng gây Phá Thế.',effects:[dmg(.30,14,'Earth')]},
    {id:'pet.8.skill2',name:'Hùng Bão',kind:'active',unlockStars:8,cooldown:10,trigger:'OnHit',description:'Đánh mạnh làm mục tiêu mất thăng bằng.',effects:[dmg(.38,14,'Earth'),status('status.predator_off_balance',3)]},
    {id:'pet.8.skill3',name:'Sơn Băng Địa Liệt',kind:'active',unlockStars:16,cooldown:16,trigger:'OnHit',description:'Đại kích có Phá Thế rất cao.',effects:[dmg(.62,30,'Earth')]}
  ]}
];

export const SPIRIT_BEAST_COMBAT_TUNING_V147 = Object.freeze({
  'pet.1':{powerScale:1,statusDurationScale:1,cooldownScale:1},
  'pet.2':{powerScale:.95,statusDurationScale:1,cooldownScale:1.05},
  'pet.3':{powerScale:.90,statusDurationScale:.78,cooldownScale:1.08},
  'pet.4':{powerScale:1.18,statusDurationScale:1.05,cooldownScale:.92},
  'pet.5':{powerScale:.95,statusDurationScale:1,cooldownScale:1.03},
  'pet.6':{powerScale:1,statusDurationScale:1,cooldownScale:1},
  'pet.7':{powerScale:1.28,statusDurationScale:1.05,cooldownScale:.88},
  'pet.8':{powerScale:1,statusDurationScale:1,cooldownScale:1}
});
