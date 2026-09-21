# Combat Readability — Checkpoint / Handoff — 2026-09-17

> Read this together with `CURRENT_CHECKPOINT.md`, `AGENTS.md`, `docs/DEVELOPMENT_PROTOCOL.md`, and `docs/ui/UI_UX_WORKFLOW_V2_20260913.md` before changing Combat.
>
> Repository: `vuanhtuan161094-byte/tutiennhandoi` · branch: `main` only.

## 1. Why this handoff exists

Combat Readability remains the active UI/UX slice. Recent runtime screenshots and source audit show that continuing to add CSS/DOM patches would increase regression risk. The next chat must consolidate presentation architecture first, then continue UX polish.

Do **not** reconstruct gameplay rules from old chat history. Current `main` is source of truth.

## 2. CI / QA operating mode — IMPORTANT

GitHub Actions push automation is disabled in the repository because account Actions artifact/storage capacity is currently constrained.

Current rule:

- Do **not** intentionally turn push-triggered Actions back on.
- Use the repository Local CI instead: `tools/web/TEST_GAME_LOCAL.cmd`.
- Use manual Game CI only when the user explicitly wants it and storage is available.
- Local CI modes include Fast, Browser, Visual, Full, and Full Clean.
- The user has already run **Mode 5 — FULL CLEAN — PASS** on the clean current-main checkout after Local CI was introduced.
- Runtime/browser/visual proof should therefore be produced locally during this period.

Local CI tooling is in `qa/local/`; artifacts are written under `artifacts/local-ci/` and ignored by Git.

## 3. Locked gameplay/runtime boundary

**V168 — Combat / Stat Runtime Authority remains CLOSED / LOCKED.**

Do not change CombatKernel, damage formulas, outcome authority, save schema, stat composition, skill-cast authority, Boss phase authority, or reward calculations merely to solve presentation problems.

Current audited gameplay semantics:

- Boss challenge is a **progression gate**.
- Defeating the Boss advances/unlocks progression/farm access.
- **Săn Ảo / time-based farm is the economy settlement path** for hunt resources.
- Do not reintroduce per-Boss direct loot merely because older source terminology suggests it.

### Semantic debt to audit before UI closure

Older economy/activity source still contains `huntBossWins` / a legacy first-Boss milestone semantic while the current Boss flow is progression-only and the active economy path is Săn Ảo. Treat this as **semantic/dead-code debt to audit**, not permission to change balance. Establish whether it is truly unreachable/obsolete and remove or reconcile only with targeted proof.

### Step 1 closure — 2026-09-17 — CLOSED

The semantic debt above has now been traced and reconciled on current `main` without reopening V168 authority:

- canonical Boss challenge settlement in `dist/core/session.js` remains `rewardContext: 'progression-only'`, `directBossLoot: false`, with direct economy payloads zeroed;
- Săn Ảo/time-farm remains the hunt economy settlement path and continues to record `huntKills`;
- legacy `huntBossWins` / `bossWins` counters remain readable for save compatibility/activity telemetry, but a Boss activity call itself cannot settle Bound Jade;
- obsolete daily `hunt.boss.1` and `boss.1` Bound Jade milestones were removed from active economy milestones;
- weekly `combat.12` no longer counts Boss progression wins and is now backed by 12 resource-dungeon clears;
- the active authored non-PvP daily Bound Jade cap is therefore 100 rather than the stale 140 that included two obsolete 20-Jade Boss milestones;
- `qa/tests/v161-economy-source-sink-test.js` now locks the boundary by asserting Boss progression counters do not mint Bound Jade directly and that active daily/weekly caps reconcile to 100/300.

No CombatKernel, damage, Boss outcome, save schema, direct Boss loot, or Săn Ảo settlement authority was changed.

Local CI was **not rerun from the connector-only coding session** because that environment could not clone GitHub (`Could not resolve host: github.com`). A clean Local CI Fast run remains required before the Combat Readability slice is closed; do not substitute GitHub-hosted Actions.

## 4. HP contract already fixed

A prior UI bug displayed Boss HP as `0` even though the bar was full.

Root cause: backend/presentation data contained formatted display strings such as `18.95B`, while presentation attempted `Number(displayString)`, yielding `NaN` and falling back to `0`.

The repaired contract is:

- HP percentage/magnitude authority controls bar geometry.
- `hpCurrent` / `hpMax` display authority controls the visible text.
- Presentation must **not parse K/M/B display strings back into numbers**.
- Visual semantic QA now guards against a positive Boss HP bar with `0`, `—`, or empty HP label.

Do not regress this contract while consolidating Combat.

## 5. Runtime visual findings from user review

The latest user-reviewed runtime screenshots exposed several remaining issues.

### 5.1 Boss HUD is oversized

The Boss HP block is too wide/tall relative to the portrait battlefield. It consumes excessive vertical space and makes the encounter feel like a dashboard rather than battlefield-first UI.

Target: compact Boss identity + HP + phase/Phá Thế hierarchy. Keep detailed HP/ATK/DEF/Power in Boss detail rather than enlarging the battlefield HUD.

### 5.2 Enemy chips overlap / poor hit targets

Near the Boss sprite, labels/chips such as level, `BOSS`, element/mechanic/status are crowded and can overlap, making them difficult to read and click.

Target: one intentional compact enemy-meta lane with non-overlapping touch targets. Lethal telegraph/counter-window information must take priority over persistent metadata.

### 5.3 Player composition is slightly too high

Recent screenshots show the player character appearing vertically lifted relative to the battlefield. Do not solve this with another viewport-specific patch. Fix it when there is a single geometry owner.

### 5.4 Prefight briefing occupies too much battlefield

`THỦ LĨNH ĐANG CHỜ` / Boss challenge briefing currently consumes a large portion of the arena.

It is useful pre-fight, but must not remain as a large battlefield obstruction during active combat.

Target state behavior:

- Pre-fight: compact decision panel with Boss identity, readiness, minimal counter summary/reward/farm progression context, challenge CTA and blocker when relevant.
- Active combat: briefing collapses/hides; battlefield state becomes primary.
- Boss detail remains available through a small info affordance/sheet.
- A manual collapse/expand affordance may be added for pre-fight if it improves usability, but active-combat visibility must be state-driven rather than relying on the player to hide it.

### 5.5 Combat sheets are not production-quality yet

User screenshots show the following sheets/pages still visually rough:

- `Cách Đọc Trận Đấu`
- `Bản Đồ · Bí Cảnh`
- `Yêu Thú Hiện Tại` / Boss detail
- `Chọn Tầng Farm`
- skill detail overlay/sheet

Specific concerns:

- typography and spacing are inconsistent;
- some screens look like data/debug forms rather than game UI;
- `Chọn Tầng Farm` is especially form-like and contains awkward copy/layout;
- information hierarchy is weak;
- sheet content can obscure too much of the battlefield and needs consistent mobile interaction/scroll behavior.

These must be redesigned **after** presentation ownership is consolidated.

## 6. Architecture audit — primary risk

Combat currently has too many presentation owners.

Relevant areas include:

- `hunt-combat-v2.js` — large/monolithic and currently owns substantial rendering, status/HP handling, animation/farm/dev presentation responsibilities.
- multiple Combat CSS layers loaded together, including base/target/polish/composition/visual/camera/information layers;
- `ui-combat-target-v1.js` — presentation bridge/DOM augmentation responsibilities;
- `combat-portrait-safety-v1.js` — uses `MutationObserver` and inline `!important` geometry corrections.

The safety layer is particularly risky because it can become a **second geometry owner after CSS**, producing viewport-dependent movement and making CSS debugging misleading.

Recent audit also found presentation code patterns where rendered DOM is inspected/used to build further presentation. Avoid expanding this pattern. Prefer a canonical presentation/view model feeding renderers.

### Architecture rule for the next phase

Do **not** add another Combat CSS patch layer.

Do **not** add another MutationObserver/inline-geometry safety shim.

Consolidate ownership first.

## 7. Execution plan — MUST follow this order

### Step 1 — Backend semantic cleanup audit — CLOSED 2026-09-17

Search and trace at least:

- `huntBossWins`
- Boss challenge settlement/progression
- Săn Ảo/time-based settlement
- economy activity/milestones
- reward/drop/loot terminology

Goal: prove the current canonical semantics and remove/reconcile truly obsolete semantic debt without changing balance or locked authority.

Closure evidence is recorded in Section 3. Step 2 is now the next active step.

### Step 2 — Combat presentation architecture consolidation

Map all current owners of:

- player/Boss geometry;
- Boss/player HUD;
- pre-fight/active/post-battle visibility;
- HP/phase/Phá Thế/status rendering;
- sheet open/close state;
- skill/resource lane;
- telegraph/callout/VFX overlays.

Then consolidate toward:

1. a canonical Combat presentation/view-model boundary;
2. one layout/geometry owner;
3. one clear renderer path per state;
4. VFX/camera as presentation consumers, not gameplay/state owners.

Retire or reduce `combat-portrait-safety-v1.js` MutationObserver/inline geometry once equivalent layout behavior is owned canonically.

Do not attempt a giant rewrite of `hunt-combat-v2.js` in one patch. First stop new responsibilities from entering it; then extract narrow responsibilities with regression proof.

### Step 3 — Active Combat HUD

Only after Step 2 is stable:

- compact Boss HP/HUD;
- clean enemy identity/meta lane;
- readable Boss phase and Phá Thế;
- correct player vertical position;
- player HP/CN/resources remain readable;
- all backend-authored skill slots remain visible/read-only;
- telegraph/counter/Thất Thế/phase priority remains clear;
- no briefing obstruction during active combat.

### Step 4 — Prefight briefing

Redesign `THỦ LĨNH ĐANG CHỜ` into a compact decision surface.

Must answer quickly:

- Who is the Boss?
- How dangerous/ready is the current build?
- What important mechanic/counter gap exists?
- What progression/farm access follows victory?
- Why is challenge blocked, if blocked?

Detailed telemetry remains in Boss detail.

### Step 5 — Combat sheets, one at a time

Recommended order:

1. `Yêu Thú Hiện Tại` / Boss detail
2. `Bản Đồ · Bí Cảnh`
3. `Chọn Tầng Farm` / Săn Ảo
4. `Cách Đọc Trận Đấu`
5. skill detail / remaining Combat overlays

Each sheet gets its own runtime screenshot review. Do not redesign all sheets in one unreviewable patch.

### Step 6 — Responsive + interaction QA

Use Local CI and real runtime at least:

- 360×800
- 390×844
- 412×915
- 430×932

Check:

- no horizontal overflow;
- Boss/player geometry stable;
- HP semantics correct;
- no resource/skill overlap;
- click/touch targets usable;
- sheet scrolling/close/back behavior;
- pre-fight → active → result transitions;
- telegraph/full-chaos state;
- Boss phase/Phá Thế/status readability.

For a closure candidate, run `tools/web/TEST_GAME_LOCAL.cmd` **Mode 5 — FULL CLEAN** on a clean checkout and preserve the local artifact/report.

### Step 7 — VFX / visual polish last

Only after information architecture and geometry are stable:

- combat VFX integration;
- camera polish;
- animation polish;
- final art-direction consistency.

Do not use effects to mask layout/readability problems.

## 8. Non-goals / hard prohibitions

During this consolidation, do not:

- reopen V168 gameplay/stat authority without proven regression;
- change damage/outcome calculations for UI reasons;
- change save schema;
- invent Boss loot/reward payloads;
- create fake win chance;
- add manual cast buttons;
- hide backend-authored skill slots;
- parse formatted HP display strings back into numeric authority;
- add another CSS override layer to solve ownership problems;
- add another geometry MutationObserver;
- trigger GitHub-hosted Actions while the quota is exhausted.

## 9. First action for the next chat

1. Refresh current `main` HEAD.
2. Read `AGENTS.md`.
3. Read `CURRENT_CHECKPOINT.md`.
4. Read `docs/DEVELOPMENT_PROTOCOL.md`.
5. Read `docs/ui/UI_UX_WORKFLOW_V2_20260913.md`.
6. Read **this file**.
7. Audit current source again before patching because current `main` is always source of truth.
8. **Step 1 is closed. Continue with Step 2.** Do not jump directly to visual polish.

## 10. Handoff status

- Combat Readability: **OPEN**.
- Step 1 — Boss progression / Săn Ảo economy boundary: **CLOSED 2026-09-17**.
- Step 2 — Combat presentation architecture consolidation: **NEXT**.
- Home / App Shell / Character slices: remain locked as documented in `CURRENT_CHECKPOINT.md`.
- V160–V180 selected runtime authorities: remain CLOSED / LOCKED.
- Local CI: operational in the project; latest pre-handoff user-confirmed Mode 5 FULL CLEAN PASS remains the last executed full local run. A post-Step-1 local rerun is still pending because the connector coding environment cannot clone GitHub.
- User has **not** visually approved Combat as closed. The latest screenshots explicitly identified the issues recorded above.
