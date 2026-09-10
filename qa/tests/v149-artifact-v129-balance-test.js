import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { runCombatKernelV2 } from '../../dist/core/combat-kernel-v2.js';
import { analyzeBattle } from '../../dist/core/combat-analytics.js';
import { applyArtifactsV88ToEntity, ARTIFACTS_V88 } from '../../dist/core/artifact-v88.js';
import { buildBalanceEntityV120, thematicAttireSetIdV120 } from '../simulations/balance-lab-v120.js';

const registry=buildRegistry();
const IDLE='skill.v149.artifact.balance.idle';
if(!registry.skills.has(IDLE))registry.registerSkill({id:IDLE,name:'Mộc Nhân Tĩnh Tọa',description:'Không gây sát thương.',tags:['BalanceSimV149'],spiritCost:0,cooldown:0,castTime:0,recoveryTime:1,effects:[]});

const ARCHETYPES=[
  {id:'sword-metal',label:'Kiếm–Kim · thiên Công',dao:'sword',root:'metal',totalPotential:1000,potential:{power:.65,body:.20,defense:.15},daoHanh:70,attirePieces:4,grade:'immortal'},
  {id:'body-earth',label:'Thể–Thổ · sinh tồn',dao:'body',root:'earth',totalPotential:1000,potential:{power:.20,body:.50,defense:.30},daoHanh:70,attirePieces:4,grade:'immortal'},
  {id:'mind-water',label:'Tâm–Thủy · khống chế',dao:'mind',root:'water',totalPotential:1000,potential:{power:.40,body:.20,defense:.40},daoHanh:70,attirePieces:4,grade:'immortal'},
].map(x=>({...x,attireSetId:thematicAttireSetIdV120(x.dao,x.root)}));

const LOADOUT=[
  'artifact.thunder_guiding_mirror',
  'artifact.thunder_punishment_sword',
  'artifact.purple_mansion_lamp',
  'artifact.starfall_sword_box',
];
const SEEDS=[1491291,1492268,1493245];

function artifactState(rank=5){
  const items=Object.fromEntries(ARTIFACTS_V88.map(d=>[d.id,{owned:true,level:100,advance:4,specificFragments:0,artifactV149:{schema:'artifact.production.v149',baoHonRank:rank}}]));
  return {
    schema:'collection-progression.v12316',
    items,
    activeArtifactIds:[...LOADOUT],
    genericFragments:{manual:0,artifact:0,pet:0,companion:0},
    cave:{level:1,facilities:[{id:'artifact',level:10}]},
    economyV12325:{relicV88Migrated:true,extraItems:{},activeRelicId:undefined},
    artifactV88Migrated:true,
  };
}
function target(){
  const axis=1000;
  return {id:'E',combatModel:'locked-v1',name:'Mộc Nhân V149',tags:['BalanceSimV149'],stats:{maxHp:axis*20*1500,physique:axis*1500,maxSpirit:1000,spiritStandard:1000,spiritRegenStandardPctPerSecond:0,attack:1,defense:axis,mobility:1,accuracy:1,critChancePct:0,critPowerPerLayer:.5,heartChancePct:0,dodgeChancePct:0,controlPower:1,resolve:100,actionSpeed:1,elementalAffinities:{},elementalResistancesPct:{},dominantElement:'Earth'},skillIds:[IDLE],aiProfile:{name:'idle',rules:[{skillId:IDLE,priority:1,conditions:[{type:'always'}]}]}};
}
function one(spec,withArtifacts,seed){
  let p=buildBalanceEntityV120(spec);
  p={...p,id:'P',name:`V149 ${spec.label}`};
  if(withArtifacts)p=applyArtifactsV88ToEntity(p,artifactState(5));
  const battle=runCombatKernelV2({registry,seed,entities:[p,target()],maxDuration:60,mode:'simulation'}).battle;
  const a=analyzeBattle(battle).combatants.P??{};
  const artTriggers=battle.logs.filter(x=>x.type==='trigger'&&x.actorId==='P'&&x.data?.artifactRuntime==='artifact.v88'&&x.data?.artifactEvent==='artifactSkill');
  const markLogs=battle.logs.filter(x=>x.actorId==='P'&&x.type==='mark');
  return {damage:Number(a.damageDealt??0),triggers:artTriggers.length,lai:markLogs.filter(x=>String(x.message??'').includes('Lôi Ấn')).length,duration:battle.duration};
}
function avg(rows,key){return rows.reduce((n,x)=>n+Number(x[key]??0),0)/rows.length;}

const matrix=[];
for(const spec of ARCHETYPES){
  const base=SEEDS.map(seed=>one(spec,false,seed));
  const art=SEEDS.map(seed=>one(spec,true,seed));
  const baseDamage=avg(base,'damage'),artifactDamage=avg(art,'damage');
  const gainPct=(artifactDamage/Math.max(1,baseDamage)-1)*100;
  const row={id:spec.id,label:spec.label,baseDamage,artifactDamage,gainPct,triggers:avg(art,'triggers'),lai:avg(art,'lai')};
  matrix.push(row);
}

console.log('\nV149 PHÁP BẢO × V129 THREE-ARCHETYPE MATRIX');
for(const r of matrix)console.log(`${r.label.padEnd(24)} | BASE ${r.baseDamage.toFixed(0).padStart(10)} | ART ${r.artifactDamage.toFixed(0).padStart(10)} | GAIN ${r.gainPct.toFixed(1).padStart(6)}% | trigger ${r.triggers.toFixed(1)} | Lôi Ấn ${r.lai.toFixed(1)}`);

assert.equal(matrix.length,3,'V149 must benchmark exactly three canonical V129 archetypes');
for(const r of matrix){
  assert.ok([r.baseDamage,r.artifactDamage,r.gainPct,r.triggers,r.lai].every(Number.isFinite),`${r.label}: all balance metrics must be finite`);
  assert.ok(r.artifactDamage>r.baseDamage,`${r.label}: equipped production artifacts must contribute real combat output`);
  assert.ok(r.gainPct>0&&r.gainPct<120,`${r.label}: artifact package must stay inside broad anti-runaway envelope`);
  assert.ok(r.triggers>=3,`${r.label}: artifact skills must participate repeatedly in a 60s fight`);
  assert.ok(r.lai>=1,`${r.label}: Lôi Ấn setup must actually occur in shared combat runtime`);
}
const gains=matrix.map(x=>x.gainPct),max=Math.max(...gains),min=Math.min(...gains);
assert.ok(max-min<55,'V149 artifact package must not create >55pp gain spread across V129 archetypes');

const state=artifactState(5);
const base=buildBalanceEntityV120(ARCHETYPES[0]);
const withRaw=applyArtifactsV88ToEntity({...base,id:'RAW'},state);
const raw=withRaw.combatBuildV117?.artifactV88?.raw;
assert.deepEqual(raw,{attack:65,physique:5,defense:15},'Bảo Hồn rank 5 remains small, explicit raw-only input in cross-build benchmark');
assert.equal(withRaw.combatBuildV117?.artifactV88?.comboV149?.hardSetLock,false,'Cross-build benchmark keeps combos state-based, never same-set locked');
assert.ok(withRaw.triggers.some(t=>t.runtimeV88?.itemId==='artifact.thunder_punishment_sword'&&t.effects.some(e=>e.type==='consumeMarkDamage'&&e.mark==='Lôi Ấn')),'Cross-build benchmark includes real Lôi Ấn consumer in shared CombatEngine trigger graph');

console.log('\nV149 ARTIFACT × V129 THREE-ARCHETYPE BALANCE PASS');
