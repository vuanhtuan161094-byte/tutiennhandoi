# CURRENT CHECKPOINT — GAME TU TIÊN NHÀN DỖI

Date: 2026-09-11

## Current state

- Locked baseline: **V160 CLOSED / LOCKED**
- Active version: **V161 — Economy & Pacing Fixes**
- Active phase: **B5 — Linh Căn Hunt-linked pacing**
- Canonical working branch: `feature/v161-b5-spiritual-root-hunt-pacing`
- Current branch HEAD: `8c4c6420542ae6bf78a14315f89201c0813f03fc`
- `main`: intentionally untouched; never merge unless the user explicitly orders it
- Gameplay/web version remains `1.40.0-alpha.24.0`

## Current gate state

- V161 B1–B4: PASS on current branch ancestry.
- B5 root cause found: test referenced obsolete/nonexistent top-level `firstClearOrigins` instead of canonical `origins.firstClearGenerated`.
- B5 targeted gate: PASS after patch `9491e36d6d824be2edf957e3205877b76010fdc5`.
- Fast QA run `34553626937`: B1–B5 PASS; backend fast gate was still running at the last status read. Do not poll repeatedly; inspect again only when needed for the next decision.

## Next work

1. Confirm Fast QA final status once before advancing the gate.
2. Execute B6 economy/source-sink review.
3. Run full canonical closure once on the V161 closure candidate.
4. Lock V161 only after the exact closure candidate is green.

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
