import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { swordPassivesV2, swordSkillMasteryV2 } from '../../dist/content/sword-dao-v2.js';
import { battleDaoV2ActiveSlotsUnlocked } from '../../dist/content/battle-dao-v2-catalog.js';
import {
  SWORD_V2_PASSIVE_IDS,
  createBattleDaoRuntimeStateV2,
  createRootActionV2,
  resolveSwordIntentAfterRootV2,
  swordIntentBonusesV2,
  swordQiGenerateAfterActionV2,
  swordQiSpendBeforeActionV2,
  syncBattleDaoV2Timers,
} from '../../dist/core/battle-dao-v2-runtime.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import { skillTrueEssenceCost } from '../../dist/core/combat-rules.js';
import { skillUltimateGaugeCostV117, skillUltimateGaugeGenerateV117 } from '../../dist/core/skill-runtime-v117.js';
import { BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125 } from '../../dist/core/specialization-skill-progression-v125.js';

let passed = 0;
function testCase(name, fn) { fn(); passed += 1; console.log(`✓ ${name}`); }

const registry = buildRegistry();
const SWORD_IDS = [
  'skill.dao.sword.basic',
  'skill.dao.sword.flow_slash',
  'skill.dao.sword.nurture',
  'skill.dao.sword.break_mark',
  'skill.dao.sword.chain',
  'skill.dao.sword.counter',
  'skill.dao.sword.sever',
  'skill.dao.sword.finisher',
  'skill.dao.sword.myriad',
  'skill.dao.sword.ultimate',
];
const EXPECTED_CN = [0, 3, 0, 5, 5, 3, 8, 9, 12, 0];
const EXPECTED_GAUGE = [4, 3, 8, 5, 4, 3, 6, 5, 15, 0];

function swordEntity({ qi = 0, intent = 0, tier = {}, passives = [SWORD_V2_PASSIVE_IDS.intent], passiveLevel = 20 } = {}) {
  const passiveLevelsV125 = Object.fromEntries(passives.map(id => [id, passiveLevel]));
  const e = {
    id: 'entity.qa.sword',
    combatBuildV117: {
      battleDaoV2Enabled: true,
      mainDaoId: 'sword',
      learnedDaoPassiveIdsV118: [...passives],
      passiveLevelsV125,
      skillPracticeTierV125: { ...tier },
    },
  };
  e.battleDaoStateV2 = createBattleDaoRuntimeStateV2(e, 0);
  e.battleDaoStateV2.sword.core.swordQi = qi;
  if (e.battleDaoStateV2.sword.intent)
    e.battleDaoStateV2.sword.intent.stacks = intent;
  return e;
}
function rootAction(entity, skill, token = 1) {
  return { battleDaoV2: createRootActionV2(entity, skill, token) };
}

testCase('Sword uses authored fixed CN independent of Max Chân Nguyên and authored per-skill Gauge', () => {
  SWORD_IDS.forEach((id, i) => {
    const skill = registry.skill(id);
    assert.equal(skill.spiritCost, EXPECTED_CN[i], id);
    assert.equal(skill.spiritCostStandardPct, 0, `${id} must not scale from Spirit Standard`);
    assert.equal(skillTrueEssenceCost(skill, { maxSpirit: 125, spiritStandard: 125 }, 1), EXPECTED_CN[i], `${id}/125`);
    assert.equal(skillTrueEssenceCost(skill, { maxSpirit: 999999, spiritStandard: 999999 }, 1), EXPECTED_CN[i], `${id}/huge`);
    assert.equal(skillUltimateGaugeGenerateV117(skill), EXPECTED_GAUGE[i], `${id}/gauge`);
  });
  assert.equal(skillUltimateGaugeCostV117(registry.skill('skill.dao.sword.ultimate')), 100);
});

testCase('Sword Qi early spenders and heavy spenders obey the production contract', () => {
  const flow = registry.skill('skill.dao.sword.flow_slash');
  const mark = registry.skill('skill.dao.sword.break_mark');
  const chain = registry.skill('skill.dao.sword.chain');
  const finisher = registry.skill('skill.dao.sword.finisher');
  const target = { breakDebuffUntil: 0 };

  let e = swordEntity({ qi: 5 });
  assert.equal(swordQiSpendBeforeActionV2(e, flow, target, 0), 2);
  assert.equal(e.battleDaoStateV2.sword.core.swordQi, 3);

  for (const [before, spend] of [[3,1],[4,2],[5,3]]) {
    e = swordEntity({ qi: before });
    assert.equal(swordQiSpendBeforeActionV2(e, mark, target, 0), spend);
    assert.equal(e.battleDaoStateV2.sword.core.swordQi, 2);
  }

  e = swordEntity({ qi: 3, tier: { [chain.id]: 500 } });
  assert.equal(swordQiSpendBeforeActionV2(e, chain, target, 0), 1);
  e = swordEntity({ qi: 5, tier: { [chain.id]: 1000 } });
  assert.equal(swordQiSpendBeforeActionV2(e, chain, target, 0), 2);

  e = swordEntity({ qi: 5, tier: { [finisher.id]: 1000 } });
  assert.equal(swordQiSpendBeforeActionV2(e, finisher, target, 0), 5);
  assert.equal(e.battleDaoStateV2.sword.core.swordQi, 0);
});

testCase('Hồi Phong mastery generates +2 Qi and Tàng Phong Cực Ý can rebuild 0–1 straight to 5', () => {
  const counter = registry.skill('skill.dao.sword.counter');
  let e = swordEntity({ qi: 3, tier: { [counter.id]: 500 } });
  let action = rootAction(e, counter);
  action.battleDaoV2.damagingHitCount = 1;
  assert.equal(swordQiGenerateAfterActionV2(e, counter, action), 2);
  assert.equal(e.battleDaoStateV2.sword.core.swordQi, 5);

  const nurture = registry.skill('skill.dao.sword.nurture');
  e = swordEntity({ qi: 1, tier: { [nurture.id]: 1000 } });
  action = rootAction(e, nurture);
  action.battleDaoV2.swordQiBefore = 1;
  assert.equal(swordQiGenerateAfterActionV2(e, nurture, action), 4);
  assert.equal(e.battleDaoStateV2.sword.core.swordQi, 5);
});

testCase('Kiếm Ý is generated by actual Qi spend, not by every three direct actions', () => {
  const skill = registry.skill('skill.dao.sword.finisher');
  const target = { breakDebuffUntil: 0 };

  let e = swordEntity({ qi: 2, intent: 0 });
  let action = rootAction(e, skill);
  action.battleDaoV2.swordQiSpent = 1;
  let result = resolveSwordIntentAfterRootV2(e, target, skill, action, 1, () => false);
  assert.equal(result.gained, 1);
  assert.equal(result.stacks, 1);

  e = swordEntity({ qi: 2, intent: 0 });
  action = rootAction(e, skill);
  action.battleDaoV2.swordQiSpent = 3;
  result = resolveSwordIntentAfterRootV2(e, target, skill, action, 1, () => false);
  assert.equal(result.gained, 2);
  assert.equal(result.stacks, 2);

  const source = fs.readFileSync(new URL('../../dist/core/battle-dao-v2-runtime.js', import.meta.url), 'utf8');
  assert.ok(!source.includes('st.directActionCounter++'), 'old 3-direct-action Intent generation must stay retired');
});

testCase('Dưỡng Ý overflow is bounded and Phá Vọng refund cannot exceed one Qi per root', () => {
  const skill = registry.skill('skill.dao.sword.break_mark');
  const passives = [SWORD_V2_PASSIVE_IDS.intent, SWORD_V2_PASSIVE_IDS.nourish, SWORD_V2_PASSIVE_IDS.breakTruth, SWORD_V2_PASSIVE_IDS.limitless];
  let e = swordEntity({ qi: 4, intent: 5, passives });
  let action = rootAction(e, skill);
  action.battleDaoV2.swordQiOverflow = 1;
  let result = resolveSwordIntentAfterRootV2(e, { breakDebuffUntil: 0 }, skill, action, 10, () => true);
  assert.equal(result.gained, 1);
  const ready = e.battleDaoStateV2.sword.overflowIntentReadyAt;
  assert.ok(ready >= 16 && ready <= 18, `overflow ICD unexpected: ${ready}`);

  action = rootAction(e, skill, 2);
  action.battleDaoV2.swordQiOverflow = 1;
  result = resolveSwordIntentAfterRootV2(e, { breakDebuffUntil: 0 }, skill, action, 11, () => true);
  assert.equal(result.gained, 0, 'overflow conversion must respect internal cooldown');

  e = swordEntity({ qi: 2, intent: 20, passives });
  action = rootAction(e, skill, 3);
  action.battleDaoV2.swordQiSpent = 3;
  action.battleDaoV2.targetBrokenBefore = false;
  result = resolveSwordIntentAfterRootV2(e, { breakDebuffUntil: 20 }, skill, action, 12, () => true);
  assert.equal(result.refundedQi, 1);
  assert.equal(e.battleDaoStateV2.sword.core.swordQi, 3);
});

testCase('Kiếm Ý numeric floor is bounded and capstone no longer grants generic Gauge', () => {
  const e = swordEntity({ intent: 20, passives: [SWORD_V2_PASSIVE_IDS.intent, SWORD_V2_PASSIVE_IDS.limitless, SWORD_V2_PASSIVE_IDS.majesty, SWORD_V2_PASSIVE_IDS.undyingIntent] });
  syncBattleDaoV2Timers(e, 0);
  assert.equal(e.battleDaoStateV2.sword.intent.cap, 30);
  const bonus = swordIntentBonusesV2(e, 0);
  assert.equal(Number(bonus.critChancePct.toFixed(6)), 8);
  assert.equal(Number(bonus.heartChancePct.toFixed(6)), 6);
  assert.equal(Number(bonus.armorPenPct.toFixed(6)), 8);
  assert.equal(bonus.gaugeGainPct, 0);
  assert.ok(bonus.directDamagePct <= 6, `generic direct damage leaked too high: ${bonus.directDamagePct}`);
});

testCase('passive and mastery content matches locked Sword semantics', () => {
  const counter = swordSkillMasteryV2.find(x => x.skillId === 'skill.dao.sword.counter');
  const ultimate = swordSkillMasteryV2.find(x => x.skillId === 'skill.dao.sword.ultimate');
  assert.ok(counter?.milestones?.[500]?.includes('+2 Kiếm Khí'));
  assert.ok(!counter?.milestones?.[500]?.includes('+3 Kiếm Khí'));
  assert.ok(ultimate?.milestones?.[1000]?.includes('cảnh giới cao'));
  const capstone = swordPassivesV2.find(x => x.id === SWORD_V2_PASSIVE_IDS.undyingIntent);
  assert.ok(capstone?.summary?.includes('Ý Hóa Kiếm'));
  assert.ok(!capstone?.lv20?.includes('+20% Nộ'));
});

testCase('Active slot progression remains 1→2→3→4→5 and hard-caps at five', () => {
  assert.equal(BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125, 5);
  assert.equal(battleDaoV2ActiveSlotsUnlocked(10, 5), 1);
  assert.equal(battleDaoV2ActiveSlotsUnlocked(18, 5), 2);
  assert.equal(battleDaoV2ActiveSlotsUnlocked(34, 5), 3);
  assert.equal(battleDaoV2ActiveSlotsUnlocked(46, 5), 4);
  assert.equal(battleDaoV2ActiveSlotsUnlocked(62, 5), 5);
  assert.equal(battleDaoV2ActiveSlotsUnlocked(114, 5), 5);
});

testCase('Sword auto rotation owns explicit kill-window and perfect-Ultimate rules within AI condition budget', () => {
  const profile = battleDaoAutoRotationV127('sword', SWORD_IDS);
  const finisher = profile.rules.find(r => r.skillId === 'skill.dao.sword.finisher' && r.conditions.some(c => c.type === 'swordFinisherKillWindow'));
  const ultimate = profile.rules.find(r => r.skillId === 'skill.dao.sword.ultimate' && r.conditions.some(c => c.type === 'swordPerfectUltimateWindow'));
  assert.ok(finisher, 'missing signature finisher window');
  assert.ok(ultimate, 'missing perfect Ultimate window');
  assert.ok(profile.rules.every(r => r.conditions.length <= 2), 'AI rule exceeded the canonical max-2 AND condition contract');
  const aiSource = fs.readFileSync(new URL('../../dist/core/ai.js', import.meta.url), 'utf8');
  assert.ok(aiSource.includes("['swordUltimateHoldUntil'] = now + 4"), 'Sword Ultimate hold must be bounded to four seconds');
});

testCase('Thái Hư Kiếm Vực is realm-gated at Tiên Vương, not granted only by Ultimate mastery 1000', () => {
  const combatSource = fs.readFileSync(new URL('../../dist/core/combat.js', import.meta.url), 'utf8');
  const at = combatSource.indexOf("skill.id === 'skill.dao.sword.ultimate' && (actor.combatBuildV117?.realmOrder ?? 0) >= 78");
  assert.ok(at >= 0, 'missing Tiên Vương realm gate for Sword Domain');
  const block = combatSource.slice(at, at + 650);
  assert.ok(block.includes('swordQiBefore ?? 0) >= 5');
  assert.ok(!block.includes('tier >= 1000'), 'Sword Domain must not be a mastery-only unlock');
});

console.log(`\nSWORD DAO PRODUCTION CONTRACT: ${passed}/${passed} PASS`);
