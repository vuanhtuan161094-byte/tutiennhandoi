# CURRENT CHECKPOINT — GAME TU TIÊN NHÀN DỖI

Date: 2026-09-11

## Canonical state

- Repository authority: **`main` only**.
- All former feature/refactor/tmp branches were deleted after `main` was fast-forwarded to the latest V161 lineage.
- Do not create version/block branches unless the user explicitly requests isolation.
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
- B6 — Economy/source-sink review: NEXT.
- V161 full closure: PENDING.

## Repository consolidation — PASS

Safe consolidation completed without changing gameplay behavior:

- removed obsolete V141/V142/V145 branch-specific workflows;
- removed retired V142/V145 patch/migration tools;
- removed stale V140 UI handoff/checkpoint files and duplicate next-chat/start routers;
- removed stale source SHA manifest and historical reports already preserved by Git history;
- removed unreferenced `app-legacy-v146.js`;
- synchronized `CHAT_MOI_START_HERE.md`, `docs/DEVELOPMENT_PROTOCOL.md`, `docs/PROJECT_STRUCTURE.md`, `docs/systems/INDEX.md` and `docs/versions/V161.md` to the single-main model;
- replaced multiple CI workflows with one `.github/workflows/qa.yml`.

Consolidation validation:

- QA workflow run `34556128020`: **SUCCESS**.
- V161 B1–B5: PASS.
- Backend fast gate: PASS.
- Frontend fast gate: PASS.
- Canonical QA correctly did not run because the consolidation commit was not a `[closure]` commit.
- `.github/workflows/` now contains only `qa.yml`.

Consolidation rule going forward: delete only files proven obsolete/unreferenced or migrate their live responsibility first. Do not change gameplay merely to make the tree look cleaner.

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
- Normal executable pushes to `main` run Fast QA.
- Markdown/docs-only pushes do not run QA.
- A commit message containing `[closure]` runs Fast QA then Canonical QA.
- Manual QA workflow dispatch also runs Fast QA then Canonical QA.
- Read CI status first; inspect job/log details only on failure.
- Current user instruction > live `main` source/tests > active version spec > Git history.

## Next work

1. Execute V161 B6 economy/source-sink review using minimal context.
2. Run targeted/subsystem tests for any B6 changes.
3. Commit the V161 closure candidate with `[closure]`.
4. Lock V161 only after the exact closure candidate is fully green.
