import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { ensureCollectionProgressStateV12316 } from '../../dist/core/collection-progression-v12316.js';
import { ensureCollectionEconomyV12325 } from '../../dist/core/gacha-collection-economy-v12325.js';
import { collectionWorkshopSummaryV12326, ensureCollectionWorkshopV12326, featuredRateUpRuleV100, gachaCollectionV12326, GACHA_BANNERS_V12326 } from '../../dist/core/collection-workshop-gacha-v12326.js';
let pass=0;const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
const r=buildRegistry();
function state(){const st=createPlayableAdventureState();const c=ensureCollectionProgressStateV12316(st);c.currencies.boundImmortalJade=1_000_000;c.currencies.immortalJade=1_000_000;return st;}
const st=state(), c=st.collectionV12316, e=ensureCollectionWorkshopV12326(c);
const summary=collectionWorkshopSummaryV12326(c,st.inventory,st.character.buildFoundation,undefined,Date.now(),18);
check(summary.v100?.schema==='van-tuong.v100'&&summary.v100.canonicalGachaAction==='collectionGachaV12326','V100 exposes one canonical Vạn Tượng gacha write action');
check(summary.v100.legacyGachaWritesRetired.length===2&&summary.v100.oneTrackPerCategory,'V100 explicitly retires both legacy gacha write paths');
check(summary.banners.length===8&&new Set(summary.banners.map(x=>x.category)).size===8,'V100 has exactly one category banner for each of 8 systems');
check(summary.banners.every(x=>x.id===`banner.${x.category}`),'V100 category banner ids are canonical and predictable');
check(Object.values(summary.rates).reduce((a,b)=>a+b,0)===100&&summary.rates.material===74&&summary.rates.item===2,'V100 outcome bucket rates are explicit and sum to 100%');
check(summary.v100.singlePullCost===160&&summary.v100.tenPullCost===1440,'V100 locks single/ten-pull prices at 160/1440');
check(summary.banners.every(x=>x.pity.mystic.endsWith('/10')&&x.pity.heaven.endsWith('/60')&&x.pity.immortal.endsWith('/120')),'V100 every category owns its own 10/60/120 pity track');
const strict=summary.banners.filter(x=>x.rateUp.strictFiftyFifty),solo=summary.banners.filter(x=>!x.rateUp.strictFiftyFifty);
check(strict.length>=4&&strict.every(x=>x.rateUp.alternativeCount>0),'V100 enables strict 50/50 only when same-grade off-banner alternatives exist');
check(solo.some(x=>x.category==='pet')&&solo.some(x=>x.category==='companion'),'V100 does not advertise fake 50/50 for sole Immortal pet/companion outcomes');

// Strict 50/50: a miss must exclude featured; higher-grade result must never be downgraded into lower featured grade.
for(const b of strict){
  const rule=featuredRateUpRuleV100(b.category); let sawMiss=false,sawHit=false,sawHigher=false;
  for(let seed=1;seed<=4000 && !(sawMiss&&sawHit&&sawHigher);seed++){
    const cs=ensureCollectionProgressStateV12316({});cs.currencies.boundImmortalJade=999999;const tr=ensureCollectionWorkshopV12326(cs).tracks[b.id];tr.sinceImmortal=119;
    const row=gachaCollectionV12326(cs,{},b.id,1,seed,false,[]).results[0];
    if(row.rateUpEligible&&row.featured){if(row.id!==rule.featuredId||row.grade!==rule.featuredGrade)throw new Error(`V100 ${b.category}: rate-up hit changed grade`);sawHit=true;}
    if(row.rateUpEligible&&!row.featured){if(row.id===rule.featuredId)throw new Error(`V100 ${b.category}: failed 50/50 still returned featured`);sawMiss=true;}
    const order=['mundane','spirit','mystic','earth','heaven','immortal','extreme','breaker'];
    if(row.grade&&order.indexOf(row.grade)>order.indexOf(rule.featuredGrade)){if(row.id===rule.featuredId)throw new Error(`V100 ${b.category}: higher grade downgraded to featured`);sawHigher=true;}
  }
  check(sawMiss&&sawHit,`V100 ${b.category}: strict 50/50 hit/miss both preserve canonical pool`);
}

// Canonical session write: only V12326 track advances, V89 ledger records exact spend, no daily roll cap.
{
 const a=state(),s=new SimulationSession(r,thanhHaWorld,adventureEnemies,playablePlayerProfile,10001,a),g=new GameplayFacade(s,r,thanhHaWorld);s.collectionEconomyV12326();
 const cs=s.stateValue.collectionV12316,legacy16=cs.gacha.manual.pulls,legacy25=ensureCollectionEconomyV12325(cs).tracks['banner.myriad'].pulls,before=cs.currencies.boundImmortalJade;
 const out=g.collectionGachaV12326('banner.manual',10,false);
 check(out.cost===1440&&cs.currencies.boundImmortalJade===before-1440,'V100 canonical 10-pull spends exactly 1440 Bound Jade');
 check(ensureCollectionWorkshopV12326(cs).tracks['banner.manual'].pulls===10,'V100 canonical category pity track advances by exact pull count');
 check(cs.gacha.manual.pulls===legacy16&&ensureCollectionEconomyV12325(cs).tracks['banner.myriad'].pulls===legacy25,'V100 canonical roll does not mutate V12316/V12325 legacy pity tracks');
 const ledger=out.economy?.ledger||out.economy?.recentLedger||[];check(JSON.stringify(out.economy).includes('gacha.banner.manual'),'V100 V89 economy output records canonical gacha source');
 g.collectionGachaV12326('banner.manual',10,false);check(ensureCollectionWorkshopV12326(cs).tracks['banner.manual'].pulls===20,'V100 has no artificial daily roll-count cap');
}

// Determinism: same clean save + same root/action index => identical gacha outcomes.
{
 const base=state();const s1=new SimulationSession(r,thanhHaWorld,adventureEnemies,playablePlayerProfile,10002,structuredClone(base)),s2=new SimulationSession(r,thanhHaWorld,adventureEnemies,playablePlayerProfile,10002,structuredClone(base));const g1=new GameplayFacade(s1,r,thanhHaWorld),g2=new GameplayFacade(s2,r,thanhHaWorld);
 const a=g1.collectionGachaV12326('banner.bloodline',10,false).results,b=g2.collectionGachaV12326('banner.bloodline',10,false).results;
 check(JSON.stringify(a)===JSON.stringify(b),'V100 gacha remains deterministic for same save/root/action index');
}
const app=fs.readFileSync('./app.js','utf8'),rt=fs.readFileSync('./standalone-runtime.js','utf8');
check(app.includes('V100 · VẠN TƯỢNG CANONICAL')&&app.includes('1 banner / 1 hệ / 1 pity track'),'V100 UI explains canonical banner/pity/economy rule');
check(!app.includes("data-collection-gacha-v12325]"),'V100 UI no longer binds legacy V12325 gacha');
check(rt.includes("case'collectionGachaV12325':throw")&&rt.includes("case'collectionGachaV12316':throw"),'V100 standalone transport blocks both legacy gacha write engines');
console.log(`\nV100 VAN TUONG PRODUCTION: ${pass}/${pass} PASS`);
