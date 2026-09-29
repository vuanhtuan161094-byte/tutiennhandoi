import assert from 'node:assert/strict';
import fs from 'node:fs';
import { battleDaoSkillsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';
import { createMindCoreStateV2 } from '../../dist/core/battle-dao-v2-contract.js';
import {
  addMindMarksV2,
  consumeMindMarksV2,
  finishMindRootV2,
  mindMarkCountV2,
  mindObserveProgressV2,
  resolveMindConsumeDamageV2,
  resolveMindInterfereV2,
} from '../../dist/core/mind-dao-v2-runtime.js';

const byId = Object.fromEntries(battleDaoSkillsV118.filter(x => x.runtimeV117?.daoBinding === 'mind').map(x => [x.id, x]));
const source = {
  name: 'Mind M1',
  combatBuildV117: { battleDaoV2Enabled: true, mainDaoId: 'mind' },
  battleDaoStateV2: { mind: { core: createMindCoreStateV2() } },
};
const target = { name: 'Target', marks: {}, tags: [], pendingSetFlagsV117: {} };
const action = (id, packets = []) => ({ battleDaoV2: { rootActionId: `root:${id}`, procDepth: 0, mindSnapshotPackets: packets } });

// Canonical Thần Ấn store is target.marks with a hard cap of five.
assert.equal(addMindMarksV2(source, target, 7), 5);
assert.equal(mindMarkCountV2(target), 5);
assert.deepEqual(consumeMindMarksV2(source, target, 2), { consumed: 2, before: 5, after: 3 });
assert.equal(mindMarkCountV2(target), 3);

// Observe rewards progress only: for five ticks, marks land at 2 / 4 / 5.
target.marks['Thần Ấn'] = 0;
const observeAction = action('observe');
assert.equal(mindObserveProgressV2(source, target, byId['skill.dao.mind.observe'], observeAction, 1, 5), 0);
assert.equal(mindObserveProgressV2(source, target, byId['skill.dao.mind.observe'], observeAction, 2, 5), 1);
assert.equal(mindMarkCountV2(target), 1);
assert.equal(mindObserveProgressV2(source, target, byId['skill.dao.mind.observe'], observeAction, 3, 5), 0);
assert.equal(mindObserveProgressV2(source, target, byId['skill.dao.mind.observe'], observeAction, 4, 5), 1);
assert.equal(mindObserveProgressV2(source, target, byId['skill.dao.mind.observe'], observeAction, 5, 5), 1);
assert.equal(mindMarkCountV2(target), 3);

// Nhiễu consumes once at resolved root, with three marks enabling the canonical mental-stagger attempt.
target.marks['Thần Ấn'] = 3;
target.casting = { skillId: 'dummy', resolvesAt: 10 };
const interfereAction = action('interfere');
const interfere = resolveMindInterfereV2(source, target, byId['skill.dao.mind.interfere'], interfereAction, 1);
assert.equal(interfere.consumed, 3);
assert.equal(mindMarkCountV2(target), 0);
assert(interfere.targetCastDelaySeconds > 0);
assert.equal(interfere.mentalStaggerSeconds, .35);
delete target.casting;

// Burst conversion is post-spend and cannot consume the same marks twice.
target.marks['Thần Ấn'] = 5;
const burstEffect = byId['skill.dao.mind.burst'].effects.find(x => x.type === 'consumeMarkDamage');
const burstAction = action('burst');
const burst = resolveMindConsumeDamageV2(source, target, byId['skill.dao.mind.burst'], burstEffect, burstAction);
assert.equal(burst.consumed, 5);
assert.equal(burst.coefficient, 1 + 5 * .48);
assert.equal(burst.breakDamagePct, 25);
assert.equal(mindMarkCountV2(target), 0);
const burstAgain = resolveMindConsumeDamageV2(source, target, byId['skill.dao.mind.burst'], burstEffect, burstAction);
assert.equal(burstAgain.consumed, 0);
assert.equal(burstAgain.coefficient, 1);

// Every third eligible Active echoes only sanitized damage/heal/shield packets.
source.battleDaoStateV2.mind.core = createMindCoreStateV2();
const markSkill = byId['skill.dao.mind.mark'];
const cleanDamage = { type: 'damage', coefficient: .7, breakDamagePct: 2, canCrit: true, canDodge: true, canHeart: true };
assert.equal(finishMindRootV2(source, target, markSkill, action('a', [cleanDamage]), 1).echo, undefined);
assert.equal(finishMindRootV2(source, target, markSkill, action('b', [cleanDamage]), 2).echo, undefined);
const third = finishMindRootV2(source, target, markSkill, action('c', [cleanDamage, { type: 'resource', amount: 999 }]), 3);
assert(third.echo);
assert.equal(third.echo.coefficient, .35);
assert.deepEqual(third.echo.packets, [cleanDamage]);
assert.equal(source.battleDaoStateV2.mind.core.snapshot.sourceSkillId, markSkill.id);

// Ultimate is outside ordinary cadence and may not replace the normal snapshot.
const snapshotBeforeUltimate = structuredClone(source.battleDaoStateV2.mind.core.snapshot);
const cadenceBeforeUltimate = source.battleDaoStateV2.mind.core.eligibleActiveCount;
const ultimate = finishMindRootV2(source, target, byId['skill.dao.mind.ultimate'], action('ultimate', [cleanDamage]), 4);
assert.equal(ultimate.echo, undefined);
assert.equal(source.battleDaoStateV2.mind.core.eligibleActiveCount, cadenceBeforeUltimate);
assert.deepEqual(source.battleDaoStateV2.mind.core.snapshot, snapshotBeforeUltimate);

// Phân Lưu opens for five seconds; the deploy itself does not count toward its own third-active bonus.
source.battleDaoStateV2.mind.core = createMindCoreStateV2();
target.marks['Thần Ấn'] = 0;
const flow = finishMindRootV2(source, target, byId['skill.dao.mind.flow'], action('flow', [cleanDamage]), 10);
assert.equal(source.battleDaoStateV2.mind.core.flowUntil, 15);
assert.equal(flow.flowBonusMarkGain, 0);
assert.equal(finishMindRootV2(source, target, markSkill, action('f1', [cleanDamage]), 11).flowBonusMarkGain, 0);
assert.equal(finishMindRootV2(source, target, markSkill, action('f2', [cleanDamage]), 12).flowBonusMarkGain, 0);
assert.equal(finishMindRootV2(source, target, markSkill, action('f3', [cleanDamage]), 13).flowBonusMarkGain, 1);

// Integration guards: old pseudo-resource projection and hpDamage/attack echo inference must be gone.
const runtimeSource = fs.readFileSync(new URL('../../dist/core/battle-dao-v2-runtime.js', import.meta.url), 'utf8');
const combatSource = fs.readFileSync(new URL('../../dist/core/combat.js', import.meta.url), 'utf8');
assert(!runtimeSource.includes('out.mindEchoCounter ='), 'mindEchoCounter must remain internal, not a projected resource');
assert(!runtimeSource.includes('(action.battleDaoV2?.hpDamage ?? 0) / Math.max(1, entity.baseStats.attack)'), 'Niệm Ảnh must not infer snapshots from realized HP damage');
assert(runtimeSource.includes("finishMindRootV2(entity, target, skill, action, now)"));
assert(combatSource.includes('mindObserveProgressV2(actor, target, skill'));
assert(combatSource.includes('resolveMindConsumeDamageV2(source, target, skill, effect, runtimeAction)'));
assert(combatSource.includes("status.mind.interference_stagger"));

console.log('MIND DAO M1 AUTHORITY: PASS');
