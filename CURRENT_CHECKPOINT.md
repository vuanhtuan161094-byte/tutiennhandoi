# CURRENT CHECKPOINT — GAME TU TIÊN NHÀN DỖI

Date: 2026-09-11

## Current state

- Locked baseline: **V160 CLOSED / LOCKED**
- Active version: **V161 — Economy & Pacing Fixes**
- Active phase: **B5 — Linh Căn Hunt-linked pacing**
- Canonical working branch: `feature/v161-b5-spiritual-root-hunt-pacing`
- `main`: intentionally untouched; never merge unless the user explicitly orders it
- Gameplay/web version remains `1.40.0-alpha.24.0`

## Current gate state

V161 B1–B4 are green on the current B5 ancestry.

Implementation HEAD before context-optimization commits: `3a8cffe34a4f3fbdb00ccf07a166893df975ec7b`.
Canonical QA run `34549092702` failed only when reaching `V161 Spiritual Root x Hunt pacing`; B5 must be fixed before B6 or V161 closure.

## Next work

1. Diagnose/fix B5 targeted failure.
2. Run B5 + V161 fast/integration gates.
3. Execute B6 economy/source-sink review.
4. Run full canonical closure once on the V161 closure candidate.
5. Lock V161 only after the exact closure candidate is green.

## Minimal-context protocol

New chat / new task reads only:

1. `CURRENT_CHECKPOINT.md`
2. `docs/versions/V161.md`
3. `docs/systems/INDEX.md` only when routing is needed
4. exact live source/tests for the subsystem being changed

Do **not** preload V140–V160 reports, old chats, raw simulation output, full CI jobs/logs, or unrelated source files.

For CI: read run status first; fetch jobs only on failure; fetch logs only for the failing job when necessary.

## Authority order

Current user instruction > current feature-branch production code/tests > current version spec > locked historical evidence.

Do not use V170 terminology. Do not restore superseded mechanics from compatibility code/history.
