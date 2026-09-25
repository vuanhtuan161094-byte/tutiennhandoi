# CURRENT CHECKPOINT

This file is the source of truth for a new chat.
Read this first. Do not reconstruct project state from old chats or memory without checking current `main`.

## Active state

- Repository: `vuanhtuan161094-byte/tutiennhandoi`
- Branch: `main` only.
- Workflow rule: `search → narrow source → audit → minimal patch → targeted proof → active local gate → user visual approval when applicable → Canonical QA → checkpoint`.
- **UI/UX workflow is governed by `docs/ui/UI_UX_WORKFLOW_V2_20260913.md`: source snapshot → real runtime baseline → UX audit → narrow brief → candidate patch → targeted/Fast QA → real runtime after-screenshot → user visual approval → [closure] → Canonical QA → checkpoint.**
- Do not open a version only for numbering continuity.
- Do not reopen locked runtime systems without a proven regression.
- **All selected non-UI runtime/authority work is CLOSED / LOCKED through V179.**
- **V180 is NOT OPEN.** The attempted final cross-system audit did not justify another numbered patch because the existing player-journey gate plus Canonical closure already cover the selected non-UI objective.
- **Historical web UI closures remain LOCKED. The user has paused further Combat/Sword VFX work; current requested engineering priority is backend. Do not resume VFX unless explicitly requested.**

## Combat backend V3 migration — CLOSED / LOCKED (2026-09-24)

- Exact verified runtime SHA: `00f944feeebe99778beec0c1d727060e47dfc5ec`.
- Closure evidence from the user-local one-click gate:
  - `V140 BACKEND CLOSURE: 134/134 PASS`;
  - `V140 FRONTEND CLOSURE: 34/34 PASS`;
  - `FULL CLEAN + CANONICAL: PASS`;
  - exact SHA reported: `00f944f`.
- Closure record: `docs/runtime/COMBAT_BACKEND_V3_CLOSURE_20260924.md`.
- Gameplay/balance remained frozen. No new stats, Đạo, formulas, rewards, or progression rules were intentionally added by this migration.
- Production structural boundary:
  - canonical `CombatEntityFactory`;
  - `CombatEncounterCompiler`;
  - explicit activity settlement policy;
  - typed `combat-result.v1 / combat-event.v1`;
  - production `CombatKernelV3` facade.
- Production consumers are cut to V3 for new fights: equipment benchmark/intelligence, Content Event, Đạo Suy, Dungeon, Endless Hunt/Boss including representative/offline TTK sampling, and new PvP fights.
- Historical PvP replay remains engine-versioned: missing/`combat.v2` replays use the frozen V2 compatibility oracle; `combat.v3` replays use V3.
- V3 intentionally executes the locked V168 `CombatEngine` through `combat-engine.v168-compat`. Deep decomposition of the old engine is **not required for this closure** and must not be used as a reason to reopen balance.
- V2 remains only for deterministic parity/oracle coverage, historical replay compatibility, and narrow compatibility aliases. Do not delete it while those obligations remain.
- Regression/parity guards remain wired into Backend Fast:
  - `combat-backend-phase1-3-regression-test.js`
  - `combat-backend-phase4-6-regression-test.js`
  - `combat-backend-phase7-8-parity-test.js`
  - `combat-backend-phase9-cutover-test.js`
- V150 Bảo Khí is suppressed from the live player-facing Combat stream; stale V2 production metadata/read-model labels were normalized to V3.
- **Status: CLOSED / LOCKED.** Reopen only for a proven regression, an explicitly requested new combat feature, or a separately scoped internal-engine refactor with parity proof.

## Sword Dao Production V1 — A–E IMPLEMENTED / QA PENDING (2026-09-25)

- User explicitly reopened Sword backend gameplay as a new feature slice after Combat Backend V3 closure.
- Canonical design contract: `docs/runtime/SWORD_DAO_PRODUCTION_CONTRACT_20260925.md`.
- This is a **candidate**, not CLOSED/LOCKED, until the exact candidate passes the local backend/full-clean gates.
- Implemented directly on `main`:
  - design lock: `0e27ce0eb7df3670135f7883629f5b3777a61617`;
  - Batch A — fixed Sword CN / authored Gauge / Kiếm Khí spend-generate: `de15e39fca092a9c2022d033faf63d31ec7a46f5`;
  - Batch B — Kiếm Ý from actual Qi spend + redesigned 8 passive runtime: `d8a25545c3e22bc3d8e5171dde12bd932843a5a9`;
  - Batch C — mastery identity fixes + Tiên Vương realm-gated Thái Hư Kiếm Vực: `39d42dba340eea1bf51c6e47c95630e5217a216c`;
  - Batch D — auto Cửa Sát / bounded 4s Ultimate hold: `f7adc0768ec77eff09ecdc95ebe4bb1e50581455`;
  - Batch E — targeted production-contract QA guard wired into Backend Fast: `81a15b9cd6cd6245d71df0719af0e94a2c51e7df`.
- Sword fixed Chân Nguyên costs are now `0/3/0/5/5/3/8/9/12/0` for Basic/Flow/Nurture/BreakMark/Chain/Counter/Sever/Finisher/Myriad/Ultimate and no longer scale from Max Chân Nguyên.
- Sword authored Gauge gains are `4/3/8/5/4/3/6/5/15/0`; Ultimate still costs 100 Gauge.
- Kiếm Ý primary gain is now tied to real Kiếm Khí spend: spend 1–2 → +1 Ý; spend >=3 → +2 Ý. The old every-three-direct-actions generator is retired.
- Hồi Phong mastery >=500 now generates +2 Kiếm Khí, not +3.
- Thái Hư Kiếm Vực is no longer granted only by Ultimate mastery 1000; production gate is Tiên Vương realm order >=78 plus an Ultimate started at >=5 Kiếm Khí.
- Active slot progression remains the existing 1→2→3→4→5 and hard-caps at 5.
- **Deferred F — 5-stat migration has NOT started.** CL/TP/TPH/LL/TT design is frozen in the Sword contract but runtime still uses the current legacy Attack/Defense combat authority. Do not display the new scaling as production truth until F is implemented.
- Next action: run the exact candidate through local backend Fast / Mode 5 Full Clean. If green, open F as a separate migration slice; after F rerun Sword balance against the production runtime before converting the other seven Dao.

## Godot migration — ACTIVE

- Engine target: **Godot 4.7.2 stable**, primary viewport **390×844**.
- Canonical JavaScript runtime/save/gameplay authorities through **V179 remain CLOSED / LOCKED** and are still the gameplay oracle.
- Godot owns presentation/transport only unless a future parity-proven runtime-port slice is explicitly opened.
- Canonical bridge: `godot-bridge.v2`; Godot launches it on localhost port **4192**.
- Active Godot presentation:
  - Home hero rule: **Home = seated meditation; Character = standing**. Home now uses two small transparent video-derived seated frames (`home_meditation_idle_01.webp` and `home_meditation_idle_04.webp`) to avoid connector truncation; Character standing presentation remains separate.
  - Home / Tu Luyện production-art composition and procedural meditation motion;
  - Character screen, standing-idle presentation, profile/stats/potential flows;
  - rebuilt full-screen **Kho Đồ / Trang Bị V142** with Set, Vật Phẩm and Luyện flows.
- Character equipment inventory no longer lives inside `CharacterDetailSheet`; Character routes into the dedicated `equipment_inventory_screen.gd`.
- V142 equipment player-facing rules remain: **Bậc + Cường Hóa (+15 max) + Affix + Set**. Legacy Đạo Văn/Gem lanes stay compatibility-only and are hidden from the new Godot inventory.
- Kho Đồ canonical actions are bridged to existing runtime authority: equip, enhance, enhancement transfer, fragment craft/refine, 3→1 merge, Set engraving, Affix reforge/refine.
- Set art direction approved by the user on **2026-09-21**:
  - 5 attire sets × 6 slots = **30** assets;
  - 4 jewelry sets × 4 slots = **16** assets;
  - exactly **46** approved item-art cells.
- Runtime Set-art registry exists at `godot/scripts/character/equipment_asset_registry.gd` and expects:
  - `res://art/approved/equipment/atlases/attire_sets_v1.webp`;
  - `res://art/approved/equipment/atlases/jewelry_sets_v1.webp`.
- The two approved binary atlases are **not yet committed from the connector session**. `tools/slice_equipment_assets.py` now accepts the two approved source sheets explicitly and deterministically produces all 46 individual assets plus both runtime atlases without redrawing.
- Item rarity/frame animation and enhancement VFX are intentionally deferred; the user wants those designed separately after the base assets/inventory are integrated.
- Current Godot work is a **STATIC CANDIDATE**, not runtime-closed. No Godot PASS may be claimed until `KIEM_TRA_GAME.cmd` succeeds and actual 390×844 runtime evidence is reviewed.
- **P2 deterministic QA fixtures are now available but QA-only:** `CHOI_GAME_QA.cmd` launches an isolated save and enables F2 Kho Đồ, F3/F4/F5 Linh Quang ×2/×3/×4, F6 canonical-ready Đột Phá, F7 canonical order-41 Độ Kiếp preview, and F8 reset/clear. The fixture action is double-gated by diagnostic + QA env flags; normal `CHOI_GAME.cmd` cannot invoke it. Inventory fixture uses canonical V142 craft/merge/set/equip APIs; Đột Phá uses the real canonical action; Độ Kiếp does not bypass dungeon milestone blockers. `KIEM_TRA_GAME.cmd` now includes an isolated P2 fixture smoke in addition to the normal bridge smoke.
- GitHub Actions push automation is **disabled/manual-only** to avoid further Actions artifact/storage consumption. Normal verification is local:
  - web/runtime: `tools/web/TEST_GAME_LOCAL.cmd` (Mode 5 — FULL CLEAN for clean candidate proof);
  - Godot: `KIEM_TRA_GAME.cmd`.
- Repository hygiene pass on **2026-09-21** removed obsolete standalone Combat Layout Studio files, stale migration/tooling snapshots, old generated reports and duplicate Godot Home art fallbacks. Git history is the archive.
- Video animation asset tool added: `tools/video_to_godot_animation.py` + `TAO_ANIMATION_TU_VIDEO.cmd`. It converts video to sampled/chroma-keyed stable frames, deduplicates consecutive near-identical frames with duration preservation, builds lossless WebP atlas/metadata/preview, and can emit a Godot `SpriteFrames .tres` into an explicit `res://art/candidate/**` path. Default output remains `assets/_pipeline/video_animation/**`; it does not auto-promote assets to `approved/`. Synthetic self-test and a small FFmpeg MP4 end-to-end run passed during tool authoring.
- Xbox runtime review on **2026-09-22** exposed presentation defects despite the prior local gate passing: Home meditation visibly hard-flipped two key poses, Character procedural idle translated/rotated the entire standing master and read as floating, cultivation had no discrete gain feedback, and Ling Quang/breakthrough banners were flat fades. Current visual candidate removes the hard flip in favor of slow key-pose blending + local secondary motion, foot-anchors Character with a ground shadow, adds presentation-only `+N Tu Vi` pulses/bump from the authorized display counter, and gives cultivation events a pop/settle/fade motion. This candidate requires a fresh local Godot gate plus user video review before visual approval.

### Immediate next action

1. Combat Backend V3 is closed; do not reopen it for cleanup-only work.
2. Do not continue Sword/Combat VFX unless the user explicitly returns to that scope.
3. For any next backend task, refresh `main`, inspect the current runtime authority, and open only a proven defect or an explicitly requested system slice.
4. Godot presentation candidates and their visual QA remain preserved, but they are not the forced next task while backend work is the user's priority.
5. Keep V160–V179 gameplay authority locked unless a regression is proven.

## UI/UX phase

- UI/UX phase started on 2026-09-13 after explicit user confirmation.
- Audit and architecture: `docs/ui/UI_UX_PHASE_AUDIT_AND_ARCHITECTURE_20260913.md`.
- Product/visual direction: `UI_UX_PRODUCTION_DIRECTION_V1.md`.
- Canonical execution workflow: `docs/ui/UI_UX_WORKFLOW_V2_20260913.md`.
- **No reconstructed mock, partial HTML/CSS recreation, concept image, or placeholder preview counts as visual proof.**
- **No UI slice may move from candidate to LOCKED without screenshots from the actual runtime candidate and explicit user approval.**
- The web UI implementation order below is retained as historical closure context. Active new presentation work is governed by the Godot migration section above.
- Combat Readability remains an **open web presentation debt**, not the current forced next task while Godot Character/Kho Đồ is active.

### Home / Tu Luyện — CLOSED / LOCKED (Workflow V2)

- First vertical slice: **Home / Tu Luyện + UI System V1 foundation**.
- Original candidate commit: `89f5102ff5513061a5a30934e1ef336bf959940a`.
- Original candidate Fast QA run `34738447257` — **SUCCESS**.
- Backend Fast: **25/25 PASS**.
- Frontend Fast: **7/7 PASS**, including `ui-frontend-home-vertical-slice-test.js`.
- Frontend performance hard lock remains **193 modules / 4141.1 KiB**.
- Original technical closure commit: `4d5f937c3756250d6ef54d6338694a335c5c9e84`.
- Original technical closure QA run `34738690190` — **SUCCESS**.
- Original Backend Canonical Closure: **119/119 PASS**.
- Original Frontend Canonical Closure: **21/21 PASS**.
- App-shell and art-direction refinement continued under Workflow V2; approved exact-runtime candidate: `59006543e9f2b856b1e73dd61d7401abc633ba13`.
- Exact candidate Fast QA run `34749539482` — **SUCCESS**.
- Exact runtime Visual Proof run `34749539476` — **SUCCESS**.
- Artifact: `ui-visual-59006543e9f2b856b1e73dd61d7401abc633ba13`.
- Reviewed runtime viewports: **390×844** and **412×915**; no horizontal overflow.
- Visual runner proof is from the production runtime after save-safe deterministic fixture bootstrap; `mockOrReconstruction: false`.
- Runtime interaction smoke proves the Home side rail routes through canonical navigation: `cultivation → roots`, with real Linh Căn rendering, then returns to Home.
- User explicitly approved the exact runtime visuals on 2026-09-13; secondary self-review also passed. Non-blocking future polish only: some rail secondary text can lose contrast over bright hair/effects and the 390 px `Chiến Đấu` subtitle may truncate.
- Visual closure note: `docs/ui/UI_HOME_HUD_VISUAL_CLOSURE_20260913.md`.
- `[closure]` QA marker commit: `e57a76a1b5ce57e6a2cc9fe90e38a47472d3c897`.
- Canonical closure QA run `34749813355` — **SUCCESS**.
- Backend Canonical Closure: **122/122 PASS**.
- Frontend Canonical Closure: **26/26 PASS**.
- This UI slice changes presentation / navigation adapter only. V160–V179 runtime/save/gameplay authorities remain CLOSED / LOCKED.
- Workflow V2 status: **CLOSED / LOCKED**.

### App Shell / HUD — CLOSED / LOCKED (Workflow V2)

- Presentation patch commit: `10c2f613963d0ccdbb9bae0716e2b4e547e67fe7`.
- Original technical closure commit: `9800dfbf329e7d616a420149802ab0fc5282dabc`.
- Original technical closure QA run `34743561414` — **SUCCESS**.
- Backend Fast: **25/25 PASS**.
- Frontend Fast: **8/8 PASS**, including `ui-frontend-app-shell-hud-test.js`.
- Original Backend Canonical Closure: **119/119 PASS**.
- Original Frontend Canonical Closure: **22/22 PASS**.
- `app.js`, save schema, runtime authority and gameplay authority were not changed by the original App Shell/HUD slice.
- `ui-system-v1.css` remains an isolated presentation layer; QA hard-locks it to **< 20 KB** and **≤ 50 `!important`** so it cannot become another legacy CSS pile.
- HUD/navigation normalization locks: readable essential text, 44 px system-menu touch target, semantic active dock state via `aria-current`, focus-visible, reduced-motion, safe-area handling, and shared `StatePanel` grammar for loading/empty/blocked/error/success.
- Shared approved runtime candidate with Home: `59006543e9f2b856b1e73dd61d7401abc633ba13`.
- Shared exact runtime Visual Proof run `34749539476` — **SUCCESS**; user visual approval recorded 2026-09-13.
- Shared `[closure]` commit: `e57a76a1b5ce57e6a2cc9fe90e38a47472d3c897`.
- Shared Canonical closure QA run `34749813355` — **SUCCESS**.
- Backend Canonical Closure: **122/122 PASS**.
- Frontend Canonical Closure: **26/26 PASS**.
- Existing frontend performance hard lock passed; thresholds were not raised.
- Workflow V2 status: **CLOSED / LOCKED**.

### Character / Equipment — CLOSED / LOCKED (Workflow V2)

- Final approved exact-runtime candidate: `cc57f08c592c93e4eb4011e4105359c9c5c75edc`.
- Exact candidate Fast QA run `34778776376` — **SUCCESS**.
  - Backend Fast: **25/25 PASS**.
  - Frontend Fast: **13/13 PASS**.
- Exact Runtime Visual Proof run `34778776385` — **SUCCESS**.
- Artifact: `ui-visual-cc57f08c592c93e4eb4011e4105359c9c5c75edc`.
- Runtime proof is from the actual production candidate; no reconstructed mock or placeholder preview.
- User explicitly approved the final Character / Equipment visual on 2026-09-13.
- Canonical art direction is now locked to the same **chibi/manhua** hero family as Home / Tu Luyện.
- Locked presentation: hero-first composition; equipment slots float around the hero without dark vertical rail panels; labels use local readability plates; current-path plaque is compact; core stats are summary-first; `Tăng Điểm` is the dominant compact CTA; quick actions use the Home circular-destination grammar.
- Visual closure note: `docs/ui/UI_CHARACTER_EQUIPMENT_VISUAL_CLOSURE_20260913.md`.
- `[closure]` commit: `6a896d20e75ac27d763316a853b158916d1b51c9`.
- Canonical QA run `34779034544` — **SUCCESS**.
  - Backend Canonical Closure: **123/123 PASS**.
  - Frontend Canonical Closure: **27/27 PASS**.
- This slice changes presentation only; V165 Equipment and V168 Combat/Stat authorities remain CLOSED / LOCKED.
- Workflow V2 status: **CLOSED / LOCKED**.

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

For the latest approved Home / Tu Luyện + App Shell / HUD Workflow V2 closure:

- Approved runtime candidate: `59006543e9f2b856b1e73dd61d7401abc633ba13`
- Exact candidate Fast QA run `34749539482` — **SUCCESS**
- Exact runtime Visual Proof run `34749539476` — **SUCCESS**
- `[closure]` commit: `e57a76a1b5ce57e6a2cc9fe90e38a47472d3c897`
- Canonical QA run `34749813355` — **SUCCESS**
  - Backend closure: **122/122 PASS**
  - Frontend closure: **26/26 PASS**

For the latest approved Character / Equipment Workflow V2 closure:

- Approved runtime candidate: `cc57f08c592c93e4eb4011e4105359c9c5c75edc`
- Exact candidate Fast QA run `34778776376` — **SUCCESS**
  - Backend Fast: **25/25 PASS**
  - Frontend Fast: **13/13 PASS**
- Exact runtime Visual Proof run `34778776385` — **SUCCESS**
- `[closure]` commit: `6a896d20e75ac27d763316a853b158916d1b51c9`
- Canonical QA run `34779034544` — **SUCCESS**
  - Backend closure: **123/123 PASS**
  - Frontend closure: **27/27 PASS**

### Frontend performance lock

`qa/tests/v129-frontend-performance-test.js` is a hard lock:

- initial static module graph must remain **≤ 193 modules**;
- initial static graph size must remain **≤ 4.40 MiB**;
- never raise these thresholds to make a change pass.

V177–V179 added no new eager frontend runtime module; Fast and Canonical frontend gates remained green.
Home/App Shell and Character/Equipment Workflow V2 closures also passed the same performance hard lock without raising thresholds.

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
6. UI/UX phase follows `docs/ui/UI_UX_WORKFLOW_V2_20260913.md`; no UI closure before actual runtime visual proof and explicit user approval.
7. Home / Tu Luyện + App Shell / HUD + Character / Equipment are CLOSED / LOCKED. Next UI slice is **Combat Readability**, starting from the actual runtime baseline and preserving locked V168 Combat/Stat authority.
