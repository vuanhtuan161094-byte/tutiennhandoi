import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { runCombatKernelV3 } from '../../dist/core/combat-kernel-v2.js';
import { analyzeBattle } from '../../dist/core/combat-analytics.js';
import { applyArtifactsV88ToEntity, ARTIFACTS_V88 } from '../../dist/core/artifact-v88.js';
import { applyArtifactsV88ToEntity as applyArtifactsPreComboV149 } from '../../dist/core/artifact-v149-base.js';
import { buildBalanceEntityV120 } from '../simulations/balance-lab-v120.js';

const registry=buildRegistry();
const IDLE='skill.v149.artifact.balance.idle';
if(!registry.skills.has(IDLE))registry.registerSkill({id:IDLE,name:'Mộc Nhân Tĩnh Tọa',description:'Không gây sát thương.',tags:['BalanceSimV149'],spiritCost:0,cooldown:0,castTime:0,recoveryTime:1,effects:[]});

const ARCHETYPES=[
  {id:'sword-offense',label:'Kiếm · thiên Công',dao:'sword',totalPotential:1000,potential:{power:.45,body:.15,agility:.20,spirit:.05,sense:.15},daoHanh:70},
  {id:'body-survival',label:'Thể · sinh tồn',dao:'body',totalPotential:1000,potential:{power:.15,body:.50,agility:.10,spirit:.10,sense:.15},daoHanh:70},
  {id:'mind-control',label:'Thần Niệm · khống chế',dao:'mind',totalPotential:1000,potential:{power:.25,body:.15,agility:.10,spirit:.10,sense:.40},daoHanh:70},
];

const LOADOUT=['artifact.thunder_guiding_mirror','artifact.thunder_punishment_sword','artifact.purple_mansion_lamp','artifact.starfall_sword_box'];
const SEEDS=[1491291,1492268,1493245];

function artifactState(rank=5){
  const items=Object.fromEntries(ARTIFACTS_V88.map(d=>[d.id,{owned:true,level:100,advance:4,specificFragments:0,artifactV149:{schema:'artifact.production.v149',baoHonRank:rank}}]));
  return {schema:'collection-progression.v12316',items,activeArtifactIds:[...LOADOUT],genericFragments:{manual:0,artifact:0,pet:0,companion:0},cave:{level:1,facilities:[{id:'artifact',level:10}]},economyV12325:{relicV88Migrated:true,extraItems:{},activeRelicId:undefined},artifactV88Migrated:true};
}
function target(){
  const axis=1000;
  return {id:'E',combatModel:'locked-v1',name:'Mộc Nhân V149',tags:['BalanceSimV149'],stats:{maxHp:axis*20*1500,physique:axis*1500,maxSpirit:1000,spiritStandard:1000,spiritRegenStandardPctPerSecond:0,attack:1,defense:axis,mobility:1,accuracy:1,critChancePct:0,critPowerPerLayer:.5,heartChancePct:0,dodgeChancePct:0,controlPower:1,resolve:100,actionSpeed:1,elementalAffinities:{},elementalResistancesPct:{},dominantElement:'Earth',primaryStatsV5:{power:1,body:axis*1500,agility:1,spirit:1000,sense:1}},skillIds:[IDLE],aiProfile:{name:'idle',rules:[{skillId:IDLE,priority:1,conditions:[{type:'always'}]}]}};
}
function one(spec,mode,seed){
  let p={...buildBalanceEntityV120(spec),id:'P',name:`V149 ${spec.label}`};
  if(mode==='v88')p=applyArtifactsPreComboV149(p,artifactState(5));
  if(mode==='v149')p=applyArtifactsV88ToEntity(p,artifactState(5));
  const kernel=runCombatKernelV3({registry,seed,entities:[p,target()],maxDuration:60,mode:'simulation'});
  assert.equal(kernel.engineVersion,'combat.v3');
  const battle=kernel.battle,a=analyzeBattle(battle).combatants.P??{};
  const artTriggers=battle.logs.filter(x=>x.type==='trigger'&&x.actorId==='P'&&x.data?.artifactRuntime==='artifact.v88'&&x.data?.artifactEvent==='artifactSkill');
  const markLogs=battle.logs.filter(x=>x.actorId==='P'&&x.type==='mark');
  return {damage:Number(a.damageDealt??0),triggers:artTriggers.length,lai:markLogs.filter(x=>String(x.message??'').includes('Lôi Ấn')).length,duration:battle.duration};
}
function avg(rows,key){return rows.reduce((n,x)=>n+Number(x[key]??0),0)/rows.length;}

const matrix=[];
for(const spec of ARCHETYPES){
  const noArtifact=SEEDS.map(seed=>one(spec,'none',seed));
  const preCombo=SEEDS.map(seed=>one(spec,'v88',seed));
  const v149=SEEDS.map(seed=>one(spec,'v149',seed));
  const baseDamage=avg(noArtifact,'damage'),v88Damage=avg(preCombo,'damage'),artifactDamage=avg(v149,'damage');
  const totalGainPct=(artifactDamage/Math.max(1,baseDamage)-1)*100;
  const contributionSharePct=(artifactDamage-baseDamage)/Math.max(1,artifactDamage)*100;
  const comboIncrementPct=(artifactDamage/Math.max(1,v88Damage)-1)*100;
  matrix.push({id:spec.id,label:spec.label,baseDamage,v88Damage,artifactDamage,totalGainPct,contributionSharePct,comboIncrementPct,triggers:avg(v149,'triggers'),lai:avg(v149,'lai')});
}

console.log('\nV149 PHÁP BẢO × V129 V3 FIVE-AXIS THREE-ARCHETYPE MATRIX');
for(const r of matrix)console.log(`${r.label.padEnd(24)} | BASE ${r.baseDamage.toFixed(0).padStart(10)} | V88 ${r.v88Damage.toFixed(0).padStart(10)} | V149 ${r.artifactDamage.toFixed(0).padStart(10)} | TOTAL ${r.totalGainPct.toFixed(1).padStart(6)}% | SHARE ${r.contributionSharePct.toFixed(1).padStart(5)}% | COMBO +${r.comboIncrementPct.toFixed(1)}% | trigger ${r.triggers.toFixed(1)}`);

assert.equal(matrix.length,3,'V149 must benchmark exactly three canonical current-authority archetypes');
for(const r of matrix){
  assert.ok(Object.values(r).filter(v=>typeof v==='number').every(Number.isFinite),`${r.label}: all balance metrics must be finite`);
  assert.ok(r.v88Damage>r.baseDamage,`${r.label}: canonical V88 artifact package must contribute real combat output`);
  assert.ok(r.artifactDamage>=r.v88Damage,`${r.label}: V149 combo must not silently reduce the canonical artifact package`);
  assert.ok(r.contributionSharePct>0&&r.contributionSharePct<60,`${r.label}: Pháp Bảo must remain below 60% of final sustained output in this cross-build benchmark`);
  assert.ok(r.comboIncrementPct>=0&&r.comboIncrementPct<20,`${r.label}: V149 combo layer must add less than 20% over the same pre-combo artifact package`);
  assert.ok(r.triggers>=3,`${r.label}: artifact skills must participate repeatedly in a 60s fight`);
  assert.ok(r.lai>=1,`${r.label}: Lôi Ấn setup must actually occur in shared combat runtime`);
}
const shares=matrix.map(x=>x.contributionSharePct);
assert.ok(Math.max(...shares)-Math.min(...shares)<25,'Artifact share of final output must not spread by >25pp across current-authority archetypes');
assert.ok(avg(matrix,'comboIncrementPct')>0,'V149 state-based combo must create measurable combat synergy on aggregate');

const state=artifactState(5),base=buildBalanceEntityV120(ARCHETYPES[0]),withRaw=applyArtifactsV88ToEntity({...base,id:'RAW'},state),raw=withRaw.combatBuildV117?.artifactV88?.raw;
assert.deepEqual(raw,{attack:65,physique:5,defense:15},'Bảo Hồn rank 5 remains small, explicit raw-only input in cross-build benchmark');
assert.equal(withRaw.combatBuildV117?.artifactV88?.comboV149?.hardSetLock,false,'Cross-build benchmark keeps combos state-based, never same-set locked');
assert.ok(withRaw.triggers.some(t=>t.runtimeV88?.itemId==='artifact.thunder_punishment_sword'&&t.effects.some(e=>e.type==='consumeMarkDamage'&&e.mark==='Lôi Ấn')),'Cross-build benchmark includes real Lôi Ấn consumer in shared CombatEngine trigger graph');

console.log('\nV149 ARTIFACT × V129 V3 FIVE-AXIS BALANCE PASS');
