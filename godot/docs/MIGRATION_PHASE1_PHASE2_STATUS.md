# GODOT MIGRATION STATUS — PHASE 1 / PHASE 2 / HOME PRODUCTION SLICE

Date: 2026-09-19
Status: CANDIDATE — LOCAL RUNTIME PROOF REQUIRED

## Phase 1 — Canonical bridge

Godot does not own gameplay truth yet.

The local Node bridge runs the existing canonical JS runtime and exposes only the Godot migration contract.

Current bridge contract:
- version: `godot-bridge.v2`
- Home schema: `godot-home-bridge.v1`
- cultivation authority: `character-cultivation.v140`
- localhost debug port: `4192`

Phase-1 smoke:
- fresh Phàm Nhân creation;
- canonical realtime cultivation to the first gate;
- canonical Thăng Cảnh to Luyện Khí;
- canonical Bế Quan 1h;
- assert Tu Vi increases;
- assert retreat bank decreases;
- autosave;
- restart bridge;
- assert Tu Vi persists.

Run locally with:

`TEST_GODOT_PHASE1.cmd`

Phase 1 is not CLOSED until this smoke passes locally and the Godot runtime shows ONLINE without debugger errors.

## Canonical Bế Quan rule

V140 balance intentionally authors:

- Phàm Nhân: `retreat3hProgressPct = 0` -> Bế Quan locked.
- Luyện Khí and eligible later realms: positive retreat reward -> Bế Quan enabled.

Godot must not show an actionable retreat control when the canonical reward is zero.

## Phase 2 — Godot Home ViewModel boundary

Raw bridge DTO is normalized by:

`res://scripts/models/home_view_model.gd`

UI consumes:

`godot-home-view-model.v1`

Normalized groups:
- identity;
- progression;
- canonical retreat state;
- resources.

The ViewModel validates bridge schema/version/cultivation authority before UI binding.

Rule:
- backend bridge owns transport;
- ViewModel owns presentation normalization;
- Home scene owns rendering only;
- no gameplay calculation belongs in Home scene.

## Home Production Slice V1

The previous SVG bootstrap art is no longer the target Home presentation.

Godot now reuses approved production art from the already approved web visual family:

- `godot/art/approved/home_bg_ink_mountain.webp`
- `godot/art/approved/hero_idle.webp`
- `godot/art/approved/hero_portrait.webp`

Composition direction follows the approved Home visual language:
- illustrated world and hero are primary;
- identity floats directly on the scene;
- vitals are compact;
- Tu Vi is a single focused progression plate;
- one dominant progression action;
- quick actions remain secondary;
- bottom navigation stays compact;
- avoid dashboard/card-wall composition.

This slice remains CANDIDATE until actual Godot runtime screenshot review.
