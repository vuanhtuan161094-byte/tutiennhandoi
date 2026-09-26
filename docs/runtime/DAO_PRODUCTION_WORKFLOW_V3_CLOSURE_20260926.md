# DAO PRODUCTION WORKFLOW V3 CLOSURE — 2026-09-26

Repository: `vuanhtuan161094-byte/tutiennhandoi`  
Branch: `main`

## Status

**DAO PRODUCTION WORKFLOW V3 — ACTIVE / LOCKED.**

This record locks the reusable production/rebalance workflow learned from Sword and Fist. It changes QA/workflow infrastructure only; it does not reopen or retune Combat V3, Sword, Fist, Godot gameplay authority, or unrelated systems.

## 1. Exact verified candidate

Exact user-local FAST candidate:

`a7119a7fbef8159a0c49a138775f0ec29b3f1296`

Evidence supplied from `tools/web/TEST_GAME_LOCAL.cmd` Mode 1:

- branch: `main`;
- clean worktree / `dirty=false`;
- exact-SHA evidence: YES;
- Local CI status: PASS;
- passed steps: **21**;
- failed steps: **0**;
- Backend Fast: **39/39 PASS**;
- Frontend Fast: **20/20 PASS**;
- `feature-closure-framework-test.js`: PASS;
- `dao-closure-scope-contract-test.js`: PASS.

No Full Clean or balance benchmark rerun is required for this closure because the candidate modifies documentation, QA runners/tests, manifests, and CMD workflow only; no production gameplay/runtime coefficients were changed.

## 2. Locked workflow sequence

Every new Main Dao production/rebalance slice now uses:

`Scope Lock -> Contract -> Runtime Seam Audit -> Correctness -> Parity -> Identity-valid Benchmark -> Minimal Tune -> FULL CLEAN -> Feature Closure -> Lock`

Key rules:

- contract before coefficients;
- correctness before balance;
- parity before benchmark;
- benchmark DPS is invalid when the intended archetype mechanic did not execute;
- tune only the smallest feature-owned lever needed to enter the target band;
- feature closure is scoped from the beginning;
- full-game closure remains an independent audit and must not drag unrelated systems into the active slice.

## 3. Generic feature closure infrastructure

Canonical registry:

`qa/runners/feature-closure-manifest.js`

Canonical runner modes:

- `feature-list`;
- `feature-info <feature-id>`;
- `feature <feature-id>`;
- `closure` remains the independent whole-game sweep.

Generic Windows closure launcher:

`DONG_BO_VA_TEST_FEATURE.cmd <feature-id>`

Legacy compatibility launcher:

`DONG_BO_VA_TEST_DAO.cmd`

The compatibility launcher routes the already-closed Fist slice through the generic feature system; it is not the preferred launcher for new Dao work.

## 4. Fail-closed manifest policy

A newly opened Dao must be registered with:

`closureReady: false`

The generic runner must refuse final feature closure while that value remains false.

Only flip to `closureReady: true` after all of the following are demonstrated:

- correctness complete;
- parity complete;
- identity-valid deterministic benchmark;
- target bands PASS;
- required regression guards exist;
- locked shared Dao regressions remain green.

This prevents premature closure claims and makes the closure boundary explicit from Phase 0.

## 5. Identity-valid benchmark rule

Every benchmark must prove both numerical performance and behavioral identity.

Examples:

- Counter build: counter casts and successful counters > 0;
- Break build: Break/Broken behavior occurs;
- channel build: completed channels > 0 and no false OOM cancellation;
- stack build: authored threshold/uptime is reached;
- payoff build: resource generation, spend, and payoff casts occur;
- Ultimate/domain build: Ultimate/domain events occur.

If identity evidence is zero, DPS is invalid evidence. Fix the harness or decision path before tuning coefficients.

## 6. Scoped closure vs full-game audit

The generic feature launcher performs:

1. update from `origin/main`;
2. Mode 5 FULL CLEAN exact-candidate proof;
3. feature-scoped backend closure from the registered manifest;
4. final clean-worktree check;
5. exact SHA output.

Full-game backend closure remains separate:

`node qa/runners/v140-backend-gates.js closure`

An unrelated failure in Pháp Bảo, Linh Thú, Tri Kỷ, Equipment balance, Alchemy, Economy, Reincarnation-wide/global balance, or another deferred subsystem is not permission to retune that subsystem during a Dao slice.

## 7. Locked references for the next Dao chat

Before touching a new Dao, read:

1. `AGENTS.md`;
2. `CURRENT_CHECKPOINT.md`;
3. `docs/DEVELOPMENT_PROTOCOL.md`;
4. `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`;
5. `docs/runtime/DAO_NEW_SLICE_TEMPLATE_V3.md`.

Then inspect current source, create the Dao contract, register its feature id with `closureReady:false`, and complete the runtime seam audit before changing production coefficients.

## Final disposition

**DAO PRODUCTION WORKFLOW V3 — ACTIVE / LOCKED.**

Use this workflow as the default for the next Dao and future Dao rebalances. Modify the workflow itself only when a concrete future slice exposes a proven process defect or the user explicitly requests a workflow change.
