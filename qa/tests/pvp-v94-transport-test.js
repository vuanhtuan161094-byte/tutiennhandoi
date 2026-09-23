globalThis.dispatchEvent=()=>true;
globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}};
let passed=0;
const check=(ok,label)=>{if(!ok)throw new Error(`FAIL: ${label}`);passed++;console.log(`✓ ${label}`)};
async function json(url,init){
  const response=await fetch(url,init);
  const payload=await response.json();
  if(!response.ok||payload.ok===false) throw new Error(`${url}: ${payload.error||response.status}`);
  return payload;
}
async function action(body,dev=false){return json(`${dev?'/api/dev':'/api'}/action`,{method:'POST',body:JSON.stringify(body)});}
try{
  await import('../../standalone-runtime.js');
  const health=await json('/api/health');
  check(health.version==='1.40.0-alpha.24.0','PvP V94 compatibility runs on V140 current runtime');
  const dev=await action({action:'devSandboxPreset',realmOrder:18,dao:'sword',forceBoss:false},true);
  check(dev.save?.game?.state?.realm?.maxRealmOrder>=18,'DEV Kim Đan fixture generated through transport');
  const loaded=await json('/api/load',{method:'POST',body:JSON.stringify({save:dev.save})});
  check(loaded.save?.game?.state?.realm?.maxRealmOrder>=18,'production standalone loads Kim Đan save');
  const now=Date.now();
  const joined=await action({action:'pvpJoinV91',nowUnixMs:now});
  check(joined.result?.joined===true,'legacy V91 join action remains compatible');
  let view=(await json('/api/pvp')).pvp;
  check(view.featureVersion==='v94'&&view.opponents?.length===3,'GET /api/pvp exposes V94 and exactly 3 opponents');
  const initialIds=view.opponents.map(x=>x.id).join('|');
  const repeat=(await json('/api/pvp')).pvp;
  check(repeat.opponents.map(x=>x.id).join('|')===initialIds,'repeated transport reads cannot reroll tickets');
  const tactical=await action({action:'pvpTacticalV94',presetId:'stack',nowUnixMs:now+1});
  check(tactical.result?.selected?.id==='stack','V94 Tactical action is routed by standalone transport');
  view=(await json('/api/pvp')).pvp;
  check(view.tactical?.selected?.id==='stack'&&view.opponents.map(x=>x.id).join('|')===initialIds,'Tactical persists without rerolling opponents');
  await action({action:'pvpDefenseV91',nowUnixMs:now+2});
  view=(await json('/api/pvp')).pvp;
  check(view.defense?.tacticalPresetId==='stack','legacy defense action stores V94 Tactical snapshot');
  check(view.opponents.map(x=>x.id).join('|')===initialIds,'defense refresh cannot reroll transport tickets');
  const opponent=view.opponents.find(x=>x.band==='easy')??view.opponents[0];
  const fight=await action({action:'pvpChallengeV91',opponentId:opponent.id,nowUnixMs:now+3});
  check(fight.result?.schema==='pvp-match-result.v94','legacy challenge action resolves through V94 PvP result');
  check(fight.result?.seed===opponent.ticketSeed&&fight.result?.ticketId===opponent.ticketId,'challenge uses deterministic ticket seed');
  const after=(await json('/api/pvp')).pvp;
  check(after.antiReroll?.currentNonce===1&&!after.opponents.some(x=>x.id===opponent.id),'fight consumes ticket and advances matchmaking nonce');
  const replay=(await json(`/api/pvp/replay?fightId=${encodeURIComponent(fight.result.fightId)}`)).replay;
  check(replay?.verified===true&&replay?.source==='CombatKernelV3'&&replay?.engineVersion==='combat.v3','transport replay verifies new fights through CombatKernelV3');
  check(after.integrity?.ok===true,'transport state ends with valid V94 integrity chain');
  console.log(`\n${passed}/15 V94 Standalone transport checks passed.`);
  process.exit(0);
}catch(error){console.error(error?.stack||error);process.exit(1)}
