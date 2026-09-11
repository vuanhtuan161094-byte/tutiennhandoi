# DEVELOPMENT PROTOCOL — SINGLE MAIN / MINIMAL CONTEXT

This repository is the project source of truth. Conversation history is not the project database.

## 1. Start every task

Read only:

1. `/CURRENT_CHECKPOINT.md`
2. `/docs/versions/<ACTIVE_VERSION>.md`
3. `/docs/systems/INDEX.md` only when routing is unclear
4. exact source/test regions needed for the task

Do not preload historical reports, old chats, raw simulations, complete CI jobs/logs, or unrelated source files.

## 2. Source search

Use `search -> narrow -> read -> patch`.

Normal task context target:
- 1 checkpoint
- 1 active-version spec
- 2–5 relevant source regions
- targeted tests

Open a complete large source file only when architecture cannot be resolved from targeted regions.

## 3. Git strategy

Use **`main` as the only working branch** unless the user explicitly requests isolation.

Rules:
- commit small, coherent changes directly to `main`;
- use Git history as rollback/archive instead of keeping duplicate legacy files;
- do not create B1/B2/B3 or version branches merely as checkpoints;
- before creating a new source file, verify that the current authority cannot be safely extended;
- remove obsolete duplicate implementations only after references are checked and tests remain green.

## 4. Testing pyramid

- G0: targeted/unit test after a local mechanic change
- G1: affected subsystem tests after mechanic completion
- G2: Fast QA after executable/source commits
- G3: Canonical QA only for an explicit closure candidate

Do not run full canonical closure after every normal commit.

## 5. GitHub Actions

The repository should have one active workflow: `.github/workflows/qa.yml`.

Behavior:
- normal executable push to `main` -> Fast QA;
- Markdown/docs-only push -> no QA run;
- commit message containing `[closure]` -> Fast QA then Canonical QA;
- manual workflow dispatch -> Fast QA then Canonical QA.

For CI inspection:
1. read run status;
2. if green, stop;
3. if failed, read failed job/step summary;
4. fetch the failing log only when needed.

Never fetch complete successful job logs. Passing simulation/audit steps should print compact PASS summaries.

## 6. Repository structure policy

Prefer stable semantic filenames over version-suffixed filenames for future work.

Do not rename a live versioned authority just for aesthetics. Rename/consolidate only when:
- all imports/consumers are known;
- tests cover the move;
- no gameplay behavior changes.

Retired patch scripts, generated backup snapshots and stale handoff docs should be deleted because Git history already preserves them.

## 7. Version closure

At closure record only:
- version/status;
- exact closure SHA;
- exact green QA run;
- material changes;
- known debt;
- next task/version.

Then update `CURRENT_CHECKPOINT.md` so the next chat does not need development history.

## 8. Authority order

Current user instruction > live `main` production code/tests > active version spec > Git history.
