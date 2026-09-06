export const DONGFU_SCHEMA_V99 = 'dongfu.v99';

const META = [
  ['scripture','Tàng Kinh Các','manual'],['artifact','Luyện Bảo Các','artifact'],['beast','Linh Thú Viên','pet'],['companion','Tri Kỷ Các','companion'],
  ['bloodline','Huyết Trì','bloodline'],['physique','Luyện Thể Thất','physique'],['alchemy','Đan Phòng','alchemy'],['forge','Luyện Khí','forging'],
];
const clampLevel = v => Math.max(1,Math.min(10,Math.floor(Number(v)||1)));
const discountPct = lv => Math.min(18,Math.max(0,clampLevel(lv)-1)*2);

export function buildDongfuV99({collection={},collectionEconomy={},alchemy={},forging={},originProgression={}}={}){
  const facilities=collection?.cave?.facilities||[];
  const byId=new Map(facilities.map(x=>[x.id,x]));
  const categoryById=new Map((collectionEconomy?.categories||[]).map(x=>[x.category,x]));
  const rows=META.map(([id,name,category])=>{
    const raw=byId.get(id)||{id,level:1},level=clampLevel(raw.level),cost=raw.cost?{...raw.cost}:undefined;
    let effect={},effectText='';
    if(id==='scripture'){effect={materialDiscountPct:discountPct(level)};effectText=`Công Pháp/Tâm Pháp: giảm ${effect.materialDiscountPct}% nguyên liệu cường hóa.`;}
    else if(id==='artifact'){effect={refinementDiscountPct:Math.min(18,Math.max(0,Number(collectionEconomy?.artifactV88?.refinementDiscountPct??discountPct(level))))};effectText=`Luyện Hóa Pháp Bảo: giảm ${effect.refinementDiscountPct}% nguyên liệu.`;}
    else if(id==='beast'){effect={levelCap:Math.min(50,10+level*5),petGearLimit:Math.min(20,4+level*2)};effectText=`Linh Thú: cấp tối đa ${effect.levelCap}; giới hạn Pet Gear ${effect.petGearLimit}.`;}
    else if(id==='companion'){effect={intimacyDiscountPct:discountPct(level)};effectText=`Tri Kỷ: giảm ${effect.intimacyDiscountPct}% Đồng Tâm Ngọc khi tăng Thân Mật.`;}
    else if(id==='bloodline'){effect={essenceDiscountPct:Number(originProgression?.bloodline?.facilityDiscountPct??discountPct(level))};effectText=`Huyết Mạch: giảm ${effect.essenceDiscountPct}% Huyết Tinh cho Độ Thuần/thăng phẩm.`;}
    else if(id==='physique'){effect={essenceDiscountPct:Number(originProgression?.physique?.facilityDiscountPct??discountPct(level))};effectText=`Thể Chất: giảm ${effect.essenceDiscountPct}% Thể Phách Tinh Hoa khi luyện thể.`;}
    else if(id==='alchemy'){const m=alchemy?.facility?.modifiers||{};effect={gardenSlots:Number(alchemy?.garden?.slots||3),timeReductionPct:Number(m.timeReductionPct||0),materialEfficiencyPct:Number(m.materialEfficiencyPct||0),qualityWeightBonus:Number(m.qualityWeightBonus||0)};effectText=`Đan Phòng: ${effect.gardenSlots} ô Dược Viên · -${effect.timeReductionPct}% thời gian · +${effect.materialEfficiencyPct}% hiệu suất vật liệu.`;}
    else if(id==='forge'){effect={timeReductionPct:Number(forging?.timeReductionPct||0),queueCapacity:Number(forging?.queueCapacity||1)};effectText=`Luyện Khí: -${effect.timeReductionPct}% thời gian · ${effect.queueCapacity} slot Hỏa Lò.`;}
    const cat=categoryById.get(category);
    const busy=id==='alchemy'?Number(alchemy?.furnaces?.busy??alchemy?.furnaces?.queues?.length??0):id==='forge'?Number(forging?.queues?.length||0):0;
    return {id,name,category,level,maxLevel:10,cost,effect,effectText,busy,owned:Number(cat?.owned||0),total:Number(cat?.total||0),upgradeable:Boolean(cost)};
  });
  return {
    schema:DONGFU_SCHEMA_V99,
    level:Math.max(1,...rows.map(x=>x.level)),
    facilities:rows,
    currencies:{boundImmortalJade:Number(collectionEconomy?.currencies?.boundImmortalJade??collection?.currencies?.boundImmortalJade??0)},
    rules:{hub:'Động Phủ là nơi phát triển/nâng hệ; Phó Bản là nơi farm nguyên liệu.',facilityCap:10,discountPerLevelPct:2,discountCapPct:18,autoSyncProduction:true},
  };
}
