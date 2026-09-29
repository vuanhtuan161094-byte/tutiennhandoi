// Mệnh Lộ V4 compatibility barrel.
// Five live paths are retained: Tu Mệnh, Chiến Mệnh, Thể Mệnh, Tài Mệnh, Nhàn Mệnh.
// Historical "fate build" IDs/APIs remain unchanged for save/runtime compatibility.
// Do not confuse Mệnh Lộ with Mệnh Cách, which is a randomized birth trait inside Mệnh Thai.
// Implementation lives in reincarnation-progression-v1102.js.
export {
  FATE_V4_TIERS, FATE_V4_TIER_NAMES, FATE_V4_UNLOCK_COST_BY_TIER,
  FATE_BUILD_DEFINITIONS_V4, FATE_BUILD_BY_ID_V4, FATE_BUILD_PATHS_V4, FATE_BUILD_TOTAL_UNLOCK_COST_V4,
  createFateBuildStateV4, cloneFateBuildStateV4, fateBuildDefinitionV4, fateBuildUnlockPreviewV4,
  unlockFateBuildV4, selectActiveFateBuildV4, activeFateBuildV4, activeFateBuildModifiersV4,
} from './reincarnation-progression-v1102.js';
