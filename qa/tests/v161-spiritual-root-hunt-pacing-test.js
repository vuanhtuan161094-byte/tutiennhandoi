import assert from 'node:assert/strict';
import {
  SPIRITUAL_ROOT_HUNT_PACING_V161_SCHEMA,
  V161_ROOT_KILL_SPEED_SCENARIOS,
  V161_ROOT_TARGET_LEVELS,
  V161_ROOT_VIRTUAL_BATCH_KILLS,
  buildSpiritualRootHuntPacingAuditV161,
  simulateSpiritualRootHuntPacingV161,
} from '../../dist/core/spiritual-root-hunt-pacing-v161.js';
import {
  SPIRITUAL_ROOT_VIRTUAL_ORIGIN_PITY_KILLS_V145,
} from '../../dist/core/spiritual-root-v145.js';
import {
  HUNT_VIRTUAL_FARM_MIN_SECONDS_PER_KILL_V77,
} from '../../dist/core/hunt-virtual-farm-v77.js';
import { spiritualRootAcquisitionReferenceV160 } from '../../dist/core/full-life-acquisition-v160.js';

let passed=0;
const test=(name,fn)=>{fn();passed++;console.log(`✓ ${name}`)};
const audit=buildSpiritualRootHuntPacingAuditV161();
const row=(targetLevel,includeFirstClear)=>audit.rows.find(x=>x.targetLevel===targetLevel&&x.includeFirstClear===includeFirstClear);

test('V161 B5 uses the exact V145 500-kill origin pity and V141 0.25s Hunt hard floor',()=>{
  assert.equal(audit.schema,SPIRITUAL_ROOT_HUNT_PACING_V161_SCHEMA);
  assert.equal(audit.originPityKills,SPIRITUAL_ROOT_VIRTUAL_ORIGIN_PITY_KILLS_V145);
  assert.equal(audit.originPityKills,500);
  assert.equal(V161_ROOT_VIRTUAL_BATCH_KILLS,500);
  assert.equal(HUNT_VIRTUAL_FARM_MIN_SECONDS_PER_KILL_V77,0.25);
  assert.equal(V161_ROOT_KILL_SPEED_SCENARIOS[0].secondsPerKill,0.25);
  assert.equal(V161_ROOT_KILL_SPEED_SCENARIOS[0].id,'hardFloorCap');
});

test('V161 B5 covers root checkpoints through the realm-tier cap and infinite-root range',()=>{
  assert.deepEqual(audit.targets,[...V161_ROOT_TARGET_LEVELS]);
  assert.deepEqual(audit.targets,[100,1000,2800,10000]);
  assert.equal(audit.rows.length,audit.targets.length*2);
  for(const result of audit.rows){
    assert.equal(result.reachedLevel,result.targetLevel);
    assert.equal(result.ascensions,result.expectedAscensions);
    assert.equal(result.origins.spent,result.origins.expectedSpend);
  }
  const late=row(10000,false);
  assert.equal(late.currentMajorRealmIndex,28);
  assert.equal(late.ascensions,99);
  assert.equal(late.maxOriginRealmTier,28);
});

test('V161 B5 tendon spending reconciles exactly to the V160 cumulative cost authority',()=>{
  for(const targetLevel of V161_ROOT_TARGET_LEVELS){
    const reference=spiritualRootAcquisitionReferenceV160(targetLevel);
    for(const includeFirstClear of [false,true]){
      const result=row(targetLevel,includeFirstClear);
      assert.equal(result.tendon.spent,reference.cumulativeTendonCost,`${targetLevel}:${includeFirstClear}: tendon spend`);
      assert(BigInt(result.tendon.generated)>=BigInt(result.tendon.spent));
      assert(BigInt(result.tendon.remaining)>=0n);
    }
  }
});

test('V161 B5 pity-only Hunt demand grows monotonically with root target',()=>{
  const rows=V161_ROOT_TARGET_LEVELS.map(level=>row(level,false));
  for(let i=1;i<rows.length;i++){
    assert(rows[i].virtualKills>rows[i-1].virtualKills,`${rows[i-1].targetLevel}->${rows[i].targetLevel}: virtual kills`);
    assert(rows[i].cultivationBonusPct>rows[i-1].cultivationBonusPct,`${rows[i-1].targetLevel}->${rows[i].targetLevel}: cultivation bonus`);
  }
});

test('V161 B5 one first-clear credit per entered tier never increases virtual farm demand',()=>{
  for(const targetLevel of V161_ROOT_TARGET_LEVELS){
    const pity=row(targetLevel,false),first=row(targetLevel,true);
    assert(first.virtualKills<=pity.virtualKills,`${targetLevel}: virtual kills`);
    assert(first.origins.firstClearGenerated<=28,`${targetLevel}: first-clear credits`);
    assert(first.firstClearKills<=28,`${targetLevel}: first-clear kill overhead`);
    assert(first.totalKills<=pity.totalKills+28,`${targetLevel}: total kills including one-credit-per-tier overhead`);
  }
});

test('V161 B5 speed conversion is transparent and bounded by production Hunt floor',()=>{
  for(const result of audit.rows){
    const hard=result.speedConversions.find(x=>x.id==='hardFloorCap');
    const one=result.speedConversions.find(x=>x.id==='oneSecond');
    const five=result.speedConversions.find(x=>x.id==='fiveSeconds');
    assert.equal(hard.killsPerHour,14400);
    assert.equal(one.killsPerHour,3600);
    assert.equal(five.killsPerHour,720);
    assert(hard.farmHours<=one.farmHours&&one.farmHours<=five.farmHours);
    assert.equal(result.originPityKills,500);
  }
});

test('V161 B5 stays on production source/sink functions and states its realm-time exclusion',()=>{
  const sample=simulateSpiritualRootHuntPacingV161(1000,{includeFirstClear:false});
  assert.match(sample.interpretation,/settleSpiritualRootHuntV145/);
  assert.match(sample.interpretation,/nourishSpiritualRootV145/);
  assert.match(sample.interpretation,/ascendSpiritualRootV145/);
  assert.match(sample.interpretation,/Realm progression time itself is excluded/);
  assert.match(audit.note,/pity-only/i);
  assert.match(audit.note,/one production first-clear credit/i);
});

console.log('\nV161 SPIRITUAL ROOT × HUNT PACING SUMMARY');
console.log(JSON.stringify(audit.rows.map(x=>({
  targetLevel:x.targetLevel,
  mode:x.includeFirstClear?'firstClearCredit':'pityOnly',
  ascensions:x.ascensions,
  realmTier:x.currentMajorRealmIndex,
  kills:x.totalKills,
  virtualKills:x.virtualKills,
  originsSpent:x.origins.spent,
  firstClearOrigins:x.origins.firstClearGenerated,
  tendonSpent:x.tendon.spent,
  cultivationBonusPct:x.cultivationBonusPct,
  hardFloorFarmHours:x.speedConversions.find(s=>s.id==='hardFloorCap')?.farmHours,
  oneSecondFarmHours:x.speedConversions.find(s=>s.id==='oneSecond')?.farmHours,
  fiveSecondFarmHours:x.speedConversions.find(s=>s.id==='fiveSeconds')?.farmHours,
})),null,2));
console.log(`\nV161 SPIRITUAL ROOT HUNT PACING — ${passed}/${passed} PASS`);
