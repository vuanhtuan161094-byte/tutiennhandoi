# DEVELOPMENT PROTOCOL — MINIMAL CONTEXT

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

Open a complete large source file only when the architecture cannot be resolved from targeted regions.

## 3. Testing pyramid

- G0: unit/targeted test after a local mechanic change
- G1: affected subsystem tests after mechanic completion
- G2: Fast QA after a feature block
- G3: Canonical Closure QA only on a closure candidate

Do not run full canonical closure after every feature commit.

## 4. GitHub Actions

Feature/refactor branches use `.github/workflows/fast-ci.yml`.

Full canonical QA runs only on:
- `closure/**`
- `main`
- pull request into `main`
- manual dispatch

For a CI check:
1. read run status
2. if green, stop
3. if failed, read job/step summary
4. fetch the failing log only if the summary is insufficient

Never fetch complete job logs for a successful run.

Passing simulations/audits should print compact PASS summaries. Detailed output is retained only on failure or in dedicated report artifacts.

## 5. Branch strategy

V161 keeps its existing branch lineage to avoid disruptive history surgery.

Starting with the next version, prefer one development branch per version:

`feature/v162`

Use commits/checkpoints for B1/B2/B3... instead of creating one branch per block.

When ready for full closure, create/use:

`closure/v162`

Only merge to `main` when the user explicitly authorizes it.

## 6. Documentation-only changes

Fast QA ignores Markdown/docs-only pushes. A commit containing executable/source changes still runs Fast QA.

## 7. Version closure

At closure, record only:
- version/status
- exact closure SHA
- exact green CI run
- material changes
- known debt
- next version/task

Then update `CURRENT_CHECKPOINT.md` so the next chat does not need the closed version's development history.

## 8. Historical material

Historical reports remain available for forensic regression work but are cold context by default. Do not delete historical evidence merely to reduce model context; simply stop loading it unless needed.

## 9. Main protection recommendation

`main` should eventually be protected against accidental direct pushes and should require Canonical Closure QA before merge. This is repository administration, not required for V161 work, and should be configured separately without changing the current locked/development branch state.
