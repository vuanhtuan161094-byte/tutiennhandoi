import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { LocalGameApplicationApi } from '../../dist/core/game-api.js';
import { buildWebClientSnapshot } from '../../dist/core/client-shell.js';
import { buildEconomyProductionV111, caveBoundJadeRemainingV111, ECONOMY_PRODUCTION_V111 } from '../../dist/core/economy-production-v111.js';
let pass=0;const check=(v,m)=>{if(!v)throw new Error(`FAIL: ${m}`);pass++;console.log(`✓ ${m}`)};
const registry=buildRegistry();
{
  const cave=caveBoundJadeRemainingV111(['alchemy','forge','artifact','beast','companion','scripture','bloodline','physique'].map(id=>({id,level:1})));
  check(cave.total===6344,'V111 all eight Lv1→Lv10 DongFu facilities cost exactly 6,344 Bound Jade in current canonical curve');
  check(cave.facilities.every(x=>x.remainingBoundJade===793),'V111 each fresh facility has identical 793 Bound Jade long-term cost');
}
{
  const p=buildEconomyProductionV111({activity:{currencies:{boundImmortalJade:1600,immortalJade:0},daily:{earned:0,maxAuthored:140},weekly:{maxAuthored:300},shop:{offers:[]},ledger:{boundJadeEarned:0,boundJadeSpent:0},rules:{noInfiniteFarmBoundJade:true,gachaBoundJadePullCap:null,resourceDungeonFarmCap:null,autoMilestoneRewards:true,noManualClaimChores:true}},economy:{spiritStones:100,shop:{slots:Array(9).fill({}),manualRefreshCost:3000},ledger:{materials:[]},telemetry:{}},collection:{cave:{facilities:[]}},pvp:{reward:{paidWinsToday:0,remainingPaidWins:5},season:{rewardPreview:{boundJade:110}}}});
  check(p.schema==='economy-production.v111','V111 production economy has one canonical read-model schema');
  check(p.boundJade.cycle28d.recurringMax===6240,'V111 28-day recurring Bound Jade budget is 6,240 before first-clear/season burst');
  check(p.boundJade.cycle28d.firstClearBurstMax===300,'V111 first-clear burst is rate-limited to 300 per 28 days at authored weekly cap');
  check(p.boundJade.cycle28d.authoredMaxWithBurstAndSeason===6650,'V111 budget adds current 110 season preview without hiding it in daily income');
  check(p.boundJade.spendingPower.tenPullsNow===1&&p.boundJade.spendingPower.singlePullsNow===10,'V111 starting 1,600 Bound Jade is presented as one discounted 10-pull or ten singles');
  check(p.health.gachaPullCap===null&&p.health.resourceFarmCap===null,'V111 keeps Gacha and resource farming uncapped while reward sources stay capped');
}
{
  const st=createPlayableAdventureState();st.realm.maxRealmOrder=18;
  const s=new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,11101,st),g=new GameplayFacade(s,registry,thanhHaWorld),api=new LocalGameApplicationApi(g);
  const before=JSON.stringify(api.exportSave());const snap=buildWebClientSnapshot(api,1770000000000);const after=JSON.stringify(api.exportSave());
  check(before===after,'V111 opening Economy snapshot is read-only and never mutates save/shop stock');
  check(snap.economyProduction?.schema==='economy-production.v111','V111 web snapshot forwards production economy DTO');
  check(snap.economy?.shop?.slots?.length===9&&snap.economy.shop.slots.filter(x=>x.fixed).length===3,'V111 player-facing Phuong Thi exposes canonical 3 fixed + 6 random finite-stock slots');
  check(snap.economyProduction.boundJade.sinks.some(x=>x.id==='gacha'&&x.cap===null),'V111 economy explicitly treats Gacha as open sink, not a weekly pull quota');
  check(snap.economyProduction.boundJade.sinks.some(x=>x.id==='dongfu'),'V111 economy includes DongFu as competing long-term Bound Jade sink');
  check(snap.economyProduction.materials.specificFragments==='gacha-only'&&snap.economyProduction.materials.resourceFarmCap===null,'V111 preserves V109 farm/gacha ownership boundary');
}
const rt=fs.readFileSync('./standalone-runtime.js','utf8'),app=fs.readFileSync('./app.js','utf8'),css=fs.readFileSync('./styles.css','utf8');
check(rt.includes("case'economyRefreshV111'")&&rt.includes("case'economyBuyV111'")&&rt.includes("case'economySellV111'")&&rt.includes("case'economyConvertV111'"),'V111 universal runtime exposes all four canonical Phuong Thi/material actions');
check(app.includes('function renderEconomyV111')&&app.includes('data-economy-buy')&&app.includes("['economy','Kinh Tế'"),'V111 web/mobile UI exposes a real Economy route and market controls');
check(css.includes('.v111-economy')&&css.includes('@media (max-width:600px)'),'V111 Economy has dedicated mobile-responsive production CSS');
check(ECONOMY_PRODUCTION_V111.gachaSingleCost===160&&ECONOMY_PRODUCTION_V111.gachaTenCost===1440,'V111 budget keeps V100 canonical Gacha prices 160 / 1440');
console.log(`\n${pass}/${pass} V111 Economy Production checks passed.`);
