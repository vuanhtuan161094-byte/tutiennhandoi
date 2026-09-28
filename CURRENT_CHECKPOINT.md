# CURRENT CHECKPOINT

This file is the source of truth for a new chat. Read it before editing production code. Historical detail is preserved in Git history and dated closure records; do not reconstruct current state from older chat memory.

## Active state

- Repository: `vuanhtuan161094-byte/tutiennhandoi`.
- Branch: `main` only.
- Workflow: refresh `main` → read `AGENTS.md` + this checkpoint + `docs/DEVELOPMENT_PROTOCOL.md` → search → narrow → patch → targeted proof → active local gate → scoped closure for the opened slice.
- **Main Dao production/rebalance work uses `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`.**
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

## Dao Production Workflow V3 — ACTIVE / LOCKED (2026-09-26)

- Canonical workflow: `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`.
- Closure record: `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_CLOSURE_20260926.md`.
- New-slice contract template: `docs/runtime/DAO_NEW_SLICE_TEMPLATE_V3.md`.
- Generic feature registry: `qa/runners/feature-closure-manifest.js`.
- Generic runner modes:
  - `feature-list`;
  - `feature-info <feature-id>`;
  - `feature <feature-id>`.
- Generic one-click closure: `DONG_BO_VA_TEST_FEATURE.cmd <feature-id>`.
- `DONG_BO_VA_TEST_DAO.cmd` is a compatibility wrapper for the already closed `dao-fist` slice.
- Registered examples are `dao-sword` and `dao-fist`; both are `closureReady:true` because their historical closure evidence already exists.
- A newly opened Dao must be registered with `closureReady:false` and may not be closed until correctness, parity, identity-valid deterministic benchmark evidence, target bands, and required regressions are complete.
- `feature-closure-framework-test.js` guards manifest uniqueness/existence, benchmark-contract ownership, deferred-system leakage, runner modes, generic launcher behavior, and the independence of full-game closure.
- `dao-closure-scope-contract-test.js` remains as a compatibility guard but delegates the live scoped list to the `dao-fist` feature manifest.
- Full-game `closure` remains the independent directory sweep and is not weakened.
- Workflow V3 exact verified infrastructure candidate: `a7119a7fbef8159a0c49a138775f0ec29b3f1296`.
- User-local Mode 1 FAST evidence on that exact SHA:
  - branch `main`;
  - clean worktree / `dirty=false`;
  - exact-SHA evidence YES;
  - Local CI **21/21 steps PASS**;
  - Backend Fast **39/39 PASS**;
  - Frontend Fast **20/20 PASS**;
  - framework/scope guards PASS.
- The V3 implementation changes QA/workflow/docs only; it does **not** change gameplay/runtime coefficients or reopen Sword/Fist.
- **Use V3 as the default workflow for every newly opened Main Dao slice.** Modify it only for a proven process defect or explicit user instruction.

## Ngũ Hành Equipment Retirement — CLOSED / LOCKED (2026-09-29)

- Closure record: `docs/runtime/NGU_HANH_EQUIPMENT_RETIREMENT_20260927.md`.
- Exact user-local Windows closure evidence SHA: `39781155b11b1c48edce11fb141cd204a71df71c`.
- Closure command: `DONG_BO_VA_TEST_NGU_HANH_RETIRE.cmd`.
- User-local clean exact-SHA proof:
  - branch `main`;
  - targeted retirement regression PASS;
  - Backend Fast **39/39 PASS**;
  - Frontend Fast **20/20 PASS**;
  - Runtime Browser Smoke **4/4 PASS**;
  - Strict Browser Smoke PASS with `runtimeErrors=0`, `networkFailures=0`, `missingImages=0`, `overflow=0`;
  - `LOCAL CI PASS`;
  - final `NGU HANH RETIREMENT LOCAL CLOSURE: PASS`.
- Retired from live gameplay: equipment Ngũ Hành Gems/sockets, equipment Sets/Tàn Ấn/resonance bonuses, equipment elemental affixes and equipment-sourced elemental affinity/resistance authority.
- Preserved: Linh Căn, unrelated equipment progression/Đạo Văn, and legacy retired fields as read-only compatibility data with zero live retired power/mutation authority.
- Compatibility `*-legacy.js` / pre-retirement modules are deliberate read-only seams; do not delete them merely to reduce module count without a separate compatibility migration.
- Reopen only for a proven regression or explicit user request. Do not silently restore a universal equipment-level Ngũ Hành combat wheel.

## Full-game backend audit debt — intentionally separate from feature closure

The historical whole-game backend `closure` sweep last reported **137/141 PASS** after the five-stat migration. The remaining four failures are deferred cross-system audit debt, not evidence that Quyền is broken:

- `reincarnation-v4-gameplay-balance-test.js`;
- `v121-balance-production-test.js`;
- `v129-global-build-balance-test.js`;
- `v149-artifact-v129-balance-test.js`.

Scope rule:

- `node qa/runners/v140-backend-gates.js closure` remains the full-game directory sweep and is not weakened.
- `node qa/runners/v140-backend-gates.js feature <feature-id>` is the normal scoped backend feature closure.
- legacy `node qa/runners/v140-backend-gates.js dao` remains a compatibility alias for the already closed Fist scope.
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

## Immediate next action — Thần Niệm Dao

1. Open **Thần Niệm (`mind`)** as the next Main Dao slice under `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`; register its feature id with `closureReady:false` before closure work.
2. Audit current runtime/content/rotation seams before changing coefficients. In particular reconcile the existing V2 `mind` echo cadence (`echoEvery: 3`, delayed echo/follow-up lane) with the V118 Thần Niệm skill scaffold built around **Thần Ấn**; do not invent a third independent resource merely to avoid this reconciliation.
3. Lock the production identity first: mental pressure / tactical interference / control, distinct from Kiếm burst and Quyền counter-bruiser. Hard control must remain bounded and boss-resistant; Thần Thức is utility/control authority, not a generic damage multiplier.
4. Then proceed in order: resource contract → combat loop → skill/passive architecture → rotation/AI parity → backend authority → deterministic identity benchmark → minimal tuning → scoped closure.
5. Preserve Combat V3, Sword, Quyền and Ngũ Hành Equipment Retirement locks unless a regression is proven or the user explicitly reopens them.

## Historical checkpoint preservation

- The long pre-compaction checkpoint remains available in Git history at blob `1e671d90970dedb18510ea23b33c03424c24e44c` and the commit history preceding this compaction.
- Dated closure records under `docs/runtime/` are the preferred detailed history for locked backend slices.
