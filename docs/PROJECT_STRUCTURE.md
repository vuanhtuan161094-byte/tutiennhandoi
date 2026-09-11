# PROJECT STRUCTURE — CURRENT MAIN

This document describes the live `main` tree only. Git history is the archive for removed snapshots, migration notes and obsolete patch machinery.

## Root — operational only

Keep only launch/runtime entrypoints and current routing documents in root.

- `CHOI_WEB_GAME.cmd` — Windows launcher.
- `CHOI_UI_DEV.cmd` — UI development launcher.
- `START_WEBGAME_WINDOWS.bat` — Windows compatibility launcher.
- `START_WEBGAME_LAN.sh` — LAN launcher.
- `START_GAME_ANDROID.sh`, `STOP_GAME_ANDROID.sh` — Android/Termux launchers.
- `index.html`, `app.js`, `standalone-entry.js`, `standalone-runtime.js` — web/standalone entry layer.
- `styles.css`, `combat-v2.css` — main CSS bundles.
- `manifest.webmanifest`, `pwa-register.js`, `pwa-sw.js` — PWA layer.
- `CURRENT_CHECKPOINT.md` — single current project checkpoint.
- `CHAT_MOI_START_HERE.md` — minimal new-chat router.

Do not keep historical closure reports, duplicate checkpoints, generated source manifests or backup copies of application source in root.

## Runtime source

### `dist/core/`
Gameplay engines and runtime logic. Version suffixes on existing files are legacy naming, not proof of authority. Determine current authority from live imports/consumers plus regression tests.

### `dist/content/`
Authored gameplay content and registries.

### `modules/`
Frontend presentation/runtime modules.

### `assets/`
Game artwork and runtime assets.

### `vendor/`
Vendored third-party runtime dependencies.

### `web/`
Static/LAN server delivery.

## QA

### `qa/tests/`
Production contract, balance, integration and regression tests. Historical version numbers in test filenames are acceptable when the tests still protect a live contract.

### `qa/runners/`
Fast and closure runners used by CI.

### `qa/simulations/`
Simulation code retained only when it still supports a live system or active balance decision.

### `qa/tools/`
Only reusable current diagnostics belong here. One-off migration/patch scripts must be deleted after their migration is complete.

## Documentation

- `docs/DEVELOPMENT_PROTOCOL.md` — single-main development rules.
- `docs/PROJECT_STRUCTURE.md` — this live structure map.
- `docs/systems/INDEX.md` — minimal subsystem routing.
- `docs/versions/V161.md` — current active version status.
- `docs/guides/` — current install/use guides.
- `docs/ui/` — current UI reference material.
- `docs/simulations/` — retained simulation outputs only when still relevant.
- `docs/CULTIVATION_V140_BALANCE.csv` — retained while live cultivation code/tests still consume or protect this balance contract.

## CI

The active workflow is `.github/workflows/qa.yml`.

- normal executable push to `main` -> Fast QA;
- docs-only push -> no QA run;
- commit message containing `[closure]` -> Fast QA then Canonical QA;
- manual dispatch -> Fast QA then Canonical QA.

## Hygiene rules

1. `main` is the only normal working branch.
2. Git history replaces backup/legacy source snapshots.
3. Before creating a new source file, check whether the live authority can be safely extended.
4. Before deleting or consolidating a runtime file, prove references/consumers and keep regression coverage green.
5. Do not rename version-suffixed live authorities solely for aesthetics; rename only as a tested structural migration.
6. Removed gameplay must be purged through state -> engine -> API -> frontend -> content -> QA, not merely hidden from UI.
7. New tasks should read only the current checkpoint, active version spec, optional system router and exact source/tests needed.
