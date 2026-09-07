import assert from 'node:assert/strict';
import {
  FATE_BUILD_DEFINITIONS_V4,
  FATE_BUILD_PATHS_V4,
  FATE_BUILD_TOTAL_UNLOCK_COST_V4,
  createFateBuildStateV4,
  fateBuildUnlockPreviewV4,
  unlockFateBuildV4,
  selectActiveFateBuildV4,
  activeFateBuildV4,
} from '../../dist/core/reincarnation-fate-build-v4.js';

assert.equal(FATE_BUILD_PATHS_V4.length,5);
assert.equal(FATE_BUILD_DEFINITIONS_V4.length,25);
assert.equal(FATE_BUILD_TOTAL_UNLOCK_COST_V4,310000);
assert(FATE_BUILD_PATHS_V4.every(path=>path.nodes.length===5));
assert(FATE_BUILD_PATHS_V4.every(path=>path.nodes.map(x=>x.tier).join(',')==='mortal,spirit,mystic,heaven,immortal'));

let state=createFateBuildStateV4();
assert.equal(state.unlockedIds.length,5,'Đời đầu phải có đủ 5 Phàm Mệnh để chọn build, không roll.');
assert.equal(activeFateBuildV4(state).id,'fate.v4.cultivation.diligent');

const mystic='fate.v4.combat.slaying_heart';
const spirit='fate.v4.combat.hundred_battles';
assert.equal(fateBuildUnlockPreviewV4(state,mystic).eligible,false,'Không được nhảy thẳng Huyền Mệnh.');
assert.throws(()=>unlockFateBuildV4(state,mystic,999999),/Cần mở/);

let result=unlockFateBuildV4(state,spirit,3000);
assert.equal(result.spentRp,3000);
state=result.state;
result=unlockFateBuildV4(state,mystic,9000);
assert.equal(result.spentRp,9000);
state=result.state;
state=selectActiveFateBuildV4(state,mystic);
assert.equal(activeFateBuildV4(state).name,'Sát Phạt Chi Tâm');

// Có thể mở nhiều nhánh song song; không khóa build tài khoản.
result=unlockFateBuildV4(state,'fate.v4.wealth.gather_wealth',3000);
state=result.state;
assert(state.unlockedIds.includes('fate.v4.combat.slaying_heart'));
assert(state.unlockedIds.includes('fate.v4.wealth.gather_wealth'));

console.log('REINCARNATION FATE BUILD V4 — PASS', {
  paths:FATE_BUILD_PATHS_V4.length,
  fates:FATE_BUILD_DEFINITIONS_V4.length,
  totalUnlockCost:FATE_BUILD_TOTAL_UNLOCK_COST_V4,
  active:activeFateBuildV4(state).name,
});
