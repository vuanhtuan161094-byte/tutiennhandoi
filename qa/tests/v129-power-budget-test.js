import assert from 'node:assert/strict';
import { SPIRIT_BEAST_SPECIES_V86, SPIRIT_BEAST_BOND_MAX_BUDGET_V129, spiritBeastBondSummaryV86 } from '../../dist/core/spirit-beast-v86.js';
import { EQUIPMENT_SET_CATALOG_V116, evaluateSetMechanicParamsV116 } from '../../dist/core/equipment-set-v116.js';
import { ROOT_ORIGIN_COMBAT_DEFINITIONS_V132, rootOriginPeakGenerationBonusPctV129, rootOriginCastRecoveryMultiplierV132, applyRootOriginActionV132 } from '../../dist/core/root-origin-combat-v132.js';
import { MAJOR_SYSTEM_BANDS_V129, inPowerBandV129, powerEquivalentPackageV129, rootOriginPowerEquivalentV129 } from '../../dist/core/power-budget-v129.js';

let passed=0; const test=(name,fn)=>{fn();passed++;console.log(`✓ [${passed}] ${name}`)};
const liveElements=EQUIPMENT_SET_CATALOG_V116.filter(x=>x.identity==='element');

test('V147 Linh Thú power budget separates collection raw from equipped-only percent',()=>{
  const items=Object.fromEntries(SPIRIT_BEAST_SPECIES_V86.map(x=>[x.id,{owned:true,level:1000,advance:5,stars:20,spiritBeastV147Migrated:true}]));
  const inactive=spiritBeastBondSummaryV86({items});
  assert.equal(inactive.owned,8);
  assert.deepEqual({p:inactive.powerPct,b:inactive.bodyPct,d:inactive.defensePct},{p:0,b:0,d:0});
  assert.ok(inactive.attackFlat>=1000&&inactive.attackFlat<=2500,'attackFlat='+inactive.attackFlat);
  assert.ok(inactive.hpFlat>=10000&&inactive.hpFlat<=30000,'hpFlat='+inactive.hpFlat);
  assert.ok(inactive.defenseFlat>=900&&inactive.defenseFlat<=2200,'defenseFlat='+inactive.defenseFlat);
  const rows=Object.values(SPIRIT_BEAST_BOND_MAX_BUDGET_V129);
  assert.ok(new Set(rows.map(x=>x.powerPct+'/'+x.bodyPct+'/'+x.defensePct)).size>=6,'Linh Thú identities must not collapse into one generic bond');
  for(const pet of SPIRIT_BEAST_SPECIES_V86){
    const b=spiritBeastBondSummaryV86({items,activePetId:pet.id});
    const authored=SPIRIT_BEAST_BOND_MAX_BUDGET_V129[pet.id];
    assert.deepEqual({p:b.powerPct,b:b.bodyPct,d:b.defensePct},{p:authored.powerPct,b:authored.bodyPct,d:authored.defensePct},pet.id);
    assert.ok(b.powerPct<=6&&b.bodyPct<=6&&b.defensePct<=6,'single equipped pet percentage must remain bounded');
  }
});

test('All five live elemental Sets have noticeable 2p, meaningful 4p and build-defining 6p power-equivalent budgets',()=>{
  assert.equal(liveElements.length,5);
  for(const set of liveElements){
    const scores=[];
    for(const mechanic of set.mechanics){
      const params=evaluateSetMechanicParamsV116(mechanic,'breaker');
      const score=powerEquivalentPackageV129(params); scores.push(score);
      const band=mechanic.pieces===2?MAJOR_SYSTEM_BANDS_V129.setThreshold2:mechanic.pieces===4?MAJOR_SYSTEM_BANDS_V129.setThreshold4:MAJOR_SYSTEM_BANDS_V129.setThreshold6;
      assert.ok(inPowerBandV129(score,band),`${set.key} ${mechanic.pieces}p score=${score.toFixed(2)} outside ${band.min}-${band.max}`);
    }
    const full=scores.reduce((a,b)=>a+b,0);
    assert.ok(inPowerBandV129(full,MAJOR_SYSTEM_BANDS_V129.setFull),`${set.key} full=${full.toFixed(2)} outside full-system band`);
  }
});

test('Căn Nguyên choices are material specialization packages, not trivial few-percent bonuses',()=>{
  for(const root of ['metal','wood','water','fire','earth']){
    const defs=ROOT_ORIGIN_COMBAT_DEFINITIONS_V132.filter(x=>x.root===root); assert.equal(defs.length,6,root);
    for(const def of defs){
      const score=rootOriginPowerEquivalentV129(def)+powerEquivalentPackageV129({resourceGenerationPct:rootOriginPeakGenerationBonusPctV129(def.id)});
      assert.ok(score>=MAJOR_SYSTEM_BANDS_V129.rootOriginChoice.min,`${def.id} score=${score.toFixed(2)} too weak`);
      assert.ok(score<=MAJOR_SYSTEM_BANDS_V129.rootOriginChoice.max,`${def.id} score=${score.toFixed(2)} runaway`);
    }
    const peak=Math.max(...defs.map(def=>rootOriginPowerEquivalentV129(def)+powerEquivalentPackageV129({resourceGenerationPct:rootOriginPeakGenerationBonusPctV129(def.id)})));
    assert.ok(inPowerBandV129(peak,MAJOR_SYSTEM_BANDS_V129.rootOriginPeak),`${root} peak=${peak.toFixed(2)}`);
  }
});

function syntheticEntity(root, originId){
  return {combatBuildV117:{activeRootOriginIdsV132:{[root]:originId}},baseStats:{physique:100,maxHp:2000,maxSpirit:100},hp:2000,spirit:100,fiveElementsV117:{metalEdge:0,metalArmor:0,woodLife:0,woodSeed:0,waterFlow:0,waterTide:0,fireSeal:0,fireHeat:0,fireExtremeUntil:0,earthWeight:0,earthRecoil:0}};
}
function syntheticSkill(root){return{id:`test.${root}`,tags:[],effects:[],castTime:.1,recoveryTime:.1,spiritCost:0,runtimeV117:{primaryRoot:root}};}
function assertRecoveryAppliedOnce(root,originId,expected){
  const ent=syntheticEntity(root,originId),skill=syntheticSkill(root);
  const action={effectBonusPct:0,breakBonusPct:0,recoveryMultiplier:rootOriginCastRecoveryMultiplierV132(ent,skill),spentResources:{}};
  applyRootOriginActionV132(ent,skill,action,0);
  assert.equal(Number(action.recoveryMultiplier.toFixed(4)),expected);
}
test('Tân Kim and Vô Hình Thủy Recovery timing is applied exactly once in canonical runtime',()=>{
  assertRecoveryAppliedOnce('metal','origin.metal.xin',.90);
  assertRecoveryAppliedOnce('water','origin.water.formless',.84);
});

console.log(`V129 POWER BUDGET: ${passed}/${passed} PASS`);
