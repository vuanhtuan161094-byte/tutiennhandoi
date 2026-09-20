# Godot Home Art Integration — 2026-09-20

Status: STATIC CANDIDATE

## Decision

The lost temporary binary atlas from the interrupted chat is retired as a dependency.

The canonical Home source-of-truth already requires reuse of approved production art for:
- background;
- centered cultivator;
- identity portrait;
- four Home action icons.

Precision UI decoration remains code-driven:
- aura;
- pedestal;
- resource chips;
- advancement CTA;
- bottom dock;
- selected state glow.

This matches `docs/ui/GODOT_HOME_VISUAL_SOURCE_OF_TRUTH_20260919.md` and avoids replacing approved assets with unrecoverable or unreviewed generated binaries.

## Runtime resolver

`godot/scripts/home/home_art_atlas.gd` reads:
`res://art/approved/home_runtime_atlas.json`.

The resolver supports both:
- direct approved resource paths;
- optional future atlas regions.

Missing optional decorative entries are non-fatal and deliberately fall back to existing code presentation.

## Scope

Presentation only.

No gameplay, save, bridge, action, route, V160–V179 authority, or HomeViewModel contract changes.

## Verification state

Static integration and selector/action audit are complete.

Per `godot/AGENTS.md`, runtime completion still requires the Godot 4.7.2 local gate:
import -> parse -> GdUnit4 -> bridge smoke -> bounded runtime smoke -> Stagehand capture.

Do not promote the Home visual baseline before explicit user review of an actual 390×844 runtime screenshot.
