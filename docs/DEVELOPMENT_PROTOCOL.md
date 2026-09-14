# DEVELOPMENT PROTOCOL — SINGLE MAIN / MINIMAL CONTEXT

This repository is the project source of truth. Conversation history is not the project database.

## 1. Start every task

Read only:

1. `/CURRENT_CHECKPOINT.md`
2. `/docs/versions/<ACTIVE_VERSION>.md` when an active numbered version exists
3. `/docs/systems/INDEX.md` only when routing is unclear
4. exact source/test regions needed for the task

For AI-assisted production work, also follow `/AGENTS.md`.

Do not preload historical reports, old chats, raw simulations, complete CI logs, or unrelated source files.

## 2. Source search

Use `search -> narrow -> read -> patch`.

Normal task context target:
- 1 checkpoint
- 1 active workflow/version spec
- 2–5 relevant source regions
- targeted tests

Open a complete large source file only when architecture cannot be resolved from targeted regions.

## 3. Git strategy

Use **`main` as the only working branch** unless the user explicitly requests isolation.

Rules:
- commit small, coherent changes directly to `main`;
- refresh HEAD immediately before writes when multiple chats/agents may be active;
- never force-update `main`;
- use Git history as rollback/archive instead of duplicate legacy files;
- before creating a new source file, verify that current authority cannot be safely extended;
- remove obsolete duplicate implementations only after references are checked and tests remain green.

## 4. Testing pyramid

- G0: targeted/unit test after a local mechanic change
- G1: affected subsystem tests after mechanic completion
- G2: Fast QA after executable/source commits
- G2B: AI Browser Playtest after covered runtime/UI/asset changes
- G2V: Runtime Visual Proof for UI-visible candidates
- G3: Canonical QA only for an explicit closure candidate

Do not run full canonical closure after every normal commit.

## 5. GitHub Actions

Three workflows have distinct authority:

### `.github/workflows/qa.yml`
- normal executable push to `main` -> Fast QA;
- commit message containing `[closure]` -> Fast QA then Canonical QA;
- manual dispatch -> Fast QA then Canonical QA.

### `.github/workflows/ai-playtest.yml`
- automatically runs on important production runtime/UI/asset paths;
- boots the real canonical server and deterministic DEV fixture;
- executes browser journeys through Chrome CDP;
- fails on scripted journey failure, horizontal overflow, missing runtime images, browser/runtime console errors, or non-cancelled network failures;
- uploads exact-SHA screenshots, raw report and strict health summary.

### `.github/workflows/ui-visual.yml`
- runs for UI-visible paths;
- captures exact-runtime screenshots and Combat proof;
- supports visual review but does not replace explicit user approval.

For a normal runtime/UI candidate, do not call it healthy until Fast QA and AI Browser Playtest are green. For visible UI changes, Runtime Visual Proof is also required before user review.

For CI inspection:
1. read run status;
2. if green, stop;
3. if failed, read failed job/step summary;
4. fetch only the failing log or exact artifact needed.

Never fetch complete successful job logs.

## 6. Asset generation pipeline

Generated/edited production art is governed by `assets/_pipeline/`.

Lifecycle:
`draft -> candidate -> approved -> integrated -> locked`

- no user approval -> no `approved`;
- no approved winner -> no production integration;
- no exact-SHA runtime proof -> no `locked`;
- concept images never count as runtime proof.

The metadata gate is enforced by `qa/playtest/validate-contracts.mjs`.

## 7. Repository structure policy

Prefer stable semantic filenames over version-suffixed filenames for future work.

Do not rename a live versioned authority just for aesthetics. Rename/consolidate only when:
- all imports/consumers are known;
- tests cover the move;
- no gameplay behavior changes.

Retired patch scripts, generated backup snapshots and stale handoff docs should be deleted because Git history already preserves them.

## 8. Version/UI closure

At closure record only:
- version/slice and status;
- exact candidate/closure SHA;
- exact green QA/Playtest/Visual Proof runs as applicable;
- material changes;
- known debt;
- next task/version.

For UI/UX, explicit user visual approval must precede `[closure]`.
Then update `CURRENT_CHECKPOINT.md` so the next chat does not need development history.

## 9. Authority order

Current user instruction > live `main` production code/tests > current checkpoint/workflow > active version spec > Git history.
