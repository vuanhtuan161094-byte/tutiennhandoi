import { createCollectionProgressStateV12316, grantCollectionItemV12316 } from '../../dist/core/collection-progression-v12316.js';
import { collectionDefinitionV12325, advanceCollectionEconomyV12325, ensureCollectionEconomyV12325 } from '../../dist/core/gacha-collection-economy-v12325.js';
import { manualAdvanceCostV127, manualStrengthenCostV127 } from '../../dist/core/manual-progression-v127.js';

function assert(ok,msg){if(!ok)throw new Error(msg)}
function make(tree={}){
  const s=createCollectionProgressStateV12316();
  grantCollectionItemV12316(s,'manual.1');
  s.manualTreeV127={...tree};
  s.genericFragments.manual=1_000_000;
  const e=ensureCollectionEconomyV12325(s); e.ascensionEssence.manual=1_000_000;
  const p=s.items['manual.1']; p.level=600;p.advance=5;p.specificFragments=1_000_000;
  return s;
}
const d=collectionDefinitionV12325('manual.1');
const fragmentBase=manualAdvanceCostV127(d,{level:600,advance:5});
const strengthenBase=manualStrengthenCostV127(d,{level:550,advance:5},{});
const strengthenOld=manualStrengthenCostV127(d,{level:550,advance:5},{historicalRealmOrder:22,retrainSpeedPct:200});
assert(strengthenOld<strengthenBase,`Trọng Tu Cựu Kinh không giảm normal-material cost: ${strengthenOld} vs ${strengthenBase}`);
const normal=make(); const boosted=make({historicalRealmOrder:22,retrainSpeedPct:200,materialCostReductionPct:50,currencyCostReductionPct:50});
const r0=advanceCollectionEconomyV12325(normal,'manual.1');
const r1=advanceCollectionEconomyV12325(boosted,'manual.1');
assert(r0.cost===fragmentBase&&r1.cost===fragmentBase,'Mảnh Riêng bị giảm bởi tree, vi phạm canonical');
assert(r1.ordinaryCost<r0.ordinaryCost,`Tàn Ý không được giảm: ${r1.ordinaryCost} vs ${r0.ordinaryCost}`);
assert(r1.essenceCost<r0.essenceCost,`Chi phí phụ không được Kinh Tàng Tiết Dụng giảm: ${r1.essenceCost} vs ${r0.essenceCost}`);
console.log('V127 MANUAL TREE ECONOMY — PASS');
console.log(JSON.stringify({fragmentInvariant:r1.cost,ordinary:[r0.ordinaryCost,r1.ordinaryCost],secondary:[r0.essenceCost,r1.essenceCost],retrainStrengthen:[strengthenBase,strengthenOld]},null,2));
