export * from './gacha-collection-economy-v12325-legacy.js';
import * as legacy from './gacha-collection-economy-v12325-legacy.js';
import { advanceCollectionItemV12316, spiritBeastStrengthenCostV147, strengthenCollectionItemV12316 } from './collection-progression-v12316.js';
import { SPIRIT_BEAST_FRAGMENT_PER_STAR_V147, spiritBeastLevelCapV147, spiritBeastStarEssenceCostV147, spiritBeastViewV147 } from './spirit-beast-v147.js';

function petDefinition(id){const d=legacy.collectionDefinitionV12325(id);return d?.category==='pet'?d:undefined;}
function summaryStars(progress){
  if(Number.isFinite(Number(progress?.stars)))return Math.max(0,Math.floor(Number(progress.stars)));
  return Math.max(0,Math.min(5,Math.floor(Number(progress?.advance)||0)))*4;
}

export function strengthenCollectionEconomyV12325(state,itemId,levels=1){
  if(!petDefinition(itemId))return legacy.strengthenCollectionEconomyV12325(state,itemId,levels);
  legacy.ensureCollectionEconomyV12325(state);
  return strengthenCollectionItemV12316(state,itemId,levels);
}

export function advanceCollectionEconomyV12325(state,itemId){
  if(!petDefinition(itemId))return legacy.advanceCollectionEconomyV12325(state,itemId);
  legacy.ensureCollectionEconomyV12325(state);
  const result=advanceCollectionItemV12316(state,itemId);
  return {...result,bloodline:result.stars};
}

export function collectionEconomySummaryV12325(state,foundation,now=Date.now(),realmOrder=10){
  const out=legacy.collectionEconomySummaryV12325(state,foundation,now,realmOrder);
  const cat=out.categories?.find(x=>x.category==='pet');
  if(!cat)return out;
  cat.items=cat.items.map(item=>{
    const progress={...(item.progress??{})};
    const stars=summaryStars(progress);
    progress.stars=stars;
    progress.advance=stars;
    const liveProgress={...progress,advance:5};
    const viewState={items:{[item.id]:liveProgress},activePetId:state?.activePetId};
    const view=spiritBeastViewV147(viewState,item.id);
    const owned=Boolean(progress.owned);
    const levelCap=spiritBeastLevelCapV147(liveProgress);
    return {
      ...item,
      progress,
      spiritBeast:view?{...view,bloodline:stars,maxBloodline:stars+1}:item.spiritBeast,
      strengthenCost:owned&&Number(progress.level??1)<levelCap?spiritBeastStrengthenCostV147(state,liveProgress):undefined,
      advanceCost:owned?SPIRIT_BEAST_FRAGMENT_PER_STAR_V147:undefined,
      ascensionCost:owned?spiritBeastStarEssenceCostV147(stars):undefined,
    };
  });
  return out;
}
