# DEVELOPMENT PROTOCOL — SINGLE MAIN / LEAN CI

This repository is the project source of truth. Conversation history is not the project database.

## 1. Start every task

Read only:

1. `/CURRENT_CHECKPOINT.md`;
2. the active version/workflow spec when one exists;
3. exact source/test regions needed for the task;
4. `/AGENTS.md` for AI-assisted production work.

Do not preload historical reports, old chats, full CI logs, or unrelated source files.

## 2. Source search

Use `search -> narrow -> read -> patch`.

Normal task context target:
- 1 checkpoint;
- 1 active workflow/version spec;
- 2–5 relevant source regions;
- targeted tests only when they materially help.

## 3. Git strategy

Use **`main` as the only working branch** unless the user explicitly requests isolation.

Rules:
- commit small coherent changes directly to `main`;
- refresh HEAD immediately before writes when multiple chats/agents may be active;
- never force-update `main`;
- use Git history instead of duplicate backup files;
- remove obsolete duplicate implementations only after references are checked.

## 4. Testing pyramid

- G0: targeted test when changing a narrow mechanic/contract;
- G1: **Game CI Fast** after executable/source changes;
- G2: real-browser **Runtime Smoke** in the same Game CI job;
- G3: **Canonical Closure QA** only for approved `[closure]` or manual closure mode.

For UI-visible work, the Runtime Smoke artifact is the normal visual-smoke evidence because it comes from the real game at the primary 390×844 viewport.

Extra screenshots are risk-driven, not automatic:
- add compact/tall viewport proof only for responsive/layout-sensitive changes;
- use `qa/visual/` deep showcase tools only for animation/transient-state debugging or deliberate visual review;
- do not run the 7-skill / multi-shake / multi-frame showcase on every push.

## 5. GitHub Actions

### `.github/workflows/ci.yml`

Normal push to `main`:
1. Backend Fast QA;
2. Frontend Fast QA;
3. validate runtime-smoke contracts;
4. boot canonical server;
5. run deterministic real-browser journeys;
6. upload exact-SHA runtime report/screenshots.

Closure:
- a commit message containing `[closure]`, or manual dispatch with `mode=closure`, runs Canonical backend/frontend QA after Fast + Runtime Smoke pass.

The workflow deliberately keeps browser smoke and visual smoke together so the runner is checked out, configured and booted only once.

### `.github/workflows/runner-diagnostics.yml`

Manual only. Use when the self-hosted runner itself is suspect. It checks Node, Git/Bash, Chrome and launcher health; it does not rerun the game QA suite.

## 6. CI inspection

1. inspect run status;
2. if green, stop unless runtime screenshots must be reviewed;
3. if failed, inspect only the failed step/log/artifact;
4. classify runtime vs test-harness vs runner failure before patching.

Do not fetch complete successful logs.

## 7. Asset pipeline

Generated/edited production art is governed by `assets/_pipeline/`.

Lifecycle:
`draft -> candidate -> approved -> integrated -> locked`

- no user approval -> no `approved`;
- no approved winner -> no production integration;
- no exact-SHA runtime proof -> no `locked`;
- concept images never count as runtime proof.

## 8. UI/UX closure

For UI/UX:

`source snapshot -> real baseline -> narrow audit/brief -> candidate patch -> Game CI -> runtime screenshot review -> user approval -> [closure] -> Canonical QA -> checkpoint`

Primary review viewport is 390×844. Additional viewports are required only when the changed risk is responsive/layout-related or an observed defect needs them.

## 9. Authority order

Current user instruction > live `main` production code/tests > current checkpoint/workflow > active version spec > Git history.


## 10. Godot migration validation

Godot work has an additional project-local validation lane.

Before editing `godot/**`, read `godot/AGENTS.md` and the mapped vendored skills under `skills/**`.

Godot candidate loop:

`source snapshot -> relevant skill -> narrow patch -> full import when resources changed -> parse-check changed GDScript -> targeted/bridge test -> bounded runtime smoke -> actual runtime screenshot for UI -> user approval`

Minimum technical gate when Godot is available locally:

```
godot --headless --path godot --import
godot --headless --path godot --check-only --script res://<changed-script>.gd
godot --headless --path godot --quit-after 300
```

Rules:
- a source-only review is not a Godot runtime PASS;
- adding/removing assets requires the import gate;
- UI-visible Godot work requires actual 390×844 runtime evidence;
- do not ask the user to discover obvious parser/import failures that a headless gate can catch;
- when Stagehand visual automation is later installed and locked, its scenario/screenshot diff becomes the normal pre-review visual gate;
- this lane supplements, not replaces, existing Game CI for web/backend surfaces.
