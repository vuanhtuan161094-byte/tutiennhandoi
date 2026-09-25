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

const ARCHETYPES=[
  {id:'sword-metal',label:'Kiếm–Kim · thiên Công',dao:'sword',root:'metal',totalPotential:1000,potential:{power:.65,body:.20,defense:.15},daoHanh:70,attirePieces:4,grade:'immortal'},
  {id:'body-earth',label:'Thể–Thổ · sinh tồn',dao:'body',root:'earth',totalPotential:1000,potential:{power:.20,body:.50,defense:.30},daoHanh:70,attirePieces:4,grade:'immortal'},
  {id:'mind-water',label:'Tâm–Thủy · khống chế',dao:'mind',root:'water',totalPotential:1000,potential:{power:.40,body:.20,defense:.40},daoHanh:70,attirePieces:4,grade:'immortal'},
].map(x=>({...x,attireSetId:thematicAttireSetIdV120(x.dao,x.root)}));
const SEEDS=Array.from({length:6},(_,i)=>1481290+i*977);

function playerBase(spec){const e=buildBalanceEntityV120(spec);return {...e,id:'P',name:`V129 ${spec.label}`};}
function baseStats(axis=1000){return{maxHp:axis*20,physique:axis,maxSpirit:1000,spiritStandard:1000,spiritRegenStandardPctPerSecond:3,attack:axis,defense:axis,mobility:100,accuracy:100,critChancePct:35,critPowerPerLayer:.5,heartChancePct:10,dodgeChancePct:10,controlPower:100,resolve:100,actionSpeed:1,elementalAffinities:{},elementalResistancesPct:{},dominantElement:'Metal'};}
function target(kind){
  const s=baseStats();
  if(kind==='offense')return{id:'E',combatModel:'locked-v1',name:'Mộc Nhân V129',tags:['BalanceSimV129'],stats:{...s,maxHp:s.maxHp*1200,physique:s.physique*1200,attack:1,defense:1000,critChancePct:0,heartChancePct:0,dodgeChancePct:0,controlPower:1},skillIds:[IDLE],aiProfile:{name:'idle',rules:[{skillId:IDLE,priority:1,conditions:[{type:'always'}]}]}};
  return{id:'E',combatModel:'locked-v1',name:'Hộ Pháp Áp Lực V129',tags:['BalanceSimV129','Boss'],stats:{...s,maxHp:s.maxHp*1200,physique:s.physique*1200,attack:1850,defense:1480,actionSpeed:1.02},skillIds:[PRESSURE],aiProfile:{name:'pressure',rules:[{skillId:PRESSURE,priority:1,conditions:[{type:'always'}]}]}};
}
function stateFor(id){return{activeCompanionId:id,items:{[id]:{owned:true,level:5100,stars:100,advance:4,specificFragments:0,confidantV148Migrated:true,confidantHeartV148:{assist:0,guard:0,harmony:0,raw:0}}}};}
function entityFor(spec,id){const p=playerBase(spec);return id?{...p,triggers:[...(p.triggers??[]),...confidantCombatTriggersV148(stateFor(id))]}:p;}
function one(spec,kind,id,seed){
  const p=entityFor(spec,id),battle=runCombatKernelV2({registry,seed,entities:[p,target(kind)],maxDuration:60,mode:'simulation'}).battle,a=analyzeBattle(battle).combatants.P??{};
  const fs=battle.finalState.P,maxHp=Math.max(1,combatMaxHp(p.stats));
  const triggers=battle.logs.filter(x=>x.type==='trigger'&&x.actorId==='P'&&x.data?.confidantRuntime==='confidant.v148');
  return{damage:Number(a.damageDealt??0),healing:Number(a.healingDone??0),shield:Number(a.shieldAbsorbed??0),controls:Number(a.controlApplications??0),survival:(fs.alive?60:Math.min(60,battle.duration))+(fs.alive?Math.max(0,Math.min(100,fs.hp/maxHp*100))*.15:0),assist:triggers.filter(x=>x.data?.confidantEvent==='assist').length,guard:triggers.filter(x=>x.data?.confidantEvent==='guard').length,harmony:triggers.filter(x=>x.data?.confidantEvent==='harmony').length};
}
function avg(rows,key){return rows.reduce((n,x)=>n+Number(x[key]??0),0)/rows.length;}
function sample(spec,kind,id){return SEEDS.map(seed=>one(spec,kind,id,seed));}
function benchmark(spec){
  const baseOff=sample(spec,'offense'),basePressure=sample(spec,'pressure');
  const b={offDamage:avg(baseOff,'damage'),pressureDamage:avg(basePressure,'damage'),survival:avg(basePressure,'survival'),controls:avg(basePressure,'controls')};
  const rows=[];
  for(const c of CONFIDANTS_V87){
    const off=sample(spec,'offense',c.id),pressure=sample(spec,'pressure',c.id);
    rows.push({id:c.id,name:c.name,grade:c.grade,role:c.combatStyle,offenseGainPct:(avg(off,'damage')/Math.max(1,b.offDamage)-1)*100,pressureGainPct:(avg(pressure,'damage')/Math.max(1,b.pressureDamage)-1)*100,survivalDelta:avg(pressure,'survival')-b.survival,healPerBattle:avg(pressure,'healing'),shieldAbsorbPerBattle:avg(pressure,'shield'),controlDelta:avg(pressure,'controls')-b.controls,assistPer60:avg([...off,...pressure],'assist')/2,guardPerBattle:avg(pressure,'guard'),harmonyPer60:avg([...off,...pressure],'harmony')/2});
  }
  return{spec,baseline:b,rows};
}

const matrices=ARCHETYPES.map(benchmark);
console.log('\nV148 TRI KỶ × V129 THREE-ARCHETYPE COMBAT MATRIX');
for(const m of matrices){
  console.log(`\n[${m.spec.label}] baseline offense=${m.baseline.offDamage.toFixed(0)} · pressure=${m.baseline.pressureDamage.toFixed(0)} · survival=${m.baseline.survival.toFixed(2)}`);
  for(const r of m.rows)console.log(`${r.id} ${r.name.padEnd(10)} | ${r.role.padEnd(8)} | OFF ${r.offenseGainPct.toFixed(1).padStart(6)}% | PRESS ${r.pressureGainPct.toFixed(1).padStart(6)}% | SURV ${r.survivalDelta.toFixed(2).padStart(6)} | CTRL ${r.controlDelta.toFixed(2).padStart(5)} | A ${r.assistPer60.toFixed(2)} G ${r.guardPerBattle.toFixed(2)} H ${r.harmonyPer60.toFixed(2)}`);
}

assert.equal(matrices.length,3);
for(const m of matrices){
  assert.equal(m.rows.length,8,`${m.spec.label}: roster must remain exactly 8`);
  const byId=Object.fromEntries(m.rows.map(x=>[x.id,x]));
  for(const r of m.rows){
    assert.ok(Object.values(r).filter(v=>typeof v==='number').every(Number.isFinite),`${m.spec.label}/${r.name}: benchmark metrics must be finite`);
    assert.ok(r.assistPer60>0,`${m.spec.label}/${r.name}: Assist must fire`);
    assert.ok(r.harmonyPer60>0,`${m.spec.label}/${r.name}: Harmony must be reachable`);
    assert.ok(r.harmonyPer60<=8,`${m.spec.label}/${r.name}: Harmony cannot spam beyond 8/60s`);
    assert.ok(r.offenseGainPct>-5&&r.offenseGainPct<55,`${m.spec.label}/${r.name}: offense gain outside safety envelope`);
  }
  assert.ok(byId['companion.7'].offenseGainPct>byId['companion.1'].offenseGainPct,`${m.spec.label}: Yến Vũ burst offense must exceed Mộc Quỳnh sustain offense`);
  assert.ok(byId['companion.4'].offenseGainPct>byId['companion.3'].offenseGainPct,`${m.spec.label}: Tạ Vân burst must exceed Hạ Liên support offense`);
  // F five-stat/hybrid builds may create build-specific support synergy. The aggregate
  // role envelope below remains authoritative; do not force one companion ordering in every archetype.
  assert.ok(byId['companion.5'].offenseGainPct<=32,`${m.spec.label}: Lạc Dao support cannot drift into burst damage`);
  assert.ok(byId['companion.1'].survivalDelta>=byId['companion.7'].survivalDelta,`${m.spec.label}: Mộc Quỳnh sustain survival must not trail Yến Vũ burst`);
  assert.ok(byId['companion.8'].offenseGainPct<=28,`${m.spec.label}: Bạch Tố Tâm guard cannot drift into burst damage`);
  assert.ok(byId['companion.2'].controlDelta>=9,`${m.spec.label}: Ninh Tố must preserve per-archetype control identity`);
  assert.ok(byId['companion.6'].controlDelta>=8,`${m.spec.label}: Cố Thanh Hà must preserve control identity`);
}

const aggregate=Object.fromEntries(CONFIDANTS_V87.map(c=>[c.id,{name:c.name,role:c.combatStyle,offense:avg(matrices.map(m=>m.rows.find(x=>x.id===c.id)),'offenseGainPct'),pressure:avg(matrices.map(m=>m.rows.find(x=>x.id===c.id)),'pressureGainPct'),survival:avg(matrices.map(m=>m.rows.find(x=>x.id===c.id)),'survivalDelta'),control:avg(matrices.map(m=>m.rows.find(x=>x.id===c.id)),'controlDelta')} ]));
console.log('\n[AVERAGE ACROSS 3 ARCHETYPES]');
for(const c of CONFIDANTS_V87){const r=aggregate[c.id];console.log(`${c.name.padEnd(10)} | ${r.role.padEnd(8)} | OFF ${r.offense.toFixed(1).padStart(6)}% | PRESS ${r.pressure.toFixed(1).padStart(6)}% | SURV ${r.survival.toFixed(2).padStart(6)} | CTRL ${r.control.toFixed(2).padStart(5)}`);}
assert.ok(aggregate['companion.7'].offense>=27&&aggregate['companion.7'].offense<=42,'Yến Vũ aggregate burst envelope 27–42%');
assert.ok(aggregate['companion.4'].offense>=24&&aggregate['companion.4'].offense<=40,'Tạ Vân aggregate burst envelope 24–40%');
assert.ok(aggregate['companion.7'].offense>aggregate['companion.4'].offense,'Yến Vũ immortal burst must lead Tạ Vân on aggregate, while build-specific armor-fracture synergy may vary');
assert.ok(aggregate['companion.4'].offense>aggregate['companion.3'].offense&&aggregate['companion.4'].offense>aggregate['companion.5'].offense,'Tạ Vân aggregate burst must remain above supports');
assert.ok(aggregate['companion.3'].offense>=8&&aggregate['companion.3'].offense<=26,'Hạ Liên aggregate support envelope 8–26%');
assert.ok(aggregate['companion.5'].offense>=8&&aggregate['companion.5'].offense<=26,'Lạc Dao aggregate support envelope 8–26%');
assert.ok(aggregate['companion.6'].offense>=8&&aggregate['companion.6'].offense<=22,'Cố Thanh Hà aggregate control offense envelope 8–22%');
assert.ok(aggregate['companion.8'].offense>=3&&aggregate['companion.8'].offense<=22,'Bạch Tố Tâm aggregate guard envelope 3–22%');
assert.ok(aggregate['companion.2'].control>=10,'Ninh Tố aggregate control must stay >=10');
assert.ok(aggregate['companion.6'].control>=8,'Cố Thanh Hà aggregate control must stay >=8');
assert.ok(aggregate['companion.1'].survival>=8,'Mộc Quỳnh aggregate sustain survival must stay >=8');
assert.ok(aggregate['companion.8'].survival>=3,'Bạch Tố Tâm aggregate guard survival must stay >=3');
assert.ok(aggregate['companion.1'].survival>aggregate['companion.8'].survival&&aggregate['companion.8'].survival>aggregate['companion.7'].survival,'aggregate survival hierarchy must remain sustain > guard > burst');
assert.ok(aggregate['companion.8'].offense<aggregate['companion.3'].offense&&aggregate['companion.8'].offense<aggregate['companion.5'].offense,'guard offense must remain below support offense on aggregate');
console.log('\nV148 CONFIDANT V129 THREE-ARCHETYPE MATRIX PASS');
