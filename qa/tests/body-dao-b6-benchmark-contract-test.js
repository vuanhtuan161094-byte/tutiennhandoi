import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  BODY_B6_DURATION_SECONDS,
  BODY_B6_PRESET_IDS,
  BODY_B6_SEEDS,
  BODY_B6_STYLES,
  createBodyB6Player,
  validateBodyB6Matrix,
} from '../benchmarks/body-dao-b6-benchmark.js';
import { BODY_DAO_AUTO_PRESETS_V1 } from '../../dist/core/body-dao-auto-v1.js';
import { createBodyB5Target } from '../benchmarks/body-dao-b5-benchmark.js';
import { backendFeatureClosureManifest } from '../runners/feature-closure-manifest.js';

assert.equal(BODY_B6_DURATION_SECONDS,180);
assert.equal(BODY_B6_SEEDS.length,12);
assert.deepEqual(BODY_B6_PRESET_IDS,['cautious','balanced','aggressive']);
assert.deepEqual(BODY_B6_STYLES.map(x=>x.id),['defense','blood','hybrid']);
assert.deepEqual(validateBodyB6Matrix(),[]);

const thresholdByPreset=Object.fromEntries(BODY_DAO_AUTO_PRESETS_V1.map(x=>[x.id,x.minHpPct]));
for(const style of BODY_B6_STYLES){
  assert.equal(style.activeSkillIds.length,5,`${style.id}: exactly five Active slots required`);
  assert.equal(Object.values(style.allocation).reduce((a,b)=>a+b,0),300,`${style.id}: same +300 five-stat budget required`);
  for(const presetId of BODY_B6_PRESET_IDS){
    const player=createBodyB6Player(style,presetId);
    assert.equal(player.aiProfile.bodyAutoPresetV1,presetId,`${style.id}/${presetId}: preset must reach production Auto profile`);
    const bloodRule=player.aiProfile.rules.find(x=>x.skillId==='skill.dao.body.elephant');
    if(style.id==='defense'){
      assert.equal(player.skillIds.includes('skill.dao.body.elephant'),false,'Thủ–Phản control must not equip Nhiên Huyết');
      assert.equal(bloodRule,undefined,'preset must not invent a Nhiên Huyết rule when the skill is not equipped');
    }else{
      assert(player.skillIds.includes('skill.dao.body.elephant'),`${style.id}: must equip Nhiên Huyết`);
      assert(bloodRule,`${style.id}/${presetId}: missing Nhiên Huyết Auto rule`);
      assert.deepEqual(bloodRule.conditions,[{type:'selfHpAbove',pct:thresholdByPreset[presetId]}],`${style.id}/${presetId}: wrong Auto threshold`);
    }
  }
}

const target=createBodyB5Target();
assert.equal(target.name,'B5 Trấn Thể Chiến Khôi','B6 must reuse the exact B5 pressure target for interpretable comparison');
assert.deepEqual(target.skillIds,['skill.boss.v81.crushing_slam','skill.boss.v81.cataclysm','skill.basic_strike']);
assert.equal(target.stats.maxHp,50_000_000);

const source=fs.readFileSync(new URL('../benchmarks/body-dao-b6-benchmark.js',import.meta.url),'utf8');
assert(source.includes('BODY_B6_PRESET_LEAK'),'B6 must reject preset leakage into Thủ–Phản mechanics');
assert(source.includes('bodyBloodRushActivations'),'B6 must measure real Nhiên Huyết activations');
assert(source.includes('bodyBloodRushHpPaid'),'B6 must measure real Nhiên Huyết HP payment');
assert(source.includes('bloodWindowDamage'),'B6 must measure offensive conversion inside Huyết Bạo');
assert(source.includes("style.identity==='hybrid'"),'B6 must have explicit Hybrid identity validity');
assert(source.includes('invalidRuns:invalid.map'),'B6 must preserve invalid run evidence in JSON instead of throwing it away');
assert(source.indexOf('fs.writeFileSync(opts.out')<source.indexOf('if(!result.passed) process.exitCode=1'),'B6 CLI must write evidence before returning fail-closed exit code');
assert(source.includes('No DPS/survival target band is enforced here'),'B6 must remain diagnostic before evidence-driven tuning');

const launcher=fs.readFileSync(new URL('../../tools/web/RUN_BODY_B6_BENCHMARK.cmd',import.meta.url),'utf8');
assert(launcher.includes('qa\\benchmarks\\body-dao-b6-benchmark.js'));
assert(launcher.includes('qa\\output\\body-b6-benchmark.json'));
assert(launcher.includes('qa\\output\\body-b6-benchmark.log'));

const manifest=backendFeatureClosureManifest('dao-body');
assert.equal(manifest.closureReady,false,'Body must remain OPEN until B6 evidence is reviewed and B7 closes');
assert.equal(manifest.benchmarkCommand,'tools\\web\\RUN_BODY_B6_BENCHMARK.cmd');
assert.equal(manifest.benchmarkContractGate,'body-dao-b6-benchmark-contract-test.js');
assert(manifest.gates.includes('body-dao-b6-benchmark-contract-test.js'));

console.log('BODY DAO B6 BENCHMARK CONTRACT: PASS');
