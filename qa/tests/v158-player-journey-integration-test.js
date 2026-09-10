import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { buildManualCatalogV127 } from '../../dist/core/manual-progression-v127.js';
import { resourcePveProductionCatalogV109 } from '../../dist/core/resource-pve-v12329.js';
import { SPIRIT_BEAST_SPECIES } from '../../dist/core/spirit-beast-v147.js';
import { CONFIDANTS_V87 } from '../../dist/core/confidant-v87.js';
import { ARTIFACTS_V88, RELICS_V88 } from '../../dist/core/artifact-v88.js';
import { IMMORTAL_MAJOR_STAGES_V114 } from '../../dist/core/immortal-progression-v114.js';

const registry=buildRegistry();
let passed=0;
function check(value,message){assert.ok(value,message);passed++;console.log(`✓ ${message}`);}
function gameAt(order){
  const state=createPlayableAdventureState();
  const realm=[...registry.realms.values()].find(x=>x.order===order);
  assert.ok(realm,`missing realm order ${order}`);
  state.realm.realmId=realm.id;
  state.realm.maxRealmOrder=order;
  const session=new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,158000+order,state);
  return {state,session,game:new GameplayFacade(session,registry,thanhHaWorld)};
}

// V158 is a cross-system journey gate. It does not pretend to replace each subsystem's real
// production/farm/combat tests; canonical CI runs those gates separately before/after this file.
const fresh=gameAt(0);
const early=fresh.game.playerExperienceV105(1788210000000);
check(early.clarity.coreLoop.map(x=>x.id).join(',')==='cultivate,farm,build,challenge,reincarnate','V158 keeps one coherent five-step player loop');
check(early.clarity.systems.length===16&&new Set(early.clarity.systems.map(x=>x.id)).size===16,'V158 player guide has 16 unique player-facing systems');
check(early.clarity.systems.every(x=>x.purpose&&x.do&&x.cost&&x.gain&&x.source),'V158 every player-facing system explains purpose/action/cost/gain/source');
check(early.progression.steps.length===29&&early.progression.steps.at(-1).name==='Sáng Thế Chủ'&&early.progression.productionVerifiedThroughRealmOrder===117,'V158 guide spans all 29 major milestones through realm order 117');

const hunt=gameAt(1).game.playerExperienceV105(1788210000000).clarity.systems.find(x=>x.id==='hunt');
check(hunt?.unlocked===true&&!/Tu Vi\//.test(hunt.gain)&&hunt.gain.includes('không cộng Tu Vi trực tiếp'),'V158 Săn Yêu guide no longer claims direct Tu Vi minting');
check(hunt?.source.includes('Tu Luyện vẫn chạy độc lập 100%'),'V158 Săn Yêu guide states cultivation remains independent while farming');

const unlockChecks=[
  [0,['cultivation','roots','origins'],['hunt','dao','pvp','soul','daoIntent']],
  [1,['hunt','dungeons','social'],['dao','pvp','soul','daoIntent']],
  [10,['dao','alchemy','dongfu','collection','reincarnation','myriadLives'],['pvp','soul','daoIntent']],
  [14,['faction'],['pvp','soul','daoIntent']],
  [18,['pvp'],['soul','daoIntent']],
  [22,['soul'],['daoIntent']],
  [26,['daoIntent'],[]],
];
for(const [order,on,off] of unlockChecks){
  const systems=gameAt(order).game.playerExperienceV105(1788210000000).clarity.systems;
  const byId=new Map(systems.map(x=>[x.id,x]));
  check(on.every(id=>byId.get(id)?.unlocked)&&off.every(id=>!byId.get(id)?.unlocked),`V158 unlock map is coherent at realm order ${order}`);
}

const reincarnation=gameAt(10).game.playerExperienceV105(1788210000000).clarity.systems.find(x=>x.id==='reincarnation');
check(reincarnation?.do.includes('Tọa Hóa')&&reincarnation.do.includes('không có bước Thí Luyện giả bắt buộc'),'V158 Luân Hồi guide follows current direct Tọa Hóa/settlement lifecycle');
const passing=fresh.session.voluntaryPassingEligibility(1788210000000);
check(passing.minimumAge===undefined&&passing.minimumRealmOrder===undefined&&passing.firstClears===undefined,'V158 Luân Hồi lifecycle has no resurrected age/realm/first-clear fake gate');

const resourceCatalog=resourcePveProductionCatalogV109();
check(resourceCatalog.length===8&&resourceCatalog.every(x=>x.firstClearMode==='CombatKernelV2'&&x.farmMode==='time-based-dungeon'),'V158 specialized resource loop is first-clear combat then real time-based farm');
check(resourceCatalog.every(x=>x.repeatGuardianMaterialReward===false&&x.specificFragments==='gacha-only'),'V158 resource farming cannot spam Boss rewards or bypass specific-fragment gacha ownership');

const manuals=buildManualCatalogV127();
check(manuals.length===261&&manuals.every(x=>x.maxLevel===1000&&x.maxAdvance===10),'V158 all 261 Công Pháp retain Lv1000 and ten 100-level gates');
check(manuals.every(x=>(x.stats||[]).every(s=>!['actionSpeedPct','spiritFlat','spiritPct','maxSpiritPct'].includes(s.id))),'V158 Công Pháp cannot silently reintroduce Action Speed or Chân Nguyên growth');
check(SPIRIT_BEAST_SPECIES.length===8&&CONFIDANTS_V87.length===8,'V158 collection roster retains 8 Linh Thú and 8 Tri Kỷ');
check(ARTIFACTS_V88.length===12&&RELICS_V88.length===8,'V158 collection roster retains 12 Pháp Bảo and 8 Chí Bảo');

const cave=fresh.session.stateValue.collectionV12316?.cave?.facilities??[];
check(cave.length===8&&new Set(cave.map(x=>x.id)).size===8,'V158 fresh account owns one canonical 8-facility Động Phủ state');
const soul=gameAt(42).game.soul();
check(soul.cloneAuthorityMax===6&&soul.sixDao.length===6,'V158 midgame-to-lategame keeps exactly six Lục Đạo Phân Thân authorities');

check(IMMORTAL_MAJOR_STAGES_V114.length===18&&IMMORTAL_MAJOR_STAGES_V114.every(x=>x.end-x.start===3&&x.finalFloor===5),'V158 Immortal+ path has 18 explicit four-order stages with a five-floor content objective each');
const terminal=gameAt(114).game.playerExperienceV105(1788210000000);
check(terminal.progression.currentMilestone.name==='Sáng Thế Chủ'&&terminal.progression.nextMilestone===undefined,'V158 Sáng Thế Chủ is a terminal milestone rather than a fake next realm');

console.log(`\nV158 PLAYER JOURNEY INTEGRATION: ${passed}/${passed} PASS`);
