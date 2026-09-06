# PROJECT STRUCTURE — V140 CLEAN TREE

## Root — operational only

Root contains launchers, browser/runtime entrypoints, current handoff docs and current source manifest.

- `CHOI_WEB_GAME.cmd` — Windows launcher.
- `START_WEBGAME_WINDOWS.bat` — compatibility launcher.
- `START_WEBGAME_LAN.sh` — LAN launcher.
- `START_GAME_ANDROID.sh`, `STOP_GAME_ANDROID.sh` — Android/Termux.
- `index.html`, `app.js`, `standalone-entry.js`, `standalone-runtime.js` — web/standalone entry layer.
- `styles.css`, `combat-v2.css` — current CSS bundles.
- `manifest.webmanifest`, `pwa-register.js`, `pwa-sw.js` — PWA layer.
- `CURRENT_CHECKPOINT.md`, `CHAT_MOI_START_HERE.md`, `CURRENT_UI_CHECKPOINT.md` — current handoff state.
- `FULL_SOURCE_SHA256_MANIFEST.txt` — generated checksum manifest.

No historical patch report or superseded checkpoint belongs in root.

## Runtime source

### `dist/core/`
Gameplay engines and canonical runtime logic. Tu Luyện canonical ownership is `cultivation-v140.js`; Session/API/facade consume that contract.

### `dist/content/`
Authored content and registries.

### `modules/`
Frontend presentation/Pixi modules.

### `assets/`
Game artwork/assets.

### `vendor/`
Vendored third-party runtime.

### `web/`
Node static server / LAN delivery.

## QA

### `qa/tests/`
Current production, transport, balance and regression tests. Historical tests whose only contract was removed gameplay/UI are not retained in the current tree.

### `qa/runners/`
Canonical runners:
- `node qa/runners/v140-backend-gates.js fast|closure`
- `node qa/runners/v140-frontend-gates.js fast|closure`

### `qa/simulations/`
Only simulations still useful for live systems. Generated artifacts belong in `docs/simulations/`.

## Documentation

- `docs/CULTIVATION_V140_BALANCE.csv` — canonical cultivation balance table.
- `docs/guides/` — install/use guides.
- `docs/simulations/` — retained live-system simulation outputs.
- `docs/ui/` — current UI implementation/reference material.

## Hygiene rules

1. Runtime code lives only in approved runtime directories.
2. Tests live in `qa/tests`; runners in `qa/runners`; simulations in `qa/simulations`.
3. Current root contains no patch-history/archive dump.
4. Removed gameplay must be purged through state → engine → API → frontend → content → QA, not merely hidden from UI.
5. Structural changes require V140 core/transport/zero-legacy gates plus backend/frontend closure before packaging.
