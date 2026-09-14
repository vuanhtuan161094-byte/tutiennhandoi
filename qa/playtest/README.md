# Browser Playtester V1

This folder provides deterministic browser journeys against the **real Tu Tiên runtime**.

It is diagnostic automation, not a mock and not a replacement for user visual approval.

## Run locally / in CI

Start the canonical server:

```bash
node web/server.mjs 4173 127.0.0.1
```

Then run:

```bash
node qa/playtest/validate-contracts.mjs
node qa/playtest/run-scenarios.mjs --base http://127.0.0.1:4173 --out artifacts/ai-playtest
```

Chrome/Chromium must expose CDP. Set `CHROME_PATH` when it is not `google-chrome`.

## What it records

For each scenario:
- pass/fail and failure reason;
- current game screen / shell / viewport / overflow;
- missing image count;
- visible interactive controls (trimmed inventory for AI inspection);
- console/runtime errors;
- failed network requests and HTTP >= 400 responses;
- before/after screenshot when an interaction exists.

## Scenario design

`scenarios.json` owns deterministic journeys. Prefer stable semantic selectors (`data-*`, canonical screen roots) over CSS presentation details.

Do not add a scenario that mutates locked gameplay authority merely to make UI proof easier.

## Exit behavior

Any failed scenario exits non-zero after the report is written, so GitHub Actions still uploads diagnostic artifacts.
