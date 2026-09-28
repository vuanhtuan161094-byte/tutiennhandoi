import assert from 'node:assert/strict';
import { EQUIPMENT_AFFIX_DEFINITIONS_V114 } from '../../dist/core/equipment-affix-v114.js';
import { ROOT_ORIGIN_COMBAT_DEFINITIONS_V132 } from '../../dist/core/root-origin-combat-v132.js';
import { SPIRIT_BEAST_SPECIES_V86, spiritBeastBondSummaryV86 } from '../../dist/core/spirit-beast-v86.js';
import { LIVE_EQUIPMENT_SET_CATALOG_V12310, activeEquipmentSetMechanicsV116 } from '../../dist/core/equipment-set-v116.js';
import { V128_DAO_INSCRIPTIONS, V128_EQUIPMENT_GEMS, daoInscriptionPowerV128, equipmentGemEffectV128 } from '../../dist/core/equipment-inscription-gem-v128.js';

let passed=0; const test=(name,fn)=>{fn();passed++;console.log(`✓ [${passed}] ${name}`)};
const byId=id=>EQUIPMENT_AFFIX_DEFINITIONS_V114.find(x=>x.id===id);

test('Specialized equipment percentages are restricted to authored slots',()=>{
  const scoped=['affix.combat.crit','affix.combat.heart','affix.combat.dodge','affix.combat.armor_pen','affix.combat.spirit_efficiency','affix.combat.control_reduction','affix.combat.life_steal','affix.combat.action_speed','affix.combat.max_spirit'];
  for(const id of scoped){ const d=byId(id); assert.ok(d); assert.equal(d.commonAllowed,false,id); assert.ok(d.allowedSlots?.length>=3 && d.allowedSlots.length<=5,id); }
  assert.deepEqual([...byId('affix.combat.dodge').allowedSlots].sort(),['boots','bracelet','gloves','ring'].sort());
  assert.deepEqual([...byId('affix.combat.armor_pen').allowedSlots].sort(),['weapon','gloves','ring'].sort());
});

test('Five active Căn Nguyên choices cannot stack duplicate same-root static bonuses',()=>{
  for(const root of ['metal','wood','water','fire','earth']){
    const defs=ROOT_ORIGIN_COMBAT_DEFINITIONS_V132.filter(x=>x.root===root);
    assert.equal(defs.length,6,root);
  }
  const water=ROOT_ORIGIN_COMBAT_DEFINITIONS_V132.filter(x=>x.root==='water');
  assert.ok(Math.max(...water.map(x=>x.static?.dodgePct??0))<=4,'one active Water origin keeps Dodge bounded');
  const metal=ROOT_ORIGIN_COMBAT_DEFINITIONS_V132.filter(x=>x.root==='metal');
  assert.ok(Math.max(...metal.map(x=>x.static?.armorPenPct??0))<=6,'one active Metal origin keeps Xuyên bounded');
});

test('V147 Linh Thú collection gives owned raw but equipped-only percentage',()=>{
  const items=Object.fromEntries(SPIRIT_BEAST_SPECIES_V86.map(x=>[x.id,{owned:true,level:1000,advance:5,stars:20,spiritBeastV147Migrated:true}]));
  const inactive=spiritBeastBondSummaryV86({items});
  assert.equal(inactive.owned,8);
  assert.equal(inactive.powerPct,0);assert.equal(inactive.bodyPct,0);assert.equal(inactive.defensePct,0);
  assert.ok(inactive.attackFlat>=1000&&inactive.hpFlat>=10000&&inactive.defenseFlat>=900,'all-owned raw collection must stay meaningful');
  const active=spiritBeastBondSummaryV86({items,activePetId:'pet.7'});
  assert.deepEqual({p:active.powerPct,b:active.bodyPct,d:active.defensePct},{p:5.3,b:3.1,d:2.5});
});

test('Ngũ Hành equipment Sets are retired while Căn Nguyên remains an independent live source',()=>{
  assert.deepEqual(LIVE_EQUIPMENT_SET_CATALOG_V12310,[],'no live equipment Set catalog may survive retirement');
  const legacySetState={items:[{id:'legacy-set-piece',slot:'weapon',setId:'set.v116.attire.dainhat_phanthien'}],equipped:{weapon:'legacy-set-piece'}};
  assert.deepEqual(activeEquipmentSetMechanicsV116(legacySetState),[],'legacy Set metadata must produce zero live mechanics');
  assert.equal(ROOT_ORIGIN_COMBAT_DEFINITIONS_V132.filter(x=>x.root==='fire').length,6,'Căn Nguyên authority must remain intact');
});

test('Đạo Văn remains secondary while retired Ngũ Hành Ngọc has zero live effect',()=>{
  const ins=Object.fromEntries(V128_DAO_INSCRIPTIONS.map(x=>[x.id,daoInscriptionPowerV128({id:x.id})]));
  assert.ok(ins['dao.v128.heart'].flatStats.heartChancePct<=1);
  assert.ok(ins['dao.v128.army_breaker'].flatStats.armorPenPct<=1.5);
  assert.ok(ins['dao.v128.steady_mind'].flatStats.controlDurationReductionPct<=2);
  assert.deepEqual(V128_EQUIPMENT_GEMS,[],'live Ngũ Hành Ngọc catalog must stay retired');
  for(const element of ['water','metal','wood','fire','earth']) assert.equal(equipmentGemEffectV128({element,level:5}),undefined,`${element} Ngọc must stay inert`);
});

console.log(`V129 STAT SOURCE AUDIT: ${passed}/${passed} PASS`);
