import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createCollectionProgressStateV12316, grantCollectionItemV12316, collectionStatSummaryV12316 } from '../../dist/core/collection-progression-v12316.js';
import { createBuildFoundationV113 } from '../../dist/core/build-foundation-v113.js';
import { battleDaoV2Passives } from '../../dist/content/battle-dao-v2-catalog.js';
import { ensureSkillHeartProgressionV12317, resolveHeartMethodStatsV12317, upgradeSkillLevelV12317 } from '../../dist/core/skill-heart-method-v12317.js';
import { resolveTechniqueRuntimeV119 } from '../../dist/core/technique-runtime-v119.js';
import { normalizeCanonicalSkillHeartAfterRestore } from '../../dist/core/session-restore.js';

// Công Pháp authority: one Collection state, all learned manuals stay effective without equip slots.
const manuals = createCollectionProgressStateV12316();
grantCollectionItemV12316(manuals, 'manual.1');
grantCollectionItemV12316(manuals, 'manual.2');
manuals.items['manual.1'].level = 1000;
manuals.items['manual.2'].level = 1000;
const both = collectionStatSummaryV12316(manuals);
const one = createCollectionProgressStateV12316();
grantCollectionItemV12316(one, 'manual.1');
one.items['manual.1'].level = 1000;
const single = collectionStatSummaryV12316(one);
assert(both.cultivationFlatPer15s > single.cultivationFlatPer15s, 'all learned manuals must stack');

// Kỹ Năng/Tâm Pháp authority: progression lives in buildFoundation.progressionV125.
const foundation = createBuildFoundationV113('root.fire');
foundation.battleDao.mainDaoId = 'sword';
foundation.battleDao.committed = true;
const swordPassives = battleDaoV2Passives('sword').map(x => x.id);
foundation.learnedDaoPassiveIdsV118 = [swordPassives[0]];
const progression = ensureSkillHeartProgressionV12317(foundation.progressionV125);
progression.passiveLevels[swordPassives[0]] = 20;
progression.heartMethodGradesV12317[swordPassives[0]] = 'breaker';
const heart = resolveHeartMethodStatsV12317(foundation);
assert(Math.max(heart.attackPct, heart.physiquePct, heart.defensePct) > 0, 'authored learned Tâm Pháp must affect stats');

// Skill level mutation must consume the canonical progression wallet only.
progression.skillGenericFragmentsV12317 = 9999;
const beforeWallet = progression.skillGenericFragmentsV12317;
const skillId = 'skill.dao.sword.flow_slash';
const upgraded = upgradeSkillLevelV12317(foundation, skillId);
assert.equal(upgraded.after, 2);
assert(progression.skillGenericFragmentsV12317 < beforeWallet);
assert.equal(progression.skillLevelsV12317[skillId], 2);

// Retired V103/V119 techniques remain compatibility-only and cannot re-enter combat authority.
const legacyTechnique = resolveTechniqueRuntimeV119({ activeTechniqueId: 'legacy.fake' }, () => ({ id: 'legacy.fake' }));
assert.deepEqual(legacyTechnique.runtime.sourceTechniqueIds, []);
assert.deepEqual(legacyTechnique.runtime.modifiers, []);
assert.equal(legacyTechnique.staticActionSpeedPct, 0);

// Restore boundary must reject duplicate/invented passive IDs.
const restoreState = {
  character: {
    buildFoundation: {
      learnedDaoPassiveIdsV118: [swordPassives[0], swordPassives[0], 'passive.v2.sword.injected_fake', 'passive.legacy.fake'],
    },
  },
};
normalizeCanonicalSkillHeartAfterRestore(restoreState);
assert.deepEqual(restoreState.character.buildFoundation.learnedDaoPassiveIdsV118, [swordPassives[0]]);

// Session transport must mutate V12317 directly; old passive-upgrade path stays retired.
const session = fs.readFileSync('dist/core/session.js', 'utf8');
assert.match(session, /upgradeBattleDaoSkillV12317\(skillId\)/);
assert.match(session, /upgradeSkillLevelV12317\(f, skillId\)/);
assert.match(session, /advanceBattleDaoSkillV12317\(skillId\)/);
assert.match(session, /advanceSkillGradeV12317\(f, skillId\)/);
assert.match(session, /upgradeDaoPassiveV125\(\) \{ return this\.legacyTechniqueRetiredV144/);

console.log('V166 Manual / Skill / Heart runtime authority PASS');
