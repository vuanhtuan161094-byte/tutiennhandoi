# Local CI — Game Tu Tiên Nhàn Dỗi

Local CI mirrors the repository's existing Fast QA, AI Browser Playtest, and Runtime Visual Proof runners without using GitHub-hosted Actions minutes.

## Windows launcher

Double-click:

`TEST_GAME_LOCAL.cmd`

Modes:

- `FAST` — contract validation + hosted Active Phase gates + Backend Fast + Frontend Fast.
- `BROWSER` — canonical local server + deterministic browser journeys + strict summary.
- `VISUAL` — real runtime UI capture + Combat proof at 390x844, 360x800, 412x915, 430x932 + semantic validation.
- `FULL` — FAST + BROWSER + VISUAL.
- `FULL CLEAN` — same as FULL, but refuses a dirty git working tree. Use this when evidence must map to an exact commit SHA.

Command-line equivalents:

```bat
TEST_GAME_LOCAL.cmd fast
TEST_GAME_LOCAL.cmd browser
TEST_GAME_LOCAL.cmd visual
TEST_GAME_LOCAL.cmd full
TEST_GAME_LOCAL.cmd full --require-clean
```

Direct Node entry point:

```bat
node qa\local\run-local-ci.mjs full --require-clean
```

## Requirements

- Node.js 22 or newer.
- Git available in PATH for exact-SHA metadata.
- Chrome or Microsoft Edge for `browser`, `visual`, and `full` modes. The runner auto-detects standard Windows install locations. `CHROME_PATH` can override detection.

## Evidence

Every run writes to:

`artifacts/local-ci/<timestamp>-<sha>-<clean|dirty>-<mode>/`

Important files:

- `README.md` — human-readable pass/fail summary.
- `local-ci-summary.json` — machine-readable summary.
- `local-ci.log` — combined runner log.
- `server.log` — canonical server log.
- `ai-playtest/` — browser journey evidence.
- `ui-visual/` — runtime screenshots and Combat metrics.

`artifacts/local-ci/LAST_RUN.txt` points to the latest run directory.

A dirty working tree is useful for iteration, but it is **not exact-SHA evidence**. For candidate/closure review use `FULL CLEAN` after committing the intended code.

## Design rule

Local CI does not replace or fork the project's test logic. It calls the same repository tests/runners used by hosted CI:

- V161–V169 Active Phase authority tests from `.github/workflows/qa.yml`
- `qa/runners/v140-backend-gates.js`
- `qa/runners/v140-frontend-gates.js`
- `qa/playtest/run-scenarios.mjs`
- `qa/visual/capture-runtime-ui.mjs`
- `qa/visual/capture-combat-runtime.mjs`

The local visual validator mirrors the structural/semantic proof checks from `.github/workflows/ui-visual.yml`, including all four portrait Combat viewports and the one permitted retry for the known transient shake telemetry sampling case.
