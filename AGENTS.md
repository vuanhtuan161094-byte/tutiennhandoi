# AGENTS.md — Tu Tiên Nhàn Dỗi AI Development Contract

This file is the repo-level operating contract for AI coding agents.

## 0. NON-NEGOTIABLE WORKFLOW LOCK

For any production/runtime/UI/asset change:

1. read the current checkpoint and development protocol before editing;
2. patch the smallest coherent change on current `main`;
3. verify the candidate with the **currently enabled project gate**;
4. when GitHub Actions push automation is disabled or unavailable, use clean local evidence instead of forcing Actions;
5. inspect runtime evidence when the change is UI-visible or a smoke gate fails;
6. do not report `done`, `complete`, `healthy`, or equivalent while a required gate is red;
7. if a required gate fails, classify it and patch the smallest responsible layer;
8. do **not** stop and wait for the user to say `continue` during normal fix iterations;
9. UI/UX closure still requires explicit user visual approval of actual runtime screenshots;
10. closure uses Canonical QA only after an approved candidate.

**No exact candidate evidence = no completion claim.**

Current operating mode:
- GitHub Actions is **manual-only** to avoid automatic artifact/storage consumption.
- Web/runtime candidates use `tools/web/TEST_GAME_LOCAL.cmd`; closure evidence starts from Mode 5 — FULL CLEAN on a clean checkout. FULL/FULL CLEAN means Fast + representative runtime browser smoke; heavyweight deep visual diagnostics remain explicit/on-demand via Visual mode.
- Godot candidates use `KIEM_TRA_GAME.cmd`.
- Canonical closure can be run locally with the backend/frontend closure runners when needed.
- Manual GitHub Actions may be used only when explicitly desired and account storage is available.

Deep multi-state/multi-viewport capture tools under `qa/visual/` remain diagnostic/on-demand tools, not a mandatory per-push gate.

## 1. Source of truth

Authority order:

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
4. for UI/UX, read the current canonical UI workflow;
5. inspect only the exact source/test regions needed.

Use `search -> narrow -> read -> patch -> targeted proof`.

For gameplay/system-design discussion, inspect the relevant current backend/runtime authority before answering. Clearly separate **current backend behavior** from **proposed redesign**; do not use conversation memory or an older design as a substitute for current source.

## 3. Locked authority protection

Anything marked `CLOSED / LOCKED` is read-only unless there is a proven regression or the user explicitly changes scope.

For presentation work:
- do not change gameplay/save/runtime authority;
- do not invent UI-owned truth;
- preserve deterministic/runtime-authored values;
- use real runtime evidence before visual closure.

## 4. Concurrent-chat safety on `main`

This repo intentionally works directly on `main`.

When another chat/agent is active:
- split ownership by path/slice;
- refresh `main` immediately before each write;
- never force-update `main`;
- never overwrite a file another active chat owns;
- avoid checkpoint edits until the owning slice is ready to close.

## 5. Testing model

The repository has one normal CI workflow and one diagnostic workflow:

### Local verification — current default
- `tools/web/TEST_GAME_LOCAL.cmd` covers Fast, Browser, Visual and Full local web/runtime proof.
- Mode 5 — FULL CLEAN is the default exact-clean candidate gate while Actions push automation is disabled.
- `KIEM_TRA_GAME.cmd` is the mandatory Godot import/parse/unit/bridge/runtime/Stagehand gate.

### `.github/workflows/ci.yml`
- manual dispatch only;
- `mode=fast` -> Fast backend + Fast frontend + representative Runtime Smoke;
- `mode=closure` -> the same Fast/Smoke gate followed by Canonical backend + frontend QA;
- artifact retention is intentionally short to limit Actions storage use.

### `.github/workflows/runner-diagnostics.yml`
- manual only;
- verifies self-hosted runner, Node, Git/Bash, Chrome and launcher health;
- does not duplicate the game QA suite.

For normal UI work, the Runtime Smoke screenshots are the default visual proof. Capture extra viewport/state evidence only when the actual change is responsive/layout-sensitive, animation-specific, or a defect requires it.

## 6. Assets

Use `assets/_pipeline/` for generated/edited visual assets that may enter production.

Lifecycle:
`draft -> candidate -> approved -> integrated -> locked`

Rules:
- generated art stays `draft/candidate` until user approval;
- only approved assets may enter production paths;
- `locked` requires exact-SHA runtime evidence and owning-slice approval/closure;
- concept art is never runtime proof.

## 7. Development loop

Preferred loop:

`checkpoint -> audit -> narrow patch -> targeted test if useful -> Game CI -> inspect runtime evidence when relevant -> iterate -> user visual approval for UI -> [closure] -> Canonical QA -> checkpoint`

Do not run heavyweight visual/state matrices just because code changed. Use the smallest proof that covers the changed risk.

## 8. Closure

Never mark a UI slice `LOCKED` without:
- exact candidate SHA with green Game CI;
- real runtime screenshot evidence;
- explicit user visual approval;
- Canonical Closure QA;
- checkpoint update by the slice owner.

Do not use `[closure]` merely because a candidate compiles or looks plausible.


## 9. Godot migration work

For any change under `godot/**`:

1. read `godot/AGENTS.md`;
2. load the relevant vendored project-local skill(s) under `skills/godot-*/SKILL.md`;
3. keep Godot presentation separated from locked JS gameplay authority unless a parity-proven porting slice is explicitly opened;
4. use the Godot verification gate defined in `godot/AGENTS.md`;
5. do not use static source review as runtime or visual proof.

The vendored Godot skill snapshot is pinned in `skills/README.md`. Do not silently follow upstream `main`.

Until Godot validation is wired into the unified Game CI, the local Godot import/parse/smoke gate is mandatory for Godot candidates. Existing web/backend Game CI remains authoritative for the locked web/runtime surfaces it covers.
