import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { LocalGameApplicationApi } from '../../dist/core/game-api.js';
import { buildWebClientSnapshot } from '../../dist/core/client-shell.js';
import { createMetaProgressState } from '../../dist/core/life.js';

let pass=0; const check=(v,m)=>{if(!v)throw new Error(m);pass++;console.log(`✓ ${m}`)};
const r=buildRegistry();
const realmAt=order=>[...r.realms.values()].sort((a,b)=>Math.abs(a.order-order)-Math.abs(b.order-order))[0];
function baseSession(seed=10101){const st=createPlayableAdventureState();return new SimulationSession(r,thanhHaWorld,adventureEnemies,playablePlayerProfile,seed,st);}
function archiveFrom(session, lifeNumber, lifeId, scoreBoost=0, realmOrder=1, age=60){
  const a=session.previewCurrentLifeSettlement();
  const realm=realmAt(realmOrder);
  a.lifeNumber=lifeNumber;a.lifeId=lifeId;a.totalScore=300+scoreBoost;a.grade=scoreBoost>300?'A':'B';a.maxRealmOrder=realmOrder;a.finalRealmId=realm.id;a.ageAtDeathYears=age;a.lifespanYears=Math.max(age+5,100);a.causeOfDeath=lifeNumber===1?'Thọ tận':'Chiến tử';
  const keys=['cultivation','combat','exploration','profession','relationships','fate'];
  keys.forEach((k,i)=>{a.categories[k].score=40+i*10+scoreBoost/10+(lifeNumber-1)*5;a.categories[k].uniqueMilestones=2+i;a.categories[k].reasons=[`${k} milestone ${lifeNumber}`];});
  a.notableStats={...a.notableStats,'Chiến thắng':10*lifeNumber,'Địa điểm từng biết':3+lifeNumber};
  a.chronicle=[{ageYears:20,worldTimeYears:20,eventId:`evt.${lifeNumber}.1`,text:`Đời ${lifeNumber} nhập đạo`,significance:25},{ageYears:age,worldTimeYears:age,eventId:`evt.${lifeNumber}.end`,text:`Đời ${lifeNumber} kết thúc`,significance:100}];
  return a;
}
const proto=baseSession();
const a1=archiveFrom(proto,1,'life.v101.1',0,10,80),a2=archiveFrom(proto,2,'life.v101.2',240,22,125);
const meta=createMetaProgressState();meta.archives=[a1,a2];meta.completedLives=2;meta.totalLifeScore=a1.totalScore+a2.totalScore;meta.lifetimeCpEarned=77;meta.mingJi=33;
meta.reincarnationProgress.rewardHistory=[
  {lifeId:a1.lifeId,depthTier:'spirit',depthStage:1,reincarnationPoints:60,permanentPotentialGain:12,energyCost:50,offenseRatio:1.05,survivalRatio:1.0,finalizedAtUnixMs:1000},
  {lifeId:a2.lifeId,depthTier:'mystic',depthStage:1,reincarnationPoints:120,permanentPotentialGain:25,energyCost:42,offenseRatio:1.2,survivalRatio:1.1,finalizedAtUnixMs:2000},
];
const currentState=createPlayableAdventureState();const currentRealm=realmAt(26);currentState.realm.realmId=currentRealm.id;currentState.realm.maxRealmOrder=26;currentState.ageYears=90;
const life=proto.currentLife;life.lifeNumber=3;life.lifeId='life.v101.3';
const s=new SimulationSession(r,thanhHaWorld,adventureEnemies,playablePlayerProfile,10102,currentState,0,[],meta,life);const g=new GameplayFacade(s,r,thanhHaWorld);const api=new LocalGameApplicationApi(g);
const beforeState=JSON.stringify(s.state),beforeMeta=JSON.stringify(s.meta),beforeAction=s.actionIndex;
const m=g.myriadLives();
check(m.schema==='myriad-lives.v101'&&m.rules?.source==='LifeSettlement archive canonical'&&m.rules?.noParallelHistory===true,'V101 uses canonical LifeSettlement archive with no parallel history');
check(m.summary.completedLives===2&&m.summary.currentLifeNumber===3&&m.summary.totalLifeScore===a1.totalScore+a2.totalScore,'V101 summary exposes completed lives/current life/account life score');
check(m.lives.length===2&&m.lives[0].lifeNumber===1&&m.lives[1].lifeNumber===2,'V101 preserves chronological life archive order');
check(m.lives.every(x=>x.categories.length===6)&&m.lives[1].chronicle.length===2,'V101 each life exposes six score axes plus chronicle');
check(m.lives[1].reincarnationReward?.permanentPotentialGain===25&&m.lives[1].reincarnationReward?.reincarnationPoints===120,'V101 joins Reincarnation V2 reward history by lifeId');
check(m.lives[1].deltaVsPrevious?.totalScore===a2.totalScore-a1.totalScore&&m.lives[1].deltaVsPrevious.categories.length===6,'V101 archived lives expose comparable deltas vs previous life');
check(m.records.bestScore?.lifeNumber===2&&m.records.highestRealm?.lifeNumber===2&&m.records.longestLife?.lifeNumber===2,'V101 global records derive from archive facts');
check(m.records.bestReincarnationReward?.lifeNumber===2&&m.records.categories.length===6,'V101 records include best Reincarnation V2 reward and six category records');
check(m.currentProjection.lifeNumber===3&&m.currentProjection.settled===false&&m.currentProjection.categories.length===6,'V101 current living life has read-only projected settlement');
check(m.currentProjection.vsPreviousLife?.lifeNumber===2&&m.currentProjection.vsPreviousLife.categoryDeltas.length===6,'V101 current life compares directly with latest completed life');
check(m.currentProjection.strongestCategory&&m.currentProjection.weakestCategory&&Array.isArray(m.insights)&&m.insights.length>=1,'V101 derives strongest/weakest axes and actionable comparison insight');
check(JSON.stringify(s.state)===beforeState&&JSON.stringify(s.meta)===beforeMeta&&s.actionIndex===beforeAction,'V101 read model is side-effect free');
check(api.getMyriadLives().schema==='myriad-lives.v101','V101 Game API exposes getMyriadLives');
const snap=buildWebClientSnapshot(api,10103000);check(snap.myriadLives?.schema==='myriad-lives.v101'&&snap.myriadLives.currentProjection.lifeNumber===3,'V101 production web snapshot includes Vạn Thế DTO');
const app=fs.readFileSync('./app.js','utf8');
check(app.includes('renderMyriadLivesV101')&&app.includes("myriadLives:renderMyriadLivesV101"),'V101 app has real Vạn Thế route renderer');
check(app.includes('Vạn Thế · Nhật Ký Các Đời')&&app.includes('Hồ sơ & so sánh các đời'),'V101 player UI exposes life records and comparison entry point');
console.log(`\nV101 MYRIAD LIVES PRODUCTION: ${pass}/${pass} PASS`);
