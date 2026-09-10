import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { runCombatKernelV2 } from '../../dist/core/combat-kernel-v2.js';
import { analyzeBattle } from '../../dist/core/combat-analytics.js';
import { ARTIFACTS_V88, RELICS_V88, applyArtifactsV88ToEntity } from '../../dist/core/artifact-v88.js';
import { buildBalanceEntityV120, thematicAttireSetIdV120 } from '../simulations/balance-lab-v120.js';

const registry=buildRegistry();
const IDLE='skill.v151.relic.balance.idle';
if(!registry.skills.has(IDLE))registry.registerSkill({id:IDLE,name:'Mộc Nhân V151',description:'Không gây sát thương.',tags:['BalanceSimV151'],spiritCost:0,cooldown:0,castTime:0,recoveryTime:1,effects:[]});

const ARCHETYPES=[
  {id:'sword-metal',label:'Kiếm–Kim',dao:'sword',root:'metal',totalPotential:1000,potential:{power:.65,body:.20,defense:.15},daoHanh:70,attirePieces:4,grade:'immortal'},
  {id:'body-earth',label:'Thể–Thổ',dao:'body',root:'earth',totalPotential:1000,potential:{power:.20,body:.50,defense:.30},daoHanh:70,attirePieces:4,grade:'immortal'},
  {id:'mind-water',label:'Tâm–Thủy',dao:'mind',root:'water',totalPotential:1000,potential:{power:.40,body:.20,defense:.40},daoHanh:70,attirePieces:4,grade:'immortal'},
].map(x=>({...x,attireSetId:thematicAttireSetIdV120(x.dao,x.root)}));
const LOADOUT=['artifact.thunder_guiding_mirror','artifact.thunder_punishment_sword','artifact.purple_mansion_lamp','artifact.starfall_sword_box'];
const SEEDS=[1511291,1512268,1513245];

function state(activeRelicId){
  return {
    schema:'collection-progression.v12316',
    items:Object.fromEntries(ARTIFACTS_V88.map(d=>[d.id,{owned:true,level:100,advance:4,specificFragments:0,artifactV149:{schema:'artifact.production.v149',baoHonRank:5}}])),
    activeArtifactIds:[...LOADOUT],
    genericFragments:{manual:0,artifact:0,pet:0,companion:0},
    cave:{level:1,facilities:[{id:'artifact',level:10}]},
    economyV12325:{relicV88Migrated:true,extraItems:Object.fromEntries(RELICS_V88.map(d=>[d.id,{owned:true,level:100,advance:4,specificFragments:0}])),activeRelicId},
    artifactV88Migrated:true,
  };
}
function target(){const axis=1000;return{id:'E',combatModel:'locked-v1',name:'Mộc Nhân V151',tags:['BalanceSimV151'],stats:{maxHp:axis*20*1500,physique:axis*1500,maxSpirit:1000,spiritStandard:1000,spiritRegenStandardPctPerSecond:0,attack:1,defense:axis,mobility:1,accuracy:1,critChancePct:0,critPowerPerLayer:.5,heartChancePct:0,dodgeChancePct:0,controlPower:1,resolve:100,actionSpeed:1,elementalAffinities:{},elementalResistancesPct:{},dominantElement:'Earth'},skillIds:[IDLE],aiProfile:{name:'idle',rules:[{skillId:IDLE,priority:1,conditions:[{type:'always'}]}]}};}
function run(spec,relicId,seed){let p=buildBalanceEntityV120(spec);p={...p,id:'P',name:`V151 ${spec.label}`};p=applyArtifactsV88ToEntity(p,state(relicId));const battle=runCombatKernelV2({registry,seed,entities:[p,target()],maxDuration:60,mode:'simulation'}).battle;const a=analyzeBattle(battle).combatants.P??{};const relicTriggers=battle.logs.filter(x=>x.type==='trigger'&&x.actorId==='P'&&x.data?.artifactRuntime==='artifact.v88'&&x.data?.artifactEvent==='relicRule'&&x.data?.artifactId===relicId);return{damage:Number(a.damageDealt??0),relicTriggers:relicTriggers.length};}
const avg=(rows,key)=>rows.reduce((n,x)=>n+Number(x[key]??0),0)/rows.length;
const rows=[];
for(const spec of ARCHETYPES){
  const baseRuns=SEEDS.map(seed=>run(spec,undefined,seed));
  const baseDamage=avg(baseRuns,'damage');
  for(const relic of RELICS_V88){
    const runs=SEEDS.map(seed=>run(spec,relic.id,seed));
    const damage=avg(runs,'damage');
    rows.push({build:spec.label,relicId:relic.id,relicName:relic.name,baseDamage,damage,incrementPct:(damage/Math.max(1,baseDamage)-1)*100,triggers:avg(runs,'relicTriggers')});
  }
}
console.log('\nV151 CHÍ BẢO × V129 ONE-SLOT MATRIX');
for(const r of rows)console.log(`${r.build.padEnd(10)} | ${r.relicName.padEnd(18)} | ${r.damage.toFixed(0).padStart(9)} | Δ ${r.incrementPct.toFixed(1).padStart(5)}% | trigger ${r.triggers.toFixed(1)}`);

assert.equal(rows.length,24,'V151 must benchmark 8 relics across 3 canonical V129 archetypes');
for(const r of rows){
  assert.ok(Number.isFinite(r.damage)&&Number.isFinite(r.incrementPct)&&r.damage>0,`${r.build}/${r.relicName}: metrics must be finite and positive`);
  assert.ok(r.incrementPct<15,`${r.build}/${r.relicName}: one Chí Bảo must not add >=15% sustained DPS over the same Pháp Bảo build`);
}
for(const id of ['relic.4','relic.5']){
  const subset=rows.filter(x=>x.relicId===id);
  assert.ok(subset.every(x=>x.incrementPct>0),`${id}: authored offensive/tempo relic must create measurable output on all three builds`);
  assert.ok(subset.every(x=>x.triggers>=2),`${id}: authored offensive/tempo relic must repeatedly participate in a 60s fight`);
}
for(const id of ['relic.1','relic.2','relic.6','relic.8']){
  const subset=rows.filter(x=>x.relicId===id);
  assert.ok(subset.every(x=>Math.abs(x.incrementPct)<0.001),`${id}: defensive/situational relic must not grant free idle-target sustained DPS`);
}
const tempoMax=Math.max(...rows.filter(x=>x.relicId==='relic.4').map(x=>x.incrementPct));
const resonanceMax=Math.max(...rows.filter(x=>x.relicId==='relic.5').map(x=>x.incrementPct));
assert.ok(tempoMax<12&&resonanceMax<12,'Tempo/cộng hưởng relics stay below the stricter 12% sustained-DPS soft ceiling');
console.log('\nV151 RELIC × V129 BALANCE PASS');
