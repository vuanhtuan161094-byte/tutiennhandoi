import assert from 'node:assert/strict';
import { EQUIPMENT_AFFIX_DEFINITIONS_V114 } from '../../dist/core/equipment-affix-v114.js';
import { ROOT_ORIGIN_COMBAT_DEFINITIONS_V132 } from '../../dist/core/root-origin-combat-v132.js';
import { SPIRIT_BEAST_SPECIES_V86, spiritBeastBondSummaryV86 } from '../../dist/core/spirit-beast-v86.js';
import { SET_SIMPLE_2P_STAT_V12318, SET_SIMPLE_MINOR_V12318 } from '../../dist/core/equipment-set-v116.js';
import { V128_DAO_INSCRIPTIONS, daoInscriptionPowerV128, equipmentGemEffectV128 } from '../../dist/core/equipment-inscription-gem-v128.js';

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

test('Owning all eight maxed Linh Thú is a meaningful major-system bond',()=>{
  const items=Object.fromEntries(SPIRIT_BEAST_SPECIES_V86.map(x=>[x.id,{owned:true,level:50,advance:5}]));
  const b=spiritBeastBondSummaryV86({items});
  assert.equal(b.owned,8);
  assert.ok(b.powerPct>=25 && b.powerPct<=35,`Công ${b.powerPct}%`);
  assert.ok(b.bodyPct>=25 && b.bodyPct<=35,`Thể ${b.bodyPct}%`);
  assert.ok(b.defensePct>=25 && b.defensePct<=35,`Phòng ${b.defensePct}%`);
});

test('Ngũ Hành Set 2p is noticeable while bounded-stat minor lanes remain controlled',()=>{
  assert.equal(SET_SIMPLE_2P_STAT_V12318.at(-1),18);
  assert.equal(SET_SIMPLE_MINOR_V12318.at(-1),8);
});

test('Đạo Văn and Ngọc remain secondary layers rather than dominant single-slot stats',()=>{
  const ins=Object.fromEntries(V128_DAO_INSCRIPTIONS.map(x=>[x.id,daoInscriptionPowerV128({id:x.id})]));
  assert.ok(ins['dao.v128.heart'].flatStats.heartChancePct<=1);
  assert.ok(ins['dao.v128.army_breaker'].flatStats.armorPenPct<=1.5);
  assert.ok(ins['dao.v128.steady_mind'].flatStats.controlDurationReductionPct<=2);
  const water=equipmentGemEffectV128({element:'water',level:5});
  const metal=equipmentGemEffectV128({element:'metal',level:5});
  assert.ok(water.flatStats.damageReductionPct<=0.6); assert.ok(metal.flatStats.armorPenPct<=1.5);
});

console.log(`V129 STAT SOURCE AUDIT: ${passed}/${passed} PASS`);
