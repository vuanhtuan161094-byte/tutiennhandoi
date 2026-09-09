export * from './collection-workshop-gacha-v12326-legacy.js';
import * as legacy from './collection-workshop-gacha-v12326-legacy.js';
import { SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147, SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147 } from './spirit-beast-v147.js';

function normalizePetPullsV147(state,result){
  const rows=result?.results??[];
  for(const row of rows){
    if(row?.category!=='pet'||!row.id)continue;
    const p=state.items?.[row.id];
    if(row.kind==='fragment'&&p){
      const old=Math.max(0,Number(row.fragments??row.amount)||0);
      const delta=SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147-old;
      p.specificFragments=Math.max(0,Math.floor(Number(p.specificFragments)||0)+delta);
      row.amount=SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147;
      row.fragments=SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147;
    }else if(row.kind==='item'&&!row.first){
      row.fragments=SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147;
    }
  }
  const history=state.economyV12326?.history??[];
  for(let i=0;i<Math.min(rows.length,history.length);i++){
    const row=rows[rows.length-1-i],h=history[i];
    if(row?.category==='pet'&&row.kind==='fragment'&&h?.category==='pet'&&h.kind==='fragment')h.amount=SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147;
  }
  return result;
}

export function gachaCollectionV12326(state,inventory,banner,count,seed,usePremium=false,knownHeartPassiveIds=[],realmOrder=117){
  return normalizePetPullsV147(state,legacy.gachaCollectionV12326(state,inventory,banner,count,seed,usePremium,knownHeartPassiveIds,realmOrder));
}
