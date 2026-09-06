import { createCollectionProgressStateV12316 } from '../../dist/core/collection-progression-v12316.js';
import { ensureCollectionWorkshopV12326, setManualGachaRealmV127, setManualGachaOrientationV127, gachaCollectionV12326, collectionWorkshopSummaryV12326, featuredRateUpRuleV100 } from '../../dist/core/collection-workshop-gacha-v12326.js';

function assert(ok,msg){if(!ok)throw new Error(msg)}
function expectThrow(fn,msg){let hit=false;try{fn()}catch{hit=true}assert(hit,msg)}
const s=createCollectionProgressStateV12316(); s.currencies.boundImmortalJade=99_999_999; const inv={}; ensureCollectionWorkshopV12326(s);
const realmOrder=22; // Nguyên Anh: stages 0..5 unlocked
const b=setManualGachaRealmV127(s,5,realmOrder);
assert(b.pool.length===9,'Banner Nguyên Anh không đúng 9 Công Pháp');
assert(b.pool.every(x=>x.realmStageIndex===5),'Pool lẫn Công Pháp cảnh khác');
const orientation=b.pool.find(x=>x.grade==='extreme')?.id||b.pool[0].id;
setManualGachaOrientationV127(s,orientation,realmOrder);
const rule=featuredRateUpRuleV100('manual',realmOrder,s);
assert(rule.featuredId===orientation,'Định Hướng không trở thành canonical featured id');
const allowed=new Set(b.pool.map(x=>x.id));
let specific=0, fragmentRows=0, orientationHits=0, consecutiveOrientationMisses=0, maxConsecutiveOrientationMisses=0;
for(let i=0;i<80;i++){
  const r=gachaCollectionV12326(s,inv,'banner.manual',10,127000+i,false,[],realmOrder);
  for(const row of r.results){if(row.id){specific++;assert(allowed.has(row.id),`Gacha rơi ngoài pool 9: ${row.id}`)} if(row.kind==='fragment'){fragmentRows++; if(row.orientationHit){orientationHits++; consecutiveOrientationMisses=0;}else{consecutiveOrientationMisses++; maxConsecutiveOrientationMisses=Math.max(maxConsecutiveOrientationMisses,consecutiveOrientationMisses);}}}
}
assert(specific>0,'Không có kết quả Công Pháp để kiểm pool');
assert(fragmentRows>0&&orientationHits>0,'Định Hướng Mảnh Riêng không tạo hit thật');
assert(maxConsecutiveOrientationMisses<=1,'50/50 guarantee bị vi phạm: có hai lượt Mảnh Riêng trượt liên tiếp');
expectThrow(()=>setManualGachaRealmV127(s,6,realmOrder),'Cho chọn Hóa Thần khi mới Nguyên Anh');
expectThrow(()=>setManualGachaOrientationV127(s,'manual.1',realmOrder),'Cho Định Hướng ngoài pool hiện tại');
const summary=collectionWorkshopSummaryV12326(s,inv,{progressionV125:{passiveLevels:{}},learnedDaoPassiveIdsV118:[]},undefined,Date.now(),realmOrder);
assert(summary.manualBanner.pool.length===9&&summary.manualBanner.selectedRealmStageIndex===5,'Summary/transport banner lệch backend');
assert(summary.manualBanner.orientationId===orientation,'Summary mất Định Hướng');
assert(summary.manualBanner.orientationRule?.scope==='specific-fragment'&&summary.manualBanner.orientationRule?.guaranteeAfterLoss===true,'Transport thiếu luật Định Hướng Mảnh Riêng V127');
console.log('V127 MANUAL GACHA BANNER — PASS');
console.log(JSON.stringify({realmStage:5,pool:summary.manualBanner.pool.length,orientation,specificResults:specific,fragmentRows,orientationHits,maxConsecutiveOrientationMisses,orientationGuaranteed:summary.manualBanner.orientationGuaranteed,rateUp:rule},null,2));
