# PROJECT STRUCTURE — CURRENT MAIN

This document describes the live repository. Git history is the archive for removed snapshots, migration notes and obsolete patch machinery.

## Root — operational only

Current launch/update/test entrypoints:

- `00_CHOI_GAME_GODOT_LOCAL.cmd` — safe sync + open Godot.
- `CAP_NHAT_GAME_LOCAL.cmd` — update local checkout from `origin/main` only.
- `VERIFY_GODOT_LOCAL.cmd` — mandatory Godot local gate.
- `SETUP_GODOT_TOOLING.cmd` — optional tooling bootstrap.
- `APPROVE_GODOT_HOME_BASELINE.cmd` — explicit visual-baseline promotion only.
- `TEST_GAME_LOCAL.cmd` — web/runtime Local CI.
- `CHOI_WEB_GAME.cmd`, `CHOI_UI_DEV.cmd` and platform shell launchers — retained while the web implementation remains canonical authority/reference for unported surfaces.

Web entry/runtime remains in `index.html`, `app.js`, `standalone-entry.js`, `standalone-runtime.js`, root CSS, `modules/`, `dist/`, `assets/`, `vendor/` and `web/`.

Do not keep duplicate checkpoints, one-off layout studios, historical reports, backup copies or retired migration launchers in root.

## Godot

- `godot/project.godot` — Godot 4.7.2 project.
- `godot/backend/` — localhost bridge to canonical JS gameplay authority.
- `godot/scripts/models/` — DTO/ViewModel boundary.
- `godot/scripts/home/` and `godot/scripts/character/` — current presentation slices.
- `godot/art/approved/` — production-bound approved art only.
- `godot/tests/` — GdUnit4, Stagehand and visual harness contracts.

Godot presentation must not duplicate locked JS gameplay/save authority unless an explicit parity-proven runtime-port slice is opened.

## Runtime authority

### `dist/core/`
Gameplay engines and runtime logic. Version suffixes are historical naming; authority is determined by live imports, checkpoint contracts and regression tests.

### `dist/content/`
Authored gameplay content and registries.

### `modules/`
Web presentation/runtime modules. Keep while still imported by the live web client or protected by frontend contracts.

## QA

- `qa/tests/` — live regression/authority contracts.
- `qa/runners/` — Fast/Canonical runners.
- `qa/local/` — current local CI and proof validation.
- `qa/playtest/` — deterministic browser journeys.
- `qa/visual/` — on-demand deep visual diagnostics.
- `qa/simulations/` — reusable simulation code only; generated historical reports do not belong in source control.
- `qa/tools/` — reusable diagnostics only.

## Documentation

Keep current contracts and closure evidence only:

- `CURRENT_CHECKPOINT.md`
- `AGENTS.md`
- `docs/DEVELOPMENT_PROTOCOL.md`
- `docs/systems/INDEX.md`
- `docs/versions/`
- active `docs/ui/` contracts/source-of-truth/closure notes
- current guides and balance contracts

Git history replaces obsolete implementation reports and migration snapshots.

## CI

- `.github/workflows/ci.yml` — manual Game CI only.
- `.github/workflows/runner-diagnostics.yml` — manual runner diagnostics.
- Normal development uses Local CI to avoid automatic Actions artifact/storage growth.

## Hygiene rules

1. `main` is the only normal working branch.
2. Git history replaces backup/legacy source snapshots.
3. Before deleting runtime code, prove consumers and preserve regression coverage.
4. Do not delete compatibility state merely because its player-facing lane is retired.
5. Remove one-off tools after their job is replaced by a maintained integrated tool.
6. Production art must have one clear runtime source; obsolete duplicate/fallback binaries should not accumulate.
7. New tasks read the current checkpoint plus only the exact active contracts/source needed.
