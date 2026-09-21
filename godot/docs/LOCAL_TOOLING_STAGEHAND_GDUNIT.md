# GODOT LOCAL TOOLING — STAGEHAND + GDUNIT4

Status: STATIC CANDIDATE
Engine: Godot 4.7.2 stable
Date: 2026-09-19

## Pinned tools

Stagehand:
- version: v0.4.1
- upstream commit: 82c6cb96f3cccb067081db17f4c4c8582562e98b
- addon: vendored in res://addons/stagehand
- Windows CLI binary: downloaded locally and SHA-256 verified

GdUnit4:
- version: v6.2.1
- upstream commit: 08ffc7c65b61b1b2edd545616061a99973c13ce1
- installed locally into res://addons/gdUnit4 by the pinned bootstrap

Exact lock data:
- tools/godot/TOOLING_LOCK.json

## One-time setup

Normally no manual setup is needed because KIEM_TRA_GAME.cmd bootstraps missing tools.

Optional explicit setup:

`powershell -NoProfile -ExecutionPolicy Bypass -File tools/godot/Setup-GodotTooling.ps1`

Local downloads/caches are stored under `.tools/` and are ignored by Git.

## Normal verification

Run:

`KIEM_TRA_GAME.cmd`

The gate performs, in order:

1. Godot 4.7.2 detection.
2. Full resource import.
3. Parse-check of project GDScript.
4. GdUnit4 tests.
5. Canonical bridge action/save smoke.
6. Bounded Godot runtime smoke.
7. Stagehand structural Home scenario against the real game/backend.
8. Visual gate:
   - no approved baseline -> deterministic 390x844 capture;
   - approved baseline present -> deterministic screenshot diff.

Generated evidence lives under:

`artifacts/godot-tools/`

and is intentionally ignored by Git.

## Structural vs visual proof

Structural Stagehand smoke uses the real application:
- real main scene;
- canonical bridge;
- real Home nodes;
- real progressive-disclosure click path.

Visual regression uses:
- the real production Home components;
- fixed deterministic presentation data;
- paused decorative animation;
- the same 390x844 viewport.

This split prevents realtime cultivation values or animation timing from creating false visual regressions.

## Baseline approval

A visual baseline is never created automatically.

Before baseline approval:
1. run KIEM_TRA_GAME.cmd;
2. inspect artifacts/godot-tools/stagehand-visual/screenshots/home-390x844.png;
3. obtain explicit user approval of that exact screenshot.

Only then run:

`powershell -NoProfile -ExecutionPolicy Bypass -File tools/godot/Approve-HomeBaseline.ps1 -ConfirmApproved`

The command copies the approved candidate to:

`godot/tests/visual-baselines/home-390x844.png`

Review the PNG in Git before committing it.

After that file is committed, KIEM_TRA_GAME.cmd automatically uses:
- home_visual_regression.json
- threshold 0.005
- pixel_sensitivity 0.03

Never refresh the baseline merely to make a failing diff pass.

## Key project tests

GdUnit4:
- res://tests/unit/home_view_model_test.gd

Stagehand:
- res://tests/stagehand/home_runtime_smoke.json
- res://tests/stagehand/home_visual_capture.json
- res://tests/stagehand/home_visual_regression.json

Deterministic visual harness:
- res://tests/visual/home_visual_harness.tscn

## Stagehand selectors

Production Home exposes stable automation names including:
- HomeStage
- HomeHUD
- BridgeStatus
- RealmLabel
- CultivationProgress
- CultivationText
- IdentityTap
- CultivationTap
- PrimaryCTA
- RetreatButton
- ActiveSheet

Tests should prefer these semantic selectors over pixel coordinates or rendered text.

## Failure interpretation

Import / parse failure:
- source or resource problem; fix before runtime testing.

GdUnit4 failure:
- presentation-model / unit contract regression.

Canonical bridge smoke failure:
- bridge / gameplay authority / persistence issue.

Stagehand structural failure:
- runtime scene, signal, selector, backend connectivity, or interaction regression.

Stagehand visual diff failure:
- inspect actual and diff images before changing code or baseline.

## Completion labels

Static inspection only:
- static candidate

Import + parse + unit + smoke + structural Stagehand pass:
- runtime candidate

Actual Stagehand screenshot available:
- visual candidate

Explicit user approval:
- approved
