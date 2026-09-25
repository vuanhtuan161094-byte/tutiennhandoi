# Runtime Browser Smoke

This folder provides deterministic browser journeys against the **real Tu Tiên web runtime**. It is a runtime-health gate, not AI/LLM evaluation, not a mock, and not a replacement for user visual approval.

Historical internal schema ids still contain `ai-playtest` for compatibility. That legacy schema name does not mean an AI model evaluates the game.

## Current gate usage

Normal development is local:

- `tools/web/TEST_GAME_LOCAL.cmd` mode **BROWSER** runs these four representative journeys;
- mode **FULL / FULL CLEAN** runs **FAST + Runtime Browser Smoke**;
- mode **VISUAL** is a separate on-demand deep UI/Combat diagnostic and is intentionally not part of normal Full Clean.

GitHub Actions is manual-only. `.github/workflows/ci.yml` runs the same representative runtime smoke for exact-SHA evidence when manually requested.

## Local run

Start the canonical server:

```bash
node web/server.mjs 4173 127.0.0.1
```

Then run:

```bash
node qa/playtest/validate-contracts.mjs
node qa/playtest/run-scenarios.mjs --base http://127.0.0.1:4173 --out artifacts/runtime-smoke
node qa/playtest/summarize-report.mjs artifacts/runtime-smoke/playtest-report.json
```

Chrome/Chromium must expose CDP. Set `CHROME_PATH` when needed.

## What it records

For each scenario:

- pass/fail and failure reason;
- current screen / shell / viewport / overflow;
- missing runtime images;
- visible interactive controls;
- console/runtime errors;
- failed network requests and HTTP >= 400 responses;
- before/after screenshot when an interaction exists.

Outputs:

- `playtest-report.json`: raw diagnostic report;
- `health-summary.json`: strict machine-readable gate result;
- per-scenario runtime screenshots.

## Current deterministic journeys

- Home navigation through a canonical side-rail route;
- Character / Equipment screen smoke;
- real Combat action/presentation smoke;
- save/reload/restore smoke.

Prefer stable semantic selectors over presentation-only CSS classes.

## Strict failure policy

The gate fails when any scripted journey fails or when it detects:

- horizontal overflow;
- missing runtime images;
- browser/runtime console errors;
- non-cancelled network failures / HTTP errors.

A green browser smoke means deterministic web runtime health is intact. It does **not** mean visual design is approved.
