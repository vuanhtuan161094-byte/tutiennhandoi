import { baseTuViPer15sV140 } from './cultivation-v140.js';

export const MANUAL_PROGRESSION_SCHEMA_V127 = 'manual-progression.v127.production';
export const MANUAL_LEVEL_MAX_V127 = 1000;
export const MANUAL_ADVANCE_MAX_V127 = 10;
export const MANUAL_MILESTONES_V127 = [100,200,300,400,500,600,700,800,900,1000];
export const MANUAL_MILESTONE_HIT_MULTIPLIERS_V127 = [2,3,5,8,12,18,26,38,55,80];
export const MANUAL_MILESTONE_BONUS_PCTS_V127 = [3,4,5,6,7,8,9,12,16]; // 100..900 => +70% total
export const MANUAL_FRAGMENT_YIELD_V127 = { mundane:4, spirit:5, mystic:6, earth:8, heaven:10, immortal:14, extreme:20, breaker:28 };

export const MANUAL_REALM_STAGES_V127 = [
  [0,'Phàm Nhân',0],[1,'Luyện Khí',1],[2,'Trúc Cơ',10],[3,'Tử Phủ',14],[4,'Kim Đan',18],[5,'Nguyên Anh',22],[6,'Hóa Thần',26],[7,'Luyện Hư',30],[8,'Hợp Thể',34],[9,'Đại Thừa',38],[10,'Độ Kiếp',42],[11,'Nhân Tiên',46],[12,'Địa Tiên',50],[13,'Thiên Tiên',54],[14,'Chân Tiên',58],[15,'Huyền Tiên',62],[16,'Kim Tiên',66],[17,'Thái Ất Tiên',70],[18,'Đại La Kim Tiên',74],[19,'Tiên Vương',78],[20,'Tiên Đế',82],[21,'Cực Hạn',86],[22,'Cực Đạo Chân Cảnh',90],[23,'Hỗn Độn Cảnh',94],[24,'Hồng Mông Cảnh',98],[25,'Khai Thiên Cảnh',102],[26,'Thế Giới Chủ',106],[27,'Vĩnh Sinh Cảnh',110],[28,'Sáng Thế Chủ',114],
].map(([index,name,requiredRealmOrder])=>({index,name,requiredRealmOrder}));

const ARCHETYPES = [
  {key:'attack',title:'Thiên Công Chân Kinh',role:'Công + % Công',grade:'mundane',power:1.00,stats:[['attackFlat',18],['powerPct',3.2]]},
  {key:'body_hp',title:'Bất Diệt Kim Thân',role:'Thể Phách + HP + %HP',grade:'spirit',power:1.02,stats:[['physiqueFlat',7],['hpFlat',140],['hpPct',2.8]]},
  {key:'defense',title:'Huyền Thiên Hộ Thể',role:'Phòng Ngự + %Phòng + Giảm Sát Thương',grade:'mystic',power:1.05,stats:[['defenseFlat',11],['defensePct',2.8],['damageReductionPct',0.035]]},
  {key:'crit',title:'Bạo Linh Sát Quyết',role:'Bạo Kích + Bạo Thương',grade:'earth',power:1.08,stats:[['critPct',0.42],['critDamagePct',0.20]]},
  {key:'heart',title:'Hội Tâm Thiên Thư',role:'Hội Tâm + Hội Tâm Damage',grade:'heaven',power:1.10,stats:[['heartPct',0.04],['heartDamagePct',0.20]]},
  {key:'pierce',title:'Phá Hư Chân Giải',role:'Xuyên Giáp + Phá Thế',grade:'immortal',power:1.12,stats:[['armorPenPct',0.05],['breakEffectPct',0.06]]},
  {key:'precision',title:'Thiên Cơ Bộ Pháp',role:'Né + Tốc Độ Hành Động',grade:'extreme',power:1.08,stats:[['dodgePct',0.035],['actionSpeedPct',0.02]]},
  {key:'control',title:'Vạn Pháp Trấn Linh',role:'Phá Thế + Kháng Khống',grade:'breaker',power:1.14,stats:[['breakEffectPct',0.04],['controlResistPct',0.035]]},
  {key:'sustain',title:'Sinh Sinh Tạo Hóa Kinh',role:'Hồi Phục + Khiên',grade:'extreme',power:1.12,stats:[['healingPct',0.10],['shieldPct',0.10]]},
];
export const MANUAL_ARCHETYPES_V127 = ARCHETYPES.map(x=>({...x,baseStats:x.stats.map(y=>[...y])}));
const round3=v=>Number(Number(v).toFixed(3));
const realmStatScale=i=>1+Math.max(0,Math.min(28,i))*0.075;
const realmFragmentScale=i=>1+2*Math.pow(Math.max(0,Math.min(28,i))/28,1.18);
const combatWeight={attackFlat:.055,powerPct:1,physiqueFlat:.12,hpFlat:.006,hpPct:1,defenseFlat:.09,defensePct:1,damageReductionPct:5,critPct:3,critDamagePct:1.2,heartPct:3,heartDamagePct:1.2,armorPenPct:3,breakEffectPct:2,accuracyPct:1.5,dodgePct:3,controlPct:2,controlResistPct:2.2,healingPct:1.5,shieldPct:1.5,actionSpeedPct:2};
function strengthScore(stats){return stats.reduce((s,x)=>s+Math.max(0,x.value)*(combatWeight[x.id]??1),0);}

export function buildManualCatalogV127(){
  const out=[];
  for(const realm of MANUAL_REALM_STAGES_V127){
    const scale=realmStatScale(realm.index), realmBase=Math.max(1,baseTuViPer15sV140(realm.requiredRealmOrder));
    for(let slot=0;slot<ARCHETYPES.length;slot++){
      const a=ARCHETYPES[slot],stats=a.stats.map(([id,value])=>({id,value:round3(value*scale)}));
      // Every manual contributes a flat authored Tu Vi source. Full linear Lv1000 ~= 10% of that realm's base self-cultivation.
      stats.push({id:'cultivationFlatPer15s',value:round3(realmBase*.10*a.power)});
      const score=round3(strengthScore(stats.filter(x=>x.id!=='cultivationFlatPer15s')));
      const idNumber=realm.index*9+slot+1;
      out.push({id:`manual.${idNumber}`,category:'manual',name:`${realm.name} · ${a.title}`,grade:a.grade,description:`${a.role}. Mỗi tầng tăng Tu Vi và chỉ số của bộ; mọi Công Pháp đã học ở mọi cảnh đều hoạt động đồng thời.`,stats,realmStageIndex:realm.index,realmName:realm.name,requiredRealmOrder:realm.requiredRealmOrder,manualRole:a.role,manualArchetype:a.key,maxLevel:1000,maxAdvance:10,strengthScoreV127:score,strengthCostWeightV127:a.power,levelMilestones:[...MANUAL_MILESTONES_V127],noSpirit:true,noActionSpeed:true});
    }
  }
  return out;
}
export function manualUnlockedV127(def,realmOrder=117){return def?.category!=='manual'||Math.max(0,Math.floor(realmOrder))>=Math.max(0,Math.floor(def.requiredRealmOrder??0));}
export function manualRealmStageForOrderV127(realmOrder=0){let found=MANUAL_REALM_STAGES_V127[0];for(const r of MANUAL_REALM_STAGES_V127){if(r.requiredRealmOrder<=realmOrder)found=r;else break;}return found;}

export function manualMilestoneBonusPctV127(progress,tree={}){
  const advance=Math.max(0,Math.min(9,Math.floor(progress?.advance??0))),base=MANUAL_MILESTONE_BONUS_PCTS_V127.slice(0,advance).reduce((a,b)=>a+b,0),boost=Math.max(0,Math.min(100,Number(tree.milestoneBonusEffectPct??0)));
  return base*(1+boost/100);
}
export function manualGrandCompletionMultiplierV127(progress,tree={}){ if((progress?.level??1)<1000||(progress?.advance??0)<10)return 1; return 2+Math.max(0,Math.min(1,Number(tree.grandCompletionMultiplierBonus??0))); }
export function manualEffectMultiplierV127(progress,tree={}){ const level=Math.max(1,Math.min(1000,Math.floor(progress?.level??1))),linear=level/1000,milestone=1+manualMilestoneBonusPctV127(progress,tree)/100,grand=manualGrandCompletionMultiplierV127(progress,tree);return linear*milestone*grand; }
export function manualNextMilestoneV127(progress){ const level=Math.max(1,Math.min(1000,Math.floor(progress?.level??1))),advance=Math.max(0,Math.min(10,Math.floor(progress?.advance??0))); if(advance>=10)return undefined; return MANUAL_MILESTONES_V127[advance]; }
export function manualCanStrengthenV127(progress){ const level=Math.max(1,Math.min(1000,Math.floor(progress?.level??1))),advance=Math.max(0,Math.min(10,Math.floor(progress?.advance??0))); if(level>=1000)return false; const gate=MANUAL_MILESTONES_V127[advance]; return gate===undefined||level<gate; }
export function manualCanAdvanceV127(progress){ const advance=Math.max(0,Math.min(10,Math.floor(progress?.advance??0))); if(advance>=10)return false; const need=MANUAL_MILESTONES_V127[advance]; return Math.max(1,Math.floor(progress?.level??1))>=need; }

export function manualStrengthenCostV127(def,progress,tree={}){
  const level=Math.max(1,Math.min(1000,Math.floor(progress?.level??1))),realm=Math.max(0,Math.min(28,Math.floor(def?.realmStageIndex??0))),weight=Math.max(.85,Math.min(1.3,Number(def?.strengthCostWeightV127??1)));
  const raw=(3.5+Math.pow(level/100,1.32)*2.2)*(1+realm*.065)*weight;
  const reduction=Math.max(0,Math.min(50,Number(tree.materialCostReductionPct??0)));
  const historical=Math.max(0,Math.floor(Number(tree.historicalRealmOrder??0))),isOld=historical>Math.max(0,Math.floor(Number(def?.requiredRealmOrder??0))),speed=isOld?Math.max(0,Math.min(200,Number(tree.retrainSpeedPct??0))):0;
  const retrain=1/(1+speed/100);
  return Math.max(1,Math.ceil(raw*(1-reduction/100)*retrain));
}
export function manualAdvanceCostV127(def,progress){
  const advance=Math.max(0,Math.min(10,Math.floor(progress?.advance??0))); if(advance>=10)return Infinity;
  const yieldPerHit=MANUAL_FRAGMENT_YIELD_V127[def?.grade]??6,hit=MANUAL_MILESTONE_HIT_MULTIPLIERS_V127[advance],realm=Math.max(0,Math.min(28,Math.floor(def?.realmStageIndex??0))),realmScale=realmFragmentScale(realm),weight=Math.max(.9,Math.min(1.2,Number(def?.strengthCostWeightV127??1)));
  return Math.max(1,Math.ceil(yieldPerHit*hit*realmScale*weight));
}
export function manualComposeCostV127(def){ const y=MANUAL_FRAGMENT_YIELD_V127[def?.grade]??6,realm=Math.max(0,Math.min(28,Math.floor(def?.realmStageIndex??0))),weight=Math.max(.9,Math.min(1.2,Number(def?.strengthCostWeightV127??1)));return Math.max(1,Math.ceil(y*5*realmFragmentScale(realm)*weight)); }

export function migrateManualProgressV127(state){
  if(!state)return state;
  const version=Number(state.manualV127MigrationVersion??(state.manualV127Migrated?2:0));
  for(const [id,p] of Object.entries(state.items??{})){
    if(!/^manual\.\d+$/.test(id)||!p)continue;
    let level=Math.max(1,Math.floor(p.level??1));
    if(version<2&&level<=50) level=Math.min(1000,1+Math.round((level-1)*999/49));
    level=Math.min(1000,level);
    let advance=Math.max(0,Math.min(10,Math.floor(p.advance??0)));
    // Any old save that already passed a hundred-level boundary keeps that boundary as completed; Lv1000 still requires the final Grand Completion gate.
    const implied=Math.min(9,Math.floor(Math.max(0,level-1)/100));
    advance=Math.max(advance,implied);
    p.level=level;p.advance=advance;
  }
  state.manualV127Migrated=true; state.manualV127MigrationVersion=2; return state;
}
