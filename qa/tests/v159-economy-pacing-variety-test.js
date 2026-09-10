import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CULTIVATION_REALMS_V140 } from '../../dist/core/cultivation-v140.js';
import { WORLD_YEARS_PER_REAL_DAY } from '../../dist/core/realtime-balance.js';
import { dungeons } from '../../dist/content/dungeons.js';
import { createDungeonProgressState } from '../../dist/core/dungeon.js';
import { IMMORTAL_MAJOR_STAGES_V114, immortalCadenceV159, immortalProgressionSummaryV114 } from '../../dist/core/immortal-progression-v114.js';
import { createImmortalState, breakExtremityLayer, createGenesisEpoch } from '../../dist/core/immortal.js';

let passed=0;
function test(name,fn){fn();passed++;console.log(`✓ ${name}`);}
const sumSeconds=(from,to)=>CULTIVATION_REALMS_V140.filter(x=>x.order>=from&&x.order<=to).reduce((sum,x)=>sum+Number(x.targetSeconds||0),0);
const days=seconds=>seconds/86400;

const pacing={
  mortalToTribulation:days(sumSeconds(0,45)),
  immortalFoundation:days(sumSeconds(46,85)),
  transcendent:days(sumSeconds(86,113)),
  creation:days(sumSeconds(114,116)),
  totalBaseline:days(sumSeconds(0,116)),
};

test('V159 pacing ledger covers exactly 117 nonterminal realm targets plus terminal order 117',()=>{
  assert.equal(CULTIVATION_REALMS_V140.length,118);
  assert(CULTIVATION_REALMS_V140.slice(0,117).every(x=>Number(x.targetSeconds)>0));
  assert.equal(CULTIVATION_REALMS_V140[117].targetSeconds,0);
  assert.equal(CULTIVATION_REALMS_V140[117].majorRealmName,'Sáng Thế Chủ');
  assert(Math.abs(Object.values(pacing).slice(0,4).reduce((a,b)=>a+b,0)-pacing.totalBaseline)<1e-9);
});

test('V159 pacing report remains a baseline Tu Vi budget, not a fake promise of calendar completion time',()=>{
  assert(pacing.totalBaseline>0);
  assert(pacing.creation>0);
  assert.equal(WORLD_YEARS_PER_REAL_DAY,100);
  const longest=CULTIVATION_REALMS_V140.slice(0,117).reduce((a,b)=>a.targetSeconds>b.targetSeconds?a:b);
  assert.equal(longest.order,116);
  console.log('V159 BASELINE PACING DAYS (before Linh Căn/Công Pháp/Luân Hồi/Bế Quan and other accelerators):');
  console.log(JSON.stringify({...pacing,longest:{order:longest.order,name:longest.name,days:days(longest.targetSeconds)}},null,2));
});

test('V159 every Immortal+ major stage has a real five-floor dungeon and farmable stage resource',()=>{
  assert.equal(IMMORTAL_MAJOR_STAGES_V114.length,18);
  for(const stage of IMMORTAL_MAJOR_STAGES_V114){
    const dungeon=dungeons[stage.dungeonId];
    assert(dungeon,`missing ${stage.dungeonId}`);
    assert.equal(dungeon.floors?.length,5,`${stage.name} must keep five authored floors`);
    assert((dungeon.rewards||[]).some(x=>Number(x.baseYieldPerYear)>0),`${stage.name} must have time-based farm output`);
    assert((dungeon.guardianLoot?.resources||[]).some(x=>Number(x.amount)>0),`${stage.name} must have first-clear resource burst`);
  }
});

test('V159 endgame cadence is not eighteen copies of one generic refinement label',()=>{
  const ids=new Set(IMMORTAL_MAJOR_STAGES_V114.map(x=>immortalCadenceV159(x.start).id));
  assert.deepEqual([...ids],['immortal-foundation','law-refinement','limit-break','cosmic-refinement','genesis-cycle']);
  assert.equal(immortalCadenceV159(86).id,'limit-break');
  assert.equal(immortalCadenceV159(114).id,'genesis-cycle');
});

test('V159 Cực Hạn exposes the existing Phá Cực action only at the real boundary',()=>{
  const state={realm:{maxRealmOrder:89},immortal:createImmortalState(),inventory:{}};
  state.immortal.extremityPressure=100;
  state.immortal.extremityInsight=60;
  const summary=immortalProgressionSummaryV114(state,createDungeonProgressState());
  assert.equal(summary.cadence.id,'limit-break');
  assert.match(summary.nextAction.title,/Phá Cực lớp 1/);
  const core=createImmortalState();core.extremityPressure=100;core.extremityInsight=60;
  const result=breakExtremityLayer(core);
  assert.equal(result.layer,1);assert.equal(core.extremityPressure,20);assert.equal(core.extremityAuthority,8);
});

test('V159 Sáng Thế final gate includes real source/authority and epoch resource requirements',()=>{
  const immortal=createImmortalState();
  immortal.creationSource=100;immortal.genesisAuthority=100;
  const state={realm:{maxRealmOrder:117},immortal,inventory:{'resource.genesis_core':20,'resource.first_dawn_fragment':1}};
  const dp=createDungeonProgressState(['dungeon.genesis_source']);dp.highestClearedFloor['dungeon.genesis_source']=5;
  const summary=immortalProgressionSummaryV114(state,dp);
  assert.equal(summary.cadence.id,'genesis-cycle');
  assert.equal(summary.finalGate.ready,true);
  assert.equal(summary.nextAction.title,'Khai Kỷ Nguyên');
  assert(summary.objectives.some(x=>x.id==='metric.creationSource'&&x.target===100));
  assert(summary.objectives.some(x=>x.id==='metric.genesisAuthority'&&x.target===100));
  assert(summary.objectives.some(x=>x.id==='epoch.core'&&x.target===20));
  assert(summary.objectives.some(x=>x.id==='epoch.dawn'&&x.target===1));
});

test('V159 Genesis Epoch is a repeatable partial-reset loop with bounded log scaling, not a one-click permanent max',()=>{
  const immortal=createImmortalState();immortal.creationSource=100;immortal.genesisAuthority=100;
  const first=createGenesisEpoch(immortal);
  assert.equal(first.epoch,1);assert.equal(immortal.creationSource,35);assert.equal(immortal.genesisAuthority,40);assert(immortal.creationEpochAuthority>0);
  immortal.creationSource=100;immortal.genesisAuthority=100;
  const second=createGenesisEpoch(immortal);
  assert.equal(second.epoch,2);assert.equal(immortal.creationSource,35);assert.equal(immortal.genesisAuthority,40);
});

test('V159 Sáng Thế Nguyên Hải supplies both the refinement currency and the mandatory epoch token',()=>{
  const dungeon=dungeons['dungeon.genesis_source'];
  const farm=new Map(dungeon.rewards.map(x=>[x.resourceId,x]));
  const first=new Map((dungeon.guardianLoot?.resources||[]).map(x=>[x.resourceId,x]));
  assert(Number(farm.get('resource.genesis_core')?.baseYieldPerYear)>0);
  assert(Number(farm.get('resource.first_dawn_fragment')?.baseYieldPerYear)>0);
  assert(Number(first.get('resource.genesis_core')?.amount)>=20);
  assert(Number(first.get('resource.first_dawn_fragment')?.amount)>=1);
  const firstCore=Number(first.get('resource.genesis_core').amount);
  const corePerRealDay=Number(farm.get('resource.genesis_core').baseYieldPerYear)*WORLD_YEARS_PER_REAL_DAY;
  const firstEpochRefineBatches=Math.max(Math.ceil((100-5)/1.65),Math.ceil(100/1.58));
  const firstEpochCoreBudget=firstEpochRefineBatches*2+20;
  const residualFarmDays=Math.max(0,firstEpochCoreBudget-firstCore)/corePerRealDay;
  console.log('V159 FIRST GENESIS ECONOMY:',JSON.stringify({firstClearCore:firstCore,firstEpochRefineBatches,firstEpochCoreBudget,corePerRealDay,residualFarmDays},null,2));
});

test('V159 public gameplay dispatch exposes existing manifestation, Phá Cực and Genesis Epoch authorities without a second resolver',()=>{
  const source=readFileSync(new URL('../../dist/core/gameplay.js',import.meta.url),'utf8');
  assert(source.includes("type === 'setActiveManifestationsV159'")&&source.includes('this.session.setActiveManifestations'));
  assert(source.includes("type === 'breakExtremityLayerV159'")&&source.includes('this.session.breakExtremityLayer'));
  assert(source.includes("type === 'createGenesisEpochV159'")&&source.includes('this.session.createGenesisEpoch'));
  assert(!source.includes('new CombatEngine')&&!source.includes('new CombatKernel'));
});

console.log(`\nV159 ECONOMY / PACING / ENDGAME VARIETY: ${passed}/${passed} PASS`);
