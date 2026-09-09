export * from './collection-progression-v12316-legacy.js';
import * as legacy from './collection-progression-v12316-legacy.js';
import { activeConfidantSpecialtyV87 } from './confidant-v87.js';
import { SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147, SPIRIT_BEAST_FRAGMENT_PER_STAR_V147, migrateSpiritBeastsV147, spiritBeastEffectiveLevelV147, spiritBeastLevelCapV147, spiritBeastStarEssenceCostV147, spiritBeastStarUpV147 } from './spirit-beast-v147.js';

export function spiritBeastStrengthenCostV147(state,progress){
  const effective=spiritBeastEffectiveLevelV147(progress?.level??1);
  let cost=Math.max(5,Math.floor(8+effective*2.4));
  cost=legacy.facilityDiscountedCostV99(state,'beast',cost);
  const specialty=activeConfidantSpecialtyV87(state);
  if(specialty?.unlocked&&specialty.id==='spiritBeast')cost=Math.max(1,Math.ceil(cost*(1-specialty.strengthPct/100)));
  if(specialty?.unlocked&&specialty.id==='resource')cost=Math.max(1,Math.ceil(cost*(1-specialty.strengthPct/100)));
  return cost;
}

export function grantCollectionItemV12316(state,id,fragmentAmount){
  const def=legacy.collectionDefinitionV12316(id);
  if(def.category!=='pet')return legacy.grantCollectionItemV12316(state,id,fragmentAmount);
  migrateSpiritBeastsV147(state);
  const p=state.items[id]??(state.items[id]={owned:false,level:1,advance:5,stars:0,specificFragments:0,spiritBeastV147Migrated:true});
  const first=!p.owned;
  p.owned=true;
  p.advance=5;
  p.spiritBeastV147Migrated=true;
  if(!first)p.specificFragments=Math.max(0,Math.floor(Number(p.specificFragments)||0))+SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147;
  return {first,progress:{...p},definition:def};
}

export function strengthenCollectionItemV12316(state,id,levels=1){
  const def=legacy.collectionDefinitionV12316(id);
  if(def.category!=='pet')return legacy.strengthenCollectionItemV12316(state,id,levels);
  migrateSpiritBeastsV147(state);
  const p=state.items[id];
  if(!p?.owned)throw new Error(`Chưa sở hữu ${def.name}.`);
  const levelCap=spiritBeastLevelCapV147(p);
  let done=0,cost=0;
  for(let i=0;i<Math.max(1,Math.floor(Number(levels)||1));i++){
    if(p.level>=levelCap)break;
    const c=spiritBeastStrengthenCostV147(state,p);
    if((state.genericFragments?.pet??0)<c)break;
    state.genericFragments.pet-=c;
    p.level+=1;cost+=c;done+=1;
  }
  if(done<=0)throw new Error(`Không đủ Linh Thú Tinh Phách hoặc đã đạt Lv${levelCap}.`);
  return {definition:def,levels:done,cost,levelCap,progress:{...p}};
}

export function advanceCollectionItemV12316(state,id){
  const def=legacy.collectionDefinitionV12316(id),p=state.items?.[id];
  if(def.category!=='pet')return legacy.advanceCollectionItemV12316(state,id);
  migrateSpiritBeastsV147(state);
  if(!p?.owned)throw new Error(`Chưa sở hữu ${def.name}.`);
  const fragmentCost=SPIRIT_BEAST_FRAGMENT_PER_STAR_V147;
  const essenceCost=spiritBeastStarEssenceCostV147(p.stars);
  const fragments=Math.max(0,Math.floor(Number(p.specificFragments)||0));
  const essence=Math.max(0,Math.floor(Number(state.economyV12325?.ascensionEssence?.pet)||0));
  if(fragments<fragmentCost)throw new Error(`Thiếu mảnh riêng ${def.name}: cần ${fragmentCost}, có ${fragments}.`);
  if(essence<essenceCost)throw new Error(`Thiếu Linh Thú Đột Phá Đan: cần ${essenceCost}, có ${essence}.`);
  const result=spiritBeastStarUpV147(p,1);
  if(essenceCost>0)state.economyV12325.ascensionEssence.pet-=essenceCost;
  p.advance=5;
  return {definition:def,cost:fragmentCost,fragmentCost,essenceCost,stars:result.stars,levelCap:result.levelCap,progress:{...p}};
}
