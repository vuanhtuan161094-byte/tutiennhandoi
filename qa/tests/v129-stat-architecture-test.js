import assert from 'node:assert/strict';
import { combineBoundedPct, critLayerName, critProfile, dodgeProfile, heartProfile } from '../../dist/core/combat-rules.js';
import { CombatEngine } from '../../dist/core/combat.js';
import { battleDaoSkillsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';
import { EQUIPMENT_AFFIX_DEFINITIONS_V114, rollEquipmentAffixesV114 } from '../../dist/core/equipment-affix-v114.js';
import { buildManualCatalogV127, manualEffectMultiplierV127 } from '../../dist/core/manual-progression-v127.js';
import { SWORD_V2_PASSIVE_IDS, swordIntentBonusesV2 } from '../../dist/core/battle-dao-v2-runtime.js';
import { V128_DAO_INSCRIPTIONS, V128_EQUIPMENT_GEMS, daoInscriptionPowerV128, equipmentGemEffectV128, socketEquipmentGemV128, EQUIPMENT_GEM_BLANK_RESOURCE_V128 } from '../../dist/core/equipment-inscription-gem-v128.js';
import { combatPowerBreakdown } from '../../dist/core/personal-power.js';

let passed=0;
function test(name, fn){ fn(); passed++; console.log(`✓ [${passed}] ${name}`); }

function manualLineTreeMultiplier(id,tree){
  if(['attackFlat','powerPct'].includes(id)) return 1+(tree.offenseBaseEffectPct??0)/100;
  if(['physiqueFlat','hpFlat','hpPct','defenseFlat','defensePct'].includes(id)) return 1+(tree.defenseBaseEffectPct??0)/100;
  if(['critPct','critDamagePct','heartPct','heartDamagePct','armorPenPct','breakEffectPct'].includes(id)) return 1+(tree.offenseSecondaryEffectPct??0)/100;
  if(['damageReductionPct','dodgePct','controlResistPct','healingPct','shieldPct'].includes(id)) return 1+(tree.defenseSecondaryEffectPct??0)/100;
  return 1;
}
function manualTotals(tree={}){
  const total={};
  for(const d of buildManualCatalogV127()){
    const effect=manualEffectMultiplierV127({level:1000,advance:10},tree)*(1.2+Math.min(30,tree.nineUnityBonusPct??0)/100);
    for(const line of d.stats) total[line.id]=(total[line.id]??0)+line.value*effect*manualLineTreeMultiplier(line.id,tree);
  }
  return total;
}
function combatEntity(id, overrides={}){
  return {
    id,name:id,tags:[],statuses:[],pendingSetFlagsV117:{},breakDebuffUntil:0,
    baseStats:{maxHp:1000,maxSpirit:100,attack:100,defense:100,mobility:1,accuracy:1,actionSpeed:1,resolve:1,controlPower:0,critChancePct:0,critDamagePct:150,heartChancePct:0,heartDamagePct:125,dodgeChancePct:0,...overrides},
  };
}

test('Bạo Kích >100% creates real named layers instead of overflow conversion',()=>{
  const p=critProfile({critChancePct:250,critDamagePct:170});
  assert.equal(p.guaranteedLayers,2); assert.equal(p.nextLayerChancePct,50); assert.equal(p.damagePctPerLayer,170);
  assert.equal(critLayerName(1),'Bạo Kích'); assert.equal(critLayerName(2),'Trọng Bạo'); assert.equal(critLayerName(3),'Cực Bạo');
});

test('Né and Hội Tâm remain direct naturally bounded probabilities',()=>{
  assert.deepEqual(dodgeProfile({dodgeChancePct:137}),{rawPct:137,chancePct:100});
  const h=heartProfile({heartChancePct:126,heartDamagePct:140}); assert.equal(h.rawPct,126); assert.equal(h.chancePct,100); assert.equal(h.damagePct,140);
});

test('Tất Trúng skips Dodge but never suppresses Hội Tâm',()=>{
  const registry={status:()=>({})}; const engine=new CombatEngine(registry,123,[]);
  const target=combatEntity('target',{dodgeChancePct:100});
  let src=combatEntity('src',{heartChancePct:0});
  let r=engine.rollHit(src,target,{canHeart:true,canDodge:true,unavoidable:true,sourceTag:'ActiveHit',procCoefficient:0,skillId:'x'},0);
  assert.equal(r.hit,true); assert.equal(r.heart,false);
  src=combatEntity('src2',{heartChancePct:100});
  r=engine.rollHit(src,target,{canHeart:true,canDodge:true,unavoidable:true,sourceTag:'ActiveHit',procCoefficient:0,skillId:'x'},0);
  assert.equal(r.hit,true); assert.equal(r.heart,true);
});

test('Seven offensive Dao ultimates are authored Tất Trúng while Thể ultimate stays defensive',()=>{
  const ult=battleDaoSkillsV118.filter(x=>x.runtimeV117?.slotClass==='ultimate');
  assert.equal(ult.length,8);
  const body=ult.find(x=>x.id==='skill.dao.body.ultimate'); assert.ok(body); assert.equal(body.unavoidable,false);
  const offensive=ult.filter(x=>x.id!=='skill.dao.body.ultimate'); assert.equal(offensive.length,7);
  for(const s of offensive){ assert.equal(s.unavoidable,true,s.id); assert.match(s.description,/Tất Trúng/); }
});

test('Equipment Né is a rare affix source instead of a common default roll',()=>{
  const dodge=EQUIPMENT_AFFIX_DEFINITIONS_V114.find(x=>x.id==='affix.combat.dodge'); assert.ok(dodge); assert.ok((dodge.rollWeightMultiplier??1)<=0.2);
  const slots=['weapon','head','robe','belt','bracelet','gloves','boots','necklace','ring','talisman'];
  let hits=0,total=5000;
  for(let seed=1;seed<=total;seed++){
    const aff=rollEquipmentAffixesV114({slot:slots[seed%slots.length]},'heaven',seed);
    if(aff.some(x=>x.id==='affix.combat.dodge')) hits++;
  }
  const pct=hits*100/total; assert.ok(pct>=2 && pct<=10,`heaven dodge roll rate ${pct.toFixed(2)}%`);
});

test('261 Công Pháp keep Crit scalable but bound naturally capped secondary sources at authored origin',()=>{
  const defs=buildManualCatalogV127(); assert.equal(defs.length,261);
  const normal=manualTotals({});
  const max=manualTotals({offenseBaseEffectPct:80,defenseBaseEffectPct:80,offenseSecondaryEffectPct:50,defenseSecondaryEffectPct:50,milestoneBonusEffectPct:100,grandCompletionMultiplierBonus:1,nineUnityBonusPct:30});
  assert.ok(normal.critPct>100 && max.critPct>300,'Crit must remain meaningful beyond 100%');
  assert.ok(normal.dodgePct<10 && max.dodgePct<35);
  assert.ok(normal.heartPct<10 && max.heartPct<40);
  assert.ok(normal.armorPenPct<13 && max.armorPenPct<50);
  assert.ok(normal.damageReductionPct<10 && max.damageReductionPct<35);
  assert.ok(normal.controlResistPct<10 && max.controlResistPct<35);
  assert.ok(normal.accuracyPct>0 && normal.accuracyPct<10,'V152 precision manuals may grant bounded direct Accuracy');
  assert.ok(max.accuracyPct<25,'V152 Accuracy package must remain bounded at max manual progression');
  assert.equal(normal.actionSpeedPct??0,0,'V152 Công Pháp must never grant Action Speed');
  assert.equal(normal.controlPct??0,0);
});

test('Phụ Kiếm Kiếm Ý is precision/crit identity and never a global Công multiplier',()=>{
  const entity={
    combatBuildV117:{battleDaoV2Enabled:true,mainDaoId:'spell',secondaryDaoId:'sword',learnedDaoPassiveIdsV118:[SWORD_V2_PASSIVE_IDS.intent],passiveLevelsV125:{[SWORD_V2_PASSIVE_IDS.intent]:20}},
    battleDaoStateV2:{sword:{intent:{id:'swordIntent',stacks:12,cap:20,durationSeconds:12,expiresAt:999,nextDecayAt:undefined,decayEverySeconds:1,directActionCounter:0}}},
  };
  const b=swordIntentBonusesV2(entity,0); assert.equal(b.attackPct,0); assert.equal(Number(b.critChancePct.toFixed(6)),4.8); assert.equal(Number(b.heartChancePct.toFixed(6)),6);
});


test('Đạo Văn budgets remain bounded while retired Ngũ Hành Ngọc contributes zero effect',()=>{
  const ten=x=>x*10;
  const byId=Object.fromEntries(V128_DAO_INSCRIPTIONS.map(x=>[x.id,daoInscriptionPowerV128({id:x.id})]));
  assert.ok(ten(byId['dao.v128.army_breaker'].flatStats.armorPenPct)<=12.01);
  assert.ok(ten(byId['dao.v128.steady_mind'].flatStats.controlDurationReductionPct)<=15.01);
  assert.ok(ten(byId['dao.v128.heart'].flatStats.heartChancePct)<=8.01);
  assert.deepEqual(V128_EQUIPMENT_GEMS,[],'live Ngũ Hành Ngọc catalog must stay retired');
  for(const element of ['metal','water','wood','fire','earth']){
    assert.equal(equipmentGemEffectV128({element,level:5}),undefined,`${element} Ngọc must contribute zero live effect`);
  }
});

test('Retired Ngũ Hành Ngọc cannot be socketed and rejection is atomic',()=>{
  const item={id:'equipment.v129.gem.retired',name:'V129 Ngọc Legacy Test',grade:'breaker',gemSockets:[null,null,null,null]};
  const inv={[EQUIPMENT_GEM_BLANK_RESOURCE_V128]:10};
  const beforeItem=structuredClone(item), beforeInv=structuredClone(inv);
  assert.throws(()=>socketEquipmentGemV128(item,0,'fire',inv),/retire/i);
  assert.throws(()=>socketEquipmentGemV128(item,1,'metal',inv),/retire/i);
  assert.deepEqual(item,beforeItem,'retired socket attempts must not mutate legacy item payload');
  assert.deepEqual(inv,beforeInv,'retired socket attempts must not consume legacy Gem Blank inventory');
});


test('Secondary equipment stats are slot-scoped so one bounded stat cannot occupy all ten slots',()=>{
  const expected={
    'affix.combat.crit':['weapon','gloves','ring','head'],
    'affix.combat.heart':['head','necklace','ring','gloves'],
    'affix.combat.dodge':['boots','bracelet','gloves','ring'],
    'affix.combat.armor_pen':['weapon','gloves','ring'],
    'affix.combat.spirit_efficiency':['head','belt','necklace','ring','talisman'],
    'affix.combat.control_reduction':['head','robe','talisman','necklace'],
    'affix.combat.life_steal':['weapon','ring','bracelet'],
    'affix.combat.action_speed':['boots','bracelet','gloves','ring'],
    'affix.combat.max_spirit':['head','belt','necklace','ring','talisman'],
  };
  for(const [id,slots] of Object.entries(expected)){
    const d=EQUIPMENT_AFFIX_DEFINITIONS_V114.find(x=>x.id===id); assert.ok(d,id);
    assert.equal(d.commonAllowed,false,`${id} must not roll outside its authored lane`);
    assert.deepEqual([...d.allowedSlots].sort(),[...slots].sort(),id);
  }
});


test('Bounded percentage sources consume remaining room and are order-independent',()=>{
  assert.ok(Math.abs(combineBoundedPct(20,20,100)-36)<1e-9);
  assert.ok(Math.abs(combineBoundedPct(36,20,100)-48.8)<1e-9);
  const a=combineBoundedPct(combineBoundedPct(combineBoundedPct(0,20,100),30,100),10,100);
  const b=combineBoundedPct(combineBoundedPct(combineBoundedPct(0,10,100),20,100),30,100);
  assert.ok(Math.abs(a-b)<1e-9,`${a} vs ${b}`);
  const dr=combineBoundedPct(combineBoundedPct(0,40,80),40,80);
  assert.ok(dr<80 && dr>40,`DR ${dr}`);
});

test('Chiến Lực V129 ignores retired Accuracy/Mobility/ControlPower/Resolve and scores canonical resource/tempo axes',()=>{
  const a=combatEntity('a',{attack:120,defense:100,maxHp:1400,maxSpirit:150,actionSpeed:1.1,accuracy:1,mobility:1,controlPower:1,resolve:1});
  const b=combatEntity('b',{attack:120,defense:100,maxHp:1400,maxSpirit:150,actionSpeed:1.1,accuracy:1e9,mobility:1e9,controlPower:1e9,resolve:1e9});
  const pa=combatPowerBreakdown({stats:a.baseStats}), pb=combatPowerBreakdown({stats:b.baseStats});
  assert.equal(pa.score,pb.score); assert.equal(pa.resource,pb.resource); assert.equal(pa.tempo,pb.tempo);
  const moreSpirit=combatPowerBreakdown({stats:{...a.baseStats,maxSpirit:300,spiritEfficiencyPct:20}});
  const faster=combatPowerBreakdown({stats:{...a.baseStats,actionSpeed:1.5}});
  assert.ok(moreSpirit.resource>pa.resource); assert.ok(faster.tempo>pa.tempo);
});

console.log(`V129 STAT ARCHITECTURE: ${passed}/${passed} PASS`);
