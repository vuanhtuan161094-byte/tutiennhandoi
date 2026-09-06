import { buildRegistry } from '../../dist/content/registry.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { SimulationSession } from '../../dist/core/session.js';
import { verifyPvpIntegrityV94 } from '../../dist/core/pvp-v91.js';
import { recordPvpWinBoundJadeV91 } from '../../dist/core/economy-activity-v89.js';

let passed=0; const check=(ok,label)=>{if(!ok)throw new Error(`FAIL: ${label}`);passed++;console.log(`✓ ${label}`)};
const registry=buildRegistry(), now=1772000000000;
function session(seed=9400){const state=createPlayableAdventureState();state.realm.maxRealmOrder=18;const s=new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,seed,state);s.joinPvpV91(now);return s;}
const s=session();
let v1=s.pvpV91(now+1),v2=s.pvpV91(now+2);
const ids1=v1.opponents.map(x=>x.id),ids2=v2.opponents.map(x=>x.id);
check(JSON.stringify(ids1)===JSON.stringify(ids2),'repeated reads return same deterministic tickets');
check(v1.opponents.every((x,i)=>x.ticketSeed===v2.opponents[i].ticketSeed),'repeated reads return same deterministic seeds');
s.setPvpTacticalV94('execute',now+3);const afterTactical=s.pvpV91(now+3);
check(JSON.stringify(afterTactical.opponents.map(x=>x.id))===JSON.stringify(ids1),'Tactical change cannot reroll opponents');
s.refreshPvpDefenseV91(now+4);const afterDefense=s.pvpV91(now+4);
check(JSON.stringify(afterDefense.opponents.map(x=>x.id))===JSON.stringify(ids1),'defense refresh cannot reroll opponents');
const first=s.challengePvpV91(afterDefense.opponents.find(x=>x.band==='easy').id,now+5);
const next=s.pvpV91(now+6);
check(!next.opponents.some(x=>x.id===first.ticketId),'used ticket is consumed');
check(next.antiReroll.currentNonce===1,'matchmaking nonce advances only after fight');
check(first.seed===afterDefense.opponents.find(x=>x.band==='easy').ticketSeed,'battle seed is exactly ticket seed');
check(verifyPvpIntegrityV94(s.state).ok===true,'integrity chain verifies after fight + reward');

const a=session(9410),b=session(9410);a.setPvpTacticalV94('stack',now+1);b.setPvpTacticalV94('stack',now+1);
const oa=a.pvpV91(now+2).opponents[1],ob=b.pvpV91(now+2).opponents[1];
const fa=a.challengePvpV91(oa.id,now+2),fb=b.challengePvpV91(ob.id,now+2);
check(fa.seed===fb.seed,'same clean state/ticket yields same seed');
check(fa.result===fb.result&&fa.battle.duration===fb.battle.duration,'same seed/build yields same CombatKernel result');

const spam=session(9420);const factors=[];
for(let i=0;i<6;i++){const view=spam.pvpV91(now+10+i);const opp=view.opponents.find(x=>x.band==='easy');const r=spam.challengePvpV91(opp.id,now+10+i);factors.push(r.ratingFactor);}
check(JSON.stringify(factors)==='[1,0.8,0.6,0.45,0.35,0.35]','same-band spam uses 1/.8/.6/.45/.35 diminishing factors');
const switchView=spam.pvpV91(now+30);const switched=spam.challengePvpV91(switchView.opponents.find(x=>x.band==='even').id,now+30);
check(switched.ratingFactor===1&&switched.sameBandStreak===1,'switching band resets diminishing streak');

const tamper=session(9430);let tv=tamper.pvpV91(now+1);tamper.challengePvpV91(tv.opponents[0].id,now+2);tamper.stateValue.pvpV91.rating+=7;
check(verifyPvpIntegrityV94(tamper.state).ok===false,'manual rating tamper breaks integrity');
let blocked=false;try{tv=tamper.pvpV91(now+3);tamper.challengePvpV91(tv.opponents[0].id,now+3);}catch{blocked=true}
check(blocked,'integrity mismatch blocks PvP write');

const rewardHost=structuredClone(createPlayableAdventureState().collectionV12316),start=rewardHost.currencies.boundImmortalJade;const rewards=[];
for(let i=0;i<6;i++)rewards.push(recordPvpWinBoundJadeV91(rewardHost,now+i));
check(rewards.map(x=>x.boundJade).join(',')==='8,8,8,8,8,0','daily PvP reward stays 8×5 then zero');
check(rewardHost.currencies.boundImmortalJade===start+40,'six wins add exactly 40 Bound Jade');
check(rewardHost.economyV89.lifetime.earnedBySource['daily.pvp.win']===40,'V89 ledger closure remains exact');
console.log(`\n${passed}/17 V94 Integrity checks passed.`);
