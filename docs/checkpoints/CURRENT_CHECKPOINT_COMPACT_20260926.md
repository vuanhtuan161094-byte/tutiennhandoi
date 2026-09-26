# CURRENT CHECKPOINT — COMPACT SNAPSHOT (2026-09-26)

This compact snapshot is prepared for checkpoint compaction. The root `CURRENT_CHECKPOINT.md` remains source of truth until the compaction commit replaces it.

## Repository

- Repo: `vuanhtuan161094-byte/tutiennhandoi`
- Branch: `main` only.
- Current development rule: refresh `main` → read checkpoint/protocol → search → narrow → patch → targeted proof → active local gate → closure gate only for the opened slice.
- GitHub Actions push automation remains manual-only; local CI is the normal verification path.

## Locked runtime foundations

- Selected non-UI runtime/authority through V179: **CLOSED / LOCKED**.
- Combat Backend V3 migration: **CLOSED / LOCKED**. Closure record: `docs/runtime/COMBAT_BACKEND_V3_CLOSURE_20260924.md`.
- Canonical gameplay authority remains JavaScript; Godot is presentation/client unless a separate parity-proven runtime port is opened.

## Sword Dao Production V1

- Status: **A–F CLOSED / LOCKED**.
- Canonical contract: `docs/runtime/SWORD_DAO_PRODUCTION_CONTRACT_20260925.md`.
- Five-stat closure record: `docs/runtime/SWORD_DAO_FIVE_STAT_MIGRATION_CLOSURE_20260925.md`.
- Exact verified final gameplay SHA: `edf479ff465c262d105020d96dc23a31ba7b66c1`.
- Final benchmark identity remains Trọng Trảm / Lưu Quang / Ngự Kiếm with validated target bands.
- Do not reopen Sword without a proven regression or explicit user request.

## Fist / Quyền Dao Production V1

- Status: **Q1–Q5 CLOSED / LOCKED (2026-09-26)**.
- Canonical design contract: `docs/runtime/FIST_DAO_PRODUCTION_CONTRACT_20260926.md`.
- Closure record: `docs/runtime/FIST_DAO_Q1_Q5_CLOSURE_20260926.md`.
- QA-scope audit: `docs/runtime/DAO_QA_SCOPE_AUDIT_20260926.md`.
- Final gameplay/balance candidate: `35e028b17c6560784483e8d0f89e4dd2d8593228`.
- Exact scoped closure evidence: `7c8b777c7f5a527e8871ab783bc64a9add4e94dd`.
- User-local proof on closure SHA:
  - `main`;
  - `dirty=false`;
  - exact-SHA evidence YES;
  - Local CI Full Clean **23/23 PASS**;
  - Backend Fast PASS;
  - Frontend Fast PASS;
  - Runtime Browser Smoke PASS;
  - Strict Browser Smoke PASS;
  - Main Dao scoped Backend Closure **15/15 PASS**;
  - final banner `DAO FULL CLEAN + SCOPED CLOSURE: PASS`.
- Q4/Q5 internal Quyền benchmark:
  - Trọng Quyền = **100%** reference;
  - Liên Hoàn = **92.19%**, target 92–98%, PASS;
  - Phản Quyền = **89.55%**, target 85–92%, PASS with live successful Counter behavior.
- Locked structure: 10 skills, 8 passives, Quyền Thế + Liên Kình, five-stat CL/TP/TPH identity, Break/counter bruiser loop, CombatKernel V3/PvP/Hunt/Auto parity.
- Do not tune Quyền further without a real regression or explicit new design request.

## Full-game backend audit debt — intentionally NOT part of Quyền closure

The historical whole-game backend `closure` sweep last reported **137/141 PASS** after the five-stat migration. The remaining four failures are deferred cross-system audit debt and must not be opportunistically patched while closing Quyền:

- `reincarnation-v4-gameplay-balance-test.js`;
- `v121-balance-production-test.js`;
- `v129-global-build-balance-test.js`;
- `v149-artifact-v129-balance-test.js`.

Important scope rule:

- Full-game `closure` remains unchanged and continues to expose those debts.
- `node qa/runners/v140-backend-gates.js dao` is the scoped Main Dao closure.
- Do not rebalance or migrate Pháp Bảo/Chí Bảo, Linh Thú, Tri Kỷ, Equipment/Set/Gem/Inscription, Alchemy, Economy, Reincarnation-wide balance, or old global V120/V121/V129 balance simulations merely to make a Dao slice green.
- Reopen each system only as its own deliberate audit/migration slice.

## Godot presentation state

- Engine target: Godot 4.7.2 stable; primary viewport 390×844.
- Home = seated meditation; Character = standing.
- Home animation modes and Character/equipment presentation remain presentation work only; do not silently change locked gameplay authority.
- Approved asset and animation work remains under the existing Godot workflow and requires `KIEM_TRA_GAME.cmd` plus actual runtime evidence for technical/visual closure.
- GitHub Actions storage should not be used for routine Godot verification.

## UI/UX state

- Historical web UI slices that were already closed remain locked.
- Current user direction has focused on backend Dao completion and Godot presentation; do not resume unrelated VFX/UI redesign automatically.
- UI-visible work still requires actual runtime screenshots/video and explicit user approval before visual lock.

## Immediate next action

- Quyền is closed; do not continue tuning it.
- Choose the next explicitly requested backend system/Dao slice and audit it against current source before changing anything.
- If the next task is one of the deferred systems above, perform a dedicated post-five-stat audit first rather than updating tests blindly.
- Preserve Combat V3, Sword and Quyền locks unless a proven regression or explicit user instruction reopens them.

## Historical checkpoint archive

The long pre-compaction checkpoint is preserved in Git history and should be archived at `docs/checkpoints/CURRENT_CHECKPOINT_ARCHIVE_20260926_PRE_FIST_CLOSURE.md` when the root checkpoint is compacted.
