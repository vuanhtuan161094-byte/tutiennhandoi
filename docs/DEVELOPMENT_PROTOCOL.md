# DEVELOPMENT PROTOCOL — SINGLE MAIN / LEAN CI

This repository is the project source of truth. Conversation history is not the project database.

## 1. Start every task

Read only:

1. `/CURRENT_CHECKPOINT.md`;
2. `/GAME_MASTER_MAP.md` only for project-wide planning/status or when opening a new major module;
3. `/docs/systems/INDEX.md` + the owning `MODULE.md` for module-scoped work;
4. the active version/workflow spec when one exists;
5. exact source/test regions needed for the task;
6. `/AGENTS.md` for AI-assisted production work.

For Main Dao production/rebalance slices, also read:

- `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`;
- the active Dao production contract.

Do not preload historical reports, old chats, full CI logs, or unrelated source files.

## 2. Source search

Use `search -> narrow -> read -> patch`.

Normal task context target:
- 1 checkpoint;
- 1 active workflow/version spec;
- 2–5 relevant source regions;
- targeted tests only when they materially help.

For gameplay/backend feature work, perform a **scope lock** before production tuning:
- feature id;
- allowed production areas;
- shared seams that may be changed only with evidence;
- explicitly deferred systems;
- required regression surfaces;
- feature closure manifest.

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
- G1: Fast QA after executable/source changes;
- G2: real-browser Runtime Smoke when the changed risk reaches runtime/web behavior;
- G3: exact clean candidate proof with Mode 5 — FULL CLEAN;
- G4: **feature-scoped closure** for the opened backend/gameplay slice;
- G5: whole-game backend/frontend closure only when the task scope is whole-game or when deliberately auditing cross-system debt.

Current default is local:
- `tools/web/TEST_GAME_LOCAL.cmd` for web/runtime;
- Mode 5 — FULL CLEAN for clean exact-candidate proof;
- `DONG_BO_VA_TEST_FEATURE.cmd <feature-id>` for registered backend feature closure;
- `KIEM_TRA_GAME.cmd` for Godot.

Feature manifests live in `qa/runners/feature-closure-manifest.js`.

Useful commands:

```cmd
node qa\runners\v140-backend-gates.js feature-list
node qa\runners\v140-backend-gates.js feature-info <feature-id>
node qa\runners\v140-backend-gates.js feature <feature-id>
```

A feature with `closureReady:false` must fail closed. Do not flip it to `true` until correctness, parity, deterministic identity-valid benchmark evidence, and required regression tests are complete.

### Benchmark validity rule

A balance benchmark is invalid if the archetype did not execute its defining behavior. Examples:
- Counter build with zero successful counters;
- Break build with zero Break events;
- channel build with zero completed channels;
- stack/resource build that never reaches/spends its defining state;
- Ultimate/domain build with zero Ultimate/domain events.

Do not tune coefficients from invalid identity evidence.

### Full-game audit rule

`node qa/runners/v140-backend-gates.js closure` remains the whole-game backend directory sweep.

A red out-of-scope test is classified before patching. It does not grant permission to rebalance that unrelated system during a narrow feature slice.

For UI-visible work, evidence must come from the real game at the primary 390×844 viewport.

Extra screenshots are risk-driven, not automatic:
- add compact/tall viewport proof only for responsive/layout-sensitive changes;
- use `qa/visual/` deep showcase tools only for animation/transient-state debugging or deliberate visual review;
- do not run the 7-skill / multi-shake / multi-frame showcase on every push.

## 5. GitHub Actions

### `.github/workflows/ci.yml`

GitHub Actions is manual-only in the current repository mode. It does not run on every push.

Manual `mode=fast`:
1. Backend Fast QA;
2. Frontend Fast QA;
3. validate runtime-smoke contracts;
4. boot canonical server;
5. run deterministic real-browser journeys;
6. upload short-retention exact-SHA evidence.

Manual `mode=closure` adds full Canonical backend/frontend QA after Fast + Runtime Smoke. This remains a whole-game audit and does not replace registered feature-scoped closure.

Normal development should use the local gates above unless the user explicitly chooses Actions.

The workflow deliberately keeps browser smoke and visual smoke together so the runner is checked out, configured and booted only once.

### `.github/workflows/runner-diagnostics.yml`

Manual only. Use when the self-hosted runner itself is suspect. It checks Node, Git/Bash, Chrome and launcher health; it does not rerun the game QA suite.

## 6. CI inspection

1. inspect run status;
2. if green, stop unless runtime screenshots must be reviewed;
3. if failed, inspect only the failed step/log/artifact;
4. classify failure as production regression, stale expectation, harness defect, runner/environment defect, or out-of-scope audit debt before patching.

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

`source snapshot -> real baseline -> narrow audit/brief -> candidate patch -> Game CI -> runtime screenshot review -> user approval -> [closure] -> required scoped/Canonical QA -> checkpoint`

Primary review viewport is 390×844. Additional viewports are required only when the changed risk is responsive/layout-related or an observed defect needs them.

## 9. Backend/gameplay feature closure

Preferred feature loop:

`scope lock -> contract -> runtime seam audit -> correctness -> parity -> identity-valid benchmark -> minimal local tune -> FULL CLEAN -> feature-scoped closure -> closure record -> compact checkpoint`

Rules:
- correctness before balance;
- parity before benchmark;
- one tuning lever at a time;
- prefer feature-owned/local levers over global multipliers;
- stop tuning when the locked target band passes;
- do not rerun unrelated heavyweight evidence unless the changed risk requires it;
- record final gameplay SHA separately from later QA/docs-only closure SHA when applicable;
- preserve whole-game audit failures as explicit deferred debt instead of hiding them.

## 10. Authority order

Current user instruction > live `main` production code/tests > current checkpoint/workflow > active version spec > Git history.

## 11. Godot migration validation

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
- Stagehand v0.4.1 and GdUnit4 v6.2.1 are pinned by `tools/godot/TOOLING_LOCK.json`;
- run `KIEM_TRA_GAME.cmd` as the normal Godot local gate;
- Stagehand structural smoke is required after executable Godot changes;
- UI-visible work uses deterministic Stagehand capture before baseline approval and screenshot diff after a user-approved baseline is committed;
- baseline promotion is explicit via `powershell -NoProfile -ExecutionPolicy Bypass -File tools/godot/Approve-HomeBaseline.ps1 -ConfirmApproved`; never auto-refresh a golden baseline;
- this lane supplements, not replaces, existing Game CI for web/backend surfaces.
