# CURRENT CHECKPOINT

This file is the source of truth for a new chat.
Read this first. Do not reconstruct project state from old chats or memory without checking current `main`.

## Active state

- Repository: `vuanhtuan161094-byte/tutiennhandoi`
- Branch: `main` only.
- Workflow rule: `search → narrow source → audit → minimal patch → targeted proof → Fast QA → [closure] → Canonical QA → checkpoint`.
- Do not open a version only for numbering continuity.
- Do not reopen locked systems without a proven regression.
- **All selected non-UI runtime/authority work is CLOSED / LOCKED through V179.**
- **V180 is NOT OPEN.** The attempted final cross-system audit did not justify another numbered patch because the existing player-journey gate plus Canonical closure already cover the selected non-UI objective.
- **Next project phase: UI/UX / presentation layer. Stop and notify the user before starting UI work.**

## UI/UX phase

- UI/UX phase started on 2026-09-13 after explicit user confirmation.
- First vertical slice: **Home / Tu Luyện + UI System V1 foundation**.
- Audit and architecture: `docs/ui/UI_UX_PHASE_AUDIT_AND_ARCHITECTURE_20260913.md`.
- Candidate commit: `89f5102ff5513061a5a30934e1ef336bf959940a`.
- Candidate Fast QA run `34738447257` — **SUCCESS**.
- Backend Fast: **25/25 PASS**.
- Frontend Fast: **7/7 PASS**, including `ui-frontend-home-vertical-slice-test.js`.
- Frontend performance hard lock remains **193 modules / 4141.1 KiB**.
- Closure QA: pending.
- This UI slice changes presentation only. V160–V179 runtime/save/gameplay authorities remain CLOSED / LOCKED.

## Locked versions

- V160 — full-life audit: LOCKED.
- V161 — economy/pacing closure: LOCKED.
- V162 — Collection Runtime Authority: CLOSED / LOCKED.
- V163 — Pháp Bảo / Chí Bảo Runtime Authority: CLOSED / LOCKED.
- V164 — Linh Thú / Tri Kỷ Runtime Authority: CLOSED / LOCKED.
- V165 — Trang Bị / Set Runtime Authority: CLOSED / LOCKED.
- V166 — Công Pháp / Kỹ Năng / Tâm Pháp Runtime Authority: CLOSED / LOCKED.
- V167 — Đan Dược / Nguyên Liệu / Luyện Đan Runtime Authority: CLOSED / LOCKED.
- V168 — Combat / Stat Runtime Authority: CLOSED / LOCKED.
- V169 — Động Phủ / Phân Thân / Offline Runtime Authority: CLOSED / LOCKED.
- V170 — Luân Hồi / Life Settlement / Meta Progress Runtime Authority: CLOSED / LOCKED.
- V171 — Endgame / Immortal / Dao Suy Runtime Authority: CLOSED / LOCKED.
- V172 — Faction Membership Runtime Authority: CLOSED / LOCKED.
- V173 — World → Hunt Runtime Authority: CLOSED / LOCKED.
- V174 — Action Settlement & One-shot Reward Runtime Authority: CLOSED / LOCKED.
- V175 — Social Family Identity Runtime Authority: CLOSED / LOCKED.
- V176 — First-life Story Settlement Runtime Authority: CLOSED / LOCKED.
- V177 — Session Action Identity Runtime Authority: CLOSED / LOCKED.
- V178 — Current-Life Identity Runtime Authority: CLOSED / LOCKED.
- V179 — Guidance Worker Policy Runtime Authority: CLOSED / LOCKED.

## Current QA baseline

At V179 closure:

- Fast candidate: `fef322900b1cfc2bb126bb4ccb2f339820c663ba`
- Fast QA run `34735361470` — **SUCCESS**
  - Backend Fast: **25/25 PASS**
  - Frontend Fast: **6/6 PASS**
- Shared V178/V179 closure commit: `dd3930371ee58ee4d9e35cfdfc2a253a64efe15d`
- Canonical QA run `34735478253` — **SUCCESS**
  - Backend closure: **119/119 PASS**
  - Frontend closure: **20/20 PASS**
  - Includes `v158-player-journey-integration-test.js` and all authority guards through V179.

### Frontend performance lock

`qa/tests/v129-frontend-performance-test.js` is a hard lock:

- initial static module graph must remain **≤ 193 modules**;
- initial static graph size must remain **≤ 4.40 MiB**;
- never raise these thresholds to make a change pass.

V177–V179 added no new eager frontend runtime module; Fast and Canonical frontend gates remained green.

## Locked runtime authorities

### V162 — Collection

- `state.collectionV12316` is the canonical runtime/save container for player-facing Collection systems.
- V12326 is player-facing Collection/Gacha progression authority.
- V12325/V12316 strengthen/advance/equip/unequip names are compatibility aliases only.

### V163 — Artifact / Relic

- Pháp Bảo ownership/progression: `state.collectionV12316.items`.
- Equipped Pháp Bảo: `state.collectionV12316.activeArtifactIds`.
- Active Chí Bảo: `state.collectionV12316.economyV12325.activeRelicId`.
- Legacy `state.artifacts` is history/Luân Hồi/world-relic compatibility only and does not add production combat power.

### V164 — Pet / Confidant

- Ownership/progression is in Collection.
- Active Linh Thú: `activePetId`; active Tri Kỷ: `activeCompanionId`.
- V147 pet and V148 confidant behavior are canonical.
- Only active pet/companion contributes active combat triggers; historical Pet Gear lane is retired/neutral.

### V165 — Equipment / Set

- Canonical equipment state: `state.equipment`.
- V142 authority: rank + enhancement capped at +15 + authored affix + V142 Set engraving/resonance.
- Legacy Đạo Văn/Gem mutation does not apply to V142 equipment.
- Restore removes retired V142 payloads while preserving valid Set/resonance state.

### V166 — Manual / Skill / Heart

- Công Pháp ownership/progression is Collection; all learned manuals remain effective.
- Skill/Heart authority: `state.character.buildFoundation.progressionV125`.
- V103/V119 combat runtime is retired/neutral.
- Restore removes duplicate/non-authored Tâm Pháp passive IDs.

### V167 — Alchemy

- `alchemy.v146` owns production/read/current pill authority.
- V112 remains compatibility only.
- Restore converts valid V112 pill IDs to V146 IDs, including future-realm inventory.
- Ingredient authority remains Linh Thảo + Yêu Đan.

### V168 — Combat / Stat

- Production composition order is locked: base entity → Character → Equipment/Set → Collection → Reincarnation Artifact talents → Đạo → Integration → Great Vehicle → Immortal → Reincarnation combat talents → Birth origins → Alchemy → consumers.
- Materialized HP authority prevents raw/% HP loss or double-count.
- Legacy artifact state cannot re-enter combat.
- Full-build parity is locked across breakdown/UI/API/final CombatEntity.

### V169 — Cave / Clone / Offline

- Six Lục Đạo clone authority is owned by Soul + authored realm milestones; legacy `parallelWorkerCapacity` is not unlock authority.
- Soul→Dungeon synchronization canonicalizes clone identity/workers/assignments before settlement.
- Duplicate clone/work/forge identities cannot settle twice.
- Cave facilities stay on authored set and Lv1–10 bounds.
- Offline reward keeps authored 24h cap and restore-safe replay guard.

### V170 — Reincarnation / Meta

- `tree.lifetimePointsEarned` is sole restore-time RP budget authority.
- Tree/Fate/shared spend cannot exceed earned RP.
- Active Fate must be valid and paid/unlocked with authored prerequisites.
- Permanent Potential restore cannot invent lifetime earned potential.
- Duplicate reward/archive rows collapse by `lifeId`.
- `finalizeReincarnationRewards()` is idempotent per life.

### V171 — Endgame

- Restore does not trust impossible Immortal state.
- Authored axes are bounded, `awakened` and manifestation capacity are realm-derived.
- Active manifestations require actual ownership/eligibility.
- Dao Suy pass count reconciles against per-major success evidence.
- New-life reset does not leak Soul/Dao/Tribulation/Immortal progress.

### V172 — Faction Membership

- Rank is earned runtime authority; restore may reduce impossible authority but never invent promotion.
- Ordinary joined factions cannot restore as leader.
- Player-founded leader requires canonical founder identity.
- Active membership requires matching active `player:<lifeId>` member identity.
- Merit/contribution are normalized only to valid finite non-negative values.

### V173 — World → Hunt

- Orthodoxy territory list and owner mirror must agree.
- Inventory/economy only normalize impossible numeric state; valid positive balances are preserved.
- World opportunity claims are reconstructed from valid union of durable mirrors to prevent replay.
- Relationship endpoints/axes are validated.
- Genesis active worlds are bounded by realm-derived capacity.
- Hunt clear/unlock authority reconciles with per-floor boss-win evidence.

### V174 — One-shot Settlement

- Content Event completion is reconstructed from valid union of completion list and validated choices.
- Invalid/dangling event/choice IDs are removed.
- Dungeon first-clear V89 settlement evidence may raise only authored dungeon/floor progress and never lowers legitimate progress.
- Hunt keys cannot forge Dungeon authority.
- Generic daily/weekly counters were not reconstructed because no safe independent current-period authority exists.

### V175 — Social Family Identity

- Allocated `family.child.<lifeId>.<serial>` IDs are durable lower-bound evidence for the next family serial.
- Restore preserves legitimate higher serials; malformed IDs cannot forge authority.
- `createChildForLife()` rechecks immediately before minting a new ID.
- Existing family members are never renumbered or removed.

### V176 — First-life Story

- First-life beats are one-shot settlements.
- Restore can reconstruct missing completion from validated current-first-life history evidence.
- Authored beat IDs: `first.awakening`, `first.qi_awakened`, `first.first_clear`, `first.choose_path`.
- Choice history is validated against authored choices and prerequisite semantics.
- Later-life history cannot create first-life completion authority.

### V177 — Session Action Identity

Finding: `snapshot().actionIndex` could lag behind already-authored action-indexed history. A later live action could then reuse an event identity and replay the same action RNG branch.

Locked authority:

- validated Bế Quan history identities provide a durable lower bound for `actionIndex`;
- restore raises stale `actionIndex` to the next safe value;
- valid higher indexes are preserved;
- only validated authored evidence contributes authority;
- full restore proof verifies both unique next event identity and RNG continuity against an untampered control save.

Evidence:

- Runtime fix: `d1c9b43bb015c5fd2fbc4b5e35ff25cca5f65595`
- Targeted proof: `fe22e5e0e38a4bd3394fefaa2076f413d804a2f0`
- Fast candidate: `e7124505c1eb66f63b82d76a4cf601423e06dccf`
- Fast QA `34734822116` — **SUCCESS**
- Closure commit: `0b40b23c18f43568001b9f82cd524149f42acb7b`
- Canonical QA `34734862042` — **SUCCESS**
- Version note: `docs/V177_SESSION_ACTION_IDENTITY_RUNTIME_AUTHORITY.md`

### V178 — Current-Life Identity

Finding: live runtime authors deterministic `lifeId = life.<lifeNumber>`, but restore previously trusted `lifeNumber` and `lifeId` independently. A stale `lifeId` could disconnect valid Faction and first-life consumers.

Locked authority:

- valid positive `lifeNumber` projects canonical `life.<lifeNumber>`;
- canonical `life.<n>` may recover a missing/invalid number;
- valid matching identity remains unchanged;
- if neither side has valid canonical evidence, restore does not invent identity;
- repair runs before current-life keyed consumers.

Evidence:

- Runtime fix: `ee4b7487ba6846dfd764d3c4fb8c54c9f0573dcb`
- Targeted proof: `01b830f742a0bcd4538cd8357b9c0a6f4faff12b`
- Guard: `qa/tests/v178-current-life-identity-runtime-authority-test.js` — 6/6 PASS
- Shared Fast QA `34735361470` — **SUCCESS**
- Shared closure commit: `dd3930371ee58ee4d9e35cfdfc2a253a64efe15d`
- Shared Canonical QA `34735478253` — **SUCCESS**
- Version note: `docs/V178_CURRENT_LIFE_IDENTITY_RUNTIME_AUTHORITY.md`

### V179 — Guidance Worker Policy

Finding: Guidance main action planning honored automation policy, but pre-loop Phân Thân dungeon auto-assignment could mutate assignments before those policy checks.

Locked authority:

- no worker auto-assignment when `dungeon` is not in `allowedActivityTypes`;
- no assignment into `blockedDungeonIds`;
- no auto-assignment while injury exceeds `automationPolicy.maxInjury`;
- allowed assignments preserve existing scoring and behavior.

Evidence:

- Runtime fix: `8c9cc37088014841e483897f3bfc66f3aa91f3c9`
- Targeted proof: `de3c2b84a90cda5d155622fcf01c934e16549b79`
- Guard: `qa/tests/v179-guidance-worker-policy-runtime-authority-test.js`
- Shared Fast QA `34735361470` — **SUCCESS**
- Shared closure commit: `dd3930371ee58ee4d9e35cfdfc2a253a64efe15d`
- Shared Canonical QA `34735478253` — **SUCCESS**
- Version note: `docs/V179_GUIDANCE_WORKER_POLICY_RUNTIME_AUTHORITY.md`

## Audits that did not justify a patch

- Hunt → Alchemy V146 settlement: no current production caller for the suspected legacy settlement path; current Hunt reward path already supplies Yêu Đan.
- PvP season payout: existing season advancement plus V89 progression-award idempotency already prevents the suspected replay path.
- Final non-UI cross-system audit: existing V158 player journey plus Canonical closure through V179 provided the selected journey coverage; no additional V180 runtime finding was proven.

## Working rule for next chat

1. Read this checkpoint first, then current `main` source.
2. Do not use old gameplay memory as authority.
3. Do not reopen V160–V179 unless a real regression is demonstrated.
4. Do not create V180 merely to continue numbering.
5. Non-UI runtime work is considered complete for the selected scope.
6. **Before starting UI/UX work, explicitly notify the user that the project has reached the UI phase.**
