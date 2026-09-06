import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createCollectionProgressStateV12316, collectionDefinitionV12316 } from '../../dist/core/collection-progression-v12316.js';
import { setManualGachaRealmV127, setManualGachaOrientationV127, gachaCollectionV12326 } from '../../dist/core/collection-workshop-gacha-v12326.js';
import { MANUAL_REALM_STAGES_V127, manualAdvanceCostV127 } from '../../dist/core/manual-progression-v127.js';

function affordableMilestones(def, fragments){let used=0,count=0;for(let adv=0;adv<10;adv++){const c=manualAdvanceCostV127(def,{advance:adv,level:(adv+1)*100});if(used+c>fragments)break;used+=c;count++;}return{count,used,next:count<10?manualAdvanceCostV127(def,{advance:count,level:(count+1)*100}):0};}
function run(stageIndex,pulls,seed){
 const realm=MANUAL_REALM_STAGES_V127[stageIndex], state=createCollectionProgressStateV12316(),inv={};
 state.currencies.boundImmortalJade=999_999_999;
 setManualGachaRealmV127(state,stageIndex,realm.requiredRealmOrder);
 // Orient to the strongest slot in the realm (slot 8 / breaker grade), a conservative fragment-cost stress.
 const targetId=`manual.${stageIndex*9+8}`;
 setManualGachaOrientationV127(state,targetId,realm.requiredRealmOrder);
 const seen=new Set();let featured=0,fragmentDrops=0,itemDrops=0;
 for(let done=0;done<pulls;){const count=Math.min(10,pulls-done);const r=gachaCollectionV12326(state,inv,'banner.manual',count,seed+done*17,false,[],realm.requiredRealmOrder);for(const row of r.results){if(row.id){const d=collectionDefinitionV12316(row.id);assert.equal(d.realmStageIndex,stageIndex,`banner leaked ${row.id}`);seen.add(row.id);}if(row.featured)featured++;if(row.kind==='fragment')fragmentDrops++;if(row.kind==='item')itemDrops++;}done+=count;}
 const p=state.items[targetId]??{owned:false,specificFragments:0},def=collectionDefinitionV12316(targetId),aff=affordableMilestones(def,p.specificFragments??0);
 return{stageIndex,realm:realm.name,pulls,targetId,owned:p.owned===true,targetFragments:p.specificFragments??0,uniqueManuals:seen.size,featuredResults:featured,fragmentDrops,itemDrops,affordableMilestones:aff.count,fragmentsSpentIfAdvanced:aff.used,nextMilestoneFragments:aff.next,totalFragmentsForLv1000:Array.from({length:10},(_,adv)=>manualAdvanceCostV127(def,{advance:adv,level:(adv+1)*100})).reduce((a,b)=>a+b,0)};
}
const rows=[];for(const stage of [0,14,28])for(const pulls of [100,1000])rows.push(run(stage,pulls,127900+stage*10000+pulls));
for(const row of rows){assert(row.uniqueManuals<=9);assert(row.affordableMilestones<10,`${row.realm} ${row.pulls} pulls unexpectedly funds full Lv1000 milestone chain from Gacha fragments alone`);}
const report={schema:'v127-manual-gacha-economy-stress.v1',reference:'10 pulls = current small-banner unit; x10=100 pulls, x100=1000 pulls',rows};
fs.mkdirSync('docs/simulations',{recursive:true});
fs.writeFileSync('docs/simulations/V127_GACHA_ECONOMY_STRESS.json',JSON.stringify(report,null,2));
const lines=['V127 MANUAL GACHA ECONOMY STRESS','Reference: x10=100 pulls · x100=1000 pulls · canonical 9-manual realm pool + orientation','',...rows.map(x=>`${x.realm.padEnd(18)} ${String(x.pulls).padStart(4)} pulls · unique ${x.uniqueManuals}/9 · target fragments ${x.targetFragments}/${x.totalFragmentsForLv1000} · affordable milestones ${x.affordableMilestones}/10 · featured ${x.featuredResults}`),'','PASS: no cross-realm leak; even x100 economy does not instantly fund all 10 specific-fragment milestones.'];
fs.writeFileSync('docs/simulations/V127_GACHA_ECONOMY_STRESS.txt',lines.join('\n'));console.log(lines.join('\n'));
