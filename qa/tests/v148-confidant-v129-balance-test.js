import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { runCombatKernelV2 } from '../../dist/core/combat-kernel-v2.js';
import { analyzeBattle } from '../../dist/core/combat-analytics.js';
import { combatMaxHp } from '../../dist/core/combat-rules.js';
import { buildBalanceEntityV120, thematicAttireSetIdV120 } from '../simulations/balance-lab-v120.js';
import { CONFIDANTS_V87, confidantCombatTriggersV148 } from '../../dist/core/confidant-v87.js';

const registry=buildRegistry();
const IDLE='skill.v148.confidant.balance.idle';
const PRESSURE='skill.v148.confidant.balance.pressure';
if(!registry.skills.has(IDLE))registry.registerSkill({id:IDLE,name:'Mộc Nhân Tĩnh Tọa',description:'Không gây sát thương.',tags:['BalanceSimV129'],spiritCost:0,cooldown:0,castTime:0,recoveryTime:1,effects:[]});
if(!registry.skills.has(PRESSURE))registry.registerSkill({id:PRESSURE,name:'Áp Lực V129',description:'Đòn áp lực chuẩn cho benchmark Tri Kỷ.',tags:['BalanceSimV129'],spiritCost:0,cooldown:0,castTime:.6,recoveryTime:1,effects:[{type:'damage',coefficient:1.05,breakDamagePct:5}]});

const SPEC={dao:'sword',root:'metal',totalPotential:1000,potential:{power:.6,body:.2,defense:.2},daoHanh:70,attireSetId:thematicAttireSetIdV120('sword','metal'),attirePieces:4,grade:'immortal'};
const SEEDS=Array.from({length:8},(_,i)=>1481290+i*977);

function playerBase(){const e=buildBalanceEntityV120(SPEC);return {...e,id:'P',name:'V129 Player'};}
function baseStats(axis=1000){return{maxHp:axis*20,physique:axis,maxSpirit:1000,spiritStandard:1000,spiritRegenStandardPctPerSecond:3,attack:axis,defense:axis,mobility:100,accuracy:100,critChancePct:35,critPowerPerLayer:.5,heartChancePct:10,dodgeChancePct:10,controlPower:100,resolve:100,actionSpeed:1,elementalAffinities:{},elementalResistancesPct:{},dominantElement:'Metal'};}
function target(kind){
  const s=baseStats();
  if(kind==='offense')return{id:'E',combatModel:'locked-v1',name:'Mộc Nhân V129',tags:['BalanceSimV129'],stats:{...s,maxHp:s.maxHp*1200,physique:s.physique*1200,attack:1,defense:1000,critChancePct:0,heartChancePct:0,dodgeChancePct:0,controlPower:1},skillIds:[IDLE],aiProfile:{name:'idle',rules:[{skillId:IDLE,priority:1,conditions:[{type:'always'}]}]}};
  return{id:'E',combatModel:'locked-v1',name:'Hộ Pháp Áp Lực V129',tags:['BalanceSimV129','Boss'],stats:{...s,maxHp:s.maxHp*1200,physique:s.physique*1200,attack:1850,defense:1480,actionSpeed:1.02},skillIds:[PRESSURE],aiProfile:{name:'pressure',rules:[{skillId:PRESSURE,priority:1,conditions:[{type:'always'}]}]}};
}
function stateFor(id){return{activeCompanionId:id,items:{[id]:{owned:true,level:5100,stars:100,advance:4,specificFragments:0,confidantV148Migrated:true,confidantHeartV148:{assist:0,guard:0,harmony:0,raw:0}}}};}
function entityFor(id){const p=playerBase();return id?{...p,triggers:[...(p.triggers??[]),...confidantCombatTriggersV148(stateFor(id))]}:p;}
function one(kind,id,seed){
  const p=entityFor(id),battle=runCombatKernelV2({registry,seed,entities:[p,target(kind)],maxDuration:60,mode:'simulation'}).battle,a=analyzeBattle(battle).combatants.P??{};
  const fs=battle.finalState.P,maxHp=Math.max(1,combatMaxHp(p.stats));
  const triggers=battle.logs.filter(x=>x.type==='trigger'&&x.actorId==='P'&&x.data?.confidantRuntime==='confidant.v148');
  return{damage:Number(a.damageDealt??0),healing:Number(a.healingDone??0),shield:Number(a.shieldAbsorbed??0),controls:Number(a.controlApplications??0),survival:(fs.alive?60:Math.min(60,battle.duration))+(fs.alive?Math.max(0,Math.min(100,fs.hp/maxHp*100))*.15:0),assist:triggers.filter(x=>x.data?.confidantEvent==='assist').length,guard:triggers.filter(x=>x.data?.confidantEvent==='guard').length,harmony:triggers.filter(x=>x.data?.confidantEvent==='harmony').length};
}
function avg(rows,key){return rows.reduce((n,x)=>n+Number(x[key]??0),0)/rows.length;}
function sample(kind,id){return SEEDS.map(seed=>one(kind,id,seed));}
const baseOff=sample('offense'),basePressure=sample('pressure');
const b={offDamage:avg(baseOff,'damage'),pressureDamage:avg(basePressure,'damage'),survival:avg(basePressure,'survival'),controls:avg(basePressure,'controls')};
const rows=[];
for(const c of CONFIDANTS_V87){
  const off=sample('offense',c.id),pressure=sample('pressure',c.id);
  rows.push({id:c.id,name:c.name,grade:c.grade,role:c.combatStyle,offenseGainPct:(avg(off,'damage')/Math.max(1,b.offDamage)-1)*100,pressureGainPct:(avg(pressure,'damage')/Math.max(1,b.pressureDamage)-1)*100,survivalDelta:avg(pressure,'survival')-b.survival,healPerBattle:avg(pressure,'healing'),shieldAbsorbPerBattle:avg(pressure,'shield'),controlDelta:avg(pressure,'controls')-b.controls,assistPer60:avg([...off,...pressure],'assist')/2,guardPerBattle:avg(pressure,'guard'),harmonyPer60:avg([...off,...pressure],'harmony')/2});
}
console.log('\nV148 TRI KỶ × V129 COMBAT BENCHMARK');
console.log(`Baseline offense=${b.offDamage.toFixed(0)} dmg/60s · pressure=${b.pressureDamage.toFixed(0)} dmg/60s · survival=${b.survival.toFixed(2)}`);
for(const r of rows)console.log(`${r.id} ${r.name.padEnd(10)} | ${r.role.padEnd(8)} | OFF ${r.offenseGainPct.toFixed(1).padStart(6)}% | PRESS ${r.pressureGainPct.toFixed(1).padStart(6)}% | SURV ${r.survivalDelta.toFixed(2).padStart(6)} | CTRL ${r.controlDelta.toFixed(2).padStart(5)} | A ${r.assistPer60.toFixed(2)} G ${r.guardPerBattle.toFixed(2)} H ${r.harmonyPer60.toFixed(2)}`);

assert.equal(rows.length,8);
for(const r of rows){
  assert.ok(Object.values(r).filter(v=>typeof v==='number').every(Number.isFinite),`${r.name}: benchmark metrics must be finite`);
  assert.ok(r.assistPer60>0,`${r.name}: Assist must fire in V129 benchmark`);
  assert.ok(r.harmonyPer60>0,`${r.name}: Harmony must be reachable in offense/pressure union`);
  assert.ok(r.harmonyPer60<=8,`${r.name}: Harmony cannot spam beyond 8/60s average`);
}
const byId=Object.fromEntries(rows.map(x=>[x.id,x]));
assert.ok(byId['companion.7'].offenseGainPct>byId['companion.1'].offenseGainPct,'Yến Vũ burst offense must exceed Mộc Quỳnh sustain offense');
assert.ok(byId['companion.4'].offenseGainPct>byId['companion.3'].offenseGainPct,'Tạ Vân burst offense must exceed Hạ Liên support offense');
assert.ok(byId['companion.1'].survivalDelta>=byId['companion.7'].survivalDelta,'Mộc Quỳnh sustain survival must not trail Yến Vũ burst');
console.log('\nV148 CONFIDANT V129 BALANCE PROBE PASS');
