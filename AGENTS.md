# AGENTS.md — Tu Tiên Nhàn Dỗi AI Development Contract

This file is the repo-level operating contract for AI coding agents.

## 0. NON-NEGOTIABLE WORKFLOW LOCK

This section is a hard operating rule for every AI coding agent working in this repository.

For any production/runtime/UI/asset change covered by the repository workflows:

1. read the current checkpoint and development protocol before editing;
2. patch and push the smallest coherent change to current `main`;
3. verify the **exact candidate SHA** through every applicable gate:
   - Fast QA;
   - AI Browser Playtest;
   - Runtime Visual Proof for UI-visible changes;
4. inspect the resulting runtime evidence, not only workflow status;
5. if a required gate fails, classify the failure, patch the responsible layer, push again, and repeat automatically;
6. do **not** stop and wait for the user to say `continue` during normal implementation/fix iterations;
7. do **not** report `done`, `complete`, `healthy`, `candidate ready`, or equivalent until all applicable exact-SHA gates are green;
8. if progress is impossible because of a real external blocker, report `BLOCKED` with the exact blocker instead of claiming completion;
9. explicit user visual approval is required for UI/UX **closure**, but is not required for the agent to continue fixing an unapproved candidate.

**No exact-SHA evidence = no completion claim.**

This workflow lock must not be weakened or removed as part of feature work. `qa/playtest/validate-contracts.mjs` enforces the presence of this contract.

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
Use `qa/playtest/` to run deterministic real-runtime journeys. For production/runtime/UI/asset changes covered by `.github/workflows/ai-playtest.yml`, a green **AI Browser Playtest** on the exact candidate SHA is required before closure. Treat its report/screenshots as diagnostic evidence, not visual approval.

### Assets
Use `assets/_pipeline/` for all generated/edited visual assets that may enter production. Every tracked asset must have a V2 brief under `assets/_pipeline/briefs/` and a registry index entry.

Asset lifecycle:
`draft -> candidate -> approved -> integrated -> locked`

Rules:
- generated art stays `draft/candidate` until user approval;
- `approved` requires a recorded selected candidate and approval note;
- only approved assets may be copied to production paths;
- `integrated` requires a real production file;
- `locked` requires exact-SHA runtime proof metadata plus owning-slice approval/closure;
- generated concept art is never presented as implemented runtime UI.

## 6. AI game-development loop

Preferred production loop:

`checkpoint -> audit -> narrow brief -> minimal code/asset candidate -> targeted/Fast QA -> AI Browser Playtest -> real runtime visual proof when UI-visible -> user visual approval when required -> closure QA -> checkpoint`

If Browser Playtest fails, classify the failure before patching:
- launcher/server;
- runtime/JS;
- interaction/selector;
- network;
- layout/missing asset;
- visual-only review issue.

Patch the smallest responsible layer. Do not reopen gameplay authority to fix presentation automation.

## 7. Evidence policy

For runtime/UI candidates, retain exact-SHA evidence:
- Fast QA run;
- AI Browser Playtest artifact (`playtest-report.json`, `health-summary.json`, screenshots);
- UI Visual Proof artifact when the change is visible;
- explicit user visual approval for UI/UX closure.

A green automated gate proves structural/runtime health only. It cannot replace human visual approval.

## 8. Closure rules

Never mark a UI slice `LOCKED` without:
- real runtime screenshots from the exact candidate;
- green Fast QA;
- green AI Browser Playtest for covered production paths;
- explicit user visual approval;
- closure QA;
- checkpoint update by the slice owner.

Do not use `[closure]` merely because a candidate compiles or looks plausible.
