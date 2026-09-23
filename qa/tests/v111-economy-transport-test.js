globalThis.dispatchEvent=()=>true;globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};
let pass=0;const check=(v,m)=>{if(!v)throw new Error(`FAIL: ${m}`);pass++;console.log(`✓ ${m}`)};
async function json(url,init){const r=await fetch(url,init);const p=await r.json();if(!r.ok||p.ok===false)throw new Error(`${url}: ${p.error||r.status}`);return p}async function post(url,b){return json(url,{method:'POST',body:JSON.stringify(b)})}
try{
  await import('../../standalone-runtime.js');
  const health=await json('/api/health');check(health.version==='1.40.0-alpha.24.0','V140 current runtime boots with compatibility contract');
  const dev=await post('/api/dev/action',{action:'devSandboxPreset',realmOrder:18,dao:'sword',forceBoss:false});
  const save=structuredClone(dev.save);save.game.state.inventory['resource.spirit_stone']=1_000_000;save.game.state.inventory['resource.economy.herb.t1.qi']=20;
  let loaded=await post('/api/load',{save});
  check(loaded.snapshot.economyProduction?.schema==='economy-production.v111','V111 /api state transports production economy DTO');
  check(loaded.snapshot.economy?.shop?.slots?.length===9,'V111 /api state transports live Phuong Thi stock');
  const slot=loaded.snapshot.economy.shop.slots.find(x=>x.kind==='resource'&&x.fixed&&x.quantity>0);check(Boolean(slot),'V111 fixed resource slot is available for deterministic transport purchase test');
  const stones0=loaded.save.game.state.inventory['resource.spirit_stone'],qty0=slot.quantity;
  const bought=await post('/api/action',{action:'economyBuyV111',slotId:slot.id,quantity:1});
  const boughtSlot=bought.snapshot.economy.shop.slots.find(x=>x.id===slot.id);check(bought.save.game.state.inventory['resource.spirit_stone']<stones0&&boughtSlot.quantity===qty0-1,'V111 economyBuyV111 spends Linh Thach and persists finite stock');
  const rid=slot.resourceId,ownedAfterBuy=Number(bought.save.game.state.inventory[rid]||0),stones1=bought.save.game.state.inventory['resource.spirit_stone'];
  const sold=await post('/api/action',{action:'economySellV111',resourceId:rid,quantity:1});
  check(Number(sold.save.game.state.inventory[rid]||0)===ownedAfterBuy-1&&sold.save.game.state.inventory['resource.spirit_stone']>stones1,'V111 economySellV111 returns material to canonical Linh Thach economy');
  const save2=structuredClone(sold.save);save2.game.state.inventory['resource.economy.herb.t1.qi']=20;await post('/api/load',{save:save2});
  const conv=await post('/api/action',{action:'economyConvertV111',resourceId:'resource.economy.herb.t1.qi',batches:1});
  check(conv.save.game.state.inventory['resource.economy.herb.t1.qi']===10&&conv.save.game.state.inventory['resource.economy.herb.t2.qi']>=1,'V111 economyConvertV111 applies canonical 10→1 next-tier conversion');
  const beforeRefresh=await json('/api/state'),serial0=beforeRefresh.snapshot.economy.shop.refreshSerial,ss0=beforeRefresh.save.game.state.inventory['resource.spirit_stone'];
  const refreshed=await post('/api/action',{action:'economyRefreshV111'});check(refreshed.snapshot.economy.shop.refreshSerial===serial0+1&&refreshed.save.game.state.inventory['resource.spirit_stone']<ss0,'V111 economyRefreshV111 spends Linh Thach and rerolls deterministic finite stock');
  check(refreshed.snapshot.economyProduction.health.gachaPullCap===null&&refreshed.snapshot.economyProduction.health.resourceFarmCap===null,'V111 transport keeps open Gacha/resource gameplay contract');
  const state=await json('/api/state');check(state.snapshot.economyProduction.boundJade.cycle28d.recurringMax===5120,'V111 repeated /api/state preserves 28-day budget read-model');
  console.log(`\n${pass}/${pass} V111 Economy standalone/web transport checks passed.`);process.exit(0);
}catch(e){console.error(e?.stack||e);process.exit(1)}
