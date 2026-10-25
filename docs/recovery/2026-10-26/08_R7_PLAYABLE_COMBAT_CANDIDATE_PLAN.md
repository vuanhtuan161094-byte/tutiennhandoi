# TND R7 — Playable Combat Candidate & Visual Acceptance Prep

**Date:** 2026-10-26 (Asia/Bangkok)  
**Status:** PROPOSED NEXT EXECUTION SCOPE — **NOT IMPLEMENTED / NOT APPROVED**  
**Repository:** `vuanhtuan161094-byte/tutiennhandoi`  
**Baseline `main` when authored:** `dcc1ab7266c45308c635a589ab521a80f60b65b3`  
**Existing unmerged code candidate:** `codex/tnd-recovery-r2-r5-20261026` at `5faabb720f21807e941f3846b1b43f013fb1cad5`  
**Input reports:** [R2](R2_ASSET_PRESERVATION.md), [R3](R3_ENDGAME_QA.md), [R4](R4_VISUAL_REVIEW.md), [R5](R5_COMBAT_UI_AUDIT.md), [Gates](COMMIT_AND_GATES.md), [Roadmap](07_ROADMAP_R2_R6.md).

## Product decision

**Focus on one real, testable, mobile-first combat experience**, not more backend/Dao mechanics. Keep Combat Backend V3, eight production-closed Dao, Linh Căn V145, resource/save authority and global balance LOCKED. R2–R6 did valuable verification, but visual acceptance remains open; animation smoothness, real Boss identity consistency, distinct victory/defeat UI and non-Ngự-Khí combat presentation need additional evidence.

## Non-negotiable execution boundary

- Use Windows **Godot 4.7.2**, pinned Node/Stagehand/GdUnit in writable isolated clone on C: or non-E location; **E: READ ONLY**, no launchers that reset/modify source on E:, no original player save reads/writes.
- Never change `src/**`, `dist/**`, canonical damage/AI/RNG/resource/reward logic, balance, eight Dao contracts, save schema, economy or deferred auxiliary systems. No test-only victory injection or lowering Boss stats to get green.
- Candidate work stays in **review branch**; docs-only factual reports may be committed fast-forward to main after refreshing. Do not merge unapproved code to main. A draft PR can be opened for review (no auto-merge) only after protected-diff + test gate.
- Do not publish 45 WIP binary asset files or local screenshots/videos until provenance/distribution permissions are verified; metadata and sanitized evidence indexes are safe.
- Respect agent instructions `AGENTS.md`, `godot/AGENTS.md`, `CURRENT_CHECKPOINT.md`, `docs/DEVELOPMENT_PROTOCOL.md`, `docs/systems/combat-ui/MODULE.md`, pinned vendored Godot skills. Tests and true runtime evidence, not number of commits, measure progress.

## R7-0 — Intake & security/regression review (P0)

Inspect exact 7 candidate files vs fresh main. GitHub compare at plan creation: **ahead 1 / behind 2**, diverged because main has docs-only commits. Do not blindly merge old candidate branch into main.

Candidate files:
- `godot/backend/bridge_server.mjs` — QA-only endgame setup, must require diagnostic+QA and isolated disposable save;
- `godot/backend/bridge_p2_fixture_smoke.mjs` — test on isolated port;
- `godot/scripts/core/backend_bridge.gd` — optional bridge-port env override;
- `godot/scripts/main/main.gd` — F10 QA-only;
- `godot/scripts/combat/combat_screen.gd` — tactical/player/Challenge geometry;
- `godot/scripts/home/home_hud.gd` — deferred button rebuild;
- `godot/tests/unit/combat_view_model_test.gd` — geometry assertions.

Specifically investigate reported incident: C clone Stagehand initially connected to E's port 4192. Require an explicit QA-port and QA-server identity handshake for all tests; fail closed rather than falling back to E's server. Verify port is not user-owned before starting it and test that production mode rejects `endgame-boss` and F10. Verify existing saves never written, and `QA_MODE` cannot be enabled accidentally by normal launch. Examine diff for unintentional production behavior and direct resource mutations. Reconcile candidate with latest main in isolated clone.

**Gate:** code/QA diff map, save/port isolation proof, negative production-mode fixture test, no 7-file merge yet, regression exact SHA.

## R7-1 — Boss identity trace and correct display (P0/P1)

Existing reports show **prefight Boss name differs from playback Boss name**, with no proven winner. Trace from `selectedFloor` / canonical monster ID / encounter ID through bridge DTO, prefight selection, `fightEndlessFloor`, combat snapshot, event playback and result. Provide structured row for each surface: canonical `monsterId`, display `name`, grade, stage/floor, encounter key, source function, timestamp/cursor. Determine whether preview is a different selected encounter or a presentation mapping bug. Add deterministic regression that fails on unsupported identity swap. If actual bug is display/transport, patch **presentation projection only**; if in locked gameplay, report a reproducer, do not alter runtime authority.

**Gate:** same actual canonical encounter ID/name remains consistent where design requires, test and at least prefight/playback screenshots; no hardcoded boss-name replacement.

## R7-2 — Real end-to-end victory + defeat coverage (P1)

R3 confirms canonical `battle.end`, playback `result.bossCleared: boolean`, 114 realm / 21601 floor and aftermath. It **does not require or prove victory** (`won` was only asserted boolean), nor necessarily the Godot Result screen. Extend isolated authorized QA fixtures/tests for:
- deterministic **actual WIN** from canonical combat outcome and resulting Godot result/aftermath;
- deterministic **actual LOSS** from canonical combat outcome and resulting Godot result/aftermath;
- replay and battle reset, persistent actor cleanup, resource reconciliation, isolation after restart.

Prefer existing QA data/real approved actions; **no direct mutation of outcome/HP/rewards**, no forced victory, no changes to locked gameplay. If cannot reliably reach either result via existing canonical mechanisms, record `BLOCKED — CANONICAL WIN/LOSS SCENARIO NOT AVAILABLE` separately while completing other tasks. Match backend result data and displayed result; do not infer Boss loot when direct Boss progression has none.

**Gate:** each outcome independently asserted, result screenshot (not just playback), event trace `battle.end`, post-result state and disposable save; no fake hits/outcomes.

## R7-3 — Seven remaining Dao playable review (P1)

Ngự Khí has a tested showcase; R5 mapped all eight Dao DTOs but **seven Dao do not yet have per-Dao canonical visual captures**. For Kiếm, Quyền, Thể, Thần Niệm, Pháp, Độc, Trận:
- identify existing canonical QA selections / valid loadouts;
- if present, run actual combat and capture prefight, representative cast/payoff, result if available;
- test `DaoWidget` meter/flag ownership and target-vs-player states; no client-calculated resource/cooldown/made-up telegraph;
- report which presentation animations/icons are production resources vs native placeholders;
- produce one *compact* matrix of readability and feature gaps rather than invent new 70+ animations.
If fixtures are missing, build QA-only deterministic setups using existing QA seam, bounded by isolation rules, or report exact missing input. Do not start broad art generation or 8 Dao VFX polish at once.

**Gate:** 8/8 Dao DTO assertions; minimum 1 actual playable canonical encounter per Dao if source permits, clearly separated from synthetic showcase and automated QA; image/runtime evidence local only.

## R7-4 — Objective visual fixes + time-based evidence (P1/P2)

Keep previous narrow tactical-lane and Home button fixes as candidate until verified. Inspect real 390×844 layout and responsive 360×800 / 430×932; prioritize player HP strip, silhouette visibility, challenge button, Boss telegraph and damage feedback. Any minor correction must have before/after screenshot, collision/contrast assertions, targeted and full Godot gate. Preserve original V1 baked-pink aura/weapon and candidate art as-is; propose A/B, **do not replace/promote** without owner acceptance.

Generate a real **time sequence** with timestamps, ideally locally encoded video if already supported by installed tools or screen capture; otherwise multi-frame sequence and clearly mark `MOTION NOT REVIEWED` when insufficient. Ask reviewer to rate: silhouette, skill gesture, persistent artifact behavior, travel, contact/impact, HUD legibility, Merge and Ultimate cadence. A synthetic 10-skill showcase is NOT proof of actual gameplay timing.

**Gate:** No false visual approval, exact frame metadata, well-supported fixes only, static and temporal evidence clearly classified.

## R7-5 — Auto UX decision preparation (P2)

Audit existing `AUTO ON` text: R5 states canonical Boss combat uses AI rotation, but there is **no authoritative toggle API**. Do not show a clickable disabled-looking fake control or invent auto-off. Provide recommended UX copy with semantic distinction:
- Boss combat **Tự động chiến đấu** (read-only state),
- separate `Săn Ảo/Auto Hunt` context,
- manual skill control only if a real gameplay action is separately designed and approved.
If noninteractive label is misleading, use explicit static status/presentation-only copy and test. Do not implement toggle without user product decision and backend authoritative action contract.

## R7-6 — Candidate review, output & ownership handoff (P0)

1. Inspect GitHub main and candidate ahead/behind again; avoid force pushes or overwriting other work.
2. Commit small scoped candidate changes only on isolated review branch; **draft PR to main** may be created for traceable review but must NOT be merged/auto-merged without required gates, rights and owner visual acceptance.
3. Execute targeted tests, Godot import/parse, `KIEM_TRA_GAME.cmd`, bridge P2, Home/Combat Stagehand and scenario-specific win/loss + Dao checks on exact tested SHA; never claim FULL CLEAN when binaries or pinned ignored tools were overlaid locally.
4. Publish **docs only** at `docs/recovery/2026-10-26/R7_*` with: `R7_EXEC_SUMMARY.md`, `R7_CANDIDATE_REVIEW.md`, `R7_BOSS_IDENTITY_TRACE.md`, `R7_WIN_LOSS_RESULT.md`, `R7_8_DAO_RUNTIME_MATRIX.md`, `R7_VISUAL_REVIEW_PREP.md`, `R7_GATE_LEDGER.md`, `R7_OWNER_DECISIONS.md` plus sanitized evidence index. Include exact tested SHA, reproducible commands, negative tests and blocked items; link candidate branch/PR if exists.
5. Keep binary runtime captures and WIP local, indexed by SHA-256. No automatic approved baseline refresh, asset promotion or gameplay unlock.

## Priority / stop conditions

Sequence **R7-0 → R7-1 → R7-2 → R7-3 → R7-4 → R7-5 → R7-6**, but if a part is blocked by absent fixtures/rights, record the blocker and continue independent stages. Never stall on an art-rights decision when other deterministic QA work is available. Limit concurrent heavy processes (8 GB RAM observed historically). Do not kill pre-existing Godot/Node processes or install software without permission.

**Owner decisions reserved:** art rights/WIP Git distribution; retain/soften/separate baked aura; visual approval of screenshots and combat video; whether to add manual-vs-auto skill control; promotion/merge of visual candidate. **Do not silently decide any of these.**

## Done criteria

Success is a **reviewable candidate with deterministic QA**, real Boss identity and separate win/loss proof (or precisely explained blockers), seven Dao runtime coverage status, evidence of readable Combat visual, and complete GitHub documentation. It is *not* Combat UI CLOSED until the owner reviews actual screenshots/video and signs off.
