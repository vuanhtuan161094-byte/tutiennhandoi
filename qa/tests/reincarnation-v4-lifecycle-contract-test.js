import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  REINCARNATION_ENERGY_CAP,
  availableTreePoints,
  createReincarnationProgressStateV1102,
  lifeAchievementBonusPctV4,
  previewReincarnationV2Reward,
} from '../../dist/core/reincarnation-progression-v1102.js';
import { FATE_BUILD_TOTAL_UNLOCK_COST_V4, unlockFateBuildV4 } from '../../dist/core/reincarnation-fate-build-v4.js';

assert.equal(REINCARNATION_ENERGY_CAP,300);
const rp=createReincarnationProgressStateV1102(0);
assert.equal(rp.energy.current,300);
assert.equal(rp.fateBuild.unlockedIds.length,5);
rp.tree.lifetimePointsEarned=100000;
assert.equal(availableTreePoints(rp.tree),100000);
const f=unlockFateBuildV4(rp.fateBuild,'fate.v4.combat.hundred_battles',availableTreePoints(rp.tree));
rp.fateBuild=f.state; rp.tree.sharedSpentPoints+=f.spentRp;
assert.equal(f.spentRp,3000);
assert.equal(availableTreePoints(rp.tree),97000,'Mệnh Cách phải tiêu cùng một quỹ RP với Cây Luân Hồi.');
assert.equal(FATE_BUILD_TOTAL_UNLOCK_COST_V4,310000);
assert.equal(lifeAchievementBonusPctV4(0),0);
assert(lifeAchievementBonusPctV4(2500)>lifeAchievementBonusPctV4(100));
const low=previewReincarnationV2Reward({lifeId:'x',realmOrder:18,lifeScore:0,lifePotentialEarned:20});
const high=previewReincarnationV2Reward({lifeId:'x',realmOrder:18,lifeScore:2500,lifePotentialEarned:20});
assert(high.reincarnationPoints>low.reincarnationPoints,'Thành tựu thật trong đời phải tăng RP.');
assert.equal(high.trialBonusPct,undefined,'Reward V4 không được phụ thuộc Thí Luyện giả.');

const session=fs.readFileSync(new URL('../../dist/core/session.js',import.meta.url),'utf8');
assert(!session.includes('const minimumAge = 60'));
assert(!session.includes('const minimumRealmOrder = 10'));
assert(!session.includes('Cần hoàn thành cả Cọc Gỗ'));
assert(!session.includes('applyCombatDeathLifespanPenalty(this.stateValue)'));
assert(session.includes("tags:['CombatDeath','Injury','Revival']"));
assert(session.includes("const voluntary=Boolean(lifeEnd?.tags?.includes('VoluntaryPassing'))"));
assert(session.includes('const energySpent=voluntary?reward.energyCost:0'));
assert(!session.includes('applyFateEmbryoToEntity('));
assert(!session.includes('effectiveManifestationCapacity('));
const eligibilityBlock=session.slice(session.indexOf('    voluntaryPassingEligibility('),session.indexOf('    enterMeditativePassing('));
assert(eligibilityBlock.includes('const energyState=rechargeReincarnationEnergy'));
assert(!eligibilityBlock.includes('rp.energy='),'Tọa Hóa eligibility/read preview must not mutate Energy state.');
console.log('REINCARNATION V4 LIFECYCLE CONTRACT — PASS');
