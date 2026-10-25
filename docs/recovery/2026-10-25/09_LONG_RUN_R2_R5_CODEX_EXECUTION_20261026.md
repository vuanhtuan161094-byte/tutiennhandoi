# Tu Tiên Nhàn Dỗi — Codex Long Run R2–R5 (26/10/2026)

**Status:** OWNER-AUTHORIZED EXECUTION PLAN; NOT IMPLEMENTATION PROOF.  
**Repository:** `vuanhtuan161094-byte/tutiennhandoi`  
**Starting handoff `main`:** `3e15735589c3606bc539876e7981dbe35fc06b9c` (recheck live HEAD)  
**Reference:** [Recovery R1 README](README.md), [R1 roadmap](07_RECOVERY_ROADMAP.md), [audit](06_UI_UX_VISUAL_AUDIT.md), [next task](08_NEXT_CODEX_TASK.md).  
**Goal:** Maximize **verified** independent work in one extended local Codex execution without altering locked gameplay or risking local assets.

## 0. Non-negotiable boundaries

- Work in **local Windows Codex with access to E:** and Godot **4.7.2**, Node.js and pinned test tools. Cloud lacking E:/GUI cannot assert local results.
- **E: must remain READ ONLY** throughout. No write, sync, launcher, `git reset --hard`, `git clean`, rename, deletion, permissions change or save manipulation on E:. Read/hash/copy only. Audit actual filesystem, not assumptions.
- Create an independent **writable workspace on C: or another non-E disk** with sufficient space. Validate that no junction/symlink/cache/save paths write back to E:. Keep actual saves untouched; QA clone uses isolated synthetic/test fixtures only.
- Before changing any source, read `AGENTS.md`, `CURRENT_CHECKPOINT.md`, `GAME_MASTER_MAP.md`, `docs/DEVELOPMENT_PROTOCOL.md`, `godot/AGENTS.md`, active MODULE and pinned Godot skill(s).
- Gameplay authority is canonical JS Combat Backend V3, eight **CLOSED/LOCKED** Dao, authoritative resource/cooldown/damage/AI/RNG/save. No modifications to locked gameplay, balance, save or economy; no forcing victory by weakening enemies.
- **Do not publish** unapproved local art/video, 45 WIP files, player saves, personal data, sensitive logs, raw screenshot/video binaries to GitHub. Treat rights/provenance as UNKNOWN until verified; historical permission for other games is irrelevant.
- **No GitHub Actions** unless explicitly separately authorized; prefer local tests. No force-push or automatic merge of candidate visual/runtime code; no broad dependency upgrades.
- User's permission here **authorizes creating isolated QA-only fixture tooling and objective client/QA fixes**, not authorizing production visual approval, art redistribution, gameplay redesign or reopening deferred systems.
- Explicit one-task exception to the repo's normal main-only flow: *unapproved code candidate may be published to a dedicated `codex/tnd-recovery-r2-r5-20261026` review branch/draft PR*, never merged without required gates and owner visual acceptance. **Docs-only factual progress** may be fast-forward pushed to main after re-fetch, conflict check and security scan. If repo policy/tools block that exception, preserve a review patch in workspace and publish docs; do not silently put unapproved code into main.
- Single heavy job at a time (machine may have 8 GB RAM); protect user-owned Godot/Node processes; kill only processes this run started. Do not install software or change Windows power settings. If a stage is blocked, document and continue independent stages.

## 1. Start / evidence ledger

1. Re-fetch `main`, verify `3e157355...` or newer, read canonical files.
2. Inventory local Git status without modifying E:; compare to R1 findings (45 untracked WIP, line-ending-only launcher difference).
3. Create independent, clean C: workspace and test-output folder. Snapshot essential source/asset SHA-256, file count and save isolation; avoid copying ignored caches, original saves and unrelated files.
4. Create `RUN_LEDGER.md` recording for every phase: start/finish, exact SHA, commands, exit codes, test totals, runtime evidence, artifact path, block reason, next action.
5. Confirm fallback when fresh clone lacks pinned GdUnit (R1 bootstrap failed); copy pinned dependency from E read-only if allowed and hash/verify pin. Do not repin to latest version.
6. Establish a strict protected-source diff check against starting `main`.

## 2. R2 — asset inventory, full 11-clip manifest, provenance [P1]

**Inputs:** R1 `03_ASSET_INVENTORY.csv`, local candidate V1/V3 files, `combat_player_animation_registry.gd`, approved/candidate art contracts.

- Enumerate 45 untracked items exactly, compare hash/size/paths; **do not remove duplicates** or rename originals.
- Check **11 V1** (Idle + Basic + Deploy + Guard + Strike + Sync + Recall + Split + Merge + Suppress + Ultimate): corresponding JSON, TRES, WebP atlas, canonical registry skill ID, import path and source-name mapping. R1 found 34 files (11 triplets + one manifest) but root manifest only 4/11.
- Generate complete local manifest for 11/11 with clip ID, resource path, bytes, SHA-256, visual metadata, original-source relationship if evidenced, provenance/license **verified/unknown**, publishability **blocked pending owner**. Do **not** invent original artist, license or video source.
- Diff duplicate candidate V3 PNG sets (4+4); note V3 painted overlays retired from runtime; preserve both copies and provenance.
- Look for `1000020031.mp4` only in authorized bounded directories; record `NOT FOUND IN SCANNED SCOPE` rather than globally missing if absent.
- Build registry/manifest validator as QA-only or docs-only, **without production asset publication**. Existing repo manifest code should not be overwritten with fictitious metadata.
- Attempt Godot 4.7.2 import/parse, targeted actor/showcase tests **in isolated clone with copied candidate assets**, label evidence as local-WIP-dependent.
- Deliver `R2_ASSET_PROVENANCE_11_CLIPS.md`, sanitized `R2_ASSET_MANIFEST.csv`, missing/source decisions, hashes; code/tools candidate if needed in review branch. No asset binaries on GitHub.

**Gate:** manifest 11/11 vs registry/TRES/atlas; source count 45 preserved; no gameplay/save diff; recorded tool exit codes. Rights UNKNOWN does not become VERIFIED.

## 3. R3 — authorized QA high-realm and battle result [P1]

- Inspect existing QA launchers and debug controls (`CHOI_GAME_QA.cmd`, F2–F8), Stagehand scenarios, pinned fixtures, `bridge_p2_fixture_smoke.mjs`, endgame and boss tests **before writing a fixture**.
- Prefer an existing legitimate QA fixture. If none exists, **this task authorizes creating a deterministic, QA-only high-realm/test-state builder in the isolated workspace** using canonical QA APIs/actions and disposable saves. Keep this tooling outside production gameplay paths; never ship artificial progression state to players.
- Do **not** modify actual save or production JS; do not hand-edit a player save or secretly force a win/lose event. A fixture may select legitimate scenario, levels, equipment and seed via allowed test-only interfaces; disclose how it is constructed.
- Cover high-realm Home/Character state, unlocked skills, 1/2/3 artifact sources, true Merge window, canonical Ultimate, Boss prefight, active fight, damage/heal/shield events, **victory/result/aftermath**, replay/reset and save isolation. Attempt defeat path if supported and feasible. Distinguish backend result from visible Godot result.
- Assert boss identity **from selected canonical boss ID** at preflight, playback, result; investigate R1 mismatch. If bug is UI/transport mapping, create narrowly scoped candidate fix + regression. If root cause is locked gameplay authority, write reproducible blocker, do not change gameplay.
- Log authoritative event trace/IDs/HP/resource/timestamps, verify no local cosmetic events alter gameplay, check reward only if actual authority reports it. **Never invent loot for direct boss challenges.**
- If an end-to-end victory fixture cannot be reached without modifying locked combat truth, keep `BLOCKED`; finish lower-level event/UI regression tests and move on.

**Gate:** deterministic isolated fixture reproducible twice, result displayed only if actually reached; exact screenshots/frame names, no original-save modification. If impossible, provide narrow why/how-to-unblock report.

## 4. R4 — objective readability and visual A/B prep [P1/P2]

**Allowed autonomously:** narrow provable *presentation-only* corrections, e.g. player HP strip occlusion, boss-name mapping from authoritative identity, UI safe zones, clearly invisible outline/contrast defects, stale actor cleanup, missing-data placeholder correctness. Create tests first when possible.

**Not allowed without owner visual acceptance:** replacing baked pink aura/weapon, regenerating animation, promoting/releasing art, changing approved Home/Character style, new VFX art direction, global reskin, deleting old candidate art.

- Capture **current baseline** at 390×844 Home, Character, Boss prefight, canonical playback, result if reachable, Ngự Khí 1/2/3, Guard, Merge, Ultimate, Merge exit. Additional 360×800 and 430×932 for changed layout.
- Separate **canonical actual gameplay** from synthetic **debug showcase** and V3 source-art reference. If same-scene V3 runtime unavailable, mark comparison NOT VERIFIED, not V1 > V3.
- Investigate why actor overlaps lower HUD; propose at least A/B screen layout with before/after evidence. Implement the smallest objective overlap fix **on candidate branch**, not on main, if original Godot asset is available and regression checks pass.
- Attempt temporal frames or a local recording using already-installed tooling. **No FFmpeg/OBS install required**. Without video/FPS, animation smoothness stays NOT REVIEWED.
- Include a matrix: symptom → observed visual evidence → cause → safe patch → QA result → requires owner judgment.

**Gate:** reduced measurable occlusion/readability without hiding HP or shrinking target to illegible size; pixel validation, GdUnit/Stagehand and native captures; no claim VISUAL APPROVED.

## 5. R5 — prepared 8 Dao widget/telegraph/Auto UI slices [P2]

Only after R2/R3 facts have been gathered. Audit live DTO fields and 8 Dao canonical contracts. No fake resource/cooldown/readiness or AI rationale.

- For each Dao (Kiếm, Quyền, Thể, Thần Niệm, Pháp, Độc, Trận, Ngự Khí), produce a **field map**: canonical source key, units/range, fallback, live/absent transport, widget proposal, tests.
- If all required data exists and implementing is objectively testable, build **one cohesive read-only widget slice** in isolated review branch with 8 Dao tests and 390×844 capture. Treat visual candidate, not production acceptance. Do **not** implement a second gameplay model.
- Audit telegraph, Break, Auto selection/readiness fields. Implement at most narrow verified-safe presentation seam(s); if canonical field absent, document upstream presentation-data gap, not a fabricated timer/UI state.
- Continue independent docs/test tasks even if a new art baseline is pending.

**Gate:** exact known DTO → widget mapping, no added JS gameplay authority, targeted QA and full Godot gate on changed client; PENDING owner visual approval.

## 6. R6 — planning only [DEFERRED]

Inventory readiness, risks, dependencies for equipment/Pháp Bảo, Tri Kỷ/Linh Thú, Công Pháp, Phân Thân, economy and global balance. **No implementations or status changes**; do not reopen CLOSED/LOCKED and do not turn deferred into active.

## 7. Testing and release gates

- Run sequentially: syntax/static → targeted unit → Godot import/parse → GdUnit → bridge/P2 → Home smoke → Combat smoke → capture/pixel → authorized scenario-specific regression. Use existing `KIEM_TRA_GAME.cmd` inside **safe clone** only when enough prerequisites exist.
- Isolate disposable save paths explicitly; ensure no filesystem link/writeback to E: and avoid competing listener ports and already-running user processes.
- Inspect the failed run logs, state whether retry changed code/fixtures/environment, and rerun unchanged test when needed. **No green claims based on historical R1 gate only.**
- Technical gate does not equal user visual approval, and debug-only showcase does not equal end-to-end gameplay proof.
- Keep runtime/package/asset source binary excluded from commit until reviewed. Validate `git diff --check`, tests, diff scope and contents for privacy/secrets.
- Never claim `FULL CLEAN` when using locally overlaid WIP or unpublished dependencies. Verify `main` remains protected.

## 8. Autonomous continuation order and blocked work

- Work stages 0 → R2 → R3 → R4 → R5 → R6 without waiting for the sleeping owner. **When one subtask is blocked, record exact reason and move to independent next subtask**. Prefer completed tested deliverables over sprawling half-finished rewrites.
- Commit code/test candidates in small scopes to dedicated review branch, push branch and open draft PR if permitted; never merge without visual owner approval. Commit docs-only progress to main via safe fast-forward after refreshing HEAD; if concurrency prevents push, keep local bundle and report exact blocker. Do not overwrite the existing R1 reports or falsely mark them changed.
- Avoid simultaneously running Godot, a browser, encoding and full test suite on low-RAM hardware. Do not change OS power-management or install dependencies silently.

## 9. Required remote handoff and output

Create/update under `docs/recovery/2026-10-26/` (docs-only):

1. `README.md` — navigation, exact start/end SHA, scope, status.
2. `01_RUN_LEDGER.md` — commands, exact SHA, test counts, failures/retries, locations of artifacts.
3. `02_R2_ASSET_AND_PROVENANCE.md` — 11-clip matrix, duplicate/WIP accounting, rights gate.
4. `03_R3_ENDGAME_AND_BOSS_IDENTITY.md` — fixture, canonical test trace, result/aftermath, boss mismatch.
5. `04_R4_VISUAL_READABILITY.md` — visual before/after facts, A/B proposal, pending owner decisions.
6. `05_R5_DAO_WIDGET_DATA_CONTRACT.md` — 8 Dao DTO mapping, implemented/deferred fields.
7. `06_BACKLOG_AND_NEXT_SPRINT.md` — prioritized tasks, dependencies, file owners, acceptance gates.
8. `07_DECISIONS_NEEDED.md` — only questions requiring owner approval (art rights, baked effects, promotion).
9. `EVIDENCE_INDEX.md` — sanitized local-only evidence hash/paths, clear runtime vs synthetic.
10. `COMMIT_AND_GATE_REPORT.md` — code branch/PR URL, main docs commit, what's merged/not merged, verified vs blocked.

No screenshots/asset binaries/public save are required on GitHub; they remain in independent local evidence store. Do not mention download links not really present.

At end respond in Vietnamese:
- R2/R3/R4/R5 progress **DONE/PARTIAL/BLOCKED**;
- GitHub main docs SHA and links, candidate branch SHA/draft PR URL if produced;
- exact Windows runtime/tests, saved evidence location;
- whether high-realm/victory/defeat/boss-id actually passed;
- highest priority issues and the next recommended owner decision.
**Do not report completion of phases that only have a plan.**
