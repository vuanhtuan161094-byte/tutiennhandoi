# Browser Playtester V2

This folder provides deterministic browser journeys against the **real Tu Tiên runtime**. It is a production candidate gate, not a mock and not a replacement for user visual approval.

## Automatic gate

`.github/workflows/ai-playtest.yml` runs automatically on `main` whenever important runtime/UI/asset surfaces change, including `app.js`, canonical CSS, `assets/**`, `modules/**`, `dist/**`, and `web/server.mjs`. It can also be run manually.

## Local run

Start the canonical server:

```bash
node web/server.mjs 4173 127.0.0.1
```

Then run:

```bash
node qa/playtest/validate-contracts.mjs
node qa/playtest/run-scenarios.mjs --base http://127.0.0.1:4173 --out artifacts/ai-playtest
node qa/playtest/summarize-report.mjs artifacts/ai-playtest/playtest-report.json
```

Chrome/Chromium must expose CDP. Set `CHROME_PATH` when it is not `google-chrome`.

## What it records

For each scenario:
- pass/fail and failure reason;
- current screen / shell / viewport / overflow;
- missing runtime images;
- visible interactive controls for AI inspection;
- console/runtime errors;
- failed network requests and HTTP >= 400 responses;
- before/after screenshot when an interaction exists.

Outputs:
- `playtest-report.json`: raw diagnostic report;
- `health-summary.json`: strict machine-readable gate result;
- per-scenario runtime screenshots;
- CI Step Summary table;
- exact-SHA GitHub Actions artifact.

## Current deterministic journeys

- Home navigation through a canonical side-rail route;
- Character / Equipment screen smoke;
- real Combat action/presentation smoke;
- save/reload/restore smoke.

Add scenarios as new UI slices become canonical. Prefer stable semantic selectors (`data-*`, screen roots, canonical controls) over presentation-only CSS classes.

## Strict failure policy

The gate fails when any scripted journey fails or when it detects:
- horizontal overflow;
- missing runtime images;
- browser/runtime console errors;
- non-cancelled network failures / HTTP errors.

A green playtest means deterministic runtime health is intact. It does **not** mean the visual design is approved.
