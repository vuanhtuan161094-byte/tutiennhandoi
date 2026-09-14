# TUTIEN GAME DEVELOPER — AI WORKING SKILL V2

Status: production tooling contract. It does not reopen any gameplay authority.

## Purpose

Turn ChatGPT/Codex into a repo-aware game-development loop that can:
- respect canonical/locked systems;
- edit safely while multiple chats use `main`;
- automatically exercise important runtime/UI candidates in a real browser;
- inspect exact-SHA screenshots and diagnostics;
- manage generated visual assets through enforceable approval/integration states;
- hand back evidence-backed candidates only.

## Mandatory entry sequence

1. Read `/CURRENT_CHECKPOINT.md`.
2. Confirm current `main` HEAD.
3. Read `/AGENTS.md` and `/docs/DEVELOPMENT_PROTOCOL.md`.
4. Classify the task: gameplay/runtime, UI/UX, browser QA, or asset work.
5. Read only the active workflow/spec and narrow source regions.
6. Record locked authorities that are read-only.

## Browser Playtester V2

Local runner:

```bash
node qa/playtest/validate-contracts.mjs
node qa/playtest/run-scenarios.mjs --base http://127.0.0.1:4173 --out artifacts/ai-playtest
node qa/playtest/summarize-report.mjs artifacts/ai-playtest/playtest-report.json
```

CI authority:
`.github/workflows/ai-playtest.yml`

It now automatically runs on important production surfaces including canonical JS/CSS, `assets/**`, `modules/**`, `dist/**`, and `web/server.mjs`.

Canonical evidence:
- `playtest-report.json` — raw per-scenario diagnostics;
- `health-summary.json` — strict health result;
- per-scenario actual-runtime screenshots;
- CI Step Summary;
- exact-SHA GitHub Actions artifact.

Strict gate conditions:
- all deterministic journeys PASS;
- no horizontal overflow;
- no missing runtime images;
- no browser/runtime console errors;
- no non-cancelled network/HTTP failures.

A passing playtest proves deterministic runtime health. It does **not** mean the visual design is approved.

## Asset Pipeline V2

Control plane:
`assets/_pipeline/`

Briefs:
`assets/_pipeline/briefs/<asset-id>.json`

Lifecycle:
`draft -> candidate -> approved -> integrated -> locked`

Rules:
- create the machine-readable brief before generation;
- generate multiple materially different candidates when direction is not mechanically fixed;
- user approval is required before `approved`;
- record the selected candidate and approval note;
- integrate only the approved winner into a semantic production asset path;
- production-path changes automatically trigger Browser Playtester and relevant visual proof;
- `locked` requires exact runtime proof SHA/run metadata plus owning-slice approval/closure.

Image generation can be initiated from ChatGPT/image tooling; binary generation itself is not performed by GitHub Actions. Everything before and after that generation step is now governed and validated by the repo pipeline.

## Normal AI game-development loop

`checkpoint -> source audit -> narrow brief -> code/asset candidate -> targeted test -> Fast QA -> AI Browser Playtest -> Runtime Visual Proof if visible -> user visual approval -> [closure] -> Canonical QA -> checkpoint`

For an asset-bearing slice:

`brief -> candidate generation -> user selection -> production integration -> AI Browser Playtest -> Runtime Visual Proof -> user runtime approval -> locked metadata`

## Failure triage

When Playtester fails, classify first:
- `launcher`: server/health/bootstrap failed;
- `runtime`: JS exception or canonical screen failed to load;
- `network`: request/HTTP error;
- `interaction`: expected semantic control/action unavailable;
- `layout`: overflow or missing asset;
- `visual`: structurally valid but needs human review.

Do not patch gameplay authority to solve a presentation-only automation failure.

## Concurrent work

When another chat owns a slice:
- refresh HEAD immediately before writes;
- split file ownership when possible;
- never force-update `main`;
- do not overwrite the owning chat's work;
- Browser Playtester may inspect the other chat's exact candidate without changing it;
- closure/checkpoint remains owned by the active slice unless the user explicitly reassigns it.
