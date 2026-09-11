# CURRENT CHECKPOINT — GAME TU TIÊN NHÀN DỖI

Date: 2026-09-11

## Canonical state

- Repository authority: **`main` only**.
- All former feature/refactor/tmp branches were deleted after `main` was fast-forwarded to the latest V161 state.
- Do not create version/block branches unless the user explicitly asks for isolation.
- Git history is the archive. Do not keep duplicate legacy snapshots merely for backup.
- Locked baseline: **V160 CLOSED / LOCKED**.
- Active version: **V161 — Economy & Pacing Fixes**.
- Gameplay/web version string remains `1.40.0-alpha.24.0` until versioning is deliberately changed.

## V161 gate state

- B1 — Bế Quan contract audit: PASS.
- B2 — Early pacing classification: PASS.
- B3 — Bound Jade spend model: PASS.
- B4 — Manual acquisition-adjusted Công Pháp pacing: PASS.
- B5 — Linh Căn × Hunt pacing: PASS after the test contract was corrected to use `origins.firstClearGenerated`.
- Fast QA run `34553626937`: SUCCESS on the last executable V161/CI commit before repository consolidation.
- B6 — Economy/source-sink review: NEXT.
- V161 full closure: PENDING.

## Repository consolidation

Completed safe cleanup so far:

- removed obsolete V141/V142/V145 branch-specific workflows;
- removed retired V142/V145 patch/migration tools;
- removed stale V140 UI handoff/checkpoint files and duplicate next-chat router;
- removed stale source SHA manifest and historical root reports already preserved by Git history;
- removed unreferenced `app-legacy-v146.js`.

Consolidation rule: delete only files proven obsolete/unreferenced or migrate their live responsibility first. Do not change gameplay merely to make the tree look cleaner.

## Minimal-context protocol

For every new task read only:

1. `CURRENT_CHECKPOINT.md`
2. `docs/versions/V161.md`
3. `docs/systems/INDEX.md` only when routing is unclear
4. exact live source/tests for the affected subsystem

Do not preload old reports, old chats, raw simulations, complete CI logs, or unrelated source.

## Execution rules

- Search → narrow → read exact authority → patch → targeted test.
- Small normal commits go directly to `main`.
- Source changes use Fast QA.
- Full Canonical QA is reserved for an explicit closure commit/manual closure run.
- Read CI status first; inspect job/log details only on failure.
- Current user instruction > live `main` source/tests > active version spec > Git history.

## Next work

1. Finish repository consolidation validation and establish the single `main` QA workflow.
2. Execute V161 B6 economy/source-sink review.
3. Run full Canonical QA once on the V161 closure candidate.
4. Lock V161 only after that exact closure candidate is green.
