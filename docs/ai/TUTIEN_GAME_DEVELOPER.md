# TUTIEN GAME DEVELOPER — AI WORKING SKILL V1

Status: infrastructure contract. It does not reopen any gameplay authority.

## Purpose

Turn ChatGPT/Codex from a code-only editor into a repo-aware game-development agent that can:
- respect canonical/locked systems;
- run deterministic browser journeys against the real game;
- inspect runtime screenshots and diagnostics;
- manage generated visual assets through an approval lifecycle;
- hand back only evidence-backed candidates.

## Mandatory entry sequence

1. Read `/CURRENT_CHECKPOINT.md`.
2. Confirm current `main` HEAD.
3. Determine whether the task is gameplay/runtime, UI/UX, browser QA, or asset work.
4. Read only the active workflow/spec and narrow source regions for that task.
5. Record which locked authorities are read-only.

## Browser Playtester V1

Runner:
`node qa/playtest/run-scenarios.mjs --base http://127.0.0.1:4173 --out artifacts/ai-playtest`

Canonical inputs:
- `qa/playtest/scenarios.json`
- real runtime served by `web/server.mjs`
- DEV fixture API only for deterministic bootstrap

Canonical outputs:
- `artifacts/ai-playtest/playtest-report.json`
- per-scenario screenshots
- console/runtime errors
- failed network requests / HTTP >= 400 responses
- runtime metrics and visible interactive-control inventory

A passing playtest means the scripted journey and structural checks passed. It does **not** mean the visual design is approved.

## Asset Pipeline V1

Metadata root:
`assets/_pipeline/`

Lifecycle:
`draft -> candidate -> approved -> integrated -> locked`

Rules:
- generation output is never presented as already implemented;
- generate multiple candidates when art direction is not yet locked;
- user approval is required before `approved`;
- production integration happens only after approval;
- after integration, rerun real-runtime browser proof;
- `locked` means the asset is part of an approved/closed slice and must not be casually replaced.

The registry tracks metadata only. Production binaries remain in their semantic production asset folders.

## Failure triage

When playtest fails, classify first:

- `launcher`: server/health/bootstrap failed;
- `runtime`: JS exception or canonical screen failed to load;
- `network`: failed request or HTTP error;
- `interaction`: expected control/action unavailable;
- `layout`: overflow/missing image/invalid shell;
- `visual`: structurally valid but needs human visual review.

Do not patch gameplay authority to solve a presentation-only failure.

## Concurrent work

When another chat owns an active slice:
- do not edit that slice's production files;
- infrastructure may be built in isolated paths;
- refresh HEAD immediately before committing;
- do not touch `CURRENT_CHECKPOINT.md`;
- after the slice closes, run Playtester against the new exact HEAD and only then widen automation if desired.

## V1 automation policy

While Combat Readability is actively being edited by another chat, the dedicated AI Playtest workflow is intentionally limited to:
- manual dispatch; and
- changes to `qa/playtest/**`, `assets/_pipeline/**`, `AGENTS.md`, `docs/ai/**`, or the playtest workflow itself.

After the active Combat slice is locked, expand the workflow path trigger to the production runtime/UI paths so browser playtesting becomes a normal candidate gate.
