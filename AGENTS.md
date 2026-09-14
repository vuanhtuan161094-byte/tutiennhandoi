# AGENTS.md — Tu Tiên Nhàn Dỗi AI Development Contract

This file is the repo-level operating contract for AI coding agents.

## 1. Source of truth

Use this authority order:

1. current user instruction;
2. current `main` HEAD and `/CURRENT_CHECKPOINT.md`;
3. live production code + tests;
4. the active canonical workflow/spec referenced by the checkpoint;
5. older docs/history only when needed for evidence.

Conversation memory is never a substitute for current `main`.

## 2. Start every task

Before editing:

1. confirm current `main` HEAD;
2. read `/CURRENT_CHECKPOINT.md`;
3. read `/docs/DEVELOPMENT_PROTOCOL.md`;
4. for UI/UX, also read the current canonical UI workflow referenced by the checkpoint;
5. inspect only the exact source/test regions needed.

Use `search -> narrow -> read -> patch -> targeted proof`.

## 3. Locked authority protection

Any subsystem marked `CLOSED / LOCKED` is read-only unless a proven regression requires reopening it or the user explicitly changes the scope.

For presentation work:
- do not change gameplay/save/runtime authority;
- do not invent UI-owned truth;
- preserve deterministic/runtime-authored values;
- real runtime proof is mandatory before visual closure.

## 4. Concurrent-chat safety on `main`

This repo intentionally uses `main` directly.

When another chat/agent is active:
- split ownership by path/slice;
- refresh `main` immediately before each write/commit;
- never force-update `main`;
- never overwrite a file another active chat owns;
- avoid `CURRENT_CHECKPOINT.md` until the owning slice is ready to close;
- if HEAD moved, rebase the intended minimal patch conceptually onto the new HEAD before writing.

Current active UI slice ownership always comes from `CURRENT_CHECKPOINT.md`.

## 5. Task routing

### Gameplay/runtime
Follow the non-UI workflow from the checkpoint and preserve locked authorities.

### UI/UX
Follow the canonical runtime-first UI workflow. Static mocks or generated concept art never count as implementation proof.

### Browser playtesting
Use `qa/playtest/` to run deterministic real-runtime journeys. Treat its report/screenshots as diagnostic evidence, not visual approval.

### Assets
Use `assets/_pipeline/` for briefs and lifecycle metadata. Generated art stays `draft/candidate` until user approval; only approved assets may be integrated into production paths.

## 6. AI game-development loop

Preferred loop:

`checkpoint -> audit -> narrow brief -> minimal code/asset candidate -> targeted/Fast QA -> browser playtest -> real runtime screenshots -> user visual approval when required -> closure QA -> checkpoint`

If browser playtest finds a regression, patch the smallest responsible layer and rerun the affected scenario before broader QA.

## 7. Closure rules

Never mark a UI slice `LOCKED` without:
- real runtime screenshots from the exact candidate;
- green automated QA;
- explicit user visual approval;
- closure QA;
- checkpoint update by the slice owner.

Do not use `[closure]` merely because a candidate compiles or looks plausible.
