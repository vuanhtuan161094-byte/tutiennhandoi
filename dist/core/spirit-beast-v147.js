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

export const SPIRIT_BEAST_SCHEMA_V147 = 'spirit-beast.v147';
export const SPIRIT_BEAST_FRAGMENT_PER_STAR_V147 = 10;
export const SPIRIT_BEAST_BASE_LEVEL_CAP_V147 = 100;
export const SPIRIT_BEAST_LEVELS_PER_STAR_V147 = 50;
export const SPIRIT_BEAST_BOND_LEVEL_CAP_V147 = 1000;
export const SPIRIT_BEAST_LEGACY_FULL_STAR_V147 = 20;
export const SPIRIT_BEAST_STAR_MILESTONE_STEP_V147 = 4;
export const SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147 = 5;
export const SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147 = 10;
// Every owned beast contributes a bounded share of its authored raw HP/Attack/Defense.
// Percent Linh Khế is handled separately and only applies to the equipped beast.
export const SPIRIT_BEAST_COLLECTION_RAW_SHARE_V147 = .10;
export const SPIRIT_BEAST_SPECIES = SPIRIT_BEAST_SPECIES_V147;
export const SPIRIT_BEAST_COMBAT_TUNING = SPIRIT_BEAST_COMBAT_TUNING_V147;

const BY_ID = new Map(SPIRIT_BEAST_SPECIES_V147.map(x => [x.id, x]));
const LEGACY_SPECIES_TO_V147 = ['pet.3','pet.1','pet.2','pet.4','pet.6','pet.5','pet.5','pet.8','pet.4','pet.7'];
const STAR_MILESTONE_ESSENCE_CYCLE_V147 = [1,1,2,3,5];

export const SPIRIT_BEAST_BOND_MAX_BUDGET_V147 = Object.freeze({
  'pet.1':{powerPct:5.6,bodyPct:2.6,defensePct:2.3},
  'pet.2':{powerPct:2.6,bodyPct:5.5,defensePct:5.2},
  'pet.3':{powerPct:3.8,bodyPct:3.0,defensePct:3.0},
  'pet.4':{powerPct:3.2,bodyPct:3.6,defensePct:3.4},
  'pet.5':{powerPct:5.1,bodyPct:3.0,defensePct:2.7},
  'pet.6':{powerPct:2.8,bodyPct:4.6,defensePct:4.2},
  'pet.7':{powerPct:5.3,bodyPct:3.1,defensePct:2.5},
  'pet.8':{powerPct:3.6,bodyPct:4.6,defensePct:4.5}
});

export function spiritBeastSpeciesV147(id){ return BY_ID.get(id); }
export function spiritBeastStarsV147(progress){ return Math.max(0, Math.floor(Number(progress?.stars)||0)); }
export function spiritBeastLevelCapV147(progressOrStars=0){
  const stars = typeof progressOrStars === 'number' ? Math.max(0,Math.floor(progressOrStars)) : spiritBeastStarsV147(progressOrStars);
  return SPIRIT_BEAST_BASE_LEVEL_CAP_V147 + stars * SPIRIT_BEAST_LEVELS_PER_STAR_V147;
}
export function spiritBeastEffectiveLevelV147(level){
  const lv=Math.max(1,Math.floor(Number(level)||1)),x=lv-1;
  const a=Math.min(x,99);
  const b=Math.min(Math.max(x-99,0),400)*.20;
  const c=Math.min(Math.max(x-499,0),500)*.08;
  const d=Math.max(x-999,0)*.02;
  return 1+a+b+c+d;
}
export function spiritBeastStarRawMultiplierV147(stars){
  const legacyEq=Math.min(5,Math.max(0,Number(stars)||0)/4);
  return 1+legacyEq*.12;
}
export function spiritBeastStarEssenceCostV147(currentStars){
  const target=spiritBeastStarsV147({stars:currentStars})+1;
  if(target%SPIRIT_BEAST_STAR_MILESTONE_STEP_V147!==0)return 0;
  const milestone=Math.max(1,Math.floor(target/SPIRIT_BEAST_STAR_MILESTONE_STEP_V147));
  return STAR_MILESTONE_ESSENCE_CYCLE_V147[(milestone-1)%STAR_MILESTONE_ESSENCE_CYCLE_V147.length];
}
export function spiritBeastStatsV147(species,progress){
  const stars=spiritBeastStarsV147(progress),level=Math.max(1,Math.min(spiritBeastLevelCapV147(stars),Math.floor(Number(progress?.level)||1)));
  const effective=spiritBeastEffectiveLevelV147(level),hm=spiritBeastStarRawMultiplierV147(stars);
  return {
    hp:Math.round(species.base.hp*(1+(effective-1)*species.growth.hp)*hm),
    attack:Math.round(species.base.attack*(1+(effective-1)*species.growth.attack)*hm),
    defense:Math.round(species.base.defense*(1+(effective-1)*species.growth.defense)*hm),
    effectiveLevel:Number(effective.toFixed(2))
  };
}
export function spiritBeastRawContributionV147(species,progress){
  if(!progress?.owned)return {attackFlat:0,hpFlat:0,defenseFlat:0};
  const stats=spiritBeastStatsV147(species,progress);
  return {
    attackFlat:Math.round(stats.attack*SPIRIT_BEAST_COLLECTION_RAW_SHARE_V147),
    hpFlat:Math.round(stats.hp*SPIRIT_BEAST_COLLECTION_RAW_SHARE_V147),
    defenseFlat:Math.round(stats.defense*SPIRIT_BEAST_COLLECTION_RAW_SHARE_V147)
  };
}
export function spiritBeastBondContributionV147(species,progress){
  const max=SPIRIT_BEAST_BOND_MAX_BUDGET_V147[species.id]??{powerPct:0,bodyPct:0,defensePct:0};
  const stars=spiritBeastStarsV147(progress);
  // Level never increases percentage. 0★ has no Linh Khế percent; 20★ reaches the authored cap.
  const factor=Math.min(stars/SPIRIT_BEAST_LEGACY_FULL_STAR_V147,1);
  return {powerPct:Number((max.powerPct*factor).toFixed(3)),bodyPct:Number((max.bodyPct*factor).toFixed(3)),defensePct:Number((max.defensePct*factor).toFixed(3))};
}
export function spiritBeastBondSummaryV147(state){
  let powerPct=0,bodyPct=0,defensePct=0,attackFlat=0,hpFlat=0,defenseFlat=0,owned=0; const rows=[];
  for(const species of SPIRIT_BEAST_SPECIES_V147){
    const p=state?.items?.[species.id]; if(!p?.owned)continue;
    owned++;
    const stats=spiritBeastStatsV147(species,p),raw=spiritBeastRawContributionV147(species,p),active=state?.activePetId===species.id;
    const potentialBond=spiritBeastBondContributionV147(species,p);
    const bond=active?potentialBond:{powerPct:0,bodyPct:0,defensePct:0};
    attackFlat+=raw.attackFlat;hpFlat+=raw.hpFlat;defenseFlat+=raw.defenseFlat;
    powerPct+=bond.powerPct;bodyPct+=bond.bodyPct;defensePct+=bond.defensePct;
    rows.push({id:species.id,name:species.name,stats,raw,bond,bondPotential:potentialBond,active,level:p.level,stars:spiritBeastStarsV147(p),levelCap:spiritBeastLevelCapV147(p)});
  }
  return {schema:SPIRIT_BEAST_SCHEMA_V147,owned,total:SPIRIT_BEAST_SPECIES_V147.length,attackFlat,hpFlat,defenseFlat,powerPct:Number(powerPct.toFixed(3)),bodyPct:Number(bodyPct.toFixed(3)),defensePct:Number(defensePct.toFixed(3)),rows};
}
function passiveStrengthV147(stars){ return stars>=20?1.5:stars>=12?1.25:1; }
function effectScale(e,scale,passive,passiveStrength,statusDurationScale=1){
  const pct=(v=0)=>1+v*passiveStrength/100;
  if(e.type==='damage')return {...e,coefficient:e.coefficient*scale*pct(passive.skillDamagePct),breakDamagePct:(e.breakDamagePct??0)*pct(passive.breakPct)};
  if(e.type==='damageOverTime')return {...e,coefficientPerTick:e.coefficientPerTick*scale*pct(passive.dotDamagePct)};
  if(e.type==='shield')return {...e,capacity:e.capacity*scale*pct(passive.shieldPct),attackCoefficient:(e.attackCoefficient??0)*scale*pct(passive.shieldPct),maxHpPct:(e.maxHpPct??0)*pct(passive.shieldPct)};
  if(e.type==='applyStatus')return {...e,duration:e.duration*(e.statusId==='status.stun'?pct(passive.controlDurationPct):1)*statusDurationScale};
  return {...e};
}
export function spiritBeastCombatTriggersV147(state){
  if(!state?.activePetId)return [];
  const species=spiritBeastSpeciesV147(state.activePetId),p=state.items?.[state.activePetId]; if(!species||!p?.owned)return [];
  const stats=spiritBeastStatsV147(species,p),tune=SPIRIT_BEAST_COMBAT_TUNING_V147[species.id]??{powerScale:1,statusDurationScale:1,cooldownScale:1};
  const stars=spiritBeastStarsV147(p),baseScale=Math.max(.75,Math.min(2.1,stats.attack/220))*tune.powerScale,passive=species.passive.modifiers??{},passiveStrength=passiveStrengthV147(stars),cooldownMul=Math.max(.6,1-(passive.cooldownPct??0)*passiveStrength/100);
  return species.actives.filter(skill=>stars>=(skill.unlockStars??0)).map((skill,index)=>({id:`spirit-beast.v147.${species.id}.${skill.id}`,event:skill.trigger||'OnHit',chancePct:100,sourceTags:skill.trigger==='OnHit'?['ActiveHit']:undefined,cooldown:Math.max(2,(skill.cooldown??6)*cooldownMul*(stars>=20?.9:1)*tune.cooldownScale),effects:(skill.effects||[]).map(e=>effectScale(e,baseScale*(1+index*.05),passive,passiveStrength,tune.statusDurationScale))}));
}
export function spiritBeastViewV147(state,speciesId){
  const species=spiritBeastSpeciesV147(speciesId),p=state?.items?.[speciesId]; if(!species)return undefined;
  const progress=p??{owned:false,level:1,stars:0,specificFragments:0},stars=spiritBeastStarsV147(progress),stats=spiritBeastStatsV147(species,progress),active=state?.activePetId===speciesId;
  const raw=progress.owned?spiritBeastRawContributionV147(species,progress):{attackFlat:0,hpFlat:0,defenseFlat:0};
  const bondPotential=progress.owned?spiritBeastBondContributionV147(species,progress):{powerPct:0,bodyPct:0,defensePct:0};
  const bond=active?bondPotential:{powerPct:0,bodyPct:0,defensePct:0};
  return {schema:SPIRIT_BEAST_SCHEMA_V147,speciesId:species.id,name:species.name,role:species.role,roleLabel:species.roleLabel,asset:species.asset,stats,raw,bond,bondPotential,levelCap:spiritBeastLevelCapV147(progress),stars,starUpCost:SPIRIT_BEAST_FRAGMENT_PER_STAR_V147,starEssenceCost:spiritBeastStarEssenceCostV147(stars),passive:{...species.passive,unlocked:true},actives:species.actives.map(x=>({...x,unlockBloodline:x.unlockStars,unlocked:stars>=(x.unlockStars??0)})),active};
}
export function spiritBeastStarUpV147(progress,count=1){
  if(!progress?.owned)throw new Error('Chưa sở hữu Linh Thú.');
  const wanted=Math.max(1,Math.floor(Number(count)||1)),possible=Math.floor(Math.max(0,progress.specificFragments||0)/SPIRIT_BEAST_FRAGMENT_PER_STAR_V147),done=Math.min(wanted,possible);
  if(done<=0)throw new Error(`Thiếu mảnh riêng Linh Thú: cần ${SPIRIT_BEAST_FRAGMENT_PER_STAR_V147}.`);
  progress.specificFragments-=done*SPIRIT_BEAST_FRAGMENT_PER_STAR_V147; progress.stars=spiritBeastStarsV147(progress)+done;
  return {stars:progress.stars,starsAdded:done,cost:done*SPIRIT_BEAST_FRAGMENT_PER_STAR_V147,levelCap:spiritBeastLevelCapV147(progress)};
}
function oldPetTargetId(id){ const m=/^pet\.(\d+)$/.exec(String(id)); if(!m)return undefined; const n=Math.max(1,Number(m[1])),idx=Math.floor((n-1)/6); return LEGACY_SPECIES_TO_V147[idx]??SPIRIT_BEAST_SPECIES_V147[idx%SPIRIT_BEAST_SPECIES_V147.length]?.id; }
export function migrateSpiritBeastsV147(state){
  state.items??={};state.genericFragments??={manual:0,artifact:0,pet:0,companion:0};
  let migrated=false,refund=0,starsGranted=0;
  if(!state.spiritBeastV86Migrated){
    const snapshot=Object.entries(state.items).filter(([id])=>/^pet\.\d+$/.test(id));
    if(snapshot.some(([id])=>Number(id.split('.')[1])>8)){
      const merged=new Map();
      for(const [id,p] of snapshot){const target=oldPetTargetId(id);if(!target)continue;const row=merged.get(target)??{owned:false,level:1,advance:0,specificFragments:0};row.owned=Boolean(row.owned||p.owned);row.level=Math.max(row.level,Math.max(1,Math.floor(p.level||1)));row.advance=Math.max(row.advance,Math.max(0,Math.min(5,Math.floor(p.advance||0))));row.specificFragments+=Math.max(0,Math.floor(p.specificFragments||0));merged.set(target,row);}
      for(const [id] of snapshot)delete state.items[id];for(const [id,p] of merged)state.items[id]=p;state.activePetId=oldPetTargetId(state.activePetId||'');migrated=true;
    }
    const gear=state.workshopV12328?.petGear||{};for(const g of Object.values(gear))for(const slot of ['claw','armor','charm']){const level=Math.max(0,Math.floor(Number(g?.[slot])||0));for(let i=0;i<level;i++)refund+=12+i*6;}
    if(refund>0)state.genericFragments.pet=(state.genericFragments.pet||0)+refund;if(state.workshopV12328)state.workshopV12328.petGear={};state.spiritBeastV86Migrated=true;state.spiritBeastV86GearRefund=Math.max(0,Math.floor(refund));
  }
  for(const species of SPIRIT_BEAST_SPECIES_V147){
    const p=state.items[species.id];if(!p)continue;
    if(!p.spiritBeastV147Migrated){const legacy=Math.max(0,Math.min(5,Math.floor(Number(p.advance)||0)));p.stars=Math.max(spiritBeastStarsV147(p),legacy*4);starsGranted+=legacy*4;p.advance=5;p.spiritBeastV147Migrated=true;migrated=true;}
    p.stars=spiritBeastStarsV147(p);p.level=Math.max(1,Math.floor(Number(p.level)||1));p.specificFragments=Math.max(0,Math.floor(Number(p.specificFragments)||0));
    const cap=spiritBeastLevelCapV147(p);if(p.level>cap){p.level=cap;migrated=true;}
    // Keep legacy advance hard-locked. Stars is the sole V147 progression authority.
    if(p.owned)p.advance=5;
  }
  state.spiritBeastV147Migrated=true;state.spiritBeastV147MigrationVersion=2;
  return {migrated,refund,starsGranted};
}
