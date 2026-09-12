# CURRENT CHECKPOINT

This file is the source of truth for a new chat.
Read this first. Do not reconstruct project state from old chats.

## Active state

- Branch: `main` only.
- V160: LOCKED.
- V161: LOCKED.
- V162 Runtime Authority Consolidation: CLOSED / LOCKED.
- V163 Pháp Bảo / Chí Bảo Runtime Authority: CLOSED / LOCKED.
  - Executable closure: `8033f37ac32354c34ece82959491a89ae3f8f4de`
  - Canonical QA: `34576745935` — SUCCESS
- V164 Linh Thú / Tri Kỷ Runtime Authority: CLOSED / LOCKED.
  - Executable closure: `1a1013d9cad94c9be341f26ea3e5e486232ee6d3`
  - Canonical QA: `34580265307` — SUCCESS
- V165 Trang Bị / Set Runtime Authority: CLOSED / LOCKED.
  - Executable closure: `9c2dbf976ac10952eb731a1d2c24fe6660e37e42`
  - Canonical QA: `34581685047` — SUCCESS
- V166 Công Pháp / Kỹ Năng / Tâm Pháp Runtime Authority: CLOSED / LOCKED.
  - Executable closure: `d2ed13fd29755bd2675b958fe583fe10128787a1`
  - Canonical QA: `34587204274` — SUCCESS
- V167 Đan Dược / Nguyên Liệu / Luyện Đan Runtime Authority: CLOSED / LOCKED.
  - Executable closure: `79d000cffd9f38fc8ec8bcc825ffb14d52090d47`
  - Canonical QA: `34653220649` — SUCCESS
- V168 Combat / Stat Runtime Authority Consolidation: CLOSED / LOCKED.
  - Executable closure: `8c087d5ed34dd7bfadf2dc8c8bb9a84b0b7f223d`
  - Closure QA commit: `60218e515d55ff105035b4694c56b5c02bafd814`
  - Canonical QA: `34671514410` — SUCCESS
- V169 Động Phủ / Phân Thân / Offline Runtime Authority Consolidation: CLOSED / LOCKED.
  - Executable/runtime candidate: `979b198c2fee38c44753db6cba0b195f8370decb`
  - Closure QA commit: `249037cdcedcbbc1606762e6774aab4edc9bacd1`
  - Fast QA: `34679058612` — SUCCESS
  - Canonical QA V140→V169: `34679093062` — SUCCESS
- V170 Luân Hồi / Life Settlement / Meta Progress Runtime Authority Consolidation: CLOSED / LOCKED.
  - Runtime candidate: `5d47f4593c9eba911aa1a88fad14ad4746426275`
  - Closure QA commit: `7b6de1ee81fca1954019fdd46bbfc75207f12d99`
  - Fast QA: `34679623942` — SUCCESS
  - Canonical QA: `34679660149` — SUCCESS
  - Backend closure: PASS
  - Frontend closure: PASS
- V171 Endgame / Immortal / Dao Suy Runtime Authority Consolidation: CLOSED / LOCKED.
  - Primary runtime fix: `fd1717a020703b320d8e4e073f6d4e3a6ae2624e`
  - Runtime candidate: `af7d823178d496bbf0f4c5b6d021b8b181e60d52`
  - Closure QA commit: `31e6091af189f834ff68f3cf0a6d0705cc255812`
  - Fast QA: `34685552086` — SUCCESS
  - Canonical QA: `34685583563` — SUCCESS
  - Backend closure: PASS
  - Frontend closure: PASS

## Locked Collection authority

- V12326 is the player-facing Collection/Gacha progression authority.
- V12325/V12316 strengthen/advance/equip/unequip names are compatibility aliases only.
- `collectionV12316` remains the canonical runtime/save container for Collection systems.

## Locked V163 authority

- Pháp Bảo ownership/progression: `state.collectionV12316.items`.
- Equipped Pháp Bảo: `state.collectionV12316.activeArtifactIds`.
- Active Chí Bảo: `state.collectionV12316.economyV12325.activeRelicId`.
- Production combat applies Collection artifact/relic authority once.
- V168 supersedes the old Integration compatibility path: legacy `state.artifacts` remains only for history/Luân Hồi/world-relic compatibility and does not add combat power.

## Locked V164 authority

- Linh Thú and Tri Kỷ ownership/progression: `state.collectionV12316.items`.
- Active Linh Thú: `state.collectionV12316.activePetId`.
- Active Tri Kỷ: `state.collectionV12316.activeCompanionId`.
- Linh Thú V147 is canonical; `spirit-beast-v86.js` is a compatibility adapter into V147, not a second authority.
- All owned Linh Thú contribute intended raw bond stats; only active Linh Thú contributes active percentage bond/combat triggers.
- Tri Kỷ V148 is canonical behavior inside `confidant-v87.js`; only active Tri Kỷ contributes combat triggers.
- Tâm Lực/Heart V148 mutates canonical Collection item state.
- Production combat composes Linh Thú + Tri Kỷ once; no duplicate combat state was found.
- Historical Pet Gear V12328 remains only as a retired compatibility transport: it throws before mutation and its combat multiplier is neutral.
- Snapshot/restore preserves active pet/companion selectors and canonical progression.
- No balance/rate/reward changes were made in V164.

## Locked V165 authority

- Canonical Trang Bị state: `state.equipment`.
- V142 progression authority: equipment Rank (`equipmentRankIndex`) + Enhancement capped at +15 + authored Affix + V142 Set engraving/resonance.
- V142 does not use live Grade/Quality/Trait/Đạo Văn/Ngũ Hành Ngọc progression.
- V115/V128 Đạo Văn/Gem mutation methods remain only for legacy equipment and reject `equipment.v142`.
- V142 Set power is derived from equipped V142 item IDs through `equipmentSetPowerV142` and composed once by the equipment combat adapter.
- V116 Set behavior remains a separate compatibility lane for legacy equipment; it is not a second V142 Set authority.
- Restore canonicalization clamps V142 enhancement to +15 and removes retired legacy progression payloads from V142 items while preserving valid V142 Set/resonance state.
- Legacy equipment compatibility semantics remain intact.
- No equipment balance, fragment, Set bonus, Affix, Hunt reward or slot-count changes were made in V165.

## Locked V166 authority

- Công Pháp V127 ownership/progression remains in `state.collectionV12316.items`; all learned manuals stay effective simultaneously.
- Kỹ Năng/Tâm Pháp progression authority is `state.character.buildFoundation.progressionV125` using V12317 levels, grades and fragment wallets.
- Session skill upgrade/advance routes through `upgradeSkillLevelV12317` / `advanceSkillGradeV12317`.
- V103/V119 technique/manual combat runtime remains retired and neutral.
- Restore canonicalization removes duplicate and non-authored IDs from `learnedDaoPassiveIdsV118`, preventing stale/tampered saves from creating extra Tâm Pháp authority.
- No manual/skill/heart balance, costs, caps, authored effects or combat coefficients were changed in V166.

## Locked V167 authority

- `alchemy.v146` owns production, read model and current pill runtime authority.
- V112 method names/state remain compatibility surfaces; they are not a second production authority.
- Restore converts all valid V112 pill inventory IDs into V146 IDs immediately, including future-realm stock, without losing quantity.
- Retired `daoPower` / `daoBody` / `daoDefense` pills map to V146 `lifePower` / `lifeBody` / `lifeDefense`.
- V146 consumer remains authoritative for realm eligibility, quotas and effects at use time.
- V146 ingredient authority remains exactly Linh Thảo + Yêu Đan.
- Frontend eager static graph stays within the existing 193-module performance lock.
- No pill values, recipes, quality rates, quotas, costs, craft times or balance were changed in V167.

## Locked V168 authority

- Final production stat composition is locked as: base CombatEntity → Character → Equipment/Set → Collection → Reincarnation Artifact talents → Đạo → Integration → Great Vehicle → Immortal → Reincarnation combat talents → Birth origins → Alchemy → combat consumers.
- Character provenance replays the runtime order: Physique/Bloodline → Core Potential → Fate → Đạo Tính → Linh Căn V145 → Tâm Pháp.
- HP authority is explicit: unmarked legacy/synthetic entities use `physique × 20`; after Equipment + Collection materializes raw/% HP, `maxHpAuthorityV168 = 'materialized'` makes that `maxHp` authoritative through later stages; body pills add `20 HP/body` once; `combatHpMultiplierV124` is applied once.
- Raw/% HP from Equipment, Collection, Integration, Immortal and Alchemy is no longer silently erased or double-counted.
- Legacy `state.artifacts` cannot re-enter combat through Integration; Collection remains the only production Pháp Bảo/Chí Bảo combat authority.
- Accuracy, Mobility, Control Power and Resolve are included in stat provenance because they are live combat consumers.
- Restore guards cover retired V142 equipment lanes, duplicate/invented Tâm Pháp passives, V112 pill IDs, and duplicate/dangling artifact/loadout references.
- Full-build parity is locked between stat-source breakdown, Personal Power sheet/facade, public API and final CombatEntity.
- No balance values, coefficients, rates or rewards were changed in V168.

## Locked V169 authority

- Động Phủ facility mutation authority remains the canonical Collection cave state; `dongfu-v99.js` is read/composition only.
- Six Lục Đạo Phân Thân are owned by Soul state plus V127 realm-gated milestones; legacy `parallelWorkerCapacity` cannot unlock extra clones.
- Soul→Dungeon synchronization canonicalizes clone identity, active avatar workers and assignments before settlement.
- Duplicate/tampered avatar workers cannot cause one assignment to settle more than once.
- Duplicate clone IDs/Lục Đạo slots, stale assignments and out-of-authority workers are sanitized on restore.
- Forge queues are canonicalized so duplicate job IDs cannot settle twice.
- Động Phủ facilities are restored to the authored facility set with Lv1–10 bounds.
- Offline return keeps the authored 24h cap and has a restore-safe replay guard so the same elapsed interval cannot mint Tự Tu reward twice.
- No second Phân Thân offline reward channel was introduced.
- Existing V154 clone authority and V156 Động Phủ production/transport gates remain green.
- No offline cap, Phân Thân strength, Động Phủ discount, Hunt reward, production time or authored rate was changed in V169.

## Locked V170 authority

- Saved `tree.lifetimePointsEarned` is the only restore-time RP budget authority.
- Tree ranks plus shared/Fate spend cannot exceed earned RP after restore.
- Fate paid nodes require authored prerequisite chains and paid `sharedSpentPoints`; free mortal starters remain authored.
- Active Fate must be a valid unlocked Fate.
- Permanent Potential restore never increases `lifetimeEarned` from allocations; `allocations + unspent` reconciles exactly to saved earned Potential.
- Duplicate Luân Hồi `rewardHistory` rows and settlement archives collapse to one row per `lifeId`.
- Live `finalizeReincarnationRewards()` remains idempotent: repeated finalize on the same life does not mint RP/Potential/archive again.
- Valid saves remain unchanged; only impossible/overspent/tampered restore states are reduced to their earned budget.
- No RP formula, Tree/Fate cost/effect, Permanent Potential conversion, energy, birth or settlement balance value changed in V170.

## Locked V171 authority

- Restore is not allowed to trust impossible Immortal/endgame state from save.
- Immortal authored axes whose live mutation range is `0..100` are clamped to the same range during restore; valid values are preserved.
- `immortal.awakened` is derived from realm authority.
- Manifestation capacity is derived from realm milestones, not from the saved capacity field.
- Restored active manifestations are deduplicated, filtered by actual current ownership/eligibility and capped to the realm-derived capacity.
- `daoSuyTribulationsPassed` cannot be lower than the successes accounted in `daoSuyTribulationsPassedByMajor`; per-major counts remain bounded to the authored maximum.
- New-life carry-over was audited: `buildReincarnatedState()` already creates fresh Soul/Dao/Tribulation/Immortal state, so no endgame progress leaks across Luân Hồi.
- The V171 restore canonicalizer is kept inside already-eager `session-restore.js`; the frontend initial static graph remains within the locked 193-module limit without raising the threshold.
- No realm, Immortal, Dao Suy, Manifestation, combat, Genesis, economy or Luân Hồi balance value changed in V171.

## Evidence

- V164 guards: `qa/tests/v164-pet-confidant-runtime-authority-test.js`, `qa/tests/v164-pet-confidant-integration-authority-test.js`.
- V164 canonical closure: `34580265307` — SUCCESS.
- V165 guard: `qa/tests/v165-equipment-runtime-authority-test.js`.
- V165 Fast QA: `34581569363` — SUCCESS.
- V165 canonical closure: `34581685047` — SUCCESS.
- V166 guard: `qa/tests/v166-manual-skill-heart-runtime-authority-test.js`.
- V166 Fast QA: `34587119755` — SUCCESS.
- V166 canonical closure: `34587204274` — SUCCESS.
- V167 guard: `qa/tests/v167-alchemy-runtime-authority-test.js`.
- V167 Fast QA: `34653147356` — SUCCESS.
- V167 canonical closure: `34653220649` — SUCCESS.
- V168 guard: `qa/tests/v168-combat-stat-runtime-authority-test.js`.
- V168 authority matrix: `qa/tools/v168-combat-stat-authority-matrix.json`.
- V168 Fast QA: `34671477519` — SUCCESS.
- V168 canonical closure: `34671514410` — SUCCESS.
- V169 guard: `qa/tests/v169-idle-runtime-authority-test.js`.
- V169 Fast QA: `34679058612` — SUCCESS.
- V169 canonical closure: `34679093062` — SUCCESS.
- V170 guard: `qa/tests/v170-reincarnation-meta-runtime-authority-test.js`.
- V170 Fast QA: `34679623942` — SUCCESS.
- V170 canonical closure: `34679660149` — SUCCESS.
- V171 guard: `qa/tests/v171-endgame-runtime-authority-test.js` — 6/6 PASS.
- V171 Fast QA: `34685552086` — SUCCESS.
- V171 canonical closure: `34685583563` — SUCCESS.
- V171 closure QA commit: `31e6091af189f834ff68f3cf0a6d0705cc255812`.

## Working rule

Repository current `main` is source of truth.
Use search → narrow read → patch → targeted proof.
Do not reopen locked systems unless a regression proves necessary.
Do not create a new version solely for naming continuity; open the next scope only when the next subsystem objective is selected.
