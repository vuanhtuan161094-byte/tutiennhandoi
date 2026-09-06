import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { CombatEngine } from '../../dist/core/combat.js';

const registry=buildRegistry();
const baseStats={
  maxHp:1000,maxSpirit:100,attack:100,defense:100,mobility:10,accuracy:100,actionSpeed:1,resolve:100,controlPower:100,
  critChancePct:0,critDamagePct:150,heartChancePct:0,heartDamagePct:125,armorPenPct:0,damageReductionPct:0,
};
function def(id,extra={}){return {id,name:id,tags:[],combatModel:'locked-v1',stats:{...baseStats,...extra},skillIds:[],aiProfile:{name:'idle',rules:[]}};}

// Phá Thế from V127 manuals must change actual poise damage, not only appear in entity stats.
{
  const e=new CombatEngine(registry,127501,[def('src',{breakEffectPct:50}),def('dst')]);
  const src=e.entities.get('src'),dst=e.entities.get('dst');
  e.applyDamage(src,dst,{sourceTag:'ActiveHit',coefficient:0,breakDamagePct:10,canCrit:false,canDodge:false,canHeart:false,unavoidable:true,trueDamage:false,procCoefficient:0,skillId:undefined,elementalCoefficients:undefined,primaryElement:undefined,cooldownDamageBonusPct:0,runtimeEffectBonusPct:0,runtimeBreakBonusPct:0},0);
  assert.equal(dst.poise,85,'+50% breakEffectPct must turn 10% base break into 15% real poise damage');
}

// Khiên from V127 manuals must scale direct shield capacity inside CombatKernel V2.
{
  const e=new CombatEngine(registry,127502,[def('src',{shieldEffectPct:50}),def('dst')]);
  const src=e.entities.get('src'),dst=e.entities.get('dst');
  e.resolveEffects(src,dst,[{type:'shield',capacity:100,stability:100,duration:10,maxHpPct:0,attackCoefficient:0}],'Environment',0,undefined,0,undefined);
  assert.equal(Math.round(e.totalShield(src,0)),150,'+50% shieldEffectPct must turn 100 direct shield into 150 real shield');
}

console.log('V127 MANUAL COMBAT CONSUMER GATE — PASS');
console.log(JSON.stringify({breakEffectConsumer:true,shieldEffectConsumer:true,combatEngine:'CombatKernel V2'},null,2));
