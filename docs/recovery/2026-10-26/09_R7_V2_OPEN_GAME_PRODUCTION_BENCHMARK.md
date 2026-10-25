# TU TIÊN NHÀN DỖI — R7 V2 OPEN GAME PRODUCTION & BENCHMARK
**Date:** 2026-10-26  
**Status:** OWNER-REQUESTED DIRECTION CHANGE — IMPLEMENTATION NOT YET CLAIMED  
**Supersedes:** overly narrow execution scope in [R7 V1](08_R7_PLAYABLE_COMBAT_CANDIDATE_PLAN.md), but retains historical audit evidence.  
**Repository:** `vuanhtuan161094-byte/tutiennhandoi`; re-check current `main` at execution start.  
**Outcome:** Improve actual *fun + readable combat + responsive art + character growth + game feel*. Produce a polished playable release candidate, not another round of reports-only.

## 1. Direction reset: cut unnecessary restrictions

Previous recovery tasks were too report-heavy, and the constraints "read only", "no code", "no asset", "no merge", "only narrow slice", "never change locked architecture" prevented useful end-to-end game improvement. OWNER now directs a broader design/production loop.

**New autonomy, within the project:**
- Conduct substantial **outside-game benchmark research** (screenshots, long-form battle footage, gameplay guides, app listings, game-review discussions, open-source Godot technique examples) before deciding the design.
- Codex can **create/refactor code**, UX and HUD, motion choreography, shaders/particles/camera, audio, enemy rendering, presentation bridge, QA fixtures, scene layout, animation pipelines and original art placeholders; improve underperforming game loops with a specific documented redesign proposal and proof.
- Codex may **write to local project working files on E:** after making a verifiable backup/snapshot of WIP, relevant tracked diffs, and user save metadata. Alternative isolated worktree is fine. No general "E read only" blocker. Scope writes to the named project and its authorized generated working directories, not unrelated E: data.
- Can use **user-provided assets** and genuinely licensed/free assets (license/attribution recorded), or generate original art; local candidate use is permitted for comparison. Do not upload redistributed third-party binaries without verified rights, or quietly import unidentified assets into shipped release.
- **Allow small tested development commits to main** when repo protocol/tests pass, with fast-forward safety, rollback plan, and QA/replay proof. Branch/PR is optional when substantial risk or work is incomplete, not mandatory for every patch. No force push.
- No artificial cap of "one widget", "one effect", "one Dao" or number of comparison games. Choose scope based on coherent vertical-slice outcomes and ability to test. Work independently on multiple *sequential* improvements.
- Can run the production game, endgame sandbox, desktop visual/play test and captures; do not confuse synthetic showcase with canonical runtime.

**Real protections retained (not needless constraints):**
- Backup before overwriting WIP; never destroy the user's save or private files; don't perform destructive reset/clean when loss is plausible; avoid touching unrelated projects.
- Existing locked Combat Backend V3 and 8 Dao are the authoritative **baseline**. Do not silently retune coefficients, RNG, offline settlement, Boss rewards or schema for a presentation defect. If an actual gameplay redesign is strongly justified, document proposed scope and parity impact, implement separately and maintain backward compatibility/tests; no stealth changes.
- No unsupported ownership/license assumptions or IP copying from reference games. Learn behavior, animation grammar, UI composition; create original implementations.
- No fake pass, fabricated footage, fabricated availability of local tooling, invented video analysis or untested "looks good" claims.
- Technical pass is not owner aesthetic approval; iteration is allowed on main as dev candidate, but do not mark art `APPROVED/LOCKED` without owner review.
- Prefer low-memory, sequential tasks on the historical 8 GB Windows machine; do not kill unrelated Godot/Node or install software without sensible safeguards.

## 2. Benchmark library — study MANY games, distinguish fact from interpretation

Research all priority examples and add at least 5 extra relevant games if useful. Study actual gameplay video/screenshots, not only marketing text. Cite full URL, capture date, source/timecode and what exactly the reference demonstrates. A game listing does not prove the animation quality of a named skill.

| Reference game | Benchmark topic | Application to TND | Starting reference |
|---|---|---|---|
| **一念逍遥 / Nhất Niệm Tiêu Dao (Overmortal)** | portrait cultivation idle rhythm, ink painting, realms, offline growth, magic/flying swords | Home, cultivation fantasy, Dao differentiation, progression feedback | https://www.taptap.cn/app/159465 ; https://xian.leiting.com/news/37.html |
| **最强祖师 / Tối Cường Tổ Sư** | RPG auto combat readability, party effects, distinct equipment/skills, reward flow | combat readability / skill hierarchy; **do not import sect-management scope** | https://www.taptap.cn/moment/476357252727440780 |
| **凡人修仙传：人界篇** | skill casting fantasy, treasure weapons, boss confrontation, Xianxia character motion | VFX beats, treasure-command poses, impact & camera | https://www.bilibili.com/video/BV18YHSz8ENH/ |
| **仙逆：本尊 / 仙逆：战天道** | character progression, companion/treasure identity, visible power upgrades | progression/skill forms and resource visual identity; keep backend authority separate | https://apps.apple.com/cn/app/id6794973004 ; https://h5.9game.cn/content/postsDetail?postId=1000085530 |
| **暖雪 / Warm Snow** | flying-sword projectile launch/recall, impact rhythm, color, separation from effects | Ngự Khí persistent actors and more tactile combat | https://www.microids.com/game-warm-snow/ |
| **剑侠世界：起源 / JX series** | school-specific skills, target contact, travel arcs, hit feedback and projectile readability | 8 Dao distinctly recognizable by silhouette and attack vocabulary | https://jsqy.xoyo.com/index/index.html ; https://www.taptap.cn/app/383676/all-info |
| **AFK Journey** | automated battle readability, Ultimate emphasis, HUD and interruptibility | auto skill intention, Boss telegraph, ultimate cadence, legibility | https://www.prydwen.gg/afk-journey/guides/beginner-guide |
| **鬼谷八荒 / Tale of Immortal** | builds, skill variety and progression loops | research candidate, verify combat examples from original footage before adopting | discover/source during research |
| **Hades, Archero, Soul Knight** | hit/contact anticipation and post-hit, enemy signaling, screen-space safety | cross-genre *presentation* inspiration, not a design pivot | discover/source during research |
| **其他:** 觅长生, 仙途, 修仙模拟器, Idle Cultivation contemporaries | compare idle progression UX and reward ceremonies | original prioritized synthesis | discover/source during research |

**Deliver:** `docs/design/benchmark/R7V2_12_GAME_REFERENCE_MATRIX.md` including for each game:
- Source links/timecodes/screenshots (link externally, do not republish protected frames).
- Core fantasy, visual language, combat perspective, character scale/spacing, UI hierarchy, art palette.
- Anticipation → Cast → Projectile/Travel → Contact → Recovery (where applicable).
- Impact/camera/audio timing and what can be measured from inspected evidence.
- User loop: Home → prepare/build → fight → result/reward → strengthen → idle/offline → return.
- What to **learn**, what **not** to copy, how TND can do better as an offline single-character mobile game.
- Confidence (verified footage vs screenshot vs marketing vs hypothesis) and five strongest concrete transferable ideas.

## 3. Decide a cohesive original production direction

Create `R7V2_VISUAL_AND_GAMEPLAY_DIRECTION.md` after reference study. The target is **portrait 390×844**, Chinese Xianxia dark-ink/gold atmosphere, clean strong silhouette, living character, noticeable rank/power escalation, actual controlled artifact actors, readable projectile/contact sequences and satisfying victory/loot feedback.

Do not simply add more particle effects. Core priority is readability and feel:
- Characters/backgrounds/enemies should have **real authored silhouette** and separate layers/depth.
- Every major skill has clear anticipation → release → travel → impact → recovery/reformation.
- Dao family distinction should be visible before reading a resource label: e.g., Sword sharp arcs, Fist close heavy contact, Body guard/counter, Mind marks/projections, Spell formation/casting geometry, Poison accumulating corruption, Formation deployed anchor, Artifact persistent treasure control. These are **visual proposals**, not claims the existing backend includes new mechanics.
- Promote differences in realm through pose/ornament/aura **only where existing progression metadata supports it**.
- Aim for 60fps presentation if hardware supports; measure actual FPS; design mobile fallback tiers rather than promising a frame rate.
- Boss enemy must be a readable formidable figure with attack telegraph, not low-contrast outline.
- Avoid inherited V1 baked aura/weapon visually conflicting with independent Ngự Khí; explore **at least two original options**. Can prototype new candidate artwork but keep old files restorable.
- Auto combat must feel intentional; don't create a fake manual-toggle if no authoritative action. Design truthful information states, or separately propose/implement actual action under explicit gameplay scope.
- Use image/music/FX that may be legally integrated. Record source license. Original authored assets preferred.

**Deliver** wireframe/scene diagrams, scale + safe-area rules, motion board or time-sequenced frames, art-asset list and prioritized milestones. Reference images used only for analysis; no wholesale cloning of assets/unique UIs.

## 4. Implement: multi-part production (not reporting only)

### P0 — Safe source recovery and candidate integration
- Fetch GitHub main; inspect source vs candidate `5faabb720f21807e941f3846b1b43f013fb1cad5`.
- Snapshot local untracked 45 WIP / selected save references + hashes. Preserve actual user save unchanged.
- Validate bridge QA-only fixture and configurable ports. Do not connect QA client to production bridge accidentally.
- Integrate proven non-controversial fixes (Home button refresh, safe port, tactical collision, responsive layout, endgame QA-only) when tested on the current source. Narrow changes can merge main fast-forward once QA PASS. Keep authoring history and rollback straightforward.

### P1 — "One battle that feels excellent" (highest product priority)
- Choose Ngự Khí one canonical real Boss at playable mid-/high-tier QA state; capture actual playback.
- Replace unreadable native placeholder boss with a **rightful/created original** visual actor if available; maintain strong silhouette, directional orientation, clear attack/cast response.
- Preserve 1/2/3 source and Great Artifact persistent state; improve position, layering, travel arcs, target point, hit contact, state transitions, hurt/guard/suppress, Ultimate escalation.
- Polish HUD for target/player HP/resource/Break and skill intent; fix boss prefight/playback display by source identity trace, not renaming strings blindly.
- Add feedback with restrained contrast, separation, no overload; optional short effect timing/low-shake.
- Provide actual screenshots and time-series/video where possible, then compare before/after at *same* viewport and canonical fixture.
- Iterate until key scenes are legible in motion: one normal attack, guard, split, merge, Ultimate, result. Human owner approval later; interim development candidate may be committed.

### P2 — Eight Dao visual vocabulary
- Audit each Dao's 5 active/basic/ultimate canonical events, fields and current art mapping.
- Create a **minimum viable per-Dao combat presentation kit** with identifiable silhouette and launch/impact/return, not the same cyan streak on all Dao. Reuse infrastructure, avoid duplication.
- Set up canonical endgame QA fixtures via established isolated bridge, no artificial damage/result injection.
- Run one encounter for each Dao; capture and assert actual skill events. Clearly mark missing production visuals as placeholders.
- Do not require all 80 icons/assets finished before demonstrating substantial improvement.

### P3 — Full idle-game playable loop
- Run Home → Character/prepare → Hunt/Boss → Combat → actual result → return → meaningful progression. Inspect UI dead ends, disabled controls, confusing rewards, skill selection and buttons.
- Improve menus, taps, tooltips, ready states, compact HUD, accessibility contrast, meaningful reward feedback and idle/offline visibility.
- If a gameplay mechanics change is genuinely needed, open a documented **single coherent** scope with migration/parity/regression and implement rather than hiding behind permanent "no gameplay" policy. No silent major rebalance or save corruption.
- Review endgame play state (realm 114/floor 21601 fixture is available) *and* early/midgame; real game should not be approved from empty starting account alone.
- Limit overdevelopment: refine usability and coherent game feel before adding new unrelated subsystems.

### P4 — Build/package for owner evaluation
- Prepare launchable reproducible Windows/Godot test build and optional Android package if environment/toolchain supports. Don't assert a real phone test from desktop emulator.
- Package only verified-shareable original/licensed assets; otherwise mark locally runnable candidate with missing inputs clearly.
- Include reproducible script to choose sample early/mid/high-realm QA profiles without touching user save; default ordinary launch must never be QA.
- Real test pass, human-oriented screenshot/video or frame sequence, list of open aesthetic decisions.

## 5. Autonomous workflow and developer permissions

- Iterate `research → hypothesis → smallest coherent implementation → run game → inspect capture/time sequence → compare reference → improve → test → commit → next slice`, **not** `audit → report → audit → report`.
- No cap on reference number or on improvements when they can be verified. Prioritize deliverable function and coherent art direction.
- Code can be edited in project E **after** creating an auditable backup of local WIP and saves; a dedicated safe worktree is preferred if no risk of losing asset linkages. Files outside named TND project remain untouched.
- Use project Git under its documented protocol; changes to main permitted if tests pass, clear rollback and non-destructive fast-forward. For risky work, use a review branch. No force push or secret commits.
- Document bounded evidence after each implementation milestone (tested SHA, tests, screenshots, measurable changes). Continue if one independent item blocked.
- UI visual candidate should be exposed to owner for approval but does not block all further engineering; never falsely label it APPROVED/CLOSED.
- Re-evaluate machine resources and avoid running several heavy Godot/browser jobs concurrently.
- Preserve source-level project identity and asset originality; compare broadly, copy narrowly **at the principle level**.

## 6. Required documentation + handoff to GitHub

Write plan/evidence under `docs/recovery/2026-10-26/r7v2/`:
1. `README.md` with starting/final HEAD, owners, current playable state.
2. `REFERENCE_GAMES_MATRIX.md` with >= 10 researched games (or explicit evidence shortfall).
3. `VISUAL_ART_DIRECTION.md` including example frames, composition, motion and palette guidance.
4. `IMPLEMENTATION_LEDGER.md` with actual modified paths/commit SHAs, rollback.
5. `COMBAT_8_DAO_PLAYABLE_MATRIX.md`.
6. `REAL_GAMEPLAY_LOOP_QA.md` (early/mid/endgame, win/loss, results).
7. `ASSET_RIGHTS_AND_PROVENANCE.md` (45 WIP, local and approved paths, legal intake).
8. `RUNTIME_VISUAL_EVIDENCE_INDEX.md` (capture classification, SHA and URLs/paths where accessible).
9. `PRODUCT_BACKLOG_NEXT.md` (prioritized backlog, problems and measurable acceptance).
10. `GATES_AND_HANDOFF.md` (exact tested SHA, pass/fail and scope).

Do not upload unverified binaries or user saves. GitHub docs should contain real screenshots **only if** redistribution is verified; otherwise provide local-only paths and hashes.

At end answer in Vietnamese: what game features actually changed and got better; benchmark references and chosen ideas; actual runtime evidence; tests; main/branch commits; links; unresolved aesthetic decisions. Do not call mere paperwork completion "game finished".
