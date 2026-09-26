# CURRENT CHECKPOINT

This file is the source of truth for a new chat. Read it before editing production code. Historical detail is preserved in Git history and dated closure records; do not reconstruct current state from older chat memory.

## Active state

- Repository: `vuanhtuan161094-byte/tutiennhandoi`.
- Branch: `main` only.
- Workflow: refresh `main` → read `AGENTS.md` + this checkpoint + `docs/DEVELOPMENT_PROTOCOL.md` → search → narrow → patch → targeted proof → active local gate → scoped closure for the opened slice.
- GitHub Actions push automation is manual-only; local CI is the normal verification path.
- Do not reopen a `CLOSED / LOCKED` system without a proven regression or explicit user instruction.
- Canonical JavaScript runtime/save/gameplay authorities through V179 remain locked; Godot is presentation/client unless a separate parity-proven runtime port is explicitly opened.

## Combat Backend V3 — CLOSED / LOCKED

- Exact verified runtime SHA: `00f944feeebe99778beec0c1d727060e47dfc5ec`.
- Closure record: `docs/runtime/COMBAT_BACKEND_V3_CLOSURE_20260924.md`.
- Production combat boundary remains CombatKernel V3 / CombatEntityFactory / CombatEncounterCompiler with V168 combat authority preserved beneath compatibility seams.
- New PvE/PvP/Hunt combat consumers remain on V3; historical replay compatibility remains versioned.
- Reopen only for a proven regression, an explicitly requested combat feature, or a separately scoped parity-proven internal refactor.

## Sword Dao Production V1 — A–F CLOSED / LOCKED

- Canonical contract: `docs/runtime/SWORD_DAO_PRODUCTION_CONTRACT_20260925.md`.
- Five-stat closure record: `docs/runtime/SWORD_DAO_FIVE_STAT_MIGRATION_CLOSURE_20260925.md`.
- Exact verified final gameplay SHA: `edf479ff465c262d105020d96dc23a31ba7b66c1`.
- Final F6 benchmark identity remains validated: Trọng Trảm reference, Lưu Quang inside its target band, Ngự Kiếm inside its target band; resource cadence remained healthy.
- Sword is read-only unless a real regression or explicit new design request reopens it.

## Fist / Quyền Dao Production V1 — Q1–Q5 CLOSED / LOCKED (2026-09-26)

- Canonical design contract: `docs/runtime/FIST_DAO_PRODUCTION_CONTRACT_20260926.md`.
- Closure record: `docs/runtime/FIST_DAO_Q1_Q5_CLOSURE_20260926.md`.
- QA scope audit: `docs/runtime/DAO_QA_SCOPE_AUDIT_20260926.md`.
- Final gameplay/balance candidate: `35e028b17c6560784483e8d0f89e4dd2d8593228`.
- Exact scoped closure evidence: `7c8b777c7f5a527e8871ab783bc64a9add4e94dd`.
- User-local closure proof on `7c8b777c...`:
  - branch `main`;
  - clean worktree / `dirty=false`;
  - exact-SHA evidence YES;
  - Local CI FULL CLEAN **23/23 PASS**;
  - Backend Fast PASS;
  - Frontend Fast PASS;
  - Runtime Browser Smoke PASS;
  - Strict Browser Smoke PASS;
  - Main Dao scoped Backend Closure **15/15 PASS**;
  - final banner `DAO FULL CLEAN + SCOPED CLOSURE: PASS`.
- Deterministic Q4/Q5 internal Quyền benchmark:
  - Trọng Quyền = **100%** reference;
  - Liên Hoàn = **92.19%**, target 92–98%, PASS;
  - Phản Quyền = **89.55%**, target 85–92%, PASS with real successful Counter activity.
- Locked production structure:
  - 10 skills + 8 passives;
  - Quyền Thế short-cycle core + Liên Kình long-cycle stack;
  - CL primary, TP heavy/body/counter, TPH combo/reaction, LL capacity only, TT utility only;
  - Break / brief disruption / counter bruiser identity;
  - CombatKernel V3, PvP, Hunt/offline and Auto parity covered by scoped closure.
- Q4 fixed a real Hồi Thân Phản Quyền production defect: Fist Counter now reacts to a live target cast/channel window instead of requiring the legacy generic boss `activeCounterWindow`; Sword's counter gate remains unchanged.
- Final Q5 Tam Hoàn mastery package remains `55% + 55% + 55% + 125%`.
- **Do not tune Quyền further** unless a proven regression or explicit new design request reopens the slice.

## Full-game backend audit debt — intentionally separate from Dao closure

The historical whole-game backend `closure` sweep last reported **137/141 PASS** after the five-stat migration. The remaining four failures are deferred cross-system audit debt, not evidence that Quyền is broken:

- `reincarnation-v4-gameplay-balance-test.js`;
- `v121-balance-production-test.js`;
- `v129-global-build-balance-test.js`;
- `v149-artifact-v129-balance-test.js`.

Scope rule:

- `node qa/runners/v140-backend-gates.js closure` remains the full-game directory sweep and is not weakened.
- `node qa/runners/v140-backend-gates.js dao` is the scoped Main Dao closure.
- Do not opportunistically rebalance or migrate Pháp Bảo/Chí Bảo/Relic, Linh Thú, Tri Kỷ, Equipment/Set/Gem/Inscription, Alchemy, Economy, Reincarnation-wide balance, Collection-wide power budgets, or old V120/V121/V129 global balance simulations merely to make a Dao slice green.
- Reopen each deferred system only as its own deliberate post-five-stat audit/migration slice.

## Godot presentation — ACTIVE / NOT FORCED

- Engine target: Godot 4.7.2 stable; primary viewport 390×844.
- Canonical hero rule: Home = seated meditation; Character = standing.
- Home/Character/equipment presentation work remains client-side and must not silently redefine locked gameplay authority.
- Godot executable changes require `KIEM_TRA_GAME.cmd`; UI-visible changes require actual 390×844 runtime evidence and user visual approval.
- GitHub Actions storage should not be used for routine Godot verification.
- Existing approved/candidate Home and Character animation work is preserved; do not resume unrelated VFX automatically unless the user returns to that scope.

## UI/UX state

- Historical web UI slices already marked closed remain locked.
- UI-visible work follows `docs/ui/UI_UX_WORKFLOW_V2_20260913.md`.
- Concept images, reconstructed mocks, or static source review are not runtime proof.
- No UI slice becomes visually locked without actual runtime screenshot/video evidence and explicit user approval.

## Immediate next action

1. Quyền is closed; do not continue tuning it.
2. For the next backend request, open only the explicitly requested Dao/system slice and audit current source first.
3. If the next slice is one of the deferred systems above, perform a dedicated post-five-stat audit before changing tests or balance values.
4. Preserve Combat V3, Sword and Quyền locks unless a regression is proven or the user explicitly reopens them.

## Historical checkpoint preservation

- The long pre-compaction checkpoint remains available in Git history at blob `1e671d90970dedb18510ea23b33c03424c24e44c` and the commit history preceding this compaction.
- Dated closure records under `docs/runtime/` are the preferred detailed history for locked backend slices.
